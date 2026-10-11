// ─── Be My Dandiya Partner — a Navratri Dandiya-night invitation ─────────────
//
// An occasion on the Valentine engine (like Happy Halloween), all copy English.
// Server twin: server/src/config/valentineDays.ts ("dandiya-partner"); keys and
// limits must match (valentineDays.test.ts pins them).
//
// The flow (app/(templates)/dandiya-partner/components): an embroidered
// invitation they open by clashing the sticks → nine diyas for the nine nights
// → a dhol-beat dandiya game → pick your twirl colour → the garba circle of
// photos → a note tucked in the dupatta → the invitation ticket (date, time,
// venue, dress code, add to calendar) → "Will you be my Dandiya partner?" with a
// No that drops its sticks → the Dandiya Pass.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { MUSIC_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "dandiya-partner" as const;

export type DandiyaTone = "romantic" | "crush" | "friends";
export type DandiyaColor = "marigold" | "kumkum" | "peacock" | "emerald" | "rani" | "jamuni";

export interface DandiyaExtras {
  tone: DandiyaTone;
  openingLine: string;
  nightLines: string[];
  myColor: DandiyaColor;
  lookLine: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  dressCode: string;
  question: string;
  yesLine: string;
  /** "yesOnly" — No dodges forever · "noAfterTries" — No can be pressed after `noTries` dodges. */
  answerMode: "yesOnly" | "noAfterTries";
  noTries: "4" | "5";
  [k: string]: unknown;
}

/**
 * What "who it's for" changes when the sender leaves a field empty: the
 * question, the YES button, the pass title, the dodging No's lines and the
 * WhatsApp reply.
 */
export const DANDIYA_TONES: Record<
  DandiyaTone,
  { question: string; yes: string; pass: string; reply: string; noLines: readonly string[] }
> = {
  romantic: {
    question: "Will you be my Dandiya partner? 💛",
    yes: "Yes, let's dance 💃",
    pass: "Official Dandiya Partner",
    reply: "YES! I'm your Dandiya partner 💛 Save me every single song.",
    noLines: ["oops, my sticks slipped", "wrong step, try again", "the dhol says YES", "nope, not in this circle", "*twirls away*"],
  },
  crush: {
    question: "Be my Dandiya partner this Navratri? 🙈",
    yes: "Okay… yes! 🙈",
    pass: "Dandiya Partner, first round",
    reply: "Okay okay, YES 🙈 I'll be your Dandiya partner. Don't step on my toes.",
    noLines: ["are you sure?", "my sticks slipped", "the dhol heard that", "try the yellow one", "*spins away shyly*"],
  },
  friends: {
    question: "Will you be my garba buddy, all nine nights? 👯",
    yes: "Obviously, bestie 👯",
    pass: "Certified Garba Buddy",
    reply: "Obviously YES 👯 Garba buddies all nine nights. You're doing my dupatta.",
    noLines: ["bestie, no?", "sticks slipped", "the circle disagrees", "nice try, buddy", "*twirls off*"],
  },
};

/** The twirl colours (the sender's own outfit, and the recipient's pick). */
export const DANDIYA_COLORS: Record<DandiyaColor, { label: string; base: string; deep: string; light: string }> = {
  marigold: { label: "Marigold", base: "#FFB627", deep: "#D17A00", light: "#FFE08A" },
  kumkum: { label: "Kumkum red", base: "#D7263D", deep: "#8E1022", light: "#FF8A97" },
  peacock: { label: "Peacock blue", base: "#1590B8", deep: "#0A5872", light: "#7FD8F2" },
  emerald: { label: "Emerald", base: "#14A673", deep: "#0A6A48", light: "#86E6C0" },
  rani: { label: "Rani pink", base: "#E5489B", deep: "#9E1E63", light: "#FFA8D3" },
  jamuni: { label: "Jamuni purple", base: "#7B4FD6", deep: "#4A2A93", light: "#C4AEFF" },
};

/** The nine nights' default lines (a diya lights for each). */
export const DEFAULT_NIGHT_LINES: readonly string[] = [
  "You, laughing at my terrible jokes anyway.",
  "The way you say my name when you're sleepy.",
  "Our 2 a.m. chai and gossip sessions.",
  "You dancing in the kitchen when you think no one's looking.",
  "How you hold my hand in every crowd.",
  "Every song that reminds me of you.",
  "Your terrible, perfect playlist.",
  "The way the whole room gets brighter.",
  "All of it. I'd pick you every night.",
];

/**
 * One-tap garba and dandiya songs. Official uploads (label channels), every id
 * checked against YouTube's oEmbed on 2026-10-11. Audio only: the video never
 * shows (music.audioOnly below).
 */
export const DANDIYA_SONGS: readonly SongSuggestion[] = [
  { id: "yr7JFNsz5dU", title: "Chogada", artist: "Darshan Raval · Loveyatri" },
  { id: "3X7x4Ye-tqo", title: "Nagada Sang Dhol", artist: "Shreya Ghoshal · Ram-Leela" },
  { id: "Gx_Rqsq1DIw", title: "Shubhaarambh", artist: "Amit Trivedi · Kai Po Che" },
  { id: "Jh_VKJAEnUY", title: "Dholida", artist: "Gangubai Kathiawadi" },
  { id: "gE3XkDXpB74", title: "Udi Udi Jaye", artist: "Sukhwinder Singh · Raees" },
  { id: "i0_m90T04uw", title: "Kamariya", artist: "Darshan Raval · Mitron" },
  { id: "fqP5pTPvqZ8", title: "Rangtaari", artist: "Yo Yo Honey Singh · Loveyatri" },
  { id: "13cHnQ1Suj8", title: "Radhe Radhe", artist: "Meet Bros · Dream Girl" },
];

const F = (f: string) => `../_festive/${f}`;
const GIFS: GifSlot[] = [
  { id: "d1-gate", label: "Hello", moment: "Peeking from behind the invitation", file: F("bubudubu-dandiya-playing.webp"), emoji: "🐼", anim: "wiggle" },
  { id: "d2-beat", label: "Clash buddy", moment: "Hops beside the dandiya clash game", file: F("bubudubu-dandiya-playing.webp"), emoji: "🐼", anim: "bounce" },
  { id: "d3-garba", label: "Garba pair", moment: "Dancing in the middle of the garba circle", file: F("dandiyapartyner.webp"), emoji: "💃", anim: "float" },
  { id: "d4-invite", label: "Invitation", moment: "On the invitation ticket", file: F("dandiyapartyner.webp"), emoji: "🪔", anim: "float" },
  { id: "d5-yes", label: "We said YES", moment: "After they say YES", file: F("bubudubu-dandiya-playing.webp"), emoji: "💛", anim: "bounce" },
];

export const dandiyaDay: DayConfig<DandiyaExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Be My Dandiya Partner",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 30,
  asksQuestion: true,
  melody: "garba",
  photoAspect: 1,
  gifSlots: GIFS,
  // Editor controls top-right (PremiumTopBar), like Halloween.
  topBar: true,
  // The recipient page: the SubhSandesh logo with the word under it, top-right.
  brandMark: "stacked",
  music: {
    audioOnly: true,
    // One 40px play/stop icon bottom-left, beside the Next pill.
    compact: true,
    suggestions: DANDIYA_SONGS,
    suggestionsNote: "garba & dandiya favourites · tap to use",
  },
  extras: [
    {
      key: "tone", kind: "enum", label: "Who are you inviting?", display: "cards", default: "romantic",
      hint: "Changes the default question, the pass and the reply they send back.",
      options: [
        { value: "romantic", label: "My love", emoji: "💛", hint: "partner or spouse" },
        { value: "crush", label: "My crush", emoji: "🙈", hint: "time to ask" },
        { value: "friends", label: "My bestie", emoji: "👯", hint: "garba buddy" },
      ],
    },
    {
      key: "openingLine", kind: "text", max: 60, label: "On the envelope",
      placeholder: "a teaser under their name — the dhol is calling…",
      hint: "Printed under “Psst, <their name>…” on the very first screen.",
      suggestions: ["the dhol is calling 🥁", "nine nights, one question", "someone saved you a spot in the circle"],
    },
    {
      key: "nightLines", kind: "list", maxItems: 9, itemMax: 70, label: "Nine nights, nine diyas",
      hint: "Each diya they light shows one line. Leave any blank and we'll use a sweet default.",
      itemLabels: ["Night 1", "Night 2", "Night 3", "Night 4", "Night 5", "Night 6", "Night 7", "Night 8", "Night 9"],
      itemPlaceholder: DEFAULT_NIGHT_LINES,
    },
    {
      key: "myColor", kind: "enum", label: "The colour you'll wear", display: "swatches", default: "peacock",
      hint: "They pick their twirl colour, then see yours beside it.",
      options: (Object.keys(DANDIYA_COLORS) as DandiyaColor[]).map((k) => ({ value: k, label: DANDIYA_COLORS[k].label, swatch: DANDIYA_COLORS[k].base })),
    },
    {
      key: "lookLine", kind: "text", max: 70, label: "After they pick a colour",
      placeholder: "what you'd say when you see their pick",
      suggestions: ["We're going to be the brightest pair in the circle.", "Matching or not, everyone will be looking at you."],
    },
    { key: "eventDate", kind: "text", max: 10, input: "date", label: "Date of the night", hint: "Shown on the invitation and the pass. Leave empty for “any night you like”." },
    {
      key: "eventTime", kind: "text", max: 24, label: "Time",
      placeholder: "8:00 PM onwards",
      suggestions: ["8:00 PM onwards", "9 PM till the last aarti"],
    },
    {
      key: "venue", kind: "text", max: 60, label: "Venue",
      placeholder: "the society ground, the club, the garba pandal…",
      hint: "Where the garba is. Keep it short — it sits on a ticket.",
    },
    {
      key: "dressCode", kind: "text", max: 50, label: "Dress code",
      placeholder: "traditional, mirror-work welcome",
      suggestions: ["Traditional · mirror-work welcome", "Chaniya choli & kediyu", "Anything that twirls"],
    },
    {
      key: "question", kind: "text", max: 60, label: "The big question",
      placeholder: "leave empty to use the one for who you're inviting",
      hint: "The No button drops its sticks and twirls away when they reach for it.",
      suggestions: ["Will you be my Dandiya partner? 💛", "Be my Dandiya partner this Navratri? 🙈", "Will you be my garba buddy, all nine nights? 👯"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "After they say YES",
      placeholder: "what you'd say back the second they say yes",
      suggestions: ["Then it's a date. Every song, every round, every night."],
    },
    {
      key: "answerMode", kind: "enum", label: "How can they answer?", display: "cards", default: "yesOnly",
      hint: "Either way you'll see their answer on your page card and when you open your own link.",
      options: [
        { value: "yesOnly", label: "Only Yes", emoji: "💛", hint: "No keeps running away" },
        { value: "noAfterTries", label: "Yes or No", emoji: "🤞", hint: "No unlocks after a few tries" },
      ],
    },
    {
      key: "noTries", kind: "enum", label: "No unlocks after", display: "chips", default: "4",
      hint: "No dodges this many times with cute lines, then they can really pick it (we ask “Are you sure?” first).",
      showIf: { key: "answerMode", value: "noAfterTries" },
      options: [
        { value: "4", label: "4 tries" },
        { value: "5", label: "5 tries" },
      ],
    },
  ],
  theme: {
    bg: "radial-gradient(130% 80% at 50% 0%, #B3121B 0%, #7A0F12 46%, #3E0609 100%)",
    base: "#4A080C",
    paper: "#FFF4DE",
    glass: "rgba(255,244,222,0.08)",
    ink: "#FFF7E8",
    inkSoft: "#FFD9C2",
    paperInk: "#3B0F1E",
    accent: "#FFB627",
    accentDeep: "#B8650A",
    accentInk: "#2A1203",
    soft: "#FFE7B8",
    edge: "#F2D9A6",
    gold: "#F6D27A",
    dark: true,
    particles: ["✨", "🪔", "🌼", "💛"],
    confetti: ["#FFB627", "#D7263D", "#1FA2C4", "#14B37D", "#E5489B", "#F6D27A"],
  },
  demo: {
    recipientName: "Meera",
    senderName: "Arjun",
    petName: "Sunshine",
    letter:
      "Every year I watch you light up the garba circle like you were born inside a dhol beat, and every year I tell myself: this is the year I ask properly.\n\nSo here it is. I want the first round and the last round. I want to lose the beat with you, laugh about it, and find it again. I want to be the one who holds your dupatta when it slips and your chai when the aarti starts.\n\nNine nights, a thousand twirls, and one partner. I'd really like it to be you.",
    photos: demoPhotos([
      ["first garba together", "You taught me the three-clap step. I still get it wrong on purpose."],
      ["the twirl", "Your dupatta hit me in the face. Best moment of the night."],
      ["chai after aarti", "Kulhad chai at 1 a.m., your head on my shoulder."],
      ["us, every Navratri", "Nine nights a year will never be enough."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...MUSIC_DEMO,
    endLine: "Save every song for me this Navratri 💛",
    extras: {
      tone: "romantic",
      openingLine: "the dhol is calling 🥁",
      nightLines: [...DEFAULT_NIGHT_LINES],
      myColor: "peacock",
      lookLine: "We're going to be the brightest pair in the circle.",
      eventDate: "2026-10-17",
      eventTime: "8:00 PM onwards",
      venue: "Society ground, under the big lights",
      dressCode: "Traditional · mirror-work welcome",
      question: "Will you be my Dandiya partner? 💛",
      yesLine: "Then it's a date. Every song, every round, every night.",
      answerMode: "yesOnly",
      noTries: "4",
    },
  },
  copy: {
    recipientPlaceholder: "who you're inviting — e.g. Meera",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — sunshine, jaan…",
    letterPlaceholder: "Tucked into the dupatta: why you want them as your partner, a Navratri memory, the step you always get wrong together…",
    letterHint: "Folded into a bandhani dupatta. They read it just before the invitation.",
    photosHint: "Your photos dance around the garba circle, in mirror-work frames.",
    captionHint: "caption — e.g. first garba together",
    noteHint: "what you remember about that night…",
    endLinePlaceholder: "Save every song for me this Navratri 💛",
    endLineHint: "The last line, on their Dandiya Pass.",
    sheetTitle: "Invite your Dandiya partner 🪔",
    sheetSub: "Nine lines, the night's details and the big question. Everything is pre-filled, so make it yours.",
    extrasTitle: "The Dandiya night",
    extrasSub: "Who you're inviting, the nine diyas, your colour, the date, venue and the big question",
    publishing: "Lighting the diyas…",
    storyTitle: "Let's invite your Dandiya partner 🪔",
    replyText: "YES! I'm your Dandiya partner 💛 Save me every single song.",
    yesChip: "Said YES 💛",
  },
  share: { title: "You've been invited to a Dandiya night 🪔", accent: "#B8650A" },
};
