import React from 'react';
import { Activity, ShieldAlert, Zap, BarChart3, TrendingUp, Users } from 'lucide-react';

export const MetricsDashboard = () => {
    return (
        <div className="w-full h-full bg-[#0D1017] p-8 text-white overflow-y-auto">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-cyan-500" />
                        Operational Readiness Metrics
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Real-time telemetry and resource allocation aggregates</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Live Feed
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Updated: Just Now</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-[#161B22] p-6 rounded-lg border border-white/5 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 font-medium text-sm">Active Field Assets</span>
                        <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-4xl font-black text-white mb-2">1,204</div>
                    <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                        <TrendingUp className="w-3 h-3" /> +14% compared to yesterday
                    </div>
                </div>

                <div className="bg-[#161B22] p-6 rounded-lg border border-white/5 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 font-medium text-sm">Critical Anomalies</span>
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="text-4xl font-black text-white mb-2">3</div>
                    <div className="text-xs text-amber-400 flex items-center gap-1 font-medium">
                        Pending Inspector Handoff
                    </div>
                </div>

                <div className="bg-[#161B22] p-6 rounded-lg border border-white/5 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 font-medium text-sm">Personnel Deployed</span>
                        <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-4xl font-black text-white mb-2">8,492</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        Across 34 active operations
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-[2fr,1fr] gap-6">
                {/* Main Line Chart Mockup */}
                <div className="bg-[#161B22] p-6 rounded-lg border border-white/5 shadow-lg flex flex-col">
                    <h3 className="text-slate-200 font-bold mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-500" />
                        Threat Probability Index (72h)
                    </h3>
                    <div className="flex-1 relative w-full h-64 border-b border-l border-white/10">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-white/5 h-0"></div>)}
                        </div>
                        {/* Mock SVG Line */}
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <path d="M0,80 C20,70 30,90 50,40 C70,-10 80,60 100,20 L100,100 L0,100 Z" fill="rgba(6, 182, 212, 0.1)" />
                            <path d="M0,80 C20,70 30,90 50,40 C70,-10 80,60 100,20" fill="none" stroke="#06b6d4" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            {/* Points */}
                            <circle cx="50" cy="40" r="1.5" fill="#fff" className="animate-pulse" />
                            <circle cx="100" cy="20" r="1.5" fill="#fff" className="animate-pulse" />
                        </svg>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-3">
                        <span>-72h</span>
                        <span>-48h</span>
                        <span>-24h</span>
                        <span>Now</span>
                    </div>
                </div>

                {/* Right Bar Chart Mockup */}
                <div className="bg-[#161B22] p-6 rounded-lg border border-white/5 shadow-lg flex flex-col">
                    <h3 className="text-slate-200 font-bold mb-6">Asset Distribution by Base</h3>
                    <div className="flex-1 flex flex-col justify-end gap-4">
                        <div className="w-full flex items-center gap-3 text-xs text-slate-400">
                            <span className="w-20 text-right">RAMSTEIN</span>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 w-[85%] rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                            </div>
                            <span className="w-8 font-mono text-cyan-300">85%</span>
                        </div>
                        <div className="w-full flex items-center gap-3 text-xs text-slate-400">
                            <span className="w-20 text-right">HOHENFELS</span>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[60%] rounded-full"></div>
                            </div>
                            <span className="w-8 font-mono text-indigo-300">60%</span>
                        </div>
                        <div className="w-full flex items-center gap-3 text-xs text-slate-400">
                            <span className="w-20 text-right">SPANGDAHLEM</span>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[45%] rounded-full"></div>
                            </div>
                            <span className="w-8 font-mono text-purple-300">45%</span>
                        </div>
                        <div className="w-full flex items-center gap-3 text-xs text-slate-400">
                            <span className="w-20 text-right">VILSECK</span>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 w-[30%] rounded-full"></div>
                            </div>
                            <span className="w-8 font-mono text-rose-300">30%</span>
                        </div>
                        <div className="w-full flex items-center gap-3 text-xs text-slate-400">
                            <span className="w-20 text-right">GRAFENWOEHR</span>
                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[75%] rounded-full"></div>
                            </div>
                            <span className="w-8 font-mono text-amber-300">75%</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
