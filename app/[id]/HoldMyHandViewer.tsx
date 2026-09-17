"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import HoldMyHand from "@/app/(templates)/hold-my-hand/components/HoldMyHand";
import { dbToHoldMyHandData, HMH } from "@/app/(templates)/hold-my-hand/components/types";
import { LOCKED_GIF, WRONG_PASSWORD_GIF } from "@/app/(templates)/hold-my-hand/components/moments";
import { API_URL, IS_NGROK } from "@/lib/config";

/* ─────────────────────────────────────────
   Password gate — same dark world as the hold
───────────────────────────────────────── */
function HoldMyHandPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  /** Wrong tries so far. Drives which face is on the card and how it is worded. */
  const [misses, setMisses] = useState(0);

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/hold-my-hand-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`hold-my-hand_unlocked_${shareId}`, "true");
        onUnlocked();
      } else {
        // Deliberately not "Wrong password." — this is a love letter with a
        // lock on it, and the person typing is the one it was written for.
        setMisses((m) => m + 1);
        setError(
          misses === 0
            ? "not quite 🥺 try again?"
            : misses === 1
              ? "still no. they'd tell you if you asked…"
              : "hmm. ask them for the word 🤍"
        );
        setPw("");
      }
    } catch { setError("something went wrong. try once more?"); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked, misses]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-5"
      style={{
        background: `radial-gradient(120% 80% at 50% 18%, #46184A 0%, #1E0E33 46%, ${HMH.void} 100%)`,
        fontFamily: HMH.body,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 26 }}
        className="relative w-full max-w-sm"
      >
        <div
          className="rounded-[28px] overflow-hidden"
          style={{
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.12)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 40px 80px -20px rgba(0,0,0,.7)",
          }}
        >
          <div className="h-1" style={{ background: "linear-gradient(90deg,#6C5CE7,#F72585)" }} />
          <div className="px-7 pt-8 pb-7">
            {/*
              The face on the lock screen.

              A padlock icon is the right answer for a bank and the wrong one
              here: whoever is typing is the person this was written for, and
              the first thing they meet should be affection, not security. So
              the card opens with a beating heart, and every wrong try swaps it
              for the crying panda rather than a red error state — the same
              character that appears if they let go of the hold, so the page has
              one cast from the lock screen to the letter.
            */}
            <div className="flex flex-col items-center mb-7">
              <motion.img
                key={misses ? "sad" : "heart"}
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
                transition={{
                  opacity: { duration: 0.28 },
                  scale: { type: "spring", stiffness: 320, damping: 20 },
                  y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
                }}
                src={misses ? WRONG_PASSWORD_GIF : LOCKED_GIF}
                alt={misses ? "A small sad panda" : "A beating heart"}
                className="mb-4"
                style={{
                  width: 128,
                  maxHeight: 128,
                  objectFit: "contain",
                  filter: "drop-shadow(0 16px 34px rgba(0,0,0,.6))",
                }}
              />
              <h2
                className="text-center mb-1"
                style={{ color: "#fff", fontFamily: HMH.script, fontSize: 28, lineHeight: 1.15 }}
              >
                {misses ? "that's not the word" : "one word first"}
              </h2>
              <p className="text-xs text-center leading-relaxed" style={{ color: "rgba(255,255,255,.55)" }}>
                {misses
                  ? "they only gave it to you 🤍"
                  : "they locked this before handing\nyou their hand."}
              </p>
            </div>

            <div className="relative mb-4">
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
                placeholder="the word they told you…"
                autoFocus
                className="w-full px-4 py-3.5 pr-11 rounded-2xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,.07)",
                  color: "#fff",
                  border: `1px solid ${error ? "rgba(247,37,133,.6)" : "rgba(255,255,255,.16)"}`,
                }}
              />
              <button
                type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,.5)" }}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-1.5 text-xs mb-4"
                  style={{ color: HMH.pink }}
                >
                  <ShieldAlert size={12} /><span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleVerify}
              disabled={loading || !pw.trim()}
              className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: HMH.lime, color: HMH.ink, fontFamily: HMH.display }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />checking…</> : <><Lock size={15} />open it 🤍</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Hold My Hand viewer (published page)
───────────────────────────────────────── */
export default function HoldMyHandViewer({
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
    return sessionStorage.getItem(`hold-my-hand_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <HoldMyHandPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  const data = dbToHoldMyHandData(rawData);

  return <HoldMyHand data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
