"use client";

// The recipient's page. Password gate first (when the sender set one), then the
// report at mode="live" — where the template itself renders the top-right
// SubhSandesh badge that doubles as the recipient's "create your own" path.

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import KundliMilanTemplate from "@/app/(templates)/kundli-milan/components/KundliMilanTemplate";
import { dbToKundliMilanData } from "@/app/(templates)/kundli-milan/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

const INK = "#141414";
const PAPER = "#fdfbf4";
const DESK = "#e8e3d6";
const SAFFRON = "#c8892e";
const MAROON = "#7a2020";
const SERIF = "var(--font-tinos), 'Times New Roman', Times, serif";
const TYPE = "var(--font-courier-prime), 'Courier New', Courier, monospace";
const DEVA = "var(--font-tiro-devanagari), var(--font-tinos), serif";

/**
 * The gate is a sealed office cover, not a glossy web modal — the report is
 * meant to read as paper from the first frame, and a rounded gradient dialog in
 * front of it would spend the illusion before the reader reaches the ruled boxes.
 */
function KundliPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/kundli-milan-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}) },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        // The one unlock key this template owns. Session-scoped on purpose:
        // the link stays gated for the next person who opens it.
        sessionStorage.setItem(`kundli-milan_unlocked_${shareId}`, "true");
        onUnlocked();
      } else {
        setError("Incorrect. The report stays sealed.");
        setPw("");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }, [pw, shareId, onUnlocked]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-5" style={{ background: DESK }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="w-full max-w-sm"
        style={{ background: PAPER, border: `1px solid ${INK}`, boxShadow: `0 0 0 6px ${PAPER}, 0 0 0 7px rgba(200,137,46,.35)` }}
      >
        <div style={{ borderBottom: `3px double ${INK}`, padding: "13px 16px 11px", textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: 12.5, letterSpacing: 2.4, fontWeight: 700, color: INK }}>
            KUNDLI MILAN REPORT
          </div>
          <div style={{ fontFamily: DEVA, fontSize: 11, color: MAROON, marginTop: 3 }}>
            कुण्डली मिलान रिपोर्ट
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 7.5, letterSpacing: 2.2, color: "#4a4a4a", marginTop: 5 }}>
            OFFICE OF THE REGISTRAR OF HEARTS
          </div>
        </div>

        <div style={{ padding: "18px 18px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={16} color={INK} />
            <h2 style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 700, letterSpacing: 1.4, color: INK, margin: 0 }}>
              THIS REPORT IS SEALED
            </h2>
          </div>
          <p style={{ fontFamily: SERIF, fontSize: 12.5, lineHeight: 1.65, color: "#3b3b3b", marginTop: 8 }}>
            Release is restricted to the named parties. Enter the password to view the milan.
          </p>

          <div style={{ position: "relative", marginTop: 14 }}>
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(ev) => { setPw(ev.target.value); setError(""); }}
              onKeyDown={(ev) => { if (ev.key === "Enter") handleVerify(); }}
              placeholder="password"
              autoFocus
              aria-label="Password"
              style={{
                width: "100%", minHeight: 46, padding: "0 46px 0 11px",
                fontFamily: TYPE, fontSize: 13, color: INK,
                background: "transparent", border: `1px solid ${error ? MAROON : INK}`,
                outline: "none", borderRadius: 0,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              style={{
                position: "absolute", right: 0, top: 0, height: "100%", width: 44,
                display: "grid", placeItems: "center",
                background: "none", border: "none", color: "#5a5a5a", cursor: "pointer",
              }}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontFamily: TYPE, fontSize: 11, color: MAROON }}
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
            {loading ? <><Loader2 size={14} className="animate-spin" /> VERIFYING…</> : "OPEN THE REPORT"}
          </button>

          <p style={{ fontFamily: SERIF, fontSize: 8, lineHeight: 1.6, color: "#6a6a6a", marginTop: 14, textAlign: "center" }}>
            Generated for entertainment · No astrological validity · <span style={{ color: SAFFRON }}>Ayanamsa: Lahiri</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function KundliMilanViewer({
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
    return sessionStorage.getItem(`kundli-milan_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <KundliPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  // Coerce defensively: this render happens on the recipient's device, where a
  // field missing from an older document must degrade, never crash.
  const data = dbToKundliMilanData(rawData);

  return <KundliMilanTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
