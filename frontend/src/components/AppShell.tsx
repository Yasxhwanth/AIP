'use client';

import React, { useEffect, useState } from 'react';
import {
    Activity,
    Bell,
    BookOpen,
    Bot,
    Boxes,
    Brain,
    ChevronDown,
    Command,
    Cpu,
    Database,
    Fingerprint,
    FlaskConical,
    GitPullRequest,
    LayoutGrid,
    Search,
    Settings,
    Shield,
    Terminal,
    User,
    Workflow,
    Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { AipAssistSidebar } from './AipAssistSidebar';
import CommandPalette from './CommandPalette';
import { useMnemonics } from '@/hooks/useMnemonics';

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItemProps {
    icon: React.ElementType;
    label: string;
    href: string;
    active?: boolean;
}

// ─── Icon-only nav item (sidebar) ─────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, href, active }: NavItemProps) => (
    <Link
        href={href}
        className={`group flex items-center justify-center w-14 h-11 transition-all relative ${active ? 'text-pt-intent-primary' : 'text-pt-text-muted hover:text-pt-text hover:bg-pt-bg-hover'
            }`}
        title={label}
    >
        {active && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-pt-intent-primary shadow-[0_0_8px_rgba(16,107,163,0.5)]" />}
        <Icon size={17} className={active ? 'drop-shadow-[0_0_5px_rgba(16,107,163,0.5)]' : ''} />
    </Link>
);

// ─── Section separator with label ─────────────────────────────────────────────
const SectionLabel = ({ label }: { label: string }) => (
    <div className="w-full flex items-center justify-center py-1.5">
        <span className="text-[6px] font-black uppercase tracking-[0.25em] text-pt-text-muted opacity-30">
            {label}
        </span>
    </div>
);

const Divider = () => <div className="w-6 h-px bg-pt-border mx-auto my-1" />;

// ─── AppShell ──────────────────────────────────────────────────────────────────
export const AppShell = ({ children }: { children: React.ReactNode }) => {
    useMnemonics();

    const pathname = usePathname();
    const router = useRouter();
    const [assistOpen, setAssistOpen] = useState(false);
    const { projects, activeProjectName, activeProjectClassification } = useWorkspaceStore();

    const activeProject = activeProjectName
        ? { name: activeProjectName, classification: activeProjectClassification }
        : projects[0];

    // ─── Keyboard navigation ───────────────────────────────────────
    useEffect(() => {
        let keyBuffer = '';
        let bufferTimeout: ReturnType<typeof setTimeout> | null = null;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'u') {
                event.preventDefault();
                setAssistOpen(prev => !prev);
                return;
            }

            const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || (event.target as HTMLElement)?.isContentEditable) return;

            const key = event.key.toLowerCase();
            if (key === 'escape') { keyBuffer = ''; return; }

            keyBuffer += key;
            if (bufferTimeout) clearTimeout(bufferTimeout);
            bufferTimeout = setTimeout(() => { keyBuffer = ''; }, 1000);

            // ── Shortcut map ──────────────────────────────────────
            const shortcuts: Record<string, string> = {
                'gr': '/run/dashboard',
                'go': '/ontology',
                'gi': '/integrations',
                'gt': '/telemetry',
                'gm': '/maven',
                'gw': '/workshop',
                // SRE section
                'gs': '/sre/jobs',
                'ga': '/sre/agent-monitor',
                'gg': '/sre/governance',
                'gb': '/sre/audit',
                // AIP section
                'gp': '/aip',
                'gl': '/aip/agent-studio',
            };

            if (shortcuts[keyBuffer]) {
                router.push(shortcuts[keyBuffer]);
                keyBuffer = '';
            }

            if (keyBuffer.length > 2) keyBuffer = keyBuffer.slice(-2);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-pt-bg text-pt-text font-sans antialiased">
            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <aside className="w-14 border-r border-pt-border flex flex-col items-center z-50 bg-pt-bg">
                {/* Logo */}
                <div className="w-14 h-12 flex items-center justify-center border-b border-pt-border group cursor-pointer hover:bg-pt-bg-panel transition-colors shrink-0">
                    <div className="w-7 h-7 bg-pt-intent-primary rounded-sm flex items-center justify-center text-white font-black text-[10px] shadow-lg group-hover:scale-105 transition-transform">
                        AIP
                    </div>
                </div>

                <nav className="flex-1 flex flex-col items-center py-2 overflow-y-auto w-full">
                    {/* ── Operations ──────────────────────── */}
                    <SectionLabel label="OPS" />
                    <NavItem icon={Boxes} label="Run Ops (gr)" href="/run/dashboard" active={pathname?.startsWith('/run')} />

                    <Divider />

                    {/* ── Data ────────────────────────────── */}
                    <SectionLabel label="DATA" />
                    <NavItem icon={Database} label="Ontology (go)" href="/ontology" active={pathname?.startsWith('/ontology')} />
                    <NavItem icon={Workflow} label="Integrations (gi)" href="/integrations" active={pathname?.startsWith('/integrations')} />
                    <NavItem icon={Activity} label="Telemetry (gt)" href="/telemetry" active={pathname?.startsWith('/telemetry')} />

                    <Divider />

                    {/* ── Mission ─────────────────────────── */}
                    <SectionLabel label="MISSION" />
                    <NavItem icon={Shield} label="Maven (gm)" href="/maven" active={pathname?.startsWith('/maven')} />
                    <NavItem icon={LayoutGrid} label="Workshop" href="/workshop" active={pathname?.startsWith('/workshop')} />
                    <NavItem icon={Terminal} label="Terminal" href="/terminal" active={pathname?.startsWith('/terminal')} />

                    <Divider />

                    {/* ── AIP Intelligence ─────────────────── */}
                    <SectionLabel label="AIP" />
                    <NavItem icon={FlaskConical} label="AIP Hub (gp)" href="/aip" active={pathname === '/aip'} />
                    <NavItem icon={Bot} label="Agent Studio (gl)" href="/aip/agent-studio" active={pathname?.startsWith('/aip/agent-studio')} />

                    <Divider />

                    {/* ── SRE / Platform ───────────────────── */}
                    <SectionLabel label="SRE" />
                    <NavItem icon={Cpu} label="Jobs (gs)" href="/sre/jobs" active={pathname === '/sre/jobs'} />
                    <NavItem icon={Zap} label="Agent Monitor (ga)" href="/sre/agent-monitor" active={pathname?.startsWith('/sre/agent-monitor')} />
                    <NavItem icon={GitPullRequest} label="Governance (gg)" href="/sre/governance" active={pathname?.startsWith('/sre/governance')} />
                    <NavItem icon={BookOpen} label="Audit Log (gb)" href="/sre/audit" active={pathname?.startsWith('/sre/audit')} />
                </nav>

                {/* Bottom utilities */}
                <div className="mt-auto flex flex-col items-center pb-4 space-y-1 shrink-0">
                    <NavItem icon={Settings} label="Admin" href="/admin" active={pathname?.startsWith('/admin')} />
                    <div className="w-8 h-8 rounded-full bg-pt-bg-hover flex items-center justify-center border border-pt-border cursor-pointer hover:border-pt-intent-primary transition-colors">
                        <User size={14} className="text-pt-text-muted" />
                    </div>
                </div>
            </aside>

            {/* ── Main content area ─────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Top bar */}
                <header className="h-11 border-b border-pt-border flex items-center px-4 justify-between bg-pt-bg z-40 gap-4 shrink-0">
                    <div className="flex items-center gap-4 min-w-0">
                        {/* Project context */}
                        <div className="flex items-center gap-2 px-2 py-1 hover:bg-pt-bg-hover rounded border border-transparent hover:border-pt-border transition-all cursor-pointer group min-w-0">
                            <Fingerprint size={12} className="text-pt-intent-primary opacity-50 group-hover:opacity-100 shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-pt-text leading-tight truncate">
                                    {activeProject?.name || 'Default Project'}
                                </span>
                                {activeProject?.classification && (
                                    <span className="text-[7px] font-bold text-amber-500 tracking-wider h-2 leading-[8px] truncate">
                                        {activeProject.classification}
                                    </span>
                                )}
                            </div>
                            <ChevronDown size={10} className="text-pt-text-muted opacity-50 shrink-0" />
                        </div>

                        <div className="h-4 w-px bg-pt-border" />

                        {/* Breadcrumb */}
                        <div className="hidden lg:flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-[0.2em] text-pt-text-muted">
                            <span className="opacity-40">{pathname?.split('/')[1]?.toUpperCase() || 'PLATFORM'}</span>
                            {pathname?.split('/')[2] && (
                                <>
                                    <span className="opacity-20">/</span>
                                    <span className="text-pt-text opacity-70">{pathname?.split('/')[2]?.toUpperCase()}</span>
                                </>
                            )}
                            {pathname?.split('/')[3] && (
                                <>
                                    <span className="opacity-20">/</span>
                                    <span className="text-pt-intent-primary opacity-80">{pathname?.split('/')[3]?.toUpperCase()}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 min-w-0">
                        {/* Search */}
                        <div className="relative group flex items-center min-w-0">
                            <div className="absolute left-2.5 opacity-30 group-focus-within:opacity-100 transition-opacity">
                                <Search className="w-3 h-3 text-pt-intent-primary" />
                            </div>
                            <input
                                type="text"
                                suppressHydrationWarning
                                placeholder="Search ontology, actions, sensors..."
                                className="bg-pt-bg-panel border border-pt-border rounded px-8 py-1.5 text-[10px] font-bold uppercase tracking-widest w-56 md:w-72 xl:w-96 focus:outline-none focus:border-pt-intent-primary focus:ring-1 focus:ring-pt-intent-primary/20 transition-all placeholder:opacity-20 shadow-inner"
                            />
                            <div className="absolute right-2 flex items-center gap-1 opacity-20 group-hover:opacity-50 transition-opacity">
                                <Command size={10} />
                                <span className="text-[9px] font-bold">K</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 border-l border-pt-border pl-3">
                            {/* AIP Assist toggle */}
                            <button
                                suppressHydrationWarning
                                className={`p-1.5 transition-all rounded hover:bg-pt-bg-hover ${assistOpen ? 'text-pt-intent-primary bg-pt-intent-primary/5' : 'text-pt-text-muted hover:text-pt-text'
                                    }`}
                                onClick={() => setAssistOpen(!assistOpen)}
                                title="AIP Assist (Ctrl+Shift+U)"
                            >
                                <Zap size={16} className={assistOpen ? 'animate-pulse' : ''} />
                            </button>
                            <button suppressHydrationWarning className="p-1.5 text-pt-text-muted hover:text-pt-text transition-colors rounded hover:bg-pt-bg-hover">
                                <Bell size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 min-h-0 overflow-hidden relative flex flex-col">{children}</main>
            </div>

            <AipAssistSidebar isOpen={assistOpen} onClose={() => setAssistOpen(false)} />
            <CommandPalette />
        </div>
    );
};
