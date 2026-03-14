import { Router } from 'express';
import { AIPExecutor } from '../aip-executor';
import { PrismaClient } from '../generated/prisma';
import { defaultToolRegistry } from '../aip-tools';

export function createAipRouter(prisma: PrismaClient) {
    const router = Router();
    const executor = new AIPExecutor(prisma, defaultToolRegistry);

    /**
     * Discovery: List available tools
     */
    router.get('/tools', async (req, res) => {
        try {
            const tools = await executor.listTools();
            res.json(tools);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    /**
     * Execution: Run a tool
     */
    router.post('/execute', async (req, res) => {
        const { toolName, parameters } = req.body;

        // Extract projectId from request (set by apiKeyAuth/tenantContext middleware)
        const projectId = (req as any).projectId;

        if (!projectId) {
            return res.status(401).json({ error: 'Tenant context (projectId) missing' });
        }

        try {
            const result = await executor.execute({
                toolName,
                parameters,
                projectId
            });

            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
}
