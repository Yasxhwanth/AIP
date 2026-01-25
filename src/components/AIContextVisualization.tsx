import React from 'react';
import { Database, TrendingUp, FileText, Eye } from 'lucide-react';
import { AIAdvisorySession, AIContextSnapshot } from '../ai/ai-types';

interface AIContextVisualizationProps {
    session: AIAdvisorySession | null;
}

/**
 * AIContextVisualization
 * 
 * Shows users exactly what data the AI analyzed.
 * Provides transparency into AI decision-making.
 * 
 * INVARIANTS:
 * - Read-only display
 * - No business logic
 * - Works with any ontology structure
 */
export const AIContextVisualization: React.FC<AIContextVisualizationProps> = ({ session }) => {
    if (!session) {
        return (
            <div style={{
                padding: '24px',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                textAlign: 'center'
            }}>
                No active AI session. Start an analysis to see what data is being used.
            </div>
        );
    }

    const snapshot = session.contextSnapshot;
    const latestResponse = session.history[session.history.length - 1]?.response;

    return (
        <div style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            height: '100%',
            overflowY: 'auto'
        }}>
            {/* Header */}
            <div>
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <Eye size={18} />
                    AI Context Analysis
                </h3>
                <p style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    margin: 0
                }}>
                    Showing data sources analyzed by AI for this session
                </p>
            </div>

            {/* Session Info */}
            <div style={{
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '11px'
            }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Session ID</div>
                <div style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {session.sessionId.slice(0, 8)}...
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '4px' }}>Source</div>
                <div style={{ color: 'var(--text-primary)' }}>{session.invocationSource}</div>
            </div>

            {/* Data Sources Used */}
            {latestResponse?.dataSources && latestResponse.dataSources.length > 0 && (
                <div>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <Database size={14} />
                        Data Sources Analyzed
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {latestResponse.dataSources.map((source, idx) => (
                            <div
                                key={idx}
                                style={{
                                    backgroundColor: 'var(--surface-2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '4px',
                                    padding: '10px',
                                    fontSize: '12px',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                {source}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Context Breakdown */}
            <div>
                <div style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <FileText size={14} />
                    Context Snapshot
                </div>

                {/* Comparison Context */}
                {snapshot.comparison && (
                    <div style={{
                        backgroundColor: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '12px'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--accent)',
                            marginBottom: '8px'
                        }}>
                            Scenario Comparison
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            Left: {snapshot.comparison.leftScenarioId || 'REALITY'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            Right: {snapshot.comparison.rightScenarioId || 'REALITY'}
                        </div>
                        {snapshot.comparison.topEntityDeltas && snapshot.comparison.topEntityDeltas.length > 0 && (
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                Entities Compared: {snapshot.comparison.topEntityDeltas.length}
                            </div>
                        )}
                    </div>
                )}

                {/* Execution Context */}
                {snapshot.execution && (
                    <div style={{
                        backgroundColor: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '12px'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--accent)',
                            marginBottom: '8px'
                        }}>
                            Execution Context
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            Intent ID: {snapshot.execution.intentId}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            Status: {snapshot.execution.status}
                        </div>
                        {snapshot.execution.impactedEntities && snapshot.execution.impactedEntities.length > 0 && (
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                                Impacted Entities: {snapshot.execution.impactedEntities.length}
                            </div>
                        )}
                    </div>
                )}

                {/* Decision Context */}
                {snapshot.decision && (
                    <div style={{
                        backgroundColor: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '12px'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--accent)',
                            marginBottom: '8px'
                        }}>
                            Decision Context
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            Decision ID: {snapshot.decision.decisionId}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            Chosen: {snapshot.decision.chosenScenarioId || 'None'}
                        </div>
                    </div>
                )}

                {/* Selected Entities */}
                {snapshot.selectedEntityIds && snapshot.selectedEntityIds.length > 0 && (
                    <div style={{
                        backgroundColor: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '12px'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--accent)',
                            marginBottom: '8px'
                        }}>
                            Selected Entities
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {snapshot.selectedEntityIds.length} entity{snapshot.selectedEntityIds.length !== 1 ? 'ies' : ''} selected
                        </div>
                        <div style={{
                            marginTop: '8px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '4px'
                        }}>
                            {snapshot.selectedEntityIds.slice(0, 5).map((id, idx) => (
                                <span
                                    key={idx}
                                    style={{
                                        backgroundColor: 'var(--bg-base)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '3px',
                                        padding: '2px 6px',
                                        fontSize: '10px',
                                        fontFamily: 'monospace',
                                        color: 'var(--text-secondary)'
                                    }}
                                >
                                    {id.slice(0, 8)}...
                                </span>
                            ))}
                            {snapshot.selectedEntityIds.length > 5 && (
                                <span style={{
                                    fontSize: '10px',
                                    color: 'var(--text-muted)',
                                    padding: '2px 6px'
                                }}>
                                    +{snapshot.selectedEntityIds.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Raw Context (Collapsible) */}
            <details style={{
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '12px'
            }}>
                <summary style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}>
                    Raw Context JSON
                </summary>
                <pre style={{
                    marginTop: '12px',
                    fontSize: '10px',
                    color: 'var(--text-secondary)',
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    maxHeight: '300px',
                    backgroundColor: 'var(--bg-base)',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)'
                }}>
                    {JSON.stringify(snapshot, null, 2)}
                </pre>
            </details>
        </div>
    );
};

