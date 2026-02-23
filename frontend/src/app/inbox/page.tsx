"use client";

import { useState, useEffect } from "react";
import {
    CheckCircle2,
    XCircle,
    Clock,
    ArrowRight,
    BrainCircuit,
    LineChart,
    ShieldAlert,
    Terminal,
    Database,
    Loader2,
    Check
} from "lucide-react";
import { ApiClient } from "@/lib/apiClient";
import * as T from '@/lib/types';

export default function DecisionInbox() {
    const [inboxItems, setInboxItems] = useState<T.DecisionLog[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadInbox() {
            try {
                // Fetch live decision logs from the backend
                const data = await ApiClient.get<T.DecisionLog[]>('/decision-logs?status=PENDING');
                setInboxItems(data);
                if (data.length > 0) {
                    setSelectedItem(data[0]);
                }
            } catch (err) {
                console.error("Error loading inbox:", err);
            } finally {
                setLoading(false);
            }
        }
        loadInbox();
    }, []);

    const handleApprove = async () => {
        if (!selectedItem) return;
        try {
            await ApiClient.post(`/decisions/${selectedItem.logicalId}/evaluate`, {
                ruleId: selectedItem.decisionRuleId
            });
            // Remove from local state after approval
            setInboxItems(prev => prev.filter(i => i.id !== selectedItem.id));
            setSelectedItem(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="h-full w-full flex flex-col p-6 z-10 relative bg-white text-slate-900 border-t border-slate-200">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        Decision Inbox
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Human-in-the-loop approval queue for Decision Rules lacking auto-execute permissions.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded flex flex-col items-center">
                        <span className="text-xs text-slate-500 uppercase font-semibold">Pending</span>
                        <span className="text-lg font-bold text-orange-600">{loading ? '--' : inboxItems.length}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* Left List: Pending Items */}
                <div className="col-span-4 flex flex-col gap-2 overflow-y-auto pr-2 pb-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                            <p className="text-sm">Fetching live decision logs...</p>
                        </div>
                    ) : inboxItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-slate-200 border-dashed rounded text-slate-500">
                            <Check className="w-8 h-8 text-emerald-500 mb-2" />
                            <p className="text-sm font-semibold text-slate-700">Inbox Zero</p>
                            <p className="text-xs mt-1">No pending decisions require human approval.</p>
                        </div>
                    ) : (
                        inboxItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className={`
                                    p-3 rounded cursor-pointer transition-all border shadow-sm
                                    ${selectedItem?.id === item.id
                                        ? 'bg-blue-50/50 border-blue-200'
                                        : 'bg-white border-slate-200 hover:border-blue-300'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded border border-orange-200">
                                        {item.status}
                                    </span>
                                    <span className="text-xs flex items-center text-slate-400">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-sm text-slate-800">{item.decisionRule?.name || "Unknown Rule"}</h3>
                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <Database className="w-3 h-3" /> {item.logicalId}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Right Detail Pane */}
                <div className="col-span-8 bg-white border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    {!selectedItem ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50/50">
                            Select a pending decision to review
                        </div>
                    ) : (
                        <>
                            {/* Detail Header */}
                            <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">{selectedItem.decisionRule?.name}</h2>
                                        <p className="text-slate-500 text-xs mt-1">Entity: <span className="text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded border border-blue-100">{selectedItem.logicalId}</span></p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded transition-colors border border-slate-300">
                                            <XCircle className="w-3.5 h-3.5" /> Reject & Skip
                                        </button>
                                        <button
                                            onClick={handleApprove}
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors shadow-sm"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Execute
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                {/* AI Copilot Insight Panel */}
                                <div className="bg-indigo-50/50 border border-indigo-100 rounded p-4 relative overflow-hidden">
                                    <h3 className="flex items-center text-indigo-800 font-semibold mb-2 text-xs uppercase">
                                        <BrainCircuit className="w-3.5 h-3.5 mr-1.5" />
                                        AIP Copilot Context
                                    </h3>
                                    <p className="text-slate-700 text-sm leading-relaxed border-l-2 border-indigo-300 pl-3">
                                        This alert was generated by the <strong>{selectedItem.triggerType}</strong> trigger.
                                        Review the condition outcomes below before executing the plan.
                                    </p>
                                </div>

                                {/* Evaluation Trace (Why did this fire) */}
                                <div>
                                    <h3 className="text-slate-700 font-semibold mb-3 flex items-center text-sm">
                                        <ShieldAlert className="w-4 h-4 mr-1.5 text-slate-500" />
                                        Evaluation Trace (Conditions)
                                    </h3>
                                    <div className="border border-slate-200 rounded overflow-hidden">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-3 py-2 font-semibold">Field</th>
                                                    <th className="px-3 py-2 font-semibold">Operator</th>
                                                    <th className="px-3 py-2 font-semibold">Expected</th>
                                                    <th className="px-3 py-2 font-semibold">Actual</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {Array.isArray(selectedItem.conditionResults) && selectedItem.conditionResults.length > 0 ? (
                                                    selectedItem.conditionResults.map((c: any, i: number) => (
                                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-3 py-2.5 font-mono text-slate-800">{c.field ?? '--'}</td>
                                                            <td className="px-3 py-2.5 font-mono text-slate-500">{c.operator ?? '--'}</td>
                                                            <td className="px-3 py-2.5 text-slate-700">{c.value !== undefined ? String(c.value) : '--'}</td>
                                                            <td className="px-3 py-2.5 font-semibold text-orange-600">{c.actual !== undefined ? String(c.actual) : '--'}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-3 py-4 text-center text-slate-400">No condition results tracing available.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Trigger Data Snapshot */}
                                <div>
                                    <h3 className="text-slate-700 font-semibold mb-3 flex items-center text-sm">
                                        <Terminal className="w-4 h-4 mr-1.5 text-slate-500" />
                                        Data Snapshot
                                    </h3>
                                    <div className="bg-slate-900 border border-slate-800 rounded p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                                        <pre>{JSON.stringify(selectedItem.triggerData, null, 2)}</pre>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
