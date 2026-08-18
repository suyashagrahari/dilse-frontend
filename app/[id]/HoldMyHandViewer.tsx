"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import HoldMyHand from "@/app/(templates)/hold-my-hand/components/HoldMyHand";
import { dbToHoldMyHandData, HMH } from "@/app/(templates)/hold-my-hand/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

/* ─────────────────────────────────────────
   Password gate — same dark world as the hold
───────────────────────────────────────── */
function HoldMyHandPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      } else { setError("Wrong password. Try again."); setPw(""); }
    } catch { setError("Something went wrong. Try again."); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-5"
      style={{
        background: `radial-gradient(120% 80% at 50% 20%, #2A1450 0%, #150B2C 44%, ${HMH.void} 100%)`,
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
            <div className="flex flex-col items-center mb-7">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg,#6C5CE7,#F72585)", boxShadow: "0 18px 40px -12px rgba(108,92,231,.8)" }}
              >
                <Lock size={28} color="#fff" />
              </motion.div>
              <h2 className="text-xl font-bold text-center mb-1" style={{ color: "#fff", fontFamily: HMH.display }}>
                This one&apos;s locked
              </h2>
              <p className="text-xs text-center leading-relaxed" style={{ color: "rgba(255,255,255,.55)" }}>
                They set a password before<br />handing you their hand.
              </p>
            </div>

            <div className="relative mb-4">
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
                placeholder="Enter password…"
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
              {loading ? <><Loader2 size={15} className="animate-spin" />Checking…</> : <><Lock size={15} />Open it</>}
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
