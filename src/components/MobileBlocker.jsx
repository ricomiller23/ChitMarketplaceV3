// MobileBlocker.jsx — shown on screens < 1024px
export default function MobileBlocker() {
    return (
        <div className="mobile-blocker" style={{
            minHeight: "100vh", flexDirection: "column", alignItems: "center",
            justifyContent: "center", background: "var(--bg-base)",
            padding: "32px", textAlign: "center", gap: 24,
        }}>
            <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--green-dim)", border: "2px solid var(--green)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, marginBottom: 8,
            }}>⌀</div>
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>
                    Desktop Required
                </h1>
                <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, maxWidth: 320 }}>
                    UTRADE is an institutional-grade trading terminal built for desktop.
                    Please open this application on a screen wider than 1024px.
                </p>
            </div>
            <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "16px 24px",
            }}>
                <p style={{ color: "var(--text-3)", fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
                    UTRADE · CHIT MARKETPLACE V3 · AZ PRIVATE CLUB
                </p>
            </div>
        </div>
    );
}
