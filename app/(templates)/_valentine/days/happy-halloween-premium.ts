// happy-halloween-premium — "A Night at the Manor" (the ✦ Premium twin of happy-halloween).
//
// Cute-spooky, never scary. The recipient is let into a dark manor and finds
// the two of them in it:
//   gate     "Trick or treat, {name}?" — both answers are a treat (the song starts)
//   hall     the Hall of Portraits: drag a torch beam through the dark to find
//            their photos hung as gilt portraits and notes scrawled on the walls
//   séance   rest a finger on the planchette: it spells their name, then a word
//   tarot    three cards, Past · Present · Future, each a personal fortune
//   voice    a voice from the other side (voice note, or the crystal ball's line)
//   letter   light the candle; a parchment letter and a sealed P.S.
//   portrait the money moment: one portrait is still in the dark. The beam
//            finds it, the song drops, thunder, and the portrait (them) winks.
//            Then the question.
//   ending   "Stay haunted" — a costume-duo poster keepsake, a reply, replay.
// Server twin: server/src/config/premiumDays/happy-halloween-premium.ts (same
// keys + limits; valentineDays.test.ts pins them). Keys shared with the $2 day
// (tone, houseName, question, yesLine) keep their names so an upgrade carries
// them over.

import type { SongSuggestion } from "../music/youtube";
import type { DayConfig, GifSlot } from "../types";
import { demoPhotos } from "./_shared";
import { premiumDay } from "./_premium";
import { halloweenDay, type HalloweenTone } from "./happy-halloween";

export interface TarotCard {
  card: string;
  line: string;
}

export interface HalloweenExtrasPremium {
  tone: HalloweenTone;
  houseName: string;
  nightTitle: string;
  wallNotes: string[];
  spiritWord: string;
  spiritLine: string;
  tarot: TarotCard[];
  costumeDuo: string;
  question: string;
  yesLine: string;
  [k: string]: unknown;
}

/**
 * Spooky-romantic, not horror (research §E: each id passed YouTube oEmbed and
 * playableInEmbed on 2026-10-09; the start second is the "Most replayed" peak).
 * The first one is the demo song, from DEMO_START.
 */
export const HALLOWEEN_PREMIUM_SONGS: readonly SongSuggestion[] = [
  { id: "4V90AmXnguw", title: "Thriller", artist: "Michael Jackson" },
  { id: "LXuSOkf2M3c", title: "Abracadabra", artist: "Lady Gaga" },
  { id: "WCjzNfJLHa0", title: "I Put a Spell on You", artist: "Nina Simone" },
  { id: "rtL5oMyBHPs", title: "Little Dark Age", artist: "MGMT" },
  { id: "ZVuToMilP0A", title: "This Is Halloween", artist: "The Nightmare Before Christmas" },
  { id: "tsPdVsIXqzU", title: "Monster Mash", artist: "Bobby \"Boris\" Pickett" },
];
const DEMO_START = 46;

// Stickers only appear where the sender picked one: an emoji fallback in a
// dark gilt room reads as clip-art, so an empty slot shows nothing.
const GIFS: GifSlot[] = [
  { id: "h1-hall", label: "A friend in the hall", moment: "Peeks out of the Hall of Portraits once the last one is found", file: "h1-hall.gif", emoji: "👻", anim: "float" },
  { id: "h6-yes", label: "After the YES", moment: "Next to your portrait, after they say yes", file: "h6-yes.gif", emoji: "💜", anim: "pulse" },
];

const base = premiumDay<HalloweenExtrasPremium>(halloweenDay, {
  slug: "happy-halloween-premium",
  title: "A Night at the Manor",
  gifSlots: GIFS,
  demoSong: { id: HALLOWEEN_PREMIUM_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    voiceCaption: "If you can hear this, the manor let you in. I'll be the one holding the torch.",
    psLetter:
      "Open only if you're scared.\n\nI'm right here. I was always right here: on the other end of the call at 2 a.m., in the next seat at every horror movie, holding the umbrella we never remember to carry.",
    songDropAt: DEMO_START,
  },
  copy: {
    recipientPlaceholder: "who's invited — e.g. Meera",
    letterPlaceholder:
      "The candle-lit letter at the end of the night. A memory only you two share, the night you'd relive, what they mean to you…",
    letterHint: "They light a candle and your letter appears on old parchment.",
    photosHint:
      "Your first photo is the last portrait in the dark — the big reveal. The next three hang in the Hall of Portraits for them to find with a torch.",
    captionHint: "the brass plaque under the portrait — e.g. Lonavala, in the rain",
    endLinePlaceholder: "Happy Halloween. Stay haunted with me. 🕯️",
    endLineHint: "The last line of the night, over your costume-duo poster.",
    sheetTitle: "Build their night at the manor 🕯️",
    sheetSub: "Hang your photos, write on the walls, set the spirit board and deal three tarot cards. Everything is pre-filled — make it yours.",
    extrasTitle: "The manor",
    extrasSub: "Who it's for, the manor, the notes on the walls, the spirit board, three tarot cards and the question",
    publishing: "Lighting the candles…",
    storyTitle: "Let's build their night at the manor 🕯️",
    replyText: "I found us in the dark at the manor 🕯️ Yes. Obviously.",
    yesChip: "Said yes at the manor 🕯️",
  },
  share: { title: "Trick or treat? Someone left the manor door open for you 🕯️", accent: "#5C1A1B" },
});

export const halloweenDayPremium: DayConfig<HalloweenExtrasPremium> = {
  ...base,
  music: {
    audioOnly: true,
    suggestions: HALLOWEEN_PREMIUM_SONGS,
    suggestionsNote: "spooky-romantic · tap to use",
    demoStart: DEMO_START,
  },
  extras: [
    {
      key: "tone", kind: "enum", label: "Who's it for?", display: "cards", default: "romantic",
      hint: "Family and kids: no thunder, no lightning flash, and the No button never runs away.",
      options: [
        { value: "romantic", label: "My boo", emoji: "💜", hint: "partner or crush" },
        { value: "friends", label: "My bestie", emoji: "🦇", hint: "best friend" },
        { value: "family", label: "Family", emoji: "🎃", hint: "parent, sibling, cousin" },
        { value: "kids", label: "A little one", emoji: "🍭", hint: "gentle, zero scares" },
      ],
    },
    {
      key: "houseName", kind: "text", max: 40, label: "Name of your manor",
      placeholder: "a place only you two would get — your street, a running joke",
      hint: "On the door at the start and on your poster.",
      suggestions: ["Villa Boo-tiful", "The Haunted Hideout", "Casa de Boo"],
    },
    {
      key: "nightTitle", kind: "text", max: 40, label: "Name of the night",
      placeholder: "like the title of a gothic love story",
      hint: "Shown over your portrait at the big reveal, and on the poster.",
      suggestions: ["The Haunting of Us", "A Very Spooky Love Story", "Ghouls Night Out"],
    },
    {
      key: "wallNotes", kind: "list", maxItems: 3, minItems: 1, itemMax: 48, label: "Notes on the walls",
      addLabel: "+ add a note",
      hint: "Scrawled on the walls of the Hall of Portraits; they find them with the torch. Short and true.",
      itemPlaceholder: ["you snorted at Haldiram's", "Lonavala, no umbrella", "my hoodie lives with you now"],
    },
    {
      key: "spiritWord", kind: "text", max: 10, min: 2, label: "What the spirit board spells",
      placeholder: "one word only they'd understand (letters only)",
      hint: "The planchette spells their name, then this word. A–Z only, up to 10 letters.",
      suggestions: ["MINE", "ALWAYS", "BOO"],
    },
    {
      key: "spiritLine", kind: "text", max: 80, label: "The board's last whisper",
      placeholder: "what you whisper once the word is spelled",
      suggestions: ["The spirits agree. So do I."],
    },
    {
      key: "tarot", kind: "objlist", maxItems: 3, minItems: 3, label: "Their tarot reading", itemTitle: "Card",
      hint: "Card 1 is their Past, 2 their Present, 3 their Future. They flip each one.",
      item: [
        { key: "card", kind: "text", max: 24, label: "The card", placeholder: "The Lovers, The Moon, The Sun, The Star…" },
        { key: "line", kind: "text", max: 90, label: "Its fortune", placeholder: "one line, personal — e.g. You, obviously." },
      ],
    },
    {
      key: "costumeDuo", kind: "text", max: 40, label: "Your costume duo (optional)",
      placeholder: "theirs first — e.g. Morticia & Gomez",
      hint: "Printed on your poster: “Meera & Arjun as Morticia & Gomez”.",
      suggestions: ["Morticia & Gomez", "Two ghosts, one bedsheet", "The witch & her cat"],
    },
    {
      key: "question", kind: "text", max: 60, label: "The question",
      placeholder: "leave empty to use the one for who it's for",
      hint: "Asked under your portrait after the big reveal.",
      suggestions: ["Will you be my boo, tonight and every Halloween after?", "Will you be my boo-st friend forever?", "Will you be my favourite little pumpkin?"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "After they say yes",
      placeholder: "what you'd say back",
      suggestions: ["Booked. Booed. Yours. Every October after."],
    },
  ],
  theme: {
    bg: "radial-gradient(120% 80% at 50% 0%, #2B1A2F 0%, #170D19 52%, #08050A 100%)",
    base: "#08050A",
    paper: "#E8DFCC",
    glass: "rgba(232,223,204,0.07)",
    ink: "#F1E9D8",
    inkSoft: "#B9AC9A",
    paperInk: "#2A1712",
    accent: "#F2B35B",
    accentDeep: "#8A5A1E",
    accentInk: "#1E1206",
    soft: "#F6DDB0",
    edge: "rgba(232,223,204,0.18)",
    gold: "#E8CF8A",
    dark: true,
    particles: ["🦇", "🕯️", "✨", "🌙"],
    confetti: ["#F2B35B", "#E0782F", "#E8DFCC", "#5C1A1B", "#E8CF8A"],
  },
  demo: {
    ...base.demo,
    recipientName: "Meera",
    senderName: "Arjun",
    petName: "Pumpkin",
    letter:
      "You told me you're not scared of horror movies, and then you watched the whole of Stree 2 through the gap between your fingers, holding my hand so hard I lost the feeling in two of them. I have never loved anyone more.\n\nThis year I couldn't take you to a real haunted manor, so I built you one. Portraits of us in the dark, a spirit board that knows your name, three cards that already know how this ends.\n\nYou make every ordinary night feel like the best part of October: a bit spooky, mostly sweet, and full of snacks I'm not allowed to touch.\n\nOne more portrait is still waiting in the dark. Go and find it.",
    photos: demoPhotos([
      ["us, after dark", "My favourite thing about October is you."],
      ["costume party", "Two ghosts, one bedsheet, zero regrets."],
      ["the pumpkin patch", "You picked the ugliest pumpkin on purpose and named it Gerald."],
      ["horror movie night", "You screamed before the scary part. Every single time."],
    ]),
    endLine: "Happy Halloween. Stay haunted with me. 🕯️",
    extras: {
      tone: "romantic",
      houseName: "Villa Boo-tiful",
      nightTitle: "The Haunting of Us",
      wallNotes: ["you snorted at Haldiram's", "Lonavala, no umbrella", "my hoodie lives with you now"],
      spiritWord: "MINE",
      spiritLine: "The spirits agree. So do I.",
      tarot: [
        { card: "The Moon", line: "3 a.m. Maggi in the hostel kitchen. Even then, the cards knew." },
        { card: "The Lovers", line: "You, obviously." },
        { card: "The Sun", line: "A cabin in Manali, a fireplace, and my hoodie on you. Again." },
      ],
      costumeDuo: "Morticia & Gomez",
      question: "Will you be my boo, tonight and every Halloween after?",
      yesLine: "Booked. Booed. Yours. Every October after.",
    },
  },
};
