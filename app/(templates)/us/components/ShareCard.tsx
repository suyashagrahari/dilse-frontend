"use client";

// ─── Us — the exported 9:16 card ─────────────────────────────────────────────
//
// The artefact people actually post: the profile header over a 3×3 crop of the
// grid, which is the smallest arrangement that still reads as a profile.
//
// Four rules, each of which has a matching trap in lib/exportPng.ts:
//
// 1. FIXED PIXELS. Not one %, vw, dvh, media query or measured value in here.
//    The on-screen size comes from a `transform: scale()` on a wrapper OUTSIDE
//    the captured node, which `exportNodeToPng` neutralises. Two people on two
//    phone widths get identical files from identical data.
// 2. SAME-ORIGIN PIXELS ONLY. A cross-origin <img> taints the canvas and the
//    export throws. Every photo arrives here already converted to a data URL by
//    the caller; anything that failed to convert arrives as "" and draws the
//    grey fallback cell instead. The export never fails because of one photo.
// 3. EAGER IMAGES. The card is captured moments after it mounts, so every
//    image is `priority` — a lazily-loaded photo that has not started fetching
//    is captured as a blank box.
// 4. NO CLOCK, NO RANDOMNESS. Pure function of props.

import Photo from "./Photo";
import { PALETTE, SYSTEM_FONT, formatStat, type ProfileData, type Post } from "./types";

/** 9:16. Half of 1080×1920, so `pixelRatio: 2` already lands a full-size file
 *  and `pixelRatio: 3` gives 1620×2880. Safe to change while the ratio holds. */
export const CARD_W = 540;
export const CARD_H = 960;

const PAD = 28;
/** The grid is inset symmetrically and its cells stay perfectly square. */
const GRID_W = CARD_W - PAD * 2; // 484
const GAP = 1;
const CELL = (GRID_W - GAP * 2) / 3; // 160.67
const GRID_H = CELL * 3 + GAP * 2; // 484
const WATERMARK_H = 74;

const SITE_HOST = "subhsandesh.in";

export interface ShareCardProps {
  data: ProfileData;
  /** Ordered posts, pinned first. Only the first nine are drawn. */
  posts: Post[];
  /**
   * Original URL → data URL, populated by the caller immediately before a
   * capture. Empty while the card is only being previewed: the on-screen
   * preview loads the photos over the network like everything else, and only
   * the capture pays the base64 cost. A URL that could not be converted is
   * absent from the map, falls through to the original, and — if that then
   * taints or fails — draws the grey fallback cell.
   */
  resolved: Record<string, string>;
  attachRef?: (el: HTMLDivElement | null) => void;
}

function CardStat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 600, lineHeight: "30px", color: PALETTE.ink }}>
        {formatStat(value)}
      </div>
      <div style={{ fontSize: 15, lineHeight: "19px", color: PALETTE.ink }}>{label}</div>
    </div>
  );
}

export default function ShareCard({ data, posts, resolved, attachRef }: ShareCardProps) {
  const cells = posts.slice(0, 9);
  const src = (url: string): string => resolved[url] ?? url;

  return (
    <div
      ref={attachRef}
      style={{
        width: CARD_W,
        height: CARD_H,
        background: PALETTE.bg,
        fontFamily: SYSTEM_FONT,
        color: PALETTE.ink,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ padding: `${PAD}px ${PAD}px 0`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              position: "relative",
              width: 104,
              height: 104,
              borderRadius: "50%",
              overflow: "hidden",
              border: `1px solid ${PALETTE.border}`,
              flexShrink: 0,
              background: PALETTE.button,
            }}
          >
            <Photo src={src(data.avatarUrl)} alt="" sizes="104px" glyphSize={34} priority />
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              paddingLeft: 10,
            }}
          >
            <CardStat value={data.stats.posts} label="posts" />
            <CardStat value={data.stats.followers} label="followers" />
            <CardStat value={data.stats.following} label="following" />
          </div>
        </div>

        <div style={{ marginTop: 18, fontSize: 21, fontWeight: 600, lineHeight: "25px" }}>
          {data.handle}
        </div>

        <div style={{ marginTop: 8, fontSize: 16, fontWeight: 600, lineHeight: "21px" }}>
          {data.displayName}
        </div>

        {data.category ? (
          <div style={{ marginTop: 2, fontSize: 16, lineHeight: "21px", color: PALETTE.grey }}>
            {data.category}
          </div>
        ) : null}

        {/* Three lines maximum. A six-line bio would push the grid off the card,
            and the grid is the half of this that people recognise. */}
        <div style={{ marginTop: 6, fontSize: 16, lineHeight: "22px" }}>
          {data.bio.slice(0, 3).map((line, i) => (
            <div
              key={`${i}-${line}`}
              style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Absorbs whatever the header did not use, so the grid and the
          watermark stay pinned to the bottom whatever the bio length. */}
      <div style={{ flex: 1, minHeight: 12 }} />

      {/* ── 3×3 crop of the grid, still exactly 1px apart ───────────────── */}
      <div style={{ padding: `0 ${PAD}px`, flexShrink: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(3, ${CELL}px)`,
            gap: `${GAP}px`,
            width: GRID_W,
            height: GRID_H,
            alignContent: "start",
          }}
        >
          {cells.map((post) => (
            <div
              key={post.id}
              style={{
                position: "relative",
                width: CELL,
                height: CELL,
                overflow: "hidden",
                background: PALETTE.button,
              }}
            >
              <Photo src={src(post.imageUrl)} alt="" sizes="161px" glyphSize={26} priority />
            </div>
          ))}
        </div>
      </div>

      {/* ── Watermark ───────────────────────────────────────────────────── */}
      <div
        style={{
          height: WATERMARK_H,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: `0 ${PAD}px`,
        }}
      >
        <div style={{ textAlign: "right", lineHeight: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.01em", opacity: 0.85 }}>
            SubhSandesh
          </div>
          <div style={{ marginTop: 4, fontSize: 11, letterSpacing: "0.06em", opacity: 0.45 }}>
            {SITE_HOST}
          </div>
        </div>
      </div>
    </div>
  );
}
