import type { DayConfig, GifSlot } from "../types";
import { MUSIC_DEMO, defaultGifs, demoPhotos, meta } from "./_shared";

const SLUG = "happy-promise-day" as const;

export interface PromiseExtras {
  envelopeLine: string;
  pinkyPrompt: string;
  promises: string[];
  bigPromise: string;
  lockEngraving: string;
  lockStyle: "gold" | "silver" | "rosegold";
  lockFinale: boolean;
  [k: string]: unknown;
}

const GIFS: GifSlot[] = [
  { id: "pr1-envelope", label: "Envelope", moment: "The envelope arrives", file: "pr1-envelope.gif", emoji: "💌", anim: "float" },
  { id: "pr2-pinky", label: "Pinky", moment: "Pinkies hooked", file: "pr2-pinky.gif", emoji: "🤙", anim: "wiggle" },
  { id: "pr3-jar", label: "Promise jar", moment: "The jar of chits", file: "pr3-jar.gif", emoji: "🍯", anim: "bounce" },
  { id: "pr4-stamp", label: "Stamped", moment: "The thumbprint seal", file: "pr4-stamp.gif", emoji: "🥳", anim: "pulse" },
  { id: "pr5-lock", label: "Love-lock", moment: "The love-lock finale", file: "pr5-lock.gif", emoji: "🔐", anim: "pulse" },
];

export const promiseDay: DayConfig<PromiseExtras> = {
  slug: SLUG,
  ...meta(SLUG),
  title: "Vaada Pakka",
  maxPhotos: 8,
  letterMax: 1500,
  letterMin: 50,
  asksQuestion: false,
  melody: "paper",
  photoAspect: 4 / 5,
  gifSlots: GIFS,
  extras: [
    { key: "envelopeLine", kind: "text", max: 60, label: "Envelope line", placeholder: "what's written on the envelope", suggestions: ["Ek vaada, sirf tumhare liye", "Open only if you trust me 🤞"] },
    { key: "pinkyPrompt", kind: "text", max: 50, label: "Pinky-swear prompt", placeholder: "how you'd ask for a pinky promise", suggestions: ["Pehle pinky promise karo 🤙", "Pinky swear first. Rules are rules."] },
    {
      key: "promises", kind: "list", maxItems: 7, minItems: 3, itemMax: 90, label: "Promises in the jar",
      hint: "3–7 chits. Small, real, keepable ones land best.",
      itemPlaceholder: ["I promise… (the snack you always save them)", "I promise… (a habit you'll keep for them)", "I promise… (how you'll end every fight)", "I promise… (the 2 a.m. thing)", "I promise… (the big-picture one)", "I promise…", "I promise…"],
      addLabel: "+ add a promise",
    },
    { key: "bigPromise", kind: "longtext", max: 140, rows: 2, label: "The big promise", placeholder: "the one promise that matters most — the last chit", hint: "Highlighted, pulled out last." },
    { key: "lockEngraving", kind: "text", max: 20, label: "Love-lock engraving", placeholder: "your initials + a date, e.g. A + M · 11.02.27" },
    {
      key: "lockStyle", kind: "enum", label: "Lock", display: "swatches", default: "gold",
      options: [
        { value: "gold", label: "Gold", swatch: "#D9A441" },
        { value: "silver", label: "Silver", swatch: "#C9CED6" },
        { value: "rosegold", label: "Rose gold", swatch: "#E8A598" },
      ],
    },
    { key: "lockFinale", kind: "bool", default: true, label: "Love-lock finale on the bridge", hint: "They lock it and flick the key into the river." },
  ],
  theme: {
    bg: "linear-gradient(180deg, #FFF4EE 0%, #FBE7EC 60%, #F7DCE4 100%)",
    base: "#FFF4EE",
    paper: "#FFFBF6",
    glass: "rgba(255,255,255,0.62)",
    ink: "#8E1F4A",
    inkSoft: "#A2647C",
    paperInk: "#5E1433",
    accent: "#E86A92",
    accentDeep: "#B8456C",
    accentInk: "#FFFFFF",
    soft: "#FCE3EB",
    edge: "#F0D4DC",
    gold: "#D9A441",
    dark: false,
    particles: ["🤞", "💗", "✨", "📜"],
    confetti: ["#E86A92", "#D9A441", "#F7B6C8", "#CDEBDD", "#8E1F4A"],
  },
  demo: {
    recipientName: "Meera",
    senderName: "Aarav",
    petName: "Meri Jaan",
    letter:
      "Dear Meera,\n\nI'm not good with big speeches, so here's a small contract instead. I promise to be your safe place, your loudest cheerleader and your 2 a.m. call.\n\nI promise to remember the little things — how you like your chai, and which song makes you cry. Hum ladenge bhi, but I promise we'll never go to sleep angry.\n\nThis isn't a promise for one day. It's for every day after this one.\n\nYours, pakka,\nAarav",
    photos: demoPhotos([
      ["the day I knew", "You laughed so hard you snorted. Game over for me."],
      ["pehli chai together", "Two cutting chais and a promise to do this every week. Kept it."],
      ["promise #1 kept ✓", "I said I'd show you the sunrise. I did. You slept through half."],
      ["us, pakka", "Signed, sealed, and forever."],
    ]),
    gifs: defaultGifs(GIFS.map((g) => g.id)),
    ...MUSIC_DEMO,
    endLine: "Signed, sealed, and forever yours.",
    extras: {
      envelopeLine: "Ek vaada, sirf tumhare liye",
      pinkyPrompt: "Pehle pinky promise karo 🤙",
      promises: [
        "I promise to always save you the last bite.",
        "I promise to listen, even when I'm sleepy.",
        "Har fight ke baad pehle sorry main bolunga.",
        "I promise Maggi at 2 a.m., no questions asked.",
        "I promise to grow with you, not away from you.",
      ],
      bigPromise: "I promise that on your worst day, I'll still choose you, every single time.",
      lockEngraving: "A + M · forever",
      lockStyle: "gold",
      lockFinale: true,
    },
  },
  copy: {
    recipientPlaceholder: "who you're promising — e.g. Meera",
    senderPlaceholder: "your name, for the signature",
    petNamePlaceholder: "the name you use when you mean it",
    letterPlaceholder: "Your contract, in your own words: what you promise on ordinary days, and on the hard ones…",
    letterHint: "Becomes the ₹∞ Pyaar Stamp Paper (Vachan Patra) they sign with a fingertip.",
    photosHint: "Your photos hang on a string of fairy lights.",
    captionHint: "caption — e.g. the day I knew",
    noteHint: "the promise hidden in that memory…",
    endLinePlaceholder: "Signed, sealed, and forever yours.",
    endLineHint: "Under the love-lock at the very end.",
    sheetTitle: "Write your vaada 🤞",
    sheetSub: "Promises for the jar, a letter to sign, a lock to close. Everything is pre-filled — make it yours.",
    extrasTitle: "The promises",
    extrasSub: "The jar, the big one, and the love-lock",
    publishing: "Stamping the paper…",
    storyTitle: "Let's write your promises 🤞",
    replyText: "Pinky promise accepted 🤞 Vaada pakka. Now you can't take it back.",
  },
  share: { title: "Pinky promise? 🤞", accent: "#B8456C" },
};
