"use client";

// The profile page itself: header (phone and web grammar), highlights, the
// icon tabs and the 3:4 grid.

import Pic, { RingAvatar } from "./Pic";
import {
  ChevronDown,
  ClipsIcon,
  CommentIcon,
  CoupleBadge,
  DotsIcon,
  GridIcon,
  HeartIcon,
  LinkIcon,
  PersonPlusIcon,
  PinGlyph,
  PlayGlyph,
  StackGlyph,
  TaggedIcon,
} from "./icons";
import { followedByLine, formatStat, PALETTE, type Highlight, type Post, type ProfileData, type ProfileTab } from "./types";

const MINI_COLORS = ["#FF8FB1", "#B388FF", "#FFB38A", "#7BC8A4", "#79A7FF", "#FF6F91"];

export interface HeaderActions {
  onStory: () => void;
  onFollowing: () => void;
  onMessage: () => void;
  onFollowers: () => void;
  onFollowingList: () => void;
  onPosts: () => void;
  onNote: () => void;
  onSuggest: () => void;
  onMore: () => void;
  storySeen: boolean;
}

function Note({ text, onClick }: { text: string; onClick: () => void }) {
  if (!text) return null;
  return (
    <button type="button" className="us-note" onClick={onClick} aria-label={`Note: ${text}`}>
      {text}
    </button>
  );
}

function FollowedBy({ handles, onClick }: { handles: string[]; onClick: () => void }) {
  const line = followedByLine(handles);
  if (!line.named.length) return null;
  return (
    <button type="button" className="us-fby" onClick={onClick}>
      <span className="us-minis" aria-hidden>
        {handles.slice(0, 3).map((h, i) => (
          <span key={h + i} className="us-mini" style={{ background: MINI_COLORS[i % MINI_COLORS.length] }}>
            {h.replace(/[^a-z]/gi, "").charAt(0).toUpperCase() || "♥"}
          </span>
        ))}
      </span>
      <span>
        Followed by{" "}
        {line.named.map((h, i) => (
          <span key={h}>
            {i > 0 ? line.joiner : ""}
            <b>{h}</b>
          </span>
        ))}
        {line.suffix}
      </span>
    </button>
  );
}

function Bio({ data }: { data: ProfileData }) {
  return (
    <>
      <div className="us-name">
        {data.displayName}
      </div>
      {data.category ? <div className="us-cat">{data.category}</div> : null}
      {data.bio.length ? <div className="us-bio">{data.bio.join("\n")}</div> : null}
      {data.link ? (
        <a className="us-link" href={data.link.url} target="_blank" rel="noopener noreferrer nofollow">
          <LinkIcon size={14} color={PALETTE.linkBlue} style={{ transform: "rotate(-45deg)" }} />
          <span>{data.link.label}</span>
        </a>
      ) : null}
    </>
  );
}

function Stats({ data, a }: { data: ProfileData; a: HeaderActions }) {
  const posts = Math.max(data.stats.posts, data.posts.length);
  return (
    <div className="us-stats">
      <button type="button" onClick={a.onPosts}>
        <b>{formatStat(posts)}</b>
        <span>posts</span>
      </button>
      <button type="button" onClick={a.onFollowers}>
        <b>{formatStat(data.stats.followers)}</b>
        <span>followers</span>
      </button>
      <button type="button" onClick={a.onFollowingList}>
        <b>{formatStat(data.stats.following)}</b>
        <span>following</span>
      </button>
    </div>
  );
}

export function ProfileHeader({ data, a }: { data: ProfileData; a: HeaderActions }) {
  const hasStory = data.highlights.length > 0;
  const avatar = (
    <div className="us-av">
      <Note text={data.note} onClick={a.onNote} />
      <RingAvatar
        src={data.avatarUrl}
        crop={data.avatarCrop}
        size="100%"
        seen={!hasStory || a.storySeen}
        live={hasStory}
        onClick={hasStory ? a.onStory : undefined}
        label={`Open ${data.handle}'s story`}
      />
    </div>
  );

  return (
    <>
      {/* Phone */}
      <section className="us-phone-only us-head">
        <div className="us-head-row">
          {avatar}
          <Stats data={data} a={a} />
        </div>
        <Bio data={data} />
        <FollowedBy handles={data.followedBy} onClick={a.onFollowers} />
        <div className="us-btns">
          <button type="button" className="us-btn" onClick={a.onFollowing}>
            Following <ChevronDown size={12} strokeWidth={2.6} />
          </button>
          <button type="button" className="us-btn" onClick={a.onMessage}>
            Message
          </button>
          <button type="button" className="us-btn is-sq" onClick={a.onSuggest} aria-label="Suggested for you">
            <PersonPlusIcon size={16} />
          </button>
        </div>
      </section>

      {/* Web */}
      <section className="us-web-only us-whead">
        <div className="us-av-col">{avatar}</div>
        <div className="us-info">
          <div className="us-web-top">
            <h2 className="us-web-handle">
              {data.handle} <CoupleBadge size={18} />
            </h2>
            <button type="button" className="us-btn" onClick={a.onFollowing}>
              Following <ChevronDown size={12} strokeWidth={2.6} />
            </button>
            <button type="button" className="us-btn" onClick={a.onMessage}>
              Message
            </button>
            <button type="button" className="us-btn" style={{ padding: "0 8px" }} onClick={a.onSuggest} aria-label="Suggested for you">
              <PersonPlusIcon size={16} />
            </button>
            <button type="button" className="us-ico" onClick={a.onMore} aria-label="Options">
              <DotsIcon size={22} />
            </button>
          </div>
          <Stats data={data} a={a} />
          <Bio data={data} />
          <FollowedBy handles={data.followedBy} onClick={a.onFollowers} />
        </div>
      </section>
    </>
  );
}

export function Highlights({ items, onOpen }: { items: Highlight[]; onOpen: (i: number) => void }) {
  if (!items.length) return null;
  return (
    <div className="us-hl" role="list" aria-label="Story highlights">
      {items.map((h, i) => (
        <button key={`${h.title}-${i}`} type="button" role="listitem" onClick={() => onOpen(i)} aria-label={`Highlight: ${h.title}`}>
          <div className="us-hl-ring">
            <Pic src={h.coverUrl} crop={h.slides[0]?.imageUrl === h.coverUrl ? h.slides[0]?.crop : undefined} eager />
          </div>
          <span>{h.title}</span>
        </button>
      ))}
    </div>
  );
}

export function Tabs({ active, onSelect }: { active: ProfileTab; onSelect: (t: ProfileTab) => void }) {
  const tabs: { id: ProfileTab; label: string; Icon: typeof GridIcon }[] = [
    { id: "grid", label: "Posts", Icon: GridIcon },
    { id: "clips", label: "Clips", Icon: ClipsIcon },
    { id: "tagged", label: "Tagged", Icon: TaggedIcon },
  ];
  return (
    <div className="us-tabs" role="tablist">
      {tabs.map(({ id, label, Icon }) => (
        <button key={id} type="button" role="tab" aria-selected={active === id} aria-label={label} className={active === id ? "is-on" : ""} onClick={() => onSelect(id)}>
          <Icon size={active === id ? 24 : 24} color={active === id ? PALETTE.ink : PALETTE.greyIcon} style={{ width: "var(--tab-ico,24px)", height: "var(--tab-ico,24px)" }} />
          <em>{label}</em>
        </button>
      ))}
    </div>
  );
}

export function Grid({ posts, pinned, onOpen }: { posts: Post[]; pinned: string[]; onOpen: (i: number) => void }) {
  return (
    <div className="us-grid">
      {posts.map((p, i) => {
        const isPinned = pinned.includes(p.id);
        const multi = (p.more?.length ?? 0) > 0 || p.isMultiple;
        return (
          <button
            key={p.id}
            type="button"
            className="us-cell"
            style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
            onClick={() => onOpen(i)}
            aria-label={`Open post ${i + 1}${p.caption ? `: ${p.caption.slice(0, 60)}` : ""}`}
          >
            <Pic src={p.imageUrl} crop={p.crop} eager={i < 6} />
            {isPinned ? (
              <PinGlyph size={18} style={{ position: "absolute", top: 8, right: 8, filter: `drop-shadow(${PALETTE.glyphShadow})` }} />
            ) : multi ? (
              <StackGlyph size={18} style={{ position: "absolute", top: 8, right: 8, filter: `drop-shadow(${PALETTE.glyphShadow})` }} />
            ) : p.isVideo ? (
              <PlayGlyph size={18} style={{ position: "absolute", top: 8, right: 8, filter: `drop-shadow(${PALETTE.glyphShadow})` }} />
            ) : null}
            <span className="us-cell-hover" aria-hidden>
              <span>
                <HeartIcon size={19} color="#fff" filled /> {formatStat(p.likes)}
              </span>
              <span>
                <CommentIcon size={19} color="#fff" style={{ fill: "#fff" }} /> {p.comments.length}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function EmptyTab({ tab, to }: { tab: Exclude<ProfileTab, "grid">; to: string }) {
  const Icon = tab === "clips" ? ClipsIcon : TaggedIcon;
  const copy =
    tab === "clips"
      ? { h: "Clips coming soon", p: "we filmed a lot. most of it is just us laughing at nothing. the grid has the good stuff." }
      : { h: "Photos of you", p: `every photo on this account is technically tagged ${to ? to : "you"}. that's the whole account.` };
  return (
    <div className="us-empty">
      <div className="us-empty-ic">
        <Icon size={30} />
      </div>
      <h3>{copy.h}</h3>
      <p>{copy.p}</p>
    </div>
  );
}

export function WebFooter({ from }: { from: string }) {
  const links = ["About us", "Help (we're fine)", "Press (hug)", "Jobs (kissing)", "Privacy", "Terms of Endearment", "Locations (together)", "Language: Love"];
  return (
    <footer className="us-foot">
      <nav>
        {links.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </nav>
      <div>
        © 2026 us. · made with a stupid amount of love{from ? ` by ${from}` : ""}
      </div>
    </footer>
  );
}
