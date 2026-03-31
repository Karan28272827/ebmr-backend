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
exports.StockController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const stock_service_1 = require("./stock.service");
let StockController = class StockController {
    constructor(stockService) {
        this.stockService = stockService;
    }
    getCurrentStock(materialCode) {
        return this.stockService.getCurrentStock(materialCode);
    }
    getLedger(materialCode, limit) {
        return this.stockService.getLedger(materialCode, limit ? parseInt(limit) : 100);
    }
    getExpiryReport() {
        return this.stockService.getExpiryReport();
    }
    recordMovement(req, body) {
        return this.stockService.recordMovement(req.user, body);
    }
    fefoIssue(req, body) {
        return this.stockService.fefoIssue(req.user, body);
    }
};
exports.StockController = StockController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('materialCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getCurrentStock", null);
__decorate([
    (0, common_1.Get)('ledger'),
    __param(0, (0, common_1.Query)('materialCode')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getLedger", null);
__decorate([
    (0, common_1.Get)('expiry'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockController.prototype, "getExpiryReport", null);
__decorate([
    (0, common_1.Post)('movement'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "recordMovement", null);
__decorate([
    (0, common_1.Post)('fefo-issue'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], StockController.prototype, "fefoIssue", null);
exports.StockController = StockController = __decorate([
    (0, common_1.Controller)('stock'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stock_service_1.StockService])
], StockController);
//# sourceMappingURL=stock.controller.js.map