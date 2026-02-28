"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore } from "@/store/builderStore";
import { useRuntimeStore } from "@/store/runtimeStore";
import { Search, Database, Command, Activity, Zap } from "lucide-react";

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const router = useRouter();

    const { entityTypes, actions, agents } = useBuilderStore();
    const { instances } = useRuntimeStore();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    if (!isOpen) return null;

    const query = search.toLowerCase();

    // Global Search Logic over the Ontology Graph
    const matchedTypes = entityTypes.filter(e => e.name.toLowerCase().includes(query));
    const matchedInstances = instances.filter(i =>
        i.id.toLowerCase().includes(query) ||
        Object.values(i.properties).some(v => String(v).toLowerCase().includes(query))
    );
    const matchedActions = actions.filter(a => a.name.toLowerCase().includes(query));

    const handleSelect = (path: string) => {
        setIsOpen(false);
        setSearch("");
        router.push(path);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center p-4 pt-32 animate-in fade-in duration-200 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}>
            <div className="bg-[#0B1220] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[60vh] ring-1 ring-blue-500/30"
                onClick={e => e.stopPropagation()}>

                <div className="flex items-center px-4 py-4 border-b border-white/10 bg-[#060D19]">
                    <Search className="w-5 h-5 text-blue-400 mr-3" />
                    <input
                        autoFocus
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search ontology types, objects, actions, or AI agents..."
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-slate-500"
                    />
                    <div className="text-[10px] font-mono text-slate-500 px-2 py-1 bg-white/5 rounded">ESC to close</div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {search.trim() === "" ? (
                        <div className="p-12 text-center text-sm text-slate-500 font-sans flex flex-col items-center gap-3">
                            <Command className="w-8 h-8 opacity-20" />
                            Type to perform global semantic search across your Operational Ontology.
                        </div>
                    ) : (
                        <div className="space-y-4 p-2">

                            {matchedInstances.length > 0 && (
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Live Ontology Objects</div>
                                    {matchedInstances.slice(0, 5).map(inst => (
                                        <div key={inst.id} onClick={() => handleSelect(`/run/entity/${inst.entityTypeId}/${inst.id}`)}
                                            className="px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer flex justify-between items-center transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <Activity className="w-4 h-4 text-emerald-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                                                <span className="text-sm font-bold text-slate-300 font-mono group-hover:text-white">{inst.id}</span>
                                                <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded capitalize">
                                                    {entityTypes.find(e => e.id === inst.entityTypeId)?.name || 'Unknown'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-600 group-hover:text-blue-400 transition-colors">Jump to Inspect ⏎</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {matchedTypes.length > 0 && (
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Entity Types Schema</div>
                                    {matchedTypes.map(type => (
                                        <div key={type.id} onClick={() => handleSelect(`/build/ontology`)} // Can directly jump to builder
                                            className="px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer flex justify-between items-center transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <Database className="w-4 h-4 text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                                                <span className="text-sm font-bold text-slate-300 group-hover:text-white capitalize">{type.name}</span>
                                            </div>
                                            <span className="text-xs text-slate-600 group-hover:text-blue-400 transition-colors">Edit Schema ⏎</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {matchedActions.length > 0 && (
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Operational Actions</div>
                                    {matchedActions.map(act => (
                                        <div key={act.id} onClick={() => handleSelect(`/build/actions`)}
                                            className="px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer flex justify-between items-center transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-4 h-4 text-amber-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                                                <span className="text-sm font-bold text-slate-300 group-hover:text-white">{act.name}</span>
                                            </div>
                                            <span className="text-xs text-slate-600 group-hover:text-blue-400 transition-colors">Configure Action ⏎</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {matchedInstances.length === 0 && matchedTypes.length === 0 && matchedActions.length === 0 && (
                                <div className="p-8 text-center text-sm text-slate-500">
                                    No objects, schemas, or actions match "{search}".
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
