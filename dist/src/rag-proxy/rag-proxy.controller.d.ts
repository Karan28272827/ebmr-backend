import { HttpService } from '@nestjs/axios';
export declare class RagProxyController {
    private readonly http;
    constructor(http: HttpService);
    query(body: {
        question: string;
        top_k?: number;
    }): Promise<any>;
}
