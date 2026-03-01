"use client";
import React, { useState } from "react";
import {
    Globe, Server, Box, CheckCircle2, AlertTriangle, XCircle, Info,
    History, GitCommit, ChevronRight, Play, Rocket, RotateCcw,
    Zap, Database, Shield, FileText, Check, ArrowRight, UploadCloud,
    Layers, Settings
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type Environment = "development" | "staging" | "production";
type CheckStatus = "passed" | "warning" | "failed" | "pending";

interface ValidationCheck {
    id: string;
    name: string;
    status: CheckStatus;
    message: string;
    category: "linter" | "schema" | "data-health" | "security" | "tests";
    details?: string[];
}

interface DiffItem {
    type: "added" | "modified" | "removed";
    resourceType: string;
    name: string;
    detail: string;
}

interface ReleaseVersion {
    id: string;
    version: string;
    timestamp: string;
    author: string;
    description: string;
    environment: Environment | null;
    checks: ValidationCheck[];
    diff: DiffItem[];
}

// ── Seed Data ──────────────────────────────────────────────────────────────
const CURRENT_CHECKS: ValidationCheck[] = [
    { id: "c1", category: "linter", name: "Foundry Pipeline Linter", status: "passed", message: "0 errors, 2 warnings (unused variables optimized out)." },
    { id: "c2", category: "schema", name: "Ontology Schema Validation", status: "passed", message: "Schema modifications are backwards compatible." },
    { id: "c3", category: "data-health", name: "Upstream Data Health", status: "passed", message: "All 14 connected datasets are passing health checks." },
    { id: "c4", category: "security", name: "RBAC & Marking Verification", status: "passed", message: "No security downgrades detected. Markings preserved." },
    { id: "c5", category: "tests", name: "E2E Integration Tests", status: "warning", message: "1 non-critical timeout in module `Reporting_Dashboard`.", details: ["Test `exportToPDF` failed after 30s. Module marked as unstable."] },
];

const CURRENT_DIFF: DiffItem[] = [
    { type: "added", resourceType: "Metric", name: "Drone Telemetry Agg...", detail: "Streaming metric (Flink pipeline)" },
    { type: "modified", resourceType: "ActionType", name: "EscalateMission", detail: "Added fields: `escalatedBy`, `approvedBy`" },
    { type: "modified", resourceType: "AIPAgent", name: "Mission Ops Assistant", detail: "Guardrail update: Token limit 4096 → 8192" },
    { type: "removed", resourceType: "Role", name: "Legacy_Analyst_Role", detail: "Role deprecated and fully removed" },
];

const RELEASE_HISTORY: ReleaseVersion[] = [
    {
        id: "r1", version: "v2.5.0-rc.1", timestamp: "Just now", author: "Sarah Chen",
        description: "Added AI Risk Config, new telemetry metric, adjusted RBAC roles.",
        environment: null, // Pending deploy
        checks: CURRENT_CHECKS,
        diff: CURRENT_DIFF
    },
    {
        id: "r2", version: "v2.4.1", timestamp: "2026-03-01 09:12", author: "James Okoro",
        description: "Hotfix: Mission Operations Center UI layout bug on smaller screens.",
        environment: "production",
        checks: [
            { id: "c1", category: "linter", name: "Foundry Pipeline Linter", status: "passed", message: "0 errors." },
            { id: "c2", category: "tests", name: "E2E Integration Tests", status: "passed", message: "All 412 tests passed." }
        ],
        diff: [
            { type: "modified", resourceType: "WorkshopApp", name: "Mission Operations Center", detail: "Layout grid updated." }
        ]
    },
    {
        id: "r3", version: "v2.4.0", timestamp: "2026-02-28 14:30", author: "System Auto-Deploy",
        description: "Major release: Ontology V2 schema integration.",
        environment: "staging",
        checks: [
            { id: "c1", category: "schema", name: "Ontology Schema Validation", status: "passed", message: "Schema upgrade complete." },
        ],
        diff: [
            { type: "added", resourceType: "ObjectType", name: "Pilot", detail: "New object." },
            { type: "added", resourceType: "ObjectType", name: "Drone", detail: "New object." }
        ]
    },
    {
        id: "r4", version: "v2.3.9", timestamp: "2026-02-15 11:22", author: "Sarah Chen",
        description: "Rollback to v2.3.9 due to upstream data sync error in v2.4.0-rc1.",
        environment: null,
        checks: [], diff: []
    },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const ENV_COLOR: Record<Environment, string> = {
    development: "#5C7080",
    staging: "#D9822B",
    production: "#0D8050"
};

const STATUS_ICONS: Record<CheckStatus, { icon: React.ElementType, color: string }> = {
    passed: { icon: CheckCircle2, color: "#0D8050" },
    warning: { icon: AlertTriangle, color: "#D9822B" },
    failed: { icon: XCircle, color: "#C23030" },
    pending: { icon: RotateCcw, color: "#5C7080" }
};

const DIFF_COLORS = {
    added: { bg: "#E6F7F0", fg: "#0D8050", prefix: "+" },
    modified: { bg: "#FFF3E0", fg: "#D9822B", prefix: "~" },
    removed: { bg: "#FFF0F0", fg: "#C23030", prefix: "−" }
};

// ── Main Page ──────────────────────────────────────────────────────────────
export default function PublishPage() {
    const [selVer, setSelVer] = useState<ReleaseVersion>(RELEASE_HISTORY[0]);
    const [targetEnv, setTargetEnv] = useState<Environment>("staging");
    const [isDeploying, setIsDeploying] = useState(false);

    const isPendingDeploy = selVer.id === RELEASE_HISTORY[0].id; // The top unreleased version
    const isRollback = !isPendingDeploy && selVer.environment !== "production";

    const handleDeploy = () => {
        setIsDeploying(true);
        setTimeout(() => {
            setIsDeploying(false);
            // Fakes the deploy for the demo
            alert(`Successfully deployed ${selVer.version} to ${targetEnv.toUpperCase()} space.`);
        }, 1500);
    };

    const hasErrors = selVer.checks.some(c => c.status === "failed");

    return (
        <div style={{ display: "flex", height: "100%", background: "#F5F8FA", fontFamily: "Inter,sans-serif" }}>

            {/* ── LEFT: Version History ── */}
            <div style={{ width: 320, background: "#fff", borderRight: "1px solid #CED9E0", display: "flex", flexDirection: "column" }}>

                <div style={{ padding: "12px 16px", borderBottom: "1px solid #CED9E0", display: "flex", alignItems: "center", gap: 8 }}>
                    <History style={{ width: 14, height: 14, color: "#5C7080" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#182026", textTransform: "uppercase", letterSpacing: "0.05em" }}>Release History</span>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
                    {RELEASE_HISTORY.map((v, i) => {
                        const isSel = selVer.id === v.id;
                        return (
                            <div key={v.id} onClick={() => setSelVer(v)}
                                style={{
                                    padding: "12px 16px", cursor: "pointer", borderLeft: isSel ? "3px solid #137CBD" : "3px solid transparent",
                                    background: isSel ? "rgba(19,124,189,0.05)" : "transparent", position: "relative",
                                    borderBottom: "1px solid #EBF1F5"
                                }}>

                                {/* Connector line for timeline */}
                                {i < RELEASE_HISTORY.length - 1 && (
                                    <div style={{ position: "absolute", left: 24, top: 32, bottom: -12, width: 2, background: "#EBF1F5" }} />
                                )}

                                <div style={{ display: "flex", gap: 10 }}>
                                    <div style={{
                                        width: 16, height: 16, borderRadius: "50%", border: "2px solid #CED9E0", background: "#fff", zIndex: 1, marginTop: 2,
                                        display: "flex", alignItems: "center", justifyContent: "center"
                                    }}>
                                        {isSel && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#137CBD" }} />}
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: "#182026", fontFamily: "monospace" }}>{v.version}</span>
                                            {v.environment && (
                                                <span style={{
                                                    fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3,
                                                    background: `${ENV_COLOR[v.environment]}15`, color: ENV_COLOR[v.environment], textTransform: "uppercase"
                                                }}>
                                                    {v.environment}
                                                </span>
                                            )}
                                            {!v.environment && i === 0 && (
                                                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: "#EBF1F5", color: "#5C7080" }}>DRAFT</span>
                                            )}
                                        </div>

                                        <div style={{
                                            fontSize: 11, color: "#5C7080", marginBottom: 6, lineHeight: 1.4,
                                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                                        }}>
                                            {v.description}
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 10, color: "#8A9BA8" }}>
                                            <span>{v.author}</span>
                                            <span>{v.timestamp}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── CENTER: Validation & Diff ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, borderRight: "1px solid #CED9E0" }}>

                {/* Header */}
                <div style={{ padding: "20px 24px", background: "#fff", borderBottom: "1px solid #CED9E0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: "#182026", fontFamily: "monospace" }}>{selVer.version}</span>
                        {isPendingDeploy && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: "#EBF1F5", color: "#5C7080", fontWeight: 600 }}>Unpublished Release Candidate</span>}
                        {isRollback && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: "rgba(217,130,43,0.15)", color: "#D9822B", fontWeight: 600 }}>Previous Version</span>}
                    </div>
                    <div style={{ fontSize: 13, color: "#5C7080", lineHeight: 1.5 }}>
                        {selVer.description}
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* Validation Checklist */}
                    <div>
                        <h3 style={{ fontSize: 12, fontWeight: 700, color: "#182026", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                            <Shield style={{ width: 14, height: 14, color: "#5C7080" }} /> Pre-flight Validation
                        </h3>

                        <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 6, overflow: "hidden" }}>
                            {selVer.checks.length === 0 ? (
                                <div style={{ padding: 20, textAlign: "center", color: "#8A9BA8", fontSize: 12 }}>No validation data available for this version.</div>
                            ) : (
                                selVer.checks.map((chk, i) => {
                                    const SIcon = STATUS_ICONS[chk.status].icon;
                                    return (
                                        <div key={chk.id} style={{ padding: "12px 16px", borderBottom: i < selVer.checks.length - 1 ? "1px solid #EBF1F5" : "none", display: "flex", gap: 12 }}>
                                            <SIcon style={{ width: 16, height: 16, color: STATUS_ICONS[chk.status].color, flexShrink: 0, marginTop: 2 }} />
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: "#182026", marginBottom: 2 }}>{chk.name}</div>
                                                <div style={{ fontSize: 12, color: "#5C7080" }}>{chk.message}</div>
                                                {chk.details && chk.details.length > 0 && (
                                                    <div style={{ marginTop: 8, padding: "8px 12px", background: "#F5F8FA", borderRadius: 4, fontSize: 11, color: "#394B59", fontFamily: "monospace" }}>
                                                        {chk.details.map((d, idx) => <div key={idx}>• {d}</div>)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Change Diff */}
                    <div>
                        <h3 style={{ fontSize: 12, fontWeight: 700, color: "#182026", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                            <GitCommit style={{ width: 14, height: 14, color: "#5C7080" }} /> Change Summary
                        </h3>

                        <div style={{ background: "#fff", border: "1px solid #CED9E0", borderRadius: 6, overflow: "hidden" }}>
                            {selVer.diff.length === 0 ? (
                                <div style={{ padding: 20, textAlign: "center", color: "#8A9BA8", fontSize: 12 }}>No structural changes recorded.</div>
                            ) : (
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                    <thead>
                                        <tr style={{ background: "#F5F8FA", borderBottom: "1px solid #CED9E0", textAlign: "left" }}>
                                            <th style={{ padding: "8px 16px", fontWeight: 600, color: "#5C7080", width: 40 }}>Op</th>
                                            <th style={{ padding: "8px 16px", fontWeight: 600, color: "#5C7080", width: 120 }}>Resource</th>
                                            <th style={{ padding: "8px 16px", fontWeight: 600, color: "#5C7080" }}>Item</th>
                                            <th style={{ padding: "8px 16px", fontWeight: 600, color: "#5C7080" }}>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selVer.diff.map((d, i) => {
                                            const dc = DIFF_COLORS[d.type];
                                            return (
                                                <tr key={i} style={{ borderBottom: i < selVer.diff.length - 1 ? "1px solid #EBF1F5" : "none" }}>
                                                    <td style={{ padding: "10px 16px", color: dc.fg, fontWeight: 700, background: `${dc.bg}50` }}>{dc.prefix}</td>
                                                    <td style={{ padding: "10px 16px", color: "#5C7080", fontFamily: "monospace", fontSize: 11 }}>{d.resourceType}</td>
                                                    <td style={{ padding: "10px 16px", color: "#182026", fontWeight: 500 }}>{d.name}</td>
                                                    <td style={{ padding: "10px 16px", color: "#5C7080" }}>{d.detail}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* ── RIGHT: Deployment Action ── */}
            <div style={{ width: 340, background: "#fff", display: "flex", flexDirection: "column" }}>

                <div style={{ padding: "16px", borderBottom: "1px solid #CED9E0" }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: "#182026", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                        <Rocket style={{ width: 18, height: 18, color: "#137CBD" }} /> Deployment
                    </h2>
                </div>

                <div style={{ padding: 20, flex: 1 }}>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#182026", marginBottom: 8 }}>Target Space (Environment)</label>
                        <div style={{ border: "1px solid #CED9E0", borderRadius: 4, overflow: "hidden" }}>
                            <div onClick={() => setTargetEnv("staging")} style={{ padding: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: targetEnv === "staging" ? "#F5F8FA" : "#fff", borderBottom: "1px solid #EBF1F5" }}>
                                <div style={{ width: 16, height: 16, borderRadius: "50%", border: `4px solid ${targetEnv === "staging" ? "#137CBD" : "#CED9E0"}` }} />
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Staging</div>
                                    <div style={{ fontSize: 11, color: "#5C7080" }}>Pre-production testing space</div>
                                </div>
                            </div>
                            <div onClick={() => setTargetEnv("production")} style={{ padding: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: targetEnv === "production" ? "#F5F8FA" : "#fff" }}>
                                <div style={{ width: 16, height: 16, borderRadius: "50%", border: `4px solid ${targetEnv === "production" ? "#137CBD" : "#CED9E0"}` }} />
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#182026" }}>Production</div>
                                    <div style={{ fontSize: 11, color: "#5C7080" }}>Live user-facing workspace</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: 16, background: "#F5F8FA", borderRadius: 6, marginBottom: 24 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                            <span style={{ color: "#5C7080" }}>Selected Version:</span>
                            <span style={{ fontWeight: 600, color: "#182026", fontFamily: "monospace" }}>{selVer.version}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                            <span style={{ color: "#5C7080" }}>Action:</span>
                            <span style={{ fontWeight: 600, color: isRollback ? "#D9822B" : "#137CBD" }}>
                                {isRollback ? "Rollback Release" : "Advance Release"}
                            </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                            <span style={{ color: "#5C7080" }}>Validation:</span>
                            <span style={{ fontWeight: 600, color: hasErrors ? "#C23030" : "#0D8050" }}>
                                {hasErrors ? "Failed Checks" : "All Checks Passed"}
                            </span>
                        </div>
                    </div>

                    {hasErrors ? (
                        <div style={{ padding: 12, background: "rgba(194,48,48,0.1)", border: "1px solid #C23030", borderRadius: 4, display: "flex", gap: 8, marginBottom: 16 }}>
                            <AlertTriangle style={{ width: 16, height: 16, color: "#C23030", flexShrink: 0 }} />
                            <div style={{ fontSize: 12, color: "#C23030", lineHeight: 1.4 }}>
                                <strong>Deployment Blocked.</strong> Resolve all failing pre-flight validation checks before releasing to {targetEnv}.
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleDeploy}
                            disabled={isDeploying}
                            style={{ width: "100%", padding: 14, background: isRollback ? "#D9822B" : "#0D8050", color: "#fff", border: "none", borderRadius: 4, cursor: isDeploying ? "wait" : "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.1)", transition: "all 0.2s" }}
                        >
                            {isDeploying ? (
                                <>Deploying... <span style={{ animation: "spin 1s linear infinite" }}>⏳</span></>
                            ) : (
                                <>
                                    {isRollback ? <RotateCcw style={{ width: 16, height: 16 }} /> : <UploadCloud style={{ width: 16, height: 16 }} />}
                                    {isRollback ? "Rollback " : "Deploy "} to {targetEnv.charAt(0).toUpperCase() + targetEnv.slice(1)}
                                </>
                            )}
                        </button>
                    )}

                </div>

            </div>

        </div>
    );
}
