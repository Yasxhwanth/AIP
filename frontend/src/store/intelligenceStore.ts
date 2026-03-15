
import { create } from 'zustand';
import { PageId, AipContextSelection } from '@/lib/aipTypes';

interface IntelligenceState {
    activePage: PageId;
    selection: AipContextSelection;

    // Actions
    setContext: (page: PageId, selection: AipContextSelection) => void;
    updateSelection: (selection: Partial<AipContextSelection>) => void;
    setVar: (name: string, value: any) => void;
    clearVars: () => void;
}

export const useIntelligenceStore = create<IntelligenceState>((set) => ({
    activePage: 'terminal', // Default fallback
    selection: { vars: {} },

    setContext: (page, selection) => set({
        activePage: page,
        selection: { ...selection, vars: selection.vars || {} }
    }),
    updateSelection: (selection) => set((state) => ({
        selection: { ...state.selection, ...selection }
    })),
    setVar: (name, value) => set((state) => ({
        selection: {
            ...state.selection,
            vars: { ...state.selection.vars, [name]: value }
        }
    })),
    clearVars: () => set((state) => ({
        selection: { ...state.selection, vars: {} }
    })),
}));
