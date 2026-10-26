// ─── Lotus Temple Wedding Invitation: extras → a render model ────────────────
// Untrusted (an old page, the AI fill, a hostile POST): everything is coerced.

import type { LovePhoto } from "../../../_love/types";
import { isWeddingThemeId, LIGHT_THEMES, type WeddingThemeId } from "../../../_wedding/themes";
import type { WeddingEvent } from "../../../_wedding/types";
import { LW_LIMITS, lwLocalUrl } from "../../../_valentine/days/lotus-wedding-invitation";

export type Lang = "en" | "hi";

export interface LwChapter {
  when: string;
  title: string;
  line: string;
  photo: LovePhoto | null;
}

export interface LwFamily {
  names: string;
  note: string;
  photo: LovePhoto | null;
}

export interface LwContact {
  name: string;
  relation: string;
  /** Digits only, with the country code (91XXXXXXXXXX), for tel: and wa.me. */
  phone: string;
  /** As people read it: +91 98290 00000. */
  display: string;
}

export interface LotusModel {
  theme: WeddingThemeId;
  lang: Lang;
  bride: string;
  groom: string;
  /** In the order the sender wants them printed. */
  first: string;
  second: string;
  hindiMessage: string;
  brideFam: LwFamily;
  groomFam: LwFamily;
  familyFirst: "bride" | "groom";
  blessingsOf: string;
  muhurat: string;
  hashtag: string;
  events: WeddingEvent[];
  main: WeddingEvent | undefined;
  story: LwChapter[];
  things: { head: string; text: string }[];
  gettingThere: string;
  videoId: string;
  rsvpBy: string;
  maxGuests: number;
  rsvpMeal: boolean;
  blessings: boolean;
  contacts: LwContact[];
  upiId: string;
  upiName: string;
  liveUrl: string;
  /** Photos not used by a story chapter or a family card. */
  gallery: LovePhoto[];
  /** Ganesha invocation on the opening (default). */
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

/** "+91 98290 00000", "098290-00000", "9829000000" → "919829000000"; "" when it is not a phone number. */
export function normalisePhone(raw: string): string {
  const d = raw.replace(/[^\d+]/g, "");
  const digits = d.replace(/\D/g, "");
  if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
  if (/^0[6-9]\d{9}$/.test(digits)) return `91${digits.slice(1)}`;
  if (/^91[6-9]\d{9}$/.test(digits)) return digits;
  // Abroad: keep an explicit international number (+44…, +1…) as is.
  if (d.startsWith("+") && digits.length >= 8 && digits.length <= 15) return digits;
  return "";
}
export function displayPhone(digits: string): string {
  if (/^91\d{10}$/.test(digits)) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  return `+${digits}`;
}

/** A UPI VPA: name@bank. */
export const isUpiId = (v: string) => /^[a-z0-9._-]{2,256}@[a-z][a-z0-9.-]{1,64}$/i.test(v);

/** Dress-code words → a swatch, for a row whose sender (or the AI) left the colour empty. */
const COLOUR_WORDS: [RegExp, string][] = [
  [/yellow|haldi|mustard|gold(en)?\b/i, "#F2C94C"],
  [/green|mehendi|mehndi|emerald|sage|mint/i, "#4F9B6A"],
  [/pink|rose|blush|fuchsia|rani/i, "#E86A92"],
  [/red|maroon|crimson|wine|burgundy/i, "#A3122B"],
  [/purple|violet|lavender|lilac|plum/i, "#7B3FA0"],
  [/blue|navy|teal|turquoise|indigo/i, "#2E5AAC"],
  [/orange|saffron|marigold|kesari|peach|coral/i, "#EE8A2E"],
  [/white|ivory|cream|pastel|beige|champagne|silk|kasavu/i, "#F3EBDD"],
  [/black|tie|tux|noir|formal/i, "#1C1C24"],
  [/silver|grey|gray/i, "#B8BCC6"],
];
export function swatchFor(e: Pick<WeddingEvent, "dressCode" | "dressColor">): string {
  if (e.dressColor && /^#[0-9a-f]{6}$/i.test(e.dressColor)) return e.dressColor;
  for (const [re, c] of COLOUR_WORDS) if (re.test(e.dressCode ?? "")) return c;
  return "";
}

export const MAIN_RE = /wedding|vivah|शादी|विवाह|phera|shaadi|nikah|ceremony|muhurtham|muhurtam|kalyanam|anand karaj|marriage|lagna|thaali|thali/i;

export function readLotus(extras: Record<string, unknown>, photos: LovePhoto[], bride: string, groom: string): LotusModel {
  const x = extras ?? {};
  // Repo art (the demo photos) is stored as https on the site domain; serve it from this host.
  const pool = (Array.isArray(photos) ? photos : []).filter((p) => p && p.url).map((p) => (lwLocalUrl(p.url) === p.url ? p : { ...p, url: lwLocalUrl(p.url) }));
  const used = new Set<number>();
  const pick = (n: unknown): LovePhoto | null => {
    const k = num(n);
    if (k < 1 || k > pool.length) return null;
    used.add(k - 1);
    return pool[k - 1];
  };

  const events: WeddingEvent[] = (Array.isArray(x.events) ? x.events : [])
    .filter(isObj)
    .slice(0, LW_LIMITS.events)
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

  const story: LwChapter[] = (Array.isArray(x.story) ? x.story : [])
    .filter(isObj)
    .slice(0, LW_LIMITS.story)
    .map((r) => ({ when: str(r.when, 24), title: str(r.title, 60), line: str(r.line, 240), photo: pick(r.photo) }))
    .filter((c) => c.title || c.line);

  const bridePhoto = pick(x.bridePhoto);
  const groomPhoto = pick(x.groomPhoto);

  const things = (Array.isArray(x.things) ? x.things : [])
    .map((t) => str(t, 180))
    .filter(Boolean)
    .slice(0, LW_LIMITS.faq)
    .map((t) => {
      const m = t.match(/^([^:]{2,28}):\s*(.+)$/);
      return m ? { head: m[1].trim(), text: m[2].trim() } : { head: "", text: t };
    });

  const contacts: LwContact[] = (Array.isArray(x.contacts) ? x.contacts : [])
    .filter(isObj)
    .slice(0, 4)
    .map((r) => {
      const phone = normalisePhone(str(r.phone, 20));
      return { name: str(r.name, 40), relation: str(r.relation, 40), phone, display: phone ? displayPhone(phone) : "" };
    })
    .filter((c) => c.name && c.phone);

  const upiId = str(x.upiId, 60);
  const liveUrl = str(x.liveUrl, 300);
  const gallery = pool.filter((_, i) => !used.has(i));
  const order = x.nameOrder === "groom" ? "groom" : "bride";
  const b = bride.trim() || "Bride";
  const g = groom.trim() || "Groom";
  const theme = isWeddingThemeId(x.theme) && (LIGHT_THEMES as readonly string[]).includes(x.theme as string) ? (x.theme as WeddingThemeId) : "champagne";

  return {
    theme,
    lang: x.lang === "hi" ? "hi" : "en",
    bride: b,
    groom: g,
    first: order === "bride" ? b : g,
    second: order === "bride" ? g : b,
    hindiMessage: str(x.hindiMessage, 700),
    brideFam: { names: str(x.brideFamily, 120), note: str(x.brideNote, 100), photo: bridePhoto },
    groomFam: { names: str(x.groomFamily, 120), note: str(x.groomNote, 100), photo: groomPhoto },
    familyFirst: order,
    blessingsOf: str(x.blessingsOf, 160),
    muhurat: str(x.muhurat, 60),
    hashtag: str(x.hashtag, 40),
    events,
    main,
    story,
    things,
    gettingThere: str(x.gettingThere, 500),
    videoId: youtubeIdOf(str(x.videoUrl, 200)),
    rsvpBy: /^\d{4}-\d{2}-\d{2}$/.test(str(x.rsvpBy, 10)) ? str(x.rsvpBy, 10) : "",
    maxGuests: Math.min(10, Math.max(1, num(x.maxGuests, 4))),
    rsvpMeal: x.rsvpMeal !== false,
    blessings: x.blessings !== false,
    contacts,
    upiId: isUpiId(upiId) ? upiId : "",
    upiName: str(x.upiName, 60),
    liveUrl: /^https:\/\/[^\s]+$/i.test(liveUrl) ? liveUrl : "",
    gallery,
    invocation: x.invocation !== false,
  };
}

// ── Bilingual strings ───────────────────────────────────────────────────────

type Key =
  | "open"
  | "openHint"
  | "dear"
  | "invited"
  | "together"
  | "inviteLine"
  | "shubh"
  | "invitation"
  | "blessingsOf"
  | "families"
  | "brideSide"
  | "groomSide"
  | "countdown"
  | "story"
  | "storyEyebrow"
  | "events"
  | "eventsEyebrow"
  | "film"
  | "gallery"
  | "galleryEyebrow"
  | "goodToKnow"
  | "gettingThere"
  | "contacts"
  | "contactsEyebrow"
  | "call"
  | "rsvp"
  | "rsvpEyebrow"
  | "rsvpIntro"
  | "blessings"
  | "blessingsEyebrow"
  | "blessingsIntro"
  | "closing"
  | "whatsapp"
  | "copy"
  | "copied"
  | "card"
  | "cardBusy"
  | "directions"
  | "dress"
  | "tba"
  | "play"
  | "and"
  | "venueEyebrow"
  | "dateEyebrow"
  | "upasthiti"
  | "shagun"
  | "shagunEyebrow"
  | "shagunIntro"
  | "upiPay"
  | "upiCopy"
  | "live"
  | "liveSoon"
  | "liveEyebrow"
  | "share"
  | "shareMore"
  | "shareEyebrow"
  | "scroll"
  | "replyBy"
  | "muhurat"
  | "nav";
type StringsShape = { [K in Key]: string } & { units: { d: string; h: string; m: string; s: string } };

export const T: Record<Lang, StringsShape> = {
  en: {
    open: "Tap the lotus to open",
    openHint: "Sound on for the shehnai",
    dear: "Dear",
    invited: "You are invited",
    together: "Together with their families",
    inviteLine: "request the pleasure of your company at their wedding",
    shubh: "Shubh Vivah",
    invitation: "The invitation",
    blessingsOf: "With the blessings of",
    families: "Our families",
    brideSide: "The bride's family",
    groomSide: "The groom's family",
    countdown: "Counting the days",
    story: "Our story",
    storyEyebrow: "How it began",
    events: "The celebrations",
    eventsEyebrow: "Functions",
    film: "Our film",
    gallery: "Moments",
    galleryEyebrow: "Gallery",
    goodToKnow: "Good to know",
    gettingThere: "Getting there",
    contacts: "Need anything? Call us",
    contactsEyebrow: "Family contacts",
    call: "Call",
    rsvp: "Will you join us?",
    rsvpEyebrow: "Kindly respond",
    rsvpIntro: "One reply for your family. Tick the functions you'll attend.",
    blessings: "Leave your blessings",
    blessingsEyebrow: "Aashirvaad",
    blessingsIntro: "A line from you, kept by the couple forever.",
    closing: "With love",
    whatsapp: "Share on WhatsApp",
    copy: "Copy link",
    copied: "Link copied",
    card: "Download invite card",
    cardBusy: "Drawing your card…",
    directions: "Directions",
    dress: "Dress code",
    tba: "Time to be announced",
    play: "Play the film",
    and: "&",
    venueEyebrow: "The venue",
    dateEyebrow: "The auspicious day",
    upasthiti: "Aapki upasthiti prarthaniya hai",
    shagun: "Shagun",
    shagunEyebrow: "For those who asked",
    shagunIntro: "Your blessings are the greatest gift. For those who asked, here is how to send shagun.",
    upiPay: "Pay by UPI",
    upiCopy: "Copy UPI ID",
    live: "Watch live",
    liveSoon: "The live stream opens 30 minutes before the ceremony.",
    liveEyebrow: "Can't make it?",
    share: "Pass it on",
    shareMore: "More apps",
    shareEyebrow: "Share the invitation",
    scroll: "Scroll",
    replyBy: "Kindly reply by",
    muhurat: "Muhurat",
    nav: "The functions",
    units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
  },
  hi: {
    open: "खोलने के लिए कमल को छुएँ",
    openHint: "शहनाई के लिए आवाज़ चालू रखें",
    dear: "प्रिय",
    invited: "आप सादर आमंत्रित हैं",
    together: "अपने परिवारों के साथ",
    inviteLine: "अपने शुभ विवाह में आपकी गरिमामयी उपस्थिति की कामना करते हैं",
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
    galleryEyebrow: "तस्वीरें",
    goodToKnow: "ज़रूरी जानकारी",
    gettingThere: "कैसे पहुँचें",
    contacts: "कुछ भी चाहिए? हमें फ़ोन करें",
    contactsEyebrow: "परिवार से संपर्क",
    call: "फ़ोन",
    rsvp: "क्या आप पधारेंगे?",
    rsvpEyebrow: "कृपया उत्तर दें",
    rsvpIntro: "पूरे परिवार की ओर से एक जवाब। जिन कार्यक्रमों में आएँगे, उन्हें चुनें।",
    blessings: "अपना आशीर्वाद दें",
    blessingsEyebrow: "आशीर्वाद",
    blessingsIntro: "आपकी एक पंक्ति, जिसे दूल्हा-दुल्हन हमेशा सँजोकर रखेंगे।",
    closing: "सप्रेम",
    whatsapp: "WhatsApp पर भेजें",
    copy: "लिंक कॉपी करें",
    copied: "लिंक कॉपी हो गया",
    card: "निमंत्रण कार्ड डाउनलोड करें",
    cardBusy: "कार्ड बन रहा है…",
    directions: "रास्ता देखें",
    dress: "पोशाक",
    tba: "समय की सूचना जल्द",
    play: "फ़िल्म चलाएँ",
    and: "संग",
    venueEyebrow: "विवाह स्थल",
    dateEyebrow: "शुभ तिथि",
    upasthiti: "आपकी उपस्थिति प्रार्थनीय है",
    shagun: "शगुन",
    shagunEyebrow: "जिन्होंने पूछा, उनके लिए",
    shagunIntro: "आपका आशीर्वाद ही सबसे बड़ा उपहार है। जिन्होंने पूछा, उनके लिए शगुन भेजने का तरीका।",
    upiPay: "UPI से भेजें",
    upiCopy: "UPI ID कॉपी करें",
    live: "लाइव देखें",
    liveSoon: "लाइव प्रसारण समारोह से 30 मिनट पहले शुरू होगा।",
    liveEyebrow: "नहीं आ पा रहे?",
    share: "आगे भेजें",
    shareMore: "अन्य ऐप",
    shareEyebrow: "निमंत्रण साझा करें",
    scroll: "नीचे देखें",
    replyBy: "कृपया जवाब दें",
    muhurat: "मुहूर्त",
    nav: "समारोह",
    units: { d: "दिन", h: "घंटे", m: "मिनट", s: "सेकंड" },
  },
};
export type Strings = StringsShape;
