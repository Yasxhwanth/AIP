import { create } from 'zustand';

// Mock runtime data instances mapped to the Ontology
export interface RuntimeEntityInstance {
    id: string;
    entityTypeId: string; // "ent-drone"
    properties: Record<string, any>;
    metrics: Record<string, number>;
    relations: Record<string, string[]>;
}

export interface ActivityEvent {
    id: string;
    timestamp: string;
    type: 'metric_update' | 'action_executed' | 'ai_triggered' | 'case_created';
    entityInstanceId: string;
    title: string;
    description: string;
    actor: string;
}

interface RuntimeState {
    instances: RuntimeEntityInstance[];
    activity: ActivityEvent[];
    executeAction: (actionId: string, instanceId: string, payload: any) => Promise<boolean>;
}

export const useRuntimeStore = create<RuntimeState>()((set) => ({
    instances: [
        {
            id: 'drn-alpha-01',
            entityTypeId: 'ent-drone',
            properties: { status: 'CRITICAL', batteryLevel: 12, location: 'Sector 7G', missionId: 'msn-001' },
            metrics: { flightTime: 420 },
            relations: {}
        },
        {
            id: 'drn-bravo-02',
            entityTypeId: 'ent-drone',
            properties: { status: 'WARNING', batteryLevel: 45, location: 'Sector 4A', missionId: 'msn-002' },
            metrics: { flightTime: 120 },
            relations: {}
        },
        {
            id: 'drn-charlie-03',
            entityTypeId: 'ent-drone',
            properties: { status: 'ACTIVE', batteryLevel: 98, location: 'Base Alpha', missionId: 'msn-003' },
            metrics: { flightTime: 5 },
            relations: {}
        },
        {
            id: 'msn-004-conflict',
            entityTypeId: 'ent-mission',
            properties: { status: 'CONFLICT', objective: 'Recon', assignedDrone: 'drn-delta-04' },
            metrics: {},
            relations: {}
        }
    ] as RuntimeEntityInstance[],
    activity: [
        {
            id: 'evt-1', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            type: 'metric_update', entityInstanceId: 'drn-alpha-01',
            title: 'Battery Critical Warning', description: 'Battery dropped below 15% during operation.', actor: 'System Telemetry'
        },
        {
            id: 'evt-2', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            type: 'action_executed', entityInstanceId: 'drn-bravo-02',
            title: 'Reroute Commanded', description: 'Drone rerouted to Sector 4A for weather avoidance.', actor: 'FleetOps-Agent'
        }
    ],

    executeAction: async (actionId, instanceId, payload) => {
        // Mock execution
        return new Promise(resolve => {
            setTimeout(() => {
                set(state => ({
                    activity: [{
                        id: `evt-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        type: 'action_executed',
                        entityInstanceId: instanceId,
                        title: `Action Executed via UI`,
                        description: `Payload: ${JSON.stringify(payload)}`,
                        actor: 'Operator (Manual)'
                    }, ...state.activity]
                }));
                resolve(true);
            }, 800);
        });
    }
}));
