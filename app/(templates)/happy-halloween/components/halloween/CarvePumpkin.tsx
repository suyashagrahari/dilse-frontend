"use client";

// Room 3 — Carve the Pumpkin (the wow). A new kit-level piece for this day.
//
// A plump pumpkin with four pre-scored shapes (two eyes, a nose, a grin).
// Trace a dotted outline with a finger — every bit of the outline you pass
// near gets a glowing cut mark — and at ~70% the piece pops out and falls.
// Tapping a shape twice cuts it too (about a quarter of people never think
// to "draw", per the Halloween Artist write-up), keyboard users get each
// shape as a button, and "Carve it for me" does the lot. When all four are
// out, the candle lights inside (a two-layer flicker: a steady glow plus a
// brighter copy whose opacity jitters slowly — never a flash), then the
// pumpkin turns around to show their word carved through the back, glowing.
//
// SVG rather than the canvas `source-out` trick from the reference: the
// holes are just the cut paths filled with a light gradient, which stays
// crisp at any size and needs no pixel reads. Reduced motion: no falling
// pieces, no flip animation (it still turns, instantly), a slow 0.9↔1 glow.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS, VW } from "../../../_valentine/theme";
import { HW_DISPLAY } from "./fonts";
import { Btn, GhostBtn, Hint, HW, RoomTitle, SkipChip } from "./ui";

const PIECES = [
  { id: "left eye", d: "M88 132 L124 94 L138 142 Z" },
  { id: "right eye", d: "M212 132 L176 94 L162 142 Z" },
  { id: "nose", d: "M150 150 L164 176 L136 176 Z" },
  { id: "grin", d: "M82 192 Q150 256 218 192 L204 195 L193 212 L178 202 L165 218 L150 206 L135 218 L122 202 L107 212 L96 195 Z" },
] as const;
const SAMPLES = [26, 26, 18, 56];
const REACH = 15;
const NEED = 0.72;

const CSS = `
.hw-ants { stroke-dasharray: 7 7; animation: hw-ants 1.2s linear infinite; }
@keyframes hw-ants { to { stroke-dashoffset: -28; } }
.hw-glow-slow { animation: hw-glow 2.4s ease-in-out infinite; }
@keyframes hw-glow { 0%,100% { opacity: .9 } 50% { opacity: 1 } }
.hw-piece:focus-visible { outline: none; }
.hw-piece:focus-visible + .hw-focus { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .hw-ants, .hw-glow-slow { animation: none; } }
`;

function sampleOutlines(): { x: number; y: number }[][] {
  if (typeof document === "undefined") return PIECES.map(() => []);
  return PIECES.map((pc, i) => {
    try {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", pc.d);
      const len = p.getTotalLength();
      return Array.from({ length: SAMPLES[i] }, (_, k) => {
        const pt = p.getPointAtLength((k / SAMPLES[i]) * len);
        return { x: pt.x, y: pt.y };
      });
    } catch {
      return [];
    }
  });
}

/** The two-image candle flicker: jitters a layer's opacity a few times a second. */
function useFlicker(on: boolean, reduced: boolean) {
  const ref = useRef<SVGGElement | null>(null);
  useEffect(() => {
    if (!on || reduced) return;
    let t = 0;
    const step = () => {
      if (ref.current) ref.current.style.opacity = String(0.55 + Math.random() * 0.45);
      t = window.setTimeout(step, 110 + Math.random() * 170);
    };
    step();
    return () => window.clearTimeout(t);
  }, [on, reduced]);
  return ref;
}

function Body({ back }: { back?: boolean }) {
  return (
    <>
      <defs>
        <radialGradient id={back ? "hw-pk-b" : "hw-pk-f"} cx="42%" cy="34%" r="75%">
          <stop offset="0" stopColor="#FFB067" />
          <stop offset=".55" stopColor="#FF8A3D" />
          <stop offset="1" stopColor="#D9621F" />
        </radialGradient>
      </defs>
      <path d="M150 52 C146 34 150 22 162 14" stroke="#4E8F62" strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M156 30 C176 18 192 26 196 40" stroke="#6FBF8E" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="96" cy="164" rx="66" ry="108" fill="#D9621F" />
      <ellipse cx="204" cy="164" rx="66" ry="108" fill="#D9621F" />
      <ellipse cx="150" cy="164" rx="122" ry="110" fill={`url(#${back ? "hw-pk-b" : "hw-pk-f"})`} />
      <ellipse cx="112" cy="164" rx="58" ry="106" fill="none" stroke="rgba(150,60,10,.35)" strokeWidth="3" />
      <ellipse cx="188" cy="164" rx="58" ry="106" fill="none" stroke="rgba(150,60,10,.35)" strokeWidth="3" />
      <ellipse cx="104" cy="104" rx="16" ry="30" fill="#FFD2A0" opacity=".35" transform="rotate(18 104 104)" />
    </>
  );
}

export default function CarvePumpkin({ word, onNext }: { word: string; onNext: () => void }) {
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  // Points along each outline, from the path data itself (a detached SVG
  // path measures without being rendered), so tracing needs no DOM reads.
  const [samples] = useState<{ x: number; y: number }[][]>(sampleOutlines);
  const [marked, setMarked] = useState<boolean[][]>(() => SAMPLES.map((n) => Array(n).fill(false)));
  const [cut, setCut] = useState<boolean[]>(() => PIECES.map(() => false));
  const taps = useRef<number[]>(PIECES.map(() => 0));
  const drawing = useRef(false);
  const downAt = useRef<{ x: number; y: number } | null>(null);
  const [lit, setLit] = useState(false);
  const [back, setBack] = useState(false);
  const [touched, setTouched] = useState(false);
  const allCut = cut.every(Boolean);
  const flickerF = useFlicker(lit, reduced);
  const flickerB = useFlicker(lit, reduced);

  const doCut = useCallback((i: number) => {
    setCut((c) => {
      if (c[i]) return c;
      const n = c.slice();
      n[i] = true;
      return n;
    });
    haptic(20);
  }, []);

  // All out → light the candle → turn the pumpkin around.
  useEffect(() => {
    if (!allCut || lit) return;
    const t = window.setTimeout(() => {
      setLit(true);
      haptic([15, 50, 25]);
      burst({ kind: "sparkles", emojis: ["✨", "🕯️", "⭐", "✨"], origin: { x: 0.5, y: 0.42 }, count: 22 });
    }, reduced ? 100 : 650);
    return () => window.clearTimeout(t);
  }, [allCut, lit, reduced]);
  useEffect(() => {
    if (!lit) return;
    const t = window.setTimeout(() => setBack(true), reduced ? 900 : 1700);
    return () => window.clearTimeout(t);
  }, [lit, reduced]);

  const toSvg = (cx: number, cy: number) => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = new DOMPoint(cx, cy).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const trace = (cx: number, cy: number) => {
    const p = toSvg(cx, cy);
    if (!p) return;
    setMarked((prev) => {
      let changed = false;
      const next = prev.map((row, i) => {
        if (cut[i]) return row;
        const pts = samples[i] ?? [];
        let r = row;
        pts.forEach((s, k) => {
          if (!r[k] && Math.hypot(s.x - p.x, s.y - p.y) < REACH) {
            if (r === row) r = row.slice();
            r[k] = true;
            changed = true;
          }
        });
        return r;
      });
      if (!changed) return prev;
      next.forEach((row, i) => {
        if (!cut[i] && row.filter(Boolean).length / row.length >= NEED) window.setTimeout(() => doCut(i), 0);
      });
      return next;
    });
  };

  const tapAt = (cx: number, cy: number) => {
    const p = toSvg(cx, cy);
    if (!p) return;
    PIECES.forEach((_, i) => {
      if (cut[i]) return;
      const el = pathRefs.current[i];
      let hit = false;
      try {
        hit = !!el && el.isPointInFill(new DOMPoint(p.x, p.y));
      } catch {
        hit = false;
      }
      if (!hit) hit = (samples[i] ?? []).some((s) => Math.hypot(s.x - p.x, s.y - p.y) < 20);
      if (!hit) return;
      taps.current[i] += 1;
      haptic(10);
      if (taps.current[i] >= 2) doCut(i);
      else setMarked((prev) => prev.map((row, j) => (j === i ? row.map((v, k) => v || k % 2 === 0) : row)));
    });
  };

  const carveAll = () => {
    setTouched(true);
    PIECES.forEach((_, i) => window.setTimeout(() => doCut(i), reduced ? 0 : i * 260));
  };

  const fontSize = useMemo(() => {
    const n = word.length;
    return n <= 3 ? 82 : n <= 5 ? 62 : n <= 7 ? 48 : 40;
  }, [word]);

  return (
    <>
      <style>{CSS}</style>
      <RoomTitle
        kicker="Room 3 · the kitchen"
        title="Carve the pumpkin"
        sub={!allCut ? "Trace the dotted lines with your finger to cut out the face." : lit ? (back ? "Look what's carved on the back 🕯️" : "It's alive! 🕯️") : "Lighting the candle…"}
      />

      <div style={{ position: "relative", width: "min(82vw, calc(300px * var(--vw-s, 1)))", aspectRatio: "300 / 300", perspective: 1000 }}>
        {/* glow on the table */}
        <div aria-hidden style={{ position: "absolute", left: "-10%", right: "-10%", bottom: "-6%", height: "26%", borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,190,90,.55), transparent)", opacity: lit ? 1 : 0, transition: "opacity 1s" }} />
        <motion.div
          animate={{ rotateY: back ? 180 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 1.1, ease: [0.3, 0.7, 0.2, 1] }}
          style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}
        >
          {/* FRONT — the face you carve */}
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
            <svg
              ref={svgRef}
              viewBox="0 0 300 290"
              width="100%"
              height="100%"
              role="group"
              aria-label="A pumpkin to carve"
              style={{ display: "block", overflow: "visible", touchAction: allCut ? "auto" : "none", cursor: allCut ? "default" : "crosshair", filter: lit ? "drop-shadow(0 0 26px rgba(255,170,70,.55))" : "drop-shadow(0 18px 24px rgba(0,0,0,.45))", transition: "filter 1s" }}
              onPointerDown={(e) => {
                if (allCut) return;
                setTouched(true);
                drawing.current = true;
                downAt.current = { x: e.clientX, y: e.clientY };
                (e.currentTarget as SVGSVGElement).setPointerCapture?.(e.pointerId);
                trace(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => drawing.current && trace(e.clientX, e.clientY)}
              onPointerUp={(e) => {
                drawing.current = false;
                const d = downAt.current;
                downAt.current = null;
                if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8) tapAt(e.clientX, e.clientY);
              }}
              onPointerCancel={() => {
                drawing.current = false;
                downAt.current = null;
              }}
            >
              <defs>
                <radialGradient id="hw-hole-lit" cx="50%" cy="50%" r="65%">
                  <stop offset="0" stopColor="#FFF6C8" />
                  <stop offset=".55" stopColor="#FFD27A" />
                  <stop offset="1" stopColor="#FF9A3D" />
                </radialGradient>
              </defs>
              <Body />
              {PIECES.map((pc, i) => (
                <g key={pc.id}>
                  {/* the hole (dark until the candle lights) */}
                  <path d={pc.d} fill={cut[i] ? (lit ? "url(#hw-hole-lit)" : "#3A1A08") : "transparent"} style={{ transition: "fill .8s" }} />
                  {/* the scored outline */}
                  {!cut[i] && (
                    <>
                      <path
                        ref={(el) => {
                          pathRefs.current[i] = el;
                        }}
                        className={`hw-piece${reduced ? "" : " hw-ants"}`}
                        d={pc.d}
                        fill="rgba(255,255,255,0.001)"
                        stroke="#FFE7B8"
                        strokeOpacity=".9"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeDasharray={reduced ? "7 7" : undefined}
                        tabIndex={0}
                        role="button"
                        aria-label={`Carve the ${pc.id}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setTouched(true);
                            doCut(i);
                          }
                        }}
                      />
                      <path className="hw-focus" d={pc.d} fill="none" stroke="#9BE7C4" strokeWidth="5" opacity="0" pointerEvents="none" />
                      {(samples[i] ?? []).map((s, k) =>
                        marked[i]?.[k] ? <circle key={k} cx={s.x} cy={s.y} r="3.2" fill="#FFF1B8" style={{ filter: "drop-shadow(0 0 3px #FFB347)" }} pointerEvents="none" /> : null,
                      )}
                    </>
                  )}
                  {/* the piece that falls out */}
                  <AnimatePresence>
                    {cut[i] && !reduced && (
                      <motion.path
                        key="fall"
                        d={pc.d}
                        fill="#FF8A3D"
                        stroke="#FFB067"
                        strokeWidth="3"
                        initial={{ y: 0, rotate: 0, opacity: 1 }}
                        animate={{ y: 150, rotate: i % 2 ? 50 : -50, opacity: 0 }}
                        transition={{ duration: 0.9, ease: [0.5, 0, 0.8, 0.6] }}
                        style={{ transformBox: "fill-box", transformOrigin: "center" }}
                        pointerEvents="none"
                      />
                    )}
                  </AnimatePresence>
                </g>
              ))}
              {/* the candle's brighter copy, flickering */}
              {lit && (
                <g ref={flickerF} className={reduced ? "hw-glow-slow" : undefined} pointerEvents="none" style={{ mixBlendMode: "screen" }}>
                  {PIECES.map((pc) => (
                    <path key={pc.id} d={pc.d} fill="#FFF7D6" style={{ filter: "blur(3px)" }} />
                  ))}
                </g>
              )}
            </svg>
          </div>

          {/* BACK — the word, carved through, glowing */}
          <div style={{ position: "absolute", inset: 0, transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }} aria-hidden={!back}>
            <svg viewBox="0 0 300 290" width="100%" height="100%" style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 0 30px rgba(255,170,70,.6))" }} role="img" aria-label={`The pumpkin's back, carved with “${word}”`}>
              <defs>
                <linearGradient id="hw-word" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FFF6C8" />
                  <stop offset="1" stopColor="#FFB347" />
                </linearGradient>
              </defs>
              <Body back />
              <text
                x="150"
                y="168"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontFamily: HW_DISPLAY }}
                fontSize={fontSize}
                fill="url(#hw-word)"
                stroke="#7A3410"
                strokeWidth="4"
                paintOrder="stroke"
                letterSpacing="2"
                {...(word.length > 7 ? { textLength: 220, lengthAdjust: "spacingAndGlyphs" as const } : {})}
              >
                {word}
              </text>
              <g ref={flickerB} className={reduced ? "hw-glow-slow" : undefined} style={{ mixBlendMode: "screen" }}>
                <text x="150" y="168" textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fill="#FFF7D6" letterSpacing="2" style={{ fontFamily: HW_DISPLAY, filter: "blur(4px)" }} {...(word.length > 7 ? { textLength: 220, lengthAdjust: "spacingAndGlyphs" as const } : {})}>
                  {word}
                </text>
              </g>
            </svg>
          </div>
        </motion.div>
      </div>

      {!allCut && (
        <>
          <div aria-hidden style={{ display: "flex", gap: 8 }}>
            {cut.map((c, i) => (
              <span key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c ? HW.candle : "rgba(247,243,255,.2)", boxShadow: c ? "0 0 8px #FFB347" : undefined }} />
            ))}
          </div>
          <Hint>{touched ? "Keep tracing… or tap a shape twice ✂️" : "Trace the dotted lines ✂️ (or tap a shape twice)"}</Hint>
          <SkipChip onClick={carveAll}>Carve it for me</SkipChip>
        </>
      )}
      {lit && (
        <motion.div initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 1.2 }} style={{ display: "grid", gap: 10, justifyItems: "center" }}>
          {back && <p style={{ margin: 0, font: `500 15px ${FONTS.ui}`, color: VW.inkSoft }}>Carved just for you, by candlelight.</p>}
          <GhostBtn onClick={() => setBack((b) => !b)}>{back ? "↺ See its face" : "↻ Turn it around"}</GhostBtn>
          <Btn onClick={onNext}>Into the hallway →</Btn>
        </motion.div>
      )}
    </>
  );
}
