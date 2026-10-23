// ─── Christian Wedding (chapel doors): the form, the demo, the converters ────
//
// `CwData` is the editor's form state (`mf`) and what the guest page renders.
// It is NOT the stored shape: the server model is the old flat
// ChristianWeddingPage (shared with christian-wedding-2) plus the rebuild's
// optional extras, and `fromDb` / `toBody` convert both ways.
//
// Data compatibility (pages published before the rebuild):
//   • nothing stored is renamed, retyped or removed — `toBody` still writes
//     every old field (`weddingDate` ISO, events' display `date` "16 Jan" and
//     `time` "3:30 PM", `bridePhoto`, `brideTags`…);
//   • every new field may be absent: `fromDb` gives it a default that keeps
//     the old page looking like itself (no theme → ivory, no song → the hymn
//     the old page always played, no scripture → the old blessing line);
//   • an old event's free-text "21 Jul" is read as an ISO date in the year of
//     the wedding, best effort, and its id is generated on the next save.
//
// The AI fill writes against these paths (server config/aiFill/christian-wedding.ts):
// brideName, groomName, weddingDay, weddingTime, churchName, venue,
// invitation, altInvitation, scripture.ref, brideFamily.parents,
// groomFamily.parents, events[0-3].{name,isoDate,time,venue,dressCode},
// story[0-1].{title,line}, contacts[0].{name,relation,phone}, closingLine.

import type { LovePhoto, PhotoSpan } from "../../_love/types";
import type { SongSuggestion } from "../../_valentine/music/youtube";
import type { WeddingEvent } from "../../_wedding/types";

export const SLUG = "christian-wedding";
export const CW_LIMITS = { events: 8, photos: 40, story: 6, service: 10, contacts: 4, things: 6 } as const;

// ── Types ───────────────────────────────────────────────────────────────────

export interface CwEvent {
  /** Stable id the RSVPs refer to (generated once, never from the name). */
  id: string;
  name: string;
  /** "2027-01-16" */
  isoDate: string;
  /** "15:30" (24 h); "" = to be announced. */
  time: string;
  venue: string;
  address: string;
  /** https Google Maps link; "" = built from venue + address. */
  mapUrl: string;
  dressCode: string;
  dressColor: string;
  details: string;
  icon: string;
  disabled: boolean;
  // Kept so a save never loses what an older editor stored.
  hindi?: string;
  accent?: string;
}

export interface CwChapter {
  when: string;
  title: string;
  line: string;
  photo: string;
  cropX: number;
  cropY: number;
  scale: number;
}

export interface CwContact {
  name: string;
  relation: string;
  phone: string;
}

export interface CwPerson {
  name: string;
  description: string;
  photo: string;
  /** Old pages' tag chips (kept, not edited any more). */
  tags: { emoji: string; label: string }[];
}

export type SecondLang = "none" | "hi" | "ml" | "ta";
export type CwThemeId = "ivory" | "rose" | "sage";
export type MusicMode = "off" | "melody" | "youtube" | "track";

export interface CwData {
  brideName: string;
  groomName: string;
  /** "2027-01-16" — the ceremony's date. */
  weddingDay: string;
  /** "15:30" */
  weddingTime: string;
  churchName: string;
  /** The church's address / city (the old `venue`). */
  venue: string;
  /** The old one-line blessing ("God bless this union"). */
  blessing: string;
  invitation: string;
  scripture: { text: string; ref: string };
  secondLang: SecondLang;
  altInvitation: string;
  altVerse: string;
  bride: CwPerson;
  groom: CwPerson;
  brideFamily: { parents: string; grandparents: string };
  groomFamily: { parents: string; grandparents: string };
  blessingsOf: string;
  couplePhoto: string;
  couplePhotoCrop: { x: number; y: number; scale: number };
  events: CwEvent[];
  orderOfService: { time: string; title: string; note: string }[];
  story: CwChapter[];
  gallery: LovePhoto[];
  videoUrl: string;
  contacts: CwContact[];
  liveUrl: string;
  upiId: string;
  upiName: string;
  things: { head: string; text: string }[];
  gettingThere: string;
  theme: CwThemeId;
  music: { mode: MusicMode; youtubeId: string; start: number };
  rsvpOn: boolean;
  rsvpBy: string;
  rsvpMeal: boolean;
  maxGuests: number;
  hashtag: string;
  closingLine: string;
  /** Blessings from the server's wall (read-only here). */
  wishes: { name: string; message: string; voiceUrl?: string }[];
  sharePhoto: string;
}

// ── Scripture: chosen, never generated ──────────────────────────────────────
// World English Bible (public domain).

export const VERSES: { ref: string; text: string }[] = [
  {
    ref: "1 Corinthians 13:4-7",
    text: "Love is patient and is kind. Love doesn’t envy, doesn’t brag, is not proud… it bears all things, believes all things, hopes all things, endures all things.",
  },
  { ref: "1 Corinthians 13:13", text: "But now faith, hope, and love remain — these three. The greatest of these is love." },
  { ref: "Ecclesiastes 4:9-12", text: "Two are better than one, because they have a good reward for their labour… a threefold cord is not quickly broken." },
  { ref: "Genesis 2:24", text: "Therefore a man will leave his father and his mother, and will join with his wife, and they will be one flesh." },
  { ref: "Song of Solomon 8:7", text: "Many waters can’t quench love, neither can floods drown it." },
  { ref: "Ruth 1:16", text: "Where you go, I will go; and where you stay, I will stay. Your people will be my people, and your God my God." },
  { ref: "Colossians 3:14", text: "Above all these things, walk in love, which is the bond of perfection." },
  { ref: "1 John 4:12", text: "If we love one another, God remains in us, and his love has been perfected in us." },
];
export const verseFor = (ref: string) => VERSES.find((v) => v.ref === ref) ?? null;

// ── Second language ─────────────────────────────────────────────────────────

export const SECOND_LANGS: { id: SecondLang; label: string; native: string; lang: string }[] = [
  { id: "none", label: "English only", native: "", lang: "en" },
  { id: "ml", label: "Malayalam", native: "മലയാളം", lang: "ml" },
  { id: "ta", label: "Tamil", native: "தமிழ்", lang: "ta" },
  { id: "hi", label: "Hindi", native: "हिन्दी", lang: "hi" },
];
/** Sample lines for the editor's placeholder (to be reviewed by a native speaker before launch). */
export const ALT_SAMPLES: Record<Exclude<SecondLang, "none">, string> = {
  ml: "ദൈവകൃപയാൽ ഞങ്ങളുടെ വിവാഹത്തിന് നിങ്ങളെ സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു.",
  ta: "இறைவனின் அருளால் நடைபெறும் எங்கள் திருமணத்திற்கு உங்களை அன்புடன் அழைக்கிறோம்.",
  hi: "प्रभु की कृपा से हमारे विवाह समारोह में आप सादर आमंत्रित हैं।",
};

// ── Songs (YouTube ids verified with oEmbed, 2026-10-23) ────────────────────

export const CW_TRACK = {
  url: "https://cdn.subhsandesh.in/gifts-media/christan-wedding/BeThouMyVision.mp3",
  title: "Be Thou My Vision",
  artist: "Traditional hymn",
};
export const CW_SONGS: readonly SongSuggestion[] = [
  { id: "Ptk_1Dc2iPY", title: "Canon in D", artist: "Brooklyn Duo" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "2bosouX_d8Y", title: "Ave Maria", artist: "Schubert" },
  { id: "vGJTaP6anOU", title: "Can't Help Falling in Love", artist: "Elvis Presley" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "DXDGE_lRI0E", title: "10,000 Reasons", artist: "Matt Redman" },
  { id: "0put0_a--Ng", title: "Make You Feel My Love", artist: "Adele" },
  { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran" },
  { id: "LRP8d7hhpoQ", title: "Hallelujah", artist: "Pentatonix" },
];

// ── Themes: three light palettes over the kit's champagne / blush tokens ────

export const CW_THEMES: Record<CwThemeId, { label: string; blurb: string; base: "champagne" | "blush"; swatch: [string, string, string]; vars: Record<string, string> }> = {
  ivory: {
    label: "Ivory & Gold",
    blurb: "Chapel ivory, sage, soft gold",
    base: "champagne",
    swatch: ["#fbf7ef", "#7f9a7c", "#c2a165"],
    vars: {
      "--wk-bg": "#fbf7ef",
      "--wk-bg2": "#f3ead9",
      "--wk-surface": "rgba(255, 253, 248, 0.9)",
      "--wk-surface-solid": "#fffdf8",
      "--wk-surface-2": "#f5efe3",
      "--wk-ink": "#3b342c",
      "--wk-muted": "#7a7064",
      "--wk-accent": "#6f8a6c",
      "--wk-accent-ink": "#fffdf8",
      "--wk-gold": "#c2a165",
      "--wk-gold-ink": "#87683a",
      "--wk-border": "rgba(135, 104, 58, 0.2)",
      "--wk-glow": "rgba(236, 214, 170, 0.55)",
      "--cw-rose": "#b97a80",
      "--cw-rose-soft": "#f3e2e0",
      "--cw-sage": "#7f9a7c",
      "--cw-sage-soft": "#e6ede2",
      "--cw-wash": "#f6efe2",
    },
  },
  rose: {
    label: "Dusty Rose",
    blurb: "Blush roses, rose-gold",
    base: "blush",
    swatch: ["#fbf2f0", "#a9646d", "#c6996a"],
    vars: {
      "--wk-bg": "#fbf2f0",
      "--wk-bg2": "#f3e0dc",
      "--wk-surface": "rgba(255, 251, 250, 0.9)",
      "--wk-surface-solid": "#fffbfa",
      "--wk-surface-2": "#f7e8e5",
      "--wk-ink": "#432a2d",
      "--wk-muted": "#86676a",
      "--wk-accent": "#a9646d",
      "--wk-accent-ink": "#fffaf9",
      "--wk-gold": "#c6996a",
      "--wk-gold-ink": "#8a5a3a",
      "--wk-border": "rgba(169, 100, 109, 0.2)",
      "--wk-glow": "rgba(238, 186, 190, 0.5)",
      "--cw-rose": "#a9646d",
      "--cw-rose-soft": "#f5e0de",
      "--cw-sage": "#869c82",
      "--cw-sage-soft": "#e9eee4",
      "--cw-wash": "#f8e9e6",
    },
  },
  sage: {
    label: "Sage Garden",
    blurb: "Eucalyptus green, ivory",
    base: "champagne",
    swatch: ["#f5f6ef", "#5f7c5f", "#b89a62"],
    vars: {
      "--wk-bg": "#f5f6ef",
      "--wk-bg2": "#e5eadc",
      "--wk-surface": "rgba(253, 253, 249, 0.9)",
      "--wk-surface-solid": "#fdfdf9",
      "--wk-surface-2": "#eef1e7",
      "--wk-ink": "#2f3a2f",
      "--wk-muted": "#6c7768",
      "--wk-accent": "#5f7c5f",
      "--wk-accent-ink": "#fbfcf7",
      "--wk-gold": "#b89a62",
      "--wk-gold-ink": "#7d6334",
      "--wk-border": "rgba(95, 124, 95, 0.22)",
      "--wk-glow": "rgba(200, 220, 190, 0.55)",
      "--cw-rose": "#b47f82",
      "--cw-rose-soft": "#f2e4e2",
      "--cw-sage": "#5f7c5f",
      "--cw-sage-soft": "#e1e9db",
      "--cw-wash": "#eef1e6",
    },
  },
};
export const CW_THEME_IDS = Object.keys(CW_THEMES) as CwThemeId[];
export const themeOf = (id: unknown): CwThemeId => (typeof id === "string" && id in CW_THEMES ? (id as CwThemeId) : "ivory");

// ── Quick picks for the editor ──────────────────────────────────────────────

export const QUICK_FUNCTIONS: { name: string; icon: string; dress: string; color: string }[] = [
  { name: "Betrothal", icon: "💍", dress: "Festive formal", color: "#e9c9c6" },
  { name: "Bridal Shower", icon: "🌸", dress: "Florals, pastels", color: "#f0c8cf" },
  { name: "Rehearsal Dinner", icon: "🍽️", dress: "Smart casual", color: "#c9d6c3" },
  { name: "Holy Matrimony", icon: "⛪", dress: "Formal, soft pastels", color: "#f3ebdd" },
  { name: "Nuptial Mass", icon: "✝️", dress: "Formal, soft pastels", color: "#f3ebdd" },
  { name: "Reception", icon: "🥂", dress: "Black tie optional", color: "#2b2b33" },
  { name: "Thanksgiving Brunch", icon: "☕", dress: "Smart casual", color: "#d9c2a0" },
];
export const SERVICE_PRESETS = ["Processional", "Opening hymn", "Liturgy of the Word", "Exchange of vows", "Blessing of the rings", "Nuptial blessing", "Signing of the register", "Recessional"];
export const SWATCHES = ["#f3ebdd", "#e9c9c6", "#b97a80", "#c9d6c3", "#7f9a7c", "#a8c0d6", "#c2a165", "#2b2b33"];

// ── Demo: a Kerala church wedding ───────────────────────────────────────────

const D = "/wedding-v3/demo/";
const photo = (url: string, w: number, h: number, caption = "", extra: Partial<LovePhoto> = {}): LovePhoto => ({ url, w, h, caption, ...extra });

export const DEMO: CwData = {
  brideName: "Anna",
  groomName: "Joel",
  weddingDay: "2027-01-16",
  weddingTime: "15:30",
  churchName: "St. Mary's Cathedral Basilica",
  venue: "Broadway, Ernakulam, Kochi",
  blessing: "What God has joined together, let no one separate.",
  invitation:
    "Together with their families, Anna and Joel request the honour of your presence as they are united in Holy Matrimony at St. Mary's Cathedral Basilica, Kochi.\n\nThe celebration continues with dinner and dancing by the backwaters. Your presence, your prayers and your blessings would mean the world to us.",
  scripture: { ...VERSES[0] },
  secondLang: "ml",
  altInvitation: ALT_SAMPLES.ml,
  altVerse: "",
  bride: { name: "Anna", description: "A choir soprano with a laugh you can hear across the nave, and a heart for everyone in it.", photo: "", tags: [] },
  groom: { name: "Joel", description: "An architect who sketches churches on napkins and still blushes when she sings.", photo: "", tags: [] },
  brideFamily: { parents: "Mr. Thomas & Mrs. Mary Kurian", grandparents: "" },
  groomFamily: { parents: "Mr. George & Mrs. Annie Mathew", grandparents: "" },
  blessingsOf: "Late Mr. Joseph Kurian & Mrs. Rosamma Kurian",
  couplePhoto: `${D}rw-16.webp`,
  couplePhotoCrop: { x: 50, y: 38, scale: 100 },
  events: [
    { id: "betrothal", name: "Betrothal", isoDate: "2027-01-09", time: "11:00", venue: "St. Mary's Cathedral Basilica, Kochi", address: "Broadway, Ernakulam, Kochi, Kerala", mapUrl: "", dressCode: "Festive formal", dressColor: "#e9c9c6", details: "The exchange of rings before the parish, followed by lunch with both families.", icon: "💍", disabled: false },
    { id: "matrimony", name: "Holy Matrimony", isoDate: "2027-01-16", time: "15:30", venue: "St. Mary's Cathedral Basilica, Kochi", address: "Broadway, Ernakulam, Kochi, Kerala", mapUrl: "", dressCode: "Formal, soft pastels", dressColor: "#f3ebdd", details: "Please be seated by 3:15 pm. Photographs on the church steps follow the service.", icon: "⛪", disabled: false },
    { id: "reception", name: "Reception", isoDate: "2027-01-16", time: "19:00", venue: "Grand Hyatt, Bolgatty Island", address: "Mulavukad, Kochi, Kerala", mapUrl: "", dressCode: "Black tie optional", dressColor: "#2b2b33", details: "Dinner, the first dance and the cake, on the lawns by the backwaters.", icon: "🥂", disabled: false },
    { id: "brunch", name: "Thanksgiving Brunch", isoDate: "2027-01-17", time: "10:30", venue: "Kurian family home, Kadavanthra", address: "Kadavanthra, Kochi, Kerala", mapUrl: "", dressCode: "Smart casual", dressColor: "#d9c2a0", details: "A thank-you brunch for family and friends travelling in.", icon: "☕", disabled: false },
  ],
  orderOfService: [
    { time: "15:30", title: "Processional", note: "Canon in D, the parish choir" },
    { time: "15:40", title: "Liturgy of the Word", note: "1 Corinthians 13, read by Anna's sister" },
    { time: "16:00", title: "Exchange of vows", note: "" },
    { time: "16:10", title: "Blessing of the rings", note: "" },
    { time: "16:25", title: "Nuptial blessing", note: "" },
    { time: "16:45", title: "Recessional", note: "Rose petals on the steps" },
  ],
  story: [
    { when: "2019", title: "A hymn at choir practice", line: "They met in the parish choir, when Joel sang a whole verse a beat too early and Anna could not stop laughing.", photo: `${D}rw-02.webp`, cropX: 50, cropY: 50, scale: 100 },
    { when: "2025", title: "A ring by the backwaters", line: "Six Christmases later he asked her on a houseboat in Alleppey, with both families hiding on the deck above.", photo: `${D}rw-12.webp`, cropX: 50, cropY: 50, scale: 100 },
  ],
  gallery: [
    photo(`${D}rw-16.webp`, 683, 1024, "Among the pampas", { span: "tall" }),
    photo(`${D}rw-12.webp`, 1024, 683, "Two rings"),
    photo(`${D}rw-18.webp`, 1024, 683, "Under the arch"),
    photo(`${D}rw-08.webp`, 684, 1024, "White lilies for the pews"),
    photo(`${D}rw-07.webp`, 1024, 683, "Our first dance lesson", { span: "wide" }),
    photo(`${D}rw-17.webp`, 1400, 1050, "The rings"),
    photo(`${D}rw-02.webp`, 1024, 683, "A walk in the garden"),
    photo(`${D}gw-flowers.webp`, 800, 1202, "For the altar"),
  ],
  videoUrl: "",
  contacts: [{ name: "Thomas Kurian", relation: "Anna's brother", phone: "+91 98470 12345" }],
  liveUrl: "",
  upiId: "",
  upiName: "",
  things: [
    { head: "Parking", text: "The basilica car park opens at 2 pm; ushers will guide you." },
    { head: "Children", text: "Little ones are very welcome; there is a quiet room by the sacristy." },
  ],
  gettingThere: "Cochin International Airport is 40 minutes away. Rooms are held at the Grand Hyatt for out-of-town guests — mention Anna & Joel.",
  theme: "ivory",
  music: { mode: "youtube", youtubeId: "Ptk_1Dc2iPY", start: 0 },
  rsvpOn: true,
  rsvpBy: "2026-12-31",
  rsvpMeal: false,
  maxGuests: 4,
  hashtag: "#AnnaWedsJoel",
  closingLine: "With love and prayers, the Kurian & Mathew families",
  wishes: [
    { name: "Fr. Sebastian", message: "May the Lord bless your home with peace, your table with joy, and your hearts with each other." },
    { name: "Aunty Lissy", message: "Anna mol, I have been waiting for this day since your first communion! God bless you both." },
    { name: "Rahul & Meera", message: "Save us a seat near the cake. So happy for you two!" },
  ],
  sharePhoto: "",
};

// ── Small helpers ───────────────────────────────────────────────────────────

const str = (v: unknown, fb = ""): string => (typeof v === "string" ? v : fb);
const num = (v: unknown, fb: number): number => (typeof v === "number" && Number.isFinite(v) ? v : fb);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const rec = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

export const newEventId = (taken: Iterable<string> = []) => {
  const used = new Set(taken);
  for (;;) {
    const id = `e${Math.random().toString(36).slice(2, 8)}`;
    if (!used.has(id)) return id;
  }
};

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "6 PM", "6:30pm", "18:30", "19.30" → "18:30"; anything else → "". */
export function toHHMM(v: string): string {
  const t = (v || "").trim();
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  const m = t.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
  if (!m) return "";
  let h = Number(m[1]);
  const mi = Number(m[2] ?? 0);
  const ap = (m[3] ?? "").toLowerCase().replace(/\./g, "");
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return h < 24 && mi < 60 ? `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}` : "";
}
/** "18:30" → "6:30 PM" (what older readers of the stored `time` expect). */
export function displayTime(hhmm: string): string {
  const m = (hhmm || "").match(/^(\d{2}):(\d{2})$/);
  if (!m) return hhmm || "";
  const h = Number(m[1]);
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m[2] === "00" ? `${h12} ${ap}` : `${h12}:${m[2]} ${ap}`;
}
/** "2027-01-16" → "16 Jan" (the stored display date older readers sort on). */
export function displayDate(iso: string): string {
  const m = (iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${Number(m[3])} ${MONTH_NAMES[Number(m[2]) - 1]}` : "";
}
/** Old free text "21 Jul" → ISO in the given year; "" when it can't be read. */
export function isoFromLoose(date: string, year: number): string {
  const p = (date || "").trim().split(/\s+/);
  if (p.length < 2) return "";
  const d = Number(p[0]);
  const mi = MONTHS.indexOf(p[1].slice(0, 3).toLowerCase());
  if (!Number.isFinite(d) || d < 1 || d > 31 || mi < 0) return "";
  return `${year}-${String(mi + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Split the stored ISO "2026-07-22T19:00:00+00:00" into the form's day + time (wall clock as written). */
export function splitWeddingDate(iso: string): { day: string; time: string } {
  const m = (iso || "").match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return { day: "", time: "" };
  return { day: m[1], time: m[2] ? `${m[2]}:${m[3]}` : "" };
}
export const joinWeddingDate = (day: string, time: string): string => (day ? `${day}T${/^\d{2}:\d{2}$/.test(time) ? time : "16:00"}:00+05:30` : "");

/** Phone → tel: / wa.me forms (Indian numbers normalised to +91). */
export function phoneOf(raw: string): { tel: string; wa: string } | null {
  const t = (raw || "").trim();
  const digits = t.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (t.startsWith("+") && !t.startsWith("+91")) return digits.length >= 8 && digits.length <= 15 ? { tel: `+${digits}`, wa: digits } : null;
  let d = digits;
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? { tel: `+91${d}`, wa: `91${d}` } : null;
}
export const isUpiId = (v: string) => /^[a-z0-9._-]{2,40}@[a-z][a-z0-9.-]{1,30}$/i.test((v || "").trim());
export const isHttps = (v: string) => /^https:\/\/[^\s]+$/i.test((v || "").trim());
export const isMapUrl = (v: string) => /^https:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test((v || "").trim());
export function youTubeIdOf(v: string): string {
  const s = (v || "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : "";
}

const COLOUR_WORDS: [RegExp, string][] = [
  [/pastel|ivory|cream|white|beige|champagne/i, "#f3ebdd"],
  [/blush|pink|rose|peach/i, "#e9c9c6"],
  [/sage|green|mint|olive/i, "#c9d6c3"],
  [/blue|navy|teal/i, "#a8c0d6"],
  [/gold|yellow|mustard/i, "#e6cf94"],
  [/black|tie|tux|formal/i, "#2b2b33"],
  [/red|maroon|wine|burgundy/i, "#8e2d3b"],
  [/lavender|lilac|purple/i, "#c9b8d8"],
];
export function swatchFor(e: { dressCode?: string; dressColor?: string }): string {
  if (e.dressColor && /^#[0-9a-f]{6}$/i.test(e.dressColor)) return e.dressColor;
  for (const [re, c] of COLOUR_WORDS) if (re.test(e.dressCode ?? "")) return c;
  return "";
}

export const MAIN_RE = /matrimony|nuptial|wedding|ceremony|marriage|vows|mass|church|kalyanam|vivah/i;

// ── Stored doc → form ───────────────────────────────────────────────────────

export function fromDb(d: Record<string, unknown>): CwData {
  const when = splitWeddingDate(str(d.weddingDate));
  const year = Number(when.day.slice(0, 4)) || new Date().getFullYear();
  const events: CwEvent[] = arr(d.events)
    .map(rec)
    .map((e) => ({
      id: str(e.id),
      name: str(e.name),
      isoDate: /^\d{4}-\d{2}-\d{2}$/.test(str(e.isoDate)) ? str(e.isoDate) : isoFromLoose(str(e.date), year),
      time: toHHMM(str(e.time)),
      venue: str(e.venue),
      address: str(e.address),
      mapUrl: str(e.mapUrl),
      dressCode: str(e.dressCode),
      dressColor: str(e.dressColor),
      details: str(e.details),
      icon: str(e.icon, "⛪"),
      // Old pages filled empty slots with "Reserved"/"Placeholder" rows: never show those.
      disabled: Boolean(e.disabled) || /^(reserved|placeholder)$/i.test(str(e.name)),
      hindi: str(e.hindi),
      accent: str(e.accent),
    }));
  const music = rec(d.music);
  const mode = str(music.mode);
  const scripture = rec(d.scripture);
  const gallery: LovePhoto[] = arr(d.galleryImages)
    .map(rec)
    .filter((g) => str(g.src))
    .map((g) => {
      const p: LovePhoto = { url: str(g.src), caption: str(g.alt) };
      if (typeof g.cropX === "number") p.cropX = g.cropX;
      if (typeof g.cropY === "number") p.cropY = g.cropY;
      if (typeof g.scale === "number" && g.scale > 100) p.scale = g.scale;
      const size = str(g.size);
      if (size === "wide" || size === "tall" || size === "large") p.span = size as PhotoSpan;
      if (typeof g.w === "number" && g.w > 0) p.w = g.w;
      if (typeof g.h === "number" && g.h > 0) p.h = g.h;
      return p;
    });
  const crop = rec(d.couplePhotoCrop);
  const person = (name: string, photo: unknown, description: unknown, tags: unknown): CwPerson => ({
    name,
    photo: str(photo),
    description: str(description),
    tags: arr(tags).map(rec).map((t) => ({ emoji: str(t.emoji), label: str(t.label) })).filter((t) => t.label),
  });
  return {
    brideName: str(d.brideName),
    groomName: str(d.groomName),
    weddingDay: when.day,
    weddingTime: when.time,
    churchName: str(d.churchName),
    venue: str(d.venue),
    blessing: str(d.blessing),
    invitation: str(d.invitation),
    scripture: { text: str(scripture.text), ref: str(scripture.ref) },
    secondLang: (["hi", "ml", "ta"].includes(str(d.secondLang)) ? str(d.secondLang) : "none") as SecondLang,
    altInvitation: str(d.altInvitation),
    altVerse: str(d.altVerse),
    bride: person(str(d.brideName), d.bridePhoto, d.brideDescription, d.brideTags),
    groom: person(str(d.groomName), d.groomPhoto, d.groomDescription, d.groomTags),
    brideFamily: { parents: str(d.brideFamilyParents), grandparents: str(d.brideFamilyGrandparents) },
    groomFamily: { parents: str(d.groomFamilyParents), grandparents: str(d.groomFamilyGrandparents) },
    blessingsOf: str(d.blessingsOf),
    couplePhoto: str(d.couplePhoto),
    couplePhotoCrop: { x: num(crop.x, 50), y: num(crop.y, 50), scale: num(crop.scale, 100) },
    events,
    orderOfService: arr(d.orderOfService).map(rec).map((r) => ({ time: toHHMM(str(r.time)) || str(r.time), title: str(r.title), note: str(r.note) })).filter((r) => r.title),
    story: arr(d.story)
      .map(rec)
      .map((r) => ({ when: str(r.when), title: str(r.title), line: str(r.line), photo: str(r.photo), cropX: num(r.cropX, 50), cropY: num(r.cropY, 50), scale: num(r.scale, 100) }))
      .filter((r) => r.title || r.line || r.photo),
    gallery,
    videoUrl: str(d.videoUrl),
    contacts: arr(d.contacts).map(rec).map((c) => ({ name: str(c.name), relation: str(c.relation), phone: str(c.phone) })).filter((c) => c.name),
    liveUrl: str(d.liveUrl),
    upiId: str(d.upiId),
    upiName: str(d.upiName),
    things: arr(d.things).map(rec).map((t) => ({ head: str(t.head), text: str(t.text) })).filter((t) => t.text),
    gettingThere: str(d.gettingThere),
    theme: themeOf(d.theme),
    // No song on an older page = the hymn it always played.
    music: mode === "off" || mode === "melody" || mode === "youtube" || mode === "track" ? { mode: mode as MusicMode, youtubeId: str(music.youtubeId), start: num(music.start, 0) } : { mode: "track", youtubeId: "", start: 0 },
    rsvpOn: typeof d.rsvpOn === "boolean" ? d.rsvpOn : true,
    rsvpBy: str(d.rsvpBy),
    rsvpMeal: Boolean(d.rsvpMeal),
    maxGuests: num(d.maxGuests, 4),
    hashtag: str(d.hashtag),
    closingLine: str(d.closingLine),
    // Stored oldest first; the wall shows the newest first.
    wishes: arr(d.blessings)
      .map(rec)
      .map((b) => ({ name: str(b.name, "Guest"), message: str(b.message), ...(str(b.voiceUrl) ? { voiceUrl: str(b.voiceUrl) } : {}) }))
      .reverse(),
    sharePhoto: str(d.sharePhoto),
  };
}

// ── Form → request body (every old field still written) ─────────────────────

export function toBody(m: CwData, password?: string, templateVariant: "tabs" | "scroll" = "tabs") {
  const taken = new Set<string>();
  const events = m.events.map((e) => {
    let id = e.id;
    if (!id || taken.has(id)) id = newEventId(taken);
    taken.add(id);
    return {
      id,
      name: e.name,
      hindi: e.hindi ?? "",
      icon: e.icon || "⛪",
      date: displayDate(e.isoDate),
      time: displayTime(e.time),
      venue: e.venue,
      details: e.details,
      accent: e.accent || "from-amber-500/20 to-amber-500/5 border-amber-500/30",
      disabled: e.disabled,
      isoDate: e.isoDate,
      address: e.address,
      mapUrl: e.mapUrl,
      dressCode: e.dressCode,
      dressColor: e.dressColor,
    };
  });
  return {
    brideName: m.brideName.trim(),
    groomName: m.groomName.trim(),
    weddingDate: joinWeddingDate(m.weddingDay, m.weddingTime),
    venue: m.venue,
    blessing: m.blessing,
    bridePhoto: m.bride.photo,
    brideDescription: m.bride.description,
    brideTags: m.bride.tags,
    brideFamilyParents: m.brideFamily.parents,
    brideFamilyGrandparents: m.brideFamily.grandparents,
    groomPhoto: m.groom.photo,
    groomDescription: m.groom.description,
    groomTags: m.groom.tags,
    groomFamilyParents: m.groomFamily.parents,
    groomFamilyGrandparents: m.groomFamily.grandparents,
    events,
    galleryImages: m.gallery.map((p) => ({ src: p.url, alt: p.caption ?? "", cropX: p.cropX ?? 50, cropY: p.cropY ?? 50, scale: p.scale ?? 100, size: p.span ?? "normal", w: p.w ?? 0, h: p.h ?? 0 })),
    sharePhoto: m.sharePhoto || "",
    password: password || "",
    templateVariant,
    // The rebuild's extras
    theme: m.theme,
    churchName: m.churchName,
    invitation: m.invitation,
    scripture: m.scripture,
    secondLang: m.secondLang,
    altInvitation: m.altInvitation,
    altVerse: m.altVerse,
    blessingsOf: m.blessingsOf,
    couplePhoto: m.couplePhoto,
    couplePhotoCrop: m.couplePhotoCrop,
    story: m.story,
    orderOfService: m.orderOfService,
    videoUrl: m.videoUrl,
    contacts: m.contacts,
    liveUrl: m.liveUrl,
    upiId: m.upiId,
    upiName: m.upiName,
    things: m.things,
    gettingThere: m.gettingThere,
    music: m.music,
    rsvpOn: m.rsvpOn,
    rsvpBy: m.rsvpBy,
    rsvpMeal: m.rsvpMeal,
    maxGuests: m.maxGuests,
    hashtag: m.hashtag,
    closingLine: m.closingLine,
  };
}

/** Old drafts (sessionStorage) were the ShaadiData shape: read them through the same converter. */
export function fromDraft(raw: unknown): CwData | null {
  const r = rec(raw);
  if (!Object.keys(r).length) return null;
  if (typeof r.weddingDay === "string" && Array.isArray(r.events)) return { ...DEMO, ...(r as unknown as CwData) };
  const b = rec(r.bride);
  const g = rec(r.groom);
  const bf = rec(r.brideFamily);
  const gf = rec(r.groomFamily);
  return fromDb({
    ...r,
    bridePhoto: b.photo,
    brideDescription: b.description,
    groomPhoto: g.photo,
    groomDescription: g.description,
    brideFamilyParents: bf.parents,
    groomFamilyParents: gf.parents,
    galleryImages: r.galleryImages,
  });
}

// ── What the guest page renders ─────────────────────────────────────────────

export interface CwView {
  couple: string;
  first: string;
  second: string;
  main: WeddingEvent | null;
  events: WeddingEvent[];
  verse: { text: string; ref: string } | null;
  invitation: string;
  hero: { url: string; x: number; y: number; scale: number } | null;
}

export function viewOf(m: CwData): CwView {
  const first = m.brideName.trim() || "Bride";
  const second = m.groomName.trim() || "Groom";
  const events: WeddingEvent[] = m.events
    .filter((e) => !e.disabled && e.name.trim())
    .map((e) => ({ id: e.id || e.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30), title: e.name, date: e.isoDate, time: e.time, venue: e.venue, address: e.address, mapUrl: e.mapUrl, dressCode: e.dressCode, dressColor: swatchFor(e), note: e.details }));
  const main =
    events.find((e) => MAIN_RE.test(e.title)) ??
    (m.weddingDay ? { id: "ceremony", title: "Holy Matrimony", date: m.weddingDay, time: m.weddingTime, venue: m.churchName || m.venue, address: m.churchName ? m.venue : "" } : events[0] ?? null);
  // The ceremony's own date/time/church always win (they are the hero's).
  const mainFixed = main && m.weddingDay && MAIN_RE.test(main.title) ? { ...main, date: main.date || m.weddingDay, time: main.time || m.weddingTime } : main;
  const verse = m.scripture.text.trim() ? { text: m.scripture.text.trim(), ref: m.scripture.ref.trim() } : null;
  const invitation =
    m.invitation.trim() ||
    `Together with their families, ${first} and ${second} request the honour of your presence as they are united in Holy Matrimony${m.churchName ? ` at ${m.churchName}` : ""}.\n\nYour presence and your prayers would mean the world to us.`;
  const heroUrl = m.couplePhoto || m.gallery[0]?.url || m.bride.photo || m.groom.photo || "";
  const hero = heroUrl
    ? m.couplePhoto
      ? { url: heroUrl, ...m.couplePhotoCrop }
      : { url: heroUrl, x: m.gallery[0]?.cropX ?? 50, y: m.gallery[0]?.cropY ?? 40, scale: m.gallery[0]?.scale ?? 100 }
    : null;
  return { couple: `${first} & ${second}`, first, second, main: mainFixed, events, verse, invitation, hero };
}
