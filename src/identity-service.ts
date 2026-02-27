import { PrismaClient } from './generated/prisma/client';

/**
 * IdentityService handles the resolution of external IDs into the platform's 
 * internal 'logicalId'. This is the core of our Entity Resolution (ER) engine.
 */
export class IdentityService {
  /**
   * Resolves an external record's identity to a platform logicalId.
   * 1. Checks for an explicit EntityAlias.
   * 2. (Future) Perform fuzzy matching on attributes.
   */
  static async resolveLogicalId(
    sourceSystem: string,
    externalId: string,
    prisma: PrismaClient
  ): Promise<{ logicalId: string; confidence: number } | null> {
    const alias = await prisma.entityAlias.findUnique({
      where: {
        sourceSystem_externalId: {
          sourceSystem,
          externalId
        }
      }
    });

    if (alias) {
      return { logicalId: alias.targetLogicalId, confidence: alias.confidence };
    }

    return null;
  }

  /**
   * Explicitly links an external identity to an internal logicalId.
   */
  static async registerAlias(
    sourceSystem: string,
    externalId: string,
    targetLogicalId: string,
    confidence: number,
    prisma: PrismaClient
  ) {
    return prisma.entityAlias.upsert({
      where: {
        sourceSystem_externalId: {
          sourceSystem,
          externalId
        }
      },
      update: {
        targetLogicalId,
        confidence
      },
      create: {
        sourceSystem,
        externalId,
        targetLogicalId,
        confidence
      }
    });
  }
}
