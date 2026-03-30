import { BatchesService } from './batches.service';
export declare class BatchesController {
    private batchesService;
    constructor(batchesService: BatchesService);
    getTemplates(): Promise<{
        id: string;
        createdAt: Date;
        productCode: string;
        productName: string;
        steps: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    findAll(): Promise<({
        deviations: {
            id: string;
            status: import(".prisma/client").$Enums.DeviationStatus;
        }[];
        initiator: {
            email: string;
            name: string;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        deviations: {
            id: string;
            createdAt: Date;
            batchId: string;
            stepNumber: number;
            fieldName: string;
            expectedRange: string;
            actualValue: number;
            raisedAt: Date;
            status: import(".prisma/client").$Enums.DeviationStatus;
            resolutionNotes: string | null;
            closedBy: string | null;
            closedAt: Date | null;
            updatedAt: Date;
            raisedBy: string;
        }[];
        initiator: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
    create(req: any, body: {
        templateId: string;
        batchSize: number;
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
    transition(id: string, req: any, body: {
        toState: string;
        signature?: any;
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
    completeStep(id: string, stepNumber: string, req: any, body: {
        actualValues: any;
        signature?: any;
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
        deviationsRaised: number;
    }>;
    skipStep(id: string, stepNumber: string, req: any): Promise<{
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
    addSignature(id: string, req: any, body: {
        meaning: string;
        stepOrTransition: string;
        password: string;
    }): Promise<{
        user_id: any;
        user_name: any;
        role: any;
        meaning: string;
        timestamp: string;
        step_or_transition: string;
    }>;
}
