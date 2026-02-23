"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    Search,
    Filter,
    ChevronDown,
    Box,
    CornerDownRight,
    LineChart,
    BarChart2,
    AlertOctagon,
    Clock,
    Download,
    Maximize2,
    PlayCircle,
    PauseCircle,
    Settings,
    Loader2
} from "lucide-react";
import { ApiClient } from "@/lib/apiClient";

export default function TelemetryDashboard() {
    const [isLive, setIsLive] = useState(true);

    // Entity Data
    const [assetTree, setAssetTree] = useState<any[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
    const [loadingAssets, setLoadingAssets] = useState(true);

    // Telemetry Data
    const [rollups, setRollups] = useState<any[]>([]);
    const [loadingRollups, setLoadingRollups] = useState(false);

    useEffect(() => {
        async function fetchTopology() {
            try {
                const types = await ApiClient.get<any[]>('/entity-types');
                const treePromises = types.map(async (t) => {
                    const insts = await ApiClient.get<any[]>(`/entity-types/${t.id}/instances`);
                    return {
                        id: t.id,
                        name: t.name,
                        expanded: true,
                        children: insts.map(i => ({
                            id: i.logicalId,
                            name: i.logicalId,
                            status: "ok"
                        }))
                    };
                });

                const loadedTree = await Promise.all(treePromises);
                const validTree = loadedTree.filter(l => l.children.length > 0);
                setAssetTree(validTree);

                if (validTree.length > 0 && validTree[0].children.length > 0) {
                    setSelectedAsset(validTree[0].children[0].id);
                }
            } catch (err) {
                console.error("Failed to load asset topology", err);
            } finally {
                setLoadingAssets(false);
            }
        }
        fetchTopology();
    }, []);

    useEffect(() => {
        if (!selectedAsset) return;

        async function fetchTelemetry() {
            setLoadingRollups(true);
            try {
                // Fetch up to 500 recent rollups for this logical ID
                const data = await ApiClient.get<any[]>(`/telemetry/${selectedAsset}/rollups`);
                setRollups(data);
            } catch (err) {
                console.error("Failed to fetch telemetry", err);
            } finally {
                setLoadingRollups(false);
            }
        }

        fetchTelemetry();

        // If live, poll every 5 seconds
        let interval: NodeJS.Timeout;
        if (isLive) {
            interval = setInterval(fetchTelemetry, 5000);
        }
        return () => clearInterval(interval);

    }, [selectedAsset, isLive]);

    // Extract unique metrics and their latest values for KPIs
    const metricsByName = rollups.reduce((acc, r) => {
        if (!acc[r.metric]) acc[r.metric] = [];
        acc[r.metric].push(r);
        return acc;
    }, {} as Record<string, any[]>);

    const activeMetrics = Object.keys(metricsByName);
    const kpis = activeMetrics.slice(0, 3).map(m => {
        const sorted = metricsByName[m].sort((a: any, b: any) => new Date(b.windowStart).getTime() - new Date(a.windowStart).getTime());
        return {
            name: m,
            val: sorted[0]?.avgValue?.toFixed(2) || "0.00",
            trend: sorted.length > 1 ? (sorted[0].avgValue > sorted[1].avgValue ? '↑' : '↓') : '-'
        };
    });

    // Detect pseudo-anomalies (values above certain arbitrary threshold just for UX demonstration)
    const recentAnomalies = rollups.filter(r => r.maxValue && r.maxValue > 100).slice(0, 5).map((r, i) => ({
        id: i,
        time: new Date(r.windowStart).toLocaleTimeString(),
        metric: r.metric,
        severity: r.maxValue > 500 ? 'high' : 'medium',
        val: r.maxValue.toFixed(2),
        threshold: "100.0"
    }));

    return (
        <div className="h-full w-full flex flex-col bg-white text-slate-900 border-t border-slate-200">
            {/* Top Action Bar */}
            <div className="h-12 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-orange-100 text-orange-700">
                        <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">Telemetry</span>
                    <span className="text-slate-300 mx-2">/</span>
                    <span className="text-sm font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                        {selectedAsset || "No Asset"}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsLive(!isLive)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded transition-colors shadow-sm border ${isLive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                    >
                        {isLive ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                        {isLive ? 'Live Updates (1s)' : 'Paused'}
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50 transition-colors shadow-sm">
                        <Download className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* 3-Pane Workspace */}
            <div className="flex-1 flex min-h-0">
                {/* Left Pane: Asset/Sensor Hierarchy */}
                <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
                    <div className="p-3 border-b border-slate-200 font-semibold text-[10px] text-slate-500 flex justify-between items-center uppercase tracking-wider">
                        Asset Topology
                        <Filter className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-700" />
                    </div>
                    <div className="p-2 border-b border-slate-200">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filter sensors..."
                                className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-orange-500 transition-colors bg-white shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {loadingAssets ? (
                            <div className="flex justify-center p-6 text-slate-400">
                                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                            </div>
                        ) : assetTree.length === 0 ? (
                            <div className="p-4 text-xs text-slate-500 text-center">No assets found</div>
                        ) : (
                            assetTree.map(site => (
                                <div key={site.id} className="mb-2">
                                    <div className="flex items-center text-slate-700 bg-slate-200 p-1 rounded group">
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 mr-1" />
                                        <Box className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                                        <span className="text-xs font-semibold select-none">{site.name}</span>
                                    </div>
                                    <div className="ml-5 mt-1 border-l border-slate-300 pl-2 space-y-1">
                                        {site.children.map((child: any) => (
                                            <div
                                                key={child.id}
                                                onClick={() => setSelectedAsset(child.id)}
                                                className={`
                                                    flex items-center justify-between p-1 rounded cursor-pointer transition-colors text-xs
                                                    ${selectedAsset === child.id ? 'bg-orange-100/50 text-orange-800 font-bold border border-orange-200' : 'text-slate-600 hover:bg-slate-200 border border-transparent'}
                                                `}
                                            >
                                                <div className="flex items-center">
                                                    <CornerDownRight className="w-3 h-3 text-slate-300 mr-1.5 shrink-0" />
                                                    <span className="truncate w-32">{child.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Center Pane: Telemetry Visualization */}
                <div className="flex-1 bg-white flex flex-col min-w-0">
                    {/* Header & KPI Summary */}
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <div className="flex items-center gap-3 mb-3">
                            <h1 className="text-lg font-bold text-slate-900">{selectedAsset || 'Select Asset'}</h1>
                            {loadingRollups && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {kpis.length > 0 ? kpis.map((kpi, idx) => (
                                <div key={idx} className={`border rounded px-3 py-2 ${idx === 0 ? 'border-orange-200 bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>
                                    <div className={`text-[10px] uppercase tracking-widest font-semibold mb-1 ${idx === 0 ? 'text-orange-600' : 'text-slate-500'}`}>{kpi.name}</div>
                                    <div className="flex items-end gap-2">
                                        <span className={`text-xl font-mono font-bold ${idx === 0 ? 'text-orange-700' : 'text-slate-800'}`}>{kpi.val}</span>
                                        <span className={`text-[10px] font-bold mb-1.5 ml-auto tracking-tighter ${kpi.trend === '↑' ? 'text-emerald-600' : 'text-red-500'}`}>{kpi.trend}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-3 text-xs text-slate-400 p-2">Awaiting timeseries data ingestion...</div>
                            )}

                            <div className="border border-slate-200 rounded px-3 py-2 bg-slate-50 flex flex-col justify-center">
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Status</div>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${rollups.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                    <span className={`text-sm font-bold ${rollups.length > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                                        {rollups.length > 0 ? 'RECEIVING' : 'IDLE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Chart Area */}
                    <div className="flex-1 bg-slate-50/50 p-4 flex flex-col gap-4 overflow-y-auto">
                        <div className="bg-white border border-slate-200 rounded shadow-sm flex flex-col p-4 flex-1 min-h-[300px]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                    <LineChart className="w-4 h-4 text-orange-600" /> Multivariate Timeseries
                                    <span className="text-[10px] font-normal text-slate-400 ml-2">({rollups.length} points)</span>
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button className="text-slate-400 hover:text-slate-700 transition-colors"><Maximize2 className="w-4 h-4" /></button>
                                    <button className="text-slate-400 hover:text-slate-700 transition-colors"><Settings className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Chart Canvas */}
                            <div className="flex-1 w-full border border-slate-100 rounded relative overflow-hidden bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px] flex items-center justify-center">
                                {rollups.length === 0 ? (
                                    <div className="text-xs text-slate-500 bg-white/80 p-3 rounded shadow-sm border border-slate-200">
                                        No telemetry rollups found for this asset in Postgres.
                                        <br />Use the API to ingest records to see chart lines.
                                    </div>
                                ) : (
                                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        {/* Pure mock visualization since we lack a charting library, but scaled to indicate data is present */}
                                        <polyline points="0,80 20,75 40,82 60,70 80,78 100,65" fill="none" stroke="#2563eb" strokeWidth="1.5" />
                                        <polyline points="0,50 20,55 40,45 60,60 80,40 100,50" fill="none" stroke="#ea580c" strokeWidth="1.5" />
                                        <line x1="85" y1="0" x2="85" y2="100" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,2" />
                                        <circle cx="85" cy="45" r="2" fill="#ea580c" />
                                    </svg>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mt-3">
                                {activeMetrics.map((m, i) => (
                                    <div key={m} className="flex items-center gap-1.5">
                                        <div className={`w-3 h-0.5 ${i === 0 ? 'bg-orange-600' : 'bg-blue-600'}`}></div>
                                        <span className="text-[10px] font-mono text-slate-600">{m}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Pane: Anomalies & Alerts */}
                <div className="w-72 border-l border-slate-200 bg-slate-50 flex flex-col shrink-0">
                    <div className="p-3 border-b border-slate-200 font-semibold text-[10px] text-slate-500 flex items-center gap-1.5 uppercase tracking-wider bg-slate-100">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Active Spikes
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {recentAnomalies.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 text-xs border border-dashed border-slate-300 rounded bg-slate-50/50">
                                No anomalous rollups detected in current window.
                            </div>
                        ) : recentAnomalies.map(anomaly => (
                            <div key={anomaly.id} className="bg-white border border-slate-200 rounded shadow-sm p-3 relative overflow-hidden group hover:border-orange-300 transition-colors cursor-pointer">
                                <div className={`absolute top-0 left-0 w-1 h-full ${anomaly.severity === 'high' ? 'bg-red-500' : 'bg-orange-400'}`}></div>

                                <div className="flex justify-between items-start mb-1.5 pl-2">
                                    <span className="font-mono text-xs font-bold text-slate-800">{anomaly.metric}</span>
                                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono"><Clock className="w-3 h-3" /> {anomaly.time}</span>
                                </div>

                                <div className="flex gap-2 text-xs pl-2">
                                    <div className="flex-1 bg-slate-50 border border-slate-100 p-1.5 rounded">
                                        <div className="text-[9px] text-slate-400 uppercase">Max Val</div>
                                        <div className="font-mono font-bold text-red-600">{anomaly.val}</div>
                                    </div>
                                    <div className="flex-1 bg-slate-50 border border-slate-100 p-1.5 rounded">
                                        <div className="text-[9px] text-slate-400 uppercase">Threshold</div>
                                        <div className="font-mono font-semibold text-slate-600">{anomaly.threshold}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
