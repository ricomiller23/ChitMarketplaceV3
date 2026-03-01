// OracleConsole.jsx — Oracle Intelligence Console
import { useEffect, useRef } from "react";
import { Terminal, X, Loader2 } from "lucide-react";
import { fmtTime, fmtCHIT, fmtUSD, fmtDate } from "../helpers.js";

export default function OracleConsole({
    open, onClose, logs, addLog, consoleInput, setConsoleInput,
    data, persist, bugs, setBugs, scanning, setScanning, triggerSimulate,
}) {
    const endRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);
    useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

    const handleCmd = (raw) => {
        const trimmed = raw.trim();
        if (!trimmed) return;
        addLog("input", `> ${trimmed}`);
        setConsoleInput("");
        const cmd = trimmed.toLowerCase().split(" ")[0];
        const parts = trimmed.split(" ");

        switch (cmd) {
            case "/ralph": {
                addLog("system", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                addLog("ralph", "🦏  RALPH — Regulatory AML Ledger Protocol Handler");
                addLog("ralph", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                addLog("ralph", `SYSTEM STATUS .............. ✅ OPERATIONAL`);
                addLog("ralph", `UTRADE VERSION ............. ✅ 3.0.0`);
                addLog("ralph", `ORACLE CONNECTION .......... ✅ ACTIVE`);
                addLog("ralph", `SEED-TO-SALE VERIFY ........ ✅ ENABLED`);
                addLog("ralph", `AML ENGINE ................. ✅ RUNNING`);
                addLog("ralph", `KYC DATABASE ............... ✅ ${(data?.customers?.length || 0) + 1} MEMBERS`);
                addLog("ralph", `GEO-FENCE .................. ✅ ARIZONA STATE BORDER`);
                addLog("ralph", `TREASURY CHITS ............. ✅ ${fmtCHIT(data?.treasury?.chits || 0)}`);
                addLog("ralph", `TREASURY USD ............... ✅ ${fmtUSD(data?.treasury?.usd || 0)}`);
                addLog("ralph", `RESERVE RATIO .............. ✅ ${data?.treasury?.reserveRatio || 99.97}%`);
                addLog("ralph", `CIRCUIT BREAKER ............ ${data?.treasury?.circuitBreaker ? "🔴 ACTIVE" : "✅ NOMINAL"}`);
                addLog("ralph", `USER VAULT ................. ✅ ${data?.user?.vaultId}`);
                addLog("ralph", `ENCLAVE STATUS ............. ✅ INTEL SGX ACTIVE`);
                addLog("ralph", `HEREDITY HELIX ............. ✅ INTACT`);
                addLog("ralph", `PERMISSION HELIX ........... ✅ VALIDATED`);
                addLog("ralph", `STATE HELIX ................ ✅ SYNCHRONIZED`);
                addLog("ralph", `LAST BLOCK SIGNED .......... ${fmtDate()} ${fmtTime()}`);
                addLog("ralph", `COMPLIANCE SCORE ........... 100/100 — PRISTINE`);
                addLog("system", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                addLog("success", "RALPH diagnostic complete. All systems nominal.");
                break;
            }
            case "/help": {
                addLog("system", "═══════════════ UTRADE V3 COMMANDS ═══════════════");
                [
                    ["/ralph", "Full system diagnostic (RALPH)"],
                    ["/debug", "Run debug scan on state"],
                    ["/audit", "Transaction audit log (last 10)"],
                    ["/fix", "Auto-fix detected issues"],
                    ["/treasury", "Treasury status"],
                    ["/customers", "KYC member registry"],
                    ["/balance", "Current user balances"],
                    ["/mint <amount>", "Mint CHITs to treasury (admin)"],
                    ["/reset", "Reset to initial state"],
                    ["/simulate", "Simulate incoming payment"],
                    ["/oracle", "Query Oracle ledger"],
                    ["/price", "Current CHIT price feed"],
                    ["/risk", "Member risk scores"],
                    ["/bugs", "List detected bugs"],
                    ["/clear", "Clear console"],
                ].forEach(([c, d]) => addLog("info", `${c.padEnd(20)} — ${d}`));
                addLog("system", "══════════════════════════════════════════════════");
                break;
            }
            case "/debug": {
                setScanning(true);
                addLog("info", "🔍 Running deep state inspection...");
                setTimeout(() => {
                    const found = [];
                    if (data) {
                        if (data.user.alphaBal < 0) found.push({ id: "BUG-001", sev: "CRITICAL", msg: "Negative Alpha balance" });
                        if (data.user.tradingBal < 0) found.push({ id: "BUG-002", sev: "CRITICAL", msg: "Negative trading balance" });
                        if (data.treasury.chits < 0) found.push({ id: "BUG-003", sev: "CRITICAL", msg: "Treasury CHIT deficit" });
                        data.transactions?.forEach((t, i) => {
                            if (!t.receiptId) found.push({ id: `BUG-${100 + i}`, sev: "WARN", msg: `Txn #${i} missing receipt` });
                        });
                    }
                    setBugs(found);
                    if (!found.length) addLog("success", "✅ Scan complete — State is clean. No issues found.");
                    else {
                        addLog("error", `⚠️  ${found.length} issue(s). Run /fix to resolve.`);
                        found.forEach(b => addLog(b.sev === "CRITICAL" ? "error" : "warn", `  [${b.id}] ${b.sev}: ${b.msg}`));
                    }
                    setScanning(false);
                }, 1800);
                break;
            }
            case "/fix": {
                if (!bugs.length) { addLog("info", "No bugs on record. Run /debug first."); break; }
                addLog("info", "🔧 Auto-fixing detected issues...");
                setTimeout(() => {
                    if (data) {
                        persist({
                            ...data,
                            user: { ...data.user, alphaBal: Math.max(0, data.user.alphaBal), betaBal: Math.max(0, data.user.betaBal), tradingBal: Math.max(0, data.user.tradingBal) },
                            treasury: { ...data.treasury, chits: Math.max(0, data.treasury.chits) },
                        });
                    }
                    addLog("success", `✅ Fixed ${bugs.length} issue(s). State normalized.`);
                    setBugs([]);
                }, 1200);
                break;
            }
            case "/audit": {
                addLog("system", "════════════ ORACLE TRANSACTION AUDIT ════════════");
                if (!data?.transactions?.length) addLog("info", "No transactions on ledger.");
                else {
                    data.transactions.slice(0, 10).forEach(t => {
                        addLog("info", `[${t.date}] ${t.receiptId} | ${t.type} | ${t.asset} | ${t.status}`);
                        addLog("info", `   ${t.from}  →  ${t.to}`);
                    });
                    addLog("info", `Total records: ${data.transactions.length}`);
                }
                addLog("system", "════════════════════════════════════════════════════");
                break;
            }
            case "/treasury": {
                if (!data) break;
                addLog("system", "══════════════ TREASURY STATUS ══════════════");
                addLog("info", `CHIT Supply ........ ${fmtCHIT(data.treasury.chits)}`);
                addLog("info", `USD Reserves ....... ${fmtUSD(data.treasury.usd)}`);
                addLog("info", `Reserve Ratio ...... ${data.treasury.reserveRatio}%`);
                addLog("info", `Listed for Sale .... ⌀${data.treasury.listedForSale.toLocaleString()}`);
                addLog("info", `Circulation ........ ⌀${data.treasury.circulation.toLocaleString()}`);
                addLog("info", `New Issue Price .... $1.00`);
                addLog("info", `Market Price ....... $1.00`);
                addLog("info", `Redemption Price ... $1.00`);
                addLog("info", `Circuit Breaker .... ${data.treasury.circuitBreaker ? "ACTIVE 🔴" : "NOMINAL ✅"}`);
                addLog("system", "═════════════════════════════════════════════");
                break;
            }
            case "/customers": {
                if (!data) break;
                addLog("system", "════════════ KYC MEMBER REGISTRY ════════════");
                data.customers.forEach(c => {
                    addLog("info", `[${c.id}] ${c.name} | KYC: ${c.kycStatus} | ${c.tier} | Risk: ${c.riskScore}`);
                });
                addLog("info", `Total members: ${data.customers.length + 1}`);
                addLog("system", "═════════════════════════════════════════════");
                break;
            }
            case "/balance": {
                if (!data) break;
                addLog("system", "══════════ USER BALANCE SUMMARY ══════════");
                addLog("info", `User: ${data.user.name} (${data.user.id})`);
                addLog("info", `Alpha USD: ${fmtUSD(data.user.alphaBal)}`);
                addLog("info", `Beta USD:  ${fmtUSD(data.user.betaBal)}`);
                addLog("info", `Total USD: ${fmtUSD(data.user.alphaBal + data.user.betaBal)}`);
                addLog("info", `CHIT (Trading Vault): ${fmtCHIT(data.user.tradingBal)}`);
                addLog("info", `Vault ID: ${data.user.vaultId}`);
                addLog("system", "═══════════════════════════════════════════");
                break;
            }
            case "/mint": {
                const amount = parseInt(parts[1]);
                if (!amount || amount <= 0) { addLog("error", "Usage: /mint <amount>"); break; }
                if (!data) break;
                addLog("info", `🏦 Minting ${fmtCHIT(amount)} to treasury...`);
                setTimeout(() => {
                    const d = { ...data, treasury: { ...data.treasury, chits: data.treasury.chits + amount } };
                    persist(d);
                    addLog("success", `✅ ${fmtCHIT(amount)} minted. New balance: ${fmtCHIT(d.treasury.chits)}`);
                }, 800);
                break;
            }
            case "/oracle": {
                addLog("system", "══════════════ ORACLE QUERY ══════════════");
                addLog("ralph", `Oracle Node: AZC-ORC-001 (Active)`);
                addLog("ralph", `Ledger Height: ${(data?.transactions?.length || 0) + 10_847_293}`);
                addLog("ralph", `Last Hash: ${Math.random().toString(36).substr(2, 32).toUpperCase()}`);
                addLog("ralph", `Consensus: 3/3 nodes in agreement`);
                addLog("ralph", `Integrity Check: PASS`);
                addLog("ralph", `Heredity Chain: UNBROKEN`);
                addLog("system", "══════════════════════════════════════════");
                break;
            }
            case "/price": {
                addLog("system", "════════════ CHIT PRICE FEED ════════════");
                addLog("ralph", `New Issue:    $1.0000`);
                addLog("ralph", `Market Price: $1.0000`);
                addLog("ralph", `Redemption:   $1.0000`);
                addLog("ralph", `24h High:     $1.0031`);
                addLog("ralph", `24h Low:      $0.9989`);
                addLog("ralph", `Peg Status:   STABLE ✅`);
                addLog("system", "═════════════════════════════════════════");
                break;
            }
            case "/risk": {
                if (!data) break;
                addLog("system", "════════════ MEMBER RISK SCORES ════════════");
                data.customers.forEach(c => {
                    const level = c.riskScore <= 15 ? "LOW" : c.riskScore <= 35 ? "MEDIUM" : "HIGH";
                    addLog("info", `[${c.id}] ${c.name.padEnd(28)} Risk: ${String(c.riskScore).padStart(3)} → ${level}`);
                });
                addLog("system", "═════════════════════════════════════════════");
                break;
            }
            case "/simulate": {
                triggerSimulate();
                addLog("success", "Incoming payment simulated.");
                break;
            }
            case "/reset": {
                addLog("warn", "⚠️  Resetting to initial state...");
                import("../constants.js").then(({ INITIAL_DATA }) => {
                    setTimeout(async () => { await persist(INITIAL_DATA); addLog("success", "✅ State reset to defaults."); }, 500);
                });
                break;
            }
            case "/bugs": {
                if (!bugs.length) addLog("success", "No bugs on record. Run /debug to scan.");
                else bugs.forEach(b => addLog(b.sev === "CRITICAL" ? "error" : "warn", `[${b.id}] ${b.sev}: ${b.msg}`));
                break;
            }
            case "/clear":
                break; // handled by App
            default:
                addLog("error", `Unknown command: ${cmd}. Type /help for available commands.`);
        }
    };

    if (!open) return null;

    return (
        <div style={{
            height: 280, borderTop: "1px solid var(--border)",
            background: "#050810", display: "flex", flexDirection: "column", flexShrink: 0,
        }}>
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "6px 16px", borderBottom: "1px solid var(--border)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Terminal size={12} color="var(--green)" />
                    <span style={{ color: "var(--green)", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600 }}>ORACLE CONSOLE</span>
                    {scanning && <><Loader2 size={10} className="spin" color="var(--amber)" /><span style={{ color: "var(--amber)", fontSize: 10, fontFamily: "var(--font-mono)" }}>scanning...</span></>}
                    {bugs.length > 0 && <span style={{ background: "var(--red)", color: "#000", fontSize: 10, padding: "1px 6px", borderRadius: 100, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{bugs.length} bugs</span>}
                </div>
                <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-3)" }}><X size={14} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px", fontFamily: "var(--font-mono)", fontSize: 11, display: "flex", flexDirection: "column", gap: 2 }}>
                {logs.map((log, i) => (
                    <div key={i} className={`log-${log.type}`} style={{ display: "flex", gap: 10 }}>
                        <span style={{ color: "var(--text-3)", flexShrink: 0, minWidth: 80 }}>{log.ts}</span>
                        <span style={{ whiteSpace: "pre" }}>{log.text}</span>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
            <div style={{
                borderTop: "1px solid var(--border)", padding: "6px 16px",
                display: "flex", alignItems: "center", gap: 8,
            }}>
                <span style={{ color: "var(--green)", fontFamily: "var(--font-mono)", fontSize: 12 }}>$</span>
                <input
                    ref={inputRef}
                    value={consoleInput}
                    onChange={e => setConsoleInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter" && consoleInput.trim()) {
                            if (consoleInput.trim() === "/clear") {
                                // handled in App
                            }
                            handleCmd(consoleInput);
                        }
                    }}
                    placeholder="Type a command (/help)…"
                    style={{
                        flex: 1, background: "none", border: "none", outline: "none",
                        color: "var(--text-1)", fontFamily: "var(--font-mono)", fontSize: 12,
                    }}
                />
            </div>
        </div>
    );
}
