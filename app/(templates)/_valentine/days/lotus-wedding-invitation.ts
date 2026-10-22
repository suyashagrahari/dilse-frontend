// ─── Lotus Temple Wedding Invitation 🪷 (wedding tier, same limits as Royal) ───
//
// A lotus blooms in a still temple pond, brass lamps light one by one, gold
// string lights twinkle over "Shri Ganeshay Namah" and a sage arch badge
// carries the date; ivory, lotus-leaf sage, lotus pink and temple gold.
// Royal's fields, limits and RSVP/blessings plumbing, plus family contacts,
// shagun (UPI) and a livestream link. The guest page and studio live in
// app/(templates)/lotus-wedding-invitation/components. Art: public/wedding-v3
// (see components/assets.ts), served from the repo, never from the CDN.
//
// Field mapping on the engine: recipientName = the bride, senderName = the
// groom, letter = the English invitation, endLine = the closing line,
// photos = ONE pool of up to 40 (story chapters and family cards point into it
// by 1-based index).
//
// Server twin: server/src/config/weddingDays/lotus-wedding-invitation.ts; keys and limits
// must match (valentineDays.test.ts pins them). Light themes only.

import type { DayConfig, LovePhoto } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { meta } from "./_shared";
import { LIGHT_THEMES } from "../../_wedding/themes";
import { WEDDING_TIER_LIMITS, type WeddingEvent } from "../../_wedding/types";

const SLUG = "lotus-wedding-invitation" as const;
export const LW_LIMITS = WEDDING_TIER_LIMITS[SLUG];

export const LW_THEME_LABELS: Record<string, string> = {
  blush: "Lotus Pink",
  champagne: "Temple Ivory",
  powder: "Pond Blue",
};

/**
 * Verified YouTube uploads (oEmbed 200 + embeddable, re-checked 2026-10-22,
 * wq-research.md §5). The shehnai plays by default: the temple-morning mood.
 */
export const LW_SONGS: readonly SongSuggestion[] = [
  { id: "OzEL4CwbPew", title: "Wedding Shehnai (Kanyadaan)", artist: "Ustad Bismillah Khan" },
  { id: "3qpxJEp4Ec4", title: "Kudmayi", artist: "Shahid Mallya" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "8XtXLVylOoU", title: "Saajanji Ghar Aaye", artist: "Alka Yagnik, Kumar Sanu" },
  { id: "1LVpuWpRs3I", title: "Din Shagna Da", artist: "Jasleen Royal" },
  { id: "V7LwfY5U5WI", title: "Ranjha", artist: "B Praak, Jasleen Royal" },
  { id: "-bNwqXvMuB8", title: "Mehndi Laga Ke Rakhna", artist: "Lata Mangeshkar, Udit Narayan" },
  { id: "jCEdTq3j-0U", title: "Gallan Goodiyaan", artist: "Dil Dhadakne Do" },
  { id: "lwLVJ0E8gN4", title: "Kabira (Encore)", artist: "Arijit Singh, Harshdeep Kaur" },
  { id: "Ptk_1Dc2iPY", title: "Canon in D", artist: "Brooklyn Duo" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];

/** The editor chrome (form sheet, top bar): ivory paper, lotus-leaf sage, lotus pink, gold. The guest page wears extras.theme. */
const THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FFFCF5 0%, #F7F1E4 55%, #EEF1E8 100%)",
  base: "#FBF7EE",
  paper: "#FFFDF8",
  glass: "rgba(255,253,248,.84)",
  ink: "#2A3A32",
  inkSoft: "#5F6E66",
  paperInk: "#2A3A32",
  accent: "#4E6E5D",
  accentDeep: "#2F4A3E",
  accentInk: "#FFFDF6",
  soft: "#EEF2EA",
  edge: "#DCCFAE",
  gold: "#C9A24A",
  dark: false,
  particles: ["🪷", "✨", "🪔"],
  confetti: ["#C9A24A", "#F1D58A", "#E0779A", "#6F8F7D"],
};

/** Four functions to start from (a Tamil–Punjabi wedding in Chennai); the sender can add up to eight. */
export const LW_DEMO_EVENTS: WeddingEvent[] = [
  { id: "haldi", title: "Haldi & Mehendi", date: "2027-02-10", time: "10:00", endTime: "14:00", venue: "The Courtyard, Taj Fisherman's Cove", address: "Covelong Beach, East Coast Road, Chennai", mapUrl: "", dressCode: "Yellows and greens", dressColor: "#F2C94C", note: "Turmeric, henna, filter coffee and a lot of laughter by the sea." },
  { id: "sangeet", title: "Sangeet", date: "2027-02-10", time: "19:00", endTime: "23:30", venue: "Fisherman's Cove Lawns", address: "Covelong Beach, East Coast Road, Chennai", mapUrl: "", dressCode: "Indo-western glam", dressColor: "#E86A92", note: "Two families, one dance floor: bhangra meets kuthu." },
  { id: "muhurtham", title: "Muhurtham (Wedding)", date: "2027-02-11", time: "07:30", endTime: "10:30", venue: "Sri Kapali Kalyana Mandapam", address: "Mylapore, Chennai", mapUrl: "", dressCode: "Traditional silks", dressColor: "#B8892E", note: "The thaali is tied at the muhurtham, 9:05 am. Breakfast is served from 7 am." },
  { id: "reception", title: "Reception", date: "2027-02-12", time: "19:30", endTime: "23:00", venue: "The Leela Palace", address: "MRC Nagar, Chennai", mapUrl: "", dressCode: "Evening formal", dressColor: "#6F8F7D", note: "Dinner, toasts and dancing with the newlyweds." },
];

/**
 * Demo photos (CC0 / Unsplash licence, media-src/templates/wedding/demo) ship IN THE REPO under
 * public/wedding-v3/lotus/demo, never on the CDN or S3. The engine and the server keep only https
 * links, so a draft stores them on the site's own domain; every render maps that back to the
 * same-origin path (lwLocalUrl), so local, staging and prod each serve their own copy.
 */
const SITE_ORIGIN = "https://subhsandesh.in";
const DEMO_BASE = `${SITE_ORIGIN}/wedding-v3/lotus/demo`;
const REPO_ART_RE = /^https:\/\/(?:www\.)?subhsandesh\.in(\/wedding-v3\/[^?#\s]+)$/i;
const LEGACY_DEMO_RE = /^https:\/\/cdn\.subhsandesh\.in\/gifts-media\/templates\/wedding\/demo\/(rw-(?:0[1-9]|1[0-8])\.webp)$/i;
/** A stored repo-art link → the same-origin path this host serves from public/. Anything else is unchanged. */
export const lwLocalUrl = (url: string): string => {
  const own = REPO_ART_RE.exec(url);
  if (own) return own[1];
  // Drafts saved before the demo photos moved into the repo still point at the old CDN copies.
  const old = LEGACY_DEMO_RE.exec(url);
  return old ? `/wedding-v3/lotus/demo/${old[1]}` : url;
};
/** The inverse, for anything the studio hands back: a same-origin repo path → the https link the engine keeps. */
export const lwStoredUrl = (url: string): string => (url.startsWith("/wedding-v3/") ? `${SITE_ORIGIN}${url}` : url);

/** 1–16 fill the gallery; 17 and 18 are story chapters 3 and 4 (so they stay out of it). */
export const LW_DEMO_PHOTOS: LovePhoto[] = [
  { url: `${DEMO_BASE}/rw-01.webp`, w: 1024, h: 768, cropX: 50, cropY: 50, caption: "The bride" },
  { url: `${DEMO_BASE}/rw-02.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-03.webp`, w: 1024, h: 768, cropX: 50, cropY: 50, caption: "Haldi morning", span: "wide" },
  { url: `${DEMO_BASE}/rw-04.webp`, w: 1400, h: 1047, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-05.webp`, w: 680, h: 1024, cropX: 50, cropY: 35, caption: "Pheras", span: "tall" },
  { url: `${DEMO_BASE}/rw-06.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-07.webp`, w: 1024, h: 683, cropX: 50, cropY: 50, caption: "First dance" },
  { url: `${DEMO_BASE}/rw-08.webp`, w: 684, h: 1024, cropX: 50, cropY: 35 },
  { url: `${DEMO_BASE}/rw-09.webp`, w: 931, h: 1024, cropX: 50, cropY: 35 },
  { url: `${DEMO_BASE}/rw-10.webp`, w: 1050, h: 1400, cropX: 50, cropY: 35, caption: "Sangeet night", span: "tall" },
  { url: `${DEMO_BASE}/rw-11.webp`, w: 1024, h: 487, cropX: 50, cropY: 50, caption: "Mehendi", span: "wide" },
  { url: `${DEMO_BASE}/rw-12.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-13.webp`, w: 1024, h: 683, cropX: 50, cropY: 50, caption: "Shringar" },
  { url: `${DEMO_BASE}/rw-14.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-15.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-16.webp`, w: 683, h: 1024, cropX: 50, cropY: 35 },
  { url: `${DEMO_BASE}/rw-17.webp`, w: 1400, h: 1050, cropX: 50, cropY: 50 },
  { url: `${DEMO_BASE}/rw-18.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
];

export interface LwExtras {
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
  contacts: { name: string; relation: string; phone: string }[];
  upiId: string;
  upiName: string;
  liveUrl: string;
  [k: string]: unknown;
}

const ev = (k: string, label: string, max: number, placeholder?: string) => ({ key: k, kind: "text" as const, label, max, placeholder });

export const lotusWeddingDay: DayConfig<LwExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Lotus Temple Wedding Invitation",
  maxPhotos: LW_LIMITS.photos,
  letterMax: 1500,
  letterMin: 20,
  asksQuestion: false,
  melody: "diya",
  photoAspect: 0.8,
  gifSlots: [],
  topBar: true,
  brandMark: "stacked",
  studio: "lotusWedding",
  // The studio draws every section itself, password included (keeps no plain section).
  // Edit stays after publishing: the owner's guest replies + blessings live in the form.
  studioForm: {
    ownAi: true,
    editAfterPublish: true,
    nav: [
      { id: "names", label: "The couple", emoji: "🪷" },
      { id: "details", label: "Functions", emoji: "🪔" },
      { id: "photos", label: "Photos", emoji: "📸" },
      { id: "letter", label: "Invitation", emoji: "✉️" },
      { id: "music", label: "Theme & music", emoji: "🎵" },
      { id: "finish", label: "Guests & more", emoji: "✦" },
    ],
  },
  music: {
    audioOnly: true,
    compact: true,
    suggestions: LW_SONGS,
    suggestionsNote: "Shehnai, filmi wedding songs and a few English ones · or paste any YouTube link",
  },
  extras: [
    { key: "theme", kind: "enum", label: "Theme", default: "champagne", hidden: true, options: LIGHT_THEMES.map((id) => ({ value: id, label: LW_THEME_LABELS[id] ?? id })) },
    { key: "lang", kind: "enum", label: "Opens in", default: "en", hidden: true, options: [{ value: "en", label: "English" }, { value: "hi", label: "हिन्दी" }] },
    { key: "nameOrder", kind: "enum", label: "Show names as", default: "bride", hidden: true, options: [{ value: "bride", label: "Bride first" }, { value: "groom", label: "Groom first" }] },
    { key: "hindiMessage", kind: "longtext", max: 700, label: "Invitation in Hindi", hidden: true },
    { key: "brideFamily", kind: "text", max: 120, label: "Bride's family", hidden: true },
    { key: "groomFamily", kind: "text", max: 120, label: "Groom's family", hidden: true },
    { key: "brideNote", kind: "text", max: 100, label: "Bride's family note", hidden: true },
    { key: "groomNote", kind: "text", max: 100, label: "Groom's family note", hidden: true },
    { key: "blessingsOf", kind: "text", max: 160, label: "With the blessings of", hidden: true },
    { key: "bridePhoto", kind: "number", min: 0, max: LW_LIMITS.photos, default: 0, label: "Bride's family photo", hidden: true },
    { key: "groomPhoto", kind: "number", min: 0, max: LW_LIMITS.photos, default: 0, label: "Groom's family photo", hidden: true },
    { key: "muhurat", kind: "text", max: 60, label: "Muhurat", hidden: true },
    { key: "hashtag", kind: "text", max: 40, label: "Wedding hashtag", hidden: true },
    {
      key: "events", kind: "objlist", maxItems: LW_LIMITS.events, minItems: 1, label: "Functions", itemTitle: "Function", hidden: true,
      item: [
        ev("id", "Id", 24), ev("title", "Name", 40), ev("date", "Date", 10), ev("time", "Start", 5), ev("endTime", "End", 5),
        ev("venue", "Venue", 80), ev("address", "Address", 140), ev("mapUrl", "Google Maps link", 400),
        ev("dressCode", "Dress code", 60), ev("dressColor", "Dress colour", 7), ev("note", "Note", 200),
      ],
    },
    {
      key: "story", kind: "objlist", maxItems: LW_LIMITS.story, label: "Our story", itemTitle: "Chapter", hidden: true,
      item: [ev("when", "When", 24), ev("title", "Title", 60), ev("line", "What happened", 240), { key: "photo", kind: "number", label: "Photo", min: 0, max: LW_LIMITS.photos, default: 0 }],
    },
    { key: "things", kind: "list", maxItems: LW_LIMITS.faq, itemMax: 180, label: "Good to know", hidden: true },
    { key: "gettingThere", kind: "longtext", max: 500, label: "Getting there", hidden: true },
    { key: "videoUrl", kind: "text", max: 200, label: "Pre-wedding film", hidden: true },
    { key: "rsvpBy", kind: "text", max: 10, label: "Reply by", input: "date", hidden: true },
    { key: "maxGuests", kind: "number", min: 1, max: 10, default: 4, label: "Guests per reply", hidden: true },
    { key: "rsvpMeal", kind: "bool", default: true, label: "Ask for meal preference", hidden: true },
    { key: "blessings", kind: "bool", default: true, label: "Blessings wall", hidden: true },
    { key: "invocation", kind: "bool", default: true, label: "Open with Shri Ganesh", hidden: true },
    {
      key: "contacts", kind: "objlist", maxItems: 4, label: "Family contacts", itemTitle: "Contact", hidden: true,
      item: [ev("name", "Name", 40), ev("relation", "Relation", 40), ev("phone", "Phone", 20)],
    },
    { key: "upiId", kind: "text", max: 60, label: "UPI ID for shagun", hidden: true },
    { key: "upiName", kind: "text", max: 60, label: "Name on the UPI account", hidden: true },
    { key: "liveUrl", kind: "text", max: 300, label: "Livestream link", hidden: true },
  ],
  theme: THEME,
  demo: {
    recipientName: "Ananya",
    senderName: "Rohan",
    petName: "",
    letter:
      "With the blessings of the Almighty and our elders, the Iyer and Malhotra families joyfully invite you to celebrate the wedding of Ananya and Rohan.\n\nThree days by the sea in Chennai: haldi in the sunshine, a sangeet under the stars and the sacred muhurtham at the mandapam. Your presence will make our celebration complete.",
    photos: LW_DEMO_PHOTOS.map((p) => ({ ...p })),
    gifs: {},
    music: true,
    musicMode: "youtube",
    musicYoutubeId: "OzEL4CwbPew",
    musicStart: 0,
    endLine: "With love and gratitude, the Iyer & Malhotra families",
    extras: {
      theme: "champagne",
      lang: "en",
      nameOrder: "bride",
      hindiMessage:
        "ईश्वर की असीम कृपा और बड़ों के आशीर्वाद से, अनन्या और रोहन के शुभ विवाह के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं। आपकी उपस्थिति ही हमारा सौभाग्य है।",
      brideFamily: "Mrs. Lakshmi & Mr. Venkatesh Iyer",
      groomFamily: "Mrs. Neelam & Mr. Rajiv Malhotra",
      brideNote: "Mylapore, Chennai",
      groomNote: "Vasant Vihar, New Delhi",
      blessingsOf: "Smt. Kamakshi Ammal & Late Shri R. Subramaniam Iyer",
      bridePhoto: 0,
      groomPhoto: 0,
      muhurat: "Muhurtham 9:05 to 10:15 am",
      hashtag: "#AnanyaRohanForever",
      events: LW_DEMO_EVENTS.map((e) => ({ ...e })),
      story: [
        { when: "2018", title: "A berth on the Grand Trunk Express", line: "Delhi to Chennai, thirty-three hours, one packet of murukku shared between two strangers. By Nagpur they had swapped playlists.", photo: 0 },
        { when: "2021", title: "Filter coffee and chai", line: "Bengaluru and Delhi, two cities and one rule: a video call every night, coffee for her, chai for him.", photo: 0 },
        { when: "2025", title: "The question at Marina Beach", line: "Sunrise, a jasmine string in his pocket and a ring tied into it. She said yes before he finished the sentence.", photo: 17 },
        { when: "2027", title: "Forever begins", line: "Now our two families become one. Come and bless us.", photo: 18 },
      ],
      things: [
        "Stay: Rooms for out-of-town guests are held at Taj Fisherman's Cove from 9 to 13 February.",
        "Muhurtham: It is an early-morning ceremony. Breakfast is served at the mandapam from 7 am.",
        "Shuttles: Cars run between the hotel and every venue, every 20 minutes.",
        "Weather: February in Chennai is warm, around 30°C by noon. Light silks and cottons are perfect.",
      ],
      gettingThere: "Chennai International Airport is 40 minutes from Covelong and 25 minutes from Mylapore. Our hospitality desk will meet you at arrivals and at Chennai Central station.",
      videoUrl: "",
      rsvpBy: "2027-01-15",
      maxGuests: 4,
      rsvpMeal: true,
      blessings: true,
      invocation: true,
      contacts: [
        { name: "Karthik Iyer", relation: "Bride's brother", phone: "+91 98400 00001" },
        { name: "Simran Malhotra", relation: "Groom's sister", phone: "+91 98100 00002" },
      ],
      upiId: "",
      upiName: "",
      liveUrl: "",
    },
  },
  copy: {
    recipientPlaceholder: "e.g. Meenakshi",
    senderPlaceholder: "e.g. Arjun",
    petNamePlaceholder: "",
    letterPlaceholder: "Together with their families, Ananya and Arjun request the honour of your presence at the celebration of their marriage…",
    letterHint: "The words your guests read first.",
    photosHint: "Any shape works. Tap a photo to resize it or set its focus. Drag to reorder.",
    captionHint: "caption — e.g. the roka",
    noteHint: "",
    endLinePlaceholder: "With love, the Sharma & Mehta families",
    endLineHint: "The closing line under the Shubh Vivah seal.",
    sheetTitle: "Your lotus temple invitation",
    sheetSub: "Describe your wedding and we'll fill in everything. Change any of it.",
    extrasTitle: "Functions",
    extrasSub: "Every function with its own map, timings and dress code.",
    publishing: "Getting your invitation ready…",
    storyTitle: "Describe your wedding 🪷",
    replyText: "",
  },
  share: { title: "The lamps are lit 🪷 You're invited to our wedding", accent: "#4E6E5D" },
};
