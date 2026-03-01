// MobileBlocker.jsx — Hard block for mobile/tablet devices
import { Monitor } from "lucide-react";

export default function MobileBlocker() {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "linear-gradient(135deg, #060b18 0%, #0d1326 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 32, textAlign: "center",
        }}>
            {/* CHIT symbol */}
            <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 28,
            }}>
                <Monitor size={32} color="#6366f1" />
            </div>

            <div style={{
                background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
                borderRadius: 8, padding: "8px 16px", marginBottom: 24, display: "inline-block",
            }}>
                <span style={{ fontSize: 11, color: "#f87171", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    Desktop Only
                </span>
            </div>

            <h1 style={{
                fontSize: 26, fontWeight: 800, color: "#f8fafc",
                fontFamily: "'Space Grotesk', sans-serif", marginBottom: 14, lineHeight: 1.2,
            }}>
                UTRADE is not available<br />on mobile devices.
            </h1>

            <p style={{
                fontSize: 15, color: "#64748b", lineHeight: 1.6, maxWidth: 340, marginBottom: 32,
            }}>
                This platform requires a <strong style={{ color: "#94a3b8" }}>desktop or laptop computer</strong> with a minimum screen width of 1024px. Please open UTRADE on a compatible device.
            </p>

            <div style={{
                display: "flex", flexDirection: "column", gap: 10, alignItems: "center",
            }}>
                <div style={{
                    background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.6)",
                    borderRadius: 10, padding: "12px 20px",
                    display: "flex", alignItems: "center", gap: 10,
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
                    <span style={{ fontSize: 12, color: "#64748b", fontFamily: "'IBM Plex Mono', monospace" }}>
                        chitmarketplacev3.vercel.app
                    </span>
                </div>
                <p style={{ fontSize: 11, color: "#334155" }}>
                    AZ Private Club · CHIT Marketplace V3 · Oracle Protected
                </p>
            </div>
        </div>
    );
}
