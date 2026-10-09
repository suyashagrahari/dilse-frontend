"use client";

// Scene 3 · Kiss-cam photobooth. A candy-pink booth with a marquee sign and
// a heart lens. "Say cheese" → 3·2·1 → four flashes, and with each one a
// frame of their photos prints and the strip slides further out of the
// slot. Then she decorates it: drag lip prints, hearts, "mwah!" and
// sparkles onto the strip (or tap one to stick it on, or "Decorate it for
// me"). The decorated strip comes back in the finale and the keepsake.

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import type { Deco, DecoKind, Mwah } from "./model";
import Strip, { DecoArt, GEO, STRIP_H } from "./Strip";
import { Gif, Kicker, Puffy, Quiet, Scene, Sub, Title, popIn, rise } from "./ui";

const KINDS: DecoKind[] = ["lips", "heart", "mwah", "star"];
const MAX = 12;
const stripW = () => (typeof window === "undefined" ? 164 : Math.round(Math.max(128, Math.min(176, (window.innerHeight - 350) / STRIP_H))));

export default function BoothScene({ m, gif, decos, setDecos, onNext }: { m: Mwah; gif: string; decos: Deco[]; setDecos: (fn: (d: Deco[]) => Deco[]) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"ready" | "shoot" | "decorate">(decos.length ? "decorate" : "ready");
  const [count, setCount] = useState<number | null>(null);
  const [shots, setShots] = useState(phase === "decorate" ? 4 : 0);
  const [flash, setFlash] = useState(0);
  const [drag, setDrag] = useState<{ kind: DecoKind; x: number; y: number; moved: boolean } | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const nextId = useRef(100);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const shoot = () => {
    if (phase !== "ready") return;
    setPhase("shoot");
    sfx("pop", { gain: 0.6 });
    const step = reduce ? 250 : 480;
    [3, 2, 1].forEach((n, i) =>
      later(() => {
        setCount(n);
        sfx("tick", { gain: 0.6, detune: i * 200 });
      }, i * step),
    );
    const t0 = 3 * step;
    for (let k = 0; k < 4; k++)
      later(() => {
        setCount(null);
        setFlash((f) => f + 1);
        sfx("kmw-shutter", { gain: 0.8 });
        sfx("kmw-print", { at: 0.2, gain: 0.5, dur: 0.45 });
        haptic(14);
        setShots(k + 1);
      }, t0 + k * (reduce ? 300 : 820));
    later(() => {
      sfx("chime", { gain: 0.6 });
      setPhase("decorate");
    }, t0 + 4 * (reduce ? 300 : 820) + 600);
  };

  const place = (kind: DecoKind, x: number, y: number) => {
    setDecos((ds) => (ds.length >= MAX ? ds : [...ds, { id: nextId.current++, kind, x, y, rot: Math.round(Math.random() * 40 - 20) }]));
    sfx(kind === "lips" ? "kmw-mwah" : "kmw-stick", { gain: 0.75, detune: Math.random() * 200 - 100 });
    haptic(10);
  };
  /** A spot on the frames: frame f, somewhere near a corner of it. */
  const autoSpot = (i: number) => {
    const f = i % 4;
    const top = GEO.head + f * (GEO.frameH + GEO.gap);
    const y = ((top + GEO.frameH * (0.25 + Math.random() * 0.5)) / STRIP_H) * 100;
    const x = i % 2 ? 72 + Math.random() * 14 : 14 + Math.random() * 14;
    return { x, y };
  };
  const decorateForMe = () => {
    const n = decos.length;
    KINDS.forEach((k, i) =>
      later(() => {
        const s = autoSpot(n + i);
        place(k, s.x, s.y);
      }, i * 160),
    );
  };

  // Dragging a sticker from the tray: a ghost follows the finger; dropping it
  // on the strip sticks it there. A tap (no movement) sticks it on by itself.
  useEffect(() => {
    if (!drag) return;
    let cur = drag;
    const move = (e: PointerEvent) => {
      cur = { ...cur, x: e.clientX, y: e.clientY, moved: cur.moved || Math.hypot(e.clientX - cur.x, e.clientY - cur.y) > 6 };
      setDrag(cur);
    };
    const up = (e: PointerEvent) => {
      const r = stripRef.current?.getBoundingClientRect();
      if (!cur.moved) {
        const s = autoSpot(decos.length);
        place(cur.kind, s.x, s.y);
      } else if (r && e.clientX >= r.left - 20 && e.clientX <= r.right + 20 && e.clientY >= r.top - 20 && e.clientY <= r.bottom + 20) {
        place(cur.kind, Math.max(4, Math.min(96, ((e.clientX - r.left) / r.width) * 100)), Math.max(3, Math.min(97, ((e.clientY - r.top) / r.height) * 100)));
        burst({ kind: "sparkles", origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }, count: 8, spread: 0.1 });
      }
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!drag, decos.length]);

  const visibleH = (k: number) => (k >= 4 ? STRIP_H : GEO.head + k * (GEO.frameH + GEO.gap) + (k ? 0 : 0.02));
  const dec = phase === "decorate";
  const [sw] = useState(stripW);

  return (
    <Scene label="Kiss-cam photo booth" className={`km-booth${dec ? " is-dec" : ""}`}>
      <motion.div {...rise(0)}>
        <Kicker>{dec ? "Your strip is ready" : "Kiss-cam"}</Kicker>
      </motion.div>
      <AnimatePresence mode="wait" initial={false}>
        {dec ? (
          <motion.div key="t2" className="km-boothHead" {...rise(1)}>
            <Title>
              Now <em>kiss it up</em>
            </Title>
            <Sub>Drag stickers onto it, or just tap one.</Sub>
          </motion.div>
        ) : (
          <motion.div key="t1" className="km-boothHead" {...rise(1)} exit={{ opacity: 0, y: -10 }}>
            <Title>
              Smile for the <em>booth</em>
            </Title>
            <Sub>Four photos of you two, coming right up.</Sub>
          </motion.div>
        )}
      </AnimatePresence>

      {!dec && (
        <motion.div className="km-machine" {...popIn(2)}>
          <span className="km-marquee">
            <span>Mwah Booth</span>
          </span>
          <span className="km-lens" aria-hidden>
            <span className="km-lensHeart" />
            {count && (
              <motion.span key={count} className="km-count" initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                {count}
              </motion.span>
            )}
          </span>
          <span className="km-machineGif">
            <Gif src={gif} size={86} tilt={10} eager />
          </span>
          <span className="km-slot" aria-hidden />
        </motion.div>
      )}

      {phase === "shoot" && (
        <div className="km-print" style={{ height: `calc(${sw}px * ${visibleH(shots)})` }}>
          <Strip m={m} shown={shots} width={`${sw}px`} decoPx={Math.round(sw * 0.427)} />
        </div>
      )}

      {dec && (
        <div className="km-decor">
          <motion.div className="km-decorStrip" {...popIn(2)}>
            <Strip ref={stripRef} m={m} decos={decos} width={`${sw}px`} decoPx={Math.round(sw * 0.427)} />
          </motion.div>
          <motion.div className="km-tray" role="group" aria-label="Stickers" {...rise(3)}>
            {KINDS.map((k) => (
              <button
                key={k}
                type="button"
                className="km-trayItem"
                aria-label={`Stick a ${k === "mwah" ? "mwah" : k} sticker on the strip`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setDrag({ kind: k, x: e.clientX, y: e.clientY, moved: false });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const s = autoSpot(decos.length);
                    place(k, s.x, s.y);
                  }
                }}
              >
                <DecoArt kind={k} m={m} size={62} />
              </button>
            ))}
            <span className="km-trayN">
              {decos.length}/{MAX}
            </span>
          </motion.div>
        </div>
      )}

      {drag?.moved && (
        <span className="km-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden>
          <DecoArt kind={drag.kind} m={m} size={70} />
        </span>
      )}
      {flash > 0 && <span key={flash} className="km-flash" aria-hidden />}

      <div className="km-foot">
        {phase === "ready" && (
          <motion.div {...popIn(4)}>
            <Puffy onClick={shoot}>Say cheese! 📸</Puffy>
          </motion.div>
        )}
        {dec && (
          <>
            {decos.length > 0 ? <Puffy onClick={onNext}>So cute. Next →</Puffy> : <Puffy onClick={decorateForMe}>Decorate it for me ✨</Puffy>}
            {decos.length > 0 ? <Quiet onClick={decorateForMe}>Add more for me ✨</Quiet> : <Quiet onClick={onNext}>Keep it plain</Quiet>}
          </>
        )}
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.km-boothHead { display: grid; justify-items: center; gap: 10px; }
.km-machine { position: relative; z-index: 2; width: min(290px, 78vw); height: 150px; margin-top: 10px; border-radius: 28px 28px 14px 14px; display: grid; justify-items: center; align-content: start;
  background: linear-gradient(180deg, #FF8FB5, #FF6F9C 60%, #F2558A); box-shadow: 0 0 0 4px #fff, 0 18px 34px -16px rgba(214,63,114,.7), inset 0 3px 0 rgba(255,255,255,.4); }
.km-marquee { margin-top: -16px; padding: 7px 18px; border-radius: 14px; background: #fff; box-shadow: 0 6px 14px -8px rgba(214,63,114,.6);
  background-image: radial-gradient(circle, #FFE27A 0 2.6px, transparent 3px); background-size: 14px 14px; background-position: 0 0; animation: km-lights 1s steps(2) infinite; }
.km-marquee span { display: block; padding: 2px 10px; border-radius: 8px; background: #fff; font: 400 20px/1 var(--km-display); color: var(--km-primary); }
@keyframes km-lights { to { background-position: 7px 0; } }
.km-lens { position: relative; margin-top: 14px; width: 70px; height: 70px; border-radius: 50%; display: grid; place-items: center;
  background: radial-gradient(circle at 35% 30%, #8E6A80 0, #3E2533 45%, #24121C 70%); box-shadow: 0 0 0 6px #fff, 0 0 0 9px #FFD1DF; }
.km-lensHeart { width: 22px; height: 20px; background: #FF9EBB; clip-path: path("M11 19 C4 14 0 10 0 6 C0 2 3 0 6 0 C8 0 10 1 11 3 C12 1 14 0 16 0 C19 0 22 2 22 6 C22 10 18 14 11 19 Z"); opacity: .8; }
.km-count { position: absolute; inset: 0; display: grid; place-items: center; font: 400 40px/1 var(--km-display); color: #fff; text-shadow: 0 2px 0 var(--km-deep); }
.km-machineGif { position: absolute; right: -18px; top: -30px; }
.km-slot { position: absolute; left: 50%; bottom: 12px; width: 62%; height: 10px; transform: translateX(-50%); border-radius: 6px; background: #8E2A52; box-shadow: inset 0 3px 4px rgba(0,0,0,.4), 0 1px 0 rgba(255,255,255,.5); }
.km-print { position: relative; margin-top: -24px; overflow: hidden; transition: height .5s var(--km-ease); z-index: 0; display: flex; align-items: flex-start; padding: 0 30px 24px; box-sizing: content-box; }
.km-print .km-strip { box-shadow: 0 14px 22px -14px rgba(214,63,114,.6); }
.km-decor { display: grid; grid-template-columns: auto auto; gap: 16px; align-items: center; justify-content: center; margin-top: 6px; }
.km-decorStrip { transform: rotate(-2deg); }
.km-tray { display: grid; gap: 10px; justify-items: center; padding: 12px 8px; border-radius: 26px; background: rgba(255,255,255,.75); box-shadow: 0 10px 24px -14px rgba(214,63,114,.5); }
.km-trayItem { all: unset; cursor: grab; width: 72px; height: 72px; display: grid; place-items: center; border-radius: 20px; background: #FFF0F5; touch-action: none; -webkit-tap-highlight-color: transparent;
  box-shadow: inset 0 0 0 2px #FFD1DF; animation: km-wiggle 3.4s ease-in-out infinite; }
.km-trayItem:nth-child(2) { animation-delay: .4s; } .km-trayItem:nth-child(3) { animation-delay: .8s; } .km-trayItem:nth-child(4) { animation-delay: 1.2s; }
.km-trayItem:focus-visible { outline: 3px solid var(--km-primary); outline-offset: 3px; }
.km-trayN { font: 600 12px/1 var(--km-ui); color: var(--km-ink2); }
.km-ghost { position: fixed; z-index: 300; transform: translate(-50%, -60%) scale(1.15) rotate(-8deg); pointer-events: none; filter: drop-shadow(0 10px 14px rgba(214,63,114,.4)); }
.km-flash { position: fixed; inset: 0; z-index: 200; pointer-events: none; background: #fff; animation: km-flash .5s ease-out forwards; }
@keyframes km-flash { 0% { opacity: 0; } 10% { opacity: .95; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .km-marquee, .km-trayItem { animation: none; } .km-flash { animation: km-flashR .4s ease forwards; } }
@keyframes km-flashR { 0% { opacity: .3; } 100% { opacity: 0; } }
`;
