// ─── Anniversary ✦ Premium — "The Book of Us" ────────────────────────────────
//
// The flagship anniversary page on the Valentine engine (like Sorry), for
// dating AND married couples. Server twin: server/src/config/valentineDays.ts
// ("anniversary-premium"); keys and limits must match (valentineDays.test.ts
// pins them).
//
// A year-by-year storybook, every scene a different gesture
// (app/(templates)/anniversary-premium/components):
//   [optional lock: "unlock with our date" passcode, or a countdown until the
//   day] → opening titles (pull focus on their names) → two lives, one path
//   (trace the trail to where we met) → the time machine (spin the year ring;
//   each chapter morphs into its own season) → our firsts (drop a record on
//   the turntable, then the needle) → the little things (a breakfast tray) →
//   the memory quilt (swipe to stitch the patches: photos + reasons) → the
//   book (turn the pages of the letter) → us, wrapped (our year in numbers) →
//   lanterns (flick each promise up into the sky) → next year's horizon (raise
//   the sun) → the question (drag your heart to mine) → yes → the Certificate
//   of Forever + an "Our Year in Numbers" story card.
//
// Four light looks (extras.palette) re-skin the whole page; the editor's own
// chrome stays Champagne Pearl.

import type { DayConfig, GifSlot } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { TRACK_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "anniversary-premium" as const;

export type AnniTone = "girlfriend" | "boyfriend" | "wife" | "husband" | "partner";
export type AnniPalette = "champagnePearl" | "blushIvory" | "lilacDawn" | "sageLinen";
export type AnniSeason = "spring" | "summer" | "monsoon" | "autumn" | "winter";
export type AnniLock = "none" | "passcode" | "countdown";

export interface AnniChapter {
  when: string;
  title: string;
  line: string;
  season: AnniSeason;
}
export interface AnniFirst {
  title: string;
  line: string;
}
export interface AnniStat {
  num: string;
  label: string;
}

export interface AnniExtras {
  palette: AnniPalette;
  tone: AnniTone;
  /** "YYYY-MM-DD": the day it began (or the wedding day) — the anniversary. */
  since: string;
  /** "YYYY-MM-DD" or "": the day we first met / first texted. */
  metOn: string;
  openingLine: string;
  metPlace: string;
  metLine: string;
  chapters: AnniChapter[];
  firsts: AnniFirst[];
  littleThings: string[];
  reasons: string[];
  ourSong: string;
  mostSaid: string;
  stats: AnniStat[];
  promises: string[];
  plans: string[];
  question: string;
  datePlan: string;
  yesLine: string;
  lock: AnniLock;
  /** "YYYY-MM-DD": the countdown lock opens at local midnight. */
  openOn: string;
  passHint: string;
  [k: string]: unknown;
}

/** One light look: the page theme plus the paints the scenes use. */
export interface AnniPaletteDef {
  label: string;
  swatch: string;
  theme: DayTheme;
  /** Pale tint for cards, the quilt fabric, the sky. */
  blush: string;
  /** The deepest tint (outlines, shadows). */
  deep: string;
  /** Metallic foil (frames, the certificate border, the year ring). */
  foil: string;
  /** A second, warmer pop (hearts, the sun). */
  rose: string;
  /** The dusk sky top → bottom (lanterns, horizon). Always pastel. */
  sky: readonly [string, string, string];
  hearts: readonly string[];
}

const pal = (
  label: string,
  c: {
    bg: string; bg2: string; surface: string; primary: string; accent: string; accentDeep: string; text: string; textSoft: string;
    soft: string; edge: string; blush: string; deep: string; foil: string; rose: string; sky: readonly [string, string, string];
  },
  hearts: readonly string[],
  confetti: readonly string[],
): AnniPaletteDef => ({
  label,
  swatch: c.primary,
  blush: c.blush,
  deep: c.deep,
  foil: c.foil,
  rose: c.rose,
  sky: c.sky,
  hearts,
  theme: {
    bg: `radial-gradient(120% 70% at 50% 0%, ${c.surface} 0%, ${c.bg} 48%, ${c.bg2} 100%)`,
    base: c.bg,
    paper: c.surface,
    glass: "rgba(255,255,255,0.64)",
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
    particles: hearts,
    confetti,
  },
});

/** Research: anniversary pages that feel "expensive" are pearl, champagne, blush — stationery, not neon. */
export const ANNI_PALETTES: Record<AnniPalette, AnniPaletteDef> = {
  champagnePearl: pal(
    "Champagne Pearl",
    {
      bg: "#FBF6EE", bg2: "#F0E2CC", surface: "#FFFDF8", primary: "#D8B878", accent: "#B4813A", accentDeep: "#8E6224", text: "#45372A", textSoft: "#6E5C48",
      soft: "#F6EBD9", edge: "#E8D6B8", blush: "#F6E9D6", deep: "#7A5420", foil: "#C9A15A", rose: "#E59A8F", sky: ["#FBE9D8", "#F8D9CF", "#F3E6F0"],
    },
    ["✨", "🤍", "🥂", "💛"],
    ["#C9A15A", "#F0E2CC", "#FFFFFF", "#E59A8F", "#E8D6B8"],
  ),
  blushIvory: pal(
    "Blush Ivory",
    {
      bg: "#FFF6F3", bg2: "#F9DCD8", surface: "#FFFFFF", primary: "#EBB3B0", accent: "#CC6575", accentDeep: "#A84A5A", text: "#4E2B31", textSoft: "#7A4D55",
      soft: "#FBE6E3", edge: "#F1CBC7", blush: "#FBE3DF", deep: "#923B4A", foil: "#D7A08F", rose: "#EF8A9A", sky: ["#FDE6E4", "#FBD3D2", "#F4E3F1"],
    },
    ["🩷", "🤍", "🌸", "✨"],
    ["#CC6575", "#EBB3B0", "#FFFFFF", "#F9DCD8", "#D7A08F"],
  ),
  lilacDawn: pal(
    "Lilac Dawn",
    {
      bg: "#F7F3FD", bg2: "#E4DAF6", surface: "#FFFFFF", primary: "#C9B6EC", accent: "#8467C6", accentDeep: "#6A4DAE", text: "#3A2D57", textSoft: "#605580",
      soft: "#EDE6FA", edge: "#D9CCF2", blush: "#EEE7FB", deep: "#56399A", foil: "#B9A2DF", rose: "#E7A0C4", sky: ["#EDE4FB", "#F6DDEB", "#FDEBE2"],
    },
    ["💜", "🤍", "🪻", "✨"],
    ["#8467C6", "#C9B6EC", "#FFFFFF", "#E7A0C4", "#EDE6FA"],
  ),
  sageLinen: pal(
    "Sage Linen",
    {
      bg: "#F6F7F0", bg2: "#E0E8D5", surface: "#FFFFFF", primary: "#B5C9A3", accent: "#5F8752", accentDeep: "#4A6E3F", text: "#2F3D2B", textSoft: "#56664F",
      soft: "#E8EFE0", edge: "#CFDCC4", blush: "#EAF0E2", deep: "#3E5C34", foil: "#B9A878", rose: "#E3A49A", sky: ["#E5EFE2", "#F4E7DA", "#FBEDE6"],
    },
    ["🤍", "🌿", "💚", "✨"],
    ["#5F8752", "#B5C9A3", "#FFFFFF", "#E3A49A", "#B9A878"],
  ),
};

export const ANNI_PALETTE_KEYS = Object.keys(ANNI_PALETTES) as AnniPalette[];

/** What "who it's for" changes when the sender leaves a field empty. */
export const ANNI_TONES: Record<
  AnniTone,
  { label: string; question: string; yes: string; certificate: string; reply: string; my: string; married: boolean }
> = {
  girlfriend: {
    label: "My girlfriend",
    question: "Will you spend the next year with me too? 💗",
    yes: "Yes, and every year after 💗",
    certificate: "Certificate of Forever",
    reply: "Yes. This year, next year, every year 💗 Happy anniversary, my love.",
    my: "my girl",
    married: false,
  },
  boyfriend: {
    label: "My boyfriend",
    question: "Will you spend the next year with me too? 💗",
    yes: "Yes, and every year after 💗",
    certificate: "Certificate of Forever",
    reply: "Yes. This year, next year, every year 💗 Happy anniversary, my love.",
    my: "my boy",
    married: false,
  },
  wife: {
    label: "My wife",
    question: "Will you keep choosing me, year after year? 💍",
    yes: "Always, and in all ways 💍",
    certificate: "Certificate of Forever",
    reply: "I'd marry you all over again 💍 Happy anniversary, my husband.",
    my: "my wife",
    married: true,
  },
  husband: {
    label: "My husband",
    question: "Will you keep choosing me, year after year? 💍",
    yes: "Always, and in all ways 💍",
    certificate: "Certificate of Forever",
    reply: "I'd marry you all over again 💍 Happy anniversary, my wife.",
    my: "my husband",
    married: true,
  },
  partner: {
    label: "My partner",
    question: "One more year of us? 🤍",
    yes: "A hundred more 🤍",
    certificate: "Certificate of Forever",
    reply: "A hundred more years of us 🤍 Happy anniversary.",
    my: "my person",
    married: false,
  },
};

export const ANNI_SEASONS: Record<AnniSeason, { label: string; emoji: string }> = {
  spring: { label: "Spring", emoji: "🌸" },
  summer: { label: "Summer", emoji: "☀️" },
  monsoon: { label: "Monsoon", emoji: "🌧️" },
  autumn: { label: "Autumn", emoji: "🍂" },
  winter: { label: "Winter", emoji: "❄️" },
};
const SEASON_KEYS = Object.keys(ANNI_SEASONS) as AnniSeason[];

export const DEFAULT_CHAPTERS: readonly AnniChapter[] = [
  { when: "2022", title: "The year you said yes", line: "One coffee turned into four hours, and I walked home grinning like an idiot.", season: "monsoon" },
  { when: "2023", title: "Our first trip", line: "Goa, one sunburn, two broken flip-flops, and the best sunset of my life.", season: "winter" },
  { when: "2024", title: "Our little home", line: "Mismatched mugs, a plant we keep almost killing, and you, every morning.", season: "spring" },
  { when: "2025", title: "The year we grew", line: "Hard days too, but we always found our way back to the same side.", season: "autumn" },
];

export const DEFAULT_FIRSTS: readonly AnniFirst[] = [
  { title: "Our first date", line: "You were 20 minutes late and I pretended I'd just arrived too." },
  { title: "Our first trip", line: "We missed the train, laughed about it, and caught the next one holding hands." },
  { title: "Our first fight", line: "About pizza toppings. We survived it, and we still order half-half." },
  { title: "First “I love you”", line: "You said it first, half asleep, and then denied it for a week." },
];

export const DEFAULT_LITTLE_THINGS: readonly string[] = [
  "How you make my chai exactly right without asking",
  "The way you steal half my toast and call it “sharing”",
  "Your little good-morning notes on the fridge",
  "How you always save me the last bite",
  "Your sleepy voice before your first coffee",
  "The song you hum while you cook",
];

export const DEFAULT_REASONS: readonly string[] = [
  "You make ordinary days feel like holidays",
  "You laugh at my worst jokes",
  "You are my safest place",
  "You believe in me on my loudest days",
  "Your hand fits mine perfectly",
  "You still give me butterflies",
  "You choose me, every single day",
  "Home is wherever you are",
];

export const DEFAULT_PROMISES: readonly string[] = [
  "I'll keep choosing you, on the easy days and the hard ones",
  "More slow Sundays, fewer phones at dinner",
  "I'll always save you the window seat",
  "I'll never stop asking about your day",
];

export const DEFAULT_PLANS: readonly string[] = [
  "Mountains in the snow, just us two",
  "A little balcony garden that we don't kill",
  "Dance classes (you promised!)",
  "Every Sunday breakfast, together",
];

export const DEFAULT_STATS: readonly AnniStat[] = [
  { num: "1,240", label: "cups of chai together" },
  { num: "63", label: "movies (you slept through 11)" },
  { num: "7", label: "cities, one suitcase" },
];

/**
 * English + Hindi anniversary songs, one tap each in the form; the sender can
 * still paste any YouTube link. Official uploads — every id checked with
 * YouTube oEmbed and the embed player (playable off-site) on 2026-10-15.
 */
export const ANNI_SONGS: readonly SongSuggestion[] = [
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran" },
  { id: "0put0_a--Ng", title: "Make You Feel My Love", artist: "Adele" },
  { id: "GxldQ9eX2wo", title: "Until I Found You", artist: "Stephen Sanchez" },
  { id: "kPa7bsKwL-c", title: "Die With A Smile", artist: "Lady Gaga & Bruno Mars" },
  { id: "81qmmlsIE3k", title: "Tum Hi Ho", artist: "Arijit Singh" },
  { id: "mQiiw7uRngk", title: "Tera Ban Jaunga", artist: "Tulsi Kumar & Akhil Sachdeva" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "GLGuLXKT9Ng", title: "Raataan Lambiyan", artist: "Jubin Nautiyal & Asees Kaur" },
];

/**
 * The page's own song (music mode "track"), from our CDN, so it starts on the
 * first tap with no YouTube player to wait for. Of the romantic clips in the
 * bucket it is the longest (58.9 s; Perfect is 32.9 s, All of Me 15 s), so it
 * loops least often.
 */
export const ANNI_TRACK = {
  url: "https://cdn.subhsandesh.in/gifts-media/assets/LoveGf/music/a-thousand-years.mp3",
  title: "A Thousand Years",
  artist: "Christina Perri",
  hint: "Christina Perri · plays first",
} as const;

const GIFS: GifSlot[] = [
  { id: "a1-hello", label: "Hello, you", moment: "On the opening titles", file: "a1-hello.webp", emoji: "🥰", anim: "wiggle" },
  { id: "a2-hug", label: "The hug", moment: "Where your two paths meet", file: "a2-hug.webp", emoji: "🤗", anim: "bounce" },
  { id: "a3-dance", label: "Our dance", moment: "Beside the turntable", file: "a3-dance.webp", emoji: "💃", anim: "float" },
  { id: "a4-kiss", label: "A kiss", moment: "On the last page of the book", file: "a4-kiss.webp", emoji: "😘", anim: "pulse" },
  { id: "a5-yes", label: "Yay!", moment: "After they say yes", file: "a5-yes.webp", emoji: "🥳", anim: "bounce" },
  { id: "a6-forever", label: "Forever", moment: "On the last screen", file: "a6-forever.webp", emoji: "💞", anim: "float" },
];

/** The demo's anniversary (a fixed date so the counts look real). */
export const DEMO_SINCE = "2022-10-19";

export const anniversaryPremiumDay: DayConfig<AnniExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "The Book of Us",
  maxPhotos: 10,
  letterMax: 2500,
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
    track: ANNI_TRACK,
    suggestions: ANNI_SONGS,
    suggestionsNote: "Anniversary songs, English + Hindi · tap one, or paste any YouTube link",
  },
  extras: [
    {
      key: "palette", kind: "enum", label: "Pick the look", display: "swatches", default: "champagnePearl",
      hint: "The whole storybook turns this colour: the pages, the sky, the lanterns, the certificate.",
      options: ANNI_PALETTE_KEYS.map((k) => ({ value: k, label: ANNI_PALETTES[k].label, swatch: ANNI_PALETTES[k].swatch })),
    },
    {
      key: "tone", kind: "enum", label: "Who is it for?", display: "cards", default: "girlfriend",
      hint: "Changes the default question, the wording and the reply they send back. Works for dating and married couples.",
      options: [
        { value: "girlfriend", label: "Girlfriend", emoji: "💗", hint: "dating" },
        { value: "boyfriend", label: "Boyfriend", emoji: "💙", hint: "dating" },
        { value: "wife", label: "Wife", emoji: "💍", hint: "married" },
        { value: "husband", label: "Husband", emoji: "💍", hint: "married" },
        { value: "partner", label: "Partner", emoji: "🤍", hint: "any of the above" },
      ],
    },
    {
      key: "since", kind: "text", max: 10, input: "date", label: "Our anniversary date",
      hint: "The day it began (or your wedding day). We count the years, months, days, hours and sunrises together from it.",
    },
    {
      key: "metOn", kind: "text", max: 10, input: "date", label: "The day we first met (optional)",
      hint: "Your first hello or first text, if it's a different day. Shown where your two paths meet.",
    },
    {
      key: "openingLine", kind: "text", max: 60, label: "Under your names on the title",
      placeholder: "a little line for the opening credits",
      suggestions: ["a love story, still being written", "every year with you is my favourite chapter", "starring you, always"],
    },
    {
      key: "metPlace", kind: "text", max: 40, label: "Where your paths met",
      placeholder: "e.g. the college canteen, Pune",
      suggestions: ["a tiny café in Bandra", "Priya's birthday party", "a dating app, honestly 😅"],
    },
    {
      key: "metLine", kind: "text", max: 120, label: "How we met, in one line",
      placeholder: "what you remember about that first moment",
      suggestions: ["You laughed at my terrible joke and I knew I was in trouble.", "You asked to borrow a pen and never gave it back. You kept me too."],
    },
    {
      key: "chapters", kind: "objlist", maxItems: 6, itemTitle: "Chapter", addLabel: "+ add a chapter",
      label: "The time machine (one chapter per year or milestone)",
      hint: "They spin a ring of years; each chapter turns into its own little season. Your photos show up here in order (photo 1 = chapter 1).",
      item: [
        { key: "when", kind: "text", max: 20, label: "When", placeholder: "2023 · or · June 2023" },
        { key: "title", kind: "text", max: 40, label: "Chapter", placeholder: "Our first trip" },
        { key: "line", kind: "text", max: 120, label: "One line", placeholder: "Goa, one sunburn, the best sunset of my life." },
        {
          key: "season", kind: "enum", label: "Season", default: "spring", display: "chips",
          options: SEASON_KEYS.map((s) => ({ value: s, label: `${ANNI_SEASONS[s].emoji} ${ANNI_SEASONS[s].label}` })),
        },
      ],
    },
    {
      key: "firsts", kind: "objlist", maxItems: 5, itemTitle: "Record", addLabel: "+ add a record",
      label: "Our firsts (vinyl records)",
      hint: "Each first is a record on a shelf: they drop it on the turntable and lower the needle to play the memory.",
      item: [
        { key: "title", kind: "text", max: 30, label: "The first", placeholder: "Our first date" },
        { key: "line", kind: "text", max: 110, label: "What happened", placeholder: "You were 20 minutes late…" },
      ],
    },
    {
      key: "littleThings", kind: "list", maxItems: 6, itemMax: 70, label: "The little things (on a breakfast tray)",
      hint: "Small daily habits you love. Each hides under something on the tray: the mug, the toast, the note, the flower, the jam, the spoon.",
      itemLabels: ["☕ The mug", "🍞 The toast", "📝 The note", "🌷 The flower", "🍓 The jam", "🥄 The spoon"],
      itemPlaceholder: DEFAULT_LITTLE_THINGS,
    },
    {
      key: "reasons", kind: "list", maxItems: 8, itemMax: 70, label: "Reasons I love you (quilt patches)",
      hint: "They stitch a heart-shaped quilt; your photos and these reasons are the patches.",
      itemPlaceholder: DEFAULT_REASONS,
    },
    {
      key: "ourSong", kind: "text", max: 50, label: "Our song",
      placeholder: "e.g. Tum Se Hi",
      hint: "Printed on “Us, Wrapped” as your song on repeat.",
    },
    {
      key: "mostSaid", kind: "text", max: 40, label: "Our most-said thing (an inside joke)",
      placeholder: "e.g. “khaana khaya?”",
      suggestions: ["“khaana khaya?”", "“5 more minutes”", "“you're the best”"],
    },
    {
      key: "stats", kind: "objlist", maxItems: 3, itemTitle: "Number", addLabel: "+ add a number",
      label: "Our year in numbers",
      hint: "Your own stats for “Us, Wrapped” and the story card. We add days, hours and sunrises together for you.",
      item: [
        { key: "num", kind: "text", max: 12, label: "Number", placeholder: "1,240" },
        { key: "label", kind: "text", max: 40, label: "Of what", placeholder: "cups of chai together" },
      ],
    },
    {
      key: "promises", kind: "list", maxItems: 5, itemMax: 80, label: "Promises for the next year (lanterns)",
      hint: "They flick each lantern up into the sky and it carries your promise.",
      itemPlaceholder: DEFAULT_PROMISES,
    },
    {
      key: "plans", kind: "list", maxItems: 4, itemMax: 60, label: "Where we'll be next year",
      hint: "They raise the sun over a misty horizon and your plans appear.",
      itemPlaceholder: DEFAULT_PLANS,
    },
    {
      key: "question", kind: "text", max: 70, label: "The question",
      placeholder: "leave empty to use the one for who it's for",
      hint: "They answer by dragging their heart into yours. You get an email the moment they do.",
      suggestions: ["Will you spend the next year with me too? 💗", "Date night on Saturday? 🥂", "Still you and me, always? 🤍"],
    },
    {
      key: "datePlan", kind: "text", max: 80, label: "Our next date (optional)",
      placeholder: "e.g. Dinner at our first café, Saturday 8 pm",
      hint: "Shown under the question and printed on the certificate.",
    },
    {
      key: "yesLine", kind: "text", max: 90, label: "After they say yes",
      placeholder: "what you'd say the second they say yes",
      suggestions: ["Best answer, best person, best years. Here's to forever 🥂"],
    },
    {
      key: "lock", kind: "enum", label: "Lock the surprise?", display: "cards", default: "none",
      hint: "Optional. A passcode is your anniversary date (day + month, e.g. 1910). A countdown keeps it closed until the day.",
      options: [
        { value: "none", label: "No lock", emoji: "💌", hint: "opens straight away" },
        { value: "passcode", label: "Our date", emoji: "🔐", hint: "they type DD MM of your anniversary" },
        { value: "countdown", label: "Countdown", emoji: "⏳", hint: "opens on the day you pick" },
      ],
    },
    {
      key: "passHint", kind: "text", max: 50, label: "Passcode hint",
      placeholder: "e.g. the day it all began 💗",
      showIf: { key: "lock", value: "passcode" },
    },
    {
      key: "openOn", kind: "text", max: 10, input: "date", label: "Opens on",
      hint: "The page stays sealed with a countdown until midnight of this day (their time). Leave empty to open now.",
      showIf: { key: "lock", value: "countdown" },
    },
  ],
  theme: ANNI_PALETTES.champagnePearl.theme,
  demo: {
    recipientName: "Riya",
    senderName: "Aarav",
    petName: "Jaan",
    letter:
      "Four years ago I had no idea that one coffee would turn into the best thing that ever happened to me.\n\nYou have been my best friend, my favourite person to do nothing with, and the first person I want to tell everything to. You make the ordinary days feel like holidays, and the hard days feel a little lighter, just because you're in them.\n\nThank you for every early morning chai, every late-night talk, every time you held my hand without saying anything. Thank you for choosing me on the days I was easy to love, and especially on the days I wasn't.\n\nI don't know exactly where the next year will take us. But I know I want to find out with you, one slow Sunday at a time.\n\nHappy anniversary, my love. Here's to the next chapter.",
    photos: demoPhotos([
      ["where it all began", "The first photo of us. You said I looked nervous. I was."],
      ["our first trip", "Missed the train, caught the sunset."],
      ["home", "Mismatched mugs and you, every morning."],
      ["us, always", "Still my favourite view."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...TRACK_DEMO,
    endLine: "Every year with you is my favourite chapter.",
    extras: {
      palette: "champagnePearl",
      tone: "girlfriend",
      since: DEMO_SINCE,
      metOn: "2022-08-06",
      openingLine: "a love story, still being written",
      metPlace: "a tiny café in Bandra",
      metLine: "You laughed at my terrible joke and I knew I was in trouble.",
      chapters: DEFAULT_CHAPTERS.map((c) => ({ ...c })),
      firsts: DEFAULT_FIRSTS.map((f) => ({ ...f })),
      littleThings: [...DEFAULT_LITTLE_THINGS],
      reasons: [...DEFAULT_REASONS],
      ourSong: "Tum Se Hi",
      mostSaid: "“khaana khaya?”",
      stats: DEFAULT_STATS.map((s) => ({ ...s })),
      promises: [...DEFAULT_PROMISES],
      plans: [...DEFAULT_PLANS],
      question: "Will you spend the next year with me too? 💗",
      datePlan: "Dinner at our first café, Saturday 8 pm",
      yesLine: "Best answer, best person, best years. Here's to forever 🥂",
      lock: "none",
      openOn: "",
      passHint: "",
    },
  },
  copy: {
    recipientPlaceholder: "who it's for — e.g. Riya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — jaan, baby, love…",
    letterPlaceholder: "Your anniversary letter: what this year meant, what you're grateful for, what you can't wait for next.",
    letterHint: "Hand-bound into a little book. They turn the pages, one paragraph per page.",
    photosHint: "Up to 10 photos: the first ones go into the time machine (one per chapter), the rest into the memory quilt.",
    captionHint: "caption — e.g. our first trip",
    noteHint: "what you remember about that moment…",
    endLinePlaceholder: "Every year with you is my favourite chapter.",
    endLineHint: "The last line, on their Certificate of Forever.",
    sheetTitle: "Write the book of us 📖",
    sheetSub: "Pick a look, add your date, your chapters, your firsts, the little things and your promises. Everything is pre-filled, so make it yours.",
    extrasTitle: "Your story",
    extrasSub: "The look, who it's for, your date, the chapters, firsts, little things, reasons, numbers, promises, plans and the question",
    publishing: "Binding your book…",
    storyTitle: "Let's write the book of us 📖",
    replyText: "Yes. This year, next year, every year 💗 Happy anniversary, my love.",
    yesChip: "Said yes 💗",
  },
  share: { title: "Happy anniversary 💗 I made you something. Open this", accent: "#B4813A" },
};
