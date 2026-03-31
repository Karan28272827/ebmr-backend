import { RetentionService } from './retention.service';
export declare class RetentionController {
    private retentionService;
    constructor(retentionService: RetentionService);
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
    getExpiring(days?: string): Promise<{
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
    create(req: any, body: any): Promise<{
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
    withdraw(id: string, req: any, body: any): Promise<{
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
}
