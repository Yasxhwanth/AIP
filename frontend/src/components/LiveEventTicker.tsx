"use client";
/**
 * LiveEventTicker — Phase 12 real-time WebSocket event feed component.
 *
 * Subscribes to events:* by default (all events), displays a scrolling
 * ticker of entity changes, metric alerts, and action executions.
 *
 * Usage:
 *   <LiveEventTicker topics={["entities:Drone", "metrics:*"]} maxItems={10} />
 */

import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Activity, Zap, Bell, Database, X } from "lucide-react";

interface EventItem {
    id: string;
    type: string;
    label: string;
    detail: string;
    ts: number;
    color: string;
}

interface LiveEventTickerProps {
    topics?: string[];
    maxItems?: number;
    compact?: boolean;
}

function getEventConfig(ev: any): { label: string; detail: string; color: string } {
    switch (ev.type) {
        case "entity.change":
            return {
                label: `${ev.objectType} ${ev.changeType}`,
                detail: `ID: ${ev.logicalId}`,
                color: ev.changeType === "created" ? "#0D8050" : ev.changeType === "deleted" ? "#C23030" : "#137CBD",
            };
        case "metric.threshold_breached":
            return {
                label: `⚠ ${ev.metricName}`,
                detail: `${ev.value.toFixed(2)} > threshold ${ev.threshold}`,
                color: "#C23030",
            };
        case "action.executed":
            return {
                label: `Action: ${ev.actionName}`,
                detail: `Entity ${ev.logicalId} — ${ev.status}`,
                color: "#7157D9",
            };
        default:
            return { label: ev.type, detail: JSON.stringify(ev).slice(0, 60), color: "#5C7080" };
    }
}

const typeIcon = (type: string) => {
    if (type.startsWith("entity")) return <Database style={{ width: 11, height: 11 }} />;
    if (type.startsWith("metric")) return <Bell style={{ width: 11, height: 11 }} />;
    if (type.startsWith("action")) return <Zap style={{ width: 11, height: 11 }} />;
    return <Activity style={{ width: 11, height: 11 }} />;
};

export function LiveEventTicker({
    topics = ["events:*"],
    maxItems = 20,
    compact = false,
}: LiveEventTickerProps) {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const listRef = useRef<HTMLDivElement>(null);

    const { connected } = useWebSocket(topics, {
        onEvent: (ev) => {
            if (ev.type === "connected" || ev.type === "subscribed") return;
            const { label, detail, color } = getEventConfig(ev);
            const item: EventItem = {
                id: `${ev.ts}-${Math.random()}`,
                type: ev.type,
                label,
                detail,
                ts: ev.ts,
                color,
            };
            setEvents((prev) => [item, ...prev].slice(0, maxItems));
        },
    });

    // Auto-scroll to top on new event
    useEffect(() => {
        listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, [events.length]);

    if (compact) {
        return (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: connected ? "#0D8050" : "#C23030",
                    boxShadow: connected ? "0 0 6px #0D8050" : "none",
                    animation: connected && events.length > 0 ? "pulse 1s ease" : "none",
                }} />
                <span style={{ fontSize: 11, color: "#5C7080" }}>
                    {connected ? "LIVE" : "Connecting..."} {events.length > 0 && `· ${events[0].label}`}
                </span>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0E1117", borderRadius: 4, overflow: "hidden", fontFamily: "Inter, monospace" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "#161820", borderBottom: "1px solid #2D2F3E" }}>
                <div style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: connected ? "#0D8050" : "#C23030",
                    boxShadow: connected ? "0 0 6px #0D8050" : "none",
                }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#8A9BA8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {connected ? "Live Event Stream" : "Connecting..."}
                </span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 10, color: "#4A5568" }}>{events.length} events</span>
            </div>

            {/* Events */}
            <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
                {events.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#4A5568", gap: 6 }}>
                        <Activity style={{ width: 20, height: 20, opacity: 0.4 }} />
                        <span style={{ fontSize: 11 }}>Waiting for live events...</span>
                    </div>
                ) : (
                    events.filter(e => !dismissed.has(e.id)).map((ev, i) => (
                        <div key={ev.id} style={{
                            display: "flex", gap: 8, padding: "5px 10px", borderBottom: "1px solid #14161F",
                            background: i === 0 ? "rgba(99,102,241,0.06)" : "transparent",
                            animation: i === 0 ? "slideIn 0.2s ease" : "none",
                            alignItems: "flex-start",
                        }}>
                            <div style={{ color: ev.color, flexShrink: 0, marginTop: 2 }}>{typeIcon(ev.type)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: ev.color, lineHeight: 1.3 }}>{ev.label}</div>
                                <div style={{ fontSize: 10, color: "#4A5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.detail}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                                <span style={{ fontSize: 9, color: "#4A5568" }}>{new Date(ev.ts).toLocaleTimeString()}</span>
                                <button onClick={() => setDismissed(p => new Set([...p, ev.id]))} style={{
                                    background: "none", border: "none", cursor: "pointer", color: "#4A5568", padding: 0, display: "flex"
                                }}>
                                    <X style={{ width: 10, height: 10 }} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>
        </div>
    );
}
