import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class QcSpecService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    findAll(productCode?: string, status?: string): Promise<({
        _count: {
            parameters: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        product_name: string;
        product_code: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        bom_id: string | null;
        updated_at: Date;
        spec_code: string;
    })[]>;
    findOne(id: string): Promise<{
        parameters: {
            id: string;
            name: string;
            unit: string | null;
            qc_stage: import(".prisma/client").$Enums.QCStage;
            display_order: number;
            param_code: string;
            data_type: import(".prisma/client").$Enums.ParamDataType;
            min_value: number | null;
            max_value: number | null;
            target_value: number | null;
            is_mandatory: boolean;
            sampling_plan: string | null;
            test_method: string | null;
            spec_id: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        product_name: string;
        product_code: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        bom_id: string | null;
        updated_at: Date;
        spec_code: string;
    }>;
    findByProduct(productCode: string): Promise<({
        parameters: {
            id: string;
            name: string;
            unit: string | null;
            qc_stage: import(".prisma/client").$Enums.QCStage;
            display_order: number;
            param_code: string;
            data_type: import(".prisma/client").$Enums.ParamDataType;
            min_value: number | null;
            max_value: number | null;
            target_value: number | null;
            is_mandatory: boolean;
            sampling_plan: string | null;
            test_method: string | null;
            spec_id: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        product_name: string;
        product_code: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        bom_id: string | null;
        updated_at: Date;
        spec_code: string;
    })[]>;
    create(user: any, data: any): Promise<{
        parameters: {
            id: string;
            name: string;
            unit: string | null;
            qc_stage: import(".prisma/client").$Enums.QCStage;
            display_order: number;
            param_code: string;
            data_type: import(".prisma/client").$Enums.ParamDataType;
            min_value: number | null;
            max_value: number | null;
            target_value: number | null;
            is_mandatory: boolean;
            sampling_plan: string | null;
            test_method: string | null;
            spec_id: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        product_name: string;
        product_code: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        bom_id: string | null;
        updated_at: Date;
        spec_code: string;
    }>;
    approve(id: string, user: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        product_name: string;
        product_code: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        bom_id: string | null;
        updated_at: Date;
        spec_code: string;
    }>;
    addParameter(specId: string, user: any, data: any): Promise<{
        id: string;
        name: string;
        unit: string | null;
        qc_stage: import(".prisma/client").$Enums.QCStage;
        display_order: number;
        param_code: string;
        data_type: import(".prisma/client").$Enums.ParamDataType;
        min_value: number | null;
        max_value: number | null;
        target_value: number | null;
        is_mandatory: boolean;
        sampling_plan: string | null;
        test_method: string | null;
        spec_id: string;
    }>;
    updateParameter(paramId: string, user: any, data: any): Promise<{
        id: string;
        name: string;
        unit: string | null;
        qc_stage: import(".prisma/client").$Enums.QCStage;
        display_order: number;
        param_code: string;
        data_type: import(".prisma/client").$Enums.ParamDataType;
        min_value: number | null;
        max_value: number | null;
        target_value: number | null;
        is_mandatory: boolean;
        sampling_plan: string | null;
        test_method: string | null;
        spec_id: string;
    }>;
}
