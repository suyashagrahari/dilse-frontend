// happy-valentines-day-premium — "Us, Wrapped" (the ✦ Premium twin of happy-valentines-day, flagship of the tier).
//
// Their year in love as a Wrapped-style story: bold colour-blocked slides, huge kinetic numbers, tap-through
// progress bars. Our top song, top 3 memories (swiped away #3 → #1), stats you didn't know I kept (flip tiles),
// their top trait according to you (scratch), reasons (fast cuts over their photos), a voice note, the letter,
// then THE NUMBER: hold to count, the days counter slams to its final number on the song's drop and cuts to
// their best photo full-bleed, where the question waits. Ends on a shareable "Us, Wrapped" card.
//
// Extras keys + limits are mirrored in server/src/config/premiumDays/happy-valentines-day-premium.ts and pinned
// in server/src/config/valentineDays.test.ts. Keys that mean the same thing as the $2 day keep its key
// (togetherSince, stats, question, noLines, datePlan) so an upgrade carries them over.
// The chorus second is NOT an extra: it is the shared premium.songDropAt ("The drop" in the form).

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { DEMO_PHOTO_CDN } from "../../_love/types";
import { premiumDay } from "./_premium";
import { valentinesDay } from "./happy-valentines-day";

export interface ValentinesExtrasPremium {
  togetherSince: string;
  songNote: string;
  topPhrase: string;
  topPlace: string;
  stats: { label: string; value: string }[];
  topTrait: string;
  reasons: string[];
  question: string;
  noLines: string[];
  datePlan: string;
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "pv4-please", label: "Please?", moment: "Next to Yes and No, under the big question", file: "pv4-please.gif", emoji: "🥺", anim: "float" },
  { id: "pv5-yes", label: "Yay", moment: "The second they say Yes", file: "pv5-yes.gif", emoji: "🥳", anim: "bounce" },
];

/**
 * research §E (premium-v2): every id passed YouTube oEmbed + playableInEmbed on 2026-10-09. The first one is
 * the preview's demo song and starts at `demoStart` (its "most replayed" second).
 */
export const WRAPPED_SONGS: readonly SongSuggestion[] = [
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "aXzVF3XeS8M", title: "Love Story (Taylor's Version)", artist: "Taylor Swift" },
  { id: "u2NAuswnTKs", title: "Apna Bana Le", artist: "Arijit Singh · Bhediya" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh · Brahmāstra" },
  { id: "NwFVSclD_uc", title: "I Love You So", artist: "The Walters" },
  { id: "GxldQ9eX2wo", title: "Until I Found You", artist: "Stephen Sanchez" },
];

const photo = (file: string, caption: string, note: string, cropX = 50, cropY = 50, scale = 100) => ({
  url: `${DEMO_PHOTO_CDN}/${file}`, caption, note, cropX, cropY, scale,
});

// Photo 1 = the big reveal + the card cover · 2–4 = top 3 memories (#1, #2, #3) · the rest flash behind the reasons.
const PHOTOS = [
  photo("couple1.webp", "the sunset we drove two hours for", "You said the sky looked like mango lassi.", 50, 55),
  photo("couple2.webp", "first date, the fairy-light café", "You stole my fries, then the whole evening."),
  photo("couple4.webp", "the night we counted stars", "You named one after me. It's the wrong one.", 50, 40),
  photo("couple3.webp", "cherry blossom season", "Even the trees were showing off for you."),
  photo("couple2.webp", "the close-up I never posted", "This one is just for me.", 46, 36, 170),
  photo("couple1.webp", "us, mid-laugh", "I don't remember the joke. I remember you.", 50, 70, 160),
];

const base = premiumDay<ValentinesExtrasPremium>(valentinesDay, {
  slug: "happy-valentines-day-premium",
  title: "Us, Wrapped",
  gifSlots: GIFS,
  demoSong: { id: WRAPPED_SONGS[0].id, start: 44 },
  demoPremium: {
    voiceCaption: "I practised this eleven times. You still make me forget my lines.",
    psLetter:
      "Open only if you ever wonder whether I'd choose this year again.\n\nI would. The wrong turns, the cold chai, the two-hour drive for one sunset. Every single minute of it, with you.",
  },
  copy: {
    letterPlaceholder: "Ananya,\n\nWhat this year with you was really like, in your own words…",
    letterHint: "Unfolds near the end, right before the big number. Write it like a letter, not a caption.",
    photosHint: "Photo 1 is the big reveal and the cover of your card. Photos 2–4 are your top 3 memories. The rest flash behind your reasons.",
    captionHint: "the moment, e.g. first date, the fairy-light café",
    noteHint: "what you remember most about it…",
    endLinePlaceholder: "Same time next year? And every year after.",
    endLineHint: "Printed on your “Us, Wrapped” card at the very end.",
    sheetTitle: "Wrap your year together ✦",
    sheetSub: "Your year in love, told like a Wrapped story: your song, your top memories, the stats only you kept, reasons, a letter and the number of days, landing on the drop. Everything is pre-filled. Make it yours.",
    extrasTitle: "Your Wrapped",
    extrasSub: "The date it began, your song, your stats, their top trait, reasons and the question",
    publishing: "Wrapping your year…",
    storyTitle: "Let's wrap your year together ✦",
    replyText: "Yes. Obviously. Same time next year, and every year after. 💘",
  },
  share: { title: "Your year in love, wrapped 💘", accent: "#FF4B3E" },
});

export const valentinesDayPremium: DayConfig<ValentinesExtrasPremium> = {
  ...base,
  letterMin: 80,
  music: {
    audioOnly: true,
    suggestions: WRAPPED_SONGS,
    suggestionsNote: "the most-added love songs · tap to use",
    demoStart: 44,
  },
  theme: {
    bg: "#151018",
    base: "#151018",
    paper: "#FFF4D6",
    glass: "rgba(255,231,163,0.10)",
    ink: "#FFF6E8",
    inkSoft: "#D9CDE6",
    paperInk: "#151018",
    accent: "#FF4B3E",
    accentDeep: "#B8231A",
    accentInk: "#FFFFFF",
    soft: "#2A2030",
    edge: "rgba(255,231,163,0.22)",
    gold: "#FFE7A3",
    dark: true,
    particles: ["💘", "✨", "🎧", "💗"],
    confetti: ["#FF4B3E", "#FF7AB6", "#FFE7A3", "#B9A7FF", "#FFFFFF"],
  },
  extras: [
    {
      key: "togetherSince", kind: "text", max: 10, input: "date", label: "Together since",
      hint: "The big number: hold to count, and it slams to your days together on the drop of your song. Empty = “∞”.",
    },
    {
      key: "songNote", kind: "text", max: 60, label: "A line about your song",
      placeholder: "e.g. On repeat since the Lonavala drive.",
      hint: "Under your top song, after they tap ♥. Pick the song itself in Music.",
    },
    {
      key: "topPhrase", kind: "text", max: 40, label: "Most-said phrase",
      placeholder: "e.g. “Reached?”", suggestions: ["“Reached?”", "“Did you eat?”", "“Five more minutes.”"],
    },
    { key: "topPlace", kind: "text", max: 40, label: "Your top place", placeholder: "e.g. Our chai stall on FC Road" },
    {
      key: "stats", kind: "objlist", maxItems: 2, label: "Stats you didn't know you kept", itemTitle: "Stat", addLabel: "+ add a stat",
      hint: "Flip tiles next to the phrase and the place. Something only you two would count.",
      item: [
        { key: "label", kind: "text", max: 30, label: "What it counts", placeholder: "Hoodies you stole" },
        { key: "value", kind: "text", max: 24, label: "The number", placeholder: "7 (and counting)" },
      ],
    },
    {
      key: "topTrait", kind: "text", max: 28, label: "Their top trait, according to you",
      placeholder: "e.g. Annoyingly kind", hint: "They scratch it off a foil card.",
      suggestions: ["Annoyingly kind", "Main-character energy", "Professional hoodie thief"],
    },
    {
      key: "reasons", kind: "list", maxItems: 5, itemMax: 70, label: "Reasons I love you (fast cuts)",
      hint: "Each one flashes over one of your photos. Short and specific hits hardest.",
      itemPlaceholder: ["You laugh at your jokes before the punchline.", "You remember how I take my chai.", "You make bad days shorter.", "You hold my hand in crowds.", "You're my favourite notification."],
      addLabel: "+ add a reason",
    },
    {
      key: "question", kind: "text", max: 60, label: "The big question", placeholder: "asked over your best photo",
      hint: "Appears over photo 1, right after the big number.",
      suggestions: ["Another year of us. Be my Valentine?", "Will you be my Valentine, forever?", "Will you marry me? 💍"],
    },
    {
      key: "noLines", kind: "list", maxItems: 4, itemMax: 40, label: "What “No” says as it runs",
      hint: "After the last one, No gives up and becomes a second Yes.",
      itemPlaceholder: ["Wrong button, clearly.", "Try the pink one.", "Nice try.", "Fine. This is a Yes now."],
      addLabel: "+ add a line",
    },
    {
      key: "datePlan", kind: "text", max: 80, label: "Coming up next (optional)",
      placeholder: "Saturday · 8 PM · our chai stall, then the long way home",
      hint: "“Coming soon” on your Wrapped card.",
    },
  ],
  demo: {
    ...base.demo,
    letter:
      "Ananya,\n\nThis year I learned that you hum when you cook, that you say “five more minutes” and mean forty, and that a two-hour drive for one sunset is never too far if you're the one in the passenger seat.\n\nYou made the ordinary days the ones I want to keep. The cold chai, the wrong turns, the calls that ran past midnight because neither of us wanted to be the one to hang up.\n\nI don't need a big year next year. I just need it to be ours. There's one number I've been counting. Hold on, it's next.",
    photos: PHOTOS,
    endLine: "Same time next year? And every year after.",
    extras: {
      togetherSince: "2023-02-14",
      songNote: "On repeat since the Lonavala drive.",
      topPhrase: "“Reached?”",
      topPlace: "Our chai stall, FC Road",
      stats: [
        { label: "Hoodies you stole", value: "7" },
        { label: "Calls past midnight", value: "Too many" },
      ],
      topTrait: "Annoyingly kind",
      reasons: [
        "You laugh at your own jokes before the punchline.",
        "You remember exactly how I take my chai.",
        "You make every bad day shorter.",
        "You hold my hand in crowds. Every time.",
        "You're my favourite notification.",
      ],
      question: "Another year of us. Be my Valentine?",
      noLines: ["Wrong button, clearly.", "Try the pink one.", "Nice try.", "Fine. This is a Yes now."],
      datePlan: "Saturday · 8 PM · our chai stall, then the long way home",
    },
  },
};
