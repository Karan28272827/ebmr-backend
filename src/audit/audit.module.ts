import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditProcessor } from './audit.processor';

@Module({
  imports: [BullModule.registerQueue({ name: 'audit' })],
  providers: [AuditService, AuditProcessor],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
