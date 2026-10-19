// ─── Wedding Invitation ✦ Premium ($10) ──────────────────────────────────────
//
// A scroll-told wedding website on the Valentine engine (draft, publish,
// paywall, share link, password, OG, analytics and AI fill come from it) and
// the wedding kit (app/(templates)/_wedding: themes, masonry, countdown,
// functions, RSVP). The guest page lives in
// app/(templates)/wedding-invitation-premium/components; the editor is that
// folder's studio (DayConfig.studio "weddingPremium"), which owns the whole
// form except music and the finishing touches.
//
// Field mapping on the engine's shape:
//   recipientName = the bride · senderName = the groom · letter = the
//   invitation message · endLine = the closing thank-you · photos[0] = cover.
//
// Server twin: server/src/config/valentineDays.ts ("wedding-invitation-premium");
// keys and limits must match (valentineDays.test.ts pins them).

import type { DayConfig } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { WEDDING_THEME_IDS, WEDDING_THEMES, WEDDING_TIER_LIMITS } from "../../_wedding";
import { meta } from "./_shared";

const SLUG = "wedding-invitation-premium" as const;
export const WP_LIMITS = WEDDING_TIER_LIMITS[SLUG];

// ─── Music: one track, Din Shagna Da by default (music.json, verified 2026-10-19) ─
export const WP_SONGS: readonly SongSuggestion[] = [
  { id: "1LVpuWpRs3I", title: "Din Shagna Da", artist: "Jasleen Royal · Phillauri" },
  { id: "OzEL4CwbPew", title: "Wedding Shehnai (Kanyadaan)", artist: "Ustad Bismillah Khan" },
  { id: "Ptk_1Dc2iPY", title: "Canon in D (Cello & Piano)", artist: "Brooklyn Duo" },
  { id: "-bNwqXvMuB8", title: "Mehndi Laga Ke Rakhna", artist: "Lata Mangeshkar, Udit Narayan" },
  { id: "8XtXLVylOoU", title: "Saajanji Ghar Aaye", artist: "Alka Yagnik, Kumar Sanu" },
  { id: "jCEdTq3j-0U", title: "Gallan Goodiyaan", artist: "Dil Dhadakne Do" },
  { id: "3qpxJEp4Ec4", title: "Kudmayi", artist: "Shahid Mallya" },
  { id: "V7LwfY5U5WI", title: "Ranjha", artist: "B Praak, Jasleen Royal" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "lwLVJ0E8gN4", title: "Kabira (Encore)", artist: "Arijit Singh, Harshdeep Kaur" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];

// ─── Defaults for a function, by name (AI fill and "+ Add a function" use them) ─
export interface FunctionPreset {
  match: RegExp;
  title: string;
  dressCode: string;
  note: string;
  /** Default start time when none is given. */
  time: string;
}
const NEUTRAL_WEDDING_NOTE = "Join us as we are married and begin our life together, surrounded by the people we love.";
export const FUNCTION_PRESETS: readonly FunctionPreset[] = [
  { match: /haldi|pithi|mayun|vatna/i, title: "Haldi", time: "10:00", dressCode: "Shades of yellow", note: "A morning of turmeric, laughter and sunshine as the couple is blessed with haldi. Wear yellow and be ready to get a little messy." },
  { match: /mehe?n?di|henna/i, title: "Mehendi", time: "16:00", dressCode: "Greens and bright florals", note: "Henna, music and plenty of chai. Come get your hands painted as we fill the afternoon with colour and song." },
  { match: /sangeet|garba|ladies|cocktail/i, title: "Sangeet", time: "19:30", dressCode: "Indo-western glam", note: "An evening of music, dance performances and family rivalries settled on the dance floor. Bring your best moves." },
  { match: /recep/i, title: "Reception", time: "20:00", dressCode: "Formal / black tie", note: "Dinner, toasts and dancing to celebrate the newlyweds. Come raise a glass with us." },
  { match: /engage|roka|sagai|ring/i, title: "Engagement", time: "18:00", dressCode: "Festive pastels", note: "Rings, blessings and the first toast to the two of us. Join our families for an evening of joy." },
  { match: /church|ceremony|nikah|anand|muhurtham|court|register/i, title: "Ceremony", time: "11:00", dressCode: "Elegant formal", note: NEUTRAL_WEDDING_NOTE },
  { match: /wedd|phera|vivah|shaadi|marri|lagna|kalyanam/i, title: "Wedding", time: "19:00", dressCode: "Traditional festive", note: "Join us as we take the seven pheras around the sacred fire and begin our life together." },
];
/** The preset for a function's name; the pheras line only on a Hindu (Ganesha) invitation. */
export function presetFor(title: string, motif?: unknown): FunctionPreset | null {
  const t = title.trim();
  if (!t) return null;
  const p = FUNCTION_PRESETS.find((f) => f.match.test(t)) ?? null;
  if (p && p.title === "Wedding" && motif !== undefined && motif !== "ganesha") return { ...p, dressCode: "Elegant formal", note: NEUTRAL_WEDDING_NOTE };
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

// ─── Demo: Aanya & Vihaan, a royal Udaipur weekend ──────────────────────────
const CDN = "https://cdn.subhsandesh.in/gifts-media/templates/wedding/demo";

export const DEMO_EVENTS = [
  { id: "haldi", title: "Haldi", date: "2027-02-11", time: "10:00", endTime: "13:00", venue: "The Courtyard, Shiv Niwas Palace", address: "City Palace Complex, Udaipur, Rajasthan 313001", mapUrl: "", dressCode: "Shades of yellow", note: "A morning of turmeric, laughter and sunshine. Wear yellow and be ready to get a little messy." },
  { id: "mehendi", title: "Mehendi", date: "2027-02-11", time: "16:30", endTime: "20:00", venue: "Lakeside Lawns, Shiv Niwas Palace", address: "City Palace Complex, Udaipur, Rajasthan 313001", mapUrl: "", dressCode: "Greens and bright florals", note: "Henna, folk music and plenty of chai as the sun sets over Lake Pichola." },
  { id: "sangeet", title: "Sangeet", date: "2027-02-12", time: "19:30", endTime: "23:30", venue: "Durbar Hall, Fateh Prakash Palace", address: "City Palace Complex, Udaipur, Rajasthan 313001", mapUrl: "", dressCode: "Indo-western glam", note: "Music, dance performances and family rivalries settled on the dance floor. Bring your best moves." },
  { id: "wedding", title: "Wedding", date: "2027-02-13", time: "19:00", endTime: "23:00", venue: "Manek Chowk, City Palace", address: "City Palace, Udaipur, Rajasthan 313001", mapUrl: "", dressCode: "Traditional festive", note: "The baraat arrives at 7 pm; the pheras begin at the auspicious hour of 9:15 pm." },
  { id: "reception", title: "Reception", date: "2027-02-14", time: "20:00", endTime: "23:30", venue: "The Terrace, Jagmandir Island Palace", address: "Lake Pichola, Udaipur, Rajasthan 313001", mapUrl: "", dressCode: "Formal / black tie", note: "Boats leave the City Palace jetty every fifteen minutes from 7:30 pm." },
];

export const DEMO_STORY = [
  { when: "2018 · Pune", title: "Where it began", text: "A borrowed umbrella outside the college library, a monsoon that would not stop, and a conversation that has not ended since.", photo: 2 },
  { when: "2021", title: "Miles apart", text: "Two cities, a hundred late-night calls and one very patient chai vendor near Bandra station.", photo: 14 },
  { when: "2025 · Udaipur", title: "The question", text: "On a boat on Lake Pichola at sunset, Vihaan finally asked. Aanya said yes before he finished the sentence.", photo: 9 },
  { when: "13 Feb 2027", title: "Forever begins", text: "And now we can't wait to begin forever, with all of you there.", photo: 1 },
];

export const DEMO_FAQS = [
  { title: "Dress code", text: "Each function has its own colours, listed on its card. Comfortable shoes for the courtyard; the palace floors are stone." },
  { title: "Getting there", text: "Udaipur airport (UDR) is 25 minutes away. We have cars at the airport on 10 and 11 February; call Rohan on +91 98290 00000." },
  { title: "Where to stay", text: "Rooms are held for our guests at Shiv Niwas Palace and Fateh Prakash Palace until 31 December. Mention our names when you book." },
];

/**
 * Demo gallery (CC0 photographs from Wikimedia Commons — Unsplash-sourced and
 * others; see media-src/templates/wedding/ATTRIBUTION.md), on our CDN with
 * their natural size so the masonry lays out before they load.
 */
const p = (file: string, w: number, h: number, extra: Record<string, unknown> = {}) => ({ url: `${CDN}/${file}`, w, h, cropX: 50, cropY: 50, scale: 100, ...extra });
export const DEMO_PHOTOS_WP = [
  p("wp-varmala-couple.webp", 1400, 1075, { caption: "Aanya & Vihaan", cropX: 46, cropY: 40 }),
  p("wp-couple-hands.webp", 1068, 1600, { caption: "Hand in hand" }),
  p("wp-city-palace-court.webp", 720, 1600, { span: "tall", caption: "City Palace, Udaipur" }),
  p("wp-mehndi-bangles.webp", 1600, 1064, { caption: "Mehendi" }),
  p("wp-haldi.webp", 1487, 753, { span: "wide", caption: "Haldi morning" }),
  p("wp-palace-hall.webp", 1600, 720),
  p("wp-bridal-mehndi.webp", 925, 1600),
  p("wp-ring-ceremony.webp", 1024, 683, { caption: "The ring ceremony" }),
  p("wp-rings-hands.webp", 1600, 1067),
  p("wp-aisle-florals.webp", 1600, 1068, { span: "large" }),
  p("wp-palace-mural.webp", 1600, 720),
  p("wp-bridal-bangles.webp", 1024, 768, { caption: "Chooda" }),
  p("wp-mehndi-palm.webp", 1600, 1197),
  p("wp-rings-watch.webp", 1600, 1067),
  p("wp-flowers.webp", 1065, 1600),
];

// ─── The editor chrome (sheet + top bar): blush & rose gold ─────────────────
const theme: DayTheme = {
  bg: "radial-gradient(120% 90% at 50% 0%, #fdf6f4 0%, #f8e9e7 55%, #f1d9d6 100%)",
  base: "#fbf0ee",
  paper: "#fffaf8",
  glass: "rgba(255,250,248,.82)",
  ink: "#3e1f27",
  inkSoft: "#87636a",
  paperInk: "#3e1f27",
  accent: "#b4596c",
  accentDeep: "#8e3d50",
  accentInk: "#fff8f6",
  soft: "#f7e3e1",
  edge: "rgba(169,78,99,.24)",
  gold: "#c08a5c",
  dark: false,
  particles: ["🌸", "✨"],
  confetti: ["#c08a5c", "#e8c79a", "#b4596c", "#f4c6cf"],
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
  // The studio numbers its own 9 steps (no side nav); the sheet keeps Music + Finishing touches as 10 and 11.
  studioForm: { keep: ["music", "finish"], numberFrom: 9, ownAi: true, ownerPanel: "weddingGuests" },
  music: {
    audioOnly: true,
    compact: true,
    suggestions: WP_SONGS,
    suggestionsNote: "Wedding favourites · tap one, or paste any YouTube link",
  },
  extras: [
    {
      key: "theme", kind: "enum", label: "Theme", default: "blush", hidden: true,
      options: WEDDING_THEME_IDS.map((id) => ({ value: id, label: WEDDING_THEMES[id].label, swatch: WEDDING_THEMES[id].swatch[1] })),
    },
    { key: "order", kind: "enum", label: "Show names as", default: "bride", hidden: true, options: [{ value: "bride", label: "Bride first" }, { value: "groom", label: "Groom first" }] },
    {
      key: "motif", kind: "enum", label: "Blessing ornament", default: "ganesha", hidden: true,
      options: [{ value: "ganesha", label: "Ganesha" }, { value: "lotus", label: "Lotus" }, { value: "rings", label: "Rings" }, { value: "none", label: "None" }],
    },
    { key: "hindi", kind: "bool", default: true, label: "Hindi lines under the headings", hidden: true },
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
      item: [t("id", "Id", 40), t("title", "Name", 30), t("date", "Date", 10), t("time", "Starts", 5), t("endTime", "Ends", 5), t("venue", "Venue", 80), t("address", "Address", 140), t("mapUrl", "Google Maps link", 300), t("dressCode", "Dress code", 50), t("note", "Note", 220)],
    },
    {
      key: "story", kind: "objlist", maxItems: WP_LIMITS.story, label: "Moments", itemTitle: "Moment", hidden: true,
      item: [t("when", "When", 30), t("title", "Title", 50), { key: "text", label: "The moment", kind: "longtext", max: 320 }, { key: "photo", label: "Photo", kind: "number", min: 0, max: 20, default: 0 }],
    },
    { key: "faqs", kind: "objlist", maxItems: WP_LIMITS.faq, label: "Good to know", itemTitle: "Note", hidden: true, item: [t("title", "Title", 40), t("text", "Details", 220)] },
    { key: "rsvpBy", kind: "text", max: 10, label: "Reply by", hidden: true, input: "date" },
    { key: "maxGuests", kind: "number", min: 1, max: 10, default: 4, label: "Guests per reply", hidden: true },
    { key: "rsvpMeal", kind: "bool", default: false, label: "Ask meal preference", hidden: true },
  ],
  theme,
  demo: {
    recipientName: "Aanya",
    senderName: "Vihaan",
    petName: "",
    letter:
      "By the grace of the Almighty and with the blessings of our elders, Aanya and Vihaan invite you to celebrate their wedding in the city of lakes.\n\nFour days of haldi, henna, music and pheras by the water: it would not be complete without you.",
    photos: DEMO_PHOTOS_WP,
    gifs: {},
    music: true,
    musicMode: "youtube",
    musicYoutubeId: "1LVpuWpRs3I",
    musicStart: 0,
    endLine: "Thank you for being part of our story.",
    extras: {
      theme: "blush",
      order: "bride",
      motif: "ganesha",
      hindi: true,
      date: "2027-02-13",
      time: "19:00",
      city: "Udaipur",
      hashtag: "#AanyaWedsVihaan",
      brideParents: "Mrs. Meera & Mr. Arvind Rathore",
      brideNote: "Jaipur",
      groomParents: "Mrs. Nandini & Mr. Sanjay Malhotra",
      groomNote: "New Delhi",
      events: DEMO_EVENTS.map((e) => ({ ...e })),
      story: DEMO_STORY.map((s) => ({ ...s })),
      faqs: DEMO_FAQS.map((f) => ({ ...f })),
      rsvpBy: "2027-01-15",
      maxGuests: 4,
      rsvpMeal: false,
    },
  },
  copy: {
    recipientPlaceholder: "e.g. Ananya",
    senderPlaceholder: "e.g. Arjun",
    petNamePlaceholder: "",
    letterPlaceholder: "The words your guests read first.",
    letterHint: "The words your guests read first.",
    photosHint: "Any shape works.",
    captionHint: "caption (optional)",
    noteHint: "",
    endLinePlaceholder: "Thank you for being part of our story.",
    endLineHint: "The thank-you at the very end, under your photo.",
    sheetTitle: "Your wedding website",
    sheetSub: "Describe your wedding and we'll fill everything in. Change anything you like.",
    extrasTitle: "Details",
    extrasSub: "",
    publishing: "Sealing your invitation…",
    storyTitle: "Describe your wedding",
    replyText: "We'd love to come! Congratulations to you both 💐",
    yesChip: "Opened ✓",
  },
  share: { title: "You're invited to our wedding 💍 Open your invitation", accent: "#A8445E" },
};
