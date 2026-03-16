import { Router } from 'express';
import { PrismaClient } from '../generated/prisma';
import { AIPExecutor } from '../aip-executor';
import { defaultToolRegistry } from '../aip-tools';
import { getLlmClient } from '../lib/llm-factory';

export function createMavenRouter(prisma: PrismaClient) {
    const router = Router();
    const executor = new AIPExecutor(prisma, defaultToolRegistry);

    /**
     * GET /alerts
     * Fetches active alerts for the "Global Logistics & Readiness" project.
     */
    router.get('/alerts', async (req, res) => {
        try {
            const projectId = (req as any).projectId;
            if (!projectId) return res.status(401).json({ error: 'Project context missing' });

            const alerts = await prisma.alert.findMany({
                where: {
                    payload: { path: ['projectId'], equals: projectId },
                    acknowledged: false
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            });
            res.json(alerts);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * GET /metrics
     * Aggregates real-time mission metrics.
     */
    router.get('/metrics', async (req, res) => {
        try {
            const projectId = (req as any).projectId;

            // In a real scenario, we'd query CurrentEntityState and aggregate.
            // For now, we perform a live aggregation on the seeded ontology.
            const stats = await prisma.currentEntityState.findMany({
                where: { projectId },
                select: { data: true, entityTypeId: true }
            });

            // Calculate "Fleet Readiness" and "Throughput" based on seeded data
            const convoys = stats.filter(s => s.data && (s.data as any).speed_kt);
            const ports = stats.filter(s => s.data && (s.data as any).queue_vessels);

            const totalFuel = convoys.reduce((acc, c) => acc + ((c.data as any).fuel_level || 0), 0);
            const readiness = convoys.length > 0 ? (totalFuel / convoys.length).toFixed(1) : "95.0";

            const totalVessels = ports.reduce((acc, p) => acc + ((p.data as any).queue_vessels || 0), 0);
            const throughput = (convoys.length * 150).toString(); // Simulated RPM based on active convoys

            res.json({
                readiness: `${readiness}%`,
                throughput: `${throughput}`,
                activeAlerts: stats.filter(s => s.data && (s.data as any).status === 'CONGESTED').length,
                latency: "442ms"
            });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * POST /chat
     * AI Mission Command Assistant (Agentic RAG)
     */
    router.post('/chat', async (req, res) => {
        const { message } = req.body;
        const projectId = (req as any).projectId;

        try {
            // 1. Fetch Agent Config
            const agent = await prisma.aIPAgent.findFirst({
                where: { name: 'Logistics Maven', projectId }
            });

            if (!agent) return res.status(404).json({ error: 'Logistics Maven agent not found' });

            // 2. Gather Context (Current Entity States + Active Alerts)
            const [entities, alerts] = await Promise.all([
                prisma.currentEntityState.findMany({ where: { projectId }, take: 20 }),
                prisma.alert.findMany({ where: { acknowledged: false }, take: 5 })
            ]);

            const context = {
                entities: entities.map(e => ({ id: e.logicalId, data: e.data })),
                activeAlerts: alerts.map(a => a.alertType)
            };

            // 3. Inference
            const llm = getLlmClient();
            const response = await llm.chat({
                model: (agent as any).modelConfig?.model || "gemini-2.0-flash",
                systemPrompt: (agent.systemPrompt as string) + `\n\nCURRENT MISSION CONTEXT: ${JSON.stringify(context)}`,
                messages: [{ role: "user", content: message }],
                tools: [
                    {
                        name: "suggest_reroute",
                        description: "Propose a reroute for a convoy to avoid port congestion.",
                        parameters: {
                            type: "object",
                            properties: {
                                convoyId: { type: "string" },
                                reason: { type: "string" },
                                recommendedPort: { type: "string" }
                            },
                            required: ["convoyId", "reason", "recommendedPort"]
                        }
                    }
                ]
            });

            if (response.toolCalls && response.toolCalls.length > 0) {
                const toolCall = response.toolCalls[0];
                const args = toolCall.arguments as any;

                return res.json({
                    message: response.answer || "I have analyzed the congestion and prepared a reroute recommendation.",
                    recommendation: {
                        type: 'REROUTE',
                        title: `Reroute ${args.convoyId} to ${args.recommendedPort}`,
                        detail: args.reason,
                        actionId: 'action-reroute-convoy',
                        parameters: { convoyId: args.convoyId, newDestination: args.recommendedPort }
                    }
                });
            }

            res.json({ message: response.answer });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * POST /execute-recommendation
     * Triggers an AIPAction based on an AI recommendation.
     */
    router.post('/execute-recommendation', async (req, res) => {
        const { actionId, parameters } = req.body;
        const projectId = (req as any).projectId;

        try {
            const result = await executor.execute({
                toolName: actionId, // In this system, actions can be mapped to tools
                parameters,
                projectId
            });

            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
