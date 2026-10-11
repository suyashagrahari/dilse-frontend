"use client";

// Scene 3 — The rangoli. A chalk outline waits on the floor: four rings of
// petals, drops and curls around an empty centre. Pick a powder colour and tap
// a ring — the whole ring fills, petal by petal, like powder poured from the
// fingertips (the palette moves on to the next colour by itself, so four plain
// taps finish it). When every ring has colour, the centre turns gold with
// their initials (or a heart), and the owner's blooming-rangoli GIF opens up
// over the drawing as the finale.

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { DW_DISPLAY } from "./fonts";
import { DW_GIF, preload, useDw, useNext } from "./stage";
import { DW, RANGOLI_COLORS, SceneTitle } from "./ui";

const CSS = `
.dw-rg-box { position: relative; width: min(100cqw, calc(100cqh - 64px), 420px); aspect-ratio: 1; }
.dw-rg-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; transition: opacity .9s ease, transform 1.2s cubic-bezier(.2,.8,.2,1); }
.dw-rg-svg.is-done { animation: dw-rg-turn 40s linear infinite; }
@keyframes dw-rg-turn { to { transform: rotate(360deg) } }
.dw-rg-p { transition: fill .45s ease, stroke .45s ease, transform .45s cubic-bezier(.3,1.6,.5,1); transform-box: fill-box; transform-origin: 50% 50%; }
.dw-rg-p.is-on { animation: dw-pop .5s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes dw-pop { 0% { transform: scale(.4) } 100% { transform: scale(1) } }
.dw-rg-hit { cursor: pointer; }
.dw-rg-hit:focus-visible { outline: none; stroke: rgba(46,196,182,.6) !important; }
.dw-rg-gif { position: absolute; inset: -6%; display: grid; place-items: center; pointer-events: none; }
.dw-rg-gif img { width: 100%; height: 100%; object-fit: contain; }
.dw-rg-mid { position: absolute; left: 39.5%; top: 39.5%; width: 21%; aspect-ratio: 1; border-radius: 50%; display: grid; place-items: center;
  font: 400 clamp(14px, 4.4cqmin, 26px)/1 ${DW_DISPLAY}; color: #3A1606; letter-spacing: .02em; pointer-events: none;
  background: radial-gradient(circle at 40% 35%, #FFF3C4, #FFD36E 55%, #E9A23A); box-shadow: 0 0 0 3px #FFF6E3, 0 0 28px 6px rgba(255,200,90,.75); }
.dw-palette { display: flex; gap: 10px; justify-content: center; flex: none; }
.dw-swatch { width: 38px; height: 38px; border-radius: 50%; border: 3px solid rgba(255,246,227,.18); padding: 0; cursor: pointer; touch-action: manipulation;
  box-shadow: inset 0 -4px 0 rgba(0,0,0,.18), 0 4px 10px -4px rgba(0,0,0,.6); transition: transform .2s, border-color .2s; }
.dw-swatch.is-on { border-color: #FFF6E3; transform: translateY(-4px) scale(1.08); }
.dw-swatch:focus-visible { outline: 3px solid #2EC4B6; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .dw-rg-svg.is-done, .dw-rg-p.is-on { animation: none; } }
`;

type Ring = { id: number; r: number; count: number; shape: (k: number) => string; hit: number };

const petal = (len: number, wid: number) => `M0 0 C ${wid} ${-len * 0.35} ${wid * 0.7} ${-len * 0.85} 0 ${-len} C ${-wid * 0.7} ${-len * 0.85} ${-wid} ${-len * 0.35} 0 0 Z`;

/** Four rings, inside out. Each `shape` is drawn at the origin pointing up, then rotated/translated into place. */
const RINGS: Ring[] = [
  { id: 0, r: 14, count: 8, shape: () => petal(26, 12), hit: 28 },
  { id: 1, r: 40, count: 8, shape: () => petal(30, 17), hit: 30 },
  { id: 2, r: 74, count: 16, shape: () => "M0 -8 C 6 -2 6 6 0 8 C -6 6 -6 -2 0 -8 Z", hit: 20 },
  { id: 3, r: 84, count: 8, shape: () => "M -12 0 C -12 -14 12 -14 12 0 C 6 -6 -6 -6 -12 0 Z", hit: 16 },
];

export default function Rangoli({ initials, sticker, onNext }: { initials: string; sticker: ReactNode; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue, round } = useDw();
  const [fills, setFills] = useState<(string | null)[]>(() => RINGS.map(() => null));
  const [pick, setPick] = useState(0);
  const done = fills.every(Boolean);
  const [bloom, setBloom] = useState(false);

  useEffect(() => {
    preload(DW_GIF.rangoli);
    const t = window.setTimeout(() => preload(DW_GIF.wand), 1500);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => {
      setBloom(true);
      cue("chime-cascade", { gain: 0.55 });
      if (!reduced) burst({ kind: "confetti", colors: RANGOLI_COLORS, origin: { x: 0.5, y: 0.45 }, count: 50 });
    }, reduced ? 0 : 900);
    return () => window.clearTimeout(t);
  }, [done, cue, reduced]);

  const fill = (ring: number) => {
    if (fills[ring]) return;
    const color = RANGOLI_COLORS[pick];
    haptic(12);
    cue("pop", { gain: 0.5, detune: ring * 150 });
    const nf = fills.slice();
    nf[ring] = color;
    setFills(nf);
    // Move the palette on to a colour no ring has yet (so plain taps make a colourful rangoli).
    const used = new Set(nf.filter(Boolean));
    for (let k = 1; k <= RANGOLI_COLORS.length; k++) {
      const c = (pick + k) % RANGOLI_COLORS.length;
      if (!used.has(RANGOLI_COLORS[c])) {
        setPick(c);
        break;
      }
    }
  };

  useNext(bloom ? "Grab a sparkler" : null, onNext, "sparkle");

  const mid = initials || "♥";

  return (
    <>
      <style>{CSS}</style>
      <SceneTitle kicker="Your rangoli" title={done ? "Beautiful. Just like you" : "Colour it in"} sub={done ? undefined : "Pick a colour, then tap a ring of the rangoli."} />
      <div className="dw-fill">
        <div className="dw-rg-box">
          <svg viewBox="-100 -100 200 200" className={`dw-rg-svg${bloom ? " is-done" : ""}`} style={bloom ? { opacity: 0.35, transform: "scale(.92)" } : undefined} role="group" aria-label="Rangoli">
            {/* chalk guide circles */}
            <circle r="96" fill="none" stroke="rgba(255,246,227,.18)" strokeWidth="1" strokeDasharray="2 5" />
            <circle r="60" fill="none" stroke="rgba(255,246,227,.14)" strokeWidth="1" strokeDasharray="2 5" />
            {RINGS.map((ring) => {
              const c = fills[ring.id];
              return (
                <g key={ring.id} onClick={c ? undefined : () => fill(ring.id)} style={c ? undefined : { cursor: "pointer" }}>
                  {Array.from({ length: ring.count }, (_, k) => {
                    const a = (360 / ring.count) * k + (ring.id % 2 ? 360 / ring.count / 2 : 0);
                    return (
                      <g key={k} transform={`rotate(${a}) translate(0 ${-ring.r})`}>
                        <path
                          className={`dw-rg-p${c ? " is-on" : ""}`}
                          d={ring.shape(k)}
                          fill={c ?? "rgba(255,246,227,.05)"}
                          stroke={c ? "rgba(255,246,227,.85)" : "rgba(255,246,227,.55)"}
                          strokeWidth={c ? 1.2 : 1.1}
                          strokeDasharray={c ? undefined : "2.5 3"}
                          style={c && !reduced ? { animationDelay: `${k * 40}ms` } : undefined}
                        />
                      </g>
                    );
                  })}
                  {/* the ring's tap target: a fat invisible annulus */}
                  {!c && (
                    <circle
                      className="dw-rg-hit"
                      r={ring.id === 0 ? 26 : ring.id === 1 ? 56 : ring.id === 2 ? 74 : 90}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={ring.hit}
                      pointerEvents="stroke"
                      role="button"
                      tabIndex={0}
                      aria-label={`Colour ring ${ring.id + 1}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          fill(ring.id);
                        }
                      }}
                    />
                  )}
                </g>
              );
            })}
          </svg>
          <AnimatePresence>
            {bloom && (
              <motion.div
                className="dw-rg-gif"
                initial={reduced ? false : { opacity: 0, scale: 0.3, rotate: -40 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${DW_GIF.rangoli}?play=${round}`} alt="" width={280} height={276} decoding="async" draggable={false} />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {done && (
              <motion.span className="dw-rg-mid" initial={reduced ? false : { opacity: 0, scale: 0.2 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: reduced ? 0 : 0.5, type: "spring", stiffness: 260, damping: 14 }} aria-label={`Initials: ${mid}`}>
                {mid}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div style={{ flex: "none", minHeight: 52, display: "grid", placeItems: "center" }}>
        {done ? (
          <motion.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 1 }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 48, height: 48, display: "grid", placeItems: "center", flex: "none" }}>{sticker}</span>
            <p style={{ margin: 0, font: `600 clamp(13px, 2dvh, 15px)/1.3 ${FONTS.ui}`, color: DW.cream, textAlign: "left", maxWidth: 240 }}>Your first rangoli of the year, and it&apos;s perfect.</p>
          </motion.div>
        ) : (
          <div className="dw-palette" role="radiogroup" aria-label="Powder colour">
            {RANGOLI_COLORS.map((c, k) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={pick === k}
                aria-label={["Marigold", "Rani pink", "Peacock teal", "Violet", "Haldi yellow"][k]}
                className={`dw-swatch${pick === k ? " is-on" : ""}`}
                style={{ background: c }}
                onClick={() => {
                  haptic(6);
                  setPick(k);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
