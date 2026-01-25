import React from 'react';
import { useReplay } from '../context/ReplayContext';
import { ChevronRight, ChevronLeft, Play, ShieldCheck, Clock, GitBranch, Scale, MessageSquare, CheckCircle } from 'lucide-react';
import { TimelineEventType } from '../replay/replay-types';

export const ReplayTimelineView: React.FC = () => {
    const { activeTimeline, currentEventIndex, nextStep, prevStep, setStep, exitReplay } = useReplay();

    if (!activeTimeline) return null;

    const events = activeTimeline.events;
    const currentEvent = events[currentEventIndex];

    const getIcon = (type: TimelineEventType) => {
        switch (type) {
            case 'SYSTEM_CONTEXT': return <ShieldCheck size={16} />;
            case 'BASE_REALITY_SNAPSHOT': return <Clock size={16} />;
            case 'SCENARIO_BRANCHES': return <GitBranch size={16} />;
            case 'COMPARISON_VIEW': return <Scale size={16} />;
            case 'AI_EXPLANATION': return <MessageSquare size={16} />;
            case 'HUMAN_DECISION': return <CheckCircle size={16} />;
            default: return <Play size={16} />;
        }
    };

    return (
        <div className="fixed inset-y-0 left-0 w-80 bg-gray-900 border-r border-yellow-500/30 flex flex-col z-[2000] shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-yellow-900/20 border-b border-yellow-500/30">
                <div className="flex items-center gap-2 text-yellow-500 mb-1">
                    <ShieldCheck size={20} />
                    <span className="font-bold tracking-wider text-sm">COMPLIANCE REPLAY</span>
                </div>
                <div className="text-xs text-yellow-500/70 font-mono">
                    ID: {activeTimeline.decisionId.substring(0, 8)}...
                </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700" />

                    {events.map((event, index) => {
                        const isActive = index === currentEventIndex;
                        const isPast = index < currentEventIndex;

                        return (
                            <div
                                key={index}
                                className={`relative pl-10 pb-8 cursor-pointer group ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
                                onClick={() => setStep(index)}
                            >
                                {/* Dot */}
                                <div className={`absolute left-2.5 -translate-x-1/2 w-3 h-3 rounded-full border-2 transition-colors
                                    ${isActive ? 'bg-yellow-500 border-yellow-500' : (isPast ? 'bg-gray-700 border-gray-500' : 'bg-gray-900 border-gray-700')}
                                `} />

                                {/* Content */}
                                <div className={`transition-all ${isActive ? 'scale-105 origin-left' : ''}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-mono ${isActive ? 'text-yellow-400' : 'text-gray-500'}`}>
                                            {event.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className={`text-sm font-bold mb-1 flex items-center gap-2 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                        {getIcon(event.eventType)}
                                        {event.eventType.replace(/_/g, ' ')}
                                    </div>

                                    {/* Payload Preview (Only for active) */}
                                    {isActive && (
                                        <div className="mt-2 p-2 bg-gray-800/50 rounded border border-gray-700 text-xs text-gray-300 font-mono overflow-hidden">
                                            {event.eventType === 'HUMAN_DECISION' ? (
                                                <div>
                                                    <div className="text-gray-500 mb-1">Justification:</div>
                                                    <div className="italic text-white mb-2">"{event.payload.justification}"</div>
                                                    <div className="text-gray-500">Choice: {event.payload.chosenScenarioId || 'None'}</div>
                                                </div>
                                            ) : (
                                                <pre className="whitespace-pre-wrap break-all">
                                                    {JSON.stringify(event.payload, (key, value) => {
                                                        if (key === 'deltaSummary') return '[DeltaSummary Snapshot]';
                                                        return value;
                                                    }, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 border-t border-gray-800 bg-gray-900">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <button
                        onClick={prevStep}
                        disabled={currentEventIndex === 0}
                        className="p-2 rounded hover:bg-gray-800 disabled:opacity-50 text-gray-400 hover:text-white"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-xs font-mono text-gray-500">
                        STEP {currentEventIndex + 1} / {events.length}
                    </span>
                    <button
                        onClick={nextStep}
                        disabled={currentEventIndex === events.length - 1}
                        className="p-2 rounded hover:bg-gray-800 disabled:opacity-50 text-gray-400 hover:text-white"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
                <button
                    onClick={exitReplay}
                    className="w-full py-2 px-4 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded text-sm font-bold transition-colors"
                >
                    EXIT REPLAY MODE
                </button>
            </div>
        </div>
    );
};
