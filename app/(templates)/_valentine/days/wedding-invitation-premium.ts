// ─── Wedding Invitation ✦ Premium ($10) — "The Lake Terrace" ─────────────────
//
// Tall gold French doors with etched glass swing inward onto a sunlit
// watercolour terrace over a lake: powder blue sky, ivory balustrades,
// champagne gold, flamingos, a pink gazebo, a peacock and lanterns (the
// owner's art, public/wedding-v3/template6 + template11 + openings/premium,
// served from the repo, never the CDN). Then one scroll: the couple, the
// invitation in English + Hindi, families, countdown, story, functions, venue,
// film, gallery, good to know, contacts, RSVP per function, blessings, shagun,
// share and a closing terrace. The guest page + studio live in
// app/(templates)/wedding-invitation-premium/components.
//
// Field mapping on the engine's shape:
//   recipientName = the bride · senderName = the groom · letter = the
//   invitation message · endLine = the closing thank-you · photos[0] = cover;
//   story chapters point into photos by 1-based index.
//
// DATA COMPATIBILITY: pages published before the rebuild store `order`,
// `motif`, `hindi`, `date`, `time`, `city`, `brideParents`, `groomParents`,
// `faqs` and story `text`. Those keys stay exactly as they were; every new key
// is optional with a default, and the renderer treats it as possibly absent.
// Dark theme ids (maroon/noir/emerald) stay valid in storage and render as the
// nearest light palette.
//
// Server twin: server/src/config/valentineDays.ts ("wedding-invitation-premium");
// keys and limits must match (valentineDays.test.ts pins them).

import type { DayConfig, LovePhoto } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { WEDDING_THEME_IDS, WEDDING_TIER_LIMITS } from "../../_wedding";
import { meta } from "./_shared";

const SLUG = "wedding-invitation-premium" as const;
export const WP_LIMITS = WEDDING_TIER_LIMITS[SLUG];

/** The three light palettes, by this template's own names. */
export const WP_THEME_LABELS: Record<string, string> = {
  powder: "Lake Blue",
  champagne: "Ivory & Gold",
  blush: "Flamingo Blush",
};

// ─── Music: Din Shagna Da by default (oEmbed-verified ids, wq-research.md §5) ─
export const WP_SONGS: readonly SongSuggestion[] = [
  { id: "1LVpuWpRs3I", title: "Din Shagna Da", artist: "Jasleen Royal · Phillauri" },
  { id: "Ptk_1Dc2iPY", title: "Canon in D (Cello & Piano)", artist: "Brooklyn Duo" },
  { id: "-bNwqXvMuB8", title: "Mehndi Laga Ke Rakhna", artist: "Lata Mangeshkar, Udit Narayan" },
  { id: "8XtXLVylOoU", title: "Saajanji Ghar Aaye", artist: "Alka Yagnik, Kumar Sanu" },
  { id: "jCEdTq3j-0U", title: "Gallan Goodiyaan", artist: "Dil Dhadakne Do" },
  { id: "3qpxJEp4Ec4", title: "Kudmayi", artist: "Shahid Mallya" },
  { id: "V7LwfY5U5WI", title: "Ranjha", artist: "B Praak, Jasleen Royal" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "lwLVJ0E8gN4", title: "Kabira (Encore)", artist: "Arijit Singh, Harshdeep Kaur" },
  { id: "OzEL4CwbPew", title: "Shehnai: Kanyadaan (slow, for the pheras)", artist: "Ustad Bismillah Khan" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];

// ─── Defaults for a function, by name (AI fill and "+ Add a function" use them) ─
export interface FunctionPreset {
  match: RegExp;
  title: string;
  dressCode: string;
  dressColor: string;
  note: string;
  /** Default start time when none is given. */
  time: string;
}
const NEUTRAL_WEDDING_NOTE = "Join us as we are married and begin our life together, surrounded by the people we love.";
export const FUNCTION_PRESETS: readonly FunctionPreset[] = [
  { match: /haldi|pithi|mayun|vatna/i, title: "Haldi", time: "10:00", dressCode: "Shades of yellow", dressColor: "#F2C94C", note: "A morning of turmeric, laughter and sunshine as the couple is blessed with haldi." },
  { match: /mehe?n?di|henna/i, title: "Mehendi", time: "16:00", dressCode: "Greens and bright florals", dressColor: "#4F9B6A", note: "Henna, music and plenty of chai. Come get your hands painted." },
  { match: /sangeet|garba|ladies/i, title: "Sangeet", time: "19:30", dressCode: "Indo-western glam", dressColor: "#7B3FA0", note: "An evening of music, dance and family rivalries settled on the dance floor." },
  { match: /cocktail/i, title: "Cocktail", time: "20:00", dressCode: "Cocktail chic", dressColor: "#1C1C24", note: "Drinks, music and dancing under the stars." },
  { match: /recep/i, title: "Reception", time: "20:00", dressCode: "Formal / black tie", dressColor: "#1C1C24", note: "Dinner, toasts and dancing to celebrate the newlyweds." },
  { match: /engage|roka|sagai|ring/i, title: "Engagement", time: "18:00", dressCode: "Festive pastels", dressColor: "#E86A92", note: "Rings, blessings and the first toast to the two of us." },
  { match: /church|ceremony|nikah|anand|muhurt|court|register/i, title: "Ceremony", time: "11:00", dressCode: "Elegant formal", dressColor: "#F3EBDD", note: NEUTRAL_WEDDING_NOTE },
  { match: /wedd|phera|vivah|shaadi|marri|lagna|kalyanam/i, title: "Wedding", time: "19:00", dressCode: "Traditional festive", dressColor: "#A3122B", note: "Join us as we take the seven pheras and begin our life together." },
];
/** The preset for a function's name; the pheras line only on a Hindu (Ganesha) invitation. */
export function presetFor(title: string, motif?: unknown): FunctionPreset | null {
  const t = title.trim();
  if (!t) return null;
  const p = FUNCTION_PRESETS.find((f) => f.match.test(t)) ?? null;
  if (p && p.title === "Wedding" && motif !== undefined && motif !== "ganesha") return { ...p, dressCode: "Elegant formal", dressColor: "#F3EBDD", note: NEUTRAL_WEDDING_NOTE };
  return p;
}

/** A short stable id for a new function (RSVPs refer to it; never derived from a later title edit). */
export function newEventId(title: string, taken: readonly string[]): string {
  const base = (title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event").slice(0, 24);
  let id = base;
  let n = 2;
  while (taken.includes(id)) id = `${base}-${n++}`;
  return id;
}

// ─── Demo photos: in the repo (public/wedding-v3/demo), never the CDN ────────
// The engine and the server keep only https links, so a draft stores them on
// the site's own domain; every render maps that back to the same-origin path
// (wpLocalUrl), so local, staging and prod each serve their own copy. Pages
// published before the rebuild keep their CDN links, which pass through.
const SITE_ORIGIN = "https://subhsandesh.in";
const REPO_ART_RE = /^https:\/\/(?:www\.)?subhsandesh\.in(\/wedding-v3\/[^?#\s]+)$/i;
export const wpLocalUrl = (url: string): string => {
  const m = REPO_ART_RE.exec(url);
  return m ? m[1] : url;
};
export const wpStoredUrl = (url: string): string => (url.startsWith("/wedding-v3/") ? `${SITE_ORIGIN}${url}` : url);

const ph = (file: string, w: number, h: number, extra: Partial<LovePhoto> = {}): LovePhoto => ({ url: `${SITE_ORIGIN}/wedding-v3/demo/${file}`, w, h, cropX: 50, cropY: 50, scale: 100, ...extra });
/** 1 = the cover (hero), 2–4 = story chapters, 5+ = the gallery (ends level at 2, 3 and 4 columns). */
export const DEMO_PHOTOS_WP: LovePhoto[] = [
  ph("rw-16.webp", 683, 1024, { cropY: 38, caption: "Ishita & Aarav" }),
  ph("rw-02.webp", 1024, 683),
  ph("rw-17.webp", 1400, 1050),
  ph("rw-18.webp", 1024, 683),
  ph("rw-13.webp", 1024, 683, { span: "wide", caption: "Shringar" }),
  ph("rw-01.webp", 1024, 768, { caption: "The bride" }),
  ph("rw-08.webp", 684, 1024, { span: "tall", cropY: 35 }),
  ph("rw-07.webp", 1024, 683, { caption: "First dance" }),
  ph("rw-05.webp", 680, 1024, { cropY: 35, caption: "Pheras" }),
  ph("rw-11.webp", 1024, 487, { caption: "Mehendi" }),
  ph("rw-12.webp", 1024, 683),
  ph("rw-09.webp", 931, 1024, { cropY: 35 }),
  ph("rw-03.webp", 1024, 768, { caption: "Chooda" }),
  ph("rw-15.webp", 1024, 683),
  ph("rw-06.webp", 1024, 683),
  ph("rw-14.webp", 1024, 683, { caption: "Henna" }),
];

// ─── Demo: Ishita & Aarav, a lakeside weekend in Udaipur ────────────────────
export const DEMO_EVENTS = [
  { id: "mehendi", title: "Mehendi", date: "2027-02-11", time: "15:00", endTime: "19:00", venue: "The Lake Terrace, Oberoi Udaivilas", address: "Haridasji Ki Magri, Udaipur, Rajasthan", mapUrl: "", dressCode: "Greens and bright florals", dressColor: "#4F9B6A", note: "Henna, folk music and chai as the sun sets over Lake Pichola." },
  { id: "haldi", title: "Haldi", date: "2027-02-12", time: "10:00", endTime: "13:00", venue: "The Courtyard Garden, Oberoi Udaivilas", address: "Haridasji Ki Magri, Udaipur, Rajasthan", mapUrl: "", dressCode: "Shades of yellow", dressColor: "#F2C94C", note: "Turmeric, marigolds and a lot of laughter. Be ready to get a little messy." },
  { id: "sangeet", title: "Sangeet", date: "2027-02-12", time: "19:30", endTime: "23:30", venue: "Durbar Hall, Fateh Prakash Palace", address: "City Palace Complex, Udaipur, Rajasthan", mapUrl: "", dressCode: "Indo-western glam", dressColor: "#7B3FA0", note: "Two families, one dance floor. Bring your best moves." },
  { id: "wedding", title: "Wedding", date: "2027-02-13", time: "18:30", endTime: "23:00", venue: "The Gazebo Lawns, Oberoi Udaivilas", address: "Haridasji Ki Magri, Udaipur, Rajasthan", mapUrl: "", dressCode: "Traditional festive", dressColor: "#C9A24A", note: "The baraat arrives at 6:30 pm; the pheras begin at the auspicious hour of 8:40 pm." },
  { id: "reception", title: "Reception", date: "2027-02-14", time: "20:00", endTime: "23:30", venue: "Jagmandir Island Palace", address: "Lake Pichola, Udaipur, Rajasthan", mapUrl: "", dressCode: "Black tie", dressColor: "#1C1C24", note: "Boats leave the City Palace jetty every fifteen minutes from 7:30 pm." },
];

export const DEMO_STORY = [
  { when: "2017 · Bengaluru", title: "Where it began", text: "A rainy evening, one umbrella and two strangers at the same bus stop. The bus never came; the conversation never ended.", photo: 2 },
  { when: "2024 · Udaipur", title: "The question", text: "On a boat on Lake Pichola at sunset, Aarav took out a ring. Ishita said yes before he finished the sentence.", photo: 3 },
  { when: "13 Feb 2027", title: "Forever begins", text: "Now our two families become one, on a terrace by the lake. Come and bless us.", photo: 4 },
];

export const DEMO_FAQS = [
  { title: "Where to stay", text: "Rooms are held for our guests at Oberoi Udaivilas and Fateh Prakash Palace until 31 December. Mention our names." },
  { title: "Weather", text: "February evenings by the lake are cool, around 14°C. Bring a shawl for the boat ride." },
  { title: "Little ones", text: "Children are very welcome. There is a play corner at every function." },
];

// ─── The editor chrome (sheet + top bar): powder blue, ivory, champagne gold ─
const theme: DayTheme = {
  bg: "linear-gradient(180deg, #F7FBFE 0%, #EEF5FA 55%, #F8F3E8 100%)",
  base: "#F4F8FB",
  paper: "#FFFEFB",
  glass: "rgba(255,254,251,.86)",
  ink: "#1F3346",
  inkSoft: "#5B6E80",
  paperInk: "#1F3346",
  accent: "#3E6A8A",
  accentDeep: "#284D69",
  accentInk: "#FFFDF6",
  soft: "#E8F1F7",
  edge: "#D9CBA6",
  gold: "#B8913E",
  dark: false,
  particles: ["🦩", "✨", "🌸"],
  confetti: ["#C9A24A", "#F1D58A", "#9CC3DE", "#F3B6C8"],
};

type Leaf = { key: string; label: string; kind: "text"; max: number };
const t = (key: string, label: string, max: number): Leaf => ({ key, label, kind: "text", max });

export const weddingPremiumDay: DayConfig = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Wedding Invitation ✦ Premium",
  maxPhotos: WP_LIMITS.photos,
  letterMax: 1200,
  letterMin: 20,
  asksQuestion: false,
  melody: "diya",
  photoAspect: 0.8,
  gifSlots: [],
  topBar: true,
  brandMark: "stacked",
  studio: "weddingPremium",
  // The studio draws every step itself (password included). Edit stays after
  // publishing: guest replies, blessings and personal links live in the form.
  studioForm: {
    ownAi: true,
    editAfterPublish: true,
    nav: [
      { id: "names", label: "The couple", emoji: "💍" },
      { id: "details", label: "Functions", emoji: "🪔" },
      { id: "photos", label: "Photos", emoji: "📸" },
      { id: "letter", label: "Invitation", emoji: "✉️" },
      { id: "story", label: "Story & families", emoji: "🌸" },
      { id: "guests", label: "Guest info", emoji: "🧭" },
      { id: "music", label: "Look & music", emoji: "🎵" },
      { id: "finish", label: "RSVP & send", emoji: "✦" },
    ],
  },
  music: {
    audioOnly: true,
    compact: true,
    suggestions: WP_SONGS,
    suggestionsNote: "Wedding favourites · tap one, or paste any YouTube link",
  },
  extras: [
    // ── Stored by pages published before the rebuild: never rename or retype ──
    { key: "theme", kind: "enum", label: "Theme", default: "powder", hidden: true, options: WEDDING_THEME_IDS.map((id) => ({ value: id, label: WP_THEME_LABELS[id] ?? id })) },
    { key: "order", kind: "enum", label: "Show names as", default: "bride", hidden: true, options: [{ value: "bride", label: "Bride first" }, { value: "groom", label: "Groom first" }] },
    {
      key: "motif", kind: "enum", label: "Blessing ornament", default: "ganesha", hidden: true,
      options: [{ value: "ganesha", label: "Ganesha" }, { value: "lotus", label: "Lotus" }, { value: "rings", label: "Rings" }, { value: "none", label: "None" }],
    },
    /** Offer the Hindi toggle (EN/हिं) to guests. Off = an English-only invitation. */
    { key: "hindi", kind: "bool", default: true, label: "Offer a Hindi version", hidden: true },
    { key: "date", kind: "text", max: 10, label: "the wedding date", min: 10, hidden: true, input: "date" },
    { key: "time", kind: "text", max: 5, label: "Time", hidden: true },
    { key: "city", kind: "text", max: 40, label: "City", hidden: true },
    { key: "hashtag", kind: "text", max: 40, label: "Hashtag", hidden: true },
    { key: "brideParents", kind: "text", max: 90, label: "Bride's family", hidden: true },
    { key: "brideNote", kind: "text", max: 90, label: "Bride's family note", hidden: true },
    { key: "groomParents", kind: "text", max: 90, label: "Groom's family", hidden: true },
    { key: "groomNote", kind: "text", max: 90, label: "Groom's family note", hidden: true },
    {
      key: "events", kind: "objlist", maxItems: WP_LIMITS.events, minItems: 1, label: "Function", itemTitle: "Function", hidden: true,
      item: [t("id", "Id", 40), t("title", "Name", 30), t("date", "Date", 10), t("time", "Starts", 5), t("endTime", "Ends", 5), t("venue", "Venue", 80), t("address", "Address", 140), t("mapUrl", "Google Maps link", 300), t("dressCode", "Dress code", 50), t("dressColor", "Dress colour", 7), t("note", "Note", 220)],
    },
    {
      key: "story", kind: "objlist", maxItems: WP_LIMITS.story, label: "Moments", itemTitle: "Moment", hidden: true,
      item: [t("when", "When", 30), t("title", "Title", 50), { key: "text", label: "The moment", kind: "longtext", max: 320 }, { key: "photo", label: "Photo", kind: "number", min: 0, max: 20, default: 0 }],
    },
    { key: "faqs", kind: "objlist", maxItems: WP_LIMITS.faq, label: "Good to know", itemTitle: "Note", hidden: true, item: [t("title", "Title", 40), t("text", "Details", 220)] },
    { key: "rsvpBy", kind: "text", max: 10, label: "Reply by", hidden: true, input: "date" },
    { key: "maxGuests", kind: "number", min: 1, max: 10, default: 4, label: "Guests per reply", hidden: true },
    { key: "rsvpMeal", kind: "bool", default: false, label: "Ask meal preference", hidden: true },
    // ── Added in the rebuild (2026-10): all optional, absent on older pages ──
    { key: "lang", kind: "enum", label: "Opens in", default: "en", hidden: true, options: [{ value: "en", label: "English" }, { value: "hi", label: "हिन्दी" }] },
    { key: "hindiMessage", kind: "longtext", max: 700, label: "Invitation in Hindi", hidden: true },
    { key: "blessingsOf", kind: "text", max: 160, label: "With the blessings of", hidden: true },
    { key: "muhurat", kind: "text", max: 60, label: "Muhurat", hidden: true },
    { key: "gettingThere", kind: "longtext", max: 500, label: "Getting there", hidden: true },
    { key: "videoUrl", kind: "text", max: 200, label: "Pre-wedding film", hidden: true },
    {
      key: "contacts", kind: "objlist", maxItems: 4, label: "Family contacts", itemTitle: "Contact", hidden: true,
      item: [t("name", "Name", 40), t("relation", "Relation", 40), t("phone", "Phone", 20)],
    },
    { key: "upiId", kind: "text", max: 60, label: "UPI ID for shagun", hidden: true },
    { key: "upiName", kind: "text", max: 60, label: "Name on the UPI account", hidden: true },
    { key: "liveUrl", kind: "text", max: 300, label: "Livestream link", hidden: true },
    { key: "blessings", kind: "bool", default: true, label: "Blessings wall", hidden: true },
  ],
  theme,
  demo: {
    recipientName: "Ishita",
    senderName: "Aarav",
    petName: "",
    letter:
      "With the blessings of the Almighty and our elders, the Rathore and Kapoor families invite you to celebrate the wedding of Ishita and Aarav on 13 February 2027, by the lake in Udaipur.\n\nFour days of henna, haldi, music and pheras on a terrace over Lake Pichola. It would not be complete without you.",
    photos: DEMO_PHOTOS_WP,
    gifs: {},
    music: true,
    musicMode: "youtube",
    musicYoutubeId: "1LVpuWpRs3I",
    musicStart: 0,
    endLine: "With love and gratitude, the Rathore & Kapoor families",
    extras: {
      theme: "powder",
      order: "bride",
      motif: "ganesha",
      hindi: true,
      date: "2027-02-13",
      time: "18:30",
      city: "Udaipur",
      hashtag: "#IshitaWedsAarav",
      brideParents: "Mrs. Meera & Mr. Arvind Rathore",
      brideNote: "Jaipur",
      groomParents: "Mrs. Nandini & Mr. Sanjay Kapoor",
      groomNote: "New Delhi",
      events: DEMO_EVENTS.map((e) => ({ ...e })),
      story: DEMO_STORY.map((s) => ({ ...s })),
      faqs: DEMO_FAQS.map((f) => ({ ...f })),
      rsvpBy: "2027-01-15",
      maxGuests: 4,
      rsvpMeal: true,
      lang: "en",
      hindiMessage: "ईश्वर की असीम कृपा और बड़ों के आशीर्वाद से, इशिता और आरव के शुभ विवाह के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं। झील के किनारे इस उत्सव में आपकी उपस्थिति ही हमारा सौभाग्य है।",
      blessingsOf: "Smt. Kamla Devi & Late Shri Ram Singh Rathore",
      muhurat: "Shubh muhurat 8:40 pm",
      gettingThere: "Udaipur airport (UDR) is 25 minutes away. Our cars meet every flight on 10 and 11 February, and boats run from the City Palace jetty to the reception.",
      videoUrl: "",
      contacts: [
        { name: "Rohan Rathore", relation: "Bride's brother", phone: "+91 98290 00001" },
        { name: "Tara Kapoor", relation: "Groom's sister", phone: "+91 98100 00002" },
      ],
      upiId: "",
      upiName: "",
      liveUrl: "",
      blessings: true,
    },
  },
  copy: {
    recipientPlaceholder: "e.g. Ishita",
    senderPlaceholder: "e.g. Aarav",
    petNamePlaceholder: "",
    letterPlaceholder: "With the blessings of our families, Ishita and Aarav invite you to celebrate their wedding…",
    letterHint: "The words your guests read first.",
    photosHint: "Any shape works. Tap a photo to resize it or set its focus. Drag to reorder.",
    captionHint: "caption (optional)",
    noteHint: "",
    endLinePlaceholder: "With love, the Rathore & Kapoor families",
    endLineHint: "The thank-you at the very end, on the terrace.",
    sheetTitle: "Your lake terrace invitation",
    sheetSub: "Answer a few questions and we'll fill everything in. Change anything you like.",
    extrasTitle: "Functions",
    extrasSub: "Every function with its own map, timings and dress code.",
    publishing: "Opening the doors to your invitation…",
    storyTitle: "Describe your wedding",
    replyText: "We'd love to come! Congratulations to you both 💐",
    yesChip: "Opened ✓",
  },
  share: { title: "The doors are open ✨ You're invited to our wedding", accent: "#3E6A8A" },
};
