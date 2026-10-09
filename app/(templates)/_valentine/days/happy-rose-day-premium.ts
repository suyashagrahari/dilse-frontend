// happy-rose-day-premium — "The Rose Garden" (v3, the ✦ Premium twin of happy-rose-day).
//
// A little garden that grows for her: she tears open a seed packet with her name on it (the song starts), waters
// the sprout through three bouncy stages, picks the colour of her rose (each colour says something from him),
// plays loves-me-loves-me-not (it always lands on LOVES ME), unties the ribbon on a rose left at her door to
// read his letter, hears his voice from a singing rose, arranges her photos into a bouquet and ties it, then
// says yes to "Will you keep my rose forever?" — and on the chorus roses bloom across the whole screen while
// her bouquet rises into the middle. It ends pressed in a diary page she can save as a wallpaper.
//
// Extras keys + limits are mirrored in server/src/config/premiumDays/happy-rose-day-premium.ts and pinned in
// server/src/config/valentineDays.test.ts. Keys shared with the $2 day keep its key (roseColor, colorReason,
// openingLine, shayari, signOff). The chorus second is the shared premium.songDropAt.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import type { LovePhoto } from "../../_love/types";
import { premiumDay } from "./_premium";
import { ROSE_COLORS, roseDay } from "./happy-rose-day";

export interface RoseExtrasPremium {
  roseColor: string;
  colorReason: string;
  openingLine: string;
  question: string;
  yesLine: string;
  sinceDate: string;
  signOff: string;
  shayari: string;
  [k: string]: unknown;
}

const CDN_GIFS = "https://cdn.subhsandesh.in/gifts-media/templates/_premium/gifs";
/** Our sticker library lives under templates/_premium/gifs; a slot's `file` resolves against templates/<slug>/. */
const lib = (path: string) => `../_premium/gifs/${path}`;

const GIFS: GifSlot[] = [
  { id: "rg1-peek", label: "Seed packet", moment: "Peeking from behind the seed packet, before it opens", file: lib("rose-day/panda-holding-rose.webp"), emoji: "🌱", anim: "bounce" },
  { id: "rg2-water", label: "Watering", moment: "Next to the pot while the sprout grows", file: lib("rose-day/penguin-flower-vase.webp"), emoji: "💧", anim: "float" },
  { id: "rg3-blush", label: "Rose colour", moment: "Beside the rose while they pick its colour", file: lib("rose-day/teddy-rose-hearts.webp"), emoji: "🌹", anim: "pulse" },
  { id: "rg4-lovesme", label: "Loves me!", moment: "When the last petal lands on LOVES ME", file: lib("teddy-day/teddy-yes-heart-eyes.webp"), emoji: "🥰", anim: "pulse" },
  { id: "rg5-note", label: "The note", moment: "Next to your letter as it types itself", file: lib("rose-day/bears-bouquet-gift.webp"), emoji: "💌", anim: "wiggle" },
  { id: "rg6-yes", label: "Forever", moment: "When they say yes and the roses bloom", file: lib("kiss-day/bear-bunny-kiss.webp"), emoji: "💞", anim: "pulse" },
];
const DEMO_GIFS: Record<string, string> = Object.fromEntries(GIFS.map((g) => [g.id, `${CDN_GIFS}/${g.file.replace("../_premium/gifs/", "")}`]));

/** research §E (oEmbed 200 + playableInEmbed, 2026-10-09). The first one is the demo song. */
export const GARDEN_SONGS: readonly SongSuggestion[] = [
  { id: "iKzRIweSBLA", title: "Perfect", artist: "Ed Sheeran" },
  { id: "MlThQTo6D8A", title: "Until I Found You", artist: "Stephen Sanchez" },
  { id: "orYf6VDtj_k", title: "Raataan Lambiyan", artist: "Jubin Nautiyal · Shershaah" },
  { id: "hgi2MYAFgE8", title: "Gulabi Aankhen", artist: "SANAM" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh · Brahmāstra" },
];
/** "Baby, I'm dancing in the dark…": the sweet part plays from the gate, and the YES drops back onto it. */
const DEMO_START = 56;

const A = "https://cdn.subhsandesh.in/gifts-media/assets";
const photo = (path: string, caption: string, note: string, cropY = 45): LovePhoto => ({ url: `${A}/${path}.webp`, caption, note, cropX: 50, cropY, scale: 100 });
const DEMO_PHOTOS: LovePhoto[] = [
  photo("couple1", "the evening you said yes to coffee", "I had a whole speech ready. I said “hi” and forgot the rest.", 55),
  photo("couple2", "our first proper date", "You laughed at my joke before I finished it. I've been showing off ever since.", 40),
  photo("couple3", "cherry blossoms in Shimla", "You made me stand still for one photo. I'm so glad you did.", 60),
  photo("couple4", "the night we counted stars", "You fell asleep at forty-two. I kept counting.", 55),
  photo("Aniversary/aniversary", "our first anniversary", "One year, and you still look at me like that."),
  photo("TemplateComingSoon/valentine", "our first Valentine's", "You ate the last chocolate and I let you. That's love."),
];

const base = premiumDay<RoseExtrasPremium>(roseDay, {
  slug: "happy-rose-day-premium",
  title: "The Rose Garden",
  gifSlots: GIFS,
  demoSong: { id: GARDEN_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    songDropAt: DEMO_START,
    voiceCaption: "I practised this twelve times. You'll still hear me smiling on the last line.",
    psLetter:
      "Open only if you ever wonder whether I'd do it all again.\n\nI would. The coffee, the long wait, the fight about the umbrella, all of it. I'd still be nervous saying hi.",
  },
  copy: {
    letterPlaceholder: "Start with the first time you noticed them. Then the tiny thing they do that nobody else notices…",
    letterHint: "Tied to a rose at their door: they pull the ribbon and it types itself out.",
    photosHint: "Your photos become the flowers they arrange into a bouquet (the first 6), each with your caption and note.",
    captionHint: "caption, e.g. cherry blossoms in Shimla",
    noteHint: "the little note they read when they tap this flower…",
    endLinePlaceholder: "Every Rose Day, it's still you.",
    endLineHint: "The last line, on the diary page they can save.",
    sheetTitle: "Grow their rose garden 🌱",
    sheetSub: "A seed packet with their name, a rose they water and colour, loves-me-loves-me-not, your letter, your voice, a bouquet of your photos and one sweet question. Everything is pre-filled: make it yours.",
    extrasTitle: "Your rose",
    extrasSub: "The colour, the first line, the question and your sign-off",
    publishing: "Planting your garden…",
    storyTitle: "Let's grow their rose garden 🌱",
    replyText: "My rose bloomed 🌹 And so did I. Sending one back 💗",
  },
  share: { title: "Someone planted a rose garden for you 🌱", accent: "#D63F72" },
});

export const roseDayPremium: DayConfig<RoseExtrasPremium> = {
  ...base,
  music: { audioOnly: true, suggestions: GARDEN_SONGS, suggestionsNote: "romantic favourites · tap to use", demoStart: DEMO_START },
  theme: {
    bg: "linear-gradient(160deg, #FFF5F8 0%, #FFEAF1 55%, #FFE3EC 100%)",
    base: "#FFF5F8",
    paper: "#FFFFFF",
    glass: "rgba(255,255,255,0.72)",
    ink: "#5B2333",
    inkSoft: "#8A4A5C",
    paperInk: "#5B2333",
    accent: "#FF6F9C",
    accentDeep: "#D63F72",
    accentInk: "#FFFFFF",
    soft: "#FFD1DF",
    edge: "#FFD1DF",
    gold: "#FFE27A",
    dark: false,
    particles: ["🌹", "🌸", "💗", "✨"],
    confetti: ["#FF6F9C", "#D63F72", "#FFD1DF", "#FFE27A", "#7BC47F"],
  },
  extras: [
    { key: "roseColor", kind: "enum", label: "Your rose's colour", display: "swatches", default: "red", options: ROSE_COLORS, hint: "Their rose starts in this colour and gets a little “his pick” heart. They can try the others too." },
    { key: "colorReason", kind: "text", max: 90, label: "Why this colour?", placeholder: "e.g. because it's the colour of the dupatta you wore the day I knew", hint: "On the sticky note when they land on your colour." },
    {
      key: "openingLine", kind: "text", max: 60, label: "The first line",
      placeholder: "what they read over the little pot",
      hint: "Over the pot, while they water the sprout.",
      suggestions: ["I couldn't send you a garden, so I grew you one.", "Water it. Something is growing for you.", "Ek gulaab, sirf tumhare liye 🌹"],
    },
    {
      key: "question", kind: "text", max: 60, label: "Your question",
      placeholder: "the one sweet question near the end",
      hint: "Asked with a Yes and a shy No that wilts and runs away. Their Yes makes roses bloom across the screen.",
      suggestions: ["Will you keep my rose forever?", "Will you be my forever person?", "Mera gulaab rakhogi, hamesha?"],
    },
    {
      key: "yesLine", kind: "text", max: 70, label: "After they say yes",
      placeholder: "what appears as the roses bloom",
      suggestions: ["Then it's yours. So am I.", "I knew you'd say yes. I hoped, anyway.", "Pakka promise? Pakka. 🌹"],
    },
    { key: "sinceDate", kind: "text", max: 24, label: "Together since", placeholder: "any way you like: 14 Feb 2022, our first monsoon", hint: "Written on the diary page under your names." },
    { key: "signOff", kind: "text", max: 40, label: "Sign-off", placeholder: "how you end every text to them, e.g. Forever yours, Rohan" },
    { key: "shayari", kind: "longtext", max: 160, rows: 2, label: "A little shayari (optional)", placeholder: "two lines at the end of the letter; add the poet's name if it's a famous sher" },
  ],
  demo: {
    ...base.demo,
    recipientName: "Ananya",
    senderName: "Rohan",
    petName: "Rosebud",
    photos: DEMO_PHOTOS,
    gifs: DEMO_GIFS,
    letter:
      "Ananya,\n\nI couldn't fit a real garden in a link, so I grew you a small one. You watered it, which is very you: you look after everything, including me.\n\nYou remember the small things I say once and forget. You laugh at my jokes before the end. You hold my hand in crowds like it's the most natural thing in the world.\n\nSo this Rose Day I didn't want a rose from a shop. I wanted one you grew, in a garden that's only ours.\n\nI'm still nervous saying hi.",
    endLine: "Every Rose Day, it's still you.",
    extras: {
      roseColor: "red",
      colorReason: "Because it's the colour of the dupatta you wore the day I knew.",
      openingLine: "I couldn't send you a garden, so I grew you one.",
      question: "Will you keep my rose forever?",
      yesLine: "Then it's yours. So am I.",
      sinceDate: "14 Feb 2022",
      signOff: "Forever yours, Rohan",
      shayari: "",
    },
  },
};
