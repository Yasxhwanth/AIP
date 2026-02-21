-- EntityType governance + hierarchy + semantic identifiers
ALTER TABLE "EntityType"
  ADD COLUMN "semanticUri" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN "owner" TEXT,
  ADD COLUMN "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "effectiveTo" TIMESTAMP(3),
  ADD COLUMN "deprecatedAt" TIMESTAMP(3),
  ADD COLUMN "parentTypeId" TEXT;

CREATE UNIQUE INDEX "EntityType_semanticUri_key" ON "EntityType"("semanticUri");
CREATE INDEX "EntityType_parentTypeId_idx" ON "EntityType"("parentTypeId");
CREATE INDEX "EntityType_status_idx" ON "EntityType"("status");

ALTER TABLE "EntityType"
  ADD CONSTRAINT "EntityType_parentTypeId_fkey"
  FOREIGN KEY ("parentTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Attribute semantic constraints
ALTER TABLE "AttributeDefinition"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "unit" TEXT,
  ADD COLUMN "regexPattern" TEXT,
  ADD COLUMN "minValue" DOUBLE PRECISION,
  ADD COLUMN "maxValue" DOUBLE PRECISION,
  ADD COLUMN "defaultValue" JSONB,
  ADD COLUMN "allowedValues" JSONB;

-- Relationship semantics
ALTER TABLE "RelationshipDefinition"
  ADD COLUMN "semanticUri" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "inverseName" TEXT,
  ADD COLUMN "minSourceCardinality" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "maxSourceCardinality" INTEGER,
  ADD COLUMN "minTargetCardinality" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "maxTargetCardinality" INTEGER,
  ADD COLUMN "symmetric" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "transitive" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "composition" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "RelationshipDefinition_semanticUri_key" ON "RelationshipDefinition"("semanticUri");

-- Metric ontology linked to entity types
CREATE TABLE "MetricDefinition" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "semanticUri" TEXT,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "unit" TEXT,
  "dataType" TEXT NOT NULL DEFAULT 'float',
  "minValue" DOUBLE PRECISION,
  "maxValue" DOUBLE PRECISION,
  "required" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "entityTypeId" TEXT NOT NULL,
  CONSTRAINT "MetricDefinition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MetricDefinition_semanticUri_key" ON "MetricDefinition"("semanticUri");
CREATE UNIQUE INDEX "MetricDefinition_entityTypeId_key_key" ON "MetricDefinition"("entityTypeId", "key");
CREATE INDEX "MetricDefinition_status_idx" ON "MetricDefinition"("status");

ALTER TABLE "MetricDefinition"
  ADD CONSTRAINT "MetricDefinition_entityTypeId_fkey"
  FOREIGN KEY ("entityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
