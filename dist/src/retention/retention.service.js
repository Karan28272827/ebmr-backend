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
exports.RetentionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const ROLE_LEVEL = { BATCH_OPERATOR: 1, SUPERVISOR: 2, LAB_ANALYST: 3, QA_REVIEWER: 4, QA_MANAGER: 5, QUALIFIED_PERSON: 6, SYSTEM_ADMIN: 7 };
function hasMinRole(r, min) { return (ROLE_LEVEL[r] || 0) >= (ROLE_LEVEL[min] || 0); }
let RetentionService = class RetentionService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAll(batchId, status) {
        return this.prisma.retentionSample.findMany({
            where: {
                ...(batchId ? { batch_id: batchId } : {}),
                ...(status ? { status: status } : {}),
            },
            include: { batch: { select: { batchNumber: true, productName: true, state: true } } },
            orderBy: { recorded_at: 'desc' },
        });
    }
    async findOne(id) {
        const sample = await this.prisma.retentionSample.findUnique({
            where: { id },
            include: { batch: { select: { batchNumber: true, productName: true, productCode: true, state: true } } },
        });
        if (!sample)
            throw new common_1.NotFoundException('Retention sample not found');
        return sample;
    }
    async create(user, data) {
        const batch = await this.prisma.batch.findUnique({ where: { id: data.batch_id } });
        if (!batch)
            throw new common_1.NotFoundException('Batch not found');
        const sample_code = `RS-${batch.batchNumber}-${Date.now().toString().slice(-4)}`;
        const sample = await this.prisma.retentionSample.create({
            data: {
                sample_code,
                batch_id: data.batch_id,
                product_code: batch.productCode,
                product_name: batch.productName,
                quantity: data.quantity,
                unit: data.unit,
                storage_location: data.storage_location,
                storage_condition: data.storage_condition,
                retain_until: new Date(data.retain_until),
                recorded_by: user.id,
            },
        });
        await this.auditService.log({ eventType: 'RETENTION_SAMPLE_RECORDED', entityType: 'RetentionSample', entityId: sample.id, actorId: user.id, actorRole: user.role, afterState: { sample_code, batch_id: data.batch_id } });
        return sample;
    }
    async withdraw(id, user, data) {
        if (!hasMinRole(user.role, 'QA_MANAGER'))
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can withdraw retention samples');
        const sample = await this.prisma.retentionSample.update({
            where: { id },
            data: { status: 'WITHDRAWN', withdrawn_by: user.id, withdrawn_at: new Date(), withdrawn_reason: data.reason },
        });
        await this.auditService.log({ eventType: 'RETENTION_SAMPLE_WITHDRAWN', entityType: 'RetentionSample', entityId: id, actorId: user.id, actorRole: user.role, afterState: { reason: data.reason } });
        return sample;
    }
    async getExpiring(days = 30) {
        const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        const samples = await this.prisma.retentionSample.findMany({
            where: { status: 'IN_STORAGE', retain_until: { lte: cutoff } },
            include: { batch: { select: { batchNumber: true, productName: true } } },
            orderBy: { retain_until: 'asc' },
        });
        return samples.map(s => ({
            ...s,
            days_remaining: Math.ceil((s.retain_until.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        }));
    }
};
exports.RetentionService = RetentionService;
exports.RetentionService = RetentionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], RetentionService);
//# sourceMappingURL=retention.service.js.map