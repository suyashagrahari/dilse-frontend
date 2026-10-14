// ─── Happy Anniversary — "Our Little Love Museum" ────────────────────────────
//
// An evergreen ✦ premium occasion on the Valentine engine. Server twin:
// server/src/config/valentineDays.ts ("happy-anniversary"); keys and limits
// must match (valentineDays.test.ts pins them).
//
// The recipient walks through a cosy pastel museum built about the two of
// them (app/(templates)/happy-anniversary/components):
//   the ticket booth (tear the stub off their admission ticket) → the clock
//   room (pull the lever: years / months / days / hours roll up, then the fun
//   stats) → the portrait gallery (swipe the framed photos, each with a museum
//   plaque) → the audio guide (tap an exhibit number: our story, milestone by
//   milestone) → the restoration studio (brush the dust off the first-date
//   painting) → the gift shop (shake the snow globe; a reason settles out of
//   the snow each time) → the guestbook (the letter writes itself in) → "the
//   next exhibition": another year of us? (both buttons say yes) → unveil the
//   Masterpiece of the Year award (keepsake, confetti).
//
// Research (Oct 2026): the "most loved" part of every paid anniversary page is
// the relationship timeline, then the live "time together" counter, then the
// specific inside jokes ("specific beats sentimental"); couples re-open them
// every year, so the keepsake has to be worth a screenshot.
//
// The sender picks one of four light looks (extras.palette); the whole page is
// re-skinned from HA_PALETTES.

import type { DayConfig, GifSlot } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { TRACK_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "happy-anniversary" as const;

export type HaTone = "cute" | "emotional" | "funny";
export type HaRelation = "girlfriend" | "boyfriend" | "wife" | "husband" | "partner";
export type HaPalette = "blushGallery" | "sageCream" | "lavenderMuseum" | "peachMarble";

export interface HaMilestone {
  when: string;
  title: string;
  line: string;
}

export interface HaExtras {
  palette: HaPalette;
  tone: HaTone;
  relation: HaRelation;
  /** yyyy-mm-dd — the clock room counts up from it; the anniversary number comes from it. */
  togetherSince: string;
  /** The small print on the admission ticket. */
  ticketLine: string;
  /** One extra "fun stat" placard in the clock room. */
  funStat: string;
  /** The audio guide: one numbered exhibit per milestone. */
  milestones: HaMilestone[];
  /** The restoration studio: the painting's title and what it shows. */
  firstPlace: string;
  firstMemory: string;
  /** One reason per shake of the snow globe. */
  reasons: string[];
  /** "Featuring…" on the next exhibition's poster. */
  promises: string[];
  /** "Opening night: …" — the date you're planning. */
  plan: string;
  question: string;
  yesLine: string;
  awardTitle: string;
  [k: string]: unknown;
}

/** One look: the page theme plus the few extra paints the rooms use. */
export interface HaPaletteDef {
  label: string;
  swatch: string;
  theme: DayTheme;
  /** Pale tint (plaques, the ticket, the guestbook). */
  blush: string;
  /** The deepest tint (outlines, the pill's lip). */
  deep: string;
  /** The wall, top → bottom, and the wainscot panel at the bottom. */
  wall: readonly [string, string];
  wainscot: string;
  /** Frame gilt, light → dark. */
  gilt: readonly [string, string];
  /** Petals that drift in the finale. */
  petals: readonly string[];
}

const pal = (
  label: string,
  c: { bg: string; bg2: string; surface: string; primary: string; accent: string; accentDeep: string; text: string; textSoft: string; soft: string; edge: string; blush: string; deep: string },
  wall: readonly [string, string],
  wainscot: string,
  gilt: readonly [string, string],
  petals: readonly string[],
  confetti: readonly string[],
): HaPaletteDef => ({
  label,
  swatch: c.accent,
  blush: c.blush,
  deep: c.deep,
  wall,
  wainscot,
  gilt,
  petals,
  theme: {
    bg: `linear-gradient(180deg, ${wall[0]} 0%, ${c.bg} 60%, ${c.bg2} 100%)`,
    base: c.bg,
    paper: c.surface,
    glass: "rgba(255,255,255,0.66)",
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
    particles: petals,
    confetti,
  },
});

/** Four light looks, each a little gallery: pastel walls, gilt frames, soft spotlights. */
export const HA_PALETTES: Record<HaPalette, HaPaletteDef> = {
  blushGallery: pal(
    "Blush Gallery",
    { bg: "#FFF3F5", bg2: "#FBDDE4", surface: "#FFFDFB", primary: "#E9B4C1", accent: "#D9577A", accentDeep: "#AE3558", text: "#4B2331", textSoft: "#76495A", soft: "#FFE6EC", edge: "#F1C9D4", blush: "#FFDDE5", deep: "#922C4A" },
    ["#FFF7F8", "#FCE4EA"],
    "#F6D0DA",
    ["#F3D9A4", "#C9974A"],
    ["🌸", "💗", "🩷", "✨"],
    ["#D9577A", "#F3D9A4", "#FFDDE5", "#FFFFFF", "#E9B4C1"],
  ),
  sageCream: pal(
    "Sage & Cream",
    { bg: "#F6F7EE", bg2: "#E1EAD6", surface: "#FFFEF8", primary: "#B9CDA7", accent: "#5E8C55", accentDeep: "#456E3E", text: "#263524", textSoft: "#506148", soft: "#E8F0DF", edge: "#CCDABF", blush: "#E3ECD7", deep: "#3A5E34" },
    ["#FBFBF4", "#EAF0E0"],
    "#D8E4CA",
    ["#EFDCA8", "#B8914A"],
    ["🌿", "🤍", "🌼", "✨"],
    ["#5E8C55", "#EFDCA8", "#FFFFFF", "#F6C7D1", "#B9CDA7"],
  ),
  lavenderMuseum: pal(
    "Lavender Museum",
    { bg: "#F6F2FF", bg2: "#E4DBFA", surface: "#FFFEFF", primary: "#C9B8F0", accent: "#7C5CCB", accentDeep: "#5F41AE", text: "#2F2552", textSoft: "#5B507E", soft: "#EDE6FD", edge: "#D8CCF5", blush: "#E6DDFB", deep: "#4C3396" },
    ["#FAF8FF", "#ECE5FC"],
    "#DCD0F6",
    ["#F1DDB0", "#BE9853"],
    ["🪻", "💜", "🌸", "✨"],
    ["#7C5CCB", "#F1DDB0", "#FFFFFF", "#FFB6D9", "#C9B8F0"],
  ),
  peachMarble: pal(
    "Peach Marble",
    { bg: "#FFF6EF", bg2: "#FBE0CF", surface: "#FFFDFA", primary: "#F2BE9E", accent: "#D46A3F", accentDeep: "#AC4E27", text: "#4D2A1C", textSoft: "#7A5240", soft: "#FFEADD", edge: "#F2CDB6", blush: "#FFE1D0", deep: "#93401E" },
    ["#FFFAF5", "#FDE9DC"],
    "#F6D5C1",
    ["#F4DDA9", "#C4964B"],
    ["🍑", "🧡", "🌷", "✨"],
    ["#D46A3F", "#F4DDA9", "#FFFDFA", "#FFB0C4", "#F2BE9E"],
  ),
};

export const HA_PALETTE_KEYS = Object.keys(HA_PALETTES) as HaPalette[];

/** What the tone changes when the sender leaves a field empty. */
export const HA_TONES: Record<
  HaTone,
  { question: string; yes: string; yes2: string; award: string; reply: string; ticket: string; guide: string }
> = {
  cute: {
    question: "Another year of us? 🥺💗",
    yes: "Yes, always 💗",
    yes2: "Obviously, forever ✨",
    award: "Masterpiece of the Year",
    reply: "Yes yes yes 💗 Another year, and every year after. Happy anniversary!",
    ticket: "valid for one cuddle at the exit",
    guide: "Hi, I'm your audio guide. I'll be very biased.",
  },
  emotional: {
    question: "Will you keep choosing us, for another year?",
    yes: "Every single day 🤍",
    yes2: "For all of them",
    award: "Masterpiece of a Lifetime",
    reply: "I read every word, and I'd choose you again in every life 🤍 Happy anniversary.",
    ticket: "no expiry date. ever.",
    guide: "Every exhibit here is a day I'd live again.",
  },
  funny: {
    question: "Another year of putting up with me? 🙈",
    yes: "Fine, one more year 😤💗",
    yes2: "Forever, you idiot 💗",
    award: "Most Patient Human of the Year",
    reply: "Fine, one more year 😤💗 (forever, obviously). Happy anniversary, idiot.",
    ticket: "no refunds. no exchanges. no escape.",
    guide: "Please do not touch the exhibits. Except me. You can touch me.",
  },
};

export const HA_TONE_KEYS = Object.keys(HA_TONES) as HaTone[];

/** Who it's for: the word on the award and in a few lines. */
export const HA_RELATIONS: Record<HaRelation, { word: string; married: boolean }> = {
  girlfriend: { word: "girlfriend", married: false },
  boyfriend: { word: "boyfriend", married: false },
  wife: { word: "wife", married: true },
  husband: { word: "husband", married: true },
  partner: { word: "partner", married: false },
};

export const HA_RELATION_KEYS = Object.keys(HA_RELATIONS) as HaRelation[];

export const DEFAULT_MILESTONES: readonly HaMilestone[] = [
  { when: "Feb 2023", title: "The day we met", line: "You laughed at my terrible joke. Nobody had ever done that before." },
  { when: "Mar 2023", title: "Our first date", line: "Two coffees, four hours, and a waiter who gave up on us." },
  { when: "Dec 2023", title: "Our first trip", line: "We got lost in the hills and it was the best wrong turn of my life." },
  { when: "Aug 2024", title: "The first 'I love you'", line: "You said it first. I'll keep saying it back forever." },
];

export const DEFAULT_REASONS: readonly string[] = [
  "You make the boring days feel like holidays.",
  "You still hold my hand like it's the first time.",
  "You know my coffee order better than I do.",
  "Home isn't a place anymore. It's you.",
];

export const DEFAULT_PROMISES: readonly string[] = [
  "More road trips, fewer screens",
  "Breakfast in bed, once a month",
  "Every fight ends with a hug",
];

/**
 * One tap each in the form; the sender can still paste any YouTube link.
 * English + Hindi anniversary songs. Official uploads — every id checked with
 * YouTube oEmbed (200) and the embed player (playable off-site) on 2026-10-15.
 */
export const HA_SONGS: readonly SongSuggestion[] = [
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran" },
  { id: "kPa7bsKwL-c", title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars" },
  { id: "-BjZmE2gtdo", title: "Lover", artist: "Taylor Swift" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "IJq0yyWug1k", title: "Tum Hi Ho", artist: "Arijit Singh" },
  { id: "ilNt2bikxDI", title: "Jo Tum Mere Ho", artist: "Anuv Jain" },
  { id: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal, Asees Kaur" },
  { id: "g5WZLO8BAC8", title: "Tere Vaaste", artist: "Varun Jain, Shilpa Rao" },
];

/** The page's own song (music mode "track"), from our CDN, so it starts on the first tap. */
export const HA_TRACK = {
  url: "https://cdn.subhsandesh.in/gifts-media/assets/LoveGf/music/perfect.mp3",
  title: "Perfect",
  artist: "Ed Sheeran",
  hint: "Ed Sheeran · plays first",
} as const;

const GIFS: GifSlot[] = [
  { id: "h1-welcome", label: "Welcome!", moment: "Waving at the ticket booth", file: "h1-welcome.webp", emoji: "🎟️", anim: "wiggle" },
  { id: "h2-together", label: "Cuddles", moment: "Snuggled up beside the clock", file: "h2-together.webp", emoji: "🥰", anim: "float" },
  { id: "h3-gallery", label: "Love you", moment: "Next to the portrait gallery", file: "h3-gallery.webp", emoji: "💞", anim: "bounce" },
  { id: "h4-globe", label: "Kisses", moment: "Beside the snow globe", file: "h4-globe.webp", emoji: "😘", anim: "float" },
  { id: "h5-yes", label: "Yay!", moment: "Dancing after they say yes", file: "h5-yes.webp", emoji: "💃", anim: "bounce" },
  { id: "h6-award", label: "Happy anniversary", moment: "On the award plaque", file: "h6-award.webp", emoji: "🏆", anim: "pulse" },
];

export const happyAnniversaryDay: DayConfig<HaExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Our Little Love Museum — Happy Anniversary",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 30,
  asksQuestion: true,
  melody: "paper",
  photoAspect: 0.8,
  gifSlots: GIFS,
  topBar: true,
  brandMark: "stacked",
  music: {
    audioOnly: true,
    compact: true,
    track: HA_TRACK,
    suggestions: HA_SONGS,
    suggestionsNote: "English + Hindi · tap one, or paste any YouTube link",
  },
  extras: [
    {
      key: "palette", kind: "enum", label: "Pick the museum", display: "swatches", default: "blushGallery",
      hint: "The whole museum wears it: the walls, the frames, the ticket, the award.",
      options: HA_PALETTE_KEYS.map((k) => ({ value: k, label: HA_PALETTES[k].label, swatch: HA_PALETTES[k].swatch })),
    },
    {
      key: "tone", kind: "enum", label: "How do you want to sound?", display: "cards", default: "cute",
      hint: "Changes the question, the award's title, the audio guide's voice and the reply they send back.",
      options: [
        { value: "cute", label: "Cute", emoji: "🥺", hint: "soft and sweet" },
        { value: "emotional", label: "Emotional", emoji: "🤍", hint: "sincere, a little teary" },
        { value: "funny", label: "Funny", emoji: "🙈", hint: "make them laugh" },
      ],
    },
    {
      key: "relation", kind: "enum", label: "They are your…", display: "chips", default: "girlfriend",
      hint: "Printed on their award (“the best wife in the whole collection”).",
      options: [
        { value: "girlfriend", label: "Girlfriend", emoji: "💗" },
        { value: "boyfriend", label: "Boyfriend", emoji: "💙" },
        { value: "wife", label: "Wife", emoji: "💍" },
        { value: "husband", label: "Husband", emoji: "💍" },
        { value: "partner", label: "Partner", emoji: "🤍" },
      ],
    },
    {
      key: "togetherSince", kind: "text", input: "date", max: 10, label: "Together since",
      hint: "The day it all started (or your wedding day). We count the years, months, days and hours from it, and work out which anniversary it is.",
    },
    {
      key: "ticketLine", kind: "text", max: 50, label: "Small print on their ticket",
      placeholder: "a cute line on the admission ticket",
      suggestions: ["valid for one cuddle at the exit", "no expiry date. ever.", "no refunds. no exchanges. no escape."],
    },
    {
      key: "funStat", kind: "text", max: 60, label: "One fun stat (optional)",
      placeholder: "Fries you stole from my plate: 1,204 🍟",
      hint: "Shows up with the sunrises and the heartbeats in the clock room.",
      suggestions: ["Fries you stole from my plate: 1,204 🍟", "Times I said “you're right”: 3 😌", "Hoodies of mine you own now: all of them"],
    },
    {
      key: "milestones", kind: "objlist", maxItems: 5, itemTitle: "Exhibit", addLabel: "+ add an exhibit",
      label: "Our story (the audio guide)",
      hint: "They tap each exhibit number on the audio guide and read your commentary: first met, first date, first trip, moved in, engaged…",
      item: [
        { key: "when", kind: "text", max: 24, label: "When", placeholder: "Mar 2023" },
        { key: "title", kind: "text", max: 36, label: "Exhibit", placeholder: "Our first date" },
        { key: "line", kind: "text", max: 110, label: "The guide says", placeholder: "Two coffees, four hours, and a waiter who gave up on us." },
      ],
    },
    {
      key: "firstPlace", kind: "text", max: 40, label: "The restored painting's title",
      placeholder: "The little café on 5th Street",
      hint: "They brush the dust off an old painting to reveal where it all began.",
      suggestions: ["The little café, 2023", "Where it all began", "The first hello"],
    },
    {
      key: "firstMemory", kind: "longtext", max: 160, rows: 3, label: "What the painting shows",
      placeholder: "the one detail you still remember about your first date",
      suggestions: ["You wore the yellow dress, ordered for both of us, and I forgot my own name for a second."],
    },
    {
      key: "reasons", kind: "list", maxItems: 4, itemMax: 80, label: "Snow globe (one reason per shake)",
      hint: "They shake a snow globe; each time the snow settles, one reason you love them is left behind.",
      itemLabels: ["Shake 1", "Shake 2", "Shake 3", "Shake 4"],
      itemPlaceholder: DEFAULT_REASONS,
    },
    {
      key: "promises", kind: "list", maxItems: 3, itemMax: 70, label: "Next year's exhibition (your promises)",
      hint: "Printed on the “coming soon” poster: what next year of you two will feature.",
      itemLabels: ["Featuring 1", "Featuring 2", "Featuring 3"],
      itemPlaceholder: DEFAULT_PROMISES,
    },
    {
      key: "plan", kind: "text", max: 80, label: "Opening night (a date you're planning)",
      placeholder: "Dinner at our first café · Saturday, 8 pm",
      hint: "Optional. Shown on the poster, right under the question.",
      suggestions: ["Dinner at our first café · Saturday, 8 pm", "A surprise. Keep Sunday free 🤫"],
    },
    {
      key: "question", kind: "text", max: 60, label: "The big question",
      placeholder: "leave empty to use the one for your tone",
      hint: "Both buttons say yes. You get an email the moment they tap one.",
      suggestions: ["Another year of us? 🥺💗", "Will you keep choosing us?", "Ek saal aur? Ya poori zindagi? 💗"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "When they say yes",
      placeholder: "what you'd say the second they say yes",
      suggestions: ["Best answer ever. Happy anniversary, my favourite human 💗"],
    },
    {
      key: "awardTitle", kind: "text", max: 40, label: "Their award",
      placeholder: "leave empty to use the one for your tone",
      hint: "The plaque they unveil at the end, and the keepsake they save.",
      suggestions: ["Masterpiece of the Year", "Best Human in the Collection", "Love of My Life (Permanent Exhibit)"],
    },
  ],
  theme: HA_PALETTES.blushGallery.theme,
  demo: {
    recipientName: "Riya",
    senderName: "Aarav",
    petName: "Cutu",
    letter:
      "Happy anniversary, my favourite person.\n\nI tried to think of a gift that could hold everything we've been, and I ended up building you a whole museum. Because that's what you've turned my life into: a place full of things worth keeping.\n\nThank you for the patience on my grumpy days, for the terrible movies you let me pick, for every time you reached for my hand without looking. You make the ordinary days feel like the ones people write songs about.\n\nI'd choose you again in every version of my life. Here's to another year of us, and every year after it.",
    photos: demoPhotos([
      ["Portrait of a Good Day", "The day you laughed so hard you snorted. Priceless."],
      ["Two Fools in the Rain", "One umbrella, two people, both soaked anyway."],
      ["Still Life with Cake", "Your birthday face, the moment the candles came out."],
      ["Us, Always", "My favourite piece in the whole collection."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...TRACK_DEMO,
    endLine: "Still my favourite exhibit, every single year 💗",
    extras: {
      palette: "blushGallery",
      tone: "cute",
      relation: "girlfriend",
      togetherSince: "2023-02-14",
      ticketLine: "valid for one cuddle at the exit",
      funStat: "Fries you stole from my plate: 1,204 🍟",
      milestones: DEFAULT_MILESTONES.map((m) => ({ ...m })),
      firstPlace: "The little café, 2023",
      firstMemory: "You wore the yellow dress, ordered for both of us, and I forgot my own name for a second.",
      reasons: [...DEFAULT_REASONS],
      promises: [...DEFAULT_PROMISES],
      plan: "Dinner at our first café · Saturday, 8 pm",
      question: "Another year of us? 🥺💗",
      yesLine: "Best answer ever. Happy anniversary, my favourite human 💗",
      awardTitle: "Masterpiece of the Year",
    },
  },
  copy: {
    recipientPlaceholder: "who it's for — e.g. Riya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — cutu, jaan, baby…",
    letterPlaceholder: "Your anniversary letter: what this year meant, what you love most about them, and what you can't wait for next.",
    letterHint: "It writes itself into the museum's guestbook, line by line.",
    photosHint: "Your photos, hung as framed artworks with museum plaques. The caption is the artwork's title.",
    captionHint: "artwork title — e.g. Two Fools in the Rain",
    noteHint: "the plaque's little caption (be funny)…",
    endLinePlaceholder: "Still my favourite exhibit, every single year 💗",
    endLineHint: "The last line, on their award keepsake.",
    sheetTitle: "Build your love museum 🖼️",
    sheetSub: "Pick a look, set the day it all began, add your story, the reasons and next year's plans. Everything is pre-filled, so make it yours.",
    extrasTitle: "Your museum",
    extrasSub: "The look, your tone, the date, the audio guide, the painting, the snow globe, the poster and the award",
    publishing: "Hanging the paintings…",
    storyTitle: "Let's build your love museum 🖼️",
    replyText: "Yes yes yes 💗 Another year, and every year after. Happy anniversary!",
    yesChip: "Said yes to another year 💗",
  },
  share: { title: "You're invited to a tiny museum about us 🖼️💗 Open this", accent: "#AE3558" },
};
