import { IssuesService } from './issues.service';
export declare class IssuesController {
    private svc;
    constructor(svc: IssuesService);
    findAll(batchId?: string, status?: string, severity?: string): import(".prisma/client").Prisma.PrismaPromise<({
        batch: {
            batchNumber: string;
            productName: string;
        };
        raiser: {
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
        assignee: {
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        batchId: string | null;
        raisedAt: Date;
        status: import(".prisma/client").$Enums.IssueStatus;
        updatedAt: Date;
        raisedBy: string;
        description: string;
        title: string;
        severity: import(".prisma/client").$Enums.IssueSeverity;
        assignedTo: string | null;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
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
        assignee: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
        resolver: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        batchId: string | null;
        raisedAt: Date;
        status: import(".prisma/client").$Enums.IssueStatus;
        updatedAt: Date;
        raisedBy: string;
        description: string;
        title: string;
        severity: import(".prisma/client").$Enums.IssueSeverity;
        assignedTo: string | null;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    create(req: any, body: {
        title: string;
        description: string;
        severity: string;
        batchId?: string;
        assignedTo?: string;
    }): import(".prisma/client").Prisma.Prisma__IssueClient<{
        batch: {
            batchNumber: string;
            productName: string;
        };
        raiser: {
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        batchId: string | null;
        raisedAt: Date;
        status: import(".prisma/client").$Enums.IssueStatus;
        updatedAt: Date;
        raisedBy: string;
        description: string;
        title: string;
        severity: import(".prisma/client").$Enums.IssueSeverity;
        assignedTo: string | null;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateStatus(id: string, req: any, body: {
        status: string;
    }): Promise<{
        raiser: {
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        batchId: string | null;
        raisedAt: Date;
        status: import(".prisma/client").$Enums.IssueStatus;
        updatedAt: Date;
        raisedBy: string;
        description: string;
        title: string;
        severity: import(".prisma/client").$Enums.IssueSeverity;
        assignedTo: string | null;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    resolve(id: string, req: any, body: {
        resolution: string;
    }): Promise<{
        raiser: {
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
        resolver: {
            name: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        batchId: string | null;
        raisedAt: Date;
        status: import(".prisma/client").$Enums.IssueStatus;
        updatedAt: Date;
        raisedBy: string;
        description: string;
        title: string;
        severity: import(".prisma/client").$Enums.IssueSeverity;
        assignedTo: string | null;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
    close(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        batchId: string | null;
        raisedAt: Date;
        status: import(".prisma/client").$Enums.IssueStatus;
        updatedAt: Date;
        raisedBy: string;
        description: string;
        title: string;
        severity: import(".prisma/client").$Enums.IssueSeverity;
        assignedTo: string | null;
        resolution: string | null;
        resolvedBy: string | null;
        resolvedAt: Date | null;
    }>;
}
