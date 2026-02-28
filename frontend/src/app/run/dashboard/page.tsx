"use client";

import { useState } from "react";
import { useRuntimeStore } from "@/store/runtimeStore";
import {
    Activity, Battery, AlertTriangle, Crosshair,
    Wifi, Search, Filter, MoreHorizontal, ArrowUpRight,
    Map, Database
} from "lucide-react";

export default function RuntimeDashboard() {
    const { instances } = useRuntimeStore();

    // Map runtime instances to the Drone format
    const drones = instances.filter(i => i.entityTypeId === 'ent-drone').map(inst => ({
        id: inst.id,
        status: inst.properties.status || 'UNKNOWN',
        battery: inst.properties.batteryLevel || 0,
        dist: inst.properties.location || 'Unknown',
        signal: inst.properties.signal || 'N/A'
    }));

    const [selectedIdx, setSelectedIdx] = useState<number | null>(drones.length > 0 ? 0 : null);

    return (
        <div className="w-full text-white p-6 max-w-[1600px] mx-auto min-h-full">

            {/* Header / Section 1 */}
            <div className="flex items-end justify-between mb-6">
                <div>
                    <h1 className="text-[28px] font-light tracking-tight mb-1 text-white">Drone Fleet Operations</h1>
                    <p className="text-[13px] text-[#8A9BA8] max-w-2xl">Real-time operational overview of deployed UAS assets. Data is bound to Live Ontology <span className="text-blue-400 font-mono text-[11px] bg-blue-500/10 px-1 rounded">var_ActiveFleet</span>.</p>
                </div>
                <div className="flex gap-2 text-[12px] font-bold">
                    <button className="px-4 py-2 bg-[#293742] hover:bg-[#394B59] rounded-sm transition-colors border border-black shadow-sm flex items-center gap-2">
                        <Filter className="w-4 h-4 text-[#8A9BA8]" /> Advanced Filter
                    </button>
                    <button className="px-4 py-2 bg-[#137CBD] hover:bg-[#106BA3] rounded-sm transition-colors border border-black shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[#182026] border border-[#293742] rounded-sm p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full group-hover:scale-110 transition-transform" />
                    <div className="text-[11px] font-bold text-[#8A9BA8] uppercase tracking-wider mb-2 flex items-center justify-between">
                        Total Assets <Activity className="w-4 h-4 text-[#5C7080]" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-light">142</span>
                        <span className="text-[11px] font-bold text-[#0F9960]">+12%</span>
                    </div>
                </div>
                <div className="bg-[#182026] border border-[#D9822B]/30 rounded-sm p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#D9822B]/5 rounded-bl-full group-hover:scale-110 transition-transform" />
                    <div className="text-[11px] font-bold text-[#8A9BA8] uppercase tracking-wider mb-2 flex items-center justify-between">
                        Critical Battery <Battery className="w-4 h-4 text-[#D9822B]" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-light text-[#D9822B]">4</span>
                        <span className="text-[11px] font-bold text-[#D9822B]">-2</span>
                    </div>
                </div>
                <div className="bg-[#182026] border border-red-500/30 rounded-sm p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full group-hover:scale-110 transition-transform" />
                    <div className="text-[11px] font-bold text-[#8A9BA8] uppercase tracking-wider mb-2 flex items-center justify-between">
                        Signal Loss <Wifi className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-light text-red-500">1</span>
                    </div>
                </div>
                <div className="bg-[#182026] border border-[#293742] rounded-sm p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full group-hover:scale-110 transition-transform" />
                    <div className="text-[11px] font-bold text-[#8A9BA8] uppercase tracking-wider mb-2 flex items-center justify-between">
                        Op Range <Crosshair className="w-4 h-4 text-[#5C7080]" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-light text-emerald-500">12km</span>
                        <span className="text-[11px] font-bold text-[#8A9BA8]">avg</span>
                    </div>
                </div>
            </div>

            {/* Split View: Table + Detail Inspector */}
            <div className="flex gap-6 h-[500px]">

                {/* Object Table */}
                <div className="flex-[2] bg-[#182026] border border-[#293742] rounded-sm shadow-sm flex flex-col min-w-0">
                    <div className="h-10 border-b border-[#293742] flex items-center justify-between px-4 bg-[#11161B]">
                        <h2 className="text-[13px] font-bold flex items-center gap-2"><Database className="w-4 h-4 text-blue-400" /> Active Fleet</h2>
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5C7080]" />
                            <input
                                placeholder="Search by ID..."
                                className="bg-[#182026] border border-[#293742] rounded-sm pl-7 pr-3 py-1 text-[11px] text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-[#5C7080]"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-[12px] whitespace-nowrap">
                            <thead className="bg-[#11161B] sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2 font-bold text-[#8A9BA8] border-b border-[#293742]">Asset ID</th>
                                    <th className="px-4 py-2 font-bold text-[#8A9BA8] border-b border-[#293742]">Status</th>
                                    <th className="px-4 py-2 font-bold text-[#8A9BA8] border-b border-[#293742]">Battery</th>
                                    <th className="px-4 py-2 font-bold text-[#8A9BA8] border-b border-[#293742]">Distance</th>
                                    <th className="px-4 py-2 font-bold text-[#8A9BA8] border-b border-[#293742]">Signal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drones.map((drone, idx) => {
                                    const isSelected = selectedIdx === idx;
                                    const statusColor =
                                        drone.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-400/10' :
                                            drone.status === 'CRITICAL' ? 'text-red-400 bg-red-400/10' :
                                                drone.status === 'RETURN' ? 'text-orange-400 bg-orange-400/10' :
                                                    'text-[#8A9BA8] bg-[#8A9BA8]/10';

                                    return (
                                        <tr
                                            key={drone.id}
                                            onClick={() => setSelectedIdx(idx)}
                                            className={`cursor-pointer border-b border-[#293742]/50 transition-colors
                                                ${isSelected ? 'bg-blue-500/10' : 'hover:bg-[#293742]/50'}
                                            `}
                                        >
                                            <td className="px-4 py-2.5 font-mono">
                                                <div className="flex items-center gap-2">
                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                                    <span className={isSelected ? 'text-white font-bold' : 'text-[#8A9BA8]'}>{drone.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor}`}>{drone.status}</span>
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-[#8A9BA8]">{drone.battery}%</td>
                                            <td className="px-4 py-2.5 font-mono text-[#8A9BA8]">{drone.dist}</td>
                                            <td className="px-4 py-2.5 text-[#8A9BA8]"><span className="text-[11px] px-2 py-0.5 border border-[#394B59] rounded-sm">{drone.signal}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Panel Properties Inspector (Bound to selection) */}
                <div className="flex-[1] bg-[#182026] border border-[#293742] rounded-sm shadow-sm flex flex-col min-w-0">
                    {selectedIdx !== null ? (
                        <>
                            <div className="p-4 border-b border-[#293742] bg-gradient-to-r from-blue-500/10 to-transparent">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-[18px] font-light text-white font-mono">{drones[selectedIdx].id}</h2>
                                    <button className="p-1 hover:bg-[#293742] rounded text-[#8A9BA8] hover:text-white transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                    ${drones[selectedIdx].status === 'CRITICAL' ? 'text-red-400 bg-red-400/10 border border-red-500/30' :
                                        drones[selectedIdx].status === 'WARNING' ? 'text-[#D9822B] bg-[#D9822B]/10 border border-[#D9822B]/30' :
                                            'text-emerald-400 bg-emerald-400/10 border border-emerald-500/30'}
                                `}>
                                    {drones[selectedIdx].status}
                                </span>
                            </div>

                            <div className="p-4 flex-1 overflow-y-auto space-y-6">
                                {/* Property Grid */}
                                <div>
                                    <h3 className="text-[11px] font-bold text-[#5C7080] uppercase tracking-wider mb-3">Telemetry Properties</h3>
                                    <div className="space-y-2 text-[12px]">
                                        <div className="flex justify-between border-b border-[#293742] pb-1">
                                            <span className="text-[#8A9BA8]">Battery Level</span>
                                            <span className="font-mono text-white">{drones[selectedIdx].battery}%</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#293742] pb-1">
                                            <span className="text-[#8A9BA8]">Location Sector</span>
                                            <span className="font-mono text-white">{drones[selectedIdx].dist}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#293742] pb-1">
                                            <span className="text-[#8A9BA8]">Signal Integrity</span>
                                            <span className="text-white">{drones[selectedIdx].signal}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mini Map Visual Placeholder */}
                                <div>
                                    <h3 className="text-[11px] font-bold text-[#5C7080] uppercase tracking-wider mb-3">Geospatial Context</h3>
                                    <div className="w-full h-32 bg-[#11161B] border border-[#293742] rounded-sm flex items-center justify-center relative overflow-hidden group hover:border-blue-500/50 transition-colors cursor-pointer">
                                        {/* Mock map background grid */}
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #8A9BA8 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                                        <Map className="w-8 h-8 text-[#293742] group-hover:scale-110 transition-transform" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                            <span className="text-white text-[11px] font-bold px-3 py-1 bg-black/60 rounded-full border border-white/20 backdrop-blur-md flex items-center gap-1">Open in Map <ArrowUpRight className="w-3 h-3" /></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button Bar */}
                            <div className="p-4 border-t border-[#293742] bg-[#11161B]">
                                <button className={`w-full py-2 rounded-sm text-[12px] font-bold transition-colors border shadow-sm
                                    ${drones[selectedIdx].status === 'CRITICAL' ? 'bg-[#D9822B] hover:bg-[#B86820] border-[#D9822B] text-white' : 'bg-[#293742] hover:bg-[#394B59] border-black text-white'}
                                `}>
                                    {drones[selectedIdx].status === 'CRITICAL' ? 'Execute Emergency Recall' : 'Trigger Standard Maintenance'}
                                </button>
                                <p className="text-[10px] text-[#5C7080] text-center mt-2">Action bound to <span className="font-mono">act_RecallFleet</span></p>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-[#5C7080] p-6 text-center">
                            <Activity className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-[13px] font-bold text-white mb-1">No Object Selected</p>
                            <p className="text-[11px]">Select a row in the Object Table to inspect properties and execute actions.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
