import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const ROLE_LEVEL: Record<string, number> = {
  BATCH_OPERATOR: 1,
  SUPERVISOR: 2,
  LAB_ANALYST: 3,
  QA_REVIEWER: 4,
  QA_MANAGER: 5,
  QUALIFIED_PERSON: 6,
  SYSTEM_ADMIN: 7,
};

function hasMinRole(userRole: string, minRole: string): boolean {
  return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minRole] || 0);
}

@Injectable()
export class CapaService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(status?: string, source?: string) {
    return this.prisma.cAPA.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(source ? { source: source as any } : {}),
      },
      include: {
        batch: { select: { batchNumber: true } },
        deviation: { select: { id: true, fieldName: true } },
      },
      orderBy: { raised_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const capa = await this.prisma.cAPA.findUnique({
      where: { id },
      include: {
        batch: { select: { batchNumber: true } },
        deviation: { select: { id: true, fieldName: true } },
      },
    });
    if (!capa) throw new NotFoundException('CAPA not found');
    return capa;
  }

  async create(user: any, data: {
    source: string;
    source_ref: string;
    deviation_id?: string;
    batch_id?: string;
    title: string;
    description: string;
    priority?: string;
    assigned_to?: string;
    due_date?: string;
  }) {
    const count = await this.prisma.cAPA.count();
    const year = new Date().getFullYear();
    const capa_code = `CAPA-${year}-${String(count + 1).padStart(4, '0')}`;

    const capa = await this.prisma.cAPA.create({
      data: {
        capa_code,
        source: data.source as any,
        source_ref: data.source_ref,
        ...(data.deviation_id ? { deviation_id: data.deviation_id } : {}),
        ...(data.batch_id ? { batch_id: data.batch_id } : {}),
        title: data.title,
        description: data.description,
        ...(data.priority ? { priority: data.priority as any } : {}),
        ...(data.assigned_to ? { assigned_to: data.assigned_to } : {}),
        ...(data.due_date ? { due_date: new Date(data.due_date) } : {}),
        raised_by: user.id,
      },
    });

    await this.auditService.log({
      eventType: 'CAPA_CREATED',
      entityType: 'CAPA',
      entityId: capa.id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { capa_code, source: data.source, title: data.title },
    });

    return capa;
  }

  async update(id: string, user: any, data: {
    root_cause?: string;
    corrective_action?: string;
    preventive_action?: string;
    immediate_action?: string;
    status?: string;
    assigned_to?: string;
    due_date?: string;
    effectiveness_check?: string;
    effectiveness_date?: string;
  }) {
    const existing = await this.findOne(id);

    const updateData: any = {
      ...(data.root_cause !== undefined ? { root_cause: data.root_cause } : {}),
      ...(data.corrective_action !== undefined ? { corrective_action: data.corrective_action } : {}),
      ...(data.preventive_action !== undefined ? { preventive_action: data.preventive_action } : {}),
      ...(data.immediate_action !== undefined ? { immediate_action: data.immediate_action } : {}),
      ...(data.status ? { status: data.status as any } : {}),
      ...(data.assigned_to !== undefined ? { assigned_to: data.assigned_to } : {}),
      ...(data.due_date ? { due_date: new Date(data.due_date) } : {}),
      ...(data.effectiveness_check !== undefined ? { effectiveness_check: data.effectiveness_check } : {}),
      ...(data.effectiveness_date ? { effectiveness_date: new Date(data.effectiveness_date) } : {}),
    };

    if (data.status === 'EFFECTIVENESS_CHECK' && existing.status !== 'EFFECTIVENESS_CHECK') {
      updateData.completed_at = new Date();
    }

    const updated = await this.prisma.cAPA.update({
      where: { id },
      data: updateData,
    });

    await this.auditService.log({
      eventType: 'CAPA_UPDATED',
      entityType: 'CAPA',
      entityId: id,
      actorId: user.id,
      actorRole: user.role,
      beforeState: { status: existing.status },
      afterState: { ...updateData },
    });

    return updated;
  }

  async close(id: string, user: any, data: { verified_by?: string; effectiveness_check: string }) {
    if (!hasMinRole(user.role, 'QA_MANAGER'))
      throw new ForbiddenException('Only QA_MANAGER+ can close CAPAs');

    const existing = await this.findOne(id);

    const updated = await this.prisma.cAPA.update({
      where: { id },
      data: {
        status: 'CLOSED' as any,
        closed_by: user.id,
        closed_at: new Date(),
        verified_by: data.verified_by ?? user.id,
        verified_at: new Date(),
        effectiveness_check: data.effectiveness_check,
      },
    });

    await this.auditService.log({
      eventType: 'CAPA_CLOSED',
      entityType: 'CAPA',
      entityId: id,
      actorId: user.id,
      actorRole: user.role,
      beforeState: { status: existing.status },
      afterState: { status: 'CLOSED', closed_by: user.id },
    });

    return updated;
  }

  async findByBatch(batchId: string) {
    return this.prisma.cAPA.findMany({
      where: { batch_id: batchId },
      orderBy: { raised_at: 'desc' },
    });
  }

  async findByDeviation(deviationId: string) {
    return this.prisma.cAPA.findMany({
      where: { deviation_id: deviationId },
      orderBy: { raised_at: 'desc' },
    });
  }

  async getDashboard() {
    const [total, open, in_progress, effectiveness_check, closed, overdue] = await Promise.all([
      this.prisma.cAPA.count(),
      this.prisma.cAPA.count({ where: { status: 'OPEN' } }),
      this.prisma.cAPA.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.cAPA.count({ where: { status: 'EFFECTIVENESS_CHECK' } }),
      this.prisma.cAPA.count({ where: { status: 'CLOSED' } }),
      this.prisma.cAPA.count({
        where: {
          due_date: { lt: new Date() },
          status: { not: 'CLOSED' as any },
        },
      }),
    ]);

    return {
      total,
      by_status: {
        OPEN: open,
        IN_PROGRESS: in_progress,
        EFFECTIVENESS_CHECK: effectiveness_check,
        CLOSED: closed,
      },
      overdue,
    };
  }
}
