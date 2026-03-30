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
exports.QcController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const qc_service_1 = require("./qc.service");
let QcController = class QcController {
    constructor(qcService) {
        this.qcService = qcService;
    }
    getDashboard() {
        return this.qcService.getDashboard();
    }
    findAll(stage, status, batchId) {
        return this.qcService.findAll(stage, status, batchId);
    }
    findOne(id) {
        return this.qcService.findOne(id);
    }
    createTest(req, body) {
        return this.qcService.createTest(req.user, body);
    }
    submitResults(id, req, body) {
        return this.qcService.submitResults(id, req.user, body.results);
    }
    recordVerdict(id, req, body) {
        return this.qcService.recordVerdict(id, req.user, body.verdict, body.notes);
    }
    findAllChecklists(stage) {
        return this.qcService.findAllChecklists(stage);
    }
    createChecklist(req, body) {
        return this.qcService.createChecklist(req.user, body);
    }
    findChecklist(id) {
        return this.qcService.findChecklist(id);
    }
    addChecklistItems(id, req, body) {
        return this.qcService.addChecklistItems(id, req.user, body.items);
    }
    startChecklistExecution(req, body) {
        return this.qcService.startChecklistExecution(req.user, body.checklistId, body.qcTestId);
    }
    updateChecklistItem(executionId, itemId, req, body) {
        return this.qcService.updateChecklistItem(executionId, itemId, req.user, body);
    }
    completeChecklistExecution(executionId, req) {
        return this.qcService.completeChecklistExecution(executionId, req.user);
    }
};
exports.QcController = QcController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], QcController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('tests'),
    __param(0, (0, common_1.Query)('stage')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('batchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], QcController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tests/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QcController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('tests'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], QcController.prototype, "createTest", null);
__decorate([
    (0, common_1.Post)('tests/:id/results'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], QcController.prototype, "submitResults", null);
__decorate([
    (0, common_1.Patch)('tests/:id/verdict'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], QcController.prototype, "recordVerdict", null);
__decorate([
    (0, common_1.Get)('checklists'),
    __param(0, (0, common_1.Query)('stage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QcController.prototype, "findAllChecklists", null);
__decorate([
    (0, common_1.Post)('checklists'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], QcController.prototype, "createChecklist", null);
__decorate([
    (0, common_1.Get)('checklists/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QcController.prototype, "findChecklist", null);
__decorate([
    (0, common_1.Post)('checklists/:id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], QcController.prototype, "addChecklistItems", null);
__decorate([
    (0, common_1.Post)('executions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], QcController.prototype, "startChecklistExecution", null);
__decorate([
    (0, common_1.Patch)('executions/:executionId/items/:itemId'),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], QcController.prototype, "updateChecklistItem", null);
__decorate([
    (0, common_1.Post)('executions/:executionId/complete'),
    __param(0, (0, common_1.Param)('executionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QcController.prototype, "completeChecklistExecution", null);
exports.QcController = QcController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('qc'),
    __metadata("design:paramtypes", [qc_service_1.QcService])
], QcController);
//# sourceMappingURL=qc.controller.js.map