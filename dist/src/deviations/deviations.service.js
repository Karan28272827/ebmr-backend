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
exports.DeviationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const ROLE_LEVEL = {
    BATCH_OPERATOR: 1, SUPERVISOR: 2, QA_REVIEWER: 3, QA_MANAGER: 4, QUALIFIED_PERSON: 5,
};
let DeviationsService = class DeviationsService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async create(data) {
        const deviation = await this.prisma.deviation.create({
            data: {
                batchId: data.batchId,
                stepNumber: data.stepNumber,
                fieldName: data.fieldName,
                expectedRange: data.expectedRange,
                actualValue: data.actualValue,
                raisedBy: data.raisedBy,
                status: 'OPEN',
            },
        });
        if (data.raisedByUser) {
            await this.auditService.log({
                eventType: 'DEVIATION_RAISED',
                entityType: 'Batch',
                entityId: data.batchId,
                actorId: data.raisedBy,
                actorRole: data.raisedByUser.role,
                afterState: { deviationId: deviation.id, fieldName: data.fieldName, actualValue: data.actualValue, expectedRange: data.expectedRange },
            });
        }
        return deviation;
    }
    async manualCreate(user, body) {
        if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.QA_REVIEWER)
            throw new common_1.ForbiddenException('Only QA_REVIEWER+ can manually raise deviations');
        return this.create({ ...body, raisedBy: user.id, raisedByUser: user });
    }
    async findAll(filters) {
        return this.prisma.deviation.findMany({
            where: filters,
            orderBy: { raisedAt: 'desc' },
            include: { raiser: { select: { name: true, email: true, role: true } }, batch: { select: { batchNumber: true, productName: true } } },
        });
    }
    async findOne(id) {
        const dev = await this.prisma.deviation.findUnique({
            where: { id },
            include: { raiser: { select: { name: true, email: true, role: true } }, batch: { select: { batchNumber: true, productName: true, state: true } } },
        });
        if (!dev)
            throw new common_1.NotFoundException('Deviation not found');
        return dev;
    }
    async close(id, user, resolutionNotes) {
        if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.QA_REVIEWER)
            throw new common_1.ForbiddenException('Only QA_REVIEWER+ can close deviations');
        if (!resolutionNotes?.trim())
            throw new common_1.BadRequestException('Resolution notes are required');
        const dev = await this.findOne(id);
        if (dev.status === 'CLOSED')
            throw new common_1.BadRequestException('Deviation already closed');
        const updated = await this.prisma.deviation.update({
            where: { id },
            data: { status: 'CLOSED', resolutionNotes, closedBy: user.id, closedAt: new Date() },
        });
        await this.auditService.log({
            eventType: 'DEVIATION_CLOSED',
            entityType: 'Batch',
            entityId: dev.batchId,
            actorId: user.id,
            actorRole: user.role,
            beforeState: { status: 'OPEN' },
            afterState: { status: 'CLOSED', resolutionNotes },
        });
        return updated;
    }
    async updateStatus(id, user, status) {
        if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.QA_REVIEWER)
            throw new common_1.ForbiddenException('Only QA_REVIEWER+ can update deviation status');
        const dev = await this.findOne(id);
        const updated = await this.prisma.deviation.update({ where: { id }, data: { status: status } });
        await this.auditService.log({
            eventType: 'DEVIATION_STATUS_CHANGED',
            entityType: 'Batch',
            entityId: dev.batchId,
            actorId: user.id,
            actorRole: user.role,
            beforeState: { status: dev.status },
            afterState: { status },
        });
        return updated;
    }
};
exports.DeviationsService = DeviationsService;
exports.DeviationsService = DeviationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, audit_service_1.AuditService])
], DeviationsService);
//# sourceMappingURL=deviations.service.js.map