import 'dotenv/config';
import express from 'express';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from './generated/prisma/client';
import { evaluatePolicies } from './policy-engine';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const app = express();

app.use(express.json());

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
  } catch (error: any) {
    if (error?.code === 'P2002') {
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
    const where: any = {
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

    const where: any = {};
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

    const where: any = {};
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
    const temporalFilter: any = {};

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
  } catch (error: any) {
    if (error?.code === 'P2002') {
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

    const where: any = {};
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

app.post('/telemetry', async (req, res) => {
  try {
    const { logicalId, metrics } = req.body;

    if (!logicalId || !Array.isArray(metrics)) {
      return res.status(400).json({ error: 'logicalId and metrics array are required' });
    }

    // Fast append-only batch insert
    const created = await prisma.timeseriesMetric.createMany({
      data: metrics.map((m: any) => ({
        logicalId,
        metric: m.metric,
        value: Number(m.value),
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      })),
    });

    return res.status(201).json({ inserted: created.count });
  } catch (error) {
    return res.status(500).json({ error: 'failed to ingest telemetry', details: String(error) });
  }
});

app.get('/telemetry/:logicalId', async (req, res) => {
  try {
    const { logicalId } = req.params;
    const { metric, from, to, aggregate } = req.query;

    const where: any = { logicalId };

    if (metric) {
      where.metric = metric;
    }

    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from as string);
      if (to) where.timestamp.lte = new Date(to as string);
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

      const aggQuery: any = {};
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

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});


