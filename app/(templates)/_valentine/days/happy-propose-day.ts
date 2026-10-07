import type { DayConfig, GifSlot } from "../types";
import { defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "happy-propose-day" as const;

export interface ProposeExtras {
  question: string;
  teaser: string;
  reasons: string[];
  moments: { when: string; what: string }[];
  ringStyle: "solitaire" | "heart" | "band";
  stoneColor: "diamond" | "ruby" | "rosegold";
  noMode: "both" | "run" | "shrink";
  noLines: string[];
  afterYes: string;
  shayari: string;
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "p1-nervous", label: "Nervous", moment: "Curtain: “I have something to ask you…”", file: "p1-nervous.gif", emoji: "😳", anim: "wiggle" },
  { id: "p2-ring", label: "Ring", moment: "The ring box opens", file: "p2-ring.gif", emoji: "💍", anim: "pulse" },
  { id: "p3-kneel", label: "Kneel", moment: "During the proposal speech", file: "p3-kneel.gif", emoji: "🥹", anim: "bounce" },
  { id: "p4-please", label: "Please?", moment: "After 3 tries at “No”", file: "p4-please.gif", emoji: "🥺", anim: "pulse" },
  { id: "p5-yes", label: "YES!", moment: "The YES celebration", file: "p5-yes.gif", emoji: "🥳", anim: "spin" },
];

export const proposeDay: DayConfig<ProposeExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "The Little Velvet Box",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 50,
  asksQuestion: true,
  melody: "velvet",
  gifSlots: GIFS,
  extras: [
    {
      key: "question", kind: "text", max: 60, label: "The big question", placeholder: "the exact words you'd say on one knee",
      hint: "Hidden under gold foil — they scratch to reveal it.",
      suggestions: ["Will you be mine, forever? 💍", "Will you be my Valentine? 💘", "Will you marry me? 💍", "Will you choose me again, every day?"],
    },
    { key: "teaser", kind: "text", max: 70, label: "Curtain line", placeholder: "your nervous first line, before the curtain rises", suggestions: ["I've practised this a hundred times. Here goes…", "Mujhe tumse kuch poochna hai…"] },
    { key: "reasons", kind: "list", maxItems: 3, itemMax: 80, label: "3 reasons I'm asking", hint: "Three cards flip in before the question.", itemPlaceholder: ["a habit of theirs you secretly love", "something they remember about you", "why the future looks like them"], addLabel: "+ add a reason" },
    {
      key: "moments", kind: "objlist", maxItems: 6, label: "How we got here", itemTitle: "Moment", addLabel: "+ add a moment",
      hint: "A little lit-up timeline — first meeting to today. Pairs with your photos in order.",
      item: [
        { key: "when", kind: "text", max: 20, label: "When", placeholder: "Jun 2023 · that monsoon" },
        { key: "what", kind: "text", max: 50, label: "What happened", placeholder: "the day you stole my umbrella ☔" },
      ],
    },
    {
      key: "ringStyle", kind: "enum", label: "Ring style", display: "cards", default: "solitaire",
      options: [
        { value: "solitaire", label: "Solitaire", emoji: "💎" },
        { value: "heart", label: "Heart cut", emoji: "❤️" },
        { value: "band", label: "Simple band", emoji: "💍" },
      ],
    },
    {
      key: "stoneColor", kind: "enum", label: "Stone", display: "swatches", default: "diamond",
      options: [
        { value: "diamond", label: "Diamond", swatch: "#E8F4FF" },
        { value: "ruby", label: "Ruby", swatch: "#C8102E" },
        { value: "rosegold", label: "Rose gold", swatch: "#E8A598" },
      ],
    },
    {
      key: "noMode", kind: "enum", label: "What the “No” button does", display: "chips", default: "both",
      options: [
        { value: "both", label: "Runs + shrinks", emoji: "🏃" },
        { value: "run", label: "Runs away", emoji: "💨" },
        { value: "shrink", label: "Shrinks", emoji: "🤏" },
      ],
    },
    { key: "noLines", kind: "list", maxItems: 5, itemMax: 28, label: "What “No” says as it runs", itemPlaceholder: "Pakka?", addLabel: "+ add a line" },
    { key: "afterYes", kind: "text", max: 120, label: "After they say YES", placeholder: "the first thing you'd say — e.g. ab toh tum fas gaye 😄" },
    { key: "shayari", kind: "longtext", max: 160, rows: 2, label: "A shayari (optional)", placeholder: "two lines inside the speech — add the poet if it's a famous sher" },
  ],
  theme: {
    bg: "radial-gradient(120% 80% at 50% 0%, #3A1838 0%, #1E0F24 72%)",
    base: "#1E0F24",
    paper: "#FFF6EC",
    glass: "rgba(255,246,236,0.09)",
    ink: "#FFF6EC",
    inkSoft: "#E8CFC9",
    paperInk: "#3A1838",
    accent: "#E6C27A",
    accentDeep: "#A8823A",
    accentInk: "#1E0F24",
    soft: "#FBEFD9",
    edge: "#EADBC8",
    gold: "#F6E3B4",
    dark: true,
    particles: ["✨", "💫", "⭐"],
    confetti: ["#E6C27A", "#D7263D", "#FFC9D2", "#F6E3B4", "#FFFFFF"],
  },
  demo: {
    recipientName: "Ishita",
    senderName: "Kabir",
    petName: "Jaan",
    letter:
      "Ishita,\n\nI've written this a hundred times in my head — on the metro, in meetings, at 2 am. Every version started differently, but every single one ended the same way: with you.\n\nYou turned my \"main theek hoon\" into \"main bahut khush hoon.\" You've seen my worst moods and stayed for my best jokes. You make the ordinary feel like a festival.\n\nI don't have a grand speech or a stadium. I just have this little box, a slightly shaky heart, and one question I've been carrying for a long time.\n\nSo, on this Propose Day, from one knee (figuratively — my knees are already shaking)…\n\nKabir",
    photos: demoPhotos([
      ["where it started", "You laughed at my worst joke. I decided right there."],
      ["first chai, officially", "Cutting chai, two biscuits, four hours. The stall owner knew before we did."],
      ["our first fight 🙈", "Over the AC temperature. We both lost. Worth it."],
      ["today", "And every day after this one, if you'll have me."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    music: true,
    endLine: "Best yes of my life. Ab koi return policy nahi 💍",
    extras: {
      question: "Will you be mine, forever? 💍",
      teaser: "I've practised this a hundred times. Here goes…",
      reasons: ["You make Monday feel like Friday.", "You remember how I take my chai.", "My future just looks like you."],
      moments: [
        { when: "Mar 2023", what: "The day we met at Riya's party" },
        { when: "Jun 2023", what: "You stole my umbrella ☔" },
        { when: "Dec 2023", what: "First Diwali with your family 🪔" },
        { when: "Today", what: "One little box, one big question" },
      ],
      ringStyle: "solitaire",
      stoneColor: "diamond",
      noMode: "both",
      noLines: ["Are you sure? 🥺", "Pakka?", "Soch lo ek baar…", "Galti se dab gaya na?", "Okay, I'll ask again 😌"],
      afterYes: "You just made me the happiest person alive. Ab toh tum fas gaye 😄❤️",
      shayari: "Main tere saath sitaaron se guzar sakta hoon,\nKitna aasaan mohabbat ka safar lagta hai. — Bashir Badr",
    },
  },
  copy: {
    recipientPlaceholder: "who you're asking — e.g. Ishita",
    senderPlaceholder: "your name, as they say it",
    petNamePlaceholder: "the name only you call them",
    letterPlaceholder: "Your speech. Say where you'd do this in real life, what you'd be nervous about, and why it's them…",
    letterHint: "Typed out like a speech from a scroll in the ring-box lid. Lead up to the question — the foil reveals it after.",
    photosHint: "Your photos light up along the “how we got here” timeline.",
    captionHint: "caption — e.g. where it started",
    noteHint: "what you remember about that day…",
    endLinePlaceholder: "Best yes of my life 💍",
    endLineHint: "Shown after the YES fireworks.",
    sheetTitle: "Plan the proposal 💍",
    sheetSub: "The question, the speech, the runaway No. Everything is pre-filled — make it sound like you.",
    extrasTitle: "The proposal",
    extrasSub: "The question, the ring, the No button's excuses",
    publishing: "Polishing the ring…",
    storyTitle: "Let's write your proposal 💍",
    replyText: "YES 💍 Obviously. Pagal, you didn't even need the box.",
  },
  share: { title: "I have something to ask you 💍", accent: "#A8823A" },
};
