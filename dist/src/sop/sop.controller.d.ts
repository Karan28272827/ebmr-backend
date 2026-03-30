import { SopService } from './sop.service';
export declare class SopController {
    private sopService;
    constructor(sopService: SopService);
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
    getQCParameters(id: string): Promise<({
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
    create(req: any, body: any): Promise<{
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
    addSection(id: string, req: any, body: any): Promise<{
        id: string;
        created_at: Date;
        is_critical: boolean;
        title: string;
        sop_id: string;
        section_no: number;
        content: string;
    }>;
    addQCParameterSet(id: string, req: any, body: any): Promise<{
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
    updateStatus(id: string, req: any, body: {
        status: string;
        signature?: any;
    }): Promise<{
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
    clone(id: string, req: any): Promise<{
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
