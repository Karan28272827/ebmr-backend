import { EnvMonitoringService } from './env-monitoring.service';
export declare class EnvMonitoringController {
    private envMonitoringService;
    constructor(envMonitoringService: EnvMonitoringService);
    findAllAreas(isActive?: string): Promise<({
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
    createArea(req: any, body: any): Promise<{
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
    getReadings(areaId?: string, readingType?: string, days?: string): Promise<({
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
    recordReading(req: any, body: any): Promise<{
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
}
