"use client";

// Room 5 · The kitchen. Snack time: cookies, honey pots, strawberries and hearts fall from the shelf, and she
// slides him left and right (drag anywhere in the kitchen) to catch them in his bowl: munch, a little burst, his
// tummy count goes up. Every few catches unlock one of the sender's house rules, stuck on the fridge with a
// magnet. When every rule is up, he's full (and very happy). "Feed him for me" after a few seconds.

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import type { TeddyItem } from "../../../_valentine/days/happy-teddy-day-premium";
import { HeldBowl, Teddy, Treat, type Mood } from "./art";
import { HAND } from "./fonts";
import { GIF } from "./gifs";
import { TH, type House } from "./model";
import { Gif, Header, Hint, Later, POP, Puffy, TextLink } from "./ui";

type Kind = "cookie" | "honey" | "berry" | "heart";
const KINDS: Kind[] = ["cookie", "honey", "cookie", "berry", "heart", "cookie", "honey", "berry"];
const PER_RULE = 2;
const FIELD_H = 330;
const BOWL_Y = FIELD_H - 66;
const MAGNETS = ["#FF8FAB", "#F2B36B", "#7FD1B0", "#8FC7FF", "#C9A7FF"];

interface Drop {
  id: number;
  x: number;
  kind: Kind;
  born: number;
  dur: number;
}

export default function Snack({ h, step, total, name, worn, onNext }: { h: House; step: number; total: number; name: string; worn: TeddyItem[]; onNext: () => void }) {
  const reduce = useReducedMotion();
  const rules = h.rules;
  const need = rules.length * PER_RULE;
  const [drops, setDrops] = useState<Drop[]>([]);
  const [caught, setCaught] = useState(0);
  const [mood, setMood] = useState<Mood>("open");
  const [started, setStarted] = useState(false);
  const field = useRef<HTMLDivElement>(null);
  const teddy = useRef<HTMLDivElement>(null);
  const tx = useRef(0.5);
  const live = useRef<Drop[]>([]);
  const caughtRef = useRef(0);
  const seq = useRef(0);
  const moodT = useRef<number | null>(null);

  const unlocked = Math.min(rules.length, Math.floor(caught / PER_RULE));
  const full = unlocked >= rules.length;

  const place = (fx: number) => {
    tx.current = Math.max(0.1, Math.min(0.9, fx));
    if (teddy.current) teddy.current.style.left = `${tx.current * 100}%`;
  };

  const onMove = (e: React.PointerEvent) => {
    const r = field.current?.getBoundingClientRect();
    if (!r) return;
    if (!started) setStarted(true);
    place((e.clientX - r.left) / r.width);
  };

  const catchOne = useCallback(
    (d: Drop) => {
      live.current = live.current.filter((x) => x.id !== d.id);
      setDrops([...live.current]);
      caughtRef.current += 1;
      const c = caughtRef.current;
      setCaught(c);
      sfx("th-munch", { gain: 0.7, detune: Math.random() * 300 });
      haptic(10);
      setMood("love");
      if (moodT.current) window.clearTimeout(moodT.current);
      moodT.current = window.setTimeout(() => setMood("happy"), 500);
      const r = teddy.current?.getBoundingClientRect();
      if (r) burst({ kind: "sparkles", origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.5) / window.innerHeight }, count: 6, emojis: d.kind === "heart" ? ["💗", "💖"] : ["✨", "⭐"] });
      if (c % PER_RULE === 0 && c / PER_RULE <= rules.length) {
        sfx("chime", { gain: 0.5, at: 0.1 });
        sfx("th-boing", { gain: 0.4, at: 0.25 });
        haptic([15, 40, 25]);
      }
    },
    [rules.length],
  );

  // spawn + physics loop (DOM transforms only; React state changes only on spawn/catch/miss)
  useEffect(() => {
    if (full) return;
    let raf = 0;
    let lastSpawn = 0;
    const tick = (now: number) => {
      const r = field.current?.getBoundingClientRect();
      if (r && now - lastSpawn > (reduce ? 900 : 640)) {
        lastSpawn = now;
        // aim most drops near him so it never feels hopeless
        const near = Math.random() < 0.55;
        const x = near ? Math.max(0.1, Math.min(0.9, tx.current + (Math.random() - 0.5) * 0.5)) : 0.1 + Math.random() * 0.8;
        const d: Drop = { id: ++seq.current, x, kind: KINDS[seq.current % KINDS.length], born: now, dur: reduce ? 3200 : 2500 + Math.random() * 700 };
        live.current = [...live.current, d];
        setDrops(live.current);
      }
      let changed = false;
      for (const d of live.current) {
        const p = (now - d.born) / d.dur;
        const y = -50 + p * (FIELD_H + 80);
        const el = document.getElementById(`th-drop-${d.id}`);
        if (el) el.style.transform = `translate(-50%, ${y}px) rotate(${p * 220 * (d.id % 2 ? 1 : -1)}deg)`;
        if (y > BOWL_Y - 16 && y < BOWL_Y + 14 && Math.abs(d.x - tx.current) * (r?.width ?? 360) < 52) {
          catchOne(d);
          changed = true;
          break;
        }
        if (p > 1) {
          live.current = live.current.filter((x) => x.id !== d.id);
          changed = true;
        }
      }
      if (changed) setDrops([...live.current]);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const hide = () => document.hidden && cancelAnimationFrame(raf);
    document.addEventListener("visibilitychange", hide);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [full, reduce, catchOne]);

  useEffect(() => {
    if (!full) return;
    live.current = [];
    sfx("chime-cascade", { gain: 0.5 });
    burst({ kind: "hearts", origin: { x: 0.5, y: 0.5 }, count: 18, emojis: ["💗", "🍪", "🍯", "✨"] });
  }, [full]);

  useEffect(() => () => {
    if (moodT.current) window.clearTimeout(moodT.current);
  }, []);

  const feedForMe = () => {
    caughtRef.current = need;
    setCaught(need);
  };

  return (
    <div className={`th-scene th-snack${full ? " is-full" : ""}`}>
      <Header
        step={step}
        total={total}
        room="Room 5 · The kitchen"
        title={full ? <>Full tummy, happy {name}</> : <>Snack time for <em>{name}</em></>}
        sub={full ? "And every house rule is on the fridge." : "Slide him left and right to catch the treats. Each few unlock a house rule."}
      />

      {!full ? (
        <div className="th-kitchen" ref={field} onPointerMove={onMove} onPointerDown={onMove} style={{ height: FIELD_H }}>
          <span className="th-shelfLine" aria-hidden />
          {drops.map((d) => (
            <span key={d.id} id={`th-drop-${d.id}`} className="th-drop" style={{ left: `${d.x * 100}%` }} aria-hidden>
              <Treat kind={d.kind} size={d.kind === "heart" ? 36 : 42} />
            </span>
          ))}
          <div ref={teddy} className="th-snackTeddy" style={{ left: "50%" }}>
            <Teddy size={130} mood={mood} pose="hold" worn={worn} heart held={<HeldBowl />} />
          </div>
          <AnimatePresence>
            {unlocked > 0 && (
              <motion.div key={unlocked} className="th-ruleToast" initial={{ scale: 0.4, y: -20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={POP}>
                <b>House rule #{unlocked}</b>
                <span>{rules[unlocked - 1]}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <span className="th-score" aria-live="polite">
            🍪 {caught} · rule {Math.min(unlocked + 1, rules.length)} of {rules.length}
          </span>
          {!started && <span className="th-slideHint" aria-hidden>👈 slide 👉</span>}
        </div>
      ) : (
        <motion.div className="th-fridge" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={POP}>
          <span className="th-fridgeHandle" aria-hidden />
          <p className="th-fridgeTitle">House rules for {name}</p>
          <ol>
            {rules.map((r, i) => (
              <motion.li key={i} initial={{ scale: 0.5, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: i % 2 ? 1.5 : -1.5, opacity: 1 }} transition={{ ...POP, delay: 0.12 * i }}>
                <i style={{ background: MAGNETS[i % MAGNETS.length] }} aria-hidden />
                {r}
              </motion.li>
            ))}
          </ol>
          <span className="th-fridgeTeddy">
            <Teddy size={96} mood="love" pose="hug" worn={worn} heart />
          </span>
          <Gif src={GIF.cookie} size={84} tilt={10} className="th-cookieGif" eager />
        </motion.div>
      )}

      <div className="th-foot">
        {full ? (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...POP, delay: 0.6 }}>
            <Puffy onClick={onNext}>Is that the phone? ☎️</Puffy>
          </motion.div>
        ) : (
          <>
            <Hint>{need - caught} more treats</Hint>
            <Later ms={7000}>
              <TextLink onClick={feedForMe}>Feed him for me</TextLink>
            </Later>
          </>
        )}
      </div>
      <style>{SNACK_CSS}</style>
    </div>
  );
}

const SNACK_CSS = `
.th-kitchen { position: relative; width: min(100%, 380px); border-radius: 28px; overflow: hidden; touch-action: none; cursor: ew-resize; -webkit-user-select: none; user-select: none;
  box-shadow: 0 0 0 3px #fff inset, 0 0 0 6px #F2D3B8, 0 16px 30px rgba(201,138,75,.22);
  background-image: linear-gradient(90deg, rgba(255,143,171,.12) 1px, transparent 1px), linear-gradient(rgba(255,143,171,.12) 1px, transparent 1px); background-size: 28px 28px; background-color: #FFFDF8; }
.th-shelfLine { position: absolute; left: 0; right: 0; top: 0; height: 18px; background: repeating-linear-gradient(90deg, #FF9DBA 0 18px, #fff 18px 36px); border-bottom: 3px solid #fff; }
.th-drop { position: absolute; top: 0; z-index: 2; will-change: transform; transform: translate(-50%, -60px); filter: drop-shadow(0 3px 3px rgba(120,70,30,.25)); }
.th-snackTeddy { position: absolute; bottom: -8px; z-index: 3; transform: translateX(-50%); transition: left .08s linear; }
.th-ruleToast { position: absolute; top: 28px; left: 12px; right: 12px; z-index: 4; display: grid; gap: 2px; padding: 10px 14px; border-radius: 18px; background: #FFF3C9; text-align: left;
  box-shadow: 0 0 0 3px #fff inset, 0 8px 18px rgba(201,138,75,.25); }
.th-ruleToast b { font: 800 11px/1 var(--font-th-body), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: ${TH.honeyDeep}; }
.th-ruleToast span { font: 400 20px/1.2 ${HAND}; color: ${TH.ink}; }
.th-score { position: absolute; right: 10px; bottom: 10px; z-index: 4; padding: 5px 10px; border-radius: 99px; background: #fff; font: 800 12.5px/1 var(--font-th-body), sans-serif; color: ${TH.inkSoft}; box-shadow: 0 2px 6px rgba(120,70,30,.15); }
.th-slideHint { position: absolute; left: 50%; bottom: 140px; transform: translateX(-50%); font: 800 15px/1 var(--font-th-body), sans-serif; color: ${TH.pinkDeep}; animation: th-breath 1.6s ease-in-out infinite; white-space: nowrap; }
.th-fridge { position: relative; width: min(100%, 360px); padding: 22px 18px 92px; border-radius: 30px; text-align: left; background: linear-gradient(180deg, #E8F6FF, #D3ECFF);
  box-shadow: 0 0 0 4px #fff inset, 0 0 0 7px #BFD9F0, 0 18px 34px rgba(90,155,224,.22); }
.th-fridgeHandle { position: absolute; right: 16px; top: 30px; width: 10px; height: 70px; border-radius: 6px; background: #fff; box-shadow: 0 2px 0 #A9C8E4; }
.th-fridgeTitle { margin: 0 0 10px; font: 800 12px/1 var(--font-th-body), sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #4A78A8; }
.th-fridge ol { list-style: none; margin: 0; padding: 0 18px 0 0; display: grid; gap: 10px; }
.th-fridge li { position: relative; padding: 10px 14px 10px 16px; border-radius: 6px; background: #FFFDF8; font: 400 19px/1.2 ${HAND}; color: ${TH.ink}; box-shadow: 0 4px 10px rgba(74,120,168,.18); }
.th-fridge li i { position: absolute; top: -7px; left: 50%; width: 18px; height: 18px; margin-left: -9px; border-radius: 50%; box-shadow: 0 2px 0 rgba(0,0,0,.12), 0 0 0 2px #fff inset; }
.th-fridgeTeddy { position: absolute; left: 14px; bottom: -10px; }
.th-cookieGif { position: absolute; right: 8px; bottom: 6px; }
.th-kitchen::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 56px; background: #FBE2C8; box-shadow: 0 3px 0 #fff inset; z-index: 1; }
`;
