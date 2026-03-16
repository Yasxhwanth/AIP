"use client";

import { use } from "react";
import { useBuilderStore } from "@/store/builderStore";
import { useRuntimeStore } from "@/store/runtimeStore";
import { Search, Database, ArrowRight, LayoutList, Fingerprint, Activity, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function EntityListView({ params }: { params: Promise<{ type: string }> }) {
    const { type } = use(params);
    const { entityTypes } = useBuilderStore();
    const { instances } = useRuntimeStore();

    const entityType = entityTypes.find(e => e.id === type);
    if (!entityType) return notFound();

    const currentInstances = instances.filter(i => i.entityTypeId === type);

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-pt-bg text-pt-text font-mono p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full space-y-10">

                {/* Header Generated from Ontology */}
                <div className="flex justify-between items-end border-b border-pt-border pb-8">
                    <div>
                        <div className="flex items-center gap-3 text-pt-intent-primary mb-3">
                            <Fingerprint className="w-5 h-5 animate-pulse" />
                            <span className="text-[10px] uppercase font-black tracking-[0.4em]">Ontology Registry View</span>
                        </div>
                        <h1 className="text-4xl font-black text-pt-text uppercase tracking-tighter">{entityType.name} Repository</h1>
                        <p className="text-[11px] text-pt-text-muted font-bold tracking-[0.2em] mt-2 opacity-60 uppercase">{entityType.description}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-pt-text-muted group-focus-within:text-pt-intent-primary transition-colors" />
                            <input
                                placeholder={`PROBE ${entityType.name.toUpperCase()} REGISTRY…`}
                                className="w-80 pl-10 pr-4 py-2 bg-pt-bg border border-pt-border rounded-lg text-[10px] font-black uppercase tracking-widest outline-none focus:border-pt-intent-primary transition-all text-pt-text placeholder:opacity-20 shadow-inner"
                            />
                        </div>
                    </div>
                </div>

                {/* Auto-generated Matrix Based on Schema */}
                <div className="bg-pt-bg-panel border border-pt-border rounded-xl flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-pt-border bg-pt-bg-panel/50 flex justify-between items-center">
                        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-pt-text">
                            <LayoutList className="w-4 h-4 text-pt-intent-primary" />
                            Lattice-Synchronized Records
                        </div>
                        <div className="flex items-center gap-4 px-4 py-1.5 bg-pt-bg border border-pt-border rounded-lg shadow-inner">
                            <span className="text-[9px] font-black text-pt-text-muted uppercase tracking-widest opacity-40">Active Nodes:</span>
                            <span className="text-[11px] font-black text-pt-intent-primary">{currentInstances.length}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto w-full custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-pt-bg text-[9px] text-pt-text-muted uppercase tracking-[0.2em] font-black border-b border-pt-border">
                                <tr>
                                    <th className="px-6 py-4">Node Identifier</th>
                                    {entityType.properties.map(p => (
                                        <th key={p.id} className="px-6 py-4">{p.name}</th>
                                    ))}
                                    {entityType.metrics.map(m => (
                                        <th key={m.id} className="px-6 py-4 text-pt-intent-success/80">Σ {m.name}</th>
                                    ))}
                                    <th className="px-6 py-4 text-right">Deep Trace</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pt-border/30">
                                {currentInstances.map(inst => (
                                    <tr key={inst.id} className="hover:bg-pt-bg transition-colors group">
                                        <td className="px-6 py-5 font-mono text-pt-intent-primary text-[10px] font-black flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-pt-border group-hover:bg-pt-intent-primary shadow-[0_0_8px_rgb(var(--pt-intent-primary) / 0.2)] transition-all" />
                                            {inst.id}
                                        </td>

                                        {entityType.properties.map(p => {
                                            const val = inst.properties[p.name];
                                            const s =
                                                val === 'CRITICAL' ? 'bg-pt-intent-danger/10 text-pt-intent-danger border-pt-intent-danger/30' :
                                                    val === 'WARNING' || val === 'CONFLICT' ? 'bg-pt-intent-warning/10 text-pt-intent-warning border-pt-intent-warning/30' :
                                                        val === 'ACTIVE' || val === 'NOMINAL' ? 'bg-pt-intent-success/10 text-pt-intent-success border-pt-intent-success/30' :
                                                            'bg-pt-bg border-pt-border text-pt-text-muted';

                                            return (
                                                <td key={p.id} className="px-6 py-5">
                                                    {['CRITICAL', 'WARNING', 'CONFLICT', 'ACTIVE', 'NOMINAL'].includes(String(val)) ? (
                                                        <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${s}`}>
                                                            {val}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] font-black text-pt-text opacity-80 uppercase tracking-tight">
                                                            {val !== undefined ? String(val) : '-'}
                                                        </span>
                                                    )}
                                                </td>
                                            );
                                        })}

                                        {entityType.metrics.map(m => (
                                            <td key={m.id} className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Activity size={10} className="text-pt-intent-success opacity-40" />
                                                    <span className="text-[11px] font-black text-pt-intent-success font-mono">
                                                        {inst.metrics[m.name] !== undefined ? `${inst.metrics[m.name]} ${m.unit}` : '-'}
                                                    </span>
                                                </div>
                                            </td>
                                        ))}

                                        <td className="px-6 py-5 text-right">
                                            <Link href={`/run/entity/${type}/${inst.id}`}
                                                className="h-8 px-4 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-pt-bg-panel border border-pt-border rounded-lg text-pt-text hover:text-pt-bg hover:bg-pt-intent-primary hover:border-pt-intent-primary transition-all active:scale-95 group-hover:shadow-[0_0_15px_rgb(var(--pt-intent-primary) / 0.3)]">
                                                Analyze <ArrowRight size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {currentInstances.length === 0 && (
                                    <tr>
                                        <td colSpan={entityType.properties.length + entityType.metrics.length + 2} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <Database size={40} />
                                                <span className="text-[11px] font-black uppercase tracking-[0.5em]">No System Telemetry for {entityType.name}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bottom Status Ticker */}
                <div className="flex items-center justify-between px-8 py-5 bg-pt-bg-panel border border-pt-border rounded-xl shadow-xl">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <Clock size={14} className="text-pt-intent-primary opacity-40" />
                            <span className="text-[10px] font-black text-pt-text uppercase tracking-widest">Protocol L-Sync: {new Date().toLocaleTimeString()}</span>
                        </div>
                        <div className="h-4 w-px bg-pt-border" />
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest opacity-40">RBAC Integrity Status:</span>
                            <span className="text-[10px] font-black text-pt-intent-success uppercase tracking-widest">Verified</span>
                        </div>
                    </div>
                    <Link href="/build/ontology" className="flex items-center gap-2 text-[9px] font-black text-pt-intent-primary uppercase tracking-widest hover:brightness-110 transition-all">
                        Modify Schema <ChevronRight size={12} />
                    </Link>
                </div>

            </div>
        </div>
    );
}
