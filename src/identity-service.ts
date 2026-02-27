import { PrismaClient } from './generated/prisma/client';

// ── Fuzzy Matching Utilities ──────────────────────────────────────

/**
 * Normalized Levenshtein distance (0 = identical, 1 = completely different).
 */
function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (!a || !b) return 0.0;

  const la = a.toLowerCase().trim();
  const lb = b.toLowerCase().trim();

  const n = la.length;
  const m = lb.length;
  const dp: number[][] = [];
  for (let i = 0; i <= n; i++) {
    dp[i] = [];
    for (let j = 0; j <= m; j++) {
      dp[i]![j] = i === 0 ? j : j === 0 ? i : 0;
    }
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (la[i - 1] === lb[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] = 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
      }
    }
  }

  const dist = dp[n]![m]!;
  const maxLen = Math.max(n, m);
  return maxLen === 0 ? 1.0 : 1.0 - dist / maxLen;
}

/**
 * Jaccard similarity on token sets (good for multi-word names/addresses).
 */
function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  const intersection = [...setA].filter(t => setB.has(t)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 1.0 : intersection / union;
}

/**
 * Combined string similarity: max of Levenshtein and Jaccard.
 */
function stringSimilarity(a: unknown, b: unknown): number {
  if (a === null || a === undefined || b === null || b === undefined) return 0;
  const sa = String(a);
  const sb = String(b);
  return Math.max(levenshteinSimilarity(sa, sb), jaccardSimilarity(sa, sb));
}

/**
 * Numeric similarity with a tolerance window.
 */
function numericSimilarity(a: unknown, b: unknown, tolerancePct = 0.05): number {
  const na = parseFloat(String(a));
  const nb = parseFloat(String(b));
  if (isNaN(na) || isNaN(nb)) return 0;
  if (na === 0 && nb === 0) return 1;
  const diff = Math.abs(na - nb) / Math.max(Math.abs(na), Math.abs(nb));
  return diff <= tolerancePct ? 1.0 - diff / tolerancePct : 0.0;
}

// ── Field Candidate Scoring ───────────────────────────────────────

export interface MatchScore {
  overall: number;
  breakdown: Record<string, number>;
  reasons: string[];
}

/**
 * Scores similarity between two entity data objects.
 * Uses a weighted combination across matched fields.
 *
 * Fields named "lat"/"lon"/"latitude"/"longitude" use numeric tolerance.
 * All others use string similarity.
 */
export function scoreEntitySimilarity(
  dataA: Record<string, unknown>,
  dataB: Record<string, unknown>
): MatchScore {
  const geoFields = new Set(['lat', 'lon', 'latitude', 'longitude', 'x', 'y']);
  const highWeightFields = new Set(['name', 'title', 'callsign', 'icao', 'registration', 'identifier', 'id']);

  const breakdown: Record<string, number> = {};
  const reasons: string[] = [];
  let weightedSum = 0;
  let totalWeight = 0;

  const allFields = new Set([...Object.keys(dataA), ...Object.keys(dataB)]);

  for (const field of allFields) {
    const valA = dataA[field];
    const valB = dataB[field];

    if (valA === undefined && valB === undefined) continue;

    const weight = highWeightFields.has(field) ? 3.0 : geoFields.has(field) ? 1.5 : 1.0;

    let score: number;
    if (geoFields.has(field)) {
      score = numericSimilarity(valA, valB, 0.001); // tight geo tolerance
    } else {
      score = stringSimilarity(valA, valB);
    }

    breakdown[field] = Math.round(score * 100) / 100;
    weightedSum += score * weight;
    totalWeight += weight;

    if (score >= 0.95) reasons.push(`exact_${field}`);
    else if (score >= 0.80) reasons.push(`fuzzy_${field}`);
  }

  const overall = totalWeight === 0 ? 0 : Math.round((weightedSum / totalWeight) * 1000) / 1000;

  return { overall, breakdown, reasons };
}

// ── IdentityService ───────────────────────────────────────────────

/**
 * IdentityService handles the resolution of external IDs into the platform's
 * internal 'logicalId'. This is the core of our Entity Resolution (ER) engine.
 */
export class IdentityService {
  /**
   * Resolves an external record's identity to a platform logicalId.
   * 1. Checks for an explicit EntityAlias.
   * 2. (Future hook) Could perform fuzzy matching on attributes.
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

  /**
   * Runs fuzzy matching across all active instances of an entity type
   * and creates MatchCandidate records for pairs that exceed the threshold.
   *
   * @returns number of new candidates created
   */
  static async runFuzzyMatchJob(
    entityTypeId: string,
    prisma: PrismaClient,
    options: {
      threshold?: number;   // minimum score to create a candidate (default 0.75)
      sourceJobId?: string;
      limit?: number;       // max instances to compare (default 500)
    } = {}
  ): Promise<number> {
    const { threshold = 0.75, sourceJobId, limit = 500 } = options;

    // Fetch current active instances for this entity type
    const instances = await prisma.currentEntityState.findMany({
      where: { entityTypeId },
      take: limit,
    });

    if (instances.length < 2) return 0;

    let created = 0;

    // O(n²) — acceptable for up to ~500 instances; needs chunking for larger sets
    for (let i = 0; i < instances.length; i++) {
      for (let j = i + 1; j < instances.length; j++) {
        const a = instances[i]!;
        const b = instances[j]!;

        // Skip if already resolved pair
        const existing = await (prisma as any).matchCandidate.findFirst({
          where: {
            entityTypeId,
            OR: [
              { logicalIdA: a.logicalId, logicalIdB: b.logicalId },
              { logicalIdA: b.logicalId, logicalIdB: a.logicalId },
            ],
            status: { in: ['PENDING', 'MERGED'] }
          }
        });
        if (existing) continue;

        const score = scoreEntitySimilarity(
          a.data as Record<string, unknown>,
          b.data as Record<string, unknown>
        );

        if (score.overall >= threshold) {
          await (prisma as any).matchCandidate.create({
            data: {
              logicalIdA: a.logicalId,
              logicalIdB: b.logicalId,
              entityTypeId,
              scoreOverall: score.overall,
              scoreBreakdown: score.breakdown,
              matchReasons: score.reasons,
              status: 'PENDING',
              sourceJobId: sourceJobId ?? null,
            }
          }).catch(() => { /* ignore duplicate */ });
          created++;
        }
      }
    }

    return created;
  }

  /**
   * Merges entity B into entity A: updates all aliases pointing to B to point to A,
   * then marks the MatchCandidate as MERGED.
   */
  static async mergeEntities(
    candidateId: string,
    reviewerName: string,
    prisma: PrismaClient
  ): Promise<void> {
    const p = prisma as any;
    const candidate = await p.matchCandidate.findUnique({ where: { id: candidateId } });
    if (!candidate) throw new Error('MatchCandidate not found');
    if (candidate.status !== 'PENDING') throw new Error('Candidate is not PENDING');

    // Re-point all aliases from B → A
    await prisma.entityAlias.updateMany({
      where: { targetLogicalId: candidate.logicalIdB },
      data: { targetLogicalId: candidate.logicalIdA, confidence: candidate.scoreOverall }
    });

    // Update CQRS read model: copy B's data into A only for fields A doesn't have
    const stateA = await prisma.currentEntityState.findUnique({ where: { logicalId: candidate.logicalIdA } });
    const stateB = await prisma.currentEntityState.findUnique({ where: { logicalId: candidate.logicalIdB } });

    if (stateA && stateB) {
      const merged = { ...(stateB.data as object), ...(stateA.data as object) }; // A wins on conflicts
      await prisma.currentEntityState.update({
        where: { logicalId: candidate.logicalIdA },
        data: { data: merged as any, updatedAt: new Date() }
      });
    }

    await p.matchCandidate.update({
      where: { id: candidateId },
      data: {
        status: 'MERGED',
        reviewedBy: reviewerName,
        reviewedAt: new Date(),
        mergedIntoId: candidate.logicalIdA
      }
    });
  }
}
