"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBuilderStore } from "@/store/builderStore";
import {
    LayoutDashboard, Database, BrainCircuit, Inbox, Activity,
    ChevronDown, Folder
} from "lucide-react";

export default function RuntimeSidebar() {
    const pathname = usePathname();
    const { entityTypes } = useBuilderStore();

    const mainNav = [
        { href: "/run", label: "Dashboard", icon: LayoutDashboard },
        { href: "/run/ai", label: "AI Console", icon: BrainCircuit },
        { href: "/run/cases", label: "Cases", icon: Inbox },
        { href: "/run/activity", label: "Activity Log", icon: Activity },
    ];

    return (
        <aside className="w-16 hover:w-56 transition-all duration-300 group overflow-hidden border-r border-white/6 flex flex-col shrink-0 z-40 bg-[#0B1220]">

            <div className="flex flex-col gap-1 w-full px-2 mt-4 flex-1">
                {mainNav.map(item => {
                    const active = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}
                            title={item.label}
                            className={`flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap ${active ? 'bg-[#1E3A8A] text-blue-100' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}>
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span className="text-sm font-sans font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}

                <div className="w-full h-px bg-white/10 my-4" />

                <div className="px-3 pb-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                    <Database className="w-3 h-3" /> Ontology Objects
                </div>

                {entityTypes.map(ent => {
                    const href = `/run/entity/${ent.id}`;
                    const active = pathname.startsWith(href);
                    return (
                        <Link key={ent.id} href={href}
                            title={ent.name}
                            className={`flex items-center gap-4 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${active ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                                }`}>
                            <div className="w-5 h-5 shrink-0 flex items-center justify-center bg-white/5 rounded border border-white/10">
                                <span className="text-[10px] font-bold">{ent.name[0]}</span>
                            </div>
                            <span className="text-sm font-sans opacity-0 group-hover:opacity-100 transition-opacity">
                                {ent.name}s
                            </span>
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}
