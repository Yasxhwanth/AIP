'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/apiClient';
import {
    Activity,
    CheckCircle2,
    AlertCircle,
    Clock,
    Zap,
    RefreshCcw,
    BarChart3,
    ShieldCheck,
    History,
    ChevronRight,
    Search,
    Cpu,
    Target,
    Timer
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { Toolbar } from '@/components/ui/Toolbar';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    AreaChart,
    Area
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AgentMetric {
    tool: string;
    successRate: number;
    avgLatency: number;
    p90Latency: number;
    totalCalls: number;
}

interface Trace {
    id: string;
    tool: string;
    actor: string;
    status: string;
    durationMs: number;
    timestamp: string;
}

interface AgentTelemetry {
    summary: {
        totalCalls: number;
        successRate: number;
        avgLatency: number;
    };
    metricsByTool: AgentMetric[];
    recentTrace: Trace[];
}

// ─── Custom Styles ───────────────────────────────────────────────────────────

const CHART_COLORS = ['#106ba3', '#0e5a8a', '#137cbd', '#48aff0', '#2d72d2'];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AgentMonitorPage() {
    const [telemetry, setTelemetry] = useState<AgentTelemetry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTelemetry = async () => {
        try {
            const data = await ApiClient.get<AgentTelemetry>('/api/v1/telemetry/agents');
            setTelemetry(data);
            setError(null);
        } catch (err) {
            setError('TELEMETRY_LINK_LOST: AGENT_SUBSYSTEM_OFFLINE');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !telemetry) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-pt-bg text-pt-text font-mono">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping bg-pt-intent-primary opacity-20 rounded-full" />
                    <Cpu className="w-12 h-12 animate-pulse text-pt-intent-primary relative" />
                </div>
                <p className="mt-8 text-[11px] font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Agent Telemetry</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-pt-bg">
            {/* SRE Header */}
            <header className="px-6 py-4 border-b border-pt-border bg-pt-bg-panel/20 shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <SeverityChip severity="warning" label="AI_SUBSYSTEM_MONITOR" className="text-[8px]" />
                            <span className="text-[9px] font-mono text-pt-text-muted opacity-50">NODE: AP-SOUTH-1.AGENT_CORE</span>
                        </div>
                        <h1 className="text-xl font-black text-pt-text uppercase tracking-tight">Agent Intelligence Monitor</h1>
                        <p className="text-[10px] text-pt-text-muted font-bold uppercase tracking-widest mt-1">Real-time LLM tool performance and reliability</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="bg-pt-bg border border-pt-border px-3 py-1.5 rounded flex items-center gap-3">
                            <span className="text-[9px] font-black text-pt-text-muted uppercase">Refresh_Cycle: 10s</span>
                            <div className="h-4 w-px bg-pt-border" />
                            <button onClick={fetchTelemetry} className="text-pt-intent-primary hover:text-pt-text transition-colors">
                                <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {error && (
                    <Card className="bg-pt-intent-danger/5 border-pt-intent-danger/20">
                        <div className="flex items-center gap-3 text-pt-intent-danger">
                            <AlertCircle size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{error}</span>
                        </div>
                    </Card>
                )}

                {/* KPI Strip */}
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-pt-bg-panel/40 border border-pt-border p-4 rounded group hover:border-pt-intent-primary/30 transition-all">
                        <div className="text-[8px] font-black text-pt-text-muted uppercase tracking-[0.2em] mb-1">Total_Invocations</div>
                        <div className="flex items-end justify-between">
                            <div className="text-2xl font-black text-pt-text">{telemetry?.summary.totalCalls.toLocaleString() || '0'}</div>
                            <Activity size={16} className="text-pt-intent-primary opacity-40 group-hover:opacity-100" />
                        </div>
                    </div>
                    <div className="bg-pt-bg-panel/40 border border-pt-border p-4 rounded group hover:border-pt-intent-success/30 transition-all">
                        <div className="text-[8px] font-black text-pt-text-muted uppercase tracking-[0.2em] mb-1">Success_Rate</div>
                        <div className="flex items-end justify-between">
                            <div className="text-2xl font-black text-pt-intent-success">{telemetry?.summary.successRate.toFixed(1) || '0.0'}%</div>
                            <ShieldCheck size={16} className="text-pt-intent-success opacity-40 group-hover:opacity-100" />
                        </div>
                    </div>
                    <div className="bg-pt-bg-panel/40 border border-pt-border p-4 rounded group hover:border-pt-intent-primary/30 transition-all">
                        <div className="text-[8px] font-black text-pt-text-muted uppercase tracking-[0.2em] mb-1">Avg_Latency_Tool</div>
                        <div className="flex items-end justify-between">
                            <div className="text-2xl font-black text-pt-text">{Math.round(telemetry?.summary.avgLatency || 0)}ms</div>
                            <Timer size={16} className="text-pt-intent-primary opacity-40 group-hover:opacity-100" />
                        </div>
                    </div>
                    <div className="bg-pt-bg-panel/40 border border-pt-border p-4 rounded group hover:border-pt-intent-warning/30 transition-all">
                        <div className="text-[8px] font-black text-pt-text-muted uppercase tracking-[0.2em] mb-1">Active_Agents</div>
                        <div className="flex items-end justify-between">
                            <div className="text-2xl font-black text-pt-text">12</div>
                            <Zap size={16} className="text-pt-intent-warning opacity-40 group-hover:opacity-100" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Tool Latency Matrix */}
                    <Card title="Tool Latency Matrix (ms)" pill="P90_LATENCY" className="h-[350px]">
                        <div className="h-full w-full pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={telemetry?.metricsByTool || []} layout="vertical" margin={{ left: 20, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                                    <XAxis type="number" fontSize={10} stroke="#444" axisLine={false} tickLine={false} />
                                    <YAxis dataKey="tool" type="category" fontSize={9} stroke="#888" width={100} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
                                        itemStyle={{ color: '#106ba3' }}
                                        cursor={{ fill: 'rgba(16,107,163,0.05)' }}
                                    />
                                    <Bar dataKey="p90Latency" radius={[0, 2, 2, 0]} barSize={12}>
                                        {(telemetry?.metricsByTool || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Tool Volume Distribution */}
                    <Card title="Traffic Distribution" pill="AGENT_CALL_VOLUME" className="h-[350px]">
                        <div className="h-full w-full pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={telemetry?.metricsByTool || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#106ba3" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#106ba3" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="tool" fontSize={9} stroke="#444" axisLine={false} tickLine={false} />
                                    <YAxis fontSize={10} stroke="#444" axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
                                    />
                                    <Area type="monotone" dataKey="totalCalls" stroke="#106ba3" fillOpacity={1} fill="url(#colorCalls)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Execution Trace Table */}
                <Card title="Real-time Execution Trace" pill="LIVE_AUDIT_STREAM">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-pt-bg text-pt-text-muted text-[8px] font-black uppercase tracking-[0.2em] border-b border-pt-border">
                                    <th className="px-6 py-3">Trace ID</th>
                                    <th className="px-6 py-3">Subsystem:Tool</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Duration</th>
                                    <th className="px-6 py-3 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pt-border/30">
                                {telemetry?.recentTrace.map((trace) => (
                                    <tr key={trace.id} className="hover:bg-pt-intent-primary/[0.02] transition-colors group cursor-pointer">
                                        <td className="px-6 py-3 font-mono text-[9px] text-pt-text-muted opacity-40">
                                            {trace.id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="text-[11px] font-bold text-pt-text flex items-center gap-1.5">
                                                <Zap size={10} className="text-pt-intent-warning" />
                                                {trace.tool}
                                            </div>
                                            <div className="text-[8px] text-pt-text-muted opacity-50 font-mono uppercase">ACTOR: {trace.actor}</div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <SeverityChip
                                                severity={trace.status === 'SUCCESS' ? 'success' : 'danger'}
                                                label={trace.status}
                                            />
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-[10px] font-bold text-pt-text-muted">
                                            {trace.durationMs}ms
                                        </td>
                                        <td className="px-6 py-3 text-right text-[9px] font-bold text-pt-text-muted uppercase">
                                            {formatDistanceToNow(new Date(trace.timestamp), { addSuffix: true })}
                                        </td>
                                    </tr>
                                ))}
                                {(!telemetry || telemetry.recentTrace.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center opacity-10">
                                            <div className="flex flex-col items-center gap-2">
                                                <History size={24} />
                                                <span className="text-[10px] uppercase font-black tracking-widest">No tool activity captured</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </main>
        </div>
    );
}
