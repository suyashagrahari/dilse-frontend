"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RAKHI_ASSETS, type Asset } from "../assets";
import { RB, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW, charmGlyph } from "./theme";
import type { RakhiData } from "./types";
import { Rangoli, RakhiCharm, ThreadDivider, OrnateCard } from "./Ornaments";
import Stage, { BackLink, useIsDesktop } from "./Stage";
import RitualTakeover from "./RitualTakeover";
import type { Entry } from "./RakhiTemplate";

// ─── The ritual ──────────────────────────────────────────────────────────────
//
// Four steps in the order they are actually performed: tilak, mithai, aarti,
// then the rakhi. Each says why it happens, because most of the audience has
// done this every year without ever being told why the rice goes on the tilak —
// and that is the part worth opening a page for.
//
// ── NO PROGRESS RAIL ────────────────────────────────────────────────────────
//
// There used to be a numbered 1-2-3-4 thread pinned above the artwork. It was
// removed on purpose and should not come back. A step counter is accurate and it
// is also the single fastest way to turn a ceremony into a form: the moment the
// screen says "2 of 4", the reader stops looking at the tilak and starts working
// out how much is left. Nobody counts their way through an actual rakhi.
//
// What replaced it is the page turn — see `pageTurn` below. Movement tells you
// that you advanced, which is all the counter was really for, and it does it
// without ever putting a number on the ceremony.
//
// ── EVERY STEP IS FREE, STRUCTURALLY ────────────────────────────────────────
//
// Nothing in this file reads `data.shagun`. There is no prop, no import and no
// branch here that could withhold a step pending payment; the shagun block lives
// in GiftScreen, strictly after this component calls `onComplete`. That is not a
// promise — this component cannot gate on money because it cannot see it.
//
// ── GIF SIZING ──────────────────────────────────────────────────────────────
//
// Frames are sized from each asset's real ratio (see AssetImage). mithai is
// 217×197 and aarti 200×198; a fixed square would crop both. The arch hugs the
// artwork rather than the artwork being squeezed into the arch.

interface Step {
  key: string;
  asset: Asset;
  /** Imperative, on the button. */
  action: string;
  title: string;
  deva: string;
  /** Why this is done. */
  why: string;
  /** Confirmation, after the tap. */
  done: string;
}

// ── VOICE ───────────────────────────────────────────────────────────────────
//
// These read like a sister explaining it, not like a festival page. The earlier
// draft was correct and encyclopedic — "the rice pressed into it is for
// prosperity" — and it was three sentences long on a phone screen, above a GIF,
// which is where a reader starts scrolling. Short, warm, and funny where the
// ritual is genuinely funny; never at the ritual's expense.
const STEPS: Step[] = [
  {
    key: "tilak",
    asset: RAKHI_ASSETS.tilak,
    action: "Lagao tilak",
    title: "Tilak",
    deva: "तिलक",
    why: "Red first, then a few grains of rice pressed in so it holds. It is the oldest way of saying this one is mine — go easy on him this year.",
    done: "Tilak lagaya",
  },
  {
    key: "mithai",
    asset: RAKHI_ASSETS.mithai,
    action: "Muh meetha karao",
    title: "Mithai",
    deva: "मिठाई",
    why: "House rule: nobody starts a year bitter. One piece, fed by hand, before a single thread gets tied. Open up.",
    done: "Muh meetha",
  },
  {
    key: "aarti",
    asset: RAKHI_ASSETS.aarti,
    action: "Ghumao aarti",
    title: "Aarti",
    deva: "आरती",
    why: "Three slow circles, clockwise. The flame is on collection duty — whatever bad luck has been trailing you around all year leaves with the smoke.",
    done: "Aarti utari",
  },
  {
    key: "bandhan",
    asset: RAKHI_ASSETS.bandhan,
    action: "Baandho rakhi",
    title: "Bandhan",
    deva: "बंधन",
    why: "Now the thread. It cost almost nothing and that is the point — it is not jewellery, it is a knot. Raksha, to protect. Bandhan, to tie. You are officially stuck.",
    done: "Rakhi bandh gayi",
  },
];

/**
 * The turn itself.
 *
 * A plain cross-fade reads as a slideshow. Adding x, a single degree of rotate
 * and a hair of scale reads as paper: the outgoing page tips as it leaves and
 * the incoming one settles rather than arriving flat. One degree is the whole
 * trick — at three it looks like a card trick, at zero it looks like a slide.
 *
 * `dir` mirrors it. A page that always flies in from the right is fine until
 * you press Back and it does the same thing — then the motion says "forward"
 * while the content says "backward", and the screen feels like it disobeyed you.
 */
const pageTurn = (dir: 1 | -1) => ({
  initial: { opacity: 0, x: 52 * dir, rotate: 1.1 * dir, scale: 0.965 },
  animate: { opacity: 1, x: 0, rotate: 0, scale: 1 },
  exit: { opacity: 0, x: -46 * dir, rotate: -1.1 * dir, scale: 0.965 },
  transition: { duration: 0.46, ease: [0.22, 1, 0.36, 1] as const },
});

export default function RitualScreen({
  data,
  entry = "first",
  onComplete,
  onBack,
}: {
  data: RakhiData;
  /** "last" when arriving backwards from the gift — see Entry in RakhiTemplate. */
  entry?: Entry;
  onComplete: () => void;
  onBack: () => void;
}) {
  // Arriving backwards lands on the tied rakhi, already confirmed — the state
  // this screen was in when it handed over, not four taps before it.
  const [index, setIndex] = useState(entry === "last" ? STEPS.length - 1 : 0);
  const [confirmed, setConfirmed] = useState(entry === "last");
  /** True while the full-screen GIF is performing the act. */
  const [playing, setPlaying] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const [ripple, setRipple] = useState<{ id: number; x: number; y: number } | null>(null);
  const rippleId = useRef(0);
  const isDesktop = useIsDesktop();
  const turn = pageTurn(dir);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  /** The takeover has finished — by its timer or by a tap. The step is done. */
  const finishAct = useCallback(() => {
    setPlaying(false);
    setConfirmed(true);
  }, []);

  const advance = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!confirmed) {
        const r = e.currentTarget.getBoundingClientRect();
        setRipple({ id: ++rippleId.current, x: e.clientX - r.left, y: e.clientY - r.top });
        // The tap does not tick a box — it plays the act, full screen. `confirmed`
        // is set when that finishes, not here, so the card cannot show "done"
        // while the GIF is still doing it.
        setPlaying(true);
        // A short tap is the whole interaction, so give it a physical answer
        // where the device has one. Guarded — iOS Safari has no vibrate().
        navigator.vibrate?.(18);
        return;
      }
      if (isLast) {
        onComplete();
        return;
      }
      setDir(1);
      setConfirmed(false);
      setIndex((i) => i + 1);
    },
    [confirmed, isLast, onComplete]
  );

  /**
   * Back unwinds the same two-tap rhythm that advance builds.
   *
   * Forward is "do the thing" then "move on", so backward is "un-do the thing"
   * then "back a step" — pressing Back on a confirmed step returns you to that
   * step waiting to be performed, rather than skipping straight past it. Only
   * from the unconfirmed first step does it leave for the cover.
   */
  const back = useCallback(() => {
    if (confirmed) {
      setConfirmed(false);
      return;
    }
    if (index > 0) {
      setDir(-1);
      setIndex((i) => i - 1);
      setConfirmed(true);
      return;
    }
    onBack();
  }, [confirmed, index, onBack]);

  return (
    <>
    <Stage
      behind={
        <div
          style={{
            position: "absolute",
            top: "22%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 0,
          }}
        >
          <Rangoli size={430} opacity={0.05} />
        </div>
      }
      // Keyed on the step so a new sweep mounts on every turn. Without the key
      // React reuses the node, the animation never restarts, and the sweep plays
      // exactly once for the whole ritual.
      overlay={<span key={step.key} aria-hidden className="rb-page-edge" />}
      body={
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={step.key}
              {...turn}
              style={{ width: "100%", display: "flex", flexDirection: "column", gap: 13 }}
            >
              {/* ── The card IS the screen ──────────────────────────────────
               *
               * No artwork until the reader acts. What used to sit here was an
               * arch-mounted GIF looping beside the words before anyone had
               * touched anything — which gave away the act, made the button
               * decorative, and reduced a ceremony to an illustrated caption.
               *
               * So the step is now words in a frame, and the GIF is what the
               * button DOES: see RitualTakeover. */}
              <OrnateCard>
                <p
                  className="rb-deva"
                  style={{
                    fontSize: 13,
                    color: RB.brass,
                    margin: 0,
                    letterSpacing: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {step.deva}
                </p>

                <h2
                  className="rb-display"
                  style={{
                    fontSize: isDesktop ? 44 : 32,
                    fontWeight: 700,
                    color: RB.red,
                    margin: "6px 0 0",
                    lineHeight: 1.05,
                  }}
                >
                  {step.title}
                </h2>

                <div style={{ display: "grid", placeItems: "center", margin: "14px 0 16px" }}>
                  <ThreadDivider
                    colorA={data.rakhi.threadColorA}
                    colorB={data.rakhi.threadColorB}
                    width={isDesktop ? 220 : 150}
                  />
                </div>

                <p
                  style={{
                    fontSize: isDesktop ? 17.5 : 15.5,
                    lineHeight: 1.66,
                    color: RB.ink,
                    margin: "0 auto",
                    maxWidth: 460,
                  }}
                >
                  {step.why}
                </p>

                {/* Once the act is done, the confirmation lives in the card. */}
                <AnimatePresence>
                  {confirmed && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rb-stamp"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 7,
                        marginTop: 18,
                        padding: "7px 16px",
                        borderRadius: 999,
                        background: RB.green,
                        color: "#fdf8ee",
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: 0.4,
                        boxShadow: "0 5px 14px rgba(47,107,79,0.3)",
                      }}
                    >
                      {step.done} ✓
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* On the last step, show the rakhi she actually designed. */}
                {isLast && (
                  <div
                    className="rb-rise"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 11,
                      marginTop: 18,
                      padding: "8px 16px 8px 8px",
                      borderRadius: 999,
                      background: "rgba(255,253,248,0.9)",
                      border: `1px solid ${RB.hairline}`,
                      boxShadow: "0 3px 10px rgba(61,35,23,0.08)",
                    }}
                  >
                    <RakhiCharm
                      size={38}
                      colorA={data.rakhi.threadColorA}
                      colorB={data.rakhi.threadColorB}
                      bead={data.rakhi.beadColor}
                      glyph={charmGlyph[data.rakhi.charm] ?? "ॐ"}
                    />
                    <span style={{ fontSize: 13, color: RB.muted, textAlign: "left" }}>
                      {data.rakhi.pendantText
                        ? `“${data.rakhi.pendantText}” — from ${data.sisterName || "your sister"}`
                        : `from ${data.sisterName || "your sister"}`}
                    </span>
                  </div>
                )}
              </OrnateCard>
            </motion.div>
          </AnimatePresence>

          {/* Outside the AnimatePresence on purpose: the button is the one thing
              that must not move during a turn, or the second tap of a two-tap
              step lands on a control that is still sliding. */}
          <motion.button
            onClick={advance}
            whileTap={{ scale: 0.97 }}
            className={`rb-display rb-cta ${confirmed ? "" : "rb-sheen"}`}
            style={{
              position: "relative",
              overflow: "hidden",
              marginTop: 4,
              zIndex: 1,
              width: "100%",
              maxWidth: 320,
              minHeight: 56,
              padding: "16px 30px",
              borderRadius: 999,
              background: confirmed ? RB.surface : BRAND_GRADIENT,
              color: confirmed ? RB.ink : "#fffdf8",
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              fontSize: 16.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {ripple && (
              <span
                key={ripple.id}
                aria-hidden
                onAnimationEnd={() => setRipple(null)}
                className="rb-ripple"
                style={{
                  position: "absolute",
                  left: ripple.x - 60,
                  top: ripple.y - 60,
                  width: 120,
                  height: 120,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.55)",
                  pointerEvents: "none",
                }}
              />
            )}
            {confirmed ? (isLast ? "Ab gift do 👀" : "Aage badho →") : step.action}
          </motion.button>

          <BackLink onClick={back} />
        </>
      }
    />

    {/* The act. Portalled to <body>, so it fills the viewport rather than the
        transformed column this component renders inside. */}
    <RitualTakeover
      open={playing}
      asset={step.asset}
      alt={`${step.title} — ${step.action}`}
      line={step.done}
      onDone={finishAct}
    />
    </>
  );
}
