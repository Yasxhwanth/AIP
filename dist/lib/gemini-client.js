"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiClient = void 0;
const generative_ai_1 = require("@google/generative-ai");
class GeminiClient {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not defined in environment variables');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async chat(opts) {
        const modelName = opts.model || 'gemini-1.5-flash';
        // Map tools to Gemini format
        let tools;
        if (opts.tools && opts.tools.length > 0) {
            tools = [{
                    functionDeclarations: opts.tools.map(t => ({
                        name: t.name,
                        description: t.description,
                        parameters: t.parameters
                    }))
                }];
        }
        const model = this.genAI.getGenerativeModel({
            model: modelName,
            tools
        });
        const contents = this.mapMessagesToGemini(opts.messages, opts.systemPrompt);
        const result = await model.generateContent({
            contents,
            generationConfig: {
                temperature: opts.temperature ?? 0.7,
            }
        });
        const response = await result.response;
        // Handle potential function calls
        const functionCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall);
        if (functionCalls && functionCalls.length > 0) {
            return {
                answer: response.text() || "I need to call some tools to help with that.",
                toolCalls: functionCalls.map(p => ({
                    name: p.functionCall.name,
                    arguments: p.functionCall.args
                }))
            };
        }
        return {
            answer: response.text(),
        };
    }
    mapMessagesToGemini(messages, systemPrompt) {
        const contents = [];
        let processedMessages = [...messages];
        if (systemPrompt) {
            const systemIdx = processedMessages.findIndex(m => m.role === 'system');
            if (systemIdx !== -1) {
                processedMessages[systemIdx].content = `${systemPrompt}\n\n${processedMessages[systemIdx].content}`;
            }
            else {
                processedMessages.unshift({ role: 'system', content: systemPrompt });
            }
        }
        for (const msg of processedMessages) {
            const role = msg.role === 'assistant' ? 'model' : 'user';
            const parts = [{ text: msg.content }];
            contents.push({ role, parts });
        }
        return contents;
    }
}
exports.GeminiClient = GeminiClient;
//# sourceMappingURL=gemini-client.js.map