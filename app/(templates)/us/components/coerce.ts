// ─── Us — wire coercion ──────────────────────────────────────────────────────
//
// This runs on the recipient's published page, where the payload is untrusted
// input: it may be older than the current shape, partially filled, or actively
// malformed. Nothing in here is allowed to throw and nothing is allowed to hand
// the renderer a value it cannot draw.
//
// Two repairs matter more than the rest, because both fail *silently* rather
// than loudly:
//
//   1. `pinnedPostIds` is capped at 3 and every id that does not resolve to a
//      real post is dropped. A stale id does not crash `orderedPosts` — it just
//      quietly produces a grid whose order disagrees with the pin glyphs.
//   2. The three stats are forced to non-negative integers. `formatStat` is
//      handed them directly, and a float or a negative renders as "-1,847" or
//      "84.7000000001K" in 18px semibold at the top of the profile.
//
// Kept out of types.ts on purpose: that file is the frozen contract.

import { obj, str, strOr, num, list, strList, type Raw } from "@/lib/wire";
import { DEMO_DATA, MAX_POSTS, MAX_HIGHLIGHTS, MAX_HIGHLIGHT_SLIDES, MAX_BIO_LINES, MAX_COMMENTS, MAX_FOLLOWED_BY, MAX_PINNED } from "./data";
import type { Comment, Highlight, HighlightSlide, Post, ProfileData } from "./types";

/** Hard caps on free text, so one pasted essay cannot destroy the header. */
const LIMITS = {
  handle: 40,
  displayName: 60,
  category: 60,
  bioLine: 140,
  linkLabel: 80,
  caption: 600,
  commentText: 300,
  commentHandle: 40,
  postedAgo: 40,
  location: 80,
  highlightTitle: 60,
  slideCaption: 200,
} as const;

const cut = (s: string, max: number): string => (s.length > max ? s.slice(0, max) : s);

/** A non-negative integer. Guards `formatStat` against floats and negatives. */
const count = (v: unknown, fallback: number): number => {
  const n = num(v, fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.trunc(n));
};

/** A handle with the leading @ and any whitespace removed. */
const handleOf = (v: unknown, fallback: string, max: number): string =>
  cut(str(v, fallback).trim().replace(/^@+/, "").replace(/\s+/g, "_"), max) || fallback;

/**
 * Only http(s) and data: URLs reach an <img src>. Anything else — `javascript:`
 * most of all — becomes the empty string, which the renderer already knows how
 * to draw as the grey fallback cell.
 */
const imageUrl = (v: unknown): string => {
  const raw = strOr(v, "").trim();
  if (!raw) return "";
  if (/^data:image\//i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return "";
};

/** Link targets are navigable, so they are http(s) only — never data:. */
const linkUrl = (v: unknown): string => {
  const raw = strOr(v, "").trim();
  return /^https?:\/\//i.test(raw) ? raw : "";
};

function coerceComment(o: Raw): Comment | null {
  const handle = handleOf(o.handle, "", LIMITS.commentHandle);
  const text = cut(strOr(o.text, "").trim(), LIMITS.commentText);
  if (!handle || !text) return null;
  return { handle, text, likes: count(o.likes, 0) };
}

function coercePost(o: Raw, index: number): Post | null {
  // A post with neither a photo nor a caption is not a post.
  const img = imageUrl(o.imageUrl);
  const caption = cut(strOr(o.caption, "").trim(), LIMITS.caption);
  if (!img && !caption) return null;
  return {
    id: str(o.id, "").trim() || `p${index + 1}`,
    imageUrl: img,
    caption,
    likes: count(o.likes, 0),
    likedByName: handleOf(o.likedByName, "", LIMITS.commentHandle),
    postedAgo: cut(strOr(o.postedAgo, "").trim(), LIMITS.postedAgo),
    location: cut(strOr(o.location, "").trim(), LIMITS.location) || undefined,
    isMultiple: o.isMultiple === true,
    isVideo: o.isVideo === true,
    comments: list<Comment>(o.comments, coerceComment, []).slice(0, MAX_COMMENTS),
  };
}

function coerceSlide(o: Raw): HighlightSlide | null {
  const img = imageUrl(o.imageUrl);
  if (!img) return null;
  const caption = cut(strOr(o.caption, "").trim(), LIMITS.slideCaption);
  return caption ? { imageUrl: img, caption } : { imageUrl: img };
}

function coerceHighlight(o: Raw): Highlight | null {
  const title = cut(strOr(o.title, "").trim(), LIMITS.highlightTitle);
  const slides = list<HighlightSlide>(o.slides, coerceSlide, []).slice(0, MAX_HIGHLIGHT_SLIDES);
  // A highlight bubble that opens onto nothing is worse than no bubble.
  if (!title || slides.length === 0) return null;
  return { title, coverUrl: imageUrl(o.coverUrl) || slides[0].imageUrl, slides };
}

/**
 * Server payload → the shape the renderer is allowed to see.
 *
 * Total function: every branch returns something drawable, and an empty or
 * absent payload falls all the way back to the demo profile rather than to a
 * blank screen.
 */
export function dbToProfileData(db: Raw | null | undefined): ProfileData {
  const src = obj(db);

  const posts = list<Post>(src.posts, coercePost, DEMO_DATA.posts).slice(0, MAX_POSTS);

  // Duplicate ids break React keys AND make `pinnedPostIds` ambiguous, so they
  // are renumbered here rather than anywhere downstream.
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
  const bio = strList(src.bio, DEMO_DATA.bio)
    .map((l) => cut(l.trim(), LIMITS.bioLine))
    .filter(Boolean)
    .slice(0, MAX_BIO_LINES);

  const rawLink = obj(src.link);
  const href = linkUrl(rawLink.url);
  const label = cut(strOr(rawLink.label, "").trim(), LIMITS.linkLabel);

  return {
    handle: handleOf(src.handle, DEMO_DATA.handle, LIMITS.handle),
    displayName: cut(str(src.displayName, DEMO_DATA.displayName).trim(), LIMITS.displayName),
    category: cut(strOr(src.category, "").trim(), LIMITS.category),
    // strList already dropped blanks; if everything was blank, keep the demo bio
    // rather than render a header with a hole in it.
    bio: bio.length > 0 ? bio : DEMO_DATA.bio,
    // A label with no working target is a dead blue line — drop the pair.
    link: href ? { label: label || href, url: href } : undefined,
    avatarUrl: imageUrl(src.avatarUrl) || DEMO_DATA.avatarUrl,
    stats: {
      posts: count(rawStats.posts, uniquePosts.length),
      followers: count(rawStats.followers, 0),
      following: count(rawStats.following, 0),
    },
    followedBy: strList(src.followedBy, [])
      .map((h) => handleOf(h, "", LIMITS.commentHandle))
      .filter(Boolean)
      .slice(0, MAX_FOLLOWED_BY),
    highlights: list<Highlight>(src.highlights, coerceHighlight, []).slice(0, MAX_HIGHLIGHTS),
    posts: uniquePosts,
    // Capped at 3, de-duplicated, and every id proven to resolve to a real post.
    pinnedPostIds: Array.from(new Set(strList(src.pinnedPostIds, [])))
      .filter((id) => uniquePosts.some((p) => p.id === id))
      .slice(0, MAX_PINNED),
  };
}
