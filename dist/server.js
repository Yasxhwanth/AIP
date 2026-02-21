"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("./generated/prisma/client");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
}
const adapter = new adapter_pg_1.PrismaPg({ connectionString: databaseUrl });
const prisma = new client_1.PrismaClient({ adapter });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/health', async (_req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({ status: 'ok', db: 'connected' });
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('Health check failed', err);
        res.status(500).json({ status: 'error', db: 'unavailable' });
    }
});
app.post('/entity-types', async (req, res) => {
    const { name, attributes } = req.body;
    if (!name || !Array.isArray(attributes)) {
        return res.status(400).json({ error: 'name and attributes[] are required' });
    }
    try {
        const created = await prisma.entityType.create({
            data: {
                name,
                version: 1,
                attributes: {
                    create: attributes.map((a) => ({
                        name: a.name,
                        dataType: a.dataType,
                        required: a.required,
                        temporal: a.temporal ?? false,
                    })),
                },
            },
            include: {
                attributes: true,
            },
        });
        return res.status(201).json(created);
    }
    catch (error) {
        return res.status(500).json({ error: 'failed to create entity type', details: String(error) });
    }
});
app.get('/entity-types', async (_req, res) => {
    try {
        const entityTypes = await prisma.entityType.findMany({
            orderBy: [{ name: 'asc' }, { version: 'desc' }],
            include: {
                attributes: true,
            },
        });
        return res.json(entityTypes);
    }
    catch (error) {
        return res.status(500).json({ error: 'failed to list entity types', details: String(error) });
    }
});
app.get('/entity-types/:id', async (req, res) => {
    try {
        const entityType = await prisma.entityType.findUnique({
            where: { id: req.params.id },
            include: { attributes: true },
        });
        if (!entityType) {
            return res.status(404).json({ error: 'entity type not found' });
        }
        return res.json(entityType);
    }
    catch (error) {
        return res.status(500).json({ error: 'failed to fetch entity type', details: String(error) });
    }
});
app.put('/entity-types/:id', async (req, res) => {
    const { attributes } = req.body;
    if (!Array.isArray(attributes)) {
        return res.status(400).json({ error: 'attributes[] are required for version update' });
    }
    try {
        const existing = await prisma.entityType.findUnique({
            where: { id: req.params.id },
        });
        if (!existing) {
            return res.status(404).json({ error: 'entity type not found' });
        }
        const highestVersion = await prisma.entityType.findFirst({
            where: { name: existing.name },
            orderBy: { version: 'desc' },
        });
        const newVersion = (highestVersion?.version ?? existing.version) + 1;
        // Insert-only versioning: create a new EntityType row + new AttributeDefinition rows.
        const createdVersion = await prisma.entityType.create({
            data: {
                name: existing.name,
                version: newVersion,
                attributes: {
                    create: attributes.map((a) => ({
                        name: a.name,
                        dataType: a.dataType,
                        required: a.required,
                        temporal: a.temporal ?? false,
                    })),
                },
            },
            include: { attributes: true },
        });
        return res.status(201).json(createdVersion);
    }
    catch (error) {
        return res.status(500).json({
            error: 'failed to create next entity type version',
            details: String(error),
        });
    }
});
const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map