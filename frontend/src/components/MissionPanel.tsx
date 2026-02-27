import React, { useState, useEffect } from 'react';
import { Activity, X, AlertTriangle, PlayCircle, Shield, History, MapPin } from 'lucide-react';
import { ApiClient } from '@/lib/apiClient';

interface MissionPanelProps {
    entityId: string;
    entityDetails: any;
    onClose: () => void;
}

export function MissionPanel({ entityId, entityDetails, onClose }: MissionPanelProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'telemetry' | 'alerts' | 'actions'>('details');
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        // Mock fetching alerts for the entity
        setAlerts([
            { id: 1, type: 'Geofence Breach', severity: 'High', time: '2m ago' },
            { id: 2, type: 'Signal Loss Delay', severity: 'Medium', time: '1h ago' }
        ]);
    }, [entityId]);

    const tabs = [
        { id: 'details', label: 'Details', icon: MapPin },
        { id: 'telemetry', label: 'Telemetry', icon: Activity },
        { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
        { id: 'actions', label: 'Actions', icon: PlayCircle },
    ] as const;

    return (
        <div className="absolute right-0 top-16 bottom-0 w-[400px] z-30 pointer-events-auto bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-200">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                        <Shield className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">{entityId}</h2>
                        <p className="text-[10px] text-cyan-400 font-mono">Mission Control Active</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex px-2 border-b border-white/10 bg-black/20">
                {tabs.map(t => {
                    const Icon = t.icon;
                    const isActive = activeTab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors border-b-2 ${isActive ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-white/50 hover:text-white/80'
                                }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {t.label}
                        </button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

                {activeTab === 'details' && (
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-xl border border-white/10 p-3">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Core Identity Context</h3>
                            <div className="flex flex-col gap-2 text-xs">
                                {Object.entries(entityDetails?.data || {}).map(([key, val]) => (
                                    <div key={key} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                                        <span className="text-white/60 capitalize">{key.replace(/_/g, ' ')}</span>
                                        <span className="text-white font-mono break-all text-right ml-4 max-w-[60%] bg-black/40 px-2 py-0.5 rounded">{String(val)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-cyan-500/10 rounded-xl border border-cyan-500/20 p-3">
                            <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2">Provenance Lineage</h3>
                            <p className="text-xs text-white/70 mb-3">This entity was fused from 3 distinct sources.</p>
                            <button className="w-full py-1.5 bg-black/40 hover:bg-black/60 text-cyan-400 text-xs font-mono rounded border border-cyan-500/30 transition-colors flex items-center justify-center gap-2">
                                <History className="w-3 h-3" /> View Lineage Graph
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'telemetry' && (
                    <div className="flex items-center justify-center h-full flex-col gap-3 text-white/30">
                        <Activity className="w-8 h-8 opacity-50 mb-2" />
                        <p className="text-sm font-semibold">Live Telemetry Stream</p>
                        <p className="text-xs text-center max-w-[80%]">Connecting to secure websocket for high-frequency measurements...</p>
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="space-y-2">
                        {alerts.map(a => (
                            <div key={a.id} className="bg-red-500/10 border-l-2 border-red-500 p-3 rounded-r-xl">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-xs font-bold text-red-400">{a.type}</h4>
                                    <span className="text-[9px] text-red-400/60 font-mono">{a.time}</span>
                                </div>
                                <p className="text-[10px] text-white/60">Severity: <span className="text-red-400">{a.severity}</span></p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'actions' && (
                    <div className="space-y-3">
                        <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 rounded-xl transition-all group text-left">
                            <div className="p-2 bg-black/40 rounded-lg group-hover:bg-cyan-500/20 text-white/50 group-hover:text-cyan-400">
                                <PlayCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white">Execute Intercept Vector</h4>
                                <p className="text-[10px] text-white/50 mt-0.5">Calculates and sends intercept path to closest asset</p>
                            </div>
                        </button>

                        <button className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group text-left">
                            <div className="p-2 bg-black/40 rounded-lg text-white/50 group-hover:text-white">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white">Quarantine Data</h4>
                                <p className="text-[10px] text-white/50 mt-0.5">Halts upstream flow and isolates entity state</p>
                            </div>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

