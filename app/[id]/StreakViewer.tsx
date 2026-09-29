"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import StreakTemplate from "@/app/(templates)/streak/components/StreakTemplate";
import { dbToPage } from "@/app/(templates)/streak/components/coerce";
import { AppMark } from "@/app/(templates)/streak/components/snap/icons";
import { FONT } from "@/app/(templates)/streak/components/snap/tokens";

const PALETTE = { paper: "#FFFC00", paperDeep: "#FFFFFF", edge: "#EDEDED", ink: "#16191C", inkSoft: "#6B6E73", accent: "#0EADFF" };
import { API_URL, IS_NGROK } from "@/lib/config";

/* ─────────────────────────────────────────
   Password gate. It borrows the template's
   own palette so the unlock reads as the
   front door of the same thing, not as a
   different product bolted on ahead of it.
───────────────────────────────────────── */
function StreakPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/streak-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`streak_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("Wrong password. Try again!"); setPw(""); }
    } catch { setError("Something went wrong. Try again!"); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" style={{ background: PALETTE.paper, fontFamily: FONT }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 25 }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: PALETTE.paperDeep, border: `1px solid ${PALETTE.edge}` }}>
          <div className="h-1" style={{ background: PALETTE.accent }} />
          <div className="px-7 pt-8 pb-7">
            <div className="flex flex-col items-center mb-7">
              <div className="mb-4" aria-hidden>
                <AppMark size={64} />
              </div>
              <h2 className="text-xl font-bold text-center mb-1" style={{ color: PALETTE.ink }}>
                You have 1 new snap 🔥
              </h2>
              <p className="text-xs text-center leading-relaxed" style={{ color: PALETTE.inkSoft }}>
                enter the password to open it
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
                className={`w-full px-4 py-3.5 pr-11 rounded-2xl text-sm outline-none transition-all border ${
                  error ? "border-red-400/60 ring-2 ring-red-400/15" : "focus:ring-2"
                }`}
                style={{ background: "#ffffff", borderColor: PALETTE.edge, color: PALETTE.ink }}
              />
              <button
                type="button" onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: PALETTE.inkSoft }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-1.5 text-xs mb-4 text-red-400"
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
              style={{ background: PALETTE.accent }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />Verifying...</> : <><Lock size={15} />Open snap</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Streak viewer (published page)
───────────────────────────────────────── */
export default function StreakViewer({
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
    return sessionStorage.getItem(`streak_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <StreakPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  // The coercer clamps and repairs everything — the server payload is untrusted
  // input and this is the one place that decides what a malformed field becomes.
  const data = dbToPage(rawData);

  return <StreakTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
