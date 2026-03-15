
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MiniListItemProps {
    label: string;
    value?: string | number | React.ReactNode;
    icon?: React.ElementType;
    metadata?: string;
    onClick?: () => void;
    active?: boolean;
}

export const MiniListItem = ({
    label,
    value,
    icon: Icon,
    metadata,
    onClick,
    active
}: MiniListItemProps) => (
    <div
        onClick={onClick}
        className={cn(
            "flex items-center px-3 py-1.5 cursor-pointer border-b border-pt-border last:border-b-0 transition-colors select-none",
            active ? 'bg-pt-intent-primary/10 border-l-[3px] border-l-pt-intent-primary pl-[9px]' : 'hover:bg-pt-bg-hover active:bg-pt-bg-hover/80 text-pt-text-muted hover:text-pt-text'
        )}
    >
        {Icon && <Icon size={12} className={cn("mr-2 shrink-0 transition-colors", active ? "text-pt-intent-primary" : "text-pt-text-muted")} />}
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
                <span className={cn("text-[11px] truncate uppercase tracking-tight font-medium transition-colors", active ? 'text-pt-text font-bold' : '')}>
                    {label}
                </span>
                {value !== undefined && (
                    <span className={cn("text-[10px] font-mono ml-2 shrink-0 transition-colors", active ? "text-pt-intent-primary font-bold" : "text-pt-text opacity-70")}>
                        {value}
                    </span>
                )}
            </div>
            {metadata && (
                <div className="text-[9px] text-pt-text-muted/60 truncate mt-0.5 leading-none transition-colors group-hover:text-pt-text-muted">
                    {metadata}
                </div>
            )}
        </div>
    </div>
);

export const MiniList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("flex flex-col select-none", className)}>
        {children}
    </div>
);
