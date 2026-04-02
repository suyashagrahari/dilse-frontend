"use client";

/**
 * PublishSheet — shown after the user saves their birthday page.
 * Full-screen bottom sheet with a prominent Publish CTA.
 *
 * Payment hook: replace the free <PublishButton /> below with a
 * paywall / plan-selector when you're ready to monetise.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

/* ─── Design tokens ──────────────────────────────────────────────────── */
const BROWN       = "#5D3F31";
const BROWN_MID   = "rgba(93,63,49,0.55)";
const COPPER      = "#AD684A";
const PAPER       = "rgba(250,244,235,0.99)";
const CURSIVE     = "'Dancing Script','Brush Script MT',cursive";
const SERIF       = "'Cormorant Garamond',Georgia,serif";

/* ─── What's included checklist ─────────────────────────────────────── */
const FEATURES = [
  { emoji: "🏠", text: "Beautiful home page with photos & wish" },
  { emoji: "🖼️", text: "Gallery of your favourite memories" },
  { emoji: "🎵", text: "Personalised birthday playlist" },
  { emoji: "🎮", text: "Fun quiz & truth-or-dare games" },
  { emoji: "🎁", text: "Secret surprise section" },
  { emoji: "🔗", text: "Shareable link — send to anyone" },
];

/* ─── Props ──────────────────────────────────────────────────────────── */
interface Props {
  open: boolean;
  recipientName?: string;
  hasPassword?: boolean;
  publishing: boolean;
  onPublish: () => void;
  onClose: () => void;
}

export default function PublishSheet({
  open,
  recipientName,
  hasPassword,
  publishing,
  onPublish,
  onClose,
}: Props) {
  const [clicked, setClicked] = useState(false);

  const handlePublish = () => {
    if (publishing || clicked) return;
    setClicked(true);
    onPublish();
  };

  // Reset clicked state when sheet closes
  if (!open && clicked) setClicked(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="publish-sheet-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 600,
            background: "rgba(30,15,5,0.60)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !publishing) onClose();
          }}
        >
          <motion.div
            key="publish-sheet-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            style={{
              width: "100%",
              maxWidth: 520,
              background: PAPER,
              borderRadius: "24px 24px 0 0",
              padding: "0 0 env(safe-area-inset-bottom, 20px)",
              boxShadow: "0 -24px 80px rgba(60,30,10,0.28)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient accent bar */}
            <div style={{
              height: 4,
              background: `linear-gradient(90deg, ${COPPER}, ${BROWN}, ${COPPER})`,
              backgroundSize: "200% 100%",
              animation: "bgf-pub-shimmer 2.5s ease-in-out infinite",
            }} />

            <style>{`
              @keyframes bgf-pub-shimmer {
                0%   { background-position: 0% 50%; }
                50%  { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              @keyframes bgf-pub-pulse {
                0%,100% { box-shadow: 0 8px 28px rgba(93,63,49,0.32); }
                50%     { box-shadow: 0 12px 40px rgba(173,104,74,0.50); }
              }
            `}</style>

            <div style={{ padding: "28px 24px 24px" }}>

              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 18 }}
                  style={{ fontSize: 42, marginBottom: 8, lineHeight: 1 }}
                >
                  🎂
                </motion.div>
                <h2 style={{
                  fontFamily: CURSIVE,
                  fontSize: 26,
                  fontWeight: 700,
                  color: BROWN,
                  margin: "0 0 6px",
                  lineHeight: 1.1,
                }}>
                  {recipientName
                    ? `Ready for ${recipientName}! ✨`
                    : "Your page is ready! ✨"}
                </h2>
                <p style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 14,
                  color: BROWN_MID,
                  margin: 0,
                }}>
                  Publish to make it live and shareable
                </p>
              </div>

              {/* Feature checklist */}
              <div style={{
                borderRadius: 14,
                border: "1px solid rgba(93,63,49,0.14)",
                background: "rgba(93,63,49,0.03)",
                padding: "14px 16px",
                marginBottom: 20,
                display: "flex",
                flexDirection: "column",
                gap: 9,
              }}>
                {FEATURES.map((f) => (
                  <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{f.emoji}</span>
                    <span style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: 13,
                      color: BROWN,
                      opacity: 0.8,
                      lineHeight: 1.3,
                    }}>
                      {f.text}
                    </span>
                    <span style={{
                      marginLeft: "auto",
                      fontSize: 13,
                      color: "#27ae60",
                      flexShrink: 0,
                    }}>✓</span>
                  </div>
                ))}

                {hasPassword && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>🔒</span>
                    <span style={{
                      fontFamily: SERIF,
                      fontStyle: "italic",
                      fontSize: 13,
                      color: COPPER,
                      lineHeight: 1.3,
                    }}>
                      Password protected — only she can see it
                    </span>
                  </div>
                )}
              </div>

              {/* ── PAYMENT HOOK ──────────────────────────────────────────────────
               *  Replace this section with your plan selector / paywall when ready.
               *  The `onPublish` callback receives nothing extra right now, but you
               *  can pass a `plan` parameter here in the future.
               * ─────────────────────────────────────────────────────────────────── */}

              {/* Free badge */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginBottom: 14,
              }}>
                <div style={{
                  padding: "3px 12px",
                  borderRadius: 999,
                  background: "rgba(39,174,96,0.10)",
                  border: "1px solid rgba(39,174,96,0.30)",
                }}>
                  <span style={{
                    fontFamily: CURSIVE,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#27ae60",
                    letterSpacing: "0.04em",
                  }}>
                    ✦ Free to publish
                  </span>
                </div>
              </div>

              {/* Publish CTA */}
              <motion.button
                whileTap={{ scale: 0.975 }}
                onClick={handlePublish}
                disabled={publishing || clicked}
                style={{
                  width: "100%",
                  padding: "15px 0",
                  borderRadius: 999,
                  border: "none",
                  background: publishing || clicked
                    ? "rgba(93,63,49,0.30)"
                    : `linear-gradient(135deg, ${COPPER} 0%, ${BROWN} 100%)`,
                  fontFamily: CURSIVE,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fff",
                  cursor: publishing || clicked ? "not-allowed" : "pointer",
                  letterSpacing: "0.03em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  animation: publishing || clicked ? "none" : "bgf-pub-pulse 2.4s ease-in-out infinite",
                  transition: "background 0.2s",
                  marginBottom: 10,
                }}
              >
                {publishing || clicked ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Publishing…
                  </>
                ) : (
                  <>
                    🎉 Publish Birthday Page
                  </>
                )}
              </motion.button>

              {/* Dismiss */}
              {!publishing && !clicked && (
                <button
                  onClick={onClose}
                  style={{
                    width: "100%",
                    padding: "11px 0",
                    borderRadius: 999,
                    border: `1.5px solid ${BROWN_MID}`,
                    background: "transparent",
                    fontFamily: CURSIVE,
                    fontSize: 14,
                    color: "rgba(93,63,49,0.65)",
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                  }}
                >
                  Save for later
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
