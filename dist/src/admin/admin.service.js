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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
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
let AdminService = class AdminService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAllUsers(user) {
        if (!hasMinRole(user.role, 'SYSTEM_ADMIN'))
            throw new common_1.ForbiddenException('Only SYSTEM_ADMIN can manage users');
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                is_active: true,
                last_login_at: true,
                password_changed_at: true,
                createdAt: true,
                force_password_change: true,
                locked_until: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createUser(requestUser, data) {
        if (!hasMinRole(requestUser.role, 'SYSTEM_ADMIN'))
            throw new common_1.ForbiddenException('Only SYSTEM_ADMIN can create users');
        const passwordHash = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                role: data.role,
                passwordHash,
                force_password_change: true,
                password_changed_at: new Date(),
                is_active: true,
            },
        });
        await this.auditService.log({
            eventType: 'USER_CREATED',
            entityType: 'User',
            entityId: user.id,
            actorId: requestUser.id,
            actorRole: requestUser.role,
            afterState: { email: user.email, role: user.role },
        });
        return { id: user.id, email: user.email, name: user.name, role: user.role };
    }
    async updateUser(requestUser, userId, data) {
        if (!hasMinRole(requestUser.role, 'SYSTEM_ADMIN'))
            throw new common_1.ForbiddenException('Only SYSTEM_ADMIN can edit users');
        if (userId === requestUser.id && data.is_active === false)
            throw new common_1.BadRequestException('Cannot deactivate yourself');
        const existing = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!existing)
            throw new common_1.NotFoundException('User not found');
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { ...data, role: data.role },
        });
        if (data.is_active === false) {
            await this.prisma.refreshToken.deleteMany({ where: { userId } });
        }
        const eventType = data.role && data.role !== existing.role
            ? 'ROLE_CHANGED'
            : data.is_active === false
                ? 'USER_DEACTIVATED'
                : 'USER_UPDATED';
        await this.auditService.log({
            eventType,
            entityType: 'User',
            entityId: userId,
            actorId: requestUser.id,
            actorRole: requestUser.role,
            beforeState: { role: existing.role, is_active: existing.is_active },
            afterState: data,
        });
        return {
            id: updated.id,
            email: updated.email,
            name: updated.name,
            role: updated.role,
            is_active: updated.is_active,
        };
    }
    async unlockUser(requestUser, userId) {
        if (!hasMinRole(requestUser.role, 'SYSTEM_ADMIN'))
            throw new common_1.ForbiddenException('Only SYSTEM_ADMIN can unlock users');
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { locked_until: null, failed_login_attempts: 0 },
        });
        await this.auditService.log({
            eventType: 'ACCOUNT_UNLOCKED',
            entityType: 'User',
            entityId: userId,
            actorId: requestUser.id,
            actorRole: requestUser.role,
        });
        return updated;
    }
    async getUserActivity(requestUser, userId) {
        if (!hasMinRole(requestUser.role, 'SYSTEM_ADMIN'))
            throw new common_1.ForbiddenException('Only SYSTEM_ADMIN can view user activity');
        return this.prisma.auditLog.findMany({
            where: { actorId: userId },
            orderBy: { timestamp: 'desc' },
            take: 100,
        });
    }
    async resetPassword(requestUser, userId, newPassword) {
        if (!hasMinRole(requestUser.role, 'SYSTEM_ADMIN'))
            throw new common_1.ForbiddenException('Only SYSTEM_ADMIN can reset passwords');
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash, force_password_change: true, password_changed_at: new Date() },
        });
        await this.auditService.log({
            eventType: 'PASSWORD_RESET_REQUESTED',
            entityType: 'User',
            entityId: userId,
            actorId: requestUser.id,
            actorRole: requestUser.role,
        });
        return { message: 'Password reset successfully' };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], AdminService);
//# sourceMappingURL=admin.service.js.map