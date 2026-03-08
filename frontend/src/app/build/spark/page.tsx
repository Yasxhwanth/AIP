"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Network, Play, CheckCircle2, AlertTriangle, Clock, RefreshCw, Layers } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Mock Spark DAGs to seed if DB is empty
const SEED_JOBS = [
    {
        name: "Nightly Analytics Aggregation",
        description: "Rolls up raw telemetry events into daily summary tables.",
        stages: [
            { id: "read-telemetry", type: "source" },
            { id: "filter-active", type: "filter" },
            { id: "join-sensors", type: "join" },
            { id: "agg-daily", type: "aggregate" }
        ]
    },
    {
        name: "Security Event Stream",
        description: "Filters high-risk events for immediate escalation.",
        stages: [
            { id: "read-stream", type: "source" },
            { id: "filter-high-risk", type: "filter" }
        ]
    }
];

export default function SparkPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJob, setSelectedJob] = useState<any | null>(null);
    const [runningJobId, setRunningJobId] = useState<string | null>(null);

    // Live view
    const [liveRun, setLiveRun] = useState<any | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const fetchJobs = useCallback(async () => {
        try {
            const res = await fetch(`${API}/api/spark/jobs`);
            if (res.ok) {
                const data = await res.json();
                if (data.length === 0) {
                    // Seed
                    for (const j of SEED_JOBS) {
                        await fetch(`${API}/api/spark/jobs`, {
                            method: "POST", headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(j)
                        });
                    }
                    const r2 = await fetch(`${API}/api/spark/jobs`);
                    setJobs(await r2.json());
                } else {
                    setJobs(data);
                }
            }
        } catch (e) { console.error(e); }
    }, []);

    const fetchLiveRun = useCallback(async (jobId: string) => {
        try {
            const res = await fetch(`${API}/api/spark/jobs/${jobId}/runs`);
            if (res.ok) {
                const runs = await res.json();
                if (runs.length > 0) setLiveRun(runs[0]);
            }
        } catch (e) { }
    }, []);

    useEffect(() => {
        fetchJobs();

        // Connect WS for live updates
        const wsUrl = (API.replace("http://", "ws://").replace("https://", "wss://")) + "/api/ws";
        try {
            wsRef.current = new WebSocket(wsUrl);
            wsRef.current.onmessage = (e) => {
                const msg = JSON.parse(e.data);
                if (msg.type?.startsWith("spark:job:") || msg.type?.startsWith("stage.")) {
                    if (selectedJob?.id) fetchLiveRun(selectedJob.id);
                }
            };
        } catch (e) { }

        return () => wsRef.current?.close();
    }, [fetchJobs]);

    useEffect(() => {
        if (selectedJob) fetchLiveRun(selectedJob.id);
        else setLiveRun(null);
    }, [selectedJob, fetchLiveRun]);

    const handleRun = async () => {
        if (!selectedJob) return;
        setRunningJobId(selectedJob.id);
        setLiveRun(null); // clear old
        try {
            await fetch(`${API}/api/spark/jobs/${selectedJob.id}/run`, { method: "POST" });
            fetchLiveRun(selectedJob.id);
        } finally {
            setTimeout(() => setRunningJobId(null), 1000); // UI debounce
        }
    };

    return (
        <div className="flex h-full bg-[#F5F8FA] font-sans">

            {/* Left Sidebar */}
            <div className="w-80 border-r border-gray-200 bg-white flex flex-col shrink-0">
                <div className="h-12 border-b border-gray-100 flex items-center px-4 shrink-0 bg-slate-50 gap-2">
                    <Network className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-slate-800">Spark Jobs</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {jobs.map(job => (
                        <div key={job.id} onClick={() => setSelectedJob(job)}
                            className={`p-3 rounded-md cursor-pointer border transition-colors ${selectedJob?.id === job.id ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100 hover:border-blue-100"}`}>
                            <div className="font-bold text-sm text-slate-800 mb-1">{job.name}</div>
                            <div className="text-xs text-slate-500 mb-2 truncate">{job.description}</div>
                            <div className="flex gap-2 text-[10px] items-center text-slate-400">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{job.stages?.length || 0} stages</span>
                                {job.runs?.[0] && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {new Date(job.runs[0].startedAt).toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {!selectedJob ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Select a job to view details</div>
                ) : (
                    <>
                        <div className="p-6 border-b border-gray-200 bg-white shrink-0">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">{selectedJob.name}</h2>
                                    <p className="text-sm text-slate-500 mt-1">{selectedJob.description}</p>
                                </div>
                                <button onClick={handleRun} disabled={runningJobId === selectedJob.id || liveRun?.status === "running"}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                                    {(runningJobId === selectedJob.id || liveRun?.status === "running") ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                    Execute Job
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Latest Execution Plan</h3>

                            {!liveRun ? (
                                <div className="text-center p-8 bg-white rounded-lg border border-dashed border-gray-300 text-slate-500 text-sm">
                                    No runs recorded. Click Execute Job to trigger the DAG.
                                </div>
                            ) : (
                                <div className="space-y-6 max-w-4xl">

                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex gap-8 items-center">
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                                            <div className="text-sm font-bold mt-1 uppercase flex items-center gap-1.5">
                                                {liveRun.status === "running" ? <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" /> :
                                                    liveRun.status === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                                                        <AlertTriangle className="w-4 h-4 text-red-500" />}
                                                <span className={liveRun.status === "success" ? "text-emerald-700" : liveRun.status === "failed" ? "text-red-700" : "text-blue-700"}>
                                                    {liveRun.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Duration</div>
                                            <div className="text-sm font-mono mt-1 text-slate-700">
                                                {liveRun.durationMs ? `${(liveRun.durationMs / 1000).toFixed(1)}s` : "..."}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Records Processed</div>
                                            <div className="text-sm font-mono mt-1 text-slate-700">
                                                {liveRun.summary?.totalRecords?.toLocaleString() || "0"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-200" />

                                        <div className="space-y-3 relative z-10">
                                            {(liveRun.stages || []).map((stage: any, idx: number) => {
                                                const isDone = stage.status === "success" || stage.status === "skipped";
                                                const isRunning = stage.status === "running";
                                                const isFailed = stage.status === "failed";
                                                const isPending = stage.status === "pending";

                                                return (
                                                    <div key={stage.id} className="flex items-start gap-4">
                                                        <div className={`w-14 shrink-0 flex justify-end pt-2 text-xs font-mono font-bold ${isRunning ? 'text-blue-600' : 'text-slate-400'}`}>
                                                            STG_{idx.toString().padStart(2, '0')}
                                                        </div>
                                                        <div className={`mt-2 w-3.5 h-3.5 rounded-full border-2 bg-white flex shrink-0
                                                            ${isDone ? 'border-emerald-500' : isFailed ? 'border-red-500' : isRunning ? 'border-blue-500 animate-pulse' : 'border-slate-300'}
                                                        `} />
                                                        <div className={`flex-1 bg-white rounded-lg border p-3 flex justify-between items-center transition-opacity
                                                            ${isRunning ? 'border-blue-300 shadow-sm' : isFailed ? 'border-red-300' : 'border-gray-200'}
                                                            ${isPending ? 'opacity-50' : 'opacity-100'}
                                                        `}>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                                                                    <span className="font-bold text-sm text-slate-800 uppercase tracking-wide">{stage.stageType}</span>
                                                                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">Partitions: {stage.partitions}</span>
                                                                </div>
                                                                <div className="text-xs text-slate-500 font-mono">
                                                                    Job ID: {stage.stageId}
                                                                </div>
                                                            </div>

                                                            <div className="text-right flex items-center gap-6">
                                                                {!isPending && (
                                                                    <>
                                                                        <div className="text-right">
                                                                            <div className="text-[9px] font-bold text-slate-400 uppercase">Records In</div>
                                                                            <div className="text-xs font-mono font-bold text-slate-700">{stage.recordsIn?.toLocaleString() || '--'}</div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-[9px] font-bold text-slate-400 uppercase">Records Out</div>
                                                                            <div className="text-xs font-mono font-bold text-slate-700">{stage.recordsOut?.toLocaleString() || '--'}</div>
                                                                        </div>
                                                                        <div className="text-right w-16">
                                                                            <div className="text-[9px] font-bold text-slate-400 uppercase">Time</div>
                                                                            <div className="text-xs font-mono text-slate-500">{stage.durationMs ? `${stage.durationMs}ms` : '--'}</div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {isPending && <span className="text-xs font-bold text-slate-400 italic px-4">Waiting in queue...</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

        </div>
    );
}
