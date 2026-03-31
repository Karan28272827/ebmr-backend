import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

const ROLE_LEVEL: Record<string, number> = { BATCH_OPERATOR: 1, SUPERVISOR: 2, LAB_ANALYST: 3, QA_REVIEWER: 4, QA_MANAGER: 5, QUALIFIED_PERSON: 6, SYSTEM_ADMIN: 7 };
function hasMinRole(r: string, min: string) { return (ROLE_LEVEL[r] || 0) >= (ROLE_LEVEL[min] || 0); }

@Injectable()
export class EnvMonitoringService {
  constructor(private prisma: PrismaService, private auditService: AuditService) {}

  async findAllAreas(isActive?: boolean) {
    return this.prisma.monitoringArea.findMany({
      where: isActive !== undefined ? { is_active: isActive } : undefined,
      include: { _count: { select: { readings: true } } },
    });
  }

  async findArea(id: string) {
    const area = await this.prisma.monitoringArea.findUnique({
      where: { id },
      include: { readings: { orderBy: { recorded_at: 'desc' }, take: 20 } },
    });
    if (!area) throw new NotFoundException('Monitoring area not found');
    return area;
  }

  async createArea(user: any, data: any) {
    if (!hasMinRole(user.role, 'QA_MANAGER')) throw new ForbiddenException('Only QA_MANAGER+ can create monitoring areas');
    const count = await this.prisma.monitoringArea.count();
    const area_code = data.area_code || `MA-${String(count + 1).padStart(3, '0')}`;
    const area = await this.prisma.monitoringArea.create({ data: { ...data, area_code } });
    await this.auditService.log({ eventType: 'MONITORING_AREA_CREATED', entityType: 'MonitoringArea', entityId: area.id, actorId: user.id, actorRole: user.role });
    return area;
  }

  async recordReading(user: any, data: { area_id: string; reading_type: string; value: number; unit: string; batch_id?: string; notes?: string }) {
    const area = await this.prisma.monitoringArea.findUnique({ where: { id: data.area_id } });
    if (!area) throw new NotFoundException('Monitoring area not found');

    // Determine status based on limits
    const actionLimit = (area.action_limit as any)?.[data.reading_type];
    const alertLimit = (area.alert_limit as any)?.[data.reading_type];
    let status: 'PASS' | 'FAIL' | 'BORDERLINE' = 'PASS';
    if (actionLimit !== undefined && data.value > actionLimit) status = 'FAIL';
    else if (alertLimit !== undefined && data.value > alertLimit) status = 'BORDERLINE';

    const reading = await this.prisma.environmentalReading.create({
      data: { area_id: data.area_id, reading_type: data.reading_type, value: data.value, unit: data.unit, status, recorded_by: user.id, batch_id: data.batch_id || null, notes: data.notes || null },
    });

    await this.auditService.log({ eventType: 'ENV_READING_RECORDED', entityType: 'EnvironmentalReading', entityId: reading.id, actorId: user.id, actorRole: user.role, afterState: { reading_type: data.reading_type, value: data.value, status } });

    // If FAIL, create notifications for QA managers
    if (status === 'FAIL') {
      const qaUsers = await this.prisma.user.findMany({ where: { role: { in: ['QA_MANAGER', 'QA_REVIEWER'] }, is_active: true } });
      for (const u of qaUsers) {
        await this.prisma.notification.create({
          data: {
            user_id: u.id,
            type: 'OOS_RESULT',
            title: `Environmental Alert: ${area.name}`,
            message: `${data.reading_type} reading of ${data.value} ${data.unit} exceeded action limit in ${area.name}.`,
            reference_id: reading.id,
            reference_type: 'EnvironmentalReading',
          },
        });
      }
    }

    return reading;
  }

  async getDashboard() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [areas, totalReadings, passReadings, recentAlerts] = await Promise.all([
      this.prisma.monitoringArea.findMany({ where: { is_active: true }, include: { readings: { orderBy: { recorded_at: 'desc' }, take: 5 } } }),
      this.prisma.environmentalReading.count({ where: { recorded_at: { gte: thirtyDaysAgo } } }),
      this.prisma.environmentalReading.count({ where: { recorded_at: { gte: thirtyDaysAgo }, status: 'PASS' } }),
      this.prisma.environmentalReading.findMany({ where: { recorded_at: { gte: sevenDaysAgo }, status: { in: ['FAIL', 'BORDERLINE'] } }, include: { area: { select: { name: true } } }, orderBy: { recorded_at: 'desc' } }),
    ]);

    return {
      areas,
      compliance_pct: totalReadings > 0 ? Math.round((passReadings / totalReadings) * 100) : 100,
      total_readings_30d: totalReadings,
      alerts_7d: recentAlerts,
    };
  }

  async getReadings(areaId?: string, readingType?: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.prisma.environmentalReading.findMany({
      where: {
        recorded_at: { gte: since },
        ...(areaId ? { area_id: areaId } : {}),
        ...(readingType ? { reading_type: readingType } : {}),
      },
      include: { area: { select: { name: true, classification: true } } },
      orderBy: { recorded_at: 'desc' },
    });
  }
}
