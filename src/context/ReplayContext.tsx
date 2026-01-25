import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DecisionJournal } from '../decision/decision-types';
import { ReplayTimeline, TimelineEvent } from '../replay/replay-types';
import { ReplayEngine } from '../replay/ReplayEngine';
import { useTime } from '../state/time/useTime';
import { useScenario } from './ScenarioContext';

interface ReplayContextType {
    isReplayMode: boolean;
    activeTimeline: ReplayTimeline | null;
    currentEventIndex: number;
    currentEvent: TimelineEvent | null;
    startReplay: (decision: DecisionJournal) => void;
    exitReplay: () => void;
    nextStep: () => void;
    prevStep: () => void;
    setStep: (index: number) => void;
}

const ReplayContext = createContext<ReplayContextType | undefined>(undefined);

export const ReplayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isReplayMode, setIsReplayMode] = useState(false);
    const [activeTimeline, setActiveTimeline] = useState<ReplayTimeline | null>(null);
    const [currentEventIndex, setCurrentEventIndex] = useState(0);

    const { setAsOf } = useTime();
    const { activateScenario, exitScenario } = useScenario();

    // When step changes, update the global state to reflect that step's context
    useEffect(() => {
        if (!isReplayMode || !activeTimeline) return;

        const event = activeTimeline.events[currentEventIndex];
        if (!event) return;

        // Apply state based on event type
        // Note: In a full implementation, we might want to be more granular.
        // For now, we ensure the time is correct for all steps.

        // Always enforce the decision time
        // In the future, if we have steps at different times (e.g. history), we'd update here.
        // But for Decision Replay, it's mostly a snapshot at 'decidedAt' or 'asOf'.
        // The 'SYSTEM_CONTEXT' event has the 'asOf' time.

        // We can look for the SYSTEM_CONTEXT or BASE_REALITY_SNAPSHOT to get the time.
        // Or just use the timeline's decidedAt? No, decidedAt is submission. asOf is context.
        // The events have timestamps.

        // Let's use the event timestamp, or the 'asOf' from the payload if available.
        if (event.payload && event.payload.asOf) {
            setAsOf(new Date(event.payload.asOf));
        }

        // Handle Scenarios
        if (event.eventType === 'COMPARISON_VIEW') {
            // Maybe we don't "activate" a scenario because ComparisonView handles two.
            // But we should probably ensure we are in a neutral state or the view handles it.
            exitScenario();
        } else if (event.eventType === 'HUMAN_DECISION') {
            // Maybe show the chosen scenario?
            if (event.payload.chosenScenarioId) {
                activateScenario(event.payload.chosenScenarioId);
            }
        }

    }, [currentEventIndex, isReplayMode, activeTimeline, setAsOf, activateScenario, exitScenario]);

    const startReplay = (decision: DecisionJournal) => {
        const timeline = ReplayEngine.assembleTimeline(decision);
        setActiveTimeline(timeline);
        setIsReplayMode(true);
        setCurrentEventIndex(0);

        // Initial State Setup
        if (decision.context.asOf) {
            setAsOf(decision.context.asOf);
        }
        exitScenario(); // Start from reality base
    };

    const exitReplay = () => {
        setIsReplayMode(false);
        setActiveTimeline(null);
        setCurrentEventIndex(0);
        // Ideally restore previous state, but for now just exiting mode is enough.
        // User can reset time manually.
    };

    const nextStep = () => {
        if (!activeTimeline) return;
        if (currentEventIndex < activeTimeline.events.length - 1) {
            setCurrentEventIndex(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentEventIndex > 0) {
            setCurrentEventIndex(prev => prev - 1);
        }
    };

    const setStep = (index: number) => {
        if (!activeTimeline) return;
        if (index >= 0 && index < activeTimeline.events.length) {
            setCurrentEventIndex(index);
        }
    };

    const currentEvent = activeTimeline ? activeTimeline.events[currentEventIndex] : null;

    return (
        <ReplayContext.Provider value={{
            isReplayMode,
            activeTimeline,
            currentEventIndex,
            currentEvent,
            startReplay,
            exitReplay,
            nextStep,
            prevStep,
            setStep
        }}>
            {children}
        </ReplayContext.Provider>
    );
};

export const useReplay = () => {
    const context = useContext(ReplayContext);
    if (context === undefined) {
        throw new Error('useReplay must be used within a ReplayProvider');
    }
    return context;
};
