// Pure helpers for "The Bloom of Us": read the page defensively, rose shades + meanings, and the rose's geometry.

import type { LovePhoto } from "../../../_love/types";
import type { ValentineDayData } from "../../../_valentine/types";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export type RoseColor = "red" | "pink" | "lavender" | "peach" | "white" | "yellow" | "orange" | "coral";

/** Velvet shades per rose colour: deep (shadow in the cup), base, light (rim), glow (rgb triple for halos). */
export const SHADES: Record<RoseColor, { deep: string; base: string; light: string; glow: string; name: string }> = {
  red: { deep: "#3F0611", base: "#8E1426", light: "#D2425A", glow: "220,60,85", name: "A red rose" },
  pink: { deep: "#5C1532", base: "#C24E7C", light: "#F2A3C0", glow: "240,140,180", name: "A pink rose" },
  lavender: { deep: "#2E1E52", base: "#7D62B4", light: "#C9B6EE", glow: "180,150,240", name: "A lavender rose" },
  peach: { deep: "#6A2E16", base: "#D9825A", light: "#FFC9A8", glow: "255,170,130", name: "A peach rose" },
  white: { deep: "#6E6156", base: "#D9CDBF", light: "#FFF9F1", glow: "255,240,220", name: "A white rose" },
  yellow: { deep: "#6A4A05", base: "#D9A81F", light: "#FFE08A", glow: "255,210,100", name: "A yellow rose" },
  orange: { deep: "#6A2306", base: "#D9622A", light: "#FFAA78", glow: "255,140,80", name: "An orange rose" },
  coral: { deep: "#6A1E18", base: "#D9574B", light: "#FFA59B", glow: "255,120,110", name: "A coral rose" },
};

export const COLOR_MEANING: Record<RoseColor, string> = {
  red: "I love you, truly, madly, deeply.",
  pink: "You're the sweetest thing in my world.",
  lavender: "I think I fell for you at first sight.",
  peach: "Thank you for being you, and for choosing me.",
  white: "A new beginning, with you.",
  yellow: "My best friend, and so much more.",
  orange: "You make every day exciting.",
  coral: "So proud of you, always.",
};

export interface Bloom {
  to: string;
  from: string;
  color: RoseColor;
  colorReason: string;
  opening: string;
  bloomLine: string;
  since: string;
  signOff: string;
  shayari: string;
  photos: LovePhoto[];
}

const COLORS: RoseColor[] = ["red", "pink", "lavender", "peach", "white", "yellow", "orange", "coral"];

export function readBloom(data: ValentineDayData): Bloom {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const color = COLORS.includes(x.roseColor as RoseColor) ? (x.roseColor as RoseColor) : "red";
  return {
    to: data.recipientName.trim() || "you",
    from: data.senderName.trim() || "Someone",
    color,
    colorReason: str(x.colorReason),
    opening: str(x.openingLine) || "Some things take time to open.",
    bloomLine: str(x.bloomLine) || "Every petal is a day with you.",
    since: str(x.sinceDate),
    signOff: str(x.signOff),
    shayari: str(x.shayari),
    photos: (data.photos ?? []).filter((p) => p && typeof p.url === "string" && p.url).slice(0, 12),
  };
}

// ─── The rose ────────────────────────────────────────────────────────────────
//
// Three rings of photo petals around a velvet core. Sizes are in px for a ~360 px flower (the scene scales it).
// `closed` and `open` are the petal's tilt out of the flower's plane in degrees: −90 stands it straight up, beyond
// −90 leans it inward (a bud), 0 lays it flat (a fully open petal). Outer rings open first, like a real rose.

export interface PetalSpec {
  key: string;
  ring: 0 | 1 | 2 | 3;
  angle: number;
  w: number;
  h: number;
  r0: number;
  closed: number;
  open: number;
  delay: number;
  /** Index into the photos, or −1 for a velvet-only core petal. */
  photo: number;
}

const RINGS = [
  // ring 3 = outer … ring 0 = the velvet core
  { ring: 3 as const, n: 6, w: 142, h: 164, r0: 30, closed: -86, open: -11, off: 0, delay: 0 },
  { ring: 2 as const, n: 4, w: 116, h: 132, r0: 18, closed: -97, open: -38, off: 45, delay: 0.32 },
  { ring: 1 as const, n: 3, w: 86, h: 100, r0: 8, closed: -106, open: -46, off: 20, delay: 0.62 },
  { ring: 0 as const, n: 3, w: 50, h: 64, r0: 0, closed: -110, open: -94, off: 75, delay: 0.9 },
];

/** 13 photo petals + 3 core petals. Photos repeat (offset per ring) when there are fewer than 12. */
export function roseLayout(photoCount: number): PetalSpec[] {
  const out: PetalSpec[] = [];
  let k = 0;
  for (const r of RINGS) {
    for (let i = 0; i < r.n; i++) {
      const photo = r.ring === 0 || photoCount === 0 ? -1 : k++ % photoCount;
      out.push({ key: `${r.ring}-${i}`, ring: r.ring, angle: r.off + (360 / r.n) * i, w: r.w, h: r.h, r0: r.r0, closed: r.closed, open: r.open, delay: r.delay, photo });
    }
  }
  return out;
}

/** The first `n` photos with something to say (caption or note) first; the pressed pages. */
export function pressedPhotos(photos: LovePhoto[], n = 3): { photo: LovePhoto; index: number }[] {
  const all = photos.map((photo, index) => ({ photo, index }));
  return all.slice(0, n);
}

/** Paragraphs of the letter (blank-line separated; single newlines stay inside a paragraph). */
export function paragraphs(s: string): string[] {
  return s
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
