'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ApiClient } from '@/lib/apiClient';
import { useWorkspaceStore } from '@/store/workspaceStore';
import {
    AlertTriangle,
    Brain,
    CheckCircle2,
    ChevronDown,
    Clock,
    Loader2,
    RefreshCcw,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
    Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CoaOption {
    id: string; name: string; description: string;
    probabilityOfSuccess: number; estimatedTimeHours: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    requiredAssets: string[]; keyAssumptions: string[]; risks: string[];
}
interface CoaResult { options: CoaOption[]; generatedAt: string; }

// ─── Risk level config ────────────────────────────────────────────────────────
const RISK = {
    LOW: { color: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/8', Icon: ShieldCheck },
    MEDIUM: { color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/8', Icon: Shield },
    HIGH: { color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/8', Icon: ShieldAlert },
    CRITICAL: { color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/8', Icon: AlertTriangle },
};

// ─── Probability bar ──────────────────────────────────────────────────────────
const ProbBar = ({ value }: { value: number }) => {
    const color = value >= 75 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-pt-text-muted uppercase tracking-widest font-black">P(Success)</span>
                <span className="font-black" style={{ color }}>{value}%</span>
            </div>
            <div className="h-1 bg-pt-bg rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
            </div>
        </div>
    );
};

// ─── CoA Card ────────────────────────────────────────────────────────────────
const CoaCard = ({ coa, selected, onSelect, onCommit }: {
    coa: CoaOption; selected: boolean;
    onSelect: () => void;
    onCommit: () => void;
}) => {
    const risk = RISK[coa.riskLevel] || RISK.MEDIUM;
    return (
        <div onClick={onSelect} className={`flex flex-col rounded border cursor-pointer transition-all ${selected ? `${risk.border} ${risk.bg}` : 'border-pt-border bg-pt-bg-panel/30 hover:border-pt-border-dark'
            }`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${selected ? risk.border : 'border-pt-border/50'}`}>
                <div className="flex items-center gap-2">
                    <risk.Icon size={14} className={risk.color} />
                    <span className="text-[11px] font-black uppercase tracking-tight text-pt-text">{coa.name}</span>
                </div>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${risk.border} ${risk.color}`}>
                    {coa.riskLevel}
                </span>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-4 flex-1">
                <p className="text-[11px] text-pt-text-muted leading-relaxed">{coa.description}</p>

                <ProbBar value={coa.probabilityOfSuccess} />

                <div className="flex gap-4 text-[9px]">
                    <div className="flex items-center gap-1.5 text-pt-text-muted">
                        <Clock size={9} />
                        <span className="font-black">{coa.estimatedTimeHours}h</span>
                        <span className="opacity-40">est.</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-pt-text-muted">
                        <Target size={9} />
                        <span className="font-black">{coa.requiredAssets.length}</span>
                        <span className="opacity-40">assets</span>
                    </div>
                </div>

                {/* Required Assets */}
                <div>
                    <div className="text-[7px] font-black uppercase tracking-widest text-pt-text-muted mb-1.5">Required Assets</div>
                    <div className="flex flex-wrap gap-1">
                        {coa.requiredAssets.map(a => (
                            <span key={a} className="px-1.5 py-0.5 text-[8px] font-black uppercase bg-pt-bg border border-pt-border rounded">{a}</span>
                        ))}
                    </div>
                </div>

                {/* Assumptions & Risks */}
                {selected && (
                    <div className="grid grid-cols-2 gap-4 mt-1 pt-3 border-t border-pt-border/40">
                        <div>
                            <div className="text-[7px] font-black uppercase tracking-widest text-pt-text-muted mb-1.5">Key Assumptions</div>
                            <ul className="space-y-1">
                                {coa.keyAssumptions.map((a, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-[9px] text-pt-text-muted">
                                        <CheckCircle2 size={9} className="text-green-400 mt-0.5 shrink-0" /> {a}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <div className="text-[7px] font-black uppercase tracking-widest text-pt-text-muted mb-1.5">Risk Factors</div>
                            <ul className="space-y-1">
                                {coa.risks.map((r, i) => (
                                    <li key={i} className="flex items-start gap-1.5 text-[9px] text-pt-text-muted">
                                        <AlertTriangle size={9} className="text-red-400 mt-0.5 shrink-0" /> {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Commit button */}
                {selected && (
                    <button
                        onClick={e => { e.stopPropagation(); onCommit(); }}
                        className="mt-2 w-full py-2 bg-pt-intent-primary/20 border border-pt-intent-primary/40 text-pt-intent-primary text-[9px] font-black uppercase tracking-widest rounded hover:bg-pt-intent-primary hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Zap size={11} /> Commit as Action Proposal
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CoaSimPage() {
    const [threat, setThreat] = useState('');
    const [assets, setAssets] = useState('');
    const [constraints, setConstraints] = useState('');
    const [objective, setObjective] = useState('NEUTRALIZE');
    const [result, setResult] = useState<CoaResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedCoaId, setSelectedCoaId] = useState<string | null>(null);
    const [committed, setCommitted] = useState<string | null>(null);
    const { activeProjectId } = useWorkspaceStore();

    const simulate = async () => {
        if (!threat.trim()) return;
        setLoading(true); setResult(null); setSelectedCoaId(null); setCommitted(null);
        try {
            const res = await ApiClient.post<CoaResult>('/api/v1/maven/coa/simulate', {
                threatDescription: threat,
                availableAssets: assets || undefined,
                constraints: constraints || undefined,
                objectiveType: objective,
                projectId: activeProjectId
            });
            setResult(res);
            if (res.options?.[0]) setSelectedCoaId(res.options[0].id);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleCommit = async (coa: CoaOption) => {
        try {
            await ApiClient.post('/api/v1/maven/proposals', {
                projectId: activeProjectId,
                title: `CoA: ${coa.name}`,
                description: `${coa.description} (P(S): ${coa.probabilityOfSuccess}% | Risk: ${coa.riskLevel} | ETA: ${coa.estimatedTimeHours}h)`,
                parameters: coa,
                riskTier: coa.riskLevel.toLowerCase()
            });
            setCommitted(coa.id);
        } catch (e) { console.error(e); }
    };

    const selectedCoa = result?.options.find(o => o.id === selectedCoaId) ?? null;

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Sim input panel */}
            <div className="shrink-0 border-b border-pt-border bg-pt-bg-panel/40 px-6 py-5">
                <div className="flex items-center gap-3 mb-5">
                    <Brain size={16} className="text-pt-intent-primary" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Course-of-Action Simulation</span>
                    <span className="text-[8px] font-black uppercase text-pt-text-muted opacity-40 px-2 py-0.5 border border-pt-border rounded ml-1">Gemini-Powered</span>
                </div>
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted mb-1.5 block">
                            Threat / Situation Description *
                        </label>
                        <textarea
                            value={threat} onChange={e => setThreat(e.target.value)}
                            placeholder="e.g. Hostile convoy spotted at grid 42UXC at 0300Z, 12 vehicles, moving north toward critical infrastructure..."
                            className="w-full h-20 bg-pt-bg border border-pt-border rounded px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-pt-intent-primary resize-none placeholder:opacity-30"
                        />
                    </div>
                    <div className="col-span-3">
                        <label className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted mb-1.5 block">Available Assets</label>
                        <textarea
                            value={assets} onChange={e => setAssets(e.target.value)}
                            placeholder="e.g. 2x ISR drones, 1x QRF platoon, SIGINT ground station..."
                            className="w-full h-20 bg-pt-bg border border-pt-border rounded px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-pt-intent-primary resize-none placeholder:opacity-30"
                        />
                    </div>
                    <div className="col-span-2 flex flex-col gap-3">
                        <div>
                            <label className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted mb-1.5 block">Objective</label>
                            <select value={objective} onChange={e => setObjective(e.target.value)}
                                className="w-full bg-pt-bg border border-pt-border rounded px-2 py-1.5 text-[9px] font-black uppercase focus:outline-none focus:border-pt-intent-primary">
                                {['NEUTRALIZE', 'DISRUPT', 'OBSERVE', 'CAPTURE', 'DENY', 'PROTECT'].map(o => (
                                    <option key={o} value={o}>{o}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[8px] font-black uppercase tracking-widest text-pt-text-muted mb-1.5 block">Constraints</label>
                            <input value={constraints} onChange={e => setConstraints(e.target.value)}
                                placeholder="ROE, exclusion zones..."
                                className="w-full bg-pt-bg border border-pt-border rounded px-2 py-1.5 text-[9px] font-mono focus:outline-none focus:border-pt-intent-primary placeholder:opacity-30" />
                        </div>
                    </div>
                    <div className="col-span-2 flex items-end">
                        <button onClick={simulate} disabled={loading || !threat.trim()}
                            className="w-full py-3 bg-pt-intent-primary text-white text-[9px] font-black uppercase tracking-widest rounded hover:brightness-110 transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                            {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            {loading ? 'Simulating...' : 'Run Simulation'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {!result && !loading && (
                    <div className="flex flex-col items-center justify-center h-full opacity-15">
                        <Brain size={48} className="mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Describe a threat to generate CoA options</p>
                    </div>
                )}
                {loading && (
                    <div className="flex flex-col items-center justify-center h-full opacity-30">
                        <Brain size={40} className="animate-pulse mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Gemini generating 3 CoA options...</p>
                    </div>
                )}
                {result && (
                    <>
                        <div className="flex items-center gap-3 mb-5">
                            <Sparkles size={12} className="text-pt-intent-primary" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-pt-text-muted">
                                {result.options.length} options generated · {new Date(result.generatedAt).toLocaleTimeString()}
                            </span>
                            <button onClick={simulate} className="ml-auto flex items-center gap-1.5 text-[8px] font-black uppercase text-pt-text-muted hover:text-pt-text transition-colors">
                                <RefreshCcw size={9} /> Regenerate
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-5">
                            {result.options.map(coa => (
                                <div key={coa.id} className="relative">
                                    {committed === coa.id && (
                                        <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <CheckCircle2 size={8} /> Committed
                                        </div>
                                    )}
                                    <CoaCard
                                        coa={coa}
                                        selected={coa.id === selectedCoaId}
                                        onSelect={() => setSelectedCoaId(coa.id)}
                                        onCommit={() => handleCommit(coa)}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
