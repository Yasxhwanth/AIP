-- CreateTable
CREATE TABLE "ComputedMetricDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityTypeId" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "unit" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComputedMetricDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelemetryRollup" (
    "id" TEXT NOT NULL,
    "logicalId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "windowSize" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "avg" DOUBLE PRECISION NOT NULL,
    "min" DOUBLE PRECISION NOT NULL,
    "max" DOUBLE PRECISION NOT NULL,
    "sum" DOUBLE PRECISION NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "TelemetryRollup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ComputedMetricDefinition_entityTypeId_idx" ON "ComputedMetricDefinition"("entityTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "ComputedMetricDefinition_entityTypeId_name_key" ON "ComputedMetricDefinition"("entityTypeId", "name");

-- CreateIndex
CREATE INDEX "TelemetryRollup_logicalId_metric_windowSize_windowStart_idx" ON "TelemetryRollup"("logicalId", "metric", "windowSize", "windowStart" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "TelemetryRollup_logicalId_metric_windowSize_windowStart_key" ON "TelemetryRollup"("logicalId", "metric", "windowSize", "windowStart");

-- AddForeignKey
ALTER TABLE "ComputedMetricDefinition" ADD CONSTRAINT "ComputedMetricDefinition_entityTypeId_fkey" FOREIGN KEY ("entityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
