// ─── Mughal Garden Wedding Invitation 🦚 (wedding tier, same limits as Royal) ───
//
// A pastel watercolour Mughal garden: clouds part over a pink gazebo where the
// couple stands, a peacock struts along the hedge, lanterns sway, the fountain
// plays and cherry-blossom petals drift. Royal's fields and limits plus three
// garden extras: family contacts (tap to call / WhatsApp), an optional shagun
// UPI line and an optional livestream link. The guest page and the studio live
// in app/(templates)/garden-wedding-invitation/components. Art: public/wedding-v3
// (see components/assets.ts), drawn from its media-CDN mirror (the demo photos
// below and the invite card's canvas keep the same-origin copy).
//
// Field mapping on the engine: recipientName = the bride, senderName = the
// groom, letter = the English invitation, endLine = the closing line,
// photos = ONE pool of up to 40 (story chapters and family cards point into it
// by 1-based index).
//
// Server twin: server/src/config/weddingDays/garden-wedding-invitation.ts; keys and limits
// must match (valentineDays.test.ts pins them). Light themes only.

import type { DayConfig, LovePhoto } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { meta } from "./_shared";
import { LIGHT_THEMES } from "../../_wedding/themes";
import { WEDDING_TIER_LIMITS, type WeddingEvent } from "../../_wedding/types";

const SLUG = "garden-wedding-invitation" as const;
export const GW_LIMITS = WEDDING_TIER_LIMITS[SLUG];

export const GW_THEME_LABELS: Record<string, string> = {
  blush: "Blush Pink",
  champagne: "Champagne",
  powder: "Powder Blue",
  maroon: "Royal Maroon & Gold",
  noir: "Black & Gold",
  emerald: "Emerald & Gold",
};

/** Verified YouTube uploads (oEmbed 200 + embeddable, re-checked 2026-10-22, wq-research.md §5).
 *  The garden opens on Din Shagna Da (pastel, the bride's entry). */
export const GW_SONGS: readonly SongSuggestion[] = [
  { id: "1LVpuWpRs3I", title: "Din Shagna Da", artist: "Jasleen Royal" },
  { id: "3qpxJEp4Ec4", title: "Kudmayi", artist: "Shahid Mallya" },
  { id: "V7LwfY5U5WI", title: "Ranjha", artist: "B Praak, Jasleen Royal" },
  { id: "OzEL4CwbPew", title: "Wedding Shehnai (Kanyadaan)", artist: "Ustad Bismillah Khan" },
  { id: "8XtXLVylOoU", title: "Saajanji Ghar Aaye", artist: "Alka Yagnik, Kumar Sanu" },
  { id: "-bNwqXvMuB8", title: "Mehndi Laga Ke Rakhna", artist: "Lata Mangeshkar, Udit Narayan" },
  { id: "jCEdTq3j-0U", title: "Gallan Goodiyaan", artist: "Dil Dhadakne Do" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "lwLVJ0E8gN4", title: "Kabira (Encore)", artist: "Arijit Singh, Harshdeep Kaur" },
  { id: "Ptk_1Dc2iPY", title: "Canon in D", artist: "Brooklyn Duo" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];

/** The editor chrome (form sheet, top bar): ivory, blush rose, sage and soft gold. The guest page wears extras.theme. */
const THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FFFAF6 0%, #FBEDEE 55%, #EEF4EC 100%)",
  base: "#FCF3F1",
  paper: "#FFFDFB",
  glass: "rgba(255,253,251,.84)",
  ink: "#3E1F27",
  inkSoft: "#7E5F66",
  paperInk: "#3E1F27",
  accent: "#A94E63",
  accentDeep: "#7E3347",
  accentInk: "#FFF8F6",
  soft: "#F7E6E3",
  edge: "#EBD3D3",
  gold: "#C08A5C",
  dark: false,
  particles: ["🌸", "✨", "🦚"],
  confetti: ["#F4B6C6", "#C08A5C", "#9DB89A", "#BFD8EC"],
};

/** Five functions to start from; the sender can add up to eight (Roka, Baraat, Cocktail…). */
export const GW_DEMO_EVENTS: WeddingEvent[] = [
  { id: "haldi", title: "Haldi", date: "2027-02-18", time: "10:30", endTime: "13:30", venue: "The Bagh Lawns, Samode Bagh", address: "Samode Bagh, Jaipur", mapUrl: "", dressCode: "Shades of yellow", dressColor: "#F2C94C", note: "Turmeric, marigolds and a lot of laughter under the garden chhatris. Wear yellow and expect to get a little messy." },
  { id: "mehendi", title: "Mehendi", date: "2027-02-18", time: "16:30", endTime: "20:00", venue: "The Lotus Pond Pavilion", address: "Samode Bagh, Jaipur", mapUrl: "", dressCode: "Greens and bright florals", dressColor: "#4F9B6A", note: "Henna, folk songs and endless chai by the lotus pond. Come get your hands painted." },
  { id: "sangeet", title: "Sangeet", date: "2027-02-19", time: "19:30", endTime: "23:30", venue: "The Lantern Courtyard", address: "Rambagh Palace, Jaipur", mapUrl: "", dressCode: "Pastel Indo-western", dressColor: "#E86A92", note: "Both families take the stage. Bring your dancing shoes and your best filmi moves." },
  { id: "wedding", title: "Wedding (Pheras)", date: "2027-02-20", time: "18:30", endTime: "23:30", venue: "The Mughal Gardens, Rambagh Palace", address: "Bhawani Singh Road, Jaipur", mapUrl: "", dressCode: "Traditional, soft pastels", dressColor: "#F4C9D4", note: "The baraat arrives at 6:30 pm; the pheras begin at the shubh muhurat, 8:40 pm, under the garden gazebo." },
  { id: "reception", title: "Reception", date: "2027-02-21", time: "20:00", endTime: "23:59", venue: "The Polo Bar Lawns", address: "Rambagh Palace, Jaipur", mapUrl: "", dressCode: "Evening formal", dressColor: "#2E5AAC", note: "Dinner under the stars, a few toasts and dancing to celebrate the newlyweds." },
];

/**
 * Demo photos (CC0 / public domain, media-src/templates/wedding/ATTRIBUTION.md, rw-*) ship IN THE
 * REPO under public/wedding-v3/demo, never on the CDN or S3. The engine and the server keep only
 * https photo links, so a draft stores them on the site's own domain; every render maps that back
 * to the same-origin path (gwLocalUrl), so local, staging and prod each serve their own copy.
 */
const SITE_ORIGIN = "https://subhsandesh.in";
const DEMO_CDN = `${SITE_ORIGIN}/wedding-v3/demo`;
export { DEMO_CDN as GW_DEMO_CDN };
const REPO_ART_RE = /^https:\/\/(?:www\.)?subhsandesh\.in(\/wedding-v3\/[^?#\s]+)$/i;
/** A stored repo-art link → the same-origin path this host serves from public/. Anything else is unchanged. */
export const gwLocalUrl = (url: string): string => REPO_ART_RE.exec(url)?.[1] ?? url;
/** The inverse, for anything the studio hands back: a same-origin repo path → the https link the engine keeps. */
export const gwStoredUrl = (url: string): string => (url.startsWith("/wedding-v3/") ? `${SITE_ORIGIN}${url}` : url);
/** Map a photo list for rendering (same array back when nothing changes). */
export const gwLocalPhotos = (photos: LovePhoto[]): LovePhoto[] =>
  photos.some((p) => p && gwLocalUrl(p.url) !== p.url) ? photos.map((p) => (p && gwLocalUrl(p.url) !== p.url ? { ...p, url: gwLocalUrl(p.url) } : p)) : photos;

/** 1–16 fill the gallery; 17 and 18 are story chapters 3 and 4 (so they stay out of it). */
export const GW_DEMO_PHOTOS: LovePhoto[] = [
  { url: `${DEMO_CDN}/rw-01.webp`, w: 1024, h: 768, cropX: 50, cropY: 50, caption: "The bride" },
  { url: `${DEMO_CDN}/rw-04.webp`, w: 1400, h: 1047, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-16.webp`, w: 683, h: 1024, cropX: 50, cropY: 35 },
  { url: `${DEMO_CDN}/rw-03.webp`, w: 1024, h: 768, cropX: 50, cropY: 50, caption: "Haldi morning", span: "wide" },
  { url: `${DEMO_CDN}/gw-flowers.webp`, w: 800, h: 1202, cropX: 50, cropY: 45, caption: "The garden in bloom" },
  { url: `${DEMO_CDN}/rw-14.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-12.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-07.webp`, w: 1024, h: 683, cropX: 50, cropY: 50, caption: "First dance" },
  { url: `${DEMO_CDN}/rw-11.webp`, w: 1024, h: 487, cropX: 50, cropY: 50, caption: "Mehendi", span: "wide" },
  { url: `${DEMO_CDN}/rw-15.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-13.webp`, w: 1024, h: 683, cropX: 50, cropY: 50, caption: "Shringar" },
  { url: `${DEMO_CDN}/rw-08.webp`, w: 684, h: 1024, cropX: 50, cropY: 35, span: "tall" },
  { url: `${DEMO_CDN}/rw-05.webp`, w: 680, h: 1024, cropX: 50, cropY: 35, caption: "Pheras" },
  { url: `${DEMO_CDN}/rw-09.webp`, w: 931, h: 1024, cropX: 50, cropY: 35, span: "tall" },
  { url: `${DEMO_CDN}/rw-06.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-02.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-17.webp`, w: 1400, h: 1050, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-18.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
];

export interface GwExtras {
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
  muhurat: string;
  hashtag: string;
  events: WeddingEvent[];
  story: { when: string; title: string; line: string; photo: number }[];
  things: string[];
  gettingThere: string;
  videoUrl: string;
  rsvpBy: string;
  maxGuests: number;
  rsvpMeal: boolean;
  blessings: boolean;
  invocation: boolean;
  /** 1–4 family members guests can call or WhatsApp (phone: 10 digits, optional +91). */
  contacts: { name: string; relation: string; phone: string }[];
  /** Optional shagun: a UPI id + the name it belongs to (off when empty). */
  upiId: string;
  upiName: string;
  /** Optional livestream (YouTube / Zoom, https only); "Watch live" opens 30 min before the main event. */
  liveUrl: string;
  [k: string]: unknown;
}

const ev = (k: string, label: string, max: number, placeholder?: string) => ({ key: k, kind: "text" as const, label, max, placeholder });

export const gardenWeddingDay: DayConfig<GwExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Mughal Garden Wedding Invitation",
  maxPhotos: GW_LIMITS.photos,
  letterMax: 1500,
  letterMin: 20,
  asksQuestion: false,
  melody: "diya",
  photoAspect: 0.8,
  gifSlots: [],
  topBar: true,
  brandMark: "stacked",
  studio: "gardenWedding",
  // The studio draws every section itself, password included (keeps no plain section).
  // Edit stays after publishing: the owner's guest replies + blessings live in the form.
  studioForm: {
    ownAi: true,
    editAfterPublish: true,
    nav: [
      { id: "names", label: "The couple", emoji: "🦚" },
      { id: "details", label: "Functions", emoji: "🪔" },
      { id: "photos", label: "Photos", emoji: "📸" },
      { id: "letter", label: "Invitation", emoji: "✉️" },
      { id: "music", label: "Theme & music", emoji: "🎵" },
      { id: "finish", label: "Guests & more", emoji: "🌸" },
    ],
  },
  music: {
    audioOnly: true,
    compact: true,
    suggestions: GW_SONGS,
    suggestionsNote: "Garden-soft filmi songs, the shehnai and a few English ones · or paste any YouTube link",
  },
  extras: [
    { key: "theme", kind: "enum", label: "Theme", default: "blush", hidden: true, options: LIGHT_THEMES.map((id) => ({ value: id, label: GW_THEME_LABELS[id] ?? id })) },
    { key: "lang", kind: "enum", label: "Opens in", default: "en", hidden: true, options: [{ value: "en", label: "English" }, { value: "hi", label: "हिन्दी" }] },
    { key: "nameOrder", kind: "enum", label: "Show names as", default: "bride", hidden: true, options: [{ value: "bride", label: "Bride first" }, { value: "groom", label: "Groom first" }] },
    { key: "hindiMessage", kind: "longtext", max: 700, label: "Invitation in Hindi", hidden: true },
    { key: "brideFamily", kind: "text", max: 120, label: "Bride's family", hidden: true },
    { key: "groomFamily", kind: "text", max: 120, label: "Groom's family", hidden: true },
    { key: "brideNote", kind: "text", max: 100, label: "Bride's family note", hidden: true },
    { key: "groomNote", kind: "text", max: 100, label: "Groom's family note", hidden: true },
    { key: "blessingsOf", kind: "text", max: 160, label: "With the blessings of", hidden: true },
    { key: "bridePhoto", kind: "number", min: 0, max: GW_LIMITS.photos, default: 0, label: "Bride's family photo", hidden: true },
    { key: "groomPhoto", kind: "number", min: 0, max: GW_LIMITS.photos, default: 0, label: "Groom's family photo", hidden: true },
    { key: "muhurat", kind: "text", max: 60, label: "Muhurat", hidden: true },
    { key: "hashtag", kind: "text", max: 40, label: "Wedding hashtag", hidden: true },
    {
      key: "events", kind: "objlist", maxItems: GW_LIMITS.events, minItems: 1, label: "Functions", itemTitle: "Function", hidden: true,
      item: [
        ev("id", "Id", 24), ev("title", "Name", 40), ev("date", "Date", 10), ev("time", "Start", 5), ev("endTime", "End", 5),
        ev("venue", "Venue", 80), ev("address", "Address", 140), ev("mapUrl", "Google Maps link", 400),
        ev("dressCode", "Dress code", 60), ev("dressColor", "Dress colour", 7), ev("note", "Note", 200),
      ],
    },
    {
      key: "story", kind: "objlist", maxItems: GW_LIMITS.story, label: "Our story", itemTitle: "Chapter", hidden: true,
      item: [ev("when", "When", 24), ev("title", "Title", 60), ev("line", "What happened", 240), { key: "photo", kind: "number", label: "Photo", min: 0, max: GW_LIMITS.photos, default: 0 }],
    },
    { key: "things", kind: "list", maxItems: GW_LIMITS.faq, itemMax: 180, label: "Good to know", hidden: true },
    { key: "gettingThere", kind: "longtext", max: 500, label: "Getting there", hidden: true },
    { key: "videoUrl", kind: "text", max: 200, label: "Pre-wedding film", hidden: true },
    { key: "rsvpBy", kind: "text", max: 10, label: "Reply by", input: "date", hidden: true },
    { key: "maxGuests", kind: "number", min: 1, max: 10, default: 4, label: "Guests per reply", hidden: true },
    { key: "rsvpMeal", kind: "bool", default: true, label: "Ask for meal preference", hidden: true },
    { key: "blessings", kind: "bool", default: true, label: "Blessings wall", hidden: true },
    { key: "invocation", kind: "bool", default: true, label: "Open with Shri Ganesh", hidden: true },
    {
      key: "contacts", kind: "objlist", maxItems: 4, label: "Family contacts", itemTitle: "Contact", hidden: true,
      item: [ev("name", "Name", 40), ev("relation", "Relation", 40), ev("phone", "Phone", 16)],
    },
    { key: "upiId", kind: "text", max: 60, label: "Shagun UPI id", hidden: true },
    { key: "upiName", kind: "text", max: 60, label: "UPI name", hidden: true },
    { key: "liveUrl", kind: "text", max: 300, label: "Livestream link", hidden: true },
  ],
  theme: THEME,
  demo: {
    recipientName: "Ishita",
    senderName: "Kabir",
    petName: "",
    letter:
      "With the blessings of our elders, the Khanna and Malhotra families joyfully invite you to celebrate the wedding of Ishita and Kabir.\n\nFour days in the gardens of Jaipur: haldi under the chhatris, mehendi by the lotus pond, a sangeet full of filmi dancing and the seven pheras beneath the gazebo. Your presence will make it complete.",
    photos: GW_DEMO_PHOTOS.map((p) => ({ ...p })),
    gifs: {},
    music: true,
    musicMode: "youtube",
    musicYoutubeId: "1LVpuWpRs3I",
    musicStart: 0,
    endLine: "With love and gratitude, the Khanna & Malhotra families",
    extras: {
      theme: "blush",
      lang: "en",
      nameOrder: "bride",
      hindiMessage:
        "बड़ों के आशीर्वाद और ईश्वर की कृपा से, इशिता और कबीर के शुभ विवाह के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं। आपकी उपस्थिति ही हमारा सौभाग्य है।",
      brideFamily: "Mrs. Radhika & Mr. Sameer Khanna",
      groomFamily: "Mrs. Anjali & Mr. Vivek Malhotra",
      brideNote: "Jaipur",
      groomNote: "New Delhi",
      blessingsOf: "Smt. Kaushalya Devi & Late Shri Harbans Lal Khanna",
      bridePhoto: 0,
      groomPhoto: 0,
      muhurat: "Shubh muhurat 8:40 pm",
      hashtag: "#IshKabirKaBagh",
      events: GW_DEMO_EVENTS.map((e) => ({ ...e })),
      story: [
        { when: "2018", title: "A borrowed umbrella", line: "A Jaipur monsoon, one umbrella and two strangers at the Amer Fort bus stop. He walked her home and forgot to ask her name.", photo: 0 },
        { when: "2020", title: "Letters across a lockdown", line: "Delhi to Jaipur, a year of video calls, handwritten letters and one very patient postman.", photo: 0 },
        { when: "2025", title: "A ring in the rose garden", line: "Sunset at the Ram Niwas Bagh, a ring tucked inside a rose. She said yes before he could kneel.", photo: 17 },
        { when: "2027", title: "Forever begins", line: "Now our families become one, and we would love you in the garden with us.", photo: 18 },
      ],
      things: [
        "Stay: Rooms for out-of-town guests are held at Samode Bagh and Rambagh Palace from 17 to 22 Feb.",
        "Weather: February evenings in Jaipur are cool, so bring a shawl.",
        "Getting around: Shuttles run between both venues every 30 minutes from 9 am.",
        "Kids: Little ones are very welcome; there is a garden play corner at every function.",
      ],
      gettingThere: "Jaipur International Airport is 20 minutes from Rambagh Palace and 50 from Samode Bagh. Our hospitality desk will meet you at arrivals and at Jaipur Junction.",
      videoUrl: "",
      rsvpBy: "2027-01-20",
      maxGuests: 4,
      rsvpMeal: true,
      blessings: true,
      invocation: true,
      contacts: [
        { name: "Rohan Khanna", relation: "Bride's brother", phone: "+91 98765 43210" },
        { name: "Neha Malhotra", relation: "Groom's cousin", phone: "+91 98765 01234" },
      ],
      upiId: "",
      upiName: "",
      liveUrl: "",
    },
  },
  copy: {
    recipientPlaceholder: "e.g. Ishita",
    senderPlaceholder: "e.g. Kabir",
    petNamePlaceholder: "",
    letterPlaceholder: "Together with their families, Ishita and Kabir request the honour of your presence at the celebration of their marriage…",
    letterHint: "The words your guests read first.",
    photosHint: "Any shape works. Tap a photo to resize it or set its focus. Drag to reorder.",
    captionHint: "caption — e.g. the roka",
    noteHint: "",
    endLinePlaceholder: "With love, the Sharma & Mehta families",
    endLineHint: "The closing line under the gazebo at the very end.",
    sheetTitle: "Your Mughal garden invitation",
    sheetSub: "Describe your wedding and we'll fill in everything. Change any of it.",
    extrasTitle: "Functions",
    extrasSub: "Every function with its own map, timings and dress code.",
    publishing: "Getting your invitation ready…",
    storyTitle: "Describe your wedding 🦚",
    replyText: "",
  },
  share: { title: "You're invited to a garden wedding 🦚", accent: "#B0466A" },
};
