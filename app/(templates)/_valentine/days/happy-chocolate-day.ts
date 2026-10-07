import type { DayConfig, GifSlot } from "../types";
import { MUSIC_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "happy-chocolate-day" as const;

export interface ChocolateExtras {
  giftTag: string;
  boxSize: "9" | "6";
  reasons: string[];
  finalAsk: string;
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "c1-box", label: "The box", moment: "Lid opens — “9 pieces, 9 reasons”", file: "c1-box.gif", emoji: "🎁", anim: "bounce" },
  { id: "c2-gooey", label: "Gooey bite", moment: "The gooey-centre piece is bitten", file: "c2-gooey.gif", emoji: "🤤", anim: "wiggle" },
  { id: "c3-letter", label: "Letter", moment: "After the letter", file: "c3-letter.gif", emoji: "🍫", anim: "pulse" },
  { id: "c4-photos", label: "Assortment", moment: "“The Assortment” photos", file: "c4-photos.gif", emoji: "📸", anim: "float" },
  { id: "c5-yes", label: "One more?", moment: "“One more piece? Yes, with you”", file: "c5-yes.gif", emoji: "💃", anim: "spin" },
];

export const chocolateDay: DayConfig<ChocolateExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Ek Dabba Pyaar",
  maxPhotos: 8,
  letterMax: 1500,
  letterMin: 50,
  asksQuestion: false,
  melody: "cocoa",
  photoAspect: 1,
  gifSlots: GIFS,
  extras: [
    { key: "giftTag", kind: "text", max: 80, label: "Gift tag on the box", placeholder: "what you'd scribble on the tag — e.g. for the girl who hides my Dairy Milk", suggestions: ["For the person sweeter than every chocolate in this box.", "Kuch meetha ho jaaye? 🍫"] },
    {
      key: "boxSize", kind: "enum", label: "Box size", display: "chips", default: "9",
      options: [
        { value: "9", label: "9 pieces", emoji: "🍫" },
        { value: "6", label: "6 pieces", emoji: "🍬" },
      ],
    },
    {
      key: "reasons", kind: "list", maxItems: 9, minItems: 6, itemMax: 90, label: "Sweet reasons — one per piece",
      hint: "They peel the foil and bite. Piece 5 is the gooey centre, the last is the heart truffle.",
      itemPlaceholder: [
        "the laugh that fixes your worst days",
        "a tiny habit of theirs you've memorised",
        "something they always remember about you",
        "their good-morning text, in their words",
        "the softest thing about them (gooey centre 🫠)",
        "your favourite lazy-Sunday thing together",
        "how they believe in you",
        "the 'us' after every fight",
        "the simplest, biggest reason (heart truffle ❤️)",
      ],
      addLabel: "+ add a piece",
    },
    { key: "finalAsk", kind: "text", max: 60, label: "The last line", placeholder: "the one more piece you're offering", suggestions: ["One more piece… with me, forever?", "Ek aur? Bas tumhare saath."] },
  ],
  theme: {
    bg: "radial-gradient(120% 85% at 50% 0%, #6A3D29 0%, #3B2117 68%)",
    base: "#3B2117",
    paper: "#FFF4E6",
    glass: "rgba(255,244,230,0.09)",
    ink: "#FFF4E6",
    inkSoft: "#E9CDB6",
    paperInk: "#3B2117",
    accent: "#E0457B",
    accentDeep: "#A82B58",
    accentInk: "#FFFFFF",
    soft: "#FBE1E9",
    edge: "#EBD5C4",
    gold: "#E6B85C",
    dark: true,
    particles: ["🍫", "✨", "💗"],
    confetti: ["#E6B85C", "#E0457B", "#F7C6D3", "#C98A4B", "#A8C686"],
  },
  demo: {
    recipientName: "Riya",
    senderName: "Aryan",
    petName: "Meethi",
    letter:
      "My dearest Riya,\n\nThey say it's Chocolate Day, but honestly every day with you tastes like one. You came into my life like the last piece in the box — the one I didn't know I was saving for.\n\nThank you for the patience, the chai, the late-night calls, and the way you say my name when you're pretending to be annoyed.\n\nKuch meetha ho jaaye? Toh bas, tum ho jaao.\n\nForever yours,\nAryan",
    photos: demoPhotos([
      ["Goa sunset — salted caramel", "You said the sky looked like caramel. You were right, as usual."],
      ["first date — dark & a little bitter", "I was so nervous I ordered the wrong coffee. You drank it anyway."],
      ["cherry blossom — strawberry cream", "You picked a flower and put it behind my ear. I kept it in my wallet."],
      ["us — 100% pure", "No added sugar needed."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...MUSIC_DEMO,
    endLine: "9 reasons, 0 calories, 100% yours 🍫",
    extras: {
      giftTag: "For the girl who is sweeter than every chocolate in this box.",
      boxSize: "9",
      reasons: [
        "Your laugh fixes my worst days.",
        "You steal my fries and I still smile.",
        "You remember the tiny things I say.",
        "Tumhari good-morning texts — meri daily dose of meetha.",
        "You are the soft centre of my whole life.",
        "You make 'boring' Sundays my favourite.",
        "You believe in me louder than I do.",
        "Har fight ke baad bhi, it's always us.",
        "Because you're you. That's the whole reason.",
      ],
      finalAsk: "One more piece… with me, forever?",
    },
  },
  copy: {
    recipientPlaceholder: "who gets the box — e.g. Riya",
    senderPlaceholder: "your name on the tag",
    petNamePlaceholder: "the sweet name only you use",
    letterPlaceholder: "Which chocolate is them, and why? Then the thing you'd only say after the box is empty…",
    letterHint: "Melts out of the last heart truffle, written on the wrapper paper.",
    photosHint: "Your photos become “The Assortment” — give each a flavour.",
    captionHint: "caption + flavour — e.g. Goa sunset — salted caramel",
    noteHint: "what that moment tasted like…",
    endLinePlaceholder: "9 reasons, 0 calories, 100% yours 🍫",
    endLineHint: "The last line, under the empty box.",
    sheetTitle: "Fill their box 🍫",
    sheetSub: "One sweet reason per piece, a letter in the last truffle. Everything is pre-filled — make it yours.",
    extrasTitle: "The box",
    extrasSub: "The gift tag and the sweet reason under every foil",
    publishing: "Tying the ribbon…",
    storyTitle: "Let's fill their chocolate box 🍫",
    replyText: "Ate all 9 reasons 🍫 Zero regrets. You're the sweetest.",
  },
  share: { title: "A box of chocolates, just for you 🍫", accent: "#A82B58" },
};
