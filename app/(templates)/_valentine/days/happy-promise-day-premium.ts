// happy-promise-day-premium — "Signed, Sealed, Promised" (the ✦ Premium twin of happy-promise-day).
//
// A promise drawn up like a deed, on warm ivory paper under a desk lamp. A
// heavy envelope "to be opened by {name} only" starts their song; they unfold
// the deed (two "Whereas…" lines: your story in legal-romantic prose), then
// press the typewriter's key and each promise types itself in, clack by
// clack, with one of your photos clipped beside it. Your letter is the
// schedule they initial; your voice is the sworn statement. Then both sign:
// yours is already in ink, theirs is drawn with a finger. The deed folds into
// its envelope and, on the song's drop, the wax blooms and your initials are
// pressed into it. Witnessed by a line of your choosing.
//
// Keys + limits mirror server/src/config/premiumDays/happy-promise-day-premium.ts
// (pinned in valentineDays.test.ts). AI fill: server/src/config/aiFill/happy-promise-day-premium.ts.
// envelopeLine, promises and bigPromise keep the $2 keys (upgrade path).

import type { SongSuggestion } from "../music/youtube";
import type { DayConfig, GifSlot } from "../types";
import { premiumDay } from "./_premium";
import { demoPhotos } from "./_shared";
import { promiseDay } from "./happy-promise-day";

export type WaxColour = "oxblood" | "midnight" | "forest" | "blush";

export interface PromiseExtrasPremium {
  envelopeLine: string;
  whereas: string[];
  promises: string[];
  bigPromise: string;
  sinceDate: string;
  witnessLine: string;
  monogram: string;
  waxColour: WaxColour;
  replyLine: string;
  [k: string]: unknown;
}

/** research.md §E (oEmbed 200 + playableInEmbed, 2026-10-09). The first one is the preview's song, from DEMO_START. */
export const DEED_SONGS: readonly SongSuggestion[] = [
  { id: "rtOvBOTyX00", title: "A Thousand Years", artist: "Christina Perri" },
  { id: "vGJTaP6anOU", title: "Can't Help Falling in Love", artist: "Elvis Presley" },
  { id: "Qdz5n1Xe5Qo", title: "Tera Ban Jaunga", artist: "Akhil Sachdeva, Tulsi Kumar · Kabir Singh" },
  { id: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh · Aashiqui 2" },
  { id: "GxldQ9eX2wo", title: "Until I Found You", artist: "Stephen Sanchez" },
  { id: "sK7riqg2mr4", title: "Agar Tum Saath Ho", artist: "Arijit Singh · Tamasha" },
];
/** "A Thousand Years": YouTube's most-replayed marker, −2 s. */
const DEMO_START = 44;

// Two quiet spots only; the deed keeps its space for their photos and words.
const GIFS: GifSlot[] = [
  { id: "ps1-desk", label: "On the desk", moment: "Beside the typewriter while the promises type", file: "ps1-desk.gif", emoji: "✍️", anim: "wiggle" },
  { id: "ps2-sealed", label: "Sealed", moment: "Next to the envelope once the wax is pressed", file: "ps2-sealed.gif", emoji: "💌", anim: "pulse" },
];

const base = premiumDay<PromiseExtrasPremium>(promiseDay, {
  slug: "happy-promise-day-premium",
  title: "Signed, Sealed, Promised",
  gifSlots: GIFS,
  demoSong: { id: DEED_SONGS[0].id, start: DEMO_START },
  demoPremium: {
    voiceCaption: "I read every clause out loud before I typed it. The typewriter didn't laugh. Much.",
    psLetter:
      "Open only if you ever doubt one of these.\n\nI typed clause three twice, because the first time my hands were shaking. Not from the typewriter. From how sure I am.",
    songDropAt: DEMO_START,
  },
  copy: {
    recipientPlaceholder: "who the deed is for — e.g. Meera",
    letterPlaceholder: "The schedule to the deed, in your own words: why these promises, why them, why you're sure…",
    letterHint: "Set on ivory paper as “Schedule A”; they initial it at the bottom. Short paragraphs read best.",
    photosHint: "The first photo is clipped to the deed as Exhibit A. The next ones sit beside each promise as it types; any extras become exhibits they flick through.",
    captionHint: "written on the clip — e.g. the night you said yes to chai",
    endLinePlaceholder: "Signed, sealed, and promised. Yours.",
    endLineHint: "The last line, under the sealed envelope they keep.",
    sheetTitle: "Draw up your promise ✍️",
    sheetSub: "Two “Whereas…” lines, the promises the typewriter types, the one above all, and the wax for your seal. Everything is pre-filled — make it yours.",
    extrasTitle: "The deed",
    extrasSub: "Whereas…, the promises, the wax seal, the witness",
    publishing: "Sealing the envelope…",
    storyTitle: "Let's draw up your promise ✍️",
    replyText: "Signed. Sealed. Promised right back 🤞",
    yesChip: "Signed it ✍️",
  },
  share: { title: "A sealed promise, to be opened by you only ✍️", accent: "#6E1423" },
});

export const promiseDayPremium: DayConfig<PromiseExtrasPremium> = {
  ...base,
  melody: "velvet",
  photoAspect: 4 / 5,
  theme: {
    bg: "radial-gradient(120% 80% at 50% 0%, #3a2418 0%, #1a100b 55%, #0d0806 100%)",
    base: "#140c08",
    paper: "#F5EFE2",
    glass: "rgba(20,12,8,0.62)",
    ink: "#F5EFE2",
    inkSoft: "#CDBFA8",
    paperInk: "#1C2541",
    accent: "#B8964B",
    accentDeep: "#6E1423",
    accentInk: "#1a1008",
    soft: "#3a2418",
    edge: "rgba(245,239,226,0.16)",
    gold: "#B8964B",
    dark: true,
    particles: ["✍️", "✦", "🤞"],
    confetti: ["#6E1423", "#B8964B", "#F5EFE2", "#1C2541"],
  },
  music: { audioOnly: true, suggestions: DEED_SONGS, suggestionsNote: "promise songs · tap to use", demoStart: DEMO_START },
  extras: [
    {
      key: "envelopeLine", kind: "text", max: 60, label: "On the envelope",
      placeholder: "typed under their name on the sealed envelope",
      suggestions: ["To be opened by you, and only you.", "Read slowly. I meant every word.", "Contents: one promise. Handle with care."],
    },
    {
      key: "whereas", kind: "list", maxItems: 2, minItems: 2, itemMax: 90, label: "Whereas… (your story, two lines)",
      hint: "The deed opens with these. Line one: how it started. Line two: what you've known since.",
      itemPlaceholder: ["Whereas you laughed at my worst joke in March 2022,", "and whereas I have been hopelessly sure ever since,"],
    },
    {
      key: "promises", kind: "list", maxItems: 7, minItems: 3, itemMax: 90, label: "The promises (one per clause)",
      hint: "The typewriter types one per press, each beside one of your photos. Small, real, keepable promises land best.",
      itemPlaceholder: ["I'll always pick up, even at 2 a.m.", "a habit you'll keep for them", "how you'll end every fight", "the small daily thing", "the big-picture one", "one more", "the last one"],
      addLabel: "+ add a clause",
    },
    {
      key: "bigPromise", kind: "longtext", max: 140, rows: 2, label: "Above all (the clause they sign under)",
      hint: "The last clause, set right above both signatures.",
      placeholder: "the one promise that matters most",
    },
    { key: "sinceDate", kind: "text", input: "date", max: 10, label: "In force since", hint: "The day it started. The deed counts the days." },
    {
      key: "witnessLine", kind: "text", max: 90, label: "Witnessed by",
      placeholder: "a witness only you two would understand",
      suggestions: ["every song we've ever sung badly in the car.", "the chaiwala who saw it all.", "two very tired cats."],
    },
    { key: "monogram", kind: "text", max: 5, label: "Initials on the wax", placeholder: "e.g. A&M (blank = your initials)" },
    {
      key: "waxColour", kind: "enum", label: "Wax", display: "swatches", default: "oxblood",
      options: [
        { value: "oxblood", label: "Oxblood", swatch: "#6E1423" },
        { value: "midnight", label: "Midnight", swatch: "#1C2541" },
        { value: "forest", label: "Forest", swatch: "#1F4D3A" },
        { value: "blush", label: "Blush", swatch: "#B5566A" },
      ],
    },
    {
      key: "replyLine", kind: "text", max: 80, label: "Their WhatsApp reply",
      placeholder: "what they send back once they've signed",
      suggestions: ["Signed. Sealed. Promised right back 🤞"],
    },
  ],
  demo: {
    ...base.demo,
    letter:
      "I've never been good at saying the big things out loud, so I did what any reasonable person would do: I found a typewriter.\n\nThese aren't promises about forever in the abstract. They're about Tuesdays. About the last bite, the 2 a.m. calls, the fights we'll have and the way we'll end them before we sleep.\n\nI'm writing them down because I want you to be able to hold me to every single one. Keep this somewhere safe. Read it when I'm being annoying. Then read clause three again.\n\nI'm sure of very few things. You are the first of them.",
    photos: demoPhotos([
      ["the night it started", "Exhibit A, your honour."],
      ["every 2 a.m. call", "You fell asleep first. Again."],
      ["chai, always", "Still learning your order."],
      ["us, on a Tuesday", "My favourite kind of day."],
    ]),
    endLine: "Signed, sealed, and promised. Yours.",
    extras: {
      envelopeLine: "To be opened by you, and only you.",
      whereas: ["Whereas you laughed at my worst joke in March 2022,", "and whereas I have been hopelessly sure ever since,"],
      promises: [
        "I'll always pick up, even at 2 a.m.",
        "I'll learn your chai order by heart.",
        "I'll never let a fight outlast the night.",
        "I'll cheer loudest at every win.",
        "I'll save you the last bite. Mostly.",
      ],
      bigPromise: "Wherever life takes us, I'll keep choosing you.",
      sinceDate: "2022-03-14",
      witnessLine: "every song we've ever sung badly in the car.",
      monogram: "",
      waxColour: "oxblood",
      replyLine: "Signed. Sealed. Promised right back 🤞",
    },
  },
};
