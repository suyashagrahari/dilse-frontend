"use client";

// ─── The opening: a wax-sealed envelope on handmade paper ────────────────────
// Poster: the paper, pampas grass swaying in from both corners, a pampas
// cloud bank along the bottom, a gold line-art swirl that draws itself, and a
// nude envelope addressed to the guest ("Dear Sharma family" from ?to=, else
// the couple's names) sealed with dusty-rose wax and their initials.
// One tap (also the gesture that starts the music), paced like a real letter:
//   0.00 s  the seal cracks: its two halves fall apart
//   0.40 s  the flap swings open on its top hinge (rotateX with perspective);
//           edge-on at the halfway point it tucks behind the card
//   1.30 s  the card slides up and right out of the pocket while the envelope
//           settles lower
//   2.45 s  out of the pocket, the card comes forward to the middle of the
//           screen and grows a little; the envelope slips away below
//   3.40 s  its folded top opens (paper-fold) on the names
//   4.45 s  the card lifts toward the guest and dissolves into the hero
//           (already decoded underneath), petals fall
// No 3D context and no two-faced cards: each hinge is one piece of paper with
// its own perspective(), so the layers keep their paper order (z-index). The
// flap turns its outside to its lining at the exact halfway point, edge-on
// (a symmetric ease puts 90° at 50% of the time), and drops behind the card
// there; the card's folded top lifts and fades as it passes edge-on. Transform/opacity only. Reduced motion: a 400 ms crossfade.

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

type Phase = "closed" | "crack" | "flap" | "rise" | "out" | "unfold" | "leave" | "gone";

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
    later(400, () => setPhase("flap"));
    later(1300, () => setPhase("rise"));
    later(2450, () => setPhase("out"));
    later(3400, () => setPhase("unfold"));
    void Promise.all([ready, new Promise((r) => window.setTimeout(r, 4450))]).then(() => {
      if (!live.current) return;
      setPhase("leave");
      onOpened();
      later(1200, () => setPhase("gone"));
    });
  };

  if (phase === "gone") return null;
  const a = initialOf(first);
  const b = initialOf(second);
  return (
    <div ref={rootRef} className={`fw-env is-${phase}${ready ? " is-ready" : ""}${reduce ? " is-reduced" : ""}`} data-fw-env={phase}>
      <span className="fw-frame" aria-hidden />
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
            </div>
          </div>
          <div className="fw-env-pocket" aria-hidden>
            {/* The pocket is drawn, not clipped: a clip-path is dropped when the turning flap promotes its
                neighbours to their own compositor layers, and the pocket then covered the card. */}
            <svg className="fw-env-pocket-art" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
              <defs>
                <linearGradient id="fw-pk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" style={{ stopColor: "var(--fw-env)" }} />
                  <stop offset="1" style={{ stopColor: "var(--fw-env-2)" }} />
                </linearGradient>
                <linearGradient id="fw-pk-lo" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0" stopColor="#fff" stopOpacity=".22" />
                  <stop offset="1" stopColor="#785032" stopOpacity=".08" />
                </linearGradient>
                <linearGradient id="fw-pk-side" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#785032" stopOpacity=".07" />
                  <stop offset=".28" stopColor="#785032" stopOpacity="0" />
                  <stop offset=".72" stopColor="#785032" stopOpacity="0" />
                  <stop offset="1" stopColor="#785032" stopOpacity=".07" />
                </linearGradient>
              </defs>
              <path d="M0 0 L50 55 L100 0 L100 100 L0 100 Z" fill="url(#fw-pk)" />
              <path d="M0 0 L50 55 L100 0 L100 100 L0 100 Z" fill="url(#fw-pk-side)" />
              <path d="M0 100 L50 52 L100 100 Z" fill="url(#fw-pk-lo)" />
            </svg>
            <span className="fw-env-to">
              {/* Addressed to the guest (the "Dear …," greeting sits above the envelope; a second "Dear" here crowded the seal). */}
              {guest ? (
                <b>{guest}</b>
              ) : (
                <b>
                  {first} &amp; {second}
                </b>
              )}
            </span>
          </div>
          <div className="fw-env-flap" aria-hidden />
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
