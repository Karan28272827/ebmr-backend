import { Module } from '@nestjs/common';
import { CapaService } from './capa.service';
import { CapaController } from './capa.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  providers: [CapaService],
  controllers: [CapaController],
  exports: [CapaService],
})
export class CapaModule {}
