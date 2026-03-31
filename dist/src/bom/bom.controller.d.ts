import { BomService } from './bom.service';
export declare class BomController {
    private svc;
    constructor(svc: BomService);
    findAll(productCode?: string, status?: string): Promise<({
        _count: {
            components: number;
            process_steps: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.BOMStatus;
        created_by: string;
        created_at: Date;
        bom_code: string;
        product_name: string;
        product_code: string;
        product_variant: string;
        base_batch_size: number;
        base_unit: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        locked_at: Date | null;
        locked_by: string | null;
    })[]>;
    findOne(id: string): Promise<{
        components: {
            id: string;
            unit: string;
            material_name: string;
            material_code: string;
            display_order: number;
            bom_id: string;
            component_type: import(".prisma/client").$Enums.ComponentType;
            quantity_per_base_batch: number;
            overage_pct: number;
            is_critical: boolean;
            substitutes: string[];
        }[];
        process_steps: ({
            qc_parameter_set: {
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
            };
        } & {
            id: string;
            step_number: number;
            description: string;
            bom_id: string;
            title: string;
            equipment_type: string;
            duration_min: number | null;
            qc_parameter_set_id: string | null;
            scalable_params: import("@prisma/client/runtime/library").JsonValue;
            is_critical_step: boolean;
            has_lqc_gate: boolean;
        })[];
        sop_links: ({
            sop: {
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
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.BOMStatus;
        created_by: string;
        created_at: Date;
        bom_code: string;
        product_name: string;
        product_code: string;
        product_variant: string;
        base_batch_size: number;
        base_unit: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        locked_at: Date | null;
        locked_by: string | null;
    }>;
    create(req: any, body: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.BOMStatus;
        created_by: string;
        created_at: Date;
        bom_code: string;
        product_name: string;
        product_code: string;
        product_variant: string;
        base_batch_size: number;
        base_unit: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        locked_at: Date | null;
        locked_by: string | null;
    }>;
    updateStatus(id: string, req: any, body: {
        status: string;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.BOMStatus;
        created_by: string;
        created_at: Date;
        bom_code: string;
        product_name: string;
        product_code: string;
        product_variant: string;
        base_batch_size: number;
        base_unit: string;
        version: string;
        approved_by: string | null;
        approved_at: Date | null;
        locked_at: Date | null;
        locked_by: string | null;
    }>;
    simulate(id: string, body: {
        targetBatchSize: number;
    }): Promise<{
        bom_id: string;
        base_batch_size: number;
        simulated_batch_size: number;
        scale_factor: number;
        scaled_components: {
            material_code: string;
            material_name: string;
            base_qty: number;
            scaled_qty: number;
            unit: string;
            available_stock: number;
            stock_status: string;
            earliest_expiry: Date;
        }[];
        scaled_process_steps: {
            scaled_params: any[];
            qc_parameter_set: {
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
            };
            id: string;
            step_number: number;
            description: string;
            bom_id: string;
            title: string;
            equipment_type: string;
            duration_min: number | null;
            qc_parameter_set_id: string | null;
            scalable_params: import("@prisma/client/runtime/library").JsonValue;
            is_critical_step: boolean;
            has_lqc_gate: boolean;
        }[];
        stock_warnings: string[];
        expiry_warnings: string[];
    }>;
    findAllLegacy(): Promise<({
        bomItems: ({
            material: {
                id: string;
                createdAt: Date;
                materialCode: string;
                materialName: string;
                unit: string;
                description: string | null;
            };
        } & {
            id: string;
            templateId: string;
            materialId: string;
            qtyPerKg: number;
            notes: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        productCode: string;
        productName: string;
        steps: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    addLegacyBomItem(body: {
        templateId: string;
        materialId: string;
        qtyPerKg: number;
        notes?: string;
    }): Promise<{
        id: string;
        templateId: string;
        materialId: string;
        qtyPerKg: number;
        notes: string | null;
    }>;
    removeLegacyBomItem(id: string): Promise<{
        id: string;
        templateId: string;
        materialId: string;
        qtyPerKg: number;
        notes: string | null;
    }>;
    getTemplateBoM(templateId: string): Promise<({
        material: {
            id: string;
            createdAt: Date;
            materialCode: string;
            materialName: string;
            unit: string;
            description: string | null;
        };
    } & {
        id: string;
        templateId: string;
        materialId: string;
        qtyPerKg: number;
        notes: string | null;
    })[]>;
    addItem(req: any, templateId: string, body: {
        materialId: string;
        qtyPerKg: number;
        notes?: string;
    }): Promise<{
        material: {
            id: string;
            createdAt: Date;
            materialCode: string;
            materialName: string;
            unit: string;
            description: string | null;
        };
    } & {
        id: string;
        templateId: string;
        materialId: string;
        qtyPerKg: number;
        notes: string | null;
    }>;
    removeItem(req: any, id: string): Promise<{
        id: string;
        templateId: string;
        materialId: string;
        qtyPerKg: number;
        notes: string | null;
    }>;
    getRequiredMaterials(batchId: string): Promise<{
        bomItem: {
            material: {
                id: string;
                createdAt: Date;
                materialCode: string;
                materialName: string;
                unit: string;
                description: string | null;
            };
        } & {
            id: string;
            templateId: string;
            materialId: string;
            qtyPerKg: number;
            notes: string | null;
        };
        requiredQty: number;
        totalIssued: number;
        issuances: ({
            bomItem: {
                id: string;
                templateId: string;
                materialId: string;
                qtyPerKg: number;
                notes: string | null;
            };
        } & {
            id: string;
            batchId: string;
            materialId: string;
            bomItemId: string;
            lotNumber: string;
            requiredQty: number;
            issuedQty: number;
            issuedBy: string;
            issuedAt: Date;
        })[];
        status: string;
    }[]>;
    getBatchIssuances(batchId: string): Promise<({
        bomItem: {
            material: {
                id: string;
                createdAt: Date;
                materialCode: string;
                materialName: string;
                unit: string;
                description: string | null;
            };
        } & {
            id: string;
            templateId: string;
            materialId: string;
            qtyPerKg: number;
            notes: string | null;
        };
        issuer: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        batchId: string;
        materialId: string;
        bomItemId: string;
        lotNumber: string;
        requiredQty: number;
        issuedQty: number;
        issuedBy: string;
        issuedAt: Date;
    })[]>;
    issueForBatch(req: any, batchId: string, body: {
        bomItemId: string;
        lotNumber: string;
        issuedQty: number;
    }): Promise<{
        bomItem: {
            material: {
                id: string;
                createdAt: Date;
                materialCode: string;
                materialName: string;
                unit: string;
                description: string | null;
            };
        } & {
            id: string;
            templateId: string;
            materialId: string;
            qtyPerKg: number;
            notes: string | null;
        };
        issuer: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        batchId: string;
        materialId: string;
        bomItemId: string;
        lotNumber: string;
        requiredQty: number;
        issuedQty: number;
        issuedBy: string;
        issuedAt: Date;
    }>;
}
