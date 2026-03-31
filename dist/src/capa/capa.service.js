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
exports.CapaService = void 0;
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
let CapaService = class CapaService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAll(status, source) {
        return this.prisma.cAPA.findMany({
            where: {
                ...(status ? { status: status } : {}),
                ...(source ? { source: source } : {}),
            },
            include: {
                batch: { select: { batchNumber: true } },
                deviation: { select: { id: true, fieldName: true } },
            },
            orderBy: { raised_at: 'desc' },
        });
    }
    async findOne(id) {
        const capa = await this.prisma.cAPA.findUnique({
            where: { id },
            include: {
                batch: { select: { batchNumber: true } },
                deviation: { select: { id: true, fieldName: true } },
            },
        });
        if (!capa)
            throw new common_1.NotFoundException('CAPA not found');
        return capa;
    }
    async create(user, data) {
        const count = await this.prisma.cAPA.count();
        const year = new Date().getFullYear();
        const capa_code = `CAPA-${year}-${String(count + 1).padStart(4, '0')}`;
        const capa = await this.prisma.cAPA.create({
            data: {
                capa_code,
                source: data.source,
                source_ref: data.source_ref,
                ...(data.deviation_id ? { deviation_id: data.deviation_id } : {}),
                ...(data.batch_id ? { batch_id: data.batch_id } : {}),
                title: data.title,
                description: data.description,
                ...(data.priority ? { priority: data.priority } : {}),
                ...(data.assigned_to ? { assigned_to: data.assigned_to } : {}),
                ...(data.due_date ? { due_date: new Date(data.due_date) } : {}),
                raised_by: user.id,
            },
        });
        await this.auditService.log({
            eventType: 'CAPA_CREATED',
            entityType: 'CAPA',
            entityId: capa.id,
            actorId: user.id,
            actorRole: user.role,
            afterState: { capa_code, source: data.source, title: data.title },
        });
        return capa;
    }
    async update(id, user, data) {
        const existing = await this.findOne(id);
        const updateData = {
            ...(data.root_cause !== undefined ? { root_cause: data.root_cause } : {}),
            ...(data.corrective_action !== undefined ? { corrective_action: data.corrective_action } : {}),
            ...(data.preventive_action !== undefined ? { preventive_action: data.preventive_action } : {}),
            ...(data.immediate_action !== undefined ? { immediate_action: data.immediate_action } : {}),
            ...(data.status ? { status: data.status } : {}),
            ...(data.assigned_to !== undefined ? { assigned_to: data.assigned_to } : {}),
            ...(data.due_date ? { due_date: new Date(data.due_date) } : {}),
            ...(data.effectiveness_check !== undefined ? { effectiveness_check: data.effectiveness_check } : {}),
            ...(data.effectiveness_date ? { effectiveness_date: new Date(data.effectiveness_date) } : {}),
        };
        if (data.status === 'EFFECTIVENESS_CHECK' && existing.status !== 'EFFECTIVENESS_CHECK') {
            updateData.completed_at = new Date();
        }
        const updated = await this.prisma.cAPA.update({
            where: { id },
            data: updateData,
        });
        await this.auditService.log({
            eventType: 'CAPA_UPDATED',
            entityType: 'CAPA',
            entityId: id,
            actorId: user.id,
            actorRole: user.role,
            beforeState: { status: existing.status },
            afterState: { ...updateData },
        });
        return updated;
    }
    async close(id, user, data) {
        if (!hasMinRole(user.role, 'QA_MANAGER'))
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can close CAPAs');
        const existing = await this.findOne(id);
        const updated = await this.prisma.cAPA.update({
            where: { id },
            data: {
                status: 'CLOSED',
                closed_by: user.id,
                closed_at: new Date(),
                verified_by: data.verified_by ?? user.id,
                verified_at: new Date(),
                effectiveness_check: data.effectiveness_check,
            },
        });
        await this.auditService.log({
            eventType: 'CAPA_CLOSED',
            entityType: 'CAPA',
            entityId: id,
            actorId: user.id,
            actorRole: user.role,
            beforeState: { status: existing.status },
            afterState: { status: 'CLOSED', closed_by: user.id },
        });
        return updated;
    }
    async findByBatch(batchId) {
        return this.prisma.cAPA.findMany({
            where: { batch_id: batchId },
            orderBy: { raised_at: 'desc' },
        });
    }
    async findByDeviation(deviationId) {
        return this.prisma.cAPA.findMany({
            where: { deviation_id: deviationId },
            orderBy: { raised_at: 'desc' },
        });
    }
    async getDashboard() {
        const [total, open, in_progress, effectiveness_check, closed, overdue] = await Promise.all([
            this.prisma.cAPA.count(),
            this.prisma.cAPA.count({ where: { status: 'OPEN' } }),
            this.prisma.cAPA.count({ where: { status: 'IN_PROGRESS' } }),
            this.prisma.cAPA.count({ where: { status: 'EFFECTIVENESS_CHECK' } }),
            this.prisma.cAPA.count({ where: { status: 'CLOSED' } }),
            this.prisma.cAPA.count({
                where: {
                    due_date: { lt: new Date() },
                    status: { not: 'CLOSED' },
                },
            }),
        ]);
        return {
            total,
            by_status: {
                OPEN: open,
                IN_PROGRESS: in_progress,
                EFFECTIVENESS_CHECK: effectiveness_check,
                CLOSED: closed,
            },
            overdue,
        };
    }
};
exports.CapaService = CapaService;
exports.CapaService = CapaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], CapaService);
//# sourceMappingURL=capa.service.js.map