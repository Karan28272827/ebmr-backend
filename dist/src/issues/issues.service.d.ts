import { PrismaService } from '../prisma/prisma.service';
export declare class IssuesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: {
        batchId?: string;
        status?: string;
        severity?: string;
    }): import(".prisma/client").Prisma.PrismaPromise<({
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
    create(user: any, dto: {
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
    updateStatus(id: string, user: any, status: string): Promise<{
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
    resolve(id: string, user: any, resolution: string): Promise<{
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
    close(id: string, user: any): Promise<{
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
