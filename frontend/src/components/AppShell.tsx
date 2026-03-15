
'use client';

import React, { useState, useEffect } from 'react';
import {
    Database,
    Workflow,
    Activity,
    Shield,
    Terminal,
    Search,
    Zap,
    ChevronDown,
    Bell,
    User,
    LayoutGrid,
    Settings,
    X,
    Command,
    Fingerprint,
    Boxes,
    Cpu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { AipAssistSidebar } from './AipAssistSidebar';
import CommandPalette from './CommandPalette';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    href: string;
    active?: boolean;
}

const NavItem = ({ icon: Icon, label, href, active }: NavItemProps) => (
    <Link
        href={href}
        className={`group flex items-center justify-center w-12 h-12 transition-all relative ${active
            ? 'text-pt-intent-primary'
            : 'text-pt-text-muted hover:text-pt-text hover:bg-pt-bg-hover'
            }`}
        title={label}
    >
        {active && (
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-pt-intent-primary shadow-[0_0_8px_rgba(16,107,163,0.5)]" />
        )}
        <Icon size={18} className={active ? 'drop-shadow-[0_0_5px_rgba(16,107,163,0.5)]' : ''} />
    </Link>
);

import { useMnemonics } from "@/hooks/useMnemonics";

export const AppShell = ({ children }: { children: React.ReactNode }) => {
    useMnemonics();
    const pathname = usePathname();
    const router = useRouter();
    const [assistOpen, setAssistOpen] = useState(false);
    const { projects } = useWorkspaceStore();
    const activeProject = projects[0]; // Baseline for demo

    // Key command listener for shortcuts
    useEffect(() => {
        let keyBuffer = "";
        let bufferTimeout: any = null;

        const handleKeyDown = (e: KeyboardEvent) => {
            // AIP Assist Sidebar (Ctrl+Shift+U)
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'u') {
                e.preventDefault();
                setAssistOpen(prev => !prev);
                return;
            }

            // Command Palette (Ctrl+K) is handled by the component itself,
            // but we can ensure it's closed when navigating.

            // Mnemonic Shortcuts (g + key)
            // We ignore if typing in a search bar or input
            const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) return;

            const key = e.key.toLowerCase();

            // Clear buffer on non-alphanumeric or escape
            if (key === 'escape') {
                keyBuffer = "";
                return;
            }

            keyBuffer += key;
            if (bufferTimeout) clearTimeout(bufferTimeout);
            bufferTimeout = setTimeout(() => { keyBuffer = ""; }, 1000);

            if (keyBuffer === 'go') {
                router.push('/ontology');
                keyBuffer = "";
            } else if (keyBuffer === 'gi') {
                router.push('/integrations');
                keyBuffer = "";
            } else if (keyBuffer === 'gm') {
                router.push('/maven');
                keyBuffer = "";
            } else if (keyBuffer === 'gd') {
                router.push('/run/dashboard');
                keyBuffer = "";
            } else if (keyBuffer === 'gt') {
                router.push('/telemetry');
                keyBuffer = "";
            } else if (keyBuffer === 'gs') {
                router.push('/sre/jobs');
                keyBuffer = "";
            }

            // Limit buffer size
            if (keyBuffer.length > 2) keyBuffer = keyBuffer.slice(-2);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    return (
        <div className="flex h-screen w-screen bg-pt-bg text-pt-text overflow-hidden font-sans select-none antialiased">
            {/* ── Left Rail (Stable Navigation) ── */}
            <aside className="w-12 border-r border-pt-border flex flex-col items-center z-50 bg-pt-bg">
                <div className="w-12 h-12 flex items-center justify-center border-b border-pt-border group cursor-pointer hover:bg-pt-bg-panel transition-colors">
                    <div className="w-7 h-7 bg-pt-intent-primary rounded-sm flex items-center justify-center text-white font-black text-[10px] shadow-lg group-hover:scale-105 transition-transform">
                        AIP
                    </div>
                </div>

                <nav className="flex-1 flex flex-col items-center py-2">
                    <NavItem icon={Boxes} label="Run Ops" href="/run/dashboard" active={pathname?.startsWith('/run')} />
                    <div className="w-6 h-px bg-pt-border my-2" />
                    <NavItem icon={Database} label="Ontology" href="/ontology" active={pathname?.startsWith('/ontology')} />
                    <NavItem icon={Workflow} label="Integrations" href="/integrations" active={pathname?.startsWith('/integrations')} />
                    <NavItem icon={Activity} label="Telemetry" href="/telemetry" active={pathname?.startsWith('/telemetry')} />
                    <NavItem icon={Shield} label="Maven" href="/maven" active={pathname?.startsWith('/maven')} />
                    <NavItem icon={LayoutGrid} label="Workshop" href="/workshop" active={pathname?.startsWith('/workshop')} />
                    <NavItem icon={Terminal} label="Terminal" href="/terminal" active={pathname?.startsWith('/terminal')} />
                    <NavItem icon={Cpu} label="SRE" href="/sre/jobs" active={pathname?.startsWith('/sre')} />
                </nav>

                <div className="mt-auto flex flex-col items-center pb-4 space-y-2">
                    <NavItem icon={Settings} label="Admin" href="/admin" active={pathname?.startsWith('/admin')} />
                    <div className="w-8 h-8 rounded-full bg-pt-bg-hover flex items-center justify-center border border-pt-border cursor-pointer hover:border-pt-intent-primary transition-colors">
                        <User size={14} className="text-pt-text-muted" />
                    </div>
                </div>
            </aside>

            {/* ── Main Canvas ── */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Top Bar (Workspace & Search) */}
                <header className="h-10 border-b border-pt-border flex items-center px-4 justify-between bg-pt-bg z-40">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 px-2 py-1 hover:bg-pt-bg-hover rounded border border-transparent hover:border-pt-border transition-all cursor-pointer group">
                            <Fingerprint size={12} className="text-pt-intent-primary opacity-50 group-hover:opacity-100" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-pt-text">{activeProject?.name || 'Default Project'}</span>
                            <ChevronDown size={10} className="text-pt-text-muted opacity-50" />
                        </div>
                        <div className="h-4 w-px bg-pt-border" />
                        <div className="flex items-center space-x-2 text-[9px] uppercase font-bold tracking-[0.2em] text-pt-text-muted">
                            <span className="opacity-40">{pathname?.split('/')[1]?.toUpperCase() || 'PLATFORM'}</span>
                            {pathname?.split('/')[2] && (
                                <>
                                    <span className="opacity-20">/</span>
                                    <span className="text-pt-text opacity-70">{pathname?.split('/')[2]?.toUpperCase()}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* Global Search / Command Bar */}
                        <div className="relative group flex items-center">
                            <div className="absolute left-2.5 opacity-30 group-focus-within:opacity-100 transition-opacity">
                                <Search className="w-3 h-3 text-pt-intent-primary" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search Ontology, Actions, Sensors…"
                                className="bg-pt-bg-panel border border-pt-border rounded px-8 py-1.5 text-[10px] font-bold uppercase tracking-widest w-72 focus:outline-none focus:border-pt-intent-primary focus:ring-1 focus:ring-pt-intent-primary/20 transition-all placeholder:opacity-20 shadow-inner"
                            />
                            <div className="absolute right-2 flex items-center gap-1 opacity-20 group-hover:opacity-50 transition-opacity">
                                <Command size={10} />
                                <span className="text-[9px] font-bold">K</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-1 border-l border-pt-border pl-4">
                            <button
                                className={`p-1.5 transition-all rounded hover:bg-pt-bg-hover ${assistOpen ? 'text-pt-intent-primary bg-pt-intent-primary/5' : 'text-pt-text-muted hover:text-pt-text'}`}
                                onClick={() => setAssistOpen(!assistOpen)}
                                title="AIP Assist (Ctrl+Shift+U)"
                            >
                                <Zap size={16} className={assistOpen ? 'animate-pulse' : ''} />
                            </button>
                            <button className="p-1.5 text-pt-text-muted hover:text-pt-text transition-colors rounded hover:bg-pt-bg-hover">
                                <Bell size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-hidden relative flex flex-col">
                    {children}
                </main>
            </div>

            {/* ── AIP Assist Sidebar (Global Contextual AI) ── */}
            <AipAssistSidebar isOpen={assistOpen} onClose={() => setAssistOpen(false)} />

            {/* ── Command Palette (Global Search) ── */}
            <CommandPalette />
        </div>
    );
};
