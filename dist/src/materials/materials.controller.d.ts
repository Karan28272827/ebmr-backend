import { MaterialsService } from './materials.service';
export declare class MaterialsController {
    private svc;
    constructor(svc: MaterialsService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        materialCode: string;
        materialName: string;
        unit: string;
        description: string | null;
    }[]>;
    findByCode(code: string): Promise<{
        id: string;
        createdAt: Date;
        materialCode: string;
        materialName: string;
        unit: string;
        description: string | null;
    }>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        materialCode: string;
        materialName: string;
        unit: string;
        description: string | null;
    }>;
    create(body: {
        materialCode: string;
        materialName: string;
        unit: string;
        description?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        materialCode: string;
        materialName: string;
        unit: string;
        description: string | null;
    }>;
    update(id: string, body: {
        materialName?: string;
        unit?: string;
        description?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        materialCode: string;
        materialName: string;
        unit: string;
        description: string | null;
    }>;
}
