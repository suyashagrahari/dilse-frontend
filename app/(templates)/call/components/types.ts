// ─── Caller ID — the frozen contract ─────────────────────────────────────────
//
// LEAD-OWNED AND FROZEN. Import from here; do not extend it.
//
// An incoming call from someone whose number you already know by heart, on a
// full-bleed call screen, backed by a caller-identification card and a call
// log. The goal is LAYOUT FIDELITY: the full-screen photo, the name at the top,
// the number and location under it, the verified check, the crowd-sourced tag,
// the spam meter reading zero, and the two round buttons at the bottom that
// everybody's thumb already knows the position of.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// The caller-ID app this borrows its shape from is never named — not in copy,
// file names, class names, alt text, comments or tests — and neither of its two
// blues, nor a near-miss of either, may appear anywhere in the template. The
// exact values are in FORBIDDEN_COLORS below rather than here, so a brand grep
// over this directory can pass over this file too. Our mark is WORDMARK below:
// "Sacch", with a check glyph.
//
// The chrome that IS safe and IS required: the identification card, the tag
// row, the spam meter, the verified badge and the call log with its four
// coloured call-direction glyphs.
//
// ── THE DETAIL THAT DECIDES THIS TEMPLATE ────────────────────────────────────
// `spamRisk` is 0 for the demo and the meter must render 0 as an explicit,
// confident "0% spam · verified" state rather than as an empty bar. An empty
// bar reads as "no data" — the opposite of the one thing this screen is saying.

import { obj, str, strOr, num, bool, clampNum, oneOf, list, strList, bodyFromKeys, type Raw } from "@/lib/wire";

/** Our own mark, top-left of the identification card. The check is part of it. */
export const WORDMARK = "Sacch";
export const WORDMARK_GLYPH = "✓";

/**
 * The accent. Deliberately not either of the two blues named in the header, and
 * far enough away that no screenshot argument is possible: this is a green,
 * which is also the colour the answer button wants.
 */
export const ACCENT = "#159A5B";

/**
 * The two colours this template may not use, assembled from fragments rather
 * than written out: a deny-list that spells its own entries makes "grep this
 * directory for the banned values and find nothing" untrue, and the only honest
 * way to run that check is for it to pass over every file including this one.
 * Cutting after two characters keeps each fragment shorter than the value.
 */
export const FORBIDDEN_COLORS: readonly string[] = [
  ["#0", "08", "9FF"].join(""),
  ["#3", "4B", "7F1"].join(""),
];

/** True when `source` uses either forbidden blue. Run over source and DOM. */
export const usesForbiddenColor = (source: string): boolean =>
  FORBIDDEN_COLORS.some((c) => source.toLowerCase().includes(c.toLowerCase()));

// ═══════════════════════════════════════════════════════════════════════════
// Stored shape
// ═══════════════════════════════════════════════════════════════════════════

/** The four call-direction glyphs, each with its own colour in the log. */
export type CallKind = "missed" | "incoming" | "outgoing" | "rejected";

export const CALL_KINDS: readonly CallKind[] = ["missed", "incoming", "outgoing", "rejected"];

/** One crowd-sourced tag. `count` is how many people submitted it. */
export interface CallerTag {
  label: string;
  count: number;
}

export interface CallLogEntry {
  kind: CallKind;
  /** "11:47 PM" — a clock label, never a parsed time. */
  time: string;
  /** "Yesterday" / "Tuesday" / "14 Feb" — free text, never a parsed date. */
  ago: string;
  /** Absent for missed and rejected calls, which by definition have none. */
  duration?: string;
  /** The line under the entry. Where the joke lives. */
  note?: string;
}

export interface CallData {
  caller: {
    name: string;
    photoUrl: string;
    number: string;
    location: string;
    carrier: string;
  };
  /** Whose phone this is. Shown on the lock screen above the call. */
  recipient: { name: string };
  /**
   * Crowd-sourced tags, sorted by count descending. The top one is the label
   * that renders under the name on the call screen; the rest fill the card.
   * `topTag` below is the only sanctioned way to pick it.
   */
  tags: CallerTag[];
  /** 0–100. The demo is 0 and the meter must say so out loud. See the header. */
  spamRisk: number;
  verified: boolean;
  /** An optional voice note that plays instead of a ringtone. null = ringtone. */
  voiceUrl?: string | null;
  /** What she is calling to say, revealed line by line once answered. */
  message: string[];
  callLog: CallLogEntry[];
  /** Shown above the "add a tag" box on the published page. */
  contributorPrompt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Demo content
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Unsplash serves `access-control-allow-origin: *`, which matters more than it
 * looks: the share card is captured with html-to-image, and a photo without
 * CORS headers taints the canvas and kills the whole export.
 */
const photo = (id: string, w = 900, h = 1600): string =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&h=${h}&fit=crop&auto=format`;

export const DEMO_DATA: CallData = {
  caller: {
    name: "Meera Sharma",
    photoUrl: photo("photo-1494790108377-be9c29b29330"),
    number: "+91 98200 41821",
    location: "Lucknow, Uttar Pradesh",
    carrier: "DIL Prepaid",
  },
  recipient: { name: "Karan" },
  tags: [
    { label: "Pick Up. Now.", count: 2481 },
    { label: "Answer On The First Ring", count: 1937 },
    { label: "Not Spam. Never Spam.", count: 1204 },
    { label: "Calling About Dinner", count: 806 },
    { label: "Will Ask If You Ate", count: 512 },
    { label: "Says 'One Minute' At Minute 40", count: 318 },
  ],
  spamRisk: 0,
  verified: true,
  voiceUrl: null,
  message: [
    "Pick up.",
    "I know you are looking at the screen right now, deciding.",
    "You have been deciding for four years. It has never once gone the other way.",
    "It is me. It is always going to be me.",
    "— Meera",
  ],
  callLog: [
    {
      kind: "incoming",
      time: "11:47 PM",
      ago: "just now",
      duration: "4 hrs 12 mins",
      note: "Neither of you said a word for the last forty minutes of this one.",
    },
    {
      kind: "missed",
      time: "9:02 AM",
      ago: "Yesterday",
      note: "You were in a meeting. She knew you were in a meeting. She called anyway.",
    },
    {
      kind: "outgoing",
      time: "2:14 AM",
      ago: "Tuesday",
      duration: "1 min 3 secs",
      note: "You called to check she had reached. She had reached two hours earlier.",
    },
    {
      kind: "rejected",
      time: "6:30 PM",
      ago: "Sunday",
      note: "Cut in one ring, then 'sorry mom's here 🙄' arrived four seconds later.",
    },
    {
      kind: "incoming",
      time: "8:15 PM",
      ago: "Sunday",
      duration: "38 mins",
      note: "Thirty-eight minutes on which restaurant. You went to the usual one.",
    },
    {
      kind: "outgoing",
      time: "4:03 AM",
      ago: "12 Jan",
      duration: "2 hrs 41 mins",
      note: "The night before her viva. You read the same six slides back to her until she slept.",
    },
    {
      kind: "missed",
      time: "11:59 PM",
      ago: "13 Feb",
      note: "Phone was face down under a pillow. She has not let this go and she should not.",
    },
  ],
  contributorPrompt:
    "Know this number? Add a tag. Karan approves them before they show up, and he has already rejected four from Rohit.",
};

/** Whitelisted keys that make up the flat wire payload (also the model content fields). */
export const CALL_CONTENT_KEYS: readonly (keyof CallData)[] = [
  "caller",
  "recipient",
  "tags",
  "spamRisk",
  "verified",
  "voiceUrl",
  "message",
  "callLog",
  "contributorPrompt",
];

// ═══════════════════════════════════════════════════════════════════════════
// Caps and helpers
// ═══════════════════════════════════════════════════════════════════════════

export const MAX_TAGS = 12;
export const MAX_LOG_ENTRIES = 20;
export const MAX_MESSAGE_LINES = 10;

/** Hard caps on free text, so one pasted essay cannot destroy the call screen. */
const LIMITS = {
  name: 60,
  number: 32,
  location: 80,
  carrier: 40,
  tag: 48,
  time: 16,
  ago: 32,
  duration: 32,
  note: 240,
  line: 200,
  prompt: 240,
} as const;

const cut = (s: string, max: number): string => (s.length > max ? s.slice(0, max) : s);

/** A non-negative integer. Guards every rendered count against floats and negatives. */
const count = (v: unknown, fallback: number): number => {
  const n = num(v, fallback);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : fallback;
};

/**
 * Only http(s) and data: URLs reach an <img src>. Anything else — `javascript:`
 * most of all — becomes the empty string, which the renderer draws as the
 * initial-letter fallback avatar.
 */
const imageUrl = (v: unknown): string => {
  const raw = strOr(v, "").trim();
  if (/^data:image\//i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return "";
};

/** Audio is fetched and played, so it is http(s) and data:audio only. */
const audioUrl = (v: unknown): string => {
  const raw = strOr(v, "").trim();
  if (/^data:audio\//i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return "";
};

/**
 * The tag that renders under the name on the call screen.
 *
 * Sorts a copy rather than trusting the stored order: the contract says the
 * array arrives sorted, and the one screen that depends on it is not the place
 * to find out that an editor appended instead of inserting.
 */
export const topTag = (data: CallData): CallerTag | null =>
  data.tags.length === 0 ? null : [...data.tags].sort((a, b) => b.count - a.count)[0];

/**
 * The spam meter's own label. 0 is a statement, not an absence — an empty bar
 * with no text reads as "we have no idea who this is", which is the exact
 * opposite of what this screen exists to say.
 */
export function spamLabel(data: CallData): string {
  const risk = Math.max(0, Math.min(100, Math.trunc(data.spamRisk)));
  if (risk === 0) return data.verified ? "0% spam · verified" : "0% spam";
  if (risk < 25) return `${risk}% spam · low risk`;
  if (risk < 60) return `${risk}% spam · some reports`;
  return `${risk}% spam · high risk`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Wire format
// ═══════════════════════════════════════════════════════════════════════════

/** UI state → flat body sent to POST/PUT. `password` optional (empty = no gate). */
export function callDataToBody(data: CallData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, CALL_CONTENT_KEYS, password);
}

function coerceTag(o: Raw): CallerTag | null {
  const label = cut(strOr(o.label, "").trim(), LIMITS.tag);
  if (!label) return null;
  return { label, count: count(o.count, 0) };
}

function coerceLogEntry(o: Raw): CallLogEntry | null {
  const time = cut(strOr(o.time, "").trim(), LIMITS.time);
  const ago = cut(strOr(o.ago, "").trim(), LIMITS.ago);
  // An entry with neither a clock nor a day cannot be placed in the log.
  if (!time && !ago) return null;
  const kind = oneOf<CallKind>(o.kind, CALL_KINDS, "incoming");
  const rawDuration = cut(strOr(o.duration, "").trim(), LIMITS.duration);
  const note = cut(strOr(o.note, "").trim(), LIMITS.note);
  return {
    kind,
    time,
    ago,
    // A missed or rejected call with a duration is a contradiction the log
    // renders literally, so the field is dropped rather than shown.
    ...(rawDuration && kind !== "missed" && kind !== "rejected" ? { duration: rawDuration } : {}),
    ...(note ? { note } : {}),
  };
}

/**
 * DB/share response → UI state.
 *
 * Total function: every branch returns something drawable, and an empty or
 * absent payload falls all the way back to the demo call rather than to a blank
 * screen.
 */
export function dbToCallData(db: Raw | null | undefined): CallData {
  const src = obj(db);
  const rawCaller = obj(src.caller);

  const voice = audioUrl(src.voiceUrl);

  return {
    caller: {
      name: cut(str(rawCaller.name, DEMO_DATA.caller.name).trim(), LIMITS.name),
      photoUrl: imageUrl(rawCaller.photoUrl) || DEMO_DATA.caller.photoUrl,
      number: cut(str(rawCaller.number, DEMO_DATA.caller.number).trim(), LIMITS.number),
      location: cut(strOr(rawCaller.location, DEMO_DATA.caller.location).trim(), LIMITS.location),
      carrier: cut(strOr(rawCaller.carrier, DEMO_DATA.caller.carrier).trim(), LIMITS.carrier),
    },
    recipient: {
      name: cut(str(obj(src.recipient).name, DEMO_DATA.recipient.name).trim(), LIMITS.name),
    },
    // Sorted descending here so every consumer, not just `topTag`, gets the
    // order the contract promises.
    tags: list<CallerTag>(src.tags, coerceTag, DEMO_DATA.tags)
      .slice(0, MAX_TAGS)
      .sort((a, b) => b.count - a.count),
    spamRisk: Math.round(clampNum(src.spamRisk, DEMO_DATA.spamRisk, 0, 100)),
    verified: bool(src.verified, DEMO_DATA.verified),
    // null is meaningful here — it is "ring normally" — so it is preserved
    // rather than collapsed into undefined.
    voiceUrl: voice || null,
    message: strList(src.message, DEMO_DATA.message)
      .map((l) => cut(l.trim(), LIMITS.line))
      .filter(Boolean)
      .slice(0, MAX_MESSAGE_LINES),
    callLog: list<CallLogEntry>(src.callLog, coerceLogEntry, DEMO_DATA.callLog).slice(0, MAX_LOG_ENTRIES),
    contributorPrompt: cut(str(src.contributorPrompt, DEMO_DATA.contributorPrompt).trim(), LIMITS.prompt),
  };
}
