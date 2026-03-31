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
exports.QcSpecController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const qc_spec_service_1 = require("./qc-spec.service");
let QcSpecController = class QcSpecController {
    constructor(qcSpecService) {
        this.qcSpecService = qcSpecService;
    }
    findAll(productCode, status) {
        return this.qcSpecService.findAll(productCode, status);
    }
    findByProduct(productCode) {
        return this.qcSpecService.findByProduct(productCode);
    }
    findOne(id) {
        return this.qcSpecService.findOne(id);
    }
    create(req, body) {
        return this.qcSpecService.create(req.user, body);
    }
    approve(id, req) {
        return this.qcSpecService.approve(id, req.user);
    }
    addParameter(id, req, body) {
        return this.qcSpecService.addParameter(id, req.user, body);
    }
    updateParameter(paramId, req, body) {
        return this.qcSpecService.updateParameter(paramId, req.user, body);
    }
};
exports.QcSpecController = QcSpecController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('productCode')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], QcSpecController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('product/:productCode'),
    __param(0, (0, common_1.Param)('productCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QcSpecController.prototype, "findByProduct", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QcSpecController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], QcSpecController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QcSpecController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/parameters'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], QcSpecController.prototype, "addParameter", null);
__decorate([
    (0, common_1.Patch)('parameters/:paramId'),
    __param(0, (0, common_1.Param)('paramId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], QcSpecController.prototype, "updateParameter", null);
exports.QcSpecController = QcSpecController = __decorate([
    (0, common_1.Controller)('qc-specs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [qc_spec_service_1.QcSpecService])
], QcSpecController);
//# sourceMappingURL=qc-spec.controller.js.map