"use client";

// ─── The opening: the chapel doors ───────────────────────────────────────────
// An ivory limestone church portal fills the screen: a small stained-glass
// rose window in the gable, a stained-glass fanlight over two tall oak doors
// with black iron strap hinges, a pink-and-white floral arch over the door,
// peonies and roses at the plinths. The guest's name and the couple's names
// sit above in the morning light.
//
// One tap (also the gesture that starts the music):
//   0.00 s  the bell strikes (synthesised, only now), the latch gives a nudge
//   0.08 s  the leaves swing INWARD on their outer hinges in real 3D
//           (perspective + rotateY; the portal stays on top so the jambs hide
//           the edges), light floods out of the aisle, the glass glows
//   0.35 s  doves fly out of the doorway, rose petals drift down
//   1.15 s  the camera walks through the doorway into the aisle
//   2.20 s  the layer is removed; the invitation is underneath.
// Transform/opacity only. Every image is decoded before the first frame.
// Reduced motion: no rotation, no particles, a 400 ms cross-fade.

import { useEffect, useMemo, useRef, useState } from "react";
import { useWeddingReducedMotion } from "../../_wedding";
import { useDayMusic } from "../../_valentine/music/context";
import { ART, DOORWAY, FANLIGHT, LEAF, decodeAll, img, seeded } from "./assets";

export interface ChapelDoorsProps {
  first: string;
  second: string;
  dateLine: string;
  guest: string;
  /** Replays from the editor's preview bump this. */
  replayKey?: number;
  onOpened: () => void;
}

type Phase = "loading" | "closed" | "unlatch" | "open" | "enter" | "gone";

/** One soft church-bell strike (hum, prime, tierce, quint, nominal), only ever after a tap. */
function ringBell() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
    const strike = (at: number, base: number, level: number) => {
      const partials: [number, number, number][] = [
        [0.5, 0.5, 3.2],
        [1, 1, 2.4],
        [1.2, 0.55, 1.6],
        [1.5, 0.4, 1.3],
        [2, 0.6, 1.1],
        [2.5, 0.25, 0.8],
        [3, 0.18, 0.6],
      ];
      for (const [mult, amp, decay] of partials) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = base * mult;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
        g.gain.exponentialRampToValueAtTime(amp * level, ctx.currentTime + at + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + decay);
        o.connect(g).connect(master);
        o.start(ctx.currentTime + at);
        o.stop(ctx.currentTime + at + decay + 0.05);
      }
    };
    strike(0, 392, 1);
    strike(0.62, 330, 0.75);
    window.setTimeout(() => void ctx.close().catch(() => undefined), 4200);
  } catch {
    /* no audio: the doors still open */
  }
}

const pct = (b: { x: number; y: number; w: number; h: number }) => ({ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` });

export default function ChapelDoors({ first, second, dateLine, guest, replayKey = 0, onOpened }: ChapelDoorsProps) {
  const reduce = useWeddingReducedMotion();
  const music = useDayMusic();
  const [phase, setPhase] = useState<Phase>("loading");
  const root = useRef<HTMLDivElement>(null);
  const doveLayer = useRef<HTMLDivElement>(null);
  const petalLayer = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const live = useRef(true);
  const [small] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  const motes = useMemo(() => {
    const r = seeded(23);
    return Array.from({ length: 8 }, () => ({ left: 15 + r() * 70, delay: -r() * 8, dur: 7 + r() * 5, dx: (r() - 0.5) * 40, size: 2 + r() * 3 }));
  }, []);

  // Replay from the editor: back to closed.
  const [seenKey, setSeenKey] = useState(replayKey);
  if (seenKey !== replayKey) {
    setSeenKey(replayKey);
    setPhase("closed");
  }

  // The page stays still behind the closed doors.
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

  // Decode the portal and the leaves before the first frame of the entrance.
  useEffect(() => {
    const imgs = Array.from(root.current?.querySelectorAll<HTMLImageElement>("img[data-cw-pre]") ?? []);
    void decodeAll(imgs, 2000).then(() => {
      if (live.current) setPhase((p) => (p === "loading" ? "closed" : p));
    });
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const flyDoves = () => {
    const layer = doveLayer.current;
    if (!layer || typeof layer.animate !== "function") return;
    const n = small ? 4 : 6;
    const r = seeded(5);
    for (let i = 0; i < n; i++) {
      const dir = i % 2 === 0 ? -1 : 1;
      const el = document.createElement("span");
      el.className = "cw-dove";
      el.innerHTML = `<img src="${ART.doveUp.src}" alt="" width="400" height="300"/><img src="${ART.doveDown.src}" alt="" width="400" height="300"/>`;
      layer.appendChild(el);
      const dx = dir * (90 + r() * 170);
      const dy = -(260 + r() * 260);
      const flip = dir < 0 ? -1 : 1;
      const dur = 2000 + r() * 900;
      el.style.setProperty("--flap", `${0.18 + r() * 0.08}s`);
      const a = el.animate(
        [
          { transform: `translate3d(-50%,0,0) scale(${0.28 * flip},0.28)`, opacity: 0 },
          { transform: `translate3d(calc(-50% + ${dx * 0.25}px),${dy * 0.12}px,0) scale(${0.5 * flip},0.5)`, opacity: 1, offset: 0.18 },
          { transform: `translate3d(calc(-50% + ${dx * 0.7}px),${dy * 0.55}px,0) scale(${0.95 * flip},0.95)`, opacity: 1, offset: 0.65 },
          { transform: `translate3d(calc(-50% + ${dx * 1.15}px),${dy}px,0) scale(${1.25 * flip},1.25)`, opacity: 0 },
        ],
        { duration: dur, delay: i * 110, easing: "cubic-bezier(.3,.1,.4,1)", fill: "both" },
      );
      a.onfinish = () => el.remove();
    }
  };

  const dropPetals = () => {
    const layer = petalLayer.current;
    if (!layer || typeof layer.animate !== "function") return;
    const n = small || (navigator.hardwareConcurrency || 8) <= 4 ? 18 : 30;
    const r = seeded(11);
    for (let i = 0; i < n; i++) {
      const p = document.createElement("img");
      p.src = i % 3 === 0 ? ART.petalSakura.src : ART.petalRose.src;
      p.alt = "";
      p.className = "cw-petal";
      p.style.left = `${r() * 100}%`;
      const size = 14 + r() * 16;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      layer.appendChild(p);
      const sway = (r() - 0.5) * 140;
      const rot = (r() - 0.5) * 720;
      const a = p.animate(
        [
          { transform: "translate3d(0,-8vh,0) rotate(0deg)", opacity: 0 },
          { transform: `translate3d(${sway * 0.5}px,30vh,0) rotate(${rot * 0.4}deg)`, opacity: 1, offset: 0.25 },
          { transform: `translate3d(${sway}px,110vh,0) rotate(${rot}deg)`, opacity: 0.85 },
        ],
        { duration: 3500 + r() * 2500, delay: r() * 700, easing: "linear", fill: "both" },
      );
      a.onfinish = () => p.remove();
    }
  };

  const open = () => {
    if (phase !== "closed" && phase !== "loading") return;
    // The song starts inside this tap (the gesture browsers require), never before it.
    if (music?.available && !music.playing && !music.userOff) music.start();
    ringBell();
    try {
      navigator.vibrate?.(18);
    } catch {}
    if (reduce) {
      setPhase("enter");
      later(30, onOpened);
      later(420, () => live.current && setPhase("gone"));
      return;
    }
    setPhase("unlatch");
    later(80, () => live.current && setPhase("open"));
    later(380, () => {
      if (!live.current) return;
      flyDoves();
      dropPetals();
    });
    later(1150, () => {
      if (!live.current) return;
      setPhase("enter");
      onOpened();
    });
    later(2250, () => live.current && setPhase("gone"));
  };

  if (phase === "gone") return null;
  const busy = phase === "loading";

  return (
    <div ref={root} className={`cw-gate is-${phase}${reduce ? " is-reduced" : ""}`} data-cw-gate={phase}>
      <div className="cw-gate-bg" aria-hidden>
        <span className="cw-gate-glow" />
        {/* Wide screens: the chapel garden around the portal. */}
        <span className="cw-gate-side is-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-gate-col" {...img(ART.column)} />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-gate-side-ivy" {...img(ART.ivy)} />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-gate-urn" {...img(ART.urn)} />
        </span>
        <span className="cw-gate-side is-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-gate-col" {...img(ART.column)} />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-gate-side-ivy" {...img(ART.ivy)} />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-gate-urn" {...img(ART.urn)} />
        </span>
      </div>

      <div className="cw-gate-cam">
        <div className="cw-stage">
          {/* The aisle behind the doors, inside the doorway only (so its vanishing point is the door's). */}
          <div className="cw-doorway" style={pct(DOORWAY)} aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="cw-aisle" data-cw-pre {...img(ART.aisle)} />
            <span className="cw-doorway-bloom" />
            <span className="cw-doorway-rays" style={{ backgroundImage: `url(${ART.rays.sm})` }} />
            <span className="cw-motes">
              {motes.map((m, i) => (
                <i key={i} style={{ left: `${m.left}%`, width: m.size, height: m.size, animationDelay: `${m.delay}s`, animationDuration: `${m.dur}s`, ["--dx" as string]: `${m.dx}px` }} />
              ))}
            </span>
          </div>

          <div className="cw-leaves" aria-hidden>
            {(["l", "r"] as const).map((k) => {
              const a = k === "l" ? ART.doorL : ART.doorR;
              return (
                <div key={k} className={`cw-leaf is-${k}`} style={pct(LEAF[k])}>
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img data-cw-pre {...img(a, { high: true, small })} />
                  <span className="cw-leaf-shade" />
                </div>
              );
            })}
          </div>

          {/* Morning light through the crack between the leaves. */}
          <span className="cw-seam" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-portal" data-cw-pre {...img(ART.portal, { high: true, small })} sizes="(max-width: 640px) 160vw, 75svh" aria-hidden />
          <span className="cw-fan-glow" style={pct(FANLIGHT)} aria-hidden />
          <span className="cw-rose-glow" aria-hidden />

          {/* The wedding flowers on the church door. */}
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-stage-arch" data-cw-pre {...img(ART.floralArch, { small })} aria-hidden />
          <span className="cw-stage-bq is-l" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img(ART.peonyBouquet)} />
          </span>
          <span className="cw-stage-bq is-r" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img(ART.roseBouquet)} />
          </span>
          <div className="cw-gate-doves" ref={doveLayer} aria-hidden />
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img className="cw-gate-pampas is-l" {...img(ART.pampasCorner)} aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img className="cw-gate-pampas is-r" {...img(ART.pampasCorner)} aria-hidden />

      <div className="cw-gate-copy">
        {guest && (
          <p className="cw-gate-dear">
            Dear <b>{guest}</b>, you are invited
          </p>
        )}
        <p className="cw-gate-eyebrow">Join us at the altar</p>
        <h1 className="cw-gate-names">
          <span>{first}</span> <i>&amp;</i> <span>{second}</span>
        </h1>
        {dateLine && <p className="cw-gate-date">{dateLine}</p>}
      </div>

      <div className="cw-gate-petals" ref={petalLayer} aria-hidden />

      {/* The whole doorway is a tap target too (a real button for keyboards and readers). */}
      <button type="button" className="cw-gate-hit" onClick={open} aria-label={`Open the invitation: ${first} and ${second}`} tabIndex={-1} />
      <div className="cw-gate-cta-wrap">
        <button type="button" className="cw-gate-cta" onClick={open} disabled={busy} aria-busy={busy} aria-label="Open invitation">
          <span className="cw-gate-cta-ring" aria-hidden />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3v3M10.5 4.5h3M6 21V12a6 6 0 0 1 12 0v9M4 21h16M12 9.5V21" />
          </svg>
          {busy ? "Opening your invitation…" : "Tap to open the doors"}
        </button>
        {music?.available && (
          <p className="cw-gate-hint" aria-hidden>
            ♪ Sound on for the bells
          </p>
        )}
      </div>
    </div>
  );
}
