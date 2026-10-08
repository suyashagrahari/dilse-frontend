"use client";

// Room 4 — The Séance (mini-game A). A round table, the spirit board (the
// "Magic Letter Board" for family/kids) and a little ghost planchette.
//   1. Rest a finger on the ghost and move: wherever you drag, it is
//      magnetically guided to the next letter of THEIR name. Each letter lands
//      with a rising chime and lights gold. Let go for 1.5 s and "the spirits
//      take over" — it keeps spelling by itself (the goosebumps beat).
//   2. Then it spells the sender's secret word.
//   3. Ask the spirits: tap a question card, the planchette glides to YES /
//      NO / ALWAYS / SOON with a heartbeat, an organ chord, and the card turns
//      to show the sender's whisper.
// Tap fallback: "Let the spirits spell". No board is ever named "Ouija".

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { sfx } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { GhostPlanchette } from "./art";
import { BOOK, ENGRAVED } from "./fonts";
import type { Manor } from "./model";
import type { ManorAnswer } from "../../../_valentine/days/happy-halloween-premium";
import { Gilded, Hint, Kicker, Quiet, Room, RoomTitle } from "./ui";

const W = 360;
const H = 250;
type Pt = { x: number; y: number };

function arc(letters: string, cy: number, rx: number, ry: number, off = 0.32): Record<string, Pt> {
  const out: Record<string, Pt> = {};
  const n = letters.length;
  for (let k = 0; k < n; k++) {
    const th = Math.PI + off + (k / (n - 1)) * (Math.PI - off * 2);
    out[letters[k]] = { x: W / 2 + rx * Math.cos(th), y: cy + ry * Math.sin(th) };
  }
  return out;
}
const SPOTS: Record<string, Pt> = {
  ...arc("ABCDEFGHIJKLM", 150, 160, 96, 0.3),
  ...arc("NOPQRSTUVWXYZ", 198, 134, 84, 0.34),
  YES: { x: 50, y: 30 },
  NO: { x: 310, y: 30 },
  ALWAYS: { x: 74, y: 214 },
  SOON: { x: 286, y: 214 },
  REST: { x: 180, y: 196 },
};

type Step = { key: string; pause?: number };

export default function Seance({ m, sticker, onAsked, onNext }: { m: Manor; sticker: ReactNode; onAsked: (n: number) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const seq = useMemo<Step[]>(() => [...Array.from(m.spiritName).map((k) => ({ key: k })), { key: "REST", pause: 1100 }, ...Array.from(m.spiritWord).map((k) => ({ key: k })), { key: "REST", pause: 300 }], [m.spiritName, m.spiritWord]);
  const [landed, setLanded] = useState(0); // steps landed
  const [phase, setPhase] = useState<"spell" | "ask">("spell");
  const [auto, setAuto] = useState(false);
  const [lit, setLit] = useState<string | null>(null);
  const [asked, setAsked] = useState<number[]>([]);
  const [asking, setAsking] = useState<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const plan = useRef<HTMLDivElement>(null);
  const st = useRef({ i: 0, from: SPOTS.REST as Pt, t: 0, drag: false, lastX: 0, lastY: 0, travel: 0, idleAt: 0, pauseUntil: 0, target: null as Pt | null, onLand: null as null | (() => void) });

  const place = useCallback((pt: Pt, wob = 0) => {
    const el = plan.current;
    if (!el) return;
    el.style.left = `${(pt.x / W) * 100}%`;
    el.style.top = `${(pt.y / H) * 100}%`;
    el.style.transform = `translate(-50%, -46%) rotate(${wob}deg)`;
  }, []);

  useEffect(() => {
    place(SPOTS.REST);
    st.current.idleAt = performance.now();
  }, [place]);

  // The spelling loop.
  useEffect(() => {
    if (phase !== "spell") return;
    let raf = 0;
    let last = performance.now();
    const s = st.current;
    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (s.i >= seq.length) {
        setPhase("ask");
        return;
      }
      const step = seq[s.i];
      const to = SPOTS[step.key] ?? SPOTS.REST;
      if (now < s.pauseUntil) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const len = Math.max(20, Math.hypot(to.x - s.from.x, to.y - s.from.y));
      const spirits = auto || (!s.drag && now - s.idleAt > (s.i > 0 ? 1500 : 7000)) || reduce;
      if (s.drag) {
        s.t += (s.travel * 1.15) / len;
        s.travel = 0;
      } else if (spirits) {
        s.t += (dt * (reduce ? 0.5 : 0.16)) / len;
      }
      const tt = Math.min(1, s.t);
      const e = tt < 0.5 ? 2 * tt * tt : 1 - Math.pow(-2 * tt + 2, 2) / 2;
      const pos = { x: s.from.x + (to.x - s.from.x) * e, y: s.from.y + (to.y - s.from.y) * e };
      place(pos, reduce ? 0 : Math.sin(now / 260) * 4);
      if (s.t >= 1) {
        s.from = to;
        s.t = 0;
        s.i += 1;
        if (step.key !== "REST") {
          setLit(step.key);
          const n = seq.slice(0, s.i).filter((x) => x.key !== "REST").length;
          sfx("chime", { detune: -1200 + (n % 12) * 100, gain: 0.7 });
          haptic(6);
        }
        if (step.pause) s.pauseUntil = now + step.pause;
        setLanded(s.i);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, seq, auto, reduce, place]);

  // Answer glides (question phase).
  useEffect(() => {
    if (phase !== "ask" || asking === null) return;
    const q = m.qa[asking];
    const to = SPOTS[q.answer];
    const from = { ...st.current.from };
    const t0 = performance.now();
    const dur = reduce ? 300 : 1900;
    let raf = 0;
    sfx("heartbeat", { count: 2, gain: 0.9 });
    const loop = (now: number) => {
      const tt = Math.min(1, (now - t0) / dur);
      const e = tt < 0.5 ? 4 * tt * tt * tt : 1 - Math.pow(-2 * tt + 2, 3) / 2;
      place({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }, reduce ? 0 : Math.sin(now / 200) * 5 * (1 - tt));
      if (tt < 1) raf = requestAnimationFrame(loop);
      else {
        st.current.from = to;
        setLit(q.answer);
        sfx("organ-chord", { chord: q.answer === "YES" || q.answer === "ALWAYS" ? "major" : "minor", dur: 1.6, gain: 0.8 });
        haptic([10, 30, 10]);
        setAsked((a) => (a.includes(asking) ? a : [...a, asking]));
        setAsking(null);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, asking, m.qa, place, reduce]);

  useEffect(() => onAsked(asked.length), [asked.length, onAsked]);

  const onDown = (e: React.PointerEvent) => {
    if (phase !== "spell") return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const s = st.current;
    s.drag = true;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
  };
  const onMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.drag) return;
    const bw = boardRef.current?.clientWidth || W;
    s.travel += (Math.hypot(e.clientX - s.lastX, e.clientY - s.lastY) * W) / bw;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
  };
  const onUp = () => {
    st.current.drag = false;
    st.current.idleAt = performance.now();
  };

  const nameCount = m.spiritName.length;
  const spelled = seq.slice(0, landed).filter((x) => x.key !== "REST").map((x) => x.key);
  const nameDone = spelled.slice(0, nameCount).join("");
  const wordDone = spelled.slice(nameCount).join("");
  const allAsked = asked.length >= m.qa.length;

  return (
    <Room label={m.T.board} className="mm-seance">
      <Kicker>The séance room</Kicker>
      <RoomTitle>{m.T.board}</RoomTitle>

      <div className="mm-spelled" aria-live="polite" aria-atomic>
        <span className="mm-spName" style={{ fontFamily: ENGRAVED }}>{nameDone || " "}</span>
        {wordDone && <span className="mm-spWord" style={{ fontFamily: ENGRAVED }}>{wordDone}</span>}
      </div>

      <div className="mm-table">
        <div
          ref={boardRef}
          className={`mm-board${phase === "spell" ? " is-spell" : ""}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          role="img"
          aria-label={`${m.T.board}: it spells ${m.spiritName}, then ${m.spiritWord}.`}
        >
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" aria-hidden className="mm-boardSvg">
            <defs>
              <radialGradient id="mmBoard" cx=".5" cy=".45" r=".7">
                <stop offset="0" stopColor="#E9D5A8" />
                <stop offset=".7" stopColor="#C9A86E" />
                <stop offset="1" stopColor="#8E6A36" />
              </radialGradient>
            </defs>
            <rect x="4" y="4" width={W - 8} height={H - 8} rx="22" fill="url(#mmBoard)" stroke="#5A3A1A" strokeWidth="3" />
            <rect x="12" y="12" width={W - 24} height={H - 24} rx="16" fill="none" stroke="#5A3A1A" strokeWidth="1" opacity=".5" />
            {/* sun + moon */}
            <circle cx="112" cy="30" r="10" fill="none" stroke="#5A3A1A" strokeWidth="1.6" opacity=".6" />
            <path d="M248 22 a10 10 0 1 0 8 16 a8 8 0 1 1 -8 -16z" fill="#5A3A1A" opacity=".55" />
            {Object.entries(SPOTS).map(([k, pt]) =>
              k === "REST" ? null : (
                <text
                  key={k}
                  x={pt.x}
                  y={pt.y + (k.length > 1 ? 5 : 7)}
                  textAnchor="middle"
                  className={`mm-bl${lit === k ? " is-lit" : ""}${spelled.includes(k) && k.length === 1 ? " was" : ""}`}
                  style={{ font: `700 ${k.length > 1 ? 14 : 19}px ${ENGRAVED}`, letterSpacing: k.length > 1 ? ".12em" : undefined }}
                >
                  {k}
                </text>
              ),
            )}
            <text x={W / 2} y={H - 16} textAnchor="middle" style={{ font: `700 11px ${ENGRAVED}`, letterSpacing: ".3em" }} fill="#5A3A1A" opacity=".7">GOODBYE</text>
          </svg>
          <div ref={plan} className="mm-plan" aria-hidden>
            <GhostPlanchette smile />
          </div>
          <span className="mm-boardCat">{sticker}</span>
        </div>
      </div>

      {phase === "spell" ? (
        <>
          <Hint>{landed === 0 ? "Rest a finger on the ghost and move it…" : auto ? "the spirits take over…" : "keep going, or let go — the spirits know the way"}</Hint>
          {!auto && <Quiet onClick={() => setAuto(true)}>Let the spirits spell</Quiet>}
        </>
      ) : (
        <>
          <p className="mm-askH" style={{ fontFamily: BOOK }}>Ask the spirits</p>
          <div className="mm-cards">
            {m.qa.map((q, i) => {
              const done = asked.includes(i);
              return (
                <button key={i} type="button" className={`mm-qcard${done ? " is-done" : ""}`} disabled={asking !== null || done} onClick={() => setAsking(i)} aria-label={done ? `${q.q} — ${q.answer}. ${q.line}` : `Ask: ${q.q}`}>
                  <span className="mm-qIn">
                    <span className="mm-qFront">{q.q}</span>
                    <span className="mm-qBack">
                      <b style={{ fontFamily: ENGRAVED }}>{answerWord(q.answer)}</b>
                      {q.line && <i style={{ fontFamily: BOOK }}>{q.line}</i>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {allAsked ? <Gilded big onClick={() => { sfx("static", { dur: 0.4, gain: 0.5 }); onNext(); }}>Something&rsquo;s on the radio →</Gilded> : <Hint>Tap a question</Hint>}
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const answerWord = (a: ManorAnswer) => (a === "ALWAYS" ? "ALWAYS" : a === "SOON" ? "SOON" : a);

const CSS = `
.mm-seance { gap: 10px; }
.mm-spelled { min-height: 64px; display: grid; justify-items: center; gap: 2px; }
.mm-spName { font-size: clamp(28px, 9vw, 40px); letter-spacing: .32em; margin-right: -.32em; color: #FFE6B0; text-shadow: 0 0 18px rgba(127,245,216,.55), 0 0 4px rgba(255,200,107,.7); }
.mm-spWord { font-size: clamp(18px, 5.5vw, 24px); letter-spacing: .4em; margin-right: -.4em; color: ${"#7FF5D8"}; text-shadow: 0 0 14px rgba(127,245,216,.7); animation: mm-memIn .8s ease both; }
.mm-table { position: relative; width: min(100%, 460px); padding: 18px; box-sizing: border-box; border-radius: 50% / 34%;
  background: radial-gradient(100% 100% at 50% 40%, #3A2416 0%, #22150C 70%, #140C06 100%); box-shadow: 0 30px 60px -24px rgba(0,0,0,.85), inset 0 0 0 2px rgba(201,151,62,.25); }
.mm-board { position: relative; width: 100%; aspect-ratio: ${W} / ${H}; touch-action: none; cursor: grab; }
.mm-board.is-spell:active { cursor: grabbing; }
.mm-boardSvg { display: block; filter: drop-shadow(0 10px 18px rgba(0,0,0,.55)); }
.mm-bl { fill: #4A2E12; transition: fill .3s; }
.mm-bl.was { fill: #6E4A1A; }
.mm-bl.is-lit { fill: #FFF1BF; paint-order: stroke; stroke: #E9B95A; stroke-width: 4px; filter: drop-shadow(0 0 6px rgba(255,200,107,.9)); }
.mm-plan { position: absolute; width: 19%; aspect-ratio: 80 / 88; pointer-events: none; filter: drop-shadow(0 8px 10px rgba(0,0,0,.45)); will-change: left, top, transform; }
.mm-boardCat { position: absolute; right: -14px; bottom: -22px; pointer-events: none; }
.mm-askH { margin: 6px 0 0; font-size: 19px; font-style: italic; color: var(--vw-gold); }
.mm-cards { display: grid; gap: 10px; width: 100%; max-width: 420px; }
.mm-qcard { all: unset; cursor: pointer; display: block; min-height: 64px; perspective: 900px; -webkit-tap-highlight-color: transparent; }
.mm-qcard:disabled { cursor: default; }
.mm-qcard:focus-visible { outline: 3px solid var(--vw-gold); outline-offset: 3px; border-radius: 14px; }
.mm-qIn { position: relative; display: grid; min-height: 64px; transform-style: preserve-3d; transition: transform .8s cubic-bezier(.3,.7,.2,1); }
.mm-qcard.is-done .mm-qIn { transform: rotateX(180deg); }
.mm-qFront, .mm-qBack { grid-area: 1 / 1; display: grid; place-content: center; gap: 4px; padding: 12px 16px; border-radius: 14px; backface-visibility: hidden; -webkit-backface-visibility: hidden; box-sizing: border-box; }
.mm-qFront { background: rgba(244,233,210,.94); color: #3B2414; font: 600 15.5px/1.35 var(--vw-font-ui, system-ui), sans-serif; border: 1px solid #C9973E; }
.mm-qBack { transform: rotateX(180deg); background: linear-gradient(135deg, #1D1630, #2A1F45); color: #F1EEFB; border: 1px solid rgba(127,245,216,.45); box-shadow: 0 0 22px rgba(127,245,216,.18) inset; }
.mm-qBack b { font-size: 18px; letter-spacing: .3em; color: #7FF5D8; }
.mm-qBack i { font-size: 16px; line-height: 1.3; }
@media (prefers-reduced-motion: reduce) { .mm-qIn { transition: none; } }
`;
