import type { DayConfig, GifSlot } from "../types";
import { MUSIC_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "happy-valentines-day" as const;

/** weekLines[i] belongs to these days, in order. */
export const WEEK_LINE_DAYS = ["Rose Day 🌹", "Propose Day 💍", "Chocolate Day 🍫", "Teddy Day 🧸", "Promise Day 🤞", "Hug Day 🤗", "Kiss Day 💋"] as const;

export interface ValentinesExtras {
  ticketLine: string;
  weekLines: string[];
  togetherSince: string;
  stats: { label: string; value: string }[];
  metPlace: string;
  question: string;
  noLines: string[];
  datePlan: string;
  ps: string;
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "v1-invite", label: "Invite", moment: "Beside the ADMIT TWO ticket", file: "v1-invite.gif", emoji: "🎟️", anim: "float" },
  { id: "v2-wrapped", label: "Love Wrapped", moment: "The stat cards", file: "v2-wrapped.gif", emoji: "🕺", anim: "bounce" },
  { id: "v3-gift", label: "Gift box", moment: "The gift box opens", file: "v3-gift.gif", emoji: "🎁", anim: "wiggle" },
  { id: "v4-please", label: "Please?", moment: "“Be my Valentine?” while No runs", file: "v4-please.gif", emoji: "🥺", anim: "pulse" },
  { id: "v5-forever", label: "Forever", moment: "The lantern finale", file: "v5-forever.gif", emoji: "🏮", anim: "float" },
];

export const valentinesDay: DayConfig<ValentinesExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Our Valentine Night",
  maxPhotos: 9,
  letterMax: 2000,
  letterMin: 80,
  asksQuestion: true,
  melody: "lantern",
  photoAspect: 4 / 5,
  gifSlots: GIFS,
  extras: [
    { key: "ticketLine", kind: "text", max: 50, label: "Ticket tagline", placeholder: "the fine print on your ADMIT TWO ticket", suggestions: ["Admit two · one night · forever seats", "Row 1, Seat 2 · next to me, always"] },
    {
      key: "weekLines", kind: "list", maxItems: 7, itemMax: 70, label: "A line for each day of the week",
      hint: "Each one lights a lantern. Leave any blank and that lantern just glows.",
      itemLabels: WEEK_LINE_DAYS,
      itemPlaceholder: ["the rose was just an excuse…", "what you'd ask again", "the sweet thing you don't share", "something to hug when you can't", "the promise that matters", "what their jhappi fixes", "sealed every day with…"],
    },
    { key: "togetherSince", kind: "text", max: 10, input: "date", label: "Together since", hint: "Starts a live together-timer. Leave empty to hide it." },
    {
      key: "stats", kind: "objlist", maxItems: 5, label: "Love Wrapped cards", itemTitle: "Card", addLabel: "+ add a card",
      hint: "Your year-in-review, in stats only you two get.",
      item: [
        { key: "label", kind: "text", max: 30, label: "Stat", placeholder: "Hoodies you stole" },
        { key: "value", kind: "text", max: 24, label: "Value", placeholder: "∞" },
      ],
    },
    { key: "metPlace", kind: "text", max: 40, label: "Where you met", placeholder: "the exact spot — e.g. college canteen, Pune" },
    {
      key: "question", kind: "text", max: 60, label: "The big question", placeholder: "the forever question",
      suggestions: ["Will you be my Valentine… forever?", "Will you be mine, every February?", "Will you marry me? 💍"],
    },
    { key: "noLines", kind: "list", maxItems: 10, itemMax: 40, label: "What “No” says as it runs", itemPlaceholder: "Error 404: No not found", addLabel: "+ add a line" },
    { key: "datePlan", kind: "text", max: 80, label: "Tonight's plan (optional)", placeholder: "8 PM · that rooftop place · wear the red one" },
    { key: "ps", kind: "text", max: 100, label: "P.S.", placeholder: "a tease about tonight, or an inside joke" },
  ],
  theme: {
    bg: "radial-gradient(130% 80% at 50% 100%, #4A1A4F 0%, #2A1240 45%, #12081F 100%)",
    base: "#12081F",
    paper: "#FFF6E5",
    glass: "rgba(255,246,229,0.08)",
    ink: "#FFF6E5",
    inkSoft: "#E6CFE0",
    paperInk: "#2A1240",
    accent: "#F5C66B",
    accentDeep: "#C48F2E",
    accentInk: "#12081F",
    soft: "#FBEBCB",
    edge: "#EADCC4",
    gold: "#FFB347",
    dark: true,
    particles: ["✨", "🏮", "💫", "💘"],
    confetti: ["#F5C66B", "#E8436E", "#FFB347", "#FFD6E0", "#E8A598"],
  },
  demo: {
    recipientName: "Ananya",
    senderName: "Aarav",
    petName: "Jaan",
    letter:
      "Happy Valentine's Day, Ananya 💘\n\nWe've done roses, teddies, too many chocolates and one very dramatic Promise Day. But today isn't about another gift — it's about us.\n\nThank you for being my calm on loud days, my favourite notification, and the person I want to tell everything to first. Tum ho toh sab theek lagta hai.\n\nI don't know everything about the future, but I know I want you in every chapter of it.\n\nSo tonight, one more time —\n\nForever yours,\nAarav",
    photos: demoPhotos([
      ["our first trip — Goa, 2024", "You said the sky looked like mango lassi. I have not stopped thinking about it."],
      ["date night, round 1", "You stole my fries and then my heart. In that order."],
      ["cherry blossom era", "Even the trees were showing off for you that day."],
      ["us, forever", "Out of every timeline, I'd pick this one. Every time."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...MUSIC_DEMO,
    endLine: "Every February. Every day in between. 💘",
    extras: {
      ticketLine: "Admit two · one night · forever seats",
      weekLines: [
        "The rose was just an excuse to see you smile.",
        "I'd ask you again, every single day.",
        "Still the only sweet thing I don't share.",
        "Something to hug when I can't.",
        "Main hoon na — always.",
        "Your jhappi fixes everything.",
        "Sealed every day with one more.",
      ],
      togetherSince: "",
      stats: [
        { label: "First 'I love you'", value: "2 a.m., on call" },
        { label: "Our song on repeat", value: "Tum Se Hi" },
        { label: "Hoodies you stole", value: "∞" },
        { label: "Most-said phrase", value: "'Khana khaya?'" },
      ],
      metPlace: "College canteen, Pune",
      question: "Will you be my Valentine… forever?",
      noLines: ["Galat button dab gaya? 😏", "No has left the chat", "Soch lo ek baar 🥺", "Error 404: No not found", "Mummy se puch ke batao?"],
      datePlan: "",
      ps: "P.S. Dress up. I have plans 😌",
    },
  },
  copy: {
    recipientPlaceholder: "your Valentine — e.g. Ananya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "the name only you get to use",
    letterPlaceholder: "The whole week led here. What you're grateful for, what you want for every chapter after this one…",
    letterHint: "Rises from the grand gift box and unfolds by candlelight, right before the question.",
    photosHint: "Your photos hang on a gallery wall under a spotlight.",
    captionHint: "caption + when — e.g. our first trip, Goa 2024",
    noteHint: "what you'd whisper about this one…",
    endLinePlaceholder: "Every February. Every day in between. 💘",
    endLineHint: "Under the rising lanterns at the very end.",
    sheetTitle: "Plan your Valentine night 💘",
    sheetSub: "The ticket, a lantern for every day, your letter and the forever question. Everything is pre-filled — make it yours.",
    extrasTitle: "The night",
    extrasSub: "Ticket, seven lanterns, Love Wrapped and the question",
    publishing: "Lighting the lanterns…",
    storyTitle: "Let's plan your Valentine night 💘",
    replyText: "YES. Forever. Obviously 💘 Now tell me what to wear.",
  },
  share: { title: "Admit two. Tonight 💘", accent: "#C48F2E" },
};
