// ─── Reception Night: stored data → a safe shape → a render model ────────────
//
// Everything that arrives from the network (an older page, a draft in
// sessionStorage, the AI fill, a hostile POST) goes through
// `normalizeReception` first: every field is coerced, the new ones default to
// EMPTY (never the demo's words), and an older page's single reception is
// derived from its receptionDate / venue fields so nothing goes missing.

import type { LovePhoto, PhotoSpan } from "../../_love/types";
import type { WeddingEvent } from "../../_wedding/types";
import {
  DEMO_DATA,
  EMPTY_EXTRAS,
  LEGACY_EVENT_ID,
  RECEPTION_LIMITS,
  type Contact,
  type GalleryImage,
  type MusicSetting,
  type PersonInfo,
  type ReceptionData,
  type ReceptionEvent,
  type ReceptionTheme,
  type StoryChapter,
  type Thing,
} from "./types";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown, max = 600) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const strRaw = (v: unknown, max = 1200) => (typeof v === "string" ? v.slice(0, max) : "");
const num = (v: unknown, lo: number, hi: number, d: number) => {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d;
};
const list = <T>(v: unknown, max: number, map: (o: Obj, i: number) => T): T[] => (Array.isArray(v) ? v : []).filter(isObj).slice(0, max).map(map);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** "2027-02-20T19:30:00+05:30" → { date, time }; anything else → empty strings. */
export function splitIso(iso: string): { date: string; time: string } {
  const m = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/.exec(iso || "");
  if (!m) return { date: "", time: "" };
  return { date: m[1], time: m[2] && TIME_RE.test(m[2]) ? m[2] : "" };
}

/** "7:00 PM — 11:30 PM" → "23:30" (the end of an older page's timings line). */
export function endFromTimings(t: string): string {
  const parts = (t || "").split(/—|–|-|to/i).map((s) => s.trim()).filter(Boolean);
  const last = parts[1];
  if (!last) return "";
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i.exec(last);
  if (!m) return "";
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const ap = (m[3] || "").toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  if (h > 23 || min > 59) return "";
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/** "19:30" → "7:30 PM" */
export function clock12(t: string): string {
  if (!TIME_RE.test(t || "")) return "";
  const [h, m] = t.split(":").map(Number);
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

const emptyEvent = (i: number): ReceptionEvent => ({
  id: i === 0 ? LEGACY_EVENT_ID : `e${i + 1}`,
  title: "",
  date: "",
  time: "",
  endTime: "",
  venue: "",
  address: "",
  mapUrl: "",
  dressCode: "",
  dressColor: "",
  note: "",
});
export const newEvent = (taken: string[]): ReceptionEvent => {
  let n = taken.length + 1;
  let id = `e${n}`;
  while (taken.includes(id)) id = `e${++n}`;
  return { ...emptyEvent(1), id };
};

function readEvents(v: unknown): ReceptionEvent[] {
  const seen = new Set<string>();
  return list(v, RECEPTION_LIMITS.events, (o, i) => {
    let id = str(o.id, 40).replace(/[^a-z0-9_-]/gi, "") || (i === 0 ? LEGACY_EVENT_ID : `e${i + 1}`);
    while (seen.has(id)) id = `${id}-${i + 1}`;
    seen.add(id);
    const date = str(o.date, 10);
    const time = str(o.time, 5);
    const endTime = str(o.endTime, 5);
    const color = str(o.dressColor, 7);
    return {
      id,
      title: str(o.title, 60),
      date: DATE_RE.test(date) ? date : "",
      time: TIME_RE.test(time) ? time : "",
      endTime: TIME_RE.test(endTime) ? endTime : "",
      venue: str(o.venue, 120),
      address: str(o.address, 200),
      mapUrl: /^https:\/\//i.test(str(o.mapUrl, 500)) ? str(o.mapUrl, 500) : "",
      dressCode: str(o.dressCode, 80),
      dressColor: /^#[0-9a-f]{6}$/i.test(color) ? color : "",
      note: str(o.note, 300),
    };
  });
}

/** An older page's one reception, built from its original fields. */
export function legacyEvent(d: Pick<ReceptionData, "receptionDate" | "venue" | "venueAddress" | "venueMapQuery" | "venueTimings">): ReceptionEvent {
  const { date, time } = splitIso(d.receptionDate);
  const q = (d.venueMapQuery || "").trim();
  return {
    ...emptyEvent(0),
    title: "Reception",
    date,
    time,
    endTime: endFromTimings(d.venueTimings),
    venue: d.venue || "",
    address: d.venueAddress || "",
    mapUrl: q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q.replace(/\+/g, " "))}` : "",
  };
}

function readPerson(v: unknown, fallback: PersonInfo, role: string): PersonInfo {
  const o = isObj(v) ? v : {};
  const tags = Array.isArray(o.tags) ? (o.tags as unknown[]).filter(isObj).slice(0, 6).map((t) => ({ emoji: str(t.emoji, 8), label: str(t.label, 40) })).filter((t) => t.label) : fallback.tags;
  const p: PersonInfo = {
    name: str(o.name, 60) || fallback.name,
    role: str(o.role, 40) || role,
    description: str(o.description, 300) || fallback.description,
    photo: typeof o.photo === "string" ? o.photo : "",
    tags,
  };
  if (o.cropX !== undefined) p.cropX = num(o.cropX, 0, 100, 50);
  if (o.cropY !== undefined) p.cropY = num(o.cropY, 0, 100, 50);
  if (o.scale !== undefined) p.scale = num(o.scale, 100, 300, 100);
  return p;
}

function readGallery(v: unknown): GalleryImage[] {
  return list(v, RECEPTION_LIMITS.gallery, (g) => {
    const out: GalleryImage = { src: typeof g.src === "string" ? g.src : "", alt: str(g.alt, 120), span: str(g.span, 40), category: str(g.category, 40) };
    if (typeof g.caption === "string") out.caption = str(g.caption, 140);
    if (g.cropX !== undefined && g.cropX !== null) out.cropX = num(g.cropX, 0, 100, 50);
    if (g.cropY !== undefined && g.cropY !== null) out.cropY = num(g.cropY, 0, 100, 50);
    if (g.scale !== undefined && g.scale !== null) out.scale = num(g.scale, 100, 300, 100);
    if (typeof g.w === "number" && g.w > 0) out.w = Math.round(g.w);
    if (typeof g.h === "number" && g.h > 0) out.h = Math.round(g.h);
    return out;
  }).filter((g) => g.src);
}

function readMusic(v: unknown): MusicSetting {
  const o = isObj(v) ? v : {};
  const mode = str(o.mode, 10);
  const id = str(o.youtubeId, 11);
  return {
    mode: (["youtube", "track", "off", "melody"].includes(mode) ? mode : "") as MusicSetting["mode"],
    youtubeId: /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "",
    start: Math.round(num(o.start, 0, 600, 0)),
  };
}

const THEMES: ReceptionTheme[] = ["champagne", "blush", "pearl"];

/**
 * Any stored/draft/AI object → a complete ReceptionData.
 *
 * Original fields keep the old viewer's fallbacks (an empty name showed the
 * demo's, and still does); the new fields default to empty. `fillEvents`
 * derives the single reception of an older page.
 */
export function normalizeReception(raw: unknown, opts: { fillEvents?: boolean } = {}): ReceptionData {
  const d = isObj(raw) ? raw : {};
  const blessings = Array.isArray(d.blessings) ? d.blessings : [];
  const wishesRaw = blessings.length ? blessings : Array.isArray(d.wishes) ? d.wishes : [];
  const base: ReceptionData = {
    brideName: str(d.brideName, 40) || DEMO_DATA.brideName,
    groomName: str(d.groomName, 40) || DEMO_DATA.groomName,
    receptionDate: str(d.receptionDate, 40) || DEMO_DATA.receptionDate,
    venue: str(d.venue, 120),
    venueAddress: str(d.venueAddress, 200),
    venueMapQuery: str(d.venueMapQuery, 200),
    venueTimings: str(d.venueTimings, 60),
    tagline: str(d.tagline, 120) || DEMO_DATA.tagline,
    heroImage: str(d.heroImage, 600) || DEMO_DATA.heroImage,
    bride: readPerson(d.bride, { ...DEMO_DATA.bride, photo: "" }, "The Bride"),
    groom: readPerson(d.groom, { ...DEMO_DATA.groom, photo: "" }, "The Groom"),
    families: {
      bride: str(isObj(d.families) ? d.families.bride : "", 160),
      groom: str(isObj(d.families) ? d.families.groom : "", 160),
    },
    galleryImages: readGallery(d.galleryImages),
    wishes: (wishesRaw as unknown[]).filter(isObj).map((w) => ({ name: str(w.name, 60) || "Guest", message: str(w.message, 400) })).filter((w) => w.message),
    sharePhoto: typeof d.sharePhoto === "string" ? d.sharePhoto : "",

    ...EMPTY_EXTRAS,
    events: readEvents(d.events),
    story: list(d.story, RECEPTION_LIMITS.story, (o): StoryChapter => ({ when: str(o.when, 40), title: str(o.title, 80), line: str(o.line, 400), photo: typeof o.photo === "string" ? o.photo : "" })),
    contacts: list(d.contacts, RECEPTION_LIMITS.contacts, (o): Contact => ({ name: str(o.name, 60), relation: str(o.relation, 60), phone: str(o.phone, 24) })),
    things: list(d.things, RECEPTION_LIMITS.things, (o): Thing => ({ head: str(o.head, 60), text: str(o.text, 300) })),
    music: readMusic(d.music),
    theme: THEMES.includes(d.theme as ReceptionTheme) ? (d.theme as ReceptionTheme) : "champagne",
    lang: d.lang === "hi" ? "hi" : "en",
    invitation: strRaw(d.invitation, 1200).trim(),
    hindiMessage: strRaw(d.hindiMessage, 700).trim(),
    blessingsOf: str(d.blessingsOf, 160),
    hashtag: str(d.hashtag, 40),
    closingLine: str(d.closingLine, 120),
    gettingThere: strRaw(d.gettingThere, 600).trim(),
    videoUrl: str(d.videoUrl, 300),
    liveUrl: str(d.liveUrl, 500),
    upiId: str(d.upiId, 120),
    upiName: str(d.upiName, 60),
    rsvpBy: DATE_RE.test(str(d.rsvpBy, 10)) ? str(d.rsvpBy, 10) : "",
    maxGuests: Math.round(num(d.maxGuests, 1, 10, 6)),
    rsvpMeal: d.rsvpMeal === true,
  };
  if (opts.fillEvents !== false && base.events.length === 0) base.events = [legacyEvent(base)];
  return base;
}

/** The main event: the one that reads as the reception itself, else the first. */
export function mainEventIndex(events: ReceptionEvent[]): number {
  const i = events.findIndex((e) => /reception|walima|valima|dinner|स्वागत/i.test(e.title));
  return i >= 0 ? i : 0;
}

/**
 * Copy the main event into the original fields (receptionDate, venue…), so
 * anything that still reads them — the profile card, share previews, an older
 * client — shows the same evening.
 */
export function withLegacyFields(d: ReceptionData): ReceptionData {
  const e = d.events[mainEventIndex(d.events)];
  if (!e) return d;
  const out = { ...d };
  if (e.date) out.receptionDate = `${e.date}T${e.time || "19:00"}:00+05:30`;
  out.venue = e.venue || d.venue;
  out.venueAddress = e.address || d.venueAddress;
  const q = [e.venue, e.address].filter(Boolean).join(", ");
  if (q) out.venueMapQuery = q.replace(/\s+/g, "+");
  const a = clock12(e.time);
  const b = clock12(e.endTime);
  if (a) out.venueTimings = b ? `${a} — ${b}` : a;
  return out;
}

// ── Render helpers ──────────────────────────────────────────────────────────

export function toWeddingEvent(e: ReceptionEvent): WeddingEvent {
  return { ...e };
}

/** YouTube id out of any link form (watch, youtu.be, shorts, embed, live) or a bare id. */
export function youtubeIdOf(raw: string): string {
  const s = (raw || "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/i);
  return m ? m[1] : "";
}

/** "+91 98290 00000", "098290-00000", "9829000000" → "919829000000"; "" when not a phone number. */
export function normalisePhone(raw: string): string {
  const d = (raw || "").replace(/[^\d+]/g, "");
  const digits = d.replace(/\D/g, "");
  if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
  if (/^0[6-9]\d{9}$/.test(digits)) return `91${digits.slice(1)}`;
  if (/^91[6-9]\d{9}$/.test(digits)) return digits;
  if (d.startsWith("+") && digits.length >= 8 && digits.length <= 15) return digits;
  return "";
}
export function displayPhone(digits: string): string {
  if (/^91\d{10}$/.test(digits)) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  return `+${digits}`;
}

export const isUpiId = (v: string) => /^[a-z0-9._-]{2,256}@[a-z][a-z0-9.-]{1,64}$/i.test(v);

const COLOUR_WORDS: [RegExp, string][] = [
  [/black|tie|tux|noir|formal/i, "#1C1C24"],
  [/yellow|mustard|gold(en)?\b/i, "#E2B33C"],
  [/green|emerald|sage|mint/i, "#4F9B6A"],
  [/pink|rose|blush|fuchsia|rani|dance/i, "#E86A92"],
  [/red|maroon|crimson|wine|burgundy/i, "#A3122B"],
  [/purple|violet|lavender|lilac|plum/i, "#7B3FA0"],
  [/blue|navy|teal|turquoise|indigo/i, "#2E5AAC"],
  [/orange|saffron|peach|coral/i, "#EE8A2E"],
  [/white|ivory|cream|pastel|beige|champagne|pearl/i, "#F3EBDD"],
  [/silver|grey|gray|metallic/i, "#B8BCC6"],
];
export function swatchFor(e: Pick<ReceptionEvent, "dressCode" | "dressColor">): string {
  if (e.dressColor && /^#[0-9a-f]{6}$/i.test(e.dressColor)) return e.dressColor;
  for (const [re, c] of COLOUR_WORDS) if (re.test(e.dressCode ?? "")) return c;
  return "";
}

/** Old Tailwind spans and new names → the masonry's span. */
export function spanOf(span: string): PhotoSpan | undefined {
  const s = (span || "").toLowerCase();
  if (s === "wide" || s === "tall" || s === "large") return s;
  const wide = /col-span-2/.test(s);
  const tall = /row-span-2/.test(s);
  if (wide && tall) return "large";
  if (wide) return "wide";
  if (tall) return "tall";
  return undefined;
}

export function galleryToPhotos(g: GalleryImage[]): LovePhoto[] {
  return g.map((p) => ({
    url: p.src,
    caption: p.caption || undefined,
    cropX: p.cropX,
    cropY: p.cropY,
    scale: p.scale,
    span: spanOf(p.span),
    w: p.w,
    h: p.h,
  }));
}

/** The masonry editor's photos back into the stored gallery shape (old fields kept where they matched). */
export function photosToGallery(photos: LovePhoto[], prev: GalleryImage[]): GalleryImage[] {
  return photos.map((p) => {
    const old = prev.find((g) => g.src === p.url);
    const out: GalleryImage = {
      src: p.url,
      alt: old?.alt || p.caption || "",
      span: p.span && p.span !== "normal" ? p.span : "",
      category: old?.category || "",
    };
    if (p.caption) out.caption = p.caption;
    if (p.cropX !== undefined) out.cropX = p.cropX;
    if (p.cropY !== undefined) out.cropY = p.cropY;
    if (p.scale !== undefined) out.scale = p.scale;
    if (p.w) out.w = p.w;
    if (p.h) out.h = p.h;
    return out;
  });
}

/** Story/families with an empty photo or text are not shown. */
export const hasStory = (s: StoryChapter[]) => s.some((c) => c.title || c.line);

/** The invitation body: the sender's text, or a default from the tagline. */
export function invitationText(d: ReceptionData): string {
  if (d.invitation.trim()) return d.invitation.trim();
  const t = (d.tagline || "request the pleasure of your company").replace(/[.!]+$/, "");
  return `Together with their families, ${d.brideName} and ${d.groomName} ${t.charAt(0).toLowerCase()}${t.slice(1)}.\n\nAn evening of dinner, music and celebration awaits. Your presence will make it complete.`;
}

/** A seeded RNG so particles are the same on server and client. */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
