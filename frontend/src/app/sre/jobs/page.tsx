'use client';

import React, { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/apiClient';
import {
    Activity,
    CheckCircle2,
    AlertCircle,
    Clock,
    Users,
    RefreshCcw,
    Search,
    Server,
    ShieldAlert,
    Terminal,
    Cpu,
    ArrowUpRight,
    Filter,
    Calendar,
    ChevronDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { SeverityChip } from '@/components/ui/SeverityChip';
import { Toolbar } from '@/components/ui/Toolbar';
import { useIntelligenceStore } from '@/store/intelligenceStore';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Job {
    id: string;
    jobType: string;
    status: string;
    attempts: number;
    recordsProcessed: number;
    recordsFailed: number;
    recordsDropped: number;
    lastError?: string;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    integrationJob?: {
        name: string;
    };
}

interface OutboxTelemetry {
    stats: Record<string, number>;
    recent: any[];
}

interface Telemetry {
    summary: Record<string, number>;
    activeWorkers: number;
    recentJobs: Job[];
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SREJobsPage() {
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [outbox, setOutbox] = useState<OutboxTelemetry | null>(null);
    const [apiStats, setApiStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { setContext } = useIntelligenceStore();

    const fetchTelemetry = async () => {
        try {
            const [jobsData, outboxData, apiData] = await Promise.all([
                ApiClient.get<Telemetry>('/api/v1/telemetry/jobs'),
                ApiClient.get<OutboxTelemetry>('/api/v1/telemetry/outbox'),
                ApiClient.get<any>('/api/v1/telemetry/api-latency')
            ]);

            setTelemetry(jobsData);
            setOutbox(outboxData);
            setApiStats(apiData.buckets || []);
            setError(null);

            // Sync context with AI Assistant
            setContext('sre', {
                jobId: jobsData.recentJobs[0]?.id,
                apiHealth: apiData.buckets?.[apiData.buckets.length - 1],
                filters: { status: 'ALL' }
            });
        } catch (err) {
            setError('CRITICAL_SYSTEM_FAILURE: NODE_DISCONNECT');
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

    const statusConfig: Record<string, { color: string; bg: string; border: string; icon: any }> = {
        QUEUED: { color: 'text-pt-text-muted', bg: 'bg-pt-bg', border: 'border-pt-border', icon: Clock },
        RUNNING: { color: 'text-pt-intent-primary', bg: 'bg-pt-intent-primary/10', border: 'border-pt-intent-primary/30', icon: Activity },
        COMPLETED: { color: 'text-pt-intent-success', bg: 'bg-pt-intent-success/10', border: 'border-pt-intent-success/30', icon: CheckCircle2 },
        FAILED: { color: 'text-pt-intent-danger', bg: 'bg-pt-intent-danger/10', border: 'border-pt-intent-danger/30', icon: ShieldAlert },
        DEAD_LETTER: { color: 'text-pt-intent-warning', bg: 'bg-pt-intent-warning/10', border: 'border-pt-intent-warning/30', icon: AlertCircle },
    };

    if (loading && !telemetry) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-pt-bg text-pt-text font-mono">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping bg-pt-intent-primary opacity-20 rounded-full" />
                    <RefreshCcw className="w-12 h-12 animate-spin text-pt-intent-primary relative" />
                </div>
                <p className="mt-8 text-[11px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing SRE Command Nexus</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-pt-bg">
            {/* Operator Header */}
            <header className="px-6 py-4 border-b border-pt-border bg-pt-bg-panel/20 shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <SeverityChip severity="danger" label="CRITICAL_SRE_MONITOR" className="text-[8px]" />
                            <span className="text-[9px] font-mono text-pt-text-muted opacity-50">NODE: AP-SOUTH-1</span>
                        </div>
                        <h1 className="text-xl font-black text-pt-text uppercase tracking-tight">Job Execution Matrix</h1>
                        <p className="text-[10px] text-pt-text-muted font-bold uppercase tracking-widest mt-1">Real-time telemetry and reliability management</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="bg-pt-bg border border-pt-border px-3 py-1.5 rounded flex items-center gap-3">
                            <span className="text-[9px] font-black text-pt-text-muted uppercase">Refresh</span>
                            <div className="h-4 w-px bg-pt-border" />
                            <button onClick={fetchTelemetry} className="text-pt-intent-primary hover:text-pt-text transition-colors">
                                <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Operator Toolbar */}
            <Toolbar className="shrink-0 bg-pt-bg/50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-pt-bg border border-pt-border rounded text-[9px] font-black uppercase tracking-widest text-pt-text-muted">
                        <Calendar size={10} />
                        <span>Last 24 Hours</span>
                        <ChevronDown size={10} />
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-pt-bg border border-pt-border rounded text-[9px] font-black uppercase tracking-widest text-pt-text-muted">
                        <Filter size={10} />
                        <span>All Types</span>
                        <ChevronDown size={10} />
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <div className="px-2 py-0.5 border border-pt-intent-success/30 bg-pt-intent-success/5 text-pt-intent-success rounded text-[9px] font-black uppercase">Grid Linked</div>
                </div>
            </Toolbar>

            <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {error && (
                    <Card className="bg-pt-intent-danger/5 border-pt-intent-danger/20">
                        <div className="flex items-center gap-3 text-pt-intent-danger">
                            <AlertCircle size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{error}</span>
                        </div>
                    </Card>
                )}

                {/* Metric Strip (Aggregated Stats) */}
                <div className="grid grid-cols-5 gap-3">
                    {['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'DEAD_LETTER'].map((status) => {
                        const cfg = statusConfig[status];
                        const count = telemetry?.summary[status] ?? 0;
                        return (
                            <div key={status} className="bg-pt-bg-panel/40 border border-pt-border p-3 rounded flex items-center justify-between group hover:border-pt-intent-primary/30 transition-all cursor-pointer">
                                <div>
                                    <div className="text-[8px] font-black text-pt-text-muted uppercase tracking-[0.2em] mb-1">{status}</div>
                                    <div className={`text-lg font-black ${cfg.color}`}>{count.toLocaleString()}</div>
                                </div>
                                <cfg.icon size={16} className={`${cfg.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                            </div>
                        );
                    })}
                </div>

                {/* Execution Health & Throughput Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Execution Health Trends" pill="LIVE_FLOW" className="h-[300px]">
                        <div className="h-full w-full pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={telemetry?.recentJobs.slice(0, 20).reverse().map((j, i) => ({
                                    name: i,
                                    processed: j.recordsProcessed,
                                    failed: j.recordsFailed
                                })) || []}>
                                    <defs>
                                        <linearGradient id="colorProc" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#106ba3" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#106ba3" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="name" hide />
                                    <YAxis fontSize={10} stroke="#444" axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }} />
                                    <Area type="monotone" dataKey="processed" stroke="#106ba3" fillOpacity={1} fill="url(#colorProc)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="failed" stroke="#eb5a46" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card title="Latency Distribution" pill="JOB_RUNTIME_MS" className="h-[300px]">
                        <div className="h-full w-full pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={telemetry?.recentJobs.slice(0, 15).map(j => ({
                                    name: j.integrationJob?.name?.slice(0, 8) || j.id.slice(0, 8),
                                    latency: j.completedAt && j.startedAt ? new Date(j.completedAt).getTime() - new Date(j.startedAt).getTime() : 0
                                })) || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="name" fontSize={9} stroke="#444" axisLine={false} tickLine={false} />
                                    <YAxis fontSize={10} stroke="#444" axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                    <Bar dataKey="latency" fill="#106ba3" radius={[2, 2, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* API Health Matrix */}
                <Card title="API Operational Health" pill="LAST_60M" className="h-[300px]">
                    <div className="h-full w-full pb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={apiStats}>
                                <defs>
                                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#106ba3" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#106ba3" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eb5a46" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#eb5a46" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="label" fontSize={9} stroke="#444" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" fontSize={10} stroke="#444" axisLine={false} tickLine={false} label={{ value: 'ms', angle: -90, position: 'insideLeft', style: { fill: '#444', fontSize: '10px' } }} />
                                <YAxis yAxisId="right" orientation="right" fontSize={10} stroke="#444" axisLine={false} tickLine={false} label={{ value: '%', angle: 90, position: 'insideRight', style: { fill: '#444', fontSize: '10px' } }} />
                                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }} />
                                <Area yAxisId="left" type="monotone" dataKey="avgLatency" name="Latency (ms)" stroke="#106ba3" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
                                <Area yAxisId="right" type="monotone" dataKey="errorRate" name="Error Rate (%)" stroke="#eb5a46" fillOpacity={1} fill="url(#colorError)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Execution Timeline Matrix */}
                <Card
                    title="Global Execution Matrix"
                    pill={`ACTIVE_JOBS: ${telemetry?.summary['RUNNING'] || 0} | WORKERS: ${telemetry?.activeWorkers || 0}`}
                    className="min-h-[500px]"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-pt-bg text-pt-text-muted text-[8px] font-black uppercase tracking-[0.2em] border-b border-pt-border">
                                    <th className="px-6 py-3">Process ID</th>
                                    <th className="px-6 py-3">State</th>
                                    <th className="px-6 py-3 text-right">Telemetry (P/F/D)</th>
                                    <th className="px-6 py-3">Origin</th>
                                    <th className="px-6 py-3 text-right">Latency</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pt-border/30">
                                {telemetry?.recentJobs.map((job) => (
                                    <tr
                                        key={job.id}
                                        className="hover:bg-pt-intent-primary/[0.02] transition-colors group cursor-pointer"
                                        onClick={() => useIntelligenceStore.getState().updateSelection({ jobId: job.id })}
                                    >
                                        <td className="px-6 py-3">
                                            <div className="font-bold text-pt-text text-[11px] uppercase tracking-tight flex items-center gap-2">
                                                <Terminal size={10} className="text-pt-intent-primary" />
                                                {job.integrationJob?.name ?? job.id.slice(0, 12)}
                                            </div>
                                            <div className="text-[8px] text-pt-text-muted font-mono mt-0.5 opacity-50">
                                                TYPE: {job.jobType}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <SeverityChip
                                                severity={job.status === 'FAILED' ? 'danger' : job.status === 'COMPLETED' ? 'success' : 'info'}
                                                label={job.status}
                                            />
                                        </td>
                                        <td className="px-6 py-3 font-mono text-[10px] font-bold text-right">
                                            <span className="text-pt-intent-success">{job.recordsProcessed}</span>
                                            <span className="text-pt-text-muted mx-1 opacity-20">/</span>
                                            <span className="text-pt-intent-danger">{job.recordsFailed}</span>
                                            <span className="text-pt-text-muted mx-1 opacity-20">/</span>
                                            <span className="text-pt-intent-warning font-black">{job.recordsDropped}</span>
                                        </td>
                                        <td className="px-6 py-3 text-[9px] font-bold text-pt-text-muted uppercase">
                                            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-[10px] font-bold text-pt-text-muted">
                                            {job.completedAt && job.startedAt
                                                ? `${Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()))}ms`
                                                : <span className="opacity-10">ACTIVE</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                                {telemetry?.recentJobs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-10">
                                                <Activity size={32} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.5em]">No Runtime Activity</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Operational Outbox Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <Card
                        title="Operational Outbox"
                        pill="SYNC_SERVICE"
                        className="lg:col-span-1"
                    >
                        <div className="space-y-4">
                            {[
                                { key: 'PENDING', label: 'Queued', color: 'text-pt-text-muted', bg: 'bg-pt-bg' },
                                { key: 'SENT', label: 'Delivered', color: 'text-pt-intent-success', bg: 'bg-pt-intent-success/10' },
                                { key: 'FAILED', label: 'Retrying', color: 'text-pt-intent-warning', bg: 'bg-pt-intent-warning/10' },
                                { key: 'DEAD_LETTER', label: 'Dropped', color: 'text-pt-intent-danger', bg: 'bg-pt-intent-danger/10' }
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between p-2 rounded bg-pt-bg-panel/40 border border-pt-border/50">
                                    <span className="text-[10px] font-black uppercase text-pt-text-muted">{item.label}</span>
                                    <span className={`text-xs font-black ${item.color}`}>{outbox?.stats?.[item.key] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card
                        title="Outbox Event Log"
                        pill="WEBHOOK_DISPATCH"
                        className="lg:col-span-3"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-pt-bg text-pt-text-muted text-[8px] font-black uppercase tracking-[0.2em] border-b border-pt-border">
                                        <th className="px-6 py-2">Event</th>
                                        <th className="px-6 py-2">Target</th>
                                        <th className="px-6 py-2">Status</th>
                                        <th className="px-6 py-2 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-pt-border/30">
                                    {outbox?.recent.map((ev: any) => (
                                        <tr key={ev.id} className="text-[10px]">
                                            <td className="px-6 py-2 font-bold text-pt-text uppercase tracking-tight">{ev.aggregateType}:{ev.eventType}</td>
                                            <td className="px-6 py-2 font-mono text-pt-text-muted opacity-60">{ev.targetSystem}</td>
                                            <td className="px-6 py-2">
                                                <div className={`px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase inline-block ${ev.status === 'SENT' ? 'bg-pt-intent-success/10 text-pt-intent-success' :
                                                    ev.status === 'FAILED' ? 'bg-pt-intent-warning/10 text-pt-intent-warning' :
                                                        ev.status === 'DEAD_LETTER' ? 'bg-pt-intent-danger/10 text-pt-intent-danger' :
                                                            'bg-pt-bg text-pt-text-muted'
                                                    }`}>
                                                    {ev.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-2 text-right text-pt-text-muted opacity-50">
                                                {formatDistanceToNow(new Date(ev.createdAt), { addSuffix: true })}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!outbox || outbox.recent.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center opacity-10 text-[10px] uppercase font-black tracking-widest">
                                                No outbound traffic detected
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
