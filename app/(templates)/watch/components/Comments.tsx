"use client";

// ─── Comments ────────────────────────────────────────────────────────────────
//
// The pinned comment is the sender talking. Everything under it is other
// people, and on a published page most of it arrived from a link somebody
// forwarded to a group chat — which is why nothing appears here until it has
// been approved. This component never decides that; it is handed a list that is
// already public.
//
// Both sort orders are real. "Top comments" is by likes; "Newest first" is the
// arrival order reversed, and a contribution that landed thirty seconds ago is
// genuinely the newest thing on the page.
//
// A 200-character word with no spaces in it is a normal thing for a friend to
// send, so every block of user text on this page carries `overflow-wrap:
// anywhere`. Nothing here can push the column sideways.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sheet from "./Sheet";
import type { Comment } from "./types";
import {
  ChevronGlyph,
  FONT,
  HeartGlyph,
  InitialsAvatar,
  PinGlyph,
  SafeImage,
  T,
  ThumbGlyph,
} from "./theme";

export type CommentSort = "top" | "new";

const SORT_LABEL: Record<CommentSort, string> = {
  top: "Top comments",
  new: "Newest first",
};

/** Four lines of 14/20, plus a hair for descenders. */
const BODY_CLAMP_PX = 82;

export interface CommentsProps {
  comments: readonly Comment[];
  pinnedComment?: Comment;
  channelName: string;
  onToast: (message: string) => void;
  /** Live page only: the ask that goes above the composer. */
  contributorPrompt?: string;
}

export default function Comments({
  comments,
  pinnedComment,
  channelName,
  onToast,
  contributorPrompt,
}: CommentsProps) {
  const [sort, setSort] = useState<CommentSort>("top");
  const [sortOpen, setSortOpen] = useState(false);
  const [mine, setMine] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");
  const [composing, setComposing] = useState(false);

  const all = useMemo(() => [...comments, ...mine], [comments, mine]);

  const ordered = useMemo(() => {
    const indexed = all.map((c, i) => ({ c, i }));
    if (sort === "top") {
      indexed.sort((a, b) => (b.c.likes - a.c.likes) || (a.i - b.i));
    } else {
      indexed.sort((a, b) => b.i - a.i);
    }
    return indexed.map((x) => x.c);
  }, [all, sort]);

  const count = all.length + (pinnedComment ? 1 : 0);

  const post = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    setMine((prev) => [
      ...prev,
      {
        id: `me-${Date.now()}`,
        author: "You",
        text,
        ago: "just now",
        likes: 0,
        status: "published",
      },
    ]);
    setDraft("");
    setComposing(false);
    onToast("Added. Only you can see this one.");
  }, [draft, onToast]);

  return (
    <section className="wt-comments">
      <header className="wt-comments-head">
        <h2 className="wt-comments-count">
          {count} {count === 1 ? "Comment" : "Comments"}
        </h2>
        <button type="button" className="wt-sort" onClick={() => setSortOpen(true)}>
          <span className="wt-sort-bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {SORT_LABEL[sort]}
          <ChevronGlyph size={14} color={T.ink} />
        </button>
      </header>

      {contributorPrompt ? <p className="wt-comments-prompt">{contributorPrompt}</p> : null}

      <div className="wt-add">
        <InitialsAvatar name="You" size={40} />
        <div className="wt-add-body">
          <input
            className="wt-add-input"
            value={draft}
            placeholder="Add a comment…"
            maxLength={600}
            onFocus={() => setComposing(true)}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") post();
            }}
            aria-label="Add a comment"
          />
          {composing ? (
            <div className="wt-add-actions">
              <button
                type="button"
                className="wt-ghost"
                onClick={() => {
                  setDraft("");
                  setComposing(false);
                }}
              >
                Cancel
              </button>
              <button type="button" className="wt-primary" onClick={post} disabled={!draft.trim()}>
                Comment
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {pinnedComment ? (
        <>
          <p className="wt-pinned-by">
            <PinGlyph size={13} color={T.inkSoft} />
            Pinned by {channelName}
          </p>
          <CommentRow comment={pinnedComment} onToast={onToast} />
        </>
      ) : null}

      {ordered.length === 0 && !pinnedComment ? (
        <p className="wt-empty">No comments yet. Be the first.</p>
      ) : (
        <ul className="wt-comment-list">
          {ordered.map((c) => (
            <li key={c.id}>
              <CommentRow comment={c} onToast={onToast} />
            </li>
          ))}
        </ul>
      )}

      <Sheet open={sortOpen} title="Sort by" onClose={() => setSortOpen(false)}>
        {(["top", "new"] as const).map((option) => (
          <button
            key={option}
            type="button"
            className="wt-sheet-item"
            onClick={() => {
              setSort(option);
              setSortOpen(false);
            }}
            aria-pressed={sort === option}
          >
            <span style={{ width: 18, color: T.accent }}>{sort === option ? "•" : ""}</span>
            {SORT_LABEL[option]}
          </button>
        ))}
      </Sheet>
    </section>
  );
}

/* ── One comment ───────────────────────────────────────────────────────────── */

function CommentRow({ comment, onToast }: { comment: Comment; onToast: (m: string) => void }) {
  const [liked, setLiked] = useState(false);
  const [openReplies, setOpenReplies] = useState(false);

  const likes = comment.likes + (liked ? 1 : 0);
  const replies = comment.replies ?? [];

  return (
    <article className="wt-comment">
      <span className="wt-comment-avatar">
        <SafeImage
          src={comment.avatarUrl ?? ""}
          alt=""
          fallback={<InitialsAvatar name={comment.author} size={40} />}
          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", display: "block" }}
        />
        {comment.hearted ? (
          <span className="wt-heart-badge" title="Hearted">
            <HeartGlyph size={11} color={T.accent} />
          </span>
        ) : null}
      </span>

      <div className="wt-comment-main">
        <p className="wt-comment-meta">
          <span className={`wt-handle${comment.isCreator ? " is-creator" : ""}`}>{comment.author}</span>
          {comment.ago ? <span className="wt-comment-ago">· {comment.ago}</span> : null}
        </p>

        <CommentBody text={comment.text} />

        <div className="wt-comment-actions">
          <button
            type="button"
            className="wt-icon-btn"
            onClick={() => setLiked((v) => !v)}
            aria-pressed={liked}
            aria-label={liked ? "Remove like" : "Like this comment"}
          >
            <ThumbGlyph size={16} color={liked ? T.accent : T.inkSoft} filled={liked} />
          </button>
          <span className="wt-comment-likes">{likes > 0 ? likes.toLocaleString("en-IN") : ""}</span>
          <button
            type="button"
            className="wt-icon-btn"
            onClick={() => onToast("that is not an option here.")}
            aria-label="Dislike this comment"
          >
            <ThumbGlyph size={16} color={T.inkSoft} down />
          </button>
          <button type="button" className="wt-reply" onClick={() => onToast("replies are closed. she knows where you live.")}>
            Reply
          </button>
        </div>

        {replies.length > 0 ? (
          <>
            <button type="button" className="wt-replies-toggle" onClick={() => setOpenReplies((v) => !v)}>
              <ChevronGlyph size={15} color={T.accent} up={openReplies} />
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </button>
            {openReplies ? (
              <ul className="wt-replies">
                {replies.map((r, i) => (
                  <li key={`${r.author}-${i}`} className="wt-reply-row">
                    <InitialsAvatar name={r.author} size={26} />
                    <div style={{ minWidth: 0 }}>
                      <p className="wt-comment-meta">
                        <span className="wt-handle">{r.author}</span>
                        {r.ago ? <span className="wt-comment-ago">· {r.ago}</span> : null}
                      </p>
                      <p className="wt-comment-text">{r.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}

/**
 * The body, with "Read more" appearing only when there is genuinely more.
 *
 * Measured rather than counted: a character count guesses wrong at every width,
 * and the one place it guesses wrong most is a phone held sideways.
 */
function CommentBody({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [overflows, setOverflows] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 2);
    check();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, open]);

  return (
    <>
      <p
        ref={ref}
        className="wt-comment-text"
        style={open ? undefined : { maxHeight: BODY_CLAMP_PX, overflow: "hidden" }}
      >
        {text}
      </p>
      {overflows || open ? (
        <button type="button" className="wt-readmore" onClick={() => setOpen((v) => !v)}>
          {open ? "Show less" : "Read more"}
        </button>
      ) : null}
    </>
  );
}

export const COMMENTS_CSS = `
.wt-comments { margin-top: 24px; font-family: ${FONT}; }
.wt-comments-head { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.wt-comments-count { margin: 0; font-size: 20px; font-weight: 700; color: ${T.ink}; }
.wt-sort {
  display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 4px;
  border: 0; background: transparent; color: ${T.ink};
  font-family: ${FONT}; font-size: 14px; font-weight: 500; cursor: pointer;
}
.wt-sort-bars { display: inline-flex; flex-direction: column; gap: 3px; }
.wt-sort-bars i { display: block; height: 1.6px; background: ${T.ink}; border-radius: 1px; }
.wt-sort-bars i:nth-child(1) { width: 14px; }
.wt-sort-bars i:nth-child(2) { width: 10px; }
.wt-sort-bars i:nth-child(3) { width: 6px; }
.wt-comments-prompt {
  margin: 12px 0 0; font-size: 13.5px; line-height: 19px; color: ${T.inkSoft};
  overflow-wrap: anywhere;
}
.wt-add { display: flex; gap: 14px; margin: 18px 0 24px; align-items: flex-start; }
.wt-add-body { flex: 1; min-width: 0; }
.wt-add-input {
  width: 100%; height: 34px; background: transparent; border: 0;
  border-bottom: 1px solid ${T.line}; color: ${T.ink};
  font-family: ${FONT}; font-size: 14px; outline: none; padding: 0 0 4px;
}
.wt-add-input::placeholder { color: ${T.inkSoft}; }
.wt-add-input:focus { border-bottom-color: ${T.ink}; }
.wt-add-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
.wt-ghost {
  height: 36px; padding: 0 16px; border-radius: 18px; border: 0; background: transparent;
  color: ${T.ink}; font-family: ${FONT}; font-size: 14px; font-weight: 500; cursor: pointer;
}
.wt-ghost:hover { background: ${T.chip}; }
.wt-primary {
  height: 36px; padding: 0 16px; border-radius: 18px; border: 0;
  background: ${T.accent}; color: #FFFFFF;
  font-family: ${FONT}; font-size: 14px; font-weight: 600; cursor: pointer;
}
.wt-primary:disabled { background: ${T.chip}; color: ${T.inkSoft}; cursor: default; }
.wt-pinned-by {
  display: flex; align-items: center; gap: 6px; margin: 0 0 8px;
  font-size: 12px; color: ${T.inkSoft};
}
.wt-comment-list { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-direction: column; gap: 18px; }
.wt-comment {
  display: flex; gap: 14px; align-items: flex-start;
  animation: wt-comment-in 220ms ease-out both;
}
.wt-comment-avatar { position: relative; flex: none; width: 40px; height: 40px; }
.wt-heart-badge {
  position: absolute; right: -3px; bottom: -3px; width: 16px; height: 16px;
  border-radius: 50%; background: ${T.page}; display: grid; place-items: center;
}
.wt-comment-main { min-width: 0; flex: 1; }
.wt-comment-meta { margin: 0 0 3px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.wt-handle { font-size: 13px; font-weight: 500; color: ${T.ink}; overflow-wrap: anywhere; }
.wt-handle.is-creator {
  background: ${T.accentSoft}; color: ${T.accent}; padding: 2px 8px; border-radius: 999px;
}
.wt-comment-ago { font-size: 12px; color: ${T.inkSoft}; }
.wt-comment-text {
  margin: 0; font-size: 14px; line-height: 20px; color: ${T.ink};
  overflow-wrap: anywhere; white-space: pre-wrap;
}
.wt-readmore {
  margin-top: 2px; border: 0; background: transparent; padding: 2px 0;
  font-family: ${FONT}; font-size: 13px; font-weight: 500; color: ${T.inkSoft}; cursor: pointer;
}
.wt-comment-actions { display: flex; align-items: center; gap: 4px; margin-top: 6px; }
.wt-icon-btn {
  width: 32px; height: 32px; border: 0; border-radius: 50%; background: transparent;
  display: grid; place-items: center; cursor: pointer;
}
.wt-icon-btn:hover { background: ${T.chip}; }
.wt-comment-likes {
  min-width: 22px; font-size: 12px; color: ${T.inkSoft}; font-variant-numeric: tabular-nums;
}
.wt-reply {
  height: 32px; padding: 0 12px; border: 0; border-radius: 16px; background: transparent;
  color: ${T.ink}; font-family: ${FONT}; font-size: 13px; font-weight: 500; cursor: pointer;
}
.wt-reply:hover { background: ${T.chip}; }
.wt-replies-toggle {
  display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 10px;
  margin-top: 6px; border: 0; border-radius: 16px; background: transparent;
  color: ${T.accent}; font-family: ${FONT}; font-size: 13px; font-weight: 600; cursor: pointer;
}
.wt-replies-toggle:hover { background: ${T.accentSoft}; }
.wt-replies { list-style: none; margin: 8px 0 0 8px; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.wt-reply-row { display: flex; gap: 10px; align-items: flex-start; }
.wt-empty { margin: 18px 0 0; font-size: 14px; color: ${T.inkSoft}; }
@keyframes wt-comment-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .wt-comment { animation: none; }
}
`;
