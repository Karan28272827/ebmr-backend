import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
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
export class ProcessFlowService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(productCode?: string) {
    return this.prisma.processFlow.findMany({
      where: productCode ? { product_code: productCode } : {},
      include: { _count: { select: { stages: true, documents: true } } },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const pf = await this.prisma.processFlow.findUnique({
      where: { id },
      include: {
        stages: { orderBy: { stage_number: 'asc' } },
        documents: { orderBy: { uploaded_at: 'desc' } },
      },
    });
    if (!pf) throw new NotFoundException('Process flow not found');
    return pf;
  }

  async findByProduct(productCode: string) {
    return this.prisma.processFlow.findFirst({
      where: { product_code: productCode, status: 'APPROVED' },
      include: {
        stages: { orderBy: { stage_number: 'asc' } },
        documents: true,
      },
    });
  }

  async create(user: any, data: any) {
    if (!hasMinRole(user.role, 'QA_MANAGER'))
      throw new ForbiddenException('Only QA_MANAGER+ can create process flows');
    const count = await this.prisma.processFlow.count();
    const flow_code = data.flow_code || `PF-${String(count + 1).padStart(4, '0')}`;
    const pf = await this.prisma.processFlow.create({
      data: { ...data, flow_code, created_by: user.id, status: 'DRAFT' },
    });
    await this.auditService.log({
      eventType: 'PROCESS_FLOW_CREATED',
      entityType: 'ProcessFlow',
      entityId: pf.id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { flow_code },
    });
    return pf;
  }

  async update(id: string, user: any, data: any) {
    const pf = await this.findOne(id);
    if (pf.status !== 'DRAFT')
      throw new BadRequestException('Only DRAFT process flows can be edited');
    if (!hasMinRole(user.role, 'QA_MANAGER'))
      throw new ForbiddenException('Only QA_MANAGER+ can edit process flows');
    return this.prisma.processFlow.update({ where: { id }, data });
  }

  async updateStatus(id: string, user: any, status: string) {
    if (status === 'APPROVED' && !hasMinRole(user.role, 'QA_MANAGER'))
      throw new ForbiddenException('Only QA_MANAGER+ can approve');
    const updated = await this.prisma.processFlow.update({
      where: { id },
      data: {
        status: status as any,
        ...(status === 'APPROVED'
          ? { approved_by: user.id, approved_at: new Date() }
          : {}),
      },
    });
    await this.auditService.log({
      eventType: 'PROCESS_FLOW_STATUS_CHANGED',
      entityType: 'ProcessFlow',
      entityId: id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { status },
    });
    return updated;
  }

  async addDocument(flowId: string, user: any, data: any) {
    return this.prisma.baselineDocument.create({
      data: { ...data, flow_id: flowId, uploaded_by: user.id },
    });
  }
}
