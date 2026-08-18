// ─── Caller ID — surface tokens and the portrait frame ───────────────────────
//
// This template is a PHONE SCREEN, so it is portrait and only portrait. On a
// desktop it letterboxes into a centred 400px column with a neutral surround
// rather than reflowing wide: a call screen that is 1400px across stops being a
// call screen, and every proportion in the identification card is tuned to a
// phone.
//
// ── COLOUR ───────────────────────────────────────────────────────────────────
//
// The accent is a warm green. It is the answer button's colour, the verified
// tick's colour and the tag's colour, and it is deliberately nowhere near the
// two blues named in `FORBIDDEN_COLORS` in types.ts. `ACCENT` is imported from
// the frozen contract rather than re-declared here so there is exactly one
// definition of it in the template; `accentWarm` is the lighter step of the
// same green used for large fills, where the darker one reads as grey.

"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ACCENT } from "./types";

/** The system stack. No webfont: a phone's own UI face is the joke. */
export const FONT = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

/** The call timer only. A proportional face makes the seconds jump sideways. */
export const MONO = `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`;

/** The letterbox width. Everything inside is laid out for 380–400px. */
export const COLUMN = 400;

export const DARK = {
  bg: "#101418",
  card: "#1A1F26",
  edge: "#262C34",
  text: "#FFFFFF",
  dim: "#9AA4AE",
  /** The frozen contract's accent — see the note at the top of this file. */
  accent: ACCENT,
  /** The lighter step of the same green, for 68px fills and the answer button. */
  accentWarm: "#1DA362",
  danger: "#E5484D",
  surround: "#07090B",
} as const;

export const LIGHT = {
  paper: "#FFFFFF",
  ink: "#101418",
  sub: "#6B7480",
  rule: "#EDEFF1",
  chip: "#F4F6F8",
  danger: "#E5484D",
  accent: "#1DA362",
  surround: "#E4E7EA",
} as const;

/** Answer / decline. Everything else is at least 44. */
export const TAP_BIG = 68;
export const TAP = 44;

/**
 * `prefers-reduced-motion`, live.
 *
 * Starts `false` and is corrected in an effect rather than read during render:
 * `matchMedia` does not exist on the server, and reading it in the render body
 * is the hydration mismatch this template would notice most (the rings would
 * start, then stop). Every consumer treats `true` as "the same screen, without
 * the movement" — nothing is gated on an animation finishing.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return reduced;
}

/**
 * The letterbox.
 *
 * `surround` paints the area outside the column on a wide screen; the column
 * itself always paints its own background, so the two are never the same value
 * and the boundary reads as a device edge rather than as a layout bug.
 */
export function PortraitFrame({
  surround,
  background,
  children,
  className,
}: {
  surround: string;
  background: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        background: surround,
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
      }}
    >
      <div
        className={className}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: COLUMN,
          minHeight: "100dvh",
          overflow: "hidden",
          background,
          fontFamily: FONT,
          // No horizontal scroll, ever — a 24-character tag wraps instead.
          overflowWrap: "anywhere",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * A number that counts up to its new value instead of jumping.
 *
 * Used for the tag count on a published page, where a friend's tag landing is
 * the one thing on screen that changes by itself and a silent swap from 2,481
 * to 2,482 is invisible. Under `enabled: false` — reduced motion — it prints
 * the value and nothing moves. The ref is written from the effect only.
 */
export function useCountUp(value: number, enabled = true): number {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (!enabled) {
      from.current = value;
      setDisplay(value);
      return;
    }
    const start = from.current;
    if (start === value) return;

    const t0 = performance.now();
    const DURATION = 600;
    let frame = requestAnimationFrame(function tick(now: number) {
      const t = Math.min(1, (now - t0) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    });

    return () => {
      cancelAnimationFrame(frame);
      from.current = value;
    };
  }, [value, enabled]);

  return display;
}

/* ── Avatar ────────────────────────────────────────────────────────────────── */

/**
 * Muted inks for the initials fallback.
 *
 * All desaturated and all warm-to-neutral. None of them is within reach of
 * either forbidden blue, which is why the slate is a graphite rather than a
 * steel.
 */
const AVATAR_INKS = ["#3F4A44", "#4A4239", "#46404A", "#3D423F", "#4A3F3F", "#3E4A3E"] as const;

/** FNV-1a. Stable across reloads, so one person always gets one colour. */
export function seededInk(name: string): string {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return AVATAR_INKS[Math.abs(h) % AVATAR_INKS.length];
}

/** Two letters at most. A dot rather than an empty circle when there is no name. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "·";
}

/**
 * The caller's photo, or her initials.
 *
 * A photo that 404s is the single most likely piece of bad data on a published
 * page — the sender pasted a link that expired — so the failure is a designed
 * state rather than a broken-image icon. The error flag resets when `src`
 * changes so a corrected URL is given a fresh chance.
 */
export function Avatar({
  name,
  src,
  size,
  ring,
  ringColor,
  fontScale = 0.36,
}: {
  name: string;
  src: string;
  size: number;
  /** Ring width in px. 0 for none. */
  ring?: number;
  ringColor?: string;
  fontScale?: number;
}) {
  // The failure is remembered against the URL that produced it rather than as
  // a bare boolean, so a corrected `src` is given a fresh chance without an
  // effect that resets state on every change.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc !== null && failedSrc === src;

  const shell: React.CSSProperties = {
    width: size,
    height: size,
    flex: "none",
    borderRadius: "50%",
    overflow: "hidden",
    display: "block",
    boxShadow: ring ? `0 0 0 ${ring}px ${ringColor ?? DARK.accent}` : undefined,
    background: seededInk(name),
  };

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        style={{
          ...shell,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.86)",
          fontSize: Math.round(size * fontScale),
          fontWeight: 600,
          letterSpacing: "0.02em",
          fontFamily: FONT,
        }}
      >
        {initialsOf(name)}
      </span>
    );
  }

  return (
    // A remote URL from a published page: `next/image` would need every host it
    // could ever point at allow-listed in advance.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      onError={() => setFailedSrc(src)}
      style={{ ...shell, objectFit: "cover" }}
    />
  );
}
