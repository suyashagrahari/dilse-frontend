// Pure helpers for "The Premiere": read the extras defensively (old drafts, AI fills, hostile data).

import type { LovePhoto, ValentineDayData } from "../../../_valentine/types";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean) : []);

export interface Film {
  to: string;
  from: string;
  title: string;
  tagline: string;
  actOne: string;
  actTwo: string;
  soon: string[];
  question: string;
  noLines: string[];
  afterYes: string;
  credits: { role: string; name: string }[];
  location: string;
  photos: LovePhoto[];
  /** Act I, Act II, the yes reveal / poster. null = no photo at all (type-only fallback). */
  one: LovePhoto | null;
  two: LovePhoto | null;
  hero: LovePhoto | null;
  /** Trailer flashes (photos after the first two, else all of them). */
  trailer: LovePhoto[];
  heroIndex: number;
}

export const DEFAULT_NO = ["Cut! Take two?", "Wrong line, darling", "The crew is crying", "Please?"];

export function readFilm(data: ValentineDayData): Film {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const to = data.recipientName.trim() || "you";
  const from = data.senderName.trim() || "Someone";
  const photos = (data.photos ?? []).filter((p): p is LovePhoto => !!p && typeof p.url === "string" && !!p.url);
  const rows = (Array.isArray(x.credits) ? x.credits : []).filter((m): m is Record<string, unknown> => !!m && typeof m === "object");
  const credits = rows.map((r) => ({ role: str(r.role), name: str(r.name) })).filter((c) => c.role && c.name).slice(0, 5);
  const soon = list(x.comingSoon).slice(0, 3);
  const n = photos.length;
  const heroIndex = n ? n - 1 : 0;
  return {
    to,
    from,
    title: str(x.filmTitle) || `${to} & ${from}`,
    tagline: str(x.tagline),
    actOne: str(x.actOne) || photos[0]?.note?.trim() || photos[0]?.caption?.trim() || "And then you walked in.",
    actTwo: str(x.actTwo) || photos[1]?.note?.trim() || "That's when I knew.",
    soon: soon.length ? soon : ["Coming soon: us.", "Every day after this one."],
    question: str(x.question) || `Will you marry me, ${to}?`,
    noLines: list(x.noLines).length ? list(x.noLines).slice(0, 4) : DEFAULT_NO,
    afterYes: str(x.afterYes),
    credits,
    location: str(x.location),
    photos,
    one: photos[0] ?? null,
    two: photos[1] ?? photos[0] ?? null,
    hero: photos[heroIndex] ?? null,
    trailer: n > 2 ? photos.slice(2) : photos,
    heroIndex,
  };
}

/** "8 FEB 2027 · 9:41 PM" — the premiere's date stamp. */
export function stamp(d: Date): string {
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toUpperCase();
  return `${date} · ${time}`;
}
