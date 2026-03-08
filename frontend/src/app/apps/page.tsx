"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, LayoutGrid, TerminalSquare, AlertTriangle, Play, Save, Settings, LineChart, Table, MessageSquare, Bot, Trash2 } from "lucide-react";
import GridLayout from "react-grid-layout";
const { WidthProvider, Responsive } = GridLayout as any;
import { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { ApiClient } from "@/lib/apiClient";
import { useWorkspaceStore } from "@/store/workspace";

const ResponsiveGridLayout = WidthProvider(Responsive);

// ── Types ─────────────────────────────────────────────────────────────────

type WidgetType = 'TABLE' | 'CHART' | 'AIP_AGENT';

type Widget = {
    id: string;
    type: WidgetType;
    configData: any;
};

type Dashboard = {
    id: string;
    name: string;
    widgets: Widget[];
    layout: any[]; // Holds x, y, w, h
    updatedAt: string;
};

interface EntityType {
    id: string;
    name: string;
}

interface AIPAgent {
    id: string;
    name: string;
}

// ── Sub-Components (Widgets) ───────────────────────────────────────────────

const ObjectTableWidget = ({ entityTypeId }: { entityTypeId: string }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!entityTypeId) return;
        setLoading(true);
        ApiClient.get<any[]>(`/api/ontology/entity-types/${entityTypeId}/instances`)
            .then(res => setData(res))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [entityTypeId]);

    if (!entityTypeId) return <div className="h-full w-full flex items-center justify-center text-[#5C7080] text-[12px]">Select Ontology Object from sidebar -&gt;</div>;
    if (loading) return <div className="h-full w-full flex items-center justify-center text-[#5C7080] text-[12px] animate-pulse">Loading live data...</div>;
    if (data.length === 0) return <div className="h-full w-full flex items-center justify-center text-[#5C7080] text-[12px]">No records found.</div>;

    const keys = Object.keys(data[0].data || {});

    return (
        <div className="w-full h-full overflow-auto bg-white custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-max">
                <thead className="bg-[#F5F8FA] sticky top-0 border-b border-[#CED9E0] shadow-sm z-10">
                    <tr>
                        <th className="px-3 py-2 text-[10px] font-bold text-[#5C7080] uppercase tracking-wider">ID</th>
                        {keys.map(k => <th key={k} className="px-3 py-2 text-[10px] font-bold text-[#5C7080] uppercase tracking-wider">{k}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#CED9E0]">
                    {data.map(row => (
                        <tr key={row.logicalId} className="hover:bg-[#F5F8FA] transition-colors">
                            <td className="px-3 py-2 text-[11px] font-mono text-[#5C7080]">{row.logicalId}</td>
                            {keys.map(k => (
                                <td key={k} className="px-3 py-2 text-[12px] text-[#182026] max-w-[200px] truncate" title={String(row.data[k])}>{String(row.data[k])}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    _debug_context?: string;
}

const AIPChatWidget = ({ agentId }: { agentId: string }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    if (!agentId) return <div className="h-full w-full flex items-center justify-center text-[#5C7080] text-[12px]">Select AIP Agent from sidebar -&gt;</div>;

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const msg = input;
        setInput("");
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg }]);
        setLoading(true);

        try {
            const res = await ApiClient.post<ChatMessage>(`/api/agents/${agentId}/chat`, { message: msg });
            setMessages(prev => [...prev, { ...res, id: (Date.now() + 1).toString() }]);
        } catch (e: any) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: `[Error: ${e.message}]` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {messages.length === 0 && <div className="text-center text-[#5C7080] text-[11px] mt-4 opacity-70">Send a message to query the Ontology</div>}
                {messages.map(m => (
                    <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[90%] rounded-[8px] px-3 py-2 text-[12px] shadow-sm leading-relaxed ${m.role === 'user' ? 'bg-[#137CBD] text-white rounded-tr-none' : 'bg-[#F5F8FA] border border-[#CED9E0] text-[#182026] rounded-tl-none'}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start">
                        <div className="bg-[#F5F8FA] border border-[#CED9E0] rounded-[8px] rounded-tl-none px-3 py-2 shadow-sm flex items-center gap-1">
                            <div className="w-1 h-1 bg-[#5C7080] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="w-1 h-1 bg-[#5C7080] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                            <div className="w-1 h-1 bg-[#5C7080] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                    </div>
                )}
            </div>
            <div className="p-2 border-t border-[#CED9E0] bg-[#F5F8FA] flex items-center gap-2 shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Message AIP..."
                    className="flex-1 text-[12px] p-2 bg-white border border-[#CED9E0] rounded focus:outline-none focus:border-[#137CBD] focus:ring-1 focus:ring-[#137CBD]"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="p-1.5 bg-[#137CBD] hover:bg-[#0E6694] text-white rounded shadow-sm disabled:opacity-50 transition-colors"
                >
                    <Play size={12} className="ml-0.5" />
                </button>
            </div>
        </div>
    );
};

// ── Main Layout ──────────────────────────────────────────────────────────────

export default function WorkshopAppsPage() {
    const { activeProjectId } = useWorkspaceStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Core Data
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [activeDash, setActiveDash] = useState<Dashboard | null>(null);

    // Meta Data for Selectors
    const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
    const [agents, setAgents] = useState<AIPAgent[]>([]);

    // Editor Selection State
    const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

    // ── Load Initial Data ────────────────────────────────────────────────
    useEffect(() => {
        if (!activeProjectId) return;
        Promise.all([
            ApiClient.get<Dashboard[]>("/api/v1/dashboards"),
            ApiClient.get<EntityType[]>("/api/ontology/entity-types"),
            ApiClient.get<AIPAgent[]>("/api/agents")
        ]).then(([dashes, ets, agts]) => {
            // Need to ensure dashboards have a layout array, migrated from old data structure
            const migratedDashes = dashes.map(d => ({
                ...d,
                layout: d.layout || d.widgets.map((w: any, i) => ({ i: w.id, x: (i * 4) % 12, y: Infinity, w: 4, h: 3 }))
            }));
            setDashboards(migratedDashes);
            setEntityTypes(ets);
            setAgents(agts);
            if (migratedDashes.length > 0) setActiveDash(migratedDashes[0]);
        }).catch(console.error).finally(() => setLoading(false));
    }, [activeProjectId]);

    // ── Actions ────────────────────────────────────────────────────────
    const handleCreateApp = async () => {
        try {
            const newDash = await ApiClient.post<Dashboard>("/api/v1/dashboards", {
                name: `New App ${dashboards.length + 1}`,
                widgets: [],
                layout: []
            });
            const populated = { ...newDash, layout: [] };
            setDashboards(prev => [populated, ...prev]);
            setActiveDash(populated);
            setSelectedWidgetId(null);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSaveApp = async () => {
        if (!activeDash) return;
        setSaving(true);
        try {
            const updated = await ApiClient.put<Dashboard>(`/api/v1/dashboards/${activeDash.id}`, {
                name: activeDash.name,
                widgets: activeDash.widgets,
                layout: activeDash.layout
            });
            setDashboards(prev => prev.map(d => d.id === updated.id ? { ...updated, layout: activeDash.layout } : d));
            setActiveDash({ ...updated, layout: activeDash.layout });
        } catch (e) {
            console.error("Save failed", e);
        } finally {
            setSaving(false);
        }
    };

    const handleAddWidget = (type: WidgetType) => {
        if (!activeDash) return;
        const newId = Date.now().toString();
        const newWidget: Widget = { id: newId, type, configData: {} };
        const newLayoutItem = { i: newId, x: 0, y: Infinity, w: 6, h: 4 };

        setActiveDash({
            ...activeDash,
            widgets: [...activeDash.widgets, newWidget],
            layout: [...activeDash.layout, newLayoutItem]
        });
        setSelectedWidgetId(newId);
    };

    const handleRemoveWidget = (id: string) => {
        if (!activeDash) return;
        setActiveDash({
            ...activeDash,
            widgets: activeDash.widgets.filter(w => w.id !== id),
            layout: activeDash.layout.filter((l: any) => l.i !== id)
        });
        if (selectedWidgetId === id) setSelectedWidgetId(null);
    };

    const onLayoutChange = (layout: any[]) => {
        if (!activeDash) return;
        setActiveDash(prev => prev ? { ...prev, layout } : null);
    };

    const updateWidgetConfig = (id: string, newConfig: any) => {
        if (!activeDash) return;
        setActiveDash({
            ...activeDash,
            widgets: activeDash.widgets.map(w => w.id === id ? { ...w, configData: newConfig } : w)
        });
    };

    // ── Views ─────────────────────────────────────────────────────────────
    if (loading) return <div className="h-full w-full bg-[#F5F8FA] text-[#182026] p-8">Loading Workshop Builder...</div>;

    const selectedWidget = activeDash?.widgets.find(w => w.id === selectedWidgetId);

    return (
        <div className="flex h-screen w-full bg-[#182026] text-white font-[Inter,sans-serif] overflow-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #CED9E0; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9FB3BE; }
            `}} />

            {/* ── LEFT NAV (App Chrome) ── */}
            <div className="w-14 bg-[#10161A] border-r border-[#293742] flex flex-col items-center py-3 shrink-0 z-20">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold mb-6">AIP</div>
                <button className="w-10 h-10 flex flex-col items-center justify-center text-[#137CBD] group relative bg-[#182026]">
                    <LayoutGrid className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-bold">Workshop</span>
                </button>
            </div>

            <div className="flex-1 flex bg-[#F5F8FA] text-[#182026]">
                {/* ── APP LIST SIDEBAR ── */}
                <div className="w-64 bg-white border-r border-[#CED9E0] flex flex-col shrink-0 z-10">
                    <div className="p-3 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#5C7080] uppercase tracking-wider">Applications</span>
                        <button onClick={handleCreateApp} className="text-[#137CBD] hover:bg-[#EBF1F5] p-1 rounded transition-colors"><Plus size={14} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {dashboards.map(d => (
                            <div
                                key={d.id}
                                onClick={() => { setActiveDash(d); setSelectedWidgetId(null); }}
                                className={`px-3 py-2.5 rounded cursor-pointer text-[12px] transition-colors flex items-center group ${activeDash?.id === d.id ? 'bg-[#EBF1F5] border-[#137CBD] border-l-2 text-[#182026] font-bold shadow-sm' : 'border-l-2 border-transparent hover:bg-[#F5F8FA] text-[#5C7080] font-medium'}`}
                            >
                                <LayoutGrid size={14} className={`mr-2 ${activeDash?.id === d.id ? 'text-[#137CBD]' : 'opacity-50'}`} />
                                <span className="truncate">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CENTER WORKSPACE ── */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-[#CED9E0]">
                    {activeDash ? (
                        <>
                            {/* Header */}
                            <div className="h-12 bg-white border-b border-[#CED9E0] flex items-center justify-between px-6 z-10 shadow-sm shrink-0">
                                <input
                                    value={activeDash.name}
                                    onChange={e => setActiveDash({ ...activeDash, name: e.target.value })}
                                    className="bg-transparent text-[15px] font-bold outline-none border-b border-transparent focus:border-[#137CBD] transition-colors w-64 text-[#182026]"
                                />
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 text-[11px] font-bold bg-[#EBF1F5] hover:bg-[#D8E1E8] text-[#182026] px-3 py-1.5 rounded transition-colors shadow-sm border border-[#CED9E0]">
                                        <Play size={14} className="text-[#0F9960]" /> Preview App
                                    </button>
                                    <button onClick={handleSaveApp} disabled={saving} className="flex items-center gap-2 text-[11px] font-bold bg-[#137CBD] hover:bg-[#0E6694] text-white px-3 py-1.5 rounded transition-colors shadow-sm disabled:opacity-50">
                                        <Save size={14} /> {saving ? 'Saving...' : 'Publish'}
                                    </button>
                                </div>
                            </div>

                            {/* Widget Toolbar */}
                            <div className="h-12 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center px-4 gap-2 z-10 shrink-0 shadow-sm">
                                <span className="text-[10px] font-bold text-[#5C7080] uppercase tracking-widest mr-2">Widgets:</span>
                                <button onClick={() => handleAddWidget('TABLE')} className="text-[11px] flex items-center gap-1.5 bg-white hover:bg-[#EBF1F5] px-2.5 py-1.5 rounded text-[#182026] font-medium border border-[#CED9E0] shadow-sm transition-colors">
                                    <Table size={12} className="text-[#137CBD]" /> Object Table
                                </button>
                                <button onClick={() => handleAddWidget('AIP_AGENT')} className="text-[11px] flex items-center gap-1.5 bg-white hover:bg-[#EBF1F5] px-2.5 py-1.5 rounded text-[#182026] font-medium border border-[#CED9E0] shadow-sm transition-colors">
                                    <Bot size={12} className="text-[#8A2BE2]" /> AIP Chat Widget
                                </button>
                                <button onClick={() => handleAddWidget('CHART')} className="text-[11px] flex items-center gap-1.5 bg-white hover:bg-[#EBF1F5] px-2.5 py-1.5 rounded text-[#182026] font-medium border border-[#CED9E0] shadow-sm transition-colors">
                                    <LineChart size={12} className="text-[#5C7080]" /> Metric Chart <span className="text-[9px] bg-[#EBF1F5] text-[#5C7080] px-1 rounded ml-1">SOON</span>
                                </button>
                            </div>

                            {/* Canvas Background (Dot Grid) */}
                            <div className="flex-1 overflow-auto bg-[#EBF1F5] relative p-4 custom-scrollbar"
                                style={{ backgroundImage: 'radial-gradient(#CED9E0 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                                onClick={(e) => { if (e.target === e.currentTarget) setSelectedWidgetId(null); }}
                            >
                                <ResponsiveGridLayout
                                    className="layout"
                                    layouts={{ lg: activeDash.layout }}
                                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                                    rowHeight={60}
                                    onLayoutChange={onLayoutChange}
                                    draggableHandle=".widget-drag-handle"
                                >
                                    {activeDash.widgets.map(w => {
                                        const isSelected = w.id === selectedWidgetId;
                                        return (
                                            <div
                                                key={w.id}
                                                className={`bg-white rounded shadow-sm border ${isSelected ? 'border-[#137CBD] ring-1 ring-[#137CBD]' : 'border-[#CED9E0]'} flex flex-col overflow-hidden bg-white/95 backdrop-blur`}
                                                onClick={(e) => { e.stopPropagation(); setSelectedWidgetId(w.id); }}
                                            >
                                                {/* Widget Header (Drag Handle) */}
                                                <div className="widget-drag-handle h-8 bg-[#F5F8FA] border-b border-[#CED9E0] flex items-center justify-between px-3 cursor-move shrink-0">
                                                    <span className="text-[11px] font-bold text-[#5C7080] flex items-center gap-1.5">
                                                        {w.type === 'TABLE' && <><Table size={12} /> Object Table</>}
                                                        {w.type === 'AIP_AGENT' && <><Bot size={12} className="text-[#8A2BE2]" /> AIP Chat</>}
                                                        {w.type === 'CHART' && <><LineChart size={12} /> Chart</>}
                                                    </span>
                                                    {isSelected && (
                                                        <button
                                                            className="text-[#C23030] hover:bg-[#F3D7D7] p-1 rounded transition-colors"
                                                            onClick={(e) => { e.stopPropagation(); handleRemoveWidget(w.id); }}
                                                            title="Delete Widget"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Widget Content Inner */}
                                                <div className="flex-1 overflow-hidden relative">
                                                    {w.type === 'TABLE' && <ObjectTableWidget entityTypeId={w.configData.entityTypeId} />}
                                                    {w.type === 'AIP_AGENT' && <AIPChatWidget agentId={w.configData.agentId} />}
                                                    {w.type === 'CHART' && (
                                                        <div className="absolute inset-0 flex items-center justify-center text-[#5C7080] text-[12px] bg-white">Pie/Line Charts coming soon in V2</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </ResponsiveGridLayout>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-[#5C7080]">
                            <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-[14px]">Select or create an application to begin.</p>
                        </div>
                    )}
                </div>

                {/* ── RIGHT SIDEBAR (Configuration) ── */}
                <div className="w-72 bg-white flex flex-col shrink-0">
                    <div className="h-12 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center px-4 shrink-0 shadow-sm relative z-0">
                        <span className="text-[12px] font-bold text-[#182026] flex items-center gap-2"><Settings size={14} className="text-[#5C7080]" /> Properties Panel</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {!selectedWidget ? (
                            <div className="text-[12px] text-[#5C7080] text-center mt-10">
                                Click on a widget in the canvas to configure it.
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#5C7080] uppercase tracking-wider mb-2">Widget Type</label>
                                    <div className="text-[13px] font-medium text-[#182026] bg-[#F5F8FA] px-3 py-2 border border-[#CED9E0] rounded">{selectedWidget.type}</div>
                                </div>

                                {/* Dynamic Config Editors */}
                                {selectedWidget.type === 'TABLE' && (
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#5C7080] uppercase tracking-wider mb-2">Select Object Type</label>
                                        <select
                                            value={selectedWidget.configData.entityTypeId || ""}
                                            onChange={(e) => updateWidgetConfig(selectedWidget.id, { ...selectedWidget.configData, entityTypeId: e.target.value })}
                                            className="w-full text-[13px] p-2 bg-white border border-[#CED9E0] rounded focus:outline-none focus:border-[#137CBD] focus:ring-1 focus:ring-[#137CBD]"
                                        >
                                            <option value="">-- Choose Data Model --</option>
                                            {entityTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {selectedWidget.type === 'AIP_AGENT' && (
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#5C7080] uppercase tracking-wider mb-2">Select AI Agent</label>
                                        <select
                                            value={selectedWidget.configData.agentId || ""}
                                            onChange={(e) => updateWidgetConfig(selectedWidget.id, { ...selectedWidget.configData, agentId: e.target.value })}
                                            className="w-full text-[13px] p-2 bg-white border border-[#CED9E0] rounded focus:outline-none focus:border-[#137CBD] focus:ring-1 focus:ring-[#137CBD]"
                                        >
                                            <option value="">-- Choose Assistant --</option>
                                            {agents.map(ag => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
                                        </select>
                                        <p className="text-[10px] text-[#5C7080] mt-2">
                                            The chat widget will seamlessly embed this agent into your Dashboard UI, retaining all of its Ontology access privileges.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
