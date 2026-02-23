"use client";

import { useState, useEffect } from "react";
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
    Loader2
} from "lucide-react";
import { ApiClient } from "@/lib/apiClient";

export default function OntologyBuilder() {
    const [entityTypes, setEntityTypes] = useState<any[]>([]);
    const [selectedObj, setSelectedObj] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOntology() {
            try {
                const data = await ApiClient.get<any[]>('/entity-types');
                setEntityTypes(data);
                if (data.length > 0) setSelectedObj(data[0]);
            } catch (err) {
                console.error("Failed to fetch entity types", err);
            } finally {
                setLoading(false);
            }
        }
        fetchOntology();
    }, []);

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
                                            onClick={() => setSelectedObj(child)}
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

                {/* Center Pane: Main Content/Table */}
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
                                    <button className="px-1 pb-2 text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600">Properties (Schema)</button>
                                    <button className="px-1 pb-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Instances</button>
                                    <button className="px-1 pb-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Links</button>
                                </div>
                            </div>

                            {/* Properties Table */}
                            <div className="flex-1 overflow-auto bg-slate-50/30 p-4">
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
