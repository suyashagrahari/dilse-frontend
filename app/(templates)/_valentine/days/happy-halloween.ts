// ─── Happy Halloween — "The Little Haunted House" ────────────────────────────
//
// The ninth template on the Valentine engine, and the first one that is an
// occasion rather than a day of Valentine's week. All copy is English.
// Server twin: server/src/config/valentineDays.ts ("happy-halloween"); keys and
// limits must match (valentineDays.test.ts pins them).

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { templateMedia } from "@/lib/templateMedia";
import { TRACK_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "happy-halloween" as const;

export type HalloweenTone = "romantic" | "friends" | "family" | "kids";
export type HalloweenCostume = "ghost" | "witch" | "vampire" | "pumpkin" | "black-cat" | "skeleton" | "mummy" | "bat";

export interface HalloweenExtras {
  tone: HalloweenTone;
  houseName: string;
  trickLine: string;
  carveWord: string;
  costume: HalloweenCostume;
  costumeWhy: string;
  ingredients: { name: string; line: string }[];
  potionSpell: string;
  question: string;
  yesLine: string;
  [k: string]: unknown;
}

/**
 * What the tone changes when the sender leaves a field empty: the question,
 * the Boo License's title, the ghost-No's lines and the WhatsApp reply.
 * `kids` also turns off the blackout and the running No.
 */
export const HALLOWEEN_TONES: Record<
  HalloweenTone,
  { question: string; license: (sender: string) => string; yes: string; reply: string; noLines: readonly string[]; gentle: boolean }
> = {
  romantic: {
    question: "Will you be my boo? 👻",
    license: (s) => `Official Boo of ${s || "someone who adores you"}`,
    yes: "Yes, I'm your boo 💜",
    reply: "I said YES to being your boo 🎃 (the No button ghosted me, by the way)",
    noLines: ["boo… I mean, no?", "*fades dramatically*", "you can't catch a ghost", "too spooky, try YES", "I'm just a sheet now"],
    gentle: false,
  },
  friends: {
    question: "Will you be my boo-st friend forever? 🦇",
    license: () => "Certified Bestie-Ghoul",
    yes: "Bestie-ghoul for life 🦇",
    reply: "YES, boo-st friends forever 🦇 Now you owe me candy.",
    noLines: ["boo… I mean, no?", "*vanishes*", "nice try, bestie", "ghosts don't do no", "I'm see-through, sorry"],
    gentle: false,
  },
  family: {
    question: "Will you be my favourite little pumpkin? 🎃",
    license: () => "Family Pumpkin Patch, est. forever",
    yes: "Yes, I'm your pumpkin 🎃",
    reply: "YES, I'm your favourite little pumpkin 🎃 Happy Halloween!",
    noLines: ["boo… I mean, no?", "*floats away*", "pumpkins can't say no", "try the orange one", "I'm only a little ghost"],
    gentle: false,
  },
  kids: {
    question: "Ready for a spooky-sweet adventure? 🍭",
    license: () => "Official Little Monster",
    yes: "Yes, let's go! 🍭",
    reply: "YES! I finished the haunted house 🍭 Happy Halloween!",
    noLines: ["maybe later?"],
    gentle: true,
  },
};

/** Costume frames on the Boo License (art in happy-halloween/components/halloween/art.tsx). */
export const HALLOWEEN_COSTUMES: Record<HalloweenCostume, { label: string; emoji: string }> = {
  ghost: { label: "Ghost", emoji: "👻" },
  witch: { label: "Witch", emoji: "🧙" },
  vampire: { label: "Vampire", emoji: "🧛" },
  pumpkin: { label: "Pumpkin", emoji: "🎃" },
  "black-cat": { label: "Black cat", emoji: "🐈‍⬛" },
  skeleton: { label: "Skeleton", emoji: "🦴" },
  mummy: { label: "Mummy", emoji: "🧻" },
  bat: { label: "Bat", emoji: "🦇" },
};

/**
 * One-tap Halloween songs. Official uploads (artist, label or VEVO channel),
 * every id checked against YouTube's oEmbed on 2026-10-08. Audio only: the
 * video never shows (music.audioOnly below).
 */
export const HALLOWEEN_SONGS: readonly SongSuggestion[] = [
  { id: "ZVuToMilP0A", title: "This Is Halloween", artist: "The Nightmare Before Christmas" },
  { id: "NSqkvsOv3VA", title: "Monster Mash", artist: "Bobby “Boris” Pickett" },
  { id: "WCjzNfJLHa0", title: "I Put a Spell on You", artist: "Nina Simone" },
  { id: "sOnqjkJTMaA", title: "Thriller", artist: "Michael Jackson" },
  { id: "v45YO1zepHg", title: "Spooky, Scary Skeletons", artist: "Andrew Gold" },
  { id: "7YvAYIJSSZY", title: "Somebody's Watching Me", artist: "Rockwell" },
  { id: "Fe93CLbHjxQ", title: "Ghostbusters", artist: "Ray Parker Jr." },
  { id: "fb0KjR4bik8", title: "Love Potion No. 9", artist: "The Searchers" },
];

/** Both Halloween templates' default background music (music mode "track"); the songs above stay as alternatives. */
export const HALLOWEEN_TRACK = {
  url: templateMedia("_halloween", "haunted-piano-loop.mp3"),
  title: "Haunted Piano",
  artist: "Boo-tiful Night",
} as const;

const GIFS: GifSlot[] = [
  { id: "h1-doorstep", label: "Hello ghost", moment: "The door opens and a ghost peeks out", file: "h1-doorstep.gif", emoji: "👻", anim: "wiggle" },
  { id: "h2-treat", label: "Treats", moment: "Trick or treat?", file: "h2-treat.gif", emoji: "🍬", anim: "bounce" },
  { id: "h3-portrait", label: "Peekaboo", moment: "Behind the last portrait in the hallway", file: "h3-portrait.gif", emoji: "🫣", anim: "float" },
  { id: "h4-potion", label: "Potion", moment: "Stirring the love potion", file: "h4-potion.gif", emoji: "🧪", anim: "pulse" },
  { id: "h5-boo", label: "You're my boo", moment: "After they say YES", file: "h5-boo.gif", emoji: "💜", anim: "pulse" },
];

export const halloweenDay: DayConfig<HalloweenExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "The Little Haunted House",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 50,
  asksQuestion: true,
  melody: "spooky",
  photoAspect: 4 / 5,
  gifSlots: GIFS,
  // Editor controls top-right (PremiumTopBar), like the premium twin.
  topBar: true,
  music: {
    audioOnly: true,
    track: HALLOWEEN_TRACK,
    suggestions: HALLOWEEN_SONGS,
    suggestionsNote: "Halloween favourites · tap to use",
  },
  extras: [
    {
      key: "tone", kind: "enum", label: "Who's it for?", display: "cards", default: "romantic",
      hint: "Changes the default question, the Boo License and the ending. Kids mode has no blackouts and a No button that just waits.",
      options: [
        { value: "romantic", label: "My boo", emoji: "💜", hint: "partner or crush" },
        { value: "friends", label: "My bestie", emoji: "🦇", hint: "best friend" },
        { value: "family", label: "Family", emoji: "🎃", hint: "parent, sibling, cousin" },
        { value: "kids", label: "A little one", emoji: "🍭", hint: "gentle, zero scares" },
      ],
    },
    {
      key: "houseName", kind: "text", max: 40, label: "Sign on the gate",
      placeholder: "name your haunted house — a joke only they'd get",
      hint: "Hangs on the creaky gate on the very first screen.",
      suggestions: ["Villa Boo-tiful · est. 2026", "The Haunted Hideout", "Casa de Boo"],
    },
    {
      key: "trickLine", kind: "text", max: 80, label: "Your “trick”",
      placeholder: "what you'd prank them with: an IOU, a dare, a fake threat",
      hint: "If they pick TRICK, a little ghost shouts BOO and says this.",
      suggestions: ["Trick! You owe me 3 hugs and the last chocolate.", "Trick! I'm stealing your hoodie. Again."],
    },
    {
      key: "carveWord", kind: "text", max: 10, min: 2, label: "Carved on the pumpkin",
      placeholder: "their nickname or a tiny word (up to 10 letters)",
      hint: "Glows through the back of the pumpkin they carve. Short words look best.",
      suggestions: ["BOO", "MINE", "BESTIE"],
    },
    {
      key: "costume", kind: "enum", label: "Their costume on the Boo License", display: "cards", default: "ghost",
      options: [
        { value: "ghost", label: "Ghost", emoji: "👻" },
        { value: "witch", label: "Witch", emoji: "🧙" },
        { value: "vampire", label: "Vampire", emoji: "🧛" },
        { value: "pumpkin", label: "Pumpkin", emoji: "🎃" },
        { value: "black-cat", label: "Black cat", emoji: "🐈‍⬛" },
        { value: "skeleton", label: "Skeleton", emoji: "🦴" },
        { value: "mummy", label: "Mummy", emoji: "🧻" },
        { value: "bat", label: "Bat", emoji: "🦇" },
      ],
    },
    {
      key: "costumeWhy", kind: "text", max: 70, label: "Why that costume?",
      placeholder: "the funny, true reason it suits them",
      hint: "Printed on their Boo License.",
    },
    {
      key: "ingredients", kind: "objlist", maxItems: 5, minItems: 3, label: "Potion ingredients", itemTitle: "Ingredient", addLabel: "+ add an ingredient",
      hint: "3–5 bottles they pour into the cauldron. Each one is a real memory or a reason.",
      item: [
        { key: "name", kind: "text", max: 30, label: "On the bottle", placeholder: "A pinch of your laugh" },
        { key: "line", kind: "text", max: 70, label: "What it really is", placeholder: "the 2 a.m. one, when you snort" },
      ],
    },
    {
      key: "potionSpell", kind: "text", max: 90, label: "What the potion's spell does",
      placeholder: "a plan, a promise or a dare the potion “casts”",
      hint: "Revealed on a scroll after they stir the potion.",
    },
    {
      key: "question", kind: "text", max: 60, label: "The big question",
      placeholder: "leave empty to use the one for who it's for",
      hint: "The No button turns into a ghost and vanishes when they try it.",
      suggestions: ["Will you be my boo? 👻", "Will you be my boo-st friend forever? 🦇", "Will you be my favourite little pumpkin? 🎃"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "After they say YES",
      placeholder: "what you'd say back the second they say yes",
      suggestions: ["Booked. Booed. Yours. Every Halloween from now on."],
    },
  ],
  theme: {
    bg: "radial-gradient(130% 75% at 50% 0%, #3A2257 0%, #251842 46%, #17122B 100%)",
    base: "#17122B",
    paper: "#FFF6E6",
    glass: "rgba(247,243,255,0.08)",
    ink: "#F7F3FF",
    inkSoft: "#CFC6E8",
    paperInk: "#2B1E3F",
    accent: "#FF8A3D",
    accentDeep: "#B84E14",
    accentInk: "#1A0F05",
    soft: "#FFE8D3",
    edge: "#E9DDF5",
    gold: "#FFD27A",
    dark: true,
    particles: ["🦇", "✨", "🕯️", "👻"],
    confetti: ["#FF8A3D", "#FFD27A", "#9BE7C4", "#B79CFF", "#FF9EC4"],
  },
  demo: {
    recipientName: "Meera",
    senderName: "Arjun",
    petName: "Pumpkin",
    letter:
      "You told me you're not scared of horror movies, and then you watched the whole of Coraline through the gap between your fingers. I have never loved anyone more.\n\nThis year I couldn't take you to a real haunted house, so I built you a tiny one. It has a pumpkin with your name on it, a hallway full of us, and a potion that only works if you stir it.\n\nYou make every ordinary night feel like the best part of October: a bit spooky, mostly sweet, and full of candy I'm not allowed to touch.\n\nNow go on, there's one last room.",
    photos: demoPhotos([
      ["the pumpkin patch 🎃", "You picked the ugliest pumpkin on purpose and named it Gerald."],
      ["costume party", "Two ghosts, one bedsheet, zero regrets."],
      ["horror movie night", "You screamed before the scary part. Every single time."],
      ["us, after dark", "My favourite thing about October is you."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...TRACK_DEMO,
    endLine: "Happy Halloween, my favourite boo 🎃",
    extras: {
      tone: "romantic",
      houseName: "Villa Boo-tiful · est. 2026",
      trickLine: "Trick! You owe me 3 hugs and the last chocolate.",
      carveWord: "BOO",
      costume: "black-cat",
      costumeWhy: "Because you nap 14 hours a day and still judge me.",
      ingredients: [
        { name: "A pinch of your laugh", line: "the 2 a.m. one, when you snort" },
        { name: "One stolen fry", line: "you always take the crispy one" },
        { name: "Rain from our first walk", line: "we didn't even have an umbrella" },
        { name: "Your horror-movie screams", line: "you scream before the scary part" },
      ],
      potionSpell: "Whoever drinks this has to watch Coraline with me this Friday.",
      question: "Will you be my boo? 👻",
      yesLine: "Booked. Booed. Yours. Every Halloween from now on.",
    },
  },
  copy: {
    recipientPlaceholder: "who the house is for — e.g. Meera",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — pumpkin, boo…",
    letterPlaceholder: "Read by flashlight in a dark attic, so make it a secret: a memory only you two share, the night you'd relive, what they mean to you…",
    letterHint: "Hidden in a dark attic. They move a flashlight to read it, line by line.",
    photosHint: "Your photos hang in the haunted hallway behind fogged glass. They wipe the fog to see you.",
    captionHint: "caption — e.g. the pumpkin patch",
    noteHint: "what you remember about that night…",
    endLinePlaceholder: "Happy Halloween, my favourite boo 🎃",
    endLineHint: "The last line, on their Boo License.",
    sheetTitle: "Build their haunted house 🎃",
    sheetSub: "Name the house, write the trick, fill the potion. Everything is pre-filled, so make it yours.",
    extrasTitle: "The haunted house",
    extrasSub: "Who it's for, the gate sign, the pumpkin, the potion and the big question",
    publishing: "Lighting the candles…",
    storyTitle: "Let's build their haunted house 🎃",
    replyText: "I said YES to being your boo 🎃 (the No button ghosted me, by the way)",
    yesChip: "Said YES 👻",
  },
  share: { title: "A little haunted house was built for you 🎃", accent: "#B84E14" },
};
