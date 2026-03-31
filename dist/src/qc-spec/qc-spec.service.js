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
exports.QcSpecService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const ROLE_LEVEL = { BATCH_OPERATOR: 1, SUPERVISOR: 2, LAB_ANALYST: 3, QA_REVIEWER: 4, QA_MANAGER: 5, QUALIFIED_PERSON: 6, SYSTEM_ADMIN: 7 };
function hasMinRole(userRole, minRole) { return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minRole] || 0); }
let QcSpecService = class QcSpecService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAll(productCode, status) {
        return this.prisma.qCSpecification.findMany({
            where: {
                ...(productCode ? { product_code: productCode } : {}),
                ...(status ? { status: status } : {}),
            },
            include: { _count: { select: { parameters: true } } },
            orderBy: { created_at: 'desc' },
        });
    }
    async findOne(id) {
        const spec = await this.prisma.qCSpecification.findUnique({ where: { id }, include: { parameters: { orderBy: { display_order: 'asc' } } } });
        if (!spec)
            throw new common_1.NotFoundException('QC Specification not found');
        return spec;
    }
    async findByProduct(productCode) {
        return this.prisma.qCSpecification.findMany({ where: { product_code: productCode }, include: { parameters: { orderBy: { display_order: 'asc' } } } });
    }
    async create(user, data) {
        const { parameters, ...specData } = data;
        const spec_code = specData.spec_code || `QCS-${specData.product_code}-${specData.version}`;
        const spec = await this.prisma.qCSpecification.create({ data: { ...specData, spec_code, created_by: user.id } });
        if (parameters && parameters.length > 0) {
            for (const p of parameters) {
                await this.prisma.qCSpecParameter.create({ data: { spec_id: spec.id, ...p } });
            }
        }
        await this.auditService.log({ eventType: 'QC_SPEC_CREATED', entityType: 'QCSpecification', entityId: spec.id, actorId: user.id, actorRole: user.role, afterState: { spec_code } });
        return this.findOne(spec.id);
    }
    async approve(id, user) {
        if (!hasMinRole(user.role, 'QA_MANAGER'))
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can approve QC specifications');
        const spec = await this.prisma.qCSpecification.update({ where: { id }, data: { status: 'APPROVED', approved_by: user.id, approved_at: new Date() } });
        await this.auditService.log({ eventType: 'QC_SPEC_APPROVED', entityType: 'QCSpecification', entityId: id, actorId: user.id, actorRole: user.role });
        return spec;
    }
    async addParameter(specId, user, data) {
        const param = await this.prisma.qCSpecParameter.create({ data: { spec_id: specId, ...data } });
        await this.auditService.log({ eventType: 'QC_SPEC_PARAMETER_ADDED', entityType: 'QCSpecification', entityId: specId, actorId: user.id, actorRole: user.role, afterState: { param_code: data.param_code } });
        return param;
    }
    async updateParameter(paramId, user, data) {
        const param = await this.prisma.qCSpecParameter.update({ where: { id: paramId }, data });
        await this.auditService.log({ eventType: 'QC_SPEC_PARAMETER_UPDATED', entityType: 'QCSpecParameter', entityId: paramId, actorId: user.id, actorRole: user.role, afterState: data });
        return param;
    }
};
exports.QcSpecService = QcSpecService;
exports.QcSpecService = QcSpecService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], QcSpecService);
//# sourceMappingURL=qc-spec.service.js.map