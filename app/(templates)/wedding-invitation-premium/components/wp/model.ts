// ─── Wedding Invitation ✦ Premium: engine data → what the guest page shows ──
// Untrusted (a page published before the rebuild, the AI fill, a hostile
// POST): everything is coerced and every new key may be absent.
//
// Old pages store: order, motif, hindi, date, time, city, brideParents,
// groomParents, brideNote, groomNote, events (no dressColor), story {text},
// faqs [{title,text}], and possibly a dark theme id. All of it still renders.

import type { LovePhoto } from "../../../_love/types";
import type { WeddingThemeId } from "../../../_wedding/themes";
import type { WeddingEvent } from "../../../_wedding/types";
import type { ValentineDayData } from "../../../_valentine/types";
import { WP_LIMITS, wpLocalUrl } from "../../../_valentine/days/wedding-invitation-premium";

export type Lang = "en" | "hi";
export type Motif = "ganesha" | "lotus" | "rings" | "none";

export interface WpChapter {
  when: string;
  title: string;
  line: string;
  photo: LovePhoto | null;
}
export interface WpFamily {
  names: string;
  note: string;
}
export interface WpContact {
  name: string;
  relation: string;
  /** Digits with the country code (91XXXXXXXXXX), for tel: and wa.me. */
  phone: string;
  display: string;
}

export interface WpModel {
  theme: WeddingThemeId;
  lang: Lang;
  /** The guest can switch to Hindi (the old `hindi` bool; default on). */
  bilingual: boolean;
  motif: Motif;
  bride: string;
  groom: string;
  first: string;
  second: string;
  familyFirst: "bride" | "groom";
  couple: string;
  letter: string;
  endLine: string;
  hindiMessage: string;
  brideFam: WpFamily;
  groomFam: WpFamily;
  blessingsOf: string;
  date: string;
  time: string;
  city: string;
  muhurat: string;
  hashtag: string;
  events: WeddingEvent[];
  main: WeddingEvent | undefined;
  story: WpChapter[];
  things: { head: string; text: string }[];
  gettingThere: string;
  videoId: string;
  rsvpBy: string;
  maxGuests: number;
  rsvpMeal: boolean;
  blessings: boolean;
  contacts: WpContact[];
  upiId: string;
  upiName: string;
  liveUrl: string;
  cover: LovePhoto | null;
  gallery: LovePhoto[];
}

const str = (v: unknown, max = 600) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown, d = 0) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : typeof v === "string" && v.trim() && Number.isFinite(Number(v)) ? Math.round(Number(v)) : d);
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
export const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
const hhmm = (s: string) => (/^\d{2}:\d{2}$/.test(s) ? s : "");

/** YouTube id out of any link form (watch, youtu.be, shorts, embed, live) or a bare id. */
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
  if (d.startsWith("+") && digits.length >= 8 && digits.length <= 15) return digits;
  return "";
}
export function displayPhone(digits: string): string {
  if (/^91\d{10}$/.test(digits)) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  return `+${digits}`;
}
export const isUpiId = (v: string) => /^[a-z0-9._-]{2,256}@[a-z][a-z0-9.-]{1,64}$/i.test(v);

const COLOUR_WORDS: [RegExp, string][] = [
  [/yellow|haldi|mustard|gold(en)?\b/i, "#F2C94C"],
  [/green|mehendi|mehndi|emerald|sage|mint/i, "#4F9B6A"],
  [/pink|rose|blush|fuchsia|rani/i, "#E86A92"],
  [/red|maroon|crimson|wine|burgundy/i, "#A3122B"],
  [/purple|violet|lavender|lilac|plum/i, "#7B3FA0"],
  [/blue|navy|teal|turquoise|indigo/i, "#2E5AAC"],
  [/orange|saffron|marigold|kesari|peach|coral/i, "#EE8A2E"],
  [/white|ivory|cream|pastel|beige|champagne|silk/i, "#F3EBDD"],
  [/black|tie|tux|noir|formal/i, "#1C1C24"],
  [/silver|grey|gray/i, "#B8BCC6"],
];
export function swatchFor(e: { dressCode?: string; dressColor?: string }): string {
  if (e.dressColor && /^#[0-9a-f]{6}$/i.test(e.dressColor)) return e.dressColor;
  for (const [re, c] of COLOUR_WORDS) if (re.test(e.dressCode ?? "")) return c;
  return "";
}

export const MAIN_RE = /wedding|vivah|शादी|विवाह|phera|shaadi|nikah|ceremony|muhurtham|muhurtam|kalyanam|anand karaj|marriage|lagna|matrimony/i;

/**
 * One palette for the whole invitation: the powder-blue Lake Terrace (sky,
 * ivory, champagne gold, flamingo pink). The art is painted for it, so every
 * page — including ones saved with blush, champagne or an old dark theme —
 * renders in powder.
 */
export const WP_THEME: WeddingThemeId = "powder";
export function lightTheme(v: unknown): WeddingThemeId {
  void v;
  return WP_THEME;
}

export function readPremium(data: ValentineDayData): WpModel {
  const x = (isObj(data.extras) ? data.extras : {}) as Record<string, unknown>;
  const pool = (Array.isArray(data.photos) ? data.photos : []).filter((p) => p && p.url).map((p) => (wpLocalUrl(p.url) === p.url ? p : { ...p, url: wpLocalUrl(p.url) }));
  const used = new Set<number>([0]);
  const pick = (n: unknown): LovePhoto | null => {
    const k = num(n);
    if (k < 1 || k > pool.length) return null;
    used.add(k - 1);
    return pool[k - 1];
  };

  const events: WeddingEvent[] = (Array.isArray(x.events) ? x.events : [])
    .filter(isObj)
    .slice(0, WP_LIMITS.events)
    .map((r, i) => {
      const e: WeddingEvent = {
        id: str(r.id, 40) || `event-${i + 1}`,
        title: str(r.title, 40),
        date: isIsoDate(str(r.date, 10)) ? str(r.date, 10) : "",
        time: hhmm(str(r.time, 5)),
        endTime: hhmm(str(r.endTime, 5)),
        venue: str(r.venue, 80),
        address: str(r.address, 140),
        mapUrl: /^https:\/\//i.test(str(r.mapUrl, 400)) ? str(r.mapUrl, 400) : "",
        dressCode: str(r.dressCode, 60),
        dressColor: "",
        note: str(r.note, 220),
      };
      e.dressColor = swatchFor({ dressCode: e.dressCode, dressColor: str(r.dressColor, 7) });
      return e;
    })
    .filter((e) => e.title || e.venue || e.date);

  // The main day: the stored extras.date/time (older pages had no other), else the wedding row.
  const mainRow = events.find((e) => MAIN_RE.test(e.title)) ?? events[0];
  const xDate = str(x.date, 10);
  const date = isIsoDate(xDate) ? xDate : mainRow?.date || events.find((e) => e.date)?.date || "";
  const time = hhmm(str(x.time, 5)) || mainRow?.time || "";
  const main: WeddingEvent | undefined = mainRow ? { ...mainRow, date: mainRow.date || date, time: mainRow.time || time } : date ? { id: "wedding", title: "Wedding", date, time, venue: "" } : undefined;

  const story: WpChapter[] = (Array.isArray(x.story) ? x.story : [])
    .filter(isObj)
    .slice(0, WP_LIMITS.story)
    // Old pages and the AI write `text`; tolerate `line` too.
    .map((r) => ({ when: str(r.when, 30), title: str(r.title, 50), line: str(r.text, 320) || str(r.line, 320), photo: pick(r.photo) }))
    .filter((c) => c.title || c.line);

  const things = (Array.isArray(x.faqs) ? x.faqs : [])
    .filter(isObj)
    .slice(0, WP_LIMITS.faq)
    .map((f) => ({ head: str(f.title, 40), text: str(f.text, 220) }))
    .filter((f) => f.head || f.text);

  const contacts: WpContact[] = (Array.isArray(x.contacts) ? x.contacts : [])
    .filter(isObj)
    .slice(0, 4)
    .map((r) => {
      const phone = normalisePhone(str(r.phone, 20));
      return { name: str(r.name, 40), relation: str(r.relation, 40), phone, display: phone ? displayPhone(phone) : "" };
    })
    .filter((c) => c.name && c.phone);

  const bride = str(data.recipientName, 30) || "Bride";
  const groom = str(data.senderName, 30) || "Groom";
  const order = x.order === "groom" ? "groom" : "bride";
  const [first, second] = order === "bride" ? [bride, groom] : [groom, bride];
  const bilingual = x.hindi !== false;
  const upiId = str(x.upiId, 60);
  const liveUrl = str(x.liveUrl, 300);
  const motif = (["ganesha", "lotus", "rings", "none"] as const).includes(x.motif as Motif) ? (x.motif as Motif) : "ganesha";

  return {
    theme: lightTheme(x.theme),
    lang: bilingual && x.lang === "hi" ? "hi" : "en",
    bilingual,
    motif,
    bride,
    groom,
    first,
    second,
    familyFirst: order,
    couple: `${first} & ${second}`,
    letter: str(data.letter, 1500),
    endLine: str(data.endLine, 120),
    hindiMessage: bilingual ? str(x.hindiMessage, 700) : "",
    brideFam: { names: str(x.brideParents, 120), note: str(x.brideNote, 100) },
    groomFam: { names: str(x.groomParents, 120), note: str(x.groomNote, 100) },
    blessingsOf: str(x.blessingsOf, 160),
    date,
    time,
    city: str(x.city, 40),
    muhurat: str(x.muhurat, 60),
    hashtag: str(x.hashtag, 40),
    events,
    main,
    story,
    things,
    gettingThere: str(x.gettingThere, 500),
    videoId: youtubeIdOf(str(x.videoUrl, 200)),
    rsvpBy: isIsoDate(str(x.rsvpBy, 10)) ? str(x.rsvpBy, 10) : "",
    maxGuests: Math.min(10, Math.max(1, num(x.maxGuests, 4))),
    rsvpMeal: x.rsvpMeal === true,
    // New in the rebuild: older pages (no key) get the wall too, now that the tier has it.
    blessings: x.blessings !== false,
    contacts,
    upiId: isUpiId(upiId) ? upiId : "",
    upiName: str(x.upiName, 60),
    liveUrl: /^https:\/\/[^\s]+$/i.test(liveUrl) ? liveUrl : "",
    cover: pool[0] ?? null,
    gallery: pool.filter((_, i) => !used.has(i)),
  };
}

// ── Bilingual strings ───────────────────────────────────────────────────────

export const T = {
  en: {
    open: "Tap to open the doors",
    opening: "Opening your invitation…",
    openHint: "Sound on · the music starts as the doors open",
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
    dateEyebrow: "Save the date",
    story: "Our story",
    storyEyebrow: "How it began",
    events: "The celebrations",
    eventsEyebrow: "Functions",
    venueEyebrow: "The venue",
    film: "Our film",
    play: "Play the film",
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
    shagun: "Shagun",
    shagunEyebrow: "For those who asked",
    shagunIntro: "Your blessings are the greatest gift. For those who asked, here is how to send shagun.",
    upiPay: "Pay by UPI",
    upiCopy: "Copy UPI ID",
    live: "Watch live",
    liveSoon: "The live stream opens 30 minutes before the ceremony.",
    liveEyebrow: "Can't make it?",
    share: "Pass it on",
    shareEyebrow: "Share the invitation",
    shareMore: "More apps",
    whatsapp: "Share on WhatsApp",
    copy: "Copy link",
    copied: "Link copied",
    card: "Download invite card",
    cardBusy: "Drawing your card…",
    saveDate: "Save the date",
    saveAll: "Save all dates",
    swipe: "Swipe to see every function",
    lang: "Language",
    saved: "Saved ✓",
    calendar: "Add to calendar",
    calShort: "Calendar",
    gcal: "Google Cal",
    directions: "Directions",
    dress: "Dress code",
    tba: "Time to be announced",
    closing: "With love",
    scroll: "Scroll",
    replay: "Replay the opening",
    upasthiti: "Aapki upasthiti prarthaniya hai",
    justMarried: "Just married",
    units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
  },
  hi: {
    open: "द्वार खोलने के लिए छुएँ",
    opening: "आपका निमंत्रण खुल रहा है…",
    openHint: "आवाज़ चालू रखें · द्वार खुलते ही संगीत शुरू होगा",
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
    dateEyebrow: "तिथि याद रखें",
    story: "हमारी कहानी",
    storyEyebrow: "शुरुआत",
    events: "शुभ कार्यक्रम",
    eventsEyebrow: "कार्यक्रम",
    venueEyebrow: "विवाह स्थल",
    film: "हमारी फ़िल्म",
    play: "फ़िल्म चलाएँ",
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
    shagun: "शगुन",
    shagunEyebrow: "जिन्होंने पूछा, उनके लिए",
    shagunIntro: "आपका आशीर्वाद ही सबसे बड़ा उपहार है। जिन्होंने पूछा, उनके लिए शगुन भेजने का तरीका।",
    upiPay: "UPI से भेजें",
    upiCopy: "UPI ID कॉपी करें",
    live: "लाइव देखें",
    liveSoon: "लाइव प्रसारण समारोह से 30 मिनट पहले शुरू होगा।",
    liveEyebrow: "नहीं आ पा रहे?",
    share: "आगे भेजें",
    shareEyebrow: "निमंत्रण साझा करें",
    shareMore: "अन्य ऐप",
    whatsapp: "WhatsApp पर भेजें",
    copy: "लिंक कॉपी करें",
    copied: "लिंक कॉपी हो गया",
    card: "निमंत्रण कार्ड डाउनलोड करें",
    cardBusy: "कार्ड बन रहा है…",
    saveDate: "तिथि सहेजें",
    saveAll: "सभी तिथियाँ सहेजें",
    swipe: "सभी कार्यक्रम देखने के लिए स्वाइप करें",
    lang: "भाषा",
    saved: "सहेजा गया ✓",
    calendar: "कैलेंडर में जोड़ें",
    calShort: "कैलेंडर",
    gcal: "Google Cal",
    directions: "रास्ता देखें",
    dress: "पोशाक",
    tba: "समय की सूचना जल्द",
    closing: "सप्रेम",
    scroll: "नीचे देखें",
    replay: "द्वार फिर से खोलें",
    upasthiti: "आपकी उपस्थिति प्रार्थनीय है",
    justMarried: "विवाह संपन्न",
    units: { d: "दिन", h: "घंटे", m: "मिनट", s: "सेकंड" },
  },
} as const;
export type Strings = { [K in keyof (typeof T)["en"]]: (typeof T)["en"][K] extends string ? string : { d: string; h: string; m: string; s: string } };
