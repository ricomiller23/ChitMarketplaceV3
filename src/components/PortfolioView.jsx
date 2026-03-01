// PortfolioView.jsx — Portfolio Intelligence Dashboard
import { useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { fmtUSD, fmtCHIT } from "../helpers.js";

export default function PortfolioView({ data, searchQuery }) {
    if (!data) return null;
    const usdTotal = data.user.alphaBal + data.user.betaBal;
    const chitValue = data.user.tradingBal * 1.00; // 1:1 USD
    const totalPortfolio = usdTotal + chitValue;

    const balanceHistory = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
        d: i,
        v: usdTotal + (Math.random() - 0.48) * usdTotal * 0.05,
    })), [usdTotal]);

    const txnsByDay = useMemo(() => {
        const last7 = Array.from({ length: 7 }, (_, i) => ({ d: `Day ${i + 1}`, buys: 0, sells: 0 }));
        data.transactions.forEach((t, i) => {
            const bucket = i % 7;
            if (t.type === "BUY") last7[bucket].buys++;
            else if (t.type === "SELL") last7[bucket].sells++;
        });
        return last7;
    }, [data.transactions]);

    return (
        <div className="fade-up" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Portfolio Summary Header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 14 }}>
                <div className="glass gradient-border" style={{ padding: "20px 24px" }}>
                    <p style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Total Portfolio Value</p>
                    <p style={{ fontSize: 36, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-1)", marginBottom: 6 }}>{fmtUSD(totalPortfolio)}</p>
                    <div style={{ display: "flex", gap: 12 }}>
                        <span className="badge badge-green">↑ 0.00% (24h)</span>
                        <span style={{ fontSize: 11, color: "var(--text-3)" }}>{data.user.tier}</span>
                    </div>
                </div>
                {[
                    { label: "Funding (USD)", value: fmtUSD(usdTotal), sub: `α ${fmtUSD(data.user.alphaBal)} · β ${fmtUSD(data.user.betaBal)}`, color: "var(--blue)" },
                    { label: "Trading (CHIT)", value: fmtCHIT(data.user.tradingBal), sub: "@ $1.00/CHIT", color: "var(--green)" },
                    { label: "Realized P&L", value: fmtUSD(data.user.pnlRealized || 0), sub: "All time", color: data.user.pnlRealized >= 0 ? "var(--green)" : "var(--red)" },
                ].map(({ label, value, sub, color }) => (
                    <div key={label} className="glass" style={{ padding: "16px 18px" }}>
                        <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</p>
                        <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>{value}</p>
                        <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>{sub}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                {/* Balance history chart */}
                <div className="glass" style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Funding Account Value — 30d</p>
                        <span className="badge badge-accent">Simulated</span>
                    </div>
                    <div style={{ height: 140 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={balanceHistory} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="d" hide />
                                <Tooltip
                                    contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11, fontFamily: "var(--font-mono)" }}
                                    formatter={v => [fmtUSD(v), "Value"]}
                                    labelStyle={{ color: "var(--text-3)" }}
                                />
                                <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} fill="url(#portGrad)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity bar chart */}
                <div className="glass" style={{ padding: "16px 20px" }}>
                    <div style={{ marginBottom: 16 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Trade Activity — 7d</p>
                    </div>
                    <div style={{ height: 140 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={txnsByDay} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                                <Bar dataKey="buys" fill="#4ade80" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="sells" fill="#f87171" radius={[3, 3, 0, 0]} />
                                <Tooltip
                                    contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
                                    labelStyle={{ color: "var(--text-3)" }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--green)" }} /><span style={{ fontSize: 10, color: "var(--text-3)" }}>Buys</span></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "var(--red)" }} /><span style={{ fontSize: 10, color: "var(--text-3)" }}>Sells</span></div>
                    </div>
                </div>
            </div>

            {/* Sub-account breakdown */}
            <div className="glass" style={{ padding: "16px 20px" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 16 }}>Sub-Account Breakdown</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                    {[
                        { label: "Alpha Fund (USD)", value: fmtUSD(data.user.alphaBal), pct: usdTotal > 0 ? (data.user.alphaBal / usdTotal * 100).toFixed(1) : "0.0", color: "var(--accent)" },
                        { label: "Beta Fund (USD)", value: fmtUSD(data.user.betaBal), pct: usdTotal > 0 ? (data.user.betaBal / usdTotal * 100).toFixed(1) : "0.0", color: "var(--blue)" },
                        { label: `Vault (CHIT) — ${data.user.vaultId}`, value: fmtCHIT(data.user.tradingBal), pct: "≈ " + fmtUSD(data.user.tradingBal), color: "var(--green)" },
                    ].map(({ label, value, pct, color }) => (
                        <div key={label} style={{ padding: "14px 16px", background: "var(--bg-hover)", borderRadius: 10, border: "1px solid var(--border)" }}>
                            <p style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 6 }}>{label}</p>
                            <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>{value}</p>
                            <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, fontFamily: "var(--font-mono)" }}>{pct}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent transactions */}
            <div className="glass" style={{ overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Transaction History</p>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                {["Date", "Receipt", "Type", "Asset", "From → To", "Status"].map(h => (
                                    <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.transactions.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: "28px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>No transactions yet. Start trading to see history.</td></tr>
                            ) : (
                                data.transactions.slice(0, 20).map(t => (
                                    <tr key={t.id}
                                        style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <td style={{ padding: "10px 16px", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{t.date}</td>
                                        <td style={{ padding: "10px 16px", fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{t.receiptId}</td>
                                        <td style={{ padding: "10px 16px" }}>
                                            <span className={`badge ${t.type === "BUY" ? "badge-green" : t.type === "SELL" ? "badge-red" : "badge-blue"}`}>{t.type}</span>
                                        </td>
                                        <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-1)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{t.asset}</td>
                                        <td style={{ padding: "10px 16px", fontSize: 11, color: "var(--text-3)" }}>{t.from} → {t.to}</td>
                                        <td style={{ padding: "10px 16px" }}>
                                            <span className={`badge ${t.status === "Delivered" ? "badge-green" : "badge-amber"}`}>{t.status}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
