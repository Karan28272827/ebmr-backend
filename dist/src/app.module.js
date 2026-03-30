"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const batches_module_1 = require("./batches/batches.module");
const deviations_module_1 = require("./deviations/deviations.module");
const audit_module_1 = require("./audit/audit.module");
const prisma_module_1 = require("./prisma/prisma.module");
const materials_module_1 = require("./materials/materials.module");
const bom_module_1 = require("./bom/bom.module");
const issues_module_1 = require("./issues/issues.module");
function buildRedisConfig() {
    const url = process.env.REDIS_URL;
    if (url) {
        return {
            createClient: () => {
                const IORedis = require('ioredis');
                return new IORedis(url, {
                    maxRetriesPerRequest: null,
                    enableReadyCheck: false,
                    tls: url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
                });
            },
        };
    }
    return {
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
        },
    };
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.forRoot(buildRedisConfig()),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            batches_module_1.BatchesModule,
            deviations_module_1.DeviationsModule,
            audit_module_1.AuditModule,
            materials_module_1.MaterialsModule,
            bom_module_1.BomModule,
            issues_module_1.IssuesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map