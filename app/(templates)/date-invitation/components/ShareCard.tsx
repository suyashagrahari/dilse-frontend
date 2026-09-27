"use client";

// ─── The Invitation — the 9:16 keepsake and its PNG ──────────────────────────
//
// AGENT 5. Consumed by `AfterScreen`, which renders `<ShareCardPanel />` and
// nothing else.
//
// This is the artefact that leaves the product: it lands in a camera roll and a
// group chat — and at 9:16 it is story-sized. It carries the night-sky look of
// the redesign: the names big, the route as numbered stickers, the time
// together on a candy strip.
//
// RULES, each of which has already cost a silently-wrong export once:
//
//  - FIXED PIXEL SIZE (405×720) inside a `transform: scale()` wrapper. The
//    composition NEVER reflows at a breakpoint — if it did, two people would
//    get different files from the same page. `ShareCardPanel` measures its
//    container and scales; the card itself is viewport-blind. The only things
//    that change the card's internal metrics are the DATA (how many stops, how
//    long the names are), which is identical for both of them.
//  - Fonts: GROTESK and ITALIC from `dateTheme` ONLY inside the captured node.
//    Both are self-hosted by next/font with `display:"swap"` (see fonts.ts), so
//    `await document.fonts.ready` inside `exportNodeToPng` genuinely waits for
//    them. DISPLAY (Playfair) is registered `display:"optional"` — the browser
//    may decline it outright — so it is not imported here at all.
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
  GRAD,
  GROTESK,
  INK_SOFT,
  ITALIC,
  LIME,
  MOON,
  NIGHT,
  POP,
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

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { senderName, recipientName, dateLabel, routeNames, totalTime, closingLine, routeTimes },
  ref,
) {
  const stops = routeNames.filter((n) => (n || "").trim().length > 0);
  const n = stops.length;

  // Data-driven density so 1 stop and 6 stops both sit correctly in the same
  // fixed box.
  const rowGap = n <= 3 ? 14 : n <= 4 ? 10 : 7;
  const stopSize = n <= 4 ? 15 : 13.5;
  const stopCap = n <= 4 ? 56 : 48;

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
        // Gradients only — no CSS filters, which some serialisers drop.
        background: `radial-gradient(70% 45% at 0% 0%, rgba(255,79,139,.55), transparent 70%), radial-gradient(70% 45% at 100% 38%, rgba(181,155,255,.45), transparent 70%), radial-gradient(80% 40% at 30% 100%, rgba(255,154,60,.38), transparent 70%), ${NIGHT}`,
        padding: "38px 30px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        fontFamily: GROTESK,
        color: MOON,
      }}
    >
      {/* Stars: fixed positions, so the screen and the file always match. */}
      {STARS.map(([x, y, r], i) => (
        <span
          key={i}
          aria-hidden
          style={{ position: "absolute", left: x, top: y, width: r, height: r, borderRadius: 99, background: "#fff", opacity: 0.55 }}
        />
      ))}

      {/* ── Head ─────────────────────────────────────────────────────────── */}
      <span
        style={{
          display: "inline-block",
          padding: "5px 12px",
          borderRadius: 999,
          background: LIME,
          color: "#1a0d26",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          transform: "rotate(-3deg)",
        }}
      >
        date night ✓
      </span>
      <p style={{ margin: "12px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, lineHeight: 1.2, color: "rgba(255,246,251,.75)" }}>
        {dateLabel}
      </p>

      <div style={{ marginTop: 10, width: "100%" }}>
        <p style={{ margin: 0, fontSize: nameSize(sender) + 8, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.035em", ...lineClamp(2) }}>
          {sender}
        </p>
        <p style={{ margin: "2px 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 26, lineHeight: 1, color: POP }}>&amp;</p>
        <p style={{ margin: 0, fontSize: nameSize(recipient) + 8, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.035em", ...lineClamp(2) }}>
          {recipient}
        </p>
      </div>

      {/* ── The route ────────────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 18,
          flex: 1,
          minHeight: 0,
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 22,
          background: "rgba(255,255,255,.08)",
          border: "1px solid rgba(255,255,255,.16)",
          padding: "16px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          textAlign: "left",
        }}
      >
        {n === 0 ? (
          <p style={{ margin: 0, textAlign: "center", fontFamily: ITALIC, fontStyle: "italic", fontSize: 16, lineHeight: 1.5, color: "rgba(255,246,251,.75)" }}>
            The whole evening, start to finish.
          </p>
        ) : (
          stops.map((name, i) => {
            const last = i === n - 1;
            const time = (routeTimes?.[i] || "").trim();
            return (
              <div key={`${i}-${name}`} style={{ display: "flex", alignItems: "flex-start", paddingBottom: last ? 0 : rowGap, position: "relative" }}>
                <div style={{ width: 30, flexShrink: 0, alignSelf: "stretch", position: "relative" }}>
                  {!last && (
                    <span aria-hidden style={{ position: "absolute", left: 10, top: 22, bottom: -2, width: 2, background: "rgba(216,255,92,.45)" }} />
                  )}
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: LIME,
                      color: "#1a0d26",
                      fontSize: 11,
                      fontWeight: 800,
                      lineHeight: "22px",
                      textAlign: "center",
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
                <p style={{ margin: 0, flex: 1, minWidth: 0, fontSize: stopSize, fontWeight: 700, lineHeight: 1.3, paddingTop: 2, ...lineClamp(2) }}>
                  {clampText(name, stopCap)}
                </p>
                {time && (
                  <span style={{ marginLeft: 8, flexShrink: 0, paddingTop: 4, fontSize: 10.5, fontWeight: 600, color: "rgba(255,246,251,.6)", whiteSpace: "nowrap" }}>
                    {time}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Foot ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 16,
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 20,
          background: GRAD,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>time together</span>
        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{totalTime}</span>
      </div>

      {closing && (
        <p
          style={{
            margin: "14px 0 0",
            maxWidth: 320,
            fontFamily: ITALIC,
            fontStyle: "italic",
            fontSize: 16,
            lineHeight: 1.35,
            color: MOON,
            flexShrink: 0,
            ...lineClamp(3),
          }}
        >
          &ldquo;{closing}&rdquo;
        </p>
      )}

      <p style={{ margin: "auto 0 0", paddingTop: 12, fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,246,251,.45)" }}>
        made on subhsandesh
      </p>
    </div>
  );
});

/** Fixed star field for the card: [left, top, size]. */
const STARS: [number, number, number][] = [
  [30, 60, 2], [360, 40, 1.5], [300, 120, 2], [60, 200, 1.5], [380, 260, 2], [20, 420, 1.5],
  [370, 470, 1.5], [200, 20, 1.5], [120, 110, 1], [250, 300, 1], [90, 600, 1.5], [340, 640, 2],
];

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
      backgroundColor: NIGHT,
      pixelRatio: 3,
    });
    setBusy(false);
    setResult(res);
  }, [data.recipientName]);

  return (
    <div style={{ width: "100%", fontFamily: GROTESK }}>
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
            borderRadius: 18 * scale,
            overflow: "hidden",
            boxShadow: "0 24px 50px -24px rgba(18,8,31,.7)",
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
          className="di-cta"
          style={{
            minHeight: 54,
            minWidth: TAP,
            padding: "0 28px",
            border: "none",
            borderRadius: 999,
            background: GRAD,
            color: "#fff",
            fontFamily: GROTESK,
            fontSize: 16,
            fontWeight: 800,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.65 : 1,
            boxShadow: "0 14px 30px -14px rgba(255,79,139,.9)",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {busy ? "saving…" : "save the card ⬇️"}
        </button>

        {/* Non-blocking, inline. A failed export degrades to "take a
            screenshot instead", never to a broken page or an alert. */}
        <p
          role="status"
          aria-live="polite"
          style={{
            margin: "10px 0 0",
            minHeight: 16,
            fontFamily: GROTESK,
            fontSize: 12.5,
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
