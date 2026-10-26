"use client";

// ─── The opening: a lotus blooms in a still temple pond ──────────────────────
// Poster: ivory tile, gold string lights twinkling across the top, brass lamps
// hanging on both sides (unlit), "Shri Ganeshay Namah", the guest's own name
// when the link carries ?to=, the couple's names, and a closed pink lotus bud
// on a still pond with lotus leaves, buds and seed pods.
// One tap (also the gesture that starts the music, via the engine):
//   0.0 s  the lamps light one by one, a ripple runs out over the pond
//   0.3 s  the petals unfold ring by ring, petals drift up
//   2.5 s  warm light blooms out of the lotus to fill the screen as the
//          camera sinks into it (as the royal and palace-door openings), then
//          gives way to the hero (already decoded underneath, at the top).
// Transform/opacity only. Reduced motion: a plain 400 ms crossfade.

import { useEffect, useMemo, useRef, useState } from "react";
import { useWeddingReducedMotion } from "../../../_wedding";
import LotusBloom from "./LotusBloom";
import { decodeAll, img, seeded } from "./art";
import type { Strings } from "./model";

export interface OpeningProps {
  first: string;
  second: string;
  dateLine: string;
  guest: string;
  s: Strings;
  lang: "en" | "hi";
  invocation: boolean;
  onOpened: () => void;
}

type Phase = "closed" | "bloom" | "push" | "gone";

export default function Opening({ first, second, dateLine, guest, s, lang, invocation, onOpened }: OpeningProps) {
  const reduce = useWeddingReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const live = useRef(true);

  const motes = useMemo(() => {
    const r = seeded(41);
    return Array.from({ length: 14 }, () => ({ x: (r() - 0.5) * 70, delay: r() * 1.4, dur: 2.6 + r() * 1.8, dx: (r() - 0.5) * 120, rot: (r() - 0.5) * 220, size: 9 + r() * 9 }));
  }, []);
  const twinkles = useMemo(() => {
    const r = seeded(7);
    return Array.from({ length: 16 }, () => ({ x: 3 + r() * 94, y: 2 + r() * 22, delay: -r() * 4, dur: 2.2 + r() * 2.6 }));
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

  // Decode the poster's own art before its entrance plays (no half-painted frames).
  useEffect(() => {
    live.current = true;
    const list = timers.current;
    const imgs = Array.from(rootRef.current?.querySelectorAll("img") ?? []);
    void decodeAll(imgs, 1500).then(() => {
      if (live.current) setReady(true);
    });
    return () => {
      live.current = false;
      list.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const open = () => {
    if (phase !== "closed") return;
    try {
      navigator.vibrate?.(15);
    } catch {}
    if (reduce) {
      setPhase("push");
      later(30, onOpened);
      later(430, () => setPhase("gone"));
      return;
    }
    setPhase("bloom");
    // The hero is already in the DOM underneath: decode it while the lotus opens.
    const hero = Array.from(document.querySelectorAll<HTMLImageElement>(".lw-hero img"));
    const wait = Promise.all([decodeAll(hero, 2200), new Promise((r) => window.setTimeout(r, 2500))]);
    void wait.then(() => {
      if (!live.current) return;
      setPhase("push");
      onOpened();
      later(2000, () => setPhase("gone"));
    });
  };

  if (phase === "gone") return null;
  const lit = phase !== "closed";
  return (
    <div ref={rootRef} className={`lw-open is-${phase}${ready ? " is-ready" : ""}${reduce ? " is-reduced" : ""}`} data-lw-open={phase}>
      <div className="lw-open-world">
        <div className="lw-open-tile" aria-hidden />
        <div className="lw-open-garland" aria-hidden />
        <div className="lw-open-lights" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("lights", { high: true })} className="lw-lights-a" />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("lights")} className="lw-lights-b" />
          {twinkles.map((t, i) => (
            <i key={i} className="lw-twinkle" style={{ left: `${t.x}%`, top: `${t.y}vh`, animationDelay: `${t.delay}s`, animationDuration: `${t.dur}s` }} />
          ))}
        </div>
        <div className="lw-open-lamps" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`lw-lamp lw-lamp-${i}${lit ? " is-lit" : ""}`} style={{ ["--i" as string]: i }}>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("lamp")} />
              <i className="lw-lamp-glow" />
              <i className="lw-lamp-flame lw-lamp-flame-l" />
              <i className="lw-lamp-flame lw-lamp-flame-r" />
            </span>
          ))}
        </div>
        <div className="lw-open-side" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("lotusCluster")} className="lw-open-cluster" />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("lotusPair")} className="lw-open-pair" />
        </div>

        <div className="lw-open-copy">
          {invocation && (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...img("shriGanesh", { high: true })} alt="Shri Ganeshay Namah" className="lw-open-ganesh" />
          )}
          <p className="lw-open-dear" lang={lang}>
            {guest ? (
              <>
                {s.dear} <b>{guest}</b>, {lang === "hi" ? s.invited : s.invited.toLowerCase()}
              </>
            ) : (
              s.invited
            )}
          </p>
          <p className="lw-open-names">
            <span>{first}</span>
            <i>&amp;</i>
            <span>{second}</span>
          </p>
          {dateLine && <p className="lw-open-date">{dateLine}</p>}
        </div>

        <div className="lw-open-stage">
          <div className="lw-pond" aria-hidden>
            <span className="lw-pond-water" />
            <span className="lw-ripple" />
            <span className="lw-ripple" />
            <span className="lw-ripple" />
            <span className="lw-ripple lw-ripple-burst" />
          </div>
          <div className="lw-stems" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("leafStem")} className="lw-stem lw-stem-leaf" />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("budB")} className="lw-stem lw-stem-budb" />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("leafTilt")} className="lw-stem lw-stem-tilt" />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("podA")} className="lw-stem lw-stem-pod" />
          </div>
          <span className="lw-pad lw-pad-l" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("leafLarge")} />
          </span>
          <span className="lw-pad lw-pad-r" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("leafLarge")} />
          </span>
          <button type="button" className="lw-open-lotus" onClick={open} aria-label={`${s.open}: ${first} ${s.and} ${second}`}>
            <LotusBloom open={phase === "bloom" || phase === "push"} />
          </button>
          {phase === "bloom" && !reduce && (
            <div className="lw-motes" aria-hidden>
              {motes.map((m, i) => (
                <i
                  key={i}
                  style={{ left: `calc(50% + ${m.x}%)`, width: m.size, height: m.size * 1.6, animationDelay: `${m.delay}s`, animationDuration: `${m.dur}s`, ["--dx" as string]: `${m.dx}px`, ["--rot" as string]: `${m.rot}deg` }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lw-open-cta">
          <button type="button" className="lw-open-btn" onClick={open} lang={lang}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
              <path d="M12 19c-3-2.4-3.6-6.6 0-11 3.6 4.4 3 8.6 0 11zM12 19c-4.2-.4-7-3-7-6.4 3.2.2 5.7 2.4 7 6.4zM12 19c4.2-.4 7-3 7-6.4-3.2.2-5.7 2.4-7 6.4z" />
            </svg>
            {s.open}
          </button>
          <p className="lw-open-hint" lang={lang}>
            {s.openHint}
          </p>
        </div>
      </div>
      {/* The step-through: a circle of warm light grows out of the lotus and fills the screen. */}
      <span className="lw-open-bloom" aria-hidden />
    </div>
  );
}
