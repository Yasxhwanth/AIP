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
            { name: "AI", href: "/build/ai", icon: BrainCircuit },
        ]
    },
    {
        label: "Delivery",
        items: [
            { name: "Applications", href: "/build/applications", icon: LayoutTemplate },
        ]
    },
    {
        label: "Governance",
        items: [
            { name: "Security", href: "/build/security", icon: Shield },
            { name: "Governance", href: "/build/governance", icon: BookOpen },
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
            <aside style={{
                width: W, minWidth: W, height: "100%",
                background: "#0B0F18",
                borderRight: "1px solid rgba(255,255,255,0.06)",
                display: "flex", flexDirection: "column",
                overflow: "hidden", flexShrink: 0, zIndex: 50,
                transition: "width 0.18s ease, min-width 0.18s ease",
            }}>

                {/* Logo + title */}
                <div style={{
                    height: 48, display: "flex", alignItems: "center",
                    padding: "0 10px 0 11px", gap: 8, flexShrink: 0,
                    borderBottom: "1px solid rgba(255,255,255,0.06)"
                }}>
                    <PalantirMark />
                    {expanded && (
                        <span style={{
                            flex: 1, fontSize: 13, fontWeight: 700, color: "#E2E8F0",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                        }}>
                            AIP Builder
                        </span>
                    )}
                    <button onClick={() => setExpanded(v => !v)} style={{
                        flexShrink: 0, width: 26, height: 26, borderRadius: 4,
                        border: "none", background: "transparent", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#475569"
                    }}>
                        <AlignJustify style={{ width: 15, height: 15 }} />
                    </button>
                </div>

                {/* Nav groups */}
                <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingTop: 6, paddingBottom: 4 }}>
                    {NAV_GROUPS.map(group => (
                        <div key={group.label}>
                            {expanded && (
                                <div style={{
                                    padding: "10px 12px 3px 13px",
                                    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.09em",
                                    textTransform: "uppercase", color: "#334155"
                                }}>
                                    {group.label}
                                </div>
                            )}
                            {!expanded && group !== NAV_GROUPS[0] && (
                                <div style={{
                                    margin: "6px 10px", height: 1,
                                    background: "rgba(255,255,255,0.06)"
                                }} />
                            )}
                            {group.items.map(nav => {
                                const active = isActive(nav.href);
                                const Icon = nav.icon;
                                return (
                                    <Link key={nav.name} href={nav.href}
                                        title={!expanded ? nav.name : undefined}
                                        style={{ textDecoration: "none", display: "block" }}>
                                        <div style={{
                                            display: "flex", alignItems: "center", gap: 9,
                                            padding: "7px 12px", margin: "1px 5px", borderRadius: 5,
                                            background: active ? "rgba(255,255,255,0.08)" : "transparent",
                                            borderLeft: active ? "2px solid #3B82F6" : "2px solid transparent",
                                            cursor: "pointer", position: "relative",
                                            transition: "background 0.1s",
                                        }}>
                                            <Icon style={{
                                                width: 15, height: 15, flexShrink: 0,
                                                color: active ? "#93C5FD" : "#4B5563"
                                            }} />
                                            {expanded && (
                                                <span style={{
                                                    fontSize: 12.5, fontWeight: active ? 600 : 400,
                                                    color: active ? "#F1F5F9" : "#94A3B8",
                                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                                                }}>
                                                    {nav.name}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "4px 0", flexShrink: 0 }}>
                    {[{ icon: Settings, label: "Settings" }, { icon: HelpCircle, label: "Help & Info" }].map(
                        ({ icon: Icon, label }) => (
                            <div key={label} title={!expanded ? label : undefined} style={{
                                display: "flex", alignItems: "center", gap: 9,
                                padding: "7px 12px", margin: "1px 5px", borderRadius: 5, cursor: "pointer",
                                borderLeft: "2px solid transparent",
                            }}>
                                <Icon style={{ width: 14, height: 14, color: "#4B5563", flexShrink: 0 }} />
                                {expanded && <span style={{ fontSize: 12.5, color: "#64748B" }}>{label}</span>}
                            </div>
                        )
                    )}
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main className="flex-1 min-w-0 relative flex flex-col overflow-hidden"
                style={{ background: "#F5F8FA" }}>
                {children}

                {/* AIP Assist */}
                <button style={{
                    position: "absolute", bottom: 24, right: 24, width: 44, height: 44,
                    borderRadius: "50%", background: "#0B0F18", color: "white",
                    border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", zIndex: 100,
                }} className="group hover:scale-105 transition-transform">
                    <MessageSquare style={{ width: 18, height: 18, opacity: 0.8 }} />
                    <span style={{
                        position: "absolute", right: 52, background: "#0B0F18", color: "white",
                        fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap", pointerEvents: "none"
                    }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        AIP Assist
                    </span>
                </button>
            </main>
        </div>
    );
}
