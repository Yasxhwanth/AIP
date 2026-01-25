import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectionContextType {
    enabled: boolean;
    toggleProjection: () => void;
    horizonMinutes: number;
    setHorizonMinutes: (minutes: number) => void;
}

const ProjectionContext = createContext<ProjectionContextType | undefined>(undefined);

export const ProjectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [enabled, setEnabled] = useState(false);
    const [horizonMinutes, setHorizonMinutes] = useState(15);

    const toggleProjection = () => setEnabled(prev => !prev);

    return (
        <ProjectionContext.Provider value={{ enabled, toggleProjection, horizonMinutes, setHorizonMinutes }}>
            {children}
        </ProjectionContext.Provider>
    );
};

export const useProjection = () => {
    const context = useContext(ProjectionContext);
    if (!context) {
        throw new Error('useProjection must be used within a ProjectionProvider');
    }
    return context;
};
