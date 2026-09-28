"use client";

// ─── Dot-matrix LED strip ────────────────────────────────────────────────────
//
// Real dots, not monospace-with-a-text-shadow. The glyph plotter paints into an
// offscreen canvas once per message; the result becomes a background image that
// the compositor scrolls. That keeps a continuously scrolling sign at zero
// JavaScript per frame, which matters because this thing never stops moving.
//
// The unlit dots are painted too. A dot-matrix display you can see the dark
// dots of is the entire visual tell.

import { useEffect, useMemo, useRef } from "react";
import { DOT_CELL, DOT_COLS, DOT_ROWS, glyphFor, normaliseForDots } from "./dotFont";

const BASE_PITCH = 3.2;
const MIN_PITCH = 1.85;
/** px/sec, per the spec. */
const SCROLL_SPEED = 60;

interface Painted {
  url: string;
  w: number;
  h: number;
}

function paint(text: string, pitch: number, lit: string, dim: string): Painted | null {
  if (typeof document === "undefined" || text.length === 0) return null;

  const dpr = Math.min(4, Math.max(2, (window.devicePixelRatio || 1) * 1.5));
  const cellW = DOT_CELL * pitch;
  const wCss = text.length * cellW;
  const hCss = DOT_ROWS * pitch;

  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.round(wCss * dpr));
  cv.height = Math.max(1, Math.round(hCss * dpr));
  const g = cv.getContext("2d");
  if (!g) return null;
  g.scale(dpr, dpr);

  const r = Math.max(0.55, pitch * 0.37);
  const glyphs = text.split("").map(glyphFor);

  // Pass 1 — the dark grid, every cell including the inter-character gutter.
  g.fillStyle = dim;
  for (let ci = 0; ci < glyphs.length; ci++) {
    for (let col = 0; col < DOT_CELL; col++) {
      for (let row = 0; row < DOT_ROWS; row++) {
        g.beginPath();
        g.arc(ci * cellW + col * pitch + pitch / 2, row * pitch + pitch / 2, r * 0.74, 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  // Pass 2 — the lit dots, with a little bloom.
  g.fillStyle = lit;
  g.shadowColor = lit;
  g.shadowBlur = pitch * 1.1;
  for (let ci = 0; ci < glyphs.length; ci++) {
    const glyph = glyphs[ci];
    for (let row = 0; row < DOT_ROWS; row++) {
      const line = glyph[row] ?? "";
      for (let col = 0; col < DOT_COLS; col++) {
        if (line[col] !== "#") continue;
        g.beginPath();
        g.arc(ci * cellW + col * pitch + pitch / 2, row * pitch + pitch / 2, r, 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  return { url: cv.toDataURL("image/png"), w: wCss, h: hCss };
}

export interface DotMatrixDisplayProps {
  /** Scrolls right-to-left when no state text is showing. */
  idleText: string;
  /** Centred, static. Null falls back to the idle marquee. */
  text: string | null;
  flash?: boolean;
  width: number;
  height: number;
  /** The LED colour. A real colour, not a CSS variable — it is painted to a canvas. */
  color?: string;
  dimColor?: string;
}

export default function DotMatrixDisplay({
  idleText,
  text,
  flash = false,
  width,
  height,
  color = "#ffa500",
  dimColor = "rgba(255,165,0,0.09)",
}: DotMatrixDisplayProps) {
  const maxPitch = Math.min(BASE_PITCH, height / DOT_ROWS);

  // Work out whether the state text fits at a legible pitch; if it does not, it
  // joins the marquee rather than shrinking into illegibility.
  const plan = useMemo(() => {
    if (text !== null) {
      const body = normaliseForDots(text);
      const fitPitch = width / (Math.max(1, body.length) * DOT_CELL);
      const pitch = Math.min(maxPitch, fitPitch);
      if (pitch >= MIN_PITCH) {
        const cells = Math.max(body.length, Math.floor(width / (pitch * DOT_CELL)));
        const padTotal = Math.max(0, cells - body.length);
        const padL = Math.floor(padTotal / 2);
        return {
          scroll: false,
          pitch,
          content: " ".repeat(padL) + body + " ".repeat(padTotal - padL),
        };
      }
      return { scroll: true, pitch: maxPitch, content: `${body}     ` };
    }
    const body = normaliseForDots(idleText);
    return { scroll: true, pitch: maxPitch, content: `${body}     ` };
  }, [text, idleText, width, maxPitch]);

  // The painted strip is pushed straight onto the node rather than held in
  // state: it is an external artefact of the message, and round-tripping a
  // 40 KB data URL through React on every display change is pure waste.
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;
    const img = paint(plan.content, plan.pitch, color, dimColor);
    if (!img) return;
    el.style.backgroundImage = `url(${img.url})`;
    el.style.backgroundSize = `${img.w}px ${img.h}px`;
    el.style.backgroundPositionY = "center";
    if (plan.scroll) {
      el.style.backgroundRepeat = "repeat-x";
      el.style.backgroundPositionX = "";
      el.style.setProperty("--vm-scroll-end", `${-img.w}px`);
      el.style.setProperty("--vm-scroll-dur", `${(img.w / SCROLL_SPEED).toFixed(2)}s`);
    } else {
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundPositionX = "center";
    }
  }, [plan.content, plan.pitch, plan.scroll, color, dimColor]);

  return (
    <div
      aria-live="polite"
      aria-label={text ?? idleText}
      style={{
        position: "relative",
        height,
        overflow: "hidden",
        background: "#050505",
        border: "1px solid #000",
        boxShadow: "inset 0 2px 5px rgba(0,0,0,.9), inset 0 -1px 0 rgba(255,255,255,.05)",
      }}
    >
      <div
        ref={layerRef}
        className={`vm-flicker${plan.scroll ? " vm-scroll" : ""}${flash ? " vm-blink" : ""}`}
        style={{ position: "absolute", inset: 0 }}
      />
      {/* scan-line veneer over the glass of the display */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "repeating-linear-gradient(180deg, rgba(0,0,0,.32) 0 1px, transparent 1px 3px)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
