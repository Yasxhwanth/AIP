"use client";

import { useState, useEffect, useCallback } from "react";
import {
    GitMerge,
    Check,
    X,
    Loader2,
    Zap,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    ShieldAlert,
    Network,
    Undo2
} from "lucide-react";
import { ApiClient } from "@/lib/apiClient";
import { useWorkspaceStore } from "@/store/workspace";

interface MatchCandidate {
    id: string;
    logicalIdA: string;
    logicalIdB: string;
    entityTypeId: string;
    entityType?: { name: string };
    scoreOverall: number;
    scoreBreakdown: Record<string, number>;
    matchReasons: string[];
    status: string;
    createdAt: string;
    dataA: Record<string, unknown> | null;
    dataB: Record<string, unknown> | null;
}

interface EntityType {
    id: string;
    name: string;
}

function ScoreBadge({ score }: { score: number }) {
    const pct = Math.round(score * 100);
    const color =
        pct >= 90 ? "text-red-400 bg-red-500/10 border-red-500/30" :
            pct >= 75 ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
                "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${color}`}>
            {pct}% match
        </span>
    );
}

function EntityCompare({
    label,
    logicalId,
    data,
    highlight,
}: {
    label: string;
    logicalId: string;
    data: Record<string, unknown> | null;
    highlight?: Set<string>;
}) {
    return (
        <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</div>
            <div className="font-mono text-xs text-cyan-300 mb-2 truncate">{logicalId}</div>
            <div className="space-y-1">
                {data ? Object.entries(data).slice(0, 8).map(([k, v]) => (
                    <div
                        key={k}
                        className={`flex justify-between gap-2 px-2 py-1 rounded text-xs ${highlight?.has(k) ? "bg-amber-500/10 border border-amber-500/20" : "bg-white/[.03]"
                            }`}
                    >
                        <span className="text-slate-400 shrink-0">{k}</span>
                        <span className="text-slate-200 truncate font-mono">{String(v ?? "—")}</span>
                    </div>
                )) : (
                    <div className="text-xs text-slate-500 italic">No data available</div>
                )}
            </div>
        </div>
    );
}

export default function ResolvePage() {
    const { activeProjectId } = useWorkspaceStore();
    const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
    const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [selectedEntityTypeId, setSelectedEntityTypeId] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("PENDING");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const fetchCandidates = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = { status: statusFilter };
            if (selectedEntityTypeId) params.entityTypeId = selectedEntityTypeId;
            const data = await ApiClient.get<MatchCandidate[]>("/api/v1/identity/candidates", params);
            setCandidates(data);
            setSelectedIds(new Set()); // Reset selection on fetch
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, selectedEntityTypeId]);

    useEffect(() => {
        fetchCandidates();
        ApiClient.get<EntityType[]>("/entity-types").then(setEntityTypes).catch(() => { });
    }, [fetchCandidates]);

    const runMatch = async () => {
        if (!selectedEntityTypeId) { alert("Select an Entity Type first to run matching."); return; }
        setRunning(true);
        try {
            const result = await ApiClient.post<{ newCandidatesCreated: number }>("/api/v1/identity/run-match", {
                entityTypeId: selectedEntityTypeId,
                threshold: 0.75,
            });
            alert(`Fuzzy match complete — ${result.newCandidatesCreated} new candidates found.`);
            fetchCandidates();
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setRunning(false);
        }
    };

    const handleMerge = async (id: string) => {
        setProcessingId(id);
        try {
            await ApiClient.post(`/api/v1/identity/candidates/${id}/merge`, {});
            setCandidates(prev => prev.filter(c => c.id !== id));
        } catch (e: any) {
            alert(`Merge failed: ${e.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        setProcessingId(id);
        try {
            await ApiClient.post(`/api/v1/identity/candidates/${id}/reject`, {});
            setCandidates(prev => prev.filter(c => c.id !== id));
            setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
        } catch (e: any) {
            alert(`Reject failed: ${e.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleBulkMerge = async () => {
        if (selectedIds.size === 0) return;
        setRunning(true);
        try {
            await ApiClient.post("/api/v1/identity/merge-batch", { candidateIds: Array.from(selectedIds) });
            fetchCandidates();
        } catch (e: any) {
            alert(`Bulk merge failed: ${e.message}`);
        } finally {
            setRunning(false);
        }
    };

    const handleRollback = async (id: string) => {
        setProcessingId(id);
        try {
            await ApiClient.post(`/api/v1/identity/rollback/${id}`, {});
            setCandidates(prev => prev.filter(c => c.id !== id));
        } catch (e: any) {
            alert(`Rollback failed: ${e.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    // Fields that differ between the two entities
    const getDivergentFields = (a: Record<string, unknown> | null, b: Record<string, unknown> | null) => {
        const div = new Set<string>();
        if (!a || !b) return div;
        const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
        for (const k of allKeys) {
            if (String(a[k] ?? "") !== String(b[k] ?? "")) div.add(k);
        }
        return div;
    };

    const pendingCount = candidates.filter(c => c.status === "PENDING").length;

    return (
        <div className="h-full w-full flex flex-col" style={{ background: "linear-gradient(180deg,#070b14 0%,#050910 100%)" }}>
            {/* Header */}
            <div
                className="shrink-0 border-b flex items-center justify-between px-6 py-4 gap-4"
                style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center">
                        <GitMerge className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white">Identity Resolution</h1>
                        <p className="text-[10px] text-slate-400">Multi-source entity deduplication queue</p>
                    </div>
                    {pendingCount > 0 && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 rounded-full">
                            {pendingCount} pending
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Entity type filter */}
                    <select
                        value={selectedEntityTypeId}
                        onChange={e => setSelectedEntityTypeId(e.target.value)}
                        className="text-xs bg-white/[.05] border border-white/10 text-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-amber-500/50"
                    >
                        <option value="">All Entity Types</option>
                        {entityTypes.map(et => (
                            <option key={et.id} value={et.id}>{et.name}</option>
                        ))}
                    </select>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="text-xs bg-white/[.05] border border-white/10 text-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-amber-500/50"
                    >
                        <option value="PENDING">Pending</option>
                        <option value="MERGED">Merged</option>
                        <option value="REJECTED">Rejected</option>
                    </select>

                    <button
                        onClick={fetchCandidates}
                        className="p-1.5 rounded-lg bg-white/[.05] border border-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={runMatch}
                        disabled={running || !selectedEntityTypeId}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg disabled:opacity-50 transition-all"
                    >
                        {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        Run Fuzzy Match
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    </div>
                ) : candidates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/[.03] border border-white/[.06] flex items-center justify-center">
                            <ShieldAlert className="w-8 h-8 text-slate-500" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-300 font-semibold">No {statusFilter.toLowerCase()} candidates</p>
                            <p className="text-slate-500 text-sm mt-1">Select an entity type and run the fuzzy matcher to find duplicates.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 max-w-5xl mx-auto">

                        {/* Bulk Action Bar */}
                        {statusFilter === "PENDING" && selectedIds.size > 0 && (
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 mb-4">
                                <span className="text-sm font-semibold text-indigo-300">
                                    {selectedIds.size} candidate{selectedIds.size !== 1 ? 's' : ''} selected
                                </span>
                                <button
                                    onClick={handleBulkMerge}
                                    disabled={running}
                                    className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white transition-colors disabled:opacity-50"
                                >
                                    {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitMerge className="w-3.5 h-3.5" />}
                                    Merge Selected
                                </button>
                            </div>
                        )}

                        {candidates.map(c => {
                            const isExpanded = expanded === c.id;
                            const divergent = getDivergentFields(c.dataA, c.dataB);
                            const isProcessing = processingId === c.id;
                            const isSelected = selectedIds.has(c.id);

                            return (
                                <div
                                    key={c.id}
                                    className={`rounded-xl border overflow-hidden transition-all ${isSelected ? 'border-indigo-500/50 bg-indigo-500/[.03]' : ''}`}
                                    style={!isSelected ? {
                                        background: "rgba(255,255,255,0.025)",
                                        borderColor: "rgba(255,255,255,0.07)",
                                    } : {}}
                                >
                                    {/* Row header */}
                                    <div className="flex items-center gap-4 px-5 py-3">
                                        {statusFilter === "PENDING" && (
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => {
                                                    const newSet = new Set(selectedIds);
                                                    if (isSelected) newSet.delete(c.id);
                                                    else newSet.add(c.id);
                                                    setSelectedIds(newSet);
                                                }}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <ScoreBadge score={c.scoreOverall} />
                                                <span className="text-[10px] font-mono text-slate-400 bg-white/[.04] px-2 py-0.5 rounded">
                                                    {c.entityType?.name ?? c.entityTypeId.slice(0, 8)}
                                                </span>
                                                <div className="flex items-center gap-2 text-xs text-slate-300">
                                                    <span className="font-mono text-cyan-400">{c.logicalIdA}</span>
                                                    <Network className="w-3 h-3 text-slate-500" />
                                                    <span className="font-mono text-cyan-400">{c.logicalIdB}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                {(c.matchReasons as string[]).slice(0, 5).map(r => (
                                                    <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[.04] text-slate-400 border border-white/[.05]">
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {statusFilter === "PENDING" && (
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => handleMerge(c.id)}
                                                    disabled={isProcessing}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                                >
                                                    {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                    Merge
                                                </button>
                                                <button
                                                    onClick={() => handleReject(c.id)}
                                                    disabled={isProcessing}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                                >
                                                    <X className="w-3 h-3" />
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {statusFilter === "MERGED" && (
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => handleRollback(c.id)}
                                                    disabled={isProcessing}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                                >
                                                    {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Undo2 className="w-3 h-3" />}
                                                    Rollback
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setExpanded(isExpanded ? null : c.id)}
                                            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                                        >
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    {/* Expanded detail */}
                                    {isExpanded && (
                                        <div className="border-t px-5 py-4 grid grid-cols-2 gap-6" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                                            <EntityCompare label="Entity A" logicalId={c.logicalIdA} data={c.dataA} highlight={divergent} />
                                            <EntityCompare label="Entity B" logicalId={c.logicalIdB} data={c.dataB} highlight={divergent} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
