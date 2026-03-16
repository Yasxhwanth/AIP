import { PrismaClient, Prisma } from './generated/prisma';
import { getLlmClient } from './lib/llm-factory';

/** Interpolate {{varName}} template tokens from a context map */
export function interpolate(template: string, ctx: Record<string, any>): string {
    if (!template) return '';
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const val = ctx[key];
        return val !== undefined ? (typeof val === 'object' ? JSON.stringify(val) : String(val)) : `{{${key}}}`;
    });
}

/** Execute a workflow by its DB id — walks the ReactFlow DAG in topological order */
export async function executeWorkflow(
    workflowId: string,
    runId: string,
    prisma: PrismaClient,
    inputs: Record<string, any> = {},
    broadcastFn?: (topics: string[], message: any) => void
) {
    const workflow = await prisma.aIWorkflow.findUnique({ where: { id: workflowId } });
    if (!workflow) throw new Error('Workflow not found');

    const nodes = (workflow.nodes as any[]) || [];
    const edges = (workflow.edges as any[]) || [];
    const logs: string[] = [];
    const steps: any[] = [];

    const log = async (msg: string) => {
        const line = `[${new Date().toISOString()}] ${msg}`;
        logs.push(line);
        // Persist logs periodically or on milestones
        if (logs.length % 3 === 0 || msg.startsWith('✓') || msg.startsWith('✗')) {
            await prisma.aIWorkflowRun.update({ where: { id: runId }, data: { logs } });
        }
        if (broadcastFn) {
            broadcastFn([`workflow:${workflowId}`, 'workflows:*'], {
                type: 'workflow.progress',
                workflowId,
                runId,
                log: line,
                ts: Date.now()
            });
        }
    };

    const updateStep = async (step: any) => {
        const idx = steps.findIndex(s => s.stepId === step.stepId);
        if (idx >= 0) steps[idx] = step; else steps.push(step);
        await prisma.aIWorkflowRun.update({ where: { id: runId }, data: { steps } });
    };

    // ── Topological sort ──────────────────────────────────────────────────────
    const adjOut = new Map<string, string[]>();
    const indegree = new Map<string, number>();
    nodes.forEach((n: any) => { adjOut.set(n.id, []); indegree.set(n.id, 0); });
    edges.forEach((e: any) => {
        adjOut.get(e.source)?.push(e.target);
        indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);
    });
    const queue = nodes.filter((n: any) => (indegree.get(n.id) ?? 0) === 0).map((n: any) => n.id);
    const order: string[] = [];
    while (queue.length > 0) {
        const cur = queue.shift()!;
        order.push(cur);
        for (const next of (adjOut.get(cur) ?? [])) {
            const deg = (indegree.get(next) ?? 0) - 1;
            indegree.set(next, deg);
            if (deg === 0) queue.push(next);
        }
    }

    // ── Execution context: carries outputs between steps ──────────────────────
    const nodeOutputs = new Map<string, any>(); // nodeId → output value
    // Allow inputs to be referenced by name
    const ctx: Record<string, any> = { ...inputs };

    await log(`Starting workflow "${workflow.name}" — ${order.length} nodes`);

    // ── Execute each node ─────────────────────────────────────────────────────
    for (const nodeId of order) {
        const node = nodes.find((n: any) => n.id === nodeId);
        if (!node) continue;

        const nodeType: string = node.type || node.data?.nodeType || 'unknown';
        const nodeLabel: string = node.data?.label || nodeType;
        const stepStart = Date.now();
        const step: any = { stepId: nodeId, name: nodeLabel, type: nodeType, status: 'running', input: null, output: null, error: null, durationMs: 0 };
        await updateStep(step);
        await log(`→ [${nodeType}] "${nodeLabel}"`);

        // Collect inputs from upstream nodes
        const inEdges = edges.filter((e: any) => e.target === nodeId);
        const upstreamOutputs: Record<string, any> = {};
        for (const e of inEdges) {
            const upOut = nodeOutputs.get(e.source);
            if (upOut !== undefined) upstreamOutputs[e.source] = upOut;
        }
        // Also expose each upstream output by label for {{varName}} interpolation
        for (const e of inEdges) {
            const srcNode = nodes.find((n: any) => n.id === e.source);
            if (srcNode) {
                const srcLabel = (srcNode.data?.label || srcNode.id).replace(/\s+/g, '_').toLowerCase();
                ctx[srcLabel] = nodeOutputs.get(e.source) ?? null;
                ctx[`${srcNode.type || 'node'}_output`] = nodeOutputs.get(e.source) ?? null;
            }
        }
        step.input = Object.keys(upstreamOutputs).length > 0 ? upstreamOutputs : inputs;

        try {
            let output: any = null;

            switch (nodeType) {
                // ── LLM Prompt ───────────────────────────────────────────────────────
                case 'llmPrompt': {
                    const systemPrompt = interpolate(node.data?.systemPrompt || 'You are a helpful AI assistant.', ctx);
                    const userPrompt = interpolate(node.data?.userPrompt || node.data?.prompt || 'Hello', ctx);
                    const model = node.data?.model || 'gpt-4o-mini';
                    const temperature = parseFloat(node.data?.temperature ?? '0.7');

                    await log(`  Calling LLM (${model}) with ${userPrompt.length} char prompt`);

                    const llm = getLlmClient();
                    const response = await llm.chat({
                        model: (node.data as any).modelConfig?.model || model,
                        systemPrompt,
                        messages: [{ role: 'user', content: userPrompt }],
                        temperature
                    });
                    output = response.answer || '';
                    await log(`  ✓ LLM returned ${String(output).length} chars`);
                    ctx['llm_output'] = output;
                    break;
                }

                // ── Ontology Query ───────────────────────────────────────────────────
                case 'ontologyQuery': {
                    const entityTypeName: string = node.data?.entityType || '';
                    const limitRaw = parseInt(node.data?.limit ?? '20', 10);
                    const limit = isNaN(limitRaw) ? 20 : Math.min(limitRaw, 200);

                    await log(`  Querying entity type "${entityTypeName}" (limit ${limit})`);
                    const entityType = await prisma.entityType.findFirst({ where: { name: entityTypeName } });
                    if (!entityType) {
                        await log(`  ⚠ Entity type "${entityTypeName}" not found`);
                        output = [];
                    } else {
                        const records = await prisma.currentEntityState.findMany({
                            where: { entityTypeId: entityType.id },
                            take: limit,
                            orderBy: { updatedAt: 'desc' }
                        });
                        output = records.map((r: any) => ({ logicalId: r.logicalId, ...r.data }));
                        await log(`  ✓ Retrieved ${output.length} records`);
                    }
                    ctx['ontology_output'] = output;
                    break;
                }

                // ── Function Call ────────────────────────────────────────────────────
                case 'functionCall': {
                    const fnId: string = node.data?.functionId || '';
                    const fn = fnId ? await prisma.aIPFunction.findUnique({ where: { id: fnId } }) : null;
                    if (!fn) { output = { error: `Function ${fnId} not found` }; break; }

                    await log(`  Executing function "${fn.name}"`);
                    const rawMapping: Record<string, string> = node.data?.inputMapping || {};
                    const parsedArgs: Record<string, any> = {};
                    for (const [param, tpl] of Object.entries(rawMapping)) {
                        parsedArgs[param] = interpolate(tpl, ctx);
                    }

                    try {
                        const AsyncFn = Object.getPrototypeOf(async function () { }).constructor;
                        const execFn = new AsyncFn('parsedArgs', 'context', `"use strict";\n${fn.code}`);
                        output = await Promise.race([
                            execFn(parsedArgs, ctx),
                            new Promise((_, rej) => setTimeout(() => rej(new Error('Function timeout (30s)')), 30_000))
                        ]);
                        await log(`  ✓ Function returned ${JSON.stringify(output).slice(0, 80)}`);
                    } catch (fnErr: any) {
                        output = { error: fnErr.message };
                        await log(`  ✗ Function error: ${fnErr.message}`);
                    }
                    ctx['function_output'] = output;
                    break;
                }

                // ── Action Trigger ───────────────────────────────────────────────────
                case 'actionTrigger': {
                    const actionId: string = node.data?.actionId || '';
                    const action = actionId ? await prisma.aIPAction.findUnique({ where: { id: actionId } }) : null;
                    if (!action) { output = { error: `Action ${actionId} not found` }; break; }

                    await log(`  Triggering action "${action.name}"`);
                    const paramMapping: Record<string, string> = node.data?.paramMapping || {};
                    const resolvedParams: Record<string, any> = {};
                    for (const [k, v] of Object.entries(paramMapping)) resolvedParams[k] = interpolate(v, ctx);

                    try {
                        const AsyncFn = Object.getPrototypeOf(async function () { }).constructor;
                        const execFn = new AsyncFn('params', 'prisma', 'context', `"use strict";\n${(action as any).code || 'return {ok:true};'}`);
                        output = await Promise.race([
                            execFn(resolvedParams, prisma, ctx),
                            new Promise((_, rej) => setTimeout(() => rej(new Error('Action timeout (30s)')), 30_000))
                        ]);
                        await log(`  ✓ Action triggered, result: ${JSON.stringify(output).slice(0, 80)}`);
                    } catch (actErr: any) {
                        output = { error: actErr.message };
                    }
                    ctx['action_output'] = output;
                    break;
                }

                // ── Condition ────────────────────────────────────────────────────────
                case 'condition': {
                    const expression = interpolate(node.data?.expression || 'true', ctx);
                    await log(`  Evaluating condition: ${expression.slice(0, 80)}`);
                    try {
                        const fn = new Function('ctx', `"use strict"; with(ctx) { return !!(${expression}); }`);
                        const result = fn(ctx);
                        output = { result, branch: result ? 'true' : 'false' };
                        ctx['condition_result'] = result;
                        await log(`  ✓ Condition → ${result ? 'TRUE branch' : 'FALSE branch'}`);
                    } catch (condErr: any) {
                        output = { result: false, error: condErr.message };
                        await log(`  ✗ Condition error: ${condErr.message}`);
                    }
                    break;
                }

                // ── Output ───────────────────────────────────────────────────────────
                case 'output': {
                    const label = node.data?.label || 'Output';
                    const valueTemplate = node.data?.valueTemplate || '{{llm_output}}';
                    output = interpolate(valueTemplate, ctx);
                    await log(`  ✓ Output "${label}": ${String(output).slice(0, 100)}`);

                    // Optional: write back to Ontology
                    if (node.data?.writeToOntology && node.data?.entityType) {
                        const etName: string = node.data.entityType;
                        const logicalId: string = interpolate(node.data?.logicalId || `workflow-${workflowId}-${Date.now()}`, ctx);
                        const et = await prisma.entityType.findFirst({ where: { name: etName } });
                        if (et) {
                            const projectId = (global as any).DEFAULT_PROJECT_ID || '';
                            await prisma.currentEntityState.upsert({
                                where: { logicalId },
                                create: {
                                    entityTypeId: et.id,
                                    logicalId,
                                    data: { value: output, generatedAt: new Date().toISOString() },
                                    updatedAt: new Date(),
                                    projectId: workflow.projectId,
                                },
                                update: { data: { value: output, generatedAt: new Date().toISOString() }, updatedAt: new Date() }
                            });
                            await log(`  ✓ Wrote output to Ontology entity ${etName}/${logicalId}`);
                        }
                    }
                    ctx['final_output'] = output;
                    break;
                }

                default:
                    output = Object.values(upstreamOutputs)[0] ?? null;
                    await log(`  Unknown node type "${nodeType}" — passing through`);
            }

            nodeOutputs.set(nodeId, output);
            step.status = 'success';
            step.output = output;
            step.durationMs = Date.now() - stepStart;
            await updateStep(step);
        } catch (err: any) {
            step.status = 'failed';
            step.error = String(err?.message ?? err);
            step.durationMs = Date.now() - stepStart;
            await updateStep(step);
            await log(`  ✗ "${nodeLabel}" failed: ${step.error}`);
        }
    }

    await log(`Workflow complete`);
    const finalOutput = ctx['final_output'] ?? ctx['llm_output'] ?? null;
    return { status: 'success', summary: { finalOutput, context: ctx }, steps, logs };
}
