"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import ApologyDashboard from "@/app/(templates)/apology-dashboard/components/ApologyDashboard";
import { dbToApologyData } from "@/app/(templates)/apology-dashboard/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

/* ─────────────────────────────────────────
   Password Gate (rose / pink apology theme)
───────────────────────────────────────── */
function ApologyPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/apology-dashboard-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`apology_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("Wrong password. Try again!"); setPw(""); }
    } catch { setError("Something went wrong. Try again!"); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5 bg-gradient-to-b from-rose-50 via-pink-50/40 to-white dark:from-slate-950 dark:via-rose-950/20 dark:to-slate-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 25 }}
        className="relative w-full max-w-sm z-10"
      >
        <div className="rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40">
          <div className="h-1 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500" />
          <div className="px-7 pt-8 pb-7">
            <div className="flex flex-col items-center mb-7">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-rose-500/30"
              >
                <Lock size={28} className="text-white" />
              </motion.div>
              <motion.div className="text-3xl mb-2">🌹</motion.div>
              <h2 className="text-xl font-bold text-center mb-1 text-rose-600 dark:text-rose-400">
                This Apology is Private
              </h2>
              <p className="text-xs text-center leading-relaxed text-muted-foreground">
                Enter the password to view<br />this heartfelt apology
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
                className={`w-full px-4 py-3.5 pr-11 rounded-2xl text-sm outline-none transition-all bg-rose-50/50 dark:bg-slate-800/60 text-foreground border ${
                  error
                    ? "border-red-400/60 ring-2 ring-red-400/15"
                    : "border-rose-100 dark:border-rose-900/40 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
                }`}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-1.5 text-xs mb-4 text-red-500">
                  <ShieldAlert size={12} /><span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleVerify} disabled={loading || !pw.trim()}
              className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-40 text-white bg-gradient-to-r from-rose-400 to-pink-500 shadow-lg shadow-rose-500/30">
              {loading ? <><Loader2 size={15} className="animate-spin" />Verifying...</> : <><Lock size={15} />Open Apology</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Apology Dashboard Viewer (published page)
───────────────────────────────────────── */
export default function ApologyDashboardViewer({
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
    return sessionStorage.getItem(`apology_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <ApologyPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  const data = dbToApologyData(rawData);

  return <ApologyDashboard data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
