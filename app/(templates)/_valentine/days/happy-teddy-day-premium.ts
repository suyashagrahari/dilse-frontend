// happy-teddy-day-premium — "Made With a Heart" (the ✦ Premium twin of happy-teddy-day).
//
// A parcel on the doorstep: an unfinished teddy. In a toy workshop after hours
// they crank the stuffing machine, warm the sender's fabric heart in their hands,
// touch it to their cheek, hold it to their ear (it whispers), kiss it, sew it
// in — and the teddy wakes up (the song drops). Lights out: a torchlight letter
// in a blanket fort, memories on a star-projector ceiling, hide-and-seek under
// the pillows, and a tuck-in.
//
// Keys + limits mirror server/src/config/premiumDays/happy-teddy-day-premium.ts
// (pinned in valentineDays.test.ts). AI fill: server/src/config/aiFill/happy-teddy-day-premium.ts.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { premiumDay } from "./_premium";
import { teddyDay } from "./happy-teddy-day";

export type TeddyFur = "honey" | "cocoa" | "pink" | "white" | "lilac" | "mint";
export type TeddyEyes = "button" | "sparkle" | "sleepy" | "heart";
export type TeddyAccessory = "none" | "bow" | "scarf" | "bowtie" | "flower" | "sweater" | "glasses";

export interface TeddyExtrasPremium {
  teddyName: string;
  furColor: TeddyFur;
  eyeStyle: TeddyEyes;
  pawInitial: string;
  accessory: TeddyAccessory;
  parcelNote: string;
  heartWhisper: string;
  firstWords: string;
  squeezeLines: string[];
  bedtimeLine: string;
  sleepOver: "snow" | "rain" | "stars";
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "pt1-parcel", label: "Parcel", moment: "The unfinished teddy on the workbench", file: "pt1-parcel.gif", emoji: "📦", anim: "wiggle" },
  { id: "pt2-heart", label: "Heart", moment: "After the kiss on the heart", file: "pt2-heart.gif", emoji: "❤️", anim: "bounce" },
  { id: "pt3-alive", label: "Alive", moment: "The teddy wakes up (beside the speech bubble)", file: "pt3-alive.gif", emoji: "🧸", anim: "wiggle" },
  { id: "pt4-letter", label: "Letter", moment: "End of the torchlight letter", file: "pt4-letter.gif", emoji: "🔦", anim: "float" },
  { id: "pt5-found", label: "Found", moment: "Hide-and-seek, the last round found", file: "pt5-found.gif", emoji: "🙈", anim: "bounce" },
  { id: "pt6-sleep", label: "Sleep", moment: "Tucked in, the ending", file: "pt6-sleep.gif", emoji: "😴", anim: "pulse" },
];

/** Soft, happy, bedtime-cosy picks — official uploads, checked against YouTube oEmbed 2026-10-08. */
const SONGS: readonly SongSuggestion[] = [
  { id: "EkHTsc9PU2A", title: "I'm Yours", artist: "Jason Mraz" },
  { id: "acvIVA9-FMQ", title: "Lucky", artist: "Jason Mraz ft. Colbie Caillat" },
  { id: "kVpv8-5XWOI", title: "Hey, Soul Sister", artist: "Train" },
  { id: "uJ_1HMAGb4k", title: "Riptide", artist: "Vance Joy" },
  { id: "ZbZSe6N_BXs", title: "Happy", artist: "Pharrell Williams" },
  { id: "fLexgOxsZu0", title: "The Lazy Song", artist: "Bruno Mars" },
  { id: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh · Bhediya" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];

const base = premiumDay<TeddyExtrasPremium>(teddyDay, {
  slug: "happy-teddy-day-premium",
  title: "Made With a Heart",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "Press his paw any time. That's me, saying goodnight.",
    psLetter: "Open only on a night you can't sleep.\n\nSqueeze him twice. The second one is from me. I asked him to keep the left side of the bed warm until I'm back.",
  },
  copy: {
    letterPlaceholder: "What you'd whisper to them under a blanket fort at 1 a.m. — the soft stuff, the silly stuff…",
    letterHint: "They read it by torchlight in a blanket fort, with the teddy holding the torch.",
    photosHint: "Your photos float across the ceiling like moons from a star-lamp.",
    captionHint: "a tiny caption for the moon — e.g. our first trip ✨",
    endLinePlaceholder: "A piece of me stays with you. Goodnight.",
    endLineHint: "The last line, after the tuck-in.",
    sheetTitle: "Make their teddy 🧸",
    sheetSub: "They stuff it, give it your heart, sew it shut and it wakes up. Everything is pre-filled — make it yours.",
    extrasTitle: "Your teddy",
    extrasSub: "Its name, its look, what its heart whispers and what it says",
    publishing: "Wrapping the parcel…",
    storyTitle: "Let's make a teddy with your heart inside 🧸",
    replyText: "You sent me a teddy with your heart inside 🥹🧸",
  },
  share: { title: "A parcel for you: 1 teddy (unfinished) 🧸", accent: "#D9628F" },
});

export const teddyDayPremium: DayConfig<TeddyExtrasPremium> = {
  ...base,
  melody: "lantern",
  photoAspect: 1,
  theme: {
    ...teddyDay.theme,
    bg: "radial-gradient(120% 90% at 50% 0%, #3A3360 0%, #222748 55%, #141729 100%)",
    base: "#1B2240",
    inkSoft: "#D6D3F0",
    particles: ["🧸", "⭐", "💗", "✨"],
  },
  music: { suggestions: SONGS, suggestionsNote: "cosy & sweet · tap to use" },
  extras: [
    { key: "teddyName", kind: "text", max: 20, label: "Teddy's name", placeholder: "an inside joke works best — e.g. Golu", suggestions: ["Golu", "Mishti", "Bhalu", "Chiku"] },
    {
      key: "furColor", kind: "enum", label: "Fur colour", display: "swatches", default: "honey",
      options: [
        { value: "honey", label: "Honey", swatch: "#E8B07A" },
        { value: "cocoa", label: "Cocoa", swatch: "#8A5A3C" },
        { value: "pink", label: "Pink", swatch: "#FFC8DD" },
        { value: "white", label: "Snow", swatch: "#FFF8F0" },
        { value: "lilac", label: "Lilac", swatch: "#CDB4DB" },
        { value: "mint", label: "Mint", swatch: "#A8D8C0" },
      ],
    },
    {
      key: "eyeStyle", kind: "enum", label: "Eyes", display: "chips", default: "sparkle",
      options: [
        { value: "button", label: "Button", emoji: "⚫" },
        { value: "sparkle", label: "Sparkly", emoji: "✨" },
        { value: "sleepy", label: "Sleepy", emoji: "😌" },
        { value: "heart", label: "Hearts", emoji: "😍" },
      ],
    },
    { key: "pawInitial", kind: "text", max: 2, label: "Initial stitched on its paw (yours)", placeholder: "your initial — e.g. A" },
    {
      key: "accessory", kind: "enum", label: "One accessory", display: "chips", default: "scarf",
      options: [
        { value: "none", label: "None", emoji: "🧸" },
        { value: "bow", label: "Bow", emoji: "🎀" },
        { value: "scarf", label: "Scarf", emoji: "🧣" },
        { value: "bowtie", label: "Bow tie", emoji: "👔" },
        { value: "flower", label: "Flower", emoji: "🌼" },
        { value: "sweater", label: "Heart sweater", emoji: "🧶" },
        { value: "glasses", label: "Glasses", emoji: "👓" },
      ],
    },
    {
      key: "parcelNote", kind: "text", max: 80, label: "Tag on the unfinished teddy",
      placeholder: "the note pinned to the teddy before it has a heart",
      suggestions: ["He's not finished yet. He needs you to give him a heart."],
    },
    {
      key: "heartWhisper", kind: "text", max: 90, min: 6, label: "What the heart whispers in their ear",
      hint: "They hold your fabric heart to their ear before sewing it in. Make it the softest line on the page.",
      placeholder: "the one thing you'd say if you could whisper it right now",
    },
    { key: "firstWords", kind: "text", max: 50, label: "Teddy's first words when it wakes up", placeholder: "e.g. Hi! Aryan sent me. I'm yours now." },
    {
      key: "squeezeLines", kind: "list", maxItems: 5, minItems: 3, itemMax: 70, label: "What the teddy says",
      hint: "One pops up each time they find it in hide-and-seek or squish it at bedtime.",
      itemPlaceholder: ["a cheeky line about you two", "something you'd want them to hear at night", "a silly reminder in your voice"],
      addLabel: "+ add a line",
    },
    { key: "bedtimeLine", kind: "text", max: 70, label: "The goodnight whisper", placeholder: "e.g. Goodnight, Riya. Aryan is just a dream away." },
    {
      key: "sleepOver", kind: "enum", label: "Outside the window", display: "chips", default: "rain",
      options: [
        { value: "rain", label: "Rain", emoji: "🌧️" },
        { value: "snow", label: "Snow", emoji: "❄️" },
        { value: "stars", label: "Stars", emoji: "✨" },
      ],
    },
  ],
  demo: {
    ...base.demo,
    endLine: "A piece of me stays with you. Goodnight 🧸",
    extras: {
      teddyName: "Golu",
      furColor: "honey",
      eyeStyle: "sparkle",
      pawInitial: "A",
      accessory: "scarf",
      parcelNote: "He's not finished yet. He needs you to give him a heart.",
      heartWhisper: "Whenever you hold him, I'm holding you back.",
      firstWords: "Hi! Aryan sent me. I'm yours now.",
      squeezeLines: [
        "Found me! Now go find Aryan, he misses you.",
        "I'm on duty for all bad dreams tonight.",
        "Aryan says drink water. I say hug me.",
        "Ek aur squeeze? Theek hai.",
        "I smell like his hoodie. Don't ask.",
      ],
      bedtimeLine: "Goodnight, Riya. Aryan is just a dream away.",
      sleepOver: "rain",
    },
  },
};
