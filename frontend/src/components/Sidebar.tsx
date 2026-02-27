"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/workspace";
import {
    Map as MapIcon,
    AlertTriangle,
    Folder,
    Network,
    BrainCircuit,
    BarChart3,
    Settings,
    LogOut,
    Globe,
    Activity,
    Inbox,
    GitMerge,
    LayoutDashboard,
    Search
} from "lucide-react";

// Hide sidebar completely on these routes (geo is fullscreen map)
const HIDDEN_ROUTES = ['/projects', '/geo'];

type NavItem = {
    href: string;
    icon: React.ReactNode;
    label: string;
};

const TOP_NAV: NavItem[] = [
    { href: '/', icon: <MapIcon className="w-[18px] h-[18px]" />, label: 'Dashboard' },
    { href: '/workshop', icon: <Search className="w-[18px] h-[18px]" />, label: 'Workshop' },
    { href: '/inbox', icon: <Inbox className="w-[18px] h-[18px]" />, label: 'Decision Inbox' },
    { href: '/resolve', icon: <GitMerge className="w-[18px] h-[18px]" />, label: 'Identity Resolution' },
    { href: '/geo', icon: <Globe className="w-[18px] h-[18px]" />, label: 'Geo Intel' },
];

const MID_NAV: NavItem[] = [
    { href: '/files', icon: <Folder className="w-[18px] h-[18px]" />, label: 'Files' },
    { href: '/ontology', icon: <Network className="w-[18px] h-[18px]" />, label: 'Ontology' },
    { href: '/apps', icon: <LayoutDashboard className="w-[18px] h-[18px]" />, label: 'App Builder' },
    { href: '/models', icon: <BrainCircuit className="w-[18px] h-[18px]" />, label: 'AI Models' },
    { href: '/integrations', icon: <BarChart3 className="w-[18px] h-[18px]" />, label: 'Integrations' },
    { href: '/telemetry', icon: <Activity className="w-[18px] h-[18px]" />, label: 'Telemetry' },
    { href: '/alerts', icon: <AlertTriangle className="w-[18px] h-[18px]" />, label: 'Alerts' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { activeProjectName, clearActiveProject } = useWorkspaceStore();

    if (HIDDEN_ROUTES.includes(pathname)) return null;

    const handleClearProject = () => {
        clearActiveProject();
        router.push('/projects');
    };

    const initials = activeProjectName
        ? activeProjectName.substring(0, 2).toUpperCase()
        : 'WK';

    return (
        /* group enables CSS group-hover: on children */
        <aside className="group relative flex flex-col shrink-0 z-50 w-16 hover:w-52 transition-[width] duration-250 ease-in-out overflow-hidden"
            style={{
                background: 'linear-gradient(180deg,rgba(7,11,20,.98) 0%,rgba(5,9,16,.98) 100%)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '4px 0 32px rgba(0,0,0,.55)',
            }}
        >
            {/* ── Logo ─────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-[14px] py-5 border-b border-white/[.05] shrink-0 h-16">
                <div className="relative shrink-0 w-8 h-8 flex items-center justify-center">
                    <span className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping" style={{ animationDuration: '3.5s' }} />
                    <span className="relative w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                        <Globe className="w-4 h-4 text-white" />
                    </span>
                </div>
                {/* Label only visible when sidebar is wide */}
                <span className="whitespace-nowrap text-sm font-bold tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">
                    C3 AIP
                </span>
            </div>

            {/* ── Primary Nav ───────────────────────────────────────────────── */}
            <nav className="flex flex-col gap-0.5 px-2 pt-3 flex-1 overflow-hidden">
                <SectionLabel label="NAVIGATION" />
                {TOP_NAV.map(item => (
                    <SidebarLink key={item.href} {...item} active={pathname === item.href} />
                ))}
                <div className="my-2 mx-1 border-t border-white/[.05]" />
                <SectionLabel label="TOOLS" />
                {MID_NAV.map(item => (
                    <SidebarLink key={item.href} {...item} active={pathname === item.href} />
                ))}
            </nav>

            {/* ── Bottom ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-1 px-2 pb-4 mt-auto pt-2 border-t border-white/[.05] shrink-0">
                <SidebarLink href="/settings" icon={<Settings className="w-[18px] h-[18px]" />} label="Settings" active={pathname === '/settings'} />

                {/* Workspace pill */}
                <div className="group/ws relative flex items-center gap-3 mt-1 px-[9px] py-2 rounded-xl cursor-pointer hover:bg-white/[.05] transition-colors">
                    <div
                        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold text-cyan-200"
                        style={{
                            background: 'linear-gradient(135deg,rgba(6,182,212,.25) 0%,rgba(37,99,235,.25) 100%)',
                            border: '1px solid rgba(6,182,212,.3)',
                            boxShadow: '0 0 8px rgba(6,182,212,.1) inset',
                        }}
                    >
                        {initials}
                    </div>
                    <div className="min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">
                        <p className="text-xs font-semibold text-white/80 truncate whitespace-nowrap">
                            {activeProjectName || 'No Workspace'}
                        </p>
                        <p className="text-[9px] text-white/30">Active project</p>
                    </div>

                    {/* Hover tooltip — disconnect */}
                    <div className="pointer-events-none group-hover/ws:pointer-events-auto absolute left-14 bottom-0 opacity-0 group-hover/ws:opacity-100 transition-opacity duration-150 flex flex-col bg-slate-900/95 border border-white/10 rounded-xl p-2.5 w-44 shadow-2xl z-50">
                        <div className="text-xs font-semibold border-b border-white/10 pb-1.5 mb-1.5 text-white/60 truncate">
                            {activeProjectName || 'No Workspace'}
                        </div>
                        <button
                            onClick={handleClearProject}
                            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 py-0.5 font-medium transition-colors"
                        >
                            <LogOut className="w-3 h-3" /> Disconnect
                        </button>
                    </div>
                </div>

                {/* User avatar */}
                <div className="flex items-center gap-3 px-[9px] py-2">
                    <div
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white"
                        style={{
                            background: 'linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)',
                            boxShadow: '0 0 14px rgba(37,99,235,.35)',
                        }}
                    >
                        YA
                    </div>
                    <div className="min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">
                        <p className="text-xs font-semibold text-white/80 whitespace-nowrap">Yashwanth</p>
                        <p className="text-[9px] text-white/30">Admin</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

/* ─── Section label ──────────────────────────────────────────────────────── */
function SectionLabel({ label }: { label: string }) {
    return (
        <p className="px-2 pb-1 text-[8px] font-bold tracking-widest text-white/20 uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">
            {label}
        </p>
    );
}

/* ─── Nav link ───────────────────────────────────────────────────────────── */
function SidebarLink({ icon, href, active = false, label }: NavItem & { active?: boolean }) {
    return (
        <Link
            href={href}
            title={label}
            className="relative flex items-center gap-3 px-[9px] py-[9px] rounded-xl transition-all duration-150"
            style={active ? {
                background: 'linear-gradient(135deg,rgba(6,182,212,.14) 0%,rgba(37,99,235,.1) 100%)',
                boxShadow: 'inset 3px 0 0 #06b6d4',
            } : {}}
        >
            {/* Hover fill */}
            {!active && (
                <span className="absolute inset-0 rounded-xl bg-white/0 hover:bg-white/[.05] transition-colors" />
            )}

            {/* Glow ring on active icon */}
            <span className="relative shrink-0">
                {active && (
                    <span className="absolute inset-0 rounded-full bg-cyan-400/20 blur-[6px]" />
                )}
                <span className={active ? 'text-cyan-400' : 'text-slate-400 hover:text-white transition-colors'}>
                    {icon}
                </span>
            </span>

            {/* Label — only visible when sidebar expanded */}
            <span
                className={`whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 ${active ? 'text-cyan-300' : 'text-slate-300'}`}
            >
                {label}
            </span>
        </Link>
    );
}
