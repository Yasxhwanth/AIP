import { useState, useEffect, useMemo } from 'react';
import { useTime } from '../../state/time/useTime';
import { QueryClient } from './QueryClient';
import { useScenario } from '../../context/ScenarioContext';
import { ScenarioAwareQueryResolver } from '../../ontology/ScenarioAwareQueryResolver';
import { TenantContextManager } from '../../tenant/TenantContext';
import { ontologySnapshotResolver } from '../../ontology/definition/OntologySnapshotResolver';
import { ontologyCompiler } from '../../ontology/definition/OntologyCompiler';
import { CompiledOntologySnapshot } from '../../ontology/definition/ontology-definition-types';

/**
 * useOntologyQuery Hook
 * 
 * Provides reactive access to the ontology query layer.
 * Automatically re-executes queries when the global 'asOf' time changes.
 */
export const useOntologyQuery = () => {
    const { asOf } = useTime();
    const [entities, setEntities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { activeScenarioId } = useScenario();
    const { tenantId } = TenantContextManager.getContext();
    const CURRENT_ONTOLOGY_VERSION = "v1.0.0"; // Should match Context

    // Resolve compiled ontology snapshot
    const compiledSnapshot = useMemo(() => {
        try {
            const snapshot = ontologySnapshotResolver.resolveActiveSnapshot(asOf, tenantId);
            return ontologyCompiler.compile(snapshot);
        } catch (e) {
            console.error('Failed to resolve ontology snapshot:', e);
            return null;
        }
    }, [asOf, tenantId]);

    // Fetch entities whenever asOf or activeScenarioId changes
    useEffect(() => {
        const fetchEntities = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Use Resolver instead of direct Client
                const data = ScenarioAwareQueryResolver.resolveEntities(
                    asOf,
                    activeScenarioId,
                    CURRENT_ONTOLOGY_VERSION,
                    tenantId
                );
                setEntities(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch entities');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEntities();
    }, [asOf, activeScenarioId, tenantId]);

    const getEntitySnapshot = (id: string) => {
        return QueryClient.getEntitySnapshot(id, asOf, tenantId);
    };

    const getEntityRelationships = (id: string) => {
        return ScenarioAwareQueryResolver.resolveRelationships(
            id,
            asOf,
            activeScenarioId,
            CURRENT_ONTOLOGY_VERSION,
            tenantId
        );
    };

    const getSpatialState = () => {
        return QueryClient.getSpatialState(asOf, tenantId);
    };

    const getSpatialSnapshots = (entityId: string) => {
        return QueryClient.getSpatialSnapshots(entityId, tenantId);
    };

    return {
        entities,
        compiledSnapshot,
        getEntitySnapshot,
        getEntityRelationships,
        getSpatialState,
        getSpatialSnapshots,
        isLoading,
        error,
        asOf
    };
};
