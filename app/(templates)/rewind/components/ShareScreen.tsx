"use client";

// ─── Rewind — the end of the story ───────────────────────────────────────────
//
// The share card, centred and scaled to whatever space is left, plus the three
// things a person wants at the end: keep it, send it, watch it again.
//
// The whole screen lives inside 100dvh and never scrolls. The card is fitted by
// a single `transform: scale()` on a wrapper OUTSIDE the ref'd node, so the
// composition itself stays at its declared pixel size no matter how narrow the
// phone is — see the header comment in ShareCard.tsx.
//
// THE EXPORT SEQUENCE (the part that is easy to get subtly wrong):
//
//   1. flip `frozen`, then wait for React to commit AND for the browser to
//      paint it — two rAFs, not one. One rAF fires before the style recalc that
//      the commit scheduled.
//   2. finish every running animation on the capture subtree. `html-to-image`
//      snapshots computed style, so a card captured 300ms into its entrance
//      exports at 40% opacity and nobody notices until it is on a story.
//      `.finish()` and not `.cancel()`: the keyframes are authored `from`-only
//      with `fill: both`, so the finished state IS the resting layout.
//   3. belt and braces — a class that kills `animation` and `transition` on the
//      subtree, for anything the Web Animations API does not enumerate.
//   4. capture via `exportNodeToPng`, which owns fonts, un-scaling and the
//      download. It never throws; it returns a message we surface inline.
//   5. release everything, whatever happened.

import React from "react";
import Link from "next/link";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import ShareCard, { CARD_H, CARD_W } from "./ShareCard";
import { sfxFailed, sfxReplay, sfxSaved } from "./rewindAudio";
import { NEAR_BLACK, textOn, type Archetype, type DerivedStats, type RewindData } from "./types";

const DISPLAY_FONT = 'var(--font-oswald), "Arial Narrow", sans-serif';
const BODY_FONT = "var(--font-outfit), system-ui, sans-serif";

/** Class applied to the capture subtree for the duration of the snapshot. */
const FREEZE_CLASS = "rw-capture-freeze";

/**
 * Keyframes live out here rather than inside the card, so the node handed to
 * `exportNodeToPng` contains nothing but the poster. Every one of them is
 * authored `from`-only: the resting style IS the final frame, which is what
 * makes both "finish the animation" and "delete the animation" land in the
 * same place.
 */
const KEYFRAMES = `
@keyframes rwBandIn { from { opacity: 0; transform: translateY(26px); } }
@keyframes rwNumIn  { from { opacity: 0; transform: translateY(34px); } }
@keyframes rwRowIn  { from { opacity: 0; transform: translateX(-22px); } }
@keyframes rwRuleIn { from { opacity: 0; transform: scaleX(0); } }
@keyframes rwStageIn { from { opacity: 0; transform: translateY(20px); } }
.${FREEZE_CLASS}, .${FREEZE_CLASS} * {
  animation: none !important;
  transition: none !important;
}
@media (prefers-reduced-motion: reduce) {
  [data-rewind-card] *, [data-rewind-stage] { animation: none !important; transition: none !important; }
}
`;

/** Two frames: one for React's commit, one for the style recalc it schedules. */
function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/** Park every animation in the subtree on its final frame. */
function freezeSubtree(node: HTMLElement): void {
  if (typeof node.getAnimations === "function") {
    for (const a of node.getAnimations({ subtree: true })) {
      try {
        // Throws for an infinite-duration animation — pausing is the best we
        // can do there, and it is still a stable frame.
        a.finish();
      } catch {
        try {
          a.pause();
        } catch {
          /* nothing else to try; the freeze class still covers it */
        }
      }
    }
  }
  node.classList.add(FREEZE_CLASS);
}

function thawSubtree(node: HTMLElement): void {
  node.classList.remove(FREEZE_CLASS);
}

export interface ShareScreenProps {
  data: RewindData;
  stats: DerivedStats;
  archetype: Archetype;
  mode: "demo" | "live";
  reduced: boolean;
  onReplay: () => void;
  /**
   * The story shell may already render a global SubhSandesh mark. Pass false to
   * suppress the one down here rather than showing the recipient two.
   */
  showBrand?: boolean;
}

export default function ShareScreen({
  data,
  stats,
  archetype,
  mode,
  reduced,
  onReplay,
  showBrand = true,
}: ShareScreenProps): React.JSX.Element {
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const cardRef = React.useRef<HTMLDivElement | null>(null);
  const statusTimer = React.useRef<number | null>(null);

  const [scale, setScale] = React.useState(0);
  const [frozen, setFrozen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const [canNativeShare, setCanNativeShare] = React.useState(false);

  const fg = textOn(NEAR_BLACK);
  const accent = archetype.bg;

  // ── Fit, never reflow ──────────────────────────────────────────────────────
  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (w <= 0 || h <= 0) return;
      setScale(Math.min(w / CARD_W, h / CARD_H));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  React.useEffect(
    () => () => {
      if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
    },
    [],
  );

  const flash = React.useCallback((message: string) => {
    setStatus(message);
    if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => setStatus(""), 4500);
  }, []);

  const handleSave = React.useCallback(async () => {
    if (saving) return;
    const node = cardRef.current;
    if (!node) {
      flash("Nothing to save yet");
      return;
    }

    setSaving(true);
    setStatus("");
    setFrozen(true);
    await nextPaint();

    freezeSubtree(node);
    try {
      const result = await exportNodeToPng(node, {
        width: CARD_W,
        height: CARD_H,
        filename: `rewind-${fileSlug(data.recipientName)}`,
        // The card's own top band. Fills the area behind any rounding or
        // sub-pixel edge so the file is never transparent at the border.
        backgroundColor: NEAR_BLACK,
        pixelRatio: 2, // 540x960 at 2x === a true 1080x1920 file.
      });
      flash(result.message);
      if (result.ok) sfxSaved();
      else sfxFailed();
    } finally {
      thawSubtree(node);
      setFrozen(false);
      setSaving(false);
    }
  }, [saving, data.recipientName, flash]);

  const handleNativeShare = React.useCallback(async () => {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      void handleSave();
      return;
    }
    try {
      await navigator.share({
        title: `${data.senderName} & ${data.recipientName} — Rewind`,
        text: `${stats.days.toLocaleString("en-IN")} days. ${archetype.name}.`,
        url: window.location.href,
      });
    } catch (err) {
      // A cancelled share sheet is not a failure — say nothing.
      if ((err as DOMException | undefined)?.name === "AbortError") return;
      void handleSave();
    }
  }, [data.senderName, data.recipientName, stats.days, archetype.name, handleSave]);

  const handleReplay = React.useCallback(() => {
    sfxReplay();
    onReplay();
  }, [onReplay]);

  const btnBase: React.CSSProperties = {
    minHeight: 52,
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontFamily: DISPLAY_FONT,
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    padding: "0 22px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    WebkitTapHighlightColor: "transparent",
  };

  return (
    <div
      style={{
        height: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: NEAR_BLACK,
        color: fg,
        fontFamily: BODY_FONT,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* ── The card, fitted ─────────────────────────────────────────────── */}
      <div
        ref={stageRef}
        data-rewind-stage=""
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 12px 6px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: CARD_W * scale,
            height: CARD_H * scale,
            position: "relative",
            borderRadius: 18 * Math.max(scale, 0.001),
            overflow: "hidden",
            boxShadow: "0 18px 50px rgba(0,0,0,0.55)",
            animation: reduced || scale === 0 ? undefined : "rwStageIn 520ms cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: CARD_W,
              height: CARD_H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <ShareCard
              ref={cardRef}
              data={data}
              stats={stats}
              archetype={archetype}
              frozen={frozen}
              reduced={reduced}
            />
          </div>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          padding: "6px 16px calc(12px + env(safe-area-inset-bottom))",
          boxSizing: "border-box",
        }}
      >
        <div
          aria-live="polite"
          style={{
            height: 18,
            fontSize: 12,
            letterSpacing: "0.04em",
            textAlign: "center",
            opacity: status ? 0.68 : 0,
            transition: reduced ? undefined : "opacity 200ms linear",
          }}
        >
          {status || " "}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            aria-busy={saving}
            style={{
              ...btnBase,
              flex: 1,
              background: fg,
              color: textOn(fg),
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : "Save as PNG"}
          </button>

          {canNativeShare && (
            <button
              type="button"
              onClick={() => void handleNativeShare()}
              aria-label="Share this Rewind"
              style={{
                ...btnBase,
                minWidth: 52,
                background: accent,
                color: textOn(accent),
              }}
            >
              Share
            </button>
          )}
        </div>

        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: showBrand && mode === "live" ? "space-between" : "center",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={handleReplay}
            style={{
              ...btnBase,
              minHeight: 44,
              fontSize: 13,
              padding: "0 18px",
              background: "transparent",
              color: fg,
              opacity: 0.72,
              boxShadow: `inset 0 0 0 1px ${fg}3D`,
            }}
          >
            Replay
          </button>

          {showBrand && mode === "live" && (
            <Link
              href="/templates"
              aria-label="SubhSandesh — make your own"
              style={{
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "0 14px",
                borderRadius: 999,
                textDecoration: "none",
                color: fg,
                opacity: 0.8,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.webp" alt="" width={18} height={18} style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.02em" }}>
                Make your own
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
