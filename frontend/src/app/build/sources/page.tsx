"use client";

import { useState, useEffect } from "react";
import { Plus, Database, Globe, FileText, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { ApiClient } from "@/lib/apiClient";
import { useWorkspaceStore } from "@/store/workspace";

type DataSourceClass = "REST_API" | "POSTGRES" | "CSV";

interface DataSource {
    id: string;
    name: string;
    type: DataSourceClass;
    enabled: boolean;
    createdAt: string;
    connectionConfig: any;
}

export default function DataSourcesPage() {
    const { activeProjectId } = useWorkspaceStore();
    const [sources, setSources] = useState<DataSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<DataSourceClass>("REST_API");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newUrl, setNewUrl] = useState("");

    // Testing state
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<'SUCCESS' | 'ERROR' | null>(null);
    const [testMessage, setTestMessage] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!activeProjectId) return;
        loadSources();
    }, [activeProjectId]);

    const loadSources = async () => {
        try {
            const data = await ApiClient.get<DataSource[]>("/api/data/sources");
            setSources(data);
        } catch (e) {
            console.error("Failed to load sources", e);
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        if (!newUrl) return;
        setIsTesting(true);
        setTestResult(null);
        try {
            const res = await ApiClient.post<{ success: boolean; message: string }>("/api/data/sources/test", {
                type: selectedType,
                connectionConfig: { url: newUrl }
            });
            setTestResult(res.success ? 'SUCCESS' : 'ERROR');
            setTestMessage(res.message);
        } catch (e: any) {
            setTestResult('ERROR');
            setTestMessage(e.message || "Connection failed");
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveConnection = async () => {
        if (!newName || !newUrl) return;
        setIsSaving(true);
        try {
            await ApiClient.post("/api/data/sources", {
                name: newName.replace(/\s+/g, '_'),
                type: selectedType,
                connectionConfig: { url: newUrl, method: 'GET' }
            });
            await loadSources();
            setIsModalOpen(false);
            setNewName("");
            setNewUrl("");
            setTestResult(null);
        } catch (e) {
            console.error(e);
            alert("Failed to save connection.");
        } finally {
            setIsSaving(false);
        }
    };

    const getIconForType = (type: string, active?: boolean) => {
        const colorClass = active ? "text-[#137CBD]" : "text-[#5C7080]";
        switch (type) {
            case 'REST_API': return <Globe className={`w-4 h-4 ${colorClass}`} />;
            case 'POSTGRES': return <Database className={`w-4 h-4 ${colorClass}`} />;
            case 'CSV': return <FileText className={`w-4 h-4 ${colorClass}`} />;
            default: return <Database className={`w-4 h-4 ${colorClass}`} />;
        }
    };

    if (loading) return <div className="h-full w-full bg-[#F5F8FA] text-[#182026] font-[Inter,sans-serif] p-8">Loading sources...</div>;

    return (
        <div className="flex h-screen w-full bg-[#182026] text-white font-[Inter,sans-serif] overflow-hidden">
            {/* ── LEFT NAV (App Chrome) ── */}
            <div className="w-14 bg-[#10161A] border-r border-[#293742] flex flex-col items-center py-3 shrink-0 z-20">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold mb-6">AIP</div>
                <button className="w-10 h-10 flex flex-col items-center justify-center text-[#137CBD] group relative">
                    <Database className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-bold">Conn</span>
                </button>
            </div>

            <div className="flex-1 flex bg-[#F5F8FA] text-[#182026]">
                {/* ── SECONDARY SIDEBAR (Connectors) ── */}
                <div className="w-64 bg-white border-r border-[#CED9E0] flex flex-col shrink-0">
                    <div className="p-3 border-b border-[#CED9E0] bg-[#F5F8FA] text-[11px] font-bold text-[#5C7080] uppercase tracking-wider">
                        Connectors
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        <div
                            onClick={() => setSelectedType("REST_API")}
                            className={`px-3 py-2.5 rounded cursor-pointer text-[12px] font-bold transition-colors flex items-center gap-3 ${selectedType === "REST_API" ? 'bg-[#EBF1F5] text-[#137CBD]' : 'hover:bg-[#F5F8FA] text-[#5C7080]'}`}
                        >
                            {getIconForType("REST_API", selectedType === "REST_API")} REST API
                        </div>
                        <div
                            onClick={() => setSelectedType("POSTGRES")}
                            className={`px-3 py-2.5 rounded cursor-pointer text-[12px] font-bold transition-colors flex items-center gap-3 ${selectedType === "POSTGRES" ? 'bg-[#EBF1F5] text-[#137CBD]' : 'hover:bg-[#F5F8FA] text-[#5C7080]'}`}
                        >
                            {getIconForType("POSTGRES", selectedType === "POSTGRES")} PostgreSQL
                        </div>
                        <div
                            onClick={() => setSelectedType("CSV")}
                            className={`px-3 py-2.5 rounded cursor-pointer text-[12px] font-bold transition-colors flex items-center gap-3 ${selectedType === "CSV" ? 'bg-[#EBF1F5] text-[#137CBD]' : 'hover:bg-[#F5F8FA] text-[#5C7080]'}`}
                        >
                            {getIconForType("CSV", selectedType === "CSV")} CSV File
                        </div>
                    </div>
                </div>

                {/* ── MAIN STAGE (Active Connections) ── */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="h-12 bg-white border-b border-[#CED9E0] flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            {getIconForType(selectedType, false)}
                            <h1 className="text-[14px] font-bold">{selectedType.replace('_', ' ')} Connections</h1>
                        </div>
                        <button
                            onClick={() => {
                                setNewName("");
                                setNewUrl("");
                                setTestResult(null);
                                setIsModalOpen(true);
                            }}
                            className="h-7 px-3 bg-[#137CBD] hover:bg-[#0E6694] text-white text-[11px] font-bold rounded shadow-sm transition-colors flex items-center gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" /> New Connection
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-10">
                        <div className="max-w-4xl mx-auto space-y-3">
                            {sources.filter(s => s.type === selectedType).map(source => (
                                <div key={source.id} className="bg-white border border-[#CED9E0] rounded shadow-sm p-4 hover:border-[#9FB3BE] transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded bg-[#F5F8FA] border border-[#CED9E0] flex items-center justify-center">
                                            {getIconForType(source.type, false)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[14px] text-[#182026] mb-1">{source.name}</h3>
                                            <div className="flex items-center gap-2 text-[11px] text-[#5C7080]">
                                                <span className="flex items-center gap-1.5 font-bold">
                                                    <div className={`w-2 h-2 rounded-full ${source.enabled ? 'bg-[#0F9960]' : 'bg-[#5C7080]'}`} />
                                                    {source.enabled ? 'Active' : 'Disabled'}
                                                </span>
                                                <span>•</span>
                                                <span className="font-mono bg-[#EBF1F5] px-1 rounded truncate max-w-[300px]">
                                                    {source.connectionConfig?.url || 'No URL configured'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="opacity-0 group-hover:opacity-100 px-3 py-1.5 text-[11px] font-bold text-[#5C7080] border border-[#CED9E0] hover:bg-[#F5F8FA] rounded transition-all">
                                        Configure
                                    </button>
                                </div>
                            ))}

                            {sources.filter(s => s.type === selectedType).length === 0 && (
                                <div className="py-20 flex flex-col items-center justify-center text-[#5C7080] border-2 border-dashed border-[#CED9E0] rounded-lg bg-white">
                                    <div className="w-12 h-12 rounded-full bg-[#F5F8FA] flex items-center justify-center mb-4">
                                        {getIconForType(selectedType, false)}
                                    </div>
                                    <p className="text-[13px] font-bold text-[#182026]">No {selectedType.replace('_', ' ')} connections found.</p>
                                    <p className="text-[11px] mt-1">Click "New Connection" to securely link an external system.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── NEW CONNECTION MODAL ── */}
                {isModalOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#10161A]/60 backdrop-blur-sm">
                        <div className="bg-white border border-[#CED9E0] w-full max-w-[450px] rounded shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                            <div className="h-12 border-b border-[#CED9E0] bg-[#F5F8FA] flex items-center justify-between px-4">
                                <h2 className="text-[13px] font-bold flex items-center gap-2 text-[#182026]">
                                    {getIconForType(selectedType, false)} Configure {selectedType.replace('_', ' ')}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-[#5C7080] hover:text-[#182026] transition-colors"><XCircle className="w-4 h-4" /></button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#5C7080] uppercase tracking-wider mb-1.5">Connection Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        placeholder="e.g. Production_Users_API"
                                        className="w-full text-[12px] font-mono p-2 border border-[#CED9E0] rounded focus:outline-none focus:border-[#137CBD] focus:ring-1 focus:ring-[#137CBD]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-[#5C7080] uppercase tracking-wider mb-1.5">Endpoint URL</label>
                                    <input
                                        type="text"
                                        value={newUrl}
                                        onChange={e => setNewUrl(e.target.value)}
                                        placeholder="https://api.example.com/v1/data"
                                        className="w-full text-[12px] font-mono p-2 border border-[#CED9E0] rounded focus:outline-none focus:border-[#137CBD] focus:ring-1 focus:ring-[#137CBD]"
                                    />
                                </div>

                                {/* Test Results Area */}
                                {testResult && (
                                    <div className={`p-3 rounded border text-[12px] flex flex-col gap-1 ${testResult === 'SUCCESS' ? 'bg-[#ECFDF5] border-[#0F9960]/30 text-[#0F9960]' : 'bg-[#FEF0F0] border-[#DB3737]/30 text-[#DB3737]'}`}>
                                        <div className="flex items-center gap-2 font-bold">
                                            {testResult === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            {testResult === 'SUCCESS' ? 'Connection Successful' : 'Connection Failed'}
                                        </div>
                                        <div className="text-[11px] font-mono break-all ml-6 opacity-90">{testMessage}</div>
                                    </div>
                                )}
                            </div>

                            <div className="px-5 py-3 border-t border-[#CED9E0] bg-[#F5F8FA] flex items-center justify-between">
                                <button
                                    onClick={handleTestConnection}
                                    disabled={isTesting || !newUrl}
                                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#5C7080] hover:text-[#182026] px-3 py-1.5 rounded transition-colors disabled:opacity-50 border border-transparent hover:border-[#CED9E0] hover:bg-white"
                                >
                                    {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                                    Test Connection
                                </button>
                                <button
                                    onClick={handleSaveConnection}
                                    disabled={isSaving || !newName || !newUrl || testResult !== 'SUCCESS'}
                                    className="flex items-center gap-1.5 h-7 px-4 bg-[#137CBD] hover:bg-[#0E6694] text-white text-[11px] font-bold rounded shadow-sm transition-colors disabled:opacity-50 disabled:bg-[#CED9E0]"
                                >
                                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"} <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
