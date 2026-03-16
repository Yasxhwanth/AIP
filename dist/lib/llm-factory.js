"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLlmClient = getLlmClient;
const gemini_client_1 = require("./gemini-client");
function getLlmClient() {
    const provider = process.env.LLM_PROVIDER || 'gemini';
    if (provider === 'gemini') {
        return new gemini_client_1.GeminiClient();
    }
    // Fallback/OpenAI could go here
    return new gemini_client_1.GeminiClient();
}
//# sourceMappingURL=llm-factory.js.map