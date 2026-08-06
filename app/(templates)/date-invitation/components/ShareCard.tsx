"use client";

// ─── The Invitation — the 9:16 keepsake and its PNG ──────────────────────────
//
// AGENT 5. Consumed by `AfterScreen`, which renders `<ShareCardPanel />` and
// nothing else.
//
// This is the artefact that leaves the product: it lands in a camera roll and a
// group chat, so it has to look like the invitation's own paper, finished. A
// keepsake of a real evening — not a stats card. No badges, no gradients as
// decoration, no emoji, no score panels.
//
// RULES, each of which has already cost a silently-wrong export once:
//
//  - FIXED PIXEL SIZE (405×720) inside a `transform: scale()` wrapper. The
//    composition NEVER reflows at a breakpoint — if it did, two people would
//    get different files from the same page. `ShareCardPanel` measures its
//    container and scales; the card itself is viewport-blind. The only things
//    that change the card's internal metrics are the DATA (how many stops, how
//    long the names are), which is identical for both of them.
//  - Fonts: SERIF and MONO from `dateTheme` ONLY inside the captured node. Both
//    are self-hosted with `display:"swap"`, so `await document.fonts.ready`
//    inside `exportNodeToPng` genuinely waits for them. DISPLAY (Playfair) is
//    registered `display:"optional"` — the browser is allowed to decline it
//    outright, which would silently fall back and the PNG would not match the
//    screen. So DISPLAY is not imported here at all, and neither is UI: the
//    panel chrome around the card is deliberately outside the captured node,
//    but it uses SERIF too so the whole block reads as one piece of paper.
//  - No <video> (serialises blank). No cross-origin <img> (taints the canvas
//    and the whole export throws). Everything below is DOM, CSS and inline SVG.
//  - No `Math.random()` anywhere in the render path — the ornament is fixed
//    line art, so there is no jitter to seed and nothing can drift between the
//    screen and the file.
//  - `exportNodeToPng` from `@/lib/exportPng` is the only sanctioned download.

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { exportNodeToPng, fileSlug } from "@/lib/exportPng";

import {
  ACCENT,
  ACCENT_EDGE,
  INK,
  INK_FAINT,
  INK_SOFT,
  MONO,
  PAPER,
  PAPER_EDGE,
  SERIF,
  TAP,
  fmtDateLong,
  fmtTime,
} from "./dateTheme";
import { totalTimeTogether, type DateInviteData, type PassedStopView, type StopView } from "./types";
import { useReducedMotion } from "./useReducedMotion";

/** 9:16. */
export const SHARE_W = 405;
export const SHARE_H = 720;

export interface ShareCardProps {
  senderName: string;
  recipientName: string;
  /** "Saturday, 16 August". */
  dateLabel: string;
  /** Passed stop names, in order. The route. */
  routeNames: string[];
  /** From `totalTimeTogether(data)`. */
  totalTime: string;
  closingLine: string;
  /**
   * ADDITIVE and OPTIONAL — the frozen fields above are untouched, so every
   * existing call site still type-checks. Arrival times parallel to
   * `routeNames` ("7:12 PM"), already formatted by `fmtTime`. An entry may be
   * "" when a stop auto-advanced and nobody tapped; that row simply shows no
   * time. Monospace, because the theme reserves MONO for times.
   */
  routeTimes?: string[];
}

// ─── Text fitting ────────────────────────────────────────────────────────────
//
// A 90-character stop name must not overflow the 405px box, and it must not
// overflow it in the PNG either. Belt and braces, both deterministic:
//
//   1. a hard character cap with an ellipsis, computed from the column width —
//      this alone guarantees the box can never be overrun, and it survives any
//      serialiser quirk;
//   2. `-webkit-line-clamp` on top, so the visual truncation lands on a word
//      boundary rather than mid-glyph when the cap is generous.

const clampText = (s: string, max: number): string => {
  const t = (s || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).replace(/[\s,;:.\-–—]+$/, "")}…`;
};

const lineClamp = (lines: number): React.CSSProperties => ({
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: lines,
  overflow: "hidden",
  overflowWrap: "break-word",
  wordBreak: "break-word",
});

/** Names shrink rather than wrap forever. Data-driven, never viewport-driven. */
function nameSize(name: string): number {
  const n = name.length;
  if (n <= 14) return 27;
  if (n <= 20) return 23;
  if (n <= 28) return 19;
  return 16;
}

// ─── Ornament (inline SVG line art — no fills, no gradients) ─────────────────

/** One corner curl with a dot at the elbow. Rotated for the other three. */
function CornerCurl({ rotate }: { rotate: number }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
      style={{ display: "block", transform: `rotate(${rotate}deg)` }}
    >
      <path d="M0.6 21.4C0.6 10.1 10.1 0.6 21.4 0.6" stroke={INK_FAINT} strokeWidth="0.8" />
      <path d="M5.6 21.4C5.6 12.9 12.9 5.6 21.4 5.6" stroke={PAPER_EDGE} strokeWidth="0.8" />
      <circle cx="7.6" cy="7.6" r="1.15" fill={ACCENT} />
    </svg>
  );
}

/** A short rule broken by a hollow accent diamond. */
function OrnamentRule({ width = 128 }: { width?: number }) {
  const mid = width / 2;
  return (
    <svg width={width} height="9" viewBox={`0 0 ${width} 9`} fill="none" aria-hidden style={{ display: "block" }}>
      <line x1="0" y1="4.5" x2={mid - 9} y2="4.5" stroke={PAPER_EDGE} strokeWidth="1" />
      <line x1={mid + 9} y1="4.5" x2={width} y2="4.5" stroke={PAPER_EDGE} strokeWidth="1" />
      <path
        d={`M${mid} 1.2L${mid + 3.3} 4.5L${mid} 7.8L${mid - 3.3} 4.5Z`}
        stroke={ACCENT}
        strokeWidth="0.9"
        fill="none"
      />
    </svg>
  );
}

const EYEBROW: React.CSSProperties = {
  fontFamily: SERIF,
  fontSize: 8.5,
  letterSpacing: "0.34em",
  textTransform: "uppercase",
  lineHeight: 1,
  margin: 0,
};

// ─── The card ────────────────────────────────────────────────────────────────

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { senderName, recipientName, dateLabel, routeNames, totalTime, closingLine, routeTimes },
  ref,
) {
  const stops = routeNames.filter((n) => (n || "").trim().length > 0);
  const n = stops.length;

  // Data-driven density so 1 stop and 6 stops both sit correctly in the same
  // fixed box. Six two-line rows at these metrics measure 277px against 305px
  // of available column, so nothing is ever clipped.
  const rowGap = n <= 3 ? 20 : n <= 4 ? 15 : 11;
  const stopSize = n <= 4 ? 15 : 14;
  const stopCap = n <= 4 ? 62 : 56;

  const sender = clampText(senderName || "—", 40);
  const recipient = clampText(recipientName || "—", 40);
  const closing = clampText(closingLine, 150);

  return (
    <div
      ref={ref}
      data-share-card="date-invitation"
      style={{
        width: SHARE_W,
        height: SHARE_H,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        background: PAPER,
        padding: "40px 34px 34px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        fontFamily: SERIF,
        color: INK,
      }}
    >
      {/* Double frame + four corner curls. Line art only. */}
      <span aria-hidden style={{ position: "absolute", inset: 14, border: `1px solid ${PAPER_EDGE}` }} />
      <span aria-hidden style={{ position: "absolute", inset: 18, border: `1px solid ${ACCENT_EDGE}` }} />
      <span aria-hidden style={{ position: "absolute", left: 23, top: 23 }}>
        <CornerCurl rotate={0} />
      </span>
      <span aria-hidden style={{ position: "absolute", right: 23, top: 23 }}>
        <CornerCurl rotate={90} />
      </span>
      <span aria-hidden style={{ position: "absolute", right: 23, bottom: 23 }}>
        <CornerCurl rotate={180} />
      </span>
      <span aria-hidden style={{ position: "absolute", left: 23, bottom: 23 }}>
        <CornerCurl rotate={270} />
      </span>

      {/* ── Head ─────────────────────────────────────────────────────────── */}
      <p style={{ ...EYEBROW, color: INK_FAINT }}>The evening of</p>

      <p
        style={{
          margin: "10px 0 0",
          fontFamily: SERIF,
          fontSize: 14.5,
          lineHeight: 1.3,
          letterSpacing: "0.02em",
          color: INK,
        }}
      >
        {dateLabel}
      </p>

      <div style={{ marginTop: 14, width: "100%" }}>
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: nameSize(sender),
            lineHeight: 1.18,
            color: INK,
            ...lineClamp(2),
          }}
        >
          {sender}
        </p>
        <p
          style={{
            margin: "3px 0",
            fontFamily: SERIF,
            fontSize: 15,
            fontStyle: "italic",
            lineHeight: 1,
            color: ACCENT,
          }}
        >
          &amp;
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontSize: nameSize(recipient),
            lineHeight: 1.18,
            color: INK,
            ...lineClamp(2),
          }}
        >
          {recipient}
        </p>
      </div>

      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <OrnamentRule />
      </div>

      {/* ── The route ────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          textAlign: "left",
        }}
      >
        {n === 0 ? (
          <p
            style={{
              margin: 0,
              textAlign: "center",
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 13,
              lineHeight: 1.6,
              color: INK_SOFT,
            }}
          >
            The whole evening, start to finish.
          </p>
        ) : (
          stops.map((name, i) => {
            const last = i === n - 1;
            const time = (routeTimes?.[i] || "").trim();
            return (
              <div
                key={`${i}-${name}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  paddingBottom: last ? 0 : rowGap,
                  position: "relative",
                }}
              >
                {/* Node column: the thin vertical rule passes behind the dot. */}
                <div style={{ width: 18, flexShrink: 0, alignSelf: "stretch", position: "relative" }}>
                  {!last && (
                    <span
                      aria-hidden
                      style={{ position: "absolute", left: 3.5, top: 15, bottom: -5, width: 1, background: PAPER_EDGE }}
                    />
                  )}
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 5,
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: ACCENT,
                      boxShadow: `0 0 0 3px ${PAPER}`,
                    }}
                  />
                </div>

                <p
                  style={{
                    margin: 0,
                    flex: 1,
                    minWidth: 0,
                    fontFamily: SERIF,
                    fontSize: stopSize,
                    lineHeight: 1.32,
                    color: INK,
                    ...lineClamp(2),
                  }}
                >
                  {clampText(name, stopCap)}
                </p>

                {time && (
                  <span
                    style={{
                      marginLeft: 10,
                      flexShrink: 0,
                      paddingTop: 3,
                      fontFamily: MONO,
                      fontSize: 10,
                      lineHeight: 1.3,
                      letterSpacing: "0.01em",
                      color: INK_SOFT,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {time}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Foot ─────────────────────────────────────────────────────────── */}
      <span
        aria-hidden
        style={{ width: "100%", height: 1, background: PAPER_EDGE, marginTop: 16, marginBottom: 14, flexShrink: 0 }}
      />

      <p style={{ ...EYEBROW, color: INK_SOFT }}>Time together</p>
      <p
        style={{
          margin: "6px 0 0",
          fontFamily: SERIF,
          fontSize: 23,
          lineHeight: 1.15,
          color: INK,
        }}
      >
        {totalTime}
      </p>

      {closing && (
        <p
          style={{
            margin: "14px 0 0",
            maxWidth: 288,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 12.5,
            lineHeight: 1.55,
            color: INK_SOFT,
            ...lineClamp(3),
          }}
        >
          {closing}
        </p>
      )}

      <p style={{ ...EYEBROW, color: INK_FAINT, marginTop: "auto", paddingTop: 16 }}>SubhSandesh</p>
    </div>
  );
});

export default ShareCard;

// ─── The panel ───────────────────────────────────────────────────────────────

const isPassed = (s: StopView): s is PassedStopView => s.state === "passed";

/** Never call `useLayoutEffect` on the server; measure before paint on the client. */
const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The self-contained unit `AfterScreen` drops in: the scaled preview, the
 * download button, the busy state and the inline result.
 *
 * The route comes from the ITINERARY it is handed — never from `data.stops`,
 * which would reach around the reveal guard in the frozen types.
 */
export function ShareCardPanel({
  data,
  itinerary,
}: {
  data: DateInviteData;
  /** From `buildItinerary(data, "after")`. Derive the route from the passed entries. */
  itinerary: StopView[];
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const [scale, setScale] = useState(1);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [entered, setEntered] = useState(false);

  // Scale, never reflow. The card is always 405×720; only the wrapper changes.
  useMeasureEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(Math.min(1, w / SHARE_W)); // never upscale past native
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

  // One-shot entrance. Decoration only — under reduced motion the card is
  // simply there (no effect runs at all), and the download behaves identically
  // either way.
  useEffect(() => {
    if (reduceMotion) return;
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, [reduceMotion]);

  const shown = reduceMotion || entered;

  const passed = useMemo(() => itinerary.filter(isPassed), [itinerary]);
  const routeNames = useMemo(() => passed.map((s) => s.name), [passed]);
  const routeTimes = useMemo(() => passed.map((s) => fmtTime(s.arrivedAt)), [passed]);
  const totalTime = useMemo(() => totalTimeTogether(data), [data]);

  const handleSave = useCallback(async () => {
    setBusy(true);
    setResult(null);
    // The only sanctioned download. It never throws — it returns a result.
    const res = await exportNodeToPng(cardRef.current, {
      width: SHARE_W,
      height: SHARE_H,
      filename: `the-invitation-${fileSlug(data.recipientName, "evening")}`,
      backgroundColor: PAPER,
      pixelRatio: 3,
    });
    setBusy(false);
    setResult(res);
  }, [data.recipientName]);

  return (
    <div style={{ width: "100%", fontFamily: SERIF }}>
      {/* Measured box. `overflow: hidden` guards the first paint, before the
          layout effect has had a chance to measure. */}
      <div ref={boxRef} style={{ width: "100%", overflow: "hidden" }}>
        {/* Layout box: the card's footprint AFTER scaling, so the page flows
            around it correctly. The scale itself lives on the wrapper inside,
            which stays 405×720 in layout terms. */}
        <div
          style={{
            width: SHARE_W * scale,
            height: SHARE_H * scale,
            margin: "0 auto",
            position: "relative",
            boxShadow: "0 18px 44px -22px rgba(58,44,32,0.34), 0 2px 6px rgba(58,44,32,0.06)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: SHARE_W,
              height: SHARE_H,
              transform: `scale(${scale})${shown || reduceMotion ? "" : " translateY(10px)"}`,
              transformOrigin: "top left",
              opacity: shown ? 1 : 0,
              transition: reduceMotion ? "none" : "opacity 520ms ease-out, transform 520ms ease-out",
            }}
          >
            <ShareCard
              ref={cardRef}
              senderName={data.senderName}
              recipientName={data.recipientName}
              dateLabel={fmtDateLong(data.startsAt)}
              routeNames={routeNames}
              routeTimes={routeTimes}
              totalTime={totalTime}
              closingLine={data.closingLine}
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          style={{
            minHeight: TAP,
            minWidth: TAP,
            padding: "0 26px",
            border: `1px solid ${ACCENT_EDGE}`,
            borderRadius: 3,
            background: PAPER,
            color: ACCENT,
            fontFamily: SERIF,
            fontSize: 13.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.65 : 1,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {busy ? "[ saving… ]" : "[ save the card ]"}
        </button>

        {/* Non-blocking, inline. A failed export degrades to "take a
            screenshot instead", never to a broken page or an alert. */}
        <p
          role="status"
          aria-live="polite"
          style={{
            margin: "10px 0 0",
            minHeight: 16,
            fontFamily: SERIF,
            fontSize: 12,
            lineHeight: 1.35,
            textAlign: "center",
            color: result && !result.ok ? ACCENT : INK_SOFT,
          }}
        >
          {result ? result.message : ""}
        </p>
      </div>
    </div>
  );
}
