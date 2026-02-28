"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Network, Search, Plus, Loader2, Share2, Wand2, X,
    Database, Clock, Shield, Activity, ChevronDown,
    CheckCircle2, BrainCircuit, Zap, Truck, Users,
    ShoppingCart, MapPin, AlertTriangle, Box, ArrowRight
} from "lucide-react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, Edge, Node, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { ApiClient } from "@/lib/apiClient";
import * as T from '@/lib/types';

// ── Hardcoded Ontology ────────────────────────────────────────────────────────
const HARDCODED_ENTITY_TYPES = [
    { id: "et-fleet", name: "FleetAsset", icon: Truck, color: "text-cyan-400", instances: 4521, source: "Fleet SCADA System", attributes: [{ name: "assetId", dataType: "STRING", required: true }, { name: "fuelLevel", dataType: "NUMBER", required: false }, { name: "status", dataType: "STRING", required: true }, { name: "location", dataType: "STRING", required: false }, { name: "lastService", dataType: "DATETIME", required: false }] },
    { id: "et-supplier", name: "Supplier", icon: ShoppingCart, color: "text-violet-400", instances: 1204, source: "Supplier Portal API", attributes: [{ name: "supplierId", dataType: "STRING", required: true }, { name: "riskScore", dataType: "NUMBER", required: false }, { name: "leadTimeDays", dataType: "NUMBER", required: false }, { name: "country", dataType: "STRING", required: false }] },
    { id: "et-employee", name: "Employee", icon: Users, color: "text-emerald-400", instances: 892, source: "Employee HR Dataset", attributes: [{ name: "employeeId", dataType: "STRING", required: true }, { name: "department", dataType: "STRING", required: false }, { name: "role", dataType: "STRING", required: false }, { name: "startDate", dataType: "DATETIME", required: false }] },
    { id: "et-location", name: "Location", icon: MapPin, color: "text-amber-400", instances: 47, source: "Multiple", attributes: [{ name: "locationId", dataType: "STRING", required: true }, { name: "latitude", dataType: "NUMBER", required: false }, { name: "longitude", dataType: "NUMBER", required: false }, { name: "type", dataType: "STRING", required: false }] },
    { id: "et-workorder", name: "WorkOrder", icon: AlertTriangle, color: "text-orange-400", instances: 321, source: "Fleet SCADA System", attributes: [{ name: "orderId", dataType: "STRING", required: true }, { name: "priority", dataType: "STRING", required: false }, { name: "status", dataType: "STRING", required: false }, { name: "dueDate", dataType: "DATETIME", required: false }] },
    { id: "et-customer", name: "Customer", icon: Users, color: "text-pink-400", instances: 31590, source: "Customer CRM Export", attributes: [{ name: "customerId", dataType: "STRING", required: true }, { name: "segment", dataType: "STRING", required: false }, { name: "churnScore", dataType: "NUMBER", required: false }, { name: "ltv", dataType: "NUMBER", required: false }] },
];

const HARDCODED_RELATIONSHIPS = [
    { id: "r-1", name: "assignedTo", sourceId: "et-workorder", targetId: "et-employee" },
    { id: "r-2", name: "locatedAt", sourceId: "et-fleet", targetId: "et-location" },
    { id: "r-3", name: "suppliedBy", sourceId: "et-fleet", targetId: "et-supplier" },
    { id: "r-4", name: "worksAt", sourceId: "et-employee", targetId: "et-location" },
    { id: "r-5", name: "serviceFor", sourceId: "et-workorder", targetId: "et-fleet" },
];

// Training steps
const TRAIN_STEPS = [
    { label: "Snapshot Ontology Graph", done: false },
    { label: "Build Feature Vectors", done: false },
    { label: "Configure Model Architecture", done: false },
    { label: "Train & Validate", done: false },
    { label: "Deploy to Registry", done: false },
];

export default function OntologyBuilder() {
    const [entityTypes, setEntityTypes] = useState(HARDCODED_ENTITY_TYPES);
    const [selectedObj, setSelectedObj] = useState<any>(HARDCODED_ENTITY_TYPES[0]);
    const [activeTab, setActiveTab] = useState<'properties' | 'links' | 'graph' | 'sources'>('properties');
    const [loading, setLoading] = useState(false);

    // AI Inference
    const [showImportModal, setShowImportModal] = useState(false);
    const [importSample, setImportSample] = useState("");
    const [isInferring, setIsInferring] = useState(false);

    // Train AI
    const [showTrainModal, setShowTrainModal] = useState(false);
    const [trainStep, setTrainStep] = useState(-1);
    const [trainDone, setTrainDone] = useState(false);

    // React Flow
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const handleSelectObj = (obj: any) => {
        setSelectedObj(obj);
        setActiveTab('properties');
    };

    const startTraining = () => {
        setTrainStep(0);
        setTrainDone(false);
        let i = 0;
        const interval = setInterval(() => {
            setTrainStep(i + 1);
            i++;
            if (i >= TRAIN_STEPS.length) {
                clearInterval(interval);
                setTrainDone(true);
            }
        }, 900);
    };

    const buildGraph = useCallback(() => {
        const positions = [
            { x: 300, y: 50 }, { x: 50, y: 200 }, { x: 550, y: 200 },
            { x: 50, y: 380 }, { x: 300, y: 380 }, { x: 550, y: 380 }
        ];
        const newNodes: Node[] = HARDCODED_ENTITY_TYPES.map((et, i) => ({
            id: et.id,
            data: { label: et.name },
            position: positions[i] || { x: (i % 3) * 250 + 50, y: Math.floor(i / 3) * 180 + 50 },
            style: {
                background: selectedObj?.id === et.id ? '#1e293b' : '#0f172a',
                color: '#f1f5f9', border: selectedObj?.id === et.id ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '10px 20px', fontWeight: 600, fontSize: 12,
                boxShadow: selectedObj?.id === et.id ? '0 0 20px rgba(6,182,212,0.3)' : 'none'
            }
        }));
        const newEdges: Edge[] = HARDCODED_RELATIONSHIPS.map(rel => ({
            id: rel.id, source: rel.sourceId, target: rel.targetId, label: rel.name,
            animated: true, style: { stroke: '#334155', strokeWidth: 1.5 },
            labelStyle: { fill: '#64748b', fontWeight: 600, fontSize: 10 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#334155' }
        }));
        setNodes(newNodes); setEdges(newEdges);
    }, [selectedObj]);

    useEffect(() => {
        if (activeTab === 'graph') buildGraph();
        // Also try to augment with real entity types from backend
        ApiClient.get<T.EntityType[]>('/entity-types').then(data => {
            if (Array.isArray(data) && data.length > 0) {
                const mapped = data.map((et: any) => ({ ...et, icon: Box, color: "text-slate-400", instances: 0, source: "Backend", attributes: et.attributes || [] }));
                setEntityTypes(prev => {
                    const ids = new Set(prev.map(e => e.id));
                    return [...prev, ...mapped.filter((m: any) => !ids.has(m.id))];
                });
            }
        }).catch(() => { });
    }, [activeTab, buildGraph]);

    const handleInferSchema = async () => {
        if (!importSample) return;
        setIsInferring(true);
        try {
            const sample = JSON.parse(importSample);
            await ApiClient.post<any>('/api/v1/integration/infer-schema', { sample: Array.isArray(sample) ? sample : [sample], name: "Inferred_Type" });
            setShowImportModal(false); setImportSample("");
        } catch { alert("Failed to infer schema. Ensure valid JSON sample."); } finally { setIsInferring(false); }
    };

    const links = HARDCODED_RELATIONSHIPS.filter(r => r.sourceId === selectedObj?.id);
    const selectedSource = selectedObj ? HARDCODED_ENTITY_TYPES.find(e => e.id === selectedObj.id) : null;

    return (
        <div className="h-full w-full flex flex-col text-slate-200 border-t border-white/8" style={{ background: "linear-gradient(180deg,#070b14 0%,#050910 100%)" }}>

            {/* Top Action Bar */}
            <div className="h-12 border-b border-white/8 flex items-center justify-between px-4 shrink-0" style={{ background: "rgba(0,0,0,0.3)" }}>
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-indigo-500/15 text-indigo-400"><Network className="w-4 h-4" /></div>
                    <span className="text-sm font-semibold text-white">Ontology Manager</span>
                    <span className="text-white/20 mx-1">/</span>
                    <span className="text-sm font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{selectedObj?.name || "None"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowTrainModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 hover:border-purple-400/50 text-purple-300 text-xs font-bold rounded-lg transition-all">
                        <BrainCircuit className="w-3.5 h-3.5" /> Train AI on Ontology
                    </button>
                    <button onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 text-xs font-semibold rounded-lg transition-all">
                        <Wand2 className="w-3.5 h-3.5 text-purple-400" /> Create from Sample
                    </button>
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all">
                        <Plus className="w-3.5 h-3.5" /> New Object Type
                    </button>
                </div>
            </div>

            {/* AI Schema Inference Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#0E1623] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/8 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2"><Wand2 className="w-4 h-4 text-purple-400" />AI Schema Inference</h3>
                            <button onClick={() => setShowImportModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Paste JSON Sample Data</label>
                            <textarea className="w-full h-40 p-3 text-xs font-mono bg-black/30 border border-white/10 focus:border-purple-500/50 rounded-xl outline-none text-slate-300 resize-none"
                                placeholder='[{"id":"1","name":"Asset A","value":100}]' value={importSample} onChange={e => setImportSample(e.target.value)} />
                            <p className="mt-2 text-[10px] text-slate-600">AI will analyze the structure and infer types.</p>
                        </div>
                        <div className="px-5 py-4 border-t border-white/8 flex justify-end gap-3">
                            <button onClick={() => setShowImportModal(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-white">Cancel</button>
                            <button disabled={!importSample || isInferring} onClick={handleInferSchema}
                                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl disabled:opacity-50 flex items-center gap-2">
                                {isInferring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Infer Schema
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Train AI Modal */}
            {showTrainModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#0E1623] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/8 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-cyan-400" />Train AI on Ontology</h3>
                            <button onClick={() => { setShowTrainModal(false); setTrainStep(-1); setTrainDone(false); }} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-slate-400 mb-5">AI will use your ontology graph ({HARDCODED_ENTITY_TYPES.length} entity types, {HARDCODED_RELATIONSHIPS.length} relationships) to train a new context model.</p>
                            <div className="space-y-3">
                                {TRAIN_STEPS.map((s, i) => {
                                    const isDone = trainStep > i;
                                    const isActive = trainStep === i;
                                    return (
                                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive ? 'bg-cyan-500/10 border-cyan-500/30' : isDone ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-white/3 border-white/5'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-500 text-black' : isActive ? 'bg-cyan-500 text-black' : 'bg-white/10 text-slate-600'}`}>
                                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                                            </div>
                                            <span className={`text-sm font-semibold ${isDone ? 'text-emerald-400' : isActive ? 'text-cyan-300' : 'text-slate-600'}`}>{s.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {trainDone && (
                                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                                    <p className="text-emerald-400 font-bold text-sm">✓ Training Complete! Model added to registry.</p>
                                </div>
                            )}
                        </div>
                        <div className="px-5 py-4 border-t border-white/8 flex justify-end gap-3">
                            {!trainDone && trainStep === -1 && (
                                <button onClick={startTraining} className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20">
                                    <Zap className="w-4 h-4" /> Start Training
                                </button>
                            )}
                            {trainDone && (
                                <button onClick={() => { setShowTrainModal(false); setTrainStep(-1); setTrainDone(false); }} className="px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl">
                                    Done
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex min-h-0">
                {/* Left Panel: Entity Types */}
                <div className="w-56 border-r border-white/8 flex flex-col shrink-0" style={{ background: "rgba(0,0,0,0.2)" }}>
                    <div className="p-3 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Object Types</span>
                        <span className="text-[10px] text-slate-600">{entityTypes.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                        {entityTypes.map(et => {
                            const Icon = (et as any).icon || Box;
                            const color = (et as any).color || "text-slate-400";
                            const isSelected = selectedObj?.id === et.id;
                            return (
                                <div key={et.id} onClick={() => handleSelectObj(et)}
                                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-indigo-500/15 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'}`}>
                                    <Icon className={`w-3.5 h-3.5 ${isSelected ? color : 'text-slate-600'} shrink-0`} />
                                    <span className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-500'}`}>{et.name}</span>
                                    {(et as any).instances > 0 && (
                                        <span className="ml-auto text-[9px] font-bold text-slate-700">{((et as any).instances / 1000).toFixed(1)}k</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Panel */}
                <div className="flex-1 flex flex-col min-w-0">
                    {selectedObj && (
                        <>
                            {/* Object header + tabs */}
                            <div className="px-5 py-4 border-b border-white/8">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {(() => { const Icon = (selectedObj as any).icon || Box; const color = (selectedObj as any).color || "text-slate-400"; return <Icon className={`w-5 h-5 ${color}`} />; })()}
                                            <h1 className="text-xl font-bold text-white">{selectedObj.name}</h1>
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                            {(selectedObj as any).instances > 0 && <span className="flex items-center gap-1"><Database className="w-3 h-3" />{(selectedObj as any).instances?.toLocaleString()} instances</span>}
                                            {(selectedObj as any).source && <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{(selectedObj as any).source}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-4 border-b border-white/8">
                                    {(['properties', 'links', 'graph', 'sources'] as const).map(tab => (
                                        <button key={tab} onClick={() => setActiveTab(tab)}
                                            className={`pb-2 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors ${activeTab === tab ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
                                            {tab === 'sources' ? 'Data Sources' : tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-auto p-5">
                                {activeTab === 'properties' && (
                                    <div className="border border-white/8 rounded-xl overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="text-[10px] uppercase font-bold text-slate-500 border-b border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
                                                <tr><th className="px-4 py-2.5">Property</th><th className="px-4 py-2.5">Type</th><th className="px-4 py-2.5">Required</th></tr>
                                            </thead>
                                            <tbody className="text-sm divide-y divide-white/5">
                                                {(selectedObj.attributes || []).map((prop: any, i: number) => (
                                                    <tr key={`${prop.id || prop.name}-${i}`} className="hover:bg-white/2">
                                                        <td className="px-4 py-2.5 font-mono text-xs text-cyan-300">{prop.name}</td>
                                                        <td className="px-4 py-2.5 text-xs text-violet-300 font-mono">{prop.dataType}</td>
                                                        <td className="px-4 py-2.5 text-xs">
                                                            {prop.required ? <span className="text-emerald-400 font-semibold">Yes</span> : <span className="text-slate-600">No</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {activeTab === 'links' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {links.length === 0 ? (
                                            <div className="col-span-3 text-center py-12 text-slate-600 text-sm">No outgoing relationships defined.</div>
                                        ) : links.map(link => {
                                            const target = entityTypes.find(e => e.id === link.targetId);
                                            return (
                                                <div key={link.id} className="bg-white/3 border border-white/8 rounded-xl p-4 border-l-4 border-l-indigo-500/40">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Network className="w-4 h-4 text-indigo-400" />
                                                        <span className="font-bold text-sm text-white">{link.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <ArrowRight className="w-3 h-3" />
                                                        <span>{target?.name || 'Unknown'}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {activeTab === 'graph' && (
                                    <div className="h-[480px] w-full border border-white/8 rounded-xl overflow-hidden">
                                        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
                                            <Background color="#1e293b" gap={24} />
                                            <Controls />
                                            <MiniMap style={{ background: "#0f172a" }} nodeColor="#1e293b" />
                                        </ReactFlow>
                                    </div>
                                )}

                                {activeTab === 'sources' && (
                                    <div className="space-y-4">
                                        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Database className="w-4 h-4 text-cyan-400" />Data Source</h3>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                                    <Activity className="w-4 h-4 text-cyan-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{(selectedObj as any).source || "Unknown"}</p>
                                                    <p className="text-xs text-slate-500">Primary data source for this entity type</p>
                                                </div>
                                                <div className="ml-auto flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                    <span className="text-xs text-emerald-400 font-bold">Live</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
                                            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" />Data Quality</h3>
                                            <div className="space-y-3">
                                                {[{ label: "Completeness", val: 94 }, { label: "Freshness", val: 98 }, { label: "Uniqueness", val: 99 }].map(q => (
                                                    <div key={q.label}>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-slate-400">{q.label}</span>
                                                            <span className="text-white font-bold">{q.val}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/5 rounded-full">
                                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${q.val}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
