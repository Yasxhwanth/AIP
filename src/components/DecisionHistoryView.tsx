import React, { useState } from 'react';
import { useDecisions } from '../context/DecisionContext';
import { DecisionJournal } from '../decision/decision-types';
import { useReplay } from '../context/ReplayContext';
import { Play, Brain } from 'lucide-react';
import { useAIAdvisory } from '../context/AIAdvisoryContext';

export const DecisionHistoryView: React.FC = () => {
    const { decisions } = useDecisions();
    const { startReplay } = useReplay();
    const [selectedDecision, setSelectedDecision] = useState<DecisionJournal | null>(null);
    const { invokeAI } = useAIAdvisory();

    return (
        <div style={{ display: 'flex', height: '100%', backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            {/* List Panel */}
            <div style={{ width: '33.333333%', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Decision History</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{decisions.length} records found</p>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {decisions.length === 0 ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No decisions recorded yet.
                        </div>
                    ) : (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {decisions.map((decision) => (
                                <li
                                    key={decision.id}
                                    onClick={() => setSelectedDecision(decision)}
                                    style={{
                                        padding: '16px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--border)',
                                        backgroundColor: selectedDecision?.id === decision.id ? 'var(--surface-2)' : 'transparent',
                                        borderLeft: selectedDecision?.id === decision.id ? '4px solid var(--accent)' : 'none',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{decision.author}</span>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{decision.timestamp.toLocaleString()}</span>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{decision.justification}</p>
                                    <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)' }}>
                                        Choice: {decision.chosenScenarioId || 'None'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Detail Panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)' }}>
                {selectedDecision ? (
                    <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
                            <header style={{ marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>Decision Record</h1>
                                    <span style={{ padding: '4px 12px', backgroundColor: 'var(--surface-2)', borderRadius: '9999px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                        ID: {selectedDecision.id}
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', fontSize: '14px' }}>
                                    <div>
                                        <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Author</span>
                                        <span style={{ color: 'var(--text-primary)' }}>{selectedDecision.author}</span>
                                    </div>
                                    <div>
                                        <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Timestamp</span>
                                        <span style={{ color: 'var(--text-primary)' }}>{selectedDecision.timestamp.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button
                                        onClick={() => startReplay(selectedDecision)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            backgroundColor: '#D97706',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '4px',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Play size={16} />
                                        Replay Decision
                                    </button>
                                    <button
                                        onClick={() => {
                                            invokeAI(
                                                'decision',
                                                'Summarize decision context',
                                                {
                                                    timestamp: new Date(),
                                                    viewContext: 'decision',
                                                    decision: {
                                                        decisionId: selectedDecision.id,
                                                        chosenScenarioId: selectedDecision.chosenScenarioId,
                                                        justification: selectedDecision.justification,
                                                        deltaSummary: selectedDecision.context.deltaSummary,
                                                        authorityProofSummary: selectedDecision.authorityProof
                                                    }
                                                }
                                            );
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            backgroundColor: 'var(--surface-2)',
                                            color: '#A855F7',
                                            padding: '8px 16px',
                                            borderRadius: '4px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            border: '1px solid rgba(168, 85, 247, 0.2)'
                                        }}
                                    >
                                        <Brain size={16} />
                                        Ask AI
                                    </button>
                                </div>
                            </header>

                            <section style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent)', marginBottom: '12px' }}>Justification</h3>
                                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', padding: '24px', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                    {selectedDecision.justification}
                                </div>
                            </section>

                            <section style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent)', marginBottom: '12px' }}>Decision Context</h3>
                                <div style={{ backgroundColor: 'var(--surface-1)', borderRadius: '8px', padding: '24px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '24px', marginBottom: '24px' }}>
                                        <div>
                                            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Chosen Scenario</span>
                                            <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', backgroundColor: 'var(--bg-base)', padding: '4px 8px', borderRadius: '4px' }}>
                                                {selectedDecision.chosenScenarioId || 'None / Status Quo'}
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Context Time</span>
                                            <span style={{ color: 'var(--text-primary)' }}>
                                                {selectedDecision.context.asOf.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Compared Scenarios</span>
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                <div style={{ flex: 1, backgroundColor: 'var(--bg-base)', padding: '12px', borderRadius: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>Left</span>
                                                    {selectedDecision.context.leftScenarioId || 'None'}
                                                </div>
                                                <div style={{ flex: 1, backgroundColor: 'var(--bg-base)', padding: '12px', borderRadius: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>Right</span>
                                                    {selectedDecision.context.rightScenarioId || 'None'}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Delta Summary Snapshot</span>
                                            <pre style={{ backgroundColor: 'var(--bg-base)', padding: '16px', borderRadius: '4px', fontSize: '12px', color: '#10B981', fontFamily: 'monospace', overflowX: 'auto' }}>
                                                {JSON.stringify(selectedDecision.context.deltaSummary, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        Select a decision to view details
                    </div>
                )
                }
            </div >
        </div >
    );
};
