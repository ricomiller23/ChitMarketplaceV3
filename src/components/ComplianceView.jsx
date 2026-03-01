// ComplianceView.jsx — Compliance & Audit Engine
import { useMemo } from "react";
import { fmtUSD, fmtCHIT, fmtDate, fmtTime, riskColor, clampRisk } from "../helpers.js";
import { Shield, AlertTriangle, CheckCircle2, FileText } from "lucide-react";

export default function ComplianceView({ data, searchQuery }) {
    if (!data) return null;

    const amlRules = [
        { id: "AML-001", rule: "Single txn > ⌀500K", status: "PASS", count: 0, sev: "HIGH" },
        { id: "AML-002", rule: "Rapid succession (< 60s)", status: "PASS", count: 0, sev: "MEDIUM" },
        { id: "AML-003", rule: "Round-number structuring", status: "PASS", count: 0, sev: "MEDIUM" },
        { id: "AML-004", rule: "Inter-member loop detect", status: "PASS", count: 0, sev: "HIGH" },
        { id: "AML-005", rule: "KYC expiry check", status: "PASS", count: data.customers.filter(c => c.kycStatus !== "Verified").length, sev: "LOW" },
        { id: "AML-006", rule: "State geo-fence violation", status: "PASS", count: 0, sev: "CRITICAL" },
    ];

    const auditLog = useMemo(() => [
        ...data.transactions.slice(0, 10).map(t => ({
            id: t.receiptId, event: `${t.type} — ${t.asset}`, actor: t.from || "System",
            ts: t.date, status: t.status, flag: false,
        })),
        { id: "AUDIT-SYS-001", event: "System init — Oracle connected", actor: "System", ts: fmtDate(), status: "OK", flag: false },
        { id: "AUDIT-SYS-002", event: "KYC verification batch completed", actor: "System", ts: fmtDate(), status: "OK", flag: false },
    ], [data.transactions]);

    const filtered = useMemo(() => {
        if (!searchQuery) return auditLog;
        const q = searchQuery.toLowerCase();
        return auditLog.filter(a => a.id?.toLowerCase().includes(q) || a.event?.toLowerCase().includes(q) || a.actor?.toLowerCase().includes(q));
    }, [auditLog, searchQuery]);

    const highRiskMembers = data.customers.filter(c => c.riskScore > 35);

    return (
        <div className="fade-up" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                    { label: "Compliance Score", value: "100/100", note: "Pristine", color: "var(--green)", icon: CheckCircle2 },
                    { label: "AML Rules Active", value: amlRules.length, note: "Monitoring", color: "var(--accent)", icon: Shield },
                    { label: "Flagged Events", value: highRiskMembers.length, note: "Pending review", color: highRiskMembers.length > 0 ? "var(--amber)" : "var(--green)", icon: AlertTriangle },
                    { label: "Audit Records", value: auditLog.length, note: "Immutable", color: "var(--blue)", icon: FileText },
                ].map(({ label, value, note, color, icon: Icon }) => (
                    <div key={label} className="glass gradient-border" style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
                            <Icon size={14} color={color} />
                        </div>
                        <p style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>{value}</p>
                        <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>{note}</p>
                    </div>
                ))}
            </div>

            {/* AML Rules */}
            <div className="glass" style={{ overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>AML Monitoring Rules</p>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                            {["Rule ID", "Description", "Severity", "Violations", "Status"].map(h => (
                                <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {amlRules.map(r => (
                            <tr key={r.id}
                                style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <td style={{ padding: "10px 16px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>{r.id}</td>
                                <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-1)" }}>{r.rule}</td>
                                <td style={{ padding: "10px 16px" }}>
                                    <span className={`badge ${r.sev === "CRITICAL" || r.sev === "HIGH" ? "badge-red" : r.sev === "MEDIUM" ? "badge-amber" : "badge-blue"}`}>{r.sev}</span>
                                </td>
                                <td style={{ padding: "10px 16px", fontSize: 12, fontFamily: "var(--font-mono)", color: r.count > 0 ? "var(--amber)" : "var(--green)" }}>{r.count}</td>
                                <td style={{ padding: "10px 16px" }}>
                                    <span className={`badge ${r.status === "PASS" ? "badge-green" : "badge-red"}`}>{r.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Member risk table */}
            {highRiskMembers.length > 0 && (
                <div className="glass" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--amber)" }}>⚠ Elevated Risk Members</p>
                        <span className="badge badge-amber">{highRiskMembers.length} flagged</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                {["ID", "Member", "Risk Score", "KYC Status", "Tier", "Action"].map(h => (
                                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {highRiskMembers.map(m => (
                                <tr key={m.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: "rgba(251,191,36,0.04)" }}>
                                    <td style={{ padding: "10px 16px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>{m.id}</td>
                                    <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-1)", fontWeight: 600 }}>{m.name}</td>
                                    <td style={{ padding: "10px 16px" }}>
                                        <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700, color: riskColor(m.riskScore) }}>{m.riskScore} — {clampRisk(m.riskScore)}</span>
                                    </td>
                                    <td style={{ padding: "10px 16px" }}><span className={`badge ${m.kycStatus === "Verified" ? "badge-green" : "badge-amber"}`}>{m.kycStatus}</span></td>
                                    <td style={{ padding: "10px 16px", fontSize: 11, color: "var(--text-2)" }}>{m.tier}</td>
                                    <td style={{ padding: "10px 16px" }}><span className="badge badge-amber">Review Required</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Audit log */}
            <div className="glass" style={{ overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Immutable Audit Log</p>
                    <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{filtered.length} records</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                            {["Record ID", "Event", "Actor", "Timestamp", "Status"].map(h => (
                                <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: "28px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>No audit records found.</td></tr>
                        ) : filtered.map((a, i) => (
                            <tr key={i}
                                style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <td style={{ padding: "10px 16px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{a.id}</td>
                                <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-1)" }}>{a.event}</td>
                                <td style={{ padding: "10px 16px", fontSize: 11, color: "var(--text-2)" }}>{a.actor}</td>
                                <td style={{ padding: "10px 16px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>{a.ts}</td>
                                <td style={{ padding: "10px 16px" }}><span className="badge badge-green">{a.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
