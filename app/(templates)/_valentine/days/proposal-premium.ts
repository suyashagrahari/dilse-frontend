// ─── The Proposal ✦ Premium — a fairytale proposal in a golden-hour garden ───
//
// An evergreen occasion on the Valentine engine (like Sorry and Will You Be
// Mine), the premium edition of the proposal: light, dreamy, very tactile.
// Server twin: server/src/config/valentineDays.ts ("proposal-premium"); keys
// and limits must match (valentineDays.test.ts pins them).
//
// The flow is built from what makes people say yes (and cry) — the couple's
// own specifics, a slow build, the question saved for the very end — and every
// scene is a different gesture (app/(templates)/proposal-premium):
//   a wax-sealed invitation (press the seal till it cracks) → string lights
//   (swipe or tap the bulbs; each one lights a word of your line) → our story
//   carousel (spin the merry-go-round, each horse is a chapter) → the love-lock
//   bridge (drag the key into the padlock: "since <date> · N days") → the
//   reasons flower (pluck the petals; it always ends on "loves me") → our photos
//   (swipe a deck of keepsake cards) → the letter (pull the ribbon, the scroll
//   unrolls) → the ring box (swipe the lid up, the ring rises) → "Will you be
//   mine?" — No wilts a little more with every reach while YES blooms; the
//   sender may allow an honest "Let me think about it" → YES: hearts, then she
//   slides the ring onto the hand → the "Officially Ours" certificate and a
//   save-the-date keepsake.
//
// The sender picks one of four light looks (extras.palette); the whole page is
// re-skinned from PROPOSAL_PALETTES, the editor's own chrome stays Rose Gold.

import type { DayConfig, GifSlot } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { TRACK_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "proposal-premium" as const;

export type ProposalTone = "girlfriend" | "boyfriend" | "marry";
export type ProposalPalette = "roseGoldBlush" | "champagnePearl" | "lilacGarden" | "peachBellini";

export interface ProposalChapter {
  when: string;
  title: string;
  line: string;
}

export interface ProposalExtras {
  palette: ProposalPalette;
  tone: ProposalTone;
  /** Under their name on the invitation. */
  openingLine: string;
  /** Lit one word per bulb on the string lights. */
  lightsLine: string;
  /** Our story — one chapter per carousel horse. */
  story: ProposalChapter[];
  /** "Together since" (YYYY-MM-DD) — engraved on the love lock with a day count. */
  since: string;
  /** One reason per petal on the flower. */
  reasons: string[];
  /** Inside the ring box: "If you say yes, I promise…". */
  promise: string;
  question: string;
  yesLine: string;
  /** The first date as "officially us" — printed on the save-the-date card. */
  datePlan: string;
  /** "yesOnly" — No only wilts · "noAfterTries" — after `noTries` reaches it becomes "Let me think about it 🤍". */
  answerMode: "yesOnly" | "noAfterTries";
  noTries: "4" | "5";
  [k: string]: unknown;
}

/** One look: the page theme plus the garden paints the scenes use. */
export interface ProposalPaletteDef {
  label: string;
  swatch: string;
  theme: DayTheme;
  /** Pale tint for cards, the wipe, the scroll rail. */
  blush: string;
  /** The deepest tint (pill shadow, outlines). */
  deep: string;
  /** Garden leaves and stems. */
  leaf: string;
  /** The low golden-hour sun. */
  sun: string;
  /** Rolling hills, far → near. */
  hills: readonly [string, string, string];
  /** Floating petals / hearts. */
  hearts: readonly string[];
}

interface PalColors {
  bg: string;
  bg2: string;
  surface: string;
  gold: string;
  accent: string;
  accentDeep: string;
  text: string;
  textSoft: string;
  soft: string;
  edge: string;
  blush: string;
  deep: string;
  leaf: string;
  sun: string;
  hills: readonly [string, string, string];
}

const pal = (label: string, c: PalColors, hearts: readonly string[], confetti: readonly string[]): ProposalPaletteDef => ({
  label,
  swatch: c.accent,
  blush: c.blush,
  deep: c.deep,
  leaf: c.leaf,
  sun: c.sun,
  hills: c.hills,
  hearts,
  theme: {
    bg: `linear-gradient(180deg, ${c.surface} 0%, ${c.bg} 38%, ${c.bg2} 100%)`,
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
    gold: c.gold,
    dark: false,
    particles: hearts,
    confetti,
  },
});

/** The four looks (all light: golden hour in a pastel garden, never night). */
export const PROPOSAL_PALETTES: Record<ProposalPalette, ProposalPaletteDef> = {
  roseGoldBlush: pal(
    "Rose Gold Blush",
    {
      bg: "#FFF4F1", bg2: "#FAD9D3", surface: "#FFFFFF", gold: "#E3A891", accent: "#D45E78", accentDeep: "#A63D58", text: "#4A2430", textSoft: "#7A4858",
      soft: "#FCE5E1", edge: "#F1C6BB", blush: "#FBDDD6", deep: "#8E2F4B", leaf: "#9CC79A", sun: "#FFD3A6", hills: ["#F9DCD4", "#F4C3B9", "#EDAFA6"],
    },
    ["🌸", "💗", "✨", "🌷"],
    ["#D45E78", "#E3A891", "#FBDDD6", "#FFFFFF", "#F6C26B"],
  ),
  champagnePearl: pal(
    "Champagne Pearl",
    {
      bg: "#FFFAF1", bg2: "#F3E4CB", surface: "#FFFFFF", gold: "#D9B77E", accent: "#B4774A", accentDeep: "#87552C", text: "#3E2D1F", textSoft: "#6F5844",
      soft: "#F8EEDC", edge: "#EAD7B6", blush: "#F6E9D3", deep: "#6E4520", leaf: "#AFCB98", sun: "#FFE2A6", hills: ["#F7EBD6", "#EFDDBF", "#E6CCA6"],
    },
    ["🤍", "🥂", "✨", "🌼"],
    ["#B4774A", "#D9B77E", "#FFFFFF", "#F6E9D3", "#F3B7B5"],
  ),
  lilacGarden: pal(
    "Lilac Garden",
    {
      bg: "#F8F3FF", bg2: "#E4D7FA", surface: "#FFFFFF", gold: "#C7B1F0", accent: "#8A66D4", accentDeep: "#6646B2", text: "#33285A", textSoft: "#5F5585",
      soft: "#EEE6FD", edge: "#D7C9F5", blush: "#E8DDFB", deep: "#533999", leaf: "#A4D2B2", sun: "#FFD6E4", hills: ["#EDE3FC", "#DED0F8", "#CFBDF2"],
    },
    ["🪻", "💜", "✨", "🌸"],
    ["#8A66D4", "#C7B1F0", "#FFFFFF", "#FFC1D9", "#E8DDFB"],
  ),
  peachBellini: pal(
    "Peach Bellini",
    {
      bg: "#FFF6EF", bg2: "#FFDCC7", surface: "#FFFFFF", gold: "#FFBF98", accent: "#DC6D50", accentDeep: "#AC4D33", text: "#4B291D", textSoft: "#7D5345",
      soft: "#FFE9DC", edge: "#F7CDB4", blush: "#FFE1D1", deep: "#943B23", leaf: "#AFD3A0", sun: "#FFE09E", hills: ["#FFE6D6", "#FDD2BC", "#F8BFA4"],
    },
    ["🍑", "🧡", "✨", "🌼"],
    ["#DC6D50", "#FFBF98", "#FFFFFF", "#FFE1D1", "#F7A8B8"],
  ),
};

export const PROPOSAL_PALETTE_KEYS = Object.keys(PROPOSAL_PALETTES) as ProposalPalette[];

/**
 * What "what are you asking?" changes when the sender leaves a field empty:
 * the question, the YES button, the certificate, the wilting No's lines, the
 * honest way out and the WhatsApp reply.
 */
export const PROPOSAL_TONES: Record<
  ProposalTone,
  { question: string; yes: string; certificate: string; together: string; reply: string; noLines: readonly string[]; thinkLine: string }
> = {
  girlfriend: {
    question: "Will you be mine? 💗",
    yes: "Yes, I'm yours 💗",
    certificate: "Officially Ours",
    together: "are officially each other's",
    reply: "YES!! 💗 I'm yours. Officially. Now come here and hold my hand.",
    noLines: ["are you sure? 🥺", "look at the flowers 🌷", "pls pls pls", "I'll share my fries 🍟", "*hopeful blink*"],
    thinkLine: "Let me think about it 🤍",
  },
  boyfriend: {
    question: "Will you be my boyfriend? 💙",
    yes: "Yes, you're mine 💙",
    certificate: "Officially Ours",
    together: "are officially each other's",
    reply: "YES!! 💙 You're my boyfriend now. Officially. No take-backs.",
    noLines: ["wrong button 🙈", "try again, cutie", "I'll let you win at ludo", "pls? 🥺", "*sad blink*"],
    thinkLine: "Let me think about it 🤍",
  },
  marry: {
    question: "Will you marry me? 💍",
    yes: "Yes, a thousand times 💍",
    certificate: "Officially Engaged",
    together: "are officially engaged",
    reply: "YES!! 💍 A thousand times yes. Let's do forever together.",
    noLines: ["wrong button 💍", "shaadi karoge? 🥹", "I'll do the dishes forever", "think of the cake 🎂", "*kneels harder*"],
    thinkLine: "Can I think about it? 🤍",
  },
};

export const DEFAULT_LIGHTS_LINE = "you light up my whole world";

export const DEFAULT_STORY: readonly ProposalChapter[] = [
  { when: "Day one", title: "The first hello 👋", line: "You laughed at my terrible joke and I forgot the rest of my sentence." },
  { when: "That week", title: "Talking till sunrise 🌅", line: "We said 'one more minute' for six hours. Best sleepless night of my life." },
  { when: "Our first date", title: "Two chais, one umbrella ☔", line: "It poured, we got soaked, and I didn't want the evening to end." },
  { when: "Today", title: "A garden, just for you 🌷", line: "I can't picture a single day without you anymore. So I built you this." },
];

export const DEFAULT_REASONS: readonly string[] = [
  "Your laugh fixes my worst days in two seconds.",
  "You remember the tiny things nobody else notices.",
  "With you, silence feels cosy, never awkward.",
  "You make the most ordinary Tuesday feel like a holiday.",
  "You believe in me even when I don't.",
  "Because home stopped being a place and became you.",
  "And because I simply can't stop thinking about you.",
];

export const DEFAULT_PROMISE = "If you say yes, I promise to hold your hand through every boring Monday and every big adventure.";

/** The demo's "together since" (a fixed date so the day count looks real). */
export const DEMO_SINCE = "2024-02-14";

/**
 * Proposal songs, one tap each in the form; the sender can still paste any
 * YouTube link. Official artist / label uploads, none shared with Will You Be
 * Mine or Sorry — every id checked with YouTube oEmbed and the embed player
 * (playable off-site) on 2026-10-14. Audio only.
 */
export const PROPOSAL_SONGS: readonly SongSuggestion[] = [
  { id: "EkHTsc9PU2A", title: "I'm Yours", artist: "Jason Mraz" },
  { id: "LjhCEhWiKXk", title: "Just the Way You Are", artist: "Bruno Mars" },
  { id: "vGJTaP6anOU", title: "Can't Help Falling in Love", artist: "Elvis Presley" },
  { id: "0put0_a--Ng", title: "Make You Feel My Love", artist: "Adele" },
  { id: "IJq0yyWug1k", title: "Tum Hi Ho", artist: "Arijit Singh · Aashiqui 2" },
  { id: "cs1e0fRyI18", title: "Hawayein", artist: "Arijit Singh · Jab Harry Met Sejal" },
  { id: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh · Bhediya" },
  { id: "o-Gmhk90JOE", title: "Main Agar Kahoon", artist: "Sonu Nigam · Om Shanti Om" },
  { id: "cNV5hLSa9H8", title: "Tujhe Dekha To", artist: "Lata Mangeshkar & Kumar Sanu · DDLJ" },
];

/**
 * The page's own song (music mode "track"): Lover, from our CDN, so it starts
 * on the first tap with no YouTube player to wait for (even in the editor
 * preview). The YouTube songs above are the swaps.
 */
export const PROPOSAL_TRACK = {
  url: "https://cdn.subhsandesh.in/gifts-media/assets/LoveGf/music/lover.mp3",
  title: "Lover",
  artist: "Taylor Swift",
  hint: "Taylor Swift · plays first",
} as const;

const GIFS: GifSlot[] = [
  { id: "s1-peek", label: "Shy hello", moment: "Peeking out from behind the invitation", file: "peek.webp", emoji: "🙈", anim: "wiggle" },
  { id: "s2-story", label: "Our story", moment: "Riding along beside the carousel", file: "story.webp", emoji: "🎠", anim: "bounce" },
  { id: "s3-flowers", label: "Flowers", moment: "Holding flowers beside the reasons flower", file: "flowers.webp", emoji: "💐", anim: "float" },
  { id: "s4-kneel", label: "My heart", moment: "Offering a heart beside the ring box", file: "kneel.webp", emoji: "💍", anim: "float" },
  { id: "s5-please", label: "Pretty please", moment: "Waiting for the answer", file: "please.webp", emoji: "🥺", anim: "wiggle" },
  { id: "s6-yay", label: "YES!!", moment: "The second they say yes", file: "yay.webp", emoji: "🥳", anim: "bounce" },
  { id: "s7-hug", label: "Forever", moment: "Hugging beside the save-the-date", file: "hug.webp", emoji: "🤗", anim: "pulse" },
];

export const proposalPremiumDay: DayConfig<ProposalExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "The Proposal — Will You Be Mine?",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 30,
  asksQuestion: true,
  melody: "garden",
  photoAspect: 0.8,
  gifSlots: GIFS,
  topBar: true,
  brandMark: "stacked",
  music: {
    audioOnly: true,
    compact: true,
    track: PROPOSAL_TRACK,
    suggestions: PROPOSAL_SONGS,
    suggestionsNote: "English + Hindi love songs · tap one, or paste any YouTube link",
  },
  extras: [
    {
      key: "palette", kind: "enum", label: "Pick the look", display: "swatches", default: "roseGoldBlush",
      hint: "The whole garden turns this colour — the sky, the hills, the lights, the ring box.",
      options: PROPOSAL_PALETTE_KEYS.map((k) => ({ value: k, label: PROPOSAL_PALETTES[k].label, swatch: PROPOSAL_PALETTES[k].swatch })),
    },
    {
      key: "tone", kind: "enum", label: "What are you asking?", display: "cards", default: "girlfriend",
      hint: "Changes the default question, the YES button, the certificate and their reply.",
      options: [
        { value: "girlfriend", label: "Be mine", emoji: "💗", hint: "girlfriend, crush, my person" },
        { value: "boyfriend", label: "Be my boyfriend", emoji: "💙", hint: "for him" },
        { value: "marry", label: "Marry me", emoji: "💍", hint: "the big one" },
      ],
    },
    {
      key: "openingLine", kind: "text", max: 60, label: "On the invitation",
      placeholder: "a little line under their name",
      hint: "Printed on the wax-sealed invitation, the very first thing they see.",
      suggestions: ["a garden I grew just for you 🌷", "to the rest of my life 💌", "open it when you're smiling"],
    },
    {
      key: "lightsLine", kind: "text", max: 48, label: "On the string lights",
      placeholder: DEFAULT_LIGHTS_LINE,
      hint: "Each bulb they light shows one word (up to 7 words). Leave empty for the default.",
      suggestions: [DEFAULT_LIGHTS_LINE, "tum ho toh sab roshan hai", "every light is a reason I smile"],
    },
    {
      key: "story", kind: "objlist", maxItems: 5, itemTitle: "Chapter", addLabel: "+ add a chapter",
      label: "Our story (the carousel)",
      hint: "One chapter on each carousel horse. They spin it round and read every one.",
      item: [
        { key: "when", kind: "text", max: 24, label: "When", placeholder: "Day one" },
        { key: "title", kind: "text", max: 36, label: "Chapter", placeholder: "The first hello 👋" },
        { key: "line", kind: "text", max: 100, label: "What happened", placeholder: "You laughed at my terrible joke…" },
      ],
    },
    {
      key: "since", kind: "text", max: 10, input: "date", label: "Together since",
      hint: "Engraved on the love lock with a live day count. Leave empty to hide the count.",
    },
    {
      key: "reasons", kind: "list", maxItems: 7, itemMax: 70, label: "Reasons I love you (the petals)",
      hint: "They pluck one petal at a time, and each one holds a reason. It always ends on “loves me”.",
      itemLabels: ["Petal 1", "Petal 2", "Petal 3", "Petal 4", "Petal 5", "Petal 6", "Petal 7"],
      itemPlaceholder: DEFAULT_REASONS,
    },
    {
      key: "promise", kind: "text", max: 140, label: "Your promise (inside the ring box)",
      placeholder: DEFAULT_PROMISE,
      hint: "Rises with the ring when they swipe the lid open.",
      suggestions: [DEFAULT_PROMISE, "I promise to choose you, every single day, even on the grumpy ones."],
    },
    {
      key: "question", kind: "text", max: 60, label: "The big question",
      placeholder: "leave empty to use the one for what you're asking",
      hint: "No wilts a little more every time they reach for it, and YES blooms.",
      suggestions: ["Will you be mine? 💗", "Will you marry me? 💍", "Mera hamesha ka saath dogi? 🥹"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "After they say yes",
      placeholder: "what you'd say the second they say yes",
      suggestions: ["You just made me the happiest person in the whole world 🥹"],
    },
    {
      key: "datePlan", kind: "text", max: 80, label: "Save the date (our first date as us)",
      placeholder: "Dinner at our café, this Saturday at 8 🌙",
      hint: "Printed on the save-the-date keepsake after they say yes.",
      suggestions: ["Dinner at our café, this Saturday at 8 🌙", "Sunset walk + ice cream, Sunday 6 pm 🍦"],
    },
    {
      key: "answerMode", kind: "enum", label: "How can they answer?", display: "cards", default: "yesOnly",
      hint: "Either way you'll get an email the moment they answer, and see it on your page card.",
      options: [
        { value: "yesOnly", label: "Only Yes", emoji: "💗", hint: "No just wilts away" },
        { value: "noAfterTries", label: "Yes, or “Let me think”", emoji: "🤍", hint: "an honest way out after a few tries" },
      ],
    },
    {
      key: "noTries", kind: "enum", label: "“Let me think” appears after", display: "chips", default: "4",
      hint: "No wilts this many times with cute lines, then turns into a gentle “Let me think about it 🤍”.",
      showIf: { key: "answerMode", value: "noAfterTries" },
      options: [
        { value: "4", label: "4 tries" },
        { value: "5", label: "5 tries" },
      ],
    },
  ],
  theme: PROPOSAL_PALETTES.roseGoldBlush.theme,
  demo: {
    recipientName: "Riya",
    senderName: "Aarav",
    petName: "Sunshine",
    letter:
      "I've rewritten this letter eleven times, so here's the twelfth, and the truest one.\n\nSomewhere between that first terrible joke and today, you became my favourite part of every single day. I catch myself saving little things to tell you: a funny dog on the street, a song on the radio, a sky that looked like your favourite colour.\n\nYou make me braver, kinder and a lot more patient (okay, a little more). With you, the ordinary days feel like the best ones.\n\nSo I grew you a garden, strung up some lights and built you a carousel, because I wanted to ask you properly, in a place as soft as you make me feel.",
    photos: demoPhotos([
      ["the first selfie", "You said delete it. I printed it instead."],
      ["golden hour, us", "The light was perfect. So were you."],
      ["that long drive", "Bad playlist, great company."],
      ["us, always", "My favourite place is next to you."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...TRACK_DEMO,
    endLine: "Here's to every golden hour after this one 🌅",
    extras: {
      palette: "roseGoldBlush",
      tone: "girlfriend",
      openingLine: "a garden I grew just for you 🌷",
      lightsLine: DEFAULT_LIGHTS_LINE,
      story: DEFAULT_STORY.map((c) => ({ ...c })),
      since: DEMO_SINCE,
      reasons: [...DEFAULT_REASONS],
      promise: DEFAULT_PROMISE,
      question: "Will you be mine? 💗",
      yesLine: "You just made me the happiest person in the whole world 🥹",
      datePlan: "Dinner at our café, this Saturday at 8 🌙",
      answerMode: "yesOnly",
      noTries: "4",
    },
  },
  copy: {
    recipientPlaceholder: "who you're asking — e.g. Riya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — sunshine, jaan, baby…",
    letterPlaceholder: "Your love letter: how it started, what they mean to you, why you're asking now.",
    letterHint: "Rolled into a ribboned scroll. They pull the ribbon to read it.",
    photosHint: "Your photos, as a deck of keepsake cards they swipe through.",
    captionHint: "caption — e.g. golden hour, us",
    noteHint: "what you remember about that moment…",
    endLinePlaceholder: "Here's to every golden hour after this one 🌅",
    endLineHint: "The last line, on their “Officially Ours” certificate.",
    sheetTitle: "Plan the proposal 💍",
    sheetSub: "Pick a look, write your story, your reasons and your promise. Everything is pre-filled, so make it yours.",
    extrasTitle: "Your proposal",
    extrasSub: "The look, what you're asking, the lights, the carousel, your date, the petals, the ring box and the question",
    publishing: "Lighting up the garden…",
    storyTitle: "Let's plan your proposal 💍",
    replyText: "YES!! 💗 I'm yours. Officially. Now come here and hold my hand.",
    yesChip: "Said YES 💍",
  },
  share: { title: "You're invited 💌 Someone has a question for you", accent: "#A63D58" },
};
