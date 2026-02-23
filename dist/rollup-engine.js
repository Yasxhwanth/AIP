"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeRollups = computeRollups;
exports.computeAllRecentRollups = computeAllRecentRollups;
exports.startRollupScheduler = startRollupScheduler;
const WINDOW_SIZES = {
    '5m': { label: '5 minutes', ms: 5 * 60 * 1000 },
    '15m': { label: '15 minutes', ms: 15 * 60 * 1000 },
    '1h': { label: '1 hour', ms: 60 * 60 * 1000 },
    '1d': { label: '1 day', ms: 24 * 60 * 60 * 1000 },
};
/**
 * Floor a timestamp to the start of its window bucket.
 * e.g., 10:07 with windowSize "5m" → 10:05
 */
function floorToWindow(timestamp, windowMs) {
    const ms = timestamp.getTime();
    return new Date(ms - (ms % windowMs));
}
// ── Rollup Engine ────────────────────────────────────────────────
/**
 * Computes rollups for a specific logicalId + metric over a time range.
 * Buckets raw TimeseriesMetric rows into windows and upserts TelemetryRollup.
 */
async function computeRollups(logicalId, metric, windowSize, from, to, prisma) {
    const windowConfig = WINDOW_SIZES[windowSize];
    if (!windowConfig) {
        throw new Error(`Unsupported windowSize '${windowSize}'. Use: ${Object.keys(WINDOW_SIZES).join(', ')}`);
    }
    // Fetch raw data points in the time range
    const rawPoints = await prisma.timeseriesMetric.findMany({
        where: {
            logicalId,
            metric,
            timestamp: { gte: from, lte: to },
        },
        orderBy: { timestamp: 'asc' },
    });
    if (rawPoints.length === 0) {
        return { bucketsProcessed: 0 };
    }
    // Group points into buckets
    const buckets = new Map(); // windowStartMs → values
    for (const point of rawPoints) {
        const windowStart = floorToWindow(point.timestamp, windowConfig.ms);
        const key = windowStart.getTime();
        const existing = buckets.get(key);
        if (existing) {
            existing.push(point.value);
        }
        else {
            buckets.set(key, [point.value]);
        }
    }
    // Upsert each bucket as a TelemetryRollup
    let bucketsProcessed = 0;
    for (const [windowStartMs, values] of buckets) {
        const windowStart = new Date(windowStartMs);
        const count = values.length;
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / count;
        const min = Math.min(...values);
        const max = Math.max(...values);
        await prisma.telemetryRollup.upsert({
            where: {
                logicalId_metric_windowSize_windowStart: {
                    logicalId,
                    metric,
                    windowSize,
                    windowStart,
                },
            },
            create: {
                logicalId,
                metric,
                windowSize,
                windowStart,
                avg,
                min,
                max,
                sum,
                count,
            },
            update: { avg, min, max, sum, count },
        });
        bucketsProcessed++;
    }
    return { bucketsProcessed };
}
/**
 * Compute rollups for ALL active metric + logicalId combinations
 * over a recent time window. Intended for periodic background use.
 */
async function computeAllRecentRollups(windowSize, lookbackMs, prisma) {
    const now = new Date();
    const from = new Date(now.getTime() - lookbackMs);
    // Find all distinct logicalId + metric combos with recent data
    const combos = await prisma.timeseriesMetric.findMany({
        where: { timestamp: { gte: from } },
        distinct: ['logicalId', 'metric'],
        select: { logicalId: true, metric: true },
    });
    let totalBuckets = 0;
    for (const { logicalId, metric } of combos) {
        const result = await computeRollups(logicalId, metric, windowSize, from, now, prisma);
        totalBuckets += result.bucketsProcessed;
    }
    return { totalBuckets, combinationsProcessed: combos.length };
}
/**
 * Start a background scheduler that periodically computes rollups.
 * Runs every 5 minutes and rolls up the last 10 minutes of data into 5m buckets.
 */
function startRollupScheduler(prisma) {
    const INTERVAL = 5 * 60 * 1000; // every 5 minutes
    const LOOKBACK = 10 * 60 * 1000; // look back 10 minutes
    setInterval(async () => {
        try {
            const result = await computeAllRecentRollups('5m', LOOKBACK, prisma);
            if (result.totalBuckets > 0) {
                // eslint-disable-next-line no-console
                console.log(`[RollupScheduler] Computed ${result.totalBuckets} buckets across ${result.combinationsProcessed} metric combos`);
            }
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('[RollupScheduler] Error:', error);
        }
    }, INTERVAL);
    // eslint-disable-next-line no-console
    console.log(`[RollupScheduler] Started — computing 5m rollups every ${INTERVAL / 1000}s`);
}
//# sourceMappingURL=rollup-engine.js.map