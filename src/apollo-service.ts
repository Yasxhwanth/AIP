import { PrismaClient } from './generated/prisma';

export class ApolloService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Seeds initial environments if none exist (useful for a fresh project workspace)
     */
    async ensureEnvironments() {
        const count = await this.prisma.apolloEnvironment.count();
        if (count === 0) {
            await this.prisma.apolloEnvironment.createMany({
                data: [
                    { name: "Dev", tier: "cloud", description: "Integration & testing", active: true },
                    { name: "Staging", tier: "cloud", description: "Pre-prod dry run", active: true },
                    { name: "Production", tier: "cloud", description: "Live customer traffic", active: true },
                    { name: "Classified (SCIF)", tier: "air-gap", description: "Air-gapped secure facility", active: true }
                ]
            });
        }
    }

    /**
     * Creates a new deployment for an environment, which conceptually pushes a new snapshot of logic/rules to it.
     */
    async deployRelease(environmentId: string, releaseVersion: string, canaryPercent: number, deployedBy: string) {
        // Collect current cluster state to simulate a snapshot payload
        const payloadSnapshot = {
            timestamp: new Date().toISOString(),
            metrics: await this.prisma.aIPMetric.count(),
            functions: await this.prisma.aIPFunction.count(),
            automations: await this.prisma.aIPAutomate.count()
        };

        const deployment = await this.prisma.apolloDeployment.create({
            data: {
                environmentId,
                releaseVersion,
                strategy: canaryPercent < 100 ? "canary" : "rolling",
                canaryPercent,
                payload: payloadSnapshot,
                status: "deploying",
                deployedBy
            }
        });

        // Simulate deployment asynchronously
        setTimeout(async () => {
            try {
                // If canary succeeds, we simulate transition to healthy
                const finalStatus = Math.random() < 0.05 ? "degraded" : "healthy";
                await this.prisma.apolloDeployment.update({
                    where: { id: deployment.id },
                    data: { status: finalStatus, completedAt: new Date() }
                });
            } catch (err) {
                console.error("Deploy sim error", err);
            }
        }, 3000);

        return deployment;
    }

    /**
     * Rollback to a previous deployment version. Conceptually restores that old JSON payload to active use.
     */
    async rollback(deploymentId: string, revertedBy: string) {
        const targetDeploy = await this.prisma.apolloDeployment.findUnique({
            where: { id: deploymentId }
        });
        if (!targetDeploy) throw new Error("Deployment not found");

        const newRollbackDeploy = await this.prisma.apolloDeployment.create({
            data: {
                environmentId: targetDeploy.environmentId,
                releaseVersion: targetDeploy.releaseVersion + "-rollback",
                strategy: "immediate",
                canaryPercent: 100,
                payload: targetDeploy.payload as any,
                status: "deploying",
                deployedBy: revertedBy,
                rollbackFrom: targetDeploy.id,
                notes: `Automatic rollback to ${targetDeploy.releaseVersion}`
            }
        });

        // Sim
        setTimeout(async () => {
            await this.prisma.apolloDeployment.update({
                where: { id: newRollbackDeploy.id },
                data: { status: "healthy", completedAt: new Date() }
            });
        }, 1500);

        return newRollbackDeploy;
    }

    /**
     * Simulates external agents reporting health back to the control plane
     */
    async runHealthHeartbeat() {
        const envs = await this.prisma.apolloEnvironment.findMany({ where: { active: true } });
        const services = ["api-server", "pipeline-worker", "ws-broker"];

        for (const env of envs) {
            // Only keep last 50 heartbeats per env to prevent DB bloat
            const count = await this.prisma.apolloHealthCheck.count({ where: { environmentId: env.id } });
            if (count > 100) {
                const oldConfigs = await this.prisma.apolloHealthCheck.findMany({
                    where: { environmentId: env.id },
                    orderBy: { checkedAt: 'asc' },
                    take: 50
                });
                if (oldConfigs.length > 0) {
                    await this.prisma.apolloHealthCheck.deleteMany({
                        where: { id: { in: oldConfigs.map(c => c.id) } }
                    });
                }
            }

            for (const svc of services) {
                // Simulate occasional degradation
                const isDown = Math.random() < 0.02;
                const isDegraded = !isDown && Math.random() < 0.10;

                await this.prisma.apolloHealthCheck.create({
                    data: {
                        environmentId: env.id,
                        service: svc,
                        status: isDown ? "down" : isDegraded ? "degraded" : "ok",
                        latencyMs: isDown ? 0 : Math.floor(Math.random() * (isDegraded ? 800 : 50)) + 10,
                        cpuPercent: isDown ? 0 : Math.random() * (isDegraded ? 95 : 40) + 5,
                        memPercent: isDown ? 0 : Math.random() * (isDegraded ? 90 : 50) + 10,
                        errorMessage: isDown ? "Connection timeout" : isDegraded ? "High latency detected" : null
                    }
                });
            }
        }
    }
}
