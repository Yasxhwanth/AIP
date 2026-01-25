import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ScenarioManager } from '../ontology/ScenarioManager';
import { ScenarioBranch, MutationType } from '../ontology/scenario-types';
import { useTime } from '../state/time/useTime';
import { TenantContextManager } from '../tenant/TenantContext';

interface ScenarioContextType {
    activeScenarioId: string | null;
    activeScenario: ScenarioBranch | null;
    createScenario: (description: string) => void;
    activateScenario: (scenarioId: string) => void;
    exitScenario: () => void;
    addMutation: (targetEntityId: string, type: MutationType, value: any, asOf: Date) => void;
    mutations: any[]; // Using any for now to avoid circular dependency or complex type imports
    scenarios: ScenarioBranch[];
    mutationCount: number;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
    const [mutationCount, setMutationCount] = useState(0);
    const { asOf } = useTime();

    // In a real app, we'd fetch the ontology version from a store.
    // For Phase 14, we hardcode or assume a version.
    const CURRENT_ONTOLOGY_VERSION = "v1.0.0";

    const createScenario = (description: string) => {
        const branch = ScenarioManager.createScenario(
            asOf,
            CURRENT_ONTOLOGY_VERSION,
            "USER", // Hardcoded user for now
            description,
            TenantContextManager.getContext().tenantId
        );
        setActiveScenarioId(branch.scenarioId);
    };

    const activateScenario = (scenarioId: string) => {
        setActiveScenarioId(scenarioId);
    };

    const exitScenario = () => {
        setActiveScenarioId(null);
    };

    const addMutation = (targetEntityId: string, type: MutationType, value: any, asOf: Date) => {
        if (!activeScenarioId) return;

        ScenarioManager.addMutation(
            activeScenarioId,
            targetEntityId,
            type,
            value,
            asOf // Effective at current simulation time
        );
        // Force re-render and signal update to consumers
        setMutationCount(prev => prev + 1);
    };

    const activeScenario = activeScenarioId ? ScenarioManager.getScenario(activeScenarioId) || null : null;

    const mutations = activeScenarioId ? ScenarioManager.getMutations(activeScenarioId) : [];

    const scenarios = ScenarioManager.getAllScenarios();

    return (
        <ScenarioContext.Provider value={{
            activeScenarioId,
            activeScenario,
            createScenario,
            activateScenario,
            exitScenario,
            addMutation,
            mutations,
            scenarios,
            mutationCount
        }}>
            {children}
        </ScenarioContext.Provider>
    );
};

export const useScenario = () => {
    const context = useContext(ScenarioContext);
    if (!context) {
        throw new Error('useScenario must be used within a ScenarioProvider');
    }
    return context;
};
