"use client";

import { useState, useEffect } from "react";
import {
    BrainCircuit,
    Search,
    Filter,
    MoreVertical,
    Activity,
    Play,
    RotateCcw,
    CheckCircle2,
    Clock,
    Box,
    Cpu,
    DownloadCloud,
    Loader2,
    BarChart3
} from "lucide-react";
import { ApiClient } from "@/lib/apiClient";
import * as T from '@/lib/types';

export default function ModelRegistry() {
    const [models, setModels] = useState<T.ModelDefinition[]>([]);
    const [selectedModel, setSelectedModel] = useState<any>(null);
    const [versions, setVersions] = useState<T.ModelVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'monitoring'>('overview');
    const [latencyMetrics, setLatencyMetrics] = useState<any[]>([]);

    useEffect(() => {
        async function fetchModels() {
            try {
                const data = await ApiClient.get<T.ModelDefinition[]>('/models');
                setModels(data);
                if (data.length > 0) {
                    setSelectedModel(data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch models", err);
            } finally {
                setLoading(false);
            }
        }
        fetchModels();
    }, []);

    useEffect(() => {
        if (!selectedModel) return;
        async function fetchVersions() {
            try {
                // Models API is loaded under the generic generic root
                const data = await ApiClient.get<T.ModelVersion[]>(`/models/${selectedModel.id}/versions`);
                setVersions(data);
            } catch (err) {
                console.error("Failed to fetch model versions", err);
            }
        }
        fetchVersions();
    }, [selectedModel]);

    const activeVersion = versions.length > 0 ? versions[0] : null;

    const updateModelStatus = async (status: string) => {
        if (!selectedModel || !activeVersion) return;
        try {
            await ApiClient.put(`/api/v1/models/${selectedModel.id}/versions/${activeVersion.id}/status`, { status });
            // Refresh
            const data = await ApiClient.get<T.ModelVersion[]>(`/models/${selectedModel.id}/versions`);
            setVersions(data);
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    useEffect(() => {
        if (!activeVersion || !activeVersion.id || activeTab !== 'monitoring') return;
        async function fetchMetrics() {
            try {
                const data = await ApiClient.get<any[]>(`/api/v1/models/${selectedModel?.id}/versions/${activeVersion.id}/metrics/latency`);
                setLatencyMetrics(data);
            } catch (err) {
                console.error("Failed to fetch latency metrics", err);
            }
        }
        fetchMetrics();
    }, [activeVersion, activeTab, selectedModel]);

    return (
        <div className="h-full w-full flex flex-col bg-slate-50 text-slate-900 border-t border-slate-200 overflow-hidden">
            {/* Top Action Bar */}
            <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-purple-100 text-purple-700">
                        <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold text-slate-800">Model Registry & Ops</h1>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">Managing {models.length} ML assets across contexts</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5">
                        <DownloadCloud className="w-4 h-4" /> Import Model
                    </button>
                    <button className="px-3 py-1.5 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition-colors shadow flex items-center gap-1.5 ml-2">
                        <Play className="w-4 h-4" /> Train New
                    </button>
                </div>
            </div>

            {/* Main Workspace: 3-Pane Layout */}
            <div className="flex-1 flex min-h-0 relative">
                {/* Left Pane: Registry List */}
                <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10">
                    <div className="p-3 border-b border-slate-200 flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search models..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-purple-500 transition-colors bg-slate-50"
                            />
                        </div>
                        <button className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded text-slate-500 hover:bg-slate-50">
                            <Filter className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loading ? (
                            <div className="flex justify-center p-6 text-purple-500"><Loader2 className="w-5 h-5 animate-spin" /></div>
                        ) : models.length === 0 ? (
                            <div className="text-center p-4 text-xs text-slate-500">No models deployed in Postgres.</div>
                        ) : models.map(model => {
                            const latestVer = model.versions?.[0];
                            const isDeployed = latestVer?.status === 'DEPLOYED';
                            return (
                                <div
                                    key={model.id}
                                    onClick={() => setSelectedModel(model)}
                                    className={`p-3 rounded border cursor-pointer transition-all ${selectedModel?.id === model.id
                                        ? 'bg-purple-50 border-purple-200 shadow-sm'
                                        : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span className={`text-xs font-bold truncate ${selectedModel?.id === model.id ? 'text-purple-900' : 'text-slate-800'}`}>
                                            {model.name}
                                        </span>
                                        {isDeployed ? (
                                            <div title="Production" className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                                        ) : latestVer?.status === 'SHADOW' ? (
                                            <div title="Shadow Mode" className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1 shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>
                                        ) : (
                                            <div title={latestVer?.status || 'Draft'} className="w-2 h-2 rounded-full bg-slate-400 shrink-0 mt-1"></div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-2">
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate uppercase">
                                            {latestVer?.strategy || 'CUSTOM'}
                                        </span>
                                        <span>v{latestVer?.version || '0'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Center Pane: Model Details & Metrics */}
                <div className="flex-1 bg-[#f8fafc] flex flex-col overflow-y-auto">
                    {!selectedModel ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Select a model to view specs.</div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-bold text-slate-900">{selectedModel.name}</h2>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border flex items-center gap-1 ${activeVersion?.status === 'DEPLOYED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                            <CheckCircle2 className="w-3 h-3" /> {activeVersion?.status || 'NO VERSIONS'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 max-w-2xl">
                                        {selectedModel.description || `Machine Learning Model analyzing ${selectedModel.entityType?.name || 'entity'} instances.`}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <div className="relative group">
                                        <button className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm flex items-center gap-1.5 min-w-[140px] justify-between">
                                            Status: {activeVersion?.status} <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
                                        </button>
                                        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded shadow-lg py-1 hidden group-hover:block z-50">
                                            <button onClick={() => updateModelStatus('DRAFT')} className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900">Set DRAFT</button>
                                            <button onClick={() => updateModelStatus('SHADOW')} className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-amber-600 hover:bg-slate-50 hover:text-amber-700">Set SHADOW</button>
                                            <button onClick={() => updateModelStatus('PRODUCTION')} className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-emerald-600 hover:bg-slate-50 hover:text-emerald-700">Set PRODUCTION</button>
                                            <button onClick={() => updateModelStatus('RETIRED')} className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-slate-50 hover:text-rose-700">Set RETIRED</button>
                                        </div>
                                    </div>
                                    <button className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm flex items-center gap-1.5">
                                        <RotateCcw className="w-3.5 h-3.5" /> Retrain
                                    </button>
                                    <button className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm flex items-center gap-1.5">
                                        <Play className="w-3.5 h-3.5" /> Evaluate
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 flex gap-6 border-b border-slate-200 mt-2">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'overview' ? 'text-purple-700 border-purple-600' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'}`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('monitoring')}
                                    className={`pb-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${activeTab === 'monitoring' ? 'text-purple-700 border-purple-600' : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'}`}
                                >
                                    <Activity className="w-4 h-4" /> Monitoring
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {activeTab === 'overview' ? (
                                    <>
                                        {/* KPI Grid */}
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="bg-white border border-slate-200 rounded shadow-sm p-4">
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                    <Activity className="w-3.5 h-3.5" /> Bound Entity Type
                                                </div>
                                                <div className="text-lg font-mono font-bold text-slate-800 limit-lines-1 truncate">{selectedModel.entityType?.name}</div>
                                                <div className="text-[10px] text-slate-400 font-medium mt-1">ID: {selectedModel.entityType?.id?.substring(0, 8)}...</div>
                                            </div>

                                            <div className="bg-white border border-slate-200 rounded shadow-sm p-4">
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" /> Target Predict Field
                                                </div>
                                                <div className="text-lg font-mono font-bold text-slate-800">{selectedModel.outputField}</div>
                                            </div>

                                            <div className="bg-white border border-slate-200 rounded shadow-sm p-4">
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                    <Box className="w-3.5 h-3.5" /> ML Strategy
                                                </div>
                                                <div className="text-lg font-mono font-bold text-slate-800 mt-1 truncate">{activeVersion?.strategy || 'N/A'}</div>
                                            </div>

                                            <div className="bg-white border border-slate-200 rounded shadow-sm p-4">
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                    <Cpu className="w-3.5 h-3.5" /> Active Version
                                                </div>
                                                <div className="text-lg font-mono font-bold text-slate-800 mt-1">v{activeVersion?.version || '0'}</div>
                                            </div>
                                        </div>

                                        {/* Performance Charts & Features */}
                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Feature Mapping */}
                                            <div className="bg-white border border-slate-200 rounded shadow-sm p-4 min-h-64 flex flex-col">
                                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Input Vector Schema</h3>
                                                <div className="flex-1 flex flex-col pt-2 gap-3 overflow-y-auto">
                                                    {selectedModel.inputFields && Object.keys(selectedModel.inputFields).map((field, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                                                            <span className="text-xs font-mono font-bold text-slate-700">{field}</span>
                                                            <span className="text-[10px] text-slate-500 uppercase">{selectedModel.inputFields[field]}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Hyperparameters Config */}
                                            <div className="bg-white border border-slate-200 rounded shadow-sm p-4 min-h-64 flex flex-col relative overflow-hidden">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Hyperparameters</h3>
                                                </div>
                                                <div className="flex-1 bg-slate-900 rounded p-3 overflow-y-auto">
                                                    <pre className="text-[11px] font-mono text-emerald-400">
                                                        {activeVersion?.hyperparameters
                                                            ? JSON.stringify(activeVersion.hyperparameters, null, 2)
                                                            : '// No hyperparameters set'}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-6">
                                        <div className="bg-white border border-slate-200 rounded shadow-sm p-5">
                                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-600" /> Inference Latency (P99 & P50)</h3>
                                            {latencyMetrics.length === 0 ? (
                                                <div className="h-48 flex items-center justify-center text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded">
                                                    No inference execution data available for this version.
                                                </div>
                                            ) : (
                                                <div className="h-48 flex items-end gap-2 border-b border-l border-slate-200 p-4 pt-10 relative">
                                                    {latencyMetrics.map((m, i) => {
                                                        const p99Height = Math.min((m.p99 / 200) * 100, 100);
                                                        const p50Height = Math.min((m.p50 / 200) * 100, 100);
                                                        return (
                                                            <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                                                                <div className="absolute hidden group-hover:block bottom-full mb-2 bg-slate-800 text-white text-[10px] p-2 rounded shadow-lg whitespace-nowrap z-20">
                                                                    <p>Time: {new Date(m.windowStart).toLocaleTimeString()}</p>
                                                                    <p>P99: {Math.round(m.p99)}ms</p>
                                                                    <p>P50: {Math.round(m.p50)}ms</p>
                                                                    <p>Reqs: {m.requestCount}</p>
                                                                </div>
                                                                <div className="w-full bg-purple-200 rounded-t relative" style={{ height: `${p99Height}%` }}>
                                                                    <div className="absolute bottom-0 w-full bg-purple-600 rounded-t" style={{ height: `${(p50Height / p99Height) * 100}%` }}></div>
                                                                </div>
                                                                <div className="text-[8px] text-slate-400 text-center mt-1 truncate absolute top-full w-full pt-1">
                                                                    {new Date(m.windowStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Pane: Model API & lineage Container */}
                <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 z-10">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Deployment Detail</h2>
                        <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </div>

                    {!selectedModel ? (
                        <div className="p-6 text-center text-xs text-slate-400">Select model</div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Environment Details */}
                            <div>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Inference Gateway Engine</h3>
                                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-2 font-mono text-slate-600">
                                    <div className="flex justify-between"><span className="text-slate-400">Endpoint:</span> <span className="text-blue-600 truncate ml-2">/models/{selectedModel.id}/infer</span></div>
                                    <div className="flex justify-between"><span className="text-slate-400">Engine:</span> <span>Node.js / Express</span></div>
                                </div>
                            </div>

                            {/* API Invocation Mockup */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Test Invocation</h3>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 rounded p-3 font-mono text-[10px] leading-relaxed text-slate-300 overflow-x-auto">
                                    <span className="text-pink-400">curl</span> -X POST \<br />
                                    &nbsp;&nbsp;http://localhost:3001/models/{selectedModel.id}/infer/[LOGICAL_ID] \<br />
                                    &nbsp;&nbsp;-H <span className="text-yellow-300">"Authorization: Bearer $AIP_TOKEN"</span> \<br />
                                    &nbsp;&nbsp;-H <span className="text-yellow-300">"Content-Type: application/json"</span>
                                </div>
                            </div>

                            {/* Lineage */}
                            <div>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Lineage Tracker</h3>
                                <div className="relative pl-3 border-l-2 border-slate-200 space-y-4">
                                    {versions.map(v => (
                                        <div key={v.id} className="relative">
                                            <div className={`absolute -left-[17px] top-1 w-2.5 h-2.5 border-2 border-white rounded-full ${v.status === 'DEPLOYED' || v.status === 'PRODUCTION' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                            <div className="text-xs font-bold text-slate-700">Version {v.version} ({v.status})</div>
                                            <div className="text-[10px] text-slate-500 font-mono">{new Date(v.createdAt).toISOString()}</div>
                                        </div>
                                    ))}
                                    <div className="relative">
                                        <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 bg-purple-500 border-2 border-white rounded-full"></div>
                                        <div className="text-xs font-bold text-slate-700">Model Definition Created</div>
                                        <div className="text-[10px] text-slate-500 font-mono">{new Date(selectedModel.createdAt).toISOString()}</div>
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
