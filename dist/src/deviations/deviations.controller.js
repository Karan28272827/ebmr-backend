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
exports.DeviationsController = void 0;
const common_1 = require("@nestjs/common");
const deviations_service_1 = require("./deviations.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let DeviationsController = class DeviationsController {
    constructor(deviationsService) {
        this.deviationsService = deviationsService;
    }
    findAll(batchId, status) {
        return this.deviationsService.findAll({ batchId, status });
    }
    findOne(id) {
        return this.deviationsService.findOne(id);
    }
    create(req, body) {
        return this.deviationsService.manualCreate(req.user, body);
    }
    close(id, req, body) {
        return this.deviationsService.close(id, req.user, body.resolutionNotes);
    }
    updateStatus(id, req, body) {
        return this.deviationsService.updateStatus(id, req.user, body.status);
    }
};
exports.DeviationsController = DeviationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('batchId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DeviationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DeviationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DeviationsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id/close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DeviationsController.prototype, "close", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], DeviationsController.prototype, "updateStatus", null);
exports.DeviationsController = DeviationsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('deviations'),
    __metadata("design:paramtypes", [deviations_service_1.DeviationsService])
], DeviationsController);
//# sourceMappingURL=deviations.controller.js.map