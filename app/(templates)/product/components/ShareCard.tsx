"use client";

// ─── The share card — 9:16 ───────────────────────────────────────────────────
//
// 360×640 CSS px at pixelRatio 3 → a 1080×1920 PNG, which is exactly what a
// story slot wants. Carries the photo, the listing title, the star widget at
// the real aggregate, the histogram, the top review, and a small watermark.
//
// ── FOUR THINGS THAT MUST HAPPEN BEFORE THE CLONE ────────────────────────────
//
// 1. `await document.fonts.ready` — html-to-image snapshots what is PAINTED, so
//    a face that has not landed exports as the fallback. Handled inside
//    `exportNodeToPng`.
// 2. INLINE THE PHOTO. A cross-origin <img> taints the canvas and the whole
//    export throws. The hero is fetched and turned into a data URL first; if
//    that fails the card falls back to the initials disc rather than losing the
//    export.
// 3. PAUSE THE ANIMATIONS on the capture subtree. A clone caught mid-keyframe
//    exports a half-grown bar. `lk-card-still` freezes everything under it.
// 4. ONE FRAME between setting that class and taking the clone, so the style
//    has actually applied.
//
// The card is laid out offscreen but REAL — `left: -10000px`, not
// `display: none` — because html-to-image needs true geometry.

import { useCallback, useState } from "react";
import StarRating from "@/components/contrib/StarRating";
import { exportNodeToPng, fileSlug, toDataUrl } from "@/lib/exportPng";
import { initialsOf } from "@/lib/contrib/types";
import { C, FONT, SERIF, WRAP, avatarColour, spokenAverage, type Aggregate } from "./tokens";
import { WORDMARK, type ProductData, type Review } from "./types";
import { HeartMark } from "./tokens";

export const SHARE_W = 360;
export const SHARE_H = 640;

const STAR_ROWS = [5, 4, 3, 2, 1] as const;

function Card({
  data,
  aggregate,
  topReview,
  heroSrc,
  attachNode,
  capturing,
}: {
  data: ProductData;
  aggregate: Aggregate;
  topReview: Review | null;
  heroSrc: string | null;
  /** Callback ref — a RefObject read during render would trip the lint rule. */
  attachNode: (el: HTMLDivElement | null) => void;
  capturing: boolean;
}) {
  const name = `${data.subject.firstName} ${data.subject.lastName}`.trim();

  return (
    <div
      ref={attachNode}
      className={capturing ? "lk-card-still" : undefined}
      style={{
        width: SHARE_W,
        height: SHARE_H,
        boxSizing: "border-box",
        background: "#fff",
        color: C.text,
        fontFamily: FONT,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header strip — our own mark, nobody else's. */}
      <div style={{ background: C.header, padding: "10px 16px 8px", flex: "none" }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
          {WORDMARK}
        </div>
        <div style={{ marginTop: 1 }}>
          <HeartMark width={38} />
        </div>
      </div>

      {/* Photo */}
      <div style={{ height: 246, flex: "none", background: C.section, position: "relative" }}>
        {heroSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroSrc}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <span
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              background: avatarColour(name || "unit"),
              color: "#fff",
              fontSize: 62,
              fontWeight: 700,
            }}
          >
            {initialsOf(name || "·")}
          </span>
        )}
      </div>

      <div style={{ padding: "14px 16px 0", flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column" }}>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 400,
            lineHeight: "20px",
            maxHeight: 60,
            overflow: "hidden",
            ...WRAP,
          }}
        >
          {data.title}
        </p>

        {aggregate.count > 0 ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <StarRating rating={aggregate.average} size={17} />
              <span style={{ fontSize: 19 }}>{spokenAverage(aggregate.average)}</span>
              <span style={{ fontSize: 12, color: C.secondary }}>
                {aggregate.count} rating{aggregate.count === 1 ? "" : "s"}
              </span>
            </div>

            <div style={{ display: "grid", gap: 3, marginTop: 10 }}>
              {STAR_ROWS.map((star) => {
                const pct = aggregate.percents[star - 1];
                return (
                  <div
                    key={star}
                    style={{ display: "grid", gridTemplateColumns: "40px 1fr 32px", gap: 7, alignItems: "center" }}
                  >
                    <span style={{ fontSize: 11, color: C.link }}>{star} star</span>
                    <span
                      style={{
                        height: 11,
                        borderRadius: 3,
                        background: C.track,
                        border: `1px solid ${C.border}`,
                        overflow: "hidden",
                        display: "block",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          height: "100%",
                          width: pct > 0 ? `${pct}%` : "2px",
                          minWidth: 2,
                          background: C.star,
                        }}
                      />
                    </span>
                    <span style={{ fontSize: 11, color: C.text, textAlign: "right" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p style={{ margin: "12px 0 0", fontSize: 14, color: C.secondary }}>
            No ratings yet. Be the first.
          </p>
        )}

        {topReview ? (
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: `1px solid ${C.border}`,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <StarRating rating={topReview.stars} size={12} />
              <span style={{ fontSize: 12, fontWeight: 700, ...WRAP }}>{topReview.title}</span>
            </div>
            <p
              style={{
                margin: "6px 0 0",
                fontFamily: SERIF,
                fontSize: 12.5,
                lineHeight: 1.5,
                color: C.text,
                maxHeight: 92,
                overflow: "hidden",
                ...WRAP,
              }}
            >
              {topReview.body}
            </p>
            <p style={{ margin: "5px 0 0", fontSize: 11, color: C.secondary, ...WRAP }}>
              — {topReview.author}
            </p>
          </div>
        ) : null}
      </div>

      <div
        style={{
          flex: "none",
          padding: "8px 16px 12px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 10, color: C.secondary }}>Original · 1 Count · Never restocked</span>
        <span style={{ fontSize: 10, color: C.secondary, letterSpacing: "0.04em" }}>SubhSandesh</span>
      </div>
    </div>
  );
}

/**
 * The card plus the button that saves it.
 *
 * The card itself is always mounted, offscreen and laid out, because
 * html-to-image needs real geometry — a `display: none` subtree exports blank.
 */
export default function ShareCardPanel({
  data,
  aggregate,
  topReview,
  label = "Save the share card",
}: {
  data: ProductData;
  aggregate: Aggregate;
  topReview: Review | null;
  label?: string;
}) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [heroSrc, setHeroSrc] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const save = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setMessage("");

    // Trap 3 from lib/exportPng: a cross-origin photo taints the canvas and the
    // whole export throws. Inline it first; a failure falls back to initials.
    const inlined = await toDataUrl(data.subject.photos[0] ?? "");
    setHeroSrc(inlined);

    // Freeze the subtree, then wait one frame for the class to apply before the
    // clone is taken.
    setCapturing(true);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    const result = await exportNodeToPng(node, {
      width: SHARE_W,
      height: SHARE_H,
      pixelRatio: 3,
      backgroundColor: "#ffffff",
      filename: `${fileSlug(`${data.subject.firstName}-${data.subject.lastName}`)}-listing`,
    });

    setCapturing(false);
    setBusy(false);
    setMessage(result.message);
  }, [busy, node, data.subject.photos, data.subject.firstName, data.subject.lastName]);

  return (
    <>
      <button
        type="button"
        onClick={() => void save()}
        disabled={busy}
        style={{
          width: "100%",
          minHeight: 38,
          padding: "8px 16px",
          borderRadius: 100,
          border: `1px solid ${C.border}`,
          background: busy ? C.section : "#fff",
          color: C.text,
          fontFamily: FONT,
          fontSize: 14,
          cursor: busy ? "default" : "pointer",
          touchAction: "manipulation",
        }}
      >
        {busy ? "Building the card…" : label}
      </button>
      {message ? (
        <p style={{ margin: "6px 0 0", fontSize: 12, color: C.secondary, textAlign: "center" }} aria-live="polite">
          {message}
        </p>
      ) : null}

      {/* Offscreen but laid out — html-to-image needs real geometry. */}
      <div
        aria-hidden="true"
        style={{ position: "fixed", left: -10000, top: 0, width: SHARE_W, height: SHARE_H, pointerEvents: "none" }}
      >
        <Card
          data={data}
          aggregate={aggregate}
          topReview={topReview}
          heroSrc={heroSrc}
          attachNode={setNode}
          capturing={capturing}
        />
      </div>

      <style>{`
        .lk-card-still, .lk-card-still * {
          animation-play-state: paused !important;
          animation: none !important;
          transition: none !important;
        }
      `}</style>
    </>
  );
}
