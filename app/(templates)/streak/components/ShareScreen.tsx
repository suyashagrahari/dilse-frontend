// ─── The share card ──────────────────────────────────────────────────────────
//
// 9:16 at 360 × 640 logical pixels, captured at pixelRatio 3 → a 1080 × 1920
// PNG, which is exactly the frame a story wants.
//
// Three things make the file match the screen, all of them learned the hard
// way and two of them handled inside `lib/exportPng`:
//
//   1. `await document.fonts.ready` before capture, or the serif silently
//      falls back to Times and the card looks like a different product.
//      (Handled by `exportNodeToPng`.)
//   2. The captured node is rendered OFF-SCREEN AT TRUE SIZE, never scaled to
//      fit. html-to-image copies computed style, so a `transform: scale()` on
//      the node produces a shrunken artifact in the corner of a correct canvas.
//   3. `.streak-frozen` is applied to the subtree first, pausing every
//      animation and zeroing every delay. Without it a capture taken while the
//      canopy is fading in bakes a half-lit strand into the file.

"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import {
  PALETTE,
  SERIF,
  UI,
  buildGrid,
  deriveStats,
  isComplete,
  truncWord,
  type StreakData,
  type StreakView,
} from "./types";
import { ARCHIVE_COPY } from "./archiveCopy";
import Lights from "./Lights";

export const CARD_W = 360;
export const CARD_H = 640;

export interface ShareScreenProps {
  data: StreakData;
  view: StreakView;
  today: string;
  onBack: () => void;
  onToast: (message: string) => void;
  /** The published link, when there is one. */
  shareUrl?: string | null;
}

export default function ShareScreen({ data, view, today, onBack, onToast, shareUrl }: ShareScreenProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => deriveStats(data, view), [data, view]);
  const cells = useMemo(() => buildGrid(data, today), [data, today]);
  const litDates = useMemo(
    () => data.checkIns.filter((d) => d.date <= today && isComplete(d)).map((d) => d.date),
    [data.checkIns, today],
  );

  // The card's grid is a fixed-width miniature, so it reads at any run length.
  const gridPitch = cells.length <= 60 ? 12 : cells.length <= 200 ? 7 : 4.6;
  const weeks = cells.length > 0 ? cells[cells.length - 1].week - cells[0].week + 1 : 1;
  const firstWeek = cells.length > 0 ? cells[0].week : 0;

  const save = useCallback(async () => {
    setSaving(true);
    const node = cardRef.current;
    // Freeze the subtree BEFORE capture — see the header note.
    node?.classList.add("streak-frozen");
    const result = await exportNodeToPng(node, {
      width: CARD_W,
      height: CARD_H,
      pixelRatio: 3,
      backgroundColor: PALETTE.paper,
      filename: `${fileSlug(data.pair.a.name)}-${fileSlug(data.pair.b.name)}-day-${view.count}`,
    });
    node?.classList.remove("streak-frozen");
    setSaving(false);
    onToast(result.message);
  }, [data.pair.a.name, data.pair.b.name, view.count, onToast]);

  const share = useCallback(() => {
    if (!shareUrl || typeof navigator === "undefined") return;
    const nav: Navigator = navigator;
    if (typeof nav.share === "function") {
      nav.share({ title: `day ${view.count}. both of us.`, url: shareUrl }).catch(() => {});
      return;
    }
    nav.clipboard?.writeText(shareUrl).then(
      () => onToast("Link copied"),
      () => onToast("Couldn't copy the link"),
    );
  }, [shareUrl, view.count, onToast]);

  // Rendered TWICE — once scaled into the on-screen preview, once off-screen
  // at true size. Only the off-screen copy carries the ref, because that is the
  // node `exportNodeToPng` captures and a scaled node is trap 2.
  const renderCard = (captured: boolean) => (
    <div
      ref={captured ? cardRef : undefined}
      style={{
        width: CARD_W,
        height: CARD_H,
        background: PALETTE.paper,
        padding: "44px 30px 30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      <p style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: "0.18em", color: PALETTE.inkFaint }}>
        {data.pair.a.name.toUpperCase()} &nbsp;·&nbsp; {data.pair.b.name.toUpperCase()}
      </p>

      <div style={{ width: "100%", marginTop: 26 }}>
        <Lights dates={litDates} width={300} reduced idSuffix="-card" />
      </div>

      <p
        style={{
          fontFamily: SERIF,
          fontSize: 84,
          lineHeight: 1,
          color: PALETTE.ink,
          marginTop: 22,
          letterSpacing: "-0.02em",
        }}
      >
        {view.count}
      </p>
      <p style={{ fontFamily: UI, fontSize: 10.5, letterSpacing: "0.2em", color: PALETTE.inkFaint, marginTop: 8 }}>
        DAYS
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${weeks}, ${gridPitch}px)`,
          gridTemplateRows: `repeat(7, ${gridPitch}px)`,
          marginTop: 28,
        }}
      >
        {cells.map((c) => (
          <span
            key={c.date}
            style={{
              gridColumn: c.week - firstWeek + 1,
              gridRow: c.weekday + 1,
              width: gridPitch - 1.4,
              height: gridPitch - 1.4,
              borderRadius: Math.max(1, gridPitch * 0.2),
              background:
                c.state === "both"
                  ? PALETTE.accent
                  : c.state === "covered"
                    ? PALETTE.accentWash
                    : c.state === "half"
                      ? `linear-gradient(135deg, ${PALETTE.accent} 0 50%, transparent 50% 100%)`
                      : "transparent",
              border: c.state === "both" ? "none" : `0.8px solid ${PALETTE.edge}`,
            }}
          />
        ))}
      </div>

      <span style={{ flex: 1 }} />

      {stats.topWords.length > 0 && (
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 21,
            color: PALETTE.ink,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          {stats.topWords.map((w) => truncWord(w)).join("  ·  ")}
        </p>
      )}

      <p style={{ fontFamily: UI, fontSize: 9.5, letterSpacing: "0.16em", color: PALETTE.inkFaint, marginTop: 22 }}>
        SUBHSANDESH
      </p>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center gap-4" style={{ maxWidth: 360 }}>
      <div className="w-full flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full px-3"
          style={{
            minHeight: 44,
            fontFamily: UI,
            fontSize: 13,
            color: PALETTE.inkSoft,
            background: "transparent",
            border: `1px solid ${PALETTE.edge}`,
          }}
        >
          <ArrowLeft size={15} /> {ARCHIVE_COPY.archive.back}
        </button>
        <span className="flex-1" />
        <h2 style={{ fontFamily: SERIF, fontSize: 19, color: PALETTE.ink }}>{ARCHIVE_COPY.share.title}</h2>
      </div>

      {/* On-screen preview. Scaled to fit the phone — and it is a SEPARATE node
          from the one captured, so this transform can never reach the canvas. */}
      <div style={{ width: CARD_W * 0.78, height: CARD_H * 0.78, overflow: "hidden", borderRadius: 14, border: `1px solid ${PALETTE.edge}` }}>
        <div style={{ transform: "scale(0.78)", transformOrigin: "top left" }} aria-hidden="true">
          {renderCard(false)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full px-4"
          style={{
            minHeight: 44,
            fontFamily: UI,
            fontSize: 13,
            color: PALETTE.paper,
            background: PALETTE.ink,
            border: "none",
          }}
        >
          <Download size={15} /> {saving ? ARCHIVE_COPY.share.saving : ARCHIVE_COPY.share.save}
        </button>
        {shareUrl && (
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-2 rounded-full px-4"
            style={{
              minHeight: 44,
              fontFamily: UI,
              fontSize: 13,
              color: PALETTE.ink,
              background: "transparent",
              border: `1px solid ${PALETTE.edge}`,
            }}
          >
            <Share2 size={15} /> share
          </button>
        )}
      </div>

      {/* The node that is actually captured: off-screen, true size, unscaled. */}
      <div style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }} aria-hidden="true">
        {renderCard(true)}
      </div>
    </div>
  );
}
