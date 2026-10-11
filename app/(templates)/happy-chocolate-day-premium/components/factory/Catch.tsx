"use client";

// Station 4 · Quality control: a 15-second mini game. Chocolates, candies and lollipops tumble out of the factory
// chute; she slides the pink basket (drag anywhere in the box, or the arrow keys) to catch them and dodges the odd
// broccoli. Every catch is worth one of his "{catchPrize}" ("23 kisses I owe you"). It can't be lost.

import { useCallback, useEffect, useRef, useState } from "react";
import { fluentUrl } from "../../../_valentine/kit/premium";
import { GIF, prizeLine } from "./model";
import { Gif, Puffy, SlotGif, StationHead, reward, useStation } from "./ui";

const GAME_MS = 15000;
type Kind = "choc" | "candy" | "lolly" | "heart" | "broc";
const ART: Record<Exclude<Kind, "broc">, string> = { choc: fluentUrl("chocolate"), candy: fluentUrl("candy"), lolly: fluentUrl("lollipop"), heart: fluentUrl("sparkling-heart") };
const SIZE = 46;
const BASKET_W = 96;

interface Item {
  id: number;
  kind: Kind;
  x: number;
  y: number;
  vy: number;
  spin: number;
}

function Broccoli() {
  return (
    <svg viewBox="0 0 60 60" width={SIZE} height={SIZE} aria-hidden>
      <rect x="25" y="34" width="10" height="20" rx="4" fill="#9ED36A" />
      <circle cx="20" cy="26" r="12" fill="#5FB14E" />
      <circle cx="40" cy="26" r="12" fill="#5FB14E" />
      <circle cx="30" cy="17" r="13" fill="#6CC25A" />
      <circle cx="25" cy="23" r="2" fill="#24421B" />
      <circle cx="35" cy="23" r="2" fill="#24421B" />
      <path d="M26 30 Q30 27 34 30" fill="none" stroke="#24421B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Catch() {
  const { f, sfx, done } = useStation();
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [score, setScore] = useState(0);
  const [spawned, setSpawned] = useState<{ id: number; kind: Kind; x: number }[]>([]);
  const [left, setLeft] = useState(GAME_MS);
  const [pops, setPops] = useState<{ id: number; x: number; y: number; t: string }[]>([]);
  const area = useRef<HTMLDivElement>(null);
  const basket = useRef<HTMLDivElement>(null);
  const items = useRef(new Map<number, Item>());
  const els = useRef(new Map<number, HTMLDivElement>());
  const bx = useRef(0.5);
  const scoreRef = useRef(0);
  const nextId = useRef(1);
  const raf = useRef(0);

  const placeBasket = () => {
    const a = area.current;
    const b = basket.current;
    if (!a || !b) return;
    const w = a.clientWidth;
    b.style.transform = `translateX(${bx.current * (w - BASKET_W)}px)`;
  };

  const pop = (x: number, y: number, t: string) => {
    const id = nextId.current++;
    setPops((p) => [...p.slice(-5), { id, x, y, t }]);
    window.setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 700);
  };

  const finish = useCallback(() => {
    cancelAnimationFrame(raf.current);
    items.current.clear();
    setSpawned([]);
    setPhase("over");
    window.setTimeout(() => {
      reward(sfx, document.querySelector(".sf-catchOver"), { big: true, cue: "chime-cascade" });
      sfx("sf-ding", { gain: 0.5 });
      done();
    }, 200);
  }, [done, sfx]);

  const play = () => {
    if (phase === "play") return;
    scoreRef.current = 0;
    setScore(0);
    setPhase("play");
    setLeft(GAME_MS);
    sfx("pop", { gain: 0.5 });
  };

  useEffect(() => {
    if (phase !== "play") return;
    const a = area.current;
    if (!a) return;
    const t0 = performance.now();
    let last = t0;
    let spawnIn = 300;
    let lastSec = 15;
    const step = (now: number) => {
      const dt = Math.min(48, now - last) / 1000;
      last = now;
      const W = a.clientWidth;
      const H = a.clientHeight;
      const elapsed = now - t0;
      spawnIn -= dt * 1000;
      if (spawnIn <= 0 && elapsed < GAME_MS - 900) {
        spawnIn = 520 - Math.min(220, elapsed / 50);
        const r = Math.random();
        const kind: Kind = r < 0.12 ? "broc" : r < 0.2 ? "heart" : r < 0.55 ? "choc" : r < 0.8 ? "candy" : "lolly";
        const id = nextId.current++;
        const x = 8 + Math.random() * (W - SIZE - 16);
        items.current.set(id, { id, kind, x, y: -SIZE, vy: 150 + Math.random() * 80 + elapsed / 160, spin: (Math.random() - 0.5) * 240 });
        setSpawned((s) => [...s, { id, kind, x }]);
      }
      const top = H - 70;
      const bLeft = bx.current * (W - BASKET_W);
      let changed = false;
      items.current.forEach((it) => {
        it.y += it.vy * dt;
        const el = els.current.get(it.id);
        if (el) el.style.transform = `translate(${it.x}px, ${it.y}px) rotate(${((it.y / 200) * it.spin).toFixed(1)}deg)`;
        const cx = it.x + SIZE / 2;
        if (it.y + SIZE > top && it.y < top + 30 && cx > bLeft - 6 && cx < bLeft + BASKET_W + 6) {
          items.current.delete(it.id);
          changed = true;
          if (it.kind === "broc") {
            scoreRef.current = Math.max(0, scoreRef.current - 1);
            sfx("plush-squeak", { gain: 0.4, detune: -400 });
            pop(cx, top - 10, "ew 🥦");
          } else {
            const add = it.kind === "heart" ? 3 : 1;
            scoreRef.current += add;
            sfx(it.kind === "heart" ? "kiss" : "pop", { gain: 0.42, detune: (Math.random() - 0.5) * 300 });
            pop(cx, top - 10, `+${add}`);
            if (scoreRef.current % 10 === 0) sfx("sf-boing", { gain: 0.4 });
          }
          setScore(scoreRef.current);
        } else if (it.y > H) {
          items.current.delete(it.id);
          changed = true;
        }
      });
      if (changed) setSpawned((s) => s.filter((q) => items.current.has(q.id)));
      const remain = Math.max(0, GAME_MS - elapsed);
      const sec = Math.ceil(remain / 1000);
      if (sec !== lastSec) {
        lastSec = sec;
        setLeft(remain);
        if (sec <= 3 && sec > 0) sfx("tick", { gain: 0.35 });
      }
      if (remain <= 0) {
        finish();
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [phase, finish, sfx]);

  useEffect(placeBasket, [phase]);
  useEffect(() => {
    const onResize = () => placeBasket();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const steer = (clientX: number) => {
    const a = area.current;
    if (!a) return;
    const r = a.getBoundingClientRect();
    bx.current = Math.max(0, Math.min(1, (clientX - r.left - BASKET_W / 2) / (r.width - BASKET_W)));
    placeBasket();
  };

  return (
    <section className="sf-scene sf-catch" aria-label="Catch the chocolates">
      <StationHead kicker="Station 4 · Quality control" title="Catch the chocolates!" hint={phase === "ready" ? "Slide the basket. Skip the broccoli." : undefined} />
      <div className="sf-hud" aria-live="off">
        <span className="sf-score">
          <b>{score}</b> {f.catchPrize}
        </span>
        <span className="sf-timer" aria-label={`${Math.ceil(left / 1000)} seconds left`}>
          <i style={{ transform: `scaleX(${phase === "play" ? left / GAME_MS : phase === "over" ? 0 : 1})` }} />
        </span>
      </div>
      <div
        ref={area}
        className={`sf-playfield is-${phase}`}
        onPointerDown={(e) => {
          if (phase !== "play") return;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          steer(e.clientX);
        }}
        onPointerMove={(e) => {
          if (phase === "play" && (e.pointerType === "mouse" || e.buttons)) steer(e.clientX);
        }}
        tabIndex={phase === "play" ? 0 : -1}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            bx.current = Math.max(0, Math.min(1, bx.current + (e.key === "ArrowLeft" ? -0.12 : 0.12)));
            placeBasket();
          }
        }}
        aria-label="The game: move the basket left and right"
      >
        <div className="sf-chute" aria-hidden>
          <span>CHOCOLATE CHUTE</span>
        </div>
        {spawned.map((it) => {
          const id = it.id;
          return (
            <div
              key={id}
              className="sf-fall"
              ref={(el) => {
                if (el) els.current.set(id, el);
                else els.current.delete(id);
              }}
              style={{ transform: `translate(${it.x}px, -${SIZE}px)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {it.kind === "broc" ? <Broccoli /> : <img src={ART[it.kind]} alt="" width={SIZE} height={SIZE} draggable={false} />}
            </div>
          );
        })}
        {pops.map((p) => (
          <span key={p.id} className="sf-plus" style={{ left: p.x, top: p.y }}>
            {p.t}
          </span>
        ))}
        <div ref={basket} className="sf-basket" aria-hidden>
          <Gif src={GIF.penguinCookie} size={64} className="sf-basketBear" eager />
          <svg viewBox="0 0 100 50" width={BASKET_W} height={48}>
            <path d="M6 10 H94 L84 46 Q82 49 78 49 H22 Q18 49 16 46 Z" fill="#FF8FAB" />
            <path d="M6 10 H94" stroke="#D63F72" strokeWidth="6" strokeLinecap="round" />
            {[22, 38, 54, 70].map((x) => <path key={x} d={`M${x} 16 L${x + 2} 44`} stroke="#fff" strokeOpacity=".6" strokeWidth="3" strokeLinecap="round" />)}
            <path d="M38 30 c -4 -6 -14 -2 -8 6 l 8 7 l 8 -7 c 6 -8 -4 -12 -8 -6 z" fill="#fff" />
          </svg>
        </div>
        {phase === "ready" && (
          <div className="sf-catchStart">
            <Gif src={GIF.handMouth} size={84} tilt={-5} float eager />
            <Puffy onClick={play}>Start the line ▶</Puffy>
            <small>15 seconds · every chocolate counts</small>
          </div>
        )}
        {phase === "over" && (
          <div className="sf-catchOver">
            <SlotGif id="sf3-catch" size={100} tilt={-4} eager className="sf-popIn" />
            <b className="sf-overScore">{score}!</b>
            <p>
              That&apos;s <b>{prizeLine(score, f.catchPrize)}</b>.
              <br />
              {f.from} will pay up. Promise.
            </p>
            <button type="button" className="sf-link" onClick={play}>
              Play again ↺
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
