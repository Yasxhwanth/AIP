"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
// @ts-ignore: Next.js edge compatibility typing issue
const prisma_1 = require("../generated/prisma");
const prisma = new prisma_1.PrismaClient();
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'data_ingestion_queue';
async function connectToRabbitMQ(retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Connecting to RabbitMQ at ${RABBITMQ_URL}... (Attempt ${i + 1}/${retries})`);
            const conn = await amqplib_1.default.connect(RABBITMQ_URL);
            return conn;
        }
        catch (error) {
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
        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                try {
                    const payload = JSON.parse(msg.content.toString());
                    const { entityTypeId, logicalId, data } = payload;
                    console.log(`[Ingestion Worker] Processing entity sync: ${logicalId}`);
                    // Upsert Entity to Postgres
                    await prisma.currentEntityState.upsert({
                        where: { logicalId },
                        update: { data, updatedAt: new Date() },
                        create: { logicalId, entityTypeId, data }
                    });
                    // Audit Log (Fire and forget style log)
                    await prisma.entityEvent.create({
                        data: {
                            logicalId: String(logicalId),
                            entityTypeId: String(entityTypeId),
                            eventType: 'UPDATED',
                            payload
                        }
                    });
                    // Acknowledge successful processing to remove from queue
                    channel.ack(msg);
                }
                catch (err) {
                    console.error('Error processing data payload:', err);
                    // Reject the message and optionally requeue it or drop it depending on business logic
                    channel.nack(msg, false, false);
                }
            }
        });
    }
    catch (err) {
        console.error('Fatal Worker Error:', err);
        process.exit(1);
    }
}
// Start the daemon
startWorker();
//# sourceMappingURL=data-ingestion-worker.js.map