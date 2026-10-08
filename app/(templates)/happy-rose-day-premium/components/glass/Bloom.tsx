"use client";

// Scene 3 — The bloom → the Garden Wave (the signature wow). Hold the bud (or the "Bloom" pill) for 1.2 s — a halo
// fills, the bud swells ("gh-swell") — and it opens ring by ring, its colour's meaning and their reason beneath.
// Then the camera pulls back and the garden blooms in a ripple from the centre: 3 in a cluster, 7–12 drawing a
// heart's outline, 99 filling a whole heart (49 on low-end phones), each ring of the ripple a step up a pentatonic
// bell ("gh-bloom"). The song's chorus drops ON THE FINAL BLOOM (useSongDrop: riser → seek → impact), with a
// burst of petals. One rose: it blooms alone on the drop, in a ring of light. Reduced motion: the garden appears.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePremium, useSongDrop } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { RoseHead, roseSvg, svgUrl } from "./art";
import { COLOR_MEANING, COUNT_MEANING, gardenLayout, SHADES, type Glass, type RoseColor } from "./util";

const WAVE = 2000;
const BLOOM = 650;
const HOLD = 1200;

function Garden({ color, pts, center, onRing }: { color: RoseColor; pts: { x: number; y: number; s: number; d: number }[]; center: { x: number; y: number; R: number }; onRing: (ring: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const cb = useRef(onRing);
  useEffect(() => {
    cb.current = onRing;
  });
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    if (!g) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth;
    const H = window.innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    g.scale(dpr, dpr);
    const img = new Image();
    img.src = svgUrl(roseSvg(color, 160));
    const dmax = Math.max(0.001, ...pts.map((p) => p.d));
    const delays = pts.map((p) => (p.d / dmax) * WAVE);
    const rot = pts.map(() => Math.random() * Math.PI * 2);
    let start = 0;
    let raf = 0;
    let lastRing = -1;
    const draw = (now: number) => {
      if (!start) start = now;
      const el = reduce ? 1e9 : now - start;
      g.clearRect(0, 0, W, H);
      let all = true;
      pts.forEach((p, i) => {
        const t = Math.max(0, Math.min(1, (el - delays[i]) / BLOOM));
        if (t < 1) all = false;
        if (t <= 0) return;
        const ring = Math.floor((p.d / dmax) * 6.99);
        if (!reduce && ring > lastRing) {
          lastRing = ring;
          cb.current(ring);
        }
        const e = 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2); // ease-out-back
        const size = p.s * center.R * 2 * e;
        g.save();
        g.translate(center.x + p.x * center.R, center.y + p.y * center.R);
        g.rotate(rot[i] + (1 - t) * 0.9);
        g.globalAlpha = Math.min(1, t * 1.6);
        g.drawImage(img, -size / 2, -size / 2, size, size);
        g.restore();
      });
      if (!all) raf = requestAnimationFrame(draw);
    };
    const go = () => (raf = requestAnimationFrame(draw));
    if (img.complete) go();
    else img.onload = go;
    return () => cancelAnimationFrame(raf);
    // one wave per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <canvas ref={ref} className="gh-garden" aria-hidden />;
}

export function Bloom({ g, onBurst, onDone }: { g: Glass; onBurst: () => void; onDone: () => void }) {
  const { sfx } = usePremium();
  const { drop } = useSongDrop();
  const reduce = useReducedMotion();
  const count = useMemo(() => {
    const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { deviceMemory?: number }) : null;
    const low = !!nav && ((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4);
    return g.count === 99 && low ? 49 : g.count;
  }, [g.count]);
  const pts = useMemo(() => gardenLayout(count), [count]);
  const [phase, setPhase] = useState<"bud" | "open" | "wave" | "done">("bud");
  const [hold, setHold] = useState(0);
  const [center, setCenter] = useState<{ x: number; y: number; R: number } | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const holdRef = useRef<{ t0: number; raf: number; cue: { stop: (ms?: number) => void }; auto: boolean } | null>(null);
  const shade = SHADES[g.color];

  const burst = useCallback(() => {
    sfx("gh-burst", { gain: 1.2 });
    sfx("chime-cascade", { gain: 0.7 });
    onBurst();
    setPhase("done");
  }, [sfx, onBurst]);

  const opened = useCallback(() => {
    haptic([10, 30, 10]);
    if (g.count === 1) {
      // one rose: it IS the climax — bloom on the drop
      drop(() => {
        setPhase("open");
        window.setTimeout(burst, 900);
      });
      return;
    }
    setPhase("open");
    sfx("chime-cascade", { gain: 0.6 });
    window.setTimeout(() => {
      const r = heroRef.current?.getBoundingClientRect();
      const top = (titleRef.current?.getBoundingClientRect().bottom ?? 160) + 10;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const R = Math.min(W * 0.45, H * 0.27, 360);
      const cy = Math.max(r ? r.top + r.height / 2 : H * 0.42, top + R * 1.02);
      setCenter({ x: r ? r.left + r.width / 2 : W / 2, y: cy, R });
      setPhase("wave");
      // the final bloom lands at WAVE + BLOOM; the drop's peak must land on it
      const dmax = Math.max(0.001, ...pts.map((p) => p.d));
      const last = pts.length ? Math.max(...pts.map((p) => (p.d / dmax) * WAVE)) + BLOOM : 0;
      window.setTimeout(() => drop(burst), Math.max(0, last - 1100));
    }, reduce ? 600 : 2200);
  }, [g.count, drop, burst, sfx, pts, reduce]);

  const startHold = (auto = false) => {
    if (phase !== "bud" || holdRef.current) return;
    const cue = sfx("gh-swell", { dur: HOLD / 1000 });
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / HOLD);
      setHold(p);
      if (p >= 1) {
        holdRef.current = null;
        opened();
        return;
      }
      if (holdRef.current) holdRef.current.raf = requestAnimationFrame(tick);
    };
    holdRef.current = { t0, raf: requestAnimationFrame(tick), cue, auto };
    haptic(6);
  };
  const endHold = () => {
    const h = holdRef.current;
    if (!h || h.auto) return;
    cancelAnimationFrame(h.raf);
    h.cue.stop(200);
    holdRef.current = null;
    setHold(0);
  };
  useEffect(() => () => {
    if (holdRef.current) cancelAnimationFrame(holdRef.current.raf);
  }, []);

  const C = 2 * Math.PI * 48;
  return (
    <section className="gh-scene" aria-label="The bloom">
      <p className="gh-kick">{phase === "bud" ? "Breathe it into bloom" : phase === "done" ? "Your garden" : "In bloom"}</p>
      <h2 ref={titleRef} className="gh-h" style={{ fontSize: "clamp(28px, 7.6vw, 46px)", minHeight: "2.1em", maxWidth: "20ch" }}>
        {phase === "bud" ? "Hold the bud." : phase === "done" ? COUNT_MEANING[String(g.count)] : COLOR_MEANING[g.color]}
      </h2>
      <div
        ref={heroRef}
        className={`gh-hero${phase !== "bud" ? " is-open" : ""}${phase === "wave" || phase === "done" ? (g.count > 1 ? " is-back" : "") : ""}`}
        style={{ ["--gl" as string]: shade.glow, opacity: (phase === "wave" || phase === "done") && count > 12 ? 0 : 1 }}
        onPointerDown={() => startHold()}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className="gh-heroGlow" />
        {g.count === 1 && phase === "done" && <span className="gh-halo" />}
        <RoseHead color={g.color} open={phase !== "bud"} id="gh-hero" size="100%" style={{ transform: `scale(${1 + hold * 0.12})`, transition: "transform .2s" }} />
        {phase === "bud" && (
          <svg className="gh-holdRing" viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="48" strokeDasharray={C} strokeDashoffset={C * (1 - hold)} />
          </svg>
        )}
      </div>
      {phase === "bud" && (
        <button type="button" className="gh-btn" style={{ marginTop: 16, touchAction: "none" }} onPointerDown={() => startHold()} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
          onClick={() => startHold(true)}>
          Hold (or tap) to bloom 🌹
        </button>
      )}
      {phase === "open" && g.colorReason && <div className="gh-card gh-in" style={{ marginTop: 14 }}><p className="gh-sub" style={{ maxWidth: "none" }}>{g.colorReason}</p></div>}
      {phase === "done" && (
        <div className="gh-in" style={{ display: "grid", justifyItems: "center", gap: 10, marginTop: "auto", animationDelay: "1.2s" }}>
          <button type="button" className="gh-btn" onClick={onDone}>Catch the falling petals ▸</button>
        </div>
      )}
      <p className="gh-sr" aria-live="polite">{phase === "done" ? `${count} roses bloomed${count > 3 ? " in the shape of a heart" : ""}.` : ""}</p>
      {(phase === "wave" || phase === "done") && center && count > 1 && <Garden color={g.color} pts={pts} center={center} onRing={(ring) => sfx("gh-bloom", { count: ring, gain: 0.9 })} />}
    </section>
  );
}
