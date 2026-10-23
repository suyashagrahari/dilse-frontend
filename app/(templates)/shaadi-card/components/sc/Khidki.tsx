"use client";

// ─── The opening: a painted village khidki under a marigold toran ───────────
//
// A lime-washed wall, a carved and painted window frame with a terracotta
// chhajja, two teal shutters (folk flowers, a kalash of blooms, brass studs,
// iron ring handles) and a marigold toran over the top; two diyas flicker on
// the sill. Above it "॥ श्री गणेशाय नमः ॥" and the guest's own greeting
// (?to=), below it the couple's names and a "Tap to open the khidki" pill.
// The tap is also the gesture that starts the music (DayMusicProvider listens
// for the first tap) and rings a small temple bell (Web Audio, after the tap).
//
//   0 ms     tap: bell, toran strands swing, haldi light blooms behind the shutters
//   0–1300   the shutters fold outward on their hinges (rotateY ±112°, a small
//            overshoot spring), shading as they turn from the light
//   150–900  light rays spill through the opening
//   250–2000 marigold and rose petals spray out of the window towards the guest
//   500      two marigold garlands drop and swing in at the sides of the frame
//   950–1900 the camera pushes in through the window onto the haldi mandap
//   1500–2150 the wall fades away and the page below rises in
//
// Art is decoded before the CTA enables ("Opening your invitation…" until
// then). Only transform/opacity animate; petals are WAAPI on <img>, capped at
// 24 on small/low-end phones. Reduced motion: no turning, no petals, a 400 ms
// cross-fade. Enter / Space open it too; the pill is a real <button>.

import { useEffect, useRef, useState } from "react";
import { useWeddingReducedMotion } from "../../../_wedding";
import { ART, decodeAll, img } from "../assets";
import type { Lang, Strings } from "../model";

export interface KhidkiProps {
  first: string;
  second: string;
  dateLine: string;
  guest: string;
  s: Strings;
  lang: Lang;
  invocation: boolean;
  onOpened: () => void;
  onGone?: () => void;
}

type Phase = "closed" | "opening" | "gone";

/** A small temple bell: inharmonic partials with long decays. Only ever called inside the tap. */
function ringBell() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const t0 = ctx.currentTime + 0.02;
    const master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
    const partials: [number, number, number][] = [
      [1, 1, 2.6],
      [2.32, 0.55, 1.8],
      [3.98, 0.32, 1.2],
      [5.43, 0.22, 0.9],
      [6.8, 0.12, 0.6],
    ];
    const strike = (f0: number, at: number, level: number) => {
      for (const [ratio, amp, decay] of partials) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = f0 * ratio;
        g.gain.setValueAtTime(0, at);
        g.gain.linearRampToValueAtTime(amp * level, at + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
        o.connect(g).connect(master);
        o.start(at);
        o.stop(at + decay + 0.05);
      }
    };
    strike(880, t0, 1);
    strike(1175, t0 + 0.42, 0.55);
    window.setTimeout(() => void ctx.close().catch(() => undefined), 3600);
  } catch {
    /* no audio: the opening is still the opening */
  }
}

/** Petals out of the window towards the guest (WAAPI on transform only). */
function sprayPetals(host: HTMLElement, origin: DOMRect, count: number) {
  const kinds = [ART.petalMarigold.src, ART.petalMarigold.src, ART.petalRose.src, ART.petalMarigold.src];
  // The gate is fixed to the viewport on the live page, but to the preview pane
  // in the editor (a transformed ancestor): place petals relative to the gate.
  const host0 = host.getBoundingClientRect();
  const cx = origin.left - host0.left + origin.width / 2;
  const cy = origin.top - host0.top + origin.height * 0.45;
  const vw = host0.width || window.innerWidth;
  const vh = host0.height || window.innerHeight;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("img");
    el.src = kinds[i % kinds.length];
    el.alt = "";
    el.className = "sc-petal";
    el.decoding = "async";
    const size = 14 + Math.random() * 16;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${cx - size / 2}px`;
    el.style.top = `${cy - size / 2}px`;
    host.appendChild(el);
    const ang = Math.random() * Math.PI * 2;
    const reach = 0.35 + Math.random() * 0.55;
    const dx = Math.cos(ang) * vw * reach;
    const dy = Math.sin(ang) * vh * reach * 0.8 + vh * 0.18;
    const rot = (Math.random() - 0.5) * 900;
    const dur = 1700 + Math.random() * 1300;
    const anim = el.animate(
      [
        { transform: "translate3d(0,0,0) scale(.3) rotate(0deg)", opacity: 0 },
        { transform: `translate3d(${dx * 0.35}px, ${dy * 0.2 - 40}px, 0) scale(1) rotate(${rot * 0.3}deg)`, opacity: 1, offset: 0.25 },
        { transform: `translate3d(${dx}px, ${dy}px, 0) scale(${1.4 + Math.random() * 0.8}) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: dur, delay: Math.random() * 450, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" },
    );
    anim.onfinish = () => el.remove();
  }
}

export default function Khidki({ first, second, dateLine, guest, s, lang, invocation, onOpened, onGone }: KhidkiProps) {
  const reduce = useWeddingReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  // Nothing scrolls behind the closed window.
  useEffect(() => {
    if (phase === "gone") return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [phase]);

  // Decode the window first (the CTA waits), then warm the mandap below.
  useEffect(() => {
    let live = true;
    const own = Array.from(ref.current?.querySelectorAll<HTMLImageElement>("img") ?? []);
    void decodeAll(own, 2200).then(() => live && setReady(true));
    const hero = Array.from(document.querySelectorAll<HTMLImageElement>(".sc-hero img"));
    void decodeAll(hero, 5000);
    const list = timers.current;
    return () => {
      live = false;
      list.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const open = () => {
    if (phase !== "closed") return;
    try {
      navigator.vibrate?.(12);
    } catch {
      /* no vibration */
    }
    if (!reduce) ringBell();
    setPhase("opening");
    onOpened();
    if (!reduce && ref.current && stageRef.current) {
      const small = window.innerWidth < 600 || (navigator.hardwareConcurrency || 8) <= 4;
      const host = ref.current;
      const box = stageRef.current.querySelector(".sc-aperture")?.getBoundingClientRect() ?? stageRef.current.getBoundingClientRect();
      later(260, () => sprayPetals(host, box, small ? 24 : 40));
    }
    later(reduce ? 420 : 2150, () => {
      setPhase("gone");
      onGone?.();
    });
  };

  // Enter / Space anywhere opens it (the pill has focus by default anyway).
  useEffect(() => {
    if (phase !== "closed" || !ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        const t = e.target as HTMLElement | null;
        if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (phase === "gone") return null;
  const label = `${s.open}: ${first} ${s.and} ${second}`;
  return (
    <div ref={ref} className={`sc-gate is-${phase}${ready ? " is-ready" : ""}${reduce ? " is-reduced" : ""}`} data-sc-gate={phase}>
      <div className="sc-gate-wall" aria-hidden />
      <span className="sc-gate-side sc-gate-side-l" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="sc-gate-guard" {...img(ART.guard)} />
      </span>
      <span className="sc-gate-side sc-gate-side-r" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="sc-gate-guard" {...img(ART.guard)} />
      </span>
      <span className="sc-gate-pot sc-gate-pot-l" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.pots)} />
      </span>
      <span className="sc-gate-pot sc-gate-pot-r" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(ART.pots)} />
      </span>

      <div className="sc-gate-col">
        <header className="sc-gate-top">
          {invocation && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="sc-gate-ganesh" {...img(ART.ganeshText, { high: true })} alt="॥ श्री गणेशाय नमः ॥" lang="hi" />
            </>
          )}
          {guest ? (
            <p className="sc-gate-dear">
              <span lang={lang}>{s.dear}</span> <b>{guest}</b>,<br />
              <span lang={lang}>{s.invitedYou}</span>
            </p>
          ) : (
            <p className="sc-gate-k" lang={lang}>
              {s.together}
            </p>
          )}
        </header>

        <div ref={stageRef} className="sc-stage" onClick={open} role="presentation">
          <div className="sc-stage-in">
            <div className="sc-aperture" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="sc-ap-bg" {...img(ART.mandapSm, { high: true })} srcSet={`${ART.mandapSm.src} 720w, ${ART.mandap.src} 1080w`} sizes="(max-width: 600px) 80vw, 420px" />
              <span className="sc-ap-bloom" />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="sc-ap-rays" {...img(ART.raysSm)} />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="sc-frame" {...img(ART.frame, { high: true })} />
            <div className="sc-leaf sc-leaf-l" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img(ART.shutterL, { high: true })} />
              <span className="sc-leaf-shade" />
            </div>
            <div className="sc-leaf sc-leaf-r" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img(ART.shutterR, { high: true })} />
              <span className="sc-leaf-shade" />
            </div>
            <span className="sc-floor-shadow" aria-hidden />
            <span className="sc-diya sc-diya-l" aria-hidden>
              <i />
            </span>
            <span className="sc-diya sc-diya-r" aria-hidden>
              <i />
            </span>
            <div className="sc-toran" aria-hidden>
              {[0, 1, 2].map((k) => (
                <span key={k} className={`sc-toran-part sc-toran-${k}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img {...img(ART.toran, { high: true })} />
                </span>
              ))}
            </div>
            <span className="sc-strand sc-strand-l" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img(ART.garland)} />
            </span>
            <span className="sc-strand sc-strand-r" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img(ART.garland)} />
            </span>
          </div>
        </div>

        <footer className="sc-gate-foot">
          <p className="sc-gate-names">
            <span>{first}</span>
            <i aria-hidden>&amp;</i>
            <span>{second}</span>
          </p>
          {dateLine && <p className="sc-gate-date">{dateLine}</p>}
          <button type="button" className="sc-gate-cta" onClick={open} disabled={!ready || phase !== "closed"} aria-label={label} autoFocus lang={lang}>
            <span className="sc-gate-cta-ring" aria-hidden />
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
              <path d="M5 4.5h14a1 1 0 0 1 1 1V20H4V5.5a1 1 0 0 1 1-1zM12 4.5V20M3 20h18M9.6 12.3h.01M14.4 12.3h.01" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{ready ? s.open : s.opening}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
