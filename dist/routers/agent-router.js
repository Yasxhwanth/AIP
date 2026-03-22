"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgentRouter = createAgentRouter;
const express_1 = require("express");
const middleware_1 = require("../middleware");
function createAgentRouter(prisma) {
    const router = (0, express_1.Router)();
    const idempotency = (0, middleware_1.enforceIdempotency)(prisma);
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
            const id = req.params.id;
            const agent = await prisma.aIPAgent.findUnique({
                where: { id }
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
    router.post('/', idempotency, async (req, res) => {
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
    router.put('/:id', idempotency, async (req, res) => {
        try {
            const id = req.params.id;
            const agent = await prisma.aIPAgent.update({
                where: { id },
                data: req.body
            });
            res.json(agent);
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    // Delete agent
    router.delete('/:id', idempotency, async (req, res) => {
        try {
            const id = req.params.id;
            await prisma.aIPAgent.delete({
                where: { id }
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