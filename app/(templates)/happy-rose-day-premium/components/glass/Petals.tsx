"use client";

// Scene 4 — Catch the Falling Petals (mini-game 1). Petals flutter down (sway + spin); one at a time carries the
// next word of the sender's hidden sentence. Cupped hands follow the finger along the bottom; catch the word-petal
// ("gh-catch", a melody note per word) and the word joins the line at the top. A missed word-petal simply falls
// again from the top — it cannot fail. "Let them fall" (or 6 s without a touch) guides the hands by themselves.
// On the last word the sentence glows ("gh-gold") with the pr3 sticker.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SkipChip, usePremium } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { SKIP_TOP } from "./styles";
import { SHADES, type Glass } from "./util";

type P = { x: number; y: number; vy: number; ph: number; sp: number; rot: number; word: boolean };

function Hands() {
  return (
    <svg viewBox="0 0 150 80" width="150" height="80" aria-hidden>
      <defs><linearGradient id="gh-hand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E8B796" /><stop offset="1" stopColor="#B9805E" /></linearGradient></defs>
      <path d="M8 22 C10 56 36 76 75 76 C114 76 140 56 142 22 C126 40 104 48 75 48 C46 48 24 40 8 22 Z" fill="url(#gh-hand)" stroke="#8A5A3E" strokeWidth="1.4" />
      <path d="M75 48 L75 74" stroke="#8A5A3E" strokeWidth="1.2" opacity=".6" />
      <path d="M22 34 C30 40 40 44 52 46 M128 34 C120 40 110 44 98 46" stroke="#8A5A3E" strokeWidth="1" fill="none" opacity=".5" />
    </svg>
  );
}

export function Petals({ g, sticker, onDone }: { g: Glass; sticker: ReactNode; onDone: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const words = g.words;
  const [got, setGot] = useState(0);
  const [auto, setAuto] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const handsRef = useRef<HTMLDivElement>(null);
  const petalEls = useRef<(HTMLDivElement | null)[]>([]);
  const spanEls = useRef<(HTMLSpanElement | null)[]>([]);
  const handX = useRef(0);
  const target = useRef(0);
  const gotRef = useRef(0);
  const autoRef = useRef(false);
  const lastTouch = useRef(0);
  const shade = SHADES[g.color];
  const done = got >= words.length;

  useEffect(() => {
    autoRef.current = auto;
  }, [auto]);
  useEffect(() => {
    gotRef.current = got;
  }, [got]);

  useEffect(() => {
    if (done) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    // the dock's reserved space, resolved to px (the custom property itself may be a calc())
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;visibility:hidden;height:var(--vw-dock-space, 0px)";
    (stage.current ?? document.body).appendChild(probe);
    const dock = probe.offsetHeight || 0;
    probe.remove();
    const handsY = H - dock - 104;
    handX.current = W / 2;
    target.current = W / 2;
    lastTouch.current = performance.now();
    const ps: P[] = Array.from({ length: 5 }, (_, i) => ({
      x: 30 + Math.random() * (W - 60), y: -60 - i * (H / 5), vy: 1.2 + Math.random() * 0.8, ph: Math.random() * 6, sp: 0.6 + Math.random() * 0.8, rot: Math.random() * 360, word: i === 0,
    }));
    let raf = 0;
    let last = performance.now();
    const respawn = (p: P, word: boolean) => {
      p.x = 40 + Math.random() * (W - 80);
      p.y = -70 - Math.random() * 120;
      p.vy = word ? 1.3 + Math.random() * 0.5 : 1.1 + Math.random() * 1;
      p.word = word;
    };
    const frame = (now: number) => {
      const dt = Math.min(2.5, (now - last) / 16.67);
      last = now;
      if (now - lastTouch.current > 6000 && !autoRef.current) setAuto(true);
      const wp = ps.find((p) => p.word);
      if (autoRef.current && wp) target.current = wp.x;
      handX.current += (target.current - handX.current) * Math.min(1, 0.22 * dt);
      if (handsRef.current) handsRef.current.style.transform = `translate3d(${handX.current - 75}px, ${handsY}px, 0)`;
      ps.forEach((p, i) => {
        p.y += p.vy * dt * (reduce ? 0.8 : 1);
        p.ph += 0.03 * dt * p.sp;
        const sx = reduce ? 0 : Math.sin(p.ph) * 28;
        p.rot += dt * (reduce ? 0 : 1.6 * p.sp);
        const x = p.x + sx;
        if (p.word && p.y > handsY - 26 && p.y < handsY + 30 && Math.abs(x - handX.current) < 72) {
          const k = gotRef.current;
          sfx("gh-catch", { count: k });
          haptic(8);
          gotRef.current = k + 1;
          setGot(k + 1);
          respawn(p, false);
          const next = ps.find((q) => q !== p && q.y < 0) ?? ps[(i + 1) % ps.length];
          next.word = gotRef.current < words.length;
          if (next.word) {
            next.y = -60;
            sfx("gh-whoosh", { at: 0.1 });
          }
        } else if (p.y > H + 40) respawn(p, p.word);
        const el = petalEls.current[i];
        if (el) {
          el.style.transform = `translate3d(${x - 30}px, ${p.y}px, 0) rotate(${p.word ? Math.sin(p.ph) * 14 : p.rot}deg)`;
          el.classList.toggle("is-word", p.word);
          const sp = spanEls.current[i];
          const txt = p.word ? words[gotRef.current] ?? "" : "";
          if (sp && sp.textContent !== txt) sp.textContent = txt;
        }
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const vis = () => {
      cancelAnimationFrame(raf);
      if (document.visibilityState === "visible") {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", vis);
    };
    // the field runs until the sentence is complete
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  useEffect(() => {
    if (done) sfx("gh-gold", { gain: 1.2 });
  }, [done, sfx]);

  return (
    <section className="gh-scene" aria-label="Catch the falling petals">
      <p className="gh-kick">Catch the falling petals</p>
      <div className={`gh-sentence${done ? " is-done" : ""}`} aria-live="polite" style={{ marginTop: 14 }}>
        {words.map((w, i) => <span key={i} className={i < got ? "is-on" : undefined}>{i < got ? w : "·"}</span>)}
      </div>
      {!done ? (
        <>
          <p className="gh-hint" style={{ marginTop: 10 }}>Move your hands under the petal with a word on it.</p>
          <div
            ref={stage}
            className="gh-petalStage"
            onPointerDown={(e) => { target.current = e.clientX; lastTouch.current = performance.now(); setAuto(false); }}
            onPointerMove={(e) => { if (e.pointerType === "mouse" || e.buttons) { target.current = e.clientX; lastTouch.current = performance.now(); } }}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} ref={(el) => { petalEls.current[i] = el; }} className="gh-petal" style={{ ["--pl" as string]: shade.light, ["--pb" as string]: shade.base }}>
                <i />
                <span ref={(el) => { spanEls.current[i] = el; }} />
              </div>
            ))}
            <div ref={handsRef} className="gh-hands"><Hands /></div>
          </div>
          <button type="button" className="gh-ghost" style={{ position: "relative", zIndex: 7, marginTop: 14 }} onClick={() => setAuto(true)} aria-pressed={auto}>
            {auto ? "They're falling into your hands…" : "Let them fall"}
          </button>
          <SkipChip onSkip={() => setGot(words.length)} delay={3000} style={{ ...SKIP_TOP, zIndex: 8 }} />
        </>
      ) : (
        <div className="gh-in" style={{ display: "grid", justifyItems: "center", gap: 12, marginTop: 18 }}>
          {sticker}
          <button type="button" className="gh-btn" onClick={onDone}>Open the book ▸</button>
        </div>
      )}
    </section>
  );
}
