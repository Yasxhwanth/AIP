import { create } from 'zustand';

interface SchedulersData {
    jobScheduler: { status: string; lagMs: number | null; lastError: string | null };
    rollupScheduler: { status: string; lagMs: number | null; lastError: string | null };
}

interface MetricsData {
    queueDepth: number;
    maxQueueLagMs: number;
}

interface HealthData {
    status: 'ok' | 'degraded' | 'disconnected';
    database: { status: string; latencyMs?: number };
    schedulers?: SchedulersData;
    metrics?: MetricsData;
    timestamp: string;
}

interface WorkspaceHealthState {
    health: HealthData | null;
    isPolling: boolean;
    lastCheckedAt: Date | null;
    startPolling: () => void;
    stopPolling: () => void;
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

export const useWorkspaceHealth = create<WorkspaceHealthState>((set, get) => ({
    health: null,
    isPolling: false,
    lastCheckedAt: null,

    startPolling: () => {
        if (get().isPolling) return;
        set({ isPolling: true });

        const checkHealth = async () => {
            try {
                // If in dev mode, we pass a dummy API key if auth is strictly off, 
                // but health endpoint is actually public auth-skipped in backend.
                const res = await fetch('http://localhost:3001/api/v1/health/deep');
                if (res.ok) {
                    const data = await res.json();
                    set({ health: data, lastCheckedAt: new Date() });
                } else {
                    set({
                        health: {
                            status: 'disconnected',
                            database: { status: 'disconnected' },
                            timestamp: new Date().toISOString()
                        },
                        lastCheckedAt: new Date()
                    });
                }
            } catch (err) {
                set({
                    health: {
                        status: 'disconnected',
                        database: { status: 'disconnected' },
                        timestamp: new Date().toISOString()
                    },
                    lastCheckedAt: new Date()
                });
            }
        };

        checkHealth();
        pollInterval = setInterval(checkHealth, 15000); // Check every 15s
    },

    stopPolling: () => {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
        set({ isPolling: false });
    }
}));
