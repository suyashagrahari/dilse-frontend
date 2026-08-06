"use client";

import { useState, type CSSProperties } from "react";
import PlaceholderArt from "./PlaceholderArt";
import {
  BARE_BUTTON,
  RailTitle,
  railTrackStyle,
  type RailProps,
} from "./RowRail";
import { CARD_RADIUS, FONT_BODY, FONT_DISPLAY, HIDE_SCROLLBAR_CLASS, TEXT_DIM } from "./theme";

// ─── The ranked rail: portrait cards over huge outlined numerals ─────────────
//
// The composition is a layout convention of the genre and belongs to nobody:
// a portrait still with its rank set enormous behind it, the card covering the
// right third of the glyph so the numeral appears to sit *behind* the artwork
// rather than beside it. That partial occlusion is the whole effect — a numeral
// that merely sits next to a card reads as a bullet point.
//
// GEOMETRY
// --------
// Each cell is one positioned stage:
//
//   ┌ cell ────────────────────────────────────┐
//   │ ╭ numeral (z 0) ─────╮                   │
//   │ │            ╭───────┴──── card (z 1) ─╮ │
//   │ │            │////// overlap //////    │ │
//   │ ╰────────────┴─────────────────────────╯ │
//   └───────── OVER ───────┴──── CARD_W ───────┘
//
// The numeral wrapper is anchored with `right: CARD_W` — i.e. its right edge
// lands exactly on the card's left edge — and then pushed back to the right by
// `translateX(OCCLUSION%)`. A percentage translate resolves against the
// element's OWN width, so exactly OCCLUSION of the glyph ends up under the card
// whatever the glyph's width is. That is what makes rank 1 (one narrow glyph)
// and rank 10 (two glyphs, ~2.3× wider) occlude by the same proportion without
// a single hard-coded pixel offset.
//
// The cell's width still has to reserve the part of the glyph that hangs out to
// the LEFT, or a wide numeral would run into the previous card. That is the one
// place the glyph's width has to be known ahead of layout, hence the advance
// table below.

/**
 * Digit advance widths, in em, measured from the loaded Oswald 600 face
 * (`canvas.measureText` at font-size 100px). Oswald's figures are proportional,
 * not tabular — "1" is 0.38em while "0" is 0.54em — so the reserved gutter is
 * summed per digit rather than assumed uniform.
 */
const DIGIT_ADV_EM = [0.543, 0.3835, 0.5063, 0.5061, 0.5153, 0.502, 0.5305, 0.4277, 0.5163, 0.5303];

/** Tracking applied to the numeral; subtracted back out of the advance. */
const NUM_TRACK_EM = 0.02;

/** Fraction of the numeral's width that disappears behind the card. */
const OCCLUSION = 0.36;

/**
 * Cap height of Oswald's digits (measured: actualBoundingBoxAscent = 0.81–0.82em).
 * Dividing the card height by this gives a font-size whose glyph height equals
 * the card height, which is the look: numeral as tall as the artwork.
 */
const DIGIT_CAP_EM = 0.815;

/**
 * Line-height that drops the baseline exactly onto the box bottom.
 * With half-leading h = (L − (A + D))/2, the baseline sits (L + D − A)/2 below
 * the box centre; that is zero when L = A − D. Oswald's font bounding box is
 * A = 1.19em, D = 0.29em → L = 0.90em. So `align-items: flex-end` puts the
 * digit's baseline on the card's bottom edge and its cap on the card's top edge.
 */
const NUM_LINE_EM = 0.9;

/** A few px of slack so a font fallback with wider figures still cannot collide. */
const GUTTER_SAFETY = 6;

/**
 * ── PORTRAIT CARD WIDTH ──────────────────────────────────────────────────────
 * Cells here are wider than a "cards" rail cell because each carries its own
 * numeral gutter, so this rail deliberately shows fewer cells:
 *
 *   W(V) = clamp(118px, 100px + 4.74vw, 168px)     (2:3 portrait, H = 1.5·W)
 *
 * cell(rank) = W + 0.64 × advance(rank) × F + 6px,  F = 1.5·W / 0.815
 *
 *   V=380  → W=118, H=177, F=217 → cell(1)  = 118 + 0.64×0.364×217 + 6 = 175px
 *            n = (380 − 16 + 8) / (175 + 8) ≈ 2.0 cells
 *   V=1440 → W=168, H=252, F=309 → cell(1)  = 168 + 0.64×0.364×309 + 6 = 246px
 *            n = (1440 − 16 + 8) / (246 + 8) ≈ 5.6 cells
 */
const PORTRAIT_W_CSS = "clamp(118px, calc(100px + 4.74vw), 168px)";

/** Sum of the digit advances for a rank, net of tracking. */
function numeralAdvanceEm(rank: number): number {
  const digits = String(rank).split("");
  return digits.reduce((sum, d) => sum + DIGIT_ADV_EM[Number(d)], 0) - NUM_TRACK_EM * digits.length;
}

/** How far the glyph hangs out to the left of the card, as a CSS length. */
function overhangCss(rank: number): string {
  return `calc(${((1 - OCCLUSION) * numeralAdvanceEm(rank)).toFixed(4)} * var(--lfx-nf) + ${GUTTER_SAFETY}px)`;
}

export default function Top10Rail({ row, onOpenItem, reducedMotion }: RailProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  // Fewer than ten items renders what exists, still numbered from 1; more than
  // ten is capped, because the rank is the joke and "11" ruins it.
  const items = (row.items ?? []).slice(0, 10);
  if (items.length === 0) return null;

  const railVars = {
    "--lfx-cw": PORTRAIT_W_CSS,
    "--lfx-ch": "calc(var(--lfx-cw) * 1.5)",
    "--lfx-nf": `calc(var(--lfx-ch) / ${DIGIT_CAP_EM})`,
    ...railTrackStyle(reducedMotion),
  } as CSSProperties;

  return (
    <section aria-label={row.title}>
      <RailTitle>{row.title}</RailTitle>

      <ul className={HIDE_SCROLLBAR_CLASS} style={railVars}>
        {items.map((item, i) => {
          const rank = i + 1;
          const over = overhangCss(rank);
          const lifted = !reducedMotion && hovered === i;

          return (
            <li
              key={`${item.title}-${i}`}
              style={{
                flex: "0 0 auto", // a single-item rail stays exactly one cell wide
                width: `calc(var(--lfx-cw) + ${over})`,
                scrollSnapAlign: "start",
              }}
            >
              <div style={{ position: "relative", height: "var(--lfx-ch)" }}>
                {/* The numeral. Behind the card, hollow, as tall as the artwork. */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    right: "var(--lfx-cw)",
                    bottom: 0,
                    height: "var(--lfx-ch)",
                    display: "flex",
                    alignItems: "flex-end",
                    zIndex: 0,
                    transform: `translateX(${OCCLUSION * 100}%)`,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 600,
                      fontSize: "var(--lfx-nf)",
                      lineHeight: NUM_LINE_EM,
                      letterSpacing: `-${NUM_TRACK_EM}em`,
                      whiteSpace: "nowrap",
                      // Hollow: a whisper of fill inside a bright hairline outline.
                      color: "rgba(245,245,245,0.055)",
                      WebkitTextStrokeWidth: "calc(var(--lfx-nf) * 0.013)",
                      WebkitTextStrokeColor: "rgba(245,245,245,0.52)",
                    }}
                  >
                    {rank}
                  </span>
                </div>

                {/* The card. Above the numeral, covering its right ~36%. */}
                <button
                  type="button"
                  style={{
                    ...BARE_BUTTON,
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                    width: "var(--lfx-cw)",
                    height: "var(--lfx-ch)",
                  }}
                  aria-label={`Number ${rank}. ${item.title}. Open details.`}
                  onClick={() => onOpenItem(item)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered((h) => (h === i ? null : h))}
                >
                  <PlaceholderArt
                    src={item.imageUrl}
                    title={item.title}
                    variant="portrait"
                    seedSalt={`${row.title}|${rank}`}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: CARD_RADIUS,
                      transform: lifted ? "scale(1.05)" : "scale(1)",
                      transition: reducedMotion ? "none" : "transform 200ms ease",
                      willChange: reducedMotion ? undefined : "transform",
                    }}
                  />
                </button>
              </div>

              {/* Kept quiet and aligned under the artwork — the numeral and the
                  still are the composition, the caption must not compete. */}
              <div
                style={{
                  marginLeft: over,
                  width: "var(--lfx-cw)",
                  marginTop: 7,
                  minHeight: 26,
                  fontFamily: FONT_BODY,
                  fontSize: 11,
                  lineHeight: 1.2,
                  letterSpacing: "0.03em",
                  color: TEXT_DIM,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.title}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
