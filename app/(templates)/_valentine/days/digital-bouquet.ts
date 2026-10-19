// ─── Digital Bouquet ✦ Premium ───────────────────────────────────────────────
//
// The sender ARRANGES a bouquet by hand in a little studio (the editor's
// "bouquet studio", app/(templates)/digital-bouquet/components/studio): which
// flowers, where each one sits, its tilt, size and layer; the greenery, the
// wrapping paper, the ribbon and bow, a few charms and a gift tag. The
// recipient gets it delivered: a box at the door → pull the ribbon → the
// bouquet blooms stem by stem in exactly that arrangement → tap each flower for
// its meaning (+ the sender's own line) → water it till it glows → photos
// tucked between the stems → the card (the main letter) → a reaction → a
// keepsake card of the bouquet to download.
//
// Server twin: server/src/config/valentineDays.ts ("digital-bouquet"); keys
// and limits must match (valentineDays.test.ts pins them). The arrangement is
// `extras.stems` — an objlist of numbers only, so the server keeps every row.
//
// Research notes (Oct 2026): the category (digibouquet-style builders) is
// loved for illustrated flowers, flower meanings and a single link — and is
// missing music, wrapping/ribbon depth, anything to DO after the reveal, a
// reply loop, privacy, a good phone arranger and Indian flowers (marigold,
// lotus) and songs. This page answers each of those.

import type { DayConfig, GifSlot } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { TRACK_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "digital-bouquet" as const;

// ─── Flowers ────────────────────────────────────────────────────────────────

export type FlowerId =
  | "rose-red" | "rose-pink" | "rose-white" | "tulip" | "sunflower" | "peony" | "lily" | "daisy"
  | "lavender" | "carnation" | "orchid" | "babys-breath" | "cherry-blossom" | "lotus" | "marigold" | "hydrangea";

/** How the drawn fallback head is shaped (used only if the illustration fails to load). */
export type FlowerShape = "rose" | "cup" | "ray" | "star" | "spike" | "cluster" | "ruffle" | "lotus" | "orchid";

export interface FlowerDef {
  id: FlowerId;
  name: string;
  /** The flower-language word: "Passion". */
  word: string;
  /** One romantic line of what it says. */
  line: string;
  shape: FlowerShape;
  /** Fallback paints: petal, deeper petal, centre. */
  petal: string;
  deep: string;
  centre: string;
  /** Its natural size in the bouquet (percent). Small fillers are smaller. */
  size: number;
  /** Shelf group. */
  group: "roses" | "classics" | "fillers" | "desi";
}

export const DB_FLOWERS: readonly FlowerDef[] = [
  { id: "rose-red", name: "Red rose", word: "Passion", line: "My heart, wholly and only yours.", shape: "rose", petal: "#D7263D", deep: "#9E1530", centre: "#7A0F22", size: 100, group: "roses" },
  { id: "rose-pink", name: "Pink rose", word: "Admiration", line: "You make me smile without even trying.", shape: "rose", petal: "#F59AB5", deep: "#E06B8F", centre: "#C94A72", size: 100, group: "roses" },
  { id: "rose-white", name: "White rose", word: "Devotion", line: "A love that's pure, patient and forever.", shape: "rose", petal: "#FFF8F1", deep: "#EADCCB", centre: "#D9C6AF", size: 100, group: "roses" },
  { id: "tulip", name: "Tulip", word: "Perfect love", line: "With you, love feels effortless.", shape: "cup", petal: "#FF7A9C", deep: "#E04F75", centre: "#C23A60", size: 92, group: "classics" },
  { id: "sunflower", name: "Sunflower", word: "Adoration", line: "You are my sunshine, every single day.", shape: "ray", petal: "#FFC73A", deep: "#F0A21C", centre: "#6B3E1E", size: 108, group: "classics" },
  { id: "peony", name: "Peony", word: "Romance", line: "Here's to a long, happy life together.", shape: "ruffle", petal: "#F7B5C8", deep: "#EC8FAC", centre: "#FFE3A1", size: 112, group: "classics" },
  { id: "lily", name: "Lily", word: "Purity", line: "Your soul is the most beautiful thing I know.", shape: "star", petal: "#FFF3F6", deep: "#F4B6C8", centre: "#E5A93B", size: 104, group: "classics" },
  { id: "daisy", name: "Daisy", word: "Innocence", line: "You make life feel simple and sweet.", shape: "ray", petal: "#FFFFFF", deep: "#EDE6F2", centre: "#F6C531", size: 82, group: "fillers" },
  { id: "lavender", name: "Lavender", word: "Calm", line: "You are my calm in every storm.", shape: "spike", petal: "#A98BDB", deep: "#7E62B8", centre: "#5D468F", size: 90, group: "fillers" },
  { id: "carnation", name: "Carnation", word: "Affection", line: "My love for you will never fade.", shape: "ruffle", petal: "#FF8FA8", deep: "#E8607F", centre: "#D44A6C", size: 92, group: "classics" },
  { id: "orchid", name: "Orchid", word: "Rare beauty", line: "Rare and exquisite, just like you.", shape: "orchid", petal: "#E6A7E8", deep: "#C478C8", centre: "#F6E070", size: 96, group: "classics" },
  { id: "babys-breath", name: "Baby's breath", word: "Everlasting", line: "Our love, in every little moment.", shape: "cluster", petal: "#FFFFFF", deep: "#EEE9EE", centre: "#DCD2DA", size: 86, group: "fillers" },
  { id: "cherry-blossom", name: "Cherry blossom", word: "New beginnings", line: "Every season with you feels like spring.", shape: "cluster", petal: "#FFC9D9", deep: "#F59CB8", centre: "#E0547E", size: 86, group: "fillers" },
  { id: "lotus", name: "Lotus", word: "Grace", line: "You bloom through everything, and so do we.", shape: "lotus", petal: "#FFB8CF", deep: "#F0889F", centre: "#FFD66B", size: 106, group: "desi" },
  { id: "marigold", name: "Marigold", word: "Celebration", line: "May every day with you glow golden.", shape: "ruffle", petal: "#FFA31A", deep: "#F07C0C", centre: "#E26A00", size: 90, group: "desi" },
  { id: "hydrangea", name: "Hydrangea", word: "Gratitude", line: "Thank you for understanding me like no one else.", shape: "cluster", petal: "#AFC3F2", deep: "#8BA4E6", centre: "#C8B6EC", size: 110, group: "classics" },
];

export const DB_FLOWER_IDS = DB_FLOWERS.map((f) => f.id);
export const FLOWER_BY_ID: Record<FlowerId, FlowerDef> = Object.fromEntries(DB_FLOWERS.map((f) => [f.id, f])) as Record<FlowerId, FlowerDef>;
export const isFlowerId = (v: unknown): v is FlowerId => typeof v === "string" && v in FLOWER_BY_ID;

/** One stem in the arrangement — x/y on a 1000×1000 bloom canvas, the tie point bottom-centre. */
export interface DbStem {
  flower: FlowerId;
  x: number;
  y: number;
  rot: number;
  scale: number;
  z: number;
}

export const STEM_LIMITS = { min: 3, max: 15 } as const;
/** Where blooms may sit: an ellipse over the wrap's mouth (bouquet canvas units). */
export const BLOOM_AREA = { cx: 500, cy: 410, rx: 400, ry: 255 } as const;
/** The tie point every stem runs to. */
export const TIE = { x: 500, y: 1010 } as const;

// ─── Looks ──────────────────────────────────────────────────────────────────

export type DbPalette = "blushGarden" | "peachSorbet" | "lilacDream" | "sageMorning";
export type DbTone = "romantic" | "sweet" | "playful";
export type DbWrap = "tissue" | "kraft" | "newspaper" | "pearl";
export type DbRibbon = "rose" | "blush" | "red" | "gold" | "lilac" | "sage" | "ivory";
export type DbBow = "bow" | "knot" | "twine";
export type DbGreenery = "mixed" | "eucalyptus" | "fern" | "leafy" | "none";
export type DbCharm = "heart" | "teddy" | "butterfly";
export type DbHand = "script" | "hand" | "serif";

export interface DbFlowerNote {
  flower: FlowerId;
  note: string;
}

export interface DbExtras {
  palette: DbPalette;
  tone: DbTone;
  stems: DbStem[];
  greenery: DbGreenery;
  wrap: DbWrap;
  ribbon: DbRibbon;
  bow: DbBow;
  charms: string[];
  giftTag: string;
  deliveryLine: string;
  flowerNotes: DbFlowerNote[];
  cardHand: DbHand;
  question: string;
  yesLine: string;
  [k: string]: unknown;
}

export interface DbPaletteDef {
  label: string;
  swatch: string;
  theme: DayTheme;
  /** Pale tint (cards, the tag). */
  blush: string;
  /** Deepest tint (outlines). */
  deep: string;
  /** The sky behind the scenes, top → bottom. */
  sky: readonly [string, string, string];
  /** Petals that drift. */
  petals: readonly string[];
}

const pal = (
  label: string,
  c: { bg: string; bg2: string; surface: string; primary: string; accent: string; accentDeep: string; text: string; textSoft: string; soft: string; edge: string; blush: string; deep: string },
  sky: readonly [string, string, string],
  petals: readonly string[],
  confetti: readonly string[],
): DbPaletteDef => ({
  label,
  swatch: c.primary,
  blush: c.blush,
  deep: c.deep,
  sky,
  petals,
  theme: {
    bg: `linear-gradient(180deg, ${sky[0]} 0%, ${sky[1]} 55%, ${sky[2]} 100%)`,
    base: c.bg,
    paper: c.surface,
    glass: "rgba(255,255,255,0.7)",
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
    particles: ["🌸", "💗", "✨", "🌷"],
    confetti,
  },
});

/** Four light, romantic looks. */
export const DB_PALETTES: Record<DbPalette, DbPaletteDef> = {
  blushGarden: pal(
    "Blush Garden",
    { bg: "#FFF4F6", bg2: "#FCE1E8", surface: "#FFFFFF", primary: "#F4A3B9", accent: "#D94A75", accentDeep: "#AE2F57", text: "#4A2231", textSoft: "#7D4E5F", soft: "#FFE6EE", edge: "#F3C9D5", blush: "#FFE0E9", deep: "#8F2348" },
    ["#FFF9F6", "#FFEFF3", "#FCDDE6"],
    ["#F9B8CB", "#FFD6E2", "#FFFFFF", "#F48FB1"],
    ["#D94A75", "#F4A3B9", "#FFE0E9", "#FFFFFF", "#FFD27A"],
  ),
  peachSorbet: pal(
    "Peach Sorbet",
    { bg: "#FFF6F0", bg2: "#FFE3D3", surface: "#FFFDFA", primary: "#FFB58E", accent: "#E2643C", accentDeep: "#B54723", text: "#4F2A1C", textSoft: "#80533F", soft: "#FFE9DC", edge: "#F8CDB4", blush: "#FFE0CF", deep: "#9A3B1C" },
    ["#FFFBF5", "#FFF0E4", "#FFDCC8"],
    ["#FFC4A6", "#FFE0CF", "#FFFFFF", "#FF9F80"],
    ["#E2643C", "#FFB58E", "#FFE0CF", "#FFFFFF", "#FFD27A"],
  ),
  lilacDream: pal(
    "Lilac Dream",
    { bg: "#F8F4FF", bg2: "#E8DEFB", surface: "#FFFFFF", primary: "#C7B3F3", accent: "#8A5CD6", accentDeep: "#6A3FB8", text: "#33255A", textSoft: "#605386", soft: "#EEE6FD", edge: "#D9CCF6", blush: "#ECE3FD", deep: "#523099" },
    ["#FDFBFF", "#F3EEFF", "#E6DCFA"],
    ["#D7C6F7", "#F1E9FF", "#FFFFFF", "#F6B9D6"],
    ["#8A5CD6", "#C7B3F3", "#FFFFFF", "#FFB6D9", "#FFE9A8"],
  ),
  sageMorning: pal(
    "Sage Morning",
    { bg: "#F5FAF3", bg2: "#E0EEDB", surface: "#FFFFFD", primary: "#A9CDA0", accent: "#4E8B5F", accentDeep: "#386C47", text: "#24382A", textSoft: "#4F6855", soft: "#E3F1E0", edge: "#C3DDBD", blush: "#E6F2E2", deep: "#2B5636" },
    ["#FBFDF8", "#F1F7EC", "#E2EFDB"],
    ["#F7C9D6", "#FFFFFF", "#DDEED6", "#FFE1A8"],
    ["#4E8B5F", "#A9CDA0", "#FFFFFF", "#F7C9D6", "#FFE1A8"],
  ),
};
export const DB_PALETTE_KEYS = Object.keys(DB_PALETTES) as DbPalette[];

export const DB_WRAPS: Record<DbWrap, { label: string; emoji: string; hint: string }> = {
  tissue: { label: "Pastel tissue", emoji: "🎀", hint: "soft, layered, a little sheer" },
  kraft: { label: "Kraft paper", emoji: "📦", hint: "the florist classic" },
  newspaper: { label: "Old newsprint", emoji: "📰", hint: "Pinterest-pretty, vintage" },
  pearl: { label: "Pearl", emoji: "🤍", hint: "white with a pearly sheen" },
};
export const DB_WRAP_KEYS = Object.keys(DB_WRAPS) as DbWrap[];

export const DB_RIBBONS: Record<DbRibbon, { label: string; color: string; deep: string }> = {
  rose: { label: "Satin red", color: "#C8324F", deep: "#8E1C35" },
  blush: { label: "Blush", color: "#F7AFC3", deep: "#E07E9B" },
  red: { label: "Ruby", color: "#C8102E", deep: "#8E0B22" },
  gold: { label: "Champagne", color: "#D9B45E", deep: "#A9853A" },
  lilac: { label: "Lavender", color: "#B39AE6", deep: "#8C6FCC" },
  sage: { label: "Sage", color: "#8DB98A", deep: "#5F8F5C" },
  ivory: { label: "Ivory", color: "#F6EEDF", deep: "#D8C8AA" },
};
/** The colours the studio offers (the art pack's four); red / sage / ivory stay valid for older pages. */
export const DB_RIBBON_KEYS: DbRibbon[] = ["rose", "blush", "gold", "lilac"];

export const DB_BOWS: Record<DbBow, { label: string; emoji: string }> = {
  bow: { label: "Big bow", emoji: "🎀" },
  knot: { label: "Silk knot", emoji: "🪢" },
  twine: { label: "Twine", emoji: "🧵" },
};
export const DB_BOW_KEYS = Object.keys(DB_BOWS) as DbBow[];

export const DB_GREENERY: Record<DbGreenery, { label: string; hint: string }> = {
  mixed: { label: "Mixed", hint: "eucalyptus + fern + leaves" },
  eucalyptus: { label: "Eucalyptus", hint: "silvery, soft" },
  fern: { label: "Fern", hint: "lush and wild" },
  leafy: { label: "Leafy", hint: "glossy green leaves" },
  none: { label: "None", hint: "just the flowers" },
};
export const DB_GREENERY_KEYS = Object.keys(DB_GREENERY) as DbGreenery[];

export const DB_CHARMS: Record<DbCharm, { label: string; emoji: string }> = {
  heart: { label: "Heart tag", emoji: "💗" },
  teddy: { label: "Tiny teddy", emoji: "🧸" },
  butterfly: { label: "Butterfly", emoji: "🦋" },
};
export const DB_CHARM_KEYS = Object.keys(DB_CHARMS) as DbCharm[];

export const DB_HANDS: Record<DbHand, { label: string; hint: string }> = {
  hand: { label: "Handwritten", hint: "like a note you wrote" },
  script: { label: "Calligraphy", hint: "flowing, romantic" },
  serif: { label: "Storybook", hint: "elegant and easy to read" },
};

/** The tone changes the defaults the sender left empty, and the reactions. */
export const DB_TONES: Record<
  DbTone,
  { question: string; yes: string; delivery: string; tag: string; reply: string; reactions: readonly [string, string, string, string] }
> = {
  romantic: {
    question: "Do you like your flowers? 🥹",
    yes: "Then I'll keep bringing you flowers, forever 💗",
    delivery: "A special delivery, picked one flower at a time",
    tag: "For you, always",
    reply: "I got your bouquet 💐 I love it, and I love you. Come here.",
    reactions: ["I love them 💗", "Happy tears 🥹", "Sending a kiss back 😘", "Come here, hug me 🤗"],
  },
  sweet: {
    question: "Did I pick the right ones? 🌷",
    yes: "Yay! You deserve all the flowers in the world 🌸",
    delivery: "Psst… someone sent you flowers 🌷",
    tag: "Just because",
    reply: "Aww you sent me flowers 🥹💐 You're the cutest.",
    reactions: ["I love them 💗", "So cute 🥹", "Kiss for you 😘", "Hug, now 🤗"],
  },
  playful: {
    question: "Rate my florist skills? 😌",
    yes: "10/10, I know. Next time I'm bringing real ones 😌💐",
    delivery: "Delivery for the cutest human alive. Sign here 📦",
    tag: "Florist of the year",
    reply: "Okay fine, best florist ever 😌💐 Now bring real ones.",
    reactions: ["Love them 💗", "You're so extra 🥹", "Kiss for the florist 😘", "Okay come here 🤗"],
  },
};
export const DB_TONE_KEYS = Object.keys(DB_TONES) as DbTone[];

/** Letter starters per tone (the card's "start me off" chips). */
export const DB_LETTER_STARTERS: Record<DbTone, string> = {
  romantic:
    "I wanted to give you something that would make you stop for a second and smile, so I picked every flower in this bouquet thinking of you.\n\nYou are the softest part of my day. The way you laugh, the way you care about everyone, the way you make ordinary evenings feel like something worth remembering.\n\nThese flowers will never wilt, and neither will this feeling.",
  sweet:
    "No reason. No occasion. I just saw flowers and thought of you, which, honestly, happens a lot.\n\nThank you for being you: kind, funny and a little bit chaotic in the best way.\n\nI hope these make you smile the way you make me smile.",
  playful:
    "Real flowers die. Mine are digital, eternal and very hand-arranged, so technically I win.\n\nBut really: you deserve flowers every day, and since I can't afford a florist every day, here's a bouquet you can open whenever you want.\n\nNo returns, no refunds, only love.",
};

// ─── Music ───────────────────────────────────────────────────────────────────

/**
 * One tap each in the form; the sender can still paste any YouTube link.
 * English + Hindi love songs. Official uploads, every id checked with YouTube
 * oEmbed (200) and the embed player (no UNPLAYABLE / ERROR / LOGIN_REQUIRED)
 * on 2026-10-19. Audio only.
 */
export const DB_SONGS: readonly SongSuggestion[] = [
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "kPa7bsKwL-c", title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars" },
  { id: "GxldQ9eX2wo", title: "Until I Found You", artist: "Stephen Sanchez" },
  { id: "PEM0Vs8jf1w", title: "golden hour", artist: "JVKE" },
  { id: "-BjZmE2gtdo", title: "Lover", artist: "Taylor Swift" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh" },
  { id: "RLzC55ai0eo", title: "Heeriye", artist: "Jasleen Royal, Arijit Singh" },
  { id: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal, Asees Kaur" },
  { id: "iAIBF2ngbWY", title: "Pehle Bhi Main", artist: "Vishal Mishra" },
  { id: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh" },
];

/** The page's own song (music mode "track"), from our CDN, so it starts on the first tap. */
export const DB_TRACK = {
  url: "https://cdn.subhsandesh.in/gifts-media/assets/LoveGf/music/perfect.mp3",
  title: "Perfect",
  artist: "Ed Sheeran",
  hint: "Ed Sheeran · plays first",
} as const;

const GIFS: GifSlot[] = [
  { id: "b1-delivery", label: "Delivery", moment: "Popping out of the parcel at their door", file: "gifs/b1-delivery.webp", emoji: "📦", anim: "wiggle" },
  { id: "b2-bloom", label: "Flowers for you", moment: "Handing over a rose as the bouquet blooms", file: "gifs/b2-receive.webp", emoji: "🌹", anim: "bounce" },
  { id: "b3-water", label: "Smell them", moment: "Smelling a rose once the flowers glow", file: "gifs/b3-smell.webp", emoji: "🌷", anim: "float" },
  { id: "b4-photos", label: "Hug", moment: "Hugging beside the photos among the stems", file: "gifs/b5-hug.webp", emoji: "🤗", anim: "float" },
  { id: "b5-letter", label: "Happy tears", moment: "Teary-eyed on the card's envelope", file: "gifs/b4-tears.webp", emoji: "🥹", anim: "pulse" },
  { id: "b6-yes", label: "Love you", moment: "Floating hearts after their reaction", file: "gifs/b6-love.webp", emoji: "💗", anim: "bounce" },
];

/** A pretty starter arrangement (the art pack's own worked bouquet): thirteen stems in a natural dome. */
export const DEMO_STEMS: DbStem[] = [
  { flower: "babys-breath", x: 500, y: 187, rot: 0, scale: 100, z: 15 },
  { flower: "lavender", x: 393, y: 197, rot: 0, scale: 98, z: 16 },
  { flower: "cherry-blossom", x: 630, y: 187, rot: 0, scale: 96, z: 15 },
  { flower: "lily", x: 500, y: 283, rot: 0, scale: 100, z: 23 },
  { flower: "orchid", x: 770, y: 357, rot: 0, scale: 96, z: 29 },
  { flower: "hydrangea", x: 250, y: 393, rot: 0, scale: 96, z: 32 },
  { flower: "tulip", x: 370, y: 397, rot: 0, scale: 100, z: 33 },
  { flower: "sunflower", x: 660, y: 393, rot: 0, scale: 100, z: 33 },
  { flower: "peony", x: 507, y: 437, rot: 0, scale: 107, z: 36 },
  { flower: "rose-pink", x: 823, y: 527, rot: 0, scale: 100, z: 44 },
  { flower: "rose-red", x: 420, y: 567, rot: 0, scale: 105, z: 47 },
  { flower: "rose-red", x: 587, y: 560, rot: 0, scale: 105, z: 47 },
  { flower: "rose-white", x: 500, y: 640, rot: 0, scale: 104, z: 53 },
];

export const DEMO_NOTES: DbFlowerNote[] = [
  { flower: "peony", note: "Because you're my favourite person to grow old with." },
  { flower: "rose-red", note: "Still the one I'd choose, every single time." },
  { flower: "tulip", note: "Like the ones from our first date in the park." },
];

export const digitalBouquetDay: DayConfig<DbExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Digital Bouquet",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 30,
  asksQuestion: true,
  melody: "blush",
  photoAspect: 0.86,
  gifSlots: GIFS,
  topBar: true,
  brandMark: "stacked",
  studio: "bouquet",
  music: {
    audioOnly: true,
    compact: true,
    track: DB_TRACK,
    suggestions: DB_SONGS,
    suggestionsNote: "English + Hindi love songs · tap one, or paste any YouTube link",
  },
  extras: [
    {
      key: "palette", kind: "enum", label: "Pick the look", display: "swatches", default: "blushGarden",
      hint: "The whole page wears it: the sky, the cards, the petals that drift.",
      options: DB_PALETTE_KEYS.map((k) => ({ value: k, label: DB_PALETTES[k].label, swatch: DB_PALETTES[k].swatch })),
    },
    {
      key: "tone", kind: "enum", label: "How should it feel?", display: "cards", default: "romantic",
      hint: "Changes the courier's note, the tag, the question and the reactions they can send back.",
      options: [
        { value: "romantic", label: "Romantic", emoji: "🌹", hint: "deep and tender" },
        { value: "sweet", label: "Sweet", emoji: "🌷", hint: "cute, just because" },
        { value: "playful", label: "Playful", emoji: "😌", hint: "teasing, a little extra" },
      ],
    },
    // Arranged in the bouquet studio (hidden from the plain form).
    {
      key: "stems", kind: "objlist", maxItems: STEM_LIMITS.max, minItems: STEM_LIMITS.min, label: "Flowers in your bouquet", itemTitle: "Stem", hidden: true,
      item: [
        { key: "flower", kind: "enum", label: "Flower", default: "rose-red", options: DB_FLOWERS.map((f) => ({ value: f.id, label: f.name })) },
        { key: "x", kind: "number", label: "x", min: 0, max: 1000, default: 500 },
        { key: "y", kind: "number", label: "y", min: 0, max: 1000, default: 400 },
        { key: "rot", kind: "number", label: "Tilt", min: -60, max: 60, default: 0 },
        { key: "scale", kind: "number", label: "Size", min: 60, max: 150, default: 100 },
        { key: "z", kind: "number", label: "Layer", min: 0, max: 99, default: 0 },
      ],
    },
    {
      key: "greenery", kind: "enum", label: "Greenery", default: "mixed", hidden: true,
      options: DB_GREENERY_KEYS.map((k) => ({ value: k, label: DB_GREENERY[k].label, hint: DB_GREENERY[k].hint })),
    },
    { key: "wrap", kind: "enum", label: "Wrapping paper", default: "tissue", hidden: true, options: DB_WRAP_KEYS.map((k) => ({ value: k, label: DB_WRAPS[k].label })) },
    { key: "ribbon", kind: "enum", label: "Ribbon", default: "rose", hidden: true, options: DB_RIBBON_KEYS.map((k) => ({ value: k, label: DB_RIBBONS[k].label, swatch: DB_RIBBONS[k].color })) },
    { key: "bow", kind: "enum", label: "Bow", default: "bow", hidden: true, options: DB_BOW_KEYS.map((k) => ({ value: k, label: DB_BOWS[k].label })) },
    { key: "charms", kind: "list", maxItems: 3, itemMax: 12, label: "Charms", hidden: true },
    {
      key: "giftTag", kind: "text", max: 40, label: "The gift tag",
      placeholder: "the few words on the tag tied to the ribbon",
      hint: "Hangs off the ribbon. Leave empty for one that matches your tone.",
      suggestions: ["For you, always", "For my favourite human", "Just because 💗", "Meri jaan ke liye"],
    },
    {
      key: "deliveryLine", kind: "text", max: 70, label: "The courier's note",
      placeholder: "what the note on the delivery box says",
      hint: "The very first thing they see: a box at their door with this note on it.",
      suggestions: ["Special delivery for the prettiest girl in the world 💐", "Handle with care: contains a lot of love", "Someone picked these just for you 🌷"],
    },
    {
      key: "flowerNotes", kind: "objlist", maxItems: 16, label: "Your line for each flower", itemTitle: "Note", hidden: true,
      item: [
        { key: "flower", kind: "enum", label: "Flower", default: "rose-red", options: DB_FLOWERS.map((f) => ({ value: f.id, label: f.name })) },
        { key: "note", kind: "text", label: "Your line", max: 80 },
      ],
    },
    { key: "cardHand", kind: "enum", label: "Handwriting", default: "hand", hidden: true, options: (Object.keys(DB_HANDS) as DbHand[]).map((k) => ({ value: k, label: DB_HANDS[k].label })) },
    {
      key: "question", kind: "text", max: 60, label: "The soft question",
      placeholder: "leave empty to use the one for your tone",
      hint: "After the card. They answer with a reaction (every one is happy), and you get an email.",
      suggestions: ["Do you like your flowers? 🥹", "Coffee with me this weekend? ☕", "Pasand aaye? 🌸"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "When they react",
      placeholder: "what you'd say the second they react",
      suggestions: ["Then I'll keep bringing you flowers, forever 💗", "There are more where these came from 🌷"],
    },
  ],
  theme: DB_PALETTES.blushGarden.theme,
  demo: {
    recipientName: "Riya",
    senderName: "Aarav",
    petName: "Cutu",
    letter:
      "I wanted to give you something that would make you stop for a second and smile, so I picked every flower in this bouquet thinking of you.\n\nThe peony is for the life I want with you. The red rose is because, after all this time, it's still you, every single time. And the tulips are from that evening in the park when you made me walk around for an hour looking for the perfect spot to sit.\n\nYou are the softest part of my day. These flowers will never wilt, and neither will this feeling.",
    photos: demoPhotos([
      ["our first date", "You wore that yellow dress and I forgot every word I had planned."],
      ["the long drive", "Singing badly, windows down. My favourite version of us."],
      ["your birthday", "The face you made at the cake. I'd do anything to see it again."],
      ["us, always", "Still my favourite person, in every season."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...TRACK_DEMO,
    endLine: "Flowers fade. This won't. 💐",
    extras: {
      palette: "blushGarden",
      tone: "romantic",
      stems: DEMO_STEMS.map((s) => ({ ...s })),
      greenery: "mixed",
      wrap: "tissue",
      ribbon: "rose",
      bow: "bow",
      charms: ["heart"],
      giftTag: "For my Riya, always",
      deliveryLine: "Special delivery for the prettiest girl in the world 💐",
      flowerNotes: DEMO_NOTES.map((n) => ({ ...n })),
      cardHand: "hand",
      question: "Do you like your flowers? 🥹",
      yesLine: "Then I'll keep bringing you flowers, forever 💗",
    },
  },
  copy: {
    recipientPlaceholder: "who the flowers are for — e.g. Riya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — cutu, jaan, baby…",
    letterPlaceholder: "The card that comes with your flowers: why today, what they mean to you, one memory only you two share.",
    letterHint: "Tucked into the bouquet in an envelope. They open it after watering the flowers.",
    photosHint: "Tucked between the stems as little polaroids they pull out.",
    captionHint: "caption — e.g. our first date",
    noteHint: "what you remember about that moment…",
    endLinePlaceholder: "Flowers fade. This won't. 💐",
    endLineHint: "The last line, printed on the bouquet keepsake card they can download.",
    sheetTitle: "Make their bouquet 💐",
    sheetSub: "Arrange it stem by stem in the studio, write the card, add your photos and a song. Everything is pre-filled, so make it yours.",
    extrasTitle: "Your bouquet",
    extrasSub: "The look, the feel, the gift tag, the courier's note and the question (arrange the flowers in the studio)",
    publishing: "Wrapping your bouquet…",
    storyTitle: "Let's make them a bouquet 💐",
    replyText: "I got your bouquet 💐 I love it, and I love you. Come here.",
    yesChip: "Loved the flowers 💐",
  },
  share: { title: "Someone sent you flowers 💐 Open your bouquet", accent: "#AE2F57" },
};
