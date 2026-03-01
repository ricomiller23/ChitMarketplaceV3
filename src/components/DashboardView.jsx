// DashboardView.jsx — Trade Terminal with orderbook, sparklines, live feed, transaction ledger
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Activity } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { fmtUSD, fmtCHIT, fmtCHITShort, genOrderBook } from "../helpers.js";

const BOOK = genOrderBook();

function StatCard({ label, value, count, icon: Icon, color }) {
    return (
        <div className="glass gradient-border" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</span>
                <Icon size={14} color={color} style={{ opacity: 0.8 }} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-1)" }}>{value}</p>
            <p style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 4 }}>{count} transactions</p>
        </div>
    );
}

function OrderBook() {
    return (
        <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Order Book</span>
                <span className="badge badge-green">Live</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                {/* Asks */}
                <div style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: "var(--text-3)" }}>Price</span>
                        <span style={{ fontSize: 10, color: "var(--text-3)" }}>Qty</span>
                    </div>
                    {BOOK.asks.slice(0, 8).map((row, i) => {
                        const maxQ = Math.max(...BOOK.asks.map(r => r.qty));
                        const pct = (row.qty / maxQ * 100).toFixed(0);
                        return (
                            <div key={i} style={{
                                position: "relative", display: "flex", justifyContent: "space-between",
                                padding: "2px 4px", fontSize: 11, fontFamily: "var(--font-mono)",
                            }}>
                                <div className="ob-bar-ask" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${pct}%`, borderRadius: 2 }} />
                                <span style={{ color: "var(--red)", position: "relative" }}>${row.price}</span>
                                <span style={{ color: "var(--text-2)", position: "relative" }}>{(row.qty / 1000).toFixed(1)}K</span>
                            </div>
                        );
                    })}
                </div>
                {/* Bids */}
                <div style={{ padding: "8px 12px", borderLeft: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: "var(--text-3)" }}>Price</span>
                        <span style={{ fontSize: 10, color: "var(--text-3)" }}>Qty</span>
                    </div>
                    {BOOK.bids.slice(0, 8).map((row, i) => {
                        const maxQ = Math.max(...BOOK.bids.map(r => r.qty));
                        const pct = (row.qty / maxQ * 100).toFixed(0);
                        return (
                            <div key={i} style={{
                                position: "relative", display: "flex", justifyContent: "space-between",
                                padding: "2px 4px", fontSize: 11, fontFamily: "var(--font-mono)",
                            }}>
                                <div className="ob-bar-bid" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, borderRadius: 2 }} />
                                <span style={{ color: "var(--green)", position: "relative" }}>${row.price}</span>
                                <span style={{ color: "var(--text-2)", position: "relative" }}>{(row.qty / 1000).toFixed(1)}K</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--green)" }}>$1.0000</span>
                <span style={{ fontSize: 10, color: "var(--text-3)", marginLeft: 8 }}>MARK PRICE</span>
            </div>
        </div>
    );
}

export default function DashboardView({ data, chartData, filteredTxns, activeTab, setActiveTab, searchQuery }) {
    if (!data) return null;

    const filtered = useMemo(() => {
        if (!searchQuery) return filteredTxns;
        const q = searchQuery.toLowerCase();
        return filteredTxns.filter(t =>
            t.receiptId?.toLowerCase().includes(q) ||
            t.from?.toLowerCase().includes(q) ||
            t.to?.toLowerCase().includes(q) ||
            t.type?.toLowerCase().includes(q)
        );
    }, [filteredTxns, searchQuery]);

    const recentActivity = data.transactions.slice(0, 5);

    return (
        <div className="fade-up" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                <StatCard label="Buy Orders" value={fmtCHITShort(data.treasury.buyVolume)} count={data.treasury.buyCount} icon={TrendingUp} color="var(--green)" />
                <StatCard label="Sell Orders" value={fmtCHITShort(data.treasury.sellVolume)} count={data.treasury.sellCount} icon={TrendingDown} color="var(--red)" />
                <StatCard label="Redemptions" value={fmtCHITShort(data.treasury.redemptions)} count={data.treasury.redemptionCount} icon={RefreshCw} color="var(--amber)" />
            </div>

            {/* Charts + Orderbook row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                {/* Charts */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                        {[
                            { label: "Buys", key: "buys", color: "#4ade80" },
                            { label: "Sells", key: "sells", color: "#f87171" },
                            { label: "Xfers", key: "xfers", color: "#93c5fd" },
                        ].map(({ label, key, color }) => (
                            <div key={key} className="glass" style={{ padding: "12px 14px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
                                    <Activity size={11} color={color} />
                                </div>
                                <div style={{ height: 56 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData[key]} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#grad-${key})`} dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Market summary bar */}
                    <div className="glass" style={{ padding: "10px 16px", display: "flex", gap: 28 }}>
                        {[
                            ["Assurance Reserve", fmtUSD(data.treasury.usd)],
                            ["Treasury CHITs", fmtCHIT(data.treasury.chits)],
                            ["Listed for Sale", `⌀${data.treasury.listedForSale.toLocaleString()}`],
                            ["Circulation", `⌀${data.treasury.circulation.toLocaleString()}`],
                            ["Reserve Ratio", `${data.treasury.reserveRatio}%`],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <p style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 2 }}>{label}</p>
                                <p style={{ fontSize: 12, color: "var(--text-1)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Orderbook */}
                <OrderBook />
            </div>

            {/* Recent Activity + Ledger row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2.5fr", gap: 14 }}>
                {/* Activity Feed */}
                <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Recent Activity</span>
                    </div>
                    <div style={{ padding: "8px 0" }}>
                        {recentActivity.length === 0 ? (
                            <p style={{ fontSize: 12, color: "var(--text-3)", padding: "12px 16px", textAlign: "center" }}>No activity yet.</p>
                        ) : (
                            recentActivity.map((t, i) => (
                                <div key={t.id} style={{
                                    padding: "10px 16px", borderBottom: i < recentActivity.length - 1 ? "1px solid var(--border)" : "none",
                                    display: "flex", flexDirection: "column", gap: 3,
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span className={`badge ${t.type === "BUY" ? "badge-green" : t.type === "SELL" ? "badge-red" : "badge-blue"}`}>
                                            {t.type}
                                        </span>
                                        <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{t.date}</span>
                                    </div>
                                    <span style={{ fontSize: 12, color: "var(--text-1)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{t.asset}</span>
                                    <span style={{ fontSize: 10, color: "var(--text-3)" }}>{t.receiptId}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Transaction Ledger */}
                <div className="glass" style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                        {["Trades", "Listed", "Pending"].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                background: "none", border: "none",
                                fontSize: 13, fontWeight: activeTab === tab ? 700 : 400,
                                color: activeTab === tab ? "var(--text-1)" : "var(--text-3)",
                                borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                                paddingBottom: 4,
                            }}>
                                {tab}
                                {tab === "Pending" && data.transactions.filter(t => t.status === "Pending").length > 0 && (
                                    <span style={{ marginLeft: 6, background: "var(--amber-dim)", color: "var(--amber)", fontSize: 9, padding: "1px 5px", borderRadius: 100, fontWeight: 700 }}>
                                        {data.transactions.filter(t => t.status === "Pending").length}
                                    </span>
                                )}
                            </button>
                        ))}
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{filtered.length} records</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                    {["Date", "Receipt ID", "Type", "From", "To", "Asset", "Status"].map(h => (
                                        <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
                                        No {activeTab.toLowerCase()} records found.
                                    </td></tr>
                                ) : (
                                    filtered.slice(0, 15).map(t => (
                                        <tr key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                                            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        >
                                            <td style={{ padding: "10px 16px", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{t.date}</td>
                                            <td style={{ padding: "10px 16px", fontSize: 11, color: "var(--text-1)", fontFamily: "var(--font-mono)" }}>{t.receiptId}</td>
                                            <td style={{ padding: "10px 16px" }}>
                                                <span className={`badge ${t.type === "BUY" ? "badge-green" : t.type === "SELL" ? "badge-red" : t.type === "XFER" ? "badge-blue" : "badge-amber"}`}>
                                                    {t.type}
                                                </span>
                                            </td>
                                            <td style={{ padding: "10px 16px", fontSize: 11, color: "var(--text-3)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.from}</td>
                                            <td style={{ padding: "10px 16px", fontSize: 11, color: "var(--text-3)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.to}</td>
                                            <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-1)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{t.asset}</td>
                                            <td style={{ padding: "10px 16px" }}>
                                                <span className={`badge ${t.status === "Delivered" ? "badge-green" : "badge-blue"}`}>{t.status}</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
