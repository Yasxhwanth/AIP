"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
const prisma_1 = require("../generated/prisma");
const openai_1 = __importDefault(require("openai"));
// @ts-ignore: dynamic type matching
const prisma = new prisma_1.PrismaClient();
const RBMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'agent_compute_queue';
// The compute worker utilizes the LLM processing directly
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || 'MISSING_KEY',
});
async function connectQueue(retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Connecting Agent Worker to MQ at ${RBMQ_URL}...`);
            return await amqplib_1.default.connect(RBMQ_URL);
        }
        catch (error) {
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
        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                try {
                    const reqPayload = JSON.parse(msg.content.toString());
                    const { agentId, message, correlationId, replyTo } = reqPayload;
                    console.log(`[Compute Worker] Processing chat for Agent: ${agentId}`);
                    const agent = await prisma.aIPAgent.findUnique({ where: { id: agentId } });
                    if (!agent)
                        throw new Error('Agent not found');
                    // RAG Process 
                    const allowedTypes = agent.ontologyAccess;
                    let contextData = "\\nNo live contextual data found.";
                    if (allowedTypes && allowedTypes.length > 0) {
                        const entities = await prisma.entityType.findMany({
                            where: { id: { in: allowedTypes } },
                            include: { instances: { take: 10 } }
                        });
                        contextData = entities.map((et) => {
                            return `\n=== Current State for ${et.name} ===\nTotal tracked: ${et.instances.length}\nSample Data:\n${et.instances.map((i) => `- Logcal ID ${i.logicalId}: ${JSON.stringify(i.data)}`).join('\n')}`;
                        }).join('\n');
                    }
                    const llmMessages = [
                        { role: 'system', content: `${agent.systemPrompt || 'You are an AI assistant.'}\n\nYou have access to the following live Ontology Data from the platform database:\n${contextData}` },
                        { role: 'user', content: message }
                    ];
                    let finalResponse = "Compute Worker Error.";
                    if (process.env.OPENAI_API_KEY) {
                        // ── AIP Logic: Bind Database Functions as OpenAI Tools ──
                        let openAITools = undefined;
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
                        // ── First Inference Pass ──
                        const payload = {
                            model: agent.modelConfig?.model || 'gpt-4o',
                            messages: llmMessages,
                        };
                        if (openAITools) {
                            payload.tools = openAITools;
                            payload.tool_choice = "auto";
                        }
                        const completion = await openai.chat.completions.create(payload);
                        const responseMessage = completion.choices[0]?.message;
                        // ── Execute Tool Calling (AIP Logic Sandbox) ──
                        if (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0) {
                            llmMessages.push(responseMessage); // Add assistant's attempt to call a function
                            for (const rawToolCall of responseMessage.tool_calls) {
                                const toolCall = rawToolCall;
                                const fnName = toolCall.function.name;
                                const parsedArgs = JSON.parse(toolCall.function.arguments);
                                console.log(`[Compute Worker] ⚡ LLM invoked function: ${fnName}`, parsedArgs);
                                const dbFn = availableFunctions.find(f => f.name === fnName);
                                let functionResult = "Error: Function not found in database.";
                                if (dbFn) {
                                    try {
                                        // Fallback to basic Javascript evaluation for Docker Alpine compatibility
                                        const runner = new Function('parsedArgs', `
                                            try {
                                                ${dbFn.code}
                                            } catch(e) {
                                                throw e;
                                            }
                                        `);
                                        const result = runner(parsedArgs);
                                        functionResult = JSON.stringify(result) || result || "Execution Success (void)";
                                    }
                                    catch (e) {
                                        console.error(`JS Execution Error in ${fnName}:`, e.message);
                                        functionResult = `Execution Error: ${e.message}`;
                                    }
                                }
                                llmMessages.push({
                                    tool_call_id: toolCall.id,
                                    role: "tool",
                                    name: fnName,
                                    content: functionResult,
                                });
                            }
                            // ── Second Inference Pass (Summarizing Tool OUTPUT) ──
                            const finalCompletion = await openai.chat.completions.create({
                                model: agent.modelConfig?.model || 'gpt-4o',
                                messages: llmMessages,
                            });
                            finalResponse = finalCompletion.choices[0]?.message?.content || 'No response after tools.';
                        }
                        else {
                            // Standard response
                            finalResponse = responseMessage?.content || 'No response generated.';
                        }
                    }
                    else {
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
                }
                catch (err) {
                    console.error('Agent compute failed:', err);
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
startAgentWorker();
//# sourceMappingURL=agent-compute-worker.js.map