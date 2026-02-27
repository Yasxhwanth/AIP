"use client";

import { useState, useRef } from "react";
import { useWorkspaceStore } from "@/store/workspace";
import {
    Database,
    UploadCloud,
    FileJson,
    FileSpreadsheet,
    ArrowRight,
    CheckCircle2,
    Settings2,
    GitMerge,
    Wand2,
    Workflow
} from "lucide-react";
import Papa from 'papaparse';
import { PipelineEditor } from "@/components/PipelineEditor";
import { ApiClient } from "@/lib/apiClient";

type IngestStep = 'UPLOAD' | 'MAP' | 'EXECUTE';

export default function IntegrationsPage() {
    const { activeProjectName } = useWorkspaceStore();
    const [step, setStep] = useState<IngestStep>('UPLOAD');
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [entityName, setEntityName] = useState("New_Entity_Type");
    const [viewMode, setViewMode] = useState<'WIZARD' | 'PIPELINES'>('WIZARD');
    const [inferring, setInferring] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);

        // Parse CSV Preview
        if (selected.name.endsWith('.csv')) {
            Papa.parse(selected, {
                header: true,
                preview: 5, // preview first 5 rows
                complete: (results) => {
                    setColumns(results.meta.fields || []);
                    setPreviewData(results.data);
                    setStep('MAP');
                }
            });
        } else if (selected.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target?.result as string);
                    const arr = Array.isArray(json) ? json : [json];
                    setColumns(Object.keys(arr[0] || {}));
                    setPreviewData(arr.slice(0, 5));
                    setStep('MAP');
                } catch (err) {
                    alert("Invalid JSON format");
                }
            };
            reader.readAsText(selected);
        } else {
            alert("Unsupported file format. Please upload CSV or JSON.");
        }
    };

    const handleMappingChange = (csvCol: string, ontologyType: string) => {
        setMapping({ ...mapping, [csvCol]: ontologyType });
    };

    const executePipeline = () => {
        setStep('EXECUTE');
        setTimeout(() => {
            alert(`Successfully ingested \${file?.name} and created EntityType: \${entityName}`);
            setStep('UPLOAD');
            setFile(null);
        }, 2000);
    };

    const handleAutoInfer = async () => {
        if (!previewData.length) return;
        setInferring(true);
        try {
            // Step 1: infer schema attributes from the preview data sample
            const sample = previewData[0];
            const inferResult = await ApiClient.post<{ attributes: Array<{ name: string; dataType: string }> }>(
                '/api/v1/integration/infer-schema',
                { sample }
            );

            // Step 2: pass inferred attributes + target entity name to get mapping suggestions
            const suggestResult = await ApiClient.post<{ suggestions: Record<string, string>; inferredAttributes?: any[] }>(
                '/api/v1/integration/suggest-mappings',
                {
                    inferredAttributes: inferResult.attributes,
                    sampleData: previewData,
                    targetEntityType: entityName,
                }
            );

            // Apply suggestions as column type selections
            const newMapping: Record<string, string> = { ...mapping };
            const suggestions = suggestResult.suggestions ?? {};
            // Map each original column name to suggested ontology type
            for (const col of columns) {
                const colClean = col.replace(/[^a-zA-Z0-9]/g, '');
                if (suggestions[colClean]) {
                    newMapping[col] = suggestions[colClean];
                } else if (suggestions[col]) {
                    newMapping[col] = suggestions[col];
                }
            }
            // Also apply inferred data types as fallback
            for (const attr of inferResult.attributes) {
                const origCol = columns.find(c => c.replace(/[^a-zA-Z0-9]/g, '') === attr.name || c === attr.name);
                if (origCol && !newMapping[origCol]) {
                    newMapping[origCol] = attr.dataType;
                }
            }
            setMapping(newMapping);
        } catch (err) {
            console.error("Inference failed", err);
        } finally {
            setInferring(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] text-slate-900 border-t border-slate-200">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        <Database className="w-6 h-6 text-orange-500" />
                        Kernal Data Ingestion
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Upload flat files or connect APIs to dynamically build the '{activeProjectName}' Ontology Graph.</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setViewMode('WIZARD')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all \${viewMode === 'WIZARD' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Database className="w-3.5 h-3.5" /> WIZARD
                    </button>
                    <button
                        onClick={() => setViewMode('PIPELINES')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all \${viewMode === 'PIPELINES' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Workflow className="w-3.5 h-3.5" /> PIPELINES
                    </button>
                </div>

                {viewMode === 'WIZARD' && (
                    <div className="flex items-center gap-4 text-sm font-semibold">
                        <div className={`flex items-center gap-2 \${step === 'UPLOAD' ? 'text-orange-600' : 'text-slate-400'}`}>
                            <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs">1</span> Upload
                        </div>
                        <div className="w-8 h-px bg-slate-200"></div>
                        <div className={`flex items-center gap-2 \${step === 'MAP' ? 'text-orange-600' : 'text-slate-400'}`}>
                            <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs">2</span> Map Schema
                        </div>
                        <div className="w-8 h-px bg-slate-200"></div>
                        <div className={`flex items-center gap-2 \${step === 'EXECUTE' ? 'text-orange-600' : 'text-slate-400'}`}>
                            <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs">3</span> Execute
                        </div>
                    </div>
                )}
            </div>

            <div className={`flex-1 overflow-hidden \${viewMode === 'WIZARD' ? 'p-8 flex justify-center overflow-y-auto' : ''}`}>
                {viewMode === 'PIPELINES' ? (
                    <PipelineEditor />
                ) : (
                    <div className="w-full max-w-5xl">

                        {step === 'UPLOAD' && (
                            <div
                                className="bg-white border-2 border-dashed border-slate-300 rounded-2xl h-[400px] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-orange-400 transition-colors shadow-sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    accept=".csv,.json"
                                    onChange={handleFileUpload}
                                />
                                <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <UploadCloud className="w-10 h-10" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-700 mb-2">Drag & Drop Dataset</h2>
                                <p className="text-slate-500 mb-6 max-w-md text-center">Supports .CSV and .JSON formats up to 500MB.</p>
                                <button className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-md transition-colors">
                                    Browse Files
                                </button>
                            </div>
                        )}

                        {step === 'MAP' && (
                            <div className="bg-white border text-sm border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
                                <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {file?.name.endsWith('json') ? <FileJson className="w-5 h-5 text-blue-500" /> : <FileSpreadsheet className="w-5 h-5 text-emerald-500" />}
                                        <div>
                                            <h3 className="font-bold text-slate-800">{file?.name}</h3>
                                            <p className="text-xs text-slate-500">{(file?.size || 0) / 1000} KB • Map to Target Entity</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={entityName}
                                            onChange={e => setEntityName(e.target.value)}
                                            className="border border-slate-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-orange-500 outline-none"
                                            placeholder="Target Entity Name"
                                        />
                                        <button
                                            onClick={executePipeline}
                                            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-lg hover:bg-slate-800 transition-colors font-semibold"
                                        >
                                            Build Graph Nodes <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 flex overflow-hidden">
                                    <div className="w-80 border-r border-slate-200 bg-white p-4 overflow-y-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-slate-700 flex items-center gap-2"><GitMerge className="w-4 h-4" /> Column Mapping</h4>
                                            <button
                                                onClick={handleAutoInfer}
                                                disabled={inferring}
                                                title="AI Auto-Suggest Mappings"
                                                className="p-1.5 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all disabled:opacity-50"
                                            >
                                                <Wand2 className={`w-4 h-4 \${inferring ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {columns.map(col => (
                                                <div key={col} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                    <div className="font-semibold text-slate-800 mb-2 truncate">{col}</div>
                                                    <select
                                                        className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white text-xs outline-none focus:border-orange-500"
                                                        value={mapping[col] || "STRING"}
                                                        onChange={e => handleMappingChange(col, e.target.value)}
                                                    >
                                                        <option value="ID">Primary Key (Logical ID)</option>
                                                        <option value="STRING">Text Attribute</option>
                                                        <option value="NUMBER">Number Attribute</option>
                                                        <option value="BOOLEAN">Boolean Attribute</option>
                                                        <option value="DATETIME">Timestamp Attribute</option>
                                                        <option value="IGNORE">Ignore Column</option>
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex-1 p-4 bg-[#f8fafc] overflow-auto">
                                        <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Settings2 className="w-4 h-4" /> Data Preview (Rows 1-5)</h4>
                                        <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
                                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-200">
                                                        {columns.map(col => (
                                                            <th key={col} className="p-3 text-xs font-bold text-slate-600 border-r border-slate-100 last:border-r-0">
                                                                {col}
                                                                <span className="block text-[10px] text-orange-600 font-mono mt-0.5">{mapping[col] || "STRING"}</span>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previewData.map((row, i) => (
                                                        <tr key={i} className="border-b border-slate-100 last:border-b-0">
                                                            {columns.map(col => (
                                                                <td key={col} className="p-3 text-sm text-slate-700 font-mono border-r border-slate-50 last:border-r-0">
                                                                    {String(row[col] || '')}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'EXECUTE' && (
                            <div className="bg-white border border-slate-200 rounded-2xl h-[400px] flex flex-col items-center justify-center shadow-sm">
                                <div className="relative">
                                    <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-6 relative z-10 animate-bounce" />
                                    <div className="absolute inset-0 bg-emerald-100 blur-2xl rounded-full scale-150 animate-pulse"></div>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Ingesting Pipeline...</h2>
                                <p className="text-slate-500">Kernal is compiling EntityType models and writing nodes.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
