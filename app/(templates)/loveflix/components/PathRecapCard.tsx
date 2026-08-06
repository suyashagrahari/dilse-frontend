"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { ACCENT, BG, FONT_BODY, FONT_DISPLAY, HAIRLINE, PLACEHOLDER_RULES, TEXT, TEXT_DIM } from "./theme";
import { WORDMARK, type LoveflixData, type PathEntry } from "./types";

// ─── The share card ──────────────────────────────────────────────────────────
//
// FIXED pixel-width composition. It must NOT reflow at breakpoints — it is
// exported as a PNG, and a layout that depends on viewport width means two
// people get different files from the same page. Scale it to fit with a
// transform on a wrapper; `exportNodeToPng` un-scales that wrapper for you.
//
// Two further reasons this file is shaped the way it is:
//
//   1. This component is what the finale screen SHOWS. There is no second,
//      "on-screen" rendering of the recap anywhere — the thing on the page and
//      the thing in the .png are the same React subtree, laid out at the same
//      540px, differing only by a uniform `transform: scale()` that the
//      exporter neutralises. That is how "the PNG matches the screen exactly"
//      is guaranteed rather than hoped for.
//
//   2. Nothing raster goes inside it. No <img>, no <video>, no remote asset —
//      a cross-origin image taints the canvas and a video serialises blank.
//      The card is pure type, rules and CSS gradients, which exports perfectly
//      and, on a card this dense, looks better anyway.

export const RECAP_W = 540;
export const RECAP_H = 960;

/** Inner margin of the fixed composition. 540 - 2×40 = 460px of content. */
const PAD = 40;

export interface PathRecapCardProps {
  data: LoveflixData;
  path: PathEntry[];
  /** Node handed to exportNodeToPng — the fixed composition, not the wrapper. */
  innerRef: React.Ref<HTMLDivElement>;
}

// ─── Leader-dot row ──────────────────────────────────────────────────────────

export interface LeaderRowProps {
  /** Left column. "you chose", "I chose", "Directed by". */
  left: string;
  /** Right column. May wrap; the dots stay on the first baseline. */
  right: string;
  fontSize: number;
  /**
   * The gentle treatment for an auto-chosen entry. Dim only — no icon, no
   * badge, no second colour, no apology. Timing out was a joke, and the recap
   * is not the place to retroactively make it a failure.
   */
  muted?: boolean;
}

/**
 * One row of `label ......... value`.
 *
 * The dots are a real dotted border on a flex filler, so they fill whatever
 * width is left over and the right column always aligns. A fixed run of
 * literal periods goes ragged the moment two labels differ in length, which
 * they always do.
 *
 * Baseline alignment note: an empty flex item has no baseline of its own, so
 * one is synthesised from the bottom of its border box — which is exactly the
 * row's text baseline. The rule is then offset a hair above it.
 */
export function LeaderRow({ left, right, fontSize, muted = false }: LeaderRowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 9,
        width: "100%",
        fontFamily: FONT_BODY,
        fontSize,
        lineHeight: 1.34,
        opacity: muted ? 0.52 : 1,
      }}
    >
      <span style={{ flex: "0 0 auto", color: TEXT_DIM, whiteSpace: "nowrap" }}>{left}</span>
      <span aria-hidden style={{ flex: "1 1 auto", minWidth: 16, position: "relative", height: "1em" }}>
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "0.16em",
            borderBottom: "2px dotted rgba(255,255,255,0.26)",
          }}
        />
      </span>
      <span style={{ flex: "0 1 auto", color: TEXT, textAlign: "right", fontWeight: 500 }}>{right}</span>
    </div>
  );
}

/** A credit with no name — "Based on a true story". Centred, no dots. */
export function SoloRow({ text, fontSize }: { text: string; fontSize: number }) {
  return (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        fontFamily: FONT_BODY,
        fontSize,
        lineHeight: 1.34,
        color: TEXT,
        fontWeight: 500,
      }}
    >
      {text}
    </div>
  );
}

// ─── Deterministic density ───────────────────────────────────────────────────
//
// Everything below is a pure function of the DATA, never of the viewport. A
// card that resized its own type at a breakpoint would export differently on a
// phone and a laptop, which is the whole failure this file exists to avoid.

const MAX_ROWS = 13;

function rowDensity(n: number): { font: number; gap: number } {
  if (n <= 4) return { font: 20, gap: 20 };
  if (n <= 6) return { font: 18, gap: 15 };
  if (n <= 9) return { font: 16, gap: 11 };
  return { font: 14, gap: 8 };
}

function titleSize(title: string): number {
  const n = title.trim().length;
  if (n <= 8) return 82;
  if (n <= 14) return 62;
  if (n <= 24) return 46;
  if (n <= 40) return 34;
  return 27;
}

/** The line in front of each choice. Auto entries own it in the first person. */
export const recapPrefix = (entry: PathEntry): string => (entry.auto ? "I chose" : "you chose");

// ─── Fit-to-container scaling ────────────────────────────────────────────────

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function PathRecapCard({ data, path, innerRef }: PathRecapCardProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  // Measured, never media-queried. The composition is one fixed layout at one
  // fixed width; the only thing that responds to the viewport is the uniform
  // scale factor on the wrapper, which the exporter throws away.
  useIsoLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(Math.min(1, w / RECAP_W));
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const shown = path.slice(0, MAX_ROWS);
  const overflow = path.length - shown.length;
  const d = rowDensity(shown.length + (overflow > 0 ? 1 : 0));

  return (
    <div ref={boxRef} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      {/* Reserves the scaled footprint in normal flow — a transform alone does
          not change layout size and the page would keep 960px of dead space. */}
      <div style={{ width: RECAP_W * scale, height: RECAP_H * scale }}>
        <div style={{ width: RECAP_W, height: RECAP_H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <div
            ref={innerRef}
            style={{
              position: "relative",
              width: RECAP_W,
              height: RECAP_H,
              overflow: "hidden",
              background: BG,
              color: TEXT,
              fontFamily: FONT_BODY,
              display: "flex",
              flexDirection: "column",
              padding: PAD,
              boxSizing: "border-box",
            }}
          >
            {/* Ground: one warm bloom in the accent, one printed hairline
                texture. No images, nothing to taint the canvas. */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(120% 78% at 88% -6%, ${ACCENT}33 0%, ${ACCENT}00 58%),
                             radial-gradient(90% 60% at 6% 104%, ${ACCENT}1a 0%, ${ACCENT}00 62%)`,
              }}
            />
            <div aria-hidden style={{ position: "absolute", inset: 0, background: PLACEHOLDER_RULES, opacity: 0.9 }} />
            <div
              aria-hidden
              style={{ position: "absolute", inset: 14, border: `1px solid ${HAIRLINE}`, pointerEvents: "none" }}
            />

            {/* ── Masthead ── */}
            <div style={{ position: "relative", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: "0.30em",
                  color: ACCENT,
                  textTransform: "uppercase",
                }}
              >
                {WORDMARK}
              </div>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 9,
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  color: TEXT_DIM,
                }}
              >
                Original Series
              </div>
            </div>

            <div style={{ position: "relative", height: 2, background: ACCENT, opacity: 0.9, marginTop: 12, width: 64 }} />

            {/* ── Title block ── */}
            <div style={{ position: "relative", marginTop: 26 }}>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: titleSize(data.showTitle),
                  lineHeight: 0.94,
                  letterSpacing: "-0.012em",
                  color: TEXT,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {data.showTitle}
              </div>
              <div style={{ display: "flex", gap: 34, marginTop: 20 }}>
                <Meta label="Starring" value={data.recipientName} />
                <Meta label="Directed by" value={data.senderName} />
              </div>
            </div>

            <div style={{ position: "relative", height: 1, background: HAIRLINE, marginTop: 26 }} />

            {/* ── The path ── */}
            <div style={{ position: "relative", marginTop: 22, flex: "1 1 auto", minHeight: 0 }}>
              <div
                style={{
                  fontFamily: FONT_BODY,
                  fontSize: 10,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: ACCENT,
                  marginBottom: 18,
                }}
              >
                Your Path
              </div>

              {shown.length === 0 ? (
                <div style={{ fontFamily: FONT_BODY, fontSize: 18, color: TEXT_DIM, lineHeight: 1.6 }}>
                  no turns taken. straight to the ending, which was always the same one.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: d.gap }}>
                  {shown.map((entry, i) => (
                    <LeaderRow
                      key={`${entry.sceneId}-${i}`}
                      left={recapPrefix(entry)}
                      right={entry.label}
                      fontSize={d.font}
                      muted={entry.auto}
                    />
                  ))}
                  {overflow > 0 && (
                    <div style={{ fontFamily: FONT_BODY, fontSize: d.font - 2, color: TEXT_DIM, opacity: 0.7 }}>
                      + {overflow} more
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div style={{ position: "relative", marginTop: 20 }}>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontSize: 17,
                  color: TEXT,
                  lineHeight: 1.15,
                }}
              >
                Every path ended here.
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: TEXT_DIM, marginTop: 6 }}>
                {path.length} {path.length === 1 ? "turn" : "turns"} · one ending · {data.matchPercent}% match
              </div>

              <div style={{ height: 1, background: HAIRLINE, margin: "18px 0 12px" }} />

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <div
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 600,
                    fontSize: 13,
                    letterSpacing: "0.20em",
                    textTransform: "uppercase",
                    color: TEXT_DIM,
                  }}
                >
                  SubhSandesh
                </div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 10.5, letterSpacing: "0.10em", color: TEXT_DIM, opacity: 0.8 }}>
                  make your own
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontSize: 9.5,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: TEXT_DIM,
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT_DISPLAY,
          fontWeight: 600,
          fontSize: 21,
          letterSpacing: "0.02em",
          color: TEXT,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 190,
        }}
      >
        {value}
      </div>
    </div>
  );
}
