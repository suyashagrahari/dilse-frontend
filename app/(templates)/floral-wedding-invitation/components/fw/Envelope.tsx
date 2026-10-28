"use client";

// ─── The opening: a wax-sealed envelope on handmade paper ────────────────────
// Poster: the paper, pampas grass swaying in from both corners, a pampas
// cloud bank along the bottom, a gold line-art swirl that draws itself, and a
// nude envelope of handmade paper with gold-foil edges, addressed to the guest
// ("Dear Sharma family" from ?to=, else the couple's names), a dried peony
// sprig tucked under a dusty-rose wax seal with their initials.
// One tap (also the gesture that starts the music), paced like a real letter:
//   0.00 s  the seal wobbles and cracks along a jagged line, a few crumbs of
//           wax fall; its top half stays stuck to the flap (it turns away with
//           it), the bottom half stays on the pocket
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
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="fw-card-bloom is-l" {...pic("peonyCorner", { high: true })} aria-hidden />
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="fw-card-bloom is-r" {...pic("peonyCorner", { high: true })} aria-hidden />
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
                <clipPath id="fw-pk-clip">
                  <path d="M0 0 L50 55 L100 0 L100 100 L0 100 Z" />
                </clipPath>
              </defs>
              <path d="M0 0 L50 55 L100 0 L100 100 L0 100 Z" fill="url(#fw-pk)" />
              <image href={pic("paperSoft").src} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" opacity=".22" clipPath="url(#fw-pk-clip)" />
              <path d="M0 0 L50 55 L100 0 L100 100 L0 100 Z" fill="url(#fw-pk-side)" />
              <path d="M0 100 L50 52 L100 100 Z" fill="url(#fw-pk-lo)" />
              {/* gold foil: the folds' edges and a fine border inside the pocket */}
              <path d="M0 100 L50 52 L100 100" fill="none" className="fw-gold-line is-soft" vectorEffect="non-scaling-stroke" />
              <path d="M0 0 L50 55 L100 0" fill="none" className="fw-gold-line" vectorEffect="non-scaling-stroke" />
              <rect x="2.2" y="3.2" width="95.6" height="93.6" rx="1" fill="none" className="fw-gold-line is-soft" vectorEffect="non-scaling-stroke" clipPath="url(#fw-pk-clip)" />
            </svg>
            <span className="fw-env-to">
              <i className="fw-env-rule" aria-hidden />
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
          <div className="fw-env-flap" aria-hidden>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
              <defs>
                <linearGradient id="fw-fl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" style={{ stopColor: "var(--fw-env)" }} />
                  <stop offset=".92" style={{ stopColor: "var(--fw-env-2)" }} />
                </linearGradient>
                <linearGradient id="fw-fl-in" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0" stopColor="#b0646b" stopOpacity=".3" />
                  <stop offset=".7" stopColor="#b0646b" stopOpacity=".1" />
                </linearGradient>
                <pattern id="fw-fl-tile" width="14" height="24" patternUnits="userSpaceOnUse">
                  <image href={pic("mandala").src} width="14" height="24" preserveAspectRatio="none" />
                </pattern>
                <clipPath id="fw-fl-clip">
                  <path d="M0 0 L100 0 L50 100 Z" />
                </clipPath>
              </defs>
              <g className="fw-flap-out">
                <path d="M0 0 L100 0 L50 100 Z" fill="url(#fw-fl)" />
                <image href={pic("paperSoft").src} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" opacity=".22" clipPath="url(#fw-fl-clip)" />
                <path d="M3 2.5 L50 94 L97 2.5" fill="none" className="fw-gold-line is-soft" vectorEffect="non-scaling-stroke" />
              </g>
              <g className="fw-flap-in">
                <path d="M0 0 L100 0 L50 100 Z" style={{ fill: "var(--fw-liner)" }} />
                <path d="M0 0 L100 0 L50 100 Z" fill="url(#fw-fl-tile)" opacity=".55" />
                <path d="M0 0 L100 0 L50 100 Z" fill="url(#fw-fl-in)" />
                <path d="M3 2.5 L50 94 L97 2.5" fill="none" className="fw-gold-line" vectorEffect="non-scaling-stroke" />
              </g>
            </svg>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="fw-env-sprig" {...pic("peonyCorner", { high: true })} aria-hidden />
          <button type="button" className="fw-seal" onClick={open} aria-label={`${s.open}: ${first} ${s.and} ${second}`}>
            {(["t", "b"] as const).map((h) => (
              <svg key={h} className={`fw-seal-half is-${h}`} viewBox="0 0 100 100" aria-hidden focusable="false">
                <defs>
                  <radialGradient id={`fw-wax-${h}`} cx="36%" cy="30%" r="75%">
                    <stop offset="0" stopColor="#e2a6ab" />
                    <stop offset=".42" style={{ stopColor: "var(--fw-wax1)" }} />
                    <stop offset="1" style={{ stopColor: "var(--fw-wax2)" }} />
                  </radialGradient>
                  <clipPath id={`fw-cut-${h}`}>
                    <path d={h === "t" ? "M-10 -10 H110 V52 L92 52 L76 45 L62 56 L49 44 L36 55 L23 44 L9 51 L-10 50 Z" : "M-10 50 L9 51 L23 44 L36 55 L49 44 L62 56 L76 45 L92 52 L110 52 V110 H-10 Z"} />
                  </clipPath>
                </defs>
                <g clipPath={`url(#fw-cut-${h})`}>
                  <path className="fw-wax-blob" d="M50 3 C63 2 74 7 83 14 C93 22 98 34 97 47 C99 60 95 72 86 82 C77 92 64 98 50 97 C36 98 23 93 14 84 C5 75 1 62 3 49 C2 36 7 23 16 15 C25 6 37 3 50 3 Z" fill={`url(#fw-wax-${h})`} />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,235,230,.3)" strokeWidth="2.2" />
                  <circle cx="50" cy="50" r="31.5" fill="none" stroke="rgba(60,10,20,.16)" strokeWidth="1.4" />
                  <text x="50" y="59" textAnchor="middle" className="fw-seal-ini">
                    {a}
                    <tspan className="fw-seal-amp" dx="1" dy="-3">
                      &amp;
                    </tspan>
                    <tspan dx="1" dy="3">
                      {b}
                    </tspan>
                  </text>
                </g>
              </svg>
            ))}
            <svg className="fw-seal-crack" viewBox="0 0 100 100" aria-hidden focusable="false">
              <polyline points="-2,50 9,51 23,44 36,55 49,44 62,56 76,45 92,52 102,52" fill="none" />
            </svg>
            <span className="fw-crumbs" aria-hidden>
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
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
