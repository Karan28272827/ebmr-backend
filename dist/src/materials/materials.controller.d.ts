import { MaterialsService } from './materials.service';
export declare class MaterialsController {
    private svc;
    constructor(svc: MaterialsService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        materialCode: string;
        materialName: string;
        unit: string;
        description: string | null;
    }[]>;
    findByBarcode(code: string): Promise<{
        id: string;
        createdAt: Date;
        materialCode: string;
        materialName: string;
        unit: string;
        description: string | null;
    }>;
    getStock(): Promise<any[]>;
    getExpiryAlerts(level?: string, materialCode?: string): Promise<{
        id: string;
        unit: string;
        material_name: string;
        material_code: string;
        quantity: number;
        created_at: Date;
        expiry_date: Date;
        receipt_id: string;
        days_to_expiry: number;
        alert_level: import(".prisma/client").$Enums.AlertLevel;
        is_acknowledged: boolean;
        acknowledged_by: string | null;
    }[]>;
    acknowledgeAlert(id: string, req: any): Promise<{
        id: string;
        unit: string;
        material_name: string;
        material_code: string;
        quantity: number;
        created_at: Date;
        expiry_date: Date;
        receipt_id: string;
        days_to_expiry: number;
        alert_level: import(".prisma/client").$Enums.AlertLevel;
        is_acknowledged: boolean;
        acknowledged_by: string | null;
    }>;
    createIntent(req: any, body: any): Promise<{
        id: string;
        reason: string;
        status: import(".prisma/client").$Enums.IntentStatus;
        unit: string;
        intent_code: string;
        material_name: string;
        material_code: string;
        quantity_needed: number;
        needed_by_date: Date;
        batch_id: string | null;
        raised_by: string;
        raised_at: Date;
    }>;
    findAllIntents(status?: string, materialCode?: string): Promise<({
        _count: {
            purchase_orders: number;
        };
    } & {
        id: string;
        reason: string;
        status: import(".prisma/client").$Enums.IntentStatus;
        unit: string;
        intent_code: string;
        material_name: string;
        material_code: string;
        quantity_needed: number;
        needed_by_date: Date;
        batch_id: string | null;
        raised_by: string;
        raised_at: Date;
    })[]>;
    createPO(req: any, body: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.POStatus;
        unit: string;
        material_name: string;
        material_code: string;
        po_number: string;
        supplier_name: string;
        supplier_code: string;
        quantity: number;
        unit_price: number;
        total_value: number;
        currency: string;
        expected_delivery: Date;
        created_by: string;
        created_at: Date;
        intent_id: string;
        vendor_id: string | null;
    }>;
    findAllPOs(status?: string): Promise<({
        _count: {
            receipts: number;
        };
        intent: {
            id: string;
            reason: string;
            status: import(".prisma/client").$Enums.IntentStatus;
            unit: string;
            intent_code: string;
            material_name: string;
            material_code: string;
            quantity_needed: number;
            needed_by_date: Date;
            batch_id: string | null;
            raised_by: string;
            raised_at: Date;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.POStatus;
        unit: string;
        material_name: string;
        material_code: string;
        po_number: string;
        supplier_name: string;
        supplier_code: string;
        quantity: number;
        unit_price: number;
        total_value: number;
        currency: string;
        expected_delivery: Date;
        created_by: string;
        created_at: Date;
        intent_id: string;
        vendor_id: string | null;
    })[]>;
    createReceipt(req: any, body: any): Promise<{
        id: string;
        unit: string;
        receipt_code: string;
        received_qty: number;
        received_by: string;
        received_at: Date;
        supplier_batch_no: string;
        manufacture_date: Date;
        expiry_date: Date;
        coa_reference: string | null;
        qc_status: import(".prisma/client").$Enums.QCReceiptStatus;
        store_location: string | null;
        po_id: string;
        material_id: string | null;
        grn_id: string | null;
    }>;
    findAllReceipts(qcStatus?: string, expiryBefore?: string): Promise<({
        _count: {
            qc_tests: number;
        };
        po: {
            po_number: string;
            supplier_name: string;
        };
    } & {
        id: string;
        unit: string;
        receipt_code: string;
        received_qty: number;
        received_by: string;
        received_at: Date;
        supplier_batch_no: string;
        manufacture_date: Date;
        expiry_date: Date;
        coa_reference: string | null;
        qc_status: import(".prisma/client").$Enums.QCReceiptStatus;
        store_location: string | null;
        po_id: string;
        material_id: string | null;
        grn_id: string | null;
    })[]>;
    getExpiring(days?: string): Promise<({
        po: {
            material_name: string;
            supplier_name: string;
        };
    } & {
        id: string;
        unit: string;
        receipt_code: string;
        received_qty: number;
        received_by: string;
        received_at: Date;
        supplier_batch_no: string;
        manufacture_date: Date;
        expiry_date: Date;
        coa_reference: string | null;
        qc_status: import(".prisma/client").$Enums.QCReceiptStatus;
        store_location: string | null;
        po_id: string;
        material_id: string | null;
        grn_id: string | null;
    })[]>;
    findReceiptById(id: string): Promise<{
        po: {
            id: string;
            status: import(".prisma/client").$Enums.POStatus;
            unit: string;
            material_name: string;
            material_code: string;
            po_number: string;
            supplier_name: string;
            supplier_code: string;
            quantity: number;
            unit_price: number;
            total_value: number;
            currency: string;
            expected_delivery: Date;
            created_by: string;
            created_at: Date;
            intent_id: string;
            vendor_id: string | null;
        };
        grn: {
            id: string;
            raised_by: string;
            raised_at: Date;
            po_id: string;
            grn_number: string;
            accounts_status: import(".prisma/client").$Enums.AccountsStatus;
            invoice_ref: string | null;
            payment_due: Date | null;
            payment_done: boolean;
        };
        qc_tests: {
            id: string;
            status: import(".prisma/client").$Enums.QCTestStatus;
            step_number: number | null;
            completed_by: string | null;
            completed_at: Date | null;
            batch_id: string | null;
            test_code: string;
            qc_stage: import(".prisma/client").$Enums.QCStage;
            assigned_to: string | null;
            initiated_by: string;
            initiated_at: Date;
            overall_verdict: import(".prisma/client").$Enums.QCVerdict | null;
            verdict_notes: string | null;
            verdict_by: string | null;
            verdict_at: Date | null;
            material_receipt_id: string | null;
        }[];
    } & {
        id: string;
        unit: string;
        receipt_code: string;
        received_qty: number;
        received_by: string;
        received_at: Date;
        supplier_batch_no: string;
        manufacture_date: Date;
        expiry_date: Date;
        coa_reference: string | null;
        qc_status: import(".prisma/client").$Enums.QCReceiptStatus;
        store_location: string | null;
        po_id: string;
        material_id: string | null;
        grn_id: string | null;
    }>;
    createGRN(req: any, body: {
        po_id: string;
        receipt_ids: string[];
        invoice_ref?: string;
        payment_due?: string;
    }): Promise<{
        id: string;
        raised_by: string;
        raised_at: Date;
        po_id: string;
        grn_number: string;
        accounts_status: import(".prisma/client").$Enums.AccountsStatus;
        invoice_ref: string | null;
        payment_due: Date | null;
        payment_done: boolean;
    }>;
    updateGRNAccounts(id: string, req: any, body: {
        accounts_status: string;
        invoice_ref?: string;
        payment_due?: string;
    }): Promise<{
        id: string;
        raised_by: string;
        raised_at: Date;
        po_id: string;
        grn_number: string;
        accounts_status: import(".prisma/client").$Enums.AccountsStatus;
        invoice_ref: string | null;
        payment_due: Date | null;
        payment_done: boolean;
    }>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        materialCode: string;
        materialName: string;
        unit: string;
        description: string | null;
    }>;
    createMaterial(body: {
        materialCode: string;
        materialName: string;
        unit: string;
        description?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        materialCode: string;
        materialName: string;
        unit: string;
        description: string | null;
    }>;
    updateMaterial(id: string, body: {
        materialName?: string;
        unit?: string;
        description?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        materialCode: string;
        materialName: string;
        unit: string;
        description: string | null;
    }>;
}
