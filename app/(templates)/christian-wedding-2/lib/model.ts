// ─── Christian Wedding — Scroll Edition: the data model ─────────────────────
//
// `Cw2Data` is the editor's form state (and what the AI fill writes into).
// On the wire it is the christian_wedding_pages document: the shared flat
// fields (brideName, events, galleryImages…) that BOTH editions read, plus one
// optional object `scrollExtras` that only this edition writes (see server
// services/christianScrollExtras.ts). `fromDoc` reads either shape: a page
// published before scrollExtras existed is derived from its flat fields
// (events "21 Jul" → ISO dates, galleryImages → photos, ids f1, f2… for RSVPs).
// Everything coming in is untrusted and coerced.

import type { LovePhoto } from "../../_love/types";
import type { WeddingEvent } from "../../_wedding/types";

export type SecondLang = "none" | "hi" | "ml" | "ta";
export type Cw2Theme = "blossom" | "sage" | "ivory";

export interface Crop {
  x: number;
  y: number;
  scale: number;
}
export const CROP_DEFAULT: Crop = { x: 50, y: 50, scale: 100 };

export interface Portrait {
  url: string;
  crop: Crop;
}

export interface Person {
  name: string;
  description: string;
}

export interface Family {
  parents: string;
  grandparents: string;
}

export interface Chapter {
  when: string;
  title: string;
  line: string;
  photo: string;
  crop: Crop;
}

export interface ServiceItem {
  time: string;
  title: string;
  note: string;
}

export interface Contact {
  name: string;
  relation: string;
  phone: string;
}

export interface Note {
  head: string;
  text: string;
}

export interface Cw2Data {
  brideName: string;
  groomName: string;
  nameOrder: "bride" | "groom";
  bride: Person;
  groom: Person;
  bridePhoto: Portrait;
  groomPhoto: Portrait;
  couplePhoto: Portrait;
  brideFamily: Family;
  groomFamily: Family;
  blessingsOf: string;
  scripture: { text: string; ref: string };
  invitation: string;
  secondLang: SecondLang;
  altInvitation: string;
  altVerse: string;
  events: WeddingEvent[];
  order: ServiceItem[];
  story: Chapter[];
  gallery: LovePhoto[];
  contacts: Contact[];
  things: Note[];
  gettingThere: string;
  videoUrl: string;
  liveUrl: string;
  upiId: string;
  upiName: string;
  music: { youtubeId: string; start: number; enabled: boolean };
  theme: Cw2Theme;
  rsvpOn: boolean;
  rsvpBy: string;
  maxGuests: number;
  rsvpMeal: boolean;
  hashtag: string;
  closing: string;
  /** The legacy one-line blessing ("God bless this union"), kept for old pages and shown in the finale. */
  blessing: string;
  /** Kept untouched for the tabs edition (it shows them as chips). */
  brideTags: { emoji: string; label: string }[];
  groomTags: { emoji: string; label: string }[];
}

export const LIMITS = { events: 8, order: 12, story: 8, contacts: 4, things: 6, gallery: 40 } as const;

// ── Curated content ─────────────────────────────────────────────────────────

/** Eight verses couples choose most (KJV/NIV-style wording, public domain renderings). */
export const VERSES: { ref: string; text: string }[] = [
  { ref: "1 Corinthians 13:4–7", text: "Love is patient, love is kind. It does not envy, it does not boast. It bears all things, believes all things, hopes all things, endures all things." },
  { ref: "1 Corinthians 13:13", text: "And now these three remain: faith, hope and love. But the greatest of these is love." },
  { ref: "Genesis 2:24", text: "Therefore shall a man leave his father and his mother, and shall cleave unto his wife: and they shall be one flesh." },
  { ref: "Ecclesiastes 4:12", text: "A cord of three strands is not quickly broken." },
  { ref: "Song of Songs 8:7", text: "Many waters cannot quench love, neither can the floods drown it." },
  { ref: "Ruth 1:16", text: "Whither thou goest, I will go; and where thou lodgest, I will lodge: thy people shall be my people, and thy God my God." },
  { ref: "Colossians 3:14", text: "And over all these virtues put on love, which binds them all together in perfect unity." },
  { ref: "Mark 10:9", text: "What therefore God hath joined together, let not man put asunder." },
];

export const QUICK_FUNCTIONS: { title: string; dress: string; color: string; time: string }[] = [
  { title: "Betrothal", dress: "Festive pastels", color: "#e8a5b5", time: "11:00" },
  { title: "Bridal Shower", dress: "Florals and blush", color: "#e8a5b5", time: "16:00" },
  { title: "Rehearsal Dinner", dress: "Smart casual", color: "#9db59a", time: "19:00" },
  { title: "Holy Matrimony", dress: "Formal, soft pastels", color: "#f3ebdd", time: "15:30" },
  { title: "Nuptial Mass", dress: "Formal, soft pastels", color: "#f3ebdd", time: "10:30" },
  { title: "Reception", dress: "Cocktail chic", color: "#c9a24a", time: "19:00" },
  { title: "Farewell Brunch", dress: "Smart casual", color: "#9db59a", time: "11:00" },
];

export const SERVICE_PRESETS: ServiceItem[] = [
  { time: "15:30", title: "Processional", note: "The bride walks down the aisle" },
  { time: "15:45", title: "Readings & sermon", note: "" },
  { time: "16:05", title: "Exchange of vows", note: "" },
  { time: "16:15", title: "Blessing of the rings", note: "" },
  { time: "16:30", title: "Recessional", note: "Petals at the church door" },
];

export const SWATCHES = ["#f3ebdd", "#e8a5b5", "#9db59a", "#c9a24a", "#a9c6dd", "#b9a3d1", "#f2c94c", "#1c1c24"];

export const SECOND_LANG_LABEL: Record<SecondLang, string> = { none: "None", hi: "हिन्दी (Hindi)", ml: "മലയാളം (Malayalam)", ta: "தமிழ் (Tamil)" };

// ── Demo: a believable Kerala church wedding ────────────────────────────────

const D = "/wedding-v3/christian2/demo";
const ph = (name: string, w: number, h: number, extra: Partial<LovePhoto> = {}): LovePhoto => ({ url: `${D}/${name}.webp`, w, h, cropX: 50, cropY: 50, scale: 100, span: "normal", ...extra });

export const DEMO: Cw2Data = {
  brideName: "Anna",
  groomName: "Joel",
  nameOrder: "bride",
  bride: { name: "Anna", description: "A paediatric nurse who sings alto in the parish choir and never says no to a beach walk." },
  groom: { name: "Joel", description: "An architect who sketches churches on napkins and makes the best Sunday appam." },
  bridePhoto: { url: `${D}/bride-garden-bouquet.webp`, crop: { x: 50, y: 30, scale: 100 } },
  groomPhoto: { url: `${D}/confetti.webp`, crop: { x: 44, y: 35, scale: 100 } },
  couplePhoto: { url: `${D}/forehead-kiss.webp`, crop: { x: 57, y: 40, scale: 100 } },
  brideFamily: { parents: "Mr. Thomas & Mrs. Mary Kurian", grandparents: "Late Mr. K. J. Kurian & Mrs. Eliyamma Kurian" },
  groomFamily: { parents: "Mr. George & Mrs. Annamma Varghese", grandparents: "Mr. P. V. Varghese & Mrs. Rosamma Varghese" },
  blessingsOf: "With the blessings of our grandparents and the parish of St. Mary's",
  scripture: { ...VERSES[0] },
  invitation:
    "By the grace of God and with the blessings of our parents, Anna and Joel request the honour of your presence as they are united in Holy Matrimony.\n\nCome and pray with us at the basilica, then stay for an evening of music, food and dancing by the backwaters. Your presence is the greatest gift.",
  secondLang: "none",
  altInvitation: "",
  altVerse: "",
  events: [
    { id: "betrothal", title: "Betrothal", date: "2027-01-10", time: "11:00", endTime: "13:00", venue: "St. Mary's Basilica, Kochi", address: "Ernakulam, Kochi, Kerala", mapUrl: "", dressCode: "Festive pastels", dressColor: "#e8a5b5", note: "Lunch at the parish hall follows." },
    { id: "rehearsal", title: "Rehearsal Dinner", date: "2027-01-15", time: "19:00", endTime: "22:00", venue: "The Lighthouse Terrace", address: "Fort Kochi, Kerala", mapUrl: "", dressCode: "Smart casual", dressColor: "#9db59a", note: "" },
    { id: "matrimony", title: "Holy Matrimony", date: "2027-01-16", time: "15:30", endTime: "17:00", venue: "St. Mary's Basilica", address: "Ernakulam, Kochi, Kerala", mapUrl: "", dressCode: "Formal, soft pastels", dressColor: "#f3ebdd", note: "Please be seated by 3:15 pm." },
    { id: "reception", title: "Reception", date: "2027-01-16", time: "19:00", endTime: "23:00", venue: "Backwater Lawns, Bolgatty Palace", address: "Mulavukad, Kochi, Kerala", mapUrl: "", dressCode: "Cocktail chic", dressColor: "#c9a24a", note: "Dinner, toasts and a first dance under the stars." },
    { id: "brunch", title: "Farewell Brunch", date: "2027-01-17", time: "11:00", endTime: "13:00", venue: "Kurian family home", address: "Kadavanthra, Kochi", mapUrl: "", dressCode: "Smart casual", dressColor: "#a9c6dd", note: "" },
  ],
  order: SERVICE_PRESETS.map((s) => ({ ...s })),
  story: [
    { when: "2019", title: "A choir practice in Kochi", line: "They met when Joel came to fix the church's broken organ loft and stayed for Anna's Christmas choir rehearsal.", photo: `${D}/by-the-pond.webp`, crop: { ...CROP_DEFAULT } },
    { when: "2025", title: "A yes by the sea", line: "Six years and a hundred beach walks later, he asked on the shore at Cherai, as the sun went down.", photo: `${D}/hands-bouquet.webp`, crop: { ...CROP_DEFAULT } },
  ],
  gallery: [
    ph("altar-blessing", 854, 1280, { span: "tall", caption: "Blessed at the altar" }),
    ph("rings-on-bible", 1280, 853, { caption: "Two rings, one Word" }),
    ph("garden-aisle", 1280, 854, { span: "wide" }),
    ph("floral-embrace", 1280, 853),
    ph("bride-bouquet", 853, 1280),
    ph("gazebo-kiss", 853, 1280, { span: "tall" }),
    ph("bride-orchard", 1280, 853, { cropX: 24 }),
    ph("cheers", 1280, 853),
    ph("reception-hall", 1280, 853, { span: "wide", caption: "Where we'll dance" }),
    ph("wedding-day-bouquet", 1280, 853),
    ph("bride-holds-bands", 1280, 853),
  ],
  contacts: [{ name: "Ben Kurian", relation: "Anna's brother", phone: "+91 98470 11223" }],
  things: [
    { head: "Parking", text: "The basilica car park opens at 2:30 pm; volunteers will guide you." },
    { head: "Children", text: "Little ones are very welcome — there is a quiet room behind the sacristy." },
  ],
  gettingThere: "Kochi airport (COK) is 40 minutes away. We have held rooms at the Bolgatty Palace for out-of-town guests — mention our names.",
  videoUrl: "",
  liveUrl: "",
  upiId: "",
  upiName: "",
  music: { youtubeId: "Ptk_1Dc2iPY", start: 0, enabled: true },
  theme: "blossom",
  rsvpOn: true,
  rsvpBy: "2026-12-31",
  maxGuests: 4,
  rsvpMeal: false,
  hashtag: "#AnnaWedsJoel",
  closing: "With love and prayers, the Kurian & Varghese families",
  blessing: "God bless this union",
  brideTags: [],
  groomTags: [],
};

// ── Coercion helpers ────────────────────────────────────────────────────────

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const s = (v: unknown, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");
const n = (v: unknown, min: number, max: number, d: number) => {
  const x = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  return Number.isFinite(x) ? Math.min(max, Math.max(min, Math.round(x))) : d;
};
const oneOf = <T extends string>(v: unknown, list: readonly T[], d: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : d);
const crop = (v: unknown): Crop => {
  const o = isObj(v) ? v : {};
  return { x: n(o.x, 0, 100, 50), y: n(o.y, 0, 100, 50), scale: n(o.scale, 100, 300, 100) };
};
const portrait = (v: unknown, fallbackUrl = ""): Portrait => {
  const o = isObj(v) ? v : {};
  return { url: s(o.url) || fallbackUrl, crop: crop(o.crop) };
};

/** A stable id for a row that has none (old pages: f1, f2… in stored order — the server derives the same). */
export const fallbackEventId = (i: number) => `f${i + 1}`;

export function newEventId(taken: Iterable<string>): string {
  const set = new Set(taken);
  for (;;) {
    const id = `e${Math.random().toString(36).slice(2, 8)}`;
    if (!set.has(id)) return id;
  }
}

const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };

/** "21 Jul" / "July 21" / "2026-07-21" → "2026-07-21" (year from the wedding date). "" when it cannot be read. */
export function legacyDateToIso(raw: string, year: number): string {
  const t = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  let m = t.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)/i);
  let day = 0;
  let mon = 0;
  if (m) {
    day = Number(m[1]);
    mon = MONTHS[m[2].slice(0, 4).toLowerCase()] ?? MONTHS[m[2].slice(0, 3).toLowerCase()] ?? 0;
  } else {
    m = t.match(/^([a-z]+)\s+(\d{1,2})/i);
    if (m) {
      mon = MONTHS[m[1].slice(0, 4).toLowerCase()] ?? MONTHS[m[1].slice(0, 3).toLowerCase()] ?? 0;
      day = Number(m[2]);
    }
  }
  if (!day || !mon || day > 31) return "";
  return `${year}-${String(mon).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** "6 PM", "4:30pm", "19:30" → "19:30"; "" when unreadable. */
export function toHHMM(raw: string): string {
  const t = raw.trim();
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
  if (!m) return "";
  let h = Number(m[1]);
  const mi = Number(m[2] ?? 0);
  const ap = (m[3] ?? "").toLowerCase().replace(/\./g, "");
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return h < 24 && mi < 60 ? `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}` : "";
}

/** "2027-01-16" + "15:30" → the legacy display pair ("16 Jan", "3:30 PM"). */
function legacyDisplay(e: WeddingEvent): { date: string; time: string } {
  let date = "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(e.date)) {
    const [y, mo, d] = e.date.split("-").map(Number);
    date = `${d} ${new Date(Date.UTC(y, mo - 1, d)).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}`;
  }
  let time = "";
  if (/^\d{2}:\d{2}$/.test(e.time)) {
    const [h, m] = e.time.split(":").map(Number);
    time = `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
  }
  return { date, time };
}

const ICON_FOR = (title: string) => (/matrimony|mass|ceremony|wedding|church/i.test(title) ? "⛪" : /reception|party|dance/i.test(title) ? "🥂" : /dinner|lunch|brunch|breakfast/i.test(title) ? "🍽️" : /betroth|engage|ring/i.test(title) ? "💍" : "🌿");

export const MAIN_RE = /matrimony|nuptial|mass|ceremony|wedding|church|marriage/i;

/** The ceremony the countdown, hero and venue follow: the first that reads like one, else the first dated. */
export function mainEventOf(events: readonly WeddingEvent[]): WeddingEvent | undefined {
  return events.find((e) => MAIN_RE.test(e.title) && e.date) ?? events.find((e) => e.date) ?? events[0];
}

// ── Doc → form ──────────────────────────────────────────────────────────────

const event = (v: unknown, i: number): WeddingEvent => {
  const o = isObj(v) ? v : {};
  return {
    id: s(o.id, 24) || fallbackEventId(i),
    title: s(o.title, 60),
    date: s(o.date, 10),
    time: s(o.time, 5),
    endTime: s(o.endTime, 5),
    venue: s(o.venue, 120),
    address: s(o.address, 200),
    mapUrl: s(o.mapUrl, 600),
    dressCode: s(o.dressCode, 60),
    dressColor: s(o.dressColor, 7),
    note: s(o.note, 400),
  };
};

/**
 * A stored page (or anything else) → the form. Pages without `scrollExtras`
 * are derived from the shared flat fields, so an invitation sent years ago
 * opens with its names, events, families and photos intact.
 */
export function fromDoc(raw: unknown): Cw2Data {
  const d = isObj(raw) ? raw : {};
  const x = isObj(d.scrollExtras) ? d.scrollExtras : null;
  const brideName = s(d.brideName, 60);
  const groomName = s(d.groomName, 60);
  const weddingIso = s(d.weddingDate, 40);
  const weddingYear = /^\d{4}/.test(weddingIso) ? Number(weddingIso.slice(0, 4)) : new Date().getFullYear();

  // Events: the extras' own list, else the enabled legacy rows (ids f1, f2…).
  let events: WeddingEvent[];
  if (x && Array.isArray(x.events)) {
    events = x.events.filter(isObj).slice(0, LIMITS.events).map(event);
  } else {
    const legacy = Array.isArray(d.events) ? (d.events as unknown[]).filter(isObj) : [];
    events = legacy
      .filter((e) => !e.disabled)
      .map((e, i) => ({
        id: fallbackEventId(i),
        title: s(e.name, 60),
        date: legacyDateToIso(s(e.date, 40), weddingYear),
        time: toHHMM(s(e.time, 20)),
        endTime: "",
        venue: s(e.venue, 120),
        address: "",
        mapUrl: "",
        dressCode: "",
        dressColor: "",
        note: s(e.details, 400),
      }));
    // A legacy page whose ceremony row has no date: take it from weddingDate.
    const main = events.find((e) => MAIN_RE.test(e.title));
    if (main && !main.date && /^\d{4}-\d{2}-\d{2}/.test(weddingIso)) main.date = weddingIso.slice(0, 10);
    if (!events.length && /^\d{4}-\d{2}-\d{2}/.test(weddingIso)) {
      events = [{ id: "f1", title: "Holy Matrimony", date: weddingIso.slice(0, 10), time: "", endTime: "", venue: s(d.venue, 120), address: "", mapUrl: "", dressCode: "", dressColor: "", note: "" }];
    }
  }

  const legacyGallery: LovePhoto[] = (Array.isArray(d.galleryImages) ? d.galleryImages : [])
    .filter(isObj)
    .map((g) => ({ url: s(g.src), caption: s(g.alt, 140) || undefined }))
    .filter((p) => p.url);
  const gallery: LovePhoto[] =
    x && Array.isArray(x.gallery)
      ? x.gallery
          .filter(isObj)
          .map((p) => ({
            url: s(p.url),
            caption: s(p.caption, 140) || undefined,
            cropX: n(p.cropX, 0, 100, 50),
            cropY: n(p.cropY, 0, 100, 50),
            scale: n(p.scale, 100, 300, 100),
            span: oneOf(p.span, ["normal", "wide", "tall", "large"] as const, "normal"),
            w: n(p.w, 0, 20000, 0) || undefined,
            h: n(p.h, 0, 20000, 0) || undefined,
          }))
          .filter((p) => p.url)
      : legacyGallery;

  const scripture = x && isObj(x.scripture) ? x.scripture : {};
  const music = x && isObj(x.music) ? x.music : {};
  const tags = (v: unknown) => (Array.isArray(v) ? v.filter(isObj).map((t) => ({ emoji: s(t.emoji, 8), label: s(t.label, 30) })) : []);

  return {
    brideName,
    groomName,
    nameOrder: oneOf(x?.nameOrder, ["bride", "groom"] as const, "bride"),
    bride: { name: brideName, description: s(d.brideDescription, 300) },
    groom: { name: groomName, description: s(d.groomDescription, 300) },
    bridePhoto: portrait(x?.bridePhoto, s(d.bridePhoto)),
    groomPhoto: portrait(x?.groomPhoto, s(d.groomPhoto)),
    couplePhoto: portrait(x?.couplePhoto, x ? "" : s(d.sharePhoto)),
    brideFamily: { parents: s(d.brideFamilyParents, 200), grandparents: s(d.brideFamilyGrandparents, 200) },
    groomFamily: { parents: s(d.groomFamilyParents, 200), grandparents: s(d.groomFamilyGrandparents, 200) },
    blessingsOf: s(x?.blessingsOf, 200),
    scripture: { text: s(scripture.text, 400), ref: s(scripture.ref, 60) },
    invitation: s(x?.invitation, 1500),
    secondLang: oneOf(x?.secondLang, ["none", "hi", "ml", "ta"] as const, "none"),
    altInvitation: s(x?.altInvitation, 1200),
    altVerse: s(x?.altVerse, 400),
    events,
    order: (x && Array.isArray(x.order) ? x.order : []).filter(isObj).map((o) => ({ time: s(o.time, 12), title: s(o.title, 60), note: s(o.note, 160) })),
    story: (x && Array.isArray(x.story) ? x.story : []).filter(isObj).map((c) => ({ when: s(c.when, 40), title: s(c.title, 80), line: s(c.line, 400), photo: s(c.photo), crop: crop(c.crop) })),
    gallery,
    contacts: (x && Array.isArray(x.contacts) ? x.contacts : []).filter(isObj).map((c) => ({ name: s(c.name, 40), relation: s(c.relation, 40), phone: s(c.phone, 20) })),
    things: (x && Array.isArray(x.things) ? x.things : []).filter(isObj).map((t) => ({ head: s(t.head, 40), text: s(t.text, 300) })),
    gettingThere: s(x?.gettingThere, 1000),
    videoUrl: s(x?.videoUrl, 300),
    liveUrl: s(x?.liveUrl, 500),
    upiId: s(x?.upiId, 100),
    upiName: s(x?.upiName, 60),
    // Old pages played the hymn mp3; they open with Canon in D now (the closest in mood).
    music: { youtubeId: s(music.youtubeId, 11) || (x ? "" : DEMO.music.youtubeId), start: n(music.start, 0, 3600, 0), enabled: typeof music.enabled === "boolean" ? music.enabled : true },
    theme: oneOf(x?.theme, ["blossom", "sage", "ivory"] as const, "blossom"),
    rsvpOn: typeof x?.rsvpOn === "boolean" ? x.rsvpOn : true,
    rsvpBy: s(x?.rsvpBy, 10),
    maxGuests: n(x?.maxGuests, 1, 10, 4),
    rsvpMeal: x?.rsvpMeal === true,
    hashtag: s(x?.hashtag, 40),
    closing: s(x?.closing, 160),
    blessing: s(d.blessing, 200),
    brideTags: tags(d.brideTags),
    groomTags: tags(d.groomTags),
  };
}

// ── Form → wire body ────────────────────────────────────────────────────────

/**
 * The POST/PUT body. Photos travel only inside `scrollExtras`: the server
 * uploads them and mirrors them into galleryImages / bridePhoto / groomPhoto /
 * sharePhoto, so a base64 picture is never uploaded twice.
 */
export function toBody(d: Cw2Data, password?: string) {
  const main = mainEventOf(d.events);
  const weddingDate = main?.date ? `${main.date}T${main.time || "12:00"}:00+05:30` : undefined;
  const legacyEvents = d.events.map((e) => {
    const disp = legacyDisplay(e);
    return { name: e.title || "Celebration", hindi: "", icon: ICON_FOR(e.title), date: disp.date, time: disp.time, venue: e.venue, details: e.note ?? "", disabled: false };
  });
  return {
    brideName: d.brideName.trim(),
    groomName: d.groomName.trim(),
    ...(weddingDate ? { weddingDate } : {}),
    venue: [main?.venue, main?.address].filter(Boolean).join(", "),
    blessing: d.blessing || "God bless this union",
    brideDescription: d.bride.description,
    groomDescription: d.groom.description,
    brideTags: d.brideTags,
    groomTags: d.groomTags,
    brideFamilyParents: d.brideFamily.parents,
    brideFamilyGrandparents: d.brideFamily.grandparents,
    groomFamilyParents: d.groomFamily.parents,
    groomFamilyGrandparents: d.groomFamily.grandparents,
    events: legacyEvents,
    password: password || "",
    templateVariant: "scroll" as const,
    scrollExtras: {
      v: 1,
      nameOrder: d.nameOrder,
      invitation: d.invitation,
      secondLang: d.secondLang,
      altInvitation: d.altInvitation,
      altVerse: d.altVerse,
      scripture: d.scripture,
      blessingsOf: d.blessingsOf,
      events: d.events,
      order: d.order,
      story: d.story,
      gallery: d.gallery,
      couplePhoto: d.couplePhoto,
      bridePhoto: d.bridePhoto,
      groomPhoto: d.groomPhoto,
      contacts: d.contacts,
      things: d.things,
      gettingThere: d.gettingThere,
      videoUrl: d.videoUrl,
      liveUrl: d.liveUrl,
      upiId: d.upiId,
      upiName: d.upiName,
      music: d.music,
      theme: d.theme,
      rsvpOn: d.rsvpOn,
      rsvpBy: d.rsvpBy,
      maxGuests: d.maxGuests,
      rsvpMeal: d.rsvpMeal,
      hashtag: d.hashtag,
      closing: d.closing,
    },
  };
}

// ── Small helpers the page and the editor share ─────────────────────────────

/** YouTube id out of any link form or a bare id. */
export function youtubeIdOf(raw: string): string {
  const t = raw.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(t)) return t;
  const m = t.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/i);
  return m ? m[1] : "";
}

/** "+91 98470 11223", "09847011223" → "919847011223"; "" when not a phone number. */
export function normalisePhone(raw: string): string {
  const d = raw.replace(/[^\d+]/g, "");
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
export const isHttps = (v: string) => {
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
};

const COLOUR_WORDS: [RegExp, string][] = [
  [/white|ivory|cream|pastel|beige|champagne|kasavu/i, "#f3ebdd"],
  [/pink|rose|blush|peach|coral/i, "#e8a5b5"],
  [/green|sage|mint|olive/i, "#9db59a"],
  [/gold|yellow|mustard/i, "#c9a24a"],
  [/blue|navy|teal|sky|powder/i, "#a9c6dd"],
  [/purple|violet|lavender|lilac/i, "#b9a3d1"],
  [/black|tie|tux|formal/i, "#1c1c24"],
];
export function swatchFor(e: Pick<WeddingEvent, "dressCode" | "dressColor">): string {
  if (e.dressColor && /^#[0-9a-f]{6}$/i.test(e.dressColor)) return e.dressColor;
  for (const [re, c] of COLOUR_WORDS) if (re.test(e.dressCode ?? "")) return c;
  return "";
}

/** The couple in the order the sender wants them printed. */
export function namesOf(d: Pick<Cw2Data, "brideName" | "groomName" | "nameOrder">): [string, string] {
  const a = d.brideName.trim() || "Bride";
  const b = d.groomName.trim() || "Groom";
  return d.nameOrder === "groom" ? [b, a] : [a, b];
}
