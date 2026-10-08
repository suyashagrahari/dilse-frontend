"use client";

// Room 2 — Catch the kisses (mini-game 1). X's, hearts and lip-prints fall
// like petals; drag anywhere to slide the glass heart jar under them (or tap
// a kiss to catch it). Every catch is a "mwah" climbing a C-pentatonic, and
// the "A kiss for…" slips pop out at even steps. It never fails: misses keep
// falling. Reduced motion: no falling — tap "Blow a kiss into the jar".

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { sfx } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { HeartJar, Lips } from "./art";
import { HAND } from "./fonts";
import type { Kisses } from "./model";
import { Hint, Kicker, Quiet, Room, Satin, Title } from "./ui";

const PENTA = [0, 200, 400, 700, 900];
type Drop = { id: number; x: number; y: number; vy: number; rot: number; vr: number; kind: 0 | 1 | 2 };

export default function Catch({ k, sticker, onNext }: { k: Kisses; sticker: ReactNode; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const [slip, setSlip] = useState<{ text: string; n: number } | null>(null);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [jarX, setJarX] = useState(0.5);
  const arena = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<number, HTMLElement>());
  const state = useRef({ drops: [] as Drop[], jar: 0.5, count: 0, next: 1 });
  const done = count >= k.target;
  // Slips at even steps through the target.
  const at = useMemo(() => k.notes.map((_, i) => Math.max(1, Math.round(((i + 1) * k.target) / (k.notes.length + 0.6)))), [k.notes, k.target]);

  const caught = () => {
    const s = state.current;
    if (s.count >= k.target) return;
    s.count += 1;
    const n = s.count;
    setCount(n);
    sfx("kd-mwah", { detune: PENTA[(n - 1) % 5] + Math.floor((n - 1) / 5) * 1200 - 1200, gain: 0.9 });
    haptic(8);
    const i = at.indexOf(n);
    if (i >= 0) {
      setSlip({ text: k.notes[i], n });
      sfx("paper-rustle", { at: 0.1, gain: 0.4 });
    }
    if (n >= k.target) {
      sfx("chime-cascade", { at: 0.2, gain: 0.7 });
      haptic([20, 40, 20]);
    }
  };

  // The fall.
  useEffect(() => {
    if (reduce || done) return;
    let raf = 0;
    let last = performance.now();
    let spawnAt = 0;
    const loop = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;
      const a = arena.current;
      const W = a?.clientWidth ?? 360;
      const H = a?.clientHeight ?? 480;
      const s = state.current;
      if (now > spawnAt && s.drops.length < 9) {
        spawnAt = now + 520 + Math.random() * 380;
        const d: Drop = { id: s.next++, x: 0.08 + Math.random() * 0.84, y: -40, vy: 1.5 + Math.random() * 1.3, rot: Math.random() * 40 - 20, vr: (Math.random() - 0.5) * 1.5, kind: (Math.floor(Math.random() * 3) as 0 | 1 | 2) };
        s.drops = [...s.drops, d];
        setDrops(s.drops);
      }
      const jarTop = H - 92;
      let changed = false;
      for (const d of s.drops) {
        d.y += d.vy * dt;
        d.x += Math.sin((now / 700) + d.id) * 0.0009 * dt;
        d.rot += d.vr * dt;
        const el = els.current.get(d.id);
        if (el) el.style.transform = `translate(${d.x * W - 20}px, ${d.y}px) rotate(${d.rot}deg)`;
      }
      const keep: Drop[] = [];
      for (const d of s.drops) {
        const inJar = d.y > jarTop && d.y < jarTop + 46 && Math.abs(d.x - s.jar) * W < 52;
        if (inJar) {
          caught();
          changed = true;
        } else if (d.y > H + 10) changed = true;
        else keep.push(d);
      }
      if (changed) {
        s.drops = keep;
        setDrops(keep);
      }
      if (s.count < k.target) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, done, k.target]);

  const move = (e: React.PointerEvent) => {
    const r = arena.current?.getBoundingClientRect();
    if (!r) return;
    const x = Math.max(0.1, Math.min(0.9, (e.clientX - r.left) / r.width));
    state.current.jar = x;
    setJarX(x);
  };
  const tapDrop = (id: number) => {
    const s = state.current;
    s.drops = s.drops.filter((d) => d.id !== id);
    setDrops(s.drops);
    caught();
  };

  const glyph = (kind: 0 | 1 | 2) =>
    kind === 0 ? <span className="kd-x" style={{ color: k.S.c }}>x</span> : kind === 1 ? <span className="kd-h" style={{ color: k.S.hi }}>♥</span> : <Lips color={k.S.c} size={40} cute={!k.lipstick} />;

  return (
    <Room label="Catch the kisses" className="kd-catch">
      <Kicker>{done ? "The jar is full" : `${count} of ${k.target} kisses`}</Kicker>
      <Title>{done ? "Every one of them caught" : "Catch the kisses"}</Title>
      <div
        ref={arena}
        className="kd-arena"
        onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); move(e); }}
        onPointerMove={move}
        role="application"
        aria-label={`Kisses are falling. Slide the jar to catch them. ${count} of ${k.target} caught.`}
      >
        {drops.map((d) => (
          <button
            key={d.id}
            type="button"
            ref={(el) => { if (el) els.current.set(d.id, el); else els.current.delete(d.id); }}
            className="kd-drop"
            onPointerDown={(e) => { e.stopPropagation(); tapDrop(d.id); }}
            aria-label="Catch this kiss"
            tabIndex={-1}
          >
            {glyph(d.kind)}
          </button>
        ))}
        {slip && (
          <p key={slip.n} className="kd-slip" style={{ fontFamily: HAND }}>
            {slip.text}
          </p>
        )}
        <div className="kd-jar" style={{ left: `${jarX * 100}%` }}>
          <HeartJar fill={Math.min(1, count / k.target)} shade={k.S.c} />
        </div>
        <span className="kd-jarSticker">{sticker}</span>
      </div>
      {done ? (
        <Satin big onClick={() => { sfx("whoosh", { gain: 0.5 }); onNext(); }}>Open the jar →</Satin>
      ) : reduce ? (
        <Satin onClick={caught}>Blow a kiss into the jar 😘</Satin>
      ) : (
        <>
          <Hint>Slide the jar under the falling kisses</Hint>
          <Quiet onClick={() => { for (let i = state.current.count; i < k.target; i++) window.setTimeout(caught, (i - state.current.count) * 90); }}>Fill it for me</Quiet>
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.kd-catch { gap: 10px; }
.kd-arena { position: relative; width: 100%; max-width: 440px; height: min(44vh, 400px); min-height: 280px; border-radius: 28px; overflow: hidden; touch-action: none; cursor: grab;
  background: radial-gradient(100% 70% at 50% 0%, rgba(255,255,255,.75), rgba(255,240,244,.35) 60%, rgba(249,213,220,.4)); border: 1px solid rgba(122,15,46,.12);
  box-shadow: inset 0 -30px 60px -40px rgba(122,15,46,.35); }
.kd-drop { all: unset; position: absolute; left: 0; top: 0; width: 40px; height: 40px; display: grid; place-items: center; cursor: pointer; will-change: transform; }
.kd-x { font: 700 34px/1 var(--font-kd-hand), cursive; }
.kd-h { font: 400 30px/1 system-ui, sans-serif; }
.kd-jar { position: absolute; bottom: 10px; width: 104px; height: 100px; transform: translateX(-50%); transition: left .06s linear; pointer-events: none;
  filter: drop-shadow(0 12px 18px rgba(122,15,46,.35)); }
.kd-jarSticker { position: absolute; right: 8px; top: 8px; pointer-events: none; }
.kd-slip { position: absolute; left: 50%; top: 18%; width: 82%; margin: 0; transform: translateX(-50%); padding: 10px 14px; border-radius: 4px; pointer-events: none;
  background: #FFFDF8; color: var(--vw-ink); font-size: 22px; line-height: 1.15; box-shadow: 0 10px 24px -10px rgba(60,6,20,.45); animation: kd-slip 3.4s ease forwards; }
@keyframes kd-slip { 0% { opacity: 0; transform: translate(-50%, 30px) rotate(-3deg) scale(.9); } 12% { opacity: 1; transform: translate(-50%, 0) rotate(-2deg); } 80% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -24px) rotate(1deg); } }
@media (prefers-reduced-motion: reduce) { .kd-slip { animation: none; } }
`;
