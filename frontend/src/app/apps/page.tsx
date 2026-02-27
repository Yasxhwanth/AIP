"use client";

import { useState, useEffect } from "react";
import { Plus, LayoutGrid, TerminalSquare, AlertTriangle, Play, Save, Settings, LineChart, Table } from "lucide-react";
import { ApiClient } from "@/lib/apiClient";
import { useWorkspaceStore } from "@/store/workspace";

type Widget = {
    id: string;
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
    configData: any;
};

type Dashboard = {
    id: string;
    name: string;
    widgets: Widget[];
    updatedAt: string;
};

export default function AppsPage() {
    const { activeProjectId } = useWorkspaceStore();
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [activeDash, setActiveDash] = useState<Dashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!activeProjectId) return;
        ApiClient.get<Dashboard[]>("/api/v1/dashboards").then(data => {
            setDashboards(data);
            if (data.length > 0) setActiveDash(data[0]);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load dashboards", err);
            setLoading(false);
        });
    }, [activeProjectId]);

    const handleCreateApp = async () => {
        try {
            const newDash = await ApiClient.post<Dashboard>("/api/v1/dashboards", {
                name: `New App ${dashboards.length + 1}`,
                widgets: []
            });
            setDashboards(prev => [newDash, ...prev]);
            setActiveDash(newDash);
        } catch (e) {
            console.error("Creation failed", e);
        }
    };

    const handleSaveApp = async () => {
        if (!activeDash) return;
        setSaving(true);
        try {
            const updated = await ApiClient.put<Dashboard>(`/api/v1/dashboards/${activeDash.id}`, {
                name: activeDash.name,
                widgets: activeDash.widgets
            });
            setDashboards(prev => prev.map(d => d.id === updated.id ? updated : d));
            setActiveDash(updated);
        } catch (e) {
            console.error("Save failed", e);
        } finally {
            setSaving(false);
        }
    };

    const handleAddWidget = (type: string) => {
        if (!activeDash) return;
        const newWidget: Widget = {
            id: Date.now().toString(),
            type,
            x: 0,
            y: 0,
            w: 4,
            h: 3,
            configData: {}
        };
        setActiveDash({
            ...activeDash,
            widgets: [...activeDash.widgets, newWidget]
        });
    };

    if (loading) return <div className="h-full w-full bg-[#0a0f18] text-white p-8 animate-pulse">Loading apps...</div>;

    return (
        <div className="h-full w-full flex bg-[#0a0f18] text-white font-sans overflow-hidden">
            {/* Sidebar List */}
            <div className="w-64 border-r border-slate-800 bg-[#0d131f] flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="font-bold text-sm tracking-widest text-slate-400 uppercase">App Builder</h2>
                    <button onClick={handleCreateApp} className="p-1 hover:bg-slate-800 rounded text-cyan-400"><Plus size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {dashboards.map(d => (
                        <div
                            key={d.id}
                            onClick={() => setActiveDash(d)}
                            className={`px-3 py-2 rounded-md cursor-pointer text-sm truncate transition-colors ${activeDash?.id === d.id ? 'bg-cyan-500/10 text-cyan-400 font-medium' : 'hover:bg-slate-800/50 text-slate-400'}`}
                        >
                            <LayoutGrid size={14} className="inline mr-2 opacity-50" />
                            {d.name}
                        </div>
                    ))}
                    {dashboards.length === 0 && (
                        <div className="p-4 text-xs text-slate-600 text-center">No apps found. Click + to create one.</div>
                    )}
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col relative bg-[#070b12]">
                {activeDash ? (
                    <>
                        <div className="h-14 border-b border-slate-800 bg-[#0d131f]/80 backdrop-blur flex items-center justify-between px-6 z-10">
                            <input
                                value={activeDash.name}
                                onChange={e => setActiveDash({ ...activeDash, name: e.target.value })}
                                className="bg-transparent text-lg font-semibold outline-none border-b border-transparent focus:border-cyan-500 transition-colors w-64"
                            />
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors border border-slate-700">
                                    <Play size={14} className="text-green-400" /> Preview App
                                </button>
                                <button onClick={handleSaveApp} disabled={saving} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded transition-colors shadow-lg shadow-cyan-900/20 w-32 justify-center">
                                    {saving ? 'Saving...' : <><Save size={14} /> Publish</>}
                                </button>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="h-12 border-b border-slate-800/50 bg-[#0a0f18] flex items-center px-4 gap-2 z-10 shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Widgets:</span>
                            <button onClick={() => handleAddWidget('TABLE')} className="text-xs flex items-center gap-1.5 bg-slate-800/50 hover:bg-slate-700 px-2.5 py-1 rounded text-slate-300 border border-slate-700/50"><Table size={12} /> Data Table</button>
                            <button onClick={() => handleAddWidget('CHART')} className="text-xs flex items-center gap-1.5 bg-slate-800/50 hover:bg-slate-700 px-2.5 py-1 rounded text-slate-300 border border-slate-700/50"><LineChart size={12} /> Metric Chart</button>
                            <button onClick={() => handleAddWidget('ALERT')} className="text-xs flex items-center gap-1.5 bg-slate-800/50 hover:bg-slate-700 px-2.5 py-1 rounded text-slate-300 border border-slate-700/50"><AlertTriangle size={12} /> Alert Feed</button>
                            <div className="ml-auto flex items-center gap-2">
                                <button className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"><Settings size={14} /></button>
                            </div>
                        </div>

                        {/* Canvas */}
                        <div className="flex-1 overflow-auto p-8 relative">
                            {/* Grid backdrop */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                            <div className="relative w-full max-w-6xl mx-auto grid grid-cols-12 gap-4">
                                {activeDash.widgets.map(w => (
                                    <div key={w.id} className="bg-[#111722] border border-slate-700/50 rounded-lg shadow-2xl overflow-hidden relative group" style={{ gridColumn: `span ${w.w}`, minHeight: `${w.h * 100}px` }}>
                                        {/* Widget Header */}
                                        <div className="h-8 bg-[#18202d] border-b border-slate-800 flex justify-between items-center px-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{w.type}</span>
                                            <button
                                                onClick={() => setActiveDash({ ...activeDash, widgets: activeDash.widgets.filter(x => x.id !== w.id) })}
                                                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                        {/* Widget Body Mock */}
                                        <div className="p-4 flex flex-col items-center justify-center h-[calc(100%-2rem)] text-slate-600">
                                            {w.type === 'TABLE' && <Table size={32} className="opacity-20 mb-2" />}
                                            {w.type === 'CHART' && <LineChart size={32} className="opacity-20 mb-2" />}
                                            {w.type === 'ALERT' && <AlertTriangle size={32} className="opacity-20 mb-2" />}
                                            <p className="text-xs font-medium">Unconfigured {w.type}</p>
                                        </div>
                                    </div>
                                ))}
                                {activeDash.widgets.length === 0 && (
                                    <div className="col-span-12 h-64 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500">
                                        <TerminalSquare size={48} className="opacity-20 mb-4" />
                                        <p>Drag or add widgets from the toolbar to build your application.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <LayoutGrid size={48} className="opacity-20 mb-4" />
                        <p>Select an App from the left, or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
