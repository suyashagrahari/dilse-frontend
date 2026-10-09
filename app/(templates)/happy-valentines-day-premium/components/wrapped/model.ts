// Pure helpers for "Us, Wrapped": read the extras defensively, the palette, date maths.

import type { LovePhoto } from "../../../_love/types";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { suggestionFor } from "../../../_valentine/music/youtube";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean) : []);

// ─── Palette: each slide owns one background (research §D.8) ──────────────────
export const C = {
  tomato: "#FF4B3E",
  pink: "#FF7AB6",
  ink: "#151018",
  butter: "#FFE7A3",
  lilac: "#B9A7FF",
  cream: "#FFF4D6",
} as const;

export interface Swatch {
  bg: string;
  ink: string;
  accent: string;
  /** ShaderBackdrop velvet [deep, mid, highlight]. */
  silk: [string, string, string];
}

export const SW: Record<"tomato" | "pink" | "ink" | "butter" | "lilac", Swatch> = {
  tomato: { bg: C.tomato, ink: C.ink, accent: C.butter, silk: ["#ec3d2f", "#ff4b3e", "#ff8576"] },
  pink: { bg: C.pink, ink: C.ink, accent: C.butter, silk: ["#f56aa9", "#ff7ab6", "#ffaed2"] },
  ink: { bg: C.ink, ink: "#FFF6E8", accent: C.pink, silk: ["#0a070d", "#1d1524", "#55304f"] },
  butter: { bg: C.butter, ink: C.ink, accent: C.tomato, silk: ["#fadb8c", "#ffe7a3", "#fff2cc"] },
  lilac: { bg: C.lilac, ink: C.ink, accent: C.tomato, silk: ["#a995fb", "#b9a7ff", "#d6ccff"] },
};

export interface Wrapped {
  to: string;
  from: string;
  pet: string;
  year: number;
  since: Date | null;
  song: { title: string; artist: string } | null;
  songNote: string;
  phrase: string;
  place: string;
  stats: { label: string; value: string }[];
  trait: string;
  reasons: string[];
  question: string;
  noLines: string[];
  datePlan: string;
  endLine: string;
  photos: LovePhoto[];
}

export function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isFinite(d.getTime()) && d.getTime() <= Date.now() + 864e5 ? d : null;
}

/** The year being wrapped: Jan–May looks back at last year (a Feb 14 page wraps the year before it). */
export const wrappedYear = (now = new Date()) => (now.getMonth() < 5 ? now.getFullYear() - 1 : now.getFullYear());

/** "John Legend - All of Me (Official Video)" → { title: "All of Me", artist: "John Legend" } */
export function cleanTitle(raw: string): { title: string; artist: string } {
  const t = raw.replace(/\s*[([【][^)\]】]*[)\]】]/g, "").replace(/\s*\|.*$/, "").replace(/\s+(ft|feat)\.?\s.*$/i, "").trim();
  const parts = t.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(" – ").trim() };
  return { title: t, artist: "" };
}

export function readWrapped(day: DayConfig, data: ValentineDayData, ytTitle?: string | null): Wrapped {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const to = data.recipientName.trim() || "you";
  const from = data.senderName.trim() || "me";
  const stats = (Array.isArray(x.stats) ? x.stats : [])
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({ label: str(s.label), value: str(s.value) }))
    .filter((s) => s.label && s.value)
    .slice(0, 2);
  let song: Wrapped["song"] = null;
  if (data.musicMode === "youtube" && data.musicYoutubeId) {
    const known = suggestionFor(data.musicYoutubeId, day.music?.suggestions);
    if (known) song = { title: known.title, artist: known.artist };
    else if (ytTitle) song = cleanTitle(ytTitle);
  }
  return {
    to,
    from,
    pet: data.petName.trim(),
    year: wrappedYear(),
    since: parseDate(str(x.togetherSince)),
    song,
    songNote: str(x.songNote),
    phrase: str(x.topPhrase),
    place: str(x.topPlace),
    stats,
    trait: str(x.topTrait),
    reasons: list(x.reasons).slice(0, 5),
    question: str(x.question) || "Another year of us. Be my Valentine?",
    noLines: list(x.noLines).slice(0, 4),
    datePlan: str(x.datePlan),
    endLine: data.endLine.trim(),
    photos: (data.photos ?? []).filter((p) => p && p.url),
  };
}

/** Whole days between `since` and now (local midnights). */
export const daysSince = (since: Date, now = new Date()) => Math.max(0, Math.floor((now.getTime() - since.getTime()) / 864e5));

export const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

/** Photo i, cycling through what exists (null when there are none). */
export const pick = (photos: LovePhoto[], i: number): LovePhoto | null => (photos.length ? photos[i % photos.length] : null);

/** The three top memories, #1 first: photos 2–4, falling back to whatever exists. */
export function topMemories(photos: LovePhoto[]): LovePhoto[] {
  if (photos.length <= 1) return photos.slice(0, 1);
  const rest = photos.slice(1, 4);
  return rest.length >= 3 ? rest : [...rest, ...photos.slice(0, 3 - rest.length)].slice(0, 3);
}

/** One photo per reason: photos 5+ first, then the others. */
export function reasonPhotos(photos: LovePhoto[], n: number): (LovePhoto | null)[] {
  const order = [...photos.slice(4), ...photos.slice(1, 4), ...photos.slice(0, 1)];
  return Array.from({ length: n }, (_, i) => (order.length ? order[i % order.length] : null));
}
