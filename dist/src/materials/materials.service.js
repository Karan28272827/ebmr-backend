"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const ROLE_LEVEL = {
    BATCH_OPERATOR: 1,
    SUPERVISOR: 2,
    LAB_ANALYST: 3,
    QA_REVIEWER: 4,
    QA_MANAGER: 5,
    QUALIFIED_PERSON: 6,
    SYSTEM_ADMIN: 7,
};
function hasMinRole(userRole, minRole) {
    return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minRole] || 0);
}
let MaterialsService = class MaterialsService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAllMaterials() {
        return this.prisma.material.findMany({ orderBy: { materialName: 'asc' } });
    }
    async findByBarcode(code) {
        const mat = await this.prisma.material.findFirst({
            where: { materialCode: code },
        });
        if (!mat)
            throw new common_1.NotFoundException('Material not found');
        return mat;
    }
    async findOne(id) {
        const m = await this.prisma.material.findUnique({ where: { id } });
        if (!m)
            throw new common_1.NotFoundException('Material not found');
        return m;
    }
    async findByCode(code) {
        const m = await this.prisma.material.findUnique({ where: { materialCode: code } });
        if (!m)
            throw new common_1.NotFoundException('Material not found');
        return m;
    }
    async createMaterial(dto) {
        const existing = await this.prisma.material.findUnique({
            where: { materialCode: dto.materialCode },
        });
        if (existing)
            throw new common_1.ConflictException(`Material code ${dto.materialCode} already exists`);
        return this.prisma.material.create({ data: dto });
    }
    async updateMaterial(id, dto) {
        await this.findOne(id);
        return this.prisma.material.update({ where: { id }, data: dto });
    }
    async createIntent(user, data) {
        if (!hasMinRole(user.role, 'SUPERVISOR')) {
            throw new common_1.ForbiddenException('Only SUPERVISOR+ can raise material intents');
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
    async findAllIntents(status, materialCode) {
        return this.prisma.materialIntent.findMany({
            where: {
                ...(status ? { status: status } : {}),
                ...(materialCode ? { material_code: materialCode } : {}),
            },
            include: { _count: { select: { purchase_orders: true } } },
            orderBy: { raised_at: 'desc' },
        });
    }
    async createPO(user, data) {
        if (!hasMinRole(user.role, 'QA_MANAGER')) {
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can create POs');
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
    async findAllPOs(status) {
        return this.prisma.purchaseOrder.findMany({
            where: status ? { status: status } : {},
            include: {
                intent: true,
                _count: { select: { receipts: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async createReceipt(user, data) {
        const count = await this.prisma.materialReceipt.count();
        const receipt_code = `MRN-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        const receipt = await this.prisma.materialReceipt.create({
            data: { ...data, receipt_code, received_by: user.id, qc_status: 'PENDING_IQC' },
        });
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
        await this.checkAndCreateExpiryAlert(receipt.id, data.material_code, data.expiry_date, data.received_qty, data.unit);
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
    async findAllReceipts(qcStatus, expiryBefore) {
        return this.prisma.materialReceipt.findMany({
            where: {
                ...(qcStatus ? { qc_status: qcStatus } : {}),
                ...(expiryBefore ? { expiry_date: { lte: new Date(expiryBefore) } } : {}),
            },
            include: {
                po: { select: { po_number: true, supplier_name: true } },
                _count: { select: { qc_tests: true } },
            },
            orderBy: { received_at: 'desc' },
        });
    }
    async findReceiptById(id) {
        const r = await this.prisma.materialReceipt.findUnique({
            where: { id },
            include: { po: true, qc_tests: true, grn: true },
        });
        if (!r)
            throw new common_1.NotFoundException('Receipt not found');
        return r;
    }
    async getExpiring(days = 90) {
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
    async createGRN(user, data) {
        if (!hasMinRole(user.role, 'SUPERVISOR')) {
            throw new common_1.ForbiddenException('Only SUPERVISOR+ can create GRNs');
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
    async updateGRNAccounts(id, user, data) {
        if (!hasMinRole(user.role, 'QA_MANAGER')) {
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can update accounts status');
        }
        return this.prisma.gRN.update({
            where: { id },
            data: {
                accounts_status: data.accounts_status,
                invoice_ref: data.invoice_ref,
                payment_due: data.payment_due ? new Date(data.payment_due) : undefined,
            },
        });
    }
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
        const stockMap = {};
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
    async getExpiryAlerts(level, materialCode) {
        return this.prisma.materialExpiryAlert.findMany({
            where: {
                ...(level ? { alert_level: level } : {}),
                ...(materialCode ? { material_code: materialCode } : {}),
                is_acknowledged: false,
            },
            orderBy: { days_to_expiry: 'asc' },
        });
    }
    async acknowledgeAlert(id, user) {
        return this.prisma.materialExpiryAlert.update({
            where: { id },
            data: { is_acknowledged: true, acknowledged_by: user.id },
        });
    }
    async checkAndCreateExpiryAlert(receiptId, materialCode, expiryDate, qty, unit) {
        const expiry = new Date(expiryDate);
        const now = new Date();
        const daysToExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        let alertLevel = null;
        if (daysToExpiry <= 30)
            alertLevel = 'CRITICAL';
        else if (daysToExpiry <= 90)
            alertLevel = 'WARNING';
        else if (daysToExpiry <= 180)
            alertLevel = 'NOTICE';
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
};
exports.MaterialsService = MaterialsService;
exports.MaterialsService = MaterialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], MaterialsService);
//# sourceMappingURL=materials.service.js.map