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
exports.ProcessFlowService = void 0;
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
let ProcessFlowService = class ProcessFlowService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAll(productCode) {
        return this.prisma.processFlow.findMany({
            where: productCode ? { product_code: productCode } : {},
            include: { _count: { select: { stages: true, documents: true } } },
            orderBy: { created_at: 'desc' },
        });
    }
    async findOne(id) {
        const pf = await this.prisma.processFlow.findUnique({
            where: { id },
            include: {
                stages: { orderBy: { stage_number: 'asc' } },
                documents: { orderBy: { uploaded_at: 'desc' } },
            },
        });
        if (!pf)
            throw new common_1.NotFoundException('Process flow not found');
        return pf;
    }
    async findByProduct(productCode) {
        return this.prisma.processFlow.findFirst({
            where: { product_code: productCode, status: 'APPROVED' },
            include: {
                stages: { orderBy: { stage_number: 'asc' } },
                documents: true,
            },
        });
    }
    async create(user, data) {
        if (!hasMinRole(user.role, 'QA_MANAGER'))
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can create process flows');
        const count = await this.prisma.processFlow.count();
        const flow_code = data.flow_code || `PF-${String(count + 1).padStart(4, '0')}`;
        const pf = await this.prisma.processFlow.create({
            data: { ...data, flow_code, created_by: user.id, status: 'DRAFT' },
        });
        await this.auditService.log({
            eventType: 'PROCESS_FLOW_CREATED',
            entityType: 'ProcessFlow',
            entityId: pf.id,
            actorId: user.id,
            actorRole: user.role,
            afterState: { flow_code },
        });
        return pf;
    }
    async update(id, user, data) {
        const pf = await this.findOne(id);
        if (pf.status !== 'DRAFT')
            throw new common_1.BadRequestException('Only DRAFT process flows can be edited');
        if (!hasMinRole(user.role, 'QA_MANAGER'))
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can edit process flows');
        return this.prisma.processFlow.update({ where: { id }, data });
    }
    async updateStatus(id, user, status) {
        if (status === 'APPROVED' && !hasMinRole(user.role, 'QA_MANAGER'))
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can approve');
        const updated = await this.prisma.processFlow.update({
            where: { id },
            data: {
                status: status,
                ...(status === 'APPROVED'
                    ? { approved_by: user.id, approved_at: new Date() }
                    : {}),
            },
        });
        await this.auditService.log({
            eventType: 'PROCESS_FLOW_STATUS_CHANGED',
            entityType: 'ProcessFlow',
            entityId: id,
            actorId: user.id,
            actorRole: user.role,
            afterState: { status },
        });
        return updated;
    }
    async addDocument(flowId, user, data) {
        return this.prisma.baselineDocument.create({
            data: { ...data, flow_id: flowId, uploaded_by: user.id },
        });
    }
};
exports.ProcessFlowService = ProcessFlowService;
exports.ProcessFlowService = ProcessFlowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ProcessFlowService);
//# sourceMappingURL=process-flow.service.js.map