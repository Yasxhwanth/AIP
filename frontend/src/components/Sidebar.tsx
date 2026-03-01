"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/workspace";

// ─── lucide-react icon imports ────────────────────────────────────────────────
import {
    Home, Search, Bell, FolderOpen,
    Globe, HelpCircle, AlignJustify, ChevronDown,
    ArrowLeftRight, User
} from "lucide-react";

// ─── Palantir AIP app icon SVGs (matching the exact colors in reference) ──────
// ─── Palantir Foundry logo mark (cylinder/database stack) ────────────────────
const PalantirMark = () => (
    <svg viewBox="0 0 28 28" fill="none" style={{ width: 26, height: 26, flexShrink: 0 }}>
        {/* Bottom ellipse */}
        <ellipse cx="14" cy="20" rx="8" ry="3" fill="rgba(59,130,246,0.5)" stroke="rgba(59,130,246,0.7)" strokeWidth="1" />
        {/* Cylinder body */}
        <rect x="6" y="10" width="16" height="10" fill="rgba(59,130,246,0.35)" />
        {/* Top ellipse */}
        <ellipse cx="14" cy="10" rx="8" ry="3" fill="rgba(59,130,246,0.75)" stroke="rgba(59,130,246,0.9)" strokeWidth="1" />
        {/* Middle ellipse for stacking effect */}
        <ellipse cx="14" cy="15" rx="8" ry="2.5" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="0.8" />
        {/* Shine */}
        <ellipse cx="11" cy="9.5" rx="3" ry="1" fill="rgba(255,255,255,0.25)" />
    </svg>
);

const ObjExplorerIcon = () => <svg viewBox="0 0 16 16" fill="none" style={{ width: 15, height: 15 }}><circle cx="6" cy="6" r="4.5" stroke="#60A5FA" strokeWidth="1.4" /><path d="M9.5 9.5L13 13" stroke="#60A5FA" strokeWidth="1.4" strokeLinecap="round" /></svg>;
const ContourIcon = () => <svg viewBox="0 0 16 16" fill="none" style={{ width: 15, height: 15 }}><path d="M1 12 C 4 4, 7 10, 10 6, 13 2, 15 8" stroke="#F97316" strokeWidth="1.4" strokeLinecap="round" fill="none" /></svg>;
const ReportsIcon = () => <svg viewBox="0 0 16 16" fill="none" style={{ width: 15, height: 15 }}><rect x="2" y="9" width="3" height="5" rx="1" fill="#FB923C" /><rect x="6.5" y="5" width="3" height="9" rx="1" fill="#FB923C" /><rect x="11" y="2" width="3" height="12" rx="1" fill="#FB923C" /></svg>;
const DataLineageIcon = () => <svg viewBox="0 0 16 16" fill="none" style={{ width: 15, height: 15 }}><circle cx="2.5" cy="8" r="1.5" fill="#22C55E" /><circle cx="8" cy="3" r="1.5" fill="#22C55E" /><circle cx="8" cy="13" r="1.5" fill="#22C55E" /><circle cx="13.5" cy="8" r="1.5" fill="#22C55E" /><line x1="4" y1="7.4" x2="6.5" y2="3.8" stroke="#22C55E" strokeWidth="1" /><line x1="4" y1="8.6" x2="6.5" y2="12.2" stroke="#22C55E" strokeWidth="1" /><line x1="9.5" y1="3.8" x2="12" y2="7.4" stroke="#22C55E" strokeWidth="1" /><line x1="9.5" y1="12.2" x2="12" y2="8.6" stroke="#22C55E" strokeWidth="1" /></svg>;
const FormsIcon = () => <svg viewBox="0 0 16 16" fill="none" style={{ width: 15, height: 15 }}><rect x="2" y="2" width="12" height="12" rx="2" stroke="#14B8A6" strokeWidth="1.3" /><line x1="5" y1="6" x2="11" y2="6" stroke="#14B8A6" strokeWidth="1.2" strokeLinecap="round" /><line x1="5" y1="9" x2="9" y2="9" stroke="#14B8A6" strokeWidth="1.2" strokeLinecap="round" /></svg>;
const FusionIcon = () => <svg viewBox="0 0 16 16" fill="none" style={{ width: 15, height: 15 }}><path d="M8 1L10 6H15L11 9.5L12.5 14.5L8 11.5L3.5 14.5L5 9.5L1 6H6Z" fill="#EAB308" fillOpacity="0.85" /></svg>;
const MapIcon = () => <svg viewBox="0 0 16 16" fill="none" style={{ width: 15, height: 15 }}><path d="M8 1C5.79 1 4 2.79 4 5c0 3.25 4 10 4 10s4-6.75 4-10c0-2.21-1.79-4-4-4z" fill="#38BDF8" /><circle cx="8" cy="5" r="1.5" fill="#0F172A" /></svg>;
const ModelingIcon = () => <svg viewBox="0 0 16 16" fill="none" style={{ width: 15, height: 15 }}><circle cx="8" cy="8" r="6" stroke="#A855F7" strokeWidth="1.3" /><circle cx="8" cy="8" r="3.5" stroke="#A855F7" strokeWidth="1.1" /><circle cx="8" cy="8" r="1.5" fill="#A855F7" /></svg>;
const VortexIcon = () => <svg viewBox="0 0 16 16" fill="none" style={{ width: 15, height: 15 }}><path d="M8 2c0 0 4 3 4 6s-4 6-4 6" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round" /><path d="M8 2c0 0-4 3-4 6s4 6 4 6" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round" /><circle cx="8" cy="8" r="1.5" fill="#EF4444" /></svg>;

// ─── Navigation data ──────────────────────────────────────────────────────────
const APPS = [
    { href: "/run", icon: ObjExplorerIcon, label: "Object explorer" },
    { href: "/telemetry", icon: ContourIcon, label: "Contour" },
    { href: "/audit", icon: ReportsIcon, label: "Reports" },
    { href: "/ontology", icon: DataLineageIcon, label: "Data lineage" },
    { href: "/apps", icon: FormsIcon, label: "Forms" },
    { href: "/models", icon: FusionIcon, label: "Fusion" },
    { href: "/geo", icon: MapIcon, label: "Map" },
    { href: "/resolve", icon: ModelingIcon, label: "Modeling objectives" },
    { href: "/workshop", icon: VortexIcon, label: "Vortex" },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────
export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { activeProjectName, clearActiveProject } = useWorkspaceStore();
    const [collapsed, setCollapsed] = useState(false);

    if (pathname === "/geo" || pathname.startsWith("/build") || pathname.startsWith("/run")) return null;

    const W = collapsed ? 52 : 224;

    // ── Item renderer ──────────────────────────────────────────────────────
    const Item = ({
        href, icon: Icon, label, active, badge, isComponent = false
    }: {
        href: string;
        icon: React.ElementType | (() => React.ReactElement);
        label: string;
        active: boolean;
        badge?: number;
        isComponent?: boolean;
    }) => {
        const inner = (
            <div style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: collapsed ? "8px 14px" : "7px 14px",
                borderRadius: 5, cursor: "pointer",
                background: active ? "rgba(255,255,255,0.07)" : "transparent",
                transition: "background 0.12s",
            }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
                {isComponent
                    ? <Icon />
                    : <Icon style={{ width: 15, height: 15, color: active ? "#CBD5E1" : "#64748B", flexShrink: 0 }} />
                }
                {!collapsed && (
                    <span style={{
                        fontSize: 12.5, fontWeight: active ? 500 : 400, flex: 1,
                        color: active ? "#F1F5F9" : "#94A3B8",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}>
                        {label}
                    </span>
                )}
                {!collapsed && badge !== undefined && badge > 0 && (
                    <span style={{
                        fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 10,
                        background: "#D97706", color: "#fff", flexShrink: 0
                    }}>{badge}</span>
                )}
            </div>
        );

        return (
            <div style={{ padding: "1px 6px" }} title={collapsed ? label : undefined}>
                <Link href={href} style={{ textDecoration: "none", display: "block" }}>
                    {inner}
                </Link>
            </div>
        );
    };

    // ── Section label ──────────────────────────────────────────────────────
    const SectionLabel = ({ text, action }: { text: string; action?: React.ReactNode }) =>
        collapsed ? (
            <div style={{ height: 8, borderTop: "1px solid rgba(255,255,255,0.06)", margin: "8px 10px" }} />
        ) : (
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 12px 4px 14px"
            }}>
                <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase", color: "#334155"
                }}>{text}</span>
                {action}
            </div>
        );

    return (
        <aside style={{
            width: W, minWidth: W, height: "100%",
            background: "#0E0E18",
            borderRight: "1px solid rgba(255,255,255,0.065)",
            display: "flex", flexDirection: "column",
            overflow: "hidden", flexShrink: 0, zIndex: 50,
            transition: "width 0.18s ease, min-width 0.18s ease",
            fontFamily: "Inter, -apple-system, sans-serif",
        }}>

            {/* ── Logo row ── */}
            <div style={{
                height: 48, display: "flex", alignItems: "center",
                padding: "0 12px", gap: 8, flexShrink: 0,
                borderBottom: "1px solid rgba(255,255,255,0.065)"
            }}>
                <PalantirMark />
                {!collapsed && (
                    <span style={{
                        flex: 1, fontSize: 13.5, fontWeight: 700, color: "#E2E8F0",
                        letterSpacing: "0.01em", whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis"
                    }}>
                        AIP Platform
                    </span>
                )}
                <button onClick={() => setCollapsed(v => !v)} style={{
                    flexShrink: 0, width: 26, height: 26, borderRadius: 4,
                    border: "none", background: "transparent", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#475569"
                }}>
                    <AlignJustify style={{ width: 15, height: 15 }} />
                </button>
            </div>

            {/* ── Scrollable nav ── */}
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", paddingTop: 4 }}>

                {/* Home */}
                <Item href="/" icon={Home} label="Home" active={pathname === "/"} />

                {/* Search row (special — not a link) */}
                <div style={{ padding: "1px 6px" }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 9,
                        padding: "7px 14px", borderRadius: 5, cursor: "pointer",
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
                        <Search style={{ width: 15, height: 15, color: "#64748B", flexShrink: 0 }} />
                        {!collapsed && (
                            <>
                                <span style={{ flex: 1, fontSize: 12.5, color: "#94A3B8" }}>Search...</span>
                                <span style={{
                                    fontSize: 10, color: "#475569", fontFamily: "monospace",
                                    background: "rgba(255,255,255,0.05)", borderRadius: 4,
                                    padding: "1px 5px", letterSpacing: "0.02em"
                                }}>⌘K</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Notifications */}
                <Item href="/inbox" icon={Bell} label="Notifications" active={pathname === "/inbox"} badge={2} />

                {/* Recent section */}
                <SectionLabel text="Recent" />
                <Item href="/projects" icon={FolderOpen} label="Projects & files" active={pathname === "/projects"} />

                {/* APPS section */}
                <SectionLabel text="APPS" action={
                    <Link href="/apps" style={{ fontSize: 11, color: "#3B82F6", textDecoration: "none", fontWeight: 500 }}>
                        View all
                    </Link>
                } />

                {APPS.map(app => (
                    <Item key={app.href}
                        href={app.href}
                        icon={app.icon}
                        label={app.label}
                        isComponent
                        active={pathname === app.href || (app.href !== "/" && pathname.startsWith(app.href))}
                    />
                ))}

                <div style={{ flex: 1 }} />
            </div>

            {/* ── Bottom controls ── */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.065)", paddingTop: 4, paddingBottom: 6, flexShrink: 0 }}>

                {/* English (with dropdown) */}
                <div style={{ padding: "1px 6px" }}>
                    {[
                        { icon: Globe, label: "English", dropdown: true },
                        { icon: ArrowLeftRight, label: "Track: Default", dropdown: true },
                        { icon: HelpCircle, label: "Help & support", dropdown: false },
                        { icon: User, label: "Account", dropdown: false },
                        { icon: ArrowLeftRight, label: "Open other workspaces", dropdown: false },
                    ].map(({ icon: Icon, label, dropdown }) => (
                        <div key={label}
                            style={{
                                display: "flex", alignItems: "center", gap: 9,
                                padding: "6px 14px", borderRadius: 5, cursor: "pointer",
                            }}
                            title={collapsed ? label : undefined}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
                            <Icon style={{ width: 14, height: 14, color: "#4B5563", flexShrink: 0 }} />
                            {!collapsed && (
                                <>
                                    <span style={{
                                        flex: 1, fontSize: 12, color: "#64748B",
                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                                    }}>
                                        {label}
                                    </span>
                                    {dropdown && (
                                        <ChevronDown style={{ width: 12, height: 12, color: "#374151", flexShrink: 0 }} />
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
