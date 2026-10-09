// happy-promise-day-premium — "The Pinky Promise Club" (the ✦ Premium twin of happy-promise-day, research v3 §D5).
//
// Little promises, sealed forever, in bright peach sorbet with lilac and mint. She joins a club with exactly two
// members. The gate is a pinky held out to her (the tap starts the song); she drags her pinky up to hook his, pulls
// paper-star promises out of a jar (tap or shake), signs the club's "Terms & Cuddle-tions" with her finger (a cat
// stamps it APPROVED), strings letter beads into a friendship bracelet, unlocks his diary with a tiny key to read
// the letter, plays his voice on a cassette, flips the sticky notes on their photos, then picks the promises she
// gives back. On the song's chorus the love lock clicks shut, the key flies off as a shooting star and every promise
// floats up as a paper lantern. Keepsake: her Pinky Promise Club membership card, signed with her own signature.
//
// Extras keys + limits are mirrored in server/src/config/premiumDays/happy-promise-day-premium.ts and pinned in
// server/src/config/valentineDays.test.ts. Keys shared with the $2 day or v2 keep their key (envelopeLine,
// pinkyPrompt, promises, bigPromise, lockEngraving, sinceDate). The chorus second is the shared premium.songDropAt.

import type { SongSuggestion } from "../music/youtube";
import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { demoPhotos } from "./_shared";
import { promiseDay } from "./happy-promise-day";

export interface PromiseExtrasPremium {
  envelopeLine: string;
  pinkyPrompt: string;
  welcomeLine: string;
  promises: string[];
  bigPromise: string;
  clubRules: string[];
  beadWord: string;
  stickyPromises: string[];
  askBack: string[];
  lockEngraving: string;
  sinceDate: string;
  [k: string]: unknown;
}

const GIF_CDN = "https://cdn.subhsandesh.in/gifts-media/templates/_premium/gifs";

/** The default sticker for every slot: a real GIF from our CDN (premium-v3/gifs.json), never an emoji. */
export const CLUB_GIF_DEFAULTS: Record<string, string> = {
  "pk-pinky": `${GIF_CDN}/promise-day/pinky-promise-heart.webp`,
  "pk-jar": `${GIF_CDN}/promise-day/bears-cuddle-promise.webp`,
  "pk-stamp": `${GIF_CDN}/promise-day/penguin-i-swear.webp`,
  "pk-bracelet": `${GIF_CDN}/promise-day/pandas-happy-promise-day.webp`,
  "pk-lock": `${GIF_CDN}/propose-day/penguins-heart-lock.webp`,
  "pk-yes": `${GIF_CDN}/hug-day/bears-back-hug.webp`,
};

const GIFS: GifSlot[] = [
  { id: "pk-pinky", label: "Pinky promise", moment: "Cheers when your pinkies hook", file: "pk-pinky.webp", emoji: "🤙", anim: "wiggle" },
  { id: "pk-jar", label: "Promise jar", moment: "Sits by the jar while they pull out promises", file: "pk-jar.webp", emoji: "🫙", anim: "bounce" },
  { id: "pk-stamp", label: "Club rules", moment: "Swears along when they sign the rules", file: "pk-stamp.webp", emoji: "✍️", anim: "pulse" },
  { id: "pk-bracelet", label: "Bracelet", moment: "Watches them string the bracelet", file: "pk-bracelet.webp", emoji: "📿", anim: "float" },
  { id: "pk-lock", label: "Love lock", moment: "Waits beside the open love lock", file: "pk-lock.webp", emoji: "🔐", anim: "pulse" },
  { id: "pk-yes", label: "Locked forever", moment: "The middle of the lantern sky", file: "pk-yes.webp", emoji: "🥰", anim: "bounce" },
];

/** research §E (oEmbed 200 + playableInEmbed, 2026-10-09). The first one is the preview's song, from DEMO_START. */
export const CLUB_SONGS: readonly SongSuggestion[] = [
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "GxldQ9eX2wo", title: "Until I Found You", artist: "Stephen Sanchez" },
  { id: "Qdz5n1Xe5Qo", title: "Tera Ban Jaunga", artist: "Akhil Sachdeva, Tulsi Kumar · Kabir Singh" },
  { id: "vGJTaP6anOU", title: "Can't Help Falling in Love", artist: "Elvis Presley" },
  { id: "sK7riqg2mr4", title: "Agar Tum Saath Ho", artist: "Arijit Singh · Tamasha" },
  { id: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh · Aashiqui 2" },
];
/** "A Thousand Years": YouTube's most-replayed marker, −2 s (the sweet "I have died every day" lift). */
const DEMO_START = 44;

const base = premiumDay<PromiseExtrasPremium>(promiseDay, {
  slug: "happy-promise-day-premium",
  title: "The Pinky Promise Club",
  gifSlots: GIFS,
  demoSong: { id: CLUB_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    songDropAt: DEMO_START,
    voiceCaption: "I recorded this on the terrace so nobody would hear me. The pigeons heard everything.",
    psLetter:
      "Open only if you ever doubt one of these.\n\nI wrote promise number three twice, because the first time my hands were shaking. Not from nerves. From how sure I am.",
  },
  copy: {
    recipientPlaceholder: "who you're promising — e.g. Meera",
    letterPlaceholder: "Your letter, in your own words: why these promises, why them, why you're sure…",
    letterHint: "Locked inside a little diary; they unlock it with a tiny key and it writes itself out.",
    photosHint: "Each photo gets a sticky note with a promise on the back. The last one goes on the membership card. Up to 12.",
    captionHint: "a tiny caption, e.g. the night of the long call",
    endLinePlaceholder: "Pinky promised. No take-backs 🤙",
    endLineHint: "Printed at the bottom of their Pinky Promise Club membership card.",
    sheetTitle: "Start your Pinky Promise Club 🤙",
    sheetSub: "A pinky to hook, a jar of promises, the club rules, a bracelet, your letter and voice, then a love lock. Everything is pre-filled; make it sound like you.",
    extrasTitle: "The club",
    extrasSub: "The promise jar, the club rules, the bracelet, the love lock",
    publishing: "Folding the paper stars…",
    storyTitle: "Tell us your story; we'll write the promises 🤙",
    replyText: "Pinky promised right back 🤙 No take-backs.",
    yesChip: "Joined the club 🤙",
  },
  share: { title: "Pinky promise? You've been invited to a very small club 🤙", accent: "#E0603F" },
});

export const promiseDayPremium: DayConfig<PromiseExtrasPremium> = {
  ...base,
  melody: "paper",
  photoAspect: 4 / 5,
  music: { audioOnly: true, suggestions: CLUB_SONGS, suggestionsNote: "promise songs · tap to use", demoStart: DEMO_START },
  theme: {
    bg: "linear-gradient(160deg, #FFF8F1 0%, #FFE4D2 55%, #FFE3EC 100%)",
    base: "#FFF1E6",
    paper: "#FFFDF9",
    glass: "rgba(255,255,255,0.74)",
    ink: "#5E3226",
    inkSoft: "#8A5A4A",
    paperInk: "#5E3226",
    accent: "#FF8A6B",
    accentDeep: "#E0603F",
    accentInk: "#FFFFFF",
    soft: "#FFD3B8",
    edge: "rgba(224,96,63,0.18)",
    gold: "#A07BFF",
    dark: false,
    particles: ["🤙", "💗", "⭐", "✨"],
    confetti: ["#FF8A6B", "#A07BFF", "#9FE5C8", "#FFD27A", "#FFB3D6"],
  },
  extras: [
    {
      key: "envelopeLine", kind: "text", max: 60, label: "Your invite line",
      hint: "Under their name on the very first screen, the club's invitation.",
      placeholder: "e.g. Membership: two people. Very exclusive.",
      suggestions: ["Membership: two people. Very exclusive.", "One club. Two members. Zero take-backs.", "Ek vaada, sirf tumhare liye 🤙"],
    },
    {
      key: "pinkyPrompt", kind: "text", max: 50, label: "How you ask for the pinky",
      hint: "The heading above the two pinkies they hook together.",
      placeholder: "e.g. Pinky promise first. Rules are rules.",
      suggestions: ["Pinky promise first. Rules are rules.", "Hook my pinky. It's the law.", "Pehle pinky promise karo 🤙"],
    },
    {
      key: "welcomeLine", kind: "text", max: 80, label: "Your welcome, once the pinkies hook",
      placeholder: "e.g. Welcome to the club. It's just us, forever.",
      suggestions: ["Welcome to the club. It's just us, forever.", "You're in. Membership never expires.", "Welcome! The snacks are shared and the hugs are free."],
    },
    {
      key: "promises", kind: "list", maxItems: 7, minItems: 3, itemMax: 90, label: "The promise jar (paper stars)",
      hint: "One folded paper star each. Silly first, deep last. Small, real promises land best.",
      itemPlaceholder: ["I promise… (the snack you always share)", "I promise… (a habit you'll keep for them)", "I promise… (how you'll end every fight)", "I promise… (the 2 a.m. thing)", "I promise… (the big-picture one)", "I promise…", "I promise…"],
      addLabel: "+ add a star",
    },
    {
      key: "bigPromise", kind: "longtext", max: 140, rows: 2, label: "The big one (the golden star)",
      hint: "Pulled out last, glowing. It also floats highest in the lantern sky.",
      placeholder: "the one promise that matters most",
    },
    {
      key: "clubRules", kind: "list", maxItems: 3, itemMax: 60, label: "The club rules (Terms & Cuddle-tions)",
      hint: "Three silly-sweet rules they sign with their finger.",
      itemPlaceholder: ["Hugs are mandatory after every fight.", "Snacks are shared. Mostly.", "No promise ever expires."],
      addLabel: "+ add a rule",
    },
    {
      key: "beadWord", kind: "text", max: 6, label: "The word on the bracelet",
      hint: "Letters only, up to 6. They string the beads to spell it: their name, a nickname, or US.",
      placeholder: "e.g. US",
      suggestions: ["US", "FOREVR", "MINE"],
    },
    {
      key: "stickyPromises", kind: "list", maxItems: 6, itemMax: 70, label: "A promise for each photo",
      hint: "On the sticky note stuck to each photo, in order. They flip it to read.",
      itemPlaceholder: ["for the photo you hate: I'll keep it forever", "a promise about that memory", "one more", "one more", "one more", "one more"],
      addLabel: "+ add a note",
    },
    {
      key: "askBack", kind: "list", maxItems: 5, itemMax: 50, label: "Promises they can give back",
      hint: "At the love lock they pick one to three of these to promise you back. You'll see which.",
      itemPlaceholder: ["I promise to send good-morning texts", "I promise to laugh at your jokes", "I promise to share my fries", "I promise to never skip our calls", "I promise to stay"],
      addLabel: "+ add a choice",
    },
    { key: "lockEngraving", kind: "text", max: 20, label: "Engraved on the love lock", placeholder: "your initials + a date, e.g. A + M · 11.02" },
    { key: "sinceDate", kind: "text", input: "date", max: 10, label: "Club founded on", hint: "The day it started. Printed on the membership card." },
  ],
  demo: {
    ...base.demo,
    recipientName: "Meera",
    senderName: "Aarav",
    petName: "Meeru",
    gifs: { ...CLUB_GIF_DEFAULTS },
    letter:
      "Meeru,\n\nI'm not good with big speeches, so I made you a club instead. It has two members, one jar and absolutely no exit.\n\nThese aren't promises about forever in the abstract. They're about Tuesdays. The last bite, the 2 a.m. calls, the fights we'll have and the way we'll end them before we sleep.\n\nKeep this somewhere safe. Read it when I'm being annoying. Then read promise number three again.\n\nI'm sure of very few things. You are the first of them.",
    photos: demoPhotos([
      ["the night it started", "You laughed so hard you snorted. Game over for me."],
      ["every 2 a.m. call", "You fell asleep first. Again."],
      ["chai, always", "Still learning your order."],
      ["us, on a Tuesday", "My favourite kind of day."],
    ]),
    endLine: "Pinky promised. No take-backs 🤙",
    extras: {
      envelopeLine: "Membership: two people. Very exclusive.",
      pinkyPrompt: "Pinky promise first. Rules are rules.",
      welcomeLine: "Welcome to the club, Meeru. It's just us, forever.",
      promises: [
        "I promise to always save you the last bite. Mostly.",
        "I promise to pick up, even at 2 a.m.",
        "I promise to say sorry first after every fight.",
        "I promise Maggi at midnight, no questions asked.",
        "I promise to learn your chai order by heart.",
      ],
      bigPromise: "On your worst day, I'll still choose you. Every single time.",
      clubRules: ["Hugs are mandatory after every fight.", "Snacks are shared. Mostly.", "No promise ever expires."],
      beadWord: "MEERU",
      stickyPromises: [
        "I promise to keep making you snort-laugh.",
        "I promise to stay on the call till you fall asleep.",
        "I promise to get your chai right. Eventually.",
        "I promise you a lifetime of ordinary Tuesdays.",
      ],
      askBack: [
        "I promise to send good-morning texts",
        "I promise to laugh at your bad jokes",
        "I promise to share my fries",
        "I promise to never skip our calls",
        "I promise to stay. Always.",
      ],
      lockEngraving: "A + M · forever",
      sinceDate: "2022-03-14",
    },
  },
};
