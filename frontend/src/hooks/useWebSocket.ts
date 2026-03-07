/**
 * useWebSocket — React hook for real-time AIP Ontology updates (Phase 12)
 *
 * Usage:
 *   const { lastEvent, connected } = useWebSocket(['entities:Drone', 'metrics:*']);
 *
 * Events pushed by the backend:
 *   { type: 'entity.change', changeType: 'created'|'updated'|'deleted', objectType, logicalId, data, ts }
 *   { type: 'metric.threshold_breached', metricId, metricName, value, threshold, ts }
 *   { type: 'action.executed', actionName, logicalId, executionId, status, ts }
 *   { type: 'connected', clientId, ts }
 */

"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001");

export interface WSEvent {
    type: string;
    [key: string]: any;
}

export interface UseWebSocketOptions {
    /** Called whenever a matching event arrives */
    onEvent?: (event: WSEvent) => void;
    /** Reconnect delay in ms (default 3000) */
    reconnectDelay?: number;
    /** Whether to auto-connect (default true) */
    enabled?: boolean;
}

export function useWebSocket(
    topics: string[] = ["events:*"],
    options: UseWebSocketOptions = {}
) {
    const { onEvent, reconnectDelay = 3000, enabled = true } = options;
    const [connected, setConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState<WSEvent | null>(null);
    const [clientId, setClientId] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const topicsRef = useRef<string[]>(topics);
    topicsRef.current = topics;

    const connect = useCallback(() => {
        if (!enabled || typeof window === "undefined") return;
        try {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                setConnected(true);
                // Subscribe to requested topics
                ws.send(JSON.stringify({ subscribe: topicsRef.current }));
            };

            ws.onmessage = (ev) => {
                try {
                    const event: WSEvent = JSON.parse(ev.data);
                    if (event.type === "connected") {
                        setClientId(event.clientId);
                        return;
                    }
                    setLastEvent(event);
                    onEvent?.(event);
                } catch { /* ignore */ }
            };

            ws.onclose = () => {
                setConnected(false);
                wsRef.current = null;
                if (enabled) {
                    reconnectRef.current = setTimeout(connect, reconnectDelay);
                }
            };

            ws.onerror = () => {
                ws.close();
            };
        } catch { /* ignore non-browser envs */ }
    }, [enabled, onEvent, reconnectDelay]);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectRef.current) clearTimeout(reconnectRef.current);
            wsRef.current?.close();
        };
    }, [connect]);

    /** Manually send a message to the backend */
    const send = useCallback((msg: object) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
        }
    }, []);

    /** Update topic subscriptions on the fly */
    const subscribe = useCallback((newTopics: string[]) => {
        send({ subscribe: newTopics });
    }, [send]);

    const unsubscribe = useCallback((unsubTopics: string[]) => {
        send({ unsubscribe: unsubTopics });
    }, [send]);

    return { connected, lastEvent, clientId, send, subscribe, unsubscribe };
}

/** Convenience: subscribe to a single entity type and get live rows  */
export function useLiveEntities(objectType: string) {
    const [entities, setEntities] = useState<Record<string, any>>({});
    const [lastUpdate, setLastUpdate] = useState<number | null>(null);

    const { connected, lastEvent } = useWebSocket(
        [`entities:${objectType}`],
        {
            onEvent: (ev) => {
                if (ev.type !== "entity.change" || ev.objectType !== objectType) return;
                setEntities((prev) => {
                    if (ev.changeType === "deleted") {
                        const next = { ...prev };
                        delete next[ev.logicalId];
                        return next;
                    }
                    return { ...prev, [ev.logicalId]: { ...ev.data, id: ev.logicalId } };
                });
                setLastUpdate(ev.ts);
            },
        }
    );

    return {
        entities: Object.values(entities),
        entityMap: entities,
        count: Object.keys(entities).length,
        connected,
        lastUpdate,
    };
}
