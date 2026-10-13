// ─── Will You Be Mine? — a cute, romantic proposal page ──────────────────────
//
// An evergreen occasion on the Valentine engine (like Sorry), for asking a
// crush / girlfriend / boyfriend to be yours — or to marry you. Server twin:
// server/src/config/valentineDays.ts ("will-you-be-mine"); keys and limits must
// match (valentineDays.test.ts pins them).
//
// The flow follows what makes people say yes (and cry): it is built from the
// couple's own specifics — how it started, why they fell, inside jokes — and
// it saves the question for the very end (app/(templates)/will-you-be-mine):
//   a velvet ring box (tap the bow to open it… it's empty, "the ring comes at
//   the end 😌") → our story (walk a little heart path, one chapter per stop) →
//   reasons I fell for you (connect the stars into a heart constellation) → a
//   love quiz with a rigged love meter → polaroids → the letter → hold the
//   heart till it's full (the ring box opens, with a promise) → "Will you be
//   mine?" — No runs away and Yes grows; the sender may let No become an
//   honest "Let me think about it 🤍" → YES: fireworks, the "Officially Mine"
//   certificate and a reply on WhatsApp.
//
// The sender picks one of four looks (extras.palette); the whole page is
// re-skinned from WYBM_PALETTES, the editor's own chrome stays Rose Gold.

import type { DayConfig, GifSlot } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { TRACK_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "will-you-be-mine" as const;

export type WybmTone = "girlfriend" | "boyfriend" | "marry" | "date";
export type WybmPalette = "roseGold" | "cherryBlossom" | "starryNight" | "ivoryLace";

export interface WybmChapter {
  when: string;
  title: string;
  line: string;
}

export interface WybmQuizItem {
  q: string;
  right: string;
  wrong1: string;
  wrong2: string;
}

export interface WybmExtras {
  palette: WybmPalette;
  tone: WybmTone;
  openingLine: string;
  /** Our story — one chapter per stop on the heart path. */
  story: WybmChapter[];
  /** One reason per star in the heart constellation. */
  reasons: string[];
  /** The love quiz: the right answer and two wrong ones (shown shuffled). */
  quiz: WybmQuizItem[];
  /** Inside the ring box, after the hold: "If you say yes, I promise…". */
  promise: string;
  question: string;
  yesLine: string;
  /** "yesOnly" — No runs away forever · "noAfterTries" — after `noTries` dodges it becomes "Let me think about it 🤍". */
  answerMode: "yesOnly" | "noAfterTries";
  noTries: "4" | "5";
  [k: string]: unknown;
}

/** One look: the page theme plus the few extra paints the scenes use. */
export interface WybmPaletteDef {
  label: string;
  swatch: string;
  theme: DayTheme;
  /** Pale tint for cards, the wipe, the scroll rail (a deep tint on the dark look). */
  blush: string;
  /** The deepest tint (pill shadow, outlines). */
  deep: string;
  /** The ring box velvet. */
  velvet: string;
  /** The constellation sky (top → bottom). */
  sky: readonly [string, string];
  /** Floating hearts / confetti. */
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
  velvet: string;
  sky: readonly [string, string];
}

const pal = (label: string, c: PalColors, hearts: readonly string[], confetti: readonly string[], dark = false): WybmPaletteDef => ({
  label,
  swatch: dark ? c.bg : c.accent,
  blush: c.blush,
  deep: c.deep,
  velvet: c.velvet,
  sky: c.sky,
  hearts,
  theme: {
    bg: dark
      ? `radial-gradient(120% 70% at 50% 0%, ${c.surface} 0%, ${c.bg} 50%, ${c.bg2} 100%)`
      : `radial-gradient(120% 70% at 50% 0%, ${c.surface} 0%, ${c.bg} 46%, ${c.bg2} 100%)`,
    base: c.bg,
    paper: c.surface,
    glass: dark ? "rgba(34,42,87,0.62)" : "rgba(255,255,255,0.62)",
    ink: c.text,
    inkSoft: c.textSoft,
    paperInk: c.text,
    accent: c.accent,
    accentDeep: c.accentDeep,
    accentInk: "#FFFFFF",
    soft: c.soft,
    edge: c.edge,
    gold: c.gold,
    dark,
    particles: hearts,
    confetti,
  },
});

/** The four looks the sender can pick (soft and romantic; one night-sky look for the starry kind). */
export const WYBM_PALETTES: Record<WybmPalette, WybmPaletteDef> = {
  roseGold: pal(
    "Rose Gold",
    { bg: "#FFF3F0", bg2: "#F8D5CE", surface: "#FFFFFF", gold: "#E2A98F", accent: "#E0637F", accentDeep: "#B8435F", text: "#4E2530", textSoft: "#86566A", soft: "#FCE4E2", edge: "#F0C7BD", blush: "#FBDCD6", deep: "#9A3150", velvet: "#B8435F", sky: ["#3B1E36", "#7C3C58"] },
    ["💗", "🌹", "✨", "💕"],
    ["#E0637F", "#E2A98F", "#FBDCD6", "#FFFFFF", "#F6C26B"],
  ),
  cherryBlossom: pal(
    "Cherry Blossom",
    { bg: "#FFF4F8", bg2: "#FFD8E7", surface: "#FFFFFF", gold: "#F4A7C3", accent: "#EE5A8F", accentDeep: "#C23C6E", text: "#4A2036", textSoft: "#85516B", soft: "#FFE2EE", edge: "#F7C3D7", blush: "#FFD3E4", deep: "#A32B5A", velvet: "#C23C6E", sky: ["#33193F", "#7A4377"] },
    ["🌸", "💮", "💗", "✨"],
    ["#EE5A8F", "#F4A7C3", "#FFFFFF", "#FFD3E4", "#B5E3C4"],
  ),
  starryNight: pal(
    "Starry Night",
    { bg: "#151B3D", bg2: "#090C22", surface: "#252D5E", gold: "#F2C879", accent: "#F27BA7", accentDeep: "#D2558A", text: "#FFF6EC", textSoft: "#C9C4EA", soft: "#2E3670", edge: "#434C8E", blush: "#343A74", deep: "#7E2C5A", velvet: "#A3376A", sky: ["#070A1E", "#1D2554"] },
    ["⭐", "✨", "💫", "💗"],
    ["#F2C879", "#F27BA7", "#FFFFFF", "#9FB4FF", "#FFD9E8"],
    true,
  ),
  ivoryLace: pal(
    "Ivory Lace",
    { bg: "#FFFBF2", bg2: "#F3E6CF", surface: "#FFFFFF", gold: "#D6B27A", accent: "#B4475F", accentDeep: "#8C3149", text: "#3F2A22", textSoft: "#7A6355", soft: "#F7ECDB", edge: "#E9D7B9", blush: "#F6E6CF", deep: "#6E2439", velvet: "#8C3149", sky: ["#2A2033", "#5C3F50"] },
    ["🤍", "🕊️", "💐", "✨"],
    ["#B4475F", "#D6B27A", "#FFFFFF", "#F6E6CF", "#E8A7B6"],
  ),
};

export const WYBM_PALETTE_KEYS = Object.keys(WYBM_PALETTES) as WybmPalette[];

/**
 * What "what are you asking?" changes when the sender leaves a field empty:
 * the question, the YES button, the certificate, the dodging No's lines, the
 * honest way out and the WhatsApp reply.
 */
export const WYBM_TONES: Record<
  WybmTone,
  { question: string; yes: string; certificate: string; together: string; reply: string; noLines: readonly string[]; thinkLine: string }
> = {
  girlfriend: {
    question: "Will you be my girlfriend? 💗",
    yes: "YES, I'm yours 💗",
    certificate: "Officially Mine",
    together: "are officially together",
    reply: "YES!!! 💗 I'm your girlfriend now. Officially. No take-backs.",
    noLines: ["are you sure? 🥺", "think again 🙈", "pls pls pls", "I'll share my fries 🍟", "*puppy eyes*"],
    thinkLine: "Let me think about it 🤍",
  },
  boyfriend: {
    question: "Will you be my boyfriend? 💙",
    yes: "YES, you're mine 💙",
    certificate: "Officially Mine",
    together: "are officially together",
    reply: "YES!!! 💙 You're my boyfriend now. Officially. No take-backs.",
    noLines: ["wrong button 🙈", "try again, cutie", "I'll let you win at ludo", "pls? 🥺", "*sad blink*"],
    thinkLine: "Let me think about it 🤍",
  },
  marry: {
    question: "Will you marry me? 💍",
    yes: "YES, a thousand times 💍",
    certificate: "Officially Engaged",
    together: "are officially engaged",
    reply: "YES!!! 💍 A thousand times yes. Let's do forever together.",
    noLines: ["wrong button 💍", "shaadi karoge? 🥹", "I'll do the dishes forever", "think of the cake 🎂", "*kneels harder*"],
    thinkLine: "Can I think about it? 🤍",
  },
  date: {
    question: "Will you go out with me? 🙈",
    yes: "Yes, let's go 🙈",
    certificate: "Officially Going Out",
    together: "are officially going out",
    reply: "Okay YES 🙈 Let's go on that date!",
    noLines: ["are you sure? 🙈", "just one date?", "I'll buy the coffee ☕", "pretty please", "*hopeful wiggle*"],
    thinkLine: "Let me think about it 🤍",
  },
};

export const DEFAULT_STORY: readonly WybmChapter[] = [
  { when: "Day one", title: "The first hello 👋", line: "You laughed at my terrible joke and I forgot the rest of my sentence." },
  { when: "A week later", title: "The 3 a.m. chats 🌙", line: "We talked till the sky turned pink. I was tired all day and didn't care at all." },
  { when: "That rainy day", title: "Our first date ☕", line: "Two chais, one umbrella, and I knew I was in trouble (the good kind)." },
  { when: "Today", title: "This little page 💌", line: "I can't imagine my days without you anymore. So I made you this." },
];

export const DEFAULT_REASONS: readonly string[] = [
  "Your laugh fixes my worst days in two seconds.",
  "You remember the tiny things nobody else notices.",
  "You're my favourite notification.",
  "With you, silence feels cosy, never awkward.",
  "You make me want to be a better person.",
  "Because home stopped being a place and became you.",
];

export const DEFAULT_QUIZ: readonly WybmQuizItem[] = [
  { q: "Where did we first meet?", right: "College canteen", wrong1: "A cousin's wedding", wrong2: "On Instagram" },
  { q: "What do I love most about you?", right: "Your smile", wrong1: "Your playlist", wrong2: "Your cooking 😅" },
  { q: "Who fell first?", right: "Me, obviously 🙈", wrong1: "You did", wrong2: "The dog" },
];

export const DEFAULT_PROMISE = "I'll hold your hand through every boring Monday and every big adventure.";

/**
 * Proposal songs, one tap each in the form; the sender can still paste any
 * YouTube link. Official artist / label uploads — every id checked with YouTube
 * oEmbed and the embed player (playable off-site) on 2026-10-14. Audio only.
 */
export const WYBM_SONGS: readonly SongSuggestion[] = [
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "dElRVQFqj-k", title: "Marry You", artist: "Bruno Mars" },
  { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran" },
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "8xg3vE8Ie_E", title: "Love Story", artist: "Taylor Swift" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh · Brahmāstra" },
  { id: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal · Shershaah" },
  { id: "mt9xg0mmt28", title: "Tum Se Hi", artist: "Mohit Chauhan · Jab We Met" },
  { id: "mQiiw7uRngk", title: "Tera Ban Jaunga", artist: "Akhil Sachdeva · Kabir Singh" },
  { id: "iSUK1QoK9-E", title: "Pehla Nasha", artist: "Udit Narayan · Sadhana Sargam" },
];

/**
 * The page's own song (music mode "track"): Perfect, from our CDN, so it starts
 * on the first tap with no YouTube player to wait for (even in the editor
 * preview). The YouTube songs above are the swaps.
 */
export const WYBM_TRACK = {
  url: "https://cdn.subhsandesh.in/gifts-media/assets/LoveGf/music/perfect.mp3",
  title: "Perfect",
  artist: "Ed Sheeran",
  hint: "Ed Sheeran · plays first",
} as const;

const GIFS: GifSlot[] = [
  { id: "s1-gate", label: "Shy hello", moment: "Blushing beside the ring box", file: "s1-gate.webp", emoji: "🥰", anim: "wiggle" },
  { id: "s2-story", label: "Our story", moment: "Walking along your story path", file: "s2-story.webp", emoji: "👫", anim: "bounce" },
  { id: "s3-quiz", label: "Hmm…", moment: "Thinking beside the love quiz", file: "s3-quiz.webp", emoji: "🤔", anim: "float" },
  { id: "s4-propose", label: "The ring", moment: "Offering the ring, beside your promise", file: "s4-propose.webp", emoji: "💍", anim: "float" },
  { id: "s5-yes", label: "Yes!!", moment: "After they say yes", file: "s5-yes.webp", emoji: "🥳", anim: "bounce" },
];

export const willYouBeMineDay: DayConfig<WybmExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Will You Be Mine?",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 30,
  asksQuestion: true,
  melody: "velvet",
  photoAspect: 1,
  gifSlots: GIFS,
  topBar: true,
  brandMark: "stacked",
  music: {
    audioOnly: true,
    compact: true,
    track: WYBM_TRACK,
    suggestions: WYBM_SONGS,
    suggestionsNote: "English + Hindi proposal songs · tap one, or paste any YouTube link",
  },
  extras: [
    {
      key: "palette", kind: "enum", label: "Pick the look", display: "swatches", default: "roseGold",
      hint: "The whole page turns this colour — the background, the ring box, the stars, the certificate.",
      options: WYBM_PALETTE_KEYS.map((k) => ({ value: k, label: WYBM_PALETTES[k].label, swatch: WYBM_PALETTES[k].swatch })),
    },
    {
      key: "tone", kind: "enum", label: "What are you asking?", display: "cards", default: "girlfriend",
      hint: "Changes the default question, the YES button, the certificate and the reply they send back.",
      options: [
        { value: "girlfriend", label: "Be my girlfriend", emoji: "💗", hint: "for her" },
        { value: "boyfriend", label: "Be my boyfriend", emoji: "💙", hint: "for him" },
        { value: "marry", label: "Marry me", emoji: "💍", hint: "the big one" },
        { value: "date", label: "Go out with me", emoji: "🙈", hint: "for a crush" },
      ],
    },
    {
      key: "openingLine", kind: "text", max: 60, label: "On the ring box",
      placeholder: "a little line under their name",
      hint: "Printed under “Psst, <their name>…” on the very first screen.",
      suggestions: ["open this when you're smiling 🎀", "I've been nervous all week for this", "a tiny box with a big question"],
    },
    {
      key: "story", kind: "objlist", maxItems: 4, itemTitle: "Chapter", addLabel: "+ add a chapter",
      label: "Our story",
      hint: "They walk a little heart path, one stop per chapter — from the day you met to today. The details only you two know make them melt.",
      item: [
        { key: "when", kind: "text", max: 24, label: "When", placeholder: "Day one" },
        { key: "title", kind: "text", max: 36, label: "Chapter", placeholder: "The first hello 👋" },
        { key: "line", kind: "text", max: 100, label: "What happened", placeholder: "You laughed at my terrible joke…" },
      ],
    },
    {
      key: "reasons", kind: "list", maxItems: 6, itemMax: 70, label: "Reasons I fell for you",
      hint: "They connect the stars, one by one, into a heart constellation — each star holds one reason. 3 to 6 stars.",
      itemLabels: ["Star 1", "Star 2", "Star 3", "Star 4", "Star 5", "Star 6"],
      itemPlaceholder: DEFAULT_REASONS,
    },
    {
      key: "quiz", kind: "objlist", maxItems: 3, itemTitle: "Question", addLabel: "+ add a question",
      label: "Little love quiz",
      hint: "Inside jokes welcome. Whatever they pick, the love meter still goes up (it's rigged 😌).",
      item: [
        { key: "q", kind: "text", max: 60, label: "Question", placeholder: "Where did we first meet?" },
        { key: "right", kind: "text", max: 30, label: "Right answer", placeholder: "College canteen" },
        { key: "wrong1", kind: "text", max: 30, label: "Wrong answer", placeholder: "A cousin's wedding" },
        { key: "wrong2", kind: "text", max: 30, label: "Another wrong one", placeholder: "On Instagram" },
      ],
    },
    {
      key: "promise", kind: "text", max: 140, label: "Your promise (inside the ring box)",
      placeholder: "If you say yes, I promise…",
      hint: "They hold a heart till it fills up — the ring box opens, and this is written inside.",
      suggestions: [DEFAULT_PROMISE, "I'll always save you the last bite, and the window seat."],
    },
    {
      key: "question", kind: "text", max: 60, label: "The big question",
      placeholder: "leave empty to use the one for what you're asking",
      hint: "The No button gets shy and runs away; the Yes button grows.",
      suggestions: ["Will you be mine? 💗", "Will you be my girlfriend? 💗", "Will you marry me? 💍", "Mere saath chaloge? 🥹"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "After they say yes",
      placeholder: "what you'd say the second they say yes",
      suggestions: ["Best day of my life. I'm never letting go of your hand 💗"],
    },
    {
      key: "answerMode", kind: "enum", label: "How can they answer?", display: "cards", default: "yesOnly",
      hint: "Either way you'll see their answer on your page card, by email, and when you open your own link.",
      options: [
        { value: "yesOnly", label: "Only Yes", emoji: "💗", hint: "No keeps running away" },
        { value: "noAfterTries", label: "Yes, or “let me think”", emoji: "🤍", hint: "an honest way out after a few tries" },
      ],
    },
    {
      key: "noTries", kind: "enum", label: "“Let me think” appears after", display: "chips", default: "4",
      hint: "No runs away this many times with cute lines, then turns into a gentle “Let me think about it 🤍”.",
      showIf: { key: "answerMode", value: "noAfterTries" },
      options: [
        { value: "4", label: "4 tries" },
        { value: "5", label: "5 tries" },
      ],
    },
  ],
  theme: WYBM_PALETTES.roseGold.theme,
  demo: {
    recipientName: "Ananya",
    senderName: "Rohan",
    petName: "Cutie",
    letter:
      "I've rewritten this letter about eleven times, so I'm just going to say it the way it sounds in my head.\n\nSomewhere between our first silly chat and the hundredth “reached home?”, you became my favourite part of every day. I catch myself saving little things to tell you — a dog I saw, a song, a bad joke — because nothing feels finished until you know about it.\n\nYou make ordinary days feel like the good scenes in a movie. You're kind when nobody is watching, you laugh with your whole face, and you make me braver than I am.\n\nSo I'm done keeping it in. I don't want to be just someone you talk to. I want to be your person.",
    photos: demoPhotos([
      ["the first selfie", "You made me retake it nine times. Worth it."],
      ["that sunset", "I wasn't looking at the sunset."],
      ["our chai spot", "Same table, every time. Our table."],
      ["us, always", "My favourite view, honestly."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...TRACK_DEMO,
    endLine: "You + me = my favourite story 💗",
    extras: {
      palette: "roseGold",
      tone: "girlfriend",
      openingLine: "open this when you're smiling 🎀",
      story: DEFAULT_STORY.map((c) => ({ ...c })),
      reasons: [...DEFAULT_REASONS],
      quiz: DEFAULT_QUIZ.map((q) => ({ ...q })),
      promise: DEFAULT_PROMISE,
      question: "Will you be my girlfriend? 💗",
      yesLine: "Best day of my life. I'm never letting go of your hand 💗",
      answerMode: "yesOnly",
      noTries: "4",
    },
  },
  copy: {
    recipientPlaceholder: "who you're asking — e.g. Ananya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — cutie, jaan, baby…",
    letterPlaceholder: "Tell them how you feel: when you knew, what you love about them, and what you want with them. Be you.",
    letterHint: "Folded like a love letter. They unfold it after the photos.",
    photosHint: "Your photos, as a little strip of polaroids they swipe through.",
    captionHint: "caption — e.g. the first selfie",
    noteHint: "what you remember about that moment…",
    endLinePlaceholder: "You + me = my favourite story 💗",
    endLineHint: "The last line, on their “Officially Mine” certificate.",
    sheetTitle: "Ask them, the cute way 💍",
    sheetSub: "Pick a look and what you're asking, then add your story, the reasons you fell, a little quiz and your promise. Everything is pre-filled, so make it yours.",
    extrasTitle: "Your proposal",
    extrasSub: "The colour, what you're asking, your story, the stars, the quiz, your promise and the question",
    publishing: "Polishing the ring…",
    storyTitle: "Let's ask the big question 💍",
    replyText: "YES!!! 💗 I'm yours. Officially. No take-backs.",
    yesChip: "Said YES 💍",
  },
  share: { title: "Someone has a question for you 💍 Open this", accent: "#B8435F" },
};
