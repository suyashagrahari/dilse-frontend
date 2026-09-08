// ─── The editor's own shapes ─────────────────────────────────────────────────
//
// The FORM is not the DATA. The sender authors identity and letters; the
// check-in log is written by the two of them afterwards and is only ever
// round-tripped. Keeping the two apart means a half-typed form can never
// produce a half-valid `StreakData`, and `formToData` is the single place the
// conversion happens.

import {
  LIMITS as CONTRACT_LIMITS,
  PALETTE as CONTRACT_PALETTE,
  SERIF as CONTRACT_SERIF,
  UI as CONTRACT_UI,
  dayKeyInZone,
  getServerTime,
  type MicroLetter,
  type Milestone,
  type StreakData,
} from "./types";
import { MILESTONE_DAYS, deviceTimezone } from "./demoData";

// Re-exported so the sheet has one import for its tokens rather than four.
export const LIMITS = CONTRACT_LIMITS;
export const PALETTE = CONTRACT_PALETTE;
export const SERIF = CONTRACT_SERIF;
export const UI = CONTRACT_UI;

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

export interface StreakForm {
  nameA: string;
  photoA: string;
  nameB: string;
  photoB: string;
  /** YYYY-MM-DD in the pair's zone. */
  startedOn: string;
  timezone: string;
  letters: { atDay: number; letter: string }[];
  /** Index 0 is week 1. A blank entry is a week with nothing to say. */
  microLines: string[];
}

export const MILESTONE_LABELS: Record<number, string> = {
  30: "at thirty days",
  100: "at a hundred",
  365: "at a year",
};

/** What the sheet opens on before the sender has typed anything. */
export function emptyForm(): StreakForm {
  const timezone = deviceTimezone();
  return {
    nameA: "",
    photoA: "",
    nameB: "",
    photoB: "",
    startedOn: dayKeyInZone(getServerTime(), timezone),
    timezone,
    letters: MILESTONE_DAYS.map((atDay) => ({ atDay, letter: "" })),
    microLines: ["", "", "", ""],
  };
}

/** Pull a form back out of stored data, for `?edit=<id>`. */
export function dataToForm(data: StreakData): StreakForm {
  const byDay = new Map(data.milestones.map((m) => [m.atDay, m.letter]));
  const maxWeek = data.microLetters.reduce((m, x) => Math.max(m, x.week), 0);
  const lines: string[] = [];
  for (let w = 1; w <= Math.max(4, maxWeek); w++) {
    lines.push(data.microLetters.find((m) => m.week === w)?.line ?? "");
  }
  return {
    nameA: data.pair.a.name,
    photoA: data.pair.a.photoUrl,
    nameB: data.pair.b.name,
    photoB: data.pair.b.photoUrl,
    startedOn: data.startedOn,
    timezone: data.timezone,
    letters: MILESTONE_DAYS.map((atDay) => ({ atDay, letter: byDay.get(atDay) ?? "" })),
    microLines: lines,
  };
}

export interface FormProblem {
  field: keyof StreakForm;
  title: string;
  message: string;
}

/**
 * The only two things that are genuinely required: both names, and a start date
 * that has actually happened.
 *
 * Everything else — photos, letters, weekly lines — is optional by design. A
 * setup form that refuses to finish is a setup form nobody finishes.
 */
export function validateForm(form: StreakForm): FormProblem | null {
  if (!form.nameA.trim()) {
    return { field: "nameA", title: "Who's the first of you?", message: "Both names sit above the lights" };
  }
  if (!form.nameB.trim()) {
    return { field: "nameB", title: "And who's the other?", message: "Both names sit above the lights" };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.startedOn)) {
    return { field: "startedOn", title: "Pick the first day", message: "Every day boundary counts from it" };
  }
  const today = dayKeyInZone(getServerTime(), form.timezone);
  if (form.startedOn > today) {
    return {
      field: "startedOn",
      title: "That day hasn't happened yet",
      message: "Start today, or any day behind you",
    };
  }
  return null;
}

/**
 * Form → `StreakData`.
 *
 * `existing` carries the check-in log forward when editing a page that already
 * has one. A new page starts with an empty log and lands on the day-one state,
 * which is honest: the pair has not checked in yet, and pretending otherwise
 * would put words in their mouths on the very first screen.
 */
export function formToData(form: StreakForm, existing?: StreakData): StreakData {
  const milestones: Milestone[] = form.letters
    .filter((l) => l.letter.trim())
    .map((l) => {
      const prior = existing?.milestones.find((m) => m.atDay === l.atDay);
      return {
        atDay: l.atDay,
        letter: l.letter.trim().slice(0, LIMITS.letter),
        // An opened letter stays opened across an edit. Re-sealing something
        // the recipient has already read would be a small betrayal.
        ...(prior?.openedOn ? { openedOn: prior.openedOn } : {}),
      };
    });

  const microLetters: MicroLetter[] = form.microLines
    .map((line, i) => ({ week: i + 1, line: line.trim().slice(0, LIMITS.microLine) }))
    .filter((m) => m.line.length > 0);

  return {
    pair: {
      a: { id: existing?.pair.a.id ?? "p-a", name: form.nameA.trim().slice(0, LIMITS.name), photoUrl: form.photoA },
      b: { id: existing?.pair.b.id ?? "p-b", name: form.nameB.trim().slice(0, LIMITS.name), photoUrl: form.photoB },
    },
    startedOn: form.startedOn,
    timezone: form.timezone,
    checkIns: existing?.checkIns ?? [],
    covers: existing?.covers ?? { a: 0, b: 0 },
    milestones,
    microLetters,
  };
}
