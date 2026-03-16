"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgentRouter = createAgentRouter;
const express_1 = require("express");
function createAgentRouter(prisma) {
    const router = (0, express_1.Router)();
    // List all agents
    router.get('/', async (req, res) => {
        try {
            const agents = await prisma.aIPAgent.findMany({
                orderBy: { updatedAt: 'desc' }
            });
            res.json(agents);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // Get single agent
    router.get('/:id', async (req, res) => {
        try {
            const agent = await prisma.aIPAgent.findUnique({
                where: { id: req.params.id }
            });
            if (!agent)
                return res.status(404).json({ error: 'Agent not found' });
            res.json(agent);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // Create agent
    router.post('/', async (req, res) => {
        try {
            const agent = await prisma.aIPAgent.create({
                data: req.body
            });
            res.status(201).json(agent);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // Update agent
    router.put('/:id', async (req, res) => {
        try {
            const agent = await prisma.aIPAgent.update({
                where: { id: req.params.id },
                data: req.body
            });
            res.json(agent);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // Delete agent
    router.delete('/:id', async (req, res) => {
        try {
            await prisma.aIPAgent.delete({
                where: { id: req.params.id }
            });
            res.status(204).send();
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    return router;
}
//# sourceMappingURL=agent-router.js.map