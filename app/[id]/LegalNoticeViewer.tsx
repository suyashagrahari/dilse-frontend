"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import LegalNotice from "@/app/(templates)/legal-notice/components/LegalNotice";
import { dbToLegalNoticeData } from "@/app/(templates)/legal-notice/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

const INK = "#141414";
const PAPER = "#fdfcf8";
const DESK = "#e6e3da";
const SERIF = "var(--font-tinos), 'Times New Roman', Times, serif";
const TYPE = "var(--font-courier-prime), 'Courier New', Courier, monospace";

/**
 * The gate is a sealed envelope, not a rounded modal — the notice starts the
 * moment the page loads, and a glossy web dialog in front of it would break the
 * illusion before the reader ever gets to the paper.
 */
function NoticePasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/legal-notice-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`legal-notice_unlocked_${shareId}`, "true");
        // Proof-of-unlock for POST /respond. The endpoint is public by design
        // (the addressee never signs in), so this token is what stops someone
        // who only has the link from ticking demands on a locked notice.
        sessionStorage.setItem(`legal-notice_unlock_token_${shareId}`, result.unlockToken || "");
        onUnlocked();
      } else { setError("Incorrect. The seal remains unbroken."); setPw(""); }
    } catch { setError("Something went wrong. Try again."); }
    finally { setLoading(false); }
  }, [pw, shareId, onUnlocked]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" style={{ background: DESK }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="w-full max-w-sm"
        style={{ background: PAPER, border: `1px solid ${INK}` }}
      >
        <div style={{ borderBottom: `3px solid ${INK}`, background: "#e8eef2", padding: "12px 16px" }}>
          <div style={{ fontFamily: SERIF, fontSize: 12, letterSpacing: 2.6, fontWeight: 700, color: INK }}>
            REPUBLIC OF US
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 7.5, letterSpacing: 3, color: "#2c4152", marginTop: 2 }}>
            NON-JUDICIAL · SEALED COVER
          </div>
        </div>

        <div style={{ padding: "20px 18px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={16} color={INK} />
            <h2 style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, letterSpacing: 1.6, color: INK, margin: 0 }}>
              THIS NOTICE IS SEALED
            </h2>
          </div>
          <p style={{ fontFamily: SERIF, fontSize: 12, lineHeight: 1.65, color: "#3b3b3b", marginTop: 8 }}>
            Service is restricted to the addressee. Enter the password to break the seal.
          </p>

          <div style={{ position: "relative", marginTop: 14 }}>
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(ev) => { setPw(ev.target.value); setError(""); }}
              onKeyDown={(ev) => { if (ev.key === "Enter") handleVerify(); }}
              placeholder="password"
              autoFocus
              style={{
                width: "100%", minHeight: 46, padding: "0 40px 0 11px",
                fontFamily: TYPE, fontSize: 13, color: INK,
                background: "transparent", border: `1px solid ${error ? "#b02020" : INK}`,
                outline: "none", borderRadius: 0,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#5a5a5a", cursor: "pointer" }}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontFamily: TYPE, fontSize: 11, color: "#b02020" }}
              >
                <ShieldAlert size={12} /><span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleVerify}
            disabled={loading || !pw.trim()}
            style={{
              width: "100%", minHeight: 46, marginTop: 14,
              fontFamily: TYPE, fontSize: 12, letterSpacing: 1.6,
              background: INK, color: PAPER, border: `1px solid ${INK}`, borderRadius: 0,
              cursor: "pointer", opacity: loading || !pw.trim() ? 0.45 : 1,
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> VERIFYING…</> : "BREAK THE SEAL"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function LegalNoticeViewer({
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
    return sessionStorage.getItem(`legal-notice_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <NoticePasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  const data = dbToLegalNoticeData(rawData);

  return <LegalNotice data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
