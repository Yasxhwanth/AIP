'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/apiClient';
import {
    GitPullRequest,
    Check,
    X,
    Eye,
    Clock,
    Filter,
    Search,
    RefreshCcw,
    AlertCircle,
    ChevronRight,
    History,
    FileDiff,
    Database,
    Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { Toolbar } from '@/components/ui/Toolbar';
import { useWorkspaceStore } from '@/store/workspaceStore';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ChangeRequest {
    id: string;
    resourceType: string;
    resourceId?: string;
    proposedChanges: any;
    diff?: any;
    status: string;
    createdBy: string;
    reviewedBy?: string;
    reviewedAt?: string;
    rejectionReason?: string;
    createdAt: string;
    branchName: string;
    outboxStatus?: string;
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

const JSONDiffViewer = ({ diff, proposed }: { diff: any, proposed: any }) => {
    if (!diff && !proposed) return <div className="text-[10px] text-pt-text-muted opacity-20">NO_DATA_AVAILABLE</div>;

    return (
        <div className="bg-pt-bg font-mono p-4 rounded border border-pt-border overflow-x-auto max-h-[400px]">
            <pre className="text-[10px] leading-relaxed">
                {JSON.stringify(diff || proposed, null, 2)}
            </pre>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GovernancePage() {
    const { activeProjectId } = useWorkspaceStore();
    const [requests, setRequests] = useState<ChangeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('DRAFT');
    const [selectedCr, setSelectedCr] = useState<ChangeRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchRequests = async () => {
        if (!activeProjectId) return;
        setLoading(true);
        try {
            const data = await ApiClient.get<ChangeRequest[]>('/api/v1/change-requests', {
                projectId: activeProjectId,
                status: statusFilter
            });
            setRequests(data);
            setError(null);
        } catch (err: any) {
            if (err.message && err.message.includes('403')) {
                setError('ACCESS_DENIED_403');
            } else {
                setError(`GOVERNANCE_FETCH_FAILURE: ${err.message}`);
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [activeProjectId, statusFilter]);

    const handleApprove = async (id: string) => {
        setIsProcessing(true);
        try {
            await ApiClient.patch(`/api/v1/change-requests/${id}/approve`, {});
            fetchRequests();
            setSelectedCr(null);
        } catch (err) {
            alert(`Approval failed: ${err}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async (id: string) => {
        if (!rejectionReason) {
            alert('Please provide a reason for rejection.');
            return;
        }
        setIsProcessing(true);
        try {
            await ApiClient.patch(`/api/v1/change-requests/${id}/reject`, { reason: rejectionReason });
            fetchRequests();
            setSelectedCr(null);
            setRejectionReason('');
        } catch (err) {
            alert(`Rejection failed: ${err}`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!activeProjectId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-pt-bg">
                <Shield className="w-12 h-12 text-pt-text-muted opacity-20 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-pt-text-muted">Select Project Context to Access Governance</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-pt-bg">
            <header className="px-6 py-4 border-b border-pt-border bg-pt-bg-panel/20 shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <SeverityChip severity="warning" label="PLATFORM_GOVERNANCE" className="text-[8px]" />
                            <span className="text-[9px] font-mono text-pt-text-muted opacity-50">NAMESPACE: {activeProjectId}</span>
                        </div>
                        <h1 className="text-xl font-black text-pt-text uppercase tracking-tight">Change Request Nexus</h1>
                        <p className="text-[10px] text-pt-text-muted font-bold uppercase tracking-widest mt-1">Review and synchronize platform configuration</p>
                    </div>

                    <button onClick={fetchRequests} className="flex items-center gap-2 bg-pt-bg border border-pt-border px-3 py-1.5 rounded text-[9px] font-black uppercase text-pt-text-muted hover:text-pt-text transition-all">
                        <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
                        Refresh Matrix
                    </button>
                </div>
            </header>

            <Toolbar className="shrink-0 bg-pt-bg/50">
                <div className="flex items-center gap-2">
                    {['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === status
                                ? 'bg-pt-intent-primary text-pt-text border border-pt-intent-primary'
                                : 'bg-pt-bg border border-pt-border text-pt-text-muted hover:border-pt-text-muted'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 ml-auto text-pt-text-muted font-mono text-[9px] uppercase font-bold">
                    <History size={12} />
                    <a
                        href="/sre/audit?action=ChangeRequest"
                        className="hover:text-pt-intent-primary transition-colors underline-offset-2 hover:underline"
                    >
                        View Audit Trail →
                    </a>
                </div>
            </Toolbar>

            <main className="flex-1 overflow-hidden flex p-6 gap-6">
                {/* Request List */}
                <div className="w-1/3 flex flex-col min-h-0 bg-pt-bg-panel/40 border border-pt-border rounded shrink-0">
                    <div className="p-3 border-b border-pt-border bg-pt-bg/30">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-pt-text-muted" size={12} />
                            <input
                                type="text"
                                placeholder="Search Requests..."
                                className="w-full bg-pt-bg border border-pt-border rounded px-8 py-1.5 text-[10px] uppercase font-black tracking-tight focus:outline-none focus:border-pt-intent-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {requests.map(cr => (
                            <div
                                key={cr.id}
                                onClick={() => setSelectedCr(cr)}
                                className={`p-4 border-b border-pt-border/30 cursor-pointer transition-all hover:bg-pt-intent-primary/[0.03] group ${selectedCr?.id === cr.id ? 'bg-pt-intent-primary/[0.05] border-l-2 border-l-pt-intent-primary' : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <GitPullRequest size={12} className="text-pt-intent-primary" />
                                        <span className="text-[11px] font-black uppercase text-pt-text">{cr.resourceType}</span>
                                    </div>
                                    <span className="text-[9px] font-mono text-pt-text-muted opacity-50">#{cr.id.slice(0, 8)}</span>
                                </div>
                                <div className="text-[10px] text-pt-text-muted font-bold truncate opacity-80 uppercase tracking-tight flex items-center gap-2 mt-1">
                                    {cr.branchName !== 'main' ? `BRANCH: ${cr.branchName}` : 'DIRECT_PROPOSAL'}
                                    {cr.outboxStatus && (
                                        <span className={`px-1.5 py-0.5 rounded text-[7px] font-black tracking-widest ${cr.outboxStatus === 'SENT' ? 'bg-pt-intent-success/10 text-pt-intent-success border border-pt-intent-success/20' :
                                            cr.outboxStatus === 'FAILED' ? 'bg-pt-intent-warning/10 text-pt-intent-warning border border-pt-intent-warning/20' :
                                                cr.outboxStatus === 'DEAD_LETTER' ? 'bg-pt-intent-danger/10 text-pt-intent-danger border border-pt-intent-danger/20' :
                                                    'bg-pt-bg text-pt-text-muted border border-pt-border'
                                            }`}>
                                            OUTBOX: {cr.outboxStatus}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="text-[8px] font-black text-pt-text-muted uppercase opacity-40">
                                        {formatDistanceToNow(new Date(cr.createdAt), { addSuffix: true })}
                                    </div>
                                    <div className="flex-1" />
                                    <ChevronRight size={12} className="text-pt-text-muted group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                        {requests.length === 0 && !loading && (
                            <div className="p-12 text-center text-pt-text-muted opacity-20 uppercase font-black text-[9px] tracking-[0.4em]">
                                No {statusFilter.toLowerCase()} requests
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail View */}
                <div className="flex-1 flex flex-col min-h-0 bg-pt-bg-panel/40 border border-pt-border rounded">
                    {selectedCr ? (
                        <div className="flex-1 flex flex-col min-h-0">
                            <header className="p-6 border-b border-pt-border flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <SeverityChip
                                            severity={selectedCr.status === 'APPROVED' ? 'success' : selectedCr.status === 'REJECTED' ? 'danger' : 'info'}
                                            label={selectedCr.status}
                                        />
                                        <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest">Resource: {selectedCr.resourceId || 'NEW_ENTRY'}</span>
                                    </div>
                                    <h2 className="text-lg font-black text-pt-text uppercase">{selectedCr.resourceType} Synchronization</h2>
                                </div>

                                {selectedCr.status === 'DRAFT' || selectedCr.status === 'IN_REVIEW' ? (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleApprove(selectedCr.id)}
                                            disabled={isProcessing}
                                            className="bg-pt-intent-success/10 text-pt-intent-success border border-pt-intent-success/30 px-4 py-2 rounded text-[10px] font-black uppercase flex items-center gap-2 hover:bg-pt-intent-success/20 transition-all disabled:opacity-50"
                                        >
                                            <Check size={14} />
                                            {isProcessing ? 'Applying...' : 'Approve & Apply'}
                                        </button>
                                        <button
                                            onClick={() => setSelectedCr({ ...selectedCr, status: 'REJECTING' } as any)}
                                            className="bg-pt-intent-danger/10 text-pt-intent-danger border border-pt-intent-danger/30 px-4 py-2 rounded text-[10px] font-black uppercase flex items-center gap-2 hover:bg-pt-intent-danger/20 transition-all"
                                        >
                                            <X size={14} />
                                            Reject Request
                                        </button>
                                    </div>
                                ) : null}
                            </header>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                <section>
                                    <div className="flex items-center gap-2 mb-4 text-pt-text-muted">
                                        <FileDiff size={14} />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Structural Delta</h3>
                                    </div>
                                    <JSONDiffViewer diff={selectedCr.diff} proposed={selectedCr.proposedChanges} />
                                </section>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-pt-bg/30 border border-pt-border p-4 rounded">
                                        <div className="text-[9px] font-black text-pt-text-muted uppercase mb-3 flex items-center gap-2">
                                            <Database size={12} /> Target Context
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-[9px] text-pt-text-muted uppercase">Resource Type</span>
                                                <span className="text-[9px] font-black text-pt-text uppercase">{selectedCr.resourceType}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[9px] text-pt-text-muted uppercase">Resource ID</span>
                                                <span className="text-[9px] font-mono text-pt-intent-primary">{selectedCr.resourceId || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[9px] text-pt-text-muted uppercase">Branch</span>
                                                <span className="text-[9px] font-black text-pt-intent-warning uppercase">{selectedCr.branchName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-pt-bg/30 border border-pt-border p-4 rounded">
                                        <div className="text-[9px] font-black text-pt-text-muted uppercase mb-3 flex items-center gap-2">
                                            <Shield size={12} /> Compliance Metadata
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-[9px] text-pt-text-muted uppercase">Created By</span>
                                                <span className="text-[9px] font-black text-pt-text uppercase">{selectedCr.createdBy}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[9px] text-pt-text-muted uppercase">Created At</span>
                                                <span className="text-[9px] font-black text-pt-text uppercase">{new Date(selectedCr.createdAt).toLocaleString()}</span>
                                            </div>
                                            {selectedCr.reviewedBy && (
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] text-pt-text-muted uppercase">Reviewed By</span>
                                                    <span className="text-[9px] font-black text-pt-intent-success uppercase">{selectedCr.reviewedBy}</span>
                                                </div>
                                            )}
                                            {selectedCr.outboxStatus && (
                                                <div className="flex justify-between">
                                                    <span className="text-[9px] text-pt-text-muted uppercase">Outbox Sync</span>
                                                    <span className={`text-[9px] font-black uppercase ${selectedCr.outboxStatus === 'SENT' ? 'text-pt-intent-success' :
                                                        selectedCr.outboxStatus === 'FAILED' ? 'text-pt-intent-warning' :
                                                            selectedCr.outboxStatus === 'DEAD_LETTER' ? 'text-pt-intent-danger' :
                                                                'text-pt-text'
                                                        }`}>{selectedCr.outboxStatus}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {(selectedCr as any).status === 'REJECTING' && (
                                    <div className="animate-in slide-in-from-bottom-2 bg-pt-intent-danger/5 border border-pt-intent-danger/20 p-6 rounded space-y-4">
                                        <div className="flex items-center gap-2 text-pt-intent-danger">
                                            <AlertCircle size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Formal Rejection Details</span>
                                        </div>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Specify rejection reasoning for audit trail..."
                                            className="w-full h-32 bg-pt-bg border border-pt-border rounded p-3 text-[11px] font-bold focus:outline-none focus:border-pt-intent-danger transition-colors text-pt-text"
                                        />
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setSelectedCr({ ...selectedCr, status: 'DRAFT' } as any)}
                                                className="px-4 py-2 text-[10px] font-black uppercase text-pt-text-muted hover:text-pt-text"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleReject(selectedCr.id)}
                                                disabled={isProcessing}
                                                className="bg-pt-intent-danger text-pt-text px-6 py-2 rounded text-[10px] font-black uppercase disabled:opacity-50"
                                            >
                                                Finalize Rejection
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedCr.status === 'REJECTED' && selectedCr.rejectionReason && (
                                    <div className="bg-pt-intent-danger/5 border border-pt-intent-danger/20 p-4 rounded">
                                        <div className="text-[9px] font-black text-pt-intent-danger uppercase mb-2">Rejection Reason</div>
                                        <div className="text-[11px] font-bold text-pt-text italic">"{selectedCr.rejectionReason}"</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                            <FileDiff size={48} className="mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Select Request to Review Sync Delta</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
