
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SeverityChipProps {
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | string;
    label?: string;
    className?: string;
}

export const SeverityChip = ({ severity, label, className }: SeverityChipProps) => {
    const colorMap: Record<string, string> = {
        CRITICAL: 'bg-pt-intent-danger/10 border-pt-intent-danger text-pt-intent-danger',
        HIGH: 'bg-pt-intent-warning/10 border-pt-intent-warning text-pt-intent-warning',
        MEDIUM: 'bg-pt-intent-primary/10 border-pt-intent-primary text-pt-intent-primary',
        LOW: 'bg-pt-bg-hover border-pt-border text-pt-text-muted',
        INFO: 'bg-pt-bg-hover border-pt-border text-pt-text',
    };

    const dotMap: Record<string, string> = {
        CRITICAL: 'bg-pt-intent-danger animate-pulse',
        HIGH: 'bg-pt-intent-warning',
        MEDIUM: 'bg-pt-intent-primary',
        LOW: 'bg-pt-text-muted opacity-50',
        INFO: 'bg-pt-text opacity-50',
    };

    const s = severity.toUpperCase();
    const colorClass = colorMap[s] || colorMap.INFO;
    const dotClass = dotMap[s] || dotMap.INFO;

    return (
        <span className={cn(
            "text-[8px] pl-1.5 pr-2 py-0.5 font-black uppercase tracking-[0.1em] border rounded-sm inline-flex items-center gap-1.5 shadow-sm",
            colorClass,
            className
        )}>
            <div className={cn("w-1 h-1 rounded-full", dotClass)} />
            {label || severity}
        </span>
    );
};
