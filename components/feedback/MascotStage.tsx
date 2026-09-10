"use client";

// ─── The stage the mascot stands on ──────────────────────────────────────────
//
// One round, near-white disc that every beat of the feedback flow renders into
// — the reacting SVG face at the ask, an animated penguin at each escalation,
// the shiba on the way out.
//
// ── WHY A DISC AND NOT JUST THE IMAGE ───────────────────────────────────────
//
// All five animations are transparent PNG-style artwork drawn for a white
// chat background: pale cream fur, white highlights, thin dark outlines. Dropped
// straight onto this product's cream surface (#fffdfb over #f5ede6) the light
// halves of each character vanish into the card and the penguin loses its own
// belly. A dedicated white disc gives them the background they were drawn for
// without turning the rest of the sheet white, which is what the brand palette
// is for.
//
// The disc also does the job the old layout got for free from a fixed-size SVG:
// it is a constant, known box, so swapping a 200px GIF for a 498px one does not
// resize the card and shunt the Send button out from under a travelling thumb.
//
// ── WHY THE GLOW IS TINTED PER BEAT ─────────────────────────────────────────
//
// The copy changes at every stage, but copy is the slowest thing on screen to
// read. A colour behind the character says which beat this is before a single
// word is processed: warm gold while we are still asking politely, rose when the
// penguin is begging, a cool grey-blue for the sulk, green for thank-you. It is
// the same trick the rating label uses — say it twice, once in a way that does
// not need reading.

import type { CSSProperties, ReactNode } from "react";

export interface MascotStageProps {
  /** The glow behind the disc. A brand hex; alpha is applied here. */
  tone: string;
  /** The artwork — an <img> for a mascot, or the reacting SVG face. */
  children: ReactNode;
  /**
   * Replays the entrance when it changes. React keeps the DOM node across a
   * stage change because it is the same element in the same slot, so without a
   * key the CSS animation never re-runs and each new mascot fades in with no
   * arrival at all.
   */
  beat: string;
}

export default function MascotStage({ tone, children, beat }: MascotStageProps) {
  // ── SIZE IS A CLASS, NOT AN INLINE STYLE ────────────────────────────────
  //
  // Bigger on a phone, where this is a full-screen beat with room to spare and
  // the artwork is carrying the moment; smaller from 640px, where it sits in a
  // 420px card and a 200px plate would crowd the copy underneath. Both values
  // are in the stylesheet because an inline width cannot be overridden by a
  // media query — the same trap that made the card fill every desktop viewport.
  const style: CSSProperties = {
    position: "relative",
    margin: "0 auto",
    // ── A ROUNDED SQUARE, NOT A CIRCLE ────────────────────────────────────
    //
    // Every one of these is sticker artwork on a square canvas with its caption
    // set across the TOP — "PLEASE PLEASE", "THANK YOU", "See You Next Time!".
    // A circular plate cuts the corners off that square, and the first build
    // rendered the second penguin's caption as "EASE PLEAS" with its flippers
    // sliced off at the bottom. A circle inscribing a square would have to
    // scale the art to ~70% to fit it, which shrinks the character to nothing.
    //
    // A generous rounded rect keeps the whole frame, still reads as a deliberate
    // plate rather than a bare image, and matches the radius language the rest
    // of the sheet already uses.
    borderRadius: 30,
    // Near-white, warmed a shade toward the beat's own colour so the plate is
    // visible against the cream card without turning the sheet white. The
    // artwork's own highlights need something slightly warm behind them.
    background: `linear-gradient(180deg, #fffefc 0%, ${tone}0d 100%)`,
    display: "grid",
    placeItems: "center",
    // Two shadows: a tight ring that separates the plate from the cream card,
    // and a wide tinted bloom that carries the per-beat colour.
    boxShadow: `0 0 0 1px ${tone}26, 0 10px 34px -12px ${tone}59, 0 0 62px -6px ${tone}2e`,
    overflow: "hidden",
  };

  return (
    <div className="ssfbStage" style={style} key={beat} aria-hidden={false}>
      {children}
      <style>{`
        .ssfbStage {
          width: 204px;
          height: 204px;
          animation: ssfbPop 420ms cubic-bezier(0.22, 1.4, 0.36, 1) both;
        }
        @media (min-width: 640px) {
          .ssfbStage { width: 168px; height: 168px }
        }
        /* The artwork fills the plate without stretching or cropping. The inset
           is what stops a caption touching the rounded corner — every source
           draws its text hard against the top edge of its own canvas. */
        .ssfbStage > img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          padding: 7px;
          box-sizing: border-box;
        }
        /* The reacting SVG face is drawn on its own generous canvas, so it wants
           less of the plate than a sticker does or it reads as cramped. */
        .ssfbStage > svg {
          width: 76%;
          height: 76%;
        }
        @keyframes ssfbPop {
          0%   { opacity: 0; transform: scale(0.82) translateY(6px) }
          60%  { opacity: 1; transform: scale(1.04) translateY(0) }
          100% { opacity: 1; transform: scale(1) translateY(0) }
        }
        /* An arrival that overshoots is the joke landing. Under reduced motion
           it is simply there, which is correct rather than degraded. */
        @media (prefers-reduced-motion: reduce) {
          .ssfbStage { animation: none }
        }
      `}</style>
    </div>
  );
}
