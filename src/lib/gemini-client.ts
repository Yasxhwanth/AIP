import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { LlmClient, LlmChatOptions, LlmChatResponse, LlmMessage } from './llm-client';

export class GeminiClient implements LlmClient {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not defined in environment variables');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async chat(opts: LlmChatOptions): Promise<LlmChatResponse> {
        const modelName = opts.model || 'gemini-1.5-flash';
        const model = this.genAI.getGenerativeModel({ model: modelName });

        // Map system prompt and messages to Gemini format
        // Gemini handles "system" instructions as a separate part of the generation config in newer versions, 
        // but for simplicity and compatibility with standard chat history, we'll prefix the first user message 
        // or add a system instruction if the SDK version supports it.

        const contents: Content[] = this.mapMessagesToGemini(opts.messages, opts.systemPrompt);

        const result = await model.generateContent({
            contents,
            generationConfig: {
                temperature: opts.temperature ?? 0.7,
            }
        });

        const response = await result.response;
        const text = response.text();

        // Basic tool parsing (to be enhanced later)
        return {
            answer: text,
            // toolCalls parsing would happen here if tools were provided
        };
    }

    private mapMessagesToGemini(messages: LlmMessage[], systemPrompt?: string): Content[] {
        const contents: Content[] = [];

        // If system prompt exists, we can treat it as a special instruction.
        // For Gemini Pro (Chat), the first message is usually 'user'.
        // We'll prepend the system prompt to the first user message for now.

        let processedMessages = [...messages];
        if (systemPrompt) {
            // Check if there's already a system message
            const systemIdx = processedMessages.findIndex(m => m.role === 'system');
            if (systemIdx !== -1) {
                processedMessages[systemIdx].content = `${systemPrompt}\n\n${processedMessages[systemIdx].content}`;
            } else {
                processedMessages.unshift({ role: 'system', content: systemPrompt });
            }
        }

        // Gemini Content roles are 'user' and 'model'
        for (const msg of processedMessages) {
            const role = msg.role === 'assistant' ? 'model' : 'user';

            // If it's a system role, we still map it to 'user' but wrap the content descriptive context 
            // unless using the systemInstruction field in GenerationConfig (SDK dependent)
            const parts: Part[] = [{ text: msg.content }];

            contents.push({ role, parts });
        }

        return contents;
    }
}
