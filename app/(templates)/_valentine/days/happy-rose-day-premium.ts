// happy-rose-day-premium — "The Glasshouse Rose" (the ✦ Premium twin of happy-rose-day).
//
// A private glasshouse at dusk. They wipe the fog off the door (their name is traced in it), take the thorns off one
// rose (each a hard time you got through together), breathe it into bloom — and a whole garden of roses blooms in a
// wave that draws a heart, with the song's chorus dropping on the final bloom. Then falling word-petals, a pressed-
// book letter, dew-drop memories, and the rose sealed forever under a glass dome with both names engraved.
//
// Extras keys + limits are mirrored in server/src/config/premiumDays/happy-rose-day-premium.ts and pinned in
// server/src/config/valentineDays.test.ts. Keys shared with the $2 day keep its key (roseColor, colorReason,
// roseCount, openingLine, shayari, signOff). The chorus second is the shared premium.songDropAt.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { premiumDay } from "./_premium";
import { demoPhotos } from "./_shared";
import { ROSE_COLORS, ROSE_COUNTS, roseDay } from "./happy-rose-day";

export interface RoseExtrasPremium {
  roseColor: string;
  colorReason: string;
  roseCount: string;
  openingLine: string;
  thorns: string[];
  petalSentence: string;
  sinceDate: string;
  engraving: string;
  secretLine: string;
  signOff: string;
  shayari: string;
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "pr1-door", label: "Peek", moment: "Beside the fogged glasshouse door", file: "pr1-door.gif", emoji: "🚪", anim: "wiggle" },
  { id: "pr2-thorn", label: "Comfort", moment: "After the last thorn comes off", file: "pr2-thorn.gif", emoji: "🫶", anim: "pulse" },
  { id: "pr3-petals", label: "Petals", moment: "When the petal sentence is complete", file: "pr3-petals.gif", emoji: "🌸", anim: "float" },
  { id: "pr4-letter", label: "Letter", moment: "Under the pressed-book letter", file: "pr4-letter.gif", emoji: "💌", anim: "bounce" },
  { id: "pr5-memories", label: "Memories", moment: "Over the dew-drop memories", file: "pr5-memories.gif", emoji: "📸", anim: "bounce" },
  { id: "pr6-forever", label: "Forever", moment: "Beside the rose under the glass dome", file: "pr6-forever.gif", emoji: "🌹", anim: "pulse" },
];

/** Official uploads, checked against YouTube's oEmbed on 2026-10-08. */
export const GLASSHOUSE_SONGS: readonly SongSuggestion[] = [
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh · Brahmāstra" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh · Aashiqui 2" },
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal · Shershaah" },
  { id: "0put0_a--Ng", title: "Make You Feel My Love", artist: "Adele" },
  { id: "Cb6wuzOurPc", title: "Tum Se Hi", artist: "Mohit Chauhan · Jab We Met" },
];

const base = premiumDay<RoseExtrasPremium>(roseDay, {
  slug: "happy-rose-day-premium",
  title: "The Glasshouse Rose",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "I grew this one where nothing could touch it. Not even time.",
    psLetter: "Open only if you ever doubt it was real.\n\nIt was. Every petal, every thorn, every single day of it. I'd plant the whole garden again just to give you the one rose.",
  },
  copy: {
    letterPlaceholder: "Start with the first time you noticed them. Then the tiny thing they do that nobody else notices…",
    letterHint: "Pressed between the pages of an old book, next to a dried rose. It writes itself in ink, line by line.",
    photosHint: "Every photo hides inside a dew drop on a rose petal. A tap swells it to full screen.",
    captionHint: "caption — e.g. that rainy day in Lonavala",
    endLinePlaceholder: "This one never wilts. Neither will I. 🌹",
    endLineHint: "Under the rose sealed in its glass dome, at the very end.",
    sheetTitle: "Grow their glasshouse rose 🌹",
    sheetSub: "A fogged door with their name, thorns you got through together, a garden that blooms on your song, and a rose sealed forever. Everything is pre-filled — make it yours.",
    extrasTitle: "Your glasshouse",
    extrasSub: "The rose, the thorns, the petals' secret and the engraving",
    publishing: "Planting the glasshouse…",
    storyTitle: "Let's grow their glasshouse rose 🌹",
    replyText: "You grew me a whole garden 🥹🌹 My turn.",
  },
  share: { title: "Someone has been growing something for you 🌹", accent: "#C8102E" },
});

export const roseDayPremium: DayConfig<RoseExtrasPremium> = {
  ...base,
  music: { suggestions: GLASSHOUSE_SONGS, suggestionsNote: "romantic favourites · tap to use" },
  theme: {
    bg: "radial-gradient(90% 55% at 50% 0%, #6B4A3E 0%, #3A3330 45%, #1E2A27 100%)",
    base: "#1E2422",
    paper: "#FBF3E6",
    glass: "rgba(251,243,230,0.09)",
    ink: "#FBF3E6",
    inkSoft: "#E3D2C0",
    paperInk: "#3B2420",
    accent: "#F4C27A",
    accentDeep: "#B9853A",
    accentInk: "#1E2422",
    soft: "#3C4A44",
    edge: "rgba(251,243,230,0.2)",
    gold: "#F4C27A",
    dark: true,
    particles: ["🌹", "🌸", "✨", "🍃"],
    confetti: ["#C8102E", "#E8A0A8", "#F4C27A", "#FBF3E6", "#5E8C61"],
  },
  extras: [
    { key: "roseColor", kind: "enum", label: "Pick your rose", display: "swatches", default: "red", options: ROSE_COLORS, hint: "It tints the bloom, the whole garden and the dome's glow. The colour's meaning shows on their screen." },
    { key: "colorReason", kind: "text", max: 90, label: "Why this colour?", placeholder: "e.g. because red is the dupatta you wore the day I knew", hint: "Shown under the colour's meaning when the rose opens." },
    { key: "roseCount", kind: "enum", label: "How many roses bloom for them?", display: "chips", default: "99", options: ROSE_COUNTS, hint: "1 blooms alone in a ring of light, 3 in a cluster, 7–12 draw a heart's outline, 99 fill a whole heart." },
    { key: "openingLine", kind: "text", max: 70, label: "The line on the potting bench", placeholder: "the first thing they read inside the glasshouse", suggestions: ["I couldn't send you a garden. So I grew you one.", "Someone has been growing something for you.", "Ek gulaab, sirf tumhare liye 🌹"] },
    {
      key: "thorns", kind: "list", maxItems: 5, itemMax: 60, label: "Thorns you got through (keep it gentle)",
      hint: "Hard times you made it through together. They pluck each thorn and it becomes “…and we got through it”. Leave empty to skip the thorns.",
      itemPlaceholder: ["7 months of long-distance", "the year of the exams", "your move to Bangalore", "our worst fight (the AC one)", "the night the phone died at the airport"],
      addLabel: "+ add a thorn",
    },
    { key: "petalSentence", kind: "text", max: 60, min: 12, label: "A sentence hidden in falling petals", placeholder: "seven words or fewer", hint: "One word per petal. They catch them to read it.", suggestions: ["You are my favourite thing that grows.", "Out of every flower, I'd pick you.", "Tum ho toh sab theek hai."] },
    { key: "sinceDate", kind: "text", max: 24, label: "Engraved “since”", placeholder: "any way you like — 14 Feb 2022, our first monsoon", hint: "On the dome's walnut base: “{their name} & {you} · since …”" },
    { key: "engraving", kind: "text", max: 40, label: "The engraving on the base", placeholder: "a short line to keep forever", suggestions: ["My one rose, in all the world.", "This one never wilts.", "Hamesha, sirf tum."] },
    { key: "secretLine", kind: "text", max: 80, label: "A secret in the tiny dew drop (optional)", placeholder: "something only they should find", hint: "Hidden in a tiny dew drop on a stem among the memories. You'll see if they found it." },
    { key: "signOff", kind: "text", max: 40, label: "Sign-off", placeholder: "how you end every text to them — e.g. Hamesha tumhara, Rohan" },
    { key: "shayari", kind: "longtext", max: 160, rows: 2, label: "A little shayari (optional)", placeholder: "two lines at the end of the letter — add the poet's name if it's a famous sher" },
  ],
  demo: {
    ...base.demo,
    photos: demoPhotos([
      ["our first chai date ☕", "You blew on my chai for me like I was five. I pretended to mind."],
      ["that rainy day in Lonavala", "One umbrella, two people, zero dry shoulders. Best walk of my life."],
      ["you, stealing my fries", "I ordered extra on purpose. Don't tell anyone."],
      ["us, forever", "Out of every timeline, I'd pick this one. Every time."],
    ]),
    endLine: "This one never wilts. Neither will I. 🌹",
    extras: {
      roseColor: "red",
      colorReason: "Because red is the dupatta you wore the day I knew.",
      roseCount: "99",
      openingLine: "I couldn't send you a garden. So I grew you one.",
      thorns: ["7 months of long-distance", "the night I almost lost my job", "your move to Bangalore", "our worst fight (the AC one)"],
      petalSentence: "You are my favourite thing that grows.",
      sinceDate: "14 Feb 2022",
      engraving: "My one rose, in all the world.",
      secretLine: "I still have the first rose you gave back to me. Pressed. In my wallet.",
      signOff: "Tumhara, hamesha",
      shayari: "",
    },
  },
};
