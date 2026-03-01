// ─── UTRADE V3 · Helpers ─────────────────────────────────────────────────────

export const fmtUSD = (n) =>
    `$${Number(Math.abs(n)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtCHIT = (n) =>
    `⌀${Number(Math.abs(n)).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const fmtShort = (n) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
};

export const fmtCHITShort = (n) => {
    if (n >= 1e9) return `⌀${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `⌀${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `⌀${(n / 1e3).toFixed(1)}K`;
    return `⌀${n}`;
};

export const fmtReceiptId = () =>
    `RCP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

export const fmtDate = () =>
    new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

export const fmtTime = () =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export const fmtDateTime = () =>
    new Date().toLocaleString("en-US", {
        month: "short", day: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
    });

export const genChartData = (base = 50, variance = 30) =>
    Array.from({ length: 24 }, (_, i) => ({
        x: i,
        v: Math.max(5, base + (Math.random() - 0.5) * variance * 2),
    }));

export const genSparkline = (len = 20) =>
    Array.from({ length: len }, (_, i) => ({
        x: i,
        v: 1 + (Math.random() - 0.48) * 0.005,
    }));

export const randId = () => `usr-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

/** Generate a simulated orderbook (bids/asks around $1.00) */
export const genOrderBook = () => {
    const asks = [];
    const bids = [];
    for (let i = 0; i < 12; i++) {
        asks.push({
            price: (1.000 + (i + 1) * 0.0005).toFixed(4),
            qty: Math.floor(Math.random() * 50_000 + 5_000),
        });
        bids.push({
            price: (1.000 - (i + 1) * 0.0005).toFixed(4),
            qty: Math.floor(Math.random() * 50_000 + 5_000),
        });
    }
    return { asks, bids };
};

export const clampRisk = (n) =>
    n <= 15 ? "LOW" : n <= 35 ? "MEDIUM" : "HIGH";

export const riskColor = (n) =>
    n <= 15 ? "#4ade80" : n <= 35 ? "#fbbf24" : "#f87171";
