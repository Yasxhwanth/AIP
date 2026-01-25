import React, { useState, useMemo } from 'react';
import { ArrowRight, BarChart2, Check, ChevronDown, Scale, X, FileText, Brain } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { useTime } from '../state/time/useTime';
import { useAIAdvisory } from '../context/AIAdvisoryContext';
import { DeltaEngine } from '../analysis/DeltaEngine';
import { DeltaCategory, DeltaConfidence, EntityDelta, MetricDelta } from '../analysis/delta-types';
import { DecisionJournalPanel } from './DecisionJournalPanel';
import { DecisionContext } from '../decision/decision-types';
import { TenantContextManager } from '../tenant/TenantContext';

/**
 * ScenarioComparisonView
 * 
 * Full-page view for comparing two scenarios (or Reality vs Scenario).
 * 
 * Invariants:
 * - Read-only analysis.
 * - No "Apply" or "Execute" actions.
 * - Neutral language only.
 */
const ScenarioComparisonView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { scenarios, mutationCount } = useScenario();
    const { asOf } = useTime();

    const [leftScenarioId, setLeftScenarioId] = useState<string | null>(null); // null = Reality
    const [rightScenarioId, setRightScenarioId] = useState<string | null>(null);
    const [isJournalOpen, setIsJournalOpen] = useState(false);
    const { invokeAI } = useAIAdvisory();

    // Compute Deltas
    const deltaGraph = useMemo(() => {
        return DeltaEngine.compare({
            asOf,
            leftScenarioId,
            rightScenarioId,
            ontologyVersion: "v1.0.0", // Hardcoded for Phase 15
            tenantId: TenantContextManager.getContext().tenantId,
            metrics: [
                // Example Metrics
                {
                    metricId: 'total_entities',
                    name: 'Total Entities',
                    description: 'Count of all entities',
                    unit: '',
                    calculate: (entities) => entities.length
                },
                {
                    metricId: 'active_entities',
                    name: 'Active Entities',
                    description: 'Entities with status ACTIVE',
                    unit: '',
                    calculate: (entities) => entities.filter(e => (e as any).status === 'ACTIVE').length
                }
            ]
        });
    }, [asOf, leftScenarioId, rightScenarioId, mutationCount]);

    const getScenarioName = (id: string | null) => {
        if (!id) return "REALITY (Live)";
        const s = scenarios.find(s => s.scenarioId === id);
        return s ? s.description : "Unknown Scenario";
    };

    const handleAskAI = () => {
        invokeAI(
            'comparison',
            'Explain scenario differences',
            {
                timestamp: new Date(),
                viewContext: 'comparison',
                comparison: {
                    asOf,
                    leftScenarioId,
                    rightScenarioId,
                    deltaSummary: deltaGraph.summary,
                    topEntityDeltas: deltaGraph.entities.slice(0, 5) // Capture top 5 deltas for context
                }
            }
        );
    };

    return (
        <div className="scenario-comparison-view" style={{
            position: 'relative',
            flex: 1,
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--bg-base)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                height: '64px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                backgroundColor: 'var(--surface-1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '4px',
                        backgroundColor: 'rgba(0, 102, 255, 0.1)', color: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Scale size={18} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '16px' }}>Scenario Comparison</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Analyze differences and trade-offs
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setIsJournalOpen(true)} style={{
                        padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)',
                        backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600
                    }}>
                        <FileText size={16} />
                        Record Decision
                    </button>
                    <button onClick={handleAskAI} style={{
                        padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)',
                        backgroundColor: 'var(--surface-2)', color: 'var(--accent)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600
                    }}>
                        <Brain size={16} />
                        Ask AI
                    </button>
                    <button onClick={onClose} style={{
                        padding: '8px', borderRadius: '4px', border: 'none',
                        backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer'
                    }}>
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Selectors */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 24px',
                gap: '24px',
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'var(--surface-2)'
            }}>
                <ScenarioSelector
                    label="Base State (Left)"
                    selectedId={leftScenarioId}
                    scenarios={scenarios}
                    onChange={setLeftScenarioId}
                />
                <ArrowRight size={20} color="var(--text-secondary)" />
                <ScenarioSelector
                    label="Comparison State (Right)"
                    selectedId={rightScenarioId}
                    scenarios={scenarios}
                    onChange={setRightScenarioId}
                />
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Summary Panel */}
                <div style={{ width: '300px', borderRight: '1px solid var(--border)', padding: '24px', overflowY: 'auto' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        Impact Summary
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                        <SummaryCard label="Entities Changed" value={deltaGraph.summary.totalEntitiesChanged} />
                        <SummaryCard label="Metrics Changed" value={deltaGraph.summary.totalMetricsChanged} />
                    </div>

                    <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        Key Metrics
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {deltaGraph.metrics.map(m => (
                            <MetricCard key={m.metricId} metric={m} />
                        ))}
                    </div>
                </div>

                {/* Detailed List */}
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: 'var(--surface-1)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                        Detailed Differences
                    </h3>

                    {deltaGraph.entities.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                            No differences found between these states.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '12px' }}>Entity</th>
                                    <th style={{ padding: '12px' }}>Attribute</th>
                                    <th style={{ padding: '12px' }}>{getScenarioName(leftScenarioId)}</th>
                                    <th style={{ padding: '12px' }}>{getScenarioName(rightScenarioId)}</th>
                                    <th style={{ padding: '12px' }}>Difference</th>
                                    <th style={{ padding: '12px' }}>Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deltaGraph.entities.map((delta, i) => (
                                    <tr key={`${delta.entityId}-${delta.attribute}`} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px', fontWeight: 600 }}>{delta.entityId}</td>
                                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{delta.attribute}</td>
                                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>{String(delta.leftValue ?? '-')}</td>
                                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>{String(delta.rightValue ?? '-')}</td>
                                        <td style={{ padding: '12px' }}>
                                            <DeltaBadge delta={delta} />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <ConfidenceBadge level={delta.confidence} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <DecisionJournalPanel
                isOpen={isJournalOpen}
                onClose={() => setIsJournalOpen(false)}
                context={{
                    asOf,
                    leftScenarioId,
                    rightScenarioId,
                    deltaSummary: deltaGraph.summary,
                    comparisonMetadata: { metrics: deltaGraph.metrics }
                }}
            />
        </div>
    );
};

const ScenarioSelector: React.FC<{
    label: string,
    selectedId: string | null,
    scenarios: any[],
    onChange: (id: string | null) => void
}> = ({ label, selectedId, scenarios, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{label}</label>
        <select
            value={selectedId || ""}
            onChange={(e) => onChange(e.target.value || null)}
            style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-1)',
                color: 'var(--text-primary)',
                fontSize: '13px'
            }}
        >
            <option value="">REALITY (Live)</option>
            {scenarios.map(s => (
                <option key={s.scenarioId} value={s.scenarioId}>{s.description}</option>
            ))}
        </select>
    </div>
);

const SummaryCard: React.FC<{ label: string, value: number }> = ({ label, value }) => (
    <div style={{ padding: '16px', backgroundColor: 'var(--surface-2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '24px', fontWeight: 300, color: 'var(--text-primary)' }}>{value}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</div>
    </div>
);

const MetricCard: React.FC<{ metric: MetricDelta }> = ({ metric }) => {
    const isPositive = metric.deltaValue > 0;
    const isZero = metric.deltaValue === 0;
    const color = isZero ? 'var(--text-secondary)' : (isPositive ? '#10B981' : '#EF4444'); // Green/Red but neutral context needed?
    // User requested neutral language. Green/Red is standard for increase/decrease but "Better/Worse" is judgment.
    // We will stick to colors for direction but avoid text judgment.

    return (
        <div style={{ padding: '12px', backgroundColor: 'var(--surface-2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{metric.name}</span>
                <span style={{ fontSize: '12px', color: color, fontWeight: 700 }}>
                    {isPositive ? '+' : ''}{metric.deltaValue} {metric.unit}
                </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {metric.leftValue} → {metric.rightValue} ({metric.percentChange.toFixed(1)}%)
            </div>
        </div>
    );
};

const DeltaBadge: React.FC<{ delta: EntityDelta }> = ({ delta }) => {
    // Neutral colors for categories
    let bg = 'var(--surface-3)';
    let color = 'var(--text-primary)';

    if (delta.category === 'STATE_CHANGE') { bg = 'rgba(59, 130, 246, 0.1)'; color = '#3B82F6'; } // Blue
    if (delta.category === 'QUANTITY_CHANGE') { bg = 'rgba(16, 185, 129, 0.1)'; color = '#10B981'; } // Green
    if (delta.category === 'RISK_CHANGE') { bg = 'rgba(245, 158, 11, 0.1)'; color = '#F59E0B'; } // Orange

    return (
        <span style={{
            padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
            backgroundColor: bg, color: color
        }}>
            {String(delta.deltaValue)}
        </span>
    );
};

const ConfidenceBadge: React.FC<{ level: DeltaConfidence }> = ({ level }) => {
    const opacity = level === 'HIGH' ? 1 : (level === 'MEDIUM' ? 0.7 : 0.4);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-primary)' }} />
            <span style={{ fontSize: '10px', fontWeight: 600 }}>{level}</span>
        </div>
    );
};

export default ScenarioComparisonView;
