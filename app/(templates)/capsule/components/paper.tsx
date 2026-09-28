"use client";

// ─── Capsule — the physical bits ─────────────────────────────────────────────
//
// Aged paper, wax, and ink that does not sit perfectly straight. Everything
// irregular here is SEEDED: `Math.random()` in a render path would re-roll the
// grain on every re-render, which reads as the page shivering, and would make
// the exported PNG disagree with what was on screen.

import { useId, useMemo } from "react";
import { PALETTE, MONO } from "./types";
import { seededSpread, seededUnit, hash32 } from "@/lib/seededRandom";

// ═══════════════════════════════════════════════════════════════════════════
// Paper
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fibrous grain, via SVG turbulence at very low opacity. A tiling PNG would be
 * another network request and another thing to go missing in 2027; this is
 * about 400 bytes of markup and renders identically in the html-to-image clone.
 */
export function PaperTexture({
  seed,
  opacity = 0.055,
  baseFrequency = 0.9,
}: {
  seed: string;
  opacity?: number;
  baseFrequency?: number;
}) {
  const uid = useId().replace(/[:]/g, "");
  const n = hash32(seed) % 1000;
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity, mixBlendMode: "multiply" }}
      preserveAspectRatio="none"
    >
      <filter id={`grain-${uid}`}>
        <feTurbulence type="fractalNoise" baseFrequency={baseFrequency} numOctaves={4} seed={n} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain-${uid})`} />
    </svg>
  );
}

/**
 * Worn edges. A soft inset shadow plus a seeded, slightly-off border radius —
 * paper that has been handled does not have four identical corners.
 */
export function wornEdgeStyle(seed: string): React.CSSProperties {
  const r = (k: string) => 3 + Math.round(seededUnit(seed, k) * 9);
  return {
    borderRadius: `${r("tl")}px ${r("tr")}px ${r("br")}px ${r("bl")}px`,
    boxShadow: `0 1px 0 rgba(255,255,255,.6) inset, 0 -1px 0 ${PALETTE.edge} inset, 0 10px 24px -12px rgba(34,29,24,.35)`,
  };
}

/** The aged-paper fill, with a faint uneven wash so it is not a flat colour. */
export function paperFill(seed: string): React.CSSProperties {
  const x = 20 + Math.round(seededUnit(seed, "wash-x") * 60);
  const y = 10 + Math.round(seededUnit(seed, "wash-y") * 40);
  return {
    background: `radial-gradient(120% 90% at ${x}% ${y}%, ${PALETTE.paper} 0%, ${PALETTE.paperDeep} 78%, ${PALETTE.edge} 130%)`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Wax
// ═══════════════════════════════════════════════════════════════════════════

/** A closed blob path around (cx,cy). Seeded, so the wax never re-melts. */
function blobPath(seed: string, cx: number, cy: number, r: number, points = 14, jitter = 0.09): string {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (1 + seededSpread(seed, `blob-${i}`, jitter));
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  // Catmull-Rom-ish: join the points with quadratics through their midpoints so
  // the outline is molten rather than faceted.
  let d = "";
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    d += i === 0 ? `M ${mx.toFixed(2)} ${my.toFixed(2)} ` : `Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)} `;
  }
  const [fx, fy] = pts[0];
  const [sx, sy] = pts[1];
  d += `Q ${fx.toFixed(2)} ${fy.toFixed(2)} ${((fx + sx) / 2).toFixed(2)} ${((fy + sy) / 2).toFixed(2)} Z`;
  return d;
}

export type SealState =
  /** Whole. */
  | "whole"
  /** 30 days out: a fine crack in the wax. */
  | "cracked"
  /** 7 days out: a faint glow. */
  | "glowing"
  /** Mid-ceremony: the two halves are apart. */
  | "split";

/**
 * The seal. TWO PIECES, always — the same left and right halves are used for
 * the press and for the crack, so the thing that splits is visibly the thing
 * that was pressed down.
 *
 * Rotated -5°: a seal pressed by a hand is never square to the page.
 */
export function WaxSeal({
  seed,
  size = 96,
  state = "whole",
  initials,
  splitPx = 0,
}: {
  seed: string;
  size?: number;
  state?: SealState;
  /** Two letters pressed into the wax. Falls back to a plain ring. */
  initials?: string;
  /** How far apart the halves sit, in px. Drives the crack animation. */
  splitPx?: number;
}) {
  const uid = useId().replace(/[:]/g, "");
  const outer = useMemo(() => blobPath(seed, 50, 50, 42, 16, 0.075), [seed]);
  const inner = useMemo(() => blobPath(`${seed}-inner`, 50, 50, 30, 14, 0.05), [seed]);
  const crack = useMemo(() => {
    const j = (k: string) => seededSpread(seed, k, 4);
    return `M ${50 + j("c0")} 12 L ${47 + j("c1")} 34 L ${53 + j("c2")} 52 L ${46 + j("c3")} 70 L ${51 + j("c4")} 88`;
  }, [seed]);
  const rot = -5 + seededSpread(seed, "seal-rot", 1.4);

  const glow = state === "glowing";
  const showCrack = state === "cracked" || state === "split";

  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ transform: `rotate(${rot.toFixed(2)}deg)`, overflow: "visible", display: "block" }}
    >
      <defs>
        <radialGradient id={`wax-${uid}`} cx="38%" cy="32%" r="72%">
          <stop offset="0%" style={{ stopColor: PALETTE.waxHi }} />
          <stop offset="55%" style={{ stopColor: PALETTE.wax }} />
          <stop offset="100%" style={{ stopColor: PALETTE.waxDeep }} />
        </radialGradient>
        <filter id={`waxgrain-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves={3} seed={hash32(seed) % 500} />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.22" />
          </feComponentTransfer>
        </filter>
        <clipPath id={`half-l-${uid}`}>
          <rect x="-10" y="-10" width="60" height="120" />
        </clipPath>
        <clipPath id={`half-r-${uid}`}>
          <rect x="50" y="-10" width="60" height="120" />
        </clipPath>
      </defs>

      {glow && (
        <ellipse cx="50" cy="50" rx="52" ry="52" opacity="0.28" style={{ fill: PALETTE.waxHi, filter: "blur(6px)" }} />
      )}

      {(["l", "r"] as const).map((half) => (
        <g
          key={half}
          clipPath={`url(#half-${half}-${uid})`}
          style={{
            transform: `translateX(${(half === "l" ? -splitPx : splitPx).toFixed(2)}px) rotate(${
              (half === "l" ? -splitPx : splitPx) * 0.25
            }deg)`,
            transformOrigin: "50px 50px",
            // The two halves are driven apart by a prop, not a keyframe, so the
            // crack can be interrupted and resumed with the rest of the ceremony
            // when the tab is backgrounded.
            transition: "transform 1100ms cubic-bezier(.2,.7,.2,1)",
          }}
        >
          <path d={outer} fill={`url(#wax-${uid})`} />
          <path d={outer} fill="#000" opacity="0.35" filter={`url(#waxgrain-${uid})`} />
          <path d={inner} fill="none" strokeWidth="1.6" opacity="0.75" style={{ stroke: PALETTE.waxDeep }} />
          {initials && (
            <text
              x="50"
              y="57"
              textAnchor="middle"
              opacity="0.8"
              style={{ fill: PALETTE.waxDeep, fontFamily: MONO, fontSize: 22, letterSpacing: 1 }}
            >
              {initials.slice(0, 2).toUpperCase()}
            </text>
          )}
        </g>
      ))}

      {showCrack && (
        <path
          d={crack}
          fill="none"
          style={{ stroke: PALETTE.waxDeep }}
          strokeWidth={state === "split" ? 1.6 : 0.9}
          opacity={state === "split" ? 0.9 : 0.55}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Ink
// ═══════════════════════════════════════════════════════════════════════════

export type StampTone = "right" | "wrong" | "disputed" | "wildcard";

const STAMP_COLOUR: Record<StampTone, string> = {
  right: PALETTE.right,
  wrong: PALETTE.wax,
  disputed: PALETTE.amber,
  wildcard: PALETTE.inkSoft,
};

/**
 * A rubber stamp. Rotated, and the ink is deliberately patchy — a clean
 * rectangle of type reads as a UI badge, and this is supposed to read as
 * something somebody pressed onto the page.
 */
export function InkStamp({
  label,
  tone,
  seed,
  size = 15,
}: {
  label: string;
  tone: StampTone;
  seed: string;
  size?: number;
}) {
  const uid = useId().replace(/[:]/g, "");
  const rot = seededSpread(seed, "stamp-rot", 7) + (tone === "disputed" ? -3 : 2);
  const colour = STAMP_COLOUR[tone];

  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{
        transform: `rotate(${rot.toFixed(2)}deg)`,
        border: `2.5px solid ${colour}`,
        color: colour,
        borderRadius: 4,
        padding: "4px 10px",
        fontFamily: MONO,
        fontSize: size,
        letterSpacing: 2,
        fontWeight: 700,
        textTransform: "uppercase",
        // The patchy ink. A turbulence mask eats a little of the fill so the
        // edges break up the way a real stamp does.
        WebkitMaskImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='48'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' seed='${
            hash32(seed) % 400
          }'/><feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.6 1.15'/></filter><rect width='120' height='48' filter='url(%23f)'/></svg>`,
        )}")`,
        WebkitMaskSize: "100% 100%",
        maskImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='48'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3' seed='${
            hash32(seed) % 400
          }'/><feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.6 1.15'/></filter><rect width='120' height='48' filter='url(%23f)'/></svg>`,
        )}")`,
        maskSize: "100% 100%",
      }}
      data-stamp={uid}
    >
      {label}
    </span>
  );
}

/**
 * The particle burst when the seal cracks. Pure CSS, one-shot, seeded
 * directions. Rendered only for the 1.2s of the crack and then unmounted.
 */
export function WaxShards({ seed, count = 14, reduced }: { seed: string; count?: number; reduced: boolean }) {
  const shards = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        i,
        dx: seededSpread(seed, `sx-${i}`, 90),
        dy: -20 - seededUnit(seed, `sy-${i}`) * 90,
        rot: seededSpread(seed, `sr-${i}`, 220),
        size: 3 + Math.round(seededUnit(seed, `ss-${i}`) * 5),
        delay: Math.round(seededUnit(seed, `sd-${i}`) * 120),
      })),
    [seed, count],
  );

  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      {shards.map((s) => (
        <span
          key={s.i}
          className="absolute block capsule-shard"
          style={
            {
              width: s.size,
              height: s.size,
              background: s.i % 3 === 0 ? PALETTE.waxDeep : PALETTE.wax,
              borderRadius: s.i % 2 ? "50%" : "1px",
              ["--dx" as string]: `${s.dx.toFixed(1)}px`,
              ["--dy" as string]: `${s.dy.toFixed(1)}px`,
              ["--rot" as string]: `${s.rot.toFixed(1)}deg`,
              animationDelay: `${s.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
