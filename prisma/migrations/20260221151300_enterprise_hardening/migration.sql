-- Enterprise Hardening Migration

-- 1. Idempotency key on DomainEvent
ALTER TABLE "DomainEvent" ADD COLUMN "idempotencyKey" TEXT;
CREATE UNIQUE INDEX "DomainEvent_idempotencyKey_key" ON "DomainEvent"("idempotencyKey");

-- 2. Policy versioning
ALTER TABLE "PolicyDefinition" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

-- 3. Alert audit fields
ALTER TABLE "Alert" ADD COLUMN "policyVersion" INTEGER;
ALTER TABLE "Alert" ADD COLUMN "eventId" TEXT;
ALTER TABLE "Alert" ADD COLUMN "evaluationTrace" JSONB;
CREATE UNIQUE INDEX "Alert_eventId_policyId_key" ON "Alert"("eventId", "policyId");

-- 4. CQRS Read Models
CREATE TABLE "CurrentEntityState" (
    "logicalId" TEXT NOT NULL,
    "entityTypeId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CurrentEntityState_pkey" PRIMARY KEY ("logicalId")
);
CREATE INDEX "CurrentEntityState_entityTypeId_idx" ON "CurrentEntityState"("entityTypeId");

CREATE TABLE "CurrentGraph" (
    "id" TEXT NOT NULL,
    "relationshipDefinitionId" TEXT NOT NULL,
    "relationshipName" TEXT NOT NULL,
    "sourceLogicalId" TEXT NOT NULL,
    "targetLogicalId" TEXT NOT NULL,
    "properties" JSONB,
    CONSTRAINT "CurrentGraph_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CurrentGraph_relationshipDefinitionId_sourceLogicalId_targetLogicalId_key" ON "CurrentGraph"("relationshipDefinitionId", "sourceLogicalId", "targetLogicalId");
CREATE INDEX "CurrentGraph_sourceLogicalId_idx" ON "CurrentGraph"("sourceLogicalId");
CREATE INDEX "CurrentGraph_targetLogicalId_idx" ON "CurrentGraph"("targetLogicalId");

-- 5. DB-Level Invariants (Partial Unique Indexes)
CREATE UNIQUE INDEX "idx_one_active_entity"
    ON "EntityInstance" ("entityTypeId", "logicalId")
    WHERE "validTo" IS NULL;

CREATE UNIQUE INDEX "idx_one_active_relationship"
    ON "RelationshipInstance" ("relationshipDefinitionId", "sourceLogicalId", "targetLogicalId")
    WHERE "validTo" IS NULL;
