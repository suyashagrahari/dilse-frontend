"use client";

// ─── The palace door (the opening) ───────────────────────────────────────────
// A carved Rajasthani haveli door fills the screen, closed: the gold round
// frame holds the couple's monogram on the seam, gold-and-pearl jhumkas hang
// from the lintel, banana leaves at the foot. The wall and the two leaves are
// separate cut-outs of one photo (public/wedding-v3/palace-door), so the
// leaves can swing INWARD on their outer hinges in real 3D (perspective +
// rotateY) behind the wall's doorway, the way a haveli door opens.
//
// The scene is a haveli at dusk: a maroon wall with a gold bidri lattice, a
// marigold toran on the lintel and garland strings down the frame, diyas on
// the threshold, gold dust in the air; on wide screens pillars, hanging
// lanterns, marigold pots and string lights around the door. It opens dark
// around one diya whose light spreads to reveal the door, then the decor
// arrives in turn. While the door is closed, light breathes through its crack.
//
// One tap (also the gesture that starts the music):
//   0.00 s  the frame presses like a knock; copy fades
//   0.35 s  the leaves swing in (2.1 s), warm light floods the doorway, the
//           rays turn, jhumkas swing harder, petals burst
//   1.75 s  warm light blooms out of the doorway to fill the screen as the
//           camera eases through it (scale up, centred on the door)
//   2.25 s  the courtyard (already decoded) starts revealing under the light
//   3.60 s  the light has faded; the door layer is removed.
// Every motion is transform/opacity. Every image is decoded before the first
// frame of the entrance or the swing. Reduced motion: a 400 ms crossfade.

import { useEffect, useMemo, useRef, useState } from "react";
import { cdn, initialOf, useWeddingReducedMotion } from "../../../_wedding";
import Diya from "./Diya";
import Petals from "./Petals";
import { useDayMusic } from "../../../_valentine/music/context";
import { A, LEAF_BOX, decodeAll, img, seeded } from "../assets";
import type { Strings } from "./model";

export interface DoorsProps {
  first: string;
  second: string;
  dateLine: string;
  guest: string;
  s: Strings;
  lang: "en" | "hi";
  invocation: boolean;
  onOpened: () => void;
}

type Phase = "loading" | "closed" | "knock" | "open" | "push" | "gone";

export default function Doors({ first, second, dateLine, guest, s, lang, invocation, onOpened }: DoorsProps) {
  const reduce = useWeddingReducedMotion();
  const music = useDayMusic();
  const [phase, setPhase] = useState<Phase>("loading");
  const root = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const live = useRef(true);
  const motes = useMemo(() => {
    const r = seeded(41);
    return Array.from({ length: 9 }, () => ({ left: 20 + r() * 60, delay: -r() * 9, dur: 7 + r() * 5, dx: (r() - 0.5) * 50, size: 3 + r() * 4 }));
  }, []);
  // Gold dust drifting through the whole scene, twinkling as it rises.
  const dust = useMemo(() => {
    const r = seeded(83);
    return Array.from({ length: 22 }, () => ({ left: r() * 100, top: 20 + r() * 80, delay: -r() * 12, dur: 9 + r() * 8, dx: (r() - 0.5) * 60, size: 2 + r() * 4 }));
  }, []);

  // The page stays still behind the closed door.
  useEffect(() => {
    if (phase === "gone") return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [phase]);

  useEffect(() => {
    live.current = true;
    const list = timers.current;
    return () => {
      live.current = false;
      list.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // Decode the door before its first frame, so the entrance never stutters.
  useEffect(() => {
    const imgs = Array.from(root.current?.querySelectorAll<HTMLImageElement>("img[data-pd-pre]") ?? []);
    void decodeAll(imgs, 1800).then(() => {
      if (live.current) setPhase((p) => (p === "loading" ? "closed" : p));
    });
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const open = () => {
    if (phase !== "closed" && phase !== "loading") return;
    // The song starts inside this tap (the gesture browsers require), never before it.
    if (music?.available && !music.playing && !music.userOff) music.start();
    try {
      navigator.vibrate?.([14, 60, 14]);
    } catch {}
    if (reduce) {
      setPhase("push");
      later(30, onOpened);
      later(420, () => setPhase("gone"));
      return;
    }
    setPhase("knock");
    // The courtyard is already in the DOM under the door: decode its art while the leaves swing.
    const court = Array.from(document.querySelectorAll<HTMLImageElement>(".pd-court img"));
    void decodeAll(court, 1600);
    later(350, () => live.current && setPhase("open"));
    later(1750, () => live.current && setPhase("push"));
    later(2250, () => live.current && onOpened());
    later(3600, () => live.current && setPhase("gone"));
  };

  if (phase === "gone") return null;
  const swinging = phase === "open" || phase === "push";
  const greeting = guest ? `${s.dear} ${guest},` : "";

  return (
    <div ref={root} className={`pd-gate is-${phase}${reduce ? " is-reduced" : ""}`} data-pd-gate={phase}>
      <div className="pd-gate-wall" aria-hidden>
        <span className="pd-gate-lattice" style={{ backgroundImage: `url(${cdn(A.lattice.src)})` }} />
      </div>
      {/* Desktop: strings of gold lights draped either side of the door. */}
      <div className="pd-gate-lights" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="is-l" {...img(A.lights)} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="is-r" {...img(A.lights)} />
      </div>
      <div className="pd-gate-cam">
        {/* Desktop: the haveli front around the door (pillars, lanterns, marigold pots). */}
        <div className="pd-front" aria-hidden>
          {(["l", "r"] as const).map((sd) => (
            <span key={sd} className={`pd-front-side is-${sd}`}>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="pd-front-pillar" {...img(A.pillar)} />
              <span className="pd-front-lantern">
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...img(A.lanternsGlow)} />
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="pd-front-pots" {...img(A.pots)} />
            </span>
          ))}
        </div>

        <div className="pd-door">
          <div className="pd-door-3d">
            {/* Behind the leaves: the courtyard's warm light. */}
            <div className="pd-door-light" aria-hidden>
              <span className="pd-door-glow" />
              <span className="pd-door-rays" />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="pd-door-peek" {...img(A.arch)} />
              <span className="pd-door-motes">
                {motes.map((m, i) => (
                  <i key={i} style={{ left: `${m.left}%`, width: m.size, height: m.size, animationDelay: `${m.delay}s`, animationDuration: `${m.dur}s`, ["--dx" as string]: `${m.dx}px` }} />
                ))}
              </span>
            </div>
            {(["left", "right"] as const).map((side) => {
              const b = LEAF_BOX[side];
              const a = side === "left" ? A.leafL : A.leafR;
              return (
                <div key={side} className={`pd-leaf is-${side[0]}`} style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }} aria-hidden>
                  {/* Same-origin: the shade below masks with this very file, so one download serves both. */}
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img data-pd-pre {...img(a, { high: true, sameOrigin: true })} />
                  <span className="pd-leaf-shade" style={{ WebkitMaskImage: `url(${a.src})`, maskImage: `url(${a.src})` }} />
                </div>
              );
            })}
            {/* The courtyard's light leaking through the crack between the leaves. */}
            <span className="pd-door-seam" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="pd-door-wall" data-pd-pre {...img(A.wall, { high: true })} />
          </div>

          {/* The marigold-and-mango-leaf toran on the lintel, garland strings down the frame. */}
          {(["l", "r"] as const).map((sd) => (
            <span key={sd} className={`pd-garland is-${sd}`} style={{ backgroundImage: `url(${cdn(A.garland.src)})` }} aria-hidden />
          ))}
          <span className="pd-toran" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img data-pd-pre {...img(A.toran, { high: true })} />
          </span>

          {/* On the wall and the wood (not 3D). */}
          <p className="pd-door-invoke" lang="hi" aria-hidden>
            {invocation ? "॥ श्री गणेशाय नमः ॥" : "॥ शुभ विवाह ॥"}
          </p>
          {[0, 1].map((i) => (
            <span key={i} className={`pd-jhumka is-${i ? "r" : "l"}`} aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img data-pd-pre {...img(A.jhumka)} />
            </span>
          ))}
          <div className="pd-door-copy">
            {greeting && (
              <p className="pd-door-dear" lang={lang}>
                <span>{greeting}</span> <span>{s.invited}</span>
              </p>
            )}
            <button type="button" className="pd-medal" onClick={open} aria-label={`${s.open}: ${first} ${s.and} ${second}`}>
              <span className="pd-medal-halo" aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="pd-medal-ring" data-pd-pre {...img(A.frame, { high: true })} />
              <span className="pd-medal-disc" aria-hidden />
              <span className="pd-medal-ini" aria-hidden>
                <b>{initialOf(first)}</b>
                <i>&amp;</i>
                <b>{initialOf(second)}</b>
              </span>
            </button>
            <p className="pd-door-names">
              <span className="pd-door-eyebrow" lang={lang}>
                {s.shubh}
              </span>
              <span className="pd-door-couple">
                {first} <i>&amp;</i> {second}
              </span>
              {dateLine && <span className="pd-door-date">{dateLine}</span>}
            </p>
            <button type="button" className="pd-door-cta" onClick={open} lang={lang}>
              <span className="pd-door-cta-ring" aria-hidden />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 21V8a7 7 0 0 1 14 0v13M3 21h18M12 4v17M9.5 13.5v1M14.5 13.5v1" />
              </svg>
              {s.open}
            </button>
          </div>

          {/* A row of diyas on the threshold, lit one after another. */}
          <span className="pd-diyas" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <Diya key={i} className={`pd-diya is-${i}`} style={{ ["--i" as string]: Math.abs(i - 2) }} />
            ))}
          </span>
        </div>
      </div>

      {[0, 1].map((i) => (
        <span key={i} className={`pd-banana is-${i ? "r" : "l"}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img data-pd-pre {...img(A.banana)} />
        </span>
      ))}

      <span className="pd-gate-dust" aria-hidden>
        {dust.map((d, i) => (
          <i key={i} style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, animationDelay: `${d.delay}s, ${d.delay * 0.37}s`, animationDuration: `${d.dur}s, ${2 + (i % 4) * 0.6}s`, ["--dx" as string]: `${d.dx}px` }} />
        ))}
      </span>

      {/* Stepping through: warm light blooms out of the doorway, fills the screen, then gives way to the page. */}
      <span className="pd-gate-bloom" aria-hidden />

      {/* The entrance: the scene starts dark around one diya, and its light opens out to reveal the door. */}
      <span className="pd-gate-iris" aria-hidden />
      <span className="pd-gate-spark" aria-hidden>
        <Diya className="pd-diya" />
      </span>

      {swinging && !reduce && (
        <div className="pd-gate-petals" aria-hidden>
          <Petals kind={["marigold-petal", "rose-petal", "marigold-petal", "gold-confetti"]} count={28} mode="burst" seed={7} />
        </div>
      )}
    </div>
  );
}
