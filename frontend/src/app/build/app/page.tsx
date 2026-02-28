"use client";

import { useState } from "react";
import {
    LayoutTemplate, Play, Settings, Database,
    Layers, Plus, MousePointer2, Type, Activity, List,
    ChevronRight, ChevronDown, Eye, CheckCircle2,
    Code, Server, Share2, PanelLeftClose, PanelRightClose,
    TabletSmartphone, Monitor, Variable, Bolt
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Workshop Widget Types mapped to Palantir UI standard
type WidgetType = 'ObjectTable' | 'MetricCard' | 'Text' | 'ActionButton' | 'Section';

interface WidgetDef {
    id: string;
    type: WidgetType;
    name: string;
    properties: Record<string, any>;
    children?: WidgetDef[]; // For Sections
}

// Initial mock layout
const initialLayout: WidgetDef[] = [
    {
        id: "w_sec1", type: "Section", name: "Header Container", properties: {},
        children: [
            { id: "w_t1", type: "Text", name: "Page Title", properties: { content: "Drone Fleet Operations", variant: "h1" } },
            { id: "w_m1", type: "MetricCard", name: "Active Drones", properties: { value: "142", delta: "+12%" } }
        ]
    },
    {
        id: "w_obj1", type: "ObjectTable", name: "Fleet Telemetry", properties: { boundVariable: "var_ActiveFleet" }
    }
];

import { useBuilderStore } from "@/store/builderStore";
import { useEffect } from "react";

export default function WorkshopEditor() {
    const router = useRouter();
    const { pages, updatePage } = useBuilderStore();

    // Fallback to first seeded page
    const activePage = pages.length > 0 ? pages[0] : null;
    const initialStoreLayout: WidgetDef[] = activePage?.layout || initialLayout;

    const [layout, setLayout] = useState<WidgetDef[]>(initialStoreLayout);
    const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
    const [leftPanelTab, setLeftPanelTab] = useState<'Layout' | 'Variables' | 'Events'>('Layout');

    // Auto-save layout to store
    useEffect(() => {
        if (activePage) updatePage(activePage.id, { layout });
    }, [layout, activePage?.id, updatePage]);

    // Recursive Renderer for the Canvas
    const renderWidget = (widget: WidgetDef) => {
        const isSelected = selectedWidget === widget.id;
        const selectorOverlay = isSelected ? "ring-2 ring-[#137CBD] z-10" : "hover:ring-1 hover:ring-[#137CBD]/50";

        const wrapClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            setSelectedWidget(widget.id);
        };

        switch (widget.type) {
            case 'Section':
                return (
                    <div key={widget.id} onClick={wrapClick}
                        className={`min-h-[60px] border border-dashed border-pt-border bg-white rounded-sm p-3 transition-all relative ${selectorOverlay}`}>
                        {isSelected && <div className="absolute -top-3 left-0 bg-[#137CBD] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-t-sm tracking-wider uppercase">Section</div>}
                        <div className="flex gap-4">
                            {widget.children?.map(renderWidget)}
                            {(!widget.children || widget.children.length === 0) && (
                                <div className="flex-1 p-4 text-center text-[11px] text-pt-text-muted border border-dashed border-pt-border/50 bg-[#F5F8FA] flex items-center justify-center">
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Drop widget here
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'ObjectTable':
                return (
                    <div key={widget.id} onClick={wrapClick}
                        className={`border border-pt-border bg-white rounded-sm overflow-hidden flex flex-col transition-all relative w-full ${selectorOverlay}`}>
                        {isSelected && <div className="absolute -top-3 left-0 bg-[#137CBD] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-t-sm tracking-wider uppercase">Object Table</div>}
                        <div className="h-8 bg-[#F5F8FA] border-b border-pt-border flex items-center justify-between px-3">
                            <span className="text-[12px] font-bold text-pt-text flex items-center gap-1.5"><List className="w-3.5 h-3.5 text-[#5C7080]" /> {widget.name}</span>
                            <span className="text-[10px] bg-[#E4E8ED] text-pt-text-muted px-1.5 py-0.5 rounded font-mono border border-pt-border">{widget.properties.boundVariable || 'No Variable'}</span>
                        </div>
                        <div className="h-48 bg-white flex flex-col items-center justify-center text-[11px] text-pt-text-muted">
                            <Database className="w-6 h-6 text-[#CED9E0] mb-2" />
                            <p>Data preview disabled in editor.</p>
                            <p>Bound to: <span className="font-mono text-[#137CBD]">{widget.properties.boundVariable || 'None'}</span></p>
                        </div>
                    </div>
                );
            case 'MetricCard':
                return (
                    <div key={widget.id} onClick={wrapClick}
                        className={`w-48 h-20 border border-pt-border bg-white rounded-sm p-3 flex flex-col justify-between transition-all relative ${selectorOverlay}`}>
                        {isSelected && <div className="absolute -top-3 left-0 bg-[#137CBD] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-t-sm tracking-wider uppercase">Metric Card</div>}
                        <div className="text-[11px] font-bold text-pt-text-muted uppercase tracking-wider truncate">{widget.name}</div>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-light text-pt-text tracking-tight">{widget.properties.value || '0'}</span>
                            <span className="text-[11px] font-bold text-[#0F9960] bg-[#0F9960]/10 px-1 rounded">{widget.properties.delta || '0%'}</span>
                        </div>
                    </div>
                );
            case 'Text':
                return (
                    <div key={widget.id} onClick={wrapClick}
                        className={`p-2 transition-all relative w-full ${selectorOverlay}`}>
                        {isSelected && <div className="absolute -top-3 left-0 bg-[#137CBD] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-t-sm tracking-wider uppercase">Text</div>}
                        <div className={`${widget.properties.variant === 'h1' ? 'text-[20px] font-light text-pt-text leading-tight' : 'text-[13px] text-pt-text-muted'}`}>
                            {widget.properties.content || 'Text Element'}
                        </div>
                    </div>
                );
            case 'ActionButton':
                return (
                    <button key={widget.id} onClick={wrapClick}
                        className={`px-4 py-1.5 bg-[#137CBD] text-white rounded-sm text-[12px] font-bold shadow-sm transition-all relative ${selectorOverlay}`}>
                        {isSelected && <div className="absolute -top-3 left-0 bg-[#137CBD] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-t-sm tracking-wider uppercase">Action Button</div>}
                        {widget.properties.label || 'Action Button'}
                    </button>
                );
        }
    };

    return (
        <div className="flex flex-col h-full bg-pt-bg">

            {/* TOP ACTION BAR - Builder Tools & Deployment */}
            <div className="h-12 bg-pt-bg-panel border-b border-pt-border flex items-center justify-between px-3 shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded border border-[#137CBD]/30 bg-[#137CBD]/10 flex items-center justify-center">
                            <LayoutTemplate className="w-3.5 h-3.5 text-[#137CBD]" />
                        </div>
                        <span className="font-bold text-[13px] text-pt-text tracking-tight">Fleet Command Center Module</span>
                    </div>
                    <div className="w-px h-5 bg-pt-border mx-1" />
                    <div className="flex bg-[#F5F8FA] rounded border border-pt-border overflow-hidden">
                        <button className="px-3 py-1 bg-white border-r border-pt-border text-[#137CBD] flex items-center gap-1.5 text-[11px] font-bold shadow-[inset_0_-2px_0_#137CBD]"><Monitor className="w-3.5 h-3.5" /> Desktop</button>
                        <button className="px-3 py-1 text-pt-text-muted hover:bg-[#E4E8ED] transition-colors flex items-center gap-1.5 text-[11px] font-medium"><TabletSmartphone className="w-3.5 h-3.5" /> Mobile</button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#0F9960] font-bold bg-[#0F9960]/10 px-2 py-1 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Auto-saved
                    </div>
                    <div className="w-px h-5 bg-pt-border" />
                    <button className="flex items-center gap-1.5 px-3 py-1 text-pt-text-muted hover:text-pt-text transition-colors text-[12px] font-bold">
                        <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                    {/* The Deployment Hook connecting Builder -> Runtime */}
                    <Link href={`/run/dashboard`} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#137CBD] hover:bg-[#106BA3] text-white rounded text-[12px] font-bold transition-colors shadow-sm">
                        <Play className="w-3.5 h-3.5 fill-current" /> View / Deploy
                    </Link>
                </div>
            </div>

            {/* 3-Panel Construct */}
            <div className="flex-1 flex min-h-0">

                {/* Left Panel: Context & Module Structure */}
                <div className="w-72 bg-pt-bg-panel border-r border-pt-border flex flex-col z-10">
                    <div className="flex bg-[#F5F8FA] border-b border-pt-border text-[11px] font-bold text-pt-text-muted justify-around shrink-0 pt-2 px-2">
                        <button className={`pb-2 px-1 ${leftPanelTab === 'Layout' ? 'border-b-2 border-[#137CBD] text-pt-text' : 'border-b-2 border-transparent hover:text-pt-text'}`} onClick={() => setLeftPanelTab('Layout')}><Layers className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Layout</button>
                        <button className={`pb-2 px-1 ${leftPanelTab === 'Variables' ? 'border-b-2 border-[#137CBD] text-pt-text' : 'border-b-2 border-transparent hover:text-pt-text'}`} onClick={() => setLeftPanelTab('Variables')}><Variable className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Variables</button>
                        <button className={`pb-2 px-1 ${leftPanelTab === 'Events' ? 'border-b-2 border-[#137CBD] text-pt-text' : 'border-b-2 border-transparent hover:text-pt-text'}`} onClick={() => setLeftPanelTab('Events')}><Bolt className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Events</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                        {leftPanelTab === 'Layout' && (
                            <>
                                <div className="mb-4">
                                    <input placeholder="Filter widgets..." className="w-full bg-[#F5F8FA] border border-pt-border rounded px-2 py-1 text-[12px] text-pt-text focus:outline-none focus:border-[#137CBD] placeholder:text-pt-text-muted" />
                                </div>
                                <div className="space-y-0.5 text-[12px] font-mono">
                                    {/* Tree Recursion Simulation */}
                                    <div className="flex items-center gap-1 text-pt-text py-1 px-1 hover:bg-[#F5F8FA] rounded cursor-pointer group">
                                        <ChevronDown className="w-3.5 h-3.5 text-pt-text-muted" />
                                        <Layers className="w-3.5 h-3.5 text-[#137CBD]" />
                                        <span className="font-sans font-bold text-[12px]">Main Layout</span>
                                    </div>
                                    <div className="pl-5 space-y-0.5 relative before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-px before:bg-pt-border">
                                        <div className="flex items-center gap-1.5 py-1 px-1 hover:bg-[#F5F8FA] rounded cursor-pointer relative">
                                            <div className="absolute left-[-10px] w-2.5 h-px bg-pt-border top-1/2" />
                                            <Type className="w-3.5 h-3.5 text-[#5C7080]" />
                                            <span className="truncate">Page Title</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 py-1 px-1 hover:bg-[#F5F8FA] rounded cursor-pointer relative">
                                            <div className="absolute left-[-10px] w-2.5 h-px bg-pt-border top-1/2" />
                                            <Activity className="w-3.5 h-3.5 text-[#0F9960]" />
                                            <span className="truncate">Active Drones Metric</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 py-1 px-1 hover:bg-[#F5F8FA] rounded cursor-pointer relative bg-[#E4E8ED] text-[#137CBD] font-bold">
                                            <div className="absolute left-[-10px] w-2.5 h-px bg-pt-border top-1/2" />
                                            <List className="w-3.5 h-3.5 text-[#137CBD]" />
                                            <span className="truncate">Fleet Telemetry Table</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 border-t border-pt-border pt-4">
                                    <button
                                        onClick={() => {
                                            const newId = `w_t_${Date.now()}`;
                                            setLayout([...layout, { id: newId, type: "Text", name: "New Text Block", properties: { content: "New Text Block", variant: "h1" } }]);
                                            setSelectedWidget(newId);
                                        }}
                                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border border-[#137CBD] text-[#137CBD] rounded text-[12px] font-bold hover:bg-[#137CBD]/5 transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Text Component
                                    </button>
                                </div>
                            </>
                        )}
                        {leftPanelTab === 'Variables' && (
                            <div className="text-[12px] text-pt-text-muted text-center mt-10">
                                <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Variable scope and ontology object sets are configured here.
                            </div>
                        )}
                        {leftPanelTab === 'Events' && (
                            <div className="text-[12px] text-pt-text-muted text-center mt-10">
                                <Bolt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                Global actions and event triggers (on-click, on-load) are defined here.
                            </div>
                        )}
                    </div>
                </div>

                {/* Central Render Canvas (WYSIWYG) */}
                <div className="flex-1 bg-[#E4E8ED] overflow-y-auto p-8 relative flex shadow-inner" onClick={() => setSelectedWidget(null)}>
                    {/* The Page bounds */}
                    <div className="max-w-[1200px] w-full min-h-[800px] mx-auto bg-pt-bg-panel shadow-sm border border-pt-border relative z-10 flex flex-col gap-4 p-8">
                        {layout.map(renderWidget)}
                    </div>
                </div>

                {/* Right Panel: Dynamic Property Configuration */}
                <div className="w-[320px] bg-pt-bg-panel border-l border-pt-border flex flex-col z-10">
                    <div className="flex bg-[#F5F8FA] border-b border-pt-border text-[11px] font-bold text-pt-text-muted justify-around shrink-0 pt-2 px-2">
                        <button className="pb-2 px-1 border-b-2 border-[#137CBD] text-pt-text">Configuration</button>
                        <button className="pb-2 px-1 border-b-2 border-transparent hover:text-pt-text">Styles</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {selectedWidget ? (
                            <div className="space-y-6">
                                {/* Header */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <h2 className="text-[15px] font-bold text-pt-text">Object Table</h2>
                                        <button className="p-1 hover:bg-[#F5F8FA] rounded"><Code className="w-3.5 h-3.5 text-pt-text-muted" /></button>
                                    </div>
                                    <p className="text-[11px] text-pt-text-muted leading-tight">Displays an interactive table of Ontology objects filtered by an object set variable.</p>
                                </div>

                                {/* Form Groups */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-pt-text uppercase tracking-wider flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-[#137CBD]" /> Object Set Variable</label>
                                        <div className="flex">
                                            <div className="bg-[#F5F8FA] border border-r-0 border-pt-border rounded-l px-2 py-1.5 flex items-center justify-center">
                                                <Variable className="w-3.5 h-3.5 text-[#5C7080]" />
                                            </div>
                                            <select className="flex-1 bg-white border border-pt-border rounded-r px-2 py-1.5 text-[12px] text-pt-text outline-none focus:border-[#137CBD] box-shadow-[0_0_0_2px_rgba(19,124,189,0.2)] font-mono">
                                                <option>var_ActiveFleet</option>
                                                <option>var_AllDrones</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-pt-border space-y-1.5">
                                        <label className="text-[11px] font-bold text-pt-text uppercase tracking-wider">Columns to Display</label>
                                        <div className="border border-pt-border rounded bg-white divide-y divide-pt-border overflow-hidden">
                                            {['drone_id', 'battery_level', 'status', 'last_maintenance'].map((col, i) => (
                                                <div key={col} className="flex items-center justify-between px-2 py-1.5 hover:bg-[#F5F8FA] group">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 border border-pt-border rounded-sm flex items-center justify-center bg-[#137CBD] border-none"><CheckCircle2 className="w-2.5 h-2.5 text-white" /></div>
                                                        <span className="text-[12px] font-mono text-pt-text">{col}</span>
                                                    </div>
                                                    <Settings className="w-3.5 h-3.5 text-pt-text-muted opacity-0 group-hover:opacity-100 cursor-pointer" />
                                                </div>
                                            ))}
                                        </div>
                                        <button className="text-[11px] font-bold text-[#137CBD] hover:underline mt-1">+ Add Property Column</button>
                                    </div>

                                    <div className="pt-4 border-t border-pt-border space-y-1.5">
                                        <label className="text-[11px] font-bold text-pt-text uppercase tracking-wider flex items-center gap-1.5 mb-2"><Bolt className="w-3.5 h-3.5 text-[#D9822B]" /> Interactions</label>
                                        <div className="flex items-start gap-2 p-2 bg-[#F5F8FA] border border-pt-border rounded">
                                            <input type="checkbox" defaultChecked className="mt-1" />
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-bold text-pt-text">Enable Row Selection</span>
                                                <span className="text-[11px] text-pt-text-muted leading-tight mt-0.5">Outputs selected object(s) to a new variable for use in other widgets or actions.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-pt-text-muted p-4">
                                <Settings className="w-8 h-8 mb-2 opacity-30" />
                                <div className="text-[12px] font-bold">No Widget Selected</div>
                                <div className="text-[11px] mt-1 leading-tight">Select a widget on the canvas or in the layout tree to configure its properties, data bindings, and events.</div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
