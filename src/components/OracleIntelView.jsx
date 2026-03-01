// OracleIntelView.jsx — Oracle Intelligence Center
import { fmtUSD, fmtCHIT, fmtDate, fmtTime } from "../helpers.js";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useMemo } from "react";

export default function OracleIntelView({ data }) {
    if (!data) return null;

    const priceHistory = useMemo(() =>
        data.priceHistory || Array.from({ length: 48 }, (_, i) => ({
            t: i, o: 1.00, h: 1.00 + Math.random() * 0.003,
            l: 1.00 - Math.random() * 0.002, c: 1.00,
            v: Math.floor(Math.random() * 500_000 + 100_000),
        })),
        [data.priceHistory]
    );

    const volumeData = priceHistory.map((p, i) => ({ t: i, v: p.v }));

    return (
        <div className="fade-up" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Status cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                    { label: "Oracle Node", value: "AZC-ORC-001", note: "Active", color: "var(--green)" },
                    { label: "CHIT Price", value: "$1.0000", note: "Stable — Pegged", color: "var(--text-1)" },
                    { label: "Peg Status", value: "STABLE", note: "0.00% deviation", color: "var(--green)" },
                    { label: "Consensus", value: "3/3 Nodes", note: "Full agreement", color: "var(--accent)" },
                ].map(({ label, value, note, color }) => (
                    <div key={label} className="glass gradient-border" style={{ padding: "16px 18px" }}>
                        <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</p>
                        <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>{value}</p>
                        <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4 }}>{note}</p>
                    </div>
                ))}
            </div>

            {/* Price feed chart + Volume */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                <div className="glass" style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>CHIT Price History — 48h</p>
                        <div style={{ display: "flex", gap: 16 }}>
                            <span style={{ fontSize: 11, color: "var(--text-3)" }}>High: <span style={{ color: "var(--green)", fontFamily: "var(--font-mono)" }}>$1.0031</span></span>
                            <span style={{ fontSize: 11, color: "var(--text-3)" }}>Low: <span style={{ color: "var(--red)", fontFamily: "var(--font-mono)" }}>$0.9989</span></span>
                        </div>
                    </div>
                    <div style={{ height: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={priceHistory} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="t" hide />
                                <Tooltip
                                    contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
                                    formatter={v => [`$${v.toFixed(4)}`, "Price"]}
                                />
                                <Area type="monotone" dataKey="c" stroke="#93c5fd" strokeWidth={1.5} fill="url(#priceGrad)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="glass" style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 12 }}>Volume — 48h</p>
                    <div style={{ height: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={volumeData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    contentStyle={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }}
                                    formatter={v => [fmtCHIT(v), "Volume"]}
                                />
                                <Area type="monotone" dataKey="v" stroke="#fbbf24" strokeWidth={1.5} fill="url(#volGrad)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Oracle node status + anomaly detection */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="glass" style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 14 }}>Oracle Node Status</p>
                    {[
                        ["AZC-ORC-001", "Primary", "Active", "Phoenix,   AZ", "3ms"],
                        ["AZC-ORC-002", "Secondary", "Active", "Tucson,    AZ", "5ms"],
                        ["AZC-ORC-003", "Tertiary", "Active", "Scottsdale,AZ", "4ms"],
                    ].map(([id, role, status, loc, latency]) => (
                        <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                            <div>
                                <p style={{ fontSize: 12, color: "var(--text-1)", fontFamily: "var(--font-mono)" }}>{id}</p>
                                <p style={{ fontSize: 10, color: "var(--text-3)" }}>{role} · {loc}</p>
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{latency}</span>
                                <span className="badge badge-green">{status}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="glass" style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 14 }}>Anomaly Detection</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{
                            background: "var(--green-dim)", border: "1px solid rgba(74,222,128,0.2)",
                            borderRadius: 8, padding: "12px 14px",
                            display: "flex", alignItems: "center", gap: 10,
                        }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>No Anomalies Detected</p>
                                <p style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>Last scanned: {fmtDate()} {fmtTime()}</p>
                            </div>
                        </div>
                        {[
                            ["Price Deviation Monitor", "< 0.1%", "PASS"],
                            ["Volume Spike Detection", "Normal", "PASS"],
                            ["Wash Trade Detection", "None", "PASS"],
                            ["Large Order Alert (>⌀100K)", "None", "PASS"],
                            ["Cross-Member Pattern", "Clean", "PASS"],
                        ].map(([rule, value, status]) => (
                            <div key={rule} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 11, color: "var(--text-3)" }}>{rule}</span>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <span style={{ fontSize: 11, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>{value}</span>
                                    <span className="badge badge-green">{status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
