"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityService = void 0;
/**
 * IdentityService handles the resolution of external IDs into the platform's
 * internal 'logicalId'. This is the core of our Entity Resolution (ER) engine.
 */
class IdentityService {
    /**
     * Resolves an external record's identity to a platform logicalId.
     * 1. Checks for an explicit EntityAlias.
     * 2. (Future) Perform fuzzy matching on attributes.
     */
    static async resolveLogicalId(sourceSystem, externalId, prisma) {
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
    static async registerAlias(sourceSystem, externalId, targetLogicalId, confidence, prisma) {
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
exports.IdentityService = IdentityService;
//# sourceMappingURL=identity-service.js.map