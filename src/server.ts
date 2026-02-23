import 'dotenv/config';
import express from 'express';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from './generated/prisma/client';
import { evaluatePolicies } from './policy-engine';
import { executeJob, startScheduler } from './data-integration';
import { evaluateComputedMetrics } from './computed-metrics';
import { computeRollups, computeAllRecentRollups, startRollupScheduler } from './rollup-engine';
import { runInference, runInferenceByModel, runAllModelsForEntity } from './inference-engine';
import { executeDecision, evaluateAllRules } from './decision-engine';
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

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const app = express();

// ── Enterprise Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(correlationId());
app.use(requestLogger());
app.use(apiKeyAuth(prisma));
app.use(createRateLimiter());

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
  } catch (error) {
    return res.status(500).json({
      error: 'failed to create next entity type version',
      details: String(error),
    });
  }
});

// ── Entity Instances ─────────────────────────────────────────────

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
        name,
        dataSourceId,
        targetEntityTypeId,
        fieldMapping: fieldMapping as Prisma.InputJsonValue,
        logicalIdField,
        schedule: schedule ?? null,
      },
      include: { dataSource: true, targetEntityType: true },
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

    const result = await executeJob(req.params.id, prisma, data);
    const statusCode = result.status === 'COMPLETED' ? 200 : 500;

    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'failed to execute job', details: String(error) });
  }
});

app.get('/integration-jobs/:id/executions', async (req, res) => {
  try {
    const job = await prisma.integrationJob.findUnique({ where: { id: req.params.id } });
    if (!job) {
      return res.status(404).json({ error: 'integration job not found' });
    }

    const executions = await prisma.jobExecution.findMany({
      where: { integrationJobId: req.params.id },
      orderBy: { startedAt: 'desc' },
    });

    return res.json(executions);
  } catch (error) {
    return res.status(500).json({ error: 'failed to list executions', details: String(error) });
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

// ── Error Handler ────────────────────────────────────────────────

app.use(errorHandler());

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server listening on http://0.0.0.0:${PORT}`);

  // Start the lightweight job scheduler
  startScheduler(prisma);

  // Start the telemetry rollup scheduler
  startRollupScheduler(prisma);
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
