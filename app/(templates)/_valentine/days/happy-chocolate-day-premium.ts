// happy-chocolate-day-premium — "The Midnight Chocolatier" (the ✦ Premium twin of happy-chocolate-day).
//
// After hours, a tiny chocolate atelier lights up for one person. They flip the
// CLOSED sign, pour a heart, tap out the bubbles, watch it temper, smash it with
// a gold hammer (the song drops), taste truffles of reasons, unwrap a golden
// ticket, read a letter piped in chocolate, browse the display case, pipe a
// word onto the last bonbon and tie the box themselves.
//
// Keys + limits mirror server/src/config/premiumDays/happy-chocolate-day-premium.ts
// (pinned in valentineDays.test.ts). AI fill: server/src/config/aiFill/happy-chocolate-day-premium.ts.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { premiumDay } from "./_premium";
import { chocolateDay } from "./happy-chocolate-day";

export type TruffleFlavour = "hazelnut" | "sea-salt" | "raspberry" | "gold-leaf" | "pistachio" | "rose" | "heart";

export interface ChocolateExtrasPremium {
  welcomeNote: string;
  reasons: { flavour: TruffleFlavour; reason: string }[];
  embossNames: boolean;
  crackLine: string;
  ticketPromise: string;
  letterTitle: string;
  drizzleWord: string;
  insideNote: string;
  boxColor: "raspberry" | "midnight" | "ivory" | "blush";
  signOff: string;
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "pc1-open", label: "Lights on", moment: "The lamps flicker on inside the atelier", file: "pc1-open.gif", emoji: "👩‍🍳", anim: "wiggle" },
  { id: "pc2-smash", label: "The smash", moment: "Right after the heart shatters", file: "pc2-smash.gif", emoji: "🤯", anim: "bounce" },
  { id: "pc3-yum", label: "Yum", moment: "Every truffle tasted", file: "pc3-yum.gif", emoji: "🤤", anim: "pulse" },
  { id: "pc4-ticket", label: "Golden ticket", moment: "The golden ticket slides out", file: "pc4-ticket.gif", emoji: "🎫", anim: "float" },
  { id: "pc5-photos", label: "Display case", moment: "Over the display case of photos", file: "pc5-photos.gif", emoji: "📸", anim: "wiggle" },
  { id: "pc6-box", label: "Box tied", moment: "The box is tied, the ending", file: "pc6-box.gif", emoji: "🎁", anim: "pulse" },
];

/** Sweet, warm, slow-dance picks — official uploads, checked against YouTube oEmbed 2026-10-08. */
const SONGS: readonly SongSuggestion[] = [
  { id: "09R8_2nJtjg", title: "Sugar", artist: "Maroon 5" },
  { id: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh · Bhediya" },
  { id: "E07s5ZYygMg", title: "Watermelon Sugar", artist: "Harry Styles" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh · Brahmāstra" },
  { id: "PEM0Vs8jf1w", title: "golden hour", artist: "JVKE" },
  { id: "-BjZmE2gtdo", title: "Lover", artist: "Taylor Swift" },
  { id: "P3cffdsEXXw", title: "Golden", artist: "Harry Styles" },
  { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran" },
];

export const FLAVOUR_OPTIONS = [
  { value: "hazelnut", label: "Hazelnut", emoji: "🌰" },
  { value: "sea-salt", label: "Sea salt", emoji: "🧂" },
  { value: "raspberry", label: "Raspberry", emoji: "🍓" },
  { value: "gold-leaf", label: "Gold leaf", emoji: "✨" },
  { value: "pistachio", label: "Pistachio", emoji: "🟢" },
  { value: "rose", label: "Rose", emoji: "🌹" },
  { value: "heart", label: "Heart", emoji: "❤️" },
] as const;

const base = premiumDay<ChocolateExtrasPremium>(chocolateDay, {
  slug: "happy-chocolate-day-premium",
  title: "The Midnight Chocolatier",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "Shop's closed. I stayed back anyway, because it's you.",
    psLetter:
      "Open only if you're craving something sweet at 2 a.m.\n\nCall me. I'll pretend I was awake anyway. There's a bar of the good dark one hidden behind the atta tin. You didn't hear it from me.",
  },
  copy: {
    letterPlaceholder: "Start with the first time you noticed them, then the little things you'd put in their recipe…",
    letterHint: "Piped in chocolate on the marble, then written out on the atelier's cream “Recipe for us” card.",
    photosHint: "Your photos become bonbons in a lit glass display case — the caption is the little label.",
    captionHint: "the label on the bonbon — e.g. Goa sunset · salted caramel",
    noteHint: "what that moment tasted like…",
    endLinePlaceholder: "Made by hand, at midnight, for one person.",
    endLineHint: "The last line, under the tied box.",
    sheetTitle: "Open your atelier 🍫",
    sheetSub: "They pour, smash and taste a heart you made. Everything is pre-filled — make it yours.",
    extrasTitle: "The atelier",
    extrasSub: "The note on the counter, the truffles, the golden ticket and the box",
    publishing: "Turning the lights on…",
    storyTitle: "Let's stock your midnight atelier 🍫",
    replyText: "I'm redeeming my golden ticket 🎫",
  },
  share: { title: "The shop is closed. Except for you 🍫", accent: "#A82B58" },
});

export const chocolateDayPremium: DayConfig<ChocolateExtrasPremium> = {
  ...base,
  melody: "cocoa",
  photoAspect: 1,
  music: { suggestions: SONGS, suggestionsNote: "sweet & slow · tap to use" },
  extras: [
    {
      key: "welcomeNote", kind: "text", max: 80, label: "Note on the counter",
      placeholder: "what the handwritten note by the till says — e.g. I kept the shop open late. Just for you.",
      suggestions: ["I kept the shop open late. Just for you.", "Closed for everyone. Open for you."],
    },
    {
      key: "reasons", kind: "objlist", maxItems: 6, minItems: 3, itemTitle: "Truffle", addLabel: "+ add a truffle",
      label: "Truffles — a flavour and a reason",
      hint: "They sit inside the heart they smash. Each bite reveals one reason. Pick a flavour that fits it.",
      item: [
        { key: "flavour", kind: "enum", label: "Flavour", display: "chips", default: "hazelnut", options: FLAVOUR_OPTIONS },
        { key: "reason", kind: "text", max: 90, label: "The reason inside", placeholder: "one thing about them you love — e.g. you remember every tiny thing I say" },
      ],
    },
    { key: "embossNames", kind: "bool", default: true, label: "Emboss both names on the heart", hint: "Your initials, pressed into the chocolate before they smash it." },
    {
      key: "crackLine", kind: "text", max: 50, label: "Line before the smash",
      placeholder: "what you say as you hand them the hammer",
      suggestions: ["Go on. Break my heart (the good way).", "Tap it. Something's inside."],
    },
    {
      key: "ticketPromise", kind: "text", max: 70, min: 6, label: "Golden ticket: what it's good for",
      hint: "A real, doable promise. It's printed on the ticket and they can redeem it.",
      placeholder: "a date you will actually take them on — e.g. one rooftop café date, my treat",
      suggestions: ["One rooftop café date. My treat. Every month, forever.", "A whole Sunday. No phones. Your plan."],
    },
    { key: "letterTitle", kind: "text", max: 24, label: "Written in chocolate (first line)", placeholder: "how your letter opens — e.g. Meri Meethi,", suggestions: ["My sweetest,", "Meri Meethi,"] },
    { key: "drizzleWord", kind: "text", max: 6, label: "Word they pipe onto the last bonbon", hint: "Up to 6 letters. Blank = their name.", placeholder: "their name, or US" },
    { key: "insideNote", kind: "text", max: 60, label: "Folded note inside the heart (with photo 1)", placeholder: "a line about your first photo — e.g. This one's from Goa." },
    {
      key: "boxColor", kind: "enum", label: "Box colour", display: "swatches", default: "raspberry",
      options: [
        { value: "raspberry", label: "Raspberry", swatch: "#B0204F" },
        { value: "midnight", label: "Midnight", swatch: "#1E2240" },
        { value: "ivory", label: "Ivory", swatch: "#F3E9D8" },
        { value: "blush", label: "Blush", swatch: "#E9A9B6" },
      ],
    },
    { key: "signOff", kind: "text", max: 40, label: "Sign-off", placeholder: "how you sign the recipe card — e.g. Forever yours, Aryan" },
  ],
  demo: {
    ...base.demo,
    endLine: "Made by hand, at midnight, for one person.",
    extras: {
      welcomeNote: "I kept the shop open late. Just for you.",
      reasons: [
        { flavour: "hazelnut", reason: "You remember every tiny thing I say." },
        { flavour: "sea-salt", reason: "You make my worst days a little sweeter." },
        { flavour: "raspberry", reason: "Your laugh. Obviously." },
        { flavour: "pistachio", reason: "You steal my fries and then offer me one. Generous." },
        { flavour: "heart", reason: "You. Simply, completely you." },
      ],
      embossNames: true,
      crackLine: "Go on. Break my heart (the good way).",
      ticketPromise: "One rooftop café date. My treat. Every month, forever.",
      letterTitle: "Meri Meethi,",
      drizzleWord: "RIYA",
      insideNote: "This one's from Goa. My favourite version of you.",
      boxColor: "raspberry",
      signOff: "Forever yours, Aryan",
    },
  },
};
