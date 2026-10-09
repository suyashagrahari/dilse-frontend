"use client";

// The three acts. One tactile move each, and each one reveals the sender's words:
//   Act I   pull the focus ring until the still snaps sharp → the subtitle types in
//   Act II  hold for slow motion: black-and-white → colour, a slow push-in, the subtitle word by word
//   Act III swipe the trailer: "coming soon" cards slam in over flashes of the photos

import { useCallback, useEffect, useRef, useState } from "react";
import { haptic, useHoldProgress, useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, usePremium } from "../../../_valentine/kit/premium";
import { Dock, Flash, Still, Typed } from "./parts";
import type { Film } from "./util";

function Next({ label, onClick, cue = "pr-clap" }: { label: string; onClick: () => void; cue?: string }) {
  const { sfx } = usePremium();
  return (
    <div className="pr-fade">
      <PremiumCTA tone="gold" cue={null} className="pr-cta" onClick={() => { sfx(cue); onClick(); }}>
        {label}
      </PremiumCTA>
    </div>
  );
}

function ActCard({ n, name, hide }: { n: string; name: string; hide?: boolean }) {
  return (
    <div className="pr-actcard" style={{ opacity: hide ? 0 : 1, transition: "opacity 1s var(--pr-ease)" }}>
      <span className="pr-eyebrow">Act {n}</span>
      <span className="pr-actname">{name}</span>
    </div>
  );
}

// ── Act I · pull focus ─────────────────────────────────────────────────────────────────────────────────────────
const RING_DIST = 240; // px of ring travel from soft to sharp
const NUMS = ["∞", "30", "15", "10", "7", "5", "4", "3", "2.5", "2", "1.7", "1.5", "1.2", "1", "0.8", "0.6", "0.5", "0.45", "0.4", "0.35", "0.3", "0.28"];

export function ActOne({ film, onNext }: { film: Film; onNext: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState(0);
  const [locked, setLocked] = useState(false);
  const [typed, setTyped] = useState(false);
  const [offset, setOffset] = useState(0);
  const drag = useRef<{ x: number; last: number; moved: number; base: number } | null>(null);
  const travelled = useRef(0);
  const detent = useRef(0);
  const anim = useRef<number | null>(null);

  const apply = useCallback(
    (f: number) => {
      if (locked) return;
      const v = Math.min(1, Math.max(0, f));
      setFocus(v);
      if (v >= 0.97) {
        setFocus(1);
        setLocked(true);
        sfx("pr-ding");
        haptic([8, 40, 14]);
      }
    },
    [locked, sfx],
  );

  // tap / keyboard fallback: glide the ring to sharp
  const glide = useCallback(() => {
    if (locked || anim.current) return;
    const from = travelled.current;
    const t0 = performance.now();
    const step = (t: number) => {
      const u = Math.min(1, (t - t0) / (reduce ? 200 : 1100));
      const e = 1 - Math.pow(1 - u, 3);
      const tr = from + (RING_DIST - from) * e;
      travelled.current = tr;
      setOffset(-tr);
      if (Math.floor(tr / 14) !== detent.current) {
        detent.current = Math.floor(tr / 14);
        sfx("pr-detent", { gain: 0.7 });
      }
      apply(tr / RING_DIST);
      if (u < 1) anim.current = requestAnimationFrame(step);
      else anim.current = null;
    };
    anim.current = requestAnimationFrame(step);
  }, [apply, locked, reduce, sfx]);
  useEffect(() => () => { if (anim.current) cancelAnimationFrame(anim.current); }, []);

  const onDown = (e: React.PointerEvent) => {
    if (locked) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, last: e.clientX, moved: 0, base: offset };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || locked) return;
    const dx = e.clientX - d.last;
    d.last = e.clientX;
    d.moved += Math.abs(dx);
    travelled.current = Math.min(RING_DIST * 1.2, travelled.current + Math.abs(dx));
    setOffset(Math.max(-560, Math.min(560, d.base + (e.clientX - d.x))));
    const k = Math.floor(travelled.current / 14);
    if (k !== detent.current) {
      detent.current = k;
      sfx("pr-detent", { gain: 0.7, detune: (Math.random() - 0.5) * 80 });
      haptic(3);
    }
    apply(travelled.current / RING_DIST);
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && d.moved < 6) glide();
  };

  return (
    <div className="pr-scene">
      <div className="pr-frame">
        <Still photo={film.one} grade="warm" kb="in" eager over={{ blur: 16, opacity: 1 - focus }} />
      </div>
      <div className="pr-in">
        <span className="pr-scrim top" aria-hidden />
        <span className="pr-scrim" aria-hidden />
        <ActCard n="I" name="How it started" hide={typed} />
        <div className={`pr-af${locked ? " is-lock" : ""}${typed ? " is-gone" : ""}`} aria-hidden>
          <i /><i /><i /><i />
        </div>
        <div className="pr-subwrap" aria-live="polite">
          {locked && (
            <p className="pr-sub">
              <Typed text={film.actOne} play speed={34} onDone={() => window.setTimeout(() => setTyped(true), 500)} />
            </p>
          )}
        </div>
      </div>
      <Dock>
        {typed ? (
          <Next label="Cut to Act II" onClick={onNext} />
        ) : (
          <>
            <span className="pr-hint" style={{ opacity: locked ? 0 : 1, transition: "opacity .4s" }}>
              Drag the ring to focus
            </span>
            <div className="pr-ring" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} style={{ opacity: locked ? 0.4 : 1, transition: "opacity .6s" }}>
              <div className="pr-ringTrack" style={{ transform: `translate3d(${offset}px,0,0)` }}>
                <div className="pr-ringNums" style={{ paddingLeft: 600 }}>
                  {NUMS.concat(NUMS).map((t, i) => (
                    <span key={i}>{t}</span>
                  ))}
                </div>
              </div>
              <span className="pr-ringIdx" aria-hidden />
              <button
                type="button"
                className="pr-ringBtn"
                aria-label="Pull focus"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    glide();
                  }
                }}
                style={{ pointerEvents: "none" }}
              />
            </div>
          </>
        )}
      </Dock>
    </div>
  );
}

// ── Act II · hold for slow motion ───────────────────────────────────────────────────────────────────────────────
export function ActTwo({ film, onNext }: { film: Film; onNext: () => void }) {
  const { sfx, music } = usePremium();
  const [flash, setFlash] = useState(0);
  const [ready, setReady] = useState(false);
  const words = film.actTwo.split(/\s+/).filter(Boolean);
  const hold = useHoldProgress({
    duration: 3400,
    taps: 6,
    onComplete: () => {
      setFlash((k) => k + 1);
      sfx("sparkle", { gain: 0.8 });
      sfx("pr-ding", { at: 0.05, gain: 0.6 });
      haptic([10, 50, 20]);
      window.setTimeout(() => setReady(true), 1700);
    },
  });
  const p = hold.done ? 1 : hold.progress;
  const holding = hold.holding && !hold.done;

  // slow motion has its own sound: the song sinks, a heartbeat comes up
  const musicRef = useRef(music);
  useEffect(() => {
    musicRef.current = music;
  });
  useEffect(() => {
    if (!holding) return;
    const m = musicRef.current;
    if (m?.canFade) m.fadeTo(0.4, 500);
    sfx("heartbeat", { gain: 0.7 });
    const id = window.setInterval(() => sfx("heartbeat", { gain: 0.7 }), 900);
    return () => {
      window.clearInterval(id);
      if (m?.canFade) m.fadeTo(1, 900);
    };
  }, [holding, sfx]);

  const shown = hold.done ? words.length : Math.floor(p * (words.length + 0.6));
  return (
    <div className="pr-scene">
      <div className="pr-frame">
        <Still photo={film.two} grade="warm" kb={false} eager zoom={1.02 + 0.14 * p} over={{ grade: "noir", opacity: 1 - p }} />
      </div>
      <div className="pr-in">
        <span className="pr-scrim top" aria-hidden />
        <span className="pr-scrim" aria-hidden />
        <ActCard n="II" name="The moment I knew" />
        <span className={`pr-fps${holding ? " is-on" : ""}`} aria-hidden>
          120 fps
        </span>
        <div className="pr-subwrap">
          <p className="pr-sub" aria-label={film.actTwo}>
            {words.map((w, i) => (
              <span key={i} aria-hidden className={`pr-word${i < shown ? " is-on" : ""}`}>
                {w}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </p>
        </div>
        <Flash k={flash} />
      </div>
      <Dock>
        {ready ? (
          <Next label="Cut to Act III" onClick={onNext} />
        ) : (
          <>
            <button type="button" className={`pr-hold${holding ? " is-on" : ""}`} {...hold.bind} aria-label="Press and hold for slow motion">
              <svg viewBox="0 0 100 100" aria-hidden>
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(233,230,223,.14)" strokeWidth="3" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="#D8B25A" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${p * 289} 289`} />
              </svg>
              <span className="pr-dot" />
            </button>
            <span className="pr-hint" style={{ opacity: hold.done ? 0 : 1 }}>
              Hold for slow motion
            </span>
          </>
        )}
      </Dock>
    </div>
  );
}

/** Trailer type is set huge; the longest word decides how huge, so "TOOTHBRUSHES." never overflows a phone. */
function fit(t: string): string {
  const longest = Math.max(4, ...t.split(/\s+/).map((w) => w.length));
  return `min(clamp(30px, 9.6vw, 84px), ${(84 / (longest * 0.78)).toFixed(2)}vw)`;
}

// ── Act III · the trailer ────────────────────────────────────────────────────────────────────────────────────────
export function ActThree({ film, onNext }: { film: Film; onNext: () => void }) {
  const { sfx } = usePremium();
  const [i, setI] = useState(-1);
  const [flash, setFlash] = useState(0);
  const down = useRef<{ x: number; y: number } | null>(null);
  const n = film.soon.length;
  const last = i >= n - 1;

  const advance = useCallback(() => {
    if (i >= n - 1) return;
    setI((v) => v + 1);
    setFlash((k) => k + 1);
    sfx("pr-braam", { gain: 0.9, detune: (Math.random() - 0.5) * 60 });
    sfx("whoosh", { gain: 0.35 });
    haptic(14);
  }, [i, n, sfx]);

  const photo = i >= 0 && film.trailer.length ? film.trailer[i % film.trailer.length] : null;
  return (
    <div
      className="pr-scene pr-trailer"
      onPointerDown={(e) => (down.current = { x: e.clientX, y: e.clientY })}
      onPointerUp={(e) => {
        const d = down.current;
        down.current = null;
        if (!d) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        if ((Math.abs(dx) < 10 && Math.abs(dy) < 10) || dx < -40) advance();
      }}
    >
      <div className="pr-frame">
        {photo && (
          <div key={i} className="pr-scene pr-fade">
            <Still photo={photo} grade="teal" kb={i % 2 ? "out" : "in"} drift={9} style={{ opacity: 0.4 }} />
          </div>
        )}
      </div>
      <div className="pr-in">
        {i < 0 ? (
          <div className="pr-center" key="intro">
            <p className="pr-eyebrow pr-fade">Act III</p>
            <h2 className="pr-display pr-it pr-title pr-fade" style={{ animationDelay: ".25s", fontSize: "clamp(44px, 13vw, 120px)" }}>
              Coming soon
            </h2>
          </div>
        ) : (
          <div className="pr-tcard" key={i}>
            <p className="pr-eyebrow pr-tkick pr-fade">Coming soon</p>
            <p className="pr-ttext pr-display" style={{ fontSize: fit(film.soon[i]) }}>
              {film.soon[i]}
            </p>
          </div>
        )}
        <Flash k={flash} />
      </div>
      <Dock>
        {last ? (
          <Next label="Director's commentary" onClick={onNext} cue="page-turn" />
        ) : (
          <>
            <div className="pr-ticks" aria-hidden>
              {film.soon.map((_, k) => (
                <i key={k} className={k <= i ? "is-on" : ""} />
              ))}
            </div>
            <button type="button" className="pr-link" onClick={(e) => { e.stopPropagation(); advance(); }} onPointerUp={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
              {i < 0 ? "Swipe for the trailer ›" : "Swipe ›"}
            </button>
          </>
        )}
      </Dock>
    </div>
  );
}
