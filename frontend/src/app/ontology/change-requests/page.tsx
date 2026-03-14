"use client";

import React, { useEffect, useState } from "react";
import {
    GitPullRequest,
    CheckCircle,
    XCircle,
    Clock,
    ChevronRight,
    ArrowLeft,
    Database,
    Loader2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { ApiClient } from "@/lib/apiClient";

export default function ChangeRequestsPage() {
    const [crs, setCrs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const loadCRs = async () => {
        setLoading(true);
        try {
            const res = await ApiClient.get<any[]>("/api/ontology/change-requests", { status: "IN_REVIEW" });
            setCrs(res || []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCRs();
    }, []);

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            await ApiClient.post(`/api/ontology/change-requests/${id}/approve`, {});
            loadCRs();
        } catch (e: any) {
            alert("Merge failed: " + e.message);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#F5F8FA] text-[#182026] font-[Inter,sans-serif]">
            {/* Header */}
            <header className="h-14 bg-white border-b border-[#CED9E0] flex items-center justify-between px-6 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/ontology" className="p-2 hover:bg-[#EBF1F5] rounded-full transition-colors">
                        <ArrowLeft className="w-4 h-4 text-[#5C7080]" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <GitPullRequest className="w-5 h-5 text-[#137CBD]" />
                        <h1 className="font-bold text-[16px]">Change Requests</h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-auto p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-6">
                        <h2 className="text-[20px] font-bold">Pending Reviews</h2>
                        <p className="text-[13px] text-[#5C7080]">Review and merge ontology changes from sandbox branches into main.</p>
                    </div>

                    {loading && crs.length === 0 ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-[#CED9E0]" />
                        </div>
                    ) : crs.length === 0 ? (
                        <div className="bg-white border border-[#CED9E0] rounded-lg p-12 text-center">
                            <div className="w-16 h-16 bg-[#F5F8FA] rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-[#0F9960] opacity-30" />
                            </div>
                            <h3 className="font-bold text-[16px]">No pending changes</h3>
                            <p className="text-[13px] text-[#5C7080] mt-1">All ontology branches are currently in sync or merged.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {crs.map(cr => (
                                <div key={cr.id} className="bg-white border border-[#CED9E0] rounded-lg shadow-sm overflow-hidden flex flex-col">
                                    <div className="p-5 flex items-start justify-between border-b border-[#F5F8FA]">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-[#EBF1F5] rounded flex items-center justify-center shrink-0">
                                                <GitPullRequest className="w-5 h-5 text-[#137CBD]" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-[15px]">Merge branch '{cr.branchName}' into 'main'</div>
                                                <div className="text-[11px] text-[#5C7080] flex items-center gap-2 mt-1">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(cr.createdAt).toLocaleString()}</span>
                                                    <span>•</span>
                                                    <span>Created by {cr.createdBy}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                disabled={!!processingId}
                                                className="px-4 py-1.5 border border-[#CED9E0] hover:bg-[#F5F8FA] text-[12px] font-bold rounded transition-colors disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleApprove(cr.id)}
                                                disabled={!!processingId}
                                                className="px-4 py-1.5 bg-[#0F9960] hover:bg-[#0D8050] text-white text-[12px] font-bold rounded transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {processingId === cr.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                Approve & Merge
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-[#F5F8FA]/50 p-5 grid grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="text-[11px] font-bold text-[#5C7080] uppercase tracking-wider mb-3">Proposed Changes</h4>
                                            <div className="space-y-2">
                                                {cr.diff?.added?.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <div className="bg-[#0F9960] text-white text-[9px] font-bold px-1.5 rounded mt-0.5">ADD</div>
                                                        <div className="text-[12px] font-mono text-[#182026]">
                                                            {cr.diff.added.join(", ")}
                                                        </div>
                                                    </div>
                                                )}
                                                {cr.diff?.modified?.length > 0 && (
                                                    <div className="flex items-start gap-2">
                                                        <div className="bg-[#D9822B] text-white text-[9px] font-bold px-1.5 rounded mt-0.5">MOD</div>
                                                        <div className="text-[12px] font-mono text-[#182026]">
                                                            {cr.diff.modified.join(", ")}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="border-l border-[#CED9E0] pl-8">
                                            <h4 className="text-[11px] font-bold text-[#5C7080] uppercase tracking-wider mb-3">Impact Analysis</h4>
                                            <div className="flex items-center gap-2 text-[#5C7080]">
                                                <AlertCircle className="w-4 h-4 text-[#D9822B]" />
                                                <span className="text-[12px]">Branch contains {cr.proposedChanges?.entitiesCount || 0} object definitions.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
