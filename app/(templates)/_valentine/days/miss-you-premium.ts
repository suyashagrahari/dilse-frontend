// ─── Miss You ✦ Premium — "two dots on a map, and the distance shrinking" ────
//
// The premium edition of Miss You, on the Valentine engine. Server twin:
// server/src/config/valentineDays.ts ("miss-you-premium"); keys and limits
// must match (valentineDays.test.ts pins them).
//
// One long-distance day, told from morning to the next sunrise. Every scene
// is a new toy (none of Miss You's mechanics) — app/(templates)/miss-you-
// premium/components:
//   draw the curtains open (a skywriter writes their name) → tune the radio to
//   find "our frequency" (voice notes, as text) → pull a photo-booth strip out
//   of the slot (the photos develop) → a picnic date: drag things onto the
//   blanket → tear the calendar pages off down to the day we meet (a live
//   countdown) → drag the bottle out of the waves and pop the cork (the
//   letter) → tap along until our two heartbeats sync → join the stars into
//   our initials on a lilac dusk sky (each line lights a "thing I miss") →
//   "Video call tonight?" on a tin-can phone (yes, or an honest "later") →
//   sunrise: the two dots meet, and an airmail postcard keepsake.
//
// Across the top, the two dots creep toward each other scene by scene and the
// kilometres count down to 0 at the finale.

import type { DayConfig, GifSlot } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { TRACK_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "miss-you-premium" as const;

export type MissPremTone = "partner" | "crush" | "bestie";
export type MissPremPalette = "cottonCandy" | "lavenderPostcard" | "peachAirmail" | "mintBreeze";
export type MissPremUnit = "km" | "mi";

export interface MissPremExtras {
  palette: MissPremPalette;
  tone: MissPremTone;
  openingLine: string;
  /** The recipient's city. */
  yourCity: string;
  /** The sender's city. */
  myCity: string;
  /** 0 = work it out from the two cities (when both are known). Always stored in km. */
  distanceKm: number;
  unit: MissPremUnit;
  /** "YYYY-MM-DD", or "" for "soon". */
  meetDate: string;
  /** Up to three "voice notes" found on the radio dial. */
  voiceNotes: string[];
  /** One line per picnic item, in PICNIC_ITEMS order. */
  picnicLines: string[];
  heartLine: string;
  /** Lit one by one as the stars are joined. */
  missThings: string[];
  question: string;
  yesLine: string;
  /** "yesOnly" — only Yes · "noAfterTries" — Yes, or an honest "Later 🌙" (records a gentle "later"). */
  answerMode: "yesOnly" | "noAfterTries";
  [k: string]: unknown;
}

/** The sky at each hour of the day the page walks through. */
export type SkyHour = "morning" | "noon" | "afternoon" | "golden" | "sunset" | "dusk" | "sunrise";

/** One look: the page theme plus the paints the scenes use. */
export interface MissPremPaletteDef {
  label: string;
  swatch: string;
  theme: DayTheme;
  /** Pale highlight (cards, the curtains' lining, the blanket's checks). */
  blush: string;
  /** The deepest tint (outlines, the pill's lip). */
  deep: string;
  /** The second colour (the other dot, stripes, the stamp). */
  pop: string;
  /** Sky gradients, top → horizon, for every hour (all light — even dusk is pastel lilac). */
  skies: Record<SkyHour, readonly [string, string]>;
  floats: readonly string[];
}

const pal = (
  label: string,
  c: { bg: string; bg2: string; surface: string; primary: string; accent: string; accentDeep: string; text: string; textSoft: string; soft: string; edge: string; blush: string; deep: string; pop: string },
  skies: Record<SkyHour, readonly [string, string]>,
  floats: readonly string[],
  confetti: readonly string[],
): MissPremPaletteDef => ({
  label,
  swatch: c.accent,
  blush: c.blush,
  deep: c.deep,
  pop: c.pop,
  skies,
  floats,
  theme: {
    bg: `radial-gradient(120% 70% at 50% 0%, ${c.surface} 0%, ${c.bg} 50%, ${c.bg2} 100%)`,
    base: c.bg,
    paper: c.surface,
    glass: "rgba(255,255,255,0.66)",
    ink: c.text,
    inkSoft: c.textSoft,
    paperInk: c.text,
    accent: c.accent,
    accentDeep: c.accentDeep,
    accentInk: "#FFFFFF",
    soft: c.soft,
    edge: c.edge,
    gold: c.primary,
    dark: false,
    particles: floats,
    confetti,
  },
});

/** The four looks — all daylight pastels; the dusk scenes turn lilac, never dark. */
export const MISS_PREM_PALETTES: Record<MissPremPalette, MissPremPaletteDef> = {
  cottonCandy: pal(
    "Cotton Candy Sky",
    { bg: "#FFF2F8", bg2: "#E6E8FF", surface: "#FFFFFF", primary: "#F8A9CC", accent: "#EC5F9C", accentDeep: "#C23F79", text: "#47233F", textSoft: "#76506C", soft: "#FFE3F0", edge: "#F5C6DC", blush: "#FFD9EA", deep: "#A3336A", pop: "#7FA8F5" },
    {
      morning: ["#D7E8FF", "#FFE6F1"],
      noon: ["#CBE4FF", "#F1F6FF"],
      afternoon: ["#D9E6FF", "#FFEFE4"],
      golden: ["#FFD9C7", "#FFF0D6"],
      sunset: ["#F9C4DA", "#FFDCC4"],
      dusk: ["#D8CCF6", "#FBD7E7"],
      sunrise: ["#FFD4E4", "#FFF1D9"],
    },
    ["💗", "☁️", "🩷", "✨"],
    ["#EC5F9C", "#F8A9CC", "#FFFFFF", "#7FA8F5", "#FFD86B"],
  ),
  lavenderPostcard: pal(
    "Lavender Postcard",
    { bg: "#F6F1FF", bg2: "#E4DAFF", surface: "#FFFFFF", primary: "#C6B3F7", accent: "#8A63E6", accentDeep: "#6943C6", text: "#30245A", textSoft: "#5F5486", soft: "#ECE5FF", edge: "#D7CBFA", blush: "#E6DDFF", deep: "#5434B0", pop: "#F59BC0" },
    {
      morning: ["#E0DAFF", "#FFEAF3"],
      noon: ["#DCD9FF", "#F5F3FF"],
      afternoon: ["#E3DCFF", "#FFEFF2"],
      golden: ["#FAD6E2", "#FFF0DA"],
      sunset: ["#E7C8F4", "#FFD9D0"],
      dusk: ["#D3C6F6", "#F3D6EE"],
      sunrise: ["#F0D3F2", "#FFF0DE"],
    },
    ["💜", "💌", "🫧", "✨"],
    ["#8A63E6", "#C6B3F7", "#FFFFFF", "#F59BC0", "#FFE08A"],
  ),
  peachAirmail: pal(
    "Peach Airmail",
    { bg: "#FFF5EE", bg2: "#FFDDCB", surface: "#FFFDFA", primary: "#FFC0A0", accent: "#E8694A", accentDeep: "#BE4C2F", text: "#4F2A1E", textSoft: "#80594A", soft: "#FFE8DA", edge: "#FBCDB5", blush: "#FFE0CF", deep: "#A6432A", pop: "#6FA4E8" },
    {
      morning: ["#D6E9FF", "#FFE9DC"],
      noon: ["#CFE6FF", "#FFF6EE"],
      afternoon: ["#DCEBFF", "#FFEBDD"],
      golden: ["#FFD3B8", "#FFF0CF"],
      sunset: ["#FFC2B4", "#FFE2C0"],
      dusk: ["#DCCDF4", "#FFD8D0"],
      sunrise: ["#FFD2C2", "#FFF3D6"],
    },
    ["🧡", "✉️", "☁️", "✨"],
    ["#E8694A", "#FFC0A0", "#FFFDFA", "#6FA4E8", "#FFD86B"],
  ),
  mintBreeze: pal(
    "Mint Breeze",
    { bg: "#EFFBF6", bg2: "#D2F1E4", surface: "#FFFFFF", primary: "#9EDDC5", accent: "#23977A", accentDeep: "#18765F", text: "#1C3D33", textSoft: "#486C61", soft: "#DAF5EA", edge: "#B4E6D3", blush: "#D3F2E6", deep: "#145E4B", pop: "#F59AB5" },
    {
      morning: ["#D3EEFF", "#E8FFF5"],
      noon: ["#CCEBFA", "#F3FFFA"],
      afternoon: ["#D6F0FF", "#FFF4E6"],
      golden: ["#FFE1C4", "#F2FFE8"],
      sunset: ["#FBD0DA", "#FFE7C9"],
      dusk: ["#D3CFF4", "#D8F4EA"],
      sunrise: ["#FFDCD6", "#F0FFF2"],
    },
    ["💚", "🌿", "☁️", "✨"],
    ["#23977A", "#9EDDC5", "#FFFFFF", "#F59AB5", "#FFE08A"],
  ),
};

export const MISS_PREM_PALETTE_KEYS = Object.keys(MISS_PREM_PALETTES) as MissPremPalette[];

/** What "who it's for" changes when the sender leaves a field empty. */
export const MISS_PREM_TONES: Record<
  MissPremTone,
  { question: string; yes: string; later: string; reply: string; laterReply: string; stamp: string }
> = {
  partner: {
    question: "Video call tonight? 📞🥺",
    yes: "Yes, call me 💗",
    later: "Later, I promise 🌙",
    reply: "I miss you more 🥹💗 Call me tonight?",
    laterReply: "Not tonight, but soon, I promise 🌙💗 I miss you.",
    stamp: "Distance means nothing",
  },
  crush: {
    question: "Can I call you tonight? 🙈",
    yes: "Okay, call me 🙈",
    later: "Maybe later 🌙",
    reply: "Okay fine… I kinda miss you too 🙈 Call me?",
    laterReply: "Not tonight 🌙 but I liked this a lot 🙈",
    stamp: "Closer than it looks",
  },
  bestie: {
    question: "Bestie, call tonight? 📞",
    yes: "Obviously, call me 😤💗",
    later: "Tomorrow, bestie 🌙",
    reply: "Miss you too, idiot 😤💗 Call me tonight!",
    laterReply: "Tomorrow, pakka 🌙 Miss you, bestie 💗",
    stamp: "Bestie, across any map",
  },
};

/** The picnic things she drags onto the blanket, each with the sender's line. */
export const PICNIC_ITEMS: readonly { id: string; emoji: string; label: string }[] = [
  { id: "basket", emoji: "🧺", label: "The basket" },
  { id: "chai", emoji: "☕", label: "Chai" },
  { id: "berries", emoji: "🍓", label: "Strawberries" },
  { id: "music", emoji: "🎧", label: "One earphone each" },
  { id: "flowers", emoji: "🌻", label: "Sunflowers" },
];

export const DEFAULT_PICNIC_LINES: readonly string[] = [
  "Packed with everything you like. And nothing you don't.",
  "Two cutting chais. Yours, and the half of mine you'll steal.",
  "I'll feed you the biggest one. Don't argue.",
  "Our playlist, one earphone each, heads touching.",
  "Because you said they look like happy little suns.",
];

export const DEFAULT_VOICE_NOTES: readonly string[] = [
  "Good morning, sleepyhead. Did you drink water? Okay, now drink water. Miss you.",
  "Just saw a dog that looked exactly like your sleepy face. Had to tell you. I miss you.",
  "Goodnight in advance. If you wake up at 3, I'm probably awake thinking about you too.",
];

export const DEFAULT_MISS_THINGS: readonly string[] = [
  "Your head on my shoulder in auto rides.",
  "How you hum when you think nobody's listening.",
  "Fighting over the last bite, then sharing it anyway.",
  "Your hand finding mine without even looking.",
  "The way you say my name when you're sleepy.",
  "Doing absolutely nothing, together.",
];

/**
 * Long-distance songs, English and Hindi, one tap each in the form; the sender
 * can still paste any YouTube link. Official artist/label uploads — every id
 * checked with YouTube oEmbed and the embed player on 2026-10-14. Audio only.
 */
export const MISS_PREM_SONGS: readonly SongSuggestion[] = [
  { id: "nSDgHBxUbVQ", title: "Photograph", artist: "Ed Sheeran" },
  { id: "cYOB941gyXI", title: "Hawayein", artist: "Arijit Singh" },
  { id: "fXw0jcYbqdo", title: "Talking to the Moon", artist: "Bruno Mars" },
  { id: "mQiiw7uRngk", title: "Tera Ban Jaunga", artist: "Akhil Sachdeva & Tulsi Kumar" },
  { id: "4DbeYbcZAJE", title: "Distance", artist: "Emily King" },
  { id: "iAIBF2ngbWY", title: "Pehle Bhi Main", artist: "Vishal Mishra" },
  { id: "5qrTmNDZ-nc", title: "I'll Be", artist: "Edwin McCain" },
  { id: "AgX2II9si7w", title: "Tujhe Kitna Chahne Lage", artist: "Arijit Singh" },
  { id: "acvIVA9-FMQ", title: "Lucky", artist: "Jason Mraz ft. Colbie Caillat" },
  { id: "QXJyMpxd210", title: "Ve Kamleya", artist: "Arijit Singh & Shreya Ghoshal" },
];

/** The page's own song (music mode "track"), from our CDN, so it starts on the first tap. */
export const MISS_PREM_TRACK = {
  url: "https://cdn.subhsandesh.in/gifts-media/missyou-gf/music/thinkingoutloud.mp3",
  title: "Thinking Out Loud",
  artist: "Ed Sheeran",
  hint: "Ed Sheeran · plays first",
} as const;

const GIFS: GifSlot[] = [
  { id: "p1-hello", label: "Good morning", moment: "Peeking in when the curtains open", file: "p1-hello.webp", emoji: "☀️", anim: "wiggle" },
  { id: "p2-radio", label: "Vibing", moment: "Dancing by the radio", file: "p2-radio.webp", emoji: "📻", anim: "bounce" },
  { id: "p3-picnic", label: "Picnic", moment: "On the picnic blanket", file: "p3-picnic.webp", emoji: "🧺", anim: "float" },
  { id: "p4-heart", label: "Heartbeat", moment: "When your heartbeats sync", file: "p4-heart.webp", emoji: "💓", anim: "pulse" },
  { id: "p5-miss", label: "Missing you", moment: "Under your constellation", file: "p5-miss.webp", emoji: "🥺", anim: "float" },
  { id: "p6-yes", label: "Yay!", moment: "After they say yes", file: "p6-yes.webp", emoji: "💗", anim: "bounce" },
];

/** "YYYY-MM-DD", `days` from today (local), for the demo's countdown. */
function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const missYouPremiumDay: DayConfig<MissPremExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Miss You ✦ Premium — Two Dots, One Heart",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 30,
  asksQuestion: true,
  melody: "lantern",
  photoAspect: 1,
  gifSlots: GIFS,
  topBar: true,
  brandMark: "stacked",
  music: {
    audioOnly: true,
    compact: true,
    track: MISS_PREM_TRACK,
    suggestions: MISS_PREM_SONGS,
    suggestionsNote: "English + Hindi long-distance songs · tap one, or paste any YouTube link",
  },
  extras: [
    {
      key: "palette", kind: "enum", label: "Pick the look", display: "swatches", default: "cottonCandy",
      hint: "The whole page turns this colour — the skies, the radio, the blanket, the postcard.",
      options: MISS_PREM_PALETTE_KEYS.map((k) => ({ value: k, label: MISS_PREM_PALETTES[k].label, swatch: MISS_PREM_PALETTES[k].swatch })),
    },
    {
      key: "tone", kind: "enum", label: "Who are you missing?", display: "cards", default: "partner",
      hint: "Changes the default question, the postcard stamp and the reply they send back.",
      options: [
        { value: "partner", label: "My love", emoji: "💗", hint: "girlfriend, boyfriend, spouse" },
        { value: "crush", label: "My crush", emoji: "🙈", hint: "it's complicated" },
        { value: "bestie", label: "My bestie", emoji: "🫶", hint: "best friend" },
      ],
    },
    {
      key: "openingLine", kind: "text", max: 60, label: "When the curtains open",
      placeholder: "your good-morning line",
      hint: "They draw the curtains open, a little plane writes their name in the sky, and this line appears.",
      suggestions: ["Same sky, different cities 🩵", "Woke up missing you ☀️", "Uthiye janab, someone misses you ☀️"],
    },
    {
      key: "yourCity", kind: "text", max: 30, label: "Their city",
      placeholder: "e.g. Mumbai",
      hint: "Your two cities are the two dots. They creep closer with every scene.",
      suggestions: ["Mumbai", "Delhi", "Bengaluru", "Toronto"],
    },
    {
      key: "myCity", kind: "text", max: 30, label: "Your city",
      placeholder: "e.g. Bengaluru",
      suggestions: ["Bengaluru", "Pune", "Hyderabad", "London"],
    },
    {
      key: "distanceKm", kind: "number", min: 0, max: 20000, default: 0, step: 1, unit: "km",
      label: "How many km apart? (optional)",
      hint: "Leave it at 0 and we'll work it out for most big cities.",
    },
    {
      key: "unit", kind: "enum", label: "Show the distance in", display: "chips", default: "km",
      options: [
        { value: "km", label: "Kilometres" },
        { value: "mi", label: "Miles" },
      ],
    },
    {
      key: "meetDate", kind: "text", max: 10, input: "date", label: "When will you see them? (optional)",
      hint: "They tear calendar pages off down to this day, then a live countdown starts. Empty = “soon”.",
    },
    {
      key: "voiceNotes", kind: "list", maxItems: 3, itemMax: 90, label: "Voice notes on the radio",
      hint: "They turn the dial to find your frequency. Each station plays one of these, like a voice note (as text).",
      itemLabels: ["📻 Station 1", "📻 Station 2", "📻 Station 3"],
      itemPlaceholder: DEFAULT_VOICE_NOTES,
    },
    {
      key: "picnicLines", kind: "list", maxItems: 5, itemMax: 70, label: "Our picnic date",
      hint: "They drag each thing onto the blanket and read your line for it.",
      itemLabels: PICNIC_ITEMS.map((p) => `${p.emoji} ${p.label}`),
      itemPlaceholder: DEFAULT_PICNIC_LINES,
    },
    {
      key: "heartLine", kind: "text", max: 80, label: "When your heartbeats sync",
      placeholder: "what they read when the two hearts beat as one",
      hint: "They tap along with your heartbeat until both hearts beat together (their phone buzzes with it).",
      suggestions: ["Two cities, one heartbeat. Yours. 💓", "Dil se dil tak, no distance at all 💓"],
    },
    {
      key: "missThings", kind: "list", maxItems: 6, itemMax: 70, label: "Things I miss about you",
      hint: "They join the stars into your initials on a lilac dusk sky — each line they draw lights one of these.",
      itemLabels: ["Star 1", "Star 2", "Star 3", "Star 4", "Star 5", "Star 6"],
      itemPlaceholder: DEFAULT_MISS_THINGS,
    },
    {
      key: "question", kind: "text", max: 60, label: "The question",
      placeholder: "leave empty to use the one for who it's for",
      hint: "Asked on a little tin-can phone. You'll see their answer on your page card and by email.",
      suggestions: ["Video call tonight? 📞🥺", "Can I see you this weekend? 💗", "Chai over video call? ☕"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "After they say yes",
      placeholder: "what you'd say the second they say yes",
      suggestions: ["Calling you at 10. Wear the hoodie I left 🥹"],
    },
    {
      key: "answerMode", kind: "enum", label: "How can they answer?", display: "cards", default: "noAfterTries",
      hint: "Either way you'll see their answer on your page card and when you open your own link.",
      options: [
        { value: "noAfterTries", label: "Yes, or “Later”", emoji: "🌙", hint: "an honest “later” is okay too" },
        { value: "yesOnly", label: "Only Yes", emoji: "💗", hint: "there's just one button" },
      ],
    },
  ],
  // The editor's own chrome (the form, its inputs) stays Cotton Candy; the page itself wears the pick.
  theme: MISS_PREM_PALETTES.cottonCandy.theme,
  demo: {
    recipientName: "Riya",
    senderName: "Aarav",
    petName: "Cutu",
    letter:
      "I'm writing this from a city that still doesn't feel like home, because home is wherever you're laughing at my bad jokes.\n\nSome days the distance is loud. I reach for your hand in the auto, I turn to tell you something, and there's just empty air. Then your “good morning” text arrives and the whole day softens.\n\nThank you for every late-night call where we both fell asleep, for the voice notes I replay on the metro, for choosing us even when it's hard.\n\nI'm counting the days. And when I see you, I'm not letting go for a very long time.",
    photos: demoPhotos([
      ["the day you left", "I smiled at the station. Cried in the cab. Don't tell anyone."],
      ["our last chai date", "Two cutting chais, one umbrella, zero plans. Perfect."],
      ["your birthday", "Your face when you saw the cake. I want that again."],
      ["us, soon", "Next photo is in person. Promise."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...TRACK_DEMO,
    endLine: "Distance means so little when someone means so much 💗",
    extras: {
      palette: "cottonCandy",
      tone: "partner",
      openingLine: "Same sky, different cities 🩵",
      yourCity: "Mumbai",
      myCity: "Bengaluru",
      distanceKm: 0,
      unit: "km",
      meetDate: isoInDays(23),
      voiceNotes: [...DEFAULT_VOICE_NOTES],
      picnicLines: [...DEFAULT_PICNIC_LINES],
      heartLine: "Two cities, one heartbeat. Yours. 💓",
      missThings: [...DEFAULT_MISS_THINGS],
      question: "Video call tonight? 📞🥺",
      yesLine: "Calling you at 10. Wear the hoodie I left 🥹",
      answerMode: "noAfterTries",
    },
  },
  copy: {
    recipientPlaceholder: "who you're missing — e.g. Riya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — cutu, jaan, baby…",
    letterPlaceholder: "Tell them what you miss, how the distance feels, and what you'll do the moment you see them again.",
    letterHint: "It washes up in a glass bottle. They pull it out of the waves and pop the cork.",
    photosHint: "Your photos come out of a photo booth as a strip, developing one by one.",
    captionHint: "caption — e.g. the day you left",
    noteHint: "what you remember about that moment…",
    endLinePlaceholder: "Distance means so little when someone means so much 💗",
    endLineHint: "The last line, handwritten on the back of their airmail postcard.",
    sheetTitle: "Two dots, one heart 🩵",
    sheetSub: "Pick a colour, your two cities, the day you'll meet, your voice notes, a picnic date and the things you miss. Everything is pre-filled, so make it yours.",
    extrasTitle: "Your long-distance day",
    extrasSub: "The colour, who it's for, your cities, the radio, the picnic, the countdown, the stars and the question",
    publishing: "Stamping your postcard…",
    storyTitle: "Let's tell them how much you miss them 🩵",
    replyText: "I miss you more 🥹💗 Call me tonight?",
    yesChip: "Said yes 📞",
  },
  share: { title: "Two dots on a map… one of them is you 🩵 Open this", accent: "#C23F79" },
};
