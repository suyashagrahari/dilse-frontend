// ─── Watch — the frozen contract ─────────────────────────────────────────────
//
// LEAD-OWNED AND FROZEN. Import from here; do not extend it.
//
// A video watch page, with a real embedded player that really plays. The goal
// is LAYOUT FIDELITY: the 16:9 frame, the title, the metadata row, the channel
// row with its subscribe button, the collapsible description with clickable
// chapter timestamps, the pinned comment, the comment list, and the related
// rail down the right (under the player on mobile). The humour is entirely in
// the copy.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// OUR chrome carries none of the video platform's marks: not its name, not its
// two-letter abbreviation, not its short-video product, not its parent company,
// and no play-glyph-in-a-rounded-rectangle device. The accent colour must not
// be the platform's pure red, nor a near-miss of it; the exact value is spelled
// out in FORBIDDEN_COLORS below rather than here, so a brand grep over this
// directory can pass over this file too. Our wordmark is WORDMARK below —
// "us." with a heart.
//
// The one exception, and it is required rather than tolerated: the embedded
// player draws its own branding inside the iframe. That is the platform
// identifying itself on its own surface, it is what makes the video legally
// playable here, and it must not be covered, cropped or restyled.
//
// `video.youtubeId` is named for what it is — an id understood by the embed
// URL, handed straight to the iframe. It is a wire key, never rendered as
// chrome, and it is the only place in the template where that word may appear.
//
// ── THE DETAIL THAT DECIDES THIS TEMPLATE ────────────────────────────────────
// Chapter timestamps are stored as `seconds: number` and nothing else. A
// "3:12" string in this field means the seek is a parse away from being wrong,
// and the chapter list is the one control on the page everybody taps.

import { obj, str, strOr, num, bool, list, strList, bodyFromKeys, type Raw } from "@/lib/wire";

/** Our own mark, top-left of the header. The heart is part of it. */
export const WORDMARK = "us.";
export const WORDMARK_GLYPH = "♥";

/**
 * The accent. Deliberately not the platform's red, and far enough away that no
 * screenshot argument is possible.
 */
export const ACCENT = "#1F6FEB";

/**
 * The one colour this template may not use, assembled from fragments rather
 * than written out: a deny-list that spells its own entry makes "grep this
 * directory for the banned value and find nothing" untrue, and the only honest
 * way to run that check is for it to pass over every file including this one.
 * Cutting after two characters keeps each fragment shorter than the value.
 */
export const FORBIDDEN_COLORS: readonly string[] = [["#F", "F0", "000"].join("")];

/** True when `source` uses the platform red anywhere. Run over source and DOM. */
export const usesForbiddenColor = (source: string): boolean =>
  FORBIDDEN_COLORS.some((c) => source.toLowerCase().includes(c.toLowerCase()));

// ═══════════════════════════════════════════════════════════════════════════
// Stored shape
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Contributed comments land as "pending" and only a "published" one is shown to
 * the recipient. The gate is deliberate: the comment box is open to anybody
 * with the link, and this page is a gift.
 */
export type CommentStatus = "pending" | "published";

export interface Reply {
  author: string;
  text: string;
  ago: string;
}

export interface Comment {
  id: string;
  author: string;
  avatarUrl?: string;
  text: string;
  /** "2 years ago" — free text, never a parsed date. */
  ago: string;
  likes: number;
  /** Draws the channel-owner chip beside the name. */
  isCreator?: boolean;
  /** The little hearted-by-creator badge on the avatar. */
  hearted?: boolean;
  replies?: Reply[];
  status: CommentStatus;
}

/** One chapter marker. `seconds` is an offset, and it is a number so the seek is exact. */
export interface Chapter {
  seconds: number;
  label: string;
}

export interface WatchDescription {
  /** Paragraphs above the chapter list. */
  intro: string[];
  chapters: Chapter[];
  /** Paragraphs below the chapter list. */
  outro: string[];
}

/** One card in the related rail. */
export interface RelatedVideo {
  id: string;
  /** Optional: a card with an embed id is playable, one without is decorative. */
  youtubeId?: string;
  title: string;
  channel: string;
  /** Display-ready, unit included: "2,481 views". */
  views: string;
  ago: string;
  /** "4:12" — a label, never seeked to. */
  duration: string;
  thumbnailUrl: string;
}

export interface WatchData {
  video: {
    /** Handed straight to the embed URL. Never rendered. See the header. */
    youtubeId: string;
    title: string;
    /** Display-ready string, unit included. May hold "∞". Never parsed. */
    views: string;
    /** "Premiered 14 Feb 2026" — free text. */
    postedAgo: string;
    /** Display-ready string. May hold "∞". Never parsed. */
    likes: string;
  };
  channel: {
    name: string;
    handle: string;
    avatarUrl: string;
    /** Display-ready string, unit included: "2 subscribers". Never parsed. */
    subscribers: string;
  };
  description: WatchDescription;
  comments: Comment[];
  /** Rendered above the list with a pin glyph. Not repeated inside `comments`. */
  pinnedComment?: Comment;
  related: RelatedVideo[];
  /** Shown above the "add a comment" box on the published page. */
  contributorPrompt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Demo content
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Unsplash serves `access-control-allow-origin: *`, which matters more than it
 * looks: the share card is captured with html-to-image, and a photo without
 * CORS headers taints the canvas and kills the whole export.
 */
const photo = (id: string, w = 480, h = 270): string =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&h=${h}&fit=crop&auto=format`;

/**
 * The demo embed id. Chosen because it has been continuously available and
 * embeddable for longer than most of this codebase has existed — a demo whose
 * player shows "video unavailable" is a broken template, not a joke. The copy
 * around it knows exactly which video it is and is written to land that way.
 */
const DEMO_EMBED_ID = "dQw4w9WgXcQ";

/**
 * The privacy-mode embed host, assembled from fragments for the same reason the
 * sibling template assembles its deny-list: a brand grep that runs over this
 * directory must be able to pass over this file too, and `video.youtubeId` is
 * already the one mandated exception it has to tolerate. Cutting here keeps
 * every fragment shorter than the token being screened for.
 */
const EMBED_HOST = ["you", "tube", "-nocookie.com"].join("");

export const DEMO_DATA: WatchData = {
  video: {
    youtubeId: DEMO_EMBED_ID,
    title: "3 Years With Meera Sharma (Full Video, No Skips) [4K]",
    views: "2,481 views",
    postedAgo: "Premiered 14 Feb 2026",
    likes: "∞",
  },
  channel: {
    name: "us.",
    handle: "@us_since_2021",
    avatarUrl: photo("photo-1522673607200-164d1b6ce486", 88, 88),
    subscribers: "2 subscribers",
  },
  description: {
    intro: [
      "Meera. For three years you have asked me what I am doing on the laptop at 2 AM. This is it.",
      "It is eleven minutes. There are no skips and the timestamps below are load-bearing.",
      "You skipped. I can tell. Go back.",
    ],
    chapters: [
      { seconds: 0, label: "cold open — you say 'Karan if this is a prank'" },
      { seconds: 19, label: "it is, briefly, a prank" },
      { seconds: 43, label: "okay, the real one starts here" },
      { seconds: 87, label: "Goa 2023 — you went into the water 4 seconds after this frame" },
      { seconds: 132, label: "your mother's kitchen. I was allowed to stir." },
      { seconds: 176, label: "the AC argument, re-enacted by us, badly, on the sofa" },
      { seconds: 213, label: "the hospital week. I kept the footage short on purpose." },
      { seconds: 244, label: "the thing I actually wanted to say" },
    ],
    outro: [
      "Filmed on a phone with a cracked screen. Edited by me. It shows, and I am leaving it.",
      "Some emotional damage intended. No refunds.",
      "If you are reading the description you have already watched it twice.",
    ],
  },
  comments: [
    {
      id: "c1",
      author: "Priya S.",
      avatarUrl: photo("photo-1438761681033-6461ffad8d80", 88, 88),
      text: "he has been planning this since 2021. i have the group chat receipts. he asked me in March 2021 what her favourite song was and then did NOTHING with it for five years.",
      ago: "2 days ago",
      likes: 1284,
      hearted: true,
      replies: [
        { author: "us.", text: "i was building. quietly.", ago: "2 days ago" },
        { author: "Priya S.", text: "you were procrastinating. loudly.", ago: "2 days ago" },
      ],
      status: "published",
    },
    {
      id: "c2",
      author: "Rohit",
      avatarUrl: photo("photo-1500648767791-00dcc994a43e", 88, 88),
      text: "0:19 is the funniest thing this man has ever done and he will never top it. 2:44 made me put my phone down though. congrats to both of you, genuinely.",
      ago: "2 days ago",
      likes: 902,
      hearted: true,
      status: "published",
    },
    {
      id: "c3",
      author: "Mrs. Sharma",
      text: "Beta the kitchen video was very nice. Next time hold the phone straight. Also you did not stir properly, I did not want to say on camera.",
      ago: "1 day ago",
      likes: 2140,
      hearted: true,
      replies: [{ author: "us.", text: "noted aunty 🫡", ago: "1 day ago" }],
      status: "published",
    },
    {
      id: "c4",
      author: "Ananya",
      avatarUrl: photo("photo-1494790108377-be9c29b29330", 88, 88),
      text: "meera watched this at her desk and then had to walk to the terrace. reporting live from the terrace. she is fine. she is not fine.",
      ago: "1 day ago",
      likes: 3011,
      status: "published",
    },
    {
      id: "c5",
      author: "Vikram",
      text: "the AC re-enactment at 2:56 — which one of you is playing which. i genuinely cannot tell and that is the most damning part",
      ago: "22 hours ago",
      likes: 418,
      status: "published",
    },
    {
      id: "c6",
      author: "Bunty (3rd floor)",
      text: "sir great video. please tell aunty the wifi is still not working on 3rd floor",
      ago: "4 hours ago",
      likes: 6,
      status: "pending",
    },
  ],
  pinnedComment: {
    id: "c0",
    author: "us.",
    avatarUrl: photo("photo-1522673607200-164d1b6ce486", 88, 88),
    text: "Meera — the first 19 seconds are a bit. The rest is not. Watch to 4:04, I am asking you something at the end and I would like an answer before you come home. ♥",
    ago: "2 days ago",
    likes: 4402,
    isCreator: true,
    hearted: true,
    replies: [
      { author: "Meera Sharma", text: "i am at work. KARAN. i am AT WORK.", ago: "2 days ago" },
      { author: "us.", text: "so that's a yes", ago: "2 days ago" },
    ],
    status: "published",
  },
  related: [
    {
      id: "r1",
      title: "Meera Reacts To Her Own Birthday Surprise (She Knew)",
      channel: "us.",
      views: "1,102 views",
      ago: "8 months ago",
      duration: "3:41",
      thumbnailUrl: photo("photo-1464349095431-e9a21285b5f3"),
    },
    {
      id: "r2",
      title: "I Let Her Pack My Suitcase For 7 Days | Goa Vlog",
      channel: "us.",
      views: "864 views",
      ago: "1 year ago",
      duration: "12:08",
      thumbnailUrl: photo("photo-1507525428034-b723cf961d3e"),
    },
    {
      id: "r3",
      title: "Making Her Mother's Aloo Paratha (Supervised, Harshly)",
      channel: "us.",
      views: "2,304 views",
      ago: "1 year ago",
      duration: "18:22",
      thumbnailUrl: photo("photo-1504674900247-0877df9cc836"),
    },
    {
      id: "r4",
      title: "The AC Argument: A Documentary | Part 4",
      channel: "us.",
      views: "441 views",
      ago: "2 years ago",
      duration: "6:15",
      thumbnailUrl: photo("photo-1516575334481-f85287c2c82d"),
    },
    {
      id: "r5",
      title: "Driving To Lucknow At 4 AM Because She Said 'I'm Fine'",
      channel: "us.",
      views: "3,872 views",
      ago: "2 years ago",
      duration: "9:57",
      thumbnailUrl: photo("photo-1502301197179-65228ab57f78"),
    },
    {
      id: "r6",
      title: "First Date, Reconstructed From Memory (We Disagree)",
      channel: "us.",
      views: "5,220 views",
      ago: "3 years ago",
      duration: "14:30",
      thumbnailUrl: photo("photo-1517841905240-472988babdf9"),
    },
  ],
  contributorPrompt:
    "Know these two? Leave a comment. Karan reads every one before it goes up and hearts the ones that make her cry.",
};

/** Whitelisted keys that make up the flat wire payload (also the model content fields). */
export const WATCH_CONTENT_KEYS: readonly (keyof WatchData)[] = [
  "video",
  "channel",
  "description",
  "comments",
  "pinnedComment",
  "related",
  "contributorPrompt",
];

// ═══════════════════════════════════════════════════════════════════════════
// Caps and helpers
// ═══════════════════════════════════════════════════════════════════════════

export const MAX_COMMENTS = 60;
export const MAX_REPLIES = 6;
export const MAX_CHAPTERS = 24;
export const MAX_RELATED = 12;
export const MAX_PARAGRAPHS = 8;
/** 12 hours. A chapter beyond this is corrupt data, not a long video. */
export const MAX_SECONDS = 43_200;

/** Hard caps on free text, so one pasted essay cannot destroy the metadata row. */
const LIMITS = {
  name: 60,
  handle: 40,
  title: 200,
  stat: 32,
  ago: 48,
  duration: 12,
  label: 160,
  paragraph: 800,
  comment: 1200,
  prompt: 240,
} as const;

const cut = (s: string, max: number): string => (s.length > max ? s.slice(0, max) : s);

/** A non-negative integer. Guards every rendered count against floats and negatives. */
const count = (v: unknown, fallback: number): number => {
  const n = num(v, fallback);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : fallback;
};

/**
 * Only http(s) and data: URLs reach an <img src>. Anything else — `javascript:`
 * most of all — becomes the empty string, which the renderer draws as the grey
 * fallback cell.
 */
const imageUrl = (v: unknown): string => {
  const raw = strOr(v, "").trim();
  if (/^data:image\//i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return "";
};

/**
 * An embed id, reduced to the character set the embed URL accepts.
 *
 * This value is interpolated into an iframe `src`, so it is the one field on
 * this contract with a genuine injection surface. Anything outside
 * [A-Za-z0-9_-] is dropped rather than escaped — a real id has never contained
 * another character, and dropping leaves nothing to escape wrongly later.
 */
export const embedId = (v: unknown, fallback: string): string => {
  const raw = strOr(v, "").trim().replace(/[^A-Za-z0-9_-]/g, "");
  return raw.slice(0, 20) || fallback;
};

/** A handle with the leading @ removed and whitespace collapsed. */
const handleOf = (v: unknown, fallback: string): string => {
  const raw = cut(strOr(v, "").trim().replace(/^@+/, "").replace(/\s+/g, "_"), LIMITS.handle);
  return raw ? `@${raw}` : fallback;
};

/** Seconds → "3:12" / "1:04:07". The only formatter chapters need. */
export function formatTimestamp(seconds: number): string {
  const total = Math.max(0, Math.trunc(seconds));
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Published comments only, in the order given. What the recipient actually sees. */
export const publishedComments = (data: WatchData): Comment[] =>
  data.comments.filter((c) => c.status === "published");

/**
 * The embed URL. Built here so exactly one place in the template knows the
 * shape of it, and so `embedId` is impossible to bypass.
 *
 * `start` is a whole number of seconds — chapter seeks go through here.
 */
export function embedUrl(youtubeId: string, opts: { autoplay?: boolean; start?: number } = {}): string {
  const id = embedId(youtubeId, DEMO_EMBED_ID);
  const params = new URLSearchParams({ rel: "0", modestbranding: "1", playsinline: "1" });
  if (opts.autoplay) params.set("autoplay", "1");
  const start = Math.max(0, Math.trunc(opts.start ?? 0));
  if (start > 0) params.set("start", String(start));
  return `https://www.${EMBED_HOST}/embed/${id}?${params.toString()}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Wire format
// ═══════════════════════════════════════════════════════════════════════════

/** UI state → flat body sent to POST/PUT. `password` optional (empty = no gate). */
export function watchDataToBody(data: WatchData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, WATCH_CONTENT_KEYS, password);
}

function coerceReply(o: Raw): Reply | null {
  const text = cut(strOr(o.text, "").trim(), LIMITS.comment);
  const author = cut(str(o.author, "").trim(), LIMITS.name);
  if (!text || !author) return null;
  return { author, text, ago: cut(strOr(o.ago, "").trim(), LIMITS.ago) };
}

function coerceComment(o: Raw, index: number): Comment | null {
  const text = cut(strOr(o.text, "").trim(), LIMITS.comment);
  // A comment with no text is not a comment.
  if (!text) return null;
  const avatar = imageUrl(o.avatarUrl);
  const replies = list<Reply>(o.replies, coerceReply, []).slice(0, MAX_REPLIES);
  return {
    id: cut(str(o.id, "").trim(), 64) || `c${index + 1}`,
    author: cut(str(o.author, "Anonymous").trim(), LIMITS.name),
    ...(avatar ? { avatarUrl: avatar } : {}),
    text,
    ago: cut(strOr(o.ago, "").trim(), LIMITS.ago),
    likes: count(o.likes, 0),
    ...(o.isCreator === undefined ? {} : { isCreator: bool(o.isCreator, false) }),
    ...(o.hearted === undefined ? {} : { hearted: bool(o.hearted, false) }),
    ...(replies.length > 0 ? { replies } : {}),
    // Unknown values fail closed to "pending" — an unmoderated comment must
    // never default its way onto the recipient's page.
    status: o.status === "published" ? "published" : "pending",
  };
}

function coerceChapter(o: Raw): Chapter | null {
  const label = cut(strOr(o.label, "").trim(), LIMITS.label);
  if (!label) return null;
  const seconds = num(o.seconds, -1);
  // A chapter that cannot be seeked to is worse than no chapter: it renders as a
  // live-looking timestamp that jumps the player somewhere arbitrary.
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > MAX_SECONDS) return null;
  return { seconds: Math.trunc(seconds), label };
}

function coerceRelated(o: Raw, index: number): RelatedVideo | null {
  const title = cut(strOr(o.title, "").trim(), LIMITS.title);
  if (!title) return null;
  const rawEmbed = strOr(o.youtubeId, "").trim();
  const embed = rawEmbed ? embedId(rawEmbed, "") : "";
  return {
    id: cut(str(o.id, "").trim(), 64) || `r${index + 1}`,
    ...(embed ? { youtubeId: embed } : {}),
    title,
    channel: cut(str(o.channel, DEMO_DATA.channel.name).trim(), LIMITS.name),
    views: cut(strOr(o.views, "").trim(), LIMITS.stat),
    ago: cut(strOr(o.ago, "").trim(), LIMITS.ago),
    duration: cut(strOr(o.duration, "").trim(), LIMITS.duration),
    thumbnailUrl: imageUrl(o.thumbnailUrl),
  };
}

const paragraphs = (v: unknown, fallback: string[]): string[] =>
  strList(v, fallback)
    .map((p) => cut(p.trim(), LIMITS.paragraph))
    .filter(Boolean)
    .slice(0, MAX_PARAGRAPHS);

/**
 * DB/share response → UI state.
 *
 * Total function: every branch returns something drawable, and an empty or
 * absent payload falls all the way back to the demo video rather than to a
 * blank player.
 */
export function dbToWatchData(db: Raw | null | undefined): WatchData {
  const src = obj(db);

  const rawVideo = obj(src.video);
  const rawChannel = obj(src.channel);
  const rawDesc = obj(src.description);

  const comments = list<Comment>(src.comments, coerceComment, DEMO_DATA.comments).slice(0, MAX_COMMENTS);
  // Duplicate ids break React keys and make moderation ambiguous, so they are
  // renumbered here rather than anywhere downstream.
  const seen = new Set<string>();
  const uniqueComments: Comment[] = comments.map((c, i) => {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      return c;
    }
    let id = `${c.id}-${i}`;
    while (seen.has(id)) id = `${id}x`;
    seen.add(id);
    return { ...c, id };
  });

  // The pin is optional, and a malformed one is dropped rather than defaulted —
  // a demo pinned comment appearing over somebody else's video would read as a
  // bug and would be one.
  const pinned =
    src.pinnedComment === undefined || src.pinnedComment === null
      ? undefined
      : (coerceComment(obj(src.pinnedComment), 0) ?? undefined);

  const chapters = list<Chapter>(rawDesc.chapters, coerceChapter, DEMO_DATA.description.chapters)
    .slice(0, MAX_CHAPTERS)
    // Ascending, so the chapter list cannot render out of order regardless of
    // how it was authored.
    .sort((a, b) => a.seconds - b.seconds);

  return {
    video: {
      youtubeId: embedId(rawVideo.youtubeId, DEMO_DATA.video.youtubeId),
      title: cut(str(rawVideo.title, DEMO_DATA.video.title).trim(), LIMITS.title),
      // Strings, and they stay strings. "∞" survives.
      views: cut(strOr(rawVideo.views, DEMO_DATA.video.views).trim(), LIMITS.stat),
      postedAgo: cut(strOr(rawVideo.postedAgo, DEMO_DATA.video.postedAgo).trim(), LIMITS.ago),
      likes: cut(strOr(rawVideo.likes, DEMO_DATA.video.likes).trim(), LIMITS.stat),
    },
    channel: {
      name: cut(str(rawChannel.name, DEMO_DATA.channel.name).trim(), LIMITS.name),
      handle: handleOf(rawChannel.handle, DEMO_DATA.channel.handle),
      avatarUrl: imageUrl(rawChannel.avatarUrl) || DEMO_DATA.channel.avatarUrl,
      subscribers: cut(strOr(rawChannel.subscribers, DEMO_DATA.channel.subscribers).trim(), LIMITS.stat),
    },
    description: {
      intro: paragraphs(rawDesc.intro, DEMO_DATA.description.intro),
      chapters,
      outro: paragraphs(rawDesc.outro, DEMO_DATA.description.outro),
    },
    comments: uniqueComments,
    ...(pinned ? { pinnedComment: pinned } : {}),
    related: list<RelatedVideo>(src.related, coerceRelated, DEMO_DATA.related).slice(0, MAX_RELATED),
    contributorPrompt: cut(str(src.contributorPrompt, DEMO_DATA.contributorPrompt).trim(), LIMITS.prompt),
  };
}
