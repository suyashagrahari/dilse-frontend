"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import CourtMarriageTemplate from "@/app/(templates)/court-marriage/components/CourtMarriageTemplate";
import { dbToCourtMarriageData } from "@/app/(templates)/court-marriage/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

const SEAL = "#3f4c8f";

/* ─────────────────────────────────────────
   Password gate — a sealed registry envelope
───────────────────────────────────────── */
function CourtMarriagePasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/court-marriage-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`court-marriage_unlocked_${shareId}`, "true");
        onUnlocked();
      } else {
        setError("Wrong password. Try again!");
        setPw("");
      }
    } catch {
      setError("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  }, [pw, shareId, onUnlocked]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-5"
      style={{ background: "radial-gradient(120% 90% at 50% -10%, #ece5d5 0%, #e2dac7 45%, #d6cdb8 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 25 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="overflow-hidden rounded-3xl border shadow-2xl" style={{ background: "#fffdf7", borderColor: "#ddd7c6" }}>
          <div className="h-1" style={{ background: `linear-gradient(90deg, ${SEAL}, #6b7ac4, ${SEAL})` }} />
          <div className="px-7 pb-7 pt-8">
            <div className="mb-7 flex flex-col items-center">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl"
                style={{ background: `linear-gradient(135deg,#5566b8,#2f3a70)`, boxShadow: "0 16px 32px -14px rgba(63,76,143,.6)" }}
              >
                <Lock size={28} className="text-white" />
              </motion.div>
              <div className="mb-2 text-3xl" aria-hidden>📜</div>
              <h2 className="mb-1 text-center text-xl font-bold" style={{ color: SEAL }}>
                This record is sealed
              </h2>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Enter the password to view
                <br />
                this certificate of marriage
              </p>
            </div>

            <div className="relative mb-4">
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(ev) => { setPw(ev.target.value); setError(""); }}
                onKeyDown={(ev) => { if (ev.key === "Enter") handleVerify(); }}
                placeholder="Enter password..."
                autoFocus
                className={`w-full rounded-2xl border px-4 py-3.5 pr-11 text-sm outline-none transition-all ${
                  error ? "border-red-400/60 ring-2 ring-red-400/15" : "focus:ring-2"
                }`}
                style={{ background: "#f7f4ea", borderColor: error ? undefined : "#ddd7c6", color: "#2f2c24" }}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-4 flex items-center justify-center gap-1.5 text-xs text-red-500">
                  <ShieldAlert size={12} /><span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleVerify}
              disabled={loading || !pw.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-40"
              style={{ background: `linear-gradient(135deg,#5566b8,#2f3a70)`, minHeight: 48 }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />Verifying...</> : <><Lock size={15} />Open the record</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Court Marriage Certificate — published page
───────────────────────────────────────── */
export default function CourtMarriageViewer({
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
    return sessionStorage.getItem(`court-marriage_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <CourtMarriagePasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  return <CourtMarriageTemplate data={dbToCourtMarriageData(rawData)} mode="live" shareId={shareId} />;
}
