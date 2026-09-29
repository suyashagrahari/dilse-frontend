// ─── Viewers: image panel, video player, the page behind a result ────────────

import { useEffect, useRef, useState } from "react";
import { BackIcon, ChevronRight, CloseIcon, HeartIcon, PauseIcon, PlayIcon, ShareIcon } from "./icons";
import { Fav, Pic, Snip } from "./Sections";
import { firstNameOf, type LovePhoto, type SearchResult, type Story, type Video } from "./types";

function useEscape(fn: () => void) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && ref.current();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, []);
}

/**
 * The image viewer. A docked side panel on desktop (the way image results open
 * beside the grid), full screen on a phone. The photo's note is its "page".
 */
export function ImageViewer({ photos, index, onIndex, onClose, name }: { photos: LovePhoto[]; index: number; onIndex: (i: number) => void; onClose: () => void; name: string }) {
  const ph = photos[index];
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const touch = useRef<number | null>(null);
  useEscape(onClose);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onIndex((index + 1) % photos.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + photos.length) % photos.length);
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [index, photos.length, onIndex]);
  if (!ph) return null;
  const first = firstNameOf(name) || "us";
  return (
    <div className="srViewerScrim" onClick={onClose}>
      <aside className="srViewer" role="dialog" aria-modal="true" aria-label={ph.caption || "Photo"} onClick={(e) => e.stopPropagation()}>
        <div className="srViewerTop">
          <span className="srViewerSite"><Fav label="memories" size={22} /> memories.love</span>
          <span className="srViewerActs">
            <button type="button" className="srIconBtn" aria-label="Share"><ShareIcon size={20} /></button>
            <button type="button" className="srIconBtn" aria-label="Close" onClick={onClose}><CloseIcon size={22} /></button>
          </span>
        </div>
        <div
          className="srViewerStage"
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const s = touch.current;
            touch.current = null;
            if (s === null) return;
            const dx = e.changedTouches[0].clientX - s;
            if (Math.abs(dx) > 50) onIndex(dx < 0 ? (index + 1) % photos.length : (index - 1 + photos.length) % photos.length);
          }}
        >
          <Pic photo={ph} className="srViewerPic" key={index} />
          <button
            type="button"
            className={`srViewerLike${liked.has(index) ? " is-on" : ""}`}
            aria-label="Like"
            onClick={() => setLiked((s) => new Set(s).add(index))}
          >
            <HeartIcon size={22} />
          </button>
          {photos.length > 1 && (
            <>
              <button type="button" className="srViewerNav is-l" aria-label="Previous" onClick={() => onIndex((index - 1 + photos.length) % photos.length)}>
                <ChevronRight size={26} style={{ transform: "rotate(180deg)" }} />
              </button>
              <button type="button" className="srViewerNav is-r" aria-label="Next" onClick={() => onIndex((index + 1) % photos.length)}>
                <ChevronRight size={26} />
              </button>
            </>
          )}
        </div>
        <div className="srViewerInfo">
          <h3>{ph.caption || `${first}, again`}</h3>
          {ph.note && <p className="srViewerNote srIn" key={index}>{ph.note}</p>}
          <p className="srViewerMeta">Images may be subject to copyright. <b>This one is subject to love.</b></p>
          <button type="button" className="srViewerVisit" onClick={onClose}>Visit <ChevronRight size={18} /></button>
        </div>
        {photos.length > 1 && (
          <div className="srViewerRel">
            <p>Related images</p>
            <div className="srViewerRelRow">
              {photos.map((p, i) => (
                <button key={i} type="button" className={i === index ? "is-on" : ""} onClick={() => onIndex(i)} aria-label={p.caption || `Photo ${i + 1}`}>
                  <Pic photo={p} />
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

/** A "video": the photo, slowly zooming, with the note as subtitles. */
export function VideoModal({ video, photo, onClose, reduce }: { video: Video; photo?: LovePhoto; onClose: () => void; reduce: boolean }) {
  const [playing, setPlaying] = useState(!reduce);
  const [t, setT] = useState(0);
  const total = 7000;
  useEscape(onClose);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      setT((v) => {
        const n = v + (now - last);
        last = now;
        if (n >= total) {
          setPlaying(false);
          return total;
        }
        return n;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [playing]);
  const secs = Math.floor(t / 1000);
  const words = (photo?.note || video.title).split(/\s+/);
  const shown = words.slice(0, Math.max(1, Math.ceil((t / (total * 0.85)) * words.length))).join(" ");
  return (
    <div className="srViewerScrim is-dark" onClick={onClose}>
      <div className="srPlayer" role="dialog" aria-modal="true" aria-label={video.title} onClick={(e) => e.stopPropagation()}>
        <div className={`srPlayerFrame${playing ? " is-playing" : ""}`} onClick={() => (t >= total ? (setT(0), setPlaying(true)) : setPlaying((v) => !v))}>
          <Pic photo={photo} className="srPlayerPic" />
          <p className="srPlayerSub">{shown}</p>
          {!playing && (
            <span className="srPlayerBig" aria-hidden>
              <PlayIcon size={34} />
            </span>
          )}
          <div className="srPlayerBar">
            <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={(e) => { e.stopPropagation(); if (t >= total) setT(0); setPlaying((v) => !v); }}>
              {playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
            </button>
            <span className="srPlayerTime">0:{String(secs).padStart(2, "0")} / {video.duration}</span>
            <span className="srPlayerTrack"><i style={{ width: `${(t / total) * 100}%` }} /></span>
          </div>
        </div>
        <div className="srPlayerInfo">
          <h3>{video.title}</h3>
          <p>{video.channel} · 1 view (it&apos;s me, I watched it 400 times)</p>
        </div>
        <button type="button" className="srPlayerX" aria-label="Close" onClick={onClose}><CloseIcon size={24} /></button>
      </div>
    </div>
  );
}

/**
 * The page behind a result. Legacy pages carry their own article body; new
 * ones are built from the snippet, a photo and its note — a plain personal
 * site from 2011, which is exactly what a real click lands on.
 */
export function SitePage({ result, story, photo, name, sender, onClose }: { result?: SearchResult; story?: Story; photo?: LovePhoto; name: string; sender: string; onClose: () => void }) {
  useEscape(onClose);
  const title = result?.page?.title || result?.title || story?.title || "";
  const site = result?.site || story?.source || "";
  const url = result?.page?.url || result?.url || `${site.toLowerCase().replace(/[^a-z0-9]+/g, "")}.in › news`;
  const body = result?.page?.body?.length ? result.page.body : [result?.snippet || "", photo?.note || ""].filter(Boolean);
  const from = firstNameOf(sender) || "me";
  return (
    <div className="srSite" role="dialog" aria-modal="true" aria-label={title}>
      <div className="srSiteBar">
        <button type="button" className="srIconBtn" aria-label="Back to results" onClick={onClose}><BackIcon size={22} /></button>
        <span className="srSiteUrl"><Fav label={site || "s"} size={18} /> {url.replace(/\s›\s/g, "/")}</span>
      </div>
      <article className="srSiteDoc">
        <p className="srSiteKicker">{site}{story ? ` · ${story.time}` : ""}</p>
        <h1>{title}</h1>
        <p className="srSiteBy">by {from} · {Math.max(1, Math.round(body.join(" ").split(/\s+/).length / 180))} min read</p>
        {photo && (
          <figure className="srSiteFig">
            <Pic photo={photo} />
            {photo.caption && <figcaption>{photo.caption}</figcaption>}
          </figure>
        )}
        {body.map((para, i) => (
          <p key={i}>
            <Snip text={para} name={name} />
          </p>
        ))}
        <p className="srSiteEnd">— filed under: things about {firstNameOf(name) || "you"} I refuse to forget</p>
        <button type="button" className="srSiteBack" onClick={onClose}>← Back to results</button>
      </article>
    </div>
  );
}

export function Toast({ msg }: { msg: string }) {
  return (
    <div className="srToast" role="status" aria-live="polite" key={msg}>
      {msg}
    </div>
  );
}
