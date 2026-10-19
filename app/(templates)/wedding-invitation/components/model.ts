// Reads the page's extras into a safe, typed shape (old / partial / hostile data
// all end up valid). Shared by the guest page and the studio.

import { isWeddingThemeId, type WeddingThemeId } from "../../_wedding/themes";
import type { WeddingEvent } from "../../_wedding/types";
import { WI_LIMITS } from "../../_valentine/days/wedding-invitation";

export interface WiModel {
  theme: WeddingThemeId;
  namesOrder: "bride" | "groom";
  date: string;
  time: string;
  brideFamily: string;
  groomFamily: string;
  events: WeddingEvent[];
  rsvp: boolean;
  rsvpBy: string;
  maxGuests: number;
}

const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** A short stable id for a new event (RSVPs refer to it): its title as a slug, made unique. */
export function eventId(title: string, taken: readonly string[]): string {
  const base = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "event";
  let id = base;
  for (let n = 2; taken.includes(id); n++) id = `${base}-${n}`;
  return id;
}

export function readEvents(raw: unknown): WeddingEvent[] {
  const list = Array.isArray(raw) ? raw : [];
  const out: WeddingEvent[] = [];
  for (const r of list.slice(0, WI_LIMITS.events)) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    const title = str(o.title, 40);
    const venue = str(o.venue, 80);
    if (!title && !venue) continue;
    const date = str(o.date, 10);
    const time = str(o.time, 5);
    out.push({
      id: str(o.id, 40) || eventId(title, out.map((e) => e.id)),
      title: title || "Celebration",
      date: DATE_RE.test(date) ? date : "",
      time: TIME_RE.test(time) ? time : "",
      endTime: TIME_RE.test(str(o.endTime, 5)) ? str(o.endTime, 5) : "",
      venue,
      address: str(o.address, 140),
      mapUrl: /^https:\/\//i.test(str(o.mapUrl, 300)) ? str(o.mapUrl, 300) : "",
      dressCode: str(o.dressCode, 60),
      note: str(o.note, 200),
    });
  }
  return out;
}

export function readWi(extras: unknown): WiModel {
  const x = extras && typeof extras === "object" ? (extras as Record<string, unknown>) : {};
  const date = str(x.date, 10);
  const time = str(x.time, 5);
  const n = typeof x.maxGuests === "number" ? x.maxGuests : Number(x.maxGuests);
  return {
    theme: isWeddingThemeId(x.theme) ? x.theme : "champagne",
    namesOrder: x.namesOrder === "groom" ? "groom" : "bride",
    date: DATE_RE.test(date) ? date : "",
    time: TIME_RE.test(time) ? time : "",
    brideFamily: str(x.brideFamily, 90),
    groomFamily: str(x.groomFamily, 90),
    events: readEvents(x.events),
    rsvp: x.rsvp !== false,
    rsvpBy: DATE_RE.test(str(x.rsvpBy, 10)) ? str(x.rsvpBy, 10) : "",
    maxGuests: Number.isFinite(n) ? Math.min(10, Math.max(1, Math.round(n))) : 4,
  };
}

/** The two names in the order the couple chose. */
export function coupleNames(bride: string, groom: string, order: "bride" | "groom"): [string, string] {
  const a = bride.trim() || "Bride";
  const b = groom.trim() || "Groom";
  return order === "groom" ? [b, a] : [a, b];
}

/** "Saturday, 12 December 2026" (dates are wall-clock at the venue, so no timezone shift). */
export function longDate(date: string, locale = "en-IN"): string {
  if (!DATE_RE.test(date)) return "";
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return dt.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** "12 · 12 · 2026" */
export function dotDate(date: string): string {
  if (!DATE_RE.test(date)) return "";
  const [y, m, d] = date.split("-");
  return `${Number(d)} · ${Number(m)} · ${y}`;
}

/** "7:30 pm" */
export function prettyTime(t: string): string {
  if (!TIME_RE.test(t)) return "";
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "am" : "pm"}`;
}

/** The main event: the one titled like a wedding / pheras / nikah, else the first. */
export function mainEvent(events: readonly WeddingEvent[]): WeddingEvent | undefined {
  return events.find((e) => /wedding|vivah|shaadi|phera|nikah|ceremony|marriage|muhurat/i.test(e.title)) ?? events[0];
}
