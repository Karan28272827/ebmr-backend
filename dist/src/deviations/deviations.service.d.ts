import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class DeviationsService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    create(data: {
        batchId: string;
        stepNumber: number;
        fieldName: string;
        expectedRange: string;
        actualValue: number;
        raisedBy: string;
        raisedByUser?: any;
    }): Promise<{
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
    }>;
    manualCreate(user: any, body: {
        batchId: string;
        stepNumber: number;
        fieldName: string;
        expectedRange: string;
        actualValue: number;
    }): Promise<{
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
    }>;
    findAll(filters?: {
        batchId?: string;
        status?: string;
    }): Promise<({
        batch: {
            batchNumber: string;
            productName: string;
        };
        raiser: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        batch: {
            batchNumber: string;
            productName: string;
            state: import(".prisma/client").$Enums.BatchState;
        };
        raiser: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
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
    }>;
    close(id: string, user: any, resolutionNotes: string): Promise<{
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
    }>;
    updateStatus(id: string, user: any, status: string): Promise<{
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
    }>;
}
