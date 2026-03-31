import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class AdminService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    findAllUsers(user: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        is_active: boolean;
        force_password_change: boolean;
        password_changed_at: Date;
        locked_until: Date;
        last_login_at: Date;
        createdAt: Date;
    }[]>;
    createUser(requestUser: any, data: {
        email: string;
        name: string;
        role: string;
        password: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    updateUser(requestUser: any, userId: string, data: {
        name?: string;
        role?: string;
        is_active?: boolean;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        is_active: boolean;
    }>;
    unlockUser(requestUser: any, userId: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        is_active: boolean;
        force_password_change: boolean;
        password_changed_at: Date | null;
        password_history: string[];
        failed_login_attempts: number;
        locked_until: Date | null;
        last_failed_login: Date | null;
        last_login_at: Date | null;
        last_login_ip: string | null;
        createdAt: Date;
    }>;
    getUserActivity(requestUser: any, userId: string): Promise<{
        id: string;
        eventType: string;
        entityType: string;
        entityId: string;
        actorRole: string;
        timestamp: Date;
        beforeState: import("@prisma/client/runtime/library").JsonValue | null;
        afterState: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        reason: string | null;
        ip_address: string | null;
        row_hash: string | null;
        prev_hash: string | null;
        batchId: string | null;
        actorId: string;
    }[]>;
    resetPassword(requestUser: any, userId: string, newPassword: string): Promise<{
        message: string;
    }>;
}
