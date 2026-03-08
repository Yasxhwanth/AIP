import { PrismaClient } from './generated/prisma';
export declare class ApolloService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Seeds initial environments if none exist (useful for a fresh project workspace)
     */
    ensureEnvironments(): Promise<void>;
    /**
     * Creates a new deployment for an environment, which conceptually pushes a new snapshot of logic/rules to it.
     */
    deployRelease(environmentId: string, releaseVersion: string, canaryPercent: number, deployedBy: string): Promise<{
        id: string;
        releaseVersion: string;
        payload: import("./generated/prisma/runtime/client").JsonValue;
        strategy: string;
        canaryPercent: number;
        status: string;
        deployedBy: string;
        startedAt: Date;
        completedAt: Date | null;
        rollbackFrom: string | null;
        notes: string | null;
        environmentId: string;
    }>;
    /**
     * Rollback to a previous deployment version. Conceptually restores that old JSON payload to active use.
     */
    rollback(deploymentId: string, revertedBy: string): Promise<{
        id: string;
        releaseVersion: string;
        payload: import("./generated/prisma/runtime/client").JsonValue;
        strategy: string;
        canaryPercent: number;
        status: string;
        deployedBy: string;
        startedAt: Date;
        completedAt: Date | null;
        rollbackFrom: string | null;
        notes: string | null;
        environmentId: string;
    }>;
    /**
     * Simulates external agents reporting health back to the control plane
     */
    runHealthHeartbeat(): Promise<void>;
}
//# sourceMappingURL=apollo-service.d.ts.map