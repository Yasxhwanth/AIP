/**
 * =============================================================================
 * WORKFLOW DEFINITION STORE
 * Phase 5: Metadata-Defined Workflows
 * =============================================================================
 * 
 * Manages WorkflowDefinition storage and versioning.
 * Workflows are defined as metadata (nodes, transitions, guards) and stored
 * with the ontology.
 */

import { WorkflowDefinition, WorkflowVersion, WorkflowStatus, WorkflowTriggerConfig } from '../workflow-types';
import { OntologyVersionId } from './ontology-definition-types';
import { WorkflowGraph } from '../../workflows/workflow-graph-types';

export type WorkflowDefinitionId = string & { readonly __brand: 'WorkflowDefinitionId' };
export type WorkflowVersionId = string & { readonly __brand: 'WorkflowVersionId' };

export class WorkflowDefinitionStore {
    private definitions: Map<WorkflowDefinitionId, WorkflowDefinition> = new Map();
    private versions: Map<WorkflowVersionId, WorkflowVersion> = new Map();
    private activeVersionsByWorkflow: Map<WorkflowDefinitionId, WorkflowVersionId> = new Map();
    private versionsByOntology: Map<OntologyVersionId, Set<WorkflowVersionId>> = new Map();

    /**
     * Creates a new workflow definition.
     */
    public createWorkflowDefinition(
        tenantId: string,
        ontologyVersionId: OntologyVersionId,
        name: string,
        displayName: string,
        triggerConfig: WorkflowTriggerConfig,
        graph: WorkflowGraph,
        createdBy: string | null
    ): WorkflowDefinition {
        const definition: WorkflowDefinition = {
            id: crypto.randomUUID() as any,
            tenant_id: tenantId,
            ontology_version_id: ontologyVersionId,
            name,
            display_name: displayName,
            description: null,
            status: WorkflowStatus.DRAFT,
            trigger_config: triggerConfig,
            graph
        };

        this.definitions.set(definition.id as any, definition);
        return definition;
    }

    /**
     * Creates a new version snapshot of a workflow.
     */
    public createWorkflowVersion(
        workflowId: WorkflowDefinitionId,
        ontologyVersionId: OntologyVersionId
    ): WorkflowVersion {
        const definition = this.definitions.get(workflowId);
        if (!definition) {
            throw new Error(`Workflow ${workflowId} not found`);
        }

        const existingVersions = Array.from(this.versions.values())
            .filter(v => v.workflow_id === workflowId);
        const versionNumber = existingVersions.length > 0
            ? Math.max(...existingVersions.map(v => v.version_number)) + 1
            : 1;

        const version: WorkflowVersion = {
            id: crypto.randomUUID() as any,
            workflow_id: workflowId,
            ontology_version_id: ontologyVersionId,
            version_number: versionNumber,
            trigger_config: definition.trigger_config,
            steps: this.convertGraphToSteps(definition.graph)
        };

        this.versions.set(version.id as any, version);

        // Index by ontology version
        const versionSet = this.versionsByOntology.get(ontologyVersionId) || new Set();
        versionSet.add(version.id as any);
        this.versionsByOntology.set(ontologyVersionId, versionSet);

        return version;
    }

    /**
     * Publishes a workflow definition (makes it active).
     */
    public publishWorkflow(workflowId: WorkflowDefinitionId): void {
        const definition = this.definitions.get(workflowId);
        if (!definition) {
            throw new Error(`Workflow ${workflowId} not found`);
        }

        definition.status = WorkflowStatus.PUBLISHED;

        // Create a version snapshot
        const version = this.createWorkflowVersion(workflowId, definition.ontology_version_id);
        this.activeVersionsByWorkflow.set(workflowId, version.id as any);
    }

    /**
     * Gets active workflow version for a definition.
     */
    public getActiveVersion(workflowId: WorkflowDefinitionId): WorkflowVersion | null {
        const versionId = this.activeVersionsByWorkflow.get(workflowId);
        if (!versionId) return null;
        return this.versions.get(versionId) || null;
    }

    /**
     * Gets all published workflow versions for an ontology version.
     */
    public getPublishedWorkflowsByOntology(ontologyVersionId: OntologyVersionId): WorkflowVersion[] {
        const versionIds = this.versionsByOntology.get(ontologyVersionId) || new Set();
        return Array.from(versionIds)
            .map(id => this.versions.get(id))
            .filter((v): v is WorkflowVersion => v !== undefined);
    }

    /**
     * Gets a workflow definition by ID.
     */
    public getWorkflowDefinition(id: WorkflowDefinitionId): WorkflowDefinition | null {
        return this.definitions.get(id) || null;
    }

    /**
     * Gets a workflow version by ID.
     */
    public getWorkflowVersion(id: WorkflowVersionId): WorkflowVersion | null {
        return this.versions.get(id) || null;
    }

    /**
     * Converts graph representation to linear steps for execution engine.
     */
    private convertGraphToSteps(graph: WorkflowGraph): any[] {
        // Convert reactflow-style graph to execution steps
        return graph.nodes.map(node => ({
            id: node.id,
            type: node.type as any,
            config: node.config,
            transitions: this.buildTransitions(node.id, graph)
        }));
    }

    private buildTransitions(nodeId: string, graph: WorkflowGraph): Record<string, string> {
        const transitions: Record<string, string> = {};
        graph.edges
            .filter(e => e.from === nodeId)
            .forEach(e => {
                const label = e.condition || 'default';
                transitions[label] = e.to;
            });
        return transitions;
    }
}

export const workflowDefinitionStore = new WorkflowDefinitionStore();
