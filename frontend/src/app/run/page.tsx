"use client";

import { useRuntimeStore } from "@/store/runtimeStore";
import { useBuilderStore } from "@/store/builderStore";
import {
    Activity, ShieldAlert, CheckCircle2, AlertTriangle,
    Network, Server, Clock, Search
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

// ─── Main Component ─────────────────────────────────────────
export default function RuntimeDashboard() {
    const { instances, activity } = useRuntimeStore();
    const { entityTypes } = useBuilderStore();

    const stats = useMemo(() => {
        const droneCount = instances.filter(i => i.entityTypeId === 'ent-drone').length;
        const criticalDrones = instances.filter(i => i.entityTypeId === 'ent-drone' && i.properties.status === 'CRITICAL').length;
        const warningDrones = instances.filter(i => i.entityTypeId === 'ent-drone' && i.properties.status === 'WARNING').length;
        const activeMissions = instances.filter(i => i.entityTypeId === 'ent-mission').length;
        const conflictMissions = instances.filter(i => i.entityTypeId === 'ent-mission' && i.properties.status === 'CONFLICT').length;

        return { droneCount, criticalDrones, warningDrones, activeMissions, conflictMissions };
    }, [instances]);

    return (
        <div className="flex-1 overflow-y-auto bg-pt-bg text-pt-text font-mono p-8 custom-scrollbar">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Tactical Header */}
                <div className="flex justify-between items-end border-b border-pt-border pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-pt-intent-primary mb-2">
                            <Activity className="w-5 h-5" />
                            <span className="text-[10px] uppercase font-black tracking-[0.3em]">Operational Command Center</span>
                        </div>
                        <h1 className="text-3xl font-black text-pt-text uppercase tracking-tight">Global Runtime Intelligence</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-pt-bg-panel border border-pt-border rounded shadow-inner">
                            <Search className="w-3.5 h-3.5 text-pt-text-muted" />
                            <span className="text-[10px] font-bold text-pt-text-muted uppercase tracking-widest">
                                Cmd+K <span className="mx-2 opacity-30">|</span> Search Objects
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-pt-intent-success/10 border border-pt-intent-success/20 rounded">
                            <div className="w-2 h-2 rounded-full bg-pt-intent-success animate-pulse" />
                            <span className="text-[9px] font-black text-pt-intent-success uppercase tracking-widest">Nominal Flow</span>
                        </div>
                    </div>
                </div>

                {/* Performance Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: "Active Nodes", val: stats.droneCount, icon: Network, color: "text-pt-intent-primary", bg: "bg-pt-intent-primary/5", sub: `${stats.droneCount - stats.criticalDrones - stats.warningDrones} Online` },
                        { label: "Critical States", val: stats.criticalDrones, icon: ShieldAlert, color: "text-pt-intent-danger", bg: "bg-pt-intent-danger/5", sub: "Immediate Response Required" },
                        { label: "Mission Logic", val: stats.conflictMissions, icon: AlertTriangle, color: "text-pt-intent-warning", bg: "bg-pt-intent-warning/5", sub: `${stats.conflictMissions} Vector Conflicts` },
                        { label: "AI Latency", val: "24ms", icon: Server, color: "text-pt-intent-primary", bg: "bg-pt-bg-panel", sub: "Active Core-9" },
                    ].map((kpi, i) => (
                        <div key={i} className={`border border-pt-border rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-pt-border-hover transition-all ${kpi.bg}`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <kpi.icon className="w-12 h-12" />
                            </div>
                            <h3 className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.2em] mb-1">{kpi.label}</h3>
                            <div className={`text-3xl font-black ${kpi.color}`}>{kpi.val}</div>
                            <div className="mt-4 text-[9px] font-bold text-pt-text-muted uppercase tracking-widest">{kpi.sub}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Object Inspector */}
                    <div className="col-span-2 bg-pt-bg-panel/50 border border-pt-border rounded-xl flex flex-col overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b border-pt-border flex justify-between items-center bg-pt-bg-panel">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-pt-intent-primary shadow-[0_0_8px_rgb(var(--pt-intent-primary)/0.5)]" />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-pt-text">Strategic Entity Monitor</h2>
                            </div>
                            <Link href="/run/entity/ent-drone" className="text-[10px] font-black text-pt-intent-primary hover:text-pt-intent-primary-hover uppercase tracking-[0.1em] transition-colors flex items-center gap-2">
                                Explorer <span className="opacity-50">→</span>
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] whitespace-nowrap">
                                <thead className="bg-pt-bg text-[9px] text-pt-text-muted uppercase tracking-[0.2em] font-black border-b border-pt-border">
                                    <tr>
                                        <th className="px-6 py-3">Vector ID</th>
                                        <th className="px-6 py-3">Class</th>
                                        <th className="px-6 py-3">Health</th>
                                        <th className="px-6 py-3">Payload</th>
                                        <th className="px-6 py-3 text-right">Ops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-pt-border/50">
                                    {instances.map(inst => {
                                        const typeName = entityTypes.find(e => e.id === inst.entityTypeId)?.name || 'Unknown';
                                        const isCritical = inst.properties.status === 'CRITICAL' || inst.properties.status === 'CONFLICT';
                                        const isWarning = inst.properties.status === 'WARNING';
                                        return (
                                            <tr key={inst.id} className="hover:bg-pt-bg transition-colors group">
                                                <td className="px-6 py-4 font-mono font-bold text-pt-intent-primary">{inst.id}</td>
                                                <td className="px-6 py-4 text-pt-text-muted font-bold uppercase">{typeName}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${isCritical ? 'bg-pt-intent-danger/10 text-pt-intent-danger border-pt-intent-danger/30' :
                                                        isWarning ? 'bg-pt-intent-warning/10 text-pt-intent-warning border-pt-intent-warning/30' :
                                                            'bg-pt-intent-success/10 text-pt-intent-success border-pt-intent-success/30'
                                                        }`}>
                                                        {inst.properties.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-pt-text font-mono font-bold">
                                                    {inst.properties.batteryLevel !== undefined ? `${inst.properties.batteryLevel}%` : '---'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/run/entity/${inst.entityTypeId}/${inst.id}`} className="text-[9px] font-black uppercase tracking-widest text-pt-text-muted hover:text-pt-text px-3 py-1.5 border border-pt-border hover:bg-pt-bg-panel rounded transition-all">Inspect</Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="col-span-1 bg-pt-bg-panel border border-pt-border rounded-xl flex flex-col overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b border-pt-border flex justify-between items-center bg-pt-bg-panel">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-pt-text flex items-center gap-3">
                                <Clock className="w-4 h-4 text-pt-intent-primary" />
                                Tactical Logs
                            </h2>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
                            {activity.map((act, idx) => (
                                <div key={act.id} className="relative pl-6">
                                    {idx !== activity.length - 1 && (
                                        <div className="absolute left-[9px] top-6 bottom-[-32px] w-px bg-pt-border" />
                                    )}
                                    <div className={`absolute left-0 top-1.5 w-[18px] h-[18px] rounded-full border-2 border-pt-bg-panel flex items-center justify-center shadow-lg ${act.type === 'ai_triggered' ? 'bg-pt-intent-primary' :
                                        act.type === 'action_executed' ? 'bg-pt-intent-success' :
                                            act.type === 'case_created' ? 'bg-pt-intent-warning' :
                                                'bg-pt-text-muted'
                                        }`}>
                                        <div className="w-1.5 h-1.5 bg-pt-bg-panel rounded-full" />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <div className="text-[9px] text-pt-text-muted font-black tracking-widest uppercase opacity-40">{new Date(act.timestamp).toLocaleTimeString()}</div>
                                        <div className="text-[12px] font-black text-pt-text leading-tight uppercase tracking-tight">{act.title}</div>
                                        <div className="text-[11px] text-pt-text-muted leading-relaxed font-sans opacity-70">{act.description}</div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[8px] font-black text-pt-text-muted uppercase tracking-[0.2em] border-r border-pt-border pr-3">
                                                {act.actor}
                                            </span>
                                            <span className="text-[9px] font-mono font-bold text-pt-intent-primary bg-pt-intent-primary/5 px-2 py-0.5 rounded">
                                                {act.entityInstanceId}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
