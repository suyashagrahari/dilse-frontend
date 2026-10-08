"use client";

// Scene 3 — Chapter I: The Night We Met (mini-game 1, "Trace the Stars"). Eight stars pulse in order; they draw
// a line star to star (it snaps within ~32 px), each connection rings the next note of a rising scale
// ("film-star", C5 → E6). The finished constellation glides into a heart and their initials write themselves in
// gold ("film-morph"). Tap-the-next-star and a "Connect the next star" button are the fallbacks; Skip is there.
// The sky is seeded from their names, so every couple gets their own constellation.

import { useCallback, useMemo, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { SkipChip, usePremium } from "../../../_valentine/kit/premium";
import { haptic } from "../../../_valentine/kit";
import { initial, longDate, seeded, type Film } from "./util";
import { SKIP_UNDER_BARS } from "./styles";

const N = 8;
const SCALE = [0, 200, 400, 700, 900, 1200, 1400, 1600];

export default function Stars({ film, sticker, onDone }: { film: Film; sticker: ReactNode; onDone: () => void }) {
  const { sfx } = usePremium();
  const svgRef = useRef<SVGSVGElement>(null);
  const { stars, heart, dust } = useMemo(() => {
    const r = seeded(`${film.to}♥${film.from}`);
    const a0 = r() * Math.PI * 2;
    const stars = Array.from({ length: N }, (_, i) => {
      const a = a0 + (i / N) * Math.PI * 1.75 + (r() - 0.5) * 0.35;
      const rad = 24 + r() * 16;
      return { x: 50 + Math.cos(a) * rad, y: 50 + Math.sin(a) * rad * 0.92 };
    });
    // Where the eight stars glide to: a heart, drawn clockwise from the dip between the lobes.
    const heart = [
      { x: 50, y: 33 }, { x: 64, y: 22 }, { x: 79, y: 31 }, { x: 74, y: 52 },
      { x: 50, y: 76 }, { x: 26, y: 52 }, { x: 21, y: 31 }, { x: 36, y: 22 },
    ];
    const dust = Array.from({ length: 70 }, () => ({ x: r() * 100, y: r() * 100, s: 0.15 + r() * 0.35, k: r() < 0.5 }));
    return { stars, heart, dust };
  }, [film.to, film.from]);

  const [n, setN] = useState(0);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [phase, setPhase] = useState<"trace" | "morph">("trace");
  const drawing = useRef(false);

  const local = (e: RPointerEvent) => {
    const b = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - b.left) / b.width) * 100, y: ((e.clientY - b.top) / b.height) * 100, snap: Math.max(6, (32 / b.width) * 100) };
  };

  const connect = useCallback(
    (k: number) => {
      if (k !== n || k >= N) return;
      sfx("film-star", { detune: SCALE[k], pan: (stars[k].x - 50) / 60 });
      haptic(6);
      const next = k + 1;
      setN(next);
      if (next === N) {
        drawing.current = false;
        setCursor(null);
        window.setTimeout(() => {
          setPhase("morph");
          sfx("film-morph");
        }, 550);
      }
    },
    [n, sfx, stars],
  );

  const near = (p: { x: number; y: number; snap: number }, k: number) => k < N && Math.hypot(p.x - stars[k].x, p.y - stars[k].y) < p.snap;

  const down = (e: RPointerEvent<SVGSVGElement>) => {
    if (phase !== "trace") return;
    const p = local(e);
    if (near(p, n)) connect(n);
    if (n > 0 || near(p, 0)) {
      drawing.current = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* fine */
      }
      setCursor(p);
    }
  };
  const move = (e: RPointerEvent<SVGSVGElement>) => {
    if (!drawing.current || phase !== "trace") return;
    const p = local(e);
    setCursor(p);
    if (near(p, n)) connect(n);
  };
  const up = () => {
    drawing.current = false;
    setCursor(null);
  };

  const pos = (k: number) => (phase === "morph" ? heart[k] : stars[k]);
  const caption = [film.metPlace, film.metDate ? longDate(film.metDate) : ""].filter(Boolean).join(" · ");
  const last = n > 0 ? stars[n - 1] : null;

  return (
    <section className="fm-scene" aria-label="Chapter one: the night we met">
      <div className="fm-col">
        <p className="fm-kick">Chapter I</p>
        <h2 className="fm-h">The Night <em>We Met</em></h2>
        <div className="fm-sky">
          <svg ref={svgRef} viewBox="0 0 100 100" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} role="application"
            aria-label={phase === "trace" ? `Constellation: ${n} of ${N} stars connected` : `The stars became ${initial(film.to)} and ${initial(film.from)}`}>
            <g className="fm-bgStars" aria-hidden>
              {dust.map((d, k) => <circle key={k} cx={d.x} cy={d.y} r={d.s} className={d.k ? "fm-twA" : "fm-twB"} />)}
            </g>
            <g className="fm-links" style={{ opacity: phase === "morph" ? 0 : 1 }} aria-hidden>
              {stars.slice(1, n).map((s, k) => <line key={k} className="fm-link" x1={stars[k].x} y1={stars[k].y} x2={s.x} y2={s.y} />)}
              {cursor && last && n < N && <line className="fm-link" x1={last.x} y1={last.y} x2={cursor.x} y2={cursor.y} style={{ opacity: 0.5, strokeDasharray: "1.5 1.5" }} />}
            </g>
            {stars.map((_, k) => {
              const p = pos(k);
              return (
                <g key={k} className={`fm-star${k < n ? " is-lit" : ""}${k === n && phase === "trace" ? " is-next" : ""}`} style={{ transform: `translate(${p.x}px, ${p.y}px)`, transitionDelay: `${k * 70}ms` }}
                  onClick={() => phase === "trace" && connect(k)}>
                  <circle className="fm-halo" r={k === n ? 4.2 : 2.6} />
                  <circle className="fm-core" r={k < n ? 1.5 : 1.15} />
                </g>
              );
            })}
            {phase === "morph" && <path className="fm-heartPath" d="M50 33 C56 19 74 15 79 31 C83 45 64 61 50 76 C36 61 17 45 21 31 C26 15 44 19 50 33 Z" />}
            {phase === "morph" && (
              <text className="fm-initials is-on" x="50" y="45" textAnchor="middle" dominantBaseline="middle">
                {initial(film.to)} ♥ {initial(film.from)}
              </text>
            )}
          </svg>
          {phase === "morph" && <span className="fm-skySticker fm-rise" style={{ animationDelay: "2.4s" }}>{sticker}</span>}
        </div>
        {phase === "trace" ? (
          <>
            <p className="fm-hint">{n === 0 ? "Touch the glowing star, then draw to the next one" : `${N - n} more ${N - n === 1 ? "star" : "stars"}`}</p>
            <button type="button" className="fm-ghost" onClick={() => connect(n)}>Connect the next star</button>
          </>
        ) : (
          <>
            <p className="fm-caption fm-rise" style={{ animationDelay: "1.4s" }}>
              {caption ? <>{caption}.<br /></> : null}The sky looked exactly like this.
            </p>
            <button type="button" className="fm-btn fm-rise" style={{ animationDelay: "2.2s" }} onClick={onDone}>Next chapter ▸</button>
          </>
        )}
      </div>
      {phase === "trace" && <SkipChip onSkip={onDone} delay={2500} style={SKIP_UNDER_BARS} />}
    </section>
  );
}
