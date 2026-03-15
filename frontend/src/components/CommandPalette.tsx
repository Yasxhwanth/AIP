
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore } from "@/store/builderStore";
import { useRuntimeStore } from "@/store/runtimeStore";
import { Search, Database, Command, Activity, Zap, Shield, Workflow, Box } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const router = useRouter();

    const { entityTypes, actions } = useBuilderStore();
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
        <div className="fixed inset-0 bg-pt-bg/90 z-[100] flex justify-center p-4 pt-32 animate-in fade-in duration-200 backdrop-blur-md"
            onClick={() => setIsOpen(false)}>
            <div className="bg-pt-bg-panel w-full max-w-xl rounded-sm shadow-2xl overflow-hidden border border-pt-border flex flex-col max-h-[60vh] ring-1 ring-pt-intent-primary/20"
                onClick={e => e.stopPropagation()}>

                <div className="flex items-center px-4 h-12 border-b border-pt-border bg-pt-bg/50">
                    <Search className="w-4 h-4 text-pt-intent-primary mr-3" />
                    <input
                        autoFocus
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="SEARCH ONTOLOGY REGISTRY, MISSION ASSETS, OR ACTIONS…"
                        className="flex-1 bg-transparent border-none outline-none text-pt-text text-[11px] font-bold uppercase tracking-widest placeholder:text-pt-text-muted/30"
                    />
                    <div className="flex items-center gap-2">
                        <div className="text-[9px] font-black text-pt-text-muted px-2 py-1 bg-pt-bg-hover rounded-sm border border-pt-border">ESC</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {search.trim() === "" ? (
                        <div className="p-12 text-center flex flex-col items-center gap-4">
                            <div className="p-4 bg-pt-intent-primary/5 rounded-full">
                                <Command className="w-8 h-8 text-pt-intent-primary opacity-40" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pt-text">Strategic Dispatch</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-pt-text-muted opacity-50">Global Operational Search Link Active</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-1">
                            {matchedInstances.length > 0 && (
                                <div className="mb-2">
                                    <div className="text-[9px] font-black text-pt-intent-success uppercase tracking-[0.2em] px-3 py-2">Mission Assets</div>
                                    {matchedInstances.slice(0, 5).map(inst => (
                                        <div key={inst.id} onClick={() => handleSelect(`/run/entity/${inst.entityTypeId}/${inst.id}`)}
                                            className="px-3 py-2 hover:bg-pt-bg-hover cursor-pointer flex justify-between items-center group transition-all border-l-2 border-l-transparent hover:border-l-pt-intent-success">
                                            <div className="flex items-center gap-3">
                                                <Activity className="w-3 h-3 text-pt-intent-success opacity-40 group-hover:opacity-100" />
                                                <span className="text-[11px] font-mono font-bold text-pt-text">{inst.id}</span>
                                                <span className="text-[9px] text-pt-text-muted bg-pt-bg px-1.5 py-0.5 rounded-sm border border-pt-border font-black uppercase tracking-widest">
                                                    {entityTypes.find(e => e.id === inst.entityTypeId)?.name || 'OBJECT'}
                                                </span>
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted opacity-0 group-hover:opacity-100 transition-opacity">Inspect ⏎</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {matchedTypes.length > 0 && (
                                <div className="mb-2">
                                    <div className="text-[9px] font-black text-pt-intent-primary uppercase tracking-[0.2em] px-3 py-2">Ontology Definitions</div>
                                    {matchedTypes.map(type => (
                                        <div key={type.id} onClick={() => handleSelect(`/ontology`)}
                                            className="px-3 py-2 hover:bg-pt-bg-hover cursor-pointer flex justify-between items-center group transition-all border-l-2 border-l-transparent hover:border-l-pt-intent-primary">
                                            <div className="flex items-center gap-3">
                                                <Database className="w-3 h-3 text-pt-intent-primary opacity-40 group-hover:opacity-100" />
                                                <span className="text-[11px] font-bold text-pt-text uppercase tracking-tight">{type.name}</span>
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted opacity-0 group-hover:opacity-100 transition-opacity">Edit Schema ⏎</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {matchedActions.length > 0 && (
                                <div className="mb-2">
                                    <div className="text-[9px] font-black text-pt-intent-warning uppercase tracking-[0.2em] px-3 py-2">Operational Logic</div>
                                    {matchedActions.map(act => (
                                        <div key={act.id} onClick={() => handleSelect(`/integrations`)}
                                            className="px-3 py-2 hover:bg-pt-bg-hover cursor-pointer flex justify-between items-center group transition-all border-l-2 border-l-transparent hover:border-l-pt-intent-warning">
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-3 h-3 text-pt-intent-warning opacity-40 group-hover:opacity-100" />
                                                <span className="text-[11px] font-bold text-pt-text uppercase tracking-tight">{act.name}</span>
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted opacity-0 group-hover:opacity-100 transition-opacity">Review Action ⏎</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {matchedInstances.length === 0 && matchedTypes.length === 0 && matchedActions.length === 0 && (
                                <div className="p-8 text-center text-[10px] uppercase font-black tracking-widest text-pt-text-muted/40">
                                    Mission context not found for: <span className="text-pt-text/60 italic">"{search}"</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <footer className="h-8 border-t border-pt-border bg-pt-bg/30 px-4 flex items-center justify-between">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 grayscale">
                            <Box size={10} className="text-pt-text-muted" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted">G+O Ontology</span>
                        </div>
                        <div className="flex items-center gap-1.5 grayscale">
                            <Workflow size={10} className="text-pt-text-muted" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted">G+I Integrations</span>
                        </div>
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted opacity-30">
                        AIP-CORE v9.4
                    </div>
                </footer>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(16, 107, 163, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(16, 107, 163, 0.4);
                }
            `}</style>
        </div>
    );
}
