// ─── Wedding kit: dates, maps links and "Add to calendar" (.ics) ─────────────
//
// All event times are wall-clock at the venue (`tz`, default IST "+05:30"),
// so a guest abroad gets the right instant in their own calendar.
import { DEFAULT_TZ_OFFSET, type WeddingEvent } from "./types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** The event's start instant, or null when the date is missing / malformed. A missing time = 10:00. */
export function eventStart(date: string, time?: string, tz: string = DEFAULT_TZ_OFFSET): Date | null {
  if (!DATE_RE.test(date || "")) return null;
  const t = TIME_RE.test(time || "") ? time : "10:00";
  const d = new Date(`${date}T${t}:00${/^[+-]\d{2}:\d{2}$/.test(tz) ? tz : DEFAULT_TZ_OFFSET}`);
  return Number.isFinite(d.getTime()) ? d : null;
}

/** End instant: `endTime` (rolling past midnight) or start + 3 h. */
export function eventEnd(e: Pick<WeddingEvent, "date" | "time" | "endTime">, tz: string = DEFAULT_TZ_OFFSET): Date | null {
  const s = eventStart(e.date, e.time, tz);
  if (!s) return null;
  if (e.endTime && TIME_RE.test(e.endTime)) {
    let end = eventStart(e.date, e.endTime, tz);
    if (end && end <= s) end = new Date(end.getTime() + 86_400_000);
    if (end) return end;
  }
  return new Date(s.getTime() + 3 * 3_600_000);
}

/** "Saturday, 12 December 2026" in the venue's calendar (language: "en-IN" | "hi-IN"). */
export function formatEventDate(date: string, locale = "en-IN"): string {
  if (!DATE_RE.test(date || "")) return "";
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

/** "7:30 PM" from "19:30"; "" when unset. */
export function formatEventTime(time?: string, locale = "en-IN"): string {
  if (!TIME_RE.test(time || "")) return "";
  const [h, mi] = (time as string).split(":").map(Number);
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" })
    .format(new Date(Date.UTC(2000, 0, 1, h, mi)))
    .replace(/\s?(am|pm)$/i, (m) => m.toUpperCase());
}

/** The event's map link: the sender's own https URL, else a Google Maps search for venue + address. */
export function mapLink(e: Pick<WeddingEvent, "mapUrl" | "venue" | "address">): string {
  const u = (e.mapUrl || "").trim();
  if (/^https:\/\/\S+$/i.test(u)) return u;
  const q = [e.venue, e.address].filter((s) => s && s.trim()).join(", ");
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : "";
}

// RFC 5545 §3.3.11: backslash first, then ; and , — then newlines; other controls dropped.
const esc = (s: string) =>
  s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\r?\n/g, "\\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "");
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
/** Fold at 73 octets-ish (chars; safe for ASCII, conservative for Devanagari). */
const fold = (line: string) => {
  const chars = Array.from(line);
  if (chars.length <= 73) return line;
  const out: string[] = [];
  for (let i = 0; i < chars.length; i += 73) out.push(chars.slice(i, i + 73).join(""));
  return out.join("\r\n ");
};

export interface IcsOptions {
  /** "Ananya & Rohan" — prefixed to every summary: "Haldi · Ananya & Rohan". */
  couple: string;
  /** Link back to the invitation, added to each description. */
  url?: string;
  tz?: string;
}

/** A VCALENDAR with one VEVENT per dated event (undated ones are skipped). null when none qualify. */
export function weddingIcs(events: readonly WeddingEvent[], o: IcsOptions): string | null {
  const now = stamp(new Date());
  const vevents: string[] = [];
  for (const e of events) {
    const s = eventStart(e.date, e.time, o.tz);
    const end = eventEnd(e, o.tz);
    if (!s || !end) continue;
    const where = [e.venue, e.address].filter(Boolean).join(", ");
    const desc = [e.dressCode ? `Dress code: ${e.dressCode}` : "", e.note ?? "", mapLink(e) ? `Map: ${mapLink(e)}` : "", o.url ? `Invitation: ${o.url}` : ""]
      .filter(Boolean)
      .join("\n");
    vevents.push(
      "BEGIN:VEVENT",
      `UID:${s.getTime()}-${(e.id || "e").replace(/[^a-z0-9-]/gi, "")}-${Math.random().toString(36).slice(2, 8)}@subhsandesh.in`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(s)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:${esc(`${e.title || "Wedding"} · ${o.couple}`)}`,
      ...(desc ? [`DESCRIPTION:${esc(desc)}`] : []),
      ...(where ? [`LOCATION:${esc(where)}`] : []),
      ...(o.url ? [`URL:${o.url.replace(/[\r\n]/g, "")}`] : []),
      // A gentle reminder the day before.
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(`${e.title || "Wedding"} tomorrow`)}`,
      "END:VALARM",
      "END:VEVENT",
    );
  }
  if (!vevents.length) return null;
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SubhSandesh//Wedding//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...vevents, "END:VCALENDAR"]
    .map(fold)
    .join("\r\n");
}

/** Download the .ics. Returns false when no event has a usable date. */
export function downloadWeddingIcs(events: readonly WeddingEvent[], o: IcsOptions, fileName = "wedding"): boolean {
  const text = weddingIcs(events, o);
  if (!text) return false;
  const url = URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName.replace(/[^a-z0-9-]+/gi, "-").slice(0, 40) || "wedding"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}

/** Google Calendar "add event" URL (an alternative to the .ics on Android). */
export function googleCalendarUrl(e: WeddingEvent, o: IcsOptions): string {
  const s = eventStart(e.date, e.time, o.tz);
  const end = eventEnd(e, o.tz);
  if (!s || !end) return "";
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${e.title || "Wedding"} · ${o.couple}`,
    dates: `${stamp(s)}/${stamp(end)}`,
    details: [e.dressCode ? `Dress code: ${e.dressCode}` : "", o.url ? `Invitation: ${o.url}` : ""].filter(Boolean).join("\n"),
    location: [e.venue, e.address].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
