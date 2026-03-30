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
exports.BomService = void 0;
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
let BomService = class BomService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAll(productCode, status) {
        return this.prisma.bOM.findMany({
            where: {
                ...(productCode ? { product_code: productCode } : {}),
                ...(status ? { status: status } : {}),
            },
            include: {
                _count: { select: { components: true, process_steps: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async findOne(id) {
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
        if (!bom)
            throw new common_1.NotFoundException('BOM not found');
        return bom;
    }
    async create(user, data) {
        if (!hasMinRole(user.role, 'QA_MANAGER')) {
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can create BOMs');
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
    async updateStatus(id, user, status) {
        if (status === 'APPROVED' && !hasMinRole(user.role, 'QUALIFIED_PERSON')) {
            throw new common_1.ForbiddenException('Only QUALIFIED_PERSON can approve BOMs');
        }
        const updated = await this.prisma.bOM.update({
            where: { id },
            data: {
                status: status,
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
    async simulate(id, targetBatchSize) {
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
        const stockMap = {};
        for (const r of receipts) {
            const code = r.po.material_code;
            if (!stockMap[code])
                stockMap[code] = { qty: 0, earliest_expiry: null };
            stockMap[code].qty += r.received_qty;
            if (!stockMap[code].earliest_expiry ||
                r.expiry_date < stockMap[code].earliest_expiry) {
                stockMap[code].earliest_expiry = r.expiry_date;
            }
        }
        const scaledComponents = bom.components.map((c) => {
            const scaledQty = c.quantity_per_base_batch * scaleFactor;
            const stock = stockMap[c.material_code];
            const availableStock = stock?.qty || 0;
            const stockStatus = availableStock >= scaledQty
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
            .map((c) => `${c.material_name}: need ${c.scaled_qty} ${c.unit}, have ${c.available_stock}`);
        const expiryWarnings = scaledComponents
            .filter((c) => c.earliest_expiry && c.available_stock > 0)
            .map((c) => c.earliest_expiry
            ? `${c.material_name} expires ${c.earliest_expiry.toISOString().split('T')[0]}`
            : '')
            .filter(Boolean);
        return {
            bom_id: id,
            base_batch_size: bom.base_batch_size,
            simulated_batch_size: targetBatchSize,
            scale_factor: scaleFactor,
            scaled_components: scaledComponents,
            scaled_process_steps: bom.process_steps.map((s) => ({
                ...s,
                scaled_params: s.scalable_params.map((p) => ({
                    ...p,
                    actual_value: p.scale_type === 'LINEAR'
                        ? p.value_per_base * scaleFactor
                        : p.value_per_base,
                })),
            })),
            stock_warnings: stockWarnings,
            expiry_warnings: expiryWarnings,
        };
    }
    async findAllLegacy() {
        return this.prisma.batchTemplate.findMany({
            include: { bomItems: { include: { material: true } } },
        });
    }
    async addLegacyBomItem(templateId, materialId, qtyPerKg, notes) {
        return this.prisma.bomItem.upsert({
            where: { templateId_materialId: { templateId, materialId } },
            update: { qtyPerKg, notes },
            create: { templateId, materialId, qtyPerKg, notes },
        });
    }
    async removeLegacyBomItem(id) {
        return this.prisma.bomItem.delete({ where: { id } });
    }
    async getTemplateBoM(templateId) {
        const template = await this.prisma.batchTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return this.prisma.bomItem.findMany({
            where: { templateId },
            include: { material: true },
            orderBy: { material: { materialCode: 'asc' } },
        });
    }
    async addItem(user, templateId, dto) {
        if (!hasMinRole(user.role, 'SUPERVISOR')) {
            throw new common_1.ForbiddenException('Only SUPERVISOR+ can manage BoM');
        }
        const template = await this.prisma.batchTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return this.prisma.bomItem.create({
            data: { templateId, ...dto },
            include: { material: true },
        });
    }
    async removeItem(user, itemId) {
        if (!hasMinRole(user.role, 'SUPERVISOR')) {
            throw new common_1.ForbiddenException('Only SUPERVISOR+ can manage BoM');
        }
        const item = await this.prisma.bomItem.findUnique({ where: { id: itemId } });
        if (!item)
            throw new common_1.NotFoundException('BoM item not found');
        return this.prisma.bomItem.delete({ where: { id: itemId } });
    }
    async getBatchIssuances(batchId) {
        return this.prisma.materialIssuance.findMany({
            where: { batchId },
            include: {
                bomItem: { include: { material: true } },
                issuer: { select: { name: true, email: true } },
            },
            orderBy: { issuedAt: 'asc' },
        });
    }
    async issueForBatch(user, batchId, dto) {
        const batch = await this.prisma.batch.findUnique({ where: { id: batchId } });
        if (!batch)
            throw new common_1.NotFoundException('Batch not found');
        const bomItem = await this.prisma.bomItem.findUnique({
            where: { id: dto.bomItemId },
            include: { material: true },
        });
        if (!bomItem)
            throw new common_1.NotFoundException('BoM item not found');
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
    async getRequiredMaterials(batchId) {
        const batch = await this.prisma.batch.findUnique({
            where: { id: batchId },
            include: {
                template: { include: { bomItems: { include: { material: true } } } },
                issuances: { include: { bomItem: true } },
            },
        });
        if (!batch)
            throw new common_1.NotFoundException('Batch not found');
        return (batch.template.bomItems || []).map((item) => {
            const requiredQty = parseFloat((item.qtyPerKg * batch.batchSize).toFixed(3));
            const issued = (batch.issuances || []).filter((i) => i.bomItemId === item.id);
            const totalIssued = issued.reduce((s, i) => s + i.issuedQty, 0);
            return {
                bomItem: item,
                requiredQty,
                totalIssued,
                issuances: issued,
                status: totalIssued >= requiredQty
                    ? 'ISSUED'
                    : issued.length > 0
                        ? 'PARTIAL'
                        : 'PENDING',
            };
        });
    }
};
exports.BomService = BomService;
exports.BomService = BomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], BomService);
//# sourceMappingURL=bom.service.js.map