"use client";

import { useRuntimeStore } from "@/store/runtimeStore";
import { useBuilderStore } from "@/store/builderStore";
import {
    Activity, ShieldAlert, CheckCircle2, AlertTriangle,
    Network, Server, Clock, Search
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

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
        <div className="flex-1 overflow-y-auto bg-[#060A12] text-slate-300 font-sans p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Activity className="w-5 h-5" />
                            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Operational Dashboard</span>
                        </div>
                        <h1 className="text-3xl font-black text-white">Global Command Overview</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-500">
                            <Search className="w-3.5 h-3.5" />
                            <span>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">⌘K</kbd> to search ontology</span>
                        </div>
                    </div>
                </div>

                {/* Pre-Aggregated KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#0B1220] border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Network className="w-16 h-16" /></div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Active Drones</h3>
                        <div className="text-3xl font-black text-white">{stats.droneCount}</div>
                        <div className="mt-4 flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" /> {stats.droneCount - stats.criticalDrones - stats.warningDrones} Nominal</span>
                        </div>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert className="w-16 h-16 text-red-500" /></div>
                        <h3 className="text-xs font-bold text-red-400/80 uppercase tracking-widest mb-1">Critical Exceptions</h3>
                        <div className="text-3xl font-black text-red-400">{stats.criticalDrones}</div>
                        <div className="mt-4 flex items-center gap-2 text-xs">
                            <span className="text-red-300 font-bold max-w-[80%] truncate">Action Required: DRN-ALPHA-01</span>
                        </div>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle className="w-16 h-16 text-amber-500" /></div>
                        <h3 className="text-xs font-bold text-amber-400/80 uppercase tracking-widest mb-1">Mission Conflicts</h3>
                        <div className="text-3xl font-black text-amber-400">{stats.conflictMissions}</div>
                        <div className="mt-4 flex items-center gap-2 text-xs">
                            <span className="text-amber-300 font-bold max-w-[80%] truncate">Rerouting required</span>
                        </div>
                    </div>

                    <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Server className="w-16 h-16 text-blue-500" /></div>
                        <h3 className="text-xs font-bold text-blue-400/80 uppercase tracking-widest mb-1">AI Agent Status</h3>
                        <div className="text-xl font-black text-blue-400 mt-2">Active & Monitoring</div>
                        <div className="mt-3 flex items-center gap-2 text-xs">
                            <span className="text-blue-300 font-bold">120 queries today</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Live Entities List (Mocking a List View generated page) */}
                    <div className="col-span-2 bg-[#0B1220] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <h2 className="text-sm font-bold text-white">Critical Entity State Tracker</h2>
                            <Link href="/run/entity/ent-drone" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">View All Drones →</Link>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-white/5 text-xs text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Entity ID</th>
                                        <th className="px-6 py-3 font-medium">Type</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium">Telemetry (Battery)</th>
                                        <th className="px-6 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {instances.map(inst => {
                                        const typeName = entityTypes.find(e => e.id === inst.entityTypeId)?.name || 'Unknown';
                                        const isCritical = inst.properties.status === 'CRITICAL' || inst.properties.status === 'CONFLICT';
                                        const isWarning = inst.properties.status === 'WARNING';
                                        return (
                                            <tr key={inst.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-mono text-blue-300">{inst.id}</td>
                                                <td className="px-6 py-4 text-slate-300">{typeName}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isCritical ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                            isWarning ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        }`}>
                                                        {inst.properties.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400">
                                                    {inst.properties.batteryLevel !== undefined ? `${inst.properties.batteryLevel}%` : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/run/entity/${inst.entityTypeId}/${inst.id}`} className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors">Inspect</Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Live Activity Feed */}
                    <div className="col-span-1 bg-[#0B1220] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> Live Activity Feed</h2>
                        </div>
                        <div className="p-5 overflow-y-auto space-y-6">
                            {activity.map((act, idx) => (
                                <div key={act.id} className="relative pl-6">
                                    {/* Timeline line */}
                                    {idx !== activity.length - 1 && (
                                        <div className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-white/10" />
                                    )}
                                    {/* Timeline dot */}
                                    <div className={`absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-[#0B1220] ${act.type === 'ai_triggered' ? 'bg-blue-500' :
                                            act.type === 'action_executed' ? 'bg-emerald-500' :
                                                act.type === 'case_created' ? 'bg-amber-500' :
                                                    'bg-slate-600'
                                        }`}>
                                        <div className="w-1.5 h-1.5 bg-[#0B1220] rounded-full" />
                                    </div>

                                    <div className="text-[10px] text-slate-500 font-mono mb-1">{new Date(act.timestamp).toLocaleTimeString()}</div>
                                    <div className="text-sm font-bold text-slate-200 mb-0.5 leading-tight">{act.title}</div>
                                    <div className="text-xs text-slate-400 mb-2 leading-relaxed">{act.description}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-slate-500 font-bold uppercase tracking-wider">
                                            {act.actor}
                                        </span>
                                        <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-mono border border-blue-500/20">
                                            {act.entityInstanceId}
                                        </span>
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
