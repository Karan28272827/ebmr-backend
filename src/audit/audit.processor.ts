import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { AuditLogInput } from './audit.service';

// Queue processor — placeholder for future async processing
// Actual persistence is done synchronously in AuditService.log()
@Processor('audit')
export class AuditProcessor {
  @Process('log')
  async handleLog(job: Job<AuditLogInput>) {
    // Reserved for future: alerting, aggregation, export pipelines
    console.debug(`[audit-queue] ${job.data.eventType} on ${job.data.entityType}:${job.data.entityId}`);
  }
}
