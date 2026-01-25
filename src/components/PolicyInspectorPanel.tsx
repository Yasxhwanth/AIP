import React, { useState, useEffect } from 'react';
import { policyEvaluator } from '../policy/PolicyEvaluator';
import { PolicyEvaluationResult, PolicyEvaluationStatus, PolicyProposal } from '../policy/policy-types';
import { AuthoritySnapshot } from '../authority/authority-types';

interface PolicyInspectorPanelProps {
    proposal?: PolicyProposal;
    snapshot?: AuthoritySnapshot;
    asOf?: Date;
}

export const PolicyInspectorPanel: React.FC<PolicyInspectorPanelProps> = ({ proposal, snapshot, asOf }) => {
    const [results, setResults] = useState<PolicyEvaluationResult[]>([]);

    useEffect(() => {
        if (proposal && snapshot && asOf) {
            const evalResults = policyEvaluator.evaluate(proposal, snapshot, asOf);
            setResults(evalResults);
        } else {
            setResults([]);
        }
    }, [proposal, snapshot, asOf]);

    if (!proposal) {
        return <div className="p-4 text-secondary">Select an action to inspect policies.</div>;
    }

    return (
        <div className="card flex flex-col gap-4 font-sans text-primary">
            <h3 className="text-lg font-bold">Policy Inspector</h3>
            <div className="text-sm text-secondary mb-2">
                Evaluating: <strong>{proposal.actionType}</strong> on <strong>{proposal.targetEntityId}</strong>
            </div>

            {results.length === 0 ? (
                <div className="p-4 border border-dashed border-border rounded">
                    No applicable policies found.
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {results.map(result => (
                        <div key={result.policyId} className="p-4 rounded bg-surface-1" style={{
                            borderLeft: `4px solid ${getStatusColor(result.status)}`
                        }}>
                            <div className="flex justify-between items-center">
                                <span className="font-bold">{result.policyName}</span>
                                <span className="status-badge" style={{
                                    backgroundColor: getStatusColor(result.status)
                                }}>
                                    {result.status}
                                </span>
                            </div>
                            <div className="mt-2 text-sm">
                                {result.explanation}
                            </div>
                            {result.evidence && Object.keys(result.evidence).length > 0 && (
                                <div className="mt-2 text-xs text-secondary font-mono">
                                    Evidence: {JSON.stringify(result.evidence)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

function getStatusColor(status: PolicyEvaluationStatus): string {
    switch (status) {
        case PolicyEvaluationStatus.PASS: return '#4caf50';
        case PolicyEvaluationStatus.WARN: return '#ff9800';
        case PolicyEvaluationStatus.BLOCK: return '#f44336';
        default: return '#9e9e9e';
    }
}
