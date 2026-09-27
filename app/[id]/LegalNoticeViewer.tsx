"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import LegalNotice from "@/app/(templates)/legal-notice/components/LegalNotice";
import { dbToLegalNoticeData } from "@/app/(templates)/legal-notice/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

import { DATE_FONT_VARS } from "@/app/(templates)/date-invitation/components/fonts";
import { GROTESK, ITALIC } from "@/app/(templates)/_love/LoveKit";
import { pickTheme, type LoveTheme } from "@/app/(templates)/_love/theme";
import { LEGAL_THEMES } from "@/app/(templates)/legal-notice/components/themes";

/**
 * The gate is a sealed notice in the sender's chosen theme — the show starts
 * the moment the page loads.
 */
function NoticePasswordGate({ shareId, onUnlocked, theme }: { shareId: string; onUnlocked: () => void; theme: LoveTheme }) {
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

  const c = theme.colors;
  const grad = `linear-gradient(115deg, ${c.a1}, ${c.a2}, ${c.a3})`;
  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center px-4 ${DATE_FONT_VARS}`}
      style={{ background: c.bg, backgroundColor: c.base, fontFamily: GROTESK, color: c.ink }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="w-full max-w-sm"
        style={{ position: "relative", background: c.paper, color: c.paperInk, borderRadius: 26, padding: "26px 22px 22px", boxShadow: "0 40px 80px -30px rgba(0,0,0,.6)" }}
      >
        <span
          aria-hidden
          style={{ position: "absolute", right: 14, top: -16, padding: "6px 12px", border: `3px solid ${c.a1}`, color: c.a1, background: c.paper, borderRadius: 10, fontWeight: 800, fontSize: 14, letterSpacing: ".12em", textTransform: "uppercase", transform: "rotate(-8deg)" }}
        >
          sealed
        </span>
        <div style={{ width: 56, height: 56, borderRadius: 18, background: grad, display: "grid", placeItems: "center", color: "#fff" }}>
          <Lock size={24} />
        </div>
        <h2 style={{ margin: "14px 0 0", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}>This notice is sealed 🔒</h2>
        <p style={{ margin: "8px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 18, lineHeight: 1.35, color: c.paperSoft }}>
          Service is restricted to the addressee. Enter the password to break the seal.
        </p>

        <div style={{ position: "relative", marginTop: 16 }}>
          <input
            type={showPw ? "text" : "password"}
            value={pw}
            onChange={(ev) => { setPw(ev.target.value); setError(""); }}
            onKeyDown={(ev) => { if (ev.key === "Enter") handleVerify(); }}
            placeholder="password"
            aria-label="Password"
            autoFocus
            style={{
              width: "100%", minHeight: 50, padding: "0 46px 0 16px",
              fontFamily: GROTESK, fontSize: 16, color: c.paperInk,
              background: "rgba(0,0,0,.04)", border: `1.5px solid ${error ? c.a1 : "rgba(0,0,0,.14)"}`,
              outline: "none", borderRadius: 999,
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}
            style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, background: "none", border: "none", color: c.paperSoft, cursor: "pointer", display: "grid", placeItems: "center" }}
          >
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13, fontWeight: 700, color: c.a1 }}
            >
              <ShieldAlert size={14} /><span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleVerify}
          disabled={loading || !pw.trim()}
          style={{
            width: "100%", minHeight: 52, marginTop: 16,
            fontFamily: GROTESK, fontSize: 16, fontWeight: 800,
            background: grad, color: "#fff", border: "none", borderRadius: 999,
            cursor: "pointer", opacity: loading || !pw.trim() ? 0.5 : 1,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> checking…</> : "break the seal ⚖️"}
        </button>
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
    return <NoticePasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} theme={pickTheme(LEGAL_THEMES, rawData?.theme as string)} />;
  }

  const data = dbToLegalNoticeData(rawData);

  return <LegalNotice data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
