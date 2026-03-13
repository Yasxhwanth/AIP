"use client";

import { useEffect } from "react";
import { useWorkspaceHealth } from "@/store/workspace-health";
import { useCapabilities } from "@/store/capabilities";

export function HealthProvider({ children }: { children: React.ReactNode }) {
    const startPolling = useWorkspaceHealth((state) => state.startPolling);
    const stopPolling = useWorkspaceHealth((state) => state.stopPolling);
    const fetchCapabilities = useCapabilities((state) => state.fetchCapabilities);

    useEffect(() => {
        fetchCapabilities();
        startPolling();
        return () => stopPolling();
    }, [startPolling, stopPolling, fetchCapabilities]);

    return <>{children}</>;
}
