// ─── Mughal Garden Wedding Invitation: extras → a render model ───────────────
// Untrusted (an old page, the AI fill, a hostile POST): everything is coerced.

import type { LovePhoto } from "../../../_love/types";
import { LIGHT_THEMES, type WeddingThemeId } from "../../../_wedding/themes";
import type { FamilySide, WeddingEvent } from "../../../_wedding/types";
import { GW_LIMITS } from "../../../_valentine/days/garden-wedding-invitation";

export type Lang = "en" | "hi";

export interface GwChapter {
  when: string;
  title: string;
  line: string;
  photo: LovePhoto | null;
}

export interface GardenModel {
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
  story: GwChapter[];
  things: { head: string; text: string }[];
  gettingThere: string;
  videoId: string;
  rsvpBy: string;
  maxGuests: number;
  rsvpMeal: boolean;
  blessings: boolean;
  /** Photos not used by a story chapter or a family card. */
  gallery: LovePhoto[];
  /** The couple's portrait in the jharokha: the first gallery photo, else any photo. */
  hero: LovePhoto | null;
  /** "॥ श्री गणेशाय नमः ॥" above the names on the garden gate (default). */
  invocation: boolean;
  /** Family members to call / WhatsApp (phone already validated + normalised). */
  contacts: GwContact[];
  /** Shagun: a UPI id (validated) and the payee name, or "" (the section hides). */
  upiId: string;
  upiName: string;
  /** Livestream link (https only) or "". */
  liveUrl: string;
}

export interface GwContact {
  name: string;
  relation: string;
  /** As typed (for display). */
  phone: string;
  /** Digits only with the country code, for tel: and wa.me ("919876543210"). */
  dial: string;
}

/** 10 digits with an optional +91 / 91 / 0 prefix → "91XXXXXXXXXX", else "". */
export function dialOf(raw: string): string {
  const d = raw.replace(/[^\d+]/g, "");
  const m = d.match(/^(?:\+?91|0)?([6-9]\d{9})$/);
  return m ? `91${m[1]}` : "";
}

/** A UPI VPA: handle@bank. */
export const isUpiId = (v: string) => /^[a-z0-9._-]{2,256}@[a-z][a-z0-9.-]{1,63}$/i.test(v.trim());

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

export function readGarden(extras: Record<string, unknown>, photos: LovePhoto[], bride: string, groom: string): GardenModel {
  const x = extras ?? {};
  const pool = (Array.isArray(photos) ? photos : []).filter((p) => p && p.url);
  const used = new Set<number>();
  const pick = (n: unknown): LovePhoto | null => {
    const k = num(n);
    if (k < 1 || k > pool.length) return null;
    used.add(k - 1);
    return pool[k - 1];
  };

  const events: WeddingEvent[] = (Array.isArray(x.events) ? x.events : [])
    .filter(isObj)
    .slice(0, GW_LIMITS.events)
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

  const story: GwChapter[] = (Array.isArray(x.story) ? x.story : [])
    .filter(isObj)
    .slice(0, GW_LIMITS.story)
    .map((r) => ({ when: str(r.when, 24), title: str(r.title, 60), line: str(r.line, 240), photo: pick(r.photo) }))
    .filter((c) => c.title || c.line);

  const bridePhoto = pick(x.bridePhoto);
  const groomPhoto = pick(x.groomPhoto);

  const things = (Array.isArray(x.things) ? x.things : [])
    .map((t) => str(t, 180))
    .filter(Boolean)
    .slice(0, GW_LIMITS.faq)
    .map((t) => {
      const m = t.match(/^([^:]{2,28}):\s*(.+)$/);
      return m ? { head: m[1].trim(), text: m[2].trim() } : { head: "", text: t };
    });

  const gallery = pool.filter((_, i) => !used.has(i));
  const order = x.nameOrder === "groom" ? "groom" : "bride";
  const b = bride.trim() || "Bride";
  const g = groom.trim() || "Groom";

  return {
    // Light only: an old page (or a hostile POST) asking for a dark theme gets Blush.
    theme: (LIGHT_THEMES as readonly string[]).includes(String(x.theme)) ? (x.theme as WeddingThemeId) : "blush",
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
    videoId: youtubeIdOf(str(x.videoUrl, 200)),
    rsvpBy: /^\d{4}-\d{2}-\d{2}$/.test(str(x.rsvpBy, 10)) ? str(x.rsvpBy, 10) : "",
    maxGuests: Math.min(10, Math.max(1, num(x.maxGuests, 4))),
    rsvpMeal: x.rsvpMeal !== false,
    blessings: x.blessings !== false,
    gallery,
    hero: gallery[0] ?? pool[0] ?? null,
    invocation: x.invocation !== false,
    contacts: (Array.isArray(x.contacts) ? x.contacts : [])
      .filter(isObj)
      .slice(0, 4)
      .map((r) => {
        const phone = str(r.phone, 16);
        return { name: str(r.name, 40), relation: str(r.relation, 40), phone, dial: dialOf(phone) };
      })
      .filter((c) => c.name && c.dial),
    upiId: isUpiId(str(x.upiId, 60)) ? str(x.upiId, 60) : "",
    upiName: str(x.upiName, 60),
    liveUrl: /^https:\/\/[^\s]+$/i.test(str(x.liveUrl, 300)) ? str(x.liveUrl, 300) : "",
  };
}

// ── Bilingual strings ───────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the list is the type
const KEYS = [
  "open", "dear", "invitedYou", "together", "shubh", "invitation", "blessingsOf", "families", "brideSide", "groomSide",
  "countdown", "dateEyebrow", "story", "storyEyebrow", "events", "eventsEyebrow", "film", "filmEyebrow", "gallery", "galleryEyebrow",
  "goodToKnow", "notesEyebrow", "gettingThere", "rsvp", "rsvpEyebrow", "rsvpIntro", "blessings", "blessingsEyebrow", "blessingsIntro",
  "closing", "whatsapp", "share", "copy", "copied", "card", "cardMaking", "qr", "qrHint", "close", "saveDate", "saved", "done",
  "directions", "calendar", "saveAll", "dress", "tba", "play", "and", "weds", "scroll", "venueEyebrow", "map", "upasthiti",
  "contacts", "contactsIntro", "call", "chat", "shagun", "shagunIntro", "upiPay", "upiCopy", "upiCopied", "live", "liveSoon", "liveOver", "muted", "sound",
] as const;
type StringsShape = { [K in (typeof KEYS)[number]]: string } & { units: { d: string; h: string; m: string; s: string } };

export const T: Record<Lang, StringsShape> = {
  en: {
    open: "Open the garden gate",
    dear: "Dear",
    invitedYou: "you are warmly invited",
    together: "Together with their families",
    shubh: "Shubh Vivah",
    invitation: "The invitation",
    blessingsOf: "With the blessings of",
    families: "Two families, one garden",
    brideSide: "The bride's family",
    groomSide: "The groom's family",
    countdown: "Until the pheras",
    dateEyebrow: "The auspicious day",
    story: "Our story",
    storyEyebrow: "How we bloomed",
    events: "The celebrations",
    eventsEyebrow: "Functions",
    film: "Our film",
    filmEyebrow: "Before the big day",
    gallery: "Moments",
    galleryEyebrow: "From our album",
    goodToKnow: "Good to know",
    notesEyebrow: "Garden notes",
    gettingThere: "Getting there",
    rsvp: "Will you join us?",
    rsvpEyebrow: "Kindly respond",
    rsvpIntro: "One reply for your family. Tick the functions you'll attend.",
    blessings: "Leave your blessings",
    blessingsEyebrow: "Aashirvaad",
    blessingsIntro: "A line from you, kept by the couple forever.",
    closing: "With love",
    whatsapp: "Share on WhatsApp",
    share: "Share",
    copy: "Copy link",
    copied: "Link copied",
    card: "Save the invite card",
    cardMaking: "Painting your card…",
    qr: "Show QR code",
    qrHint: "Scan to open the invitation",
    close: "Close",
    saveDate: "Save the date",
    saved: "Saved",
    done: "Just married",
    directions: "Directions",
    calendar: "Add to calendar",
    saveAll: "Save all dates",
    dress: "Dress code",
    tba: "Time to be announced",
    play: "Play the film",
    and: "&",
    weds: "&",
    scroll: "Stroll into the garden",
    venueEyebrow: "The venue",
    map: "Show the map",
    upasthiti: "Aapki upasthiti prarthaniya hai",
    contacts: "Call the family",
    contactsIntro: "Questions about travel, stay or timings? We're a call away.",
    call: "Call",
    chat: "WhatsApp",
    shagun: "Shagun",
    shagunIntro: "Your blessings are all we wish for. For those who have asked:",
    upiPay: "Pay by UPI",
    upiCopy: "Copy UPI id",
    upiCopied: "UPI id copied",
    live: "Watch live",
    liveSoon: "The livestream opens 30 minutes before the pheras",
    liveOver: "Watch the livestream",
    muted: "Music off",
    sound: "Music on",
    units: { d: "Days", h: "Hours", m: "Minutes", s: "Seconds" },
  },
  hi: {
    open: "बाग़ का द्वार खोलें",
    dear: "प्रिय",
    invitedYou: "आप सादर आमंत्रित हैं",
    together: "परिवारों के आशीर्वाद से",
    shubh: "शुभ विवाह",
    invitation: "निमंत्रण",
    blessingsOf: "के आशीर्वाद से",
    families: "दो परिवार, एक बाग़",
    brideSide: "वधू पक्ष",
    groomSide: "वर पक्ष",
    countdown: "फेरों में बाकी",
    dateEyebrow: "शुभ मुहूर्त",
    story: "हमारी कहानी",
    storyEyebrow: "कैसे खिला यह रिश्ता",
    events: "शुभ कार्यक्रम",
    eventsEyebrow: "कार्यक्रम",
    film: "हमारी फ़िल्म",
    filmEyebrow: "शादी से पहले",
    gallery: "यादें",
    galleryEyebrow: "हमारे एल्बम से",
    goodToKnow: "ज़रूरी जानकारी",
    notesEyebrow: "बाग़ की बातें",
    gettingThere: "कैसे पहुँचें",
    rsvp: "क्या आप पधारेंगे?",
    rsvpEyebrow: "कृपया उत्तर दें",
    rsvpIntro: "पूरे परिवार की ओर से एक जवाब। जिन कार्यक्रमों में आएँगे, उन्हें चुनें।",
    blessings: "अपना आशीर्वाद दें",
    blessingsEyebrow: "आशीर्वाद",
    blessingsIntro: "आपकी एक पंक्ति, जिसे दूल्हा-दुल्हन हमेशा सँजोकर रखेंगे।",
    closing: "सप्रेम",
    whatsapp: "WhatsApp पर भेजें",
    share: "भेजें",
    copy: "लिंक कॉपी करें",
    copied: "लिंक कॉपी हो गया",
    card: "निमंत्रण कार्ड सहेजें",
    cardMaking: "कार्ड बन रहा है…",
    qr: "QR कोड दिखाएँ",
    qrHint: "निमंत्रण खोलने के लिए स्कैन करें",
    close: "बंद करें",
    saveDate: "तिथि सहेजें",
    saved: "सहेजा गया",
    done: "विवाह संपन्न",
    directions: "रास्ता देखें",
    calendar: "कैलेंडर में जोड़ें",
    saveAll: "सभी तिथियाँ सहेजें",
    dress: "पोशाक",
    tba: "समय की सूचना जल्द",
    play: "फ़िल्म चलाएँ",
    and: "संग",
    weds: "संग",
    scroll: "बाग़ में पधारें",
    venueEyebrow: "विवाह स्थल",
    map: "नक्शा देखें",
    upasthiti: "आपकी उपस्थिति प्रार्थनीय है",
    contacts: "परिवार से बात करें",
    contactsIntro: "यात्रा, ठहरने या समय के बारे में कुछ पूछना हो तो फ़ोन करें।",
    call: "कॉल",
    chat: "WhatsApp",
    shagun: "शगुन",
    shagunIntro: "आपका आशीर्वाद ही सबसे बड़ा उपहार है। जिन्होंने पूछा है, उनके लिए:",
    upiPay: "UPI से भेजें",
    upiCopy: "UPI आईडी कॉपी करें",
    upiCopied: "UPI आईडी कॉपी हो गई",
    live: "लाइव देखें",
    liveSoon: "लाइव प्रसारण फेरों से 30 मिनट पहले शुरू होगा",
    liveOver: "लाइव प्रसारण देखें",
    muted: "संगीत बंद",
    sound: "संगीत चालू",
    units: { d: "दिन", h: "घंटे", m: "मिनट", s: "सेकंड" },
  },
};
export type Strings = StringsShape;
