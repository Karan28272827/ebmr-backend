import { QcService } from './qc.service';
export declare class QcController {
    private qcService;
    constructor(qcService: QcService);
    getDashboard(): Promise<{
        pendingIQC: number;
        pendingLQC: number;
        pendingOQC: number;
        passRate: number;
        totalCompleted: number;
    }>;
    findAll(stage?: string, status?: string, batchId?: string): Promise<({
        batch: {
            batchNumber: string;
        };
        results: {
            id: string;
            unit: string | null;
            actual_value: string;
            notes: string | null;
            min_value: number | null;
            max_value: number | null;
            qc_test_id: string;
            is_within_spec: boolean;
            tested_by: string;
            parameter_id: string;
            parameter_name: string;
            tested_at: Date;
        }[];
        material_receipt: {
            receipt_code: string;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        batch: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            batchNumber: string;
            productCode: string;
            productName: string;
            batchSize: number;
            state: import(".prisma/client").$Enums.BatchState;
            initiatedBy: string;
            initiatedAt: Date | null;
            completedAt: Date | null;
            steps: import("@prisma/client/runtime/library").JsonValue;
            signatures: import("@prisma/client/runtime/library").JsonValue;
            templateId: string;
            bomId: string | null;
        };
        results: {
            id: string;
            unit: string | null;
            actual_value: string;
            notes: string | null;
            min_value: number | null;
            max_value: number | null;
            qc_test_id: string;
            is_within_spec: boolean;
            tested_by: string;
            parameter_id: string;
            parameter_name: string;
            tested_at: Date;
        }[];
        material_receipt: {
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
        };
        checklist_executions: ({
            item_responses: {
                id: string;
                completed_at: Date | null;
                notes: string | null;
                execution_id: string;
                item_id: string;
                is_completed: boolean;
                value_recorded: string | null;
            }[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ChecklistExecStatus;
            completed_at: Date | null;
            qc_test_id: string;
            checklist_id: string;
            executed_by: string;
            started_at: Date;
        })[];
    } & {
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
    }>;
    createTest(req: any, body: any): Promise<{
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
    }>;
    submitResults(id: string, req: any, body: {
        results: any[];
    }): Promise<{
        batch: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            batchNumber: string;
            productCode: string;
            productName: string;
            batchSize: number;
            state: import(".prisma/client").$Enums.BatchState;
            initiatedBy: string;
            initiatedAt: Date | null;
            completedAt: Date | null;
            steps: import("@prisma/client/runtime/library").JsonValue;
            signatures: import("@prisma/client/runtime/library").JsonValue;
            templateId: string;
            bomId: string | null;
        };
        results: {
            id: string;
            unit: string | null;
            actual_value: string;
            notes: string | null;
            min_value: number | null;
            max_value: number | null;
            qc_test_id: string;
            is_within_spec: boolean;
            tested_by: string;
            parameter_id: string;
            parameter_name: string;
            tested_at: Date;
        }[];
        material_receipt: {
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
        };
        checklist_executions: ({
            item_responses: {
                id: string;
                completed_at: Date | null;
                notes: string | null;
                execution_id: string;
                item_id: string;
                is_completed: boolean;
                value_recorded: string | null;
            }[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ChecklistExecStatus;
            completed_at: Date | null;
            qc_test_id: string;
            checklist_id: string;
            executed_by: string;
            started_at: Date;
        })[];
    } & {
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
    }>;
    recordVerdict(id: string, req: any, body: {
        verdict: string;
        notes?: string;
    }): Promise<{
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
    }>;
    findAllChecklists(stage?: string): Promise<({
        _count: {
            items: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        qc_stage: import(".prisma/client").$Enums.QCStage;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        title: string;
        checklist_code: string;
        applicable_to: string[];
    })[]>;
    createChecklist(req: any, body: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        qc_stage: import(".prisma/client").$Enums.QCStage;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        title: string;
        checklist_code: string;
        applicable_to: string[];
    }>;
    findChecklist(id: string): Promise<{
        items: {
            id: string;
            is_mandatory: boolean;
            item_number: number;
            checklist_id: string;
            category: import(".prisma/client").$Enums.ChecklistCategory;
            instruction: string;
            requires_value: boolean;
            value_label: string | null;
            value_type: import(".prisma/client").$Enums.ParamDataType | null;
            reference: string | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        qc_stage: import(".prisma/client").$Enums.QCStage;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        title: string;
        checklist_code: string;
        applicable_to: string[];
    }>;
    addChecklistItems(id: string, req: any, body: {
        items: any[];
    }): Promise<{
        items: {
            id: string;
            is_mandatory: boolean;
            item_number: number;
            checklist_id: string;
            category: import(".prisma/client").$Enums.ChecklistCategory;
            instruction: string;
            requires_value: boolean;
            value_label: string | null;
            value_type: import(".prisma/client").$Enums.ParamDataType | null;
            reference: string | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        qc_stage: import(".prisma/client").$Enums.QCStage;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        title: string;
        checklist_code: string;
        applicable_to: string[];
    }>;
    startChecklistExecution(req: any, body: {
        checklistId: string;
        qcTestId: string;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ChecklistExecStatus;
        completed_at: Date | null;
        qc_test_id: string;
        checklist_id: string;
        executed_by: string;
        started_at: Date;
    }>;
    updateChecklistItem(executionId: string, itemId: string, req: any, body: {
        is_completed: boolean;
        value_recorded?: string;
        notes?: string;
    }): Promise<{
        id: string;
        completed_at: Date | null;
        notes: string | null;
        execution_id: string;
        item_id: string;
        is_completed: boolean;
        value_recorded: string | null;
    }>;
    completeChecklistExecution(executionId: string, req: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.ChecklistExecStatus;
        completed_at: Date | null;
        qc_test_id: string;
        checklist_id: string;
        executed_by: string;
        started_at: Date;
    }>;
}
