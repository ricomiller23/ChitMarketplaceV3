// App.jsx — UTRADE V3 main orchestrator
import { useState, useEffect, useRef, useCallback } from "react";
import { INITIAL_DATA, STORAGE_KEY } from "./constants.js";
import { fmtReceiptId, fmtDate, fmtTime, fmtCHIT, fmtUSD, genChartData, randId } from "./helpers.js";
import { Loader2 } from "lucide-react";

import MobileBlocker from "./components/MobileBlocker.jsx";
import Sidebar from "./components/Sidebar.jsx";
import TopNav from "./components/TopNav.jsx";
import Modal from "./components/Modal.jsx";
import OracleConsole from "./components/OracleConsole.jsx";
import ToastContainer from "./components/Toast.jsx";
import DashboardView from "./components/DashboardView.jsx";
import PortfolioView from "./components/PortfolioView.jsx";
import MembersView from "./components/MembersView.jsx";
import TreasuryView from "./components/TreasuryView.jsx";
import OracleIntelView from "./components/OracleIntelView.jsx";
import ComplianceView from "./components/ComplianceView.jsx";

// ─── Chart data ─────────────────────────────────────
const CHART_DATA = {
  buys: genChartData(60, 25),
  sells: genChartData(40, 20),
  xfers: genChartData(35, 18),
};

// ─── Toast helper ────────────────────────────────────
let _toastId = 0;
function makeToast(type, title, message, receipt, duration = 4000) {
  return { id: ++_toastId, type, title, message, receipt, duration };
}

export default function App() {
  // ── Data ──────────────────────────────────────────
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Navigation ────────────────────────────────────
  const [activeView, setActiveView] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("Trades");
  const [menuOpen, setMenuOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Modal ─────────────────────────────────────────
  const [modal, setModal] = useState(null);
  const [modalStep, setModalStep] = useState(1);
  const [modalAmount, setModalAmount] = useState("");
  const [modalRecipient, setModalRecipient] = useState("");
  const [modalFacility, setModalFacility] = useState("PHX-01 · Phoenix Central Vault");
  const [modalBank, setModalBank] = useState("****6789 (Chase Business)");
  const [modalError, setModalError] = useState("");
  const [orderType, setOrderType] = useState("Market");
  const [limitPrice, setLimitPrice] = useState("1.0000");

  // ── Console ───────────────────────────────────────
  const [consoleLogs, setConsoleLogs] = useState([
    { type: "system", text: "UTRADE CHIT Marketplace v3.0.0 — Oracle Connected", ts: fmtTime() },
    { type: "info", text: "Treasury initialized: ⌀100,000,000 CHITs deployed", ts: fmtTime() },
    { type: "info", text: 'Type /ralph for diagnostics. Type /help for all commands.', ts: fmtTime() },
    { type: "success", text: "All six system helices verified — PRISTINE", ts: fmtTime() },
  ]);
  const [consoleInput, setConsoleInput] = useState("");
  const [bugs, setBugs] = useState([]);
  const [scanning, setScanning] = useState(false);

  // ── Toasts ────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message, receipt) => {
    setToasts(prev => [...prev, makeToast(type, title, message, receipt)]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Storage ───────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setData(raw ? JSON.parse(raw) : INITIAL_DATA);
        if (!raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      } catch {
        setData(INITIAL_DATA);
      }
      setLoading(false);
    };
    init();
  }, []);

  const persist = useCallback((newData) => {
    setData(newData);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newData)); } catch { }
  }, []);

  // ── Keyboard shortcuts ────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "b" || e.key === "B") openModal("BUY");
      if (e.key === "s" || e.key === "S") openModal("SELL");
      if (e.key === "t" || e.key === "T") openModal("XFER");
      if (e.key === "Escape") { closeModal(); setMenuOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Derived ───────────────────────────────────────
  const filteredTxns = data
    ? data.transactions.filter(t => {
      if (activeTab === "Trades") return ["BUY", "SELL"].includes(t.type);
      if (activeTab === "Listed") return t.type === "LIST";
      if (activeTab === "Pending") return t.status === "Pending";
      return true;
    })
    : [];

  // ── Console helpers ───────────────────────────────
  const addLog = useCallback((type, text) => {
    setConsoleLogs(prev => [...prev, { type, text, ts: fmtTime() }]);
  }, []);

  // ── Modal ─────────────────────────────────────────
  const openModal = (type) => {
    setModal(type);
    setModalStep(1);
    setModalAmount("");
    setModalRecipient("");
    setModalError("");
    setOrderType("Market");
    setLimitPrice("1.0000");
    setMenuOpen(false);
  };

  const closeModal = () => {
    setModal(null);
    setModalStep(1);
    setModalError("");
  };

  const submitModal = () => {
    const amount = parseFloat(modalAmount);
    if (!amount || amount <= 0) { setModalError("Please enter a valid amount."); return; }
    if (!data) return;

    const usdBal = data.user.alphaBal + data.user.betaBal;
    if (["BUY", "WIRE_OUT"].includes(modal) && amount > usdBal) {
      setModalError(`Insufficient USD proceeds. Available: ${fmtUSD(usdBal)}`); return;
    }
    if (["SELL", "XFER"].includes(modal) && amount > data.user.tradingBal) {
      setModalError(`Insufficient CHIT. Available: ${fmtCHIT(data.user.tradingBal)}`); return;
    }
    if (modal === "XFER" && !modalRecipient.trim()) { setModalError("Recipient required."); return; }
    if (modal === "CASH_PICKUP" && amount > data.treasury.chits) { setModalError("Treasury insufficient."); return; }

    setModalStep(2);
    setTimeout(() => { setModalStep(3); applyTransaction(amount); }, 2200);
  };

  const applyTransaction = (amount) => {
    if (!data) return;
    let d = { ...data, user: { ...data.user }, treasury: { ...data.treasury } };
    const txn = {
      id: Math.random().toString(36).substr(2, 9),
      receiptId: fmtReceiptId(),
      date: fmtDate(),
      type: modal,
      asset: ["BUY", "SELL", "XFER", "CASH_PICKUP"].includes(modal) ? fmtCHIT(amount) : fmtUSD(amount),
      status: "Delivered",
      from: "", to: "",
    };

    const deductUSD = (amt) => {
      if (d.user.alphaBal >= amt) { d.user.alphaBal -= amt; }
      else { amt -= d.user.alphaBal; d.user.alphaBal = 0; d.user.betaBal = Math.max(0, d.user.betaBal - amt); }
    };

    switch (modal) {
      case "BUY":
        deductUSD(amount);
        d.user.tradingBal += amount;
        d.treasury.chits -= amount;
        txn.from = "Funding Accounts"; txn.to = "Trading Vault";
        break;
      case "SELL":
        d.user.tradingBal -= amount;
        d.user.alphaBal += amount;
        d.treasury.chits += amount;
        txn.from = "Trading Vault"; txn.to = "Alpha Fund";
        break;
      case "XFER": {
        d.user.tradingBal -= amount;
        const recipientMember = d.customers?.find(m => m.id === modalRecipient);
        txn.from = data.user.name;
        txn.to = recipientMember ? `${recipientMember.name} (${recipientMember.id})` : modalRecipient;
        txn.status = "Pending";
        break;
      }
      case "CASH_PICKUP":
        d.user.tradingBal += amount;
        d.treasury.chits -= amount;
        txn.from = modalFacility; txn.to = "Trading Vault"; txn.status = "Pending";
        break;
      case "WIRE_OUT":
        // Deduct from funding account (where SELL proceeds land) → send to approved bank
        deductUSD(amount);
        txn.from = "Funding Account (Proceeds)"; txn.to = `Approved Bank (${modalBank})`;
        txn.asset = fmtUSD(amount);
        break;
    }

    d.transactions = [txn, ...(d.transactions || [])];
    persist(d);

    addLog("success", `[ORACLE] ${txn.receiptId} — ${modal} ${txn.asset} — ${txn.status}`);
    const toastTitle = modal === "WIRE_OUT" ? "Proceeds Sent to Bank" : "Transaction Complete";
    const toastMsg = modal === "WIRE_OUT"
      ? `${txn.asset} wired to ${modalBank}`
      : `${modal} ${txn.asset} — ${txn.status}`;
    addToast("success", toastTitle, toastMsg, txn.receiptId);
  };

  // ── Simulate incoming ─────────────────────────────
  const triggerSimulate = useCallback(() => {
    if (!data) return;
    const amount = Math.floor(Math.random() * 49_000 + 1_000);
    const sender = randId();
    const txn = {
      id: Math.random().toString(36).substr(2, 9),
      receiptId: fmtReceiptId(),
      date: fmtDate(),
      type: "BUY",
      asset: fmtCHIT(amount),
      status: "Delivered",
      from: `usr-${sender}`,
      to: data.user.name,
    };
    const d = {
      ...data,
      user: { ...data.user, tradingBal: data.user.tradingBal + amount },
      treasury: { ...data.treasury, chits: data.treasury.chits - amount },
      transactions: [txn, ...(data.transactions || [])],
    };
    persist(d);
    addLog("success", `[SIMULATE] Incoming: ${fmtCHIT(amount)} from usr-${sender}`);
    addToast("info", "Incoming Payment", `${fmtCHIT(amount)} received from usr-${sender}`, txn.receiptId);
  }, [data, persist, addLog, addToast]);

  // ── Circuit breaker ───────────────────────────────
  const toggleCircuitBreaker = useCallback(() => {
    if (!data) return;
    const d = { ...data, treasury: { ...data.treasury, circuitBreaker: !data.treasury.circuitBreaker } };
    persist(d);
    const active = !data.treasury.circuitBreaker;
    addToast(active ? "error" : "success", active ? "Circuit Breaker Activated" : "Trading Resumed", active ? "All trading has been halted." : "Trading is now active.");
    addLog(active ? "error" : "success", `[TREASURY] Circuit breaker ${active ? "ACTIVATED — trading halted" : "DEACTIVATED — trading resumed"}`);
  }, [data, persist, addToast, addLog]);

  // ── Clear console ─────────────────────────────────
  useEffect(() => {
    if (consoleInput === "/clear") {
      setConsoleLogs([{ type: "system", text: "Console cleared.", ts: fmtTime() }]);
      setConsoleInput("");
    }
  }, [consoleInput]);

  // ── Loading ───────────────────────────────────────
  if (loading) {
    return (
      <div style={{ height: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 32, color: "var(--green)" }}>⌀</div>
        <Loader2 size={24} className="spin" color="var(--accent)" />
        <p style={{ color: "var(--text-3)", fontSize: 12, fontFamily: "var(--font-mono)" }}>Connecting to Oracle…</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────
  return (
    <>
      {/* Mobile blocker — hidden on desktop via CSS */}
      <MobileBlocker />

      {/* Desktop app */}
      <div className="desktop-only" style={{ height: "100vh", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar
            data={data}
            activeView={activeView}
            setActiveView={setActiveView}
            onOpenModal={openModal}
            setConsoleOpen={setConsoleOpen}
            consoleOpen={consoleOpen}
          />

          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <TopNav
              data={data}
              activeView={activeView}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              onOpenModal={openModal}
              setConsoleOpen={setConsoleOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              triggerSimulate={triggerSimulate}
            />

            <main style={{ flex: 1, overflowY: "auto" }}>
              {activeView === "dashboard" && <DashboardView data={data} chartData={CHART_DATA} filteredTxns={filteredTxns} activeTab={activeTab} setActiveTab={setActiveTab} searchQuery={searchQuery} />}
              {activeView === "portfolio" && <PortfolioView data={data} searchQuery={searchQuery} />}
              {activeView === "members" && <MembersView data={data} searchQuery={searchQuery} />}
              {activeView === "treasury" && <TreasuryView data={data} onToggleCircuitBreaker={toggleCircuitBreaker} />}
              {activeView === "oracle" && <OracleIntelView data={data} />}
              {activeView === "compliance" && <ComplianceView data={data} searchQuery={searchQuery} />}
            </main>

            <OracleConsole
              open={consoleOpen}
              onClose={() => setConsoleOpen(false)}
              logs={consoleLogs}
              addLog={addLog}
              consoleInput={consoleInput}
              setConsoleInput={setConsoleInput}
              data={data}
              persist={persist}
              bugs={bugs}
              setBugs={setBugs}
              scanning={scanning}
              setScanning={setScanning}
              triggerSimulate={triggerSimulate}
            />
          </div>
        </div>
      </div>

      <Modal
        modal={modal}
        modalStep={modalStep}
        modalAmount={modalAmount}
        setModalAmount={setModalAmount}
        modalRecipient={modalRecipient}
        setModalRecipient={setModalRecipient}
        modalFacility={modalFacility}
        setModalFacility={setModalFacility}
        modalBank={modalBank}
        setModalBank={setModalBank}
        modalError={modalError}
        onSubmit={submitModal}
        onClose={closeModal}
        orderType={orderType}
        setOrderType={setOrderType}
        limitPrice={limitPrice}
        setLimitPrice={setLimitPrice}
        data={data}
      />

      <ToastContainer toasts={toasts} dismiss={dismissToast} />
    </>
  );
}
