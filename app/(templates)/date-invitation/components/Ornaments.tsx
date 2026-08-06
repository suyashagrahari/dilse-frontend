"use client";

// ─── The Invitation — the shared paper vocabulary ────────────────────────────
//
// Owned by AGENT 1, used by the invitation, the countdown and the itinerary.
// The prop signatures here are the frozen contract other agents import against.
//
// Two rules run through everything below:
//
//   1. Ornament is LINE ART. Strokes only — no fills, no gradients, no drop
//      shadows anywhere in `CornerFlourishes` or `Rule`. This is meant to read
//      as an engraved letterpress border, and engraving cannot fill.
//      (`WaxSeal` is the deliberate exception: wax is a solid, not a line.)
//
//   2. Nothing is decorative to a screen reader. The dot leaders are a BORDER,
//      not a run of `.` characters, so "Duration ......... about 4 hours" is
//      announced as "Duration, about 4 hours" and nothing else.
//
// `Math.random()` is banned in a render path, so the seal's irregular blob is
// derived from `@/lib/seededRandom` keyed off the initial pressed into it: the
// same sender always gets the same lump of wax.

import type { ReactNode } from "react";
import { useMemo } from "react";

import { seededSpread } from "@/lib/seededRandom";
import { ACCENT, INK, INK_FAINT, INK_SOFT, MONO, PAPER, SERIF } from "./dateTheme";
import { TIMING } from "./types";

// ─── Corner flourishes ───────────────────────────────────────────────────────
//
// ONE path, drawn once for the top-left corner and then mirrored into the other
// three. That is what makes the four pieces read as a single ornament that
// happens to be interrupted by the card: every curve on the right is the exact
// reflection of a curve on the left, which is how a real engraved border is cut.

/** The outer sweep — the bracket that follows the card edge. */
const SWEEP_OUTER = "M0 34 L0 11 C0 4.9 4.9 0 11 0 L34 0";
/** A parallel hairline inset from it. The doubled line is the letterpress tell. */
const SWEEP_INNER = "M6.5 28 L6.5 13 C6.5 9.4 9.4 6.5 13 6.5 L28 6.5";
/** A quarter-round nested in the elbow, closing the corner off. */
const SWEEP_ARC = "M13 20.5 C13 16.4 16.4 13 20.5 13";
/** A small lozenge in the pocket between the two. Stroked, never filled. */
const LOZENGE = "M11.6 9.4 L13.8 11.6 L11.6 13.8 L9.4 11.6 Z";

const CORNERS = [
  { k: "tl", pos: { top: 0, left: 0 }, flip: "none" },
  { k: "tr", pos: { top: 0, right: 0 }, flip: "scaleX(-1)" },
  { k: "br", pos: { bottom: 0, right: 0 }, flip: "scale(-1, -1)" },
  { k: "bl", pos: { bottom: 0, left: 0 }, flip: "scaleY(-1)" },
] as const;

/**
 * Four inline-SVG line-art corner flourishes, absolutely positioned inside a
 * `position: relative` parent. Line art only — no fills, no gradients.
 */
export function CornerFlourishes({
  color = INK_FAINT,
  size = 34,
  inset = 10,
}: {
  color?: string;
  size?: number;
  inset?: number;
}) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: inset,
        right: inset,
        bottom: inset,
        left: inset,
        pointerEvents: "none",
      }}
    >
      {CORNERS.map((c) => (
        <svg
          key={c.k}
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
          style={{ position: "absolute", ...c.pos, transform: c.flip, display: "block" }}
        >
          <path d={SWEEP_OUTER} strokeWidth={1.1} />
          <path d={SWEEP_INNER} strokeWidth={0.7} />
          <path d={SWEEP_ARC} strokeWidth={0.7} />
          <path d={LOZENGE} strokeWidth={0.7} />
        </svg>
      ))}
    </span>
  );
}

// ─── Dot leader ──────────────────────────────────────────────────────────────

/**
 * A dot-leader row:  `Duration ......... about 4 hours`
 *
 * The dots are a `border-bottom: dotted` on an empty flex spacer, NOT literal
 * periods — a screen reader must hear "Duration, about 4 hours".
 *
 * The spacer has zero height, which is the whole trick: an empty flex item's
 * baseline is its bottom margin edge, so with `align-items: baseline` the
 * dotted border lands exactly on the text baseline where leader dots belong,
 * at any font size, without a magic offset.
 *
 * Long values wrap. The label is `flex: 0 0 auto` so it stays pinned left and
 * on one line; the value is `flex: 0 1 auto` with `min-width: 0` so it is the
 * thing that gives. Verified at 380px with a 60-character value.
 */
export function DotLeaderRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  /** Rendered as-is. May be a node so callers can drop in a weather icon. */
  value: ReactNode;
  /** True only for times. Monospace is reserved for times and the countdown. */
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 6,
        width: "100%",
        padding: "5px 0",
      }}
    >
      <span
        style={{
          flex: "0 0 auto",
          whiteSpace: "nowrap",
          fontFamily: SERIF,
          fontSize: 11,
          lineHeight: 1.5,
          letterSpacing: "0.17em",
          textTransform: "uppercase",
          color: INK_SOFT,
        }}
      >
        {label}
      </span>

      {/* The leader. Empty, aria-hidden, and purely a border. */}
      <span
        aria-hidden
        style={{
          flex: "1 1 14px",
          minWidth: 14,
          height: 0,
          borderBottom: `1.5px dotted ${INK_FAINT}`,
          transform: "translateY(-1px)",
        }}
      />

      <span
        style={{
          flex: "0 1 auto",
          minWidth: 0,
          textAlign: "right",
          fontFamily: mono ? MONO : SERIF,
          fontSize: mono ? 14 : 15,
          lineHeight: 1.45,
          color: INK,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Rule ────────────────────────────────────────────────────────────────────

/** A short centred ornamental rule: hairline, lozenge, hairline. */
export function Rule({ width = 90, color = INK_FAINT }: { width?: number; color?: string }) {
  const c = width / 2;
  const gap = 7;
  return (
    <svg
      aria-hidden
      width={width}
      height={9}
      viewBox={`0 0 ${width} 9`}
      fill="none"
      stroke={color}
      strokeWidth={0.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      style={{ display: "block", margin: "0 auto" }}
    >
      <line x1={0.5} y1={4.5} x2={c - gap} y2={4.5} />
      <line x1={c + gap} y1={4.5} x2={width - 0.5} y2={4.5} />
      <path d={`M${c} 1.5 L${c + 3} 4.5 L${c} 7.5 L${c - 3} 4.5 Z`} />
    </svg>
  );
}

// ─── Wax seal ────────────────────────────────────────────────────────────────

/**
 * A closed, smooth, slightly irregular blob. Deterministic: the radius wobble
 * comes from `seededSpread` keyed off the seed string, so the same sender's
 * seal is identical on every render, on every device, forever. No
 * `Math.random()` — a lump of wax that reshaped itself on re-render would be
 * the single most obvious bug on the page.
 */
function blobPath(seed: string, cx: number, cy: number, r: number, pts: number, wobble: number): string {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < pts; i++) {
    const a = (i / pts) * Math.PI * 2;
    const rad = r * (1 + seededSpread(seed, `wax${i}`, wobble));
    xs.push(cx + Math.cos(a) * rad);
    ys.push(cy + Math.sin(a) * rad);
  }
  const f = (n: number) => Math.round(n * 100) / 100;
  const midX = (i: number, j: number) => f((xs[i] + xs[j]) / 2);
  const midY = (i: number, j: number) => f((ys[i] + ys[j]) / 2);

  let d = `M${midX(pts - 1, 0)} ${midY(pts - 1, 0)}`;
  for (let i = 0; i < pts; i++) {
    const n = (i + 1) % pts;
    d += ` Q${f(xs[i])} ${f(ys[i])} ${midX(i, n)} ${midY(i, n)}`;
  }
  return `${d} Z`;
}

/** The one-shot press. Never loops: no `infinite`, no `alternate`. */
const SEAL_KEYFRAMES = `
@keyframes di-seal-press {
  0%   { transform: scale(2.15) rotate(-9deg); opacity: 0; }
  20%  { opacity: 1; }
  48%  { transform: scale(0.935) rotate(2deg); opacity: 1; }
  72%  { transform: scale(1.04) rotate(-1.2deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}`;

/**
 * The wax seal. One-shot only: it presses down once when `stamped` flips true
 * and then holds. No looping, no ambient motion.
 *
 * The animation runs for exactly `TIMING.sealMs`, which is also the delay the
 * card waits before calling `onAccept` — one constant, two consumers, so the
 * hand-off can never land early or leave a dead beat on screen.
 *
 * Under reduced motion it appears instantly, already stamped. Reduced motion
 * removes decoration, never functionality.
 */
export function WaxSeal({
  initial,
  stamped,
  reduceMotion,
  size = 96,
  color = ACCENT,
}: {
  /** Letter pressed into the wax — the sender's initial. */
  initial: string;
  stamped: boolean;
  reduceMotion: boolean;
  size?: number;
  color?: string;
}) {
  const letter = (initial || "").trim().charAt(0).toUpperCase() || "•";
  const seed = `seal:${letter}`;

  const body = useMemo(() => blobPath(seed, 50, 50, 40, 20, 0.055), [seed]);
  // A second, tighter blob for the pressed rim. Different key, same seed, so it
  // is irregular in a way that agrees with the outer edge instead of fighting it.
  const rim = useMemo(() => blobPath(`${seed}:rim`, 50, 50, 30.5, 16, 0.045), [seed]);

  const animated = stamped && !reduceMotion;

  return (
    <span
      aria-hidden
      style={{
        display: "block",
        width: size,
        height: size,
        opacity: stamped ? 1 : 0,
        transformOrigin: "50% 50%",
        willChange: animated ? "transform" : undefined,
        animation: animated
          ? `di-seal-press ${TIMING.sealMs}ms cubic-bezier(0.22, 0.9, 0.24, 1) both`
          : undefined,
      }}
    >
      <style>{SEAL_KEYFRAMES}</style>
      <svg width={size} height={size} viewBox="0 0 100 100" focusable="false" style={{ display: "block" }}>
        {/* The wax itself. */}
        <path d={body} fill={color} />
        {/* Where the die bit into it — a dark press line just inside the edge. */}
        <path d={rim} fill="none" stroke={INK} strokeOpacity={0.22} strokeWidth={1.6} />
        {/* The squeezed-out lip catching the light, on the upper left only. */}
        <path
          d="M22 38 C26 26 36 18 49 16"
          fill="none"
          stroke={PAPER}
          strokeOpacity={0.3}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <text
          x={50}
          y={50}
          textAnchor="middle"
          dominantBaseline="central"
          fill={PAPER}
          fillOpacity={0.92}
          style={{ fontFamily: SERIF, fontSize: 40, fontWeight: 700, letterSpacing: "0.02em" }}
        >
          {letter}
        </text>
      </svg>
    </span>
  );
}
