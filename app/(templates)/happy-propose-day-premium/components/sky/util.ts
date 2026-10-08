// Pure helpers for "Look Up": read the extras defensively.

import type { LovePhoto, ValentineDayData } from "../../../_valentine/types";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean) : []);

export type RingStyle = "solitaire" | "heart" | "band" | "halo";
export type Stone = "diamond" | "ruby" | "sapphire" | "emerald" | "rosegold";
export type HandTone = "light" | "medium" | "tan" | "deep";

export interface Sky {
  to: string;
  from: string;
  texts: string[];
  reasons: string[];
  memories: { when: string; what: string; photo: LovePhoto | null }[];
  lookUp: string;
  initials: string;
  question: string;
  ring: RingStyle;
  stone: Stone;
  hand: HandTone;
  flee: string[];
  afterYes: string;
  shayari: string;
}

const pick = <T extends string>(v: unknown, opts: readonly T[], fb: T): T => (typeof v === "string" && (opts as readonly string[]).includes(v) ? (v as T) : fb);
const first = (s: string) => (Array.from(s.trim())[0] ?? "").toUpperCase();

export const DEFAULT_REASONS = ["You make ordinary days feel like festivals.", "You remember the little things.", "My future just looks like you."];
export const DEFAULT_FLEE = ["Thinking is overrated", "Arre, pakka?", "The drones are watching 👀", "Ring's already out!"];

export function readSky(data: ValentineDayData): Sky {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const to = data.recipientName.trim() || "you";
  const from = data.senderName.trim() || "Someone";
  const texts = list(x.texts).slice(0, 3);
  const reasons = list(x.reasons).slice(0, 5);
  const rows = (Array.isArray(x.moments) ? x.moments : []).filter((m): m is Record<string, unknown> => !!m && typeof m === "object");
  const photos = (data.photos ?? []).filter((p) => p && p.url);
  const n = Math.min(6, Math.max(rows.length, photos.length));
  const memories = Array.from({ length: n }, (_, i) => ({
    when: str(rows[i]?.when),
    what: str(rows[i]?.what) || photos[i]?.caption?.trim() || "",
    photo: photos[i] ?? null,
  })).filter((m) => m.photo || m.what);
  const initials = str(x.initials) || [first(to), first(from)].filter(Boolean).join(" ♥ ");
  return {
    to,
    from,
    texts: texts.length ? texts : ["Hey. Are you free right now?", "Come up to the rooftop. Bring nothing. Just you."],
    reasons: reasons.length >= 3 ? reasons : [...reasons, ...DEFAULT_REASONS].slice(0, 3),
    memories,
    lookUp: str(x.lookUpLine) || "Now… look up.",
    initials,
    question: str(x.question) || `Will you marry me, ${to}?`,
    ring: pick(x.ringStyle, ["solitaire", "heart", "band", "halo"] as const, "solitaire"),
    stone: pick(x.stoneColor, ["diamond", "ruby", "sapphire", "emerald", "rosegold"] as const, "diamond"),
    hand: pick(x.handTone, ["light", "medium", "tan", "deep"] as const, "medium"),
    flee: list(x.noLines).length ? list(x.noLines) : DEFAULT_FLEE,
    afterYes: str(x.afterYes),
    shayari: str(x.shayari),
  };
}

/** A small deterministic PRNG (seeded skyline, stable on replay). */
export function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const STONE_HUE: Record<Stone, string> = { diamond: "#E8F4FF", ruby: "#FF3B5C", sapphire: "#5B8CFF", emerald: "#2FD39A", rosegold: "#F2A9B4" };
