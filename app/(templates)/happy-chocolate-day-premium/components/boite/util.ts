// Pure helpers for "La Boîte": read the page defensively, the box colourways, and the pieces (photo + flavour).

import type { LovePhoto } from "../../../_love/types";
import type { ValentineDayData } from "../../../_valentine/types";
import { HOUSE_FLAVOURS, type BoxColor } from "../../../_valentine/days/happy-chocolate-day-premium";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Lid (hi, base, deep), ribbon (hi, base, deep), foil (light, mid, dark) and the small ink printed on the lid. */
export interface Colorway {
  lid: [string, string, string];
  ribbon: [string, string, string];
  foil: [string, string, string];
  ink: string;
  /** rgb triple for halos / glow */
  glow: string;
  light: boolean;
}

export const COLORWAYS: Record<BoxColor, Colorway> = {
  cacao: { lid: ["#4A2A1F", "#2A1712", "#160B08"], ribbon: ["#D9566E", "#B0324B", "#6E1528"], foil: ["#FFF1C9", "#C9A45C", "#7A5A22"], ink: "rgba(243,230,211,.62)", glow: "201,164,92", light: false },
  raspberry: { lid: ["#9E3046", "#7E1F33", "#4A0E1C"], ribbon: ["#F1DCA6", "#C9A45C", "#7A5A22"], foil: ["#FFF1C9", "#D9B56A", "#8A6A2F"], ink: "rgba(250,232,220,.66)", glow: "214,90,110", light: false },
  midnight: { lid: ["#2A3150", "#151A2E", "#0A0C18"], ribbon: ["#F1DCA6", "#C9A45C", "#7A5A22"], foil: ["#FFF1C9", "#C9A45C", "#7A5A22"], ink: "rgba(228,224,240,.6)", glow: "150,160,230", light: false },
  ivory: { lid: ["#FBF4E8", "#EFE4D2", "#D8C8AE"], ribbon: ["#7A4A36", "#4A2A1F", "#2A1712"], foil: ["#F6DFA0", "#B08A42", "#6E5020"], ink: "rgba(74,42,31,.62)", glow: "230,200,150", light: true },
};

export interface Piece {
  /** Index in data.photos, or −1 for a plain bonbon (no photo). */
  index: number;
  photo: LovePhoto | null;
  flavour: string;
  caption: string;
  note: string;
}

export interface Boite {
  to: string;
  from: string;
  house: string;
  monogram: [string, string];
  opening: string;
  boxLine: string;
  heartLine: string;
  since: string;
  signOff: string;
  color: BoxColor;
  cw: Colorway;
  photos: LovePhoto[];
  pieces: Piece[];
  /** The heart's photo: the last photo after the box's nine, else the first. */
  heartPhoto: LovePhoto | null;
}

const COLORS: BoxColor[] = ["cacao", "raspberry", "midnight", "ivory"];
const initial = (s: string) => (Array.from(s.trim())[0] ?? "").toUpperCase();

export function readBoite(data: ValentineDayData): Boite {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const color = COLORS.includes(x.boxColor as BoxColor) ? (x.boxColor as BoxColor) : "cacao";
  const to = data.recipientName.trim() || "you";
  const from = data.senderName.trim() || "Someone";
  const photos = (data.photos ?? []).filter((p) => p && typeof p.url === "string" && p.url).slice(0, 12);
  const names = (Array.isArray(x.flavours) ? x.flavours : []).map((f) => (f && typeof f === "object" ? str((f as { name?: unknown }).name) : str(f)));
  const n = photos.length ? Math.min(9, photos.length) : 9;
  const pieces: Piece[] = Array.from({ length: n }, (_, i) => {
    const photo = photos[i] ?? null;
    return { index: photo ? i : -1, photo, flavour: names[i] || HOUSE_FLAVOURS[i % HOUSE_FLAVOURS.length], caption: str(photo?.caption), note: str(photo?.note) };
  });
  return {
    to,
    from,
    house: str(x.houseName) || `Maison ${from}`,
    monogram: [initial(to) || "Y", initial(from) || "M"],
    opening: str(x.openingLine) || "Made by hand. For one person.",
    boxLine: str(x.boxLine) || "Every piece is a day with you.",
    heartLine: str(x.heartLine) || "I saved the last piece for you.",
    since: str(x.sinceDate),
    signOff: str(x.signOff),
    color,
    cw: COLORWAYS[color],
    photos,
    pieces,
    heartPhoto: photos.length > 9 ? photos[9] : (photos[0] ?? null),
  };
}

/** Columns × rows of the tray: a box of 1, 2, 3, 4 (2×2), 6 (3×2) or 9 (3×3). Empty cups fill the rest. */
export function trayGrid(n: number): { cols: number; rows: number } {
  if (n <= 3) return { cols: Math.max(1, n), rows: 1 };
  if (n === 4) return { cols: 2, rows: 2 };
  if (n <= 6) return { cols: 3, rows: 2 };
  return { cols: 3, rows: 3 };
}

/** Paragraphs of the letter (blank-line separated; single newlines stay inside a paragraph). */
export function paragraphs(s: string): string[] {
  return s
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
