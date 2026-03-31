"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvMonitoringController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const env_monitoring_service_1 = require("./env-monitoring.service");
let EnvMonitoringController = class EnvMonitoringController {
    constructor(envMonitoringService) {
        this.envMonitoringService = envMonitoringService;
    }
    findAllAreas(isActive) {
        return this.envMonitoringService.findAllAreas(isActive !== undefined ? isActive === 'true' : undefined);
    }
    findArea(id) {
        return this.envMonitoringService.findArea(id);
    }
    createArea(req, body) {
        return this.envMonitoringService.createArea(req.user, body);
    }
    getDashboard() {
        return this.envMonitoringService.getDashboard();
    }
    getReadings(areaId, readingType, days) {
        return this.envMonitoringService.getReadings(areaId, readingType, days ? parseInt(days) : 30);
    }
    recordReading(req, body) {
        return this.envMonitoringService.recordReading(req.user, body);
    }
};
exports.EnvMonitoringController = EnvMonitoringController;
__decorate([
    (0, common_1.Get)('areas'),
    __param(0, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EnvMonitoringController.prototype, "findAllAreas", null);
__decorate([
    (0, common_1.Get)('areas/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EnvMonitoringController.prototype, "findArea", null);
__decorate([
    (0, common_1.Post)('areas'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EnvMonitoringController.prototype, "createArea", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EnvMonitoringController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('readings'),
    __param(0, (0, common_1.Query)('areaId')),
    __param(1, (0, common_1.Query)('readingType')),
    __param(2, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], EnvMonitoringController.prototype, "getReadings", null);
__decorate([
    (0, common_1.Post)('readings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EnvMonitoringController.prototype, "recordReading", null);
exports.EnvMonitoringController = EnvMonitoringController = __decorate([
    (0, common_1.Controller)('env-monitoring'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [env_monitoring_service_1.EnvMonitoringService])
], EnvMonitoringController);
//# sourceMappingURL=env-monitoring.controller.js.map