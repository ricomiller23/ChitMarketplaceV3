// Toast.jsx — bottom-right toast notification system
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ICONS = {
    success: <CheckCircle2 size={15} color="var(--green)" />,
    error: <AlertCircle size={15} color="var(--red)" />,
    info: <Info size={15} color="var(--blue)" />,
};
const BG = {
    success: "rgba(74,222,128,0.08)",
    error: "rgba(248,113,113,0.08)",
    info: "rgba(147,197,253,0.08)",
};
const BORDER = {
    success: "rgba(74,222,128,0.25)",
    error: "rgba(248,113,113,0.25)",
    info: "rgba(147,197,253,0.25)",
};

function Toast({ toast, onDismiss }) {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => {
            setExiting(true);
            setTimeout(onDismiss, 300);
        }, toast.duration || 4000);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            className={exiting ? "toast-exit" : "toast-enter"}
            style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: BG[toast.type] || BG.info,
                border: `1px solid ${BORDER[toast.type] || BORDER.info}`,
                borderRadius: 10, padding: "12px 14px",
                backdropFilter: "blur(20px)", minWidth: 280, maxWidth: 360,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
        >
            <div style={{ flexShrink: 0, marginTop: 1 }}>{ICONS[toast.type]}</div>
            <div style={{ flex: 1 }}>
                {toast.title && (
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 2 }}>
                        {toast.title}
                    </p>
                )}
                <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>{toast.message}</p>
                {toast.receipt && (
                    <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--green)", marginTop: 4 }}>
                        {toast.receipt}
                    </p>
                )}
            </div>
            <button
                onClick={() => { setExiting(true); setTimeout(onDismiss, 300); }}
                style={{ background: "none", border: "none", color: "var(--text-3)", flexShrink: 0, padding: 2 }}
            >
                <X size={12} />
            </button>
        </div>
    );
}

export default function ToastContainer({ toasts, dismiss }) {
    return (
        <div style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9999,
            display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none",
        }}>
            {toasts.map(t => (
                <div key={t.id} style={{ pointerEvents: "all" }}>
                    <Toast toast={t} onDismiss={() => dismiss(t.id)} />
                </div>
            ))}
        </div>
    );
}
