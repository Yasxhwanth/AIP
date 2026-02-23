import { PrismaClient } from './generated/prisma/client';
/**
 * Computes rollups for a specific logicalId + metric over a time range.
 * Buckets raw TimeseriesMetric rows into windows and upserts TelemetryRollup.
 */
export declare function computeRollups(logicalId: string, metric: string, windowSize: string, from: Date, to: Date, prisma: PrismaClient): Promise<{
    bucketsProcessed: number;
}>;
/**
 * Compute rollups for ALL active metric + logicalId combinations
 * over a recent time window. Intended for periodic background use.
 */
export declare function computeAllRecentRollups(windowSize: string, lookbackMs: number, prisma: PrismaClient): Promise<{
    totalBuckets: number;
    combinationsProcessed: number;
}>;
/**
 * Start a background scheduler that periodically computes rollups.
 * Runs every 5 minutes and rolls up the last 10 minutes of data into 5m buckets.
 */
export declare function startRollupScheduler(prisma: PrismaClient): void;
//# sourceMappingURL=rollup-engine.d.ts.map