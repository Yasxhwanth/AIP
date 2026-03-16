"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
const API_BASE = 'http://localhost:3001/api/v1';
async function verifyAipTools() {
    console.log('🚀 Starting AIP Tool Platform Verification...');
    const testScenarios = [
        {
            name: 'Ontology Inspection',
            message: 'What is the current state of entity "drill-001"?',
            expectedTool: 'get_entity'
        },
        {
            name: 'SRE Observability',
            message: 'Are there any failed jobs right now?',
            expectedTool: 'list_jobs'
        },
        {
            name: 'Operational Health',
            message: 'Give me a summary of the outbox status.',
            expectedTool: 'get_outbox_stats'
        }
    ];
    for (const scenario of testScenarios) {
        console.log(`\n📝 Testing Scenario: ${scenario.name}`);
        console.log(`💬 User: "${scenario.message}"`);
        try {
            const response = await axios_1.default.post(`${API_BASE}/aip/assist`, {
                message: scenario.message,
                page: 'sre',
                projectId: 'proj-demo',
                vars: {}
            });
            const { answer, usedTools, trace } = response.data;
            console.log(`🤖 Assistant: "${answer.substring(0, 100)}..."`);
            console.log(`🛠️ Tools Used: [${usedTools.join(', ')}]`);
            if (usedTools.includes(scenario.expectedTool)) {
                console.log(`✅ Success: Tool '${scenario.expectedTool}' was correctly called.`);
            }
            else {
                console.log(`❌ Failure: Expected tool '${scenario.expectedTool}' but it was not called.`);
            }
            if (trace && trace.length > 0) {
                console.log(`🔍 Trace: ${JSON.stringify(trace[0].metadata)}`);
            }
        }
        catch (err) {
            console.error(`❌ Error in scenario '${scenario.name}':`, err.response?.data || err.message);
        }
    }
    console.log('\n🏁 Verification Complete.');
}
verifyAipTools();
//# sourceMappingURL=verify-aip-tools.js.map