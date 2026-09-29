// ─── Shared media, opened ────────────────────────────────────────────────────
//
// The chat-app media viewer: back arrow, who sent it, when; the photo framed
// exactly as the sender set it; the caption; and the little note underneath as
// a message bubble. Swipe or arrow between photos, double-tap to heart one.

"use client";

import { useEffect, useRef, useState } from "react";
import { Back, Face, Heart, Pic } from "./kit";
import type { CallData } from "./types";

export default function Viewer({ data, index, onIndex, onClose }: { data: CallData; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const photos = data.photos;
  const n = photos.length;
  const p = photos[index];
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [burst, setBurst] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const lastTap = useRef(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const first = data.caller.name.trim().split(/\s+/)[0] || "They";
  const portrait = data.caller.photoUrl ? { url: data.caller.photoUrl, cropX: data.caller.cropX, cropY: data.caller.cropY, scale: data.caller.scale } : null;

  const go = (d: number) => n > 1 && onIndex((index + d + n) % n);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!p) return null;

  const heart = () => {
    setLiked((l) => ({ ...l, [index]: true }));
    setBurst((b) => b + 1);
  };

  return (
    <div className="cxView" role="dialog" aria-modal="true" aria-label={`Photo ${index + 1} of ${n}`}>
      <div className="cxViewHead">
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close photo"><Back /></button>
        <Face name={data.caller.name} photo={portrait} size={34} />
        <div className="cxViewWho">
          <b>{first}</b>
          <small>shared media · {index + 1} of {n}</small>
        </div>
      </div>

      <div
        className="cxViewStage"
        onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchEnd={(e) => {
          const t = touch.current;
          touch.current = null;
          if (!t) return;
          const dx = e.changedTouches[0].clientX - t.x;
          const dy = e.changedTouches[0].clientY - t.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
          else if (dy > 110) onClose();
        }}
        onClick={() => {
          const now = Date.now();
          if (now - lastTap.current < 320) heart();
          lastTap.current = now;
        }}
      >
        <div className="cxViewFrame" key={index}>
          <Pic photo={p} alt={p.caption || `Photo ${index + 1}`} />
        </div>
        {burst > 0 && (
          <span className="cxViewBurst" key={burst} aria-hidden><Heart size={110} color="#FF4D8D" /></span>
        )}
        {n > 1 && (
          <>
            <button type="button" className="cxViewNav is-l" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo">‹</button>
            <button type="button" className="cxViewNav is-r" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo">›</button>
          </>
        )}
      </div>

      <div className="cxViewFoot">
        {p.caption && <p className="cxViewCap">{p.caption}</p>}
        {p.note && (
          <div className="cxViewBubble">
            <p>{p.note}</p>
            <small>{first} · ✓✓</small>
          </div>
        )}
        <div className="cxViewBar">
          <div className="cxViewDots" aria-hidden>
            {photos.map((_, i) => <i key={i} className={i === index ? "is-on" : ""} />)}
          </div>
          <button type="button" className={`cxViewLike${liked[index] ? " is-on" : ""}`} onClick={heart} aria-pressed={!!liked[index]}>
            <Heart size={18} color={liked[index] ? "#FF4D8D" : "currentColor"} /> {liked[index] ? "Loved" : "Love"}
          </button>
        </div>
      </div>
    </div>
  );
}
