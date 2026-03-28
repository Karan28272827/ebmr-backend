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
exports.BatchesController = void 0;
const common_1 = require("@nestjs/common");
const batches_service_1 = require("./batches.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let BatchesController = class BatchesController {
    constructor(batchesService) {
        this.batchesService = batchesService;
    }
    getTemplates() {
        return this.batchesService.getTemplates();
    }
    findAll() {
        return this.batchesService.findAll();
    }
    findOne(id) {
        return this.batchesService.findOne(id);
    }
    create(req, body) {
        return this.batchesService.create(req.user, body.templateId, body.batchSize, body.batchNumber);
    }
    transition(id, req, body) {
        return this.batchesService.transition(id, req.user, body.toState, body.signature);
    }
    completeStep(id, stepNumber, req, body) {
        return this.batchesService.completeStep(id, req.user, parseInt(stepNumber), body.actualValues, body.signature);
    }
    skipStep(id, stepNumber, req) {
        return this.batchesService.skipStep(id, req.user, parseInt(stepNumber));
    }
    addSignature(id, req, body) {
        return this.batchesService.addSignature(id, req.user, body.meaning, body.stepOrTransition, body.password);
    }
};
exports.BatchesController = BatchesController;
__decorate([
    (0, common_1.Get)('templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BatchesController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BatchesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BatchesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BatchesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id/transition'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], BatchesController.prototype, "transition", null);
__decorate([
    (0, common_1.Put)(':id/steps/:stepNumber/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('stepNumber')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], BatchesController.prototype, "completeStep", null);
__decorate([
    (0, common_1.Put)(':id/steps/:stepNumber/skip'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('stepNumber')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], BatchesController.prototype, "skipStep", null);
__decorate([
    (0, common_1.Post)(':id/signature'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], BatchesController.prototype, "addSignature", null);
exports.BatchesController = BatchesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('batches'),
    __metadata("design:paramtypes", [batches_service_1.BatchesService])
], BatchesController);
//# sourceMappingURL=batches.controller.js.map