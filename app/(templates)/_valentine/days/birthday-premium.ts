// ─── Birthday Surprise ✦ Premium — a pop-up birthday storybook ──────────────
//
// An evergreen ✦ premium occasion on the Valentine engine (like Sorry and
// Happy Birthday), all copy English with a little Hinglish. Server twin:
// server/src/config/valentineDays.ts ("birthday-premium"); keys and limits
// must match (valentineDays.test.ts pins them).
//
// The premium edition of /happy-birthday, with none of its mechanics: a
// storybook-carnival built from what the paid "birthday website" makers sell
// (a years-together timeline, reasons, a real gift reveal, a keepsake) —
// app/(templates)/birthday-premium/components:
//   peel the storybook cover up (the pop-up rises) → make a wish and blow the
//   dandelion (mic, or swipe the wind) → a hot-air balloon ride over our
//   milestones (days together) → the claw machine (each capsule a reason) →
//   the photo booth (a strip that develops as they shake it) → bake the cake
//   (stack, frost, sprinkle, topper) → scratch the golden ticket → pull the
//   tab of the pop-up letter → "Birthday date with me tonight?" ("hmm…" spins
//   a wheel that only says yes) → when? → the stamped birthday passport.
//
// The sender picks one of four pastel looks (extras.palette); the whole page
// is re-skinned from BP_PALETTES, the editor's own chrome stays Buttercream.

import type { DayConfig, GifSlot } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { TRACK_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "birthday-premium" as const;

export type BpTone = "cute" | "emotional" | "funny";
export type BpPalette = "buttercream" | "lavenderMacaron" | "peachSorbet" | "cottonCandy";

export interface BpMilestone {
  when: string;
  title: string;
  line: string;
}

export interface BpExtras {
  palette: BpPalette;
  tone: BpTone;
  /** The topper on the cake they bake ("" = a heart). */
  age: string;
  /** YYYY-MM-DD or "" — the days-together counter on the balloon ride. */
  togetherSince: string;
  coverLine: string;
  /** One wish on each dandelion seed. */
  wishes: string[];
  milestones: BpMilestone[];
  /** One reason in each claw-machine capsule. */
  reasons: string[];
  cakeLine: string;
  ticketTitle: string;
  ticketLine: string;
  question: string;
  yesLine: string;
  askWhen: "yes" | "no";
  [k: string]: unknown;
}

/** One frosting the recipient can pick in the bakery. */
export interface BpFrosting {
  name: string;
  color: string;
  /** The drip / piping shade. */
  deep: string;
}

/** One pastel look: the page theme plus the few extra paints the scenes use. */
export interface BpPaletteDef {
  label: string;
  swatch: string;
  theme: DayTheme;
  /** Pale tint for cards, pages, the wipe. */
  blush: string;
  /** The deepest tint (outlines, shadows). */
  deep: string;
  /** The second colour of the look (stripes, the balloon's panels). */
  second: string;
  /** Floating bits in the background. */
  floats: readonly string[];
  /** Capsules, bunting, booth stripes — in order. */
  pops: readonly string[];
  /** The bakery's three frostings. */
  frostings: readonly BpFrosting[];
  sponge: string;
}

const pal = (
  label: string,
  c: { bg: string; bg2: string; surface: string; primary: string; accent: string; accentDeep: string; text: string; textSoft: string; soft: string; edge: string; blush: string; deep: string; second: string },
  floats: readonly string[],
  confetti: readonly string[],
  pops: readonly string[],
  frostings: readonly BpFrosting[],
  sponge: string,
): BpPaletteDef => ({
  label,
  swatch: c.accent,
  blush: c.blush,
  deep: c.deep,
  second: c.second,
  floats,
  pops,
  frostings,
  sponge,
  theme: {
    bg: `radial-gradient(120% 70% at 50% 0%, ${c.surface} 0%, ${c.bg} 46%, ${c.bg2} 100%)`,
    base: c.bg,
    paper: c.surface,
    glass: "rgba(255,255,255,0.62)",
    ink: c.text,
    inkSoft: c.textSoft,
    paperInk: c.text,
    accent: c.accent,
    accentDeep: c.accentDeep,
    accentInk: "#FFFFFF",
    soft: c.soft,
    edge: c.edge,
    gold: c.primary,
    dark: false,
    particles: floats,
    confetti,
  },
});

/** The four looks the sender can pick — each one a pastel dessert. */
export const BP_PALETTES: Record<BpPalette, BpPaletteDef> = {
  buttercream: pal(
    "Buttercream & Strawberry",
    { bg: "#FFF8E8", bg2: "#FFE8C4", surface: "#FFFFFF", primary: "#FFCF5C", accent: "#E5527A", accentDeep: "#BE355D", text: "#4E2632", textSoft: "#7D5260", soft: "#FFF1D6", edge: "#F5D7A3", blush: "#FFE4EA", deep: "#A02B50", second: "#FFCF5C" },
    ["🍓", "🎈", "✨", "🌼"],
    ["#E5527A", "#FFCF5C", "#8FD6C2", "#FFFFFF", "#B9A6F2", "#FF9F86"],
    ["#E5527A", "#FFCF5C", "#8FD6C2", "#B9A6F2", "#FF9F86", "#7FC3F0"],
    [
      { name: "Strawberry", color: "#FFB7C9", deep: "#E5527A" },
      { name: "Vanilla", color: "#FFF4D9", deep: "#F2C46A" },
      { name: "Pistachio", color: "#CDEBC7", deep: "#7DBE84" },
    ],
    "#F7D9A8",
  ),
  lavenderMacaron: pal(
    "Lavender Macaron",
    { bg: "#F8F3FF", bg2: "#E7DBFC", surface: "#FFFFFF", primary: "#CDB7F6", accent: "#8B66D9", accentDeep: "#6A48BD", text: "#33275A", textSoft: "#605386", soft: "#F0E8FF", edge: "#D9CBF7", blush: "#F2E8FF", deep: "#5638A6", second: "#FFB8D8" },
    ["💜", "🎈", "✨", "🦋"],
    ["#8B66D9", "#CDB7F6", "#FFB8D8", "#FFFFFF", "#FFE08A", "#9EDCCB"],
    ["#8B66D9", "#FFB8D8", "#FFE08A", "#9EDCCB", "#CDB7F6", "#8FC2F2"],
    [
      { name: "Ube", color: "#D9C6FA", deep: "#8B66D9" },
      { name: "Rose", color: "#FFD0E3", deep: "#E77AAA" },
      { name: "Lemon", color: "#FFF1B8", deep: "#E9C350" },
    ],
    "#F3DDB6",
  ),
  peachSorbet: pal(
    "Peach Sorbet",
    { bg: "#FFF5EF", bg2: "#FFDDCB", surface: "#FFFFFF", primary: "#FFB98F", accent: "#E86A4A", accentDeep: "#BF4C33", text: "#52281D", textSoft: "#83574A", soft: "#FFEADF", edge: "#F8CFBA", blush: "#FFE4D8", deep: "#A3402B", second: "#9FDCC9" },
    ["🍑", "🎈", "✨", "🌷"],
    ["#E86A4A", "#FFB98F", "#9FDCC9", "#FFFFFF", "#FFD86E", "#F6A2BD"],
    ["#E86A4A", "#9FDCC9", "#FFD86E", "#F6A2BD", "#FFB98F", "#A9B8F5"],
    [
      { name: "Peach", color: "#FFCDB2", deep: "#E86A4A" },
      { name: "Mango", color: "#FFE3A3", deep: "#F0B13E" },
      { name: "Mint", color: "#CFF0E3", deep: "#6FC0A3" },
    ],
    "#F6D7A9",
  ),
  cottonCandy: pal(
    "Cotton Candy Sky",
    { bg: "#F2F8FF", bg2: "#DAEAFE", surface: "#FFFFFF", primary: "#FFB9D6", accent: "#3F82D6", accentDeep: "#2A66B5", text: "#1D3352", textSoft: "#4C6283", soft: "#E5F1FF", edge: "#C6DCF6", blush: "#FFE6F1", deep: "#22559B", second: "#FFB9D6" },
    ["☁️", "🎈", "✨", "💙"],
    ["#3F82D6", "#FFB9D6", "#FFFFFF", "#FFE08A", "#A8E0CF", "#C6B2F5"],
    ["#FF8DBB", "#6FA8EC", "#FFE08A", "#A8E0CF", "#C6B2F5", "#FFB38F"],
    [
      { name: "Cotton candy", color: "#FFD1E5", deep: "#FF8DBB" },
      { name: "Blueberry", color: "#CFE2FC", deep: "#6FA8EC" },
      { name: "Vanilla", color: "#FFF6DE", deep: "#EBC66E" },
    ],
    "#F5DDB4",
  ),
};

export const BP_PALETTE_KEYS = Object.keys(BP_PALETTES) as BpPalette[];

/**
 * What the feel changes when the sender leaves a field empty: the question,
 * the YES button, the "hmm…" button's lines, the letter's sign-off and the
 * WhatsApp reply.
 */
export const BP_TONES: Record<BpTone, { question: string; yes: string; hmm: readonly string[]; reply: string; signOff: string }> = {
  cute: {
    question: "Birthday date with me tonight? 🥂",
    yes: "Yes, it's a date 💗",
    hmm: ["Hmm… 🤔", "Spin again?", "One more spin 🙈"],
    reply: "This was the cutest birthday surprise EVER 🥹💗 Yes, it's a date!",
    signOff: "Forever yours,",
  },
  emotional: {
    question: "Spend tonight with me, just us? 🤍",
    yes: "Yes, always 🤍",
    hmm: ["Let me think…", "Think again?", "Okay, one more"],
    reply: "I'm actually crying 🥹🤍 Best birthday gift ever. Yes, tonight!",
    signOff: "All my love, always,",
  },
  funny: {
    question: "Birthday date? I'm paying (this once) 🍕",
    yes: "Deal, you're paying 😌",
    hmm: ["Hmm, convince me", "Rigged? Spin again", "Fine, last spin"],
    reply: "Okay this was ridiculously cute 😭🎂 Yes! And yes, you're paying.",
    signOff: "Your favourite clown,",
  },
};

/** The prize wheel behind "hmm…" — every slice is a yes. */
export const BP_WHEEL: readonly string[] = ["YES", "Obviously", "Yes 💗", "100%", "Duh, yes", "YES!!"];

/** After YES (extras.askWhen "yes"): when the date is. Index + 1 goes to the server as reactions.count. */
export const BP_PLANS: readonly { label: string; emoji: string }[] = [
  { label: "Tonight", emoji: "🌙" },
  { label: "This weekend", emoji: "🗓️" },
  { label: "You plan it, surprise me", emoji: "✨" },
];

export const DEFAULT_WISHES: readonly string[] = [
  "more lazy Sunday mornings",
  "the trip you keep talking about",
  "every dream, a little closer",
  "zero bad hair days",
  "me, right next to you",
];

export const DEFAULT_MILESTONES: readonly BpMilestone[] = [
  { when: "The beginning", title: "The day we met 👋", line: "I didn't know it yet, but my favourite chapter had started." },
  { when: "A little later", title: "Our first date ☕", line: "You talked, I forgot my coffee. Worth it." },
  { when: "Somewhere along", title: "The first 'I love you' 💗", line: "Said it too fast. Meant it more than anything." },
  { when: "Today", title: "Your birthday 🎂", line: "And somehow I love you more than on page one." },
];

export const DEFAULT_REASONS: readonly string[] = [
  "Your laugh. The real one, the one that snorts a little.",
  "You remember the tiniest things about me.",
  "How you make every boring errand feel like a date.",
  "Your sleepy voice on late-night calls.",
  "You're my favourite person to do absolutely nothing with.",
  "You make me want to be a softer, braver person.",
];

export const DEFAULT_CAKE_LINE = "Best baker in the world. Still not as sweet as you 🍰";
export const DEFAULT_TICKET_TITLE = "One perfect birthday date 🌇";
export const DEFAULT_TICKET_LINE = "Dress cute, keep your evening free. I'll handle everything else.";
export const DEFAULT_COVER_LINE = "a little storybook about my favourite person";

/**
 * English + Hindi romantic songs, one tap each in the form; the sender can
 * still paste any YouTube link. Official label/artist uploads — every id
 * checked with YouTube oEmbed and the embed player (playable off-site) on
 * 2026-10-14. Audio only. No overlap with /happy-birthday's list.
 */
export const BP_SONGS: readonly SongSuggestion[] = [
  { id: "PEM0Vs8jf1w", title: "golden hour", artist: "JVKE" },
  { id: "-BjZmE2gtdo", title: "Lover", artist: "Taylor Swift" },
  { id: "ApXoWvfEYVU", title: "Sunflower", artist: "Post Malone, Swae Lee" },
  { id: "GxldQ9eX2wo", title: "Until I Found You", artist: "Stephen Sanchez" },
  { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran" },
  { id: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh · Aashiqui 2" },
  { id: "mQiiw7uRngk", title: "Tera Ban Jaunga", artist: "Akhil Sachdeva, Tulsi Kumar · Kabir Singh" },
  { id: "u2NAuswnTKs", title: "Apna Bana Le", artist: "Arijit Singh · Bhediya" },
  { id: "iSUK1QoK9-E", title: "Pehla Nasha", artist: "Udit Narayan, Sadhana Sargam · Jo Jeeta Wohi Sikandar" },
  { id: "mt9xg0mmt28", title: "Tum Se Hi", artist: "Mohit Chauhan · Jab We Met" },
];

/**
 * The page's own song (music mode "track"), from our CDN, so it starts on
 * their first tap with no YouTube player to wait for. A bouncy carnival song —
 * not /happy-birthday's Best Day of My Life. The songs above are the swaps.
 */
export const BP_TRACK = {
  url: "https://cdn.subhsandesh.in/gifts-media/assets/Birthday1/GoodTime.mp3",
  title: "Good Time",
  artist: "Owl City & Carly Rae Jepsen",
  hint: "Owl City & Carly Rae Jepsen · plays first",
} as const;

const GIFS: GifSlot[] = [
  { id: "bp-wake", label: "Surprise!", moment: "Popping out of the storybook", file: "bp-wake.webp", emoji: "📖", anim: "wiggle" },
  { id: "bp-dance", label: "We won!", moment: "Dancing by the claw machine", file: "bp-dance.webp", emoji: "🧸", anim: "bounce" },
  { id: "bp-cake", label: "Cake time", moment: "Beside the cake they baked", file: "bp-cake.webp", emoji: "🎂", anim: "float" },
  { id: "bp-gift", label: "Your gift", moment: "Next to the golden ticket", file: "bp-gift.webp", emoji: "🎟️", anim: "float" },
  { id: "bp-kiss", label: "It's a date!", moment: "After they say yes", file: "bp-kiss.webp", emoji: "💋", anim: "bounce" },
];

export const birthdayPremiumDay: DayConfig<BpExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "A Birthday Storybook",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 30,
  asksQuestion: true,
  melody: "blush",
  photoAspect: 1,
  gifSlots: GIFS,
  topBar: true,
  brandMark: "stacked",
  music: {
    audioOnly: true,
    compact: true,
    track: BP_TRACK,
    suggestions: BP_SONGS,
    suggestionsNote: "Romantic English + Hindi songs · tap one, or paste any YouTube link",
  },
  extras: [
    {
      key: "palette", kind: "enum", label: "Pick the look", display: "swatches", default: "buttercream",
      hint: "The whole storybook turns this colour — the pages, the balloon, the claw machine, the cake, the passport.",
      options: BP_PALETTE_KEYS.map((k) => ({ value: k, label: BP_PALETTES[k].label, swatch: BP_PALETTES[k].swatch })),
    },
    {
      key: "tone", kind: "enum", label: "The feel", display: "cards", default: "cute",
      hint: "Changes the default question, the letter's sign-off and the reply they send back.",
      options: [
        { value: "cute", label: "Cute", emoji: "🥰", hint: "soft, sweet, a little giggly" },
        { value: "emotional", label: "Emotional", emoji: "🥹", hint: "make them cry (happy tears)" },
        { value: "funny", label: "Funny", emoji: "😜", hint: "teasing, inside-joke energy" },
      ],
    },
    {
      key: "age", kind: "text", max: 3, label: "The topper on their cake (optional)",
      placeholder: "e.g. 24 — leave empty for a heart",
      hint: "They bake a cake in the storybook; this number goes on top. Also printed in their birthday passport.",
    },
    {
      key: "togetherSince", kind: "text", max: 10, input: "date", label: "Together since (optional)",
      hint: "The balloon ride counts the days you've been together. Leave empty to hide the counter.",
    },
    {
      key: "coverLine", kind: "text", max: 60, label: "On the storybook cover",
      placeholder: DEFAULT_COVER_LINE,
      hint: "Printed under their name on the very first screen.",
      suggestions: [DEFAULT_COVER_LINE, "the birthday book of the cutest human alive", "chapter 1: you, being born. best plot twist ever"],
    },
    {
      key: "wishes", kind: "list", maxItems: 5, itemMax: 40, label: "Dandelion wishes for their year",
      hint: "They make a wish and blow the dandelion — each seed floats away carrying one of these.",
      itemLabels: ["Seed 1", "Seed 2", "Seed 3", "Seed 4", "Seed 5"],
      itemPlaceholder: DEFAULT_WISHES,
    },
    {
      key: "milestones", kind: "objlist", maxItems: 5, itemTitle: "Milestone", addLabel: "+ add a milestone",
      label: "The balloon ride: our story",
      hint: "A hot-air balloon floats over these, in order — how you met, the first date, a trip, today.",
      item: [
        { key: "when", kind: "text", max: 24, label: "When", placeholder: "June 2023" },
        { key: "title", kind: "text", max: 40, label: "What happened", placeholder: "Our first date ☕" },
        { key: "line", kind: "text", max: 80, label: "What you remember", placeholder: "You talked, I forgot my coffee. Worth it." },
      ],
    },
    {
      key: "reasons", kind: "list", maxItems: 6, itemMax: 80, label: "Claw machine: reasons I love you",
      hint: "They play a claw machine — every capsule they win holds one of these.",
      itemLabels: ["Capsule 1", "Capsule 2", "Capsule 3", "Capsule 4", "Capsule 5", "Capsule 6"],
      itemPlaceholder: DEFAULT_REASONS,
    },
    {
      key: "cakeLine", kind: "text", max: 90, label: "After they bake the cake",
      placeholder: DEFAULT_CAKE_LINE,
      hint: "They stack the tiers, pick the frosting, add sprinkles and the topper — then this appears.",
      suggestions: [DEFAULT_CAKE_LINE, "You baked it, I'll eat it. Teamwork 🍰"],
    },
    {
      key: "ticketTitle", kind: "text", max: 32, label: "The golden ticket: your real gift",
      placeholder: DEFAULT_TICKET_TITLE,
      hint: "They scratch off a golden ticket to find this — a real plan or gift waiting for them.",
      suggestions: [DEFAULT_TICKET_TITLE, "A weekend away, just us 🧳", "Dinner at your favourite place 🍝"],
    },
    {
      key: "ticketLine", kind: "text", max: 90, label: "The ticket's small print",
      placeholder: DEFAULT_TICKET_LINE,
      suggestions: [DEFAULT_TICKET_LINE],
    },
    {
      key: "question", kind: "text", max: 60, label: "The big question",
      placeholder: "leave empty to use the one for the feel you picked",
      hint: "If they tap “hmm…”, a prize wheel spins — and every slice says yes.",
      suggestions: ["Birthday date with me tonight? 🥂", "Can I spoil you all day? 🥺", "Dinner, cake and me? 🍰"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "After they say yes",
      placeholder: "what you'd say the second they say yes",
      suggestions: ["Best birthday gift? You saying yes. Wear something cute 💗"],
    },
    {
      key: "askWhen", kind: "enum", label: "Then ask them when?", display: "cards", default: "yes",
      hint: "After YES they pick: tonight, this weekend, or “you plan it”. Their pick is in your email.",
      options: [
        { value: "yes", label: "Yes, ask when", emoji: "🗓️", hint: "tonight · weekend · surprise me" },
        { value: "no", label: "Just the yes", emoji: "💗" },
      ],
    },
  ],
  theme: BP_PALETTES.buttercream.theme,
  demo: {
    recipientName: "Riya",
    senderName: "Aarav",
    petName: "Cutu",
    letter:
      "Happy birthday to the main character of my favourite story.\n\nI still remember the first time you laughed at one of my terrible jokes — I decided right then I'd spend my life making you do that again. You're the softest, funniest, bravest person I know, and somehow you picked me to be in your book.\n\nThis year I hope you get every single thing you wished for: the big dreams, the small wins, the lazy Sundays, the extra cheese. And I hope I get to turn every page of it right next to you.\n\nThank you for being born. The world got so much better that day, and so did mine.",
    photos: demoPhotos([
      ["our first date", "You were nervous. I was more nervous. Best evening ever."],
      ["that beach trip", "Sunburnt, sandy and so happy."],
      ["your last birthday", "The cake face. I'd travel anywhere to see it again."],
      ["us, always", "My favourite place in the world is next to you."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...TRACK_DEMO,
    endLine: "Here's to your best chapter yet 🥂",
    extras: {
      palette: "buttercream",
      tone: "cute",
      age: "24",
      togetherSince: "2023-02-14",
      coverLine: DEFAULT_COVER_LINE,
      wishes: [...DEFAULT_WISHES],
      milestones: DEFAULT_MILESTONES.map((m) => ({ ...m })),
      reasons: [...DEFAULT_REASONS],
      cakeLine: DEFAULT_CAKE_LINE,
      ticketTitle: DEFAULT_TICKET_TITLE,
      ticketLine: DEFAULT_TICKET_LINE,
      question: "Birthday date with me tonight? 🥂",
      yesLine: "Best birthday gift? You saying yes. Wear something cute 💗",
      askWhen: "yes",
    },
  },
  copy: {
    recipientPlaceholder: "whose birthday it is — e.g. Riya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — cutu, jaan, baby…",
    letterPlaceholder: "Your birthday letter: a memory with them, what you love about them, and what you wish for them this year.",
    letterHint: "The last chapter of the storybook — a pop-up card they pull open.",
    photosHint: "Your photos print out of a photo booth as a strip they shake to develop.",
    captionHint: "caption — e.g. our first date",
    noteHint: "what you remember about that moment…",
    endLinePlaceholder: "Here's to your best chapter yet 🥂",
    endLineHint: "The last line, printed in their birthday passport.",
    sheetTitle: "Make their birthday storybook 📖",
    sheetSub: "Pick a look, add your story, the reasons, the wishes and your letter. Everything is pre-filled, so make it yours.",
    extrasTitle: "Your storybook",
    extrasSub: "The look, the feel, the wishes, your milestones, the reasons, the cake, the golden ticket and the question",
    publishing: "Binding your storybook…",
    storyTitle: "Let's write their birthday storybook 📖",
    replyText: "This was the cutest birthday surprise EVER 🥹💗 Yes, it's a date!",
    yesChip: "Said YES 🎂",
  },
  share: { title: "Happy Birthday 📖 Someone made you a storybook", accent: "#BE355D" },
};
