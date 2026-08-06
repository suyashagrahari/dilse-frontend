"use client";

// ─── Drag, snap, and the absence of failure ──────────────────────────────────
//
// Pointer Events only — not touch and mouse separately. One pointer at a time;
// a second finger during a drag is ignored rather than fighting the first.
//
// The dragged piece is a single absolutely-positioned element moved with
// `transform`, so the drag is composited and never touches the canvas or
// triggers layout. That is what keeps it smooth while the board is animating.
//
// WRONG PLACEMENT IS IMPOSSIBLE, and it is worth being precise about how:
// there is no hit-test against other slots and no notion of a "wrong slot" in
// this file at all. The only question ever asked is "is this piece near ITS OWN
// home?". If yes it lands; if no it goes back to the tray. There is no branch
// in which a piece could arrive somewhere else, so there is nothing to guard.
//
// Returning to the tray is SILENT and unhurried. It is not a rejection, and it
// must never read as one.

import { useCallback, useEffect, useRef, useState } from "react";
import { SNAP, DRAG } from "./types";
import type { PuzzleEngineApi } from "./engineContract";

export interface DragState {
  /** Index under the finger, or -1. */
  index: number;
  /** Viewport-space top-left of the floating sprite. */
  x: number;
  y: number;
  scale: number;
  /** "returning" and "settling" are post-release animations. */
  mode: "idle" | "lifting" | "dragging" | "settling" | "returning";
}

export interface DragControllerApi {
  state: DragState;
  beginDrag: (e: React.PointerEvent, index: number) => void;
  /** Index whose home cell should be ghosted as a hint, or -1. */
  hintIndex: number;
}

const IDLE: DragState = { index: -1, x: 0, y: 0, scale: 1, mode: "idle" };

export function useDragController(
  engine: PuzzleEngineApi,
  opts: { reducedMotion: boolean; onLift?: (index: number) => void; onGesture?: () => void },
): DragControllerApi {
  const { reducedMotion, onLift, onGesture } = opts;
  const [state, setState] = useState<DragState>(IDLE);
  const [hintIndex, setHintIndex] = useState(-1);

  // Everything the pointer handlers need, without re-binding them per render.
  // Synced in an effect: writing a ref during render is a lint error, and the
  // window listeners below only read it from inside pointer events, which
  // always happen after the commit that updated it.
  const engineRef = useRef(engine);
  useEffect(() => {
    engineRef.current = engine;
  }, [engine]);

  const dragRef = useRef<{
    index: number;
    pointerId: number;
    /** Where in the sprite the finger grabbed it, so it does not jump on lift. */
    grabX: number;
    grabY: number;
    /** Where it came from, to glide back to. */
    fromX: number;
    fromY: number;
  } | null>(null);

  const rafRef = useRef<number | null>(null);
  const cancelAnim = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => cancelAnim, [cancelAnim]);

  /** Glide the floater from where it is to a target, then run `done`. */
  const glide = useCallback(
    (
      from: { x: number; y: number; scale: number },
      to: { x: number; y: number; scale: number },
      ms: number,
      mode: DragState["mode"],
      index: number,
      done: () => void,
    ) => {
      if (reducedMotion || ms <= 0) {
        done();
        return;
      }
      const start = performance.now();
      const step = () => {
        const t = Math.min(1, (performance.now() - start) / ms);
        // Ease-out: it decelerates into place rather than arriving at speed.
        const e = 1 - Math.pow(1 - t, 3);
        setState({
          index,
          mode,
          x: from.x + (to.x - from.x) * e,
          y: from.y + (to.y - from.y) * e,
          scale: from.scale + (to.scale - from.scale) * e,
        });
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
          done();
        }
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [reducedMotion],
  );

  const beginDrag = useCallback(
    (e: React.PointerEvent, index: number) => {
      const eng = engineRef.current;
      // One pointer at a time, and nothing that is already down can be lifted.
      if (dragRef.current) return;
      if (eng.isPlaced(index)) return;
      if (index === eng.finalIndex) return;

      const sprite = eng.sprites[index];
      if (!sprite) return;

      onGesture?.();

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const grabX = e.clientX - rect.left;
      const grabY = e.clientY - rect.top;

      // The tray thumbnail may be displayed smaller than the sprite; the floater
      // is full size, so re-anchor the grab point proportionally or the piece
      // lurches under the finger on lift.
      const kx = rect.width > 0 ? sprite.w / rect.width : 1;
      const ky = rect.height > 0 ? sprite.h / rect.height : 1;
      const anchorX = grabX * kx;
      const anchorY = grabY * ky;

      dragRef.current = {
        index,
        pointerId: e.pointerId,
        grabX: anchorX,
        grabY: anchorY,
        fromX: rect.left,
        fromY: rect.top,
      };

      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Capture is an optimisation; the window listeners below still work.
      }

      cancelAnim();
      setHintIndex(index);
      eng.setHintIndex(index);
      onLift?.(index);
      setState({
        index,
        mode: reducedMotion ? "dragging" : "lifting",
        x: e.clientX - anchorX,
        y: e.clientY - anchorY,
        scale: reducedMotion ? 1 : DRAG.liftScale,
      });
    },
    [cancelAnim, onGesture, onLift, reducedMotion],
  );

  // Move and release live on the window so a fast drag that outruns the
  // element — or leaves the viewport entirely — is still tracked.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.pointerId) return;
      e.preventDefault();

      const sprite = engineRef.current.sprites[d.index];
      const w = sprite?.w ?? 0;
      const h = sprite?.h ?? 0;
      // Clamp so a piece can never escape the viewport and become unreachable.
      const x = Math.min(Math.max(e.clientX - d.grabX, -w * 0.4), window.innerWidth - w * 0.6);
      const y = Math.min(Math.max(e.clientY - d.grabY, -h * 0.4), window.innerHeight - h * 0.6);

      setState({ index: d.index, mode: "dragging", x, y, scale: reducedMotion ? 1 : DRAG.liftScale });
    };

    const finish = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || e.pointerId !== d.pointerId) return;
      dragRef.current = null;

      const eng = engineRef.current;
      const layout = eng.layout;
      const sprite = eng.sprites[d.index];
      const piece = eng.pieces[d.index];
      const boardRect = eng.getBoardRect();

      const clearHint = () => {
        setHintIndex(-1);
        eng.setHintIndex(-1);
      };

      if (!layout || !sprite || !piece || !boardRect) {
        clearHint();
        setState(IDLE);
        return;
      }

      const curX = e.clientX - d.grabX;
      const curY = e.clientY - d.grabY;

      // Centre of the piece's CELL, in viewport space, versus where its cell
      // would sit if it were home. The comparison is centre-to-centre so the
      // tab overhang does not bias it.
      const cellCentreX = curX - sprite.offX + layout.pieceW / 2;
      const cellCentreY = curY - sprite.offY + layout.pieceH / 2;
      const homeCentreX = boardRect.left + piece.homeX + layout.pieceW / 2;
      const homeCentreY = boardRect.top + piece.homeY + layout.pieceH / 2;

      const dist = Math.hypot(cellCentreX - homeCentreX, cellCentreY - homeCentreY);
      const radius = layout.pieceW * SNAP.radiusFraction;

      if (dist <= radius) {
        // Land it. The floater finishes the journey in DOM, then the canvas
        // takes ownership — the engine runs the overshoot from there.
        const targetX = boardRect.left + piece.homeX + sprite.offX;
        const targetY = boardRect.top + piece.homeY + sprite.offY;
        glide(
          { x: curX, y: curY, scale: reducedMotion ? 1 : DRAG.liftScale },
          { x: targetX, y: targetY, scale: 1 },
          SNAP.settleMs,
          "settling",
          d.index,
          () => {
            eng.place(d.index);
            clearHint();
            setState(IDLE);
          },
        );
        return;
      }

      // Back to the tray. Silently — there is no failure voice in this build.
      glide(
        { x: curX, y: curY, scale: reducedMotion ? 1 : DRAG.liftScale },
        { x: d.fromX, y: d.fromY, scale: 1 },
        SNAP.returnMs,
        "returning",
        d.index,
        () => {
          clearHint();
          setState(IDLE);
        },
      );
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [glide, reducedMotion]);

  return { state, beginDrag, hintIndex };
}
