import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const ROLE_LEVEL: Record<string, number> = {
  BATCH_OPERATOR: 1,
  SUPERVISOR: 2,
  LAB_ANALYST: 3,
  QA_REVIEWER: 4,
  QA_MANAGER: 5,
  QUALIFIED_PERSON: 6,
  SYSTEM_ADMIN: 7,
};

function hasMinRole(userRole: string, minRole: string): boolean {
  return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minRole] || 0);
}

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(status?: string) {
    return this.prisma.vendor.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
      },
      include: {
        _count: { select: { purchase_orders: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        purchase_orders: {
          take: 10,
          orderBy: { created_at: 'desc' },
        },
      },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async create(user: any, data: {
    vendor_code?: string;
    name: string;
    country: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    qualification_date?: string;
    materials_supplied?: string[];
    approved_categories?: string[];
    notes?: string;
  }) {
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

  async update(id: string, user: any, data: {
    name?: string;
    country?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    status?: string;
    qualification_date?: string;
    next_audit_date?: string;
    materials_supplied?: string[];
    approved_categories?: string[];
    notes?: string;
  }) {
    if (!hasMinRole(user.role, 'QA_MANAGER') && user.role !== 'SYSTEM_ADMIN')
      throw new ForbiddenException('Only QA_MANAGER+ or SYSTEM_ADMIN can update vendors');

    const existing = await this.findOne(id);

    const updateData: any = {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.country !== undefined ? { country: data.country } : {}),
      ...(data.contact_name !== undefined ? { contact_name: data.contact_name } : {}),
      ...(data.contact_email !== undefined ? { contact_email: data.contact_email } : {}),
      ...(data.contact_phone !== undefined ? { contact_phone: data.contact_phone } : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
      ...(data.status ? { status: data.status as any } : {}),
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

  async qualify(id: string, user: any) {
    if (!hasMinRole(user.role, 'QA_MANAGER'))
      throw new ForbiddenException('Only QA_MANAGER+ can qualify vendors');

    const existing = await this.findOne(id);

    const updated = await this.prisma.vendor.update({
      where: { id },
      data: {
        status: 'ACTIVE' as any,
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

  async suspend(id: string, user: any, reason: string) {
    if (!hasMinRole(user.role, 'QA_MANAGER'))
      throw new ForbiddenException('Only QA_MANAGER+ can suspend vendors');

    const existing = await this.findOne(id);

    const updated = await this.prisma.vendor.update({
      where: { id },
      data: {
        status: 'SUSPENDED' as any,
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
}
