import type { DayConfig, GifSlot } from "../types";
import { MUSIC_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "happy-teddy-day" as const;

export interface TeddyExtras {
  teddyName: string;
  furColor: "honey" | "cocoa" | "pink" | "white" | "lilac";
  marquee: string;
  nearMiss: boolean;
  outfit: { item: string; note: string }[];
  winLine: string;
  squeezeLines: string[];
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "t1-play", label: "Let's play", moment: "The claw machine wakes up", file: "t1-play.gif", emoji: "🕹️", anim: "bounce" },
  { id: "t2-win", label: "You won!", moment: "The teddy pops out", file: "t2-win.gif", emoji: "🧸", anim: "spin" },
  { id: "t3-letter", label: "Letter", moment: "The teddy brings the envelope", file: "t3-letter.gif", emoji: "💌", anim: "wiggle" },
  { id: "t4-photos", label: "Photos", moment: "The cork-board photos", file: "t4-photos.gif", emoji: "📌", anim: "float" },
  { id: "t5-sleep", label: "Keep me close", moment: "The sleepy ending", file: "t5-sleep.gif", emoji: "😴", anim: "pulse" },
];

export const teddyDay: DayConfig<TeddyExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Teddy Catcher",
  maxPhotos: 8,
  letterMax: 1500,
  letterMin: 50,
  asksQuestion: false,
  melody: "arcade",
  photoAspect: 1,
  gifSlots: GIFS,
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
      ],
    },
    { key: "marquee", kind: "text", max: 40, label: "Claw-machine sign", placeholder: "the glowing sign on top", suggestions: ["1 free play for my favourite person", "Insert coin. Win me."] },
    { key: "nearMiss", kind: "bool", default: true, label: "Near-miss drama on the first try", hint: "The claw slips once (gasp), then wins. Turn off for an instant win." },
    {
      key: "outfit", kind: "objlist", maxItems: 4, label: "Dress the teddy", itemTitle: "Accessory", addLabel: "+ add an accessory",
      hint: "Up to 4. Each can carry a little note when they tap it.",
      item: [
        {
          key: "item", kind: "enum", label: "Accessory", display: "chips", default: "bow",
          options: [
            { value: "bow", label: "Bow", emoji: "🎀" },
            { value: "sweater", label: "Heart sweater", emoji: "🧶" },
            { value: "crown", label: "Crown", emoji: "👑" },
            { value: "glasses", label: "Glasses", emoji: "👓" },
            { value: "scarf", label: "Scarf", emoji: "🧣" },
            { value: "flower", label: "Flower", emoji: "🌼" },
            { value: "cap", label: "Cap", emoji: "🧢" },
            { value: "bowtie", label: "Bow tie", emoji: "👔" },
          ],
        },
        { key: "note", kind: "text", max: 60, label: "Note", placeholder: "why it's wearing this — about them" },
      ],
    },
    { key: "winLine", kind: "text", max: 60, label: "When they win", placeholder: "the line when the teddy drops", suggestions: ["You won… me. Again. 🧸"] },
    { key: "squeezeLines", kind: "list", maxItems: 5, itemMax: 70, label: "Squeeze lines", hint: "Pop up each time they squeeze the teddy.", itemPlaceholder: "what the teddy says when squeezed", addLabel: "+ add a line" },
  ],
  theme: {
    bg: "linear-gradient(180deg, #2D2440 0%, #44365F 60%, #5A4677 100%)",
    base: "#2D2440",
    paper: "#FFF8F0",
    glass: "rgba(255,248,240,0.1)",
    ink: "#FFF8F0",
    inkSoft: "#DCCFEC",
    paperInk: "#4A3326",
    accent: "#FF8FB8",
    accentDeep: "#D9628F",
    accentInk: "#3A1F33",
    soft: "#FFE6F0",
    edge: "#EEDFF0",
    gold: "#FFF1B5",
    dark: true,
    particles: ["🧸", "⭐", "💗", "✨"],
    confetti: ["#FF8FB8", "#A8E6CF", "#FFF1B5", "#CDB4DB", "#7FE3FF"],
  },
  demo: {
    recipientName: "Riya",
    senderName: "Aryan",
    petName: "Cutie",
    letter:
      "Dear Riya,\n\nI can't be there to hug you every night, so I'm sending Golu. He's soft, he's a little chubby, and he'll never leave your side — basically me.\n\nJab bhi miss karo, squeeze him tight and know I felt it.\n\nThank you for being my safest place. Teddy Day mubarak, meri jaan.\n\nAlways yours,\nAryan",
    photos: demoPhotos([
      ["our first fair, first teddy", "I spent ₹400 trying to win you a ₹50 teddy. Zero regrets."],
      ["date night, round 1", "You stole my fries and then my heart. In that order."],
      ["that sleepy Sunday", "You fell asleep on my shoulder. My arm is still numb. Worth it."],
      ["us, forever", "Out of every timeline, I'd pick this one."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...MUSIC_DEMO,
    endLine: "Keep him close. He's basically me, but quieter 🧸",
    extras: {
      teddyName: "Golu",
      furColor: "honey",
      marquee: "1 free play for my favourite person",
      nearMiss: true,
      outfit: [
        { item: "bow", note: "Because you tie my whole life together." },
        { item: "crown", note: "Because you rule my heart (and the remote)." },
      ],
      winLine: "You won… me. Again. 🧸",
      squeezeLines: [
        "Squeezed! Ek jaadu ki jhappi delivered.",
        "Miss you more than this teddy is fluffy.",
        "Golu says: Aryan loves you.",
      ],
    },
  },
  copy: {
    recipientPlaceholder: "who wins the teddy — e.g. Riya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "the name you use when you're being soft",
    letterPlaceholder: "Why this teddy is standing in for you — and what they should do with it on the nights you're not there…",
    letterHint: "The teddy carries it in its paws after they win.",
    photosHint: "Your photos get pinned to a cosy cork board.",
    captionHint: "caption — e.g. our first fair",
    noteHint: "the little story behind it…",
    endLinePlaceholder: "Keep him close 🧸",
    endLineHint: "The sleepy last screen.",
    sheetTitle: "Load the claw machine 🧸",
    sheetSub: "Name the teddy, dress it up, write the letter it carries. Everything is pre-filled — make it yours.",
    extrasTitle: "The teddy",
    extrasSub: "Name, fur, outfit and what it says when squeezed",
    publishing: "Fluffing the teddy…",
    storyTitle: "Let's make their teddy 🧸",
    replyText: "I won the teddy 🧸 And honestly, you. Squeezing him right now.",
  },
  share: { title: "Someone left you a teddy 🧸", accent: "#D9628F" },
};
