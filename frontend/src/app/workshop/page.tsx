"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ExternalLink, Clock, Database, Globe, Loader2 } from "lucide-react";
import { ApiClient } from "@/lib/apiClient";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { LineageGraphView } from "@/components/LineageGraphView";

interface SearchResult {
    logicalId: string;
    entityTypeId: string;
    entityTypeName: string;
    updatedAt: string;
    data: Record<string, unknown>;
}

function highlight(text: string, query: string) {
    if (!query || !text) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-cyan-400/20 text-cyan-300 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
            {text.slice(idx + query.length)}
        </>
    );
}

function ResultCard({ result, query, onSelect }: { result: SearchResult; query: string; onSelect: () => void }) {
    const previewEntries = Object.entries(result.data).slice(0, 4);
    return (
        <div
            onClick={onSelect}
            className="group cursor-pointer bg-pt-bg-panel/20 border border-pt-border p-4 transition-all hover:bg-pt-bg-panel/40 hover:border-pt-intent-primary/30"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-pt-intent-primary/10 text-pt-intent-primary border border-pt-intent-primary/20">
                            {result.entityTypeName}
                        </span>
                        <span className="font-mono text-[13px] text-pt-text font-bold truncate">
                            {highlight(result.logicalId, query)}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {previewEntries.map(([k, v]) => (
                            <div key={k} className="flex items-center gap-2 text-[11px]">
                                <span className="text-pt-text-muted font-bold tracking-tight shrink-0 uppercase text-[9px]">{k}:</span>
                                <span className="text-pt-text truncate">{highlight(String(v ?? ""), query)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-pt-text-muted uppercase tracking-widest">
                        <Clock size={10} />
                        {new Date(result.updatedAt).toLocaleDateString()}
                    </div>
                    <ExternalLink size={14} className="text-pt-text-muted group-hover:text-pt-intent-primary transition-colors" />
                </div>
            </div>
        </div>
    );
}

function DetailPanel({ result, query, onClose }: { result: SearchResult; query: string; onClose: () => void }) {
    const router = useRouter();
    return (
        <div className="w-[450px] shrink-0 border-l border-pt-border bg-pt-bg flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-pt-border bg-pt-bg-panel/40 backdrop-blur-md">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-pt-intent-primary mb-1">{result.entityTypeName}</p>
                    <p className="font-mono text-sm text-pt-text font-bold truncate">{result.logicalId}</p>
                </div>
                <button onClick={onClose} className="p-2 text-pt-text-muted hover:text-pt-text transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-pt-text-muted mb-4 pb-1 border-b border-pt-border/30">Object Attributes</p>
                    <div className="space-y-2">
                        {Object.entries(result.data).map(([k, v]) => (
                            <div key={k} className="bg-pt-bg-panel/20 border border-pt-border/50 px-4 py-2 hover:bg-pt-bg-panel/40 transition-colors">
                                <div className="text-pt-text-muted text-[9px] font-bold uppercase tracking-widest mb-1">{k}</div>
                                <div className="text-pt-text font-mono text-xs break-all">{String(v ?? "—")}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => router.push(`/geo?entityId=${result.logicalId}`)}
                        className="w-full flex items-center justify-center gap-2 bg-pt-intent-primary hover:bg-pt-intent-primary-hover text-white py-3 font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                    >
                        <Globe size={14} />
                        View in Battlefield Map
                    </button>
                </div>

                <div className="pt-4">
                    <p className="text-[9px] font-black uppercase tracking-widest text-pt-text-muted mb-4 pb-1 border-b border-pt-border/30">Lineage Trace</p>
                    <div className="bg-pt-bg-panel/20 border border-pt-border p-4 rounded min-h-[200px]">
                        <LineageGraphView
                            targetType="EntityInstance"
                            targetId={result.logicalId}
                            logicalId={result.logicalId}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function WorkshopPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<SearchResult | null>(null);
    const [searched, setSearched] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const doSearch = useCallback(async (q: string) => {
        if (q.length < 2) { setResults([]); setSearched(false); return; }
        setLoading(true);
        setSearched(true);
        try {
            const data = await ApiClient.get<SearchResult[]>("/api/v1/search", { q });
            setResults(data);
        } catch (e) {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(query), 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query, doSearch]);

    return (
        <div className="h-full w-full flex flex-col bg-pt-bg">
            {/* Search Sub-Header */}
            <div className="shrink-0 px-8 py-10 border-b border-pt-border/30 bg-pt-bg-panel/10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center space-x-3 mb-2">
                        <Search className="text-pt-intent-primary" size={24} />
                        <h1 className="text-xl font-bold uppercase tracking-[0.3em] text-pt-text">Workshop</h1>
                    </div>
                    <p className="text-pt-text-muted text-[11px] font-medium uppercase tracking-widest mb-8 opacity-60">Strategic Intelligence Index Search</p>

                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-pt-text-muted group-focus-within:text-pt-intent-primary transition-colors" />
                        <input
                            ref={inputRef}
                            autoFocus
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="INPUT QUERY (LOGICAL ID, ATTRIBUTE, OR METADATA)..."
                            className="w-full pl-14 pr-14 py-5 bg-pt-bg-panel border border-pt-border text-pt-text placeholder-pt-text-muted/40 outline-none focus:border-pt-intent-primary focus:ring-1 focus:ring-pt-intent-primary/20 transition-all text-[13px] font-mono tracking-wider shadow-2xl"
                        />
                        {query && (
                            <button
                                onClick={() => { setQuery(""); setResults([]); setSearched(false); inputRef.current?.focus(); }}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-pt-text-muted hover:text-pt-text transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                    {results.length > 0 && (
                        <div className="mt-3 flex items-center space-x-2">
                            <div className="h-1 w-1 bg-pt-intent-primary rounded-full animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pt-intent-primary">{results.length} VECTORS IDENTIFIED</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Canvas */}
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto px-8 py-8 no-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-2">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 size={32} className="text-pt-intent-primary animate-spin opacity-40" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-pt-text-muted">Analyzing Index...</span>
                            </div>
                        )}
                        {!loading && searched && results.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                                <Database size={48} className="text-pt-text-muted" />
                                <div className="text-center">
                                    <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-pt-text">Zero matches found</p>
                                    <p className="text-[10px] text-pt-text-muted mt-1 uppercase tracking-widest font-medium">Verify logical pointer or ingestion status</p>
                                </div>
                            </div>
                        )}
                        {!loading && !searched && (
                            <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-20">
                                <div className="p-8 border-2 border-dashed border-pt-border rounded-full">
                                    <Search size={64} className="text-pt-text-muted" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[14px] font-black uppercase tracking-[0.4em] text-pt-text">Ready for Search</p>
                                    <p className="text-[10px] text-pt-text-muted mt-2 uppercase tracking-widest font-medium">Global Tactical Ontology Index</p>
                                </div>
                            </div>
                        )}
                        {!loading && results.map(r => (
                            <ResultCard
                                key={r.logicalId}
                                result={r}
                                query={query}
                                onSelect={() => setSelected(selected?.logicalId === r.logicalId ? null : r)}
                            />
                        ))}
                    </div>
                </main>

                {selected && (
                    <DetailPanel result={selected} query={query} onClose={() => setSelected(null)} />
                )}
            </div>
        </div>
    );
}
