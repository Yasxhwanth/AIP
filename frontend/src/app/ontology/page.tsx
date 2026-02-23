"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Network,
    Search,
    Plus,
    Filter,
    MoreVertical,
    ChevronDown,
    Database,
    Tag,
    Clock,
    Shield,
    Activity,
    Box,
    CornerDownRight,
    Loader2,
    Share2,
    ArrowRight
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
            setActiveTab('properties'); // Reset to properties

            // Fetch outgoing links
            const rels = await ApiClient.get<T.RelationshipDefinition[]>(`/entity-types/${obj.id}/outgoing-relationships`);
            setLinks(rels || []);
        } catch (error) {
            console.error('Failed to load object details:', error);
            setSelectedObj(obj); // fallback to basic data
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
            // Refresh links
            const rels = await ApiClient.get<T.RelationshipDefinition[]>(`/entity-types/${selectedObj.id}/outgoing-relationships`);
            setLinks(rels || []);
            setIsCreatingLink(false);
            setNewLinkParams({ name: '', targetId: '' });

            // If graph tab is active, trigger restructure
            if (activeTab === 'graph') buildGraph();
        } catch (e) {
            console.error(e);
            alert("Failed to create link type");
        }
    };

    // Graph Construction logic
    const buildGraph = useCallback(async () => {
        if (entityTypes.length === 0) return;

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // Simple layout logic for demonstration
        let yPos = 50;

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
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }
            });

            // Fetch relations for edge generation (in a real app, you'd fetch all at once)
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
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search ontology..."
                            className="pl-7 pr-3 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-indigo-500 w-48 transition-colors"
                        />
                    </div>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded transition-colors shadow-sm">
                        <Plus className="w-3.5 h-3.5" />
                        New Object Type
                    </button>
                </div>
            </div>

            {/* 3-Pane Workspace */}
            <div className="flex-1 flex min-h-0">

                {/* Left Pane: Ontology Hierarchy */}
                <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
                    <div className="p-3 border-b border-slate-200 font-semibold text-xs text-slate-700 flex justify-between items-center uppercase tracking-wider">
                        Graph Hierarchy
                        <Filter className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-700" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-3" />
                                <span className="text-xs">Loading Object Types...</span>
                            </div>
                        ) : (
                            <div className="mb-2">
                                <div className="flex items-center text-slate-700 bg-slate-200 p-1 rounded transition-colors group">
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                                    <Database className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                                    <span className="text-xs font-semibold select-none">Entity Types</span>
                                </div>
                                <div className="ml-5 mt-1 border-l border-slate-200 pl-2 space-y-1">
                                    {entityTypes.map(child => (
                                        <div
                                            key={child.id}
                                            onClick={() => handleSelectObj(child)}
                                            className={`
                                                flex items-center justify-between p-1 rounded cursor-pointer transition-colors text-xs
                                                ${selectedObj?.id === child.id ? 'bg-indigo-100/50 text-indigo-800 font-medium' : 'text-slate-600 hover:bg-slate-200'}
                                            `}
                                        >
                                            <div className="flex items-center">
                                                <CornerDownRight className="w-3 h-3 text-slate-300 mr-1.5" />
                                                {child.name}
                                            </div>
                                            <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-1 rounded shadow-sm">
                                                v{child.version}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Pane: Main Content/Table/Graph */}
                <div className="flex-1 bg-white flex flex-col min-w-0">
                    {!selectedObj ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400">Select an Object Type to view its schema</div>
                    ) : (
                        <>
                            {/* Main Content Header */}
                            <div className="p-5 border-b border-slate-200 bg-white">
                                <h1 className="text-xl font-bold text-slate-900 mb-1">{selectedObj.name}</h1>
                                <p className="text-xs text-slate-500">
                                    System ID: <code className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">{selectedObj.id}</code>
                                </p>

                                <div className="flex gap-4 mt-4 border-b border-slate-200">
                                    <button
                                        onClick={() => setActiveTab('properties')}
                                        className={`px-1 pb-2 text-sm font-semibold transition-colors ${activeTab === 'properties' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
                                        Properties (Schema)
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('links')}
                                        className={`px-1 pb-2 text-sm font-semibold transition-colors ${activeTab === 'links' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
                                        Link Types ({links.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('graph')}
                                        className={`px-1 pb-2 text-sm font-semibold transition-colors ${activeTab === 'graph' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
                                        Graph Explorer
                                    </button>
                                </div>
                            </div>

                            {/* Center Canvas Pane Area */}
                            <div className="flex-1 overflow-auto bg-slate-50/30 p-4">
                                {activeTab === 'properties' && (
                                    <div className="border border-slate-200 rounded bg-white shadow-sm">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                                                    <th className="px-4 py-2 border-slate-200">Property Name</th>
                                                    <th className="px-4 py-2 border-l border-slate-200">Base Type</th>
                                                    <th className="px-4 py-2 border-l border-slate-200">Required</th>
                                                    <th className="px-4 py-2 border-l border-slate-200">Temporal</th>
                                                    <th className="px-4 py-2 border-l border-slate-200 w-16"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm divide-y divide-slate-100">
                                                {selectedObj.attributes?.map((prop: any) => (
                                                    <tr key={prop.id} className="hover:bg-indigo-50/50 group transition-colors">
                                                        <td className="px-4 py-2.5 flex items-center gap-2">
                                                            <span className="font-mono text-xs font-semibold text-slate-700">{prop.name}</span>
                                                        </td>
                                                        <td className="px-4 py-2.5 border-l border-slate-200">
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border bg-blue-50 text-blue-700 border-blue-200 uppercase">
                                                                {prop.dataType}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2.5 border-l border-slate-200 text-slate-600 text-xs text-center border-r">
                                                            {prop.required ? 'Yes' : 'No'}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-slate-600 text-xs text-center">
                                                            {prop.temporal ? 'Yes' : 'No'}
                                                        </td>
                                                        <td className="px-4 py-2.5 border-l border-slate-200 text-right">
                                                            <MoreVertical className="w-4 h-4 text-slate-300 hover:text-slate-600 cursor-pointer inline-block" />
                                                        </td>
                                                    </tr>
                                                ))}
                                                {selectedObj.attributes?.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-4 text-center text-slate-400 text-sm">No attributes defined for this entity type.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {activeTab === 'links' && (
                                    <div className="p-2 w-full max-w-5xl mx-auto">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800">Outgoing Link Types</h3>
                                                <p className="text-xs text-slate-500 mt-1">Define structural edges pointing from <span className="font-mono text-indigo-600">{selectedObj.name}</span> to other entities in the ontology.</p>
                                            </div>
                                            <button
                                                onClick={() => setIsCreatingLink(!isCreatingLink)}
                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Create Edge
                                            </button>
                                        </div>

                                        {isCreatingLink && (
                                            <div className="mb-6 p-4 bg-blue-50/50 border border-blue-200 rounded-md flex gap-4 items-end shadow-sm">
                                                <div className="flex-1">
                                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Relationship Name</label>
                                                    <input
                                                        type="text"
                                                        className="w-full text-sm p-2 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm"
                                                        value={newLinkParams.name}
                                                        onChange={e => setNewLinkParams({ ...newLinkParams, name: e.target.value })}
                                                        placeholder="e.g. manufactures"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Target Entity</label>
                                                    <select
                                                        className="w-full text-sm p-2 bg-white border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm"
                                                        value={newLinkParams.targetId}
                                                        onChange={e => setNewLinkParams({ ...newLinkParams, targetId: e.target.value })}
                                                    >
                                                        <option value="">Select target...</option>
                                                        {entityTypes.filter(et => et.id !== selectedObj.id).map(et => (
                                                            <option key={et.id} value={et.id}>{et.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <button
                                                        onClick={handleCreateLink}
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-sm transition disabled:opacity-50"
                                                        disabled={!newLinkParams.name || !newLinkParams.targetId}
                                                    >
                                                        Save Edge
                                                    </button>
                                                    <button
                                                        onClick={() => setIsCreatingLink(false)}
                                                        className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-bold rounded shadow-sm transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {links.map((link: T.RelationshipDefinition) => (
                                                <div key={link.id} className="border border-slate-200 rounded bg-white shadow-sm hover:border-blue-300 transition-colors group flex flex-col h-full relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 transition-all group-hover:w-1.5"></div>
                                                    <div className="p-4 pl-5">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Network className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                            <span className="font-mono text-sm font-bold text-slate-800">{link.name}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                                            <div className="font-medium text-slate-700 truncate">{selectedObj.name}</div>
                                                            <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-2" />
                                                            <div className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 truncate">
                                                                {link.targetEntityName || 'Unknown'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {links.length === 0 && !isCreatingLink && (
                                                <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                                    <div className="p-3 bg-white rounded-full border border-slate-200 shadow-sm mb-4">
                                                        <Network className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-slate-800 mb-1">No Outgoing Edges</h3>
                                                    <p className="text-xs text-slate-500 max-w-sm text-center">There are no relationship link types configured for this entity. Create an edge to connect it to other objects.</p>
                                                    <button
                                                        onClick={() => setIsCreatingLink(true)}
                                                        className="mt-6 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded shadow-sm transition-colors"
                                                    >
                                                        Create First Edge
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'graph' && (
                                    <div className="h-full w-full border border-slate-200 rounded bg-white shadow-sm overflow-hidden">
                                        <ReactFlow
                                            nodes={nodes}
                                            edges={edges}
                                            onNodesChange={onNodesChange}
                                            onEdgesChange={onEdgesChange}
                                            fitView
                                            attributionPosition="bottom-right"
                                        >
                                            <Background color="#cbd5e1" gap={16} />
                                            <Controls />
                                            <MiniMap nodeStrokeColor="#e2e8f0" nodeColor="#f8fafc" />
                                        </ReactFlow>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Pane: Object Inspector */}
                <div className="w-72 border-l border-slate-200 bg-slate-50 flex flex-col shrink-0">
                    <div className="p-3 border-b border-slate-200 font-semibold text-xs text-slate-700 bg-slate-100 flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5" />
                        Metadata Inspector
                    </div>

                    {selectedObj && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">General</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Schema Name</span>
                                        <span className="font-mono text-slate-800 font-semibold bg-white px-1 border border-slate-200 rounded">{selectedObj.name}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Created</span>
                                        <span className="text-slate-800 flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            {new Date(selectedObj.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Version</span>
                                        <span className="text-slate-800 font-mono">v{selectedObj.version}</span>
                                    </div>
                                    <div className="flex justify-between text-xs mt-2">
                                        <span className="text-slate-500">Attributes</span>
                                        <span className="text-slate-800 font-mono bg-indigo-50 text-indigo-700 px-1 rounded">{selectedObj.attributes?.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px w-full bg-slate-200"></div>

                            <div>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Security & Access</h3>
                                <div className="bg-white border border-slate-200 rounded p-2 text-xs text-slate-600 flex items-start gap-2">
                                    <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-slate-800 block mb-0.5">Strict Default Marking</span>
                                        Reads restricted to `Role: Ops Engineer` or higher.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
