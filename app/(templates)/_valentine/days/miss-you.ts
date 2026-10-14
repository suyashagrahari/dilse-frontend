// ─── Miss You — a cute, romantic "I miss you" for a long-distance love ────────
//
// An evergreen occasion on the Valentine engine (like Sorry), all copy English
// with a little Hinglish. Server twin: server/src/config/valentineDays.ts
// ("miss-you"); keys and limits must match (valentineDays.test.ts pins them).
//
// The flow follows what long-distance couples say they treasure (open-when
// letters, a countdown to the next visit, "same moon, different time zones",
// a wordless touch sent across the map, a boarding pass as the reveal) —
// app/(templates)/miss-you/components:
//   an incoming love call (slide to answer) → how far apart we are (the route
//   draws, the km count up, two clocks; then fold the map to 0 km) → days
//   until I see you (a live countdown; cross off today) → the jar of things I
//   miss about you (tap for a glowing note) → our photos → "open when…"
//   envelopes → a paper plane that unfolds into the letter → hold to send a
//   hug across the map → "Video call tonight?" — No runs away; the sender may
//   let it turn into an honest "Not tonight 🌙" → yes: confetti and the
//   "See you soon" boarding pass (keepsake PNG, reply on WhatsApp).
//
// The sender picks one of four looks (extras.palette); the whole page is
// re-skinned from MISS_YOU_PALETTES; the editor's own chrome stays Cloud Lilac.

import type { DayConfig, GifSlot } from "../types";
import type { DayTheme } from "../theme";
import type { SongSuggestion } from "../music/youtube";
import { TRACK_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "miss-you" as const;

export type MissYouTone = "partner" | "crush" | "bestie";
export type MissYouPalette = "midnightStars" | "sunsetPeach" | "cloudLilac" | "moonlightMint";

export interface MissYouLetter {
  when: string;
  note: string;
}

export interface MissYouExtras {
  palette: MissYouPalette;
  tone: MissYouTone;
  openingLine: string;
  /** The recipient's city. */
  yourCity: string;
  /** The sender's city. */
  myCity: string;
  /** 0 = work it out from the two cities (when both are known). */
  distanceKm: number;
  /** "YYYY-MM-DD", or "" for "soon". */
  meetDate: string;
  missThings: string[];
  openWhen: MissYouLetter[];
  hugLine: string;
  question: string;
  yesLine: string;
  /** "yesOnly" — No runs away forever · "noAfterTries" — after `noTries` dodges it becomes "Not tonight 🌙". */
  answerMode: "yesOnly" | "noAfterTries";
  noTries: "4" | "5";
  [k: string]: unknown;
}

/** One look: the page theme plus the few extra paints the scenes use. */
export interface MissYouPaletteDef {
  label: string;
  swatch: string;
  theme: DayTheme;
  /** Pale highlight (notes, the wipe's wash, the map's land). */
  blush: string;
  /** The deepest tint (the pill's lip, outlines). */
  deep: string;
  /** The map card and the jar glass. */
  map: string;
  /** Twinkling stars' opacity (bright on the night look, faint on the day ones). */
  stars: number;
  /** Floating bits in the background. */
  floats: readonly string[];
}

const pal = (
  label: string,
  c: { bg: string; bg2: string; surface: string; primary: string; accent: string; accentDeep: string; text: string; textSoft: string; soft: string; edge: string; blush: string; deep: string; map: string },
  o: { dark: boolean; stars: number; floats: readonly string[]; confetti: readonly string[]; glow?: string },
): MissYouPaletteDef => ({
  label,
  swatch: c.accent,
  blush: c.blush,
  deep: c.deep,
  map: c.map,
  stars: o.stars,
  floats: o.floats,
  theme: {
    bg: `radial-gradient(120% 70% at 50% 0%, ${o.glow ?? c.surface} 0%, ${c.bg} 50%, ${c.bg2} 100%)`,
    base: c.bg,
    paper: c.surface,
    glass: o.dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.62)",
    ink: c.text,
    inkSoft: c.textSoft,
    paperInk: c.text,
    accent: c.accent,
    accentDeep: c.accentDeep,
    accentInk: "#FFFFFF",
    soft: c.soft,
    edge: c.edge,
    gold: c.primary,
    dark: o.dark,
    particles: o.floats,
    confetti: o.confetti,
  },
});

/** The four looks (research: night skies and the moon are THE long-distance motif; pastels read cute + sincere). */
export const MISS_YOU_PALETTES: Record<MissYouPalette, MissYouPaletteDef> = {
  midnightStars: pal(
    "Midnight Stars",
    { bg: "#1A1F4B", bg2: "#2B1E57", surface: "#262D66", primary: "#FFD98A", accent: "#FF7EAE", accentDeep: "#D9487F", text: "#FFF6FB", textSoft: "#C5C2EE", soft: "#333B7C", edge: "#46509A", blush: "#3A3F86", deep: "#A3305F", map: "#20275C" },
    { dark: true, stars: 1, floats: ["💗", "⭐", "🌙", "✨"], confetti: ["#FF7EAE", "#FFD98A", "#FFFFFF", "#B9A8FF", "#7FD6FF"], glow: "#3A3480" },
  ),
  sunsetPeach: pal(
    "Sunset Peach",
    { bg: "#FFF1E8", bg2: "#FFCFC0", surface: "#FFFBF7", primary: "#FFB68A", accent: "#FF6F61", accentDeep: "#D9473D", text: "#5A2C27", textSoft: "#8C5A50", soft: "#FFE3D6", edge: "#FFC9B4", blush: "#FFDCCB", deep: "#B23A33", map: "#FFF6EF" },
    { dark: false, stars: 0.35, floats: ["🧡", "☁️", "💌", "✨"], confetti: ["#FF6F61", "#FFB68A", "#FFFBF7", "#FFD36B", "#FF9FB2"] },
  ),
  cloudLilac: pal(
    "Cloud Lilac",
    { bg: "#F4F0FF", bg2: "#DCD2FF", surface: "#FFFFFF", primary: "#C7B6FF", accent: "#8C6CF0", accentDeep: "#6C4ED3", text: "#33295C", textSoft: "#625887", soft: "#E9E2FF", edge: "#D3C7FB", blush: "#E2D9FF", deep: "#5338B4", map: "#FAF8FF" },
    { dark: false, stars: 0.35, floats: ["💜", "☁️", "🫧", "✨"], confetti: ["#8C6CF0", "#C7B6FF", "#FFFFFF", "#FFB6D9", "#A8D8FF"] },
  ),
  moonlightMint: pal(
    "Moonlight Mint",
    { bg: "#E9FAF4", bg2: "#C4ECDF", surface: "#FFFFFF", primary: "#93DCC4", accent: "#25A07C", accentDeep: "#1B7F62", text: "#1D3F35", textSoft: "#4A6F63", soft: "#D5F3E8", edge: "#AFE3D1", blush: "#CDEFE3", deep: "#155F4A", map: "#F6FDFA" },
    { dark: false, stars: 0.35, floats: ["💚", "🌙", "🌿", "✨"], confetti: ["#25A07C", "#93DCC4", "#FFFFFF", "#FFB6C9", "#FFE08A"] },
  ),
};

export const MISS_YOU_PALETTE_KEYS = Object.keys(MISS_YOU_PALETTES) as MissYouPalette[];

/** What "who it's for" changes when the sender leaves a field empty. */
export const MISS_YOU_TONES: Record<
  MissYouTone,
  { question: string; yes: string; reply: string; noLines: readonly string[]; notTonight: string; ticket: string }
> = {
  partner: {
    question: "Video call tonight? 📞🥺",
    yes: "Yes, call me 💗",
    reply: "I miss you more 🥹💗 Call me tonight?",
    noLines: ["pls? 🥺", "just 5 minutes?", "I'll wear the hoodie", "aaja na 🥹", "*sad puppy eyes*"],
    notTonight: "Not tonight 🌙",
    ticket: "Next to you, forever",
  },
  crush: {
    question: "Can I call you tonight? 🙈",
    yes: "Okay, call me 🙈",
    reply: "Okay fine… I kinda miss you too 🙈 Call me?",
    noLines: ["are you sure? 🥺", "one tiny call?", "I'll be funny, promise", "pls pls", "*hopeful blink*"],
    notTonight: "Maybe another night 🌙",
    ticket: "Window seat, next to you",
  },
  bestie: {
    question: "Bestie, call tonight? 📞",
    yes: "Obviously, call me 😤💗",
    reply: "Miss you too, idiot 😤💗 Call me tonight!",
    noLines: ["bestie no?", "I have gossip 👀", "chai on video?", "pls 🥺👉👈", "*sad hamster noises*"],
    notTonight: "Not tonight, bestie 🌙",
    ticket: "Right next to you (stealing your snacks)",
  },
};

export const DEFAULT_MISS_THINGS: readonly string[] = [
  "The way you laugh at your own jokes before you finish them.",
  "Stealing your fries and you pretending to be angry.",
  "Your sleepy voice on our late-night calls.",
  "Holding your hand without even thinking about it.",
  "How you always say “text me when you reach”.",
  "Just being in the same room, doing nothing, together.",
];

export const DEFAULT_OPEN_WHEN: readonly MissYouLetter[] = [
  { when: "you miss me 🥺", note: "Close your eyes. I'm missing you right now too, probably staring at our chat. We're closer than the map says." },
  { when: "you can't sleep 🌙", note: "Look at the moon. I'm under the same one. Main yahin hoon. Breathe slow, and dream of our next date." },
  { when: "you've had a bad day ☁️", note: "You're the strongest person I know. Tomorrow is new. And I'm one call away, always." },
  { when: "you need a laugh 😂", note: "Remember when we got lost and called it an adventure? We're still the best team. Now smile, it's an order." },
];

/**
 * Missing-you and long-distance songs, one tap each in the form; the sender
 * can still paste any YouTube link. Official artist/label uploads — every id
 * checked with YouTube oEmbed and the embed page on 2026-10-14. Audio only.
 */
export const MISS_YOU_SONGS: readonly SongSuggestion[] = [
  { id: "kPBzTxZQG5Q", title: "Here Without You", artist: "3 Doors Down" },
  { id: "Cwkej79U3ek", title: "A Thousand Miles", artist: "Vanessa Carlton" },
  { id: "ROqTa1mn_qc", title: "Distance", artist: "Christina Perri ft. Jason Mraz" },
  { id: "s1tAYmMjLdY", title: "I Miss You", artist: "blink-182" },
  { id: "Oextk-If8HQ", title: "Somewhere Only We Know", artist: "Keane" },
  { id: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal & Asees Kaur" },
  { id: "284Ov7ysmfA", title: "Channa Mereya", artist: "Arijit Singh" },
  { id: "xRb8hxwN5zc", title: "Agar Tum Saath Ho", artist: "Alka Yagnik & Arijit Singh" },
  { id: "Dp6lbdoprZ0", title: "Main Rahoon Ya Na Rahoon", artist: "Armaan Malik" },
  { id: "_iktURk0X-A", title: "Phir Bhi Tumko Chaahunga", artist: "Arijit Singh" },
];

/** The page's own song (music mode "track"), from our CDN, so it starts on the first tap. */
export const MISS_YOU_TRACK = {
  url: "https://cdn.subhsandesh.in/gifts-media/missyou-gf/music/the-night-we-met.mp3",
  title: "The Night We Met",
  artist: "Lord Huron",
  hint: "Lord Huron · plays first",
} as const;

const GIFS: GifSlot[] = [
  { id: "m1-call", label: "Calling you", moment: "On the incoming call screen", file: "m1-call.webp", emoji: "📞", anim: "wiggle" },
  { id: "m2-miss", label: "Missing you", moment: "Beside the jar of things I miss", file: "m2-miss.webp", emoji: "🥺", anim: "bounce" },
  { id: "m3-hug", label: "The hug", moment: "When your hug lands on their city", file: "m3-hug.webp", emoji: "🤗", anim: "pulse" },
  { id: "m4-wait", label: "Waiting", moment: "Next to the countdown", file: "m4-wait.webp", emoji: "⏳", anim: "float" },
  { id: "m5-yes", label: "Yay!", moment: "After they say yes", file: "m5-yes.webp", emoji: "💗", anim: "bounce" },
];

/** "YYYY-MM-DD", `days` from today (local), for the demo's countdown. */
function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const missYouDay: DayConfig<MissYouExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "I Miss You, Come Back Soon",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 30,
  asksQuestion: true,
  melody: "lantern",
  photoAspect: 1,
  gifSlots: GIFS,
  topBar: true,
  brandMark: "stacked",
  music: {
    audioOnly: true,
    compact: true,
    track: MISS_YOU_TRACK,
    suggestions: MISS_YOU_SONGS,
    suggestionsNote: "English + Hindi missing-you songs · tap one, or paste any YouTube link",
  },
  extras: [
    {
      key: "palette", kind: "enum", label: "Pick the look", display: "swatches", default: "midnightStars",
      hint: "The whole page turns this colour — the sky, the map, the jar, the boarding pass.",
      options: MISS_YOU_PALETTE_KEYS.map((k) => ({ value: k, label: MISS_YOU_PALETTES[k].label, swatch: MISS_YOU_PALETTES[k].swatch })),
    },
    {
      key: "tone", kind: "enum", label: "Who are you missing?", display: "cards", default: "partner",
      hint: "Changes the default question and the reply they send back.",
      options: [
        { value: "partner", label: "My love", emoji: "💗", hint: "girlfriend, boyfriend, spouse" },
        { value: "crush", label: "My crush", emoji: "🙈", hint: "it's complicated" },
        { value: "bestie", label: "My bestie", emoji: "🫶", hint: "best friend" },
      ],
    },
    {
      key: "openingLine", kind: "text", max: 60, label: "When they pick up the call",
      placeholder: "the first thing you'd say",
      hint: "The page opens as an incoming call from you. This is what they hear when they answer.",
      suggestions: ["I just called to say… I miss you 🥺", "Hi. Nothing. Just missed your voice.", "Bas tumhari yaad aa rahi thi 🥹"],
    },
    {
      key: "yourCity", kind: "text", max: 30, label: "Their city",
      placeholder: "e.g. Mumbai",
      hint: "Your two cities go on the map, with a dotted route between them.",
      suggestions: ["Mumbai", "Delhi", "Bengaluru", "Toronto"],
    },
    {
      key: "myCity", kind: "text", max: 30, label: "Your city",
      placeholder: "e.g. Bengaluru",
      suggestions: ["Bengaluru", "Pune", "Hyderabad", "London"],
    },
    {
      key: "distanceKm", kind: "number", min: 0, max: 20000, default: 0, step: 1, unit: "km",
      label: "How many km apart? (optional)",
      hint: "Leave it at 0 and we'll work it out for most big cities. Different time zones show two clocks.",
    },
    {
      key: "meetDate", kind: "text", max: 10, input: "date", label: "When will you see them? (optional)",
      hint: "A live countdown to that day. Leave it empty if you don't know yet — it says “soon” instead.",
    },
    {
      key: "missThings", kind: "list", maxItems: 6, itemMax: 70, label: "Things I miss about you",
      hint: "Glowing notes in a jar — they tap it and pull out one at a time. The small, specific things hit hardest.",
      itemLabels: ["Note 1", "Note 2", "Note 3", "Note 4", "Note 5", "Note 6"],
      itemPlaceholder: DEFAULT_MISS_THINGS,
    },
    {
      key: "openWhen", kind: "objlist", maxItems: 4, itemTitle: "Envelope", addLabel: "+ add an envelope",
      label: "“Open when…” envelopes",
      hint: "Little letters for the moments you can't be there. They can open them now or save them for later.",
      item: [
        { key: "when", kind: "text", max: 40, label: "Open when…", placeholder: "you can't sleep 🌙" },
        { key: "note", kind: "longtext", max: 160, rows: 3, label: "The note inside", placeholder: "Look at the moon. I'm under the same one." },
      ],
    },
    {
      key: "hugLine", kind: "text", max: 80, label: "With the hug",
      placeholder: "what arrives with your hug",
      hint: "They hold a button and a hug flies along the route to their city.",
      suggestions: ["Hug delivered. Keep it till I give you the real one 🤗", "Ek jaadu ki jhappi, door se 🤗"],
    },
    {
      key: "question", kind: "text", max: 60, label: "The question",
      placeholder: "leave empty to use the one for who it's for",
      hint: "The No button gets shy and runs away when they reach for it.",
      suggestions: ["Video call tonight? 📞🥺", "Will you wait for me? 🥺", "Can I see you this weekend? 💗"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "After they say yes",
      placeholder: "what you'd say the second they say yes",
      suggestions: ["Calling you at 10. Wear the hoodie I left 🥹"],
    },
    {
      key: "answerMode", kind: "enum", label: "How can they answer?", display: "cards", default: "yesOnly",
      hint: "Either way you'll see their answer on your page card and when you open your own link.",
      options: [
        { value: "yesOnly", label: "Only Yes", emoji: "💗", hint: "No keeps running away" },
        { value: "noAfterTries", label: "Yes, or “Not tonight”", emoji: "🌙", hint: "an honest way out after a few tries" },
      ],
    },
    {
      key: "noTries", kind: "enum", label: "“Not tonight” appears after", display: "chips", default: "4",
      hint: "No runs away this many times with cute lines, then turns into a gentle “Not tonight 🌙”.",
      showIf: { key: "answerMode", value: "noAfterTries" },
      options: [
        { value: "4", label: "4 tries" },
        { value: "5", label: "5 tries" },
      ],
    },
  ],
  // The editor's own chrome (the form, its inputs) stays on a light look; the page itself wears the pick.
  theme: MISS_YOU_PALETTES.cloudLilac.theme,
  demo: {
    recipientName: "Riya",
    senderName: "Aarav",
    petName: "Cutu",
    letter:
      "It's been a while since I last saw you, and I still look for you in every room I walk into.\n\nThe distance is hard on some days. I miss the small things the most: your hand finding mine, your head on my shoulder, the way you say my name when you're sleepy.\n\nBut here's what I know for sure. Every call, every “good morning” text, every silly meme you send me makes the kilometres feel shorter. You make missing someone feel worth it.\n\nWait for me a little longer? I'm counting the days, and I'm coming home to you.",
    photos: demoPhotos([
      ["the day you left", "I smiled at the station. Cried in the cab. Don't tell anyone."],
      ["our last chai date", "Two cutting chais, one umbrella, zero plans. Perfect."],
      ["your birthday", "Your face when you saw the cake. I want that again."],
      ["us, soon", "Next photo is in person. Promise."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...TRACK_DEMO,
    endLine: "Distance means so little when someone means so much 💗",
    extras: {
      palette: "midnightStars",
      tone: "partner",
      openingLine: "I just called to say… I miss you 🥺",
      yourCity: "Mumbai",
      myCity: "Bengaluru",
      distanceKm: 0,
      meetDate: isoInDays(23),
      missThings: [...DEFAULT_MISS_THINGS],
      openWhen: DEFAULT_OPEN_WHEN.map((l) => ({ ...l })),
      hugLine: "Hug delivered. Keep it till I give you the real one 🤗",
      question: "Video call tonight? 📞🥺",
      yesLine: "Calling you at 10. Wear the hoodie I left 🥹",
      answerMode: "yesOnly",
      noTries: "4",
    },
  },
  copy: {
    recipientPlaceholder: "who you're missing — e.g. Riya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them — cutu, jaan, baby…",
    letterPlaceholder: "Tell them what you miss, how the distance feels, and what you'll do the moment you see them again.",
    letterHint: "It arrives as a paper plane that unfolds into your letter.",
    photosHint: "Your photos, as a strip of polaroids they swipe through.",
    captionHint: "caption — e.g. the day you left",
    noteHint: "what you remember about that moment…",
    endLinePlaceholder: "Distance means so little when someone means so much 💗",
    endLineHint: "The last line, printed on their “See you soon” boarding pass.",
    sheetTitle: "Tell them you miss them 🥹",
    sheetSub: "Pick a colour, your two cities, the day you'll meet, the things you miss and a few open-when letters. Everything is pre-filled, so make it yours.",
    extrasTitle: "Your miss-you page",
    extrasSub: "The colour, who it's for, your cities, the countdown, the jar, the envelopes, the hug and the question",
    publishing: "Folding your paper plane…",
    storyTitle: "Let's tell them you miss them 🥹",
    replyText: "I miss you more 🥹💗 Call me tonight?",
    yesChip: "Said yes 📞",
  },
  share: { title: "Someone misses you a lot 🥹 Open this", accent: "#D9487F" },
};
