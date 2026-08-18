"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import VendingMachineTemplate from "@/app/(templates)/vending-machine/components/VendingMachineTemplate";
import { dbToVendingData, MACHINE_MODEL, MACHINE_SERIAL } from "@/app/(templates)/vending-machine/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

const STENCIL = "var(--font-oswald), system-ui, sans-serif";
const TYPED = "var(--font-courier-prime), ui-monospace, monospace";
const AMBER = "#ffa500";
const BODY = "#2d5c5c";

/* ─────────────────────────────────────────
   Password gate — a service panel on the machine, not a modal
───────────────────────────────────────── */
function VendingPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/vending-machine-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`vending-machine_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("WRONG CODE"); setPw(""); }
    } catch { setError("SERVICE ERROR — TRY AGAIN"); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" style={{ background: "#12181a" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="relative w-full max-w-sm"
      >
        <div
          className="overflow-hidden"
          style={{
            borderRadius: 2,
            border: "1px solid #0d1a1a",
            background: `linear-gradient(180deg, ${BODY} 0%, #244c4c 42%, #1d4040 100%)`,
            boxShadow: "0 24px 60px -20px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.08)",
          }}
        >
          {/* header plate */}
          <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(0,0,0,.35)" }}>
            <p style={{ fontFamily: STENCIL, letterSpacing: ".22em", fontSize: 15, color: "#e7efe9" }}>
              SERVICE PANEL
            </p>
            <p style={{ fontFamily: STENCIL, letterSpacing: ".14em", fontSize: 9, color: "rgba(231,239,233,.55)", marginTop: 2 }}>
              {MACHINE_MODEL} · SERIAL {MACHINE_SERIAL}
            </p>
          </div>

          <div className="px-4 py-5">
            {/* dot-matrix-ish instruction strip */}
            <div
              className="px-3 py-2 mb-4"
              style={{
                borderRadius: 2,
                background: "#0b0b0b",
                border: "1px solid rgba(0,0,0,.6)",
                boxShadow: "inset 0 2px 6px rgba(0,0,0,.8)",
              }}
            >
              <motion.p
                animate={{ opacity: [0.94, 1, 0.96, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontFamily: STENCIL, letterSpacing: ".2em", fontSize: 11, color: AMBER }}
              >
                {error || "ENTER ACCESS CODE"}
              </motion.p>
            </div>

            <div className="relative mb-3">
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(ev) => { setPw(ev.target.value); setError(""); }}
                onKeyDown={(ev) => { if (ev.key === "Enter") handleVerify(); }}
                placeholder="••••••"
                autoFocus
                aria-label="Access code"
                className="w-full px-3.5 py-3.5 pr-11 outline-none text-sm"
                style={{
                  borderRadius: 2,
                  fontFamily: TYPED,
                  letterSpacing: ".24em",
                  background: "#101615",
                  color: "#e7efe9",
                  border: `1px solid ${error ? "#d9534f" : "rgba(255,255,255,.18)"}`,
                  boxShadow: "inset 0 2px 6px rgba(0,0,0,.6)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide code" : "Show code"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: "rgba(231,239,233,.6)" }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || !pw.trim()}
              className="w-full flex items-center justify-center gap-2 disabled:opacity-40 active:translate-y-[1px] transition-transform"
              style={{
                minHeight: 48,
                borderRadius: 2,
                fontFamily: STENCIL,
                letterSpacing: ".18em",
                fontSize: 14,
                color: "#12181a",
                background: "linear-gradient(180deg,#d8dcd6,#a9b0a8)",
                border: "1px solid rgba(0,0,0,.45)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.7), 0 2px 0 rgba(0,0,0,.35)",
              }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> CHECKING</> : "UNLOCK"}
            </button>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center mt-3"
                  style={{ fontFamily: STENCIL, letterSpacing: ".12em", fontSize: 10, color: "#ff8a80" }}
                >
                  ASK WHOEVER SENT YOU HERE.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Vending Machine Viewer (published page)
───────────────────────────────────────── */
export default function VendingMachineViewer({
  rawData,
  hasPassword,
  shareId,
}: {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}) {
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return !hasPassword;
    if (!hasPassword) return true;
    return sessionStorage.getItem(`vending-machine_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <VendingPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  // dbToVendingData is the only place that knows A1 never vends and that at most
  // one slot jams — no need to re-check either here.
  const data = dbToVendingData(rawData);

  return <VendingMachineTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
