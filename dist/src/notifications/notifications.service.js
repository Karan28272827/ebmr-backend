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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getForUser(userId, unreadOnly = false) {
        return this.prisma.notification.findMany({
            where: { user_id: userId, ...(unreadOnly ? { is_read: false } : {}) },
            orderBy: { created_at: 'desc' },
            take: 50,
        });
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({ where: { user_id: userId, is_read: false } });
    }
    async markRead(id, userId) {
        return this.prisma.notification.updateMany({ where: { id, user_id: userId }, data: { is_read: true, read_at: new Date() } });
    }
    async markAllRead(userId) {
        return this.prisma.notification.updateMany({ where: { user_id: userId, is_read: false }, data: { is_read: true, read_at: new Date() } });
    }
    async create(data) {
        return this.prisma.notification.create({ data: data });
    }
    async createForRole(role, data) {
        const users = await this.prisma.user.findMany({ where: { role: role, is_active: true } });
        const records = users.map(u => ({ user_id: u.id, type: data.type, title: data.title, message: data.message, reference_id: data.reference_id || null, reference_type: data.reference_type || null }));
        if (records.length > 0)
            await this.prisma.notification.createMany({ data: records });
    }
    async createForRoles(roles, data) {
        const users = await this.prisma.user.findMany({ where: { role: { in: roles }, is_active: true } });
        const records = users.map(u => ({ user_id: u.id, type: data.type, title: data.title, message: data.message, reference_id: data.reference_id || null, reference_type: data.reference_type || null }));
        if (records.length > 0)
            await this.prisma.notification.createMany({ data: records });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map