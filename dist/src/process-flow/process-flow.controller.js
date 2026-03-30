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
exports.ProcessFlowController = void 0;
const common_1 = require("@nestjs/common");
const process_flow_service_1 = require("./process-flow.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let ProcessFlowController = class ProcessFlowController {
    constructor(processFlowService) {
        this.processFlowService = processFlowService;
    }
    findAll(productCode) {
        return this.processFlowService.findAll(productCode);
    }
    findByProduct(code) {
        return this.processFlowService.findByProduct(code);
    }
    findOne(id) {
        return this.processFlowService.findOne(id);
    }
    create(req, body) {
        return this.processFlowService.create(req.user, body);
    }
    update(id, req, body) {
        return this.processFlowService.update(id, req.user, body);
    }
    updateStatus(id, req, body) {
        return this.processFlowService.updateStatus(id, req.user, body.status);
    }
    addDocument(id, req, body) {
        return this.processFlowService.addDocument(id, req.user, body);
    }
};
exports.ProcessFlowController = ProcessFlowController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('productCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProcessFlowController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-product/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProcessFlowController.prototype, "findByProduct", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProcessFlowController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ProcessFlowController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ProcessFlowController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ProcessFlowController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ProcessFlowController.prototype, "addDocument", null);
exports.ProcessFlowController = ProcessFlowController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('process-flow'),
    __metadata("design:paramtypes", [process_flow_service_1.ProcessFlowService])
], ProcessFlowController);
//# sourceMappingURL=process-flow.controller.js.map