"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    Search,
    Filter,
    ChevronDown,
    Box,
    CornerDownRight,
    LineChart as LineChartIcon,
    AlertOctagon,
    Clock,
    Download,
    Maximize2,
    PlayCircle,
    PauseCircle,
    Settings,
    Loader2
} from "lucide-react";
import { ApiClient, API_BASE_URL } from "@/lib/apiClient";
import * as T from '@/lib/types';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface ChartPoint {
    time: string;
    timestamp: number;
    [key: string]: any;
}

export default function TelemetryDashboard() {
    const [isLive, setIsLive] = useState(true);

    // Entity Data
    const [assetTree, setAssetTree] = useState<any[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
    const [loadingAssets, setLoadingAssets] = useState(true);

    // Telemetry Data
    const [chartData, setChartData] = useState<ChartPoint[]>([]);
    const [activeMetrics, setActiveMetrics] = useState<string[]>([]);
    const [loadingRollups, setLoadingRollups] = useState(false);

    // Fetch Topology
    useEffect(() => {
        async function fetchTopology() {
            try {
                const types = await ApiClient.get<T.EntityType[]>('/entity-types');
                const treePromises = types.map(async (t) => {
                    const insts = await ApiClient.get<T.EntityInstance[]>(`/entity-types/${t.id}/instances`);
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

    // Fetch Historical Data and setup SSE
    useEffect(() => {
        if (!selectedAsset) return;

        let sse: EventSource | null = null;
        const metricsSet = new Set<string>();

        async function fetchHistorical() {
            setLoadingRollups(true);
            try {
                const raw = await ApiClient.get<T.TimeseriesMetric[]>(`/telemetry/${selectedAsset}`);

                const grouped = raw.reduce((acc: any, point: any) => {
                    metricsSet.add(point.metric);
                    const timeKey = new Date(point.timestamp).toLocaleTimeString();
                    if (!acc[timeKey]) acc[timeKey] = { time: timeKey, timestamp: new Date(point.timestamp).getTime() };
                    acc[timeKey][point.metric] = point.value;
                    return acc;
                }, {});

                const sorted = (Object.values(grouped) as ChartPoint[]).sort((a: ChartPoint, b: ChartPoint) => a.timestamp - b.timestamp);
                setChartData(sorted.slice(-100));
                setActiveMetrics(Array.from(metricsSet));
            } catch (err) {
                console.error("Failed to fetch historical telemetry", err);
            } finally {
                setLoadingRollups(false);
            }
        }

        fetchHistorical();

        if (isLive) {
            sse = new EventSource(`${API_BASE_URL}/telemetry/${selectedAsset}/stream`);
            sse.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const newMetrics = data.metrics;
                if (!newMetrics || newMetrics.length === 0) return;

                const timeKey = new Date(newMetrics[0].timestamp).toLocaleTimeString();
                const timestamp = new Date(newMetrics[0].timestamp).getTime();
                const newPoint: ChartPoint = { time: timeKey, timestamp };

                newMetrics.forEach((m: any) => {
                    newPoint[m.metric] = m.value;
                    metricsSet.add(m.metric);
                });

                setActiveMetrics(Array.from(metricsSet));
                setChartData(prev => [...prev.slice(-99), newPoint]);
            };
            sse.onerror = (err) => {
                console.error("SSE Error", err);
            };
        }

        return () => {
            if (sse) {
                sse.close();
            }
        };
    }, [selectedAsset, isLive]);

    // Compute KPIs dynamically based on last 2 points
    const kpis = activeMetrics.slice(0, 3).map(m => {
        const lastTwo = chartData.filter(d => d[m] !== undefined).slice(-2);
        const val = lastTwo.length > 0 ? lastTwo[lastTwo.length - 1][m] : 0;
        const prev = lastTwo.length > 1 ? lastTwo[lastTwo.length - 2][m] : val;
        return {
            name: m,
            val: val.toFixed(2),
            trend: val > prev ? '↑' : val < prev ? '↓' : '-'
        };
    });

    const colors = ["#ea580c", "#2563eb", "#16a34a", "#9333ea"];

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
                        {isLive ? 'Live Updates' : 'Paused'}
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
                                    <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'animate-pulse bg-emerald-500' : 'bg-slate-400'}`}></span>
                                    <span className={`text-sm font-bold ${isLive ? 'text-emerald-700' : 'text-slate-600'}`}>
                                        {isLive ? 'STREAMING' : 'OFFLINE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Chart Area */}
                    <div className="flex-1 bg-slate-50/50 p-4 flex flex-col gap-4 overflow-y-auto">
                        <div className="bg-white border border-slate-200 rounded shadow-sm flex flex-col p-4 flex-1 min-h-[400px]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                    <LineChartIcon className="w-4 h-4 text-orange-600" /> Multivariate Timeseries
                                    <span className="text-[10px] font-normal text-slate-400 ml-2">({chartData.length} points)</span>
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button className="text-slate-400 hover:text-slate-700 transition-colors"><Maximize2 className="w-4 h-4" /></button>
                                    <button className="text-slate-400 hover:text-slate-700 transition-colors"><Settings className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Chart Canvas */}
                            <div className="flex-1 w-full bg-white flex items-center justify-center p-2 relative h-full">
                                {chartData.length === 0 && !loadingRollups ? (
                                    <div className="text-xs text-slate-500 bg-white/80 p-3 rounded shadow-sm border border-slate-200 text-center">
                                        No telemetry records found for this asset.
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis
                                                dataKey="time"
                                                tick={{ fontSize: 10, fill: '#64748b' }}
                                                axisLine={{ stroke: '#cbd5e1' }}
                                                tickLine={false}
                                                minTickGap={30}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10, fill: '#64748b' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                                            {activeMetrics.map((m, idx) => (
                                                <Line
                                                    key={m}
                                                    type="monotone"
                                                    dataKey={m}
                                                    stroke={colors[idx % colors.length]}
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                                    isAnimationActive={false}
                                                />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Pane: Details & Anomalies */}
                <div className="w-72 border-l border-slate-200 bg-slate-50 flex flex-col shrink-0">
                    <div className="p-3 border-b border-slate-200 font-semibold text-[10px] text-slate-500 flex items-center gap-1.5 uppercase tracking-wider bg-slate-100">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Live Streaming Status
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="text-xs text-slate-600 leading-relaxed border border-slate-200 p-3 rounded bg-white shadow-sm">
                            Real-time Server-Sent Events (SSE) connected to port 3001. Chart animates live as metrics are ingested into POST /telemetry.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
