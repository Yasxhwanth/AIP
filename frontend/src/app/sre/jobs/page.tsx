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

interface Telemetry {
    summary: Record<string, number>;
    activeWorkers: number;
    recentJobs: Job[];
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SREJobsPage() {
    const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { setContext } = useIntelligenceStore();

    const fetchTelemetry = async () => {
        try {
            const data = await ApiClient.get<Telemetry>('/api/v1/telemetry/jobs');
            setTelemetry(data);
            setError(null);

            // Sync context with AI Assistant
            setContext('sre', {
                jobId: data.recentJobs[0]?.id,
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

                {/* Execution Timeline Matrix */}
                <Card
                    title="Global Execution Matrix"
                    pill={`ACTIVE_JOBS: ${telemetry?.summary['RUNNING'] || 0}`}
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
            </main>
        </div>
    );
}
