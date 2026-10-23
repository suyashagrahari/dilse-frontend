"use client";

// ─── The opening: stained-glass casement windows onto a blossom garden ──────
// Poster: a blush wall, a white casement with a sage cornice and climbing
// wisteria, two leaded Tiffany sashes ("Magnolias and Irises", Met, CC0) closed
// over a cherry-blossom garden with hanging lanterns and a fountain. A light
// glint runs across the glass every few seconds. The guest's own name (?to=)
// and the couple's names sit above it.
// One tap (also the gesture that starts the music):
//   0.0 s  wind chimes + birdsong (synthesised, nothing to download)
//   0.0 s  the sashes swing OUT on their hinges (rotateY ±100°), a coloured
//          glint sweeps each pane, pastel light patches slide across the sill
//   0.1 s  light rays and a warm bloom open behind the glass
//   0.3 s  sakura petals drift in from the right on a sine path (WAAPI)
//   1.55 s the camera pushes through the open window, the poster fades away
//          and the hero (already decoded underneath) rises in.
// Decode first: the CTA stays "Opening your invitation…" until the art is ready.
// Reduced motion: no rotation, no particles, a 400 ms cross-fade.

import { useEffect, useMemo, useRef, useState } from "react";
import { useWeddingReducedMotion } from "../../_wedding";
import { A, decodeAll, img, seeded } from "../lib/art";

export interface OpeningProps {
  first: string;
  second: string;
  dateLine: string;
  /** The church (shown under the date). */
  place?: string;
  guest: string;
  onOpened: () => void;
}

type Phase = "closed" | "opening" | "push" | "gone";

/** Wind chimes and two bird calls, synthesised (no audio file to load). */
function playChimes() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const out = ctx.createGain();
    out.gain.value = 0.22;
    out.connect(ctx.destination);
    const now = ctx.currentTime;
    // Pentatonic chimes, staggered like a breeze through the bars.
    const notes = [1318.5, 1568, 1760, 2093, 2349.3, 1975.5, 2637];
    notes.forEach((f, i) => {
      const t = now + i * 0.13 + Math.random() * 0.05;
      [1, 2.76].forEach((mult, k) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = f * mult;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(k ? 0.05 : 0.16, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (k ? 0.6 : 2.2));
        o.connect(g).connect(out);
        o.start(t);
        o.stop(t + 2.3);
      });
    });
    // Two short chirps (a quick upward sweep, twice).
    [0.55, 0.75, 1.5].forEach((d) => {
      const t = now + d;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(2800, t);
      o.frequency.exponentialRampToValueAtTime(4600, t + 0.07);
      o.frequency.exponentialRampToValueAtTime(3200, t + 0.12);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 0.16);
    });
    window.setTimeout(() => void ctx.close().catch(() => undefined), 3200);
  } catch {
    /* no sound is fine */
  }
}

/** Petals drifting in from the right on a sine path (transform only). */
function releasePetals(host: HTMLElement | null, count: number, seed: number) {
  if (!host || typeof host.animate !== "function") return;
  const r = seeded(seed);
  const W = host.clientWidth;
  const H = host.clientHeight;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("img");
    p.src = A.petal.src;
    p.alt = "";
    p.decoding = "async";
    const size = 10 + r() * 12;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${W * (0.55 + r() * 0.5)}px`;
    p.style.top = `${-20 - r() * 60}px`;
    host.appendChild(p);
    const drift = W * (0.6 + r() * 0.7);
    const fall = H * (0.75 + r() * 0.35);
    const amp = 18 + r() * 26;
    const spin = (r() - 0.5) * 720;
    const frames: Keyframe[] = [];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8;
      frames.push({ transform: `translate3d(${-drift * t + Math.sin(t * Math.PI * 2 + i) * amp}px, ${fall * t}px, 0) rotate(${spin * t}deg)`, opacity: k === 8 ? 0 : 0.92 });
    }
    const anim = p.animate(frames, { duration: 3500 + r() * 2500, delay: r() * 1400, easing: "linear", fill: "forwards" });
    anim.onfinish = () => p.remove();
  }
}

export default function Opening({ first, second, dateLine, place, guest, onOpened }: OpeningProps) {
  const reduce = useWeddingReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const petalsRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const live = useRef(true);
  const opened = useRef(false);

  const ambient = useMemo(() => {
    const r = seeded(19);
    return Array.from({ length: 6 }, () => ({ x: 8 + r() * 84, delay: r() * 6, dur: 7 + r() * 5, size: 9 + r() * 7 }));
  }, []);

  // The page stays still behind the poster.
  useEffect(() => {
    if (phase === "gone") return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [phase]);

  // Decode the stage before anything moves (no half-painted glass).
  useEffect(() => {
    live.current = true;
    const list = timers.current;
    const imgs = Array.from(rootRef.current?.querySelectorAll<HTMLImageElement>(".c2-stage img") ?? []);
    void decodeAll(imgs, 2200).then(() => {
      if (live.current) setReady(true);
    });
    return () => {
      live.current = false;
      list.forEach((t) => window.clearTimeout(t));
    };
     
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const open = () => {
    if (phase !== "closed" || opened.current) return;
    opened.current = true;
    try {
      navigator.vibrate?.(12);
    } catch {}
    playChimes();
    if (reduce) {
      setPhase("push");
      onOpened();
      later(450, () => setPhase("gone"));
      return;
    }
    setPhase("opening");
    const small = window.innerWidth < 600 || (navigator.hardwareConcurrency || 8) <= 4;
    later(300, () => releasePetals(petalsRef.current, small ? 22 : 38, 7));
    const hero = Array.from(document.querySelectorAll<HTMLImageElement>(".c2-hero img"));
    const wait = Promise.all([decodeAll(hero, 1800), new Promise((r) => window.setTimeout(r, 1550))]);
    void wait.then(() => {
      if (!live.current) return;
      setPhase("push");
      onOpened();
      later(1000, () => setPhase("gone"));
    });
  };

  /** Straight to the invitation (still the music gesture), no window animation. */
  const skip = () => {
    if (phase !== "closed" || opened.current) return;
    opened.current = true;
    setPhase("push");
    onOpened();
    later(450, () => setPhase("gone"));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  if (phase === "gone") return null;
  const cls = `c2-open is-${phase}${ready ? " is-ready" : ""}${reduce ? " is-reduced" : ""}`;
  return (
    <div ref={rootRef} className={cls} data-c2-open={phase} role="dialog" aria-modal="true" aria-label="Wedding invitation">
      <div className="c2-open-blur" style={{ backgroundImage: `url(${A.gardenBg.src})` }} aria-hidden />
      <div className="c2-open-wall" aria-hidden />
      <div className="c2-open-inner">
        <div className="c2-open-copy">
          <p className="c2-open-dear">
            {guest ? (
              <>
                Dear <b>{guest}</b>, you are invited
              </>
            ) : (
              "You are invited to the wedding of"
            )}
          </p>
          <h1 className="c2-open-names">
            {first} <i>&amp;</i> {second}
          </h1>
          {dateLine && <p className="c2-open-date">{dateLine}</p>}
          {place && <p className="c2-open-place">{place}</p>}
        </div>

        <div className="c2-stage-wrap">
          <div className="c2-stage" onClick={open} onKeyDown={onKey} aria-hidden>
            <div className="c2-aperture">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("gardenBg", { high: true })} className="c2-garden-bg" />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("fountain")} className="c2-garden-fountain" style={{ width: "52%", height: "auto" }} />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("lanterns")} className="c2-garden-lantern is-l" style={{ height: "auto" }} />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("lanterns")} className="c2-garden-lantern is-r" style={{ height: "auto" }} />
              <i className="c2-garden-glow" />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("rays", { sizes: "(max-width: 600px) 90vw, 50vw" })} className="c2-rays" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("frame", { high: true })} className="c2-frame-img" />
            <div className="c2-sash is-l">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("sashL", { high: true })} />
              <span className="c2-sash-glint" />
              <span className="c2-sash-shade" />
            </div>
            <div className="c2-sash is-r">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("sashR", { high: true })} />
              <span className="c2-sash-glint" />
              <span className="c2-sash-shade" />
            </div>
            <div className="c2-patches">
              <i />
              <i />
              <i />
            </div>
            <div ref={petalsRef} className="c2-petals">
              {!reduce &&
                phase === "closed" &&
                ambient.map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={A.petal.src}
                    alt=""
                    className="c2-petal-ambient"
                    style={{ left: `${p.x}%`, width: p.size, height: p.size, animation: `c2-ambient ${p.dur}s linear ${p.delay}s infinite` }}
                  />
                ))}
            </div>
          </div>
        </div>

        <div className="c2-open-cta">
          <button type="button" className="c2-btn is-blush c2-open-btn" onClick={open} disabled={!ready} aria-label={`Open invitation: ${first} and ${second}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M4 21h16M12 3v18M9.5 12h.01M14.5 12h.01" />
            </svg>
            {ready ? "Open the windows" : "Opening your invitation…"}
          </button>
          <p className="c2-open-hint">
            Tap to open · with music
            <button type="button" className="c2-open-skip" onClick={skip} disabled={!ready}>
              Skip
            </button>
          </p>
        </div>
      </div>
      <style>{`@keyframes c2-ambient { 0% { transform:translate3d(0,0,0) rotate(0deg); opacity:0; } 10% { opacity:.85; } 100% { transform:translate3d(-60px, 105vh, 0) rotate(320deg); opacity:0; } } .c2-petal-ambient { position:absolute; top:-24px; }`}</style>
    </div>
  );
}
