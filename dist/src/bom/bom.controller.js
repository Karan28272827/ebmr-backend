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
exports.BomController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const bom_service_1 = require("./bom.service");
let BomController = class BomController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll(productCode, status) {
        return this.svc.findAll(productCode, status);
    }
    findOne(id) {
        return this.svc.findOne(id);
    }
    create(req, body) {
        return this.svc.create(req.user, body);
    }
    updateStatus(id, req, body) {
        return this.svc.updateStatus(id, req.user, body.status);
    }
    simulate(id, body) {
        return this.svc.simulate(id, body.targetBatchSize);
    }
    findAllLegacy() {
        return this.svc.findAllLegacy();
    }
    addLegacyBomItem(body) {
        return this.svc.addLegacyBomItem(body.templateId, body.materialId, body.qtyPerKg, body.notes);
    }
    removeLegacyBomItem(id) {
        return this.svc.removeLegacyBomItem(id);
    }
    getTemplateBoM(templateId) {
        return this.svc.getTemplateBoM(templateId);
    }
    addItem(req, templateId, body) {
        return this.svc.addItem(req.user, templateId, body);
    }
    removeItem(req, id) {
        return this.svc.removeItem(req.user, id);
    }
    getRequiredMaterials(batchId) {
        return this.svc.getRequiredMaterials(batchId);
    }
    getBatchIssuances(batchId) {
        return this.svc.getBatchIssuances(batchId);
    }
    issueForBatch(req, batchId, body) {
        return this.svc.issueForBatch(req.user, batchId, body);
    }
};
exports.BomController = BomController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('productCode')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/simulate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "simulate", null);
__decorate([
    (0, common_1.Get)('legacy/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BomController.prototype, "findAllLegacy", null);
__decorate([
    (0, common_1.Post)('legacy/items'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "addLegacyBomItem", null);
__decorate([
    (0, common_1.Delete)('legacy/items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "removeLegacyBomItem", null);
__decorate([
    (0, common_1.Get)('templates/:templateId'),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "getTemplateBoM", null);
__decorate([
    (0, common_1.Post)('templates/:templateId/items'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('templateId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "addItem", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Get)('batches/:batchId'),
    __param(0, (0, common_1.Param)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "getRequiredMaterials", null);
__decorate([
    (0, common_1.Get)('batches/:batchId/issuances'),
    __param(0, (0, common_1.Param)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "getBatchIssuances", null);
__decorate([
    (0, common_1.Post)('batches/:batchId/issuances'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('batchId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], BomController.prototype, "issueForBatch", null);
exports.BomController = BomController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('bom'),
    __metadata("design:paramtypes", [bom_service_1.BomService])
], BomController);
//# sourceMappingURL=bom.controller.js.map