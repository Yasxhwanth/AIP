'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/apiClient';
import { useWorkspaceStore } from '@/store/workspaceStore';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Eye,
    GitMerge,
    RefreshCcw,
    Swords,
    Target,
    Zap,
} from 'lucide-react';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { formatDistanceToNow } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────
interface KillChainItem {
    id: string; label: string; severity?: string; minutesInStage: number; entity?: string;
    riskTier?: string; description?: string; confidence?: number;
    executedAt?: string; reviewedBy?: string;
}
interface KillChainData {
    observe: KillChainItem[]; orient: KillChainItem[];
    decide: KillChainItem[]; act: KillChainItem[];
    metrics: { avgKillChainLatencyMinutes: number | null; observeCount: number; decideCount: number; actCount: number };
}

// ─── Stage column config ──────────────────────────────────────────────────────
const STAGES = [
    {
        key: 'observe' as const,
        label: 'OBSERVE',
        icon: Eye,
        color: 'text-blue-400',
        border: 'border-blue-500/20',
        bg: 'bg-blue-500/5',
        desc: 'Incoming intelligence'
    },
    {
        key: 'orient' as const,
        label: 'ORIENT',
        icon: Target,
        color: 'text-amber-400',
        border: 'border-amber-500/20',
        bg: 'bg-amber-500/5',
        desc: 'Analysis in progress'
    },
    {
        key: 'decide' as const,
        label: 'DECIDE',
        icon: GitMerge,
        color: 'text-purple-400',
        border: 'border-purple-500/20',
        bg: 'bg-purple-500/5',
        desc: 'Awaiting commander review'
    },
    {
        key: 'act' as const,
        label: 'ACT',
        icon: Zap,
        color: 'text-green-400',
        border: 'border-green-500/20',
        bg: 'bg-green-500/5',
        desc: 'Executed actions'
    },
];

// ─── OODA Item card ───────────────────────────────────────────────────────────
const OodaCard = ({ item, stage }: { item: KillChainItem; stage: typeof STAGES[number] }) => {
    const isUrgent = item.minutesInStage > 15 && stage.key !== 'act';
    return (
        <div className={`p-3 rounded border transition-all ${isUrgent ? 'border-red-500/30 bg-red-500/5' : `${stage.border} ${stage.bg}`}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[9px] font-black uppercase text-pt-text leading-tight line-clamp-2 flex-1">
                    {item.label}
                </span>
                {item.severity && <SeverityChip severity={item.severity} />}
                {item.riskTier && (
                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${item.riskTier === 'high' ? 'border-red-500/30 text-red-400 bg-red-500/5' :
                            item.riskTier === 'medium' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' :
                                'border-pt-border text-pt-text-muted'
                        }`}>{item.riskTier}</span>
                )}
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-pt-text-muted">
                <span className={`flex items-center gap-1 ${isUrgent ? 'text-red-400' : 'opacity-50'}`}>
                    <Clock size={8} />
                    {stage.key === 'act' && item.executedAt
                        ? `by ${item.reviewedBy || 'commander'}`
                        : `${item.minutesInStage}m in stage`
                    }
                </span>
                {item.entity && <span className="opacity-30 truncate ml-1 max-w-20">{item.entity.slice(0, 12)}</span>}
                {typeof item.confidence === 'number' && (
                    <span className={`ml-auto ${item.confidence < 50 ? 'text-red-400' : 'text-amber-400'}`}>
                        {item.confidence}% conf
                    </span>
                )}
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KillChainPage() {
    const [data, setData] = useState<KillChainData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const { activeProjectId } = useWorkspaceStore();

    const load = () => {
        setLoading(true);
        ApiClient.get<KillChainData>('/api/v1/maven/kill-chain', { projectId: activeProjectId || '' })
            .then(d => { setData(d); setLastRefresh(new Date()); })
            .catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [activeProjectId]);

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-pt-border bg-pt-bg-panel/40">
                <div className="flex items-center gap-3">
                    <Swords size={14} className="text-pt-intent-danger" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Kill Chain Acceleration — OODA Loop</span>
                    <span className="text-[8px] text-pt-text-muted opacity-50 font-mono ml-2">
                        Updated {formatDistanceToNow(lastRefresh)} ago
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    {data && (
                        <>
                            <div className="text-right">
                                <div className="text-xs font-black font-mono text-pt-intent-danger">
                                    {data.metrics.avgKillChainLatencyMinutes !== null
                                        ? `${data.metrics.avgKillChainLatencyMinutes}min`
                                        : '—'}
                                </div>
                                <div className="text-[7px] font-black uppercase text-pt-text-muted opacity-50">Avg Decision Latency</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-black font-mono text-pt-intent-warning">{data.metrics.observeCount}</div>
                                <div className="text-[7px] font-black uppercase text-pt-text-muted opacity-50">Active Intel Items</div>
                            </div>
                        </>
                    )}
                    <button onClick={load} className="p-1.5 text-pt-text-muted hover:text-pt-text transition-colors">
                        <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* OODA Board */}
            {loading && !data ? (
                <div className="flex-1 flex items-center justify-center">
                    <RefreshCcw size={24} className="animate-spin opacity-20" />
                </div>
            ) : (
                <div className="flex-1 grid grid-cols-4 min-h-0 divide-x divide-pt-border overflow-hidden">
                    {STAGES.map(stage => {
                        const items: KillChainItem[] = data?.[stage.key] ?? [];
                        return (
                            <div key={stage.key} className="flex flex-col min-h-0 overflow-hidden">
                                {/* Column Header */}
                                <div className={`shrink-0 flex items-center gap-2 px-4 py-3 border-b border-pt-border ${stage.bg}`}>
                                    <stage.icon size={14} className={stage.color} />
                                    <span className={`text-[11px] font-black uppercase tracking-wider ${stage.color}`}>{stage.label}</span>
                                    <span className={`ml-auto text-[10px] font-mono font-black ${stage.color}`}>{items.length}</span>
                                </div>
                                <div className="text-[8px] text-pt-text-muted opacity-40 uppercase font-bold tracking-wider px-4 py-1.5 border-b border-pt-border/30">
                                    {stage.desc}
                                </div>
                                {/* Items */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                    {items.length === 0 ? (
                                        <div className="py-8 text-center opacity-15">
                                            <CheckCircle2 size={20} className="mx-auto mb-1.5" />
                                            <p className="text-[8px] font-black uppercase">Clear</p>
                                        </div>
                                    ) : items.map(item => (
                                        <OodaCard key={item.id} item={item} stage={stage} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Status bar */}
            <div className="shrink-0 h-8 border-t border-pt-border bg-pt-bg-panel/50 flex items-center px-6 gap-6 text-[8px] font-mono font-black text-pt-text-muted">
                <span>AUTO-REFRESH: 15s</span>
                <span className="opacity-30">|</span>
                <span className="flex items-center gap-1">
                    <AlertTriangle size={9} className="text-red-400" />
                    ITEMS DWELLING {'>'}15min ARE FLAGGED RED
                </span>
            </div>
        </div>
    );
}
