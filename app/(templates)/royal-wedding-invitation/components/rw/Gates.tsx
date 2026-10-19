"use client";

// ─── The palace gates (the opening) ──────────────────────────────────────────
// Two carved doors (the asset pack's two-tone SVGs, inlined so their panel
// colour follows the theme via --w-door) under a jharokha arch, a toran across
// the top, two diyas flickering at the threshold and a wax seal with the
// couple's initials on the seam. One tap: the seal lifts, the doors swing in
// (rotateY, transform only), warm light spills out with petals, and the gate
// dissolves into the invitation. The tap is also the gesture that starts the
// music. Reduced motion: a plain crossfade.

import { useEffect, useRef, useState } from "react";
import { Ornament, PetalBurst, initialOf, useWeddingReducedMotion } from "../../../_wedding";
import type { Strings } from "./model";

const svgCache = new Map<string, Promise<string>>();
function loadSvg(id: string): Promise<string> {
  let p = svgCache.get(id);
  if (!p) {
    p = fetch(`/wedding/ornaments/${id}.svg`)
      .then((r) => (r.ok ? r.text() : ""))
      .catch(() => "");
    svgCache.set(id, p);
  }
  return p;
}

function Door({ side }: { side: "left" | "right" }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    let live = true;
    void loadSvg(`gate-door-${side}`).then((s) => live && setSvg(s.startsWith("<svg") ? s : ""));
    return () => {
      live = false;
    };
  }, [side]);
  return (
    <div className={`rw-door rw-door-${side}`} aria-hidden>
      <div className="rw-door-face" dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}>
        {svg ? undefined : <span className="rw-door-fallback" />}
      </div>
    </div>
  );
}

export interface GatesProps {
  first: string;
  second: string;
  dateLine: string;
  s: Strings;
  lang: "en" | "hi";
  onOpened: () => void;
}

export default function Gates({ first, second, dateLine, s, lang, onOpened }: GatesProps) {
  const reduce = useWeddingReducedMotion();
  const [phase, setPhase] = useState<"closed" | "opening" | "gone">("closed");
  const timers = useRef<number[]>([]);

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

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const open = () => {
    if (phase !== "closed") return;
    setPhase("opening");
    try {
      navigator.vibrate?.(18);
    } catch {}
    timers.current.push(window.setTimeout(() => onOpened(), reduce ? 50 : 900));
    timers.current.push(window.setTimeout(() => setPhase("gone"), reduce ? 450 : 2600));
  };

  if (phase === "gone") return null;
  return (
    <div className={`rw-gate${phase === "opening" ? " is-opening" : ""}${reduce ? " is-reduced" : ""}`} data-rw-gate={phase}>
      <div className="rw-gate-sky" aria-hidden />
      <div className="rw-toran" aria-hidden />
      <div className="rw-gate-stage">
        <div className="rw-arch">
          <div className="rw-light" aria-hidden />
          <div className="rw-doors">
            <Door side="left" />
            <Door side="right" />
          </div>
          <Ornament id="jharokha-arch" className="rw-arch-frame" shimmer />
          <button type="button" className="rw-seal" onClick={open} aria-label={`${s.open}: ${first} ${s.and} ${second}`}>
            <Ornament id="wax-seal" className="rw-seal-wax" tone="ink" />
            <span className="rw-seal-ini" aria-hidden>
              {initialOf(first)}
              <i>&amp;</i>
              {initialOf(second)}
            </span>
          </button>
        </div>
        <div className="rw-diyas" aria-hidden>
          <span className="rw-diya">
            <i className="rw-flame" />
            <Ornament id="diya" width={54} />
          </span>
          <span className="rw-diya">
            <i className="rw-flame" />
            <Ornament id="diya" width={54} />
          </span>
        </div>
      </div>
      <div className="rw-gate-copy">
        <p className="wk-eyebrow" lang={lang}>{s.shubh}</p>
        <p className="rw-gate-names wk-foil-text wk-shimmer">
          {first} <span>&amp;</span> {second}
        </p>
        {dateLine && <p className="rw-gate-date">{dateLine}</p>}
        <button type="button" className="rw-gate-cta" onClick={open} lang={lang}>
          <span aria-hidden>✦</span> {s.open}
        </button>
      </div>
      {phase === "opening" && !reduce && (
        <div className="rw-gate-petals">
          <PetalBurst kind={["rose-petal", "marigold-petal", "gold-confetti", "gold-confetti-round"]} count={26} mode="fall" seed={11} />
        </div>
      )}
    </div>
  );
}
