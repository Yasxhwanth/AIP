import React, { useEffect, useState } from 'react';
import { ShieldCheck, Info, LucideIcon, Database, ArrowRight } from 'lucide-react';

interface ProvenanceRecord {
    id: string;
    attributeName: string | null;
    sourceSystem: string;
    sourceRecordId: string;
    sourceTimestamp: string;
    ingestedAt: string;
}

/**
 * EvidencePane displays the "Why do we know this?" metadata for an entity.
 */
export const EvidencePane: React.FC<{
    instanceId: string;
    logicalId: string;
    confidence: number;
    status: string;
    onClose: () => void;
}> = ({ instanceId, logicalId, confidence, status, onClose }) => {
    const [provenance, setProvenance] = useState<ProvenanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProvenance = async () => {
            setLoading(true);
            try {
                const resp = await fetch(`/api/v1/ontology/instances/${instanceId}/provenance`);
                const data = await resp.json();
                setProvenance(data);
            } catch (e) {
                console.error('Failed to load provenance', e);
            } finally {
                setLoading(false);
            }
        };
        loadProvenance();
    }, [instanceId]);

    return (
        <div className="fixed right-4 bottom-4 w-96 max-h-[70vh] flex flex-col bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden z-[1000] text-white animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <h2 className="font-bold text-sm uppercase tracking-tighter">Evidence Pane</h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">&times;</button>
            </div>

            {/* Overview */}
            <div className="p-4 grid grid-cols-2 gap-4 border-b border-white/5 bg-black/20">
                <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Logical ID</label>
                    <code className="text-[10px] font-mono bg-white/10 px-1 rounded">{logicalId}</code>
                </div>
                <div>
                    <label className="text-[10px] uppercase opacity-50 block mb-1">Confidence</label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${confidence > 0.8 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                style={{ width: `${confidence * 100}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-mono">{(confidence * 100).toFixed(0)}%</span>
                    </div>
                </div>
            </div>

            {/* Provenance List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <h3 className="text-xs font-bold flex items-center gap-2 opacity-80">
                    <Database className="w-4 h-4" />
                    Data Lineage
                </h3>
                {loading ? (
                    <div className="animate-pulse space-y-2">
                        <div className="h-10 bg-white/5 rounded" />
                        <div className="h-10 bg-white/5 rounded" />
                    </div>
                ) : provenance.length === 0 ? (
                    <p className="text-[10px] opacity-40 italic">No provenance records found for this instance.</p>
                ) : (
                    <div className="space-y-3">
                        {provenance.map(rec => (
                            <div key={rec.id} className="p-3 bg-white/5 rounded border border-white/5 relative group hover:border-white/20 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold text-cyan-300">{rec.sourceSystem}</span>
                                    <span className="text-[9px] opacity-40 font-mono">{new Date(rec.sourceTimestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] opacity-70">
                                    <span className="opacity-40">Record ID:</span>
                                    <span className="font-mono">{rec.sourceRecordId}</span>
                                </div>
                                {rec.attributeName && (
                                    <div className="mt-2 text-[10px] bg-cyan-900/40 text-cyan-100 px-2 py-0.5 rounded-sm inline-block">
                                        Field: {rec.attributeName}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Human-in-the-loop Action */}
            <div className="p-3 border-t border-white/10 bg-white/5 flex gap-2">
                <button className="flex-1 py-2 rounded bg-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/30 transition-all border border-green-500/30">
                    Approve Match
                </button>
                <button className="flex-1 py-2 rounded bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-all border border-red-500/30">
                    Reject
                </button>
            </div>
        </div>
    );
};
