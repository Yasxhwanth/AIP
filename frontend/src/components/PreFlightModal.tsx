import React, { useState } from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import { ApiClient } from '@/lib/apiClient';

interface PreFlightModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    actionType: string;
    targetId: string;
    actionDescription: string;
}

interface SimulationResult {
    simulationId: string;
    riskLevel: 'HIGH' | 'LOW';
    impact: {
        brokenPipelines: number;
        brokenApplications: number;
        brokenDashboards: number;
        dataLossRisk: boolean;
    };
    recommendation: 'REQUIRE_PEER_REVIEW' | 'PROCEED_SAFE';
}

export const PreFlightModal: React.FC<PreFlightModalProps> = ({ isOpen, onClose, onConfirm, actionType, targetId, actionDescription }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SimulationResult | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setResult(null);
            ApiClient.post<SimulationResult>('/api/v1/policy/simulate', {
                actionType,
                targetId,
                simulateDataLoss: actionType.includes('DROP') || actionType.includes('DELETE')
            })
                .then(setResult)
                .catch(err => console.error("Failed to run pre-flight simulation", err))
                .finally(() => setLoading(false));
        }
    }, [isOpen, actionType, targetId]);

    if (!isOpen) return null;

    const totalImpact = result ? result.impact.brokenPipelines + result.impact.brokenApplications + result.impact.brokenDashboards : 0;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#11141A] border border-white/10 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#181C25]">
                    <h2 className="text-white font-semibold flex items-center gap-2">
                        Pre-Flight Simulation
                        {loading && <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">Running...</span>}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <p className="text-slate-300 text-sm mb-6 pb-4 border-b border-white/5">
                        <span className="text-slate-500 mr-2">Target Action:</span>
                        <strong className="text-white">{actionDescription}</strong>
                    </p>

                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
                            <span className="text-sm">Calculating downstream impact...</span>
                        </div>
                    ) : result ? (
                        <div className="space-y-6">
                            {/* Risk Banner */}
                            <div className={`p-4 rounded-lg flex items-start gap-3 border ${result.riskLevel === 'HIGH' ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                                {result.riskLevel === 'HIGH' ? (
                                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                                )}
                                <div>
                                    <h3 className={`font-semibold mb-1 ${result.riskLevel === 'HIGH' ? 'text-red-400' : 'text-green-400'}`}>
                                        {result.riskLevel === 'HIGH' ? 'High Risk Action Detected' : 'Safe to Proceed'}
                                    </h3>
                                    <p className={`text-sm ${result.riskLevel === 'HIGH' ? 'text-red-400/80' : 'text-green-400/80'}`}>
                                        {result.recommendation === 'REQUIRE_PEER_REVIEW'
                                            ? 'This change will break downstream resources. Explicit confirmation is required.'
                                            : 'No downstream impact detected. This action is considered safe.'}
                                    </p>
                                </div>
                            </div>

                            {/* Impact Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#181C25] border border-white/5 p-4 rounded-lg">
                                    <div className="text-xl font-bold text-white mb-1">{totalImpact}</div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider">Broken Resources</div>
                                    {totalImpact > 0 && (
                                        <div className="mt-3 space-y-1.5 text-xs">
                                            {result.impact.brokenPipelines > 0 && <div className="flex justify-between text-slate-300"><span>Pipelines</span><span className="text-red-400">{result.impact.brokenPipelines}</span></div>}
                                            {result.impact.brokenApplications > 0 && <div className="flex justify-between text-slate-300"><span>Applications</span><span className="text-red-400">{result.impact.brokenApplications}</span></div>}
                                            {result.impact.brokenDashboards > 0 && <div className="flex justify-between text-slate-300"><span>Dashboards</span><span className="text-red-400">{result.impact.brokenDashboards}</span></div>}
                                        </div>
                                    )}
                                </div>
                                <div className="bg-[#181C25] border border-white/5 p-4 rounded-lg">
                                    <div className={`text-xl font-bold mb-1 ${result.impact.dataLossRisk ? 'text-red-400' : 'text-white'}`}>
                                        {result.impact.dataLossRisk ? 'Yes' : 'None'}
                                    </div>
                                    <div className="text-xs text-slate-400 uppercase tracking-wider">Data Loss Risk</div>
                                    {result.impact.dataLossRisk && (
                                        <div className="mt-3 text-xs text-red-400/80">
                                            This action destructively alters schema or data without recoverability.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-8">Simulation failed or returned no data.</div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-white/10 bg-[#181C25] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading || (result?.riskLevel === 'HIGH')}
                        className={`px-4 py-2 rounded text-sm font-bold shadow-lg transition-colors ${loading || (result?.riskLevel === 'HIGH')
                            ? 'bg-red-500/20 text-red-500/50 cursor-not-allowed border border-red-500/10'
                            : 'bg-red-600 hover:bg-red-500 text-white border border-red-500/30 shrink-0'
                            }`}
                    >
                        {result?.riskLevel === 'HIGH' ? 'LOCKED (HIGH RISK)' : 'Confirm Application'}
                    </button>
                </div>
            </div>
        </div>
    );
};
