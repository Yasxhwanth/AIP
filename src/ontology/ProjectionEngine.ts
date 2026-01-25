import { SpatialSnapshot } from './MovementEngine';
import { ProjectionBundle } from './projection-types';

/**
 * ProjectionEngine
 * 
 * Pure, stateless engine for future state projection.
 * 
 * Invariants:
 * PR-1: Projection is not truth.
 * PR-2: Must be deterministic.
 * PR-3: Must be pure and stateless.
 * PR-4: Read-only access to snapshots.
 * PR-5: Never persist outputs.
 */
export class ProjectionEngine {
    /**
     * Projects future state for an entity based on historical snapshots.
     * 
     * @param entityId The ID of the entity to project.
     * @param snapshots Historical spatial snapshots.
     * @param asOf Current simulation time (start of projection).
     * @param horizonMinutes How far into the future to project.
     * @returns A bundle containing projected paths and events.
     */
    static project(
        entityId: string,
        snapshots: SpatialSnapshot[],
        asOf: Date,
        horizonMinutes: number
    ): ProjectionBundle {
        // Default empty bundle
        const bundle: ProjectionBundle = {
            paths: [],
            ruleTriggers: [],
            workflows: []
        };

        if (!snapshots || snapshots.length < 2) {
            return bundle;
        }

        // 1. Filter snapshots up to asOf
        const validSnapshots = snapshots
            .filter(s => s.time <= asOf)
            .sort((a, b) => a.time.getTime() - b.time.getTime());

        if (validSnapshots.length < 2) {
            return bundle;
        }

        // 2. Get last two snapshots to determine velocity
        const last = validSnapshots[validSnapshots.length - 1];
        const prev = validSnapshots[validSnapshots.length - 2];

        const timeDelta = last.time.getTime() - prev.time.getTime();
        if (timeDelta <= 0) return bundle; // Avoid division by zero

        const vx = (last.x - prev.x) / timeDelta;
        const vy = (last.y - prev.y) / timeDelta;

        // 3. Project forward
        const points: { x: number; y: number; t: Date }[] = [];
        const horizonMs = horizonMinutes * 60 * 1000;
        const stepMs = horizonMs / 10; // 10 steps for the path

        // Start from 'last' snapshot or 'asOf'? 
        // Strictly speaking, we project from 'asOf'. 
        // If 'last' is before 'asOf', we first project to 'asOf' to get current state, then project forward.
        // For simplicity in this phase, we assume linear motion continues from 'last' known point.

        // Calculate position at 'asOf'
        const timeSinceLast = asOf.getTime() - last.time.getTime();
        const startX = last.x + vx * timeSinceLast;
        const startY = last.y + vy * timeSinceLast;

        points.push({ x: startX, y: startY, t: asOf });

        for (let i = 1; i <= 10; i++) {
            const dt = (stepMs * i);
            const futureTime = new Date(asOf.getTime() + dt);

            const futureX = startX + vx * dt;
            const futureY = startY + vy * dt;

            points.push({
                x: futureX,
                y: futureY,
                t: futureTime
            });
        }

        bundle.paths.push({
            entityId,
            fromTime: asOf,
            toTime: new Date(asOf.getTime() + horizonMs),
            points,
            confidence: 'MEDIUM' // Placeholder confidence
        });

        return bundle;
    }
}
