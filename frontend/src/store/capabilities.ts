import { create } from 'zustand';

interface CapabilityState {
    status: 'ENABLED' | 'DISABLED' | 'BETA';
    reason?: string;
}

interface Capabilities {
    pipeline_dry_run?: CapabilityState;
    policy_simulation?: CapabilityState;
    model_promotion?: CapabilityState;
    lineage_graph?: CapabilityState;
}

interface CapabilitiesStore {
    capabilities: Capabilities | null;
    isLoaded: boolean;
    fetchCapabilities: () => Promise<void>;
}

export const useCapabilities = create<CapabilitiesStore>((set) => ({
    capabilities: null,
    isLoaded: false,

    fetchCapabilities: async () => {
        try {
            const res = await fetch('http://localhost:3001/api/v1/capabilities');
            if (res.ok) {
                const data = await res.json();
                set({ capabilities: data.features, isLoaded: true });
            } else {
                set({ capabilities: null, isLoaded: true });
            }
        } catch (err) {
            set({ capabilities: null, isLoaded: true });
        }
    }
}));
