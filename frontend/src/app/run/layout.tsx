import {
    LayoutTemplate, Search, Bell, UserCircle,
    Hexagon, Activity, Map, FolderOpen, ChevronDown,
    Command, Settings, LayoutDashboard
} from "lucide-react";
import Link from "next/link";

export default function RunLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen w-full bg-pt-bg text-pt-text font-mono text-[11px] overflow-hidden">

            {/* Global Operational Navbar (Mission Command Style) */}
            <header className="h-[48px] bg-pt-bg-panel border-b border-pt-border flex items-center justify-between px-6 shrink-0 z-[60] shadow-2xl">
                <div className="flex items-center gap-6 h-full">
                    {/* Platform Branding */}
                    <Link href="/" className="flex items-center gap-3 pr-6 border-r border-pt-border h-full group">
                        <Hexagon className="w-5 h-5 text-pt-intent-primary fill-pt-intent-primary/10 group-hover:scale-110 transition-transform" />
                        <div className="flex flex-col">
                            <span className="font-black text-[12px] text-pt-text tracking-tighter leading-none">AIP MISSION CONTROL</span>
                            <span className="text-[8px] text-pt-text-muted font-bold tracking-[0.2em] mt-1 opacity-50 uppercase">Operational Stack</span>
                        </div>
                    </Link>

                    {/* Persistence Navigation */}
                    <nav className="flex items-center gap-1 h-full">
                        <Link href="/run/dashboard" className="h-[48px] px-5 flex items-center gap-2.5 text-pt-text transition-all relative group bg-pt-bg/30">
                            <LayoutDashboard className="w-3.5 h-3.5 text-pt-intent-primary" />
                            <span className="font-black uppercase tracking-widest text-[10px]">Command Center</span>
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pt-intent-primary shadow-[0_0_8px_rgb(var(--pt-intent-primary)/0.5)]" />
                        </Link>

                        <Link href="/run/map" className="h-[48px] px-5 flex items-center gap-2.5 text-pt-text-muted hover:text-pt-text hover:bg-pt-bg/20 transition-all group">
                            <Map className="w-3.5 h-3.5 group-hover:text-pt-intent-primary transition-colors" />
                            <span className="font-black uppercase tracking-widest text-[10px]">Geospatial</span>
                        </Link>

                        <Link href="/run/cases" className="h-[48px] px-5 flex items-center gap-2.5 text-pt-text-muted hover:text-pt-text hover:bg-pt-bg/20 transition-all group">
                            <FolderOpen className="w-3.5 h-3.5 group-hover:text-pt-intent-primary transition-colors" />
                            <span className="font-black uppercase tracking-widest text-[10px]">Inbound Cases</span>
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-5">
                    {/* Global Command Buffer */}
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                            <Command className="w-3.5 h-3.5 text-pt-text-muted opacity-40 group-focus-within:text-pt-intent-primary transition-colors" />
                        </div>
                        <input
                            placeholder="QUERY SYSTEM REGISTRY…"
                            className="bg-pt-bg border border-pt-border rounded-lg pl-10 pr-12 py-1.5 text-[10px] font-black tracking-widest text-pt-text focus:outline-none focus:border-pt-intent-primary focus:bg-pt-bg-panel w-72 transition-all placeholder:opacity-30 shadow-inner"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
                            <kbd className="bg-pt-bg-panel border border-pt-border px-1.5 py-0.5 rounded text-[9px] font-sans">⌘</kbd>
                            <kbd className="bg-pt-bg-panel border border-pt-border px-1.5 py-0.5 rounded text-[9px] font-sans">K</kbd>
                        </div>
                    </div>

                    <div className="w-px h-6 bg-pt-border" />

                    {/* Operational Utilities */}
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-pt-text-muted hover:text-pt-intent-primary transition-all relative rounded-lg hover:bg-pt-bg/40 group">
                            <Bell className="w-4 h-4 group-hover:animate-swing" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-pt-intent-danger rounded-full border-2 border-pt-bg-panel" />
                        </button>

                        <button className="p-2 text-pt-text-muted hover:text-pt-text transition-all rounded-lg hover:bg-pt-bg/40">
                            <Settings className="w-4 h-4" />
                        </button>

                        <button className="flex items-center gap-2 pl-3 pr-2 py-1.5 border border-pt-border rounded-xl hover:bg-pt-bg/40 transition-all group">
                            <div className="w-6 h-6 rounded-full bg-pt-intent-primary/20 border border-pt-intent-primary/30 flex items-center justify-center">
                                <UserCircle className="w-4 h-4 text-pt-intent-primary" />
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-pt-text-muted group-hover:text-pt-text transition-colors" />
                        </button>

                        <Link href="/build" className="ml-2 px-4 h-8 bg-pt-bg-panel hover:bg-pt-bg border border-pt-border hover:border-pt-intent-primary text-pt-text rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl active:scale-95 group">
                            <LayoutTemplate className="w-3.5 h-3.5 text-pt-intent-primary group-hover:scale-110 transition-transform" />
                            Switch to Builder
                        </Link>
                    </div>
                </div>
            </header>

            {/* Application Operational Canvas */}
            <main className="flex-1 min-w-0 min-h-0 overflow-hidden bg-pt-bg relative flex flex-col">
                {children}

                {/* Background Lattice Accent */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-[-1]"
                    style={{ backgroundImage: 'linear-gradient(var(--pt-border) 1px, transparent 1px), linear-gradient(90deg, var(--pt-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
            </main>
        </div>
    );
}
