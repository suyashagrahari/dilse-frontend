"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RAKHI_ASSETS } from "../assets";
import { RB, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW, charmGlyph } from "./theme";
import type { RakhiData } from "./types";

// ─── The ritual ──────────────────────────────────────────────────────────────
//
// Four steps, in the order they are actually performed: tilak, mithai, aarti,
// then the rakhi. Each one explains itself in a sentence, because half the
// audience for this has done it every year without ever being told why the rice
// goes on the tilak, and the explanation is most of what makes a web page worth
// opening instead of a video call.
//
// ── EVERY STEP IS FREE ──────────────────────────────────────────────────────
//
// Nothing in this file reads `data.shagun`. There is no prop, no import and no
// branch here that could withhold a step pending payment — the shagun block
// lives in GiftScreen, strictly after this component has completed. That is
// structural, not a promise: this component cannot gate on money because it
// cannot see it.
//
// ── ANIMATED GIFs AND next/image ────────────────────────────────────────────
//
// `unoptimized` is REQUIRED on every GIF below. Without it the image optimiser
// re-encodes them to static WebP and each one silently becomes a single frozen
// frame — the ritual still "works", it just stops moving, which is the kind of
// bug that survives review because nothing errors.

interface Step {
  key: string;
  gif: string;
  /** The imperative, on the button. */
  action: string;
  title: string;
  /** Why this is done. The reason this page beats a WhatsApp forward. */
  why: string;
  /** Confirmation, after he taps. */
  done: string;
}

const STEPS: Step[] = [
  {
    key: "tilak",
    gif: RAKHI_ASSETS.tilak,
    action: "Apply the tilak",
    title: "Tilak",
    why: "The red mark goes on his forehead first — it marks him as protected. The rice pressed into it is for prosperity, and the reason it sticks is the point: what she is giving him is meant to stay.",
    done: "Tilak lagaya ✓",
  },
  {
    key: "mithai",
    gif: RAKHI_ASSETS.mithai,
    action: "Feed him the mithai",
    title: "Mithai",
    why: "Nothing in this house begins bitter. She feeds him a piece by hand before anything is tied, so that whatever the year brings, it starts sweet.",
    done: "Muh meetha ✓",
  },
  {
    key: "aarti",
    gif: RAKHI_ASSETS.aarti,
    action: "Circle the aarti",
    title: "Aarti",
    why: "The lamp goes around him three times, clockwise. The flame is meant to take whatever bad luck is hanging about him and carry it off — an old, practical kind of love.",
    done: "Aarti utari ✓",
  },
  {
    key: "bandhan",
    gif: RAKHI_ASSETS.bandhan,
    action: "Tie the rakhi",
    title: "Bandhan",
    why: "Then the thread. It is not jewellery and it is not worth anything — that is deliberate. It is a knot, and the whole festival is named after it: raksha, to protect; bandhan, to bind.",
    done: "Rakhi bandh gayi ✓",
  },
];

export default function RitualScreen({
  data,
  onComplete,
}: {
  data: RakhiData;
  onComplete: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  const advance = () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    if (isLast) {
      onComplete();
      return;
    }
    setConfirmed(false);
    setIndex((i) => i + 1);
  };

  return (
    <div
      className="rb-root"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "26px 22px 34px",
        textAlign: "center",
        gap: 16,
      }}
    >
      {/* Progress — one diya per step, lit as it is completed. */}
      <div
        style={{ display: "flex", gap: 10, alignItems: "center" }}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={index + 1}
        aria-label={`Step ${index + 1} of ${STEPS.length}: ${step.title}`}
      >
        {STEPS.map((s, i) => {
          const lit = i < index || (i === index && confirmed);
          return (
            <span
              key={s.key}
              aria-hidden
              className={lit ? "rb-light" : undefined}
              style={{
                fontSize: 19,
                opacity: lit ? 1 : 0.28,
                filter: lit ? "none" : "grayscale(1)",
                transition: "opacity 300ms ease",
              }}
            >
              🪔
            </span>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.key}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            width: "100%",
          }}
        >
          <h2
            className="rb-display"
            style={{ fontSize: 27, fontWeight: 700, color: RB.red, margin: 0 }}
          >
            {step.title}
          </h2>

          <div
            style={{
              width: "100%",
              maxWidth: 264,
              aspectRatio: "1 / 1",
              borderRadius: 20,
              overflow: "hidden",
              border: CARD_BORDER,
              boxShadow: CARD_SHADOW,
              background: RB.surface,
              position: "relative",
            }}
          >
            <Image
              src={step.gif}
              alt={step.title}
              fill
              // Required — see the note at the top of this file.
              unoptimized
              sizes="264px"
              style={{ objectFit: "cover" }}
            />
          </div>

          <p
            style={{
              fontSize: 14.5,
              lineHeight: 1.6,
              color: RB.ink,
              maxWidth: 320,
              margin: 0,
            }}
          >
            {step.why}
          </p>

          {/* On the last step, show what she actually designed. */}
          {isLast && (
            <div
              className="rb-rise"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 15px",
                borderRadius: 999,
                background: RB.surface,
                border: `1px solid ${RB.hairline}`,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  color: "#fffdf8",
                  background: `linear-gradient(135deg, ${data.rakhi.threadColorA}, ${data.rakhi.threadColorB})`,
                  border: `2px solid ${data.rakhi.beadColor}`,
                }}
              >
                {charmGlyph[data.rakhi.charm] ?? "ॐ"}
              </span>
              <span style={{ fontSize: 13, color: RB.muted }}>
                {data.rakhi.pendantText
                  ? `“${data.rakhi.pendantText}” — tied by ${data.sisterName || "your sister"}`
                  : `tied by ${data.sisterName || "your sister"}`}
              </span>
            </div>
          )}

          <div style={{ minHeight: 22 }}>
            {confirmed && (
              <p
                className="rb-bloom"
                aria-live="polite"
                style={{ fontSize: 14, fontWeight: 700, color: RB.green, margin: 0 }}
              >
                {step.done}
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={advance}
        className="rb-display"
        style={{
          marginTop: "auto",
          width: "100%",
          maxWidth: 320,
          minHeight: 52,
          padding: "15px 30px",
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
        {confirmed ? (isLast ? "Ab gift do 👀" : "Next") : step.action}
      </button>
    </div>
  );
}
