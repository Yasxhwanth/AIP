'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ApiClient } from '@/lib/apiClient';
import { useWorkspaceStore } from '@/store/workspaceStore';
import {
    Activity,
    AlertTriangle,
    Brain,
    ChevronRight,
    Eye,
    Globe,
    Layers,
    RefreshCcw,
    SatelliteDish,
    Shield,
    ShieldAlert,
    Swords,
    Target,
    X,
    Zap,
} from 'lucide-react';
import { SeverityChip } from '@/components/ui/SeverityChip';
import dynamic from 'next/dynamic';

// BattlefieldOverview is SSR-incompatible (Cesium needs window)
const BattlefieldOverview = dynamic(
    () => import('@/components/BattlefieldOverview').then(m => m.BattlefieldOverview),
    { ssr: false, loading: () => <MapSkeleton /> }
);

function MapSkeleton() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-pt-bg">
            <div className="text-center opacity-20">
                <Globe size={48} className="mx-auto mb-3 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest">Initialising CesiumJS...</p>
            </div>
        </div>
    );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface IntelNode {
    id: string; label: string; type: string; intType: string;
    status: string; hasAlert: boolean; lat: number | null; lon: number | null;
}
interface Alert { id: string; alertType: string; severity: string; logicalId: string; createdAt: string; }

// ─── INT colour → Cesium-compatible CSS colour ───────────────────────────────
const INT_CSS: Record<string, string> = {
    IMINT: '#60a5fa', SIGINT: '#fbbf24', HUMINT: '#4ade80',
    MASINT: '#c084fc', OSINT: '#6b7280',
};

// ─── Layer toggle button ──────────────────────────────────────────────────────
const LayerBtn = ({ active, label, color, onClick }: { active: boolean; label: string; color: string; onClick: () => void }) => (
    <button onClick={onClick}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[8px] font-black uppercase tracking-widest transition-all ${active ? 'text-pt-text border-opacity-60' : 'text-pt-text-muted border-pt-border opacity-40 hover:opacity-70'
            }`}
        style={{ borderColor: active ? color : undefined }}>
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        {label}
    </button>
);

// ─── Intel sidebar entity row ─────────────────────────────────────────────────
const EntityRow = ({ node, selected, onClick }: { node: IntelNode; selected: boolean; onClick: () => void }) => {
    const color = INT_CSS[node.intType] || '#6b7280';
    return (
        <button onClick={onClick} className={`w-full text-left px-3 py-2 border-b border-pt-border/20 transition-all hover:bg-white/3 flex items-center gap-2 ${selected ? 'bg-white/5 border-l-2' : ''}`}
            style={{ borderLeftColor: selected ? color : undefined }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
            <div className="flex-1 min-w-0">
                <div className="text-[9px] font-black uppercase truncate text-pt-text">{node.label}</div>
                <div className="text-[8px] text-pt-text-muted opacity-40">{node.type}</div>
            </div>
            {node.hasAlert && <AlertTriangle size={9} className="text-red-400 shrink-0" />}
            <ChevronRight size={8} className="opacity-20 shrink-0" />
        </button>
    );
};

// ─── Mini Dossier ─────────────────────────────────────────────────────────────
const MiniDossier = ({ node, onClose, onPolClick }: {
    node: IntelNode; onClose: () => void; onPolClick: () => void;
}) => {
    const [dossier, setDossier] = useState<any>(null);
    const { activeProjectId } = useWorkspaceStore();

    useEffect(() => {
        ApiClient.get<any>(`/api/v1/maven/entities/${node.id}/dossier`, { projectId: activeProjectId || '' })
            .then(setDossier).catch(console.error);
    }, [node.id]);

    return (
        <div className="absolute bottom-4 right-4 w-72 rounded border border-pt-border bg-pt-bg-panel/95 backdrop-blur-sm shadow-xl z-20 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-pt-border">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: INT_CSS[node.intType] || '#6b7280' }} />
                    <span className="text-[9px] font-black uppercase text-pt-text truncate max-w-36">{node.label}</span>
                    <span className="text-[7px] text-pt-text-muted opacity-40">{node.intType}</span>
                </div>
                <button onClick={onClose} className="text-pt-text-muted hover:text-pt-text">
                    <X size={11} />
                </button>
            </div>
            {!dossier ? (
                <div className="px-3 py-4 flex items-center justify-center">
                    <RefreshCcw size={12} className="animate-spin opacity-20" />
                </div>
            ) : (
                <div className="p-3 space-y-3">
                    {dossier.aiAssessment && (
                        <div className="p-2 rounded border border-pt-intent-primary/20 bg-pt-intent-primary/5">
                            <div className="text-[7px] font-black uppercase text-pt-intent-primary mb-1">AI Assessment</div>
                            <p className="text-[9px] text-pt-text leading-relaxed line-clamp-3">{dossier.aiAssessment}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-3 gap-2 text-[9px]">
                        <div className="text-center p-1.5 rounded bg-pt-bg border border-pt-border">
                            <div className="text-pt-text-muted text-[7px] uppercase">Events</div>
                            <div className="font-black text-pt-text">{dossier.activitySummary?.totalEvents ?? '—'}</div>
                        </div>
                        <div className="text-center p-1.5 rounded bg-pt-bg border border-pt-border">
                            <div className="text-pt-text-muted text-[7px] uppercase">Alerts</div>
                            <div className={`font-black ${dossier.alerts?.length > 0 ? 'text-red-400' : 'text-pt-text'}`}>{dossier.alerts?.length ?? 0}</div>
                        </div>
                        <div className="text-center p-1.5 rounded bg-pt-bg border border-pt-border">
                            <div className="text-pt-text-muted text-[7px] uppercase">Links</div>
                            <div className="font-black text-pt-text">{dossier.relationships?.length ?? 0}</div>
                        </div>
                    </div>
                    <button onClick={onPolClick}
                        className="w-full py-1.5 text-[8px] font-black uppercase tracking-widest border border-pt-border rounded hover:border-pt-intent-primary hover:text-pt-intent-primary transition-all flex items-center justify-center gap-1.5 text-pt-text-muted">
                        <Brain size={9} /> View Pattern of Life
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GeoIntelPage() {
    const [nodes, setNodes] = useState<IntelNode[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [selected, setSelected] = useState<IntelNode | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [layers, setLayers] = useState({
        aip: true, '3dtiles': false, flights: false, satellites: false,
        pol: false, // Pattern of Life tracks overlay
    });
    const [visualMode, setVisualMode] = useState<'normal' | 'nightvision' | 'flir' | 'crt' | 'ctos'>('normal');
    const [intFilter, setIntFilter] = useState<string | null>(null);
    const flyToRef = useRef<((lat: number, lng: number, alt: number) => void) | null>(null);
    const { activeProjectId } = useWorkspaceStore();
    const router = useRef<any>(null);

    // Load intel graph for sidebar
    useEffect(() => {
        const pId = activeProjectId || '';
        Promise.all([
            ApiClient.get<any>('/api/v1/maven/intel-graph', { projectId: pId }),
            ApiClient.get<any[]>('/api/v1/maven/alerts', { projectId: pId }),
        ]).then(([graph, al]) => {
            setNodes(graph.nodes ?? []);
            setAlerts(al ?? []);
        }).catch(console.error);
    }, [activeProjectId]);

    const flyTo = (node: IntelNode) => {
        if (flyToRef.current && node.lat !== null && node.lon !== null) {
            flyToRef.current(node.lat, node.lon, 50000);
        }
    };

    const handleSelectNode = (node: IntelNode) => {
        setSelected(node);
        flyTo(node);
    };

    const filtered = intFilter ? nodes.filter(n => n.intType === intFilter) : nodes;

    // Summary stats
    const byIntType = nodes.reduce((acc: Record<string, number>, n) => {
        acc[n.intType] = (acc[n.intType] || 0) + 1;
        return acc;
    }, {});
    const alertedCount = nodes.filter(n => n.hasAlert).length;

    return (
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
            {/* CesiumJS Battlefied Map — full size */}
            <div className="absolute inset-0">
                <BattlefieldOverview
                    layers={layers}
                    visualMode={visualMode}
                    flyToRef={flyToRef}
                    projectId={activeProjectId || undefined}
                    onEntitySelect={id => {
                        if (!id) { setSelected(null); return; }
                        // Find node by logical id (strip 'aip-' prefix)
                        const logicalId = id.replace('aip-', '');
                        const node = nodes.find(n => n.id === logicalId || n.id === id);
                        if (node) setSelected(node);
                    }}
                />
            </div>

            {/* ── Maven HUD toolbar ─── */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded border border-pt-border bg-pt-bg-panel/90 backdrop-blur-sm">
                <Swords size={12} className="text-pt-intent-danger" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] mr-2">GEO-INTEL</span>

                {/* INT type filters */}
                {Object.entries(INT_CSS).map(([type, color]) => (
                    <LayerBtn key={type} active={intFilter === null || intFilter === type}
                        color={color} label={type}
                        onClick={() => setIntFilter(intFilter === type ? null : type)} />
                ))}

                <div className="h-3 w-px bg-pt-border mx-1" />

                {/* Visual mode */}
                {(['normal', 'nightvision', 'flir', 'ctos'] as const).map(m => (
                    <button key={m} onClick={() => setVisualMode(m)}
                        className={`px-2 py-0.5 text-[7px] font-black uppercase rounded border transition-all ${visualMode === m ? 'border-pt-text text-pt-text' : 'border-pt-border text-pt-text-muted opacity-40 hover:opacity-70'
                            }`}>{m}</button>
                ))}

                <div className="h-3 w-px bg-pt-border mx-1" />
                <button onClick={() => setSidebarOpen(o => !o)}
                    className="flex items-center gap-1 text-[8px] font-black uppercase text-pt-text-muted hover:text-pt-text transition-colors">
                    <Layers size={10} />
                    {sidebarOpen ? 'Hide' : 'Intel'}
                </button>
            </div>

            {/* ── Summary badges (top-right) ── */}
            <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-pt-border bg-pt-bg-panel/90 backdrop-blur-sm text-[8px] font-mono">
                    <Globe size={10} className="text-pt-text-muted" />
                    <span className="font-black text-pt-text">{nodes.length}</span>
                    <span className="text-pt-text-muted opacity-40">entities</span>
                    {alertedCount > 0 && (
                        <>
                            <span className="text-pt-border opacity-40 mx-1">|</span>
                            <AlertTriangle size={9} className="text-red-400" />
                            <span className="font-black text-red-400">{alertedCount}</span>
                        </>
                    )}
                </div>
            </div>

            {/* ── Intel sidebar (left) ── */}
            {sidebarOpen && (
                <div className="absolute top-14 left-3 bottom-3 w-52 z-10 flex flex-col rounded border border-pt-border bg-pt-bg-panel/90 backdrop-blur-sm overflow-hidden">
                    <div className="shrink-0 px-3 py-2 border-b border-pt-border">
                        <div className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted mb-2">Intelligence Index</div>
                        {/* INT breakdown mini pills */}
                        <div className="flex flex-wrap gap-1">
                            {Object.entries(byIntType).map(([type, count]) => (
                                <button key={type} onClick={() => setIntFilter(intFilter === type ? null : type)}
                                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase border transition-all ${intFilter === type ? 'border-opacity-70' : 'border-pt-border opacity-50 hover:opacity-80'
                                        }`} style={{ borderColor: INT_CSS[type] || '#6b7280', color: INT_CSS[type] || '#6b7280' }}>
                                    {count} {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filtered.length === 0 ? (
                            <div className="p-4 text-[8px] text-center opacity-20">No entities</div>
                        ) : filtered.map(n => (
                            <EntityRow key={n.id} node={n} selected={selected?.id === n.id} onClick={() => handleSelectNode(n)} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Active Alerts strip (bottom-left) ── */}
            {alerts.length > 0 && (
                <div className="absolute bottom-3 left-3 z-10 max-w-xs space-y-1.5">
                    {alerts.slice(0, 4).map(a => (
                        <div key={a.id}
                            className="flex items-center gap-2 px-3 py-2 rounded border border-red-500/30 bg-red-500/10 backdrop-blur-sm text-[9px] font-black uppercase">
                            <AlertTriangle size={10} className="text-red-400 shrink-0" />
                            <span className="truncate text-pt-text">{a.alertType}</span>
                            <SeverityChip severity={a.severity} />
                        </div>
                    ))}
                </div>
            )}

            {/* ── Entity Dossier flyout (bottom-right) ── */}
            {selected && (
                <MiniDossier
                    node={selected}
                    onClose={() => setSelected(null)}
                    onPolClick={() => {
                        // Navigate to PoL tab with entity pre-selected (handled via localStorage)
                        if (typeof window !== 'undefined') {
                            window.location.href = `/maven/pattern-of-life`;
                        }
                    }}
                />
            )}
        </div>
    );
}
