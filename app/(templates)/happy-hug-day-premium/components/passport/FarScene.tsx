"use client";

// Stamp 5 · The long-distance hug. Two phones stand at the edges of the screen, one with each of them inside, and the
// distance between them is printed large ("860 km"). She drags either phone toward the other: the kilometres count
// down, and when the phones touch the two little critters climb out and hug in the middle, a heart pops up with
// one of her photos in it and his line for the moment ("There you are. Finally."). Then the airmail stamp thunks
// into the passport. Fallback: "Bring us together". Keyboard: arrow keys move the phones.

import { useEffect, useRef, useState } from "react";
import { CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import { Gif, HugEmblem, InkStamp, Phone, Slot } from "./art";
import { ForMe, Puffy, Scene, originOf, useAww, usePassport, useSfx } from "./ui";
import { STAMP, WALL_GIFS, clamp, kmLabel, photoAt } from "./util";

const PHONE_W = 104;

export function FarScene({ hasLetter, onDone }: { hasLetter: boolean; onDone: () => void }) {
  const { g, day, gifs, stamp, date } = usePassport();
  const sfx = useSfx();
  const aww = useAww();
  const reduce = useReducedMotion();
  const [p, setP] = useState(0);
  const [phase, setPhase] = useState<"play" | "met" | "stamped">("play");
  const stageRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; p: number; dir: 1 | -1; id: number } | null>(null);
  const timers = useRef<number[]>([]);
  const lastTick = useRef(0);
  const photo = photoAt(g, 4);
  const met = phase !== "play";

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, reduce ? Math.min(ms, 200) : ms));

  const span = () => {
    const w = stageRef.current?.getBoundingClientRect().width ?? 340;
    return Math.max(40, w / 2 - PHONE_W - 2);
  };

  const meet = () => {
    if (met) return;
    drag.current = null;
    setP(1);
    setPhase("met");
    sfx("hp-squish", { gain: 0.8 });
    later(120, () => sfx("glass-ping", { gain: 0.5 }));
    haptic([40, 30, 80]);
    aww(originOf(stageRef.current, 0.35));
    later(1300, () => {
      setPhase("stamped");
      later(reduce ? 0 : 330, () => {
        sfx("hp-thunk", { gain: 0.9 });
        haptic(30);
        stamp("far");
      });
      later(900, () => footRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" }));
    });
  };

  const set = (v: number) => {
    const n = clamp(v, 0, 1);
    setP(n);
    const now = performance.now();
    if (now - lastTick.current > 80) {
      lastTick.current = now;
      sfx("tick", { gain: 0.22, detune: n * 600 });
    }
    if (n >= 0.96) meet();
  };

  const onDown = (dir: 1 | -1) => (e: React.PointerEvent) => {
    if (met) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, p, dir, id: e.pointerId };
    sfx("swoosh-soft", { gain: 0.3 });
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || met) return;
    set(d.p + ((e.clientX - d.x) * d.dir) / span());
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    // a little slack: they drift back a touch (they're far, after all)
    if (!met && p < 0.96) setP((v) => Math.max(0, v - 0.06));
  };

  const [w, setW] = useState(340);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const shift = `${p * Math.max(40, w / 2 - PHONE_W - 8)}px`;
  const left = g.km > 0 ? kmLabel(g.km * (1 - p)) : met ? "0 km" : "too far";

  return (
    <Scene
      id="far"
      now="far"
      label={STAMP.far.name}
      kicker={`Stamp 5 · ${STAMP.far.name.toLowerCase()}`}
      title={met ? g.meetLine : g.km > 0 ? `${kmLabel(g.km)} is too far` : "Even next door is too far"}
      sub={met ? "Hugs travel fine. I checked ✈️" : "Drag our phones together"}
    >
      <div
        ref={stageRef}
        className={`hp-far${met ? " is-met" : ""}`}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        tabIndex={met ? -1 : 0}
        role="group"
        aria-label={`Two phones ${left} apart. Use the arrow keys to bring them together.`}
        onKeyDown={(e) => {
          if (met) return;
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            set(p + 0.12);
          }
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            meet();
          }
        }}
      >
        <svg className="hp-farPath" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden>
          <path d="M6 50 C 80 -10 220 -10 294 50" fill="none" stroke="#3577C4" strokeWidth="2.5" strokeDasharray="6 8" strokeLinecap="round" />
        </svg>
        <span className="hp-farPlane" style={{ left: `calc(12% + ${p * 76}%)` }} aria-hidden>
          ✈️
        </span>
        <div className="hp-farKm" aria-live="polite">
          <b>{left}</b>
          <small>{met ? "between us" : "between us, for now"}</small>
        </div>
        <span className="hp-farPhone hp-farPhone--l" style={{ transform: `translateX(${shift})` }} onPointerDown={onDown(1)}>
          <Phone species={g.species[0]} name={g.from} />
        </span>
        <span className="hp-farPhone hp-farPhone--r" style={{ transform: `translateX(calc(-1 * ${shift}))` }} onPointerDown={onDown(-1)}>
          <Phone species={g.species[1]} alt={g.species[0] === g.species[1]} name={g.to} />
        </span>
        {met && (
          <div className="hp-farMeet">
            <span className="hp-farHeart">
              {photo ? (
                <span className="hp-farHeartPhoto">
                  <CroppedPhoto photo={photo} alt={photo.caption ?? ""} eager />
                </span>
              ) : (
                <HugEmblem species={g.species} size={120} />
              )}
            </span>
            <span className="hp-farHug">
              <HugEmblem species={g.species} size={150} />
            </span>
          </div>
        )}
        <span className="hp-reactor hp-reactor--far">
          {met ? <Gif src={WALL_GIFS[4]} size={100} tilt={-6} eager className="hp-pop" /> : <Slot day={day} gifs={gifs} id="hp4-far" size={86} tilt={6} eager className="hp-float" />}
        </span>
      </div>

      {!met ? (
        <div className="hp-under">
          <ForMe onClick={meet}>Bring us together ✈️</ForMe>
        </div>
      ) : (
        <div className="hp-page hp-page--far is-full">
          <div className="hp-pageStamp">{phase === "stamped" ? <InkStamp kind="far" size={118} date={date} uid="far" className="hp-landing" /> : <span className="hp-pageEmpty" aria-hidden />}</div>
          <p className={`hp-pageLine is-in`}>
            <b>{STAMP.far.name}:</b> {g.km > 0 ? `${kmLabel(g.km)}, and it still reached you.` : "It still reached you."}
          </p>
        </div>
      )}

      <div ref={footRef} className={`hp-foot${phase === "stamped" ? " is-on" : ""}`}>
        {phase === "stamped" && (
          <Puffy onClick={onDone} className="hp-heartbeat">
            {hasLetter ? "A postcard came for you 💌" : "Next 🤗"}
          </Puffy>
        )}
      </div>
    </Scene>
  );
}
