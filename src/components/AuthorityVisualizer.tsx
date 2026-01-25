import React from 'react';
import { AuthorityProofSnapshot, DenialReason, AuthorityStatus } from '../authority/authority-types';

interface AuthorityVisualizerProps {
    status: AuthorityStatus;
    proof?: AuthorityProofSnapshot;
    denialReason?: DenialReason;
}

export const AuthorityVisualizer: React.FC<AuthorityVisualizerProps> = ({ status, proof, denialReason }) => {
    if (status === AuthorityStatus.DENIED) {
        return (
            <div style={{ border: '1px solid #ff4d4f', padding: '16px', borderRadius: '4px', backgroundColor: '#fff1f0' }}>
                <h3 style={{ color: '#cf1322', margin: '0 0 8px 0' }}>🚫 Authority Denied</h3>
                <div style={{ fontWeight: 'bold' }}>Reason: {denialReason?.code}</div>
                <div>{denialReason?.message}</div>
                {denialReason?.details && (
                    <pre style={{ marginTop: '8px', fontSize: '12px' }}>
                        {JSON.stringify(denialReason.details, null, 2)}
                    </pre>
                )}
            </div>
        );
    }

    if (status === AuthorityStatus.ALLOWED && proof) {
        return (
            <div style={{ border: '1px solid #52c41a', padding: '16px', borderRadius: '4px', backgroundColor: '#f6ffed' }}>
                <h3 style={{ color: '#389e0d', margin: '0 0 8px 0' }}>✅ Authorized</h3>

                <div style={{ marginBottom: '12px' }}>
                    <strong>Evaluated At:</strong> {new Date(proof.evaluatedAt).toLocaleString()}
                </div>

                <div style={{ marginBottom: '12px' }}>
                    <strong>Authority Path:</strong>
                    {proof.delegationChainIds && proof.delegationChainIds.length > 0 ? (
                        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                            {proof.delegationChainIds.map((edgeId, i) => (
                                <li key={i}>Delegated via Edge: {edgeId}</li>
                            ))}
                            <li>Final Direct Edge: {proof.matchedEdgeId}</li>
                        </ul>
                    ) : (
                        <div style={{ marginLeft: '8px' }}>Direct Authority (Edge: {proof.matchedEdgeId})</div>
                    )}
                </div>

                <div>
                    <strong>Constraints Checked:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                        {Object.entries(proof.constraintsChecked).map(([key, value]) => (
                            <li key={key}>
                                {key}: {JSON.stringify(value)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    return null;
};
