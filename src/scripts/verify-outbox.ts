import { PrismaClient } from '../generated/prisma';
import axios from 'axios';
import logger from '../logger';

const prisma = new PrismaClient();

async function main() {
    const projectId = process.env.DEFAULT_PROJECT_ID || 'proj-demo-fleet';
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const apiKey = process.env.TEST_API_KEY || 'test-api-key';

    console.log('🚀 Starting Outbox Verification...');

    // 1. Trigger Bulk Ingestion
    console.log('📦 Triggering Bulk Ingestion...');
    try {
        const payload = {
            items: [
                {
                    logicalId: `verify-outbox-${Date.now()}`,
                    status: 'active',
                    model: 'VerificationDrone-V1'
                }
            ]
        };

        const response = await axios.post(`${baseUrl}/api/v1/ontology/entity-types/Drone/instances/bulk`, payload, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'X-Project-Id': projectId,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Bulk Ingestion Success:', response.data);

        // 2. Wait for Outbox Event to be created and processed
        console.log('⏳ Waiting for Outbox processing...');
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const outboxStats = await axios.get(`${baseUrl}/api/v1/telemetry/outbox`, {
                headers: { 'X-Project-Id': projectId }
            });

            const recent = outboxStats.data.recent;
            const targetEvent = recent.find((ev: any) => ev.payload.logicalId === payload.items[0].logicalId);

            if (targetEvent) {
                console.log(`📡 Event found! Status: ${targetEvent.status}`);
                if (targetEvent.status === 'SENT') {
                    console.log('🎉 Verification COMPLETE: Outbox event SENT successfully.');
                    process.exit(0);
                }
                if (targetEvent.status === 'FAILED' || targetEvent.status === 'DEAD_LETTER') {
                    console.log(`⚠️ Verification FAILED with status: ${targetEvent.status}. Error: ${targetEvent.lastError}`);
                    process.exit(1);
                }
            } else {
                console.log(`... waiting (${attempts + 1}/${maxAttempts})`);
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
        }

        console.error('❌ Verification TIMEOUT: Outbox event not found or processed in time.');
        process.exit(1);

    } catch (err: any) {
        console.error('❌ Verification CRASHED:', err.response?.data || err.message);
        process.exit(1);
    }
}

main().finally(async () => {
    await prisma.$disconnect();
});
