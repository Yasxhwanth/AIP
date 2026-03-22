"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAipRouter = createAipRouter;
const express_1 = require("express");
const aip_executor_1 = require("../aip-executor");
const aip_tools_1 = require("../aip-tools");
const llm_factory_1 = require("../lib/llm-factory");
const governance_service_1 = require("../governance-service");
// ── Safety Tiers ──────────────────────────────────────────────────
// Tools classified as WRITE require human approval for READ_ONLY agents.
const WRITE_TOOLS = new Set(['propose_change', 'run_pipeline', 'create_change_request']);
const READ_ONLY_SAFETY_TIER = 'READ_ONLY';
const middleware_1 = require("../middleware");
function createAipRouter(prisma) {
    const router = (0, express_1.Router)();
    const executor = new aip_executor_1.AIPExecutor(prisma, aip_tools_1.defaultToolRegistry);
    const llm = (0, llm_factory_1.getLlmClient)();
    const governanceSvc = new governance_service_1.GovernanceService(prisma);
    const idempotency = (0, middleware_1.enforceIdempotency)(prisma);
    /**
     * Discovery: List available tools with safety tier metadata
     */
    router.get('/tools', async (req, res) => {
        try {
            const tools = await executor.listTools();
            const enriched = tools.map((t) => ({
                ...t,
                safetyTier: WRITE_TOOLS.has(t.name) ? 'WRITE' : 'READ'
            }));
            res.json(enriched);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    /**
     * Execution: Run a tool directly
     */
    router.post('/execute', idempotency, async (req, res) => {
        const { toolName, parameters } = req.body;
        const projectId = req.projectId || req.body.projectId;
        if (!projectId) {
            return res.status(401).json({ error: 'Tenant context (projectId) missing' });
        }
        try {
            const result = await executor.execute({
                toolName,
                parameters,
                projectId,
                actor: req.auth?.apiKeyName || 'system',
                actorMetadata: {
                    role: req.auth?.role,
                    correlationId: req.correlationId,
                    ip: req.ip
                }
            });
            if (result.success) {
                res.json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    /**
     * Propose Action: Create a ChangeRequest for write-tool calls that need approval
     */
    router.post('/propose-action', idempotency, async (req, res) => {
        const { toolName, parameters, agentId } = req.body;
        const projectId = req.projectId || req.body.projectId || 'proj-demo';
        const actor = req.auth?.apiKeyName || 'aip-agent';
        if (!toolName) {
            return res.status(400).json({ error: 'toolName is required' });
        }
        try {
            const cr = await governanceSvc.createChangeRequest({
                projectId,
                resourceType: 'AGENT_ACTION',
                resourceId: agentId,
                proposedChanges: { toolName, parameters },
                createdBy: actor,
                branchName: 'main'
            });
            return res.status(202).json({
                proposalId: cr.id,
                status: cr.status,
                message: `Action '${toolName}' requires administrator approval before execution.`
            });
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    });
    /**
     * Assist: Natural language interaction with Gemini-backed abstraction
     */
    router.post('/assist', idempotency, async (req, res) => {
        const { message, page, vars, projectId: reqProjectId, agentId } = req.body;
        const projectId = req.projectId || reqProjectId || 'proj-demo';
        const actor = req.auth?.apiKeyName || 'system';
        try {
            // 1. Look up agent safety tier if agentId provided
            let agentSafetyTier = READ_ONLY_SAFETY_TIER; // default: conservative
            if (agentId) {
                const agent = await prisma.aIPAgent?.findUnique({ where: { id: agentId } });
                if (agent?.allowedTools) {
                    // Infer safety tier: if agent has any write tools, it's WRITE_CAPABLE
                    const agentWriteTools = agent.allowedTools.filter((t) => WRITE_TOOLS.has(t));
                    if (agentWriteTools.length > 0)
                        agentSafetyTier = 'WRITE_CAPABLE';
                }
            }
            // 2. Prepare tool definitions for Gemini (filtered by agent tier)
            const allTools = aip_tools_1.defaultToolRegistry.getTools();
            const allowedToolDefs = allTools
                .filter(tool => agentSafetyTier !== READ_ONLY_SAFETY_TIER || !WRITE_TOOLS.has(tool.name))
                .map(tool => ({
                name: tool.name,
                description: tool.description,
                parameters: (0, aip_tools_1.zodToGeminiSchema)(tool.parameters)
            }));
            // 3. Page-specific system guidance
            const pageGuidance = {
                ontology: "Focus on object definitions, relationships, and property metadata.",
                integrations: "Focus on data sources, pipelines, and ingestion health.",
                telemetry: "Focus on signal analysis, KPI trends, and sensor health.",
                maven: "Focus on high-level strategic overview and mission-critical alerts.",
                sre: "Focus on job health, outbox reliability, and diagnostic analysis of failures.",
                'agent-studio': "You are being tested. Showcase your tools and capabilities."
            };
            const systemPrompt = `You are the Maven Tactical Assistant for the AIP (backed by Gemini). 
            CURRENT WORKSPACE: ${page?.toUpperCase() || 'GENERAL'}
            SAFETY TIER: ${agentSafetyTier}
            SELECTION CONTEXT: ${JSON.stringify(vars || {})}
            
            GUIDANCE: ${pageGuidance[page] || "Provide general platform support."}
            
            When providing answers, try to identify relevant entities (logicalId) or jobs (jobId) and refer to them.
            Be precise, technical, and high-density. Avoid fluff.`;
            const messages = [
                { role: 'user', content: message }
            ];
            // 4. Inference Pass 1: Get Initial Response / Tool Calls
            let response = await llm.chat({
                systemPrompt,
                messages,
                tools: allowedToolDefs
            });
            const usedTools = [];
            const trace = [];
            const links = [];
            const actions = [];
            let requiresApproval = false;
            let proposalId = null;
            // 5. Multi-turn loop: Execute tools if requested
            if (response.toolCalls && response.toolCalls.length > 0) {
                const toolResults = [];
                for (const tc of response.toolCalls) {
                    usedTools.push(tc.name);
                    // Safety gate: block WRITE tools for READ_ONLY agents
                    if (WRITE_TOOLS.has(tc.name) && agentSafetyTier === READ_ONLY_SAFETY_TIER) {
                        // Create a ChangeRequest for human approval instead of executing
                        const cr = await governanceSvc.createChangeRequest({
                            projectId,
                            resourceType: 'AGENT_ACTION',
                            resourceId: agentId,
                            proposedChanges: { toolName: tc.name, parameters: tc.arguments },
                            createdBy: actor,
                            branchName: 'main'
                        });
                        requiresApproval = true;
                        proposalId = cr.id;
                        trace.push({
                            tool: tc.name,
                            status: 'BLOCKED_PENDING_APPROVAL',
                            proposalId: cr.id,
                            message: 'Write action requires administrator approval.'
                        });
                        toolResults.push({
                            tool: tc.name,
                            result: { blocked: true, proposalId: cr.id }
                        });
                        continue;
                    }
                    const executionResult = await executor.execute({
                        toolName: tc.name,
                        parameters: tc.arguments,
                        projectId,
                        actor,
                        actorMetadata: {
                            role: req.auth?.role,
                            correlationId: req.correlationId,
                            ip: req.ip
                        }
                    });
                    trace.push(executionResult);
                    toolResults.push({
                        tool: tc.name,
                        result: executionResult
                    });
                    // Extract heuristic links
                    if (tc.name === 'get_entity' && executionResult.success) {
                        links.push({
                            type: 'ontology',
                            label: `View Entity: ${tc.arguments.logicalId}`,
                            logicalId: tc.arguments.logicalId
                        });
                    }
                    if (tc.name === 'list_jobs' && executionResult.success) {
                        const firstFailed = executionResult.result.jobs?.find((j) => j.status === 'FAILED');
                        if (firstFailed) {
                            links.push({
                                type: 'job',
                                label: `Failed Job: ${firstFailed.name || firstFailed.id}`,
                                jobId: firstFailed.id
                            });
                        }
                    }
                }
                // 6. Inference Pass 2: Synthesize final answer with tool results
                messages.push({
                    role: 'assistant',
                    content: `I executed tools: ${usedTools.join(', ')}. Results: ${JSON.stringify(toolResults)}`
                });
                response = await llm.chat({
                    systemPrompt,
                    messages,
                    tools: allowedToolDefs
                });
            }
            // 7. Post-process response for actions
            if (response.answer.toLowerCase().includes('change tab to')) {
                const match = response.answer.match(/change tab to (\w+)/i);
                if (match) {
                    actions.push({
                        type: 'updateVar',
                        target: 'activeTab',
                        payload: match[1]
                    });
                }
            }
            res.json({
                answer: response.answer,
                usedTools,
                links,
                actions,
                trace,
                requiresApproval,
                ...(proposalId ? { proposalId } : {})
            });
        }
        catch (err) {
            console.error('[ASSIST-ERROR]', err);
            res.status(500).json({ error: err.message });
        }
    });
    return router;
}
//# sourceMappingURL=aip-router.js.map