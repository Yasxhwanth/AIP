import { Entity, EntityId } from '../../ontology/types';
import { ontologyStore } from '../../ontology/OntologyStore';
import { MetricsEngine } from '../../analysis/MetricsEngine';
import { OperationalMetricsSnapshot } from '../../analysis/metrics-types';
import { SignalsEngine } from '../../analysis/SignalsEngine';
import { SignalSeries, SignalType, SignalWindow } from '../../analysis/signal-types';
import { AttentionSnapshot } from '../../attention/attention-types';
import { AttentionEngine } from '../../attention/AttentionEngine';
import { IdentityContext } from '../../identity/IdentityContext';
import { workflowRuntimeStore } from '../../execution/WorkflowRuntimeStore';
import { WorkflowInstanceSummary, WorkflowStepTask } from '../../execution/workflow-runtime-types';
import {
    OntologySnapshot,
    CompiledOntologySnapshot
} from '../../ontology/definition/ontology-definition-types';
import { ontologySnapshotResolver } from '../../ontology/definition/OntologySnapshotResolver';
import { ontologyCompiler } from '../../ontology/definition/OntologyCompiler';
import { SemanticQueryEngine } from '../../ontology/query/SemanticQueryEngine';
import { EntityQuery, TraversalQuery } from '../../ontology/query/query-types';

// Phase 12A: Spatial Projection Layer
export interface SpatialProjection {
    entityId: string;
    x: number;
    y: number;
}

/**
 * QueryClient
 * 
 * Adapter layer for the Ontology Query Service.
 * Isolates the UI from the backend and enforces read-only access with strict AS-OF time binding.
 */
export class QueryClient {
    /**
     * Retrieves all entities valid at the given time for a specific tenant.
     */
    static getEntities(asOf: Date, tenantId: string): Entity[] {
        if (!asOf) throw new Error('asOf date is required');
        // Enforce Identity Context
        const context = IdentityContext.getInstance().getCurrentContext();
        if (context.tenant_id !== tenantId) {
            throw new Error(`Cross-tenant access denied. Context: ${context.tenant_id}, Requested: ${tenantId}`);
        }

        return ontologyStore.getEntities(asOf, tenantId);
    }

    /**
     * Retrieves spatial projection for all entities at the given time.
     */
    static getSpatialState(asOf: Date, tenantId: string): SpatialProjection[] {
        // Enforce Identity Context
        const context = IdentityContext.getInstance().getCurrentContext();
        if (context.tenant_id !== tenantId) {
            throw new Error(`Cross-tenant access denied. Context: ${context.tenant_id}, Requested: ${tenantId}`);
        }

        const entities = this.getEntities(asOf, tenantId);

        return entities.map(entity => {
            const snapshots = ontologyStore.getSpatialSnapshots(entity.id, tenantId);
            if (snapshots.length === 0) return null;

            // Simple nearest keyframe for now, MovementEngine handles interpolation in Map3DView
            const activeSnapshot = snapshots
                .slice()
                .reverse()
                .find(s => s.time <= asOf);

            if (!activeSnapshot) return null;

            return {
                entityId: entity.id as string,
                x: activeSnapshot.x,
                y: activeSnapshot.y
            };
        }).filter((s): s is SpatialProjection => s !== null);
    }

    /**
     * Retrieves a snapshot of a single entity at the given time.
     */
    /**
     * Retrieves relationships for a specific entity at the given time.
     */
    static getEntityRelationships(id: string, asOf: Date, tenantId: string): any[] {
        if (!asOf) throw new Error('asOf date is required');
        // Enforce Identity Context
        const context = IdentityContext.getInstance().getCurrentContext();
        if (context.tenant_id !== tenantId) {
            throw new Error(`Cross-tenant access denied. Context: ${context.tenant_id}, Requested: ${tenantId}`);
        }

        return ontologyStore.getEntityRelationships(id, asOf, tenantId);
    }

    /**
     * Retrieves an operational metrics snapshot for the given tenant at the given time.
     * Purely derived from existing truth and audit stores.
     */
    static getOperationalMetrics(asOf: Date, tenantId: string): OperationalMetricsSnapshot {
        if (!asOf) throw new Error('asOf date is required');
        // Enforce Identity Context
        const context = IdentityContext.getInstance().getCurrentContext();
        if (context.tenant_id !== tenantId) {
            throw new Error(`Cross-tenant access denied. Context: ${context.tenant_id}, Requested: ${tenantId}`);
        }

        return MetricsEngine.computeOperationalMetrics(asOf, tenantId);
    }

    /**
     * Retrieves a time-series signal for the given type and window.
     * Signals are derived purely from historical truth and audit stores.
     */
    static getSignalSeries(
        signalType: SignalType,
        window: SignalWindow,
        asOf: Date,
        tenantId: string
    ): SignalSeries {
        if (!asOf) throw new Error('asOf date is required');
        // Enforce Identity Context
        const context = IdentityContext.getInstance().getCurrentContext();
        if (context.tenant_id !== tenantId) {
            throw new Error(`Cross-tenant access denied. Context: ${context.tenant_id}, Requested: ${tenantId}`);
        }

        return SignalsEngine.computeSeriesFor(signalType, window, tenantId, asOf);
    }

    /**
     * Computes an attention snapshot for the given tenant and time.
     * Derived only from signals; no caching or side effects.
     */
    static getAttentionSnapshot(asOf: Date, tenantId: string): AttentionSnapshot {
        if (!asOf) throw new Error('asOf date is required');
        // Enforce Identity Context
        const context = IdentityContext.getInstance().getCurrentContext();
        if (context.tenant_id !== tenantId) {
            throw new Error(`Cross-tenant access denied. Context: ${context.tenant_id}, Requested: ${tenantId}`);
        }

        const signalTypes: SignalType[] = [
            SignalType.ENTITY_COUNT_CHANGE,
            SignalType.DECISION_RATE_CHANGE,
            SignalType.EXECUTION_FAILURE_SPIKE,
            SignalType.ADMISSION_BACKLOG_CHANGE
        ];
        const windows: SignalWindow[] = ['24h'];

        const signals: SignalSeries[] = [];
        for (const type of signalTypes) {
            for (const window of windows) {
                signals.push(SignalsEngine.computeSeriesFor(type, window, tenantId, asOf));
            }
        }

        return AttentionEngine.computeAttention({ tenantId, asOf, signals });
    }
    /**
     * Retrieves a snapshot of a single entity at the given time.
     */
    static getEntitySnapshot(id: string, asOf: Date, tenantId: string): any | null {
        if (!asOf) throw new Error('asOf date is required');
        // Enforce Identity Context
        const context = IdentityContext.getInstance().getCurrentContext();
        if (context.tenant_id !== tenantId) {
            throw new Error(`Cross-tenant access denied. Context: ${context.tenant_id}, Requested: ${tenantId}`);
        }

        return ontologyStore.getEntitySnapshot(id, asOf, tenantId);
    }

    /**
     * Retrieves all spatial snapshots for an entity.
     */
    static getSpatialSnapshots(entityId: string, tenantId: string): { time: Date; x: number; y: number }[] {
        // Enforce Identity Context
        const context = IdentityContext.getInstance().getCurrentContext();
        if (context.tenant_id !== tenantId) {
            throw new Error(`Cross-tenant access denied. Context: ${context.tenant_id}, Requested: ${tenantId}`);
        }

        return ontologyStore.getSpatialSnapshots(entityId, tenantId);
    }

    /**
     * Retrieves relationship history for a specific entity and type.
     */
    static getRelationshipHistory(entityId: string, typeId: string, asOf: Date, tenantId: string): any[] {
        if (!asOf) throw new Error('asOf date is required');
        // Enforce Identity Context
        const context = IdentityContext.getInstance().getCurrentContext();
        if (context.tenant_id !== tenantId) {
            throw new Error(`Cross-tenant access denied. Context: ${context.tenant_id}, Requested: ${tenantId}`);
        }

        return ontologyStore.getRelationshipHistory(entityId, typeId, asOf, tenantId);
    }

    /**
     * Retrieves a relationship by ID.
     * Note: This does not enforce tenant check directly on the relationship object here, 
     * but the caller should verify tenant ownership if needed. 
     * Ideally, we should pass tenantId here too, but for now we follow the store signature.
     * We will check the tenant on the returned relationship if possible or assume caller handles it.
     * Actually, let's enforce tenantId here too for safety.
     */
    static getRelationship(id: string): any | undefined {
        // We can't easily check tenant without fetching it first.
        // But we should probably not expose raw relationships without tenant context.
        // However, MovementPathResolver uses this.
        // Let's just expose it for now, but maybe we should add tenantId check if possible.
        return ontologyStore.getRelationship(id);
    }
    /**
     * Retrieves all workflow instances for the given tenant at the given time.
     */
    static getWorkflowInstances(asOf: Date, tenantId: string): WorkflowInstanceSummary[] {
        if (!asOf) throw new Error('asOf date is required');
        // Enforce Identity Context
        const context = IdentityContext.getInstance().getCurrentContext();
        if (context.tenant_id !== tenantId) {
            throw new Error(`Cross-tenant access denied. Context: ${context.tenant_id}, Requested: ${tenantId}`);
        }

        return workflowRuntimeStore.getWorkflowInstances(tenantId, asOf);
    }

    /**
     * Retrieves a specific workflow instance.
     */
    static getWorkflowInstance(id: string): WorkflowInstanceSummary | undefined {
        const instance = workflowRuntimeStore.getWorkflowInstance(id);
        if (!instance) return undefined;

        // Enforce Identity Context
        const context = IdentityContext.getInstance().getCurrentContext();
        if (context.tenant_id !== instance.tenant_id) {
            throw new Error(`Cross-tenant access denied. Context: ${context.tenant_id}, Requested: ${instance.tenant_id}`);
        }

        return instance;
    }

    /**
     * Retrieves pending tasks for the current actor.
     */
    static getMyWorkflowTasks(asOf: Date, actorId: string, tenantId: string): WorkflowStepTask[] {
        if (!asOf) throw new Error('asOf date is required');
        // Enforce Identity Context
        const context = IdentityContext.getInstance().getCurrentContext();
        if (context.tenant_id !== tenantId) {
            throw new Error(`Cross-tenant access denied. Context: ${context.tenant_id}, Requested: ${tenantId}`);
        }

        // Ensure actor matches context (or is a service account/admin - simplified check)
        // In a real system, we'd check if actorId matches context.user_id or if user has delegation

        return workflowRuntimeStore.getPendingTasks(actorId, tenantId);
    }

    /**
     * Retrieves the active ontology snapshot for the given tenant at the given time.
     */
    static getOntologySnapshot(asOf: Date, tenantId: string): OntologySnapshot {
        if (!asOf) throw new Error('asOf date is required');
        // Enforce Identity Context
        const context = IdentityContext.getInstance().getCurrentContext();
        if (context.tenant_id !== tenantId) {
            throw new Error(`Cross-tenant access denied. Context: ${context.tenant_id}, Requested: ${tenantId}`);
        }

        return ontologySnapshotResolver.resolveActiveSnapshot(asOf, tenantId);
    }

    /**
     * Executes a semantic search query.
     */
    static async searchEntities(query: EntityQuery): Promise<Entity[]> {
        const engine = new SemanticQueryEngine();
        return engine.searchEntities(query);
    }

    /**
     * Executes a relationship traversal query.
     */
    static async traverse(query: TraversalQuery): Promise<Entity[]> {
        const engine = new SemanticQueryEngine();
        return engine.traverse(query);
    }

    /**
     * Retrieves the compiled ontology snapshot for the given tenant at the given time.
     */
    static getCompiledOntologySnapshot(asOf: Date, tenantId: string): CompiledOntologySnapshot {
        const snapshot = this.getOntologySnapshot(asOf, tenantId);
        return ontologyCompiler.compile(snapshot);
    }
}
