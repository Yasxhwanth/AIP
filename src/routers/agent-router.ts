import { Router } from 'express';
import { AipAgent } from '../lib/aip-types';

const router = Router();

// In-memory store for demo. In production, this would be a database.
let agents: AipAgent[] = [
    {
        id: "agt-fleet-commander",
        name: "Fleet Mission Coordinator",
        description: "Optimizes drone deployment and explains telemetry anomalies.",
        systemPrompt: "You are the Fleet Mission Coordinator. Focus on asset safety and operational efficiency. You have access to telemetry and drone controls. If the user asks for asset status, focus on battery and signal strength.",
        allowedTools: ["telemetry-analyzer", "drone-dispatch", "ontology-search"],
        model: "gemini-1.5-flash"
    },
    {
        id: "agt-data-steward",
        name: "Ontology Architect",
        description: "Assists in structural object modeling and data contract remediation.",
        systemPrompt: "You are the Ontology Architect. Enforce semantic consistency and remediate schema violations. Use structural modeling terminology like 'Logical ID', 'Entity Type', and 'Property'.",
        allowedTools: ["ontology-search", "contract-remediator"],
        model: "gemini-1.5-pro"
    }
];

// List all agents
router.get('/', (req, res) => {
    res.json(agents);
});

// Get agent by ID
router.get('/:id', (req, res) => {
    const agent = agents.find(a => a.id === req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
});

// Update or Create agent
router.post('/', (req, res) => {
    const newAgent: AipAgent = req.body;
    const index = agents.findIndex(a => a.id === newAgent.id);
    if (index !== -1) {
        agents[index] = newAgent;
    } else {
        agents.push(newAgent);
    }
    res.json(newAgent);
});

export default router;
