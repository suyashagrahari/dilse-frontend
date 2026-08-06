"use client";

// ─── The engine ──────────────────────────────────────────────────────────────
//
// Single owner of: board measurement, sprite building, the ONE rAF loop, placed
// state, the settle/overshoot/glow animations, the final-piece drop and the
// completion timeline (seam fade → beat → cross-dissolve).
//
// WHY SO MUCH LIVES IN REFS
//
// The loop must not re-subscribe when a piece lands, or every placement would
// tear down and rebuild the animation frame. So the loop reads from refs and
// only the values the UI renders from are mirrored into state. `placedOrder` is
// the one exception — the tray and the progress count need it — and it is
// append-only, so a render per placement is exactly one render per placement.
//
// THE COMPLETION ORDERING
//
// `sealing` always finishes before `dissolving` starts, with a beat of silence
// between them. That is acceptance criterion 9 and it is enforced here, in one
// place, so no caller can accidentally overlap the two.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  COMPLETION,
  FINAL_PIECE,
  SNAP,
  buildEdgeMap,
  buildPieces,
  finalPieceIndex,
  overhangPx,
  type Piece,
} from "./types";
import type { EdgeMap } from "./types";
import type {
  BoardLayout,
  EngineOptions,
  PieceSprite,
  PuzzleEngineApi,
  PuzzlePhase,
} from "./engineContract";
import { buildSprites, drawGhost, drawSprite, strokeCell } from "./pieceRender";
import { useSourceImage } from "./useSourceImage";

const NO_PIECES: never[] = [];

/** Per-piece transient animation, keyed by index. Lives only in the loop. */
interface Anim {
  /** Timestamp the settle began. */
  settleAt: number;
  /** Timestamp the glow began, or 0. */
  glowAt: number;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
/** Accelerating — the final piece drops, it does not float down. */
const easeInQuad = (t: number) => t * t;
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

export function usePuzzleEngine(opts: EngineOptions): PuzzleEngineApi {
  const { cols, rows, imageUrl, revealImageUrl, seed, finalPieceMode, reducedMotion, callbacks } = opts;

  // The elements live in INTERNAL refs — never returned, so the API object is
  // not tainted for `react-hooks/refs` — and `nodeVersion` is bumped when one
  // attaches so the effects below re-run once the DOM actually exists.
  //
  // Not `useState<HTMLCanvasElement>`: sizing a canvas means assigning to
  // `.width`/`.height`, and mutating something that came out of `useState` is
  // itself a lint error. A DOM node is a mutable handle, not a state value.
  const boardWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodeVersion, setNodeVersion] = useState(0);
  const attachBoardWrap = useCallback((el: HTMLDivElement | null) => {
    boardWrapRef.current = el;
    setNodeVersion((v) => v + 1);
  }, []);
  const attachCanvas = useCallback((el: HTMLCanvasElement | null) => {
    canvasRef.current = el;
    setNodeVersion((v) => v + 1);
  }, []);

  // ── Geometry ───────────────────────────────────────────────────────────────
  //
  // The board keeps the grid's aspect, so a piece is never distorted. Width is
  // measured from the wrapper; height follows.

  const [layout, setLayout] = useState<BoardLayout | null>(null);
  const boardRectRef = useRef<DOMRect | null>(null);

  const measure = useCallback(() => {
    const el = boardWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    boardRectRef.current = rect;
    const boardW = Math.round(rect.width);
    if (boardW <= 0) return;
    const pieceW = boardW / cols;
    const pieceH = pieceW; // square cells: the grid's aspect drives board height
    const boardH = Math.round(pieceH * rows);
    setLayout((prev) =>
      prev && prev.boardW === boardW && prev.boardH === boardH && prev.cols === cols && prev.rows === rows
        ? prev
        : { boardW, boardH, pieceW, pieceH, cols, rows },
    );
  }, [cols, rows]);

  useEffect(() => {
    measure();
    const el = boardWrapRef.current;
    if (!el) return;
    // Rotation and font-loading reflows both come through here.
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    const onScroll = () => {
      boardRectRef.current = el.getBoundingClientRect();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure, nodeVersion]);

  // ── The cut ────────────────────────────────────────────────────────────────
  //
  // Seeded, so the same puzzle cuts the same way on every device. Independent
  // of the board size, which is what lets a rotation rebuild the sprites
  // without disturbing which pieces are already down.

  const edgeMap = useMemo(() => buildEdgeMap(cols, rows, seed), [cols, rows, seed]);
  const pieces = useMemo<Piece[]>(
    () => (layout ? buildPieces(edgeMap, layout.boardW, layout.boardH) : NO_PIECES),
    [edgeMap, layout],
  );
  const finalIndex = useMemo(
    () => (finalPieceMode === "sender-release" ? finalPieceIndex(edgeMap, seed) : -1),
    [edgeMap, seed, finalPieceMode],
  );

  // ── Source bitmap ──────────────────────────────────────────────────────────

  const aspect = cols / rows;
  const { source, status: sourceStatus } = useSourceImage(imageUrl, aspect, seed);
  const { source: reveal } = useSourceImage(revealImageUrl, aspect, `${seed}:reveal`);
  const hasReveal = Boolean(revealImageUrl) && reveal !== null;

  // ── Sprites ────────────────────────────────────────────────────────────────

  // Derived, not stored. Building sprites is expensive but it is a pure
  // function of (layout, source, pieces) — running it in an effect and pushing
  // the result into state meant one render showing the previous cut's bitmaps
  // against the new layout, and a cascading render on every resize.
  const { scaled, sprites } = useMemo<{
    scaled: HTMLCanvasElement | null;
    sprites: PieceSprite[];
  }>(() => {
    if (!layout || !source || pieces.length === 0) return { scaled: null, sprites: NO_PIECES };
    const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));

    // Scale the photograph to the board ONCE. Every sprite is cut out of this
    // one bitmap, so a 12-piece puzzle does one resample rather than twelve.
    const c = document.createElement("canvas");
    c.width = Math.ceil(layout.boardW * dpr);
    c.height = Math.ceil(layout.boardH * dpr);
    const sctx = c.getContext("2d");
    if (!sctx) return { scaled: null, sprites: NO_PIECES };
    sctx.scale(dpr, dpr);
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(source.canvas, 0, 0, layout.boardW, layout.boardH);

    return { scaled: c, sprites: buildSprites(c, pieces, layout, dpr) };
  }, [layout, source, pieces]);

  // ── Placement ──────────────────────────────────────────────────────────────

  // Placement is stored WITH the cut it belongs to, and read back only while
  // that cut is still current. A new grid or seed therefore empties the board
  // by derivation — clearing it from an effect would have meant one render
  // showing the old placements against the new cut.
  const [placement, setPlacement] = useState<{ cut: EdgeMap; order: number[] }>({
    cut: edgeMap,
    order: NO_PIECES,
  });
  const placedOrder = placement.cut === edgeMap ? placement.order : NO_PIECES;
  const placedSet = useMemo(() => new Set(placedOrder), [placedOrder]);

  const placedRef = useRef<Set<number>>(new Set());
  const animsRef = useRef<Map<number, Anim>>(new Map());
  const hintRef = useRef(-1);
  // The loop reads `placedRef`, which cannot be derived, so it is re-synced
  // against the current cut here instead.
  const cutRef = useRef(edgeMap);
  useEffect(() => {
    if (cutRef.current === edgeMap) return;
    cutRef.current = edgeMap;
    placedRef.current = new Set();
    animsRef.current = new Map();
  }, [edgeMap]);

  const isPlaced = useCallback((index: number) => placedSet.has(index), [placedSet]);

  // ── Phase ──────────────────────────────────────────────────────────────────

  // `commanded` is only ever moved by an event or a timer — `place`,
  // `releaseFinalPiece`, `beginCompletion`. The loading and error states are
  // NOT commanded: they are facts about the source image, so they are derived
  // here instead of being pushed in from an effect.
  const [commanded, setCommanded] = useState<PuzzlePhase>("playing");
  const notReady = sourceStatus === "loading" || !layout || sprites.length === 0;
  const phase: PuzzlePhase =
    sourceStatus === "error" ? "error" : notReady ? "loading" : commanded;

  const phaseRef = useRef<PuzzlePhase>(phase);
  const cbRef = useRef(callbacks);
  useEffect(() => {
    cbRef.current = callbacks;
  }, [callbacks]);

  // Mirror for the loop and the callbacks, and announce transitions. Both are
  // reads-after-commit, so neither belongs in the render pass.
  useEffect(() => {
    if (phaseRef.current === phase) return;
    phaseRef.current = phase;
    cbRef.current.onPhase?.(phase);
  }, [phase]);

  const goPhase = useCallback((next: PuzzlePhase) => {
    setCommanded(next);
  }, []);

  // ── The completion timeline ────────────────────────────────────────────────
  //
  // Driven by timers rather than the rAF loop so the ordering is explicit and
  // readable. The loop only reads `sealStartRef` / `dissolveStartRef` to know
  // how far through each fade it is.

  const sealStartRef = useRef(0);
  const dissolveStartRef = useRef(0);
  const finalDropRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(
    () => () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    },
    [],
  );

  const beginCompletion = useCallback(() => {
    goPhase("sealing");
    sealStartRef.current = performance.now();
    const sealMs = reducedMotion ? 0 : COMPLETION.seamFadeMs;

    after(sealMs + COMPLETION.beatMs, () => {
      cbRef.current.onSealed?.();
      if (hasReveal) {
        goPhase("dissolving");
        dissolveStartRef.current = performance.now();
        after(reducedMotion ? 0 : COMPLETION.crossDissolveMs, () => {
          goPhase("complete");
          cbRef.current.onComplete?.();
        });
      } else {
        goPhase("complete");
        cbRef.current.onComplete?.();
      }
    });
  }, [after, goPhase, hasReveal, reducedMotion]);

  /** Total pieces, and how many the recipient is allowed to place herself. */
  const total = cols * rows;
  const playable = finalIndex >= 0 ? total - 1 : total;

  const place = useCallback(
    (index: number) => {
      if (index < 0 || index >= total) return;
      if (placedRef.current.has(index)) return;
      // The sender still holds this one; only `releaseFinalPiece` may land it.
      if (index === finalIndex && phaseRef.current !== "dropping-final") return;

      const ordinal = placedRef.current.size;
      placedRef.current.add(index);
      animsRef.current.set(index, {
        settleAt: reducedMotion ? 0 : performance.now(),
        glowAt: reducedMotion ? 0 : performance.now(),
      });
      setPlacement((prev) =>
        prev.cut === edgeMap
          ? { cut: edgeMap, order: [...prev.order, index] }
          : { cut: edgeMap, order: [index] },
      );
      if (hintRef.current === index) hintRef.current = -1;

      cbRef.current.onPlaced?.(index, ordinal);

      const placedCount = placedRef.current.size;
      if (placedCount >= total) {
        beginCompletion();
      } else if (finalIndex >= 0 && placedCount >= playable) {
        goPhase("waiting-final");
      }
    },
    [beginCompletion, edgeMap, finalIndex, goPhase, playable, reducedMotion, total],
  );

  const releaseFinalPiece = useCallback(() => {
    if (finalIndex < 0) return;
    if (placedRef.current.has(finalIndex)) return;
    if (phaseRef.current !== "waiting-final") return;
    goPhase("dropping-final");
    finalDropRef.current = performance.now();
    // The drop is animated by the loop; the landing is committed here so the
    // reward sequence fires at the moment it touches down, not before.
    after(reducedMotion ? 0 : FINAL_PIECE.dropMs, () => place(finalIndex));
  }, [after, finalIndex, goPhase, place, reducedMotion]);

  const highlight = useCallback(
    (index: number) => {
      if (!placedRef.current.has(index)) return;
      const existing = animsRef.current.get(index);
      animsRef.current.set(index, { settleAt: existing?.settleAt ?? 0, glowAt: performance.now() });
    },
    [],
  );

  const setHintIndex = useCallback((index: number) => {
    hintRef.current = index;
  }, []);

  // ── The loop ───────────────────────────────────────────────────────────────

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const spritesRef = useRef<PieceSprite[]>(NO_PIECES);
  const piecesRef = useRef<Piece[]>(NO_PIECES);
  const layoutRef = useRef<BoardLayout | null>(null);
  const scaledRef = useRef<HTMLCanvasElement | null>(null);
  // Mirrored for the rAF loop, which must not re-subscribe every time a piece
  // lands. Written in an effect rather than during render — the loop only reads
  // them on the next frame, which is always after the commit.
  useEffect(() => {
    spritesRef.current = sprites;
    piecesRef.current = pieces;
    layoutRef.current = layout;
    scaledRef.current = scaled;
  }, [sprites, pieces, layout, scaled]);

  useEffect(() => {
    const onVisibility = () => {
      const hidden = document.hidden;
      pausedRef.current = hidden;
      setPaused(hidden);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
    canvas.width = Math.ceil(layout.boardW * dpr);
    canvas.height = Math.ceil(layout.boardH * dpr);
    canvas.style.height = `${layout.boardH}px`;

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (pausedRef.current) return;

      const L = layoutRef.current;
      const S = spritesRef.current;
      const P = piecesRef.current;
      if (!L || S.length === 0 || P.length === 0) return;

      const now = performance.now();
      const ph = phaseRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, L.boardW, L.boardH);

      // Ghost, fading out as the picture becomes whole so it never shows
      // through the finished photograph.
      const scaled = scaledRef.current;
      const sealing = ph === "sealing" || ph === "dissolving" || ph === "complete";
      if (scaled && !sealing) drawGhost(ctx, scaled, L, 0.08);

      // Seam fade: the seams disappear by cross-fading the WHOLE photograph in
      // over the assembled pieces, which is cheaper and smoother than trying to
      // animate twelve outlines away individually.
      let sealT = 0;
      if (sealing && scaled) {
        sealT = ph === "sealing" && !reducedMotion
          ? clamp01((now - sealStartRef.current) / COMPLETION.seamFadeMs)
          : 1;
      }

      for (const piece of P) {
        if (!placedRef.current.has(piece.index)) continue;
        const sprite = S[piece.index];
        if (!sprite) continue;

        const anim = animsRef.current.get(piece.index);
        let scale = 1;
        let glow = 0;
        if (anim && !reducedMotion) {
          if (anim.settleAt) {
            const t = clamp01((now - anim.settleAt) / SNAP.overshootMs);
            // Overshoot then settle: 1.04 → 1.00.
            scale = t >= 1 ? 1 : SNAP.overshootScale + (1 - SNAP.overshootScale) * easeOutCubic(t);
          }
          if (anim.glowAt) {
            const g = clamp01((now - anim.glowAt) / SNAP.glowMs);
            glow = g >= 1 ? 0 : 1 - g;
          }
          if (scale === 1 && glow === 0) animsRef.current.delete(piece.index);
        }

        drawSprite(ctx, sprite, piece, L, { scale, glow });
      }

      // The hole the sender's piece left, pulsing, while we wait for it.
      if ((ph === "waiting-final" || ph === "dropping-final") && finalIndex >= 0) {
        const piece = P[finalIndex];
        if (piece && !placedRef.current.has(finalIndex)) {
          const pulse = reducedMotion
            ? 0.55
            : 0.35 + 0.35 * (0.5 + 0.5 * Math.sin((now / FINAL_PIECE.pulseMs) * Math.PI * 2));
          strokeCell(
            ctx,
            piece.homeX,
            piece.homeY,
            L.pieceW,
            L.pieceH,
            `rgba(255,190,120,${pulse.toFixed(3)})`,
            [7, 6],
            2.5,
          );
        }
      }

      // The final piece falling in.
      if (ph === "dropping-final" && finalIndex >= 0 && !reducedMotion) {
        const piece = P[finalIndex];
        const sprite = S[finalIndex];
        if (piece && sprite) {
          const t = clamp01((now - finalDropRef.current) / FINAL_PIECE.dropMs);
          const dy = (1 - easeInQuad(t)) * -FINAL_PIECE.dropFromPx;
          ctx.save();
          ctx.translate(0, dy);
          drawSprite(ctx, sprite, piece, L, { alpha: 0.35 + 0.65 * t });
          ctx.restore();
        }
      }

      // Hint: ghost the home cell of a piece still in the tray.
      const hint = hintRef.current;
      if (hint >= 0 && !placedRef.current.has(hint)) {
        const piece = P[hint];
        if (piece) {
          strokeCell(ctx, piece.homeX, piece.homeY, L.pieceW, L.pieceH, "rgba(99,102,241,0.55)");
        }
      }

      // Seams gone, then the reveal. `sealT` reaching 1 before `dissolveStart`
      // is ever set is what keeps these two from overlapping.
      if (sealing && scaled) {
        ctx.save();
        ctx.globalAlpha = sealT;
        ctx.drawImage(scaled, 0, 0, L.boardW, L.boardH);
        ctx.restore();

        if ((ph === "dissolving" || ph === "complete") && reveal) {
          const t =
            ph === "complete" || reducedMotion
              ? 1
              : clamp01((now - dissolveStartRef.current) / COMPLETION.crossDissolveMs);
          ctx.save();
          ctx.globalAlpha = t;
          ctx.drawImage(reveal.canvas, 0, 0, L.boardW, L.boardH);
          ctx.restore();
        }
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [layout, finalIndex, reducedMotion, reveal, nodeVersion]);

  // ── Tray contents ──────────────────────────────────────────────────────────

  const trayIndices = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < total; i++) {
      if (placedSet.has(i)) continue;
      if (i === finalIndex) continue; // the sender is holding this one
      out.push(i);
    }
    return out;
  }, [placedSet, finalIndex, total]);

  const getBoardRect = useCallback(() => {
    const el = boardWrapRef.current;
    if (el) boardRectRef.current = el.getBoundingClientRect();
    return boardRectRef.current;
  }, []);

  const getSnapshotDataUrl = useCallback(() => {
    if (phaseRef.current !== "complete") return null;
    const canvas = canvasRef.current;
    if (!canvas) return null;
    try {
      return canvas.toDataURL("image/png");
    } catch {
      // Only reachable if something bypassed `toDataUrl` and tainted the canvas.
      return null;
    }
  }, []);

  return {
    phase,
    errorMessage:
      phase === "error"
        ? "That photo could not be loaded, so there is nothing to assemble yet."
        : null,
    layout,
    pieces,
    sprites,
    finalIndex,
    placedOrder,
    isPlaced,
    trayIndices,
    attachBoardWrap,
    attachCanvas,
    getBoardRect,
    place,
    releaseFinalPiece,
    highlight,
    setHintIndex,
    paused,
    getSnapshotDataUrl,
  };
}

/** Exported for the drag controller's snap test — same maths, one definition. */
export const snapRadiusPx = (layout: BoardLayout): number => layout.pieceW * SNAP.radiusFraction;

/** Exported for the tray, which sizes its thumbnails from the sprite padding. */
export const spritePadding = overhangPx;
