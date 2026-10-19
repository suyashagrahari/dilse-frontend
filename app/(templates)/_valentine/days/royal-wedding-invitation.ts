// ─── Royal Wedding Invitation 👑 ($20, the flagship wedding tier) ─────────────
//
// A cinematic royal palace experience on the engine: palace gates swing open
// (light spills out, petals fall, the shehnai starts), the couple's crest
// stamps in gold foil, then one long royal scroll: the invitation in English
// and Hindi, the families, a flip countdown with the muhurat, the story told
// in chapters, every function (dress-code swatch, map, calendar), an optional
// pre-wedding film, a 40-photo masonry gallery in arched foil frames, good to
// know, RSVP per function (headcount + meal + a note), a blessings wall and a
// diya-lantern finale with the "Shubh Vivah" seal.
//
// Field mapping on the engine: recipientName = the bride, senderName = the
// groom (the wedding kit's RSVP mails read them as the couple), letter = the
// English invitation, endLine = the closing line, photos = ONE pool of up to
// 40 (the gallery, plus the story chapters and family cards, which point into
// it by 1-based index and are then left out of the gallery).
//
// Server twin: server/src/config/valentineDays.ts ("royal-wedding-invitation");
// keys and limits must match (valentineDays.test.ts pins them).

import type { DayConfig, LovePhoto } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { meta } from "./_shared";
import { WEDDING_THEME_IDS } from "../../_wedding/themes";
import { WEDDING_TIER_LIMITS, type WeddingEvent } from "../../_wedding/types";

const SLUG = "royal-wedding-invitation" as const;
export const RW_LIMITS = WEDDING_TIER_LIMITS[SLUG];

export const RW_THEME_LABELS: Record<string, string> = {
  blush: "Blush Pink",
  champagne: "Champagne",
  powder: "Powder Blue",
  maroon: "Royal Maroon & Gold",
  noir: "Black & Gold",
  emerald: "Emerald & Gold",
};

/** Verified YouTube uploads (oEmbed 200 + embeddable, 2026-10-19). The shehnai plays by default. */
export const RW_SONGS: readonly SongSuggestion[] = [
  { id: "OzEL4CwbPew", title: "Wedding Shehnai (Kanyadaan)", artist: "Ustad Bismillah Khan" },
  { id: "1LVpuWpRs3I", title: "Din Shagna Da", artist: "Jasleen Royal" },
  { id: "8XtXLVylOoU", title: "Saajanji Ghar Aaye", artist: "Alka Yagnik, Kumar Sanu" },
  { id: "3qpxJEp4Ec4", title: "Kudmayi", artist: "Shahid Mallya" },
  { id: "-bNwqXvMuB8", title: "Mehndi Laga Ke Rakhna", artist: "Lata Mangeshkar, Udit Narayan" },
  { id: "jCEdTq3j-0U", title: "Gallan Goodiyaan", artist: "Dil Dhadakne Do" },
  { id: "V7LwfY5U5WI", title: "Ranjha", artist: "B Praak, Jasleen Royal" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "lwLVJ0E8gN4", title: "Kabira (Encore)", artist: "Arijit Singh, Harshdeep Kaur" },
  { id: "Ptk_1Dc2iPY", title: "Canon in D", artist: "Brooklyn Duo" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];

/** The editor chrome (form sheet, top bar): ivory paper, maroon ink, gold. The guest page wears extras.theme. */
const THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FFFBF3 0%, #F8EEDD 60%, #F1E2C6 100%)",
  base: "#FBF4E6",
  paper: "#FFFDF8",
  glass: "rgba(255,253,248,.82)",
  ink: "#3B0F18",
  inkSoft: "#7A5048",
  paperInk: "#3B0F18",
  accent: "#8E1B2E",
  accentDeep: "#5E0F1E",
  accentInk: "#FFF6E3",
  soft: "#F6E7CF",
  edge: "#E3CDA6",
  gold: "#C9A24A",
  dark: false,
  particles: ["✨", "🌼", "🪔"],
  confetti: ["#C9A24A", "#E9CF7A", "#8E1B2E", "#FFF3C4"],
};

/** Five functions to start from; the sender can add up to eight (Roka, Baraat, Cocktail…). */
export const RW_DEMO_EVENTS: WeddingEvent[] = [
  { id: "haldi", title: "Haldi", date: "2027-02-10", time: "10:00", endTime: "13:00", venue: "The Courtyard, Jagmandir", address: "Lake Pichola, Udaipur", mapUrl: "", dressCode: "Shades of yellow", dressColor: "#F2C94C", note: "A morning of turmeric, laughter and sunshine. Wear yellow and be ready to get a little messy." },
  { id: "mehendi", title: "Mehendi", date: "2027-02-10", time: "16:30", endTime: "20:00", venue: "Zenana Mahal Lawns", address: "City Palace, Udaipur", mapUrl: "", dressCode: "Greens and bright florals", dressColor: "#4F9B6A", note: "Henna, music and plenty of chai. Come get your hands painted." },
  { id: "sangeet", title: "Sangeet", date: "2027-02-11", time: "19:30", endTime: "23:30", venue: "Durbar Hall", address: "Fateh Prakash Palace, Udaipur", mapUrl: "", dressCode: "Indo-western glam", dressColor: "#7B3FA0", note: "Music, dance performances and family rivalries settled on the dance floor." },
  { id: "wedding", title: "Wedding (Pheras)", date: "2027-02-12", time: "19:00", endTime: "23:30", venue: "Jagmandir Island Palace", address: "Lake Pichola, Udaipur", mapUrl: "", dressCode: "Traditional festive", dressColor: "#A3122B", note: "The baraat arrives at 7 pm; the pheras begin at the shubh muhurat, 9:15 pm." },
  { id: "reception", title: "Reception", date: "2027-02-13", time: "20:00", endTime: "23:59", venue: "The Leela Palace", address: "Lake Pichola, Udaipur", mapUrl: "", dressCode: "Black tie", dressColor: "#1C1C24", note: "Dinner, toasts and dancing to celebrate the newlyweds." },
];

/** Demo photos (CC0 / Unsplash licence, ATTRIBUTION.md), hosted on our CDN. */
const DEMO_CDN = "https://cdn.subhsandesh.in/gifts-media/templates/wedding/demo";
export { DEMO_CDN as RW_DEMO_CDN };

/** 1–16 fill the gallery; 17 and 18 are story chapters 3 and 4 (so they stay out of it). */
export const RW_DEMO_PHOTOS: LovePhoto[] = [
  { url: `${DEMO_CDN}/rw-01.webp`, w: 1024, h: 768, cropX: 50, cropY: 50, caption: "The bride" },
  { url: `${DEMO_CDN}/rw-02.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-03.webp`, w: 1024, h: 768, cropX: 50, cropY: 50, caption: "Haldi morning", span: "wide" },
  { url: `${DEMO_CDN}/rw-04.webp`, w: 1400, h: 1047, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-05.webp`, w: 680, h: 1024, cropX: 50, cropY: 35, caption: "Pheras", span: "tall" },
  { url: `${DEMO_CDN}/rw-06.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-07.webp`, w: 1024, h: 683, cropX: 50, cropY: 50, caption: "First dance" },
  { url: `${DEMO_CDN}/rw-08.webp`, w: 684, h: 1024, cropX: 50, cropY: 35 },
  { url: `${DEMO_CDN}/rw-09.webp`, w: 931, h: 1024, cropX: 50, cropY: 35 },
  { url: `${DEMO_CDN}/rw-10.webp`, w: 1050, h: 1400, cropX: 50, cropY: 35, caption: "Sangeet night", span: "tall" },
  { url: `${DEMO_CDN}/rw-11.webp`, w: 1024, h: 487, cropX: 50, cropY: 50, caption: "Mehendi", span: "wide" },
  { url: `${DEMO_CDN}/rw-12.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-13.webp`, w: 1024, h: 683, cropX: 50, cropY: 50, caption: "Shringar" },
  { url: `${DEMO_CDN}/rw-14.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-15.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-16.webp`, w: 683, h: 1024, cropX: 50, cropY: 35 },
  { url: `${DEMO_CDN}/rw-17.webp`, w: 1400, h: 1050, cropX: 50, cropY: 50 },
  { url: `${DEMO_CDN}/rw-18.webp`, w: 1024, h: 683, cropX: 50, cropY: 50 },
];

export interface RwExtras {
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
  [k: string]: unknown;
}

const ev = (k: string, label: string, max: number, placeholder?: string) => ({ key: k, kind: "text" as const, label, max, placeholder });

export const royalWeddingDay: DayConfig<RwExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Royal Wedding Invitation",
  maxPhotos: RW_LIMITS.photos,
  letterMax: 1500,
  letterMin: 20,
  asksQuestion: false,
  melody: "diya",
  photoAspect: 0.8,
  gifSlots: [],
  topBar: true,
  brandMark: "stacked",
  studio: "royalWedding",
  // The studio draws every section itself, password included (keeps no plain section).
  // Edit stays after publishing: the owner's guest replies + blessings live in the form.
  studioForm: {
    ownAi: true,
    editAfterPublish: true,
    nav: [
      { id: "names", label: "The couple", emoji: "👑" },
      { id: "details", label: "Functions", emoji: "🪔" },
      { id: "photos", label: "Photos", emoji: "📸" },
      { id: "letter", label: "Invitation", emoji: "✉️" },
      { id: "music", label: "Theme & music", emoji: "🎵" },
      { id: "finish", label: "More details", emoji: "✦" },
    ],
  },
  music: {
    audioOnly: true,
    compact: true,
    suggestions: RW_SONGS,
    suggestionsNote: "Shehnai, filmi wedding songs and a few English ones · or paste any YouTube link",
  },
  extras: [
    { key: "theme", kind: "enum", label: "Theme", default: "maroon", hidden: true, options: WEDDING_THEME_IDS.map((id) => ({ value: id, label: RW_THEME_LABELS[id] ?? id })) },
    { key: "lang", kind: "enum", label: "Opens in", default: "en", hidden: true, options: [{ value: "en", label: "English" }, { value: "hi", label: "हिन्दी" }] },
    { key: "nameOrder", kind: "enum", label: "Show names as", default: "bride", hidden: true, options: [{ value: "bride", label: "Bride first" }, { value: "groom", label: "Groom first" }] },
    { key: "hindiMessage", kind: "longtext", max: 700, label: "Invitation in Hindi", hidden: true },
    { key: "brideFamily", kind: "text", max: 120, label: "Bride's family", hidden: true },
    { key: "groomFamily", kind: "text", max: 120, label: "Groom's family", hidden: true },
    { key: "brideNote", kind: "text", max: 100, label: "Bride's family note", hidden: true },
    { key: "groomNote", kind: "text", max: 100, label: "Groom's family note", hidden: true },
    { key: "blessingsOf", kind: "text", max: 160, label: "With the blessings of", hidden: true },
    { key: "bridePhoto", kind: "number", min: 0, max: RW_LIMITS.photos, default: 0, label: "Bride's family photo", hidden: true },
    { key: "groomPhoto", kind: "number", min: 0, max: RW_LIMITS.photos, default: 0, label: "Groom's family photo", hidden: true },
    { key: "muhurat", kind: "text", max: 60, label: "Muhurat", hidden: true },
    { key: "hashtag", kind: "text", max: 40, label: "Wedding hashtag", hidden: true },
    {
      key: "events", kind: "objlist", maxItems: RW_LIMITS.events, minItems: 1, label: "Functions", itemTitle: "Function", hidden: true,
      item: [
        ev("id", "Id", 24), ev("title", "Name", 40), ev("date", "Date", 10), ev("time", "Start", 5), ev("endTime", "End", 5),
        ev("venue", "Venue", 80), ev("address", "Address", 140), ev("mapUrl", "Google Maps link", 400),
        ev("dressCode", "Dress code", 60), ev("dressColor", "Dress colour", 7), ev("note", "Note", 200),
      ],
    },
    {
      key: "story", kind: "objlist", maxItems: RW_LIMITS.story, label: "Our story", itemTitle: "Chapter", hidden: true,
      item: [ev("when", "When", 24), ev("title", "Title", 60), ev("line", "What happened", 240), { key: "photo", kind: "number", label: "Photo", min: 0, max: RW_LIMITS.photos, default: 0 }],
    },
    { key: "things", kind: "list", maxItems: RW_LIMITS.faq, itemMax: 180, label: "Good to know", hidden: true },
    { key: "gettingThere", kind: "longtext", max: 500, label: "Getting there", hidden: true },
    { key: "videoUrl", kind: "text", max: 200, label: "Pre-wedding film", hidden: true },
    { key: "rsvpBy", kind: "text", max: 10, label: "Reply by", input: "date", hidden: true },
    { key: "maxGuests", kind: "number", min: 1, max: 10, default: 4, label: "Guests per reply", hidden: true },
    { key: "rsvpMeal", kind: "bool", default: true, label: "Ask for meal preference", hidden: true },
    { key: "blessings", kind: "bool", default: true, label: "Blessings wall", hidden: true },
  ],
  theme: THEME,
  demo: {
    recipientName: "Aanya",
    senderName: "Vihaan",
    petName: "",
    letter:
      "By the grace of the Almighty and with the blessings of our elders, the Rathore and Singhania families joyfully invite you to the wedding of Aanya and Vihaan.\n\nFive days by Lake Pichola, a little haldi, a lot of dancing and the seven pheras under the stars. Your presence is our greatest honour.",
    photos: RW_DEMO_PHOTOS.map((p) => ({ ...p })),
    gifs: {},
    music: true,
    musicMode: "youtube",
    musicYoutubeId: "OzEL4CwbPew",
    musicStart: 0,
    endLine: "With love and gratitude, the Rathore & Singhania families",
    extras: {
      theme: "maroon",
      lang: "en",
      nameOrder: "bride",
      hindiMessage:
        "सर्वशक्तिमान की कृपा और बड़ों के आशीर्वाद से, आन्या और विहान के शुभ विवाह के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं। आपकी उपस्थिति ही हमारा सौभाग्य है।",
      brideFamily: "Mrs. Meera & Mr. Raghuveer Singh Rathore",
      groomFamily: "Mrs. Nandini & Mr. Arvind Singhania",
      brideNote: "Udaipur",
      groomNote: "Jaipur",
      blessingsOf: "Smt. Kamla Devi & Late Shri Bhanwar Singh Rathore",
      bridePhoto: 0,
      groomPhoto: 0,
      muhurat: "Shubh muhurat 9:15 pm",
      hashtag: "#AanyaWedsVihaan",
      events: RW_DEMO_EVENTS.map((e) => ({ ...e })),
      story: [
        { when: "2019", title: "Two strangers at a book fair", line: "We reached for the same copy of a Ruskin Bond. Neither of us let go, so we split the bill and the book.", photo: 0 },
        { when: "2021", title: "The long-distance years", line: "Jaipur to Bengaluru, two time zones of busy, one rule: never sleep on a fight, never skip the goodnight call.", photo: 0 },
        { when: "2025", title: "The question by the lake", line: "Sunset at Lake Pichola, a ring hidden in a kulhad of chai. She said yes before he could finish the sentence.", photo: 17 },
        { when: "2027", title: "Forever begins", line: "Now our families become one. Come and bless us.", photo: 18 },
      ],
      things: [
        "Stay: Rooms for out-of-town guests are held at The Leela Palace from 9 to 14 Feb.",
        "Weather: February evenings by the lake get cool, so bring a shawl.",
        "Getting around: Boats to Jagmandir leave the City Palace jetty every 15 minutes from 6 pm.",
        "Contact: For anything at all, call Kabir (Vihaan's brother) on +91 98290 00000.",
      ],
      gettingThere: "Udaipur's Maharana Pratap Airport is 25 minutes from the city. Our hospitality desk will meet you at arrivals and at Udaipur City railway station.",
      videoUrl: "",
      rsvpBy: "2027-01-15",
      maxGuests: 4,
      rsvpMeal: true,
      blessings: true,
    },
  },
  copy: {
    recipientPlaceholder: "e.g. Ananya",
    senderPlaceholder: "e.g. Arjun",
    petNamePlaceholder: "",
    letterPlaceholder: "Together with their families, Ananya and Arjun request the honour of your presence at the celebration of their marriage…",
    letterHint: "The words your guests read first.",
    photosHint: "Any shape works. Tap a photo to resize it or set its focus. Drag to reorder.",
    captionHint: "caption — e.g. the roka",
    noteHint: "",
    endLinePlaceholder: "With love, the Sharma & Mehta families",
    endLineHint: "The closing line under the Shubh Vivah seal.",
    sheetTitle: "Your royal invitation",
    sheetSub: "Describe your wedding and we'll fill in everything. Change any of it.",
    extrasTitle: "Functions",
    extrasSub: "Every function with its own map, timings and dress code.",
    publishing: "Opening the palace gates…",
    storyTitle: "Describe your wedding 👑",
    replyText: "",
  },
  share: { title: "The palace gates are open 👑 You're invited", accent: "#7A1F2B" },
};
