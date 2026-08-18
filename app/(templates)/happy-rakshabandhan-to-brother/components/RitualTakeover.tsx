"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { RB } from "./theme";
import { PetalBurst } from "./Ornaments";
import type { Asset } from "../assets";

// ─── The act itself ──────────────────────────────────────────────────────────
//
// The ritual screen shows a card of words and a button. When the button is
// pressed the page gets out of the way entirely and the GIF performs the act,
// full screen, on nothing but paper. Then it fades and the step is done.
//
// This replaces the arch-mounted GIF that used to loop beside the text before
// anyone had touched anything. Two problems with that: the tilak was already
// applied while the button still said "apply the tilak", so the button was
// decoration; and boxing a 250px cel animation inside a bordered frame next to a
// paragraph makes it an illustration, when it is supposed to be the event.
//
// ── WHY A PORTAL ────────────────────────────────────────────────────────────
//
// `position: fixed` is NOT relative to the viewport inside a transformed
// ancestor — it is relative to that ancestor. Every screen here is rendered
// inside framer-motion wrappers that hold a transform for the page turn, so a
// fixed overlay declared in place would be trapped in the column it came from
// and cover about half the screen. Portalling to `document.body` escapes every
// one of them.
//
// The template's classes still apply because `rakhi.css` is global — the portal
// leaves the DOM tree, not the stylesheet.
//
// ── WHY IT AUTO-DISMISSES, AND IS ALSO TAPPABLE ─────────────────────────────
//
// The GIFs run 1.5–3s. The timer is set past the longest of them so the act is
// never cut off mid-motion, and a tap closes it early for anyone who has seen it
// before. Nothing is gated on either: `onDone` fires when the overlay leaves, by
// whichever route.

/** `document.body` never changes identity, so there is nothing to subscribe to. */
const NO_SUBSCRIBE = () => () => {};

export default function RitualTakeover({
  open,
  asset,
  alt,
  line,
  onDone,
}: {
  open: boolean;
  asset: Asset;
  alt: string;
  /** The confirmation, e.g. "Tilak lagaya". Lands after the animation starts. */
  line: string;
  onDone: () => void;
}) {
  // `document` only exists on the client, so the portal target is read the same
  // way every other client-only value in this template is — null on the server
  // and through hydration, the real thing after. Setting it from an effect gets
  // the same answer but trips `react-hooks/set-state-in-effect`.
  const host = useSyncExternalStore(NO_SUBSCRIBE, () => document.body, () => null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [open, onDone]);

  // A takeover that leaves the page scrollable behind it lets a stray swipe
  // scroll the ritual while the ritual is supposedly happening.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!host) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="rb-root"
          role="dialog"
          aria-label={alt}
          onClick={onDone}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            padding: "24px",
            textAlign: "center",
            cursor: "pointer",
            background: `radial-gradient(120% 100% at 50% 42%, ${RB.paper} 0%, ${RB.paperDeep} 62%, #f0dcc0 100%)`,
          }}
        >
          <PetalBurst count={14} />

          {/* No frame, no card, no border. The artwork sits on the paper.
              A plain <img>, not next/image: the optimiser re-encodes a GIF to a
              single frozen frame, which would leave the act not happening. */}
          <motion.img
            src={asset.src}
            alt={alt}
            initial={{ scale: 0.62, opacity: 0, y: 18 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0 }}
            transition={{ type: "spring", stiffness: 190, damping: 19 }}
            style={{
              width: "min(84vw, 460px)",
              maxHeight: "56vh",
              objectFit: "contain",
              // The cel art is drawn on flat colour; a drop shadow lifts it off
              // the paper without putting a box around it.
              filter: "drop-shadow(0 18px 40px rgba(61,35,23,0.22))",
            }}
          />

          <motion.p
            className="rb-display"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.45 }}
            style={{
              fontSize: "clamp(26px, 6.4vw, 42px)",
              fontWeight: 700,
              color: RB.red,
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            {line}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            style={{
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: RB.muted,
              margin: 0,
            }}
          >
            tap to continue
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>,
    host
  );
}
