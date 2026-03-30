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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QcService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const ROLE_LEVEL = {
    BATCH_OPERATOR: 1,
    SUPERVISOR: 2,
    LAB_ANALYST: 3,
    QA_REVIEWER: 4,
    QA_MANAGER: 5,
    QUALIFIED_PERSON: 6,
    SYSTEM_ADMIN: 7,
};
function hasMinRole(userRole, minRole) {
    return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minRole] || 0);
}
let QcService = class QcService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAll(stage, status, batchId) {
        return this.prisma.qCTest.findMany({
            where: {
                ...(stage ? { qc_stage: stage } : {}),
                ...(status ? { status: status } : {}),
                ...(batchId ? { batch_id: batchId } : {}),
            },
            include: {
                results: true,
                material_receipt: { select: { receipt_code: true } },
                batch: { select: { batchNumber: true } },
            },
            orderBy: { initiated_at: 'desc' },
        });
    }
    async findOne(id) {
        const test = await this.prisma.qCTest.findUnique({
            where: { id },
            include: {
                results: true,
                material_receipt: true,
                batch: true,
                checklist_executions: { include: { item_responses: true } },
            },
        });
        if (!test)
            throw new common_1.NotFoundException('QC test not found');
        return test;
    }
    async createTest(user, data) {
        const count = await this.prisma.qCTest.count();
        const test_code = `${data.qc_stage}-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        const test = await this.prisma.qCTest.create({
            data: {
                ...data,
                test_code,
                qc_stage: data.qc_stage,
                initiated_by: user.id,
                status: 'PENDING',
            },
        });
        await this.auditService.log({
            eventType: 'QC_TEST_CREATED',
            entityType: 'QCTest',
            entityId: test.id,
            actorId: user.id,
            actorRole: user.role,
            afterState: { test_code, qc_stage: data.qc_stage },
        });
        return test;
    }
    async submitResults(testId, user, results) {
        const test = await this.findOne(testId);
        if (test.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Test already completed');
        }
        const resultsData = results.map((r) => {
            let is_within_spec = true;
            const numVal = parseFloat(r.actual_value);
            if (!isNaN(numVal)) {
                if (r.min_value !== undefined && numVal < r.min_value)
                    is_within_spec = false;
                if (r.max_value !== undefined && numVal > r.max_value)
                    is_within_spec = false;
            }
            return { ...r, qc_test_id: testId, is_within_spec, tested_by: user.id };
        });
        await this.prisma.qCTestResult.deleteMany({ where: { qc_test_id: testId } });
        await this.prisma.qCTestResult.createMany({ data: resultsData });
        await this.prisma.qCTest.update({
            where: { id: testId },
            data: { status: 'IN_PROGRESS' },
        });
        await this.auditService.log({
            eventType: 'QC_RESULTS_SUBMITTED',
            entityType: 'QCTest',
            entityId: testId,
            actorId: user.id,
            actorRole: user.role,
            afterState: { results_count: results.length },
        });
        return this.findOne(testId);
    }
    async recordVerdict(testId, user, verdict, notes) {
        if (!hasMinRole(user.role, 'QA_REVIEWER')) {
            throw new common_1.ForbiddenException('Only QA_REVIEWER+ can record verdicts');
        }
        const test = await this.findOne(testId);
        if (test.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Test already completed');
        }
        const updated = await this.prisma.qCTest.update({
            where: { id: testId },
            data: {
                overall_verdict: verdict,
                verdict_notes: notes,
                verdict_by: user.id,
                verdict_at: new Date(),
                status: 'COMPLETED',
                completed_by: user.id,
                completed_at: new Date(),
            },
        });
        if (test.material_receipt_id) {
            const receiptStatus = verdict === 'PASS'
                ? 'IQC_PASSED'
                : verdict === 'FAIL'
                    ? 'IQC_FAILED'
                    : 'QUARANTINE';
            await this.prisma.materialReceipt.update({
                where: { id: test.material_receipt_id },
                data: { qc_status: receiptStatus },
            });
        }
        await this.auditService.log({
            eventType: 'QC_VERDICT_RECORDED',
            entityType: 'QCTest',
            entityId: testId,
            actorId: user.id,
            actorRole: user.role,
            afterState: { verdict, notes },
        });
        return updated;
    }
    async getDashboard() {
        const [pendingIQC, pendingLQC, pendingOQC, recentTests] = await Promise.all([
            this.prisma.qCTest.count({
                where: { qc_stage: 'IQC', status: { in: ['PENDING', 'IN_PROGRESS'] } },
            }),
            this.prisma.qCTest.count({
                where: { qc_stage: 'LQC', status: { in: ['PENDING', 'IN_PROGRESS'] } },
            }),
            this.prisma.qCTest.count({
                where: { qc_stage: 'OQC', status: { in: ['PENDING', 'IN_PROGRESS'] } },
            }),
            this.prisma.qCTest.findMany({
                where: { status: 'COMPLETED' },
                orderBy: { completed_at: 'desc' },
                take: 100,
                select: { overall_verdict: true, qc_stage: true },
            }),
        ]);
        const passCount = recentTests.filter((t) => t.overall_verdict === 'PASS').length;
        const passRate = recentTests.length > 0 ? Math.round((passCount / recentTests.length) * 100) : 0;
        return {
            pendingIQC,
            pendingLQC,
            pendingOQC,
            passRate,
            totalCompleted: recentTests.length,
        };
    }
    async findAllChecklists(stage) {
        return this.prisma.qCChecklist.findMany({
            where: stage ? { qc_stage: stage } : {},
            include: { _count: { select: { items: true } } },
            orderBy: { created_at: 'desc' },
        });
    }
    async findChecklist(id) {
        const cl = await this.prisma.qCChecklist.findUnique({
            where: { id },
            include: { items: { orderBy: { item_number: 'asc' } } },
        });
        if (!cl)
            throw new common_1.NotFoundException('Checklist not found');
        return cl;
    }
    async createChecklist(user, data) {
        if (!hasMinRole(user.role, 'QA_MANAGER')) {
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can create checklists');
        }
        const count = await this.prisma.qCChecklist.count();
        const checklist_code = `CHK-${data.qc_stage}-${String(count + 1).padStart(4, '0')}`;
        return this.prisma.qCChecklist.create({
            data: { ...data, checklist_code, created_by: user.id, status: 'DRAFT' },
        });
    }
    async addChecklistItems(checklistId, user, items) {
        if (!hasMinRole(user.role, 'QA_MANAGER')) {
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can add checklist items');
        }
        const cl = await this.findChecklist(checklistId);
        if (!cl)
            throw new common_1.NotFoundException('Checklist not found');
        await this.prisma.checklistItem.createMany({
            data: items.map((item) => ({ ...item, checklist_id: checklistId })),
        });
        return this.findChecklist(checklistId);
    }
    async startChecklistExecution(user, checklistId, qcTestId) {
        return this.prisma.checklistExecution.create({
            data: {
                checklist_id: checklistId,
                qc_test_id: qcTestId,
                executed_by: user.id,
                status: 'IN_PROGRESS',
            },
        });
    }
    async updateChecklistItem(executionId, itemId, user, data) {
        const existing = await this.prisma.checklistItemResponse.findFirst({
            where: { execution_id: executionId, item_id: itemId },
        });
        if (existing) {
            return this.prisma.checklistItemResponse.update({
                where: { id: existing.id },
                data: {
                    ...data,
                    completed_at: data.is_completed ? new Date() : null,
                },
            });
        }
        return this.prisma.checklistItemResponse.create({
            data: {
                execution_id: executionId,
                item_id: itemId,
                ...data,
                completed_at: data.is_completed ? new Date() : null,
            },
        });
    }
    async completeChecklistExecution(executionId, user) {
        const exec = await this.prisma.checklistExecution.findUnique({
            where: { id: executionId },
            include: {
                checklist: { include: { items: true } },
                item_responses: true,
            },
        });
        if (!exec)
            throw new common_1.NotFoundException('Execution not found');
        const mandatoryItems = exec.checklist.items.filter((i) => i.is_mandatory);
        const completedMandatory = exec.item_responses.filter((r) => r.is_completed && mandatoryItems.some((m) => m.id === r.item_id)).length;
        if (completedMandatory < mandatoryItems.length) {
            throw new common_1.BadRequestException(`${mandatoryItems.length - completedMandatory} mandatory items not completed`);
        }
        return this.prisma.checklistExecution.update({
            where: { id: executionId },
            data: { status: 'COMPLETED', completed_at: new Date() },
        });
    }
};
exports.QcService = QcService;
exports.QcService = QcService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], QcService);
//# sourceMappingURL=qc.service.js.map