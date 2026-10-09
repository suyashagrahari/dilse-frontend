// The deed's data, made safe (every extra falls back), plus the palette.

import { promiseDayPremium, type PromiseExtrasPremium, type WaxColour } from "../../../_valentine/days/happy-promise-day-premium";
import type { LovePhoto, ValentineDayData } from "../../../_valentine/types";

/** research.md §D.5 palette. */
export const SP = {
  ivory: "#F5EFE2",
  paper2: "#EDE3CF",
  navy: "#1C2541",
  oxblood: "#6E1423",
  gold: "#B8964B",
  graphite: "#3A3A3A",
  desk: "#140c08",
  notary: "#A3283C",
} as const;

export const WAX: Record<WaxColour, { name: string; c: string; hi: string; lo: string }> = {
  oxblood: { name: "Oxblood", c: "#6E1423", hi: "#B23A4E", lo: "#3A0710" },
  midnight: { name: "Midnight", c: "#1C2541", hi: "#46598F", lo: "#0A0F22" },
  forest: { name: "Forest", c: "#1F4D3A", hi: "#4A8A6B", lo: "#0B2519" },
  blush: { name: "Blush", c: "#B5566A", hi: "#E08B9C", lo: "#6A2333" },
};
const WAX_KEYS = Object.keys(WAX) as WaxColour[];

export const clean = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
const demo = promiseDayPremium.demo.extras;

export interface Deed {
  recipient: string;
  sender: string;
  envelopeLine: string;
  whereas: [string, string];
  promises: string[];
  bigPromise: string;
  since: string;
  sinceDays: number | null;
  witness: string;
  monogram: string;
  waxKey: WaxColour;
  W: (typeof WAX)[WaxColour];
  reply: string;
  photos: LovePhoto[];
  /** One photo beside each promise (cycled when there are fewer photos). */
  clausePhotos: (LovePhoto | undefined)[];
  /** Photos used nowhere else: the exhibits. */
  exhibits: LovePhoto[];
}

/** Days since a YYYY-MM-DD date (null if invalid or in the future). */
export function daysSince(iso: string, now = Date.now()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  if (!Number.isFinite(t) || t > now) return null;
  return Math.max(1, Math.floor((now - t) / 86400000));
}

export const initialOf = (s: string) => Array.from(s.trim())[0]?.toLocaleUpperCase() ?? "";

export function readDeed(data: ValentineDayData): Deed {
  const x = (data.extras ?? {}) as Partial<PromiseExtrasPremium>;
  const recipient = clean(data.recipientName) || "You";
  const sender = clean(data.senderName) || "Me";
  const list = (v: unknown, max: number) => (Array.isArray(v) ? v : []).map(clean).filter(Boolean).slice(0, max);
  const promises = list(x.promises, 7);
  const wh = list(x.whereas, 2);
  const waxKey = WAX_KEYS.includes(x.waxColour as WaxColour) ? (x.waxColour as WaxColour) : "oxblood";
  const photos = (data.photos ?? []).filter((p) => p && p.url);
  const ps = promises.length ? promises : demo.promises;
  // Exhibit A is photo 1; each clause gets the next one; the rest are exhibits.
  const pool = photos.slice(1).length ? photos.slice(1) : photos;
  const clausePhotos = ps.map((_, i) => (pool.length ? pool[i % pool.length] : undefined));
  const exhibits = photos.length > ps.length + 1 ? photos.slice(ps.length + 1) : [];
  const since = clean(x.sinceDate);
  const mono = clean(x.monogram).slice(0, 5);
  return {
    recipient,
    sender,
    envelopeLine: clean(x.envelopeLine),
    whereas: [wh[0] || demo.whereas[0], wh[1] || (wh[0] ? "" : demo.whereas[1])],
    promises: ps,
    bigPromise: clean(x.bigPromise).replace(/^and above all[,:]?\s*/i, "").replace(/^./, (c) => c.toLocaleUpperCase()),
    since,
    sinceDays: daysSince(since),
    witness: clean(x.witnessLine),
    monogram: mono || `${initialOf(sender)}&${initialOf(recipient)}`,
    waxKey,
    W: WAX[waxKey],
    reply: clean(x.replyLine),
    photos,
    clausePhotos,
    exhibits,
  };
}

export const fmt = (n: number) => n.toLocaleString("en-IN");

const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** "14 March 2022" (null-safe). */
export function longDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m && MON[+m[2] - 1] ? `${+m[3]} ${MON[+m[2] - 1]} ${m[1]}` : "";
}
/** Today, "9 October 2026". */
export function today(d = new Date()) {
  return `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
}
/** "09·10·26" for the notary stamp. */
export function stampDate(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}·${p(d.getMonth() + 1)}·${String(d.getFullYear()).slice(2)}`;
}
/** Roman numerals for clause numbers (1–12). */
export const roman = (n: number) => ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][n - 1] ?? String(n);
