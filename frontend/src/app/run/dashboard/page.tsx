"use client";

import { useState, useEffect } from "react";
import { useRuntimeStore } from "@/store/runtimeStore";
import {
    Activity, Battery, AlertTriangle, Crosshair,
    Wifi, Search, Filter, MoreHorizontal, ArrowUpRight,
    Map, Database, ShieldAlert, Cpu, Zap, Signal, Settings,
    FileText, Download, ChevronRight, BarChart3, RefreshCcw,
    Calendar, ChevronDown
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Toolbar } from "@/components/ui/Toolbar";
import { SeverityChip } from "@/components/ui/SeverityChip";
import { useIntelligenceStore } from "@/store/intelligenceStore";

export default function RuntimeDashboard() {
    const { instances } = useRuntimeStore();

    // Map runtime instances to the Drone format
    const drones = instances.filter(i => i.entityTypeId === 'ent-drone').map(inst => ({
        id: inst.id,
        status: (inst.properties as any).status || 'UNKNOWN',
        battery: (inst.properties as any).batteryLevel || 0,
        dist: (inst.properties as any).location || 'Unknown',
        signal: (inst.properties as any).signal || 'N/A'
    }));

    const [selectedIdx, setSelectedIdx] = useState<number | null>(drones.length > 0 ? 0 : null);
    const { setContext, updateSelection } = useIntelligenceStore();

    useEffect(() => {
        setContext('run', {
            workspaceId: 'fleet-alpha',
            filters: { activeAssetCount: drones.length }
        });
    }, [drones.length]);

    const handleSelectDrone = (idx: number) => {
        setSelectedIdx(idx);
        updateSelection({
            logicalId: drones[idx].id,
            entityTypeId: 'ent-drone'
        });
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-pt-bg">
            {/* Operator Header */}
            <header className="px-6 py-4 border-b border-pt-border bg-pt-bg-panel/20 shrink-0">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <SeverityChip severity="info" label="FLEET_OPS_CENTER" className="text-[8px]" />
                            <span className="text-[9px] font-mono text-pt-text-muted opacity-50">LOCATION: PACIFIC-HUB-4</span>
                        </div>
                        <h1 className="text-xl font-black text-pt-text uppercase tracking-tight">Drone Fleet Operations</h1>
                        <p className="text-[10px] text-pt-text-muted font-bold uppercase tracking-widest mt-1">Integrated Fleet Telemetry & C2 Protocol</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="h-8 px-4 bg-pt-bg border border-pt-border rounded text-[9px] font-black uppercase tracking-widest text-pt-text-muted hover:text-pt-text transition-all flex items-center gap-2">
                            <RefreshCcw size={10} /> Sync Fleet
                        </button>
                        <button className="h-8 px-4 bg-pt-intent-primary text-pt-bg rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                            <FileText size={10} /> Intelligence Report
                        </button>
                    </div>
                </div>
            </header>

            {/* Operator Toolbar */}
            <Toolbar className="shrink-0 bg-pt-bg/50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-pt-bg border border-pt-border rounded text-[9px] font-black uppercase tracking-widest text-pt-text-muted">
                        <Calendar size={10} />
                        <span>Real-time</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-pt-bg border border-pt-border rounded text-[9px] font-black uppercase tracking-widest text-pt-text-muted">
                        <Filter size={10} />
                        <span>Status: All</span>
                        <ChevronDown size={10} />
                    </div>
                    <div className="h-4 w-px bg-pt-border mx-2" />
                    <div className="text-[9px] text-pt-text-muted font-bold tracking-widest opacity-60 flex items-center gap-2">
                        ONTOLOGY: <span className="text-pt-intent-primary">var_ActiveFleet</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <div className="px-2 py-0.5 border border-pt-intent-success/30 bg-pt-intent-success/5 text-pt-intent-success rounded text-[9px] font-black uppercase tracking-tighter shadow-[0_0_10px_rgb(var(--pt-intent-success)/0.2)]">Uplink Nominal</div>
                </div>
            </Toolbar>

            <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Metric Sensors Grid (Metric Strip) */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Total Assets', val: '142', detail: '+12% VEL', icon: Activity, color: 'text-pt-text' },
                        { label: 'Critical Battery', val: '4', detail: '-2 NODES', icon: Battery, color: 'text-pt-intent-warning' },
                        { label: 'Signal Loss', val: '1', detail: 'SIG_DROPPED', icon: Signal, color: 'text-pt-intent-danger' },
                        { label: 'Range Radius', val: '12km', detail: 'AVG_SECTOR', icon: Crosshair, color: 'text-pt-intent-primary' }
                    ].map((m, i) => (
                        <div key={i} className="bg-pt-bg-panel/40 border border-pt-border p-4 rounded flex items-center justify-between group hover:border-pt-intent-primary/30 transition-all cursor-pointer shadow-sm">
                            <div>
                                <div className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.2em] mb-1">{m.label}</div>
                                <div className="flex items-baseline gap-2">
                                    <div className={`text-2xl font-black ${m.color}`}>{m.val}</div>
                                    <div className="text-[8px] font-black text-pt-text-muted opacity-50">{m.detail}</div>
                                </div>
                            </div>
                            <m.icon size={20} className={`${m.color} opacity-20 group-hover:opacity-100 transition-opacity`} />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Telemetry Matrix */}
                    <Card
                        title="Fleet Status Matrix"
                        pill={`ONLINE: ${drones.filter(d => d.status === 'ACTIVE').length}`}
                        className="lg:col-span-2 min-h-[600px] flex flex-col"
                    >
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-pt-bg border-b border-pt-border sticky top-0 z-20">
                                    <tr className="text-[8px] font-black text-pt-text-muted uppercase tracking-[0.2em]">
                                        <th className="px-6 py-3">Asset identifier</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Charge</th>
                                        <th className="px-6 py-3">Sector</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-pt-border/30">
                                    {drones.map((drone, idx) => {
                                        const isSelected = selectedIdx === idx;
                                        return (
                                            <tr
                                                key={drone.id}
                                                onClick={() => handleSelectDrone(idx)}
                                                className={`cursor-pointer transition-all ${isSelected ? 'bg-pt-intent-primary/10' : 'hover:bg-pt-intent-primary/[0.02]'}`}
                                            >
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-1 h-3 rounded-full ${isSelected ? 'bg-pt-intent-primary shadow-[0_0_8px_rgb(var(--pt-intent-primary)/0.5)]' : 'bg-pt-border opacity-20'}`} />
                                                        <span className={`text-[10px] font-black ${isSelected ? 'text-pt-text' : 'text-pt-text-muted'}`}>{drone.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <SeverityChip
                                                        severity={drone.status === 'ACTIVE' ? 'success' : drone.status === 'CRITICAL' ? 'danger' : 'warning'}
                                                        label={drone.status}
                                                    />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-1 bg-pt-bg rounded-full overflow-hidden border border-pt-border">
                                                            <div className={`h-full ${drone.battery < 20 ? 'bg-pt-intent-danger' : 'bg-pt-intent-success'}`} style={{ width: `${drone.battery}%` }} />
                                                        </div>
                                                        <span className="font-mono text-[9px] font-black text-pt-text-muted">{drone.battery}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 font-mono text-[9px] font-bold text-pt-text-muted uppercase tracking-tighter">{drone.dist}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Detail Inspector */}
                    <Card title="Asset Inspector" className="min-h-[600px] flex flex-col">
                        {selectedIdx !== null ? (
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b border-pt-border bg-pt-bg-panel/20">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-[10px] font-black text-pt-intent-primary uppercase tracking-[0.3em] mb-1">Asset Inspector</div>
                                            <h2 className="text-xl font-black text-pt-text tracking-tight font-mono">{drones[selectedIdx].id}</h2>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <SeverityChip
                                            severity={drones[selectedIdx].status === 'ACTIVE' ? 'success' : 'danger'}
                                            label={`${drones[selectedIdx].status}_MODE`}
                                        />
                                        <span className="px-2 py-0.5 bg-pt-bg border border-pt-border rounded text-[8px] font-black text-pt-text-muted uppercase tracking-widest">v4.1.0-SIG</span>
                                    </div>
                                </div>

                                <div className="p-4 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                                    <div className="space-y-3">
                                        <h3 className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.4em] opacity-40">System Telemetry</h3>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'Battery Capacity', val: `${drones[selectedIdx].battery}%`, alert: drones[selectedIdx].battery < 20 },
                                                { label: 'Sector Location', val: drones[selectedIdx].dist },
                                                { label: 'Signal Vector', val: drones[selectedIdx].signal },
                                                { label: 'Uplink Latency', val: '24ms' }
                                            ].map((p, i) => (
                                                <div key={i} className="flex justify-between items-baseline border-b border-pt-border/30 pb-1.5">
                                                    <span className="text-[9px] font-bold text-pt-text-muted uppercase tracking-tight">{p.label}</span>
                                                    <span className={`font-mono text-[10px] font-black ${p.alert ? 'text-pt-intent-danger' : 'text-pt-text'}`}>
                                                        {p.val}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Geospatial Matrix */}
                                    <div className="space-y-3">
                                        <h3 className="text-[9px] font-black text-pt-text-muted uppercase tracking-[0.4em] opacity-40">Geospatial Target</h3>
                                        <div className="w-full h-32 bg-pt-bg border border-pt-border rounded flex items-center justify-center relative overflow-hidden group hover:border-pt-intent-primary/30 transition-all cursor-crosshair">
                                            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(var(--pt-border) 1px, transparent 1px), linear-gradient(90deg, var(--pt-border) 1px, transparent 1px)', backgroundSize: '15px 15px' }} />
                                            <Map className="w-8 h-8 text-pt-border group-hover:scale-110 transition-transform" />
                                            <div className="absolute inset-x-0 bottom-0 p-2 bg-pt-bg-panel/80 backdrop-blur-md border-t border-pt-border opacity-0 group-hover:opacity-100 transition-all flex justify-between items-center">
                                                <span className="text-[8px] font-black text-pt-text uppercase tracking-widest">Active Mapping UI</span>
                                                <ArrowUpRight className="w-2.5 h-2.5 text-pt-intent-primary" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-pt-border bg-pt-bg-panel/50 space-y-2">
                                    <button className={`w-full h-9 rounded text-[9px] font-black uppercase tracking-[0.2em] transition-all border shadow-sm active:scale-95 flex items-center justify-center gap-2
                                        ${drones[selectedIdx].status === 'CRITICAL' ? 'bg-pt-intent-danger border-pt-intent-danger text-pt-bg' : 'bg-pt-intent-primary border-pt-intent-primary text-pt-bg'}
                                    `}>
                                        {drones[selectedIdx].status === 'CRITICAL' ? <ShieldAlert size={12} /> : <Zap size={12} />}
                                        Override {drones[selectedIdx].status === 'CRITICAL' ? 'Forced Recall' : 'Vector Shift'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-pt-text-muted p-10 text-center space-y-4">
                                <Activity size={32} className="opacity-10" />
                                <p className="text-[10px] font-black text-pt-text-muted uppercase tracking-widest">Select target for inspection</p>
                            </div>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
}
