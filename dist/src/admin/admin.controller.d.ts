import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    findAllUsers(req: any): Promise<{
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
    createUser(req: any, body: {
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
    updateUser(id: string, req: any, body: {
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
    unlockUser(id: string, req: any): Promise<{
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
    resetPassword(id: string, req: any, body: {
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    getUserActivity(id: string, req: any): Promise<{
        id: string;
        eventType: string;
        entityType: string;
        entityId: string;
        actorRole: string;
        timestamp: Date;
        beforeState: import("@prisma/client/runtime/library").JsonValue | null;
        afterState: import("@prisma/client/runtime/library").JsonValue | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        batchId: string | null;
        actorId: string;
    }[]>;
}
