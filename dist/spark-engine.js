"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSparkJob = executeSparkJob;
/**
 * Executes a Spark job DAG by its DB id.
 */
async function executeSparkJob(jobId, runId, prisma, broadcastFn) {
    const job = await prisma.sparkJob.findUnique({ where: { id: jobId } });
    if (!job)
        throw new Error("Spark Job not found");
    const run = await prisma.sparkJobRun.findUnique({ where: { id: runId } });
    if (!run)
        throw new Error("Spark Job Run not found");
    const stages = job.stages || [];
    let totalRecordsProcessed = 0;
    let jobFailed = false;
    const stageModels = await prisma.sparkJobStage.findMany({ where: { runId: run.id } });
    const stageMap = new Map(stageModels.map(s => [s.stageId, s]));
    for (const stg of stages) {
        if (jobFailed) {
            const s = stageMap.get(stg.id);
            if (s) {
                await prisma.sparkJobStage.update({ where: { id: s.id }, data: { status: "skipped" } });
            }
            continue;
        }
        const dbStage = stageMap.get(stg.id);
        if (!dbStage)
            continue;
        await prisma.sparkJobStage.update({ where: { id: dbStage.id }, data: { status: "running", startedAt: new Date() } });
        if (broadcastFn)
            broadcastFn(`spark:job:${jobId}`, { type: "stage.started", runId: run.id, stageId: dbStage.stageId });
        const startMs = Date.now();
        let duration = 500;
        switch (stg.type) {
            case "source":
                duration = 1200;
                break;
            case "filter":
                duration = 800;
                break;
            case "join":
                duration = 2500;
                break;
            case "aggregate":
                duration = 1800;
                break;
        }
        duration = duration + (Math.random() * 500);
        await new Promise(r => setTimeout(r, duration));
        if (Math.random() < 0.02) {
            await prisma.sparkJobStage.update({
                where: { id: dbStage.id },
                data: { status: "failed", errorMessage: "Executor lost heartbeat", finishedAt: new Date(), durationMs: Date.now() - startMs }
            });
            jobFailed = true;
            if (broadcastFn)
                broadcastFn(`spark:job:${jobId}`, { type: "stage.failed", runId: run.id, stageId: dbStage.stageId });
            break;
        }
        else {
            const recordsIn = Math.floor(Math.random() * 100000) + 5000;
            let recordsOut = recordsIn;
            if (stg.type === "filter")
                recordsOut = Math.floor(recordsIn * (Math.random() * 0.5 + 0.1));
            if (stg.type === "aggregate")
                recordsOut = Math.floor(recordsIn * 0.05);
            totalRecordsProcessed += recordsIn;
            await prisma.sparkJobStage.update({
                where: { id: dbStage.id },
                data: { status: "success", recordsIn, recordsOut, finishedAt: new Date(), durationMs: Date.now() - startMs }
            });
            if (broadcastFn)
                broadcastFn(`spark:job:${jobId}`, { type: "stage.success", runId: run.id, stageId: dbStage.stageId });
        }
    }
    await prisma.sparkJobRun.update({
        where: { id: run.id },
        data: {
            status: jobFailed ? "failed" : "success",
            finishedAt: new Date(),
            durationMs: Date.now() - run.startedAt.getTime(),
            summary: {
                totalRecords: totalRecordsProcessed,
                stages: stages.length
            },
            error: jobFailed ? "DAG execution failed due to stage failure." : null
        }
    });
    if (broadcastFn)
        broadcastFn(`spark:job:${jobId}`, { type: jobFailed ? "job.failed" : "job.success", runId: run.id });
    return { status: jobFailed ? "failed" : "success", totalRecordsProcessed };
}
//# sourceMappingURL=spark-engine.js.map