// happy-propose-day-premium — "The Premiere" (the ✦ Premium twin of happy-propose-day).
//
// Your relationship, screened as a film for an audience of one. A ticket at the door (the tap starts the song),
// a projector leader counting down 3-2-1, "Based on a true story", the opening titles, then three acts cut from
// the sender's photos with subtitles: Act I how it started (pull the focus), Act II the moment I knew (hold for
// slow motion), Act III coming soon (swipe the trailer). The director's commentary (voice note), the last page of
// the script (the letter), and the question as the final title card. On Yes the letterbox bars sweep open, the
// song drops into its chorus, and the credits roll with both names. Post-credits: the sealed P.S.
//
// Extras keys + limits are mirrored in server/src/config/premiumDays/happy-propose-day-premium.ts and pinned in
// server/src/config/valentineDays.test.ts. Keys that mean the same thing as the $2 day keep its key (question,
// noLines, afterYes). The chorus second is the shared premium.songDropAt, not an extra.

import type { DayConfig, GifSlot } from "../types";
import type { SongSuggestion } from "../music/youtube";
import { premiumDay } from "./_premium";
import { demoPhotos } from "./_shared";
import { proposeDay } from "./happy-propose-day";

export interface ProposeExtrasPremium {
  filmTitle: string;
  tagline: string;
  actOne: string;
  actTwo: string;
  comingSoon: string[];
  question: string;
  noLines: string[];
  afterYes: string;
  credits: { role: string; name: string }[];
  location: string;
  [k: string]: unknown;
}

// A film doesn't want a sticker on every frame: two cameos, both where a film would allow a wink.
const GIFS: GifSlot[] = [
  { id: "pp4-please", label: "Please?", moment: "Beside the question, once “No” starts running", file: "pp4-please.gif", emoji: "🥺", anim: "pulse" },
  { id: "pp5-yes", label: "Post-credits", moment: "The post-credits scene, after the credits roll", file: "pp5-yes.gif", emoji: "🥳", anim: "bounce" },
];

/** research §E (premium-v2): official uploads, oEmbed 200 + playableInEmbed, 2026-10-09. First = the demo song. */
export const PREMIERE_SONGS: readonly SongSuggestion[] = [
  { id: "dElRVQFqj-k", title: "Marry You", artist: "Bruno Mars" },
  { id: "kPa7bsKwL-c", title: "Die With A Smile", artist: "Lady Gaga & Bruno Mars" },
  { id: "Cb6wuzOurPc", title: "Tum Se Hi", artist: "Mohit Chauhan · Jab We Met" },
  { id: "taRBVfDRukY", title: "Tum Kya Mile", artist: "Arijit Singh, Shreya Ghoshal · Rocky Aur Rani" },
  { id: "ghZt2cILcCU", title: "Marry Me", artist: "Train" },
];
/** "Marry You": the preview opens on the chorus run-in; the drop lands back on "Don't say no, no, no". */
const DEMO_START = 37;
const DEMO_DROP = 37;

const base = premiumDay<ProposeExtrasPremium>(proposeDay, {
  slug: "happy-propose-day-premium",
  title: "The Premiere",
  gifSlots: GIFS,
  demoSong: { id: PREMIERE_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    songDropAt: DEMO_DROP,
    voiceCaption: "I rewrote this scene forty times. Every draft ended with you.",
    psLetter:
      "Open only if you said yes.\n\nThe umbrella is still in my car. I never gave it back to the café, and I'm not going to. It's ours now, like everything else.",
  },
  copy: {
    recipientPlaceholder: "who the film is for — e.g. Tara",
    letterPlaceholder: "The last page of your script: what you'd say to them right before you ask. Where it started, what you're scared of, why it's them…",
    letterHint: "Typed on the last page of the script, in your voice, just before the question.",
    photosHint: "Your stills. The first opens Act I, the second is the moment you knew, the rest cut the trailer and the credits. The last one is the poster.",
    captionHint: "the scene, e.g. the café, day one",
    endLinePlaceholder: "Best yes of my life 💍",
    endLineHint: "The last line before the credits fade out.",
    sheetTitle: "Make the film 🎬",
    sheetSub: "Your story in three acts, a director's commentary and the question as the final title card. Everything is pre-filled; make it sound like you.",
    extrasTitle: "The film",
    extrasSub: "Title, three acts, the question and the credits",
    publishing: "Printing the reels…",
    storyTitle: "Tell us your story; we'll write the film 🎬",
    replyText: "YES. Five stars, would say yes again 💍",
    yesChip: "Said YES 💍",
  },
  share: { title: "Your premiere is ready. Sound on 🎬", accent: "#D8B25A" },
});

export const proposeDayPremium: DayConfig<ProposeExtrasPremium> = {
  ...base,
  music: { audioOnly: true, suggestions: PREMIERE_SONGS, suggestionsNote: "proposal soundtracks · tap to use", demoStart: DEMO_START },
  theme: {
    bg: "radial-gradient(120% 80% at 50% 0%, #1A1416 0%, #0B0B0D 60%)",
    base: "#0B0B0D",
    paper: "#F4EEE3",
    glass: "rgba(233,230,223,0.07)",
    ink: "#E9E6DF",
    inkSoft: "#B9B3A8",
    paperInk: "#1E1A17",
    accent: "#D8B25A",
    accentDeep: "#A8842F",
    accentInk: "#140F06",
    soft: "#2A2220",
    edge: "rgba(233,230,223,0.16)",
    gold: "#D8B25A",
    dark: true,
    particles: ["✨", "🎬", "💍", "⭐"],
    confetti: ["#D8B25A", "#E9E6DF", "#8E1B22", "#F3D58C", "#B9B3A8"],
  },
  extras: [
    {
      key: "filmTitle", kind: "text", max: 40, label: "Your film's title",
      hint: "On the ticket, the opening title card and the poster. Name it after your story.",
      placeholder: "e.g. The Umbrella Thief",
      suggestions: ["The Umbrella Thief", "Two Chais, One Table", "Plot Twist: You"],
    },
    { key: "tagline", kind: "text", max: 70, label: "The poster's tagline", placeholder: "e.g. One umbrella. Two people. No refunds." },
    {
      key: "actOne", kind: "text", max: 90, label: "Act I · How it started",
      hint: "The subtitle on your first photo. They pull it into focus.",
      placeholder: "the first time you met, in one line",
    },
    {
      key: "actTwo", kind: "text", max: 90, label: "Act II · The moment I knew",
      hint: "The subtitle on your second photo, revealed word by word while they hold.",
      placeholder: "the exact moment you knew it was them",
    },
    {
      key: "comingSoon", kind: "list", minItems: 1, maxItems: 3, itemMax: 48, label: "Act III · Coming soon (the trailer)",
      hint: "Your future, as trailer cards. Short and punchy reads best.",
      itemPlaceholder: ["this summer: one apartment", "two toothbrushes, one mirror", "a lifetime of terrible jokes"],
      addLabel: "+ add a trailer card",
    },
    {
      key: "question", kind: "text", max: 60, min: 6, label: "The question (the final title card)",
      placeholder: "the exact words you'd say on one knee",
      hint: "Set enormous on the last title card. Short questions look best.",
      suggestions: ["Will you marry me?", "Will you be mine, forever?", "Will you choose me again, every day?"],
    },
    {
      key: "noLines", kind: "list", maxItems: 4, itemMax: 28, label: "What “No” says as it dodges",
      hint: "After these, No gives up: “Director's cut: No was never in the script.”",
      itemPlaceholder: "Cut! Take two?", addLabel: "+ add a line",
    },
    { key: "afterYes", kind: "text", max: 120, label: "Your line when they say yes", placeholder: "the first thing you'd say — e.g. okay I'm crying 😭", hint: "Your subtitle on the big reveal, as the bars sweep open." },
    {
      key: "credits", kind: "objlist", maxItems: 5, label: "The end credits", itemTitle: "Credit", addLabel: "+ add a credit",
      hint: "Inside jokes, as film credits. The stars and the director are added for you.",
      item: [
        { key: "role", kind: "text", max: 32, label: "Role", placeholder: "Best supporting umbrella" },
        { key: "name", kind: "text", max: 40, label: "Credited to", placeholder: "the blue one from the café" },
      ],
    },
    { key: "location", kind: "text", max: 60, label: "Filmed on location in", placeholder: "e.g. Mumbai, Goa and one very small balcony" },
  ],
  demo: {
    ...base.demo,
    recipientName: "Tara",
    senderName: "Kabir",
    petName: "Taru",
    letter:
      "Tara,\n\nI've rehearsed this a hundred times: on the metro, in meetings, at 2 am with the fan on. Every version started differently. Every single one ended with you.\n\nYou turned my \"I'm fine\" into \"I'm actually happy\". You've sat through my worst moods and laughed at my worst jokes, usually before the punchline. You make an ordinary Tuesday feel like opening night.\n\nI can't promise you a perfect film. There will be bad takes and rainy days and at least one fight about the AC. But I know who I want in every scene.\n\nSo here's the last page. Turn it.",
    photos: demoPhotos([
      ["the café, day one", "You laughed at my worst joke. I decided right there."],
      ["one umbrella, two people", "You stole my umbrella. Then my heart. In that order."],
      ["our first Goa sunset", "You said the sky was showing off. It was showing off for you."],
      ["tonight", "And every night after this one, if you'll have me."],
    ]),
    endLine: "Best yes of my life. No return policy 💍",
    extras: {
      filmTitle: "The Umbrella Thief",
      tagline: "One umbrella. Two people. No refunds.",
      actOne: "You laughed at my worst joke. I decided right there.",
      actTwo: "You stole my umbrella in the rain, and I didn't want it back.",
      comingSoon: ["This summer: one apartment.", "Two toothbrushes. One mirror.", "A lifetime of terrible jokes."],
      question: "Will you marry me, Tara?",
      noLines: ["Cut! Take two?", "Wrong line, darling", "The crew is crying", "Arre, pakka?"],
      afterYes: "Okay I'm crying. No return policy now.",
      credits: [
        { role: "Best supporting umbrella", name: "The blue one from the café" },
        { role: "Catering", name: "Every 2 am Maggi" },
        { role: "Continuity", name: "Your laugh, every single take" },
      ],
      location: "Mumbai, Goa and one very small balcony",
    },
  },
};
