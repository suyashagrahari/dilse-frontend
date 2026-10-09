// happy-kiss-day-premium — "Mwah Booth" (the ✦ Premium twin of happy-kiss-day).
//
// A bright, strawberry-milk kissing booth (research.md v3 §D7). She twists up
// a lipstick to open it (the song starts), kisses his photo three times, picks
// a kiss off the menu (forehead, cheek, nose, hand), watches their photos
// print in a kiss-cam strip and decorates it with lip stickers, catches flying
// kisses, opens a letter sealed with a kiss, hears his whisper, and answers
// "Kiss me?" (Later runs away). YES lands on the chorus: lipstick prints stamp
// across the screen and gather into a heart around her strip. She keeps the
// strip as a 9:16 story card and sends a kiss back. Family-safe throughout.
// Server twin: server/src/config/premiumDays/happy-kiss-day-premium.ts (same
// keys + limits; valentineDays.test.ts pins them). kissStyle, lipShade,
// openingLine, kissNotes and kissBackText keep the $2 keys.

import type { SongSuggestion } from "../music/youtube";
import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { demoPhotos } from "./_shared";
import { kissDay } from "./happy-kiss-day";

export type KissShade = "ruby" | "gulabi" | "berry" | "nude";

export interface KissExtrasPremium {
  kissStyle: "cute" | "lipstick";
  lipShade: KissShade;
  openingLine: string;
  kissFrame: number;
  foreheadLine: string;
  cheekLine: string;
  noseLine: string;
  handLine: string;
  kissNotes: string[];
  question: string;
  sinceDate: string;
  kissBackText: string;
  [k: string]: unknown;
}

/** research.md §E (oEmbed 200 + playableInEmbed, 2026-10-09). The first one is the preview's song, from DEMO_START. */
export const MWAH_SONGS: readonly SongSuggestion[] = [
  { id: "Jnq9wPDoDKg", title: "Kiss Me", artist: "Sixpence None The Richer" },
  { id: "-BjZmE2gtdo", title: "Lover", artist: "Taylor Swift" },
  { id: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh · Jawan" },
  { id: "Nnop2walGmM", title: "Tum Se", artist: "Teri Baaton Mein Aisa Uljha Jiya" },
  { id: "v45F0YesdZM", title: "Kiss Me (artist upload)", artist: "Sixpence None The Richer" },
];
/**
 * The v1 romantic list. Kept because happy-hug-day-premium.ts imported it by
 * this name (another builder's file); this day uses MWAH_SONGS.
 */
export const KISS_PREMIUM_SONGS: readonly SongSuggestion[] = [
  { id: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran" },
  { id: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh · Aashiqui 2" },
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh · Brahmāstra" },
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal · Shershaah" },
  { id: "vGJTaP6anOU", title: "Can't Help Falling in Love", artist: "Elvis Presley" },
  { id: "Cb6wuzOurPc", title: "Tum Se Hi", artist: "Mohit Chauhan · Jab We Met" },
];
/** "Kiss Me": the "so kiss me" chorus (YouTube's most-replayed marker, −2 s). */
const DEMO_START = 37;

// The default stickers live in the shared premium GIF library on the CDN
// (premium-v3/gifs.json), not in templates/<slug>/: `file` climbs out of this
// template's folder (the browser resolves the "..") so the kit's Sticker, the
// editor's "Ours" thumbnail and the page all show the real GIF for "".
const LIB = "../_premium/gifs";
const GIFS: GifSlot[] = [
  { id: "km1-gate", label: "Getting ready", moment: "Beside the lipstick on the first screen", file: `${LIB}/kiss-day/cat-blush-kiss.webp`, emoji: "😚", anim: "wiggle" },
  { id: "km2-mwah", label: "Mwah", moment: "Cheering while they kiss your photo", file: `${LIB}/kiss-day/mwah-blushing-bear.webp`, emoji: "😘", anim: "bounce" },
  { id: "km3-booth", label: "Kiss-cam", moment: "Peeking over the photo booth strip", file: `${LIB}/kiss-day/penguins-kiss-hearts.webp`, emoji: "📸", anim: "float" },
  { id: "km4-catch", label: "Caught one", moment: "Dancing when the flying-kiss game ends", file: `${LIB}/kiss-day/bears-surprise-kiss.webp`, emoji: "💋", anim: "bounce" },
  { id: "km5-letter", label: "Love letter", moment: "On the envelope sealed with a kiss", file: `${LIB}/common/noto-love-letter.webp`, emoji: "💌", anim: "pulse" },
  { id: "km6-yes", label: "Yes!", moment: "The big YES, when the kisses fill the screen", file: `${LIB}/kiss-day/bear-bunny-kiss.webp`, emoji: "🥰", anim: "bounce" },
];

const base = premiumDay<KissExtrasPremium>(kissDay, {
  slug: "happy-kiss-day-premium",
  title: "Mwah Booth",
  gifSlots: GIFS,
  demoSong: { id: MWAH_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    voiceCaption: "Come closer… closer. Okay, that's close enough. Mwah.",
    psLetter:
      "Open only when you can't sleep.\n\nI still keep our photo-booth strip in my wallet. The corner is bent from how many times I've looked at it. Goodnight, cutie. One more forehead kiss from me.",
    songDropAt: DEMO_START,
  },
  copy: {
    recipientPlaceholder: "who the kisses are for — e.g. Ananya",
    letterPlaceholder: "The letter inside the envelope sealed with a kiss: the kisses you owe them and why — the goodnight ones you missed, the forehead one on a stressful day…",
    letterHint: "It types itself out after they tap the lipstick seal. Short paragraphs read best. Keep it sweet: this page is family-safe.",
    photosHint: "Your first four photos print in the kiss-cam booth strip (they decorate it with lip stickers). Pick the photo they get to kiss below.",
    captionHint: "under the frame — e.g. our first selfie",
    endLinePlaceholder: "Sealed with a kiss. Opened with a smile.",
    endLineHint: "The last line, on the strip they keep.",
    sheetTitle: "Mwah Booth 💋",
    sheetSub: "Pick your kiss mark and shade, write the kiss menu and the question. Family-safe and cute by default.",
    extrasTitle: "The kissing booth",
    extrasSub: "Kiss mark, the kiss menu, the question",
    publishing: "Printing your kisses…",
    storyTitle: "Let's open the Mwah Booth 💋",
    replyText: "Got all your kisses 💋 Sending one back, catch it!",
  },
});

export const kissDayPremium: DayConfig<KissExtrasPremium> = {
  ...base,
  music: { audioOnly: true, suggestions: MWAH_SONGS, suggestionsNote: "kiss songs · tap to use", demoStart: DEMO_START },
  extras: [
    {
      key: "kissStyle", kind: "enum", label: "Your kiss mark", display: "cards", default: "lipstick",
      hint: "What lands on the screen every time they kiss. Both are sweet.",
      options: [
        { value: "lipstick", label: "Lipstick", emoji: "💋", hint: "a real lip print" },
        { value: "cute", label: "Cute", emoji: "😚", hint: "a little heart stamp" },
      ],
    },
    {
      key: "lipShade", kind: "enum", label: "Your shade", display: "swatches", default: "ruby",
      hint: "Colours every kiss mark on the page.",
      options: [
        { value: "ruby", label: "Cherry", swatch: "#E0244E" },
        { value: "gulabi", label: "Gulabi", swatch: "#FF5C93" },
        { value: "berry", label: "Berry", swatch: "#B0306A" },
        { value: "nude", label: "Peach", swatch: "#E98A78" },
      ],
    },
    {
      key: "openingLine", kind: "text", max: 60, label: "On the lipstick screen",
      placeholder: "the line under their name before they open it",
      suggestions: ["Twist it up. A kiss is waiting.", "Lipstick on. Booth open. Ready?", "Ek kiss pending hai, open karo 🙈"],
    },
    {
      key: "kissFrame", kind: "number", min: 1, max: 12, default: 1, step: 1, label: "The photo they kiss",
      hint: "Photo number from your photos above. They kiss it three times at the start.",
    },
    {
      key: "foreheadLine", kind: "text", max: 90, label: "Kiss menu: forehead",
      placeholder: "why you give them forehead kisses",
      suggestions: ["For every exam, interview and bad day. You've got this.", "The 'I'm proud of you' one."],
    },
    {
      key: "cheekLine", kind: "text", max: 90, label: "Kiss menu: cheek",
      placeholder: "the shy one",
      suggestions: ["The quick one when nobody's looking.", "For laughing at my jokes. Even the bad ones."],
    },
    {
      key: "noseLine", kind: "text", max: 90, label: "Kiss menu: nose",
      placeholder: "the silly eskimo one",
      suggestions: ["Boop. For when you're grumpy and pretending not to be.", "Nose kisses fix everything. Science."],
    },
    {
      key: "handLine", kind: "text", max: 90, label: "Kiss menu: hand",
      placeholder: "the royal one",
      suggestions: ["Because you deserve to be treated like royalty. Always.", "Like a prince in a very low-budget movie."],
    },
    {
      key: "kissNotes", kind: "list", maxItems: 6, minItems: 3, itemMax: 70, label: "Kisses I owe you",
      hint: "3–6 short lines they unlock after catching your flying kisses.",
      itemPlaceholder: "A kiss for every 'reached home?' text",
      addLabel: "+ add a kiss",
    },
    {
      key: "question", kind: "text", max: 60, label: "The question",
      placeholder: "what you ask before the big finale",
      hint: "“Later” runs away from their finger. Yes lands on the best part of your song.",
      suggestions: ["Okay, final question. Kiss me?", "So… one real kiss when we meet?", "Kiss me? Later is not an option."],
    },
    {
      key: "sinceDate", kind: "text", max: 10, input: "date", label: "Together since",
      hint: "Printed on the strip they keep, with the days counted.",
    },
    {
      key: "kissBackText", kind: "text", max: 80, label: "Their WhatsApp reply",
      placeholder: "what their kiss-back message says",
      hint: "Prefilled when they send a kiss back on WhatsApp.",
      suggestions: ["Got all your kisses 💋 Sending one back, catch it!"],
    },
  ],
  theme: {
    bg: "linear-gradient(160deg, #FFF5F8 0%, #FFE3EC 55%, #FFD9E6 100%)",
    base: "#FFF5F8",
    paper: "#FFFFFF",
    glass: "rgba(255,255,255,0.72)",
    ink: "#5B2333",
    inkSoft: "#8A4A5E",
    paperInk: "#5B2333",
    accent: "#FF4F86",
    accentDeep: "#D63F72",
    accentInk: "#FFFFFF",
    soft: "#FFD1DF",
    edge: "#FFC6D8",
    gold: "#FFC94D",
    dark: false,
    particles: ["💋", "💗", "✨"],
    confetti: ["#FF4F86", "#FF9EBB", "#FFD1DF", "#FFE27A", "#D63F72"],
  },
  demo: {
    ...base.demo,
    letter:
      "Happy Kiss Day, cutie 💋\n\nRemember the photo booth at the mall? You said we'd look silly. We looked very silly. It's still my favourite picture of us.\n\nSome nights I can't kiss you goodnight in person, so I built you a whole booth instead. Every kiss in it is one I owe you.\n\nThank you for every forehead kiss on a stressful day, every \"bas, ho gaya, chill\", and every time you made a bad day soft.\n\nThis one is sealed with a kiss. Keep it.",
    photos: demoPhotos([
      ["our first selfie 🥹", "You blinked. We kept it anyway."],
      ["date night", "You stole my fries, then my heart."],
      ["cherry blossom era", "Even the trees were jealous."],
      ["us, forever", "Out of every timeline, I'd pick this one."],
    ]),
    endLine: "Sealed with a kiss. Opened with a smile.",
    extras: {
      kissStyle: "lipstick",
      lipShade: "ruby",
      openingLine: "Twist it up. A kiss is waiting.",
      kissFrame: 1,
      foreheadLine: "For every exam, interview and bad day. You've got this.",
      cheekLine: "The quick one when nobody's looking.",
      noseLine: "Boop. For when you're grumpy and pretending not to be.",
      handLine: "Because you deserve to be treated like royalty. Always.",
      kissNotes: [
        "A kiss for the way you laugh at your own jokes",
        "A kiss for every 'reached home?' text",
        "A kiss for your sleepy voice at midnight",
        "A kiss for being mine",
      ],
      question: "Okay, final question. Kiss me?",
      sinceDate: "2022-03-14",
      kissBackText: "Got all your kisses 💋 Sending one back, catch it!",
    },
  },
};
