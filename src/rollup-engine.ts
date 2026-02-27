import { PrismaClient, Prisma } from './generated/prisma';

// ── Window Helpers ───────────────────────────────────────────────

interface WindowConfig {
    label: string;
    ms: number;
}

const WINDOW_SIZES: Record<string, WindowConfig> = {
    '5m': { label: '5 minutes', ms: 5 * 60 * 1000 },
    '15m': { label: '15 minutes', ms: 15 * 60 * 1000 },
    '1h': { label: '1 hour', ms: 60 * 60 * 1000 },
    '1d': { label: '1 day', ms: 24 * 60 * 60 * 1000 },
};

/**
 * Floor a timestamp to the start of its window bucket.
 * e.g., 10:07 with windowSize "5m" → 10:05
 */
function floorToWindow(timestamp: Date, windowMs: number): Date {
    const ms = timestamp.getTime();
    return new Date(ms - (ms % windowMs));
}

// ── Rollup Engine ────────────────────────────────────────────────

/**
 * Computes rollups for a specific logicalId + metric over a time range.
 * Buckets raw TimeseriesMetric rows into windows and upserts TelemetryRollup.
 */
export async function computeRollups(
    logicalId: string,
    metric: string,
    windowSize: string,
    from: Date,
    to: Date,
    prisma: PrismaClient,
): Promise<{ bucketsProcessed: number }> {
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
    const buckets = new Map<number, number[]>(); // windowStartMs → values

    for (const point of rawPoints) {
        const windowStart = floorToWindow(point.timestamp, windowConfig.ms);
        const key = windowStart.getTime();
        const existing = buckets.get(key);
        if (existing) {
            existing.push(point.value);
        } else {
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
export async function computeAllRecentRollups(
    windowSize: string,
    lookbackMs: number,
    prisma: PrismaClient,
): Promise<{ totalBuckets: number; combinationsProcessed: number }> {
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
export function startRollupScheduler(prisma: PrismaClient): void {
    const INTERVAL = 5 * 60 * 1000; // every 5 minutes
    const LOOKBACK = 10 * 60 * 1000; // look back 10 minutes

    setInterval(() => {
        const idempotencyKey = `TELEMETRY_ROLLUP_${Math.floor(Date.now() / INTERVAL)}`;

        prisma.jobQueue.upsert({
            where: { idempotencyKey },
            create: {
                jobType: 'TELEMETRY_ROLLUP_TRIGGER',
                payload: { windowSize: '5m', lookbackMs: LOOKBACK },
                idempotencyKey,
                priority: 1, // lower priority than data ingest
            },
            update: {} // do nothing if it already exists
        }).catch((err: any) => {
            console.error('[RollupScheduler] Failed to enqueue rollup job:', err);
        });
    }, INTERVAL);

    console.log(`[RollupScheduler] Started — enqueueing 5m rollup jobs every ${INTERVAL / 1000}s`);
}
