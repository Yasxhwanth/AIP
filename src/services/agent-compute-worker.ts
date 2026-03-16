import amqp from 'amqplib';
import { PrismaClient } from '../generated/prisma';
import { getLlmClient } from '../lib/llm-factory';

// @ts-ignore: dynamic type matching
const prisma = new PrismaClient() as any;
const RBMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'agent_compute_queue';

// The compute worker utilizes the LLM processing directly
const llm = getLlmClient();

async function connectQueue(retries = 5, delay = 5000): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Connecting Agent Worker to MQ at ${RBMQ_URL}...`);
            return await amqp.connect(RBMQ_URL);
        } catch (error) {
            console.error(`MQ connection failed. Retrying...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    throw new Error('Failed to connect worker to RabbitMQ');
}

async function startAgentWorker() {
    try {
        const connection = await connectQueue();
        const channel = await connection.createChannel();

        // Create the queue and also declare a reply exchange structure
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log(`🧠 AI Agent Worker listening on [${QUEUE_NAME}]`);

        channel.prefetch(2); // Can process 2 LLM queries concurrently

        channel.consume(QUEUE_NAME, async (msg: any) => {
            if (msg !== null) {
                try {
                    const reqPayload = JSON.parse(msg.content.toString());
                    const { agentId, message, correlationId, replyTo } = reqPayload;

                    console.log(`[Compute Worker] Processing chat for Agent: ${agentId}`);

                    const agent = await prisma.aIPAgent.findUnique({ where: { id: agentId } });
                    if (!agent) throw new Error('Agent not found');

                    // RAG Process 
                    const allowedTypes = agent.ontologyAccess as string[];
                    let contextData = "\\nNo live contextual data found.";

                    if (allowedTypes && allowedTypes.length > 0) {
                        const entities = await prisma.entityType.findMany({
                            where: { id: { in: allowedTypes } },
                            include: { instances: { take: 10 } }
                        });
                        contextData = entities.map((et: any) => {
                            return `\n=== Current State for ${et.name} ===\nTotal tracked: ${et.instances.length}\nSample Data:\n${et.instances.map((i: any) => `- Logcal ID ${i.logicalId}: ${JSON.stringify(i.data)}`).join('\n')}`;
                        }).join('\n');
                    }

                    const llmMessages: any[] = [
                        { role: 'system', content: `${agent.systemPrompt || 'You are an AI assistant.'}\n\nYou have access to the following live Ontology Data from the platform database:\n${contextData}` },
                        { role: 'user', content: message }
                    ];

                    let finalResponse = "Compute Worker Error.";
                    if (process.env.OPENAI_API_KEY) {

                        // ── AIP Logic: Bind Database Functions as OpenAI Tools ──
                        let openAITools: any[] | undefined = undefined;
                        const availableFunctions = [];

                        if (agent.tools && Array.isArray(agent.tools) && agent.tools.length > 0) {
                            const dbFunctions = await prisma.aIPFunction.findMany({
                                where: { id: { in: agent.tools } }
                            });

                            if (dbFunctions.length > 0) {
                                openAITools = [];
                                for (const fn of dbFunctions) {
                                    availableFunctions.push(fn);
                                    openAITools.push({
                                        type: "function",
                                        function: {
                                            name: fn.name,
                                            description: fn.description,
                                            parameters: fn.parameters || { type: "object", properties: {} }
                                        }
                                    });
                                }
                            }
                        }

                        // ── Inference Pass (Gemini handles tool calling via Unified Interface) ──
                        const llmResponse = await llm.chat({
                            model: (agent as any).modelConfig?.model || process.env.GEMINI_MODEL || 'gemini-2.0-flash',
                            systemPrompt: `${agent.systemPrompt || 'You are an AI assistant.'}\n\nYou have access to the following live Ontology Data from the platform database:\n${contextData}`,
                            messages: [{ role: 'user', content: message }],
                            tools: openAITools // The LlmClient interface handles the mapping
                        });

                        finalResponse = llmResponse.answer || 'No response generated.';

                    } else {
                        // Mock fallback
                        await new Promise(r => setTimeout(r, 1000));
                        finalResponse = "[Compute Worker Mock Response]: " + message;
                    }

                    // Reply via RPC pattern back to the Express Web Thread
                    if (replyTo && correlationId) {
                        channel.sendToQueue(replyTo, Buffer.from(JSON.stringify({
                            response: finalResponse,
                            modelUsed: process.env.OPENAI_API_KEY ? 'gpt-4o' : 'mock-worker'
                        })), {
                            correlationId: correlationId
                        });
                    }

                    channel.ack(msg);
                } catch (err) {
                    console.error('Agent compute failed:', err);
                    channel.nack(msg, false, false);
                }
            }
        });

    } catch (err) {
        console.error('Fatal Worker Error:', err);
        process.exit(1);
    }
}

startAgentWorker();
