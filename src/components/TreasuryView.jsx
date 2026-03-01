// TreasuryView.jsx — Treasury Command Center
import { fmtUSD, fmtCHIT } from "../helpers.js";
import { TREASURY_INITIAL_CHITS } from "../constants.js";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { AlertTriangle, CheckCircle2, Shield, Zap } from "lucide-react";

export default function TreasuryView({ data, onToggleCircuitBreaker }) {
    if (!data) return null;
    const { treasury } = data;
    const utilization = ((TREASURY_INITIAL_CHITS - treasury.chits) / TREASURY_INITIAL_CHITS * 100).toFixed(2);
    const reserveRatio = treasury.reserveRatio;

    const supplyBreakdown = [
        { label: "Available (Treasury)", value: treasury.chits, color: "var(--accent)", pct: (treasury.chits / TREASURY_INITIAL_CHITS * 100).toFixed(1) },
        { label: "In Circulation", value: treasury.circulation, color: "var(--green)", pct: (treasury.circulation / TREASURY_INITIAL_CHITS * 100).toFixed(1) },
        { label: "Listed for Sale", value: treasury.listedForSale, color: "var(--amber)", pct: (treasury.listedForSale / TREASURY_INITIAL_CHITS * 100).toFixed(1) },
        { label: "Redeemed", value: TREASURY_INITIAL_CHITS - treasury.chits - treasury.circulation, color: "var(--text-3)", pct: "—" },
    ];

    const reserveHistory = Array.from({ length: 24 }, (_, i) => ({
        h: `${i}:00`, ratio: 99.5 + Math.random() * 0.5,
    }));

    return (
        <div className="fade-up" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Top metric cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                    { label: "Assurance Reserve", value: fmtUSD(treasury.usd), color: "var(--blue)", note: "USD backing" },
                    { label: "Treasury CHIT Supply", value: fmtCHIT(treasury.chits), color: "var(--green)", note: `Initial: ⌀${(TREASURY_INITIAL_CHITS / 1e6).toFixed(0)}M` },
                    { label: "Reserve Ratio", value: `${reserveRatio}%`, color: reserveRatio >= 99 ? "var(--green)" : "var(--amber)", note: "Target: 100%" },
                    { label: "Supply Utilization", value: `${utilization}%`, color: "var(--accent)", note: "% issued from initial" },
                ].map(({ label, value, note, color }) => (
                    <div key={label} className="glass gradient-border" style={{ padding: "16px 18px" }}>
                        <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</p>
                        <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>{value}</p>
                        <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>{note}</p>
                    </div>
                ))}
            </div>

            {/* Reserve ratio gauge + circuit breaker */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Reserve Ratio gauge chart */}
                <div className="glass" style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>Reserve Ratio — 24h</p>
                        <span className="badge badge-green">99.97%</span>
                    </div>
                    <div style={{ height: 120 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={reserveHistory} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="reserveGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="h" hide />
                                <Tooltip
                                    contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
                                    formatter={v => [`${v.toFixed(4)}%`, "Reserve Ratio"]}
                                />
                                <Area type="monotone" dataKey="ratio" stroke="#4ade80" strokeWidth={1.5} fill="url(#reserveGrad)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Circuit Breaker + Status */}
                <div className="glass" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>System Controls</p>
                    <div style={{
                        background: treasury.circuitBreaker ? "var(--red-dim)" : "var(--green-dim)",
                        border: `1px solid ${treasury.circuitBreaker ? "rgba(248,113,113,0.3)" : "rgba(74,222,128,0.3)"}`,
                        borderRadius: 10, padding: "14px 16px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {treasury.circuitBreaker ? <AlertTriangle size={18} color="var(--red)" /> : <CheckCircle2 size={18} color="var(--green)" />}
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>Circuit Breaker</p>
                                <p style={{ fontSize: 11, color: "var(--text-3)" }}>{treasury.circuitBreaker ? "TRADING HALTED" : "Trading active"}</p>
                            </div>
                        </div>
                        <button
                            onClick={onToggleCircuitBreaker}
                            style={{
                                padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                                border: "none",
                                background: treasury.circuitBreaker ? "var(--green)" : "var(--red)",
                                color: "#000",
                            }}
                        >
                            {treasury.circuitBreaker ? "RESUME" : "HALT"}
                        </button>
                    </div>
                    {[
                        { icon: Shield, label: "Oracle Price Feed", status: "ACTIVE", color: "var(--green)" },
                        { icon: Zap, label: "AML Engine", status: "RUNNING", color: "var(--green)" },
                        { icon: Shield, label: "Geo-Fence (AZ Border)", status: "ENFORCED", color: "var(--green)" },
                    ].map(({ icon: Icon, label, status, color }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Icon size={13} color={color} />
                                <span style={{ fontSize: 12, color: "var(--text-2)" }}>{label}</span>
                            </div>
                            <span className="badge badge-green">{status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Supply breakdown */}
            <div className="glass" style={{ padding: "16px 20px" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 14 }}>CHIT Supply Breakdown</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {supplyBreakdown.map(({ label, value, color, pct }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 11, color: "var(--text-3)", minWidth: 160 }}>{label}</span>
                            <div style={{ flex: 1, height: 6, background: "var(--bg-hover)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{
                                    height: "100%", background: color, borderRadius: 3,
                                    width: `${Math.max(0.5, parseFloat(pct) || 0)}%`,
                                    transition: "width 0.5s ease",
                                }} />
                            </div>
                            <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color, minWidth: 120, textAlign: "right" }}>{fmtCHIT(value)}</span>
                            <span style={{ fontSize: 10, color: "var(--text-3)", minWidth: 40, textAlign: "right", fontFamily: "var(--font-mono)" }}>{pct}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Volume summary + CHIT specs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="glass" style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 14 }}>Volume Summary</p>
                    {[
                        ["Buy Volume", fmtCHIT(treasury.buyVolume), `${treasury.buyCount} orders`, "var(--green)"],
                        ["Sell Volume", fmtCHIT(treasury.sellVolume), `${treasury.sellCount} orders`, "var(--red)"],
                        ["Redemptions", fmtCHIT(treasury.redemptions), `${treasury.redemptionCount} orders`, "var(--amber)"],
                    ].map(([label, val, sub, color]) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                            <div>
                                <p style={{ fontSize: 12, color: "var(--text-2)" }}>{label}</p>
                                <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{sub}</p>
                            </div>
                            <p style={{ fontSize: 15, fontFamily: "var(--font-mono)", fontWeight: 700, color }}>{val}</p>
                        </div>
                    ))}
                </div>
                <div className="glass" style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 14 }}>CHIT Specifications</p>
                    {[
                        ["New Issue Price", "$1.00", "Fixed"],
                        ["Market Price", "$1.00", "Pegged"],
                        ["Redemption Price", "$1.00", "Guaranteed"],
                        ["Asset Class", "Digital Commodity", "Actual Possession"],
                        ["Jurisdiction", "Arizona State", "Geo-Fenced"],
                        ["Standard", "No Interstate Tx", "Compliant"],
                    ].map(([label, val, badge]) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <span style={{ fontSize: 11, color: "var(--text-3)" }}>{label}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-1)" }}>{val}</span>
                                <span className="badge badge-green">{badge}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
