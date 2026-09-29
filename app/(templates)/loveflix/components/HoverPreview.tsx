"use client";

// The desktop hover card: after a short dwell the card grows ~1.5x out of its
// own rectangle into a floating preview with actions, match, rating, runtime
// and genres. Rendered once, at Browse level, so no rail's overflow clips it.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CornerL, Still } from "./Brand";
import { titleKey, useLf, type Title } from "./context";
import { describe } from "./describe";
import { IcCheck, IcChevronDown, IcPlay, IcPlus, IcThumb } from "./icons";
import { sfxLike } from "./loveflixAudio";

export default function HoverPreview({ t, el, onClose }: { t: Title; el: HTMLElement; onClose: () => void }) {
  const { data, play, openDetails, myList, toggleList, liked, toggleLike } = useLf();
  const d = describe(t, data);
  const [box] = useState(() => {
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const w = Math.max(300, Math.min(420, r.width * 1.5));
    const imgH = (w * 9) / 16;
    const left = Math.min(Math.max(r.left + r.width / 2 - w / 2, vw * 0.04 - 8), vw - w - vw * 0.04 + 8);
    const top = Math.max(8, r.top + r.height / 2 - imgH / 2 - 6);
    return { left, top, w, from: { x: r.left - left, y: r.top - top, s: r.width / w } };
  });
  const [open, setOpen] = useState(false);
  const [burst, setBurst] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const close = () => onClose();
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [onClose]);

  const k = titleKey(t);
  const inList = myList.has(k);
  const isLiked = liked.has(k);
  const epIndex = t.kind === "episode" ? t.index : 0;

  return (
    <div
      ref={ref}
      className={`lf-hp${open ? " is-open" : ""}`}
      style={{
        left: box.left,
        top: box.top,
        width: box.w,
        transform: open ? "none" : `translate(${box.from.x}px, ${box.from.y}px) scale(${box.from.s})`,
      }}
      onMouseLeave={onClose}
      role="dialog"
      aria-label={`${d.title} preview`}
    >
      <button type="button" className="lf-hp-img" onClick={() => { onClose(); openDetails(t); }} aria-label={`More about ${d.title}`}>
        <Still src={d.src} crop={d.crop} label={d.title} seed={k + d.title} eager>
          <CornerL />
          {d.src && <span className="lf-card-title is-big">{d.title}</span>}
        </Still>
      </button>
      <div className="lf-hp-body">
        <div className="lf-hp-actions">
          <button type="button" className="lf-circ is-white" onClick={() => { onClose(); play(epIndex); }} aria-label="Play">
            <IcPlay size={20} />
          </button>
          <button
            type="button"
            className={`lf-circ${inList ? " is-on" : ""}`}
            onClick={() => toggleList(t)}
            aria-label={inList ? "Remove from My List" : "Add to My List"}
          >
            {inList ? <IcCheck size={20} /> : <IcPlus size={20} />}
          </button>
          <span className="lf-like">
            <button
              type="button"
              className={`lf-circ${isLiked ? " is-on is-liked" : ""}`}
              onClick={() => {
                toggleLike(t);
                if (!isLiked) {
                  sfxLike();
                  setBurst((b) => b + 1);
                }
              }}
              aria-label={isLiked ? "Unlike" : "Love this"}
            >
              <IcThumb size={18} />
            </button>
            {burst > 0 && <HeartBurst key={burst} />}
          </span>
          <button type="button" className="lf-circ lf-hp-more" onClick={() => { onClose(); openDetails(t); }} aria-label="More info">
            <IcChevronDown size={20} />
          </button>
        </div>
        <div className="lf-meta">
          <span className="lf-match">{d.match}% Match</span>
          <span className="lf-mat">{data.rating}</span>
          <span>{d.length}</span>
          <span className="lf-hd">HD</span>
        </div>
        {d.episodeLabel && (
          <div className="lf-hp-ep">
            <b>{d.episodeLabel}</b> “{d.title}”
          </div>
        )}
        <div className="lf-tags">
          {d.tags.map((g, i) => (
            <span key={g}>
              {i > 0 && <i>•</i>}
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Eight little hearts flying off a like. */
export function HeartBurst() {
  return (
    <span className="lf-burst" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <i key={i} style={{ ["--a" as string]: `${i * 45}deg` }}>
          ♥
        </i>
      ))}
    </span>
  );
}
