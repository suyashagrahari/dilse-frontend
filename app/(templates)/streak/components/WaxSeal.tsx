// ─── The wax seal ────────────────────────────────────────────────────────────
//
// Two SVG halves, not one image with a crossfade. A seal that dissolves reads
// as a loading state; a seal that splits and throws a few flecks reads as
// something being opened. It is the same 600ms either way — the difference is
// entirely in whether the thing looks broken open.
//
// Shared by the sealed note and the milestone envelopes so "opening something"
// means one thing throughout.

"use client";

import { seededSpread, seededUnit } from "@/lib/seededRandom";
import { PALETTE, SERIF, TIMING } from "./types";

// The jagged meridian both halves are cut along, written out in both
// directions. Generating the second from the first by string surgery was
// clever and wrong — an off-by-one in the reversal is invisible until the seal
// cracks and the two halves do not line up.
//
//   split, top → bottom: (24,2) (21,8) (26,14) (19,22) (27,30) (20,38) (24,46)
//
// Each half is: the split, plus a counter-clockwise arc back to the start.
const LEFT_HALF = "M24 2 A22 22 0 0 0 24 46 L20 38 L27 30 L19 22 L26 14 L21 8 Z";
const RIGHT_HALF = "M24 2 L21 8 L26 14 L19 22 L27 30 L20 38 L24 46 A22 22 0 0 0 24 2 Z";

const WAX = "#b06a3a";
const WAX_DEEP = "#8f5029";

export interface WaxSealProps {
  cracked: boolean;
  /** When false the seal is simply drawn in its final state, no movement. */
  animate: boolean;
  size?: number;
  /** Stamped into the middle. A day number, or an initial. */
  mark?: string;
  /** Seeds the fleck scatter so it never changes between renders. */
  seed?: string;
}

export default function WaxSeal({ cracked, animate, size = 48, mark, seed = "seal" }: WaxSealProps) {
  const shift = cracked ? 1 : 0;
  const move = animate ? `transform ${TIMING.sealCrackMs}ms cubic-bezier(0.34, 0.9, 0.4, 1), opacity ${TIMING.sealCrackMs}ms ease` : undefined;

  return (
    <span
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ overflow: "visible" }}>
        <g
          style={{
            transition: move,
            transform: shift ? "translate(-9px, 2px) rotate(-15deg)" : "none",
            transformOrigin: "24px 24px",
            opacity: shift ? 0.9 : 1,
          }}
        >
          <path d={LEFT_HALF} fill={WAX} stroke={WAX_DEEP} strokeWidth={1} strokeLinejoin="round" />
        </g>
        <g
          style={{
            transition: move,
            transform: shift ? "translate(9px, 2px) rotate(15deg)" : "none",
            transformOrigin: "24px 24px",
            opacity: shift ? 0.9 : 1,
          }}
        >
          <path d={RIGHT_HALF} fill={WAX} stroke={WAX_DEEP} strokeWidth={1} strokeLinejoin="round" />
        </g>

        {/* The stamp sits on the seam. It goes with the wax rather than
            hanging in mid-air once the halves part. */}
        {mark && (
          <text
            x="24"
            y="30"
            textAnchor="middle"
            style={{
              fontFamily: SERIF,
              fontSize: 15,
              fill: "rgba(255,246,236,0.86)",
              opacity: cracked ? 0 : 1,
              transition: move,
            }}
          >
            {mark}
          </text>
        )}
      </svg>

      {/* A small burst of wax. Seeded, so the same seal scatters identically
          every time it is drawn — including into an exported PNG. */}
      {cracked && animate && (
        <span className="pointer-events-none absolute inset-0">
          {Array.from({ length: 7 }, (_, i) => {
            const dx = seededSpread(seed, `fx${i}`, 26);
            const dy = -6 - seededUnit(seed, `fy${i}`) * 22;
            const d = 2 + Math.round(seededUnit(seed, `fs${i}`) * 2);
            return (
              <span
                key={i}
                style={
                  {
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: d,
                    height: d,
                    borderRadius: "50%",
                    background: i % 2 ? WAX : WAX_DEEP,
                    "--dx": `${dx}px`,
                    "--dy": `${dy}px`,
                    animation: `streak-wax-fleck ${TIMING.sealCrackMs}ms ease-out both`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </span>
      )}
    </span>
  );
}

/** A quiet closed-envelope glyph. Used where a seal would be too much. */
export function EnvelopeGlyph({ size = 44, open = false }: { size?: number; open?: boolean }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 44 32" aria-hidden="true">
      <rect x="1" y="1" width="42" height="30" rx="3" fill={PALETTE.paperDeep} stroke={PALETTE.edge} />
      <path
        d={open ? "M1 4 L22 -8 L43 4" : "M1 4 L22 18 L43 4"}
        fill="none"
        stroke={PALETTE.inkFaint}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
