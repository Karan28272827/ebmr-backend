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
exports.IssuesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ROLE_LEVEL = {
    BATCH_OPERATOR: 1, SUPERVISOR: 2, QA_REVIEWER: 3, QA_MANAGER: 4, QUALIFIED_PERSON: 5,
};
let IssuesService = class IssuesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(filters) {
        const where = {};
        if (filters?.batchId)
            where.batchId = filters.batchId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.severity)
            where.severity = filters.severity;
        return this.prisma.issue.findMany({
            where,
            orderBy: { raisedAt: 'desc' },
            include: {
                raiser: { select: { name: true, role: true } },
                assignee: { select: { name: true, role: true } },
                batch: { select: { batchNumber: true, productName: true } },
            },
        });
    }
    async findOne(id) {
        const issue = await this.prisma.issue.findUnique({
            where: { id },
            include: {
                raiser: { select: { name: true, email: true, role: true } },
                assignee: { select: { name: true, email: true, role: true } },
                resolver: { select: { name: true, email: true, role: true } },
                batch: { select: { batchNumber: true, productName: true, state: true } },
            },
        });
        if (!issue)
            throw new common_1.NotFoundException('Issue not found');
        return issue;
    }
    create(user, dto) {
        return this.prisma.issue.create({
            data: {
                title: dto.title,
                description: dto.description,
                severity: dto.severity,
                batchId: dto.batchId || null,
                assignedTo: dto.assignedTo || null,
                raisedBy: user.id,
            },
            include: {
                raiser: { select: { name: true, role: true } },
                batch: { select: { batchNumber: true, productName: true } },
            },
        });
    }
    async updateStatus(id, user, status) {
        if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.SUPERVISOR)
            throw new common_1.ForbiddenException('Only SUPERVISOR+ can update issue status');
        await this.findOne(id);
        return this.prisma.issue.update({
            where: { id },
            data: { status: status },
            include: { raiser: { select: { name: true, role: true } } },
        });
    }
    async resolve(id, user, resolution) {
        if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.SUPERVISOR)
            throw new common_1.ForbiddenException('Only SUPERVISOR+ can resolve issues');
        if (!resolution?.trim())
            throw new common_1.BadRequestException('Resolution notes are required');
        const issue = await this.findOne(id);
        if (issue.status === 'CLOSED')
            throw new common_1.BadRequestException('Issue already closed');
        return this.prisma.issue.update({
            where: { id },
            data: { status: 'RESOLVED', resolution, resolvedBy: user.id, resolvedAt: new Date() },
            include: {
                raiser: { select: { name: true, role: true } },
                resolver: { select: { name: true, role: true } },
            },
        });
    }
    async close(id, user) {
        if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.QA_REVIEWER)
            throw new common_1.ForbiddenException('Only QA_REVIEWER+ can close issues');
        const issue = await this.findOne(id);
        if (issue.status !== 'RESOLVED')
            throw new common_1.BadRequestException('Issue must be RESOLVED before closing');
        return this.prisma.issue.update({ where: { id }, data: { status: 'CLOSED' } });
    }
};
exports.IssuesService = IssuesService;
exports.IssuesService = IssuesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IssuesService);
//# sourceMappingURL=issues.service.js.map