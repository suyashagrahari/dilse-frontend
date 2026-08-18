"use client";

// ─── The share card — 9:16 ───────────────────────────────────────────────────
//
// 360×640 CSS px at pixelRatio 3 → a 1080×1920 PNG, which is exactly what a
// story slot wants.
//
// Carries: both names, the two scores, the disputed count, the stake, and the
// single most confidently-wrong prediction. That last line is the reason anyone
// posts this, so it gets the most room.
//
// NOTHING competitive appears on a solo card, because there is no solo card —
// this component is only ever mounted from the scorecard, which the solo path
// never reaches.

import { MONO, PALETTE, SERIF, type Capsule, type Scorecard } from "./types";
import { InkStamp, PaperTexture, paperFill } from "./paper";

export const SHARE_W = 360;
export const SHARE_H = 640;

export default function ShareCard({
  capsule,
  score,
  attachNode,
  capturing,
}: {
  capsule: Capsule;
  score: Scorecard;
  /** Callback ref. A `RefObject` read during render would trip `react-hooks/refs`. */
  attachNode: (el: HTMLDivElement | null) => void;
  /** Freezes every animation under the subtree before html-to-image clones it. */
  capturing: boolean;
}) {
  const highlight = score.highlight;

  return (
    <div
      ref={attachNode}
      className={capturing ? "capsule-capturing" : undefined}
      style={{
        width: SHARE_W,
        height: SHARE_H,
        ...paperFill("share-card"),
        color: PALETTE.ink,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "34px 28px",
        boxSizing: "border-box",
      }}
    >
      <PaperTexture seed="share-grain" opacity={0.07} />

      <div style={{ position: "relative" }}>
        <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 3, color: PALETTE.inkSoft }}>
          SEALED · OPENED
        </p>
        <p style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 2, marginTop: 6 }}>
          {capsule.pair.a.name.toUpperCase()} &nbsp;·&nbsp; {capsule.pair.b.name.toUpperCase()}
        </p>
      </div>

      {/* The two scores. */}
      <div style={{ position: "relative", marginTop: 26, display: "flex", gap: 12 }}>
        {(["a", "b"] as const).map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              border: `1px solid ${PALETTE.edge}`,
              borderRadius: 6,
              padding: "14px 10px",
              textAlign: "center",
              background: "rgba(255,255,255,.4)",
            }}
          >
            <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1.5, color: PALETTE.inkSoft }}>
              {capsule.pair[s].name.toUpperCase()}
            </p>
            <p style={{ fontFamily: MONO, fontSize: 38, lineHeight: 1.1, marginTop: 4 }}>{score[s]}</p>
          </div>
        ))}
      </div>

      <div style={{ position: "relative", marginTop: 18, display: "flex", justifyContent: "center", gap: 10 }}>
        <InkStamp label={`${score.disputed} disputed`} tone="disputed" seed="share-disputed" size={12} />
      </div>

      {/* The funniest line the data can produce. */}
      <div style={{ position: "relative", marginTop: 26, flex: 1 }}>
        <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: PALETTE.inkSoft }}>
          MOST CONFIDENTLY WRONG
        </p>
        <p style={{ fontFamily: SERIF, fontSize: 21, lineHeight: 1.42, marginTop: 8, wordBreak: "break-word" }}>
          {highlight
            ? `${highlight.authorName} was "${highlight.label}" that ${highlight.prediction.text}`
            : "nobody was confidently wrong. suspicious."}
        </p>
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ height: 1, background: PALETTE.edge }} />
        <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: PALETTE.inkSoft, marginTop: 12 }}>
          THE STAKE
        </p>
        <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.4, marginTop: 4, wordBreak: "break-word" }}>
          {capsule.stake || "—"}
        </p>
        <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, marginTop: 12, color: PALETTE.wax }}>
          {score.owedBy ? `OWED BY ${score.owedBy.name.toUpperCase()}` : "NOBODY OWES ANYTHING"}
        </p>
        <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, color: PALETTE.inkFaint, marginTop: 16 }}>
          SUBHSANDESH
        </p>
      </div>
    </div>
  );
}
