// happy-hug-day-premium — "The Twenty-Second Hug" (the ✦ Premium twin of happy-hug-day).
//
// research.md §D.6. "Come here." arrives one word at a time; two black-and-white photos of the two of them are
// dragged together across the distance; then the recipient holds their thumb on the screen for twenty seconds while
// the sender's photo blooms from black-and-white into colour outward from their thumb, a heartbeat slows to the
// sender's, the sender's lines fade in, and the song's chorus lands as the last of the colour does. Letting go
// pauses it ("don't let go yet"). After the hug the whole page is in colour: what your hugs feel like (four lines,
// each over a photo, swiped away one by one), the letter, the voice note, and a coupon: "Hug owed: 1. Redeem in
// person." that they tear off. Sensory and soft; no medical claims ("they say…").
//
// Server twin: server/src/config/premiumDays/happy-hug-day-premium.ts (same keys + limits; valentineDays.test.ts
// pins them). `coupons` keeps the $2 key (upgrade path). The chorus second is the shared premium.songDropAt.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import type { LovePhoto } from "../../_love/types";
import { premiumDay } from "./_premium";
import { hugDay } from "./happy-hug-day";

export interface HugExtrasPremium {
  openingLine: string;
  distanceKm: number;
  meetLine: string;
  holdSeconds: number;
  heartbeatBpm: number;
  hugLines: string[];
  hugFeels: string[];
  coupons: { title: string; detail: string }[];
  replyLine: string;
  [k: string]: unknown;
}

// Two quiet sticker spots: this page is carried by photos and type. The ids (and their GIFs on the CDN) are v1's.
const GIFS: GifSlot[] = [
  { id: "ph3-held", label: "Held", moment: "Beside “Hug delivered”, once the photo is in colour", file: "ph3-held.gif", emoji: "🫂", anim: "pulse" },
  { id: "ph6-back", label: "Hug back", moment: "On the corner of the hug coupon", file: "ph6-back.gif", emoji: "🤍", anim: "pulse" },
];

/** research §E (oEmbed 200 + playableInEmbed, 2026-10-09). The first one is the demo song. */
export const HUG_SONGS: readonly SongSuggestion[] = [
  { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran" },
  { id: "acvIVA9-FMQ", title: "Lucky", artist: "Jason Mraz ft. Colbie Caillat" },
  { id: "BSJa1UytM8w", title: "Saiyaara", artist: "Faheem Abdullah · Saiyaara" },
  { id: "RLzC55ai0eo", title: "Heeriye", artist: "Jasleen Royal ft. Arijit Singh" },
  { id: "Q5z6RHIpi2Y", title: "Thinking Out Loud (lyric video)", artist: "Ed Sheeran" },
];
/** The demo song opens on its most-replayed phrase; the hug's drop lands back on it as the photo reaches full colour. */
const DEMO_START = 42;

const A = "https://cdn.subhsandesh.in/gifts-media/assets";
const photo = (path: string, caption: string, note: string, cropY = 45): LovePhoto => ({ url: `${A}/${path}.webp`, caption, note, cropX: 50, cropY, scale: 100 });
const DEMO_PHOTOS: LovePhoto[] = [
  photo("couple4", "the night we counted stars", "You fell asleep on my shoulder at star forty-two. I didn't move for an hour.", 55),
  photo("couple1", "the airport, the first goodbye", "You held on so long the security guy started smiling.", 55),
  photo("couple2", "our first proper date", "You laughed before I finished the joke. I've been showing off ever since.", 40),
  photo("couple3", "Shimla, in the cold", "You put your hands in my jacket pockets. With my hands still in them.", 60),
  photo("Aniversary/aniversary", "one year of us", "Still my favourite place to stand: right next to you."),
  photo("hero-bg", "us, squished", "Best seat in the house.", 40),
];

const base = premiumDay<HugExtrasPremium>(hugDay, {
  slug: "happy-hug-day-premium",
  title: "The Twenty-Second Hug",
  gifSlots: GIFS,
  demoSong: { id: HUG_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    songDropAt: DEMO_START,
    voiceCaption: "Twenty seconds. That's all I'm asking. Okay, maybe forty.",
    psLetter:
      "Open only on a day that's too heavy.\n\nPut your thumb back on the screen and stay as long as you like. I'll be on the other end of it, the way I was at the airport, not letting go first.",
  },
  copy: {
    recipientPlaceholder: "who the hug is for, e.g. Tanvi",
    petNamePlaceholder: "what you call them mid-hug",
    letterPlaceholder: "What you'd say with your arms around them: the bad day you'd hug away, the good day you'd squeeze, the first hug you remember…",
    letterHint: "It unfolds after the hug, on soft paper, in colour.",
    photosHint: "Photo 1 is the one they hold: it blooms from black-and-white into colour under their thumb. Photos 1–2 are the two of you, dragged together; the rest sit under “what your hugs feel like”.",
    captionHint: "caption, e.g. the airport, the first goodbye",
    endLinePlaceholder: "Twenty seconds was never going to be enough.",
    endLineHint: "The last line, under the hug coupon.",
    sheetTitle: "Send a twenty-second hug 🤍",
    sheetSub: "They hold their thumb on the screen for twenty seconds while your photo warms into colour and your song swells. Everything is pre-filled: make it yours.",
    extrasTitle: "The hug",
    extrasSub: "The first words, the distance, the twenty seconds, what your hugs feel like, and the hug you owe them",
    publishing: "Warming it up…",
    storyTitle: "Let's send them a twenty-second hug 🤍",
    replyText: "Hugged you back for twenty seconds. Come redeem the real one 🤍",
    yesChip: "Hugged back 🤍",
  },
  share: { title: "Come here. Someone needs twenty seconds of you 🤍", accent: "#F2A477" },
});

export const hugDayPremium: DayConfig<HugExtrasPremium> = {
  ...base,
  photoAspect: 0.8,
  music: { audioOnly: true, suggestions: HUG_SONGS, suggestionsNote: "hug songs · tap to use", demoStart: DEMO_START },
  extras: [
    {
      key: "openingLine", kind: "text", max: 40, label: "The first words, one at a time",
      placeholder: "e.g. Come here.",
      hint: "Shown one word per screen, big, right after they open it. Then their name. Keep it to two to five words.",
      suggestions: ["Come here.", "Come here, you.", "Hey. Come closer."],
    },
    {
      key: "distanceKm", kind: "number", min: 0, max: 20000, default: 860, step: 10, unit: "km", label: "How far apart you are",
      hint: "Two photos of you start this far apart; they drag them together and it counts down to zero. 0 = “too far”.",
    },
    {
      key: "meetLine", kind: "text", max: 50, label: "When the two photos meet",
      placeholder: "e.g. Close enough. Now hold on.",
      suggestions: ["Close enough. Now hold on.", "There you are.", "Zero. Finally."],
    },
    { key: "holdSeconds", kind: "number", min: 10, max: 30, default: 20, step: 1, unit: "seconds", label: "How long the hug lasts", hint: "They say twenty seconds is the one that counts. Your photo is in full colour when it ends." },
    { key: "heartbeatBpm", kind: "number", min: 50, max: 90, default: 64, step: 1, unit: "bpm", label: "Your resting heartbeat", hint: "The heartbeat under their thumb slows down to yours." },
    {
      key: "hugLines", kind: "list", maxItems: 5, minItems: 2, itemMax: 60, label: "What you'd whisper during the hug",
      hint: "One fades in every few seconds while they hold on. Short, soft, present tense.",
      itemPlaceholder: ["Breathe. I've got you.", "You don't have to be okay right now.", "I'm not letting go first.", "This is my favourite place.", "Stay."],
      addLabel: "+ add a line",
    },
    {
      key: "hugFeels", kind: "list", maxItems: 4, minItems: 2, itemMax: 60, label: "What your hugs feel like",
      hint: "One line over each photo after the hug. They swipe each one away.",
      itemPlaceholder: ["Like coming home with the lights on.", "Like a Sunday that doesn't end.", "Like the cold can't find me.", "Like the whole world got quieter."],
      addLabel: "+ add a line",
    },
    {
      key: "coupons", kind: "objlist", maxItems: 3, minItems: 1, label: "The hug you owe them", itemTitle: "Coupon", addLabel: "+ add a coupon",
      hint: "The last screen is a coupon they tear off and send you to redeem. The first one is on top.",
      item: [
        { key: "title", kind: "text", max: 30, label: "The coupon", placeholder: "One airport hug" },
        { key: "detail", kind: "text", max: 80, label: "Fine print", placeholder: "The first thing I do when I land" },
      ],
    },
    { key: "replyLine", kind: "text", max: 80, label: "Their message when they redeem it", placeholder: "what their WhatsApp says when they tear it off", suggestions: ["Redeeming my hug. Twenty seconds minimum. 🤍"] },
  ],
  theme: {
    bg: "radial-gradient(110% 80% at 50% 30%, #3A2A20 0%, #1E1510 60%, #120C09 100%)",
    base: "#1E1510",
    paper: "#FAF7F2",
    glass: "rgba(250,247,242,0.08)",
    ink: "#FAF7F2",
    inkSoft: "#D9CBB9",
    paperInk: "#4B3426",
    accent: "#F2A477",
    accentDeep: "#C9774A",
    accentInk: "#2A1A10",
    soft: "#EADBC8",
    edge: "rgba(250,247,242,0.18)",
    gold: "#F2C79A",
    dark: true,
    particles: ["🤍", "✨"],
    confetti: ["#F2A477", "#EADBC8", "#FAF7F2", "#C9774A", "#8C8279"],
  },
  demo: {
    ...base.demo,
    recipientName: "Tanvi",
    senderName: "Aarav",
    photos: DEMO_PHOTOS,
    letter:
      "Tanvi,\n\nI wish this page could actually hold you. Since it can't, here is what I'd say with my arms around you: you are my favourite place to be.\n\nOn your bad days, I want to be the hug that makes them smaller. On your good days, I want to be the one squeezing you the tightest, the one you can't get out of even when the chai is getting cold.\n\nEight hundred and sixty kilometres is a stupid number. I check it like a countdown. Every week it's the same number and every week I'm a week closer anyway.\n\nTill I can hug you for real, keep this one. It's warm. I checked.",
    endLine: "Twenty seconds was never going to be enough.",
    extras: {
      openingLine: "Come here.",
      distanceKm: 860,
      meetLine: "Close enough. Now hold on.",
      holdSeconds: 20,
      heartbeatBpm: 64,
      hugLines: ["Breathe. I've got you.", "You don't have to be okay right now.", "I'm not letting go first.", "This is my favourite place."],
      hugFeels: ["Like coming home with the lights on.", "Like a Sunday that doesn't end.", "Like the cold can't find me.", "Like the whole world got quieter."],
      coupons: [
        { title: "Hug owed: 1", detail: "Redeem in person. The first thing I do when I land." },
        { title: "Unlimited back hugs", detail: "Especially while you're cooking." },
      ],
      replyLine: "Redeeming my hug. Twenty seconds minimum. 🤍",
    },
  },
};
