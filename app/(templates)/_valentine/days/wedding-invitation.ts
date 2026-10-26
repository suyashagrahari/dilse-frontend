// ─── Wedding Invitation (Classic) · the Gulabi Jharokha ─────────────────────
//
// A carved Rajasthani jharokha window at pink dawn over a lake palace. One tap:
// the two latticed marble shutters swing outward in 3D, rose light pours
// through the jaali, petals drift in, the couple's names float up behind the
// window and the music starts. Inside: a blush-and-ivory invitation with
// peony trees, a floral gazebo and the illustrated couple (the owner's art,
// public/wedding-v3/template9 + template8 + template3), the invitation in
// English + Hindi, both families, a flip countdown, the story, every function
// (map, dress code, calendar), film, gallery, guest info, RSVP per function,
// blessings and a share bar with a personal ?to= link and a PNG invite card.
//
// Built on the Valentine engine (draft → publish → paywall → share → password
// → analytics → AI fill) and the wedding kit (app/(templates)/_wedding).
// Data mapping: recipientName = the bride, senderName = the groom (the kit's
// RSVP mails and the server read them as the couple), letter = the English
// invitation, endLine = the closing sign-off. Everything else is in `extras`.
//
// DATA COMPATIBILITY: pages published before the jharokha rebuild store only
// theme / namesOrder / date / time / brideFamily / groomFamily / events (≤ 2)
// / rsvp / rsvpBy / maxGuests, six CDN demo photos and possibly a dark theme
// id. Every key below is additive; switches that would change an old page
// (blessings wall, meal question, Shri Ganesh) default to OFF and the demo
// turns them on. Dark theme ids stay valid and render on a light palette.
//
// Server twin: server/src/config/valentineDays.ts ("wedding-invitation"). The
// keys and limits must match (valentineDays.test.ts pins them).

import type { DayConfig } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import type { LovePhoto } from "../../_love/types";
// Leaf modules only (not the kit barrel): every engine bundle imports the day list.
import { WEDDING_THEME_IDS, WEDDING_THEMES, type WeddingThemeId } from "../../_wedding/themes";
import { WEDDING_TIER_LIMITS, type WeddingEvent } from "../../_wedding/types";
import { meta } from "./_shared";

const SLUG = "wedding-invitation" as const;
export const WI_LIMITS = WEDDING_TIER_LIMITS[SLUG];
/** Family members guests can call (tap to call / WhatsApp). */
export const WI_MAX_CONTACTS = 3;

/** The three daylight palettes, named for this design. */
export const WI_THEME_LABELS: Record<string, string> = {
  blush: "Gulabi · rose gold",
  champagne: "Ivory & gold",
  powder: "Lake palace blue",
};

export interface WiContact {
  name: string;
  relation: string;
  phone: string;
}

export interface WiChapter {
  when: string;
  title: string;
  line: string;
  /** 1-based index into photos; 0 = none. */
  photo: number;
}

export interface WiExtras {
  theme: WeddingThemeId;
  /** Which name is printed first. (Kept as `namesOrder`: published pages store it.) */
  namesOrder: "bride" | "groom";
  /** The big day, "YYYY-MM-DD" — drives the countdown. */
  date: string;
  /** "HH:mm" (24 h) — the muhurat / start time for the countdown. */
  time: string;
  brideFamily: string;
  groomFamily: string;
  /** The functions (WeddingEvent with string leaves; `id` is the RSVP key). */
  events: WeddingEvent[];
  rsvp: boolean;
  /** "YYYY-MM-DD" — "Kindly reply by…". */
  rsvpBy: string;
  maxGuests: number;
  // ── added in the jharokha rebuild (all optional on old pages) ──
  lang: "en" | "hi";
  hindiMessage: string;
  brideNote: string;
  groomNote: string;
  blessingsOf: string;
  couplePhoto: number;
  muhurat: string;
  hashtag: string;
  story: WiChapter[];
  things: string[];
  gettingThere: string;
  contacts: WiContact[];
  upiId: string;
  upiName: string;
  liveUrl: string;
  videoUrl: string;
  rsvpMeal: boolean;
  blessings: boolean;
  invocation: boolean;
  [k: string]: unknown;
}

/** The editor chrome: ivory paper, blush, a rose-gold accent. The guest page wears extras.theme. */
const SHEET_THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FFF9F6 0%, #FCEFEA 55%, #F7E1DA 100%)",
  base: "#FDF4F0",
  paper: "#FFFCFA",
  glass: "rgba(255,252,250,0.84)",
  ink: "#4A2630",
  inkSoft: "#86606A",
  paperInk: "#4A2630",
  accent: "#B4566E",
  accentDeep: "#8E3B52",
  accentInk: "#FFF7F5",
  soft: "#FBE9E6",
  edge: "#EFD3CF",
  gold: "#C99A6B",
  dark: false,
  particles: ["🌸", "✨"],
  confetti: ["#E8A1B0", "#F6C9CF", "#C99A6B", "#F3DCC5", "#FFFFFF"],
};

/**
 * The shehnai by default (spec: classic opens on shehnai) + verified uploads
 * (oEmbed 200 — research/music.json 2026-10-19, wq-research.md §5 2026-10-22).
 */
export const WI_SONGS: readonly SongSuggestion[] = [
  { id: "-bNwqXvMuB8", title: "Mehndi Laga Ke Rakhna", artist: "DDLJ" },
  { id: "8XtXLVylOoU", title: "Saajanji Ghar Aaye", artist: "Kuch Kuch Hota Hai" },
  { id: "1LVpuWpRs3I", title: "Din Shagna Da", artist: "Jasleen Royal" },
  { id: "3qpxJEp4Ec4", title: "Kudmayi", artist: "Rocky Aur Rani" },
  { id: "jCEdTq3j-0U", title: "Gallan Goodiyaan", artist: "Dil Dhadakne Do" },
  { id: "V7LwfY5U5WI", title: "Ranjha", artist: "Shershaah" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Brahmastra" },
  { id: "lwLVJ0E8gN4", title: "Kabira (Encore)", artist: "Yeh Jawaani Hai Deewani" },
  { id: "OzEL4CwbPew", title: "Shehnai: Kanyadaan (slow, for the pheras)", artist: "Ustad Bismillah Khan" },
  { id: "Ptk_1Dc2iPY", title: "Canon in D", artist: "Brooklyn Duo" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];

/**
 * Demo photos (CC0 / public domain, media-src/templates/wedding/ATTRIBUTION.md, rw-*) ship IN THE
 * REPO under public/wedding-v3/demo, never on the CDN or S3. The engine and the server keep only
 * https photo links, so a draft stores them on the site's own domain; every render maps that back
 * to the same-origin path (wiLocalUrl), so local, staging and prod each serve their own copy.
 * Pages published before the rebuild keep their CDN demo links (cdn.subhsandesh.in), untouched.
 */
const SITE_ORIGIN = "https://subhsandesh.in";
const DEMO_BASE = `${SITE_ORIGIN}/wedding-v3/demo`;
const REPO_ART_RE = /^https:\/\/(?:www\.)?subhsandesh\.in(\/wedding-v3\/[^?#\s]+)$/i;
/** A stored repo-art link → the same-origin path this host serves from public/. Anything else is unchanged. */
export const wiLocalUrl = (url: string): string => REPO_ART_RE.exec(url)?.[1] ?? url;
/** The inverse, for anything the studio hands back: a same-origin repo path → the https link the engine keeps. */
export const wiStoredUrl = (url: string): string => (url.startsWith("/wedding-v3/") ? `${SITE_ORIGIN}${url}` : url);

/**
 * 1–10 fill the gallery; 11 and 12 are the two story chapters (so they stay out
 * of it). Order and spans are tuned for a level wall at 2 columns (phones) and
 * 3 (tablet / desktop). No portrait in the demo: the hero shows the illustrated
 * couple under the floral gazebo until one is picked.
 */
export const WI_DEMO_PHOTOS: LovePhoto[] = [
  { url: `${DEMO_BASE}/rw-08.webp`, w: 684, h: 1024, cropX: 50, cropY: 40, caption: "The mandap, in bloom", span: "tall" },
  { url: `${DEMO_BASE}/rw-04.webp`, w: 1400, h: 1047, cropX: 50, cropY: 50, caption: "Mehendi" },
  { url: `${DEMO_BASE}/rw-01.webp`, w: 1024, h: 768, cropX: 50, cropY: 45 },
  { url: `${DEMO_BASE}/rw-14.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-11.webp`, w: 1024, h: 487, cropX: 50, cropY: 50, caption: "Bangles & henna", span: "wide" },
  { url: `${DEMO_BASE}/rw-16.webp`, w: 683, h: 1024, cropX: 50, cropY: 35, caption: "Just us" },
  { url: `${DEMO_BASE}/rw-13.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-09.webp`, w: 931, h: 1024, cropX: 50, cropY: 40, span: "tall" },
  { url: `${DEMO_BASE}/rw-12.webp`, w: 1024, h: 683, cropX: 50, cropY: 50, caption: "The rings", span: "wide" },
  { url: `${DEMO_BASE}/rw-03.webp`, w: 1024, h: 768, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-18.webp`, w: 1024, h: 683, cropX: 50, cropY: 55 },
  { url: `${DEMO_BASE}/rw-17.webp`, w: 1400, h: 1050, cropX: 50, cropY: 50 },
];

/** Five functions on the lakes of Udaipur. The sender can add up to WI_LIMITS.events. */
export const WI_DEMO_EVENTS: WeddingEvent[] = [
  { id: "mehendi", title: "Mehendi", date: "2026-12-10", time: "16:00", endTime: "20:00", venue: "Fateh Prakash Palace Gardens", address: "City Palace Complex, Udaipur", mapUrl: "", dressCode: "Greens and bright florals", dressColor: "#4F9B6A", note: "Henna, folk songs and endless chai by the water." },
  { id: "haldi", title: "Haldi", date: "2026-12-11", time: "10:30", endTime: "13:00", venue: "The Rose Courtyard, Shiv Niwas", address: "City Palace Complex, Udaipur", mapUrl: "", dressCode: "Shades of yellow", dressColor: "#F2C94C", note: "Turmeric, marigolds and a lot of laughter. Wear something you don't mind getting yellow." },
  { id: "sangeet", title: "Sangeet", date: "2026-12-11", time: "19:30", endTime: "23:30", venue: "Durbar Hall, Shiv Niwas", address: "City Palace Complex, Udaipur", mapUrl: "", dressCode: "Indo-western glam", dressColor: "#E86A92", note: "Both families on one dance floor. Practise your steps." },
  { id: "wedding", title: "Wedding (Pheras)", date: "2026-12-12", time: "19:30", endTime: "23:30", venue: "Jagmandir Island Palace", address: "Lake Pichola, Udaipur", mapUrl: "", dressCode: "Traditional festive", dressColor: "#B4566E", note: "Boats leave the City Palace jetty from 6:45 pm; the pheras begin at the shubh muhurat, 9:15 pm." },
  { id: "reception", title: "Reception", date: "2026-12-13", time: "20:00", endTime: "23:59", venue: "The Leela Palace Lawns", address: "Lake Pichola, Udaipur", mapUrl: "", dressCode: "Ivory and pastels", dressColor: "#F3EBDD", note: "Dinner by the lake, toasts and dancing to welcome the newlyweds home." },
];

const TXT = (key: string, label: string, max: number) => ({ key, kind: "text" as const, max, label });
const evDone = (mf: { extras: Record<string, unknown> }) => Array.isArray(mf.extras.events) && (mf.extras.events as { title?: string; date?: string }[]).some((e) => !!e.title && !!e.date);

export const weddingInvitationDay: DayConfig<WiExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Wedding Invitation",
  maxPhotos: WI_LIMITS.photos,
  letterMax: 900,
  letterMin: 20,
  asksQuestion: false,
  melody: "lantern",
  photoAspect: 0.8,
  gifSlots: [],
  topBar: true,
  brandMark: "stacked",
  studio: "weddingClassic",
  // The studio draws every section itself, password included (keeps no plain section).
  // Edit stays after publishing: the owner's guest replies + blessings live in the form.
  studioForm: {
    ownAi: true,
    editAfterPublish: true,
    nav: [
      { id: "names", label: "The couple", emoji: "💍" },
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
    suggestions: WI_SONGS,
    suggestionsNote: "shehnai, Bollywood and English wedding songs · tap one, or paste any YouTube link",
  },
  extras: [
    {
      // Every id stays valid (old pages may store a dark one); the picker offers the light three.
      key: "theme", kind: "enum", label: "Theme", default: "blush", hidden: true, display: "swatches",
      options: WEDDING_THEME_IDS.map((id) => ({ value: id, label: WI_THEME_LABELS[id] ?? WEDDING_THEMES[id].label, swatch: WEDDING_THEMES[id].swatch[1] })),
    },
    { key: "namesOrder", kind: "enum", label: "Show names as", default: "bride", hidden: true, options: [{ value: "bride", label: "Bride first" }, { value: "groom", label: "Groom first" }] },
    { key: "date", kind: "text", max: 10, label: "The big day", input: "date", hidden: true },
    { key: "time", kind: "text", max: 5, label: "Muhurat / start time", hidden: true },
    { key: "brideFamily", kind: "text", max: 120, label: "Bride's family", hidden: true },
    { key: "groomFamily", kind: "text", max: 120, label: "Groom's family", hidden: true },
    {
      key: "events", kind: "objlist", maxItems: WI_LIMITS.events, label: "Functions", itemTitle: "Function", hidden: true,
      item: [
        TXT("id", "Id", 40), TXT("title", "Name", 40), TXT("date", "Date", 10), TXT("time", "Start", 5), TXT("endTime", "End", 5),
        TXT("venue", "Venue", 80), TXT("address", "Address", 140), TXT("mapUrl", "Google Maps link", 400),
        TXT("dressCode", "Dress code", 60), TXT("dressColor", "Dress colour", 9), TXT("note", "Note", 200),
      ],
    },
    { key: "rsvp", kind: "bool", label: "Ask guests to RSVP", default: true, hidden: true },
    { key: "rsvpBy", kind: "text", max: 10, label: "Reply by", input: "date", hidden: true },
    { key: "maxGuests", kind: "number", label: "Guests per reply", min: 1, max: 10, default: 4, hidden: true },
    // ── added in the jharokha rebuild ──
    { key: "lang", kind: "enum", label: "Opens in", default: "en", hidden: true, options: [{ value: "en", label: "English" }, { value: "hi", label: "हिन्दी" }] },
    { key: "hindiMessage", kind: "longtext", max: 700, label: "Invitation in Hindi", hidden: true },
    { key: "brideNote", kind: "text", max: 100, label: "Bride's family note", hidden: true },
    { key: "groomNote", kind: "text", max: 100, label: "Groom's family note", hidden: true },
    { key: "blessingsOf", kind: "text", max: 160, label: "With the blessings of", hidden: true },
    { key: "couplePhoto", kind: "number", min: 0, max: WI_LIMITS.photos, default: 0, label: "The couple's portrait", hidden: true },
    { key: "muhurat", kind: "text", max: 60, label: "Muhurat line", hidden: true },
    { key: "hashtag", kind: "text", max: 40, label: "Wedding hashtag", hidden: true },
    {
      key: "story", kind: "objlist", maxItems: WI_LIMITS.story, label: "Our story", itemTitle: "Chapter", hidden: true,
      item: [TXT("when", "When", 24), TXT("title", "Title", 60), TXT("line", "What happened", 240), { key: "photo", kind: "number", label: "Photo", min: 0, max: WI_LIMITS.photos, default: 0 }],
    },
    { key: "things", kind: "list", maxItems: WI_LIMITS.faq, itemMax: 180, label: "Good to know", hidden: true },
    { key: "gettingThere", kind: "longtext", max: 500, label: "Getting there", hidden: true },
    {
      key: "contacts", kind: "objlist", maxItems: WI_MAX_CONTACTS, label: "Who to call", itemTitle: "Contact", hidden: true,
      item: [TXT("name", "Name", 40), TXT("relation", "Relation", 40), TXT("phone", "Phone", 16)],
    },
    { key: "upiId", kind: "text", max: 60, label: "UPI ID for shagun", hidden: true },
    { key: "upiName", kind: "text", max: 60, label: "Name on the UPI account", hidden: true },
    { key: "liveUrl", kind: "text", max: 300, label: "Livestream link", hidden: true },
    { key: "videoUrl", kind: "text", max: 200, label: "Pre-wedding film", hidden: true },
    // Off for pages that never had them (old pages look exactly as published); the demo turns them on.
    { key: "rsvpMeal", kind: "bool", default: false, label: "Ask for meal preference", hidden: true },
    { key: "blessings", kind: "bool", default: false, label: "Blessings wall", hidden: true },
    { key: "invocation", kind: "bool", default: false, label: "Shri Ganesh on the invitation", hidden: true },
  ],
  theme: SHEET_THEME,
  demo: {
    recipientName: "Aanya",
    senderName: "Vihaan",
    petName: "",
    letter:
      "With the blessings of the Almighty and our elders, the Rathore and Singhania families joyfully invite you to the wedding of their children, Aanya and Vihaan.\n\nFour days by the lakes of Udaipur: henna in the palace gardens, a sangeet that will run too late, and seven pheras on an island at dusk. Your presence and your blessings will make it complete.",
    photos: WI_DEMO_PHOTOS.map((p) => ({ ...p })),
    gifs: {},
    music: true,
    musicMode: "youtube",
    musicYoutubeId: "-bNwqXvMuB8",
    musicStart: 0,
    endLine: "With love, the Rathore & Singhania families",
    extras: {
      theme: "blush",
      namesOrder: "bride",
      date: "2026-12-12",
      time: "19:30",
      brideFamily: "Mrs. Meera & Mr. Raghav Rathore",
      groomFamily: "Mrs. Kavita & Mr. Arjun Singhania",
      events: WI_DEMO_EVENTS.map((e) => ({ ...e })),
      rsvp: true,
      rsvpBy: "2026-11-25",
      maxGuests: 4,
      lang: "en",
      hindiMessage:
        "ईश्वर की असीम कृपा और बड़ों के आशीर्वाद से, आन्या एवं विहान के शुभ विवाह के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं। आपकी उपस्थिति ही हमारा सौभाग्य है।",
      brideNote: "Udaipur",
      groomNote: "Jaipur",
      blessingsOf: "Smt. Kamla Devi & Late Shri Bhanwar Singh Rathore",
      couplePhoto: 0,
      muhurat: "Shubh muhurat 9:15 pm",
      hashtag: "#AanyaWedsVihaan",
      story: [
        { when: "2019", title: "A borrowed umbrella", line: "A monsoon evening at Ambrai Ghat, one umbrella between two strangers, and a walk around the lake that neither of them wanted to end.", photo: 11 },
        { when: "2025", title: "A ring by the lake", line: "Six years and two cities later, he asked her on the same ghat at sunrise. She said yes before he finished the question.", photo: 12 },
      ],
      things: [
        "Stay: Rooms for out-of-town guests are held at Shiv Niwas Palace from 9 to 14 December.",
        "Weather: December evenings by the lake are cool, so bring a shawl.",
        "Boats: The wedding is on an island; boats run from the City Palace jetty every 15 minutes.",
      ],
      gettingThere: "Maharana Pratap Airport (UDR) is 35 minutes from the City Palace. Our hospitality desk will meet you at arrivals and at Udaipur City railway station.",
      contacts: [
        { name: "Kabir Rathore", relation: "Aanya's brother", phone: "+91 98290 11223" },
        { name: "Riya Singhania", relation: "Vihaan's sister", phone: "+91 98280 44556" },
      ],
      upiId: "",
      upiName: "",
      liveUrl: "",
      videoUrl: "",
      rsvpMeal: true,
      blessings: true,
      invocation: true,
    },
  },
  copy: {
    recipientPlaceholder: "e.g. Aanya",
    senderPlaceholder: "e.g. Vihaan",
    petNamePlaceholder: "",
    letterPlaceholder: "With the blessings of our elders, the Sharma and Mehta families invite you to the wedding of Ananya and Arjun…",
    letterHint: "The words your guests read first.",
    photosHint: "Any shape works. Tap a photo to resize it or set its focus. Drag to reorder.",
    captionHint: "caption — e.g. The roka",
    noteHint: "",
    endLinePlaceholder: "With love, the Sharma & Mehta families",
    endLineHint: "The sign-off at the very end of the invitation.",
    sheetTitle: "Your wedding invitation",
    sheetSub: "Answer a few questions and we'll fill in everything below. Change any of it.",
    extrasTitle: "Functions",
    extrasSub: "Every function with its map, timings, dress code and a calendar button.",
    publishing: "Opening the jharokha…",
    storyTitle: "Let's write your invitation",
    replyText: "We'd love to be there 💐 Congratulations to you both!",
    yesChip: "Opened ✓",
  },
  share: { title: "You're invited 🌸 Tap the jharokha to open our wedding invitation", accent: "#B4566E" },
};
