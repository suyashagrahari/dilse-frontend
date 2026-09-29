"use client";

// ─── Comments ────────────────────────────────────────────────────────────────
//
// The full thread (desktop inline, phone panel) and the compact teaser card a
// phone shows under the actions. Pinned comment first with "Pinned by @…",
// creator chip on the owner's name, the hearted-by-creator badge, per-comment
// like with a pop, "Read more" on long bodies, timestamps that seek, replies
// behind a blue "⌄ N replies" toggle, and Top/Newest sorting.

import { useCallback, useMemo, useState } from "react";
import { Avatar, Burst, Linkified, compact, tick } from "./ui";
import { IChevron, IHeart, IPin, ISort, IThumb } from "./icons";
import type { Comment, LovePhoto, Reply } from "./types";

export interface CommentsProps {
  comments: readonly Comment[];
  pinnedComment?: Comment;
  channelName: string;
  channelHandle: string;
  channelAvatar: LovePhoto | null;
  channelAvatarUrl?: string;
  onToast: (message: string) => void;
  onSeek?: (s: number) => void;
  maxSeek?: number;
  /** Live page only: the ask that goes above the composer. */
  contributorPrompt?: string;
  /** Rendered instead of a thread (a memory is playing). */
  turnedOff?: boolean;
  compactHead?: boolean;
}

type Sort = "top" | "new";

export default function Comments(p: CommentsProps) {
  const [sort, setSort] = useState<Sort>("top");
  const [sortOpen, setSortOpen] = useState(false);
  const [mine, setMine] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);

  const all = useMemo(() => [...p.comments, ...mine], [p.comments, mine]);
  const ordered = useMemo(() => {
    const indexed = all.map((c, i) => ({ c, i }));
    if (sort === "top") indexed.sort((a, b) => b.c.likes - a.c.likes || a.i - b.i);
    else indexed.sort((a, b) => b.i - a.i);
    return indexed.map((x) => x.c);
  }, [all, sort]);

  const count = all.length + (p.pinnedComment ? 1 : 0);

  const post = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    setMine((prev) => [
      ...prev,
      { id: `me-${Date.now()}`, author: "You", text, ago: "just now", likes: 0, status: "published" },
    ]);
    setDraft("");
    setFocused(false);
    setSort("new");
    p.onToast("Comment added ♥ (only you can see it)");
  }, [draft, p]);

  if (p.turnedOff) {
    return (
      <section className="wt-cm">
        <p className="wt-cm-off">
          Comments are turned off. <span>this one&apos;s just for you.</span>
        </p>
      </section>
    );
  }

  return (
    <section className="wt-cm">
      <header className={`wt-cm-head${p.compactHead ? " is-compact" : ""}`}>
        <h2 className="wt-cm-count">
          {compact(count)} Comments
        </h2>
        <div className="wt-cm-sortwrap">
          <button type="button" className="wt-cm-sort" onClick={() => setSortOpen((v) => !v)} aria-expanded={sortOpen}>
            <ISort size={22} color="#F1F1F1" /> Sort by
          </button>
          {sortOpen ? (
            <div className="wt-cm-sortmenu" role="menu">
              {(["top", "new"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="menuitemradio"
                  aria-checked={sort === s}
                  className={sort === s ? "is-on" : undefined}
                  onClick={() => {
                    setSort(s);
                    setSortOpen(false);
                  }}
                >
                  {s === "top" ? "Top comments" : "Newest first"}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      {p.contributorPrompt ? <p className="wt-cm-prompt">{p.contributorPrompt}</p> : null}

      <div className="wt-cm-add">
        <Avatar name="You" size={40} />
        <div className="wt-cm-add-body">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 500))}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") post();
            }}
            placeholder="Add a comment…"
            aria-label="Add a comment"
            className="wt-cm-input"
          />
          {focused || draft ? (
            <div className="wt-cm-add-btns">
              <span className="wt-cm-emoji" aria-hidden="true">🥹</span>
              <button
                type="button"
                className="wt-cm-cancel"
                onClick={() => {
                  setDraft("");
                  setFocused(false);
                }}
              >
                Cancel
              </button>
              <button type="button" className="wt-cm-post" onClick={post} disabled={!draft.trim()}>
                Comment
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <ol className="wt-cm-list">
        {p.pinnedComment ? (
          <CommentRow key={`pin-${p.pinnedComment.id}`} c={p.pinnedComment} pinned {...p} />
        ) : null}
        {ordered.map((c) => (
          <CommentRow key={c.id} c={c} {...p} />
        ))}
      </ol>
    </section>
  );
}

function CommentRow({
  c,
  pinned,
  channelName,
  channelHandle,
  channelAvatar,
  channelAvatarUrl,
  onSeek,
  maxSeek,
  onToast,
}: CommentsProps & { c: Comment; pinned?: boolean }) {
  const [liked, setLiked] = useState(false);
  const [pop, setPop] = useState(0);
  const [more, setMore] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const creator = c.isCreator || c.author === channelName;
  const long = c.text.length > 220;

  const handle = creator ? channelHandle : `@${c.author.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
  const likes = c.likes + (liked ? 1 : 0);

  return (
    <li className="wt-cm-row">
      {creator ? (
        <Avatar photo={channelAvatar} url={channelAvatarUrl} name={channelName} size={40} />
      ) : (
        <Avatar url={c.avatarUrl} name={c.author} size={40} />
      )}
      <div className="wt-cm-main">
        {pinned ? (
          <p className="wt-cm-pinned">
            <IPin size={14} color="#AAAAAA" /> Pinned by {channelHandle}
          </p>
        ) : null}
        <p className="wt-cm-meta">
          <span className={creator ? "wt-cm-creator" : "wt-cm-author"}>{handle}</span>
          <span className="wt-cm-ago">{c.ago}</span>
        </p>
        <p className={`wt-cm-text${long && !more ? " is-clamp" : ""}`}>
          <Linkified text={c.text} onSeek={onSeek} max={maxSeek} />
        </p>
        {long ? (
          <button type="button" className="wt-cm-more" onClick={() => setMore((v) => !v)}>
            {more ? "Show less" : "Read more"}
          </button>
        ) : null}
        <div className="wt-cm-acts">
          <button
            type="button"
            className="wt-cm-ib"
            aria-pressed={liked}
            aria-label="Like this comment"
            onClick={() => {
              tick(8);
              if (!liked) setPop(Date.now());
              setLiked((v) => !v);
            }}
          >
            <span key={pop} className={pop ? "wt-like-ic is-pop" : "wt-like-ic"}>
              <IThumb size={18} color="#F1F1F1" filled={liked} />
              {pop ? <Burst count={8} /> : null}
            </span>
          </button>
          <span className="wt-cm-likes">{likes ? compact(likes) : ""}</span>
          <button type="button" className="wt-cm-ib" aria-label="Dislike this comment" onClick={() => onToast("no negativity in this comment section 🌸")}>
            <IThumb size={18} color="#F1F1F1" down />
          </button>
          {c.hearted ? (
            <span className="wt-cm-heart" title={`♥ by ${channelName}`} aria-label={`Hearted by ${channelName}`}>
              <Avatar photo={channelAvatar} url={channelAvatarUrl} name={channelName} size={18} />
              <IHeart size={13} color="#FF3E86" style={{ position: "absolute", right: -5, bottom: -4 }} />
            </span>
          ) : null}
          <button type="button" className="wt-cm-reply" onClick={() => onToast("replies are read by the creator. he's blushing.")}>
            Reply
          </button>
        </div>
        {c.replies?.length ? (
          <>
            <button type="button" className="wt-cm-toggle" onClick={() => setShowReplies((v) => !v)} aria-expanded={showReplies}>
              <IChevron size={20} color="#3EA6FF" dir={showReplies ? "up" : "down"} />
              {c.replies.some((r) => r.author === channelName) && !showReplies ? (
                <Avatar photo={channelAvatar} url={channelAvatarUrl} name={channelName} size={18} />
              ) : null}
              {c.replies.length} {c.replies.length === 1 ? "reply" : "replies"}
            </button>
            {showReplies ? (
              <ol className="wt-cm-replies">
                {c.replies.map((r: Reply, i) => {
                  const rc = r.author === channelName;
                  return (
                    <li key={`${c.id}-r${i}`} className="wt-cm-row is-reply">
                      {rc ? (
                        <Avatar photo={channelAvatar} url={channelAvatarUrl} name={channelName} size={24} />
                      ) : (
                        <Avatar name={r.author} size={24} />
                      )}
                      <div className="wt-cm-main">
                        <p className="wt-cm-meta">
                          <span className={rc ? "wt-cm-creator" : "wt-cm-author"}>
                            {rc ? channelHandle : `@${r.author.toLowerCase().replace(/[^a-z0-9]+/g, "")}`}
                          </span>
                          <span className="wt-cm-ago">{r.ago}</span>
                        </p>
                        <p className="wt-cm-text">{r.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : null}
          </>
        ) : null}
      </div>
    </li>
  );
}

/** The phone's compact card: "Comments 128" and the top comment, one line. */
export function CommentsTeaser({
  count,
  top,
  onOpen,
  channelName,
  channelAvatar,
  channelAvatarUrl,
  turnedOff,
}: {
  count: number;
  top?: Comment;
  onOpen: () => void;
  channelName: string;
  channelAvatar: LovePhoto | null;
  channelAvatarUrl?: string;
  turnedOff?: boolean;
}) {
  return (
    <button type="button" className="wt-cmt" onClick={onOpen} disabled={turnedOff}>
      <span className="wt-cmt-h">
        Comments <small>{turnedOff ? "" : compact(count)}</small>
      </span>
      {turnedOff ? (
        <span className="wt-cmt-line is-off">Comments are turned off. this one&apos;s just for you.</span>
      ) : top ? (
        <span className="wt-cmt-row">
          {top.isCreator || top.author === channelName ? (
            <Avatar photo={channelAvatar} url={channelAvatarUrl} name={channelName} size={24} />
          ) : (
            <Avatar url={top.avatarUrl} name={top.author} size={24} />
          )}
          <span className="wt-cmt-line">{top.text}</span>
        </span>
      ) : (
        <span className="wt-cmt-line">Be the first to say something nice</span>
      )}
    </button>
  );
}

export const COMMENTS_CSS = `
.wt-cm { margin-top: 24px; }
.wt-cm-off { margin: 8px 0; padding: 16px 0; text-align: center; font-size: 14px; color: #F1F1F1; border-top: 1px solid rgba(255,255,255,.1); }
.wt-cm-off span { color: #AAAAAA; }
.wt-cm-head { display: flex; align-items: center; gap: 32px; margin-bottom: 20px; }
.wt-cm-head.is-compact { gap: 16px; margin-bottom: 14px; }
.wt-cm-count { margin: 0; font-size: 20px; line-height: 28px; font-weight: 700; }
.wt-cm-sortwrap { position: relative; }
.wt-cm-sort {
  display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 8px 0 4px; border: 0; background: none;
  color: #F1F1F1; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 18px;
}
.wt-cm-sort:hover { background: #272727; }
.wt-cm-sortmenu {
  position: absolute; top: 40px; left: 0; z-index: 20; min-width: 170px; padding: 8px 0; border-radius: 12px;
  background: #282828; box-shadow: 0 8px 24px rgba(0,0,0,.5); animation: wtp-in .15s ease both;
}
.wt-cm-sortmenu button {
  display: block; width: 100%; height: 44px; padding: 0 16px; border: 0; background: none; color: #F1F1F1;
  font-family: inherit; font-size: 14px; text-align: left; cursor: pointer;
}
.wt-cm-sortmenu button:hover, .wt-cm-sortmenu button.is-on { background: #3F3F3F; }
.wt-cm-prompt { margin: -8px 0 16px; font-size: 13px; line-height: 18px; color: #FF8FB8; }
.wt-cm-add { display: flex; gap: 16px; margin-bottom: 28px; }
.wt-cm-add-body { flex: 1; min-width: 0; }
.wt-cm-input {
  width: 100%; height: 32px; border: 0; border-bottom: 1px solid rgba(255,255,255,.2); background: transparent;
  color: #F1F1F1; font-family: inherit; font-size: 14px; outline: none; padding: 0; border-radius: 0;
  transition: border-color .2s ease;
}
.wt-cm-input:focus { border-bottom: 2px solid #F1F1F1; }
.wt-cm-input::placeholder { color: #AAAAAA; }
.wt-cm-add-btns { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.wt-cm-emoji { margin-right: auto; font-size: 18px; }
.wt-cm-cancel, .wt-cm-post {
  height: 36px; padding: 0 16px; border-radius: 18px; border: 0; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer;
}
.wt-cm-cancel { background: none; color: #F1F1F1; }
.wt-cm-cancel:hover { background: #272727; }
.wt-cm-post { background: #3EA6FF; color: #0F0F0F; }
.wt-cm-post:disabled { background: #272727; color: #717171; cursor: default; }
.wt-cm-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
.wt-cm-row { display: flex; gap: 16px; min-width: 0; animation: wt-rise .35s ease both; }
.wt-cm-row.is-reply { gap: 12px; }
.wt-cm-main { flex: 1; min-width: 0; }
.wt-cm-pinned { margin: 0 0 2px; display: flex; align-items: center; gap: 4px; font-size: 12px; color: #AAAAAA; }
.wt-cm-meta { margin: 0 0 2px; display: flex; align-items: center; gap: 4px; font-size: 13px; line-height: 18px; min-width: 0; }
.wt-cm-author { font-weight: 500; color: #F1F1F1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wt-cm-creator { font-weight: 500; color: #F1F1F1; background: #3F3F3F; padding: 0 6px; border-radius: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wt-cm-ago { color: #AAAAAA; font-size: 12px; white-space: nowrap; }
.wt-cm-text { margin: 0; font-size: 14px; line-height: 20px; white-space: pre-line; overflow-wrap: anywhere; }
.wt-cm-text.is-clamp { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.wt-cm-more { border: 0; background: none; padding: 4px 0 0; color: #AAAAAA; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; }
.wt-cm-acts { display: flex; align-items: center; margin: 2px 0 0 -8px; }
.wt-cm-ib {
  width: 32px; height: 32px; border: 0; background: none; border-radius: 50%; display: grid; place-items: center; cursor: pointer;
}
.wt-cm-ib:hover { background: #272727; }
.wt-cm-likes { font-size: 12px; color: #AAAAAA; min-width: 8px; margin: 0 6px 0 0; }
.wt-cm-heart { position: relative; display: inline-flex; margin: 0 14px 0 8px; }
.wt-cm-reply {
  height: 32px; padding: 0 12px; border: 0; background: none; border-radius: 16px; color: #F1F1F1;
  font-family: inherit; font-size: 12px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
}
.wt-cm-reply:hover { background: #272727; }
.wt-cm-toggle {
  display: inline-flex; align-items: center; gap: 6px; height: 36px; margin: 2px 0 0 -8px; padding: 0 16px 0 8px; border: 0;
  background: none; border-radius: 18px; color: #3EA6FF; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer;
}
.wt-cm-toggle:hover { background: rgba(62,166,255,.15); }
.wt-cm-replies { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.wt-cmt {
  display: flex; flex-direction: column; gap: 8px; width: 100%; margin-top: 16px; padding: 10px 12px 12px; border-radius: 12px;
  border: 0; background: #272727; color: #F1F1F1; font-family: inherit; text-align: left; cursor: pointer;
}
.wt-cmt:active { background: #3F3F3F; }
.wt-cmt-h { font-size: 14px; font-weight: 500; }
.wt-cmt-h small { font-size: 13px; color: #AAAAAA; font-weight: 400; margin-left: 4px; }
.wt-cmt-row { display: flex; align-items: center; gap: 8px; min-width: 0; }
.wt-cmt-line { font-size: 13px; line-height: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.wt-cmt-line.is-off { color: #AAAAAA; white-space: normal; }
@keyframes wt-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (max-width: 999px) {
  .wt-cm-row { gap: 12px; }
  .wt-cm-add { gap: 12px; }
}
@media (prefers-reduced-motion: reduce) { .wt-cm-row { animation: none; } }
`;
