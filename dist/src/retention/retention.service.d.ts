import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class RetentionService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    findAll(batchId?: string, status?: string): Promise<({
        batch: {
            batchNumber: string;
            productName: string;
            state: import(".prisma/client").$Enums.BatchState;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RetentionStatus;
        unit: string;
        batch_id: string;
        quantity: number;
        product_name: string;
        product_code: string;
        recorded_by: string;
        recorded_at: Date;
        sample_code: string;
        storage_location: string;
        storage_condition: string;
        retain_until: Date;
        withdrawn_by: string | null;
        withdrawn_at: Date | null;
        withdrawn_reason: string | null;
    })[]>;
    findOne(id: string): Promise<{
        batch: {
            batchNumber: string;
            productCode: string;
            productName: string;
            state: import(".prisma/client").$Enums.BatchState;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.RetentionStatus;
        unit: string;
        batch_id: string;
        quantity: number;
        product_name: string;
        product_code: string;
        recorded_by: string;
        recorded_at: Date;
        sample_code: string;
        storage_location: string;
        storage_condition: string;
        retain_until: Date;
        withdrawn_by: string | null;
        withdrawn_at: Date | null;
        withdrawn_reason: string | null;
    }>;
    create(user: any, data: {
        batch_id: string;
        quantity: number;
        unit: string;
        storage_location: string;
        storage_condition: string;
        retain_until: string;
        notes?: string;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.RetentionStatus;
        unit: string;
        batch_id: string;
        quantity: number;
        product_name: string;
        product_code: string;
        recorded_by: string;
        recorded_at: Date;
        sample_code: string;
        storage_location: string;
        storage_condition: string;
        retain_until: Date;
        withdrawn_by: string | null;
        withdrawn_at: Date | null;
        withdrawn_reason: string | null;
    }>;
    withdraw(id: string, user: any, data: {
        reason: string;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.RetentionStatus;
        unit: string;
        batch_id: string;
        quantity: number;
        product_name: string;
        product_code: string;
        recorded_by: string;
        recorded_at: Date;
        sample_code: string;
        storage_location: string;
        storage_condition: string;
        retain_until: Date;
        withdrawn_by: string | null;
        withdrawn_at: Date | null;
        withdrawn_reason: string | null;
    }>;
    getExpiring(days?: number): Promise<{
        days_remaining: number;
        batch: {
            batchNumber: string;
            productName: string;
        };
        id: string;
        status: import(".prisma/client").$Enums.RetentionStatus;
        unit: string;
        batch_id: string;
        quantity: number;
        product_name: string;
        product_code: string;
        recorded_by: string;
        recorded_at: Date;
        sample_code: string;
        storage_location: string;
        storage_condition: string;
        retain_until: Date;
        withdrawn_by: string | null;
        withdrawn_at: Date | null;
        withdrawn_reason: string | null;
    }[]>;
}
