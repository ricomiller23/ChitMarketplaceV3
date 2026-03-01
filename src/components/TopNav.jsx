// TopNav.jsx — sticky top navigation bar
import { useState, useEffect } from "react";
import {
    MapPin, Menu, Search, X,
    ArrowDownLeft, DollarSign, Zap, Terminal,
} from "lucide-react";
import { fmtTime } from "../helpers.js";

const VIEW_LABELS = {
    dashboard: "Trade Terminal",
    portfolio: "Portfolio Intelligence",
    members: "Member Portal",
    treasury: "Treasury Command Center",
    oracle: "Oracle Intelligence Center",
    compliance: "Compliance & Audit",
};

export default function TopNav({ data, activeView, menuOpen, setMenuOpen, onOpenModal, setConsoleOpen, searchQuery, setSearchQuery, triggerSimulate }) {
    const [clock, setClock] = useState(fmtTime());

    useEffect(() => {
        const t = setInterval(() => setClock(fmtTime()), 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <div style={{
            position: "sticky", top: 0, zIndex: 40,
            background: "rgba(8,13,26,0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border)",
            padding: "0 28px",
            display: "flex", alignItems: "center",
            height: 60, gap: 16, flexShrink: 0,
        }}>
            <h2 style={{ fontWeight: 700, fontSize: 18, color: "var(--text-1)", letterSpacing: "-0.01em", flex: "none" }}>
                {VIEW_LABELS[activeView]}
            </h2>

            {/* Search */}
            <div style={{
                flex: 1, maxWidth: 340,
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "6px 12px",
            }}>
                <Search size={13} color="var(--text-3)" />
                <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search transactions, members…"
                    style={{
                        flex: 1, background: "none", border: "none", outline: "none",
                        color: "var(--text-1)", fontSize: 13, fontFamily: "var(--font-sans)",
                    }}
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: "var(--text-3)" }}>
                        <X size={12} />
                    </button>
                )}
            </div>

            <div style={{ flex: 1 }} />

            {/* Clock */}
            <div style={{
                fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-3)",
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "4px 12px",
            }}>
                {clock}
            </div>

            {/* Access badge */}
            <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "var(--green-dim)", border: "1px solid rgba(74,222,128,0.3)",
                borderRadius: 100, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: "var(--green)",
            }}>
                <MapPin size={10} />
                Full Access · Arizona
            </div>

            {/* User pill */}
            <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "5px 12px", fontSize: 12, color: "var(--text-1)",
            }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }} />
                {data?.user?.name}
            </div>

            {/* Hamburger menu */}
            <div style={{ position: "relative" }}>
                <button
                    id="menu-btn"
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        background: menuOpen ? "var(--accent)" : "var(--bg-card)",
                        border: "1px solid var(--border)", borderRadius: 8,
                        padding: "7px 10px", color: menuOpen ? "#fff" : "var(--text-1)",
                        display: "flex", alignItems: "center", gap: 6, fontSize: 12,
                    }}
                >
                    <Menu size={15} />
                </button>

                {menuOpen && (
                    <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 45 }} onClick={() => setMenuOpen(false)} />
                        <div className="fade-up" style={{
                            position: "absolute", right: 0, top: 46,
                            width: 240, zIndex: 50,
                            background: "var(--bg-surface)", border: "1px solid var(--border-lg)",
                            borderRadius: "var(--radius)", overflow: "hidden",
                            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
                        }}>
                            <div style={{ padding: 6 }}>
                                {[
                                    { label: "Schedule Cash Pick Up (CIT)", icon: ArrowDownLeft, color: "var(--green)", modal: "CASH_PICKUP" },
                                    { label: "Send Proceeds to Approved Bank Account", icon: DollarSign, color: "var(--blue)", modal: "WIRE_OUT" },
                                ].map(({ label, icon: Icon, color, modal }) => (
                                    <button
                                        key={modal}
                                        onClick={() => { onOpenModal(modal); setMenuOpen(false); }}
                                        style={{
                                            width: "100%", display: "flex", alignItems: "center", gap: 10,
                                            padding: "10px 12px", borderRadius: 8, border: "none",
                                            background: "transparent", color: "var(--text-1)", fontSize: 13, textAlign: "left",
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <Icon size={13} color={color} /> {label}
                                    </button>
                                ))}
                                <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                                <button
                                    onClick={() => { triggerSimulate(); setMenuOpen(false); }}
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                                        padding: "10px 12px", borderRadius: 8, border: "none",
                                        background: "transparent", color: "var(--green)", fontSize: 13, textAlign: "left",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <Zap size={13} /> Simulate Incoming Payment
                                </button>
                                <button
                                    onClick={() => { setConsoleOpen(true); setMenuOpen(false); }}
                                    style={{
                                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                                        padding: "10px 12px", borderRadius: 8, border: "none",
                                        background: "transparent", color: "var(--text-2)", fontSize: 13, textAlign: "left",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <Terminal size={13} /> Open Oracle Console
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
