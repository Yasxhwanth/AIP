"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/workspace";
import { FolderPlus, Folder, Loader2 } from "lucide-react";
import { ApiClient } from "@/lib/apiClient";

type ProjectSummary = {
    id: string;
    name: string;
    description?: string | null;
};

export default function ProjectsPage() {
    const router = useRouter();
    const { setActiveProject } = useWorkspaceStore();
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [newProjectName, setNewProjectName] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        let cancelled = false;
        ApiClient.get<unknown>("/projects")
            .then((data) => {
                if (cancelled) return;
                if (Array.isArray(data)) {
                    setProjects(data as ProjectSummary[]);
                } else {
                    setProjects([]);
                }
            })
            .catch(() => {
                if (cancelled) return;
                setProjects([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const handleSelect = (id: string, name: string) => {
        setActiveProject(id, name);
        router.push('/');
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName) return;
        setCreating(true);
        try {
            const proj = await ApiClient.post<ProjectSummary>("/projects", {
                name: newProjectName,
            });
            setActiveProject(proj.id, proj.name);
            router.push('/');
        } catch (e) {
            setCreating(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;

    return (
        <div className="flex flex-col h-screen bg-[#f4f6f8] text-slate-900 overflow-hidden relative">

            {/* Background decoration */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-blue-600 pattern-isometric pattern-blue-500 pattern-bg-transparent pattern-size-8 pattern-opacity-10 z-0"></div>

            <div className="relative z-10 flex flex-1 items-center justify-center p-8">
                <div className="w-full max-w-4xl bg-white border border-slate-200 shadow-2xl shadow-blue-900/10 rounded-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                    {/* Left Side: Illustration / Brand */}
                    <div className="md:w-1/2 bg-blue-600 p-10 flex flex-col justify-between relative overflow-hidden text-white border-r border-blue-700/50">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 border border-white/20 backdrop-blur-sm shadow-inner">
                                <Folder className="w-6 h-6 text-white drop-shadow" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight mb-3 text-shadow-sm">C3 AIP Platforms</h1>
                            <p className="text-blue-100 leading-relaxed text-sm w-11/12">
                                Select your operational context. Your Workspace encapsulates your Ontology nodes, data integrations, ML models, and interactive dashboard layouts.
                            </p>
                        </div>

                        <div className="relative z-10 mt-12 bg-white/10 p-5 rounded-xl border border-white/20 backdrop-blur-md shadow-lg">
                            <div className="flex items-center gap-3 mb-2 opacity-90">
                                <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]"></div>
                                <h3 className="font-semibold text-sm tracking-wide">Secure Multi-Tenancy</h3>
                            </div>
                            <p className="text-xs text-blue-100 opacity-90 leading-tight">
                                All read/write operations to the graph are scoped via Foreign Keys protecting data leakage boundary limits.
                            </p>
                        </div>

                        {/* Decor */}
                        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>
                        <div className="absolute top-1/4 -left-24 w-48 h-48 bg-[#60a5fa] rounded-full blur-3xl opacity-30 mix-blend-screen pointer-events-none"></div>
                    </div>

                    {/* Right Side: Selection */}
                    <div className="md:w-1/2 bg-white p-10 flex flex-col h-full z-10">
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            Select Workspace
                        </h2>
                        <p className="text-sm text-slate-500 mb-8 mt-1">Found {projects.length} initialized project context(s).</p>

                        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar">
                            {projects.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSelect(p.id, p.name)}
                                    className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{p.name}</h3>
                                        <p className="text-xs font-medium text-slate-400 mt-1 line-clamp-1">{p.description || "Auto-generated default workspace"}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm">
                                        <span className="font-bold text-sm">→</span>
                                    </div>
                                </button>
                            ))}
                            {projects.length === 0 && (
                                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                    <FolderPlus className="w-8 h-8 text-slate-400 mb-2 opacity-50" />
                                    <p className="text-sm font-medium text-slate-500">No projects found.</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-8 mt-4 border-t border-slate-100">
                            <h3 className="font-semibold text-sm text-slate-800 mb-3 flex items-center gap-2"><FolderPlus className="w-4 h-4 text-blue-600" /> Create New Workspace</h3>
                            <form onSubmit={handleCreate} className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="e.g. Flight Operations DB..."
                                    value={newProjectName}
                                    onChange={e => setNewProjectName(e.target.value)}
                                    className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm placeholder:text-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!newProjectName || creating}
                                    className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center min-w-[100px] shadow-md cursor-pointer"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
