import { PrismaClient } from './generated/prisma';
import logger from './logger';

export class QualityService {
    constructor(private prisma: PrismaClient) { }

    /**
     * Calculate data distribution metrics for a given entity type.
     */
    async calculateDistribution(entityTypeId: string, projectId: string) {
        const instances = await this.prisma.currentEntityState.findMany({
            where: { entityTypeId, projectId }
        });

        if (instances.length === 0) return { count: 0, fields: {} };

        const fieldStats: Record<string, any> = {};

        instances.forEach(inst => {
            const data = inst.data as Record<string, any>;
            Object.entries(data).forEach(([key, value]) => {
                if (!fieldStats[key]) {
                    fieldStats[key] = {
                        type: typeof value,
                        count: 0,
                        nullCount: 0,
                        frequencies: {} as Record<string, number>,
                        sum: 0,
                        values: [] as number[]
                    };
                }

                const stats = fieldStats[key];
                stats.count++;

                if (value === null || value === undefined) {
                    stats.nullCount++;
                    return;
                }

                if (typeof value === 'string') {
                    stats.frequencies[value] = (stats.frequencies[value] || 0) + 1;
                } else if (typeof value === 'number') {
                    stats.sum += value;
                    stats.values.push(value);
                }
            });
        });

        // Finalize stats (averages, top values)
        Object.keys(fieldStats).forEach(key => {
            const stats = fieldStats[key];
            if (stats.type === 'string') {
                // Keep top 10 frequencies
                stats.topValues = Object.entries(stats.frequencies)
                    .sort((a: any, b: any) => b[1] - a[1])
                    .slice(0, 10);
                delete stats.frequencies;
                delete stats.values;
            } else if (stats.type === 'number') {
                stats.avg = stats.count > 0 ? stats.sum / stats.count : 0;
                delete stats.values;
            }
        });

        return {
            entityTypeId,
            totalCount: instances.length,
            fieldStats
        };
    }

    /**
     * Record a baseline for drift detection.
     */
    async recordBaseline(entityTypeId: string, projectId: string) {
        const distribution = await this.calculateDistribution(entityTypeId, projectId);
        // In a real system, we'd save this to a Baseline table.
        // For now, we'll return it and allow the frontend to use it.
        return distribution;
    }
}
