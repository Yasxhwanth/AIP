"use client";

import { useState } from "react";
import {
    CheckCircle2, AlertTriangle, GitPullRequestDraft, Database, Shield, Zap,
    ArrowRight, ChevronRight, XCircle, ChevronDown, Check, Beaker, Play, Save, RotateCcw
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
//  SHARED STYLES
// ═══════════════════════════════════════════════════════════
const S = {
    topBar: {
        height: 44, display: "flex", alignItems: "center", padding: "0 14px",
        background: "#fff", borderBottom: "1px solid #CED9E0",
        gap: 8, flexShrink: 0, fontFamily: "Inter, sans-serif",
    } as React.CSSProperties,
    btn: (primary = false, danger = false): React.CSSProperties => ({
        height: 28, padding: "0 12px", borderRadius: 3, fontSize: 12, fontWeight: 600,
        cursor: "pointer",
        border: primary || danger ? "none" : "1px solid #CED9E0",
        background: danger ? "#DB3737" : primary ? "#137CBD" : "#fff",
        color: (primary || danger) ? "#fff" : "#394B59",
        display: "flex", alignItems: "center", gap: 6,
    }),
    cardBase: {
        background: "#fff", borderRadius: 4, border: "1px solid #CED9E0",
        boxShadow: "0 1px 3px rgba(16,22,26,0.05)"
    } as React.CSSProperties
};

// ═══════════════════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════════════════

const VALIDATION_CHECKS = [
    { label: "Ontology Schema Constraints", status: "pass", time: "0.2s" },
    { label: "Pipeline Dry-Run (500 records)", status: "pass", time: "1.4s" },
    { label: "Action Log Type Bindings", status: "warn", time: "0.1s", message: "Action 'Mark Inactive' missing reason parameter type." },
    { label: "Policy Coverage Checks", status: "pass", time: "0.3s" },
    { label: "Circular Dependency Detection", status: "pass", time: "0.0s" }
];

const CHANGE_SETS = [
    { type: "ONTOLOGY", action: "MODIFIED", id: "Account_History", details: "Added column `last_login_ip` (STRING)" },
    { type: "PIPELINE", action: "CREATED", id: "CRM_Account_Ext", details: "2 upstream datasets mapped to Account_History" },
    { type: "ACTION", action: "DELETED", id: "Legacy_Suspend", details: "Removed deprecated action type." },
    { type: "POLICY", action: "MODIFIED", id: "PII_Restriction", details: "Expanded mask overlay to 3 new roles." }
];

const DEPENDENCY_GRAPH = [
    { source: "CRM_Account_Ext", target: "Account_History" },
    { source: "Account_History", target: "PII_Restriction" },
    { source: "Account_History", target: "Dashboard_Executive_View" }
];

const AUDIT_HISTORY = [
    { id: "dep-7a8f9", env: "STAGING", by: "yashwanth.aip", date: "2 mins ago", status: "PENDING" },
    { id: "dep-7a8e2", env: "PRODUCTION", by: "System", date: "4 hrs ago", status: "SUCCESS" },
    { id: "dep-7a8d1", env: "STAGING", by: "sarah.pipeline", date: "Yesterday", status: "ROLLED_BACK" }
];

// ═══════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function PublishPage() {
    const [targetEnv, setTargetEnv] = useState<"STAGING" | "PRODUCTION">("STAGING");
    const [deployStep, setDeployStep] = useState<"VALIDATE" | "CONFIRM" | "DEPLOYING" | "SUCCESS">("VALIDATE");
    const [checkProgress, setCheckProgress] = useState(0);

    // Simulate validation running
    if (deployStep === "VALIDATE" && checkProgress === 0) {
        setTimeout(() => setCheckProgress(2), 600);
        setTimeout(() => setCheckProgress(5), 1400);
    }

    const runDeploy = async () => {
        setDeployStep("DEPLOYING");
        try {
            const { ApiClient } = await import('@/lib/apiClient');
            await ApiClient.post('/api/v1/projects/CURRENT_PROJECT/publish', {
                environment: targetEnv,
                version: "v1.30.9-rc"
            });
            setDeployStep("SUCCESS");
        } catch (err: any) {
            console.error("Deploy failed:", err);
            alert(`Deployment Failed: ${err.message || 'Unknown error'}`);
            setDeployStep("CONFIRM");
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F5F8FA", fontFamily: "Inter, sans-serif" }}>

            {/* ── TOP BAR ── */}
            <div style={S.topBar}>
                <div style={{ padding: "4px", background: "#EBF1F5", borderRadius: 4, display: "flex", alignItems: "center" }}>
                    <GitPullRequestDraft style={{ width: 14, height: 14, color: "#137CBD" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Publish Center</span>

                <div style={{ width: 1, height: 16, background: "#CED9E0", margin: "0 8px" }} />

                {/* Env Selector */}
                <span style={{ fontSize: 12, color: "#5C7080", fontWeight: 500 }}>Target Environment:</span>
                <div style={{ display: "flex", background: "#EBF1F5", padding: 2, borderRadius: 4 }}>
                    <button
                        onClick={() => setTargetEnv("STAGING")}
                        style={{
                            ...S.btn(targetEnv === "STAGING"), height: 24, padding: "0 10px",
                            background: targetEnv === "STAGING" ? "#fff" : "transparent",
                            border: targetEnv === "STAGING" ? "1px solid #CED9E0" : "none",
                            boxShadow: targetEnv === "STAGING" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                            color: targetEnv === "STAGING" ? "#182026" : "#5C7080"
                        }}>
                        <Beaker style={{ width: 12, height: 12, opacity: 0.8 }} /> Staging
                    </button>
                    <button
                        onClick={() => setTargetEnv("PRODUCTION")}
                        style={{
                            ...S.btn(targetEnv === "PRODUCTION"), height: 24, padding: "0 10px",
                            background: targetEnv === "PRODUCTION" ? "#fff" : "transparent",
                            border: targetEnv === "PRODUCTION" ? "1px solid #CED9E0" : "none",
                            boxShadow: targetEnv === "PRODUCTION" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                            color: targetEnv === "PRODUCTION" ? "#182026" : "#5C7080"
                        }}>
                        <Zap style={{ width: 12, height: 12, opacity: 0.8 }} /> Production
                    </button>
                </div>

                <div style={{ flex: 1 }} />

                <button style={{ ...S.btn(), color: "#DB3737" }}>Discard Changes</button>
                <button
                    onClick={() => deployStep === "VALIDATE" ? setDeployStep("CONFIRM") : runDeploy()}
                    disabled={deployStep === "DEPLOYING"}
                    style={S.btn(true)}>
                    {deployStep === "DEPLOYING" ? (
                        <>Publishing...</>
                    ) : (
                        <><Play style={{ width: 12, height: 12, fill: "white" }} /> Verify & Publish to {targetEnv}</>
                    )}
                </button>
            </div>

            {/* ── CONTENT BODY ── */}
            <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", gap: 24, maxWidth: 1200, margin: "0 auto", width: "100%" }}>

                {/* LEFT COLUMN - Checklist & Changes */}
                <div style={{ flex: "0 0 65%", display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* Validation Panel */}
                    <div style={{ ...S.cardBase, overflow: "hidden" }}>
                        <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #CED9E0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Shield style={{ width: 16, height: 16, color: "#137CBD" }} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Pre-Flight Validation</span>
                            </div>
                            <span style={{ fontSize: 11, color: "#5C7080", background: "#EBF1F5", padding: "2px 8px", borderRadius: 12 }}>
                                {checkProgress}/{VALIDATION_CHECKS.length} Checks run
                            </span>
                        </div>

                        <div style={{ background: "#FAFBFC", padding: 16 }}>
                            {VALIDATION_CHECKS.map((chk, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "flex-start", gap: 12, padding: "10px",
                                    borderBottom: i === VALIDATION_CHECKS.length - 1 ? "none" : "1px solid #EBF1F5",
                                    opacity: i < checkProgress ? 1 : 0.4
                                }}>
                                    {i >= checkProgress ? (
                                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #CED9E0" }} />
                                    ) : chk.status === "pass" ? (
                                        <CheckCircle2 style={{ width: 16, height: 16, color: "#0D8050" }} />
                                    ) : chk.status === "warn" ? (
                                        <AlertTriangle style={{ width: 16, height: 16, color: "#D9822B" }} />
                                    ) : (
                                        <XCircle style={{ width: 16, height: 16, color: "#DB3737" }} />
                                    )}

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: 12, fontWeight: 500, color: "#182026" }}>{chk.label}</span>
                                            <span style={{ fontSize: 11, color: "#8A9BA8" }}>{chk.time}</span>
                                        </div>
                                        {chk.message && (
                                            <div style={{ fontSize: 11, color: "#5C7080", marginTop: 4 }}>
                                                ↳ Warning: {chk.message}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Change Set Diff */}
                    <div style={{ ...S.cardBase, overflow: "hidden" }}>
                        <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #CED9E0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Database style={{ width: 16, height: 16, color: "#137CBD" }} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Proposed Structural Changes</span>
                            </div>
                            <span style={{ fontSize: 11, color: "#182026", fontWeight: 600 }}>
                                {CHANGE_SETS.length} files modified
                            </span>
                        </div>

                        <div style={{ padding: 0 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                <thead>
                                    <tr style={{ background: "#F5F8FA", borderBottom: "1px solid #CED9E0", color: "#5C7080" }}>
                                        <th style={{ padding: "8px 16px", textAlign: "left", fontWeight: 500, width: 80 }}>Type</th>
                                        <th style={{ padding: "8px 16px", textAlign: "left", fontWeight: 500, width: 90 }}>Action</th>
                                        <th style={{ padding: "8px 16px", textAlign: "left", fontWeight: 500 }}>Resource / Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {CHANGE_SETS.map((cs, i) => (
                                        <tr key={i} style={{ borderBottom: "1px solid #EBF1F5" }}>
                                            <td style={{ padding: "10px 16px", color: "#5C7080", fontSize: 11, fontWeight: 600 }}>{cs.type}</td>
                                            <td style={{ padding: "10px 16px" }}>
                                                <span style={{
                                                    padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 700,
                                                    background: cs.action === "CREATED" ? "#E3F2FD" : cs.action === "DELETED" ? "#FFEBEE" : "#FFF8E1",
                                                    color: cs.action === "CREATED" ? "#1976D2" : cs.action === "DELETED" ? "#C62828" : "#F57C00"
                                                }}>
                                                    {cs.action}
                                                </span>
                                            </td>
                                            <td style={{ padding: "10px 16px" }}>
                                                <div style={{ fontWeight: 600, color: "#182026", marginBottom: 2 }}>{cs.id}</div>
                                                <div style={{ color: "#5C7080", fontSize: 11 }}>{cs.details}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN - Impact Graph & Deploy */}
                <div style={{ flex: "0 0 35%", display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* Action Panel */}
                    <div style={{ ...S.cardBase, padding: 20, background: deployStep === "SUCCESS" ? "#E6F7F0" : "#fff" }}>
                        {deployStep === "SUCCESS" ? (
                            <div style={{ textAlign: "center", padding: "20px 0" }}>
                                <CheckCircle2 style={{ width: 40, height: 40, color: "#0D8050", margin: "0 auto 12px" }} />
                                <div style={{ fontSize: 16, fontWeight: 600, color: "#182026", marginBottom: 8 }}>Deployed Successfully</div>
                                <div style={{ fontSize: 12, color: "#5C7080", marginBottom: 20 }}>Version stamp <span style={{ fontFamily: 'monospace' }}>v1.30.9-rc</span> is now live in {targetEnv}.</div>

                                <button style={{ ...S.btn(), width: "100%", justifyContent: "center" }}>
                                    Go to Dashboard
                                </button>
                            </div>
                        ) : deployStep === "DEPLOYING" ? (
                            <div style={{ textAlign: "center", padding: "20px 0" }}>
                                <div style={{ width: 32, height: 32, border: "3px solid #EBF1F5", borderTopColor: "#137CBD", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
                                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#182026" }}>Deploying to {targetEnv}...</div>
                                <div style={{ fontSize: 12, color: "#5C7080", marginTop: 4 }}>Applying structural diffs atomically.</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#182026", marginBottom: 12 }}>Ready to Publish</div>
                                <div style={{ fontSize: 12, color: "#5C7080", marginBottom: 20, lineHeight: 1.5 }}>
                                    All pre-flight checks {checkProgress === 5 ? "passed" : "are running"}.
                                    This operation will lock the build state and increment the semantic version.
                                </div>
                                <div style={{ background: "#F5F8FA", padding: 12, borderRadius: 4, marginBottom: 20, fontSize: 11, color: "#182026" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                        <span style={{ color: "#5C7080" }}>Deployment Target:</span>
                                        <strong>{targetEnv} Pipeline</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ color: "#5C7080" }}>Estimated Downtime:</span>
                                        <strong>Zero (Blue/Green)</strong>
                                    </div>
                                </div>
                                <button
                                    onClick={runDeploy}
                                    style={{ ...S.btn(true), width: "100%", justifyContent: "center", height: 36, fontSize: 13 }}>
                                    Publish V1.30.9
                                </button>
                            </>
                        )}
                    </div>

                    {/* Dependency Graph Summary */}
                    <div style={{ ...S.cardBase, overflow: "hidden" }}>
                        <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #CED9E0" }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Downstream Impact</span>
                        </div>
                        <div style={{ padding: 16 }}>
                            <div style={{ fontSize: 11, color: "#5C7080", marginBottom: 16 }}>
                                These downstream resources will be automatically rebuilt based on schema changes.
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {DEPENDENCY_GRAPH.map((edge, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                                        <div style={{ flex: 1, padding: "6px 10px", background: "#F5F8FA", border: "1px solid #EBF1F5", borderRadius: 3, color: "#5C7080", textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {edge.source}
                                        </div>
                                        <ArrowRight style={{ width: 12, height: 12, color: "#8A9BA8" }} />
                                        <div style={{ flex: 1, padding: "6px 10px", background: "#E3F2FD", border: "1px solid #BBDEFB", color: "#1976D2", fontWeight: 600, borderRadius: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {edge.target}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div style={{ ...S.cardBase, overflow: "hidden" }}>
                        <div style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid #CED9E0" }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Recent Deployments</span>
                        </div>
                        <div style={{ padding: 0 }}>
                            {AUDIT_HISTORY.map((hist, i) => (
                                <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid #EBF1F5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: "#182026", marginBottom: 2 }}>
                                            {hist.id} <span style={{ fontSize: 10, fontWeight: 500, color: "#5C7080", background: "#EBF1F5", padding: "1px 4px", borderRadius: 2, marginLeft: 4 }}>{hist.env}</span>
                                        </div>
                                        <div style={{ fontSize: 10, color: "#8A9BA8" }}>by {hist.by} • {hist.date}</div>
                                    </div>

                                    {hist.status === "SUCCESS" ? (
                                        <CheckCircle2 style={{ width: 14, height: 14, color: "#0D8050" }} />
                                    ) : hist.status === "ROLLED_BACK" ? (
                                        <button style={{ ...S.btn(), height: 20, padding: "0 6px", fontSize: 10 }}>Rolled back</button>
                                    ) : (
                                        <span style={{ fontSize: 10, fontWeight: 600, color: "#D9822B" }}>PENDING</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
