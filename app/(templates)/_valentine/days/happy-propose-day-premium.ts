// happy-propose-day-premium — "The Little Proposal" (the ✦ Premium twin of happy-propose-day, research v3 §D2).
//
// A tiny, cute love story with a ring at the end, in bright lavender and cherry pink. She knocks on a little door
// (the knock starts the song) and a shy panda opens it with a rose. She swipes through how it started (polaroid
// story cards), taps through a comic of him rehearsing the proposal (and falling over), plays a shell game to find
// the ring, opens a heart-sealed letter, hears his voice note, then the question: the ring box sits under the
// question and "No" runs away. On YES the song lands on its chorus, the box pops open, the ring flies onto a
// heart-shaped photo of them and a wall of celebrating GIF stickers pops in. Keepsake: an "Officially Taken"
// certificate she signs with a tap of her ring finger.
//
// Extras keys + limits are mirrored in server/src/config/premiumDays/happy-propose-day-premium.ts and pinned in
// server/src/config/valentineDays.test.ts. Keys that mean the same thing as the $2 day keep its key (teaser,
// moments, stoneColor, question, noLines, afterYes). The chorus second is the shared premium.songDropAt.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { premiumDay } from "./_premium";
import { demoPhotos } from "./_shared";
import { proposeDay } from "./happy-propose-day";

export interface ProposeExtrasPremium {
  teaser: string;
  moments: { when: string; what: string }[];
  rehearsal: string[];
  decoys: string[];
  stoneColor: string;
  question: string;
  noLines: string[];
  afterYes: string;
  terms: string[];
  [k: string]: unknown;
}

const GIF_CDN = "https://cdn.subhsandesh.in/gifts-media/templates/_premium/gifs";

/** The default sticker for every slot: a real GIF from our CDN (premium-v3/gifs.json), never an emoji. */
export const PROPOSAL_GIF_DEFAULTS: Record<string, string> = {
  "pp-door": `${GIF_CDN}/rose-day/panda-holding-rose.webp`,
  "pp-story": `${GIF_CDN}/teddy-day/bears-nuzzle.webp`,
  "pp-peek": `${GIF_CDN}/chocolate-day/cat-chocolate-mold.webp`,
  "pp-ask": `${GIF_CDN}/propose-day/penguins-ring-box.webp`,
  "pp-please": `${GIF_CDN}/common/noto-pleading-face.webp`,
  "pp-yes": `${GIF_CDN}/teddy-day/teddy-yes-heart-eyes.webp`,
};

const GIFS: GifSlot[] = [
  { id: "pp-door", label: "At the door", moment: "Peeks out when the little door opens", file: "pp-door.webp", emoji: "🐼", anim: "bounce" },
  { id: "pp-story", label: "Story cards", moment: "Watches while they swipe how it started", file: "pp-story.webp", emoji: "🥰", anim: "float" },
  { id: "pp-peek", label: "Find the ring", moment: "Peeks while they pick a gift box", file: "pp-peek.webp", emoji: "🐱", anim: "wiggle" },
  { id: "pp-ask", label: "The question", moment: "Sits beside the ring box under the question", file: "pp-ask.webp", emoji: "💍", anim: "pulse" },
  { id: "pp-please", label: "When No runs", moment: "Begs each time “No” runs away", file: "pp-please.webp", emoji: "🥺", anim: "wiggle" },
  { id: "pp-yes", label: "They said yes", moment: "The middle of the yes sticker wall", file: "pp-yes.webp", emoji: "🥳", anim: "bounce" },
];

/** research §E (premium-v2): official uploads, oEmbed 200 + playableInEmbed, 2026-10-09. First = the demo song. */
export const PROPOSAL_SONGS: readonly SongSuggestion[] = [
  { id: "dElRVQFqj-k", title: "Marry You", artist: "Bruno Mars" },
  { id: "kPa7bsKwL-c", title: "Die With A Smile", artist: "Lady Gaga & Bruno Mars" },
  { id: "Cb6wuzOurPc", title: "Tum Se Hi", artist: "Mohit Chauhan · Jab We Met" },
  { id: "taRBVfDRukY", title: "Tum Kya Mile", artist: "Arijit Singh, Shreya Ghoshal · Rocky Aur Rani" },
  { id: "ghZt2cILcCU", title: "Marry Me", artist: "Train" },
];
/** "Marry You": the preview opens on the bouncy run-in; the yes lands back on "Don't say no, no, no". */
const DEMO_START = 37;
const DEMO_DROP = 37;

const base = premiumDay<ProposeExtrasPremium>(proposeDay, {
  slug: "happy-propose-day-premium",
  title: "The Little Proposal",
  gifSlots: GIFS,
  demoSong: { id: PROPOSAL_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    songDropAt: DEMO_DROP,
    voiceCaption: "I recorded this eleven times. This is the one where my voice only shook a little.",
    psLetter:
      "Open only if you said yes.\n\nThe umbrella is still in my car. I never gave it back to the café, and I'm not going to. It's ours now, like everything else.",
  },
  copy: {
    recipientPlaceholder: "who you're asking — e.g. Tara",
    letterPlaceholder: "Why them. Where it started, what you love, what you're nervous about, what you want next…",
    letterHint: "It arrives in a heart-sealed envelope just before the question, and types itself out.",
    photosHint: "The first three are your story cards; the last one goes in the heart frame where the ring lands. Up to 12.",
    captionHint: "a tiny caption, e.g. the café, day one",
    endLinePlaceholder: "Best yes of my life 💍",
    endLineHint: "Printed at the bottom of the “Officially Taken” certificate.",
    sheetTitle: "Make your little proposal 💍",
    sheetSub: "A door to knock on, your story, a ring to find, your letter and voice, then the question. Everything is pre-filled; make it sound like you.",
    extrasTitle: "The proposal",
    extrasSub: "Your nervous hello, the story cards, the rehearsal, the question",
    publishing: "Polishing the ring…",
    storyTitle: "Tell us your story; we'll write the proposal 💍",
    replyText: "YES. A hundred times yes 💍",
    yesChip: "Said YES 💍",
  },
  share: { title: "Knock knock. Someone has a question for you 💍", accent: "#7A52E0" },
});

export const proposeDayPremium: DayConfig<ProposeExtrasPremium> = {
  ...base,
  music: { audioOnly: true, suggestions: PROPOSAL_SONGS, suggestionsNote: "proposal songs · tap to use", demoStart: DEMO_START },
  theme: {
    bg: "linear-gradient(160deg, #F8F4FF 0%, #EDE3FF 52%, #FFE3EC 100%)",
    base: "#F3ECFF",
    paper: "#FFFFFF",
    glass: "rgba(255,255,255,0.72)",
    ink: "#3B2A63",
    inkSoft: "#6E5C96",
    paperInk: "#3B2A63",
    accent: "#7A52E0",
    accentDeep: "#5B36C4",
    accentInk: "#FFFFFF",
    soft: "#DCCBFF",
    edge: "rgba(122,82,224,0.18)",
    gold: "#FF4D6D",
    dark: false,
    particles: ["💜", "💗", "💍", "✨"],
    confetti: ["#A07BFF", "#FF4D6D", "#FFB3D6", "#FFD166", "#DCCBFF"],
  },
  extras: [
    {
      key: "teaser", kind: "text", max: 70, label: "Your nervous hello at the door",
      hint: "What you say when the little door opens. Short and a bit shy.",
      placeholder: "e.g. Okay okay, I'm nervous. Don't laugh 🙈",
      suggestions: ["Okay okay, I'm nervous. Don't laugh 🙈", "Hi. I practised this. It's not going well.", "Arre, you're here already? Come in, come in 🙈"],
    },
    {
      key: "moments", kind: "objlist", maxItems: 4, label: "How it started (story cards)", itemTitle: "Card", addLabel: "+ add a card",
      hint: "One swipeable polaroid each, paired with your photos in order: first chat, first date, the day you knew.",
      item: [
        { key: "when", kind: "text", max: 20, label: "Little label", placeholder: "first chat" },
        { key: "what", kind: "text", max: 70, label: "One line", placeholder: "you replied “haha” and I read it 40 times" },
      ],
    },
    {
      key: "rehearsal", kind: "list", maxItems: 4, itemMax: 60, label: "The rehearsal (a 4-panel comic)",
      hint: "Your proposal practice going wrong, one panel at a time. Funny beats romantic here.",
      itemPlaceholder: ["practised on my pillow. it said no.", "knelt down, my knee cracked", "dropped the ring under the sofa", "okay. I think I'm ready."],
      addLabel: "+ add a panel",
    },
    {
      key: "decoys", kind: "list", maxItems: 2, itemMax: 48, label: "The two boxes without the ring",
      hint: "They open three gift boxes; the first two hold a chocolate and a teddy. Your note on each.",
      itemPlaceholder: ["a chocolate, because you deserve one anyway", "a teddy to hold until I get there"],
      addLabel: "+ add a note",
    },
    {
      key: "stoneColor", kind: "enum", label: "The ring's stone", display: "swatches", default: "diamond",
      options: [
        { value: "diamond", label: "Diamond", swatch: "#E8F4FF" },
        { value: "ruby", label: "Ruby", swatch: "#C8102E" },
        { value: "rosegold", label: "Rose gold", swatch: "#E8A598" },
      ],
    },
    {
      key: "question", kind: "text", max: 60, min: 6, label: "The question",
      placeholder: "the exact words you'd say on one knee",
      hint: "Printed big above the ring box. Short questions look best.",
      suggestions: ["Will you be mine?", "Will you marry me?", "Will you be mine, forever?", "Will you choose me again, every day?"],
    },
    {
      key: "noLines", kind: "list", maxItems: 5, itemMax: 28, label: "What “No” says as it runs away",
      hint: "After these, No gives up and turns into “ok fine, YES 💍”.",
      itemPlaceholder: "Let me think 🤔", addLabel: "+ add a line",
    },
    { key: "afterYes", kind: "text", max: 120, label: "Your line when they say yes", placeholder: "the first thing you'd say — e.g. okay I'm crying 😭", hint: "Types out under the sticker wall, right after the ring lands." },
    {
      key: "terms", kind: "list", maxItems: 3, itemMax: 48, label: "The certificate's terms",
      hint: "The fine print on the “Officially Taken 💍” certificate they sign. Sweet or silly.",
      itemPlaceholder: ["unlimited forehead kisses", "the window seat is always yours", "I'll learn to like your playlist"],
      addLabel: "+ add a term",
    },
  ],
  demo: {
    ...base.demo,
    recipientName: "Tara",
    senderName: "Kabir",
    petName: "Taru",
    gifs: { ...PROPOSAL_GIF_DEFAULTS },
    letter:
      "Tara,\n\nI've rehearsed this a hundred times: on the metro, in meetings, at 2 am with the fan on. Every version started differently. Every single one ended with you.\n\nYou turned my \"I'm fine\" into \"I'm actually happy\". You laugh at my worst jokes, usually before the punchline. You make an ordinary Tuesday feel like a holiday.\n\nI can't promise you perfect. There will be rainy days and at least one fight about the AC. But I know who I want next to me for all of it.\n\nSo, one more page. Then I'll ask.",
    photos: demoPhotos([
      ["the café, day one", "You laughed at my worst joke. I decided right there."],
      ["one umbrella, two people", "You stole my umbrella. Then my heart. In that order."],
      ["our first Goa sunset", "You said the sky was showing off. It was showing off for you."],
      ["us, forever", "And every day after this one, if you'll have me."],
    ]),
    endLine: "Best yes of my life. No returns 💍",
    extras: {
      teaser: "Okay okay, I'm nervous. Don't laugh 🙈",
      moments: [
        { when: "first chat", what: "You replied “haha” and I read it forty times." },
        { when: "first date", what: "You stole my umbrella. I let you keep it." },
        { when: "the day I knew", what: "Goa, sunset, you singing off-key. That was it." },
      ],
      rehearsal: [
        "Practised on my pillow. It said no.",
        "Knelt down. My knee made a noise.",
        "Dropped the ring under the sofa. Twice.",
        "Okay. I think I'm ready. (I'm not.)",
      ],
      decoys: ["A chocolate, because you deserve one anyway.", "A teddy to hold until I get there."],
      stoneColor: "diamond",
      question: "Will you be mine, Tara?",
      noLines: ["Let me think 🤔", "Are you sure?", "Pleeease 🥺", "I'll buy momos", "ok fine YES?"],
      afterYes: "Okay I'm actually crying. No returns now 😭💍",
      terms: ["Unlimited forehead kisses.", "The window seat is always yours.", "I'll learn to like your playlist."],
    },
  },
};
