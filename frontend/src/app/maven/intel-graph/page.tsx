'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ApiClient } from '@/lib/apiClient';
import { useWorkspaceStore } from '@/store/workspaceStore';
import {
    AlertTriangle,
    Brain,
    ChevronRight,
    GitBranch,
    RefreshCcw,
    Search,
    Shield,
    ShieldAlert,
    Satellite,
    Radio,
    User,
    Truck,
    Globe,
} from 'lucide-react';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { Card } from '@/components/ui/Card';

// ─── Types ────────────────────────────────────────────────────────────────────
interface GraphNode {
    id: string; label: string; type: string; intType: string;
    status: string; hasAlert: boolean; lat: number | null; lon: number | null;
}
interface GraphEdge { source: string; target: string; relationType: string; }
interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
    summary: Record<string, any>;
}
interface Dossier {
    logicalId: string; entityType: string; currentState: any; lastSeen: string;
    activitySummary: { totalEvents: number; avgActivityGapMinutes: number | null };
    alerts: { id: string; type: string; severity: string; at: string }[];
    relationships: { relatedEntity: string; direction: string; type: string }[];
    aiAssessment: string | null;
}

// ─── INT type config ──────────────────────────────────────────────────────────
const INT_CONFIG: Record<string, { color: string; bg: string; border: string; Icon: React.ElementType }> = {
    IMINT: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', Icon: Satellite },
    SIGINT: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', Icon: Radio },
    HUMINT: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', Icon: User },
    MASINT: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', Icon: Truck },
    OSINT: { color: 'text-pt-text-muted', bg: 'bg-pt-bg', border: 'border-pt-border', Icon: Globe },
};

// ─── SVG Force-directed graph (simple spring layout) ─────────────────────────
const IntelGraphCanvas = ({
    nodes, edges, selected, onSelect
}: { nodes: GraphNode[]; edges: GraphEdge[]; selected: string | null; onSelect: (id: string) => void }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

    // Simple deterministic radial layout by INT type
    useEffect(() => {
        if (nodes.length === 0) return;
        const W = 600, H = 400;
        const cx = W / 2, cy = H / 2;
        const groups: Record<string, GraphNode[]> = {};
        nodes.forEach(n => { (groups[n.intType] ||= []).push(n); });
        const groupKeys = Object.keys(groups);
        const rOuter = Math.min(cx, cy) * 0.75;
        const pos: Record<string, { x: number; y: number }> = {};

        groupKeys.forEach((gk, gi) => {
            const groupAngle = (gi / groupKeys.length) * 2 * Math.PI;
            const gx = cx + rOuter * Math.cos(groupAngle);
            const gy = cy + rOuter * Math.sin(groupAngle);
            const grp = groups[gk];
            grp.forEach((n, ni) => {
                const spread = grp.length === 1 ? 0 : ((ni / (grp.length - 1)) - 0.5) * 60;
                pos[n.id] = {
                    x: gx + spread * Math.sin(groupAngle + Math.PI / 2),
                    y: gy + spread * Math.cos(groupAngle + Math.PI / 2),
                };
            });
        });
        setPositions(pos);
    }, [nodes]);

    const W = 600, H = 400;

    return (
        <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} className="text-pt-text">
            {/* Edges */}
            {edges.map((e, i) => {
                const s = positions[e.source]; const t = positions[e.target];
                if (!s || !t) return null;
                return (
                    <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                        stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
                );
            })}
            {/* Nodes */}
            {nodes.map(n => {
                const pos = positions[n.id];
                if (!pos) return null;
                const cfg = INT_CONFIG[n.intType] || INT_CONFIG.OSINT;
                const isSelected = n.id === selected;
                return (
                    <g key={n.id} onClick={() => onSelect(n.id)} className="cursor-pointer"
                        transform={`translate(${pos.x},${pos.y})`}>
                        <circle r={isSelected ? 10 : 7}
                            fill={n.hasAlert ? 'rgba(239,68,68,0.3)' : 'rgba(16,107,163,0.15)'}
                            stroke={n.hasAlert ? '#ef4444' : (isSelected ? '#106ba3' : 'rgba(255,255,255,0.15)')}
                            strokeWidth={isSelected ? 2 : 1}
                            className="transition-all" />
                        {n.hasAlert && <circle r={13} fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth={1} className="animate-ping" />}
                        <text y={20} textAnchor="middle" className="fill-current text-pt-text-muted"
                            style={{ fontSize: '7px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {n.label.slice(0, 10)}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

// ─── Dossier Panel ────────────────────────────────────────────────────────────
const DossierPanel = ({ logicalId, onClose }: { logicalId: string; onClose: () => void }) => {
    const [dossier, setDossier] = useState<Dossier | null>(null);
    const [loading, setLoading] = useState(true);
    const { activeProjectId } = useWorkspaceStore();

    useEffect(() => {
        setLoading(true);
        ApiClient.get<Dossier>(`/api/v1/maven/entities/${logicalId}/dossier`, { projectId: activeProjectId || '' })
            .then(setDossier).catch(console.error).finally(() => setLoading(false));
    }, [logicalId, activeProjectId]);

    return (
        <div className="w-80 border-l border-pt-border flex flex-col bg-pt-bg-panel shrink-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-pt-border">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Entity Dossier</span>
                <button onClick={onClose} className="text-pt-text-muted hover:text-pt-text text-xs">✕</button>
            </div>
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <RefreshCcw size={16} className="animate-spin text-pt-text-muted opacity-30" />
                </div>
            ) : !dossier ? (
                <div className="p-4 text-[10px] text-pt-text-muted opacity-40">Not found</div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    <div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted mb-1">Identity</div>
                        <div className="text-[11px] font-black text-pt-text font-mono">{dossier.logicalId}</div>
                        <div className="text-[9px] text-pt-text-muted">{dossier.entityType}</div>
                    </div>
                    {dossier.aiAssessment && (
                        <div className="p-3 rounded border border-pt-intent-primary/20 bg-pt-intent-primary/5">
                            <div className="text-[8px] font-black uppercase tracking-widest text-pt-intent-primary mb-1.5">AI Assessment</div>
                            <p className="text-[10px] text-pt-text leading-relaxed">{dossier.aiAssessment}</p>
                        </div>
                    )}
                    <div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted mb-2">Active Alerts ({dossier.alerts.length})</div>
                        {dossier.alerts.length === 0 ? <div className="text-[9px] opacity-30">None</div> :
                            dossier.alerts.map(a => (
                                <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-pt-border/30">
                                    <span className="text-[9px] font-bold truncate mr-2">{a.type}</span>
                                    <SeverityChip severity={a.severity} />
                                </div>
                            ))
                        }
                    </div>
                    <div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted mb-2">Relationships</div>
                        {dossier.relationships.length === 0 ? <div className="text-[9px] opacity-30">None mapped</div> :
                            dossier.relationships.slice(0, 5).map((r, i) => (
                                <div key={i} className="flex items-center gap-2 py-1 text-[9px]">
                                    <span className="text-pt-intent-primary opacity-60">{r.direction === 'outbound' ? '→' : '←'}</span>
                                    <span className="font-mono text-pt-text truncate">{r.relatedEntity.slice(0, 18)}</span>
                                    <span className="text-pt-text-muted opacity-40 text-[8px] ml-auto">{r.type}</span>
                                </div>
                            ))
                        }
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                        <div className="p-2 rounded bg-pt-bg border border-pt-border">
                            <div className="text-pt-text-muted">Events</div>
                            <div className="font-black text-pt-text text-base">{dossier.activitySummary.totalEvents}</div>
                        </div>
                        <div className="p-2 rounded bg-pt-bg border border-pt-border">
                            <div className="text-pt-text-muted">Avg Gap</div>
                            <div className="font-black text-pt-text text-base">
                                {dossier.activitySummary.avgActivityGapMinutes !== null ? `${dossier.activitySummary.avgActivityGapMinutes}m` : '—'}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function IntelGraphPage() {
    const [graph, setGraph] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const { activeProjectId } = useWorkspaceStore();

    const loadGraph = () => {
        setLoading(true);
        ApiClient.get<GraphData>('/api/v1/maven/intel-graph', { projectId: activeProjectId || '' })
            .then(setGraph).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { loadGraph(); }, [activeProjectId]);

    const nodes = graph?.nodes.filter(n =>
        !search || n.label.toLowerCase().includes(search.toLowerCase()) || n.type.toLowerCase().includes(search.toLowerCase())
    ) ?? [];
    const edges = graph?.edges ?? [];
    const summary = graph?.summary ?? {};

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Toolbar */}
            <div className="shrink-0 flex items-center gap-4 px-6 py-3 border-b border-pt-border bg-pt-bg-panel/50">
                <div className="flex items-center gap-2">
                    <GitBranch size={14} className="text-pt-intent-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Multi-INT Intelligence Graph</span>
                </div>
                <div className="relative">
                    <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-pt-text-muted" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Filter entities..."
                        className="bg-pt-bg border border-pt-border rounded pl-6 pr-3 py-1 text-[10px] focus:outline-none focus:border-pt-intent-primary w-48" />
                </div>
                <button onClick={loadGraph} className="p-1.5 text-pt-text-muted hover:text-pt-text transition-colors">
                    <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
                </button>
                {/* INT type legend */}
                <div className="ml-auto flex items-center gap-3">
                    {Object.entries(INT_CONFIG).map(([type, cfg]) => (
                        <div key={type} className="flex items-center gap-1">
                            <cfg.Icon size={10} className={cfg.color} />
                            <span className={`text-[8px] font-black uppercase ${cfg.color}`}>{type}</span>
                            <span className="text-[8px] text-pt-text-muted opacity-40">
                                {summary?.byIntType?.[type] || 0}
                            </span>
                        </div>
                    ))}
                    {summary.alertedNodes > 0 && (
                        <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                            <AlertTriangle size={9} className="text-red-400" />
                            <span className="text-[8px] font-black text-red-400">{summary.alertedNodes} ALERTED</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex min-h-0">
                {/* Graph canvas */}
                <div className="flex-1 min-w-0 relative bg-pt-bg">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCcw size={24} className="animate-spin text-pt-text-muted opacity-20" />
                        </div>
                    ) : nodes.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                            <GitBranch size={32} />
                            <p className="text-[10px] font-black uppercase tracking-widest mt-3">No entities in graph</p>
                        </div>
                    ) : (
                        <IntelGraphCanvas nodes={nodes} edges={edges} selected={selected} onSelect={setSelected} />
                    )}
                    {/* Node list overlay */}
                    <div className="absolute top-4 left-4 max-h-64 overflow-y-auto custom-scrollbar space-y-1 w-52">
                        {nodes.slice(0, 20).map(n => {
                            const cfg = INT_CONFIG[n.intType] || INT_CONFIG.OSINT;
                            return (
                                <button
                                    key={n.id}
                                    onClick={() => setSelected(n.id === selected ? null : n.id)}
                                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all border ${n.id === selected
                                            ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                                            : 'bg-pt-bg-panel/70 border-pt-border/30 text-pt-text-muted hover:border-pt-border'
                                        } backdrop-blur-sm`}
                                >
                                    <cfg.Icon size={9} />
                                    <span className="text-[9px] font-black truncate">{n.label}</span>
                                    {n.hasAlert && <AlertTriangle size={8} className="text-red-400 ml-auto shrink-0" />}
                                    <ChevronRight size={8} className="ml-auto shrink-0 opacity-30" />
                                </button>
                            );
                        })}
                    </div>
                </div>
                {/* Dossier slide-in */}
                {selected && <DossierPanel logicalId={selected} onClose={() => setSelected(null)} />}
            </div>
        </div>
    );
}
