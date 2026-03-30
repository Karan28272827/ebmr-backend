import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const PASSWORD_EXPIRY_DAYS = 90;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async login(email: string, password: string, ipAddress?: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Check if account is active
    if (!user.is_active) throw new UnauthorizedException('Account is deactivated');

    // Check if account is locked
    if (user.locked_until && user.locked_until > new Date()) {
      const minutesLeft = Math.ceil((user.locked_until.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Account locked. Try again in ${minutesLeft} minute(s).`,
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      // Increment failed attempts
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;
      const lockedUntil = shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failed_login_attempts: newAttempts,
          last_failed_login: new Date(),
          ...(shouldLock ? { locked_until: lockedUntil } : {}),
        },
      });

      if (shouldLock) {
        await this.auditService.log({
          eventType: 'ACCOUNT_LOCKED',
          entityType: 'User',
          entityId: user.id,
          actorId: user.id,
          actorRole: user.role,
          afterState: { reason: 'Too many failed login attempts', locked_until: lockedUntil },
        });
      }

      await this.auditService.log({
        eventType: 'USER_LOGIN_FAILURE',
        entityType: 'User',
        entityId: user.id,
        actorId: user.id,
        actorRole: user.role,
        afterState: { email: user.email, failed_attempts: newAttempts, ip: ipAddress },
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Success — reset failed attempts and update last login
    const now = new Date();
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: now,
        last_login_ip: ipAddress || null,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_prod', // DEV ONLY
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '8h',
    });

    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } });

    // Log login success
    await this.auditService.log({
      eventType: 'USER_LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { email: user.email, ip: ipAddress },
    });

    // Check password expiry (warn if > 90 days since last change)
    let expiry_warning: string | null = null;
    if (user.password_changed_at) {
      const daysSinceChange = Math.floor(
        (Date.now() - user.password_changed_at.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceChange >= PASSWORD_EXPIRY_DAYS) {
        expiry_warning = `Your password is ${daysSinceChange} days old. Please change it immediately.`;
      } else if (daysSinceChange >= PASSWORD_EXPIRY_DAYS - 10) {
        const daysLeft = PASSWORD_EXPIRY_DAYS - daysSinceChange;
        expiry_warning = `Your password will expire in ${daysLeft} day(s). Please change it soon.`;
      }
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        force_password_change: user.force_password_change,
      },
      ...(expiry_warning ? { expiry_warning } : {}),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_prod', // DEV ONLY
      });

      const stored = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      if (!stored || stored.expiresAt < new Date()) throw new UnauthorizedException('Token expired');

      const user = await this.usersService.findById(payload.sub);
      const newPayload = { sub: user.id, email: user.email, role: user.role, name: user.name };
      return { accessToken: this.jwtService.sign(newPayload) };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user) return false;
    return bcrypt.compare(password, user.passwordHash);
  }
}
