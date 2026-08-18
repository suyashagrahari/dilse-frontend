"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import SearchedTemplate from "@/app/(templates)/searched/components/SearchedTemplate";
import { dbToSearchData } from "@/app/(templates)/searched/components/coerce";
import { PALETTE } from "@/app/(templates)/searched/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

/* ─────────────────────────────────────────
   Password gate. It borrows the template's
   own palette so the unlock reads as the
   front door of the same thing, not as a
   different product bolted on ahead of it.
───────────────────────────────────────── */
function SearchedPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/searched-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`searched_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("Wrong password. Try again!"); setPw(""); }
    } catch { setError("Something went wrong. Try again!"); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" style={{ background: PALETTE.bg }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 25 }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: "#ffffff", border: `1px solid ${PALETTE.border}` }}>
          <div className="h-1" style={{ background: PALETTE.link }} />
          <div className="px-7 pt-8 pb-7">
            <div className="flex flex-col items-center mb-7">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
                style={{ background: PALETTE.link }}
              >
                <Lock size={28} className="text-white" />
              </div>
              <div className="text-3xl mb-2" aria-hidden>🔍</div>
              <h2 className="text-xl font-bold text-center mb-1" style={{ color: PALETTE.ink }}>
                One result. It&apos;s you.
              </h2>
              <p className="text-xs text-center leading-relaxed" style={{ color: PALETTE.grey }}>
                Enter the password<br />to see what came up
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
                style={{ background: "#ffffff", borderColor: PALETTE.border, color: PALETTE.ink }}
              />
              <button
                type="button" onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: PALETTE.grey }}
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
              style={{ background: PALETTE.link }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />Verifying...</> : <><Lock size={15} />Search</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Searched viewer (published page)
───────────────────────────────────────── */
export default function SearchedViewer({
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
    return sessionStorage.getItem(`searched_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <SearchedPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  // The coercer clamps and repairs everything — the server payload is untrusted
  // input and this is the one place that decides what a malformed field becomes.
  const data = dbToSearchData(rawData);

  return <SearchedTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
