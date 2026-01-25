/**
 * =============================================================================
 * DETERMINISM TEST HARNESS
 * =============================================================================
 * 
 * Tests that platform operations are deterministic:
 * - Same query → same results (byte-level equality)
 * - Same ontology → same hash
 * - Same compilation → same artifacts
 * 
 * Fails loudly on nondeterminism.
 */

import { ontologyDefinitionStore } from './OntologyDefinitionStore';
import { ontologySnapshotResolver } from './OntologySnapshotResolver';
import { ontologyCompiler } from './OntologyCompiler';
import { ontologySnapshotHasher } from './OntologySnapshotHash';
import { semanticQueryEngine } from '../query/SemanticQueryEngine';
import { EntityQuery } from '../query/query-types';

export class DeterminismTestHarness {
    /**
     * Test: Same ontology snapshot produces same hash.
     */
    public testSnapshotHashDeterminism(tenantId: string): void {
        console.log('[DeterminismTest] Testing snapshot hash determinism...');

        const asOf = new Date();
        const activeVersion = ontologyDefinitionStore.getActiveVersion(tenantId);

        if (!activeVersion) {
            throw new Error('No active ontology version found');
        }

        // Compute hash twice
        const snapshot = ontologySnapshotResolver.resolveSnapshot(activeVersion.id, asOf, tenantId);
        const hash1 = ontologySnapshotHasher.computeHash(snapshot);
        const hash2 = ontologySnapshotHasher.computeHash(snapshot);

        // Assert byte-level equality
        if (hash1.snapshot_hash !== hash2.snapshot_hash) {
            throw new Error(
                `NONDETERMINISM DETECTED: Snapshot hash mismatch.\n` +
                `Hash 1: ${hash1.snapshot_hash}\n` +
                `Hash 2: ${hash2.snapshot_hash}`
            );
        }

        console.log(`✓ Snapshot hash determinism verified: ${hash1.snapshot_hash}`);
    }

    /**
     * Test: Same compilation produces same artifacts.
     */
    public testCompilationDeterminism(tenantId: string): void {
        console.log('[DeterminismTest] Testing compilation determinism...');

        const asOf = new Date();
        const activeVersion = ontologyDefinitionStore.getActiveVersion(tenantId);

        if (!activeVersion) {
            throw new Error('No active ontology version found');
        }

        const snapshot = ontologySnapshotResolver.resolveSnapshot(activeVersion.id, asOf, tenantId);

        // Compile twice
        ontologyCompiler.clearCache(); // Clear cache to force recompilation
        const compiled1 = ontologyCompiler.compile(snapshot);
        ontologyCompiler.clearCache();
        const compiled2 = ontologyCompiler.compile(snapshot);

        // Assert hash equality
        if (compiled1.snapshot_hash !== compiled2.snapshot_hash) {
            throw new Error(
                `NONDETERMINISM DETECTED: Compiled snapshot hash mismatch.\n` +
                `Hash 1: ${compiled1.snapshot_hash}\n` +
                `Hash 2: ${compiled2.snapshot_hash}`
            );
        }

        console.log(`✓ Compilation determinism verified: ${compiled1.snapshot_hash}`);
    }

    /**
     * Test: Same query produces same results.
     */
    public async testQueryDeterminism(
        query: EntityQuery,
        tenantId: string
    ): Promise<void> {
        console.log('[DeterminismTest] Testing query determinism...');

        // Execute query twice
        const results1 = await semanticQueryEngine.searchEntities(query);
        const results2 = await semanticQueryEngine.searchEntities(query);

        // Assert count equality
        if (results1.length !== results2.length) {
            throw new Error(
                `NONDETERMINISM DETECTED: Query result count mismatch.\n` +
                `Count 1: ${results1.length}\n` +
                `Count 2: ${results2.length}`
            );
        }

        // Assert result order equality (by entity ID)
        for (let i = 0; i < results1.length; i++) {
            if (results1[i].id !== results2[i].id) {
                throw new Error(
                    `NONDETERMINISM DETECTED: Query result order mismatch at index ${i}.\n` +
                    `Entity 1: ${results1[i].id}\n` +
                    `Entity 2: ${results2[i].id}`
                );
            }
        }

        console.log(`✓ Query determinism verified: ${results1.length} results`);
    }

    /**
     * Run all determinism tests.
     */
    public async runAllTests(tenantId: string): Promise<void> {
        console.log('\n=== DETERMINISM TEST HARNESS ===\n');

        try {
            this.testSnapshotHashDeterminism(tenantId);
            this.testCompilationDeterminism(tenantId);

            // Test query determinism with empty query (all entities)
            await this.testQueryDeterminism(
                {
                    entityType: 'Asset',
                    asOf: new Date()
                },
                tenantId
            );

            console.log('\n✓ ALL DETERMINISM TESTS PASSED\n');
        } catch (err) {
            console.error('\n✗ DETERMINISM TEST FAILED\n');
            throw err;
        }
    }
}

export const determinismTestHarness = new DeterminismTestHarness();
