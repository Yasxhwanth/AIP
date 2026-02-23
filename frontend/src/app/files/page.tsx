"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Folder,
    FileText,
    Star,
    LayoutTemplate,
    Clock,
    BookOpen,
    Info,
    Trash2,
    Activity,
    Network,
    Plus,
    Search,
    ChevronRight,
    MoreHorizontal,
    RefreshCw,
    Link as LinkIcon,
    UploadCloud,
    Database,
    Lock,
    Share2,
    FileSpreadsheet,
    Loader2,
    FileUp,
    CheckCircle2,
    TerminalSquare,
    BarChart3
} from "lucide-react";
import { ApiClient } from "@/lib/apiClient";
import Papa from "papaparse";


export default function FilesAndProjects() {
    const [viewData, setViewData] = useState(false);
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const [isMapping, setIsMapping] = useState(false);
    const [activeFile, setActiveFile] = useState<any>(null);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [files, setFiles] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const headers = results.meta.fields || [];
                setCsvHeaders(headers);
                setCsvData(results.data);

                const newFile = {
                    id: Date.now(),
                    name: file.name,
                    type: 'dataset',
                    updated: new Date().toLocaleString(),
                    active: true,
                    rows: results.data.length
                };

                setFiles(prev => {
                    // Reset 'active' on others and prepend new file
                    const stripped = prev.map(f => ({ ...f, active: false }));
                    return [newFile, ...stripped];
                });
                setActiveFile(newFile);
                setViewData(true);
                setShowUploadMenu(false);
            },
            error: (error) => {
                alert(`Error parsing CSV: ${error.message}`);
            }
        });
    };

    if (viewData && activeFile) {
        if (isMapping) {
            return <SchemaMappingWizard
                fileName={activeFile.name}
                csvHeaders={csvHeaders}
                csvData={csvData}
                onBack={() => setIsMapping(false)}
                onComplete={() => { setIsMapping(false); setViewData(false); setActiveFile(null); }}
            />;
        }
        return <DataPreviewView
            fileName={activeFile.name}
            headers={csvHeaders}
            data={csvData.slice(0, 100)} // Preview first 100
            totalRows={csvData.length}
            onBack={() => { setViewData(false); setActiveFile(null); }}
            onMap={() => setIsMapping(true)}
        />;
    }

    return (
        <div className="h-full w-full flex bg-white text-slate-900 border-t border-slate-200 overflow-hidden font-sans">

            {/* Contextual Sidebar (Left) */}
            <div className="w-[280px] bg-[#fcfcfc] border-r border-slate-200 flex flex-col shrink-0 flex-nowrap h-full overflow-y-auto z-10">
                <div className="p-4 border-b border-slate-200">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        This Application provide the insights and answer the question related to datasets
                    </p>
                </div>

                <div className="py-2 flex-1">
                    <SidebarItem icon={<LayoutTemplate size={16} />} label="Cover page" count={1} />
                    <SidebarItem icon={<Folder size={16} fill="currentColor" className="text-blue-500" />} label="Files" active />
                    <SidebarItem icon={<Clock size={16} />} label="Autosaved" />
                    <SidebarItem icon={<BookOpen size={16} />} label="Project Catalog" />

                    <div className="mt-2 mb-1 px-4 flex items-center justify-between text-slate-500 group cursor-pointer hover:text-slate-800">
                        <div className="flex items-center gap-2">
                            <Network size={16} />
                            <span className="text-[13px] font-medium">References</span>
                        </div>
                        <Info size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="pl-9 pr-4 space-y-1 mb-2">
                        <div className="text-[13px] text-slate-600 hover:text-slate-900 cursor-pointer py-1">File references</div>
                        <div className="text-[13px] text-slate-600 hover:text-slate-900 cursor-pointer py-1">External references</div>
                    </div>

                    <SidebarItem icon={<Trash2 size={16} />} label="Trash" />

                    <div className="my-2 border-t border-slate-200 mx-4"></div>

                    <div className="px-4 py-1.5 flex justify-between items-center text-slate-600 hover:text-slate-900 cursor-pointer">
                        <div className="flex items-center gap-2 text-[13px] font-medium"><Activity size={16} /> Project usage</div>
                        <ChevronRight size={14} />
                    </div>
                    <div className="px-4 py-1.5 flex justify-between items-center text-slate-600 hover:text-slate-900 cursor-pointer">
                        <div className="flex items-center gap-2 text-[13px] font-medium"><Network size={16} /> Access graph</div>
                        <ChevronRight size={14} />
                    </div>
                </div>
            </div>

            {/* Main Canvas + Info Sidebar Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">

                {/* Top Breadcrumb Header */}
                <div className="h-12 border-b border-slate-200 flex items-center px-4 shrink-0 bg-white gap-2 text-sm text-slate-600">
                    <Folder size={16} fill="currentColor" className="text-slate-300" />
                    <span className="hover:underline cursor-pointer">Demo Poc</span>
                    <ChevronRight size={14} className="text-slate-400" />
                    <span className="hover:underline cursor-pointer font-medium text-slate-800">Sweta's project</span>
                    <Star size={14} className="text-slate-400 cursor-pointer hover:fill-amber-400 hover:text-amber-400 ml-1" />
                    <div className="flex items-center justify-center bg-slate-100 rounded text-xs px-1.5 py-0.5 ml-1 border border-slate-200 text-slate-500">
                        <Activity size={12} className="mr-1 inline" /> 1
                    </div>
                </div>

                <div className="flex-1 flex min-h-0 relative">
                    {/* Center File List */}
                    <div className="flex-1 flex flex-col">
                        <div className="px-6 py-5 flex items-center justify-between">
                            <h1 className="text-xl font-bold text-slate-800">Files</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-[13px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer">Actions ▾</span>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowUploadMenu(!showUploadMenu)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-sm text-sm font-medium flex items-center gap-1.5 shadow-sm transition-colors"
                                    >
                                        <Plus size={16} /> New ▾
                                    </button>

                                    {/* Upload Menu Popover */}
                                    {showUploadMenu && (
                                        <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded shadow-xl border border-slate-200 z-50 overflow-hidden">
                                            <div className="p-2 border-b border-slate-100 bg-slate-50">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-1.5 text-slate-400" size={14} />
                                                    <input type="text" placeholder="Search for apps..." className="w-full text-xs pl-7 pr-2 py-1.5 border border-slate-300 rounded focus:border-blue-500 outline-none" />
                                                </div>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto p-1">
                                                <div className="text-[10px] font-bold text-slate-400 px-2 pt-2 uppercase tracking-wide">Files</div>
                                                <button
                                                    onClick={() => {
                                                        fileInputRef.current?.click();
                                                        setShowUploadMenu(false);
                                                    }}
                                                    className="w-full text-left flex items-start gap-2 px-2 py-1.5 hover:bg-slate-100 rounded text-sm group"
                                                >
                                                    <UploadCloud size={16} className="text-slate-500 mt-0.5" />
                                                    <div className="flex-1 text-left">
                                                        <div className="text-slate-700 font-medium group-hover:text-blue-600">Upload files...</div>
                                                        <div className="text-[11px] text-slate-500">Upload CSV, JSON directly from computer.</div>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        alert("Data Connection functionality (e.g. Postgres, S3, REST) is coming soon!");
                                                        setShowUploadMenu(false);
                                                    }}
                                                    className="w-full text-left flex items-start gap-2 px-2 py-1.5 hover:bg-slate-100 rounded text-sm group"
                                                >
                                                    <Database size={16} className="text-slate-500 mt-0.5" />
                                                    <div className="flex-1 text-left">
                                                        <div className="text-slate-700 font-medium group-hover:text-blue-600">Data connection</div>
                                                        <div className="text-[11px] text-slate-500">Connect to Postgres, S3, REST.</div>
                                                    </div>
                                                </button>
                                                <div className="text-[10px] font-bold text-slate-400 px-2 pt-3 pb-1 uppercase tracking-wide">Ontology</div>
                                                <button className="w-fulltext-left flex items-start gap-2 px-2 py-1.5 hover:bg-slate-100 rounded text-sm group">
                                                    <Network size={16} className="text-slate-500 mt-0.5" />
                                                    <div className="flex-1 text-left">
                                                        <div className="text-slate-700 font-medium group-hover:text-blue-600">Ontology</div>
                                                        <div className="text-[11px] text-slate-500">Create entity types from datasets.</div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                            <div className="flex items-center gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <span>Name ▴</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <RefreshCw size={14} className="hover:text-slate-700 cursor-pointer" />
                                <LinkIcon size={14} className="hover:text-slate-700 cursor-pointer" />
                                <Trash2 size={14} className="hover:text-slate-700 cursor-pointer" />
                                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                <Search size={14} className="hover:text-slate-700 cursor-pointer" />
                                <Lock size={14} className="hover:text-slate-700 cursor-pointer" />
                                <ViewGridIcon className="w-4 h-4 hover:text-slate-700 cursor-pointer" />
                                <TerminalSquare size={14} className="hover:text-slate-700 cursor-pointer" />
                            </div>
                        </div>

                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".csv,.json"
                            onChange={handleFileUpload}
                        />

                        {/* File List */}
                        <div className="flex-1 overflow-y-auto px-4 space-y-0.5">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    onDoubleClick={() => file.type === 'dataset' && setViewData(true)}
                                    className={`flex items-center justify-between px-2 py-2.5 rounded cursor-pointer border border-transparent transition-colors ${file.active ? 'bg-[#ebf3ff] border-blue-200' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-3 w-1/2 min-w-0">
                                        {file.type === 'dataset' ? (
                                            <div className="w-6 h-6 rounded flex items-center justify-center shrink-0">
                                                <FileSpreadsheet size={16} className="text-emerald-600" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 rounded flex items-center justify-center bg-teal-100 shrink-0">
                                                <LayoutTemplate size={14} className="text-teal-700" />
                                            </div>
                                        )}
                                        <span className={`text-sm truncate ${file.active ? 'text-blue-900 font-medium' : 'text-slate-700'}`}>{file.name}</span>
                                        {file.type === 'dataset' && <Star size={12} className="text-slate-300 ml-2" />}
                                    </div>
                                    <div className="text-xs text-slate-500 whitespace-nowrap">
                                        {file.updated}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Info Sidebar */}
                    <div className="w-[300px] border-l border-slate-200 bg-[#fbfcfd] flex flex-col shrink-0 flex-nowrap h-full overflow-y-auto">
                        <div className="flex justify-between items-center p-3 border-b border-slate-200">
                            <div className="p-1 rounded bg-blue-50 text-blue-600 mr-2"><Info size={16} /></div>
                            <span className="text-sm font-medium text-slate-700 flex-1">Overview</span>
                            <div className="flex gap-2 text-slate-400">
                                <Lock size={14} className="hover:text-slate-600 cursor-pointer" />
                                <Share2 size={14} className="hover:text-slate-600 cursor-pointer" />
                            </div>
                        </div>

                        <div className="p-4 flex flex-col gap-6 relative">
                            {/* Selected File Header */}
                            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                                <FileSpreadsheet size={16} className="text-emerald-500" />
                                <span className="text-sm font-bold text-slate-800 truncate">horse_race_results_100</span>
                            </div>

                            {/* Description Block */}
                            <div>
                                <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Description</h3>
                                <div className="text-sm text-slate-400 italic bg-white border border-dashed border-slate-300 rounded p-2 hover:border-blue-400 hover:bg-blue-50 cursor-text transition-colors">
                                    Enter description...
                                </div>
                            </div>

                            {/* Documentation Block */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Documentation</h3>
                                    <span className="text-xs text-blue-600 hover:underline cursor-pointer font-medium">Add {'>'}</span>
                                </div>
                                <div className="text-sm text-slate-500">No documentation</div>
                            </div>

                            {/* PoC Block */}
                            <div>
                                <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Project point of contact</h3>
                                <div className="flex items-center justify-between border border-dashed border-slate-300 rounded p-3 bg-white hover:border-blue-400 cursor-pointer">
                                    <p className="text-xs text-slate-500 flex-1 pr-2 leading-relaxed">
                                        Add a user or group to act as the point of contact for issues or questions regarding this file.
                                    </p>
                                    <button className="text-blue-600 flex items-center gap-1 font-medium text-sm shrink-0">
                                        <Plus size={14} /> Add
                                    </button>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div>
                                <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-3">Metadata</h3>
                                <div className="space-y-3">
                                    <MetaRow label="RID" value={<span className="font-mono bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-[10px] truncate max-w-[150px] inline-block">ri.dataset.main.b949-ed49...</span>} />
                                    <MetaRow label="Location" value={<span className="text-blue-600 hover:underline cursor-pointer truncate limit-lines-2 text-[11px] font-mono leading-tight">/Demo Poc/Sweta's project/horse_race_results_100</span>} />
                                    <MetaRow label="Space" value="Demo Poc-5b20db" />
                                    <MetaRow label="Tags" value={<span className="text-slate-400 italic">No tags</span>} />
                                    <MetaRow label="Portfolio" value={<span className="text-slate-400 italic">No portfolio</span>} />
                                    <MetaRow label="Created" value={<span className="text-[11px]">Jan 6, 2026, 6:28 PM<br /><span className="text-slate-400">by Sweta Kumari</span></span>} />
                                    <MetaRow label="Last modified" value={<span className="text-[11px]">Jan 6, 2026, 6:28 PM<br /><span className="text-slate-400">by Sweta Kumari</span></span>} />
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Detailed Data Preview Wizard Component
// ----------------------------------------------------------------------------

function DataPreviewView({ fileName, headers, data, totalRows, onBack, onMap }: { fileName: string, headers: string[], data: any[], totalRows: number, onBack: () => void, onMap: () => void }) {
    return (
        <div className="h-full w-full flex flex-col bg-slate-50 text-slate-900 border-t border-slate-200 overflow-hidden font-sans relative">

            {/* Top Toolbar */}
            <div className="h-12 border-b border-slate-200 flex flex-col justify-center bg-white shrink-0 z-20">
                <div className="flex items-center gap-4 px-4 h-full">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-[13px] text-slate-600 shrink-0">
                        <Folder size={14} fill="currentColor" className="text-slate-300" />
                        <span className="hover:underline cursor-pointer" onClick={onBack}>Sweta's project</span>
                        <ChevronRight size={12} className="text-slate-400" />
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                            <FileSpreadsheet size={14} className="text-emerald-500" /> horse_race_results_100
                        </span>
                        <Star size={12} className="text-slate-300 cursor-pointer ml-1" />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 border-l border-slate-200 pl-4">
                        <span className="cursor-pointer hover:text-slate-800">File ▾</span>
                        <span className="cursor-pointer hover:text-slate-800">Help ▾</span>
                        <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"><Activity size={12} /> 1</span>
                        <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 ml-2 shadow-sm">master ▾</span>
                    </div>

                    <div className="flex-1"></div>

                    <div className="flex items-center gap-3 text-slate-500">
                        <Share2 size={16} className="cursor-pointer hover:text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Sub-toolbar (Preview, History, Details, etc) */}
            <div className="h-10 bg-white border-b border-slate-200 flex items-center justify-between px-4 text-sm font-medium z-10 shrink-0">
                <div className="flex gap-5 h-full">
                    <div className="h-full flex items-center border-b-2 border-blue-600 text-blue-700 px-1 cursor-pointer">Preview</div>
                    <div className="h-full flex items-center text-slate-500 hover:text-slate-800 px-1 cursor-pointer">History</div>
                    <div className="h-full flex items-center text-slate-500 hover:text-slate-800 px-1 cursor-pointer">Details</div>
                    <div className="h-full flex items-center text-slate-500 hover:text-slate-800 px-1 cursor-pointer">Health</div>
                    <div className="h-full flex items-center text-slate-500 hover:text-slate-800 px-1 cursor-pointer">Compare</div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 rounded text-xs text-slate-700 font-bold hover:bg-slate-50 shadow-sm">
                        <Database size={14} className="text-blue-600" /> SQL preview
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 rounded text-xs text-slate-700 font-bold hover:bg-slate-50 shadow-sm ml-1">
                        <BarChart3 size={14} className="text-amber-500" /> Analyze data ▾
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 rounded text-xs text-slate-700 font-bold hover:bg-slate-50 shadow-sm ml-1">
                        <Network size={14} className="text-purple-500" /> Explore pipeline ▾
                    </button>
                    <div className="w-px h-5 bg-slate-300 mx-1"></div>
                    <button className="text-xs text-slate-600 hover:text-slate-900 font-medium">All actions ▾</button>
                </div>
            </div>

            {/* Main Dataset Area */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Dataset Metadata Context Sidebar */}
                <div className="w-[300px] border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-y-auto shadow-sm z-10">
                    <div className="p-3 border-b border-slate-200 flex gap-4 text-sm font-bold pt-4 px-6">
                        <span className="text-slate-800 border-b-2 border-slate-800 pb-2">About</span>
                        <span className="text-slate-400 pb-2">Columns</span>
                    </div>

                    <div className="p-4 space-y-6">
                        <div className="text-sm text-slate-400 italic bg-[#fbfcfd] border border-dashed border-slate-300 p-2 rounded hover:bg-blue-50 hover:border-blue-300 cursor-text transition-colors">
                            Enter description...
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
                                <Database size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-800 tracking-tight">Horse Race Results</h2>
                            </div>
                        </div>

                        <div className="bg-[#f8fafc] p-3 rounded-md border border-slate-200 space-y-3">
                            <MetaDetail label="Updated" value="5 hours ago by Sweta Kumari" />
                            <MetaDetail label="Created" value="5 hours ago by Sweta Kumari" />
                            <MetaDetail label="Location" value="/Demo Poc/Sweta.../horse_race..." link />
                            <MetaDetail label="Type" value="Raw dataset" />
                            <MetaDetail label="RID" value={<span className="font-mono bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-[10px]">ri.dataset.main.b94...</span>} />

                            <div className="flex gap-4 pt-1">
                                <div>
                                    <div className="text-base font-bold text-slate-800">9 columns</div>
                                </div>
                                <div className="border-l border-slate-200 pl-4">
                                    <div className="text-base font-bold text-slate-800">1 file</div>
                                </div>
                            </div>
                            <div className="text-xs text-slate-500 font-mono">6.5KB <Info size={12} className="inline ml-1" /></div>

                            <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide flex items-center gap-1 mt-2">
                                <Plus size={12} /> Calculate row count
                            </button>

                            <MetaDetail label="Updated via" value="File imports • Import • Edit Schema" />
                        </div>
                    </div>
                </div>

                {/* Right Data Grid Table */}
                <div className="flex-1 bg-white flex flex-col relative overflow-hidden">
                    <div className="h-10 border-b border-slate-200 bg-[#fbfcfd] flex items-center justify-between px-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <FileSpreadsheet size={16} className="text-emerald-500" /> horse_race_results_100
                        </div>
                        <div className="flex items-center gap-4 text-slate-500">
                            <span>Showing 100 rows</span>
                            <span>9 columns</span>
                            <div className="relative">
                                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2" />
                                <input type="text" placeholder="Search columns..." className="pl-6 pr-2 py-1 text-xs border border-slate-300 rounded bg-white w-48 focus:border-blue-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="flex-1 overflow-auto bg-white relative">
                        {/* A very dense simulated data grid to match Foundry visual spec exactly */}
                        <table className="w-full text-left border-collapse select-none">
                            <thead className="bg-[#fbfcfd] sticky top-0 z-10 shadow-sm border-b border-slate-200">
                                <tr className="text-[11px] font-bold text-slate-600 shadow-[0_1px_0_rgba(203,213,225,1)]">
                                    <th className="font-mono font-medium text-slate-400 bg-slate-50 px-2 py-1.5 w-8 text-center border-r border-slate-200 sticky left-0 z-20"></th>
                                    <th className="px-3 py-2 border-r border-slate-200 whitespace-nowrap min-w-[80px]">
                                        <div className="flex items-center gap-1"><span className="text-[10px] text-slate-400 font-mono">123</span> race_id</div>
                                        <div className="font-mono text-[9px] text-slate-400 mt-0.5 font-normal">integer</div>
                                    </th>
                                    <th className="px-3 py-2 border-r border-slate-200 whitespace-nowrap min-w-[150px]">
                                        <div className="flex items-center gap-1"><span className="text-[10px] text-slate-400 font-mono">""</span> horse_name</div>
                                        <div className="font-mono text-[9px] text-slate-400 mt-0.5 font-normal">string</div>
                                    </th>
                                    <th className="px-3 py-2 border-r border-slate-200 whitespace-nowrap min-w-[150px]">
                                        <div className="flex items-center gap-1"><span className="text-[10px] text-slate-400 font-mono">""</span> jockey_name</div>
                                        <div className="font-mono text-[9px] text-slate-400 mt-0.5 font-normal">string</div>
                                    </th>
                                    <th className="px-3 py-2 border-r border-slate-200 whitespace-nowrap min-w-[120px]">
                                        <div className="flex items-center gap-1"><span className="text-[10px] text-slate-400 font-mono">""</span> team</div>
                                        <div className="font-mono text-[9px] text-slate-400 mt-0.5 font-normal">string</div>
                                    </th>
                                    <th className="px-3 py-2 border-r border-slate-200 whitespace-nowrap min-w-[120px]">
                                        <div className="flex items-center gap-1"><span className="text-[10px] text-slate-400 font-mono">📅</span> race_date</div>
                                        <div className="font-mono text-[9px] text-slate-400 mt-0.5 font-normal">date</div>
                                    </th>
                                    <th className="px-3 py-2 border-r border-slate-200 whitespace-nowrap min-w-[120px]">
                                        <div className="flex items-center justify-end gap-1"><span className="text-[10px] text-slate-400 font-mono">1.0</span> lap_time_sec</div>
                                        <div className="font-mono text-[9px] text-slate-400 mt-0.5 text-right font-normal">double</div>
                                    </th>
                                    <th className="px-3 py-2 border-r border-slate-200 whitespace-nowrap min-w-[80px]">
                                        <div className="flex items-center justify-end gap-1"><span className="text-[10px] text-slate-400 font-mono">123</span> position</div>
                                        <div className="font-mono text-[9px] text-slate-400 mt-0.5 text-right font-normal">integer</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-[12px] font-mono text-slate-700">
                                {Array.from({ length: 25 }).map((_, i) => (
                                    <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/50 group">
                                        <td className="w-8 text-center text-slate-300 bg-slate-50 border-r border-slate-200 text-[10px] sticky left-0 z-10">{i + 1}</td>
                                        <td className="px-3 py-1.5 border-r border-slate-100 whitespace-nowrap text-right">{i + 1}</td>
                                        <td className="px-3 py-1.5 border-r border-slate-100 whitespace-nowrap">{['StormRunner', 'NightShadow', 'GoldenHoof', 'IronWind', 'SilverArrow', 'DarkSpirit', 'FireDash', 'WindChaser', 'BlackComet', 'Thunderbolt'][(i) % 10]}</td>
                                        <td className="px-3 py-1.5 border-r border-slate-100 whitespace-nowrap">{['Alex Brown', 'Chris Lee', 'David Clark', 'Tom Harris', 'John Smith'][(i) % 5]}</td>
                                        <td className="px-3 py-1.5 border-r border-slate-100 whitespace-nowrap">{['Blue Stable', 'Green Stable', 'Red Stable'][(i) % 3]}</td>
                                        <td className="px-3 py-1.5 border-r border-slate-100 whitespace-nowrap text-right">2024-01-{(i + 2).toString().padStart(2, '0')}</td>
                                        <td className="px-3 py-1.5 border-r border-slate-100 whitespace-nowrap text-right">{(70 + Math.random() * 6).toFixed(1)}</td>
                                        <td className="px-3 py-1.5 border-r border-slate-100 whitespace-nowrap text-right">{(i % 8) + 1}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Action Bar Floating */}
            <div className="absolute bottom-6 right-6 flex items-center gap-3 z-50">
                <button
                    onClick={onMap}
                    className="bg-[#1a233b] hover:bg-black text-white px-5 py-2.5 rounded shadow-lg text-sm font-bold flex items-center gap-2 transition-all"
                >
                    Map to Ontology <ChevronRight size={16} />
                </button>
            </div>
        </div>
    )
}

// ----------------------------------------------------------------------------
// Schema Mapping Wizard Component
// ----------------------------------------------------------------------------

function SchemaMappingWizard({ fileName, csvHeaders, csvData, onBack, onComplete }: { fileName: string, csvHeaders: string[], csvData: any[], onBack: () => void, onComplete: () => void }) {
    const [entityTypes, setEntityTypes] = useState<any[]>([]);
    const [selectedTypeId, setSelectedTypeId] = useState<string>('');
    const [mappings, setMappings] = useState<Record<string, string>>({});
    const [isImporting, setIsImporting] = useState(false);

    // Auto-map headers to properties if exact names match
    useEffect(() => {
        ApiClient.get<any[]>('/entity-types').then(types => {
            setEntityTypes(types);
            if (types.length > 0) {
                setSelectedTypeId(types[0].id);
            }
        });
    }, []);

    const selectedType = entityTypes.find(t => t.id === selectedTypeId);

    useEffect(() => {
        // Simple auto-mapping heuristic
        const newMappings: Record<string, string> = {};
        if (selectedType) {
            csvHeaders.forEach(header => {
                const prop = selectedType.attributes.find((a: any) =>
                    a.name.toLowerCase() === header.toLowerCase() ||
                    a.name.replace(/_/g, '').toLowerCase() === header.replace(/_/g, '').toLowerCase()
                );
                if (prop) {
                    newMappings[header] = prop.name;
                }
            });
        }
        setMappings(newMappings);
    }, [selectedTypeId, csvHeaders, selectedType]);

    const handleImport = async () => {
        if (!selectedType) return;
        setIsImporting(true);
        try {
            const primaryAttr = selectedType.attributes[0]?.name || 'id';

            // Generate payload transforming CSV rows via the mapping dictionary
            const payload = csvData.map((row, index) => {
                const mappedRow: any = {
                    logicalId: `imported-${Date.now()}-${index}`, // Give temporary stable id
                };

                // Apply mapped columns
                Object.keys(mappings).forEach(csvCol => {
                    const ontologyProp = mappings[csvCol];
                    if (ontologyProp && row[csvCol] !== undefined) {
                        try {
                            const attrDef = selectedType.attributes.find((a: any) => a.name === ontologyProp);
                            // Super basic type conversion logic for the demo backend
                            let val = row[csvCol];
                            if (attrDef?.baseType === 'INTEGER' || attrDef?.baseType === 'DOUBLE') {
                                val = Number(val);
                            }
                            mappedRow[ontologyProp] = val;
                        } catch (e) { }
                    }
                });

                // Fallback logical id to primary key if we mapped it
                if (mappedRow[primaryAttr]) {
                    mappedRow.logicalId = `${mappedRow[primaryAttr]}`;
                }

                return mappedRow;
            });

            // Prevent overloading backend in dev if the CSV is massive (batch to max 1000)
            const batch = payload.slice(0, 500);

            const result = await ApiClient.post<{ success: boolean, count: number }>(`/entity-types/${selectedType.id}/instances/bulk`, batch);
            alert(`Success! Imported ${result.count} records into ${selectedType.name} (Bulk)`);
            onComplete();
        } catch (error) {
            console.error(error);
            alert('Import failed. Check console.');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-slate-50 text-slate-900 border-t border-slate-200 overflow-hidden font-sans relative">

            {/* Top Toolbar */}
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} disabled={isImporting} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-colors disabled:opacity-50">
                        <ChevronRight size={18} className="rotate-180" />
                    </button>
                    <div>
                        <h1 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            <Network size={16} className="text-purple-600" />
                            Import to Ontology
                        </h1>
                        <p className="text-[11px] text-slate-500 font-medium">Map "{fileName}" columns to target Entity Type.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={onBack} disabled={isImporting} className="px-4 py-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 disabled:opacity-50">Cancel</button>
                    <button
                        onClick={handleImport}
                        disabled={isImporting}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-5 py-2 rounded shadow-sm text-sm font-bold flex items-center gap-2 transition-all"
                    >
                        {isImporting ? (
                            <><Loader2 size={14} className="animate-spin" /> Importing...</>
                        ) : (
                            <>Run Import <Database size={14} /></>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Target Entity Selection */}
                <div className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 mb-1">Target Object Type</h2>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">Select the ontology object to ingest data into.</p>

                        {entityTypes.length === 0 ? (
                            <div className="text-sm text-slate-500 italic p-3 border rounded">Loading ontology types...</div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <select
                                    className="w-full appearance-none pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer shadow-sm"
                                    value={selectedTypeId}
                                    onChange={e => setSelectedTypeId(e.target.value)}
                                >
                                    {entityTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={14} />
                            </div>
                        )}
                    </div>

                    {selectedType && (
                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Object Schema</h3>
                                <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">{selectedType.attributes.length} Properties</span>
                            </div>
                            <div className="space-y-2">
                                {selectedType.attributes.map((prop: any) => (
                                    <div key={prop.name} className="flex items-center justify-between p-2.5 bg-[#fbfcfd] rounded border border-slate-200">
                                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                            {prop.name} {prop.required && <span className="text-red-500">*</span>}
                                        </span>
                                        <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 border border-slate-200 rounded shadow-sm">{prop.baseType}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Schema Mapping Canvas */}
                <div className="flex-1 bg-[#f4f6f8] p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-[#fbfcfd]">
                                <h2 className="text-base font-bold text-slate-800">Property Mapping</h2>
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {Object.values(mappings).filter(Boolean).length} mapped
                                </span>
                            </div>

                            <div className="p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#fbfcfd] border-b border-slate-200">
                                        <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="px-8 py-3 w-1/2">Source Column (CSV)</th>
                                            <th className="px-8 py-3 w-1/2 border-l border-slate-200">Target Property (Ontology)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {csvHeaders.map(col => (
                                            <tr key={col} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-8 py-3">
                                                    <div className="flex items-center justify-between bg-white shadow-sm p-2 rounded border border-slate-200 group-hover:border-blue-300 transition-colors">
                                                        <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-700">
                                                            <FileSpreadsheet size={14} className="text-emerald-500" />
                                                            {col}
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 rounded">String</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-3 border-l border-slate-100 relative">
                                                    <div className="absolute top-1/2 -left-3 -translate-y-1/2 text-slate-300 bg-white rounded-full">
                                                        <Network size={20} className="p-1" />
                                                    </div>
                                                    <div className="flex items-center gap-2 pl-4">
                                                        <select
                                                            className={`flex-1 appearance-none bg-white border ${mappings[col] ? 'border-purple-300 bg-purple-50/10' : 'border-slate-300'} rounded p-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:border-slate-400 transition-colors`}
                                                            value={mappings[col] || ''}
                                                            onChange={(e) => setMappings({ ...mappings, [col]: e.target.value })}
                                                            disabled={!selectedType}
                                                        >
                                                            <option value="" className="text-slate-400 font-normal">-- Ignore --</option>
                                                            {selectedType?.attributes.map((p: any) => (
                                                                <option key={p.name} value={p.name}>{p.name} ({p.baseType})</option>
                                                            ))}
                                                        </select>
                                                        <ChevronRight className="absolute right-12 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={14} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-6 bg-[#f0f9ff] border border-[#bae6fd] rounded shadow-sm p-4 flex gap-3 text-sky-900">
                            <Info size={20} className="shrink-0 text-sky-600 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-bold mb-1">Row validation enabled</p>
                                <p className="text-sky-800/80 leading-relaxed text-xs">During import, rows that fail schema validation (e.g. string mapped to integer, invalid timestamp format) will be routed to a dead-letter queue dataset in your project for manual review.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helpers
function SidebarItem({ icon, label, count, active }: { icon: React.ReactNode, label: string, count?: number, active?: boolean }) {
    return (
        <div className={`px-4 py-1.5 flex justify-between items-center cursor-pointer transition-colors ${active ? 'bg-[#ebf3ff] text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            <div className={`flex items-center gap-2 text-[13px] ${active ? 'font-medium text-blue-800' : 'font-medium'}`}>
                {icon}
                {label}
            </div>
            {count !== undefined && (
                <div className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {count}
                </div>
            )}
        </div>
    )
}

function MetaRow({ label, value }: { label: string, value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-500">{label}</span>
            <div className="text-xs text-slate-700">{value}</div>
        </div>
    )
}

function MetaDetail({ label, value, link }: { label: string, value: React.ReactNode, link?: boolean }) {
    return (
        <div className="flex items-start">
            <div className="w-24 text-[11px] font-bold text-slate-500 uppercase shrink-0 pt-0.5">{label}</div>
            <div className={`text-sm ${link ? 'text-blue-600 hover:underline cursor-pointer' : 'text-slate-700'}`}>
                {value}
            </div>
        </div>
    )
}

function ViewGridIcon(props: any) {
    return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    )
}
