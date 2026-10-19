// ─── Wedding Invitation (Classic, $5) ────────────────────────────────────────
//
// One elegant page that opens like an envelope: a wax seal → tap → the flap
// lifts and the card slides out → names in gold script, the date and a live
// countdown, the invitation, the families, up to two functions (wedding +
// reception) with maps and an add-to-calendar for the main one, up to six
// photos in a masonry gallery, one-tap RSVP (every guest, owner emailed) and a
// closing line. Six themes (three light, three dark), all in foil gold.
//
// Built on the Valentine engine (draft → publish → paywall → share → password
// → analytics → AI fill) and the wedding kit (app/(templates)/_wedding).
// Data mapping: recipientName = the bride, senderName = the groom (the kit's
// RSVP mails and the server read them as the couple), letter = the invitation
// text, endLine = the closing sign-off. Everything else is in `extras`.
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

export interface WiExtras {
  theme: WeddingThemeId;
  /** Which name is printed first. */
  namesOrder: "bride" | "groom";
  /** The big day, "YYYY-MM-DD" — drives the countdown. */
  date: string;
  /** "HH:mm" (24 h) — the muhurat / start time for the countdown. */
  time: string;
  brideFamily: string;
  groomFamily: string;
  /** Up to two functions (WeddingEvent with string leaves). */
  events: WeddingEvent[];
  rsvp: boolean;
  /** "YYYY-MM-DD" — "Kindly reply by…". */
  rsvpBy: string;
  maxGuests: number;
  [k: string]: unknown;
}

/** The editor sheet's own colours (the champagne theme); the guest page re-themes from extras.theme. */
const SHEET_THEME: DayTheme = {
  bg: "linear-gradient(180deg, #fbf5e4 0%, #f6ebcf 60%, #f2e4c0 100%)",
  base: "#fbf5e4",
  paper: "#fffcf2",
  glass: "rgba(255,252,242,0.78)",
  ink: "#3a2c14",
  inkSoft: "#7a6440",
  paperInk: "#3a2c14",
  accent: "#9a7b2f",
  accentDeep: "#6f5419",
  accentInk: "#fffaf0",
  soft: "#f5ebcf",
  edge: "#e6d4a6",
  gold: "#c9a43f",
  dark: false,
  particles: ["✨"],
  confetti: ["#c9a43f", "#e9cf7a", "#fff3c4", "#9a7b2f", "#ffffff"],
};

/** One track by default (the shehnai) + verified suggestions (research/music.json, checked 2026-10-19). */
export const WI_SONGS: readonly SongSuggestion[] = [
  { id: "OzEL4CwbPew", title: "Wedding Shehnai (Kanyadaan)", artist: "Ustad Bismillah Khan" },
  { id: "Ptk_1Dc2iPY", title: "Canon in D (Cello & Piano)", artist: "Brooklyn Duo" },
  { id: "1LVpuWpRs3I", title: "Din Shagna Da", artist: "Jasleen Royal" },
  { id: "8XtXLVylOoU", title: "Saajanji Ghar Aaye", artist: "Alka Yagnik, Kumar Sanu" },
  { id: "3qpxJEp4Ec4", title: "Kudmayi", artist: "Shahid Mallya" },
  { id: "V7LwfY5U5WI", title: "Ranjha", artist: "B Praak, Jasleen Royal" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "lwLVJ0E8gN4", title: "Kabira (Encore)", artist: "Arijit Singh, Harshdeep Kaur" },
  { id: "-bNwqXvMuB8", title: "Mehndi Laga Ke Rakhna", artist: "Lata Mangeshkar, Udit Narayan" },
  { id: "jCEdTq3j-0U", title: "Gallan Goodiyaan", artist: "Shankar Mahadevan & more" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];

const DEMO_CDN = "https://cdn.subhsandesh.in/gifts-media/templates/wedding/demo/";

/** Commercial-use demo photos (CC0 — media-src/templates/wedding/ATTRIBUTION.md). */
export const WI_DEMO_PHOTOS: LovePhoto[] = [
  { url: `${DEMO_CDN}varmala-couple.webp`, w: 1400, h: 1075, span: "wide", cropX: 50, cropY: 40, caption: "The varmala" },
  { url: `${DEMO_CDN}couple-hands.webp`, w: 934, h: 1400, cropX: 50, cropY: 45, caption: "Hand in hand" },
  { url: `${DEMO_CDN}bridal-bangles.webp`, w: 1024, h: 768, cropX: 50, cropY: 50, caption: "Chooda" },
  { url: `${DEMO_CDN}bridal-feet.webp`, w: 680, h: 1024, cropX: 50, cropY: 60 },
  { url: `${DEMO_CDN}ring-ceremony.webp`, w: 1024, h: 683, cropX: 50, cropY: 50, caption: "The ring game" },
  { url: `${DEMO_CDN}bride-namaste.webp`, w: 1024, h: 768, cropX: 50, cropY: 40 },
];

export const WI_DEMO_EVENTS: WeddingEvent[] = [
  {
    id: "wedding",
    title: "Wedding",
    date: "2026-12-12",
    time: "19:30",
    endTime: "",
    venue: "The Lake Palace",
    address: "Lake Pichola, Udaipur, Rajasthan",
    mapUrl: "",
    dressCode: "Traditional festive",
    dressColor: "",
    note: "Baraat at 7:30 pm, pheras under the stars at 9:15 pm.",
  },
  {
    id: "reception",
    title: "Reception",
    date: "2026-12-13",
    time: "20:00",
    endTime: "",
    venue: "Jag Mandir Island Palace",
    address: "Lake Pichola, Udaipur, Rajasthan",
    mapUrl: "",
    dressCode: "Formal",
    dressColor: "",
    note: "Dinner, toasts and dancing by the water.",
  },
];

const TXT = (key: string, max: number, extra: Record<string, unknown> = {}) => ({ key, kind: "text" as const, max, label: key, ...extra });

export const weddingInvitationDay: DayConfig<WiExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Wedding Invitation",
  maxPhotos: WI_LIMITS.photos,
  letterMax: 900,
  letterMin: 20,
  asksQuestion: false,
  melody: "lantern",
  photoAspect: 1,
  gifSlots: [],
  topBar: true,
  brandMark: "stacked",
  studio: "wedding-invitation",
  studioForm: {
    nav: [
      { id: "names", label: "The couple", emoji: "💍" },
      { id: "details", label: "Date & functions", emoji: "📅" },
      { id: "photos", label: "Photos", emoji: "📸" },
      { id: "letter", label: "Invitation", emoji: "✉️" },
      { id: "look", label: "Theme & music", emoji: "🎨", done: () => null },
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
      key: "theme", kind: "enum", label: "Theme", default: "champagne", hidden: true, display: "swatches",
      options: WEDDING_THEME_IDS.map((id) => ({ value: id, label: WEDDING_THEMES[id].label, swatch: WEDDING_THEMES[id].swatch[1] })),
    },
    { key: "namesOrder", kind: "enum", label: "Show names as", default: "bride", hidden: true, options: [{ value: "bride", label: "Bride first" }, { value: "groom", label: "Groom first" }] },
    { key: "date", kind: "text", max: 10, label: "The big day", input: "date", hidden: true },
    { key: "time", kind: "text", max: 5, label: "Muhurat / start time", hidden: true },
    { key: "brideFamily", kind: "text", max: 90, label: "Bride's family", hidden: true },
    { key: "groomFamily", kind: "text", max: 90, label: "Groom's family", hidden: true },
    {
      key: "events", kind: "objlist", maxItems: WI_LIMITS.events, label: "Functions", itemTitle: "Function", hidden: true,
      item: [
        TXT("id", 40), TXT("title", 40), TXT("date", 10), TXT("time", 5), TXT("endTime", 5), TXT("venue", 80), TXT("address", 140),
        TXT("mapUrl", 300), TXT("dressCode", 60), TXT("dressColor", 9), TXT("note", 200),
      ],
    },
    { key: "rsvp", kind: "bool", label: "Ask guests to RSVP", default: true, hidden: true },
    { key: "rsvpBy", kind: "text", max: 10, label: "Reply by", input: "date", hidden: true },
    { key: "maxGuests", kind: "number", label: "Guests per reply", min: 1, max: 10, default: 4, hidden: true },
  ],
  theme: SHEET_THEME,
  demo: {
    recipientName: "Aanya",
    senderName: "Vihaan",
    petName: "",
    letter:
      "Together with their families, Aanya and Vihaan request the honour of your presence as they begin their forever.\n\nJoin us by the lakes of Udaipur for the pheras under the stars, and stay for a night of music, laughter and far too much food. Your blessings will make our day complete.",
    photos: WI_DEMO_PHOTOS.map((p) => ({ ...p })),
    gifs: {},
    music: true,
    musicMode: "youtube",
    musicYoutubeId: "OzEL4CwbPew",
    musicStart: 0,
    endLine: "With love, the Rathore & Singhania families",
    extras: {
      theme: "champagne",
      namesOrder: "bride",
      date: "2026-12-12",
      time: "19:30",
      brideFamily: "Mrs. Meera & Mr. Raghav Rathore",
      groomFamily: "Mrs. Kavita & Mr. Arjun Singhania",
      events: WI_DEMO_EVENTS.map((e) => ({ ...e })),
      rsvp: true,
      rsvpBy: "2026-11-30",
      maxGuests: 4,
    },
  },
  copy: {
    recipientPlaceholder: "e.g. Ananya",
    senderPlaceholder: "e.g. Arjun",
    petNamePlaceholder: "",
    letterPlaceholder: "Together with their families, Ananya and Arjun request the honour of your presence…",
    letterHint: "The words your guests read first.",
    photosHint: "Any shape works.",
    captionHint: "caption — e.g. The roka",
    noteHint: "",
    endLinePlaceholder: "With love, the Sharma & Mehta families",
    endLineHint: "The sign-off at the very end of the invitation.",
    sheetTitle: "Your wedding invitation",
    sheetSub: "Describe your wedding and we'll fill in everything below. Change any of it.",
    extrasTitle: "Date & functions",
    extrasSub: "The big day, the wedding and the reception",
    publishing: "Sealing your invitation…",
    storyTitle: "Describe your wedding",
    replyText: "We'd love to be there 💐 Congratulations to you both!",
    yesChip: "Opened ✓",
  },
  share: { title: "You're invited 💌 Tap the seal to open our wedding invitation", accent: "#9A7B2F" },
};
