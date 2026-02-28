"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/workspace";
import {
    AlertTriangle, Folder, Network, BrainCircuit, Settings,
    Globe, Activity, Inbox, GitMerge, LayoutDashboard,
    Terminal, Layers, Database, Lock, Shield
} from "lucide-react";

const HIDDEN_ROUTES = ['/projects', '/geo'];

type NavItem = {
    href: string;
    icon: React.ElementType;
    label: string;
    badge?: number;
};

const TOP_NAV: NavItem[] = [
    { href: '/terminal', icon: Terminal, label: 'AIP Copilot', badge: 3 },
    { href: '/', icon: LayoutDashboard, label: 'Ops Dashboard' },
    { href: '/geo', icon: Globe, label: 'Geo Intel' },
    { href: '/inbox', icon: Inbox, label: 'Decision Inbox', badge: 2 },
];

const MID_NAV: NavItem[] = [
    { href: '/integrations', icon: Database, label: 'Data Integration' },
    { href: '/ontology', icon: Network, label: 'Ontology' },
    { href: '/models', icon: BrainCircuit, label: 'Model Orchestration' },
    { href: '/policy', icon: Shield, label: 'Policy Engine' },
    { href: '/audit', icon: Lock, label: 'Audit Log' },
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
        : 'OP';

    return (
        <aside className="relative flex flex-col items-center shrink-0 z-50 w-14 border-r border-white/6 overflow-hidden" style={{ background: "#0B1220" }}>

            {/* Logo */}
            <div className="flex items-center justify-center w-full h-14 shrink-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}>
                    <Layers className="w-4 h-4 text-blue-400" />
                </div>
            </div>

            {/* Classification indicator strip */}
            <div className="w-full h-0.5 bg-red-600/60 mb-2" />

            {/* Primary Nav */}
            <nav className="flex flex-col gap-1 w-full px-2 flex-1 items-center">
                {TOP_NAV.map(item => (
                    <SidebarLink key={item.href} {...item} active={pathname === item.href} />
                ))}

                <div className="w-6 border-t border-white/10 my-2" />

                {MID_NAV.map(item => (
                    <SidebarLink key={item.href} {...item} active={pathname === item.href} />
                ))}
            </nav>

            {/* Bottom */}
            <div className="flex flex-col gap-2 items-center w-full pb-4 mt-auto shrink-0">
                <SidebarLink href="/settings" icon={Settings} label="Settings" active={pathname === '/settings'} />

                {/* Workspace pill */}
                <div
                    title={activeProjectName || 'No Workspace'}
                    className="w-8 h-8 mt-1 rounded-lg cursor-pointer flex items-center justify-center transition-colors group relative"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                    <span className="text-[10px] font-bold text-slate-300">{initials}</span>
                    <div className="absolute left-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50 rounded-xl px-3 py-2 text-xs shadow-2xl min-w-max flex flex-col gap-1" style={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <span className="text-slate-300 font-semibold font-sans">{activeProjectName || 'No project'}</span>
                        <button onClick={handleClearProject} className="text-red-400 hover:text-red-300 text-left pt-1 border-t border-white/10 mt-1 font-sans">Switch Project</button>
                    </div>
                </div>
            </div>
        </aside>
    );
}

function SidebarLink({ icon: Icon, href, active = false, label, badge }: NavItem & { active?: boolean }) {
    return (
        <Link
            href={href}
            title={label}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all group"
            style={active ? { background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#93C5FD" } : { border: "1px solid transparent", color: "#475569" }}
        >
            <Icon className="w-4.5 h-4.5" aria-hidden />
            {badge !== undefined && badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 text-black text-[8px] font-black flex items-center justify-center">
                    {badge}
                </span>
            )}
            <span className="absolute left-12 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 bg-[#0B1220] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white font-sans whitespace-nowrap shadow-xl">
                {label}
            </span>
        </Link>
    );
}
