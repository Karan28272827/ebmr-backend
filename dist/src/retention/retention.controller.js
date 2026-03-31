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
exports.RetentionController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const retention_service_1 = require("./retention.service");
let RetentionController = class RetentionController {
    constructor(retentionService) {
        this.retentionService = retentionService;
    }
    findAll(batchId, status) {
        return this.retentionService.findAll(batchId, status);
    }
    getExpiring(days) {
        return this.retentionService.getExpiring(days ? parseInt(days) : 30);
    }
    findOne(id) {
        return this.retentionService.findOne(id);
    }
    create(req, body) {
        return this.retentionService.create(req.user, body);
    }
    withdraw(id, req, body) {
        return this.retentionService.withdraw(id, req.user, body);
    }
};
exports.RetentionController = RetentionController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('batchId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RetentionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('expiring'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RetentionController.prototype, "getExpiring", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RetentionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RetentionController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/withdraw'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], RetentionController.prototype, "withdraw", null);
exports.RetentionController = RetentionController = __decorate([
    (0, common_1.Controller)('retention'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [retention_service_1.RetentionService])
], RetentionController);
//# sourceMappingURL=retention.controller.js.map