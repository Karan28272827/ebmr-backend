import { Module } from '@nestjs/common';
import { QcSpecService } from './qc-spec.service';
import { QcSpecController } from './qc-spec.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [QcSpecService],
  controllers: [QcSpecController],
  exports: [QcSpecService],
})
export class QcSpecModule {}
