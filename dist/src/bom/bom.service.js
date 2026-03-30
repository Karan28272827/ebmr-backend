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
const ROLE_LEVEL = {
    BATCH_OPERATOR: 1, SUPERVISOR: 2, QA_REVIEWER: 3, QA_MANAGER: 4, QUALIFIED_PERSON: 5,
};
let BomService = class BomService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTemplateBoM(templateId) {
        const template = await this.prisma.batchTemplate.findUnique({ where: { id: templateId } });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return this.prisma.bomItem.findMany({
            where: { templateId },
            include: { material: true },
            orderBy: { material: { materialCode: 'asc' } },
        });
    }
    async addItem(user, templateId, dto) {
        if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.SUPERVISOR)
            throw new common_1.ForbiddenException('Only SUPERVISOR+ can manage BoM');
        const template = await this.prisma.batchTemplate.findUnique({ where: { id: templateId } });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return this.prisma.bomItem.create({ data: { templateId, ...dto }, include: { material: true } });
    }
    async removeItem(user, itemId) {
        if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.SUPERVISOR)
            throw new common_1.ForbiddenException('Only SUPERVISOR+ can manage BoM');
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
                status: totalIssued >= requiredQty ? 'ISSUED' : issued.length > 0 ? 'PARTIAL' : 'PENDING',
            };
        });
    }
};
exports.BomService = BomService;
exports.BomService = BomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BomService);
//# sourceMappingURL=bom.service.js.map