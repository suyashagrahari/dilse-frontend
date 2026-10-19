// ─── Wedding Invitation ✦ Premium: engine data → what the guest page shows ──
//
// recipientName = the bride · senderName = the groom · letter = the
// invitation · endLine = the closing line · photos[0] = the cover. Everything
// else is in `extras` (see _valentine/days/wedding-invitation-premium.ts).

import type { LovePhoto } from "../../_love/types";
import { isWeddingThemeId, type FamilySide, type WeddingEvent, type WeddingThemeId } from "../../_wedding";
import type { ValentineDayData } from "../../_valentine/types";

export type Motif = "ganesha" | "lotus" | "rings" | "none";

export interface StoryMoment {
  when: string;
  title: string;
  text: string;
  photo: LovePhoto | null;
}

export interface Faq {
  title: string;
  text: string;
}

export interface WpModel {
  bride: string;
  groom: string;
  /** Names in the order the family prints them. */
  first: "bride" | "groom";
  a: string;
  b: string;
  couple: string;
  theme: WeddingThemeId;
  motif: Motif;
  hindi: boolean;
  date: string;
  time: string;
  city: string;
  hashtag: string;
  brideFamily: FamilySide;
  groomFamily: FamilySide;
  hasFamilies: boolean;
  events: WeddingEvent[];
  story: StoryMoment[];
  faqs: Faq[];
  rsvpBy: string;
  maxGuests: number;
  meal: boolean;
  cover: LovePhoto | null;
  photos: LovePhoto[];
  letter: string;
  endLine: string;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const rows = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === "object") : []);
export const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));

export function toModel(data: ValentineDayData): WpModel {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const bride = str(data.recipientName) || "Bride";
  const groom = str(data.senderName) || "Groom";
  const first = x.order === "groom" ? "groom" : "bride";
  const [a, b] = first === "bride" ? [bride, groom] : [groom, bride];
  const photos = (data.photos ?? []).filter((p) => p && p.url);
  const events: WeddingEvent[] = rows(x.events)
    .map((e, i) => ({
      id: str(e.id) || `event-${i + 1}`,
      title: str(e.title),
      date: str(e.date),
      time: str(e.time),
      endTime: str(e.endTime) || undefined,
      venue: str(e.venue),
      address: str(e.address) || undefined,
      mapUrl: str(e.mapUrl) || undefined,
      dressCode: str(e.dressCode) || undefined,
      note: str(e.note) || undefined,
    }))
    .filter((e) => e.title);
  const story: StoryMoment[] = rows(x.story)
    .map((s) => {
      const n = Math.round(Number(s.photo) || 0);
      return { when: str(s.when), title: str(s.title), text: str(s.text), photo: n > 0 ? photos[n - 1] ?? null : null };
    })
    .filter((s) => s.title || s.text);
  const faqs = rows(x.faqs).map((f) => ({ title: str(f.title), text: str(f.text) })).filter((f) => f.title || f.text);
  const brideParents = str(x.brideParents);
  const groomParents = str(x.groomParents);
  const mainDate = str(x.date);
  const fallbackDate = events.find((e) => isIsoDate(e.date))?.date ?? "";
  return {
    bride,
    groom,
    first,
    a,
    b,
    couple: `${a} & ${b}`,
    theme: isWeddingThemeId(x.theme) ? x.theme : "blush",
    motif: (["ganesha", "lotus", "rings", "none"] as const).includes(x.motif as Motif) ? (x.motif as Motif) : "ganesha",
    hindi: x.hindi !== false,
    date: isIsoDate(mainDate) ? mainDate : fallbackDate,
    time: /^\d{2}:\d{2}$/.test(str(x.time)) ? str(x.time) : "",
    city: str(x.city),
    hashtag: str(x.hashtag),
    brideFamily: { title: "The bride's family", names: brideParents ? [brideParents] : [], note: str(x.brideNote) || undefined },
    groomFamily: { title: "The groom's family", names: groomParents ? [groomParents] : [], note: str(x.groomNote) || undefined },
    hasFamilies: !!(brideParents || groomParents),
    events,
    story,
    faqs,
    rsvpBy: isIsoDate(str(x.rsvpBy)) ? str(x.rsvpBy) : "",
    maxGuests: Math.min(10, Math.max(1, Math.round(Number(x.maxGuests) || 4))),
    meal: x.rsvpMeal === true,
    cover: photos[0] ?? null,
    photos,
    letter: str(data.letter),
    endLine: str(data.endLine),
  };
}

/** "Saturday, 13 February 2027" (the date as written, no timezone drift). */
export function longDate(iso: string, locale = "en-IN"): string {
  if (!isIsoDate(iso)) return "";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** "13 · 02 · 2027" */
export function dotDate(iso: string): string {
  if (!isIsoDate(iso)) return "";
  const [y, m, d] = iso.split("-");
  return `${d} · ${m} · ${y}`;
}

/** "7:00 pm" */
export function niceTime(t: string): string {
  if (!/^\d{2}:\d{2}$/.test(t)) return "";
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

/** The month grid (Monday first) around a date, for the save-the-date calendar. */
export function monthGrid(iso: string): { title: string; days: (number | null)[]; day: number } | null {
  if (!isIsoDate(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const len = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  const days: (number | null)[] = [...Array.from({ length: lead }, () => null), ...Array.from({ length: len }, (_, i) => i + 1)];
  while (days.length % 7) days.push(null);
  const title = first.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
  return { title, days, day: d };
}

/** Section titles with their Hindi line (copy.md). */
export const HI = {
  invite: "आप सादर आमंत्रित हैं",
  countdown: "शुभ घड़ी में बाकी",
  story: "हमारी कहानी",
  families: "हमारा परिवार",
  events: "शुभ कार्यक्रम",
  gallery: "यादें",
  goodToKnow: "ज़रूरी जानकारी",
  rsvp: "क्या आप पधारेंगे?",
  closing: "सप्रेम",
} as const;
