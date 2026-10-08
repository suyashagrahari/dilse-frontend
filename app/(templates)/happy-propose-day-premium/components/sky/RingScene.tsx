"use client";

// Scene 5 — The ring (mini-game 1 lives here too). The drones' ring box "lands" as a real velvet box; their hand
// waits below. "If it's a yes… put it on." They DRAG THE RING along a curved guide onto the ring finger (the
// pointer is projected onto the curve, so it can't go astray; it snaps from 70 %, "sky-slide" while it moves,
// "sky-ring" as it clicks home, and the band then sits around the finger). "Put it on 💍" is the accessible YES.
// "Let me think 🙈" runs away from every touch ("sky-boing") with the sender's lines; after three it gives up and
// becomes "Okay okay YES 💍" (pp4). Dodges are reported as noDodges.

import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { usePremium } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { Hand, Ring, VelvetBox } from "./art";
import type { Sky } from "./util";

type Pt = { x: number; y: number };
const bez = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({ x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t * t * b.y });

export function RingScene({ sky, sticker, onYes }: { sky: Sky; sticker: ReactNode; onYes: (dodges: number) => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<{ a: Pt; c: Pt; b: Pt } | null>(null);
  const [t, setT] = useState(0);
  const [anim, setAnim] = useState(false);
  const [on, setOn] = useState(false);
  const [dodges, setDodges] = useState(0);
  const [chip, setChip] = useState<Pt>({ x: 0.66, y: -0.13 });
  const drag = useRef(false);
  const lastSlide = useRef(0);
  const done = useRef(false);
  const giveUp = dodges >= 3;

  // Where the ring rests (the box's cushion slit) and where it goes (the ring finger), in stage px.
  const measure = useCallback(() => {
    const s = stage.current?.getBoundingClientRect();
    const bx = boxRef.current?.getBoundingClientRect();
    const hd = handRef.current?.getBoundingClientRect();
    if (!s || !bx || !hd) return;
    const a = { x: bx.left - s.left + bx.width * 0.5, y: bx.top - s.top + bx.height * (92 / 150) - 22 };
    const b = { x: hd.left - s.left + hd.width * (101 / 240), y: hd.top - s.top + hd.height * (168 / 300) - 28 };
    const c = { x: Math.min(a.x, b.x) - s.width * 0.28, y: (a.y + b.y) / 2 };
    setPath({ a, c, b });
  }, []);
  useEffect(() => {
    const id = window.setTimeout(measure, 1050);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setOn(true);
    sfx("sky-ring", { gain: 1.2 });
    sfx("sparkle", { at: 0.1 });
    haptic([20, 40, 30]);
    window.setTimeout(() => onYes(dodges), reduce ? 400 : 1300);
  }, [sfx, onYes, dodges, reduce]);

  const glide = useCallback(
    (to: number) => {
      setAnim(true);
      setT(to);
      window.setTimeout(() => {
        setAnim(false);
        if (to >= 1) finish();
      }, reduce ? 50 : 650);
    },
    [finish, reduce],
  );

  const project = (p: Pt) => {
    if (!path) return t;
    let best = 0;
    let d = Infinity;
    for (let i = 0; i <= 48; i++) {
      const q = bez(path.a, path.c, path.b, i / 48);
      const dd = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
      if (dd < d) { d = dd; best = i / 48; }
    }
    return best;
  };
  const local = (e: RPointerEvent) => {
    const s = stage.current!.getBoundingClientRect();
    return { x: e.clientX - s.left, y: e.clientY - s.top };
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    if (on || !path) return;
    drag.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* fine */
    }
    sfx("sky-slide", { gain: 0.5 });
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const nt = Math.max(t, project(local(e)) * 0.98 + 0.02 * t);
    setT(nt);
    const now = performance.now();
    if (now - lastSlide.current > 140) {
      lastSlide.current = now;
      sfx("sky-slide", { gain: 0.35 + nt * 0.4, detune: nt * 500 });
    }
    if (nt > 0.97) {
      drag.current = false;
      glide(1);
    }
  };
  const up = () => {
    if (!drag.current) return;
    drag.current = false;
    glide(t >= 0.7 ? 1 : 0);
  };

  const flee = () => {
    if (giveUp || on) return;
    sfx("sky-boing");
    haptic(10);
    const nx = 0.02 + Math.random() * 0.62;
    const ny = 0.3 + Math.random() * 0.55;
    setChip({ x: nx, y: ny });
    setDodges((d) => d + 1);
  };

  const pos = path ? bez(path.a, path.c, path.b, t) : null;
  const scale = 1 - t * 0.35;
  const lines = sky.flee;

  return (
    <section className="sk-scene" aria-label="The ring" style={{ paddingBottom: 0 }}>
      <p className="sk-kick" style={{ marginTop: "calc(23vh - 116px)" }}>{on ? "It's on." : "If it's a yes…"}</p>
      <h2 className="sk-h" style={{ fontSize: "clamp(30px, 8vw, 48px)" }}>{on ? "Perfect fit." : "put it on."}</h2>
      <div className="sk-ringRow">
        {!on && <button type="button" className="sk-btn" onClick={() => glide(1)}>Put it on 💍</button>}
      </div>
      <div className="sk-ringStage" ref={stage}>
        <div className={`sk-box${reduce ? "" : " is-land"}`} ref={boxRef}><VelvetBox id="skbox" /></div>
        <div className="sk-handWrap" ref={handRef}><Hand tone={sky.hand} ringOn={on} stone={sky.stone} id="skhand" /></div>
        {!on && pos && (
          <div
            className="sk-ring"
            style={{ transform: `translate(${pos.x - 27}px, ${pos.y - 30}px) scale(${scale}) rotate(${t * -14}deg)`, transition: anim ? "transform .6s cubic-bezier(.3,1.2,.4,1)" : "none" }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            role="slider"
            aria-label="Slide the ring onto their finger"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(t * 100)}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "ArrowDown" || e.key === "ArrowRight") glide(Math.min(1, t + 0.25)); if (e.key === "Enter") glide(1); }}
          >
            <Ring style={sky.ring} stone={sky.stone} id="skring" size={54} />
          </div>
        )}
        {!on && (
          <>
            <button
              type="button"
              className={`sk-flee${giveUp ? " is-yes" : ""}`}
              style={{ left: `${chip.x * 100}%`, top: `${chip.y * 100}%` }}
              onPointerDown={giveUp ? undefined : (e) => { e.preventDefault(); flee(); }}
              onClick={giveUp ? () => glide(1) : flee}
            >
              {giveUp ? "Okay okay YES 💍" : "Let me think 🙈"}
            </button>
            {dodges > 0 && !giveUp && <span key={dodges} className="sk-fleeLine" style={{ left: `${Math.min(70, chip.x * 100)}%`, top: `calc(${chip.y * 100}% - 26px)` }}>{lines[(dodges - 1) % lines.length]}</span>}
            {giveUp && <span style={{ position: "absolute", right: 0, top: "46%" }}>{sticker}</span>}
          </>
        )}
      </div>
    </section>
  );
}
