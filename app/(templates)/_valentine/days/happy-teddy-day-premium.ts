// happy-teddy-day-premium — "The Teddy House" (the ✦ Premium twin of happy-teddy-day).
//
// Research §D4 ("Teddy Ghar"), improved: a bright honey-and-pink dollhouse where her teddy moves in, one cosy room
// per scene, and a GIF sticker reacting in every one of them.
//   gate      the doorstep: a wiggly delivery box "FRAGILE: 1 cuddly teddy for Riya"; tap it, the lid pops and a
//             sleepy teddy pops out (the song starts)
//   heart     the nursery: rub a little heart warm, make a wish, tuck it into his chest; he wakes up, waves, says
//             his first words, and she names him (the name tag stitches on)
//   dress     the wardrobe: put a bow, a crown, heart glasses… on him; each one boings on with the sender's note
//   squeeze   the sofa: "he's shy, give him a squeeze"; every squeeze makes him say the next bit of the letter
//   album     the living room: he holds their photos one by one (swipe), each with a sticker caption
//   snack     the kitchen: catch the cookies and honey falling into his bowl; each few unlock a house rule
//   call      the hallway: his toy phone rings, and it's the sender's voice
//   bedtime   the bedroom: pull the blanket up, the lights dim, stars come out, "goodnight"; a note under his pillow
//   question  the next morning: "Will you keep him forever?" YES on the song's drop: teddies of every size rain down
//             and pile into a heart around her photo while her named teddy waves from the middle
//   ending    the Adoption Certificate keepsake (9:16 story / 4:5 post), "Send him a hug back", replay
// Server twin: server/src/config/premiumDays/happy-teddy-day-premium.ts (same keys + limits;
// valentineDays.test.ts pins them). teddyName, parcelNote, firstWords, birthPlace, temperament, careLines and
// signOff keep v2's keys; outfit keeps the $2 day's key and shape so an upgrade carries it over.

import type { SongSuggestion } from "../music/youtube";
import type { DayConfig, GifSlot } from "../types";
import { demoPhotos } from "./_shared";
import { premiumDay } from "./_premium";
import { teddyDay } from "./happy-teddy-day";

export type TeddyItem = "bow" | "sweater" | "crown" | "glasses" | "scarf" | "flower" | "cap" | "bowtie";

export interface TeddyOutfitPiece {
  item: TeddyItem;
  note: string;
}

export interface TeddyExtrasPremium {
  teddyName: string;
  parcelNote: string;
  firstWords: string;
  outfit: TeddyOutfitPiece[];
  careLines: string[];
  birthPlace: string;
  temperament: string;
  signOff: string;
  question: string;
  yesLine: string;
  [k: string]: unknown;
}

/**
 * Sweet and bouncy first (each id: YouTube oEmbed 200 + playableInEmbed, 2026-10-09). The first one is the demo
 * song: "Bubbly" from DEMO_START, its most-replayed stretch (27–35 s, "every time I see your bubbly face"); the
 * YES drops back onto it.
 */
export const TEDDY_HOUSE_SONGS: readonly SongSuggestion[] = [
  { id: "AWGqoCNbsvM", title: "Bubbly", artist: "Colbie Caillat" },
  { id: "acvIVA9-FMQ", title: "Lucky", artist: "Jason Mraz & Colbie Caillat" },
  { id: "EkHTsc9PU2A", title: "I'm Yours", artist: "Jason Mraz" },
  { id: "Ov0YGGSY6gY", title: "Kaun Tujhe", artist: "Palak Muchhal · M.S. Dhoni" },
  { id: "ilNt2bikxDI", title: "Jo Tum Mere Ho", artist: "Anuv Jain" },
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
];
const DEMO_START = 27;
const DEMO_DROP = 29;

// Six sticker slots, each defaulting to a real GIF from the premium library
// (gifts-media/templates/_premium/gifs/…). `file` is relative to the template's own media folder, so
// "../_premium/…" resolves to the shared one (browsers normalise the dot segment before the request).
const G = (path: string) => `../_premium/gifs/${path}.webp`;
const GIFS: GifSlot[] = [
  { id: "td1-hello", label: "Special delivery", moment: "Waves next to the delivery box at the start", file: G("teddy-day/happy-teddy-day-bear"), emoji: "🧸", anim: "wiggle" },
  { id: "td2-heart", label: "He's awake", moment: "Cheers when he gets his heart", file: G("teddy-day/teddy-red-heart"), emoji: "💗", anim: "bounce" },
  { id: "td3-dress", label: "Looking cute", moment: "Poses while you dress him up", file: G("teddy-day/teddy-cool-heart"), emoji: "😎", anim: "wiggle" },
  { id: "td4-squeeze", label: "Squeeze", moment: "Cuddles while he reads your letter", file: G("teddy-day/bears-pink-cuddle"), emoji: "🤗", anim: "pulse" },
  { id: "td5-sleep", label: "Goodnight", moment: "Snuggles when he's tucked in", file: G("promise-day/bears-cuddle-promise"), emoji: "😴", anim: "float" },
  { id: "td6-yes", label: "After the YES", moment: "Celebrates when they say yes", file: G("teddy-day/teddy-yes-heart-eyes"), emoji: "🥰", anim: "pulse" },
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
  title: "The Teddy House",
  gifSlots: GIFS,
  demoSong: { id: TEDDY_HOUSE_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    songDropAt: DEMO_DROP,
    voiceCaption: "Hold him while you play this. It's the closest I can get tonight.",
    psLetter:
      "P.S. Squeeze him twice before you sleep. The second one is from me. I asked him to keep the left side of the bed warm until I'm back.",
  },
  copy: {
    recipientPlaceholder: "who the teddy is for, e.g. Riya",
    letterPlaceholder:
      "What the teddy says when they squeeze him: why he's standing in for you, what he should do on the nights you're not there…",
    letterHint: "Every squeeze makes the teddy say the next bit, in little speech bubbles. Short paragraphs read best.",
    photosHint:
      "Your first photo is the big one: the teddies pile into a heart around it when they say yes, and it's on the adoption certificate. The teddy holds the rest up one by one in his photo album.",
    captionHint: "a short sticker caption, e.g. our first fair",
    endLinePlaceholder: "He's yours now. So am I. 🧸",
    endLineHint: "The last line, over the adoption certificate.",
    sheetTitle: "Get the Teddy House ready 🧸",
    sheetSub:
      "Name the teddy, pick his outfit, write his house rules and the letter he says when squeezed. Everything is pre-filled, so make it yours.",
    extrasTitle: "The teddy",
    extrasSub: "His name, the delivery box, his outfit, his house rules, the certificate and the question",
    publishing: "Fluffing the teddy…",
    storyTitle: "Let's get their Teddy House ready 🧸",
    replyText: "I'm keeping him forever 🧸 And you.",
    yesChip: "Adopted a teddy in The Teddy House 🧸",
  },
  share: { title: "Special delivery 🧸 A cuddly teddy is waiting for you", accent: "#E0607E" },
});

export const teddyDayPremium: DayConfig<TeddyExtrasPremium> = {
  ...base,
  // Like its $2 base (valentineDays.test.ts pins twins to their base); the YES still reaches the sender as react("answered").
  asksQuestion: false,
  photoAspect: 0.8,
  music: {
    audioOnly: true,
    suggestions: TEDDY_HOUSE_SONGS,
    suggestionsNote: "sweet & cosy · tap to use",
    demoStart: DEMO_START,
  },
  extras: [
    {
      key: "teddyName", kind: "text", max: 20, label: "Teddy's name",
      placeholder: "an inside joke works best, e.g. Golu",
      hint: "They can keep it or pick another one when he wakes up. It goes on his name tag and the certificate.",
      suggestions: ["Golu", "Mr. Cuddles", "Bhalu", "Honey"],
    },
    {
      key: "parcelNote", kind: "text", max: 60, label: "On the delivery box",
      placeholder: "the line they read before they open it",
      hint: "Handwritten on the box's label, under “Fragile: 1 cuddly teddy for…”.",
      suggestions: ["Contains one (1) hug. Handle with love.", "Warning: may cause smiling.", "Return to sender: never."],
    },
    {
      key: "firstWords", kind: "text", max: 50, label: "His first words",
      placeholder: "e.g. Hi Riya! Aryan sent me. I'm yours now.",
      hint: "What he says when he wakes up with his new heart.",
    },
    {
      key: "outfit", kind: "objlist", maxItems: 4, label: "His outfit", itemTitle: "Accessory", addLabel: "+ add an accessory",
      hint: "Up to 4. They dress him up, and each one pops your note when it goes on.",
      item: [
        {
          key: "item", kind: "enum", label: "Accessory", display: "chips", default: "bow",
          options: [
            { value: "bow", label: "Bow", emoji: "🎀" },
            { value: "sweater", label: "Heart sweater", emoji: "🧶" },
            { value: "crown", label: "Crown", emoji: "👑" },
            { value: "glasses", label: "Heart glasses", emoji: "🕶️" },
            { value: "scarf", label: "Scarf", emoji: "🧣" },
            { value: "flower", label: "Flower", emoji: "🌼" },
            { value: "cap", label: "Cap", emoji: "🧢" },
            { value: "bowtie", label: "Bow tie", emoji: "🎀" },
          ],
        },
        { key: "note", kind: "text", max: 60, label: "Note", placeholder: "why he's wearing it, about them" },
      ],
    },
    {
      key: "careLines", kind: "list", maxItems: 5, minItems: 3, itemMax: 70, label: "House rules",
      hint: "They feed him cookies in the kitchen; every few unlock one rule on the fridge. Love notes disguised as rules.",
      itemPlaceholder: ["e.g. Hug daily. Twice on Mondays.", "e.g. Responds to forehead kisses.", "e.g. Not to be left alone on long-distance nights."],
      addLabel: "+ add a rule",
    },
    { key: "birthPlace", kind: "text", max: 40, label: "Place of birth", placeholder: "e.g. Aryan's hoodie pocket, Pune", hint: "On the adoption certificate. Somewhere that's yours." },
    { key: "temperament", kind: "text", max: 40, label: "Temperament", placeholder: "e.g. Clingy. Extremely huggable.", hint: "On the adoption certificate." },
    { key: "signOff", kind: "text", max: 40, label: "Sign-off", placeholder: "how you end every text, e.g. Always yours, Aryan", hint: "Under the letter." },
    {
      key: "question", kind: "text", max: 60, label: "The question",
      placeholder: "e.g. Will you keep him forever? (Me too?)",
      hint: "He asks it the next morning, holding your first photo.",
      suggestions: ["Will you keep him forever? (Me too?)", "Will you be his forever home?", "Will you keep us both, forever?"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "After they say yes",
      placeholder: "what you'd say back",
      suggestions: ["Best adoption ever. He's yours, and so am I. 🧸"],
    },
  ],
  theme: {
    bg: "linear-gradient(170deg, #FFF6E5 0%, #FFEFE6 50%, #FFE3EC 100%)",
    base: "#FFF6E5",
    paper: "#FFFDF8",
    glass: "rgba(255,255,255,0.6)",
    ink: "#5A3A1E",
    inkSoft: "#8A6248",
    paperInk: "#5A3A1E",
    accent: "#FF7FA3",
    accentDeep: "#E0607E",
    accentInk: "#FFFFFF",
    soft: "#FFD9E4",
    edge: "#F2D3B8",
    gold: "#F2B36B",
    dark: false,
    particles: ["🧸", "💗", "✨", "🍯"],
    confetti: ["#FF8FAB", "#F2B36B", "#FFD9E4", "#BDEBD6", "#FFE27A"],
  },
  demo: {
    ...base.demo,
    recipientName: "Riya",
    senderName: "Aryan",
    petName: "Cutie",
    letter:
      "I know you said you're too old for teddy bears. I also know you still sleep with the sleeve of my hoodie, so I'm not taking that seriously.\n\nGolu is for the nights I can't be there. The long ones, when the call drops at 1 a.m. and you pretend you're not sad.\n\nHe's been briefed. He knows you like the left side of the bed, and that you need exactly one more hug than you ask for.\n\nHe isn't me. But he's soft, he's patient, and he will never steal the blanket, which already makes him better than me at one thing.\n\nTake care of him. He'll take care of you. And when I'm back, he'll have to share.",
    photos: demoPhotos([
      ["us, always", "My favourite place is next to you."],
      ["our first fair", "I spent ₹400 trying to win you a ₹50 teddy. Zero regrets."],
      ["date night", "You stole my fries and then my heart. In that order."],
      ["sleepy Sunday", "You fell asleep on my shoulder. My arm is still numb. Worth it."],
    ]),
    endLine: "He's yours now. So am I. 🧸",
    extras: {
      teddyName: "Golu",
      parcelNote: "Contains one (1) hug. Handle with love.",
      firstWords: "Hi Riya! Aryan sent me. I'm yours now.",
      outfit: [
        { item: "bow", note: "Because you tie my whole life together." },
        { item: "glasses", note: "Because you're too cool for me, and I don't care." },
        { item: "crown", note: "Because you rule my heart (and the remote)." },
      ],
      careLines: DEFAULT_CARE_LINES,
      birthPlace: "Aryan's hoodie pocket, Pune",
      temperament: "Clingy. Extremely huggable.",
      signOff: "Always yours, Aryan",
      question: "Will you keep him forever? (Me too?)",
      yesLine: "Best adoption ever. He's yours, and so am I. 🧸",
    },
  },
};
