import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const ROLE_LEVEL: Record<string, number> = { BATCH_OPERATOR: 1, SUPERVISOR: 2, LAB_ANALYST: 3, QA_REVIEWER: 4, QA_MANAGER: 5, QUALIFIED_PERSON: 6, SYSTEM_ADMIN: 7 };
function hasMinRole(r: string, min: string) { return (ROLE_LEVEL[r] || 0) >= (ROLE_LEVEL[min] || 0); }

@Injectable()
export class RetentionService {
  constructor(private prisma: PrismaService, private auditService: AuditService) {}

  async findAll(batchId?: string, status?: string) {
    return this.prisma.retentionSample.findMany({
      where: {
        ...(batchId ? { batch_id: batchId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: { batch: { select: { batchNumber: true, productName: true, state: true } } },
      orderBy: { recorded_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const sample = await this.prisma.retentionSample.findUnique({
      where: { id },
      include: { batch: { select: { batchNumber: true, productName: true, productCode: true, state: true } } },
    });
    if (!sample) throw new NotFoundException('Retention sample not found');
    return sample;
  }

  async create(user: any, data: { batch_id: string; quantity: number; unit: string; storage_location: string; storage_condition: string; retain_until: string; notes?: string }) {
    const batch = await this.prisma.batch.findUnique({ where: { id: data.batch_id } });
    if (!batch) throw new NotFoundException('Batch not found');
    const sample_code = `RS-${batch.batchNumber}-${Date.now().toString().slice(-4)}`;
    const sample = await this.prisma.retentionSample.create({
      data: {
        sample_code,
        batch_id: data.batch_id,
        product_code: batch.productCode,
        product_name: batch.productName,
        quantity: data.quantity,
        unit: data.unit,
        storage_location: data.storage_location,
        storage_condition: data.storage_condition,
        retain_until: new Date(data.retain_until),
        recorded_by: user.id,
      },
    });
    await this.auditService.log({ eventType: 'RETENTION_SAMPLE_RECORDED', entityType: 'RetentionSample', entityId: sample.id, actorId: user.id, actorRole: user.role, afterState: { sample_code, batch_id: data.batch_id } });
    return sample;
  }

  async withdraw(id: string, user: any, data: { reason: string }) {
    if (!hasMinRole(user.role, 'QA_MANAGER')) throw new ForbiddenException('Only QA_MANAGER+ can withdraw retention samples');
    const sample = await this.prisma.retentionSample.update({
      where: { id },
      data: { status: 'WITHDRAWN', withdrawn_by: user.id, withdrawn_at: new Date(), withdrawn_reason: data.reason },
    });
    await this.auditService.log({ eventType: 'RETENTION_SAMPLE_WITHDRAWN', entityType: 'RetentionSample', entityId: id, actorId: user.id, actorRole: user.role, afterState: { reason: data.reason } });
    return sample;
  }

  async getExpiring(days = 30) {
    const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const samples = await this.prisma.retentionSample.findMany({
      where: { status: 'IN_STORAGE', retain_until: { lte: cutoff } },
      include: { batch: { select: { batchNumber: true, productName: true } } },
      orderBy: { retain_until: 'asc' },
    });
    return samples.map(s => ({
      ...s,
      days_remaining: Math.ceil((s.retain_until.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    }));
  }
}
