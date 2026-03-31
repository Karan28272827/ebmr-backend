import { CoaService } from './coa.service';
export declare class CoaController {
    private coaService;
    constructor(coaService: CoaService);
    findAll(productCode?: string): Promise<({
        batch: {
            batchNumber: string;
            productCode: string;
            productName: string;
            state: import(".prisma/client").$Enums.BatchState;
        };
    } & {
        id: string;
        batch_id: string;
        expiry_date: Date | null;
        overall_verdict: import(".prisma/client").$Enums.QCVerdict;
        notes: string | null;
        spec_id: string | null;
        coa_number: string;
        generated_by: string;
        generated_at: Date;
        test_results: import("@prisma/client/runtime/library").JsonValue;
        release_date: Date | null;
        released_by: string | null;
    })[]>;
    findByBatch(batchId: string): Promise<{
        batch: {
            batchNumber: string;
            productCode: string;
            productName: string;
            batchSize: number;
            state: import(".prisma/client").$Enums.BatchState;
        };
    } & {
        id: string;
        batch_id: string;
        expiry_date: Date | null;
        overall_verdict: import(".prisma/client").$Enums.QCVerdict;
        notes: string | null;
        spec_id: string | null;
        coa_number: string;
        generated_by: string;
        generated_at: Date;
        test_results: import("@prisma/client/runtime/library").JsonValue;
        release_date: Date | null;
        released_by: string | null;
    }>;
    findOne(id: string): Promise<{
        batch: {
            batchNumber: string;
            productCode: string;
            productName: string;
            batchSize: number;
            state: import(".prisma/client").$Enums.BatchState;
        };
    } & {
        id: string;
        batch_id: string;
        expiry_date: Date | null;
        overall_verdict: import(".prisma/client").$Enums.QCVerdict;
        notes: string | null;
        spec_id: string | null;
        coa_number: string;
        generated_by: string;
        generated_at: Date;
        test_results: import("@prisma/client/runtime/library").JsonValue;
        release_date: Date | null;
        released_by: string | null;
    }>;
    generate(req: any, body: any): Promise<{
        id: string;
        batch_id: string;
        expiry_date: Date | null;
        overall_verdict: import(".prisma/client").$Enums.QCVerdict;
        notes: string | null;
        spec_id: string | null;
        coa_number: string;
        generated_by: string;
        generated_at: Date;
        test_results: import("@prisma/client/runtime/library").JsonValue;
        release_date: Date | null;
        released_by: string | null;
    }>;
    release(id: string, req: any): Promise<{
        id: string;
        batch_id: string;
        expiry_date: Date | null;
        overall_verdict: import(".prisma/client").$Enums.QCVerdict;
        notes: string | null;
        spec_id: string | null;
        coa_number: string;
        generated_by: string;
        generated_at: Date;
        test_results: import("@prisma/client/runtime/library").JsonValue;
        release_date: Date | null;
        released_by: string | null;
    }>;
}
