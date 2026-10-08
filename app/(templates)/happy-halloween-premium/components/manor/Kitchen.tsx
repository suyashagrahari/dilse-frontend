"use client";

// Room 7 — The witch's kitchen (mini-game B). Three glowing sigils float over
// the cauldron — ♥ heart, ☾ moon, ★ star. Trace each with a finger along its
// dotted guide (generous: 60% of the path counts; "Cast it for me" or a double
// tap also works). Each one drops into the brew with a bubble and a sparkle,
// changes its colour, and rises as a bubble carrying one ingredient. Then
// hold to stir: the cauldron erupts in green-gold smoke that condenses into a
// crystal ball showing the prophecy.

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { sfx } from "../../../_valentine/kit/premium";
import { haptic, useHoldProgress, useReducedMotion } from "../../../_valentine/kit";
import { Cauldron } from "./art";
import { BOOK, ENGRAVED } from "./fonts";
import type { Manor } from "./model";
import { Gilded, Hint, Kicker, Quiet, Room, RoomTitle } from "./ui";

const SIGILS = [
  { name: "heart", glyph: "♥", d: "M100 162 C52 128 30 98 42 70 C54 44 88 44 100 72 C112 44 146 44 158 70 C170 98 148 128 100 162 Z", brew: "#FF8FB1" },
  { name: "moon", glyph: "☾", d: "M118 36 C78 40 52 72 54 106 C56 142 88 168 124 164 C96 152 80 128 82 100 C84 72 100 48 118 36 Z", brew: "#B79CFF" },
  { name: "star", glyph: "★", d: "M100 30 L117 78 L168 80 L128 110 L142 160 L100 131 L58 160 L72 110 L32 80 L83 78 Z", brew: "#FFC86B" },
] as const;
const N = 48;

export default function Kitchen({ m, sticker, onNext }: { m: Manor; sticker: ReactNode; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [k, setK] = useState(0); // sigils cast
  const [covered, setCovered] = useState<boolean[]>(() => Array(N).fill(false));
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const [dropping, setDropping] = useState(false);
  const [erupted, setErupted] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pts = useRef<{ x: number; y: number }[]>([]);
  const lastTap = useRef(0);
  const drawing = useRef(false);
  const sig = SIGILS[Math.min(k, 2)];
  const allCast = k >= 3;

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    pts.current = Array.from({ length: N }, (_, i) => {
      const q = el.getPointAtLength((i / N) * len);
      return { x: q.x, y: q.y };
    });
    setCovered(Array(N).fill(false));
    setTrail([]);
  }, [k]);

  // A soft bubbling under the whole room.
  useEffect(() => {
    if (erupted) return;
    const t = window.setInterval(() => sfx("bubble", { gain: 0.25, detune: Math.random() * 400 - 200 }), 1600);
    return () => window.clearInterval(t);
  }, [erupted]);

  const casting = useRef(false);
  const cast = () => {
    if (casting.current || allCast) return;
    casting.current = true;
    drawing.current = false;
    setDropping(true);
    haptic([10, 30, 14]);
    sfx("sparkle", { gain: 0.8 });
    sfx("bubble", { count: 4, at: 0.45 });
    window.setTimeout(() => {
      setDropping(false);
      setK((v) => v + 1);
      casting.current = false;
    }, reduce ? 250 : 900);
  };

  const toSvg = (e: React.PointerEvent) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return null;
    return { x: ((e.clientX - r.left) / r.width) * 200, y: ((e.clientY - r.top) / r.height) * 200 };
  };
  const covRef = useRef<boolean[]>(covered);
  covRef.current = covered;
  const mark = (pt: { x: number; y: number }) => {
    let changed = false;
    const next = covRef.current.map((v, i) => {
      if (v) return v;
      const q = pts.current[i];
      if (q && Math.hypot(q.x - pt.x, q.y - pt.y) < 22) {
        changed = true;
        return true;
      }
      return v;
    });
    if (!changed) return;
    covRef.current = next;
    setCovered(next);
    if (next.filter(Boolean).length / N >= 0.6) cast();
  };
  const onDown = (e: React.PointerEvent) => {
    if (allCast || dropping) return;
    const now = performance.now();
    if (now - lastTap.current < 320) {
      cast();
      return;
    }
    lastTap.current = now;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drawing.current = true;
    const pt = toSvg(e);
    if (pt) {
      setTrail([pt]);
      mark(pt);
    }
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const pt = toSvg(e);
    if (!pt) return;
    setTrail((t) => [...t.slice(-80), pt]);
    mark(pt);
  };
  const onUp = () => {
    drawing.current = false;
  };

  const hold = useHoldProgress({
    duration: 2400,
    disabled: !allCast || erupted,
    onComplete: () => {
      setErupted(true);
      sfx("flame-whoosh", { gain: 0.9 });
      sfx("sparkle", { at: 0.2 });
      sfx("organ-chord", { chord: "major", at: 0.5, dur: 2, gain: 0.8 });
    },
  });
  const stirTick = useRef(0);
  useEffect(() => {
    if (!hold.holding) return;
    const t = window.setInterval(() => {
      stirTick.current += 1;
      sfx("bubble", { count: 2, gain: 0.5, detune: stirTick.current * 60 });
    }, 380);
    return () => window.clearInterval(t);
  }, [hold.holding]);

  const brew = k === 0 ? "#7FF5D8" : SIGILS[Math.min(k, 3) - 1].brew;
  const cov = covered.filter(Boolean).length / N;
  const trailD = useMemo(() => (trail.length ? `M${trail.map((t) => `${t.x.toFixed(1)} ${t.y.toFixed(1)}`).join(" L")}` : ""), [trail]);

  return (
    <Room label="The witch's kitchen" className="mm-kitchen">
      <Kicker>The witch's kitchen</Kicker>
      <RoomTitle>{erupted ? "The crystal ball shows…" : allCast ? "Stir the spell" : "Cast the spell"}</RoomTitle>

      <div className="mm-brewStage" style={{ ["--mm-brew" as string]: brew }}>
        {!erupted && !allCast && (
          <svg
            ref={svgRef}
            viewBox="0 0 200 200"
            className={`mm-sigil${dropping ? " is-drop" : ""}`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            role="img"
            aria-label={`Trace the ${sig.name} sigil`}
          >
            <path ref={pathRef} d={sig.d} fill="none" stroke="rgba(255,240,200,.18)" strokeWidth="26" strokeLinejoin="round" />
            <path d={sig.d} fill="none" stroke="#FFF1BF" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" opacity=".85" />
            {pts.current.map((q, i) => (covered[i] ? <circle key={i} cx={q.x} cy={q.y} r="5" fill="#FFE6A0" opacity=".95" /> : null))}
            {trailD && <path d={trailD} fill="none" stroke="#FFF7DA" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="mm-trail" />}
          </svg>
        )}
        {erupted ? (
          <div className="mm-ball">
            <span className="mm-ballSmoke" aria-hidden />
            <span className="mm-ballGlass">
              <span className="mm-ballSwirl" aria-hidden />
              <span className="mm-ballText" style={{ fontFamily: BOOK }}>{m.prophecy}</span>
            </span>
            <span className="mm-ballBase" aria-hidden />
            <span className="mm-ballSticker">{sticker}</span>
          </div>
        ) : (
          <div className={`mm-pot${hold.holding ? " is-stir" : ""}${allCast ? " is-ready" : ""}`}>
            <Cauldron />
            <span className="mm-ladle" aria-hidden style={{ transform: `rotate(${hold.progress * 720 - 20}deg)` }} />
            <span className="mm-steam" aria-hidden />
          </div>
        )}
      </div>

      <ol className="mm-ings">
        {m.ingredients.slice(0, k).map((g, i) => (
          <li key={i} className="mm-ing" style={{ ["--c" as string]: SIGILS[i].brew }}>
            <span className="mm-ingGlyph" aria-hidden>{SIGILS[i].glyph}</span>
            <span>
              <b style={{ fontFamily: ENGRAVED }}>{g.name}</b>
              {g.line && <i style={{ fontFamily: BOOK }}>{g.line}</i>}
            </span>
          </li>
        ))}
      </ol>

      {erupted ? (
        <Gilded big onClick={() => { sfx("bell-toll", { gain: 0.35 }); onNext(); }}>To the clock tower →</Gilded>
      ) : allCast ? (
        <>
          <button type="button" className="mm-stir" {...hold.bind} aria-label="Press and hold to stir the cauldron">
            <span className="mm-stirFill" style={{ transform: `scaleX(${hold.progress})` }} />
            <span className="mm-stirTx">{hold.holding ? "Stirring…" : "Hold to stir"}</span>
          </button>
          <Hint>Hold (or tap five times)</Hint>
        </>
      ) : (
        <>
          <Hint>{cov > 0.05 ? `${Math.round(cov * 100)}% traced` : `Trace the ${sig.name} — sigil ${k + 1} of 3`}</Hint>
          <Quiet onClick={cast}>Cast it for me</Quiet>
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.mm-kitchen { gap: 10px; }
.mm-brewStage { position: relative; width: min(84vw, 320px); display: grid; justify-items: center; }
.mm-sigil { width: min(66vw, 240px); height: auto; aspect-ratio: 1; touch-action: none; cursor: crosshair; margin-bottom: -46px; z-index: 2; position: relative;
  filter: drop-shadow(0 0 12px rgba(255,200,107,.55)); animation: mm-float 3.4s ease-in-out infinite; }
.mm-sigil.is-drop { animation: mm-drop .9s cubic-bezier(.5,0,.8,.4) forwards; pointer-events: none; }
@keyframes mm-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes mm-drop { to { transform: translateY(120px) scale(.2); opacity: 0; } }
.mm-trail { filter: drop-shadow(0 0 6px rgba(255,220,140,.9)); }
.mm-pot { position: relative; width: min(64vw, 240px); aspect-ratio: 240 / 190; z-index: 1; }
.mm-pot .mm-brew { animation: mm-brew 2.4s ease-in-out infinite; transform-origin: 120px 56px; transition: fill 1s; filter: drop-shadow(0 0 14px var(--mm-brew)); }
@keyframes mm-brew { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.18); } }
.mm-ladle { position: absolute; left: 50%; top: 4%; width: 8px; height: 46%; margin-left: -4px; border-radius: 4px; background: linear-gradient(180deg, #8E6A36, #4A2E12); transform-origin: 50% 90%; transition: transform .1s linear; }
.mm-steam { position: absolute; left: 20%; right: 20%; top: -30%; height: 50%; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--mm-brew) 40%, transparent), transparent 70%);
  filter: blur(10px); opacity: .5; animation: mm-steam 3s ease-in-out infinite; pointer-events: none; }
.mm-pot.is-stir .mm-steam { opacity: .95; }
@keyframes mm-steam { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-10px) scale(1.12); } }
.mm-ings { list-style: none; margin: 4px 0 0; padding: 0; display: grid; gap: 8px; width: 100%; max-width: 420px; }
.mm-ing { display: flex; gap: 12px; align-items: center; text-align: left; padding: 10px 14px; border-radius: 999px 18px 18px 999px; animation: mm-rise .9s cubic-bezier(.22,1,.36,1) both;
  background: linear-gradient(90deg, color-mix(in srgb, var(--c) 28%, rgba(11,10,20,.6)), rgba(11,10,20,.55)); border: 1px solid color-mix(in srgb, var(--c) 55%, transparent); }
.mm-ing span:last-child { display: grid; gap: 2px; min-width: 0; }
.mm-ing b { font-size: 13px; letter-spacing: .06em; color: #FFF4DA; }
.mm-ing i { font-size: 15.5px; color: var(--vw-ink-soft); }
.mm-ingGlyph { flex: none; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; font-size: 18px; color: #1C1106; background: var(--c); box-shadow: 0 0 16px var(--c); }
@keyframes mm-rise { from { opacity: 0; transform: translateY(24px) scale(.9); } to { opacity: 1; transform: none; } }
.mm-stir { position: relative; overflow: hidden; min-width: 240px; min-height: 58px; border-radius: 99px; border: 2px solid #E9B95A; cursor: pointer; background: rgba(11,10,20,.6); color: #FFF1BF;
  font: 700 17px/1 var(--vw-font-ui, system-ui), sans-serif; }
.mm-stir:focus-visible { outline: 3px solid var(--vw-gold); outline-offset: 3px; }
.mm-stirFill { position: absolute; inset: 0; transform-origin: 0 50%; background: linear-gradient(90deg, #7FF5D8, #E9B95A); opacity: .55; }
.mm-stirTx { position: relative; }
.mm-ball { position: relative; display: grid; justify-items: center; width: min(76vw, 290px); padding-top: 10px; }
.mm-ballSmoke { position: absolute; inset: -30% -20% 10%; border-radius: 50%; background: radial-gradient(circle, rgba(127,245,216,.55), rgba(233,185,90,.25) 45%, transparent 70%);
  filter: blur(16px); animation: mm-smoke 1.6s ease-out both; pointer-events: none; }
@keyframes mm-smoke { from { transform: scale(.2) translateY(60px); opacity: 0; } 40% { opacity: 1; } to { transform: scale(1); opacity: .7; } }
.mm-ballGlass { position: relative; width: 100%; aspect-ratio: 1; border-radius: 50%; display: grid; place-items: center; overflow: hidden; animation: mm-ballIn 1.4s .5s cubic-bezier(.22,1,.36,1) both;
  background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.55), rgba(183,156,255,.35) 25%, rgba(42,35,80,.85) 70%, rgba(11,10,20,.95));
  box-shadow: 0 0 60px rgba(183,156,255,.45), inset 0 0 40px rgba(127,245,216,.35); }
@keyframes mm-ballIn { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: none; } }
.mm-ballSwirl { position: absolute; inset: 10%; border-radius: 50%; background: conic-gradient(from 0deg, transparent, rgba(127,245,216,.35), transparent 40%, rgba(255,200,107,.3), transparent 75%);
  filter: blur(8px); animation: mm-swirl 9s linear infinite; }
@keyframes mm-swirl { to { transform: rotate(360deg); } }
.mm-ballText { position: relative; padding: 0 16%; font-size: clamp(17px, 4.8vw, 21px); font-style: italic; line-height: 1.35; color: #FFFFFF; text-shadow: 0 0 14px rgba(127,245,216,.8); text-wrap: balance; }
.mm-ballBase { width: 54%; height: 26px; margin-top: -6px; border-radius: 6px 6px 14px 14px; background: linear-gradient(180deg, #8E6A36, #3A240A); box-shadow: 0 10px 20px rgba(0,0,0,.6); }
.mm-ballSticker { position: absolute; right: -10px; top: -6px; }
@media (prefers-reduced-motion: reduce) { .mm-sigil, .mm-pot .mm-brew, .mm-steam, .mm-ballSwirl { animation: none; } .mm-sigil.is-drop { animation: none; opacity: 0; } }
`;
