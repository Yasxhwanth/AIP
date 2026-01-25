import React from 'react';
import { Brain, Link2, BarChart3, FileSearch, ExternalLink } from 'lucide-react';

const AIRecommendation: React.FC = () => {
    return (
        <div className="card fade-in" style={{ margin: '16px', border: '1px solid rgba(0, 102, 255, 0.3)', backgroundColor: 'rgba(0, 102, 255, 0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Brain size={18} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>ANALYST BRIEFING</span>
            </div>

            <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '16px' }}>
                <p style={{ marginBottom: '8px' }}>
                    <strong>Summary:</strong> Critical inventory shortage detected at <strong>HUB-NY-01</strong>.
                    Current levels for <strong>Component X-99</strong> are at 12%, below the 15% safety threshold.
                </p>
                <p>
                    <strong>Recommendation:</strong> Re-route 500 units from <strong>HUB-LDN-02</strong> via
                    Express Air Freight. This will restore safety stock within 24h and mitigate a 15% production risk.
                </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Traceability</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Link2 size={12} style={{ color: 'var(--text-secondary)' }} />
                            <span>Evidence: Inventory Logs</span>
                        </div>
                        <ExternalLink size={12} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <BarChart3 size={12} style={{ color: 'var(--text-secondary)' }} />
                            <span>Simulation: Impact Analysis</span>
                        </div>
                        <ExternalLink size={12} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileSearch size={12} style={{ color: 'var(--text-secondary)' }} />
                            <span>Reasoning: Demand Forecast</span>
                        </div>
                        <ExternalLink size={12} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIRecommendation;
