import { PrismaService } from '../prisma/prisma.service';
export declare class MaterialsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        materialCode: string;
        materialName: string;
        unit: string;
        description: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        materialCode: string;
        materialName: string;
        unit: string;
        description: string | null;
    }>;
    findByCode(code: string): Promise<{
        id: string;
        createdAt: Date;
        materialCode: string;
        materialName: string;
        unit: string;
        description: string | null;
    }>;
    create(dto: {
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
    update(id: string, dto: {
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
