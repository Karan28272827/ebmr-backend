import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
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
export class MaterialsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ─── Legacy material master (kept for backward compat) ───────────────────────

  async findAllMaterials() {
    return this.prisma.material.findMany({ orderBy: { materialName: 'asc' } });
  }

  async findByBarcode(code: string) {
    const mat = await this.prisma.material.findFirst({
      where: { materialCode: code },
    });
    if (!mat) throw new NotFoundException('Material not found');
    return mat;
  }

  async findOne(id: string) {
    const m = await this.prisma.material.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('Material not found');
    return m;
  }

  async findByCode(code: string) {
    const m = await this.prisma.material.findUnique({ where: { materialCode: code } });
    if (!m) throw new NotFoundException('Material not found');
    return m;
  }

  async createMaterial(dto: {
    materialCode: string;
    materialName: string;
    unit: string;
    description?: string;
  }) {
    const existing = await this.prisma.material.findUnique({
      where: { materialCode: dto.materialCode },
    });
    if (existing) throw new ConflictException(`Material code ${dto.materialCode} already exists`);
    return this.prisma.material.create({ data: dto });
  }

  async updateMaterial(
    id: string,
    dto: { materialName?: string; unit?: string; description?: string },
  ) {
    await this.findOne(id);
    return this.prisma.material.update({ where: { id }, data: dto });
  }

  // ─── Material Intent ──────────────────────────────────────────────────────────

  async createIntent(user: any, data: any) {
    if (!hasMinRole(user.role, 'SUPERVISOR')) {
      throw new ForbiddenException('Only SUPERVISOR+ can raise material intents');
    }
    const count = await this.prisma.materialIntent.count();
    const intent_code = `MINT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const intent = await this.prisma.materialIntent.create({
      data: { ...data, intent_code, raised_by: user.id, status: 'OPEN' },
    });
    await this.auditService.log({
      eventType: 'MATERIAL_INTENT_CREATED',
      entityType: 'MaterialIntent',
      entityId: intent.id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { intent_code },
    });
    return intent;
  }

  async findAllIntents(status?: string, materialCode?: string) {
    return this.prisma.materialIntent.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(materialCode ? { material_code: materialCode } : {}),
      },
      include: { _count: { select: { purchase_orders: true } } },
      orderBy: { raised_at: 'desc' },
    });
  }

  // ─── Purchase Orders ──────────────────────────────────────────────────────────

  async createPO(user: any, data: any) {
    if (!hasMinRole(user.role, 'QA_MANAGER')) {
      throw new ForbiddenException('Only QA_MANAGER+ can create POs');
    }
    const count = await this.prisma.purchaseOrder.count();
    const po_number = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const po = await this.prisma.purchaseOrder.create({
      data: { ...data, po_number, created_by: user.id, status: 'RAISED' },
    });
    if (data.intent_id) {
      await this.prisma.materialIntent.update({
        where: { id: data.intent_id },
        data: { status: 'PO_RAISED' },
      });
    }
    await this.auditService.log({
      eventType: 'PO_CREATED',
      entityType: 'PurchaseOrder',
      entityId: po.id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { po_number },
    });
    return po;
  }

  async findAllPOs(status?: string) {
    return this.prisma.purchaseOrder.findMany({
      where: status ? { status: status as any } : {},
      include: {
        intent: true,
        _count: { select: { receipts: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ─── Material Receipts ────────────────────────────────────────────────────────

  async createReceipt(user: any, data: any) {
    const count = await this.prisma.materialReceipt.count();
    const receipt_code = `MRN-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const receipt = await this.prisma.materialReceipt.create({
      data: { ...data, receipt_code, received_by: user.id, qc_status: 'PENDING_IQC' },
    });

    // Auto-create IQC test
    const iqcCount = await this.prisma.qCTest.count();
    const test_code = `IQC-${new Date().getFullYear()}-${String(iqcCount + 1).padStart(4, '0')}`;
    await this.prisma.qCTest.create({
      data: {
        test_code,
        qc_stage: 'IQC',
        material_receipt_id: receipt.id,
        initiated_by: user.id,
        status: 'PENDING',
      },
    });

    // Check expiry and create alerts
    await this.checkAndCreateExpiryAlert(
      receipt.id,
      data.material_code,
      data.expiry_date,
      data.received_qty,
      data.unit,
    );

    await this.auditService.log({
      eventType: 'MATERIAL_RECEIPT_CREATED',
      entityType: 'MaterialReceipt',
      entityId: receipt.id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { receipt_code },
    });

    return receipt;
  }

  async findAllReceipts(qcStatus?: string, expiryBefore?: string) {
    return this.prisma.materialReceipt.findMany({
      where: {
        ...(qcStatus ? { qc_status: qcStatus as any } : {}),
        ...(expiryBefore ? { expiry_date: { lte: new Date(expiryBefore) } } : {}),
      },
      include: {
        po: { select: { po_number: true, supplier_name: true } },
        _count: { select: { qc_tests: true } },
      },
      orderBy: { received_at: 'desc' },
    });
  }

  async findReceiptById(id: string) {
    const r = await this.prisma.materialReceipt.findUnique({
      where: { id },
      include: { po: true, qc_tests: true, grn: true },
    });
    if (!r) throw new NotFoundException('Receipt not found');
    return r;
  }

  async getExpiring(days: number = 90) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return this.prisma.materialReceipt.findMany({
      where: {
        expiry_date: { lte: cutoff },
        qc_status: { not: 'CONSUMED' },
      },
      include: { po: { select: { supplier_name: true, material_name: true } } },
      orderBy: { expiry_date: 'asc' },
    });
  }

  // ─── GRN ──────────────────────────────────────────────────────────────────────

  async createGRN(
    user: any,
    data: {
      po_id: string;
      receipt_ids: string[];
      invoice_ref?: string;
      payment_due?: string;
    },
  ) {
    if (!hasMinRole(user.role, 'SUPERVISOR')) {
      throw new ForbiddenException('Only SUPERVISOR+ can create GRNs');
    }
    const count = await this.prisma.gRN.count();
    const grn_number = `GRN-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const grn = await this.prisma.gRN.create({
      data: {
        grn_number,
        po_id: data.po_id,
        raised_by: user.id,
        invoice_ref: data.invoice_ref,
        payment_due: data.payment_due ? new Date(data.payment_due) : undefined,
      },
    });

    for (const receiptId of data.receipt_ids || []) {
      await this.prisma.materialReceipt.update({
        where: { id: receiptId },
        data: { grn_id: grn.id, qc_status: 'IN_STORES' },
      });
    }

    await this.auditService.log({
      eventType: 'GRN_CREATED',
      entityType: 'GRN',
      entityId: grn.id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { grn_number },
    });

    return grn;
  }

  async updateGRNAccounts(
    id: string,
    user: any,
    data: { accounts_status: string; invoice_ref?: string; payment_due?: string },
  ) {
    if (!hasMinRole(user.role, 'QA_MANAGER')) {
      throw new ForbiddenException('Only QA_MANAGER+ can update accounts status');
    }
    return this.prisma.gRN.update({
      where: { id },
      data: {
        accounts_status: data.accounts_status as any,
        invoice_ref: data.invoice_ref,
        payment_due: data.payment_due ? new Date(data.payment_due) : undefined,
      },
    });
  }

  // ─── Stock ────────────────────────────────────────────────────────────────────

  async getStock() {
    const receipts = await this.prisma.materialReceipt.findMany({
      where: {
        qc_status: { in: ['IQC_PASSED', 'IN_STORES'] },
        expiry_date: { gte: new Date() },
      },
      include: {
        po: { select: { material_code: true, material_name: true, unit: true } },
      },
      orderBy: { expiry_date: 'asc' },
    });

    const stockMap: Record<string, any> = {};
    for (const r of receipts) {
      const code = r.po.material_code;
      if (!stockMap[code]) {
        stockMap[code] = {
          material_code: code,
          material_name: r.po.material_name,
          unit: r.po.unit,
          total_qty: 0,
          lots: [],
        };
      }
      stockMap[code].total_qty += r.received_qty;
      stockMap[code].lots.push({
        receipt_code: r.receipt_code,
        qty: r.received_qty,
        expiry_date: r.expiry_date,
        location: r.store_location,
        qc_status: r.qc_status,
      });
    }

    return Object.values(stockMap);
  }

  // ─── Expiry Alerts ────────────────────────────────────────────────────────────

  async getExpiryAlerts(level?: string, materialCode?: string) {
    return this.prisma.materialExpiryAlert.findMany({
      where: {
        ...(level ? { alert_level: level as any } : {}),
        ...(materialCode ? { material_code: materialCode } : {}),
        is_acknowledged: false,
      },
      orderBy: { days_to_expiry: 'asc' },
    });
  }

  async acknowledgeAlert(id: string, user: any) {
    return this.prisma.materialExpiryAlert.update({
      where: { id },
      data: { is_acknowledged: true, acknowledged_by: user.id },
    });
  }

  private async checkAndCreateExpiryAlert(
    receiptId: string,
    materialCode: string,
    expiryDate: Date | string,
    qty: number,
    unit: string,
  ) {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysToExpiry = Math.floor(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    let alertLevel: 'CRITICAL' | 'WARNING' | 'NOTICE' | null = null;
    if (daysToExpiry <= 30) alertLevel = 'CRITICAL';
    else if (daysToExpiry <= 90) alertLevel = 'WARNING';
    else if (daysToExpiry <= 180) alertLevel = 'NOTICE';

    if (alertLevel) {
      const receipt = await this.prisma.materialReceipt.findUnique({
        where: { id: receiptId },
        include: { po: true },
      });
      await this.prisma.materialExpiryAlert.create({
        data: {
          material_code: materialCode,
          material_name: receipt?.po?.material_name || materialCode,
          receipt_id: receiptId,
          expiry_date: expiry,
          quantity: qty,
          unit,
          days_to_expiry: daysToExpiry,
          alert_level: alertLevel,
        },
      });
    }
  }
}
