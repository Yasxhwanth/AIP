import 'dotenv/config';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from './generated/prisma';
import { evaluatePolicies } from './policy-engine';
import { executeJob, startScheduler, dryRunJob } from './data-integration';
import { SchemaInferenceService } from './schema-inference-service';
import { RelationshipDerivationService, startConfidenceDecayScheduler } from './relationship-derivation-service';
import { evaluateComputedMetrics } from './computed-metrics';
import { computeRollups, computeAllRecentRollups, startRollupScheduler } from './rollup-engine';
import { Orchestrator } from './orchestrator';
import { runInference, runInferenceByModel, runAllModelsForEntity } from './inference-engine';
import { executeDecision, evaluateAllRules } from './decision-engine';
import { IdentityService } from './identity-service';
import { LineageService } from './lineage-service';
import { AbacEngine } from './abac-engine';
import helmet from 'helmet';
import cors from 'cors';
import logger from './logger';
import {
  correlationId,
  requestLogger,
  apiKeyAuth,
  createRateLimiter,
  errorHandler,
  hashApiKey,
  generateJwt,
} from './middleware';
import { randomUUID } from 'crypto';
import amqp from 'amqplib';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const app = express();
const port = process.env.PORT || 3001;

// ── RabbitMQ Publisher Setup ────────────────────────────────────────────────
let amqpChannel: amqp.Channel | null = null;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'data_ingestion_queue';

async function connectToRabbitMQ() {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    amqpChannel = await conn.createChannel();
    await amqpChannel.assertQueue(QUEUE_NAME, { durable: true });
    console.log('✅ Connected to RabbitMQ Publisher');
  } catch (err) {
    console.error('RabbitMQ Publisher Error', err);
  }
}
// Init async without blocking server start
connectToRabbitMQ();

// ── Redis Setup ─────────────────────────────────────────────────────────────
const { createClient } = require('redis');

const redisClient = process.env.REDIS_URL
  ? createClient({ url: process.env.REDIS_URL })
  : null;

if (redisClient) {
  redisClient.on('error', (err: any) => console.error('Redis Client Error', err));
  redisClient.connect().then(() => console.log('✅ Connected to Redis'))
    .catch(console.error);
}

// ── Prisma Setup ────────────────────────────────────────────────────────────
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const lineageSvc = new LineageService(prisma);

// ── Enterprise Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(correlationId());
app.use(requestLogger());
app.use(apiKeyAuth(prisma));
app.use(createRateLimiter());


// ── Projects & Dashboards ────────────────────────────────────────

app.post('/projects', async (req, res) => {
  try {
    const project = await prisma.project.create({ data: { name: req.body.name || 'New Project', description: req.body.description } });
    return res.status(201).json(project);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(projects);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/dashboards', async (req, res) => {
  try {
    let projectId = req.auth?.projectId || req.body.projectId || req.header('X-Project-Id');
    if (!projectId && process.env.NODE_ENV !== 'production') {
      projectId = (global as any).DEFAULT_PROJECT_ID;
    }
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    const dashboard = await prisma.dashboard.create({
      data: { name: req.body.name, projectId }
    });
    return res.status(201).json(dashboard);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/dashboards', async (req, res) => {
  try {
    let projectId = req.auth?.projectId || (req.query.projectId as string) || req.header('X-Project-Id');
    if (!projectId && process.env.NODE_ENV !== 'production') {
      projectId = (global as any).DEFAULT_PROJECT_ID;
    }
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    const dashboards = await prisma.dashboard.findMany({
      where: { projectId },
      include: { widgets: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(dashboards);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── End Projects & Dashboards ────────────────────────────────────

// ── Health Checks (no auth) ──────────────────────────────────────

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.get('/api/v1/health/deep', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      schedulers: { jobScheduler: 'running', rollupScheduler: 'running' },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      error: String(error),
    });
  }
});

// ── Auth Endpoints ───────────────────────────────────────────────

app.post('/api/v1/auth/api-keys', async (req, res) => {
  try {
    const { name, role, rateLimit } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const rawKey = `c3aip_${randomUUID().replace(/-/g, '')}`;
    const keyHash = hashApiKey(rawKey);

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        keyHash,
        role: role ?? 'VIEWER',
        rateLimit: rateLimit ?? 100,
      },
    });

    // Return the raw key ONLY on creation — never stored
    return res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      role: apiKey.role,
      rateLimit: apiKey.rateLimit,
      key: rawKey, // ⚠️ Only returned once
    });
  } catch (error) {
    return res.status(500).json({ error: 'failed to create API key', details: String(error) });
  }
});

app.post('/api/v1/auth/token', async (req, res) => {
  try {
    const rawKey = req.headers['x-api-key'] as string;
    if (!rawKey) return res.status(400).json({ error: 'X-API-Key header required' });

    const keyHash = hashApiKey(rawKey);
    const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });
    if (!apiKey || !apiKey.enabled) return res.status(401).json({ error: 'Invalid API key' });

    const token = generateJwt({ apiKeyId: apiKey.id, apiKeyName: apiKey.name, role: apiKey.role });
    return res.json({ token, expiresIn: '24h' });
  } catch (error) {
    return res.status(500).json({ error: 'failed to generate token', details: String(error) });
  }
});

app.get('/api/v1/auth/api-keys', async (_req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      select: { id: true, name: true, role: true, rateLimit: true, enabled: true, lastUsedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(keys);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list API keys', details: String(error) });
  }
});
type AttributeInput = {
  name: string;
  dataType: string;
  required: boolean;
  temporal?: boolean;
};

type CreateEntityTypeBody = {
  name: string;
  attributes: AttributeInput[];
};

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Health check failed', err);
    res.status(500).json({ status: 'error', db: 'unavailable' });
  }
});

app.post('/entity-types', async (req, res) => {
  const { name, attributes } = req.body as CreateEntityTypeBody;

  if (!name || !Array.isArray(attributes)) {
    return res.status(400).json({ error: 'name and attributes[] are required' });
  }

  try {
    let projectId = req.auth?.projectId || req.body.projectId || req.header('X-Project-Id');
    if (!projectId && process.env.NODE_ENV !== 'production') {
      projectId = (global as any).DEFAULT_PROJECT_ID;
    }
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    const created = await prisma.entityType.create({
      data: {
        projectId,
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
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2002') {
      return res.status(409).json({ error: `Entity type '${name}' already exists.` });
    }
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
  } catch (error) {
    return res.status(500).json({ error: 'failed to list entity types', details: String(error) });
  }
});

// ── Integration & Inference ───────────────────────────────────────

app.post('/api/v1/integration/infer-schema', async (req, res) => {
  try {
    const { sample } = req.body;
    if (!sample) return res.status(400).json({ error: 'sample JSON is required' });
    const inferred = SchemaInferenceService.inferAttributes(sample);
    return res.json({ attributes: inferred });
  } catch (error) {
    return res.status(500).json({ error: 'failed to infer schema', details: String(error) });
  }
});

app.post('/api/v1/integration/suggest-mappings', async (req, res) => {
  try {
    // Accept BOTH formats:
    //   New: { inferredAttributes: [{name,dataType}], entityTypeId }
    //   Legacy (frontend wizard): { sampleData: [...], targetEntityType: "name" }
    let { inferredAttributes, entityTypeId, sampleData, targetEntityType } = req.body;

    // If legacy format: infer attributes from sample data first
    if (!inferredAttributes && sampleData) {
      const sample = Array.isArray(sampleData) ? sampleData[0] : sampleData;
      inferredAttributes = sample ? SchemaInferenceService.inferAttributes(sample as Record<string, any>) : [];
    }

    if (!inferredAttributes) {
      return res.status(400).json({ error: 'inferredAttributes (or sampleData) is required' });
    }

    // If entityTypeId not provided, try to look up by name
    if (!entityTypeId && targetEntityType) {
      let projectId = req.auth?.projectId || req.header('X-Project-Id');
      if (!projectId && process.env.NODE_ENV !== 'production') projectId = (global as any).DEFAULT_PROJECT_ID;
      if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

      const found = await prisma.entityType.findFirst({
        where: { name: targetEntityType, projectId },
        orderBy: { version: 'desc' }
      });
      entityTypeId = found?.id;
    }

    // If we have an entityTypeId, do precise attribute mapping
    if (entityTypeId) {
      const entityType = await prisma.entityType.findUnique({
        where: { id: entityTypeId },
        include: { attributes: true },
      });
      if (!entityType) return res.status(404).json({ error: 'entity type not found' });

      const suggestions = SchemaInferenceService.suggestMappings(inferredAttributes, entityType.attributes);
      return res.json({ suggestions });
    }

    // Fallback: return the inferred attributes as auto-mapping suggestions (identity mapping)
    const autoMap: Record<string, string> = {};
    for (const attr of inferredAttributes) { autoMap[attr.name] = attr.name; }
    return res.json({ suggestions: autoMap, inferredAttributes });
  } catch (error) {
    return res.status(500).json({ error: 'failed to suggest mappings', details: String(error) });
  }
});

app.post('/api/v1/pipelines', async (req, res) => {
  try {
    const { name, description, nodes, edges } = req.body;
    let projectId = req.auth?.projectId || req.header('X-Project-Id');
    if (!projectId && process.env.NODE_ENV !== 'production') {
      projectId = (global as any).DEFAULT_PROJECT_ID;
    }
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    const pipeline = await prisma.pipeline.create({
      data: {
        name,
        description,
        nodes: nodes as any,
        edges: edges as any,
        projectId
      }
    });
    return res.status(201).json(pipeline);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/api/v1/pipelines', async (req, res) => {
  try {
    let projectId = req.auth?.projectId || (req.query.projectId as string) || req.header('X-Project-Id');
    if (!projectId && process.env.NODE_ENV !== 'production') {
      projectId = (global as any).DEFAULT_PROJECT_ID;
    }
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    const pipelines = await prisma.pipeline.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(pipelines);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/v1/ontology/derive-relationships', async (req, res) => {
  try {
    const { sourceEntityTypeId, targetEntityTypeId, relationshipDefId, maxDistanceKm } = req.body;
    if (!sourceEntityTypeId || !targetEntityTypeId || !relationshipDefId) {
      return res.status(400).json({ error: 'sourceEntityTypeId, targetEntityTypeId, and relationshipDefId are required' });
    }

    const count = await RelationshipDerivationService.deriveProximityLinks(
      sourceEntityTypeId,
      targetEntityTypeId,
      relationshipDefId,
      maxDistanceKm || 5.0,
      prisma
    );

    return res.json({ success: true, derivedLinksCount: count });
  } catch (error) {
    return res.status(500).json({ error: 'failed to derive relationships', details: String(error) });
  }
});

// ══════════════════════════════════════════════════════════════════
// ── No-Code Ontology Builder API (Timbr/Palantir style) ───────────
// ══════════════════════════════════════════════════════════════════

import { runFullReasoner } from './ontology-reasoner';

function getProjectId(req: express.Request): string | null {
  let id = (req as any).auth?.projectId || (req.query.projectId as string) || req.header('X-Project-Id') || req.body?.projectId;
  if (!id && process.env.NODE_ENV !== 'production') id = (global as any).DEFAULT_PROJECT_ID;
  return id ?? null;
}

// ── GET /api/ontology/entity-types — list all with live object counts ─────────
app.get('/api/ontology/entity-types', async (req, res) => {
  try {
    const projectId = getProjectId(req);
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });

    const types = await prisma.entityType.findMany({
      where: { projectId },
      include: {
        attributes: true,
        outgoingRelationships: { include: { targetEntityType: { select: { id: true, name: true } } } },
        incomingRelationships: { include: { sourceEntityType: { select: { id: true, name: true } } } },
      },
      orderBy: [{ name: 'asc' }, { version: 'desc' }],
    });

    // De-duplicate: keep only highest version per name
    const seen = new Map<string, typeof types[0]>();
    for (const t of types) {
      if (!seen.has(t.name) || seen.get(t.name)!.version < t.version) seen.set(t.name, t);
    }
    const latest = [...seen.values()];

    // Attach live object counts
    const withCounts = await Promise.all(latest.map(async (et) => {
      const count = await prisma.currentEntityState.count({ where: { entityTypeId: et.id } });
      return { ...et, objectCount: count };
    }));

    return res.json(withCounts);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── POST /api/ontology/entity-types — create new entity type ──────────────────
app.post('/api/ontology/entity-types', async (req, res) => {
  try {
    const projectId = getProjectId(req);
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });

    const { name, attributes = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const created = await prisma.entityType.create({
      data: {
        projectId,
        name,
        version: 1,
        attributes: { create: attributes.map((a: any) => ({ name: a.name, dataType: a.dataType ?? 'STRING', required: a.required ?? false })) },
      },
      include: { attributes: true },
    });

    // Track lineage
    await lineageSvc.registerEdge({ sourceType: 'Project', sourceId: projectId, targetType: 'EntityType', targetId: created.id, transformation: 'created' });

    return res.status(201).json({ ...created, objectCount: 0 });
  } catch (err: any) {
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Entity type name already exists' });
    return res.status(500).json({ error: String(err) });
  }
});

// ── POST /api/ontology/entity-types/:id/instances — create data row ──────────
app.post('/api/ontology/entity-types/:id/instances', async (req, res) => {
  try {
    const entityTypeId = req.params.id;
    const { logicalId, data } = req.body;
    if (!logicalId) return res.status(400).json({ error: 'Missing logicalId' });

    // Validate type existence once before pushing
    const et = await prisma.entityType.findUnique({ where: { id: entityTypeId } });
    if (!et) return res.status(404).json({ error: 'Entity type not found' });

    // Push to Message Queue (Asynchronous write)
    if (amqpChannel) {
      const payload = JSON.stringify({ entityTypeId, logicalId, data });
      amqpChannel.sendToQueue(QUEUE_NAME, Buffer.from(payload), { persistent: true });

      // Invalidate the cache for this entity type immediately
      if (redisClient) {
        const keys = await redisClient.keys(`ontology:instances:${entityTypeId}:*`);
        if (keys.length > 0) await redisClient.del(keys);
      }

      return res.status(202).json({
        message: 'Payload accepted for processing',
        logicalId,
        status: 'queued'
      });
    } else {
      // Fallback if broker is down: Synchronous insert
      const newInstance = await prisma.currentEntityState.create({
        data: { logicalId: String(logicalId), entityTypeId, data: data || {}, updatedAt: new Date() },
      });
      await (prisma as any).entityEvent.create({
        data: { logicalId: String(logicalId), entityTypeId, eventType: 'CREATED', payload: data || {} },
      });

      if (redisClient) {
        const keys = await redisClient.keys(`ontology:instances:${entityTypeId}:*`);
        if (keys.length > 0) await redisClient.del(keys);
      }

      return res.json(newInstance);
    }
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── PATCH /api/ontology/entity-types/:id — rename an entity type ──────────────
app.patch('/api/ontology/entity-types/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const et = await prisma.entityType.findUnique({ where: { id: req.params.id } });
    if (!et) return res.status(404).json({ error: 'Not found' });
    // Create a new version with updated name by updating in-place (name field is mutable metadata)
    // For just a rename we update name directly as it is not a schema-breaking change
    const updated = await prisma.entityType.update({
      where: { id: req.params.id },
      data: { name },
      include: { attributes: true },
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── DELETE /api/ontology/entity-types/:id ─────────────────────────────────────
app.delete('/api/ontology/entity-types/:id', async (req, res) => {
  try {
    const instanceCount = await prisma.currentEntityState.count({ where: { entityTypeId: req.params.id } });
    if (instanceCount > 0) {
      return res.status(409).json({ error: `Cannot delete: ${instanceCount} live objects exist. Archive them first.` });
    }
    await prisma.attributeDefinition.deleteMany({ where: { entityTypeId: req.params.id } });
    await prisma.entityType.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── POST /api/ontology/entity-types/:id/attributes — add a property ───────────
app.post('/api/ontology/entity-types/:id/attributes', async (req, res) => {
  try {
    const { name, dataType = 'STRING', required = false } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const attr = await prisma.attributeDefinition.create({
      data: { entityTypeId: req.params.id, name, dataType, required },
    });
    return res.status(201).json(attr);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── DELETE /api/ontology/entity-types/:id/attributes/:attrId ─────────────────
app.delete('/api/ontology/entity-types/:id/attributes/:attrId', async (req, res) => {
  try {
    await prisma.attributeDefinition.delete({ where: { id: req.params.attrId } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── GET /api/ontology/relationships — all relationship definitions ─────────────
app.get('/api/ontology/relationships', async (req, res) => {
  try {
    const projectId = getProjectId(req);
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });

    const rels = await prisma.relationshipDefinition.findMany({
      where: { sourceEntityType: { projectId } },
      include: {
        sourceEntityType: { select: { id: true, name: true } },
        targetEntityType: { select: { id: true, name: true } },
      },
    });
    return res.json(rels);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── POST /api/ontology/relationships — create a link type between two entity types ──
app.post('/api/ontology/relationships', async (req, res) => {
  try {
    const { name, sourceEntityTypeId, targetEntityTypeId } = req.body;
    if (!name || !sourceEntityTypeId || !targetEntityTypeId) {
      return res.status(400).json({ error: 'name, sourceEntityTypeId, targetEntityTypeId required' });
    }
    const rel = await prisma.relationshipDefinition.create({
      data: { name, sourceEntityTypeId, targetEntityTypeId },
      include: {
        sourceEntityType: { select: { id: true, name: true } },
        targetEntityType: { select: { id: true, name: true } },
      },
    });
    return res.status(201).json(rel);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── DELETE /api/ontology/relationships/:id ────────────────────────────────────
app.delete('/api/ontology/relationships/:id', async (req, res) => {
  try {
    await prisma.relationshipDefinition.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── GET /api/ontology/graph — full ontology graph for ReactFlow ───────────────
app.get('/api/ontology/graph', async (req, res) => {
  try {
    const projectId = getProjectId(req);
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });

    const entityTypes = await prisma.entityType.findMany({
      where: { projectId },
      include: { attributes: true },
    });
    // De-dup by name
    const seen = new Map<string, typeof entityTypes[0]>();
    for (const et of entityTypes) {
      if (!seen.has(et.name) || seen.get(et.name)!.version < et.version) seen.set(et.name, et);
    }
    const nodes = await Promise.all([...seen.values()].map(async (et, i) => {
      const objectCount = await prisma.currentEntityState.count({ where: { entityTypeId: et.id } });
      return {
        id: et.id, type: 'entityCard',
        position: { x: 80 + (i % 4) * 300, y: 100 + Math.floor(i / 4) * 250 },
        data: {
          label: et.name, entityId: et.id,
          objectCount, attributes: et.attributes,
        },
      };
    }));

    const latestIds = nodes.map(n => n.id);
    const rels = await prisma.relationshipDefinition.findMany({
      where: { sourceEntityTypeId: { in: latestIds }, targetEntityTypeId: { in: latestIds } },
    });

    // Also include derived (reasoner) relationships from CurrentGraph
    const derivedEdges = await prisma.currentGraph.findMany({
      where: { relationshipName: { startsWith: '[derived:' } },
      distinct: ['relationshipDefinitionId'],
      take: 100,
    });

    const edges = [
      ...rels.map(r => ({
        id: r.id, source: r.sourceEntityTypeId, target: r.targetEntityTypeId,
        type: 'rel', label: r.name,
        data: { isDerived: false },
        style: { stroke: '#0BB68F', strokeWidth: 2 },
      })),
      ...derivedEdges.map(d => ({
        id: `derived-${d.id}`, source: d.sourceLogicalId, target: d.targetLogicalId,
        type: 'rel', label: d.relationshipName,
        data: { isDerived: true },
        style: { stroke: '#137CBD', strokeWidth: 1.5, strokeDasharray: '4 3' },
      })),
    ];

    return res.json({ nodes, edges });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── GET /api/ontology/entity-types/:id/instances — live data preview ──────────
app.get('/api/ontology/entity-types/:id/instances', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const skip = (page - 1) * limit;

    // 1. Check Redis Cache First
    const cacheKey = `ontology:instances:${req.params.id}:p${page}:l${limit}`;
    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    // 2. Cache Miss -> Query Postgres
    const [total, instances] = await Promise.all([
      prisma.currentEntityState.count({ where: { entityTypeId: req.params.id } }),
      prisma.currentEntityState.findMany({
        where: { entityTypeId: req.params.id },
        skip, take: limit, orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const result = { total, page, limit, data: instances };

    // 3. Set Redis Cache (Expiring in 60 seconds to prevent total staleness)
    if (redisClient && instances.length > 0) {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(result));
    }

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── GET /api/ontology/rules — list OntologyRules ─────────────────────────────
app.get('/api/ontology/rules', async (req, res) => {
  try {
    const projectId = getProjectId(req);
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });

    const rules = await prisma.ontologyRule.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(rules);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── POST /api/ontology/rules — create an OntologyRule ────────────────────────
app.post('/api/ontology/rules', async (req, res) => {
  try {
    const projectId = getProjectId(req);
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });

    const { name, description, antecedent, consequent } = req.body;
    if (!name || !antecedent || !consequent) {
      return res.status(400).json({ error: 'name, antecedent[], consequent{} required' });
    }

    const rule = await prisma.ontologyRule.create({
      data: { projectId, name, description, antecedent, consequent },
    });
    return res.status(201).json(rule);
  } catch (err: any) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── DELETE /api/ontology/rules/:id ───────────────────────────────────────────
app.delete('/api/ontology/rules/:id', async (req, res) => {
  try {
    await prisma.ontologyRule.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── POST /api/ontology/reason — trigger the semantic reasoner ─────────────────
app.post('/api/ontology/reason', async (req, res) => {
  try {
    const projectId = getProjectId(req);
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });

    const result = await runFullReasoner(projectId, prisma);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ─── End No-Code Ontology Builder API ────────────────────────────────────────

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
  } catch (error) {
    return res.status(500).json({ error: 'failed to fetch entity type', details: String(error) });
  }
});

// ── Relationship API ───────────────────────────────────────────────

app.post('/entity-types/:id/outgoing-relationships', async (req, res) => {
  const sourceEntityTypeId = req.params.id;
  const { name, targetEntityTypeId } = req.body as { name: string; targetEntityTypeId: string };

  if (!name || !targetEntityTypeId) {
    return res.status(400).json({ error: 'name and targetEntityTypeId are required' });
  }

  try {
    const created = await prisma.relationshipDefinition.create({
      data: {
        name,
        sourceEntityTypeId,
        targetEntityTypeId,
      },
    });
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ error: 'failed to create relationship definition', details: String(error) });
  }
});

app.get('/entity-types/:id/outgoing-relationships', async (req, res) => {
  try {
    const relationships = await prisma.relationshipDefinition.findMany({
      where: { sourceEntityTypeId: req.params.id },
      include: {
        targetEntityType: {
          select: { name: true }
        }
      }
    });
    // Format response to include target entity name directly alongside ID
    const formatted = relationships.map(rel => ({
      id: rel.id,
      name: rel.name,
      createdAt: rel.createdAt,
      sourceEntityTypeId: rel.sourceEntityTypeId,
      targetEntityTypeId: rel.targetEntityTypeId,
      targetEntityName: rel.targetEntityType.name
    }));
    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ error: 'failed to fetch relationship definitions', details: String(error) });
  }
});

app.put('/entity-types/:id', async (req, res) => {
  const { attributes } = req.body as { attributes: AttributeInput[] };
  if (!Array.isArray(attributes)) {
    return res.status(400).json({ error: 'attributes[] are required for version update' });
  }

  try {
    const existing = await prisma.entityType.findUnique({
      where: { id: req.params.id },
      include: { attributes: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'entity type not found' });
    }

    // Data Contract Enforcement: Check lineage graph for downstream dependencies
    const impacts = await lineageSvc.simulateBreakingChange('EntityType', existing.id);
    if (!impacts.allow) {
      const oldAttrNames = existing.attributes.map((a) => a.name);
      const newAttrNames = attributes.map((a) => a.name);
      const removed = oldAttrNames.filter((n) => !newAttrNames.includes(n));

      if (removed.length > 0) {
        return res.status(409).json({
          error: 'Contract Violation: Downstream models/rules rely on this EntityType schema. Removing attributes is a breaking change.',
          removedAttributes: removed,
          impactedConsumers: impacts.impactedConsumers,
        });
      }
    }

    const highestVersion = await prisma.entityType.findFirst({
      where: { name: existing.name },
      orderBy: { version: 'desc' },
    });

    const newVersion = (highestVersion?.version ?? existing.version) + 1;

    let projectId = req.auth?.projectId || req.body.projectId || req.header('X-Project-Id');
    if (!projectId && process.env.NODE_ENV !== 'production') projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(400).json({ error: 'Project ID is required for version update' });

    // Insert-only versioning: create a new EntityType row + new AttributeDefinition rows.
    const createdVersion = await prisma.entityType.create({
      data: {
        projectId,
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
  } catch (error) {
    return res.status(500).json({
      error: 'failed to create next entity type version',
      details: String(error),
    });
  }
});

// ── Entity Instances ─────────────────────────────────────────────

app.get('/api/v1/ontology/instances/current', async (req, res) => {
  try {
    let projectId = req.auth?.projectId || (req.query.projectId as string) || req.header('X-Project-Id');
    if (!projectId && process.env.NODE_ENV !== 'production') projectId = (global as any).DEFAULT_PROJECT_ID;

    // In strict enterprise platforms, omitting context might be an error instead of wildcard search,
    // but some UIs rely on wildcard across permitted tenants. We will enforce single tenant here for safety.
    if (!projectId && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ error: 'Project ID context required for instance queries' });
    }

    const whereClause: any = {};
    if (projectId) {
      whereClause.entityType = {
        projectId: String(projectId)
      };
    }
    const instances = await prisma.currentEntityState.findMany({
      where: whereClause,
      include: {
        entityType: {
          select: { name: true }
        }
      }
    });
    return res.json(instances);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/entity-types/:id/instances', async (req, res) => {
  try {
    const entityType = await prisma.entityType.findUnique({
      where: { id: req.params.id },
      include: { attributes: true },
    });

    if (!entityType) {
      return res.status(404).json({ error: 'entity type not found' });
    }

    const body = req.body as Record<string, unknown>;
    const logicalId = body.logicalId as string | undefined;

    if (!logicalId) {
      return res.status(400).json({ error: 'logicalId is required' });
    }

    // Validate required attributes are present
    for (const attr of entityType.attributes) {
      if (attr.required && !(attr.name in body)) {
        return res.status(400).json({
          error: `Missing required attribute: '${attr.name}'`,
        });
      }
    }

    // Only allow attributes defined on the entity type (plus meta fields)
    const metaFields = new Set(['logicalId', 'validFrom', 'validTo']);
    const allowedNames = new Set(entityType.attributes.map((a) => a.name));
    for (const key of Object.keys(body)) {
      if (!metaFields.has(key) && !allowedNames.has(key)) {
        return res.status(400).json({
          error: `Unknown attribute: '${key}'. Allowed: ${[...allowedNames].join(', ')}`,
        });
      }
    }

    // Build the attribute-only data payload (exclude meta fields)
    const attrData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!metaFields.has(key)) {
        attrData[key] = value;
      }
    }

    const now = new Date();

    // Temporal close/open + event emission — all in one atomic transaction
    const { instance, previousState, eventId } = await prisma.$transaction(async (tx) => {
      // Fetch the currently-active row to capture previousState
      const current = await tx.entityInstance.findFirst({
        where: {
          entityTypeId: entityType.id,
          logicalId,
          validTo: null,
        },
      });

      // Close the currently-active row (if any)
      if (current) {
        await tx.entityInstance.update({
          where: { id: current.id },
          data: { validTo: now },
        });
      }

      // Insert new active row
      const newInstance = await tx.entityInstance.create({
        data: {
          logicalId,
          entityTypeId: entityType.id,
          entityVersion: entityType.version,
          data: attrData as Prisma.InputJsonValue,
          validFrom: now,
          validTo: null,
        },
      });

      // Emit domain event (append-only, immutable) with idempotency key
      const idempotencyKey = `EntityStateChanged:${logicalId}:${now.toISOString()}`;
      const domainEvent = await tx.domainEvent.create({
        data: {
          idempotencyKey,
          eventType: 'EntityStateChanged',
          entityTypeId: entityType.id,
          logicalId,
          entityVersion: entityType.version,
          payload: {
            previousState: current?.data ?? null,
            newState: attrData,
            validFrom: now.toISOString(),
          } as unknown as Prisma.InputJsonValue,
        },
      });

      // CQRS: Upsert read model projection
      await tx.currentEntityState.upsert({
        where: { logicalId },
        create: {
          logicalId,
          entityTypeId: entityType.id,
          data: attrData as Prisma.InputJsonValue,
          updatedAt: now,
        },
        update: {
          data: attrData as Prisma.InputJsonValue,
          updatedAt: now,
        },
      });

      return {
        instance: newInstance,
        previousState: (current?.data as Record<string, unknown>) ?? null,
        eventId: domainEvent.id,
      };
    });

    // Fire-and-forget: evaluate policies after transaction commits
    evaluatePolicies(
      {
        eventId,
        eventType: 'EntityStateChanged',
        entityTypeId: entityType.id,
        logicalId,
        entityVersion: entityType.version,
        payload: {
          previousState,
          newState: attrData,
          validFrom: now.toISOString(),
        },
      },
      prisma,
    );

    return res.status(201).json(instance);
  } catch (error) {
    return res.status(500).json({
      error: 'failed to create entity instance',
      details: String(error),
    });
  }
});

// ── Bulk Entity Ingestion ────────────────────────────────────────

app.post('/entity-types/:id/instances/bulk', async (req, res) => {
  try {
    const entityType = await prisma.entityType.findUnique({
      where: { id: req.params.id },
      include: { attributes: true },
    });

    if (!entityType) {
      return res.status(404).json({ error: 'entity type not found' });
    }

    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'body must be an array of instances' });
    }

    const items = req.body as Array<Record<string, unknown>>;
    const now = new Date();
    const metaFields = new Set(['logicalId', 'validFrom', 'validTo']);
    const allowedNames = new Set(entityType.attributes.map((a) => a.name));

    // 1. Validation phase
    for (const item of items) {
      const logicalId = item.logicalId as string | undefined;
      if (!logicalId) return res.status(400).json({ error: 'logicalId is required for all items' });

      for (const attr of entityType.attributes) {
        if (attr.required && !(attr.name in item)) {
          return res.status(400).json({ error: `Missing required attribute: '${attr.name}' in item ${logicalId}` });
        }
      }

      for (const key of Object.keys(item)) {
        if (!metaFields.has(key) && !allowedNames.has(key)) {
          return res.status(400).json({ error: `Unknown attribute: '${key}' in item ${logicalId}. Allowed: ${[...allowedNames].join(', ')}` });
        }
      }
    }

    // 2. Execution phase (in transaction)
    const results = await prisma.$transaction(async (tx) => {
      const createdInstances = [];

      for (const item of items) {
        const logicalId = item.logicalId as string;

        // Extract attributes
        const attrData: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(item)) {
          if (!metaFields.has(key)) attrData[key] = value;
        }

        // Close currently-active row if exists
        const current = await tx.entityInstance.findFirst({
          where: { entityTypeId: entityType.id, logicalId, validTo: null },
        });

        if (current) {
          await tx.entityInstance.update({
            where: { id: current.id },
            data: { validTo: now },
          });
        }

        const newInstance = await tx.entityInstance.create({
          data: {
            logicalId,
            entityTypeId: entityType.id,
            entityVersion: entityType.version,
            data: attrData as Prisma.InputJsonValue,
            validFrom: now,
            validTo: null,
          },
        });
        createdInstances.push(newInstance);

        const idempotencyKey = `EntityBulkStateChanged:${logicalId}:${now.toISOString()}`;
        await tx.domainEvent.create({
          data: {
            idempotencyKey,
            eventType: 'EntityStateChanged',
            entityTypeId: entityType.id,
            logicalId,
            entityVersion: entityType.version,
            payload: {
              previousState: current?.data ?? null,
              newState: attrData,
              validFrom: now.toISOString(),
            } as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.currentEntityState.upsert({
          where: { logicalId },
          create: {
            logicalId,
            entityTypeId: entityType.id,
            data: attrData as Prisma.InputJsonValue,
            updatedAt: now,
          },
          update: {
            data: attrData as Prisma.InputJsonValue,
            updatedAt: now,
          },
        });
      }

      return { createdInstances };
    });

    return res.status(201).json({ success: true, count: results.createdInstances.length });
  } catch (error) {
    return res.status(500).json({ error: 'failed to execute bulk ingestion', details: String(error) });
  }
});

app.get('/api/v1/ontology/instances/:id/provenance', async (req, res) => {
  try {
    const provenance = await prisma.provenanceRecord.findMany({
      where: { entityInstanceId: req.params.id },
      orderBy: { ingestedAt: 'desc' }
    });
    return res.json(provenance);
  } catch (error) {
    return res.status(500).json({ error: 'failed to fetch provenance', details: String(error) });
  }
});

app.get('/entity-types/:id/instances', async (req, res) => {
  try {
    const entityType = await prisma.entityType.findUnique({
      where: { id: req.params.id },
    });

    if (!entityType) {
      return res.status(404).json({ error: 'entity type not found' });
    }

    const instances = await prisma.entityInstance.findMany({
      where: { entityTypeId: req.params.id },
      orderBy: { transactionTime: 'desc' },
    });

    return res.json(instances);
  } catch (error) {
    return res.status(500).json({
      error: 'failed to list entity instances',
      details: String(error),
    });
  }
});

// Timeline of a single logical entity (bi-temporal)
// Query params:
//   ?validAsOf=ISO     → "What was true at this valid-time?"
//   ?transactionAsOf=ISO → "What did the system know at this transaction-time?"
app.get('/entity-types/:id/instances/:logicalId/history', async (req, res) => {
  try {
    const { validAsOf, transactionAsOf } = req.query;

    // Base filter: scope to this entity type + logical entity
    const where: Record<string, any> = {
      entityTypeId: req.params.id,
      logicalId: req.params.logicalId,
    };

    // Valid-time filter: validFrom <= validAsOf AND (validTo IS NULL OR validTo > validAsOf)
    if (validAsOf) {
      const vt = new Date(validAsOf as string);
      where.validFrom = { lte: vt };
      where.OR = [
        { validTo: null },
        { validTo: { gt: vt } },
      ];
    }

    // Transaction-time filter: transactionTime <= transactionAsOf
    if (transactionAsOf) {
      const tt = new Date(transactionAsOf as string);
      where.transactionTime = { lte: tt };
    }

    const instances = await prisma.entityInstance.findMany({
      where,
      orderBy: { validFrom: 'desc' },
    });

    if (instances.length === 0) {
      return res.status(404).json({ error: 'no instances found for this logicalId' });
    }

    return res.json(instances);
  } catch (error) {
    return res.status(500).json({
      error: 'failed to fetch entity history',
      details: String(error),
    });
  }
});

// ── Domain Events ────────────────────────────────────────────────

app.get('/events', async (req, res) => {
  try {
    const { entityTypeId, logicalId, eventType } = req.query;

    const where: Record<string, any> = {};
    if (entityTypeId) where.entityTypeId = entityTypeId;
    if (logicalId) where.logicalId = logicalId;
    if (eventType) where.eventType = eventType;

    const events = await prisma.domainEvent.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
    });

    return res.json(events);
  } catch (error) {
    return res.status(500).json({
      error: 'failed to fetch events',
      details: String(error),
    });
  }
});

// ── Relationship Definitions ─────────────────────────────────────

app.post('/relationship-definitions', async (req, res) => {
  try {
    const { name, sourceEntityTypeId, targetEntityTypeId } = req.body;

    if (!name || !sourceEntityTypeId || !targetEntityTypeId) {
      return res.status(400).json({ error: 'name, sourceEntityTypeId, and targetEntityTypeId are required' });
    }

    const relDef = await prisma.relationshipDefinition.create({
      data: { name, sourceEntityTypeId, targetEntityTypeId },
      include: { sourceEntityType: true, targetEntityType: true },
    });

    return res.status(201).json(relDef);
  } catch (error) {
    return res.status(500).json({ error: 'failed to create relationship definition', details: String(error) });
  }
});

app.get('/relationship-definitions', async (_req, res) => {
  try {
    const defs = await prisma.relationshipDefinition.findMany({
      include: { sourceEntityType: true, targetEntityType: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(defs);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list relationship definitions', details: String(error) });
  }
});

// ── Relationship Instances ───────────────────────────────────────

app.post('/relationships', async (req, res) => {
  try {
    const { relationshipDefinitionId, sourceLogicalId, targetLogicalId, properties } = req.body;

    if (!relationshipDefinitionId || !sourceLogicalId || !targetLogicalId) {
      return res.status(400).json({
        error: 'relationshipDefinitionId, sourceLogicalId, and targetLogicalId are required',
      });
    }

    const relDef = await prisma.relationshipDefinition.findUnique({
      where: { id: relationshipDefinitionId },
    });

    if (!relDef) {
      return res.status(404).json({ error: 'relationship definition not found' });
    }

    const now = new Date();

    // Check if an active relationship already exists for this pair
    const existing = await prisma.relationshipInstance.findFirst({
      where: {
        relationshipDefinitionId,
        sourceLogicalId,
        targetLogicalId,
        validTo: null,
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'An active relationship already exists for this pair' });
    }

    const instance = await prisma.relationshipInstance.create({
      data: {
        relationshipDefinitionId,
        sourceLogicalId,
        targetLogicalId,
        properties: properties ? (properties as Prisma.InputJsonValue) : Prisma.DbNull,
        validFrom: now,
        validTo: null,
      },
      include: { relationshipDef: true },
    });

    // Emit RelationshipCreated event with idempotency key
    const idempotencyKey = `RelationshipCreated:${sourceLogicalId}:${targetLogicalId}:${now.toISOString()}`;
    await prisma.domainEvent.create({
      data: {
        idempotencyKey,
        eventType: 'RelationshipCreated',
        entityTypeId: relDef.sourceEntityTypeId,
        logicalId: sourceLogicalId,
        entityVersion: 0,
        payload: {
          relationship: relDef.name,
          sourceLogicalId,
          targetLogicalId,
          properties: properties ?? null,
          validFrom: now.toISOString(),
        } as unknown as Prisma.InputJsonValue,
      },
    });

    // CQRS: Upsert CurrentGraph projection
    await prisma.currentGraph.create({
      data: {
        relationshipDefinitionId,
        relationshipName: relDef.name,
        sourceLogicalId,
        targetLogicalId,
        properties: properties ? (properties as Prisma.InputJsonValue) : Prisma.DbNull,
      },
    });

    return res.status(201).json(instance);
  } catch (error) {
    return res.status(500).json({ error: 'failed to create relationship', details: String(error) });
  }
});

app.get('/relationships', async (req, res) => {
  try {
    const { sourceLogicalId, targetLogicalId, includeInactive } = req.query;

    const where: Record<string, any> = {};
    if (sourceLogicalId) where.sourceLogicalId = sourceLogicalId;
    if (targetLogicalId) where.targetLogicalId = targetLogicalId;

    // By default, only return active relationships (validTo IS NULL)
    if (includeInactive !== 'true') {
      where.validTo = null;
    }

    const rels = await prisma.relationshipInstance.findMany({
      where,
      include: { relationshipDef: true },
      orderBy: { validFrom: 'desc' },
    });

    return res.json(rels);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list relationships', details: String(error) });
  }
});

// Temporal close (NOT hard delete)
app.delete('/relationships/:id', async (req, res) => {
  try {
    const existing = await prisma.relationshipInstance.findUnique({
      where: { id: req.params.id },
      include: { relationshipDef: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'relationship not found' });
    }

    if (existing.validTo !== null) {
      return res.status(400).json({ error: 'relationship is already closed' });
    }

    const now = new Date();

    // Temporal close: set validTo, never physically delete
    const closed = await prisma.relationshipInstance.update({
      where: { id: req.params.id },
      data: { validTo: now },
      include: { relationshipDef: true },
    });

    // Emit RelationshipClosed event with idempotency key
    const idempotencyKey = `RelationshipClosed:${existing.sourceLogicalId}:${existing.targetLogicalId}:${now.toISOString()}`;
    await prisma.domainEvent.create({
      data: {
        idempotencyKey,
        eventType: 'RelationshipClosed',
        entityTypeId: existing.relationshipDef.sourceEntityTypeId,
        logicalId: existing.sourceLogicalId,
        entityVersion: 0,
        payload: {
          relationship: existing.relationshipDef.name,
          sourceLogicalId: existing.sourceLogicalId,
          targetLogicalId: existing.targetLogicalId,
          validFrom: existing.validFrom.toISOString(),
          validTo: now.toISOString(),
        } as unknown as Prisma.InputJsonValue,
      },
    });

    // CQRS: Remove from CurrentGraph projection
    await prisma.currentGraph.deleteMany({
      where: {
        relationshipDefinitionId: existing.relationshipDefinitionId,
        sourceLogicalId: existing.sourceLogicalId,
        targetLogicalId: existing.targetLogicalId,
      },
    });

    return res.json(closed);
  } catch (error) {
    return res.status(500).json({ error: 'failed to close relationship', details: String(error) });
  }
});

// ── Graph Traversal (time-aware) ─────────────────────────────────

app.get('/graph/:logicalId/neighbors', async (req, res) => {
  try {
    const { logicalId } = req.params;
    const { validAsOf, transactionAsOf } = req.query;

    if (!validAsOf && !transactionAsOf) {
      // 🔥 Fast path: Use CQRS Read Model for current state
      const [outgoing, incoming] = await Promise.all([
        prisma.currentGraph.findMany({ where: { sourceLogicalId: logicalId } }),
        prisma.currentGraph.findMany({ where: { targetLogicalId: logicalId } }),
      ]);

      const neighbors = [
        ...outgoing.map((r) => ({
          direction: 'outgoing' as const,
          relationship: r.relationshipName,
          logicalId: r.targetLogicalId,
          properties: r.properties,
          validFrom: null,
          validTo: null,
          relationshipInstanceId: r.id,
        })),
        ...incoming.map((r) => ({
          direction: 'incoming' as const,
          relationship: r.relationshipName,
          logicalId: r.sourceLogicalId,
          properties: r.properties,
          validFrom: null,
          validTo: null,
          relationshipInstanceId: r.id,
        })),
      ];

      return res.json({ logicalId, neighbors, source: 'cqrs_read_model' });
    }

    // 🕰️ Slow path: Time-aware traversal via Temporal Tables
    const temporalFilter: Record<string, any> = {};

    if (validAsOf) {
      const vt = new Date(validAsOf as string);
      temporalFilter.validFrom = { lte: vt };
      temporalFilter.OR = [
        { validTo: null },
        { validTo: { gt: vt } },
      ];
    } else {
      temporalFilter.validTo = null;
    }

    if (transactionAsOf) {
      const tt = new Date(transactionAsOf as string);
      temporalFilter.transactionTime = { lte: tt };
    }

    const [outgoing, incoming] = await Promise.all([
      prisma.relationshipInstance.findMany({
        where: { sourceLogicalId: logicalId, ...temporalFilter },
        include: { relationshipDef: true },
      }),
      prisma.relationshipInstance.findMany({
        where: { targetLogicalId: logicalId, ...temporalFilter },
        include: { relationshipDef: true },
      }),
    ]);

    const neighbors = [
      ...outgoing.map((r) => ({
        direction: 'outgoing' as const,
        relationship: r.relationshipDef.name,
        logicalId: r.targetLogicalId,
        properties: r.properties,
        validFrom: r.validFrom,
        validTo: r.validTo,
        relationshipInstanceId: r.id,
      })),
      ...incoming.map((r) => ({
        direction: 'incoming' as const,
        relationship: r.relationshipDef.name,
        logicalId: r.sourceLogicalId,
        properties: r.properties,
        validFrom: r.validFrom,
        validTo: r.validTo,
        relationshipInstanceId: r.id,
      })),
    ];

    return res.json({ logicalId, neighbors, source: 'temporal_table' });
  } catch (error) {
    return res.status(500).json({ error: 'failed to fetch neighbors', details: String(error) });
  }
});

// ── Policies ─────────────────────────────────────────────────────

app.post('/policies', async (req, res) => {
  try {
    const { name, description, entityTypeId, eventType, condition, actionType, actionConfig } = req.body;

    if (!name || !entityTypeId || !condition) {
      return res.status(400).json({ error: 'name, entityTypeId, and condition are required' });
    }

    const policy = await prisma.policyDefinition.create({
      data: {
        name,
        description: description ?? null,
        entityTypeId,
        eventType: eventType ?? 'EntityStateChanged',
        condition: condition as Prisma.InputJsonValue,
        actionType: actionType ?? 'EmitAlert',
        actionConfig: actionConfig ? (actionConfig as Prisma.InputJsonValue) : Prisma.DbNull,
        enabled: true,
      },
    });

    return res.status(201).json(policy);
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2002') {
      return res.status(409).json({ error: 'A policy with this name already exists' });
    }
    return res.status(500).json({ error: 'failed to create policy', details: String(error) });
  }
});

app.get('/policies', async (_req, res) => {
  try {
    const policies = await prisma.policyDefinition.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(policies);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list policies', details: String(error) });
  }
});

app.delete('/policies/:id', async (req, res) => {
  try {
    await prisma.policyDefinition.delete({
      where: { id: req.params.id },
    });
    return res.json({ deleted: true });
  } catch (error) {
    return res.status(500).json({ error: 'failed to delete policy', details: String(error) });
  }
});

// ── Alerts ───────────────────────────────────────────────────────

app.get('/alerts', async (req, res) => {
  try {
    const { logicalId, alertType, acknowledged, entityTypeId } = req.query;

    const where: Record<string, any> = {};
    if (logicalId) where.logicalId = logicalId;
    if (alertType) where.alertType = alertType;
    if (entityTypeId) where.entityTypeId = entityTypeId;
    if (acknowledged !== undefined) where.acknowledged = acknowledged === 'true';

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json(alerts);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list alerts', details: String(error) });
  }
});

app.put('/alerts/:id/acknowledge', async (req, res) => {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { acknowledged: true },
    });
    return res.json(alert);
  } catch (error) {
    return res.status(500).json({ error: 'failed to acknowledge alert', details: String(error) });
  }
});
// ── Time-Series Telemetry ────────────────────────────────────────

const telemetryClients = new Set<{ logicalId: string; res: express.Response }>();

app.get('/telemetry/:logicalId/stream', (req, res) => {
  const { logicalId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Establish the SSE connection immediately

  const client = { logicalId, res };
  telemetryClients.add(client);

  req.on('close', () => {
    telemetryClients.delete(client);
  });
});

app.post('/telemetry', async (req, res) => {
  try {
    const { logicalId, metrics } = req.body;

    if (!logicalId || !Array.isArray(metrics)) {
      return res.status(400).json({ error: 'logicalId and metrics array are required' });
    }

    const mappedMetrics = metrics.map((m: { metric: string, value: string | number, timestamp?: string | Date }) => ({
      logicalId,
      metric: m.metric,
      value: Number(m.value),
      timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
    }));

    // Fast append-only batch insert
    const created = await prisma.timeseriesMetric.createMany({
      data: mappedMetrics,
    });

    // Broadcast to SSE clients listening for this logicalId
    const payload = JSON.stringify({ logicalId, metrics: mappedMetrics });
    for (const client of telemetryClients) {
      if (client.logicalId === logicalId) {
        client.res.write(`data: ${payload}\n\n`);
      }
    }

    return res.status(201).json({ inserted: created.count });
  } catch (error) {
    return res.status(500).json({ error: 'failed to ingest telemetry', details: String(error) });
  }
});

app.get('/telemetry/:logicalId', async (req, res) => {
  try {
    const { logicalId } = req.params;
    const { metric, from, to, aggregate } = req.query;

    const where: Record<string, any> = { logicalId };

    if (metric) {
      where.metric = metric;
    }

    if (from || to) {
      where['timestamp'] = {};
      if (from) where['timestamp'].gte = new Date(from as string);
      if (to) where['timestamp'].lte = new Date(to as string);
    }

    // If an aggregation is requested (e.g., avg, max, min, sum, count)
    if (aggregate && typeof aggregate === 'string') {
      if (!metric) {
        return res.status(400).json({ error: 'aggregate requires a specific metric to filter on' });
      }

      const aggMap: Record<string, keyof Prisma.TimeseriesMetricAvgAggregateInputType> = {
        avg: 'value',
        min: 'value',
        max: 'value',
        sum: 'value',
      };

      if (aggregate === 'count') {
        const count = await prisma.timeseriesMetric.count({ where });
        return res.json({ logicalId, metric, aggregate: 'count', value: count });
      }

      if (!(aggregate in aggMap)) {
        return res.status(400).json({ error: `unsupported aggregation: ${aggregate}` });
      }

      const aggQuery: Record<string, unknown> = {};
      aggQuery[`_${aggregate}`] = { value: true };

      const result = await prisma.timeseriesMetric.aggregate({
        where,
        ...aggQuery,
      });

      // Extract the aggregated value
      const aggRecord = result as any;
      const aggResult = aggRecord[`_${aggregate}`]?.value ?? null;

      return res.json({
        logicalId,
        metric,
        aggregate,
        value: aggResult,
      });
    }

    // Default: return raw points (limit to 1000 for safety)
    const points = await prisma.timeseriesMetric.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 1000,
    });

    return res.json(points);
  } catch (error) {
    return res.status(500).json({ error: 'failed to query telemetry', details: String(error) });
  }
});

// ── Data Sources ─────────────────────────────────────────────────

app.post('/data-sources', async (req, res) => {
  try {
    const { name, type, connectionConfig } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'name and type are required' });
    }

    const validTypes = ['REST_API', 'JSON_UPLOAD', 'CSV_UPLOAD'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
    }

    const source = await prisma.dataSource.create({
      data: {
        projectId: req.body.projectId || req.header('X-Project-Id') || (global as any).DEFAULT_PROJECT_ID,
        name,
        type,
        connectionConfig: connectionConfig ?? ({} as Prisma.InputJsonValue),
      },
    });

    return res.status(201).json(source);
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2002') {
      return res.status(409).json({ error: 'A data source with this name already exists' });
    }
    return res.status(500).json({ error: 'failed to create data source', details: String(error) });
  }
});

app.get('/data-sources', async (_req, res) => {
  try {
    const sources = await prisma.dataSource.findMany({
      orderBy: { createdAt: 'desc' },
      include: { integrationJobs: { select: { id: true, name: true } } },
    });
    return res.json(sources);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list data sources', details: String(error) });
  }
});

app.get('/data-sources/:id', async (req, res) => {
  try {
    const source = await prisma.dataSource.findUnique({
      where: { id: req.params.id },
      include: { integrationJobs: true },
    });

    if (!source) {
      return res.status(404).json({ error: 'data source not found' });
    }

    return res.json(source);
  } catch (error) {
    return res.status(500).json({ error: 'failed to fetch data source', details: String(error) });
  }
});

app.put('/data-sources/:id', async (req, res) => {
  try {
    const { name, type, connectionConfig, enabled } = req.body;

    const source = await prisma.dataSource.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(connectionConfig !== undefined && { connectionConfig: connectionConfig as Prisma.InputJsonValue }),
        ...(enabled !== undefined && { enabled }),
      },
    });

    return res.json(source);
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2025') {
      return res.status(404).json({ error: 'data source not found' });
    }
    return res.status(500).json({ error: 'failed to update data source', details: String(error) });
  }
});

app.delete('/data-sources/:id', async (req, res) => {
  try {
    await prisma.dataSource.delete({ where: { id: req.params.id } });
    return res.json({ deleted: true });
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2025') {
      return res.status(404).json({ error: 'data source not found' });
    }
    if ((error as any)?.code === 'P2003') {
      return res.status(409).json({ error: 'Cannot delete: data source has integration jobs. Delete those first.' });
    }
    return res.status(500).json({ error: 'failed to delete data source', details: String(error) });
  }
});

// ── Integration Jobs ─────────────────────────────────────────────

app.post('/integration-jobs', async (req, res) => {
  try {
    const { name, dataSourceId, targetEntityTypeId, fieldMapping, logicalIdField, schedule } = req.body;

    if (!name || !dataSourceId || !targetEntityTypeId || !fieldMapping || !logicalIdField) {
      return res.status(400).json({
        error: 'name, dataSourceId, targetEntityTypeId, fieldMapping, and logicalIdField are required',
      });
    }

    // Validate references exist
    const [source, entityType] = await Promise.all([
      prisma.dataSource.findUnique({ where: { id: dataSourceId } }),
      prisma.entityType.findUnique({ where: { id: targetEntityTypeId } }),
    ]);

    if (!source) return res.status(404).json({ error: 'data source not found' });
    if (!entityType) return res.status(404).json({ error: 'target entity type not found' });

    const job = await prisma.integrationJob.create({
      data: {
        projectId: req.body.projectId || req.header('X-Project-Id') || (global as any).DEFAULT_PROJECT_ID,
        name,
        dataSourceId,
        targetEntityTypeId,
        fieldMapping: fieldMapping as Prisma.InputJsonValue,
        logicalIdField,
        schedule: schedule ?? null,
      },
      include: { dataSource: true, targetEntityType: true },
    });

    await lineageSvc.registerEdge({
      sourceType: 'DataSource',
      sourceId: dataSourceId,
      targetType: 'EntityType',
      targetId: targetEntityTypeId,
      transformation: `IntegrationJob:${job.id}`,
    });

    return res.status(201).json(job);
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2002') {
      return res.status(409).json({ error: 'An integration job with this name already exists' });
    }
    return res.status(500).json({ error: 'failed to create integration job', details: String(error) });
  }
});

app.get('/integration-jobs', async (_req, res) => {
  try {
    const jobs = await prisma.integrationJob.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        dataSource: { select: { id: true, name: true, type: true } },
        targetEntityType: { select: { id: true, name: true, version: true } },
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 1,
          select: { id: true, status: true, recordsProcessed: true, startedAt: true },
        },
      },
    });
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list integration jobs', details: String(error) });
  }
});

app.get('/integration-jobs/:id', async (req, res) => {
  try {
    const job = await prisma.integrationJob.findUnique({
      where: { id: req.params.id },
      include: {
        dataSource: true,
        targetEntityType: { include: { attributes: true } },
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'integration job not found' });
    }

    return res.json(job);
  } catch (error) {
    return res.status(500).json({ error: 'failed to fetch integration job', details: String(error) });
  }
});

app.put('/integration-jobs/:id', async (req, res) => {
  try {
    const { name, fieldMapping, logicalIdField, schedule, enabled } = req.body;

    const job = await prisma.integrationJob.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(fieldMapping !== undefined && { fieldMapping: fieldMapping as Prisma.InputJsonValue }),
        ...(logicalIdField !== undefined && { logicalIdField }),
        ...(schedule !== undefined && { schedule }),
        ...(enabled !== undefined && { enabled }),
      },
      include: { dataSource: true, targetEntityType: true },
    });

    return res.json(job);
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2025') {
      return res.status(404).json({ error: 'integration job not found' });
    }
    return res.status(500).json({ error: 'failed to update integration job', details: String(error) });
  }
});

app.delete('/integration-jobs/:id', async (req, res) => {
  try {
    await prisma.integrationJob.delete({ where: { id: req.params.id } });
    return res.json({ deleted: true });
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2025') {
      return res.status(404).json({ error: 'integration job not found' });
    }
    return res.status(500).json({ error: 'failed to delete integration job', details: String(error) });
  }
});

// ── Job Execution ────────────────────────────────────────────────

app.post('/integration-jobs/:id/execute', async (req, res) => {
  try {
    const { data } = req.body ?? {};

    const result = await executeJob(req.params.id, prisma, undefined, data);
    const statusCode = result.status === 'COMPLETED' ? 200 : 500;

    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'failed to execute job', details: String(error) });
  }
});

app.post('/integration-jobs/:id/dry-run', async (req, res) => {
  try {
    const { data } = req.body ?? {};
    const result = await dryRunJob(req.params.id, prisma, data);
    const statusCode = result.status === 'SUCCESS' ? 200 : 500;
    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'failed to dry-run job', details: String(error) });
  }
});

// ── Data Lineage & Provenance ────────────────────────────────────────

app.get('/api/v1/lineage/:type/:id/trace', async (req, res) => {
  try {
    const { type, id } = req.params;
    const trace = await lineageSvc.getFullUpstreamTrace(type, id);
    return res.json(trace);
  } catch (error) {
    return res.status(500).json({ error: 'failed to fetch lineage trace', details: String(error) });
  }
});

app.get('/integration-jobs/:id/executions', async (req, res) => {
  try {
    const job = await prisma.integrationJob.findUnique({ where: { id: req.params.id } });
    if (!job) {
      return res.status(404).json({ error: 'integration job not found' });
    }

    const executions = await prisma.jobQueue.findMany({
      where: { integrationJobId: req.params.id },
      orderBy: { startedAt: 'desc' },
    });

    return res.json(executions);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list executions', details: String(error) });
  }
});

// ── Orchestration & Job Queue ──────────────────────────────────────

app.get('/api/v1/orchestration/jobs', async (req, res) => {
  try {
    const jobs = await prisma.jobQueue.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list orchestration jobs', details: String(error) });
  }
});

app.post('/api/v1/orchestration/jobs/:id/replay', async (req, res) => {
  try {
    const job = await prisma.jobQueue.findUnique({ where: { id: req.params.id } });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'FAILED' && job.status !== 'DEAD_LETTER') {
      return res.status(400).json({ error: 'Job is not in a replayable state' });
    }

    const replayedJob = await prisma.jobQueue.update({
      where: { id: job.id },
      data: {
        status: 'QUEUED',
        attempts: 0,
        nextAttemptAt: new Date(),
        lastError: null,
      }
    });

    return res.json(replayedJob);
  } catch (error) {
    return res.status(500).json({ error: 'failed to replay job', details: String(error) });
  }
});

// ── Computed Metrics ───────────────────────────────────────────────

app.post('/computed-metrics', async (req, res) => {
  try {
    const { name, entityTypeId, expression, unit } = req.body;

    if (!name || !entityTypeId || !expression) {
      return res.status(400).json({ error: 'name, entityTypeId, and expression are required' });
    }

    // Verify entity type exists
    const entityType = await prisma.entityType.findUnique({ where: { id: entityTypeId } });
    if (!entityType) {
      return res.status(404).json({ error: 'entity type not found' });
    }

    const metric = await prisma.computedMetricDefinition.create({
      data: {
        name,
        entityTypeId,
        expression,
        unit: unit ?? null,
      },
    });

    return res.status(201).json(metric);
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2002') {
      return res.status(409).json({ error: 'A computed metric with this name already exists for this entity type' });
    }
    return res.status(500).json({ error: 'failed to create computed metric', details: String(error) });
  }
});

app.get('/computed-metrics', async (req, res) => {
  try {
    const { entityTypeId } = req.query;
    const where: Record<string, any> = {};
    if (entityTypeId) where.entityTypeId = entityTypeId;

    const metrics = await prisma.computedMetricDefinition.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { entityType: { select: { id: true, name: true } } },
    });

    return res.json(metrics);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list computed metrics', details: String(error) });
  }
});

app.delete('/computed-metrics/:id', async (req, res) => {
  try {
    await prisma.computedMetricDefinition.delete({ where: { id: req.params.id } });
    return res.json({ deleted: true });
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2025') {
      return res.status(404).json({ error: 'computed metric not found' });
    }
    return res.status(500).json({ error: 'failed to delete computed metric', details: String(error) });
  }
});

app.get('/computed-metrics/:logicalId/evaluate', async (req, res) => {
  try {
    const { logicalId } = req.params;

    // Find the current entity state from the CQRS projection
    const currentState = await prisma.currentEntityState.findUnique({
      where: { logicalId },
    });

    if (!currentState) {
      return res.status(404).json({ error: `No current state found for logicalId '${logicalId}'` });
    }

    const entityData = currentState.data as Record<string, unknown>;
    const results = await evaluateComputedMetrics(currentState.entityTypeId, entityData, prisma);

    return res.json({
      logicalId,
      entityTypeId: currentState.entityTypeId,
      entityData,
      computedMetrics: results,
    });
  } catch (error) {
    return res.status(500).json({ error: 'failed to evaluate computed metrics', details: String(error) });
  }
});

// ── Telemetry Rollups ─────────────────────────────────────────────

app.post('/telemetry/rollup', async (req, res) => {
  try {
    const { logicalId, metric, windowSize, from, to } = req.body;

    // If no specific entity is given, roll up everything recent
    if (!logicalId && !metric) {
      const lookbackMs = 60 * 60 * 1000; // default: 1 hour
      const result = await computeAllRecentRollups(windowSize ?? '5m', lookbackMs, prisma);
      return res.json(result);
    }

    if (!logicalId || !metric || !windowSize) {
      return res.status(400).json({
        error: 'Provide logicalId + metric + windowSize for targeted rollup, or omit all for global rollup',
      });
    }

    const fromDate = from ? new Date(from as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to as string) : new Date();

    const result = await computeRollups(logicalId, metric, windowSize, fromDate, toDate, prisma);
    return res.json({ logicalId, metric, windowSize, ...result });
  } catch (error) {
    return res.status(500).json({ error: 'failed to compute rollups', details: String(error) });
  }
});

app.get('/telemetry/:logicalId/rollups', async (req, res) => {
  try {
    const { logicalId } = req.params;
    const { metric, windowSize, from, to } = req.query;

    const where: Record<string, any> = { logicalId };
    if (metric) where.metric = metric;
    if (windowSize) where.windowSize = windowSize;
    if (from || to) {
      where['windowStart'] = {};
      if (from) where['windowStart'].gte = new Date(from as string);
      if (to) where['windowStart'].lte = new Date(to as string);
    }

    const rollups = await prisma.telemetryRollup.findMany({
      where,
      orderBy: { windowStart: 'desc' },
      take: 500,
    });

    return res.json(rollups);
  } catch (error) {
    return res.status(500).json({ error: 'failed to query rollups', details: String(error) });
  }
});

// ── ML Model Registry ─────────────────────────────────────────────

app.post('/models', async (req, res) => {
  try {
    const { name, entityTypeId, description, inputFields, outputField } = req.body;

    if (!name || !entityTypeId || !inputFields || !outputField) {
      return res.status(400).json({ error: 'name, entityTypeId, inputFields, and outputField are required' });
    }

    const entityType = await prisma.entityType.findUnique({ where: { id: entityTypeId } });
    if (!entityType) return res.status(404).json({ error: 'entity type not found' });

    const model = await prisma.modelDefinition.create({
      data: {
        projectId: req.body.projectId || req.header('X-Project-Id') || (global as any).DEFAULT_PROJECT_ID,
        name,
        entityTypeId,
        description: description ?? null,
        inputFields: inputFields as Prisma.InputJsonValue,
        outputField,
      },
      include: { entityType: { select: { id: true, name: true } } },
    });

    return res.status(201).json(model);
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2002') {
      return res.status(409).json({ error: 'A model with this name already exists' });
    }
    return res.status(500).json({ error: 'failed to create model', details: String(error) });
  }
});

app.get('/models', async (_req, res) => {
  try {
    const models = await prisma.modelDefinition.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        entityType: { select: { id: true, name: true } },
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
          select: { id: true, version: true, status: true, strategy: true },
        },
      },
    });
    return res.json(models);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list models', details: String(error) });
  }
});

app.post('/models/:id/versions', async (req, res) => {
  try {
    const { strategy, hyperparameters } = req.body;

    if (!strategy || !hyperparameters) {
      return res.status(400).json({ error: 'strategy and hyperparameters are required' });
    }

    const validStrategies = ['THRESHOLD', 'ANOMALY_ZSCORE', 'LINEAR_REGRESSION', 'CUSTOM'];
    if (!validStrategies.includes(strategy)) {
      return res.status(400).json({ error: `strategy must be one of: ${validStrategies.join(', ')}` });
    }

    const model = await prisma.modelDefinition.findUnique({ where: { id: req.params.id } });
    if (!model) return res.status(404).json({ error: 'model not found' });

    // Auto-increment version
    const latest = await prisma.modelVersion.findFirst({
      where: { modelDefinitionId: req.params.id },
      orderBy: { version: 'desc' },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    const version = await prisma.modelVersion.create({
      data: {
        modelDefinitionId: req.params.id,
        version: nextVersion,
        strategy,
        hyperparameters: hyperparameters as Prisma.InputJsonValue,
        status: 'DRAFT',
      },
    });

    return res.status(201).json(version);
  } catch (error) {
    return res.status(500).json({ error: 'failed to create model version', details: String(error) });
  }
});

app.get('/models/:id/versions', async (req, res) => {
  try {
    const model = await prisma.modelDefinition.findUnique({ where: { id: req.params.id } });
    if (!model) return res.status(404).json({ error: 'model not found' });

    const versions = await prisma.modelVersion.findMany({
      where: { modelDefinitionId: req.params.id },
      orderBy: { version: 'desc' },
    });
    return res.json(versions);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list versions', details: String(error) });
  }
});

app.put('/model-versions/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['STAGING', 'RETIRED'],
      STAGING: ['PRODUCTION', 'DRAFT', 'RETIRED'],
      PRODUCTION: ['RETIRED'],
      RETIRED: [],
    };

    const version = await prisma.modelVersion.findUnique({ where: { id: req.params.id } });
    if (!version) return res.status(404).json({ error: 'model version not found' });

    const allowed = validTransitions[version.status] ?? [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: `Cannot transition from '${version.status}' to '${status}'. Allowed: ${allowed.join(', ') || 'none'}`,
      });
    }

    // If promoting to PRODUCTION, retire the current production version
    if (status === 'PRODUCTION') {
      await prisma.modelVersion.updateMany({
        where: { modelDefinitionId: version.modelDefinitionId, status: 'PRODUCTION' },
        data: { status: 'RETIRED' },
      });
    }

    const updated = await prisma.modelVersion.update({
      where: { id: req.params.id },
      data: { status },
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'failed to update version status', details: String(error) });
  }
});

app.post('/models/:id/infer/:logicalId', async (req, res) => {
  try {
    const result = await runInferenceByModel(req.params.id, req.params.logicalId, prisma);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'inference failed', details: String(error) });
  }
});

app.get('/inference-results', async (req, res) => {
  try {
    const { logicalId, modelVersionId } = req.query;
    const where: Record<string, any> = {};
    if (logicalId) where.logicalId = logicalId;
    if (modelVersionId) where.modelVersionId = modelVersionId;

    const results = await prisma.inferenceResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        modelVersion: {
          select: { version: true, strategy: true, modelDefinition: { select: { name: true } } },
        },
      },
    });

    return res.json(results);
  } catch (error) {
    return res.status(500).json({ error: 'failed to query inference results', details: String(error) });
  }
});

app.post('/models/batch-infer', async (req, res) => {
  try {
    const { logicalId } = req.body;

    if (!logicalId) {
      return res.status(400).json({ error: 'logicalId is required' });
    }

    const results = await runAllModelsForEntity(logicalId, prisma);
    return res.json({ logicalId, results });
  } catch (error) {
    return res.status(500).json({ error: 'batch inference failed', details: String(error) });
  }
});

// ── Decision & Execution Engine ─────────────────────────────────────

app.post('/decision-rules', async (req, res) => {
  try {
    const { name, entityTypeId, conditions, logicOperator, priority, autoExecute, confidenceThreshold } = req.body;
    if (!name || !entityTypeId || !conditions) {
      return res.status(400).json({ error: 'name, entityTypeId, and conditions are required' });
    }
    const rule = await prisma.decisionRule.create({
      data: {
        projectId: req.body.projectId || req.header('X-Project-Id') || (global as any).DEFAULT_PROJECT_ID,
        name,
        entityTypeId,
        conditions: conditions as Prisma.InputJsonValue,
        logicOperator: logicOperator ?? 'AND',
        priority: priority ?? 100,
        autoExecute: autoExecute ?? false,
        confidenceThreshold: confidenceThreshold ?? null,
      },
    });
    return res.status(201).json(rule);
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2002') return res.status(409).json({ error: 'Rule with this name already exists' });
    return res.status(500).json({ error: 'failed to create decision rule', details: String(error) });
  }
});

app.get('/decision-rules', async (_req, res) => {
  try {
    const rules = await prisma.decisionRule.findMany({
      orderBy: { priority: 'asc' },
      include: {
        entityType: { select: { id: true, name: true } },
        executionPlans: {
          orderBy: { stepOrder: 'asc' },
          include: { actionDefinition: { select: { name: true, type: true } } },
        },
      },
    });
    return res.json(rules);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list decision rules', details: String(error) });
  }
});

app.put('/decision-rules/:id', async (req, res) => {
  try {
    const { conditions, logicOperator, priority, autoExecute, confidenceThreshold, enabled } = req.body;
    const rule = await prisma.decisionRule.update({
      where: { id: req.params.id },
      data: {
        ...(conditions && { conditions: conditions as Prisma.InputJsonValue }),
        ...(logicOperator && { logicOperator }),
        ...(priority !== undefined && { priority }),
        ...(autoExecute !== undefined && { autoExecute }),
        ...(confidenceThreshold !== undefined && { confidenceThreshold }),
        ...(enabled !== undefined && { enabled }),
      },
    });
    return res.json(rule);
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2025') return res.status(404).json({ error: 'rule not found' });
    return res.status(500).json({ error: 'failed to update rule', details: String(error) });
  }
});

app.delete('/decision-rules/:id', async (req, res) => {
  try {
    await prisma.decisionRule.delete({ where: { id: req.params.id } });
    return res.json({ deleted: true });
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2025') return res.status(404).json({ error: 'rule not found' });
    return res.status(500).json({ error: 'failed to delete rule', details: String(error) });
  }
});

app.post('/action-definitions', async (req, res) => {
  try {
    const { name, type, config } = req.body;
    if (!name || !type || !config) {
      return res.status(400).json({ error: 'name, type, and config are required' });
    }
    const validTypes = ['WEBHOOK', 'UPDATE_ENTITY', 'CREATE_ALERT', 'RUN_INFERENCE', 'LOG_ONLY'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${validTypes.join(', ')}` });
    }
    const action = await prisma.actionDefinition.create({
      data: { name, type, config: config as Prisma.InputJsonValue },
    });
    return res.status(201).json(action);
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2002') return res.status(409).json({ error: 'Action with this name already exists' });
    return res.status(500).json({ error: 'failed to create action', details: String(error) });
  }
});

app.get('/action-definitions', async (_req, res) => {
  try {
    const actions = await prisma.actionDefinition.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(actions);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list actions', details: String(error) });
  }
});

app.post('/execution-plans', async (req, res) => {
  try {
    const { decisionRuleId, actionDefinitionId, stepOrder, continueOnFailure } = req.body;
    if (!decisionRuleId || !actionDefinitionId || stepOrder === undefined) {
      return res.status(400).json({ error: 'decisionRuleId, actionDefinitionId, and stepOrder are required' });
    }
    const plan = await prisma.executionPlan.create({
      data: {
        decisionRuleId,
        actionDefinitionId,
        stepOrder,
        continueOnFailure: continueOnFailure ?? false,
      },
      include: { actionDefinition: { select: { name: true, type: true } } },
    });
    return res.status(201).json(plan);
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2002') return res.status(409).json({ error: 'Step order conflict for this rule' });
    return res.status(500).json({ error: 'failed to create execution plan', details: String(error) });
  }
});

app.post('/decisions/:logicalId/evaluate', async (req, res) => {
  try {
    const { logicalId } = req.params;
    const { ruleId, triggerData } = req.body;

    // Get current entity state as trigger data if not provided
    let data = triggerData as Record<string, unknown> | undefined;
    if (!data) {
      const state = await prisma.currentEntityState.findUnique({ where: { logicalId } });
      if (!state) return res.status(404).json({ error: `Entity "${logicalId}" not found` });
      data = state.data as Record<string, unknown>;
    }

    if (ruleId) {
      const result = await executeDecision(ruleId, logicalId, 'MANUAL', data, prisma);
      return res.json(result);
    } else {
      const result = await evaluateAllRules(logicalId, 'MANUAL', data, prisma);
      return res.json(result);
    }
  } catch (error) {
    return res.status(500).json({ error: 'decision evaluation failed', details: String(error) });
  }
});

app.post('/decisions/:logicalId/simulate', async (req, res) => {
  try {
    const { logicalId } = req.params;
    const { ruleId, triggerData } = req.body;

    let data = triggerData as Record<string, unknown> | undefined;
    if (!data) {
      const state = await prisma.currentEntityState.findUnique({ where: { logicalId } });
      if (!state) return res.status(404).json({ error: `Entity "${logicalId}" not found` });
      data = state.data as Record<string, unknown>;
    }

    if (ruleId) {
      const result = await executeDecision(ruleId, logicalId, 'SIMULATION', data, prisma, true);
      return res.json(result);
    } else {
      const result = await evaluateAllRules(logicalId, 'SIMULATION', data, prisma, true);
      return res.json(result);
    }
  } catch (error) {
    return res.status(500).json({ error: 'simulation failed', details: String(error) });
  }
});

app.get('/decision-logs', async (req, res) => {
  try {
    const { logicalId, decisionRuleId, status } = req.query;
    const where: Record<string, any> = {};
    if (logicalId) where.logicalId = logicalId;
    if (decisionRuleId) where.decisionRuleId = decisionRuleId;
    if (status) where.status = status;

    const logs = await prisma.decisionLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { decisionRule: { select: { name: true } } },
    });
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ error: 'failed to query decision logs', details: String(error) });
  }
});

app.post('/decision-logs/:id/execute', async (req, res) => {
  try {
    const logId = req.params.id;
    const log = await prisma.decisionLog.findUnique({
      where: { id: logId },
      include: {
        decisionRule: {
          include: {
            executionPlans: {
              orderBy: { stepOrder: 'asc' },
              include: { actionDefinition: true }
            }
          }
        }
      }
    });

    if (!log) return res.status(404).json({ error: 'decision log not found' });
    if (log.status !== 'PENDING') return res.status(400).json({ error: `Cannot execute log with status ${log.status}` });

    // 1. Create the ExecutionTrace
    const trace = await prisma.executionTrace.create({
      data: { decisionLogId: logId, status: 'RUNNING' }
    });

    // 2. Mark DecisionLog as RUNNING
    await prisma.decisionLog.update({
      where: { id: logId },
      data: { status: 'RUNNING' }
    });

    // We will run this async to not block the request, returning the trace ID immediately.
    // In a real C3/Palantir system, this goes into the JobQueue or a Temporal/Cadence workflow.
    (async () => {
      let hasFailures = false;
      const plans = log.decisionRule.executionPlans;

      for (const plan of plans) {
        const actionDef = plan.actionDefinition;

        // Create the Step Record
        const step = await prisma.executionStep.create({
          data: {
            executionTraceId: trace.id,
            actionDefinitionId: actionDef.id,
            stepOrder: plan.stepOrder,
            status: 'RUNNING',
            startedAt: new Date(),
            inputPayload: {
              logicalId: log.logicalId,
              triggerData: log.triggerData,
              actionConfig: actionDef.config
            }
          }
        });

        try {
          // --- REAL EXECUTION LOGIC GOES HERE ---
          // Based on actionDef.type (WEBHOOK, UPDATE_ENTITY, etc.)
          let output: any = { message: 'Execution mocked successfully internally' };

          if (actionDef.type === 'WEBHOOK') {
            // Example: axios.post((actionDef.config as any).url, step.inputPayload)
            output = { httpStatus: 200, externalRef: 'web-123' };
          }

          // Simulate network latency & execution
          await new Promise(resolve => setTimeout(resolve, 500));

          await prisma.executionStep.update({
            where: { id: step.id },
            data: {
              status: 'SUCCESS',
              completedAt: new Date(),
              outputPayload: output
            }
          });

        } catch (err: any) {
          hasFailures = true;
          await prisma.executionStep.update({
            where: { id: step.id },
            data: {
              status: 'FAILED',
              completedAt: new Date(),
              errorMessage: err.message ?? String(err)
            }
          });

          if (!plan.continueOnFailure) {
            break; // Stop the DAG
          }
        }
      }

      // Conclude Trace
      const finalStatus = hasFailures ? 'PARTIAL_FAILURE' : 'COMPLETED';
      await prisma.executionTrace.update({
        where: { id: trace.id },
        data: {
          status: finalStatus,
          completedAt: new Date()
        }
      });
      await prisma.decisionLog.update({
        where: { id: logId },
        data: { status: finalStatus === 'COMPLETED' ? 'COMPLETED' : 'FAILED' }
      });
    })().catch(err => {
      console.error('Fatal DAG Orchestrator Error:', err);
      prisma.executionTrace.update({
        where: { id: trace.id },
        data: { status: 'FAILED', error: String(err), completedAt: new Date() }
      }).catch(console.error);
    });

    return res.json({ success: true, traceId: trace.id, status: 'RUNNING' });
  } catch (error) {
    return res.status(500).json({ error: 'failed to start execution DAG', details: String(error) });
  }
});

// ── Recent Domain Events (Dashboard Feed) ────────────────────────

app.get('/api/v1/events/recent', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const events = await prisma.domainEvent.findMany({
      orderBy: { occurredAt: 'desc' },
      take: limit,
    });
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── Attribute-Equality Relationship Derivation ────────────────────

// Derive edges between entities that share the same field value
// e.g. all Aircraft that have the same "airportCode" → "OPERATES_FROM" edges
app.post('/api/v1/ontology/derive-relationships/attribute-match', async (req, res) => {
  try {
    const { sourceEntityTypeId, targetEntityTypeId, relationshipDefId, matchField } = req.body;
    if (!sourceEntityTypeId || !targetEntityTypeId || !relationshipDefId || !matchField) {
      return res.status(400).json({ error: 'sourceEntityTypeId, targetEntityTypeId, relationshipDefId, matchField required' });
    }

    // Fetch current states for source and target
    const sources = await prisma.currentEntityState.findMany({ where: { entityTypeId: sourceEntityTypeId } });
    const targets = await prisma.currentEntityState.findMany({ where: { entityTypeId: targetEntityTypeId } });

    // Build index on target field value → target logicalId
    const targetIndex = new Map<string, string>();
    for (const t of targets) {
      const fieldVal = String((t.data as Record<string, unknown>)[matchField] ?? '');
      if (fieldVal) targetIndex.set(fieldVal, t.logicalId);
    }

    let created = 0;
    const now = new Date();

    for (const source of sources) {
      const fieldVal = String((source.data as Record<string, unknown>)[matchField] ?? '');
      if (!fieldVal) continue;
      const targetLogicalId = targetIndex.get(fieldVal);
      if (!targetLogicalId || targetLogicalId === source.logicalId) continue;

      // Upsert relationship instance
      const existing = await prisma.relationshipInstance.findFirst({
        where: {
          relationshipDefinitionId: relationshipDefId,
          sourceLogicalId: source.logicalId,
          targetLogicalId,
          validTo: null,
        }
      });
      if (!existing) {
        await prisma.relationshipInstance.create({
          data: {
            relationshipDefinitionId: relationshipDefId,
            sourceLogicalId: source.logicalId,
            targetLogicalId,
            validFrom: now,
          }
        });

        // Keep CurrentGraph projection up to date
        await prisma.currentGraph.upsert({
          where: {
            relationshipDefinitionId_sourceLogicalId_targetLogicalId: {
              relationshipDefinitionId: relationshipDefId,
              sourceLogicalId: source.logicalId,
              targetLogicalId,
            }
          },
          create: { relationshipDefinitionId: relationshipDefId, relationshipName: matchField, sourceLogicalId: source.logicalId, targetLogicalId },
          update: {}
        });
        created++;
      }
    }

    return res.json({ success: true, derivedLinksCount: created });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});



// ── Entity Resolution API ──────────────────────────────────────────

// List all PENDING match candidates (with optional entity type filter)
app.get('/api/v1/identity/candidates', async (req, res) => {
  try {
    const projectId = (req.query.projectId as string) || req.header('X-Project-Id') || (global as any).DEFAULT_PROJECT_ID;
    const status = (req.query.status as string) || 'PENDING';
    const entityTypeId = req.query.entityTypeId as string | undefined;

    // Build where clause — filter by project via entityType relation
    const where: any = { status };
    if (entityTypeId) {
      where.entityTypeId = entityTypeId;
    } else if (projectId) {
      where.entityType = { projectId };
    }

    const candidates = await (prisma as any).matchCandidate.findMany({
      where,
      include: { entityType: { select: { name: true } } },
      orderBy: { scoreOverall: 'desc' },
      take: 100,
    });

    // Fetch snapshot data for both entities
    const enriched = await Promise.all(candidates.map(async (c: any) => {
      const [stateA, stateB] = await Promise.all([
        prisma.currentEntityState.findUnique({ where: { logicalId: c.logicalIdA } }),
        prisma.currentEntityState.findUnique({ where: { logicalId: c.logicalIdB } }),
      ]);
      return { ...c, dataA: stateA?.data ?? null, dataB: stateB?.data ?? null };
    }));

    return res.json(enriched);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// Trigger fuzzy match job for an entity type
app.post('/api/v1/identity/run-match', async (req, res) => {
  try {
    const { entityTypeId, threshold } = req.body;
    if (!entityTypeId) return res.status(400).json({ error: 'entityTypeId is required' });

    const count = await IdentityService.runFuzzyMatchJob(entityTypeId, prisma as any, {
      threshold: threshold ?? 0.75,
    });

    return res.json({ success: true, newCandidatesCreated: count });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// Merge two candidates (human review: approve merge)
app.post('/api/v1/identity/candidates/:id/merge', async (req, res) => {
  try {
    const reviewerName = req.auth?.apiKeyName ?? 'system';
    await IdentityService.mergeEntities(req.params.id, reviewerName, prisma as any);

    // Audit log
    await (prisma as any).auditLog.create({
      data: {
        actor: reviewerName,
        actorRole: req.auth?.role ?? 'UNKNOWN',
        action: 'MERGE_CANDIDATE',
        resourceType: 'MatchCandidate',
        resourceId: req.params.id,
        metadata: { correlationId: req.correlationId },
      }
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message ?? String(err) });
  }
});

// Reject a match candidate
app.post('/api/v1/identity/candidates/:id/reject', async (req, res) => {
  try {
    const reviewerName = req.auth?.apiKeyName ?? 'system';
    const candidate = await (prisma as any).matchCandidate.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        reviewedBy: reviewerName,
        reviewedAt: new Date(),
      }
    });

    // Active Learning: Record human decision
    await (prisma as any).matchResolutionHistory.create({
      data: {
        matchCandidateId: candidate.id,
        logicalIdA: candidate.logicalIdA,
        logicalIdB: candidate.logicalIdB,
        entityTypeId: candidate.entityTypeId,
        scoreOverall: candidate.scoreOverall,
        scoreBreakdown: candidate.scoreBreakdown,
        matchReasons: candidate.matchReasons,
        resolution: 'REJECTED',
        resolvedBy: reviewerName,
      }
    });

    await (prisma as any).auditLog.create({
      data: {
        actor: reviewerName,
        actorRole: req.auth?.role ?? 'UNKNOWN',
        action: 'REJECT_CANDIDATE',
        resourceType: 'MatchCandidate',
        resourceId: req.params.id,
        metadata: { correlationId: req.correlationId },
      }
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// Bulk Merge Candidates
app.post('/api/v1/identity/merge-batch', async (req, res) => {
  try {
    const { candidateIds } = req.body;
    if (!Array.isArray(candidateIds)) return res.status(400).json({ error: 'candidateIds must be an array' });

    const reviewerName = req.auth?.apiKeyName ?? 'system';
    const results = [];

    for (const id of candidateIds) {
      try {
        await IdentityService.mergeEntities(id, reviewerName, prisma as any);

        await (prisma as any).auditLog.create({
          data: {
            actor: reviewerName,
            actorRole: req.auth?.role ?? 'UNKNOWN',
            action: 'MERGE_CANDIDATE_BATCH',
            resourceType: 'MatchCandidate',
            resourceId: id,
            metadata: { correlationId: req.correlationId, batch: true },
          }
        });
        results.push({ id, status: 'success' });
      } catch (e: any) {
        results.push({ id, status: 'error', error: e.message });
      }
    }

    return res.json({ success: true, results });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// Rollback a Merge (Un-merge)
app.post('/api/v1/identity/rollback/:candidateId', async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const reviewerName = req.auth?.apiKeyName ?? 'system';

    const p = prisma as any;
    const candidate = await p.matchCandidate.findUnique({ where: { id: candidateId } });
    if (!candidate || candidate.status !== 'MERGED') {
      return res.status(400).json({ error: 'Candidate not found or not MERGED' });
    }

    // Simplistic rollback for demo: Mark candidate back to PENDING and record history.
    await p.matchCandidate.update({
      where: { id: candidateId },
      data: {
        status: 'PENDING',
        reviewedBy: null,
        reviewedAt: null,
        mergedIntoId: null
      }
    });

    await p.matchResolutionHistory.create({
      data: {
        matchCandidateId: candidate.id,
        logicalIdA: candidate.logicalIdA,
        logicalIdB: candidate.logicalIdB,
        entityTypeId: candidate.entityTypeId,
        scoreOverall: candidate.scoreOverall,
        scoreBreakdown: candidate.scoreBreakdown,
        matchReasons: candidate.matchReasons,
        resolution: 'ROLLBACK',
        resolvedBy: reviewerName,
      }
    });

    await p.auditLog.create({
      data: {
        actor: reviewerName,
        actorRole: req.auth?.role ?? 'UNKNOWN',
        action: 'ROLLBACK_MERGE',
        resourceType: 'MatchCandidate',
        resourceId: candidateId,
        metadata: { correlationId: req.correlationId },
      }
    });

    return res.json({ success: true, message: 'Merge rolled back to pending state' });
  } catch (err: any) {
    return res.status(500).json({ error: String(err) });
  }
});

// List entity aliases (source → canonical mappings)
app.get('/api/v1/identity/aliases', async (req, res) => {
  try {
    const logicalId = req.query.logicalId as string | undefined;
    const where: any = logicalId ? { targetLogicalId: logicalId } : {};
    const aliases = await prisma.entityAlias.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return res.json(aliases);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── Audit Log API ──────────────────────────────────────────────────

app.get('/api/v1/audit', async (req, res) => {
  try {
    const { action, resourceType, resourceId, actor, limit } = req.query;
    const where: any = {};
    if (action) where.action = action;
    if (resourceType) where.resourceType = resourceType;
    if (resourceId) where.resourceId = resourceId;
    if (actor) where.actor = actor;

    const logs = await (prisma as any).auditLog.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      take: parseInt(limit as string) || 100,
    });
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── ABAC Policy Simulation API ─────────────────────────────────────

app.post('/api/v1/policy/simulate', async (req, res) => {
  try {
    const { action, resource } = req.body;
    if (!action || !resource || !resource.type) {
      return res.status(400).json({ error: 'Missing required fields: action, resource.type' });
    }

    // Determine actor from auth, fallback to what's provided in body for pure simulation
    const actor = req.body.actor || {
      apiKeyId: req.auth?.apiKeyId ?? 'sim-key',
      apiKeyName: req.auth?.apiKeyName ?? 'sim-user',
      role: req.auth?.role ?? 'VIEWER',
      clearanceLevel: req.body.actor?.clearanceLevel ?? 1 // default mock
    };

    const engine = new AbacEngine(prisma as any);
    const result = await engine.evaluate(actor, action, resource);

    return res.json({
      actor,
      action,
      resource,
      evaluation: result
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── Model Monitoring & Management API ──────────────────────────────

// Update a Model Version Status (e.g. to SHADOW or PRODUCTION)
app.put('/api/v1/models/:modelId/versions/:versionId/status', async (req, res) => {
  try {
    const { versionId } = req.params;
    const { status } = req.body;

    if (!status || !['DRAFT', 'STAGING', 'PRODUCTION', 'RETIRED', 'SHADOW'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedVersion = await (prisma as any).modelVersion.update({
      where: { id: versionId },
      data: { status }
    });

    // Audit log
    await (prisma as any).auditLog.create({
      data: {
        actor: req.auth?.apiKeyName ?? 'system',
        actorRole: req.auth?.role ?? 'UNKNOWN',
        action: 'UPDATE_MODEL_STATUS',
        resourceType: 'ModelVersion',
        resourceId: versionId,
        metadata: { newStatus: status, modelId: req.params.modelId },
      }
    });

    return res.json(updatedVersion);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── Model Monitoring API ──────────────────────────────────────────

// Fetch Latency Metrics for a Model Version
app.get('/api/v1/models/:modelId/versions/:versionId/metrics/latency', async (req, res) => {
  try {
    const { versionId } = req.params;
    const { limit = '24' } = req.query; // Default to last 24 periods (2 hours if 5m windows)

    const metrics = await (prisma as any).modelLatencyMetric.findMany({
      where: { modelVersionId: versionId },
      orderBy: { windowStart: 'asc' },
      take: parseInt(limit as string, 10),
    });

    return res.json(metrics);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── Model Counterfactual Simulator API ────────────────────────────

import { simulateInference } from './inference-engine';

/**
 * Run a "What-If" scenario through a specific Model Version.
 * Skips telemetry reporting and DB persistence.
 */
app.post('/api/v1/decisions/simulate', async (req, res) => {
  try {
    const { modelVersionId, simulatedInputs } = req.body;

    if (!modelVersionId || !simulatedInputs) {
      return res.status(400).json({ error: 'Missing modelVersionId or simulatedInputs' });
    }

    const result = await simulateInference(modelVersionId, simulatedInputs, prisma as any);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── Legal Hold & Data Retention APIs ───────────────────────────────

app.put('/api/v1/governance/legal-hold/:logicalId', async (req, res) => {
  try {
    const { enabled, reason } = req.body;
    if (enabled === undefined) return res.status(400).json({ error: 'Must provide enabled boolean' });

    const logicalId = req.params.logicalId;

    // Check if entity exists
    const entity = await prisma.currentEntityState.findUnique({
      where: { logicalId }
    });

    if (!entity) return res.status(404).json({ error: 'Entity not found' });

    await prisma.currentEntityState.update({
      where: { logicalId },
      data: { legalHold: Boolean(enabled) }
    });

    const reviewerName = req.auth?.apiKeyName ?? 'system';
    await (prisma as any).auditLog.create({
      data: {
        actor: reviewerName,
        actorRole: req.auth?.role ?? 'UNKNOWN',
        action: enabled ? 'ENABLE_LEGAL_HOLD' : 'DISABLE_LEGAL_HOLD',
        resourceType: 'CurrentEntityState',
        resourceId: logicalId,
        metadata: { correlationId: req.correlationId, reason },
      }
    });

    return res.json({ success: true, logicalId, legalHold: Boolean(enabled) });
  } catch (err: any) {
    return res.status(500).json({ error: String(err) });
  }
});

// Delete endpoint demonstrating Legal Hold enforcement
app.delete('/api/v1/entities/:logicalId', async (req, res) => {
  try {
    const logicalId = req.params.logicalId;
    const entity = await prisma.currentEntityState.findUnique({ where: { logicalId } });
    if (!entity) return res.status(404).json({ error: 'Entity not found' });

    if (entity.legalHold) {
      // Governance constraint
      await (prisma as any).auditLog.create({
        data: {
          actor: req.auth?.apiKeyName ?? 'system',
          actorRole: req.auth?.role ?? 'UNKNOWN',
          action: 'BLOCKED_DELETE',
          resourceType: 'CurrentEntityState',
          resourceId: logicalId,
          metadata: { correlationId: req.correlationId, reason: 'LEGAL_HOLD_ACTIVE' },
        }
      });
      return res.status(403).json({ error: 'Deletion blocked: Entity is under Active Legal Hold.' });
    }

    await prisma.currentEntityState.delete({ where: { logicalId } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// duplicates removed

app.put('/api/v1/pipelines/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, nodes, edges, enabled } = req.body;
    const updated = await prisma.pipeline.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(nodes !== undefined && { nodes }),
        ...(edges !== undefined && { edges }),
        ...(enabled !== undefined && { enabled }),
      }
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── Dashboards & App Builder API ─────────────────────────────────────

app.get('/api/v1/dashboards', async (req, res) => {
  try {
    const projectId = (req.query.projectId as string) || req.header('X-Project-Id') || (global as any).DEFAULT_PROJECT_ID;
    const dashboards = await prisma.dashboard.findMany({
      where: { projectId },
      include: { widgets: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(dashboards);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/v1/dashboards', async (req, res) => {
  try {
    const { name, widgets } = req.body;
    const projectId = (req.body.projectId as string) || req.header('X-Project-Id') || (global as any).DEFAULT_PROJECT_ID;

    if (!name) return res.status(400).json({ error: 'name is required' });

    const newDash = await prisma.dashboard.create({
      data: {
        projectId,
        name,
        widgets: {
          create: widgets || []
        }
      },
      include: { widgets: true }
    });
    return res.json(newDash);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.put('/api/v1/dashboards/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, widgets } = req.body;

    // To update widgets, easiest is delete all and recreate
    const updated = await prisma.$transaction(async (tx: any) => {
      if (name) {
        await tx.dashboard.update({ where: { id }, data: { name } });
      }
      if (widgets && Array.isArray(widgets)) {
        await tx.dashboardWidget.deleteMany({ where: { dashboardId: id } });
        if (widgets.length > 0) {
          await tx.dashboardWidget.createMany({
            data: widgets.map(w => ({
              dashboardId: id,
              type: w.type,
              configData: w.configData,
              x: w.x,
              y: w.y,
              w: w.w,
              h: w.h
            }))
          });
        }
      }
      return tx.dashboard.findUnique({ where: { id }, include: { widgets: true } });
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ═══════════════════════════════════════════════════════════
// NEW: PHASE 6 - RUNTIME & RELEASE ENGINE
// ═══════════════════════════════════════════════════════════

/**
 * Creates an immutable snapshot (Release) of the entire project configuration.
 * This powers the 'Publish Center' UI.
 */
app.post('/api/v1/projects/:projectId/publish', apiKeyAuth(prisma), async (req, res) => {
  try {
    const projectId = req.params.projectId === 'CURRENT_PROJECT'
      ? req.auth?.projectId!
      : req.params.projectId;

    const { environment, version } = req.body; // e.g., "STAGING", "v1.0.0"

    if (!environment || !version) {
      return res.status(400).json({ error: "environment and version are required fields." });
    }

    // 1. Gather all the live Draft state configuration
    logger.info(`Extracting Draft state for Release ${version} in ${environment} [Project: ${projectId}]`);

    const [
      pipelines,
      dataSources,
      entityTypes,
      decisionRules,
      dashboards
    ] = await Promise.all([
      prisma.pipeline.findMany({ where: { projectId: projectId as string } }),
      prisma.dataSource.findMany({ where: { projectId: projectId as string } }),
      prisma.entityType.findMany({
        where: { projectId: projectId as string },
        include: { attributes: true, outgoingRelationships: true }
      }),
      prisma.decisionRule.findMany({ where: { projectId: projectId as string } }),
      prisma.dashboard.findMany({
        where: { projectId: projectId as string },
        include: { widgets: true }
      })
    ]);

    // 2. Package into a monolithic JSON Payload
    const payload = {
      pipelines,
      dataSources,
      entityTypes,
      decisionRules,
      dashboards,
      metadata: {
        snapshotTime: new Date().toISOString(),
        itemCounts: {
          pipelines: pipelines.length,
          entityTypes: entityTypes.length,
          apps: dashboards.length,
        }
      }
    };

    // 3. Freeze into a ProjectRelease atomic record
    const release = await prisma.projectRelease.create({
      data: {
        projectId: projectId as string,
        environment: environment as string,
        version: version as string,
        payload: payload,
        createdBy: req.auth?.apiKeyName || 'system_fallback'
      }
    });

    logger.info(`Successfully Published Release ${release.id}`);
    return res.json(release);

  } catch (err: any) {
    logger.error({ err }, "Failed to publish atomic project release.");
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Fetch the latest release for a given environment
 * Used by the App Runtime to serve frozen state instead of live drafts.
 */
app.get('/api/v1/projects/:projectId/releases/active', async (req, res) => {
  try {
    const projectId = req.params.projectId === 'CURRENT_PROJECT'
      ? (req.auth?.projectId || (global as any).DEFAULT_PROJECT_ID)
      : req.params.projectId;
    const environment = (req.query.environment as string) || "STAGING";

    const activeRelease = await prisma.projectRelease.findFirst({
      where: {
        projectId: projectId as string,
        environment
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!activeRelease) {
      return res.status(404).json({ error: `No active release found for ${environment}` });
    }

    return res.json(activeRelease);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Global Search API ──────────────────────────────────────────────

// Full-text search across CurrentEntityState (searches JSON data fields)
app.get('/api/v1/search', async (req, res) => {
  try {
    const q = (req.query.q as string)?.trim();
    const projectId = (req.query.projectId as string) || req.header('X-Project-Id') || (global as any).DEFAULT_PROJECT_ID;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);

    if (!q || q.length < 2) return res.json([]);

    // Use PostgreSQL ILIKE on the JSON text representation
    const results = await prisma.$queryRaw<any[]>`
      SELECT
        ces."logicalId",
        ces."entityTypeId",
        ces."updatedAt",
        ces."data",
        et."name" AS "entityTypeName"
      FROM "CurrentEntityState" ces
      JOIN "EntityType" et ON et."id" = ces."entityTypeId"
      WHERE et."projectId" = ${projectId}
        AND (ces."data"::text ILIKE ${'%' + q + '%'}
          OR ces."logicalId" ILIKE ${'%' + q + '%'})
      ORDER BY ces."updatedAt" DESC
      LIMIT ${limit}
    `;

    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── AI Copilot RAG Pipeline ────────────────────────────────────────

app.post('/api/v1/ai/chat', apiKeyAuth(prisma), async (req, res) => {
  try {
    const { message } = req.body;
    const projectId = req.auth?.projectId || req.header('X-Project-Id') || (global as any).DEFAULT_PROJECT_ID;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1. RAG Retrieval: Fetch Current Entity State for context
    const allEntities = await prisma.$queryRaw<any[]>`
      SELECT ces."logicalId", ces."data", et."name" AS "entityTypeName"
      FROM "CurrentEntityState" ces
      JOIN "EntityType" et ON et."id" = ces."entityTypeId"
      WHERE et."projectId" = ${projectId}
    `;

    // Extract specific entities for the response
    const threat = allEntities.find(e => e.entityTypeName === 'Threat')?.data || {};
    const asset = allEntities.find(e => e.entityTypeName === 'Asset')?.data || {};
    const unit = allEntities.find(e => e.entityTypeName === 'Unit')?.data || {};
    const javelinCount = allEntities.find(e => e.logicalId === 'resource-javelin-01')?.data?.quantity || 0;

    const lowerMsg = message.toLowerCase();

    let responseText = "";

    // Demo Scenario 1: Initial Threat Query & COA Generation
    if (lowerMsg.includes('threat') || lowerMsg.includes('units') || lowerMsg.includes('equipment') || lowerMsg.includes('coa')) {
      responseText = `Based on the latest ontology state, I have identified a potential threat:
**Enemy Unit:** ${threat.type || 'Main Battle Tank'} (${threat.model || 'T-80'})
**Affiliation:** ${threat.affiliation || 'Hostile'}
**Location:** Lat ${threat.location?.lat}, Lng ${threat.location?.lng}

Here are 3 possible Courses of Action (COAs) to target the enemy equipment:

### Course of Action 1: Drone Strike
Task the ${asset.model || 'MQ-9 Reaper'} (${asset.callsign || 'REAPER-1'}) to engage the target.
*   **Time to Target:** 15 minutes
*   **Risk:** Medium (Enemy air defense presence unknown)
*   **Action:** \`[Action: Task MQ-9 Drone]\`

### Course of Action 2: Ground Assault
Deploy ${unit.vehicle || 'Stryker ICV'} ${unit.unit_size || 'Platoon'} to intercept.
*   **Time to Target:** 45 minutes
*   **Risk:** High 
*   **Action:** \`[Action: Deploy Ground Forces]\`

### Course of Action 3: Jamming & Anti-Armor (Recommended)
Initiate Electronic Warfare jamming on enemy comms, then maneuver ${unit.vehicle || 'Stryker ICV'} elements to engage with ${javelinCount}x Javelin missiles.
*   **Time to Target:** 30 minutes
*   **Risk:** Low (Enemy comms disrupted)
*   **Action:** \`[Action: Initiate Jamming & Ground Assault]\`

What would you like to do?`;
    } else if (lowerMsg.includes('jam') || lowerMsg.includes('3') || lowerMsg.includes('jamming')) {
      responseText = `Understood. Generating operational plan for **Course of Action 3**.

**Validating Supplies:**
*   **Javelin Missiles:** ${javelinCount} available (Ready).
*   **Stryker Platoon:** Readiness status is ${unit.readiness || 'Green'}.
*   **EW Jammer:** Tactical GNSS Jammer status is Available.

I will formulate the Action payload and submit it to the chain of command for review.`;
    } else {
      responseText = `I am your AIP Copilot. Currently tracking ${allEntities.length} entities in the operational theater. How can I assist you?`;
    }

    // Simulate AI typing delay
    await new Promise(r => setTimeout(r, 1500));

    return res.json({
      role: "assistant",
      content: responseText
    });

  } catch (err) {
    logger.error({ err }, "AI Chat Error");
    return res.status(500).json({ error: String(err) });
  }
});

// ── Data Integration & Pipelines (Foundry Pipeline Builder) ────────

app.get('/api/data/sources', async (req, res) => {
  try {
    const projectId = req.auth?.projectId || (global as any).DEFAULT_PROJECT_ID;
    const sources = await prisma.dataSource.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(sources);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/data/sources/test', async (req, res) => {
  try {
    const { type, connectionConfig } = req.body;
    if (type === 'REST_API') {
      const url = connectionConfig?.url;
      if (!url) return res.status(400).json({ error: 'URL is required' });
      const testRes = await fetch(url, {
        method: connectionConfig.method || 'GET',
        headers: connectionConfig.headers || {}
      });
      if (!testRes.ok) throw new Error(`HTTP error! status: ${testRes.status}`);
      return res.json({ success: true, message: 'Connection successful' });
    }
    // Simulation for Postgres / CSV for MVP
    return res.json({ success: true, message: 'Simulated connection successful' });
  } catch (err: any) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/data/sources', async (req, res) => {
  try {
    const projectId = req.auth?.projectId || (global as any).DEFAULT_PROJECT_ID;
    const { name, type, connectionConfig } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Name and Type are required' });
    const source = await prisma.dataSource.create({
      data: { projectId, name, type, connectionConfig }
    });
    return res.json(source);
  } catch (err: any) {
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/api/data/pipelines', async (req, res) => {
  try {
    const projectId = req.auth?.projectId || (global as any).DEFAULT_PROJECT_ID;
    const pipelines = await prisma.pipeline.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(pipelines);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/data/pipelines', async (req, res) => {
  try {
    const projectId = req.auth?.projectId || (global as any).DEFAULT_PROJECT_ID;
    const { name, description, nodes, edges } = req.body;

    // We assume single pipeline for MVP, or we can upsert by name
    let pipeline = await prisma.pipeline.findFirst({ where: { projectId, name } });
    if (pipeline) {
      pipeline = await prisma.pipeline.update({
        where: { id: pipeline.id },
        data: { description, nodes, edges }
      });
    } else {
      pipeline = await prisma.pipeline.create({
        data: { projectId, name, description, nodes, edges }
      });
    }
    return res.json(pipeline);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/data/integration-jobs', async (req, res) => {
  try {
    const projectId = req.auth?.projectId || (global as any).DEFAULT_PROJECT_ID;
    const { name, dataSourceId, targetEntityTypeId, fieldMapping, logicalIdField, schedule } = req.body;

    let job = await prisma.integrationJob.findUnique({ where: { name } });
    if (job) {
      job = await prisma.integrationJob.update({
        where: { id: job.id },
        data: { dataSourceId, targetEntityTypeId, fieldMapping, logicalIdField, schedule }
      });
    } else {
      job = await prisma.integrationJob.create({
        data: { projectId, name, dataSourceId, targetEntityTypeId, fieldMapping, logicalIdField, schedule }
      });
    }
    return res.json(job);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/data/integration-jobs/:id/run', async (req, res) => {
  try {
    const { id } = req.params;
    const job = await prisma.integrationJob.findUnique({ where: { id } });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Push explicitly to JobQueue
    const queueJob = await prisma.jobQueue.create({
      data: {
        jobType: 'INTEGRATION_SYNC',
        payload: { integrationJobId: job.id },
        integrationJobId: job.id
      }
    });

    return res.json({ message: 'Integration job queued', queueId: queueJob.id });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── AIP Agent Studio ──────────────────────────────────────────

app.get('/api/agents', async (req, res) => {
  try {
    const projectId = req.auth?.projectId || (global as any).DEFAULT_PROJECT_ID;
    const agents = await prisma.aIPAgent.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(agents);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/agents', async (req, res) => {
  try {
    const projectId = req.auth?.projectId || (global as any).DEFAULT_PROJECT_ID;
    const { id, name, description, systemPrompt, modelConfig, ontologyAccess } = req.body;

    if (!name || !systemPrompt) return res.status(400).json({ error: 'Name and System Prompt are required' });

    let agent;
    if (id) {
      agent = await prisma.aIPAgent.update({
        where: { id },
        data: { name, description, systemPrompt, modelConfig: modelConfig || {}, ontologyAccess: ontologyAccess || [] }
      });
    } else {
      agent = await prisma.aIPAgent.create({
        data: { projectId, name, description, systemPrompt, modelConfig: modelConfig || {}, ontologyAccess: ontologyAccess || [] }
      });
    }
    return res.json(agent);
  } catch (err: any) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/agents/:id/chat', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const agent = await prisma.aIPAgent.findUnique({ where: { id } });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    // Step 1: Forward the heavy RAG lifting and LLM generation over to the Worker Microservice
    if (!amqpChannel) {
      return res.status(503).json({ error: 'Message Broker is offline. Cannot process Agent request.' });
    }

    // Set up an exclusive, auto-deleted reply-to queue for the RPC pattern
    const replyQueue = await amqpChannel.assertQueue('', { exclusive: true });
    const correlationId = randomUUID();

    // Push the inference request to the high-compute worker queue
    const payload = JSON.stringify({
      agentId: id,
      message,
      correlationId,
      replyTo: replyQueue.queue
    });

    console.log(`[API] Offloading chat to worker for Agent ${id}`);
    amqpChannel.sendToQueue('agent_compute_queue', Buffer.from(payload), {
      persistent: false, // Chats don't strictly need to survive a sudden broker crash
    });

    // Wait asynchronously for the worker to finish LLM processing and reply
    return new Promise((resolve, reject) => {
      amqpChannel!.consume(replyQueue.queue, (msg) => {
        if (msg && msg.properties.correlationId === correlationId) {
          try {
            const workerResponse = JSON.parse(msg.content.toString());
            const finalAnswer = workerResponse.response;

            // Cleanup the temporary RPC queue
            amqpChannel!.deleteQueue(replyQueue.queue);

            // Respond back to the Web Client
            resolve(res.json({
              role: 'assistant',
              content: finalAnswer,
              _debug_context: `Model Used: ${workerResponse.modelUsed}`
            }));
          } catch (e) {
            reject(res.status(500).json({ error: 'Worker returned invalid response.' }));
          }
        }
      }, { noAck: true });
    });

  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ── Functions (AIP Tools) Router ─────────────────────────────────────────

app.get('/api/functions', async (req, res) => {
  try {
    const functions = await prisma.aIPFunction.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(functions);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/functions', async (req, res) => {
  try {
    const { name, description, parameters, code } = req.body;
    const proj = await prisma.project.findFirst({ orderBy: { createdAt: 'asc' } });

    const newFunction = await prisma.aIPFunction.create({
      data: {
        name,
        description,
        parameters: parameters || {},
        code: code || '',
        projectId: proj!.id
      }
    });

    return res.json(newFunction);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 9: AIP Metrics API — Live Ontology Aggregations
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/metrics — list all metric definitions for project
app.get('/api/metrics', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project initialised' });
    const metrics = await prisma.aIPMetric.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
    return res.json(metrics);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// POST /api/metrics — create a new metric definition
app.post('/api/metrics', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project initialised' });
    const { name, objectType, property, unit, aggr, window, threshold, thresholdOp, alertOutputType, status } = req.body;
    if (!name || !objectType || !property) return res.status(400).json({ error: 'name, objectType, property required' });
    const metric = await prisma.aIPMetric.create({
      data: {
        projectId,
        name,
        objectType,
        property,
        unit: unit || '',
        aggr: aggr || 'AVG',
        window: window || 'Last 1 hr',
        threshold: threshold ?? 0,
        thresholdOp: thresholdOp || '>',
        alertOutputType: alertOutputType || 'streaming',
        status: status || 'draft',
      }
    });
    return res.status(201).json(metric);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// PUT /api/metrics/:id — update a metric definition
app.put('/api/metrics/:id', async (req, res) => {
  try {
    const metric = await prisma.aIPMetric.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json(metric);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// DELETE /api/metrics/:id — delete a metric
app.delete('/api/metrics/:id', async (req, res) => {
  try {
    await prisma.aIPMetric.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// GET /api/metrics/:id/data — compute real live aggregation from CurrentEntityState
// This is the core endpoint that powers real chart data instead of Math.random()
app.get('/api/metrics/:id/data', async (req, res) => {
  try {
    const metric = await prisma.aIPMetric.findUnique({ where: { id: req.params.id } });
    if (!metric) return res.status(404).json({ error: 'Metric not found' });

    // Find the EntityType by name (objectType)
    const entityType = await prisma.entityType.findFirst({
      where: { name: { equals: metric.objectType, mode: 'insensitive' } },
    });

    // Build the result series — we'll create 30 time buckets
    const POINTS = 30;
    let seriesData: { t: number; v: number; label: string }[] = [];
    let currentValue: number | null = null;
    let entityCount = 0;
    let breaching = false;

    if (entityType) {
      // Fetch all current entity states for this type
      const states = await prisma.currentEntityState.findMany({
        where: { entityTypeId: entityType.id },
        orderBy: { updatedAt: 'desc' },
        take: 500, // cap at 500 most-recent entities
      });

      entityCount = states.length;

      if (states.length > 0) {
        // Extract the numeric property value from each entity's JSON data
        const values: number[] = states
          .map((s: any) => {
            const data = s.data as Record<string, any>;
            const raw = data[metric.property];
            const n = parseFloat(String(raw));
            return isNaN(n) ? null : n;
          })
          .filter((v: number | null): v is number => v !== null);

        if (values.length > 0) {
          // Apply aggregation to get the single current value
          const appliedAggr = metric.aggr.toUpperCase();
          switch (appliedAggr) {
            case 'AVG':
              currentValue = values.reduce((a, b) => a + b, 0) / values.length;
              break;
            case 'SUM':
              currentValue = values.reduce((a, b) => a + b, 0);
              break;
            case 'COUNT':
              currentValue = values.length;
              break;
            case 'MIN':
              currentValue = Math.min(...values);
              break;
            case 'MAX':
              currentValue = Math.max(...values);
              break;
            case 'P95': {
              const sorted = [...values].sort((a, b) => a - b);
              currentValue = sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1];
              break;
            }
            case 'P99': {
              const sorted = [...values].sort((a, b) => a - b);
              currentValue = sorted[Math.floor(sorted.length * 0.99)] ?? sorted[sorted.length - 1];
              break;
            }
            case 'P50': {
              const sorted = [...values].sort((a, b) => a - b);
              currentValue = sorted[Math.floor(sorted.length * 0.50)] ?? sorted[sorted.length - 1];
              break;
            }
            default:
              currentValue = values.reduce((a, b) => a + b, 0) / values.length;
          }

          // Build a realistic time series by using entity data + small variance
          // We use entity values distributed across time buckets
          const bucketSize = Math.max(1, Math.floor(values.length / POINTS));
          for (let i = 0; i < POINTS; i++) {
            const bucketValues = values.slice(i * bucketSize, (i + 1) * bucketSize);
            let bucketValue: number;
            if (bucketValues.length === 0) {
              bucketValue = currentValue;
            } else {
              switch (metric.aggr.toUpperCase()) {
                case 'AVG':
                  bucketValue = bucketValues.reduce((a, b) => a + b, 0) / bucketValues.length;
                  break;
                case 'SUM':
                  bucketValue = bucketValues.reduce((a, b) => a + b, 0);
                  break;
                case 'COUNT':
                  bucketValue = bucketValues.length;
                  break;
                case 'MIN':
                  bucketValue = Math.min(...bucketValues);
                  break;
                case 'MAX':
                  bucketValue = Math.max(...bucketValues);
                  break;
                default:
                  bucketValue = bucketValues.reduce((a, b) => a + b, 0) / bucketValues.length;
              }
            }
            seriesData.push({ t: i, v: Math.round(bucketValue * 100) / 100, label: `t${i}` });
          }
        }
      }
    }

    // If no real data available, return empty series (frontend falls back to synthetic)
    if (seriesData.length === 0) {
      for (let i = 0; i < POINTS; i++) {
        seriesData.push({ t: i, v: 0, label: `t${i}` });
      }
    }

    // Check threshold breach
    if (currentValue !== null) {
      switch (metric.thresholdOp) {
        case '>': breaching = currentValue > metric.threshold; break;
        case '<': breaching = currentValue < metric.threshold; break;
        case '>=': breaching = currentValue >= metric.threshold; break;
        case '<=': breaching = currentValue <= metric.threshold; break;
        default: breaching = false;
      }
    }

    return res.json({
      metricId: metric.id,
      series: seriesData,
      currentValue,
      entityCount,
      breaching,
      hasRealData: entityCount > 0 && currentValue !== null,
      aggregation: `${metric.aggr}(${metric.objectType}.${metric.property})`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// GET /api/metrics/summary — overview aggregates across all active metrics
app.get('/api/metrics/summary', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project initialised' });
    const metrics = await prisma.aIPMetric.findMany({
      where: { projectId, status: { in: ['active', 'warning'] } },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ count: metrics.length, metrics: metrics.slice(0, 10) });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 14: AIP Logic — Visual LLM Workflow Builder
// ─────────────────────────────────────────────────────────────────────────────

import OpenAI from 'openai';

const _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

/** Interpolate {{varName}} template tokens from a context map */
function interpolate(template: string, ctx: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = ctx[key];
    return val !== undefined ? (typeof val === 'object' ? JSON.stringify(val) : String(val)) : `{{${key}}}`;
  });
}

/** Execute a workflow by its DB id — walks the ReactFlow DAG in topological order */
async function executeWorkflow(workflowId: string, runId: string, inputs: Record<string, any> = {}) {
  const workflow = await prisma.aIWorkflow.findUnique({ where: { id: workflowId } });
  if (!workflow) throw new Error('Workflow not found');

  const nodes = (workflow.nodes as any[]) || [];
  const edges = (workflow.edges as any[]) || [];
  const logs: string[] = [];
  const steps: any[] = [];

  const log = async (msg: string) => {
    const line = `[${new Date().toISOString()}] ${msg}`;
    logs.push(line);
    if (logs.length % 3 === 0 || msg.startsWith('✓') || msg.startsWith('✗')) {
      await prisma.aIWorkflowRun.update({ where: { id: runId }, data: { logs } });
    }
    const bcast = (global as any).broadcastToTopics;
    if (bcast) bcast([`workflow:${workflowId}`, 'workflows:*'], { type: 'workflow.progress', workflowId, runId, log: line, ts: Date.now() });
  };

  const updateStep = async (step: any) => {
    const idx = steps.findIndex(s => s.stepId === step.stepId);
    if (idx >= 0) steps[idx] = step; else steps.push(step);
    await prisma.aIWorkflowRun.update({ where: { id: runId }, data: { steps } });
  };

  // ── Topological sort ──────────────────────────────────────────────────────
  const adjOut = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  nodes.forEach((n: any) => { adjOut.set(n.id, []); indegree.set(n.id, 0); });
  edges.forEach((e: any) => {
    adjOut.get(e.source)?.push(e.target);
    indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);
  });
  const queue = nodes.filter((n: any) => (indegree.get(n.id) ?? 0) === 0).map((n: any) => n.id);
  const order: string[] = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    order.push(cur);
    for (const next of (adjOut.get(cur) ?? [])) {
      const deg = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }

  // ── Execution context: carries outputs between steps ──────────────────────
  const nodeOutputs = new Map<string, any>(); // nodeId → output value
  // Allow inputs to be referenced by name
  const ctx: Record<string, any> = { ...inputs };

  await log(`Starting workflow "${workflow.name}" — ${order.length} nodes`);

  // ── Execute each node ─────────────────────────────────────────────────────
  for (const nodeId of order) {
    const node = nodes.find((n: any) => n.id === nodeId);
    if (!node) continue;

    const nodeType: string = node.type || node.data?.nodeType || 'unknown';
    const nodeLabel: string = node.data?.label || nodeType;
    const stepStart = Date.now();
    const step: any = { stepId: nodeId, name: nodeLabel, type: nodeType, status: 'running', input: null, output: null, error: null, durationMs: 0 };
    await updateStep(step);
    await log(`→ [${nodeType}] "${nodeLabel}"`);

    // Collect inputs from upstream nodes
    const inEdges = edges.filter((e: any) => e.target === nodeId);
    const upstreamOutputs: Record<string, any> = {};
    for (const e of inEdges) {
      const upOut = nodeOutputs.get(e.source);
      if (upOut !== undefined) upstreamOutputs[e.source] = upOut;
    }
    // Also expose each upstream output by label for {{varName}} interpolation
    for (const e of inEdges) {
      const srcNode = nodes.find((n: any) => n.id === e.source);
      if (srcNode) {
        const srcLabel = (srcNode.data?.label || srcNode.id).replace(/\s+/g, '_').toLowerCase();
        ctx[srcLabel] = nodeOutputs.get(e.source) ?? null;
        ctx[`${srcNode.type || 'node'}_output`] = nodeOutputs.get(e.source) ?? null;
      }
    }
    step.input = Object.keys(upstreamOutputs).length > 0 ? upstreamOutputs : inputs;

    try {
      let output: any = null;

      switch (nodeType) {
        // ── LLM Prompt ───────────────────────────────────────────────────────
        case 'llmPrompt': {
          const systemPrompt = interpolate(node.data?.systemPrompt || 'You are a helpful AI assistant.', ctx);
          const userPrompt = interpolate(node.data?.userPrompt || node.data?.prompt || 'Hello', ctx);
          const model = node.data?.model || 'gpt-4o-mini';
          const temperature = parseFloat(node.data?.temperature ?? '0.7');

          await log(`  Calling LLM (${model}) with ${userPrompt.length} char prompt`);

          if (!process.env.OPENAI_API_KEY) {
            output = `[MOCK LLM] Would call ${model} with: "${userPrompt.slice(0, 100)}"`;
            await log('  ⚠ No OPENAI_API_KEY — returning mock response');
          } else {
            const completion = await _openai.chat.completions.create({
              model, temperature,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ]
            });
            output = completion.choices[0]?.message?.content ?? '';
            await log(`  ✓ LLM returned ${String(output).length} chars`);
          }
          ctx['llm_output'] = output;
          break;
        }

        // ── Ontology Query ───────────────────────────────────────────────────
        case 'ontologyQuery': {
          const entityTypeName: string = node.data?.entityType || '';
          const limitRaw = parseInt(node.data?.limit ?? '20', 10);
          const limit = isNaN(limitRaw) ? 20 : Math.min(limitRaw, 200);

          await log(`  Querying entity type "${entityTypeName}" (limit ${limit})`);
          const entityType = await prisma.entityType.findFirst({ where: { name: entityTypeName } });
          if (!entityType) {
            await log(`  ⚠ Entity type "${entityTypeName}" not found`);
            output = [];
          } else {
            const records = await prisma.currentEntityState.findMany({
              where: { entityTypeId: entityType.id },
              take: limit,
              orderBy: { updatedAt: 'desc' }
            });
            output = records.map((r: any) => ({ logicalId: r.logicalId, ...r.data }));
            await log(`  ✓ Retrieved ${output.length} records`);
          }
          ctx['ontology_output'] = output;
          break;
        }

        // ── Function Call ────────────────────────────────────────────────────
        case 'functionCall': {
          const fnId: string = node.data?.functionId || '';
          const fn = fnId ? await prisma.aIPFunction.findUnique({ where: { id: fnId } }) : null;
          if (!fn) { output = { error: `Function ${fnId} not found` }; break; }

          await log(`  Executing function "${fn.name}"`);
          const rawMapping: Record<string, string> = node.data?.inputMapping || {};
          const parsedArgs: Record<string, any> = {};
          for (const [param, tpl] of Object.entries(rawMapping)) {
            parsedArgs[param] = interpolate(tpl, ctx);
          }

          try {
            const AsyncFn = Object.getPrototypeOf(async function () { }).constructor;
            const execFn = new AsyncFn('parsedArgs', 'context', `"use strict";\n${fn.code}`);
            output = await Promise.race([
              execFn(parsedArgs, ctx),
              new Promise((_, rej) => setTimeout(() => rej(new Error('Function timeout (30s)')), 30_000))
            ]);
            await log(`  ✓ Function returned ${JSON.stringify(output).slice(0, 80)}`);
          } catch (fnErr: any) {
            output = { error: fnErr.message };
            await log(`  ✗ Function error: ${fnErr.message}`);
          }
          ctx['function_output'] = output;
          break;
        }

        // ── Action Trigger ───────────────────────────────────────────────────
        case 'actionTrigger': {
          const actionId: string = node.data?.actionId || '';
          const action = actionId ? await prisma.aIPAction.findUnique({ where: { id: actionId } }) : null;
          if (!action) { output = { error: `Action ${actionId} not found` }; break; }

          await log(`  Triggering action "${action.name}"`);
          const paramMapping: Record<string, string> = node.data?.paramMapping || {};
          const resolvedParams: Record<string, any> = {};
          for (const [k, v] of Object.entries(paramMapping)) resolvedParams[k] = interpolate(v, ctx);

          try {
            const AsyncFn = Object.getPrototypeOf(async function () { }).constructor;
            const execFn = new AsyncFn('params', 'prisma', 'context', `"use strict";\n${(action as any).code || 'return {ok:true};'}`);
            output = await Promise.race([
              execFn(resolvedParams, prisma, ctx),
              new Promise((_, rej) => setTimeout(() => rej(new Error('Action timeout (30s)')), 30_000))
            ]);
            await log(`  ✓ Action triggered, result: ${JSON.stringify(output).slice(0, 80)}`);
          } catch (actErr: any) {
            output = { error: actErr.message };
          }
          ctx['action_output'] = output;
          break;
        }

        // ── Condition ────────────────────────────────────────────────────────
        case 'condition': {
          const expression = interpolate(node.data?.expression || 'true', ctx);
          await log(`  Evaluating condition: ${expression.slice(0, 80)}`);
          try {
            const fn = new Function('ctx', `"use strict"; with(ctx) { return !!(${expression}); }`);
            const result = fn(ctx);
            output = { result, branch: result ? 'true' : 'false' };
            ctx['condition_result'] = result;
            await log(`  ✓ Condition → ${result ? 'TRUE branch' : 'FALSE branch'}`);
          } catch (condErr: any) {
            output = { result: false, error: condErr.message };
            await log(`  ✗ Condition error: ${condErr.message}`);
          }
          break;
        }

        // ── Output ───────────────────────────────────────────────────────────
        case 'output': {
          const label = node.data?.label || 'Output';
          const valueTemplate = node.data?.valueTemplate || '{{llm_output}}';
          output = interpolate(valueTemplate, ctx);
          await log(`  ✓ Output "${label}": ${String(output).slice(0, 100)}`);

          // Optional: write back to Ontology
          if (node.data?.writeToOntology && node.data?.entityType) {
            const etName: string = node.data.entityType;
            const logicalId: string = interpolate(node.data?.logicalId || `workflow-${workflowId}-${Date.now()}`, ctx);
            const et = await prisma.entityType.findFirst({ where: { name: etName } });
            if (et) {
              const projectId = (global as any).DEFAULT_PROJECT_ID || '';
              await prisma.currentEntityState.upsert({
                where: { entityTypeId_logicalId: { entityTypeId: et.id, logicalId } },
                create: { entityTypeId: et.id, logicalId, projectId, data: { value: output, generatedAt: new Date().toISOString() } },
                update: { data: { value: output, generatedAt: new Date().toISOString() }, updatedAt: new Date() }
              });
              await log(`  ✓ Wrote output to Ontology entity ${etName}/${logicalId}`);
            }
          }
          ctx['final_output'] = output;
          break;
        }

        default:
          output = Object.values(upstreamOutputs)[0] ?? null;
          await log(`  Unknown node type "${nodeType}" — passing through`);
      }

      nodeOutputs.set(nodeId, output);
      step.status = 'success';
      step.output = output;
      step.durationMs = Date.now() - stepStart;
      await updateStep(step);
    } catch (err: any) {
      step.status = 'failed';
      step.error = String(err?.message ?? err);
      step.durationMs = Date.now() - stepStart;
      await updateStep(step);
      await log(`  ✗ "${nodeLabel}" failed: ${step.error}`);
    }
  }

  await log(`Workflow complete`);
  const finalOutput = ctx['final_output'] ?? ctx['llm_output'] ?? null;
  return { status: 'success', summary: { finalOutput, context: ctx }, steps, logs };
}

// ── Workflow REST Routes ──────────────────────────────────────────────────────

app.get('/api/workflows', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project' });
    const workflows = await prisma.aIWorkflow.findMany({
      where: { projectId }, orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true, enabled: true, createdAt: true, updatedAt: true }
    });
    return res.json(workflows);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

app.post('/api/workflows', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project' });
    const { name, description, nodes, edges } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const wf = await prisma.aIWorkflow.create({
      data: { projectId, name, description: description || '', nodes: nodes || [], edges: edges || [] }
    });
    return res.status(201).json(wf);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

app.get('/api/workflows/:id', async (req, res) => {
  try {
    const wf = await prisma.aIWorkflow.findUnique({ where: { id: req.params.id } });
    if (!wf) return res.status(404).json({ error: 'Not found' });
    return res.json(wf);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

app.put('/api/workflows/:id', async (req, res) => {
  try {
    const wf = await prisma.aIWorkflow.update({ where: { id: req.params.id }, data: req.body });
    return res.json(wf);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

app.delete('/api/workflows/:id', async (req, res) => {
  try {
    await prisma.aIWorkflow.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

app.post('/api/workflows/:id/run', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    const wf = await prisma.aIWorkflow.findUnique({ where: { id: req.params.id } });
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });

    const run = await prisma.aIWorkflowRun.create({
      data: { workflowId: wf.id, projectId: projectId || '', status: 'running', trigger: req.body?.trigger || 'manual', inputs: req.body?.inputs || {} }
    });
    res.status(202).json({ runId: run.id, workflowId: wf.id, status: 'running' });

    executeWorkflow(wf.id, run.id, req.body?.inputs || {})
      .then(async (result) => {
        await prisma.aIWorkflowRun.update({
          where: { id: run.id },
          data: { status: result.status, steps: result.steps, logs: result.logs, summary: result.summary, finishedAt: new Date(), duration: Date.now() - run.startedAt.getTime() }
        });
        const bcast = (global as any).broadcastToTopics;
        if (bcast) bcast([`workflow:${wf.id}`, 'workflows:*'], { type: 'workflow.complete', workflowId: wf.id, runId: run.id, status: result.status, ts: Date.now() });
      })
      .catch(async (err) => {
        await prisma.aIWorkflowRun.update({ where: { id: run.id }, data: { status: 'failed', finishedAt: new Date(), logs: [String(err)] } });
      });
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

app.get('/api/workflows/:id/runs', async (req, res) => {
  try {
    const runs = await prisma.aIWorkflowRun.findMany({
      where: { workflowId: req.params.id }, orderBy: { startedAt: 'desc' }, take: 30,
      select: { id: true, status: true, trigger: true, startedAt: true, finishedAt: true, duration: true, summary: true }
    });
    return res.json(runs);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

app.get('/api/workflows/:id/runs/:runId', async (req, res) => {
  try {
    const run = await prisma.aIWorkflowRun.findUnique({ where: { id: req.params.runId } });
    if (!run) return res.status(404).json({ error: 'Not found' });
    return res.json(run);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 13: Data Pipeline Real Execution Engine
// ─────────────────────────────────────────────────────────────────────────────

/** Execute a pipeline by its DB id — walks the ReactFlow DAG in topo order */
async function executePipeline(pipelineId: string, runId: string, trigger = 'manual') {
  const pipeline = await prisma.pipeline.findUnique({ where: { id: pipelineId } });
  if (!pipeline) throw new Error('Pipeline not found');

  const nodes = (pipeline.nodes as any[]) || [];
  const edges = (pipeline.edges as any[]) || [];

  const logs: string[] = [];
  const steps: any[] = [];
  let totalIn = 0, totalOut = 0, errorCount = 0;

  const log = async (msg: string) => {
    const line = `[${new Date().toISOString()}] ${msg}`;
    logs.push(line);
    if (logs.length % 5 === 0 || msg.startsWith('✓') || msg.startsWith('✗')) {
      await prisma.pipelineRun.update({ where: { id: runId }, data: { logs } });
    }
    // Broadcast progress via WS
    const broadcast = (global as any).broadcastToTopics;
    if (broadcast) {
      broadcast([`pipeline:${pipelineId}`, 'pipelines:*'], {
        type: 'pipeline.progress', pipelineId, runId, log: line, ts: Date.now()
      });
    }
  };

  const updateStep = async (step: any) => {
    const idx = steps.findIndex(s => s.stepId === step.stepId);
    if (idx >= 0) steps[idx] = step; else steps.push(step);
    await prisma.pipelineRun.update({ where: { id: runId }, data: { steps } });
  };

  // ── Build topological order ──────────────────────────────────────────────
  const adjOut = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  nodes.forEach((n: any) => { adjOut.set(n.id, []); indegree.set(n.id, 0); });
  edges.forEach((e: any) => {
    adjOut.get(e.source)?.push(e.target);
    indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);
  });
  const queue = nodes.filter((n: any) => (indegree.get(n.id) ?? 0) === 0).map((n: any) => n.id);
  const order: string[] = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    order.push(cur);
    for (const next of (adjOut.get(cur) ?? [])) {
      const deg = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }

  // ── Node data map (carry outputs between steps) ──────────────────────────
  const nodeData = new Map<string, any[]>(); // nodeId → output records

  await log(`Starting pipeline "${pipeline.name}" — ${order.length} nodes`);

  // ── Execute each node in DAG order ──────────────────────────────────────
  for (const nodeId of order) {
    const node = nodes.find((n: any) => n.id === nodeId);
    if (!node) continue;

    const nodeType: string = node.type || node.data?.type || 'unknown';
    const nodeLabel: string = node.data?.label || nodeId;
    const stepStart = Date.now();
    const step = { stepId: nodeId, name: nodeLabel, type: nodeType, status: 'running', recordsIn: 0, recordsOut: 0, error: null as string | null, durationMs: 0 };
    await updateStep(step);
    await log(`→ Step [${nodeType}] "${nodeLabel}"`);

    try {
      // Collect input from upstream nodes
      const inEdges = edges.filter((e: any) => e.target === nodeId);
      const inputRecords: any[] = inEdges.flatMap((e: any) => nodeData.get(e.source) ?? []);
      step.recordsIn = inputRecords.length;
      totalIn += inputRecords.length;

      let output: any[] = [];

      if (nodeType === 'dataSource' || nodeType === 'DataSourceNode') {
        // Use existing integration job / data source fetch
        const jobId = node.data?.jobId || node.data?.integrationJobId;
        if (jobId) {
          await log(`  Executing IntegrationJob ${jobId}`);
          const result = await executeJob(jobId, prisma);
          output = [{ status: result.status, recordsProcessed: result.recordsProcessed }];
          totalOut += result.recordsProcessed;
          await log(`  ✓ Job done: ${result.recordsProcessed} records processed`);
        } else if (node.data?.url || node.data?.connectionConfig?.url) {
          // Direct fetch
          const url = node.data?.url || node.data?.connectionConfig?.url;
          await log(`  Fetching ${url}`);
          const resp = await fetch(url, { signal: AbortSignal.timeout(30_000) });
          const raw = await resp.json();
          output = Array.isArray(raw) ? raw : [raw];
          await log(`  ✓ Fetched ${output.length} records`);
          totalOut += output.length;
        } else {
          output = [];
          await log(`  No job or URL — empty source`);
        }
      } else if (nodeType === 'transform' || nodeType === 'TransformNode') {
        // JS transform using eval
        const code = node.data?.code || node.data?.transformCode || '';
        await log(`  Running JS transform (${code.length} chars)`);
        if (code && inputRecords.length > 0) {
          const AsyncFn = Object.getPrototypeOf(async function () { }).constructor;
          const fn = new AsyncFn('records', `"use strict";\n${code}`);
          const result = await Promise.race([
            fn(inputRecords),
            new Promise((_, rej) => setTimeout(() => rej(new Error('Transform timeout (30s)')), 30_000))
          ]);
          output = Array.isArray(result) ? result : [result];
          await log(`  ✓ Transform: ${inputRecords.length} → ${output.length} records`);
        } else {
          output = inputRecords;
          await log(`  No code or no input — passing through`);
        }
        totalOut += output.length;
      } else if (nodeType === 'sqlQuery' || nodeType === 'SQLNode') {
        // Execute raw SQL against Postgres and produce records
        const sql = node.data?.sql || node.data?.query || '';
        await log(`  Running SQL: ${sql.slice(0, 80)}...`);
        if (sql) {
          const res = await pool.query(sql);
          output = res.rows;
          await log(`  ✓ SQL returned ${output.length} rows`);
          totalOut += output.length;
        } else {
          output = inputRecords;
          await log(`  No SQL — passing through`);
        }
      } else if (nodeType === 'filter' || nodeType === 'FilterNode') {
        // Inline filter using a JS predicate
        const predicate = node.data?.predicate || node.data?.condition || 'return true';
        await log(`  Filtering ${inputRecords.length} records`);
        const fn = new Function('record', `"use strict"; ${predicate}`);
        output = inputRecords.filter((r: any) => { try { return fn(r); } catch { return false; } });
        await log(`  ✓ Filter: ${inputRecords.length} → ${output.length} records`);
        totalOut += output.length;
      } else if (nodeType === 'entityTarget' || nodeType === 'EntityTargetNode') {
        // Write records to CurrentEntityState
        const entityTypeName: string = node.data?.entityType || node.data?.label || '';
        const logicalIdField: string = node.data?.logicalIdField || 'id';
        await log(`  Writing ${inputRecords.length} records to entity type "${entityTypeName}"`);
        let written = 0;
        const entityType = await prisma.entityType.findFirst({ where: { name: entityTypeName } });
        if (entityType) {
          for (const rec of inputRecords) {
            const logicalId = String(rec[logicalIdField] ?? rec.id ?? `gen-${Date.now()}-${written}`);
            const projectId = (global as any).DEFAULT_PROJECT_ID;
            try {
              await prisma.currentEntityState.upsert({
                where: { entityTypeId_logicalId: { entityTypeId: entityType.id, logicalId } },
                create: { entityTypeId: entityType.id, logicalId, projectId, data: rec },
                update: { data: rec, updatedAt: new Date() },
              });
              // Broadcast entity change
              const bcast = (global as any).broadcastEntityChange;
              if (bcast) bcast(entityTypeName, logicalId, rec, 'updated');
              written++;
            } catch { errorCount++; }
          }
          await log(`  ✓ Wrote ${written}/${inputRecords.length} entities`);
          totalOut += written;
        } else {
          await log(`  ⚠ Entity type "${entityTypeName}" not found — skipping write`);
        }
        output = inputRecords;
      } else {
        // Unknown node type — pass through
        output = inputRecords;
        await log(`  Unknown node type "${nodeType}" — passing through`);
      }

      nodeData.set(nodeId, output);
      step.status = 'success';
      step.recordsOut = output.length;
      step.durationMs = Date.now() - stepStart;
      await updateStep(step);
      await log(`  ✓ "${nodeLabel}" done in ${step.durationMs}ms`);
    } catch (err: any) {
      errorCount++;
      step.status = 'failed';
      step.error = String(err?.message ?? err);
      step.durationMs = Date.now() - stepStart;
      await updateStep(step);
      await log(`  ✗ "${nodeLabel}" failed: ${step.error}`);
    }
  }

  const runStatus = errorCount > 0 && totalOut === 0 ? 'failed' : 'success';
  await log(`Pipeline complete — ${totalOut} records output, ${errorCount} errors`);

  return { status: runStatus, recordsIn: totalIn, recordsOut: totalOut, errorCount, logs, steps };
}

// ── REST routes ───────────────────────────────────────────────────────────────

// GET /api/pipelines — list all pipelines for project
app.get('/api/pipelines', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project' });
    const pipelines = await prisma.pipeline.findMany({
      where: { projectId }, orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true, enabled: true, createdAt: true }
    });
    return res.json(pipelines);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// POST /api/pipelines — create a new pipeline
app.post('/api/pipelines', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project' });
    const { name, description, nodes, edges, enabled } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const p = await prisma.pipeline.create({
      data: { projectId, name, description: description || '', nodes: nodes || [], edges: edges || [], enabled: enabled ?? true }
    });
    return res.status(201).json(p);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// GET /api/pipelines/:id
app.get('/api/pipelines/:id', async (req, res) => {
  try {
    const p = await prisma.pipeline.findUnique({ where: { id: req.params.id } });
    if (!p) return res.status(404).json({ error: 'Not found' });
    return res.json(p);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// PUT /api/pipelines/:id — save pipeline (nodes/edges)
app.put('/api/pipelines/:id', async (req, res) => {
  try {
    const p = await prisma.pipeline.update({ where: { id: req.params.id }, data: req.body });
    return res.json(p);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// DELETE /api/pipelines/:id
app.delete('/api/pipelines/:id', async (req, res) => {
  try {
    await prisma.pipeline.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// POST /api/pipelines/:id/run — execute the pipeline (async, returns runId immediately)
app.post('/api/pipelines/:id/run', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    const pipeline = await prisma.pipeline.findUnique({ where: { id: req.params.id } });
    if (!pipeline) return res.status(404).json({ error: 'Pipeline not found' });

    // Create run record immediately
    const run = await prisma.pipelineRun.create({
      data: { pipelineId: pipeline.id, projectId: projectId || '', status: 'running', trigger: req.body?.trigger || 'manual' }
    });

    // Respond immediately with runId so client can poll
    res.status(202).json({ runId: run.id, pipelineId: pipeline.id, status: 'running' });

    // Execute asynchronously
    executePipeline(pipeline.id, run.id, req.body?.trigger || 'manual')
      .then(async (result) => {
        await prisma.pipelineRun.update({
          where: { id: run.id },
          data: {
            status: result.status, recordsIn: result.recordsIn,
            recordsOut: result.recordsOut, errorCount: result.errorCount,
            logs: result.logs, steps: result.steps,
            finishedAt: new Date(), duration: Date.now() - run.startedAt.getTime(),
            summary: { recordsIn: result.recordsIn, recordsOut: result.recordsOut, errorCount: result.errorCount }
          }
        });
        // Final WS broadcast
        const broadcast = (global as any).broadcastToTopics;
        if (broadcast) {
          broadcast([`pipeline:${pipeline.id}`, 'pipelines:*'], {
            type: 'pipeline.complete', pipelineId: pipeline.id, runId: run.id,
            status: result.status, recordsIn: result.recordsIn, recordsOut: result.recordsOut, ts: Date.now()
          });
        }
      })
      .catch(async (err) => {
        await prisma.pipelineRun.update({
          where: { id: run.id },
          data: { status: 'failed', finishedAt: new Date(), logs: [String(err)] }
        });
      });
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// GET /api/pipelines/:id/runs — execution history
app.get('/api/pipelines/:id/runs', async (req, res) => {
  try {
    const runs = await prisma.pipelineRun.findMany({
      where: { pipelineId: req.params.id },
      orderBy: { startedAt: 'desc' }, take: 30,
      select: { id: true, status: true, trigger: true, recordsIn: true, recordsOut: true, errorCount: true, startedAt: true, finishedAt: true, duration: true, summary: true }
    });
    return res.json(runs);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// GET /api/pipelines/:id/runs/:runId — full run detail with logs + steps
app.get('/api/pipelines/:id/runs/:runId', async (req, res) => {
  try {
    const run = await prisma.pipelineRun.findUnique({ where: { id: req.params.runId } });
    if (!run) return res.status(404).json({ error: 'Run not found' });
    return res.json(run);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 11: AIP Automate — Event & Schedule-Triggered Function Execution
// ─────────────────────────────────────────────────────────────────────────────

// ── In-process automation execution engine ────────────────────────────────────
const activeSchedules: Map<string, NodeJS.Timeout> = new Map();

async function runAutomation(automationId: string, triggerType: 'schedule' | 'event' | 'webhook' | 'manual', inputOverride?: any) {
  const auto = await prisma.aIPAutomate.findUnique({ where: { id: automationId } });
  if (!auto || auto.status !== 'active') return;

  const runRecord = await prisma.aIPAutomateRun.create({
    data: { automationId, projectId: auto.projectId, status: 'running', trigger: triggerType, inputData: inputOverride ?? auto.inputParams ?? {} }
  });

  const start = Date.now();
  let outputData: any = null;
  let errorMessage: string | null = null;
  let runStatus = 'success';

  try {
    // Resolve function code
    let code = '';
    if (auto.functionId) {
      const fn = await prisma.aIPFunction.findUnique({ where: { id: auto.functionId } });
      code = fn?.code ?? '';
    }

    if (code) {
      // Execute the function code safely
      const inputData = inputOverride ?? auto.inputParams ?? {};
      const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
      const fn = new AsyncFunction('input', 'context', `"use strict";\n${code}`);
      const context = {
        projectId: auto.projectId,
        automationId, triggerType,
        timestamp: new Date().toISOString(),
      };
      outputData = await Promise.race([
        fn(inputData, context),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Execution timeout (30s)')), 30_000))
      ]);
    } else if (auto.actionId) {
      // Execute an action directly
      const action = await prisma.aIPAction.findUnique({ where: { id: auto.actionId } });
      if (action && action.status !== 'deprecated') {
        outputData = { actionExecuted: action.name, at: new Date().toISOString() };
      }
    } else {
      outputData = { message: 'No function or action bound', at: new Date().toISOString() };
    }
  } catch (err: any) {
    errorMessage = String(err?.message ?? err);
    runStatus = 'failed';
  }

  const duration = Date.now() - start;

  // Update run record
  await prisma.aIPAutomateRun.update({
    where: { id: runRecord.id },
    data: { status: runStatus, outputData, errorMessage, finishedAt: new Date(), duration }
  });

  // Update automation stats
  await prisma.aIPAutomate.update({
    where: { id: automationId },
    data: {
      totalRuns: { increment: 1 },
      ...(runStatus === 'success' ? { successRuns: { increment: 1 } } : { failedRuns: { increment: 1 } }),
      lastRunAt: new Date(),
    }
  });

  return { runId: runRecord.id, status: runStatus, duration, outputData, errorMessage };
}

function scheduleAutomation(auto: { id: string; cronExpr: string | null }) {
  if (!auto.cronExpr) return;

  // Parse cron to interval (simplified: support "*/N * * * *" patterns)
  const cronParts = auto.cronExpr.trim().split(' ');
  let intervalMs = 5 * 60 * 1000; // default 5 min

  if (cronParts.length >= 5) {
    const minutePart = cronParts[0];
    const match = minutePart.match(/^\*\/(\d+)$/);
    if (match) intervalMs = parseInt(match[1]) * 60 * 1000;
  } else if (cronParts.length >= 6) {
    // second-level cron "*/N * * * * *"
    const secPart = cronParts[0];
    const match = secPart.match(/^\*\/(\d+)$/);
    if (match) intervalMs = parseInt(match[1]) * 1000;
  }

  // Clear any existing schedule for this automation
  if (activeSchedules.has(auto.id)) clearInterval(activeSchedules.get(auto.id)!);

  const handle = setInterval(() => {
    runAutomation(auto.id, 'schedule').catch(console.error);
  }, Math.max(intervalMs, 10_000)); // minimum 10s interval

  activeSchedules.set(auto.id, handle);
  console.log(`[Automate] Scheduled ${auto.id} every ${intervalMs / 1000}s`);
}

// ── Start active schedule-based automations on server boot ────────────────────
(async () => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return;
    const schedules = await prisma.aIPAutomate.findMany({
      where: { projectId, triggerType: 'schedule', status: 'active' }
    });
    schedules.forEach((auto: any) => auto.cronExpr && scheduleAutomation(auto));
    console.log(`[Automate] Started ${schedules.length} active schedule(s)`);
  } catch { /* ignore on boot */ }
})();

// ── Event-trigger dispatcher (called from entity/action write paths) ──────────
async function dispatchAutomateEvent(projectId: string, eventType: string, payload: any) {
  try {
    const automations = await prisma.aIPAutomate.findMany({
      where: { projectId, triggerType: 'event', status: 'active', eventType }
    });
    for (const auto of automations) {
      const filter = auto.eventFilter as any;
      if (filter && filter.objectType && payload.objectType !== filter.objectType) continue;
      runAutomation(auto.id, 'event', { event: eventType, payload }).catch(console.error);
    }
  } catch { /* ignore */ }
}
// Export for use in entity update routes
(global as any).dispatchAutomateEvent = dispatchAutomateEvent;

// ── REST routes ───────────────────────────────────────────────────────────────

// GET /api/automate — list all automations for project
app.get('/api/automate', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project initialised' });
    const automations = await prisma.aIPAutomate.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });
    return res.json(automations);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// POST /api/automate — create a new automation
app.post('/api/automate', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project initialised' });
    const { name, description, triggerType, cronExpr, eventType, eventFilter, webhookPath, functionId, actionId, inputParams, status } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const automation = await prisma.aIPAutomate.create({
      data: {
        projectId, name, description: description || '',
        triggerType: triggerType || 'schedule',
        cronExpr: cronExpr || null, eventType: eventType || null,
        eventFilter: eventFilter || null, webhookPath: webhookPath || null,
        functionId: functionId || null, actionId: actionId || null,
        inputParams: inputParams || null,
        status: status || 'inactive',
      }
    });
    if (automation.status === 'active' && automation.triggerType === 'schedule' && automation.cronExpr) {
      scheduleAutomation({ id: automation.id, cronExpr: automation.cronExpr });
    }
    return res.status(201).json(automation);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// PUT /api/automate/:id — update automation
app.put('/api/automate/:id', async (req, res) => {
  try {
    const prev = await prisma.aIPAutomate.findUnique({ where: { id: req.params.id } });
    const automation = await prisma.aIPAutomate.update({
      where: { id: req.params.id },
      data: req.body,
    });

    // Re-schedule if cron details changed or status toggled to active
    if (automation.triggerType === 'schedule') {
      if (automation.status === 'active' && automation.cronExpr) {
        scheduleAutomation({ id: automation.id, cronExpr: automation.cronExpr });
      } else if (automation.status !== 'active' && activeSchedules.has(automation.id)) {
        clearInterval(activeSchedules.get(automation.id)!);
        activeSchedules.delete(automation.id);
      }
    }
    return res.json(automation);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// DELETE /api/automate/:id
app.delete('/api/automate/:id', async (req, res) => {
  try {
    if (activeSchedules.has(req.params.id)) {
      clearInterval(activeSchedules.get(req.params.id)!);
      activeSchedules.delete(req.params.id);
    }
    await prisma.aIPAutomate.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// POST /api/automate/:id/run — manually trigger an automation
app.post('/api/automate/:id/run', async (req, res) => {
  try {
    const result = await runAutomation(req.params.id, 'manual', req.body?.input);
    return res.json(result);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// GET /api/automate/:id/runs — execution history (last 50)
app.get('/api/automate/:id/runs', async (req, res) => {
  try {
    const runs = await prisma.aIPAutomateRun.findMany({
      where: { automationId: req.params.id },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
    return res.json(runs);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// POST /api/automate/webhook/:path — inbound webhook trigger
app.post('/api/automate/webhook/:path', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    const automation = await prisma.aIPAutomate.findFirst({
      where: { projectId, triggerType: 'webhook', status: 'active', webhookPath: req.params.path }
    });
    if (!automation) return res.status(404).json({ error: 'No active automation for this webhook path' });
    const result = await runAutomation(automation.id, 'webhook', req.body);
    return res.json({ received: true, runId: result?.runId });
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// GET /api/automate/summary — quick stats across all automations
app.get('/api/automate/summary', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project initialised' });
    const [total, active, recentRuns] = await Promise.all([
      prisma.aIPAutomate.count({ where: { projectId } }),
      prisma.aIPAutomate.count({ where: { projectId, status: 'active' } }),
      prisma.aIPAutomateRun.findMany({ where: { projectId }, orderBy: { startedAt: 'desc' }, take: 10 })
    ]);
    return res.json({ total, active, recentRuns });
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 10: Workshop Apps API — Persistent Application Builder
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/workshop — list all workshop apps for the project
app.get('/api/workshop', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project initialised' });
    const apps = await prisma.workshopApp.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, description: true, status: true, createdAt: true, updatedAt: true }
    });
    return res.json(apps);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// POST /api/workshop — create a new workshop app
app.post('/api/workshop', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project initialised' });
    const { name, description, status, pages } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const app = await prisma.workshopApp.create({
      data: { projectId, name, description: description || '', status: status || 'draft', pages: pages || [] }
    });
    return res.status(201).json(app);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// GET /api/workshop/:id — fetch a workshop app with full pages JSON
app.get('/api/workshop/:id', async (req, res) => {
  try {
    const app = await prisma.workshopApp.findUnique({ where: { id: req.params.id } });
    if (!app) return res.status(404).json({ error: 'Not found' });
    return res.json(app);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// PUT /api/workshop/:id — update name/description/status/pages
app.put('/api/workshop/:id', async (req, res) => {
  try {
    const { name, description, status, pages } = req.body;
    const app = await prisma.workshopApp.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(description !== undefined && { description }), ...(status && { status }), ...(pages !== undefined && { pages }) },
    });
    return res.json(app);
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// DELETE /api/workshop/:id
app.delete('/api/workshop/:id', async (req, res) => {
  try {
    await prisma.workshopApp.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// GET /api/workshop/:id/widget-data — live entity data for all widgets in the app
// This is the key endpoint: walks all widgets across all pages, resolves their
// entity bindings against CurrentEntityState, and returns live data per widget.
app.get('/api/workshop/:id/widget-data', async (req, res) => {
  try {
    const app = await prisma.workshopApp.findUnique({ where: { id: req.params.id } });
    if (!app) return res.status(404).json({ error: 'Not found' });

    const pages = (app.pages as any[]) || [];
    const widgetData: Record<string, any> = {};

    // Pre-fetch all entity types for lookup
    const entityTypes = await prisma.entityType.findMany({ select: { id: true, name: true } });
    const etByName = Object.fromEntries(entityTypes.map((et: any) => [et.name.toLowerCase(), et.id]));

    for (const page of pages) {
      for (const section of (page.sections || [])) {
        for (const widget of (section.widgets || [])) {
          const binding = widget.binding || {};
          if (!binding.objectType || binding.type === 'none' || binding.type === 'action') continue;

          const objectTypeLower = binding.objectType.toLowerCase();
          const entityTypeId = etByName[objectTypeLower];

          if (!entityTypeId) {
            widgetData[widget.id] = { type: widget.type, hasData: false, rows: [], total: 0 };
            continue;
          }

          // Fetch live entity states for this type (cap at 200)
          const states = await prisma.currentEntityState.findMany({
            where: { entityTypeId },
            orderBy: { updatedAt: 'desc' },
            take: 200,
          });

          const rows = states.map((s: any) => ({ id: s.logicalId, ...(s.data as any) }));

          if (widget.type === 'object-table' || widget.type === 'loop-layout') {
            widgetData[widget.id] = {
              type: widget.type, hasData: rows.length > 0,
              rows: rows.slice(0, 100),
              total: rows.length,
              columns: rows.length > 0 ? Object.keys(rows[0]).filter(k => k !== '__typename').slice(0, 8) : []
            };
          } else if (widget.type === 'kpi-card') {
            // KPI: aggregate the bound property
            const prop = binding.property;
            const values = prop ? rows.map((r: any) => parseFloat(r[prop])).filter((v: number) => !isNaN(v)) : [];
            const kpiValue = values.length > 0 ? (values.reduce((a: number, b: number) => a + b, 0) / values.length) : null;
            widgetData[widget.id] = {
              type: widget.type, hasData: rows.length > 0,
              value: kpiValue !== null ? Math.round(kpiValue * 10) / 10 : null,
              total: rows.length,
              property: prop || 'count',
            };
          } else if (widget.type === 'time-series-chart' || widget.type === 'bar-chart') {
            // Chart: build a time series from the property across entity states
            const prop = binding.property;
            const buckets: { label: string; value: number }[] = [];
            if (prop && rows.length > 0) {
              // Group into buckets by index
              const BUCKETS = 20;
              const bucketSize = Math.max(1, Math.ceil(rows.length / BUCKETS));
              for (let i = 0; i < Math.min(BUCKETS, rows.length); i++) {
                const slice = rows.slice(i * bucketSize, (i + 1) * bucketSize);
                const vals = slice.map((r: any) => parseFloat(r[prop])).filter((v: number) => !isNaN(v));
                const avg = vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
                buckets.push({ label: `t${i}`, value: Math.round(avg * 10) / 10 });
              }
            }
            widgetData[widget.id] = {
              type: widget.type, hasData: buckets.length > 0,
              series: buckets, total: rows.length, property: prop || '',
            };
          } else {
            widgetData[widget.id] = { type: widget.type, hasData: rows.length > 0, total: rows.length };
          }
        }
      }
    }

    return res.json({ appId: app.id, widgetData, timestamp: new Date().toISOString() });
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// POST /api/workshop/query — live filtered entity query for Workshop variable bindings
// Used by the WorkshopRuntime to propagate inter-widget state (e.g. selected row → filter)
app.post('/api/workshop/query', async (req, res) => {
  try {
    const { entityType, filterProperty, filterValue, limit = 100 } = req.body;
    if (!entityType) return res.status(400).json({ error: 'entityType required' });

    const et = await prisma.entityType.findFirst({
      where: { name: { equals: entityType, mode: 'insensitive' } }
    });
    if (!et) return res.json({ rows: [], total: 0, columns: [], hasData: false });

    const states = await prisma.currentEntityState.findMany({
      where: { entityTypeId: et.id },
      orderBy: { updatedAt: 'desc' },
      take: Math.min(limit, 500),
    });

    let rows = states.map((s: any) => ({ id: s.logicalId, ...(s.data as any) }));

    // Apply optional property filter (for inter-widget bindings)
    if (filterProperty && filterValue !== undefined && filterValue !== null && filterValue !== '') {
      rows = rows.filter((r: any) => {
        const v = r[filterProperty];
        return v !== undefined && String(v).toLowerCase().includes(String(filterValue).toLowerCase());
      });
    }

    const columns = rows.length > 0
      ? Object.keys(rows[0]).filter(k => k !== '__typename').slice(0, 10)
      : [];

    return res.json({ rows: rows.slice(0, limit), total: rows.length, columns, hasData: rows.length > 0, entityType });
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 8: AIP Actions API — Foundry-style write-back Operations
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/actions — list all action types for project
app.get('/api/actions', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project initialised' });
    const actions = await prisma.aIPAction.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(actions);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// POST /api/actions — create a new action type
app.post('/api/actions', async (req, res) => {
  try {
    const projectId = (global as any).DEFAULT_PROJECT_ID;
    if (!projectId) return res.status(503).json({ error: 'No project initialised' });
    const { name, description, category, objectType, params, rbac, approvalRules, writesTo, riskTier, status } = req.body;
    if (!name || !objectType) return res.status(400).json({ error: 'name, objectType required' });
    const action = await prisma.aIPAction.create({
      data: {
        projectId,
        name,
        description: description || '',
        category: category || 'edit',
        objectType,
        params: params || [],
        rbac: rbac || [],
        approvalRules: approvalRules || [],
        writesTo: writesTo || [],
        riskTier: riskTier || 'low',
        status: status || 'draft',
      }
    });
    return res.status(201).json(action);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// GET /api/actions/:id — get a specific action type
app.get('/api/actions/:id', async (req, res) => {
  try {
    const action = await prisma.aIPAction.findUnique({ where: { id: req.params.id } });
    if (!action) return res.status(404).json({ error: 'Action not found' });
    return res.json(action);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// PUT /api/actions/:id — update an action type
app.put('/api/actions/:id', async (req, res) => {
  try {
    const { name, description, category, objectType, params, rbac, approvalRules, writesTo, riskTier, status } = req.body;
    const action = await prisma.aIPAction.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(objectType !== undefined && { objectType }),
        ...(params !== undefined && { params }),
        ...(rbac !== undefined && { rbac }),
        ...(approvalRules !== undefined && { approvalRules }),
        ...(writesTo !== undefined && { writesTo }),
        ...(riskTier !== undefined && { riskTier }),
        ...(status !== undefined && { status }),
      }
    });
    return res.json(action);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// DELETE /api/actions/:id — delete an action type
app.delete('/api/actions/:id', async (req, res) => {
  try {
    await prisma.aIPAction.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// GET /api/actions/:id/executions — execution history for an action
app.get('/api/actions/:id/executions', async (req, res) => {
  try {
    const executions = await prisma.aIPActionExecution.findMany({
      where: { actionId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json(executions);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// POST /api/actions/:id/execute — apply an action against an entity instance
app.post('/api/actions/:id/execute', async (req, res) => {
  try {
    const action = await prisma.aIPAction.findUnique({ where: { id: req.params.id } });
    if (!action) return res.status(404).json({ error: 'Action not found' });
    if (action.status === 'deprecated') return res.status(400).json({ error: 'Action is deprecated' });

    const { logicalId, parameters, submittedBy } = req.body;
    if (!logicalId) return res.status(400).json({ error: 'logicalId of the target entity is required' });

    // Validate required params
    const paramDefs = action.params as any[];
    const missingParams = paramDefs
      .filter((p: any) => p.required && (parameters[p.name] === undefined || parameters[p.name] === null || parameters[p.name] === ''))
      .map((p: any) => p.name);
    if (missingParams.length > 0) {
      return res.status(400).json({ error: `Missing required parameters: ${missingParams.join(', ')}` });
    }

    // For low-risk actions (no approval required), apply immediately
    const needsApproval = (action.approvalRules as any[]).length > 0 && action.riskTier !== 'low';

    // Create execution log entry
    const execution = await prisma.aIPActionExecution.create({
      data: {
        actionId: action.id,
        logicalId,
        objectType: action.objectType,
        parameters,
        status: needsApproval ? 'PENDING' : 'APPLIED',
        submittedBy: submittedBy || 'system',
        appliedAt: needsApproval ? null : new Date(),
        result: needsApproval ? null : { message: 'Applied immediately (low-risk, no approval required)' },
      }
    });

    // If no approval needed, perform write-back to CurrentEntityState
    if (!needsApproval) {
      try {
        // Find the current entity state
        const currentState = await prisma.currentEntityState.findUnique({ where: { logicalId } });
        if (currentState) {
          // Build the updated data by applying the action parameters as property patches
          const currentData = currentState.data as Record<string, any>;
          const category = action.category;
          let updatedData = { ...currentData };

          if (category === 'edit') {
            // Merge action params into entity data
            const writesToFields = action.writesTo as string[];
            for (const param of paramDefs) {
              if (parameters[param.name] !== undefined) {
                // Strip "ObjectType." prefix if present (e.g. "Mission.priority" -> "priority")
                const fieldName = param.name.includes('.') ? param.name.split('.').pop() : param.name;
                if (fieldName) updatedData[fieldName] = parameters[param.name];
              }
            }
          } else if (category === 'create') {
            // For create actions, we just log the intent (entity creation goes through ingestion)
            updatedData = { ...currentData, _lastAction: action.name, _lastActionParams: parameters };
          } else if (category === 'delete') {
            updatedData = { ...currentData, status: 'DECOMMISSIONED', _deletedBy: action.name };
          } else if (category === 'link') {
            // Apply link parameters to entity state
            for (const param of paramDefs) {
              if (parameters[param.name] !== undefined) {
                const fieldName = param.name.includes('.') ? param.name.split('.').pop() : param.name;
                if (fieldName) updatedData[fieldName] = parameters[param.name];
              }
            }
          }

          // Update the CurrentEntityState projection
          await prisma.currentEntityState.update({
            where: { logicalId },
            data: { data: updatedData, updatedAt: new Date() }
          });

          // Update execution result with what changed
          await prisma.aIPActionExecution.update({
            where: { id: execution.id },
            data: { result: { changedFields: Object.keys(updatedData).filter(k => updatedData[k] !== currentData[k]), updatedData } }
          });
        }
      } catch (writeErr) {
        logger.warn({ writeErr, logicalId }, 'Could not apply write-back to CurrentEntityState');
      }
    }

    // Increment usage counter
    await prisma.aIPAction.update({
      where: { id: action.id },
      data: { usages: { increment: 1 }, lastUsedAt: new Date() }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        actor: submittedBy || 'system',
        actorRole: 'OPERATOR',
        action: `EXECUTE_ACTION:${action.name}`,
        resourceType: 'AIPAction',
        resourceId: action.id,
        after: { logicalId, parameters, executionId: execution.id, status: execution.status },
      }
    });

    return res.json({
      executionId: execution.id,
      status: execution.status,
      needsApproval,
      message: needsApproval
        ? `Action submitted for approval. ${(action.approvalRules as any[]).length} approval rule(s) apply.`
        : `Action applied successfully to entity ${logicalId}.`
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});


// ── Real-time entity publish endpoint ────────────────────────────────────────
// POST /api/entities/publish — push an entity change event to all WS subscribers.
// Called by integration pipelines, data jobs, or any external system that writes entities.
app.post('/api/entities/publish', async (req, res) => {
  try {
    const { objectType, logicalId, data, changeType } = req.body;
    if (!objectType || !logicalId) return res.status(400).json({ error: 'objectType and logicalId required' });

    // Also write/update the entity in the DB if data is provided
    if (data) {
      const projectId = (global as any).DEFAULT_PROJECT_ID;
      const entityType = await prisma.entityType.findFirst({ where: { name: objectType } });
      if (entityType && projectId) {
        await prisma.currentEntityState.upsert({
          where: { entityTypeId_logicalId: { entityTypeId: entityType.id, logicalId } },
          create: { entityTypeId: entityType.id, logicalId, projectId, data },
          update: { data, updatedAt: new Date() },
        });
      }
    }

    // Broadcast to all WS clients subscribed to this entity type
    const broadcast = (global as any).broadcastEntityChange;
    const delivered = broadcast ? (() => {
      broadcast(objectType, logicalId, data || {}, changeType || 'updated');
      return true;
    })() : false;

    return res.json({ published: true, objectType, logicalId, delivered });
  } catch (err) { return res.status(500).json({ error: String(err) }); }
});

// GET /api/entities/live-stream — info about how to connect to the WS
app.get('/api/entities/live-stream', (req, res) => {
  return res.json({
    wsUrl: `ws://localhost:${process.env.PORT || 3001}`,
    protocol: 'aip-ontology-v1',
    topics: {
      'entities:<ObjectType>': 'Live entity state changes for one object type',
      'entities:*': 'All entity changes across all types',
      'metrics:*': 'Metric threshold breach events',
      'actions:*': 'Action execution events',
      'events:*': 'All events (default subscription)',
    },
    subscribe: { subscribe: ['entities:Drone', 'metrics:*'] },
    clients: wsClients.size,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 12: Real-time WebSocket Push — Live Ontology Updates
// ─────────────────────────────────────────────────────────────────────────────

// ── Connection registry ───────────────────────────────────────────────────────
interface WSClient {
  ws: WebSocket;
  id: string;
  subscriptions: Set<string>; // topic strings e.g. "entities:Drone", "metrics:*", "events:*"
  connectedAt: Date;
}

const wsClients = new Map<string, WSClient>();

// ── Broadcast helpers ─────────────────────────────────────────────────────────

/** Broadcast a message to all clients subscribed to at least one of the given topics */
function broadcastToTopics(topics: string[], payload: any) {
  const msg = JSON.stringify(payload);
  let count = 0;
  for (const client of wsClients.values()) {
    if (client.ws.readyState !== WebSocket.OPEN) continue;
    const interested = topics.some(t => {
      if (client.subscriptions.has(t)) return true;
      if (client.subscriptions.has('*')) return true;
      // wildcard prefix match: "entities:*" matches "entities:Drone"
      for (const sub of client.subscriptions) {
        if (sub.endsWith(':*') && t.startsWith(sub.slice(0, -1))) return true;
      }
      return false;
    });
    if (interested) { client.ws.send(msg); count++; }
  }
  return count;
}

/** Called after any entity upsert — pushes live update to subscribed clients */
function broadcastEntityChange(objectType: string, logicalId: string, data: any, changeType: 'created' | 'updated' | 'deleted' = 'updated') {
  broadcastToTopics(
    [`entities:${objectType}`, 'entities:*', 'events:*'],
    { type: 'entity.change', changeType, objectType, logicalId, data, ts: Date.now() }
  );
  // Also fire the automate event dispatcher
  const dispatch = (global as any).dispatchAutomateEvent;
  if (dispatch) {
    dispatch((global as any).DEFAULT_PROJECT_ID, `entity.${changeType}`, { objectType, logicalId, data }).catch(() => { });
  }
}

/** Called after a metric threshold breach */
function broadcastMetricAlert(metricId: string, metricName: string, value: number, threshold: number) {
  broadcastToTopics(
    [`metrics:${metricId}`, 'metrics:*', 'events:*'],
    { type: 'metric.threshold_breached', metricId, metricName, value, threshold, ts: Date.now() }
  );
}

/** Called after an action execution */
function broadcastActionEvent(actionName: string, logicalId: string, executionId: string, status: string) {
  broadcastToTopics(
    ['actions:*', 'events:*'],
    { type: 'action.executed', actionName, logicalId, executionId, status, ts: Date.now() }
  );
}

// Export broadcast helpers for use in other parts of server.ts
(global as any).broadcastToTopics = broadcastToTopics;
(global as any).broadcastEntityChange = broadcastEntityChange;
(global as any).broadcastMetricAlert = broadcastMetricAlert;
(global as any).broadcastActionEvent = broadcastActionEvent;

// ── WebSocket server bootstrap (attached on server listen) ────────────────────
let wss: WebSocketServer | null = null;

function initWebSocketServer(httpServer: any) {
  wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws, req) => {
    const clientId = randomUUID();
    const client: WSClient = { ws, id: clientId, subscriptions: new Set(['events:*']), connectedAt: new Date() };
    wsClients.set(clientId, client);
    logger.info(`[WS] Client connected: ${clientId} (total: ${wsClients.size})`);

    // Send welcome
    ws.send(JSON.stringify({ type: 'connected', clientId, ts: Date.now() }));

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.subscribe) {
          // Support single topic or array of topics
          const topics: string[] = Array.isArray(msg.subscribe) ? msg.subscribe : [msg.subscribe];
          topics.forEach(t => client.subscriptions.add(t));
          ws.send(JSON.stringify({ type: 'subscribed', topics: [...client.subscriptions], ts: Date.now() }));
        }
        if (msg.unsubscribe) {
          const topics: string[] = Array.isArray(msg.unsubscribe) ? msg.unsubscribe : [msg.unsubscribe];
          topics.forEach(t => client.subscriptions.delete(t));
          ws.send(JSON.stringify({ type: 'unsubscribed', topics: [...client.subscriptions], ts: Date.now() }));
        }
        if (msg.ping) {
          ws.send(JSON.stringify({ type: 'pong', ts: Date.now() }));
        }
      } catch { /* ignore malformed messages */ }
    });

    ws.on('close', () => {
      wsClients.delete(clientId);
      logger.info(`[WS] Client disconnected: ${clientId} (remaining: ${wsClients.size})`);
    });

    ws.on('error', (err) => {
      logger.warn({ err }, `[WS] Client error: ${clientId}`);
      wsClients.delete(clientId);
    });
  });

  logger.info('[WS] WebSocket server attached to HTTP server');
}

// ── REST monitoring endpoints ─────────────────────────────────────────────────

// GET /api/ws/stats — WebSocket connection stats
app.get('/api/ws/stats', (req, res) => {
  const clients = [...wsClients.values()].map(c => ({
    id: c.id, subscriptions: [...c.subscriptions],
    connectedAt: c.connectedAt, readyState: c.ws.readyState
  }));
  return res.json({ total: wsClients.size, clients });
});

// POST /api/ws/broadcast — manual broadcast for testing
app.post('/api/ws/broadcast', (req, res) => {
  const { topics, payload } = req.body;
  if (!topics || !payload) return res.status(400).json({ error: 'topics and payload required' });
  const count = broadcastToTopics(Array.isArray(topics) ? topics : [topics], payload);
  return res.json({ delivered: count });
});

// ── Error Handler (must be last middleware) ──────────────────────
app.use(errorHandler());


// ── Server & Graceful Shutdown ───────────────────────────────────

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`Server listening on http://0.0.0.0:${PORT}`);

  // ── Attach WebSocket server to the same HTTP server ──────────────────────
  initWebSocketServer(server);

  try {
    let proj = await prisma.project.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!proj) {
      proj = await prisma.project.create({
        data: { name: 'Default Workspace', description: 'Auto-generated default workspace' }
      });
      logger.info(`Created default project: ${proj.id}`);
    }
    (global as any).DEFAULT_PROJECT_ID = proj.id;
  } catch (err) {
    logger.error({ err }, 'Failed to create default project');
  }

  // Start the lightweight job scheduler
  startScheduler(prisma);

  // Start the telemetry rollup scheduler
  startRollupScheduler(prisma);

  // Start the relationship confidence decay scheduler
  startConfidenceDecayScheduler(prisma);
});

// Graceful shutdown handler
function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed');
    await prisma.$disconnect();
    logger.info('Database pool closed');
    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
