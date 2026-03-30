import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): import(".prisma/client").Prisma.Prisma__UserClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findById(id: string): import(".prisma/client").Prisma.Prisma__UserClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }[]>;
}
