"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import FlagsTemplate from "@/app/(templates)/flags/components/FlagsTemplate";
import { dbToFlagsData, CHOICE_COLOR } from "@/app/(templates)/flags/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

const PAPER = "#faf8f4";
const INK = "#141210";

/* ─────────────────────────────────────────
   Password gate — editorial, not app-like.
   Off-white paper, hard 1px borders, near-black ink; the only colour is the
   red from CHOICE_COLOR, used for the error. Nothing here may resemble the
   look of a real dating product.
───────────────────────────────────────── */
function FlagsPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/flags-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`flags_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("Wrong password. Try again."); setPw(""); }
    } catch { setError("Something went wrong. Try again."); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" style={{ background: PAPER }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm"
      >
        <div style={{ background: "#fff", border: `1px solid ${INK}22`, borderRadius: 2 }} className="px-7 pt-8 pb-7">
          <div className="flex flex-col items-center mb-7">
            <div
              className="w-12 h-12 grid place-items-center mb-4"
              style={{ border: `1px solid ${INK}33`, borderRadius: 2, color: INK }}
            >
              <Lock size={20} />
            </div>
            <p
              className="text-[10px] uppercase mb-2 text-center"
              style={{ letterSpacing: "0.22em", color: `${INK}88`, fontFamily: "var(--font-oswald), sans-serif" }}
            >
              1 profile near you
            </p>
            <h2
              className="text-xl text-center mb-1.5"
              style={{ color: INK, fontFamily: "var(--font-tinos), Times, serif" }}
            >
              This one&apos;s private.
            </h2>
            <p className="text-xs text-center leading-relaxed" style={{ color: `${INK}88` }}>
              They sent you a password with the link.
            </p>
          </div>

          <div className="relative mb-4">
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
              placeholder="Password"
              autoFocus
              className="w-full px-4 py-3.5 pr-11 text-sm outline-none transition-colors"
              style={{
                background: PAPER,
                color: INK,
                borderRadius: 2,
                border: `1px solid ${error ? CHOICE_COLOR.red : `${INK}25`}`,
                fontFamily: "var(--font-courier-prime), monospace",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
              style={{ color: `${INK}77` }}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-1.5 text-xs mb-4"
                style={{ color: CHOICE_COLOR.red }}
              >
                <ShieldAlert size={12} /><span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleVerify}
            disabled={loading || !pw.trim()}
            className="w-full min-h-[48px] text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
            style={{
              background: INK, color: PAPER, borderRadius: 2,
              letterSpacing: "0.08em",
              fontFamily: "var(--font-oswald), sans-serif",
              textTransform: "uppercase",
            }}
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Checking</> : "Open"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Flags viewer (published page)
───────────────────────────────────────── */
export default function FlagsViewer({
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
    return sessionStorage.getItem(`flags_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <FlagsPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  const data = dbToFlagsData(rawData);

  // shareId is passed through so the renderer can seed buildDeck with it — the
  // deck order must be stable per page and identical across reloads.
  return <FlagsTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
