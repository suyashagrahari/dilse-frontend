// ─── LoveFlix design tokens ──────────────────────────────────────────────────

import type { CSSProperties } from "react";
import { ACCENT, ACCENT_DEEP, BG, BG_CARD, BG_RAISED, MATCH_GREEN, TEXT, TEXT_DIM, TEXT_MUTED, type Crop } from "./types";

export { ACCENT, ACCENT_DEEP, BG, BG_CARD, BG_RAISED, MATCH_GREEN, TEXT, TEXT_DIM, TEXT_MUTED };

export const HAIRLINE = "rgba(255,255,255,0.1)";

/** Condensed display face for title treatments and numerals (root layout registers it). */
export const FONT_DISPLAY = "var(--font-oswald), 'Bebas Neue', 'Arial Narrow', sans-serif";
/** The streaming app's workhorse sans. */
export const FONT_BODY = "var(--font-inter), 'Helvetica Neue', Helvetica, Arial, sans-serif";
/** For the finale and letter-ish moments. */
export const FONT_SERIF = "var(--font-playfair), 'Instrument Serif', Georgia, serif";

export const Z = {
  nav: 40,
  preview: 50,
  modal: 60,
  letter: 70,
  player: 80,
  toast: 95,
  splash: 100,
} as const;

/** Same framing rule the editor's adjuster uses, so what they frame is what shows. */
export const cropStyle = (c: Crop): CSSProperties => ({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: `${c.x}% ${c.y}%`,
  transform: c.scale > 100 ? `scale(${c.scale / 100})` : undefined,
  transformOrigin: `${c.x}% ${c.y}%`,
  display: "block",
});

/** First grapheme, upper-cased. */
export const initialOf = (name: string, fallback = "♥"): string => {
  const t = (name || "").trim();
  return t ? Array.from(t)[0].toUpperCase() : fallback;
};

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
};

/** Duotones for generated "title art" — moody, cinematic, all warm-adjacent. */
const ART: [string, string, string][] = [
  ["#5a0a0e", "#160405", "#ff4a4f"],
  ["#2a1446", "#0d0717", "#b98cff"],
  ["#0f3440", "#06141a", "#5fd6e0"],
  ["#4a2a0c", "#170c04", "#ffb35c"],
  ["#12264d", "#070d1c", "#7fb1ff"],
  ["#3d0f3a", "#140512", "#ff7ad9"],
  ["#1d3a26", "#08140c", "#7ee0a1"],
  ["#4d1414", "#170606", "#ff7a6b"],
];

export interface ArtLook {
  bg: string;
  glow: string;
  font: "display" | "serif" | "sans";
}

/** Deterministic look for a generated card, from its title. */
export const artLook = (seed: string): ArtLook => {
  const h = hash(seed);
  const [a, b, glow] = ART[h % ART.length];
  const ang = 110 + (h % 70);
  const gx = 20 + ((h >> 3) % 60);
  const gy = 15 + ((h >> 7) % 50);
  const fonts: ArtLook["font"][] = ["display", "serif", "sans"];
  return {
    bg: `radial-gradient(90% 80% at ${gx}% ${gy}%, ${glow}33 0%, transparent 60%), linear-gradient(${ang}deg, ${a} 0%, ${b} 100%)`,
    glow,
    font: fonts[(h >> 11) % 3],
  };
};

export const fontFor = (f: ArtLook["font"]) => (f === "display" ? FONT_DISPLAY : f === "serif" ? FONT_SERIF : FONT_BODY);

/** "Oct 14" style label, `k` weeks from today. Stable within a day. */
export const soonDate = (k: number): { mon: string; day: string } => {
  const d = new Date();
  d.setDate(d.getDate() + 5 + k * 11);
  return {
    mon: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: String(d.getDate()),
  };
};

/** Minutes → "47m" / "1h 4m". */
export const fmtRuntime = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);

/** Split subtitles into captions: newline first, sentence breaks as a fallback. */
export const captionLines = (text: string): string[] => {
  const byLine = (text || "").split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  for (const line of byLine) {
    if (line.length <= 60) {
      out.push(line);
      continue;
    }
    const parts = line.match(/[^.!?…]+[.!?…]+["'”’)]*|[^.!?…]+$/g) ?? [line];
    for (const p of parts) if (p.trim()) out.push(p.trim());
  }
  return out.length ? out : ["…"];
};
