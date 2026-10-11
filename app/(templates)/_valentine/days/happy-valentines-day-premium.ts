// happy-valentines-day-premium — "Be My Valentine Carnival" (the ✦ Premium twin of happy-valentines-day, flagship).
//
// A pastel funfair built for one girl: she tears her ADMIT ONE ticket (the song starts), pops heart balloons that
// spell his line, breaks a love-tester machine past 999%, turns a gacha machine for capsules holding their photos,
// rides a Ferris wheel of their memories, knocks over the seven cans of Valentine's week, opens a letter from the
// kissing-booth mailbox, plays his voice note on the carnival radio, then the question: on YES the song's chorus
// lands, heart fireworks burst over the fair and the Ferris wheel lights up with her photos. Ends on a ticket stub +
// photobooth strip she can save, the week recap, a sealed P.S. and the wishing wall (reply).
//
// Extras keys + limits are mirrored in server/src/config/premiumDays/happy-valentines-day-premium.ts and pinned
// in server/src/config/valentineDays.test.ts. Keys that mean the same thing as the $2 day keep its key
// (ticketLine, weekLines, togetherSince, question, noLines, datePlan) so an upgrade carries them over.
// The chorus second is NOT an extra: it is the shared premium.songDropAt ("The drop" in the form).

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { DEMO_PHOTO_CDN } from "../../_love/types";
import { premiumDay } from "./_premium";
import { valentinesDay, WEEK_LINE_DAYS } from "./happy-valentines-day";

export interface ValentinesExtrasPremium {
  ticketLine: string;
  balloonLine: string;
  meterLine: string;
  weekLines: string[];
  togetherSince: string;
  songNote: string;
  question: string;
  noLines: string[];
  datePlan: string;
  [k: string]: unknown;
}

/**
 * The GIF stickers live in the shared premium library on our CDN (templates/_premium/gifs/…). Sticker resolves
 * `file` under templates/<slug>/, so "../_premium/…" lands on the library file: the "Ours" default of every slot
 * is a real couple-sticker GIF, and the sender can still paste their own or hide it.
 */
const lib = (name: string) => `../_premium/gifs/${name}.webp`;
const GIFS: GifSlot[] = [
  { id: "vc1-ticket", label: "Welcome", moment: "Beside her ADMIT ONE ticket at the gate", file: lib("valentines-day/pug-be-my-valentine"), emoji: "🎟️", anim: "float" },
  { id: "vc2-balloons", label: "Balloons popped", moment: "When the last heart balloon pops", file: lib("valentines-day/cats-happy-valentines"), emoji: "🎈", anim: "bounce" },
  { id: "vc3-meter", label: "Love meter broke", moment: "When the love tester breaks past 999%", file: lib("valentines-day/panda-i-love-u-sign"), emoji: "😍", anim: "pulse" },
  { id: "vc4-letter", label: "Kissing booth", moment: "On the mailbox where the letter waits", file: lib("kiss-day/bears-surprise-kiss"), emoji: "💌", anim: "wiggle" },
  { id: "vc5-please", label: "Please?", moment: "Under the big question (gets sadder each No)", file: lib("common/noto-pleading-face"), emoji: "🥺", anim: "pulse" },
  { id: "vc6-yes", label: "She said yes", moment: "The second she taps Yes", file: lib("teddy-day/teddy-yes-heart-eyes"), emoji: "🥳", anim: "bounce" },
];

/**
 * research §E (premium-v2): every id passed YouTube oEmbed + playableInEmbed on 2026-10-09. The first one is the
 * preview's demo song: it starts at the pre-chorus (`demoStart`) and the demo's drop lands on "'Cause all of me".
 */
export const CARNIVAL_SONGS: readonly SongSuggestion[] = [
  { id: "450p7goxZqg", title: "All of Me", artist: "John Legend" },
  { id: "aXzVF3XeS8M", title: "Love Story (Taylor's Version)", artist: "Taylor Swift" },
  { id: "u2NAuswnTKs", title: "Apna Bana Le", artist: "Arijit Singh · Bhediya" },
  { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh · Brahmāstra" },
  { id: "NwFVSclD_uc", title: "I Love You So", artist: "The Walters" },
  { id: "GxldQ9eX2wo", title: "Until I Found You", artist: "Stephen Sanchez" },
];

const photo = (file: string, caption: string, note: string, cropX = 50, cropY = 50, scale = 100) => ({
  url: `${DEMO_PHOTO_CDN}/${file}`, caption, note, cropX, cropY, scale,
});

// Photo 1 = her ticket stub, the YES and the photobooth strip · 2–5 = the four gacha capsules · all ride the wheel.
const PHOTOS = [
  photo("couple1.webp", "the sunset we drove two hours for", "You said the sky looked like mango lassi.", 50, 55),
  photo("couple2.webp", "first date, the fairy-light café", "You stole my fries, then the whole evening."),
  photo("couple4.webp", "the night we counted stars", "You named one after me. It's the wrong one.", 50, 40),
  photo("couple3.webp", "cherry blossom season", "Even the trees were showing off for you."),
  photo("couple2.webp", "the close-up I never posted", "This one is just for me.", 46, 36, 170),
  photo("couple1.webp", "us, mid-laugh", "I don't remember the joke. I remember you.", 50, 70, 160),
];

const base = premiumDay<ValentinesExtrasPremium>(valentinesDay, {
  slug: "happy-valentines-day-premium",
  title: "Be My Valentine Carnival",
  gifSlots: GIFS,
  demoSong: { id: CARNIVAL_SONGS[0].id, start: 44 },
  demoPremium: {
    songDropAt: 53,
    voiceCaption: "I practised this eleven times. You still make me forget my lines.",
    psLetter:
      "Open only if you ever wonder whether I'd pick you again.\n\nI would. Every ride, every wrong turn, every cold chai. Out of everyone at the fair, it was always going to be you.",
  },
  copy: {
    letterPlaceholder: "Ananya,\n\nWhat you'd tell her if the whole fair went quiet for a minute…",
    letterHint: "Waiting in the kissing-booth mailbox. It types itself out when she opens it. Write it like a letter, not a caption.",
    photosHint: "Photo 1 is on her ticket stub and lights up when she says yes. Photos 2–5 hide in the gacha capsules. Every photo rides the Ferris wheel.",
    captionHint: "the moment, e.g. first date, the fairy-light café",
    noteHint: "what you remember most about it…",
    endLinePlaceholder: "Every ride is better with you. 💘",
    endLineHint: "Printed on her ticket stub at the very end.",
    sheetTitle: "Build her Valentine carnival ✦",
    sheetSub: "A pastel funfair made just for her: balloons with your words, a love meter she breaks, capsules and a Ferris wheel full of your photos, your letter, your voice and the big question on the chorus of your song. Everything is pre-filled. Make it yours.",
    extrasTitle: "Your carnival",
    extrasSub: "Her ticket, the balloon line, the week's seven cans, your song and the big question",
    publishing: "Opening the carnival…",
    storyTitle: "Let's build her Valentine carnival ✦",
    replyText: "Yes. Obviously. Every ride, every year. 💘",
  },
  share: { title: "A Valentine carnival, just for you 🎡", accent: "#FF4D6D" },
});

export const valentinesDayPremium: DayConfig<ValentinesExtrasPremium> = {
  ...base,
  letterMin: 80,
  music: {
    audioOnly: true,
    suggestions: CARNIVAL_SONGS,
    suggestionsNote: "the most-added love songs · tap to use",
    demoStart: 44,
  },
  // Cherry Soda + lavender + butter yellow (research §C1).
  theme: {
    bg: "linear-gradient(160deg, #FFF0F3 0%, #FFE3EC 55%, #EDE3FF 100%)",
    base: "#FFF0F3",
    paper: "#FFFFFF",
    glass: "rgba(255,255,255,0.78)",
    ink: "#590D22",
    inkSoft: "#8A3A55",
    paperInk: "#590D22",
    accent: "#FF4D6D",
    accentDeep: "#C9184A",
    accentInk: "#FFFFFF",
    soft: "#FFB3C6",
    edge: "rgba(201,24,74,0.16)",
    gold: "#FFD166",
    dark: false,
    particles: ["💖", "🎈", "✨", "🎡"],
    confetti: ["#FF4D6D", "#FFB3C6", "#FFD166", "#B9A7FF", "#FFFFFF"],
  },
  extras: [
    {
      key: "ticketLine", kind: "text", max: 50, label: "Her ticket's fine print",
      placeholder: "Admit one · all the rides · forever",
      hint: "Printed on her ADMIT ONE ticket at the gate and on the stub she keeps.",
      suggestions: ["Admit one · all the rides · forever", "Valid for one girl · every ride · no expiry", "Front row · next to me · always"],
    },
    {
      key: "balloonLine", kind: "text", max: 48, label: "The balloon line",
      placeholder: "You make every day feel like Valentine's",
      hint: "One word per heart balloon (up to 8 words). She pops them all to read it.",
      suggestions: ["You make every day feel like Valentine's", "Out of everyone, it's always you", "Tum ho toh sab theek lagta hai"],
    },
    {
      key: "meterLine", kind: "text", max: 36, label: "What the broken love meter says",
      placeholder: "ERROR: too much love",
      hint: "She holds her thumb on the love tester; it shoots past 999% and breaks with this on its screen.",
      suggestions: ["ERROR: too much love", "Machine can't handle us", "Off the charts. Literally."],
    },
    {
      key: "weekLines", kind: "list", maxItems: 7, itemMax: 70, label: "A line for each day of the week",
      hint: "Seven cans at the prize stall, Rose Day to Kiss Day. Each one she knocks over shows your line for that day.",
      itemLabels: WEEK_LINE_DAYS,
      itemPlaceholder: ["the rose was just an excuse…", "what you'd ask again", "the sweet thing you don't share", "something to hug when you can't", "the promise that matters", "what their hug fixes", "sealed every day with…"],
    },
    {
      key: "togetherSince", kind: "text", max: 10, input: "date", label: "Together since",
      hint: "Stamped on her ticket stub with your days together. Leave empty to hide it.",
    },
    {
      key: "songNote", kind: "text", max: 60, label: "A line about your song",
      placeholder: "e.g. On repeat since the Lonavala drive.",
      hint: "On the carnival radio, next to your voice note. Pick the song itself in Music.",
    },
    {
      key: "question", kind: "text", max: 60, label: "The big question",
      placeholder: "Will you be my Valentine?",
      hint: "Asked at the end of the fair. Her YES lands on the chorus of your song.",
      suggestions: ["Will you be my Valentine?", "Be my Valentine, this year and every year?", "Will you marry me? 💍"],
    },
    {
      key: "noLines", kind: "list", maxItems: 4, itemMax: 40, label: "What “No” says as it hides",
      hint: "No hides behind a sticker each time, shrinks, and after the last line turns into a second Yes.",
      itemPlaceholder: ["Are you sure? 🥺", "Now you made it cry", "Last chance to change your mind", "Fine. This is a Yes now."],
      addLabel: "+ add a line",
    },
    {
      key: "datePlan", kind: "text", max: 80, label: "Our next ride (optional)",
      placeholder: "Saturday · 8 PM · the chai stall, then the long way home",
      hint: "Printed on her ticket stub as the next plan.",
    },
  ],
  demo: {
    ...base.demo,
    letter:
      "Ananya,\n\nI built you a whole fair because one rose felt too small for what I wanted to say.\n\nYou hum when you cook, you say “five more minutes” and mean forty, and you still laugh at your own jokes before the punchline. Somewhere between the cold chai and the calls that ran past midnight, you became my favourite part of every single day.\n\nI don't need the biggest ride or the brightest lights. I just need the seat next to yours.\n\nSo walk with me to the last stall. There's something I want to ask you.",
    photos: PHOTOS,
    endLine: "Every ride is better with you. 💘",
    extras: {
      ticketLine: "Admit one · all the rides · forever",
      balloonLine: "You make every day feel like Valentine's",
      meterLine: "ERROR: too much love",
      weekLines: [
        "The rose was just an excuse to see you smile.",
        "I'd ask you again, every single day.",
        "Still the only sweet thing I don't share.",
        "Something to hug when I can't.",
        "I'll always pick up on the first ring.",
        "Your hugs fix everything. Even Mondays.",
        "Sealed every day with one more.",
      ],
      togetherSince: "2023-02-14",
      songNote: "On repeat since the Lonavala drive.",
      question: "Will you be my Valentine?",
      noLines: ["Are you sure? 🥺", "Now you made it cry", "Last chance to change your mind", "Fine. This is a Yes now."],
      datePlan: "Saturday · 8 PM · our chai stall, then the long way home",
    },
  },
};
