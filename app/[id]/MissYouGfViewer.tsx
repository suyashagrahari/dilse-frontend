"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import MissYouTemplate from "@/app/(templates)/missyou-gf/components/MissYouTemplate";
import { dbToMissYouData } from "@/app/(templates)/missyou-gf/components/types";
import { NIGHT } from "@/app/(templates)/missyou-gf/components/theme";
import { API_URL, IS_NGROK } from "@/lib/config";

/* ── Password gate (night / indigo Miss-You theme) ── */
function MissYouPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/missyou-gf-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`missyou_unlocked_${shareId}`, "true");
        onUnlocked();
      } else { setError("Wrong password. Try again!"); setPw(""); }
    } catch { setError("Something went wrong. Try again!"); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", padding: 20, background: NIGHT.gradient }}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 340, damping: 26 }}
        className="relative w-full max-w-sm">
        <div style={{ borderRadius: 24, overflow: "hidden", background: NIGHT.base2, border: `1px solid ${NIGHT.hairline}`, boxShadow: "0 40px 80px -20px rgba(0,0,0,.7)" }}>
          <div style={{ height: 4, background: "linear-gradient(90deg,#6C5CE7,#F72585,#C6FF3D)" }} />
          <div className="px-7 pt-8 pb-7">
            <div className="flex flex-col items-center mb-6">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 64, height: 64, borderRadius: 18, display: "grid", placeItems: "center", marginBottom: 14, background: "linear-gradient(135deg,#6C5CE7,#F72585)", boxShadow: "0 0 30px rgba(108,92,231,.4)" }}>
                <Lock size={26} color="#fff" />
              </motion.div>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🤍</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: NIGHT.onNight, margin: 0 }}>This letter is private</h2>
              <p style={{ fontSize: 12, color: NIGHT.mutedNight, textAlign: "center", marginTop: 6, lineHeight: 1.5 }}>Enter the password to open it</p>
            </div>

            <div className="relative mb-4">
              <input type={showPw ? "text" : "password"} value={pw} onChange={(e) => { setPw(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }} placeholder="Enter password…" autoFocus aria-label="Enter the password"
                style={{ width: "100%", padding: "14px 44px 14px 16px", borderRadius: 16, fontSize: 14, outline: "none", background: NIGHT.raised, color: NIGHT.onNight, border: `1px solid ${error ? "#C81E6E" : NIGHT.hairline}` }} />
              <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: NIGHT.mutedNight, background: "transparent", border: "none", cursor: "pointer" }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} aria-live="polite"
                  className="flex items-center justify-center gap-1.5 mb-4" style={{ color: "#FF6FB0", fontSize: 12 }}>
                  <ShieldAlert size={12} /><span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleVerify} disabled={loading || !pw.trim()}
              style={{ width: "100%", padding: "14px", borderRadius: 16, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", cursor: "pointer", color: NIGHT.base, background: NIGHT.lime, opacity: loading || !pw.trim() ? 0.5 : 1 }}>
              {loading ? <><Loader2 size={15} className="animate-spin" />Verifying…</> : <><Lock size={15} />Open letter</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function MissYouGfViewer({ rawData, hasPassword, shareId }: {
  rawData: Record<string, unknown>; hasPassword: boolean; shareId: string;
}) {
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return !hasPassword;
    if (!hasPassword) return true;
    return sessionStorage.getItem(`missyou_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <MissYouPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  const data = dbToMissYouData(rawData);
  return <MissYouTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
