// happy-rose-day-premium — "The Bloom of Us" (the ✦ Premium twin of happy-rose-day).
//
// The buyer's photos ARE the petals. A tight velvet bud waits in the dark; they hold it to warm it, and on the
// song's drop it unfurls in 3D, ring by ring, every petal one of their photos, while the camera pulls back. Then three
// photos pressed under vellum (swipe to lift), the letter on cream paper with a pressed-petal watermark, the
// sender's voice, and a keepsake card: "Every Rose Day, it's still you."
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
  bloomLine: string;
  sinceDate: string;
  signOff: string;
  shayari: string;
  [k: string]: unknown;
}

// Two quiet sticker spots only: this page is carried by photos and type, not stickers. The ids (and their GIFs on
// the CDN) are the v1 ones, so nothing needs re-uploading.
const GIFS: GifSlot[] = [
  { id: "pr3-petals", label: "Bloom", moment: "Beside the line under the open rose", file: "pr3-petals.gif", emoji: "🌸", anim: "float" },
  { id: "pr6-forever", label: "Keepsake", moment: "On the corner of the keepsake card", file: "pr6-forever.gif", emoji: "🌹", anim: "pulse" },
];

/** research §E (oEmbed 200 + playableInEmbed, 2026-10-09). The first one is the demo song. */
export const BLOOM_SONGS: readonly SongSuggestion[] = [
  { id: "iKzRIweSBLA", title: "Perfect", artist: "Ed Sheeran" },
  { id: "MlThQTo6D8A", title: "Until I Found You", artist: "Stephen Sanchez" },
  { id: "orYf6VDtj_k", title: "Raataan Lambiyan", artist: "Jubin Nautiyal · Shershaah" },
  { id: "hgi2MYAFgE8", title: "Gulabi Aankhen", artist: "SANAM" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh · Brahmāstra" },
];
/** The demo song starts on its most-replayed phrase; the drop lands back on it when the rose opens. */
const DEMO_START = 56;

const A = "https://cdn.subhsandesh.in/gifts-media/assets";
const photo = (path: string, caption: string, note: string, cropY = 45): LovePhoto => ({ url: `${A}/${path}.webp`, caption, note, cropX: 50, cropY, scale: 100 });
const DEMO_PHOTOS: LovePhoto[] = [
  photo("couple1", "the evening you said yes to coffee", "I had a whole speech ready. I said “hi” and forgot the rest.", 55),
  photo("couple2", "our first proper date", "You laughed at my joke before I finished it. I've been showing off ever since.", 40),
  photo("couple3", "the cherry blossoms in Shimla", "You made me stand still for one photo. I'm glad you did.", 60),
  photo("couple4", "the night we counted stars", "You fell asleep at forty-two. I kept counting.", 55),
  photo("Aniversary/aniversary", "our first anniversary", "One year, and you still look at me like that."),
  photo("TemplateComingSoon/sorry2", "the day we made up", "We were both wrong. You were just nicer about it."),
  photo("TemplateComingSoon/valentine", "our first Valentine's", "You ate the last chocolate and I let you. That's love."),
  photo("TemplateComingSoon/wddinganiversary", "your sister's wedding", "Everyone was looking at the bride. I was looking at you."),
  photo("hero-bg", "us, always", "Out of every timeline, I'd pick this one. Every time.", 40),
];

const base = premiumDay<RoseExtrasPremium>(roseDay, {
  slug: "happy-rose-day-premium",
  title: "The Bloom of Us",
  gifSlots: GIFS,
  demoSong: { id: BLOOM_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    songDropAt: DEMO_START,
    voiceCaption: "I practised this twelve times. You'll still hear me smiling on the last line.",
    psLetter:
      "Open only if you ever wonder whether I'd do it all again.\n\nI would. The coffee, the long wait, the fight about the umbrella, all of it. I'd find you in every timeline and I'd still be nervous saying hi.",
  },
  copy: {
    letterPlaceholder: "Start with the first time you noticed them. Then the tiny thing they do that nobody else notices…",
    letterHint: "On cream paper with a pressed petal. It unfolds after the rose has bloomed, and reveals line by line.",
    photosHint: "Every photo becomes a petal of the rose (up to 12). The first three are also pressed under vellum, with your captions.",
    captionHint: "caption, e.g. the cherry blossoms in Shimla",
    endLinePlaceholder: "Every Rose Day, it's still you.",
    endLineHint: "The last line, over the keepsake card.",
    sheetTitle: "Grow their rose of photos 🌹",
    sheetSub: "Your photos become the petals of one rose that opens on your song. Then pressed photos, your letter, your voice and a keepsake card. Everything is pre-filled: make it yours.",
    extrasTitle: "Your rose",
    extrasSub: "The colour, the words around the bloom, and your sign-off",
    publishing: "Pressing the petals…",
    storyTitle: "Let's grow their rose of photos 🌹",
    replyText: "You turned us into a rose 🥹🌹 My turn.",
  },
  share: { title: "Something has been opening, just for you 🌹", accent: "#C8475B" },
});

export const roseDayPremium: DayConfig<RoseExtrasPremium> = {
  ...base,
  music: { audioOnly: true, suggestions: BLOOM_SONGS, suggestionsNote: "romantic favourites · tap to use", demoStart: DEMO_START },
  theme: {
    bg: "radial-gradient(90% 60% at 50% 35%, #3A0E18 0%, #1A070C 55%, #0C0406 100%)",
    base: "#12060A",
    paper: "#F6F0E6",
    glass: "rgba(246,240,230,0.08)",
    ink: "#F6F0E6",
    inkSoft: "#E6CFCB",
    paperInk: "#3A1A1F",
    accent: "#C9A45C",
    accentDeep: "#8A6A2F",
    accentInk: "#1A070C",
    soft: "#3A1A22",
    edge: "rgba(246,240,230,0.18)",
    gold: "#C9A45C",
    dark: true,
    particles: ["🌹", "🌸", "✨"],
    confetti: ["#7A1E2C", "#C8475B", "#F2D4D2", "#F6F0E6", "#C9A45C"],
  },
  extras: [
    { key: "roseColor", kind: "enum", label: "The colour of your rose", display: "swatches", default: "red", options: ROSE_COLORS, hint: "It tints the velvet of the bud and the glow behind it. Its meaning shows under the open rose." },
    { key: "colorReason", kind: "text", max: 90, label: "Why this colour?", placeholder: "e.g. because it's the colour of the dupatta you wore the day I knew", hint: "Shown under the colour's meaning once the rose has opened." },
    {
      key: "openingLine", kind: "text", max: 60, label: "The line over the closed bud",
      placeholder: "what they read before it opens",
      hint: "The first words they read, over the closed bud, before they hold it to warm it.",
      suggestions: ["Some things take time to open.", "I've been saving this one for you.", "Hold it. It's been waiting for you."],
    },
    {
      key: "bloomLine", kind: "text", max: 60, label: "The line over the open rose",
      placeholder: "what they read when every petal is a photo of you two",
      hint: "Appears over the open rose, once they can see every petal is one of your photos.",
      suggestions: ["Every petal is a day with you.", "This is what we grew.", "Look closer. It's us."],
    },
    { key: "sinceDate", kind: "text", max: 24, label: "Together since", placeholder: "any way you like: 14 Feb 2022, our first monsoon", hint: "Printed on the keepsake card under your names." },
    { key: "signOff", kind: "text", max: 40, label: "Sign-off", placeholder: "how you end every text to them, e.g. Forever yours, Rohan" },
    { key: "shayari", kind: "longtext", max: 160, rows: 2, label: "A little shayari (optional)", placeholder: "two lines at the end of the letter; add the poet's name if it's a famous sher" },
  ],
  demo: {
    ...base.demo,
    recipientName: "Ananya",
    senderName: "Rohan",
    photos: DEMO_PHOTOS,
    letter:
      "Ananya,\n\nI keep trying to work out the exact moment it happened, and I can't. It wasn't the coffee, or the first date, or the night you fell asleep counting stars. It was all of it, quietly, the way a rose opens: you never see it move, and then one morning it's simply there.\n\nYou make ordinary days feel chosen. You remember the small things I say once and forget. You laugh at my jokes before the end, and you hold my hand in crowds like it's the most natural thing in the world.\n\nSo this year I didn't want to send you a rose from a shop. I wanted to give you one made of us. Every petal is a day I'd live again.\n\nHappy Rose Day. I'm still nervous saying hi.",
    endLine: "Every Rose Day, it's still you.",
    extras: {
      roseColor: "red",
      colorReason: "Because it's the colour of the dupatta you wore the day I knew.",
      openingLine: "Some things take time to open.",
      bloomLine: "Every petal is a day with you.",
      sinceDate: "14 Feb 2022",
      signOff: "Forever yours, Rohan",
      shayari: "",
    },
  },
};
