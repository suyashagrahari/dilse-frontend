"use client";

// ─── Rewind — the exported 9:16 poster ───────────────────────────────────────
//
// This is the artefact people actually post, so it is designed as its own
// object rather than as a screenshot of the last slide: three hard-cut bands of
// flat colour, one enormous derived number, and the verdict.
//
// Five rules hold it together. Break any of them and the PNG stops matching the
// screen:
//
// 1. FIXED PIXELS, NEVER REFLOW. Every dimension below is a literal px number.
//    There is not a single media query, %-of-viewport unit (vw/vh/dvh), or
//    container query inside this component, and nothing measures the DOM. The
//    on-screen size comes entirely from one `transform: scale()` on a wrapper
//    OUTSIDE the ref'd node (see ShareScreen), which `exportNodeToPng`
//    neutralises at capture time. Two people on two phone widths therefore get
//    byte-comparable files from the same data.
// 2. NO RANDOMNESS AND NO CLOCK. Everything is a pure function of props.
//    Unseeded randomness is banned outright (use @/lib/seededRandom if you ever
//    need scatter here), and the clock is not read either — every time-shaped
//    number arrives already derived in `props.stats`.
// 3. NO IMAGES AT ALL. The photos are S3 URLs and a cross-origin <img> taints
//    the canvas and fails the whole export silently (trap 3 in exportPng.ts).
//    This card is pure type and colour, which removes that entire failure class
//    and, for a poster of this genre, is the stronger design anyway.
// 4. NO <video>, no canvas, no iframe — all serialise blank.
// 5. TEXT COLOUR IS DERIVED. `textOn(bg)` for every band. A hand-picked pair
//    breaks the moment a palette entry changes.
//
// Type never overflows: the two headline lines are sized by a PURE character-
// count fit (no measurement, so it cannot differ between renders) and clipped;
// the prose lines are line-clamped to a fixed box.

import React from "react";
import { NEAR_BLACK, textOn, type Archetype, type DerivedStats, type RewindData } from "./types";

/**
 * 9:16 exactly. Half of 1080x1920 — the DOM stays light and `pixelRatio: 2`
 * still lands a full 1080x1920 file. Changing these two numbers is safe as long
 * as the ratio stays 9:16.
 */
export const CARD_W = 540;
export const CARD_H = 960;

/**
 * Declared here rather than imported so this poster keeps compiling and looking
 * right on its own. Identical strings to the shared kinetic primitives.
 */
const DISPLAY_FONT = 'var(--font-oswald), "Arial Narrow", sans-serif';
const BODY_FONT = "var(--font-outfit), system-ui, sans-serif";

/** Printed on the watermark. A constant, not `location.host`: the file gets
 *  posted somewhere else entirely, and "localhost:3240" on a story is a bug. */
const SITE_HOST = "subhsandesh.in";

/** The paper-coloured band. From PALETTE's cream entry. */
const CREAM = "#F2E8CF";

const PAD = 40;
const INNER_W = CARD_W - PAD * 2; // 460

export interface ShareCardProps {
  data: RewindData;
  stats: DerivedStats;
  archetype: Archetype;
  /** Set true immediately before capture to freeze every CSS animation. */
  frozen?: boolean;
  /** prefers-reduced-motion. Same effect as `frozen`: final state, instantly. */
  reduced?: boolean;
}

// ─── Pure type fitting ───────────────────────────────────────────────────────
//
// Deliberately arithmetic rather than measured. A measure-and-shrink loop needs
// a layout pass, and a layout pass that has not settled before capture is
// exactly how you get a PNG that disagrees with the screen. `ratio` is the
// average advance width of the face as a fraction of the font size — generous,
// because clipping is worse than being one step small.

function fitPx(text: string, boxPx: number, maxPx: number, minPx: number, ratio: number): number {
  const n = Math.max(1, text.length);
  return Math.max(minPx, Math.min(maxPx, Math.floor(boxPx / (n * ratio))));
}

/** Uppercase condensed display face. */
const CAPS_RATIO = 0.52;
/** Digits and grouping commas in the same face. */
const DIGIT_RATIO = 0.6;

/** Clip prose to a fixed number of lines so a long entry cannot push the band. */
function clampLines(lines: number, fontPx: number, lineHeight: number): React.CSSProperties {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    maxHeight: Math.round(fontPx * lineHeight * lines),
  };
}

/** Returns an `animation` shorthand, or undefined when motion is suppressed. */
function anim(still: boolean, name: string, ms: number, delayMs: number): string | undefined {
  if (still) return undefined;
  return `${name} ${ms}ms cubic-bezier(0.16, 1, 0.3, 1) ${delayMs}ms both`;
}

const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { data, stats, archetype, frozen = false, reduced = false },
  ref,
) {
  // One switch for both. The caller freezes before capture, but the card must
  // also be correct if nobody remembers to.
  const still = frozen || reduced;

  const accent = archetype.bg;
  const accentFg = textOn(accent);
  const inkFg = textOn(NEAR_BLACK);
  const creamFg = textOn(CREAM);

  // Stacked, not joined with an ampersand on one line: two long names on one
  // line would fit down to something apologetic, whereas two lines each keep a
  // poster-sized face. Both lines take the SMALLER of the two fits so they stay
  // optically level.
  const given = [data.senderName, data.recipientName].map((s) => s.trim()).filter(Boolean);
  const nameLines =
    given.length === 2
      ? [given[0].toUpperCase(), `& ${given[1].toUpperCase()}`]
      : given.length === 1
        ? [given[0].toUpperCase()]
        : ["US"];
  const namesPx = Math.min(...nameLines.map((l) => fitPx(l, INNER_W, 52, 18, CAPS_RATIO)));

  const dayText = stats.days.toLocaleString("en-IN");
  const dayPx = fitPx(dayText, INNER_W, 210, 64, DIGIT_RATIO);
  const dayLabel = stats.days === 1 ? "DAY TOGETHER" : "DAYS TOGETHER";

  // The future-dated case would otherwise print "that's 0 hours." on a poster.
  const subline = stats.isFuture
    ? `starting ${stats.startWeekday.toLowerCase()}, ${stats.startDateLabel.toLowerCase()}.`
    : stats.breakdown;

  const archName = archetype.name.toUpperCase();
  const archPx = fitPx(archName, INNER_W, 48, 20, CAPS_RATIO);

  const reasons = data.topReasons.filter((r) => r && r.trim()).slice(0, 3);

  return (
    <div
      ref={ref}
      data-rewind-card=""
      style={{
        width: CARD_W,
        height: CARD_H,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        background: NEAR_BLACK,
        color: inkFg,
        fontFamily: BODY_FONT,
        // Rendering hints that keep the capture and the screen identical.
        WebkitFontSmoothing: "antialiased",
        textRendering: "geometricPrecision",
      }}
    >
      {/* Spine — carries the archetype colour to the very top edge. */}
      <div style={{ height: 10, flexShrink: 0, background: accent }} />

      {/* ── Band 1 — the names and the big derived number ─────────────────── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: `32px ${PAD}px 30px`,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            animation: anim(still, "rwBandIn", 480, 0),
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 19,
              letterSpacing: "0.40em",
              lineHeight: 1,
            }}
          >
            REWIND
          </span>
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 13,
              letterSpacing: "0.24em",
              lineHeight: 1,
              opacity: 0.5,
              whiteSpace: "nowrap",
            }}
          >
            SINCE {stats.startDateLabel.toUpperCase()}
          </span>
        </div>

        <div
          style={{
            marginTop: 24,
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: namesPx,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            overflow: "hidden",
            animation: anim(still, "rwBandIn", 620, 60),
          }}
        >
          {nameLines.map((line, i) => (
            <div key={i} style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
              {line}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 18,
            height: 5,
            width: "100%",
            background: accent,
            flexShrink: 0,
            transformOrigin: "left center",
            animation: anim(still, "rwRuleIn", 620, 200),
          }}
        />

        {/* Pushes the hero number to the foot of the band. */}
        <div style={{ flex: 1, minHeight: 0 }} />

        <div style={{ animation: anim(still, "rwNumIn", 760, 280) }}>
          <div
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 15,
              letterSpacing: "0.34em",
              lineHeight: 1,
              opacity: 0.55,
            }}
          >
            {dayLabel}
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: dayPx,
              letterSpacing: "-0.035em",
              lineHeight: 0.8,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {dayText}
          </div>
        </div>

        {subline ? (
          <div
            style={{
              marginTop: 16,
              fontSize: 16,
              lineHeight: 1.36,
              opacity: 0.62,
              animation: anim(still, "rwBandIn", 620, 420),
              ...clampLines(2, 16, 1.36),
            }}
          >
            {subline}
          </div>
        ) : null}
      </div>

      {/* ── Band 2 — the verdict, full-bleed in the archetype colour ──────── */}
      <div
        style={{
          flexShrink: 0,
          background: accent,
          color: accentFg,
          padding: `24px ${PAD}px 24px`,
          boxSizing: "border-box",
          animation: anim(still, "rwBandIn", 640, 520),
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 500,
            fontSize: 13,
            letterSpacing: "0.34em",
            lineHeight: 1,
            opacity: 0.7,
          }}
        >
          YOUR ARCHETYPE
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: archPx,
            letterSpacing: "-0.015em",
            lineHeight: 1.02,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {archName}
        </div>
        <div
          style={{
            marginTop: 9,
            fontSize: 16,
            lineHeight: 1.36,
            opacity: 0.92,
            ...clampLines(3, 16, 1.36),
          }}
        >
          {archetype.line}
        </div>
      </div>

      {/* ── Band 3 — the ranked list, and the watermark ───────────────────── */}
      <div
        style={{
          flexShrink: 0,
          background: CREAM,
          color: creamFg,
          padding: `20px ${PAD}px 18px`,
          boxSizing: "border-box",
          animation: anim(still, "rwBandIn", 640, 620),
        }}
      >
        {reasons.length > 0 && (
          <>
            <div
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 13,
                letterSpacing: "0.34em",
                lineHeight: 1,
                opacity: 0.45,
              }}
            >
              TOP {reasons.length === 1 ? "REASON" : "REASONS"}
            </div>
            <div style={{ marginTop: 4 }}>
              {reasons.map((reason, i) => (
                <div
                  key={`${i}-${reason.slice(0, 12)}`}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 14,
                    paddingTop: 9,
                    paddingBottom: 9,
                    borderTop: i === 0 ? "none" : "1px solid rgba(14,14,18,0.14)",
                    animation: anim(still, "rwRowIn", 520, 700 + i * 90),
                  }}
                >
                  <span
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 700,
                      fontSize: 19,
                      lineHeight: 1,
                      letterSpacing: "0.02em",
                      opacity: 0.34,
                      flexShrink: 0,
                      width: 27,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 15,
                      lineHeight: 1.3,
                      ...clampLines(2, 15, 1.3),
                    }}
                  >
                    {reason}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Watermark. Quiet, bottom-right, ~3% of the card height. */}
        <div
          style={{
            marginTop: reasons.length > 0 ? 12 : 0,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          <div style={{ textAlign: "right", lineHeight: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.01em", opacity: 0.82 }}>
              SubhSandesh
            </div>
            <div style={{ marginTop: 3, fontSize: 10, letterSpacing: "0.06em", opacity: 0.45 }}>
              {SITE_HOST}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
