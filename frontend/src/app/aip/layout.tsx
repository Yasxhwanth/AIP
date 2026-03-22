'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, FlaskConical } from 'lucide-react';

const AIP_TABS = [
    { href: '/aip', icon: FlaskConical, label: 'Overview' },
    { href: '/aip/agent-studio', icon: Bot, label: 'Agent Studio' },
];

export default function AIPLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-pt-bg overflow-hidden">
            {/* Section Sub-nav */}
            <nav className="shrink-0 flex items-end gap-0 border-b border-pt-border bg-pt-bg px-6 pt-3">
                <div className="flex items-center gap-2 pr-6 border-r border-pt-border mr-4 pb-3">
                    <FlaskConical size={12} className="text-pt-intent-primary" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-pt-text-muted">AIP</span>
                </div>
                {AIP_TABS.map(({ href, icon: Icon, label }) => {
                    const isActive = href === '/aip' ? pathname === '/aip' : pathname?.startsWith(href);
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
