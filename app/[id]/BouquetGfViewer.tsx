"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import BouquetTemplate from "@/app/(templates)/bouquet-gf/components/BouquetTemplate";
import { dbToBouquetData } from "@/app/(templates)/bouquet-gf/components/types";
import { PAPER_GRADIENT, BQ } from "@/app/(templates)/bouquet-gf/components/theme";
import { API_URL, IS_NGROK } from "@/lib/config";

function BouquetPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/bouquet-gf-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`bouquet_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("Wrong password. Try again!"); setPw(""); }
    } catch { setError("Something went wrong. Try again!"); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", padding: 20, background: PAPER_GRADIENT }}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 340, damping: 26 }} className="relative w-full max-w-sm">
        <div style={{ borderRadius: 26, overflow: "hidden", background: BQ.paper, border: `2px solid ${BQ.ink}`, boxShadow: "6px 8px 0 rgba(43,36,64,0.16)" }}>
          <div style={{ height: 6, background: "linear-gradient(90deg,#ff8fb1,#b8a4f0,#ffe08a)" }} />
          <div className="px-7 pt-8 pb-7">
            <div className="flex flex-col items-center mb-6">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 64, height: 64, borderRadius: 18, display: "grid", placeItems: "center", marginBottom: 14, background: "linear-gradient(135deg,#ff8fb1,#b8a4f0)", border: `2px solid ${BQ.ink}` }}>
                <Lock size={26} color={BQ.ink} />
              </motion.div>
              <div style={{ fontSize: 28, marginBottom: 6 }}>💐</div>
              <h2 className="bq-display" style={{ fontSize: 20, fontWeight: 800, color: BQ.ink, margin: 0, fontFamily: "var(--font-bq-display), sans-serif" }}>This bouquet is private</h2>
              <p style={{ fontSize: 12, color: BQ.muted, textAlign: "center", marginTop: 6, lineHeight: 1.5 }}>Enter the password to open it</p>
            </div>

            <div className="relative mb-4">
              <input type={showPw ? "text" : "password"} value={pw} onChange={(e) => { setPw(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }} placeholder="Enter password…" autoFocus aria-label="Enter the password"
                style={{ width: "100%", padding: "14px 44px 14px 16px", borderRadius: 14, fontSize: 14, outline: "none", background: BQ.cream, color: BQ.ink, border: `2px solid ${error ? BQ.bubblegumDeep : BQ.border}` }} />
              <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: BQ.muted, background: "transparent", border: "none", cursor: "pointer" }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} aria-live="polite"
                  className="flex items-center justify-center gap-1.5 mb-4" style={{ color: BQ.bubblegumDeep, fontSize: 12 }}>
                  <ShieldAlert size={12} /><span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleVerify} disabled={loading || !pw.trim()}
              style={{ width: "100%", padding: "14px", borderRadius: 14, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: `2px solid ${BQ.ink}`, cursor: "pointer", color: BQ.ink, background: "linear-gradient(135deg,#ff8fb1,#b8a4f0)", opacity: loading || !pw.trim() ? 0.5 : 1, fontFamily: "var(--font-bq-display), sans-serif" }}>
              {loading ? <><Loader2 size={15} className="animate-spin" />Verifying…</> : <><Lock size={15} />Open bouquet</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function BouquetGfViewer({ rawData, hasPassword, shareId }: {
  rawData: Record<string, unknown>; hasPassword: boolean; shareId: string;
}) {
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return !hasPassword;
    if (!hasPassword) return true;
    return sessionStorage.getItem(`bouquet_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <BouquetPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  const data = dbToBouquetData(rawData);
  return <BouquetTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
