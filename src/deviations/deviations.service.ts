import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const ROLE_LEVEL = {
  BATCH_OPERATOR: 1, SUPERVISOR: 2, QA_REVIEWER: 3, QA_MANAGER: 4, QUALIFIED_PERSON: 5,
};

@Injectable()
export class DeviationsService {
  constructor(private prisma: PrismaService, private auditService: AuditService) {}

  async create(data: {
    batchId: string;
    stepNumber: number;
    fieldName: string;
    expectedRange: string;
    actualValue: number;
    raisedBy: string;
    raisedByUser?: any;
  }) {
    const deviation = await this.prisma.deviation.create({
      data: {
        batchId: data.batchId,
        stepNumber: data.stepNumber,
        fieldName: data.fieldName,
        expectedRange: data.expectedRange,
        actualValue: data.actualValue,
        raisedBy: data.raisedBy,
        status: 'OPEN',
      },
    });

    if (data.raisedByUser) {
      await this.auditService.log({
        eventType: 'DEVIATION_RAISED',
        entityType: 'Batch',
        entityId: data.batchId,
        actorId: data.raisedBy,
        actorRole: data.raisedByUser.role,
        afterState: { deviationId: deviation.id, fieldName: data.fieldName, actualValue: data.actualValue, expectedRange: data.expectedRange },
      });
    }

    return deviation;
  }

  async manualCreate(user: any, body: { batchId: string; stepNumber: number; fieldName: string; expectedRange: string; actualValue: number }) {
    if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.QA_REVIEWER)
      throw new ForbiddenException('Only QA_REVIEWER+ can manually raise deviations');

    return this.create({ ...body, raisedBy: user.id, raisedByUser: user });
  }

  async findAll(filters?: { batchId?: string; status?: string }) {
    return this.prisma.deviation.findMany({
      where: filters as any,
      orderBy: { raisedAt: 'desc' },
      include: { raiser: { select: { name: true, email: true, role: true } }, batch: { select: { batchNumber: true, productName: true } } },
    });
  }

  async findOne(id: string) {
    const dev = await this.prisma.deviation.findUnique({
      where: { id },
      include: { raiser: { select: { name: true, email: true, role: true } }, batch: { select: { batchNumber: true, productName: true, state: true } } },
    });
    if (!dev) throw new NotFoundException('Deviation not found');
    return dev;
  }

  async close(id: string, user: any, resolutionNotes: string) {
    if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.QA_REVIEWER)
      throw new ForbiddenException('Only QA_REVIEWER+ can close deviations');
    if (!resolutionNotes?.trim()) throw new BadRequestException('Resolution notes are required');

    const dev = await this.findOne(id);
    if (dev.status === 'CLOSED') throw new BadRequestException('Deviation already closed');

    const updated = await this.prisma.deviation.update({
      where: { id },
      data: { status: 'CLOSED', resolutionNotes, closedBy: user.id, closedAt: new Date() },
    });

    await this.auditService.log({
      eventType: 'DEVIATION_CLOSED',
      entityType: 'Batch',
      entityId: dev.batchId,
      actorId: user.id,
      actorRole: user.role,
      beforeState: { status: 'OPEN' },
      afterState: { status: 'CLOSED', resolutionNotes },
    });

    return updated;
  }

  async updateStatus(id: string, user: any, status: string) {
    if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.QA_REVIEWER)
      throw new ForbiddenException('Only QA_REVIEWER+ can update deviation status');

    const dev = await this.findOne(id);
    const updated = await this.prisma.deviation.update({ where: { id }, data: { status: status as any } });

    await this.auditService.log({
      eventType: 'DEVIATION_STATUS_CHANGED',
      entityType: 'Batch',
      entityId: dev.batchId,
      actorId: user.id,
      actorRole: user.role,
      beforeState: { status: dev.status },
      afterState: { status },
    });

    return updated;
  }
}
