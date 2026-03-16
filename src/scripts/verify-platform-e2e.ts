
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';
import { AIPExecutor } from '../aip-executor';
import { GovernanceService } from '../governance-service';
import logger from '../logger';

async function main() {
    process.env.DATABASE_URL = "postgresql://aip_user:aip_password@localhost:5432/aip_db";
    console.log('🚀 Starting Final Platform Validation: Agent Proposal Flow');

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter } as any);
    const executor = new AIPExecutor(prisma);
    const govSvc = new GovernanceService(prisma);

    try {
        await prisma.$connect();

        // 1. Setup Context
        const project = await prisma.project.findFirst({ where: { name: 'Military Operations' } });
        if (!project) throw new Error('Military Operations project not found. Run seed first.');
        const projectId = project.id;

        // Create a dummy entity type to modify
        const etName = `ValidationType_${Date.now()}`;
        const entityType = await prisma.entityType.create({
            data: {
                name: etName,
                version: 1,
                projectId,
                branchName: 'main'
            }
        });
        console.log(`✅ Setup: Created EntityType ${etName} (${entityType.id})`);

        // 2. Step 1: Agent Proposes a Change
        console.log('\n--- PHASE 1: Agent Proposal ---');
        const proposalRes = await executor.execute({
            toolName: 'propose_change',
            projectId,
            actor: 'sentinel-agent',
            actorMetadata: { sessionId: 'test-session-42' },
            parameters: {
                resourceType: 'EntityType',
                resourceId: entityType.id,
                proposedChanges: { name: `${etName}_UPDATED` }
            }
        });

        if (!proposalRes.success) throw new Error(`Agent proposal failed: ${proposalRes.error}`);
        const crId = proposalRes.result.changeRequestId;
        console.log(`✅ Proposal Successful. Change Request: ${crId}`);

        // 3. Step 2: Verify Proposal status
        const cr = await prisma.changeRequest.findUnique({ where: { id: crId } });
        if (!cr || cr.status !== 'DRAFT') throw new Error(`CR ${crId} not in DRAFT status`);
        console.log('✅ Verified CR is in DRAFT status.');

        // 4. Step 3: Admin Approval
        console.log('\n--- PHASE 2: Admin Approval ---');
        const approvalRes = await govSvc.approveAndApply(crId, 'admin-commander');
        console.log(`✅ Admin Approval Successful. Status: ${approvalRes.status}`);

        // 5. Step 4: System Update Verification
        console.log('\n--- PHASE 3: System Update Verification ---');
        const updatedEt = await prisma.entityType.findUnique({ where: { id: entityType.id } });
        if (updatedEt?.name !== `${etName}_UPDATED`) {
            throw new Error('System update verification failed: Name not updated.');
        }
        console.log('✅ Verified EntityType name was updated in the ontology.');

        // 6. Step 5: Audit Log Verification
        console.log('\n--- PHASE 4: Audit Log Verification ---');
        const logs = await prisma.auditLog.findMany({
            where: { projectId },
            orderBy: { occurredAt: 'desc' },
            take: 10
        });

        const proposalLog = logs.find(l => l.action === 'AGENT_TOOL_PROPOSE_CHANGE');
        const approvalLog = logs.find(l => l.action === 'APPROVE_CHANGE_REQUEST');

        if (!proposalLog) throw new Error('Audit log missing for agent proposal.');
        if (!approvalLog) throw new Error('Audit log missing for admin approval.');

        console.log('✅ Audit logs verified for Proposal and Approval.');
        console.log(`   - Proposal Actor: ${proposalLog.actor}`);
        console.log(`   - Approval Actor: ${approvalLog.actor}`);

        console.log('\n✨ PLATFORM VALIDATION SUCCESSFUL: AGENT PROPOSAL TO SYSTEM UPDATE FLOW REIFIED ✨');

    } catch (err: any) {
        console.error('\n❌ VALIDATION FAILED');
        console.error(err.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch(console.error);
