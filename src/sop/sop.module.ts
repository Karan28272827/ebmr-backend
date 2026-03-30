import { Module } from '@nestjs/common';
import { SopService } from './sop.service';
import { SopController } from './sop.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [SopService],
  controllers: [SopController],
  exports: [SopService],
})
export class SopModule {}
