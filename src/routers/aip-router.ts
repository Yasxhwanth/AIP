import { Router } from 'express';
import { AIPExecutor } from '../aip-executor';
import { PrismaClient } from '../generated/prisma';
import { defaultToolRegistry } from '../aip-tools';
import { getLlmClient } from '../lib/llm-factory';

export function createAipRouter(prisma: PrismaClient) {
    const router = Router();
    const executor = new AIPExecutor(prisma, defaultToolRegistry);
    const llm = getLlmClient();

    /**
     * Discovery: List available tools
     */
    router.get('/tools', async (req, res) => {
        try {
            const tools = await executor.listTools();
            res.json(tools);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * Execution: Run a tool
     */
    router.post('/execute', async (req, res) => {
        const { toolName, parameters } = req.body;
        const projectId = (req as any).projectId;

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
            } else {
                res.status(400).json(result);
            }
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * Assist: Natural language interaction with Gemini-backed abstraction
     */
    router.post('/assist', async (req, res) => {
        const { message, page, vars, projectId: reqProjectId } = req.body;
        const projectId = (req as any).projectId || reqProjectId || 'proj-demo';

        try {
            // 1. Define page-specific system guidance
            const pageGuidance: Record<string, string> = {
                ontology: "Focus on object definitions, relationships, and property metadata.",
                integrations: "Focus on data sources, pipelines, and ingestion health.",
                telemetry: "Focus on signal analysis, KPI trends, and sensor health.",
                maven: "Focus on high-level strategic overview and mission-critical alerts."
            };

            const systemPrompt = `You are the Maven Tactical Assistant for the AIP (backed by Gemini). 
            CURRENT WORKSPACE: ${page?.toUpperCase() || 'GENERAL'}
            SELECTION CONTEXT: ${JSON.stringify(vars || {})}
            APPLICATION STATE: ${JSON.stringify(vars?.vars || {})}
            
            GUIDANCE: ${pageGuidance[page] || "Provide general platform support."}
            
            Be precise, technical, and high-density. Avoid fluff. Never use emojis.`;

            // 2. Initial Inference using the unified LlmClient
            const response = await llm.chat({
                systemPrompt,
                messages: [
                    { role: 'user', content: message }
                ],
                // Tools will be re-added once Gemini tool-calling is formalized
            });

            const finalAnswer = response.answer;
            const usedTools: string[] = []; // Gemini tool execution to be enhanced
            const assistantMessage = { tool_calls: [] }; // Stub for now

            // 5. Formulate AipAssistResponse
            // Note: In a production environment, links would be extracted from the LLM response or tool results.
            // For now, we stub them based on selection or content matches.
            const links: any[] = [];
            if (vars?.logicalId) {
                links.push({
                    type: page === 'ontology' ? 'ontology' : 'telemetry',
                    label: `Inspect ${vars.logicalId}`,
                    logicalId: vars.logicalId,
                    entityTypeId: vars.entityTypeId
                });
            }

            const actions: any[] = [];
            // Reactivity: If user mentions "tab", suggest an update to the 'tab' variable
            if (message.toLowerCase().includes('tab')) {
                actions.push({
                    type: 'updateVar',
                    target: 'activeTab',
                    payload: 'history'
                });
            }

            res.json({
                answer: finalAnswer,
                usedTools,
                links,
                actions: actions.length > 0 ? actions : [],
                trace: (assistantMessage.tool_calls as any[])?.map(tc => ({
                    tool: tc.function.name,
                    args: JSON.parse(tc.function.arguments)
                })) || []
            });

        } catch (err: any) {
            console.error('[ASSIST-ERROR]', err);
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
