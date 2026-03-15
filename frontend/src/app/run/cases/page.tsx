"use client";

import { useRuntimeStore } from "@/store/runtimeStore";
import { Inbox, Filter, Clock, AlertTriangle, ArrowRight, LayoutList, ShieldAlert, Search, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function CasesPage() {
    const { instances } = useRuntimeStore();

    // Mock cases linked to ontology instances (missions in conflict or critical drones)
    const cases = instances
        .filter(i => i.properties.status === 'CONFLICT' || i.properties.status === 'CRITICAL')
        .map(i => ({
            id: `CASE-${i.id.slice(-4).toUpperCase()}`,
            title: i.entityTypeId === 'ent-mission' ? 'Mission Reroute Required' : 'Critical Asset Recovery',
            priority: i.properties.status === 'CRITICAL' ? 'High' : 'Medium',
            status: 'OPEN_INVESTIGATION',
            assignedTo: 'FleetOps Team',
            boundEntity: i.id,
            entityType: i.entityTypeId,
            created: new Date().toISOString()
        }));

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-pt-bg text-pt-text font-mono p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto w-full space-y-8">

                {/* Tactical Header */}
                <div className="flex justify-between items-end border-b border-pt-border pb-8">
                    <div>
                        <div className="flex items-center gap-3 text-pt-intent-danger mb-3">
                            <ShieldAlert className="w-5 h-5 animate-pulse" />
                            <span className="text-[10px] uppercase font-black tracking-[0.4em]">Operations Intelligence</span>
                        </div>
                        <h1 className="text-4xl font-black text-pt-text uppercase tracking-tighter">Active Cases</h1>
                        <p className="text-[11px] text-pt-text-muted font-bold tracking-[0.2em] mt-2 opacity-60 uppercase">
                            Object-centric investigation and remediation protocols.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="h-10 px-6 bg-pt-bg-panel border border-pt-border rounded-lg text-[10px] font-black uppercase tracking-widest text-pt-text-muted hover:text-pt-text transition-all flex items-center gap-2.5 shadow-xl active:scale-95 leading-none">
                            <Filter size={14} /> Filter Grid
                        </button>
                    </div>
                </div>

                <div className="bg-pt-bg-panel border border-pt-border rounded-xl flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-pt-border bg-pt-bg-panel/50 flex justify-between items-center">
                        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-pt-text">
                            <LayoutList className="w-4 h-4 text-pt-intent-primary" />
                            Active Queue
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pt-text-muted group-focus-within:text-pt-intent-primary transition-colors" />
                            <input
                                placeholder="IDENTIFIER SEARCH…"
                                className="bg-pt-bg border border-pt-border rounded-lg pl-10 pr-4 py-1.5 text-[10px] font-black tracking-widest text-pt-text focus:outline-none focus:border-pt-intent-primary transition-all placeholder:opacity-20 w-48"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-pt-bg text-[9px] text-pt-text-muted uppercase tracking-[0.2em] font-black border-b border-pt-border">
                                <tr>
                                    <th className="px-6 py-4">Case Registry ID</th>
                                    <th className="px-6 py-4">Protocol Title</th>
                                    <th className="px-6 py-4">Threat Level</th>
                                    <th className="px-6 py-4">Target Vector</th>
                                    <th className="px-6 py-4 text-right">Operational Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pt-border/30">
                                {cases.map(c => (
                                    <tr key={c.id} className="hover:bg-pt-bg transition-colors group">
                                        <td className="px-6 py-5 font-mono text-pt-text-muted text-[10px] font-bold">{c.id}</td>
                                        <td className="px-6 py-5">
                                            <div className="text-pt-text font-black text-[12px] uppercase tracking-tight">{c.title}</div>
                                            <div className="text-[8px] text-pt-text-muted font-black tracking-widest mt-1 opacity-50 uppercase">{c.status}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border transition-all ${c.priority === 'High' ? 'bg-pt-intent-danger/10 text-pt-intent-danger border-pt-intent-danger/30' : 'bg-pt-intent-warning/10 text-pt-intent-warning border-pt-intent-warning/30'}`}>
                                                {c.priority}_PRIORITY
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Link href={`/run/entity/${c.entityType}/${c.boundEntity}`} className="font-mono text-[10px] font-black text-pt-intent-primary hover:brightness-110 flex items-center gap-2 group/link">
                                                {c.boundEntity}
                                                <ChevronRight size={10} className="group-hover/link:translate-x-1 transition-transform" />
                                            </Link>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Link href={`/run/entity/${c.entityType}/${c.boundEntity}`}
                                                className="h-8 px-4 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-pt-bg-panel border border-pt-border rounded-lg text-pt-text hover:text-pt-bg hover:bg-pt-intent-primary hover:border-pt-intent-primary transition-all active:scale-95 group-hover:shadow-[0_0_15px_rgba(var(--pt-intent-primary),0.3)]">
                                                Intervene <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {cases.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <Inbox size={32} />
                                                <span className="text-[11px] font-black uppercase tracking-[0.5em]">Lattice Nominal — No Active Disruptions</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom Status Ticker */}
                <div className="flex items-center justify-between px-6 py-4 bg-pt-bg-panel border border-pt-border rounded-xl">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-pt-intent-success animate-pulse" />
                            <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest">Workflow Engine Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest opacity-40">Load: 0.04 ms</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
