import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const ROLE_LEVEL: Record<string, number> = {
  BATCH_OPERATOR: 1,
  SUPERVISOR: 2,
  LAB_ANALYST: 3,
  QA_REVIEWER: 4,
  QA_MANAGER: 5,
  QUALIFIED_PERSON: 6,
  SYSTEM_ADMIN: 7,
};

function hasMinRole(userRole: string, minRole: string): boolean {
  return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minRole] || 0);
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAllUsers(user: any) {
    if (!hasMinRole(user.role, 'SYSTEM_ADMIN'))
      throw new ForbiddenException('Only SYSTEM_ADMIN can manage users');
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

  async createUser(
    requestUser: any,
    data: { email: string; name: string; role: string; password: string },
  ) {
    if (!hasMinRole(requestUser.role, 'SYSTEM_ADMIN'))
      throw new ForbiddenException('Only SYSTEM_ADMIN can create users');

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role as any,
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

  async updateUser(
    requestUser: any,
    userId: string,
    data: { name?: string; role?: string; is_active?: boolean },
  ) {
    if (!hasMinRole(requestUser.role, 'SYSTEM_ADMIN'))
      throw new ForbiddenException('Only SYSTEM_ADMIN can edit users');
    if (userId === requestUser.id && data.is_active === false)
      throw new BadRequestException('Cannot deactivate yourself');

    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { ...data, role: data.role as any },
    });

    if (data.is_active === false) {
      // Invalidate all refresh tokens
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }

    const eventType =
      data.role && data.role !== existing.role
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

  async unlockUser(requestUser: any, userId: string) {
    if (!hasMinRole(requestUser.role, 'SYSTEM_ADMIN'))
      throw new ForbiddenException('Only SYSTEM_ADMIN can unlock users');
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

  async getUserActivity(requestUser: any, userId: string) {
    if (!hasMinRole(requestUser.role, 'SYSTEM_ADMIN'))
      throw new ForbiddenException('Only SYSTEM_ADMIN can view user activity');
    return this.prisma.auditLog.findMany({
      where: { actorId: userId },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  }

  async resetPassword(requestUser: any, userId: string, newPassword: string) {
    if (!hasMinRole(requestUser.role, 'SYSTEM_ADMIN'))
      throw new ForbiddenException('Only SYSTEM_ADMIN can reset passwords');
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
}
