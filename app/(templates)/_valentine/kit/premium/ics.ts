// ─── downloadIcs() — "Add to calendar" for a date plan / a promise ───────────
//
//   downloadIcs({ title: "Our rooftop dinner", start: "2027-02-20T20:00:00+05:30", durationMin: 120, location: "That rooftop place" });
//
// A one-event RFC 5545 file, built on the client (no server, no third party).
// Text is escaped and folded; CR/LF in user text can't inject properties.

export interface IcsEvent {
  title: string;
  /** ISO string or Date. */
  start: string | Date;
  durationMin?: number;
  description?: string;
  location?: string;
}

// RFC 5545 §3.3.11: backslash first, then ; and , — then newlines; other controls dropped.
const esc = (s: string) => s.replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\r?\n/g, "\\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "");
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const fold = (line: string) => line.match(/.{1,73}/g)?.join("\r\n ") ?? line;

export function icsText(e: IcsEvent): string | null {
  const start = new Date(e.start);
  if (!Number.isFinite(start.getTime())) return null;
  const end = new Date(start.getTime() + (e.durationMin ?? 60) * 60000);
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SubhSandesh//Premium//EN", "BEGIN:VEVENT",
    `UID:${start.getTime()}-${Math.random().toString(36).slice(2)}@subhsandesh.in`,
    `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`,
    e.description ? `DESCRIPTION:${esc(e.description)}` : "",
    e.location ? `LOCATION:${esc(e.location)}` : "",
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean);
  return lines.map(fold).join("\r\n");
}

export function downloadIcs(e: IcsEvent, fileName = "plan"): boolean {
  const text = icsText(e);
  if (!text) return false;
  const url = URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName.replace(/[^a-z0-9-]+/gi, "-").slice(0, 40) || "plan"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}
