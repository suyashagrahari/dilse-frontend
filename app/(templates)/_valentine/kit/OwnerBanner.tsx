"use client";

// ─── The sender's banner on their own published page ────────────────────────
//
// When the signed-in owner opens their own share link, the viewer asks the
// owner-only GET for the page's reactions and shows one small pill at the top:
// "Your page · Said YES 💛 · 5 min ago" / "Said no 💔" / "Seen ✓" /
// "Not opened yet". After a few seconds it tucks itself into a small badge
// under the logo (top-right) so it never sits on the scene's heading; a tap
// opens it again. It never renders for anyone else (the owner GET 404s for a
// stranger, and the shared payload never carries reactions).

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS } from "../theme";
import type { ValentineReactions } from "../types";
import { answerChip } from "./answer";

const OPEN_MS = 6000;

export default function OwnerBanner({ r, yes, asks }: { r: ValentineReactions; yes?: string; asks: boolean }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setOpen(false), OPEN_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  const a = asks ? answerChip(r, yes) : null;
  const text = a ? a.text : r.completedAt ? "Seen it all ✓✓" : r.openedAt ? "Seen ✓ · no answer yet" : "Not opened yet";
  const no = a?.tone === "no";
  const badge = a ? (no ? "💔" : "💛") : r.openedAt ? "👀" : "✉️";

  return (
    <AnimatePresence initial={false} mode="wait">
      {open ? (
        <motion.button
          key="open"
          type="button"
          initial={{ opacity: 0, y: -8, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -6, x: "-50%" }}
          onClick={() => setOpen(false)}
          data-owner-banner={r.answer ?? "none"}
          aria-label={`Your page: ${text}. Tap to tuck it away.`}
          style={{
            position: "fixed",
            top: "calc(env(safe-area-inset-top, 0px) + 58px)",
            left: "50%",
            zIndex: 140,
            maxWidth: "min(92vw, 420px)",
            padding: "8px 14px",
            borderRadius: 99,
            border: `1.5px solid ${no ? "#e9a0a8" : "#e2b44a"}`,
            background: no ? "rgba(255,244,246,.97)" : "rgba(255,250,240,.97)",
            color: "#2a1a22",
            font: `600 13px ${FONTS.ui}`,
            boxShadow: "0 10px 30px -12px rgba(0,0,0,.45)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: "pointer",
          }}
        >
          <span style={{ opacity: 0.7, fontWeight: 700 }}>Your page · </span>
          {text}
        </motion.button>
      ) : (
        <motion.button
          key="badge"
          type="button"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          onClick={() => setOpen(true)}
          data-owner-banner={r.answer ?? "none"}
          aria-label={`Your page: ${text}. Tap for details.`}
          title={text}
          style={{
            position: "fixed",
            top: "calc(env(safe-area-inset-top, 0px) + 66px)",
            right: "max(14px, env(safe-area-inset-right, 0px))",
            zIndex: 140,
            width: 32,
            height: 32,
            padding: 0,
            borderRadius: 99,
            border: `1.5px solid ${no ? "#e9a0a8" : "#e2b44a"}`,
            background: "rgba(255,250,240,.96)",
            fontSize: 16,
            lineHeight: 1,
            boxShadow: "0 6px 16px -8px rgba(0,0,0,.5)",
            cursor: "pointer",
          }}
        >
          {badge}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
