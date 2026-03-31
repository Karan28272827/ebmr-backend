import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService, private auditService: AuditService) {}

  async getCurrentStock(materialCode?: string) {
    const now = new Date();
    const receipts = await this.prisma.materialReceipt.findMany({
      where: {
        qc_status: { in: ['IQC_PASSED', 'IN_STORES'] },
        expiry_date: { gte: now },
        ...(materialCode ? { po: { material_code: materialCode } } : {}),
      },
      include: {
        po: { select: { material_code: true, material_name: true } },
      },
      orderBy: { expiry_date: 'asc' },
    });

    const grouped: Record<string, { material_code: string; material_name: string; total_qty: number; unit: string; lots: any[] }> = {};
    for (const r of receipts) {
      const code = r.po.material_code;
      if (!grouped[code]) {
        grouped[code] = { material_code: code, material_name: r.po.material_name, total_qty: 0, unit: r.unit, lots: [] };
      }
      grouped[code].total_qty += r.received_qty;
      grouped[code].lots.push({
        receipt_id: r.id, receipt_code: r.receipt_code, qty: r.received_qty,
        expiry_date: r.expiry_date, store_location: r.store_location, supplier_batch_no: r.supplier_batch_no,
      });
    }
    return Object.values(grouped);
  }

  async getLedger(materialCode?: string, limit = 100) {
    return this.prisma.stockEntry.findMany({
      where: materialCode ? { material_code: materialCode } : undefined,
      orderBy: { recorded_at: 'desc' },
      take: limit,
      include: { receipt: { select: { receipt_code: true } } },
    });
  }

  async recordMovement(user: any, data: { material_code: string; material_name: string; receipt_id?: string; material_id?: string; movement_type: string; quantity: number; unit: string; lot_number?: string; expiry_date?: string; reference_id: string; reference_type: string; notes?: string }) {
    // Compute current balance
    const entries = await this.prisma.stockEntry.findMany({ where: { material_code: data.material_code } });
    let balance = 0;
    for (const e of entries) {
      if (['RECEIPT', 'RETURN'].includes(e.movement_type)) balance += e.quantity;
      else balance -= e.quantity;
    }
    const adds = ['RECEIPT', 'RETURN'];
    const balance_after = adds.includes(data.movement_type) ? balance + data.quantity : balance - data.quantity;

    const entry = await this.prisma.stockEntry.create({
      data: {
        material_code: data.material_code,
        material_name: data.material_name,
        receipt_id: data.receipt_id || null,
        material_id: data.material_id || null,
        movement_type: data.movement_type as any,
        quantity: data.quantity,
        unit: data.unit,
        balance_after,
        lot_number: data.lot_number || null,
        expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
        reference_id: data.reference_id,
        reference_type: data.reference_type,
        recorded_by: user.id,
        notes: data.notes || null,
      },
    });
    await this.auditService.log({
      eventType: 'STOCK_MOVEMENT_RECORDED',
      entityType: 'StockEntry',
      entityId: entry.id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { movement_type: data.movement_type, quantity: data.quantity, balance_after },
    });
    return entry;
  }

  async fefoIssue(user: any, data: { material_code: string; quantity_needed: number; unit: string; batch_id: string; step_number: number; notes?: string }) {
    const now = new Date();
    const receipts = await this.prisma.materialReceipt.findMany({
      where: {
        qc_status: { in: ['IQC_PASSED', 'IN_STORES'] },
        expiry_date: { gte: now },
        po: { material_code: data.material_code },
      },
      include: { po: { select: { material_code: true, material_name: true } } },
      orderBy: { expiry_date: 'asc' },
    });

    let remaining = data.quantity_needed;
    const lots_used: any[] = [];

    for (const r of receipts) {
      if (remaining <= 0) break;
      const qty_take = Math.min(remaining, r.received_qty);
      remaining -= qty_take;
      lots_used.push({ receipt_id: r.id, receipt_code: r.receipt_code, qty_taken: qty_take, expiry_date: r.expiry_date });

      // Create stock entry for issuance
      const entries = await this.prisma.stockEntry.findMany({ where: { material_code: data.material_code } });
      let balance = 0;
      for (const e of entries) {
        if (['RECEIPT', 'RETURN'].includes(e.movement_type)) balance += e.quantity;
        else balance -= e.quantity;
      }
      await this.prisma.stockEntry.create({
        data: {
          material_code: data.material_code,
          material_name: r.po.material_name,
          receipt_id: r.id,
          movement_type: 'ISSUANCE',
          quantity: qty_take,
          unit: data.unit,
          balance_after: balance - qty_take,
          lot_number: r.supplier_batch_no,
          expiry_date: r.expiry_date,
          reference_id: data.batch_id,
          reference_type: 'Batch',
          recorded_by: user.id,
          notes: data.notes || null,
        },
      });

      if (qty_take >= r.received_qty) {
        await this.prisma.materialReceipt.update({ where: { id: r.id }, data: { qc_status: 'CONSUMED' } });
      }
    }

    await this.auditService.log({
      eventType: 'STOCK_FEFO_ISSUED',
      entityType: 'Batch',
      entityId: data.batch_id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { material_code: data.material_code, total_issued: data.quantity_needed - remaining, lots_used },
    });

    return { lots_used, total_issued: data.quantity_needed - remaining, shortfall: Math.max(0, remaining) };
  }

  async getExpiryReport() {
    const now = new Date();
    const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const in60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const receipts = await this.prisma.materialReceipt.findMany({
      where: {
        expiry_date: { lte: in90 },
        qc_status: { in: ['IQC_PASSED', 'IN_STORES', 'PENDING_IQC'] },
      },
      include: { po: { select: { material_code: true, material_name: true } } },
      orderBy: { expiry_date: 'asc' },
    });

    const result: any = { EXPIRED: [], CRITICAL: [], WARNING: [], NOTICE: [] };
    for (const r of receipts) {
      const daysLeft = Math.ceil((r.expiry_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const item = { ...r, days_to_expiry: daysLeft, material_code: r.po.material_code, material_name: r.po.material_name };
      if (r.expiry_date < now) result.EXPIRED.push(item);
      else if (r.expiry_date <= in30) result.CRITICAL.push(item);
      else if (r.expiry_date <= in60) result.WARNING.push(item);
      else result.NOTICE.push(item);
    }
    return result;
  }
}
