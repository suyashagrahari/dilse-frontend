// ─── The canopy ──────────────────────────────────────────────────────────────
//
// One warm light per completed day. THIS is the hero — the number underneath is
// a footnote. A grid of numbers is a scoreboard; a strand of lights that got
// longer without anyone watching is a different feeling entirely.
//
// Performance note: at 400 days this draws 400 lights, and an SVG filter per
// light would be 400 gaussian blurs per frame. The glow is a single shared
// `radialGradient` in `<defs>` instead, referenced by every light, so the whole
// canopy is two cheap circles per day and no filters at all.

"use client";

import { memo, useMemo } from "react";
import { PALETTE, TIMING, layoutLights } from "./types";

export interface LightsProps {
  /** Completed days, chronological. One light each. */
  dates: string[];
  /** Dates that just completed — these fade in with a brief brighter flash. */
  fresh?: string[];
  /** Dormant drops every light to 25%. They never go out. */
  dormant?: boolean;
  /** Returning from dormancy: re-light sequentially, 20ms apart. */
  relighting?: boolean;
  /** The day-100 canopy: every light re-illuminates one per frame over ~3s. */
  canopy?: boolean;
  reduced?: boolean;
  width?: number;
  /** A pale variant for the share card, where the paper is a shade deeper. */
  idSuffix?: string;
}

function LightsImpl({
  dates,
  fresh,
  dormant = false,
  relighting = false,
  canopy = false,
  reduced = false,
  width = 340,
  idSuffix = "",
}: LightsProps) {
  const layout = useMemo(() => layoutLights(dates, width), [dates, width]);
  const freshSet = useMemo(() => new Set(fresh ?? []), [fresh]);
  const gradId = `streak-glow${idSuffix}`;

  if (layout.lights.length === 0) {
    return (
      <svg
        width="100%"
        viewBox={`0 0 ${width} 44`}
        role="img"
        aria-label="No lights yet"
        style={{ display: "block", overflow: "visible" }}
      >
        {/* Day one has no light yet — a single hairline where the strand will
            hang, so the space reads as waiting rather than as broken. */}
        <line x1={12} y1={22} x2={width - 12} y2={22} stroke={PALETTE.edge} strokeWidth={1} strokeDasharray="2 5" />
      </svg>
    );
  }

  // The canopy sequence spreads its stagger across the whole run so 100 lights
  // and 400 lights both take ~3s.
  const canopyStep = TIMING.hundredSequenceMs / Math.max(1, layout.lights.length);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-label={`${layout.lights.length} lights, one for each day you both checked in`}
      style={{
        display: "block",
        overflow: "visible",
        opacity: dormant ? 0.25 : 1,
        transition: reduced ? undefined : "opacity 600ms ease",
      }}
    >
      <defs>
        <radialGradient id={gradId}>
          <stop offset="0%" stopColor={PALETTE.accent} stopOpacity="0.55" />
          <stop offset="55%" stopColor={PALETTE.accent} stopOpacity="0.16" />
          <stop offset="100%" stopColor={PALETTE.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {layout.lights.map((l, i) => {
        const isFresh = freshSet.has(l.date);
        // One-shot only. Never an ambient loop — this page is opened daily and
        // a shimmering canopy would be exhausting by week two.
        let animation: string | undefined;
        let animationDelay: string | undefined;
        if (!reduced) {
          if (canopy) {
            animation = `streak-canopy 620ms ease-out both`;
            animationDelay = `${Math.round(i * canopyStep)}ms`;
          } else if (relighting) {
            animation = `streak-relight 420ms ease-out both`;
            animationDelay = `${i * TIMING.relightStaggerMs}ms`;
          } else if (isFresh) {
            animation = `streak-light-in ${TIMING.lightFadeMs}ms ease-out both`;
          }
        }

        return (
          <g
            key={l.date}
            style={{
              animation,
              animationDelay,
              transformBox: "fill-box",
              transformOrigin: "center",
            }}
          >
            <circle cx={l.cx} cy={l.cy} r={l.r * 3.2} fill={`url(#${gradId})`} />
            <circle cx={l.cx} cy={l.cy} r={l.r} fill={PALETTE.accent} opacity={l.opacity} />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Memoised on identity: the canopy is the most expensive thing on the page and
 * the check-in composer above it re-renders on every keystroke.
 */
const Lights = memo(LightsImpl);
export default Lights;
