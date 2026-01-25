import { workflowDefinitionStore } from './definition/WorkflowDefinitionStore';
import { seedOntology } from './definition/seed-ontology';
import { ontologySnapshotResolver } from './definition/OntologySnapshotResolver';
import { WorkflowNodeType } from '../workflows/workflow-graph-types';
import { DomainEventType } from './event-types';

async function testWorkflowDefinitions() {
    console.log('--- TESTING WORKFLOW DEFINITION SYSTEM ---');
    const tenantId = 'test-tenant';

    // 1. Seed ontology
    console.log('1. Seeding ontology...');
    seedOntology(tenantId);
    const snapshot = ontologySnapshotResolver.resolveActiveSnapshot(new Date(), tenantId);
    console.log(`   - Ontology version: ${snapshot.ontology_version_id}`);

    // 2. Create workflow definition
    console.log('2. Creating workflow definition...');
    const workflow = workflowDefinitionStore.createWorkflowDefinition(
        tenantId,
        snapshot.ontology_version_id,
        'asset_admission_review',
        'Asset Admission Review Workflow',
        {
            event_type: DomainEventType.ADMISSION_CASE_CREATED,
            condition: { caseType: 'ENTITY' }
        },
        {
            id: 'wf-graph-1',
            tenant_id: tenantId,
            version: 1,
            created_at: new Date(),
            nodes: [
                {
                    id: 'start',
                    type: WorkflowNodeType.START,
                    label: 'Start',
                    position: { x: 0, y: 0 },
                    config: {}
                },
                {
                    id: 'review',
                    type: WorkflowNodeType.APPROVAL,
                    label: 'Reviewer Approval',
                    position: { x: 200, y: 0 },
                    config: { assignee_role: 'reviewer' }
                },
                {
                    id: 'manager_review',
                    type: WorkflowNodeType.APPROVAL,
                    label: 'Manager Approval',
                    position: { x: 400, y: 0 },
                    config: { assignee_role: 'manager' }
                },
                {
                    id: 'end',
                    type: WorkflowNodeType.END,
                    label: 'End',
                    position: { x: 600, y: 0 },
                    config: {}
                }
            ],
            edges: [
                { id: 'e1', from: 'start', to: 'review' },
                { id: 'e2', from: 'review', to: 'manager_review', condition: 'approved' },
                { id: 'e3', from: 'review', to: 'end', condition: 'rejected' },
                { id: 'e4', from: 'manager_review', to: 'end', condition: 'approved' },
                { id: 'e5', from: 'manager_review', to: 'review', condition: 'rejected' }
            ]
        },
        'system'
    );
    console.log(`   - Created workflow: ${workflow.id}`);
    console.log(`   - Name: ${workflow.name}`);
    console.log(`   - Status: ${workflow.status}`);
    console.log(`   - Graph nodes: ${workflow.graph.nodes.length}`);
    console.log(`   - Graph edges: ${workflow.graph.edges.length}`);

    // 3. Publish workflow
    console.log('3. Publishing workflow...');
    workflowDefinitionStore.publishWorkflow(workflow.id as any);
    const activeVersion = workflowDefinitionStore.getActiveVersion(workflow.id as any);
    console.log(`   - Version created: ${activeVersion?.id}`);
    console.log(`   - Version number: ${activeVersion?.version_number}`);
    console.log(`   - Steps generated: ${activeVersion?.steps.length}`);
    
    if (activeVersion) {
        console.log('   - Step IDs:');
        activeVersion.steps.forEach(step => {
            console.log(`     - ${step.id} (${step.type})`);
            console.log(`       Transitions: ${Object.keys(step.transitions).join(', ') || 'none'}`);
        });
    }

    // 4. Query workflows by ontology version
    console.log('4. Querying workflows by ontology version...');
    const publishedWorkflows = workflowDefinitionStore.getPublishedWorkflowsByOntology(snapshot.ontology_version_id);
    console.log(`   - Found ${publishedWorkflows.length} published workflow(s)`);
    publishedWorkflows.forEach(wf => {
        console.log(`     - ${wf.workflow_id} v${wf.version_number}`);
    });

    console.log('--- WORKFLOW DEFINITION TEST COMPLETE ---');
}

testWorkflowDefinitions().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
