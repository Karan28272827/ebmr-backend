import { Module } from '@nestjs/common';
import { ProcessFlowService } from './process-flow.service';
import { ProcessFlowController } from './process-flow.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [ProcessFlowService],
  controllers: [ProcessFlowController],
  exports: [ProcessFlowService],
})
export class ProcessFlowModule {}
