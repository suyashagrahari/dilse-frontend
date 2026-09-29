"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import LoveflixTemplate from "@/app/(templates)/loveflix/components/LoveflixTemplate";
import { dbToLoveflixData, ACCENT, BG, BG_RAISED } from "@/app/(templates)/loveflix/components/types";
import { Wordmark } from "@/app/(templates)/loveflix/components/Brand";
import { API_URL, IS_NGROK } from "@/lib/config";

// The template's rose red — deliberately not the streaming red it would
// otherwise be mistaken for.
const ACCENT_GRAD = "linear-gradient(135deg,#E62E5C,#B3173F)";

/* ─────────────────────────────────────────
   Password gate — the episode is whole
   behind it; this only asks who's asking.
───────────────────────────────────────── */
function LoveflixPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/loveflix-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`loveflix_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("Wrong password. Try again!"); setPw(""); }
    } catch { setError("Something went wrong. Try again!"); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-5"
      style={{ background: BG }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 25 }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: BG_RAISED, border: "1px solid #2a2a2a" }}>
          <div className="h-1" style={{ background: ACCENT_GRAD }} />
          <div className="px-7 pt-8 pb-7">
            <div className="flex flex-col items-center mb-7">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
                style={{ background: ACCENT_GRAD, boxShadow: "0 14px 30px -12px rgba(230,46,92,.6)" }}
              >
                <Lock size={28} className="text-white" />
              </motion.div>
              <div className="mb-3" aria-hidden><Wordmark size={24} /></div>
              <h2 className="text-xl font-bold text-center mb-1" style={{ color: ACCENT }}>
                Profile Lock is on 🔒
              </h2>
              <p className="text-xs text-center leading-relaxed" style={{ color: "#a0a0a0" }}>
                Enter the password they gave you<br />and your show starts
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
                style={{ background: "#101010", borderColor: "#2a2a2a", color: "#f5f5f5" }}
              />
              <button
                type="button" onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "#a0a0a0" }}
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
              style={{ background: ACCENT_GRAD, boxShadow: "0 14px 30px -14px rgba(230,46,92,.7)" }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />Verifying...</> : <><Lock size={15} />Press play</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   LoveFlix viewer (published page)
───────────────────────────────────────── */
export default function LoveflixViewer({
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
    return sessionStorage.getItem(`loveflix_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <LoveflixPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  // dbToLoveflixData clamps everything and maps pages saved before the
  // redesign (rows + scenes) onto the v2 catalogue — trust it.
  const data = dbToLoveflixData(rawData);

  return <LoveflixTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
