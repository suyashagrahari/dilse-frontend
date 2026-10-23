// ─── Royal Wedding: extras → a render model ──────────────────────────────────
// Untrusted (an old page, the AI fill, a hostile POST): everything is coerced.

import type { LovePhoto } from "../../../_love/types";
import { isWeddingThemeId, LIGHT_THEMES, type WeddingThemeId } from "../../../_wedding/themes";
import type { FamilySide, WeddingEvent } from "../../../_wedding/types";
import { RW_LIMITS, RW_MAX_CONTACTS, rwLocalUrl } from "../../../_valentine/days/royal-wedding-invitation";

export type Lang = "en" | "hi";

export interface RwChapter {
  when: string;
  title: string;
  line: string;
  photo: LovePhoto | null;
}

export interface RwContactRow {
  name: string;
  relation: string;
  /** Display form as typed. */
  phone: string;
  /** "+919829011223" for tel:. */
  tel: string;
  /** "919829011223" for wa.me. */
  wa: string;
}

export interface RoyalModel {
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
  muhurat: string;
  hashtag: string;
  events: WeddingEvent[];
  main: WeddingEvent | undefined;
  story: RwChapter[];
  things: { head: string; text: string }[];
  gettingThere: string;
  contacts: RwContactRow[];
  upiId: string;
  upiName: string;
  liveUrl: string;
  videoId: string;
  rsvpBy: string;
  maxGuests: number;
  rsvpMeal: boolean;
  blessings: boolean;
  /** Photos not used by the portrait, a story chapter or a family card. */
  gallery: LovePhoto[];
  /** The couple's portrait in the courtyard frame (null = the illustrated couple). Old pages have no couplePhoto: null. */
  hero: LovePhoto | null;
  /** "॥ श्री गणेशाय नमः ॥" over the gateway (default); false = "॥ शुभ विवाह ॥". */
  invocation: boolean;
}

const str = (v: unknown, max = 600) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown, d = 0) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : typeof v === "string" && v.trim() && Number.isFinite(Number(v)) ? Math.round(Number(v)) : d);
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

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

export const MAIN_RE = /wedding|vivah|शादी|विवाह|phera|shaadi|nikah|ceremony|muhurtham|kalyanam|anand karaj|marriage|lagna/i;

export function readRoyal(extras: Record<string, unknown>, photos: LovePhoto[], bride: string, groom: string): RoyalModel {
  const x = extras ?? {};
  // Repo art (the demo photos) is stored as an https link on the site's domain and served same-origin here.
  const pool = (Array.isArray(photos) ? photos : []).filter((p) => p && p.url).map((p) => (rwLocalUrl(p.url) === p.url ? p : { ...p, url: rwLocalUrl(p.url) }));
  const used = new Set<number>();
  const pick = (n: unknown): LovePhoto | null => {
    const k = num(n);
    if (k < 1 || k > pool.length) return null;
    used.add(k - 1);
    return pool[k - 1];
  };

  const events: WeddingEvent[] = (Array.isArray(x.events) ? x.events : [])
    .filter(isObj)
    .slice(0, RW_LIMITS.events)
    .map((r, i) => {
      const e: WeddingEvent = {
        id: str(r.id, 24) || fallbackEventId(i),
        title: str(r.title, 40),
        date: /^\d{4}-\d{2}-\d{2}$/.test(str(r.date, 10)) ? str(r.date, 10) : "",
        time: /^\d{2}:\d{2}$/.test(str(r.time, 5)) ? str(r.time, 5) : "",
        endTime: /^\d{2}:\d{2}$/.test(str(r.endTime, 5)) ? str(r.endTime, 5) : "",
        venue: str(r.venue, 80),
        address: str(r.address, 140),
        mapUrl: /^https:\/\//i.test(str(r.mapUrl, 400)) ? str(r.mapUrl, 400) : "",
        dressCode: str(r.dressCode, 60),
        dressColor: "",
        note: str(r.note, 200),
      };
      e.dressColor = swatchFor({ dressCode: e.dressCode, dressColor: str(r.dressColor, 7) });
      return e;
    })
    .filter((e) => e.title || e.venue || e.date);

  const main = events.find((e) => MAIN_RE.test(e.title)) ?? events[0];

  // The portrait is picked first, so it never repeats in the gallery.
  const hero = pick(x.couplePhoto);

  const story: RwChapter[] = (Array.isArray(x.story) ? x.story : [])
    .filter(isObj)
    .slice(0, RW_LIMITS.story)
    .map((r) => ({ when: str(r.when, 24), title: str(r.title, 60), line: str(r.line, 240), photo: pick(r.photo) }))
    .filter((c) => c.title || c.line);

  const bridePhoto = pick(x.bridePhoto);
  const groomPhoto = pick(x.groomPhoto);

  const things = (Array.isArray(x.things) ? x.things : [])
    .map((t) => str(t, 180))
    .filter(Boolean)
    .slice(0, RW_LIMITS.faq)
    .map((t) => {
      const m = t.match(/^([^:]{2,28}):\s*(.+)$/);
      return m ? { head: m[1].trim(), text: m[2].trim() } : { head: "", text: t };
    });

  const contacts: RwContactRow[] = (Array.isArray(x.contacts) ? x.contacts : [])
    .filter(isObj)
    .slice(0, RW_MAX_CONTACTS)
    .map((r) => {
      const phone = str(r.phone, 16);
      const p = phoneOf(phone);
      return { name: str(r.name, 40), relation: str(r.relation, 40), phone, tel: p?.tel ?? "", wa: p?.wa ?? "" };
    })
    .filter((c) => c.name && c.tel);

  const upiId = str(x.upiId, 60);
  const liveUrl = str(x.liveUrl, 300);
  const gallery = pool.filter((_, i) => !used.has(i));
  const order = x.nameOrder === "groom" ? "groom" : "bride";
  const b = bride.trim() || "Bride";
  const g = groom.trim() || "Groom";
  // Light only. A page published before the redesign on maroon / noir / emerald keeps that id
  // in the database and renders in the sandstone palette (champagne), so it never looks broken.
  const theme = isWeddingThemeId(x.theme) && (LIGHT_THEMES as readonly string[]).includes(x.theme as string) ? (x.theme as WeddingThemeId) : "champagne";

  return {
    theme,
    lang: x.lang === "hi" ? "hi" : "en",
    bride: b,
    groom: g,
    first: order === "bride" ? b : g,
    second: order === "bride" ? g : b,
    hindiMessage: str(x.hindiMessage, 700),
    bride_: { title: "", names: [str(x.brideFamily, 120)].filter(Boolean), note: str(x.brideNote, 100), photo: bridePhoto?.url },
    groom_: { title: "", names: [str(x.groomFamily, 120)].filter(Boolean), note: str(x.groomNote, 100), photo: groomPhoto?.url },
    familyFirst: order,
    blessingsOf: str(x.blessingsOf, 160),
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
    rsvpBy: /^\d{4}-\d{2}-\d{2}$/.test(str(x.rsvpBy, 10)) ? str(x.rsvpBy, 10) : "",
    maxGuests: Math.min(10, Math.max(1, num(x.maxGuests, 4))),
    rsvpMeal: x.rsvpMeal !== false,
    blessings: x.blessings !== false,
    gallery,
    hero,
    invocation: x.invocation !== false,
  };
}

// ── Bilingual strings ────────────────────────────────────────────────────────

type Keys =
  | "open" | "opening" | "dear" | "invited" | "shubh" | "invitation" | "blessingsOf" | "families" | "brideSide" | "groomSide"
  | "countdown" | "story" | "storyEyebrow" | "events" | "eventsEyebrow" | "film" | "gallery" | "galleryEyebrow" | "gettingThere"
  | "rsvp" | "rsvpEyebrow" | "blessingsEyebrow" | "rsvpIntro" | "blessings" | "blessingsIntro" | "closing" | "done"
  | "directions" | "calendar" | "saveAll" | "dress" | "tba" | "play" | "and" | "getting" | "dateEyebrow" | "venueEyebrow"
  | "upasthiti" | "callUs" | "call" | "chat" | "shagun" | "shagunLine" | "pay" | "copy" | "copied"
  | "live" | "liveSoon" | "copyLink" | "card" | "cardMaking" | "inviteSomeone" | "inviteName" | "inviteSend"
  | "together" | "royalOf" | "welcome" | "infoEyebrow" | "info" | "getDirections" | "showMap" | "saved" | "scroll" | "decree" | "at" | "replay";

type StringsShape = { [K in Keys]: string } & { units: { d: string; h: string; m: string; s: string } };

export const T: Record<Lang, StringsShape> = {
  en: {
    open: "Tap to open the gateway",
    opening: "Opening your invitation…",
    dear: "Dear",
    invited: "you are royally invited",
    shubh: "Shubh Vivah",
    invitation: "The invitation",
    blessingsOf: "With the blessings of",
    families: "Our families",
    brideSide: "The bride's family",
    groomSide: "The groom's family",
    countdown: "Counting down to forever",
    story: "Our story",
    storyEyebrow: "Chapters",
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
    directions: "Directions",
    calendar: "Add to calendar",
    saveAll: "Save all dates",
    dress: "Dress code",
    tba: "Time to be announced",
    play: "Play the film",
    and: "&",
    getting: "are getting married",
    dateEyebrow: "The auspicious day",
    venueEyebrow: "The palace",
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
    card: "Invite card (PNG)",
    cardMaking: "Making your card…",
    inviteSomeone: "Send a personal invite",
    inviteName: "Guest's name, e.g. Sharma family",
    inviteSend: "Send on WhatsApp",
    together: "Together with their families",
    royalOf: "The royal wedding of",
    welcome: "Padharo mhare des",
    infoEyebrow: "For our guests",
    info: "Good to know",
    getDirections: "Get directions",
    showMap: "Show map",
    saved: "Saved ✓",
    scroll: "Enter the palace",
    decree: "By the grace of the Almighty, on the auspicious day of",
    at: "at",
    replay: "Replay the opening",
  },
  hi: {
    open: "द्वार खोलने के लिए छुएँ",
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
    storyEyebrow: "अध्याय",
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
    card: "निमंत्रण कार्ड (PNG)",
    cardMaking: "कार्ड बन रहा है…",
    inviteSomeone: "नाम से निमंत्रण भेजें",
    inviteName: "अतिथि का नाम, जैसे शर्मा परिवार",
    inviteSend: "WhatsApp पर भेजें",
    together: "अपने परिवारों के साथ",
    royalOf: "शुभ विवाह",
    welcome: "पधारो म्हारे देस",
    infoEyebrow: "अतिथियों के लिए",
    info: "ज़रूरी जानकारी",
    getDirections: "रास्ता देखें",
    showMap: "नक्शा दिखाएँ",
    saved: "सहेजा गया ✓",
    scroll: "महल में पधारें",
    decree: "ईश्वर की कृपा से, शुभ तिथि",
    at: "समय",
    replay: "फिर से देखें",
  },
};
export type Strings = StringsShape;
