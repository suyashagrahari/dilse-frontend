"use client";

// Chapter III: The last piece. One heart-shaped bonbon in ruby chocolate, kept back from the box, its top one of
// their photos, dusted in cocoa. Rub the dust away (canvas destination-out; lb-dust under the finger, the powder
// clearing is its visual twin). Past ~58 % the rest falls away, a foil glint sweeps the heart (lb-glint) and their
// line appears. A "Brush it clean" button does it for anyone who can't or won't rub.

import { useCallback, useEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, RevealText, usePremium } from "../../../_valentine/kit/premium";
import type { Boite } from "./util";

const HEART = "M50 90 C 22 71 0 53 0 28 C 0 12 12 0 27 0 C 37 0 45 6 50 14 C 55 6 63 0 73 0 C 88 0 100 12 100 28 C 100 53 78 71 50 90 Z";
export const HEART_MASK = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 92' preserveAspectRatio='none'><path d='${HEART}'/></svg>`)}")`;

export function HeartScene({ b, hasLetter, onDone }: { b: Boite; hasLetter: boolean; onDone: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [clean, setClean] = useState(false);
  const [help, setHelp] = useState(false);
  const st = useRef({ down: false, last: null as { x: number; y: number } | null, strokes: 0, lastSfx: 0, inside: [] as [number, number][], done: false });

  const paint = useCallback(() => {
    const c = canvas.current;
    const w = wrap.current;
    if (!c || !w || st.current.done) return;
    const { width, height } = w.getBoundingClientRect();
    if (!width || !height) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(width * dpr);
    c.height = Math.round(height * dpr);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createRadialGradient(width * 0.4, height * 0.3, 10, width / 2, height / 2, width * 0.7);
    g.addColorStop(0, "#8A5A42");
    g.addColorStop(0.6, "#5E3A2A");
    g.addColorStop(1, "#3E2419");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    // Cocoa powder: a few thousand specks in four browns, a little denser at the edges where it settles.
    const tones = ["#A57458", "#7A4D38", "#3A2016", "#C08E6E"];
    for (let i = 0; i < 4200; i++) {
      ctx.globalAlpha = 0.25 + Math.random() * 0.5;
      ctx.fillStyle = tones[i % 4];
      const s = 0.5 + Math.random() * 1.6;
      ctx.fillRect(Math.random() * width, Math.random() * height, s, s);
    }
    ctx.globalAlpha = 1;
    // Sample points inside the heart, for the cleared share.
    const path = new Path2D(HEART);
    const probe = document.createElement("canvas").getContext("2d");
    const pts: [number, number][] = [];
    const step = Math.max(6, Math.round(width / 34));
    for (let y = step / 2; y < height; y += step)
      for (let x = step / 2; x < width; x += step) {
        if (!probe) {
          pts.push([x, y]);
          continue;
        }
        if (probe.isPointInPath(path, (x / width) * 100, (y / height) * 92)) pts.push([x, y]);
      }
    st.current.inside = pts;
  }, []);

  useEffect(() => {
    paint();
    const w = wrap.current;
    if (!w || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => paint());
    ro.observe(w);
    return () => ro.disconnect();
  }, [paint]);

  useEffect(() => {
    const t = window.setTimeout(() => setHelp(true), 3500);
    return () => window.clearTimeout(t);
  }, []);

  const finish = useCallback(() => {
    if (st.current.done) return;
    st.current.done = true;
    setClean(true);
    haptic([10, 40, 10]);
    sfx("lb-glint", { gain: 0.8, at: 0.25 });
  }, [sfx]);

  const cleared = () => {
    const c = canvas.current;
    const ctx = c?.getContext("2d", { willReadFrequently: true } as CanvasRenderingContext2DSettings);
    const pts = st.current.inside;
    if (!c || !ctx || !pts.length) return 0;
    const dpr = c.width / (wrap.current?.getBoundingClientRect().width || 1);
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let n = 0;
    for (const [x, y] of pts) {
      const i = (Math.round(y * dpr) * c.width + Math.round(x * dpr)) * 4 + 3;
      if (data[i] < 60) n++;
    }
    return n / pts.length;
  };

  const brush = (x: number, y: number) => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    const r = Math.max(22, (wrap.current?.getBoundingClientRect().width ?? 300) / 11);
    const from = st.current.last ?? { x, y };
    const dist = Math.hypot(x - from.x, y - from.y);
    const steps = Math.max(1, Math.ceil(dist / (r / 3)));
    for (let k = 0; k <= steps; k++) {
      const px = from.x + ((x - from.x) * k) / steps;
      const py = from.y + ((y - from.y) * k) / steps;
      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, "rgba(0,0,0,.9)");
      g.addColorStop(0.6, "rgba(0,0,0,.45)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    st.current.last = { x, y };
    const now = performance.now();
    if (now - st.current.lastSfx > 140) {
      st.current.lastSfx = now;
      sfx("lb-dust", { gain: 0.8, pan: (x / (wrap.current?.getBoundingClientRect().width ?? 1)) * 1.2 - 0.6 });
    }
    if (++st.current.strokes % 6 === 0 && cleared() > 0.58) finish();
  };

  const pos = (e: RPE) => {
    const r = wrap.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <section className={`lb-scene lb-heartScene${clean ? " is-clean" : ""}`} aria-label="The last piece">
      <header className="lb-head">
        <div className="lb-headIn">
          <p className="lb-eyebrow">III · The last piece</p>
          {clean ? (
            <RevealText key="line" as="h2" text={b.heartLine} className="lb-display" delay={0.6} />
          ) : (
            <RevealText key="ask" as="h2" text="I kept one back." className="lb-display" delay={0.4} />
          )}
        </div>
      </header>

      <div className="lb-heartStage">
        <div className={`lb-heartWrap${reduce ? " is-reduced" : ""}`} style={{ ["--heart" as string]: HEART_MASK }}>
          <div className="lb-heart" ref={wrap}>
            <i className="lb-heartShell" aria-hidden />
            <i className="lb-heartRim" aria-hidden />
            <i className="lb-heartRecess" aria-hidden />
            {b.heartPhoto ? (
              <span className="lb-heartPhoto" aria-hidden>
                <CroppedPhoto photo={b.heartPhoto} alt="" eager />
              </span>
            ) : (
              <span className="lb-heartPhoto lb-heartPlain" aria-hidden>
                <b>
                  {b.monogram[0]} &amp; {b.monogram[1]}
                </b>
              </span>
            )}
            <i className="lb-heartShade" aria-hidden />
            <i className="lb-heartGloss" aria-hidden />
            <span className="lb-heartSheen" aria-hidden>
              <i />
            </span>
            <canvas
              ref={canvas}
              className="lb-dust"
              aria-hidden
              onPointerDown={(e) => {
                if (st.current.done) return;
                st.current.down = true;
                st.current.last = null;
                e.currentTarget.setPointerCapture?.(e.pointerId);
                const p = pos(e);
                brush(p.x, p.y);
              }}
              onPointerMove={(e) => {
                if (!st.current.down || st.current.done) return;
                const p = pos(e);
                brush(p.x, p.y);
              }}
              onPointerUp={() => {
                st.current.down = false;
                st.current.last = null;
                if (!st.current.done && cleared() > 0.5) finish();
              }}
              onPointerCancel={() => {
                st.current.down = false;
                st.current.last = null;
              }}
            />
          </div>
        </div>
      </div>

      <footer className="lb-foot">
        {!clean ? (
          <div className="lb-dustFoot">
            <p className="lb-hint">Brush the cocoa away</p>
            <button type="button" className={`lb-textBtn${help ? " is-on" : ""}`} onClick={finish}>
              Brush it clean
            </button>
          </div>
        ) : (
          <div className="lb-rise lb-rise2">
            <PremiumCTA tone="gold" cue="paper-rustle" onClick={onDone}>
              {hasLetter ? "Read the menu card" : "Continue"}
            </PremiumCTA>
          </div>
        )}
      </footer>
    </section>
  );
}
