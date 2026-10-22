"use client";

// ─── The palace gates (the opening, spec 6.3 scenes 0–2) ─────────────────────
// Poster: the theme's royal plate, a marigold toran, a gold jharokha with a
// kalash finial, two carved lacquer doors (jali panels, brass studs, knockers),
// a gold sunburst medallion with the couple's initials on the seam, diyas at
// the threshold, embers rising. One tap (also the gesture that starts music):
//   0.0 s  the medallion presses, Ganesha (or the royal crest) glows in on the
//          doors with "॥ श्री गणेशाय नमः ॥"
//   2.6 s  the doors swing outward in 3D, light floods through, petals burst
//   3.4 s  the camera pushes through the gateway into the courtyard (the hero,
//          already decoded behind the gate) and the gate layer is removed.
// Transform/opacity only. Reduced motion: a plain 400 ms crossfade.

import { useEffect, useMemo, useRef, useState } from "react";
import { Monogram, Ornament, PetalBurst, initialOf, useWeddingReducedMotion } from "../../../_wedding";
import type { Strings } from "./model";
import Door from "./Door";
import Toran from "./Toran";
import { artImg, decodeAll, seeded, type GardenArt } from "./art";

export interface GatesProps {
  first: string;
  second: string;
  dateLine: string;
  s: Strings;
  lang: "en" | "hi";
  /** Ganesha invocation (default) or the royal crest. */
  invocation: boolean;
  look: GardenArt;
  onOpened: () => void;
}

type Phase = "closed" | "invoke" | "open" | "push" | "gone";

export default function Gates({ first, second, dateLine, s, lang, invocation, look, onOpened }: GatesProps) {
  const reduce = useWeddingReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");
  const timers = useRef<number[]>([]);
  const live = useRef(true);
  const embers = useMemo(() => {
    const r = seeded(29);
    return Array.from({ length: 6 }, () => ({ left: 8 + r() * 84, delay: -r() * 10, dur: 8 + r() * 5, dx: (r() - 0.5) * 60 }));
  }, []);

  // The page stays still behind the closed gates.
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

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const open = () => {
    if (phase !== "closed") return;
    try {
      navigator.vibrate?.(18);
    } catch {}
    if (reduce) {
      setPhase("push");
      later(50, onOpened);
      later(450, () => setPhase("gone"));
      return;
    }
    setPhase("invoke");
    // The courtyard is already in the DOM under the gate: decode its art while
    // the guest watches the invocation, so the push's first frames don't jank.
    const court = Array.from(document.querySelectorAll<HTMLImageElement>(".gw-court img"));
    const ready = Promise.all([decodeAll(court, 2400), new Promise((r) => window.setTimeout(r, 2600))]);
    void ready.then(() => {
      if (!live.current) return;
      setPhase("open");
      later(800, () => {
        setPhase("push");
        onOpened();
      });
      later(2900, () => setPhase("gone"));
    });
  };

  if (phase === "gone") return null;
  const opening = phase === "open" || phase === "push";
  return (
    <div className={`gw-gate is-${phase}${reduce ? " is-reduced" : ""}`} data-gw-gate={phase}>
      <div className="gw-gate-world">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="gw-gate-plate" {...artImg(look.plate, { high: true })} />
        <div className="gw-gate-vignette" aria-hidden />
        <div className="gw-embers" aria-hidden>
          {embers.map((e, i) => (
            <i key={i} style={{ left: `${e.left}%`, animationDelay: `${e.delay}s`, animationDuration: `${e.dur}s`, ["--dx" as string]: `${e.dx}px` }} />
          ))}
        </div>
        <Toran className="gw-toran-gate" />
        <div className="gw-gate-stage">
          <div className="gw-arch">
            <div className="gw-light" aria-hidden />
            <div className="gw-rays" aria-hidden />
            <div className="gw-doors">
              <Door side="left" />
              <Door side="right" />
            </div>
            <Ornament id="jharokha-arch" className="gw-arch-frame" shimmer />
            <span className="gw-finial" aria-hidden>
              <Ornament id="kalash" width={44} />
            </span>
            <div className="gw-invoke" aria-hidden={phase !== "invoke"}>
              <span className="gw-invoke-glow" />
              {invocation ? (
                // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                <img className="gw-ganesha" {...artImg("royal/ganesha-line-art-01")} />
              ) : (
                <span className="gw-crest">
                  <Monogram a={first} b={second} variant="crest" size={120} />
                </span>
              )}
              <p className="gw-mantra" lang="hi">
                {invocation ? "॥ श्री गणेशाय नमः ॥" : "॥ शुभ विवाह ॥"}
              </p>
            </div>
            <button type="button" className="gw-medal" onClick={open} aria-label={`${s.open}: ${first} ${s.and} ${second}`}>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img className="gw-medal-ring" {...artImg("gold/gold-sunburst-ring-01")} />
              <span className="gw-medal-ini" aria-hidden>
                {initialOf(first)}
                <i>&amp;</i>
                {initialOf(second)}
              </span>
            </button>
          </div>
          <div className="gw-diyas" aria-hidden>
            {[0, 1].map((i) => (
              <span key={i} className="gw-diya">
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...artImg("royal/diya-clay-flame-01")} />
                <i className="gw-flame" />
              </span>
            ))}
          </div>
        </div>
        <div className="gw-gate-copy">
          <p className="wk-eyebrow" lang={lang}>
            {s.shubh}
          </p>
          <p className="gw-gate-names wk-foil-text wk-shimmer">
            {first} <span>&amp;</span> {second}
          </p>
          {dateLine && <p className="gw-gate-date">{dateLine}</p>}
          <button type="button" className="gw-gate-cta" onClick={open} lang={lang}>
            <span aria-hidden>✦</span> {s.open}
          </button>
        </div>
      </div>
      {opening && !reduce && (
        <div className="gw-gate-petals">
          <PetalBurst kind={["marigold-petal", "rose-petal", "marigold-petal", "gold-confetti"]} count={18} mode="burst" seed={11} />
        </div>
      )}
    </div>
  );
}
