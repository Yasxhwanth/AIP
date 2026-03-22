import { PrismaClient } from './generated/prisma';
export declare class QualityService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Calculate data distribution metrics for a given entity type.
     */
    calculateDistribution(entityTypeId: string, projectId: string): Promise<{
        count: number;
        fields: {};
        entityTypeId?: undefined;
        totalCount?: undefined;
        fieldStats?: undefined;
    } | {
        entityTypeId: string;
        totalCount: number;
        fieldStats: Record<string, any>;
        count?: undefined;
        fields?: undefined;
    }>;
    /**
     * Record a baseline for drift detection.
     */
    recordBaseline(entityTypeId: string, projectId: string): Promise<{
        count: number;
        fields: {};
        entityTypeId?: undefined;
        totalCount?: undefined;
        fieldStats?: undefined;
    } | {
        entityTypeId: string;
        totalCount: number;
        fieldStats: Record<string, any>;
        count?: undefined;
        fields?: undefined;
    }>;
}
//# sourceMappingURL=quality-service.d.ts.map