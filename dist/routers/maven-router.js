"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMavenRouter = createMavenRouter;
const express_1 = require("express");
const aip_executor_1 = require("../aip-executor");
const aip_tools_1 = require("../aip-tools");
const llm_factory_1 = require("../lib/llm-factory");
function createMavenRouter(prisma) {
    const router = (0, express_1.Router)();
    const executor = new aip_executor_1.AIPExecutor(prisma, aip_tools_1.defaultToolRegistry);
    /**
     * GET /drones
     * Returns live drone status for the current Maven project.
     *
     * Backed by the Ontology: expects an EntityType named "Drone" whose
     * CurrentEntityState.data payload looks roughly like:
     * {
     *   callsign: "DFR 5",
     *   label: "Dock: DFR 5",
     *   status: "flying" | "ready" | "offline",
     *   battery_pct: 94,
     *   location: { lat: 37.7, lng: -122.4 },
     *   position: { lat: 37.7, lng: -122.4, alt_ft: 120 },
     *   speed_mph: 3,
     *   heading_deg: 360,
     *   dockId: "dock-dfr-5",
     *   video_url: "https://example/stream"
     * }
     */
    router.get('/drones', async (req, res) => {
        try {
            const projectId = req.projectId;
            if (!projectId)
                return res.status(401).json({ error: 'Project context missing' });
            const droneType = await prisma.entityType.findFirst({
                where: {
                    projectId,
                    name: 'Drone',
                    branchName: 'main',
                },
            });
            if (!droneType) {
                // No Drone entity type yet for this project; return empty list so UI can handle gracefully.
                return res.json([]);
            }
            const states = await prisma.currentEntityState.findMany({
                where: {
                    projectId,
                    entityTypeId: droneType.id,
                    updatedAt: { gte: new Date(Date.now() - 30000) } // Active in last 30s
                },
                orderBy: { updatedAt: 'desc' },
                take: 100,
            });
            const drones = states.map((s) => {
                const data = s.data ?? {};
                const location = data.location ?? {};
                const position = data.position ?? {};
                return {
                    id: s.logicalId,
                    callsign: data.callsign || data.name || s.logicalId,
                    label: data.label || data.dockLabel || data.dockId || s.logicalId,
                    status: data.status || 'unknown',
                    batteryPct: typeof data.battery_pct === 'number' ? data.battery_pct : null,
                    lat: location.lat ?? position.lat ?? null,
                    lon: location.lng ?? position.lng ?? null,
                    altitudeFt: position.alt_ft ?? null,
                    speedMph: data.speed_mph ?? null,
                    headingDeg: data.heading_deg ?? null,
                    dockId: data.dockId ?? null,
                    lastSeen: s.updatedAt,
                    videoUrl: data.video_url || null,
                };
            });
            res.json(drones);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
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
            const llm = (0, llm_factory_1.getLlmClient)();
            const response = await llm.chat({
                model: agent.modelConfig?.model || "gemini-2.0-flash",
                systemPrompt: agent.systemPrompt + `\n\nCURRENT MISSION CONTEXT: ${JSON.stringify(context)}`,
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
                const args = toolCall.arguments;
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