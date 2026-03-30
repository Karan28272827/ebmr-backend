import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class PlanningService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    findAll(status?: string, period?: string): Promise<({
        _count: {
            planned_batches: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PlanStatus;
        created_by: string;
        created_at: Date;
        approved_by: string | null;
        approved_at: Date | null;
        plan_code: string;
        plan_name: string;
        plan_period: string;
    })[]>;
    findOne(id: string): Promise<{
        planned_batches: ({
            bom: {
                bom_code: string;
                product_name: string;
            };
            actual_batch: {
                batchNumber: string;
                state: import(".prisma/client").$Enums.BatchState;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.PlannedBatchStatus;
            bom_id: string;
            planned_batch_size: number;
            planned_start: Date;
            planned_end: Date;
            production_line: string;
            priority: number;
            simulation_result: import("@prisma/client/runtime/library").JsonValue | null;
            plan_id: string;
            actual_batch_id: string | null;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PlanStatus;
        created_by: string;
        created_at: Date;
        approved_by: string | null;
        approved_at: Date | null;
        plan_code: string;
        plan_name: string;
        plan_period: string;
    }>;
    create(user: any, data: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PlanStatus;
        created_by: string;
        created_at: Date;
        approved_by: string | null;
        approved_at: Date | null;
        plan_code: string;
        plan_name: string;
        plan_period: string;
    }>;
    addPlannedBatch(planId: string, user: any, data: any): Promise<{
        planned_batch: {
            id: string;
            status: import(".prisma/client").$Enums.PlannedBatchStatus;
            bom_id: string;
            planned_batch_size: number;
            planned_start: Date;
            planned_end: Date;
            production_line: string;
            priority: number;
            simulation_result: import("@prisma/client/runtime/library").JsonValue | null;
            plan_id: string;
            actual_batch_id: string | null;
        };
        simulation: {
            scale_factor: number;
            material_checks: {
                material_code: string;
                material_name: string;
                needed: number;
                available: number;
                unit: string;
                status: string;
                fefo_lot: any;
                shortfall: number;
            }[];
            shortages: {
                material_code: string;
                material_name: string;
                needed: number;
                available: number;
                unit: string;
                status: string;
                fefo_lot: any;
                shortfall: number;
            }[];
            has_shortages: boolean;
            estimated_cycle_time_hrs: number;
        };
    }>;
    runSimulation(bomId: string, batchSize: number, plannedStart?: Date): Promise<{
        scale_factor: number;
        material_checks: {
            material_code: string;
            material_name: string;
            needed: number;
            available: number;
            unit: string;
            status: string;
            fefo_lot: any;
            shortfall: number;
        }[];
        shortages: {
            material_code: string;
            material_name: string;
            needed: number;
            available: number;
            unit: string;
            status: string;
            fefo_lot: any;
            shortfall: number;
        }[];
        has_shortages: boolean;
        estimated_cycle_time_hrs: number;
    }>;
    simulatePlan(planId: string): Promise<any[]>;
    approvePlan(id: string, user: any, signature?: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PlanStatus;
        created_by: string;
        created_at: Date;
        approved_by: string | null;
        approved_at: Date | null;
        plan_code: string;
        plan_name: string;
        plan_period: string;
    }>;
    getCalendar(): Promise<({
        bom: {
            product_name: string;
            product_code: string;
        };
        plan: {
            plan_code: string;
            plan_name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PlannedBatchStatus;
        bom_id: string;
        planned_batch_size: number;
        planned_start: Date;
        planned_end: Date;
        production_line: string;
        priority: number;
        simulation_result: import("@prisma/client/runtime/library").JsonValue | null;
        plan_id: string;
        actual_batch_id: string | null;
    })[]>;
    initiateBatch(planId: string, plannedBatchId: string, user: any, data: {
        templateId: string;
        batchNumber: string;
    }): Promise<{
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
    }>;
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
    acknowledgeAlert(id: string, user: any): Promise<{
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
}
