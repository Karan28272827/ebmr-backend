import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
export declare class EnvMonitoringService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    findAllAreas(isActive?: boolean): Promise<({
        _count: {
            readings: number;
        };
    } & {
        id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        area_code: string;
        location: string;
        classification: string;
        alert_limit: import("@prisma/client/runtime/library").JsonValue;
        action_limit: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    findArea(id: string): Promise<{
        readings: {
            id: string;
            status: import(".prisma/client").$Enums.EnvReadingStatus;
            unit: string;
            batch_id: string | null;
            notes: string | null;
            recorded_by: string;
            recorded_at: Date;
            area_id: string;
            reading_type: string;
            value: number;
        }[];
    } & {
        id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        area_code: string;
        location: string;
        classification: string;
        alert_limit: import("@prisma/client/runtime/library").JsonValue;
        action_limit: import("@prisma/client/runtime/library").JsonValue;
    }>;
    createArea(user: any, data: any): Promise<{
        id: string;
        name: string;
        is_active: boolean;
        created_at: Date;
        area_code: string;
        location: string;
        classification: string;
        alert_limit: import("@prisma/client/runtime/library").JsonValue;
        action_limit: import("@prisma/client/runtime/library").JsonValue;
    }>;
    recordReading(user: any, data: {
        area_id: string;
        reading_type: string;
        value: number;
        unit: string;
        batch_id?: string;
        notes?: string;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EnvReadingStatus;
        unit: string;
        batch_id: string | null;
        notes: string | null;
        recorded_by: string;
        recorded_at: Date;
        area_id: string;
        reading_type: string;
        value: number;
    }>;
    getDashboard(): Promise<{
        areas: ({
            readings: {
                id: string;
                status: import(".prisma/client").$Enums.EnvReadingStatus;
                unit: string;
                batch_id: string | null;
                notes: string | null;
                recorded_by: string;
                recorded_at: Date;
                area_id: string;
                reading_type: string;
                value: number;
            }[];
        } & {
            id: string;
            name: string;
            is_active: boolean;
            created_at: Date;
            area_code: string;
            location: string;
            classification: string;
            alert_limit: import("@prisma/client/runtime/library").JsonValue;
            action_limit: import("@prisma/client/runtime/library").JsonValue;
        })[];
        compliance_pct: number;
        total_readings_30d: number;
        alerts_7d: ({
            area: {
                name: string;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.EnvReadingStatus;
            unit: string;
            batch_id: string | null;
            notes: string | null;
            recorded_by: string;
            recorded_at: Date;
            area_id: string;
            reading_type: string;
            value: number;
        })[];
    }>;
    getReadings(areaId?: string, readingType?: string, days?: number): Promise<({
        area: {
            name: string;
            classification: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.EnvReadingStatus;
        unit: string;
        batch_id: string | null;
        notes: string | null;
        recorded_by: string;
        recorded_at: Date;
        area_id: string;
        reading_type: string;
        value: number;
    })[]>;
}
