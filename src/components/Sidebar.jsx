// Sidebar.jsx — collapsible left sidebar
import { useState } from "react";
import {
    BarChart3, Users, Database, Terminal, ChevronLeft, ChevronRight,
    Activity, Shield, Cpu, TrendingUp,
} from "lucide-react";
import { fmtUSD, fmtCHIT } from "../helpers.js";
import { VERSION } from "../constants.js";

const NAV = [
    { id: "dashboard", label: "Trade Terminal", icon: BarChart3 },
    { id: "portfolio", label: "Portfolio", icon: TrendingUp },
    { id: "members", label: "Members", icon: Users },
    { id: "treasury", label: "Treasury", icon: Database },
    { id: "oracle", label: "Oracle Intel", icon: Cpu },
    { id: "compliance", label: "Compliance", icon: Shield },
];

export default function Sidebar({ data, activeView, setActiveView, onOpenModal, setConsoleOpen, consoleOpen }) {
    const [collapsed, setCollapsed] = useState(false);

    if (!data) return null;
    const usdTotal = data.user.alphaBal + data.user.betaBal;
    const w = collapsed ? 72 : 288;

    return (
        <aside style={{
            width: w, minWidth: w, flexShrink: 0,
            background: "var(--bg-surface)",
            borderRight: "1px solid var(--border)",
            display: "flex", flexDirection: "column",
            transition: "width 0.25s ease, min-width 0.25s ease",
            overflow: "hidden", position: "relative",
        }}>
            {/* Header */}
            <div style={{
                padding: collapsed ? "20px 0" : "20px 20px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between",
            }}>
                {!collapsed && (
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="pulse-dot" style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: "var(--green)", flexShrink: 0,
                            }} />
                            <span style={{
                                fontSize: 22, fontWeight: 700, letterSpacing: "0.12em",
                                background: "linear-gradient(135deg, #f1f5f9, var(--green))",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            }}>UTRADE</span>
                        </div>
                        <p style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.18em", marginTop: 2, textTransform: "uppercase" }}>
                            CHIT Marketplace · AZ
                        </p>
                    </div>
                )}
                {collapsed && (
                    <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "var(--green-dim)", border: "1px solid var(--green)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, color: "var(--green)", fontFamily: "var(--font-mono)",
                    }}>⌀</div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        background: "var(--bg-card)", border: "1px solid var(--border)",
                        borderRadius: 8, padding: 6, color: "var(--text-2)",
                        display: "flex", alignItems: "center",
                    }}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            {/* Balances — when expanded */}
            {!collapsed && (
                <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* Funding */}
                    <div style={{
                        background: "var(--bg-card)", border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)", padding: "10px 12px",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Funding Account</span>
                            <span className="badge badge-green">Active</span>
                        </div>
                        <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-1)" }}>{fmtUSD(usdTotal)}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--border)" }}>
                            <span style={{ fontSize: 10, color: "var(--text-3)" }}>α {fmtUSD(data.user.alphaBal)}</span>
                            <span style={{ fontSize: 10, color: "var(--text-3)" }}>β {fmtUSD(data.user.betaBal)}</span>
                        </div>
                    </div>
                    {/* Trading */}
                    <div style={{
                        background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(74,222,128,0.05))",
                        border: "1px solid var(--border-lg)", borderRadius: "var(--radius-sm)", padding: "10px 12px",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Trading Vault</span>
                            <span className="badge badge-blue">CHIT</span>
                        </div>
                        <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--green)" }}>{fmtCHIT(data.user.tradingBal)}</p>
                        <p style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 4 }}>{data.user.vaultId}</p>
                    </div>
                    {/* Action buttons */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                        {[
                            { label: "BUY", bg: "var(--green)", color: "#000" },
                            { label: "SELL", bg: "var(--red)", color: "#000" },
                            { label: "XFER", bg: "var(--accent)", color: "#fff" },
                        ].map(({ label, bg, color }) => (
                            <button
                                key={label}
                                onClick={() => onOpenModal(label)}
                                style={{
                                    background: bg, color, fontWeight: 700, fontSize: 11,
                                    letterSpacing: "0.08em", border: "none", borderRadius: 8,
                                    padding: "8px 0",
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav style={{ padding: "12px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                {NAV.map(({ id, label, icon: Icon }) => {
                    const active = activeView === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setActiveView(id)}
                            title={collapsed ? label : undefined}
                            style={{
                                display: "flex", alignItems: "center",
                                gap: 10, padding: collapsed ? "10px 0" : "9px 12px",
                                borderRadius: "var(--radius-sm)", border: "none",
                                justifyContent: collapsed ? "center" : "flex-start",
                                background: active ? "var(--accent-dim)" : "transparent",
                                color: active ? "var(--accent)" : "var(--text-2)",
                                fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: active ? 600 : 400,
                                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                            }}
                        >
                            <Icon size={15} />
                            {!collapsed && label}
                        </button>
                    );
                })}
            </nav>

            {/* Console + Footer */}
            <div style={{ borderTop: "1px solid var(--border)", padding: "10px" }}>
                <button
                    onClick={() => setConsoleOpen(!consoleOpen)}
                    title="Oracle Console"
                    style={{
                        width: "100%", display: "flex", alignItems: "center",
                        gap: 8, padding: collapsed ? "8px 0" : "8px 12px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        background: consoleOpen ? "rgba(74,222,128,0.08)" : "transparent",
                        border: "1px solid var(--border)", borderRadius: 8,
                        color: consoleOpen ? "var(--green)" : "var(--text-3)",
                        fontSize: 11, fontFamily: "var(--font-mono)",
                    }}
                >
                    <Terminal size={13} />
                    {!collapsed && "ORACLE CONSOLE"}
                </button>
                {!collapsed && (
                    <p style={{ textAlign: "center", fontSize: 10, color: "var(--text-3)", marginTop: 10, fontFamily: "var(--font-mono)" }}>
                        v{VERSION}
                    </p>
                )}
            </div>
        </aside>
    );
}
