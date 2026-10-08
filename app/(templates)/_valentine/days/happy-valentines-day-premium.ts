// happy-valentines-day-premium — "Our Film" (the ✦ Premium twin of happy-valentines-day, flagship of the tier).
//
// Their love story, screened as a film: a ticket and a film-leader countdown, opening titles and a "Previously
// on…" week recap, a constellation they trace, "The Film of Us" montage cut on the chorus, the director's
// commentary (voice note), a three-chapter book, "By the numbers", a black-and-white question shot in takes,
// and a colour flood, fireworks, end credits and a post-credits date plan.
//
// Extras keys + limits are mirrored in server/src/config/premiumDays/happy-valentines-day-premium.ts and pinned
// in server/src/config/valentineDays.test.ts. Keys that mean the same thing as the $2 day keep its key
// (weekLines, togetherSince, stats, metPlace, question, datePlan) so an upgrade carries them over.
// The chorus second is NOT an extra: it is the shared premium.songDropAt ("The drop" in the form).

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { DEMO_PHOTO_CDN } from "../../_love/types";
import { premiumDay } from "./_premium";
import { demoPhotos } from "./_shared";
import { valentinesDay, WEEK_LINE_DAYS } from "./happy-valentines-day";

export interface ValentinesExtrasPremium {
  filmTitle: string;
  tagline: string;
  weekLines: string[];
  metPlace: string;
  metDate: string;
  togetherSince: string;
  chapterTitles: string[];
  stats: { label: string; value: string }[];
  question: string;
  noTakes: string[];
  datePlan: string;
  dateOn: string;
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "pv1-ticket", label: "Popcorn", moment: "Beside the ticket at the door", file: "pv1-ticket.gif", emoji: "🍿", anim: "wiggle" },
  { id: "pv2-starring", label: "Starring", moment: "A cameo in the “starring” title card", file: "pv2-starring.gif", emoji: "🌟", anim: "bounce" },
  { id: "pv3-stars", label: "Stargazing", moment: "Over the finished constellation", file: "pv3-stars.gif", emoji: "✨", anim: "pulse" },
  { id: "pv4-please", label: "Please?", moment: "Next to YES and No, through every take", file: "pv4-please.gif", emoji: "🥺", anim: "float" },
  { id: "pv5-yes", label: "Yay", moment: "When the colour floods back", file: "pv5-yes.gif", emoji: "🥳", anim: "bounce" },
  { id: "pv6-credits", label: "Credits", moment: "Waving in the corner of the end credits", file: "pv6-credits.gif", emoji: "🎬", anim: "wiggle" },
];

/** Official uploads, checked against YouTube's oEmbed on 2026-10-08. */
export const FILM_SONGS: readonly SongSuggestion[] = [
  { id: "GxldQ9eX2wo", title: "Until I Found You", artist: "Stephen Sanchez" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal · Shershaah" },
  { id: "qoq8B8ThgEM", title: "Tujh Mein Rab Dikhta Hai", artist: "Roop Kumar Rathod · Rab Ne Bana Di Jodi" },
  { id: "-BjZmE2gtdo", title: "Lover", artist: "Taylor Swift" },
  { id: "jo6iAkSoraY", title: "Tere Liye", artist: "Lata Mangeshkar, Roop Kumar Rathod · Veer-Zaara" },
  { id: "0put0_a--Ng", title: "Make You Feel My Love", artist: "Adele" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh · Brahmāstra" },
];

const PHOTOS = [
  ...demoPhotos([
    ["the canteen, day one · 2021", "You asked to borrow a pen and kept it. I let you."],
    ["first real date · 2022", "You ordered for both of us and got mine wrong. Perfectly."],
    ["the cherry blossom walk", "Even the trees were showing off for you that day."],
    ["us, forever", "Out of every timeline, I'd pick this one. Every time."],
  ]),
  { url: `${DEMO_PHOTO_CDN}/marriage/couple-hero.webp`, caption: "your sister's wedding · 2024", note: "Everyone was watching the bride. I wasn't.", cropX: 50, cropY: 35, scale: 100 },
  { url: `${DEMO_PHOTO_CDN}/couple2.webp`, caption: "the close-up I never posted", note: "This one is just for me.", cropX: 50, cropY: 32, scale: 165 },
];

const base = premiumDay<ValentinesExtrasPremium>(valentinesDay, {
  slug: "happy-valentines-day-premium",
  title: "Our Film",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "Director's note: I rewrote this scene forty times. It's still just “I love you.”",
    psLetter:
      "Open only if you ever wonder whether I'd do it all again.\n\nI would. The canteen, the borrowed pen, the wrong order, every single take. I'd buy the same ticket and sit in the same seat, next to you.",
  },
  copy: {
    letterPlaceholder:
      "Chapter I: how it started, the first thing you noticed.\n---\nChapter II: what they are to you now.\n---\nChapter III: what you want for every chapter after this one.",
    letterHint: "Bound as a three-chapter book they turn by the corner. Put a line with three dashes (---) where each chapter ends, or we'll split it for you.",
    photosHint: "6 to 12 photos make “The Film of Us”, a trailer cut on your song's chorus. Photo 1 is also the movie poster.",
    captionHint: "the scene + when, e.g. the canteen, day one · 2021",
    noteHint: "what you'd whisper about this scene…",
    endLinePlaceholder: "Now showing: forever. 🎬",
    endLineHint: "The last line on the movie poster.",
    sheetTitle: "Direct your love story 🎬",
    sheetSub: "A film starring them: the night you met, your photos cut to your song, a three-chapter letter, the question in takes and end credits. Everything is pre-filled — make it yours.",
    extrasTitle: "The film",
    extrasSub: "Title, the week recap, where it began, your numbers, the question and the post-credits plan",
    publishing: "Developing the film…",
    storyTitle: "Let's make your love story a film 🎬",
    replyText: "YES. Take one. Obviously 🎬💘 Now tell me what to wear.",
  },
  share: { title: "You're starring in something tonight 🎬", accent: "#D4AF37" },
});

export const valentinesDayPremium: DayConfig<ValentinesExtrasPremium> = {
  ...base,
  letterMin: 80,
  music: {
    audioOnly: true,
    suggestions: FILM_SONGS,
    suggestionsNote: "film-worthy favourites · tap to use",
  },
  theme: {
    bg: "radial-gradient(120% 70% at 50% 0%, #2A1016 0%, #12090C 48%, #0B0A0C 100%)",
    base: "#0B0A0C",
    paper: "#F6EBD6",
    glass: "rgba(255,231,179,0.08)",
    ink: "#FFF3DC",
    inkSoft: "#D9C6A6",
    paperInk: "#2A1712",
    accent: "#D4AF37",
    accentDeep: "#8E6A14",
    accentInk: "#160E04",
    soft: "#3A2A12",
    edge: "rgba(255,231,179,0.22)",
    gold: "#FFD36E",
    dark: true,
    particles: ["🎬", "✨", "🍿", "💘"],
    confetti: ["#D4AF37", "#FF5C8A", "#FFD36E", "#FFE7B3", "#7A0E1C"],
  },
  extras: [
    {
      key: "filmTitle", kind: "text", max: 40, label: "Your film's title",
      placeholder: "the title of your love story",
      hint: "On the title card, the credits and the poster.",
      suggestions: ["The One Where I Met You", "Two Seats, One Story", "Us, Directed by Fate"],
    },
    {
      key: "tagline", kind: "text", max: 70, label: "Poster tagline",
      placeholder: "the one-line pitch, like a real poster",
      suggestions: ["Two strangers. One canteen. Every day since.", "Some stories you only get to live once.", "Based on a true story. Ours."],
    },
    {
      key: "weekLines", kind: "list", maxItems: 7, itemMax: 60, label: "“Previously on…” — one line per day of the week",
      hint: "A 7-frame recap in the opening titles. Leave any blank and that frame is skipped.",
      itemLabels: WEEK_LINE_DAYS,
      itemPlaceholder: ["what you did with the rose", "how the asking went", "who ate whose chocolate", "the teddy's name", "the promise still kept", "how long the hug was", "family-safe, please 😌"],
    },
    { key: "metPlace", kind: "text", max: 40, label: "Where you met", placeholder: "the exact spot — e.g. college canteen, Pune", hint: "Under the constellation, and “filmed on location in…” in the credits." },
    { key: "metDate", kind: "text", max: 10, input: "date", label: "When you met", hint: "Printed under the stars they trace. Leave empty to hide it." },
    { key: "togetherSince", kind: "text", max: 10, input: "date", label: "Together since", hint: "Powers “By the numbers”: days together, a live seconds counter, heartbeats shared." },
    {
      key: "chapterTitles", kind: "list", maxItems: 3, itemMax: 24, label: "Chapter titles for your letter",
      hint: "One per chapter of the book.",
      itemLabels: ["Chapter I", "Chapter II", "Chapter III"],
      itemPlaceholder: ["Then", "Now", "Always"],
    },
    {
      key: "stats", kind: "objlist", maxItems: 3, label: "Your own numbers", itemTitle: "Stat", addLabel: "+ add a stat",
      hint: "Up to three, after the ones we work out from your dates.",
      item: [
        { key: "label", kind: "text", max: 30, label: "What it counts", placeholder: "Hoodies you've stolen" },
        { key: "value", kind: "text", max: 24, label: "The number", placeholder: "7 (and counting)" },
      ],
    },
    {
      key: "question", kind: "text", max: 60, label: "The big question", placeholder: "the forever question",
      hint: "Asked in black and white, under a single spotlight.",
      suggestions: ["Will you be my Valentine… for every sequel?", "Will you be my Valentine, forever?", "Will you marry me? 💍"],
    },
    {
      key: "noTakes", kind: "list", maxItems: 6, itemMax: 50, label: "The director's line for each “No” take",
      hint: "Each No gets a clapperboard and the next line. After the last one, No gives up and turns into a second YES.",
      itemPlaceholder: ["CUT! Take 2. With feeling this time.", "Take 3. The director is very patient.", "Take 4. We have all night.", "Take 5. Craft services is out of snacks."],
      addLabel: "+ add a take",
    },
    { key: "datePlan", kind: "text", max: 80, label: "Post-credits: the plan", placeholder: "Saturday · 8 PM · that rooftop place · wear the red one", hint: "The scene after the credits. Optional." },
    { key: "dateOn", kind: "text", max: 10, input: "date", label: "Post-credits: on which day", hint: "Adds “Add to calendar”. We take the time from your plan (“8 PM”), or 7 PM." },
  ],
  demo: {
    ...base.demo,
    letter:
      "Ananya,\n\nIt started with a borrowed pen in a loud canteen. You never gave it back, and somewhere between that pen and your terrible jokes about the sambar, I stopped noticing anyone else in the room.\n---\nNow you're the first person I want to tell everything to, the calm on my loud days and my favourite notification. You steal my hoodies, you finish my fries, and you still somehow make me feel like the luckiest person in every room we walk into.\n---\nI don't know every scene that's coming. But I know who I want in all of them. Every chapter, every sequel, every rerun on a Sunday afternoon. One more thing is coming on the next screen. Watch closely.",
    photos: PHOTOS,
    endLine: "Now showing: forever. 🎬",
    extras: {
      filmTitle: "The One Where I Met You",
      tagline: "Two strangers. One canteen. Every day since.",
      weekLines: [
        "You kept every single petal.",
        "You said yes before I finished asking.",
        "You ate mine too. Obviously.",
        "He has a name now. And my side of the bed.",
        "Still keeping every one of them.",
        "Twenty seconds was not enough.",
        "No comment 😌",
      ],
      metPlace: "College canteen, Pune",
      metDate: "2021-08-09",
      togetherSince: "2022-02-14",
      chapterTitles: ["Then", "Now", "Always"],
      stats: [
        { label: "Hoodies you've stolen", value: "7 (and counting)" },
        { label: "Most-said line", value: "“Did you eat?”" },
        { label: "Our song on repeat", value: "Every road trip" },
      ],
      question: "Will you be my Valentine… for every sequel?",
      noTakes: ["CUT! Take 2. With feeling this time.", "Take 3. The director is very patient.", "Take 4. We have all night.", "Take 5. Craft services is out of snacks."],
      datePlan: "Saturday · 8 PM · that rooftop place · wear the red one",
      dateOn: "",
    },
  },
};
