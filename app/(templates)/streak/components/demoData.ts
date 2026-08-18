// ─── Demo data ───────────────────────────────────────────────────────────────
//
// The preview has to look like a service that has been running for months,
// because the whole proposition is "this is what you'll have in three months".
// A blank grid sells nothing.
//
// Everything here is SEEDED (`@/lib/seededRandom`) rather than random: the demo
// history must be byte-identical between the server render, the client
// hydration, and the exported PNG. `Math.random()` here would make the canopy
// and the poem change on every keystroke in the EditSheet.

import { seededInt, seededPick } from "@/lib/seededRandom";
import {
  addDays,
  dayKeyInZone,
  getServerTime,
  startOfDayUtc,
  type CheckInDay,
  type CheckInEntry,
  type MicroLetter,
  type Milestone,
  type Person,
  type Side,
  type StreakData,
} from "./types";

/**
 * The demo pair's zone is FIXED rather than read from the device.
 *
 * `Intl...resolvedOptions().timeZone` is UTC on the server and (say) Asia/
 * Kolkata in the browser, which would make the SSR'd day keys disagree with the
 * hydrated ones and flash a different grid. The EditSheet still defaults the
 * real picker to the device zone — this constant only backs the demo.
 */
export const DEMO_TIMEZONE = "Asia/Kolkata";

/** Milestone rungs. The contract stores them as data; these are the defaults. */
export const MILESTONE_DAYS = [30, 100, 365] as const;

/** A pair is identified by its two person ids. Used only for `checkInKey`. */
export const pairIdOf = (data: StreakData): string =>
  `${data.pair.a.id}~${data.pair.b.id}`;

/** The other side. */
export const other = (side: Side): Side => (side === "a" ? "b" : "a");

// ─── The vocabulary the demo writes with ─────────────────────────────────────
// Ordinary, unremarkable words on purpose. The poem only works if the days are
// small — "transcendent" every day is a diary nobody believes.

const WORDS_A = [
  "quiet", "rain", "coffee", "tired", "warm", "slow", "orange", "steady",
  "hungry", "sunday", "traffic", "soft", "here", "chai", "late", "easy",
  "bright", "long", "home", "clean", "still", "loud", "sleepy", "full",
];

const WORDS_B = [
  "sun", "busy", "green", "calm", "cold", "sweet", "far", "close",
  "monday", "music", "grey", "light", "tea", "early", "kind", "heavy",
  "blue", "windy", "quick", "restless", "gentle", "hot", "clear", "small",
];

/**
 * One partner's contribution to one demo day.
 *
 * `a` skews early morning and `b` skews mid-morning, so `deriveStats` has a
 * real "who gets there first" to report instead of a coin flip.
 */
function demoEntry(date: string, side: Side, timezone: string, note?: string): CheckInEntry {
  const seed = `${date}:${side}`;
  const word = seededPick(seed, "word", side === "a" ? WORDS_A : WORDS_B);
  const baseMin = side === "a" ? 6 * 60 + 40 : 9 * 60 + 10;
  const mins = baseMin + seededInt(seed, "mins", 0, 330);
  const at = new Date(startOfDayUtc(date, timezone) + mins * 60_000).toISOString();
  return note ? { word, at, note } : { word, at };
}

const DEMO_MILESTONES: Milestone[] = [
  {
    atDay: 30,
    letter:
      "Thirty days.\n\nI didn't think you'd keep doing this, and I say that with love. You are not a person who keeps things up.\n\nBut here we are, thirty little lights, and most of them are on days where nothing happened at all. That's the part I like. Not the big days. The tuesdays.\n\nI'm glad you're on the other end of this.",
  },
  {
    atDay: 100,
    letter:
      "A hundred.\n\nI wrote this one before we started, so I have no idea what the last hundred days held. I hope some of them were dull. Dull means nothing went wrong.\n\nScroll back through the words sometime. I think they'll read like a person, not like a list.\n\nStill here.",
  },
  {
    atDay: 365,
    letter:
      "A year of tapping a small button for me.\n\nWhatever else happened, you did this. Every day, or near enough, and on the days you didn't, you came back.\n\nThat's the whole thing, really. Coming back.\n\nHere's to another one, if you'd like it.",
  },
];

/**
 * One line per completed week. Deliberately shorter than the number of weeks
 * the demo has run, so the "sender wrote fewer lines than weeks elapsed → show
 * nothing" path is exercised in the preview rather than only in a test.
 */
const DEMO_MICRO: MicroLetter[] = [
  { week: 1, line: "one week. you're still here. noted." },
  { week: 2, line: "you write 'tired' a lot. i've noticed. eat something." },
  { week: 3, line: "three weeks of small words and i've read every one." },
  { week: 4, line: "a month of mornings. mine start when yours shows up." },
  { week: 5, line: "i keep the grid open in a tab. that's probably weird." },
  { week: 6, line: "you were first four days running. showing off." },
  { week: 7, line: "seven weeks. nothing to report. that's the good version." },
  { week: 8, line: "whatever today was, it's counted now. go to sleep." },
];

export interface DemoOptions {
  /** Override the pair's names/photos — the EditSheet feeds edits through here. */
  pair?: { a: Person; b: Person };
  timezone?: string;
  milestones?: Milestone[];
  microLetters?: MicroLetter[];
  /** How many days of history to fabricate. */
  historyDays?: number;
}

/**
 * A pair 90 days in, where the partner has already checked in TODAY and the
 * viewer has not.
 *
 * That exact arrangement is chosen so a first-time visitor can, in one gesture,
 * see all three of the things this template is actually for: the sealed note
 * opening, the two rings merging, and the number stepping up.
 */
export function makeDemoData(opts: DemoOptions = {}): StreakData {
  const timezone = opts.timezone ?? DEMO_TIMEZONE;
  const historyDays = opts.historyDays ?? 90;
  const today = dayKeyInZone(getServerTime(), timezone);
  const startedOn = addDays(today, -(historyDays - 1));

  const pair = opts.pair ?? {
    a: { id: "p-a", name: "Ananya", photoUrl: "" },
    b: { id: "p-b", name: "Rohan", photoUrl: "" },
  };

  const checkIns: CheckInDay[] = [];
  for (let i = 0; i < historyDays; i++) {
    const date = addDays(startedOn, i);

    // Today: only the partner. The viewer's own square is what they're here for.
    if (i === historyDays - 1) {
      checkIns.push({
        date,
        b: demoEntry(date, "b", timezone, "the good kind of tired. tell you tonight"),
      });
      continue;
    }

    // Two gaps in the first week, so `record` is a real maximum over runs
    // rather than trivially equal to the whole span.
    if (i === 2) continue;
    if (i === 4) { checkIns.push({ date, a: demoEntry(date, "a", timezone) }); continue; }

    // One day where b spent a cover for a. Keeps the run alive; renders with
    // the ring mark in the archive.
    if (i === 40) { checkIns.push({ date, b: demoEntry(date, "b", timezone), covered: "a" }); continue; }

    const note =
      i === historyDays - 9
        ? "i reread the poem on the bus. row 12 got me"
        : undefined;
    checkIns.push({
      date,
      a: demoEntry(date, "a", timezone),
      b: demoEntry(date, "b", timezone, note),
    });
  }

  return {
    pair,
    startedOn,
    timezone,
    checkIns,
    covers: { a: 2, b: 2 },
    milestones: opts.milestones ?? DEMO_MILESTONES,
    microLetters: opts.microLetters ?? DEMO_MICRO,
  };
}

/** Blank milestone letters, in rung order — what a fresh EditSheet opens on. */
export const emptyMilestones = (): Milestone[] =>
  MILESTONE_DAYS.map((atDay) => ({ atDay, letter: "" }));

/** The device's IANA zone, or a sane default. Used ONLY to seed the picker. */
export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEMO_TIMEZONE;
  } catch {
    return DEMO_TIMEZONE;
  }
}
