"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const audit_service_1 = require("./audit.service");
const audit_controller_1 = require("./audit.controller");
const audit_processor_1 = require("./audit.processor");
let AuditModule = class AuditModule {
};
exports.AuditModule = AuditModule;
exports.AuditModule = AuditModule = __decorate([
    (0, common_1.Module)({
        imports: [bull_1.BullModule.registerQueue({ name: 'audit' })],
        providers: [audit_service_1.AuditService, audit_processor_1.AuditProcessor],
        controllers: [audit_controller_1.AuditController],
        exports: [audit_service_1.AuditService],
    })
], AuditModule);
//# sourceMappingURL=audit.module.js.map