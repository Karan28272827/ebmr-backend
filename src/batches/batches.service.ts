import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { DeviationsService } from '../deviations/deviations.service';
import { AuthService } from '../auth/auth.service';

const ROLE_LEVEL = {
  BATCH_OPERATOR: 1,
  SUPERVISOR: 2,
  QA_REVIEWER: 3,
  QA_MANAGER: 4,
  QUALIFIED_PERSON: 5,
};

function hasMinRole(userRole: string, minRole: string) {
  return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minRole] || 0);
}

const STATE_TRANSITIONS: Record<string, { to: string; minRole: string; critical: boolean }[]> = {
  DRAFT: [{ to: 'INITIATED', minRole: 'BATCH_OPERATOR', critical: false }],
  INITIATED: [{ to: 'LINE_CLEARANCE', minRole: 'SUPERVISOR', critical: true }],
  LINE_CLEARANCE: [{ to: 'IN_PROGRESS', minRole: 'SUPERVISOR', critical: true }],
  IN_PROGRESS: [
    { to: 'PENDING_QA', minRole: 'SUPERVISOR', critical: true },
    { to: 'DEVIATION', minRole: 'QA_REVIEWER', critical: false },
    { to: 'HOLD', minRole: 'QA_REVIEWER', critical: false },
  ],
  DEVIATION: [
    { to: 'IN_PROGRESS', minRole: 'QA_REVIEWER', critical: false },
    { to: 'HOLD', minRole: 'QA_REVIEWER', critical: false },
  ],
  HOLD: [
    { to: 'IN_PROGRESS', minRole: 'QA_REVIEWER', critical: false },
    { to: 'DEVIATION', minRole: 'QA_REVIEWER', critical: false },
  ],
  PENDING_QA: [
    { to: 'PENDING_QP', minRole: 'QA_MANAGER', critical: true },
    { to: 'DEVIATION', minRole: 'QA_REVIEWER', critical: false },
    { to: 'HOLD', minRole: 'QA_REVIEWER', critical: false },
  ],
  PENDING_QP: [
    { to: 'RELEASED', minRole: 'QUALIFIED_PERSON', critical: true },
    { to: 'REJECTED', minRole: 'QUALIFIED_PERSON', critical: true },
  ],
};

@Injectable()
export class BatchesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private deviationsService: DeviationsService,
    private authService: AuthService,
  ) {}

  async findAll() {
    return this.prisma.batch.findMany({
      include: {
        deviations: { select: { id: true, status: true } },
        initiator: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        deviations: true,
        initiator: { select: { name: true, email: true, role: true } },
      },
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async create(user: any, templateId: string, batchSize: number, batchNumber: string) {
    const template = await this.prisma.batchTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new NotFoundException('Template not found');

    const steps = (template.steps as any[]).map((s, i) => ({
      ...s,
      step_number: i + 1,
      status: 'PENDING',
      actual_values: {},
      completed_by: null,
      completed_at: null,
    }));

    const batch = await this.prisma.batch.create({
      data: {
        batchNumber,
        productCode: template.productCode,
        productName: template.productName,
        batchSize,
        state: 'DRAFT',
        initiatedBy: user.id,
        templateId: template.id,
        steps,
        signatures: [],
      },
    });

    await this.auditService.log({
      eventType: 'BATCH_CREATED',
      entityType: 'Batch',
      entityId: batch.id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { state: 'DRAFT', batchNumber, productCode: template.productCode },
    });

    return batch;
  }

  async transition(batchId: string, user: any, toState: string, signature?: any) {
    const batch = await this.findOne(batchId);
    const allowed = STATE_TRANSITIONS[batch.state]?.find((t) => t.to === toState);

    if (!allowed) throw new BadRequestException(`Cannot transition from ${batch.state} to ${toState}`);
    if (!hasMinRole(user.role, allowed.minRole))
      throw new ForbiddenException(`Role ${user.role} cannot perform this transition`);

    if (allowed.critical && !signature)
      throw new BadRequestException('E-signature required for this transition');

    // Verify password for critical e-signature transitions
    if (allowed.critical && signature?.password) {
      const valid = await this.authService.verifyPassword(user.id, signature.password);
      if (!valid) throw new ForbiddenException('Invalid password — e-signature rejected');
    }

    const newSig = signature
      ? {
          user_id: user.id,
          user_name: user.name,
          role: user.role,
          meaning: signature.meaning,
          timestamp: new Date().toISOString(),
          step_or_transition: `TRANSITION:${batch.state}->${toState}`,
        }
      : null;

    const signatures = [...(batch.signatures as any[]), ...(newSig ? [newSig] : [])];

    const updated = await this.prisma.batch.update({
      where: { id: batchId },
      data: {
        state: toState as any,
        signatures,
        initiatedAt: toState === 'INITIATED' ? new Date() : undefined,
        completedAt: ['RELEASED', 'REJECTED'].includes(toState) ? new Date() : undefined,
      },
    });

    await this.auditService.log({
      eventType: 'BATCH_STATE_CHANGED',
      entityType: 'Batch',
      entityId: batchId,
      actorId: user.id,
      actorRole: user.role,
      beforeState: { state: batch.state },
      afterState: { state: toState },
      metadata: newSig ? { signature: newSig } : undefined,
    });

    return updated;
  }

  async completeStep(batchId: string, user: any, stepNumber: number, actualValues: any, signature?: any) {
    const batch = await this.findOne(batchId);
    if (!['IN_PROGRESS', 'LINE_CLEARANCE'].includes(batch.state))
      throw new BadRequestException('Batch is not in a state where steps can be completed');

    const steps = batch.steps as any[];
    const stepIdx = steps.findIndex((s) => s.step_number === stepNumber);
    if (stepIdx === -1) throw new NotFoundException('Step not found');

    const step = steps[stepIdx];
    if (step.status === 'COMPLETED') throw new BadRequestException('Step already completed');

    // Validate required fields and check ranges
    const deviationFields: any[] = [];
    const requiredFields: any[] = step.required_fields || [];

    for (const field of requiredFields) {
      const val = actualValues[field.name];
      if (val === undefined || val === null) throw new BadRequestException(`Missing required field: ${field.name}`);

      if (field.type === 'number') {
        const numVal = parseFloat(val);
        if (field.max !== undefined && numVal > field.max) {
          deviationFields.push({ field, val: numVal, reason: 'above max' });
        }
        if (field.min !== undefined && numVal < field.min) {
          deviationFields.push({ field, val: numVal, reason: 'below min' });
        }
        if (field.exact_max !== undefined && numVal > field.exact_max) {
          deviationFields.push({ field, val: numVal, reason: 'above exact_max' });
        }
      }
    }

    // Update step
    steps[stepIdx] = {
      ...step,
      actual_values: actualValues,
      status: 'COMPLETED',
      completed_by: user.id,
      completed_by_name: user.name,
      completed_at: new Date().toISOString(),
    };

    const newSig = signature
      ? {
          user_id: user.id,
          user_name: user.name,
          role: user.role,
          meaning: signature.meaning,
          timestamp: new Date().toISOString(),
          step_or_transition: `STEP:${stepNumber}`,
        }
      : null;

    const signatures = [...(batch.signatures as any[]), ...(newSig ? [newSig] : [])];

    const updated = await this.prisma.batch.update({
      where: { id: batchId },
      data: { steps, signatures },
    });

    await this.auditService.log({
      eventType: 'STEP_COMPLETED',
      entityType: 'Batch',
      entityId: batchId,
      actorId: user.id,
      actorRole: user.role,
      afterState: { stepNumber, actualValues, status: 'COMPLETED' },
    });

    // Auto-raise deviations for out-of-range values
    for (const dev of deviationFields) {
      const rangeStr = this.buildRangeStr(dev.field);
      await this.deviationsService.create({
        batchId,
        stepNumber,
        fieldName: dev.field.name,
        expectedRange: rangeStr,
        actualValue: dev.val,
        raisedBy: user.id,
        raisedByUser: user,
      });
    }

    return { batch: updated, deviationsRaised: deviationFields.length };
  }

  async skipStep(batchId: string, user: any, stepNumber: number) {
    if (!hasMinRole(user.role, 'SUPERVISOR')) throw new ForbiddenException('Only SUPERVISOR+ can skip steps');

    const batch = await this.findOne(batchId);
    const steps = batch.steps as any[];
    const stepIdx = steps.findIndex((s) => s.step_number === stepNumber);
    if (stepIdx === -1) throw new NotFoundException('Step not found');

    steps[stepIdx] = { ...steps[stepIdx], status: 'SKIPPED', skipped_by: user.id, skipped_at: new Date().toISOString() };

    const updated = await this.prisma.batch.update({ where: { id: batchId }, data: { steps } });

    await this.auditService.log({
      eventType: 'STEP_SKIPPED',
      entityType: 'Batch',
      entityId: batchId,
      actorId: user.id,
      actorRole: user.role,
      afterState: { stepNumber, status: 'SKIPPED' },
    });

    return updated;
  }

  async addSignature(batchId: string, user: any, meaning: string, stepOrTransition: string, password: string) {
    const valid = await this.authService.verifyPassword(user.id, password);
    if (!valid) throw new ForbiddenException('Invalid password for e-signature');

    const batch = await this.findOne(batchId);
    const sig = {
      user_id: user.id,
      user_name: user.name,
      role: user.role,
      meaning,
      timestamp: new Date().toISOString(),
      step_or_transition: stepOrTransition,
    };

    const signatures = [...(batch.signatures as any[]), sig];
    await this.prisma.batch.update({ where: { id: batchId }, data: { signatures } });

    await this.auditService.log({
      eventType: 'SIGNATURE_ADDED',
      entityType: 'Batch',
      entityId: batchId,
      actorId: user.id,
      actorRole: user.role,
      afterState: sig,
    });

    return sig;
  }

  async getTemplates() {
    return this.prisma.batchTemplate.findMany();
  }

  private buildRangeStr(field: any): string {
    if (field.exact_max !== undefined) return `max: ${field.exact_max}`;
    if (field.min !== undefined && field.max !== undefined) return `${field.min}–${field.max}`;
    if (field.min !== undefined) return `min: ${field.min}`;
    if (field.max !== undefined) return `max: ${field.max}`;
    return 'N/A';
  }
}
