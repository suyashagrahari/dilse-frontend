"use client";

// ─── The post viewer ─────────────────────────────────────────────────────────
//
// Phone: the full-screen "Posts" feed, starting at the tapped post, with the
// comments in a bottom sheet. Web (≥768): the dimmed modal — photo left,
// comments right, arrows either side. Both share the carousel (swipe/scroll
// snap, dots, "1/3" pill), the double-tap heart burst and the action row.

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Pic, { RingAvatar } from "./Pic";
import {
  BackArrow,
  BookmarkIcon,
  ChevronLeft,
  ChevronRight,
  CloseIcon,
  CommentIcon,
  CoupleBadge,
  DotsIcon,
  HeartIcon,
  SendIcon,
  SmileIcon,
} from "./icons";
import { formatStat, likedBy, PALETTE as P, postFrames, type Comment, type Post, type ProfileData } from "./types";

export interface Social {
  liked: boolean;
  saved: boolean;
  mine: Comment[];
  hearted: string[];
}
export const EMPTY_SOCIAL: Social = { liked: false, saved: false, mine: [], hearted: [] };

const MINI_COLORS = ["#FF8FB1", "#B388FF", "#FFB38A", "#7BC8A4", "#79A7FF", "#FF6F91"];
const colorFor = (h: string) => MINI_COLORS[[...h].reduce((a, c) => a + c.charCodeAt(0), 0) % MINI_COLORS.length];
const EMOJIS = ["❤️", "🥹", "😍", "🔥", "😭", "🫶", "💍", "😂"];
const REPLIES = ["🫶", "stop it 🥹", "ur the cutest", "❤️❤️❤️", "marry me (again)", "screenshotting this"];

/** Deterministic "12 likes · 3w" metadata for a comment. */
const agoFor = (i: number) => ["2w", "5d", "1w", "3d", "6w", "1d", "4w", "2d"][i % 8];

function Mini({ handle, size = 32, src }: { handle: string; size?: number; src?: string }) {
  if (src) return <Pic src={src} style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0 }} />;
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: colorFor(handle),
        color: "#fff",
        display: "grid",
        placeItems: "center",
        fontWeight: 700,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {handle.replace(/[^a-z]/gi, "").charAt(0).toUpperCase() || "♥"}
    </span>
  );
}

// ── Heart burst ──────────────────────────────────────────────────────────────

function Burst({ onDone }: { onDone: () => void }) {
  const minis = [
    { dx: "-70px", dy: "-80px", rot: "-20deg", c: "#FF3D7F", d: 60 },
    { dx: "72px", dy: "-70px", rot: "18deg", c: "#FF8FB1", d: 90 },
    { dx: "-90px", dy: "10px", rot: "-35deg", c: "#FFB38A", d: 40 },
    { dx: "88px", dy: "20px", rot: "30deg", c: "#FF3D7F", d: 120 },
    { dx: "-30px", dy: "-110px", rot: "-8deg", c: "#fff", d: 150 },
    { dx: "36px", dy: "-104px", rot: "10deg", c: "#FF8FB1", d: 30 },
    { dx: "0px", dy: "80px", rot: "0deg", c: "#fff", d: 100 },
  ];
  return (
    <div className="us-burst" aria-hidden>
      {minis.map((m, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="us-burst-mini"
          style={{ "--dx": m.dx, "--dy": m.dy, "--rot": m.rot, animationDelay: `${m.d}ms` } as CSSProperties}
        >
          <path d="M12 21s-8.4-4.9-8.4-11a4.7 4.7 0 0 1 8.4-2.9 4.7 4.7 0 0 1 8.4 2.9c0 6.1-8.4 11-8.4 11z" fill={m.c} />
        </svg>
      ))}
      <svg viewBox="0 0 24 24" className="us-burst-big" onAnimationEnd={onDone}>
        <defs>
          <linearGradient id="us-burst-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF8FB1" />
            <stop offset=".55" stopColor="#FF3D7F" />
            <stop offset="1" stopColor="#E0287A" />
          </linearGradient>
        </defs>
        <path d="M12 21s-8.4-4.9-8.4-11a4.7 4.7 0 0 1 8.4-2.9 4.7 4.7 0 0 1 8.4 2.9c0 6.1-8.4 11-8.4 11z" fill="url(#us-burst-g)" />
      </svg>
    </div>
  );
}

// ── Media with carousel + double tap ────────────────────────────────────────

function Media({
  post,
  onDoubleTap,
  index,
  setIndex,
  fill,
}: {
  post: Post;
  onDoubleTap: () => void;
  index: number;
  setIndex: (i: number) => void;
  fill?: boolean;
}) {
  const frames = postFrames(post);
  const track = useRef<HTMLDivElement>(null);
  const lastTap = useRef(0);
  const [burst, setBurst] = useState(0);

  const tap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      lastTap.current = 0;
      setBurst((b) => b + 1);
      onDoubleTap();
    } else {
      lastTap.current = now;
    }
  };

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="us-media" style={fill ? { height: "100%", aspectRatio: "auto" } : undefined}>
      <div
        ref={track}
        className="us-media-track"
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
          if (i !== index) setIndex(i);
        }}
        onClick={tap}
      >
        {frames.map((f, i) => (
          <div key={i} className="us-media-slide">
            <Pic src={f.url} crop={f.crop} eager={i === 0} style={{ width: "100%", height: "100%" }} />
          </div>
        ))}
      </div>
      {frames.length > 1 ? (
        <>
          <span className="us-media-count">
            {index + 1}/{frames.length}
          </span>
          {index > 0 ? (
            <button type="button" className="us-media-arrow is-l" onClick={() => go(index - 1)} aria-label="Previous photo">
              <ChevronLeft size={14} strokeWidth={3} />
            </button>
          ) : null}
          {index < frames.length - 1 ? (
            <button type="button" className="us-media-arrow is-r" onClick={() => go(index + 1)} aria-label="Next photo">
              <ChevronRight size={14} strokeWidth={3} />
            </button>
          ) : null}
        </>
      ) : null}
      {burst ? <Burst key={burst} onDone={() => setBurst(0)} /> : null}
    </div>
  );
}

function Dots({ count, index }: { count: number; index: number }) {
  if (count < 2) return null;
  return (
    <div className="us-dots" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <i key={i} className={i === index ? "is-on" : ""} />
      ))}
    </div>
  );
}

function Actions({
  social,
  onLike,
  onComment,
  onShare,
  onSave,
  dots,
}: {
  social: Social;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  dots?: React.ReactNode;
}) {
  return (
    <div className="us-actions">
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <button type="button" className="us-ico" onClick={onLike} aria-label={social.liked ? "Unlike" : "Like"} aria-pressed={social.liked}>
          <span key={String(social.liked)} className={social.liked ? "us-pop" : ""} style={{ display: "block" }}>
            <HeartIcon size={25} color={social.liked ? P.likeRed : P.ink} filled={social.liked} />
          </span>
        </button>
        <button type="button" className="us-ico" onClick={onComment} aria-label="Comment">
          <CommentIcon size={24} />
        </button>
        <button type="button" className="us-ico" onClick={onShare} aria-label="Share">
          <SendIcon size={23} />
        </button>
      </div>
      {dots}
      <button type="button" className="us-ico" onClick={onSave} aria-label={social.saved ? "Remove from saved" : "Save"} aria-pressed={social.saved}>
        <span key={String(social.saved)} className={social.saved ? "us-pop" : ""} style={{ display: "block" }}>
          <BookmarkIcon size={24} filled={social.saved} />
        </span>
      </button>
    </div>
  );
}

function LikesLine({ post, social, name }: { post: Post; social: Social; name: string }) {
  const others = post.likes + (social.liked ? 0 : -1);
  return (
    <div className="us-likes">
      Liked by <b>{social.liked ? "you" : name}</b> and <b>{formatStat(Math.max(0, others))} others</b>
    </div>
  );
}

function CommentRow({
  c,
  i,
  hearted,
  onHeart,
  onReply,
}: {
  c: Comment;
  i: number;
  hearted: boolean;
  onHeart: () => void;
  onReply: (h: string) => void;
}) {
  const likes = (c.likes ?? 0) + (hearted ? 1 : 0);
  return (
    <div className="us-crow">
      <Mini handle={c.handle} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="us-ctext">
          <b>{c.handle}</b> {c.text}
        </div>
        <div className="us-cmeta">
          <span>{agoFor(i)}</span>
          {likes > 0 ? <span>{formatStat(likes)} likes</span> : null}
          <button type="button" onClick={() => onReply(c.handle)}>
            Reply
          </button>
        </div>
      </div>
      <button type="button" className="us-cheart" onClick={onHeart} aria-label={hearted ? "Unlike comment" : "Like comment"}>
        <span key={String(hearted)} className={hearted ? "us-pop" : ""} style={{ display: "block" }}>
          <HeartIcon size={12} color={hearted ? P.likeRed : P.greyIcon} filled={hearted} strokeWidth={2.4} />
        </span>
      </button>
    </div>
  );
}

function Composer({
  avatar,
  value,
  setValue,
  onPost,
  inputRef,
  emojis,
}: {
  avatar?: React.ReactNode;
  value: string;
  setValue: (v: string) => void;
  onPost: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  emojis?: boolean;
}) {
  return (
    <div className="us-composer">
      {emojis ? (
        <div className="us-emojis">
          {EMOJIS.map((e) => (
            <button key={e} type="button" onClick={() => setValue(value + e)} aria-label={`Add ${e}`}>
              {e}
            </button>
          ))}
        </div>
      ) : null}
      <form
        className="us-composer-row"
        onSubmit={(e) => {
          e.preventDefault();
          onPost();
        }}
      >
        {avatar ?? <SmileIcon size={24} />}
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, 300))}
          placeholder="Add a comment…"
          aria-label="Add a comment"
          enterKeyHint="send"
        />
        <button type="submit" disabled={!value.trim()} className="us-postbtn">
          Post
        </button>
      </form>
    </div>
  );
}

// ── The viewer ──────────────────────────────────────────────────────────────

export interface PostViewerProps {
  data: ProfileData;
  posts: Post[];
  start: number;
  web: boolean;
  social: Record<string, Social>;
  setSocial: (id: string, fn: (s: Social) => Social) => void;
  onClose: () => void;
  onToast: (t: string) => void;
}

export default function PostViewer(props: PostViewerProps) {
  return props.web ? <WebModal {...props} /> : <PhoneFeed {...props} />;
}

function useSocialOps(p: PostViewerProps) {
  const { setSocial, onToast, data } = p;
  const viewer = (data.to || "you").toLowerCase().replace(/[^a-z0-9._]+/g, "_");
  const like = useCallback((id: string, force?: boolean) => setSocial(id, (s) => ({ ...s, liked: force ?? !s.liked })), [setSocial]);
  const save = useCallback(
    (id: string) =>
      setSocial(id, (s) => {
        if (!s.saved) onToast("Saved to 'forever' 🔖");
        return { ...s, saved: !s.saved };
      }),
    [setSocial, onToast],
  );
  const share = useCallback(() => onToast(`Sent to your favourite person 💌`), [onToast]);
  const heart = useCallback(
    (id: string, key: string) =>
      setSocial(id, (s) => ({ ...s, hearted: s.hearted.includes(key) ? s.hearted.filter((k) => k !== key) : [...s.hearted, key] })),
    [setSocial],
  );
  const comment = useCallback(
    (id: string, text: string) => {
      setSocial(id, (s) => ({ ...s, mine: [...s.mine, { handle: viewer, text }] }));
      const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
      window.setTimeout(() => setSocial(id, (s) => ({ ...s, mine: [...s.mine, { handle: data.handle, text: `@${viewer} ${reply}` }] })), 1600);
    },
    [setSocial, viewer, data.handle],
  );
  return { like, save, share, heart, comment, viewer };
}

function Caption({ post, handle, clamp }: { post: Post; handle: string; clamp: boolean }) {
  const [open, setOpen] = useState(false);
  if (!post.caption) return null;
  const long = post.caption.length > 90;
  return (
    <div className="us-caption">
      <b>{handle}</b> {clamp && long && !open ? post.caption.slice(0, 80).trimEnd() + "… " : post.caption}
      {clamp && long && !open ? (
        <button type="button" onClick={() => setOpen(true)} style={{ color: P.grey }}>
          more
        </button>
      ) : null}
    </div>
  );
}

// ── Phone ───────────────────────────────────────────────────────────────────

function PhoneFeed(p: PostViewerProps) {
  const { data, posts, start, social, onClose } = p;
  const ops = useSocialOps(p);
  const scroller = useRef<HTMLDivElement>(null);
  const [sheetFor, setSheetFor] = useState<string | null>(null);

  useEffect(() => {
    const el = scroller.current?.querySelector<HTMLElement>(`[data-post="${start}"]`);
    if (el && scroller.current) scroller.current.scrollTop = el.offsetTop - 44;
  }, [start]);

  const sheetPost = posts.find((x) => x.id === sheetFor);

  return (
    <div className="us-feed" role="dialog" aria-modal="true" aria-label="Posts">
      <header className="us-feed-top">
        <button type="button" className="us-ico" onClick={onClose} aria-label="Back">
          <BackArrow size={24} />
        </button>
        <div style={{ textAlign: "center", lineHeight: "16px" }}>
          <div style={{ fontSize: 12, color: P.grey, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{data.handle}</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Posts</div>
        </div>
        <span style={{ width: 40 }} />
      </header>
      <div ref={scroller} className="us-feed-scroll">
        {posts.map((post, i) => (
          <PhonePost key={post.id} post={post} i={i} p={p} ops={ops} s={social[post.id] ?? EMPTY_SOCIAL} onComments={() => setSheetFor(post.id)} />
        ))}
        <div style={{ padding: "28px 16px 60px", textAlign: "center", color: P.grey, fontSize: 13 }}>
          you&apos;re all caught up 💞<br />
          that&apos;s every post. go hug them.
        </div>
      </div>
      {sheetPost ? (
        <CommentsSheet post={sheetPost} ops={ops} s={social[sheetPost.id] ?? EMPTY_SOCIAL} onClose={() => setSheetFor(null)} />
      ) : null}
    </div>
  );
}

function PhonePost({
  post,
  i,
  p,
  ops,
  s,
  onComments,
}: {
  post: Post;
  i: number;
  p: PostViewerProps;
  ops: ReturnType<typeof useSocialOps>;
  s: Social;
  onComments: () => void;
}) {
  const { data } = p;
  const [idx, setIdx] = useState(0);
  const frames = postFrames(post);
  const total = post.comments.length + s.mine.length;
  return (
    <article className="us-ppost" data-post={i}>
      <div className="us-phead">
        <RingAvatar src={data.avatarUrl} crop={data.avatarCrop} size={34} seen />
        <div style={{ flex: 1, minWidth: 0, lineHeight: "16px" }}>
          <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
            {data.handle} <CoupleBadge size={12} />
          </div>
          {post.location ? <div style={{ fontSize: 12 }}>{post.location}</div> : null}
        </div>
        <button type="button" className="us-ico" onClick={() => p.onToast("this post is protected by love 🔒")} aria-label="More options">
          <DotsIcon size={20} />
        </button>
      </div>
      <Media post={post} index={idx} setIndex={setIdx} onDoubleTap={() => ops.like(post.id, true)} />
      <Actions
        social={s}
        onLike={() => ops.like(post.id)}
        onComment={onComments}
        onShare={ops.share}
        onSave={() => ops.save(post.id)}
        dots={<Dots count={frames.length} index={idx} />}
      />
      <div className="us-pbody">
        <LikesLine post={post} social={s} name={likedBy(post, data, i)} />
        <Caption post={post} handle={data.handle} clamp />
        {total > 0 ? (
          <button type="button" className="us-viewall" onClick={onComments}>
            View {total > 1 ? `all ${total} comments` : "1 comment"}
          </button>
        ) : null}
        {post.comments[0] ? (
          <div className="us-caption" style={{ marginTop: 2 }}>
            <b>{post.comments[0].handle}</b> {post.comments[0].text}
          </div>
        ) : null}
        <div className="us-when">{post.postedAgo}</div>
      </div>
    </article>
  );
}

function CommentsSheet({
  post,
  ops,
  s,
  onClose,
}: {
  post: Post;
  ops: ReturnType<typeof useSocialOps>;
  s: Social;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const all = [...post.comments, ...s.mine];
  return (
    <div className="us-scrim" style={{ zIndex: 260 }} onClick={onClose}>
      <div className="us-csheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Comments">
        <div className="us-grab" />
        <div className="us-sheet-title">Comments</div>
        <div className="us-clist">
          {all.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: P.grey }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: P.ink }}>No comments yet</div>
              start the conversation 💬
            </div>
          ) : (
            all.map((c, i) => (
              <CommentRow
                key={i}
                c={c}
                i={i}
                hearted={s.hearted.includes(String(i))}
                onHeart={() => ops.heart(post.id, String(i))}
                onReply={(h) => {
                  setDraft(`@${h} `);
                  input.current?.focus();
                }}
              />
            ))
          )}
        </div>
        <Composer
          emojis
          inputRef={input}
          value={draft}
          setValue={setDraft}
          avatar={<Mini handle={ops.viewer} size={32} />}
          onPost={() => {
            if (!draft.trim()) return;
            ops.comment(post.id, draft.trim());
            setDraft("");
          }}
        />
      </div>
    </div>
  );
}

// ── Web ─────────────────────────────────────────────────────────────────────

function WebModal(p: PostViewerProps) {
  const { data, posts, start, social, onClose } = p;
  const ops = useSocialOps(p);
  const [cur, setCur] = useState(start);
  const [idx, setIdx] = useState(0);
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const post = posts[cur];
  const s = social[post.id] ?? EMPTY_SOCIAL;
  const all = [...post.comments, ...s.mine];
  const frames = postFrames(post);

  const step = useCallback(
    (d: number) => {
      setCur((c) => Math.min(posts.length - 1, Math.max(0, c + d)));
      setIdx(0);
    },
    [posts.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, onClose]);

  return (
    <div className="us-pm-scrim" onClick={onClose} role="dialog" aria-modal="true" aria-label="Post">
      <button type="button" className="us-pm-x" onClick={onClose} aria-label="Close">
        <CloseIcon size={26} color="#fff" strokeWidth={2.2} />
      </button>
      {cur > 0 ? (
        <button
          type="button"
          className="us-pm-nav is-l"
          onClick={(e) => {
            e.stopPropagation();
            step(-1);
          }}
          aria-label="Previous post"
        >
          <ChevronLeft size={16} strokeWidth={3} />
        </button>
      ) : null}
      {cur < posts.length - 1 ? (
        <button
          type="button"
          className="us-pm-nav is-r"
          onClick={(e) => {
            e.stopPropagation();
            step(1);
          }}
          aria-label="Next post"
        >
          <ChevronRight size={16} strokeWidth={3} />
        </button>
      ) : null}
      <div className="us-pm" key={post.id} onClick={(e) => e.stopPropagation()}>
        <div className="us-pm-media">
          <Media post={post} index={idx} setIndex={setIdx} fill onDoubleTap={() => ops.like(post.id, true)} />
          {frames.length > 1 ? (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
              <Dots count={frames.length} index={idx} />
            </div>
          ) : null}
        </div>
        <div className="us-pm-side">
          <div className="us-phead" style={{ borderBottom: `1px solid ${P.hair}`, padding: "12px 14px" }}>
            <RingAvatar src={data.avatarUrl} crop={data.avatarCrop} size={34} seen />
            <div style={{ flex: 1, minWidth: 0, lineHeight: "16px" }}>
              <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                {data.handle} <CoupleBadge size={12} /> <span style={{ color: P.grey, fontWeight: 400 }}>•</span>{" "}
                <span style={{ color: P.ink2, fontWeight: 600 }}>Following</span>
              </div>
              {post.location ? <div style={{ fontSize: 12 }}>{post.location}</div> : null}
            </div>
            <button type="button" className="us-ico" onClick={() => p.onToast("this post is protected by love 🔒")} aria-label="More options">
              <DotsIcon size={20} />
            </button>
          </div>
          <div className="us-pm-comments">
            {post.caption ? (
              <div className="us-crow">
                <RingAvatar src={data.avatarUrl} crop={data.avatarCrop} size={32} seen />
                <div style={{ flex: 1 }}>
                  <div className="us-ctext" style={{ whiteSpace: "pre-line" }}>
                    <b>{data.handle}</b> {post.caption}
                  </div>
                  <div className="us-cmeta">
                    <span>{post.postedAgo}</span>
                  </div>
                </div>
              </div>
            ) : null}
            {all.map((c, i) => (
              <CommentRow
                key={i}
                c={c}
                i={i}
                hearted={s.hearted.includes(String(i))}
                onHeart={() => ops.heart(post.id, String(i))}
                onReply={(h) => {
                  setDraft(`@${h} `);
                  input.current?.focus();
                }}
              />
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${P.hair}` }}>
            <Actions
              social={s}
              onLike={() => ops.like(post.id)}
              onComment={() => input.current?.focus()}
              onShare={ops.share}
              onSave={() => ops.save(post.id)}
            />
            <div style={{ padding: "0 16px 12px" }}>
              <LikesLine post={post} social={s} name={likedBy(post, data, cur)} />
              <div className="us-when" style={{ textTransform: "uppercase", fontSize: 10, letterSpacing: 0.3 }}>
                {post.postedAgo}
              </div>
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${P.hair}` }}>
            <Composer
              inputRef={input}
              value={draft}
              setValue={setDraft}
              onPost={() => {
                if (!draft.trim()) return;
                ops.comment(post.id, draft.trim());
                setDraft("");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const POST_CSS = `
.us-media{position:relative;width:100%;aspect-ratio:4/5;background:#000;overflow:hidden;user-select:none}
.us-media-track{display:flex;width:100%;height:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior-x:contain}
.us-media-track::-webkit-scrollbar{display:none}
.us-media-slide{flex:0 0 100%;height:100%;scroll-snap-align:center;scroll-snap-stop:always}
.us-media-count{position:absolute;top:12px;right:12px;padding:3px 9px;border-radius:12px;background:rgba(18,18,18,.72);color:#fff;font-size:12px;line-height:18px;font-weight:600;pointer-events:none}
.us-media-arrow{position:absolute;top:50%;margin-top:-13px;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.82)!important;display:grid;place-items:center;box-shadow:0 1px 4px rgba(0,0,0,.2);opacity:0;transition:opacity .2s}
.us-media:hover .us-media-arrow{opacity:1}
.us-media-arrow.is-l{left:10px}.us-media-arrow.is-r{right:10px}
.us-dots{display:flex;gap:4px;align-items:center;justify-content:center}
.us-dots i{width:6px;height:6px;border-radius:50%;background:#A8A8A8;transition:background .2s,transform .2s}
.us-dots i.is-on{background:${P.actionBlue};transform:scale(1.05)}
.us-pm-media .us-dots i{background:rgba(255,255,255,.55)}
.us-pm-media .us-dots i.is-on{background:#fff}
.us-actions{position:relative;display:flex;align-items:center;justify-content:space-between;padding:2px 4px 0}
.us-actions>.us-dots{position:absolute;left:50%;transform:translateX(-50%)}
.us-likes{font-weight:400;padding:2px 0 4px}
.us-likes b{font-weight:600}
.us-caption{word-break:break-word}
.us-caption b,.us-ctext b{font-weight:600}
.us-viewall{color:${P.grey};margin-top:4px;display:block}
.us-when{color:${P.grey};font-size:12px;margin-top:6px}
.us-feed{position:fixed;inset:0;z-index:200;background:#fff;display:flex;flex-direction:column;animation:us-slide-in .28s cubic-bezier(.2,.9,.3,1)}
.us-feed-top{height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 4px;border-bottom:1px solid ${P.hair};flex-shrink:0}
.us-feed-scroll{flex:1;overflow-y:auto;overscroll-behavior:contain}
.us-ppost{padding-bottom:18px}
.us-phead{display:flex;align-items:center;gap:10px;padding:8px 6px 8px 12px}
.us-pbody{padding:0 14px}
.us-csheet{width:100%;height:78dvh;display:flex;flex-direction:column;background:#fff;border-radius:16px 16px 0 0;animation:us-up .32s cubic-bezier(.2,1,.3,1);padding-bottom:env(safe-area-inset-bottom,0px)}
.us-clist{flex:1;overflow-y:auto;padding:8px 0}
.us-crow{display:flex;gap:12px;padding:10px 16px;align-items:flex-start}
.us-ctext{word-break:break-word}
.us-cmeta{display:flex;gap:12px;color:${P.grey};font-size:12px;margin-top:4px;font-weight:600}
.us-cmeta span:first-child{font-weight:400}
.us-cmeta button{color:${P.grey};font-weight:600}
.us-cheart{padding:6px!important;margin-top:4px}
.us-composer{border-top:1px solid ${P.hair}}
.us-emojis{display:flex;justify-content:space-around;padding:10px 8px 4px;font-size:24px}
.us-emojis button{transition:transform .15s}
.us-emojis button:active{transform:scale(1.35)}
.us-composer-row{display:flex;align-items:center;gap:12px;padding:10px 16px}
.us-composer-row input{flex:1;min-width:0;border:0;outline:0;font:inherit;font-size:16px;background:transparent;color:${P.ink}}
.us-postbtn{color:${P.actionBlue}!important;font-weight:600;transition:opacity .15s}
.us-postbtn:disabled{opacity:.35;cursor:default}
.us-pm-scrim{position:fixed;inset:0;z-index:220;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;animation:us-fade .2s ease}
.us-pm{display:flex;background:#fff;border-radius:4px;overflow:hidden;max-width:calc(100vw - 128px);animation:us-zoom .22s ease}
.us-pm-media{position:relative;height:min(90vh, calc((100vw - 540px) * 1.25));aspect-ratio:4/5;background:#000;flex-shrink:0}
.us-pm-media .us-media{height:100%}
.us-pm-side{width:405px;display:flex;flex-direction:column;min-height:0;max-height:min(90vh, calc((100vw - 540px) * 1.25))}
.us-pm-comments{flex:1;overflow-y:auto;padding:4px 0}
.us-pm-x{position:fixed;top:14px;right:14px;z-index:2}
.us-pm-nav{position:fixed;top:50%;margin-top:-16px;width:32px;height:32px;border-radius:50%;background:#fff!important;display:grid;place-items:center;z-index:2;transition:transform .15s}
.us-pm-nav:hover{transform:scale(1.08)}
.us-pm-nav.is-l{left:24px}.us-pm-nav.is-r{right:24px}
@media (max-width:1023px){
  .us-pm-side{width:320px;max-height:min(88vh, calc((100vw - 440px) * 1.25))}
  .us-pm-media{height:min(88vh, calc((100vw - 440px) * 1.25))}
  .us-pm{max-width:calc(100vw - 96px)}
  .us-pm-nav.is-l{left:10px}.us-pm-nav.is-r{right:10px}
}
@keyframes us-slide-in{from{transform:translateX(40%);opacity:0}}
`;
