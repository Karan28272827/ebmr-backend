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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditService = class AuditService {
    constructor(prisma, auditQueue) {
        this.prisma = prisma;
        this.auditQueue = auditQueue;
    }
    async log(input) {
        await this.writeDirect(input);
        this.auditQueue.add('log', input, { removeOnComplete: true }).catch(() => { });
    }
    async writeDirect(input) {
        const batchId = input.entityType === 'Batch' ? input.entityId : (input.batchId ?? null);
        return this.prisma.auditLog.create({
            data: {
                eventType: input.eventType,
                entityType: input.entityType,
                entityId: input.entityId,
                batchId,
                actorId: input.actorId,
                actorRole: input.actorRole,
                beforeState: input.beforeState ?? null,
                afterState: input.afterState ?? null,
                metadata: input.metadata ?? null,
            },
        });
    }
    async getForBatch(batchId) {
        return this.prisma.auditLog.findMany({
            where: { batchId },
            orderBy: { timestamp: 'asc' },
            include: { actor: { select: { name: true, email: true, role: true } } },
        });
    }
    async getAll(filters) {
        return this.prisma.auditLog.findMany({
            where: filters,
            orderBy: { timestamp: 'desc' },
            take: 500,
            include: { actor: { select: { name: true, email: true, role: true } } },
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)('audit')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], AuditService);
//# sourceMappingURL=audit.service.js.map