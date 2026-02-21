-- CreateTable
CREATE TABLE "RelationshipInstance" (
    "id" TEXT NOT NULL,
    "relationshipDefinitionId" TEXT NOT NULL,
    "sourceLogicalId" TEXT NOT NULL,
    "targetLogicalId" TEXT NOT NULL,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelationshipInstance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RelationshipInstance_sourceLogicalId_idx" ON "RelationshipInstance"("sourceLogicalId");

-- CreateIndex
CREATE INDEX "RelationshipInstance_targetLogicalId_idx" ON "RelationshipInstance"("targetLogicalId");

-- CreateIndex
CREATE UNIQUE INDEX "RelationshipInstance_relationshipDefinitionId_sourceLogical_key" ON "RelationshipInstance"("relationshipDefinitionId", "sourceLogicalId", "targetLogicalId");

-- AddForeignKey
ALTER TABLE "RelationshipInstance" ADD CONSTRAINT "RelationshipInstance_relationshipDefinitionId_fkey" FOREIGN KEY ("relationshipDefinitionId") REFERENCES "RelationshipDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
