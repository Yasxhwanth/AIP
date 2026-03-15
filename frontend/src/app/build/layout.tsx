"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Database, Network, BarChart2, GitBranch, Zap, BrainCircuit,
    LayoutTemplate, Shield, BookOpen, ClipboardList, Send,
    Settings, HelpCircle, MessageSquare, AlignJustify, ChevronDown
} from "lucide-react";

// ─── Palantir Foundry cylinder logo mark ─────────────────────────────────────
const PalantirMark = () => (
    <svg viewBox="0 0 28 28" fill="none" style={{ width: 26, height: 26, flexShrink: 0 }}>
        <ellipse cx="14" cy="20" rx="8" ry="3" fill="rgba(59,130,246,0.5)" stroke="rgba(59,130,246,0.7)" strokeWidth="1" />
        <rect x="6" y="10" width="16" height="10" fill="rgba(59,130,246,0.35)" />
        <ellipse cx="14" cy="10" rx="8" ry="3" fill="rgba(59,130,246,0.75)" stroke="rgba(59,130,246,0.9)" strokeWidth="1" />
        <ellipse cx="14" cy="15" rx="8" ry="2.5" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="0.8" />
        <ellipse cx="11" cy="9.5" rx="3" ry="1" fill="rgba(255,255,255,0.25)" />
    </svg>
);

// ─── Enterprise nav structure ─────────────────────────────────────────────────
const NAV_GROUPS = [
    {
        label: "Foundation",
        items: [
            { name: "Data", href: "/build/data", icon: Database },
            { name: "Ontology", href: "/build/ontology", icon: Network },
            { name: "Metrics", href: "/build/metrics", icon: BarChart2 },
        ]
    },
    {
        label: "Automation",
        items: [
            { name: "Logic", href: "/build/logic", icon: GitBranch },
            { name: "Actions", href: "/build/actions", icon: Zap },
            { name: "Automate", href: "/build/automate", icon: Zap },
            { name: "AI", href: "/build/ai", icon: BrainCircuit },
        ]
    },
    {
        label: "Delivery",
        items: [
            { name: "Applications", href: "/build/applications", icon: LayoutTemplate },
            { name: "Apollo", href: "/build/apollo", icon: Zap },
        ]
    },
    {
        label: "Processing",
        items: [
            { name: "Spark Jobs", href: "/build/spark", icon: Network },
        ]
    },
    {
        label: "Governance",
        items: [
            { name: "Security", href: "/build/security", icon: Shield },
            { name: "Governance", href: "/build/governance", icon: BookOpen },
            { name: "Provenance", href: "/build/provenance", icon: Shield },
            { name: "Audit", href: "/build/audit", icon: ClipboardList },
            { name: "Publish", href: "/build/publish", icon: Send },
        ]
    },
];

export default function BuildLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState(true);

    const W = expanded ? 200 : 48;

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    return (
        <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>

            {/* ── SIDEBAR ── */}
            <aside className="bg-pt-bg-panel border-r border-pt-border flex flex-col overflow-hidden shrink-0 z-50 transition-all duration-200 ease-in-out"
                style={{ width: W, minWidth: W }}>

                {/* Tactical Header */}
                <div className="h-14 flex items-center px-4 gap-3 border-b border-pt-border bg-pt-bg-panel/50">
                    <div className="shrink-0">
                        <PalantirMark />
                    </div>
                    {expanded && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-black uppercase tracking-widest text-pt-text truncate">AIP Builder</span>
                            <span className="text-[8px] font-mono text-pt-intent-primary uppercase tracking-tighter">Forge-v2.1</span>
                        </div>
                    )}
                    <button
                        onClick={() => setExpanded(v => !v)}
                        className="ml-auto p-1.5 rounded hover:bg-pt-bg transition-colors text-pt-text-muted hover:text-pt-text"
                    >
                        <AlignJustify size={14} />
                    </button>
                </div>

                {/* Nav groups */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-2 custom-scrollbar">
                    {NAV_GROUPS.map(group => (
                        <div key={group.label} className="mb-4">
                            {expanded && (
                                <div className="px-5 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-pt-text-muted opacity-40">
                                    {group.label}
                                </div>
                            )}
                            {!expanded && (
                                <div className="mx-3 h-px bg-pt-border mb-2 opacity-50" />
                            )}
                            <div className="space-y-0.5">
                                {group.items.map(nav => {
                                    const active = isActive(nav.href);
                                    const Icon = nav.icon;
                                    return (
                                        <Link key={nav.name} href={nav.href}
                                            className="block group no-underline">
                                            <div className={`flex items-center gap-3 py-2 px-4 transition-all relative ${active
                                                    ? 'bg-pt-intent-primary/10'
                                                    : 'hover:bg-pt-bg-panel/80'
                                                }`}>
                                                {active && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-pt-intent-primary" />
                                                )}
                                                <Icon size={14} className={`shrink-0 transition-colors ${active ? 'text-pt-intent-primary' : 'text-pt-text-muted group-hover:text-pt-text'
                                                    }`} />
                                                {expanded && (
                                                    <span className={`text-[11px] uppercase tracking-wide truncate ${active ? 'text-pt-text font-black' : 'text-pt-text-muted group-hover:text-pt-text'
                                                        }`}>
                                                        {nav.name}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* System Controls */}
                <div className="border-top border-pt-border p-2 bg-pt-bg">
                    {[
                        { icon: Settings, label: "Configuration" },
                        { icon: HelpCircle, label: "Documentation" }
                    ].map(({ icon: Icon, label }) => (
                        <button key={label} className="w-full flex items-center gap-3 p-2.5 rounded hover:bg-pt-bg-panel transition-colors text-pt-text-muted hover:text-pt-text group">
                            <Icon size={14} className="shrink-0" />
                            {expanded && <span className="text-[10px] uppercase font-black tracking-widest">{label}</span>}
                        </button>
                    ))}
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 min-w-0 relative flex flex-col overflow-hidden bg-pt-bg">
                {children}

                {/* Tactical AI Assist */}
                <button className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-pt-bg-panel border border-pt-border shadow-2xl flex items-center justify-center hover:border-pt-intent-primary group transition-all hover:scale-110 active:scale-95 z-50">
                    <MessageSquare size={18} className="text-pt-intent-primary opacity-80" />
                    <div className="absolute right-14 bg-pt-bg-panel border border-pt-border text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl text-pt-text whitespace-nowrap">
                        Strategic Assist
                    </div>
                </button>
            </main>
        </div>
    );
}
