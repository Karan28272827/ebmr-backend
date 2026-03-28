import { DeviationsService } from './deviations.service';
export declare class DeviationsController {
    private deviationsService;
    constructor(deviationsService: DeviationsService);
    findAll(batchId?: string, status?: string): Promise<({
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
    create(req: any, body: {
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
    close(id: string, req: any, body: {
        resolutionNotes: string;
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
    updateStatus(id: string, req: any, body: {
        status: string;
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
}
