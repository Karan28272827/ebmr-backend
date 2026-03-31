import { Module } from '@nestjs/common';
import { EnvMonitoringService } from './env-monitoring.service';
import { EnvMonitoringController } from './env-monitoring.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [EnvMonitoringService],
  controllers: [EnvMonitoringController],
  exports: [EnvMonitoringService],
})
export class EnvMonitoringModule {}
