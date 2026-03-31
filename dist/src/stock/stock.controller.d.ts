import { StockService } from './stock.service';
export declare class StockController {
    private stockService;
    constructor(stockService: StockService);
    getCurrentStock(materialCode?: string): Promise<{
        material_code: string;
        material_name: string;
        total_qty: number;
        unit: string;
        lots: any[];
    }[]>;
    getLedger(materialCode?: string, limit?: string): Promise<({
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
    getExpiryReport(): Promise<any>;
    recordMovement(req: any, body: any): Promise<{
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
    fefoIssue(req: any, body: any): Promise<{
        lots_used: any[];
        total_issued: number;
        shortfall: number;
    }>;
}
