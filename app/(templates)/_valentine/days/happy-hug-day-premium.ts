// happy-hug-day-premium — "The Hug Passport" (v3, the ✦ Premium twin of happy-hug-day).
//
// Collect every kind of hug (research §D6). Her own Hug Passport and a bear with open arms ("Come here, you.") open
// the page; the tap starts the song. Then five hugs, each a short gesture with jelly physics that ends with a rubber
// stamp thunking into the passport and one of her photos as the souvenir: the bear hug (pinch them together), the
// back hug (drag him behind her), the twirl hug (draw a circle), the pat-pat hug (pat his head under a rain cloud)
// and the long-distance hug (drag two phones together while the kilometres count down). Then his letter by hug mail,
// his voice from a purring plush, hug coupons she can redeem, and the last stamp: "Will you be my forever hug?" —
// on the chorus the Forever stamp slams down and the passport bursts into a wall of hugging couples around her
// photo. It ends on her passport (holder page + every stamp), saved as a wallpaper, and a hug she sends back.
//
// Extras keys + limits are mirrored in server/src/config/premiumDays/happy-hug-day-premium.ts and pinned in
// server/src/config/valentineDays.test.ts. Keys shared with the $2 day keep its key (characters, coupons); keys from
// v2 keep theirs (openingLine, distanceKm, meetLine, hugLines, replyLine). The chorus second is premium.songDropAt.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import type { LovePhoto } from "../../_love/types";
import { premiumDay } from "./_premium";
import { hugDay, type HugExtras } from "./happy-hug-day";

export interface HugExtrasPremium {
  openingLine: string;
  characters: HugExtras["characters"];
  hugLines: string[];
  distanceKm: number;
  meetLine: string;
  coupons: { title: string; detail: string }[];
  replyLine: string;
  question: string;
  yesLine: string;
  hugTitle: string;
  [k: string]: unknown;
}

const CDN_GIFS = "https://cdn.subhsandesh.in/gifts-media/templates/_premium/gifs";
/** Our sticker library lives under templates/_premium/gifs; a slot's `file` resolves against templates/<slug>/. */
const lib = (path: string) => `../_premium/gifs/${path}`;

const GIFS: GifSlot[] = [
  { id: "hp1-run", label: "Come here", moment: "On the passport cover, running in for a hug", file: lib("hug-day/penguin-run-hug.webp"), emoji: "🤗", anim: "bounce" },
  { id: "hp2-bear", label: "Bear hug", moment: "When the bear hug is stamped", file: lib("hug-day/cats-squeeze-hug.webp"), emoji: "🐻", anim: "pulse" },
  { id: "hp3-back", label: "Back hug", moment: "When the back hug is stamped", file: lib("hug-day/bears-back-hug.webp"), emoji: "🫶", anim: "float" },
  { id: "hp4-far", label: "Long distance", moment: "Next to the two phones, before they meet", file: lib("valentines-day/penguin-i-love-you-so-much.webp"), emoji: "📱", anim: "bounce" },
  { id: "hp5-coupon", label: "Coupons", moment: "Peeking over the hug coupon booklet", file: lib("valentines-day/panda-i-love-u-sign.webp"), emoji: "🎟️", anim: "wiggle" },
  { id: "hp6-yes", label: "Forever", moment: "On the wall of hugs, after they say yes", file: lib("kiss-day/bears-surprise-kiss.webp"), emoji: "💞", anim: "pulse" },
];
const DEMO_GIFS: Record<string, string> = Object.fromEntries(GIFS.map((g) => [g.id, `${CDN_GIFS}/${g.file.replace("../_premium/gifs/", "")}`]));

/** research §E (oEmbed 200 + playableInEmbed, 2026-10-09). The first one is the demo song. */
export const HUG_SONGS: readonly SongSuggestion[] = [
  { id: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran" },
  { id: "acvIVA9-FMQ", title: "Lucky", artist: "Jason Mraz ft. Colbie Caillat" },
  { id: "BSJa1UytM8w", title: "Saiyaara", artist: "Faheem Abdullah · Saiyaara" },
  { id: "RLzC55ai0eo", title: "Heeriye", artist: "Jasleen Royal ft. Arijit Singh" },
  { id: "Q5z6RHIpi2Y", title: "Thinking Out Loud (lyric video)", artist: "Ed Sheeran" },
];
/** The demo song opens on its most-replayed phrase; the last stamp drops back onto it. */
const DEMO_START = 42;

const A = "https://cdn.subhsandesh.in/gifts-media/assets";
const photo = (path: string, caption: string, note: string, cropY = 45): LovePhoto => ({ url: `${A}/${path}.webp`, caption, note, cropX: 50, cropY, scale: 100 });
const DEMO_PHOTOS: LovePhoto[] = [
  photo("couple4", "the night we counted stars", "You fell asleep on my shoulder at star forty-two. I didn't move for an hour.", 55),
  photo("couple1", "the airport, the first goodbye", "You held on so long the security guy started smiling.", 55),
  photo("couple2", "our first proper date", "You laughed before I finished the joke. I've been showing off ever since.", 40),
  photo("couple3", "Shimla, in the cold", "You put your hands in my jacket pockets. With my hands still in them.", 60),
  photo("Aniversary/aniversary", "one year of us", "Still my favourite place to stand: right next to you."),
  photo("hero-bg", "us, squished", "Best seat in the house.", 40),
];

const DEFAULT_HUG_LINES = [
  "For the days that are too much. I'll squeeze them smaller.",
  "For when you're making chai and pretending not to notice me.",
  "For good news. I'm lifting you off the ground.",
  "For bad days. Pat, pat. I'm right here.",
];

const base = premiumDay<HugExtrasPremium>(hugDay, {
  slug: "happy-hug-day-premium",
  title: "The Hug Passport",
  gifSlots: GIFS,
  demoSong: { id: HUG_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    songDropAt: DEMO_START,
    voiceCaption: "I recorded this three times. The third one has me laughing, so obviously that's the one.",
    psLetter:
      "Open only on a day that's too heavy.\n\nGo back to the pat-pat hug and do it three more times. I'll feel it, I promise. Then call me, even if it's late.",
  },
  copy: {
    recipientPlaceholder: "whose passport is it, e.g. Tanvi",
    petNamePlaceholder: "what you call them mid-hug",
    letterPlaceholder: "What you'd say with your arms around them: the bad day you'd hug away, the good day you'd squeeze, the first hug you remember…",
    letterHint: "It arrives by hug mail after the five hugs, in an airmail envelope with their name, and types itself out.",
    photosHint: "Photo 1 is their passport photo. Photos 1–5 are the souvenirs of the five hugs, each with your caption.",
    captionHint: "caption, e.g. the airport, the first goodbye",
    noteHint: "a little note about this photo…",
    endLinePlaceholder: "Valid for every hug, forever. Starting with the next one.",
    endLineHint: "The last line, under their finished passport.",
    sheetTitle: "Issue their Hug Passport 🛂",
    sheetSub: "Five hugs to collect (bear, back, twirl, pat-pat, long-distance), a stamp for each, your letter, your voice, hug coupons and one last question on the chorus. Everything is pre-filled: make it yours.",
    extrasTitle: "The passport",
    extrasSub: "The two huggers, your line for each hug, the distance, the coupons and the last question",
    publishing: "Stamping your passport…",
    storyTitle: "Let's issue their Hug Passport 🛂",
    replyText: "Passport complete 🛂 Now come and stamp it in person 🤗",
    yesChip: "Forever hug 💗",
  },
  share: { title: "Your Hug Passport is ready 🛂🤗", accent: "#E0603F" },
});

export const hugDayPremium: DayConfig<HugExtrasPremium> = {
  ...base,
  music: { audioOnly: true, suggestions: HUG_SONGS, suggestionsNote: "hug songs · tap to use", demoStart: DEMO_START },
  extras: [
    {
      key: "openingLine", kind: "text", max: 40, label: "What the bear says",
      placeholder: "e.g. Come here, you.",
      hint: "In a speech bubble on the passport cover, before they tap “Come here”.",
      suggestions: ["Come here, you.", "Come here. Hug o'clock.", "Idhar aao, jhappi time 🤗"],
    },
    {
      key: "characters", kind: "enum", label: "The two huggers", display: "cards", default: "bear-bunny",
      hint: "The first one is you, the second one is them.",
      options: [
        { value: "bear-bunny", label: "Bear + Bunny", emoji: "🐻🐰" },
        { value: "bear-bear", label: "Two bears", emoji: "🐻🐻" },
        { value: "cat-cat", label: "Two cats", emoji: "🐱🐱" },
        { value: "panda-bear", label: "Panda + Bear", emoji: "🐼🐻" },
      ],
    },
    {
      key: "hugLines", kind: "list", maxItems: 4, minItems: 4, itemMax: 70, label: "Your line for each hug",
      hint: "In order: the bear hug, the back hug, the twirl hug, the pat-pat hug. Each one sits next to its stamp with one of your photos.",
      itemPlaceholder: DEFAULT_HUG_LINES,
      addLabel: "+ add a line",
    },
    {
      key: "distanceKm", kind: "number", min: 0, max: 20000, default: 860, step: 10, unit: "km", label: "How far apart you are",
      hint: "The long-distance hug: two phones start this far apart and count down as they drag them together. 0 = “even next door is too far”.",
    },
    {
      key: "meetLine", kind: "text", max: 50, label: "When the two phones meet",
      placeholder: "e.g. There you are. Finally.",
      suggestions: ["There you are. Finally.", "Zero kilometres. Now hold on.", "Close enough. Don't let go."],
    },
    {
      key: "coupons", kind: "objlist", maxItems: 6, minItems: 1, label: "Hug coupons", itemTitle: "Coupon", addLabel: "+ add a coupon",
      hint: "A little booklet they swipe through. Each one has a REDEEM button that stamps it and lets them tell you on WhatsApp.",
      item: [
        { key: "title", kind: "text", max: 30, label: "The coupon", placeholder: "One 10-minute bear hug" },
        { key: "detail", kind: "text", max: 80, label: "Fine print", placeholder: "Redeemable anytime, even in the middle of a fight." },
      ],
    },
    { key: "replyLine", kind: "text", max: 80, label: "Their message when they redeem one", placeholder: "what their WhatsApp says when they redeem a coupon", suggestions: ["Redeeming this one. Report for hugging duty 🤗"] },
    {
      key: "question", kind: "text", max: 60, label: "The last question",
      placeholder: "asked before the last stamp",
      hint: "Asked with a Yes (“Stamp it”) and a No that pleads and runs away. Their Yes stamps the passport on your song's chorus.",
      suggestions: ["Will you be my forever hug?", "Will you let me hug you forever?", "Forever wali jhappi, deal? 🤗"],
    },
    {
      key: "yesLine", kind: "text", max: 70, label: "After they say yes",
      placeholder: "what appears on the wall of hugs",
      suggestions: ["Then I'm never letting go first.", "Stamped. You're stuck with me now.", "Pakka? Pakka. 🤗"],
    },
    {
      key: "hugTitle", kind: "text", max: 24, label: "Their passport title",
      placeholder: "e.g. VIP Hugger",
      hint: "Printed on their passport and on the last stamp.",
      suggestions: ["VIP Hugger", "Chief Hugging Officer", "Certified Cuddle Expert"],
    },
  ],
  theme: {
    bg: "linear-gradient(160deg, #FFF8F1 0%, #FFEDE0 55%, #FFE4D2 100%)",
    base: "#FFF8F1",
    paper: "#FFFDF9",
    glass: "rgba(255,255,255,0.72)",
    ink: "#5E3226",
    inkSoft: "#8A5A48",
    paperInk: "#5E3226",
    accent: "#FF8A6B",
    accentDeep: "#E0603F",
    accentInk: "#FFFFFF",
    soft: "#FFD3B8",
    edge: "#FFD3B8",
    gold: "#F0A35E",
    dark: false,
    particles: ["🤗", "🧡", "💗", "✨"],
    confetti: ["#FF8A6B", "#9FE5C8", "#FFD3B8", "#FF7AA2", "#FFE27A"],
  },
  demo: {
    ...base.demo,
    recipientName: "Tanvi",
    senderName: "Aarav",
    petName: "Cutie",
    photos: DEMO_PHOTOS,
    gifs: DEMO_GIFS,
    letter:
      "Tanvi,\n\nI wish this link could actually hug you. It can't, so I made you a passport instead, and you just collected every kind of hug I owe you.\n\nThe bear hug is for your bad Mondays. The back hug is for when you're making chai and pretending not to notice me. The twirl is for every bit of good news, and the pat-pat is for the days you need someone to say it'll be okay.\n\nEight hundred and sixty kilometres is a silly number. I check it like a countdown. Every week it's the same, and every week I'm a week closer anyway.\n\nKeep this passport safe. I'm stamping it in person very soon.",
    endLine: "Valid for every hug, forever. Starting with the next one.",
    extras: {
      openingLine: "Come here, you.",
      characters: "bear-bunny",
      hugLines: DEFAULT_HUG_LINES,
      distanceKm: 860,
      meetLine: "There you are. Finally.",
      coupons: [
        { title: "One 10-minute bear hug", detail: "Redeemable anytime, even in the middle of a fight." },
        { title: "Unlimited back hugs", detail: "Especially while you're making chai. No expiry." },
        { title: "One airport hug", detail: "The long one. The first thing I do when I land." },
        { title: "Hug + forehead kiss combo", detail: "For the days that are too heavy. No questions asked." },
      ],
      replyLine: "Redeeming this one. Report for hugging duty 🤗",
      question: "Will you be my forever hug?",
      yesLine: "Then I'm never letting go first.",
      hugTitle: "VIP Hugger",
    },
  },
};
