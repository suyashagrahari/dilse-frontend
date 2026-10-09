// happy-teddy-day-premium — "Adoption Papers" (the ✦ Premium twin of happy-teddy-day).
//
// A parcel tag ("Fragile: contains one (1) hug"), then a real teddy (Fluent 3D art, never a drawing) with a woven
// tag carrying both names. His file follows: their photos as paper-clipped exhibits, satin care labels that flip
// to love notes, the sender's letter folded in three, their voice. Then a beautifully typeset Certificate of
// Adoption that the recipient signs with a finger; they hold to press the seal and, on the song's drop, the gold
// seal embosses and ADOPTED ♥ is stamped on it. The signed certificate is the keepsake.
//
// Keys + limits mirror server/src/config/premiumDays/happy-teddy-day-premium.ts (pinned in valentineDays.test.ts).
// Keys shared with v1/the $2 day keep their key (teddyName, parcelNote, firstWords). The chorus second is the
// shared premium.songDropAt. AI fill: server/src/config/aiFill/happy-teddy-day-premium.ts.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import type { LovePhoto } from "../../_love/types";
import { premiumDay } from "./_premium";
import { teddyDay } from "./happy-teddy-day";

export interface TeddyExtrasPremium {
  teddyName: string;
  parcelNote: string;
  firstWords: string;
  birthPlace: string;
  temperament: string;
  careLines: string[];
  signOff: string;
  [k: string]: unknown;
}

// Two quiet sticker spots: this page is carried by the bear, their photos and type. The ids (and their GIFs on
// the CDN) are v1's, so nothing needs re-uploading.
const GIFS: GifSlot[] = [
  { id: "pt3-alive", label: "Hello", moment: "Beside the teddy when they meet him", file: "pt3-alive.gif", emoji: "🧸", anim: "wiggle" },
  { id: "pt6-sleep", label: "Keepsake", moment: "On the corner of the signed certificate", file: "pt6-sleep.gif", emoji: "😴", anim: "pulse" },
];

/** research §E (oEmbed 200 + playableInEmbed, 2026-10-09). The first one is the demo song. */
export const PAPERS_SONGS: readonly SongSuggestion[] = [
  { id: "AWGqoCNbsvM", title: "Bubbly", artist: "Colbie Caillat" },
  { id: "EkHTsc9PU2A", title: "I'm Yours", artist: "Jason Mraz" },
  { id: "Ov0YGGSY6gY", title: "Kaun Tujhe", artist: "Palak Muchhal · M.S. Dhoni" },
  { id: "ilNt2bikxDI", title: "Jo Tum Mere Ho", artist: "Anuv Jain" },
];
/** The demo song starts on its most-replayed phrase; the drop lands back on it as the seal presses. */
const DEMO_START = 29;

const A = "https://cdn.subhsandesh.in/gifts-media/assets";
const photo = (path: string, caption: string, cropY = 45): LovePhoto => ({ url: `${A}/${path}.webp`, caption, note: "", cropX: 50, cropY, scale: 100 });
const DEMO_PHOTOS: LovePhoto[] = [
  photo("couple1", "the evening you said yes to coffee", 55),
  photo("couple2", "our first proper date", 40),
  photo("couple3", "Shimla, and the cold you blamed on me", 60),
  photo("couple4", "the night we counted stars", 55),
  photo("Aniversary/aniversary", "one whole year of us"),
  photo("hero-bg", "us, always", 40),
];

export const DEFAULT_CARE_LINES = [
  "Hug daily. Twice on Mondays.",
  "Not to be left alone on long-distance nights.",
  "Responds to forehead kisses.",
  "If you're sad, squeeze firmly. Repeat as needed.",
  "Do not lend to anyone. He's very particular, like me.",
];

const base = premiumDay<TeddyExtrasPremium>(teddyDay, {
  slug: "happy-teddy-day-premium",
  title: "Adoption Papers",
  gifSlots: GIFS,
  demoSong: { id: PAPERS_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    songDropAt: DEMO_START,
    voiceCaption: "Hold him while you play this. It's the closest I can get tonight.",
    psLetter:
      "Open only on a night you can't sleep.\n\nSqueeze him twice. The second one is from me. I asked him to keep the left side of the bed warm until I'm back.",
  },
  copy: {
    letterPlaceholder: "What he should know about them, and what you'd say if you could tuck them in tonight…",
    letterHint: "Folded in three and tucked into the teddy's file. It unfolds just before they sign the adoption papers.",
    photosHint: "Your photos are clipped into his file as 'the family' (the first six). Captions print under each one.",
    captionHint: "caption, e.g. Shimla, and the cold you blamed on me",
    endLinePlaceholder: "He's yours now. So am I.",
    endLineHint: "The last line, over the signed certificate.",
    sheetTitle: "Write their teddy's adoption papers 🧸",
    sheetSub: "A real teddy arrives with a file: your photos, his care instructions, your letter. They sign the certificate and the seal presses on your song. Everything is pre-filled: make it yours.",
    extrasTitle: "The teddy's file",
    extrasSub: "His name, where he's from, his temperament and how to look after him",
    publishing: "Filing the papers…",
    storyTitle: "Let's write their teddy's adoption papers 🧸",
    replyText: "I signed the adoption papers 🥹🧸",
  },
  share: { title: "A parcel for you. Fragile: contains one (1) hug 🧸", accent: "#C58B4B" },
});

export const teddyDayPremium: DayConfig<TeddyExtrasPremium> = {
  ...base,
  photoAspect: 0.8,
  music: { audioOnly: true, suggestions: PAPERS_SONGS, suggestionsNote: "sweet & cosy · tap to use", demoStart: DEMO_START },
  theme: {
    bg: "radial-gradient(90% 60% at 50% 35%, #3A2418 0%, #1E120C 55%, #140B07 100%)",
    base: "#140B07",
    paper: "#F5EEE2",
    glass: "rgba(245,238,226,0.08)",
    ink: "#F5EEE2",
    inkSoft: "#E6D6C2",
    paperInk: "#3A2418",
    accent: "#C58B4B",
    accentDeep: "#8A5E22",
    accentInk: "#1E120C",
    soft: "#3A2418",
    edge: "rgba(245,238,226,0.18)",
    gold: "#E9C08A",
    dark: true,
    particles: ["🧸", "🤎", "✨"],
    confetti: ["#B23A3A", "#C58B4B", "#EFE6D8", "#BFD3E0", "#E9C08A"],
  },
  extras: [
    { key: "teddyName", kind: "text", max: 20, label: "Teddy's name", placeholder: "an inside joke works best, e.g. Golu", suggestions: ["Golu", "Mishti", "Bhalu", "Chiku"], hint: "Printed on his woven tag and on the adoption certificate." },
    {
      key: "parcelNote", kind: "text", max: 60, label: "The parcel tag",
      placeholder: "the line on the tag they see first",
      hint: "The first thing they read, on a manila tag, before they untie the string.",
      suggestions: ["Contains one (1) hug.", "Warning: may cause smiling.", "Return to sender: never."],
    },
    { key: "firstWords", kind: "text", max: 50, label: "His first words", placeholder: "e.g. Hi Riya! Aryan sent me. I'm yours now.", hint: "What he says when they squeeze him the first time." },
    { key: "birthPlace", kind: "text", max: 40, label: "Place of birth", placeholder: "e.g. Aryan's hoodie pocket, Pune", hint: "On the certificate. Somewhere that's yours." },
    { key: "temperament", kind: "text", max: 40, label: "Temperament", placeholder: "e.g. Clingy. Extremely huggable.", hint: "On the certificate, like an official record." },
    {
      key: "careLines", kind: "list", maxItems: 5, minItems: 3, itemMax: 70, label: "Care instructions",
      hint: "Each one is a satin care label they flip over. Love notes disguised as instructions.",
      itemPlaceholder: ["e.g. Hug daily. Twice on Mondays.", "e.g. Responds to forehead kisses.", "e.g. Not to be left alone on long-distance nights."],
      addLabel: "+ add a label",
    },
    { key: "signOff", kind: "text", max: 40, label: "Sign-off", placeholder: "how you end every text to them, e.g. Always yours, Aryan" },
  ],
  demo: {
    ...base.demo,
    recipientName: "Riya",
    senderName: "Aryan",
    photos: DEMO_PHOTOS,
    letter:
      "Riya,\n\nI know you said you're too old for teddy bears. I also know you still sleep with the sleeve of my hoodie, so I'm not taking that seriously.\n\nGolu is for the nights I can't be there. The long ones, when the call drops at 1 a.m. and you pretend you're not sad. He's been briefed. He knows you like the left side of the bed, that you need exactly one more hug than you ask for, and that you pretend to hate forehead kisses.\n\nHe isn't me. But he's soft, he's patient, and he will never once steal the blanket, which already makes him better than me at one thing.\n\nTake care of him. He'll take care of you. And when I'm back, he'll have to share.",
    endLine: "He's yours now. So am I.",
    extras: {
      teddyName: "Golu",
      parcelNote: "Contains one (1) hug.",
      firstWords: "Hi Riya! Aryan sent me. I'm yours now.",
      birthPlace: "Aryan's hoodie pocket, Pune",
      temperament: "Clingy. Extremely huggable.",
      careLines: DEFAULT_CARE_LINES,
      signOff: "Always yours, Aryan",
    },
  },
};
