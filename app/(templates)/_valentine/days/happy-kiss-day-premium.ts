// happy-kiss-day-premium — "A Thousand Kisses" (the ✦ Premium twin of happy-kiss-day).
//
// A perfume-ad love letter where kisses are the medium: a perfumed envelope,
// a wax seal warmed by a held finger, a game of catching falling kisses, the
// wow — two thousand tiny kisses that fly together into THEIR photo (the
// song's drop lands as it locks) — a letter written in lipstick on a misty
// mirror, a kiss booth that prints a strip they stamp with their own kiss,
// and "kiss the screen" back. Family-safe by default ("cute" = cheek,
// forehead and X's; "lipstick" is opt-in and still non-explicit).
// Server twin: server/src/config/premiumDays/happy-kiss-day-premium.ts (same
// keys + limits; valentineDays.test.ts pins them). kissStyle, lipShade,
// openingLine, kissTarget, kissNotes and kissBackText keep the $2 keys.

import type { SongSuggestion } from "../music/youtube";
import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { kissDay } from "./happy-kiss-day";

export type KissShade = "ruby" | "gulabi" | "berry" | "nude";

export interface KissExtrasPremium {
  kissStyle: "cute" | "lipstick";
  lipShade: KissShade;
  openingLine: string;
  kissTarget: number;
  kissNotes: string[];
  mosaicPhoto: number;
  sinceDate: string;
  kissCount: number;
  kissBackText: string;
  [k: string]: unknown;
}

/** One-tap songs: official uploads, each id checked against YouTube's oEmbed on 2026-10-08. */
export const KISS_PREMIUM_SONGS: readonly SongSuggestion[] = [
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh · Aashiqui 2" },
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh · Brahmāstra" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal · Shershaah" },
  { id: "vGJTaP6anOU", title: "Can't Help Falling in Love", artist: "Elvis Presley" },
  { id: "Cb6wuzOurPc", title: "Tum Se Hi", artist: "Mohit Chauhan · Jab We Met" },
];

const GIFS: GifSlot[] = [
  { id: "pk1-shy", label: "Shy", moment: "Peeking at the perfumed envelope", file: "pk1-shy.gif", emoji: "🙈", anim: "wiggle" },
  { id: "pk2-catch", label: "Catching", moment: "Beside the jar while they catch kisses", file: "pk2-catch.gif", emoji: "😘", anim: "bounce" },
  { id: "pk3-wow", label: "Heart eyes", moment: "After the kisses become your photo", file: "pk3-wow.gif", emoji: "😍", anim: "pulse" },
  { id: "pk4-mirror", label: "Lipstick", moment: "Corner of the mirror letter", file: "pk4-mirror.gif", emoji: "💄", anim: "float" },
  { id: "pk5-booth", label: "Booth", moment: "Peeking from the kiss-booth curtain", file: "pk5-booth.gif", emoji: "📸", anim: "wiggle" },
  { id: "pk6-back", label: "Your turn", moment: "Finale — kiss the screen back", file: "pk6-back.gif", emoji: "😚", anim: "pulse" },
];

const base = premiumDay<KissExtrasPremium>(kissDay, {
  slug: "happy-kiss-day-premium",
  title: "A Thousand Kisses",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "Counting them was a bad idea. I lost track at 412.",
    psLetter: "Open only when you miss me.\n\nClose your eyes. That was one. Now open them — that was another. I'll keep going till you're home.",
  },
  copy: {
    recipientPlaceholder: "who the kisses are for — e.g. Ananya",
    letterPlaceholder: "Written in lipstick on a misty mirror: every kiss you owe them and why — the goodnight ones you missed, the forehead one on a stressful day…",
    letterHint: "Writes itself in lipstick on a steamy mirror, line by line. Keep it sweet — this page is family-safe.",
    photosHint: "Your photos become the kiss mosaic and the kiss-booth strip. Pick which one turns into kisses below.",
    captionHint: "caption — e.g. our first selfie",
    endLinePlaceholder: "Sealed with a kiss. Opened with a smile 💋",
    endLineHint: "The last line, under the booth strip.",
    sheetTitle: "A thousand kisses 💋",
    sheetSub: "Pick your shade, the kisses to catch, the photo that turns into kisses and the day you met. Family-safe by default.",
    extrasTitle: "The kisses",
    extrasSub: "Style and shade, the envelope, the kiss game, the mosaic",
    publishing: "Sealing it with a kiss…",
    storyTitle: "Let's send a thousand kisses 💋",
    replyText: "Kissed the screen. Twice. Don't tell anyone 💋",
  },
});

export const kissDayPremium: DayConfig<KissExtrasPremium> = {
  ...base,
  music: { suggestions: KISS_PREMIUM_SONGS, suggestionsNote: "romantic favourites · tap to use" },
  extras: [
    {
      key: "kissStyle", kind: "enum", label: "Kiss style", display: "cards", default: "cute",
      hint: "Cute is family-safe: cheek and forehead kisses, X's and hearts. Lipstick adds glam lip-prints — still sweet.",
      options: [
        { value: "cute", label: "Cute", emoji: "😚", hint: "X's, hearts, cheek kisses" },
        { value: "lipstick", label: "Lipstick", emoji: "💄", hint: "glam lip-prints" },
      ],
    },
    {
      key: "lipShade", kind: "enum", label: "Your shade", display: "swatches", default: "ruby",
      hint: "Colours every kiss, the mirror letter and your stamp on the strip.",
      options: [
        { value: "ruby", label: "Ruby", swatch: "#B3122E" },
        { value: "gulabi", label: "Gulabi", swatch: "#D9466F" },
        { value: "berry", label: "Berry", swatch: "#7A1F4B" },
        { value: "nude", label: "Nude", swatch: "#C98A7A" },
      ],
    },
    {
      key: "openingLine", kind: "text", max: 60, label: "Written on the envelope",
      placeholder: "the line on the perfumed envelope they open first",
      suggestions: ["For your lips only 💋", "Sealed with a kiss. Open gently.", "1 unread kiss… and 1,999 more"],
    },
    {
      key: "kissTarget", kind: "number", min: 5, max: 30, default: 14, step: 1, unit: "kisses", label: "Kisses to catch",
      hint: "They drag a little jar to catch falling kisses. It never fails — misses just keep falling.",
    },
    {
      key: "kissNotes", kind: "list", maxItems: 6, minItems: 3, itemMax: 70, label: "“A kiss for…” — pop as they catch",
      hint: "3–6 slips that pop out of the jar while they play.",
      itemPlaceholder: "A kiss for every 'reached home?' text",
      addLabel: "+ add a kiss",
    },
    {
      key: "mosaicPhoto", kind: "number", min: 1, max: 12, default: 1, step: 1, label: "Which photo turns into kisses",
      hint: "Photo number from your photos above. Faces close-up work best.",
    },
    {
      key: "sinceDate", kind: "text", max: 10, input: "date", label: "The day you met",
      hint: "“This picture is made of N kisses — one for every day since we met.”",
    },
    {
      key: "kissCount", kind: "number", min: 0, max: 99999, default: 0, step: 1, unit: "kisses", label: "Or pick your own kiss count",
      hint: "Leave at 0 to count the days since you met.",
    },
    {
      key: "kissBackText", kind: "text", max: 80, label: "Their WhatsApp reply",
      placeholder: "what their kiss-back message says",
      hint: "Prefilled when they send a kiss back on WhatsApp.",
      suggestions: ["Kissed the screen. Twice. Don't tell anyone 💋"],
    },
  ],
  theme: {
    bg: "radial-gradient(120% 80% at 50% 0%, #FFF6EE 0%, #FBE3E8 48%, #F6CCD6 100%)",
    base: "#FBE3E8",
    paper: "#FFF6EE",
    glass: "rgba(255,255,255,0.66)",
    ink: "#3E0A1C",
    inkSoft: "#86506A",
    paperInk: "#3E0A1C",
    accent: "#C81D4E",
    accentDeep: "#7A0F2E",
    accentInk: "#FFFFFF",
    soft: "#FFE0EA",
    edge: "#F1C9D5",
    gold: "#D4AF37",
    dark: false,
    particles: ["💋", "💗", "✨"],
    confetti: ["#C81D4E", "#F28AA5", "#FFF6EE", "#D4AF37", "#7A1F4B"],
  },
  demo: {
    ...base.demo,
    letter:
      "If kisses were raindrops, I'd send you a whole monsoon today. Some nights I can't kiss you goodnight in person, so this page is my way of sending a few thousand of them through the screen.\n\nThank you for every forehead kiss when I was stressed, every \"bas, ho gaya, chill\", and every time you made a bad day soft.\n\nThis one is sealed with a kiss. Open it whenever you miss me.",
    endLine: "Sealed with a kiss. Opened with a smile 💋",
    extras: {
      kissStyle: "cute",
      lipShade: "ruby",
      openingLine: "For your lips only 💋",
      kissTarget: 14,
      kissNotes: [
        "A kiss for the way you laugh at your own jokes",
        "A kiss for every 'reached home?' text",
        "A kiss for your sleepy voice at midnight",
        "A kiss for being mine",
      ],
      mosaicPhoto: 1,
      sinceDate: "2022-03-14",
      kissCount: 0,
      kissBackText: "Kissed the screen. Twice. Don't tell anyone 💋",
    },
  },
};
