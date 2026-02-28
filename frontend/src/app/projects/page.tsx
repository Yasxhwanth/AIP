"use client";

import { useWorkspaceStore } from "@/store/workspaceStore";
import { FolderGit2, Plus, Clock, ArrowRight, Database, Command } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProjectsLobby() {
    const { projects, createProject } = useWorkspaceStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        createProject(newName, newDesc);
        setIsCreating(false);
        setNewName("");
        setNewDesc("");
    };

    return (
        <div className="flex-1 min-h-screen bg-[#060A12] text-slate-300 font-sans flex flex-col items-center justify-center p-8 relative overflow-hidden">

            {/* Background elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full point-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/5 blur-[120px] rounded-full point-events-none" />

            {/* Top Bar for Lobby */}
            <div className="absolute top-0 left-0 right-0 h-14 border-b border-white/5 bg-[#0B1220]/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <span className="font-black text-white tracking-widest uppercase text-sm">AIP Workspace</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/10">
                        <Command className="w-3.5 h-3.5" /> K
                        <span className="ml-1 text-slate-500">Global Search</span>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl w-full relative z-10 space-y-12 mt-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black text-white tracking-tight">Select Workspace</h1>
                    <p className="text-sm text-slate-400 max-w-xl mx-auto">
                        Ontology-backed application environments. Select an active workspace to access Foundry resources, Workshop modules, and AI logic chains.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Card */}
                    {isCreating ? (
                        <form onSubmit={handleCreate} className="bg-[#0B1220] border border-blue-500/50 rounded-2xl p-6 shadow-2xl flex flex-col h-64 ring-1 ring-blue-500/20 animate-in fade-in zoom-in-95 duration-200">
                            <h3 className="text-sm font-bold text-white mb-4">Initialize Workspace</h3>
                            <div className="space-y-3 flex-1">
                                <input
                                    autoFocus
                                    value={newName} onChange={e => setNewName(e.target.value)}
                                    placeholder="Project Name..."
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500/50 outline-none"
                                />
                                <textarea
                                    value={newDesc} onChange={e => setNewDesc(e.target.value)}
                                    placeholder="Operational mandate..."
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500/50 outline-none resize-none h-20"
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10 hover:bg-white/10">Cancel</button>
                                <button type="submit" disabled={!newName.trim()} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-blue-500/20">Initialize</button>
                            </div>
                        </form>
                    ) : (
                        <button onClick={() => setIsCreating(true)} className="bg-[#0B1220]/50 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-blue-400 transition-all h-64 group border-dashed shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-blue-500/10 flex items-center justify-center mb-4 transition-colors">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold">New Workspace</span>
                        </button>
                    )}

                    {/* Project Cards */}
                    {projects.map(proj => (
                        <Link key={proj.id} href={`/workspace/${proj.id}`} className="bg-[#0B1220] border border-white/10 hover:border-white/20 hover:ring-1 hover:ring-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-64 transition-all hover:-translate-y-1 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                    <FolderGit2 className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-white/5">
                                    <Clock className="w-3 h-3 text-slate-600" /> {new Date(proj.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <h2 className="text-lg font-bold text-white mb-2 line-clamp-1">{proj.name}</h2>
                            <p className="text-xs text-slate-400 leading-relaxed max-w-sm line-clamp-3 mb-4">{proj.description}</p>

                            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-xs font-bold text-slate-500 group-hover:text-blue-400 transition-colors">
                                <span>Access Resources</span>
                                <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
