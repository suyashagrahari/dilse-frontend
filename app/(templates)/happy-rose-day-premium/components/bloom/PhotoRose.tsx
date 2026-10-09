"use client";

// The rose made of their photos. Pure CSS 3D: no canvas, no WebGL, transforms + opacity only.
//
//   .rb-rose (2D: glow, scale to the stage)
//     .rb-pull (the camera pull-back: scale)
//       .rb-tilt (the camera angle: rotateX, preserve-3d)
//         .rb-spin (a very slow turn once open)
//           .rb-petal × 15 (hinged at the base: rotateZ(angle) → out by r0 → rotateX(tilt))
//             .rb-front (the photo, graded, with velvet shading that fades as it opens)
//             .rb-back  (velvet: the outside of the bud)
//
// Closed, every petal stands up and leans in: from the side you see only velvet backs, a bud. Opening lays them
// out ring by ring (outer first), turning the photo faces up to the camera while the camera tilts down over it.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { LovePhoto } from "../../../_love/types";
import { roseLayout, SHADES, type RoseColor } from "./util";

export type RosePhase = "bud" | "rising" | "open";

export function PhotoRose({
  photos,
  color,
  phase,
  warm = 0,
  onPick,
  still = false,
  className,
  style,
}: {
  photos: LovePhoto[];
  color: RoseColor;
  phase: RosePhase;
  /** 0–1 while they hold the bud: it loosens and glows. */
  warm?: number;
  /** Tap a petal (open only): the photo index. */
  onPick?: (photoIndex: number) => void;
  /** Reduced motion: no spin, no pull-back drift. */
  still?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const shade = SHADES[color];
  const petals = useMemo(() => roseLayout(photos.length), [photos.length]);
  const ref = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(1);

  // Scale the ~380 px flower to its box (phones ≈ 1, big desktops up to 2.1).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      setFs(Math.max(0.7, Math.min(2.1, Math.min(r.width / 390, r.height / 430))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const open = phase === "open";
  return (
    <div
      ref={ref}
      className={`rb-rose is-${phase}${still ? " is-still" : ""}${className ? ` ${className}` : ""}`}
      style={{
        ...style,
        ["--fs" as string]: fs,
        ["--warm" as string]: warm.toFixed(3),
        ["--deep" as string]: shade.deep,
        ["--base" as string]: shade.base,
        ["--light" as string]: shade.light,
        ["--glow" as string]: shade.glow,
      }}
    >
      <span className="rb-roseGlow" aria-hidden />
      <span className="rb-stem" aria-hidden />
      <div className="rb-pull">
        <div className="rb-quake">
          <div className="rb-tilt">
            <div className="rb-spin">
              {petals.map((p) => {
                const ph = p.photo >= 0 ? photos[p.photo] : null;
                const vars = {
                  ["--a" as string]: `${p.angle}deg`,
                  ["--r0" as string]: `${p.r0}px`,
                  ["--w" as string]: `${p.w}px`,
                  ["--h" as string]: `${p.h}px`,
                  ["--tc" as string]: p.closed,
                  ["--to" as string]: p.open,
                  ["--d" as string]: `${p.delay}s`,
                } as CSSProperties;
                const pick = open && ph && onPick ? () => onPick(p.photo) : undefined;
                return (
                  <div key={p.key} className={`rb-petal r${p.ring}`} style={vars}>
                    <div
                      className="rb-face rb-front"
                      onClick={pick}
                      role={pick ? "button" : undefined}
                      tabIndex={pick ? 0 : -1}
                      aria-label={pick ? `Open the photo${ph?.caption ? `: ${ph.caption}` : ""}` : undefined}
                      onKeyDown={pick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } } : undefined}
                    >
                      {ph ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ph.url}
                          alt=""
                          draggable={false}
                          decoding="async"
                          style={{ objectPosition: `${ph.cropX ?? 50}% ${ph.cropY ?? 50}%` }}
                        />
                      ) : (
                        <i className="rb-velvetFill" />
                      )}
                      <i className="rb-veil" />
                      <i className="rb-shade" />
                    </div>
                    <div className="rb-face rb-back" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The petal outline (100 × 120): broad, softly notched crown narrowing to the base. Used as a CSS mask. */
export const PETAL_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120' preserveAspectRatio='none'><path d='M50 120 C28 112 4 88 2 56 C0 30 14 8 36 3 C43 1 47 4 50 5 C53 4 57 1 64 3 C86 8 100 30 98 56 C96 88 72 112 50 120 Z' fill='black'/></svg>`,
)}")`;

export const ROSE_CSS = `
.rb-rose { position: relative; width: 100%; height: 100%; display: grid; place-items: center; pointer-events: none;
  perspective: calc(1100px * var(--fs)); perspective-origin: 50% 40%; }
.rb-roseGlow { position: absolute; left: 50%; top: 50%; width: calc(560px * var(--fs)); height: calc(560px * var(--fs)); border-radius: 50%;
  transform: translate(-50%, -50%) scale(calc(.78 + var(--warm) * .25)); opacity: calc(.42 + var(--warm) * .5);
  background: radial-gradient(circle, rgba(var(--glow), .55) 0%, rgba(var(--glow), .18) 34%, rgba(var(--glow), 0) 66%);
  transition: transform 1.2s cubic-bezier(.22,1,.36,1), opacity 1.2s ease; }
.rb-rose.is-open .rb-roseGlow { opacity: .55; transform: translate(-50%, -50%) scale(1.15); transition-duration: 3.2s; }
.rb-stem { position: absolute; left: 50%; top: calc(50% + 60px * var(--fs)); width: 1.25px; height: calc(46% - 60px * var(--fs)); margin-left: -.6px;
  background: linear-gradient(180deg, rgba(227,194,126,.95), rgba(201,164,92,.55) 45%, rgba(201,164,92,0)); box-shadow: 0 0 8px rgba(255,214,150,.55);
  transform-origin: 50% 0; animation: rb-stem 1.8s cubic-bezier(.22,1,.36,1) .3s backwards; transition: opacity 1.2s ease, transform 1.6s cubic-bezier(.22,1,.36,1); }
.rb-rose.is-open .rb-stem { opacity: 0; transform: scaleY(.4); }
@keyframes rb-stem { from { transform: scaleY(0); } }
.rb-pull { position: relative; width: 0; height: 0; transform-style: preserve-3d;
  transform: translateY(calc(70px * var(--fs))) scale(calc(var(--fs) * (1.18 + var(--warm) * .06)));
  transition: transform .5s cubic-bezier(.22,1,.36,1); }
.rb-rose.is-open .rb-pull { transform: translateY(calc(12px * var(--fs))) scale(calc(var(--fs) * .96)); transition: transform 7.5s cubic-bezier(.16,1,.3,1) .2s; }
.rb-quake { transform-style: preserve-3d; }
.rb-rose.is-rising .rb-quake { animation: rb-quake .11s linear infinite; }
.rb-tilt { transform-style: preserve-3d; transform: rotateX(68deg); transition: transform 3.6s cubic-bezier(.22,1,.36,1) .1s; }
.rb-rose.is-open .rb-tilt { transform: rotateX(30deg); }
.rb-spin { transform-style: preserve-3d; }
.rb-rose.is-open:not(.is-still) .rb-spin { animation: rb-spin 90s linear infinite; }
.rb-petal { position: absolute; left: calc(var(--w) / -2); top: calc(var(--h) * -1); width: var(--w); height: var(--h);
  transform-style: preserve-3d; transform-origin: 50% 100%;
  transform: rotateZ(var(--a)) translateY(calc(var(--r0) * -1)) rotateX(calc((var(--tc) + var(--warm) * 9) * 1deg)) scaleX(calc(.6 + var(--warm) * .08));
  transition: transform .35s cubic-bezier(.22,1,.36,1); }
.rb-rose.is-open .rb-petal { transform: rotateZ(var(--a)) translateY(calc(var(--r0) * -1)) rotateX(calc(var(--to) * 1deg)) scaleX(1);
  transition: transform 3.1s cubic-bezier(.2,.9,.25,1) var(--d); }
.rb-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; overflow: hidden;
  -webkit-mask: ${PETAL_MASK} center / 100% 100% no-repeat; mask: ${PETAL_MASK} center / 100% 100% no-repeat; }
.rb-front img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: contrast(1.06) saturate(.88) sepia(.1) brightness(.98); }
.rb-velvetFill, .rb-veil, .rb-back { background:
  radial-gradient(120% 70% at 50% 6%, var(--light) 0%, transparent 46%),
  radial-gradient(90% 90% at 50% 100%, var(--deep) 0%, transparent 70%),
  linear-gradient(180deg, var(--base), var(--deep)); }
.rb-velvetFill, .rb-veil, .rb-shade { position: absolute; inset: 0; }
.rb-veil { opacity: 1; transition: opacity 2.4s ease calc(var(--d) + .7s); }
.rb-rose.is-open .rb-veil { opacity: 0; }
.rb-shade { background:
  radial-gradient(130% 80% at 50% 0%, rgba(255,240,235,.18) 0%, transparent 32%),
  radial-gradient(70% 38% at 50% 104%, var(--deep) 0%, transparent 100%),
  radial-gradient(150% 120% at 50% 40%, transparent 66%, rgba(20,2,6,.45) 100%);
  mix-blend-mode: multiply; opacity: .85; }
.rb-front::after { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0; mix-blend-mode: screen;
  background: radial-gradient(140% 110% at 50% 50%, transparent 62%, rgba(var(--glow), .5) 100%); transition: opacity 2.4s ease calc(var(--d) + 1.4s); }
.rb-rose.is-open .rb-front::after { opacity: 1; }
.rb-back { transform: rotateY(180deg); }
.rb-back::after { content: ""; position: absolute; inset: 0;
  background: repeating-linear-gradient(92deg, rgba(0,0,0,.0) 0 7px, rgba(0,0,0,.08) 8px, rgba(0,0,0,0) 10px),
    radial-gradient(80% 40% at 50% 100%, rgba(0,0,0,.45), transparent 70%); }
.rb-petal.r0 .rb-front { background: linear-gradient(180deg, var(--light), var(--base)); }
.rb-rose.is-open .rb-front[role=button] { pointer-events: auto; cursor: pointer; }
@keyframes rb-quake { 0% { transform: translate(0,0); } 25% { transform: translate(.8px,-.6px); } 50% { transform: translate(-.7px,.5px); } 75% { transform: translate(.5px,.8px); } }
@keyframes rb-spin { to { transform: rotateZ(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .rb-petal, .rb-rose.is-open .rb-petal, .rb-tilt, .rb-pull, .rb-rose.is-open .rb-pull { transition-duration: .01s !important; transition-delay: 0s !important; }
  .rb-veil { transition: opacity .6s ease; }
  .rb-rose.is-rising .rb-quake { animation: none; }
}
`;
