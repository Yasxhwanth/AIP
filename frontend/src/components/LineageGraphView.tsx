import React, { useEffect, useState } from 'react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { ApiClient } from '@/lib/apiClient';
import { Loader2, Database, Box } from 'lucide-react';

interface LineageEdge {
    sourceType: string;
    sourceId: string;
    targetType: string;
    targetId: string;
    transformation: string | null;
}

export function LineageGraphView({ targetType, targetId, logicalId }: { targetType: string; targetId: string; logicalId?: string }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadLineage() {
            try {
                setLoading(true);
                const trace = await ApiClient.get<LineageEdge[]>(`/api/v1/lineage/${targetType}/${targetId}/trace`);

                const newNodes: any[] = [];
                const newEdges: any[] = [];
                const addedNodes = new Set<string>();

                // Custom Node Types mapping
                const getNodeStyle = (type: string) => {
                    if (type === 'DataSource') return { background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.4)', color: '#bae6fd' };
                    if (type === 'EntityType') return { background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#c7d2fe' };
                    return { background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#f8fafc' };
                };

                const addNode = (type: string, id: string, label?: string) => {
                    const key = `${type}:${id}`;
                    if (!addedNodes.has(key)) {
                        newNodes.push({
                            id: key,
                            data: { label: label || `${type} (${id.slice(0, 8)})` },
                            position: { x: addedNodes.size * 250, y: Math.random() * 200 }, // Basic layout for now
                            style: getNodeStyle(type),
                            className: 'rounded-lg shadow-lg px-4 py-3 text-sm font-semibold tracking-wide font-mono',
                        });
                        addedNodes.add(key);
                    }
                };

                // Always add the root target
                addNode(targetType, targetId, logicalId ? `${targetType} (${logicalId})` : undefined);

                trace.forEach((edge, i) => {
                    addNode(edge.sourceType, edge.sourceId);
                    addNode(edge.targetType, edge.targetId);

                    newEdges.push({
                        id: `edge-${i}`,
                        source: `${edge.sourceType}:${edge.sourceId}`,
                        target: `${edge.targetType}:${edge.targetId}`,
                        label: edge.transformation?.slice(0, 20) || 'derived',
                        animated: true,
                        style: { stroke: '#94a3b8', strokeWidth: 2 },
                        labelStyle: { fill: '#cbd5e1', fontWeight: 500, fontSize: 10 },
                        labelBgStyle: { fill: '#0f172a', color: '#fff', fillOpacity: 0.8 },
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
                    });
                });

                // Simple horizontal layout approximation
                newNodes.forEach((n, idx) => {
                    n.position = { x: (idx % 3) * 300, y: Math.floor(idx / 3) * 150 };
                });

                setNodes(newNodes);
                setEdges(newEdges);
            } catch (err) {
                console.error('Failed to load lineage trace', err);
            } finally {
                setLoading(false);
            }
        }
        loadLineage();
    }, [targetType, targetId, logicalId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
        );
    }

    if (nodes.length <= 1) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3 border border-slate-800 rounded-xl bg-slate-900/20">
                <Box className="w-8 h-8 opacity-50" />
                <p className="text-sm">No upstream lineage data available.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[400px] border rounded-xl overflow-hidden bg-slate-950/50" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Background color="#334155" gap={24} />
                <Controls className="bg-slate-900 border-slate-800 fill-slate-400" />
            </ReactFlow>
        </div>
    );
}
