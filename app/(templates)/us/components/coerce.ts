// ─── Us — wire coercion ──────────────────────────────────────────────────────
//
// Runs on the recipient's page (untrusted, possibly older payloads), on Save in
// the editor (so the preview is byte-for-byte what the recipient sees) and
// after an AI fill (which writes comments as "handle: text" strings). Total:
// never throws, never hands the renderer something it cannot draw.
//
// An EMPTY payload falls back to the demo. A real page that simply predates a
// field (no letter, no DMs, no names) gets the empty value — never the demo
// couple's names or letter.

import { obj, str, strOr, num, list, strList, type Raw } from "@/lib/wire";
import {
  DEMO_DATA,
  MAX_BIO_LINES,
  MAX_COMMENTS,
  MAX_DMS,
  MAX_FOLLOWED_BY,
  MAX_HIGHLIGHTS,
  MAX_HIGHLIGHT_SLIDES,
  MAX_LETTER,
  MAX_LOCK_A,
  MAX_LOCK_Q,
  MAX_MORE,
  MAX_NOTE,
  MAX_PINNED,
  MAX_POSTS,
} from "./data";
import { parseCommentLine, type Comment, type Crop, type Frame, type Highlight, type HighlightSlide, type Post, type ProfileData } from "./types";

const LIMITS = {
  name: 40,
  handle: 40,
  displayName: 60,
  category: 60,
  bioLine: 140,
  linkLabel: 80,
  caption: 600,
  commentText: 300,
  postedAgo: 40,
  location: 80,
  highlightTitle: 60,
  slideCaption: 200,
  dm: 300,
} as const;

const cut = (s: string, max: number): string => (s.length > max ? s.slice(0, max) : s);
const text = (v: unknown, max: number): string => cut(strOr(v, "").trim(), max);

const count = (v: unknown, fallback: number): number => {
  const n = num(v, fallback);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : fallback;
};

const handleOf = (v: unknown, fallback: string, max: number): string =>
  cut(str(v, fallback).trim().replace(/^@+/, "").replace(/\s+/g, "_"), max) || fallback;

/** Only http(s) and data:image URLs reach an <img src>. */
const imageUrl = (v: unknown): string => {
  const raw = strOr(v, "").trim();
  if (!raw) return "";
  if (/^data:image\//i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return "";
};

const linkUrl = (v: unknown): string => {
  const raw = strOr(v, "").trim();
  return /^https?:\/\//i.test(raw) ? raw : "";
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function coerceCrop(v: unknown): Crop | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Raw;
  const x = Number(o.x);
  const y = Number(o.y);
  const scale = Number(o.scale);
  if (![x, y, scale].every(Number.isFinite)) return undefined;
  const c = { x: clamp(x, 0, 100), y: clamp(y, 0, 100), scale: clamp(scale, 100, 300) };
  // The default framing is the same as no framing — keep the payload lean.
  if (c.x === 50 && c.y === 50 && c.scale === 100) return undefined;
  return c;
}

const withCrop = <T extends object>(base: T, crop: Crop | undefined): T => (crop ? { ...base, crop } : base);

function coerceComment(raw: unknown): Comment | null {
  if (typeof raw === "string") {
    const c = parseCommentLine(raw);
    return c ? { handle: cut(c.handle, LIMITS.handle), text: cut(c.text, LIMITS.commentText), likes: 0 } : null;
  }
  const o = obj(raw);
  const handle = handleOf(o.handle, "", LIMITS.handle);
  const t = text(o.text, LIMITS.commentText);
  if (!handle || !t) return null;
  return { handle, text: t, likes: count(o.likes, 0) };
}

function coerceComments(v: unknown): Comment[] {
  if (!Array.isArray(v)) return [];
  return v.map(coerceComment).filter((c): c is Comment => c !== null).slice(0, MAX_COMMENTS);
}

function coerceFrame(o: Raw): Frame | null {
  const url = imageUrl(o.url);
  if (!url) return null;
  return withCrop({ url }, coerceCrop(o.crop));
}

function coercePost(o: Raw, index: number): Post | null {
  const img = imageUrl(o.imageUrl);
  const caption = text(o.caption, LIMITS.caption);
  if (!img && !caption) return null;
  const more = list<Frame>(o.more, coerceFrame, []).slice(0, MAX_MORE);
  const post: Post = {
    id: str(o.id, "").trim().slice(0, 64) || `p${index + 1}`,
    imageUrl: img,
    caption,
    likes: count(o.likes, 0),
    likedByName: handleOf(o.likedByName, "", LIMITS.handle),
    postedAgo: text(o.postedAgo, LIMITS.postedAgo),
    comments: coerceComments(o.comments),
  };
  const crop = coerceCrop(o.crop);
  if (crop) post.crop = crop;
  if (more.length) post.more = more;
  const loc = text(o.location, LIMITS.location);
  if (loc) post.location = loc;
  if (o.isMultiple === true) post.isMultiple = true;
  if (o.isVideo === true) post.isVideo = true;
  return post;
}

function coerceSlide(o: Raw): HighlightSlide | null {
  const img = imageUrl(o.imageUrl);
  if (!img) return null;
  const slide: HighlightSlide = withCrop({ imageUrl: img }, coerceCrop(o.crop));
  const caption = text(o.caption, LIMITS.slideCaption);
  if (caption) slide.caption = caption;
  return slide;
}

function coerceHighlight(o: Raw): Highlight | null {
  const title = text(o.title, LIMITS.highlightTitle);
  const slides = list<HighlightSlide>(o.slides, coerceSlide, []).slice(0, MAX_HIGHLIGHT_SLIDES);
  if (slides.length === 0) return null;
  return { title: title || "✨", coverUrl: imageUrl(o.coverUrl) || slides[0].imageUrl, slides };
}

export function dbToProfileData(db: Raw | null | undefined): ProfileData {
  const src = obj(db);
  if (Object.keys(src).length === 0) return DEMO_DATA;

  const posts = list<Post>(src.posts, coercePost, []).slice(0, MAX_POSTS);
  const seen = new Set<string>();
  const uniquePosts: Post[] = posts.map((p, i) => {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      return p;
    }
    let id = `${p.id}-${i}`;
    while (seen.has(id)) id = `${id}x`;
    seen.add(id);
    return { ...p, id };
  });

  const rawStats = obj(src.stats);
  const rawLink = obj(src.link);
  const href = linkUrl(rawLink.url);
  const label = text(rawLink.label, LIMITS.linkLabel);

  const out: ProfileData = {
    from: text(src.from, LIMITS.name),
    to: text(src.to, LIMITS.name),
    handle: handleOf(src.handle, "us.two", LIMITS.handle),
    displayName: text(src.displayName, LIMITS.displayName),
    category: text(src.category, LIMITS.category),
    bio: strList(src.bio, [])
      .map((l) => cut(l.trim(), LIMITS.bioLine))
      .filter(Boolean)
      .slice(0, MAX_BIO_LINES),
    link: href ? { label: label || href.replace(/^https?:\/\//, ""), url: href } : undefined,
    avatarUrl: imageUrl(src.avatarUrl) || uniquePosts.find((p) => p.imageUrl)?.imageUrl || "",
    note: text(src.note, MAX_NOTE),
    stats: {
      posts: count(rawStats.posts, uniquePosts.length),
      followers: count(rawStats.followers, 0),
      following: count(rawStats.following, 0),
    },
    followedBy: strList(src.followedBy, [])
      .map((h) => handleOf(h, "", LIMITS.handle))
      .filter(Boolean)
      .slice(0, MAX_FOLLOWED_BY),
    highlights: list<Highlight>(src.highlights, coerceHighlight, []).slice(0, MAX_HIGHLIGHTS),
    posts: uniquePosts,
    pinnedPostIds: Array.from(new Set(strList(src.pinnedPostIds, [])))
      .filter((id) => uniquePosts.some((p) => p.id === id))
      .slice(0, MAX_PINNED),
    dms: strList(src.dms, [])
      .map((m) => cut(m.trim(), LIMITS.dm))
      .filter(Boolean)
      .slice(0, MAX_DMS),
    letter: cut(strOr(src.letter, ""), MAX_LETTER),
    lockQuestion: text(src.lockQuestion, MAX_LOCK_Q),
    lockAnswer: text(src.lockAnswer, MAX_LOCK_A),
  };
  const avatarCrop = coerceCrop(src.avatarCrop);
  if (avatarCrop) out.avatarCrop = avatarCrop;
  return out;
}
