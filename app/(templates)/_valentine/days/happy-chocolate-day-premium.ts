// happy-chocolate-day-premium — "La Boîte" (the ✦ Premium twin of happy-chocolate-day).
//
// A chocolatier's box, made for one person. A matte cacao lid with their initials in gold foil and a satin ribbon;
// they pull the ribbon (the song starts), lift the lid, and on the song's drop the tissue parts on nine glossy
// bonbons, each topped with one of their photos like a cocoa-butter transfer, the foil sheen following the tilt of
// the phone. Tap a bonbon to lift and turn it over: its flavour, and the memory it tastes of. The last piece is a
// heart, dusted in cocoa, saved for the letter ("Notes from the chocolatier"), then the voice note and a keepsake
// card: the lid itself.
//
// Extras keys + limits are mirrored in server/src/config/premiumDays/happy-chocolate-day-premium.ts and pinned in
// server/src/config/valentineDays.test.ts. The chorus second is the shared premium.songDropAt, not an extra.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import type { LovePhoto } from "../../_love/types";
import { premiumDay } from "./_premium";
import { chocolateDay } from "./happy-chocolate-day";

export type BoxColor = "cacao" | "raspberry" | "midnight" | "ivory";

export interface ChocolateExtrasPremium {
  houseName: string;
  openingLine: string;
  boxLine: string;
  flavours: { name: string }[];
  heartLine: string;
  sinceDate: string;
  signOff: string;
  boxColor: BoxColor;
  [k: string]: unknown;
}

// Two quiet sticker spots: the page is carried by photos and type. The ids (and their GIFs on the CDN) are v1's.
const GIFS: GifSlot[] = [
  { id: "pc3-yum", label: "Yum", moment: "Beside the open box, once a piece is tasted", file: "pc3-yum.gif", emoji: "🤤", anim: "pulse" },
  { id: "pc6-box", label: "Keepsake", moment: "On the corner of the keepsake lid", file: "pc6-box.gif", emoji: "🎁", anim: "pulse" },
];

/** research §E (oEmbed 200 + playableInEmbed, 2026-10-09), then two v1 picks. The first one is the demo song. */
export const BOITE_SONGS: readonly SongSuggestion[] = [
  { id: "09R8_2nJtjg", title: "Sugar", artist: "Maroon 5" },
  { id: "WMweEpGlu_U", title: "Butter", artist: "BTS" },
  { id: "58r8MDf5sxQ", title: "Sweetheart", artist: "Dev Negi · Kedarnath" },
  { id: "6uvUTu716rU", title: "Cupid (Twin Ver.)", artist: "FIFTY FIFTY" },
  { id: "E07s5ZYygMg", title: "Watermelon Sugar", artist: "Harry Styles" },
  { id: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh · Bhediya" },
];
/** Sugar's most-replayed phrase; the drop lands back on it as the lid comes off. */
const DEMO_START = 74;

/** The chocolatier's pick, in box order, for any bonbon the sender leaves unnamed. */
export const HOUSE_FLAVOURS = [
  "Salted caramel",
  "Raspberry ganache",
  "Hazelnut praline",
  "Dark 70%",
  "Rose & cardamom",
  "Pistachio cream",
  "Passion fruit",
  "Coffee crème",
  "Gold leaf",
] as const;

const A = "https://cdn.subhsandesh.in/gifts-media/assets";
const photo = (path: string, caption: string, note: string, cropY = 45): LovePhoto => ({ url: `${A}/${path}.webp`, caption, note, cropX: 50, cropY, scale: 100 });
const DEMO_PHOTOS: LovePhoto[] = [
  photo("couple1", "the evening you said yes to coffee", "I had a speech ready. I said “hi” and forgot the rest.", 55),
  photo("couple2", "our first proper date", "You laughed before I reached the punchline.", 40),
  photo("couple3", "the blossoms in Shimla", "You made me stand still for one photo. I'm glad.", 60),
  photo("couple4", "the night we counted stars", "You fell asleep at forty-two. I kept counting.", 55),
  photo("Aniversary/aniversary", "our first anniversary", "One year, and you still look at me like that."),
  photo("TemplateComingSoon/sorry2", "the day we made up", "We were both wrong. You were nicer about it."),
  photo("TemplateComingSoon/valentine", "our first Valentine's", "You ate the last truffle. I let you. That's love."),
  photo("TemplateComingSoon/wddinganiversary", "your sister's wedding", "Everyone watched the bride. I watched you."),
  photo("hero-bg", "us, on an ordinary Sunday", "My favourite flavour is still this one.", 40),
];

const base = premiumDay<ChocolateExtrasPremium>(chocolateDay, {
  slug: "happy-chocolate-day-premium",
  title: "La Boîte",
  gifSlots: GIFS,
  demoSong: { id: BOITE_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    songDropAt: DEMO_START,
    voiceCaption: "I tried to describe how you taste in my life. I just ended up smiling.",
    psLetter:
      "Open only if you ever doubt you're my favourite.\n\nThere's no flavour I'd swap you for. I checked. I've been checking for three years, and it's still you, every single time.",
  },
  copy: {
    letterPlaceholder: "Start with the first time you noticed them. Then the little things that make them your favourite flavour…",
    letterHint: "Printed on the chocolatier's cream menu card, “Notes from the chocolatier”, after the last piece.",
    photosHint: "Each photo becomes a bonbon in the box (up to 9), like a glossy photo transfer. Tap one and it turns over to show its memory.",
    captionHint: "the memory it tastes of, e.g. the night we got lost in Lonavala",
    noteHint: "one small line about that moment…",
    endLinePlaceholder: "Every piece of it was you.",
    endLineHint: "The last line, over the keepsake lid.",
    sheetTitle: "Fill their box of photo bonbons 🍫",
    sheetSub: "A chocolatier's box where every bonbon is one of your photos. It opens on your song. Everything is pre-filled: make it yours.",
    extrasTitle: "The box",
    extrasSub: "Your chocolatier's name, the lines around the box, the flavours and the colour",
    publishing: "Tying the ribbon…",
    storyTitle: "Let's fill their box of photo bonbons 🍫",
    replyText: "I tasted every single piece 🍫 You're my favourite flavour.",
  },
  share: { title: "A box of chocolates, made only for you 🍫", accent: "#B0324B" },
});

export const chocolateDayPremium: DayConfig<ChocolateExtrasPremium> = {
  ...base,
  melody: "cocoa",
  photoAspect: 1,
  music: { audioOnly: true, suggestions: BOITE_SONGS, suggestionsNote: "sweet & warm · tap to use", demoStart: DEMO_START },
  theme: {
    bg: "radial-gradient(90% 60% at 50% 35%, #3A2018 0%, #1E0F0B 55%, #0E0705 100%)",
    base: "#140A07",
    paper: "#F3E6D3",
    glass: "rgba(243,230,211,0.08)",
    ink: "#F3E6D3",
    inkSoft: "#D9C2A8",
    paperInk: "#2A1712",
    accent: "#C9A45C",
    accentDeep: "#8A6A2F",
    accentInk: "#1E0F0B",
    soft: "#3A2218",
    edge: "rgba(243,230,211,0.18)",
    gold: "#C9A45C",
    dark: true,
    particles: ["🍫", "✨", "🤎"],
    confetti: ["#4A2A1F", "#9C6B4E", "#B0324B", "#F3E6D3", "#C9A45C"],
  },
  extras: [
    {
      key: "houseName", kind: "text", max: 28, label: "Your chocolatier's name",
      placeholder: "e.g. Maison Aryan",
      hint: "Foil-stamped on the lid and printed on the menu card. Blank = “Maison” + your name.",
      suggestions: ["Maison Aryan", "Chocolaterie de Nous"],
    },
    {
      key: "openingLine", kind: "text", max: 60, label: "The line over the closed box",
      placeholder: "what they read before they lift the lid",
      suggestions: ["I couldn't pick one favourite, so I made you nine.", "Made by hand. For one person.", "Lift slowly. Every piece is us."],
    },
    {
      key: "boxLine", kind: "text", max: 60, label: "The line over the open box",
      placeholder: "what they read when they see every bonbon is a photo of you two",
      suggestions: ["Every piece is a day with you.", "Taste slowly. These are ours.", "Nine pieces. All of them us."],
    },
    {
      key: "flavours", kind: "objlist", maxItems: 9, itemTitle: "Bonbon", addLabel: "+ name a bonbon",
      label: "Name the flavours (in photo order)",
      hint: "Bonbon 1 sits on photo 1, and so on. Leave any blank and the chocolatier picks: salted caramel, raspberry ganache, hazelnut praline…",
      item: [{ key: "name", kind: "text", max: 28, label: "Flavour", placeholder: "e.g. Salted caramel, the Lonavala one" }],
    },
    {
      key: "heartLine", kind: "text", max: 60, label: "The line on the last piece",
      placeholder: "what they read when the heart is uncovered",
      hint: "The last piece is a heart, dusted in cocoa. They brush it clean to read this.",
      suggestions: ["I saved the last piece for you. I always will.", "The last one was always yours."],
    },
    { key: "sinceDate", kind: "text", max: 24, label: "Together since", placeholder: "any way you like: 2022, 14 Feb 2022, our first monsoon", hint: "Printed on the lid like a chocolatier's “Est.”." },
    { key: "signOff", kind: "text", max: 40, label: "Sign-off", placeholder: "how you sign the menu card, e.g. Forever yours, Aryan" },
    {
      key: "boxColor", kind: "enum", label: "The box", display: "swatches", default: "cacao",
      hint: "The colour of the lid and its ribbon.",
      options: [
        { value: "cacao", label: "Cacao & raspberry", swatch: "#2A1712" },
        { value: "raspberry", label: "Raspberry & gold", swatch: "#7E1F33" },
        { value: "midnight", label: "Midnight & gold", swatch: "#151A2E" },
        { value: "ivory", label: "Ivory & cacao", swatch: "#EFE4D2" },
      ],
    },
  ],
  demo: {
    ...base.demo,
    recipientName: "Riya",
    senderName: "Aryan",
    petName: "Meethi",
    photos: DEMO_PHOTOS,
    letter:
      "A chocolatier once told me the trick is patience: you temper it slowly, you don't rush the set, and you never, ever skip the good cocoa. I think that's how I fell for you. Slowly, then completely, and with nothing cheap in it.\n\nYou make ordinary days taste like something. Chai on the balcony. The wrong turn in Lonavala. The way you steal the last piece and then offer me half, as if that was always the plan.\n\nSo this year I didn't want to buy you a box from a shop. I wanted to make you one out of us. Nine pieces, and every one of them is a day I'd live again.\n\nHappy Chocolate Day, Meethi. You're still my favourite flavour.",
    endLine: "Every piece of it was you.",
    extras: {
      houseName: "Maison Aryan",
      openingLine: "I couldn't pick one favourite, so I made you nine.",
      boxLine: "Every piece is a day with you.",
      flavours: [
        { name: "Salted caramel" },
        { name: "Raspberry ganache" },
        { name: "Hazelnut praline" },
        { name: "Dark 70%, like your coffee" },
        { name: "Rose & cardamom" },
        { name: "Pistachio cream" },
        { name: "Passion fruit" },
        { name: "Coffee crème" },
        { name: "Gold leaf" },
      ],
      heartLine: "I saved the last piece for you. I always will.",
      sinceDate: "2022",
      signOff: "Forever yours, Aryan",
      boxColor: "cacao",
    },
  },
};
