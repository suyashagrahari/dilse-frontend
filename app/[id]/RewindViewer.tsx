"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import RewindTemplate from "@/app/(templates)/rewind/components/RewindTemplate";
import { dbToRewindData } from "@/app/(templates)/rewind/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

const FUCHSIA = "#A21CAF";
const FUCHSIA_GRAD = "linear-gradient(135deg,#D946EF,#4F46E5)";

/* ─────────────────────────────────────────
   Password gate — the year is whole behind
   it; this only asks who's asking.
───────────────────────────────────────── */
function RewindPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/rewind-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`rewind_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("Wrong password. Try again!"); setPw(""); }
    } catch { setError("Something went wrong. Try again!"); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-5"
      style={{ background: "linear-gradient(180deg,#FDF4FF 0%,#EEF2FF 55%,#FFFFFF 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 25 }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="rounded-3xl overflow-hidden shadow-2xl bg-white" style={{ border: "1px solid #EBD5F2" }}>
          <div className="h-1" style={{ background: FUCHSIA_GRAD }} />
          <div className="px-7 pt-8 pb-7">
            <div className="flex flex-col items-center mb-7">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
                style={{ background: FUCHSIA_GRAD, boxShadow: "0 14px 30px -12px rgba(162,28,175,.6)" }}
              >
                <Lock size={28} className="text-white" />
              </motion.div>
              <div className="text-3xl mb-2" aria-hidden>⏮️</div>
              <h2 className="text-xl font-bold text-center mb-1" style={{ color: FUCHSIA }}>
                This one&apos;s just for you
              </h2>
              <p className="text-xs text-center leading-relaxed text-muted-foreground">
                Enter the password and<br />we&apos;ll run the numbers
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
                style={error ? { background: "#FCF7FE" } : { background: "#FCF7FE", borderColor: "#EBD5F2" }}
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
              style={{ background: FUCHSIA_GRAD, boxShadow: "0 14px 30px -14px rgba(162,28,175,.7)" }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />Verifying...</> : <><Lock size={15} />Start the rewind</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Rewind viewer (published page)
───────────────────────────────────────── */
export default function RewindViewer({
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
    return sessionStorage.getItem(`rewind_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <RewindPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  // dbToRewindData drops any answer that is not a known question/option pair,
  // and every number on screen derives from `startDate` — trust it.
  const data = dbToRewindData(rawData);

  return <RewindTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
