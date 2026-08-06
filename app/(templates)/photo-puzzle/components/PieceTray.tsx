"use client";

// ─── The tray ────────────────────────────────────────────────────────────────
//
// A horizontally scrollable strip of unplaced pieces, rotated and overlapping —
// pieces scattered on a table, not filed in a drawer. Rotation comes from
// `seededSpread`, so the scatter is identical on every render and every device;
// `Math.random()` here would reshuffle the tray on every placement.
//
// Also renders the drag floater, portalled to <body> so no ancestor's
// `overflow: hidden` or stacking context can clip a piece mid-drag.

import { createPortal } from "react-dom";
import { useSyncExternalStore } from "react";
import { seededSpread } from "@/lib/seededRandom";
import { DRAG } from "./types";
import type { PuzzleEngineApi } from "./engineContract";
import type { DragControllerApi } from "./useDragController";
import { INK_SOFT, PAPER_EDGE, RADIUS } from "./puzzleTheme";

export interface PieceTrayProps {
  engine: PuzzleEngineApi;
  drag: DragControllerApi;
  reducedMotion: boolean;
  /** Stable seed for the scatter. */
  seed: string;
  /** Fires on every pointerdown in the tray — the orchestrator unlocks audio. */
  onGesture: () => void;
  className?: string;
}

/** The mounted flag never changes after hydration, so there is nothing to
 *  subscribe to. */
const subscribeNever = () => () => {};

/** Tray thumbnails are capped so a 2×2 puzzle does not show four huge slabs. */
const MAX_THUMB = 104;

export default function PieceTray({
  engine,
  drag,
  reducedMotion,
  seed,
  onGesture,
  className,
}: PieceTrayProps) {
  // Portals need a DOM target, which does not exist during SSR. Expressed as a
  // store read rather than mount-state-set-in-an-effect: same result, one fewer
  // render, and no synchronous setState during commit.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);

  const { trayIndices, sprites } = engine;
  const dragging = drag.state.index;

  const floaterSprite = dragging >= 0 ? sprites[dragging] : null;

  return (
    <>
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          overflowX: "auto",
          overflowY: "hidden",
          // Pull-to-refresh fires constantly during drags without this.
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          padding: "14px 18px",
          minHeight: MAX_THUMB + 34,
          borderRadius: RADIUS,
          border: `1px solid ${PAPER_EDGE}`,
          background: "linear-gradient(180deg,#F6F4FF 0%,#EFECFB 100%)",
        }}
      >
        {trayIndices.length === 0 && (
          <div
            style={{
              color: INK_SOFT,
              fontSize: 13,
              letterSpacing: "0.06em",
              padding: "0 6px",
            }}
          >
            the tray is empty
          </div>
        )}

        {trayIndices.map((index) => {
          const sprite = sprites[index];
          if (!sprite) return null;

          const longest = Math.max(sprite.w, sprite.h);
          const k = longest > 0 ? Math.min(1, MAX_THUMB / longest) : 1;
          const w = sprite.w * k;
          const h = sprite.h * k;

          const rot = reducedMotion ? 0 : seededSpread(seed, `tray:${index}`, DRAG.trayRotationDeg);
          const isDragging = dragging === index;

          return (
            <div
              key={index}
              role="button"
              tabIndex={0}
              aria-label={`Puzzle piece ${index + 1}`}
              onPointerDown={(e) => {
                onGesture();
                drag.beginDrag(e, index);
              }}
              style={{
                flex: "0 0 auto",
                width: w,
                height: h,
                // Overlap, so the strip reads as a scattered pile.
                marginRight: -w * 0.18,
                transform: `rotate(${rot.toFixed(2)}deg)`,
                // The piece under the finger is drawn by the floater instead.
                opacity: isDragging ? 0 : 1,
                touchAction: "none",
                cursor: "grab",
                filter: "drop-shadow(0 6px 10px rgba(30,27,51,0.22))",
                transition: reducedMotion ? undefined : "opacity 120ms linear",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sprite.url}
                alt=""
                draggable={false}
                style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
              />
            </div>
          );
        })}
      </div>

      {mounted &&
        floaterSprite &&
        createPortal(
          <div
            aria-hidden
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: floaterSprite.w,
              height: floaterSprite.h,
              // `transform` only — no left/top animation, so the drag stays on
              // the compositor and never triggers layout.
              transform: `translate3d(${drag.state.x}px, ${drag.state.y}px, 0) scale(${drag.state.scale})`,
              transformOrigin: "center",
              pointerEvents: "none",
              zIndex: 9999,
              filter:
                drag.state.mode === "dragging" || drag.state.mode === "lifting"
                  ? "drop-shadow(0 18px 26px rgba(30,27,51,0.38))"
                  : "drop-shadow(0 8px 14px rgba(30,27,51,0.26))",
              willChange: "transform",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={floaterSprite.url}
              alt=""
              draggable={false}
              style={{ width: "100%", height: "100%", display: "block" }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
