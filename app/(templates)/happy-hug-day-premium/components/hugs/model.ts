// The hug's data, made safe (every extra falls back), plus the palette.

import type { HugExtrasPremium } from "../../../_valentine/days/happy-hug-day-premium";
import type { ValentineDayData } from "../../../_valentine/types";

export const HG = {
  frost: "#DCE8F2",
  night: "#1B2340",
  ember: "#FF8A3D",
  magenta: "#D9367A",
  gold: "#FFE08A",
  wool: "#F4EBDD",
  cocoa: "#4A2C2A",
} as const;

export const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const num = (v: unknown, lo: number, hi: number, d: number) => {
  const n = typeof v === "number" && Number.isFinite(v) ? v : d;
  return Math.max(lo, Math.min(hi, Math.round(n)));
};

const DEFAULT_LINES = ["Breathe. I've got you.", "I'm not letting go yet.", "Stay."];
const DEFAULT_MITTENS = [
  { when: "For a long day", note: "Shoes off. Kettle on. I'm proud of you." },
  { when: "For when you miss me", note: "Close your eyes. That's my arms around you." },
  { when: "For a bad night", note: "Call me. I'll stay on till you fall asleep." },
];

export interface Hug {
  recipient: string;
  sender: string;
  frostLine: string;
  km: number;
  hold: number;
  bpm: number;
  lines: string[];
  mittens: { when: string; note: string }[];
  passes: { title: string; detail: string }[];
  tag: string;
  reply: string;
}

export function readHug(data: ValentineDayData): Hug {
  const x = (data.extras ?? {}) as Partial<HugExtrasPremium>;
  const lines = (Array.isArray(x.hugLines) ? x.hugLines : []).map(clean).filter(Boolean).slice(0, 5);
  const mittens = (Array.isArray(x.weatherHugs) ? x.weatherHugs : []).map((m) => ({ when: clean(m?.when), note: clean(m?.note) })).filter((m) => m.when || m.note).slice(0, 6);
  const passes = (Array.isArray(x.coupons) ? x.coupons : []).map((c) => ({ title: clean(c?.title), detail: clean(c?.detail) })).filter((c) => c.title).slice(0, 4);
  return {
    recipient: clean(data.recipientName) || "You",
    sender: clean(data.senderName) || "Someone",
    frostLine: clean(x.frostLine) || "Come here, you.",
    km: num(x.distanceKm, 0, 20000, 860),
    hold: num(x.holdSeconds, 10, 30, 20),
    bpm: num(x.heartbeatBpm, 50, 90, 64),
    lines: lines.length ? lines : DEFAULT_LINES,
    mittens: mittens.length >= 3 ? mittens : [...mittens, ...DEFAULT_MITTENS].slice(0, Math.max(3, mittens.length)),
    passes,
    tag: clean(x.hoodieTag) || "Property of us",
    reply: clean(x.replyLine),
  };
}

/** The thermal palette: indigo → violet → magenta → orange → white-gold (256 RGB triples). */
export function thermalLut(): Uint8ClampedArray {
  const stops: [number, [number, number, number]][] = [
    [0, [18, 22, 52]],
    [0.25, [70, 30, 120]],
    [0.5, [217, 54, 122]],
    [0.75, [255, 138, 61]],
    [1, [255, 236, 170]],
  ];
  const out = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let k = 0;
    while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
    const [t0, c0] = stops[k];
    const [t1, c1] = stops[k + 1];
    const u = (t - t0) / (t1 - t0);
    for (let j = 0; j < 3; j++) out[i * 3 + j] = c0[j] + (c1[j] - c0[j]) * u;
  }
  return out;
}

export const initialOf = (s: string) => Array.from(s.trim())[0]?.toLocaleUpperCase() ?? "";
