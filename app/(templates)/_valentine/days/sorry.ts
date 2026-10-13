// ─── I'm Sorry — a cute, romantic, forgive-me page ───────────────────────────
//
// An evergreen occasion on the Valentine engine (like Dandiya Partner), all copy
// English with a little Hinglish. Server twin: server/src/config/valentineDays.ts
// ("sorry"); keys and limits must match (valentineDays.test.ts pins them).
//
// The flow follows what research says makes an apology land (Lewicki et al.,
// 2016: owning it matters most, then repair; asking for forgiveness matters
// least, so it comes last) — app/(templates)/sorry/components:
//   a sealed sorry envelope (tap the heart seal) → "how upset are you?" (a
//   slider; the bear's face follows her mood, the sender answers each level) →
//   "what I did" (scratch it off: the sender owns it, in their own words) →
//   pop the guilt bubbles (one reason in each) → our photos → the letter → the
//   pinky promise (hold to seal it) → make-it-up coupons (she claims one) →
//   "Forgive me?" — No runs away; the sender may let it turn into an honest
//   "I need a little time 🤍" → forgiven: confetti, hug, the certificate.
//
// The sender picks one of six pastel looks (extras.palette); the whole page is
// re-skinned from SORRY_PALETTES, the editor's own chrome stays Baby Pink.

import type { DayConfig, GifSlot } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { TRACK_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "sorry" as const;

export type SorryTone = "partner" | "crush" | "bestie";
export type SorryPalette = "babyPink" | "strawberryMilk" | "mintMatcha" | "lavenderDream" | "peachCream" | "skyCotton";

export interface SorryCoupon {
  title: string;
  line: string;
}

export interface SorryExtras {
  palette: SorryPalette;
  tone: SorryTone;
  openingLine: string;
  /** What the sender says at each of the five anger levels (calm → fuming). */
  moodLines: string[];
  /** "What I did" — scratched off; the sender owns it. */
  confession: string;
  /** One reason in each guilt bubble. */
  reasons: string[];
  promise: string;
  coupons: SorryCoupon[];
  question: string;
  yesLine: string;
  /** "yesOnly" — No runs away forever · "noAfterTries" — after `noTries` dodges it becomes "I need a little time 🤍". */
  answerMode: "yesOnly" | "noAfterTries";
  noTries: "4" | "5";
  [k: string]: unknown;
}

/** One pastel look: the page theme plus the few extra paints the scenes use. */
export interface SorryPaletteDef {
  label: string;
  swatch: string;
  theme: DayTheme;
  /** Pale blush for bubbles, coupons, the scratch foil. */
  blush: string;
  /** The deepest tint (outlines, the bear's mouth). */
  deep: string;
  /** Floating hearts / confetti. */
  hearts: readonly string[];
}

const pal = (
  label: string,
  c: { bg: string; bg2: string; surface: string; primary: string; accent: string; accentDeep: string; text: string; textSoft: string; soft: string; edge: string; blush: string; deep: string },
  hearts: readonly string[],
  confetti: readonly string[],
): SorryPaletteDef => ({
  label,
  swatch: c.primary,
  blush: c.blush,
  deep: c.deep,
  hearts,
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
    particles: hearts,
    confetti,
  },
});

/** The six looks the sender can pick (research: soft pastels read "cute + sincere", never "loud"). */
export const SORRY_PALETTES: Record<SorryPalette, SorryPaletteDef> = {
  babyPink: pal(
    "Baby Pink",
    { bg: "#FFF0F5", bg2: "#FFD9E8", surface: "#FFFFFF", primary: "#F7A1C4", accent: "#FF6F91", accentDeep: "#D9466E", text: "#5A2A3C", textSoft: "#8C5A6E", soft: "#FFE3EE", edge: "#F7C6D8", blush: "#FFD3E2", deep: "#B83A62" },
    ["💗", "🩷", "💕", "✨"],
    ["#FF6F91", "#F7A1C4", "#FFD3E2", "#FFFFFF", "#FFC2D6"],
  ),
  strawberryMilk: pal(
    "Strawberry Milk",
    { bg: "#FFE4EC", bg2: "#FFC9D9", surface: "#FFF7FA", primary: "#FF8FAB", accent: "#E8436B", accentDeep: "#B82A4E", text: "#4A1F2C", textSoft: "#7E4757", soft: "#FFD6E2", edge: "#F9B3C7", blush: "#FFC2D3", deep: "#A3243F" },
    ["🍓", "💗", "🥛", "✨"],
    ["#E8436B", "#FF8FAB", "#FFF7FA", "#FFC2D3", "#FF5C83"],
  ),
  mintMatcha: pal(
    "Mint Matcha",
    { bg: "#EAFBF1", bg2: "#CDEFDC", surface: "#FFFFFF", primary: "#9ADBB5", accent: "#3FAE7A", accentDeep: "#2B8A5E", text: "#234236", textSoft: "#4F7464", soft: "#D8F4E4", edge: "#B6E5C9", blush: "#C9EFD9", deep: "#237452" },
    ["💚", "🍵", "🌿", "✨"],
    ["#3FAE7A", "#9ADBB5", "#FFFFFF", "#FFB6C9", "#C9EFD9"],
  ),
  lavenderDream: pal(
    "Lavender Dream",
    { bg: "#F3EEFF", bg2: "#DED2FB", surface: "#FFFFFF", primary: "#C3B1F5", accent: "#8A6FE0", accentDeep: "#6A4EC2", text: "#3A2C5C", textSoft: "#655985", soft: "#E8E0FD", edge: "#D2C5F7", blush: "#DCD0FA", deep: "#5B3FB0" },
    ["💜", "🪻", "🫧", "✨"],
    ["#8A6FE0", "#C3B1F5", "#FFFFFF", "#FFB6D9", "#DCD0FA"],
  ),
  peachCream: pal(
    "Peach Cream",
    { bg: "#FFF3EA", bg2: "#FFDCC6", surface: "#FFFDF9", primary: "#FFC4A3", accent: "#FF8A5B", accentDeep: "#D9663A", text: "#5B3324", textSoft: "#8A5E4C", soft: "#FFE6D6", edge: "#FFD0B6", blush: "#FFD9C4", deep: "#B85530" },
    ["🧡", "🍑", "🌷", "✨"],
    ["#FF8A5B", "#FFC4A3", "#FFFDF9", "#FFB0C4", "#FFD9C4"],
  ),
  skyCotton: pal(
    "Sky Cotton",
    { bg: "#EDF6FF", bg2: "#CFE5FB", surface: "#FFFFFF", primary: "#A7D3F7", accent: "#4E9BE0", accentDeep: "#3478BA", text: "#1F3A55", textSoft: "#4C6A88", soft: "#DCEDFD", edge: "#BDDCF8", blush: "#D3E8FC", deep: "#2E68A3" },
    ["🩵", "☁️", "💙", "✨"],
    ["#4E9BE0", "#A7D3F7", "#FFFFFF", "#FFC2DA", "#D3E8FC"],
  ),
};

export const SORRY_PALETTE_KEYS = Object.keys(SORRY_PALETTES) as SorryPalette[];

/**
 * What "who it's for" changes when the sender leaves a field empty: the
 * question, the YES button, the certificate, the dodging No's lines and the
 * WhatsApp reply.
 */
export const SORRY_TONES: Record<
  SorryTone,
  { question: string; yes: string; certificate: string; reply: string; noLines: readonly string[]; timeLine: string }
> = {
  partner: {
    question: "Will you forgive me? 🥺",
    yes: "Yes, I forgive you 💗",
    certificate: "Officially Forgiven",
    reply: "Okay okay… I forgive you 💗 Now come here and give me that hug.",
    noLines: ["pls? 🥺", "pretty please?", "maaf kar do na 🥹", "I'll get you momos", "*puppy eyes*"],
    timeLine: "I need a little time 🤍",
  },
  crush: {
    question: "Still friends? Forgive me? 🙈",
    yes: "Okay, you're forgiven 🙈",
    certificate: "Forgiven (Probably Still Cute)",
    reply: "Fine, you're forgiven 🙈 Don't do it again.",
    noLines: ["are you sure? 🥺", "one more chance?", "I brought chocolate", "pls pls pls", "*sad blink*"],
    timeLine: "Give me a little time 🤍",
  },
  bestie: {
    question: "Bestie, forgive me? 🥺👉👈",
    yes: "Fine, bestie 😤💗",
    certificate: "Bestie Status: Restored",
    reply: "Okay fine, you're forgiven 😤💗 But you're paying for the next maggi.",
    noLines: ["bestie no?", "I'll do your notes", "maggi on me 🍜", "pls 🥺👉👈", "*sad hamster noises*"],
    timeLine: "Bestie, give me some time 🤍",
  },
};

/** The five anger levels the slider goes through (her pick shows the sender's matching line). */
export const SORRY_MOODS: readonly { label: string; face: "calm" | "pout" | "huff" | "angry" | "fuming"; emoji: string }[] = [
  { label: "A tiny bit upset", face: "calm", emoji: "🙂" },
  { label: "Pouting", face: "pout", emoji: "😗" },
  { label: "Huffy", face: "huff", emoji: "😤" },
  { label: "Really angry", face: "angry", emoji: "😠" },
  { label: "Absolutely fuming", face: "fuming", emoji: "🤬" },
];

export const DEFAULT_MOOD_LINES: readonly string[] = [
  "Phew. Then let me make it zero with one hug?",
  "That pout is illegal. I'm sorry, really.",
  "Okay, I deserve the huff. Hear me out?",
  "You have every right to be. I'm so sorry.",
  "I know. I messed up badly, and I'm here to fix it.",
];

export const DEFAULT_REASONS: readonly string[] = [
  "I made you feel unheard, and you never deserve that.",
  "I got defensive when I should have just listened.",
  "Your smile is my favourite thing, and I took it away.",
  "I said things I didn't mean in the moment.",
  "Because you matter more than being right.",
];

export const DEFAULT_COUPONS: readonly SorryCoupon[] = [
  { title: "Momo date 🥟", line: "Your favourite place. I'm paying, no arguments." },
  { title: "Unlimited hugs 🤗", line: "Redeemable anytime, any mood, no expiry." },
  { title: "You pick the movie 🎬", line: "Even the 3-hour one. I won't fall asleep." },
  { title: "I listen, no phone 📵", line: "One whole evening, just you and me, talking." },
];

/**
 * English apology songs, one tap each in the form; the sender can still paste
 * any YouTube link. Official uploads — every id checked with YouTube oEmbed
 * and the embed player (playable off-site) on 2026-10-14. Audio only.
 */
export const SORRY_SONGS: readonly SongSuggestion[] = [
  { id: "fRh_vgS2dFE", title: "Sorry", artist: "Justin Bieber" },
  { id: "ZSM3w1v-A_Y", title: "Apologize", artist: "Timbaland ft. OneRepublic" },
  { id: "ekzHIouo8Q4", title: "When I Was Your Man", artist: "Bruno Mars" },
  { id: "1A0MPWseJIE", title: "Hard to Say I'm Sorry", artist: "Chicago" },
  { id: "c3nScN89Klo", title: "Sorry Seems to Be the Hardest Word", artist: "Elton John" },
  { id: "zABLecsR5UE", title: "Someone You Loved", artist: "Lewis Capaldi" },
  { id: "QUwxKWT6m7U", title: "Back to December", artist: "Taylor Swift" },
  { id: "ShZ978fBl6Y", title: "You Are the Reason", artist: "Calum Scott" },
  { id: "KtlgYxa6BMU", title: "The Night We Met", artist: "Lord Huron" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
];

/**
 * The page's own song (music mode "track"): the same English recording the
 * Apology template opens with, from our CDN, so it starts on her first tap
 * with no YouTube player to wait for. The YouTube songs above are the swaps.
 */
export const SORRY_TRACK = {
  url: "https://cdn.subhsandesh.in/gifts-media/assets/LoveGf/music/a-thousand-years.mp3",
  title: "A Thousand Years",
  artist: "Christina Perri",
  hint: "Christina Perri · plays first",
} as const;

const GIFS: GifSlot[] = [
  { id: "s1-gate", label: "Hello 🥺", moment: "Peeking out of the sorry envelope", file: "s1-gate.webp", emoji: "🥺", anim: "wiggle" },
  { id: "s2-sorry", label: "So sorry", moment: "Crying beside the guilt bubbles", file: "s2-sorry.webp", emoji: "😢", anim: "bounce" },
  { id: "s3-promise", label: "Pinky promise", moment: "Hugging over the pinky promise", file: "s3-promise.webp", emoji: "🤞", anim: "float" },
  { id: "s4-coupon", label: "Make it up", moment: "With flowers, beside the coupons", file: "s4-coupon.webp", emoji: "💐", anim: "float" },
  { id: "s5-yes", label: "Forgiven!", moment: "After they forgive you", file: "s5-yes.webp", emoji: "💗", anim: "bounce" },
];

export const sorryDay: DayConfig<SorryExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "I'm Sorry, Please Forgive Me",
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
    track: SORRY_TRACK,
    suggestions: SORRY_SONGS,
    suggestionsNote: "English sorry songs · tap one, or paste any YouTube link",
  },
  extras: [
    {
      key: "palette", kind: "enum", label: "Pick the look", display: "swatches", default: "babyPink",
      hint: "The whole page turns this colour — the background, the bear, the bubbles, the coupons.",
      options: SORRY_PALETTE_KEYS.map((k) => ({ value: k, label: SORRY_PALETTES[k].label, swatch: SORRY_PALETTES[k].swatch })),
    },
    {
      key: "tone", kind: "enum", label: "Who are you saying sorry to?", display: "cards", default: "partner",
      hint: "Changes the default question, the certificate and the reply they send back.",
      options: [
        { value: "partner", label: "My love", emoji: "💗", hint: "girlfriend, boyfriend, spouse" },
        { value: "crush", label: "My crush", emoji: "🙈", hint: "it's complicated" },
        { value: "bestie", label: "My bestie", emoji: "🫶", hint: "best friend" },
      ],
    },
    {
      key: "openingLine", kind: "text", max: 60, label: "On the envelope",
      placeholder: "a little line under their name",
      hint: "Printed under “Psst, <their name>…” on the very first screen.",
      suggestions: ["please open this before you stay mad 🥺", "a tiny bear has something to say", "I owe you the biggest sorry"],
    },
    {
      key: "moodLines", kind: "list", maxItems: 5, itemMax: 70, label: "How upset are they?",
      hint: "They slide from “a tiny bit upset” to “absolutely fuming” — the bear's face follows, and they see your line for that level. Leave any blank for a sweet default.",
      itemLabels: SORRY_MOODS.map((m) => `${m.emoji} ${m.label}`),
      itemPlaceholder: DEFAULT_MOOD_LINES,
    },
    {
      key: "confession", kind: "longtext", max: 160, rows: 3, label: "What I did (they scratch it off)",
      placeholder: "say exactly what you did — no “but”, no “if you felt”",
      hint: "Owning it is the part of an apology that matters most. Name the specific thing.",
      suggestions: ["I forgot our plans and didn't even call. That was careless of me.", "I raised my voice when you were just trying to tell me how you felt."],
    },
    {
      key: "reasons", kind: "list", maxItems: 5, itemMax: 70, label: "Guilt bubbles",
      hint: "They pop one bubble at a time — each holds one reason you're sorry.",
      itemLabels: ["Bubble 1", "Bubble 2", "Bubble 3", "Bubble 4", "Bubble 5"],
      itemPlaceholder: DEFAULT_REASONS,
    },
    {
      key: "promise", kind: "text", max: 120, label: "Your pinky promise",
      placeholder: "what you'll do differently from now on",
      hint: "They hold the pinky to seal it. Make it specific and keepable.",
      suggestions: ["I'll pause, breathe and listen before I react. Every time.", "No more cancelling on you last minute. Your time matters."],
    },
    {
      key: "coupons", kind: "objlist", maxItems: 4, itemTitle: "Coupon", addLabel: "+ add a coupon",
      label: "Make-it-up coupons",
      hint: "They tear off the one they want — you'll see which one they claimed in their reply.",
      item: [
        { key: "title", kind: "text", max: 28, label: "Coupon", placeholder: "Momo date 🥟" },
        { key: "line", kind: "text", max: 60, label: "The small print", placeholder: "Your favourite place. I'm paying." },
      ],
    },
    {
      key: "question", kind: "text", max: 60, label: "The big question",
      placeholder: "leave empty to use the one for who it's for",
      hint: "The No button gets shy and runs away when they reach for it.",
      suggestions: ["Will you forgive me? 🥺", "Maaf kar do na? 🥹", "Can I have my favourite person back? 💗"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "After they forgive you",
      placeholder: "what you'd say the second they say yes",
      suggestions: ["Best feeling ever. I owe you the biggest hug in the world 🤗"],
    },
    {
      key: "answerMode", kind: "enum", label: "How can they answer?", display: "cards", default: "yesOnly",
      hint: "Either way you'll see their answer on your page card and when you open your own link.",
      options: [
        { value: "yesOnly", label: "Only Yes", emoji: "💗", hint: "No keeps running away" },
        { value: "noAfterTries", label: "Yes, or “I need time”", emoji: "🤍", hint: "an honest way out after a few tries" },
      ],
    },
    {
      key: "noTries", kind: "enum", label: "“I need time” appears after", display: "chips", default: "4",
      hint: "No runs away this many times with cute lines, then turns into a gentle “I need a little time 🤍”.",
      showIf: { key: "answerMode", value: "noAfterTries" },
      options: [
        { value: "4", label: "4 tries" },
        { value: "5", label: "5 tries" },
      ],
    },
  ],
  theme: SORRY_PALETTES.babyPink.theme,
  demo: {
    recipientName: "Riya",
    senderName: "Aarav",
    petName: "Cutu",
    letter:
      "I've been sitting here for an hour trying to find the right words, and the only true ones are these: I'm sorry.\n\nI was careless with something that mattered to you, and when you tried to tell me, I got defensive instead of listening. You deserved patience, and I gave you excuses. That's on me, completely.\n\nI hate that I took your smile away, even for a day. You're the softest, funniest, most patient person I know, and you make every ordinary day feel like a good one. I don't want to be the reason it isn't.\n\nI'm not asking you to forget it. I'm asking for the chance to show you I've learnt from it.",
    photos: demoPhotos([
      ["our first chai date", "You laughed so hard at my joke that you spilled it. I knew right then."],
      ["the rainy day", "One umbrella, two people, both soaked anyway."],
      ["your birthday", "The face you made at the cake. I'd do anything to see it again."],
      ["us, always", "Still my favourite person. Even when I mess up."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...TRACK_DEMO,
    endLine: "No more fights we don't hug out. Promise 🤞",
    extras: {
      palette: "babyPink",
      tone: "partner",
      openingLine: "please open this before you stay mad 🥺",
      moodLines: [...DEFAULT_MOOD_LINES],
      confession: "I forgot our plans on Saturday and didn't even call. Then I got defensive instead of just saying sorry.",
      reasons: [...DEFAULT_REASONS],
      promise: "I'll pause, breathe and listen before I react. And I'll never forget our plans again.",
      coupons: DEFAULT_COUPONS.map((c) => ({ ...c })),
      question: "Will you forgive me? 🥺",
      yesLine: "Best feeling ever. I owe you the biggest hug in the world 🤗",
      answerMode: "yesOnly",
      noTries: "4",
    },
  },
  copy: {
    recipientPlaceholder: "who you're saying sorry to — e.g. Riya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — cutu, jaan, baby…",
    letterPlaceholder: "Your real apology: what happened, how you think it made them feel, and what you'll do differently. No “but”s.",
    letterHint: "Folded into a pastel envelope. They open it after the photos.",
    photosHint: "Your photos, as a little strip of polaroids they swipe through.",
    captionHint: "caption — e.g. our first chai date",
    noteHint: "what you remember about that moment…",
    endLinePlaceholder: "No more fights we don't hug out. Promise 🤞",
    endLineHint: "The last line, on their “Officially Forgiven” certificate.",
    sheetTitle: "Say sorry, the cute way 🥺",
    sheetSub: "Pick a colour, own it, add your reasons, a promise and a few coupons. Everything is pre-filled, so make it yours.",
    extrasTitle: "Your apology",
    extrasSub: "The colour, who it's for, what you did, the guilt bubbles, your promise, the coupons and the question",
    publishing: "Folding your apology…",
    storyTitle: "Let's say sorry properly 🥺",
    replyText: "Okay okay… I forgive you 💗 Now come here and give me that hug.",
    yesChip: "Forgave you 💗",
  },
  share: { title: "Someone is very sorry 🥺 Open this", accent: "#D9466E" },
};
