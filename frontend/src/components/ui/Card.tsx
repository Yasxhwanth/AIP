
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    title?: string;
    pill?: string;
    pillColor?: 'primary' | 'success' | 'warning' | 'danger' | 'muted';
    children: React.ReactNode;
    className?: string;
    headerAction?: React.ReactNode;
    onClick?: () => void;
}

export const Card = ({
    title,
    pill,
    pillColor = 'muted',
    children,
    className,
    headerAction,
    onClick
}: CardProps) => {
    const colorMap = {
        primary: 'bg-pt-intent-primary text-white border-t-pt-intent-primary',
        success: 'bg-pt-intent-success text-white border-t-pt-intent-success',
        warning: 'bg-pt-intent-warning text-white border-t-pt-intent-warning',
        danger: 'bg-pt-intent-danger text-white border-t-pt-intent-danger',
        muted: 'bg-pt-bg-hover text-pt-text-muted border-t-pt-border',
    };

    const pillBgMap = {
        primary: 'bg-pt-intent-primary',
        success: 'bg-pt-intent-success',
        warning: 'bg-pt-intent-warning',
        danger: 'bg-pt-intent-danger',
        muted: 'bg-pt-bg-hover',
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-pt-bg-panel border border-pt-border flex flex-col relative",
                onClick && "cursor-pointer hover:border-pt-intent-primary transition-all",
                pillColor !== 'muted' && "border-t-2",
                pillColor === 'primary' && "border-t-pt-intent-primary",
                pillColor === 'success' && "border-t-pt-intent-success",
                pillColor === 'warning' && "border-t-pt-intent-warning",
                pillColor === 'danger' && "border-t-pt-intent-danger",
                className
            )}>
            {(title || pill || headerAction) && (
                <div className="h-8 border-b border-pt-border flex items-center px-3 justify-between bg-pt-bg/50 backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                        {title && <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-pt-text-muted select-none">{title}</h3>}
                        {pill && (
                            <span className={cn("text-[8px] px-1.5 py-0.5 font-bold uppercase tracking-widest rounded-sm shadow-sm", pillBgMap[pillColor], pillColor === 'muted' ? 'text-pt-text-muted' : 'text-white')}>
                                {pill}
                            </span>
                        )}
                    </div>
                    {headerAction && <div className="flex items-center">{headerAction}</div>}
                </div>
            )}
            <div className="flex-1 overflow-auto custom-scrollbar">
                {children}
            </div>
        </div>
    );
};
