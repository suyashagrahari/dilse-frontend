// happy-kiss-day-premium — "Photo Booth" (the ✦ Premium twin of happy-kiss-day).
//
// A vintage photo booth behind a lacquer-red curtain. "Insert one kiss" starts
// their song; four flashes fire and a four-frame strip of THEIR photos prints
// and drops on the beat (the money moment), each frame developing in turn.
// They turn every frame over to read what's written on the back, hear the
// booth's recording (voice note), read the letter on a long booth receipt and
// tear it off, then kiss the screen, and their kiss lands on the strip they
// keep. Family-safe: kisses stay sweet; "cute" stamps a heart instead of lips.
// Server twin: server/src/config/premiumDays/happy-kiss-day-premium.ts (same
// keys + limits; valentineDays.test.ts pins them). kissStyle, lipShade,
// openingLine, kissNotes and kissBackText keep the $2 keys.

import type { SongSuggestion } from "../music/youtube";
import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { demoPhotos } from "./_shared";
import { kissDay } from "./happy-kiss-day";

export type KissShade = "ruby" | "gulabi" | "berry" | "nude";

export interface KissExtrasPremium {
  kissStyle: "cute" | "lipstick";
  lipShade: KissShade;
  stripTone: "mono" | "colour";
  openingLine: string;
  kissFrame: number;
  kissNotes: string[];
  sinceDate: string;
  kissBackText: string;
  [k: string]: unknown;
}

/** research.md §E (oEmbed 200 + playableInEmbed, 2026-10-09). The first one is the preview's song, from DEMO_START. */
export const PHOTO_BOOTH_SONGS: readonly SongSuggestion[] = [
  { id: "Jnq9wPDoDKg", title: "Kiss Me", artist: "Sixpence None The Richer" },
  { id: "-BjZmE2gtdo", title: "Lover", artist: "Taylor Swift" },
  { id: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh · Jawan" },
  { id: "Nnop2walGmM", title: "Tum Se", artist: "Teri Baaton Mein Aisa Uljha Jiya" },
  { id: "v45F0YesdZM", title: "Kiss Me (artist upload)", artist: "Sixpence None The Richer" },
];
/**
 * The v1 romantic list. Kept ONLY because happy-hug-day-premium.ts imports it
 * by this name (another builder's file); this day uses PHOTO_BOOTH_SONGS.
 */
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
/** "Kiss Me": the "so kiss me" chorus (YouTube's most-replayed marker, −2 s). */
const DEMO_START = 37;

// Two quiet spots only: a GIF peeking from the booth while the strip prints,
// and one waiting on the glass before they kiss it. Everything else is photos.
const GIFS: GifSlot[] = [
  { id: "pb1-booth", label: "In the booth", moment: "Peeking beside the strip as it prints", file: "pb1-booth.gif", emoji: "📸", anim: "wiggle" },
  { id: "pb2-kiss", label: "Your turn", moment: "On the glass, before they kiss the screen", file: "pb2-kiss.gif", emoji: "😚", anim: "pulse" },
];

const base = premiumDay<KissExtrasPremium>(kissDay, {
  slug: "happy-kiss-day-premium",
  title: "Photo Booth",
  gifSlots: GIFS,
  demoSong: { id: PHOTO_BOOTH_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    voiceCaption: "The booth gave us four frames. I'd have stayed for four hundred.",
    psLetter:
      "Open only when you can't sleep.\n\nThe booth ate our coins twice before it worked. You said it was a sign to stop. I said it was a sign to try again. I'm still glad I won that one.",
    songDropAt: DEMO_START,
  },
  copy: {
    recipientPlaceholder: "who the booth is for — e.g. Ananya",
    letterPlaceholder: "Printed on a long booth receipt they tear off: the kisses you owe them and why — the goodnight ones you missed, the forehead one on a stressful day…",
    letterHint: "Prints on a booth receipt in typewriter type. Short paragraphs read best. Keep it sweet: this page is family-safe.",
    photosHint: "Your first photos print as the four-frame booth strip (pick which one is “the kiss” below). Each caption and note is written on the back of its frame. Photos 5–12 become the outtakes.",
    captionHint: "written on the back — e.g. the first try",
    endLinePlaceholder: "Four frames. One kiss. No retakes.",
    endLineHint: "The last line, under the strip they keep.",
    sheetTitle: "Photo booth 📸",
    sheetSub: "Choose your kiss mark and shade, black-and-white or colour, the line on the booth and what's on the receipt. Family-safe by default.",
    extrasTitle: "The booth",
    extrasSub: "Kiss mark, shade, the strip, the receipt",
    publishing: "Printing your strip…",
    storyTitle: "Let's load the photo booth 📸",
    replyText: "Kissed the screen. It's on the strip now, no take-backs 💋",
  },
});

export const kissDayPremium: DayConfig<KissExtrasPremium> = {
  ...base,
  music: { audioOnly: true, suggestions: PHOTO_BOOTH_SONGS, suggestionsNote: "kiss songs · tap to use", demoStart: DEMO_START },
  extras: [
    {
      key: "kissStyle", kind: "enum", label: "Your kiss mark", display: "cards", default: "lipstick",
      hint: "The mark that lands on the strip when they kiss the screen. Both are sweet.",
      options: [
        { value: "lipstick", label: "Lipstick", emoji: "💋", hint: "a real lip-print" },
        { value: "cute", label: "Cute", emoji: "😚", hint: "a little heart stamp" },
      ],
    },
    {
      key: "lipShade", kind: "enum", label: "Your shade", display: "swatches", default: "ruby",
      hint: "Colours the kiss marks and the booth's light.",
      options: [
        { value: "ruby", label: "Ruby", swatch: "#B3122E" },
        { value: "gulabi", label: "Gulabi", swatch: "#D9466F" },
        { value: "berry", label: "Berry", swatch: "#7A1F4B" },
        { value: "nude", label: "Nude", swatch: "#C98A7A" },
      ],
    },
    {
      key: "stripTone", kind: "enum", label: "The strip", display: "cards", default: "mono",
      hint: "Classic booths print in black and white, which makes every photo look like one film.",
      options: [
        { value: "mono", label: "Black & white", emoji: "🎞️", hint: "the classic booth" },
        { value: "colour", label: "Colour", emoji: "🌈", hint: "warm film colour" },
      ],
    },
    {
      key: "openingLine", kind: "text", max: 60, label: "On the booth",
      placeholder: "the line under their name on the curtain",
      suggestions: ["Four frames. One kiss. No retakes.", "Sit close. Closer. Perfect.", "One kiss per strip, please."],
    },
    {
      key: "kissFrame", kind: "number", min: 1, max: 12, default: 4, step: 1, label: "Which photo is “the kiss”",
      hint: "Photo number from your photos above. It prints as the last frame of the strip.",
    },
    {
      key: "kissNotes", kind: "list", maxItems: 6, minItems: 3, itemMax: 70, label: "On the receipt: kisses owed",
      hint: "3–6 line items printed under your letter, each one a kiss you owe them.",
      itemPlaceholder: "A kiss for every 'reached home?' text",
      addLabel: "+ add a kiss",
    },
    {
      key: "sinceDate", kind: "text", max: 10, input: "date", label: "Together since",
      hint: "The receipt counts the days.",
    },
    {
      key: "kissBackText", kind: "text", max: 80, label: "Their WhatsApp reply",
      placeholder: "what their kiss-back message says",
      hint: "Prefilled when they send a kiss back on WhatsApp.",
      suggestions: ["Kissed the screen. It's on the strip now, no take-backs 💋"],
    },
  ],
  theme: {
    bg: "radial-gradient(120% 70% at 50% 0%, #3a0a10 0%, #160607 55%, #0b0607 100%)",
    base: "#0b0607",
    paper: "#F4EDE1",
    glass: "rgba(20,12,13,0.62)",
    ink: "#F4EDE1",
    inkSoft: "#C9B8B0",
    paperInk: "#1a1112",
    accent: "#E5677D",
    accentDeep: "#C1121F",
    accentInk: "#FFFFFF",
    soft: "#3a1418",
    edge: "rgba(244,237,225,0.16)",
    gold: "#C9CED6",
    dark: true,
    particles: ["💋", "📸", "✨"],
    confetti: ["#C1121F", "#E5677D", "#F4EDE1", "#C9CED6", "#111111"],
  },
  demo: {
    ...base.demo,
    letter:
      "Remember the booth? You said we'd look silly. We looked silly. It's still my favourite picture of us.\n\nSome nights I can't kiss you goodnight in person, so I built you a booth instead. Four frames, because that's all the machine allowed. I'd have stayed for four hundred.\n\nThank you for every forehead kiss on a stressful day, every \"bas, ho gaya, chill\", and every time you made a bad day soft.\n\nThis one is sealed with a kiss. Keep the strip.",
    photos: demoPhotos([
      ["the first try", "You blinked. We kept it anyway."],
      ["the one where you laughed", "I said something stupid. Worth it."],
      ["the serious one", "Lasted exactly 0.4 seconds."],
      ["the kiss", "No retakes needed."],
    ]),
    endLine: "Four frames. One kiss. No retakes.",
    extras: {
      kissStyle: "lipstick",
      lipShade: "ruby",
      stripTone: "mono",
      openingLine: "Sit close. Closer. Perfect.",
      kissFrame: 4,
      kissNotes: [
        "A kiss for the way you laugh at your own jokes",
        "A kiss for every 'reached home?' text",
        "A kiss for your sleepy voice at midnight",
        "A kiss for being mine",
      ],
      sinceDate: "2022-03-14",
      kissBackText: "Kissed the screen. It's on the strip now, no take-backs 💋",
    },
  },
};
