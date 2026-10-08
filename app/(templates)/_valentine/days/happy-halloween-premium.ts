// happy-halloween-premium — "The Midnight Manor" (the ✦ Premium twin of happy-halloween).
//
// A moonlit haunted manor holding a midnight ball for one guest: a sealed
// black invitation, an iron gate, a foyer of memory candles, a portrait
// gallery that wakes, a séance at the spirit board, a voice on the spirit
// radio, a letter in candle-warmed ink, a witch's kitchen, and the clock
// tower striking twelve on the song's drop (bats → firework hearts → dawn).
// Server twin: server/src/config/premiumDays/happy-halloween-premium.ts (same
// keys + limits; valentineDays.test.ts pins them). Keys shared with the $2 day
// (tone, houseName, ingredients, question, yesLine) keep their names so an
// upgrade carries them over.

import type { SongSuggestion } from "../music/youtube";
import type { DayConfig, GifSlot } from "../types";
import { demoPhotos } from "./_shared";
import { premiumDay } from "./_premium";
import { halloweenDay, type HalloweenTone } from "./happy-halloween";

export type ManorAnswer = "YES" | "NO" | "ALWAYS" | "SOON";

export interface HalloweenExtrasPremium {
  tone: HalloweenTone;
  houseName: string;
  nightTitle: string;
  candleMemories: string[];
  spiritWord: string;
  spiritQA: { q: string; answer: ManorAnswer; line: string }[];
  ingredients: { name: string; line: string }[];
  prophecy: string;
  question: string;
  yesLine: string;
  specialGuest: string;
  [k: string]: unknown;
}

/**
 * One-tap songs for the manor. Official uploads (artist, label, VEVO or
 * "- Topic" channels), each id checked against YouTube's oEmbed on 2026-10-08.
 * Audio only, like the $2 Halloween (music.audioOnly below).
 */
export const HALLOWEEN_PREMIUM_SONGS: readonly SongSuggestion[] = [
  { id: "WCjzNfJLHa0", title: "I Put a Spell on You", artist: "Nina Simone" },
  { id: "h8bAbvk5Hs4", title: "Spooky", artist: "Dusty Springfield" },
  { id: "4cC6fw8EqWU", title: "Haunted (Taylor's Version)", artist: "Taylor Swift" },
  { id: "ZVuToMilP0A", title: "This Is Halloween", artist: "The Nightmare Before Christmas" },
  { id: "fb0KjR4bik8", title: "Love Potion No. 9", artist: "The Searchers" },
  { id: "sOnqjkJTMaA", title: "Thriller", artist: "Michael Jackson" },
  { id: "hxMNYkLN7tI", title: "Aaj Ki Raat", artist: "Stree 2" },
  { id: "FGNc3BibU3o", title: "Ami Je Tomar 3.0", artist: "Bhool Bhulaiyaa 3" },
];

const GIFS: GifSlot[] = [
  { id: "p1-invite", label: "Peeking ghost", moment: "Peeks out from the manor gate after the invitation opens", file: "p1-invite.gif", emoji: "👻", anim: "wiggle" },
  { id: "p2-candle", label: "Candle friend", moment: "Guards the candelabra in the foyer", file: "p2-candle.gif", emoji: "🕯️", anim: "float" },
  { id: "p3-portrait", label: "Portrait wink", moment: "Hides behind the last portrait in the gallery", file: "p3-portrait.gif", emoji: "🖼️", anim: "float" },
  { id: "p4-seance", label: "Séance cat", moment: "Sits on the corner of the spirit board", file: "p4-seance.gif", emoji: "🐈‍⬛", anim: "bounce" },
  { id: "p5-cauldron", label: "Spell casting", moment: "Over the cauldron when the spell erupts", file: "p5-cauldron.gif", emoji: "🧪", anim: "pulse" },
  { id: "p6-yes", label: "Ghost couple", moment: "At sunrise, after they say YES", file: "p6-yes.gif", emoji: "💜", anim: "pulse" },
];

const base = premiumDay<HalloweenExtrasPremium>(halloweenDay, {
  slug: "happy-halloween-premium",
  title: "The Midnight Manor",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "Testing, testing… this is Arjun, calling from the other side of the city.",
    psLetter:
      "Open only if you're scared.\n\nI'm right here. I was always right here: on the other end of the call at 2 a.m., in the next seat at every horror movie, holding the umbrella we never remember to carry.",
  },
  copy: {
    recipientPlaceholder: "the guest of honour — e.g. Meera",
    letterPlaceholder:
      "Written in invisible ink in the manor's attic: they warm it with a candle and it appears line by line. A memory only you two share, the night you'd relive, what they mean to you…",
    letterHint: "Hidden in the attic in invisible ink. They move a candle under the page and your words appear.",
    photosHint: "Up to 12 photos hang as sepia portraits in the manor gallery. They tap each one awake, then the whole gallery remembers you two.",
    captionHint: "the plaque under the portrait — e.g. Lonavala, in the rain",
    endLinePlaceholder: "Happy Halloween. You haunt me in the best way. 🕯️",
    endLineHint: "The last line, at sunrise over the manor.",
    sheetTitle: "Build their Midnight Manor 🕯️",
    sheetSub: "Name the manor, light the candles, write the spirit board's answers and the midnight question. Everything is pre-filled — make it yours.",
    extrasTitle: "The Midnight Manor",
    extrasSub: "Who it's for, the manor, the candles, the spirit board, the spell and the midnight question",
    publishing: "Sealing the invitation…",
    storyTitle: "Let's build their Midnight Manor 🕯️",
    replyText: "I said YES at the stroke of midnight 🕯️ (the manor is beautiful. so are you.)",
    yesChip: "Said YES at midnight 🕯️",
  },
  share: { title: "A sealed invitation to the Midnight Manor 🕯️", accent: "#7A1E2C" },
});

export const halloweenDayPremium: DayConfig<HalloweenExtrasPremium> = {
  ...base,
  music: {
    audioOnly: true,
    suggestions: HALLOWEEN_PREMIUM_SONGS,
    suggestionsNote: "moonlit & spooky · tap to use",
  },
  extras: [
    {
      key: "tone", kind: "enum", label: "Who's it for?", display: "cards", default: "romantic",
      hint: "Changes the default question and the board's name. Family and kids: no lightning, a Magic Letter Board, and a No button that never runs.",
      options: [
        { value: "romantic", label: "My boo", emoji: "💜", hint: "partner or crush" },
        { value: "friends", label: "My bestie", emoji: "🦇", hint: "best friend" },
        { value: "family", label: "Family", emoji: "🎃", hint: "parent, sibling, cousin" },
        { value: "kids", label: "A little one", emoji: "🍭", hint: "gentle, zero scares" },
      ],
    },
    {
      key: "houseName", kind: "text", max: 40, label: "Name of your haunted manor",
      placeholder: "a place only you two would get — your street, a running joke",
      hint: "Engraved on the iron gate and on your portrait's plaque.",
      suggestions: ["Villa Boo-tiful", "The Haunted Hideout", "Casa de Boo"],
    },
    {
      key: "nightTitle", kind: "text", max: 40, label: "Name of the night",
      placeholder: "what tonight's midnight ball is called",
      hint: "Printed on the invitation they open first.",
      suggestions: ["The Haunting of Us", "A Very Spooky Love Story", "Ghouls Night Out"],
    },
    {
      key: "candleMemories", kind: "list", maxItems: 5, minItems: 3, itemMax: 70, label: "Memories the candles light",
      addLabel: "+ add a candle",
      hint: "3–5 candles in the foyer. Each one they light writes one small, true moment on the wallpaper.",
      itemPlaceholder: [
        "the first time you laughed so hard you snorted",
        "our 3 a.m. Maggi in the hostel kitchen",
        "you holding my hand through a horror movie",
        "the rain on the way back from somewhere",
        "one more tiny moment",
      ],
    },
    {
      key: "spiritWord", kind: "text", max: 10, min: 2, label: "What the spirit board spells next",
      placeholder: "one word only they'd understand (letters only)",
      hint: "The board spells their name by itself, then this word. A–Z only, up to 10 letters.",
      suggestions: ["MINE", "ALWAYS", "BOO"],
    },
    {
      key: "spiritQA", kind: "objlist", maxItems: 3, minItems: 1, label: "Questions the spirits answer", itemTitle: "Question", addLabel: "+ add a question",
      hint: "They tap a question; the planchette glides to the answer and your whisper appears.",
      item: [
        { key: "q", kind: "text", max: 60, label: "Their question", placeholder: "a question they'd secretly want to ask you" },
        {
          key: "answer", kind: "enum", label: "The board says", default: "YES", display: "chips",
          options: [
            { value: "YES", label: "YES" },
            { value: "NO", label: "NO" },
            { value: "ALWAYS", label: "ALWAYS" },
            { value: "SOON", label: "SOON" },
          ],
        },
        { key: "line", kind: "text", max: 70, label: "Your whisper after it", placeholder: "the cheeky truth behind the answer" },
      ],
    },
    {
      key: "ingredients", kind: "objlist", maxItems: 3, minItems: 3, label: "Spell ingredients", itemTitle: "Ingredient",
      hint: "Three sigils they trace over the cauldron. Each one drops in a real reason or memory.",
      item: [
        { key: "name", kind: "text", max: 30, label: "The ingredient", placeholder: "A pinch of your laugh" },
        { key: "line", kind: "text", max: 70, label: "What it really is", placeholder: "the 2 a.m. one, when you snort" },
      ],
    },
    {
      key: "prophecy", kind: "text", max: 100, label: "What the crystal ball shows",
      placeholder: "a future plan, a promise or a dare",
      hint: "Rises out of the cauldron's smoke after the spell.",
    },
    {
      key: "question", kind: "text", max: 60, label: "The midnight question",
      placeholder: "leave empty to use the one for who it's for",
      hint: "Asked after the twelfth bell. For a boo or a bestie the No button drifts off like a ghost.",
      suggestions: ["Will you be my boo, tonight and every Halloween after?", "Will you be my boo-st friend forever?", "Will you be my favourite little pumpkin?"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "After they say YES",
      placeholder: "what you'd say back as the sun comes up",
      suggestions: ["Booked. Booed. Yours. See you at sunrise."],
    },
    {
      key: "specialGuest", kind: "text", max: 40, label: "A special guest at the ball (optional)",
      placeholder: "a pet, a friend, a place",
      hint: "Signed into the manor's guest book at the end.",
      suggestions: ["Biscuit the cat (as himself)"],
    },
  ],
  theme: {
    bg: "radial-gradient(120% 70% at 50% 0%, #2A2350 0%, #1A1633 46%, #0B0A14 100%)",
    base: "#0B0A14",
    paper: "#F4E9D2",
    glass: "rgba(220,227,242,0.08)",
    ink: "#F1EEFB",
    inkSoft: "#BDB8D8",
    paperInk: "#2A1B12",
    accent: "#FFC86B",
    accentDeep: "#9A5A17",
    accentInk: "#1C1106",
    soft: "#FFE7BF",
    edge: "#DCD5F2",
    gold: "#FFC86B",
    dark: true,
    particles: ["🦇", "🕯️", "✨", "🌙"],
    confetti: ["#FFC86B", "#FF7A2F", "#7FF5D8", "#B79CFF", "#FFB3A7"],
  },
  demo: {
    ...base.demo,
    recipientName: "Meera",
    senderName: "Arjun",
    petName: "Pumpkin",
    letter:
      "You told me you're not scared of horror movies, and then you watched the whole of Stree 2 through the gap between your fingers, holding my hand so hard I lost the feeling in two of them. I have never loved anyone more.\n\nThis year I couldn't take you to a real haunted manor, so I built you one. It has candles that remember things, portraits of us that wake up when you touch them, a spirit board that knows your name, and a clock that's been waiting all night to strike twelve for you.\n\nYou make every ordinary night feel like the best part of October: a bit spooky, mostly sweet, and full of snacks I'm not allowed to touch.\n\nGo on. Midnight is close.",
    photos: demoPhotos([
      ["the pumpkin patch 🎃", "You picked the ugliest pumpkin on purpose and named it Gerald."],
      ["costume party", "Two ghosts, one bedsheet, zero regrets."],
      ["horror movie night", "You screamed before the scary part. Every single time."],
      ["us, after dark", "My favourite thing about October is you."],
    ]),
    endLine: "Happy Halloween. You haunt me in the best way. 🕯️",
    extras: {
      tone: "romantic",
      houseName: "Villa Boo-tiful",
      nightTitle: "The Haunting of Us",
      candleMemories: [
        "The first time you laughed so hard you snorted at Haldiram's",
        "Our 3 a.m. Maggi in the hostel kitchen",
        "You holding my hand through all of Stree 2",
        "The rain on the way back from Lonavala",
      ],
      spiritWord: "MINE",
      spiritQA: [
        { q: "Does Arjun think about me at 2 a.m.?", answer: "ALWAYS", line: "Also at 2:07, 2:15 and 3." },
        { q: "Will he ever give back my hoodie?", answer: "NO", line: "It lives here now." },
        { q: "Next Halloween together?", answer: "YES", line: "Costumes already planned." },
      ],
      ingredients: [
        { name: "A pinch of your laugh", line: "the 2 a.m. one, when you snort" },
        { name: "One stolen fry", line: "you always take the crispy one" },
        { name: "Rain from our first walk", line: "we didn't even have an umbrella" },
      ],
      prophecy: "A cabin in Manali, a fireplace, and you stealing my hoodie. Again.",
      question: "Will you be my boo, tonight and every Halloween after?",
      yesLine: "Booked. Booed. Yours. See you at sunrise.",
      specialGuest: "Biscuit the cat (as himself)",
    },
  },
};
