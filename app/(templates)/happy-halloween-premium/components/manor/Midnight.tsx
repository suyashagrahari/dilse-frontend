"use client";

// Room 8 — Midnight. The clock tower reads 11:55. Drag the minute hand round
// to twelve (a tick for every minute), or tap "Let it strike twelve". The
// song's drop lands on the FIRST bell (useSongDrop — the page's one climax),
// then eleven more tolls, each lighting its numeral I…XII on the face. The
// question rises; in romantic/bestie mode the No drifts off like a ghost
// (three tries, then "Fine… YES?"); family/kids get a No that never runs.
// YES → the bats leave the tower and burst into firework hearts spelling both
// initials, and the storm gives way to dawn.

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { sfx, useSongDrop } from "../../../_valentine/kit/premium";
import { RunawayNo, haptic, useReducedMotion } from "../../../_valentine/kit";
import BatHearts from "./BatHearts";
import { BOOK, ENGRAVED, SCRIPT } from "./fonts";
import { initialOf, type Manor } from "./model";
import { Gilded, Hint, Kicker, Quiet, Room } from "./ui";

const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
const TOLL_MS = 720;

export default function Midnight({ m, sticker, onYes, onDawn, onNext }: { m: Manor; sticker: ReactNode; onYes: (dodges: number) => void; onDawn: () => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const { drop } = useSongDrop();
  const [minute, setMinute] = useState(55);
  const [phase, setPhase] = useState<"wind" | "rise" | "toll" | "ask" | "yes">("wind");
  const [tolls, setTolls] = useState(0);
  const [think, setThink] = useState(false);
  const [dodges, setDodges] = useState(0);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const face = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const strike = () => {
    if (phase !== "wind") return;
    setMinute(60);
    setPhase("rise");
    haptic(16);
    drop(() => {
      setPhase("toll");
      for (let i = 0; i < 12; i++) {
        timers.current.push(
          window.setTimeout(() => {
            setTolls(i + 1);
            sfx("bell-toll", { gain: i === 0 ? 1 : 0.75, detune: i === 0 ? -100 : 0 });
            if (i % 3 === 0) haptic(10);
          }, i * (reduce ? 260 : TOLL_MS)),
        );
      }
      timers.current.push(window.setTimeout(() => setPhase("ask"), 11 * (reduce ? 260 : TOLL_MS) + 1100));
    });
  };

  const skipBells = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTolls(12);
    setPhase("ask");
  };

  // Drag the minute hand forward.
  const angleMin = (e: React.PointerEvent) => {
    const r = face.current?.getBoundingClientRect();
    if (!r) return null;
    const a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))); // 0 at 12, clockwise
    let mins = ((a / (Math.PI * 2)) * 60 + 60) % 60;
    if (mins < 20) mins += 60; // past twelve counts as twelve
    return mins;
  };
  const onDown = (e: React.PointerEvent) => {
    if (phase !== "wind") return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = true;
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || phase !== "wind") return;
    const mm = angleMin(e);
    if (mm == null) return;
    if (mm > minute && mm - minute < 8) {
      const next = Math.min(60, mm);
      if (Math.floor(next) > Math.floor(minute)) sfx("tick", { gain: 0.8 });
      setMinute(next);
      if (next >= 59.6) {
        drag.current = false;
        strike();
      }
    }
  };
  const onUp = () => {
    drag.current = false;
  };

  const yes = (d: number) => {
    if (phase === "yes") return;
    const r = face.current?.getBoundingClientRect();
    setOrigin(r ? { x: r.left + r.width / 2, y: r.top + r.height * 0.2 } : { x: window.innerWidth / 2, y: window.innerHeight * 0.3 });
    setPhase("yes");
    onYes(d);
    haptic([20, 50, 30]);
    sfx("mm-bats");
    sfx("firework", { at: 0.35 });
    sfx("firework", { at: 1.1, detune: 300, gain: 0.8 });
    sfx("firework", { at: 1.9, detune: -200, gain: 0.7 });
    sfx("mm-dawn", { at: 1.4 });
    timers.current.push(window.setTimeout(onDawn, 1300));
  };

  const minAngle = (minute / 60) * 360;
  const hourAngle = 330 + (minute / 60) * 30;
  const a = initialOf(m.recipient);
  const b = initialOf(m.sender);

  return (
    <Room label="Midnight at the clock tower" className={`mm-midnight is-${phase}`} top={phase === "yes" ? 120 : 110}>
      {phase !== "yes" && (
        <>
          <Kicker>The clock tower · {m.manorName}</Kicker>
          <div
            ref={face}
            className={`mm-clock${phase === "rise" ? " is-rise" : ""}${tolls ? " is-tolling" : ""}`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            role="img"
            aria-label={phase === "wind" ? `The clock reads 11:${String(Math.min(59, Math.floor(minute))).padStart(2, "0")}. Drag the minute hand to twelve.` : `Midnight. ${tolls} of 12 bells.`}
          >
            <svg viewBox="0 0 240 240" width="100%" height="100%" aria-hidden>
              <defs>
                <radialGradient id="mmFace" cx=".5" cy=".45" r=".6">
                  <stop offset="0" stopColor="#FFF6DD" />
                  <stop offset=".8" stopColor="#E8D6A8" />
                  <stop offset="1" stopColor="#B99A5E" />
                </radialGradient>
              </defs>
              <circle cx="120" cy="120" r="116" fill="#1A1424" stroke="#9A6A1F" strokeWidth="4" />
              <circle cx="120" cy="120" r="102" fill="url(#mmFace)" />
              {ROMAN.map((r, i) => {
                const th = (i / 12) * Math.PI * 2;
                const x = 120 + Math.sin(th) * 82;
                const y = 120 - Math.cos(th) * 82;
                const n = i === 0 ? 12 : i;
                const on = tolls >= n;
                return (
                  <text key={r} x={x} y={y + 6} textAnchor="middle" className={`mm-num${on ? " is-on" : ""}`} style={{ font: `700 ${r.length > 2 ? 14 : 17}px ${ENGRAVED}` }}>
                    {r}
                  </text>
                );
              })}
              {Array.from({ length: 60 }, (_, i) => (
                <line key={i} x1="120" y1={i % 5 ? 22 : 24} x2="120" y2="30" stroke="#5A3A1A" strokeWidth={i % 5 ? 1 : 2} transform={`rotate(${i * 6} 120 120)`} opacity=".7" />
              ))}
              <g transform={`rotate(${hourAngle} 120 120)`}>
                <path d="M120 128 L116 120 L120 66 L124 120 Z" fill="#2A1A0C" />
              </g>
              <g transform={`rotate(${minAngle} 120 120)`} className="mm-minHand">
                <path d="M120 132 L116.5 120 L120 34 L123.5 120 Z" fill="#2A1A0C" />
                <circle cx="120" cy="40" r="9" fill="rgba(233,185,90,.35)" className="mm-grip" />
              </g>
              <circle cx="120" cy="120" r="6" fill="#9A6A1F" />
            </svg>
            {tolls > 0 && <span key={tolls} className="mm-ring" aria-hidden />}
          </div>
          <div className="mm-tollCount" aria-live="polite" style={{ fontFamily: ENGRAVED }}>
            {phase === "wind" ? `11:${String(Math.min(59, Math.floor(minute))).padStart(2, "0")}` : phase === "rise" ? "…" : tolls ? ROMAN[tolls % 12] : ""}
          </div>
        </>
      )}

      {phase === "wind" && (
        <>
          <Hint>Turn the minute hand to twelve</Hint>
          <Gilded big onClick={strike}>Let it strike twelve</Gilded>
        </>
      )}
      {phase === "toll" && <Quiet onClick={skipBells}>Skip the bells ▸</Quiet>}

      {phase === "ask" && (
        <div className="mm-ask">
          <h2 className="mm-q" aria-label={m.question} style={{ fontFamily: ENGRAVED }}>
            {m.question.split(/\s+/).map((w, i, all) => (
              <Fragment key={i}>
                <span aria-hidden className="mm-qw" style={{ animationDelay: `${i * 120}ms` }}>{w}</span>
                {i < all.length - 1 ? " " : ""}
              </Fragment>
            ))}
          </h2>
          {m.gentle ? (
            <div className="mm-gentle">
              <Gilded big onClick={() => yes(0)}>{m.T.yes}</Gilded>
              <Quiet onClick={() => setThink(true)}>Hmm, let me think 🤔</Quiet>
              {think && <p className="mm-think" style={{ fontFamily: BOOK }}>Take your time. The pumpkins will wait. 🎃</p>}
            </div>
          ) : (
            <RunawayNo
              yesLabel={m.T.yes}
              noLabel="No"
              noLines={m.T.noLines}
              maxDodges={3}
              surrenderLabel={m.T.surrender}
              onDodge={(n) => {
                setDodges(n);
                sfx("mm-whisper", { gain: 0.5 });
              }}
              onYes={yes}
              height={150}
              yesStyle={{ background: "linear-gradient(135deg, #fff1bf, #e9b95a 45%, #9a6a1f)", color: "#2b1a03", boxShadow: "0 5px 0 #6b4714, 0 14px 30px -10px rgba(233,185,90,.6)" }}
              noStyle={{ background: "rgba(241,238,251,.92)", color: "#2B1E3F" }}
            />
          )}
        </div>
      )}

      {phase === "yes" && (
        <div className="mm-yes">
          {origin && <BatHearts a={a} b={b} origin={origin} reduce={reduce} />}
          <div className="mm-yesTop" />
          <p className="mm-yesKick" style={{ fontFamily: ENGRAVED }}>The stroke of midnight</p>
          <h2 className="mm-yesH" style={{ fontFamily: SCRIPT }}>{m.recipient} said yes</h2>
          <p className="mm-yesLine" style={{ fontFamily: BOOK }}>{m.yesLine}</p>
          {dodges > 0 && !m.gentle && <p className="mm-yesDodge">…after the No button ghosted you {dodges} {dodges === 1 ? "time" : "times"} 👻</p>}
          <div className="mm-yesSticker">{sticker}</div>
          <Gilded big onClick={() => { sfx("chime-cascade", { gain: 0.6 }); onNext(); }}>Watch the sunrise →</Gilded>
        </div>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.mm-midnight { gap: 12px; }
.mm-clock { position: relative; width: min(74vw, 300px); aspect-ratio: 1; touch-action: none; cursor: grab; border-radius: 50%;
  box-shadow: 0 0 0 10px #120C18, 0 0 0 13px #9A6A1F, 0 30px 70px -20px rgba(0,0,0,.9), 0 0 90px rgba(220,227,242,.12); transition: box-shadow 1s ease; }
.mm-clock.is-rise { box-shadow: 0 0 0 10px #120C18, 0 0 0 13px #E9B95A, 0 0 80px 20px rgba(255,200,107,.45), 0 0 160px 50px rgba(255,200,107,.2); animation: mm-rise 1.1s ease-in both; }
@keyframes mm-rise { from { transform: scale(1); } to { transform: scale(1.06); } }
.mm-midnight.is-ask .mm-clock { width: min(44vw, 190px); }
.mm-midnight.is-ask .mm-tollCount { display: none; }
.mm-clock { transition: width .9s cubic-bezier(.22,1,.36,1), box-shadow 1s ease; }
.mm-clock.is-tolling { box-shadow: 0 0 0 10px #120C18, 0 0 0 13px #E9B95A, 0 0 70px 14px rgba(255,200,107,.3); }
.mm-num { fill: #3A2414; transition: fill .3s; }
.mm-num.is-on { fill: #B4511C; paint-order: stroke; stroke: rgba(255,200,107,.55); stroke-width: 3px; }
.mm-grip { animation: mm-grip 1.6s ease-in-out infinite; }
.is-wind .mm-grip { opacity: 1; } .mm-midnight:not(.is-wind) .mm-grip { display: none; }
@keyframes mm-grip { 0%, 100% { r: 8; opacity: .5; } 50% { r: 12; opacity: 1; } }
.mm-ring { position: absolute; inset: -6%; border-radius: 50%; border: 3px solid rgba(255,200,107,.8); animation: mm-ringOut .9s ease-out forwards; pointer-events: none; }
@keyframes mm-ringOut { from { transform: scale(.9); opacity: 1; } to { transform: scale(1.45); opacity: 0; } }
.mm-tollCount { min-height: 44px; font-size: 34px; font-weight: 700; letter-spacing: .1em; color: #FFE6B0; text-shadow: 0 0 20px rgba(255,200,107,.6); }
.mm-ask { display: grid; justify-items: center; gap: 18px; width: 100%; }
.mm-q { margin: 0; text-align: center; text-wrap: balance; max-width: 19ch; font-size: clamp(25px, 6.8vw, 36px); font-weight: 700; line-height: 1.18; color: #FFF4DA;
  text-shadow: 0 0 24px rgba(255,200,107,.45), 0 2px 2px rgba(0,0,0,.4); }
.mm-qw { display: inline-block; animation: mm-qw .9s cubic-bezier(.22,1,.36,1) both; }
@keyframes mm-qw { from { opacity: 0; transform: translateY(.4em); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
.mm-midnight .mm-kicker { margin-bottom: 16px; }
.mm-gentle { display: grid; justify-items: center; gap: 12px; }
.mm-think { margin: 0; font-size: 17px; font-style: italic; color: var(--vw-ink-soft); }
.mm-yes { display: grid; justify-items: center; gap: 12px; width: 100%; padding-top: min(24vh, 200px); }
.mm-yesKick { margin: 0; font-size: 12px; letter-spacing: .3em; text-transform: uppercase; color: #FFE6B0; }
.mm-yesH { margin: 0; font-size: clamp(40px, 12vw, 64px); line-height: 1; color: #FFF4DA; text-shadow: 0 2px 30px rgba(255,140,120,.6); }
.mm-yesLine { margin: 0; max-width: 30ch; font-size: clamp(19px, 5vw, 23px); font-style: italic; line-height: 1.4; color: #FFF8EC; text-wrap: balance; }
.mm-yesDodge { margin: 0; font: 600 14px/1.3 var(--vw-font-ui, system-ui), sans-serif; color: #7FF5D8; }
.mm-yesSticker { min-height: 20px; }
@media (prefers-reduced-motion: reduce) { .mm-clock.is-rise, .mm-grip, .mm-ring { animation: none; } .mm-qw { animation: mm-fadeOnly .4s ease both; } }
`;
