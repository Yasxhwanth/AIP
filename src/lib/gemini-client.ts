import { GoogleGenerativeAI, Content, Part, Tool } from '@google/generative-ai';
import { LlmClient, LlmChatOptions, LlmChatResponse, LlmMessage } from './llm-client';

export class GeminiClient implements LlmClient {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || 'missing-gemini-key-dummy';
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async chat(opts: LlmChatOptions): Promise<LlmChatResponse> {
        const modelName = opts.model || process.env.GEMINI_MODEL || 'gemini-2.0-flash';

        // Map tools to Gemini format
        let tools: Tool[] | undefined;
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

        const contents: Content[] = this.mapMessagesToGemini(opts.messages, opts.systemPrompt);

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
                    name: p.functionCall!.name,
                    arguments: p.functionCall!.args
                }))
            };
        }

        return {
            answer: response.text(),
        };
    }

    private mapMessagesToGemini(messages: LlmMessage[], systemPrompt?: string): Content[] {
        const contents: Content[] = [];

        let processedMessages = [...messages];
        if (systemPrompt) {
            const systemIdx = processedMessages.findIndex(m => m.role === 'system');
            if (systemIdx !== -1) {
                processedMessages[systemIdx].content = `${systemPrompt}\n\n${processedMessages[systemIdx].content}`;
            } else {
                processedMessages.unshift({ role: 'system', content: systemPrompt });
            }
        }

        for (const msg of processedMessages) {
            const role = msg.role === 'assistant' ? 'model' : 'user';
            const parts: Part[] = [{ text: msg.content }];
            contents.push({ role, parts });
        }

        return contents;
    }
}
