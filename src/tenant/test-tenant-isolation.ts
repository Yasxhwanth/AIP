import { QueryClient } from '../adapters/query/QueryClient';
import { ScenarioAwareQueryResolver } from '../ontology/ScenarioAwareQueryResolver';
import { TenantContextManager } from './TenantContext';

async function runTest() {
    console.log("Starting Tenant Isolation Test...");

    const tenantA = "tenant-default";
    const tenantB = "tenant-b";
    const asOf = new Date();

    // 1. Test QueryClient Isolation
    console.log("\n[Test 1] QueryClient Isolation");

    // Tenant A (Should have data)
    const entitiesA = QueryClient.getEntities(asOf, tenantA);
    console.log(`Tenant A Entities: ${entitiesA.length}`);
    if (entitiesA.length === 0) console.error("FAIL: Tenant A should have entities");
    else console.log("PASS: Tenant A has entities");

    // Tenant B (Should be empty)
    const entitiesB = QueryClient.getEntities(asOf, tenantB);
    console.log(`Tenant B Entities: ${entitiesB.length}`);
    if (entitiesB.length > 0) console.error("FAIL: Tenant B should NOT have entities");
    else console.log("PASS: Tenant B has NO entities");

    // 2. Test Resolver Isolation
    console.log("\n[Test 2] Resolver Isolation");

    // Resolve for Tenant A
    const resolvedA = ScenarioAwareQueryResolver.resolveEntities(asOf, null, "v1.0.0", tenantA);
    console.log(`Resolved Tenant A: ${resolvedA.length}`);
    if (resolvedA.length !== entitiesA.length) console.error("FAIL: Resolver mismatch for Tenant A");
    else console.log("PASS: Resolver matches Tenant A");

    // Resolve for Tenant B
    const resolvedB = ScenarioAwareQueryResolver.resolveEntities(asOf, null, "v1.0.0", tenantB);
    console.log(`Resolved Tenant B: ${resolvedB.length}`);
    if (resolvedB.length !== 0) console.error("FAIL: Resolver should return empty for Tenant B");
    else console.log("PASS: Resolver returns empty for Tenant B");

    // 3. Test Context Manager
    console.log("\n[Test 3] Context Manager");
    TenantContextManager.setContext({
        tenantId: tenantA,
        userId: 'user-1',
        role: 'ADMIN',
        sessionId: 'session-1'
    });

    try {
        TenantContextManager.verifyTenant(tenantA);
        console.log("PASS: Verified Tenant A");
    } catch (e) {
        console.error("FAIL: Should verify Tenant A");
    }

    try {
        TenantContextManager.verifyTenant(tenantB);
        console.error("FAIL: Should throw for Tenant B");
    } catch (e) {
        console.log("PASS: Threw error for Tenant B mismatch");
    }

    console.log("\nTest Complete.");
}

runTest().catch(console.error);
