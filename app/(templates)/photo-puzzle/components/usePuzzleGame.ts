"use client";

// ─── The game's state, lifted above the chapters ─────────────────────────────
//
// Lives in the template root so walking back to the cover and returning keeps
// the board exactly where they left it. The first shuffle is seeded from the
// page's own content, so the server render and the browser agree on the very
// first board (no hydration mismatch); every reshuffle after that is fresh.

import { useCallback, useEffect, useRef, useState } from "react";

import {
  cellForDir,
  emptyId,
  emptyPos,
  isSolved,
  mulberry,
  rewindPath,
  shuffle,
  slideFrom,
  solvedBoard,
  type Board,
  type Dir,
} from "./slidingEngine";

export interface GameState {
  n: number;
  board: Board;
  /** Gap position before every single-cell move, oldest first (shuffle included). */
  history: number[];
  moves: number;
  startedAt: number | null;
  endedAt: number | null;
  peeks: number;
  /** True once "finish it for me" or the preview skip was used. */
  assisted: boolean;
  /** Bumped on every reshuffle so the board can re-key its animations. */
  round: number;
}

export function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function fresh(n: number, moves: number, seed: number, round: number): GameState {
  const { board, path } = shuffle(n, moves, mulberry(seed));
  return {
    n,
    board,
    history: [emptyId(n), ...path.slice(0, -1)],
    moves: 0,
    startedAt: null,
    endedAt: null,
    peeks: 0,
    assisted: false,
    round,
  };
}

export type PuzzleGame = ReturnType<typeof usePuzzleGame>;

export function usePuzzleGame(n: number, shuffleMoves: number, seedText: string) {
  const [s, setS] = useState<GameState>(() => fresh(n, shuffleMoves, seedFrom(seedText), 0));
  const [autoSolving, setAutoSolving] = useState(false);
  const autoTimer = useRef<number | null>(null);

  // A different size (the sender changed difficulty in the form) is a new game.
  const [prevKey, setPrevKey] = useState(`${n}:${seedText}`);
  if (prevKey !== `${n}:${seedText}`) {
    setPrevKey(`${n}:${seedText}`);
    setS(fresh(n, shuffleMoves, seedFrom(seedText), 0));
  }

  const solved = isSolved(s.board);

  // The ref is the source of truth between renders, so two taps faster than a
  // re-render still each see the board the previous one left behind.
  const live = useRef(s);
  useEffect(() => {
    live.current = s;
  }, [s]);
  const commit = useCallback((next: GameState) => {
    live.current = next;
    setS(next);
  }, []);

  /** Tap on the tile at `pos`: slides it (and any tiles between it and the gap). */
  const tap = useCallback(
    (pos: number): boolean => {
      const cur = live.current;
      if (isSolved(cur.board)) return false;
      const r = slideFrom(cur.board, cur.n, pos);
      if (!r) return false;
      let gap = emptyPos(cur.board, cur.n);
      const history = cur.history.slice();
      for (const cell of r.path) {
        history.push(gap);
        gap = cell;
      }
      const now = Date.now();
      commit({
        ...cur,
        board: r.board,
        history,
        moves: cur.moves + 1,
        startedAt: cur.startedAt ?? now,
        endedAt: isSolved(r.board) ? now : null,
      });
      return true;
    },
    [commit],
  );

  const moveDir = useCallback(
    (dir: Dir): boolean => {
      const cur = live.current;
      const cell = cellForDir(cur.board, cur.n, dir);
      return cell >= 0 ? tap(cell) : false;
    },
    [tap],
  );

  const stopAuto = () => {
    if (autoTimer.current !== null) window.clearInterval(autoTimer.current);
    autoTimer.current = null;
  };

  const reshuffle = useCallback(() => {
    stopAuto();
    setAutoSolving(false);
    const cur = live.current;
    commit(fresh(cur.n, shuffleMoves, (Math.random() * 2 ** 31) | 0, cur.round + 1));
  }, [shuffleMoves, commit]);

  const peek = useCallback(() => commit({ ...live.current, peeks: live.current.peeks + 1 }), [commit]);

  /** Rewinds every move ever made — a little replay that ends solved. */
  const autoSolve = useCallback(() => {
    if (autoTimer.current !== null) return;
    const start = live.current;
    const path = rewindPath(start.history, emptyPos(start.board, start.n));
    if (!path.length) return;
    const stepMs = Math.max(28, Math.min(90, Math.round(4200 / path.length)));
    let i = 0;
    setAutoSolving(true);
    commit({ ...start, assisted: true, startedAt: start.startedAt ?? Date.now() });
    autoTimer.current = window.setInterval(() => {
      const cur = live.current;
      const r = slideFrom(cur.board, cur.n, path[i++]);
      if (r) {
        commit({ ...cur, board: r.board, history: [...cur.history, emptyPos(cur.board, cur.n)], endedAt: isSolved(r.board) ? Date.now() : null });
      }
      if (i >= path.length || !r) {
        stopAuto();
        setAutoSolving(false);
      }
    }, stepMs);
  }, [commit]);

  /** Preview only: jump straight to the solved picture. */
  const skip = useCallback(() => {
    stopAuto();
    setAutoSolving(false);
    const cur = live.current;
    commit({ ...cur, board: solvedBoard(cur.n), assisted: true, startedAt: cur.startedAt ?? Date.now(), endedAt: Date.now() });
  }, [commit]);

  useEffect(() => () => stopAuto(), []);

  // Dev-only hook for the automated play-through (never in a production build).
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as { __lastPiece?: unknown }).__lastPiece = { n: s.n, board: s.board, history: s.history, moves: s.moves, solved };
  }, [s, solved]);

  return { ...s, solved, autoSolving, tap, moveDir, reshuffle, peek, autoSolve, skip };
}
