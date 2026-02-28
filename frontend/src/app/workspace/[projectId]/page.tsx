"use client";

import { use, useState } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
    Folder, Database, Zap, BrainCircuit, LayoutTemplate,
    MoreVertical, Search, Plus, ArrowLeft, Clock, FileJson
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";

const RESOURCE_ICONS = {
    'folder': Folder,
    'ontology': Database,
    'action': Zap,
    'logic': BrainCircuit,
    'workshop': LayoutTemplate
};

const RESOURCE_COLORS = {
    'folder': 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    'ontology': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'action': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'logic': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'workshop': 'text-blue-400 bg-blue-500/10 border-blue-500/20'
};

const RESOURCE_LABELS = {
    'folder': 'Folder',
    'ontology': 'Ontology Object Schema',
    'action': 'Operational Action definition',
    'logic': 'AIP Logic LLM function',
    'workshop': 'Workshop Application Module'
};

export default function WorkspaceExplorer({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = use(params);
    const { projects, resources, createResource, deleteResource } = useWorkspaceStore();
    const router = useRouter();

    const [currentFolder, setCurrentFolder] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [isCreating, setIsCreating] = useState<false | 'folder' | 'ontology' | 'action' | 'logic' | 'workshop'>(false);
    const [newName, setNewName] = useState("");

    const project = projects.find(p => p.id === projectId);
    if (!project) return notFound();

    // Filter resources by current folder AND search
    let visibleResources = resources.filter(r => r.projectId === projectId);

    if (search.trim()) {
        // If searching, show all flat matching search (ignore folders structure)
        visibleResources = visibleResources.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    } else {
        // Normal hierarchical view
        visibleResources = visibleResources.filter(r => r.parentId === currentFolder);
        // Sort folders first, then alphabetically
        visibleResources.sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (b.type === 'folder' && a.type !== 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
    }

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !isCreating) return;
        createResource(projectId, currentFolder, isCreating, newName);
        setIsCreating(false);
        setNewName("");
    };

    const handleResourceClick = (resource: typeof resources[0]) => {
        if (resource.type === 'folder') {
            setCurrentFolder(resource.id);
            setSearch(""); // clear search when navigating
        } else {
            router.push(`/workspace/${projectId}/${resource.type}/${resource.id}`);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[#060A12] text-slate-300 font-sans">

            {/* Header / Breadcrumbs */}
            <div className="h-16 border-b border-white/5 bg-[#0B1220] flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <Link href="/projects" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-slate-200">{project.name}</span>
                        {currentFolder && (
                            <>
                                <span className="text-slate-600">/</span>
                                <span className="text-slate-400 font-semibold">{resources.find(r => r.id === currentFolder)?.name}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search workspace resources..."
                            className="w-64 bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:border-blue-500/50 outline-none transition-colors"
                        />
                    </div>

                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors">
                            <Plus className="w-3.5 h-3.5" /> New Resource
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full pt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                            <div className="w-64 bg-[#0B1220] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
                                {(Object.entries(RESOURCE_LABELS) as [keyof typeof RESOURCE_LABELS, string][]).map(([type, label]) => {
                                    const Icon = RESOURCE_ICONS[type];
                                    const colorCls = RESOURCE_COLORS[type];
                                    return (
                                        <button key={type} onClick={() => setIsCreating(type)}
                                            className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors group/item">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorCls} group-hover/item:scale-110 transition-transform`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-200 capitalize">{type}</div>
                                                <div className="text-[10px] text-slate-500">{label}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Workspace Canvas */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6">

                    {currentFolder && !search && (
                        <button onClick={() => setCurrentFolder(resources.find(r => r.id === currentFolder)?.parentId || null)}
                            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors py-2">
                            <ArrowLeft className="w-3.5 h-3.5" /> Up to Parent Directory
                        </button>
                    )}

                    {/* Creation Inline Form */}
                    {isCreating && (
                        <div className="bg-[#0B1220] border border-blue-500/30 rounded-xl p-4 shadow-xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-200">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${RESOURCE_COLORS[isCreating]}`}>
                                {(() => { const I = RESOURCE_ICONS[isCreating]; return <I className="w-5 h-5" />; })()}
                            </div>
                            <form onSubmit={handleCreate} className="flex-1 flex gap-3">
                                <input
                                    autoFocus
                                    value={newName} onChange={e => setNewName(e.target.value)}
                                    placeholder={`Name your new ${isCreating}...`}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
                                />
                                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" disabled={!newName.trim()} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors">Create</button>
                            </form>
                        </div>
                    )}

                    {/* File System Grid */}
                    <div className="bg-[#0B1220] border border-white/5 rounded-2xl overflow-hidden shadow-xl">

                        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 bg-black/20 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <div className="col-span-6">Name</div>
                            <div className="col-span-3">Type</div>
                            <div className="col-span-2">Last Modified</div>
                            <div className="col-span-1 text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {visibleResources.map(res => {
                                const Icon = RESOURCE_ICONS[res.type];
                                const colorCls = RESOURCE_COLORS[res.type];

                                return (
                                    <div key={res.id} className="grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-white/5 transition-colors group cursor-pointer"
                                        onClick={() => handleResourceClick(res)}>
                                        <div className="col-span-6 flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorCls} group-hover:scale-110 transition-transform`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-200 group-hover:text-blue-300 transition-colors">{res.name}</span>
                                        </div>

                                        <div className="col-span-3">
                                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                {res.type}
                                            </span>
                                        </div>

                                        <div className="col-span-2 flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(res.updatedAt).toLocaleDateString()}
                                        </div>

                                        <div className="col-span-1 text-right">
                                            <button onClick={(e) => { e.stopPropagation(); deleteResource(res.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {visibleResources.length === 0 && !isCreating && (
                                <div className="p-16 text-center flex flex-col items-center">
                                    <FileJson className="w-12 h-12 text-slate-600 mb-4 opacity-50" />
                                    <div className="text-slate-400 text-sm font-bold mb-1">Folder is empty</div>
                                    <div className="text-slate-500 text-xs">Create a new resource from the top right menu to populate this workspace.</div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
