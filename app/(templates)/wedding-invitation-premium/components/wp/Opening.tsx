"use client";

// ─── The opening: tall gold French doors swing inward onto the lake terrace ──
// Poster: the guest's name (?to=), the couple's names and the date over a
// palace doorway — ivory architrave, fluted pilasters, a gold transom — with
// two etched-glass doors closed in it. Deliberately quiet: the watercolour
// sky and lake behind (./Lake) under an ivory wash, a light spray of
// blossom over the doorway's crown
// (template15, faded at every cut edge).
// Through the glass the sunlit terrace is already faintly visible.
// One tap (also the gesture that starts the music, via the engine):
//   0.00 s  a soft crystal chime; a reflection sweeps across both panes
//   0.30 s  the doors swing inward on their hinges (heavy ease), shading as
//           they turn away from the light; a second faint glare rides along
//   0.45 s  sunlight spills through and blooms on the floor
//   0.50 s  gold dust and rose petals drift out of the doorway
//   1.05 s  the camera walks through the doorway (dolly)
//   1.70 s  sunlight blooms out of the doorway and fills the screen (a gold
//           mandala turning open in it), then fades into the hero, already
//           decoded underneath — never a ghost of the doors over the page
// Transform/opacity only, decoded before it plays; reduced motion = a 400 ms
// crossfade. A real <button>, Enter/Space, and a tap anywhere on the doors.

import { useEffect, useRef, useState } from "react";
import { useWeddingReducedMotion } from "../../../_wedding";
import { A, decodeAll, img, seeded } from "./art";
import Lake from "./Lake";
import type { Strings } from "./model";

export interface OpeningProps {
  first: string;
  second: string;
  dateLine: string;
  city: string;
  guest: string;
  s: Strings;
  lang: "en" | "hi";
  invocation: boolean;
  onOpened: () => void;
}

type Phase = "closed" | "opening" | "push" | "gone";

/** A gentle glass chime from WebAudio (no file to download), only after the tap. */
function chime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ac = new AC();
    const now = ac.currentTime;
    const master = ac.createGain();
    master.gain.value = 0.16;
    master.connect(ac.destination);
    [1318.5, 1975.5, 2637, 3951].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.value = f;
      const t0 = now + i * 0.07;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.5 / (i + 1), t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.6);
      o.connect(g).connect(master);
      o.start(t0);
      o.stop(t0 + 1.7);
    });
    window.setTimeout(() => void ac.close().catch(() => undefined), 2200);
  } catch {
    /* no audio: the doors still open */
  }
}

export default function Opening({ first, second, dateLine, city, guest, s, lang, invocation, onOpened }: OpeningProps) {
  const reduce = useWeddingReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const live = useRef(true);

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

  // Decode the doors + terrace before anything moves (no half-painted frames).
  useEffect(() => {
    live.current = true;
    const list = timers.current;
    const imgs = Array.from(rootRef.current?.querySelectorAll<HTMLImageElement>(".wp-stage img") ?? []);
    void decodeAll(imgs, 2500).then(() => {
      if (live.current) setReady(true);
    });
    return () => {
      live.current = false;
      list.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  /** Gold dust + rose petals out of the doorway: WAAPI on transform/opacity, removed when done. */
  const burst = () => {
    const box = fxRef.current;
    if (!box) return;
    const small = window.innerWidth < 600 || (navigator.hardwareConcurrency || 8) <= 4;
    const n = small ? 22 : 38;
    const r = seeded(Date.now() & 0xffff);
    for (let i = 0; i < n; i++) {
      const petal = i % 3 === 0;
      const el = document.createElement("img");
      el.src = petal ? A.petal.src : A.sparkle.src;
      el.alt = "";
      el.className = petal ? "wp-fx wp-fx-petal" : "wp-fx";
      const size = petal ? 12 + r() * 12 : 10 + r() * 16;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${38 + r() * 24}%`;
      el.style.top = `${36 + r() * 30}%`;
      box.appendChild(el);
      const dx = (r() - 0.5) * (small ? 320 : 640);
      const dy = -60 - r() * 260;
      const rot = (r() - 0.5) * 540;
      const anim = el.animate(
        [
          { transform: "translate3d(0,0,0) rotate(0deg) scale(.4)", opacity: 0 },
          { transform: `translate3d(${dx * 0.3}px, ${dy * 0.4}px, 0) rotate(${rot * 0.3}deg) scale(1)`, opacity: 1, offset: 0.2 },
          { transform: `translate3d(${dx}px, ${dy + (petal ? 340 : 120)}px, 0) rotate(${rot}deg) scale(.9)`, opacity: 0 },
        ],
        { duration: 2600 + r() * 2200, delay: r() * 500, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" },
      );
      anim.onfinish = () => el.remove();
    }
  };

  const open = () => {
    if (phase !== "closed" || !ready) return;
    try {
      navigator.vibrate?.(12);
    } catch {}
    chime();
    if (reduce) {
      setPhase("push");
      later(30, onOpened);
      later(430, () => setPhase("gone"));
      return;
    }
    setPhase("opening");
    later(500, burst);
    // The hero is already in the DOM underneath: decode it while the doors swing.
    const hero = Array.from(document.querySelectorAll<HTMLImageElement>(".wp-hero img"));
    const wait = Promise.all([decodeAll(hero, 1800), new Promise((r) => window.setTimeout(r, 1700))]);
    void wait.then(() => {
      if (!live.current) return;
      setPhase("push");
      onOpened();
      later(1300, () => setPhase("gone"));
    });
  };

  if (phase === "gone") return null;
  const label = `${s.open}: ${first} & ${second}`;
  return (
    <div ref={rootRef} className={`wp-open is-${phase}${ready ? " is-ready" : ""}${reduce ? " is-reduced" : ""}`} data-wp-open={phase}>
      {/* The doors stand on the lake terrace: the watercolour sky, hills and lake behind them. */}
      <Lake className="wp-open-lake" />
      <div className="wp-open-wash" aria-hidden />
      <div className="wp-open-world">
        <div className="wp-open-copy">
          {invocation && (
            <p className="wp-open-inv" lang="hi">
              ॥ श्री गणेशाय नमः ॥
            </p>
          )}
          <p className="wp-open-dear" lang={lang}>
            {guest ? (
              <>
                {s.dear} <b>{guest}</b>, {lang === "hi" ? s.invited : s.invited.toLowerCase()}
              </>
            ) : (
              s.invited
            )}
          </p>
          <p className="wp-open-names">
            <span>{first}</span>
            <i>&amp;</i>
            <span>{second}</span>
          </p>
          {(dateLine || city) && <p className="wp-open-date">{[dateLine, city].filter(Boolean).join(" · ")}</p>}
        </div>

        <div className="wp-stagewrap">
          <div className="wp-stage" onClick={open} role="presentation">
            {/* The terrace inside the door aperture (behind the glass). */}
            <div className="wp-aperture" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img("terrace", { high: true })} className="wp-terrace" />
              <span className="wp-sun" />
            </div>
            <div className="wp-doors" aria-hidden>
              <div className="wp-door wp-door-l">
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...img("doorL", { high: true })} />
                <span className="wp-glass" />
                <span className="wp-glare">
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img {...img("glare")} />
                </span>
                <span className="wp-shade" />
              </div>
              <div className="wp-door wp-door-r">
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...img("doorR", { high: true })} />
                <span className="wp-glass" />
                <span className="wp-glare">
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img {...img("glare")} />
                </span>
                <span className="wp-shade" />
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("frame", { high: true })} className="wp-frame" aria-hidden />
            <span className="wp-floor" aria-hidden />
            {/* A light spray of blossom over the doorway's crown. */}
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img("floralArch", { high: true })} className="wp-arch" aria-hidden />
            <div className="wp-fxbox" ref={fxRef} aria-hidden />
          </div>
        </div>

        {/* The step through: sunlight blooms out of the doorway to fill the screen; the terrace appears out of it. */}
        <span className="wp-open-flash" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wedding-v3/classic/gold-mandala.webp" width={480} height={480} alt="" decoding="async" />
        </span>

        <div className="wp-open-cta">
          <button type="button" className="wp-open-btn" onClick={open} disabled={!ready} aria-label={label} lang={lang}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5V21M3 21h18M12 3v18M9.5 12.5h.01M14.5 12.5h.01" />
            </svg>
            <span>{ready ? s.open : s.opening}</span>
          </button>
          <p className="wp-open-hint" lang={lang}>
            {s.openHint}
          </p>
        </div>
      </div>
    </div>
  );
}
