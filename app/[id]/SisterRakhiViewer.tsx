"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";

import SisterTemplate from "@/app/(templates)/happy-rakshabandhan-to-sister/components/SisterTemplate";
import { dbToSisterData } from "@/app/(templates)/happy-rakshabandhan-to-sister/components/types";
import {
  PAPER_GRADIENT,
  RS,
  BRAND_GRADIENT,
  CARD_BORDER,
} from "@/app/(templates)/happy-rakshabandhan-to-sister/components/theme";
import { API_URL, IS_NGROK } from "@/lib/config";
import "@/app/(templates)/happy-rakshabandhan-to-sister/components/sister.css";

// ─── The published page his sister actually opens ────────────────────────────
//
// A near-twin of RakshaBandhanViewer, and deliberately a SEPARATE file rather
// than one viewer parameterised by side. The two differ in the API base, the
// palette module, the stylesheet and the copy of the gate, which is four of the
// five things in here — a shared component would be a body of conditionals with
// nothing left in common, and it would also mean the brother template (live)
// changes shape to accommodate a launch.
//
// The stylesheet import matters for a reason that is not obvious: both templates
// are code-split behind `dynamic()` in SharePageClient, so `rakhi.css` and
// `sister.css` only ever load on the page that needs them — but if a visitor
// somehow had both in one document, the class prefixes (`rb-` and `rs-`) keep
// them from touching. Never reach for an `rb-` class here.

function PasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/raksha-bandhan-sister-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) onUnlocked();
      else {
        // Never "wrong password" — the gate is a word a brother chose and told
        // her, and the failure is far more often a typo or a stale WhatsApp
        // forward than an intruder. Clearing the field is the one bit of
        // hostility here, and it exists so a mistyped word cannot be resubmitted
        // twenty times by someone holding the Enter key.
        setError("Not quite. Try again?");
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
      className="rs-root"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: PAPER_GRADIENT,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
        className="w-full max-w-sm"
      >
        <div
          style={{
            borderRadius: 24,
            overflow: "hidden",
            background: RS.surface,
            border: CARD_BORDER,
            boxShadow: "6px 8px 0 rgba(51,32,43,0.16)",
          }}
        >
          <div style={{ height: 6, background: BRAND_GRADIENT }} />
          <div style={{ padding: "30px 26px 26px" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 22 }}>
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 18,
                  display: "grid",
                  placeItems: "center",
                  marginBottom: 13,
                  background: BRAND_GRADIENT,
                  border: CARD_BORDER,
                }}
              >
                <Lock size={25} color="#fffdf8" />
              </div>
              <div style={{ fontSize: 26, marginBottom: 6 }} aria-hidden>
                🧿
              </div>
              <h2
                className="rs-display"
                style={{ fontSize: 20, fontWeight: 700, color: RS.rani, margin: 0, textAlign: "center" }}
              >
                This rakhi is private
              </h2>
              <p
                style={{
                  fontSize: 12.5,
                  color: RS.muted,
                  textAlign: "center",
                  marginTop: 6,
                  lineHeight: 1.5,
                }}
              >
                Your brother set a word. Enter it to open.
              </p>
            </div>

            <div style={{ position: "relative", marginBottom: 14 }}>
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerify();
                }}
                placeholder="Enter the word…"
                autoFocus
                aria-label="Enter the password"
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 16px",
                  borderRadius: 13,
                  fontSize: 14.5,
                  outline: "none",
                  background: RS.paper,
                  color: RS.ink,
                  border: `2px solid ${error ? RS.rani : RS.hairline}`,
                  minHeight: 48,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: RS.muted,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  aria-live="polite"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginBottom: 14,
                    color: RS.rani,
                    fontSize: 12.5,
                  }}
                >
                  <ShieldAlert size={12} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleVerify}
              disabled={loading || !pw.trim()}
              className="rs-display"
              style={{
                width: "100%",
                minHeight: 50,
                padding: 14,
                borderRadius: 13,
                fontSize: 15,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                border: CARD_BORDER,
                cursor: "pointer",
                color: "#fffdf8",
                background: BRAND_GRADIENT,
                opacity: loading || !pw.trim() ? 0.5 : 1,
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Checking…
                </>
              ) : (
                <>
                  <Lock size={15} />
                  Open it
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SisterRakhiViewer({
  rawData,
  hasPassword,
  shareId,
}: {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}) {
  // Unlock lives in component state only. Other viewers persist it in
  // sessionStorage; "no localStorage or sessionStorage" is an explicit
  // constraint on this template, so the cost is that a reload asks again.
  const [unlocked, setUnlocked] = useState(!hasPassword);

  // No font wiring here, and none needed: the faces this component's CSS uses
  // are declared in the ROOT layout, which wraps every route including this
  // one. See the note in the template's layout.tsx for why registering a new
  // family breaks the Docker build rather than the page.
  if (hasPassword && !unlocked) {
    return <PasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  // `mode="share"` is what makes her reply a real POST rather than in-memory
  // state, and `shareId` is what it POSTs to — this is the only call site where
  // the write-once slot is live. The builder preview passes mode="preview" so
  // that testing the page cannot burn it.
  return <SisterTemplate data={dbToSisterData(rawData)} mode="share" shareId={shareId} />;
}
