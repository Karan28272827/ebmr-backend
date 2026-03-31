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
exports.CapaController = void 0;
const common_1 = require("@nestjs/common");
const capa_service_1 = require("./capa.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let CapaController = class CapaController {
    constructor(capaService) {
        this.capaService = capaService;
    }
    findAll(status, source) {
        return this.capaService.findAll(status, source);
    }
    getDashboard() {
        return this.capaService.getDashboard();
    }
    findByBatch(batchId) {
        return this.capaService.findByBatch(batchId);
    }
    findByDeviation(deviationId) {
        return this.capaService.findByDeviation(deviationId);
    }
    findOne(id) {
        return this.capaService.findOne(id);
    }
    create(req, body) {
        return this.capaService.create(req.user, body);
    }
    update(id, req, body) {
        return this.capaService.update(id, req.user, body);
    }
    close(id, req, body) {
        return this.capaService.close(id, req.user, body);
    }
};
exports.CapaController = CapaController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('source')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CapaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CapaController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('batch/:batchId'),
    __param(0, (0, common_1.Param)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CapaController.prototype, "findByBatch", null);
__decorate([
    (0, common_1.Get)('deviation/:deviationId'),
    __param(0, (0, common_1.Param)('deviationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CapaController.prototype, "findByDeviation", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CapaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CapaController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CapaController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CapaController.prototype, "close", null);
exports.CapaController = CapaController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('capa'),
    __metadata("design:paramtypes", [capa_service_1.CapaService])
], CapaController);
//# sourceMappingURL=capa.controller.js.map