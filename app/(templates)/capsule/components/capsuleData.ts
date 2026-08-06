// ─── Capsule — demo fixtures, the editor draft, and the copy audit ───────────
//
// Everything here is data. No component imports anything from `types.ts` that
// this file re-exports; `types.ts` is frozen and is the only source of truth for
// the stored shape.

import { seededShuffle } from "@/lib/seededRandom";
import {
  COPY,
  CONFIDENCE_LABELS,
  LIMITS,
  PAYLOAD_VERSION,
  PROMPTS,
  assertNeutralCopy,
  type Capsule,
  type CapsuleStatus,
  type Confidence,
  type Prediction,
  type Side,
} from "./types";

// ═══════════════════════════════════════════════════════════════════════════
// The editor draft
// ═══════════════════════════════════════════════════════════════════════════

/**
 * What the writing screen holds. Deliberately NOT a `Capsule`: a draft has
 * half-typed rows, an un-agreed stake and no `sealedOn` yet, and the stored
 * shape has nowhere to put any of that.
 *
 * Lives in component state only. No localStorage, no sessionStorage — a
 * capsule's contents must not sit in a store any other tab can read.
 */
export interface CapsuleDraft {
  nameA: string;
  nameB: string;
  /** `yyyy-mm-dd` from the date input. Combined with `timezone` on seal. */
  opensOnDate: string;
  /** IANA. One per pair, chosen once at creation. */
  timezone: string;
  stake: string;
  /** Both sides must tick before it can seal. Editor-local; never stored. */
  agreedA: boolean;
  agreedB: boolean;
  cityA: string;
  lineA: string;
  cityB: string;
  lineB: string;
  predictions: Prediction[];
  /** ISO, set at the moment of sealing. "" while still writing. */
  sealedOn: string;
  status: CapsuleStatus;
}

/** Which partner is at the keyboard. Each sees only their own predictions. */
export type Seat = Side;

export const seatName = (d: CapsuleDraft, seat: Seat): string =>
  (seat === "a" ? d.nameA : d.nameB).trim() || (seat === "a" ? "Partner one" : "Partner two");

export const other = (seat: Seat): Seat => (seat === "a" ? "b" : "a");

export const countFor = (predictions: Prediction[], seat: Seat): number =>
  predictions.filter((p) => p.author === seat).length;

/** "Arjun has written 4 predictions." Count and nothing else — ever. */
export const writtenLine = (name: string, n: number): string =>
  n === 0
    ? `${name} hasn't written any yet.`
    : `${name} has written ${n} prediction${n === 1 ? "" : "s"}.`;

/** A blank row. Ids are stable within a session so React can key the inputs. */
let rowSeq = 0;
export function newPrediction(author: Side): Prediction {
  rowSeq += 1;
  return { id: `${author}-${rowSeq}-${rowSeq * 7919}`, author, text: "", confidence: 3, isWildcard: false };
}

/** One wildcard per author. Turning one on turns the author's other one off. */
export function setWildcard(predictions: Prediction[], id: string, on: boolean): Prediction[] {
  const target = predictions.find((p) => p.id === id);
  if (!target) return predictions;
  return predictions.map((p) => {
    if (p.id === id) return { ...p, isWildcard: on };
    if (on && p.author === target.author && p.isWildcard) return { ...p, isWildcard: false };
    return p;
  });
}

/** Three prompts at a time, shuffled deterministically. `turn` advances them. */
export function promptTrio(turn: number): string[] {
  return seededShuffle(`capsule-prompts-${turn}`, PROMPTS).slice(0, 3);
}

/**
 * The pair's zone, chosen once. `Intl` is read in an event handler / lazy
 * initialiser, never during render — the value differs between server and
 * client and would otherwise be a hydration mismatch.
 */
export function deviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * `yyyy-mm-dd` + IANA zone → the ISO instant of 09:00 local on that day.
 *
 * DST is the trap. Building the instant by hand (`Date.UTC` plus a fixed offset)
 * shifts the open date by an hour twice a year, and a capsule that opens on the
 * 13th because the clocks went back is a bug nobody will ever debug. Instead we
 * ask `Intl` what the zone's offset actually is on that date and correct for it.
 */
export function localDateToIso(ymd: string, timezone: string, hour = 9): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || "");
  if (!m) return "";
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];

  // First guess: treat the wall time as UTC, then measure how far off the zone
  // is at that instant and subtract it. One correction pass is enough for every
  // real-world zone, including the 30- and 45-minute ones.
  let guess = Date.UTC(y, mo - 1, d, hour, 0, 0, 0);
  for (let pass = 0; pass < 2; pass++) {
    const offset = zoneOffsetMs(guess, timezone);
    const corrected = Date.UTC(y, mo - 1, d, hour, 0, 0, 0) - offset;
    if (corrected === guess) break;
    guess = corrected;
  }
  return new Date(guess).toISOString();
}

/** How far ahead of UTC `timezone` is at `utcMs`, in milliseconds. */
function zoneOffsetMs(utcMs: number, timezone: string): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts: Record<string, number> = {};
    for (const p of dtf.formatToParts(new Date(utcMs))) {
      if (p.type !== "literal") parts[p.type] = Number(p.value);
    }
    const asUtc = Date.UTC(
      parts.year,
      (parts.month ?? 1) - 1,
      parts.day ?? 1,
      (parts.hour ?? 0) % 24,
      parts.minute ?? 0,
      parts.second ?? 0,
    );
    return asUtc - utcMs;
  } catch {
    return 0;
  }
}

/** `yyyy-mm-dd` one year on from an ISO instant, in the pair's zone. */
export function oneYearOn(fromIso: string, timezone: string): string {
  const t = Date.parse(fromIso);
  const base = Number.isNaN(t) ? Date.now() : t;
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(base));
    const [y, m, d] = parts.split("-");
    return `${Number(y) + 1}-${m}-${d}`;
  } catch {
    return new Date(base).toISOString().slice(0, 10);
  }
}

/** Draft → the stored shape. Blank rows are dropped; they were never predictions. */
export function draftToCapsule(d: CapsuleDraft, sealedOn: string): Capsule {
  const predictions = d.predictions
    .map((p) => ({ ...p, text: p.text.trim().slice(0, LIMITS.predictionText) }))
    .filter((p) => p.text.length > 0);

  const writtenAt = sealedOn || new Date().toISOString();

  return {
    version: PAYLOAD_VERSION,
    pair: {
      a: { id: "a", name: d.nameA.trim().slice(0, LIMITS.name), photoUrl: "" },
      b: { id: "b", name: d.nameB.trim().slice(0, LIMITS.name), photoUrl: "" },
    },
    sealedOn,
    opensOn: localDateToIso(d.opensOnDate, d.timezone),
    timezone: d.timezone,
    stake: d.stake.trim().slice(0, LIMITS.stake),
    context: {
      a: { city: d.cityA.trim().slice(0, LIMITS.city), writtenAt, oneLineAboutNow: d.lineA.trim().slice(0, LIMITS.oneLine) },
      b: { city: d.cityB.trim().slice(0, LIMITS.city), writtenAt, oneLineAboutNow: d.lineB.trim().slice(0, LIMITS.oneLine) },
    },
    predictions,
    status: d.status === "writing" ? "sealed" : d.status,
  };
}

/** The stored shape → a draft, for the amend window. */
export function capsuleToDraft(c: Capsule): CapsuleDraft {
  return {
    nameA: c.pair.a.name,
    nameB: c.pair.b.name,
    opensOnDate: isoToLocalYmd(c.opensOn, c.timezone),
    timezone: c.timezone,
    stake: c.stake,
    agreedA: true,
    agreedB: true,
    cityA: c.context.a.city,
    lineA: c.context.a.oneLineAboutNow,
    cityB: c.context.b.city,
    lineB: c.context.b.oneLineAboutNow,
    predictions: c.predictions.map((p) => ({ ...p })),
    sealedOn: c.sealedOn,
    status: c.status,
  };
}

export function isoToLocalYmd(iso: string, timezone: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(t));
  } catch {
    return new Date(t).toISOString().slice(0, 10);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Demo
// ═══════════════════════════════════════════════════════════════════════════
//
// Fixed ISO instants, never derived from `Date.now()` at module load — a demo
// whose dates move between the server render and the client render is a
// hydration mismatch, and one that drifts is a flaky screenshot.

export const DEMO_SEALED_ON = "2026-03-14T04:00:00.000Z";
export const DEMO_OPENS_ON = "2027-03-14T04:00:00.000Z";
export const DEMO_TIMEZONE = "Asia/Kolkata";

const demoPrediction = (
  id: string,
  author: Side,
  text: string,
  confidence: Confidence,
  isWildcard = false,
): Prediction => ({ id, author, text, confidence, isWildcard });

/**
 * Five from Arjun, four from Meera — unequal on purpose, so the reveal order
 * demonstrates "alternate until one runs out, then continue" rather than
 * pretending the two sides always match.
 *
 * `will the hoodie be returned` appears on both sides: that is the twin, and it
 * is the nicest thing this screen ever does.
 */
export const DEMO_PREDICTIONS: Prediction[] = [
  demoPrediction("a1", "a", "we will still be arguing about the thermostat", 4),
  demoPrediction("a2", "a", "Meera gets the promotion before the year is out", 5),
  demoPrediction("a3", "a", "will the hoodie be returned", 2),
  demoPrediction("a4", "a", "neither of us learns to drive", 3),
  demoPrediction("a5", "a", "a goat becomes involved somehow", 5, true),
  demoPrediction("b1", "b", "Arjun says sorry first, and it takes four days", 4),
  demoPrediction("b2", "b", "one of us moves cities and it is not me", 3),
  demoPrediction("b3", "b", "will the hoodie be returned", 5),
  demoPrediction("b4", "b", "we finally repaint the kitchen a colour we regret", 1, true),
];

export const DEMO_CAPSULE: Capsule = {
  version: PAYLOAD_VERSION,
  pair: {
    a: { id: "a", name: "Arjun", photoUrl: "" },
    b: { id: "b", name: "Meera", photoUrl: "" },
  },
  sealedOn: DEMO_SEALED_ON,
  opensOn: DEMO_OPENS_ON,
  timezone: DEMO_TIMEZONE,
  stake: "loser cooks every Sunday for a month, no takeaway loopholes",
  context: {
    a: { city: "Pune", writtenAt: DEMO_SEALED_ON, oneLineAboutNow: "we were still figuring out whose flat this is" },
    b: { city: "Pune", writtenAt: DEMO_SEALED_ON, oneLineAboutNow: "I had just handed in my notice and told nobody" },
  },
  predictions: DEMO_PREDICTIONS,
  status: "sealed",
};

export const DEMO_DRAFT: CapsuleDraft = {
  nameA: "Arjun",
  nameB: "Meera",
  opensOnDate: "2027-03-14",
  timezone: DEMO_TIMEZONE,
  stake: DEMO_CAPSULE.stake,
  agreedA: true,
  agreedB: true,
  cityA: "Pune",
  lineA: DEMO_CAPSULE.context.a.oneLineAboutNow,
  cityB: "Pune",
  lineB: DEMO_CAPSULE.context.b.oneLineAboutNow,
  predictions: DEMO_PREDICTIONS.map((p) => ({ ...p })),
  sealedOn: DEMO_SEALED_ON,
  status: "sealed",
};

/** An empty draft, for a real pair starting from nothing. */
export function blankDraft(timezone: string, todayIso: string): CapsuleDraft {
  return {
    nameA: "",
    nameB: "",
    opensOnDate: oneYearOn(todayIso, timezone),
    timezone,
    stake: "",
    agreedA: false,
    agreedB: false,
    cityA: "",
    lineA: "",
    cityB: "",
    lineB: "",
    predictions: [
      newPrediction("a"), newPrediction("a"), newPrediction("a"), newPrediction("a"),
      newPrediction("b"), newPrediction("b"), newPrediction("b"), newPrediction("b"),
    ],
    sealedOn: "",
    status: "writing",
  };
}

/** Carried forward by `COPY.sealAnother` — a new capsule keeps the old stake. */
export function nextCapsuleDraft(prev: CapsuleDraft, todayIso: string): CapsuleDraft {
  const fresh = blankDraft(prev.timezone, todayIso);
  return { ...fresh, nameA: prev.nameA, nameB: prev.nameB, stake: prev.stake };
}

// ═══════════════════════════════════════════════════════════════════════════
// Copy audit
// ═══════════════════════════════════════════════════════════════════════════

/**
 * EVERY user-facing string this template can render, run through
 * `assertNeutralCopy`. A capsule opened a year late may be opened alone, or by
 * people who have separated — no string may assume otherwise.
 *
 * Anything added to a screen belongs here too. The audit is only worth what it
 * covers.
 */
export const TEMPLATE_STRINGS: string[] = [
  // From the frozen contract.
  ...Object.values(COPY).map((v) => (typeof v === "function" ? v("Arjun", "certain", "the hoodie comes back") : v)),
  COPY.sealedUntil("14 March 2027"),
  COPY.waitingFor("Arjun"),
  COPY.contextLead("Pune", "we were still figuring it out"),
  ...Object.values(CONFIDENCE_LABELS),
  ...PROMPTS,
  // Written for this template.
  "Capsule",
  "sealed predictions, opened in a year",
  "Write it down. Don't look again until it's time.",
  "who is writing",
  "your predictions",
  "add a prediction",
  "remove",
  "how sure are you",
  "wildcard",
  "the stake",
  "both of you have to agree on this before it seals.",
  "I agree to this",
  "where you are right now",
  "city",
  "one line about right now",
  "need a nudge?",
  "new prompts",
  "seal it",
  "opens on",
  "one timezone for the pair. the date is compared in UTC.",
  "sealed",
  "the capsule",
  "peek",
  "predictions inside",
  "the stake, agreed",
  "reminders at 30, 7 and 1 days are not built yet.",
  "open it",
  "both of you have to be here.",
  "3",
  "2",
  "1",
  "then",
  "now",
  "read it",
  "next",
  "who said it",
  "right",
  "wrong",
  "waiting on the other verdict",
  "both verdicts in",
  "the scorecard",
  "points",
  "disputed",
  "wildcards",
  "stake",
  "owed by",
  "nobody owes anything.",
  "save the card",
  "share",
  "close this",
  "kept, unopened",
  "one at a time",
  "written a year ago",
  "skip to opening date",
  "partner joins",
  "debug",
];

/** Returns the offending strings. An empty array is the pass condition. */
export const auditCopy = (): string[] => assertNeutralCopy(TEMPLATE_STRINGS);
