"use client";

// ─── Us — the post detail ────────────────────────────────────────────────────
//
// THE OTHER DETAIL THAT DECIDES THIS TEMPLATE: the double-tap heart.
//
// It is the first thing anyone tries, so it is built properly rather than
// approximated:
//
//   • Two taps inside DOUBLE_TAP_WINDOW_MS on the photo like the post and throw
//     a large white heart over the centre of it — scale 0 → 1.2 → 1.0, held,
//     then faded out across TIMING.bigHeartMs. It is keyed on a counter, so
//     tapping again mid-flight restarts the animation instead of doing nothing.
//   • The heart in the action row is the same action with a different gesture:
//     it fills `likeRed` and bounces 1.0 → 1.25 → 1.0 over TIMING.heartBounceMs.
//   • Both go through one debounced `like()`. Rapid taps cannot double-count —
//     the count moves at most once per TIMING.likeDebounceMs — but the *visual*
//     is never debounced, because a heart that ignores your finger feels broken
//     even when the number underneath it is right.
//   • A double-tap on an already-liked post still throws the heart and still
//     does not increment. That is what the real gesture does.
//
// Under prefers-reduced-motion there is no slide-in, no bounce and no big
// heart. The like, the count and the comment box all still work.

import { useCallback, useRef, useState } from "react";
import Photo from "./Photo";
import {
  BackChevron,
  BookmarkIcon,
  CommentIcon,
  DotsMenu,
  HeartIcon,
  SendIcon,
} from "./icons";
import { useTransient } from "./hooks";
import { anim } from "./styles";
import { COPY, METRICS, PALETTE, TIMING, formatStat, type Comment, type Post } from "./types";

/** Two taps closer together than this are one double-tap. */
const DOUBLE_TAP_WINDOW_MS = 300;

/**
 * Captions longer than this are clamped to two lines behind `COPY.more`.
 *
 * A character count, not a measurement: measuring needs a layout pass, and a
 * layout pass that has not settled yet is how you get a "more" link on a
 * caption that already fits. At 14px in the system stack inside a 380px column
 * a line holds roughly 46 characters, so two lines is ~92 including the handle.
 */
const CAPTION_CLAMP_CHARS = 92;

export interface PostDetailProps {
  post: Post;
  handle: string;
  avatarUrl: string;
  reduced: boolean;
  onBack: () => void;
  onNothing: () => void;
}

export default function PostDetail({
  post,
  handle,
  avatarUrl,
  reduced,
  onBack,
  onNothing,
}: PostDetailProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");

  const [bouncing, fireBounce] = useTransient(TIMING.heartBounceMs);
  const [bursting, fireBurst] = useTransient(TIMING.bigHeartMs);
  // Remounts the big heart so a second double-tap restarts the animation.
  const [burstKey, setBurstKey] = useState(0);

  // Both clocks are written and read from event handlers only — never during
  // render, and never from an effect cleanup — so neither hooks rule applies.
  const lastTapAt = useRef(0);
  const lastLikeAt = useRef(0);

  /**
   * The single debounced mutation. Every setter call below is a pure updater or
   * a plain value: an updater that calls another setter runs twice in Strict
   * Mode and double-counts the like, which is precisely the bug the debounce is
   * supposed to be preventing.
   */
  const like = useCallback(
    (force: boolean): void => {
      const now = Date.now();
      if (now - lastLikeAt.current < TIMING.likeDebounceMs) return;
      lastLikeAt.current = now;

      if (force) {
        // Double-tap only ever likes. It never takes a like away.
        if (liked) return;
        setLiked(true);
        setLikes((n) => n + 1);
        return;
      }
      setLiked(!liked);
      setLikes((n) => (liked ? Math.max(0, n - 1) : n + 1));
    },
    [liked],
  );

  const onHeartTap = useCallback(() => {
    if (!reduced) fireBounce();
    like(false);
  }, [like, fireBounce, reduced]);

  const onPhotoTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapAt.current <= DOUBLE_TAP_WINDOW_MS) {
      lastTapAt.current = 0;
      // The burst is NOT debounced. A heart that ignores your finger reads as
      // broken even when the number underneath it is correct.
      if (!reduced) {
        setBurstKey((k) => k + 1);
        fireBurst();
      }
      like(true);
      return;
    }
    lastTapAt.current = now;
  }, [like, fireBurst, reduced]);

  const submit = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    // TODO(us): POST this back to the sender so the reply reaches them. Until
    // that endpoint exists it lives for the length of this session only, which
    // is honest — nothing is silently dropped into a void that looks like a send.
    setAdded((prev) => [...prev, { handle, text, likes: 0 }]);
    setDraft("");
  }, [draft, handle]);

  const comments = added.length > 0 ? [...post.comments, ...added] : post.comments;
  const captionLong = handle.length + 1 + post.caption.length > CAPTION_CLAMP_CHARS;
  const clamped = captionLong && !expanded;

  const iconRow = { display: "flex", alignItems: "center", gap: 16 };

  return (
    <div
      role="dialog"
      aria-label="Post"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 155,
        margin: "0 auto",
        maxWidth: METRICS.desktopColumn,
        background: PALETTE.bg,
        display: "flex",
        flexDirection: "column",
        animation: anim(reduced, "us-slide-in", TIMING.slideMs, "cubic-bezier(0.16,1,0.3,1)"),
      }}
    >
      {/* ── 54px header ─────────────────────────────────────────────────── */}
      <div
        style={{
          height: METRICS.postHeaderH,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 12px",
          borderBottom: `1px solid ${PALETTE.border}`,
        }}
      >
        <button
          type="button"
          className="us-tap"
          aria-label="Back"
          onClick={onBack}
          style={{ width: 24, height: 24, display: "grid", placeItems: "center", flexShrink: 0 }}
        >
          <BackChevron size={24} color={PALETTE.ink} />
        </button>

        <div
          style={{
            position: "relative",
            width: 32,
            height: 32,
            borderRadius: "50%",
            overflow: "hidden",
            border: `1px solid ${PALETTE.border}`,
            flexShrink: 0,
          }}
        >
          <Photo src={avatarUrl} alt="" sizes="32px" glyphSize={14} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              lineHeight: "16px",
              color: PALETTE.ink,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {handle}
          </div>
          {post.location ? (
            <div
              style={{
                fontSize: 11,
                lineHeight: "14px",
                color: PALETTE.ink,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {post.location}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="us-tap"
          aria-label="More options"
          onClick={onNothing}
          style={{ width: 24, height: 24, display: "grid", placeItems: "center", flexShrink: 0 }}
        >
          <DotsMenu size={24} color={PALETTE.ink} />
        </button>
      </div>

      {/* ── Scrolling body ──────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* The photo. Square, cover, and the double-tap surface. */}
        <div
          onClick={onPhotoTap}
          className="us-no-select"
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            background: PALETTE.button,
            overflow: "hidden",
            touchAction: "manipulation",
            cursor: "pointer",
          }}
        >
          <Photo
            src={post.imageUrl}
            alt={post.caption ? post.caption.slice(0, 120) : "Post photo"}
            sizes="420px"
            glyphSize={40}
            priority
          />
          {bursting ? (
            <div
              key={burstKey}
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                pointerEvents: "none",
                animation: `us-big-heart ${TIMING.bigHeartMs}ms cubic-bezier(0.16,1,0.3,1) both`,
              }}
            >
              <HeartIcon
                size={104}
                color="#FFFFFF"
                filled
                style={{ filter: `drop-shadow(${PALETTE.glyphShadow})` }}
              />
            </div>
          ) : null}
        </div>

        {/* ── 44px action row ───────────────────────────────────────────── */}
        <div
          style={{
            height: METRICS.actionRowH,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `0 ${METRICS.pagePad}px`,
          }}
        >
          <div style={iconRow}>
            <button
              type="button"
              className="us-tap"
              aria-label={liked ? "Unlike" : "Like"}
              aria-pressed={liked}
              onClick={onHeartTap}
              style={{
                width: 24,
                height: 24,
                display: "grid",
                placeItems: "center",
                animation: bouncing
                  ? `us-heart-pop ${TIMING.heartBounceMs}ms ease-out both`
                  : undefined,
              }}
            >
              <HeartIcon size={24} color={liked ? PALETTE.likeRed : PALETTE.ink} filled={liked} />
            </button>
            <button
              type="button"
              className="us-tap"
              aria-label="Comment"
              onClick={onNothing}
              style={{ width: 24, height: 24, display: "grid", placeItems: "center" }}
            >
              <CommentIcon size={24} color={PALETTE.ink} />
            </button>
            <button
              type="button"
              className="us-tap"
              aria-label="Share"
              onClick={onNothing}
              style={{ width: 24, height: 24, display: "grid", placeItems: "center" }}
            >
              <SendIcon size={24} color={PALETTE.ink} />
            </button>
          </div>
          <button
            type="button"
            className="us-tap"
            aria-label={saved ? "Remove from saved" : "Save"}
            aria-pressed={saved}
            onClick={() => setSaved((s) => !s)}
            style={{ width: 24, height: 24, display: "grid", placeItems: "center" }}
          >
            <BookmarkIcon size={24} color={PALETTE.ink} filled={saved} />
          </button>
        </div>

        {/* ── Likes, caption, comments, timestamp ───────────────────────── */}
        <div style={{ padding: `0 ${METRICS.pagePad}px 20px` }}>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: "18px", color: PALETTE.ink }}>
            {post.likedByName ? (
              <>
                Liked by <span style={{ fontWeight: 600 }}>{post.likedByName}</span> and{" "}
                {formatStat(likes)} others
              </>
            ) : (
              <>{formatStat(likes)} likes</>
            )}
          </div>

          {post.caption ? (
            <div style={{ marginTop: 6 }}>
              <div
                className={clamped ? "us-clamp-2" : undefined}
                style={{ fontSize: 14, lineHeight: "18px", color: PALETTE.ink, overflowWrap: "anywhere" }}
              >
                <span style={{ fontWeight: 600 }}>{handle}</span> {post.caption}
              </div>
              {clamped ? (
                <button
                  type="button"
                  className="us-tap"
                  onClick={() => setExpanded(true)}
                  style={{ fontSize: 14, lineHeight: "18px", color: PALETTE.greyIcon }}
                >
                  {COPY.more}
                </button>
              ) : null}
            </div>
          ) : null}

          {comments.length > 0 ? (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
              {comments.map((c, i) => (
                <div key={`${c.handle}-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, lineHeight: "18px", color: PALETTE.ink, overflowWrap: "anywhere" }}>
                      <span style={{ fontWeight: 600 }}>{c.handle}</span> {c.text}
                    </div>
                    <button
                      type="button"
                      className="us-tap"
                      onClick={onNothing}
                      style={{ fontSize: 12, lineHeight: "16px", color: PALETTE.grey, marginTop: 3 }}
                    >
                      {COPY.reply}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="us-tap"
                    aria-label="Like comment"
                    onClick={onNothing}
                    style={{ width: 12, height: 12, marginTop: 3, flexShrink: 0 }}
                  >
                    <HeartIcon size={12} color={PALETTE.greyIcon} strokeWidth={2.4} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {post.postedAgo ? (
            <div
              style={{
                marginTop: 14,
                fontSize: 10,
                lineHeight: "13px",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                color: PALETTE.grey,
              }}
            >
              {post.postedAgo}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Comment input, pinned ───────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: `8px ${METRICS.pagePad}px`,
          paddingBottom: "max(8px, env(safe-area-inset-bottom, 0px))",
          borderTop: `1px solid ${PALETTE.border}`,
          background: PALETTE.bg,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 28,
            height: 28,
            borderRadius: "50%",
            overflow: "hidden",
            border: `1px solid ${PALETTE.border}`,
            flexShrink: 0,
          }}
        >
          <Photo src={avatarUrl} alt="" sizes="28px" glyphSize={12} />
        </div>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={COPY.addComment}
          aria-label={COPY.addComment}
          maxLength={300}
          style={{
            flex: 1,
            minWidth: 0,
            border: 0,
            outline: "none",
            background: "transparent",
            fontSize: 14,
            lineHeight: "18px",
            color: PALETTE.ink,
          }}
        />
        {draft.trim() ? (
          <button
            type="submit"
            className="us-tap"
            style={{ fontSize: 14, fontWeight: 600, color: PALETTE.actionBlue, flexShrink: 0 }}
          >
            Post
          </button>
        ) : null}
      </form>
    </div>
  );
}
