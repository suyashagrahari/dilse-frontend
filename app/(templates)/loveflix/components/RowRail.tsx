"use client";

import { useState, type CSSProperties } from "react";
import PlaceholderArt from "./PlaceholderArt";
import {
  ACCENT,
  CARD_RADIUS,
  FONT_BODY,
  FONT_DISPLAY,
  HIDE_SCROLLBAR_CLASS,
  TEXT,
  TEXT_DIM,
  railMask,
} from "./theme";
import type { Row, RowItem } from "./types";

// ─── Rail mechanics, shared by both rail kinds ───────────────────────────────
//
// Native horizontal scrolling with CSS scroll-snap. No carousel library, no
// gesture library — the browser already does momentum, snapping, keyboard and
// trackpad scrolling better than anything we could write, and the scrollbar is
// hidden by the class BrowseScreen injects.

export interface RailProps {
  row: Row;
  onOpenItem: (item: RowItem) => void;
  reducedMotion: boolean;
}

/** Horizontal breathing room at both ends of every track. */
export const RAIL_PAD = 16;
/** Gap between cells. */
export const RAIL_GAP = 8;
/** Vertical padding, so a hovered card that grows 5% is not clipped by the track. */
const RAIL_PAD_TOP = 6;
const RAIL_PAD_BOTTOM = 8;

/**
 * ── CARD WIDTH ARITHMETIC (acceptance criterion 10) ──────────────────────────
 *
 * Cells visible in a viewport of width V, given track side padding P and gap G:
 *
 *     n(V) = (V − P + G) / (W + G)          with P = 16, G = 8
 *
 * (the +G is because the last visible cell needs no trailing gap.)
 *
 * Solve for the two targets:
 *   n(380)  = 2.2  →  W = (380 − 16 + 8) / 2.2 − 8 = 372/2.2  − 8 = 161.1 px
 *   n(1440) = 6.0  →  W = (1440 − 16 + 8) / 6   − 8 = 1432/6  − 8 = 230.7 px
 *
 * Linear in V between those two points:
 *   slope     = (230.7 − 161.1) / (1440 − 380) = 69.6 / 1060 = 0.06573 → 6.573vw
 *   intercept = 161.1 − 0.06573 × 380 = 136.1 px
 *
 *   W(V) = clamp(161px, 136px + 6.573vw, 231px)
 *
 * Check: V=380 → 136 + 24.98 = 160.98 → clamps to 161 → n = 372/169   = 2.20 ✓
 *        V=1440 → 136 + 94.65 = 230.65             → n = 1432/238.65 = 6.00 ✓
 */
export const CARD_W_CSS = "clamp(161px, calc(136px + 6.573vw), 231px)";

/** Scroll container styling shared by both rails. */
export function railTrackStyle(reducedMotion: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "flex-start",
    gap: RAIL_GAP,
    overflowX: "auto",
    overflowY: "hidden",
    scrollSnapType: "x mandatory",
    scrollPaddingLeft: RAIL_PAD,
    scrollBehavior: reducedMotion ? "auto" : "smooth",
    overscrollBehaviorX: "contain",
    WebkitOverflowScrolling: "touch",
    padding: `${RAIL_PAD_TOP}px ${RAIL_PAD}px ${RAIL_PAD_BOTTOM}px`,
    margin: 0,
    listStyle: "none",
    // Content bleeds off both edges rather than stopping against a hard line.
    maskImage: railMask,
    WebkitMaskImage: railMask,
  };
}

/** Section label above a rail. Small, tight, set in the condensed display face. */
export function RailTitle({ children }: { children: string }) {
  return (
    <h3
      style={{
        margin: `0 ${RAIL_PAD}px 2px`,
        fontFamily: FONT_DISPLAY,
        fontWeight: 500,
        fontSize: "clamp(12px, 3.2vw, 15px)",
        lineHeight: 1.16,
        letterSpacing: "0.035em",
        textTransform: "uppercase",
        color: TEXT,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {children}
    </h3>
  );
}

/** Caption block under a card. Fixed minimum height so sibling rails line up. */
export function RailCaption({ title, runtime }: { title: string; runtime?: string }) {
  return (
    <div style={{ marginTop: 7, minHeight: 28 }}>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 500,
          fontSize: 13,
          lineHeight: 1.15,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          color: TEXT,
          display: "-webkit-box",
          WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {title}
      </div>
      {runtime ? (
        <div
          style={{
            marginTop: 2,
            fontFamily: FONT_BODY,
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: TEXT_DIM,
          }}
        >
          {runtime}
        </div>
      ) : null}
    </div>
  );
}

/** Resets so a <button> can be used as a plain layout box. */
export const BARE_BUTTON: CSSProperties = {
  display: "block",
  width: "100%",
  padding: 0,
  margin: 0,
  border: 0,
  background: "transparent",
  color: "inherit",
  font: "inherit",
  textAlign: "left",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};

// ─── The "cards" rail ────────────────────────────────────────────────────────

export default function RowRail({ row, onOpenItem, reducedMotion }: RailProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const items = row.items ?? [];
  if (items.length === 0) return null;

  return (
    <section aria-label={row.title}>
      <RailTitle>{row.title}</RailTitle>

      <ul className={HIDE_SCROLLBAR_CLASS} style={railTrackStyle(reducedMotion)}>
        {items.map((item, i) => {
          const lifted = !reducedMotion && hovered === i;
          return (
            <li
              key={`${item.title}-${i}`}
              style={{
                flex: "0 0 auto", // never stretch — a one-item rail must stay card-sized
                width: CARD_W_CSS,
                scrollSnapAlign: "start",
              }}
            >
              <button
                type="button"
                style={BARE_BUTTON}
                aria-label={`${item.title}. Open details.`}
                onClick={() => onOpenItem(item)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered((h) => (h === i ? null : h))}
              >
                <PlaceholderArt
                  src={item.imageUrl}
                  title={item.title}
                  variant="card"
                  seedSalt={row.title}
                  alt={item.title}
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: CARD_RADIUS,
                    transform: lifted ? "scale(1.05)" : "scale(1)",
                    transition: reducedMotion ? "none" : "transform 200ms ease",
                    willChange: reducedMotion ? undefined : "transform",
                  }}
                >
                  {item.progress > 0 ? (
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 3,
                        background: "rgba(255,255,255,0.20)",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(0, Math.min(100, item.progress))}%`,
                          height: "100%",
                          background: ACCENT,
                        }}
                      />
                    </div>
                  ) : null}
                </PlaceholderArt>

                <RailCaption title={item.title} runtime={item.runtime} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
