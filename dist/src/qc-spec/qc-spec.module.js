"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QcSpecModule = void 0;
const common_1 = require("@nestjs/common");
const qc_spec_service_1 = require("./qc-spec.service");
const qc_spec_controller_1 = require("./qc-spec.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const audit_module_1 = require("../audit/audit.module");
let QcSpecModule = class QcSpecModule {
};
exports.QcSpecModule = QcSpecModule;
exports.QcSpecModule = QcSpecModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, audit_module_1.AuditModule],
        providers: [qc_spec_service_1.QcSpecService],
        controllers: [qc_spec_controller_1.QcSpecController],
        exports: [qc_spec_service_1.QcSpecService],
    })
], QcSpecModule);
//# sourceMappingURL=qc-spec.module.js.map