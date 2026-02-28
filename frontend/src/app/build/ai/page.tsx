"use client";

import { BrainCircuit, Settings, MessageSquare, Plus, Save } from "lucide-react";

export default function AIPLogicBuilder() {
    return (
        <div className="flex flex-col h-full bg-pt-bg">
            <div className="h-12 bg-pt-bg-panel border-b border-pt-border flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-[#8A9BA8]" />
                    <span className="font-bold text-[13px] text-pt-text tracking-tight">AIP Logic / AI Agents</span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1.5 px-3 py-1 bg-[#137CBD] hover:bg-[#106BA3] text-white rounded text-[12px] font-bold transition-colors shadow-sm">
                        <Save className="w-3.5 h-3.5 fill-current" /> Save Config
                    </button>
                </div>
            </div>

            <div className="flex-1 flex min-h-0">
                <div className="w-64 bg-pt-bg-panel border-r border-pt-border flex flex-col z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    <div className="p-3 border-b border-pt-border flex justify-between items-center">
                        <span className="text-[11px] font-bold text-pt-text-muted uppercase">Logic Agents</span>
                        <button className="p-1 hover:bg-[#F5F8FA] rounded text-[#137CBD]"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="px-3 py-2 bg-[#E4E8ED] border-l-2 border-[#137CBD] flex items-center gap-2 cursor-pointer">
                            <BrainCircuit className="w-3.5 h-3.5 text-[#137CBD]" />
                            <span className="text-[12px] font-sans font-bold text-pt-text truncate">Risk Assessment Analyst</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-white p-8 overflow-y-auto">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h2 className="text-[18px] font-bold font-sans text-pt-text pb-2 border-b border-pt-border">Risk Assessment Analyst</h2>

                        <div className="space-y-4">
                            <div className="bg-[#F5F8FA] border border-pt-border rounded p-4">
                                <label className="text-[11px] font-bold text-pt-text uppercase tracking-wider block mb-2">Model Prompt / System Context</label>
                                <textarea className="w-full h-32 bg-white border border-pt-border rounded p-3 text-[12px] font-mono focus:outline-none focus:border-[#137CBD]"
                                    defaultValue={"You are an expert analyst analyzing fleet drone telemetry.\nExamine the provided coordinates and battery health to assess immediate risk factors. If battery < 20% and range > 10km, recommend act_RecallFleet."} />
                            </div>

                            <div className="bg-[#F5F8FA] border border-pt-border rounded p-4 space-y-3">
                                <label className="text-[11px] font-bold text-pt-text uppercase tracking-wider">Available Tools & Actions</label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 p-2 bg-white border border-pt-border rounded opacity-70 cursor-not-allowed">
                                        <input type="checkbox" checked disabled />
                                        <span className="text-[12px] font-mono">Ontology Search (Read-only)</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-white border border-[#137CBD] rounded shadow-[0_0_0_1px_rgba(19,124,189,0.3)]">
                                        <input type="checkbox" defaultChecked />
                                        <span className="text-[12px] font-mono font-bold text-[#137CBD]">act_RecallFleet</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-80 bg-[#182026] text-white border-l border-pt-border flex flex-col shadow-[-2px_0_5px_rgba(0,0,0,0.02)]">
                    <div className="p-3 border-b border-white/10 flex items-center gap-2 text-[11px] font-bold text-[#8A9BA8] uppercase tracking-wider">
                        <MessageSquare className="w-3.5 h-3.5" /> Agent Simulation
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        <div className="bg-[#293742] p-3 rounded-lg text-[12px] leading-relaxed border border-white/5">
                            <span className="text-[#8A9BA8] block mb-1 font-bold text-[10px] uppercase">Simulation User</span>
                            What is the risk level of drone DRN-882?
                        </div>
                        <div className="bg-[#0F9960]/10 p-3 rounded-lg text-[12px] leading-relaxed border border-[#0F9960]/20 text-[#E3F2FD]">
                            <span className="text-[#0F9960] block mb-1 font-bold text-[10px] uppercase">Agent Response</span>
                            DRN-882 is currently at 12% battery while 15km from base. This poses an extreme risk. I strongly advise firing the <strong>act_RecallFleet</strong> action immediately.
                        </div>
                    </div>
                    <div className="p-3 border-t border-white/10">
                        <input className="w-full bg-[#10161A] border border-white/20 rounded px-3 py-2 text-[12px] focus:outline-none focus:border-[#137CBD] placeholder:text-[#5C7080]" placeholder="Message agent..." />
                    </div>
                </div>
            </div>
        </div>
    );
}
