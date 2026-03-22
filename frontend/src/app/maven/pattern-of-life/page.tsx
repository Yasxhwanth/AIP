'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/apiClient';
import { useWorkspaceStore } from '@/store/workspaceStore';
import {
    Activity,
    AlertTriangle,
    Brain,
    ChevronDown,
    Clock,
    RefreshCcw,
    Search,
    TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SeverityChip } from '@/components/ui/SeverityChip';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Entity { logicalId: string; type: string; label: string; }
interface PolData {
    logicalId: string; days: number; eventCount: number;
    track: { lat: number; lon: number; ts: string }[];
    cadence: number[];
    stats: { avgGapMinutes: number; lastGapMinutes: number; anomalyScore: number };
    aiSummary: string | null;
}

// ─── Anomaly score ring ───────────────────────────────────────────────────────
const AnomalyRing = ({ score }: { score: number }) => {
    const r = 34, circ = 2 * Math.PI * r;
    const fill = (score / 100) * circ;
    const color = score > 70 ? '#ef4444' : score > 40 ? '#f59e0b' : '#22c55e';
    return (
        <svg width={88} height={88} className="shrink-0">
            <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
            <circle cx={44} cy={44} r={r} fill="none" stroke={color} strokeWidth={6}
                strokeDasharray={`${fill} ${circ}`}
                strokeLinecap="round"
                transform="rotate(-90 44 44)" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
            <text x={44} y={44} dominantBaseline="middle" textAnchor="middle"
                fill={color} style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'monospace' }}>{score}</text>
            <text x={44} y={60} dominantBaseline="middle" textAnchor="middle"
                fill="rgba(255,255,255,0.3)" style={{ fontSize: '7px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.15em' }}>ANOMALY</text>
        </svg>
    );
};

// ─── Cadence Bar Chart ────────────────────────────────────────────────────────
const CadenceChart = ({ cadence }: { cadence: number[] }) => {
    const max = Math.max(...cadence, 1);
    return (
        <div className="flex items-end gap-px h-16">
            {cadence.map((v, h) => (
                <div key={h} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <div
                        className="w-full bg-pt-intent-primary/50 hover:bg-pt-intent-primary transition-colors rounded-sm"
                        style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? '2px' : '0' }}
                    />
                    <span className="text-[6px] text-pt-text-muted opacity-30 group-hover:opacity-100">{h}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Track Mini-Map ───────────────────────────────────────────────────────────
const TrackMap = ({ track }: { track: { lat: number; lon: number; ts: string }[] }) => {
    if (track.length < 2) return (
        <div className="h-32 flex items-center justify-center opacity-20 text-[9px] uppercase font-black">No movement data</div>
    );
    const lats = track.map(t => t.lat), lons = track.map(t => t.lon);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLon = Math.min(...lons), maxLon = Math.max(...lons);
    const W = 300, H = 120, pad = 12;
    const px = (lon: number) => ((lon - minLon) / (maxLon - minLon || 1)) * (W - pad * 2) + pad;
    const py = (lat: number) => H - (((lat - minLat) / (maxLat - minLat || 1)) * (H - pad * 2) + pad);
    const pts = track.map(t => `${px(t.lon)},${py(t.lat)}`).join(' ');

    return (
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} className="rounded border border-pt-border bg-pt-bg">
            <polyline points={pts} fill="none" stroke="rgba(16,107,163,0.6)" strokeWidth={1.5} />
            {/* Start */}
            <circle cx={px(track[0].lon)} cy={py(track[0].lat)} r={4} fill="#22c55e" />
            {/* End */}
            <circle cx={px(track[track.length - 1].lon)} cy={py(track[track.length - 1].lat)} r={4} fill="#ef4444" />
        </svg>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PatternOfLifePage() {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [days, setDays] = useState(7);
    const [polData, setPolData] = useState<PolData | null>(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const { activeProjectId } = useWorkspaceStore();

    // Load entity list
    useEffect(() => {
        ApiClient.get<any>('/api/v1/maven/intel-graph', { projectId: activeProjectId || '' })
            .then(g => {
                const ents = g.nodes?.map((n: any) => ({ logicalId: n.id, type: n.type, label: n.label })) || [];
                setEntities(ents);
                if (ents.length > 0 && !selectedId) setSelectedId(ents[0].logicalId);
            }).catch(console.error);
    }, [activeProjectId]);

    // Load PoL for selected entity
    useEffect(() => {
        if (!selectedId) return;
        setLoading(true); setPolData(null);
        ApiClient.get<PolData>(`/api/v1/maven/pattern-of-life/${encodeURIComponent(selectedId)}`, {
            days: String(days), projectId: activeProjectId || ''
        }).then(setPolData).catch(console.error).finally(() => setLoading(false));
    }, [selectedId, days, activeProjectId]);

    const filtered = entities.filter(e =>
        !search || e.label.toLowerCase().includes(search.toLowerCase()) || e.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Entity Picker */}
            <aside className="w-56 border-r border-pt-border flex flex-col shrink-0 bg-pt-bg-panel/30">
                <div className="p-3 border-b border-pt-border">
                    <div className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted mb-2">Select Entity</div>
                    <div className="relative">
                        <Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2 text-pt-text-muted" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search..." className="w-full bg-pt-bg border border-pt-border rounded pl-6 py-1 text-[9px] focus:outline-none focus:border-pt-intent-primary" />
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                        {[3, 7, 14, 30].map(d => (
                            <button key={d} onClick={() => setDays(d)}
                                className={`flex-1 py-0.5 text-[8px] font-black rounded border transition-all ${days === d ? 'bg-pt-intent-primary/20 border-pt-intent-primary text-pt-text' : 'border-pt-border text-pt-text-muted hover:border-pt-border-dark'}`}>
                                {d}d
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filtered.map(e => (
                        <button key={e.logicalId} onClick={() => setSelectedId(e.logicalId)}
                            className={`w-full text-left px-3 py-2.5 border-b border-pt-border/30 transition-all hover:bg-pt-intent-primary/5 ${selectedId === e.logicalId ? 'bg-pt-intent-primary/10 border-l-2 border-l-pt-intent-primary' : ''}`}>
                            <div className="text-[9px] font-black uppercase text-pt-text truncate">{e.label}</div>
                            <div className="text-[8px] text-pt-text-muted opacity-50">{e.type}</div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Analysis Panel */}
            <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <RefreshCcw size={20} className="animate-spin text-pt-text-muted opacity-20" />
                    </div>
                ) : !polData ? (
                    <div className="flex items-center justify-center h-full opacity-20">
                        <div className="text-center">
                            <Brain size={40} className="mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Select an entity to begin analysis</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-4xl">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-pt-text uppercase tracking-tight">{polData.logicalId}</h2>
                                <p className="text-[10px] text-pt-text-muted">{polData.eventCount} events over {polData.days}d · Avg gap: {polData.stats.avgGapMinutes}min</p>
                            </div>
                            <AnomalyRing score={polData.stats.anomalyScore} />
                        </div>

                        {/* AI Summary */}
                        {polData.aiSummary && (
                            <div className={`p-4 rounded border ${polData.stats.anomalyScore > 50 ? 'border-red-500/30 bg-red-500/5' : 'border-pt-intent-primary/20 bg-pt-intent-primary/5'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain size={12} className={polData.stats.anomalyScore > 50 ? 'text-red-400' : 'text-pt-intent-primary'} />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted">Maven PoL Assessment</span>
                                </div>
                                <p className="text-[11px] text-pt-text leading-relaxed">{polData.aiSummary}</p>
                            </div>
                        )}

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Last Gap', value: `${polData.stats.lastGapMinutes}min`, icon: Clock, warn: polData.stats.lastGapMinutes > polData.stats.avgGapMinutes * 2 },
                                { label: 'Avg Gap', value: `${polData.stats.avgGapMinutes}min`, icon: Activity, warn: false },
                                { label: 'Events', value: String(polData.eventCount), icon: TrendingUp, warn: false },
                            ].map(({ label, value, icon: Icon, warn }) => (
                                <div key={label} className={`p-4 rounded border ${warn ? 'border-red-500/30 bg-red-500/5' : 'border-pt-border bg-pt-bg-panel/30'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon size={11} className={warn ? 'text-red-400' : 'text-pt-text-muted'} />
                                        <span className="text-[8px] font-black uppercase text-pt-text-muted">{label}</span>
                                    </div>
                                    <div className={`text-2xl font-mono font-black ${warn ? 'text-red-400' : 'text-pt-text'}`}>{value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Movement Track */}
                        <Card title="Movement Track" pill={`${polData.track.length} WAYPOINTS`}>
                            <TrackMap track={polData.track} />
                        </Card>

                        {/* Temporal Cadence */}
                        <Card title="Activity Cadence" pill="BY HOUR (UTC)">
                            <div className="px-2 pb-2">
                                <CadenceChart cadence={polData.cadence} />
                                <div className="flex justify-between text-[7px] text-pt-text-muted opacity-30 mt-1 font-mono">
                                    <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
