// ─── The snap-app skin ───────────────────────────────────────────────────────
//
// Everything the parody camera-chat app shows that is NOT the check-in ledger:
// usernames, avatar presets, zodiac charms, the map spot, the lines the sender
// "saved in chat", the memories and the main letter. Stored flat on the page
// next to the ledger fields; every key is optional on the wire so pages
// published before the skin existed open with sensible defaults.

import { strList, strOr } from "@/lib/wire";
import { DEMO_PHOTOS, parseLovePhotos, type LovePhoto } from "../../_love/types";
import type { StreakData } from "./types";
import { makeDemoData } from "./demoData";

export interface SnapSkin {
  handleA: string;
  handleB: string;
  avatarA: string;
  avatarB: string;
  zodiacA: string;
  zodiacB: string;
  mapPlace: string;
  /** Lines the sender saved in chat — they "type" in the first time chat opens. */
  chats: string[];
  photos: LovePhoto[];
  letter: string;
  lockQuestion: string;
  lockAnswer: string;
}

/** The ledger plus the skin: what the editor holds and the server stores. */
export type StreakPageData = StreakData & SnapSkin;

export const SKIN_LIMITS = {
  handle: 40,
  place: 60,
  chatLine: 200,
  maxChats: 8,
  letter: 2000,
  lockQuestion: 140,
  lockAnswer: 40,
} as const;

// ─── Avatars ────────────────────────────────────────────────────────────────
// Drawn, not uploaded: a cartoon head is the whole charm of the real app's
// avatars, and it means the only photos in the form are the memories.

export interface AvatarPreset {
  id: string;
  skin: string;
  hair: string;
  /** Hair silhouette. */
  style: "bob" | "long" | "bun" | "short" | "curly" | "wavy";
  /** Background of the avatar circle. */
  bg: string;
  /** Top colour for the shoulders. */
  top: string;
}

export const AVATARS: AvatarPreset[] = [
  { id: "a1", skin: "#F2C9A5", hair: "#2B1B14", style: "long", bg: "#FFE3EC", top: "#FF6FA3" },
  { id: "a2", skin: "#D9A07A", hair: "#1C1210", style: "short", bg: "#DDF2FF", top: "#3A8DFF" },
  { id: "a3", skin: "#F6D5BD", hair: "#6B3B22", style: "bun", bg: "#FFF3C4", top: "#FFB020" },
  { id: "a4", skin: "#B97C57", hair: "#120B08", style: "curly", bg: "#E4F8E9", top: "#23B26D" },
  { id: "a5", skin: "#EBB894", hair: "#3A2418", style: "bob", bg: "#EEE5FF", top: "#8B5CF6" },
  { id: "a6", skin: "#C98E68", hair: "#241612", style: "wavy", bg: "#FFE7DA", top: "#FF7A45" },
  { id: "a7", skin: "#F3CFB3", hair: "#C9853A", style: "wavy", bg: "#E3F4FF", top: "#14B8C4" },
  { id: "a8", skin: "#8D5B3E", hair: "#0E0907", style: "short", bg: "#FFE9F4", top: "#E0457B" },
];

export const avatarOf = (id: string, fallback: "a" | "b"): AvatarPreset =>
  AVATARS.find((a) => a.id === id) ?? AVATARS[fallback === "a" ? 0 : 1];

// ─── Zodiac ─────────────────────────────────────────────────────────────────

export const ZODIAC: { id: string; name: string; glyph: string }[] = [
  { id: "aries", name: "Aries", glyph: "♈" },
  { id: "taurus", name: "Taurus", glyph: "♉" },
  { id: "gemini", name: "Gemini", glyph: "♊" },
  { id: "cancer", name: "Cancer", glyph: "♋" },
  { id: "leo", name: "Leo", glyph: "♌" },
  { id: "virgo", name: "Virgo", glyph: "♍" },
  { id: "libra", name: "Libra", glyph: "♎" },
  { id: "scorpio", name: "Scorpio", glyph: "♏" },
  { id: "sagittarius", name: "Sagittarius", glyph: "♐" },
  { id: "capricorn", name: "Capricorn", glyph: "♑" },
  { id: "aquarius", name: "Aquarius", glyph: "♒" },
  { id: "pisces", name: "Pisces", glyph: "♓" },
];
export const ZODIAC_IDS = ZODIAC.map((z) => z.id);
export const zodiacOf = (id: string) => ZODIAC.find((z) => z.id === id.toLowerCase().trim()) ?? null;

// ─── The best-friend ladder ─────────────────────────────────────────────────
// 💛 from day one, ❤️ at a month, 💕 at a hundred — always on the RECORD, so a
// pause never takes a heart away.

export function bestFriendEmoji(record: number): { emoji: string; label: string } {
  if (record >= 100) return { emoji: "💕", label: "Super BFF" };
  if (record >= 30) return { emoji: "❤️", label: "BFF" };
  return { emoji: "💛", label: "Best Friends" };
}

/** The celebration rungs. */
export const CELEBRATE_AT = [3, 7, 14, 30, 50, 100, 150, 200, 365, 500, 1000];

export function milestoneLine(n: number): string | null {
  switch (n) {
    case 3: return "the streak is officially a thing 🔥";
    case 7: return "one whole week of us 🔥";
    case 14: return "two weeks. they're obsessed (you) 💛";
    case 30: return "a month! ❤️ BFF unlocked";
    case 50: return "fifty days of snapping each other 🫶";
    case 100: return "💯 days. Super BFF 💕 unlocked";
    case 150: return "150 — this is a lifestyle now";
    case 200: return "200 days. certified inseparable";
    case 365: return "a whole year of us 🎂🔥";
    case 500: return "500. legends only";
    case 1000: return "1000 days. marry them. (again?)";
    default: return null;
  }
}

// ─── Defaults & demo ────────────────────────────────────────────────────────

export const DEMO_SKIN: SnapSkin = {
  handleA: "ananya.bby",
  handleB: "rohan_irl",
  avatarA: "a1",
  avatarB: "a2",
  zodiacA: "leo",
  zodiacB: "pisces",
  mapPlace: "our chai tapri",
  chats: [
    "ok but why do i check this app before brushing my teeth 😭",
    "saving this so future us remembers: you ate my last momo and said 'sharing is caring'",
    "3 am thought: i'd pick you in every timeline 💛",
  ],
  photos: DEMO_PHOTOS.map((p) => ({ ...p })),
  letter:
    "Rohan,\n\nI know, I know. I'm the one who laughed at streaks. Said they were for thirteen-year-olds and people with no life. And now I'm up at 11:58 pm making sure the fire doesn't go out because apparently I'm that girl now.\n\nBut here's the thing nobody tells you: the streak was never about the snaps. It's that every single day, no matter how bad or boring or busy it got, there was this one tiny moment where you thought of me. A blurry ceiling. Your chai. Half your face at 7 am. I've kept all of them.\n\nYou're my first snap in the morning and my last one at night, and somewhere in between you became my favourite person.\n\nSo don't let the fire go out, okay? Not because of the number. Because I like being the person you think of first.",
  lockQuestion: "are you going to snap me back today?",
  lockAnswer: "obviously 🔥",
};

/** What a page written before the skin existed gets. Nothing borrowed from the demo that names anyone. */
export const EMPTY_SKIN: SnapSkin = {
  handleA: "",
  handleB: "",
  avatarA: "a1",
  avatarB: "a2",
  zodiacA: "",
  zodiacB: "",
  mapPlace: "",
  chats: [],
  photos: [],
  letter: "",
  lockQuestion: "",
  lockAnswer: "",
};

/** Skin off the wire. Every field optional; old pages get EMPTY_SKIN values. */
export function parseSkin(raw: Record<string, unknown> | null | undefined): SnapSkin {
  const root = (raw ?? {}) as Record<string, unknown>;
  const nested = (root.pageData && typeof root.pageData === "object" ? root.pageData : {}) as Record<string, unknown>;
  const p: Record<string, unknown> = { ...nested, ...root };
  const s = (k: string, max: number) => strOr(p[k], "").slice(0, max).trim();
  return {
    handleA: s("handleA", SKIN_LIMITS.handle),
    handleB: s("handleB", SKIN_LIMITS.handle),
    avatarA: s("avatarA", 24) || "a1",
    avatarB: s("avatarB", 24) || "a2",
    zodiacA: s("zodiacA", 24),
    zodiacB: s("zodiacB", 24),
    mapPlace: s("mapPlace", SKIN_LIMITS.place),
    chats: strList(p.chats, [])
      .map((l) => l.slice(0, SKIN_LIMITS.chatLine).trim())
      .filter(Boolean)
      .slice(0, SKIN_LIMITS.maxChats),
    photos: parseLovePhotos(p.photos, []),
    letter: strOr(p.letter, "").slice(0, SKIN_LIMITS.letter),
    lockQuestion: s("lockQuestion", SKIN_LIMITS.lockQuestion),
    lockAnswer: s("lockAnswer", SKIN_LIMITS.lockAnswer),
  };
}

/** "@ananya.bby" — derived from the name when the sender left it blank. */
export function handleFor(handle: string, name: string): string {
  const h = handle.trim().replace(/^@/, "");
  if (h) return h;
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 16);
  return base ? `${base}_xo` : "bestie";
}

// ─── The demo page ──────────────────────────────────────────────────────────


/** The gallery demo: 90 days in, the sender already snapped today. */
export function makeDemoPage(): StreakPageData {
  return { ...makeDemoData(), ...DEMO_SKIN, photos: DEMO_SKIN.photos.map((p) => ({ ...p })) };
}
