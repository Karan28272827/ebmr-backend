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
exports.SopService = void 0;
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
let SopService = class SopService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAll(status, productCategory) {
        return this.prisma.sOP.findMany({
            where: {
                ...(status ? { status: status } : {}),
                ...(productCategory ? { product_category: productCategory } : {}),
            },
            include: {
                _count: { select: { sections: true, qc_parameter_sets: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async findOne(id) {
        const sop = await this.prisma.sOP.findUnique({
            where: { id },
            include: {
                sections: { orderBy: { section_no: 'asc' } },
                qc_parameter_sets: {
                    include: {
                        parameters: { orderBy: { display_order: 'asc' } },
                    },
                },
            },
        });
        if (!sop)
            throw new common_1.NotFoundException('SOP not found');
        return sop;
    }
    async create(user, data) {
        if (!hasMinRole(user.role, 'QA_MANAGER')) {
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can create SOPs');
        }
        const sopCount = await this.prisma.sOP.count();
        const sop_code = data.sop_code || `SOP-${String(sopCount + 1).padStart(4, '0')}`;
        const sop = await this.prisma.sOP.create({
            data: { ...data, sop_code, created_by: user.id, status: 'DRAFT' },
        });
        await this.auditService.log({
            eventType: 'SOP_CREATED',
            entityType: 'SOP',
            entityId: sop.id,
            actorId: user.id,
            actorRole: user.role,
            afterState: { sop_code, title: sop.title },
        });
        return sop;
    }
    async updateStatus(id, user, status, signature) {
        const sop = await this.findOne(id);
        if (['APPROVED'].includes(status) && !hasMinRole(user.role, 'QA_MANAGER')) {
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can approve SOPs');
        }
        if (sop.status === 'APPROVED' && status !== 'RETIRED') {
            throw new common_1.BadRequestException('Approved SOP cannot be edited — create a new version');
        }
        const updated = await this.prisma.sOP.update({
            where: { id },
            data: {
                status: status,
                ...(status === 'APPROVED'
                    ? { approved_by: user.id, approved_at: new Date() }
                    : {}),
            },
        });
        await this.auditService.log({
            eventType: 'SOP_STATUS_CHANGED',
            entityType: 'SOP',
            entityId: id,
            actorId: user.id,
            actorRole: user.role,
            beforeState: { status: sop.status },
            afterState: { status },
        });
        return updated;
    }
    async addSection(sopId, user, data) {
        const sop = await this.findOne(sopId);
        if (sop.status === 'APPROVED') {
            throw new common_1.BadRequestException('Cannot edit an APPROVED SOP');
        }
        if (!hasMinRole(user.role, 'QA_MANAGER')) {
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can edit SOPs');
        }
        return this.prisma.sOPSection.create({ data: { ...data, sop_id: sopId } });
    }
    async addQCParameterSet(sopId, user, data) {
        const sop = await this.findOne(sopId);
        if (sop.status === 'APPROVED') {
            throw new common_1.BadRequestException('Cannot edit an APPROVED SOP');
        }
        if (!hasMinRole(user.role, 'QA_MANAGER')) {
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can edit SOPs');
        }
        const paramSet = await this.prisma.qCParameterSet.create({
            data: { sop_id: sopId, name: data.name, qc_stage: data.qc_stage },
        });
        if (data.parameters?.length) {
            await this.prisma.qCParameter.createMany({
                data: data.parameters.map((p, i) => ({
                    ...p,
                    parameter_set_id: paramSet.id,
                    display_order: p.display_order ?? i,
                })),
            });
        }
        return this.prisma.qCParameterSet.findUnique({
            where: { id: paramSet.id },
            include: { parameters: true },
        });
    }
    async getQCParameters(sopId) {
        return this.prisma.qCParameterSet.findMany({
            where: { sop_id: sopId },
            include: { parameters: { orderBy: { display_order: 'asc' } } },
        });
    }
    async findByBom(bomId) {
        return this.prisma.bOMSOPLink.findMany({
            where: { bom_id: bomId },
            include: {
                sop: {
                    include: {
                        qc_parameter_sets: { include: { parameters: true } },
                    },
                },
            },
        });
    }
    async clone(id, user) {
        if (!hasMinRole(user.role, 'QA_MANAGER')) {
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can clone SOPs');
        }
        const original = await this.findOne(id);
        const versionNum = parseFloat(original.version.replace('v', '')) + 0.1;
        const newVersion = `v${versionNum.toFixed(1)}`;
        const newSop = await this.prisma.sOP.create({
            data: {
                sop_code: `${original.sop_code}-R${Date.now()}`.substring(0, 50),
                title: original.title,
                version: newVersion,
                product_category: original.product_category,
                status: 'DRAFT',
                created_by: user.id,
            },
        });
        for (const section of original.sections) {
            await this.prisma.sOPSection.create({
                data: {
                    sop_id: newSop.id,
                    section_no: section.section_no,
                    title: section.title,
                    content: section.content,
                    is_critical: section.is_critical,
                },
            });
        }
        await this.auditService.log({
            eventType: 'SOP_CLONED',
            entityType: 'SOP',
            entityId: newSop.id,
            actorId: user.id,
            actorRole: user.role,
            afterState: { cloned_from: id, version: newVersion },
        });
        return newSop;
    }
};
exports.SopService = SopService;
exports.SopService = SopService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], SopService);
//# sourceMappingURL=sop.service.js.map