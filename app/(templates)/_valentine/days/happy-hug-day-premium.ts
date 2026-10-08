// happy-hug-day-premium — "Hold Me for 20 Seconds" (the ✦ Premium twin of happy-hug-day).
//
// The closest a phone can get to being held: wipe a frosted window to find
// their name, drag two tiny figures together across the snow, then hold the
// phone with both thumbs for twenty seconds while two heat silhouettes melt
// into one, a heartbeat slows and the sender's lines fade in breath by breath
// (the song's drop lands on "Hug delivered"). Then mittens to rub warm for
// bad days, a hoodie to unzip for the letter, a blanket fort of photos with a
// heartbeat-sync game, and a hug back. Sensory and soft — no medical claims.
// Server twin: server/src/config/premiumDays/happy-hug-day-premium.ts (same
// keys + limits; valentineDays.test.ts pins them). `coupons` keeps the $2 key.

import type { DayConfig, GifSlot } from "../types";
import { demoPhotos } from "./_shared";
import { premiumDay } from "./_premium";
import { hugDay } from "./happy-hug-day";
import { KISS_PREMIUM_SONGS } from "./happy-kiss-day-premium";

export interface HugExtrasPremium {
  frostLine: string;
  distanceKm: number;
  holdSeconds: number;
  heartbeatBpm: number;
  hugLines: string[];
  weatherHugs: { when: string; note: string }[];
  coupons: { title: string; detail: string }[];
  hoodieTag: string;
  replyLine: string;
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "ph1-window", label: "Cold", moment: "Peeking at the frosted window's corner", file: "ph1-window.gif", emoji: "🥶", anim: "wiggle" },
  { id: "ph2-walk", label: "Running", moment: "Over the snow field as the two of you meet", file: "ph2-walk.gif", emoji: "🏃", anim: "bounce" },
  { id: "ph3-held", label: "Held", moment: "After “Hug delivered”", file: "ph3-held.gif", emoji: "🫂", anim: "pulse" },
  { id: "ph4-mitten", label: "Cosy", moment: "Beside the mitten pockets", file: "ph4-mitten.gif", emoji: "🧤", anim: "float" },
  { id: "ph5-fort", label: "Fort", moment: "Peeking from the blanket fort", file: "ph5-fort.gif", emoji: "🛌", anim: "float" },
  { id: "ph6-back", label: "Hug back", moment: "Finale — hug them back", file: "ph6-back.gif", emoji: "🤍", anim: "pulse" },
];

const base = premiumDay<HugExtrasPremium>(hugDay, {
  slug: "happy-hug-day-premium",
  title: "Hold Me for 20 Seconds",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "Twenty seconds. That's all I'm asking. Okay, maybe forty.",
    psLetter: "Open only on a bad day.\n\nThis one counts as a hug. Put your thumbs on the screen, breathe out, and stay as long as you like. I'm not going anywhere.",
  },
  copy: {
    recipientPlaceholder: "who needs the hug — e.g. Tanvi",
    petNamePlaceholder: "what you call them mid-hug",
    letterPlaceholder: "Written inside a hoodie they unzip: what you'd say with your arms around them — the bad day you'd hug away, the good day you'd squeeze…",
    letterHint: "Written on the soft lining of a hoodie. They unzip it, tooth by tooth, to read it.",
    photosHint: "Your photos are sewn into a quilt over a blanket fort, then lit up one by one inside it.",
    captionHint: "the stitched label — e.g. airport goodbye",
    endLinePlaceholder: "Twenty seconds was never going to be enough. 🤍",
    endLineHint: "The last line, on their hug certificate.",
    sheetTitle: "Hold them for 20 seconds 🤍",
    sheetSub: "The frosted window, how far apart you are, the lines they'll read while you hold them, and hugs saved for bad days.",
    extrasTitle: "The hug",
    extrasSub: "The window, the distance, the 20-second hold, mittens for bad days, the hoodie, hug passes",
    publishing: "Warming it up…",
    storyTitle: "Let's send them a 20-second hug 🤍",
    replyText: "Hugged you back for 20 seconds. Come home soon 🤍",
    yesChip: "Hugged back 🤍",
  },
  share: { title: "Someone needs 20 seconds of you 🤍", accent: "#D9367A" },
});

export const hugDayPremium: DayConfig<HugExtrasPremium> = {
  ...base,
  photoAspect: 1,
  music: { audioOnly: true, suggestions: KISS_PREMIUM_SONGS, suggestionsNote: "romantic favourites · tap to use" },
  extras: [
    {
      key: "frostLine", kind: "text", max: 50, label: "Written behind the frost",
      placeholder: "what they find when they wipe the window",
      hint: "Their name appears with this line behind a frosted window they wipe clean.",
      suggestions: ["Come here, you.", "Cold out there? Come in.", "I've been waiting for you."],
    },
    {
      key: "distanceKm", kind: "number", min: 0, max: 20000, default: 860, step: 10, unit: "km", label: "How far apart you are",
      hint: "The two of you stand this far apart in the snow; they drag you together. 0 = “too far”.",
    },
    { key: "holdSeconds", kind: "number", min: 10, max: 30, default: 20, step: 1, unit: "seconds", label: "How long the hug lasts", hint: "Twenty is the famous one. Long enough to feel it." },
    { key: "heartbeatBpm", kind: "number", min: 50, max: 90, default: 64, step: 1, unit: "bpm", label: "Your resting heartbeat", hint: "The heartbeat they feel during the hug slows down to yours." },
    {
      key: "hugLines", kind: "list", maxItems: 5, minItems: 2, itemMax: 60, label: "Lines that appear during the hug",
      hint: "One fades in every few seconds while they hold on. Soft, present-tense.",
      itemPlaceholder: ["Breathe. I've got you.", "You don't have to be okay right now.", "I'm not letting go yet.", "This is my favourite place.", "Stay."],
      addLabel: "+ add a line",
    },
    {
      key: "weatherHugs", kind: "objlist", maxItems: 6, minItems: 3, label: "Hugs for every weather", itemTitle: "Mitten", addLabel: "+ add a mitten",
      hint: "Knitted mittens they rub warm to open — notes saved for real bad days.",
      item: [
        { key: "when", kind: "text", max: 28, label: "On the mitten", placeholder: "For exam nights" },
        { key: "note", kind: "text", max: 120, label: "The note inside", placeholder: "what you'd say to them on that day" },
      ],
    },
    {
      key: "coupons", kind: "objlist", maxItems: 4, minItems: 2, label: "Hug passes", itemTitle: "Pass", addLabel: "+ add a pass",
      hint: "They tear one off at the end and send it to you on WhatsApp to redeem.",
      item: [
        { key: "title", kind: "text", max: 30, label: "The pass", placeholder: "One airport hug" },
        { key: "detail", kind: "text", max: 80, label: "Fine print", placeholder: "The first thing I do when I land" },
      ],
    },
    { key: "hoodieTag", kind: "text", max: 24, label: "Label stitched on the hoodie", placeholder: "the tag inside the collar", suggestions: ["Property of us", "Size: one hug", "Return to me"] },
    { key: "replyLine", kind: "text", max: 80, label: "Their WhatsApp reply", placeholder: "what their hug-back message says", suggestions: ["Hugged you back for 20 seconds. Come home soon 🤍"] },
  ],
  theme: {
    bg: "radial-gradient(120% 80% at 50% 0%, #2B3560 0%, #1B2340 55%, #121830 100%)",
    base: "#1B2340",
    paper: "#F4EBDD",
    glass: "rgba(220,232,242,0.10)",
    ink: "#F4EBDD",
    inkSoft: "#B9C3DA",
    paperInk: "#4A2C2A",
    accent: "#FF8A3D",
    accentDeep: "#C2410C",
    accentInk: "#2A1408",
    soft: "#FFE3CC",
    edge: "#DCE8F2",
    gold: "#FFE08A",
    dark: true,
    particles: ["🤍", "❄️", "✨", "🧶"],
    confetti: ["#FF8A3D", "#D9367A", "#FFE08A", "#DCE8F2", "#F4EBDD"],
  },
  demo: {
    ...base.demo,
    letter:
      "I wish this page could actually hold you. Since it can't, here's what I'd say with my arms around you: you're my favourite place to be.\n\nOn your bad days, I want to be the hug that makes them smaller. On your good days, I want to be the one squeezing you the tightest.\n\nEight hundred and sixty kilometres is a stupid number. I'm counting down to zero.\n\nTill I can hug you for real, keep this one. It's warm, I checked.",
    photos: demoPhotos([
      ["our first hug 🤗", "It lasted eleven seconds. I counted. I wanted twelve."],
      ["airport goodbye", "You held on so long the security guy started smiling."],
      ["hoodie thief", "It looks better on you. Keep it. Fine. Keep it."],
      ["us, squished", "Best seat in the house."],
    ]),
    endLine: "Twenty seconds was never going to be enough. 🤍",
    extras: {
      frostLine: "Come here, you.",
      distanceKm: 860,
      holdSeconds: 20,
      heartbeatBpm: 64,
      hugLines: ["Breathe. I've got you.", "You don't have to be okay right now.", "I'm not letting go yet.", "This is my favourite place."],
      weatherHugs: [
        { when: "For exam nights", note: "You've studied enough. Sleep. I'm proud of you either way." },
        { when: "For when you miss home", note: "Call your mum, then call me. I'll stay on till you fall asleep." },
        { when: "For bad Mondays", note: "One coffee on me, one hug on account." },
      ],
      coupons: [
        { title: "One airport hug", detail: "The first thing I do when I land" },
        { title: "Unlimited back hugs", detail: "Especially while you cook" },
      ],
      hoodieTag: "Property of us",
      replyLine: "Hugged you back for 20 seconds. Come home soon 🤍",
    },
  },
};
