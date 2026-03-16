"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMavenRouter = createMavenRouter;
const express_1 = require("express");
const aip_executor_1 = require("../aip-executor");
const aip_tools_1 = require("../aip-tools");
const openai_1 = require("openai");
const openai = new openai_1.OpenAI();
function createMavenRouter(prisma) {
    const router = (0, express_1.Router)();
    const executor = new aip_executor_1.AIPExecutor(prisma, aip_tools_1.defaultToolRegistry);
    /**
     * GET /alerts
     * Fetches active alerts for the "Global Logistics & Readiness" project.
     */
    router.get('/alerts', async (req, res) => {
        try {
            const projectId = req.projectId;
            if (!projectId)
                return res.status(401).json({ error: 'Project context missing' });
            const alerts = await prisma.alert.findMany({
                where: {
                    payload: { path: ['projectId'], equals: projectId },
                    acknowledged: false
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            });
            res.json(alerts);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    /**
     * GET /metrics
     * Aggregates real-time mission metrics.
     */
    router.get('/metrics', async (req, res) => {
        try {
            const projectId = req.projectId;
            // In a real scenario, we'd query CurrentEntityState and aggregate.
            // For now, we perform a live aggregation on the seeded ontology.
            const stats = await prisma.currentEntityState.findMany({
                where: { projectId },
                select: { data: true, entityTypeId: true }
            });
            // Calculate "Fleet Readiness" and "Throughput" based on seeded data
            const convoys = stats.filter(s => s.data && s.data.speed_kt);
            const ports = stats.filter(s => s.data && s.data.queue_vessels);
            const totalFuel = convoys.reduce((acc, c) => acc + (c.data.fuel_level || 0), 0);
            const readiness = convoys.length > 0 ? (totalFuel / convoys.length).toFixed(1) : "95.0";
            const totalVessels = ports.reduce((acc, p) => acc + (p.data.queue_vessels || 0), 0);
            const throughput = (convoys.length * 150).toString(); // Simulated RPM based on active convoys
            res.json({
                readiness: `${readiness}%`,
                throughput: `${throughput}`,
                activeAlerts: stats.filter(s => s.data && s.data.status === 'CONGESTED').length,
                latency: "442ms"
            });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    /**
     * POST /chat
     * AI Mission Command Assistant (Agentic RAG)
     */
    router.post('/chat', async (req, res) => {
        const { message } = req.body;
        const projectId = req.projectId;
        try {
            // 1. Fetch Agent Config
            const agent = await prisma.aIPAgent.findFirst({
                where: { name: 'Logistics Maven', projectId }
            });
            if (!agent)
                return res.status(404).json({ error: 'Logistics Maven agent not found' });
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
            const response = await openai.chat.completions.create({
                model: agent.model || "gpt-4o",
                messages: [
                    { role: "system", content: agent.systemPrompt },
                    { role: "system", content: `CURRENT MISSION CONTEXT: ${JSON.stringify(context)}` },
                    { role: "user", content: message }
                ],
                tools: [
                    {
                        type: "function",
                        function: {
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
                    }
                ]
            });
            const choice = response.choices[0].message;
            if (choice.tool_calls) {
                // If the model suggests a tool, we return the "recommendation" to the UI
                const toolCall = choice.tool_calls[0];
                const args = JSON.parse(toolCall.function.arguments);
                return res.json({
                    message: choice.content || "I have analyzed the congestion and prepared a reroute recommendation.",
                    recommendation: {
                        type: 'REROUTE',
                        title: `Reroute ${args.convoyId} to ${args.recommendedPort}`,
                        detail: args.reason,
                        actionId: 'action-reroute-convoy',
                        parameters: { convoyId: args.convoyId, newDestination: args.recommendedPort }
                    }
                });
            }
            res.json({ message: choice.content });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    /**
     * POST /execute-recommendation
     * Triggers an AIPAction based on an AI recommendation.
     */
    router.post('/execute-recommendation', async (req, res) => {
        const { actionId, parameters } = req.body;
        const projectId = req.projectId;
        try {
            const result = await executor.execute({
                toolName: actionId, // In this system, actions can be mapped to tools
                parameters,
                projectId
            });
            res.json(result);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    return router;
}
//# sourceMappingURL=maven-router.js.map