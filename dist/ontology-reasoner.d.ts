import { PrismaClient } from './generated/prisma';
interface DerivedRelationship {
    ruleId: string;
    ruleName: string;
    relDefId: string;
    sourceLogicalId: string;
    targetLogicalId: string;
    confidence: number;
    isNew: boolean;
}
/**
 * Run all enabled OntologyRules for a specific entity.
 * Called after any entity state change.
 */
export declare function runReasonerForEntity(logicalId: string, projectId: string, prisma: PrismaClient): Promise<DerivedRelationship[]>;
/**
 * Run all enabled OntologyRules across all entities in a project.
 * This is the "full re-materialization" — expensive, run as a background job.
 */
export declare function runFullReasoner(projectId: string, prisma: PrismaClient): Promise<{
    rulesRun: number;
    derivedTotal: number;
    derivedNew: number;
}>;
export {};
//# sourceMappingURL=ontology-reasoner.d.ts.map