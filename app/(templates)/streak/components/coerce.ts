// ─── Wire coercion ───────────────────────────────────────────────────────────
//
// The server payload is UNTRUSTED INPUT. Everything that reaches a render goes
// through here first, and this file's only job is that nothing malformed can
// reach a component: every array is capped, every string is clamped, every date
// is shape-checked, and a record too thin to be useful is repaired rather than
// rejected. A page written by an older schema must still open.
//
// Deliberately NOT in `types.ts` — that file is the frozen contract.

import { clampNum, list, obj, str, strOr, type Raw } from "@/lib/wire";
import {
  addDays,
  dayKeyInZone,
  getServerTime,
  LIMITS,
  MAX_COVERS,
  type CheckInDay,
  type CheckInEntry,
  type MicroLetter,
  type Milestone,
  type Person,
  type Side,
  type StreakData,
} from "./types";

/** Roughly five and a half years of days. Past this the grid is not a grid. */
const MAX_CHECKINS = 2000;
/** 30 / 100 / 365 plus room for rungs a future version might add. */
const MAX_MILESTONES = 12;
/** Ten years of weeks. */
const MAX_MICRO = 520;
/**
 * `LIMITS.word` is documented in the contract as a DISPLAY truncation — storage
 * keeps what the user typed, emoji and all, and `truncWord` shortens it at the
 * point of render. So the wire cap here is only a sanity bound against a
 * pathological payload, not the display limit.
 */
const MAX_WORD_STORED = LIMITS.word * 10;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const clamp = (v: unknown, max: number, fallback = ""): string =>
  strOr(v, fallback).slice(0, max);

const personFrom = (v: unknown, id: string, fallbackName: string): Person => {
  const o = obj(v);
  return {
    id: str(o.id, id).slice(0, 64),
    name: str(o.name, fallbackName).slice(0, LIMITS.name),
    photoUrl: clamp(o.photoUrl, 4_000_000),
  };
};

function entryFrom(v: unknown): CheckInEntry | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const o = obj(v);
  // `at` is the only load-bearing field: "who was first", the earliest/latest
  // stats and the note ordering all read it. An entry without one is noise.
  if (typeof o.at !== "string" || Number.isNaN(Date.parse(o.at))) return undefined;

  const note = clamp(o.note, LIMITS.note);
  const photoUrl = clamp(o.photoUrl, 4_000_000);
  return {
    word: clamp(o.word, MAX_WORD_STORED),
    at: o.at,
    ...(photoUrl ? { photoUrl } : {}),
    ...(note.trim() ? { note } : {}),
  };
}

/** The device zone, only ever used as a last-resort default. */
function safeZone(v: unknown): string {
  const raw = strOr(v, "").trim();
  if (raw) {
    try {
      // A zone Intl cannot resolve would send every day boundary to UTC
      // silently. Better to find out here.
      new Intl.DateTimeFormat("en-CA", { timeZone: raw }).format(new Date());
      return raw;
    } catch {
      /* fall through */
    }
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Mongo → `StreakData`. Never throws, never returns a shape a component has to
 * defend against.
 *
 * Accepts the record either flattened or nested under `pageData`, because both
 * shapes exist in the wild depending on when the page was written.
 */
export function dbToStreakData(raw: Record<string, unknown> | null | undefined): StreakData {
  const root = obj(raw);
  const nested = obj(root.pageData);
  // Prefer the nested block when it carries anything; fall back to the root.
  const p: Raw = Object.keys(nested).length > 0 ? nested : root;
  const pairRaw = obj(p.pair);

  const timezone = safeZone(p.timezone);
  const today = dayKeyInZone(getServerTime(), timezone);

  const a = personFrom(pairRaw.a, "p-a", str(root.senderName, "You"));
  const b = personFrom(pairRaw.b, "p-b", str(root.recipientName, "Them"));

  const checkIns = list<CheckInDay>(
    p.checkIns,
    (item: Raw) => {
      const date = str(item.date, "");
      if (!DATE_RE.test(date)) return null;
      const ea = entryFrom(item.a);
      const eb = entryFrom(item.b);
      if (!ea && !eb) return null;
      const covered: Side | undefined =
        item.covered === "a" || item.covered === "b" ? item.covered : undefined;
      return {
        date,
        ...(ea ? { a: ea } : {}),
        ...(eb ? { b: eb } : {}),
        ...(covered ? { covered } : {}),
      };
    },
    [],
  );

  // De-duplicate by date (a merge conflict server-side could produce two rows
  // for one day), keep the richest of each, sort, and cap.
  const byDate = new Map<string, CheckInDay>();
  for (const d of checkIns) {
    const prev = byDate.get(d.date);
    byDate.set(d.date, prev ? { ...prev, ...d } : d);
  }
  const days = [...byDate.values()]
    .sort((x, y) => (x.date < y.date ? -1 : 1))
    .slice(-MAX_CHECKINS);

  const startedRaw = str(p.startedOn, "");
  // A start date that is missing, malformed, or later than the first recorded
  // check-in would make `deriveStreak` iterate a negative span and report zero
  // completed days on a pair that plainly has some. Repair it to day one.
  const earliest = days[0]?.date;
  let startedOn = DATE_RE.test(startedRaw) ? startedRaw : (earliest ?? today);
  if (earliest && earliest < startedOn) startedOn = earliest;
  if (startedOn > today) startedOn = today;
  // Guard against a start date so old the grid would be millions of cells.
  if (days.length === 0 && startedOn < addDays(today, -MAX_CHECKINS)) {
    startedOn = addDays(today, -MAX_CHECKINS);
  }

  const milestones = list<Milestone>(
    p.milestones,
    (item: Raw) => {
      const atDay = Math.round(clampNum(item.atDay, 0, 0, 100_000));
      if (atDay <= 0) return null;
      const letter = clamp(item.letter, LIMITS.letter);
      const openedOn = strOr(item.openedOn, "");
      return {
        atDay,
        letter,
        // Kept even when blank at this layer so `openedOn` survives a round
        // trip; the render drops letters with no text.
        ...(openedOn && !Number.isNaN(Date.parse(openedOn)) ? { openedOn } : {}),
      };
    },
    [],
  )
    .sort((x, y) => x.atDay - y.atDay)
    .slice(0, MAX_MILESTONES);

  const microLetters = list<MicroLetter>(
    p.microLetters,
    (item: Raw) => {
      const week = Math.round(clampNum(item.week, 0, 0, MAX_MICRO));
      const line = clamp(item.line, LIMITS.microLine);
      if (week < 1 || !line.trim()) return null;
      return { week, line };
    },
    [],
  )
    .sort((x, y) => x.week - y.week)
    .slice(0, MAX_MICRO);

  const coversRaw = obj(p.covers);

  return {
    pair: { a, b },
    startedOn,
    timezone,
    checkIns: days,
    covers: {
      a: Math.round(clampNum(coversRaw.a, 0, 0, MAX_COVERS)),
      b: Math.round(clampNum(coversRaw.b, 0, 0, MAX_COVERS)),
    },
    milestones,
    microLetters,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// The outbound direction
// ═══════════════════════════════════════════════════════════════════════════

export interface StreakBody extends Record<string, unknown> {
  senderName: string;
  recipientName: string;
  pageData: {
    pair: StreakData["pair"];
    startedOn: string;
    timezone: string;
    checkIns: CheckInDay[];
    covers: StreakData["covers"];
    milestones: Milestone[];
    microLetters: MicroLetter[];
  };
  password: string;
}

/**
 * `StreakData` → the API body.
 *
 * Blank letters are dropped rather than sent: an envelope that opens onto an
 * empty page is worse than no envelope, and the "never generate filler" rule
 * for micro-letters is the same rule.
 */
export function streakDataToBody(data: StreakData, password: string): StreakBody {
  return {
    senderName: data.pair.a.name,
    recipientName: data.pair.b.name,
    pageData: {
      pair: data.pair,
      startedOn: data.startedOn,
      timezone: data.timezone,
      checkIns: data.checkIns,
      covers: data.covers,
      milestones: data.milestones.filter((m) => m.letter.trim().length > 0),
      microLetters: data.microLetters.filter((m) => m.line.trim().length > 0),
    },
    password,
  };
}
