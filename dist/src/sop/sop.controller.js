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
exports.SopController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const sop_service_1 = require("./sop.service");
let SopController = class SopController {
    constructor(sopService) {
        this.sopService = sopService;
    }
    findAll(status, productCategory) {
        return this.sopService.findAll(status, productCategory);
    }
    findByBom(bomId) {
        return this.sopService.findByBom(bomId);
    }
    findOne(id) {
        return this.sopService.findOne(id);
    }
    getQCParameters(id) {
        return this.sopService.getQCParameters(id);
    }
    create(req, body) {
        return this.sopService.create(req.user, body);
    }
    addSection(id, req, body) {
        return this.sopService.addSection(id, req.user, body);
    }
    addQCParameterSet(id, req, body) {
        return this.sopService.addQCParameterSet(id, req.user, body);
    }
    updateStatus(id, req, body) {
        return this.sopService.updateStatus(id, req.user, body.status, body.signature);
    }
    clone(id, req) {
        return this.sopService.clone(id, req.user);
    }
};
exports.SopController = SopController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('productCategory')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SopController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-bom/:bomId'),
    __param(0, (0, common_1.Param)('bomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SopController.prototype, "findByBom", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SopController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/qc-parameters'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SopController.prototype, "getQCParameters", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SopController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/sections'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SopController.prototype, "addSection", null);
__decorate([
    (0, common_1.Post)(':id/qc-parameters'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SopController.prototype, "addQCParameterSet", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SopController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/clone'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SopController.prototype, "clone", null);
exports.SopController = SopController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sop'),
    __metadata("design:paramtypes", [sop_service_1.SopService])
], SopController);
//# sourceMappingURL=sop.controller.js.map