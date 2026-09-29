// ─── Us — demo content and the wire body ─────────────────────────────────────
//
// Everything that is *content* rather than *shape*: the demo profile the
// gallery previews, the allow-list of keys that reach the API, and the editor
// limits. The voice is a Gen-Z couple running a joint account about themselves
// — soft in the captions, feral in the comments.

import { bodyFromKeys } from "@/lib/wire";
import type { ProfileData } from "./types";

/** Portrait 3:4 crops so the grid never letterboxes. Unsplash sends CORS headers. */
const photo = (id: string, w = 720): string =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&h=${Math.round((w * 4) / 3)}&fit=crop&auto=format`;
const cdn = (n: number): string => `https://cdn.subhsandesh.in/gifts-media/assets/couple${n}.webp`;

/** The demo's own photos — the editor swaps these for the sender's on first upload. */
export const DEMO_IMAGE_PREFIXES = ["https://images.unsplash.com/", "https://cdn.subhsandesh.in/gifts-media/assets/couple"];
export const isDemoImage = (url: string): boolean => DEMO_IMAGE_PREFIXES.some((p) => url.startsWith(p));

export const DEMO_DATA: ProfileData = {
  from: "Rohan",
  to: "Ananya",
  handle: "ro.and.anu",
  displayName: "Rohan & Ananya 💞",
  category: "Long-term situationship (official)",
  bio: [
    "two idiots, one shared calendar 🗓️",
    "est. 12.03.2023 · HQ: her side of the bed",
    "she picks the food, i pick her 🍜",
    "↓ the album nobody else gets to see",
  ],
  link: { label: "our-little-archive.love", url: "https://subhsandesh.in" },
  avatarUrl: cdn(1),
  note: "still not over you tbh 🫶",
  stats: { posts: 143, followers: 847, following: 2 },
  followedBy: ["her_mom", "the_group_chat", "arjun.exe", "chai_with_neha"],
  highlights: [
    {
      title: "first date",
      coverUrl: cdn(2),
      slides: [
        { imageUrl: cdn(2), caption: "i was 20 minutes early and sat in the car rehearsing 'hi'" },
        { imageUrl: photo("photo-1414235077428-338989a2e8c0") },
        { imageUrl: photo("photo-1493246507139-91e8fad9978e") },
      ],
    },
    {
      title: "us 🫶",
      coverUrl: cdn(3),
      slides: [
        { imageUrl: cdn(3), caption: "the day she laughed so hard she snorted. i fell harder." },
        { imageUrl: photo("photo-1516589178581-6cd7833ae3b2") },
      ],
    },
    {
      title: "food dates",
      coverUrl: photo("photo-1504674900247-0877df9cc836"),
      slides: [
        { imageUrl: photo("photo-1504674900247-0877df9cc836"), caption: "'i'm not hungry' — her, 4 minutes before eating my fries" },
        { imageUrl: photo("photo-1476514525535-07fb3b4ae5f1") },
      ],
    },
    {
      title: "trips",
      coverUrl: photo("photo-1470071459604-3b5ec3a7fe05"),
      slides: [
        { imageUrl: photo("photo-1470071459604-3b5ec3a7fe05"), caption: "no network, one playlist, zero complaints" },
        { imageUrl: photo("photo-1441974231531-c6227db76b6e") },
      ],
    },
  ],
  pinnedPostIds: ["p01"],
  posts: [
    {
      id: "p01",
      imageUrl: cdn(1),
      more: [{ url: cdn(2) }, { url: cdn(3) }],
      caption: "day one. she says she knew. i say i also knew, which is a lie — i was busy panicking about parking 🫠",
      likes: 847,
      likedByName: "",
      postedAgo: "2 years ago",
      location: "Bandra, Mumbai",
      comments: [
        { handle: "her_mom", text: "he was sweating. i have photos.", likes: 41 },
        { handle: "arjun.exe", text: "bro texted me from the bathroom 💀", likes: 112 },
        { handle: "chai_with_neha", text: "the way he looks at her 😭😭", likes: 64 },
      ],
    },
    {
      id: "p02",
      imageUrl: cdn(4),
      caption: "golden hour but make it her ☀️",
      likes: 1204,
      likedByName: "",
      postedAgo: "1 year ago",
      location: "Marine Drive",
      comments: [
        { handle: "the_group_chat", text: "get a room (you have one)", likes: 88 },
        { handle: "her_mom", text: "beautiful beta ❤️ when is he visiting", likes: 203 },
      ],
    },
    {
      id: "p03",
      imageUrl: photo("photo-1504674900247-0877df9cc836"),
      caption: "she wasn't hungry.",
      likes: 612,
      likedByName: "",
      postedAgo: "1 year ago",
      location: "that place with fairy lights",
      comments: [{ handle: "chai_with_neha", text: "she is never hungry and always finishes", likes: 88 }],
    },
    {
      id: "p04",
      imageUrl: photo("photo-1516589178581-6cd7833ae3b2"),
      more: [{ url: photo("photo-1518199266791-5375a83190b7") }],
      caption: "wedding season. asked 'when is yours' seven times by four aunties. one of them twice.",
      likes: 1533,
      likedByName: "",
      postedAgo: "11 months ago",
      location: "Jaipur",
      comments: [
        { handle: "arjun.exe", text: "the aunties are undefeated", likes: 156 },
        { handle: "her_mom", text: "it's a fair question", likes: 401 },
      ],
    },
    {
      id: "p05",
      imageUrl: photo("photo-1470071459604-3b5ec3a7fe05"),
      caption: "she made me hike 4km to see a tree. it was a good tree. she was better 🌳",
      likes: 419,
      likedByName: "",
      postedAgo: "9 months ago",
      isVideo: true,
      comments: [{ handle: "the_group_chat", text: "4km for a TREE", likes: 33 }],
    },
    {
      id: "p06",
      imageUrl: photo("photo-1502301197179-65228ab57f78"),
      caption: "movie night: she chose the film, then fell asleep in 12 minutes. tradition.",
      likes: 341,
      likedByName: "",
      postedAgo: "6 months ago",
      comments: [{ handle: "chai_with_neha", text: "every. single. time.", likes: 74 }],
    },
    {
      id: "p07",
      imageUrl: photo("photo-1476514525535-07fb3b4ae5f1"),
      caption: "learned to cook her favourite. 80% correct. she ate 100% of it.",
      likes: 906,
      likedByName: "",
      postedAgo: "4 months ago",
      comments: [],
    },
    {
      id: "p08",
      imageUrl: photo("photo-1441974231531-c6227db76b6e"),
      caption: "nothing happened today. best day of the week.",
      likes: 275,
      likedByName: "",
      postedAgo: "5 weeks ago",
      comments: [],
    },
    {
      id: "p09",
      imageUrl: photo("photo-1414235077428-338989a2e8c0"),
      caption: "same table, same order, same her. two years and i'd still pick this every time 🥂",
      likes: 2140,
      likedByName: "",
      postedAgo: "6 days ago",
      comments: [],
    },
  ],
  dms: [
    "u up?",
    "obviously. i was waiting for u to text first 🙄",
    "i was typing for 10 minutes",
    "what took so long",
    "trying to say i miss you without sounding clingy",
    "be clingy. i like clingy 🫶",
    "ok. i miss you. a lot. like an embarrassing amount",
    "come over then. i saved you the last slice 🍕",
  ],
  letter:
    "I made us an account because I ran out of places to put how much I like you. Two years of your terrible taste in films, your perfect taste in food, and the way you steal the blanket and then say you're cold.\n\nEvery photo on this grid is a day I was lucky. Every caption is me trying to be cool about it and failing.\n\nThank you for picking me — every single day, even the thermostat days. I'd follow you anywhere. Literally. You can't unfollow me, I checked.",
  lockQuestion: "who texted first? (be honest)",
  lockAnswer: "you did 🙄💗",
};

/** The allow-list that reaches the API. */
export const US_CONTENT_KEYS: (keyof ProfileData)[] = [
  "from",
  "to",
  "handle",
  "displayName",
  "category",
  "bio",
  "link",
  "avatarUrl",
  "avatarCrop",
  "note",
  "stats",
  "followedBy",
  "highlights",
  "posts",
  "pinnedPostIds",
  "dms",
  "letter",
  "lockQuestion",
  "lockAnswer",
];

export function usDataToBody(data: ProfileData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, US_CONTENT_KEYS, password);
}

/** Editor limits. Server mirrors are in models/UsPage.ts. */
export const MAX_POSTS = 18;
export const MAX_MORE = 4;
export const MAX_HIGHLIGHTS = 8;
export const MAX_HIGHLIGHT_SLIDES = 8;
export const MAX_BIO_LINES = 6;
export const MAX_COMMENTS = 8;
export const MAX_FOLLOWED_BY = 6;
export const MAX_PINNED = 3;
export const MAX_DMS = 16;
/** Server LOVE_LIMITS.letter. */
export const MAX_LETTER = 2000;
export const MAX_LOCK_Q = 140;
export const MAX_LOCK_A = 40;
export const MAX_NOTE = 60;
