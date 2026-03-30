import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class ProcessFlowService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    findAll(productCode?: string): Promise<({
        _count: {
            stages: number;
            documents: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        description: string;
        created_by: string;
        created_at: Date;
        product_name: string;
        product_code: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        bom_id: string | null;
        title: string;
        flow_code: string;
        baseline_metrics: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    findOne(id: string): Promise<{
        stages: {
            id: string;
            duration_min: number | null;
            notes: string | null;
            stage_number: number;
            flow_id: string;
            stage_name: string;
            department: string;
            responsible_role: string;
            inputs: string[];
            outputs: string[];
            decision_points: import("@prisma/client/runtime/library").JsonValue;
            critical: boolean;
        }[];
        documents: {
            id: string;
            version: string;
            title: string;
            flow_id: string;
            uploaded_at: Date;
            doc_type: import(".prisma/client").$Enums.DocType;
            file_reference: string;
            uploaded_by: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        description: string;
        created_by: string;
        created_at: Date;
        product_name: string;
        product_code: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        bom_id: string | null;
        title: string;
        flow_code: string;
        baseline_metrics: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findByProduct(productCode: string): Promise<{
        stages: {
            id: string;
            duration_min: number | null;
            notes: string | null;
            stage_number: number;
            flow_id: string;
            stage_name: string;
            department: string;
            responsible_role: string;
            inputs: string[];
            outputs: string[];
            decision_points: import("@prisma/client/runtime/library").JsonValue;
            critical: boolean;
        }[];
        documents: {
            id: string;
            version: string;
            title: string;
            flow_id: string;
            uploaded_at: Date;
            doc_type: import(".prisma/client").$Enums.DocType;
            file_reference: string;
            uploaded_by: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        description: string;
        created_by: string;
        created_at: Date;
        product_name: string;
        product_code: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        bom_id: string | null;
        title: string;
        flow_code: string;
        baseline_metrics: import("@prisma/client/runtime/library").JsonValue;
    }>;
    create(user: any, data: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        description: string;
        created_by: string;
        created_at: Date;
        product_name: string;
        product_code: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        bom_id: string | null;
        title: string;
        flow_code: string;
        baseline_metrics: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(id: string, user: any, data: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        description: string;
        created_by: string;
        created_at: Date;
        product_name: string;
        product_code: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        bom_id: string | null;
        title: string;
        flow_code: string;
        baseline_metrics: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateStatus(id: string, user: any, status: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        description: string;
        created_by: string;
        created_at: Date;
        product_name: string;
        product_code: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        bom_id: string | null;
        title: string;
        flow_code: string;
        baseline_metrics: import("@prisma/client/runtime/library").JsonValue;
    }>;
    addDocument(flowId: string, user: any, data: any): Promise<{
        id: string;
        version: string;
        title: string;
        flow_id: string;
        uploaded_at: Date;
        doc_type: import(".prisma/client").$Enums.DocType;
        file_reference: string;
        uploaded_by: string;
    }>;
}
