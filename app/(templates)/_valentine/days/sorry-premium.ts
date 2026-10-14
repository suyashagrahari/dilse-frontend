// ─── I'm Sorry ✦ Premium — "After the Rain" ──────────────────────────────────
//
// The premium edition of Sorry (./sorry.ts), on the same engine. Server twin:
// server/src/config/valentineDays.ts ("sorry-premium"); keys and limits must
// match (valentineDays.test.ts pins them).
//
// One idea runs through every scene: the sky starts as a soft pastel drizzle
// and clears a little with everything she does, until a rainbow comes out.
// The order follows what research says makes an apology land (own it, show you
// understand how it felt, say what you learnt, a concrete repair plan, and only
// then ask, with "I need a little time" as a real, warm answer):
//   a little umbrella bear knocks at her door (a knock-knock she answers) →
//   water the wilted flower (drag the can over it) till it blooms with "what I
//   did" → mend the cracked heart (drag a plaster onto each crack: how it made
//   her feel) → crack three fortune cookies (what I learnt) → the jar of paper
//   stars (shake it; each star unfolds one thing I love about you, plus the
//   days together) → our sunny days (photos pegged on a washing line) → the
//   letter as a paper boat she sails across the puddle → the peace contract
//   (my promises; she signs with her finger) → "Forgive me?" (Yes, or "I need a
//   little time") → push the last clouds away: a rainbow, falling petals → the
//   Peace Treaty keepsake.
//
// No mechanic is shared with Sorry: no envelope seal, slider, scratch card,
// bubbles, letter-tap, hold-to-promise, coupons, runaway No or certificate.

import type { DayConfig, GifSlot } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { TRACK_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "sorry-premium" as const;

export type SpTone = "sweet" | "heartfelt" | "silly";
export type SpPalette = "rainyBlush" | "mintMorning" | "lilacDrizzle" | "peachSunbreak";

export interface SpExtras {
  palette: SpPalette;
  tone: SpTone;
  /** yyyy-mm-dd, optional — "days together" on the star jar and the treaty. */
  togetherSince: string;
  /** What the umbrella bear says when she opens the door. */
  knockLine: string;
  /** "What I did" — it blooms on the flower. */
  confession: string;
  /** One per plaster: how it must have felt for her. */
  feelings: string[];
  /** One per fortune cookie: what I learnt. */
  lessons: string[];
  /** Paper stars in the jar: things I love about you. */
  stars: string[];
  /** The clauses of the peace contract. */
  promises: string[];
  question: string;
  yesLine: string;
  /** "yesOnly" — just Yes · "noAfterTries" — Yes, or an honest "I need a little time" (recorded as a gentle no). */
  answerMode: "yesOnly" | "noAfterTries";
  [k: string]: unknown;
}

/** One look: the page theme, the rainy and the sunny sky, and a few extra paints. */
export interface SpPaletteDef {
  label: string;
  swatch: string;
  theme: DayTheme;
  /** Pale tint (plasters, star paper, cards). */
  blush: string;
  /** The deepest tint (outlines, the pill's lip). */
  deep: string;
  /** The drizzly sky, top → bottom (still light: a soft pastel grey). */
  rain: readonly [string, string];
  /** The cleared sky, top → bottom. */
  sun: readonly [string, string];
  /** Petals / hearts that drift once the rain clears. */
  petals: readonly string[];
}

const pal = (
  label: string,
  c: { bg: string; bg2: string; surface: string; primary: string; accent: string; accentDeep: string; text: string; textSoft: string; soft: string; edge: string; blush: string; deep: string },
  rain: readonly [string, string],
  sun: readonly [string, string],
  petals: readonly string[],
  confetti: readonly string[],
): SpPaletteDef => ({
  label,
  swatch: c.primary,
  blush: c.blush,
  deep: c.deep,
  rain,
  sun,
  petals,
  theme: {
    bg: `linear-gradient(180deg, ${sun[0]} 0%, ${c.bg} 55%, ${c.bg2} 100%)`,
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
    particles: petals,
    confetti,
  },
});

/** Four light looks. Every one starts on a pale drizzle and ends in sunshine. */
export const SP_PALETTES: Record<SpPalette, SpPaletteDef> = {
  rainyBlush: pal(
    "Rainy Blush",
    { bg: "#FFF1F4", bg2: "#FBDCE5", surface: "#FFFFFF", primary: "#F4A7BB", accent: "#E0567B", accentDeep: "#B5365A", text: "#4E2533", textSoft: "#7A4B5B", soft: "#FFE4EB", edge: "#F3C6D3", blush: "#FFD8E2", deep: "#9E2E4D" },
    ["#D9DAE6", "#F2E7EE"],
    ["#FFE3EC", "#FFF6EE"],
    ["🌸", "💗", "🩷", "✨"],
    ["#E0567B", "#F4A7BB", "#FFD8E2", "#FFFFFF", "#FFE07A"],
  ),
  mintMorning: pal(
    "Mint Matcha Morning",
    { bg: "#EFFAF3", bg2: "#D3EFDF", surface: "#FFFFFF", primary: "#9AD8B4", accent: "#2E9467", accentDeep: "#227350", text: "#1E3B2F", textSoft: "#476A5A", soft: "#DDF4E7", edge: "#B5E2C8", blush: "#CDEFDC", deep: "#1C6345" },
    ["#D6DEE0", "#E9F0EC"],
    ["#DDF5FF", "#F3FFF7"],
    ["🌿", "💚", "🌼", "✨"],
    ["#2E9467", "#9AD8B4", "#FFFFFF", "#FFC2D3", "#FFE07A"],
  ),
  lilacDrizzle: pal(
    "Lilac Drizzle",
    { bg: "#F5F1FF", bg2: "#E2D9FA", surface: "#FFFFFF", primary: "#C5B4F2", accent: "#7F5FD4", accentDeep: "#6043BA", text: "#33285A", textSoft: "#5F5482", soft: "#ECE5FD", edge: "#D6CAF6", blush: "#E4DAFB", deep: "#4F369F" },
    ["#DAD8E8", "#EEEAF4"],
    ["#EDE4FF", "#FFF4FA"],
    ["🪻", "💜", "🌸", "✨"],
    ["#7F5FD4", "#C5B4F2", "#FFFFFF", "#FFB6D9", "#FFE9A8"],
  ),
  peachSunbreak: pal(
    "Peach Sunbreak",
    { bg: "#FFF6EE", bg2: "#FFE1CC", surface: "#FFFDF9", primary: "#FFC29C", accent: "#E8703F", accentDeep: "#BF5228", text: "#532E1E", textSoft: "#80553D", soft: "#FFE9DA", edge: "#F9CFB2", blush: "#FFDDC8", deep: "#A84823" },
    ["#DEDCE2", "#F3ECE8"],
    ["#FFEBD2", "#FFF9F1"],
    ["🌼", "🧡", "🍑", "✨"],
    ["#E8703F", "#FFC29C", "#FFFDF9", "#FFB0C4", "#FFE07A"],
  ),
};

export const SP_PALETTE_KEYS = Object.keys(SP_PALETTES) as SpPalette[];

/** What the tone changes when the sender leaves a field empty. */
export const SP_TONES: Record<
  SpTone,
  { question: string; yes: string; time: string; treaty: string; reply: string; knock: readonly [string, string]; punch: string; boatHint: string }
> = {
  sweet: {
    question: "Will you forgive me? 🥺",
    yes: "Yes, come here 💗",
    time: "I need a little time 🌦️",
    treaty: "The Peace Treaty",
    reply: "Okay… I forgive you 💗 The rain's gone. Come give me that hug.",
    knock: ["Sorry.", "Sorry who?"],
    punch: "Sorry I made it rain, {name} 🌧️",
    boatHint: "Sail it over to me",
  },
  heartfelt: {
    question: "Can we start again, softer this time?",
    yes: "Yes. I forgive you 🤍",
    time: "I need a little time 🌦️",
    treaty: "Our Peace Treaty",
    reply: "I read every word. I forgive you 🤍 Let's talk tonight?",
    knock: ["Someone who misses you.", "Misses me… who?"],
    punch: "Me. And I'm so sorry, {name}.",
    boatHint: "Sail it over to me",
  },
  silly: {
    question: "Forgive this idiot? 🙈",
    yes: "Fine, you're forgiven 😤💗",
    time: "Ask me again later 🌦️",
    treaty: "Official Peace Treaty (No Take-Backs)",
    reply: "Fine. You're forgiven 😤💗 But you owe me snacks. Lots of snacks.",
    knock: ["Ida.", "Ida who?"],
    punch: "Ida-n't mean to hurt you, {name} 🙈",
    boatHint: "Sail it over, captain",
  },
};

export const SP_TONE_KEYS = Object.keys(SP_TONES) as SpTone[];

export const DEFAULT_FEELINGS: readonly string[] = [
  "Like you weren't being heard, when all you wanted was me to listen.",
  "Like you didn't matter enough to remember. You always matter.",
  "Alone, in a fight that should have been us against the problem.",
];

export const DEFAULT_LESSONS: readonly string[] = [
  "Being right is never worth more than you feeling safe with me.",
  "When you're upset, you need me to listen first and fix later.",
  "Small promises are still promises. I keep them now.",
];

export const DEFAULT_STARS: readonly string[] = [
  "The way you laugh at your own jokes before the punchline.",
  "How you always save me the last bite.",
  "Your sleepy voice on late-night calls.",
  "That you still believe in me when I don't.",
  "Your hand finding mine without looking.",
  "How every bad day gets smaller next to you.",
];

export const DEFAULT_PROMISES: readonly string[] = [
  "I'll listen first, and talk second.",
  "No more cancelling plans last minute.",
  "When I'm wrong, I'll say sorry the same day.",
  "One phone-free evening, every week. Just us.",
];

/**
 * One tap each in the form; the sender can still paste any YouTube link.
 * English + Hindi, rain-clearing and "start again" songs. Official uploads —
 * every id checked with YouTube oEmbed (200) and the embed player (playable
 * off-site) on 2026-10-14. Audio only.
 */
export const SP_SONGS: readonly SongSuggestion[] = [
  { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran" },
  { id: "0yW7w8F2TVA", title: "Say You Won't Let Go", artist: "James Arthur" },
  { id: "KQetemT1sWc", title: "Here Comes the Sun", artist: "The Beatles" },
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "EkHTsc9PU2A", title: "I'm Yours", artist: "Jason Mraz" },
  { id: "PJWemSzExXs", title: "Baarishein", artist: "Anuv Jain" },
  { id: "1gwoGQhXvAo", title: "Baarish", artist: "Ash King, Shashaa Tirupati" },
  { id: "sK7riqg2mr4", title: "Agar Tum Saath Ho", artist: "Arijit Singh, Alka Yagnik" },
  { id: "mt9xg0mmt28", title: "Tum Se Hi", artist: "Mohit Chauhan" },
  { id: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal, Asees Kaur" },
];

/** The page's own song (music mode "track"), from our CDN, so it starts on her first tap. */
export const SP_TRACK = {
  url: "https://cdn.subhsandesh.in/gifts-media/assets/LoveGf/music/thinkingoutloud.mp3",
  title: "Thinking Out Loud",
  artist: "Ed Sheeran",
  hint: "Ed Sheeran · plays first",
} as const;

const GIFS: GifSlot[] = [
  { id: "p1-knock", label: "At the door", moment: "Peeking in when she opens the door", file: "p1-knock.webp", emoji: "🥺", anim: "wiggle" },
  { id: "p2-bloom", label: "Flowers", moment: "Beside the flower once it blooms", file: "p2-bloom.webp", emoji: "💐", anim: "float" },
  { id: "p3-mend", label: "So sorry", moment: "Crying while the heart gets mended", file: "p3-mend.webp", emoji: "😢", anim: "bounce" },
  { id: "p4-stars", label: "Love", moment: "On the jar of paper stars", file: "p4-stars.webp", emoji: "💞", anim: "float" },
  { id: "p5-sign", label: "Hug", moment: "Hugging over the signed contract", file: "p5-sign.webp", emoji: "🤗", anim: "bounce" },
  { id: "p6-yes", label: "Forgiven!", moment: "Dancing under the rainbow", file: "p6-yes.webp", emoji: "🌈", anim: "bounce" },
];

export const sorryPremiumDay: DayConfig<SpExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "After the Rain — I'm Sorry",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 30,
  asksQuestion: true,
  melody: "garden",
  photoAspect: 0.86,
  gifSlots: GIFS,
  topBar: true,
  brandMark: "stacked",
  music: {
    audioOnly: true,
    compact: true,
    track: SP_TRACK,
    suggestions: SP_SONGS,
    suggestionsNote: "English + Hindi · tap one, or paste any YouTube link",
  },
  extras: [
    {
      key: "palette", kind: "enum", label: "Pick the sky", display: "swatches", default: "rainyBlush",
      hint: "The whole page wears it: the drizzle at the start, the sunshine at the end, the flower, the stars.",
      options: SP_PALETTE_KEYS.map((k) => ({ value: k, label: SP_PALETTES[k].label, swatch: SP_PALETTES[k].swatch })),
    },
    {
      key: "tone", kind: "enum", label: "How do you want to sound?", display: "cards", default: "sweet",
      hint: "Changes the knock-knock joke, the question, the treaty's title and the reply they send back.",
      options: [
        { value: "sweet", label: "Cute", emoji: "🥺", hint: "soft and sweet" },
        { value: "heartfelt", label: "Emotional", emoji: "🤍", hint: "sincere, a little teary" },
        { value: "silly", label: "Funny", emoji: "🙈", hint: "make them laugh first" },
      ],
    },
    {
      key: "togetherSince", kind: "text", input: "date", max: 10, label: "Together since (optional)",
      hint: "We count the days together on the star jar and the peace treaty. Leave empty to skip it.",
    },
    {
      key: "knockLine", kind: "text", max: 70, label: "At the door",
      placeholder: "what the little bear says when they open the door",
      hint: "After the knock-knock joke, the door opens and the bear says this.",
      suggestions: ["I hurt you, and I'm so sorry. Can I come in?", "I brought an umbrella and a very big sorry.", "Can I sit with you till the rain stops?"],
    },
    {
      key: "confession", kind: "longtext", max: 160, rows: 3, label: "What I did (it blooms on the flower)",
      placeholder: "say exactly what you did — no “but”, no “if you felt”",
      hint: "They water a wilted flower until it blooms with this. Owning it is the part that matters most.",
      suggestions: ["I forgot our plans and didn't even call. That was careless of me.", "I raised my voice when you were just trying to tell me how you felt."],
    },
    {
      key: "feelings", kind: "list", maxItems: 3, itemMax: 80, label: "How it made them feel (one per plaster)",
      hint: "They mend a cracked heart with three plasters. Each one shows that you understand how it felt for them.",
      itemLabels: ["Plaster 1", "Plaster 2", "Plaster 3"],
      itemPlaceholder: DEFAULT_FEELINGS,
    },
    {
      key: "lessons", kind: "list", maxItems: 3, itemMax: 80, label: "What I learnt (fortune cookies)",
      hint: "They crack three fortune cookies. Inside each is one thing you learnt.",
      itemLabels: ["Cookie 1", "Cookie 2", "Cookie 3"],
      itemPlaceholder: DEFAULT_LESSONS,
    },
    {
      key: "stars", kind: "list", maxItems: 6, itemMax: 70, label: "Jar of paper stars",
      hint: "They shake a jar and unfold paper stars. Each one holds one thing you love about them.",
      itemLabels: ["Star 1", "Star 2", "Star 3", "Star 4", "Star 5", "Star 6"],
      itemPlaceholder: DEFAULT_STARS,
    },
    {
      key: "promises", kind: "list", maxItems: 4, itemMax: 70, label: "The peace contract (your promises)",
      hint: "Your repair plan, as clauses on a contract. They sign it with their finger. Make every one specific and keepable.",
      itemLabels: ["Clause 1", "Clause 2", "Clause 3", "Clause 4"],
      itemPlaceholder: DEFAULT_PROMISES,
    },
    {
      key: "question", kind: "text", max: 60, label: "The big question",
      placeholder: "leave empty to use the one for your tone",
      suggestions: ["Will you forgive me? 🥺", "Maaf kar do na? 🥹", "Can the sun come out again? ☀️"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "When they forgive you",
      placeholder: "what you'd say the second they say yes",
      suggestions: ["The rain's gone. I owe you the biggest hug in the world 🤗"],
    },
    {
      key: "answerMode", kind: "enum", label: "How can they answer?", display: "cards", default: "noAfterTries",
      hint: "Either way you'll see their answer on your page card, and get an email.",
      options: [
        { value: "noAfterTries", label: "Yes, or “I need time”", emoji: "🌦️", hint: "an honest, gentle way out (recommended)" },
        { value: "yesOnly", label: "Only Yes", emoji: "💗", hint: "one big Yes button" },
      ],
    },
  ],
  theme: SP_PALETTES.rainyBlush.theme,
  demo: {
    recipientName: "Riya",
    senderName: "Aarav",
    petName: "Cutu",
    letter:
      "I've been sitting here for an hour trying to find the right words, and the only true ones are these: I'm sorry.\n\nI was careless with something that mattered to you, and when you tried to tell me, I got defensive instead of listening. You deserved patience, and I gave you excuses. That's on me, completely.\n\nI hate that I took your sunshine away, even for a day. You're the softest, funniest, most patient person I know, and you make every ordinary day feel like a good one.\n\nI'm not asking you to forget it. I'm asking for the chance to show you I've learnt from it. And whenever you're ready, I'd love to talk, properly.",
    photos: demoPhotos([
      ["our first chai date", "You laughed so hard at my joke that you spilled it."],
      ["the rainy day", "One umbrella, two people, both soaked anyway."],
      ["your birthday", "The face you made at the cake. I'd do anything to see it again."],
      ["us, always", "Still my favourite person. Even when I mess up."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...TRACK_DEMO,
    endLine: "After every rain, it's still you and me ☀️",
    extras: {
      palette: "rainyBlush",
      tone: "sweet",
      togetherSince: "2024-02-14",
      knockLine: "I hurt you, and I'm so sorry. Can I come in?",
      confession: "I forgot our plans on Saturday and didn't even call. Then I got defensive instead of just saying sorry.",
      feelings: [...DEFAULT_FEELINGS],
      lessons: [...DEFAULT_LESSONS],
      stars: [...DEFAULT_STARS],
      promises: [...DEFAULT_PROMISES],
      question: "Will you forgive me? 🥺",
      yesLine: "The rain's gone. I owe you the biggest hug in the world 🤗",
      answerMode: "noAfterTries",
    },
  },
  copy: {
    recipientPlaceholder: "who you're saying sorry to — e.g. Riya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — cutu, jaan, baby…",
    letterPlaceholder: "Your real apology: what happened, how you think it made them feel, and what you'll do differently. No “but”s.",
    letterHint: "Folded into a paper boat. They sail it across the puddle to open it.",
    photosHint: "Your sunny days, pegged on a washing line they tap through.",
    captionHint: "caption — e.g. the rainy day",
    noteHint: "what you remember about that moment…",
    endLinePlaceholder: "After every rain, it's still you and me ☀️",
    endLineHint: "The last line, on their Peace Treaty keepsake.",
    sheetTitle: "Make the rain stop ☔",
    sheetSub: "Pick a sky, own what you did, show you understand, say what you learnt and promise something real. Everything is pre-filled, so make it yours.",
    extrasTitle: "Your apology",
    extrasSub: "The sky, your tone, the flower, the plasters, the cookies, the star jar, the contract and the question",
    publishing: "Folding your paper boat…",
    storyTitle: "Let's make the rain stop ☔",
    replyText: "Okay… I forgive you 💗 The rain's gone. Come give me that hug.",
    yesChip: "Forgave you 🌈",
  },
  share: { title: "Someone is sorry, and it's raining a little 🌧️ Open this", accent: "#B5365A" },
};
