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
exports.VendorService = void 0;
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
let VendorService = class VendorService {
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async findAll(status) {
        return this.prisma.vendor.findMany({
            where: {
                ...(status ? { status: status } : {}),
            },
            include: {
                _count: { select: { purchase_orders: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async findOne(id) {
        const vendor = await this.prisma.vendor.findUnique({
            where: { id },
            include: {
                purchase_orders: {
                    take: 10,
                    orderBy: { created_at: 'desc' },
                },
            },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor not found');
        return vendor;
    }
    async create(user, data) {
        let vendor_code = data.vendor_code;
        if (!vendor_code) {
            const count = await this.prisma.vendor.count();
            vendor_code = `VEN-${String(count + 1).padStart(4, '0')}`;
        }
        const vendor = await this.prisma.vendor.create({
            data: {
                vendor_code,
                name: data.name,
                country: data.country,
                ...(data.contact_name !== undefined ? { contact_name: data.contact_name } : {}),
                ...(data.contact_email !== undefined ? { contact_email: data.contact_email } : {}),
                ...(data.contact_phone !== undefined ? { contact_phone: data.contact_phone } : {}),
                ...(data.address !== undefined ? { address: data.address } : {}),
                ...(data.qualification_date ? { qualification_date: new Date(data.qualification_date) } : {}),
                ...(data.materials_supplied ? { materials_supplied: data.materials_supplied } : {}),
                ...(data.approved_categories ? { approved_categories: data.approved_categories } : {}),
                ...(data.notes !== undefined ? { notes: data.notes } : {}),
                created_by: user.id,
            },
        });
        await this.auditService.log({
            eventType: 'VENDOR_CREATED',
            entityType: 'Vendor',
            entityId: vendor.id,
            actorId: user.id,
            actorRole: user.role,
            afterState: { vendor_code, name: data.name, country: data.country },
        });
        return vendor;
    }
    async update(id, user, data) {
        if (!hasMinRole(user.role, 'QA_MANAGER') && user.role !== 'SYSTEM_ADMIN')
            throw new common_1.ForbiddenException('Only QA_MANAGER+ or SYSTEM_ADMIN can update vendors');
        const existing = await this.findOne(id);
        const updateData = {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.country !== undefined ? { country: data.country } : {}),
            ...(data.contact_name !== undefined ? { contact_name: data.contact_name } : {}),
            ...(data.contact_email !== undefined ? { contact_email: data.contact_email } : {}),
            ...(data.contact_phone !== undefined ? { contact_phone: data.contact_phone } : {}),
            ...(data.address !== undefined ? { address: data.address } : {}),
            ...(data.status ? { status: data.status } : {}),
            ...(data.qualification_date ? { qualification_date: new Date(data.qualification_date) } : {}),
            ...(data.next_audit_date ? { next_audit_date: new Date(data.next_audit_date) } : {}),
            ...(data.materials_supplied ? { materials_supplied: data.materials_supplied } : {}),
            ...(data.approved_categories ? { approved_categories: data.approved_categories } : {}),
            ...(data.notes !== undefined ? { notes: data.notes } : {}),
        };
        const updated = await this.prisma.vendor.update({
            where: { id },
            data: updateData,
        });
        await this.auditService.log({
            eventType: 'VENDOR_UPDATED',
            entityType: 'Vendor',
            entityId: id,
            actorId: user.id,
            actorRole: user.role,
            beforeState: {
                name: existing.name,
                country: existing.country,
                status: existing.status,
            },
            afterState: updateData,
        });
        return updated;
    }
    async qualify(id, user) {
        if (!hasMinRole(user.role, 'QA_MANAGER'))
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can qualify vendors');
        const existing = await this.findOne(id);
        const updated = await this.prisma.vendor.update({
            where: { id },
            data: {
                status: 'ACTIVE',
                qualification_date: new Date(),
            },
        });
        await this.auditService.log({
            eventType: 'VENDOR_QUALIFIED',
            entityType: 'Vendor',
            entityId: id,
            actorId: user.id,
            actorRole: user.role,
            beforeState: { status: existing.status },
            afterState: { status: 'ACTIVE', qualification_date: updated.qualification_date },
        });
        return updated;
    }
    async suspend(id, user, reason) {
        if (!hasMinRole(user.role, 'QA_MANAGER'))
            throw new common_1.ForbiddenException('Only QA_MANAGER+ can suspend vendors');
        const existing = await this.findOne(id);
        const updated = await this.prisma.vendor.update({
            where: { id },
            data: {
                status: 'SUSPENDED',
            },
        });
        await this.auditService.log({
            eventType: 'VENDOR_SUSPENDED',
            entityType: 'Vendor',
            entityId: id,
            actorId: user.id,
            actorRole: user.role,
            beforeState: { status: existing.status },
            afterState: { status: 'SUSPENDED' },
            metadata: { reason },
        });
        return updated;
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], VendorService);
//# sourceMappingURL=vendor.service.js.map