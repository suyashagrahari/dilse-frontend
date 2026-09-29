// ─── Catch — the little bits of memory a real arcade keeps ───────────────────
//
// Best score, a scoreboard of recent runs and a daily streak, all per page and
// all in this browser only. Every accessor is wrapped: private windows and
// blocked storage just get a fresh game every time.

export interface ScoreRow {
  score: number;
  at: number;
}

export interface Streak {
  days: number;
  last: string;
}

const k = (id: string, what: string) => `catch:${id}:${what}`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, v: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* storage blocked — the game still works */
  }
}

export const readBest = (id: string): number => read<number>(k(id, "best"), 0);

export const readBoard = (id: string): ScoreRow[] => read<ScoreRow[]>(k(id, "board"), []);

/** Records a run. Returns whether it was a new best and the updated board. */
export function recordRun(id: string, score: number): { newBest: boolean; best: number; board: ScoreRow[] } {
  const best = readBest(id);
  const newBest = score > best;
  if (newBest) write(k(id, "best"), score);
  const board = [...readBoard(id), { score, at: Date.now() }].sort((a, b) => b.score - a.score).slice(0, 5);
  write(k(id, "board"), board);
  return { newBest, best: Math.max(best, score), board };
}

const today = () => new Date().toISOString().slice(0, 10);

export const readStreak = (id: string): Streak => read<Streak>(k(id, "streak"), { days: 0, last: "" });

/** Called when a run starts: yesterday → +1, today → same, older → 1. */
export function touchStreak(id: string): Streak {
  const s = readStreak(id);
  const t = today();
  if (s.last === t) return s;
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const next = { days: s.last === y ? s.days + 1 : 1, last: t };
  write(k(id, "streak"), next);
  return next;
}

export const readSeenTutorial = (): boolean => read<boolean>("catch:tutorial", false);
export const markSeenTutorial = () => write("catch:tutorial", true);
