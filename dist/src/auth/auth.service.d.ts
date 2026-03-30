import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
export declare class AuthService {
    private prisma;
    private usersService;
    private jwtService;
    private auditService;
    constructor(prisma: PrismaService, usersService: UsersService, jwtService: JwtService, auditService: AuditService);
    login(email: string, password: string, ipAddress?: string): Promise<{
        expiry_warning?: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            force_password_change: boolean;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    verifyPassword(userId: string, password: string): Promise<boolean>;
}
