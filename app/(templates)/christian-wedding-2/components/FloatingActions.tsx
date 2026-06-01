"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Pencil, Send, Share2, Loader2 } from "lucide-react";

const C_ACCENT = "#546B57";
const C_MED    = "#7A9B7E";
const C_CARD   = "rgba(252,252,250,0.94)";

interface Props {
  isPreview?: boolean;
  isPersonalized?: boolean;
  showPublish?: boolean;
  showShare?: boolean;
  shareLabel?: string;
  publishing?: boolean;

  onBack: () => void;
  onEdit: () => void;
  onEditFromPreview?: () => void;
  onPublish?: () => void;
  onShare?: () => void;
  onDiscardPreview?: () => void;
}

export default memo(function FloatingActions({
  isPreview = false,
  isPersonalized = false,
  showPublish = false,
  showShare = false,
  shareLabel = "Share",
  publishing = false,

  onBack,
  onEdit,
  onEditFromPreview,
  onPublish,
  onShare,
  onDiscardPreview,
}: Props) {
  return (
    <>
      {/* ── Left (top) ──────────────────────────────────────────────────── */}
      <div className="fixed left-3 top-3 z-50 sm:left-4 sm:top-4">
        <motion.button
          key={isPreview ? "preview-back" : "back"}
          type="button"
          onClick={isPreview ? onDiscardPreview : onBack}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium shadow-xl"
          style={{
            background: C_CARD,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${C_MED}35`,
            color: C_MED,
            fontFamily: "var(--font-cinzel), Cinzel, serif",
          }}
          aria-label={isPreview ? "Back and edit" : "Go back"}
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">
            {isPreview ? "Back & Edit" : "Back"}
          </span>
        </motion.button>
      </div>

      {/* ── Right (top) ─────────────────────────────────────────────────── */}
      <div className="fixed right-3 top-3 z-50 flex items-center gap-2 sm:right-4 sm:top-4">
        <AnimatePresence mode="wait" initial={false}>
          {isPreview ? (
            <motion.div
              key="preview-actions"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={onEditFromPreview}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-xl"
                style={{
                  background: C_CARD,
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid ${C_MED}35`,
                  color: C_MED,
                  fontFamily: "var(--font-cinzel), Cinzel, serif",
                  letterSpacing: "0.05em",
                }}
                aria-label="Edit invitation"
              >
                <Pencil size={13} strokeWidth={2.4} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={onPublish}
                disabled={publishing}
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xl disabled:opacity-70"
                style={{
                  background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})`,
                  color: "#FFFAF8",
                  border: `1px solid ${C_ACCENT}`,
                  fontFamily: "var(--font-cinzel), Cinzel, serif",
                  letterSpacing: "0.05em",
                }}
                aria-label="Publish"
              >
                {publishing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>{publishing ? "Publishing…" : "Publish"}</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="actions"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              {/* Edit / Personalize */}
              <motion.button
                type="button"
                onClick={onEdit}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${C_ACCENT}, ${C_MED})`,
                  color: "#FFFAF8",
                  border: `1px solid ${C_ACCENT}`,
                  fontFamily: "var(--font-cinzel), Cinzel, serif",
                  letterSpacing: "0.05em",
                }}
                aria-label={isPersonalized ? "Edit invitation" : "Personalize invitation"}
              >
                <Pencil size={13} strokeWidth={2.4} />
                <span>{isPersonalized ? "Edit" : "Personalize"}</span>
              </motion.button>

              {/* Publish */}
              {showPublish && onPublish ? (
                <motion.button
                  type="button"
                  onClick={onPublish}
                  disabled={publishing}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-xl disabled:opacity-70"
                  style={{
                    background: C_CARD,
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: `1px solid ${C_ACCENT}40`,
                    color: C_ACCENT,
                    fontFamily: "var(--font-cinzel), Cinzel, serif",
                  }}
                  aria-label="Publish"
                >
                  {publishing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>Publish</span>
                </motion.button>
              ) : null}

              {/* Share */}
              {showShare && onShare ? (
                <motion.button
                  type="button"
                  onClick={onShare}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-xl"
                  style={{
                    background: C_CARD,
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: `1px solid ${C_MED}40`,
                    color: C_ACCENT,
                    fontFamily: "var(--font-cinzel), Cinzel, serif",
                  }}
                  aria-label="Share"
                >
                  <Share2 size={13} />
                  <span>{shareLabel}</span>
                </motion.button>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
});
