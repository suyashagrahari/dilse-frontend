"use client";

// ─── Up next ─────────────────────────────────────────────────────────────────
//
// The secondary column: filter chips, then memory cards — compact rows on
// desktop/tablet (thumb left, text right), full-width feed cards on a phone —
// with the vertical Moments shelf slotted in after the second card, the way a
// watch page slots its short-video shelf into the feed.

import { useRef, useState } from "react";
import Pic from "./Pic";
import { Avatar } from "./ui";
import { IChevron, IHeart, IMoments, IMoreV, IVerified } from "./icons";
import type { LovePhoto, RelatedVideo } from "./types";

export interface MomentCard {
  photo: LovePhoto;
  caption: string;
  hearts: string;
}

export interface UpNextProps {
  items: readonly RelatedVideo[];
  thumbFor: (i: number) => LovePhoto | null;
  activeId: string | null;
  onPick: (item: RelatedVideo, i: number) => void;
  onMore: () => void;
  channelName: string;
  channelAvatar: LovePhoto | null;
  channelAvatarUrl?: string;
  herName: string;
  moments: MomentCard[];
  onMoment: (i: number) => void;
  onBackToMain?: () => void;
  mainTitle: string;
  mainThumb: LovePhoto | null;
  mainDuration: string;
}

export default function UpNext(p: UpNextProps) {
  const chips = ["All", `From ${p.channelName}`, "Memories", p.herName ? `${p.herName}` : "For you", "Recently uploaded", "Watched"];
  const [chip, setChip] = useState(0);
  const chipsRef = useRef<HTMLDivElement | null>(null);

  const cards = p.items.map((item, i) => (
    <MemoryCard key={item.id} item={item} i={i} {...p} />
  ));
  const shelf = p.moments.length ? <MomentsShelf key="moments" moments={p.moments} onMoment={p.onMoment} /> : null;
  const withShelf = [...cards.slice(0, 2), shelf, ...cards.slice(2)];

  return (
    <div className="wt-un">
      <div className="wt-chips-wrap">
        <div className="wt-chips" ref={chipsRef} role="tablist" aria-label="Filter">
          {chips.map((c, i) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={chip === i}
              className={`wt-chip${chip === i ? " is-on" : ""}`}
              onClick={() => setChip(i)}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="wt-chips-next"
          aria-label="More filters"
          onClick={() => chipsRef.current?.scrollBy({ left: 180, behavior: "smooth" })}
        >
          <IChevron size={20} color="#F1F1F1" dir="right" />
        </button>
      </div>

      {p.activeId && p.onBackToMain ? (
        <button type="button" className="wt-un-card wt-un-main" onClick={p.onBackToMain}>
          <span className="wt-un-thumb">
            <Pic photo={p.mainThumb} />
            <span className="wt-un-dur">{p.mainDuration}</span>
            <span className="wt-un-watched" style={{ width: "62%" }} />
          </span>
          <span className="wt-un-meta">
            <span className="wt-un-title">{p.mainTitle}</span>
            <span className="wt-un-ch">
              {p.channelName} <IVerified size={12} color="#AAAAAA" />
            </span>
            <span className="wt-un-stats">▶ back to the main one</span>
          </span>
        </button>
      ) : null}

      <div className="wt-un-list">{withShelf}</div>
    </div>
  );
}

function MemoryCard({
  item,
  i,
  thumbFor,
  activeId,
  onPick,
  onMore,
  channelName,
  channelAvatar,
  channelAvatarUrl,
}: UpNextProps & { item: RelatedVideo; i: number }) {
  const active = activeId === item.id;
  const thumb: LovePhoto | null = item.thumbnailUrl ? { url: item.thumbnailUrl } : thumbFor(i);
  return (
    <div className={`wt-un-card${active ? " is-active" : ""}`} style={{ animationDelay: `${i * 60}ms` }}>
      <button type="button" className="wt-un-hit" onClick={() => onPick(item, i)} aria-label={`Play memory: ${item.title}`}>
        <span className="wt-un-thumb">
          <Pic photo={thumb} />
          {item.duration ? <span className="wt-un-dur">{item.duration}</span> : null}
          {i % 3 === 1 ? <span className="wt-un-watched" style={{ width: `${40 + ((i * 23) % 50)}%` }} /> : null}
          {active ? <span className="wt-un-now">▶ Now playing</span> : null}
        </span>
        <span className="wt-un-meta">
          <span className="wt-un-av">
            <Avatar photo={channelAvatar} url={channelAvatarUrl} name={channelName} size={36} />
          </span>
          <span className="wt-un-text">
            <span className="wt-un-title">{item.title}</span>
            <span className="wt-un-sub">
              <span className="wt-un-ch">
                {item.channel || channelName} <IVerified size={12} color="#AAAAAA" />
              </span>
              <span className="wt-un-stats">{[item.views, item.ago].filter(Boolean).join(" • ")}</span>
            </span>
          </span>
        </span>
      </button>
      <button type="button" className="wt-un-more" onClick={onMore} aria-label="Action menu">
        <IMoreV size={20} color="#F1F1F1" />
      </button>
    </div>
  );
}

function MomentsShelf({ moments, onMoment }: { moments: MomentCard[]; onMoment: (i: number) => void }) {
  return (
    <section className="wt-mo" aria-label="Moments">
      <h3 className="wt-mo-h">
        <IMoments size={24} color="#FF3E86" /> Moments
      </h3>
      <div className="wt-mo-row">
        {moments.map((m, i) => (
          <button key={`${i}-${m.photo.url.slice(-16)}`} type="button" className="wt-mo-card" onClick={() => onMoment(i)}>
            <span className="wt-mo-img">
              <Pic photo={m.photo} />
            </span>
            <span className="wt-mo-shade" />
            <span className="wt-mo-dots" aria-hidden="true">
              <IMoreV size={18} color="#fff" />
            </span>
            <span className="wt-mo-cap">
              <b>{m.caption}</b>
              <small>
                <IHeart size={11} color="#FF8FB8" /> {m.hearts}
              </small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export const UPNEXT_CSS = `
.wt-un { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.wt-chips-wrap { position: relative; }
.wt-chips { display: flex; gap: 12px; overflow-x: auto; scrollbar-width: none; padding-right: 40px; }
.wt-chips::-webkit-scrollbar { display: none; }
.wt-chip {
  flex: none; height: 32px; padding: 0 12px; border-radius: 8px; border: 0; background: rgba(255,255,255,.1);
  color: #F1F1F1; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; white-space: nowrap;
  transition: background .15s ease;
}
.wt-chip:hover { background: rgba(255,255,255,.2); }
.wt-chip.is-on { background: #F1F1F1; color: #0F0F0F; }
.wt-chips-next {
  position: absolute; right: 0; top: 0; width: 40px; height: 32px; border: 0; cursor: pointer; display: grid; place-items: center;
  background: linear-gradient(90deg, rgba(15,15,15,0), #0F0F0F 45%); border-radius: 0;
}
.wt-un-list { display: flex; flex-direction: column; gap: 8px; }
.wt-un-card { position: relative; display: flex; min-width: 0; animation: wt-rise .4s ease both; border-radius: 12px; }
.wt-un-hit {
  display: flex; gap: 8px; flex: 1; min-width: 0; padding: 0; border: 0; background: none; color: #F1F1F1;
  font-family: inherit; text-align: left; cursor: pointer;
}
.wt-un-main { gap: 8px; border: 0; background: rgba(255,62,134,.1); padding: 6px; color: #F1F1F1; font-family: inherit; text-align: left; cursor: pointer; }
.wt-un-thumb {
  position: relative; display: block; width: 168px; flex: none; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; background: #272727;
}
.wt-un-thumb img { transition: transform .35s ease; }
.wt-un-card:hover .wt-un-thumb img { transform: scale(1.06); }
.wt-un-dur {
  position: absolute; right: 4px; bottom: 4px; padding: 1px 4px; border-radius: 4px; background: rgba(0,0,0,.8);
  color: #fff; font-size: 12px; font-weight: 500; line-height: 16px;
}
.wt-un-watched { position: absolute; left: 0; bottom: 0; height: 3px; background: #FF3E86; }
.wt-un-watched::before { content: ""; position: absolute; left: 0; right: -500px; bottom: 0; height: 3px; background: rgba(255,255,255,.3); z-index: -1; }
.wt-un-now {
  position: absolute; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.55); font-size: 12px; font-weight: 500;
  color: #fff; letter-spacing: .02em;
}
.wt-un-card.is-active { background: rgba(255,62,134,.1); }
.wt-un-meta { display: flex; gap: 8px; min-width: 0; flex: 1; padding-right: 24px; }
.wt-un-av { display: none; }
.wt-un-text { display: flex; flex-direction: column; min-width: 0; }
.wt-un-title {
  font-size: 14px; line-height: 20px; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; margin-bottom: 4px; overflow-wrap: anywhere;
}
.wt-un-main .wt-un-meta { flex-direction: column; gap: 0; }
.wt-un-ch { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; line-height: 18px; color: #AAAAAA; }
.wt-un-stats { font-size: 12px; line-height: 18px; color: #AAAAAA; }
.wt-un-sub { display: flex; flex-direction: column; min-width: 0; }
.wt-un-more {
  position: absolute; top: 0; right: -6px; width: 32px; height: 32px; border: 0; background: none; border-radius: 50%;
  display: grid; place-items: center; cursor: pointer; opacity: 0; transition: opacity .15s ease;
}
.wt-un-card:hover .wt-un-more, .wt-un-more:focus-visible { opacity: 1; }
.wt-un-more:hover { background: #272727; }

.wt-mo { margin: 12px 0 14px; }
.wt-mo-h { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font-size: 20px; font-weight: 700; }
.wt-mo-row { display: grid; grid-auto-flow: column; grid-auto-columns: calc((100% - 8px) / 2); gap: 8px; overflow-x: auto; scrollbar-width: none; scroll-snap-type: x mandatory; }
.wt-mo-row::-webkit-scrollbar { display: none; }
.wt-mo-card {
  position: relative; display: block; aspect-ratio: 9 / 16; border-radius: 12px; overflow: hidden; border: 0; padding: 0;
  background: #272727; cursor: pointer; scroll-snap-align: start; color: #fff; font-family: inherit; text-align: left;
}
.wt-mo-img { position: absolute; inset: 0; transition: transform .4s ease; }
.wt-mo-card:hover .wt-mo-img { transform: scale(1.05); }
.wt-mo-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.25) 0%, transparent 25%, transparent 55%, rgba(0,0,0,.78)); }
.wt-mo-dots { position: absolute; top: 6px; right: 4px; }
.wt-mo-cap { position: absolute; left: 10px; right: 10px; bottom: 10px; display: flex; flex-direction: column; gap: 4px; }
.wt-mo-cap b { font-size: 15px; line-height: 20px; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 0 1px 3px rgba(0,0,0,.5); }
.wt-mo-cap small { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: rgba(255,255,255,.85); }

/* Phone: full-width feed cards */
@media (max-width: 759px) {
  .wt-un-list { gap: 20px; margin: 0 -12px; }
  .wt-un-card { flex-direction: column; border-radius: 0; }
  .wt-un-hit { flex-direction: column; gap: 10px; }
  .wt-un-thumb { width: 100%; border-radius: 0; }
  .wt-un-meta { padding: 0 36px 0 12px; gap: 12px; }
  .wt-un-av { display: block; }
  .wt-un-text { flex-direction: column; }
  .wt-un-title { margin-bottom: 2px; }
  .wt-un-sub { flex-direction: row; flex-wrap: wrap; align-items: center; gap: 0 4px; }
  .wt-un-sub .wt-un-ch svg { display: none; }
  .wt-un-sub .wt-un-stats::before { content: "· "; }
  .wt-un-more { top: auto; bottom: 20px; right: 4px; opacity: 1; }
  .wt-un-main { margin: 0 -12px; border-radius: 0; }
  .wt-mo { padding: 0 12px; margin: 0; }
  .wt-mo-row { grid-auto-columns: calc((100% - 8px) / 2.15); }
  .wt-chips-wrap { margin: 0 -12px; padding-left: 12px; }
}
@media (min-width: 760px) and (max-width: 999px) {
  .wt-un-list { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 16px; }
  .wt-mo { grid-column: 1 / -1; }
  .wt-mo-row { grid-auto-columns: calc((100% - 24px) / 4); }
  .wt-un-thumb { width: 45%; }
}
@media (min-width: 1000px) {
  .wt-mo-row { grid-auto-columns: calc((100% - 16px) / 3); }
  .wt-mo-cap b { font-size: 13px; line-height: 17px; }
}
@media (prefers-reduced-motion: reduce) { .wt-un-card { animation: none; } }
`;
