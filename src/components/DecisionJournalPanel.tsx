import React, { useState } from 'react';
import { DecisionContext, DecisionJournalInput } from '../decision/decision-types';
import { useDecisions } from '../context/DecisionContext';

interface DecisionJournalPanelProps {
    isOpen: boolean;
    onClose: () => void;
    context: DecisionContext;
}

export const DecisionJournalPanel: React.FC<DecisionJournalPanelProps> = ({ isOpen, onClose, context }) => {
    const { submitDecision } = useDecisions();
    const [justification, setJustification] = useState('');
    const [chosenScenarioId, setChosenScenarioId] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!justification.trim()) {
            alert("Justification is required.");
            return;
        }

        const input: DecisionJournalInput = {
            author: "Current User", // In a real app, get from AuthContext
            justification,
            chosenScenarioId,
            context,
        };

        submitDecision(input);
        setIsSubmitted(true);

        // Reset form after a delay or let user close
        setTimeout(() => {
            onClose();
            // Reset state for next time (though component might be unmounted)
            setJustification('');
            setChosenScenarioId(null);
            setIsSubmitted(false);
        }, 2000);
    };

    if (isSubmitted) {
        return (
            <div className="fixed inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col items-center justify-center">
                <div className="text-green-500 text-4xl mb-4">✓</div>
                <h2 className="text-xl font-bold text-white mb-2">Decision Recorded</h2>
                <p className="text-gray-400 text-center">Your decision has been permanently logged.</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-700 shadow-2xl flex flex-col z-50">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Record Decision</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Context Snapshot</h3>
                    <div className="bg-gray-800 rounded p-3 text-sm text-gray-300">
                        <p><strong>As Of:</strong> {context.asOf.toLocaleString()}</p>
                        <p><strong>Left Scenario:</strong> {context.leftScenarioId || 'None'}</p>
                        <p><strong>Right Scenario:</strong> {context.rightScenarioId || 'None'}</p>
                        <div className="mt-2 border-t border-gray-700 pt-2">
                            <strong>Delta Summary:</strong>
                            <pre className="text-xs mt-1 overflow-x-auto">
                                {JSON.stringify(context.deltaSummary, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Choice</h3>
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="scenario"
                                checked={chosenScenarioId === context.leftScenarioId}
                                onChange={() => setChosenScenarioId(context.leftScenarioId)}
                                disabled={!context.leftScenarioId}
                                className="form-radio text-blue-500"
                            />
                            <span className="text-gray-300">Left Scenario ({context.leftScenarioId || 'N/A'})</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="scenario"
                                checked={chosenScenarioId === context.rightScenarioId}
                                onChange={() => setChosenScenarioId(context.rightScenarioId)}
                                disabled={!context.rightScenarioId}
                                className="form-radio text-blue-500"
                            />
                            <span className="text-gray-300">Right Scenario ({context.rightScenarioId || 'N/A'})</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="scenario"
                                checked={chosenScenarioId === null}
                                onChange={() => setChosenScenarioId(null)}
                                className="form-radio text-blue-500"
                            />
                            <span className="text-gray-300">Neither / Status Quo</span>
                        </label>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Justification <span className="text-red-500">*</span></h3>
                    <textarea
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        className="w-full h-32 bg-gray-800 border border-gray-700 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
                        placeholder="Explain why you made this decision..."
                    />
                </div>

                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded p-3 mb-4">
                    <p className="text-yellow-500 text-xs">
                        <strong>Warning:</strong> Decisions are immutable. Once submitted, this record cannot be edited or deleted.
                    </p>
                </div>
            </div>

            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Submit Decision
                </button>
            </div>
        </div>
    );
};
