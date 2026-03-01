// MembersView.jsx — Member Portal / KYC Registry
import { useMemo } from "react";
import { fmtUSD, fmtCHIT, clampRisk, riskColor } from "../helpers.js";

export default function MembersView({ data, searchQuery }) {
    if (!data) return null;
    const usdTotal = data.user.alphaBal + data.user.betaBal;

    const allMembers = useMemo(() => [
        {
            id: data.user.id, name: data.user.name, alphaBal: data.user.alphaBal,
            betaBal: data.user.betaBal, tradingBal: data.user.tradingBal,
            tier: data.user.tier, kycStatus: data.user.kycStatus, state: "AZ",
            pnl: data.user.pnl || 0, riskScore: 2, isCurrentUser: true,
        },
        ...data.customers,
    ], [data]);

    const filtered = useMemo(() => {
        if (!searchQuery) return allMembers;
        const q = searchQuery.toLowerCase();
        return allMembers.filter(m =>
            m.name.toLowerCase().includes(q) ||
            m.id.toLowerCase().includes(q) ||
            m.tier.toLowerCase().includes(q) ||
            m.kycStatus.toLowerCase().includes(q)
        );
    }, [allMembers, searchQuery]);

    const stats = useMemo(() => ({
        total: allMembers.length,
        verified: allMembers.filter(m => m.kycStatus === "Verified").length,
        fullAccess: allMembers.filter(m => m.tier === "Full Access").length,
        totalAUM: allMembers.reduce((s, m) => s + m.alphaBal + m.betaBal + m.tradingBal, 0),
    }), [allMembers]);

    return (
        <div className="fade-up" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                    { label: "Total Members", value: stats.total, note: "Registered", color: "var(--accent)" },
                    { label: "KYC Verified", value: stats.verified, note: "Active", color: "var(--green)" },
                    { label: "Full Access", value: stats.fullAccess, note: "Tier level", color: "var(--blue)" },
                    { label: "Total AUM", value: fmtUSD(stats.totalAUM), note: "USD + CHIT", color: "var(--amber)" },
                ].map(({ label, value, note, color }) => (
                    <div key={label} className="glass" style={{ padding: "16px 18px" }}>
                        <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</p>
                        <p style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>{value}</p>
                        <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>{note}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="glass" style={{ overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>KYC Member Registry</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{filtered.length} members</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                {["ID", "Member", "USD Balance", "CHIT Balance", "P&L", "State", "KYC", "Tier", "Risk"].map(h => (
                                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(m => (
                                <tr
                                    key={m.id}
                                    style={{
                                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                                        background: m.isCurrentUser ? "rgba(99,102,241,0.06)" : "transparent",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = m.isCurrentUser ? "rgba(99,102,241,0.10)" : "var(--bg-hover)"}
                                    onMouseLeave={e => e.currentTarget.style.background = m.isCurrentUser ? "rgba(99,102,241,0.06)" : "transparent"}
                                >
                                    <td style={{ padding: "11px 16px", fontSize: 11, fontFamily: "var(--font-mono)", color: m.isCurrentUser ? "var(--accent)" : "var(--text-3)" }}>{m.id}</td>
                                    <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--text-1)", fontWeight: m.isCurrentUser ? 600 : 400 }}>
                                        {m.name}{m.isCurrentUser && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--accent)" }}>(you)</span>}
                                    </td>
                                    <td style={{ padding: "11px 16px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-1)" }}>{fmtUSD(m.alphaBal + m.betaBal)}</td>
                                    <td style={{ padding: "11px 16px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-1)" }}>{fmtCHIT(m.tradingBal)}</td>
                                    <td style={{ padding: "11px 16px", fontSize: 12, fontFamily: "var(--font-mono)", color: m.pnl >= 0 ? "var(--green)" : "var(--red)" }}>
                                        {m.pnl >= 0 ? "+" : ""}{fmtUSD(m.pnl)}
                                    </td>
                                    <td style={{ padding: "11px 16px", fontSize: 12, color: "var(--text-3)" }}>{m.state}</td>
                                    <td style={{ padding: "11px 16px" }}>
                                        <span className={`badge ${m.kycStatus === "Verified" ? "badge-green" : m.kycStatus === "Pending" ? "badge-amber" : "badge-red"}`}>
                                            {m.kycStatus}
                                        </span>
                                    </td>
                                    <td style={{ padding: "11px 16px", fontSize: 11, color: "var(--text-2)" }}>{m.tier}</td>
                                    <td style={{ padding: "11px 16px" }}>
                                        {m.riskScore !== undefined && (
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <div style={{ width: 32, height: 4, borderRadius: 2, background: "var(--bg-hover)", overflow: "hidden" }}>
                                                    <div style={{ width: `${Math.min(m.riskScore, 100)}%`, height: "100%", background: riskColor(m.riskScore), borderRadius: 2, transition: "width 0.3s" }} />
                                                </div>
                                                <span style={{ fontSize: 10, color: riskColor(m.riskScore), fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                                                    {clampRisk(m.riskScore)}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
