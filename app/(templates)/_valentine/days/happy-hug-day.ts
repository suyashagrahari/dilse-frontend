import type { DayConfig, GifSlot } from "../types";
import { MUSIC_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "happy-hug-day" as const;

export interface HugExtras {
  cafeSign: string;
  squishPrompt: string;
  characters: "bear-bunny" | "bear-bear" | "cat-cat" | "panda-bear";
  tagMe: string;
  tagYou: string;
  menu: { name: string; line: string; price: string }[];
  coupons: { title: string; detail: string }[];
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "h1-welcome", label: "Welcome", moment: "The café door opens", file: "h1-welcome.gif", emoji: "👋", anim: "wiggle" },
  { id: "h2-hug", label: "First hug", moment: "The first squish hug", file: "h2-hug.gif", emoji: "🤗", anim: "pulse" },
  { id: "h3-cosy", label: "Cosy", moment: "Back hug / sleepy hug", file: "h3-cosy.gif", emoji: "🥰", anim: "float" },
  { id: "h4-far", label: "Far away", moment: "The long-distance hug", file: "h4-far.gif", emoji: "📱", anim: "bounce" },
  { id: "h5-coupon", label: "Coupons", moment: "Hug coupons / ending", file: "h5-coupon.gif", emoji: "🎟️", anim: "spin" },
];

export const hugDay: DayConfig<HugExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Jaadu Ki Jhappi Café",
  maxPhotos: 9,
  letterMax: 1500,
  letterMin: 50,
  asksQuestion: false,
  melody: "cafe",
  photoAspect: 1,
  gifSlots: GIFS,
  extras: [
    { key: "cafeSign", kind: "text", max: 40, label: "Café sign", placeholder: "the sign over the door", suggestions: ["Jhappi Café · open only for you", "Hugs on tap ☕"] },
    { key: "squishPrompt", kind: "text", max: 40, label: "Squish prompt", placeholder: "how you'd tell them to bring the two together", suggestions: ["Inhe milao 🥺", "Push us together →←"] },
    {
      key: "characters", kind: "enum", label: "The two huggers", display: "cards", default: "bear-bunny",
      options: [
        { value: "bear-bunny", label: "Bear + Bunny", emoji: "🐻🐰" },
        { value: "bear-bear", label: "Two bears", emoji: "🐻🐻" },
        { value: "cat-cat", label: "Two cats", emoji: "🐱🐱" },
        { value: "panda-bear", label: "Panda + Bear", emoji: "🐼🐻" },
      ],
    },
    { key: "tagMe", kind: "text", max: 12, label: "Your character's name tag", placeholder: "Me / your nickname" },
    { key: "tagYou", kind: "text", max: 12, label: "Their character's name tag", placeholder: "You / their pet name" },
    {
      key: "menu", kind: "objlist", maxItems: 6, minItems: 4, label: "The Hug Menu", itemTitle: "Hug", addLabel: "+ add a hug",
      hint: "4–6 hugs. Each one is a little gesture they try, and it stamps their Jhappi Passport.",
      item: [
        { key: "name", kind: "text", max: 24, label: "Hug", placeholder: "Bear Hug / Back Hug / Airport Hug" },
        { key: "line", kind: "text", max: 70, label: "On the menu", placeholder: "when they'd need this one" },
        { key: "price", kind: "text", max: 20, label: "Price", placeholder: "1 smile / free forever" },
      ],
    },
    {
      key: "coupons", kind: "objlist", maxItems: 6, minItems: 3, label: "Hug coupons", itemTitle: "Coupon", addLabel: "+ add a coupon",
      hint: "Tear-off coupons they can send back on WhatsApp to redeem.",
      item: [
        { key: "title", kind: "text", max: 30, label: "Coupon", placeholder: "One 10-minute Bear Hug" },
        { key: "detail", kind: "text", max: 80, label: "Fine print", placeholder: "Redeemable anytime, even mid-fight" },
      ],
    },
  ],
  theme: {
    bg: "linear-gradient(180deg, #FFF1E0 0%, #FFE6D9 60%, #FFDCE3 100%)",
    base: "#FFF1E0",
    paper: "#FFFAF3",
    glass: "rgba(255,255,255,0.62)",
    ink: "#6B4232",
    inkSoft: "#94705F",
    paperInk: "#5A3628",
    accent: "#FF6F91",
    accentDeep: "#D64C70",
    accentInk: "#FFFFFF",
    soft: "#FFE5EC",
    edge: "#F2DDCF",
    gold: "#FFD98A",
    dark: false,
    particles: ["🤗", "☕", "💗", "🧶"],
    confetti: ["#FF8FAB", "#FFB59A", "#FFD98A", "#CDB8F0", "#FF6F91"],
  },
  demo: {
    recipientName: "Tanvi",
    senderName: "Aarav",
    petName: "Cutie",
    letter:
      "Hey Tanvi,\n\nI wish this page could actually hug you. Since it can't, here's what I'd say with my arms around you: you're my favourite place to be.\n\nOn your bad days, I want to be the jhappi that makes them smaller. On your good days, I want to be the one squeezing you the tightest.\n\nTill I can hug you for real, keep this one. It's warm, I checked.\n\nYour forever jhappi-giver,\nAarav",
    photos: demoPhotos([
      ["our first hug 🤗", "It lasted eleven seconds. I counted. I wanted twelve."],
      ["airport goodbye", "You held on so long the security guy started smiling."],
      ["hoodie thief", "It looks better on you. Keep it. Fine. Keep it."],
      ["us, squished", "Best seat in the house."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...MUSIC_DEMO,
    endLine: "Ek jhappi roz, baaki sab adjust ho jayega.",
    extras: {
      cafeSign: "Jhappi Café · open only for you",
      squishPrompt: "Inhe milao 🥺",
      characters: "bear-bunny",
      tagMe: "Me",
      tagYou: "You",
      menu: [
        { name: "Bear Hug", line: "Itni tight ki saari tension nikal jaaye", price: "1 smile" },
        { name: "Back Hug", line: "For when you're making chai and pretending not to notice me", price: "free forever" },
        { name: "Sleepy Hug", line: "5 minute aur, please", price: "2 kisses" },
        { name: "Airport Hug", line: "The long one. For the day I come back.", price: "1 promise" },
      ],
      coupons: [
        { title: "One 10-minute Bear Hug", detail: "Redeemable anytime, even mid-fight" },
        { title: "Unlimited Back Hugs", detail: "While you cook. No expiry." },
        { title: "One Airport Hug", detail: "For the day I come back" },
      ],
    },
  },
  copy: {
    recipientPlaceholder: "who's the café for — e.g. Tanvi",
    senderPlaceholder: "your name",
    petNamePlaceholder: "what you call them mid-hug",
    letterPlaceholder: "What you'd say with your arms around them — the bad day you'd hug away, the good day you'd squeeze…",
    letterHint: "A card tucked in the hoodie pocket, opened after the first hug.",
    photosHint: "Your photos become patches on a cosy memory quilt.",
    captionHint: "caption — e.g. airport goodbye",
    noteHint: "how that hug felt…",
    endLinePlaceholder: "Ek jhappi roz, baaki sab adjust ho jayega.",
    endLineHint: "The last line, by the hug coupons.",
    sheetTitle: "Open your Jhappi Café 🤗",
    sheetSub: "Write the Hug Menu, tuck a card in the pocket, print the coupons. Everything is pre-filled — make it yours.",
    extrasTitle: "The café",
    extrasSub: "The sign, the two huggers, the Hug Menu and coupons",
    publishing: "Warming up the café…",
    storyTitle: "Let's open their hug café 🤗",
    replyText: "Redeeming ALL my hug coupons 🤗 Report to me immediately.",
  },
  share: { title: "A warm hug, delivered 🤗", accent: "#D64C70" },
};
