"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RAKHI_ASSETS, type Asset } from "../assets";
import { RB, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW, charmGlyph } from "./theme";
import type { RakhiData } from "./types";
import { AssetImage, fitAsset } from "./AssetImage";
import { ArchFrame, Rangoli, Diya, PetalBurst, RakhiCharm } from "./Ornaments";

// ─── The ritual ──────────────────────────────────────────────────────────────
//
// Four steps in the order they are actually performed: tilak, mithai, aarti,
// then the rakhi. Each explains itself in a sentence, because much of the
// audience has done this every year without being told why the rice goes on the
// tilak — and that explanation is what makes this worth opening instead of a
// video call.
//
// ── EVERY STEP IS FREE, STRUCTURALLY ────────────────────────────────────────
//
// Nothing in this file reads `data.shagun`. There is no prop, no import and no
// branch here that could withhold a step pending payment; the shagun block
// lives in GiftScreen, strictly after this component calls `onComplete`. That
// is not a promise — this component cannot gate on money because it cannot see
// it.
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

const STEPS: Step[] = [
  {
    key: "tilak",
    asset: RAKHI_ASSETS.tilak,
    action: "Apply the tilak",
    title: "Tilak",
    deva: "तिलक",
    why: "The red mark goes on his forehead first — it marks him as protected. The rice pressed into it is for prosperity, and the reason it sticks is the point: what she is giving him is meant to stay.",
    done: "Tilak lagaya",
  },
  {
    key: "mithai",
    asset: RAKHI_ASSETS.mithai,
    action: "Feed him the mithai",
    title: "Mithai",
    deva: "मिठाई",
    why: "Nothing in this house begins bitter. She feeds him a piece by hand before anything is tied, so that whatever the year brings, it starts sweet.",
    done: "Muh meetha",
  },
  {
    key: "aarti",
    asset: RAKHI_ASSETS.aarti,
    action: "Circle the aarti",
    title: "Aarti",
    deva: "आरती",
    why: "The lamp goes around him three times, clockwise. The flame is meant to take whatever bad luck is hanging about him and carry it off — an old, practical kind of love.",
    done: "Aarti utari",
  },
  {
    key: "bandhan",
    asset: RAKHI_ASSETS.bandhan,
    action: "Tie the rakhi",
    title: "Bandhan",
    deva: "बंधन",
    why: "Then the thread. It is not jewellery and it is not worth anything — that is deliberate. It is a knot, and the whole festival is named after it: raksha, to protect; bandhan, to bind.",
    done: "Rakhi bandh gayi",
  },
];

/** The four-charm progress thread. Fills as steps complete. */
function ProgressThread({ index, confirmed }: { index: number; confirmed: boolean }) {
  const doneCount = index + (confirmed ? 1 : 0);
  const pct = doneCount / STEPS.length;
  const W = 250;
  const GAP = W / (STEPS.length - 1);

  return (
    <div style={{ position: "relative", width: W, height: 40, flexShrink: 0 }}>
      <svg
        aria-hidden
        width={W}
        height={40}
        viewBox={`0 0 ${W} 40`}
        style={{ position: "absolute", inset: 0 }}
      >
        <line x1={0} y1={20} x2={W} y2={20} stroke={RB.hairline} strokeWidth={3} strokeLinecap="round" />
        <line
          x1={0}
          y1={20}
          x2={W}
          y2={20}
          stroke={RB.marigold}
          strokeWidth={3}
          strokeLinecap="round"
          className="rb-thread-fill"
          style={{ strokeDasharray: W, strokeDashoffset: W * (1 - pct) }}
        />
      </svg>

      <div
        style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={index + 1}
        aria-label={`Step ${index + 1} of ${STEPS.length}: ${STEPS[index].title}`}
      >
        {STEPS.map((s, i) => {
          const lit = i < index || (i === index && confirmed);
          const current = i === index && !confirmed;
          return (
            <span
              key={s.key}
              className={lit ? "rb-light" : undefined}
              style={{
                position: "absolute",
                left: i * GAP,
                transform: "translateX(-50%)",
                display: "grid",
                placeItems: "center",
                width: 30,
                height: 30,
                borderRadius: 999,
                background: lit ? RB.marigold : RB.surface,
                border: `2px solid ${lit ? RB.marigold : current ? RB.red : RB.hairline}`,
                transition: "background 300ms ease, border-color 300ms ease",
              }}
            >
              {lit ? (
                <Diya size={17} lit />
              ) : (
                <span style={{ fontSize: 11, fontWeight: 700, color: current ? RB.red : RB.muted }}>
                  {i + 1}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function RitualScreen({
  data,
  onComplete,
}: {
  data: RakhiData;
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [ripple, setRipple] = useState<{ id: number; x: number; y: number } | null>(null);
  const rippleId = useRef(0);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const art = fitAsset(step.asset, 244, 244);

  const advance = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!confirmed) {
        const r = e.currentTarget.getBoundingClientRect();
        setRipple({ id: ++rippleId.current, x: e.clientX - r.left, y: e.clientY - r.top });
        setConfirmed(true);
        // A short tap is the whole interaction, so give it a physical answer
        // where the device has one. Guarded — iOS Safari has no vibrate().
        navigator.vibrate?.(18);
        return;
      }
      if (isLast) {
        onComplete();
        return;
      }
      setConfirmed(false);
      setIndex((i) => i + 1);
    },
    [confirmed, isLast, onComplete]
  );

  return (
    <div
      className="rb-root"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "26px 22px 30px",
        textAlign: "center",
        gap: 14,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 190, left: "50%", transform: "translateX(-50%)", zIndex: 0 }}>
        <Rangoli size={330} opacity={0.05} />
      </div>

      <ProgressThread index={index} confirmed={confirmed} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step.key}
          initial={{ opacity: 0, x: 30, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -30, scale: 0.98 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 13,
            width: "100%",
          }}
        >
          <div>
            <p className="rb-deva" style={{ fontSize: 15, color: RB.brass, margin: 0, letterSpacing: 2 }}>
              {step.deva}
            </p>
            <h2
              className="rb-display"
              style={{ fontSize: 28, fontWeight: 700, color: RB.red, margin: "1px 0 0" }}
            >
              {step.title}
            </h2>
          </div>

          {/* The artwork, at its own proportions, inside a temple arch. */}
          <div style={{ position: "relative" }}>
            <ArchFrame width={art.width} height={art.height}>
              <AssetImage asset={step.asset} alt={step.title} maxWidth={art.width} maxHeight={art.height} />
            </ArchFrame>

            {confirmed && <PetalBurst count={12} />}

            <AnimatePresence>
              {confirmed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rb-stamp"
                  style={{
                    position: "absolute",
                    bottom: -13,
                    left: "50%",
                    transform: "translateX(-50%) rotate(-4deg)",
                    padding: "6px 15px",
                    borderRadius: 8,
                    background: RB.green,
                    color: "#fdf8ee",
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    whiteSpace: "nowrap",
                    boxShadow: "0 5px 14px rgba(47,107,79,0.34)",
                    zIndex: 6,
                  }}
                >
                  {step.done} ✓
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p
            style={{
              fontSize: 14.5,
              lineHeight: 1.62,
              color: RB.ink,
              maxWidth: 322,
              margin: "8px 0 0",
              background: "rgba(255,253,248,0.72)",
              padding: "13px 16px",
              borderRadius: 14,
              border: `1px solid ${RB.hairline}`,
            }}
          >
            {step.why}
          </p>

          {/* On the last step, show the rakhi she actually designed. */}
          {isLast && (
            <div
              className="rb-rise"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 11,
                padding: "8px 16px 8px 8px",
                borderRadius: 999,
                background: RB.surface,
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
        </motion.div>
      </AnimatePresence>

      <motion.button
        onClick={advance}
        whileTap={{ scale: 0.97 }}
        className={`rb-display ${confirmed ? "" : "rb-sheen"}`}
        style={{
          position: "relative",
          overflow: "hidden",
          marginTop: "auto",
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
        {confirmed ? (isLast ? "Ab gift do 👀" : "Next →") : step.action}
      </motion.button>
    </div>
  );
}
