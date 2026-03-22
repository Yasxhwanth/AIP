"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runReasonerForEntity = runReasonerForEntity;
exports.runFullReasoner = runFullReasoner;
// ── Core Traversal ────────────────────────────────────────────────────────────
/**
 * Traverses the CurrentGraph following a single antecedent hop.
 * Returns the logicalIds reachable from a given start node.
 */
async function traverseHop(startLogicalIds, hop, prisma) {
    // Returns a map of targetLogicalId -> confidence (product along the path)
    const results = new Map();
    if (startLogicalIds.length === 0)
        return results;
    const edges = await prisma.currentGraph.findMany({
        where: {
            relationshipDefinitionId: hop.relDefId,
            ...(hop.direction === 'outgoing'
                ? { sourceLogicalId: { in: startLogicalIds } }
                : { targetLogicalId: { in: startLogicalIds } }),
        },
    });
    for (const edge of edges) {
        const reachedId = hop.direction === 'outgoing'
            ? edge.targetLogicalId
            : edge.sourceLogicalId;
        // Keep the minimum confidence along the path (weakest link semantics)
        const existing = results.get(reachedId) ?? 1.0;
        results.set(reachedId, Math.min(existing, edge.confidence));
    }
    return results;
}
/**
 * For a single source entity, follows all antecedent hops of a rule
 * and collects (target, pathConfidence) pairs.
 */
async function traverseRule(sourceLogicalId, rule, prisma) {
    // Track { logicalId -> accumulated path confidence }
    let currentLayer = new Map([[sourceLogicalId, 1.0]]);
    for (const hop of rule.antecedent) {
        const starts = [...currentLayer.keys()];
        const reachable = await traverseHop(starts, hop, prisma);
        if (reachable.size === 0)
            return [];
        // Multiply path confidences
        const nextLayer = new Map();
        for (const [reached, hopConf] of reachable.entries()) {
            // Find path confidence that led here
            let bestPathConf = 0;
            for (const [start, pathConf] of currentLayer.entries()) {
                // Check if 'start' can reach 'reached' via this hop
                const check = await prisma.currentGraph.findFirst({
                    where: {
                        relationshipDefinitionId: hop.relDefId,
                        ...(hop.direction === 'outgoing'
                            ? { sourceLogicalId: start, targetLogicalId: reached }
                            : { sourceLogicalId: reached, targetLogicalId: start }),
                    },
                });
                if (check) {
                    bestPathConf = Math.max(bestPathConf, Math.min(pathConf, hopConf));
                }
            }
            if (bestPathConf > 0) {
                nextLayer.set(reached, Math.max((nextLayer.get(reached) ?? 0), bestPathConf));
            }
        }
        currentLayer = nextLayer;
        if (currentLayer.size === 0)
            return [];
    }
    // Remove self-loops (don't derive sourceLogicalId → sourceLogicalId)
    currentLayer.delete(sourceLogicalId);
    return [...currentLayer.entries()].map(([targetLogicalId, pathConfidence]) => ({
        targetLogicalId,
        pathConfidence,
    }));
}
// ── Upsert Derived Relationship ───────────────────────────────────────────────
async function upsertDerivedRelationship(rule, sourceLogicalId, targetLogicalId, pathConfidence, projectId, prisma) {
    const derivedConfidence = Math.min((rule.consequent.confidence ?? 1.0) * pathConfidence, 1.0);
    const existing = await prisma.currentGraph.findUnique({
        where: {
            relationshipDefinitionId_sourceLogicalId_targetLogicalId: {
                relationshipDefinitionId: rule.consequent.relDefId,
                sourceLogicalId,
                targetLogicalId,
            },
        },
    });
    if (existing) {
        // Update confidence if our derived value is higher
        if (derivedConfidence > existing.confidence) {
            await prisma.currentGraph.update({
                where: { id: existing.id },
                data: {
                    confidence: derivedConfidence,
                    baseConfidence: derivedConfidence,
                    lastObservedAt: new Date(),
                },
            });
        }
        return { isNew: false };
    }
    else {
        await prisma.currentGraph.create({
            data: {
                relationshipDefinitionId: rule.consequent.relDefId,
                relationshipName: `[derived:${rule.name}]`,
                sourceLogicalId,
                targetLogicalId,
                confidence: derivedConfidence,
                baseConfidence: derivedConfidence,
                decayRate: rule.consequent.decayRate ?? 0.0,
                lastObservedAt: new Date(),
                projectId,
            },
        });
        return { isNew: true };
    }
}
// ── Public API ────────────────────────────────────────────────────────────────
/**
 * Run all enabled OntologyRules for a specific entity.
 * Called after any entity state change.
 */
async function runReasonerForEntity(logicalId, projectId, prisma) {
    const rules = await prisma.ontologyRule.findMany({
        where: { projectId, enabled: true },
    });
    const derived = [];
    for (const rule of rules) {
        const antecedent = rule.antecedent;
        const consequent = rule.consequent;
        const ruleData = {
            id: rule.id,
            name: rule.name,
            antecedent,
            consequent,
            enabled: rule.enabled,
        };
        const targets = await traverseRule(logicalId, ruleData, prisma);
        for (const { targetLogicalId, pathConfidence } of targets) {
            const { isNew } = await upsertDerivedRelationship(ruleData, logicalId, targetLogicalId, pathConfidence, projectId, prisma);
            derived.push({
                ruleId: rule.id,
                ruleName: rule.name,
                relDefId: consequent.relDefId,
                sourceLogicalId: logicalId,
                targetLogicalId,
                confidence: Math.min((consequent.confidence ?? 1.0) * pathConfidence, 1.0),
                isNew,
            });
        }
    }
    return derived;
}
/**
 * Run all enabled OntologyRules across all entities in a project.
 * This is the "full re-materialization" — expensive, run as a background job.
 */
async function runFullReasoner(projectId, prisma) {
    const rules = await prisma.ontologyRule.findMany({
        where: { projectId, enabled: true },
    });
    if (rules.length === 0) {
        return { rulesRun: 0, derivedTotal: 0, derivedNew: 0 };
    }
    // Get all unique logicalIds in the graph for this project's entity types
    const entityTypes = await prisma.entityType.findMany({
        where: { projectId },
        select: { id: true },
    });
    const entityTypeIds = entityTypes.map(e => e.id);
    const currentStates = await prisma.currentEntityState.findMany({
        where: { entityTypeId: { in: entityTypeIds } },
        select: { logicalId: true },
    });
    let derivedTotal = 0;
    let derivedNew = 0;
    for (const { logicalId } of currentStates) {
        const results = await runReasonerForEntity(logicalId, projectId, prisma);
        derivedTotal += results.length;
        derivedNew += results.filter(r => r.isNew).length;
    }
    return { rulesRun: rules.length, derivedTotal, derivedNew };
}
//# sourceMappingURL=ontology-reasoner.js.map