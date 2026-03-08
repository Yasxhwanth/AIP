"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, Activity, Shield, Cloud, Server, AlertTriangle, CheckCircle2, RotateCcw, Play, Loader2, GitCommit } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type ApolloEnv = {
    id: string;
    name: string;
    tier: string;
    description: string;
    active: boolean;
    deployments: any[];
    healthChecks: any[];
};

export default function ApolloPage() {
    const [envs, setEnvs] = useState<ApolloEnv[]>([]);
    const [loading, setLoading] = useState(true);
    const [deploying, setDeploying] = useState<string | null>(null);
    const [rollingBack, setRollingBack] = useState<string | null>(null);

    const [showDeploy, setShowDeploy] = useState<string | null>(null); // envId
    const [deployVer, setDeployVer] = useState("");
    const [canaryPct, setCanaryPct] = useState(100);

    const fetchEnvs = useCallback(async () => {
        try {
            const res = await fetch(`${API}/api/apollo/environments`);
            if (res.ok) setEnvs(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEnvs();
        const int = setInterval(fetchEnvs, 5000); // Poll every 5s for fast demo feedback
        return () => clearInterval(int);
    }, [fetchEnvs]);

    const handleDeploy = async (envId: string) => {
        if (!deployVer) return alert("Enter release version");
        setDeploying(envId);
        setShowDeploy(null);
        try {
            await fetch(`${API}/api/apollo/deploy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ environmentId: envId, releaseVersion: deployVer, canaryPercent: canaryPct })
            });
            await fetchEnvs();
        } finally {
            setDeploying(null);
            setDeployVer("");
            setCanaryPct(100);
        }
    };

    const handleRollback = async (envId: string, deployId: string) => {
        if (!confirm("Are you sure you want to rollback to this release?")) return;
        setRollingBack(deployId);
        try {
            await fetch(`${API}/api/apollo/deployments/${deployId}/rollback`, { method: "POST" });
            await fetchEnvs();
        } finally {
            setRollingBack(null);
        }
    };

    const getHealthColor = (checks: any[]) => {
        if (!checks || checks.length === 0) return "#8A9BA8";
        const hasDown = checks.some(c => c.status === "down");
        const hasDegraded = checks.some(c => c.status === "degraded");
        if (hasDown) return "#C23030";
        if (hasDegraded) return "#D9822B";
        return "#0D8050";
    };

    const StatusBadge = ({ deploy }: { deploy: any }) => {
        if (!deploy) return <span className="text-gray-400 text-[10px] font-medium">None</span>;

        const colors: Record<string, string> = {
            "pending": "bg-slate-100 text-slate-500",
            "deploying": "bg-blue-50 text-blue-600 animate-pulse",
            "healthy": "bg-emerald-50 text-emerald-700",
            "degraded": "bg-orange-50 text-orange-700",
            "rolled-back": "bg-red-50 text-red-700"
        };

        return (
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${colors[deploy.status] || "bg-gray-100 text-gray-500"}`}>
                {deploy.status} {deploy.strategy === 'canary' && `(${deploy.canaryPercent}%)`}
            </span>
        );
    };

    if (loading) return <div className="p-8 text-sm text-gray-500">Loading Apollo Control Plane...</div>;

    return (
        <div className="flex flex-col h-full bg-[#F5F8FA] font-sans">
            <div className="h-12 border-b border-gray-200 bg-white flex items-center px-6 shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-[13px] font-bold text-slate-900 leading-tight">Apollo Infrastructure Node</div>
                        <div className="text-[10px] text-slate-500 font-medium">Continuous Operations & Deployment</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {envs.map(env => {
                            const activeDeploy = env.deployments?.[0];
                            const healthColor = getHealthColor(env.healthChecks);
                            const Icon = env.tier === "cloud" ? Cloud : env.tier === "classified" ? Shield : Server;

                            return (
                                <div key={env.id} className="bg-white border text-sm border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4 text-slate-400" />
                                                <span className="font-bold text-slate-900">{env.name}</span>
                                            </div>
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: healthColor }} />
                                        </div>
                                        <div className="text-[11px] text-slate-500">{env.description}</div>
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col gap-4 bg-slate-50/50">
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Active Release</div>
                                            {activeDeploy ? (
                                                <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded">
                                                    <div className="flex items-center gap-1.5">
                                                        <GitCommit className="w-3.5 h-3.5 text-blue-500" />
                                                        <span className="font-mono text-xs font-semibold text-slate-700">{activeDeploy.releaseVersion}</span>
                                                    </div>
                                                    <StatusBadge deploy={activeDeploy} />
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-400 italic">No deployments found</div>
                                            )}
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                                                <span>Services Health</span>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                {["api-server", "pipeline-worker", "ws-broker"].map(svc => {
                                                    const check = env.healthChecks?.find(c => c.service === svc);
                                                    const isOk = !check || check.status === "ok";
                                                    return (
                                                        <div key={svc} className="flex items-center justify-between text-[11px]">
                                                            <span className="text-slate-600">{svc}</span>
                                                            {check ? (
                                                                <span className={`font-mono ${isOk ? "text-emerald-600" : "text-amber-600 font-bold"}`}>
                                                                    {check.status === "ok" ? "OK" : check.status.toUpperCase()}
                                                                    {check.latencyMs ? ` ${check.latencyMs}ms` : ''}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400">waiting...</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                                        <button onClick={() => setShowDeploy(env.id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors">
                                            {deploying === env.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                                            Deploy
                                        </button>
                                        <button onClick={() => activeDeploy && handleRollback(env.id, activeDeploy.id)} disabled={!activeDeploy || rollingBack === activeDeploy.id} className="flex-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold py-1.5 rounded disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors">
                                            {rollingBack === activeDeploy?.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                            Rollback
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Deploy Modal */}
            {showDeploy && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center font-sans">
                    <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden border border-slate-200">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                            <Cloud className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-slate-900 text-sm">Deploy Release</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Release Version</label>
                                <input value={deployVer} onChange={e => setDeployVer(e.target.value)} placeholder="e.g. v3.4.1"
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Strategy: Canary Percent</label>
                                    <span className="text-xs font-bold text-blue-600">{canaryPct}%</span>
                                </div>
                                <input type="range" min="10" max="100" step="10" value={canaryPct} onChange={e => setCanaryPct(parseInt(e.target.value))}
                                    className="w-full accent-blue-600" />
                                <div className="text-[10px] text-slate-400 mt-1 leading-tight">
                                    Rollout to {canaryPct}% of nodes first. Health checks will determine promotion to 100%.
                                </div>
                            </div>
                        </div>
                        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                            <button onClick={() => setShowDeploy(null)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900">Cancel</button>
                            <button onClick={() => handleDeploy(showDeploy)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-sm">
                                Approve Deployment
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
