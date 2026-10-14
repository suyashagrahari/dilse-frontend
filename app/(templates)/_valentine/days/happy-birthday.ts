// ─── Happy Birthday — a cute, romantic birthday surprise ─────────────────────
//
// An evergreen occasion on the Valentine engine (like Sorry), all copy English
// with a little Hinglish. Server twin: server/src/config/valentineDays.ts
// ("happy-birthday"); keys and limits must match (valentineDays.test.ts pins them).
//
// The flow follows what people actually make for a partner's birthday (the
// "made you a website" gifts: blow the candles, reasons I love you, our photos,
// a letter, coupons) — app/(templates)/happy-birthday/components:
//   a wrapped gift (tug the bow till the ribbon falls) → the cake: light every
//   candle, make a wish, blow them out (hold, or really blow into the mic) →
//   cut the cake with a swipe (the first slice is theirs) → pop the balloons
//   (one thing I love about you in each) → our photos (polaroids on a string of
//   fairy lights) → the letter → unwrap the birthday coupons (claim one) →
//   "Birthday date with me?" (No runs away) → when? (tonight / this weekend /
//   you plan it) → a Birthday Queen/King crown certificate with confetti.
//
// The sender picks one of four cake-flavoured looks (extras.palette); the whole
// page is re-skinned from HB_PALETTES, the editor's own chrome stays Strawberry.

import type { DayConfig, GifSlot } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { TRACK_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "happy-birthday" as const;

export type HbTone = "partner" | "crush" | "bestie";
export type HbPalette = "strawberryCake" | "funfettiVanilla" | "lavenderFrosting" | "mintMacaron";
export type HbCrown = "queen" | "king" | "star";

export interface HbCoupon {
  title: string;
  line: string;
}

export interface HbExtras {
  palette: HbPalette;
  tone: HbTone;
  crown: HbCrown;
  /** The number on the cake topper ("" = a heart topper). */
  age: string;
  openingLine: string;
  /** What appears once the candles are blown out. */
  wishLine: string;
  /** What comes with the first slice. */
  cakeLine: string;
  /** One thing I love about you in each balloon. */
  reasons: string[];
  coupons: HbCoupon[];
  question: string;
  yesLine: string;
  /** "yes" — after YES they pick when (tonight / this weekend / you plan it). */
  askWhen: "yes" | "no";
  [k: string]: unknown;
}

/** The cake's own paints (per look). */
export interface HbCake {
  sponge: string;
  frosting: string;
  /** The second frosting layer / piping. */
  cream: string;
  drip: string;
  plate: string;
  sprinkles: readonly string[];
}

/** One cake-flavoured look: the page theme plus the few extra paints the scenes use. */
export interface HbPaletteDef {
  label: string;
  swatch: string;
  theme: DayTheme;
  /** Pale tint for cards, gift wrap, the wipe. */
  blush: string;
  /** The deepest tint (outlines, shadows). */
  deep: string;
  /** Floating bits in the background. */
  floats: readonly string[];
  /** Balloon colours, in pop order. */
  balloons: readonly string[];
  cake: HbCake;
}

const pal = (
  label: string,
  c: { bg: string; bg2: string; surface: string; primary: string; accent: string; accentDeep: string; text: string; textSoft: string; soft: string; edge: string; blush: string; deep: string },
  floats: readonly string[],
  confetti: readonly string[],
  balloons: readonly string[],
  cake: HbCake,
): HbPaletteDef => ({
  label,
  swatch: c.primary,
  blush: c.blush,
  deep: c.deep,
  floats,
  balloons,
  cake,
  theme: {
    bg: `radial-gradient(120% 70% at 50% 0%, ${c.surface} 0%, ${c.bg} 46%, ${c.bg2} 100%)`,
    base: c.bg,
    paper: c.surface,
    glass: "rgba(255,255,255,0.62)",
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

/** The four looks the sender can pick — each one a cake flavour. */
export const HB_PALETTES: Record<HbPalette, HbPaletteDef> = {
  strawberryCake: pal(
    "Strawberry Cake",
    { bg: "#FFF1F4", bg2: "#FFD6E0", surface: "#FFFFFF", primary: "#FF9EB5", accent: "#EE5583", accentDeep: "#C93A63", text: "#5B2236", textSoft: "#8E5468", soft: "#FFE2EA", edge: "#FBC3D2", blush: "#FFD8E3", deep: "#A82C55" },
    ["🍓", "🎈", "💗", "✨"],
    ["#EE5583", "#FF9EB5", "#FFE07A", "#FFFFFF", "#9ADBC5", "#C9B6F7"],
    ["#EE5583", "#FF9EB5", "#FFC94D", "#7FD3B5", "#B79CF2"],
    { sponge: "#F6D7A9", frosting: "#FFB3C8", cream: "#FFFFFF", drip: "#EE5583", plate: "#FFFFFF", sprinkles: ["#FFFFFF", "#FFC94D", "#7FD3B5", "#B79CF2"] },
  ),
  funfettiVanilla: pal(
    "Funfetti Vanilla",
    { bg: "#FFF8EC", bg2: "#FFE7C2", surface: "#FFFDF8", primary: "#FFCB6B", accent: "#F2655A", accentDeep: "#CF4B41", text: "#5A3A22", textSoft: "#8A684C", soft: "#FFF0D6", edge: "#F4D7A4", blush: "#FFE6C8", deep: "#AE3F2E" },
    ["🎉", "🎈", "⭐", "✨"],
    ["#F2655A", "#4FB3F2", "#8CCB5E", "#FFB300", "#B66DD1", "#FFFFFF"],
    ["#F2655A", "#4FB3F2", "#FFB300", "#8CCB5E", "#B66DD1"],
    { sponge: "#FBE5BC", frosting: "#FFFCF2", cream: "#FFE3B0", drip: "#FFCB6B", plate: "#FFFFFF", sprinkles: ["#F2655A", "#4FB3F2", "#8CCB5E", "#FFB300", "#B66DD1"] },
  ),
  lavenderFrosting: pal(
    "Lavender Frosting",
    { bg: "#F5F0FF", bg2: "#E0D3FB", surface: "#FFFFFF", primary: "#C5B0F5", accent: "#8A68DE", accentDeep: "#6B4BC3", text: "#3B2D5E", textSoft: "#67598A", soft: "#ECE4FE", edge: "#D5C7F7", blush: "#E4D9FC", deep: "#583CAE" },
    ["💜", "🎈", "🦄", "✨"],
    ["#8A68DE", "#C5B0F5", "#FFFFFF", "#FFB6D9", "#FFE07A", "#9ADBC5"],
    ["#8A68DE", "#FF9CC8", "#C5B0F5", "#FFD36B", "#86D6C0"],
    { sponge: "#F3DDB8", frosting: "#CDB8F7", cream: "#FFFFFF", drip: "#8A68DE", plate: "#FFFFFF", sprinkles: ["#FFFFFF", "#FFB6D9", "#FFE07A", "#9ADBC5"] },
  ),
  mintMacaron: pal(
    "Mint Macaron",
    { bg: "#EDFBF4", bg2: "#CDEFDF", surface: "#FFFFFF", primary: "#9FDDBF", accent: "#2E9F70", accentDeep: "#217F58", text: "#1F4334", textSoft: "#4C7262", soft: "#DAF5E8", edge: "#B4E4CC", blush: "#D3F2E3", deep: "#1C6E4C" },
    ["💚", "🎈", "🍰", "✨"],
    ["#2E9F70", "#9FDDBF", "#FFFFFF", "#FFB6C9", "#FFE07A", "#C9B6F7"],
    ["#2E9F70", "#FFA5BE", "#9FDDBF", "#FFD36B", "#B9A3F0"],
    { sponge: "#F5DFB9", frosting: "#B7EAD2", cream: "#FFFFFF", drip: "#FF9FBA", plate: "#FFFFFF", sprinkles: ["#FFFFFF", "#FF9FBA", "#FFE07A", "#B9A3F0"] },
  ),
};

export const HB_PALETTE_KEYS = Object.keys(HB_PALETTES) as HbPalette[];

/** The crown on the certificate (and the "birthday ___" lines). */
export const HB_CROWNS: Record<HbCrown, { title: string; word: string; emoji: string }> = {
  queen: { title: "Birthday Queen", word: "queen", emoji: "👑" },
  king: { title: "Birthday King", word: "king", emoji: "👑" },
  star: { title: "Birthday Star", word: "star", emoji: "⭐" },
};

/**
 * What "who it's for" changes when the sender leaves a field empty: the
 * question, the YES button, the dodging No's lines, the letter's sign-off and
 * the WhatsApp reply.
 */
export const HB_TONES: Record<HbTone, { question: string; yes: string; reply: string; noLines: readonly string[]; signOff: string }> = {
  partner: {
    question: "Birthday date with me? 🥂",
    yes: "Yes, it's a date 💗",
    reply: "Best birthday surprise EVER 🥹💗 Yes, it's a date!",
    noLines: ["it's your birthday tho 🥺", "pls? cake on me 🍰", "*puppy eyes*", "I'll dress up 👔", "pretty please?"],
    signOff: "Forever yours,",
  },
  crush: {
    question: "Can I take you out for your birthday? 🙈",
    yes: "Okay, yes 🙈",
    reply: "Okay this was SO cute 🙈 Yes, take me out!",
    noLines: ["are you sure? 🥺", "just one coffee?", "I'll bring cake 🍰", "pls pls pls", "*hopeful blink*"],
    signOff: "Yours (hopefully),",
  },
  bestie: {
    question: "Birthday party, just you and me? 🥳",
    yes: "Obviously, bestie 🥳",
    reply: "BESTIE 😭💗 Best surprise ever. Party's on!",
    noLines: ["bestie no?", "maggi on me 🍜", "I'll do the dance 💃", "pls 🥺👉👈", "*sad hamster noises*"],
    signOff: "Your bestie, always,",
  },
};

/** After YES (extras.askWhen "yes"): when the date is. Index + 1 goes to the server as reactions.count. */
export const HB_PLANS: readonly { label: string; emoji: string }[] = [
  { label: "Tonight", emoji: "🌙" },
  { label: "This weekend", emoji: "🗓️" },
  { label: "You plan it, surprise me", emoji: "✨" },
];

export const DEFAULT_REASONS: readonly string[] = [
  "Your laugh. The real one, the one that snorts a little.",
  "How you make every boring day feel like a date.",
  "You remember the tiniest things about me.",
  "Your sleepy voice on late-night calls.",
  "You're my favourite person to do nothing with.",
];

export const DEFAULT_COUPONS: readonly HbCoupon[] = [
  { title: "Breakfast in bed 🥞", line: "Pancakes, coffee, zero dishes for you." },
  { title: "Unlimited hugs 🤗", line: "Redeemable anytime, any mood, no expiry." },
  { title: "You pick the movie 🎬", line: "Even the 3-hour one. I won't fall asleep." },
  { title: "A whole day of yes 💗", line: "Anything you want, all day. (Within reason.)" },
];

export const DEFAULT_WISH_LINE = "Whatever you wished for, I hope I get to be there when it comes true ✨";
export const DEFAULT_CAKE_LINE = "The first slice is always yours. So is the last one. So am I 🍰";

/**
 * English + Hindi birthday and romantic songs, one tap each in the form; the
 * sender can still paste any YouTube link. Official label/artist uploads —
 * every id checked with YouTube oEmbed and the embed player (playable
 * off-site) on 2026-10-14. Audio only.
 */
export const HB_SONGS: readonly SongSuggestion[] = [
  { id: "CEUg7OplvIQ", title: "Birthday", artist: "Katy Perry" },
  { id: "AgFeZr5ptV8", title: "22", artist: "Taylor Swift" },
  { id: "LjhCEhWiKXk", title: "Just the Way You Are", artist: "Bruno Mars" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "dElRVQFqj-k", title: "Marry You", artist: "Bruno Mars" },
  { id: "9xPDDC6ptw4", title: "Baar Baar Din Ye Aaye", artist: "Mohammed Rafi · Farz" },
  { id: "KfpbIG_py-Y", title: "Tum Jiyo Hazaron Saal", artist: "Asha Bhosle · Sujata" },
  { id: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal, Asees Kaur · Shershaah" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh · Brahmāstra" },
  { id: "ilNt2bikxDI", title: "Jo Tum Mere Ho", artist: "Anuv Jain" },
];

/**
 * The page's own song (music mode "track"), from our CDN, so it starts on
 * their first tap with no YouTube player to wait for. The songs above are the swaps.
 */
export const HB_TRACK = {
  url: "https://cdn.subhsandesh.in/gifts-media/assets/Birthday1/bestdayofmylife.mp3",
  title: "Best Day of My Life",
  artist: "American Authors",
  hint: "American Authors · plays first",
} as const;

const GIFS: GifSlot[] = [
  { id: "b1-gate", label: "Surprise!", moment: "Peeking out of the gift box", file: "b1-gate.webp", emoji: "🎁", anim: "wiggle" },
  { id: "b2-wish", label: "Make a wish", moment: "After the candles are blown out", file: "b2-wish.webp", emoji: "🎂", anim: "bounce" },
  { id: "b3-party", label: "Party time", moment: "Dancing above the popped balloons", file: "b3-party.webp", emoji: "🎈", anim: "float" },
  { id: "b4-gift", label: "Gifts", moment: "Beside the birthday coupons", file: "b4-gift.webp", emoji: "🎀", anim: "float" },
  { id: "b5-yes", label: "It's a date!", moment: "After they say yes", file: "b5-yes.webp", emoji: "🥳", anim: "bounce" },
];

export const happyBirthdayDay: DayConfig<HbExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Happy Birthday, My Love",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 30,
  asksQuestion: true,
  melody: "blush",
  photoAspect: 1,
  gifSlots: GIFS,
  topBar: true,
  brandMark: "stacked",
  music: {
    audioOnly: true,
    compact: true,
    track: HB_TRACK,
    suggestions: HB_SONGS,
    suggestionsNote: "Birthday + romantic songs · tap one, or paste any YouTube link",
  },
  extras: [
    {
      key: "palette", kind: "enum", label: "Pick the cake", display: "swatches", default: "strawberryCake",
      hint: "The whole page turns this flavour — the background, the cake, the balloons, the gifts.",
      options: HB_PALETTE_KEYS.map((k) => ({ value: k, label: HB_PALETTES[k].label, swatch: HB_PALETTES[k].swatch })),
    },
    {
      key: "tone", kind: "enum", label: "Whose birthday is it?", display: "cards", default: "partner",
      hint: "Changes the default question, the letter's sign-off and the reply they send back.",
      options: [
        { value: "partner", label: "My love", emoji: "💗", hint: "girlfriend, boyfriend, spouse" },
        { value: "crush", label: "My crush", emoji: "🙈", hint: "it's complicated" },
        { value: "bestie", label: "My bestie", emoji: "🫶", hint: "best friend" },
      ],
    },
    {
      key: "crown", kind: "enum", label: "Crown them", display: "cards", default: "queen",
      hint: "Printed on the crown certificate they keep at the end.",
      options: [
        { value: "queen", label: "Birthday Queen", emoji: "👑" },
        { value: "king", label: "Birthday King", emoji: "🤴" },
        { value: "star", label: "Birthday Star", emoji: "⭐" },
      ],
    },
    {
      key: "age", kind: "text", max: 3, label: "The number on the cake (optional)",
      placeholder: "e.g. 23 — leave empty for a heart",
      hint: "Sits on top of the cake as a big candle topper.",
    },
    {
      key: "openingLine", kind: "text", max: 60, label: "On the gift tag",
      placeholder: "a little line under their name",
      hint: "Printed under “Psst, <their name>…” on the very first screen.",
      suggestions: ["untie the ribbon, birthday girl 🎀", "someone made you a little surprise", "open this before anyone else wishes you"],
    },
    {
      key: "wishLine", kind: "text", max: 100, label: "After they blow the candles",
      placeholder: DEFAULT_WISH_LINE,
      hint: "They light every candle, make a wish and blow them out — then this appears.",
      suggestions: [DEFAULT_WISH_LINE, "I already got my wish. It's you. Happy birthday 💗"],
    },
    {
      key: "cakeLine", kind: "text", max: 90, label: "With the first slice",
      placeholder: DEFAULT_CAKE_LINE,
      hint: "They swipe to cut the cake; this comes with the first slice.",
      suggestions: [DEFAULT_CAKE_LINE, "Sweetest thing on this page? Still you 🍰"],
    },
    {
      key: "reasons", kind: "list", maxItems: 5, itemMax: 70, label: "Balloons: what I love about you",
      hint: "They pop one balloon at a time — each holds one thing you love about them.",
      itemLabels: ["Balloon 1", "Balloon 2", "Balloon 3", "Balloon 4", "Balloon 5"],
      itemPlaceholder: DEFAULT_REASONS,
    },
    {
      key: "coupons", kind: "objlist", maxItems: 4, itemTitle: "Coupon", addLabel: "+ add a coupon",
      label: "Birthday coupons",
      hint: "They unwrap each gift, then claim the one they want first — you'll see it in their reply.",
      item: [
        { key: "title", kind: "text", max: 28, label: "Coupon", placeholder: "Breakfast in bed 🥞" },
        { key: "line", kind: "text", max: 60, label: "The small print", placeholder: "Pancakes, coffee, zero dishes for you." },
      ],
    },
    {
      key: "question", kind: "text", max: 60, label: "The big question",
      placeholder: "leave empty to use the one for whose birthday it is",
      hint: "The No button gets shy and runs away when they reach for it.",
      suggestions: ["Birthday date with me? 🥂", "Can I spoil you all day? 🥺", "Dinner, cake and me? 🍰"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "After they say yes",
      placeholder: "what you'd say the second they say yes",
      suggestions: ["Best birthday gift? You saying yes. Wear something cute 💗"],
    },
    {
      key: "askWhen", kind: "enum", label: "Then ask them when?", display: "cards", default: "yes",
      hint: "After YES they pick: tonight, this weekend, or “you plan it”. Their pick is in your email.",
      options: [
        { value: "yes", label: "Yes, ask when", emoji: "🗓️", hint: "tonight · weekend · surprise me" },
        { value: "no", label: "Just the yes", emoji: "💗" },
      ],
    },
  ],
  theme: HB_PALETTES.strawberryCake.theme,
  demo: {
    recipientName: "Riya",
    senderName: "Aarav",
    petName: "Cutu",
    letter:
      "Happy birthday to the girl who makes every ordinary day feel like a celebration.\n\nI still remember the first time you laughed at one of my terrible jokes — I decided right then I'd spend my life making you do that again. You're the softest, funniest, bravest person I know, and somehow you chose me.\n\nThis year I hope you get every single thing you wished for: the big dreams, the small wins, the lazy Sundays, the extra cheese. And I hope I get to be right next to you for all of it.\n\nThank you for being born. The world got so much better that day, and so did mine.",
    photos: demoPhotos([
      ["our first date", "You were nervous. I was more nervous. Best evening ever."],
      ["that beach trip", "Sunburnt, sandy and so happy."],
      ["your last birthday", "The cake face. I'd travel anywhere to see it again."],
      ["us, always", "My favourite place in the world is next to you."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...TRACK_DEMO,
    endLine: "Here's to you, today and every day after 🥂",
    extras: {
      palette: "strawberryCake",
      tone: "partner",
      crown: "queen",
      age: "23",
      openingLine: "untie the ribbon, birthday girl 🎀",
      wishLine: DEFAULT_WISH_LINE,
      cakeLine: DEFAULT_CAKE_LINE,
      reasons: [...DEFAULT_REASONS],
      coupons: DEFAULT_COUPONS.map((c) => ({ ...c })),
      question: "Birthday date with me? 🥂",
      yesLine: "Best birthday gift? You saying yes. Wear something cute 💗",
      askWhen: "yes",
    },
  },
  copy: {
    recipientPlaceholder: "whose birthday it is — e.g. Riya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — cutu, jaan, baby…",
    letterPlaceholder: "Your birthday letter: a memory with them, what you love about them, and what you wish for them this year.",
    letterHint: "Folded into a little card. They open it after the photos.",
    photosHint: "Your photos, as polaroids on a string of fairy lights they swipe through.",
    captionHint: "caption — e.g. our first date",
    noteHint: "what you remember about that moment…",
    endLinePlaceholder: "Here's to you, today and every day after 🥂",
    endLineHint: "The last line, on their crown certificate.",
    sheetTitle: "Make their birthday surprise 🎂",
    sheetSub: "Pick a cake, add what you love about them, a few coupons and your letter. Everything is pre-filled, so make it yours.",
    extrasTitle: "Your surprise",
    extrasSub: "The cake, whose birthday it is, the crown, the wish, the balloons, the coupons and the question",
    publishing: "Wrapping your surprise…",
    storyTitle: "Let's plan their birthday surprise 🎂",
    replyText: "Best birthday surprise EVER 🥹💗 Yes, it's a date!",
    yesChip: "Said YES 🎂",
  },
  share: { title: "Happy Birthday 🎂 Someone made you a surprise", accent: "#C93A63" },
};
