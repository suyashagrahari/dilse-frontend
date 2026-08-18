"use client";

// ─── Inked stamps ────────────────────────────────────────────────────────────
//
// A flat, evenly-coloured, axis-aligned label reads as a UI badge. A stamp reads
// as something pressed onto paper: rotated, uneven in density, ragged at the
// edges.
//
// Two effects do that here — a radial-gradient mask for the density and a very
// low-strength turbulence displacement for the edges. Both are refinements. If
// `html-to-image` drops the SVG filter during a PNG capture, or a browser
// ignores the mask, what remains is a rotated bordered caps label, which is
// still correct. Nothing load-bearing sits inside the filter.

import { INK_FILTER_ID, INK_MASK, STENCIL } from "./flagsTheme";

/**
 * The turbulence filter, mounted exactly once at the template root. Referencing
 * a missing filter id is a no-op in every engine, which is the intended
 * degradation inside an exported canvas.
 */
export function InkFilterDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter id={INK_FILTER_ID} x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="2" seed="17" result="grain" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="grain"
            scale="1.4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

interface InkStampProps {
  text: string;
  color: string;
  /** Degrees. Never 0 for the overrule stamp — axis-aligned kills the illusion. */
  rotate: number;
  opacity?: number;
  fontSize?: number;
  padding?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function InkStamp({
  text,
  color,
  rotate,
  opacity = 1,
  fontSize = 20,
  padding = "7px 14px 6px",
  style,
}: InkStampProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        fontFamily: STENCIL,
        fontWeight: 600,
        fontSize,
        lineHeight: 1,
        letterSpacing: "0.2em",
        textIndent: "0.2em",
        whiteSpace: "nowrap",
        color,
        border: `2px solid ${color}`,
        borderRadius: 2,
        padding,
        opacity,
        transform: `rotate(${rotate}deg)`,
        WebkitMaskImage: INK_MASK,
        maskImage: INK_MASK,
        filter: `url(#${INK_FILTER_ID})`,
        ...style,
      }}
    >
      {text}
    </span>
  );
}
