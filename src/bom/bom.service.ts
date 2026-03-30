import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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
export class BomService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ─── Dynamic BOM ──────────────────────────────────────────────────────────────

  async findAll(productCode?: string, status?: string) {
    return this.prisma.bOM.findMany({
      where: {
        ...(productCode ? { product_code: productCode } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: {
        _count: { select: { components: true, process_steps: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const bom = await this.prisma.bOM.findUnique({
      where: { id },
      include: {
        components: { orderBy: { display_order: 'asc' } },
        process_steps: {
          orderBy: { step_number: 'asc' },
          include: {
            qc_parameter_set: { include: { parameters: true } },
          },
        },
        sop_links: { include: { sop: true } },
      },
    });
    if (!bom) throw new NotFoundException('BOM not found');
    return bom;
  }

  async create(user: any, data: any) {
    if (!hasMinRole(user.role, 'QA_MANAGER')) {
      throw new ForbiddenException('Only QA_MANAGER+ can create BOMs');
    }
    const bom = await this.prisma.bOM.create({
      data: { ...data, created_by: user.id, status: 'DRAFT' },
    });
    await this.auditService.log({
      eventType: 'BOM_CREATED',
      entityType: 'BOM',
      entityId: bom.id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { bom_code: bom.bom_code },
    });
    return bom;
  }

  async updateStatus(id: string, user: any, status: string) {
    if (status === 'APPROVED' && !hasMinRole(user.role, 'QUALIFIED_PERSON')) {
      throw new ForbiddenException('Only QUALIFIED_PERSON can approve BOMs');
    }
    const updated = await this.prisma.bOM.update({
      where: { id },
      data: {
        status: status as any,
        ...(status === 'APPROVED'
          ? { approved_by: user.id, approved_at: new Date() }
          : {}),
      },
    });
    await this.auditService.log({
      eventType: 'BOM_STATUS_CHANGED',
      entityType: 'BOM',
      entityId: id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { status },
    });
    return updated;
  }

  async simulate(id: string, targetBatchSize: number) {
    const bom = await this.findOne(id);
    const scaleFactor = targetBatchSize / bom.base_batch_size;

    const receipts = await this.prisma.materialReceipt.findMany({
      where: {
        qc_status: { in: ['IQC_PASSED', 'IN_STORES'] },
        expiry_date: { gte: new Date() },
      },
      include: { po: true },
      orderBy: { expiry_date: 'asc' },
    });

    const stockMap: Record<string, { qty: number; earliest_expiry: Date | null }> = {};
    for (const r of receipts) {
      const code = r.po.material_code;
      if (!stockMap[code]) stockMap[code] = { qty: 0, earliest_expiry: null };
      stockMap[code].qty += r.received_qty;
      if (
        !stockMap[code].earliest_expiry ||
        r.expiry_date < stockMap[code].earliest_expiry
      ) {
        stockMap[code].earliest_expiry = r.expiry_date;
      }
    }

    const scaledComponents = bom.components.map((c) => {
      const scaledQty = c.quantity_per_base_batch * scaleFactor;
      const stock = stockMap[c.material_code];
      const availableStock = stock?.qty || 0;
      const stockStatus =
        availableStock >= scaledQty
          ? 'SUFFICIENT'
          : availableStock > 0
          ? 'PARTIAL'
          : 'INSUFFICIENT';

      return {
        material_code: c.material_code,
        material_name: c.material_name,
        base_qty: c.quantity_per_base_batch,
        scaled_qty: scaledQty,
        unit: c.unit,
        available_stock: availableStock,
        stock_status: stockStatus,
        earliest_expiry: stock?.earliest_expiry || null,
      };
    });

    const stockWarnings = scaledComponents
      .filter((c) => c.stock_status !== 'SUFFICIENT')
      .map(
        (c) =>
          `${c.material_name}: need ${c.scaled_qty} ${c.unit}, have ${c.available_stock}`,
      );

    const expiryWarnings: string[] = scaledComponents
      .filter((c) => c.earliest_expiry && c.available_stock > 0)
      .map((c) =>
        c.earliest_expiry
          ? `${c.material_name} expires ${c.earliest_expiry.toISOString().split('T')[0]}`
          : '',
      )
      .filter(Boolean);

    return {
      bom_id: id,
      base_batch_size: bom.base_batch_size,
      simulated_batch_size: targetBatchSize,
      scale_factor: scaleFactor,
      scaled_components: scaledComponents,
      scaled_process_steps: bom.process_steps.map((s) => ({
        ...s,
        scaled_params: (s.scalable_params as any[]).map((p) => ({
          ...p,
          actual_value:
            p.scale_type === 'LINEAR'
              ? p.value_per_base * scaleFactor
              : p.value_per_base,
        })),
      })),
      stock_warnings: stockWarnings,
      expiry_warnings: expiryWarnings,
    };
  }

  // ─── Legacy BOM (preserved for BomDefinition page) ───────────────────────────

  async findAllLegacy() {
    return this.prisma.batchTemplate.findMany({
      include: { bomItems: { include: { material: true } } },
    });
  }

  async addLegacyBomItem(
    templateId: string,
    materialId: string,
    qtyPerKg: number,
    notes?: string,
  ) {
    return this.prisma.bomItem.upsert({
      where: { templateId_materialId: { templateId, materialId } },
      update: { qtyPerKg, notes },
      create: { templateId, materialId, qtyPerKg, notes },
    });
  }

  async removeLegacyBomItem(id: string) {
    return this.prisma.bomItem.delete({ where: { id } });
  }

  // ─── Legacy methods kept for existing batches routes ─────────────────────────

  async getTemplateBoM(templateId: string) {
    const template = await this.prisma.batchTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Template not found');
    return this.prisma.bomItem.findMany({
      where: { templateId },
      include: { material: true },
      orderBy: { material: { materialCode: 'asc' } },
    });
  }

  async addItem(
    user: any,
    templateId: string,
    dto: { materialId: string; qtyPerKg: number; notes?: string },
  ) {
    if (!hasMinRole(user.role, 'SUPERVISOR')) {
      throw new ForbiddenException('Only SUPERVISOR+ can manage BoM');
    }
    const template = await this.prisma.batchTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Template not found');
    return this.prisma.bomItem.create({
      data: { templateId, ...dto },
      include: { material: true },
    });
  }

  async removeItem(user: any, itemId: string) {
    if (!hasMinRole(user.role, 'SUPERVISOR')) {
      throw new ForbiddenException('Only SUPERVISOR+ can manage BoM');
    }
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
        status:
          totalIssued >= requiredQty
            ? 'ISSUED'
            : issued.length > 0
            ? 'PARTIAL'
            : 'PENDING',
      };
    });
  }
}
