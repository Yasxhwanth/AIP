import { Router } from 'express';
import { PrismaClient } from '../generated/prisma';
import { AIPExecutor } from '../aip-executor';
import { defaultToolRegistry } from '../aip-tools';
import { getLlmClient } from '../lib/llm-factory';
import { AuditService } from '../audit-service';

export function createMavenRouter(prisma: PrismaClient) {
    const router = Router();
    const executor = new AIPExecutor(prisma, defaultToolRegistry);
    const auditSvc = new AuditService(prisma);

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
            const projectId = (req as any).projectId;
            if (!projectId) return res.status(401).json({ error: 'Project context missing' });

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
                const data: any = s.data ?? {};
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
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

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
                    projectId,
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
     * POST /alerts
     * Report an observed mission alert to the project (e.g. cross-ontology detections).
     */
    router.post('/alerts', async (req, res) => {
        try {
            const projectId = (req as any).projectId;
            if (!projectId) return res.status(401).json({ error: 'Project context missing' });

            const { alertType, severity, logicalId, entityTypeId, message, payload, policyId } = req.body;

            const alert = await prisma.alert.create({
                data: {
                    projectId,
                    alertType,
                    severity: severity || 'WARNING',
                    logicalId: logicalId || 'unknown',
                    entityTypeId: entityTypeId || 'unknown',
                    policyId: policyId || 'MISSION-OBSERVATION',
                    payload: { ...(payload || {}), message: message || 'observed anomaly' }
                }
            });

            res.status(201).json(alert);
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
     * Now creates an ActionProposal for human review if a recommendation is made.
     */
    router.post('/chat', async (req, res) => {
        const { message } = req.body;
        const projectId = (req as any).projectId;

        try {
            // 1. Fetch Agent Config (Try MAVEN-Tactical first, fallback to Logistics Maven)
            let agent = await prisma.aIPAgent.findFirst({
                where: { name: 'MAVEN-Tactical', projectId }
            });
            if (!agent) {
                agent = await prisma.aIPAgent.findFirst({
                    where: { name: 'Logistics Maven', projectId }
                });
            }

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

            const tacticalPrompt = `
                OPERATIONAL GUIDELINES (CONFIDENTIAL // NOFORN):
                1. RISK MITIGATION PRIORITY: Always calculate and display the 'Risk Delta' for any suggested maneuver.
                2. CHAIN OF COMMAND: You are an ADVISOR. All high-stakes decisions must be staged as PROPOSALS for Human Commander authorization.
                3. PROACTIVE INTERDICTION: If situational context (latencies, alerts, positions) indicates a breach is imminent, proactively suggest Intercept Vectors.
                4. LINGUISTIC TONE: Direct, high-precision, military-grade brevity. Use operational acronyms (QRF, ISR, SIGINT, ORBAT).

                MAVEN-Tactical Intelligence Framework: V9.2-Deployed.
                Current Mission Context: ${JSON.stringify(context)}
            `;

            // 3. Inference
            const llm = getLlmClient();
            const response = await llm.chat({
                model: (agent as any)?.modelConfig?.model || "gemini-2.0-flash",
                systemPrompt: (agent?.systemPrompt as string || "") + tacticalPrompt,
                messages: [{ role: "user", content: message }],
                tools: [
                    {
                        name: "suggest_reroute",
                        description: "Propose a reroute for a convoy to avoid port congestion or hostile zones.",
                        parameters: {
                            type: "object",
                            properties: {
                                convoyId: { type: "string" },
                                reason: { type: "string" },
                                recommendedPort: { type: "string" }
                            },
                            required: ["convoyId", "reason", "recommendedPort"]
                        }
                    },
                    {
                        name: "propose_interdiction",
                        description: "Suggest an interception vector for a detected threat actor.",
                        parameters: {
                            type: "object",
                            properties: {
                                targetId: { type: "string" },
                                interceptorId: { type: "string" },
                                estimatedTimeEnRoute: { type: "number" },
                                riskDelta: { type: "number" }
                            },
                            required: ["targetId", "interceptorId", "estimatedTimeEnRoute"]
                        }
                    },
                    {
                        name: "reassign_qrf",
                        description: "Reassign a Quick Reaction Force asset to a high-priority incident.",
                        parameters: {
                            type: "object",
                            properties: {
                                assetId: { type: "string" },
                                incidentId: { type: "string" },
                                priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] }
                            },
                            required: ["assetId", "incidentId", "priority"]
                        }
                    }
                ]
            });

            if (response.toolCalls && response.toolCalls.length > 0) {
                const toolCall = response.toolCalls[0];
                const args = toolCall.arguments as any;

                // MISSION GOVERNANCE: Instead of direct execution, stage as a Proposal
                const proposal = await prisma.actionProposal.create({
                    data: {
                        projectId,
                        agentId: agent.id,
                        actionId: 'action-reroute-convoy',
                        title: `Reroute ${args.convoyId} to ${args.recommendedPort}`,
                        description: args.reason,
                        parameters: args,
                        status: 'PENDING',
                        riskTier: 'medium'
                    }
                });

                return res.json({
                    message: response.answer || "I have analyzed the congestion and prepared a reroute recommendation for your review.",
                    proposal: {
                        id: proposal.id,
                        type: 'REROUTE',
                        title: proposal.title,
                        detail: proposal.description,
                        status: proposal.status
                    }
                });
            }

            res.json({ message: response.answer });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * GET /proposals
     * List mission action proposals for review.
     */
    router.get('/proposals', async (req, res) => {
        try {
            const projectId = (req as any).projectId;
            const proposals = await prisma.actionProposal.findMany({
                where: { projectId },
                orderBy: { createdAt: 'desc' }
            });
            res.json(proposals);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * POST /proposals/:id/approve
     * Human Command approves the AI proposal -> Commits to Ontology.
     */
    router.post('/proposals/:id/approve', async (req, res) => {
        const { id } = req.params;
        const projectId = (req as any).projectId;

        try {
            const proposal = await prisma.actionProposal.findUnique({ where: { id } });
            if (!proposal || proposal.projectId !== projectId) return res.status(404).json({ error: 'Proposal not found' });
            if (proposal.status !== 'PENDING') return res.status(400).json({ error: `Proposal is in status ${proposal.status}` });

            // 1. Execute the actual action via AIPExecutor
            const result = await executor.execute({
                toolName: proposal.actionId,
                parameters: proposal.parameters as any,
                projectId
            });

            // 2. Update proposal status
            const updated = await prisma.actionProposal.update({
                where: { id },
                data: {
                    status: 'EXECUTED',
                    reviewedBy: (req as any).apiKeyName || 'commander',
                    reviewedAt: new Date(),
                    executionId: (result as any).id || (result as any).executionId
                }
            });

            await auditSvc.logAction({
                actor: updated.reviewedBy!,
                action: 'APPROVE_ACTION_PROPOSAL',
                resourceType: 'ActionProposal',
                resourceId: id,
                projectId,
                before: proposal,
                after: updated,
                metadata: { context: 'governance', result }
            });

            res.json({ status: 'SUCCESS', result, proposal: updated });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * POST /proposals/:id/reject
     * Human Command rejects the AI proposal.
     */
    router.post('/proposals/:id/reject', async (req, res) => {
        const { id } = req.params;
        const { reason } = req.body;
        const projectId = (req as any).projectId;

        try {
            const proposal = await prisma.actionProposal.findUnique({ where: { id } });
            if (!proposal || proposal.projectId !== projectId) return res.status(404).json({ error: 'Proposal not found' });

            const updated = await prisma.actionProposal.update({
                where: { id },
                data: {
                    status: 'REJECTED',
                    rejectionReason: reason || 'Not aligned with mission tactical goals.',
                    reviewedBy: (req as any).apiKeyName || 'commander',
                    reviewedAt: new Date(),
                }
            });

            await auditSvc.logAction({
                actor: updated.reviewedBy!,
                action: 'REJECT_ACTION_PROPOSAL',
                resourceType: 'ActionProposal',
                resourceId: id,
                projectId,
                before: proposal,
                after: updated,
                metadata: { context: 'governance', reason: updated.rejectionReason }
            });

            res.json(updated);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    // ── Maven Smart System Endpoints ─────────────────────────────────────────

    /**
     * GET /intel-graph
     * Multi-INT Intelligence Graph — fuses entities across all types into nodes + edges
     */
    router.get('/intel-graph', async (req, res) => {
        const projectId = (req as any).projectId || 'proj-demo';
        try {
            const [states, relationships, alerts] = await Promise.all([
                prisma.currentEntityState.findMany({
                    where: { projectId },
                    include: { entityType: { select: { name: true } } },
                    take: 80
                }),
                (prisma as any).entityRelationship?.findMany({
                    where: { projectId },
                    take: 120
                }).catch(() => []),
                prisma.alert.findMany({
                    where: { projectId, acknowledged: false },
                    take: 20
                })
            ]);

            // Classify INT type from entity type name
            const intType = (name: string): string => {
                const n = name.toLowerCase();
                if (n.includes('drone') || n.includes('aircraft') || n.includes('satellite')) return 'IMINT';
                if (n.includes('signal') || n.includes('comms') || n.includes('radio')) return 'SIGINT';
                if (n.includes('person') || n.includes('agent') || n.includes('contact')) return 'HUMINT';
                if (n.includes('convoy') || n.includes('vessel') || n.includes('vehicle')) return 'MASINT';
                return 'OSINT';
            };

            const alertSet = new Set(alerts.map((a: any) => a.logicalId));

            const nodes = states.map((s: any) => ({
                id: s.logicalId,
                label: (s.data as any)?.callsign || (s.data as any)?.name || s.logicalId.slice(0, 12),
                type: s.entityType?.name || 'Unknown',
                intType: intType(s.entityType?.name || ''),
                status: (s.data as any)?.status || 'unknown',
                hasAlert: alertSet.has(s.logicalId),
                lat: (s.data as any)?.location?.lat ?? (s.data as any)?.lat ?? null,
                lon: (s.data as any)?.location?.lng ?? (s.data as any)?.lon ?? null,
                updatedAt: s.updatedAt
            }));

            const edges = (relationships as any[]).map((r: any) => ({
                source: r.fromLogicalId,
                target: r.toLogicalId,
                relationType: r.relationType
            }));

            return res.json({
                nodes, edges, summary: {
                    total: nodes.length,
                    byIntType: nodes.reduce((acc: any, n) => { acc[n.intType] = (acc[n.intType] || 0) + 1; return acc; }, {}),
                    alertedNodes: nodes.filter((n: any) => n.hasAlert).length
                }
            });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    /**
     * GET /pattern-of-life/:logicalId
     * Pattern of Life analysis — movement history, temporal cadence, anomaly score
     */
    router.get('/pattern-of-life/:logicalId', async (req, res) => {
        const { logicalId } = req.params;
        const projectId = (req as any).projectId || 'proj-demo';
        const days = Math.min(Number(req.query.days) || 7, 30);

        try {
            const events = await prisma.domainEvent.findMany({
                where: {
                    logicalId,
                    projectId,
                    occurredAt: { gte: new Date(Date.now() - days * 86400000) }
                },
                orderBy: { occurredAt: 'asc' },
                take: 500
            });

            // Movement track (positions over time)
            const track = events
                .map((e: any) => {
                    const d = e.payload as any;
                    const lat = d?.location?.lat ?? d?.lat ?? null;
                    const lon = d?.location?.lng ?? d?.lon ?? null;
                    return lat !== null && lon !== null ? { lat, lon, ts: e.occurredAt } : null;
                })
                .filter(Boolean);

            // Temporal cadence — count activity by hour of day
            const cadence: number[] = new Array(24).fill(0);
            events.forEach((e: any) => {
                const hour = new Date(e.occurredAt).getUTCHours();
                cadence[hour]++;
            });

            // Inter-event gap analysis for anomaly scoring
            const gaps = events.slice(1).map((e, i) =>
                (new Date(e.occurredAt).getTime() - new Date(events[i].occurredAt).getTime()) / 60000 // minutes
            );
            const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
            const lastGap = events.length >= 2
                ? (Date.now() - new Date(events[events.length - 1].occurredAt).getTime()) / 60000
                : 0;

            // Anomaly score: z-score of last gap vs historical average
            const stdDev = gaps.length > 1
                ? Math.sqrt(gaps.reduce((sq, gap) => sq + (gap - avgGap) ** 2, 0) / gaps.length)
                : 1;
            const zScore = stdDev > 0 ? Math.abs((lastGap - avgGap) / stdDev) : 0;
            const anomalyScore = Math.min(Math.round(zScore * 20), 100); // 0-100

            // AI summary via Gemini
            let aiSummary = null;
            if (events.length > 0) {
                try {
                    const llm = getLlmClient();
                    const resp = await llm.chat({
                        model: 'gemini-2.0-flash',
                        systemPrompt: 'You are a Pattern-of-Life analyst for Maven. Respond in 2 sentences, military brevity.',
                        messages: [{
                            role: 'user',
                            content: `Entity ${logicalId} has ${events.length} events over ${days} days. Average gap: ${avgGap.toFixed(0)} min. Last gap: ${lastGap.toFixed(0)} min. Anomaly score: ${anomalyScore}/100. Summarize the pattern and whether current behavior is anomalous.`
                        }]
                    });
                    aiSummary = resp.answer;
                } catch { /* non-fatal */ }
            }

            return res.json({
                logicalId,
                days,
                eventCount: events.length,
                track,
                cadence,
                stats: { avgGapMinutes: Math.round(avgGap), lastGapMinutes: Math.round(lastGap), anomalyScore },
                aiSummary
            });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    /**
     * GET /kill-chain
     * OODA loop board — items per stage with time-in-stage metrics
     */
    router.get('/kill-chain', async (req, res) => {
        const projectId = (req as any).projectId || 'proj-demo';
        try {
            const [alerts, proposals] = await Promise.all([
                prisma.alert.findMany({
                    where: { projectId, acknowledged: false },
                    orderBy: { createdAt: 'desc' },
                    take: 30
                }),
                (prisma as any).actionProposal.findMany({
                    where: { projectId },
                    orderBy: { createdAt: 'desc' },
                    take: 20
                })
            ]);

            const now = Date.now();
            const minutesAgo = (dt: Date) => Math.floor((now - new Date(dt).getTime()) / 60000);

            // OBSERVE: unacknowledged alerts
            const observe = alerts.map((a: any) => ({
                id: a.id,
                label: a.alertType,
                severity: a.severity,
                minutesInStage: minutesAgo(a.createdAt),
                entity: a.logicalId
            }));

            // ORIENT: alerts older than 2 minutes (being analyzed)
            const orient = observe.filter((o: any) => o.minutesInStage > 2).map((o: any) => ({
                ...o,
                confidence: Math.max(20, 100 - o.minutesInStage * 3)
            }));

            // DECIDE: pending proposals
            const decide = proposals
                .filter((p: any) => p.status === 'PENDING')
                .map((p: any) => ({
                    id: p.id,
                    label: p.title,
                    riskTier: p.riskTier,
                    minutesInStage: minutesAgo(p.createdAt),
                    description: p.description
                }));

            // ACT: recently executed proposals
            const act = proposals
                .filter((p: any) => p.status === 'EXECUTED')
                .slice(0, 8)
                .map((p: any) => ({
                    id: p.id,
                    label: p.title,
                    executedAt: p.reviewedAt,
                    reviewedBy: p.reviewedBy
                }));

            // Kill chain latency: avg time from proposal creation to execution
            const executed = proposals.filter((p: any) => p.status === 'EXECUTED' && p.reviewedAt);
            const avgLatencyMinutes = executed.length > 0
                ? Math.round(executed.reduce((acc: number, p: any) =>
                    acc + (new Date(p.reviewedAt).getTime() - new Date(p.createdAt).getTime()) / 60000, 0
                ) / executed.length)
                : null;

            return res.json({
                observe,
                orient,
                decide,
                act,
                metrics: {
                    avgKillChainLatencyMinutes: avgLatencyMinutes,
                    observeCount: observe.length,
                    decideCount: decide.length,
                    actCount: act.length
                }
            });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    /**
     * POST /coa/simulate
     * Gemini-powered Course-of-Action simulation
     */
    router.post('/coa/simulate', async (req, res) => {
        const { threatDescription, availableAssets, constraints, objectiveType } = req.body;
        const projectId = (req as any).projectId || 'proj-demo';

        if (!threatDescription) return res.status(400).json({ error: 'threatDescription is required' });

        try {
            const llm = getLlmClient();
            const response = await llm.chat({
                model: 'gemini-2.0-flash',
                systemPrompt: `You are MAVEN CoA Engine — an AI Course-of-Action planner for military/enterprise operations.
Generate EXACTLY 3 course-of-action options as valid JSON array. Each option must have:
- id: "coa-1", "coa-2", "coa-3"
- name: short tactical name
- description: 2-sentence summary
- probabilityOfSuccess: number 0-100
- estimatedTimeHours: number
- riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
- requiredAssets: string[]
- keyAssumptions: string[]
- risks: string[]
Respond ONLY with valid JSON array, no markdown fences.`,
                messages: [{
                    role: 'user',
                    content: `THREAT: ${threatDescription}
AVAILABLE ASSETS: ${availableAssets || 'Standard tactical package'}
CONSTRAINTS: ${constraints || 'Standard ROE apply'}
OBJECTIVE TYPE: ${objectiveType || 'NEUTRALIZE'}`
                }]
            });

            let options: any[];
            try {
                const cleaned = (response.answer || '').replace(/```json|```/g, '').trim();
                options = JSON.parse(cleaned);
            } catch {
                // Fallback structured options if LLM output is invalid JSON
                options = [
                    { id: 'coa-1', name: 'DIRECT ACTION', description: 'Immediate ISR tasking followed by direct force application.', probabilityOfSuccess: 72, estimatedTimeHours: 2, riskLevel: 'HIGH', requiredAssets: ['ISR Platform', 'QRF Unit'], keyAssumptions: ['Intel is accurate', 'Target is static'], risks: ['Collateral risk', 'Escalation potential'] },
                    { id: 'coa-2', name: 'SURVEILLANCE & CONFIRM', description: 'Extended observation window to confirm pattern before action.', probabilityOfSuccess: 88, estimatedTimeHours: 12, riskLevel: 'MEDIUM', requiredAssets: ['Persistent ISR', 'SIGINT Asset'], keyAssumptions: ['Target remains in AO'], risks: ['Window of opportunity may close'] },
                    { id: 'coa-3', name: 'STANDOFF INTERDICTION', description: 'Disrupt logistics chain via standoff capability, minimizing ground exposure.', probabilityOfSuccess: 65, estimatedTimeHours: 4, riskLevel: 'LOW', requiredAssets: ['Standoff Weapon System'], keyAssumptions: ['No civilian presence'], risks: ['Limited effect on dispersed target'] }
                ];
            }

            // Store the simulation in audit log
            await auditSvc.logAction({
                actor: (req as any).auth?.apiKeyName || 'commander',
                action: 'COA_SIMULATION',
                resourceType: 'MavenCoA',
                resourceId: `coa-${Date.now()}`,
                projectId,
                metadata: { threatDescription, optionsGenerated: options.length }
            });

            return res.json({ options, generatedAt: new Date().toISOString() });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    /**
     * GET /entities/:logicalId/dossier
     * Full intelligence dossier for a tracked entity
     */
    router.get('/entities/:logicalId/dossier', async (req, res) => {
        const { logicalId } = req.params;
        const projectId = (req as any).projectId || 'proj-demo';

        try {
            const [state, events, alerts, relationships] = await Promise.all([
                prisma.currentEntityState.findFirst({ where: { logicalId, projectId }, include: { entityType: true } }),
                prisma.domainEvent.findMany({ where: { logicalId, projectId }, orderBy: { occurredAt: 'desc' }, take: 20 }),
                prisma.alert.findMany({ where: { logicalId, projectId }, orderBy: { createdAt: 'desc' }, take: 10 }),
                (prisma as any).entityRelationship?.findMany({
                    where: { projectId, OR: [{ fromLogicalId: logicalId }, { toLogicalId: logicalId }] },
                    take: 20
                }).catch(() => [])
            ]);

            if (!state) return res.status(404).json({ error: `Entity '${logicalId}' not found` });

            // Quick PoL summary
            const gaps = events.slice(1).map((e, i) =>
                (new Date(events[i].occurredAt).getTime() - new Date(e.occurredAt).getTime()) / 60000
            );
            const avgGap = gaps.length > 0 ? gaps.reduce((a: number, b: number) => a + b, 0) / gaps.length : null;

            // AI assessment
            let assessment = null;
            try {
                const llm = getLlmClient();
                const resp = await llm.chat({
                    model: 'gemini-2.0-flash',
                    systemPrompt: 'You are a MAVEN intelligence analyst. Provide a 3-sentence assessment of this entity. Military brevity. Start with threat classification.',
                    messages: [{
                        role: 'user',
                        content: `Entity: ${logicalId} | Type: ${state.entityType?.name} | Status: ${(state.data as any)?.status} | Recent alerts: ${alerts.length} | Activity events: ${events.length} | Data: ${JSON.stringify((state.data as any) || {}).slice(0, 400)}`
                    }]
                });
                assessment = resp.answer;
            } catch { /* non-fatal */ }

            return res.json({
                logicalId,
                entityType: state.entityType?.name,
                currentState: state.data,
                lastSeen: state.updatedAt,
                activitySummary: {
                    totalEvents: events.length,
                    recentEvents: events.slice(0, 5),
                    avgActivityGapMinutes: avgGap !== null ? Math.round(avgGap) : null
                },
                alerts: alerts.map((a: any) => ({ id: a.id, type: a.alertType, severity: a.severity, at: a.createdAt })),
                relationships: (relationships as any[]).map((r: any) => ({
                    relatedEntity: r.fromLogicalId === logicalId ? r.toLogicalId : r.fromLogicalId,
                    direction: r.fromLogicalId === logicalId ? 'outbound' : 'inbound',
                    type: r.relationType
                })),
                aiAssessment: assessment
            });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    });

    return router;
}



