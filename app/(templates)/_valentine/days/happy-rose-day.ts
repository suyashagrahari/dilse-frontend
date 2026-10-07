import type { DayConfig, GifSlot } from "../types";
import { defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "happy-rose-day" as const;

export const ROSE_COLORS = [
  { value: "red", label: "Red", swatch: "#C8102E", hint: "I love you, truly, madly, deeply." },
  { value: "pink", label: "Pink", swatch: "#F48FB1", hint: "You're the sweetest thing in my world." },
  { value: "lavender", label: "Lavender", swatch: "#B39DDB", hint: "I think I fell for you at first sight." },
  { value: "peach", label: "Peach", swatch: "#FFB38A", hint: "Thank you for being you, and for choosing me." },
  { value: "white", label: "White", swatch: "#FFF8F0", hint: "A new beginning, with you." },
  { value: "yellow", label: "Yellow", swatch: "#FFD54F", hint: "My best friend, and so much more." },
  { value: "orange", label: "Orange", swatch: "#FF8A50", hint: "You make every day exciting." },
  { value: "coral", label: "Coral", swatch: "#FF7F6E", hint: "So proud of you, always." },
] as const;

export const ROSE_COUNTS = [
  { value: "1", label: "1", hint: "You are the one" },
  { value: "3", label: "3", hint: "I love you" },
  { value: "7", label: "7", hint: "I'm falling for you" },
  { value: "9", label: "9", hint: "We belong together" },
  { value: "11", label: "11", hint: "You are my everything" },
  { value: "12", label: "12", hint: "Be mine" },
  { value: "99", label: "99", hint: "I will love you forever" },
] as const;

export interface RoseExtras {
  roseColor: string;
  colorReason: string;
  roseCount: string;
  openingLine: string;
  petalStyle: "classic" | "desi" | "french";
  shayari: string;
  signOff: string;
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "r1-arrival", label: "Arrival", moment: "Beside the empty pot — “a rose is waiting”", file: "r1-arrival.gif", emoji: "🌱", anim: "bounce" },
  { id: "r2-loves-me", label: "Loves me!", moment: "The last petal lands on LOVES ME", file: "r2-loves-me.gif", emoji: "🥰", anim: "pulse" },
  { id: "r3-letter", label: "Letter", moment: "The wax seal cracks open", file: "r3-letter.gif", emoji: "💌", anim: "wiggle" },
  { id: "r4-bouquet", label: "Bouquet", moment: "“Every rose is a memory” (photos)", file: "r4-bouquet.gif", emoji: "💐", anim: "float" },
  { id: "r5-ending", label: "Ending", moment: "Happy Rose Day ending", file: "r5-ending.gif", emoji: "🌹", anim: "pulse" },
];

export const roseDay: DayConfig<RoseExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Ek Gulaab, Sirf Tumhare Liye",
  maxPhotos: 9,
  letterMax: 1500,
  letterMin: 50,
  asksQuestion: false,
  melody: "garden",
  gifSlots: GIFS,
  extras: [
    { key: "roseColor", kind: "enum", label: "Pick your rose", display: "swatches", default: "red", options: ROSE_COLORS, hint: "Each colour says something — the meaning shows on their screen." },
    { key: "colorReason", kind: "text", max: 90, label: "Why this colour?", placeholder: "e.g. because red is the dupatta you wore on our first date", hint: "Shown right under the colour's meaning." },
    { key: "roseCount", kind: "enum", label: "How many roses?", display: "chips", default: "1", options: ROSE_COUNTS },
    { key: "openingLine", kind: "text", max: 70, label: "Opening line", placeholder: "the first thing they read, next to an empty pot", suggestions: ["I couldn't send you a real garden, so I grew you one.", "Ek gulaab, sirf tumhare liye 🌹", "Hold on. Something is growing for you…"] },
    {
      key: "petalStyle", kind: "enum", label: "Loves me / loves me not — style", display: "cards", default: "classic",
      options: [
        { value: "classic", label: "Classic", emoji: "🌼", hint: "loves me · loves me not" },
        { value: "desi", label: "Desi", emoji: "🌺", hint: "thoda · bahut · dil se · pagalpan tak" },
        { value: "french", label: "French", emoji: "🥐", hint: "un peu · beaucoup · à la folie" },
      ],
    },
    { key: "shayari", kind: "longtext", max: 160, rows: 2, label: "A little shayari (optional)", placeholder: "two lines — yours, or a sher you love (add the poet's name)" },
    { key: "signOff", kind: "text", max: 30, label: "Sign-off", placeholder: "how you end every text to them — e.g. Hamesha tumhara, Rohan" },
  ],
  theme: {
    bg: "linear-gradient(180deg, #FFF8F0 0%, #FDEDEF 55%, #FBE3E8 100%)",
    base: "#FFF8F0",
    paper: "#FFFDF8",
    glass: "rgba(255,255,255,0.66)",
    ink: "#5A1A2B",
    inkSoft: "#8A5563",
    paperInk: "#4A1424",
    accent: "#C8102E",
    accentDeep: "#8E0B20",
    accentInk: "#FFFFFF",
    soft: "#FBE3E8",
    edge: "#F1D3DA",
    gold: "#E8C07D",
    dark: false,
    particles: ["🌹", "🌸", "✨", "🍃"],
    confetti: ["#C8102E", "#F48FB1", "#F9D5DC", "#5E8C61", "#E8C07D"],
  },
  demo: {
    recipientName: "Ananya",
    senderName: "Rohan",
    petName: "Meri Gulabo",
    letter:
      "My dearest Ananya,\n\nThey say a rose says what words can't, but you know me — I've never been good at staying quiet about you. So here's a rose and all my words.\n\nEver since you walked into my life, ordinary days started smelling like gulaab. Your laugh is my favourite song, your \"theek hai, baba\" my favourite argument-ender, and your hand in mine my favourite place in the whole world.\n\nThis little rose grew because you held on to it. That's what you do with me too — you hold on, even on the days I'm hard to hold. Thank you for that.\n\nSo today, on Rose Day, I'm giving you the only flower that will never wilt, because I'll keep watering it every single day.\n\nTumhara, hamesha,\nRohan",
    photos: demoPhotos([
      ["our first chai date ☕", "You blew on my chai for me like I was five. I pretended to mind."],
      ["that rainy day in Lonavala", "One umbrella, two people, zero dry shoulders. Best walk of my life."],
      ["you, stealing my fries", "I ordered extra on purpose. Don't tell anyone."],
      ["us, forever", "Out of every timeline, I'd pick this one. Every time."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    music: true,
    endLine: "Happy Rose Day, my forever favourite flower 🌹",
    extras: {
      roseColor: "red",
      colorReason: "Because every shade of red reminds me of your laugh.",
      roseCount: "1",
      openingLine: "I couldn't send you a real garden, so I grew you one.",
      petalStyle: "classic",
      shayari: "Main chahta tha ki usko gulaab pesh karun,\nWoh khud gulaab tha, usko gulaab kya deta. — Afzal Allahabadi",
      signOff: "Hamesha tumhara, Rohan",
    },
  },
  copy: {
    recipientPlaceholder: "the name you'd whisper — e.g. Ananya",
    senderPlaceholder: "your name, as you sign notes to them",
    petNamePlaceholder: "what they're saved as in your phone",
    letterPlaceholder: "Start with the first time you noticed them. Then the tiny thing they do that nobody else notices…",
    letterHint: "Revealed in ink, line by line, after the rose blooms and the wax seal cracks.",
    photosHint: "Every photo is a rosebud — they tap it and it blooms into a polaroid.",
    captionHint: "caption — e.g. our first chai date",
    noteHint: "the little note that opens with it…",
    endLinePlaceholder: "Happy Rose Day, my forever favourite flower 🌹",
    endLineHint: "Shown under the full-bloom rose at the very end.",
    sheetTitle: "Grow their rose 🌹",
    sheetSub: "Pick the rose, write the letter, add your memories. Everything is pre-filled — make it yours.",
    extrasTitle: "Your rose",
    extrasSub: "The colour, the count and the little lines around it",
    publishing: "Planting your rose…",
    storyTitle: "Let's grow their rose 🌹",
    replyText: "Got your rose 🌹 It bloomed. So did I. Sending one back 💗",
  },
  share: { title: "A rose is waiting for you 🌹", accent: "#C8102E" },
};
