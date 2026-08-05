"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, HeartCrack, Loader2 } from "lucide-react";

import ProposalTemplate from "@/app/(templates)/proposal/components/ProposalTemplate";
import { dbToProposalData } from "@/app/(templates)/proposal/components/types";
import { API_URL, IS_NGROK } from "@/lib/config";

// --font-fredoka is declared on <html> in the root layout, so it is already
// available inside the /[id] route group — no local next/font declaration needed.
const HEAD = "var(--font-fredoka), ui-rounded, system-ui, sans-serif";
const BODY = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

const CREAM = "#FFFBF7";
const PINK = "#F48FB1";
const PINK_SOFT = "#FFE3EF";
const LAVENDER = "#B39DDB";
const LAVENDER_SOFT = "#EDE6FB";
const TEXT = "#4A3B52";
const MUTED = "#8B7A93";
const ERROR = "#E5687F";

/* ─────────────────────────────────────────
   Password gate — "someone has a question"
───────────────────────────────────────── */
function ProposalPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = useCallback(async () => {
    if (!pw.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/proposal-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        sessionStorage.setItem(`proposal_unlocked_${shareId}`, "true");
        onUnlocked();
      } else {
        setError("That's not it — try once more 🥺");
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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: CREAM,
        backgroundImage: `
          radial-gradient(58% 42% at 8% 4%, rgba(244,143,177,.28), transparent 62%),
          radial-gradient(54% 40% at 94% 10%, rgba(179,157,219,.26), transparent 60%),
          radial-gradient(64% 46% at 50% 104%, rgba(255,227,239,.85), transparent 64%)
        `,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
        style={{ width: "100%", maxWidth: 380 }}
      >
        <div
          className="rounded-3xl"
          style={{
            background: "rgba(255,255,255,.72)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,.85)",
            overflow: "hidden",
            boxShadow: "0 34px 70px -22px rgba(179,157,219,.55)",
          }}
        >
          <div style={{ height: 5, background: `linear-gradient(90deg,${PINK},${LAVENDER})` }} />
          <div style={{ padding: "32px 26px 26px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-3xl"
                style={{
                  width: 66,
                  height: 66,
                  display: "grid",
                  placeItems: "center",
                  marginBottom: 14,
                  background: `linear-gradient(135deg,${PINK},${LAVENDER})`,
                  boxShadow: "0 16px 32px -8px rgba(244,143,177,.6)",
                }}
              >
                <Lock size={26} color="#fff" />
              </motion.div>
              <div style={{ fontSize: 24, marginBottom: 8 }}>💕</div>
              <h1
                style={{
                  fontFamily: HEAD,
                  fontSize: 21,
                  fontWeight: 600,
                  color: TEXT,
                  textAlign: "center",
                  margin: "0 0 7px",
                  lineHeight: 1.3,
                }}
              >
                Someone has a question for you
              </h1>
              <p
                style={{
                  fontFamily: BODY,
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: MUTED,
                  textAlign: "center",
                  margin: 0,
                }}
              >
                Enter the password they gave you
                <br />
                to open your little surprise.
              </p>
            </div>

            <div style={{ position: "relative", marginBottom: 14 }}>
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
                placeholder="Enter password…"
                autoFocus
                autoComplete="off"
                className="rounded-3xl"
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 17px",
                  background: error ? "rgba(229,104,127,.07)" : LAVENDER_SOFT,
                  border: `1.5px solid ${error ? ERROR : "rgba(255,255,255,.9)"}`,
                  boxShadow: error
                    ? "0 0 0 4px rgba(229,104,127,.12)"
                    : "inset 0 2px 6px rgba(179,157,219,.16)",
                  fontFamily: BODY,
                  fontSize: 14.5,
                  color: TEXT,
                  outline: "none",
                  minHeight: 50,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 15,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: MUTED,
                  cursor: "pointer",
                  padding: 2,
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
                  role="alert"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontFamily: BODY,
                    fontSize: 12,
                    color: ERROR,
                    marginBottom: 14,
                  }}
                >
                  <HeartCrack size={13} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleVerify}
              disabled={loading || !pw.trim()}
              className="rounded-3xl"
              style={{
                width: "100%",
                padding: "14px 20px",
                background: `linear-gradient(135deg,${PINK},${LAVENDER})`,
                color: "#fff",
                fontFamily: HEAD,
                fontSize: 15.5,
                fontWeight: 600,
                border: "none",
                boxShadow: "0 14px 30px -10px rgba(244,143,177,.75)",
                cursor: loading || !pw.trim() ? "default" : "pointer",
                opacity: loading || !pw.trim() ? 0.5 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                minHeight: 52,
              }}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Checking…</>
              ) : (
                <>Open my surprise 💌</>
              )}
            </motion.button>

            <p
              style={{
                fontFamily: BODY,
                fontSize: 11,
                color: MUTED,
                textAlign: "center",
                margin: "14px 0 0",
              }}
            >
              Made with a lot of love, just for you.
            </p>
          </div>
        </div>
      </motion.div>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(40% 30% at 50% 50%, transparent 60%, ${PINK_SOFT}00 100%)`,
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Proposal viewer (published page)
───────────────────────────────────────── */
export default function ProposalViewer({
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
    return sessionStorage.getItem(`proposal_unlocked_${shareId}`) === "true";
  });

  if (hasPassword && !unlocked) {
    return <ProposalPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  const data = dbToProposalData(rawData);

  // The brand logo / "create yours" affordance lives inside ProposalTemplate
  // when mode === "live" — do not add a second one here.
  return <ProposalTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
