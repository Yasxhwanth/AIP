import React, { createContext, useState, ReactNode } from 'react';

/**
 * Entity Selection Context
 * 
 * Manages ONLY the selection state.
 * Data fetching is now handled by the Ontology Query Service.
 */
interface EntityContextType {
    selectedEntityId: string | null;
    selectEntity: (id: string | null) => void;
}

export const EntityContext = createContext<EntityContextType | undefined>(undefined);

export const EntityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>('HUB-NY-01');

    const selectEntity = (id: string | null) => {
        setSelectedEntityId(id);
    };

    return (
        <EntityContext.Provider value={{ selectedEntityId, selectEntity }}>
            {children}
        </EntityContext.Provider>
    );
};
