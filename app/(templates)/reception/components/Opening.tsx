"use client";

// ─── The opening: white-and-gold ballroom doors push open toward the guest ───
//
// Closed: a champagne foyer — gold string lights across the top, blush roses in
// the corners, the guest's own name (?to=), the couple's names, and a pair of
// white-and-gold Louis XIV doors (the Met, CC0) in their gilded frame. Through
// the keyhole-gap a warm glow; a slow glint runs over the brass.
//
// One tap (also the gesture that starts the music):
//   0.00 s  the brass latch clicks (a synthesised glass chime), the doors begin
//           to swing OUTWARD toward the guest (rotateY ±105°, 1.6 s), shading
//           deepening on each leaf as it turns away from the light
//   0.12 s  light rays and a warm bloom spill out; the chandelier flickers on
//           (two quick dips), the string lights twinkle
//   0.30 s  champagne sparkles rise through the doorway
//   0.95 s  the camera walks through the doorway (the stage scales up)
//   1.55 s  the foyer fades to the invitation underneath (already decoded)
// Transform / opacity only. Images are decoded before the CTA enables.
// Reduced motion: no rotation, no particles — a 400 ms cross-fade.

import { useEffect, useMemo, useRef, useState } from "react";
import { cdn, useWeddingReducedMotion } from "../../_wedding";
import { A, decodeAll, img } from "./art";
import { seeded } from "./model";
import type { Strings } from "./strings";
import type { Lang } from "./types";

export interface OpeningProps {
  first: string;
  second: string;
  dateLine: string;
  guest: string;
  s: Strings;
  lang: Lang;
  onOpened: () => void;
}

type Phase = "closed" | "opening" | "through" | "gone";

/** A soft "glass clink + latch" made on the spot (no file to load). After a tap only. */
function chime() {
  try {
    const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctx = W.AudioContext || W.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.value = 0.16;
    out.connect(ctx.destination);
    // Latch: a short filtered click.
    const click = ctx.createOscillator();
    const cg = ctx.createGain();
    click.type = "square";
    click.frequency.setValueAtTime(180, now);
    cg.gain.setValueAtTime(0.35, now);
    cg.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    click.connect(cg).connect(out);
    click.start(now);
    click.stop(now + 0.06);
    // Two glasses touching: bright partials with a long, soft tail.
    [1568, 2093, 2637, 3136].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f * (1 + (i % 2) * 0.004);
      const t = now + 0.09 + (i > 1 ? 0.07 : 0);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.5 / (i + 1), t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 - i * 0.2);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + 1.7);
    });
    window.setTimeout(() => void ctx.close().catch(() => undefined), 2200);
  } catch {
    /* no audio: the doors still open */
  }
}

export default function Opening({ first, second, dateLine, guest, s, lang, onOpened }: OpeningProps) {
  const reduce = useWeddingReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const sparkRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const live = useRef(true);

  const twinkles = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: 18 }, () => ({ x: 2 + r() * 96, y: 1 + r() * 20, d: -r() * 4, dur: 2 + r() * 2.6 }));
  }, []);
  const bulbs = useMemo(() => {
    const r = seeded(5);
    return Array.from({ length: 14 }, (_, i) => ({ x: 6 + (i / 13) * 88, y: 10 + Math.sin((i / 13) * Math.PI) * 9 + r() * 2, d: -r() * 3 }));
  }, []);

  // The page stays still behind the foyer.
  useEffect(() => {
    if (phase === "gone") return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [phase]);

  // Decode every piece of the foyer before the entrance plays and the CTA enables.
  useEffect(() => {
    live.current = true;
    const list = timers.current;
    const imgs = Array.from(rootRef.current?.querySelectorAll("img") ?? []);
    void decodeAll(imgs, 2400).then(() => {
      if (live.current) setReady(true);
    });
    return () => {
      live.current = false;
      list.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  /** Champagne sparkles rising through the doorway (WAAPI on transform/opacity, then removed). */
  const sparkle = () => {
    const host = sparkRef.current;
    if (!host || typeof host.animate !== "function") return;
    const lite = window.innerWidth < 600 || (navigator.hardwareConcurrency || 8) <= 4;
    const n = lite ? 22 : 38;
    const r = seeded(Date.now() % 9973);
    for (let i = 0; i < n; i++) {
      const el = document.createElement("img");
      el.src = cdn(r() < 0.78 ? A.sparkle.src : A.petal.src);
      el.alt = "";
      el.className = "rc-spark";
      const size = 10 + r() * (el.src.includes("petal") ? 12 : 18);
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${38 + r() * 24}%`;
      host.appendChild(el);
      const dx = (r() - 0.5) * (lite ? 260 : 520);
      const up = 260 + r() * 420;
      const rot = (r() - 0.5) * 540;
      const dur = 3500 + r() * 2500;
      const a = el.animate(
        [
          { transform: "translate3d(0,0,0) rotate(0deg) scale(.4)", opacity: 0 },
          { transform: `translate3d(${dx * 0.3}px, ${-up * 0.25}px, 0) rotate(${rot * 0.3}deg) scale(1)`, opacity: 1, offset: 0.18 },
          { transform: `translate3d(${dx}px, ${-up}px, 0) rotate(${rot}deg) scale(.8)`, opacity: 0 },
        ],
        { duration: dur, delay: 300 + r() * 1100, easing: "cubic-bezier(.22,.61,.36,1)", fill: "forwards" },
      );
      a.onfinish = () => el.remove();
    }
  };

  const open = () => {
    if (phase !== "closed" || !ready) return;
    try {
      navigator.vibrate?.(12);
    } catch {}
    chime();
    if (reduce) {
      setPhase("through");
      later(20, onOpened);
      later(420, () => setPhase("gone"));
      return;
    }
    setPhase("opening");
    sparkle();
    // The invitation is in the DOM underneath: decode its hero while the doors swing.
    const hero = Array.from(document.querySelectorAll<HTMLImageElement>(".rc-hero img"));
    void decodeAll(hero, 1500);
    later(950, () => setPhase("through"));
    later(1500, onOpened);
    later(2250, () => setPhase("gone"));
  };

  if (phase === "gone") return null;
  const moving = phase !== "closed";

  return (
    <div
      ref={rootRef}
      className={`rc-open is-${phase}${ready ? " is-ready" : ""}${reduce ? " is-reduced" : ""}`}
      data-rc-open={phase}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
    >
      {/* Full-bleed: the ballroom, blurred, so wide screens have no empty sides. */}
      <div className="rc-open-blur" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("ballroom")} fetchPriority="low" />
      </div>
      <div className="rc-open-tile" aria-hidden />
      <div className="rc-open-bloom" aria-hidden />

      <div className="rc-open-lights" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lights", { high: true })} className="rc-open-lights-a" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lights")} className="rc-open-lights-b" />
        {twinkles.map((t, i) => (
          <i key={i} className="rc-twinkle" style={{ left: `${t.x}%`, top: `${t.y}vh`, animationDelay: `${t.d}s`, animationDuration: `${t.dur}s` }} />
        ))}
      </div>

      <div className="rc-open-roses" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("roses")} className="rc-open-rose rc-open-rose-l" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("roses")} className="rc-open-rose rc-open-rose-r" />
      </div>

      <div className="rc-open-col">
        <div className="rc-open-copy">
          <p className="rc-open-dear" lang={lang}>
            {guest ? (
              <>
                {s.dear} <b>{guest}</b>,
              </>
            ) : (
              s.invited
            )}
          </p>
          <p className="rc-open-of" lang={lang}>
            {s.receptionOf}
          </p>
          <p className="rc-open-names">
            <span>{first}</span>
            <i>&amp;</i>
            <span>{second}</span>
          </p>
          {dateLine && <p className="rc-open-date">{dateLine}</p>}
        </div>

        <div className="rc-open-stagewrap">
          <div className="rc-open-stage" onClick={open} role="presentation">
            <div className="rc-open-dolly">
              {/* Behind the doors: the ballroom, its chandelier and the light. */}
              <div className="rc-open-room" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...img("ballroom", { high: true })} className="rc-open-room-img" />
                <span className="rc-open-chand" />
                {bulbs.map((b, i) => (
                  <i key={i} className="rc-bulb" style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: `${b.d}s` }} />
                ))}
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...img("rays", { sizes: "(max-width: 600px) 90vw, 700px" })} className="rc-open-rays" />
                <span className="rc-open-floor" />
              </div>
              <span className="rc-open-gap" aria-hidden />

              <div className="rc-leaves" aria-hidden>
                <div className="rc-leaf rc-leaf-l">
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img {...img("leafL", { high: true, sizes: "(max-width: 600px) 30vw, 240px" })} />
                  <span className="rc-leaf-shade" />
                  <span className="rc-leaf-glint" />
                </div>
                <div className="rc-leaf rc-leaf-r">
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img {...img("leafR", { high: true, sizes: "(max-width: 600px) 30vw, 240px" })} />
                  <span className="rc-leaf-shade" />
                  <span className="rc-leaf-glint" />
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("frame", { high: true })} className="rc-open-frame" aria-hidden />
              <span className="rc-open-shadow" aria-hidden />
            </div>
            <div ref={sparkRef} className="rc-sparks" aria-hidden />
          </div>
        </div>

        <div className="rc-open-cta">
          <button type="button" className="rc-open-btn" onClick={open} disabled={!ready || moving} aria-label={`${s.open}: ${first} ${s.and} ${second}`} lang={lang}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M2 21h20M12 3v18M9.5 12h.01M14.5 12h.01" />
            </svg>
            <span>{ready ? s.open : s.opening}</span>
          </button>
          <p className="rc-open-hint" lang={lang}>
            {s.openHint}
          </p>
        </div>
      </div>
    </div>
  );
}
