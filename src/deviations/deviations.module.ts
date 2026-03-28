import { Module } from '@nestjs/common';
import { DeviationsService } from './deviations.service';
import { DeviationsController } from './deviations.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [DeviationsService],
  controllers: [DeviationsController],
  exports: [DeviationsService],
})
export class DeviationsModule {}
