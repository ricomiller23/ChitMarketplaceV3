// Modal.jsx — V3 transaction modals (BUY/SELL/XFER/CASH_PICKUP/CASH_DROP/WIRE_OUT)
import { CheckCircle2, Loader2, X, AlertCircle } from "lucide-react";
import { fmtUSD, fmtCHIT } from "../helpers.js";
import { FACILITIES, BANK_ACCOUNTS } from "../constants.js";

const MODAL_META = {
    BUY: { title: "Buy CHITs", sub: "Purchase CHITs from Treasury", accentBg: "var(--green)", accentTxt: "#000" },
    SELL: { title: "Sell CHITs", sub: "Sell CHITs back to Treasury", accentBg: "var(--red)", accentTxt: "#000" },
    XFER: { title: "Transfer CHITs", sub: "Transfer CHITs to Member", accentBg: "var(--accent)", accentTxt: "#fff" },
    CASH_PICKUP: { title: "Cash Pick Up (CIT)", sub: "Schedule CIT Cash Collection", accentBg: "var(--green)", accentTxt: "#000" },
    CASH_DROP: { title: "Cash Drop-Off (CIT)", sub: "Schedule CIT Cash Drop-Off", accentBg: "var(--red)", accentTxt: "#000" },
    WIRE_OUT: { title: "Wire Money Out", sub: "Wire USD to Approved Bank Account", accentBg: "var(--blue)", accentTxt: "#000" },
};

export default function Modal({
    modal, modalStep, modalAmount, setModalAmount,
    modalRecipient, setModalRecipient, modalFacility, setModalFacility,
    modalBank, setModalBank, modalError, onSubmit, onClose,
    orderType, setOrderType, limitPrice, setLimitPrice, data,
}) {
    if (!modal || !data) return null;
    const meta = MODAL_META[modal] || {};
    const usdTotal = data.user.alphaBal + data.user.betaBal;
    const isUSD = ["BUY", "CASH_DROP", "WIRE_OUT"].includes(modal);
    const isCHIT = ["SELL", "XFER", "CASH_PICKUP"].includes(modal) && modal !== "CASH_PICKUP";

    return (
        <div
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(8px)", zIndex: 200,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
            }}
            onClick={e => e.target === e.currentTarget && modalStep !== 2 && onClose()}
        >
            <div className="fade-up glass-lg" style={{ width: "100%", maxWidth: 440, overflow: "hidden" }}>
                {/* Header */}
                <div style={{
                    padding: "20px 24px 16px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <div style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: meta.accentBg, flexShrink: 0,
                            }} />
                            <h3 style={{ fontWeight: 700, fontSize: 17, color: "var(--text-1)" }}>{meta.title}</h3>
                        </div>
                        <p style={{ fontSize: 12, color: "var(--text-2)", marginLeft: 16 }}>{meta.sub}</p>
                    </div>
                    {modalStep !== 2 && (
                        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-3)", padding: 4 }}>
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div style={{ padding: "20px 24px 24px" }}>
                    {/* Step 1 — Input */}
                    {modalStep === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {/* Order type for BUY/SELL */}
                            {(modal === "BUY" || modal === "SELL") && (
                                <div style={{ display: "flex", gap: 6 }}>
                                    {["Market", "Limit"].map(ot => (
                                        <button
                                            key={ot}
                                            onClick={() => setOrderType(ot)}
                                            style={{
                                                flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 600,
                                                border: "1px solid var(--border)",
                                                background: orderType === ot ? "var(--accent-dim)" : "transparent",
                                                color: orderType === ot ? "var(--accent)" : "var(--text-2)",
                                            }}
                                        >{ot}</button>
                                    ))}
                                </div>
                            )}

                            {/* Amount */}
                            <div>
                                <label style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
                                    {isUSD ? "USD Amount" : "CHIT Amount"}
                                </label>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    background: "var(--bg-base)", border: "1px solid var(--border)",
                                    borderRadius: 10, padding: "12px 16px",
                                    transition: "border-color 0.15s",
                                }}>
                                    <span style={{ fontSize: 22, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                                        {isUSD ? "$" : "⌀"}
                                    </span>
                                    <input
                                        type="number" min="0" autoFocus
                                        value={modalAmount}
                                        onChange={e => setModalAmount(e.target.value)}
                                        placeholder="0.00"
                                        style={{
                                            flex: 1, background: "none", border: "none", outline: "none",
                                            color: "var(--text-1)", fontFamily: "var(--font-mono)", fontSize: 22,
                                        }}
                                    />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                                        Available: {isUSD ? fmtUSD(usdTotal) : fmtCHIT(data.user.tradingBal)}
                                    </span>
                                    <button
                                        onClick={() => setModalAmount(String(isUSD ? usdTotal : data.user.tradingBal))}
                                        style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", fontWeight: 600 }}
                                    >MAX</button>
                                </div>
                            </div>

                            {/* Limit price input */}
                            {(modal === "BUY" || modal === "SELL") && orderType === "Limit" && (
                                <div>
                                    <label style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
                                        Limit Price (USD per CHIT)
                                    </label>
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        background: "var(--bg-base)", border: "1px solid var(--border)",
                                        borderRadius: 10, padding: "10px 16px",
                                    }}>
                                        <span style={{ fontSize: 14, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>$</span>
                                        <input
                                            type="number" step="0.0001"
                                            value={limitPrice}
                                            onChange={e => setLimitPrice(e.target.value)}
                                            placeholder="1.0000"
                                            style={{
                                                flex: 1, background: "none", border: "none", outline: "none",
                                                color: "var(--text-1)", fontFamily: "var(--font-mono)", fontSize: 14,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Recipient — XFER */}
                            {modal === "XFER" && (
                                <div>
                                    <label style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
                                        Recipient ID / Address
                                    </label>
                                    <input
                                        type="text" value={modalRecipient}
                                        onChange={e => setModalRecipient(e.target.value)}
                                        placeholder="usr-XXXX or member string"
                                        style={{
                                            width: "100%", background: "var(--bg-base)", border: "1px solid var(--border)",
                                            borderRadius: 10, padding: "12px 16px", color: "var(--text-1)",
                                            fontFamily: "var(--font-mono)", fontSize: 13, outline: "none",
                                        }}
                                    />
                                </div>
                            )}

                            {/* Facility — CASH_PICKUP / CASH_DROP */}
                            {(modal === "CASH_PICKUP" || modal === "CASH_DROP") && (
                                <div>
                                    <label style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
                                        Facility Location
                                    </label>
                                    <select
                                        value={modalFacility} onChange={e => setModalFacility(e.target.value)}
                                        style={{
                                            width: "100%", background: "var(--bg-base)", border: "1px solid var(--border)",
                                            borderRadius: 10, padding: "12px 16px", color: "var(--text-1)", fontSize: 13, outline: "none",
                                        }}
                                    >
                                        {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Bank — WIRE_OUT */}
                            {modal === "WIRE_OUT" && (
                                <div>
                                    <label style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
                                        Approved Bank Account
                                    </label>
                                    <select
                                        value={modalBank} onChange={e => setModalBank(e.target.value)}
                                        style={{
                                            width: "100%", background: "var(--bg-base)", border: "1px solid var(--border)",
                                            borderRadius: 10, padding: "12px 16px", color: "var(--text-1)", fontSize: 13, outline: "none",
                                        }}
                                    >
                                        {BANK_ACCOUNTS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Error */}
                            {modalError && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    background: "var(--red-dim)", border: "1px solid rgba(248,113,113,0.25)",
                                    borderRadius: 8, padding: "10px 14px",
                                }}>
                                    <AlertCircle size={14} color="var(--red)" />
                                    <p style={{ fontSize: 12, color: "var(--red)" }}>{modalError}</p>
                                </div>
                            )}

                            {/* Fee preview */}
                            {modalAmount > 0 && (
                                <div style={{
                                    background: "var(--bg-card)", border: "1px solid var(--border)",
                                    borderRadius: 8, padding: "10px 14px",
                                    display: "flex", justifyContent: "space-between",
                                }}>
                                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>Network Fee</span>
                                    <span style={{ fontSize: 11, color: "var(--green)", fontFamily: "var(--font-mono)" }}>$0.00</span>
                                </div>
                            )}

                            {/* Confirm */}
                            <button
                                onClick={onSubmit}
                                style={{
                                    width: "100%", padding: "14px 0", borderRadius: 10, border: "none",
                                    background: meta.accentBg, color: meta.accentTxt,
                                    fontWeight: 700, fontSize: 14, letterSpacing: "0.06em",
                                }}
                            >
                                CONFIRM {meta.title.toUpperCase()}
                            </button>
                        </div>
                    )}

                    {/* Step 2 — Processing */}
                    {modalStep === 2 && (
                        <div style={{ padding: "24px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                            <div style={{ position: "relative" }}>
                                <Loader2 size={44} className="spin" color="var(--accent)" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: 16, color: "var(--text-1)" }}>Authenticating</p>
                                <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 6 }}>Running Seed-to-Sale Verification…</p>
                                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                                    AML Check · Oracle Signing · Enclave Processing
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        width: 6, height: 6, borderRadius: "50%", background: "var(--accent)",
                                        animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3 — Success */}
                    {modalStep === 3 && (
                        <div style={{ padding: "16px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                            <div style={{ animation: "bounceIn 0.4s ease forwards" }}>
                                <CheckCircle2 size={52} color="var(--green)" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 18, color: "var(--text-1)" }}>Transaction Complete</p>
                                <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 6 }}>Oracle has signed and recorded this transaction.</p>
                            </div>
                            <div style={{
                                width: "100%", background: "var(--bg-base)", border: "1px solid var(--border)",
                                borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
                            }}>
                                {[
                                    ["New USD Balance", fmtUSD(data.user.alphaBal + data.user.betaBal)],
                                    ["New CHIT Balance", fmtCHIT(data.user.tradingBal)],
                                    ...(data.transactions[0] ? [["Receipt ID", data.transactions[0].receiptId]] : []),
                                ].map(([label, value], i) => (
                                    <div key={label} style={{
                                        display: "flex", justifyContent: "space-between",
                                        paddingTop: i === 2 ? 8 : 0, borderTop: i === 2 ? "1px solid var(--border)" : "none",
                                    }}>
                                        <span style={{ fontSize: 12, color: "var(--text-3)" }}>{label}</span>
                                        <span style={{ fontSize: 12, color: i === 2 ? "var(--green)" : "var(--text-1)", fontFamily: "var(--font-mono)" }}>{value}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
                                    background: "var(--accent)", color: "#fff",
                                    fontWeight: 700, fontSize: 13, letterSpacing: "0.06em",
                                }}
                            >DONE</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
