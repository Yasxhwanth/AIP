"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import {
    Map as MapIcon,
    Layers,
    Clock,
    Play,
    Pause,
    FastForward,
    Rewind,
    Activity,
    Search,
    Filter,
    Crosshair,
    Settings,
    ChevronDown,
    Eye,
    EyeOff,
    Maximize2,
    Loader2,
    Satellite,
    Plane,
    Radio,

    Zap,
    Monitor,
    Sun,
    Thermometer,
    Tv2,
    Navigation,
    Globe,
    MapPin,
    SlidersHorizontal,
    X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { LANDMARKS, VisualMode } from "@/components/BattlefieldOverview";
import { ApiClient } from "@/lib/apiClient";
import { MissionPanel } from "@/components/MissionPanel";

// Dynamic import to avoid SSR issues with CesiumJS
const BattlefieldOverview = dynamic(
    () => import("@/components/BattlefieldOverview").then(m => ({ default: m.BattlefieldOverview })),
    { ssr: false, loading: () => <MapLoadingScreen /> }
);

function MapLoadingScreen() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                    <Globe className="absolute inset-4 text-cyan-400 w-8 h-8" />
                </div>
                <p className="text-slate-400 text-sm font-mono tracking-widest uppercase">Initializing 3D Engine</p>
            </div>
        </div>
    );
}

// ─── Layer Config ───────────────────────────────────────────────────────────
const LAYER_CONFIG = [
    { id: 'aip', label: 'AIP Entities', icon: Crosshair, color: 'text-cyan-400', dot: 'bg-cyan-400' },
    { id: 'flights', label: 'Live Flights', icon: Plane, color: 'text-yellow-400', dot: 'bg-yellow-400' },
    { id: 'satellites', label: 'Satellites', icon: Satellite, color: 'text-lime-400', dot: 'bg-lime-400' },
    { id: 'military', label: 'Military ADS-B', icon: Radio, color: 'text-red-400', dot: 'bg-red-400' },
];

// ─── Visual Mode Config ─────────────────────────────────────────────────────
const VISUAL_MODES: { id: VisualMode; label: string; icon: any; desc: string }[] = [
    { id: 'normal', label: 'Standard', icon: Sun, desc: 'Default RGB view' },
    { id: 'nightvision', label: 'Night Vision', icon: Eye, desc: 'Green amplified' },
    { id: 'flir', label: 'FLIR Thermal', icon: Thermometer, desc: 'Thermal false-color' },
    { id: 'crt', label: 'CRT Mode', icon: Tv2, desc: 'Retro scanlines' },
    { id: 'ctos', label: 'ctOS 2.0', icon: Radio, desc: 'Central Operating System' },
];

// ─── Main Component ─────────────────────────────────────────────────────────
// ─── Main Component ─────────────────────────────────────────
function GeoExplorerInner() {
    const searchParams = useSearchParams();
    // Map state
    const flyToRef = useRef<((lat: number, lng: number, alt: number) => void) | null>(null);
    const [visualMode, setVisualMode] = useState<VisualMode>('normal');
    const [layers, setLayers] = useState<Record<string, boolean>>({
        aip: true, flights: false, satellites: false, military: false,
    });
    const [layerCounts, setLayerCounts] = useState<Record<string, number>>({});

    // UI state
    const [showLayerPanel, setShowLayerPanel] = useState(true);
    const [showShaderPanel, setShowShaderPanel] = useState(false);
    const [showNavPanel, setShowNavPanel] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);

    // Selected Entity State
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [entityDetails, setEntityDetails] = useState<any>(null);
    const [trackedEntities, setTrackedEntities] = useState<string[]>([]);

    // Timeline
    const [currentDate] = useState(new Date().toISOString().slice(0, 19) + 'Z');

    const toggleLayer = useCallback((id: string) => {
        setLayers(prev => ({ ...prev, [id]: !prev[id] }));
    }, []);

    const handleEntitySelect = useCallback((id: string | null) => {
        if (!id) {
            setSelectedEntityId(null);
            setEntityDetails(null);
            return;
        }

        const rawId = id.replace(/^(aip|fl|sat)-/, '');
        setSelectedEntityId(rawId);

        if (id.startsWith('aip-')) {
            ApiClient.get(`/api/v1/search?q=${rawId}`).then((res: any) => {
                const match = res.find((r: any) => r.logicalId === rawId);
                setEntityDetails(match || { logicalId: rawId, data: { status: 'Unknown', source: 'AIP CurrentState' } });
            }).catch(console.error);
        } else if (id.startsWith('fl-')) {
            setEntityDetails({ logicalId: rawId, type: 'Flight Track', data: { callsign: rawId, source: 'OpenSky Network' } });
        }
    }, []);

    useEffect(() => {
        const entityId = searchParams.get('entityId');
        if (entityId) {
            setTimeout(() => {
                handleEntitySelect(`aip-${entityId}`);
            }, 500);
        }
    }, [searchParams, handleEntitySelect]);

    const handleLayerCount = useCallback((id: string, count: number) => {
        setLayerCounts(prev => ({ ...prev, [id]: count }));
    }, []);

    const handleFlyTo = useCallback((landmark: typeof LANDMARKS[0]) => {
        flyToRef.current?.(landmark.lat, landmark.lng, landmark.alt);
        setShowNavPanel(false);
    }, []);

    const filteredLandmarks = LANDMARKS.filter(l =>
        l.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeLayerCount = Object.values(layers).filter(Boolean).length;
    const totalTracks = Object.entries(layerCounts).reduce((sum, [id, c]) => layers[id] ? sum + c : sum, 0);

    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    return (
        <div
            className={`font-sans bg-transparent transition-all duration-700 ${visualMode === 'ctos' ? 'ctos-vignette' : ''} h-full w-full relative`}
            style={{ pointerEvents: 'none', overflow: 'hidden' }}
        >
            {visualMode === 'ctos' && (
                <>
                    <div className="absolute inset-0 pointer-events-none z-[15] ctos-scanline opacity-10" />
                    <div className="absolute inset-0 pointer-events-none z-[15]" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)' }} />
                    <div className="absolute top-4 left-4 pointer-events-none z-[16]" style={{ width: 80, height: 80, borderTop: '1px solid rgba(0,251,255,0.4)', borderLeft: '1px solid rgba(0,251,255,0.4)' }} />
                    <div className="absolute top-4 right-4 pointer-events-none z-[16]" style={{ width: 80, height: 80, borderTop: '1px solid rgba(0,251,255,0.4)', borderRight: '1px solid rgba(0,251,255,0.4)' }} />
                    <div className="absolute bottom-4 left-4 pointer-events-none z-[16]" style={{ width: 80, height: 80, borderBottom: '1px solid rgba(0,251,255,0.4)', borderLeft: '1px solid rgba(0,251,255,0.4)' }} />
                    <div className="absolute bottom-4 right-4 pointer-events-none z-[16]" style={{ width: 80, height: 80, borderBottom: '1px solid rgba(0,251,255,0.4)', borderRight: '1px solid rgba(0,251,255,0.4)' }} />
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-[16] flex items-center gap-3 px-4 py-1 bg-pt-bg/80 border border-pt-intent-primary/30 rounded shadow-2xl">
                        <span className="font-mono text-[9px] text-pt-intent-primary font-black tracking-[0.2em] uppercase">SYSTEM ANALYTICS ACTIVE · ctOS 2.0 OVERLAY</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-pt-intent-primary animate-pulse" />
                    </div>
                </>
            )}

            <BattlefieldOverview
                layers={layers}
                visualMode={visualMode}
                onLayerCountChange={handleLayerCount}
                flyToRef={flyToRef}
                onEntitySelect={handleEntitySelect}
                trackedEntities={trackedEntities}
            />

            {/* Overlay Interface */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col p-4">
                {/* Header Row */}
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        <div className="flex items-center gap-2 p-1 bg-pt-bg/80 backdrop-blur border border-pt-border rounded shadow-2xl">
                            <div className="px-3 py-1 flex items-center gap-2 border-r border-pt-border">
                                <Globe size={14} className="text-pt-intent-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pt-text">Strategic Map</span>
                            </div>
                            <div className="flex items-center gap-4 px-3 py-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] font-bold text-pt-text-muted uppercase">Entities</span>
                                    <span className="text-[11px] font-mono font-bold text-pt-intent-primary">{totalTracks}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] font-bold text-pt-text-muted uppercase">Health</span>
                                    <span className="text-[11px] font-mono font-bold text-pt-intent-success">NOMINAL</span>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="w-80 relative">
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onFocus={() => setShowNavPanel(true)}
                                placeholder="SEARCH LOCATION / VECTOR..."
                                className="w-full h-10 bg-pt-bg/90 backdrop-blur border border-pt-border rounded px-10 text-[10px] font-mono tracking-widest text-pt-text placeholder-pt-text-muted/40 outline-none focus:border-pt-intent-primary transition-all pointer-events-auto shadow-2xl"
                            />
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pt-text-muted" />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pt-text-muted hover:text-pt-text pointer-events-auto">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        {VISUAL_MODES.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setVisualMode(m.id)}
                                className={`h-8 px-3 rounded border transition-all flex items-center gap-2 ${visualMode === m.id
                                        ? 'bg-pt-intent-primary/20 border-pt-intent-primary text-pt-intent-primary'
                                        : 'bg-pt-bg/80 border-pt-border text-pt-text-muted hover:text-pt-text hover:bg-pt-bg-panel'
                                    }`}
                                title={m.label}
                            >
                                <m.icon size={12} />
                                <span className="text-[8px] font-bold uppercase tracking-widest">{m.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Left Rails */}
                <div className="mt-8 flex flex-col gap-4 pointer-events-auto">
                    <div className="w-64 bg-pt-bg/90 backdrop-blur border border-pt-border rounded overflow-hidden shadow-2xl">
                        <div className="px-3 py-2 border-b border-pt-border flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-pt-text">Signal Sources</span>
                            <span className="text-[10px] font-mono text-pt-intent-primary">{activeLayerCount} active</span>
                        </div>
                        <div className="p-1 space-y-0.5">
                            {LAYER_CONFIG.map(layer => {
                                const active = !!layers[layer.id];
                                const count = layerCounts[layer.id] ?? 0;
                                return (
                                    <button
                                        key={layer.id}
                                        onClick={() => toggleLayer(layer.id)}
                                        className={`w-full px-3 py-2 rounded flex items-center justify-between transition-all ${active ? 'bg-pt-bg-panel border border-pt-border/50' : 'hover:bg-pt-bg-panel/50 text-pt-text-muted'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${active ? layer.dot : 'bg-pt-border'} shadow-sm`} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{layer.label}</span>
                                        </div>
                                        {active && count > 0 && <span className="text-[9px] font-mono opacity-60">{count}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Landmarks context */}
                    {showNavPanel && filteredLandmarks.length > 0 && (
                        <div className="w-64 bg-pt-bg/90 backdrop-blur border border-pt-border rounded shadow-2xl max-h-60 overflow-y-auto no-scrollbar">
                            <div className="px-3 py-2 border-b border-pt-border text-[8px] font-bold text-pt-text-muted uppercase tracking-[0.2em]">Coordinate Targets</div>
                            <div className="p-1">
                                {filteredLandmarks.map(L => (
                                    <button
                                        key={L.label}
                                        onClick={() => handleFlyTo(L)}
                                        className="w-full text-left px-3 py-2 rounded hover:bg-pt-bg-panel transition-all group"
                                    >
                                        <div className="text-[10px] font-bold text-pt-text group-hover:text-pt-intent-primary transition-colors">{L.label}</div>
                                        <div className="text-[8px] font-mono text-pt-text-muted mt-0.5 opacity-60">{L.lat.toFixed(2)}, {L.lng.toFixed(2)}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Tool-strip */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-auto">
                    {[
                        { icon: Globe, onClick: () => flyToRef.current?.(20, 0, 20000000), title: 'Global Reset' },
                        {
                            icon: Activity,
                            onClick: () => selectedEntityId && setTrackedEntities(prev => prev.includes(selectedEntityId) ? prev.filter(id => id !== selectedEntityId) : [...prev, selectedEntityId]),
                            title: 'Historical Trace',
                            active: selectedEntityId && trackedEntities.includes(selectedEntityId)
                        },
                        { icon: Crosshair, onClick: () => { }, title: 'Recenter on Asset' },
                        { icon: Maximize2, onClick: () => { }, title: 'Fullscreen' },
                    ].map((tool, i) => (
                        <button
                            key={i}
                            onClick={tool.onClick}
                            className={`w-12 h-12 flex items-center justify-center border transition-all rounded shadow-2xl ${tool.active
                                    ? 'bg-pt-intent-primary/20 border-pt-intent-primary text-pt-intent-primary'
                                    : 'bg-pt-bg/90 border-pt-border text-pt-text-muted hover:text-pt-text hover:bg-pt-bg-panel'
                                }`}
                            title={tool.title}
                        >
                            <tool.icon size={18} />
                        </button>
                    ))}
                </div>

                {/* Bottom Scrubber */}
                <div className="mt-auto pointer-events-auto flex justify-center pb-4">
                    <div className="w-[800px] bg-pt-bg/90 backdrop-blur border border-pt-border p-3 rounded shadow-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex gap-1 p-1 bg-pt-bg-panel border border-pt-border">
                                <button className="w-8 h-8 flex items-center justify-center text-pt-text-muted hover:text-pt-text transition-all"><Rewind size={14} /></button>
                                <button
                                    onClick={() => setIsPlaying(p => !p)}
                                    className="w-10 h-8 flex items-center justify-center bg-pt-intent-primary text-white hover:bg-pt-intent-primary-hover transition-all shadow-lg"
                                >
                                    {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-1" />}
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center text-pt-text-muted hover:text-pt-text transition-all"><FastForward size={14} /></button>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 h-10 border border-pt-border bg-pt-bg-panel">
                                    <Clock size={14} className="text-pt-intent-primary" />
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-pt-text-muted tracking-widest">Temporal Log</span>
                                        <span className="text-[10px] font-mono font-bold">{currentDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-1">
                            <div className="flex justify-between text-[8px] font-mono text-pt-text-muted mb-2 opacity-50 uppercase tracking-widest">
                                <span>T-MINUS 12M</span><span>REALTIME VECTOR</span>
                            </div>
                            <div className="h-1 w-full bg-pt-border relative group cursor-pointer">
                                <div className="absolute top-0 left-0 h-full w-[95%] bg-pt-intent-primary" />
                                <div className="absolute top-1/2 left-[95%] -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white shadow-xl transition-all group-hover:scale-125 border border-pt-intent-primary" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Detail Panel (Slide-out) */}
            {selectedEntityId && entityDetails && (
                <div className="pointer-events-auto absolute right-0 top-0 bottom-0 z-30">
                    <MissionPanel
                        entityId={selectedEntityId}
                        entityDetails={entityDetails}
                        onClose={() => {
                            setSelectedEntityId(null);
                            setEntityDetails(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default function GeoExplorer() {
    return (
        <Suspense fallback={<MapLoadingScreen />}>
            <GeoExplorerInner />
        </Suspense>
    );
}
