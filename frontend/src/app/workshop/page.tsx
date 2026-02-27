"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X, ExternalLink, Clock, Database, Loader2 } from "lucide-react";
import { ApiClient } from "@/lib/apiClient";
import { useWorkspaceStore } from "@/store/workspace";

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
            className="group cursor-pointer rounded-xl border px-4 py-3 transition-all hover:border-cyan-500/30"
            style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                            {result.entityTypeName}
                        </span>
                        <span className="font-mono text-sm text-cyan-300 font-bold truncate">
                            {highlight(result.logicalId, query)}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        {previewEntries.map(([k, v]) => (
                            <div key={k} className="flex items-center gap-1.5 text-xs">
                                <span className="text-slate-500 shrink-0">{k}:</span>
                                <span className="text-slate-300 truncate">{highlight(String(v ?? ""), query)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(result.updatedAt).toLocaleDateString()}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
            </div>
        </div>
    );
}

function DetailPanel({ result, query, onClose }: { result: SearchResult; query: string; onClose: () => void }) {
    return (
        <div className="w-96 shrink-0 border-l flex flex-col" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{result.entityTypeName}</p>
                    <p className="font-mono text-sm text-cyan-300 font-bold truncate">{result.logicalId}</p>
                </div>
                <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">All Attributes</p>
                {Object.entries(result.data).map(([k, v]) => (
                    <div key={k} className="rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(255,255,255,0.03)" }}>
                        <div className="text-slate-400 text-[10px] font-semibold mb-0.5">{k}</div>
                        <div className="text-slate-200 font-mono break-all">{String(v ?? "—")}</div>
                    </div>
                ))}
                <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="text-slate-400 text-[10px] font-semibold mb-0.5">Last Updated</div>
                    <div className="text-slate-200 font-mono">{new Date(result.updatedAt).toLocaleString()}</div>
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
        <div className="h-full w-full flex flex-col" style={{ background: "linear-gradient(180deg,#070b14 0%,#050910 100%)" }}>
            {/* Search bar header */}
            <div className="shrink-0 px-8 pt-10 pb-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <Search className="w-6 h-6 text-cyan-400" /> Workshop
                    </h1>
                    <p className="text-slate-400 text-sm mb-6">Search across all entity instances in this workspace.</p>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input
                            ref={inputRef}
                            autoFocus
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search by logicalId, name, or any attribute value…"
                            className="w-full pl-12 pr-12 py-4 rounded-2xl text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all text-sm"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                        />
                        {query && (
                            <button
                                onClick={() => { setQuery(""); setResults([]); setSearched(false); inputRef.current?.focus(); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {results.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2">{results.length} result{results.length !== 1 ? "s" : ""} found</p>
                    )}
                </div>
            </div>

            {/* Results + detail panel */}
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    <div className="max-w-3xl mx-auto space-y-2">
                        {loading && (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                            </div>
                        )}
                        {!loading && searched && results.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <Database className="w-10 h-10 text-slate-600" />
                                <p className="text-slate-400">No results for "<span className="text-white">{query}</span>"</p>
                                <p className="text-slate-500 text-sm">Try a different keyword, or check that data has been ingested.</p>
                            </div>
                        )}
                        {!loading && !searched && (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                                <Search className="w-12 h-12 text-slate-600" />
                                <p className="text-slate-400">Start typing to search across all ontology data</p>
                            </div>
                        )}
                        {!loading && results.map(r => (
                            <ResultCard
                                key={r.logicalId}
                                result={r}
                                query={query}
                                onSelect={() => setSelected(r.logicalId === selected?.logicalId ? null : r)}
                            />
                        ))}
                    </div>
                </div>

                {selected && (
                    <DetailPanel result={selected} query={query} onClose={() => setSelected(null)} />
                )}
            </div>
        </div>
    );
}
