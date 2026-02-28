"use client";

import { useRuntimeStore } from "@/store/runtimeStore";
import { Inbox, Filter, Clock, AlertTriangle, ArrowRight, LayoutList } from "lucide-react";
import Link from "next/link";

export default function CasesPage() {
    const { instances } = useRuntimeStore();

    // Mock cases linked to ontology instances (missions in conflict or critical drones)
    const cases = instances
        .filter(i => i.properties.status === 'CONFLICT' || i.properties.status === 'CRITICAL')
        .map(i => ({
            id: `case-${i.id.slice(-4)}`,
            title: i.entityTypeId === 'ent-mission' ? 'Mission Reroute Required' : 'Critical Asset Recovery',
            priority: i.properties.status === 'CRITICAL' ? 'High' : 'Medium',
            status: 'Open',
            assignedTo: 'FleetOps Team',
            boundEntity: i.id,
            entityType: i.entityTypeId,
            created: new Date().toISOString()
        }));

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[#060A12] text-slate-300 font-sans p-8">
            <div className="max-w-6xl mx-auto w-full space-y-6">

                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Inbox className="w-5 h-5" />
                            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Operations Center</span>
                        </div>
                        <h1 className="text-3xl font-black text-white capitalize">Active Cases</h1>
                        <p className="text-sm text-slate-500 mt-1">Object-centric investigation and remediation workflows.</p>
                    </div>
                </div>

                <div className="bg-[#0B1220] border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center text-xs font-bold text-slate-400">
                        <div className="flex items-center gap-2"><LayoutList className="w-4 h-4" /> Open Investigations</div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors text-white"><Filter className="w-3.5 h-3.5" /> Filter</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white/5 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-3">Case ID</th>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Priority</th>
                                    <th className="px-6 py-3">Bound Object</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cases.map(c => (
                                    <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-slate-500 text-xs">{c.id}</td>
                                        <td className="px-6 py-4 text-slate-200 font-bold">{c.title}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                                {c.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/run/entity/${c.entityType}/${c.boundEntity}`} className="font-mono text-xs text-blue-400 hover:underline">
                                                {c.boundEntity}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/run/entity/${c.entityType}/${c.boundEntity}`}
                                                className="inline-flex flex-row items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors group-hover:bg-blue-600 group-hover:text-white">
                                                Resolve <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {cases.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-sans text-sm">
                                            No active cases. System is operating nominally.
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
