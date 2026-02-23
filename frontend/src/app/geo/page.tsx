"use client";

import { useState, useEffect } from "react";
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
    Loader2
} from "lucide-react";
import { ApiClient } from "@/lib/apiClient";

const COLORS = ['bg-indigo-600', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-blue-500', 'bg-purple-500'];

export default function GeoExplorer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentDate, setCurrentDate] = useState("2026-02-22T14:30:00Z");

    // Live API Data
    const [layers, setLayers] = useState<any[]>([]);
    const [renderedDots, setRenderedDots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const types = await ApiClient.get<any[]>('/entity-types');

                const layerPromises = types.map(async (t, idx) => {
                    const insts = await ApiClient.get<any[]>(`/entity-types/${t.id}/instances`);
                    return {
                        id: t.id,
                        name: t.name,
                        visible: true,
                        count: insts.length,
                        instances: insts,
                        color: COLORS[idx % COLORS.length]
                    };
                });

                const loadedLayers = await Promise.all(layerPromises);
                setLayers(loadedLayers);
                updateDots(loadedLayers);
            } catch (err) {
                console.error("Failed to fetch geo data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const toggleLayer = (layerId: string) => {
        const newLayers = layers.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l);
        setLayers(newLayers);
        updateDots(newLayers);
    };

    const updateDots = (currentLayers: any[]) => {
        // Here we simulate converting lat/lon to screen coordinates.
        // If data has actual lat/lon, we use it to seed a stable random visual dot.
        const dots: any[] = [];
        currentLayers.filter(l => l.visible).forEach(l => {
            l.instances.forEach((inst: any) => {
                // Generate a pseudo-random deterministic position based on logicalId
                // (or real lat/lon if they existed in the mock data later).
                const hash = inst.logicalId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                const x = 20 + (hash % 60); // 20% to 80% screen width
                const y = 20 + ((hash * 13) % 60); // 20% to 80% screen height

                dots.push({
                    id: inst.logicalId,
                    type: l.name,
                    x, y,
                    color: l.color
                });
            });
        });
        setRenderedDots(dots);
    };

    return (
        <div className="h-full w-full flex bg-slate-100 text-slate-900 border-t border-slate-200 relative overflow-hidden">

            {/* 1. Underlying Map Canvas (Full Bleed) */}
            <div className="absolute inset-0 z-0 bg-[#e2e8f0] flex flex-col items-center justify-center">
                <div className="absolute inset-0 opacity-[0.4] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVsNDAtLjVNNDAgMGwuNSA0MCIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')]"></div>

                {loading ? (
                    <div className="bg-white/90 backdrop-blur border border-slate-300 shadow-xl rounded-lg p-6 max-w-sm text-center z-10 flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
                        <h2 className="text-lg font-bold text-slate-800">Fetching Geospatial Assets...</h2>
                        <p className="text-sm text-slate-500 mt-2">Connecting to Entity Data Service.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white/90 backdrop-blur border border-slate-300 shadow-xl rounded-lg p-6 max-w-sm text-center z-10 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
                            <MapIcon className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <h2 className="text-lg font-bold text-slate-800">Map GL Engine Pending</h2>
                            <p className="text-sm text-slate-500 mt-2 mb-4 leading-relaxed">
                                {renderedDots.length} live assets plotted. Waiting for 3D Mapbox/MapLibre token input to render the extrusions and bi-temporal ontology overlays.
                            </p>
                        </div>

                        {/* Live Data Plotted on Canvas */}
                        {renderedDots.map(dot => (
                            <div
                                key={dot.id}
                                className={`absolute w-3 h-3 rounded-full ${dot.color} border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:scale-150 transition-all z-20`}
                                style={{ top: `${dot.y}%`, left: `${dot.x}%` }}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-90 shadow-xl z-30">
                                    <div className="font-bold">{dot.id}</div>
                                    <div className="text-slate-400">{dot.type}</div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* 2. Floating Top Left: Search & Layer Panel */}
            <div className="absolute top-4 left-4 z-10 w-80 space-y-4">
                <div className="bg-white rounded border border-slate-200 shadow-md flex items-center overflow-hidden h-10">
                    <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search coordinates, specific entities..."
                        className="flex-1 w-full bg-transparent border-none px-3 py-2 text-sm focus:outline-none text-slate-800 placeholder-slate-400 font-medium"
                    />
                    <div className="h-full w-10 border-l border-slate-200 flex items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                        <Filter className="w-4 h-4 text-slate-500" />
                    </div>
                </div>

                <div className="bg-white rounded border border-slate-200 shadow-md overflow-hidden flex flex-col max-h-[60vh]">
                    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-slate-600" />
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Layers</h3>
                        </div>
                        <Settings className="w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loading && <p className="text-center text-xs text-slate-400 py-4">Loading layers...</p>}
                        {layers.map((layer) => (
                            <div key={layer.id} onClick={() => toggleLayer(layer.id)} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 group transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                                <div className="flex items-center gap-3">
                                    <button className="text-slate-400 hover:text-slate-700">
                                        {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${layer.color} ${!layer.visible && 'opacity-30'}`}></div>
                                        <span className={`text-xs font-semibold ${layer.visible ? 'text-slate-700' : 'text-slate-400'}`}>
                                            {layer.name}
                                        </span>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${layer.visible ? 'bg-white border-slate-200 text-slate-500 shadow-sm' : 'bg-transparent border-transparent text-slate-300'}`}>
                                    {layer.count}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-center">
                        <button className="text-[11px] text-indigo-600 font-semibold hover:text-indigo-800 transition-colors flex items-center gap-1">
                            Add Overlay Data <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Floating Top Right: Map Tools */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button className="w-10 h-10 bg-white border border-slate-200 rounded shadow-md flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                    <Crosshair className="w-5 h-5" />
                </button>
                <div className="w-10 bg-white border border-slate-200 rounded shadow-md flex flex-col overflow-hidden">
                    <button className="h-10 border-b border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-lg">+</button>
                    <button className="h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-lg">-</button>
                </div>
                <button className="w-10 h-10 bg-white border border-slate-200 rounded shadow-md flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>

            {/* 4. Floating Bottom: Time-Travel Timeline Slider */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl z-10">
                <div className="bg-white/95 backdrop-blur border border-slate-200 shadow-lg rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-slate-100 rounded p-1 border border-slate-200">
                            <button className="w-7 h-7 rounded hover:bg-white hover:shadow-sm flex items-center justify-center text-slate-600 transition-all">
                                <Rewind className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-8 h-8 rounded bg-white shadow-sm border border-slate-300 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-all"
                            >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>
                            <button className="w-7 h-7 rounded hover:bg-white hover:shadow-sm flex items-center justify-center text-slate-600 transition-all">
                                <FastForward className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded border border-slate-200">
                            <Clock className="w-4 h-4 text-indigo-600" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 border-l border-slate-300">Evaluating At</span>
                            <span className="text-sm font-mono font-bold text-slate-800 tracking-tight">{currentDate}</span>
                        </div>
                    </div>

                    <div className="px-2 pt-2 pb-1 relative">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-2 px-1">
                            <span>Q1 2025</span>
                            <span>Q3 2025</span>
                            <span>Q1 2026</span>
                            <span className="text-indigo-600 font-bold">TODAY</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full cursor-pointer relative">
                            <div className="absolute top-0 left-0 h-full w-[85%] bg-indigo-500 rounded-full"></div>
                            <div className="absolute top-1/2 left-[85%] -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full shadow cursor-grab hover:scale-110 transition-transform"></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
