"use client";
import { useState, useEffect } from "react";
import { Beaker, Plus, Play, CheckCircle2, XCircle, Search, RefreshCw, Layers, BrainCircuit, PlayCircle, BarChart2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function get(path: string) {
    const res = await fetch(`${API}${path}`);
    return res.json();
}
async function post(path: string, body: any) {
    const res = await fetch(`${API}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return res.json();
}

export default function EvalsPage() {
    const [evals, setEvals] = useState<any[]>([]);
    const [selEvalId, setSelEvalId] = useState<string | null>(null);
    const [selEval, setSelEval] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);

    // New eval state
    const [showNew, setShowNew] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [selWf, setSelWf] = useState("");

    useEffect(() => {
        get("/api/evals").then(d => { setEvals(d); setLoading(false); }).catch(() => setLoading(false));
        get("/api/workflows").then(setWorkflows).catch(() => { });
    }, []);

    useEffect(() => {
        if (!selEvalId) { setSelEval(null); return; }
        loadEval(selEvalId);
    }, [selEvalId]);

    const loadEval = (id: string) => {
        get(`/api/evals/${id}`).then(setSelEval).catch(() => { });
    };

    const handleCreate = async () => {
        if (!newName || !selWf) return;
        const e = await post("/api/evals", {
            name: newName, description: newDesc, workflowId: selWf,
            testCases: [
                { input: { text: "Example input" }, expectedOutput: "Expected semantic result", description: "Base test" },
                { input: { text: "Edge case" }, expectedOutput: "Edge case handled", description: "Edge case" }
            ]
        });
        setEvals([e, ...evals]);
        setShowNew(false);
        setNewName(""); setNewDesc(""); setSelWf("");
        setSelEvalId(e.id);
    };

    const runEval = async () => {
        if (!selEvalId) return;
        setRunning(true);
        try {
            await post(`/api/evals/${selEvalId}/run`, {});
            // mock poll for completion
            setTimeout(() => {
                loadEval(selEvalId);
                setRunning(false);
            }, 3000);
        } catch (e) { setRunning(false); }
    };

    if (loading) return <div className="p-8 text-sm text-gray-500">Loading EVals...</div>;

    const latestRun = selEval?.runs?.[0];

    return (
        <div className="flex h-[calc(100vh-48px)] bg-gray-50 font-sans text-gray-900 overflow-hidden">
            {/* ── LEFT SIDEBAR ── */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Beaker className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-sm text-gray-800">AIP Evals</span>
                    </div>
                    <button onClick={() => { setShowNew(true); setSelEvalId(null); }} className="text-gray-400 hover:text-emerald-600">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-2 flex-1 overflow-auto space-y-1">
                    {evals.map(e => (
                        <button key={e.id} onClick={() => setSelEvalId(e.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selEvalId === e.id ? "bg-emerald-50 border border-emerald-200 shadow-sm" : "hover:bg-gray-100 border border-transparent"}`}>
                            <div className={`font-semibold text-[13px] truncate ${selEvalId === e.id ? "text-emerald-800" : "text-gray-800"}`}>{e.name}</div>
                            {e.description && <div className="text-[10px] text-gray-500 truncate mt-0.5">{e.description}</div>}
                        </button>
                    ))}
                    {evals.length === 0 && <div className="text-xs text-gray-400 p-4 text-center">No Evals found.</div>}
                </div>
            </div>

            {/* ── CENTER AREA ── */}
            <div className="flex-1 overflow-auto">
                {showNew && !selEvalId && (
                    <div className="max-w-xl mx-auto mt-16 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-emerald-600" /> Create Evaluation Suite
                        </h2>
                        <div className="space-y-4 text-sm">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Name</label>
                                <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full border border-gray-300 rounded p-2 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="e.g. Email Classifier V2 Eval" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Description</label>
                                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full border border-gray-300 rounded p-2 outline-none" placeholder="Optional" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Target Workflow</label>
                                <select value={selWf} onChange={e => setSelWf(e.target.value)} className="w-full border border-gray-300 rounded p-2 outline-none">
                                    <option value="">Select a workflow to test...</option>
                                    {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button onClick={() => setShowNew(false)} className="px-4 py-2 border border-gray-300 rounded text-gray-600 font-semibold hover:bg-gray-50">Cancel</button>
                                <button onClick={handleCreate} disabled={!newName || !selWf} className="px-4 py-2 bg-emerald-600 text-white rounded font-bold disabled:opacity-50 hover:bg-emerald-700">Create</button>
                            </div>
                        </div>
                    </div>
                )}

                {selEval && (
                    <div className="p-8 max-w-5xl mx-auto space-y-6">

                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{selEval.name}</h1>
                                <p className="text-sm text-gray-500 mt-1">{selEval.description}</p>
                            </div>
                            <button onClick={runEval} disabled={running} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm font-bold disabled:opacity-50 transition-all">
                                {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                                {running ? "Evaluating..." : "Run Evaluation"}
                            </button>
                        </div>

                        {/* Stats Banner */}
                        {latestRun && latestRun.status === "complete" && latestRun.summary && (
                            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
                                <div className="flex gap-12">
                                    <div>
                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Latest Score</div>
                                        <div className="text-3xl font-black text-gray-900">{(latestRun.summary.avgScore * 100).toFixed(0)}%</div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Passed</div>
                                        <div className="text-3xl font-black text-emerald-600">{latestRun.summary.passed} <span className="text-base text-gray-400 font-medium">/ {latestRun.summary.total}</span></div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 font-medium">Run ID: <span className="font-mono">{latestRun.id.split('-')[0]}</span></div>
                                    <div className="text-xs text-gray-400 mt-0.5">{new Date(latestRun.finishedAt).toLocaleString()}</div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            {/* Test Cases List */}
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col max-h-[600px]">
                                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                                    <span className="font-bold text-sm text-gray-700 flex items-center gap-2"><Layers className="w-4 h-4 text-emerald-600" /> Test Cases</span>
                                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">{selEval.testCases?.length || 0} cases</span>
                                </div>
                                <div className="overflow-auto p-0">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2">Test Name</th>
                                                <th className="px-4 py-2">Expected Out</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selEval.testCases?.map((tc: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-medium text-gray-800">{tc.description}</td>
                                                    <td className="px-4 py-3 text-gray-500 font-mono text-[10px] break-all">{tc.expectedOutput}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Latest Results Details */}
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col max-h-[600px]">
                                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                                    <BrainCircuit className="w-4 h-4 text-emerald-600" />
                                    <span className="font-bold text-sm text-gray-700">LLM-as-a-Judge Results</span>
                                </div>
                                <div className="overflow-auto p-4 space-y-4">
                                    {latestRun?.results ? (
                                        latestRun.results.map((r: any, i: number) => (
                                            <div key={i} className={`p-3 rounded-lg border ${r.passed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-xs flex items-center gap-1.5">
                                                        {r.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                                                        Case {i + 1}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.passed ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800"}`}>
                                                        Score: {r.score}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                                                    <div>
                                                        <div className="text-gray-500 mb-0.5 font-sans font-bold">Expected</div>
                                                        <div className="p-1.5 bg-white border border-gray-200 rounded text-gray-700 break-words">{r.expectedOutput || "—"}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-gray-500 mb-0.5 font-sans font-bold">Actual LLM Out</div>
                                                        <div className="p-1.5 bg-white border border-gray-200 rounded text-gray-700 break-words">{r.actualOutput || "—"}</div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-[10px] text-gray-600 italic border-t border-gray-200/50 pt-2">
                                                    <strong className="text-gray-700">Judge reasoning:</strong> {r.judgeReason}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center text-sm text-gray-400 py-12">No runs yet. Click "Run Evaluation" above.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
                {!selEval && !showNew && <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium">Select an Eval from the left or create a new one.</div>}
            </div>
        </div>
    );
}
