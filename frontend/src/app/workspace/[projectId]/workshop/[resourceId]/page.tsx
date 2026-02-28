"use client";

import { use, useState, useEffect } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import {
    LayoutTemplate, Play, ArrowLeft, Settings, Database,
    Layers, Plus, MousePointer2, Type, Hash, ToggleLeft, Activity, List, Zap
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";

// Workshop Widget Types mapped to Palantir UI standard
type WidgetType = 'ObjectTable' | 'MetricCard' | 'Text' | 'ActionButton' | 'Section';

interface WidgetDef {
    id: string;
    type: WidgetType;
    name: string;
    properties: Record<string, any>;
    children?: WidgetDef[]; // For Sections
}

// Complex state definition for a Workshop File
interface WorkshopDef {
    variables: Record<string, any>; // Represents data bound from Ontology
    layout: WidgetDef[];            // Tree structure of the app
}

export default function WorkshopEditor({ params }: { params: Promise<{ projectId: string, resourceId: string }> }) {
    const { projectId, resourceId } = use(params);
    const { resources, updateResource } = useWorkspaceStore();
    const router = useRouter();

    const resource = resources.find(r => r.id === resourceId && r.type === 'workshop');
    if (!resource) return notFound();

    const [def, setDef] = useState<WorkshopDef>(resource.definition.layout ? resource.definition : { variables: {}, layout: [] });
    const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

    // Auto-save debounced
    useEffect(() => {
        const timer = setTimeout(() => {
            updateResource(resourceId, def);
        }, 1000);
        return () => clearTimeout(timer);
    }, [def, updateResource, resourceId]);

    // Recursive Component Renderer
    const renderWidget = (widget: WidgetDef) => {
        const isSelected = selectedWidget === widget.id;
        const selectorOverlay = isSelected ? "ring-2 ring-blue-500 shadow-md" : "hover:ring-1 hover:ring-white/20";

        const wrapClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            setSelectedWidget(widget.id);
        };

        switch (widget.type) {
            case 'Section':
                return (
                    <div key={widget.id} onClick={wrapClick}
                        className={`min-h-[100px] border border-dashed border-white/20 rounded-xl p-4 transition-all bg-white/[0.02] ${selectorOverlay}`}>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                            <span>{widget.name}</span>
                            <span className="text-slate-600 bg-black/40 px-2 py-0.5 rounded">Section container</span>
                        </div>
                        <div className="space-y-4">
                            {widget.children?.map(renderWidget)}
                            {(!widget.children || widget.children.length === 0) && (
                                <div className="p-8 text-center text-xs text-slate-600 font-sans border border-dashed border-white/5 rounded-lg">
                                    Empty Section. Drag widgets here. {/* Drag & Drop mocked */}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'ObjectTable':
                return (
                    <div key={widget.id} onClick={wrapClick}
                        className={`h-48 border border-white/10 rounded-xl bg-[#0B1220] flex flex-col items-center justify-center transition-all ${selectorOverlay}`}>
                        <List className="w-8 h-8 text-blue-500/50 mb-2" />
                        <div className="text-sm font-bold text-white">{widget.name}</div>
                        <div className="text-xs text-slate-500 mt-1">Bound to Variable: {widget.properties.boundVariable || 'None'}</div>
                    </div>
                );
            case 'MetricCard':
                return (
                    <div key={widget.id} onClick={wrapClick}
                        className={`h-32 border border-white/10 rounded-xl bg-gradient-to-br from-emerald-900/20 to-[#0B1220] flex flex-col justify-between p-4 transition-all ${selectorOverlay}`}>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{widget.name}</div>
                        <div className="text-3xl font-black text-emerald-400 font-mono">{widget.properties.value || '0'}</div>
                    </div>
                );
            case 'Text':
                return (
                    <div key={widget.id} onClick={wrapClick}
                        className={`p-4 transition-all rounded-lg ${selectorOverlay}`}>
                        <div className={`${widget.properties.variant === 'h1' ? 'text-3xl font-black text-white' : 'text-sm text-slate-300'}`}>
                            {widget.properties.content || 'Text Element'}
                        </div>
                    </div>
                );
            case 'ActionButton':
                return (
                    <button key={widget.id} onClick={wrapClick}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg transition-all ${selectorOverlay}`}>
                        {widget.properties.label || 'Action Button'}
                    </button>
                );
        }
    };

    const addWidget = (type: WidgetType) => {
        const newW: WidgetDef = {
            id: `w_${Date.now()}`,
            type,
            name: `${type} Block`,
            properties: {}
        };
        // Simple append to root logic, ignoring deeper nested additions for MVP
        setDef(prev => ({ ...prev, layout: [...prev.layout, newW] }));
        setSelectedWidget(newW.id);
    };

    return (
        <div className="flex flex-col h-screen bg-[#060A12] text-slate-300 font-sans">

            {/* 1. Header toolbar - The Global controls */}
            <div className="h-14 border-b border-white/5 bg-[#0B1220] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <Link href={`/workspace/${projectId}`} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded border border-blue-500/30 bg-blue-500/10 flex items-center justify-center">
                            <LayoutTemplate className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="font-bold text-sm text-white">{resource.name}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-[10px] text-slate-500 font-mono mr-4 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Auto-saving workspace
                    </div>
                    {/* The Deployment Hook connecting Builder -> Runtime via Application layer. */}
                    <button onClick={() => router.push(`/apps/${resourceId}`)} className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-emerald-600/20">
                        <Play className="w-3.5 h-3.5 fill-current" /> Deploy & Run
                    </button>
                </div>
            </div>

            {/* 3-Panel Construct */}
            <div className="flex-1 flex min-h-0">

                {/* Panel L: Context & Widget Palette */}
                <div className="w-72 border-r border-white/5 bg-[#060A12] flex flex-col h-full bg-gradient-to-b from-[#0B1220]/50 to-transparent">
                    <div className="p-4 border-b border-white/5 bg-[#0B1220]">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-3">
                            <Plus className="w-3.5 h-3.5 text-blue-400" /> Add Widget
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => addWidget('Section')} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs text-slate-300 font-bold flex items-center justify-center gap-1.5"><Layers className="w-3 h-3 text-purple-400" /> Section</button>
                            <button onClick={() => addWidget('ObjectTable')} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs text-slate-300 font-bold flex items-center justify-center gap-1.5"><List className="w-3 h-3 text-blue-400" /> Table</button>
                            <button onClick={() => addWidget('MetricCard')} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs text-slate-300 font-bold flex items-center justify-center gap-1.5"><Activity className="w-3 h-3 text-emerald-400" /> Metric</button>
                            <button onClick={() => addWidget('ActionButton')} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs text-slate-300 font-bold flex items-center justify-center gap-1.5"><MousePointer2 className="w-3 h-3 text-amber-400" /> Button</button>
                            <button onClick={() => addWidget('Text')} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs text-slate-300 font-bold flex items-center justify-center gap-1.5 col-span-2"><Type className="w-3 h-3 text-slate-400" /> Text Block</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-3">
                            <Layers className="w-3.5 h-3.5 text-slate-400" /> Layout Tree
                        </div>
                        {def.layout.length === 0 ? (
                            <div className="text-xs text-slate-600 font-sans italic text-center p-4 py-8 border border-dashed border-white/5 rounded-lg">Canvas is empty</div>
                        ) : (
                            <div className="space-y-1 block relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10 pl-5">
                                {def.layout.map(w => (
                                    <div key={w.id} onClick={() => setSelectedWidget(w.id)}
                                        className={`relative group flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer ${selectedWidget === w.id ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                        <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-4 h-px bg-white/20" />
                                        <div className="absolute left-[-23px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-slate-500" />

                                        {/* Icon based on layout obj type */}
                                        {w.type === 'Section' && <Layers className="w-3.5 h-3.5 shrink-0" />}
                                        {w.type === 'ObjectTable' && <List className="w-3.5 h-3.5 shrink-0" />}
                                        {w.type === 'MetricCard' && <Activity className="w-3.5 h-3.5 shrink-0" />}
                                        {w.type === 'ActionButton' && <MousePointer2 className="w-3.5 h-3.5 shrink-0" />}
                                        {w.type === 'Text' && <Type className="w-3.5 h-3.5 shrink-0" />}

                                        <span className="text-xs font-mono truncate">{w.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel M: Central Render Canvas (WYSIWYG) */}
                <div className="flex-1 bg-[#020409] overflow-y-auto p-8 relative" onClick={() => setSelectedWidget(null)}>

                    {/* Mock Grid Background */}
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                    <div className="max-w-5xl mx-auto w-full min-h-[800px] border border-white/5 bg-[#0B1220]/80 backdrop-blur-3xl rounded-3xl shadow-2xl p-8 relative z-10 flex flex-col gap-6 ring-1 ring-white/5">
                        {def.layout.map(renderWidget)}
                        {def.layout.length === 0 && (
                            <div className="flex-1 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center">
                                <LayoutTemplate className="w-16 h-16 text-white/5 mb-4" />
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Empty Workshop Canvas</div>
                                <div className="text-xs text-slate-600 font-sans mt-2">Construct your Palantir operational interface from the left palette.</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel R: Dynamic Property Configuration */}
                <div className="w-80 border-l border-white/5 bg-[#060A12] flex flex-col bg-gradient-to-b from-[#0B1220]/50 to-transparent">
                    <div className="p-4 border-b border-white/5 bg-[#0B1220]">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Settings className="w-3.5 h-3.5 text-blue-400" /> Configuration
                        </div>
                    </div>

                    <div className="p-5 flex-1 overflow-y-auto">
                        {selectedWidget ? (() => {
                            const w = def.layout.find(wd => wd.id === selectedWidget); // Only shallow tree selection mapped for MVP
                            if (!w) return null;

                            return (
                                <div className="space-y-6">
                                    {/* Universal Prop */}
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-widest">Base Identifier Name</label>
                                        <input
                                            value={w.name}
                                            onChange={e => {
                                                const v = e.target.value;
                                                setDef(prev => ({ ...prev, layout: prev.layout.map(l => l.id === w.id ? { ...l, name: v } : l) }));
                                            }}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none font-mono text-xs"
                                        />
                                    </div>

                                    {/* Type Specific Props */}
                                    {w.type === 'Text' && (
                                        <>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-widest">Text Content</label>
                                                <textarea
                                                    value={w.properties.content || ''}
                                                    onChange={e => {
                                                        const v = e.target.value;
                                                        setDef(prev => ({ ...prev, layout: prev.layout.map(l => l.id === w.id ? { ...l, properties: { ...l.properties, content: v } } : l) }));
                                                    }}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none resize-none h-24"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-widest">Text Variant</label>
                                                <select
                                                    value={w.properties.variant || 'p'}
                                                    onChange={e => {
                                                        const v = e.target.value;
                                                        setDef(prev => ({ ...prev, layout: prev.layout.map(l => l.id === w.id ? { ...l, properties: { ...l.properties, variant: v } } : l) }));
                                                    }}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none">
                                                    <option value="p">Paragraph Segment</option>
                                                    <option value="h1">H1 Header</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {w.type === 'ObjectTable' && (
                                        <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-xl">
                                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-3">
                                                <Database className="w-4 h-4" /> Data Binding
                                            </div>
                                            <label className="text-[10px] uppercase font-bold text-emerald-500/80 mb-2 block">Bound Ontology Variable</label>
                                            <input
                                                value={w.properties.boundVariable || ''}
                                                onChange={e => {
                                                    const v = e.target.value;
                                                    setDef(prev => ({ ...prev, layout: prev.layout.map(l => l.id === w.id ? { ...l, properties: { ...l.properties, boundVariable: v } } : l) }));
                                                }}
                                                placeholder="e.g. var_FleetDrones_Active"
                                                className="w-full bg-black/40 border border-emerald-500/20 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none font-mono text-xs"
                                            />
                                            <div className="text-[10px] text-emerald-500/60 mt-2 font-sans leading-relaxed">Bind this object table to an active variable queried from the central Ontology instance graph.</div>
                                        </div>
                                    )}

                                    {w.type === 'MetricCard' && (
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-widest">Static/Fallback Value</label>
                                            <input
                                                value={w.properties.value || ''}
                                                onChange={e => {
                                                    const v = e.target.value;
                                                    setDef(prev => ({ ...prev, layout: prev.layout.map(l => l.id === w.id ? { ...l, properties: { ...l.properties, value: v } } : l) }));
                                                }}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none font-mono text-xs"
                                            />
                                        </div>
                                    )}

                                    {w.type === 'ActionButton' && (
                                        <>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block tracking-widest">Button Label</label>
                                                <input
                                                    value={w.properties.label || ''}
                                                    onChange={e => {
                                                        const v = e.target.value;
                                                        setDef(prev => ({ ...prev, layout: prev.layout.map(l => l.id === w.id ? { ...l, properties: { ...l.properties, label: v } } : l) }));
                                                    }}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
                                                />
                                            </div>
                                            <div className="p-4 bg-amber-900/10 border border-amber-500/20 rounded-xl mt-4">
                                                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-3">
                                                    <Zap className="w-4 h-4" /> Action Dispatch
                                                </div>
                                                <label className="text-[10px] uppercase font-bold text-amber-500/80 mb-2 block">Action ID to Trigger</label>
                                                <input
                                                    value={w.properties.actionId || ''}
                                                    onChange={e => {
                                                        const v = e.target.value;
                                                        setDef(prev => ({ ...prev, layout: prev.layout.map(l => l.id === w.id ? { ...l, properties: { ...l.properties, actionId: v } } : l) }));
                                                    }}
                                                    placeholder="act_RecallDrone"
                                                    className="w-full bg-black/40 border border-amber-500/20 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50 outline-none font-mono text-xs"
                                                />
                                                <div className="text-[10px] text-amber-500/60 mt-2 font-sans leading-relaxed">Map this button directly to a globally defined state mutation Action.</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })() : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <Settings className="w-12 h-12 text-blue-500/20 mb-4" />
                                <div className="text-sm font-bold text-white mb-2">Configure Selection</div>
                                <div className="text-xs text-slate-500 font-sans leading-relaxed">Select any widget on the layout canvas or left panel to inspect and configure its bound variables, styling, and action hooks.</div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
