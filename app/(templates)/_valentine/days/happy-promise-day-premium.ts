// happy-promise-day-premium — "The Red Thread" (the ✦ Premium twin of happy-promise-day).
//
// The red thread of fate: an invisible cord tied to the little finger. They
// pull it hand over hand through your photos until the other end arrives —
// tied to your finger. The pinkies hook, the knot cinches on the song's drop,
// the thread turns gold and writes "I promise". Then: thread the rings (each
// ring a promise), the vow stitched in with a thumbprint seal, a promise for
// later sealed in a vial, the distance between you, and "Do you promise too?".
//
// Keys + limits mirror server/src/config/premiumDays/happy-promise-day-premium.ts
// (pinned in valentineDays.test.ts). AI fill: server/src/config/aiFill/happy-promise-day-premium.ts.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { premiumDay } from "./_premium";
import { promiseDay } from "./happy-promise-day";

export interface PromiseExtrasPremium {
  gateLine: string;
  sharedSince: string;
  promises: string[];
  bigPromise: string;
  futurePromise: string;
  futureDate: string;
  distanceKm: number;
  threadColor: "red" | "gold" | "rose";
  replyLine: string;
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "pp1-gate", label: "Gate", moment: "Peeking at the bottom of the opening", file: "pp1-gate.gif", emoji: "🤞", anim: "wiggle" },
  { id: "pp2-pull", label: "Pull", moment: "Beside the hand while they pull", file: "pp2-pull.gif", emoji: "🧶", anim: "bounce" },
  { id: "pp3-knot", label: "Knot", moment: "After “I promise” writes itself", file: "pp3-knot.gif", emoji: "🫶", anim: "pulse" },
  { id: "pp4-rings", label: "Rings", moment: "When every ring is threaded", file: "pp4-rings.gif", emoji: "💫", anim: "float" },
  { id: "pp5-vial", label: "Vial", moment: "By the vial on the river", file: "pp5-vial.gif", emoji: "🍾", anim: "float" },
  { id: "pp6-promised", label: "Promised", moment: "After “Do you promise too?”", file: "pp6-promised.gif", emoji: "💞", anim: "pulse" },
];

/** Vow-worthy picks — official uploads, checked against YouTube oEmbed 2026-10-08. */
const SONGS: readonly SongSuggestion[] = [
  { id: "GxldQ9eX2wo", title: "Until I Found You", artist: "Stephen Sanchez" },
  { id: "sK7riqg2mr4", title: "Agar Tum Saath Ho", artist: "Arijit Singh · Tamasha" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal · Shershaah" },
  { id: "0put0_a--Ng", title: "Make You Feel My Love", artist: "Adele" },
  { id: "Cb6wuzOurPc", title: "Tum Se Hi", artist: "Mohit Chauhan · Jab We Met" },
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "vGJTaP6anOU", title: "Can't Help Falling in Love", artist: "Elvis Presley" },
];

const base = premiumDay<PromiseExtrasPremium>(promiseDay, {
  slug: "happy-promise-day-premium",
  title: "The Red Thread",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "However far apart we are, the thread doesn't break. I checked.",
    psLetter: "Open only if you're ever unsure.\n\nI meant every single one. Even the one about the last slice of pizza.",
  },
  copy: {
    letterPlaceholder: "Your vow, in your own words — what you promise them, and why you're sure…",
    letterHint: "Stitched into the page paragraph by paragraph with red thread; they seal it with their thumbprint.",
    photosHint: "Your photos ride the red thread on little pegs while they pull it towards you.",
    captionHint: "a tiny label on the peg — e.g. the first trip",
    endLinePlaceholder: "Bound by a red thread. Both ends tied.",
    endLineHint: "On the keepsake and the last screen.",
    sheetTitle: "Tie the red thread 🧵",
    sheetSub: "They pull it through your memories to your hand, then promise back. Everything is pre-filled — make it yours.",
    extrasTitle: "The thread",
    extrasSub: "The opening line, the promises on the rings, the promise for later",
    publishing: "Tying the thread…",
    storyTitle: "Let's tie your red thread 🧵",
    replyText: "I promise too. Both ends tied 🤞❤️",
    yesChip: "Promised too 🤞",
  },
  share: { title: "Someone tied a red thread to your finger 🧵", accent: "#D7263D" },
});

export const promiseDayPremium: DayConfig<PromiseExtrasPremium> = {
  ...base,
  melody: "velvet",
  photoAspect: 4 / 5,
  theme: {
    bg: "radial-gradient(120% 90% at 50% 0%, #22265A 0%, #0E1030 60%, #070818 100%)",
    base: "#0E1030",
    paper: "#F7F1E8",
    glass: "rgba(247,241,232,0.08)",
    ink: "#F7F1E8",
    inkSoft: "#C9CDEB",
    paperInk: "#2A1A1F",
    accent: "#D7263D",
    accentDeep: "#9E1B2C",
    accentInk: "#FFFFFF",
    soft: "#F9D9DE",
    edge: "rgba(247,241,232,0.18)",
    gold: "#F2C14E",
    dark: true,
    particles: ["🧵", "✨", "🤞"],
    confetti: ["#F2C14E", "#D7263D", "#9DB4FF", "#F7F1E8"],
  },
  music: { audioOnly: true, suggestions: SONGS, suggestionsNote: "vow-worthy · tap to use" },
  extras: [
    {
      key: "gateLine", kind: "text", max: 70, label: "Opening line",
      placeholder: "the first thing they read — e.g. There's a thread tied to your little finger. Follow it.",
      suggestions: ["There's a thread tied to your little finger. Follow it.", "Pull gently. I'm on the other end."],
    },
    { key: "sharedSince", kind: "text", max: 24, label: "Together since (shown while they pull)", placeholder: "e.g. March 2022" },
    {
      key: "promises", kind: "list", maxItems: 6, minItems: 3, itemMax: 90, label: "Promises (one per gold ring)",
      hint: "They thread a gold ring for each one. Small, real, keepable promises land best.",
      itemPlaceholder: ["I'll always pick up, even at 2 a.m.", "a habit you'll keep for them", "how you'll end every fight", "the small daily thing", "the big-picture one", "one more"],
      addLabel: "+ add a promise",
    },
    {
      key: "bigPromise", kind: "longtext", max: 160, rows: 2, label: "The promise under “I promise”",
      hint: "Appears beneath the gold “I promise” at the big moment.",
      placeholder: "the one promise that matters most",
    },
    {
      key: "futurePromise", kind: "longtext", max: 200, rows: 3, label: "A promise for later (sealed in a vial)",
      hint: "Sealed until the date below. They get a calendar reminder; on the day, the vial opens.",
      placeholder: "something you'll have done together by then — e.g. we'll have watched the sunrise in Ladakh",
    },
    { key: "futureDate", kind: "text", input: "date", max: 10, label: "When the vial opens", placeholder: "YYYY-MM-DD" },
    { key: "distanceKm", kind: "number", min: 0, max: 20000, default: 0, unit: "km", label: "Distance between you", hint: "Shown as “1,240 km of thread · 0 km apart”. 0 hides it." },
    {
      key: "threadColor", kind: "enum", label: "Thread colour", display: "swatches", default: "red",
      options: [
        { value: "red", label: "Red", swatch: "#D7263D" },
        { value: "gold", label: "Gold", swatch: "#F2C14E" },
        { value: "rose", label: "Rose", swatch: "#E86A92" },
      ],
    },
    { key: "replyLine", kind: "text", max: 80, label: "Their WhatsApp reply", placeholder: "what they send back — e.g. I promise too. Both ends tied 🤞❤️" },
  ],
  demo: {
    ...base.demo,
    endLine: "Bound by a red thread. Both ends tied.",
    extras: {
      gateLine: "There's a thread tied to your little finger. Follow it.",
      sharedSince: "March 2022",
      promises: [
        "I'll always pick up, even at 2 a.m.",
        "I'll learn your coffee order by heart.",
        "I'll never let a fight outlast the night.",
        "I'll cheer loudest at every win.",
        "I'll keep choosing you.",
      ],
      bigPromise: "Wherever life pulls us, I'll be on the other end of this thread.",
      futurePromise: "By the time you open this, we'll have watched the sunrise in Ladakh. I promised. Check.",
      futureDate: "2028-02-11",
      distanceKm: 1240,
      threadColor: "red",
      replyLine: "I promise too. Both ends tied 🤞❤️",
    },
  },
};
