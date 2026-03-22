"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolate = interpolate;
exports.executeWorkflow = executeWorkflow;
const llm_factory_1 = require("./lib/llm-factory");
const ontology_service_1 = require("./ontology-service");
/** Interpolate {{varName}} template tokens from a context map */
function interpolate(template, ctx) {
    if (!template)
        return '';
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const val = ctx[key];
        return val !== undefined ? (typeof val === 'object' ? JSON.stringify(val) : String(val)) : `{{${key}}}`;
    });
}
/** Execute a workflow by its DB id — walks the ReactFlow DAG in topological order */
async function executeWorkflow(workflowId, runId, prisma, inputs = {}, broadcastFn) {
    const workflow = await prisma.aIWorkflow.findUnique({ where: { id: workflowId } });
    if (!workflow)
        throw new Error('Workflow not found');
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];
    const logs = [];
    const steps = [];
    const log = async (msg) => {
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
    const updateStep = async (step) => {
        const idx = steps.findIndex(s => s.stepId === step.stepId);
        if (idx >= 0)
            steps[idx] = step;
        else
            steps.push(step);
        await prisma.aIWorkflowRun.update({ where: { id: runId }, data: { steps } });
    };
    // ── Topological sort ──────────────────────────────────────────────────────
    const adjOut = new Map();
    const indegree = new Map();
    nodes.forEach((n) => { adjOut.set(n.id, []); indegree.set(n.id, 0); });
    edges.forEach((e) => {
        adjOut.get(e.source)?.push(e.target);
        indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);
    });
    const queue = nodes.filter((n) => (indegree.get(n.id) ?? 0) === 0).map((n) => n.id);
    const order = [];
    while (queue.length > 0) {
        const cur = queue.shift();
        order.push(cur);
        for (const next of (adjOut.get(cur) ?? [])) {
            const deg = (indegree.get(next) ?? 0) - 1;
            indegree.set(next, deg);
            if (deg === 0)
                queue.push(next);
        }
    }
    // ── Execution context: carries outputs between steps ──────────────────────
    const nodeOutputs = new Map(); // nodeId → output value
    // Allow inputs to be referenced by name
    const ctx = { ...inputs };
    await log(`Starting workflow "${workflow.name}" — ${order.length} nodes`);
    // ── Execute each node ─────────────────────────────────────────────────────
    for (const nodeId of order) {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node)
            continue;
        const nodeType = node.type || node.data?.nodeType || 'unknown';
        const nodeLabel = node.data?.label || nodeType;
        const stepStart = Date.now();
        const step = { stepId: nodeId, name: nodeLabel, type: nodeType, status: 'running', input: null, output: null, error: null, durationMs: 0 };
        await updateStep(step);
        await log(`→ [${nodeType}] "${nodeLabel}"`);
        // Collect inputs from upstream nodes
        const inEdges = edges.filter((e) => e.target === nodeId);
        const upstreamOutputs = {};
        for (const e of inEdges) {
            const upOut = nodeOutputs.get(e.source);
            if (upOut !== undefined)
                upstreamOutputs[e.source] = upOut;
        }
        // Also expose each upstream output by label for {{varName}} interpolation
        for (const e of inEdges) {
            const srcNode = nodes.find((n) => n.id === e.source);
            if (srcNode) {
                const srcLabel = (srcNode.data?.label || srcNode.id).replace(/\s+/g, '_').toLowerCase();
                ctx[srcLabel] = nodeOutputs.get(e.source) ?? null;
                ctx[`${srcNode.type || 'node'}_output`] = nodeOutputs.get(e.source) ?? null;
            }
        }
        step.input = Object.keys(upstreamOutputs).length > 0 ? upstreamOutputs : inputs;
        try {
            let output = null;
            switch (nodeType) {
                // ── LLM Prompt ───────────────────────────────────────────────────────
                case 'llmPrompt': {
                    const systemPrompt = interpolate(node.data?.systemPrompt || 'You are a helpful AI assistant.', ctx);
                    const userPrompt = interpolate(node.data?.userPrompt || node.data?.prompt || 'Hello', ctx);
                    const model = node.data?.model || 'gpt-4o-mini';
                    const temperature = parseFloat(node.data?.temperature ?? '0.7');
                    await log(`  Calling LLM (${model}) with ${userPrompt.length} char prompt`);
                    const llm = (0, llm_factory_1.getLlmClient)();
                    const response = await llm.chat({
                        model: node.data.modelConfig?.model || model,
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
                    const entityTypeName = node.data?.entityType || '';
                    const limitRaw = parseInt(node.data?.limit ?? '20', 10);
                    const limit = isNaN(limitRaw) ? 20 : Math.min(limitRaw, 200);
                    await log(`  Querying entity type "${entityTypeName}" (limit ${limit})`);
                    const entityType = await prisma.entityType.findFirst({ where: { name: entityTypeName } });
                    if (!entityType) {
                        await log(`  ⚠ Entity type "${entityTypeName}" not found`);
                        output = [];
                    }
                    else {
                        const records = await prisma.currentEntityState.findMany({
                            where: { entityTypeId: entityType.id },
                            take: limit,
                            orderBy: { updatedAt: 'desc' }
                        });
                        output = records.map((r) => ({ logicalId: r.logicalId, ...r.data }));
                        await log(`  ✓ Retrieved ${output.length} records`);
                    }
                    ctx['ontology_output'] = output;
                    break;
                }
                // ── Function Call ────────────────────────────────────────────────────
                case 'functionCall': {
                    const fnId = node.data?.functionId || '';
                    const fn = fnId ? await prisma.aIPFunction.findUnique({ where: { id: fnId } }) : null;
                    if (!fn) {
                        output = { error: `Function ${fnId} not found` };
                        break;
                    }
                    await log(`  Executing function "${fn.name}"`);
                    const rawMapping = node.data?.inputMapping || {};
                    const parsedArgs = {};
                    for (const [param, tpl] of Object.entries(rawMapping)) {
                        parsedArgs[param] = interpolate(tpl, ctx);
                    }
                    try {
                        const AsyncFn = Object.getPrototypeOf(async function () { }).constructor;
                        const execFn = new AsyncFn('parsedArgs', 'context', `"use strict";\n${fn.code}`);
                        output = await Promise.race([
                            execFn(parsedArgs, ctx),
                            new Promise((_, rej) => setTimeout(() => rej(new Error('Function timeout (30s)')), 30000))
                        ]);
                        await log(`  ✓ Function returned ${JSON.stringify(output).slice(0, 80)}`);
                    }
                    catch (fnErr) {
                        output = { error: fnErr.message };
                        await log(`  ✗ Function error: ${fnErr.message}`);
                    }
                    ctx['function_output'] = output;
                    break;
                }
                // ── Action Trigger ───────────────────────────────────────────────────
                case 'actionTrigger': {
                    const actionId = node.data?.actionId || '';
                    const action = actionId ? await prisma.aIPAction.findUnique({ where: { id: actionId } }) : null;
                    if (!action) {
                        output = { error: `Action ${actionId} not found` };
                        break;
                    }
                    await log(`  Triggering action "${action.name}"`);
                    const paramMapping = node.data?.paramMapping || {};
                    const resolvedParams = {};
                    for (const [k, v] of Object.entries(paramMapping))
                        resolvedParams[k] = interpolate(v, ctx);
                    try {
                        const AsyncFn = Object.getPrototypeOf(async function () { }).constructor;
                        const execFn = new AsyncFn('params', 'prisma', 'context', `"use strict";\n${action.code || 'return {ok:true};'}`);
                        output = await Promise.race([
                            execFn(resolvedParams, prisma, ctx),
                            new Promise((_, rej) => setTimeout(() => rej(new Error('Action timeout (30s)')), 30000))
                        ]);
                        await log(`  ✓ Action triggered, result: ${JSON.stringify(output).slice(0, 80)}`);
                    }
                    catch (actErr) {
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
                    }
                    catch (condErr) {
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
                        const etName = node.data.entityType;
                        const logicalId = interpolate(node.data?.logicalId || `workflow-${workflowId}-${Date.now()}`, ctx);
                        const et = await prisma.entityType.findFirst({ where: { name: etName } });
                        if (et) {
                            const ontologySvc = new ontology_service_1.OntologyService(prisma);
                            await ontologySvc.recordDomainEventAndApply({
                                eventType: 'WorkflowOutput',
                                logicalId,
                                entityTypeId: et.id,
                                entityVersion: et.version,
                                data: { value: output, generatedAt: new Date().toISOString() },
                                projectId: workflow.projectId,
                                actor: 'system:workflow-engine'
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
        }
        catch (err) {
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
//# sourceMappingURL=workflow-engine.js.map