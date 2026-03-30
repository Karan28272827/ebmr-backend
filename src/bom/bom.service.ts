import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ROLE_LEVEL: Record<string, number> = {
  BATCH_OPERATOR: 1, SUPERVISOR: 2, QA_REVIEWER: 3, QA_MANAGER: 4, QUALIFIED_PERSON: 5,
};

@Injectable()
export class BomService {
  constructor(private prisma: PrismaService) {}

  async getTemplateBoM(templateId: string) {
    const template = await this.prisma.batchTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new NotFoundException('Template not found');
    return this.prisma.bomItem.findMany({
      where: { templateId },
      include: { material: true },
      orderBy: { material: { materialCode: 'asc' } },
    });
  }

  async addItem(user: any, templateId: string, dto: { materialId: string; qtyPerKg: number; notes?: string }) {
    if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.SUPERVISOR)
      throw new ForbiddenException('Only SUPERVISOR+ can manage BoM');
    const template = await this.prisma.batchTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new NotFoundException('Template not found');
    return this.prisma.bomItem.create({ data: { templateId, ...dto }, include: { material: true } });
  }

  async removeItem(user: any, itemId: string) {
    if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.SUPERVISOR)
      throw new ForbiddenException('Only SUPERVISOR+ can manage BoM');
    const item = await this.prisma.bomItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('BoM item not found');
    return this.prisma.bomItem.delete({ where: { id: itemId } });
  }

  async getBatchIssuances(batchId: string) {
    return this.prisma.materialIssuance.findMany({
      where: { batchId },
      include: {
        bomItem: { include: { material: true } },
        issuer: { select: { name: true, email: true } },
      },
      orderBy: { issuedAt: 'asc' },
    });
  }

  async issueForBatch(
    user: any,
    batchId: string,
    dto: { bomItemId: string; lotNumber: string; issuedQty: number },
  ) {
    const batch = await this.prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) throw new NotFoundException('Batch not found');

    const bomItem = await this.prisma.bomItem.findUnique({
      where: { id: dto.bomItemId },
      include: { material: true },
    });
    if (!bomItem) throw new NotFoundException('BoM item not found');

    const requiredQty = parseFloat((bomItem.qtyPerKg * batch.batchSize).toFixed(3));

    return this.prisma.materialIssuance.create({
      data: {
        batchId,
        bomItemId: dto.bomItemId,
        materialId: bomItem.materialId,
        lotNumber: dto.lotNumber,
        requiredQty,
        issuedQty: dto.issuedQty,
        issuedBy: user.id,
      },
      include: {
        bomItem: { include: { material: true } },
        issuer: { select: { name: true, email: true } },
      },
    });
  }

  async getRequiredMaterials(batchId: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        template: { include: { bomItems: { include: { material: true } } } },
        issuances: { include: { bomItem: true } },
      },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    return (batch.template.bomItems || []).map((item) => {
      const requiredQty = parseFloat((item.qtyPerKg * batch.batchSize).toFixed(3));
      const issued = (batch.issuances || []).filter((i) => i.bomItemId === item.id);
      const totalIssued = issued.reduce((s, i) => s + i.issuedQty, 0);
      return {
        bomItem: item,
        requiredQty,
        totalIssued,
        issuances: issued,
        status: totalIssued >= requiredQty ? 'ISSUED' : issued.length > 0 ? 'PARTIAL' : 'PENDING',
      };
    });
  }
}
