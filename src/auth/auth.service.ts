import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_prod', // DEV ONLY
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '8h',
    });

    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } });

    // Log login event — entityType is 'User' so batchId stays null
    await this.auditService.log({
      eventType: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      actorId: user.id,
      actorRole: user.role,
      afterState: { email: user.email },
    });

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
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
