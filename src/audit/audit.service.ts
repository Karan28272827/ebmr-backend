import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogInput {
  eventType: string;
  entityType: string;
  entityId: string;
  batchId?: string;
  actorId: string;
  actorRole: string;
  beforeState?: any;
  afterState?: any;
  metadata?: any;
}

@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('audit') private auditQueue: Queue,
  ) {}

  async log(input: AuditLogInput) {
    // Write synchronously — audit must never be lost
    await this.writeDirect(input);
    // Also enqueue for future async processing (aggregation, alerting)
    this.auditQueue.add('log', input, { removeOnComplete: true }).catch(() => {});
  }

  private async writeDirect(input: AuditLogInput) {
    const batchId = input.entityType === 'Batch' ? input.entityId : (input.batchId ?? null);
    return this.prisma.auditLog.create({
      data: {
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId,
        batchId,
        actorId: input.actorId,
        actorRole: input.actorRole,
        beforeState: input.beforeState ?? null,
        afterState: input.afterState ?? null,
        metadata: input.metadata ?? null,
      },
    });
  }

  async getForBatch(batchId: string) {
    return this.prisma.auditLog.findMany({
      where: { batchId },
      orderBy: { timestamp: 'asc' },
      include: { actor: { select: { name: true, email: true, role: true } } },
    });
  }

  async getAll(filters?: { eventType?: string; actorId?: string }) {
    return this.prisma.auditLog.findMany({
      where: filters,
      orderBy: { timestamp: 'desc' },
      take: 500,
      include: { actor: { select: { name: true, email: true, role: true } } },
    });
  }
}
