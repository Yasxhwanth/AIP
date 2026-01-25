import React, { createContext, useState, ReactNode } from 'react';

/**
 * Global Time Context
 * 
 * This context provides a single source of truth for the "asOf" time
 * across the entire platform. All ontology-driven components should
 * read from this context to ensure temporal consistency.
 */
interface TimeContextType {
    asOf: Date;
    setAsOf: (date: Date) => void;
}

export const TimeContext = createContext<TimeContextType | undefined>(undefined);

export const TimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Default to a time aligned with seeded ontology data for a non-empty view
    const [asOf, setAsOf] = useState<Date>(new Date('2026-01-23T10:00:00Z'));

    return (
        <TimeContext.Provider value={{ asOf, setAsOf }}>
            {children}
        </TimeContext.Provider>
    );
};

export const useTime = () => {
    const context = React.useContext(TimeContext);
    if (context === undefined) {
        throw new Error('useTime must be used within a TimeProvider');
    }
    return context;
};
