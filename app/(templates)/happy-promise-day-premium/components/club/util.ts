// Pure helpers for "The Pinky Promise Club": read the extras defensively (old v2 drafts, AI fills, hostile data).

import type { LovePhoto, ValentineDayData } from "../../../_valentine/types";
import { CLUB_GIF_DEFAULTS } from "../../../_valentine/days/happy-promise-day-premium";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean) : []);

export interface LaneCard {
  photo: LovePhoto;
  caption: string;
  promise: string;
}

export interface Club {
  to: string;
  from: string;
  pet: string;
  invite: string;
  pinkyPrompt: string;
  welcome: string;
  /** The paper stars, the big one last. */
  stars: string[];
  /** Index of the golden star in `stars` (the big promise), −1 when there is none. */
  bigIndex: number;
  big: string;
  rules: string[];
  word: string;
  lane: LaneCard[];
  askBack: string[];
  engraving: string;
  since: Date | null;
  endLine: string;
  photos: LovePhoto[];
  /** The membership card photo (the last one). */
  hero: LovePhoto | null;
}

const DEFAULT_PROMISES = [
  "I promise to always save you the last bite. Mostly.",
  "I promise to pick up, even at 2 a.m.",
  "I promise to say sorry first after every fight.",
];
const DEFAULT_RULES = ["Hugs are mandatory after every fight.", "Snacks are shared. Mostly.", "No promise ever expires."];
export const DEFAULT_ASK_BACK = [
  "I promise to send good-morning texts",
  "I promise to laugh at your bad jokes",
  "I promise to share my fries",
  "I promise to never skip our calls",
  "I promise to stay. Always.",
];

const initial = (s: string, f: string) => (Array.from(s.trim())[0] ?? f).toUpperCase();

/** Letters only (A–Z), 2–6 of them; otherwise the name/pet name if it fits, otherwise "US". */
export function beadWord(raw: string, to: string, pet: string): string {
  const clean = (s: string) => s.normalize("NFKD").replace(/[^A-Za-z]/g, "").toUpperCase();
  for (const c of [clean(raw), clean(pet), clean(to)]) if (c.length >= 2 && c.length <= 6) return c;
  return "US";
}

/** "2022-03-14" → a Date (local), or null. */
function parseDay(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) || d.getFullYear() < 1950 ? null : d;
}

export function readClub(data: ValentineDayData): Club {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const to = data.recipientName.trim() || "you";
  const from = data.senderName.trim() || "Someone";
  const pet = (data.petName ?? "").trim();
  const photos = (data.photos ?? []).filter((p): p is LovePhoto => !!p && typeof p.url === "string" && !!p.url);
  const promises = (list(x.promises).length ? list(x.promises) : DEFAULT_PROMISES).slice(0, 7);
  // v2 drafts prefixed the big promise with "And above all,"; the jar doesn't print that.
  const big = str(x.bigPromise).replace(/^and above all,?\s*/i, "");
  const stars = big ? [...promises, big] : promises;
  const pp = list(x.stickyPromises);
  const lane = photos.slice(0, 6).map((p, i) => ({
    photo: p,
    caption: p.caption?.trim() ?? "",
    promise: pp[i] || p.note?.trim() || promises[i % promises.length],
  }));
  const rules = list(x.clubRules);
  const ask = list(x.askBack);
  return {
    to,
    from,
    pet,
    invite: str(x.envelopeLine) || "Membership: two people. Very exclusive.",
    pinkyPrompt: str(x.pinkyPrompt) || "Pinky promise first. Rules are rules.",
    welcome: str(x.welcomeLine) || `Welcome to the club, ${pet || to}. It's just us, forever.`,
    stars,
    bigIndex: big ? stars.length - 1 : -1,
    big: big || promises[promises.length - 1],
    rules: (rules.length ? rules : DEFAULT_RULES).slice(0, 3),
    word: beadWord(str(x.beadWord), to, pet),
    lane,
    askBack: (ask.length ? ask : DEFAULT_ASK_BACK).slice(0, 5),
    engraving: str(x.lockEngraving) || `${initial(from, "A")} + ${initial(to, "M")} · forever`,
    since: parseDay(str(x.sinceDate)),
    endLine: (data.endLine ?? "").trim(),
    photos,
    hero: photos[photos.length - 1] ?? null,
  };
}

/** A GIF slot's URL: the sender's own link, "none" (hidden), or our CDN default (never an empty string). */
export function gifFor(data: ValentineDayData, id: string): string {
  const v = (data.gifs?.[id] ?? "").trim();
  if (v === "none") return "none";
  if (/^https:\/\//i.test(v)) return v;
  return CLUB_GIF_DEFAULTS[id] ?? "";
}

/** "11 Feb 2027" */
export function dateLine(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** The point at the centre of an element, as a 0–1 fraction of the viewport (for burst()). */
export function originOf(el: Element | null | undefined, fy = 0.5): { x: number; y: number } {
  if (!el || typeof window === "undefined") return { x: 0.5, y: 0.5 };
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * fy) / window.innerHeight };
}
