// ─── Pampas & Peony Wedding Invitation 🌸 (wedding tier, same limits as Royal) ───
//
// A boho-luxe stationery suite on handmade paper: a wax-sealed envelope that
// opens into a folded card, pampas grass in the breeze, the couple on a swing
// under a floral drape, gold line-art that draws itself. Same limits, RSVP and
// blessings plumbing as Royal; the guest page and studio live in
// app/(templates)/floral-wedding-invitation/components. Art: public/wedding-v3 (see
// components/assets.ts), served from the repo, never from the CDN.
//
// Field mapping on the engine: recipientName = the bride, senderName = the
// groom, letter = the English invitation, endLine = the closing line,
// photos = ONE pool of up to 40 (story chapters, family cards and the couple
// portrait point into it by 1-based index).
//
// Server twin: server/src/config/weddingDays/floral-wedding-invitation.ts; keys and limits
// must match (valentineDays.test.ts pins them). Light themes only.

import type { DayConfig, LovePhoto } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { meta } from "./_shared";
import { LIGHT_THEMES } from "../../_wedding/themes";
import { WEDDING_TIER_LIMITS, type WeddingEvent } from "../../_wedding/types";

const SLUG = "floral-wedding-invitation" as const;
export const FW_LIMITS = WEDDING_TIER_LIMITS[SLUG];
/** Family members guests can call / WhatsApp (extras.contacts). */
export const FW_CONTACTS_MAX = 4;

export const FW_THEME_LABELS: Record<string, string> = {
  blush: "Blush Pink",
  champagne: "Champagne",
  powder: "Powder Blue",
  maroon: "Royal Maroon & Gold",
  noir: "Black & Gold",
  emerald: "Emerald & Gold",
};

/** Verified YouTube uploads (oEmbed 200, re-checked 2026-10-22). Din Shagna Da (soft, pastel, the bride's entry) plays by default. */
export const FW_SONGS: readonly SongSuggestion[] = [
  { id: "1LVpuWpRs3I", title: "Din Shagna Da", artist: "Jasleen Royal" },
  { id: "V7LwfY5U5WI", title: "Ranjha", artist: "B Praak, Jasleen Royal" },
  { id: "OzEL4CwbPew", title: "Wedding Shehnai (Kanyadaan)", artist: "Ustad Bismillah Khan" },
  { id: "8XtXLVylOoU", title: "Saajanji Ghar Aaye", artist: "Alka Yagnik, Kumar Sanu" },
  { id: "3qpxJEp4Ec4", title: "Kudmayi", artist: "Shahid Mallya" },
  { id: "-bNwqXvMuB8", title: "Mehndi Laga Ke Rakhna", artist: "Lata Mangeshkar, Udit Narayan" },
  { id: "jCEdTq3j-0U", title: "Gallan Goodiyaan", artist: "Dil Dhadakne Do" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "lwLVJ0E8gN4", title: "Kabira (Encore)", artist: "Arijit Singh, Harshdeep Kaur" },
  { id: "Ptk_1Dc2iPY", title: "Canon in D", artist: "Brooklyn Duo" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];

/** The editor chrome (form sheet, top bar): handmade ivory paper, dusty-rose ink, gold foil. The guest page wears extras.theme. */
const THEME: DayTheme = {
  bg: "linear-gradient(180deg, #FFFBF6 0%, #F8EFE6 60%, #F1E4D6 100%)",
  base: "#FAF3EA",
  paper: "#FFFDF9",
  glass: "rgba(255,253,249,.84)",
  ink: "#3D2A24",
  inkSoft: "#7D655B",
  paperInk: "#3D2A24",
  accent: "#9E5A62",
  accentDeep: "#7A3F47",
  accentInk: "#FFF8F3",
  soft: "#F5E8DE",
  edge: "#E6D3C2",
  gold: "#B8924A",
  dark: false,
  particles: ["🌸", "🤍", "✨"],
  confetti: ["#B8924A", "#E9CF9A", "#E7B9B5", "#FFF3E6"],
};

/** Five functions to start from; the sender can add up to eight (Roka, Baraat, Cocktail…). */
export const FW_DEMO_EVENTS: WeddingEvent[] = [
  { id: "haldi", title: "Haldi", date: "2027-02-18", time: "10:30", endTime: "13:30", venue: "The Peony Courtyard, Amber Valley Farms", address: "Kunda, Amer Road, Jaipur", mapUrl: "", dressCode: "Shades of yellow", dressColor: "#F2C94C", note: "Turmeric, marigolds and a lot of laughter. Wear something you don't mind getting a little yellow." },
  { id: "mehendi", title: "Mehendi", date: "2027-02-18", time: "16:30", endTime: "20:30", venue: "The Pampas Lawn, Amber Valley Farms", address: "Kunda, Amer Road, Jaipur", mapUrl: "", dressCode: "Sage and blush florals", dressColor: "#9DB89A", note: "Henna, masala chai and a dholki under the fairy lights." },
  { id: "sangeet", title: "Sangeet", date: "2027-02-19", time: "19:30", endTime: "23:59", venue: "The Glasshouse, Amber Valley Farms", address: "Kunda, Amer Road, Jaipur", mapUrl: "", dressCode: "Indo-western glam", dressColor: "#C9A0B4", note: "Both families have been rehearsing for months. Consider yourself warned." },
  { id: "wedding", title: "Wedding (Pheras)", date: "2027-02-20", time: "18:30", endTime: "23:30", venue: "The Swing Garden, Amber Valley Farms", address: "Kunda, Amer Road, Jaipur", mapUrl: "", dressCode: "Pastels and ivory", dressColor: "#F1E6D6", note: "The baraat arrives at 6:30 pm; the pheras begin at the shubh muhurat, 8:41 pm." },
  { id: "reception", title: "Reception", date: "2027-02-21", time: "19:30", endTime: "23:30", venue: "The Ivory Ballroom", address: "Tonk Road, Jaipur", mapUrl: "", dressCode: "Black tie, a touch of gold", dressColor: "#2A2622", note: "Dinner, toasts and dancing to celebrate the newlyweds." },
];

/** Demo photos (CC0 / Unsplash licence, ATTRIBUTION.md), hosted on our CDN. */
const DEMO_CDN = "https://cdn.subhsandesh.in/gifts-media/templates/wedding/demo";
export { DEMO_CDN as FW_DEMO_CDN };

/** 16 is the couple portrait under the floral drape; 17 and 18 are story chapters 3 and 4; the rest fill the gallery. */
export const FW_DEMO_PHOTOS: LovePhoto[] = [
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

export interface FwExtras {
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

export const floralWeddingDay: DayConfig<FwExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Pampas & Peony Wedding Invitation",
  maxPhotos: FW_LIMITS.photos,
  letterMax: 1500,
  letterMin: 20,
  asksQuestion: false,
  melody: "diya",
  photoAspect: 0.8,
  gifSlots: [],
  topBar: true,
  brandMark: "stacked",
  studio: "floralWedding",
  // The studio draws every section itself, password included (keeps no plain section).
  // Edit stays after publishing: the owner's guest replies + blessings live in the form.
  studioForm: {
    ownAi: true,
    editAfterPublish: true,
    nav: [
      { id: "names", label: "The couple", emoji: "🌸" },
      { id: "details", label: "Functions", emoji: "🪔" },
      { id: "photos", label: "Photos", emoji: "📸" },
      { id: "letter", label: "Invitation", emoji: "✉️" },
      { id: "music", label: "Theme & music", emoji: "🎵" },
      { id: "guests", label: "For guests", emoji: "💌" },
      { id: "finish", label: "More details", emoji: "✦" },
    ],
  },
  music: {
    audioOnly: true,
    compact: true,
    suggestions: FW_SONGS,
    suggestionsNote: "Soft filmi wedding songs, the shehnai and a few English ones · or paste any YouTube link",
  },
  extras: [
    { key: "theme", kind: "enum", label: "Theme", default: "champagne", hidden: true, options: LIGHT_THEMES.map((id) => ({ value: id, label: FW_THEME_LABELS[id] ?? id })) },
    { key: "lang", kind: "enum", label: "Opens in", default: "en", hidden: true, options: [{ value: "en", label: "English" }, { value: "hi", label: "हिन्दी" }] },
    { key: "nameOrder", kind: "enum", label: "Show names as", default: "bride", hidden: true, options: [{ value: "bride", label: "Bride first" }, { value: "groom", label: "Groom first" }] },
    { key: "hindiMessage", kind: "longtext", max: 700, label: "Invitation in Hindi", hidden: true },
    { key: "brideFamily", kind: "text", max: 120, label: "Bride's family", hidden: true },
    { key: "groomFamily", kind: "text", max: 120, label: "Groom's family", hidden: true },
    { key: "brideNote", kind: "text", max: 100, label: "Bride's family note", hidden: true },
    { key: "groomNote", kind: "text", max: 100, label: "Groom's family note", hidden: true },
    { key: "blessingsOf", kind: "text", max: 160, label: "With the blessings of", hidden: true },
    { key: "bridePhoto", kind: "number", min: 0, max: FW_LIMITS.photos, default: 0, label: "Bride's family photo", hidden: true },
    { key: "groomPhoto", kind: "number", min: 0, max: FW_LIMITS.photos, default: 0, label: "Groom's family photo", hidden: true },
    { key: "couplePhoto", kind: "number", min: 0, max: FW_LIMITS.photos, default: 0, label: "Couple portrait", hidden: true },
    { key: "muhurat", kind: "text", max: 60, label: "Muhurat", hidden: true },
    { key: "hashtag", kind: "text", max: 40, label: "Wedding hashtag", hidden: true },
    {
      key: "events", kind: "objlist", maxItems: FW_LIMITS.events, minItems: 1, label: "Functions", itemTitle: "Function", hidden: true,
      item: [
        ev("id", "Id", 24), ev("title", "Name", 40), ev("date", "Date", 10), ev("time", "Start", 5), ev("endTime", "End", 5),
        ev("venue", "Venue", 80), ev("address", "Address", 140), ev("mapUrl", "Google Maps link", 400),
        ev("dressCode", "Dress code", 60), ev("dressColor", "Dress colour", 7), ev("note", "Note", 200),
      ],
    },
    {
      key: "story", kind: "objlist", maxItems: FW_LIMITS.story, label: "Our story", itemTitle: "Chapter", hidden: true,
      item: [ev("when", "When", 24), ev("title", "Title", 60), ev("line", "What happened", 240), { key: "photo", kind: "number", label: "Photo", min: 0, max: FW_LIMITS.photos, default: 0 }],
    },
    { key: "things", kind: "list", maxItems: FW_LIMITS.faq, itemMax: 180, label: "Good to know", hidden: true },
    { key: "gettingThere", kind: "longtext", max: 500, label: "Getting there", hidden: true },
    { key: "videoUrl", kind: "text", max: 200, label: "Pre-wedding film", hidden: true },
    { key: "rsvpBy", kind: "text", max: 10, label: "Reply by", input: "date", hidden: true },
    { key: "maxGuests", kind: "number", min: 1, max: 10, default: 4, label: "Guests per reply", hidden: true },
    { key: "rsvpMeal", kind: "bool", default: true, label: "Ask for meal preference", hidden: true },
    { key: "blessings", kind: "bool", default: true, label: "Blessings wall", hidden: true },
    { key: "invocation", kind: "bool", default: true, label: "Shri Ganesh on the invitation", hidden: true },
    {
      key: "contacts", kind: "objlist", maxItems: FW_CONTACTS_MAX, label: "Contact persons", itemTitle: "Contact", hidden: true,
      item: [ev("name", "Name", 40), ev("relation", "Relation", 40), ev("phone", "Phone", 20)],
    },
    { key: "upiId", kind: "text", max: 80, label: "Shagun UPI ID", hidden: true },
    { key: "upiName", kind: "text", max: 60, label: "Shagun UPI name", hidden: true },
    { key: "liveUrl", kind: "text", max: 300, label: "Livestream link", hidden: true },
  ],
  theme: THEME,
  demo: {
    recipientName: "Saanvi",
    senderName: "Advait",
    petName: "",
    letter:
      "Together with their families, Saanvi and Advait joyfully invite you to celebrate their wedding.\n\nThree days among the pampas and peonies of Jaipur: a haldi in the sunshine, a sangeet that will run far too late, and the seven pheras under the evening sky. It would not be complete without you.",
    photos: FW_DEMO_PHOTOS.map((p) => ({ ...p })),
    gifs: {},
    music: true,
    musicMode: "youtube",
    musicYoutubeId: "1LVpuWpRs3I",
    musicStart: 0,
    endLine: "With love, the Malhotra & Kapoor families",
    extras: {
      theme: "champagne",
      lang: "en",
      nameOrder: "bride",
      hindiMessage:
        "परिवारों के आशीर्वाद से, सान्वी और अद्वैत के शुभ विवाह के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं। आपकी उपस्थिति ही हमारा सौभाग्य है।",
      brideFamily: "Mrs. Ritu & Mr. Alok Malhotra",
      groomFamily: "Mrs. Shalini & Mr. Rajeev Kapoor",
      brideNote: "Jaipur",
      groomNote: "New Delhi",
      blessingsOf: "Smt. Sushila Devi & Late Shri Harish Chandra Malhotra",
      bridePhoto: 0,
      groomPhoto: 0,
      couplePhoto: 16,
      muhurat: "Shubh muhurat 8:41 pm",
      hashtag: "#SaanviWedsAdvait",
      events: FW_DEMO_EVENTS.map((e) => ({ ...e })),
      story: [
        { when: "2018", title: "A borrowed umbrella", line: "Monsoon in Pune, one umbrella and two strangers at a bus stop. He walked her home and forgot to ask for it back.", photo: 0 },
        { when: "2021", title: "Letters across the sea", line: "She moved to Edinburgh for her master's. He wrote to her every Sunday, on paper, as if it were 1990.", photo: 0 },
        { when: "2025", title: "A ring among the pampas", line: "Sunset in Jaisalmer, the dunes turning gold. He knelt so fast he forgot the speech he had practised for weeks.", photo: 17 },
        { when: "2027", title: "Forever begins", line: "Now our families become one. Come and bless us.", photo: 18 },
      ],
      things: [
        "Stay: Rooms are held at Amber Valley Farms from 17 to 21 Feb. Just tell us your dates.",
        "Weather: Jaipur evenings in February are cool, so bring a shawl.",
        "Getting around: Shuttles leave the city hotel for the farm every hour from 9 am.",
        "Little ones: Children are welcome; there's a play tent by the lawn.",
      ],
      gettingThere: "Jaipur International Airport is 40 minutes from Amber Valley Farms. Our hospitality desk will meet you at arrivals and at Jaipur Junction, and shuttles run between the city hotel and the farm all weekend.",
      videoUrl: "",
      rsvpBy: "2027-01-20",
      maxGuests: 4,
      rsvpMeal: true,
      blessings: true,
      invocation: true,
      contacts: [
        { name: "Rohan Malhotra", relation: "Saanvi's brother", phone: "+91 90000 00001" },
        { name: "Neha Kapoor", relation: "Advait's sister", phone: "+91 90000 00002" },
      ],
      upiId: "",
      upiName: "",
      liveUrl: "",
    },
  },
  copy: {
    recipientPlaceholder: "e.g. Saanvi",
    senderPlaceholder: "e.g. Advait",
    petNamePlaceholder: "",
    letterPlaceholder: "Together with their families, Saanvi and Advait request the pleasure of your company at the celebration of their marriage…",
    letterHint: "The words your guests read first.",
    photosHint: "Any shape works. Tap a photo to resize it or set its focus. Drag to reorder.",
    captionHint: "caption — e.g. the roka",
    noteHint: "",
    endLinePlaceholder: "With love, the Sharma & Mehta families",
    endLineHint: "The closing line under the wax seal at the very end.",
    sheetTitle: "Your pampas & peony invitation",
    sheetSub: "Describe your wedding and we'll fill in everything. Change any of it.",
    extrasTitle: "Functions",
    extrasSub: "Every function with its own map, timings and dress code.",
    publishing: "Getting your invitation ready…",
    storyTitle: "Describe your wedding 🌸",
    replyText: "",
  },
  share: { title: "Pampas, peonies and our wedding 🌸 You're invited", accent: "#9E5A62" },
};
