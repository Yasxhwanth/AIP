/*
  Warnings:

  - You are about to drop the column `createdAt` on the `RelationshipInstance` table. All the data in the column will be lost.
  - Added the required column `validFrom` to the `RelationshipInstance` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RelationshipInstance_relationshipDefinitionId_sourceLogical_key";

-- DropIndex
DROP INDEX "RelationshipInstance_sourceLogicalId_idx";

-- DropIndex
DROP INDEX "RelationshipInstance_targetLogicalId_idx";

-- AlterTable
ALTER TABLE "RelationshipInstance" DROP COLUMN "createdAt",
ADD COLUMN     "transactionTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validTo" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "RelationshipInstance_sourceLogicalId_validFrom_validTo_idx" ON "RelationshipInstance"("sourceLogicalId", "validFrom", "validTo");

-- CreateIndex
CREATE INDEX "RelationshipInstance_targetLogicalId_validFrom_validTo_idx" ON "RelationshipInstance"("targetLogicalId", "validFrom", "validTo");

-- CreateIndex
CREATE INDEX "RelationshipInstance_relationshipDefinitionId_sourceLogical_idx" ON "RelationshipInstance"("relationshipDefinitionId", "sourceLogicalId", "targetLogicalId");
