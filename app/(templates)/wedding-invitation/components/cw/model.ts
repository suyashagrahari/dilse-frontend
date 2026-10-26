// ─── Classic (Gulabi Jharokha): extras → a render model ─────────────────────
// Untrusted input (a page published before the rebuild, the AI fill, a hostile
// POST): everything is coerced, and every key added in the rebuild may be
// missing. Old pages keep the big day in extras.date/time, ≤ 2 functions, six
// photos with no portrait, and possibly a dark theme id: all of it renders.

import type { LovePhoto } from "../../../_love/types";
import type { WeddingThemeId } from "../../../_wedding/themes";
import type { FamilySide, WeddingEvent } from "../../../_wedding/types";
import type { BlessingsText, RsvpText } from "../../../_wedding";
import { WI_LIMITS, WI_MAX_CONTACTS, wiLocalUrl } from "../../../_valentine/days/wedding-invitation";

export type Lang = "en" | "hi";

export interface CwChapter {
  when: string;
  title: string;
  line: string;
  photo: LovePhoto | null;
}

export interface CwContactRow {
  name: string;
  relation: string;
  /** Display form as typed. */
  phone: string;
  /** "+919829011223" for tel:. */
  tel: string;
  /** "919829011223" for wa.me. */
  wa: string;
}

export interface ClassicModel {
  theme: WeddingThemeId;
  lang: Lang;
  bride: string;
  groom: string;
  /** In the order the sender wants them printed. */
  first: string;
  second: string;
  hindiMessage: string;
  bride_: FamilySide;
  groom_: FamilySide;
  familyFirst: "bride" | "groom";
  blessingsOf: string;
  /** The big day (countdown, hero, invite card): extras.date, else the main function's. */
  date: string;
  time: string;
  muhurat: string;
  hashtag: string;
  events: WeddingEvent[];
  main: WeddingEvent | undefined;
  story: CwChapter[];
  things: { head: string; text: string }[];
  gettingThere: string;
  contacts: CwContactRow[];
  upiId: string;
  upiName: string;
  liveUrl: string;
  videoId: string;
  rsvp: boolean;
  rsvpBy: string;
  maxGuests: number;
  rsvpMeal: boolean;
  blessings: boolean;
  invocation: boolean;
  /** Photos not used by the portrait or a story chapter. */
  gallery: LovePhoto[];
  /** The couple's portrait (null = the illustrated couple under the gazebo). */
  hero: LovePhoto | null;
}

const str = (v: unknown, max = 600) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown, d = 0) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : typeof v === "string" && v.trim() && Number.isFinite(Number(v)) ? Math.round(Number(v)) : d);
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * One palette for the whole invitation: Gulabi (blush, rose gold, ivory). The
 * art (jharokha, peony trees, gazebo, the function couples) is painted for it,
 * so every page — including ones saved with champagne, powder or a dark theme
 * before the redesign — renders in blush.
 */
export const CW_THEME: WeddingThemeId = "blush";
export function lightTheme(v: unknown): WeddingThemeId {
  void v;
  return CW_THEME;
}

/** A stable, short id for a function from its position (only when the row has none). */
export const fallbackEventId = (i: number) => `f${i + 1}`;

/** YouTube id out of any link form (watch, youtu.be, shorts, embed) or a bare id. */
export function youtubeIdOf(raw: string): string {
  const s = raw.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/i);
  return m ? m[1] : "";
}

/**
 * A phone number guests can tap: 10 Indian digits (optionally +91 / 91 / 0
 * in front), or a + international number of 8–15 digits. Null otherwise.
 */
export function phoneOf(raw: string): { tel: string; wa: string } | null {
  const t = raw.trim();
  const digits = t.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (t.startsWith("+") && !t.startsWith("+91")) return digits.length >= 8 && digits.length <= 15 ? { tel: `+${digits}`, wa: digits } : null;
  let d = digits;
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? { tel: `+91${d}`, wa: `91${d}` } : null;
}

/** A plausible UPI id ("name@bank"). */
export const isUpiId = (v: string) => /^[a-z0-9._-]{2,256}@[a-z][a-z0-9.-]{1,63}$/i.test(v.trim());

/** Dress-code words → a swatch, for a row whose sender (or the AI) left the colour empty. */
const COLOUR_WORDS: [RegExp, string][] = [
  [/yellow|haldi|mustard|gold(en)?\b/i, "#F2C94C"],
  [/green|mehendi|mehndi|emerald|sage|mint/i, "#4F9B6A"],
  [/pink|rose|blush|fuchsia|rani/i, "#E86A92"],
  [/red|maroon|crimson|wine|burgundy/i, "#A3122B"],
  [/purple|violet|lavender|lilac|plum/i, "#7B3FA0"],
  [/blue|navy|teal|turquoise|indigo/i, "#2E5AAC"],
  [/orange|saffron|marigold|kesari|peach|coral/i, "#EE8A2E"],
  [/white|ivory|cream|pastel|beige|champagne/i, "#F3EBDD"],
  [/black|tie|tux|noir|formal/i, "#1C1C24"],
  [/silver|grey|gray/i, "#B8BCC6"],
];
export function swatchFor(e: Pick<WeddingEvent, "dressCode" | "dressColor">): string {
  if (e.dressColor && /^#[0-9a-f]{6}$/i.test(e.dressColor)) return e.dressColor;
  for (const [re, c] of COLOUR_WORDS) if (re.test(e.dressCode ?? "")) return c;
  return "";
}

export const MAIN_RE = /wedding|vivah|शादी|विवाह|phera|shaadi|nikah|ceremony|muhurtham|kalyanam|anand karaj|marriage|lagna|matrimony/i;

/** Which illustrated couple (and glow) dresses a function's card, read from its title. */
export type FnKind = "haldi" | "mehndi" | "sangeet" | "reception" | "engagement" | "wedding";
const KIND_RE: [FnKind, RegExp][] = [
  ["haldi", /haldi|hald[iy]|turmeric|pithi|ubtan|हल्दी/i],
  ["mehndi", /meh[e]?n?di|mehandi|henna|मेहं?दी/i],
  ["sangeet", /sangeet|sangit|garba|dandiya|cocktail|dance|संगीत/i],
  ["reception", /reception|dinner|walima|banquet|रिसेप्शन|स्वागत/i],
  ["engagement", /engage|sagai|sagaai|\bring\b|roka|tilak|mangni|सगाई|तिलक|रोका/i],
  ["wedding", /wedding|vivah|शादी|विवाह|phera|shaadi|nikah|ceremony|muhurtham|kalyanam|anand karaj|marriage|lagna|matrimony|baraat|बारात|फेरे/i],
];
export function kindOf(title: string, i = 0): FnKind {
  for (const [k, re] of KIND_RE) if (re.test(title)) return k;
  const cycle: FnKind[] = ["engagement", "sangeet", "reception"];
  return cycle[i % cycle.length];
}

/** A function's usual name in Hindi, for the Hindi page ("Haldi Ceremony" → "हल्दी"). Unknown titles stay as typed. */
const HI_TITLES: [RegExp, string][] = [
  [/^\s*(the\s+)?haldi(\s+(ceremony|function|rasam))?\s*$/i, "हल्दी"],
  [/^\s*(the\s+)?(meh[e]?n?di|mehandi)(\s+(ceremony|function|night|rasam))?\s*$/i, "मेहंदी"],
  [/^\s*(the\s+)?sangeet(\s+(night|ceremony|sandhya))?\s*$/i, "संगीत संध्या"],
  [/^\s*(the\s+)?reception(\s+(dinner|party|night))?\s*$/i, "स्वागत समारोह"],
  [/^\s*(the\s+)?(engagement|sagai|sagaai|ring ceremony)(\s+ceremony)?\s*$/i, "सगाई"],
  [/^\s*(the\s+)?tilak(\s+ceremony)?\s*$/i, "तिलक"],
  [/^\s*(the\s+)?roka(\s+ceremony)?\s*$/i, "रोका"],
  [/^\s*(the\s+)?baraat\s*$/i, "बारात"],
  [/^\s*(the\s+)?(pheras?|saat pheras?)\s*$/i, "फेरे"],
  [/^\s*(the\s+)?cocktail(\s+(night|party))?\s*$/i, "कॉकटेल संध्या"],
  [/^\s*(the\s+)?(wedding|shaadi|vivah)(\s+ceremony)?(\s*\((the\s+)?pheras?\))?\s*$/i, "शुभ विवाह"],
];
export function fnTitle(title: string, lang: Lang): string {
  if (lang !== "hi") return title;
  for (const [re, hi] of HI_TITLES) if (re.test(title)) return hi;
  return title;
}

/** The main function: the one titled like the wedding ceremony, else the first. */
export const mainOf = (events: readonly WeddingEvent[]) => events.find((e) => MAIN_RE.test(e.title)) ?? events[0];

export function readClassic(extras: Record<string, unknown> | null | undefined, photos: LovePhoto[], bride: string, groom: string): ClassicModel {
  const x = extras ?? {};
  // Repo art (the demo photos) is stored as an https link on the site's domain and served same-origin here.
  const pool = (Array.isArray(photos) ? photos : [])
    .filter((p) => p && typeof p.url === "string" && p.url)
    .slice(0, WI_LIMITS.photos)
    .map((p) => (wiLocalUrl(p.url) === p.url ? p : { ...p, url: wiLocalUrl(p.url) }));
  const used = new Set<number>();
  const pick = (n: unknown): LovePhoto | null => {
    const k = num(n);
    if (k < 1 || k > pool.length) return null;
    used.add(k - 1);
    return pool[k - 1];
  };

  const events: WeddingEvent[] = (Array.isArray(x.events) ? x.events : [])
    .filter(isObj)
    .slice(0, WI_LIMITS.events)
    .map((r, i) => {
      const e: WeddingEvent = {
        id: str(r.id, 40) || fallbackEventId(i),
        title: str(r.title, 40),
        date: DATE_RE.test(str(r.date, 10)) ? str(r.date, 10) : "",
        time: TIME_RE.test(str(r.time, 5)) ? str(r.time, 5) : "",
        endTime: TIME_RE.test(str(r.endTime, 5)) ? str(r.endTime, 5) : "",
        venue: str(r.venue, 80),
        address: str(r.address, 140),
        mapUrl: /^https:\/\//i.test(str(r.mapUrl, 400)) ? str(r.mapUrl, 400) : "",
        dressCode: str(r.dressCode, 60),
        dressColor: "",
        note: str(r.note, 200),
      };
      e.dressColor = swatchFor({ dressCode: e.dressCode, dressColor: str(r.dressColor, 9) });
      return e;
    })
    .filter((e) => e.title || e.venue || e.date)
    // An old page could leave a title empty with a venue set (the old reader printed "Celebration").
    .map((e) => (e.title ? e : { ...e, title: "Celebration" }));

  const main = mainOf(events);
  const date = DATE_RE.test(str(x.date, 10)) ? str(x.date, 10) : main?.date ?? "";
  const time = TIME_RE.test(str(x.time, 5)) ? str(x.time, 5) : main?.date === date ? main?.time ?? "" : "";

  // The portrait is picked first, so it never repeats in the gallery.
  const hero = pick(x.couplePhoto);

  const story: CwChapter[] = (Array.isArray(x.story) ? x.story : [])
    .filter(isObj)
    .slice(0, WI_LIMITS.story)
    .map((r) => ({ when: str(r.when, 24), title: str(r.title, 60), line: str(r.line, 240), photo: pick(r.photo) }))
    .filter((c) => c.title || c.line);

  const things = (Array.isArray(x.things) ? x.things : [])
    .map((t) => str(t, 180))
    .filter(Boolean)
    .slice(0, WI_LIMITS.faq)
    .map((t) => {
      const m = t.match(/^([^:]{2,28}):\s*(.+)$/);
      return m ? { head: m[1].trim(), text: m[2].trim() } : { head: "", text: t };
    });

  const contacts: CwContactRow[] = (Array.isArray(x.contacts) ? x.contacts : [])
    .filter(isObj)
    .slice(0, WI_MAX_CONTACTS)
    .map((r) => {
      const phone = str(r.phone, 16);
      const p = phoneOf(phone);
      return { name: str(r.name, 40), relation: str(r.relation, 40), phone, tel: p?.tel ?? "", wa: p?.wa ?? "" };
    })
    .filter((c) => c.name && c.tel);

  const upiId = str(x.upiId, 60);
  const liveUrl = str(x.liveUrl, 300);
  const gallery = pool.filter((_, i) => !used.has(i));
  const order = x.namesOrder === "groom" ? "groom" : "bride";
  const b = bride.trim() || "Bride";
  const g = groom.trim() || "Groom";

  return {
    theme: lightTheme(x.theme),
    lang: x.lang === "hi" ? "hi" : "en",
    bride: b,
    groom: g,
    first: order === "bride" ? b : g,
    second: order === "bride" ? g : b,
    hindiMessage: str(x.hindiMessage, 700),
    bride_: { title: "", names: [str(x.brideFamily, 120)].filter(Boolean), note: str(x.brideNote, 100) },
    groom_: { title: "", names: [str(x.groomFamily, 120)].filter(Boolean), note: str(x.groomNote, 100) },
    familyFirst: order,
    blessingsOf: str(x.blessingsOf, 160),
    date,
    time,
    muhurat: str(x.muhurat, 60),
    hashtag: str(x.hashtag, 40),
    events,
    main,
    story,
    things,
    gettingThere: str(x.gettingThere, 500),
    contacts,
    upiId: isUpiId(upiId) ? upiId : "",
    upiName: str(x.upiName, 60),
    liveUrl: /^https:\/\/\S+$/i.test(liveUrl) ? liveUrl : "",
    videoId: youtubeIdOf(str(x.videoUrl, 200)),
    rsvp: x.rsvp !== false,
    rsvpBy: DATE_RE.test(str(x.rsvpBy, 10)) ? str(x.rsvpBy, 10) : "",
    maxGuests: Math.min(10, Math.max(1, num(x.maxGuests, 4))),
    // Off unless the sender switched them on (pages from before the rebuild never had them).
    rsvpMeal: x.rsvpMeal === true,
    blessings: x.blessings === true,
    invocation: x.invocation === true,
    gallery,
    hero,
  };
}

/** "Saturday, 12 December 2026" — dates are wall-clock at the venue, so no timezone shift. */
export function longDate(date: string, locale = "en-IN"): string {
  if (!DATE_RE.test(date)) return "";
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** { weekday: "Saturday", day: "12", month: "December", year: "2026" } for the hero's date strip. */
export function dateParts(date: string, locale = "en-IN") {
  if (!DATE_RE.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  const f = (o: Intl.DateTimeFormatOptions) => dt.toLocaleDateString(locale, { ...o, timeZone: "UTC" });
  return { weekday: f({ weekday: "long" }), day: String(d), month: f({ month: "long" }), year: String(y) };
}

/** "7:30 pm" */
export function prettyTime(t: string, locale = "en-IN"): string {
  if (!TIME_RE.test(t)) return "";
  const [h, m] = t.split(":").map(Number);
  return new Date(Date.UTC(2000, 0, 1, h, m)).toLocaleTimeString(locale, { hour: "numeric", minute: m ? "2-digit" : undefined, hour12: true, timeZone: "UTC" }).replace(/\s?([ap])\.?m\.?/i, (_, a: string) => ` ${a.toLowerCase()}m`);
}

/** "शाम 7:30 बजे" — how a Hindi invitation says a time (सुबह / दोपहर / शाम / रात, 12-hour). */
export function hiTime(t: string): string {
  if (!TIME_RE.test(t)) return "";
  const [h, m] = t.split(":").map(Number);
  const part = h >= 4 && h < 12 ? "सुबह" : h >= 12 && h < 16 ? "दोपहर" : h >= 16 && h < 20 ? "शाम" : "रात";
  const h12 = h % 12 || 12;
  return `${part} ${h12}${m ? `:${String(m).padStart(2, "0")}` : ""} बजे`;
}

/** A time in the page's language. */
export const timeIn = (t: string, lang: Lang) => (lang === "hi" ? hiTime(t) : prettyTime(t, "en-IN"));

// ── Bilingual strings ────────────────────────────────────────────────────────

type Keys =
  | "open" | "opening" | "dear" | "invited" | "shubh" | "invitation" | "blessingsOf" | "families" | "brideSide" | "groomSide"
  | "countdown" | "story" | "storyEyebrow" | "events" | "eventsEyebrow" | "film" | "gallery" | "galleryEyebrow" | "gettingThere"
  | "rsvp" | "rsvpEyebrow" | "blessingsEyebrow" | "rsvpIntro" | "blessings" | "blessingsIntro" | "closing" | "done" | "today"
  | "directions" | "calendar" | "saveAll" | "dress" | "tba" | "play" | "and" | "getting" | "dateEyebrow" | "venueEyebrow"
  | "upasthiti" | "callUs" | "call" | "chat" | "shagun" | "shagunLine" | "pay" | "copy" | "copied"
  | "live" | "liveSoon" | "copyLink" | "card" | "cardMaking" | "inviteSomeone" | "inviteName" | "inviteSend" | "qr" | "qrHint" | "close"
  | "together" | "infoEyebrow" | "info" | "getDirections" | "showMap" | "saved" | "music" | "replay" | "scroll" | "saveDate" | "at"
  | "rsvpBtn" | "lang" | "fnOf" | "fnCount" | "swipe" | "venueMain";

type StringsShape = { [K in Keys]: string } & { units: { d: string; h: string; m: string; s: string } };

export const T: Record<Lang, StringsShape> = {
  en: {
    open: "Tap to open the window",
    opening: "Opening your invitation…",
    dear: "Dear",
    invited: "you are warmly invited",
    shubh: "Shubh Vivah",
    invitation: "The invitation",
    blessingsOf: "With the blessings of",
    families: "Our families",
    brideSide: "The bride's family",
    groomSide: "The groom's family",
    countdown: "Counting down to forever",
    story: "Our story",
    storyEyebrow: "How it began",
    events: "The celebrations",
    eventsEyebrow: "Functions",
    film: "Our film",
    gallery: "Moments",
    galleryEyebrow: "Through the years",
    gettingThere: "Getting there",
    rsvp: "Will you join us?",
    rsvpEyebrow: "Kindly respond",
    blessingsEyebrow: "Aashirvaad",
    rsvpIntro: "One reply for your family. Tick the functions you'll attend.",
    blessings: "Leave your blessings",
    blessingsIntro: "A line from you, kept by the couple forever.",
    closing: "With love",
    units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
    done: "Just married",
    today: "Today is the day!",
    directions: "Directions",
    calendar: "Add to calendar",
    saveAll: "Save all dates",
    dress: "Dress code",
    tba: "Time to be announced",
    play: "Play the film",
    and: "&",
    getting: "are getting married",
    dateEyebrow: "Save the date",
    venueEyebrow: "The venue",
    upasthiti: "Aapki upasthiti prarthaniya hai",
    callUs: "Any question? Call us",
    call: "Call",
    chat: "WhatsApp",
    shagun: "Shagun",
    shagunLine: "Your blessings are the greatest gift. For those who asked, our UPI id for shagun:",
    pay: "Send shagun by UPI",
    copy: "Copy",
    copied: "Copied",
    live: "Watch live",
    liveSoon: "The livestream opens 30 minutes before the ceremony",
    copyLink: "Copy link",
    card: "Invite card",
    cardMaking: "Making your card…",
    inviteSomeone: "Send a personal invite",
    inviteName: "Guest's name, e.g. Sharma family",
    inviteSend: "Send on WhatsApp",
    qr: "QR code",
    qrHint: "Scan to open the invitation",
    close: "Close",
    together: "Together with their families",
    infoEyebrow: "For our guests",
    info: "Good to know",
    getDirections: "Get directions",
    showMap: "Show map",
    saved: "Saved ✓",
    music: "Tap to hear the music",
    replay: "Replay the opening",
    scroll: "Scroll",
    saveDate: "Save the date",
    at: "at",
    rsvpBtn: "RSVP",
    lang: "Language",
    fnOf: "of",
    fnCount: "{n} celebrations, one love story",
    swipe: "Swipe to see every function",
    venueMain: "Where we say yes",
  },
  hi: {
    open: "झरोखा खोलने के लिए छुएँ",
    opening: "निमंत्रण खुल रहा है…",
    dear: "प्रिय",
    invited: "आप सादर आमंत्रित हैं",
    shubh: "शुभ विवाह",
    invitation: "निमंत्रण",
    blessingsOf: "के आशीर्वाद से",
    families: "हमारा परिवार",
    brideSide: "वधू पक्ष",
    groomSide: "वर पक्ष",
    countdown: "शुभ घड़ी में बाकी",
    story: "हमारी कहानी",
    storyEyebrow: "शुरुआत",
    events: "शुभ कार्यक्रम",
    eventsEyebrow: "कार्यक्रम",
    film: "हमारी फ़िल्म",
    gallery: "यादें",
    galleryEyebrow: "बीते पल",
    gettingThere: "कैसे पहुँचें",
    rsvp: "क्या आप पधारेंगे?",
    rsvpEyebrow: "कृपया उत्तर दें",
    blessingsEyebrow: "आशीर्वाद",
    rsvpIntro: "पूरे परिवार की ओर से एक जवाब। जिन कार्यक्रमों में आएँगे, उन्हें चुनें।",
    blessings: "अपना आशीर्वाद दें",
    blessingsIntro: "आपकी एक पंक्ति, जिसे दूल्हा-दुल्हन हमेशा सँजोकर रखेंगे।",
    closing: "सप्रेम",
    units: { d: "दिन", h: "घंटे", m: "मिनट", s: "सेकंड" },
    done: "विवाह संपन्न",
    today: "आज शुभ दिन है!",
    directions: "रास्ता",
    calendar: "कैलेंडर में जोड़ें",
    saveAll: "सभी तिथियाँ सहेजें",
    dress: "पोशाक",
    tba: "समय की सूचना जल्द",
    play: "फ़िल्म चलाएँ",
    and: "संग",
    getting: "विवाह बंधन में बँधने जा रहे हैं",
    dateEyebrow: "शुभ तिथि",
    venueEyebrow: "विवाह स्थल",
    upasthiti: "आपकी उपस्थिति प्रार्थनीय है",
    callUs: "कोई प्रश्न? हमें फ़ोन करें",
    call: "फ़ोन",
    chat: "WhatsApp",
    shagun: "शगुन",
    shagunLine: "आपका आशीर्वाद ही सबसे बड़ा उपहार है। जिन्होंने पूछा, उनके लिए शगुन का UPI:",
    pay: "UPI से शगुन भेजें",
    copy: "कॉपी",
    copied: "कॉपी हो गया",
    live: "लाइव देखें",
    liveSoon: "समारोह से 30 मिनट पहले लाइव शुरू होगा",
    copyLink: "लिंक कॉपी करें",
    card: "निमंत्रण कार्ड",
    cardMaking: "कार्ड बन रहा है…",
    inviteSomeone: "नाम से निमंत्रण भेजें",
    inviteName: "अतिथि का नाम, जैसे शर्मा परिवार",
    inviteSend: "WhatsApp पर भेजें",
    qr: "QR कोड",
    qrHint: "निमंत्रण खोलने के लिए स्कैन करें",
    close: "बंद करें",
    together: "अपने परिवारों के साथ",
    infoEyebrow: "अतिथियों के लिए",
    info: "ज़रूरी जानकारी",
    getDirections: "रास्ता देखें",
    showMap: "नक्शा दिखाएँ",
    saved: "सहेजा गया ✓",
    music: "संगीत सुनने के लिए छुएँ",
    replay: "झरोखा फिर से खोलें",
    scroll: "नीचे देखें",
    saveDate: "तिथि सहेजें",
    at: "",
    rsvpBtn: "स्वीकृति भेजें",
    lang: "भाषा",
    fnOf: "/",
    fnCount: "{n} शुभ अवसर, एक प्रेम कहानी",
    swipe: "सभी कार्यक्रम देखने के लिए स्वाइप करें",
    venueMain: "जहाँ सात फेरे होंगे",
  },
};
export type Strings = StringsShape;

/** The kit's RSVP form in Hindi (English uses the kit's own words). */
export const RSVP_HI: Partial<RsvpText> = {
  yes: "सहर्ष स्वीकार", yesSub: "हम अवश्य आएँगे", maybe: "अभी तय नहीं", maybeSub: "पूरी कोशिश करेंगे", no: "क्षमा करें", noSub: "आशीर्वाद भेज रहे हैं",
  veg: "शाकाहारी", nonveg: "मांसाहारी", jain: "जैन",
  replyBy: "कृपया उत्तर दें", name: "आपका नाम", namePh: "जैसे शर्मा परिवार", attend: "क्या आप पधारेंगे?", party: "आपके साथ कितने अतिथि", fewer: "एक अतिथि कम", more: "एक अतिथि और",
  which: "किन कार्यक्रमों में?", meal: "भोजन", phone: "फ़ोन", optional: "(वैकल्पिक)", note: "दूल्हा-दुल्हन के लिए संदेश", notePh: "बहुत-बहुत बधाई! संगीत में मिलते हैं…", password: "निमंत्रण का पासवर्ड",
  send: "उत्तर भेजें", sending: "भेजा जा रहा है…", update: "उत्तर बदलें", preview: "पूर्वावलोकन — अतिथियों के उत्तर आपको ईमेल पर मिलेंगे।", errName: "कृपया अपना नाम लिखें, ताकि परिवार जान सके कौन आ रहा है।", errEvents: "कम से कम एक कार्यक्रम चुनें।",
  doneYes: "जल्द मिलते हैं", doneMaybe: "प्रेम सहित नोट किया", doneNo: "धन्यवाद", thanks: "धन्यवाद", thanksName: "धन्यवाद, {name}",
  sumYesMany: "आप सभी {n} अतिथि सूची में हैं", sumYesOne: "आप अतिथि सूची में हैं", sumCouple: " — {couple} आपके साथ उत्सव मनाने को उत्सुक हैं", sumMaybe: "हमने आपको 'शायद' में रखा है — कभी भी आकर पक्का करें।", sumNo: "आपकी कमी खलेगी। आपका आशीर्वाद परिवार के लिए अनमोल है।", change: "अपना उत्तर बदलें",
};

/** The kit's blessings form in Hindi. */
export const BLESSINGS_HI: Partial<BlessingsText> = {
  name: "आपका नाम", blessing: "आपका आशीर्वाद", placeholder: "आपका प्रेम हर वर्ष और गहरा हो…", err: "अपना नाम और दूल्हा-दुल्हन के लिए एक पंक्ति लिखें।",
  send: "आशीर्वाद भेजें", sending: "भेजा जा रहा है…", another: "एक और आशीर्वाद", ok: "धन्यवाद — आपका आशीर्वाद दीवार पर है।", list: "आशीर्वाद",
};
