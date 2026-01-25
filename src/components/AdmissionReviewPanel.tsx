import React, { useState, useEffect } from 'react';
import {
    AdmissionCase,
    AdmissionDecision,
    AdmissionDiff,
    RelationshipAdmissionCase
} from '../ontology/admission/truth-admission-types';
import { truthAdmissionEngine } from '../ontology/admission/TruthAdmissionEngine';
import { relationshipAdmissionEngine } from '../ontology/admission/RelationshipAdmissionEngine';
import { materializationEngine } from '../ontology/materialization/TruthMaterializationEngine';
import { TenantContextManager } from '../tenant/TenantContext';

export const AdmissionReviewPanel: React.FC = () => {
    const tenantId = TenantContextManager.getContext().tenantId;
    const [entityCases, setEntityCases] = useState<AdmissionCase[]>([]);
    const [relationshipCases, setRelationshipCases] = useState<RelationshipAdmissionCase[]>([]);
    const [selectedCase, setSelectedCase] = useState<AdmissionCase | RelationshipAdmissionCase | null>(null);
    const [justification, setJustification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadCases();
        const interval = setInterval(loadCases, 5000);
        return () => clearInterval(interval);
    }, [tenantId]);

    const loadCases = () => {
        setEntityCases(truthAdmissionEngine.getPendingCases());
        setRelationshipCases(relationshipAdmissionEngine.getPendingCases());
    };

    const handleSelectCase = (c: AdmissionCase | RelationshipAdmissionCase) => {
        setSelectedCase(c);
        setJustification('');
    };

    const isRelationshipCase = (c: AdmissionCase | RelationshipAdmissionCase): c is RelationshipAdmissionCase => {
        return 'is_new_relationship' in (c.diff as any);
    };

    const handleSubmit = async (decision: AdmissionDecision) => {
        if (!selectedCase) return;
        if (!justification.trim()) {
            alert('Justification is required.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isRelationshipCase(selectedCase)) {
                await relationshipAdmissionEngine.submitDecision(
                    selectedCase.id,
                    decision,
                    justification,
                    'CURRENT_USER'
                );
                if (decision === AdmissionDecision.APPROVED) {
                    await materializationEngine.applyRelationshipAdmissionDecision(selectedCase.id);
                }
            } else {
                await truthAdmissionEngine.submitDecision(
                    selectedCase.id,
                    decision,
                    justification,
                    'CURRENT_USER'
                );
                if (decision === AdmissionDecision.APPROVED) {
                    await materializationEngine.applyAdmissionDecision(selectedCase.id);
                }
            }

            loadCases();
            setSelectedCase(null);
            setJustification('');
        } catch (error) {
            console.error('Failed to submit decision:', error);
            alert('Failed to submit decision: ' + String(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admission-review-panel" style={{ display: 'flex', height: '100%', gap: '1rem', padding: '1rem' }}>
            <div className="case-list" style={{ width: '300px', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
                <h3>Pending Admission ({entityCases.length + relationshipCases.length})</h3>
                
                {entityCases.length > 0 && <h4>Entities</h4>}
                {entityCases.map(c => (
                    <div
                        key={c.id}
                        onClick={() => handleSelectCase(c)}
                        style={{
                            padding: '0.5rem',
                            cursor: 'pointer',
                            background: selectedCase?.id === c.id ? '#e0e0e0' : 'transparent',
                            borderBottom: '1px solid #eee'
                        }}
                    >
                        <div><strong>E:</strong> {c.id.slice(0, 8)}</div>
                        <div><small>{c.diff.is_new_entity ? 'New Entity' : 'Update'}</small></div>
                    </div>
                ))}

                {relationshipCases.length > 0 && <h4>Relationships</h4>}
                {relationshipCases.map(c => (
                    <div
                        key={c.id}
                        onClick={() => handleSelectCase(c)}
                        style={{
                            padding: '0.5rem',
                            cursor: 'pointer',
                            background: selectedCase?.id === c.id ? '#e0e0e0' : 'transparent',
                            borderBottom: '1px solid #eee'
                        }}
                    >
                        <div><strong>R:</strong> {c.id.slice(0, 8)}</div>
                        <div><small>{(c.diff as any).is_new_relationship ? 'New Rel' : 'Update'}</small></div>
                    </div>
                ))}
            </div>

            <div className="case-detail" style={{ flex: 1, overflowY: 'auto' }}>
                {selectedCase ? (
                    <div>
                        <h2>Review Case: {selectedCase.id}</h2>
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Type:</strong> {isRelationshipCase(selectedCase) ? 'Relationship' : 'Entity'}
                        </div>

                        <h3>Changes</h3>
                        <DiffView diff={selectedCase.diff} />

                        <div style={{ marginTop: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
                            <h3>Decision</h3>
                            <textarea
                                value={justification}
                                onChange={e => setJustification(e.target.value)}
                                placeholder="Enter justification..."
                                style={{ width: '100%', height: '80px', marginBottom: '1rem' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => handleSubmit(AdmissionDecision.APPROVED)}
                                    disabled={isSubmitting}
                                    style={{ background: 'green', color: 'white', padding: '0.5rem 1rem', border: 'none', cursor: 'pointer' }}
                                >
                                    Approve & Materialize
                                </button>
                                <button
                                    onClick={() => handleSubmit(AdmissionDecision.REJECTED)}
                                    disabled={isSubmitting}
                                    style={{ background: 'red', color: 'white', padding: '0.5rem 1rem', border: 'none', cursor: 'pointer' }}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p>Select a case to review.</p>
                )}
            </div>
        </div>
    );
};

const DiffView: React.FC<{ diff: any }> = ({ diff }) => {
    const changes = diff.changes || diff.property_changes || {};
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Field</th>
                    <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>Old</th>
                    <th style={{ padding: '0.5rem', border: '1px solid #ddd' }}>New</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(changes).map(([field, change]: [string, any]) => (
                    <tr key={field}>
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{field}</td>
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd', background: '#ffebee' }}>
                            {JSON.stringify(change.old)}
                        </td>
                        <td style={{ padding: '0.5rem', border: '1px solid #ddd', background: '#e8f5e9' }}>
                            {JSON.stringify(change.new)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
