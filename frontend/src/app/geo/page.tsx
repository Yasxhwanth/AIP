"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
import { LANDMARKS, VisualMode } from "@/components/BattlefieldOverview";
import { ApiClient } from "@/lib/apiClient";

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
];

// ─── Main Component ─────────────────────────────────────────────────────────
export default function GeoExplorer() {
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

        // Strip prefixes like aip- or fl- or sat-
        const rawId = id.replace(/^(aip|fl|sat)-/, '');
        setSelectedEntityId(rawId);

        if (id.startsWith('aip-')) {
            // Fetch AIP Entity Detail
            ApiClient.get(`/api/v1/search?q=${rawId}`).then((res: any) => {
                const match = res.find((r: any) => r.logicalId === rawId);
                setEntityDetails(match || { logicalId: rawId, data: { status: 'Unknown', source: 'AIP CurrentState' } });
            }).catch(console.error);
        } else if (id.startsWith('fl-')) {
            setEntityDetails({ logicalId: rawId, type: 'Flight Track', data: { callsign: rawId, source: 'OpenSky Network' } });
        }
    }, []);

    const handleLayerCount = useCallback((id: string, count: number) => {
        setLayerCounts(prev => ({ ...prev, [id]: count }));
    }, []);

    const handleFlyTo = useCallback((landmark: typeof LANDMARKS[0]) => {
        flyToRef.current?.(landmark.lat, landmark.lng, landmark.alt);
        setShowNavPanel(false);
    }, []);

    // Search landmark
    const filteredLandmarks = LANDMARKS.filter(l =>
        l.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeLayerCount = Object.values(layers).filter(Boolean).length;
    const totalTracks = Object.entries(layerCounts).reduce((sum, [id, c]) => layers[id] ? sum + c : sum, 0);

    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    return (
        <div
            className="font-sans bg-transparent"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}
        >

            {/* BattlefieldOverview renders nothing here — Cesium lives on document.body at z-index 0 */}
            <BattlefieldOverview
                layers={layers}
                visualMode={visualMode}
                onLayerCountChange={handleLayerCount}
                flyToRef={flyToRef}
                onEntitySelect={handleEntitySelect}
                trackedEntities={trackedEntities}
            />

            {/* ── Top Bar ────────────────────────────────────────────────── */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2" style={{ pointerEvents: 'none' }}>
                {/* Left — branding */}
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur border border-white/10 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[11px] font-bold tracking-widest uppercase text-white">C3 AIP · GEO INTEL</span>
                    </div>
                </div>

                {/* Center — search */}
                <div className="flex-1 max-w-md mx-4 pointer-events-auto">
                    <div className="flex items-center h-9 bg-black/70 backdrop-blur border border-white/10 rounded-lg overflow-hidden">
                        <Search className="w-4 h-4 text-white/40 ml-3 shrink-0" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onFocus={() => setShowNavPanel(true)}
                            placeholder="Search locations, entity IDs, flights..."
                            className="flex-1 bg-transparent border-none px-3 text-sm focus:outline-none text-white placeholder-white/25 font-medium"
                        />
                        <button className="h-full w-9 border-l border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                            <Filter className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Right — quick stats */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-black/70 backdrop-blur border border-white/10 rounded-lg">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-white/40 uppercase font-semibold">Tracks</span>
                            <span className="text-sm font-mono font-bold text-cyan-400">{totalTracks}</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-white/40 uppercase font-semibold">Layers</span>
                            <span className="text-sm font-mono font-bold text-white">{activeLayerCount}</span>
                        </div>
                        <div className="w-px h-6 bg-white/10" />
                        {isDemoMode ? (
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-[9px] text-amber-400 font-bold uppercase">DEMO</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] text-green-400 font-bold uppercase">LIVE</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Location Nav Panel ─────────────────────────────────────── */}
            {showNavPanel && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-96 z-30">
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                        <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Landmarks</span>
                            </div>
                            <button onClick={() => setShowNavPanel(false)} className="text-white/30 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-2 grid grid-cols-2 gap-1">
                            {filteredLandmarks.map(L => (
                                <button
                                    key={L.label}
                                    onClick={() => handleFlyTo(L)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-colors group"
                                >
                                    <MapPin className="w-3.5 h-3.5 text-white/30 group-hover:text-cyan-400 flex-shrink-0" />
                                    <span className="text-sm text-white/70 group-hover:text-white">{L.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Left Panel — Layers ────────────────────────────────────── */}
            <div className="absolute left-4 top-16 bottom-24 z-20 flex flex-col gap-3" style={{ pointerEvents: 'auto' }}>
                {/* Layers Panel */}
                <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl w-60">
                    <button
                        onClick={() => setShowLayerPanel(v => !v)}
                        className="w-full px-4 py-3 flex items-center justify-between border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-white">Data Layers</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showLayerPanel ? '' : '-rotate-90'}`} />
                    </button>

                    {showLayerPanel && (
                        <div className="p-2 flex flex-col gap-0.5">
                            {LAYER_CONFIG.map(layer => {
                                const Icon = layer.icon;
                                const active = !!layers[layer.id];
                                const count = layerCounts[layer.id] ?? 0;
                                return (
                                    <button
                                        key={layer.id}
                                        onClick={() => toggleLayer(layer.id)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left group ${active ? 'bg-white/5 border border-white/10' : 'hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-2 h-2 rounded-full ${active ? layer.dot : 'bg-white/20'} flex-shrink-0`} />
                                            <Icon className={`w-3.5 h-3.5 ${active ? layer.color : 'text-white/30'}`} />
                                            <span className={`text-xs font-medium ${active ? 'text-white' : 'text-white/40'}`}>{layer.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {active && count > 0 && (
                                                <span className={`text-[9px] font-mono ${layer.color} bg-white/5 px-1.5 py-0.5 rounded`}>{count}</span>
                                            )}
                                            {active ? <Eye className="w-3 h-3 text-white/40" /> : <EyeOff className="w-3 h-3 text-white/20" />}
                                        </div>
                                    </button>
                                );
                            })}

                            <div className="mt-1 pt-1 border-t border-white/5">
                                <button className="w-full text-[11px] text-cyan-400 hover:text-cyan-300 py-1.5 flex items-center justify-center gap-1 transition-colors">
                                    <span>Add Custom Layer</span>
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right Panel — Tools ────────────────────────────────────── */}
            <div className="absolute right-4 top-16 z-20 flex flex-col gap-2" style={{ pointerEvents: 'auto' }}>
                {/* Zoom */}
                <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                    <button className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 text-xl transition-colors">+</button>
                    <div className="border-t border-white/10" />
                    <button className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 text-xl transition-colors">−</button>
                </div>

                {/* Recenter */}
                <button
                    onClick={() => flyToRef.current?.(20, 0, 20000000)}
                    className="w-10 h-10 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex items-center justify-center text-white/60 hover:text-cyan-400 transition-all"
                >
                    <Globe className="w-4 h-4" />
                </button>

                {/* Tracking Trail Toggle */}
                <button
                    onClick={() => {
                        if (selectedEntityId) {
                            setTrackedEntities(prev => prev.includes(selectedEntityId) ? prev.filter(id => id !== selectedEntityId) : [...prev, selectedEntityId]);
                        }
                    }}
                    className={`w-10 h-10 backdrop-blur-xl border rounded-xl shadow-2xl flex items-center justify-center transition-all group ${(selectedEntityId && trackedEntities.includes(selectedEntityId)) ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-black/70 border-white/10 text-white/60 hover:text-cyan-400'}`}
                    title="Toggle Historical Trails for Selected Entity"
                >
                    <Activity className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>

                {/* Crosshair */}
                <button className="w-10 h-10 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex items-center justify-center text-white/60 hover:text-cyan-400 transition-all">
                    <Crosshair className="w-4 h-4" />
                </button>

                {/* Visual Modes */}
                <button
                    onClick={() => setShowShaderPanel(v => !v)}
                    className={`w-10 h-10 backdrop-blur-xl border rounded-xl shadow-2xl flex items-center justify-center transition-all ${showShaderPanel ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-black/70 border-white/10 text-white/60 hover:text-cyan-400'}`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                </button>

                {/* Shader Panel */}
                {showShaderPanel && (
                    <div className="absolute right-12 top-[116px] w-52 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                        <div className="px-3 py-2 border-b border-white/5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Visual Mode</span>
                        </div>
                        <div className="p-2 flex flex-col gap-1">
                            {VISUAL_MODES.map(m => {
                                const Icon = m.icon;
                                const active = visualMode === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => { setVisualMode(m.id); setShowShaderPanel(false); }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${active ? 'bg-cyan-500/15 border border-cyan-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-white/40'}`} />
                                        <div>
                                            <p className={`text-xs font-semibold ${active ? 'text-cyan-400' : 'text-white/70'}`}>{m.label}</p>
                                            <p className="text-[9px] text-white/30">{m.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Maximize */}
                <button className="w-10 h-10 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex items-center justify-center text-white/60 hover:text-cyan-400 transition-all">
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>

            {/* ── Bottom — Timeline ──────────────────────────────────────── */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl z-20" style={{ pointerEvents: 'auto' }}>
                <div className="bg-black/70 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl p-3 flex flex-col gap-2">
                    {/* Controls Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                            <button className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/60 transition-all">
                                <Rewind className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setIsPlaying(p => !p)}
                                className="w-8 h-8 rounded-md bg-cyan-500 flex items-center justify-center text-black hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
                            >
                                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                            </button>
                            <button className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-white/60 transition-all">
                                <FastForward className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Visual mode badge */}
                        <div className="flex items-center gap-2">
                            {visualMode !== 'normal' && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{visualMode}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest border-r border-white/10 pr-2">Eval Time</span>
                                <span className="text-xs font-mono font-bold text-white">{currentDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Scrubber */}
                    <div className="relative px-1">
                        <div className="flex justify-between text-[9px] font-mono text-white/20 mb-1.5 px-0.5">
                            <span>Q1 2025</span><span>Q2 2025</span><span>Q3 2025</span><span>Q4 2025</span><span className="text-cyan-500 font-bold">NOW</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full cursor-pointer relative group">
                            <div className="absolute top-0 left-0 h-full w-[95%] bg-gradient-to-r from-cyan-600/60 to-cyan-400/80 rounded-full" />
                            <div className="absolute top-1/2 left-[95%] -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white shadow-lg shadow-cyan-500/30 rounded-full cursor-grab group-hover:scale-125 transition-transform border-2 border-cyan-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Entity Details Panel (Bottom Right) ──────────────────────── */}
            {selectedEntityId && entityDetails && (
                <div className="absolute right-4 bottom-24 w-80 z-30 pointer-events-auto">
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm font-bold text-white">{selectedEntityId}</span>
                            </div>
                            <button onClick={() => setSelectedEntityId(null)} className="text-white/40 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 text-xs">
                            {Object.entries(entityDetails.data || {}).map(([key, val]) => (
                                <div key={key} className="flex justify-between border-b border-white/5 pb-1">
                                    <span className="text-slate-400">{key}</span>
                                    <span className="text-white font-mono break-all text-right max-w-[60%]">{String(val)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 flex gap-2">
                            <button className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded py-1.5 text-xs font-semibold transition-colors">
                                Track Object
                            </button>
                            <button className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded py-1.5 text-xs font-semibold transition-colors">
                                Full History
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Click-away for nav panel ───────────────────────────────── */}
            {showNavPanel && (
                <div className="absolute inset-0 z-10" onClick={() => setShowNavPanel(false)} />
            )}
        </div>
    );
}
