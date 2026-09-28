// ─── Sliding-tile engine (pure, no React) ────────────────────────────────────
//
// The board is an array of N² cells. `board[pos]` is the id of the tile sitting
// at cell `pos`; tile id === its home cell. The EMPTY tile is id N²−1, i.e. the
// bottom-right piece — the "last piece" the sender keeps back. The puzzle is
// solved when every tile sits on its own id.
//
// Shuffling is a random walk of VALID moves from the solved state, so every
// board this module produces is solvable by construction. The walk never
// immediately undoes itself and is re-run if it happens to land back on
// solved.

export type Board = number[];
export type Dir = "up" | "down" | "left" | "right";

export const emptyId = (n: number): number => n * n - 1;

export const solvedBoard = (n: number): Board => Array.from({ length: n * n }, (_, i) => i);

export const isSolved = (b: Board): boolean => b.every((v, i) => v === i);

export const emptyPos = (b: Board, n: number): number => b.indexOf(emptyId(n));

export const rc = (pos: number, n: number): [number, number] => [Math.floor(pos / n), pos % n];

/** Cells orthogonally next to `pos`. */
export function neighbours(pos: number, n: number): number[] {
  const [r, c] = rc(pos, n);
  const out: number[] = [];
  if (r > 0) out.push(pos - n);
  if (r < n - 1) out.push(pos + n);
  if (c > 0) out.push(pos - 1);
  if (c < n - 1) out.push(pos + 1);
  return out;
}

export function canMove(b: Board, n: number, pos: number): boolean {
  return neighbours(pos, n).includes(emptyPos(b, n));
}

/** Swap the tile at `pos` with the empty slot. Caller checks `canMove`. */
function swap(b: Board, n: number, pos: number): Board {
  const e = emptyPos(b, n);
  const next = b.slice();
  next[e] = b[pos];
  next[pos] = b[e];
  return next;
}

/**
 * Tapping a tile in the same row or column as the gap slides the whole line
 * towards it. Returns the new board plus the empty-slot path (each cell the gap
 * visited), or null if the tile is not lined up with the gap.
 */
export function slideFrom(b: Board, n: number, pos: number): { board: Board; path: number[] } | null {
  const e = emptyPos(b, n);
  if (pos === e) return null;
  const [pr, pc] = rc(pos, n);
  const [er, ec] = rc(e, n);
  if (pr !== er && pc !== ec) return null;
  const step = pr === er ? (pc > ec ? 1 : -1) : pr > er ? n : -n;
  let board = b;
  const path: number[] = [];
  for (let cur = e + step; ; cur += step) {
    board = swap(board, n, cur);
    path.push(cur);
    if (cur === pos) break;
  }
  return { board, path };
}

/**
 * Arrow key / swipe: the tile on the opposite side of the gap moves in `dir`.
 * ArrowLeft moves the tile to the RIGHT of the gap leftwards, like every
 * sliding puzzle ever made. Returns the moved-from cell, or -1.
 */
export function cellForDir(b: Board, n: number, dir: Dir): number {
  const e = emptyPos(b, n);
  const [r, c] = rc(e, n);
  if (dir === "left") return c < n - 1 ? e + 1 : -1;
  if (dir === "right") return c > 0 ? e - 1 : -1;
  if (dir === "up") return r < n - 1 ? e + n : -1;
  return r > 0 ? e - n : -1;
}

/** Tiny seeded PRNG (mulberry32) so a shuffle can be reproduced in tests. */
export function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Manhattan distance of every tile from home — how scrambled a board looks. */
export function scramble(b: Board, n: number): number {
  let d = 0;
  b.forEach((v, i) => {
    if (v === emptyId(n)) return;
    const [r1, c1] = rc(v, n);
    const [r2, c2] = rc(i, n);
    d += Math.abs(r1 - r2) + Math.abs(c1 - c2);
  });
  return d;
}

/**
 * A random walk of `moves` valid moves from solved. Returns the board and the
 * gap's path (the cells it moved into), which is exactly the sequence of cells
 * to tap — in reverse — to solve it again.
 */
export function shuffle(n: number, moves: number, rand: () => number = Math.random): { board: Board; path: number[] } {
  for (let attempt = 0; attempt < 20; attempt++) {
    let b = solvedBoard(n);
    let prev = -1;
    const path: number[] = [];
    for (let i = 0; i < moves; i++) {
      const e = emptyPos(b, n);
      const opts = neighbours(e, n).filter((p) => p !== prev);
      const pick = opts[Math.floor(rand() * opts.length) % opts.length];
      prev = e;
      b = swap(b, n, pick);
      path.push(pick);
    }
    // Walk the gap home to the bottom-right, so the board starts with the
    // "last piece" slot empty exactly where the missing tile belongs.
    for (let e = emptyPos(b, n); e % n < n - 1; e = emptyPos(b, n)) { b = swap(b, n, e + 1); path.push(e + 1); }
    for (let e = emptyPos(b, n); e < n * (n - 1); e = emptyPos(b, n)) { b = swap(b, n, e + n); path.push(e + n); }
    if (!isSolved(b) && scramble(b, n) >= n * 2) return { board: b, path };
  }
  // Practically unreachable; a hand-made fallback that is always solvable.
  const b = solvedBoard(n);
  const e = emptyPos(b, n);
  const moved = swap(b, n, e - 1);
  return { board: moved, path: [e - 1] };
}

/**
 * A path of gap positions that brings the board back to solved: the reversed
 * history of every move made, with back-and-forth pairs cancelled.
 * `history` is the gap position BEFORE each move, oldest first; `current` is
 * where the gap is now.
 */
export function rewindPath(history: number[], current: number): number[] {
  const at = [current];
  for (let i = history.length - 1; i >= 0; i--) {
    const cell = history[i];
    if (at.length >= 2 && at[at.length - 2] === cell) at.pop();
    else at.push(cell);
  }
  return at.slice(1);
}
