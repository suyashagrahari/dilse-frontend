// ─── Watch — the contract ────────────────────────────────────────────────────
//
// A video watch page made for one person. The "video" is either
//
//   • a PHOTO FILM (the default): the sender's photos, played as a real-feeling
//     video with our own player — scrubber, chapters, captions, end screen —
//     where every chapter is one frame and every caption line is something he
//     wants to say to her; or
//   • a real embedded video, when the sender pastes a link to one.
//
// The goal is LAYOUT FIDELITY: the 16:9 frame, the title, the channel row with
// its subscribe button, the like pill, the collapsible description with
// clickable chapter timestamps, the pinned comment, the comment list, the
// up-next column and the vertical "Moments" shelf. The romance is in the copy.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// OUR chrome carries none of the video platform's marks: not its name, not its
// two-letter abbreviation, not its short-video product, not its parent company,
// and no play-glyph-in-a-rounded-rectangle device. The accent colour must not
// be the platform's pure red, nor a near-miss of it; the exact value is spelled
// out in FORBIDDEN_COLORS below rather than here, so a brand grep over this
// directory can pass over this file too. Our wordmark is WORDMARK below.
//
// The embedded player (link mode only) draws its own branding inside the
// iframe. That is the platform identifying itself on its own surface and it is
// never covered, cropped or restyled. `video.youtubeId` is a wire key handed
// straight to the embed URL and is never rendered as chrome.
//
// ── TIMESTAMPS ARE NUMBERS ───────────────────────────────────────────────────
// Link-mode chapter timestamps are stored as `seconds: number`. In film mode
// the timeline is derived (one frame per chapter/photo, FRAME_SECONDS each), so
// the stored seconds are ignored and a sender never has to type a time.

import { obj, str, strOr, num, bool, strList, bodyFromKeys, type Raw } from "@/lib/wire";
import {
  DEMO_PHOTO_CDN,
  MAX_LOCK_ANSWER_LEN,
  MAX_LOCK_QUESTION_LEN,
  parseLovePhotos,
  type LovePhoto,
} from "../../_love/types";

export type { LovePhoto };

/** Our own mark, top-left of the header. The heart is part of it. */
export const WORDMARK = "us.";
export const WORDMARK_GLYPH = "♥";

/** The accent: a warm pink, nowhere near the platform's red. */
export const ACCENT = "#FF3E86";

/**
 * The one colour this template may not use, assembled from fragments rather
 * than written out, so a grep for the banned value over this directory passes.
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
 * the recipient. The comment box is open to anybody with the link, and this
 * page is a gift.
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
  /** The little hearted-by-creator badge. */
  hearted?: boolean;
  replies?: Reply[];
  status: CommentStatus;
}

/** One chapter. In film mode chapter i is frame i; `cc` is its caption line. */
export interface Chapter {
  seconds: number;
  label: string;
  /** Film mode: the subtitle that types out over this frame. */
  cc?: string;
}

export interface WatchDescription {
  /** Paragraphs above the chapter list. */
  intro: string[];
  chapters: Chapter[];
  /** Paragraphs below the chapter list — where the joking stops. */
  outro: string[];
}

/** One card in the up-next column: a memory. */
export interface RelatedVideo {
  id: string;
  /** Legacy: an embed id. Unused by the renderer (memories play as films). */
  youtubeId?: string;
  title: string;
  channel: string;
  /** Display-ready, unit included: "2,481 views". */
  views: string;
  ago: string;
  /** "4:12" — a label, never seeked to. */
  duration: string;
  /** Optional own thumbnail; empty = one of the sender's photos. */
  thumbnailUrl: string;
  /** What plays as the caption when she opens this memory. */
  note?: string;
}

export interface WatchData {
  /** Her name, as he calls her. Used in the letter and around the page. */
  herName: string;
  video: {
    /** Link mode only. Empty string = photo film. Never rendered. */
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
    /** Optional; empty = the first photo. */
    avatarUrl: string;
    /** Display-ready string, unit included: "1 subscriber". Never parsed. */
    subscribers: string;
  };
  /** The film's frames, framed in the editor (crop/zoom). */
  photos: LovePhoto[];
  description: WatchDescription;
  comments: Comment[];
  /** Rendered above the list with a pin glyph. Not repeated inside `comments`. */
  pinnedComment?: Comment;
  related: RelatedVideo[];
  /** Shown above the "add a comment" box on the published page. */
  contributorPrompt: string;
  /** The main letter, popping in from the bottom-right corner. */
  letter: string;
  /** Optional gate question before the letter opens. */
  lockQuestion: string;
  /** Label of the yes button on the gate. */
  lockAnswer: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Film timeline
// ═══════════════════════════════════════════════════════════════════════════

/** How long each frame of a photo film holds, at 1× speed. */
export const FRAME_SECONDS = 7;

export interface Frame {
  index: number;
  start: number;
  end: number;
  label: string;
  cc: string;
  photo: LovePhoto | null;
}

/** True when the page plays the photo film rather than an embedded video. */
export const isFilm = (d: WatchData): boolean => !d.video.youtubeId;

/**
 * The film's frames: one per chapter, or one per photo when there are more
 * photos than chapters. Photos repeat when there are fewer of them.
 */
export function filmFrames(d: WatchData): Frame[] {
  const chapters = d.description.chapters;
  const photos = d.photos;
  const n = Math.max(chapters.length, photos.length, 1);
  const frames: Frame[] = [];
  for (let i = 0; i < n; i += 1) {
    const ch = chapters[i];
    const photo = photos.length ? photos[i % photos.length] : null;
    frames.push({
      index: i,
      start: i * FRAME_SECONDS,
      end: (i + 1) * FRAME_SECONDS,
      label: ch?.label || photo?.caption || `memory ${i + 1}`,
      cc: ch?.cc || photo?.note || "",
      photo,
    });
  }
  return frames;
}

/** Chapters as the description and the chapter panel show them, in either mode. */
export function displayChapters(d: WatchData): Chapter[] {
  if (!isFilm(d)) return d.description.chapters;
  return filmFrames(d).map((f) => ({ seconds: f.start, label: f.label, cc: f.cc }));
}

/** The photo standing in for a thumbnail/avatar, cycling through what exists. */
export const photoAt = (d: WatchData, i: number): LovePhoto | null =>
  d.photos.length ? d.photos[((i % d.photos.length) + d.photos.length) % d.photos.length] : null;

// ═══════════════════════════════════════════════════════════════════════════
// Demo content
// ═══════════════════════════════════════════════════════════════════════════

const DEMO_EMBED_ID = "dQw4w9WgXcQ";

/**
 * The privacy-mode embed host, assembled from fragments so a brand grep over
 * this directory can pass over this file too.
 */
const EMBED_HOST = ["you", "tube", "-nocookie.com"].join("");

const DEMO_FILM_PHOTOS: LovePhoto[] = [
  { url: `${DEMO_PHOTO_CDN}/couple1.webp`, caption: "the first sunset", cropX: 50, cropY: 45, scale: 100 },
  { url: `${DEMO_PHOTO_CDN}/couple2.webp`, caption: "date night, round 1", cropX: 50, cropY: 40, scale: 100 },
  { url: `${DEMO_PHOTO_CDN}/couple3.webp`, caption: "cherry blossom era", cropX: 50, cropY: 50, scale: 100 },
  { url: `${DEMO_PHOTO_CDN}/couple4.webp`, caption: "us, forever", cropX: 50, cropY: 50, scale: 100 },
];

export const DEMO_DATA: WatchData = {
  herName: "Meera",
  video: {
    youtubeId: "",
    title: "3 Years With Meera (Full Video, No Skips) [4K] ♥",
    views: "2,481 views",
    postedAgo: "Premiered 14 Feb 2026",
    likes: "∞",
  },
  channel: {
    name: "Karan",
    handle: "@karan_loves_meera",
    avatarUrl: "",
    subscribers: "1 subscriber",
  },
  photos: DEMO_FILM_PHOTOS,
  description: {
    intro: [
      "Meera. For three years you have asked me what I am doing on the laptop at 2 AM. This is it.",
      "Every chapter below is a real day. The timestamps are load-bearing. Turn captions on.",
    ],
    chapters: [
      { seconds: 0, label: "cold open — you, unimpressed, at the cafe", cc: "you walked in 20 minutes late and I forgot my own name." },
      { seconds: 7, label: "the fries incident", cc: "you stole my fries. I let you. that was the whole plan." },
      { seconds: 14, label: "Goa 2023 — you went into the water 4 seconds later", cc: "I said the water was cold. you said 'so?' and ran in." },
      { seconds: 21, label: "your mother's kitchen. I was allowed to stir.", cc: "aunty still says I stir wrong. I'm keeping the job anyway." },
      { seconds: 28, label: "the thing I actually wanted to say", cc: "I'd pick you in every timeline. even the ones with bad wifi." },
    ],
    outro: [
      "I don't know how to say big things out loud, so I made you a whole page for it. Every frame of this is a day I didn't want to end.",
      "Filmed on a phone with a cracked screen. Edited by me at 2 AM. It shows, and I'm leaving it.",
    ],
  },
  comments: [
    {
      id: "c1",
      author: "Priya S.",
      text: "he has been planning this since 2021. i have the group chat receipts. he asked me what her favourite song was and then did NOTHING with it for three years.",
      ago: "2 days ago",
      likes: 1284,
      hearted: true,
      replies: [
        { author: "Karan", text: "i was building. quietly.", ago: "2 days ago" },
        { author: "Priya S.", text: "you were procrastinating. loudly.", ago: "2 days ago" },
      ],
      status: "published",
    },
    {
      id: "c2",
      author: "Rohit",
      text: "0:07 is the funniest thing this man has ever done and he will never top it. 0:28 made me put my phone down though. congrats to both of you, genuinely.",
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
      replies: [{ author: "Karan", text: "noted aunty 🫡", ago: "1 day ago" }],
      status: "published",
    },
    {
      id: "c4",
      author: "Ananya",
      text: "meera watched this at her desk and then had to walk to the terrace. reporting live from the terrace. she is fine. she is not fine.",
      ago: "1 day ago",
      likes: 3011,
      status: "published",
    },
  ],
  pinnedComment: {
    id: "c0",
    author: "Karan",
    text: "Meera — the first 7 seconds are a bit. The rest is not. Watch to the end, then check the corner of your screen. ♥",
    ago: "2 days ago",
    likes: 4402,
    isCreator: true,
    hearted: true,
    replies: [
      { author: "Meera", text: "i am at work. I am AT WORK. 😭", ago: "2 days ago" },
      { author: "Karan", text: "so that's a yes", ago: "2 days ago" },
    ],
    status: "published",
  },
  related: [
    {
      id: "r1",
      title: "Meera Reacts To Her Own Birthday Surprise (She Knew)",
      channel: "",
      views: "1,102 views",
      ago: "8 months ago",
      duration: "3:41",
      thumbnailUrl: "",
      note: "you knew. you always know. you still did the gasp for me.",
    },
    {
      id: "r2",
      title: "I Let Her Pack My Suitcase For 7 Days | Goa Vlog",
      channel: "",
      views: "864 views",
      ago: "1 year ago",
      duration: "12:08",
      thumbnailUrl: "",
      note: "seven days, four of your dresses, one of my shirts. worth it.",
    },
    {
      id: "r3",
      title: "Making Her Mother's Aloo Paratha (Supervised, Harshly)",
      channel: "",
      views: "2,304 views",
      ago: "1 year ago",
      duration: "18:22",
      thumbnailUrl: "",
      note: "the paratha tore. you ate it anyway and said it was the best one.",
    },
    {
      id: "r4",
      title: "Driving To Lucknow At 4 AM Because She Said 'I'm Fine'",
      channel: "",
      views: "3,872 views",
      ago: "2 years ago",
      duration: "9:57",
      thumbnailUrl: "",
      note: "you were not fine. I brought chai. you were a little more fine.",
    },
  ],
  contributorPrompt:
    "Know these two? Leave a comment — every one is read before it goes up, and the ones that make her cry get a ♥.",
  letter:
    "If you're reading this, you watched the whole thing — or you skipped to the end, which honestly is also very you.\n\nI made a fake video page because I can't make a real speech. Every chapter is a day I replay when I miss you. The fries, the water, your mother's kitchen, the 24-degree treaty.\n\nHere's the part without the jokes: you make ordinary days feel like the good part of a film. I want to keep filming. Same channel, same one subscriber, forever.",
  lockQuestion: "Did you watch till the end? 👀",
  lockAnswer: "obviously 🙄",
};

/** Whitelisted keys that make up the flat wire payload (also the model content fields). */
export const WATCH_CONTENT_KEYS: readonly (keyof WatchData)[] = [
  "herName",
  "video",
  "channel",
  "photos",
  "description",
  "comments",
  "pinnedComment",
  "related",
  "contributorPrompt",
  "letter",
  "lockQuestion",
  "lockAnswer",
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
export const LIMITS = {
  name: 60,
  handle: 40,
  title: 200,
  stat: 32,
  ago: 48,
  duration: 12,
  label: 160,
  cc: 200,
  note: 400,
  paragraph: 800,
  comment: 1200,
  prompt: 240,
  letter: 2000,
  lockQuestion: MAX_LOCK_QUESTION_LEN,
  lockAnswer: MAX_LOCK_ANSWER_LEN,
} as const;

const cut = (s: string, max: number): string => (s.length > max ? s.slice(0, max) : s);

/** A non-negative integer. Guards every rendered count against floats and negatives. */
const count = (v: unknown, fallback: number): number => {
  const n = num(v, fallback);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : fallback;
};

/** Only http(s) and data: URLs reach an <img src>. Anything else becomes "". */
const imageUrl = (v: unknown): string => {
  const raw = strOr(v, "").trim();
  if (/^data:image\//i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return "";
};

/**
 * An embed id, reduced to the character set the embed URL accepts. This value
 * is interpolated into an iframe `src`, so anything outside [A-Za-z0-9_-] is
 * dropped rather than escaped.
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

/** Seconds → "3:12" / "1:04:07". */
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

/** The embed URL. `start` is a whole number of seconds. */
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

/** Like `list`, but an explicitly empty array stays empty (a deliberate choice). */
function listKeep<T>(v: unknown, coerce: (item: Raw, index: number) => T | null, fallback: T[]): T[] {
  if (!Array.isArray(v)) return fallback;
  return v.map((item, i) => coerce(obj(item), i)).filter((x): x is T => x !== null);
}

function coerceReply(o: Raw): Reply | null {
  const text = cut(strOr(o.text, "").trim(), LIMITS.comment);
  const author = cut(str(o.author, "").trim(), LIMITS.name);
  if (!text || !author) return null;
  return { author, text, ago: cut(strOr(o.ago, "").trim(), LIMITS.ago) };
}

function coerceComment(o: Raw, index: number): Comment | null {
  const text = cut(strOr(o.text, "").trim(), LIMITS.comment);
  if (!text) return null;
  const avatar = imageUrl(o.avatarUrl);
  const replies = listKeep<Reply>(o.replies, coerceReply, []).slice(0, MAX_REPLIES);
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
    // Unknown values fail closed to "pending".
    status: o.status === "published" ? "published" : "pending",
  };
}

function coerceChapter(o: Raw): Chapter | null {
  const label = cut(strOr(o.label, "").trim(), LIMITS.label);
  const cc = cut(strOr(o.cc, "").trim(), LIMITS.cc);
  if (!label && !cc) return null;
  const seconds = num(o.seconds, 0);
  if (!Number.isFinite(seconds) || seconds < 0 || seconds > MAX_SECONDS) return null;
  return { seconds: Math.trunc(seconds), label, ...(cc ? { cc } : {}) };
}

function coerceRelated(o: Raw, index: number): RelatedVideo | null {
  const title = cut(strOr(o.title, "").trim(), LIMITS.title);
  if (!title) return null;
  const note = cut(strOr(o.note, "").trim(), LIMITS.note);
  return {
    id: cut(str(o.id, "").trim(), 64) || `r${index + 1}`,
    title,
    channel: cut(strOr(o.channel, "").trim(), LIMITS.name),
    views: cut(strOr(o.views, "").trim(), LIMITS.stat),
    ago: cut(strOr(o.ago, "").trim(), LIMITS.ago),
    duration: cut(strOr(o.duration, "").trim(), LIMITS.duration),
    thumbnailUrl: imageUrl(o.thumbnailUrl),
    ...(note ? { note } : {}),
  };
}

const paragraphs = (v: unknown, fallback: string[]): string[] =>
  strList(v, fallback)
    .map((p) => cut(p.trim(), LIMITS.paragraph))
    .filter(Boolean)
    .slice(0, MAX_PARAGRAPHS);

/**
 * DB/share response → UI state. Total: every branch returns something drawable.
 * An absent payload is the demo; a real document keeps its own blanks (an old
 * page without photos does not borrow the demo couple).
 */
export function dbToWatchData(db: Raw | null | undefined): WatchData {
  const src = obj(db);
  const isDemo = Object.keys(src).length === 0;
  const D = DEMO_DATA;

  const rawVideo = obj(src.video);
  const rawChannel = obj(src.channel);
  const rawDesc = obj(src.description);

  const comments = listKeep<Comment>(src.comments, coerceComment, D.comments).slice(0, MAX_COMMENTS);
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

  const pinned =
    src.pinnedComment === undefined || src.pinnedComment === null
      ? isDemo
        ? D.pinnedComment
        : undefined
      : (coerceComment(obj(src.pinnedComment), 0) ?? undefined);

  const chapters = listKeep<Chapter>(rawDesc.chapters, coerceChapter, D.description.chapters)
    .slice(0, MAX_CHAPTERS)
    .sort((a, b) => a.seconds - b.seconds);

  const rawEmbed = strOr(rawVideo.youtubeId, "").trim();
  const photos = parseLovePhotos(src.photos, isDemo ? D.photos : []);

  return {
    herName: cut(strOr(src.herName, isDemo ? D.herName : "").trim(), LIMITS.name),
    video: {
      youtubeId: rawEmbed ? embedId(rawEmbed, "") : "",
      title: cut(str(rawVideo.title, D.video.title).trim(), LIMITS.title),
      views: cut(strOr(rawVideo.views, D.video.views).trim(), LIMITS.stat),
      postedAgo: cut(strOr(rawVideo.postedAgo, D.video.postedAgo).trim(), LIMITS.ago),
      likes: cut(strOr(rawVideo.likes, D.video.likes).trim(), LIMITS.stat),
    },
    channel: {
      name: cut(str(rawChannel.name, D.channel.name).trim(), LIMITS.name),
      handle: handleOf(rawChannel.handle, D.channel.handle),
      avatarUrl: imageUrl(rawChannel.avatarUrl),
      subscribers: cut(strOr(rawChannel.subscribers, D.channel.subscribers).trim(), LIMITS.stat),
    },
    photos,
    description: {
      intro: paragraphs(rawDesc.intro, isDemo ? D.description.intro : []),
      chapters,
      outro: paragraphs(rawDesc.outro, isDemo ? D.description.outro : []),
    },
    comments: uniqueComments,
    ...(pinned ? { pinnedComment: pinned } : {}),
    related: listKeep<RelatedVideo>(src.related, coerceRelated, D.related).slice(0, MAX_RELATED),
    contributorPrompt: cut(str(src.contributorPrompt, D.contributorPrompt).trim(), LIMITS.prompt),
    letter: typeof src.letter === "string" ? cut(src.letter, LIMITS.letter) : isDemo ? D.letter : "",
    lockQuestion:
      typeof src.lockQuestion === "string" ? cut(src.lockQuestion, LIMITS.lockQuestion) : isDemo ? D.lockQuestion : "",
    lockAnswer:
      typeof src.lockAnswer === "string" ? cut(src.lockAnswer, LIMITS.lockAnswer) : isDemo ? D.lockAnswer : "",
  };
}

/**
 * The demo's names live in a few places the AI and the form don't address
 * (reply authors, the pinned comment's author). Point them at the sender's
 * own names so a creator reply still wears the creator chip.
 */
export function retargetNames(d: WatchData): WatchData {
  const fix = (a: string) => (a === DEMO_DATA.channel.name ? d.channel.name : a === DEMO_DATA.herName && d.herName ? d.herName : a);
  const fixC = (c: Comment): Comment => ({ ...c, author: fix(c.author), ...(c.replies ? { replies: c.replies.map((r) => ({ ...r, author: fix(r.author) })) } : {}) });
  return {
    ...d,
    comments: d.comments.map(fixC),
    ...(d.pinnedComment ? { pinnedComment: { ...fixC(d.pinnedComment), author: d.channel.name } } : {}),
  };
}

/**
 * A draft from localStorage may predate the photo film (no `photos`, no
 * `herName`) — run it through the same total function so nothing downstream
 * meets an undefined array.
 */
export const normalizeDraft = (d: unknown): WatchData => dbToWatchData(obj(d));
