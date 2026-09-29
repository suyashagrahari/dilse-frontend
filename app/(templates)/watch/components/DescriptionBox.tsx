"use client";

// ─── The description ─────────────────────────────────────────────────────────
//
// Collapsed: the grey rounded box with the bold stats line, hashtags, two
// clamped lines and "...more". Expanded: the intro, the chapter timestamps
// (which seek), the chapter carousel with a thumbnail per chapter, the
// transcript entry, then the outro — set in a serif, where the page stops
// joking — and the channel card. `mode="sheet"` is the phone panel version,
// always expanded.

import { useState } from "react";
import Pic from "./Pic";
import { Avatar, Linkified } from "./ui";
import { IChevron } from "./icons";
import { formatTimestamp, type Chapter, type LovePhoto } from "./types";

export interface DescriptionBoxProps {
  views: string;
  postedAgo: string;
  hashtags: string[];
  intro: string[];
  chapters: Chapter[];
  outro: string[];
  chapterPhoto: (i: number) => LovePhoto | null;
  activeChapter: number;
  onSeek?: (seconds: number) => void;
  onViewChapters?: () => void;
  onTranscript?: () => void;
  channelName: string;
  channelAvatar: LovePhoto | null;
  channelAvatarUrl?: string;
  subscribers: string;
  mode?: "inline" | "sheet";
  title?: string;
  likes?: string;
  maxSeek?: number;
}

export default function DescriptionBox(p: DescriptionBoxProps) {
  const sheet = p.mode === "sheet";
  const [open, setOpen] = useState(sheet);
  const expanded = sheet || open;

  return (
    <section
      className={`wt-desc${expanded ? " is-open" : ""}${sheet ? " is-sheet" : ""}`}
      onClick={!expanded ? () => setOpen(true) : undefined}
      role={!expanded ? "button" : undefined}
      tabIndex={!expanded ? 0 : undefined}
      onKeyDown={!expanded ? (e) => (e.key === "Enter" || e.key === " ") && setOpen(true) : undefined}
      aria-expanded={expanded}
    >
      {sheet && p.title ? (
        <>
          <h2 className="wt-desc-title">{p.title}</h2>
          <div className="wt-desc-facts">
            <span>
              <b>{p.likes}</b>
              <small>Likes</small>
            </span>
            <span>
              <b>{p.views.replace(/\s*views?$/i, "")}</b>
              <small>Views</small>
            </span>
            <span>
              <b>{p.postedAgo.replace(/^Premiered\s*/i, "")}</b>
              <small>{/premiered/i.test(p.postedAgo) ? "Premiered" : "Posted"}</small>
            </span>
          </div>
        </>
      ) : (
        <p className="wt-desc-stats">
          <b>{p.views}</b>
          <b>{p.postedAgo}</b>
          {p.hashtags.map((h) => (
            <span key={h} className="wt-desc-tag">
              #{h}
            </span>
          ))}
        </p>
      )}

      {!expanded ? (
        <>
          <p className="wt-desc-clamp">{[...p.intro, ...p.outro].join(" ")}</p>
          <span className="wt-desc-more">...more</span>
        </>
      ) : (
        <div className="wt-desc-body">
          {p.intro.map((para, i) => (
            <p key={`i${i}`}>
              <Linkified text={para} onSeek={p.onSeek} max={p.maxSeek} />
            </p>
          ))}

          {p.chapters.length ? (
            <ul className="wt-desc-ch">
              {p.chapters.map((c, i) => (
                <li key={`${c.seconds}-${i}`} className={i === p.activeChapter ? "is-now" : undefined}>
                  <button type="button" className="wt-ts" onClick={() => p.onSeek?.(c.seconds)}>
                    {formatTimestamp(c.seconds)}
                  </button>{" "}
                  {c.label}
                </li>
              ))}
            </ul>
          ) : null}

          {p.chapters.length > 1 ? (
            <div className="wt-desc-sec">
              <div className="wt-desc-sec-h">
                <h3>Chapters</h3>
                {p.onViewChapters ? (
                  <button type="button" className="wt-desc-viewall" onClick={p.onViewChapters}>
                    View all
                  </button>
                ) : null}
              </div>
              <div className="wt-desc-cards">
                {p.chapters.map((c, i) => (
                  <button
                    key={`card-${i}`}
                    type="button"
                    className={`wt-desc-card${i === p.activeChapter ? " is-now" : ""}`}
                    onClick={() => p.onSeek?.(c.seconds)}
                  >
                    <span className="wt-desc-card-img">
                      <Pic photo={p.chapterPhoto(i)} />
                    </span>
                    <span className="wt-desc-card-t">
                      <b>{c.label}</b>
                      <small>{formatTimestamp(c.seconds)}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {p.onTranscript && p.chapters.some((c) => c.cc) ? (
            <div className="wt-desc-sec">
              <h3>Transcript</h3>
              <p className="wt-desc-note">Follow along using the transcript. Every line is true.</p>
              <button type="button" className="wt-desc-btn" onClick={p.onTranscript}>
                Show transcript
              </button>
            </div>
          ) : null}

          {p.outro.length ? (
            <div className="wt-desc-outro">
              {p.outro.map((para, i) => (
                <p key={`o${i}`}>{para}</p>
              ))}
              <span className="wt-desc-sign">— {p.channelName} ♥</span>
            </div>
          ) : null}

          <div className="wt-desc-chcard">
            <Avatar photo={p.channelAvatar} url={p.channelAvatarUrl} name={p.channelName} size={56} />
            <span>
              <b>{p.channelName}</b>
              <small>{p.subscribers}</small>
            </span>
          </div>

          {!sheet ? (
            <button
              type="button"
              className="wt-desc-less"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            >
              Show less <IChevron size={16} color="#F1F1F1" dir="up" />
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}

export const DESCRIPTION_CSS = `
.wt-desc {
  margin-top: 12px; padding: 12px; border-radius: 12px; background: #272727; font-size: 14px; line-height: 20px;
  color: #F1F1F1; overflow-wrap: anywhere; transition: background .15s ease;
}
.wt-desc:not(.is-open) { cursor: pointer; }
.wt-desc:not(.is-open):hover { background: #3F3F3F; }
.wt-desc.is-sheet { background: transparent; padding: 4px 16px 24px; margin: 0; }
.wt-desc-stats { margin: 0 0 2px; display: flex; flex-wrap: wrap; gap: 0 8px; font-size: 14px; }
.wt-desc-stats b { font-weight: 500; }
.wt-desc-tag { color: #AAAAAA; font-weight: 500; }
.wt-desc-clamp {
  margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.wt-desc-more { font-weight: 500; }
.wt-desc-body p { margin: 0 0 14px; white-space: pre-line; }
.wt-ts {
  border: 0; background: none; padding: 0; color: #3EA6FF; font: inherit; cursor: pointer; font-variant-numeric: tabular-nums;
}
.wt-ts:hover { text-decoration: underline; }
.wt-desc-ch { list-style: none; margin: 0 0 16px; padding: 0; }
.wt-desc-ch li { padding: 1px 0; transition: color .2s ease; }
.wt-desc-ch li.is-now { color: #FF8FB8; }
.wt-desc-ch li.is-now::after { content: "  ◂ now playing"; color: #AAAAAA; font-size: 12px; }
.wt-desc-sec { margin: 6px 0 18px; }
.wt-desc-sec h3 { margin: 0 0 8px; font-size: 16px; font-weight: 700; }
.wt-desc-sec-h { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.wt-desc-sec-h h3 { margin: 0; }
.wt-desc-viewall, .wt-desc-btn {
  height: 36px; padding: 0 16px; border-radius: 18px; border: 1px solid rgba(255,255,255,.2); background: transparent;
  color: #3EA6FF; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer;
}
.wt-desc-viewall:hover, .wt-desc-btn:hover { background: rgba(62,166,255,.12); border-color: transparent; }
.wt-desc-note { margin: 0 0 10px !important; color: #AAAAAA; }
.wt-desc-cards { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.wt-desc-cards::-webkit-scrollbar { display: none; }
.wt-desc-card {
  flex: none; width: 240px; display: flex; gap: 10px; align-items: center; padding: 6px; border-radius: 10px;
  border: 0; background: rgba(255,255,255,.06); color: #F1F1F1; font-family: inherit; text-align: left; cursor: pointer;
}
.wt-desc-card:hover { background: rgba(255,255,255,.12); }
.wt-desc-card.is-now { background: rgba(255,62,134,.18); }
.wt-desc-card-img { position: relative; width: 92px; flex: none; aspect-ratio: 16 / 9; border-radius: 6px; overflow: hidden; }
.wt-desc-card-t { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.wt-desc-card-t b { font-size: 13px; line-height: 17px; font-weight: 500; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.wt-desc-card-t small { font-size: 12px; color: #3EA6FF; }
.wt-desc-outro {
  position: relative; margin: 8px 0 18px; padding: 16px 16px 14px 18px; border-radius: 12px;
  background: linear-gradient(135deg, rgba(255,62,134,.14), rgba(255,143,184,.05)); border-left: 3px solid #FF3E86;
}
.wt-desc-outro p { font-family: var(--font-di-serif), "Instrument Serif", Georgia, serif; font-size: 19px; line-height: 27px; margin: 0 0 10px; color: #FFF3F7; }
.wt-desc-sign { display: block; text-align: right; font-family: var(--font-di-serif), Georgia, serif; font-style: italic; font-size: 17px; color: #FF8FB8; }
.wt-desc-chcard { display: flex; align-items: center; gap: 12px; margin: 4px 0 12px; }
.wt-desc-chcard span { display: flex; flex-direction: column; }
.wt-desc-chcard b { font-size: 16px; font-weight: 500; }
.wt-desc-chcard small { font-size: 12px; color: #AAAAAA; }
.wt-desc-less { border: 0; background: none; padding: 0; color: #F1F1F1; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.wt-desc-title { margin: 0 0 16px; font-size: 18px; line-height: 24px; font-weight: 700; }
.wt-desc-facts { display: flex; justify-content: space-around; margin: 0 0 18px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,.1); }
.wt-desc-facts span { display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; }
.wt-desc-facts b { font-size: 18px; font-weight: 700; }
.wt-desc-facts small { font-size: 12px; color: #AAAAAA; }
`;
