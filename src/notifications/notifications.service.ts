import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getForUser(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: { user_id: userId, ...(unreadOnly ? { is_read: false } : {}) },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { user_id: userId, is_read: false } });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({ where: { id, user_id: userId }, data: { is_read: true, read_at: new Date() } });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({ where: { user_id: userId, is_read: false }, data: { is_read: true, read_at: new Date() } });
  }

  async create(data: { user_id: string; type: string; title: string; message: string; reference_id?: string; reference_type?: string }) {
    return this.prisma.notification.create({ data: data as any });
  }

  async createForRole(role: string, data: { type: string; title: string; message: string; reference_id?: string; reference_type?: string }) {
    const users = await this.prisma.user.findMany({ where: { role: role as any, is_active: true } });
    const records = users.map(u => ({ user_id: u.id, type: data.type as any, title: data.title, message: data.message, reference_id: data.reference_id || null, reference_type: data.reference_type || null }));
    if (records.length > 0) await this.prisma.notification.createMany({ data: records });
  }

  async createForRoles(roles: string[], data: { type: string; title: string; message: string; reference_id?: string; reference_type?: string }) {
    const users = await this.prisma.user.findMany({ where: { role: { in: roles as any[] }, is_active: true } });
    const records = users.map(u => ({ user_id: u.id, type: data.type as any, title: data.title, message: data.message, reference_id: data.reference_id || null, reference_type: data.reference_type || null }));
    if (records.length > 0) await this.prisma.notification.createMany({ data: records });
  }
}
