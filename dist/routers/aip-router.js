"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAipRouter = createAipRouter;
const express_1 = require("express");
const aip_executor_1 = require("../aip-executor");
const aip_tools_1 = require("../aip-tools");
const llm_factory_1 = require("../lib/llm-factory");
function createAipRouter(prisma) {
    const router = (0, express_1.Router)();
    const executor = new aip_executor_1.AIPExecutor(prisma, aip_tools_1.defaultToolRegistry);
    const llm = (0, llm_factory_1.getLlmClient)();
    /**
     * Discovery: List available tools
     */
    router.get('/tools', async (req, res) => {
        try {
            const tools = await executor.listTools();
            res.json(tools);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    /**
     * Execution: Run a tool
     */
    router.post('/execute', async (req, res) => {
        const { toolName, parameters } = req.body;
        const projectId = req.projectId || req.body.projectId;
        if (!projectId) {
            return res.status(401).json({ error: 'Tenant context (projectId) missing' });
        }
        try {
            const result = await executor.execute({
                toolName,
                parameters,
                projectId
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
     * Assist: Natural language interaction with Gemini-backed abstraction
     */
    router.post('/assist', async (req, res) => {
        const { message, page, vars, projectId: reqProjectId } = req.body;
        const projectId = req.projectId || reqProjectId || 'proj-demo';
        try {
            // 1. Prepare tool definitions for Gemini
            const tools = aip_tools_1.defaultToolRegistry.getTools().map(tool => ({
                name: tool.name,
                description: tool.description,
                parameters: (0, aip_tools_1.zodToGeminiSchema)(tool.parameters)
            }));
            // 2. Define page-specific system guidance
            const pageGuidance = {
                ontology: "Focus on object definitions, relationships, and property metadata.",
                integrations: "Focus on data sources, pipelines, and ingestion health.",
                telemetry: "Focus on signal analysis, KPI trends, and sensor health.",
                maven: "Focus on high-level strategic overview and mission-critical alerts.",
                sre: "Focus on job health, outbox reliability, and diagnostic analysis of failures."
            };
            const systemPrompt = `You are the Maven Tactical Assistant for the AIP (backed by Gemini). 
            CURRENT WORKSPACE: ${page?.toUpperCase() || 'GENERAL'}
            SELECTION CONTEXT: ${JSON.stringify(vars || {})}
            APPLICATION STATE: ${JSON.stringify(vars?.vars || {})}
            
            GUIDANCE: ${pageGuidance[page] || "Provide general platform support."}
            
            When providing answers, try to identify relevant entities (logicalId) or jobs (jobId) and refer to them.
            Be precise, technical, and high-density. Avoid fluff.`;
            const messages = [
                { role: 'user', content: message }
            ];
            // 3. Inference Pass 1: Get Initial Response / Tool Calls
            let response = await llm.chat({
                systemPrompt,
                messages,
                tools
            });
            const usedTools = [];
            const trace = [];
            const links = [];
            const actions = [];
            // 4. Multi-turn loop: Execute tools if requested
            if (response.toolCalls && response.toolCalls.length > 0) {
                const toolResults = [];
                for (const tc of response.toolCalls) {
                    usedTools.push(tc.name);
                    const executionResult = await executor.execute({
                        toolName: tc.name,
                        parameters: tc.arguments,
                        projectId
                    });
                    trace.push(executionResult);
                    toolResults.push({
                        tool: tc.name,
                        result: executionResult
                    });
                    // Extract heuristic links from results
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
                // 5. Inference Pass 2: Synthesize final answer with tool results
                // For simplicity in this implementation, we append results to the message history
                messages.push({
                    role: 'assistant',
                    content: `I am executing tools: ${usedTools.join(', ')}. Results: ${JSON.stringify(toolResults)}`
                });
                response = await llm.chat({
                    systemPrompt,
                    messages,
                    tools
                });
            }
            // 6. Post-process response for actions
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
                trace
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