import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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
export class SopService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(status?: string, productCategory?: string) {
    return this.prisma.sOP.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(productCategory ? { product_category: productCategory } : {}),
      },
      include: {
        _count: { select: { sections: true, qc_parameter_sets: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const sop = await this.prisma.sOP.findUnique({
      where: { id },
      include: {
        sections: { orderBy: { section_no: 'asc' } },
        qc_parameter_sets: {
          include: {
            parameters: { orderBy: { display_order: 'asc' } },
          },
        },
      },
    });
    if (!sop) throw new NotFoundException('SOP not found');
    return sop;
  }

  async create(user: any, data: any) {
    if (!hasMinRole(user.role, 'QA_MANAGER')) {
      throw new ForbiddenException('Only QA_MANAGER+ can create SOPs');
    }

    const sopCount = await this.prisma.sOP.count();
    const sop_code = data.sop_code || `SOP-${String(sopCount + 1).padStart(4, '0')}`;

    const sop = await this.prisma.sOP.create({
      data: { ...data, sop_code, created_by: user.id, status: 'DRAFT' },
    });

    await this.auditService.log({
      eventType: 'SOP_CREATED',
      entityType: 'SOP',
      entityId: sop.id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { sop_code, title: sop.title },
    });

    return sop;
  }

  async updateStatus(id: string, user: any, status: string, signature?: any) {
    const sop = await this.findOne(id);

    if (['APPROVED'].includes(status) && !hasMinRole(user.role, 'QA_MANAGER')) {
      throw new ForbiddenException('Only QA_MANAGER+ can approve SOPs');
    }

    if (sop.status === 'APPROVED' && status !== 'RETIRED') {
      throw new BadRequestException('Approved SOP cannot be edited — create a new version');
    }

    const updated = await this.prisma.sOP.update({
      where: { id },
      data: {
        status: status as any,
        ...(status === 'APPROVED'
          ? { approved_by: user.id, approved_at: new Date() }
          : {}),
      },
    });

    await this.auditService.log({
      eventType: 'SOP_STATUS_CHANGED',
      entityType: 'SOP',
      entityId: id,
      actorId: user.id,
      actorRole: user.role,
      beforeState: { status: sop.status },
      afterState: { status },
    });

    return updated;
  }

  async addSection(sopId: string, user: any, data: any) {
    const sop = await this.findOne(sopId);
    if (sop.status === 'APPROVED') {
      throw new BadRequestException('Cannot edit an APPROVED SOP');
    }
    if (!hasMinRole(user.role, 'QA_MANAGER')) {
      throw new ForbiddenException('Only QA_MANAGER+ can edit SOPs');
    }
    return this.prisma.sOPSection.create({ data: { ...data, sop_id: sopId } });
  }

  async addQCParameterSet(sopId: string, user: any, data: any) {
    const sop = await this.findOne(sopId);
    if (sop.status === 'APPROVED') {
      throw new BadRequestException('Cannot edit an APPROVED SOP');
    }
    if (!hasMinRole(user.role, 'QA_MANAGER')) {
      throw new ForbiddenException('Only QA_MANAGER+ can edit SOPs');
    }

    const paramSet = await this.prisma.qCParameterSet.create({
      data: { sop_id: sopId, name: data.name, qc_stage: data.qc_stage },
    });

    if (data.parameters?.length) {
      await this.prisma.qCParameter.createMany({
        data: data.parameters.map((p: any, i: number) => ({
          ...p,
          parameter_set_id: paramSet.id,
          display_order: p.display_order ?? i,
        })),
      });
    }

    return this.prisma.qCParameterSet.findUnique({
      where: { id: paramSet.id },
      include: { parameters: true },
    });
  }

  async getQCParameters(sopId: string) {
    return this.prisma.qCParameterSet.findMany({
      where: { sop_id: sopId },
      include: { parameters: { orderBy: { display_order: 'asc' } } },
    });
  }

  async findByBom(bomId: string) {
    return this.prisma.bOMSOPLink.findMany({
      where: { bom_id: bomId },
      include: {
        sop: {
          include: {
            qc_parameter_sets: { include: { parameters: true } },
          },
        },
      },
    });
  }

  async clone(id: string, user: any) {
    if (!hasMinRole(user.role, 'QA_MANAGER')) {
      throw new ForbiddenException('Only QA_MANAGER+ can clone SOPs');
    }

    const original = await this.findOne(id);

    const versionNum = parseFloat(original.version.replace('v', '')) + 0.1;
    const newVersion = `v${versionNum.toFixed(1)}`;

    const newSop = await this.prisma.sOP.create({
      data: {
        sop_code: `${original.sop_code}-R${Date.now()}`.substring(0, 50),
        title: original.title,
        version: newVersion,
        product_category: original.product_category,
        status: 'DRAFT',
        created_by: user.id,
      },
    });

    for (const section of original.sections) {
      await this.prisma.sOPSection.create({
        data: {
          sop_id: newSop.id,
          section_no: section.section_no,
          title: section.title,
          content: section.content,
          is_critical: section.is_critical,
        },
      });
    }

    await this.auditService.log({
      eventType: 'SOP_CLONED',
      entityType: 'SOP',
      entityId: newSop.id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { cloned_from: id, version: newVersion },
    });

    return newSop;
  }
}
