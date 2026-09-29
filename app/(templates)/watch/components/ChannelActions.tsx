"use client";

// ─── Channel row + action pills ──────────────────────────────────────────────
//
// Desktop: one row — avatar, name + subscriber count, Subscribe on the left;
// the like/dislike pill, Share, Download, Clip, Save and ⋯ on the right.
// Phone: the channel row, then a horizontally scrolling strip of pills.
//
// Subscribe morphs into "Subscribed ▾" with a bell that rings; the like pill
// fills, pops, bursts hearts and rolls its number.

import { useState } from "react";
import { Avatar, Burst, tick } from "./ui";
import { bumpCount } from "./theme";
import { IBell, IChevron, IDownload, IMoreH, ISave, IScissors, IShare, IThumb, IVerified } from "./icons";
import type { LovePhoto } from "./types";

export type BellLevel = "all" | "personalized" | "none";

export interface ChannelActionsProps {
  name: string;
  subscribers: string;
  avatar: LovePhoto | null;
  avatarUrl?: string;
  likes: string;
  subscribed: boolean;
  bell: BellLevel;
  onSubscribe: () => void;
  onOpenSubscription: () => void;
  onShare: () => void;
  onDownload: () => void;
  downloading: boolean;
  onSave: () => void;
  onMore: () => void;
  onToast: (m: string) => void;
}

export default function ChannelActions({
  name,
  subscribers,
  avatar,
  avatarUrl,
  likes,
  subscribed,
  bell,
  onSubscribe,
  onOpenSubscription,
  onShare,
  onDownload,
  downloading,
  onSave,
  onMore,
  onToast,
}: ChannelActionsProps) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [burst, setBurst] = useState(0);
  const [shake, setShake] = useState(0);
  const [subBurst, setSubBurst] = useState(0);

  const likeLabel = liked ? bumpCount(likes, 1) : likes;

  const like = () => {
    tick(10);
    if (!liked) setBurst(Date.now());
    setLiked((v) => !v);
    setDisliked(false);
  };
  const dislike = () => {
    tick(20);
    setShake(Date.now());
    setDisliked(false);
    onToast("the dislike button is broken on this channel. forever. 🙅");
  };

  const subscribe = () => {
    tick(12);
    setSubBurst(Date.now());
    onSubscribe();
  };


  return (
    <div className="wt-ca">
      <div className="wt-ch">
        <Avatar photo={avatar} url={avatarUrl} name={name} size={40} />
        <div className="wt-ch-meta">
          <span className="wt-ch-name">
            <span className="wt-ch-name-t">{name}</span>
            <IVerified size={13} color="#AAAAAA" />
          </span>
          <span className="wt-ch-subs">{subscribers}</span>
        </div>
        {subscribed ? (
          <button type="button" className="wt-subbed" onClick={onOpenSubscription} aria-label="Subscribed — notification settings">
            <span key={subBurst} className={subBurst ? "wt-ring" : undefined}>
              <IBell size={22} color="#F1F1F1" filled={bell === "all"} />
            </span>
            <span className="wt-subbed-t">Subscribed</span>
            <IChevron size={18} color="#F1F1F1" />
            {subBurst ? <Burst key={`b${subBurst}`} count={12} /> : null}
          </button>
        ) : (
          <button type="button" className="wt-sub" onClick={subscribe}>
            Subscribe
          </button>
        )}
      </div>

      <div className="wt-actions" role="toolbar" aria-label="Video actions">
        <div className="wt-likepill">
          <button
            type="button"
            className={`wt-like${liked ? " is-on" : ""}`}
            onClick={like}
            aria-pressed={liked}
            aria-label={`like this video along with ${likes} other people`}
          >
            <span key={burst} className={`wt-like-ic${burst ? " is-pop" : ""}`}>
              <IThumb size={22} color="#F1F1F1" filled={liked} />
              {burst ? <Burst count={10} /> : null}
            </span>
            <span className="wt-like-n">
              <span key={likeLabel} className="wt-roll">
                {likeLabel}
              </span>
            </span>
          </button>
          <span className="wt-likepill-sep" aria-hidden="true" />
          <button
            type="button"
            className="wt-dislike"
            onClick={dislike}
            aria-pressed={disliked}
            aria-label="Dislike this video"
          >
            <span key={shake} className={shake ? "wt-shake" : undefined}>
              <IThumb size={22} color="#F1F1F1" down />
            </span>
          </button>
        </div>
        <button type="button" className="wt-pill" onClick={onShare}>
          <IShare size={22} color="#F1F1F1" /> Share
        </button>
        <button type="button" className="wt-pill" onClick={onDownload} disabled={downloading}>
          <IDownload size={22} color="#F1F1F1" /> {downloading ? "Saving…" : "Download"}
        </button>
        <button
          type="button"
          className="wt-pill wt-pill-clip"
          onClick={() => onToast("✂ clipped: the part where you laughed. saved forever.")}
        >
          <IScissors size={21} color="#F1F1F1" /> Clip
        </button>
        <button type="button" className="wt-pill" onClick={onSave}>
          <ISave size={22} color="#F1F1F1" /> Save
        </button>
        <button type="button" className="wt-pill wt-pill-icon" onClick={onMore} aria-label="More actions">
          <IMoreH size={22} color="#F1F1F1" />
        </button>
      </div>
    </div>
  );
}

export const CA_CSS = `
.wt-ca { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
.wt-ch { display: flex; align-items: center; gap: 12px; min-width: 0; }
.wt-ch-meta { display: flex; flex-direction: column; min-width: 0; margin-right: 12px; flex: 1 1 auto; }
.wt-ch-name { display: inline-flex; align-items: center; gap: 4px; font-size: 16px; font-weight: 500; line-height: 22px; min-width: 0; }
.wt-ch-name-t { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wt-ch-subs { font-size: 12px; color: #AAAAAA; line-height: 18px; white-space: nowrap; }
.wt-sub, .wt-subbed {
  position: relative; flex: none; height: 36px; border-radius: 18px; border: 0; cursor: pointer;
  font-family: inherit; font-size: 14px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;
  transition: background .2s ease, transform .15s ease;
}
.wt-sub { padding: 0 16px; background: #F1F1F1; color: #0F0F0F; }
.wt-sub:hover { background: #D9D9D9; }
.wt-sub:active, .wt-subbed:active { transform: scale(.96); }
.wt-subbed { padding: 0 10px 0 12px; background: #272727; color: #F1F1F1; animation: wt-subin .35s cubic-bezier(.2,1.4,.4,1) both; }
.wt-subbed:hover { background: #3F3F3F; }
@keyframes wt-subin { from { transform: scale(.9); } to { transform: scale(1); } }
.wt-ring { display: inline-block; transform-origin: 50% 10%; animation: wt-ring 1s ease both; }
@keyframes wt-ring {
  0% { transform: rotate(0); } 10% { transform: rotate(22deg); } 25% { transform: rotate(-20deg); }
  40% { transform: rotate(14deg); } 55% { transform: rotate(-10deg); } 70% { transform: rotate(5deg); } 100% { transform: rotate(0); }
}
.wt-actions {
  display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; margin: 0 -12px; padding: 0 12px;
  -webkit-overflow-scrolling: touch;
}
.wt-actions::-webkit-scrollbar { display: none; }
.wt-likepill { display: inline-flex; align-items: center; flex: none; height: 36px; border-radius: 18px; background: #272727; }
.wt-like, .wt-dislike {
  height: 36px; border: 0; background: transparent; color: #F1F1F1; font-family: inherit; font-size: 14px;
  font-weight: 500; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
}
.wt-like { padding: 0 14px 0 12px; border-radius: 18px 0 0 18px; }
.wt-dislike { padding: 0 14px 0 12px; border-radius: 0 18px 18px 0; }
.wt-like:hover, .wt-dislike:hover { background: #3F3F3F; }
.wt-likepill-sep { width: 1px; height: 24px; background: rgba(255,255,255,.2); }
.wt-like-ic { position: relative; display: inline-grid; }
.wt-like-ic.is-pop { animation: wt-pop .45s cubic-bezier(.2,1.6,.4,1); }
.wt-like.is-on .wt-like-ic svg path, .wt-like.is-on .wt-like-ic svg rect { fill: #F1F1F1; }
@keyframes wt-pop { 0% { transform: scale(1) rotate(0); } 35% { transform: scale(1.35) rotate(-18deg); } 100% { transform: scale(1) rotate(0); } }
.wt-like-n { display: inline-block; overflow: hidden; height: 20px; line-height: 20px; }
.wt-roll { display: inline-block; animation: wt-roll .35s ease both; }
@keyframes wt-roll { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.wt-shake { display: inline-block; animation: wt-shake .45s ease; }
@keyframes wt-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-4px) rotate(-8deg); } 40% { transform: translateX(4px) rotate(8deg); } 60% { transform: translateX(-3px); } 80% { transform: translateX(2px); } }
.wt-pill {
  flex: none; height: 36px; padding: 0 14px 0 10px; border-radius: 18px; border: 0; background: #272727;
  color: #F1F1F1; font-family: inherit; font-size: 14px; font-weight: 500; display: inline-flex; align-items: center;
  gap: 6px; cursor: pointer; white-space: nowrap; transition: background .15s ease;
}
.wt-pill:hover { background: #3F3F3F; }
.wt-pill:active { transform: scale(.97); }
.wt-pill-icon { width: 36px; padding: 0; justify-content: center; }
@media (min-width: 1000px) {
  .wt-ca { flex-direction: row; align-items: center; justify-content: space-between; gap: 8px; }
  .wt-ch { flex: 0 1 auto; }
  .wt-actions { margin: 0; padding: 0; overflow: visible; flex: 0 0 auto; }
}
@media (min-width: 1000px) and (max-width: 1340px) { .wt-pill-clip { display: none; } }
@media (min-width: 1000px) and (max-width: 1200px) { .wt-ca .wt-pill:nth-of-type(2) { display: none; } }
@media (prefers-reduced-motion: reduce) {
  .wt-ring, .wt-like-ic.is-pop, .wt-roll, .wt-shake, .wt-subbed { animation: none; }
}
`;
