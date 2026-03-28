import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('audit-trail')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get(':batchId')
  getForBatch(@Param('batchId') batchId: string) {
    return this.auditService.getForBatch(batchId);
  }

  @Get()
  getAll(@Query('eventType') eventType?: string) {
    return this.auditService.getAll({ eventType });
  }
}
