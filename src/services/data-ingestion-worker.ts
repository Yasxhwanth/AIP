import amqp from 'amqplib';

// @ts-ignore: Next.js edge compatibility typing issue
import { PrismaClient } from '../generated/prisma';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { getTenantPrisma, tenantStorage } from '../tenant-context';
import { OntologyService } from '../ontology-service';
import { BulkIngestionService } from './bulk-ingestion-service';

const databaseUrl = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);

const prismaRaw = new PrismaClient({ adapter });
const prisma = getTenantPrisma(prismaRaw) as any;
const ontologySvc = new OntologyService(prisma);
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'data_ingestion_queue';

async function connectToRabbitMQ(retries = 5, delay = 5000): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Connecting to RabbitMQ at ${RABBITMQ_URL}... (Attempt ${i + 1}/${retries})`);
            const conn = await amqp.connect(RABBITMQ_URL);
            return conn;
        } catch (error) {
            console.error(`RabbitMQ connection failed. Retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Failed to connect to RabbitMQ after max retries.');
}

async function startWorker() {
    try {
        const connection = await connectToRabbitMQ();
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log(`✅ Data Ingestion Worker running. Waiting for messages in [${QUEUE_NAME}]`);

        // Consume messages one by one
        channel.prefetch(1);

        channel.consume(QUEUE_NAME, async (msg: any) => {
            if (msg !== null) {
                try {
                    const payload = JSON.parse(msg.content.toString());

                    // ── Bulk Ingestion Payload (Array of records) ─────────────
                    if (payload.type === 'bulk') {
                        const { jobId, entityTypeId, projectId, actor, items } = payload;
                        console.log(`[Ingestion Worker] Processing bulk sync job: ${jobId} (${items.length} items)`);

                        await tenantStorage.run({ projectId, bypassRLS: true }, async () => {
                            // 1. Mark Job as RUNNING
                            await prisma.jobQueue.update({
                                where: { id: jobId },
                                data: { status: 'RUNNING', startedAt: new Date() }
                            });

                            try {
                                const bulkSvc = new BulkIngestionService(prisma);
                                const result = await bulkSvc.execute({ entityTypeId, projectId, actor, items });

                                // 2. Mark Job as COMPLETED / FAILED with stats
                                await prisma.jobQueue.update({
                                    where: { id: jobId },
                                    data: {
                                        status: result.failed === items.length ? 'FAILED' : 'COMPLETED',
                                        recordsProcessed: result.processed,
                                        recordsFailed: result.failed,
                                        completedAt: new Date(),
                                        lastError: result.failed > 0 ? `${result.failed} records failed to ingest` : null
                                    }
                                });
                                channel.ack(msg);
                            } catch (err: any) {
                                await prisma.jobQueue.update({
                                    where: { id: jobId },
                                    data: { status: 'FAILED', lastError: String(err.message ?? err) }
                                });
                                channel.nack(msg, false, false);
                            }
                        });
                        return; // Done
                    }

                    await tenantStorage.run({ projectId: 'system', bypassRLS: true }, async () => {
                        const { entityTypeId, logicalId, data } = payload;

                        console.log(`[Ingestion Worker] Processing single entity sync: ${logicalId}`);

                        const et = await prisma.entityType.findUnique({ where: { id: entityTypeId } });
                        if (!et) throw new Error(`Entity type ${entityTypeId} not found`);

                        await tenantStorage.run({ projectId: et.projectId }, async () => {
                            // Canonical Event-sourced write
                            await ontologySvc.recordDomainEventAndApply({
                                eventType: 'EntitySync',
                                logicalId: String(logicalId),
                                entityTypeId,
                                entityVersion: et.version,
                                data,
                                projectId: et.projectId,
                                actor: 'system:ingestion-worker'
                            });
                        });

                        // Acknowledge successful processing to remove from queue
                        channel.ack(msg);
                    });
                } catch (err) {
                    console.error('Error processing data payload:', err);
                    // Reject the message and optionally requeue it or drop it depending on business logic
                    channel.nack(msg, false, false);
                }
            }
        });

    } catch (err) {
        console.error('Fatal Worker Error:', err);
        process.exit(1);
    }
}

// Start the daemon
startWorker();
