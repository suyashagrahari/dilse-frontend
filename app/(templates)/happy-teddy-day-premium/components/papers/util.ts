// Pure helpers for "Adoption Papers": read the page defensively, the certificate's facts, letter paragraphs.

import type { LovePhoto } from "../../../_love/types";
import type { ValentineDayData } from "../../../_valentine/types";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Palette (research §D.4). */
export const C = {
  oat: "#EFE6D8",
  paper: "#F5EEE2",
  honey: "#C58B4B",
  honeyLight: "#E9C08A",
  cocoa: "#5A3B2E",
  cocoaDeep: "#2A1A12",
  night: "#140B07",
  powder: "#BFD3E0",
  stamp: "#B23A3A",
} as const;

export const DEFAULT_CARE = [
  "Hug daily. Twice on Mondays.",
  "Not to be left alone on long-distance nights.",
  "Responds to forehead kisses.",
  "If you're sad, squeeze firmly. Repeat as needed.",
  "Do not lend to anyone. He's very particular, like me.",
];

export interface Papers {
  to: string;
  from: string;
  teddy: string;
  tagLine: string;
  firstWords: string;
  birthPlace: string;
  temperament: string;
  care: string[];
  signOff: string;
  photos: LovePhoto[];
  /** "TD-0210-4821": stable for this pair of names. */
  serial: string;
  /** Today, the day the papers are signed ("10 February 2027"). */
  born: string;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function today(): string {
  try {
    return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "today";
  }
}

export function readPapers(data: ValentineDayData): Papers {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const to = data.recipientName.trim() || "you";
  const from = data.senderName.trim() || "Someone";
  const care = (Array.isArray(x.careLines) ? x.careLines : []).map(str).filter(Boolean).slice(0, 5);
  return {
    to,
    from,
    teddy: str(x.teddyName) || "Golu",
    tagLine: str(x.parcelNote) || "Contains one (1) hug.",
    firstWords: str(x.firstWords),
    birthPlace: str(x.birthPlace),
    temperament: str(x.temperament),
    care: care.length ? care : DEFAULT_CARE,
    signOff: str(x.signOff),
    photos: (data.photos ?? []).filter((p) => p && typeof p.url === "string" && p.url).slice(0, 12),
    serial: `TD-0210-${String(hash(`${to}|${from}`) % 9000 + 1000)}`,
    born: today(),
  };
}

/** Paragraphs of the letter (blank-line separated; single newlines stay inside a paragraph). */
export function paragraphs(s: string): string[] {
  return s
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
