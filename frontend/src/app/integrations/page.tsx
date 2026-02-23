"use client";

import { useState, useEffect } from "react";
import {
    Workflow,
    Search,
    Plus,
    Play,
    Save,
    CheckCircle2,
    AlertTriangle,
    Database,
    Code,
    Maximize2,
    Box,
    Layers,
    Activity,
    Loader2,
    Clock
} from "lucide-react";
import { ApiClient } from "@/lib/apiClient";
import * as T from '@/lib/types';

export default function IntegrationsPipeline() {
    const [selectedJob, setSelectedJob] = useState<any>(null);

    const [dataSources, setDataSources] = useState<T.DataSource[]>([]);
    const [jobs, setJobs] = useState<T.IntegrationJob[]>([]);
    const [entityTypes, setEntityTypes] = useState<T.EntityType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPipelineData() {
            try {
                const [dsData, jobData, etData] = await Promise.all([
                    ApiClient.get<T.DataSource[]>('/data-sources'),
                    ApiClient.get<T.IntegrationJob[]>('/integration-jobs'),
                    ApiClient.get<T.EntityType[]>('/entity-types')
                ]);
                setDataSources(dsData);
                setJobs(jobData);
                setEntityTypes(etData);

                if (jobData.length > 0) setSelectedJob(jobData[0]);
            } catch (err) {
                console.error("Failed to fetch pipeline data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchPipelineData();
    }, []);

    const getSourceForJob = (job: any) => dataSources.find(ds => ds.id === job.dataSourceId);
    const getDestForJob = (job: any) => entityTypes.find(et => et.id === job.targetEntityTypeId);

    return (
        <div className="h-full w-full flex flex-col bg-slate-100 text-slate-900 border-t border-slate-200 overflow-hidden">
            {/* Top Action Bar */}
            <div className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded bg-blue-100 text-blue-700">
                        <Workflow className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold text-slate-800">Integration Pipeline Builder</h1>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-widest border border-amber-200">Draft</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">Connected to Postgres Data Integration Service</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Validate
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5">
                        <Save className="w-4 h-4" /> Save
                    </button>
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors shadow flex items-center gap-1.5 ml-2">
                        <Play className="w-4 h-4" /> Execute Pending
                    </button>
                </div>
            </div>

            {/* Main Workspace: 3-Pane Layout */}
            <div className="flex-1 flex min-h-0 relative">
                {/* Left Pane: Node Library */}
                <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
                    <div className="p-3 border-b border-slate-200">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search library..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:border-blue-500 transition-colors bg-slate-50"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-4">
                        {loading ? (
                            <div className="flex justify-center p-6"><Loader2 className="w-5 h-5 text-blue-500 animate-spin" /></div>
                        ) : (
                            <>
                                {/* Section: Sources */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Active Sources</h3>
                                    <div className="space-y-1.5">
                                        {dataSources.map(ds => (
                                            <div key={ds.id} className="flex flex-col gap-0.5 p-2 rounded border border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-grab bg-slate-50/50 transition-all group">
                                                <div className="flex items-center gap-2">
                                                    <Database className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-xs font-bold text-slate-700 truncate">{ds.name}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono ml-6 uppercase">{ds.type}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Destinations */}
                                <div>
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Schema Destinations</h3>
                                    <div className="space-y-1.5">
                                        {entityTypes.slice(0, 5).map(et => (
                                            <div key={et.id} className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-grab bg-slate-50/50 transition-all group">
                                                <Box className="w-4 h-4 text-indigo-500" />
                                                <span className="text-xs font-medium text-slate-700 truncate">{et.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Center Pane: Pipeline Canvas */}
                <div className="flex-1 flex flex-col relative bg-[#f8fafc] overflow-hidden">
                    {/* Canvas Background Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                    <div className="absolute bottom-4 left-4 z-10 flex items-center bg-white border border-slate-200 rounded shadow-md overflow-hidden">
                        <button className="px-3 py-1.5 border-r border-slate-200 hover:bg-slate-50 text-slate-600 font-bold">+</button>
                        <button className="px-3 py-1.5 border-r border-slate-200 hover:bg-slate-50 text-slate-600 font-bold">-</button>
                        <button className="px-3 py-1.5 hover:bg-slate-50 text-slate-600"><Maximize2 className="w-4 h-4" /></button>
                    </div>

                    <div className="absolute inset-0 p-10 z-1 overflow-auto">
                        <div className="relative w-full h-[800px] min-w-[1200px]">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                    Parsing Integration DAG...
                                </div>
                            ) : jobs.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                    No Pipeline Jobs found. Drag a Source and Destination to begin.
                                </div>
                            ) : (
                                jobs.map((job, idx) => {
                                    const yOffset = 100 + (idx * 200);
                                    const source = getSourceForJob(job);
                                    const dest = getDestForJob(job);

                                    return (
                                        <div key={job.id}>
                                            {/* Connecting SVG lines representing data flow */}
                                            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                                                <path d={`M 260 ${yOffset + 35} L 400 ${yOffset + 35}`} fill="none" className="stroke-indigo-300" strokeWidth="2" strokeDasharray="4,2" />
                                                <path d={`M 660 ${yOffset + 35} L 800 ${yOffset + 35}`} fill="none" className="stroke-emerald-300" strokeWidth="2" strokeDasharray="4,2" />
                                            </svg>

                                            {/* Source Node */}
                                            <div className="absolute w-52 bg-white border border-slate-300 rounded-lg shadow-sm flex items-center p-3 z-10 opacity-90"
                                                style={{ top: `${yOffset}px`, left: '40px' }}>
                                                <div className={`p-2 rounded bg-slate-100 text-slate-600 mr-3 shrink-0`}><Database className="w-5 h-5" /></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold text-slate-800 truncate">{source?.name || 'Unknown Source'}</div>
                                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">{source?.type || 'DB'}</div>
                                                </div>
                                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-300 rounded-full"></div>
                                            </div>

                                            {/* Transform/Job Node */}
                                            <div onClick={() => setSelectedJob(job)}
                                                className={`absolute w-64 bg-white border-2 rounded-lg shadow-sm flex flex-col p-3 cursor-pointer z-20 transition-all ${selectedJob?.id === job.id ? 'border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : 'border-slate-200 hover:border-blue-300'}`}
                                                style={{ top: `${yOffset - 15}px`, left: '400px' }}>

                                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-400 rounded-full"></div>

                                                <div className="flex items-center border-b border-slate-100 pb-2 mb-2">
                                                    <div className={`p-1.5 rounded bg-blue-50 text-blue-600 mr-2 shrink-0`}><Code className="w-4 h-4" /></div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-bold text-slate-800 truncate">{job.name}</div>
                                                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Integration Job</div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-mono">
                                                    <span className={`px-1.5 py-0.5 rounded text-white font-bold tracking-widest uppercase ${job.status === 'RUNNING' ? 'bg-emerald-500' : job.status === 'FAILED' ? 'bg-red-500' : 'bg-slate-400'}`}>
                                                        {job.status}
                                                    </span>
                                                    <span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {job.schedule}</span>
                                                </div>

                                                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>
                                            </div>

                                            {/* Destination Node */}
                                            <div className="absolute w-52 bg-white border border-dashed border-slate-300 rounded-lg shadow-sm flex flex-col p-3 z-10 opacity-70"
                                                style={{ top: `${yOffset}px`, left: '800px' }}>
                                                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-300 rounded-full"></div>
                                                <div className="flex items-center">
                                                    <div className={`p-2 rounded bg-indigo-50 text-indigo-600 mr-3 shrink-0`}><Box className="w-5 h-5" /></div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-bold text-slate-800 truncate">{dest?.name || 'Unknown Entity'}</div>
                                                        <div className="text-[10px] text-indigo-600 font-bold mt-0.5 uppercase">Sync Target</div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Pane: Selected Node Configuration */}
                <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 z-20 shadow-[-2px_0_10px_rgba(0,0,0,0.02)]">
                    {!selectedJob ? (
                        <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-400 text-sm">
                            Select an Integration Job node to inspect its mapping logic.
                        </div>
                    ) : (
                        <>
                            <div className="p-4 border-b border-slate-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded bg-blue-50 text-blue-600"><Layers className="w-4 h-4" /></div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800 leading-tight">{selectedJob.name}</h2>
                                        <div className="text-[10px] font-mono text-slate-500 uppercase">System ID: {selectedJob.id}</div>
                                    </div>
                                </div>
                                <div className="flex border-b border-slate-200 mt-4">
                                    <button className="px-3 py-1.5 text-xs font-bold text-blue-600 border-b-2 border-blue-600">Mapping</button>
                                    <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">Schedule</button>
                                    <button className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">Executions</button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Source Dataset</label>
                                    <div className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded px-2 py-2 font-mono truncate">
                                        {getSourceForJob(selectedJob)?.name || selectedJob.dataSourceId}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target Entity Type</label>
                                    <div className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded px-2 py-2 font-mono truncate">
                                        {getDestForJob(selectedJob)?.name || selectedJob.targetEntityTypeId}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Field Mapping (JSON)</label>
                                    </div>
                                    <div className="bg-slate-900 rounded-md border border-slate-800 p-3 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto shadow-inner">
                                        <pre>{JSON.stringify(selectedJob.mapping, null, 2) || "{\n  // Identity mapping\n}"}</pre>
                                    </div>
                                </div>

                                {selectedJob.status === 'FAILED' && (
                                    <div className="bg-red-50 border border-red-200 rounded p-3 flex gap-2 mt-4">
                                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                                        <p className="text-[11px] text-red-800 leading-tight">
                                            Last execution failed due to schema mismatch on upstream Source Dataset. Field `customer_id` dropped.
                                        </p>
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
