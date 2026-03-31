import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { createHash } from 'crypto';
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
  reason?: string;
  ip_address?: string;
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

    // SHA-256 hash chain — fetch the last audit log's row_hash
    const lastLog = await this.prisma.auditLog.findFirst({
      orderBy: { timestamp: 'desc' },
      select: { row_hash: true, id: true },
    });
    const prev_hash = lastLog?.row_hash ?? '0'.repeat(64);

    // Compute row_hash over the content of this entry (deterministic)
    const content = JSON.stringify({
      eventType: input.eventType,
      entityType: input.entityType,
      entityId: input.entityId,
      batchId,
      actorId: input.actorId,
      actorRole: input.actorRole,
      timestamp: new Date().toISOString(),
      beforeState: input.beforeState ?? null,
      afterState: input.afterState ?? null,
      prev_hash,
    });
    const row_hash = createHash('sha256').update(content).digest('hex');

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
        reason: input.reason ?? null,
        ip_address: input.ip_address ?? null,
        row_hash,
        prev_hash,
      },
    });
  }

  async verifyIntegrity(limit = 1000): Promise<{ valid: boolean; broken_at?: string; checked: number }> {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'asc' },
      take: limit,
      select: { id: true, row_hash: true, prev_hash: true, eventType: true, entityType: true, entityId: true, batchId: true, actorId: true, actorRole: true, timestamp: true, beforeState: true, afterState: true },
    });

    for (let i = 1; i < logs.length; i++) {
      const prev = logs[i - 1];
      const curr = logs[i];
      if (curr.prev_hash !== prev.row_hash) {
        return { valid: false, broken_at: curr.id, checked: i + 1 };
      }
    }

    return { valid: true, checked: logs.length };
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
