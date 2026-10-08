// Pure helpers for "The Glasshouse Rose": read the extras defensively, rose colours and meanings, garden layouts.

import type { ValentineDayData } from "../../../_valentine/types";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export type RoseColor = "red" | "pink" | "lavender" | "peach" | "white" | "yellow" | "orange" | "coral";

export const SHADES: Record<RoseColor, { base: string; dark: string; light: string; hi: string; glow: string }> = {
  red: { base: "#C8102E", dark: "#6E0716", light: "#E8394F", hi: "#FF8FA0", glow: "255,80,100" },
  pink: { base: "#EC7FA6", dark: "#A3355F", light: "#F6A7C3", hi: "#FFD6E5", glow: "255,150,190" },
  lavender: { base: "#A98BD6", dark: "#5E3F94", light: "#C9B3EC", hi: "#EADFFF", glow: "190,160,255" },
  peach: { base: "#F7A77E", dark: "#B9603A", light: "#FFC4A4", hi: "#FFE6D6", glow: "255,180,140" },
  white: { base: "#F3E9DD", dark: "#B7A08A", light: "#FFF8F0", hi: "#FFFFFF", glow: "255,245,225" },
  yellow: { base: "#F6C93E", dark: "#A97F06", light: "#FFDF7E", hi: "#FFF3C2", glow: "255,215,110" },
  orange: { base: "#F57A3C", dark: "#A8400F", light: "#FF9F6E", hi: "#FFD0B3", glow: "255,150,90" },
  coral: { base: "#F46F60", dark: "#A63A2E", light: "#FF968A", hi: "#FFD1CB", glow: "255,130,120" },
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

export const COUNT_MEANING: Record<string, string> = {
  "1": "One rose. You are the one.",
  "3": "Three roses. I love you.",
  "7": "Seven roses. I'm falling for you.",
  "9": "Nine roses. We belong together.",
  "11": "Eleven roses. You are my everything.",
  "12": "Twelve roses. Be mine.",
  "99": "Ninety-nine roses. I will love you forever.",
};

export interface Glass {
  to: string;
  from: string;
  color: RoseColor;
  colorReason: string;
  count: number;
  opening: string;
  thorns: string[];
  words: string[];
  since: string;
  engraving: string;
  secret: string;
  signOff: string;
  shayari: string;
}

const COLORS: RoseColor[] = ["red", "pink", "lavender", "peach", "white", "yellow", "orange", "coral"];
const COUNTS = [1, 3, 7, 9, 11, 12, 99];

/** ≤ 7 petals: extra words merge into the last one. */
export function petalWords(s: string): string[] {
  const w = s.split(/\s+/).filter(Boolean);
  if (w.length <= 7) return w;
  return [...w.slice(0, 6), w.slice(6).join(" ")];
}

export function readGlass(data: ValentineDayData): Glass {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const color = COLORS.includes(x.roseColor as RoseColor) ? (x.roseColor as RoseColor) : "red";
  const n = Number(x.roseCount);
  const thorns = (Array.isArray(x.thorns) ? x.thorns : []).map((t) => str(t)).filter(Boolean).slice(0, 5);
  const sentence = str(x.petalSentence) || "You are my favourite thing that grows.";
  return {
    to: data.recipientName.trim() || "you",
    from: data.senderName.trim() || "Someone",
    color,
    colorReason: str(x.colorReason),
    count: COUNTS.includes(n) ? n : 1,
    opening: str(x.openingLine) || "Someone has been growing something for you.",
    thorns,
    words: petalWords(sentence),
    since: str(x.sinceDate),
    engraving: str(x.engraving),
    secret: str(x.secretLine),
    signOff: str(x.signOff),
    shayari: str(x.shayari),
  };
}

/** Garden layout: points in a unit box (−1…1), sorted by distance from the centre (the wave's order). */
export function gardenLayout(count: number): { x: number; y: number; s: number; d: number }[] {
  const heart = (t: number) => ({ x: (16 * Math.pow(Math.sin(t), 3)) / 17, y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17 });
  let pts: { x: number; y: number; s: number }[] = [];
  if (count === 1) pts = [];
  else if (count === 3) pts = [{ x: -0.42, y: 0.18, s: 0.34 }, { x: 0.42, y: 0.18, s: 0.34 }, { x: 0, y: -0.42, s: 0.34 }];
  else if (count <= 12) {
    pts = Array.from({ length: count }, (_, i) => {
      const p = heart((i / count) * Math.PI * 2 + 0.0001);
      return { x: p.x, y: p.y + 0.06, s: count > 9 ? 0.2 : 0.23 };
    });
  } else {
    // a filled heart: find the staggered-grid pitch that puts ~`count` points inside the heart, take them all
    const inside = (x: number, y: number) => {
      const X = x * 1.15;
      const Y = -y * 1.15 + 0.15;
      const a = X * X + Y * Y - 1;
      return a * a * a - X * X * Y * Y * Y < 0;
    };
    const grid = (sp: number) => {
      const out: { x: number; y: number }[] = [];
      const rh = sp * 0.88;
      let row = 0;
      for (let gy = -1.05; gy <= 1.1; gy += rh, row++) for (let gx = -1.1; gx <= 1.1; gx += sp) {
        const x = gx + (row % 2 ? sp / 2 : 0);
        if (inside(x, gy)) out.push({ x, y: gy });
      }
      return out;
    };
    let lo = 0.05;
    let hi = 0.6;
    let best = grid(0.2);
    for (let it = 0; it < 22; it++) {
      const mid = (lo + hi) / 2;
      const g = grid(mid);
      if (g.length > count) lo = mid;
      else hi = mid;
      if (Math.abs(g.length - count) < Math.abs(best.length - count) || (g.length >= count && best.length < count)) best = g;
    }
    const sp = (lo + hi) / 2;
    const chosen = best.length > count ? Array.from({ length: count }, (_, k) => best[Math.floor((k * best.length) / count)]) : best;
    pts = chosen.map((p) => ({ ...p, s: sp * 0.66 }));
  }
  return pts.map((p) => ({ ...p, d: Math.hypot(p.x, p.y) })).sort((a, b) => a.d - b.d);
}
