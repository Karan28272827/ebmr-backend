import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const ROLE_LEVEL: Record<string, number> = { BATCH_OPERATOR: 1, SUPERVISOR: 2, LAB_ANALYST: 3, QA_REVIEWER: 4, QA_MANAGER: 5, QUALIFIED_PERSON: 6, SYSTEM_ADMIN: 7 };
function hasMinRole(userRole: string, minRole: string): boolean { return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minRole] || 0); }

@Injectable()
export class QcSpecService {
  constructor(private prisma: PrismaService, private auditService: AuditService) {}

  async findAll(productCode?: string, status?: string) {
    return this.prisma.qCSpecification.findMany({
      where: {
        ...(productCode ? { product_code: productCode } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: { _count: { select: { parameters: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const spec = await this.prisma.qCSpecification.findUnique({ where: { id }, include: { parameters: { orderBy: { display_order: 'asc' } } } });
    if (!spec) throw new NotFoundException('QC Specification not found');
    return spec;
  }

  async findByProduct(productCode: string) {
    return this.prisma.qCSpecification.findMany({ where: { product_code: productCode }, include: { parameters: { orderBy: { display_order: 'asc' } } } });
  }

  async create(user: any, data: any) {
    const { parameters, ...specData } = data;
    const spec_code = specData.spec_code || `QCS-${specData.product_code}-${specData.version}`;
    const spec = await this.prisma.qCSpecification.create({ data: { ...specData, spec_code, created_by: user.id } });
    if (parameters && parameters.length > 0) {
      for (const p of parameters) {
        await this.prisma.qCSpecParameter.create({ data: { spec_id: spec.id, ...p } });
      }
    }
    await this.auditService.log({ eventType: 'QC_SPEC_CREATED', entityType: 'QCSpecification', entityId: spec.id, actorId: user.id, actorRole: user.role, afterState: { spec_code } });
    return this.findOne(spec.id);
  }

  async approve(id: string, user: any) {
    if (!hasMinRole(user.role, 'QA_MANAGER')) throw new ForbiddenException('Only QA_MANAGER+ can approve QC specifications');
    const spec = await this.prisma.qCSpecification.update({ where: { id }, data: { status: 'APPROVED', approved_by: user.id, approved_at: new Date() } });
    await this.auditService.log({ eventType: 'QC_SPEC_APPROVED', entityType: 'QCSpecification', entityId: id, actorId: user.id, actorRole: user.role });
    return spec;
  }

  async addParameter(specId: string, user: any, data: any) {
    const param = await this.prisma.qCSpecParameter.create({ data: { spec_id: specId, ...data } });
    await this.auditService.log({ eventType: 'QC_SPEC_PARAMETER_ADDED', entityType: 'QCSpecification', entityId: specId, actorId: user.id, actorRole: user.role, afterState: { param_code: data.param_code } });
    return param;
  }

  async updateParameter(paramId: string, user: any, data: any) {
    const param = await this.prisma.qCSpecParameter.update({ where: { id: paramId }, data });
    await this.auditService.log({ eventType: 'QC_SPEC_PARAMETER_UPDATED', entityType: 'QCSpecParameter', entityId: paramId, actorId: user.id, actorRole: user.role, afterState: data });
    return param;
  }
}
