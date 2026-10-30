// ─── Faith weddings: one DayConfig shape for three templates ────────────────
//
// Anand Karaj, Nikah and Holy Matrimony share Pampas & Peony's fields, limits,
// RSVP and blessings plumbing. The differences: `localMessage` (Punjabi / Urdu)
// in place of `hindiMessage`, `verse` + `verseRef` (scripture on the card), the
// `lang` options, and each faith's demo, songs and copy.
//
// Field mapping on the engine: recipientName = the bride, senderName = the
// groom, letter = the English invitation, endLine = the closing line,
// photos = ONE pool of up to 40 (story chapters, family cards and the couple
// portrait point into it by 1-based index).
//
// Server twins: server/src/config/weddingDays/<slug>.ts; keys and limits must
// match (valentineDays.test.ts pins them). Light themes only.

import type { DayConfig, LovePhoto } from "../_valentine/types";
import type { DayTheme } from "../_valentine/theme";
import type { SongSuggestion } from "../_valentine/music/youtube";
import { meta } from "../_valentine/days/_shared";
import { LIGHT_THEMES } from "../_wedding/themes";
import type { WeddingEvent } from "../_wedding/types";
import { FW_DEMO_PHOTOS } from "../_valentine/days/floral-wedding-invitation";
import type { DaySlug } from "../_valentine/days/slugs";

export const FAITH_THEME_LABELS: Record<string, string> = { blush: "Blush Pink", champagne: "Champagne", powder: "Powder Blue" };

/** One demo photo: a file from Pampas & Peony's CC0 set (public/wedding-v3/floral/demo), a caption, a span. */
export type DemoPick = readonly [file: string, caption?: string, span?: "wide" | "tall"];

/**
 * A faith's demo album, picked from Pampas & Peony's CC0 photos (same-origin) so nothing in it belongs to
 * another faith's rites: the gallery picks, then the couple portrait (rw-16) and story chapters 3 and 4
 * (rw-17, rw-18). The portrait and the chapters point at those last three by 1-based index.
 */
function faithDemoPhotos(gallery: readonly DemoPick[]): { photos: LovePhoto[]; portrait: number; ch3: number; ch4: number } {
  const byFile = (f: string) => {
    const p = FW_DEMO_PHOTOS.find((x) => x.url.endsWith(`/${f}.webp`));
    if (!p) throw new Error(`faith demo: no photo ${f}`);
    return p;
  };
  const photos: LovePhoto[] = gallery.map(([f, caption, span]) => {
    const p: LovePhoto = { ...byFile(f) };
    delete p.caption;
    delete p.span;
    return { ...p, ...(caption ? { caption } : {}), ...(span ? { span } : {}) };
  });
  const n = photos.length;
  photos.push({ ...byFile("rw-16") }, { ...byFile("rw-17") }, { ...byFile("rw-18") });
  return { photos, portrait: n + 1, ch3: n + 2, ch4: n + 3 };
}

import type { LocalCode } from "./types";

export interface FaithDayInput {
  slug: DaySlug;
  title: string;
  /** null = English only (Holy Matrimony). */
  local: { code: LocalCode; label: string } | null;
  theme: DayTheme;
  songs: readonly SongSuggestion[];
  songsNote: string;
  defaultSong: string;
  emojiNav: { names: string; details: string };
  demo: {
    /** The gallery picks (see faithDemoPhotos); story chapters use photo 17 / 18 for "chapter 3 / 4's photo". */
    gallery: readonly DemoPick[];
    bride: string;
    groom: string;
    letter: string;
    endLine: string;
    localMessage?: string;
    extras: Record<string, unknown>;
    events: WeddingEvent[];
  };
  copy: { letterPlaceholder: string; endLinePlaceholder: string; sheetTitle: string; storyTitle: string; publishing: string };
  share: { title: string; accent: string };
}

const ev = (k: string, label: string, max: number, placeholder?: string) => ({ key: k, kind: "text" as const, label, max, placeholder });

export function makeFaithDay(i: FaithDayInput): DayConfig<Record<string, unknown>> {
  const L = { events: 8, photos: 40, story: 8, faq: 6 };
  const album = faithDemoPhotos(i.demo.gallery);
  const story = (Array.isArray(i.demo.extras.story) ? (i.demo.extras.story as { photo: number }[]) : []).map((c) => ({ ...c, photo: c.photo === 17 ? album.ch3 : c.photo === 18 ? album.ch4 : 0 }));
  return {
    slug: i.slug,
    ...meta(i.slug),
    title: i.title,
    maxPhotos: L.photos,
    letterMax: 1500,
    letterMin: 20,
    asksQuestion: false,
    melody: "diya",
    photoAspect: 0.8,
    gifSlots: [],
    topBar: true,
    brandMark: "stacked",
    studio: "faithWedding",
    // The studio draws every section itself, password included. Edit stays after publishing:
    // the owner's guest replies + blessings live in the form.
    studioForm: {
      ownAi: true,
      editAfterPublish: true,
      nav: [
        { id: "names", label: "The couple", emoji: i.emojiNav.names },
        { id: "details", label: "Functions", emoji: i.emojiNav.details },
        { id: "photos", label: "Photos", emoji: "📸" },
        { id: "letter", label: "Invitation", emoji: "✉️" },
        { id: "music", label: "Theme & music", emoji: "🎵" },
        { id: "guests", label: "For guests", emoji: "💌" },
        { id: "finish", label: "More details", emoji: "✦" },
      ],
    },
    music: { audioOnly: true, compact: true, suggestions: i.songs, suggestionsNote: i.songsNote },
    extras: [
      { key: "theme", kind: "enum", label: "Theme", default: "champagne", hidden: true, options: LIGHT_THEMES.map((id) => ({ value: id, label: FAITH_THEME_LABELS[id] ?? id })) },
      { key: "lang", kind: "enum", label: "Opens in", default: "en", hidden: true, options: [{ value: "en", label: "English" }, ...(i.local ? [{ value: i.local.code, label: i.local.label }] : [])] },
      { key: "nameOrder", kind: "enum", label: "Show names as", default: "bride", hidden: true, options: [{ value: "bride", label: "Bride first" }, { value: "groom", label: "Groom first" }] },
      ...(i.local ? [{ key: "localMessage", kind: "longtext" as const, max: 700, label: `Invitation in ${i.local.label}`, hidden: true }] : []),
      { key: "brideFamily", kind: "text", max: 120, label: "Bride's family", hidden: true },
      { key: "groomFamily", kind: "text", max: 120, label: "Groom's family", hidden: true },
      { key: "brideNote", kind: "text", max: 100, label: "Bride's family note", hidden: true },
      { key: "groomNote", kind: "text", max: 100, label: "Groom's family note", hidden: true },
      { key: "blessingsOf", kind: "text", max: 160, label: "With the blessings of", hidden: true },
      { key: "bridePhoto", kind: "number", min: 0, max: L.photos, default: 0, label: "Bride's family photo", hidden: true },
      { key: "groomPhoto", kind: "number", min: 0, max: L.photos, default: 0, label: "Groom's family photo", hidden: true },
      { key: "couplePhoto", kind: "number", min: 0, max: L.photos, default: 0, label: "Couple portrait", hidden: true },
      { key: "muhurat", kind: "text", max: 60, label: "Ceremony time note", hidden: true },
      { key: "hashtag", kind: "text", max: 40, label: "Wedding hashtag", hidden: true },
      {
        key: "events", kind: "objlist", maxItems: L.events, minItems: 1, label: "Functions", itemTitle: "Function", hidden: true,
        item: [
          ev("id", "Id", 24), ev("title", "Name", 40), ev("date", "Date", 10), ev("time", "Start", 5), ev("endTime", "End", 5),
          ev("venue", "Venue", 80), ev("address", "Address", 140), ev("mapUrl", "Google Maps link", 400),
          ev("dressCode", "Dress code", 60), ev("dressColor", "Dress colour", 7), ev("note", "Note", 200),
        ],
      },
      {
        key: "story", kind: "objlist", maxItems: L.story, label: "Our story", itemTitle: "Chapter", hidden: true,
        item: [ev("when", "When", 24), ev("title", "Title", 60), ev("line", "What happened", 240), { key: "photo", kind: "number", label: "Photo", min: 0, max: L.photos, default: 0 }],
      },
      { key: "things", kind: "list", maxItems: L.faq, itemMax: 180, label: "Good to know", hidden: true },
      { key: "gettingThere", kind: "longtext", max: 500, label: "Getting there", hidden: true },
      { key: "videoUrl", kind: "text", max: 200, label: "Pre-wedding film", hidden: true },
      { key: "rsvpBy", kind: "text", max: 10, label: "Reply by", input: "date", hidden: true },
      { key: "maxGuests", kind: "number", min: 1, max: 10, default: 4, label: "Guests per reply", hidden: true },
      { key: "rsvpMeal", kind: "bool", default: true, label: "Ask for meal preference", hidden: true },
      { key: "blessings", kind: "bool", default: true, label: "Blessings wall", hidden: true },
      { key: "invocation", kind: "bool", default: true, label: "Invocation on the invitation", hidden: true },
      { key: "verse", kind: "text", max: 220, label: "Scripture on the card", hidden: true },
      { key: "verseRef", kind: "text", max: 40, label: "Scripture reference", hidden: true },
      {
        key: "contacts", kind: "objlist", maxItems: 4, label: "Contact persons", itemTitle: "Contact", hidden: true,
        item: [ev("name", "Name", 40), ev("relation", "Relation", 40), ev("phone", "Phone", 20)],
      },
      { key: "upiId", kind: "text", max: 80, label: "Gift UPI ID", hidden: true },
      { key: "upiName", kind: "text", max: 60, label: "Gift UPI name", hidden: true },
      { key: "liveUrl", kind: "text", max: 300, label: "Livestream link", hidden: true },
    ],
    theme: i.theme,
    demo: {
      recipientName: i.demo.bride,
      senderName: i.demo.groom,
      petName: "",
      letter: i.demo.letter,
      photos: album.photos.map((p) => ({ ...p })),
      gifs: {},
      music: true,
      musicMode: "youtube",
      musicYoutubeId: i.defaultSong,
      musicStart: 0,
      endLine: i.demo.endLine,
      extras: {
        theme: "champagne",
        lang: "en",
        nameOrder: "bride",
        ...(i.local ? { localMessage: i.demo.localMessage ?? "" } : {}),
        bridePhoto: 0,
        groomPhoto: 0,
        couplePhoto: album.portrait,
        videoUrl: "",
        maxGuests: 4,
        rsvpMeal: true,
        blessings: true,
        invocation: true,
        verse: "",
        verseRef: "",
        upiId: "",
        upiName: "",
        liveUrl: "",
        ...i.demo.extras,
        story,
        events: i.demo.events.map((e) => ({ ...e })),
      },
    },
    copy: {
      recipientPlaceholder: `e.g. ${i.demo.bride}`,
      senderPlaceholder: `e.g. ${i.demo.groom}`,
      petNamePlaceholder: "",
      letterPlaceholder: i.copy.letterPlaceholder,
      letterHint: "The words your guests read first.",
      photosHint: "Any shape works. Tap a photo to resize it or set its focus. Drag to reorder.",
      captionHint: "caption — e.g. the engagement",
      noteHint: "",
      endLinePlaceholder: i.copy.endLinePlaceholder,
      endLineHint: "The closing line under the seal at the very end.",
      sheetTitle: i.copy.sheetTitle,
      sheetSub: "Describe your wedding and we'll fill in everything. Change any of it.",
      extrasTitle: "Functions",
      extrasSub: "Every function with its own map, timings and dress code.",
      publishing: i.copy.publishing,
      storyTitle: i.copy.storyTitle,
      replyText: "",
    },
    share: i.share,
  };
}
