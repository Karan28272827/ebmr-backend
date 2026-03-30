import { PrismaService } from '../prisma/prisma.service';
export declare class BomService {
    private prisma;
    constructor(prisma: PrismaService);
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
    addItem(user: any, templateId: string, dto: {
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
    removeItem(user: any, itemId: string): Promise<{
        id: string;
        templateId: string;
        materialId: string;
        qtyPerKg: number;
        notes: string | null;
    }>;
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
    issueForBatch(user: any, batchId: string, dto: {
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
}
