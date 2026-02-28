"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBuilderStore } from "@/store/builderStore";
import { Network, Zap, BrainCircuit, LayoutDashboard, Rocket, Lock, CheckCircle2 } from "lucide-react";

export default function BuilderSidebar() {
    const pathname = usePathname();
    const { entityTypes, actions, agents, pages } = useBuilderStore();

    // ── Unlock Logic ──────────────────────────────────────────────────────────
    const hasValidEntity = entityTypes.length > 0 && entityTypes.some(e => e.properties.length > 0);
    const hasAiAction = actions.length > 0;
    const hasConfiguredAgent = agents.some(a => a.entityScopes.length > 0);
    const hasPages = pages.length > 0;

    const navItems = [
        {
            id: 'ontology',
            href: "/build/ontology",
            label: "1. Ontology",
            icon: Network,
            unlocked: true,
            done: hasValidEntity
        },
        {
            id: 'actions',
            href: "/build/actions",
            label: "2. Actions",
            icon: Zap,
            unlocked: hasValidEntity,
            done: hasAiAction
        },
        {
            id: 'ai',
            href: "/build/ai",
            label: "3. AI Agents",
            icon: BrainCircuit,
            unlocked: hasValidEntity && hasAiAction,
            done: hasConfiguredAgent
        },
        {
            id: 'app',
            href: "/build/app",
            label: "4. App Builder",
            icon: LayoutDashboard,
            unlocked: hasValidEntity && hasAiAction && hasConfiguredAgent,
            done: hasPages
        },
        {
            id: 'publish',
            href: "/build/publish",
            label: "5. Publish",
            icon: Rocket,
            unlocked: hasValidEntity && hasAiAction && hasConfiguredAgent && hasPages,
            done: false
        },
    ];

    return (
        <aside className="w-64 border-r border-white/6 flex flex-col shrink-0" style={{ background: "#0B1220" }}>
            <div className="p-4 border-b border-white/6 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                Platform Builder
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map((item) => {
                    const active = pathname.startsWith(item.href);

                    if (!item.unlocked) {
                        return (
                            <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-40 cursor-not-allowed text-slate-500">
                                <Lock className="w-4 h-4" />
                                <span className="text-sm font-semibold font-sans">{item.label}</span>
                            </div>
                        );
                    }

                    return (
                        <Link key={item.id} href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${active ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                }`}>

                            <item.icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            <span className="text-sm font-semibold font-sans">{item.label}</span>

                            {item.done && !active && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/50 absolute right-3" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </aside>
    );
}
