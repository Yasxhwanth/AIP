"use client";

import { useState, useEffect } from "react";
import { Shield, ShieldAlert, ShieldCheck, Key, FileCheck, Search, ScrollText, GitCommit, Check, AlertTriangle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ProvenancePage() {
    const [searchId, setSearchId] = useState("user_123");
    const [chains, setChains] = useState<any[]>([]);
    const [sealVerification, setSealVerification] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [sealing, setSealing] = useState(false);

    const loadProvenance = async () => {
        if (!searchId) return;
        setLoading(true);
        setSealVerification(null);
        try {
            const res = await fetch(`${API}/api/provenance/chain/${searchId}`);
            if (res.ok) setChains(await res.json());

            // Auto-verify if seal exists
            const vRes = await fetch(`${API}/api/provenance/verify/${searchId}`);
            if (vRes.ok) setSealVerification(await vRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSeal = async () => {
        if (!searchId || chains.length === 0) return alert("Search and establish provenance before sealing.");
        setSealing(true);
        try {
            await fetch(`${API}/api/provenance/seal/${searchId}`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entityType: chains[0]?.entityType || "Unknown", sealedBy: "Admin UI" })
            });
            await loadProvenance(); // Reload to show new seal
        } catch (err) {
            alert("Error sealing: " + String(err));
        } finally {
            setSealing(false);
        }
    };

    // Auto-record a mock transaction just so we have data to look at
    const mockTransaction = async () => {
        await fetch(`${API}/api/provenance/record`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                entityId: searchId, entityType: "UserAccount", operationType: "UPDATE",
                sourceSystem: "AuthService-v2", operatorId: "admin",
                fields: {
                    "role": "SuperAdmin",
                    "clearanceLevel": "Top Secret",
                    "lastLoginAt": new Date().toISOString()
                }
            })
        });
        loadProvenance();
    };

    return (
        <div className="flex flex-col h-full bg-[#111827] text-slate-300 font-sans">

            <div className="h-14 border-b border-indigo-500/20 bg-[#0F141E] flex items-center justify-between px-6 shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                        <div className="text-[14px] font-bold text-slate-100 flex items-center gap-2">
                            Military-Grade Cryptographic Provenance
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] uppercase tracking-widest border border-indigo-500/30">Classified</span>
                        </div>
                        <div className="text-[11px] text-slate-400">Zero-trust immutable audit logs & tamper detection</div>
                    </div>
                </div>
                <button onClick={mockTransaction} className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors">
                    Simulate Write Access
                </button>
            </div>

            <div className="flex-1 overflow-auto p-6 flex flex-col items-center">
                <div className="w-full max-w-4xl space-y-6">

                    {/* Search Bar */}
                    <div className="bg-[#1F2937] p-4 rounded-lg border border-slate-700 shadow-xl flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 opacity-70" />
                            <input value={searchId} onChange={e => setSearchId(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && loadProvenance()}
                                className="w-full bg-[#111827] border border-slate-700 rounded-md py-2.5 pl-9 pr-4 text-sm font-mono focus:outline-none focus:border-indigo-500 text-slate-200 placeholder:text-slate-600"
                                placeholder="Enter Entity Instance ID to verify (e.g. user_123)" />
                        </div>
                        <button onClick={loadProvenance} disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-md font-bold text-sm transition-colors shadow-lg shadow-indigo-900/20 flex items-center gap-2">
                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                            Audit Trace
                        </button>
                    </div>

                    {/* Results Area */}
                    {searchId && !loading && chains.length > 0 && (
                        <div className="grid grid-cols-12 gap-6">

                            {/* Integrity Seal Status */}
                            <div className="col-span-12 md:col-span-4 flex flex-col space-y-4">
                                <div className="bg-[#1F2937] rounded-lg border border-slate-700 p-5 shadow-xl">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Key className="w-3.5 h-3.5" /> Integrity Seal
                                    </div>

                                    {sealVerification ? (
                                        <div className="flex flex-col items-center text-center p-4">
                                            {sealVerification.valid ? (
                                                <>
                                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                                                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                                    </div>
                                                    <div className="text-lg font-bold text-emerald-400 tracking-wide">VERIFIED SECURE</div>
                                                    <div className="text-xs text-emerald-500/70 mt-1 mb-4">HMAC-SHA256 checksum matches stored tree</div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-3 animate-pulse">
                                                        <ShieldAlert className="w-8 h-8 text-red-400" />
                                                    </div>
                                                    <div className="text-lg font-bold text-red-500 tracking-wide">TAMPER DETECTED</div>
                                                    <div className="text-xs text-red-400/80 mt-1 mb-4">Checksum anomaly in underlying data rows</div>
                                                </>
                                            )}

                                            <div className="w-full bg-[#111827] rounded border border-slate-800 p-3 text-left">
                                                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Seal ID</div>
                                                <div className="text-[10px] font-mono text-slate-300 truncate">{sealVerification.sealId}</div>
                                                <div className="text-[10px] text-slate-500 uppercase font-bold mt-2 mb-1">Last Checked</div>
                                                <div className="text-xs font-mono text-slate-300">{new Date().toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-center p-4">
                                            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                                                <Shield className="w-8 h-8 text-slate-500" />
                                            </div>
                                            <div className="text-sm font-bold text-slate-300 mb-1">Entity Unsealed</div>
                                            <div className="text-xs text-slate-500 mb-5 leading-tight">No mathematical proof of integrity exists for this entity yet.</div>
                                            <button onClick={handleSeal} disabled={sealing}
                                                className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 py-2 rounded text-xs font-bold transition-colors">
                                                {sealing ? 'Computing HMAC...' : 'Generate Immutable Seal'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Immutable Hash Chain */}
                            <div className="col-span-12 md:col-span-8 bg-[#1F2937] border border-slate-700 rounded-lg shadow-xl flex flex-col">
                                <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <ScrollText className="w-3.5 h-3.5" /> Immutable Hash Chain
                                    </div>
                                    <div className="text-xs bg-[#111827] border border-slate-700 px-3 py-1 rounded text-slate-400 font-mono">
                                        Entity: <span className="text-slate-200">{searchId}</span>
                                    </div>
                                </div>
                                <div className="p-0 overflow-auto max-h-[600px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#111827] sticky top-0 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3 border-b border-slate-700">Timestamp</th>
                                                <th className="px-4 py-3 border-b border-slate-700">Mutation By</th>
                                                <th className="px-4 py-3 border-b border-slate-700">Field Segment</th>
                                                <th className="px-4 py-3 border-b border-slate-700 text-right">SHA-256 Digest</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs text-slate-300 divide-y divide-slate-800">
                                            {chains.map((chain, i) => (
                                                <tr key={chain.id} className="hover:bg-[#111827]/50 transition-colors">
                                                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                                                        {new Date(chain.recordedAt).toISOString().replace('T', ' ').slice(0, 19)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-4 h-4 rounded bg-slate-800 flex items-center justify-center border border-slate-700">
                                                                <FileCheck className="w-2.5 h-2.5 text-slate-400" />
                                                            </div>
                                                            <span className="font-bold text-indigo-400">{chain.sourceSystem}</span>
                                                            <span className="text-slate-500">({chain.operatorId})</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-amber-200/80 inline-block">
                                                            {chain.field}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2 group">
                                                            {i !== chains.length - 1 && chain.previousHash && (
                                                                <GitCommit className="w-3 h-3 text-slate-600 rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            )}
                                                            <span className="font-mono text-[10px] text-emerald-400/80 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/50">
                                                                {chain.valueHash.substring(0, 16)}...
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {searchId && !loading && chains.length === 0 && (
                        <div className="text-center p-12 py-20 bg-[#1F2937] border border-slate-700 border-dashed rounded-lg text-slate-500 flex flex-col items-center">
                            <AlertTriangle className="w-8 h-8 mb-4 text-slate-600" />
                            <div className="mb-2">No cryptographic provenance data found for this entity.</div>
                            <div className="text-xs">Click "Simulate Write Access" to generate a test chain.</div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
