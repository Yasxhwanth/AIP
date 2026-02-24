"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Layout } from "react-grid-layout";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useWorkspaceStore } from "@/store/workspace";
import {
    Network,
    Map as MapIcon,
    Activity,
    Database,
    MessageSquare,
    Plus,
    Save,
    Trash2,
    ChevronRight,
    MonitorPlay
} from "lucide-react";

// Mock Widget Components (Would be extracted in real app)
const TelemetryWidget = () => (
    <div className="w-full h-full flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-2"><Activity className="w-3 h-3 text-blue-500" /> Pump-001 Pressure</span>
        </div>
        <div className="flex-1 p-4 bg-dots flex items-center justify-center text-slate-400">
            [Telemetry Chart UI]
        </div>
    </div>
);

const OntologyWidget = () => (
    <div className="w-full h-full flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-2"><Network className="w-3 h-3 text-purple-500" /> Ontology Graph</span>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center text-slate-400">
            [React Flow Graph UI]
        </div>
    </div>
);

const MapWidget = () => (
    <div className="w-full h-full flex flex-col bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-sm">
        <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 flex items-center justify-between text-slate-300">
            <span className="text-xs font-bold flex items-center gap-2"><MapIcon className="w-3 h-3 text-emerald-500" /> GeoExplorer</span>
        </div>
        <div className="flex-1 bg-[url('https://maps.wikimedia.org/osm-intl/12/1209/1539.png')] bg-cover bg-center opacity-70">
        </div>
    </div>
);

const CopilotWidget = () => (
    <div className="w-full h-full flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-3 py-2 bg-blue-600 text-white flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-2"><MessageSquare className="w-3 h-3" /> AIP Assist</span>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-end text-sm">
            <div className="bg-blue-50 text-blue-800 p-2 rounded-lg mb-2 self-start max-w-[80%]">How can I help you analyze this workspace?</div>
            <div className="bg-slate-100 text-slate-600 p-2 rounded-lg mt-auto flex items-center justify-between cursor-text">
                Ask a question...
            </div>
        </div>
    </div>
);

const KernalWidget = () => (
    <div className="w-full h-full flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(249,115,22,0.1)]">
        <div className="px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-2"><Database className="w-3 h-3" /> Kernal Data Ingest</span>
        </div>
        <div className="flex-1 p-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 m-2 rounded bg-slate-50 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-colors">
            <Database className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-500">Drop CSV/JSON to build Nodes</p>
        </div>
    </div>
);


const ResponsiveGridLayout: any = dynamic(
    async () => {
        const mod: any = await import("react-grid-layout");

        // ReactGridLayout >=1.5 exports components directly, sometimes wrapped under default
        const Responsive = mod.Responsive || mod.default?.Responsive;
        const WidthProvider = mod.WidthProvider || mod.default?.WidthProvider;

        if (!Responsive && !WidthProvider) {
            // Fallback: no grid available, render a passthrough container
            return (props: any) => <div {...props} />;
        }

        if (Responsive && typeof WidthProvider !== "function") {
            // Library may already export a responsive layout component, no HOC needed
            return Responsive;
        }

        if (Responsive && typeof WidthProvider === "function") {
            return WidthProvider(Responsive);
        }

        // Last resort fallback
        return (props: any) => <div {...props} />;
    },
    { ssr: false }
);

export default function WorkshopCanvas() {
    const { activeProjectId, activeProjectName } = useWorkspaceStore();

    // Widget Type Registry
    const WIDGET_TYPES = [
        { type: 'telemetry', name: 'Telemetry Chart', icon: <Activity className="w-4 h-4" />, defaultW: 4, defaultH: 3 },
        { type: 'ontology', name: 'Graph Explorer', icon: <Network className="w-4 h-4" />, defaultW: 6, defaultH: 4 },
        { type: 'map', name: '3D Geo Map', icon: <MapIcon className="w-4 h-4" />, defaultW: 6, defaultH: 4 },
        { type: 'copilot', name: 'AIP Agent Chat', icon: <MessageSquare className="w-4 h-4" />, defaultW: 3, defaultH: 4 },
        { type: 'kernal', name: 'Data Pipeline (Kernal)', icon: <Database className="w-4 h-4" />, defaultW: 4, defaultH: 3 }
    ];

    const [layout, setLayout] = useState<any[]>([]);
    const [widgets, setWidgets] = useState<any[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Load saved layout for workspace
    useEffect(() => {
        if (!activeProjectId) return;
        fetch(`http://localhost:3001/dashboards?projectId=${activeProjectId}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    // we'd parse this in a fully implemented backend, for demo we start fresh or load
                }
            })
            .catch(console.error);
    }, [activeProjectId]);

    const addWidget = (widgetType: string) => {
        const config = WIDGET_TYPES.find(w => w.type === widgetType);
        if (!config) return;

        const newId = `${widgetType}-${Date.now()}`;
        const newItem: any = {
            i: newId,
            x: (layout.length * 2) % 12,
            y: Infinity, // puts it at the bottom
            w: config.defaultW,
            h: config.defaultH,
        };

        setWidgets([...widgets, { i: newId, type: widgetType }]);
        setLayout([...layout, newItem]);
    };

    const removeWidget = (idToRemove: string) => {
        setLayout(layout.filter(l => l.i !== idToRemove));
        setWidgets(widgets.filter(w => w.i !== idToRemove));
    };

    const onLayoutChange = (newLayout: any[]) => {
        setLayout(newLayout);
    };

    const saveDashboard = async () => {
        // Example Save Payload to backend
        console.log("Saving layout:", layout, widgets);
        alert("Dashboard Layout Saved parameters logged to console.");
    };

    const renderWidgetContent = (type: string) => {
        switch (type) {
            case 'telemetry': return <TelemetryWidget />;
            case 'ontology': return <OntologyWidget />;
            case 'map': return <MapWidget />;
            case 'copilot': return <CopilotWidget />;
            case 'kernal': return <KernalWidget />;
            default: return <div>Unknown Widget</div>;
        }
    };

    return (
        <div className="flex h-full w-full bg-[#e8ebee]">

            {/* Workshop Canvas Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header Bar */}
                <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <MonitorPlay className="w-5 h-5 text-blue-600" />
                        <h1 className="font-bold text-slate-800 text-lg">Workshop Canvas</h1>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-500 ml-2 border border-slate-200">
                            {activeProjectName}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={saveDashboard}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-sm font-semibold flex items-center gap-2 transition-colors"
                        >
                            <Save className="w-4 h-4" /> Save App
                        </button>
                    </div>
                </div>

                {/* The Grid Canvas */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {layout.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50">
                            <MonitorPlay className="w-16 h-16 text-slate-400 mb-4" />
                            <h2 className="text-xl font-bold text-slate-500">Empty Canvas</h2>
                            <p className="text-slate-400">Drag widgets from the library panel to build your application.</p>
                        </div>
                    )}
                    <ResponsiveGridLayout
                        className="layout min-h-[500px]"
                        layouts={{ lg: layout }}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        rowHeight={60}
                        onLayoutChange={onLayoutChange}
                        draggableHandle=".drag-handle"
                        isDroppable={true}
                        margin={[16, 16]}
                    >
                        {layout.map(l => {
                            const wType = widgets.find(w => w.i === l.i)?.type;
                            return (
                                <div key={l.i} className="group relative">
                                    {/* Drag Handle Overlay */}
                                    <div className="drag-handle absolute top-0 left-0 right-0 h-8 z-10 cursor-move opacity-0 group-hover:opacity-100 bg-gradient-to-b from-black/10 to-transparent transition-opacity"></div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => removeWidget(l.i)}
                                        className="absolute top-2 right-2 z-20 w-6 h-6 bg-white rounded shadow text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>

                                    {renderWidgetContent(wType || '')}
                                </div>
                            );
                        })}
                    </ResponsiveGridLayout>
                </div>
            </div>

            {/* Right Sidebar: Widget Library (The "Palantir" Palette) */}
            <div className={`w-72 bg-white border-l border-slate-200 flex flex-col transition-all overflow-hidden ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full absolute right-0'}`}>
                <div className="h-14 border-b border-slate-200 flex items-center px-4 shrink-0 bg-slate-50">
                    <h2 className="font-bold text-slate-700 text-sm">Widget Library</h2>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-3">
                    <p className="text-xs text-slate-500 mb-4">Click to add interactive modules to the current dashboard grid.</p>

                    {WIDGET_TYPES.map(w => (
                        <div
                            key={w.type}
                            onClick={() => addWidget(w.type)}
                            className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-md hover:bg-blue-50 cursor-pointer transition-all group"
                        >
                            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-100 transition-colors mr-3 shrink-0">
                                {w.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">{w.name}</h3>
                            </div>
                            <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
