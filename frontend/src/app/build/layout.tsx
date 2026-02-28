"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Database, Network, BrainCircuit, LayoutTemplate,
    Send, Settings, HelpCircle, MessageSquare
} from "lucide-react";

export default function BuildLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMenuExp, setIsMenuExp] = useState(false);

    // Exact Palantir Foundry builder structure
    const BUILDER_NAV = [
        { name: "Ontology", href: "/build/ontology", icon: Database },
        { name: "Actions", href: "/build/actions", icon: Network },
        { name: "AIP Logic", href: "/build/ai", icon: BrainCircuit },
        { name: "Workshop App", href: "/build/app", icon: LayoutTemplate },
        { name: "Publish", href: "/build/publish", icon: Send }
    ];

    return (
        <div className="flex h-screen w-full bg-pt-bg text-pt-text font-sans text-[13px] overflow-hidden">

            {/* Extremely dense, functional Left Nav (Blueprint.js style) */}
            <nav
                className="h-full bg-[#182026] text-slate-300 flex flex-col shrink-0 border-r border-black/20"
                style={{ width: isMenuExp ? "200px" : "48px", transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
                onMouseEnter={() => setIsMenuExp(true)}
                onMouseLeave={() => setIsMenuExp(false)}
            >
                <div className="h-[48px] flex items-center justify-center border-b border-white/10 shrink-0 bg-[#10161A] text-white">
                    <Database className="w-5 h-5 text-blue-500" />
                </div>

                <div className="flex-1 py-3 flex flex-col gap-1 overflow-x-hidden">
                    {BUILDER_NAV.map(nav => {
                        const isActive = pathname.startsWith(nav.href);
                        const Icon = nav.icon;
                        return (
                            <Link
                                key={nav.name}
                                href={nav.href}
                                className={`flex items-center gap-3 px-[14px] py-[10px] whitespace-nowrap transition-colors overflow-hidden
                                    ${isActive ? 'bg-[#293742] text-white border-l-2 border-blue-400' : 'hover:bg-[#293742]/50 text-[#8A9BA8] border-l-2 border-transparent'}`
                                }
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className={`text-[12px] font-semibold tracking-wide ${isMenuExp ? 'opacity-100' : 'opacity-0'} transition-opacity delay-75`}>
                                    {nav.name}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                <div className="py-3 border-t border-white/10 flex flex-col gap-1 overflow-x-hidden shrink-0">
                    <button className="flex items-center gap-3 px-[14px] py-[10px] text-[#8A9BA8] hover:bg-[#293742]/50 transition-colors whitespace-nowrap overflow-hidden border-l-2 border-transparent">
                        <Settings className="w-4 h-4 shrink-0" />
                        <span className={`text-[12px] font-semibold tracking-wide ${isMenuExp ? 'opacity-100' : 'opacity-0'} transition-opacity delay-75`}>Settings</span>
                    </button>
                    <button className="flex items-center gap-3 px-[14px] py-[10px] text-[#8A9BA8] hover:bg-[#293742]/50 transition-colors whitespace-nowrap overflow-hidden border-l-2 border-transparent">
                        <HelpCircle className="w-4 h-4 shrink-0" />
                        <span className={`text-[12px] font-semibold tracking-wide ${isMenuExp ? 'opacity-100' : 'opacity-0'} transition-opacity delay-75`}>Help & Info</span>
                    </button>
                </div>
            </nav>

            {/* Main Content Area (Children render TopBar and Panels) */}
            <main className="flex-1 min-w-0 bg-[#F5F8FA] relative flex flex-col overflow-hidden">
                {children}

                {/* Contextual Help / AIP Assist Floating Widget (Global for Builders) */}
                <button className="absolute bottom-6 right-6 w-12 h-12 bg-[#182026] text-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-[#293742] hover:scale-105 transition-all group border border-white/10 z-[100]">
                    <MessageSquare className="w-5 h-5 fill-current opacity-80" />
                    <span className="absolute right-14 bg-[#182026] text-white text-[11px] font-bold px-3 py-1.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                        AIP Assist
                    </span>
                </button>
            </main>
        </div>
    );
}
