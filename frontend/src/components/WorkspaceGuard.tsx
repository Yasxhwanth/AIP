"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWorkspaceStore } from '@/store/workspace';

export default function WorkspaceGuard({ children }: { children: React.ReactNode }) {
    const { activeProjectId } = useWorkspaceStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const isDemoOnGeo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && pathname === '/geo';
        if (mounted && !activeProjectId && pathname !== '/projects' && !isDemoOnGeo) {
            router.push('/projects');
        }
    }, [mounted, activeProjectId, pathname, router]);

    if (!mounted) {
        return null;
    }

    // Prevent flash of protected content before redirect
    const isDemoOnGeo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && pathname === '/geo';
    if (!activeProjectId && pathname !== '/projects' && !isDemoOnGeo) {
        return <div className="flex-1 min-h-0 min-w-0 bg-[#f4f6f8]" />;
    }

    return (
        <div className="flex-1 min-h-0 min-w-0 flex flex-col">
            {children}
        </div>
    );
}
