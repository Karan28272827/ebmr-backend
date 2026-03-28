import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
export interface AuditLogInput {
    eventType: string;
    entityType: string;
    entityId: string;
    batchId?: string;
    actorId: string;
    actorRole: string;
    beforeState?: any;
    afterState?: any;
    metadata?: any;
}
export declare class AuditService {
    private prisma;
    private auditQueue;
    constructor(prisma: PrismaService, auditQueue: Queue);
    log(input: AuditLogInput): Promise<void>;
    private writeDirect;
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
        batchId: string | null;
        actorId: string;
    })[]>;
    getAll(filters?: {
        eventType?: string;
        actorId?: string;
    }): Promise<({
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
        batchId: string | null;
        actorId: string;
    })[]>;
}
