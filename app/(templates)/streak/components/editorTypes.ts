// ─── The editor's own shapes ─────────────────────────────────────────────────
//
// The FORM is not the DATA. The sender authors identity, the skin (usernames,
// avatars, memories, saved chats) and the letters; the check-in log is written
// by the two of them afterwards and is only ever round-tripped. `formToData`
// is the single place the conversion happens.
//
// One deliberate exception: `streakDays`. A couple who has been snapping for
// eighty days should not open their gift on "day 0", so the sender may say how
// long they've already been going and `formToData` lays down that many
// completed days before today. Those seeded days carry no words — the diary
// only fills with what the two of them actually write from here.

import {
  LIMITS as CONTRACT_LIMITS,
  addDays,
  dayKeyInZone,
  deriveStreak,
  getServerTime,
  type CheckInDay,
  type MicroLetter,
  type Milestone,
} from "./types";
import { MILESTONE_DAYS, deviceTimezone } from "./demoData";
import { DEMO_SKIN, SKIN_LIMITS, type StreakPageData } from "./skin";
import type { LovePhoto } from "../../_love/types";

export const LIMITS = CONTRACT_LIMITS;

export type EditMode = null | "manual" | "preview";

export interface StreakForm {
  nameA: string;
  nameB: string;
  handleA: string;
  handleB: string;
  avatarA: string;
  avatarB: string;
  zodiacA: string;
  zodiacB: string;
  /** Days already going. 0 = start fresh today. */
  streakDays: number;
  /** YYYY-MM-DD — "friends since". */
  startedOn: string;
  timezone: string;
  mapPlace: string;
  chats: string[];
  photos: LovePhoto[];
  letter: string;
  lockQuestion: string;
  lockAnswer: string;
  letters: { atDay: number; letter: string }[];
  /** Index 0 is week 1. A blank entry is a week with nothing to say. */
  microLines: string[];
  /** Carried through an edit so a sender's old photo avatar isn't dropped. */
  photoA: string;
  photoB: string;
}

export const MILESTONE_LABELS: Record<number, string> = {
  30: "opens at 🔥 30",
  100: "opens at 🔥 100",
  365: "opens at 🔥 365",
};

export const MAX_STREAK_SEED = 999;

const DEMO_LETTERS: Record<number, string> = {
  30: "thirty days of snapping you. i genuinely thought i'd get bored by day 4 but here we are, and i still get a tiny rush every time your name pops up. keep sending me your ugly ceiling pics. they're my favourite.",
  100: "a hundred days!! 💯 i wrote this before we even started so i have no idea what these hundred days held. i hope most of them were boring. boring means nothing went wrong and you were just… there. which is all i wanted.",
  365: "a whole year of choosing to send me something every single day. whatever else happened this year, you did that. here's to another one, if you'll have me 🎂",
};

const DEMO_MICRO = [
  "one week and i already check for your snap first thing 🙈",
  "you send 'sleepy' way too much. drink water. and snap me.",
  "three weeks of tiny words. i've read every single one.",
  "a month of mornings that start with your name 💛",
];

/** What the sheet opens on: the demo's words, blank names, sample photos to replace. */
export function emptyForm(): StreakForm {
  const timezone = deviceTimezone();
  const today = dayKeyInZone(getServerTime(), timezone);
  return {
    nameA: "",
    nameB: "",
    handleA: "",
    handleB: "",
    avatarA: DEMO_SKIN.avatarA,
    avatarB: DEMO_SKIN.avatarB,
    zodiacA: "",
    zodiacB: "",
    streakDays: 84,
    startedOn: addDays(today, -300),
    timezone,
    mapPlace: DEMO_SKIN.mapPlace,
    chats: [...DEMO_SKIN.chats],
    photos: DEMO_SKIN.photos.map((p) => ({ ...p })),
    letter: "",
    lockQuestion: "",
    lockAnswer: "",
    letters: MILESTONE_DAYS.map((atDay) => ({ atDay, letter: DEMO_LETTERS[atDay] ?? "" })),
    microLines: [...DEMO_MICRO],
    photoA: "",
    photoB: "",
  };
}

/** Pull a form back out of stored data, for `?edit=<id>` and draft restores. */
export function dataToForm(data: StreakPageData): StreakForm {
  const byDay = new Map(data.milestones.map((m) => [m.atDay, m.letter]));
  const maxWeek = data.microLetters.reduce((m, x) => Math.max(m, x.week), 0);
  const lines: string[] = [];
  for (let w = 1; w <= Math.max(4, maxWeek); w++) {
    lines.push(data.microLetters.find((m) => m.week === w)?.line ?? "");
  }
  const today = dayKeyInZone(getServerTime(), data.timezone);
  const view = deriveStreak(data, today);
  return {
    nameA: data.pair.a.name,
    nameB: data.pair.b.name,
    handleA: data.handleA,
    handleB: data.handleB,
    avatarA: data.avatarA,
    avatarB: data.avatarB,
    zodiacA: data.zodiacA,
    zodiacB: data.zodiacB,
    streakDays: view.count,
    startedOn: data.startedOn,
    timezone: data.timezone,
    mapPlace: data.mapPlace,
    chats: [...data.chats],
    photos: data.photos.map((p) => ({ ...p })),
    letter: data.letter,
    lockQuestion: data.lockQuestion,
    lockAnswer: data.lockAnswer,
    letters: MILESTONE_DAYS.map((atDay) => ({ atDay, letter: byDay.get(atDay) ?? "" })),
    microLines: lines,
    photoA: data.pair.a.photoUrl,
    photoB: data.pair.b.photoUrl,
  };
}

export interface FormProblem {
  field: keyof StreakForm;
  title: string;
  message: string;
}

/** Only both names are genuinely required. Everything else has a good default. */
export function validateForm(form: StreakForm): FormProblem | null {
  if (!form.nameA.trim()) {
    return { field: "nameA", title: "Add your name", message: "It's who the snaps are from" };
  }
  if (!form.nameB.trim()) {
    return { field: "nameB", title: "Add their name", message: "It goes on the chat, the streak and the letter" };
  }
  return null;
}

const entryAt = (date: string, h: number, m: number) =>
  `${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00.000Z`;

/** A seeded day: both in, no words. */
const seededDay = (date: string): CheckInDay => ({
  date,
  a: { word: "", at: entryAt(date, 3, 10) },
  b: { word: "", at: entryAt(date, 4, 25) },
});

/** A day the two of them actually wrote something on (or today). Kept across edits. */
const isReal = (d: CheckInDay, today: string) =>
  d.date >= today ||
  Boolean(d.a?.word || d.b?.word || d.a?.note || d.b?.note || d.a?.photoUrl || d.b?.photoUrl || d.covered);

/**
 * Form → page data.
 *
 * `existing` carries the real check-in log forward. Seeded (wordless) days are
 * re-laid on every save from `streakDays`, so changing the number in the form
 * does what it says.
 */
export function formToData(form: StreakForm, existing?: StreakPageData): StreakPageData {
  const today = dayKeyInZone(getServerTime(), form.timezone);

  const milestones: Milestone[] = form.letters
    .filter((l) => l.letter.trim())
    .map((l) => {
      const prior = existing?.milestones.find((m) => m.atDay === l.atDay);
      return {
        atDay: l.atDay,
        letter: l.letter.trim().slice(0, LIMITS.letter),
        ...(prior?.openedOn ? { openedOn: prior.openedOn } : {}),
      };
    });

  const microLetters: MicroLetter[] = form.microLines
    .map((line, i) => ({ week: i + 1, line: line.trim().slice(0, LIMITS.microLine) }))
    .filter((m) => m.line.length > 0);

  const real = (existing?.checkIns ?? []).filter((d) => isReal(d, today));
  const byDate = new Map(real.map((d) => [d.date, d]));
  const n = Math.max(0, Math.min(MAX_STREAK_SEED, Math.round(Number(form.streakDays) || 0)));
  for (let i = 1; i <= n; i++) {
    const date = addDays(today, -i);
    if (!byDate.has(date)) byDate.set(date, seededDay(date));
  }
  const checkIns = [...byDate.values()].sort((x, y) => (x.date < y.date ? -1 : 1));

  let startedOn = /^\d{4}-\d{2}-\d{2}$/.test(form.startedOn) ? form.startedOn : today;
  if (startedOn > today) startedOn = today;
  if (checkIns[0] && checkIns[0].date < startedOn) startedOn = checkIns[0].date;

  return {
    pair: {
      a: { id: existing?.pair.a.id ?? "p-a", name: form.nameA.trim().slice(0, LIMITS.name), photoUrl: form.photoA },
      b: { id: existing?.pair.b.id ?? "p-b", name: form.nameB.trim().slice(0, LIMITS.name), photoUrl: form.photoB },
    },
    startedOn,
    timezone: form.timezone,
    checkIns,
    covers: existing?.covers ?? { a: 1, b: 1 },
    milestones,
    microLetters,
    handleA: form.handleA.trim().replace(/^@/, "").slice(0, SKIN_LIMITS.handle),
    handleB: form.handleB.trim().replace(/^@/, "").slice(0, SKIN_LIMITS.handle),
    avatarA: form.avatarA,
    avatarB: form.avatarB,
    zodiacA: form.zodiacA,
    zodiacB: form.zodiacB,
    mapPlace: form.mapPlace.trim().slice(0, SKIN_LIMITS.place),
    chats: form.chats
      .map((c) => c.trim().slice(0, SKIN_LIMITS.chatLine))
      .filter(Boolean)
      .slice(0, SKIN_LIMITS.maxChats),
    photos: form.photos,
    letter: form.letter.slice(0, SKIN_LIMITS.letter),
    lockQuestion: form.lockQuestion.trim().slice(0, SKIN_LIMITS.lockQuestion),
    lockAnswer: form.lockAnswer.trim().slice(0, SKIN_LIMITS.lockAnswer),
  };
}
