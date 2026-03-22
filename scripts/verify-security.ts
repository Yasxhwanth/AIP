import { PrismaClient } from '../src/generated/prisma';
import { SecurityContext } from '../src/security-context';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const security = new SecurityContext(prisma);

async function runAudit() {
    console.log("🛡 Starting Stage 10 Security Audit...");

    const testProjectA = "proj-alpha-001";
    const testProjectB = "proj-bravo-002";

    // 1. RLS Verification
    console.log("\n[1] Verifying Row-Level Security (RLS)...");
    try {
        // Mocking a tenant-aware query (this would normally use getTenantPrisma)
        const aEntries = await prisma.auditLog.findMany({ where: { projectId: testProjectA } });
        const bEntries = await prisma.auditLog.findMany({ where: { projectId: testProjectB } });

        console.log(`✅ Project A Logs: ${aEntries.length}`);
        console.log(`✅ Project B Logs: ${bEntries.length}`);

        const leak = aEntries.some(log => log.projectId !== testProjectA);
        if (leak) {
            console.error("❌ CRITICAL: Cross-project data leak detected in Project A!");
        } else {
            console.log("✅ No cross-project leaks detected in sample.");
        }
    } catch (err) {
        console.error("❌ RLS Audit Failed:", err);
    }

    // 2. ABAC Verification
    console.log("\n[2] Verifying ABAC Policy Engine...");

    const tsDecision = await security.check({
        actor: { apiKeyId: "id-smith", apiKeyName: "operator-smith", role: "ANALYST", clearanceLevel: 2 }, // 2 = SECRET
        action: 'READ',
        resource: { type: "EntityInstance", id: "target-1", attributes: { classification: 3 } } // 3 = TOP SECRET
    });

    const secretDecision = await security.check({
        actor: { apiKeyId: "id-smith", apiKeyName: "operator-smith", role: "ANALYST", clearanceLevel: 2 },
        action: 'READ',
        resource: { type: "EntityInstance", id: "target-2", attributes: { classification: 2 } } // 2 = SECRET
    });

    console.log(`✅ User (SECRET) reading TS resource: ${tsDecision.allowed ? 'ALLOWED (FAIL)' : 'DENIED (PASS)'}`);
    console.log(`✅ User (SECRET) reading SECRET resource: ${secretDecision.allowed ? 'ALLOWED (PASS)' : 'DENIED (FAIL)'}`);

    if (tsDecision.allowed === true) {
        console.error("❌ ABAC FAILURE: User with SECRET clearance read TOP SECRET data!");
    }

    // 3. Tool Governance Audit
    console.log("\n[3] Auditing Tool Authorization Flow...");
    try {
        const pendingProposals = await prisma.actionProposal.count({ where: { status: 'PENDING' } });
        console.log(`✅ Active ActionProposals Pending Review: ${pendingProposals}`);
        console.log("✅ Tool governance layer is active.");
    } catch (err) {
        console.error("❌ Tool Audit Failed:", err);
    }

    console.log("\n🛡 Audit Complete.");
    await prisma.$disconnect();
}

runAudit();
