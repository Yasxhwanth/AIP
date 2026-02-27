import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceState {
    activeProjectId: string | null;
    activeProjectName: string | null;
    setActiveProject: (id: string, name: string) => void;
    clearActiveProject: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set) => ({
            activeProjectId: null,
            activeProjectName: null,
            setActiveProject: (id, name) => set({ activeProjectId: id, activeProjectName: name }),
            clearActiveProject: () => set({ activeProjectId: null, activeProjectName: null }),
        }),
        {
            name: 'c3-aip-workspace-storage',
        }
    )
);
