// ─── Happy Diwali — "A Diya at Your Door" ────────────────────────────────────
//
// An occasion on the Valentine engine (like happy-halloween). All copy is
// English. Server twin: server/src/config/valentineDays.ts ("happy-diwali");
// keys and limits must match (valentineDays.test.ts pins them).

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { MUSIC_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "happy-diwali" as const;

export type DiwaliTone = "romantic" | "family" | "friends";
export type DiwaliMithai = "laddoo" | "kaju-katli" | "jalebi" | "gulab-jamun" | "barfi";

export interface DiwaliExtras {
  tone: DiwaliTone;
  doorNote: string;
  wishes: string[];
  initials: string;
  sparkleWord: string;
  mithai: DiwaliMithai;
  mithaiNote: string;
  blessing: string;
  [k: string]: unknown;
}

/** What the tone fills in when the sender leaves a field empty. */
export const DIWALI_TONES: Record<
  DiwaliTone,
  { doorNote: string; wishes: readonly string[]; blessing: string; reply: string; mithaiNote: string; card: string }
> = {
  romantic: {
    doorNote: "for the brightest light in my year",
    wishes: [
      "May your year be as warm as this little flame",
      "May every door you knock on open wide",
      "May you laugh till your cheeks hurt, often",
      "May your worries burn out before this diya does",
      "May every Diwali from now on be ours",
    ],
    blessing: "May your home glow, your heart stay full, and every lamp you light find its way back to me.",
    reply: "I lit every diya 🪔 Happy Diwali to you too, my favourite light ✨",
    mithaiNote: "Every piece is yours. Yes, even the one you'll pretend you didn't take.",
    card: "with all my love",
  },
  family: {
    doorNote: "for the one who makes our home glow",
    wishes: [
      "May our home always smell of sweets and stories",
      "May your health shine brighter than every diya",
      "May this year bring you rest, and more reasons to smile",
      "May every wish you made for us come back to you",
      "May we always light the first diya together",
    ],
    blessing: "May Lakshmi fill your home, may the lamps keep you safe, and may we always come home to each other.",
    reply: "I lit every diya 🪔 Happy Diwali to the whole family ✨",
    mithaiNote: "Your favourite, and none of it counts as sugar today.",
    card: "with love, always",
  },
  friends: {
    doorNote: "for my partner in every Diwali crime",
    wishes: [
      "May your year be louder than our cracker fights",
      "May your plans finally leave the group chat",
      "May your inbox be quiet and your weekends long",
      "May you win every round of cards this Diwali",
      "May we still be doing this when we're eighty",
    ],
    blessing: "May your year sparkle, your plans actually happen, and your sweets box never run empty.",
    reply: "I lit every diya 🪔 Happy Diwali, bestie ✨ Now where's my real mithai?",
    mithaiNote: "Don't share. I said don't share. Fine, share one.",
    card: "your forever festival buddy",
  },
};

/** The sweets in the box at the end (art in happy-diwali/components/diwali/art.tsx). */
export const DIWALI_MITHAI: Record<DiwaliMithai, { label: string; emoji: string }> = {
  laddoo: { label: "Motichoor laddoo", emoji: "🟠" },
  "kaju-katli": { label: "Kaju katli", emoji: "🔷" },
  jalebi: { label: "Jalebi", emoji: "🌀" },
  "gulab-jamun": { label: "Gulab jamun", emoji: "🟤" },
  barfi: { label: "Barfi", emoji: "🟨" },
};

/**
 * One-tap Diwali songs. Official uploads (label channels), every id checked
 * against YouTube's oEmbed on 2026-10-11. Audio only (music.audioOnly).
 */
export const DIWALI_SONGS: readonly SongSuggestion[] = [
  { id: "gVrCNEiRypk", title: "Diwali", artist: "Vishal Mishra" },
  { id: "aZj-MEqy2CM", title: "Happy Diwali", artist: "Home Delivery" },
  { id: "PpVEt0p4Jhw", title: "Aayee Hai Diwali", artist: "Aamdani Atthanni Kharcha Rupaiya" },
  { id: "2wn3RHVpfxE", title: "Kabhi Khushi Kabhie Gham", artist: "Lata Mangeshkar" },
  { id: "LHj_Xqq4oS8", title: "Deepavali Manayi Suhani", artist: "Asha Bhosle" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal, Asees Kaur" },
  { id: "SyqgAt-T0iQ", title: "Om Jai Lakshmi Mata", artist: "Anuradha Paudwal" },
];

// The owner's festive GIFs (media-src/templates/_festive, on the CDN).
const GIFS: GifSlot[] = [
  { id: "d1-diya", label: "Your diya", moment: "The diya at the door, once it's lit", file: "../_festive/happy-diwali-diya.webp", emoji: "🪔", anim: "pulse" },
  { id: "d2-wishes", label: "Celebration", moment: "When every diya in the row is lit", file: "../_festive/celebration-with-crackers-dudu.webp", emoji: "🎉", anim: "bounce" },
  { id: "d3-rangoli", label: "Rangoli", moment: "When the rangoli is finished", file: "../_festive/dawaii-colorful-rangoli.webp", emoji: "🌸", anim: "spin" },
  { id: "d4-sparkler", label: "Sparkler", moment: "In their hand, writing with light", file: "../_festive/diwali-sparkles-wand.gif", emoji: "✨", anim: "wiggle" },
  { id: "d5-blessing", label: "Crackers", moment: "On the Shubh Deepavali card", file: "../_festive/diwali-sparkles-fire-works.webp", emoji: "🎆", anim: "bounce" },
];

export const diwaliDay: DayConfig<DiwaliExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "A Diya at Your Door",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 50,
  asksQuestion: false,
  melody: "diya",
  photoAspect: 4 / 5,
  gifSlots: GIFS,
  topBar: true,
  brandMark: "stacked",
  music: {
    audioOnly: true,
    compact: true,
    suggestions: DIWALI_SONGS,
    suggestionsNote: "Diwali favourites · tap to use",
  },
  extras: [
    {
      key: "tone", kind: "enum", label: "Who's it for?", display: "cards", default: "romantic",
      hint: "Changes the default wishes, the blessing card and their reply.",
      options: [
        { value: "romantic", label: "My love", emoji: "💛", hint: "partner or crush" },
        { value: "family", label: "Family", emoji: "🪔", hint: "parents, siblings, home" },
        { value: "friends", label: "A friend", emoji: "🎆", hint: "best friend, cousin, gang" },
      ],
    },
    {
      key: "doorNote", kind: "text", max: 60, label: "The tag on the diya",
      placeholder: "for… — who it's for, in your words",
      hint: "Tied to the diya waiting at their door, the very first thing they read.",
      suggestions: ["for the brightest light in my year", "for the one who steals all the kaju katli"],
    },
    {
      key: "wishes", kind: "list", maxItems: 5, minItems: 3, itemMax: 70, label: "A wish for every diya",
      hint: "They light a row of diyas; each flame lifts one wish. Three to five.",
      itemPlaceholder: ["a soft wish for their year", "something about their work or studies", "their health, their peace", "a habit of theirs you love", "a wish for the two of you"],
      addLabel: "+ add a diya",
    },
    {
      key: "initials", kind: "text", max: 6, label: "Initials in the rangoli",
      placeholder: "e.g. M+A",
      hint: "Glows in the middle of the rangoli they colour in. Empty = your two first initials.",
      suggestions: ["M+A", "M&A"],
    },
    {
      key: "sparkleWord", kind: "text", max: 12, label: "Written with the sparkler",
      placeholder: "their nickname, up to 10 letters",
      hint: "They swipe a sparkler and this word appears in light. Empty = their name.",
    },
    {
      key: "mithai", kind: "enum", label: "Sweets in the box", display: "chips", default: "laddoo",
      options: [
        { value: "laddoo", label: "Laddoo", emoji: "🟠" },
        { value: "kaju-katli", label: "Kaju katli", emoji: "🔷" },
        { value: "jalebi", label: "Jalebi", emoji: "🌀" },
        { value: "gulab-jamun", label: "Gulab jamun", emoji: "🟤" },
        { value: "barfi", label: "Barfi", emoji: "🟨" },
      ],
    },
    {
      key: "mithaiNote", kind: "text", max: 80, label: "Note under the lid",
      placeholder: "a playful line about them and sweets",
      hint: "Tucked inside the mithai box at the end.",
    },
    {
      key: "blessing", kind: "text", max: 120, label: "Your Diwali blessing",
      placeholder: "what you wish their year is filled with",
      hint: "Printed big on the Shubh Deepavali card. Leave empty for a warm default.",
    },
  ],
  theme: {
    bg: "radial-gradient(130% 80% at 50% 0%, #1D2C66 0%, #121C47 45%, #0A1030 100%)",
    base: "#0A1030",
    paper: "#FFF7E8",
    glass: "rgba(255,240,214,0.08)",
    ink: "#FFF6E3",
    inkSoft: "#D9D2EC",
    paperInk: "#3A1A0C",
    accent: "#FFB23F",
    accentDeep: "#C25E0A",
    accentInk: "#3A1606",
    soft: "#FFE7C2",
    edge: "#F3DDB4",
    gold: "#FFD36E",
    dark: true,
    particles: ["🪔", "✨", "🌼", "🎇"],
    confetti: ["#FFB23F", "#FFD36E", "#FF5FA2", "#2EC4B6", "#FF7A1A"],
  },
  demo: {
    recipientName: "Meera",
    senderName: "Arjun",
    petName: "Sunshine",
    letter:
      "Last Diwali you made me string the fairy lights three times because they were \"not straight\". They were straight. I re-did them anyway, because you were standing on the sofa, pointing, completely sure of yourself, and I've never seen anything I loved more.\n\nThis year I wanted to light something for you. So here's a whole night of it: a diya at your door, a rangoli you finish, fireworks you launch yourself.\n\nYou are the warmest thing in my year. Thank you for making every ordinary evening feel like a festival. Now go open the box at the end, I saved you the best piece.",
    photos: demoPhotos([
      ["first diya together 🪔", "You burnt your finger and still called it perfect."],
      ["rangoli at 2 a.m.", "The peacock looked like a chicken. We kept it."],
      ["cracker-free and proud", "Just sparklers, your laugh and the whole street watching."],
      ["the sweets raid", "Seven laddoos. You said four."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...MUSIC_DEMO,
    endLine: "Happy Diwali, my sunshine. Here's to every light we'll share 🪔",
    extras: {
      tone: "romantic",
      doorNote: "for the brightest light in my year",
      wishes: [
        "May your year be as warm as this little flame",
        "May your new job love you as much as I do",
        "May your plants live, all of them, finally",
        "May your worries burn out before this diya does",
        "May every Diwali from now on be ours",
      ],
      initials: "M+A",
      sparkleWord: "SUNSHINE",
      mithai: "kaju-katli",
      mithaiNote: "Every piece is yours. Yes, even the one you'll pretend you didn't take.",
      blessing: "May your home glow, your heart stay full, and every lamp you light find its way back to me.",
    },
  },
  copy: {
    recipientPlaceholder: "who the diya is for — e.g. Meera",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — sunshine, jaan…",
    letterPlaceholder: "It appears in the glow of the fireworks they launch: what they bring to your year, a Diwali memory only you two share, what you wish for them…",
    letterHint: "Appears in the glow once they've launched three fireworks.",
    photosHint: "Each photo hangs in a paper sky lantern. They tap a lantern to light it.",
    captionHint: "caption — e.g. first diya together",
    noteHint: "what you remember about that day…",
    endLinePlaceholder: "Happy Diwali, my sunshine 🪔",
    endLineHint: "The last line on their Shubh Deepavali card.",
    sheetTitle: "Light up their Diwali 🪔",
    sheetSub: "The diya tag, the wishes, the rangoli, the sweets. Everything is pre-filled, so make it yours.",
    extrasTitle: "Their Diwali night",
    extrasSub: "Who it's for, the diya tag, the wishes, the rangoli, the sparkler and the sweets",
    publishing: "Lighting the diyas…",
    storyTitle: "Let's light up their Diwali 🪔",
    replyText: "I lit every diya 🪔 Happy Diwali to you too ✨",
  },
  share: { title: "Someone left a diya at your door 🪔", accent: "#C25E0A" },
};
