const fetch = require('node-fetch');

async function testAipLogic() {
    const BASE_URL = 'http://localhost:3001';
    console.log("🚀 Starting AIP Logic Integration Test...");

    try {
        // 1. Create an AIP Function (Tool)
        console.log("1. Deploying a test AIPFunction block...");
        const fnRes = await fetch(`${BASE_URL}/api/functions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "calculate_tax",
                description: "Calculates the tax on a given transaction amount.",
                parameters: {
                    type: "object",
                    properties: {
                        amount: { type: "number", description: "The transaction amount to tax." }
                    },
                    required: ["amount"]
                },
                code: "const amt = parsedArgs.amount; return { original: amt, tax: amt * 0.15, total: amt * 1.15 };"
            })
        });

        if (!fnRes.ok) throw new Error("Failed to create function");
        const fnData = await fnRes.json();
        console.log(`   ✅ Created Function: ${fnData.name} (${fnData.id})`);

        // 2. Create an Agent and Bind the Tool
        console.log("\n2. Creating an Agent and Binding the Tool...");
        const agentRes = await fetch(`${BASE_URL}/api/agents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Financial Assistant",
                description: "A test agent for verifying tool logic.",
                systemPrompt: "You are a helpful financial assistant. ALWAYS use the calculate_tax tool when asked about taxes or transactions.",
                ontologyAccess: [],
                tools: [fnData.id] // Bind the newly created tool
            })
        });

        if (!agentRes.ok) throw new Error("Failed to create agent");
        const agentData = await agentRes.json();
        console.log(`   ✅ Created Agent: ${agentData.name} (${agentData.id})`);

        // 3. Initiate Chat
        console.log("\n3. Instructing LLM to trigger the tool via RabbitMQ Worker...");
        const chatRes = await fetch(`${BASE_URL}/api/agents/${agentData.id}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "I have a transaction for $500. Calculate the tax for me please."
            })
        });

        if (!chatRes.ok) throw new Error("Chat failed");
        const chatData = await chatRes.json();
        console.log("\n   🤖 LLM Final Response: ");
        console.log(`   ${chatData.response}`);

        if (chatData.response.includes("75") || chatData.response.includes("575")) {
            console.log("\n✅ SUCCESS: LLM successfully utilized the AIP function and retrieved correct VM calculation.");
        } else {
            console.log("\n⚠️ WARNING: Response did not seem to contain the correct mathematical calculation from the V8 VM sandbox.");
        }

    } catch (e) {
        console.error("Test Failed:", e);
    }
}

testAipLogic();
