import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ROLE_LEVEL: Record<string, number> = {
  BATCH_OPERATOR: 1, SUPERVISOR: 2, QA_REVIEWER: 3, QA_MANAGER: 4, QUALIFIED_PERSON: 5,
};

@Injectable()
export class IssuesService {
  constructor(private prisma: PrismaService) {}

  findAll(filters?: { batchId?: string; status?: string; severity?: string }) {
    const where: any = {};
    if (filters?.batchId) where.batchId = filters.batchId;
    if (filters?.status) where.status = filters.status;
    if (filters?.severity) where.severity = filters.severity;
    return this.prisma.issue.findMany({
      where,
      orderBy: { raisedAt: 'desc' },
      include: {
        raiser: { select: { name: true, role: true } },
        assignee: { select: { name: true, role: true } },
        batch: { select: { batchNumber: true, productName: true } },
      },
    });
  }

  async findOne(id: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
      include: {
        raiser: { select: { name: true, email: true, role: true } },
        assignee: { select: { name: true, email: true, role: true } },
        resolver: { select: { name: true, email: true, role: true } },
        batch: { select: { batchNumber: true, productName: true, state: true } },
      },
    });
    if (!issue) throw new NotFoundException('Issue not found');
    return issue;
  }

  create(user: any, dto: {
    title: string;
    description: string;
    severity: string;
    batchId?: string;
    assignedTo?: string;
  }) {
    return this.prisma.issue.create({
      data: {
        title: dto.title,
        description: dto.description,
        severity: dto.severity as any,
        batchId: dto.batchId || null,
        assignedTo: dto.assignedTo || null,
        raisedBy: user.id,
      },
      include: {
        raiser: { select: { name: true, role: true } },
        batch: { select: { batchNumber: true, productName: true } },
      },
    });
  }

  async updateStatus(id: string, user: any, status: string) {
    if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.SUPERVISOR)
      throw new ForbiddenException('Only SUPERVISOR+ can update issue status');
    await this.findOne(id);
    return this.prisma.issue.update({
      where: { id },
      data: { status: status as any },
      include: { raiser: { select: { name: true, role: true } } },
    });
  }

  async resolve(id: string, user: any, resolution: string) {
    if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.SUPERVISOR)
      throw new ForbiddenException('Only SUPERVISOR+ can resolve issues');
    if (!resolution?.trim()) throw new BadRequestException('Resolution notes are required');
    const issue = await this.findOne(id);
    if (issue.status === 'CLOSED') throw new BadRequestException('Issue already closed');
    return this.prisma.issue.update({
      where: { id },
      data: { status: 'RESOLVED', resolution, resolvedBy: user.id, resolvedAt: new Date() },
      include: {
        raiser: { select: { name: true, role: true } },
        resolver: { select: { name: true, role: true } },
      },
    });
  }

  async close(id: string, user: any) {
    if ((ROLE_LEVEL[user.role] || 0) < ROLE_LEVEL.QA_REVIEWER)
      throw new ForbiddenException('Only QA_REVIEWER+ can close issues');
    const issue = await this.findOne(id);
    if (issue.status !== 'RESOLVED') throw new BadRequestException('Issue must be RESOLVED before closing');
    return this.prisma.issue.update({ where: { id }, data: { status: 'CLOSED' } });
  }
}
