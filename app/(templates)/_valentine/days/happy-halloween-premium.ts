// happy-halloween-premium — "Boo-tiful Night" (the ✦ Premium twin of happy-halloween).
//
// Cute-spooky and romantic, never scary: a warm candy-coloured night, ghosts
// with blush cheeks, and a GIF sticker reacting in every scene.
//   gate     the haunted mailbox: tap it, a ghost bursts out at you, BOO (scare #1; the haunted piano starts)
//   treats   tap the treat bag; candies fly out; catch each one for a sweet line or a cute dare
//   carve    carve a pumpkin together: pick the eyes, pick the smile, hold to light the candle;
//            then turn round the pumpkin facing away (scare #2, it lights up green)
//   booth    the ghost photo booth: ghosts are hiding their photos; shoo each one away; the
//            last one hides behind a pumpkin that BOOs (scare #3)
//   potion   drag three ingredients into the cauldron, stir it, it puffs a heart + the spell
//   letter   a bat flies in with the letter; tap the bat; the scroll unrolls (+ the sealed P.S.)
//   radio    the spirit radio: tune the dial to Boo FM and his voice comes through
//   question "Will you be my boo?" — the No ghosts away; YES swells the music and turns the
//            night pink, the moon becomes a heart and a swarm of bats makes a heart around her
//   license  the Boo License keepsake (9:16 story / 4:5 post), a reply, replay, "Scare your boo"
// Music: the Haunted Piano loop (track mode) by default; the buyer can pick a
// YouTube song from the suggestions instead (and set its chorus for the YES).
// Kids pages get no scares.
// Server twin: server/src/config/premiumDays/happy-halloween-premium.ts (same
// keys + limits; valentineDays.test.ts pins them). Keys shared with the $2 day
// (tone, houseName, ingredients, potionSpell, question, yesLine) keep its names
// and shapes so an upgrade carries them over.

import type { SongSuggestion } from "../music/youtube";
import type { DayConfig, GifSlot } from "../types";
import { TRACK_DEMO, demoPhotos } from "./_shared";
import { premiumDay } from "./_premium";
import { HALLOWEEN_TRACK, halloweenDay, type HalloweenTone } from "./happy-halloween";

export interface PotionIngredient {
  name: string;
  line: string;
}

export interface HalloweenExtrasPremium {
  tone: HalloweenTone;
  houseName: string;
  treats: string[];
  ingredients: PotionIngredient[];
  potionSpell: string;
  perks: string[];
  costumeDuo: string;
  question: string;
  yesLine: string;
  [k: string]: unknown;
}

/**
 * Romantic first, with a wink of spooky (each id: YouTube oEmbed 200 +
 * playableInEmbed, 2026-10-09). Suggestions for a buyer who swaps the
 * Haunted Piano for a song; the demo plays the piano (track mode), so there
 * is no demo start or drop second any more: a buyer's own song gets its
 * chorus from the editor's ChorusPicker (premium.songDropAt).
 */
export const HALLOWEEN_PREMIUM_SONGS: readonly SongSuggestion[] = [
  { id: "GxldQ9eX2wo", title: "Until I Found You", artist: "Stephen Sanchez" },
  { id: "WCjzNfJLHa0", title: "I Put a Spell on You", artist: "Nina Simone" },
  { id: "fb0KjR4bik8", title: "Love Potion No. 9", artist: "The Searchers" },
  { id: "vGJTaP6anOU", title: "Can't Help Falling in Love", artist: "Elvis Presley" },
  { id: "orYf6VDtj_k", title: "Raataan Lambiyan", artist: "Jubin Nautiyal · Shershaah" },
  { id: "LXuSOkf2M3c", title: "Abracadabra", artist: "Lady Gaga" },
  { id: "ZVuToMilP0A", title: "This Is Halloween", artist: "The Nightmare Before Christmas" },
];

// Six sticker slots, each defaulting to a real GIF from the premium library
// (gifts-media/templates/_premium/gifs/halloween/…) or the owner's v4 picks
// (gifts-media/templates/_halloween/…). `file` is relative to the template's
// own media folder, so "../_premium/…" resolves to the shared one (browsers
// normalise the dot segment before the request).
const G = (name: string) => `../_premium/gifs/halloween/${name}.webp`;
const V4 = (name: string) => `../_halloween/${name}.webp`;
const GIFS: GifSlot[] = [
  { id: "hb1-hello", label: "Title card", moment: "Says Happy Halloween over the mailbox at the start", file: V4("happy-halloween-pumpkin"), emoji: "🎃", anim: "wiggle" },
  { id: "hb2-treats", label: "Trick or treat", moment: "Next to the treat bag", file: G("ghost-pumpkin-bucket"), emoji: "🎃", anim: "bounce" },
  { id: "hb3-pumpkin", label: "Pumpkin pal", moment: "Watches you carve the pumpkin", file: G("pink-pumpkin-smile"), emoji: "🎃", anim: "wiggle" },
  { id: "hb4-booth", label: "Ghost booth", moment: "Pops up when every photo is found", file: G("ghosts-cuddling"), emoji: "👻", anim: "float" },
  { id: "hb5-potion", label: "Potion helper", moment: "Flies round the cauldron while the potion brews", file: V4("witch-seal-broom"), emoji: "🧙", anim: "float" },
  { id: "hb6-yes", label: "After the YES", moment: "Two ghosts hugging after they say yes", file: G("ghost-couple-hearts"), emoji: "💜", anim: "pulse" },
];

const base = premiumDay<HalloweenExtrasPremium>(halloweenDay, {
  slug: "happy-halloween-premium",
  title: "Boo-tiful Night",
  gifSlots: GIFS,
  demoPremium: {
    voiceCaption: "Hi Pumpkin. The ghosts found you. Happy Halloween, I'm all yours.",
    psLetter:
      "P.S. Check your bag tonight. There's real candy in it, a note, and probably me, hiding behind the door.",
  },
  copy: {
    recipientPlaceholder: "who it's for, e.g. Meera",
    letterPlaceholder:
      "The letter a little bat delivers. A memory only you two share, the night you'd relive, what they mean to you…",
    letterHint: "A cute bat flies in with it; they tap the bat and your letter unrolls like a scroll.",
    photosHint:
      "Your first photo is the big one: it sits in the moonlight when you ask the question, and on their Boo License. The next four hide behind ghosts in the photo booth.",
    captionHint: "a short label under the photo, e.g. the pumpkin patch",
    endLinePlaceholder: "Happy Halloween, my boo. 👻🧡",
    endLineHint: "The last line, over their Boo License.",
    sheetTitle: "Build their Boo-tiful Night 👻",
    sheetSub: "Fill the treat bag, pick the potion's ingredients and write the perks on their Boo License. Everything is pre-filled, so make it yours.",
    extrasTitle: "The night",
    extrasSub: "Who it's for, the treat bag, the love potion, their Boo License and the question",
    publishing: "Waking up the ghosts…",
    storyTitle: "Let's build their Boo-tiful Night 👻",
    replyText: "Yes. Obviously. I'm your boo 👻🧡",
    yesChip: "Said yes on Boo-tiful Night 👻",
  },
  share: { title: "Boo! 👻 A little ghost has a letter for you", accent: "#FF9A3C" },
});

export const halloweenDayPremium: DayConfig<HalloweenExtrasPremium> = {
  ...base,
  // The recipient page: the SubhSandesh logo with the word under it, top-right (like the $2 twin).
  brandMark: "stacked",
  music: {
    audioOnly: true,
    // One small round play/stop icon, placed by the template beside its progress trail (.vm-icon).
    compact: true,
    track: HALLOWEEN_TRACK,
    suggestions: HALLOWEEN_PREMIUM_SONGS,
    suggestionsNote: "romantic, a little spooky · tap to use",
  },
  extras: [
    {
      key: "tone", kind: "enum", label: "Who's it for?", display: "cards", default: "romantic",
      hint: "For family and kids the No button never appears and the jokes stay gentle.",
      options: [
        { value: "romantic", label: "My boo", emoji: "💜", hint: "partner or crush" },
        { value: "friends", label: "My bestie", emoji: "🦇", hint: "best friend" },
        { value: "family", label: "Family", emoji: "🎃", hint: "parent, sibling, cousin" },
        { value: "kids", label: "A little one", emoji: "🍭", hint: "gentle, zero scares" },
      ],
    },
    {
      key: "houseName", kind: "text", max: 40, label: "Name of your haunted house",
      placeholder: "a cute pun only you two would get",
      hint: "On the mailbox at the start and on their Boo License.",
      suggestions: ["Villa Boo-tiful", "The Haunted Hideout", "Casa de Boo"],
    },
    {
      key: "treats", kind: "list", maxItems: 5, minItems: 3, itemMax: 70, label: "What's in the treat bag",
      addLabel: "+ add a candy",
      hint: "Each candy they catch opens to one line. Start with “Treat:” for something sweet or “Trick:” for a cute dare.",
      itemPlaceholder: [
        "Treat: the last slice of pizza is yours. Forever.",
        "Trick: you owe me 3 hugs. Pay up tonight.",
        "Treat: my hoodie is officially yours now.",
        "Trick: one horror movie, no hiding behind me.",
        "Treat: forehead kisses, unlimited supply.",
      ],
    },
    {
      key: "ingredients", kind: "objlist", maxItems: 3, minItems: 3, label: "Love potion ingredients", itemTitle: "Ingredient",
      hint: "Three little bottles they pour into the cauldron. Each one is a real memory.",
      item: [
        { key: "name", kind: "text", max: 30, label: "On the bottle", placeholder: "A drop of your laugh" },
        { key: "line", kind: "text", max: 70, label: "What it really is", placeholder: "the one where you snort and deny it" },
      ],
    },
    {
      key: "potionSpell", kind: "text", max: 90, label: "What the potion does",
      placeholder: "a promise or a plan the potion “casts”",
      hint: "Revealed when the cauldron puffs out a heart.",
      suggestions: ["One sip and you're stuck with me. Every October, and every month in between."],
    },
    {
      key: "perks", kind: "list", maxItems: 3, minItems: 1, itemMax: 40, label: "Perks on their Boo License",
      addLabel: "+ add a perk",
      hint: "Printed on the license they can save and post.",
      itemPlaceholder: ["Unlimited hoodie access", "First pick of the candy", "Forehead kisses on demand"],
    },
    {
      key: "costumeDuo", kind: "text", max: 40, label: "Your costume duo (optional)",
      placeholder: "e.g. Two ghosts, one bedsheet",
      hint: "Printed on the license as “Costume”.",
      suggestions: ["Two ghosts, one bedsheet", "The witch & her cat", "Pumpkin & spice"],
    },
    {
      key: "question", kind: "text", max: 60, label: "The question",
      placeholder: "leave empty to use the one for who it's for",
      hint: "Asked in the moonlight next to your first photo.",
      suggestions: ["Will you be my boo, this Halloween and every one after?", "Will you be my boo-st friend forever?", "Will you be my favourite little pumpkin?"],
    },
    {
      key: "yesLine", kind: "text", max: 80, label: "After they say yes",
      placeholder: "what you'd say back",
      suggestions: ["Best treat I ever got. I'm never ghosting you. 👻"],
    },
  ],
  theme: {
    bg: "linear-gradient(165deg, #3B2D6E 0%, #4A3A80 48%, #6A4C96 100%)",
    base: "#3B2D6E",
    paper: "#FFF4E3",
    glass: "rgba(255,244,227,0.12)",
    ink: "#FFF7EC",
    inkSoft: "#D9CCF5",
    paperInk: "#2A1F3D",
    accent: "#FF9A3C",
    accentDeep: "#E06A12",
    accentInk: "#2A1206",
    soft: "#C9B6FF",
    edge: "rgba(255,244,227,0.22)",
    gold: "#FFD27A",
    dark: true,
    particles: ["👻", "🦇", "✨", "🍬"],
    confetti: ["#FF9A3C", "#FF9EC4", "#C9B6FF", "#9BE7C4", "#FFD27A"],
  },
  demo: {
    ...base.demo,
    // The haunted piano (premiumDay() would otherwise pick the first YouTube suggestion).
    ...TRACK_DEMO,
    recipientName: "Meera",
    senderName: "Arjun",
    petName: "Pumpkin",
    letter:
      "You told me you're not scared of horror movies. Then you watched the whole thing through your fingers, holding my hand so tight I lost the feeling in two of them. I've never loved anyone more.\n\nSo this year I made you a little haunted night of your own: candy, a pumpkin, a love potion, and a few ghosts who are really bad at hiding.\n\nYou make every ordinary night feel like the best part of October. A tiny bit spooky, mostly sweet, and full of snacks I'm not allowed to touch.\n\nOne last thing is waiting for you at the end. Go on, I'm right behind you.",
    photos: demoPhotos([
      ["us, after dark", "My favourite thing about October is you."],
      ["costume party", "Two ghosts, one bedsheet, zero regrets."],
      ["the pumpkin patch", "You picked the ugliest pumpkin on purpose and named it Gerald."],
      ["movie night", "You screamed before the scary part. Every single time."],
    ]),
    endLine: "Happy Halloween, my boo. 👻🧡",
    extras: {
      tone: "romantic",
      houseName: "Villa Boo-tiful",
      treats: [
        "Treat: the last slice of pizza is yours. Forever.",
        "Trick: you owe me 3 hugs. Pay up tonight.",
        "Treat: my hoodie is officially yours now.",
        "Trick: one horror movie, no hiding behind me.",
        "Treat: forehead kisses, unlimited supply.",
      ],
      ingredients: [
        { name: "A pinch of stardust", line: "the night we counted stars from the terrace" },
        { name: "A drop of your laugh", line: "the one where you snort and then deny it" },
        { name: "A sprinkle of hugs", line: "the long ones at the airport" },
      ],
      potionSpell: "One sip and you're stuck with me. Every October, and every month in between.",
      perks: ["Unlimited hoodie access", "First pick of the candy", "Forehead kisses on demand"],
      costumeDuo: "Two ghosts, one bedsheet",
      question: "Will you be my boo, this Halloween and every one after?",
      yesLine: "Best treat I ever got. I'm never ghosting you. 👻",
    },
  },
};
