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
exports.BatchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const deviations_service_1 = require("../deviations/deviations.service");
const auth_service_1 = require("../auth/auth.service");
const ROLE_LEVEL = {
    BATCH_OPERATOR: 1,
    SUPERVISOR: 2,
    QA_REVIEWER: 3,
    QA_MANAGER: 4,
    QUALIFIED_PERSON: 5,
};
function hasMinRole(userRole, minRole) {
    return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minRole] || 0);
}
const STATE_TRANSITIONS = {
    DRAFT: [{ to: 'INITIATED', minRole: 'BATCH_OPERATOR', critical: false }],
    INITIATED: [{ to: 'LINE_CLEARANCE', minRole: 'SUPERVISOR', critical: true }],
    LINE_CLEARANCE: [{ to: 'IN_PROGRESS', minRole: 'SUPERVISOR', critical: true }],
    IN_PROGRESS: [
        { to: 'PENDING_QA', minRole: 'SUPERVISOR', critical: true },
        { to: 'DEVIATION', minRole: 'QA_REVIEWER', critical: false },
        { to: 'HOLD', minRole: 'QA_REVIEWER', critical: false },
    ],
    DEVIATION: [
        { to: 'IN_PROGRESS', minRole: 'QA_REVIEWER', critical: false },
        { to: 'HOLD', minRole: 'QA_REVIEWER', critical: false },
    ],
    HOLD: [
        { to: 'IN_PROGRESS', minRole: 'QA_REVIEWER', critical: false },
        { to: 'DEVIATION', minRole: 'QA_REVIEWER', critical: false },
    ],
    PENDING_QA: [
        { to: 'PENDING_QP', minRole: 'QA_MANAGER', critical: true },
        { to: 'DEVIATION', minRole: 'QA_REVIEWER', critical: false },
        { to: 'HOLD', minRole: 'QA_REVIEWER', critical: false },
    ],
    PENDING_QP: [
        { to: 'RELEASED', minRole: 'QUALIFIED_PERSON', critical: true },
        { to: 'REJECTED', minRole: 'QUALIFIED_PERSON', critical: true },
    ],
};
let BatchesService = class BatchesService {
    constructor(prisma, auditService, deviationsService, authService) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.deviationsService = deviationsService;
        this.authService = authService;
    }
    async findAll() {
        return this.prisma.batch.findMany({
            include: {
                deviations: { select: { id: true, status: true } },
                initiator: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const batch = await this.prisma.batch.findUnique({
            where: { id },
            include: {
                deviations: true,
                initiator: { select: { name: true, email: true, role: true } },
            },
        });
        if (!batch)
            throw new common_1.NotFoundException('Batch not found');
        return batch;
    }
    async create(user, templateId, batchSize, batchNumber) {
        const template = await this.prisma.batchTemplate.findUnique({ where: { id: templateId } });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        const steps = template.steps.map((s, i) => ({
            ...s,
            step_number: i + 1,
            status: 'PENDING',
            actual_values: {},
            completed_by: null,
            completed_at: null,
        }));
        const batch = await this.prisma.batch.create({
            data: {
                batchNumber,
                productCode: template.productCode,
                productName: template.productName,
                batchSize,
                state: 'DRAFT',
                initiatedBy: user.id,
                templateId: template.id,
                steps,
                signatures: [],
            },
        });
        await this.auditService.log({
            eventType: 'BATCH_CREATED',
            entityType: 'Batch',
            entityId: batch.id,
            actorId: user.id,
            actorRole: user.role,
            afterState: { state: 'DRAFT', batchNumber, productCode: template.productCode },
        });
        return batch;
    }
    async transition(batchId, user, toState, signature) {
        const batch = await this.findOne(batchId);
        const allowed = STATE_TRANSITIONS[batch.state]?.find((t) => t.to === toState);
        if (!allowed)
            throw new common_1.BadRequestException(`Cannot transition from ${batch.state} to ${toState}`);
        if (!hasMinRole(user.role, allowed.minRole))
            throw new common_1.ForbiddenException(`Role ${user.role} cannot perform this transition`);
        if (allowed.critical && !signature)
            throw new common_1.BadRequestException('E-signature required for this transition');
        if (allowed.critical && signature?.password) {
            const valid = await this.authService.verifyPassword(user.id, signature.password);
            if (!valid)
                throw new common_1.ForbiddenException('Invalid password — e-signature rejected');
        }
        const newSig = signature
            ? {
                user_id: user.id,
                user_name: user.name,
                role: user.role,
                meaning: signature.meaning,
                timestamp: new Date().toISOString(),
                step_or_transition: `TRANSITION:${batch.state}->${toState}`,
            }
            : null;
        const signatures = [...batch.signatures, ...(newSig ? [newSig] : [])];
        const updated = await this.prisma.batch.update({
            where: { id: batchId },
            data: {
                state: toState,
                signatures,
                initiatedAt: toState === 'INITIATED' ? new Date() : undefined,
                completedAt: ['RELEASED', 'REJECTED'].includes(toState) ? new Date() : undefined,
            },
        });
        await this.auditService.log({
            eventType: 'BATCH_STATE_CHANGED',
            entityType: 'Batch',
            entityId: batchId,
            actorId: user.id,
            actorRole: user.role,
            beforeState: { state: batch.state },
            afterState: { state: toState },
            metadata: newSig ? { signature: newSig } : undefined,
        });
        return updated;
    }
    async completeStep(batchId, user, stepNumber, actualValues, signature) {
        const batch = await this.findOne(batchId);
        if (!['IN_PROGRESS', 'LINE_CLEARANCE'].includes(batch.state))
            throw new common_1.BadRequestException('Batch is not in a state where steps can be completed');
        const steps = batch.steps;
        const stepIdx = steps.findIndex((s) => s.step_number === stepNumber);
        if (stepIdx === -1)
            throw new common_1.NotFoundException('Step not found');
        const step = steps[stepIdx];
        if (step.status === 'COMPLETED')
            throw new common_1.BadRequestException('Step already completed');
        const deviationFields = [];
        const requiredFields = step.required_fields || [];
        for (const field of requiredFields) {
            const val = actualValues[field.name];
            if (val === undefined || val === null)
                throw new common_1.BadRequestException(`Missing required field: ${field.name}`);
            if (field.type === 'number') {
                const numVal = parseFloat(val);
                if (field.max !== undefined && numVal > field.max) {
                    deviationFields.push({ field, val: numVal, reason: 'above max' });
                }
                if (field.min !== undefined && numVal < field.min) {
                    deviationFields.push({ field, val: numVal, reason: 'below min' });
                }
                if (field.exact_max !== undefined && numVal > field.exact_max) {
                    deviationFields.push({ field, val: numVal, reason: 'above exact_max' });
                }
            }
        }
        steps[stepIdx] = {
            ...step,
            actual_values: actualValues,
            status: 'COMPLETED',
            completed_by: user.id,
            completed_by_name: user.name,
            completed_at: new Date().toISOString(),
        };
        const newSig = signature
            ? {
                user_id: user.id,
                user_name: user.name,
                role: user.role,
                meaning: signature.meaning,
                timestamp: new Date().toISOString(),
                step_or_transition: `STEP:${stepNumber}`,
            }
            : null;
        const signatures = [...batch.signatures, ...(newSig ? [newSig] : [])];
        const updated = await this.prisma.batch.update({
            where: { id: batchId },
            data: { steps, signatures },
        });
        await this.auditService.log({
            eventType: 'STEP_COMPLETED',
            entityType: 'Batch',
            entityId: batchId,
            actorId: user.id,
            actorRole: user.role,
            afterState: { stepNumber, actualValues, status: 'COMPLETED' },
        });
        for (const dev of deviationFields) {
            const rangeStr = this.buildRangeStr(dev.field);
            await this.deviationsService.create({
                batchId,
                stepNumber,
                fieldName: dev.field.name,
                expectedRange: rangeStr,
                actualValue: dev.val,
                raisedBy: user.id,
                raisedByUser: user,
            });
        }
        return { batch: updated, deviationsRaised: deviationFields.length };
    }
    async skipStep(batchId, user, stepNumber) {
        if (!hasMinRole(user.role, 'SUPERVISOR'))
            throw new common_1.ForbiddenException('Only SUPERVISOR+ can skip steps');
        const batch = await this.findOne(batchId);
        const steps = batch.steps;
        const stepIdx = steps.findIndex((s) => s.step_number === stepNumber);
        if (stepIdx === -1)
            throw new common_1.NotFoundException('Step not found');
        steps[stepIdx] = { ...steps[stepIdx], status: 'SKIPPED', skipped_by: user.id, skipped_at: new Date().toISOString() };
        const updated = await this.prisma.batch.update({ where: { id: batchId }, data: { steps } });
        await this.auditService.log({
            eventType: 'STEP_SKIPPED',
            entityType: 'Batch',
            entityId: batchId,
            actorId: user.id,
            actorRole: user.role,
            afterState: { stepNumber, status: 'SKIPPED' },
        });
        return updated;
    }
    async addSignature(batchId, user, meaning, stepOrTransition, password) {
        const valid = await this.authService.verifyPassword(user.id, password);
        if (!valid)
            throw new common_1.ForbiddenException('Invalid password for e-signature');
        const batch = await this.findOne(batchId);
        const sig = {
            user_id: user.id,
            user_name: user.name,
            role: user.role,
            meaning,
            timestamp: new Date().toISOString(),
            step_or_transition: stepOrTransition,
        };
        const signatures = [...batch.signatures, sig];
        await this.prisma.batch.update({ where: { id: batchId }, data: { signatures } });
        await this.auditService.log({
            eventType: 'SIGNATURE_ADDED',
            entityType: 'Batch',
            entityId: batchId,
            actorId: user.id,
            actorRole: user.role,
            afterState: sig,
        });
        return sig;
    }
    async getTemplates() {
        return this.prisma.batchTemplate.findMany();
    }
    buildRangeStr(field) {
        if (field.exact_max !== undefined)
            return `max: ${field.exact_max}`;
        if (field.min !== undefined && field.max !== undefined)
            return `${field.min}–${field.max}`;
        if (field.min !== undefined)
            return `min: ${field.min}`;
        if (field.max !== undefined)
            return `max: ${field.max}`;
        return 'N/A';
    }
};
exports.BatchesService = BatchesService;
exports.BatchesService = BatchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        deviations_service_1.DeviationsService,
        auth_service_1.AuthService])
], BatchesService);
//# sourceMappingURL=batches.service.js.map