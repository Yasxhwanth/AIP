"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
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
import { Card } from "@/components/ui/Card";
import { MiniList, MiniListItem } from "@/components/ui/MiniList";

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
            if (sse) sse.close();
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

    const colors = ["#106BA3", "#D9822B", "#0D8050", "#7157D9"];

    return (
        <div className="flex flex-col h-full bg-pt-bg overflow-hidden select-none">
            {/* Tactical Toolbar */}
            <div className="h-11 border-b border-pt-border flex items-center px-4 justify-between bg-pt-bg-panel/50 backdrop-blur-md shrink-0">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-pt-text">
                        <Activity size={14} className="text-pt-intent-primary" />
                        <span>Vector Telemetry</span>
                    </div>

                    <div className="flex bg-pt-bg border border-pt-border p-0.5 rounded-sm">
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all",
                                isLive ? "bg-pt-intent-success text-white shadow-lg" : "text-pt-text-muted hover:text-pt-text"
                            )}
                        >
                            {isLive ? <PlayCircle size={10} strokeWidth={3} /> : <PauseCircle size={10} strokeWidth={3} />}
                            {isLive ? "Live" : "Paused"}
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-2 px-2.5 h-7 bg-pt-bg border border-pt-border rounded-sm">
                        <Clock size={12} className="text-pt-text-muted" />
                        <span className="text-[10px] font-mono font-bold text-pt-text-muted">T-ROLLUP: 15s</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* ── Asset Tree (Left Rail) ── */}
                <aside className="w-64 border-r border-pt-border bg-pt-bg flex flex-col shrink-0">
                    <div className="p-3 border-b border-pt-border bg-pt-bg/50">
                        <div className="relative group">
                            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-pt-text-muted" />
                            <input
                                type="text"
                                placeholder="Filter objects..."
                                className="w-full bg-pt-bg-panel border border-pt-border rounded px-8 py-1.5 text-[10px] focus:outline-none focus:border-pt-intent-primary transition-all font-medium"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                        {loadingAssets ? (
                            <div className="flex justify-center p-8"><Loader2 size={24} className="animate-spin text-pt-intent-primary opacity-30" /></div>
                        ) : (
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <MiniList>
                                    {assetTree.map(site => (
                                        <div key={site.id} className="mb-2">
                                            <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-pt-text-muted opacity-40">
                                                {site.name}
                                            </div>
                                            <div className="space-y-0.5">
                                                {site.children.map((child: any) => (
                                                    <MiniListItem
                                                        key={child.id}
                                                        label={child.name}
                                                        active={selectedAsset === child.id}
                                                        onClick={() => setSelectedAsset(child.id)}
                                                        icon={Box}
                                                        metadata="VECTOR_LINK"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </MiniList>
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── Main Ops Center ── */}
                <main className="flex-1 flex flex-col min-w-0 bg-pt-bg">
                    {/* KPI Tiles */}
                    <div className="p-4 grid grid-cols-4 gap-4 bg-pt-bg/50 border-b border-pt-border shrink-0">
                        {kpis.map((kpi, idx) => (
                            <Card key={idx} title={kpi.name} className="h-28">
                                <div className="p-3 flex flex-col justify-end h-full">
                                    <div className="flex items-baseline justify-between pt-4">
                                        <div className="text-[24px] font-mono font-bold text-pt-text tabular-nums leading-none tracking-tighter">{kpi.val}</div>
                                        <div className={`text-[10px] font-black ${kpi.trend === '↑' ? 'text-pt-intent-success' : 'text-pt-intent-danger'}`}>
                                            {kpi.trend === '↑' ? 'SIG_GAIN' : kpi.trend === '↓' ? 'SIG_LOSS' : 'STEADY'}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        <Card title="FEED STATUS" className="h-28 border-l-pt-intent-success border-l-2">
                            <div className="p-3 flex flex-col justify-end h-full">
                                <div className="flex items-center space-x-2 pt-4">
                                    <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-pt-intent-success animate-pulse shadow-[0_0_8px_#5BBD72]' : 'bg-pt-text-muted'}`} />
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${isLive ? 'text-pt-intent-success' : 'text-pt-text-muted'}`}>
                                        {isLive ? 'ACTIVE_LINK' : 'LINK_OFFLINE'}
                                    </span>
                                </div>
                                <div className="text-[8px] uppercase tracking-widest text-pt-text-muted mt-2 opacity-50">Ingestion Priority Level: 1</div>
                            </div>
                        </Card>
                    </div>

                    {/* Chart Canvas */}
                    <div className="flex-1 p-6 overflow-hidden">
                        <Card title="Signal Processing Analysis" pill={`SAMPLES: ${chartData.length.toLocaleString()}`} className="h-full">
                            <div className="flex-1 p-4">
                                {chartData.length === 0 && !loadingRollups ? (
                                    <div className="h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-pt-text-muted opacity-30">
                                        No signal data present in buffer
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis
                                                dataKey="time"
                                                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}
                                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                                tickLine={false}
                                                minTickGap={40}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0E1623', border: '1px solid #1A2433', fontSize: '10px', fontWeight: 'bold' }}
                                                itemStyle={{ fontSize: '10px' }}
                                            />
                                            <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '10px' }} iconType="rect" />
                                            {activeMetrics.map((m, idx) => (
                                                <Line
                                                    key={m}
                                                    type="monotone"
                                                    dataKey={m}
                                                    stroke={colors[idx % colors.length]}
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 3, strokeWidth: 0, fill: '#fff' }}
                                                    isAnimationActive={false}
                                                />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card>
                    </div>
                </main>

                {/* ── Status Bar (Right) ── */}
                <aside className="w-80 border-l border-pt-border bg-pt-bg-panel/10 flex flex-col shrink-0">
                    <div className="p-3 border-b border-pt-border font-bold text-[9px] text-pt-text-muted uppercase tracking-[0.2em] bg-pt-bg/50">
                        Signal Meta
                    </div>
                    <div className="flex-1 p-4 space-y-6">
                        <div className="border border-pt-border/50 p-4 rounded bg-pt-bg/30">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-pt-intent-primary mb-3">Ingestion Protocol</h4>
                            <p className="text-[11px] leading-relaxed text-pt-text-muted italic">
                                Real-time multiplexed stream via SSE. Signal vectors are normalized and indexed for mission-critical audit trails.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-pt-text-muted">Health Signals</div>
                            <div className="space-y-1.5">
                                {[
                                    { name: 'TCP_ESTABLISHED', ok: true },
                                    { name: 'INDEX_LATENCY', ok: true },
                                    { name: 'BUFFER_OVERFLOW', ok: false }
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center justify-between text-[10px] bg-pt-bg p-2 border border-pt-border/50 rounded">
                                        <span className="font-mono text-pt-text-muted">{s.name}</span>
                                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${s.ok ? 'bg-pt-intent-success/10 text-pt-intent-success border border-pt-intent-success/30' : 'bg-pt-intent-danger/10 text-pt-intent-danger border border-pt-intent-danger/30'}`}>
                                            {s.ok ? 'OK' : 'ERROR'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div >
        </div >
    );
}
