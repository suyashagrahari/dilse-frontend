"use client";

// Stamps 1–4 · The four hugs. One scene, four gestures, each a short physical hug with jelly physics (no long timed
// hold: hold-my-hand already ships that):
//   bear   pinch the two of them together (two fingers), or drag one into the other → a squash-and-stretch hug
//   back   drag him round behind her → his paws wrap round her tummy, he peeks over her shoulder
//   twirl  draw a circle round them → they spin on the spot and lift off the floor
//   pat    pat his head three times (he is under a little rain cloud) → the cloud clears, sun, and a hug
// Every hug ends the same way: the squish (sfx + haptic + hearts), then the rubber stamp thunks onto a passport page,
// one of her photos slides out as the souvenir of that hug with his line for it, and the reactor GIF celebrates.
// Every gesture has a "Do it for me" fallback. Keyboard: the stage is a button (Enter/Space = do it).

import { useEffect, useRef, useState } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { NameTag, Pair } from "../../../happy-hug-day/components/hug/Characters";
import { Gif, InkStamp, Polaroid, Slot } from "./art";
import { ForMe, Puffy, Scene, originOf, useAww, usePassport, useSfx } from "./ui";
import { FIXED_GIF, STAMP, clamp, photoAt } from "./util";

export type HugKind = "bear" | "back" | "twirl" | "pat";

const COPY: Record<HugKind, { n: number; title: string; sub: string; hint: string; slot?: string; gif?: string; next: string }> = {
  bear: { n: 1, title: "Squeeze us together", sub: "Pinch us together, or drag one into the other", hint: "squeeze →←", slot: "hp2-bear", next: "Next hug 🫶" },
  back: { n: 2, title: "Sneak me in behind you", sub: "Drag me round the back. Quietly 🤫", hint: "drag me →", slot: "hp3-back", next: "Next hug 💫" },
  twirl: { n: 3, title: "Spin us round", sub: "Draw a circle around us with your finger", hint: "round and round ↻", gif: FIXED_GIF.twirl, next: "Next hug 🤲" },
  pat: { n: 4, title: "I miss you. Pat, pat?", sub: "Pat my head three times", hint: "pat pat pat", gif: FIXED_GIF.cheek, next: "One more hug ✈️" },
};

const W = 360;
const H = 280;

export function HugScene({ kind, onDone }: { kind: HugKind; onDone: () => void }) {
  const { g, day, gifs, stamp, date } = usePassport();
  const sfx = useSfx();
  const aww = useAww();
  const reduce = useReducedMotion();
  const c = COPY[kind];
  const idx = c.n - 1;
  const photo = photoAt(g, idx);
  const line = g.hugLines[idx];

  const [phase, setPhase] = useState<"play" | "hugged" | "stamped" | "souvenir">("play");
  const done = phase !== "play";
  const [gap, setGap] = useState(130);
  const [lx, setLx] = useState(110);
  const [spin, setSpin] = useState(0);
  const [pats, setPats] = useState<{ id: number; x: number; y: number }[]>([]);
  const [patCount, setPatCount] = useState(0);
  const [squeeze, setSqueeze] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const s = useRef<{ x: number; gap: number; lx: number; d?: number; a?: number; side?: "l" | "r" } | null>(null);
  const doneRef = useRef(false);
  const timers = useRef<number[]>([]);
  const lastTick = useRef(0);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, reduce ? Math.min(ms, 200) : ms));

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    ptrs.current.clear();
    s.current = null;
    if (kind === "bear") setGap(66);
    if (kind === "back") setLx(200);
    if (kind === "twirl") setSpin(0);
    setPhase("hugged");
    sfx("hp-squish", { gain: 0.8 });
    haptic([40, 30, 80]);
    later(260, () => sfx("plush-squeak", { gain: 0.45, detune: 200 }));
    aww(originOf(stageRef.current, 0.45));
    // the stamp
    later(950, () => {
      setPhase("stamped");
      later(reduce ? 0 : 330, () => {
        sfx("hp-thunk", { gain: 0.9 });
        haptic(30);
        stamp(kind);
      });
    });
    // the souvenir + his line
    later(1900, () => {
      setPhase("souvenir");
      sfx("paper-rustle", { gain: 0.45 });
      later(500, () => footRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" }));
    });
  };

  const unit = () => {
    const r = stageRef.current?.getBoundingClientRect();
    return r && r.width ? 1 / Math.min(r.width / W, r.height / H) : 1;
  };
  // The SVG is "xMidYMax meet": scale to fit, centred, sitting on the floor.
  const local = (e: React.PointerEvent) => {
    const r = stageRef.current!.getBoundingClientRect();
    const k = Math.min(r.width / W, r.height / H);
    return { x: (e.clientX - r.left - (r.width - W * k) / 2) / k, y: (e.clientY - r.top - (r.height - H * k)) / k };
  };
  const tick = (gain = 0.3) => {
    const now = performance.now();
    if (now - lastTick.current < 90) return;
    lastTick.current = now;
    sfx("tick", { gain, detune: Math.random() * 300 });
  };

  const down = (e: React.PointerEvent) => {
    if (done) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = local(e);
    const all = [...ptrs.current.values()];
    s.current = { x: e.clientX, gap, lx, d: all.length >= 2 ? Math.abs(all[0].x - all[1].x) || 1 : undefined, a: Math.atan2(p.y - 150, p.x - 180), side: p.x < 180 ? "l" : "r" };
    if (kind === "pat") {
      const id = performance.now();
      setPats((ps) => [...ps.slice(-4), { id, x: p.x, y: p.y }]);
      const n = patCount + 1;
      setPatCount(n);
      setSqueeze(1);
      later(140, () => setSqueeze(0));
      sfx("hp-pat", { gain: 0.7, detune: n * 120 });
      haptic(12);
      if (n >= 3) later(320, finish);
    }
  };
  const move = (e: React.PointerEvent) => {
    const st = s.current;
    if (done || !st || !ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const u = unit();
    if (kind === "bear") {
      const all = [...ptrs.current.values()];
      let v: number;
      if (all.length >= 2 && st.d) v = (st.gap * Math.abs(all[0].x - all[1].x)) / st.d;
      else {
        const dx = (e.clientX - st.x) * u;
        v = st.gap - Math.max(0, st.side === "l" ? dx : -dx) * 1.2;
      }
      v = clamp(v, 60, 140);
      setGap(v);
      tick(0.22);
      if (v <= 76) finish();
    } else if (kind === "back") {
      const v = clamp(st.lx + (e.clientX - st.x) * u, 60, 250);
      setLx(v);
      tick(0.22);
      if (v >= 196) finish();
    } else if (kind === "twirl") {
      const p = local(e);
      const a = Math.atan2(p.y - 150, p.x - 180);
      let d = a - (st.a ?? a);
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      st.a = a;
      setSpin((v) => {
        const n = v + (d * 180) / Math.PI;
        if (Math.abs(n) >= 360) window.setTimeout(finish, 0);
        return n;
      });
      tick(0.18);
    }
  };
  const up = (e: React.PointerEvent) => {
    ptrs.current.delete(e.pointerId);
    if (done || ptrs.current.size) return;
    s.current = null;
    // let go too early: they boing back apart (jelly)
    if (kind === "bear" && gap > 76) {
      setGap(130);
      if (gap < 120) sfx("hp-boing", { gain: 0.35, detune: -100 });
    }
    if (kind === "back" && lx < 196) {
      setLx(110);
      if (lx > 130) sfx("hp-boing", { gain: 0.35, detune: -100 });
    }
  };

  // poses
  const sq = kind === "bear" ? clamp((130 - gap) / 60, 0, 1) : kind === "pat" ? squeeze * 0.5 : 0;
  const rx = kind === "back" ? 240 : kind === "pat" ? (done ? 206 : 252) : 180 + gap / 2;
  const leftX = kind === "back" ? lx : kind === "pat" ? (done ? 150 : 112) : 180 - gap / 2;
  const hugging = done;
  const lift = kind === "twirl" ? Math.min(1, Math.abs(spin) / 60) : 0;
  const turning = kind === "twirl" && !done;
  const cloud = kind === "pat" && !done ? 1 - patCount / 3.5 : 0;

  return (
    <Scene id={`hug-${kind}`} now={kind} label={STAMP[kind].name} kicker={`Stamp ${c.n} · ${STAMP[kind].name.toLowerCase()}`} title={c.title} sub={done ? "Stamped. That one counts 💗" : c.sub}>
      <div className="hp-stageWrap">
        <div
          ref={stageRef}
          className={`hp-stage hp-stage--${kind}${done ? " is-done" : ""}`}
          role="button"
          tabIndex={done ? -1 : 0}
          aria-label={`${STAMP[kind].name}: ${c.sub}. Press Enter to do it.`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={(e) => {
            if (!done && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              finish();
            }
          }}
        >
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMax meet" aria-hidden style={{ display: "block", overflow: "visible" }}>
            <Backdrop kind={kind} done={done} />
            {kind === "twirl" && !done && (
              <g className="hp-twirlGuide">
                <circle cx="180" cy="150" r="122" fill="none" stroke="#C9B6FF" strokeWidth="3" strokeDasharray="6 9" />
                <circle cx="180" cy="150" r="122" fill="none" stroke="#7A52E0" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(Math.min(360, Math.abs(spin)) / 360) * 767} 767`} transform="rotate(-90 180 150)" />
                <path d="M302 150 l-9 -12 M302 150 l11 -9" stroke="#7A52E0" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            )}
            {kind === "pat" && (
              <g className={`hp-cloud${done ? " is-gone" : ""}`} style={{ transform: `translate(${leftX}px, 62px) scale(${0.4 + cloud * 0.8})` }}>
                <path d="M-46 0 C-58 0 -60 -22 -42 -24 C-40 -42 -14 -46 -6 -32 C4 -48 34 -42 32 -22 C50 -22 50 0 36 0 Z" fill="#B9C6E4" stroke="#fff" strokeWidth="4" />
                {!done && [0, 1, 2].map((k) => <path key={k} className="hp-rain" d={`M${-24 + k * 22} 8 l-4 12`} stroke="#8FB3E8" strokeWidth="4" strokeLinecap="round" style={{ animationDelay: `${k * 0.22}s` }} />)}
              </g>
            )}
            <g className={`hp-pair${done ? " is-hugged" : ""}`} style={{ transform: turning ? `translateY(${-lift * 18}px) scaleX(${Math.cos((spin * Math.PI) / 180) || 0.02})` : `translateY(${kind === "twirl" && done ? -14 : 0}px)` }}>
              <Pair
                species={g.species}
                lx={leftX}
                rx={rx}
                ground={236}
                back={kind === "back"}
                leftY={kind === "back" ? -clamp((lx - 160) / 2.6, 0, 24) : 0}
                left={{ squish: sq, hugging: hugging || (kind === "back" && lx > 200), reach: kind === "back" ? 34 : 60, armDrop: kind === "back" ? 20 : 0, happy: done || sq > 0.5 || (kind === "twirl" && lift > 0.5) }}
                right={{ squish: kind === "bear" ? sq : 0, hugging: hugging && kind !== "back", reach: 60, happy: done || (kind === "back" && lx > 190) }}
              />
              {kind === "pat" && !done && (
                <g aria-hidden>
                  <path d={`M${leftX - 28} 151 l12 -6 M${leftX + 28} 151 l-12 -6`} stroke="#6B4232" strokeWidth="3" strokeLinecap="round" />
                  <path d={`M${leftX - 18} 162 q-3 8 0 11 q3 -3 0 -11`} fill="#8FB3E8" className="hp-tear" />
                </g>
              )}
            </g>
            {!turning && (
              <g className="hp-tags">
                <NameTag text={g.from} x={kind === "back" ? Math.min(lx, 200) - 20 : leftX} y={246} color="#FFE7B8" />
                <NameTag text={g.to} x={kind === "back" ? 262 : rx} y={246} color="#D9F5EA" />
              </g>
            )}
            {pats.map((p) => (
              <g key={p.id} className="hp-patMark" style={{ transformOrigin: `${p.x}px ${p.y}px` }}>
                <text x={p.x} y={p.y} textAnchor="middle" style={{ font: "700 22px var(--hp-hand-f)" }} fill="#D63F72">
                  pat!
                </text>
              </g>
            ))}
            {done && kind !== "pat" && <HeartPuffs />}
          </svg>
          {kind === "pat" && !done && (
            <div className="hp-patDots" aria-hidden>
              {[0, 1, 2].map((k) => (
                <i key={k} className={k < patCount ? "is-on" : ""} />
              ))}
            </div>
          )}
          {!done && <span className="hp-stageHint">{c.hint}</span>}
        </div>
        <span className={`hp-reactor hp-reactor--${kind}${done ? " is-happy" : ""}`}>
          {kind === "pat" && !done ? (
            <Gif src={FIXED_GIF.comfort} size={92} tilt={-6} eager />
          ) : c.slot ? (
            <Slot day={day} gifs={gifs} id={c.slot} size={done ? 112 : 88} tilt={done ? -4 : 6} eager className={done ? "hp-pop" : "hp-float"} />
          ) : (
            <Gif src={c.gif!} size={done ? 112 : 88} tilt={done ? -4 : 6} eager className={done ? "hp-pop" : "hp-float"} />
          )}
        </span>
      </div>

      {!done ? (
        <div className="hp-under">
          <ForMe onClick={finish} />
        </div>
      ) : (
        <div ref={pageRef} className={`hp-page${phase === "souvenir" ? " is-full" : ""}`}>
          <div className="hp-pageStamp">
            {phase !== "hugged" && <InkStamp kind={kind} size={118} date={date} uid={`hug-${kind}`} className="hp-landing" />}
            {phase === "hugged" && <span className="hp-pageEmpty" aria-hidden />}
          </div>
          <div className="hp-pageSide">
            {photo ? (
              <Polaroid photo={photo} caption={photo.caption} rot={idx % 2 ? 5 : -5} className={`hp-souvenir${phase === "souvenir" ? " is-in" : ""}`} />
            ) : c.slot ? (
              <Slot day={day} gifs={gifs} id={c.slot} size={100} className={`hp-souvenir${phase === "souvenir" ? " is-in" : ""}`} />
            ) : (
              <Gif src={c.gif!} size={100} className={`hp-souvenir${phase === "souvenir" ? " is-in" : ""}`} />
            )}
          </div>
          <p className={`hp-pageLine${phase === "souvenir" ? " is-in" : ""}`}>
            <b>{STAMP[kind].name}:</b> {line}
          </p>
        </div>
      )}

      <div ref={footRef} className={`hp-foot${phase === "souvenir" ? " is-on" : ""}`}>
        {phase === "souvenir" && (
          <Puffy onClick={onDone} className="hp-heartbeat">
            {c.next}
          </Puffy>
        )}
      </div>
    </Scene>
  );
}

function HeartPuffs() {
  return (
    <g className="hp-puffs" aria-hidden>
      {[0, 1, 2, 3, 4].map((k) => (
        <path
          key={k}
          d="M0 6 C-8 0 -8 -6 -4 -7 C-2 -7.5 0 -6 0 -4.5 C0 -6 2 -7.5 4 -7 C8 -6 8 0 0 6 Z"
          fill={k % 2 ? "#FF7AA2" : "#FF8A6B"}
          style={{ ["--hx" as string]: `${150 + k * 15}px`, ["--dx" as string]: `${(k - 2) * 18}px`, animationDelay: `${k * 0.16}s` }}
        />
      ))}
    </g>
  );
}

/** Each hug's little room, painted behind the huggers. */
function Backdrop({ kind, done }: { kind: HugKind; done: boolean }) {
  if (kind === "bear")
    return (
      <g>
        <rect x="236" y="22" width="86" height="70" rx="10" fill="#D9F2FF" stroke="#fff" strokeWidth="5" />
        <path d="M279 22 V92 M236 57 H322" stroke="#fff" strokeWidth="4" />
        <path d="M228 18 Q 279 40 330 18" fill="none" stroke="#FF8A6B" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((k) => (
          <path key={k} d={`M${236 + k * 22} ${22 + Math.sin((k / 4) * Math.PI) * 9} l7 12 l7 -12 Z`} fill={k % 2 ? "#FFD3B8" : "#9FE5C8"} />
        ))}
        <rect x="34" y="40" width="58" height="72" rx="8" fill="#FFF4E6" stroke="#fff" strokeWidth="4" transform="rotate(-6 63 76)" />
        <path d="M63 66 C55 60 55 54 59 53 C61 52.5 63 54 63 55.5 C63 54 65 52.5 67 53 C71 54 71 60 63 66 Z" fill="#FF7AA2" transform="rotate(-6 63 76)" />
        <ellipse cx="180" cy="248" rx="150" ry="20" fill="#FFD3B8" />
        <ellipse cx="180" cy="248" rx="120" ry="13" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
      </g>
    );
  if (kind === "back")
    return (
      <g>
        <rect x="0" y="150" width="360" height="130" fill="#E8F8F1" />
        {Array.from({ length: 9 }, (_, k) => (
          <rect key={k} x={k * 40 + 4} y="160" width="32" height="32" rx="6" fill="#D2F1E4" />
        ))}
        <rect x="20" y="40" width="120" height="10" rx="5" fill="#E0B489" />
        <g transform="translate(46 22)">
          <path d="M0 0 h26 v14 a13 13 0 0 1 -26 0 Z" fill="#fff" stroke="#E0603F" strokeWidth="3" />
          <path d="M26 4 q9 0 9 7 q0 7 -9 7" fill="none" stroke="#E0603F" strokeWidth="3" />
          <path className="hp-steam" d="M8 -6 q-4 -6 0 -12 M17 -6 q-4 -6 0 -12" fill="none" stroke="#FFB59A" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <circle cx="112" cy="30" r="9" fill="#9FE5C8" />
        <text x="262" y="34" textAnchor="middle" style={{ font: "700 20px var(--hp-hand-f)" }} fill="#E0603F">
          chai o&apos;clock ☕
        </text>
        <ellipse cx="180" cy="250" rx="150" ry="18" fill="#C6EBDC" />
      </g>
    );
  if (kind === "twirl")
    return (
      <g>
        <path d="M-6 30 Q 180 92 366 30" fill="none" stroke="#7A52E0" strokeWidth="2" opacity=".5" />
        {Array.from({ length: 11 }, (_, k) => {
          const x = k * 36;
          const y = 30 + Math.sin((k / 10) * Math.PI) * 31;
          return <circle key={k} className="hp-bulb" cx={x} cy={y + 8} r="6" fill={["#FFE27A", "#FF7AA2", "#9FE5C8", "#C9B6FF"][k % 4]} style={{ animationDelay: `${(k % 4) * 0.3}s` }} />;
        })}
        <ellipse cx="180" cy="248" rx="160" ry="22" fill="#EDE3FF" />
        <ellipse cx="180" cy="248" rx="130" ry="15" fill="none" stroke="#C9B6FF" strokeWidth="3" strokeDasharray="10 8" />
        <text x="38" y="110" style={{ font: "700 24px var(--hp-ui)" }} fill="#C9B6FF">♪</text>
        <text x="312" y="128" style={{ font: "700 20px var(--hp-ui)" }} fill="#FFB3D6">♫</text>
      </g>
    );
  // pat: a rainy window that turns sunny
  return (
    <g>
      <rect x="226" y="24" width="96" height="84" rx="12" fill={done ? "#D9F2FF" : "#C9D6EE"} stroke="#fff" strokeWidth="5" style={{ transition: "fill .8s" }} />
      <path d="M274 24 V108 M226 66 H322" stroke="#fff" strokeWidth="4" />
      {!done && [0, 1, 2, 3].map((k) => <path key={k} className="hp-rain" d={`M${240 + k * 22} 34 l-5 14`} stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{ animationDelay: `${k * 0.3}s` }} />)}
      <g className={`hp-sun${done ? " is-on" : ""}`}>
        <circle cx="60" cy="50" r="20" fill="#FFE27A" />
        {Array.from({ length: 8 }, (_, k) => (
          <path key={k} d="M60 22 v-8" stroke="#FFD54F" strokeWidth="4" strokeLinecap="round" transform={`rotate(${k * 45} 60 50)`} />
        ))}
        <path d="M20 120 A 90 90 0 0 1 200 120" fill="none" stroke="#FFB3D6" strokeWidth="6" opacity=".7" />
        <path d="M30 120 A 80 80 0 0 1 190 120" fill="none" stroke="#FFE27A" strokeWidth="6" opacity=".7" />
        <path d="M40 120 A 70 70 0 0 1 180 120" fill="none" stroke="#9FE5C8" strokeWidth="6" opacity=".7" />
      </g>
      <ellipse cx="180" cy="248" rx="150" ry="20" fill="#FFD3B8" />
    </g>
  );
}
