import React, { createContext, useContext, useState, useCallback } from 'react';
import { AIAdvisorySession, AIInvocationSource, AIContextSnapshot } from '../ai/ai-types';
import { AIAdvisoryService } from '../ai/AIAdvisoryService';
import { IdentityContext } from '../identity/IdentityContext';

interface AIAdvisoryContextType {
    isPanelOpen: boolean;
    currentSession: AIAdvisorySession | null;
    invokeAI: (source: AIInvocationSource, purpose: string, snapshot: AIContextSnapshot) => void;
    closePanel: () => void;
}

const AIAdvisoryContext = createContext<AIAdvisoryContextType | undefined>(undefined);

export const AIAdvisoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [currentSession, setCurrentSession] = useState<AIAdvisorySession | null>(null);

    const invokeAI = useCallback((source: AIInvocationSource, purpose: string, snapshot: AIContextSnapshot) => {
        const userId = IdentityContext.getInstance().getCurrentContext().actor_id || 'anonymous';
        const session = AIAdvisoryService.createSession(userId, source, purpose, snapshot);
        setCurrentSession(session);
        setIsPanelOpen(true);
    }, []);

    const closePanel = useCallback(() => {
        setIsPanelOpen(false);
        setCurrentSession(null); // Clear session on close as per requirements
    }, []);

    return (
        <AIAdvisoryContext.Provider value={{ isPanelOpen, currentSession, invokeAI, closePanel }}>
            {children}
        </AIAdvisoryContext.Provider>
    );
};

export const useAIAdvisory = () => {
    const context = useContext(AIAdvisoryContext);
    if (!context) {
        throw new Error('useAIAdvisory must be used within an AIAdvisoryProvider');
    }
    return context;
};
