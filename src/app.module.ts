import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BatchesModule } from './batches/batches.module';
import { DeviationsModule } from './deviations/deviations.module';
import { AuditModule } from './audit/audit.module';
import { PrismaModule } from './prisma/prisma.module';
import { MaterialsModule } from './materials/materials.module';
import { BomModule } from './bom/bom.module';
import { IssuesModule } from './issues/issues.module';
import { SopModule } from './sop/sop.module';
import { QcModule } from './qc/qc.module';
import { ProcessFlowModule } from './process-flow/process-flow.module';
import { PlanningModule } from './planning/planning.module';
import { AdminModule } from './admin/admin.module';

function buildRedisConfig() {
  const url = process.env.REDIS_URL;

  if (url) {
    // Upstash and other TLS Redis providers supply a full URL (rediss://...)
    // Bull's createClient lets us pass an ioredis instance directly.
    return {
      createClient: () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const IORedis = require('ioredis');
        return new IORedis(url, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          tls: url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
        });
      },
    };
  }

  // Local / Docker
  return {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
  };
}

@Module({
  imports: [
    BullModule.forRoot(buildRedisConfig() as any),
    PrismaModule,
    AuthModule,
    UsersModule,
    BatchesModule,
    DeviationsModule,
    AuditModule,
    MaterialsModule,
    BomModule,
    IssuesModule,
    SopModule,
    QcModule,
    ProcessFlowModule,
    PlanningModule,
    AdminModule,
  ],
})
export class AppModule {}
