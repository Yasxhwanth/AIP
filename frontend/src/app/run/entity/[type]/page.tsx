"use client";

import { use } from "react";
import { useBuilderStore } from "@/store/builderStore";
import { useRuntimeStore } from "@/store/runtimeStore";
import { Search, Database, ArrowRight, LayoutList } from "lucide-react";
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
        <div className="flex-1 overflow-y-auto bg-[#060A12] text-slate-300 font-sans p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header Generated from Ontology */}
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Database className="w-5 h-5" />
                            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Ontology Object</span>
                        </div>
                        <h1 className="text-3xl font-black text-white capitalize">{entityType.name} Repository</h1>
                        <p className="text-sm text-slate-500 mt-1">{entityType.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input placeholder={`Search ${entityType.name}s...`}
                                className="w-64 pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm outline-none focus:border-blue-500/50 transition-colors text-white" />
                        </div>
                    </div>
                </div>

                {/* Auto-generated Table Based on schema */}
                <div className="bg-[#0B1220] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-white/5 bg-black/20 flex gap-2 items-center text-xs font-bold text-slate-400">
                        <LayoutList className="w-4 h-4" /> System-Generated List View
                    </div>

                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white/5 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-3">Object ID</th>
                                    {entityType.properties.map(p => (
                                        <th key={p.id} className="px-6 py-3">{p.name}</th>
                                    ))}
                                    {entityType.metrics.map(m => (
                                        <th key={m.id} className="px-6 py-3 text-emerald-500/80">{m.name}</th>
                                    ))}
                                    <th className="px-6 py-3 text-right">Inspect</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentInstances.map(inst => (
                                    <tr key={inst.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-blue-300 text-xs">{inst.id}</td>

                                        {entityType.properties.map(p => {
                                            const val = inst.properties[p.name];
                                            return (
                                                <td key={p.id} className="px-6 py-4">
                                                    {val === 'CRITICAL' ? <span className="text-red-400 font-bold px-2 py-1 bg-red-500/10 rounded border border-red-500/20 text-[10px] uppercase">{val}</span> :
                                                        val === 'WARNING' ? <span className="text-amber-400 font-bold px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20 text-[10px] uppercase">{val}</span> :
                                                            val === 'ACTIVE' ? <span className="text-emerald-400 font-bold px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20 text-[10px] uppercase">{val}</span> :
                                                                val !== undefined ? String(val) : '-'}
                                                </td>
                                            );
                                        })}

                                        {entityType.metrics.map(m => (
                                            <td key={m.id} className="px-6 py-4 text-emerald-400 font-mono text-xs font-bold">
                                                {inst.metrics[m.name] !== undefined ? `${inst.metrics[m.name]} ${m.unit}` : '-'}
                                            </td>
                                        ))}

                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/run/entity/${type}/${inst.id}`}
                                                className="inline-flex flex-row items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                                Open <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {currentInstances.length === 0 && (
                                    <tr>
                                        <td colSpan={entityType.properties.length + entityType.metrics.length + 2} className="px-6 py-12 text-center text-slate-500 font-sans">
                                            No {entityType.name} records exist in the operational environment.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
