
import axios from 'axios';
import { PrismaClient } from './src/generated/prisma';

async function testMaven() {
    console.log('🧪 Starting End-to-End Maven Verification...');

    const prisma = new PrismaClient();

    try {
        // 1. Find the project
        const project = await prisma.project.findFirst({
            where: { name: 'Global Logistics & Readiness' }
        });

        if (!project) {
            console.error('❌ Project not found! Did you run the seed script?');
            return;
        }

        console.log(`✅ Found Project: ${project.name} (${project.id})`);

        const baseUrl = 'http://localhost:3001/api/v1/maven';
        const headers = { 'X-Project-Id': project.id };

        // 2. Test Metrics
        console.log('📡 Testing Metrics Endpoint...');
        const metricsRes = await axios.get(`${baseUrl}/metrics`, { headers });
        console.log('📊 Metrics Response:', JSON.stringify(metricsRes.data, null, 2));

        if (metricsRes.data.readiness && metricsRes.data.throughput) {
            console.log('✅ Metrics verified.');
        } else {
            console.log('❌ Metrics invalid.');
        }

        // 3. Test Chat (Agentic RAG)
        console.log('🤖 Testing Maven Agentic Chat...');
        const chatRes = await axios.post(`${baseUrl}/chat`, {
            message: "What is the status of the SF port and Convoy 09?"
        }, { headers });

        console.log('💬 Maven Response:', chatRes.data.message);
        if (chatRes.data.recommendation) {
            console.log('💡 Recommendation Received:', chatRes.data.recommendation.title);
        }

        console.log('✅ Maven Chat verified.');
        console.log('🏁 End-to-End Verification Complete!');
    } catch (err: any) {
        console.error('❌ Verification failed:', err.response?.data || err.message);
    } finally {
        await prisma.$disconnect();
    }
}

testMaven();
