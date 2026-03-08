"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparkService = void 0;
class SparkService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Executes a Spark job DAG, managing the progress of individual stages natively (Promises).
     */
    async executeJob(jobId, trigger, inputData = null, broadcastFn) {
        const job = await this.prisma.sparkJob.findUnique({ where: { id: jobId } });
        if (!job)
            throw new Error("Spark Job not found");
        const stages = job.stages || [];
        // Create the run record
        const run = await this.prisma.sparkJobRun.create({
            data: {
                jobId,
                status: "running",
                trigger: trigger,
                inputData: inputData || {}
            }
        });
        // Initialize all stages as pending
        for (const stg of stages) {
            await this.prisma.sparkJobStage.create({
                data: {
                    runId: run.id,
                    stageId: stg.id,
                    stageType: stg.type,
                    status: "pending",
                    partitions: Math.max(1, Math.floor(Math.random() * 8) + 1) // Simulate 1-8 partitions
                }
            });
        }
        if (broadcastFn)
            broadcastFn(`spark:job:${jobId}`, { type: "job.started", runId: run.id });
        // Run the DAG async
        this.processDag(job, run, stages, broadcastFn).catch(err => console.error("DAG Error", err));
        return run;
    }
    async processDag(job, run, stages, broadcastFn) {
        let totalRecordsProcessed = 0;
        let jobFailed = false;
        const stageModels = await this.prisma.sparkJobStage.findMany({ where: { runId: run.id } });
        const stageMap = new Map(stageModels.map(s => [s.stageId, s]));
        // In a real DAG, we would walk topologically. For simulation, we run them sequentially 
        // with simulated delays corresponding to data processing time.
        for (const stg of stages) {
            if (jobFailed) {
                // Skip if upstream failed
                const s = stageMap.get(stg.id);
                if (s) {
                    await this.prisma.sparkJobStage.update({ where: { id: s.id }, data: { status: "skipped" } });
                }
                continue;
            }
            const dbStage = stageMap.get(stg.id);
            if (!dbStage)
                continue;
            // Mark running
            await this.prisma.sparkJobStage.update({ where: { id: dbStage.id }, data: { status: "running", startedAt: new Date() } });
            if (broadcastFn)
                broadcastFn(`spark:job:${job.id}`, { type: "stage.started", runId: run.id, stageId: dbStage.stageId });
            const startMs = Date.now();
            // Simulate processing time based on type
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
            duration = duration + (Math.random() * 500); // Jitter
            await new Promise(r => setTimeout(r, duration));
            // Random failure chance (~2%)
            if (Math.random() < 0.02) {
                await this.prisma.sparkJobStage.update({
                    where: { id: dbStage.id },
                    data: { status: "failed", errorMessage: "Executor lost heartbeat", finishedAt: new Date(), durationMs: Date.now() - startMs }
                });
                jobFailed = true;
                if (broadcastFn)
                    broadcastFn(`spark:job:${job.id}`, { type: "stage.failed", runId: run.id, stageId: dbStage.stageId });
                break;
            }
            else {
                // Success
                const recordsIn = Math.floor(Math.random() * 100000) + 5000;
                let recordsOut = recordsIn;
                if (stg.type === "filter")
                    recordsOut = Math.floor(recordsIn * (Math.random() * 0.5 + 0.1));
                if (stg.type === "aggregate")
                    recordsOut = Math.floor(recordsIn * 0.05);
                totalRecordsProcessed += recordsIn;
                await this.prisma.sparkJobStage.update({
                    where: { id: dbStage.id },
                    data: { status: "success", recordsIn, recordsOut, finishedAt: new Date(), durationMs: Date.now() - startMs }
                });
                if (broadcastFn)
                    broadcastFn(`spark:job:${job.id}`, { type: "stage.success", runId: run.id, stageId: dbStage.stageId });
            }
        }
        // Job completion
        await this.prisma.sparkJobRun.update({
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
            broadcastFn(`spark:job:${job.id}`, { type: jobFailed ? "job.failed" : "job.success", runId: run.id });
    }
}
exports.SparkService = SparkService;
//# sourceMappingURL=spark-service.js.map