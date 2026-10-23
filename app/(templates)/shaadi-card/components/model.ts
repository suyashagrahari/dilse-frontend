// ─── Animated Shaadi Card: the data, the demo wedding and the converters ────
//
// One shape for the editor form, the preview and the published page. It is
// the stored ShaadiData (components/types.ts, which christian-wedding also
// imports and which is therefore left exactly as it was) plus the 2026-10
// fields. Every new field is optional on the wire: `fromDb` gives a page saved
// before the rebuild sensible values, so old links keep rendering.
//
// Server twin: server/src/config/shaadiCard.ts (cleaning, ids, sort) and
// models/ShaadiCardPage.ts. AI schema: server/src/config/aiFill/shaadi-card.ts
// (paths below: brideName, weddingDay, events[i].isoDate, story[i].line …).

import type { LovePhoto, PhotoSpan } from "../../_love/types";
import type { WeddingEvent } from "../../_wedding";
import type { MusicMode } from "../../_valentine/types";
import type { SongSuggestion } from "../../_valentine/music/youtube";

export const SLUG = "shaadi-card";
export const LIMITS = { events: 8, photos: 16, story: 4, things: 6, contacts: 4 } as const;

export type ShaadiTheme = "marigold" | "haldi" | "rani" | "mehendi";
export type Lang = "en" | "hi";

export interface ShaadiEvent {
  name: string;
  hindi: string;
  icon: string;
  /** Old display date "13 Apr" (the server derives it from isoDate on save). */
  date: string;
  /** Old display time "10 AM". */
  time: string;
  venue: string;
  details: string;
  accent: string;
  disabled?: boolean;
  // 2026-10
  id?: string;
  isoDate?: string;
  startTime?: string;
  endTime?: string;
  address?: string;
  mapUrl?: string;
  dressCode?: string;
  dressColor?: string;
}

export interface ShaadiPhoto {
  src: string;
  alt: string;
  cropX?: number;
  cropY?: number;
  scale?: number;
  span?: PhotoSpan;
  w?: number;
  h?: number;
  caption?: string;
}

export interface StoryChapter {
  when: string;
  title: string;
  line: string;
  photo: string;
  cropX?: number;
  cropY?: number;
  scale?: number;
}

export interface Contact {
  name: string;
  relation: string;
  phone: string;
}

export interface Crop {
  x: number;
  y: number;
  scale: number;
}

export interface Person {
  name: string;
  role: string;
  roleHindi: string;
  description: string;
  photo: string;
  tags: { emoji: string; label: string }[];
}

export interface Family {
  title: string;
  parents: string;
  grandparents: string;
}

export interface Wish {
  name: string;
  message: string;
  voiceUrl?: string;
}

export interface ShaadiCardData {
  brideName: string;
  groomName: string;
  /** Stored: "2027-02-20T19:30:00+05:30". The form edits weddingDay + weddingTime. */
  weddingDate: string;
  /** Client only: "2027-02-20" (the AI writes this one). */
  weddingDay: string;
  /** Client only: "19:30". */
  weddingTime: string;
  /** The city under the names. */
  venue: string;
  blessing: string;
  bride: Person;
  groom: Person;
  brideFamily: Family;
  groomFamily: Family;
  events: ShaadiEvent[];
  galleryImages: ShaadiPhoto[];
  wishes: Wish[];
  sharePhoto?: string;
  // ── 2026-10 ──
  theme: ShaadiTheme;
  lang: Lang;
  invitation: string;
  hindiMessage: string;
  muhurat: string;
  blessingsOf: string;
  nameOrder: "bride" | "groom";
  hashtag: string;
  closingLine: string;
  invocation: boolean;
  videoUrl: string;
  liveUrl: string;
  upiId: string;
  upiName: string;
  gettingThere: string;
  things: string[];
  story: StoryChapter[];
  contacts: Contact[];
  /** "" = saved before music was a choice: the template's own track plays. */
  musicMode: MusicMode | "";
  musicYoutubeId: string;
  musicStart: number;
  rsvpOn: boolean;
  rsvpBy: string;
  rsvpMeal: boolean;
  maxGuests: number;
  couplePhoto: string;
  brideCrop: Crop;
  groomCrop: Crop;
  coupleCrop: Crop;
}

// ── Functions: what a name implies (Hindi, icon, art, dress code) ───────────

export interface FunctionPreset {
  key: string;
  label: string;
  hindi: string;
  icon: string;
  /** The illustrated couple dressed for it (public/wedding-v3/shaadi). */
  art: string;
  dress: string;
  color: string;
  accent: string;
}

export const FUNCTION_PRESETS: FunctionPreset[] = [
  { key: "roka", label: "Roka", hindi: "रोका", icon: "💍", art: "fn-engagement", dress: "Festive pastels", color: "#F4C9D4", accent: "from-pink-500/20 to-pink-500/5 border-pink-500/30" },
  { key: "sagai", label: "Sagai", hindi: "सगाई", icon: "💍", art: "fn-engagement", dress: "Festive pastels", color: "#F4C9D4", accent: "from-pink-500/20 to-pink-500/5 border-pink-500/30" },
  { key: "engagement", label: "Engagement", hindi: "सगाई", icon: "💍", art: "fn-engagement", dress: "Festive pastels", color: "#F4C9D4", accent: "from-pink-500/20 to-pink-500/5 border-pink-500/30" },
  { key: "tilak", label: "Tilak", hindi: "तिलक", icon: "🪔", art: "fn-engagement", dress: "Traditional", color: "#EE8A2E", accent: "from-orange-500/20 to-orange-500/5 border-orange-500/30" },
  { key: "haldi", label: "Haldi", hindi: "हल्दी", icon: "🌼", art: "fn-haldi", dress: "Shades of yellow", color: "#F2C94C", accent: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30" },
  { key: "mehendi", label: "Mehendi", hindi: "मेहंदी", icon: "🌿", art: "fn-mehendi", dress: "Greens and bright florals", color: "#4F9B6A", accent: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30" },
  { key: "sangeet", label: "Sangeet", hindi: "संगीत", icon: "🎶", art: "fn-sangeet", dress: "Indo-western glam", color: "#7B3FA0", accent: "from-violet-500/20 to-violet-600/5 border-violet-500/30" },
  { key: "cocktail", label: "Cocktail", hindi: "कॉकटेल", icon: "🥂", art: "fn-reception", dress: "Cocktail chic", color: "#1C1C24", accent: "from-slate-500/20 to-slate-500/5 border-slate-500/30" },
  { key: "baraat", label: "Baraat", hindi: "बारात", icon: "🐎", art: "fn-wedding", dress: "Sherwanis and safas", color: "#EE8A2E", accent: "from-rose-500/20 to-rose-500/5 border-rose-500/30" },
  { key: "wedding", label: "Wedding", hindi: "विवाह", icon: "🔥", art: "fn-wedding", dress: "Traditional, reds and golds", color: "#A3122B", accent: "from-amber-500/20 to-amber-500/5 border-amber-500/30" },
  { key: "pheras", label: "Pheras", hindi: "फेरे", icon: "🔥", art: "fn-wedding", dress: "Traditional, reds and golds", color: "#A3122B", accent: "from-amber-500/20 to-amber-500/5 border-amber-500/30" },
  { key: "vidaai", label: "Vidaai", hindi: "विदाई", icon: "🌸", art: "fn-wedding", dress: "Traditional", color: "#E86A92", accent: "from-rose-500/20 to-rose-500/5 border-rose-500/30" },
  { key: "reception", label: "Reception", hindi: "स्वागत समारोह", icon: "✨", art: "fn-reception", dress: "Evening formal", color: "#2E5AAC", accent: "from-blue-500/20 to-blue-500/5 border-blue-500/30" },
];

const PRESET_ALIASES: [RegExp, string][] = [
  [/roka/i, "roka"],
  [/sagai|engage|ring/i, "engagement"],
  [/tilak|tikka/i, "tilak"],
  [/haldi|pithi|ubtan/i, "haldi"],
  [/meh[ae]?n?di|henna/i, "mehendi"],
  [/sangeet|ladies|garba/i, "sangeet"],
  [/cocktail|party/i, "cocktail"],
  [/baraat|barat|ghudchadi/i, "baraat"],
  [/phera|phere/i, "pheras"],
  [/wedding|vivah|shaadi|shadi|lagan|lagna|marriage|विवाह/i, "wedding"],
  [/vidaai|vidai|bidaai/i, "vidaai"],
  [/reception|swagat/i, "reception"],
];

export function presetFor(name: string): FunctionPreset | null {
  const n = (name || "").trim();
  if (!n) return null;
  for (const [re, key] of PRESET_ALIASES) if (re.test(n)) return FUNCTION_PRESETS.find((p) => p.key === key) ?? null;
  return null;
}

/** The main ceremony (countdown, live button, calendar "save the date"). */
export const MAIN_RE = /wedding|phera|phere|vivah|shaadi|shadi|lagan|lagna|marriage/i;

export const QUICK_FUNCTIONS = ["Roka", "Haldi", "Mehendi", "Sangeet", "Baraat", "Wedding", "Reception", "Cocktail", "Tilak", "Vidaai"] as const;

export const SWATCHES = ["#F2C94C", "#EE8A2E", "#E86A92", "#A3122B", "#4F9B6A", "#7B3FA0", "#2E5AAC", "#F3EBDD"] as const;

/** A swatch from the stored colour, else from the dress-code words. */
export function swatchFor(e: Pick<ShaadiEvent, "dressColor" | "dressCode">): string {
  if (e.dressColor && /^#[0-9a-f]{6}$/i.test(e.dressColor)) return e.dressColor;
  const d = (e.dressCode || "").toLowerCase();
  const words: [RegExp, string][] = [
    [/yellow|haldi|mustard/, "#F2C94C"],
    [/green|mehndi|mehendi|sage/, "#4F9B6A"],
    [/pink|blush|rose/, "#E86A92"],
    [/red|maroon/, "#A3122B"],
    [/orange|saffron|marigold/, "#EE8A2E"],
    [/purple|violet|lavender/, "#7B3FA0"],
    [/blue|navy/, "#2E5AAC"],
    [/black|cocktail/, "#1C1C24"],
    [/white|ivory|pastel|cream/, "#F3EBDD"],
  ];
  for (const [re, c] of words) if (re.test(d)) return c;
  return "";
}

// ── Small helpers ───────────────────────────────────────────────────────────

const s = (v: unknown) => (typeof v === "string" ? v : "");
const n = (v: unknown, fb: number) => (typeof v === "number" && Number.isFinite(v) ? v : fb);
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export const isIsoDay = (v: unknown): v is string => typeof v === "string" && ISO_DAY.test(v);
export const isHHMM = (v: unknown): v is string => typeof v === "string" && HHMM.test(v);

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
  aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "13 Apr" (+ the wedding's year, nearest to it) → "2026-04-13"; "" when unreadable. */
export function parseOldDate(display: string, weddingDay: string): string {
  const m = (display || "").trim().match(/^(\d{1,2})\s+([A-Za-z]+)\.?(?:\s+(\d{4}))?$/);
  if (!m) return "";
  const day = Number(m[1]);
  const mon = MONTHS[m[2].toLowerCase()];
  if (!mon || day < 1 || day > 31) return "";
  const pad = (x: number) => String(x).padStart(2, "0");
  if (m[3]) return `${m[3]}-${pad(mon)}-${pad(day)}`;
  const base = isIsoDay(weddingDay) ? new Date(`${weddingDay}T12:00:00Z`) : new Date();
  const y = base.getUTCFullYear();
  let best = "";
  let bestGap = Infinity;
  for (const yy of [y - 1, y, y + 1]) {
    const iso = `${yy}-${pad(mon)}-${pad(day)}`;
    const gap = Math.abs(Date.parse(`${iso}T12:00:00Z`) - base.getTime());
    if (gap < bestGap) {
      bestGap = gap;
      best = iso;
    }
  }
  return best;
}

/** "10 AM", "7:30 PM", "19:30" → "HH:mm"; "" when unreadable. */
export function parseOldTime(display: string): string {
  const t = (display || "").trim();
  if (HHMM.test(t)) return t;
  const m = t.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
  if (!m) return "";
  let h = Number(m[1]);
  const mi = Number(m[2] ?? 0);
  const ap = (m[3] ?? "").toLowerCase().replace(/\./g, "");
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  if (h > 23 || mi > 59) return "";
  return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
}

export const displayDay = (iso: string) => {
  if (!isIsoDay(iso)) return "";
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MON[m - 1]}`;
};
export const displayClock = (hhmm: string) => {
  if (!isHHMM(hhmm)) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h >= 12 ? "PM" : "AM"}`;
};

/** weddingDate (ISO with offset) → { day, time } at the venue (IST). */
export function splitWeddingDate(iso: string): { day: string; time: string } {
  const m = (iso || "").match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}))?/);
  if (!m) return { day: "", time: "" };
  // A value with an explicit non-IST offset is converted to IST wall time.
  const off = (iso.match(/([+-]\d{2}:\d{2}|Z)$/) || [])[1];
  if (off && off !== "+05:30" && m[2]) {
    const t = Date.parse(iso);
    if (!Number.isNaN(t)) {
      const ist = new Date(t + 330 * 60_000).toISOString();
      return { day: ist.slice(0, 10), time: ist.slice(11, 16) };
    }
  }
  return { day: m[1], time: m[2] || "" };
}

export const joinWeddingDate = (day: string, time: string) => (isIsoDay(day) ? `${day}T${isHHMM(time) ? time : "11:00"}:00+05:30` : "");

let idSeq = 0;
export function newEventId(taken: Set<string>): string {
  for (;;) {
    const id = `e${Date.now().toString(36).slice(-4)}${(idSeq++).toString(36)}`;
    if (!taken.has(id)) return id;
  }
}

/** Every event gets an id (old ones: e<index>, the server's rule); duplicates are renamed. */
export function withEventIds(events: ShaadiEvent[]): ShaadiEvent[] {
  const taken = new Set<string>();
  return events.map((e, i) => {
    let id = s(e.id).trim();
    if (!id || taken.has(id)) {
      id = !taken.has(`e${i}`) ? `e${i}` : newEventId(taken);
    }
    taken.add(id);
    return id === e.id ? e : { ...e, id };
  });
}

// ── The demo wedding (Udaipur, February) ────────────────────────────────────

const DEMO_PHOTO = (file: string, w: number, h: number, extra: Partial<ShaadiPhoto> = {}): ShaadiPhoto => ({ src: `/wedding-v3/demo/${file}`, alt: "", w, h, cropX: 50, cropY: 50, scale: 100, ...extra });

export const DEMO: ShaadiCardData = {
  brideName: "Ananya",
  groomName: "Arjun",
  weddingDate: "2027-02-20T19:30:00+05:30",
  weddingDay: "2027-02-20",
  weddingTime: "19:30",
  venue: "Udaipur",
  blessing: "ॐ शुभ विवाह",
  bride: {
    name: "Ananya",
    role: "The Bride",
    roleHindi: "दुल्हन",
    description: "A textile designer from Udaipur who paints on weekends, sings old Lata songs and makes the family's best adrak chai.",
    photo: "",
    tags: [
      { emoji: "🎨", label: "Designer" },
      { emoji: "🏙️", label: "Udaipur" },
    ],
  },
  groom: {
    name: "Arjun",
    role: "The Groom",
    roleHindi: "दूल्हा",
    description: "An architect from Mumbai who plans every road trip down to the chai stops, and still takes the wrong turn.",
    photo: "",
    tags: [
      { emoji: "📐", label: "Architect" },
      { emoji: "🌊", label: "Mumbai" },
    ],
  },
  brideFamily: { title: "Bride's Family", parents: "Smt. Kavita & Shri Deepak Mehta", grandparents: "Smt. Laxmi & Shri Suresh Mehta" },
  groomFamily: { title: "Groom's Family", parents: "Smt. Ritu & Shri Anil Kapoor", grandparents: "Smt. Pushpa & Shri Harbans Kapoor" },
  events: [
    { id: "haldi", name: "Haldi", hindi: "हल्दी", icon: "🌼", date: "18 Feb", time: "10 AM", isoDate: "2027-02-18", startTime: "10:00", endTime: "13:00", venue: "Mehta Haveli Courtyard", address: "Gangaur Ghat Road, Udaipur", mapUrl: "", dressCode: "Shades of yellow", dressColor: "#F2C94C", details: "A morning of turmeric, dhol and laughter. Wear yellow and be ready to get a little messy.", accent: FUNCTION_PRESETS[4].accent, disabled: false },
    { id: "mehendi", name: "Mehendi", hindi: "मेहंदी", icon: "🌿", date: "18 Feb", time: "4:30 PM", isoDate: "2027-02-18", startTime: "16:30", endTime: "21:00", venue: "Bagore Ki Haveli Lawns", address: "Gangaur Ghat, Udaipur", mapUrl: "", dressCode: "Greens and bright florals", dressColor: "#4F9B6A", details: "Henna artists, folk songs and endless chai. Come get your hands painted.", accent: FUNCTION_PRESETS[5].accent, disabled: false },
    { id: "sangeet", name: "Sangeet", hindi: "संगीत", icon: "🎶", date: "19 Feb", time: "7:30 PM", isoDate: "2027-02-19", startTime: "19:30", endTime: "23:30", venue: "Durbar Hall, Fateh Prakash", address: "City Palace Complex, Udaipur", mapUrl: "", dressCode: "Indo-western glam", dressColor: "#7B3FA0", details: "Performances by both families. The dance floor decides who wins.", accent: FUNCTION_PRESETS[6].accent, disabled: false },
    { id: "baraat", name: "Baraat", hindi: "बारात", icon: "🐎", date: "20 Feb", time: "5:30 PM", isoDate: "2027-02-20", startTime: "17:30", endTime: "19:00", venue: "City Palace Jetty", address: "Lake Pichola, Udaipur", mapUrl: "", dressCode: "Sherwanis and safas", dressColor: "#EE8A2E", details: "Safas are tied from 5 pm. Bring your best dance moves for the dhol.", accent: FUNCTION_PRESETS[8].accent, disabled: false },
    { id: "wedding", name: "Wedding", hindi: "विवाह", icon: "🔥", date: "20 Feb", time: "7:30 PM", isoDate: "2027-02-20", startTime: "19:30", endTime: "23:30", venue: "Jagmandir Island Palace", address: "Lake Pichola, Udaipur", mapUrl: "", dressCode: "Traditional, reds and golds", dressColor: "#A3122B", details: "Boats leave the City Palace jetty every 15 minutes from 6:45 pm. Pheras at the shubh muhurat.", accent: FUNCTION_PRESETS[9].accent, disabled: false },
    { id: "reception", name: "Reception", hindi: "स्वागत समारोह", icon: "✨", date: "21 Feb", time: "7:30 PM", isoDate: "2027-02-21", startTime: "19:30", endTime: "23:30", venue: "The Lawns, Leela Palace", address: "Lake Pichola, Udaipur", mapUrl: "", dressCode: "Evening formal", dressColor: "#2E5AAC", details: "Dinner under the stars and one last dance before everyone heads home.", accent: FUNCTION_PRESETS[12].accent, disabled: false },
  ],
  galleryImages: [
    DEMO_PHOTO("rw-01.webp", 1024, 768, { span: "wide", caption: "Namaste from the bride" }),
    DEMO_PHOTO("rw-05.webp", 680, 1024, { caption: "Alta & payal" }),
    DEMO_PHOTO("rw-04.webp", 1400, 1047, { caption: "The first mehendi" }),
    DEMO_PHOTO("rw-09.webp", 931, 1024, { span: "tall", caption: "Chooda ceremony" }),
    DEMO_PHOTO("rw-03.webp", 1024, 768),
    DEMO_PHOTO("rw-14.webp", 1024, 683, { caption: "Find his name" }),
    DEMO_PHOTO("rw-13.webp", 1024, 683),
    DEMO_PHOTO("rw-11.webp", 1024, 487, { span: "wide" }),
  ],
  wishes: [
    { name: "Rohit & Priya", message: "Bahut bahut badhai! May your home always be full of music and laughter." },
    { name: "Sunita Bua", message: "Sada khush raho beta. God bless the two of you." },
    { name: "Kabir", message: "Finally! See you on the dance floor at the sangeet." },
  ],
  sharePhoto: "",
  theme: "marigold",
  lang: "en",
  invitation:
    "With the blessings of our elders, the Mehta and Kapoor families joyfully invite you and your family to the wedding of Ananya and Arjun.\n\nCome for the haldi, stay for the pheras by Lake Pichola, and fill these days in Udaipur with your love and blessings.",
  hindiMessage: "ईश्वर की असीम कृपा और बड़ों के आशीर्वाद से, अनन्या और अर्जुन के शुभ विवाह के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं।",
  muhurat: "Shubh muhurat 8:40 pm",
  blessingsOf: "Dadi, Nani and all our elders",
  nameOrder: "bride",
  hashtag: "#AnArKiShaadi",
  closingLine: "With love, the Mehta & Kapoor families",
  invocation: true,
  videoUrl: "",
  liveUrl: "",
  upiId: "",
  upiName: "",
  gettingThere: "Udaipur airport (UDR) is 25 km from the city. Cabs will meet every flight on 18 and 19 February; send us your flight number.",
  things: ["Stay: Rooms are held at Hotel Lake Pichola for out-of-town guests.", "Boats: The Jagmandir boats leave from the City Palace jetty."],
  story: [
    { when: "2019", title: "One umbrella, two strangers", line: "They met at a rainy bus stop in Pune, both late for the same lecture, sharing the one umbrella between them.", photo: "/wedding-v3/demo/rw-15.webp", cropX: 50, cropY: 50, scale: 100 },
    { when: "2025", title: "Chai with both families", line: "One long dinner in Udaipur, two families who could not stop talking, and a roka that turned into an impromptu sangeet.", photo: "/wedding-v3/demo/rw-17.webp", cropX: 50, cropY: 50, scale: 100 },
  ],
  contacts: [{ name: "Rohan Mehta", relation: "Ananya's brother", phone: "+91 98290 11223" }],
  musicMode: "youtube",
  musicYoutubeId: "OzEL4CwbPew",
  musicStart: 0,
  rsvpOn: true,
  rsvpBy: "2027-02-05",
  rsvpMeal: false,
  maxGuests: 6,
  couplePhoto: "",
  brideCrop: { x: 50, y: 35, scale: 100 },
  groomCrop: { x: 50, y: 35, scale: 100 },
  coupleCrop: { x: 50, y: 40, scale: 100 },
};

/**
 * The demo with every AI-writable slot empty (rows kept, so every declared
 * index exists). `useStoryFill` diffs the form against THIS, so a field counts
 * as the sender's own only when they typed something; see blankForAi().
 */
export const AI_BLANK: ShaadiCardData = (() => {
  const b: ShaadiCardData = JSON.parse(JSON.stringify(DEMO));
  b.brideName = "";
  b.groomName = "";
  b.weddingDay = "";
  b.venue = "";
  b.invitation = "";
  b.hindiMessage = "";
  b.brideFamily.parents = "";
  b.groomFamily.parents = "";
  b.bride.description = "";
  b.groom.description = "";
  b.muhurat = "";
  b.closingLine = "";
  b.things = [];
  b.events = b.events.map((e) => ({ ...e, name: "", isoDate: "", startTime: "", venue: "" }));
  b.story = b.story.map((c) => ({ ...c, title: "", line: "" }));
  b.contacts = b.contacts.map(() => ({ name: "", relation: "", phone: "" }));
  return b;
})();

// ── DB ⇄ form ───────────────────────────────────────────────────────────────

const THEMES: ShaadiTheme[] = ["marigold", "haldi", "rani", "mehendi"];
const MODES: (MusicMode | "")[] = ["", "off", "melody", "youtube", "track"];
const SPANS: PhotoSpan[] = ["normal", "wide", "tall", "large"];

const crop = (v: unknown, fb: Crop): Crop => {
  const c = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  return { x: n(c.x, fb.x), y: n(c.y, fb.y), scale: n(c.scale, fb.scale) };
};

/**
 * A stored page (old or new) → the form/render shape. Old pages: no theme,
 * music, invitation text, ids or ISO dates; each gets a sensible value here
 * (the invitation falls back to copy written from the names at render time).
 */
export function fromDb(d: Record<string, unknown>): ShaadiCardData {
  const brideName = s(d.brideName);
  const groomName = s(d.groomName);
  const weddingDate = s(d.weddingDate);
  const { day, time } = splitWeddingDate(weddingDate);
  const rawEvents = Array.isArray(d.events) ? (d.events as Record<string, unknown>[]) : [];
  const events: ShaadiEvent[] = withEventIds(
    rawEvents.map((e) => {
      const isoDate = isIsoDay(e.isoDate) ? (e.isoDate as string) : parseOldDate(s(e.date), day);
      const startTime = isHHMM(e.startTime) ? (e.startTime as string) : parseOldTime(s(e.time));
      return {
        name: s(e.name),
        hindi: s(e.hindi),
        icon: s(e.icon),
        date: s(e.date),
        time: s(e.time),
        venue: s(e.venue),
        details: s(e.details),
        accent: s(e.accent),
        disabled: Boolean(e.disabled),
        id: s(e.id),
        isoDate,
        startTime,
        endTime: s(e.endTime),
        address: s(e.address),
        mapUrl: s(e.mapUrl),
        dressCode: s(e.dressCode),
        dressColor: s(e.dressColor),
      };
    }),
  );
  const photos = Array.isArray(d.galleryImages) ? (d.galleryImages as Record<string, unknown>[]) : [];
  const person = (who: "bride" | "groom"): Person => ({
    name: who === "bride" ? brideName : groomName,
    role: who === "bride" ? "The Bride" : "The Groom",
    roleHindi: who === "bride" ? "दुल्हन" : "दूल्हा",
    description: s(d[`${who}Description`]),
    photo: s(d[`${who}Photo`]),
    tags: Array.isArray(d[`${who}Tags`]) ? (d[`${who}Tags`] as { emoji: string; label: string }[]).filter((t) => t && (t.label || t.emoji)).map((t) => ({ emoji: s(t.emoji), label: s(t.label) })) : [],
  });
  const theme = THEMES.includes(d.theme as ShaadiTheme) ? (d.theme as ShaadiTheme) : "marigold";
  const musicMode = MODES.includes(d.musicMode as MusicMode) ? (d.musicMode as MusicMode | "") : "";
  return {
    brideName,
    groomName,
    weddingDate,
    weddingDay: day,
    weddingTime: time,
    venue: s(d.venue),
    blessing: s(d.blessing) || "ॐ शुभ विवाह",
    bride: person("bride"),
    groom: person("groom"),
    brideFamily: { title: "Bride's Family", parents: s(d.brideFamilyParents), grandparents: s(d.brideFamilyGrandparents) },
    groomFamily: { title: "Groom's Family", parents: s(d.groomFamilyParents), grandparents: s(d.groomFamilyGrandparents) },
    events,
    galleryImages: photos
      .filter((g) => g && typeof g.src === "string" && g.src)
      .map((g) => ({
        src: s(g.src),
        alt: s(g.alt),
        ...(typeof g.cropX === "number" ? { cropX: g.cropX } : {}),
        ...(typeof g.cropY === "number" ? { cropY: g.cropY } : {}),
        ...(typeof g.scale === "number" ? { scale: g.scale } : {}),
        ...(SPANS.includes(g.span as PhotoSpan) ? { span: g.span as PhotoSpan } : {}),
        ...(typeof g.w === "number" && g.w > 0 ? { w: g.w } : {}),
        ...(typeof g.h === "number" && g.h > 0 ? { h: g.h } : {}),
        ...(s(g.caption) ? { caption: s(g.caption) } : {}),
      })),
    wishes: (Array.isArray(d.blessings) ? (d.blessings as Record<string, unknown>[]) : []).map((b) => ({
      name: s(b.name),
      message: s(b.message),
      ...(s(b.voiceUrl) ? { voiceUrl: s(b.voiceUrl) } : {}),
    })),
    sharePhoto: s(d.sharePhoto),
    theme,
    lang: d.lang === "hi" ? "hi" : "en",
    invitation: s(d.invitation),
    hindiMessage: s(d.hindiMessage),
    muhurat: s(d.muhurat),
    blessingsOf: s(d.blessingsOf),
    nameOrder: d.nameOrder === "groom" ? "groom" : "bride",
    hashtag: s(d.hashtag),
    closingLine: s(d.closingLine),
    invocation: d.invocation !== false,
    videoUrl: s(d.videoUrl),
    liveUrl: s(d.liveUrl),
    upiId: s(d.upiId),
    upiName: s(d.upiName),
    gettingThere: s(d.gettingThere),
    things: Array.isArray(d.things) ? (d.things as unknown[]).map(s).filter(Boolean) : [],
    story: (Array.isArray(d.story) ? (d.story as Record<string, unknown>[]) : []).map((c) => ({
      when: s(c.when),
      title: s(c.title),
      line: s(c.line),
      photo: s(c.photo),
      cropX: n(c.cropX, 50),
      cropY: n(c.cropY, 50),
      scale: n(c.scale, 100),
    })),
    contacts: (Array.isArray(d.contacts) ? (d.contacts as Record<string, unknown>[]) : []).map((c) => ({ name: s(c.name), relation: s(c.relation), phone: s(c.phone) })),
    musicMode,
    musicYoutubeId: s(d.musicYoutubeId),
    musicStart: n(d.musicStart, 0),
    rsvpOn: d.rsvpOn !== false,
    rsvpBy: s(d.rsvpBy),
    rsvpMeal: d.rsvpMeal === true,
    maxGuests: n(d.maxGuests, 6),
    couplePhoto: s(d.couplePhoto),
    brideCrop: crop(d.brideCrop, { x: 50, y: 35, scale: 100 }),
    groomCrop: crop(d.groomCrop, { x: 50, y: 35, scale: 100 }),
    coupleCrop: crop(d.coupleCrop, { x: 50, y: 40, scale: 100 }),
  };
}

/** The form → the request body (old keys exactly as before, plus the new ones). */
export function toBody(data: ShaadiCardData, password?: string) {
  const weddingDate = joinWeddingDate(data.weddingDay, data.weddingTime) || data.weddingDate;
  return {
    brideName: data.brideName.trim(),
    groomName: data.groomName.trim(),
    weddingDate,
    venue: data.venue,
    blessing: data.blessing,
    bridePhoto: data.bride.photo,
    brideDescription: data.bride.description,
    brideTags: data.bride.tags,
    brideFamilyParents: data.brideFamily.parents,
    brideFamilyGrandparents: data.brideFamily.grandparents,
    groomPhoto: data.groom.photo,
    groomDescription: data.groom.description,
    groomTags: data.groom.tags,
    groomFamilyParents: data.groomFamily.parents,
    groomFamilyGrandparents: data.groomFamily.grandparents,
    events: withEventIds(data.events).map((e) => {
      const p = presetFor(e.name);
      return {
        ...e,
        hindi: e.hindi || p?.hindi || "",
        icon: e.icon || p?.icon || "🎊",
        accent: e.accent || p?.accent || "",
        date: isIsoDay(e.isoDate) ? displayDay(e.isoDate) : e.date,
        time: isHHMM(e.startTime) ? displayClock(e.startTime) : e.time,
        disabled: Boolean(e.disabled),
      };
    }),
    galleryImages: data.galleryImages.map((g) => ({ ...g })),
    sharePhoto: data.sharePhoto || "",
    theme: data.theme,
    lang: data.lang,
    invitation: data.invitation,
    hindiMessage: data.hindiMessage,
    muhurat: data.muhurat,
    blessingsOf: data.blessingsOf,
    nameOrder: data.nameOrder,
    hashtag: data.hashtag,
    closingLine: data.closingLine,
    invocation: data.invocation,
    videoUrl: data.videoUrl,
    liveUrl: data.liveUrl,
    upiId: data.upiId,
    upiName: data.upiName,
    gettingThere: data.gettingThere,
    things: data.things.filter((t) => t.trim()),
    story: data.story.filter((c) => c.title.trim() || c.line.trim() || c.photo),
    contacts: data.contacts.filter((c) => c.name.trim() && c.phone.trim()),
    musicMode: data.musicMode,
    musicYoutubeId: data.musicYoutubeId,
    musicStart: data.musicStart,
    rsvpOn: data.rsvpOn,
    rsvpBy: data.rsvpBy,
    rsvpMeal: data.rsvpMeal,
    maxGuests: data.maxGuests,
    couplePhoto: data.couplePhoto,
    brideCrop: data.brideCrop,
    groomCrop: data.groomCrop,
    coupleCrop: data.coupleCrop,
    password: password || "",
  };
}

/** A sessionStorage draft (old drafts were plain ShaadiData) → the current shape. */
export function fromDraft(raw: unknown): ShaadiCardData | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  // Already the new shape (it carries weddingDay): merge over the demo for any missing key.
  if (typeof d.weddingDay === "string") {
    const out = { ...DEMO, ...(d as Partial<ShaadiCardData>) } as ShaadiCardData;
    out.events = withEventIds(Array.isArray(out.events) ? out.events : []);
    return out;
  }
  // An old draft: the flat stored keys live in nested objects; flatten what fromDb needs.
  const bride = (d.bride ?? {}) as Record<string, unknown>;
  const groom = (d.groom ?? {}) as Record<string, unknown>;
  const bf = (d.brideFamily ?? {}) as Record<string, unknown>;
  const gf = (d.groomFamily ?? {}) as Record<string, unknown>;
  return fromDb({
    ...d,
    bridePhoto: bride.photo,
    brideDescription: bride.description,
    brideTags: bride.tags,
    groomPhoto: groom.photo,
    groomDescription: groom.description,
    groomTags: groom.tags,
    brideFamilyParents: bf.parents,
    brideFamilyGrandparents: bf.grandparents,
    groomFamilyParents: gf.parents,
    groomFamilyGrandparents: gf.grandparents,
    blessings: d.wishes,
  });
}

// ── The render model ────────────────────────────────────────────────────────

export interface RenderEvent extends WeddingEvent {
  name: string;
  hindi: string;
  icon: string;
  art: string;
  /** A date we could not read ("13th night") is shown as typed. */
  rawDate: string;
  rawTime: string;
}

export interface ShaadiView {
  first: string;
  second: string;
  bride: string;
  groom: string;
  couple: string;
  day: string;
  time: string;
  events: RenderEvent[];
  main?: RenderEvent;
  gallery: LovePhoto[];
  story: StoryChapter[];
  contacts: (Contact & { dial: string })[];
  things: { head: string; text: string }[];
  videoId: string;
}

export const dialOf = (raw: string): string => {
  const d = (raw || "").replace(/\D/g, "");
  const ten = d.length === 12 && d.startsWith("91") ? d.slice(2) : d.length === 11 && d.startsWith("0") ? d.slice(1) : d;
  return /^[6-9]\d{9}$/.test(ten) ? `91${ten}` : "";
};

export function youTubeIdOf(url: string): string {
  const m = (url || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : "";
}

export const isUpiId = (v: string) => /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(v.trim());

export function readView(d: ShaadiCardData): ShaadiView {
  const bride = d.brideName.trim() || "Bride";
  const groom = d.groomName.trim() || "Groom";
  const [first, second] = d.nameOrder === "groom" ? [groom, bride] : [bride, groom];
  const { day: dDay, time: dTime } = splitWeddingDate(d.weddingDate);
  const day = isIsoDay(d.weddingDay) ? d.weddingDay : dDay;
  const time = isHHMM(d.weddingTime) ? d.weddingTime : dTime;
  const events: RenderEvent[] = d.events
    .filter((e) => !e.disabled && (e.name.trim() || e.venue.trim()))
    .map((e, i) => {
      const p = presetFor(e.name);
      const iso = isIsoDay(e.isoDate) ? e.isoDate : parseOldDate(e.date, day);
      const t = isHHMM(e.startTime) ? e.startTime : parseOldTime(e.time);
      return {
        id: e.id || `e${i}`,
        title: e.name.trim() || "Celebration",
        date: iso,
        time: t,
        endTime: isHHMM(e.endTime) ? e.endTime : undefined,
        venue: e.venue.trim(),
        address: (e.address || "").trim(),
        mapUrl: /^https:\/\//i.test(e.mapUrl || "") ? e.mapUrl : "",
        dressCode: (e.dressCode || "").trim(),
        dressColor: swatchFor(e),
        note: e.details.trim(),
        name: e.name.trim(),
        hindi: e.hindi.trim() || p?.hindi || "",
        icon: e.icon || p?.icon || "🎊",
        art: p?.art || "fn-wedding",
        rawDate: iso ? "" : e.date.trim(),
        rawTime: t ? "" : e.time.trim(),
      };
    });
  const main = events.find((e) => MAIN_RE.test(e.title)) ?? events.find((e) => e.date === day) ?? undefined;
  return {
    first,
    second,
    bride,
    groom,
    couple: `${first} & ${second}`,
    day,
    time,
    events,
    main,
    gallery: d.galleryImages.filter((g) => g.src).map((g) => ({ url: g.src, caption: g.caption || g.alt || undefined, cropX: g.cropX, cropY: g.cropY, scale: g.scale, span: g.span, w: g.w, h: g.h })),
    story: d.story.filter((c) => c.title.trim() || c.line.trim()),
    contacts: d.contacts.map((c) => ({ ...c, dial: dialOf(c.phone) })).filter((c) => c.name.trim() && c.dial),
    things: d.things
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => {
        const m = t.match(/^([^:]{2,28}):\s*(.+)$/);
        return m ? { head: m[1].trim(), text: m[2].trim() } : { head: "", text: t };
      }),
    videoId: youTubeIdOf(d.videoUrl),
  };
}

/** The card's own song (every page saved before the rebuild plays it). */
export const LEGACY_TRACK = { url: "https://cdn.subhsandesh.in/gifts-media/shaadi-card/music/ratein.mp3", title: "Ratein (the classic Shaadi Card song)", hint: "The song this card always played" };

/** Wedding songs, one tap each (the same oEmbed-verified uploads as RW_SONGS, 2026-10-19). The shehnai is the default. */
export const SHAADI_SONGS: readonly SongSuggestion[] = [
  { id: "OzEL4CwbPew", title: "Wedding Shehnai (Kanyadaan)", artist: "Ustad Bismillah Khan" },
  { id: "1LVpuWpRs3I", title: "Din Shagna Da", artist: "Jasleen Royal" },
  { id: "8XtXLVylOoU", title: "Saajanji Ghar Aaye", artist: "Alka Yagnik, Kumar Sanu" },
  { id: "3qpxJEp4Ec4", title: "Kudmayi", artist: "Shahid Mallya" },
  { id: "-bNwqXvMuB8", title: "Mehndi Laga Ke Rakhna", artist: "Lata Mangeshkar, Udit Narayan" },
  { id: "jCEdTq3j-0U", title: "Gallan Goodiyaan", artist: "Dil Dhadakne Do" },
  { id: "V7LwfY5U5WI", title: "Ranjha", artist: "B Praak, Jasleen Royal" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "lwLVJ0E8gN4", title: "Kabira (Encore)", artist: "Arijit Singh, Harshdeep Kaur" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];

/** The shell's music settings. A page saved before music was a choice ("") plays the card's own song. */
export const musicSettings = (d: Pick<ShaadiCardData, "musicMode" | "musicYoutubeId" | "musicStart">) => ({
  musicMode: (d.musicMode || "track") as MusicMode,
  musicYoutubeId: d.musicYoutubeId,
  musicStart: d.musicStart,
});

/** The invitation an old page (saved before it had one) shows. */
export function defaultInvitation(first: string, second: string, city: string): string {
  return `With the blessings of our elders, we joyfully invite you and your family to the wedding of ${first} and ${second}.\n\nYour presence${city ? ` in ${city}` : ""} and your blessings will make our celebrations complete.`;
}

// ── Words (EN + HI) ─────────────────────────────────────────────────────────

export const T = {
  en: {
    dear: "Dear",
    invitedYou: "you are warmly invited",
    together: "Together with their families",
    open: "Tap to open the khidki",
    opening: "Opening your invitation…",
    and: "and",
    shubh: "Shubh Vivah",
    weddingOf: "The wedding of",
    invitation: "Nimantran",
    invitationTitle: "You are invited",
    families: "With love from both families",
    brideSide: "Bride's family",
    groomSide: "Groom's family",
    grandparents: "Grandparents",
    blessingsOf: "With the blessings of",
    couple: "The couple",
    coupleTitle: "Meet the bride & groom",
    bride: "The Bride",
    groom: "The Groom",
    dateEyebrow: "Save the date",
    countdownTitle: "Counting the days",
    story: "Our story",
    storyEyebrow: "How it began",
    events: "The celebrations",
    eventsEyebrow: "Functions",
    venueEyebrow: "The venue",
    directions: "Directions",
    map: "Open in Maps",
    calendar: "Add to calendar",
    google: "Google",
    saveAll: "Save all dates",
    saveDate: "Save the date",
    saved: "Saved",
    dress: "Dress code",
    tba: "Time to be announced",
    gettingThere: "Getting there",
    film: "Our film",
    filmEyebrow: "Watch",
    play: "Play our film",
    gallery: "Moments",
    galleryEyebrow: "Album",
    goodToKnow: "Good to know",
    notesEyebrow: "For our guests",
    contacts: "Who to call",
    contactsIntro: "Questions about travel, stay or timings? The family is a call away.",
    call: "Call",
    chat: "WhatsApp",
    shagun: "Shagun",
    shagunIntro: "Your presence is the greatest gift. If you still wish to bless the couple, you can send shagun here.",
    upiPay: "Pay by UPI",
    upiCopy: "Copy UPI id",
    upiCopied: "Copied",
    rsvp: "Will you join us?",
    rsvpEyebrow: "Kindly reply",
    rsvpIntro: "Tell us who is coming and to which functions. It takes ten seconds.",
    blessings: "Blessings",
    blessingsEyebrow: "Aashirwad",
    blessingsIntro: "Leave a few words (or a voice note) for the couple. They will treasure every one.",
    closing: "Your blessings are all we wish for",
    whatsapp: "Send on WhatsApp",
    share: "Share",
    copy: "Copy link",
    copied: "Link copied",
    card: "Save invite card",
    cardMaking: "Making your card…",
    qr: "Show QR",
    qrHint: "Scan to open the invitation",
    close: "Close",
    live: "Watch live",
    liveSoon: "Live link opens 30 min before",
    replay: "Replay opening",
    create: "Make your own invitation",
    today: "Today is the day!",
    married: "Just married",
    muhurat: "Muhurat",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
  },
  hi: {
    dear: "प्रिय",
    invitedYou: "आप सादर आमंत्रित हैं",
    together: "परिवारों के आशीर्वाद सहित",
    open: "खिड़की खोलिए",
    opening: "निमंत्रण खुल रहा है…",
    and: "और",
    shubh: "शुभ विवाह",
    weddingOf: "शुभ विवाह",
    invitation: "निमंत्रण",
    invitationTitle: "आप आमंत्रित हैं",
    families: "दोनों परिवारों की ओर से",
    brideSide: "वधू पक्ष",
    groomSide: "वर पक्ष",
    grandparents: "दादा-दादी",
    blessingsOf: "आशीर्वाद",
    couple: "वर-वधू",
    coupleTitle: "दुल्हन और दूल्हा",
    bride: "दुल्हन",
    groom: "दूल्हा",
    dateEyebrow: "तारीख़ याद रखें",
    countdownTitle: "शुभ घड़ी की प्रतीक्षा",
    story: "हमारी कहानी",
    storyEyebrow: "कैसे शुरू हुआ",
    events: "शुभ कार्यक्रम",
    eventsEyebrow: "कार्यक्रम",
    venueEyebrow: "स्थान",
    directions: "रास्ता",
    map: "मैप में खोलें",
    calendar: "कैलेंडर में जोड़ें",
    google: "Google",
    saveAll: "सभी तारीख़ें सहेजें",
    saveDate: "तारीख़ सहेजें",
    saved: "सहेजा गया",
    dress: "पहनावा",
    tba: "समय जल्द बताएँगे",
    gettingThere: "कैसे पहुँचें",
    film: "हमारी फ़िल्म",
    filmEyebrow: "देखिए",
    play: "फ़िल्म चलाएँ",
    gallery: "यादें",
    galleryEyebrow: "एल्बम",
    goodToKnow: "ज़रूरी बातें",
    notesEyebrow: "मेहमानों के लिए",
    contacts: "किससे बात करें",
    contactsIntro: "यात्रा, ठहरने या समय के बारे में कुछ पूछना हो तो परिवार बस एक कॉल दूर है।",
    call: "कॉल",
    chat: "WhatsApp",
    shagun: "शगुन",
    shagunIntro: "आपकी उपस्थिति ही सबसे बड़ा उपहार है। फिर भी आशीर्वाद स्वरूप शगुन भेजना चाहें तो यहाँ भेज सकते हैं।",
    upiPay: "UPI से भेजें",
    upiCopy: "UPI id कॉपी करें",
    upiCopied: "कॉपी हुआ",
    rsvp: "क्या आप आएँगे?",
    rsvpEyebrow: "कृपया बताएँ",
    rsvpIntro: "बताइए कौन आ रहा है और किन कार्यक्रमों में। बस दस सेकंड लगेंगे।",
    blessings: "आशीर्वाद",
    blessingsEyebrow: "शुभकामनाएँ",
    blessingsIntro: "वर-वधू के लिए कुछ शब्द (या एक वॉइस नोट) छोड़ जाइए।",
    closing: "आपका आशीर्वाद ही हमारी कामना है",
    whatsapp: "WhatsApp पर भेजें",
    share: "शेयर करें",
    copy: "लिंक कॉपी करें",
    copied: "लिंक कॉपी हुआ",
    card: "निमंत्रण कार्ड सहेजें",
    cardMaking: "कार्ड बन रहा है…",
    qr: "QR दिखाएँ",
    qrHint: "निमंत्रण खोलने के लिए स्कैन करें",
    close: "बंद करें",
    live: "लाइव देखें",
    liveSoon: "लाइव लिंक 30 मिनट पहले खुलेगा",
    replay: "फिर से खोलें",
    create: "अपना निमंत्रण बनाइए",
    today: "आज शुभ दिन है!",
    married: "शुभ विवाह सम्पन्न",
    muhurat: "मुहूर्त",
    days: "दिन",
    hours: "घंटे",
    minutes: "मिनट",
    seconds: "सेकंड",
  },
} as const;

export type Strings = { [K in keyof (typeof T)["en"]]: string };
