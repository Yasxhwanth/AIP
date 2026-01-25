import React, { useState, useEffect } from 'react';
import { authorityLifecycleManager } from '../authority/AuthorityLifecycleManager';
import { AuthorityGrant, AuthorityRevocation } from '../authority/authority-types';

export const AuthorityLifecycleViewer: React.FC = () => {
    const [grants, setGrants] = useState<AuthorityGrant[]>([]);
    const [revocations, setRevocations] = useState<AuthorityRevocation[]>([]);

    useEffect(() => {
        // In a real app, this would be a subscription or poll
        setGrants(authorityLifecycleManager.getAllGrants());
        setRevocations(authorityLifecycleManager.getAllRevocations());
    }, []);

    const getStatus = (grant: AuthorityGrant) => {
        const now = new Date();
        const revocation = revocations.find(r => r.grantId === grant.grantId);

        if (revocation) {
            return <span style={{ color: 'red' }}>REVOKED ({new Date(revocation.revokedAt).toLocaleTimeString()})</span>;
        }

        if (grant.validUntil && new Date(grant.validUntil) < now) {
            return <span style={{ color: 'gray' }}>EXPIRED</span>;
        }

        if (new Date(grant.validFrom) > now) {
            return <span style={{ color: 'orange' }}>PENDING</span>;
        }

        return <span style={{ color: 'green' }}>ACTIVE</span>;
    };

    return (
        <div className="authority-lifecycle-viewer" style={{ padding: '20px', backgroundColor: '#1e1e1e', color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
            <h2>Authority Lifecycle</h2>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #444', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>Grant ID</th>
                        <th style={{ padding: '8px' }}>From</th>
                        <th style={{ padding: '8px' }}>To</th>
                        <th style={{ padding: '8px' }}>Intent</th>
                        <th style={{ padding: '8px' }}>Type</th>
                        <th style={{ padding: '8px' }}>Status</th>
                        <th style={{ padding: '8px' }}>Valid Window</th>
                    </tr>
                </thead>
                <tbody>
                    {grants.map(grant => (
                        <tr key={grant.grantId} style={{ borderBottom: '1px solid #333' }}>
                            <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '0.9em' }}>{grant.grantId.substring(0, 8)}...</td>
                            <td style={{ padding: '8px' }}>{grant.fromNodeId}</td>
                            <td style={{ padding: '8px' }}>{grant.toNodeId}</td>
                            <td style={{ padding: '8px' }}>{grant.intent}</td>
                            <td style={{ padding: '8px' }}>
                                {grant.isEmergency ? (
                                    <span style={{ backgroundColor: '#ff4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8em' }}>EMERGENCY</span>
                                ) : 'Standard'}
                            </td>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{getStatus(grant)}</td>
                            <td style={{ padding: '8px', fontSize: '0.9em' }}>
                                {new Date(grant.validFrom).toLocaleTimeString()} -
                                {grant.validUntil ? new Date(grant.validUntil).toLocaleTimeString() : '∞'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {grants.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                    No authority grants found.
                </div>
            )}
        </div>
    );
};
