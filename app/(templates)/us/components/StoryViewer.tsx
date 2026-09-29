"use client";

// ─── Story viewer ────────────────────────────────────────────────────────────
//
// Progress segments that fill on their own (a CSS animation — pausing it is
// just animation-play-state), tap the left third to go back and the rest to go
// forward, press-and-hold to pause, swipe down / ✕ to close, and the reply bar
// with its heart. On the web it is the dark stage with the 9:16 card in the
// middle and neighbouring highlights peeking either side.

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Pic from "./Pic";
import { ChevronLeft, ChevronRight, CloseIcon, DotsIcon, HeartIcon, SendIcon } from "./icons";
import { PALETTE as P, TIMING, WORDMARK, WORDMARK_FONT, type Highlight, type ProfileData } from "./types";

const AGO = ["2w", "5w", "11w", "34w", "1y", "2y"];

interface Floater {
  id: number;
  e: string;
  dx: number;
  left: number;
}

export default function StoryViewer({
  data,
  highlights,
  start,
  web,
  onClose,
  onToast,
  onSeen,
}: {
  data: ProfileData;
  highlights: Highlight[];
  start: number;
  web: boolean;
  onClose: () => void;
  onToast: (t: string) => void;
  onSeen: () => void;
}) {
  const [h, setH] = useState(start);
  const [s, setS] = useState(0);
  const [held, setHeld] = useState(false);
  const [typing, setTyping] = useState(false);
  const [reply, setReply] = useState("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [restart, setRestart] = useState(0);
  const press = useRef<{ t: number; x: number; y: number; timer: number } | null>(null);

  const hl = highlights[h];
  const slide = hl?.slides[s];
  const key = `${h}-${s}`;
  const paused = held || typing;

  const next = useCallback(() => {
    const cur = highlights[h];
    if (!cur) return onClose();
    if (s < cur.slides.length - 1) setS(s + 1);
    else if (h < highlights.length - 1) {
      setH(h + 1);
      setS(0);
    } else {
      onSeen();
      onClose();
    }
  }, [h, s, highlights, onClose, onSeen]);

  const prev = useCallback(() => {
    if (s > 0) setS(s - 1);
    else if (h > 0) {
      setH(h - 1);
      setS(0);
    } else setRestart((r) => r + 1);
  }, [h, s]);

  const jump = (i: number) => {
    setH(i);
    setS(0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  const burst = (emoji: string, n = 5) => {
    const base = Date.now();
    const add = Array.from({ length: n }, (_, i) => ({ id: base + i, e: emoji, dx: (i - n / 2) * 18 + (i % 2 ? 8 : -8), left: 70 + (i % 3) * 8 }));
    setFloaters((f) => [...f, ...add]);
    window.setTimeout(() => setFloaters((f) => f.filter((x) => !add.some((a) => a.id === x.id))), 1900);
  };

  if (!hl || !slide) return null;

  const onDown = (e: React.PointerEvent) => {
    const timer = window.setTimeout(() => setHeld(true), 180);
    press.current = { t: Date.now(), x: e.clientX, y: e.clientY, timer };
  };
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const pr = press.current;
    press.current = null;
    if (!pr) return;
    window.clearTimeout(pr.timer);
    const wasHold = Date.now() - pr.t > 250;
    setHeld(false);
    if (e.clientY - pr.y > 90) return onClose();
    if (wasHold) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width * 0.3) prev();
    else next();
  };

  const likedNow = !!liked[key];

  const card = (
    <div className="us-st-card" style={web ? undefined : { borderRadius: 0 }}>
      <div key={`${key}-${restart}`} className="us-st-img">
        <Pic src={slide.imageUrl} crop={slide.crop} eager style={{ width: "100%", height: "100%" }} />
      </div>
      <div className="us-st-shade" />
      <div className="us-st-bars">
        {hl.slides.map((_, i) => (
          <div key={i} className="us-st-bar">
            {i < s ? <i style={{ transform: "scaleX(1)" }} /> : null}
            {i === s ? (
              <i
                key={`${key}-${restart}`}
                className="us-story-bar-fill"
                style={{ animation: `us-story-bar ${TIMING.storyMs}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
                onAnimationEnd={next}
              />
            ) : null}
          </div>
        ))}
      </div>
      <div className="us-st-head">
        <span style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", display: "block", flexShrink: 0 }}>
          <Pic src={data.avatarUrl} crop={data.avatarCrop} eager style={{ width: "100%", height: "100%" }} />
        </span>
        <b>{hl.title}</b>
        <span style={{ opacity: 0.7 }}>{AGO[h % AGO.length]}</span>
        <span style={{ flex: 1 }} />
        {paused && held ? <span style={{ fontSize: 12, opacity: 0.8 }}>paused</span> : null}
        <button type="button" className="us-ico" onClick={() => onToast("screenshot notifications are on. just kidding 😌")} aria-label="Options">
          <DotsIcon size={22} color="#fff" />
        </button>
        {!web ? (
          <button type="button" className="us-ico" onClick={onClose} aria-label="Close story">
            <CloseIcon size={24} color="#fff" />
          </button>
        ) : null}
      </div>

      <div className="us-st-tap" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => setHeld(false)} onContextMenu={(e) => e.preventDefault()} />

      {slide.caption ? (
        <div key={`c-${key}`} className="us-st-caption">
          <span>{slide.caption}</span>
        </div>
      ) : null}
      {s === 0 ? (
        <span className="us-st-sticker" aria-hidden>
          💞
        </span>
      ) : null}

      <form
        className="us-st-reply"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reply.trim()) return;
          setReply("");
          burst("💌", 4);
          onToast("Message sent 💌");
          (document.activeElement as HTMLElement | null)?.blur();
        }}
      >
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value.slice(0, 200))}
          onFocus={() => setTyping(true)}
          onBlur={() => setTyping(false)}
          placeholder={`Reply to ${data.handle}…`}
          aria-label="Reply to story"
          enterKeyHint="send"
        />
        <button
          type="button"
          className="us-ico"
          aria-label={likedNow ? "Unlike story" : "Like story"}
          onClick={() => {
            setLiked((l) => ({ ...l, [key]: !likedNow }));
            if (!likedNow) burst("❤️", 6);
          }}
        >
          <span key={String(likedNow)} className={likedNow ? "us-pop" : ""} style={{ display: "block" }}>
            <HeartIcon size={26} color={likedNow ? P.likeRed : "#fff"} filled={likedNow} />
          </span>
        </button>
        <button type="submit" className="us-ico" aria-label="Send reply">
          <SendIcon size={24} color="#fff" />
        </button>
      </form>

      {floaters.map((f) => (
        <span key={f.id} className="us-st-float" style={{ left: `${f.left}%`, "--dx": `${f.dx}px` } as CSSProperties} aria-hidden>
          {f.e}
        </span>
      ))}
    </div>
  );

  if (!web) {
    return (
      <div className="us-st-phone" role="dialog" aria-modal="true" aria-label={`Story: ${hl.title}`}>
        {card}
      </div>
    );
  }

  const peek = (i: number, side: "l" | "r") => {
    const o = highlights[i];
    if (!o) return <span className="us-st-peek is-empty" aria-hidden />;
    return (
      <button type="button" className={`us-st-peek is-${side}`} onClick={() => jump(i)} aria-label={`Open highlight ${o.title}`}>
        <Pic src={o.coverUrl} style={{ position: "absolute", inset: 0 }} />
        <span className="us-st-peek-in">
          <span style={{ width: 56, height: 56, borderRadius: "50%", padding: 2, background: "#fff", display: "block" }}>
            <Pic src={data.avatarUrl} crop={data.avatarCrop} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
          </span>
          <b>{o.title}</b>
          <span style={{ opacity: 0.8, fontSize: 12 }}>{AGO[i % AGO.length]}</span>
        </span>
      </button>
    );
  };

  return (
    <div className="us-st-stage" role="dialog" aria-modal="true" aria-label={`Story: ${hl.title}`}>
      <div className="us-st-word" style={{ fontFamily: WORDMARK_FONT }}>
        {WORDMARK}
      </div>
      <button type="button" className="us-st-x" onClick={onClose} aria-label="Close story">
        <CloseIcon size={28} color="#fff" />
      </button>
      {peek(h - 1, "l")}
      <div className="us-st-center">
        {card}
        {h > 0 || s > 0 ? (
          <button type="button" className="us-st-arrow is-l" onClick={prev} aria-label="Previous">
            <ChevronLeft size={14} strokeWidth={3} />
          </button>
        ) : null}
        <button type="button" className="us-st-arrow is-r" onClick={next} aria-label="Next">
          <ChevronRight size={14} strokeWidth={3} />
        </button>
      </div>
      {peek(h + 1, "r")}
    </div>
  );
}

export const STORY_CSS = `
.us-st-phone{position:fixed;inset:0;z-index:240;background:#000;animation:us-zoom .22s ease}
.us-st-phone .us-st-card{width:100%;height:100%}
.us-st-card{position:relative;overflow:hidden;background:#111;border-radius:8px;color:#fff;touch-action:none}
.us-st-img{position:absolute;inset:0;animation:us-story-in .5s ease}
.us-st-shade{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.45),transparent 18%,transparent 70%,rgba(0,0,0,.55));pointer-events:none}
.us-st-bars{position:absolute;top:calc(8px + env(safe-area-inset-top,0px));left:8px;right:8px;display:flex;gap:3px;z-index:3}
.us-st-bar{flex:1;height:2px;border-radius:2px;background:rgba(255,255,255,.35);overflow:hidden}
.us-st-bar i{display:block;height:100%;background:#fff;transform-origin:left;transform:scaleX(0)}
.us-st-head{position:absolute;top:calc(18px + env(safe-area-inset-top,0px));left:12px;right:4px;display:flex;align-items:center;gap:8px;z-index:4;font-size:14px;text-shadow:0 1px 2px rgba(0,0,0,.3)}
.us-st-head b{font-weight:600}
.us-st-tap{position:absolute;inset:70px 0 76px;z-index:2;cursor:pointer}
.us-st-caption{position:absolute;left:10%;right:10%;bottom:24%;z-index:3;text-align:center;pointer-events:none;animation:us-bubble-in .5s cubic-bezier(.2,1.3,.4,1) .15s backwards}
.us-st-caption span{display:inline;background:#fff;color:#111;font-weight:700;font-size:17px;line-height:1.55;padding:3px 8px;border-radius:6px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.us-st-sticker{position:absolute;top:18%;right:12%;z-index:3;font-size:44px;transform:rotate(12deg);animation:us-sticker 2.8s ease-in-out infinite;pointer-events:none}
.us-st-reply{position:absolute;left:0;right:0;bottom:0;z-index:4;display:flex;align-items:center;gap:4px;padding:10px 8px calc(12px + env(safe-area-inset-bottom,0px)) 14px}
.us-st-reply input{flex:1;min-width:0;height:44px;border-radius:22px;border:1px solid rgba(255,255,255,.7);background:transparent;color:#fff;padding:0 18px;font:inherit;font-size:16px;outline:0}
.us-st-reply input::placeholder{color:rgba(255,255,255,.85)}
.us-st-float{position:absolute;bottom:70px;z-index:5;font-size:30px;pointer-events:none;animation:us-float-up 1.8s ease-out forwards}
.us-st-stage{position:fixed;inset:0;z-index:240;background:#1A1A1A;display:flex;align-items:center;justify-content:center;gap:40px;animation:us-fade .2s ease}
.us-st-center{position:relative}
.us-st-stage .us-st-card{height:min(94vh, 860px);aspect-ratio:9/16}
.us-st-word{position:absolute;top:18px;left:22px;color:#fff;font-size:30px}
.us-st-x{position:absolute;top:16px;right:18px}
.us-st-arrow{position:absolute;top:50%;margin-top:-13px;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.85)!important;display:grid;place-items:center}
.us-st-arrow.is-l{left:-40px}.us-st-arrow.is-r{right:-40px}
.us-st-peek{position:relative;width:min(16vw,200px);aspect-ratio:9/16;border-radius:8px;overflow:hidden;opacity:.55;transition:opacity .2s,transform .2s;color:#fff}
.us-st-peek:hover{opacity:.85;transform:scale(1.03)}
.us-st-peek.is-empty{visibility:hidden}
.us-st-peek-in{position:absolute;inset:0;background:rgba(0,0,0,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-size:14px}
@media (max-width:1023px){.us-st-peek{display:none}}
@keyframes us-sticker{0%,100%{transform:rotate(12deg) scale(1)}50%{transform:rotate(4deg) scale(1.12)}}
`;
