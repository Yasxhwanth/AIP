import React, { createContext, useContext, useState, ReactNode } from 'react';

export type MapMode = 'ABSTRACT' | 'GEOGRAPHIC';

interface VisualizationContextType {
    isOverlayOpen: boolean;
    toggleOverlay: () => void;
    mapMode: MapMode;
    setMapMode: (mode: MapMode) => void;
    riskMarkersEnabled: boolean;
    setRiskMarkersEnabled: (enabled: boolean) => void;
    ghostPathsEnabled: boolean;
    setGhostPathsEnabled: (enabled: boolean) => void;
}

const VisualizationContext = createContext<VisualizationContextType | undefined>(undefined);

export const VisualizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOverlayOpen, setIsOverlayOpen] = useState(true);
    const [mapMode, setMapMode] = useState<MapMode>('ABSTRACT');
    const [riskMarkersEnabled, setRiskMarkersEnabled] = useState(true);
    const [ghostPathsEnabled, setGhostPathsEnabled] = useState(false);

    const toggleOverlay = () => setIsOverlayOpen(prev => !prev);

    return (
        <VisualizationContext.Provider value={{
            isOverlayOpen,
            toggleOverlay,
            mapMode,
            setMapMode,
            riskMarkersEnabled,
            setRiskMarkersEnabled,
            ghostPathsEnabled,
            setGhostPathsEnabled
        }}>
            {children}
        </VisualizationContext.Provider>
    );
};

export const useVisualization = () => {
    const context = useContext(VisualizationContext);
    if (!context) {
        throw new Error('useVisualization must be used within a VisualizationProvider');
    }
    return context;
};
