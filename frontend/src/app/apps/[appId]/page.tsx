"use client";

import { use } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { notFound, useRouter } from "next/navigation";
import {
    LayoutTemplate, ArrowLeft, Database,
    Activity, List, MousePointer2, Type, Zap
} from "lucide-react";
import Link from "next/link";
import { useRuntimeStore } from "@/store/runtimeStore";

export default function LiveApplication({ params }: { params: Promise<{ appId: string }> }) {
    const { appId } = use(params);
    const { resources } = useWorkspaceStore();
    const { instances, executeAction } = useRuntimeStore(); // Hooking into the actual Runtime data
    const router = useRouter();

    // The appId is essentially the Workshop Module Resource ID in this local architecture
    const resource = resources.find(r => r.id === appId && r.type === 'workshop');
    if (!resource || !resource.definition || !resource.definition.layout) return notFound();

    const layout = resource.definition.layout as any[];

    // --- Runtime Execution Handlers ---
    const handleActionClick = (actionId: string) => {
        if (!actionId) return;
        // In a real app, this would open a payload modal or fire directly to the Action Engine
        alert(`Dispatched Action: ${actionId} to Ontology Runtime.`);
        // executeAction(actionId, "mock-instance", {}); 
    };

    // --- Recursive Runtime Renderer ---
    const renderWidget = (w: any) => {
        switch (w.type) {
            case 'Section':
                return (
                    <div key={w.id} className="w-full flex flex-col gap-6">
                        {w.children ? w.children.map(renderWidget) : null}
                    </div>
                );
            case 'Text':
                return (
                    <div key={w.id} className={`${w.properties.variant === 'h1' ? 'text-4xl font-black text-white' : 'text-base text-slate-300'} font-sans`}>
                        {w.properties.content}
                    </div>
                );
            case 'MetricCard':
                return (
                    <div key={w.id} className="bg-[#0B1220] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-32 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors" />
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">
                            <Activity className="w-4 h-4 text-emerald-400" /> {w.name}
                        </div>
                        <div className="text-4xl font-black text-white font-mono relative z-10">
                            {w.properties.value || '0'}
                        </div>
                    </div>
                );
            case 'ObjectTable':
                // In Runtime, we would parse the Bound Variable and fetch actual instances.
                // For this demo, if boundVariable contains 'drone', we fetch drones.
                const boundVar = (w.properties.boundVariable || '').toLowerCase();
                const isDrone = boundVar.includes('drone');
                const tableData = isDrone ? instances.filter(i => i.entityTypeId === 'ent-drone') : instances.slice(0, 5);

                return (
                    <div key={w.id} className="bg-[#0B1220] border border-white/5 rounded-2xl overflow-hidden shadow-xl mt-4">
                        <div className="px-6 py-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
                                <Database className="w-4 h-4 text-blue-400" /> {w.name}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase">
                                Bound: {w.properties.boundVariable || 'Unbound'}
                            </span>
                        </div>
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-white/2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                    <tr>
                                        <th className="px-6 py-3">Identifier</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map(i => (
                                        <tr key={i.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push(`/run/entity/${i.entityTypeId}/${i.id}`)}>
                                            <td className="px-6 py-4 font-mono font-bold text-blue-400">{i.id}</td>
                                            <td className="px-6 py-4 text-slate-400 capitalize bg-white/5 px-2 py-0.5 rounded inline-block mt-2 ml-4 text-[10px]">{i.entityTypeId.replace('ent-', '')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${i.properties.status === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                    {i.properties.status || 'Active'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {tableData.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-slate-500 italic text-xs">No records available in the Ontology.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'ActionButton':
                return (
                    <button key={w.id} onClick={() => handleActionClick(w.properties.actionId)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 group mt-4 w-fit">
                        <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" /> {w.properties.label || 'Execute Action'}
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#060A12] text-slate-300 font-sans flex flex-col">

            {/* Live App Navigation Bar (Isolated from Builder) */}
            <div className="h-14 border-b border-white/5 bg-[#03060C] flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Link href={`/projects`} className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg">
                        <LayoutTemplate className="w-4 h-4" />
                    </Link>
                    <div className="h-4 w-px bg-white/10" />
                    <span className="font-black text-white tracking-widest uppercase text-sm">{resource.name}</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Deployment
                    </div>
                    {/* Escape hatch back to Workshop Editor */}
                    <Link href={`/workspace/${resource.projectId}/workshop/${appId}`} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-bold transition-colors border border-white/5">
                        Open in Builder
                    </Link>
                </div>
            </div>

            {/* The Live Rendered Application Area */}
            <div className="flex-1 overflow-y-auto w-full relative">
                <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

                <div className="max-w-6xl mx-auto py-12 px-6 relative z-10 w-full flex flex-col gap-6">
                    {layout.map(renderWidget)}

                    {layout.length === 0 && (
                        <div className="mt-32 p-16 border border-white/5 bg-[#0B1220] rounded-3xl shadow-xl flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                            <LayoutTemplate className="w-16 h-16 text-slate-600 mb-6" />
                            <h2 className="text-2xl font-black text-white mb-2">Blank Deployment</h2>
                            <p className="text-sm text-slate-400 font-sans leading-relaxed">
                                This Workshop Module is currently unconfigured. Return to the Builder via the top-right menu to map UI widgets to Ontology Variables.
                            </p>
                            <Link href={`/workspace/${resource.projectId}/workshop/${appId}`} className="mt-8 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Edit in Builder
                            </Link>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
