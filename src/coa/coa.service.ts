import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const ROLE_LEVEL: Record<string, number> = { BATCH_OPERATOR: 1, SUPERVISOR: 2, LAB_ANALYST: 3, QA_REVIEWER: 4, QA_MANAGER: 5, QUALIFIED_PERSON: 6, SYSTEM_ADMIN: 7 };
function hasMinRole(r: string, min: string) { return (ROLE_LEVEL[r] || 0) >= (ROLE_LEVEL[min] || 0); }

@Injectable()
export class CoaService {
  constructor(private prisma: PrismaService, private auditService: AuditService) {}

  async findAll(productCode?: string) {
    return this.prisma.certificateOfAnalysis.findMany({
      where: productCode ? { batch: { productCode } } : undefined,
      include: { batch: { select: { batchNumber: true, productCode: true, productName: true, state: true } } },
      orderBy: { generated_at: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.certificateOfAnalysis.findUnique({
      where: { id },
      include: { batch: { select: { batchNumber: true, productCode: true, productName: true, batchSize: true, state: true } } },
    });
  }

  async findByBatch(batchId: string) {
    const coa = await this.prisma.certificateOfAnalysis.findUnique({
      where: { batch_id: batchId },
      include: { batch: { select: { batchNumber: true, productCode: true, productName: true, batchSize: true, state: true } } },
    });
    if (!coa) throw new NotFoundException('CoA not found for this batch');
    return coa;
  }

  async generate(user: any, data: { batch_id: string; spec_id?: string; test_results: any[]; notes?: string }) {
    if (!hasMinRole(user.role, 'QA_MANAGER')) throw new ForbiddenException('Only QA_MANAGER+ can generate CoA');
    const batch = await this.prisma.batch.findUnique({ where: { id: data.batch_id } });
    if (!batch) throw new NotFoundException('Batch not found');
    const existing = await this.prisma.certificateOfAnalysis.findUnique({ where: { batch_id: data.batch_id } });
    if (existing) throw new BadRequestException('CoA already exists for this batch');

    const overall_verdict = data.test_results.every((r: any) => r.is_within_spec) ? 'PASS' : 'FAIL';
    const coa_number = `COA-${batch.batchNumber}-${new Date().getFullYear()}`;

    const coa = await this.prisma.certificateOfAnalysis.create({
      data: {
        coa_number,
        batch_id: data.batch_id,
        spec_id: data.spec_id || null,
        generated_by: user.id,
        test_results: data.test_results,
        overall_verdict: overall_verdict as any,
        notes: data.notes || null,
      },
    });
    await this.auditService.log({ eventType: 'COA_GENERATED', entityType: 'CertificateOfAnalysis', entityId: coa.id, actorId: user.id, actorRole: user.role, afterState: { coa_number, overall_verdict }, batchId: data.batch_id });
    return coa;
  }

  async release(id: string, user: any) {
    if (!hasMinRole(user.role, 'QUALIFIED_PERSON')) throw new ForbiddenException('Only QUALIFIED_PERSON+ can release CoA');
    const coa = await this.prisma.certificateOfAnalysis.update({
      where: { id },
      data: { release_date: new Date(), released_by: user.id },
    });
    await this.prisma.batch.update({ where: { id: coa.batch_id }, data: { state: 'RELEASED' } });
    await this.auditService.log({ eventType: 'COA_RELEASED', entityType: 'CertificateOfAnalysis', entityId: id, actorId: user.id, actorRole: user.role, afterState: { released_by: user.id } });
    return coa;
  }
}
