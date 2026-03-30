import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { DeviationsService } from '../deviations/deviations.service';
import { AuthService } from '../auth/auth.service';
export declare class BatchesService {
    private prisma;
    private auditService;
    private deviationsService;
    private authService;
    constructor(prisma: PrismaService, auditService: AuditService, deviationsService: DeviationsService, authService: AuthService);
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
    create(user: any, templateId: string, batchSize: number, batchNumber: string): Promise<{
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
    transition(batchId: string, user: any, toState: string, signature?: any): Promise<{
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
    completeStep(batchId: string, user: any, stepNumber: number, actualValues: any, signature?: any): Promise<{
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
    skipStep(batchId: string, user: any, stepNumber: number): Promise<{
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
    addSignature(batchId: string, user: any, meaning: string, stepOrTransition: string, password: string): Promise<{
        user_id: any;
        user_name: any;
        role: any;
        meaning: string;
        timestamp: string;
        step_or_transition: string;
    }>;
    getTemplates(): Promise<{
        id: string;
        createdAt: Date;
        productCode: string;
        productName: string;
        steps: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    private buildRangeStr;
}
