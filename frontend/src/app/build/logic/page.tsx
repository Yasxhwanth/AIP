"use client";

import React, { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api';
import Editor from '@monaco-editor/react';
import {
    Play,
    Save,
    Code2,
    TerminalSquare,
    BookTemplate,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

export default function LogicBuilder() {
    const [functions, setFunctions] = useState<any[]>([]);
    const [selectedFunction, setSelectedFunction] = useState<any | null>(null);
    const [code, setCode] = useState<string>('// Select or create a function...');
    const [paramsJson, setParamsJson] = useState<string>('{\n  "type": "object",\n  "properties": {}\n}');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadFunctions();
    }, []);

    const loadFunctions = async () => {
        try {
            const res = await ApiClient.get('/api/functions');
            setFunctions(res);
        } catch (e) {
            console.error('Failed to load functions', e);
        }
    };

    const handleSelect = (fn: any) => {
        setSelectedFunction(fn);
        setName(fn.name);
        setDescription(fn.description);
        setCode(fn.code || '// Write your Typescript/Javascript execution logic here.\n// return { status: "success" };');
        setParamsJson(JSON.stringify(fn.parameters || { type: 'object', properties: {} }, null, 2));
    };

    const handleCreateNew = () => {
        setSelectedFunction({ id: 'new' });
        setName('new_function');
        setDescription('');
        setCode('// Write your Typescript execution logic here.\n// Example:\n// const equipId = parsedArgs.equipmentId;\n// return { status: "success", result: equipId };');
        setParamsJson('{\n  "type": "object",\n  "properties": {\n    "equipmentId": { "type": "string" }\n  }\n}');
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            let parsedParams = {};
            try {
                parsedParams = JSON.parse(paramsJson);
            } catch (e) {
                alert("Invalid JSON in Parameters schema.");
                setSaving(false);
                return;
            }

            await ApiClient.post('/api/functions', {
                name,
                description,
                parameters: parsedParams,
                code
            });

            await loadFunctions();
            setSelectedFunction(null); // Reset selection to force a refresh on the UI list
        } catch (e) {
            console.error(e);
            alert('Failed to save function.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-48px)] bg-slate-50 text-slate-800 font-sans">

            {/* LEFT PANEL: Functions List */}
            <div className="w-64 border-r border-slate-200 bg-white flex flex-col shadow-sm z-10">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                        <Code2 size={18} className="text-blue-600" /> Functions
                    </h2>
                    <button
                        onClick={handleCreateNew}
                        className="text-white bg-blue-600 hover:bg-blue-700 p-1 rounded shadow-sm transition-colors"
                    >
                        <Play size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {functions.map(fn => (
                        <div
                            key={fn.id}
                            onClick={() => handleSelect(fn)}
                            className={`p-3 rounded-md cursor-pointer border transition-all ${selectedFunction?.id === fn.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'}`}
                        >
                            <div className="font-medium text-sm text-slate-800 flex items-center gap-2">
                                <TerminalSquare size={14} className="text-slate-400" />
                                {fn.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 truncate">{fn.description || 'No description'}</div>
                        </div>
                    ))}
                    {functions.length === 0 && (
                        <div className="text-sm text-slate-400 text-center mt-10 p-4 border border-dashed rounded bg-slate-50">
                            No functions deployed. Create one to empower your agents!
                        </div>
                    )}
                </div>
            </div>

            {/* CENTER PANEL: Code Canvas (Monaco) */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                <div className="h-12 border-b border-[#333] flex items-center px-4 bg-[#252526] text-slate-300 shadow-sm z-10">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Code2 size={16} className="text-yellow-500" />
                        {selectedFunction ? name + '.ts' : 'No file selected'}
                    </div>
                </div>
                <div className="flex-1 relative">
                    {selectedFunction ? (
                        <Editor
                            height="100%"
                            defaultLanguage="typescript"
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                lineHeight: 24,
                                padding: { top: 16 }
                            }}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-500 bg-[#1e1e1e]">
                            <div className="text-center">
                                <Code2 size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Select a function from the sidebar to edit its logic.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Settings & Inspector */}
            <div className="w-80 border-l border-slate-200 bg-white flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                        <BookTemplate size={18} className="text-purple-600" /> Inspector
                    </h2>
                    {selectedFunction && (
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 shadow-sm transition-colors"
                        >
                            <Save size={14} /> {saving ? 'Deploying...' : 'Deploy'}
                        </button>
                    )}
                </div>

                {selectedFunction ? (
                    <div className="p-4 space-y-5 overflow-y-auto">

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Function Name</label>
                            <input
                                type="text"
                                className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. promote_soldier"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Description (For AI)</label>
                            <textarea
                                className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-24 resize-none"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Tell the AI exactly when and how to use this tool..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider flex justify-between">
                                <span>Parameter Schema</span>
                                <span className="text-blue-500">JSON</span>
                            </label>
                            <div className="border border-slate-300 rounded overflow-hidden">
                                <Editor
                                    height="200px"
                                    defaultLanguage="json"
                                    theme="vs-light"
                                    value={paramsJson}
                                    onChange={(val) => setParamsJson(val || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 12,
                                        wordWrap: "on",
                                        scrollBeyondLastLine: false,
                                        lineNumbers: "off"
                                    }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                                <AlertCircle size={12} className="mt-0.5" />
                                Define the arguments your Typescript logic needs. The AI will formulate answers to match this JSON schema.
                            </p>
                        </div>

                    </div>
                ) : (
                    <div className="p-6 text-center text-sm text-slate-400 mt-10">
                        Select or deploy a function to view its properties and schema definitions.
                    </div>
                )}
            </div>

        </div>
    );
}
