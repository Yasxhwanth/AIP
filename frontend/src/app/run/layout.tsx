import {
    LayoutTemplate, Search, Bell, UserCircle,
    Hexagon, Activity, Map, FolderOpen
} from "lucide-react";
import Link from "next/link";

export default function RunLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen w-full bg-[#0B1015] text-slate-300 font-sans text-[13px] overflow-hidden">

            {/* Global Operational Navbar (Palantir Workshop Runtime Style) */}
            <header className="h-[48px] bg-[#11161B] border-b border-black/50 flex items-center justify-between px-4 shrink-0 shadow-sm z-50">
                <div className="flex items-center gap-4 h-full">
                    {/* Platform Branding */}
                    <div className="flex items-center gap-2 pr-4 border-r border-white/5 h-full cursor-pointer hover:text-white transition-colors">
                        <Hexagon className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                        <span className="font-black text-[14px] text-white tracking-tight">O.S. PLATFORM</span>
                    </div>

                    {/* App Navigation */}
                    <div className="flex items-center gap-1 h-full">
                        <Link href="/run/dashboard" className="h-full px-3 flex items-center gap-2 text-white border-b-2 border-blue-500 bg-white/5">
                            <Activity className="w-4 h-4 text-blue-400" />
                            <span className="font-bold">Fleet Command Center</span>
                        </Link>
                        <Link href="/run/map" className="h-full px-3 flex items-center gap-2 text-[#8A9BA8] hover:text-white hover:bg-white/5 transition-colors border-b-2 border-transparent">
                            <Map className="w-4 h-4" />
                            <span className="font-bold">Geospatial Intel</span>
                        </Link>
                        <Link href="/run/cases" className="h-full px-3 flex items-center gap-2 text-[#8A9BA8] hover:text-white hover:bg-white/5 transition-colors border-b-2 border-transparent">
                            <FolderOpen className="w-4 h-4" />
                            <span className="font-bold">Active Cases</span>
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Global Search */}
                    <div className="relative group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C7080] group-focus-within:text-blue-400 transition-colors" />
                        <input
                            placeholder="Search ontology (Cmd+K)..."
                            className="bg-[#182026] border border-black rounded-sm pl-8 pr-3 py-1.5 text-[12px] text-white focus:outline-none focus:border-blue-500 focus:bg-[#11161B] w-64 transition-all placeholder:text-[#5C7080] shadow-inner"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                            <span className="text-[10px] font-mono text-[#5C7080] border border-[#5C7080]/30 rounded px-1">⌘</span>
                            <span className="text-[10px] font-mono text-[#5C7080] border border-[#5C7080]/30 rounded px-1">K</span>
                        </div>
                    </div>

                    <div className="w-px h-5 bg-white/10" />

                    {/* Utilities */}
                    <button className="text-[#8A9BA8] hover:text-white transition-colors relative">
                        <Bell className="w-4 h-4" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#11161B]" />
                    </button>

                    <button className="flex items-center gap-2 text-[#8A9BA8] hover:text-white transition-colors">
                        <UserCircle className="w-6 h-6" />
                    </button>

                    {/* Toggle Back to Builder (for demo purposes) */}
                    <Link href="/build/app" className="ml-2 px-3 py-1 bg-[#293742] hover:bg-[#394B59] text-white rounded-sm text-[11px] font-bold transition-colors border border-black flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                        <LayoutTemplate className="w-3 h-3" /> Edit App
                    </Link>
                </div>
            </header>

            {/* Application Canvas Area */}
            <main className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-[#0B1015] relative">
                {children}
            </main>
        </div>
    );
}
