"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Network,
    Search,
    Plus,
    Filter,
    MoreVertical,
    ChevronDown,
    Database,
    Clock,
    Shield,
    Activity,
    Box,
    CornerDownRight,
    Loader2,
    Share2,
    ArrowRight,
    Wand2,
    X
} from "lucide-react";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Edge,
    Node,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

import { ApiClient } from "@/lib/apiClient";
import * as T from '@/lib/types';

export default function OntologyBuilder() {
    const [entityTypes, setEntityTypes] = useState<T.EntityType[]>([]);
    const [selectedObj, setSelectedObj] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'properties' | 'links' | 'graph'>('properties');
    const [links, setLinks] = useState<T.RelationshipDefinition[]>([]);
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const [newLinkParams, setNewLinkParams] = useState({ name: '', targetId: '' });
    const [loading, setLoading] = useState(true);

    // AI Inference State
    const [showImportModal, setShowImportModal] = useState(false);
    const [importSample, setImportSample] = useState("");
    const [isInferring, setIsInferring] = useState(false);

    // React Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        async function fetchOntology() {
            try {
                const data = await ApiClient.get<T.EntityType[]>('/entity-types');
                setEntityTypes(data);
                if (data.length > 0) handleSelectObj(data[0]);
            } catch (err) {
                console.error("Failed to fetch entity types", err);
            } finally {
                setLoading(false);
            }
        }
        fetchOntology();
    }, []);

    const handleSelectObj = async (obj: any) => {
        try {
            const data = await ApiClient.get(`/entity-types/${obj.id}`);
            setSelectedObj(data);
            setActiveTab('properties');

            const rels = await ApiClient.get<T.RelationshipDefinition[]>(`/entity-types/${obj.id}/outgoing-relationships`);
            setLinks(rels || []);
        } catch (error) {
            console.error('Failed to load object details:', error);
            setSelectedObj(obj);
            setLinks([]);
        }
    };

    const handleCreateLink = async () => {
        if (!selectedObj || !newLinkParams.name || !newLinkParams.targetId) return;
        try {
            await ApiClient.post(`/entity-types/${selectedObj.id}/outgoing-relationships`, {
                name: newLinkParams.name,
                targetEntityTypeId: newLinkParams.targetId
            });
            const rels = await ApiClient.get<T.RelationshipDefinition[]>(`/entity-types/${selectedObj.id}/outgoing-relationships`);
            setLinks(rels || []);
            setIsCreatingLink(false);
            setNewLinkParams({ name: '', targetId: '' });
            if (activeTab === 'graph') buildGraph();
        } catch (e) {
            console.error(e);
            alert("Failed to create link type");
        }
    };

    const handleInferSchema = async () => {
        if (!importSample) return;
        setIsInferring(true);
        try {
            const sample = JSON.parse(importSample);
            const data = await ApiClient.post<any>('/api/v1/integration/infer-schema', {
                sample: Array.isArray(sample) ? sample : [sample],
                name: "Inferred_Type"
            });

            alert(`AI Inference complete! Detected \${data.attributes.length} attributes. New Entity definition created in draft mode.`);
            setShowImportModal(false);
            setImportSample("");
        } catch (e) {
            console.error(e);
            alert("Failed to infer schema. Ensure valid JSON sample.");
        } finally {
            setIsInferring(false);
        }
    };

    const buildGraph = useCallback(async () => {
        if (entityTypes.length === 0) return;

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        for (let i = 0; i < entityTypes.length; i++) {
            const et = entityTypes[i];

            newNodes.push({
                id: et.id,
                data: { label: et.name },
                position: { x: (i % 3) * 250 + 50, y: Math.floor(i / 3) * 150 + 50 },
                style: {
                    background: selectedObj?.id === et.id ? '#eef2ff' : '#ffffff',
                    color: '#1e293b',
                    border: selectedObj?.id === et.id ? '2px solid #6366f1' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: selectedObj?.id === et.id ? 'bold' : 'normal',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }
            });

            try {
                const rels = await ApiClient.get<T.RelationshipDefinition[]>(`/entity-types/${et.id}/outgoing-relationships`);
                rels.forEach(rel => {
                    newEdges.push({
                        id: rel.id,
                        source: et.id,
                        target: rel.targetEntityTypeId,
                        label: rel.name,
                        animated: true,
                        style: { stroke: '#94a3b8', strokeWidth: 2 },
                        labelStyle: { fill: '#64748b', fontWeight: 600, fontSize: 11 },
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
                    });
                });
            } catch (e) { }
        }

        setNodes(newNodes);
        setEdges(newEdges);
    }, [entityTypes, selectedObj]);

    useEffect(() => {
        if (activeTab === 'graph') {
            buildGraph();
        }
    }, [activeTab, buildGraph]);

    return (
        <div className="h-full w-full flex flex-col bg-white text-slate-900 border-t border-slate-200">

            {/* Top Action Bar */}
            <div className="h-12 border-b border-slate-200 bg-slate-50 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-indigo-100 text-indigo-700">
                        <Network className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">Ontology Manager</span>
                    <span className="text-slate-300 mx-2">/</span>
                    <span className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {loading ? "Loading..." : selectedObj?.name || "None"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded transition-colors shadow-sm"
                    >
                        <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                        Create from Sample
                    </button>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded transition-colors shadow-sm">
                        <Plus className="w-3.5 h-3.5" />
                        New Object Type
                    </button>
                </div>
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Wand2 className="w-4 h-4 text-purple-600" />
                                AI Schema Inference
                            </h3>
                            <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Paste JSON Sample Data</label>
                            <textarea
                                className="w-full h-48 p-3 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50"
                                placeholder='[ { "id": "1", "name": "Asset A", "value": 100 } ]'
                                value={importSample}
                                onChange={e => setImportSample(e.target.value)}
                            />
                            <p className="mt-2 text-[10px] text-slate-400">Kernal will analyze the data structure and infer types.</p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                            <button onClick={() => setShowImportModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
                            <button
                                disabled={!importSample || isInferring}
                                onClick={handleInferSchema}
                                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg shadow-md disabled:opacity-50 flex items-center gap-2"
                            >
                                {isInferring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                Infer Schema
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 flex min-h-0">
                <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
                    <div className="p-3 border-b border-slate-200 font-semibold text-xs text-slate-700 flex justify-between items-center uppercase tracking-wider">Hierarchy</div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {entityTypes.map(child => (
                            <div
                                key={child.id}
                                onClick={() => handleSelectObj(child)}
                                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors text-xs \${selectedObj?.id === child.id ? 'bg-indigo-100 text-indigo-800 font-medium' : 'text-slate-600 hover:bg-slate-200'}`}
                            >
                                {child.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-white flex flex-col min-w-0">
                    {selectedObj && (
                        <>
                            <div className="p-5 border-b border-slate-200">
                                <h1 className="text-xl font-bold text-slate-900 mb-1">{selectedObj.name}</h1>
                                <div className="flex gap-4 mt-4 border-b border-slate-200">
                                    {['properties', 'links', 'graph'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`px-1 pb-2 text-sm font-semibold capitalize \${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto bg-slate-50/30 p-4">
                                {activeTab === 'properties' && (
                                    <div className="border border-slate-200 rounded bg-white overflow-hidden shadow-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-2">Property</th>
                                                    <th className="px-4 py-2">Type</th>
                                                    <th className="px-4 py-2">Required</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm divide-y">
                                                {selectedObj.attributes?.map((prop: any) => (
                                                    <tr key={prop.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-2 font-mono text-xs">{prop.name}</td>
                                                        <td className="px-4 py-2 text-xs">{prop.dataType}</td>
                                                        <td className="px-4 py-2 text-xs">{prop.required ? 'Yes' : 'No'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {activeTab === 'graph' && (
                                    <div className="h-full w-full border border-slate-200 rounded bg-white">
                                        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
                                            <Background /><Controls /><MiniMap />
                                        </ReactFlow>
                                    </div>
                                )}
                                {activeTab === 'links' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {links.map((link: any) => (
                                            <div key={link.id} className="bg-white border rounded p-4 shadow-sm border-l-4 border-l-indigo-500">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Network className="w-4 h-4 text-slate-400" />
                                                    <span className="font-bold text-sm text-slate-800">{link.name}</span>
                                                </div>
                                                <div className="text-xs text-slate-500">Target: {link.targetEntityName || 'Unknown'}</div>
                                            </div>
                                        ))}
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
