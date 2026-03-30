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
exports.MaterialsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const materials_service_1 = require("./materials.service");
let MaterialsController = class MaterialsController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll() {
        return this.svc.findAllMaterials();
    }
    findByBarcode(code) {
        return this.svc.findByBarcode(code);
    }
    getStock() {
        return this.svc.getStock();
    }
    getExpiryAlerts(level, materialCode) {
        return this.svc.getExpiryAlerts(level, materialCode);
    }
    acknowledgeAlert(id, req) {
        return this.svc.acknowledgeAlert(id, req.user);
    }
    createIntent(req, body) {
        return this.svc.createIntent(req.user, body);
    }
    findAllIntents(status, materialCode) {
        return this.svc.findAllIntents(status, materialCode);
    }
    createPO(req, body) {
        return this.svc.createPO(req.user, body);
    }
    findAllPOs(status) {
        return this.svc.findAllPOs(status);
    }
    createReceipt(req, body) {
        return this.svc.createReceipt(req.user, body);
    }
    findAllReceipts(qcStatus, expiryBefore) {
        return this.svc.findAllReceipts(qcStatus, expiryBefore);
    }
    getExpiring(days) {
        return this.svc.getExpiring(days ? parseInt(days, 10) : 90);
    }
    findReceiptById(id) {
        return this.svc.findReceiptById(id);
    }
    createGRN(req, body) {
        return this.svc.createGRN(req.user, body);
    }
    updateGRNAccounts(id, req, body) {
        return this.svc.updateGRNAccounts(id, req.user, body);
    }
    findOne(id) {
        return this.svc.findOne(id);
    }
    createMaterial(body) {
        return this.svc.createMaterial(body);
    }
    updateMaterial(id, body) {
        return this.svc.updateMaterial(id, body);
    }
};
exports.MaterialsController = MaterialsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('barcode/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "findByBarcode", null);
__decorate([
    (0, common_1.Get)('stock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "getStock", null);
__decorate([
    (0, common_1.Get)('expiry-alerts'),
    __param(0, (0, common_1.Query)('level')),
    __param(1, (0, common_1.Query)('materialCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "getExpiryAlerts", null);
__decorate([
    (0, common_1.Patch)('expiry-alerts/:id/acknowledge'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "acknowledgeAlert", null);
__decorate([
    (0, common_1.Post)('intent'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "createIntent", null);
__decorate([
    (0, common_1.Get)('intent'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('materialCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "findAllIntents", null);
__decorate([
    (0, common_1.Post)('po'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "createPO", null);
__decorate([
    (0, common_1.Get)('po'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "findAllPOs", null);
__decorate([
    (0, common_1.Post)('receipts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "createReceipt", null);
__decorate([
    (0, common_1.Get)('receipts'),
    __param(0, (0, common_1.Query)('qcStatus')),
    __param(1, (0, common_1.Query)('expiryBefore')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "findAllReceipts", null);
__decorate([
    (0, common_1.Get)('receipts/expiring'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "getExpiring", null);
__decorate([
    (0, common_1.Get)('receipts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "findReceiptById", null);
__decorate([
    (0, common_1.Post)('grn'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "createGRN", null);
__decorate([
    (0, common_1.Patch)('grn/:id/accounts'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "updateGRNAccounts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "createMaterial", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MaterialsController.prototype, "updateMaterial", null);
exports.MaterialsController = MaterialsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('materials'),
    __metadata("design:paramtypes", [materials_service_1.MaterialsService])
], MaterialsController);
//# sourceMappingURL=materials.controller.js.map