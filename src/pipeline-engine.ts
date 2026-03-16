import { PrismaClient, Prisma } from './generated/prisma';
import { executeJob } from './data-integration';

/** Execute a pipeline by its DB id — walks the ReactFlow DAG in topo order */
export async function executePipeline(
    pipelineId: string,
    runId: string,
    prisma: PrismaClient,
    trigger = 'manual',
    broadcastFn?: (topics: string[], message: any) => void
) {
    const pipeline = await prisma.pipeline.findUnique({ where: { id: pipelineId } });
    if (!pipeline) throw new Error('Pipeline not found');

    const nodes = (pipeline.nodes as any[]) || [];
    const edges = (pipeline.edges as any[]) || [];

    const logs: string[] = [];
    const steps: any[] = [];
    let totalIn = 0, totalOut = 0, errorCount = 0;

    const log = async (msg: string) => {
        const line = `[${new Date().toISOString()}] ${msg}`;
        logs.push(line);
        if (logs.length % 5 === 0 || msg.startsWith('✓') || msg.startsWith('✗')) {
            await prisma.pipelineRun.update({ where: { id: runId }, data: { logs } });
        }
        if (broadcastFn) {
            broadcastFn([`pipeline:${pipelineId}`, 'pipelines:*'], {
                type: 'pipeline.progress',
                pipelineId,
                runId,
                log: line,
                ts: Date.now()
            });
        }
    };

    const nodeData = new Map<string, any[]>(); // nodeId -> array of record objects

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

    await log(`Starting pipeline "${pipeline.name}" — ${order.length} nodes`);

    for (const nodeId of order) {
        const node = nodes.find((n: any) => n.id === nodeId);
        if (!node) continue;

        const nodeType = node.type || node.data?.nodeType || 'unknown';
        const nodeLabel = node.data?.label || nodeType;
        const stepStart = Date.now();
        const step: any = { stepId: nodeId, name: nodeLabel, type: nodeType, status: 'running', recordsIn: 0, recordsOut: 0, durationMs: 0 };

        await log(`→ Executing [${nodeType}] "${nodeLabel}"`);

        try {
            // Collect input from upstream nodes
            const inEdges = edges.filter((e: any) => e.target === nodeId);
            const inputRecords: any[] = inEdges.flatMap((e: any) => nodeData.get(e.source) ?? []);
            step.recordsIn = inputRecords.length;
            totalIn += inputRecords.length;

            let output: any[] = [];

            if (nodeType === 'dataSource' || nodeType === 'DataSourceNode') {
                const jobId = node.data?.jobId || node.data?.integrationJobId;
                if (jobId) {
                    await log(`  Executing IntegrationJob ${jobId}`);
                    const result = await executeJob(jobId, prisma);
                    output = [{ status: result.status, recordsProcessed: result.recordsProcessed }];
                    totalOut += result.recordsProcessed;
                    await log(`  ✓ Job done: ${result.recordsProcessed} records processed`);
                } else if (node.data?.url || node.data?.connectionConfig?.url) {
                    const url = node.data?.url || node.data?.connectionConfig?.url;
                    await log(`  Fetching ${url}`);
                    const resp = await fetch(url, { signal: AbortSignal.timeout(30_000) });
                    const raw = await resp.json();
                    output = Array.isArray(raw) ? raw : [raw];
                    await log(`  ✓ Fetched ${output.length} records`);
                    totalOut += output.length;
                } else {
                    output = [];
                    await log(`  No job or URL — empty source`);
                }
            } else if (nodeType === 'transform' || nodeType === 'TransformNode') {
                const code = node.data?.code || node.data?.transformCode || '';
                await log(`  Running JS transform (${code.length} chars)`);
                try {
                    const AsyncFn = Object.getPrototypeOf(async function () { }).constructor;
                    const transformFn = new AsyncFn('records', `"use strict";\n${code}`);
                    output = await transformFn(inputRecords);
                    if (!Array.isArray(output)) output = output ? [output] : [];
                    await log(`  ✓ Transform produced ${output.length} records`);
                    totalOut += output.length;
                } catch (e: any) {
                    await log(`  ✗ Transform failed: ${e.message}`);
                    throw e;
                }
            } else if (nodeType === 'sink' || nodeType === 'SinkNode') {
                const etName = node.data?.entityType;
                if (etName) {
                    await log(`  Writing ${inputRecords.length} records to Ontology: ${etName}`);
                    const et = await prisma.entityType.findFirst({ where: { name: etName } });
                    if (et) {
                        for (const rec of inputRecords) {
                            const logicalId = rec.id || rec.logicalId || `p-${runId}-${Math.random().toString(36).slice(2, 7)}`;
                            await prisma.currentEntityState.upsert({
                                where: { logicalId: String(logicalId) },
                                create: {
                                    entityTypeId: et.id,
                                    logicalId: String(logicalId),
                                    data: rec,
                                    updatedAt: new Date(),
                                    projectId: et.projectId,
                                },
                                update: { data: rec, updatedAt: new Date() }
                            });
                        }
                        await log(`  ✓ Sink complete`);
                    }
                }
                output = inputRecords;
            } else {
                await log(`  Unknown node type — passing through`);
                output = inputRecords;
            }

            nodeData.set(nodeId, output);
            step.recordsOut = output.length;
            step.status = 'success';
            step.durationMs = Date.now() - stepStart;
            steps.push(step);
        } catch (err: any) {
            step.status = 'failed';
            step.error = String(err);
            errorCount++;
            await log(`  ✗ Node failed: ${err.message || err}`);
            steps.push(step);
            throw err; // fail entire pipeline on single node error
        }
    }

    const runStatus = errorCount > 0 && totalOut === 0 ? 'failed' : 'success';
    await log(`Pipeline complete. Total In: ${totalIn}, Total Out: ${totalOut}`);
    return { status: runStatus, recordsIn: totalIn, recordsOut: totalOut, errorCount, steps, logs };
}
