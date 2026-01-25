/**
 * MovementEngine
 * 
 * Pure, stateless engine for temporal interpolation.
 * 
 * Invariants:
 * TM-1: Must never call QueryClient.
 * TM-2: Must be stateless and pure.
 * TM-4: At exact snapshot times, position must match exactly.
 * TM-5: No extrapolation (freeze at boundaries).
 */

export interface SpatialSnapshot {
    time: Date;
    x: number;
    y: number;
}

export class MovementEngine {
    /**
     * Interpolates position at a specific render time given a set of snapshots.
     */
    static interpolate(snapshots: SpatialSnapshot[], renderTime: Date): { x: number; y: number } | null {
        if (!snapshots || snapshots.length === 0) return null;

        // Sort snapshots by time (just in case)
        const sortedSnapshots = [...snapshots].sort((a, b) => a.time.getTime() - b.time.getTime());

        const renderTimeMs = renderTime.getTime();

        // Case 1: Before first snapshot -> Freeze at first
        if (renderTimeMs <= sortedSnapshots[0].time.getTime()) {
            return { x: sortedSnapshots[0].x, y: sortedSnapshots[0].y };
        }

        // Case 2: After last snapshot -> Freeze at last
        if (renderTimeMs >= sortedSnapshots[sortedSnapshots.length - 1].time.getTime()) {
            const last = sortedSnapshots[sortedSnapshots.length - 1];
            return { x: last.x, y: last.y };
        }

        // Case 3: Between snapshots -> Interpolate
        for (let i = 0; i < sortedSnapshots.length - 1; i++) {
            const current = sortedSnapshots[i];
            const next = sortedSnapshots[i + 1];

            const currentMs = current.time.getTime();
            const nextMs = next.time.getTime();

            if (renderTimeMs >= currentMs && renderTimeMs < nextMs) {
                // Calculate progress (0 to 1)
                const totalDuration = nextMs - currentMs;
                const elapsed = renderTimeMs - currentMs;

                // Avoid division by zero
                if (totalDuration === 0) return { x: current.x, y: current.y };

                const progress = elapsed / totalDuration;

                // Linear Interpolation
                const x = current.x + (next.x - current.x) * progress;
                const y = current.y + (next.y - current.y) * progress;

                return { x, y };
            }
        }

        return null; // Should be unreachable given bounds checks
    }
}
