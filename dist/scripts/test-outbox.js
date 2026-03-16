"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const prisma_1 = require("../generated/prisma");
const data_integration_1 = require("../data-integration");
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("../logger"));
const outbox_service_1 = require("../outbox-service");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
async function main() {
    const baseUrl = process.env.DATABASE_URL || '';
    const databaseUrl = baseUrl.replace('aip_app:aip_password', 'aip_user:aip_password');
    const pool = new pg_1.Pool({ connectionString: databaseUrl });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    const prisma = new prisma_1.PrismaClient({ adapter });
    const port = 4000;
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    let receivedPayload = null;
    app.post('/webhook', (req, res) => {
        logger_1.default.info('📩 Mock Webhook Received Payload');
        receivedPayload = req.body;
        res.status(200).send('OK');
    });
    const server = app.listen(port, () => {
        console.log(`📡 Mock Webhook Listener started on port ${port}`);
    });
    // 0. Start Outbox Dispatcher for the test
    const outbox = new outbox_service_1.OutboxService(prisma, { pollIntervalMs: 1000 });
    outbox.start();
    try {
        // 1. Find a project and entity type
        const project = await prisma.project.findFirst();
        const entityType = await prisma.entityType.findFirst({
            where: {
                projectId: project?.id
            }
        });
        if (!project || !entityType) {
            console.error('❌ Project or EntityType not found. Run seed first.');
            process.exit(1);
        }
        console.log(`Using Project: ${project.id}, EntityType: ${entityType.name}`);
        // 2. Trigger Mutation with Outbox
        console.log('\n--- Step 1: Triggering Mutation with Outbox ---');
        const logicalId = `outbox-test-${Date.now()}`;
        const result = await (0, data_integration_1.upsertEntityInstance)(entityType, logicalId, { status: 'INITIAL', test: 'outbox' }, prisma, {
            sourceSystem: 'TEST',
            sourceRecordId: logicalId,
            generateOutbox: {
                targetSystem: 'WEBHOOK',
            },
        });
        if (!result.success) {
            throw new Error(`Mutation failed: ${result.error}`);
        }
        // Wait, mutateEntity in data-integration.ts puts the newState as the payload.
        // We need to tell the outbox service WHERE to send it.
        // Let's check our OutboxService.sendWebhook logic:
        // const { url, method = 'POST' } = event.payload as any;
        // This means the 'data' passed to mutateEntity should include the URL if we want it to work out-of-the-box,
        // OR we need to enhance how OutboxEvent payloads are constructed.
        // Let's fix the payload to include the URL for this test.
        console.log('Updating outbox event with test URL...');
        const latestEvent = await prisma.outboxEvent.findFirst({
            where: { aggregateId: logicalId },
            orderBy: { createdAt: 'desc' }
        });
        if (latestEvent) {
            await prisma.outboxEvent.update({
                where: { id: latestEvent.id },
                data: {
                    payload: {
                        url: `http://localhost:${port}/webhook`,
                        data: latestEvent.payload
                    }
                }
            });
        }
        console.log('✅ Mutation triggered and OutboxEvent updated with test URL.');
        // 3. Poll for completion
        console.log('\n--- Step 2: Waiting for Dispatcher to process ---');
        let attempts = 0;
        while (attempts < 10) {
            const event = await prisma.outboxEvent.findUnique({
                where: { id: latestEvent.id }
            });
            if (event?.status === 'SENT') {
                console.log('✅ Outbox Event marked as SENT.');
                break;
            }
            console.log(`Waiting... (Status: ${event?.status})`);
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
        }
        if (receivedPayload) {
            console.log('✅ Mock Webhook confirmed receipt of data!');
            console.log(JSON.stringify(receivedPayload, null, 2));
        }
        else {
            console.error('❌ Mock Webhook never received data.');
        }
    }
    finally {
        outbox.stop();
        server.close();
        await prisma.$disconnect();
        await pool.end();
    }
}
main().catch(console.error);
//# sourceMappingURL=test-outbox.js.map