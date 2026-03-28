import { Job } from 'bull';
import { AuditLogInput } from './audit.service';
export declare class AuditProcessor {
    handleLog(job: Job<AuditLogInput>): Promise<void>;
}
