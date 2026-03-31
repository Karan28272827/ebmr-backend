import { AuditService } from './audit.service';
export declare class AuditController {
    private auditService;
    constructor(auditService: AuditService);
    verifyIntegrity(limit?: string): Promise<{
        valid: boolean;
        broken_at?: string;
        checked: number;
    }>;
    getForBatch(batchId: string): Promise<({
        actor: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
    })[]>;
    getAll(eventType?: string): Promise<({
        actor: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
    })[]>;
}
