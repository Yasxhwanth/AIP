-- CreateTable
CREATE TABLE "PolicyDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "entityTypeId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL DEFAULT 'EntityStateChanged',
    "condition" JSONB NOT NULL,
    "actionType" TEXT NOT NULL DEFAULT 'EmitAlert',
    "actionConfig" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'warning',
    "policyId" TEXT NOT NULL,
    "entityTypeId" TEXT NOT NULL,
    "logicalId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PolicyDefinition_name_key" ON "PolicyDefinition"("name");

-- CreateIndex
CREATE INDEX "PolicyDefinition_entityTypeId_eventType_idx" ON "PolicyDefinition"("entityTypeId", "eventType");

-- CreateIndex
CREATE INDEX "Alert_entityTypeId_logicalId_idx" ON "Alert"("entityTypeId", "logicalId");

-- CreateIndex
CREATE INDEX "Alert_alertType_idx" ON "Alert"("alertType");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");
