"use client";

// ─── Shared tokens + tiny chrome primitives for the kundli-milan template ────
//
// Everything here is presentation-only. No data is derived in this file; the
// report comes from `computeKundliReport` in types.ts and nowhere else.

import { useEffect, useState } from "react";

/** The report renders at this fixed CSS width at EVERY viewport, then scales. */
export const DOC_W = 420;
/** 9:16 share card, phone-shaped. */
export const CARD_W = 360;
export const CARD_H = 640;

// Colour discipline: black ink, one saffron accent, one maroon. Nothing else.
export const PAPER = "#fdfbf4";
export const INK = "#14110d";
export const SOFT_INK = "#3c352b";
/** Slightly warmer ink for the per-koota reading lines. */
export const WARM_INK = "#6b4a2a";
export const MAROON = "#7a2020";
export const SAFFRON = "#c8892e";

export const SERIF = "var(--font-tinos), 'Times New Roman', Times, serif";
export const MONO = "var(--font-courier-prime), 'Courier New', Courier, monospace";
export const DEVA = "var(--font-tiro-devanagari), var(--font-tinos), serif";
export const UIFONT = "var(--font-inter), system-ui, -apple-system, sans-serif";

/** Honour the OS setting — every looping asset on this template is decorative. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export interface ChipAnchor {
  top: number;
  left: number;
}

/**
 * A small floating note that lives in the page, never on the paper.
 *
 * When there is room in the gutter beside the block that triggered it, it is
 * absolutely positioned there (and therefore scrolls with the document). When
 * there is not — a phone — it drops to a fixed corner instead.
 */
export function FloatingChip({
  anchor,
  children,
  offset = 0,
}: {
  anchor: ChipAnchor | null;
  children: React.ReactNode;
  /** Vertical stacking offset for the fixed fallback, in px. */
  offset?: number;
}) {
  const style: React.CSSProperties = anchor
    ? { position: "absolute", top: anchor.top, left: anchor.left, zIndex: 60, maxWidth: 168 }
    : { position: "fixed", left: 12, bottom: 96 + offset, zIndex: 60, maxWidth: 220 };

  return (
    <div
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px 6px 6px",
        background: "rgba(255,255,255,.94)",
        border: `1px solid rgba(200,137,46,.45)`,
        boxShadow: "0 8px 22px -12px rgba(46,38,20,.5)",
        pointerEvents: "none",
      }}
      aria-hidden
    >
      {children}
    </div>
  );
}

/** The label used inside a floating chip. */
export function ChipText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: UIFONT, fontSize: 11, fontWeight: 600, color: "#4a4238", lineHeight: 1.3 }}>
      {children}
    </span>
  );
}

/** Plain, un-styled, form-era control surface. Deliberately not a pretty CTA. */
export const plainButton: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: 14,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: INK,
  background: PAPER,
  border: `1px solid ${INK}`,
  padding: "12px 22px",
  minHeight: 44,
  cursor: "pointer",
  borderRadius: 0,
};
