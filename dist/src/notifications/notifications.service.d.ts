import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getForUser(userId: string, unreadOnly?: boolean): Promise<{
        id: string;
        created_at: Date;
        title: string;
        reference_id: string | null;
        reference_type: string | null;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        is_read: boolean;
        read_at: Date | null;
        user_id: string;
    }[]>;
    getUnreadCount(userId: string): Promise<number>;
    markRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    create(data: {
        user_id: string;
        type: string;
        title: string;
        message: string;
        reference_id?: string;
        reference_type?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        title: string;
        reference_id: string | null;
        reference_type: string | null;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        is_read: boolean;
        read_at: Date | null;
        user_id: string;
    }>;
    createForRole(role: string, data: {
        type: string;
        title: string;
        message: string;
        reference_id?: string;
        reference_type?: string;
    }): Promise<void>;
    createForRoles(roles: string[], data: {
        type: string;
        title: string;
        message: string;
        reference_id?: string;
        reference_type?: string;
    }): Promise<void>;
}
