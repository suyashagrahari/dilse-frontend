"use client";

// ─── Moments viewer ──────────────────────────────────────────────────────────
//
// The vertical, full-screen player for the Moments shelf: one photo per
// screen, swipe/scroll/arrow to the next, a right-hand action rail (heart,
// comments, share), the channel line with a small Subscribe, the caption, a
// looping progress line, and double-tap anywhere for the big heart.

import { useCallback, useEffect, useRef, useState } from "react";
import Pic from "./Pic";
import { Avatar, Burst, tick } from "./ui";
import { IArrow, IChevron, IHeart, IReply, IShare } from "./icons";
import type { LovePhoto } from "./types";
import type { MomentCard } from "./UpNext";

const LOOP_MS = 6000;

export default function MomentsViewer({
  moments,
  start,
  onClose,
  channelName,
  channelHandle,
  channelAvatar,
  channelAvatarUrl,
  subscribed,
  onSubscribe,
  onShare,
  onToast,
}: {
  moments: MomentCard[];
  start: number;
  onClose: () => void;
  channelName: string;
  channelHandle: string;
  channelAvatar: LovePhoto | null;
  channelAvatarUrl?: string;
  subscribed: boolean;
  onSubscribe: () => void;
  onShare: () => void;
  onToast: (m: string) => void;
}) {
  const [i, setI] = useState(start);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [big, setBig] = useState<{ key: number; x: number; y: number } | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const lastTap = useRef(0);
  const touchY = useRef<number | null>(null);
  const wheelLock = useRef(0);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const go = useCallback(
    (d: 1 | -1) => {
      setDir(d);
      setI((v) => (v + d + moments.length) % moments.length);
    },
    [moments.length],
  );

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "ArrowRight") go(1);
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  useEffect(() => {
    const t = window.setTimeout(() => go(1), LOOP_MS);
    return () => window.clearTimeout(t);
  }, [i, go]);

  const m = moments[i];
  const heart = (x: number, y: number) => {
    tick(12);
    setLiked((l) => ({ ...l, [i]: true }));
    setBig({ key: Date.now(), x, y });
  };

  return (
    <div className="wt-mv" role="dialog" aria-modal="true" aria-label="Moments">
      <div
        className="wt-mv-stage"
        onPointerUp={(e) => {
          const now = Date.now();
          if (now - lastTap.current < 300) {
            const r = e.currentTarget.getBoundingClientRect();
            heart(e.clientX - r.left, e.clientY - r.top);
            lastTap.current = 0;
          } else lastTap.current = now;
        }}
        onTouchStart={(e) => {
          touchY.current = e.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(e) => {
          const y0 = touchY.current;
          const y1 = e.changedTouches[0]?.clientY;
          touchY.current = null;
          if (y0 === null || y1 === undefined) return;
          if (Math.abs(y1 - y0) > 60) go(y1 < y0 ? 1 : -1);
        }}
        onWheel={(e) => {
          const now = Date.now();
          if (now - wheelLock.current < 600 || Math.abs(e.deltaY) < 20) return;
          wheelLock.current = now;
          go(e.deltaY > 0 ? 1 : -1);
        }}
      >
        <div key={i} className={`wt-mv-card ${dir > 0 ? "is-up" : "is-down"}`}>
          <div className="wt-mv-img">
            <Pic photo={m.photo} eager />
          </div>
          <div className="wt-mv-shade" />
          <span className="wt-mv-prog">
            <i style={{ animationDuration: `${LOOP_MS}ms` }} />
          </span>
        </div>

        {big ? (
          <span key={big.key} className="wt-mv-big" style={{ left: big.x, top: big.y }} aria-hidden="true">
            <IHeart size={96} color="#FF3E86" />
          </span>
        ) : null}

        <div className="wt-mv-top">
          <button ref={closeRef} type="button" className="wt-mv-ib" onClick={onClose} aria-label="Close">
            <IArrow size={24} color="#fff" />
          </button>
          <span className="wt-mv-label">Moments</span>
        </div>

        <div className="wt-mv-rail">
          <button
            type="button"
            className={`wt-mv-act${liked[i] ? " is-on" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (liked[i]) setLiked((l) => ({ ...l, [i]: false }));
              else heart(-999, -999);
            }}
            aria-pressed={!!liked[i]}
            aria-label="Heart this moment"
          >
            <span className="wt-mv-circle">
              <IHeart size={26} color={liked[i] ? "#FF3E86" : "#fff"} />
              {liked[i] && big ? <Burst key={big.key} count={8} /> : null}
            </span>
            <small>{liked[i] ? "you ♥" : m.hearts}</small>
          </button>
          <button type="button" className="wt-mv-act" onClick={(e) => { e.stopPropagation(); onToast("comments on this one: just “🥹” × 400"); }}>
            <span className="wt-mv-circle"><IReply size={24} color="#fff" /></span>
            <small>400</small>
          </button>
          <button type="button" className="wt-mv-act" onClick={(e) => { e.stopPropagation(); onShare(); }}>
            <span className="wt-mv-circle"><IShare size={24} color="#fff" /></span>
            <small>Share</small>
          </button>
          <span className="wt-mv-disc" aria-hidden="true">
            <Avatar photo={channelAvatar} url={channelAvatarUrl} name={channelName} size={30} />
          </span>
        </div>

        <div className="wt-mv-foot">
          <div className="wt-mv-ch">
            <Avatar photo={channelAvatar} url={channelAvatarUrl} name={channelName} size={32} />
            <b>{channelHandle}</b>
            {!subscribed ? (
              <button type="button" className="wt-mv-sub" onClick={(e) => { e.stopPropagation(); onSubscribe(); }}>
                Subscribe
              </button>
            ) : (
              <span className="wt-mv-subbed">Subscribed ♥</span>
            )}
          </div>
          <p className="wt-mv-cap">{m.caption}</p>
        </div>

        <div className="wt-mv-nav">
          <button type="button" className="wt-mv-ib is-solid" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous moment">
            <IChevron size={26} color="#fff" dir="up" />
          </button>
          <button type="button" className="wt-mv-ib is-solid" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next moment">
            <IChevron size={26} color="#fff" dir="down" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const MOMENTS_CSS = `
.wt-mv { position: fixed; inset: 0; z-index: 300; background: #0F0F0F; display: grid; place-items: center; animation: wtp-in .2s ease both; }
.wt-mv-stage { position: relative; height: 100dvh; aspect-ratio: 9 / 16; max-width: 100vw; overflow: hidden; touch-action: none; user-select: none; }
.wt-mv-card { position: absolute; inset: 0; animation: wt-mv-up .38s cubic-bezier(.2,.8,.2,1) both; }
.wt-mv-card.is-down { animation-name: wt-mv-down; }
@keyframes wt-mv-up { from { transform: translateY(30%); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes wt-mv-down { from { transform: translateY(-30%); opacity: 0; } to { transform: none; opacity: 1; } }
.wt-mv-img { position: absolute; inset: 0; animation: wt-mv-kb 6s ease-out both; }
@keyframes wt-mv-kb { from { transform: scale(1.08); } to { transform: scale(1); } }
.wt-mv-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.45), transparent 18%, transparent 58%, rgba(0,0,0,.8)); }
.wt-mv-prog { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: rgba(255,255,255,.25); }
.wt-mv-prog i { position: absolute; inset: 0; background: #FF3E86; transform-origin: 0 50%; animation: wt-mv-prog linear both; }
@keyframes wt-mv-prog { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.wt-mv-big { position: absolute; z-index: 4; pointer-events: none; transform: translate(-50%, -50%); animation: wt-mv-big .8s cubic-bezier(.2,1.4,.4,1) forwards; filter: drop-shadow(0 6px 20px rgba(255,62,134,.6)); }
@keyframes wt-mv-big { 0% { transform: translate(-50%,-50%) scale(.2) rotate(-12deg); opacity: 0; } 25% { transform: translate(-50%,-50%) scale(1.15) rotate(6deg); opacity: 1; } 70% { transform: translate(-50%,-50%) scale(1) rotate(0); opacity: 1; } 100% { transform: translate(-50%,-80%) scale(.9); opacity: 0; } }
.wt-mv-top { position: absolute; top: calc(8px + env(safe-area-inset-top, 0px)); left: 8px; right: 8px; z-index: 3; display: flex; align-items: center; gap: 6px; }
.wt-mv-label { font-size: 18px; font-weight: 700; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,.5); }
.wt-mv-ib { width: 44px; height: 44px; border: 0; border-radius: 50%; background: transparent; display: grid; place-items: center; cursor: pointer; }
.wt-mv-ib.is-solid { background: rgba(255,255,255,.12); }
.wt-mv-ib:hover { background: rgba(255,255,255,.18); }
.wt-mv-rail { position: absolute; right: 8px; bottom: 96px; z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.wt-mv-act { border: 0; background: none; padding: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; color: #fff; font-family: inherit; cursor: pointer; }
.wt-mv-act small { font-size: 12px; font-weight: 500; text-shadow: 0 1px 3px rgba(0,0,0,.6); }
.wt-mv-circle { position: relative; width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,.14); display: grid; place-items: center; transition: transform .15s ease; }
.wt-mv-act:active .wt-mv-circle { transform: scale(.9); }
.wt-mv-act.is-on .wt-mv-circle { background: rgba(255,62,134,.25); }
.wt-mv-disc { border-radius: 8px; overflow: hidden; border: 2px solid #fff; animation: wt-mv-spin 5s linear infinite; }
@keyframes wt-mv-spin { to { transform: rotate(360deg); } }
.wt-mv-foot { position: absolute; left: 12px; right: 72px; bottom: 22px; z-index: 3; color: #fff; }
.wt-mv-ch { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; min-width: 0; }
.wt-mv-ch b { font-size: 14px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wt-mv-sub { height: 32px; padding: 0 12px; border-radius: 16px; border: 0; background: #fff; color: #0F0F0F; font-family: inherit; font-size: 13px; font-weight: 500; cursor: pointer; flex: none; }
.wt-mv-subbed { font-size: 12px; color: rgba(255,255,255,.8); flex: none; }
.wt-mv-cap { margin: 0; font-size: 15px; line-height: 21px; text-shadow: 0 1px 4px rgba(0,0,0,.6); }
.wt-mv-nav { position: absolute; right: -64px; top: 50%; transform: translateY(-50%); display: none; flex-direction: column; gap: 12px; }
@media (min-width: 700px) {
  .wt-mv-stage { overflow: visible; height: min(calc(100dvh - 32px), 780px); border-radius: 16px; }
  .wt-mv-card { border-radius: 16px; overflow: hidden; }
  .wt-mv-nav { display: flex; }
  .wt-mv-rail { right: -64px; bottom: 16px; }
  .wt-mv-rail .wt-mv-circle { background: #272727; }
  .wt-mv-foot { right: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .wt-mv, .wt-mv-card, .wt-mv-img, .wt-mv-disc, .wt-mv-big { animation: none; }
}
`;
