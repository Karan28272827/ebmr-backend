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
exports.CoaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const ROLE_LEVEL = { BATCH_OPERATOR: 1, SUPERVISOR: 2, LAB_ANALYST: 3, QA_REVIEWER: 4, QA_MANAGER: 5, QUALIFIED_PERSON: 6, SYSTEM_ADMIN: 7 };
function hasMinRole(r, min) { return (ROLE_LEVEL[r] || 0) >= (ROLE_LEVEL[min] || 0); }
let CoaService = class CoaService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAll(productCode) {
        return this.prisma.certificateOfAnalysis.findMany({
            where: productCode ? { batch: { productCode } } : undefined,
            include: { batch: { select: { batchNumber: true, productCode: true, productName: true, state: true } } },
            orderBy: { generated_at: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.certificateOfAnalysis.findUnique({
            where: { id },
            include: { batch: { select: { batchNumber: true, productCode: true, productName: true, batchSize: true, state: true } } },
        });
    }
    async findByBatch(batchId) {
        const coa = await this.prisma.certificateOfAnalysis.findUnique({
            where: { batch_id: batchId },
            include: { batch: { select: { batchNumber: true, productCode: true, productName: true, batchSize: true, state: true } } },
        });
        if (!coa)
            throw new common_1.NotFoundException('CoA not found for this batch');
        return coa;
    }
    async generate(user, data) {
        if (!hasMinRole(user.role, 'QA_MANAGER'))
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can generate CoA');
        const batch = await this.prisma.batch.findUnique({ where: { id: data.batch_id } });
        if (!batch)
            throw new common_1.NotFoundException('Batch not found');
        const existing = await this.prisma.certificateOfAnalysis.findUnique({ where: { batch_id: data.batch_id } });
        if (existing)
            throw new common_1.BadRequestException('CoA already exists for this batch');
        const overall_verdict = data.test_results.every((r) => r.is_within_spec) ? 'PASS' : 'FAIL';
        const coa_number = `COA-${batch.batchNumber}-${new Date().getFullYear()}`;
        const coa = await this.prisma.certificateOfAnalysis.create({
            data: {
                coa_number,
                batch_id: data.batch_id,
                spec_id: data.spec_id || null,
                generated_by: user.id,
                test_results: data.test_results,
                overall_verdict: overall_verdict,
                notes: data.notes || null,
            },
        });
        await this.auditService.log({ eventType: 'COA_GENERATED', entityType: 'CertificateOfAnalysis', entityId: coa.id, actorId: user.id, actorRole: user.role, afterState: { coa_number, overall_verdict }, batchId: data.batch_id });
        return coa;
    }
    async release(id, user) {
        if (!hasMinRole(user.role, 'QUALIFIED_PERSON'))
            throw new common_1.ForbiddenException('Only QUALIFIED_PERSON+ can release CoA');
        const coa = await this.prisma.certificateOfAnalysis.update({
            where: { id },
            data: { release_date: new Date(), released_by: user.id },
        });
        await this.prisma.batch.update({ where: { id: coa.batch_id }, data: { state: 'RELEASED' } });
        await this.auditService.log({ eventType: 'COA_RELEASED', entityType: 'CertificateOfAnalysis', entityId: id, actorId: user.id, actorRole: user.role, afterState: { released_by: user.id } });
        return coa;
    }
};
exports.CoaService = CoaService;
exports.CoaService = CoaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], CoaService);
//# sourceMappingURL=coa.service.js.map