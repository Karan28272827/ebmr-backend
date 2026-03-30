import { BomService } from './bom.service';
export declare class BomController {
    private svc;
    constructor(svc: BomService);
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
