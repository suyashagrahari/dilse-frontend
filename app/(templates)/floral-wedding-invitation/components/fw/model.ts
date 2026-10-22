// ─── Pampas & Peony: extras → a render model ─────────────────────────────────
// Untrusted (an old page, the AI fill, a hostile POST): everything is coerced.

import type { LovePhoto } from "../../../_love/types";
import { isWeddingThemeId, LIGHT_THEMES, type WeddingThemeId } from "../../../_wedding/themes";
import type { FamilySide, WeddingEvent } from "../../../_wedding/types";
import { FW_CONTACTS_MAX, FW_LIMITS, fwLocalUrl } from "../../../_valentine/days/floral-wedding-invitation";

export type Lang = "en" | "hi";

export interface FwChapter {
  when: string;
  title: string;
  line: string;
  photo: LovePhoto | null;
}

export interface FwContact {
  name: string;
  relation: string;
  /** Display form ("+91 98290 00000"). */
  display: string;
  /** tel: target ("+919829000000"). */
  tel: string;
  /** wa.me digits ("919829000000"). */
  wa: string;
}

export interface FloralModel {
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
  story: FwChapter[];
  things: { head: string; text: string }[];
  gettingThere: string;
  videoId: string;
  rsvpBy: string;
  maxGuests: number;
  rsvpMeal: boolean;
  blessings: boolean;
  /** Photos not used by a story chapter, a family card or the couple portrait. */
  gallery: LovePhoto[];
  /** The family cards' photos with their focal point / zoom (bride_.photo / groom_.photo carry only the url). */
  bridePic: LovePhoto | null;
  groomPic: LovePhoto | null;
  /** The couple's portrait under the floral drape (extras.couplePhoto); null = the illustration only. */
  couple: LovePhoto | null;
  /** Ganesha invocation on the invitation card (default). */
  invocation: boolean;
  contacts: FwContact[];
  /** Shagun by UPI (off unless the sender adds an id). */
  upi: { id: string; name: string } | null;
  /** Livestream link (https only). */
  liveUrl: string;
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

/** Dress-code words → a swatch, for a row whose sender (or the AI) left the colour empty. */
const COLOUR_WORDS: [RegExp, string][] = [
  [/yellow|haldi|mustard|gold(en)?\b/i, "#F2C94C"],
  [/green|mehendi|mehndi|emerald|sage|mint/i, "#7FA77A"],
  [/pink|rose|blush|fuchsia|rani/i, "#E7A3AE"],
  [/red|maroon|crimson|wine|burgundy/i, "#A3122B"],
  [/purple|violet|lavender|lilac|plum/i, "#A58CC4"],
  [/blue|navy|teal|turquoise|indigo/i, "#6F8FC2"],
  [/orange|saffron|marigold|kesari|peach|coral/i, "#EE9A5E"],
  [/white|ivory|cream|pastel|beige|champagne|nude/i, "#F1E6D6"],
  [/black|tie|tux|noir|formal/i, "#2A2622"],
  [/silver|grey|gray/i, "#B8BCC6"],
];
export function swatchFor(e: Pick<WeddingEvent, "dressCode" | "dressColor">): string {
  if (e.dressColor && /^#[0-9a-f]{6}$/i.test(e.dressColor)) return e.dressColor;
  for (const [re, c] of COLOUR_WORDS) if (re.test(e.dressCode ?? "")) return c;
  return "";
}

export const MAIN_RE = /wedding|vivah|शादी|विवाह|phera|shaadi|nikah|ceremony|muhurtham|kalyanam|anand karaj|marriage|lagna/i;

/**
 * A phone number a guest can tap: Indian mobiles (10 digits, optional +91 / 0)
 * become +91; anything else with a leading + and 8–15 digits is kept as it is.
 * Null for anything that would dial nonsense.
 */
export function phoneOf(raw: string): { display: string; tel: string; wa: string } | null {
  const t = raw.trim();
  if (!t) return null;
  const digits = t.replace(/\D/g, "");
  let local = "";
  if (/^[6-9]\d{9}$/.test(digits)) local = digits;
  else if (/^91[6-9]\d{9}$/.test(digits)) local = digits.slice(2);
  else if (/^0[6-9]\d{9}$/.test(digits)) local = digits.slice(1);
  if (local) return { display: `+91 ${local.slice(0, 5)} ${local.slice(5)}`, tel: `+91${local}`, wa: `91${local}` };
  if (t.startsWith("+") && digits.length >= 8 && digits.length <= 15) return { display: `+${digits}`, tel: `+${digits}`, wa: digits };
  return null;
}

export const UPI_RE = /^[a-z0-9._-]{2,256}@[a-z][a-z0-9.-]{1,64}$/i;

export function readFloral(extras: Record<string, unknown>, photos: LovePhoto[], bride: string, groom: string): FloralModel {
  const x = extras ?? {};
  // Demo / repo art is stored as https://subhsandesh.in/wedding-v3/…: every host serves its own copy.
  const pool = (Array.isArray(photos) ? photos : []).filter((p) => p && p.url).map((p) => (fwLocalUrl(p.url) === p.url ? p : { ...p, url: fwLocalUrl(p.url) }));
  const used = new Set<number>();
  const pick = (n: unknown): LovePhoto | null => {
    const k = num(n);
    if (k < 1 || k > pool.length) return null;
    used.add(k - 1);
    return pool[k - 1];
  };

  const events: WeddingEvent[] = (Array.isArray(x.events) ? x.events : [])
    .filter(isObj)
    .slice(0, FW_LIMITS.events)
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

  const story: FwChapter[] = (Array.isArray(x.story) ? x.story : [])
    .filter(isObj)
    .slice(0, FW_LIMITS.story)
    .map((r) => ({ when: str(r.when, 24), title: str(r.title, 60), line: str(r.line, 240), photo: pick(r.photo) }))
    .filter((c) => c.title || c.line);

  const bridePhoto = pick(x.bridePhoto);
  const groomPhoto = pick(x.groomPhoto);
  const couple = pick(x.couplePhoto);

  const things = (Array.isArray(x.things) ? x.things : [])
    .map((t) => str(t, 180))
    .filter(Boolean)
    .slice(0, FW_LIMITS.faq)
    .map((t) => {
      const m = t.match(/^([^:]{2,28}):\s*(.+)$/);
      return m ? { head: m[1].trim(), text: m[2].trim() } : { head: "", text: t };
    });

  const contacts: FwContact[] = [];
  for (const r of (Array.isArray(x.contacts) ? x.contacts : []).filter(isObj).slice(0, FW_CONTACTS_MAX)) {
    const p = phoneOf(str(r.phone, 20));
    const name = str(r.name, 40);
    if (p && name) contacts.push({ name, relation: str(r.relation, 40), ...p });
  }

  const upiId = str(x.upiId, 80);
  const live = str(x.liveUrl, 300);

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
    bride_: { title: "", names: [str(x.brideFamily, 120)].filter(Boolean), note: str(x.brideNote, 100), photo: bridePhoto?.url },
    groom_: { title: "", names: [str(x.groomFamily, 120)].filter(Boolean), note: str(x.groomNote, 100), photo: groomPhoto?.url },
    familyFirst: order,
    bridePic: bridePhoto,
    groomPic: groomPhoto,
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
    gallery,
    couple,
    invocation: x.invocation !== false,
    contacts,
    upi: UPI_RE.test(upiId) ? { id: upiId, name: str(x.upiName, 60) } : null,
    liveUrl: /^https:\/\/[^\s"'<>]+$/i.test(live) ? live : "",
  };
}

// ── Bilingual strings ───────────────────────────────────────────────────────

type Keys =
  | "open" | "openHint" | "dear" | "invited" | "togetherWith" | "gettingMarried" | "shubh" | "invitation" | "blessingsOf" | "families"
  | "brideSide" | "groomSide" | "countdown" | "story" | "storyEyebrow" | "events" | "eventsEyebrow" | "film" | "gallery"
  | "galleryEyebrow" | "goodToKnow" | "guestsEyebrow" | "gettingThere" | "rsvp" | "rsvpEyebrow" | "blessingsEyebrow" | "rsvpIntro"
  | "blessings" | "blessingsIntro" | "closing" | "whatsapp" | "replyBy" | "done" | "directions" | "calendar" | "saveAll" | "dress"
  | "tba" | "play" | "and" | "scroll" | "dateEyebrow" | "venueEyebrow" | "upasthiti" | "saveDate" | "rsvpNow" | "share"
  | "copy" | "copied" | "card" | "cardBusy" | "qr" | "qrHint" | "contacts" | "contactsIntro" | "call" | "shagun" | "shagunIntro"
  | "payUpi" | "copyUpi" | "live" | "liveSoon" | "liveIntro" | "close" | "shareInvite" | "mantra" | "saved" | "showMap" | "scan";

type StringsShape = { [K in Keys]: string } & { units: { d: string; h: string; m: string; s: string } };

export const T: Record<Lang, StringsShape> = {
  en: {
    open: "Break the seal",
    openHint: "Tap the wax seal to open your invitation",
    dear: "Dear",
    invited: "You're invited",
    togetherWith: "Together with their families",
    gettingMarried: "are getting married",
    shubh: "Shubh Vivah",
    invitation: "The invitation",
    blessingsOf: "With the blessings of",
    families: "Our families",
    brideSide: "The bride's family",
    groomSide: "The groom's family",
    countdown: "Counting down to forever",
    story: "Our story",
    storyEyebrow: "Pressed between pages",
    events: "The celebrations",
    eventsEyebrow: "Functions",
    film: "Our film",
    gallery: "Moments",
    galleryEyebrow: "The album",
    goodToKnow: "Good to know",
    guestsEyebrow: "For our guests",
    gettingThere: "Getting there",
    rsvp: "Will you join us?",
    rsvpEyebrow: "Kindly respond",
    blessingsEyebrow: "Aashirvaad",
    rsvpIntro: "One reply for your family. Tick the functions you'll attend.",
    blessings: "Leave your blessings",
    blessingsIntro: "A line from you, kept by the couple forever.",
    closing: "With love",
    whatsapp: "WhatsApp",
    replyBy: "Kindly reply by",
    units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
    done: "Just married",
    directions: "Directions",
    calendar: "Add to calendar",
    saveAll: "Save all dates",
    dress: "Dress code",
    tba: "Time to be announced",
    play: "Play the film",
    and: "&",
    scroll: "Scroll",
    dateEyebrow: "Save the date",
    venueEyebrow: "The venue",
    upasthiti: "Your presence is our blessing",
    saveDate: "Save the date",
    rsvpNow: "RSVP",
    share: "Share",
    copy: "Copy link",
    copied: "Link copied",
    card: "Download card",
    cardBusy: "Making your card…",
    qr: "Show QR",
    qrHint: "Scan to open the invitation",
    contacts: "Any questions? Call us",
    contactsIntro: "The family is a phone call away.",
    call: "Call",
    shagun: "Shagun",
    shagunIntro: "Your blessings are all we wish for. For those who have asked:",
    payUpi: "Send by UPI",
    copyUpi: "Copy UPI ID",
    live: "Watch live",
    liveSoon: "The live stream opens 30 minutes before",
    liveIntro: "Can't be there? Join us online.",
    close: "Close",
    shareInvite: "Share the invitation",
    mantra: "॥ श्री गणेशाय नमः ॥",
    saved: "Saved",
    showMap: "Show the map",
    scan: "Scan to open",
  },
  hi: {
    open: "मुहर खोलें",
    openHint: "निमंत्रण खोलने के लिए मुहर को छुएँ",
    dear: "प्रिय",
    invited: "आप सादर आमंत्रित हैं",
    togetherWith: "परिवारों के आशीर्वाद से",
    gettingMarried: "परिणय सूत्र में बँध रहे हैं",
    shubh: "शुभ विवाह",
    invitation: "निमंत्रण",
    blessingsOf: "के आशीर्वाद से",
    families: "हमारा परिवार",
    brideSide: "वधू पक्ष",
    groomSide: "वर पक्ष",
    countdown: "शुभ घड़ी में बाकी",
    story: "हमारी कहानी",
    storyEyebrow: "यादों के पन्ने",
    events: "शुभ कार्यक्रम",
    eventsEyebrow: "कार्यक्रम",
    film: "हमारी फ़िल्म",
    gallery: "यादें",
    galleryEyebrow: "एल्बम",
    goodToKnow: "ज़रूरी जानकारी",
    guestsEyebrow: "अतिथियों के लिए",
    gettingThere: "कैसे पहुँचें",
    rsvp: "क्या आप पधारेंगे?",
    rsvpEyebrow: "कृपया उत्तर दें",
    blessingsEyebrow: "आशीर्वाद",
    rsvpIntro: "पूरे परिवार की ओर से एक जवाब। जिन कार्यक्रमों में आएँगे, उन्हें चुनें।",
    blessings: "अपना आशीर्वाद दें",
    blessingsIntro: "आपकी एक पंक्ति, जिसे दूल्हा-दुल्हन हमेशा सँजोकर रखेंगे।",
    closing: "सप्रेम",
    whatsapp: "WhatsApp",
    replyBy: "कृपया जवाब दें",
    units: { d: "दिन", h: "घंटे", m: "मिनट", s: "सेकंड" },
    done: "विवाह संपन्न",
    directions: "रास्ता देखें",
    calendar: "कैलेंडर में जोड़ें",
    saveAll: "सभी तिथियाँ सहेजें",
    dress: "पोशाक",
    tba: "समय की सूचना जल्द",
    play: "फ़िल्म चलाएँ",
    and: "संग",
    scroll: "आगे देखें",
    dateEyebrow: "शुभ तिथि",
    venueEyebrow: "विवाह स्थल",
    upasthiti: "आपकी उपस्थिति प्रार्थनीय है",
    saveDate: "तिथि सहेजें",
    rsvpNow: "उत्तर दें",
    share: "भेजें",
    copy: "लिंक कॉपी करें",
    copied: "लिंक कॉपी हो गया",
    card: "कार्ड डाउनलोड करें",
    cardBusy: "कार्ड बन रहा है…",
    qr: "QR दिखाएँ",
    qrHint: "निमंत्रण खोलने के लिए स्कैन करें",
    contacts: "कोई प्रश्न? हमें फ़ोन करें",
    contactsIntro: "परिवार बस एक फ़ोन की दूरी पर है।",
    call: "फ़ोन करें",
    shagun: "शगुन",
    shagunIntro: "आपका आशीर्वाद ही हमारा उपहार है। जिन्होंने पूछा है, उनके लिए:",
    payUpi: "UPI से भेजें",
    copyUpi: "UPI ID कॉपी करें",
    live: "लाइव देखें",
    liveSoon: "लाइव प्रसारण 30 मिनट पहले शुरू होगा",
    liveIntro: "पधार न सकें तो ऑनलाइन जुड़ें।",
    close: "बंद करें",
    shareInvite: "निमंत्रण भेजें",
    mantra: "॥ श्री गणेशाय नमः ॥",
    saved: "सहेजा गया",
    showMap: "नक्शा देखें",
    scan: "स्कैन करें",
  },
};
export type Strings = StringsShape;
