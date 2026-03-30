import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class SopService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    findAll(status?: string, productCategory?: string): Promise<({
        _count: {
            sections: number;
            qc_parameter_sets: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        title: string;
        sop_code: string;
        product_category: string;
        effective_date: Date | null;
        review_date: Date | null;
        updated_at: Date;
    })[]>;
    findOne(id: string): Promise<{
        sections: {
            id: string;
            created_at: Date;
            is_critical: boolean;
            title: string;
            sop_id: string;
            section_no: number;
            content: string;
        }[];
        qc_parameter_sets: ({
            parameters: {
                id: string;
                name: string;
                unit: string | null;
                display_order: number;
                parameter_set_id: string;
                param_code: string;
                data_type: import(".prisma/client").$Enums.ParamDataType;
                min_value: number | null;
                max_value: number | null;
                target_value: number | null;
                options: string[];
                is_mandatory: boolean;
                sampling_plan: string | null;
                test_method: string | null;
            }[];
        } & {
            id: string;
            name: string;
            created_at: Date;
            qc_stage: import(".prisma/client").$Enums.QCStage;
            sop_id: string;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        title: string;
        sop_code: string;
        product_category: string;
        effective_date: Date | null;
        review_date: Date | null;
        updated_at: Date;
    }>;
    create(user: any, data: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        title: string;
        sop_code: string;
        product_category: string;
        effective_date: Date | null;
        review_date: Date | null;
        updated_at: Date;
    }>;
    updateStatus(id: string, user: any, status: string, signature?: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        title: string;
        sop_code: string;
        product_category: string;
        effective_date: Date | null;
        review_date: Date | null;
        updated_at: Date;
    }>;
    addSection(sopId: string, user: any, data: any): Promise<{
        id: string;
        created_at: Date;
        is_critical: boolean;
        title: string;
        sop_id: string;
        section_no: number;
        content: string;
    }>;
    addQCParameterSet(sopId: string, user: any, data: any): Promise<{
        parameters: {
            id: string;
            name: string;
            unit: string | null;
            display_order: number;
            parameter_set_id: string;
            param_code: string;
            data_type: import(".prisma/client").$Enums.ParamDataType;
            min_value: number | null;
            max_value: number | null;
            target_value: number | null;
            options: string[];
            is_mandatory: boolean;
            sampling_plan: string | null;
            test_method: string | null;
        }[];
    } & {
        id: string;
        name: string;
        created_at: Date;
        qc_stage: import(".prisma/client").$Enums.QCStage;
        sop_id: string;
    }>;
    getQCParameters(sopId: string): Promise<({
        parameters: {
            id: string;
            name: string;
            unit: string | null;
            display_order: number;
            parameter_set_id: string;
            param_code: string;
            data_type: import(".prisma/client").$Enums.ParamDataType;
            min_value: number | null;
            max_value: number | null;
            target_value: number | null;
            options: string[];
            is_mandatory: boolean;
            sampling_plan: string | null;
            test_method: string | null;
        }[];
    } & {
        id: string;
        name: string;
        created_at: Date;
        qc_stage: import(".prisma/client").$Enums.QCStage;
        sop_id: string;
    })[]>;
    findByBom(bomId: string): Promise<({
        sop: {
            qc_parameter_sets: ({
                parameters: {
                    id: string;
                    name: string;
                    unit: string | null;
                    display_order: number;
                    parameter_set_id: string;
                    param_code: string;
                    data_type: import(".prisma/client").$Enums.ParamDataType;
                    min_value: number | null;
                    max_value: number | null;
                    target_value: number | null;
                    options: string[];
                    is_mandatory: boolean;
                    sampling_plan: string | null;
                    test_method: string | null;
                }[];
            } & {
                id: string;
                name: string;
                created_at: Date;
                qc_stage: import(".prisma/client").$Enums.QCStage;
                sop_id: string;
            })[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.SOPStatus;
            created_by: string;
            created_at: Date;
            version: string;
            approved_by: string | null;
            approved_at: Date | null;
            title: string;
            sop_code: string;
            product_category: string;
            effective_date: Date | null;
            review_date: Date | null;
            updated_at: Date;
        };
    } & {
        id: string;
        bom_id: string;
        sop_id: string;
        is_primary: boolean;
    })[]>;
    clone(id: string, user: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.SOPStatus;
        created_by: string;
        created_at: Date;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        title: string;
        sop_code: string;
        product_category: string;
        effective_date: Date | null;
        review_date: Date | null;
        updated_at: Date;
    }>;
}
