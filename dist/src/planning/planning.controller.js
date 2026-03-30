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
exports.PlanningController = void 0;
const common_1 = require("@nestjs/common");
const planning_service_1 = require("./planning.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let PlanningController = class PlanningController {
    constructor(planningService) {
        this.planningService = planningService;
    }
    findAll(status, period) {
        return this.planningService.findAll(status, period);
    }
    getCalendar() {
        return this.planningService.getCalendar();
    }
    getExpiryAlerts(level, materialCode) {
        return this.planningService.getExpiryAlerts(level, materialCode);
    }
    findOne(id) {
        return this.planningService.findOne(id);
    }
    create(req, body) {
        return this.planningService.create(req.user, body);
    }
    addPlannedBatch(id, req, body) {
        return this.planningService.addPlannedBatch(id, req.user, body);
    }
    simulatePlan(id) {
        return this.planningService.simulatePlan(id);
    }
    approvePlan(id, req, body) {
        return this.planningService.approvePlan(id, req.user, body.signature);
    }
    initiateBatch(planId, batchId, req, body) {
        return this.planningService.initiateBatch(planId, batchId, req.user, body);
    }
    acknowledgeAlert(id, req) {
        return this.planningService.acknowledgeAlert(id, req.user);
    }
};
exports.PlanningController = PlanningController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('calendar'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "getCalendar", null);
__decorate([
    (0, common_1.Get)('expiry-alerts'),
    __param(0, (0, common_1.Query)('level')),
    __param(1, (0, common_1.Query)('materialCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "getExpiryAlerts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/batches'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "addPlannedBatch", null);
__decorate([
    (0, common_1.Post)(':id/simulate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "simulatePlan", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "approvePlan", null);
__decorate([
    (0, common_1.Post)(':planId/batches/:batchId/initiate'),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Param)('batchId')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "initiateBatch", null);
__decorate([
    (0, common_1.Patch)('expiry-alerts/:id/acknowledge'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PlanningController.prototype, "acknowledgeAlert", null);
exports.PlanningController = PlanningController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('plans'),
    __metadata("design:paramtypes", [planning_service_1.PlanningService])
], PlanningController);
//# sourceMappingURL=planning.controller.js.map