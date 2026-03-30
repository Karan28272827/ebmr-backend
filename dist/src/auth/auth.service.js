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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const audit_service_1 = require("../audit/audit.service");
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000;
const PASSWORD_EXPIRY_DAYS = 90;
let AuthService = class AuthService {
    constructor(prisma, usersService, jwtService, auditService) {
        this.prisma = prisma;
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }
    async login(email, password, ipAddress) {
        const user = await this.usersService.findByEmail(email);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.is_active)
            throw new common_1.UnauthorizedException('Account is deactivated');
        if (user.locked_until && user.locked_until > new Date()) {
            const minutesLeft = Math.ceil((user.locked_until.getTime() - Date.now()) / 60000);
            throw new common_1.UnauthorizedException(`Account locked. Try again in ${minutesLeft} minute(s).`);
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
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
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
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
            secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_prod',
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '8h',
        });
        const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } });
        await this.auditService.log({
            eventType: 'USER_LOGIN_SUCCESS',
            entityType: 'User',
            entityId: user.id,
            actorId: user.id,
            actorRole: user.role,
            afterState: { email: user.email, ip: ipAddress },
        });
        let expiry_warning = null;
        if (user.password_changed_at) {
            const daysSinceChange = Math.floor((Date.now() - user.password_changed_at.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceChange >= PASSWORD_EXPIRY_DAYS) {
                expiry_warning = `Your password is ${daysSinceChange} days old. Please change it immediately.`;
            }
            else if (daysSinceChange >= PASSWORD_EXPIRY_DAYS - 10) {
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
    async refresh(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_prod',
            });
            const stored = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
            if (!stored || stored.expiresAt < new Date())
                throw new common_1.UnauthorizedException('Token expired');
            const user = await this.usersService.findById(payload.sub);
            const newPayload = { sub: user.id, email: user.email, role: user.role, name: user.name };
            return { accessToken: this.jwtService.sign(newPayload) };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async verifyPassword(userId, password) {
        const user = await this.usersService.findById(userId);
        if (!user)
            return false;
        return bcrypt.compare(password, user.passwordHash);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService,
        jwt_1.JwtService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map