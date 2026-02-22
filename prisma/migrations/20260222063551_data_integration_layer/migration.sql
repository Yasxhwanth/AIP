-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "connectionConfig" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationJob" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "targetEntityTypeId" TEXT NOT NULL,
    "fieldMapping" JSONB NOT NULL,
    "logicalIdField" TEXT NOT NULL,
    "schedule" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobExecution" (
    "id" TEXT NOT NULL,
    "integrationJobId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsFailed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "JobExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_name_key" ON "DataSource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationJob_name_key" ON "IntegrationJob"("name");

-- CreateIndex
CREATE INDEX "IntegrationJob_dataSourceId_idx" ON "IntegrationJob"("dataSourceId");

-- CreateIndex
CREATE INDEX "IntegrationJob_targetEntityTypeId_idx" ON "IntegrationJob"("targetEntityTypeId");

-- CreateIndex
CREATE INDEX "JobExecution_integrationJobId_startedAt_idx" ON "JobExecution"("integrationJobId", "startedAt" DESC);

-- AddForeignKey
ALTER TABLE "IntegrationJob" ADD CONSTRAINT "IntegrationJob_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationJob" ADD CONSTRAINT "IntegrationJob_targetEntityTypeId_fkey" FOREIGN KEY ("targetEntityTypeId") REFERENCES "EntityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobExecution" ADD CONSTRAINT "JobExecution_integrationJobId_fkey" FOREIGN KEY ("integrationJobId") REFERENCES "IntegrationJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
