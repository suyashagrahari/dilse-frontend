// Pure helpers for "The Little Proposal": read the extras defensively (old v2 drafts, AI fills, hostile data).

import type { LovePhoto, ValentineDayData } from "../../../_valentine/types";
import { PROPOSAL_GIF_DEFAULTS } from "../../../_valentine/days/happy-propose-day-premium";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean) : []);

export interface StoryCard {
  when: string;
  what: string;
  photo: LovePhoto | null;
}

export interface Story {
  to: string;
  from: string;
  pet: string;
  teaser: string;
  cards: StoryCard[];
  rehearsal: string[];
  decoys: [string, string];
  stone: "diamond" | "ruby" | "rosegold";
  question: string;
  noLines: string[];
  afterYes: string;
  terms: string[];
  endLine: string;
  photos: LovePhoto[];
  /** The heart frame where the ring lands (the last photo). */
  hero: LovePhoto | null;
  heroIndex: number;
}

export const DEFAULT_NO = ["Let me think 🤔", "Are you sure?", "Pleeease 🥺", "ok fine YES?"];
const DEFAULT_REHEARSAL = ["Practised on my pillow. It said no.", "Knelt down. My knee made a noise.", "Dropped the ring. Twice.", "Okay. I think I'm ready. (I'm not.)"];
const DEFAULT_TERMS = ["Unlimited forehead kisses.", "The window seat is always yours.", "Snacks are shared. Mostly."];

export function readStory(data: ValentineDayData): Story {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const to = data.recipientName.trim() || "you";
  const from = data.senderName.trim() || "Someone";
  const photos = (data.photos ?? []).filter((p): p is LovePhoto => !!p && typeof p.url === "string" && !!p.url);
  const rows = (Array.isArray(x.moments) ? x.moments : []).filter((m): m is Record<string, unknown> => !!m && typeof m === "object");
  const n = photos.length;
  const heroIndex = n ? n - 1 : 0;
  // Story cards: one per moment, paired with the photos in order; without moments the photos' own captions lead.
  const storyPhotos = n > 1 ? photos.slice(0, Math.max(1, Math.min(4, n - 1))) : photos;
  let cards: StoryCard[] = rows
    .map((r, i) => ({ when: str(r.when), what: str(r.what), photo: storyPhotos[i] ?? storyPhotos[i % Math.max(1, storyPhotos.length)] ?? null }))
    .filter((c) => c.when || c.what)
    .slice(0, 4);
  if (!cards.length) cards = storyPhotos.slice(0, 3).map((p) => ({ when: p.caption?.trim() ?? "", what: p.note?.trim() ?? "", photo: p }));
  if (!cards.length) cards = [{ when: "how it started", what: `And then there was you, ${to}.`, photo: null }];
  const decoys = list(x.decoys);
  const stone = str(x.stoneColor);
  return {
    to,
    from,
    pet: (data.petName ?? "").trim(),
    teaser: str(x.teaser) || "Okay okay, I'm nervous. Don't laugh 🙈",
    cards,
    rehearsal: (list(x.rehearsal).length ? list(x.rehearsal) : DEFAULT_REHEARSAL).slice(0, 4),
    decoys: [decoys[0] || "A chocolate, because you deserve one anyway.", decoys[1] || "A teddy to hold until I get there."],
    stone: stone === "ruby" || stone === "rosegold" ? stone : "diamond",
    question: str(x.question) || `Will you be mine, ${to}?`,
    noLines: list(x.noLines).length ? list(x.noLines).slice(0, 5) : DEFAULT_NO,
    afterYes: str(x.afterYes),
    terms: (list(x.terms).length ? list(x.terms) : DEFAULT_TERMS).slice(0, 3),
    endLine: (data.endLine ?? "").trim(),
    photos,
    hero: photos[heroIndex] ?? null,
    heroIndex,
  };
}

/** A GIF slot's URL: the sender's own link, "none" (hidden), or our CDN default (never an empty string). */
export function gifFor(data: ValentineDayData, id: string): string {
  const v = (data.gifs?.[id] ?? "").trim();
  if (v === "none") return "none";
  if (/^https:\/\//i.test(v)) return v;
  return PROPOSAL_GIF_DEFAULTS[id] ?? "";
}

/** "8 Feb 2027" */
export function dateLine(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** The stone's paint: [face, deep, glint]. */
export const STONES: Record<Story["stone"], [string, string, string]> = {
  diamond: ["#E8F4FF", "#9CC9F5", "#FFFFFF"],
  ruby: ["#FF4D6D", "#B0123A", "#FFD1DC"],
  rosegold: ["#F6B7A8", "#D07F70", "#FFF0EA"],
};
