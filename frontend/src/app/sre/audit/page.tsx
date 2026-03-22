'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ApiClient } from '@/lib/apiClient';
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Filter,
    RefreshCcw,
    Search,
    Shield,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Database,
    FileDiff,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { Toolbar } from '@/components/ui/Toolbar';
import { useWorkspaceStore } from '@/store/workspaceStore';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuditEntry {
    id: string;
    actor: string;
    actorRole?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    projectId?: string;
    status?: string;
    occurredAt: string;
    before?: any;
    after?: any;
    metadata?: any;
}

interface AuditPage {
    total: number;
    page: number;
    limit: number;
    logs: AuditEntry[];
}

// ─── Action Color ─────────────────────────────────────────────────────────────
const actionColor = (action: string): string => {
    const a = action.toUpperCase();
    if (a.includes('DELETE') || a.includes('REJECT') || a.includes('DENIED') || a.includes('BLOCK'))
        return 'text-pt-intent-danger';
    if (a.includes('CREATE') || a.includes('APPROVE') || a.includes('GRANT'))
        return 'text-pt-intent-success';
    if (a.includes('UPDATE') || a.includes('PATCH') || a.includes('PROMOTE'))
        return 'text-pt-intent-warning';
    if (a.includes('READ') || a.includes('LIST') || a.includes('GET'))
        return 'text-pt-text-muted';
    return 'text-pt-intent-primary';
};

const statusIcon = (status?: string) => {
    if (!status) return <Clock size={12} className="text-pt-text-muted opacity-40" />;
    const s = status.toUpperCase();
    if (s === 'SUCCESS' || s === 'GRANTED') return <CheckCircle2 size={12} className="text-pt-intent-success" />;
    if (s === 'FAILED' || s === 'DENIED') return <XCircle size={12} className="text-pt-intent-danger" />;
    return <Clock size={12} className="text-pt-intent-warning" />;
};

// ─── Diff Viewer ──────────────────────────────────────────────────────────────
const DiffPanel = ({ entry, open }: { entry: AuditEntry; open: boolean }) => {
    if (!open || (!entry.before && !entry.after && !entry.metadata)) return null;
    return (
        <tr>
            <td colSpan={6} className="px-6 pb-4">
                <div className="bg-pt-bg border border-pt-border rounded p-4 space-y-3">
                    {entry.before && (
                        <div>
                            <div className="text-[8px] font-black text-pt-intent-danger uppercase mb-1.5 tracking-widest">Before</div>
                            <pre className="text-[9px] font-mono text-pt-text-muted whitespace-pre-wrap opacity-70 max-h-32 overflow-y-auto">
                                {JSON.stringify(entry.before, null, 2)}
                            </pre>
                        </div>
                    )}
                    {entry.after && (
                        <div>
                            <div className="text-[8px] font-black text-pt-intent-success uppercase mb-1.5 tracking-widest">After</div>
                            <pre className="text-[9px] font-mono text-pt-text-muted whitespace-pre-wrap opacity-70 max-h-32 overflow-y-auto">
                                {JSON.stringify(entry.after, null, 2)}
                            </pre>
                        </div>
                    )}
                    {entry.metadata && (
                        <div>
                            <div className="text-[8px] font-black text-pt-text-muted uppercase mb-1.5 tracking-widest">Metadata</div>
                            <pre className="text-[9px] font-mono text-pt-text-muted whitespace-pre-wrap opacity-50 max-h-24 overflow-y-auto">
                                {JSON.stringify(entry.metadata, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AuditLogPage() {
    const { activeProjectId } = useWorkspaceStore();
    const [data, setData] = useState<AuditPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [actorFilter, setActorFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit: 50 };
            if (activeProjectId) params.projectId = activeProjectId;
            if (actorFilter.trim()) params.actor = actorFilter.trim();
            if (actionFilter.trim()) params.action = actionFilter.trim();

            const result = await ApiClient.get<AuditPage>('/api/v1/telemetry/audit', params as any);
            setData(result);
            setError(null);
        } catch (e) {
            setError('AUDIT_FETCH_FAILURE');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [activeProjectId, page, actorFilter, actionFilter]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-pt-bg">
            {/* Header */}
            <header className="px-6 py-4 border-b border-pt-border bg-pt-bg-panel/20 shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <SeverityChip severity="warning" label="COMPLIANCE_AUDIT_LOG" className="text-[8px]" />
                            {data && (
                                <span className="text-[9px] font-mono text-pt-text-muted opacity-50">
                                    {data.total.toLocaleString()} TOTAL_ENTRIES
                                </span>
                            )}
                        </div>
                        <h1 className="text-xl font-black text-pt-text uppercase tracking-tight">Audit Trail</h1>
                        <p className="text-[10px] text-pt-text-muted font-bold uppercase tracking-widest mt-1">
                            Who changed what, when, and why
                        </p>
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="flex items-center gap-2 bg-pt-bg border border-pt-border px-3 py-1.5 rounded text-[9px] font-black uppercase text-pt-text-muted hover:text-pt-text transition-all"
                    >
                        <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </header>

            {/* Filters */}
            <Toolbar className="shrink-0 bg-pt-bg/50 gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="relative">
                        <User className="absolute left-2 top-1/2 -translate-y-1/2 text-pt-text-muted" size={10} />
                        <input
                            type="text"
                            placeholder="Filter by actor…"
                            value={actorFilter}
                            onChange={e => { setActorFilter(e.target.value); setPage(1); }}
                            className="bg-pt-bg border border-pt-border rounded pl-6 pr-3 py-1.5 text-[9px] font-bold uppercase w-40 focus:outline-none focus:border-pt-intent-primary transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-pt-text-muted" size={10} />
                        <input
                            type="text"
                            placeholder="Filter by action…"
                            value={actionFilter}
                            onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                            className="bg-pt-bg border border-pt-border rounded pl-6 pr-3 py-1.5 text-[9px] font-bold uppercase w-44 focus:outline-none focus:border-pt-intent-primary transition-colors"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-auto text-pt-text-muted text-[9px] font-black uppercase">
                    <Shield size={10} />
                    Immutable Log · Real-time
                </div>
            </Toolbar>

            {error && (
                <div className="mx-6 mt-4 flex items-center gap-3 p-3 rounded border border-pt-intent-danger/30 bg-pt-intent-danger/5 text-pt-intent-danger">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                </div>
            )}

            {/* Table */}
            <main className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-pt-bg text-pt-text-muted text-[8px] font-black uppercase tracking-[0.2em] border-b border-pt-border">
                            <th className="px-6 py-3 w-6"></th>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">Actor</th>
                            <th className="px-6 py-3">Action</th>
                            <th className="px-6 py-3">Resource</th>
                            <th className="px-6 py-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-pt-border/30">
                        {data?.logs.map(entry => {
                            const isExpanded = expandedId === entry.id;
                            const hasDiff = entry.before || entry.after || entry.metadata;
                            return (
                                <React.Fragment key={entry.id}>
                                    <tr
                                        className={`transition-colors group ${hasDiff ? 'cursor-pointer' : ''} ${isExpanded ? 'bg-pt-bg-panel/40' : 'hover:bg-pt-intent-primary/[0.02]'}`}
                                        onClick={() => hasDiff && setExpandedId(isExpanded ? null : entry.id)}
                                    >
                                        <td className="px-4 py-3">
                                            {hasDiff && (
                                                isExpanded
                                                    ? <ChevronUp size={10} className="text-pt-text-muted" />
                                                    : <ChevronDown size={10} className="text-pt-text-muted opacity-30 group-hover:opacity-100 transition-opacity" />
                                            )}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="text-[10px] font-bold text-pt-text">
                                                {new Date(entry.occurredAt).toLocaleString()}
                                            </div>
                                            <div className="text-[8px] text-pt-text-muted opacity-40 font-mono">
                                                {formatDistanceToNow(new Date(entry.occurredAt), { addSuffix: true })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <User size={10} className="text-pt-text-muted opacity-50 shrink-0" />
                                                <div>
                                                    <div className="text-[10px] font-bold text-pt-text uppercase">{entry.actor}</div>
                                                    {entry.actorRole && (
                                                        <div className="text-[8px] text-pt-text-muted opacity-40 font-mono">{entry.actorRole}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`text-[10px] font-black uppercase tracking-tight ${actionColor(entry.action)}`}>
                                                {entry.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Database size={10} className="text-pt-text-muted opacity-40 shrink-0" />
                                                <div>
                                                    <div className="text-[10px] font-bold text-pt-text uppercase">{entry.resourceType}</div>
                                                    {entry.resourceId && (
                                                        <div className="text-[8px] font-mono text-pt-intent-primary opacity-70 truncate max-w-[160px]">
                                                            {entry.resourceId}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {statusIcon(entry.status)}
                                                <span className="text-[8px] font-bold text-pt-text-muted uppercase opacity-60">
                                                    {entry.status || '—'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                    <DiffPanel entry={entry} open={isExpanded} />
                                </React.Fragment>
                            );
                        })}
                        {data?.logs.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="px-6 py-24 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-10">
                                        <BookOpen size={32} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">No Audit Entries Found</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </main>

            {/* Pagination */}
            {data && data.total > data.limit && (
                <div className="shrink-0 border-t border-pt-border px-6 py-3 flex items-center justify-between bg-pt-bg">
                    <span className="text-[9px] font-bold text-pt-text-muted uppercase">
                        Page {page} of {totalPages} · {data.total.toLocaleString()} entries
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="p-1.5 border border-pt-border rounded text-pt-text-muted hover:text-pt-text disabled:opacity-20 transition-colors"
                        >
                            <ChevronLeft size={12} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="p-1.5 border border-pt-border rounded text-pt-text-muted hover:text-pt-text disabled:opacity-20 transition-colors"
                        >
                            <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
