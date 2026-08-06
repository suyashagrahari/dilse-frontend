// ─── Us — demo content and the wire body ─────────────────────────────────────
//
// The contract in ./types.ts is frozen, so everything that is *content* rather
// than *shape* lives here: the demo profile the gallery previews, the allow-list
// of keys that reach the API, and nothing else.
//
// The humour is entirely in this file. The UI is deliberately plain — it only
// has to be correct. Every joke is a caption, a comment, or a number.

import { bodyFromKeys } from "@/lib/wire";
import type { ProfileData } from "./types";

/**
 * Unsplash serves `access-control-allow-origin: *`, which matters more than it
 * looks: the share card is captured with html-to-image, and a photo without
 * CORS headers taints the canvas and kills the whole export (trap 3 in
 * lib/exportPng.ts). Square crops so the grid never has to letterbox.
 */
const photo = (id: string, size = 600): string =>
  `https://images.unsplash.com/${id}?q=80&w=${size}&h=${size}&fit=crop&auto=format`;

export const DEMO_DATA: ProfileData = {
  handle: "us_since_2023",
  displayName: "Ananya & Rohan",
  category: "Domestic partnership",
  bio: [
    "two idiots, one shared calendar",
    "est. 12.03.2023 · HQ: her sofa",
    "she picks the restaurant, i pretend to have an opinion",
    "still arguing about the thermostat",
  ],
  link: { label: "the-shared-album-nobody-else-sees", url: "https://subhsandesh.in" },
  avatarUrl: photo("photo-1522673607200-164d1b6ce486", 240),
  stats: { posts: 143, followers: 847, following: 2 },
  followedBy: ["mom", "her_mom", "the_group_chat", "arjun"],
  highlights: [
    {
      title: "first date",
      coverUrl: photo("photo-1517841905240-472988babdf9", 200),
      slides: [
        { imageUrl: photo("photo-1517841905240-472988babdf9"), caption: "i was 20 minutes early and sat in the car" },
        { imageUrl: photo("photo-1414235077428-338989a2e8c0"), caption: "she ordered for both of us. correctly." },
        { imageUrl: photo("photo-1493246507139-91e8fad9978e"), caption: "walked her to the auto. did not shut up once." },
      ],
    },
    {
      title: "the arguments",
      coverUrl: photo("photo-1516575334481-f85287c2c82d", 200),
      slides: [
        { imageUrl: photo("photo-1516575334481-f85287c2c82d"), caption: "exhibit A: the thermostat" },
        { imageUrl: photo("photo-1529626455594-4ff0802cfb7e"), caption: "exhibit B: whether 'a bit of salt' is a measurement" },
        { imageUrl: photo("photo-1502301197179-65228ab57f78"), caption: "she was right. both times. we don't talk about it." },
      ],
    },
    {
      title: "food we ate",
      coverUrl: photo("photo-1504674900247-0877df9cc836", 200),
      slides: [
        { imageUrl: photo("photo-1504674900247-0877df9cc836"), caption: "she said she wasn't hungry" },
        { imageUrl: photo("photo-1476514525535-07fb3b4ae5f1"), caption: "then ate two thirds of mine" },
      ],
    },
    {
      title: "her family",
      coverUrl: photo("photo-1533073526757-2c8ca1df9f1c", 200),
      slides: [
        { imageUrl: photo("photo-1533073526757-2c8ca1df9f1c"), caption: "mom asked my salary in the first four minutes" },
        { imageUrl: photo("photo-1522673607200-164d1b6ce486"), caption: "i answered honestly. she still let me stay for dinner." },
      ],
    },
    {
      title: "sundays",
      coverUrl: photo("photo-1470071459604-3b5ec3a7fe05", 200),
      slides: [
        { imageUrl: photo("photo-1470071459604-3b5ec3a7fe05"), caption: "nothing happened. best day of the week." },
      ],
    },
  ],
  pinnedPostIds: ["p09", "p01"],
  posts: [
    {
      id: "p01",
      imageUrl: photo("photo-1517841905240-472988babdf9"),
      caption: "day one. she says she knew. i say i also knew, which is a lie — I was busy panicking about the parking.",
      likes: 847,
      likedByName: "her_mom",
      postedAgo: "2 years ago",
      location: "Bandra, Mumbai",
      isMultiple: true,
      comments: [
        { handle: "her_mom", text: "he was sweating. i have photos.", likes: 41 },
        { handle: "arjun", text: "bro texted me from the bathroom", likes: 112 },
        { handle: "us_since_2023", text: "@arjun this account is a joint account", likes: 9 },
      ],
    },
    {
      id: "p02",
      imageUrl: photo("photo-1504674900247-0877df9cc836"),
      caption: "she wasn't hungry.",
      likes: 612,
      likedByName: "the_group_chat",
      postedAgo: "1 year ago",
      location: "some place with fairy lights",
      comments: [
        { handle: "neha_pdf", text: "she is never hungry and always finishes", likes: 88 },
        { handle: "ananya", text: "i had ONE bite", likes: 4 },
      ],
    },
    {
      id: "p03",
      imageUrl: photo("photo-1470071459604-3b5ec3a7fe05"),
      caption: "no plans. no photos worth posting. posting anyway.",
      likes: 233,
      likedByName: "mom",
      postedAgo: "1 year ago",
      comments: [{ handle: "mom", text: "beta eat something", likes: 203 }],
    },
    {
      id: "p04",
      imageUrl: photo("photo-1519741497674-611481863552"),
      caption: "attended a wedding. were asked when. seven separate times. by four separate aunties. one of them twice.",
      likes: 1204,
      likedByName: "chintu.exe",
      postedAgo: "11 months ago",
      location: "Jaipur",
      isMultiple: true,
      comments: [
        { handle: "chintu.exe", text: "the aunties are undefeated", likes: 156 },
        { handle: "her_mom", text: "it's a fair question", likes: 401 },
      ],
    },
    {
      id: "p05",
      imageUrl: photo("photo-1441974231531-c6227db76b6e"),
      caption: "she made me walk 4km to see a tree. it was a good tree.",
      likes: 419,
      likedByName: "arjun",
      postedAgo: "9 months ago",
      location: "Coorg",
      isVideo: true,
      comments: [],
    },
    {
      id: "p06",
      imageUrl: photo("photo-1516575334481-f85287c2c82d"),
      caption: "the thermostat discourse, day 402.",
      likes: 88,
      likedByName: "neha_pdf",
      postedAgo: "8 months ago",
      comments: [
        { handle: "arjun", text: "24 is correct and you both know it", likes: 12 },
        { handle: "ananya", text: "24 is a crime", likes: 61 },
      ],
    },
    {
      id: "p07",
      imageUrl: photo("photo-1476514525535-07fb3b4ae5f1"),
      caption: "learned to make her mother's dal. it was 80% correct, which her mother described as 'fine'.",
      likes: 906,
      likedByName: "her_mom",
      postedAgo: "6 months ago",
      comments: [{ handle: "her_mom", text: "fine is a compliment", likes: 322 }],
    },
    {
      id: "p08",
      imageUrl: photo("photo-1502301197179-65228ab57f78"),
      caption: "she fell asleep 12 minutes into the film she chose.",
      likes: 341,
      likedByName: "the_group_chat",
      postedAgo: "4 months ago",
      isVideo: true,
      comments: [{ handle: "neha_pdf", text: "every single time", likes: 74 }],
    },
    {
      id: "p09",
      imageUrl: photo("photo-1533073526757-2c8ca1df9f1c"),
      caption: "moved in. the sofa came with her. so did her mother, for nine days.",
      likes: 1533,
      likedByName: "mom",
      postedAgo: "3 months ago",
      location: "our place",
      isMultiple: true,
      comments: [
        { handle: "her_mom", text: "i was helping", likes: 512 },
        { handle: "arjun", text: "nine DAYS", likes: 233 },
        { handle: "ananya", text: "she folded everything you own", likes: 97 },
      ],
    },
    {
      id: "p10",
      imageUrl: photo("photo-1529626455594-4ff0802cfb7e"),
      caption: "'a bit of salt' is not a measurement and i will die on this hill.",
      likes: 275,
      likedByName: "chintu.exe",
      postedAgo: "2 months ago",
      comments: [],
    },
    {
      id: "p11",
      imageUrl: photo("photo-1493246507139-91e8fad9978e"),
      caption: "nothing to report. that's the report.",
      likes: 198,
      likedByName: "mom",
      postedAgo: "5 weeks ago",
      comments: [{ handle: "mom", text: "when are you both visiting", likes: 88 }],
    },
    {
      id: "p12",
      imageUrl: photo("photo-1414235077428-338989a2e8c0"),
      caption: "two years. same restaurant. she ordered for both of us again, and again she was right.",
      likes: 2140,
      likedByName: "the_group_chat",
      postedAgo: "6 days ago",
      location: "the same table",
      isMultiple: true,
      comments: [
        { handle: "neha_pdf", text: "okay this one got me", likes: 140 },
        { handle: "arjun", text: "unfollowing, too much", likes: 302 },
        { handle: "us_since_2023", text: "@arjun you can't. we checked.", likes: 88 },
      ],
    },
  ],
};

/**
 * The allow-list that reaches the API. Deliberately explicit — it is what stops
 * UI-only state (and anything appended to the object) hitting the model.
 */
export const US_CONTENT_KEYS: (keyof ProfileData)[] = [
  "handle",
  "displayName",
  "category",
  "bio",
  "link",
  "avatarUrl",
  "stats",
  "followedBy",
  "highlights",
  "posts",
  "pinnedPostIds",
];

export function usDataToBody(data: ProfileData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, US_CONTENT_KEYS, password);
}

/** Editor limits. The layout is built to hold exactly this much. */
export const MAX_POSTS = 18;
export const MAX_HIGHLIGHTS = 8;
export const MAX_HIGHLIGHT_SLIDES = 8;
export const MAX_BIO_LINES = 6;
export const MAX_COMMENTS = 6;
export const MAX_FOLLOWED_BY = 6;
export const MAX_PINNED = 3;
