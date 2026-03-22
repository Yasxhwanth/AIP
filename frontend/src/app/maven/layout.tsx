'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Brain,
    GitBranch,
    Globe,
    Map,
    Shield,
    Swords,
} from 'lucide-react';

const MAVEN_TABS = [
    { href: '/maven', icon: Map, label: 'Mission Command' },
    { href: '/maven/geo-intel', icon: Globe, label: 'Geo-Intel' },
    { href: '/maven/intel-graph', icon: GitBranch, label: 'Intel Graph' },
    { href: '/maven/pattern-of-life', icon: Brain, label: 'Pattern of Life' },
    { href: '/maven/kill-chain', icon: Swords, label: 'Kill Chain' },
    { href: '/maven/coa-sim', icon: Shield, label: 'CoA Sim' },
];

export default function MavenLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-pt-bg overflow-hidden">
            {/* Section tab nav */}
            <nav className="shrink-0 flex items-end border-b border-pt-border bg-pt-bg px-6 pt-3">
                <div className="flex items-center gap-2 pr-6 border-r border-pt-border mr-4 pb-3">
                    <Swords size={12} className="text-pt-intent-danger" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-pt-text-muted">MAVEN</span>
                </div>
                {MAVEN_TABS.map(({ href, icon: Icon, label }) => {
                    const isActive = href === '/maven'
                        ? pathname === '/maven'
                        : pathname?.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`
                                relative flex items-center gap-1.5 px-4 pb-3 text-[10px] font-black uppercase tracking-widest
                                transition-all border-b-2 -mb-px
                                ${isActive
                                    ? 'text-pt-text border-pt-intent-primary'
                                    : 'text-pt-text-muted border-transparent hover:text-pt-text hover:border-pt-border'
                                }
                            `}
                        >
                            <Icon size={11} className={isActive ? 'text-pt-intent-primary' : ''} />
                            {label}
                        </Link>
                    );
                })}
            </nav>
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                {children}
            </div>
        </div>
    );
}
