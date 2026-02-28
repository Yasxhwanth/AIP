"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/workspace";
import { useBuilderStore } from "@/store/builderStore";
import { Layers, CheckCircle2, AlertTriangle, AlertCircle, Wrench, Rocket } from "lucide-react";

export default function TopBar() {
    const pathname = usePathname();
    const router = useRouter();
    const { activeProjectName } = useWorkspaceStore();
    const { validateSystem, version } = useBuilderStore();

    if (pathname === '/projects') return null;

    const isBuilder = pathname.startsWith('/build');
    const isRuntime = pathname.startsWith('/run');

    // We only toggle between them if we are inside a project.
    if (!isBuilder && !isRuntime && pathname !== '/') return null;

    const validation = validateSystem();

    return (
        <div className="h-12 w-full border-b flex items-center justify-between px-4 shrink-0 transition-colors z-50"
            style={{
                background: isBuilder ? "#0B1220" : "#0A1929", // Builder=slate dark, Runtime=operational blue
                borderColor: "rgba(255,255,255,0.08)"
            }}>

            {/* Left: Branding & Project */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-600/20 border border-blue-500/30">
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="font-bold text-sm text-white font-sans tracking-tight">AIP</span>
                </div>
                <div className="w-px h-4 bg-white/15" />
                <span className="text-xs font-semibold text-slate-300 font-sans">{activeProjectName || 'Loading Project...'}</span>
            </div>

            {/* Center: Mode Switcher */}
            <div className="flex items-center bg-black/40 rounded-lg border border-white/10 p-1">
                <button
                    onClick={() => router.push('/build/ontology')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${isBuilder ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                    <Wrench className="w-3.5 h-3.5" /> BUILDER
                </button>
                <button
                    onClick={() => router.push('/run')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${isRuntime || pathname === '/' ? 'bg-blue-600/20 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                    <Rocket className="w-3.5 h-3.5" /> LIVE APP
                </button>
            </div>

            {/* Right: Validation & Status */}
            <div className="flex items-center gap-4">
                {isBuilder && (
                    <button
                        title="Validation Status"
                        className="flex items-center gap-1.5 text-[11px] font-bold font-mono px-2 py-1 rounded hover:bg-white/5 transition-colors">
                        {validation.status === 'valid' && <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">VALID</span></>}
                        {validation.status === 'warnings' && <><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /><span className="text-amber-400">{validation.issues.length} WARNINGS</span></>}
                        {validation.status === 'errors' && <><AlertCircle className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400">{validation.issues.length} ERRORS</span></>}
                    </button>
                )}

                <div className="w-px h-4 bg-white/15" />

                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Version</span>
                    <code className="text-[11px] text-blue-300 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">{version === 'draft' ? 'DRAFT' : 'v1.0'}</code>
                </div>

                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 ml-2" />
            </div>
        </div>
    );
}
