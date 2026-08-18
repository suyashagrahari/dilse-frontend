// ─── Streak — the frozen contract ────────────────────────────────────────────
//
// LEAD-OWNED AND FROZEN. Every other file in this template imports from here
// and adds nothing to it. If you think you need a new shared type or helper,
// that is a signal the boundary is wrong — say so rather than editing this file.
//
// This template is a SERVICE, not a page. It is opened every day, potentially
// for years. Two properties in here are load-bearing and are the reason this
// file exists at all:
//
//   1. THE NUMBER NEVER GOES TO ZERO. Not on a missed day, not on a missed
//      month, not on a reset, not on an error path. `deriveStreak` is the only
//      function permitted to produce a count, and it is written so that zero is
//      unreachable once a single day has been completed. See NO_ZERO below.
//
//   2. ONE TIMEZONE PER PAIR. A couple in Bengaluru and Toronto must share a
//      definition of "today" or the streak is nonsense. Every day boundary in
//      this template goes through `dayKeyInZone` with `data.timezone`. There is
//      no code path that reads the device timezone for streak logic.
//
// A third property is enforced by TYPE rather than by discipline: a sealed note
// that the recipient has not yet earned is not merely hidden, it is a
// `SealedNoteLocked` which structurally HAS NO `text` FIELD. It cannot be
// rendered early because there is nothing to render. See SealedNoteView.

// ═══════════════════════════════════════════════════════════════════════════
// Stored shape — exactly what the server round-trips
// ═══════════════════════════════════════════════════════════════════════════

/** Which half of the pair. Stable for the life of the pair. */
export type Side = "a" | "b";

export interface Person {
  id: string;
  name: string;
  photoUrl: string;
}

/** One partner's contribution to one day. */
export interface CheckInEntry {
  /** Max 20 chars for DISPLAY. Stored as entered — see `truncWord`. */
  word: string;
  /** Optional. A failed upload must still leave the check-in valid. */
  photoUrl?: string;
  /** ISO timestamp of the moment they tapped. Used for "who's first". */
  at: string;
  /**
   * The sealed note, max 60 chars. Optional, never prompted for.
   * The SERVER must not send this to the partner until they have checked in.
   */
  note?: string;
}

export interface CheckInDay {
  /** YYYY-MM-DD in the PAIR's timezone. Never the device's. */
  date: string;
  a?: CheckInEntry;
  b?: CheckInEntry;
  /** Set when one partner spent a cover for the other. */
  covered?: Side;
}

export interface Milestone {
  /** Day count at which this unlocks. Measured on the HIGH WATER MARK. */
  atDay: number;
  letter: string;
  /** ISO. Set once, the first time it is opened. Never cleared. */
  openedOn?: string;
}

/** A one-line sender note that unlocks every 7 completed days. */
export interface MicroLetter {
  /** 1 = unlocks at 7 days, 2 = at 14, and so on. */
  week: number;
  line: string;
}

export type StreakStatus = "active" | "repairable" | "dormant";

export interface StreakData {
  pair: { a: Person; b: Person };
  /** YYYY-MM-DD. The first day the pair existed. */
  startedOn: string;
  /** IANA, e.g. "Asia/Kolkata". ONE per pair, set at creation. */
  timezone: string;
  checkIns: CheckInDay[];
  /** Earned, spendable. Capped at MAX_COVERS. */
  covers: { a: number; b: number };
  milestones: Milestone[];
  microLetters: MicroLetter[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Tunables
// ═══════════════════════════════════════════════════════════════════════════

export const TIMING = {
  /** A genuine, deliberate hold. A tap must do nothing. */
  holdMs: 1200,
  /** The rings drifting together. Slow is what makes it feel intimate. */
  mergeDriftMs: 900,
  /** The warm bloom at the overlap holds, then fades. */
  mergeBloomHoldMs: 600,
  mergeBloomFadeMs: 400,
  /** A new light fading in on completion. */
  lightFadeMs: 500,
  /** Re-lighting after dormancy, per light. */
  relightStaggerMs: 20,
  /** The whole day-100 canopy sequence. */
  hundredSequenceMs: 3000,
  /** Wax seal cracking on a milestone envelope. */
  sealCrackMs: 600,
  /** Mock partner poll. TODO(realtime): replace with a socket subscription. */
  pollMs: 2000,
} as const;

/** Hard floor for every interactive target. */
export const TAP_TARGET_PX = 44;
/** The check-in button specifically. It is the only thing you press daily. */
export const CHECKIN_BUTTON_PX = 96;

export const LIMITS = {
  /** Display truncation for the daily word. Storage is unbounded-ish. */
  word: 20,
  /** The sealed note. Short keeps it a whisper rather than a chore. */
  note: 60,
  name: 80,
  letter: 2000,
  microLine: 200,
} as const;

/** Each partner earns one cover per this many completed days. */
export const COVER_EARN_EVERY = 30;
/** Never hold more than this. Covers are a kindness, not a currency. */
export const MAX_COVERS = 3;
/** A missed day is repairable for this long before the streak goes dormant. */
export const REPAIR_WINDOW_HOURS = 48;
/** Micro-letters unlock on this cadence. */
export const MICRO_LETTER_EVERY = 7;

// ═══════════════════════════════════════════════════════════════════════════
// Palette — calm, warm, low-contrast
// ═══════════════════════════════════════════════════════════════════════════
//
// This is opened every day. It must never feel loud. Deliberately the opposite
// of Rewind: no saturation, no gradients on the main surface, one accent.

export const PALETTE = {
  /** Cream paper. Specified by the brief. */
  paper: "#faf7f0",
  /** A half-tone deeper for cards sitting on the page. */
  paperDeep: "#f3eee2",
  /** Hairlines and rings. */
  edge: "#e4dcc9",
  /** Body ink. 12.6:1 on paper. */
  ink: "#2b2620",
  /** Secondary ink. 5.9:1 on paper — still comfortably readable. */
  inkSoft: "#6b6357",
  /** Ornament only. Never text that must be read. */
  inkFaint: "#a89e8c",
  /** THE accent. One warm amber, used for filled states and lights. */
  accent: "#c9822f",
  /** The accent at wash strength, for filled grid squares. */
  accentWash: "#f6e7d2",
  /** A cover mark. Deliberately not a warning colour. */
  cover: "#7d8c6a",
} as const;

/**
 * A large serif for the number. It should read as considered, not gamified.
 * A display sans here would make it a score.
 */
export const SERIF = "var(--font-tinos), Georgia, 'Times New Roman', serif";
/** Chrome and inputs only. Never the number. */
export const UI = "var(--font-outfit), system-ui, sans-serif";

// ═══════════════════════════════════════════════════════════════════════════
// Time — every day boundary in this template goes through here
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The ONLY clock this template is allowed to consult for streak logic.
 *
 * TODO(server-time): this must become a value handed down from the API — a
 * server timestamp captured at page load plus a monotonic offset. Today it
 * reads the device, which means a user who moves their phone clock forward can
 * see tomorrow early. That is a cosmetic exploit here (there is nothing to win
 * by cheating a streak with your own partner) but it becomes a real one the
 * moment covers or milestones are worth anything.
 */
export function getServerTime(): number {
  return Date.now();
}

/**
 * "2026-08-07" for an instant, in the PAIR's zone.
 *
 * `en-CA` is used because it is the one widely-supported locale whose short
 * date format is already ISO-ordered, which avoids hand-assembling parts.
 * An invalid zone falls back to UTC rather than to the device — falling back to
 * the device would silently give the two partners different days, which is the
 * exact bug this whole module exists to prevent.
 */
export function dayKeyInZone(ms: number, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toISOString().slice(0, 10);
  }
}

/** The UTC instant at which the given pair-local day began. DST-safe. */
export function startOfDayUtc(dayKey: string, timezone: string): number {
  // Guess midnight UTC, then correct by however far that instant's pair-local
  // day-start actually sits from it. Two passes converge through any DST jump,
  // because the second pass re-measures the offset that applies AT the corrected
  // instant rather than the one that applied at the guess.
  let guess = Date.parse(`${dayKey}T00:00:00Z`);
  if (Number.isNaN(guess)) return NaN;
  for (let i = 0; i < 2; i++) {
    const offset = zoneOffsetMs(guess, timezone);
    guess = Date.parse(`${dayKey}T00:00:00Z`) - offset;
  }
  return guess;
}

/** How far ahead of UTC the zone is, at a given instant, in ms. */
function zoneOffsetMs(ms: number, timezone: string): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const p: Record<string, string> = {};
    for (const { type, value } of dtf.formatToParts(new Date(ms))) p[type] = value;
    // `hour: "2-digit"` with hour12:false yields "24" at midnight in some
    // engines; normalise it so Date.UTC does not roll the day forward.
    const hour = p.hour === "24" ? "00" : p.hour;
    const asUtc = Date.UTC(
      Number(p.year),
      Number(p.month) - 1,
      Number(p.day),
      Number(hour),
      Number(p.minute),
      Number(p.second),
    );
    return asUtc - ms;
  } catch {
    return 0;
  }
}

/** "2026-08-07" + 3 → "2026-08-10". Pure calendar arithmetic, zone-free. */
export function addDays(dayKey: string, n: number): string {
  const t = Date.parse(`${dayKey}T00:00:00Z`);
  if (Number.isNaN(t)) return dayKey;
  return new Date(t + n * 86_400_000).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to`. Negative if `to` precedes `from`. */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

/** Today, in the pair's zone. The single source of "what day is it". */
export const todayKey = (data: StreakData): string =>
  dayKeyInZone(getServerTime(), data.timezone);

// ═══════════════════════════════════════════════════════════════════════════
// The derived view — computed, never stored
// ═══════════════════════════════════════════════════════════════════════════

/** A day is COMPLETE when both checked in, or when one was covered for. */
export function isComplete(day: CheckInDay | undefined): boolean {
  if (!day) return false;
  if (day.covered) return Boolean(day.a || day.b);
  return Boolean(day.a && day.b);
}

/** Exactly one partner showed up. Not a failure — just not yet complete. */
export function isHalf(day: CheckInDay | undefined): boolean {
  if (!day || day.covered) return false;
  return Boolean(day.a) !== Boolean(day.b);
}

export interface StreakView {
  status: StreakStatus;
  /**
   * The number on screen. Never zero once anything has been completed.
   * When dormant this is the PAUSED high water mark, shown greyed.
   */
  count: number;
  /** The all-time best. Milestones unlock on THIS, never on `count`. */
  record: number;
  /** Only meaningful while dormant: the fresh run building alongside. */
  restarted: number;
  totalDays: number;
  /** The day that got away, if we are inside the repair window. */
  missedDay?: string;
  // DELIBERATELY ABSENT: how long is left in the repair window.
  //
  // An earlier version carried `repairHoursLeft`. Nothing rendered it, but its
  // existence meant there was a clock, and a clock on a relationship is the
  // exact anxiety this template is built to avoid — the moment it reaches a
  // screen, someone is watching a number run down on whether their partner
  // shows up. The window still exists in `deriveStreak` because it decides
  // when `repairable` becomes `dormant`, and both of those states are gentle.
  // What is gone is any way to display the remaining time, which is the only
  // part that could hurt. Do not add it back.
}

/**
 * THE function. Recomputes everything from the check-in log — never trusts an
 * incremental counter, which is the same discipline the nightly reconciliation
 * job on the server must use.
 *
 * NO_ZERO: `count` is assigned from `record` on the dormant path and from a
 * run length on the active path. A run that reaches the dormant branch is by
 * construction at least 1 long, and `record` is a max over all runs. The only
 * way out of this function with 0 is for the pair to have completed no days at
 * all, which is day one — and day one has its own empty state, not a zero.
 */
export function deriveStreak(data: StreakData, today: string): StreakView {
  const byDate = new Map(data.checkIns.map((d) => [d.date, d]));
  const completed: string[] = [];
  const span = Math.max(0, daysBetween(data.startedOn, today));
  for (let i = 0; i <= span; i++) {
    const key = addDays(data.startedOn, i);
    if (isComplete(byDate.get(key))) completed.push(key);
  }

  const totalDays = completed.length;
  if (totalDays === 0) {
    return { status: "active", count: 0, record: 0, restarted: 0, totalDays: 0 };
  }

  // Split the completed days into consecutive runs.
  const runs: { start: string; end: string; len: number }[] = [];
  let runStart = completed[0];
  let prev = completed[0];
  for (let i = 1; i < completed.length; i++) {
    if (daysBetween(prev, completed[i]) === 1) {
      prev = completed[i];
      continue;
    }
    runs.push({ start: runStart, end: prev, len: daysBetween(runStart, prev) + 1 });
    runStart = completed[i];
    prev = completed[i];
  }
  runs.push({ start: runStart, end: prev, len: daysBetween(runStart, prev) + 1 });

  const record = runs.reduce((m, r) => Math.max(m, r.len), 0);
  const last = runs[runs.length - 1];
  // Today is still in progress — it does not count as missed.
  const gap = daysBetween(last.end, today);

  if (gap <= 1) {
    // Yesterday or today was completed. The streak is running.
    return { status: "active", count: last.len, record, restarted: 0, totalDays };
  }

  const missedDay = addDays(last.end, 1);
  const windowEnds = startOfDayUtc(missedDay, data.timezone) + REPAIR_WINDOW_HOURS * 3_600_000;
  const now = getServerTime();

  if (now < windowEnds) {
    // One full day missed, still inside the window. The count is PRESERVED and
    // shown greyed — it is not lost, and nothing here says it might be.
    return { status: "repairable", count: last.len, record, restarted: 0, totalDays, missedDay };
  }

  // Dormant. PAUSED at the high water mark — never reset. A new count runs
  // alongside it and the record is always on screen.
  return { status: "dormant", count: record, record, restarted: 0, totalDays };
}

// ═══════════════════════════════════════════════════════════════════════════
// The sealed note — enforced structurally, not by discipline
// ═══════════════════════════════════════════════════════════════════════════

/**
 * What the VIEWER is allowed to know about a note waiting for them.
 *
 * The locked variant has no `text` field at all. A component cannot leak it
 * because there is nothing on the object to leak — the check is the type, not a
 * conditional somewhere in a render tree that someone will later refactor.
 *
 * The server enforces the same thing: `/streak-pages/:id/today` omits the
 * partner's `note` from the payload entirely until the caller has checked in.
 * Both halves are required. The client type alone is a suggestion.
 */
export type SealedNoteView =
  | { state: "none" }
  | { state: "locked"; fromName: string }
  | { state: "open"; fromName: string; text: string };

export function noteViewFor(
  day: CheckInDay | undefined,
  me: Side,
  pair: StreakData["pair"],
): SealedNoteView {
  const them: Side = me === "a" ? "b" : "a";
  const theirNote = day?.[them]?.note;
  if (!theirNote) return { state: "none" };
  const fromName = pair[them].name;
  // Earned only by having checked in yourself. Not by time, not by tapping.
  return day?.[me]
    ? { state: "open", fromName, text: theirNote }
    : { state: "locked", fromName };
}

// ═══════════════════════════════════════════════════════════════════════════
// The lights — the hero element
// ═══════════════════════════════════════════════════════════════════════════

export interface Light {
  /** The completed day this light stands for. */
  date: string;
  cx: number;
  cy: number;
  r: number;
  /** 0.85–1.0, stable across renders. */
  opacity: number;
}

export interface LightsLayout {
  lights: Light[];
  width: number;
  height: number;
}

/**
 * One warm light per completed day, laid along a gentle curve that wraps into
 * rows as it fills. Seeded by date so a light never jitters between renders —
 * `Math.random()` here would make the canopy shimmer on every state change,
 * which is exactly the ambient motion this template forbids.
 */
export function layoutLights(dates: string[], width = 340): LightsLayout {
  const n = dates.length;
  if (n === 0) return { lights: [], width, height: 60 };

  // Above ~200 the canopy has to tighten or it overflows the viewport.
  const dense = n > 200;
  const r = dense ? 2.5 : n > 90 ? 3 : 4;
  const spacing = dense ? 9 : n > 90 ? 12 : 16;
  const perRow = Math.max(6, Math.floor((width - 24) / spacing));
  const rowH = dense ? 20 : 26;
  const rows = Math.ceil(n / perRow);

  const lights: Light[] = dates.map((date, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    // Alternate direction so the strand reads as one continuous run rather
    // than as a grid that resets at the left edge each row.
    const dir = row % 2 === 0 ? col : perRow - 1 - col;
    const t = perRow > 1 ? dir / (perRow - 1) : 0.5;
    // A shallow sag, like a strand hung between two points.
    const sag = Math.sin(t * Math.PI) * (dense ? 5 : 7);
    const jx = (seeded(date, "x") - 0.5) * 4;
    const jy = (seeded(date, "y") - 0.5) * 4;
    return {
      date,
      cx: 12 + dir * spacing + jx,
      cy: 16 + row * rowH + sag + jy,
      r,
      opacity: 0.85 + seeded(date, "o") * 0.15,
    };
  });

  return { lights, width, height: 32 + rows * rowH };
}

/** FNV-1a → mulberry32, inlined so the contract has no import cycle. */
function seeded(seed: string, key: string): number {
  let h = 2166136261;
  const s = `${seed}:${key}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let t = (h + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// ═══════════════════════════════════════════════════════════════════════════
// The archive & the poem
// ═══════════════════════════════════════════════════════════════════════════

export type CellState = "both" | "half" | "covered" | "missed";

export interface DayCell {
  date: string;
  state: CellState;
  /** Column index (week) and row index (weekday) for the heatmap. */
  week: number;
  weekday: number;
}

/** One square per day since `startedOn`. Future days are not produced at all. */
export function buildGrid(data: StreakData, today: string): DayCell[] {
  const byDate = new Map(data.checkIns.map((d) => [d.date, d]));
  const span = Math.max(0, daysBetween(data.startedOn, today));
  // Anchor columns to the week containing day one so columns stay stable.
  const firstWeekday = new Date(`${data.startedOn}T00:00:00Z`).getUTCDay();
  const cells: DayCell[] = [];
  for (let i = 0; i <= span; i++) {
    const date = addDays(data.startedOn, i);
    const day = byDate.get(date);
    const offset = firstWeekday + i;
    cells.push({
      date,
      state: day?.covered ? "covered" : isComplete(day) ? "both" : isHalf(day) ? "half" : "missed",
      week: Math.floor(offset / 7),
      weekday: offset % 7,
    });
  }
  return cells;
}

export interface PoemRow {
  date: string;
  /** "" when that partner did not check in. The row is kept, not skipped. */
  a: string;
  b: string;
}

/** Two adjacent columns, chronological, unpunctuated. Read down or across. */
export function buildPoem(data: StreakData): PoemRow[] {
  return [...data.checkIns]
    .filter((d) => d.a?.word || d.b?.word)
    .sort((x, y) => (x.date < y.date ? -1 : 1))
    .map((d) => ({ date: d.date, a: d.a?.word ?? "", b: d.b?.word ?? "" }));
}

export interface DerivedStats {
  longest: number;
  current: number;
  totalDays: number;
  mostUsedWord: string;
  topWords: string[];
  /** Who tends to get there first, and how often. Framed warmly, never scored. */
  firstMoreOften: { name: string; percent: number } | null;
  earliest: { name: string; time: string } | null;
  latest: { name: string; time: string } | null;
}

/** Everything above the grid. Computed on read — none of it is ever stored. */
export function deriveStats(data: StreakData, view: StreakView): DerivedStats {
  const freq = new Map<string, number>();
  let aFirst = 0;
  let bFirst = 0;
  let earliest: { name: string; time: string; mins: number } | null = null;
  let latest: { name: string; time: string; mins: number } | null = null;

  for (const day of data.checkIns) {
    for (const side of ["a", "b"] as Side[]) {
      const entry = day[side];
      if (!entry) continue;
      const w = entry.word.trim().toLowerCase();
      if (w) freq.set(w, (freq.get(w) ?? 0) + 1);

      const at = Date.parse(entry.at);
      if (Number.isNaN(at)) continue;
      const local = dayKeyInZone(at, data.timezone);
      const mins = Math.round((at - startOfDayUtc(local, data.timezone)) / 60_000);
      const name = data.pair[side].name;
      const time = fmtClock(at, data.timezone);
      if (!earliest || mins < earliest.mins) earliest = { name, time, mins };
      if (!latest || mins > latest.mins) latest = { name, time, mins };
    }
    if (day.a && day.b) {
      const ta = Date.parse(day.a.at);
      const tb = Date.parse(day.b.at);
      if (!Number.isNaN(ta) && !Number.isNaN(tb)) {
        if (ta < tb) aFirst++;
        else if (tb < ta) bFirst++;
      }
    }
  }

  const ranked = [...freq.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const races = aFirst + bFirst;
  const leader = aFirst >= bFirst ? "a" : "b";
  const leadCount = Math.max(aFirst, bFirst);

  return {
    longest: view.record,
    current: view.count,
    totalDays: view.totalDays,
    mostUsedWord: ranked[0]?.[0] ?? "",
    topWords: ranked.slice(0, 3).map(([w]) => w),
    firstMoreOften:
      races > 0
        ? { name: data.pair[leader].name, percent: Math.round((leadCount / races) * 100) }
        : null,
    earliest: earliest ? { name: earliest.name, time: earliest.time } : null,
    latest: latest ? { name: latest.name, time: latest.time } : null,
  };
}

/** "7:04 am", in the pair's zone. Lowercase to stay quiet. */
export function fmtClock(ms: number, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .format(new Date(ms))
      .toLowerCase();
  } catch {
    return "";
  }
}

/** "7 August". Display only. */
export function fmtDay(dayKey: string, timezone: string): string {
  const t = Date.parse(`${dayKey}T12:00:00Z`);
  if (Number.isNaN(t)) return dayKey;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      day: "numeric",
      month: "long",
    }).format(new Date(t));
  } catch {
    return dayKey;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Milestones — earned on the high water mark, never revoked
// ═══════════════════════════════════════════════════════════════════════════

export interface UnlockedMilestone extends Milestone {
  /** Always true for anything this function returns. Kept for clarity at use. */
  unlocked: true;
}

/**
 * Someone who reached 100 and then went dormant has still reached 100.
 * `record`, never `count`. There is deliberately no path that removes an
 * already-unlocked milestone from this list.
 */
export function unlockedMilestones(data: StreakData, view: StreakView): UnlockedMilestone[] {
  return data.milestones
    .filter((m) => view.record >= m.atDay)
    .sort((x, y) => x.atDay - y.atDay)
    .map((m) => ({ ...m, unlocked: true }));
}

/** Micro-letters unlock one per 7 completed days, on the record. */
export function unlockedMicroLetters(data: StreakData, view: StreakView): MicroLetter[] {
  const weeks = Math.floor(view.record / MICRO_LETTER_EVERY);
  // If the sender wrote fewer lines than weeks elapsed, show nothing that week.
  // Never generate filler.
  return data.microLetters.filter((m) => m.week >= 1 && m.week <= weeks).sort((x, y) => x.week - y.week);
}

/** Covers earned so far, less those already spent. Capped, never negative. */
export function coversAvailable(data: StreakData, side: Side): number {
  return Math.max(0, Math.min(MAX_COVERS, data.covers[side]));
}

// ═══════════════════════════════════════════════════════════════════════════
// Copy — every user-facing string in this template lives here
// ═══════════════════════════════════════════════════════════════════════════
//
// Centralised so the copy rules can actually be AUDITED rather than trusted.
// The rules, restated because they are the product:
//
//   Never: "don't lose your streak", "you'll break it", "hurry", "last chance",
//   a countdown to midnight, red warning colours, or any loss framing.
//   A partner who missed sees no shaming message, and the partner who didn't
//   miss is never told to chase them.
//
// `assertWarmCopy` below is run by the template's own test and will fail the
// build path if a banned construction is reintroduced.

export const COPY = {
  holdHint: "hold to check in",
  alreadyIn: "already got you today.",
  firstToday: "you're first today.",
  /** Warm, not competitive. No score is kept for this. */
  beatenToIt: (name: string) => `${name} beat you to it. again.`,
  bothIn: (day: number) => `day ${day}. both of you.`,
  wordPrompt: "one word for today",
  notePrompt: "leave them a line",
  noteSealed: (name: string) => `${name} left you something. it opens when you check in.`,
  /** The dormant state. Paused, and openly invited back. */
  dormant: (n: number) => `paused at ${n}. pick it back up whenever.`,
  /** The repairable state. Permissive, with a quiet option — never a warning. */
  repairable: "yesterday got away from you. that's allowed.",
  repairAction: "use a cover",
  coveredBy: (name: string) => `${name} covered for you.`,
  emptyArchive: "one square so far. that's how it starts.",
  welcomeBack: "everything's still here. start whenever you like.",
  poemLink: "read our poem",
  photoFailed: "photo didn't upload — the check-in still counted.",
  /** In-memory only for now; a signal drop must not lose a check-in. */
  queued: "will sync",
} as const;

/**
 * Guards the copy rules mechanically.
 *
 * Returns the offending strings, or an empty array. Called by the template's
 * own verification pass over every value in COPY plus any sender-authored
 * letter, so a warm-copy regression is caught rather than reviewed for.
 */
export function assertWarmCopy(strings: string[]): string[] {
  const banned = [
    /\bdon'?t lose\b/i,
    /\byou'?ll (break|lose)\b/i,
    /\bhurry\b/i,
    /\blast chance\b/i,
    /\bbroke(n)? (your|the) streak\b/i,
    /\bfail(ed|ing)?\b/i,
    /\bstreak (lost|gone|dead)\b/i,
    /\bbefore midnight\b/i,
    /\brunning out\b/i,
    /\bexpire[sd]?\b/i,
    /\bdon'?t let .* down\b/i,
    /\byou missed\b/i,
  ];
  return strings.filter((s) => banned.some((re) => re.test(s)));
}

/** Display truncation. Storage keeps what they typed, emoji included. */
export function truncWord(word: string, max = LIMITS.word): string {
  const chars = [...word.trim()];
  return chars.length <= max ? word.trim() : `${chars.slice(0, max).join("")}…`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Idempotency
// ═══════════════════════════════════════════════════════════════════════════

/**
 * (pairId, date, side). Two taps in the same second must produce one check-in.
 * The client dedupes on this key optimistically; the server treats it as a
 * unique index so a double-submit is a no-op rather than a duplicate row.
 */
export const checkInKey = (pairId: string, date: string, side: Side): string =>
  `${pairId}:${date}:${side}`;
