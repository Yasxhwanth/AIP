"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityService = void 0;
class QualityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Calculate data distribution metrics for a given entity type.
     */
    async calculateDistribution(entityTypeId, projectId) {
        const instances = await this.prisma.currentEntityState.findMany({
            where: { entityTypeId, projectId }
        });
        if (instances.length === 0)
            return { count: 0, fields: {} };
        const fieldStats = {};
        instances.forEach(inst => {
            const data = inst.data;
            Object.entries(data).forEach(([key, value]) => {
                if (!fieldStats[key]) {
                    fieldStats[key] = {
                        type: typeof value,
                        count: 0,
                        nullCount: 0,
                        frequencies: {},
                        sum: 0,
                        values: []
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
                }
                else if (typeof value === 'number') {
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
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10);
                delete stats.frequencies;
                delete stats.values;
            }
            else if (stats.type === 'number') {
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
    async recordBaseline(entityTypeId, projectId) {
        const distribution = await this.calculateDistribution(entityTypeId, projectId);
        // In a real system, we'd save this to a Baseline table.
        // For now, we'll return it and allow the frontend to use it.
        return distribution;
    }
}
exports.QualityService = QualityService;
//# sourceMappingURL=quality-service.js.map