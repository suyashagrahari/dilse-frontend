// happy-chocolate-day-premium — "The Sweetheart Chocolate Factory" (the ✦ Premium twin of happy-chocolate-day).
//
// A bright, candy-pastel chocolate factory built for one girl. She scratches her golden ticket (the song starts) and
// takes the tour: packs six kawaii truffles into her box (each flavour is a reason), unwraps a giant bar that turns
// out to be her photo in chocolate, dips their photos like strawberries, plays a 15-second catch game for "kisses I
// owe you", melts a chocolate heart to find his letter, opens a music box with his voice, wins the last piece, then
// pulls the chocolate-fountain lever: on the song's chorus a chocolate river carries her photos into the box she
// filled. Ends on a "Box of Us" keepsake, a coupon she stamps, a sealed P.S. and "send a chocolate back".
//
// Extras keys + limits are mirrored in server/src/config/premiumDays/happy-chocolate-day-premium.ts and pinned in
// server/src/config/valentineDays.test.ts. houseName, openingLine, flavours, boxLine, heartLine, sinceDate and signOff
// are kept from v2 (same meaning, so a v2 page carries over). The chorus second is the shared premium.songDropAt.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { DEMO_PHOTO_CDN } from "../../_love/types";
import { premiumDay } from "./_premium";
import { chocolateDay } from "./happy-chocolate-day";

export interface ChocolateExtrasPremium {
  houseName: string;
  openingLine: string;
  flavours: { name: string; reason: string }[];
  boxLine: string;
  catchPrize: string;
  heartLine: string;
  lastPiece: string;
  sinceDate: string;
  signOff: string;
  coupon: string;
  [k: string]: unknown;
}

/**
 * The GIF stickers live in the shared premium library on our CDN (templates/_premium/gifs/…). Sticker resolves
 * `file` under templates/<slug>/, so "../_premium/…" lands on the library file: the "Ours" default of every slot
 * is a real couple-sticker GIF, and the sender can still paste their own or hide it.
 */
const lib = (name: string) => `../_premium/gifs/${name}.webp`;
const GIFS: GifSlot[] = [
  { id: "sf1-ticket", label: "Golden ticket", moment: "Beside her golden ticket at the factory gate", file: lib("chocolate-day/penguin-chocolate-bar"), emoji: "🎫", anim: "float" },
  { id: "sf2-box", label: "Box packed", moment: "When the sixth truffle lands in her box", file: lib("chocolate-day/i-love-you-chocolate-box"), emoji: "🍫", anim: "bounce" },
  { id: "sf3-catch", label: "Game over", moment: "Her score at the end of the catch game", file: lib("chocolate-day/bear-eating-cookie"), emoji: "🧺", anim: "bounce" },
  { id: "sf4-melt", label: "Melting heart", moment: "Next to the chocolate heart she melts", file: lib("chocolate-day/penguin-chocolate-heart"), emoji: "🫠", anim: "pulse" },
  { id: "sf5-share", label: "The bigger half", moment: "When she takes the last piece", file: lib("chocolate-day/bears-dinner-date"), emoji: "🥰", anim: "wiggle" },
  { id: "sf6-yay", label: "Fountain finale", moment: "On the chorus, as her photos land in the box", file: lib("teddy-day/bears-pink-cuddle"), emoji: "🥳", anim: "bounce" },
];

/** research §E (oEmbed 200 + playableInEmbed, 2026-10-09). The first one is the demo song. */
export const FACTORY_SONGS: readonly SongSuggestion[] = [
  { id: "09R8_2nJtjg", title: "Sugar", artist: "Maroon 5" },
  { id: "58r8MDf5sxQ", title: "Sweetheart", artist: "Dev Negi · Kedarnath" },
  { id: "E07s5ZYygMg", title: "Watermelon Sugar", artist: "Harry Styles" },
  { id: "WMweEpGlu_U", title: "Butter", artist: "BTS" },
  { id: "6uvUTu716rU", title: "Cupid (Twin Ver.)", artist: "FIFTY FIFTY" },
  { id: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh · Bhediya" },
];
/** Sugar's chorus ("Sugar, yes please"), its most-replayed part; the fountain's drop lands back on it. */
const DEMO_START = 74;

const photo = (file: string, caption: string, note: string, cropX = 50, cropY = 50, scale = 100) => ({
  url: `${DEMO_PHOTO_CDN}/${file}`, caption, note, cropX, cropY, scale,
});

// Photo 1 = the chocolate bar · 2–7 = the dipping station · all of them ride the chocolate river into the box.
const PHOTOS = [
  photo("couple1.webp", "the sunset we drove two hours for", "You said the sky looked like caramel.", 50, 55),
  photo("couple2.webp", "first date, the fairy-light café", "You stole my brownie, then the whole evening."),
  photo("couple4.webp", "the night we counted stars", "You fell asleep at forty-two. I kept counting.", 50, 40),
  photo("couple3.webp", "cherry blossom season", "Even the trees were showing off for you."),
  photo("couple2.webp", "the close-up I never posted", "This one is just for me.", 46, 36, 170),
  photo("couple1.webp", "us, mid-laugh", "I don't remember the joke. I remember you.", 50, 70, 160),
];

const base = premiumDay<ChocolateExtrasPremium>(chocolateDay, {
  slug: "happy-chocolate-day-premium",
  title: "The Sweetheart Chocolate Factory",
  gifSlots: GIFS,
  demoSong: { id: FACTORY_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    songDropAt: DEMO_START,
    voiceCaption: "I tried to say this without smiling. Didn't work. Happy Chocolate Day, Meethi.",
    psLetter:
      "Open only if you finish the real chocolates before me again.\n\nYou always do. And you always save me the last piece, then eat half of it. I've never once minded. I hope you never stop.",
  },
  copy: {
    letterPlaceholder: "Riya,\n\nThe thing you'd tell her if the whole factory went quiet for a minute…",
    letterHint: "Hidden under a chocolate heart she melts with her thumb. It types itself out on cream wrapper paper. Write it like a letter, not a caption.",
    photosHint: "Photo 1 is pressed into a giant chocolate bar she unwraps. Photos 2–7 get dipped in chocolate like strawberries. At the finale every photo rides the chocolate river into her box.",
    captionHint: "the moment, e.g. first date, the fairy-light café",
    noteHint: "what you remember most about it…",
    endLinePlaceholder: "You're the sweetest thing I've ever had. 🍫",
    endLineHint: "Printed under her Box of Us at the very end.",
    sheetTitle: "Build her chocolate factory 🍫",
    sheetSub: "A candy-pastel chocolate factory made just for her: a golden ticket, a box she packs with six reasons, her photo in a giant bar, your photos dipped in chocolate, a catch game, a heart that melts into your letter, your voice, and a chocolate fountain that lands on the chorus of your song. Everything is pre-filled. Make it yours.",
    extrasTitle: "Your factory",
    extrasSub: "The factory's name, her golden ticket, six truffles and their reasons, the game prize and her coupon",
    publishing: "Tying the ribbon…",
    storyTitle: "Let's build her chocolate factory 🍫",
    replyText: "Ate every single one 🍫 You're the sweetest. Now pay up those kisses.",
  },
  share: { title: "A chocolate factory, made just for you 🍫", accent: "#D63F72" },
});

export const chocolateDayPremium: DayConfig<ChocolateExtrasPremium> = {
  ...base,
  letterMin: 80,
  melody: "cocoa",
  photoAspect: 1,
  music: { audioOnly: true, suggestions: FACTORY_SONGS, suggestionsNote: "sweet & romantic · tap to use", demoStart: DEMO_START },
  // Choco Latte + Strawberry Milk (research §C1).
  theme: {
    bg: "linear-gradient(160deg, #FFF8F0 0%, #FFE9EF 50%, #F6E2CF 100%)",
    base: "#FFF8F0",
    paper: "#FFFCF7",
    glass: "rgba(255,255,255,0.78)",
    ink: "#4A2C1E",
    inkSoft: "#7B4A2E",
    paperInk: "#4A2C1E",
    accent: "#FF6F9C",
    accentDeep: "#D63F72",
    accentInk: "#FFFFFF",
    soft: "#FFD1DF",
    edge: "rgba(123,74,46,0.16)",
    gold: "#FFD166",
    dark: false,
    particles: ["🍫", "💗", "✨", "🍓"],
    confetti: ["#FF6F9C", "#FF9EBB", "#FFD166", "#9FE5C8", "#FFFFFF", "#B9744D"],
  },
  extras: [
    {
      key: "houseName", kind: "text", max: 28, label: "Your factory's name",
      placeholder: "e.g. Aryan's Sweetheart Factory",
      hint: "On her golden ticket, the bar's wrapper and her keepsake box. Blank = “{your name}'s Chocolate Factory”.",
      suggestions: ["Aryan's Sweetheart Factory", "The Meethi Factory", "Aryan & Co. Chocolates"],
    },
    {
      key: "openingLine", kind: "text", max: 60, label: "The fine print on her golden ticket",
      placeholder: "Admit one · unlimited chocolate · forever",
      hint: "Printed under her name on the golden ticket she scratches at the gate.",
      suggestions: ["Admit one · unlimited chocolate · forever", "Valid for one girl · every flavour · no expiry", "VIP tour · free samples · lifetime pass"],
    },
    {
      key: "flavours", kind: "objlist", maxItems: 6, itemTitle: "Truffle", addLabel: "+ add a truffle",
      label: "Six truffles for her box",
      hint: "She packs them into her box one by one. Each truffle's flavour comes with the reason it's in there. Leave any blank and the factory picks a cute one.",
      item: [
        { key: "name", kind: "text", max: 24, label: "Flavour", placeholder: "e.g. Hazelnut crunch" },
        { key: "reason", kind: "text", max: 60, label: "The reason", placeholder: "e.g. your laugh, the loud one" },
      ],
    },
    {
      key: "boxLine", kind: "text", max: 60, label: "The label on her full box",
      placeholder: "Six reasons. One box. All you.",
      hint: "Pops onto the box when the sixth truffle lands, and again on the box at the finale.",
      suggestions: ["Six reasons. One box. All you.", "Packed by hand, for my favourite person", "Sab kuch meetha, sab kuch tum"],
    },
    {
      key: "catchPrize", kind: "text", max: 28, label: "What every chocolate she catches is worth",
      placeholder: "kisses I owe you",
      hint: "Her score in the catch game reads “23 kisses I owe you”. Make it something you'll actually pay up.",
      suggestions: ["kisses I owe you", "hugs, redeemable anytime", "chocolates I owe you"],
    },
    {
      key: "heartLine", kind: "text", max: 60, label: "The line inside the melting heart",
      placeholder: "I saved the sweetest part for you.",
      hint: "She holds her thumb on a chocolate heart until it melts; this line is waiting under it, right before your letter.",
      suggestions: ["I saved the sweetest part for you.", "You melt me. Every single time.", "Tum ho toh sab meetha hai"],
    },
    {
      key: "lastPiece", kind: "text", max: 60, label: "When she takes the last piece",
      placeholder: "The bigger half is always yours.",
      hint: "One piece left: your name runs away, hers wins, the bar snaps and the bigger half slides to her with this line.",
      suggestions: ["The bigger half is always yours.", "Last piece, first choice, always you.", "I'd share anything with you. Except you."],
    },
    { key: "sinceDate", kind: "text", max: 24, label: "Together since", placeholder: "any way you like: 2022, 14 Feb 2022, our first monsoon", hint: "Stamped on her Box of Us as “est. …”. Leave empty to hide it." },
    { key: "signOff", kind: "text", max: 40, label: "Sign-off", placeholder: "how you sign the letter, e.g. Forever yours, Aryan" },
    {
      key: "coupon", kind: "text", max: 50, label: "Her coupon",
      placeholder: "Valid for one real chocolate date. My treat.",
      hint: "A coupon in her gift-shop keepsake. She taps to claim it, so make it real.",
      suggestions: ["Valid for one real chocolate date. My treat.", "One box of your favourites, delivered by me", "Ek chocolate, anytime, no questions asked"],
    },
  ],
  demo: {
    ...base.demo,
    recipientName: "Riya",
    senderName: "Aryan",
    petName: "Meethi",
    photos: PHOTOS,
    letter:
      "Riya,\n\nI built you a whole chocolate factory because one bar felt way too small for what I wanted to say.\n\nYou steal the last bite and then offer me half, as if that was always the plan. You say “just one piece” and finish the box. You laugh at your own jokes before the punchline, and somehow that's my favourite part of every day.\n\nI don't need anything fancy. Just you, a cold coffee, and the window seat at our café.\n\nYou're still my favourite flavour, Meethi. You always will be.",
    endLine: "You're the sweetest thing I've ever had. 🍫",
    extras: {
      houseName: "Aryan's Sweetheart Factory",
      openingLine: "Admit one · unlimited chocolate · forever",
      flavours: [
        { name: "Hazelnut crunch", reason: "your laugh, the loud one" },
        { name: "Strawberry cream", reason: "how you say my name when you're sleepy" },
        { name: "Salted caramel", reason: "your “five more minutes” that means forty" },
        { name: "Dark 70%", reason: "you before your morning coffee. Still cute." },
        { name: "Rose pistachio", reason: "the way you hold my hand in a crowd" },
        { name: "The gold heart", reason: "just you. That's the whole recipe." },
      ],
      boxLine: "Six reasons. One box. All you.",
      catchPrize: "kisses I owe you",
      heartLine: "I saved the sweetest part for you.",
      lastPiece: "The bigger half is always yours.",
      sinceDate: "2023",
      signOff: "Forever yours, Aryan",
      coupon: "Valid for one real chocolate date. My treat.",
    },
  },
};
