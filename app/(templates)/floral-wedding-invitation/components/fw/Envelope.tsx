"use client";

// ─── The opening: a wax-sealed envelope on handmade paper ────────────────────
// Poster: the paper, pampas grass swaying in from both corners, a pampas
// cloud bank along the bottom, a gold line-art swirl that draws itself, and a
// nude envelope addressed to the guest ("Dear Sharma family" from ?to=, else
// the couple's names) sealed with dusty-rose wax and their initials.
// One tap (also the gesture that starts the music):
//   0.00 s  the seal cracks: its two halves fall apart
//   0.45 s  the flap swings up (rotateX, 3D)
//   1.10 s  the folded card rises out of the envelope
//   1.95 s  its top fold opens (paper-fold, rotateX) on the names
//   2.95 s  the envelope sinks away, the card lifts toward the guest and
//           dissolves into the hero (already decoded underneath), petals fall
// Transform/opacity only. Reduced motion: a 400 ms crossfade.

import { useEffect, useMemo, useRef, useState } from "react";
import { initialOf, useWeddingReducedMotion } from "../../../_wedding";
import type { Strings } from "./model";
import { decodeAll, pic, seeded } from "./art";
import Wipe from "./Wipe";

export interface EnvelopeProps {
  first: string;
  second: string;
  dateLine: string;
  guest: string;
  s: Strings;
  lang: "en" | "hi";
  onOpened: () => void;
}

type Phase = "closed" | "crack" | "flap" | "rise" | "unfold" | "leave" | "gone";

export default function Envelope({ first, second, dateLine, guest, s, lang, onOpened }: EnvelopeProps) {
  const reduce = useWeddingReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");
  const [ready, setReady] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const live = useRef(true);
  const petals = useMemo(() => {
    const r = seeded(7);
    return Array.from({ length: 16 }, () => ({ left: r() * 100, delay: r() * 0.9, dur: 2.6 + r() * 1.8, dx: (r() - 0.5) * 140, rot: (r() - 0.5) * 540, size: 10 + r() * 10, tone: r() }));
  }, []);

  // The page stays still behind the envelope.
  useEffect(() => {
    if (phase === "gone") return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [phase]);

  // Fade the poster in only once its art is decoded (no pop-in).
  useEffect(() => {
    live.current = true;
    const list = timers.current;
    const imgs = Array.from(rootRef.current?.querySelectorAll("img") ?? []);
    void decodeAll(imgs, 1500).then(() => live.current && setReady(true));
    return () => {
      live.current = false;
      list.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(() => live.current && fn(), ms));

  const open = () => {
    if (phase !== "closed") return;
    try {
      navigator.vibrate?.(14);
    } catch {}
    if (reduce) {
      setPhase("leave");
      later(30, onOpened);
      later(420, () => setPhase("gone"));
      return;
    }
    setPhase("crack");
    // The hero is already in the DOM under the envelope: decode its art while
    // the seal cracks, so the reveal's first frames don't jank.
    const hero = Array.from(document.querySelectorAll<HTMLImageElement>(".fw-hero img"));
    const ready = decodeAll(hero, 1800);
    later(450, () => setPhase("flap"));
    later(1100, () => setPhase("rise"));
    later(1950, () => setPhase("unfold"));
    void Promise.all([ready, new Promise((r) => window.setTimeout(r, 2950))]).then(() => {
      if (!live.current) return;
      setPhase("leave");
      onOpened();
      later(1100, () => setPhase("gone"));
    });
  };

  if (phase === "gone") return null;
  const a = initialOf(first);
  const b = initialOf(second);
  return (
    <div ref={rootRef} className={`fw-env is-${phase}${ready ? " is-ready" : ""}${reduce ? " is-reduced" : ""}`} data-fw-env={phase}>
      <div className="fw-env-bg" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="fw-env-clouds" {...pic("clouds", { high: true })} />
        <span className="fw-env-corner is-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("pampasCorner")} />
        </span>
        <span className="fw-env-corner is-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("pampasCorner")} />
        </span>
        <Wipe role="swirl" className="fw-env-swirl" when={ready} sizes="(min-width: 768px) 420px, 64vw" />
        <Wipe role="swirl" className="fw-env-swirl is-r" when={ready} delay={500} sizes="(min-width: 768px) 420px, 64vw" />
      </div>

      <div className="fw-env-head">
        {guest ? (
          <p className="fw-env-dear" lang={lang}>
            {s.dear} <b>{guest}</b>,
          </p>
        ) : null}
        <p className="wk-eyebrow" lang={lang}>
          {s.invited}
        </p>
      </div>

      <div className="fw-env-stage">
        <div className="fw-envelope">
          <div className="fw-env-back" aria-hidden />
          <div className="fw-card" aria-hidden>
            <div className="fw-card-face">
              <span className="fw-card-k">{s.shubh}</span>
              <span className="fw-card-n">{first}</span>
              <span className="fw-card-amp">&amp;</span>
              <span className="fw-card-n">{second}</span>
              {dateLine && <span className="fw-card-d">{dateLine}</span>}
            </div>
            <div className="fw-card-fold">
              <span className="fw-card-fold-front">
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...pic("peonyPink")} />
              </span>
              <span className="fw-card-fold-back" />
            </div>
          </div>
          <div className="fw-env-pocket" aria-hidden>
            <span className="fw-env-to">
              {guest ? (
                <>
                  <small lang={lang}>{s.dear}</small>
                  <b>{guest}</b>
                </>
              ) : (
                <b>
                  {first} &amp; {second}
                </b>
              )}
            </span>
          </div>
          <div className="fw-env-flap" aria-hidden>
            <i className="fw-env-flap-out" />
            <i className="fw-env-flap-in" />
          </div>
          <button type="button" className="fw-seal" onClick={open} aria-label={`${s.open}: ${first} ${s.and} ${second}`}>
            <span className="fw-seal-half is-l" aria-hidden>
              <i />
            </span>
            <span className="fw-seal-half is-r" aria-hidden>
              <i />
            </span>
            <span className="fw-seal-ini" aria-hidden>
              {a}
              <em>&amp;</em>
              {b}
            </span>
          </button>
        </div>
      </div>

      <div className="fw-env-foot">
        <button type="button" className="fw-env-cta" onClick={open} lang={lang}>
          {s.open}
        </button>
        <p className="fw-env-hint" lang={lang}>
          {s.openHint}
        </p>
      </div>

      {(phase === "leave" || phase === "unfold") && !reduce && (
        <div className="fw-petals" aria-hidden>
          {petals.map((p, i) => (
            <i
              key={i}
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size * 0.72,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
                ["--dx" as string]: `${p.dx}px`,
                ["--rot" as string]: `${p.rot}deg`,
                ["--tone" as string]: p.tone > 0.66 ? "#f3d9d3" : p.tone > 0.33 ? "#e8b9b4" : "#f7ead9",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
