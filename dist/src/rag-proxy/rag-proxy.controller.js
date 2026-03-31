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
exports.RagProxyController = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let RagProxyController = class RagProxyController {
    constructor(http) {
        this.http = http;
    }
    async query(body) {
        const ragUrl = process.env.RAG_SERVICE_URL;
        if (!ragUrl) {
            throw new common_1.HttpException('RAG service not configured', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.http.post(`${ragUrl}/query/`, body, {
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                timeout: 30000,
            }));
            return data;
        }
        catch (err) {
            const status = err?.response?.status || common_1.HttpStatus.BAD_GATEWAY;
            const message = err?.response?.data?.detail || err?.message || 'RAG service error';
            throw new common_1.HttpException(message, status);
        }
    }
};
exports.RagProxyController = RagProxyController;
__decorate([
    (0, common_1.Post)('query'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RagProxyController.prototype, "query", null);
exports.RagProxyController = RagProxyController = __decorate([
    (0, common_1.Controller)('rag'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [axios_1.HttpService])
], RagProxyController);
//# sourceMappingURL=rag-proxy.controller.js.map