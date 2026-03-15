
import React from 'react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
    children: React.ReactNode;
    className?: string;
}

export const Toolbar = ({ children, className }: ToolbarProps) => {
    return (
        <div className={cn(
            "h-10 border-b border-pt-border flex items-center px-4 gap-4 bg-pt-bg/30 relative overflow-hidden",
            className
        )}>
            {/* Background Accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-pt-intent-primary/5 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center gap-4 w-full">
                {children}
            </div>
        </div>
    );
};
