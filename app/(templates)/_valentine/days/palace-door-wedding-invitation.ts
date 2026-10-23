// ─── Palace Door Wedding Invitation 🚪 (wedding tier, same limits as Royal) ───
//
// A carved Rajasthani haveli door, closed, with the couple's monogram in a gold
// round frame. One tap: the two leaves swing inward on their hinges in 3D, warm
// light spills through, jhumkas sway, petals fall, the music starts, and the
// guest steps into an ivory palace courtyard where the invitation unfolds. Each
// function shows its own illustrated couple (haldi, mehendi, sangeet, wedding,
// reception, engagement).
//
// Field mapping on the engine: recipientName = the bride, senderName = the
// groom, letter = the English invitation, endLine = the closing line,
// photos = ONE pool of up to 40 (the couple's portrait, story chapters and
// family cards point into it by 1-based index; the rest is the gallery).
//
// Art lives in the repo (public/wedding-v3, see components/assets.ts) and is
// served from the site's own origin, never the CDN.
//
// Server twin: server/src/config/weddingDays/palace-door-wedding-invitation.ts;
// keys and limits must match (valentineDays.test.ts PINNED_KEYS pins them).
// Light themes only.

import type { DayConfig, LovePhoto } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { meta } from "./_shared";
import { LIGHT_THEMES } from "../../_wedding/themes";
import { WEDDING_TIER_LIMITS, type WeddingEvent } from "../../_wedding/types";

const SLUG = "palace-door-wedding-invitation" as const;
export const PD_LIMITS = WEDDING_TIER_LIMITS[SLUG];
/** Family members guests can call (tap to call / WhatsApp). */
export const PD_MAX_CONTACTS = 4;

export const PD_THEME_LABELS: Record<string, string> = {
  blush: "Rose Haveli",
  champagne: "Sandstone & Gold",
  powder: "Lake Palace Blue",
};

/**
 * Verified YouTube uploads (oEmbed 200, 2026-10-22; wq-research.md §5).
 * The palace door opens to "Saajanji Ghar Aaye" by default: the groom's family
 * arriving at the haveli door.
 */
export const PD_SONGS: readonly SongSuggestion[] = [
  { id: "8XtXLVylOoU", title: "Saajanji Ghar Aaye", artist: "Kuch Kuch Hota Hai" },
  { id: "OzEL4CwbPew", title: "Wedding Shehnai (Kanyadaan)", artist: "Ustad Bismillah Khan" },
  { id: "1LVpuWpRs3I", title: "Din Shagna Da", artist: "Jasleen Royal" },
  { id: "3qpxJEp4Ec4", title: "Kudmayi", artist: "Rocky Aur Rani" },
  { id: "-bNwqXvMuB8", title: "Mehndi Laga Ke Rakhna", artist: "DDLJ" },
  { id: "jCEdTq3j-0U", title: "Gallan Goodiyaan", artist: "Dil Dhadakne Do" },
  { id: "V7LwfY5U5WI", title: "Ranjha", artist: "Shershaah" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Brahmastra" },
  { id: "lwLVJ0E8gN4", title: "Kabira (Encore)", artist: "Yeh Jawaani Hai Deewani" },
  { id: "Ptk_1Dc2iPY", title: "Canon in D", artist: "Brooklyn Duo" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];

/** The editor chrome (form sheet, top bar): ivory paper, sandstone, warm gold, a sienna accent. The guest page wears extras.theme. */
const THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FFFCF5 0%, #FAF1E1 55%, #F3E3C5 100%)",
  base: "#FBF5E9",
  paper: "#FFFDF8",
  glass: "rgba(255,253,248,.84)",
  ink: "#3A2414",
  inkSoft: "#7A5A40",
  paperInk: "#3A2414",
  accent: "#9A4A1F",
  accentDeep: "#6E3213",
  accentInk: "#FFF8EC",
  soft: "#F7EBD6",
  edge: "#E8D3AE",
  gold: "#C9A24A",
  dark: false,
  particles: ["✨", "🌼", "🪔"],
  confetti: ["#C9A24A", "#E9CF7A", "#E8892B", "#E86A92", "#FFF3C4"],
};

/** Five functions to start from; the sender can add up to eight (Roka, Baraat, Cocktail…). */
export const PD_DEMO_EVENTS: WeddingEvent[] = [
  { id: "haldi", title: "Haldi", date: "2027-02-10", time: "10:00", endTime: "13:00", venue: "The Haveli Courtyard", address: "Samode Haveli, Gangapole, Jaipur", mapUrl: "", dressCode: "Shades of yellow", dressColor: "#F2C94C", note: "Turmeric, marigolds and a lot of laughter. Wear yellow and don't mind a little mess." },
  { id: "mehendi", title: "Mehendi", date: "2027-02-10", time: "16:30", endTime: "20:00", venue: "The Zenana Garden", address: "Samode Haveli, Gangapole, Jaipur", mapUrl: "", dressCode: "Greens and bright florals", dressColor: "#4F9B6A", note: "Henna artists, folk singers and endless chai. Come and get your hands painted." },
  { id: "sangeet", title: "Sangeet", date: "2027-02-11", time: "19:30", endTime: "23:30", venue: "Durbar Hall, Samode Palace", address: "Samode, Rajasthan", mapUrl: "", dressCode: "Indo-western glam", dressColor: "#7B3FA0", note: "Both families on one dance floor. Practise your steps, there will be a competition." },
  { id: "wedding", title: "Wedding (Pheras)", date: "2027-02-12", time: "19:00", endTime: "23:30", venue: "The Palace Courtyard, Samode Palace", address: "Samode, Rajasthan", mapUrl: "", dressCode: "Traditional festive", dressColor: "#A3122B", note: "The baraat reaches the palace door at 7 pm; the pheras begin at the shubh muhurat, 9:15 pm." },
  { id: "reception", title: "Reception", date: "2027-02-13", time: "20:00", endTime: "23:59", venue: "Rambagh Palace Lawns", address: "Bhawani Singh Road, Jaipur", mapUrl: "", dressCode: "Black tie", dressColor: "#1C1C24", note: "Dinner under the stars, toasts and dancing to welcome the newlyweds home." },
];

/**
 * Demo photos (CC0 / public domain, media-src/templates/wedding/ATTRIBUTION.md, rw-*) ship IN THE
 * REPO under public/wedding-v3/demo, never on the CDN or S3. The engine and the server keep only
 * https photo links, so a draft stores them on the site's own domain; every render maps that back
 * to the same-origin path (pdLocalUrl), so local, staging and prod each serve their own copy.
 */
const SITE_ORIGIN = "https://subhsandesh.in";
const DEMO_BASE = `${SITE_ORIGIN}/wedding-v3/demo`;
const REPO_ART_RE = /^https:\/\/(?:www\.)?subhsandesh\.in(\/wedding-v3\/[^?#\s]+)$/i;
/** A stored repo-art link → the same-origin path this host serves from public/. Anything else is unchanged. */
export const pdLocalUrl = (url: string): string => REPO_ART_RE.exec(url)?.[1] ?? url;
/** The inverse, for anything the studio hands back: a same-origin repo path → the https link the engine keeps. */
export const pdStoredUrl = (url: string): string => (url.startsWith("/wedding-v3/") ? `${SITE_ORIGIN}${url}` : url);

/**
 * 1–15 fill the gallery; 16 and 17 are story chapters 3 and 4 (so they stay out
 * of it). The demo has no portrait (couplePhoto 0): the courtyard shows the
 * illustrated couple in wedding red under the gold frame until one is picked.
 * The gallery's order and spans are tuned so the masonry ends level (no ragged
 * columns, no holes) at 2 columns (phones) and 3 (tablet / desktop); re-check
 * with the layout simulation before reordering. rw-10 (a night sky, ~all black
 * at tile size) is left out on purpose.
 */
export const PD_DEMO_PHOTOS: LovePhoto[] = [
  { url: `${DEMO_BASE}/rw-01.webp`, w: 1024, h: 768, cropX: 50, cropY: 50, caption: "The bride", span: "wide" },
  { url: `${DEMO_BASE}/rw-12.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-16.webp`, w: 683, h: 1024, cropX: 50, cropY: 35, caption: "Just us" },
  { url: `${DEMO_BASE}/rw-14.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-03.webp`, w: 1024, h: 768, cropX: 50, cropY: 50, caption: "Haldi morning", span: "wide" },
  { url: `${DEMO_BASE}/rw-02.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-08.webp`, w: 684, h: 1024, cropX: 50, cropY: 35, span: "tall" },
  { url: `${DEMO_BASE}/rw-05.webp`, w: 680, h: 1024, cropX: 50, cropY: 35 },
  { url: `${DEMO_BASE}/rw-09.webp`, w: 931, h: 1024, cropX: 50, cropY: 35 },
  { url: `${DEMO_BASE}/rw-07.webp`, w: 1024, h: 683, cropX: 50, cropY: 50, caption: "First dance" },
  { url: `${DEMO_BASE}/rw-04.webp`, w: 1400, h: 1047, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-15.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-13.webp`, w: 1024, h: 683, cropX: 50, cropY: 50, caption: "Shringar" },
  { url: `${DEMO_BASE}/rw-11.webp`, w: 1024, h: 487, cropX: 50, cropY: 50, caption: "Mehendi", span: "wide" },
  { url: `${DEMO_BASE}/rw-06.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-17.webp`, w: 1400, h: 1050, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-18.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
];

export interface PdContact {
  name: string;
  relation: string;
  phone: string;
}

export interface PdExtras {
  theme: string;
  lang: "en" | "hi";
  nameOrder: "bride" | "groom";
  hindiMessage: string;
  brideFamily: string;
  groomFamily: string;
  brideNote: string;
  groomNote: string;
  blessingsOf: string;
  bridePhoto: number;
  groomPhoto: number;
  couplePhoto: number;
  muhurat: string;
  hashtag: string;
  events: WeddingEvent[];
  story: { when: string; title: string; line: string; photo: number }[];
  things: string[];
  gettingThere: string;
  contacts: PdContact[];
  upiId: string;
  upiName: string;
  liveUrl: string;
  videoUrl: string;
  rsvpBy: string;
  maxGuests: number;
  rsvpMeal: boolean;
  blessings: boolean;
  invocation: boolean;
  [k: string]: unknown;
}

const ev = (k: string, label: string, max: number, placeholder?: string) => ({ key: k, kind: "text" as const, label, max, placeholder });

const evDone = (mf: { extras: Record<string, unknown> }) => Array.isArray(mf.extras.events) && (mf.extras.events as { title?: string; date?: string }[]).some((e) => !!e.title && !!e.date);

export const palaceDoorWeddingDay: DayConfig<PdExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Palace Door Wedding Invitation",
  maxPhotos: PD_LIMITS.photos,
  letterMax: 1500,
  letterMin: 20,
  asksQuestion: false,
  melody: "diya",
  photoAspect: 0.8,
  gifSlots: [],
  topBar: true,
  brandMark: "stacked",
  studio: "palaceDoorWedding",
  // The studio draws every section itself, password included (keeps no plain section).
  // Edit stays after publishing: the owner's guest replies + blessings live in the form.
  studioForm: {
    ownAi: true,
    editAfterPublish: true,
    nav: [
      { id: "names", label: "The couple", emoji: "🚪" },
      { id: "details", label: "Functions", emoji: "🪔", done: evDone },
      { id: "photos", label: "Photos", emoji: "📸" },
      { id: "letter", label: "Invitation", emoji: "✉️" },
      { id: "story", label: "Our story", emoji: "💞", done: () => null },
      { id: "guests", label: "Guest info", emoji: "🧭", done: () => null },
      { id: "music", label: "Look & music", emoji: "🎵" },
      { id: "finish", label: "RSVP & send", emoji: "✦" },
    ],
  },
  music: {
    audioOnly: true,
    compact: true,
    suggestions: PD_SONGS,
    suggestionsNote: "Filmi wedding songs, shehnai and a few English ones · or paste any YouTube link",
  },
  extras: [
    { key: "theme", kind: "enum", label: "Theme", default: "champagne", hidden: true, options: LIGHT_THEMES.map((id) => ({ value: id, label: PD_THEME_LABELS[id] ?? id })) },
    { key: "lang", kind: "enum", label: "Opens in", default: "en", hidden: true, options: [{ value: "en", label: "English" }, { value: "hi", label: "हिन्दी" }] },
    { key: "nameOrder", kind: "enum", label: "Show names as", default: "bride", hidden: true, options: [{ value: "bride", label: "Bride first" }, { value: "groom", label: "Groom first" }] },
    { key: "hindiMessage", kind: "longtext", max: 700, label: "Invitation in Hindi", hidden: true },
    { key: "brideFamily", kind: "text", max: 120, label: "Bride's family", hidden: true },
    { key: "groomFamily", kind: "text", max: 120, label: "Groom's family", hidden: true },
    { key: "brideNote", kind: "text", max: 100, label: "Bride's family note", hidden: true },
    { key: "groomNote", kind: "text", max: 100, label: "Groom's family note", hidden: true },
    { key: "blessingsOf", kind: "text", max: 160, label: "With the blessings of", hidden: true },
    { key: "bridePhoto", kind: "number", min: 0, max: PD_LIMITS.photos, default: 0, label: "Bride's family photo", hidden: true },
    { key: "groomPhoto", kind: "number", min: 0, max: PD_LIMITS.photos, default: 0, label: "Groom's family photo", hidden: true },
    { key: "couplePhoto", kind: "number", min: 0, max: PD_LIMITS.photos, default: 0, label: "The couple's portrait", hidden: true },
    { key: "muhurat", kind: "text", max: 60, label: "Muhurat", hidden: true },
    { key: "hashtag", kind: "text", max: 40, label: "Wedding hashtag", hidden: true },
    {
      key: "events", kind: "objlist", maxItems: PD_LIMITS.events, minItems: 1, label: "Functions", itemTitle: "Function", hidden: true,
      item: [
        ev("id", "Id", 24), ev("title", "Name", 40), ev("date", "Date", 10), ev("time", "Start", 5), ev("endTime", "End", 5),
        ev("venue", "Venue", 80), ev("address", "Address", 140), ev("mapUrl", "Google Maps link", 400),
        ev("dressCode", "Dress code", 60), ev("dressColor", "Dress colour", 7), ev("note", "Note", 200),
      ],
    },
    {
      key: "story", kind: "objlist", maxItems: PD_LIMITS.story, label: "Our story", itemTitle: "Chapter", hidden: true,
      item: [ev("when", "When", 24), ev("title", "Title", 60), ev("line", "What happened", 240), { key: "photo", kind: "number", label: "Photo", min: 0, max: PD_LIMITS.photos, default: 0 }],
    },
    { key: "things", kind: "list", maxItems: PD_LIMITS.faq, itemMax: 180, label: "Good to know", hidden: true },
    { key: "gettingThere", kind: "longtext", max: 500, label: "Getting there", hidden: true },
    {
      key: "contacts", kind: "objlist", maxItems: PD_MAX_CONTACTS, label: "Who to call", itemTitle: "Contact", hidden: true,
      item: [ev("name", "Name", 40), ev("relation", "Relation", 40), ev("phone", "Phone", 16)],
    },
    { key: "upiId", kind: "text", max: 60, label: "UPI ID for shagun", hidden: true },
    { key: "upiName", kind: "text", max: 60, label: "Name on the UPI account", hidden: true },
    { key: "liveUrl", kind: "text", max: 300, label: "Livestream link", hidden: true },
    { key: "videoUrl", kind: "text", max: 200, label: "Pre-wedding film", hidden: true },
    { key: "rsvpBy", kind: "text", max: 10, label: "Reply by", input: "date", hidden: true },
    { key: "maxGuests", kind: "number", min: 1, max: 10, default: 4, label: "Guests per reply", hidden: true },
    { key: "rsvpMeal", kind: "bool", default: true, label: "Ask for meal preference", hidden: true },
    { key: "blessings", kind: "bool", default: true, label: "Blessings wall", hidden: true },
    { key: "invocation", kind: "bool", default: true, label: "Shri Ganesh on the door", hidden: true },
  ],
  theme: THEME,
  demo: {
    recipientName: "Ishita",
    senderName: "Kabir",
    petName: "",
    letter:
      "With the blessings of the Almighty and our elders, the Rathore and Shekhawat families joyfully invite you to the wedding of their children, Ishita and Kabir.\n\nFour days in the old havelis of Jaipur: haldi in the courtyard, mehendi in the garden, a sangeet that will go on too late, and seven pheras under the stars. The doors are open, and your place is with us.",
    photos: PD_DEMO_PHOTOS.map((p) => ({ ...p })),
    gifs: {},
    music: true,
    musicMode: "youtube",
    musicYoutubeId: "8XtXLVylOoU",
    musicStart: 0,
    endLine: "With love and gratitude, the Rathore & Shekhawat families",
    extras: {
      theme: "champagne",
      lang: "en",
      nameOrder: "bride",
      hindiMessage:
        "ईश्वर की असीम कृपा और बड़ों के आशीर्वाद से, इशिता एवं कबीर के शुभ विवाह के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं। आपकी उपस्थिति ही हमारा सौभाग्य है।",
      brideFamily: "Mrs. Sunita & Mr. Mahendra Singh Rathore",
      groomFamily: "Mrs. Anjali & Mr. Vikram Singh Shekhawat",
      brideNote: "Jodhpur",
      groomNote: "Jaipur",
      blessingsOf: "Smt. Bhanwari Devi & Late Shri Prithvi Singh Rathore",
      bridePhoto: 0,
      groomPhoto: 0,
      couplePhoto: 0,
      muhurat: "Shubh muhurat 9:15 pm",
      hashtag: "#IshKabirKiShaadi",
      events: PD_DEMO_EVENTS.map((e) => ({ ...e })),
      story: [
        { when: "2018", title: "A wrong turn in Jodhpur", line: "He was lost in the blue lanes of the old city; she was the only one who stopped to point the way, and then walked him there herself.", photo: 0 },
        { when: "2021", title: "Letters between two cities", line: "Jaipur to Pune, a lockdown, and a habit of handwritten letters that neither of them admits to keeping. Both kept every one.", photo: 0 },
        { when: "2025", title: "A ring at the haveli door", line: "He knocked on the carved door of her grandmother's haveli with a ring in his pocket. Her dadi answered first, and said yes on her behalf.", photo: 16 },
        { when: "2027", title: "The doors open", line: "Now two families become one. Come in, bless us, and dance with us.", photo: 17 },
      ],
      things: [
        "Stay: Rooms for out-of-town guests are held at Samode Haveli from 9 to 14 February.",
        "Weather: February nights in Jaipur are cool, so bring a shawl.",
        "Getting around: Shuttles leave Samode Haveli for the palace every 30 minutes from 5 pm.",
        "Children: Little ones are very welcome; there is a play corner at every function.",
      ],
      gettingThere: "Jaipur International Airport is 30 minutes from Samode Haveli and 75 minutes from Samode Palace. Our hospitality desk will meet you at arrivals and at Jaipur Junction railway station.",
      contacts: [
        { name: "Yash Rathore", relation: "Ishita's brother", phone: "+91 98290 11223" },
        { name: "Meenal Shekhawat", relation: "Kabir's sister", phone: "+91 98280 44556" },
      ],
      upiId: "",
      upiName: "",
      liveUrl: "",
      videoUrl: "",
      rsvpBy: "2027-01-15",
      maxGuests: 4,
      rsvpMeal: true,
      blessings: true,
      invocation: true,
    },
  },
  copy: {
    recipientPlaceholder: "e.g. Ishita",
    senderPlaceholder: "e.g. Kabir",
    petNamePlaceholder: "",
    letterPlaceholder: "With the blessings of our elders, the Sharma and Mehta families invite you to the wedding of Ananya and Arjun…",
    letterHint: "The words your guests read first.",
    photosHint: "Any shape works. Tap a photo to resize it or set its focus. Drag to reorder.",
    captionHint: "caption — e.g. the roka",
    noteHint: "",
    endLinePlaceholder: "With love, the Sharma & Mehta families",
    endLineHint: "The closing line as the palace doors close.",
    sheetTitle: "Your palace door invitation",
    sheetSub: "Describe your wedding and we'll fill in everything. Change any of it.",
    extrasTitle: "Functions",
    extrasSub: "Every function with its own couple illustration, map, timings and dress code.",
    publishing: "Opening the palace doors…",
    storyTitle: "Describe your wedding 🚪",
    replyText: "",
  },
  share: { title: "The palace doors are open 🚪 You're invited", accent: "#9A4A1F" },
};
