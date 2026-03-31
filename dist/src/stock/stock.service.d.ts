import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class StockService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    getCurrentStock(materialCode?: string): Promise<{
        material_code: string;
        material_name: string;
        total_qty: number;
        unit: string;
        lots: any[];
    }[]>;
    getLedger(materialCode?: string, limit?: number): Promise<({
        receipt: {
            receipt_code: string;
        };
    } & {
        id: string;
        unit: string;
        material_name: string;
        material_code: string;
        quantity: number;
        expiry_date: Date | null;
        material_id: string | null;
        receipt_id: string | null;
        notes: string | null;
        movement_type: import(".prisma/client").$Enums.StockMovementType;
        balance_after: number;
        lot_number: string | null;
        reference_id: string;
        reference_type: string;
        recorded_by: string;
        recorded_at: Date;
    })[]>;
    recordMovement(user: any, data: {
        material_code: string;
        material_name: string;
        receipt_id?: string;
        material_id?: string;
        movement_type: string;
        quantity: number;
        unit: string;
        lot_number?: string;
        expiry_date?: string;
        reference_id: string;
        reference_type: string;
        notes?: string;
    }): Promise<{
        id: string;
        unit: string;
        material_name: string;
        material_code: string;
        quantity: number;
        expiry_date: Date | null;
        material_id: string | null;
        receipt_id: string | null;
        notes: string | null;
        movement_type: import(".prisma/client").$Enums.StockMovementType;
        balance_after: number;
        lot_number: string | null;
        reference_id: string;
        reference_type: string;
        recorded_by: string;
        recorded_at: Date;
    }>;
    fefoIssue(user: any, data: {
        material_code: string;
        quantity_needed: number;
        unit: string;
        batch_id: string;
        step_number: number;
        notes?: string;
    }): Promise<{
        lots_used: any[];
        total_issued: number;
        shortfall: number;
    }>;
    getExpiryReport(): Promise<any>;
}
