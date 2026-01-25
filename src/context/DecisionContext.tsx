import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DecisionJournal, DecisionJournalInput } from '../decision/decision-types';
import { decisionManager } from '../decision/DecisionJournalManager';

interface DecisionContextType {
    decisions: DecisionJournal[];
    submitDecision: (input: DecisionJournalInput) => void;
    refreshDecisions: () => void;
}

const DecisionContext = createContext<DecisionContextType | undefined>(undefined);

export const DecisionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [decisions, setDecisions] = useState<DecisionJournal[]>([]);

    const refreshDecisions = () => {
        setDecisions(decisionManager.getAllDecisions());
    };

    useEffect(() => {
        refreshDecisions();
    }, []);

    const submitDecision = (input: DecisionJournalInput) => {
        decisionManager.submitDecision(input);
        refreshDecisions();
    };

    return (
        <DecisionContext.Provider value={{ decisions, submitDecision, refreshDecisions }}>
            {children}
        </DecisionContext.Provider>
    );
};

export const useDecisions = () => {
    const context = useContext(DecisionContext);
    if (context === undefined) {
        throw new Error('useDecisions must be used within a DecisionProvider');
    }
    return context;
};
