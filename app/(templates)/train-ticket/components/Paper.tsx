"use client";

// ─── The paper ───────────────────────────────────────────────────────────────
// Shared primitives for both document screens. Everything here exists to make a
// browser look like a dot-matrix printer: hard 1px rules, no radii, no shadows,
// no gradients except the print banding, and one width that never reflows.

import { useEffect, useRef, useState } from "react";

/**
 * The document width. FIXED, forever.
 *
 * A slip that reflows is a web page; a slip that only ever scales is a
 * photograph of a printed slip. Nothing in either document may add a breakpoint
 * that changes this number — see SHARED-RULES §7.
 */
export const DOC_W = 380;

export const MONO = "var(--font-courier-prime), 'Courier New', monospace";
export const DEVANAGARI = "var(--font-tiro-devanagari), var(--font-courier-prime), serif";

export const PAPER = "#f7f5f0";
export const INK = "#111";
export const RULE = "#222";

/**
 * Faint horizontal banding every 3px, at 2%. This is what a dot-matrix head
 * leaves behind and it is the cheapest realism in the whole template — a flat
 * cream rectangle reads as a div, this reads as paper. A gradient, never an
 * image, so it survives `html-to-image` and costs nothing.
 */
export const BANDING =
  "repeating-linear-gradient(to bottom, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)";

/** The single vertical toner streak every tired office printer leaves. */
export function TonerStreak() {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "30%",
        width: 3,
        background: "#000",
        opacity: 0.06,
        pointerEvents: "none",
      }}
    />
  );
}

/**
 * Scales a fixed-width document to the viewport instead of reflowing it.
 *
 * Capped just above 1 so a desktop viewer sees a narrow slip on a wide desk
 * rather than a blown-up poster — and, importantly, so the fine print stays
 * genuinely hard to read at every size (acceptance criterion 4).
 */
export function Scaler({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(0);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const measure = () => {
      const w = wrapRef.current?.clientWidth ?? DOC_W;
      const s = Math.min(1.05, Math.max(0.5, w / DOC_W));
      setScale(s);
      // Centre by translating, NOT by `margin:auto` + `transform-origin:center`.
      // When the unscaled document is wider than its container, auto margins
      // collapse to zero and a centre origin pushes the right-hand edge out past
      // the clip — the slip silently loses its right border and its fare column.
      setOffset(Math.max(0, (w - DOC_W * s) / 2));
      const h = innerRef.current?.offsetHeight ?? 0;
      if (h) setHeight(h * s);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ width: "100%", height, overflow: "hidden" }}>
      <div
        ref={innerRef}
        style={{
          width: DOC_W,
          transform: `translateX(${offset}px) scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * The template's only stylesheet — two keyframes that cannot be expressed as
 * inline styles. Mounted once by `TrainTicket`. Both are switched off under
 * `prefers-reduced-motion`; nothing here carries meaning on its own.
 */
export function TicketStyles() {
  return (
    <style>{`
      @keyframes tt-blink { 50% { opacity: 0 } }
      @keyframes tt-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(17,17,17,.32) }
        70%      { box-shadow: 0 0 0 7px rgba(17,17,17,0) }
      }
      .tt-blink { animation: tt-blink .9s step-end infinite }
      .tt-pulse { animation: tt-pulse 2.4s ease-out infinite }
      @media (prefers-reduced-motion: reduce) {
        .tt-blink, .tt-pulse { animation: none }
      }
    `}</style>
  );
}

/** A labelled cell in the slip's box grid. Pre-printed label, typed value. */
export function Cell({
  label,
  children,
  style,
  valueStyle,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div style={{ padding: "4px 6px", minWidth: 0, ...style }}>
      <div style={{ fontSize: 7, letterSpacing: "0.1em", color: "#444", lineHeight: 1.3 }}>{label}</div>
      <div style={{ fontSize: 11, lineHeight: 1.35, fontWeight: 700, wordBreak: "break-word", ...valueStyle }}>
        {children}
      </div>
    </div>
  );
}
