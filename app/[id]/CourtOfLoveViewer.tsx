"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import CourtOfLove from "@/app/(templates)/court-of-love/components/CourtOfLove";
import { dbToCourtOfLoveData } from "@/app/(templates)/court-of-love/components/types";
import { COURT_THEMES } from "@/app/(templates)/court-of-love/components/themes";
import { COURT_FONT_VARS } from "@/app/(templates)/court-of-love/components/fonts";
import { COURT_CSS, GavelButton, HAND, MONO, PAPER_RULE, Paper, SANS, SERIF, Typed, WaxSeal } from "@/app/(templates)/court-of-love/components/courtKit";
import { LOVE_CSS, LoveSky } from "@/app/(templates)/_love/LoveKit";
import { V, pickTheme, themeVars } from "@/app/(templates)/_love/theme";
import { API_URL, IS_NGROK } from "@/lib/config";

// The shared page lives in the /[id] route group and never sees the template
// layout's fonts, so the Court's faces come in here (Inter is the root's).
const FONT_VARS = COURT_FONT_VARS;

/* ─────────────────────────────────────────
   Password gate — "sealed case file"
───────────────────────────────────────── */
function CourtPasswordGate({ shareId, themeId, onUnlocked }: { shareId: string; themeId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/court-of-love-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`court_of_love_unlocked_${shareId}`, "true");
        onUnlocked();
      } else {
        setError("Wrong password. Objection sustained!");
        setPw("");
      }
    } catch {
      setError("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  }, [pw, shareId, onUnlocked]);

  const theme = pickTheme(COURT_THEMES, themeId);
  return (
    <div
      className="lv-root"
      style={{ ...themeVars(theme), position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: theme.colors.base, fontFamily: SANS, overflowY: "auto" }}
    >
      <style>{LOVE_CSS + COURT_CSS}</style>
      <LoveSky theme={theme} reduceMotion={false} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
        style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 390 }}
      >
        <Paper style={{ padding: "28px 22px 22px", textAlign: "center" }}>
          <div style={{ marginTop: -62, marginBottom: 10 }}>
            <WaxSeal size={80} glyph="🔒" />
          </div>
          <Typed size={10.5} color={V.paperSoft}>
            In the Court of Love
          </Typed>
          <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 34, lineHeight: 1, color: V.paperInk, margin: "8px 0 6px" }}>This case file is sealed</h1>
          <p style={{ fontFamily: SANS, fontSize: 14, lineHeight: 1.5, color: V.paperSoft, margin: "0 0 18px" }}>Enter the password they gave you to open it.</p>

          <div style={{ position: "relative", marginBottom: 12 }}>
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
              placeholder="Password…"
              aria-label="Password"
              autoFocus
              autoComplete="off"
              style={{
                width: "100%",
                padding: "14px 46px 14px 16px",
                borderRadius: 14,
                background: "color-mix(in srgb, var(--lv-paper-ink) 4%, var(--lv-paper))",
                border: `1.5px solid ${error ? "#E5484D" : PAPER_RULE}`,
                boxShadow: error ? "0 0 0 3px rgba(229,72,77,.13)" : "none",
                fontFamily: MONO,
                fontSize: 16,
                color: V.paperInk,
                outline: "none",
                minHeight: 50,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: V.paperSoft, cursor: "pointer", padding: 4 }}
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#E5484D", marginBottom: 12 }}
              >
                <ShieldAlert size={13} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <GavelButton onClick={handleVerify} disabled={loading || !pw.trim()}>
            {loading ? (<><Loader2 size={16} className="animate-spin" /> Verifying…</>) : (<><Lock size={16} /> Open the case file</>)}
          </GavelButton>

          <p style={{ fontFamily: HAND, fontSize: 20, color: V.paperSoft, margin: "14px 0 0" }}>sent by someone who really, really likes you</p>
        </Paper>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Court of Love viewer (published page)
───────────────────────────────────────── */
export default function CourtOfLoveViewer({
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
    return sessionStorage.getItem(`court_of_love_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return (
      <div className={FONT_VARS}>
        <CourtPasswordGate shareId={shareId} themeId={typeof rawData.theme === "string" ? rawData.theme : ""} onUnlocked={() => setUnlocked(true)} />
      </div>
    );
  }

  const data = dbToCourtOfLoveData(rawData);

  return (
    <div className={FONT_VARS}>
      <CourtOfLove data={data} mode="live" shareId={shareId} />
    </div>
  );
}
