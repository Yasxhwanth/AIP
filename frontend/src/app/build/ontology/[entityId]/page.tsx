"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useBuilderStore } from "@/store/builderStore";
import {
    Clock, ChevronLeft, Search, Edit2, Plus, List,
    MoreHorizontal, Calendar, Hash, Quote, Check,
    Table, Plane, Navigation, CheckCircle2, Hexagon,
    Settings, Database, Network, Key
} from "lucide-react";

export default function OntologyManager() {
    const params = useParams();
    const router = useRouter();
    const entityId = params.entityId as string;

    const { entityTypes, updateEntityType, pipelineNodes } = useBuilderStore();
    const entity = entityTypes.find(e => e.id === entityId);

    const [selectedPropId, setSelectedPropId] = useState<string | null>(
        entity?.properties[0]?.id || null
    );

    // If entity doesn't exist, early return or redirect
    if (!entity) {
        return (
            <div className="flex flex-col h-full items-center justify-center bg-[#F5F8FA] w-full text-center">
                <Database className="w-10 h-10 text-[#5C7080] mb-4 opacity-50" />
                <h2 className="text-[16px] font-bold text-[#182026] mb-2">Entity Not Found</h2>
                <p className="text-[13px] text-[#5C7080] mb-4">The requested ontology object ({entityId}) does not exist.</p>
                <Link href="/build/ontology" className="px-4 py-2 bg-[#137CBD] hover:bg-[#106BA3] text-white rounded font-bold text-[13px] shadow-sm">
                    Return to Ontology Builder
                </Link>
            </div>
        );
    }

    const selectedProp = entity.properties.find(p => p.id === selectedPropId);

    const sourceDataset = pipelineNodes.find(n => n.id === entity.sourceDatasetId);

    // Mock source columns based on the entity's sourceDatasetId
    const sourceCols = useMemo(() => {
        if (!sourceDataset) {
            return entity?.properties.map(p => ({
                id: `col_${p.name.toLowerCase().replace(/\s+/g, '_')}`,
                name: p.name.toLowerCase().replace(/\s+/g, '_'),
                targetId: p.id
            })) || [];
        }
        return [
            { id: 'battery_pct', name: 'battery_pct', targetId: 'p1' },
            { id: 'status', name: 'status', targetId: 'p2' },
            { id: 'lat_long', name: 'lat_long', targetId: 'p3' },
            { id: 'drone_id', name: 'drone_id', targetId: null },
            { id: 'last_maintenance', name: 'last_maintenance', targetId: null }
        ];
    }, [sourceDataset, entity]);

    // Graph drawing state
    const sourceRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const targetRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [points, setPoints] = useState<{ source: Record<string, { x: number, y: number }>, target: Record<string, { x: number, y: number }> }>({ source: {}, target: {} });
    const [drawingLine, setDrawingLine] = useState<{ sourceColId: string } | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const updatePoints = useCallback(() => {
        const newPoints = { source: {} as any, target: {} as any };
        Object.entries(sourceRefs.current).forEach(([id, el]) => {
            if (el) {
                const rect = el.getBoundingClientRect();
                newPoints.source[id] = { x: rect.right, y: rect.top + rect.height / 2 };
            }
        });
        Object.entries(targetRefs.current).forEach(([id, el]) => {
            if (el) {
                const rect = el.getBoundingClientRect();
                newPoints.target[id] = { x: rect.left, y: rect.top + rect.height / 2 };
            }
        });
        setPoints(newPoints);
    }, []);

    useEffect(() => {
        const timer = setTimeout(updatePoints, 50);
        window.addEventListener('resize', updatePoints);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePoints);
        };
    }, [updatePoints, entity, sourceCols]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (drawingLine) setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUpGlobal = () => {
        if (drawingLine) setDrawingLine(null);
    };

    const handleUpdateProperty = (propId: string, updates: Partial<typeof entity.properties[0]>) => {
        const updatedProps = entity.properties.map(p =>
            p.id === propId ? { ...p, ...updates } : p
        );
        updateEntityType(entity.id, { properties: updatedProps });
    };

    const handleAddProperty = () => {
        const newProp = {
            id: `p-${Date.now()}`,
            name: `new_property_${entity.properties.length + 1}`,
            type: 'string' as const,
            required: false,
            indexed: false
        };
        updateEntityType(entity.id, { properties: [...entity.properties, newProp] });
        setSelectedPropId(newProp.id);
    };

    return (
        <div
            className="flex flex-col h-full w-full bg-white text-[#182026] text-[13px] relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpGlobal}
        >

            {/* Top Navigation Bar Component (Archetypes / Ontology Tabs) */}
            <div className="h-14 border-b border-[#CED9E0] flex items-center justify-between px-4 shrink-0 bg-white shadow-sm z-20">
                <div className="flex items-center gap-6 h-full">
                    <Hexagon className="w-6 h-6 text-[#137CBD] fill-blue-500/10" />
                    <div className="flex gap-2 h-full items-center text-[13px] font-bold">
                        <button className="text-[#5C7080] hover:text-[#182026] transition-colors h-full px-2">Archetypes</button>
                        <button className="bg-[#EBF1F5] text-[#137CBD] h-8 px-3 rounded border border-[#CED9E0] shadow-sm flex items-center">Ontology</button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-[#5C7080] hover:bg-[#F5F8FA] rounded font-bold transition-colors">
                        <Clock className="w-4 h-4" /> History
                    </button>
                    <div className="w-px h-5 bg-[#CED9E0]" />
                    <button className="px-4 py-1.5 bg-[#F5F8FA] border border-[#CED9E0] rounded hover:bg-[#E4E8ED] text-[#5C7080] font-bold transition-colors shadow-sm">
                        Discard
                    </button>
                    <button className="px-4 py-1.5 bg-[#0F9960] hover:bg-[#0A6640] text-white rounded font-bold shadow-sm transition-colors">
                        Save
                    </button>
                </div>
            </div>

            {/* Sub-header Context Bar */}
            <div className="h-12 bg-white border-b border-[#CED9E0] flex items-center px-4 shrink-0 z-20 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                <Link href="/build/ontology" className="flex items-center gap-1 text-[#5C7080] hover:text-[#182026] font-bold transition-colors bg-white border border-[#CED9E0] px-3 py-1 rounded shadow-sm hover:bg-[#F5F8FA]">
                    <ChevronLeft className="w-4 h-4" /> Back
                </Link>
                <div className="w-px h-5 bg-[#CED9E0] mx-3" />
                <span className="text-[#5C7080] font-bold mr-2">Properties of</span>
                <div className="bg-[#0BB68F] w-6 h-6 rounded flex items-center justify-center mr-2 shadow-sm">
                    {entity.icon === 'Plane' ? <Plane className="w-4 h-4 text-white fill-current" /> : <Database className="w-4 h-4 text-white" />}
                </div>
                <span className="font-bold text-[#182026]">[Example Data] {entity.name}</span>
            </div>

            {/* Main Workspace (3 columns + bottom bar) */}
            <div className="flex-1 flex min-h-0 bg-[#F5F8FA] relative overflow-hidden">

                {/* Visual SVG Path connecting the mapped columns */}
                <svg className="fixed inset-0 w-full h-full pointer-events-none z-[60]">
                    {/* Draw existing mappings */}
                    {entity?.sourceColumnMapping && Object.entries(entity.sourceColumnMapping).map(([propId, colId]) => {
                        const start = points.source[colId];
                        const end = points.target[propId];
                        if (!start || !end) return null;

                        const isSelected = selectedPropId === propId;
                        return (
                            <path
                                key={`${colId}-${propId}`}
                                d={`M ${start.x} ${start.y} C ${start.x + 60} ${start.y}, ${end.x - 60} ${end.y}, ${end.x} ${end.y}`}
                                fill="none"
                                stroke={isSelected ? "#137CBD" : "#CED9E0"}
                                strokeWidth={isSelected ? "3" : "2"}
                                className="transition-all duration-300"
                            />
                        );
                    })}

                    {/* Draw active line */}
                    {drawingLine && points.source[drawingLine.sourceColId] && (
                        <path
                            d={`M ${points.source[drawingLine.sourceColId].x} ${points.source[drawingLine.sourceColId].y} C ${points.source[drawingLine.sourceColId].x + 60} ${points.source[drawingLine.sourceColId].y}, ${mousePos.x - 60} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
                            fill="none"
                            stroke="#137CBD"
                            strokeWidth="3"
                            strokeDasharray="4 4"
                        />
                    )}
                </svg>

                {/* Container for Columns */}
                <div
                    className="flex-1 flex justify-center py-8 gap-24 overflow-y-auto w-full relative z-20 pb-24"
                    onScroll={updatePoints}
                    ref={containerRef}
                >

                    {/* Column 1: Source Dataset */}
                    <div className="w-[300px] bg-white border border-[#CED9E0] rounded shadow-sm flex flex-col h-max mt-[40px]">
                        <div className="flex items-center justify-between p-3 border-b border-[#CED9E0]">
                            <div className="flex items-center gap-2 font-bold text-[#137CBD] text-[12px] uppercase tracking-wide">
                                <Table className="w-4 h-4" /> {entity.name.toLowerCase()}_source
                            </div>
                            <div className="flex items-center gap-2 text-[#5C7080]">
                                <Edit2 className="w-3.5 h-3.5 hover:text-[#182026] cursor-pointer" />
                                <Search className="w-3.5 h-3.5 hover:text-[#182026] cursor-pointer" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            {sourceCols.map(col => {
                                const isSelected = col.targetId === selectedPropId;
                                return (
                                    <div key={col.id} className="flex items-center justify-between py-2.5 px-3 hover:bg-[#F5F8FA] border-b border-[#CED9E0]/50 group">
                                        <span className={`font-mono text-[12px] truncate pr-2 ${isSelected ? 'text-[#182026] font-bold' : 'text-[#5C7080]'}`}>{col.name}</span>
                                        {/* Link Anchor */}
                                        <div
                                            ref={el => { sourceRefs.current[col.id] = el; }}
                                            onMouseDown={(e) => {
                                                setDrawingLine({ sourceColId: col.id });
                                                setMousePos({ x: e.clientX, y: e.clientY });
                                                e.preventDefault();
                                            }}
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors cursor-crosshair
                                            ${isSelected ? 'border-[#137CBD] bg-blue-50' : 'border-[#CED9E0] bg-[#F5F8FA] hover:border-[#137CBD]'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#137CBD]' : 'bg-[#CED9E0]'}`} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Column 2: Ontology Properties Builder */}
                    <div className="w-[380px] bg-white border border-[#CED9E0] rounded shadow-lg flex flex-col h-max relative z-20">
                        {/* Header Content */}
                        <div className="p-4 border-b border-[#CED9E0] flex justify-between items-start">
                            <div className="flex items-start gap-3">
                                <div className="bg-[#0BB68F] w-10 h-10 rounded flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                                    {entity.icon === 'Plane' ? <Plane className="w-5 h-5 text-white fill-current" /> : <Database className="w-5 h-5 text-white" />}
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-[16px] font-black text-[#182026] mb-0.5 leading-tight flex items-center gap-1.5">
                                        [Example Data] {entity.name}
                                    </h2>
                                    <div className="flex items-center gap-1.5 text-[11px] text-[#5C7080] font-bold">
                                        <div className="bg-[#182026] text-white rounded px-1 flex items-center gap-1">
                                            <CheckCircle2 className="w-2.5 h-2.5" /> <ChevronLeft className="w-3 h-3 -ml-1 -rotate-90" />
                                        </div>
                                        7,284 objects
                                    </div>
                                </div>
                            </div>
                            <MoreHorizontal className="w-5 h-5 text-[#5C7080] hover:text-[#182026] cursor-pointer" />
                        </div>

                        {/* List sub-header */}
                        <div className="px-3 py-2 border-b border-[#CED9E0] flex items-center justify-between bg-[#F5F8FA]">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-[#5C7080] uppercase tracking-wider">
                                <List className="w-4 h-4" /> PROPERTIES ({entity.properties.length})
                            </div>
                            <div className="flex items-center gap-3 text-[#182026] font-bold">
                                <button onClick={handleAddProperty} className="flex items-center gap-1 text-[#137CBD] hover:underline"><Plus className="w-3.5 h-3.5" /> Add</button>
                                <button className="text-[#5C7080] hover:text-[#182026] transition-colors">Reset</button>
                            </div>
                        </div>

                        {/* Search Props */}
                        <div className="p-2 border-b border-[#CED9E0] flex items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C7080]" />
                                <input
                                    placeholder="Search properties..."
                                    className="w-full pl-8 pr-3 py-1.5 border border-[#CED9E0] rounded bg-white text-[12px] outline-none focus:border-[#137CBD] focus:ring-1 focus:ring-[#137CBD]/30 shadow-sm"
                                />
                            </div>
                            <button className="p-1.5 ml-1 text-[#5C7080] hover:bg-[#F5F8FA] rounded"><List className="w-4 h-4" /></button>
                        </div>

                        {/* Property List */}
                        <div className="flex flex-col pb-2">
                            {entity.properties.map(prop => {
                                const isSelected = selectedPropId === prop.id;

                                // Map types to sensible icons
                                let Icon = Quote; // String
                                if (prop.type === 'number') Icon = Hash;
                                if (prop.type === 'datetime') Icon = Calendar;
                                if (prop.type === 'boolean') Icon = Check;
                                if (prop.indexed) Icon = Key;

                                return (
                                    <div
                                        key={prop.id}
                                        onClick={() => setSelectedPropId(prop.id)}
                                        className={`flex items-center gap-3 py-2 px-3 cursor-pointer group border-l-[3px]
                                            ${isSelected ? 'bg-[#137CBD] text-white border-[#137CBD]' : 'hover:bg-[#F5F8FA] text-[#182026] border-transparent'}
                                        `}
                                    >
                                        <div
                                            ref={el => { targetRefs.current[prop.id] = el; }}
                                            onMouseUp={(e) => {
                                                if (drawingLine) {
                                                    const newMapping = { ...(entity.sourceColumnMapping || {}) };
                                                    newMapping[prop.id] = drawingLine.sourceColId;
                                                    updateEntityType(entity.id, { sourceColumnMapping: newMapping });
                                                    setDrawingLine(null);
                                                }
                                            }}
                                            onClick={(e) => {
                                                if (!drawingLine && entity.sourceColumnMapping?.[prop.id]) {
                                                    const newMapping = { ...entity.sourceColumnMapping };
                                                    delete newMapping[prop.id];
                                                    updateEntityType(entity.id, { sourceColumnMapping: newMapping });
                                                    e.stopPropagation();
                                                }
                                            }}
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 bg-white cursor-pointer z-50
                                            ${isSelected ? 'border-none' : 'border-[#CED9E0] group-hover:border-[#5C7080]'}
                                        `}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#CED9E0]'}`} />
                                        </div>
                                        <div className={`flex items-center gap-2 flex-1 ${isSelected ? 'opacity-100' : 'text-[#5C7080]'}`}>
                                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#5C7080]'}`} />
                                            <span className={`font-bold ${isSelected ? 'text-white' : 'text-[#182026]'}`}>{prop.name}</span>
                                        </div>
                                        {prop.required && <Navigation className={`w-3 h-3 transform rotate-90 ${isSelected ? 'text-white fill-white opacity-80' : 'text-[#5C7080] fill-[#5C7080]'}`} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Column 3: Property Inspector (Anchored Right) */}
                <div className="w-[320px] shrink-0 bg-[#F5F8FA] border-l border-[#CED9E0] shadow-[-4px_0_15px_rgba(0,0,0,0.03)] flex flex-col h-full absolute right-0 top-0 overflow-y-auto z-30">
                    {selectedProp ? (
                        <div className="p-5 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#5C7080] uppercase tracking-wider block">Property ID</label>
                                <div className="bg-[#EBF1F5] px-3 py-2 rounded text-[#182026] font-mono text-[11px] border border-[#CED9E0] shadow-inner">
                                    {selectedProp.id}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#5C7080] uppercase tracking-wider block flex items-center justify-between">
                                    Display Name
                                    <span className="text-[#137CBD] text-[9px] hover:underline cursor-pointer">Auto-generate</span>
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-white border border-[#CED9E0] rounded px-3 py-1.5 text-[12px] text-[#182026] font-bold outline-none focus:border-[#137CBD] focus:ring-1 focus:ring-[#137CBD]/30 shadow-sm"
                                        value={selectedProp.name}
                                        onChange={(e) => handleUpdateProperty(selectedProp.id, { name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#5C7080] uppercase tracking-wider block">Base Type</label>
                                <select
                                    className="w-full bg-white border border-[#CED9E0] rounded px-3 py-1.5 text-[12px] text-[#182026] outline-none focus:border-[#137CBD] shadow-sm"
                                    value={selectedProp.type}
                                    onChange={(e) => handleUpdateProperty(selectedProp.id, { type: e.target.value as any })}
                                >
                                    <option value="string">String</option>
                                    <option value="number">Number</option>
                                    <option value="boolean">Boolean</option>
                                    <option value="datetime">Date Time</option>
                                    <option value="timestamp">Timestamp</option>
                                    <option value="array">Array</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-[#5C7080] uppercase tracking-wider block">Description</label>
                                <textarea
                                    placeholder="Add a description for schema documentation..."
                                    className="w-full bg-white border border-[#CED9E0] rounded px-3 py-2 text-[12px] text-[#182026] outline-none focus:border-[#137CBD] min-h-[80px] shadow-sm resize-none"
                                />
                            </div>

                            <div className="space-y-2 pt-2 border-t border-[#CED9E0] border-dashed">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded border-[#CED9E0] text-[#137CBD] focus:ring-[#137CBD]"
                                        checked={selectedProp.required || false}
                                        onChange={(e) => handleUpdateProperty(selectedProp.id, { required: e.target.checked })}
                                    />
                                    <span className="text-[12px] text-[#182026] font-medium">Required property</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded border-[#CED9E0] text-[#137CBD] focus:ring-[#137CBD]"
                                        checked={selectedProp.indexed || false}
                                        onChange={(e) => handleUpdateProperty(selectedProp.id, { indexed: e.target.checked })}
                                    />
                                    <span className="text-[12px] text-[#182026] font-medium">Indexed for search</span>
                                </label>
                            </div>

                            <div className="space-y-1.5 pt-4">
                                <label className="text-[10px] font-bold text-[#5C7080] uppercase tracking-wider block">Resource Identifier (RID)</label>
                                <div className="text-[10px] font-mono text-[#5C7080] w-full truncate bg-[#F5F8FA] border border-[#CED9E0] p-1.5 rounded selection:bg-[#EBF1F5]">
                                    ri.ontology.main.property.{selectedProp.id}
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-4 border-t border-[#CED9E0] border-dashed">
                                <label className="text-[10px] font-bold text-[#5C7080] uppercase tracking-wider block">Status</label>
                                <select className="bg-white border border-[#CED9E0] rounded px-2 py-1.5 text-[12px] text-[#182026] font-bold outline-none focus:border-[#137CBD] w-full max-w-[140px] shadow-sm">
                                    <option>Active</option>
                                    <option>Deprecated</option>
                                    <option>Hidden</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-6 h-full text-center">
                            <List className="w-8 h-8 text-[#CED9E0] mb-3" />
                            <p className="text-[13px] font-bold text-[#5C7080]">No Property Selected</p>
                            <p className="text-[11px] text-[#5C7080] mt-1">Select a property from the middle column to edit its metadata.</p>
                        </div>
                    )}
                </div>

                {/* Bottom Overlay Bar ("Activate -> Ontology Manager") */}
                <div className="absolute bottom-0 left-0 right-[320px] h-[52px] bg-white border-t border-[#CED9E0] flex items-center justify-between px-6 z-40">
                    <div className="flex items-center text-[18px] tracking-tight">
                        <span className="font-light text-[#182026]">Activate</span>
                        <ChevronLeft className="w-4 h-4 mx-1.5 -rotate-180 text-[#5C7080]" strokeWidth={1.5} />
                        <span className="font-light text-[#5C7080]">Ontology Manager</span>
                    </div>
                    <div className="w-8 h-8 bg-[#182026] rounded flex items-center justify-center shadow-sm">
                        <Hexagon className="w-4 h-4 text-white shrink-0" strokeWidth={2} />
                    </div>
                </div>

            </div>
        </div>
    );
}
