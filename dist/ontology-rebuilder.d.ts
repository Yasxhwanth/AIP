import { PrismaClient } from './generated/prisma';
export declare class OntologyRebuilder {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Reconstructs the CurrentEntityState projection from the DomainEvent log.
     * This is a "scratch and rebuild" operation.
     * Atomic swap is simulated here by using a transaction or a separate table (if schema supported).
     * For this implementation, we clear and rebuild within a transaction to maintain consistency.
     */
    rebuildProjectOntology(projectId: string): Promise<{
        success: boolean;
        processedCount: number;
    }>;
}
//# sourceMappingURL=ontology-rebuilder.d.ts.map