"use client";

// ─── The jharokha (the opening) ──────────────────────────────────────────────
// A carved Rajasthani jharokha hangs in a pink dawn over a lake palace, its two
// latticed ivory-marble shutters closed. Peony trees frame it, a rose bouquet
// rests on each end of the balcony, and the couple's names wait underneath.
// The frame and the dawn are drawn in-house (openings/classic); the shutters
// are the Met's CC0 marble jali, split at the apex and graded to warm ivory.
//
// One tap (also the gesture that starts the music; a soft santoor glissando is
// synthesised in the same gesture, never before it):
//   0.00 s  the jaali glows: pink dawn light blooms through the lattice
//   0.15 s  the shutters swing OUTWARD on their outer hinges in real 3D
//           (perspective on the stage only; rotateY ±105°, the right one 80 ms
//           late), shading as they turn from the light; rays open behind
//   0.30 s  rose petals pour out through the window (WAAPI, transform only)
//   0.80 s  the couple's names float up behind the window
//   1.45 s  the camera steps through (stage scale 1 → 1.12) and the gate fades
//   2.15 s  the layer is removed; the invitation underneath is already decoded
// Every image is decoded before the first frame. Reduced motion: no rotation,
// no particles, a 400 ms cross-fade. Enter / Space open it too.

import { useEffect, useMemo, useRef, useState } from "react";
import { useWeddingReducedMotion } from "../../../_wedding";
import { useDayMusic } from "../../../_valentine/music/context";
import { A, SHUTTER_BOX, decodeAll, img, seeded } from "./assets";
import type { Strings } from "./model";

export interface JharokhaProps {
  first: string;
  second: string;
  dateLine: string;
  guest: string;
  s: Strings;
  lang: "en" | "hi";
  invocation: boolean;
  onOpened: () => void;
}

type Phase = "loading" | "closed" | "open" | "push" | "gone";

/** A soft santoor-like glissando (pentatonic plucks), made in the tap's own gesture. */
function santoor() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = [587.33, 659.25, 739.99, 880, 987.77, 1174.66, 1318.51, 1479.98];
    const out = ctx.createGain();
    out.gain.value = 0.06;
    out.connect(ctx.destination);
    notes.forEach((f, i) => {
      const t = ctx.currentTime + 0.02 + i * 0.075;
      for (const [type, mul, g] of [["triangle", 1, 1], ["sine", 2, 0.35]] as const) {
        const o = ctx.createOscillator();
        const e = ctx.createGain();
        o.type = type;
        o.frequency.value = f * mul;
        e.gain.setValueAtTime(0, t);
        e.gain.linearRampToValueAtTime(g, t + 0.008);
        e.gain.exponentialRampToValueAtTime(0.0008, t + 0.9);
        o.connect(e).connect(out);
        o.start(t);
        o.stop(t + 1);
      }
    });
    window.setTimeout(() => void ctx.close().catch(() => undefined), 2200);
  } catch {
    /* no audio: the opening is still complete */
  }
}

/** Rose petals pouring out of the window: WAAPI on transform/opacity, removed when done. */
function pour(host: HTMLElement, origin: DOMRect, count: number, srcs: string[]) {
  const r = seeded(19);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("img");
    el.src = srcs[i % srcs.length];
    el.alt = "";
    el.className = "cw-petal";
    const size = 12 + r() * 16;
    el.style.width = el.style.height = `${size}px`;
    const x0 = origin.left + origin.width * (0.3 + r() * 0.4);
    const y0 = origin.top + origin.height * (0.2 + r() * 0.5);
    el.style.left = `${x0}px`;
    el.style.top = `${y0}px`;
    host.appendChild(el);
    const dx = (r() - 0.5) * vw * 1.1;
    const dy = vh * (0.35 + r() * 0.75);
    const rot = (r() - 0.5) * 900;
    const dur = 1700 + r() * 1500;
    const anim = el.animate(
      [
        { transform: "translate3d(0,0,0) rotate(0deg) scale(.4)", opacity: 0 },
        { transform: `translate3d(${dx * 0.35}px, ${-40 - r() * 60}px, 0) rotate(${rot * 0.3}deg) scale(1)`, opacity: 1, offset: 0.22 },
        { transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${rot}deg) scale(.9)`, opacity: 0 },
      ],
      { duration: dur, delay: r() * 500, easing: "cubic-bezier(.2,.6,.3,1)", fill: "forwards" },
    );
    anim.onfinish = () => el.remove();
  }
}

export default function Jharokha({ first, second, dateLine, guest, s, lang, invocation, onOpened }: JharokhaProps) {
  const reduce = useWeddingReducedMotion();
  const music = useDayMusic();
  const [phase, setPhase] = useState<Phase>("loading");
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const live = useRef(true);
  // Phones get the 900 px shutters (60 fps on low-end Android); decided once, on the client.
  const [small] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 600px)").matches);
  const motes = useMemo(() => {
    const r = seeded(23);
    return Array.from({ length: 10 }, () => ({ left: 4 + r() * 92, delay: -r() * 12, dur: 9 + r() * 7, dx: (r() - 0.5) * 80, size: 10 + r() * 10, rot: (r() - 0.5) * 360 }));
  }, []);

  // The page stays still behind the closed window.
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

  // Decode the window before its first frame, so the entrance never stutters.
  useEffect(() => {
    const imgs = Array.from(root.current?.querySelectorAll<HTMLImageElement>("img[data-cw-pre]") ?? []);
    void decodeAll(imgs, 2200).then(() => {
      if (live.current) setPhase((p) => (p === "loading" ? "closed" : p));
    });
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const open = () => {
    if (phase !== "closed" && phase !== "loading") return;
    // The song starts inside this tap (the gesture browsers require), never before it.
    if (music?.available && !music.playing && !music.userOff) music.start();
    santoor();
    try {
      navigator.vibrate?.(12);
    } catch {}
    if (reduce) {
      setPhase("push");
      later(30, onOpened);
      later(420, () => live.current && setPhase("gone"));
      return;
    }
    setPhase("open");
    // The invitation is already in the DOM under the window: decode its art while the shutters swing.
    void decodeAll(Array.from(document.querySelectorAll<HTMLImageElement>(".cw-hero img")), 1400);
    later(300, () => {
      const box = stage.current?.querySelector(".cw-aperture")?.getBoundingClientRect();
      if (!box) return;
      // Their own layer on <body>: the petals keep falling over the invitation after the gate is gone.
      const host = document.createElement("div");
      host.className = "cw-petal-layer";
      host.setAttribute("aria-hidden", "true");
      document.body.appendChild(host);
      const lite = (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 600;
      pour(host, box, lite ? 22 : 36, [A.petal.src, A.petal.src, A.petalSakura.src]);
      window.setTimeout(() => host.remove(), 4200);
    });
    later(1450, () => {
      if (!live.current) return;
      setPhase("push");
      onOpened();
    });
    later(2150, () => live.current && setPhase("gone"));
  };

  if (phase === "gone") return null;
  const greeting = guest ? `${s.dear} ${guest},` : "";
  const L = SHUTTER_BOX.left;
  const R = SHUTTER_BOX.right;
  const shutterL = small ? A.shutterLsm : A.shutterL;
  const shutterR = small ? A.shutterRsm : A.shutterR;

  return (
    <div
      ref={root}
      className={`cw-gate is-${phase}${reduce ? " is-reduced" : ""}`}
      data-cw-gate={phase}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
    >
      {/* The dawn, full-bleed and soft behind everything (it fills the sides on wide screens). */}
      <div className="cw-gate-sky" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="cw-gate-sky-img" {...img(A.dawn)} fetchPriority="low" />
      </div>
      <div className="cw-gate-motes" aria-hidden>
        {motes.map((m, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={A.petal.src} alt="" width={m.size} height={m.size} style={{ left: `${m.left}%`, animationDelay: `${m.delay}s`, animationDuration: `${m.dur}s`, ["--dx" as string]: `${m.dx}px`, ["--rot" as string]: `${m.rot}deg` }} />
        ))}
      </div>
      {(["l", "r"] as const).map((side) => (
        <span key={side} className={`cw-gate-tree is-${side}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img data-cw-pre {...img(side === "l" ? A.treeL : A.treeR)} />
        </span>
      ))}

      {(["l", "r"] as const).map((side) => (
        <span key={side} className={`cw-pampas is-${side}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(A.pampasCorner)} />
        </span>
      ))}
      {/* A rose bouquet at each tree's foot, a floral canopy overhead, blossom lanterns swaying beside the window. */}
      {(["l", "r"] as const).map((side) => (
        <span key={side} className={`cw-bloom is-${side}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(A.peonies)} />
        </span>
      ))}
      <span className="cw-canopy" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(A.canopy)} />
      </span>
      {(["l", "r"] as const).map((side) => (
        <span key={side} className={`cw-lantern is-${side}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(A.lanterns)} />
        </span>
      ))}

      <div className="cw-gate-col">
        <p className="cw-gate-top" lang={lang}>
          {greeting ? (
            <>
              <span className="cw-gate-dear">{greeting}</span> <span>{s.invited}</span>
            </>
          ) : (
            <span lang="hi">{invocation ? "॥ श्री गणेशाय नमः ॥" : "॥ शुभ विवाह ॥"}</span>
          )}
        </p>

        <div className="cw-cam">
          <div ref={stage} className="cw-stage" onClick={open} role="presentation">
            {/* Behind the shutters: the lake palace at dawn, its light, and the names. */}
            <div className="cw-aperture" style={{ left: `${L.x}%`, top: `${L.y}%`, width: `${R.x + R.w - L.x}%`, height: `${L.h}%` }} aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="cw-ap-dawn" data-cw-pre {...img(A.dawn, { high: true })} />
              <span className="cw-ap-bloom" />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="cw-ap-rays" {...img(A.rays)} />
              <span className="cw-ap-names">
                <b>{first}</b>
                <i>&amp;</i>
                <b>{second}</b>
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="cw-frame" data-cw-pre {...img(A.frame, { high: true })} />
            {(["left", "right"] as const).map((side) => {
              const b = SHUTTER_BOX[side];
              const art = side === "left" ? shutterL : shutterR;
              return (
                <div key={side} className={`cw-shutter is-${side[0]}`} style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }} aria-hidden>
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img data-cw-pre {...img(art, { high: true })} />
                  <span className="cw-shutter-glow" style={{ WebkitMaskImage: `url(${art.src})`, maskImage: `url(${art.src})` }} />
                  <span className="cw-shutter-shade" style={{ WebkitMaskImage: `url(${art.src})`, maskImage: `url(${art.src})` }} />
                </div>
              );
            })}
            {/* Roses resting on the balcony, one at each end. */}
            {(["l", "r"] as const).map((side) => (
              <span key={side} className={`cw-sill-roses is-${side}`} aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img data-cw-pre {...img(A.roses)} />
              </span>
            ))}
          </div>
        </div>

        <div className="cw-gate-foot">
          <p className="cw-gate-names">
            <span className="cw-gate-eyebrow" lang={lang}>
              {s.shubh}
            </span>
            <span className="cw-gate-couple">
              {first} <i>&amp;</i> {second}
            </span>
            {dateLine && <span className="cw-gate-date">{dateLine}</span>}
          </p>
          <button type="button" className="cw-gate-cta" onClick={open} disabled={phase === "loading"} aria-label={`${s.open}: ${first} ${s.and} ${second}`} lang={lang}>
            <span className="cw-gate-cta-ring" aria-hidden />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 21V9.5a8 8 0 0 1 16 0V21M2.5 21h19M12 3v18M7.5 12.5h2M14.5 12.5h2" />
            </svg>
            {phase === "loading" ? s.opening : s.open}
          </button>
        </div>
      </div>
    </div>
  );
}
