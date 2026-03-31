import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getForUser(req: any, unreadOnly?: string): Promise<{
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
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markRead(id: string, req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllRead(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
