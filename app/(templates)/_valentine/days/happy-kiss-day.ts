import type { DayConfig, GifSlot } from "../types";
import { defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "happy-kiss-day" as const;

export interface KissExtras {
  kissStyle: "cute" | "lipstick";
  lipShade: "ruby" | "gulabi" | "berry";
  openingLine: string;
  kissTarget: number;
  kissNotes: string[];
  coupons: string[];
  kissBackText: string;
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "k1-shy", label: "Shy", moment: "Envelope — “1 unread kiss”", file: "k1-shy.gif", emoji: "🙈", anim: "wiggle" },
  { id: "k2-cheer", label: "Cheering", moment: "While the kiss jar fills", file: "k2-cheer.gif", emoji: "😘", anim: "bounce" },
  { id: "k3-mwah", label: "MWAH", moment: "The jar overflows", file: "k3-mwah.gif", emoji: "💋", anim: "pulse" },
  { id: "k4-cheek", label: "Kiss-Cam", moment: "Kiss-Cam photos", file: "k4-cheek.gif", emoji: "🥰", anim: "float" },
  { id: "k5-blow", label: "Your turn", moment: "Blow a kiss back", file: "k5-blow.gif", emoji: "😚", anim: "pulse" },
];

export const kissDay: DayConfig<KissExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Sealed With a Kiss",
  maxPhotos: 6,
  letterMax: 1500,
  letterMin: 50,
  asksQuestion: false,
  melody: "blush",
  gifSlots: GIFS,
  extras: [
    {
      key: "kissStyle", kind: "enum", label: "Kiss style", display: "cards", default: "cute",
      hint: "Cute is family-safe cartoon cheek & forehead kisses. Lipstick is still sweet, just a bit more glam.",
      options: [
        { value: "cute", label: "Cute", emoji: "😚", hint: "cheek & forehead kisses" },
        { value: "lipstick", label: "Lipstick", emoji: "💄", hint: "glam lipstick prints" },
      ],
    },
    {
      key: "lipShade", kind: "enum", label: "Lipstick shade", display: "swatches", default: "ruby",
      options: [
        { value: "ruby", label: "Ruby", swatch: "#D1123F" },
        { value: "gulabi", label: "Gulabi", swatch: "#F0568C" },
        { value: "berry", label: "Berry", swatch: "#8E1546" },
      ],
    },
    { key: "openingLine", kind: "text", max: 60, label: "Envelope teaser", placeholder: "the notification-style line on the envelope", suggestions: ["You have 1 unread kiss… open it 🙈", "Sealed with a kiss. Open gently."] },
    { key: "kissTarget", kind: "number", min: 5, max: 30, default: 14, step: 1, unit: "kisses", label: "Kisses to fill the jar", hint: "They tap to stamp kisses until the jar overflows." },
    { key: "kissNotes", kind: "list", maxItems: 5, itemMax: 60, label: "Notes that pop as the jar fills", itemPlaceholder: "Kiss #7 — for every 'reached home?' text", addLabel: "+ add a note" },
    { key: "coupons", kind: "list", maxItems: 4, itemMax: 50, label: "Kiss coupons", hint: "They scratch these off.", itemPlaceholder: "1 forehead kiss — valid forever", addLabel: "+ add a coupon" },
    { key: "kissBackText", kind: "text", max: 80, label: "Their WhatsApp reply", placeholder: "what their kiss-back message should say", hint: "Prefilled when they tap “blow a kiss back”." },
  ],
  theme: {
    bg: "linear-gradient(180deg, #FFE4EC 0%, #FFEFF3 55%, #FFF8F1 100%)",
    base: "#FFE4EC",
    paper: "#FFF8F1",
    glass: "rgba(255,255,255,0.62)",
    ink: "#3B0A1E",
    inkSoft: "#84506A",
    paperInk: "#3B0A1E",
    accent: "#E0245E",
    accentDeep: "#9D174D",
    accentInk: "#FFFFFF",
    soft: "#FFE0EA",
    edge: "#F6D2DE",
    gold: "#E8B04B",
    dark: false,
    particles: ["💋", "💗", "✨"],
    confetti: ["#E0245E", "#FF7AA2", "#FFE4EC", "#E8B04B", "#9D174D"],
  },
  demo: {
    recipientName: "Ananya",
    senderName: "Aarav",
    petName: "Meri Jaan",
    letter:
      "Happy Kiss Day, my love 💋\n\nIf kisses were raindrops, I'd send you a whole monsoon today. Some days I can't kiss you goodnight in person — so this page is my way of sending a hundred of them through the screen.\n\nThank you for every forehead kiss when I was stressed, every \"bas, ho gaya, chill\", and every time you made a bad day soft.\n\nThis one is sealed with a kiss — open it whenever you miss me.\n\nAll my love (and a lot of pappi),\nAarav",
    photos: demoPhotos([
      ["our first selfie 🥹", "You blinked. We kept it anyway. It's my favourite."],
      ["date night, round 1", "You stole my fries and then my heart. In that order."],
      ["cherry blossom era", "Even the trees were jealous of your smile that day."],
      ["us, forever", "Out of every timeline, I'd pick this one."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    music: true,
    endLine: "Sealed with a kiss. Opened with a smile 💋",
    extras: {
      kissStyle: "cute",
      lipShade: "ruby",
      openingLine: "You have 1 unread kiss… open it 🙈",
      kissTarget: 14,
      kissNotes: [
        "Kiss #1 — for the way you laugh at my bad jokes",
        "Kiss #7 — for every 'reached home?' text",
        "Kiss #14 — for being my favourite person, always",
      ],
      coupons: [
        "1 forehead kiss — valid forever",
        "Unlimited good-morning kisses",
        "1 kiss to end any fight 🏳️",
        "1 jhappi + 1 pappi combo",
      ],
      kissBackText: "Received your kisses 💋 Here's one back, pagal 😘",
    },
  },
  copy: {
    recipientPlaceholder: "who the kisses are for — e.g. Ananya",
    senderPlaceholder: "your name",
    petNamePlaceholder: "the name you say right before 'mwah'",
    letterPlaceholder: "Every kiss you owe them, and why — the goodnight ones you missed, the forehead one on a stressful day…",
    letterHint: "Inside an envelope with a lipstick seal; they drag the letter up to read. Keep it sweet — this page is family-safe.",
    photosHint: "Your photos play on the Kiss-Cam jumbotron.",
    captionHint: "caption — e.g. our first selfie",
    noteHint: "the kiss that goes with this one…",
    endLinePlaceholder: "Sealed with a kiss 💋",
    endLineHint: "On the final “blow a kiss back” screen.",
    sheetTitle: "Seal it with a kiss 💋",
    sheetSub: "Fill the kiss jar, write the letter, add coupons. Cute by default — safe on any phone.",
    extrasTitle: "The kisses",
    extrasSub: "Style, the jar, notes and coupons",
    publishing: "Sealing the envelope…",
    storyTitle: "Let's seal it with a kiss 💋",
    replyText: "Received your kisses 💋 Here's one back, pagal 😘",
  },
  // Kiss Day stays neutral wherever a preview could show on a shared phone.
  share: { title: "A little something for you 💌", accent: "#9D174D" },
};
