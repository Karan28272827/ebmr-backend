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
exports.PlanningService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
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
let PlanningService = class PlanningService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAll(status, period) {
        return this.prisma.productionPlan.findMany({
            where: {
                ...(status ? { status: status } : {}),
                ...(period ? { plan_period: { contains: period } } : {}),
            },
            include: { _count: { select: { planned_batches: true } } },
            orderBy: { created_at: 'desc' },
        });
    }
    async findOne(id) {
        const plan = await this.prisma.productionPlan.findUnique({
            where: { id },
            include: {
                planned_batches: {
                    include: {
                        bom: { select: { bom_code: true, product_name: true } },
                        actual_batch: { select: { batchNumber: true, state: true } },
                    },
                },
            },
        });
        if (!plan)
            throw new common_1.NotFoundException('Production plan not found');
        return plan;
    }
    async create(user, data) {
        const count = await this.prisma.productionPlan.count();
        const plan_code = `PP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        const plan = await this.prisma.productionPlan.create({
            data: { ...data, plan_code, created_by: user.id, status: 'DRAFT' },
        });
        await this.auditService.log({
            eventType: 'PRODUCTION_PLAN_CREATED',
            entityType: 'ProductionPlan',
            entityId: plan.id,
            actorId: user.id,
            actorRole: user.role,
            afterState: { plan_code },
        });
        return plan;
    }
    async addPlannedBatch(planId, user, data) {
        const sim = await this.runSimulation(data.bom_id, data.planned_batch_size, new Date(data.planned_start));
        const pb = await this.prisma.plannedBatch.create({
            data: { ...data, plan_id: planId, status: 'SCHEDULED', simulation_result: sim },
        });
        return { planned_batch: pb, simulation: sim };
    }
    async runSimulation(bomId, batchSize, plannedStart) {
        const bom = await this.prisma.bOM.findUnique({
            where: { id: bomId },
            include: { components: true, process_steps: true },
        });
        if (!bom)
            throw new common_1.NotFoundException('BOM not found');
        const scaleFactor = batchSize / bom.base_batch_size;
        const checkDate = plannedStart || new Date();
        const receipts = await this.prisma.materialReceipt.findMany({
            where: {
                qc_status: { in: ['IQC_PASSED', 'IN_STORES'] },
                expiry_date: { gte: checkDate },
            },
            include: { po: true },
            orderBy: { expiry_date: 'asc' },
        });
        const stockMap = {};
        for (const r of receipts) {
            const code = r.po.material_code;
            if (!stockMap[code])
                stockMap[code] = { qty: 0, lots: [] };
            stockMap[code].qty += r.received_qty;
            stockMap[code].lots.push({
                receipt_code: r.receipt_code,
                qty: r.received_qty,
                expiry_date: r.expiry_date,
            });
        }
        const materialChecks = bom.components.map((c) => {
            const needed = c.quantity_per_base_batch * scaleFactor;
            const available = stockMap[c.material_code]?.qty || 0;
            const fefoLot = stockMap[c.material_code]?.lots[0] || null;
            return {
                material_code: c.material_code,
                material_name: c.material_name,
                needed,
                available,
                unit: c.unit,
                status: available >= needed ? 'OK' : available > 0 ? 'SHORT' : 'STOCKOUT',
                fefo_lot: fefoLot,
                shortfall: Math.max(0, needed - available),
            };
        });
        const shortages = materialChecks.filter((m) => m.status !== 'OK');
        return {
            scale_factor: scaleFactor,
            material_checks: materialChecks,
            shortages,
            has_shortages: shortages.length > 0,
            estimated_cycle_time_hrs: bom.process_steps.reduce((sum, s) => sum + (s.duration_min || 0), 0) / 60,
        };
    }
    async simulatePlan(planId) {
        const plan = await this.findOne(planId);
        const results = [];
        for (const pb of plan.planned_batches) {
            const sim = await this.runSimulation(pb.bom_id, pb.planned_batch_size, pb.planned_start);
            await this.prisma.plannedBatch.update({
                where: { id: pb.id },
                data: { simulation_result: sim },
            });
            results.push({ planned_batch_id: pb.id, simulation: sim });
        }
        return results;
    }
    async approvePlan(id, user, signature) {
        if (!hasMinRole(user.role, 'QA_MANAGER'))
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can approve plans');
        if (signature?.password) {
            const usr = await this.prisma.user.findUnique({ where: { id: user.id } });
            const valid = await bcrypt.compare(signature.password, usr?.passwordHash || '');
            if (!valid)
                throw new common_1.ForbiddenException('Invalid password for e-signature');
        }
        const updated = await this.prisma.productionPlan.update({
            where: { id },
            data: { status: 'APPROVED', approved_by: user.id, approved_at: new Date() },
        });
        await this.auditService.log({
            eventType: 'PRODUCTION_PLAN_APPROVED',
            entityType: 'ProductionPlan',
            entityId: id,
            actorId: user.id,
            actorRole: user.role,
            afterState: { status: 'APPROVED' },
        });
        return updated;
    }
    async getCalendar() {
        return this.prisma.plannedBatch.findMany({
            where: { status: { not: 'CANCELLED' } },
            include: {
                bom: { select: { product_name: true, product_code: true } },
                plan: { select: { plan_code: true, plan_name: true } },
            },
            orderBy: { planned_start: 'asc' },
        });
    }
    async initiateBatch(planId, plannedBatchId, user, data) {
        if (!hasMinRole(user.role, 'SUPERVISOR'))
            throw new common_1.ForbiddenException('Only SUPERVISOR+ can initiate batches from plans');
        const pb = await this.prisma.plannedBatch.findUnique({
            where: { id: plannedBatchId },
            include: { bom: true },
        });
        if (!pb)
            throw new common_1.NotFoundException('Planned batch not found');
        const template = await this.prisma.batchTemplate.findFirst({
            where: { productCode: pb.bom.product_code },
        });
        if (!template)
            throw new common_1.BadRequestException('No batch template found for this product');
        const steps = template.steps.map((s, i) => ({
            ...s,
            step_number: i + 1,
            status: 'PENDING',
            actual_values: {},
            completed_by: null,
            completed_at: null,
        }));
        const batch = await this.prisma.batch.create({
            data: {
                batchNumber: data.batchNumber,
                productCode: pb.bom.product_code,
                productName: pb.bom.product_name,
                batchSize: pb.planned_batch_size,
                state: 'DRAFT',
                initiatedBy: user.id,
                templateId: template.id,
                bomId: pb.bom_id,
                steps,
                signatures: [],
            },
        });
        await this.prisma.plannedBatch.update({
            where: { id: plannedBatchId },
            data: { actual_batch_id: batch.id, status: 'IN_PROGRESS' },
        });
        await this.auditService.log({
            eventType: 'BATCH_INITIATED_FROM_PLAN',
            entityType: 'Batch',
            entityId: batch.id,
            actorId: user.id,
            actorRole: user.role,
            afterState: { batchNumber: batch.batchNumber, planId },
        });
        return batch;
    }
    async getExpiryAlerts(level, materialCode) {
        return this.prisma.materialExpiryAlert.findMany({
            where: {
                ...(level ? { alert_level: level } : {}),
                ...(materialCode ? { material_code: materialCode } : {}),
                is_acknowledged: false,
            },
            orderBy: [{ alert_level: 'asc' }, { days_to_expiry: 'asc' }],
        });
    }
    async acknowledgeAlert(id, user) {
        return this.prisma.materialExpiryAlert.update({
            where: { id },
            data: { is_acknowledged: true, acknowledged_by: user.id },
        });
    }
};
exports.PlanningService = PlanningService;
exports.PlanningService = PlanningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], PlanningService);
//# sourceMappingURL=planning.service.js.map