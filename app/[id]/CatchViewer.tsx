"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import CatchTemplate from "@/app/(templates)/catch/components/CatchTemplate";
import { dbToCatchData } from "@/app/(templates)/catch/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

const AMBER = "#D12A72";
const AMBER_GRAD = "linear-gradient(135deg,#FF4F9A,#7C5CFF)";

/* ─────────────────────────────────────────
   Password gate — the letter is still whole
   behind it; this only asks who's asking.
───────────────────────────────────────── */
function CatchPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/catch-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`catch_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("Wrong password. Try again!"); setPw(""); }
    } catch { setError("Something went wrong. Try again!"); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-5"
      style={{ background: "linear-gradient(180deg,#9FD3FF 0%,#C8B8FF 55%,#FFD0E8 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 25 }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="rounded-3xl overflow-hidden shadow-2xl bg-white" style={{ border: "1px solid #EDE5F6" }}>
          <div className="h-1" style={{ background: AMBER_GRAD }} />
          <div className="px-7 pt-8 pb-7">
            <div className="flex flex-col items-center mb-7">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
                style={{ background: AMBER_GRAD, boxShadow: "0 14px 30px -12px rgba(209,42,114,.6)" }}
              >
                <Lock size={28} className="text-white" />
              </motion.div>
              <div className="text-3xl mb-2" aria-hidden>🎮</div>
              <h2 className="text-xl font-bold text-center mb-1" style={{ color: AMBER }}>
                This one&apos;s just for you
              </h2>
              <p className="text-xs text-center leading-relaxed text-muted-foreground">
                Enter the password to<br />press start 💘
              </p>
            </div>

            <div className="relative mb-4">
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
                placeholder="Enter password..."
                autoFocus
                aria-label="Password"
                className={`w-full px-4 py-3.5 pr-11 rounded-2xl text-sm outline-none transition-all text-foreground border ${
                  error ? "border-red-400/60 ring-2 ring-red-400/15" : "focus:ring-2"
                }`}
                style={error ? { background: "#FCFAFE" } : { background: "#FCFAFE", borderColor: "#EDE5F6" }}
              />
              <button
                type="button" onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-1.5 text-xs mb-4 text-red-500"
                >
                  <ShieldAlert size={12} /><span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleVerify}
              disabled={loading || !pw.trim()}
              className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-40 text-white shadow-lg"
              style={{ background: AMBER_GRAD, boxShadow: "0 14px 30px -14px rgba(209,42,114,.7)" }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />Verifying...</> : <><Lock size={15} />Open it</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Catch viewer (published page)
───────────────────────────────────────── */
export default function CatchViewer({
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
    return sessionStorage.getItem(`catch_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <CatchPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  // dbToCatchData already clamps item counts and duration — trust it.
  const data = dbToCatchData(rawData);

  return <CatchTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
