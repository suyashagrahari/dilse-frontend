"use client";

// ─── The palace door (the opening) ───────────────────────────────────────────
// A carved Rajasthani haveli door fills the screen, closed: the gold round
// frame holds the couple's monogram on the seam, gold-and-pearl jhumkas hang
// from the lintel, banana leaves at the foot. The wall and the two leaves are
// separate cut-outs of one photo (public/wedding-v3/palace-door), so the
// leaves can swing INWARD on their outer hinges in real 3D (perspective +
// rotateY) behind the wall's doorway, the way a haveli door opens.
//
// One tap (also the gesture that starts the music):
//   0.00 s  the frame presses like a knock; copy fades
//   0.45 s  the leaves swing in (2.1 s), warm light floods the doorway, the
//           rays turn, jhumkas swing harder, petals burst
//   2.05 s  the camera pushes through the doorway into the courtyard (the
//           page below, already decoded) and the door layer is removed.
// Every motion is transform/opacity. Every image is decoded before the first
// frame of the entrance or the swing. Reduced motion: a 400 ms crossfade.

import { useEffect, useMemo, useRef, useState } from "react";
import { initialOf, useWeddingReducedMotion } from "../../../_wedding";
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
    later(420, () => live.current && setPhase("open"));
    later(2050, () => {
      if (!live.current) return;
      setPhase("push");
      onOpened();
    });
    later(3300, () => live.current && setPhase("gone"));
  };

  if (phase === "gone") return null;
  const swinging = phase === "open" || phase === "push";
  const greeting = guest ? `${s.dear} ${guest},` : "";

  return (
    <div ref={root} className={`pd-gate is-${phase}${reduce ? " is-reduced" : ""}`} data-pd-gate={phase}>
      <div className="pd-gate-wall" aria-hidden />
      <div className="pd-gate-cam">
        {/* Desktop: the haveli front around the door (pillars). */}
        <div className="pd-front" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="pd-front-pillar is-l" {...img(A.pillar)} />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="pd-front-pillar is-r" {...img(A.pillar)} />
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
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img data-pd-pre {...img(a, { high: true })} />
                  <span className="pd-leaf-shade" style={{ WebkitMaskImage: `url(${a.src})`, maskImage: `url(${a.src})` }} />
                </div>
              );
            })}
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="pd-door-wall" data-pd-pre {...img(A.wall, { high: true })} />
          </div>

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
        </div>
      </div>

      {[0, 1].map((i) => (
        <span key={i} className={`pd-banana is-${i ? "r" : "l"}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img data-pd-pre {...img(A.banana)} />
        </span>
      ))}

      {swinging && !reduce && (
        <div className="pd-gate-petals" aria-hidden>
          <Petals kind={["marigold-petal", "rose-petal", "marigold-petal", "gold-confetti"]} count={22} mode="burst" seed={7} />
        </div>
      )}
    </div>
  );
}
