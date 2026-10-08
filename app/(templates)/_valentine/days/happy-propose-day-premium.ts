// happy-propose-day-premium — "Look Up" (the ✦ Premium twin of happy-propose-day).
//
// A private rooftop at night above a city. Their nervous texts arrive first (the "Reply" tap starts the song),
// they light a path of candles (one reason each), switch on the city's windows one memory at a time, and then
// "look up": a drone show draws their initials, a heart, a ring box that opens and the question on the
// chorus. Saying yes = sliding the ring onto their own finger. The drones re-form "{NAME} SAID YES".
//
// Extras keys + limits are mirrored in server/src/config/premiumDays/happy-propose-day-premium.ts and pinned in
// server/src/config/valentineDays.test.ts. Keys shared with the $2 day keep its key (question, reasons, moments,
// ringStyle, stoneColor, noLines, afterYes, shayari). The chorus second is the shared premium.songDropAt.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { premiumDay } from "./_premium";
import { demoPhotos } from "./_shared";
import { proposeDay } from "./happy-propose-day";

export interface ProposeExtrasPremium {
  texts: string[];
  reasons: string[];
  moments: { when: string; what: string }[];
  lookUpLine: string;
  initials: string;
  question: string;
  ringStyle: "solitaire" | "heart" | "band" | "halo";
  stoneColor: "diamond" | "ruby" | "sapphire" | "emerald" | "rosegold";
  handTone: "light" | "medium" | "tan" | "deep";
  noLines: string[];
  afterYes: string;
  shayari: string;
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "pp1-nervous", label: "Nervous", moment: "A sticker message in the opening chat", file: "pp1-nervous.gif", emoji: "😳", anim: "wiggle" },
  { id: "pp2-candles", label: "Candles", moment: "When the last candle is lit", file: "pp2-candles.gif", emoji: "🕯️", anim: "float" },
  { id: "pp3-lookup", label: "Look up", moment: "Under the sky, after the drone show", file: "pp3-lookup.gif", emoji: "🤩", anim: "bounce" },
  { id: "pp4-please", label: "Please?", moment: "After three dodges of “Let me think”", file: "pp4-please.gif", emoji: "🥺", anim: "pulse" },
  { id: "pp5-yes", label: "YES", moment: "When the sky says they said yes", file: "pp5-yes.gif", emoji: "💍", anim: "bounce" },
  { id: "pp6-ticket", label: "Ticket", moment: "On the front-row ticket keepsake", file: "pp6-ticket.gif", emoji: "🎟️", anim: "wiggle" },
];

/** Official uploads, checked against YouTube's oEmbed on 2026-10-08. */
export const SKY_SONGS: readonly SongSuggestion[] = [
  { id: "dElRVQFqj-k", title: "Marry You", artist: "Bruno Mars" },
  { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran" },
  { id: "MofpuI_Vg_U", title: "Pehli Nazar Mein", artist: "Atif Aslam · Race" },
  { id: "SAcpESN_Fk4", title: "Dil Diyan Gallan", artist: "Atif Aslam · Tiger Zinda Hai" },
  { id: "cs1e0fRyI18", title: "Hawayein", artist: "Arijit Singh · Jab Harry Met Sejal" },
  { id: "_P9YXESg5Es", title: "Kaise Hua", artist: "Vishal Mishra · Kabir Singh" },
  { id: "ShZ978fBl6Y", title: "You Are The Reason", artist: "Calum Scott" },
  { id: "O1-4u9W-bns", title: "I Won't Give Up", artist: "Jason Mraz" },
];

const base = premiumDay<ProposeExtrasPremium>(proposeDay, {
  slug: "happy-propose-day-premium",
  title: "Look Up",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "I practised this in the mirror. The mirror said yes, so…",
    psLetter:
      "Open only if you said yes.\n\nI had a backup plan if it rained: the same question, under the building's tiny staircase light. You'd have said yes there too. I know, because you said yes to my umbrella first.",
  },
  copy: {
    recipientPlaceholder: "who you're asking — e.g. Tara",
    letterPlaceholder: "Your speech for the rooftop. Where you'd do this in real life, what you're nervous about, and why it's them…",
    letterHint: "Unfolds on candlelit paper after they say yes, one paragraph at a time.",
    photosHint: "Each photo hides behind a dark window in the city. They switch the windows on, one memory at a time.",
    captionHint: "the moment, e.g. one umbrella, two people",
    endLinePlaceholder: "Best yes of my life 💍",
    endLineHint: "Printed on the front-row ticket at the end.",
    sheetTitle: "Plan the rooftop 💍",
    sheetSub: "Your nervous texts, the candles, a city of memories and a sky that asks the question. Everything is pre-filled — make it sound like you.",
    extrasTitle: "The rooftop",
    extrasSub: "Texts, candles, windows, the sky and the ring",
    publishing: "Launching the drones…",
    storyTitle: "Let's plan your rooftop proposal 💍",
    replyText: "YES. A thousand times yes 💍 The sky was a bit much. I loved it.",
    yesChip: "Said YES 💍",
  },
  share: { title: "Go somewhere you can see the sky. Sound on 💍", accent: "#FFD27A" },
});

export const proposeDayPremium: DayConfig<ProposeExtrasPremium> = {
  ...base,
  music: { audioOnly: true, suggestions: SKY_SONGS, suggestionsNote: "proposal favourites · tap to use" },
  theme: {
    bg: "linear-gradient(180deg, #0B1026 0%, #141A44 55%, #1C1F4A 100%)",
    base: "#0B1026",
    paper: "#FFF7EA",
    glass: "rgba(244,248,255,0.08)",
    ink: "#F4F8FF",
    inkSoft: "#C9D0F0",
    paperInk: "#2A2140",
    accent: "#FFD27A",
    accentDeep: "#C9963A",
    accentInk: "#0B1026",
    soft: "#2A2F66",
    edge: "rgba(244,248,255,0.2)",
    gold: "#FFB45C",
    dark: true,
    particles: ["✨", "💍", "🕯️", "⭐"],
    confetti: ["#FFD27A", "#FF5C8A", "#F4F8FF", "#FFB45C", "#9FB4FF"],
  },
  extras: [
    {
      key: "texts", kind: "list", maxItems: 3, minItems: 1, itemMax: 70, label: "Your nervous texts (they arrive first)",
      hint: "They pop in like real messages before anything else. Their “Reply” tap starts your song.",
      itemPlaceholder: ["Hey. Are you free right now?", "Okay don't laugh. I planned something.", "Come up to the rooftop. Bring nothing. Just you."],
      addLabel: "+ add a text",
    },
    {
      key: "reasons", kind: "list", maxItems: 5, minItems: 3, itemMax: 80, label: "A reason for each candle",
      hint: "They light one candle per reason. Three to five.",
      itemPlaceholder: ["a habit of theirs you secretly love", "something they always remember about you", "the calm they bring", "a tiny everyday thing", "why the future looks like them"],
      addLabel: "+ add a candle",
    },
    {
      key: "moments", kind: "objlist", maxItems: 6, label: "The city of memories", itemTitle: "Window", addLabel: "+ add a window",
      hint: "Each one is a lit window in the skyline, paired with your photos in order.",
      item: [
        { key: "when", kind: "text", max: 20, label: "When", placeholder: "Jun 2023 · that monsoon" },
        { key: "what", kind: "text", max: 50, label: "What happened", placeholder: "one umbrella, two people ☔" },
      ],
    },
    { key: "lookUpLine", kind: "text", max: 50, label: "The line before the sky lights up", placeholder: "Now… look up.", suggestions: ["Now… look up.", "Okay. Look up.", "Close your eyes. Now look up."] },
    { key: "initials", kind: "text", max: 9, label: "Initials the drones draw", placeholder: "T ♥ K", hint: "Theirs first. Leave empty and we'll use your first letters." },
    {
      key: "question", kind: "text", max: 60, min: 6, label: "The question in the sky", placeholder: "the exact words you'd say on one knee",
      hint: "Written by hundreds of drones, on your song's chorus. Short questions look best.",
      suggestions: ["Will you marry me?", "Will you be mine, forever?", "Will you choose me again, every day?"],
    },
    {
      key: "ringStyle", kind: "enum", label: "Ring style", display: "cards", default: "solitaire",
      options: [
        { value: "solitaire", label: "Solitaire", emoji: "💎" },
        { value: "halo", label: "Halo", emoji: "✨" },
        { value: "heart", label: "Heart cut", emoji: "❤️" },
        { value: "band", label: "Simple band", emoji: "💍" },
      ],
    },
    {
      key: "stoneColor", kind: "enum", label: "Stone", display: "swatches", default: "diamond",
      options: [
        { value: "diamond", label: "Diamond", swatch: "#E8F4FF" },
        { value: "ruby", label: "Ruby", swatch: "#C8102E" },
        { value: "sapphire", label: "Sapphire", swatch: "#1F4FBF" },
        { value: "emerald", label: "Emerald", swatch: "#0E8A5F" },
        { value: "rosegold", label: "Rose gold", swatch: "#E8A598" },
      ],
    },
    {
      key: "handTone", kind: "enum", label: "Their hand (for “put it on”)", display: "swatches", default: "medium",
      options: [
        { value: "light", label: "Light", swatch: "#F3D2BC" },
        { value: "medium", label: "Medium", swatch: "#D9A27C" },
        { value: "tan", label: "Tan", swatch: "#B07A52" },
        { value: "deep", label: "Deep", swatch: "#6E4630" },
      ],
    },
    { key: "noLines", kind: "list", maxItems: 5, itemMax: 28, label: "What “Let me think 🙈” says as it runs", itemPlaceholder: "Thinking is overrated", addLabel: "+ add a line" },
    { key: "afterYes", kind: "text", max: 120, label: "Your text after they say yes", placeholder: "the first thing you'd text — e.g. okay I'm crying 😭💍" },
    { key: "shayari", kind: "longtext", max: 160, rows: 2, label: "A couplet for the letter (optional)", placeholder: "two lines at the end of your letter — add the poet if it's a famous sher" },
  ],
  demo: {
    ...base.demo,
    recipientName: "Tara",
    senderName: "Kabir",
    petName: "Taru",
    letter:
      "Tara,\n\nI've written this a hundred times in my head — on the metro, in meetings, at 2 am. Every version started differently, but every single one ended the same way: with you.\n\nYou turned my \"I'm fine\" into \"I'm actually happy\". You've seen my worst moods and stayed for my best jokes. You make an ordinary Tuesday feel like a festival.\n\nI couldn't give you a stadium, so I borrowed a sky. It doesn't matter where we live or what comes next. I just know I want to come home to you, every single day.",
    photos: demoPhotos([
      ["where it started", "You laughed at my worst joke. I decided right there."],
      ["one umbrella, two people", "You stole my umbrella. Then my heart. In that order."],
      ["our first Goa sunset", "You said the sky was showing off. It was showing off for you."],
      ["today", "And every day after this one, if you'll have me."],
    ]),
    endLine: "Best yes of my life. No return policy 💍",
    extras: {
      texts: ["Hey. Are you free right now?", "Okay don't laugh. I planned something.", "Come up to the rooftop. Bring nothing. Just you."],
      reasons: ["You make Monday feel like Friday.", "You remember how I take my chai.", "You laugh at my jokes before the punchline.", "You're my calm in every storm.", "My future just looks like you."],
      moments: [
        { when: "Mar 2023", what: "Riya's party. You stole the aux." },
        { when: "Jun 2023", what: "One umbrella, two people ☔" },
        { when: "Dec 2023", what: "Our first Goa sunset" },
        { when: "Tonight", what: "One rooftop, one question" },
      ],
      lookUpLine: "Now… look up.",
      initials: "T ♥ K",
      question: "Will you marry me, Tara?",
      ringStyle: "solitaire",
      stoneColor: "diamond",
      handTone: "medium",
      noLines: ["Thinking is overrated", "Arre, pakka?", "The drones are watching 👀", "Ring's already out!"],
      afterYes: "Okay I'm crying. No return policy now 💍",
      shayari: "",
    },
  },
};
