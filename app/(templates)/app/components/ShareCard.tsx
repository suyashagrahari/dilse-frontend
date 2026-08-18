"use client";

// ─── The share card — 9:16 ───────────────────────────────────────────────────
//
// 360×640 CSS px at pixelRatio 3 → a 1080×1920 PNG, which is exactly the shape
// a story slot wants. It carries the three things that read at thumbnail size
// and nothing else:
//
//   1. THE HEADER BLOCK   icon, name, developer line, GET pill
//   2. THE STATS STRIP    the same caps-label / figure / sub-label rhythm as
//                         the listing, with hairline dividers between cells
//   3. THE AGGREGATE      the big average, the star row, and the histogram
//
// ── FOUR THINGS THAT MUST HAPPEN BEFORE THE CLONE ────────────────────────────
//
// 1. `await document.fonts.ready` — html-to-image snapshots what is PAINTED, so
//    a face that has not landed yet exports as the fallback. Handled inside
//    `exportNodeToPng`.
// 2. INLINE THE ICON. A cross-origin <img> taints the canvas and the whole
//    export throws. The icon is fetched into a data URL first; a failure falls
//    back to the initials tile rather than losing the export.
// 3. PAUSE THE ANIMATIONS on the capture subtree. A clone caught mid-keyframe
//    exports a half-grown histogram bar. `ap-shot-still` freezes everything
//    under it.
// 4. ONE FRAME between setting that class and taking the clone, so the style has
//    actually applied.
//
// The card is laid out offscreen but REAL — `left: -10000px`, not
// `display: none` — because html-to-image needs true geometry.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
//
// Nothing on this card imitates a software storefront. The chrome is the
// sender's own, the mark is a plain rounded tile, the only saturated colour is
// the indigo accent from `theme.ts`, and the watermark is ours.

import { useCallback, useMemo, useState } from "react";
import StarRating from "@/components/contrib/StarRating";
import { exportNodeToPng, fileSlug, toDataUrl } from "@/lib/exportPng";
import { initialsOf } from "@/lib/contrib/types";
import { AP, AP_TAP } from "./theme";
import { aggregateOf, publishedReviews } from "./demo";
import type { AppData } from "./types";

export const SHARE_W = 360;
export const SHARE_H = 640;

const STAR_ROWS = [5, 4, 3, 2, 1] as const;

/** Caps label / figure / sub-label — the listing's vertical rhythm, shrunk. */
function StatCell({
  label,
  figure,
  sub,
  divider,
}: {
  label: string;
  figure: React.ReactNode;
  sub?: string;
  divider: boolean;
}) {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        padding: "0 8px",
        textAlign: "center",
        borderLeft: divider ? `1px solid ${AP.edge}` : "none",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: AP.inkSoft,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 17,
          fontWeight: 700,
          color: AP.ink,
          lineHeight: "20px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {figure}
      </div>
      {/* The sub row is reserved even when empty, so the cells stay aligned. */}
      <div
        style={{
          marginTop: 2,
          minHeight: 12,
          fontSize: 9.5,
          color: AP.inkSoft,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {sub ?? ""}
      </div>
    </div>
  );
}

function Card({
  data,
  iconSrc,
  attachNode,
  capturing,
}: {
  data: AppData;
  iconSrc: string | null;
  /** Callback ref — a RefObject read during render would trip the lint rule. */
  attachNode: (el: HTMLDivElement | null) => void;
  capturing: boolean;
}) {
  const published = useMemo(() => publishedReviews(data), [data]);
  const agg = useMemo(() => aggregateOf(published), [published]);
  const name = data.app.name.trim();

  return (
    <div
      ref={attachNode}
      className={capturing ? "ap-shot-still" : undefined}
      style={{
        width: SHARE_W,
        height: SHARE_H,
        boxSizing: "border-box",
        background: AP.page,
        color: AP.ink,
        fontFamily: AP.font,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── 1. The header block ───────────────────────────────────────────── */}
      <div style={{ flex: "none", padding: "26px 20px 0", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div
          style={{
            width: 92,
            height: 92,
            flex: "none",
            borderRadius: 21,
            overflow: "hidden",
            background: AP.card,
            border: `1px solid ${AP.edge}`,
          }}
        >
          {iconSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={iconSrc}
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
                background: AP.accent,
                color: AP.accentInk,
                fontSize: 34,
                fontWeight: 800,
              }}
            >
              {initialsOf(name || "·")}
            </span>
          )}
        </div>

        <div style={{ flex: "1 1 auto", minWidth: 0, paddingTop: 2 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: "26px",
              maxHeight: 52,
              overflow: "hidden",
              overflowWrap: "anywhere",
            }}
          >
            {name || "Untitled"}
          </div>
          <div
            style={{
              marginTop: 3,
              fontSize: 12.5,
              color: AP.inkSoft,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {data.app.subtitle}
          </div>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: AP.accent,
                fontWeight: 600,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {data.app.developer}
            </span>
            <span
              style={{
                flex: "none",
                padding: "6px 20px",
                borderRadius: 100,
                background: AP.accent,
                color: AP.accentInk,
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.04em",
              }}
            >
              GET
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. The stats strip ────────────────────────────────────────────── */}
      <div
        style={{
          flex: "none",
          margin: "22px 0 0",
          padding: "16px 8px",
          borderTop: `1px solid ${AP.edge}`,
          borderBottom: `1px solid ${AP.edge}`,
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <StatCell
          label={agg.count > 0 ? `${agg.count} Ratings` : "Ratings"}
          figure={agg.count > 0 ? agg.average.toFixed(1) : "—"}
          sub={agg.count > 0 ? "out of 5" : "No Ratings Yet"}
          divider={false}
        />
        <StatCell
          label="Age"
          figure={
            <span
              style={{
                display: "inline-block",
                minWidth: 26,
                padding: "1px 5px",
                borderRadius: 5,
                border: `1.5px solid ${AP.inkSoft}`,
                fontSize: 13,
                fontWeight: 700,
                lineHeight: "17px",
              }}
            >
              {data.app.ageRating}
            </span>
          }
          sub="Years Old"
          divider
        />
        <StatCell label="Category" figure={data.app.category} divider />
        <StatCell label="Size" figure={data.app.size} divider />
      </div>

      {/* ── 3. The aggregate + histogram ──────────────────────────────────── */}
      <div style={{ flex: "1 1 auto", minHeight: 0, padding: "20px 20px 0", overflow: "hidden" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: AP.inkSoft,
          }}
        >
          Ratings &amp; Reviews
        </div>

        {agg.count > 0 ? (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginTop: 12 }}>
              <div style={{ flex: "none" }}>
                <div style={{ fontSize: 52, fontWeight: 800, lineHeight: "54px", letterSpacing: "-0.03em" }}>
                  {agg.average.toFixed(1)}
                </div>
                <div style={{ fontSize: 11, color: AP.inkSoft, marginTop: 2 }}>out of 5</div>
              </div>
              <div style={{ flex: "1 1 auto", minWidth: 0, textAlign: "right", paddingBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <StarRating rating={agg.average} size={16} fillColor={AP.accent} emptyColor={AP.edge} />
                </div>
                <div style={{ fontSize: 11.5, color: AP.inkSoft, marginTop: 6 }}>
                  {data.rating.count.trim() || String(agg.count)} Rating{agg.count === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 5, marginTop: 16 }}>
              {STAR_ROWS.map((star) => {
                const pct = agg.percents[star - 1] ?? 0;
                return (
                  <div
                    key={star}
                    style={{ display: "grid", gridTemplateColumns: "44px 1fr 30px", gap: 8, alignItems: "center" }}
                  >
                    <span style={{ fontSize: 10, color: AP.inkSoft, letterSpacing: "0.02em" }}>
                      {"★".repeat(star)}
                    </span>
                    <span
                      style={{
                        height: 7,
                        borderRadius: 4,
                        background: AP.card,
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
                          background: AP.accent,
                        }}
                      />
                    </span>
                    <span style={{ fontSize: 10, color: AP.inkSoft, textAlign: "right" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p style={{ margin: "16px 0 0", fontSize: 15, fontWeight: 700, color: AP.inkSoft }}>
            No Ratings Yet
          </p>
        )}
      </div>

      {/* Watermark. Small, bottom-right, never louder than the listing. */}
      <div
        style={{
          flex: "none",
          padding: "10px 20px 16px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 9.5,
            color: AP.inkSoft,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {data.app.price}
        </span>
        <span style={{ flex: "none", fontSize: 9.5, color: AP.inkSoft, letterSpacing: "0.06em" }}>
          SubhSandesh
        </span>
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
  label = "Save the share card",
}: {
  data: AppData;
  label?: string;
}) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [iconSrc, setIconSrc] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const save = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setMessage("");

    // A cross-origin icon taints the canvas and the whole export throws. Inline
    // it first; a failure falls back to the initials tile.
    const inlined = await toDataUrl(data.app.iconUrl ?? "");
    setIconSrc(inlined);

    // Freeze the subtree, then wait one frame for the class to apply before the
    // clone is taken.
    setCapturing(true);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    const result = await exportNodeToPng(node, {
      width: SHARE_W,
      height: SHARE_H,
      pixelRatio: 3,
      backgroundColor: AP.page,
      filename: `${fileSlug(data.app.name)}-listing`,
    });

    setCapturing(false);
    setBusy(false);
    setMessage(result.message);
  }, [busy, node, data.app.iconUrl, data.app.name]);

  return (
    <>
      <button
        type="button"
        onClick={() => void save()}
        disabled={busy}
        style={{
          width: "100%",
          minHeight: AP_TAP,
          padding: "10px 16px",
          borderRadius: 100,
          border: `1px solid ${AP.edge}`,
          background: busy ? AP.card : AP.page,
          color: AP.ink,
          fontFamily: AP.font,
          fontSize: 14,
          fontWeight: 700,
          cursor: busy ? "default" : "pointer",
          touchAction: "manipulation",
        }}
      >
        {busy ? "Building the card…" : label}
      </button>
      {message ? (
        <p
          style={{ margin: "6px 0 0", fontSize: 12, color: AP.inkSoft, textAlign: "center" }}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}

      {/* Offscreen but laid out — html-to-image needs real geometry. */}
      <div
        aria-hidden="true"
        style={{ position: "fixed", left: -10000, top: 0, width: SHARE_W, height: SHARE_H, pointerEvents: "none" }}
      >
        <Card data={data} iconSrc={iconSrc} attachNode={setNode} capturing={capturing} />
      </div>

      <style>{`
        .ap-shot-still, .ap-shot-still * {
          animation-play-state: paused !important;
          animation: none !important;
          transition: none !important;
        }
      `}</style>
    </>
  );
}
