"use client";

// Room 1 · The nursery. He's asleep: a teddy needs a heart to wake up (the Build-a-Bear heart ceremony, made
// ours). 1) Rub the little satin heart until it's warm (it blushes deeper, a ring fills, soft swishes). 2) Give it a
// kiss for luck (a lipstick mark lands on it). 3) Drag it into his chest (or tap him): it glows there, he yawns,
// opens his eyes, waves, and says his first words. 4) She names him: the sender's pick first, a few cute ones, or
// her own; the name tag stitches on. Every step has a "do it for me".

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import { SatinHeart, Teddy, type Mood } from "./art";
import { HAND } from "./fonts";
import { GIF } from "./gifs";
import { TH, type House } from "./model";
import { Bubble, Gif, Header, Hint, Later, POP, Puffy, TextLink } from "./ui";

type Phase = "rub" | "kiss" | "place" | "awake" | "name" | "named";
const NAME_IDEAS = ["Mr. Cuddles", "Golu", "Honey", "Bhalu", "Mochi"];

export default function Heart({
  h, cheer, step, total, name, onName, onNext,
}: { h: House; cheer: string | null; step: number; total: number; name: string; onName: (n: string) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("rub");
  const [warm, setWarm] = useState(0);
  const [kissed, setKissed] = useState(false);
  const [mood, setMood] = useState<Mood>("sleep");
  const [typed, setTyped] = useState("");
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, reduce ? Math.min(ms, 200) : ms));
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  // ── 1 · rub ──
  const last = useRef<{ x: number; y: number } | null>(null);
  const travelled = useRef(0);
  const lastCue = useRef(0);
  const quarter = useRef(0);
  const heartRef = useRef<HTMLDivElement>(null);
  const warmed = () => {
    setWarm(1);
    setPhase("kiss");
    haptic([15, 40, 25]);
    sfx("chime", { gain: 0.55 });
    burst({ kind: "sparkles", origin: { x: 0.5, y: 0.5 }, count: 16, emojis: ["✨", "💗", "💖"] });
  };
  const onRub = (e: React.PointerEvent) => {
    if (phase !== "rub") return;
    const pt = { x: e.clientX, y: e.clientY };
    if (last.current) travelled.current += Math.hypot(pt.x - last.current.x, pt.y - last.current.y);
    last.current = pt;
    const w = Math.min(1, travelled.current / 1100);
    setWarm(w);
    const now = performance.now();
    if (now - lastCue.current > 110) {
      lastCue.current = now;
      sfx("th-rub", { gain: 0.5, detune: w * 500 });
    }
    const q = Math.floor(w * 4);
    if (q > quarter.current) {
      quarter.current = q;
      haptic(10);
      if (q < 4) sfx("sparkle", { gain: 0.25, detune: q * 200 });
    }
    if (w >= 1) warmed();
  };

  // ── 2 · kiss ──
  const kiss = () => {
    if (phase !== "kiss" || kissed) return;
    setKissed(true);
    sfx("kiss", { gain: 0.6 });
    haptic(12);
    later(() => setPhase("place"), 1100);
  };

  // ── 3 · place ──
  const chest = useRef<HTMLDivElement>(null);
  const place = () => {
    if (phase !== "place") return;
    setPhase("awake");
    haptic([20, 30, 20, 30, 60]);
    sfx("heartbeat", { gain: 0.5 });
    sfx("th-yawn", { gain: 0.7, at: 0.7 });
    later(() => {
      setMood("open");
      sfx("plush-squeak", { gain: 0.6 });
      sfx("chime-cascade", { gain: 0.45, at: 0.2 });
      burst({ kind: "hearts", origin: { x: 0.5, y: 0.42 }, count: 22, emojis: ["💗", "💖", "✨", "🧸"] });
    }, 1500);
    later(() => setPhase("name"), 4600);
  };
  const onDragEnd = (_: unknown, info: { point: { x: number; y: number } }) => {
    const r = chest.current?.getBoundingClientRect();
    if (!r) return;
    // info.point is page coordinates
    const x = info.point.x - window.scrollX;
    const y = info.point.y - window.scrollY;
    if (x > r.left - 40 && x < r.right + 40 && y > r.top - 60 && y < r.bottom + 60) place();
  };

  // ── 4 · name ──
  const ideas = [h.teddyName, ...NAME_IDEAS.filter((n) => n.toLowerCase() !== h.teddyName.toLowerCase())].slice(0, 4);
  const pick = (n: string) => {
    const clean = n.trim().slice(0, 20);
    if (!clean) return;
    onName(clean);
    setPhase("named");
    setMood("happy");
    sfx("th-stitch", { gain: 0.7 });
    sfx("th-boing", { gain: 0.5, at: 0.4 });
    haptic([15, 40, 25]);
    burst({ kind: "confetti", count: 50, colors: ["#FF8FAB", "#F2B36B", "#FFE27A", "#BDEBD6"] });
  };

  const awake = phase === "awake" || phase === "name" || phase === "named";
  const title =
    phase === "rub" ? <>He needs a <em>heart</em> to wake up</> :
    phase === "kiss" ? <>It&apos;s warm! Now a kiss for luck</> :
    phase === "place" ? <>Tuck it into his chest</> :
    phase === "awake" ? <>He&apos;s waking up…</> :
    phase === "name" ? <>What should we call him?</> :
    <>Say hi to <em>{name}</em></>;

  return (
    <div className={`th-scene th-heartRoom is-${phase}`}>
      <Header step={step} total={total} room="Room 1 · The nursery" title={title} sub={phase === "rub" ? "Rub the little heart with your finger to warm it up." : undefined} />

      <div className="th-nursery">
        {(phase === "rub" || phase === "kiss") && (
          <motion.div className="th-heartPad" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={POP}>
            <div
              ref={heartRef}
              className={`th-rubZone${phase === "kiss" ? " is-kiss" : ""}`}
              onPointerDown={(e) => {
                last.current = { x: e.clientX, y: e.clientY };
                (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
              }}
              onPointerMove={(e) => (e.buttons || e.pointerType !== "mouse" ? onRub(e) : undefined)}
              onPointerUp={() => (last.current = null)}
              onClick={phase === "kiss" ? kiss : undefined}
              role={phase === "kiss" ? "button" : undefined}
              aria-label={phase === "kiss" ? "Kiss the heart" : "Rub the heart"}
            >
              <svg className="th-ring" viewBox="0 0 100 100" aria-hidden>
                <circle cx={50} cy={50} r={46} fill="none" stroke="#FFE4EC" strokeWidth={5} />
                <circle cx={50} cy={50} r={46} fill="none" stroke={TH.pinkDeep} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${warm * 289} 289`} transform="rotate(-90 50 50)" />
              </svg>
              <motion.span className="th-satin" animate={phase === "kiss" ? { scale: [1, 1.08, 1] } : { scale: 1 + warm * 0.06 }} transition={phase === "kiss" ? { duration: 1.1, repeat: Infinity } : { duration: 0.2 }}>
                <SatinHeart size={150} warm={warm} />
                <AnimatePresence>
                  {kissed && (
                    <motion.span className="th-lips" initial={{ scale: 2.4, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: -12 }} transition={POP} aria-hidden>
                      💋
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
              {phase === "rub" && <span className="th-rubFinger" aria-hidden>👆</span>}
            </div>
            <span className="th-warmth" aria-live="polite">
              {phase === "rub" ? (warm < 0.34 ? "a little cold…" : warm < 0.7 ? "getting warmer…" : "almost there!") : kissed ? "lucky heart ✨" : "tap the heart to kiss it"}
            </span>
          </motion.div>
        )}

        {(phase === "place" || awake) && (
          <div className="th-wake">
            <AnimatePresence>
              {(phase === "awake" || phase === "name") && mood !== "sleep" && (
                <Bubble k="first" className="th-firstWords">
                  {h.firstWords}
                </Bubble>
              )}
              {phase === "named" && (
                <Bubble k="named" className="th-firstWords">
                  {name}! I love it. That&apos;s me now. 🧸
                </Bubble>
              )}
            </AnimatePresence>
            <motion.div
              className="th-wakeTeddy"
              ref={chest}
              onClick={phase === "place" ? place : undefined}
              role={phase === "place" ? "button" : undefined}
              aria-label={phase === "place" ? "Give him the heart" : undefined}
              animate={mood === "open" && phase === "awake" ? { y: [0, -18, 0], scaleY: [1, 1.06, 1] } : { y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className={mood === "sleep" ? "th-breathe" : undefined} style={{ display: "inline-block" }}>
                <Teddy size={196} mood={mood} pose={phase === "awake" && mood !== "sleep" ? "wave" : phase === "named" ? "up" : "down"} heart={awake} />
              </span>
              {mood === "sleep" && (
                <span className="th-zzz th-zzzWake" aria-hidden>
                  <i>z</i>
                  <i>z</i>
                  <i>Z</i>
                </span>
              )}
              {phase === "named" && (
                <motion.span className="th-tag th-nameTag" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: -4 }} transition={{ ...POP, delay: 0.15 }}>
                  <span aria-hidden>🧵</span> {name}
                </motion.span>
              )}
            </motion.div>
            {phase === "place" && (
              <motion.div
                className="th-dragHeart"
                drag
                dragSnapToOrigin
                dragElastic={0.6}
                onDragEnd={onDragEnd}
                whileDrag={{ scale: 1.15 }}
                initial={{ scale: 0, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={POP}
                aria-hidden
              >
                <SatinHeart size={70} warm={1} />
              </motion.div>
            )}
            {awake && mood !== "sleep" && <Gif src={cheer} size={98} tilt={8} className="th-cheerGif" eager />}
            {phase === "named" && <Gif src={GIF.whiteLove} size={80} tilt={-10} className="th-namedGif" eager />}
          </div>
        )}
      </div>

      <div className="th-foot">
        {phase === "rub" && (
          <Later ms={6500}>
            <TextLink onClick={warmed}>Warm it up for me</TextLink>
          </Later>
        )}
        {phase === "kiss" && !kissed && (
          <Puffy onClick={kiss} tone="pink">
            Kiss it 💋
          </Puffy>
        )}
        {phase === "place" && (
          <>
            <Hint>Drag the heart onto his tummy</Hint>
            <Later ms={5000}>
              <TextLink onClick={place}>Put it in for me</TextLink>
            </Later>
          </>
        )}
        {phase === "name" && (
          <motion.div className="th-names" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={POP}>
            <div className="th-chips">
              {ideas.map((n, i) => (
                <button key={n} type="button" className={`th-chip${i === 0 ? " is-his" : ""}`} onClick={() => pick(n)}>
                  {n}
                  {i === 0 && h.sender ? <small>{h.sender}&apos;s pick</small> : null}
                </button>
              ))}
            </div>
            <form
              className="th-nameForm"
              onSubmit={(e) => {
                e.preventDefault();
                pick(typed);
              }}
            >
              <input value={typed} maxLength={20} onChange={(e) => setTyped(e.target.value)} placeholder="or type your own…" aria-label="Name him" />
              <Puffy small type="submit" disabled={!typed.trim()} tone="honey">
                Name him
              </Puffy>
            </form>
          </motion.div>
        )}
        {phase === "named" && (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...POP, delay: 0.9 }}>
            <Puffy onClick={onNext}>Let&apos;s get him dressed →</Puffy>
          </motion.div>
        )}
      </div>
      <style>{HEART_CSS}</style>
    </div>
  );
}

const HEART_CSS = `
.th-nursery { position: relative; display: grid; place-items: center; width: 100%; min-height: 360px; margin: auto 0; }
.th-heartPad { display: grid; justify-items: center; gap: 10px; }
.th-rubZone { position: relative; width: 230px; height: 230px; display: grid; place-items: center; border-radius: 50%; touch-action: none; cursor: grab;
  background: radial-gradient(circle, #fff 0 56%, ${TH.pinkSoft} 57% 100%); box-shadow: 0 0 0 6px #fff, 0 16px 34px rgba(224,96,126,.22); -webkit-user-select: none; user-select: none; }
.th-rubZone.is-kiss { cursor: pointer; }
.th-ring { position: absolute; inset: 6px; width: calc(100% - 12px); height: calc(100% - 12px); }
.th-satin { position: relative; display: grid; place-items: center; }
.th-lips { position: absolute; left: 58%; top: 30%; font-size: 40px; }
.th-rubFinger { position: absolute; right: 18px; bottom: 26px; font-size: 34px; animation: th-rubHint 1.6s ease-in-out infinite; }
@keyframes th-rubHint { 0%,100% { transform: translate(0,0) rotate(-10deg) } 25% { transform: translate(-30px,-14px) rotate(-16deg) } 50% { transform: translate(-50px,4px) rotate(-6deg) } 75% { transform: translate(-22px,12px) rotate(-12deg) } }
.th-warmth { font: 400 22px/1 ${HAND}; color: ${TH.pinkDeep}; min-height: 24px; }
.th-wake { position: relative; display: grid; justify-items: center; width: 100%; }
.th-firstWords { margin-bottom: 14px; z-index: 4; }
.th-wakeTeddy { position: relative; display: grid; justify-items: center; cursor: default; }
.th-heartRoom.is-place .th-wakeTeddy { cursor: pointer; }
.th-zzzWake { right: 10px; top: 0; }
.th-nameTag { position: absolute; bottom: 4px; right: -34px; z-index: 3; }
.th-dragHeart { position: relative; z-index: 6; margin-top: 4px; touch-action: none; cursor: grab; filter: drop-shadow(0 8px 12px rgba(224,96,126,.35)); }
.th-dragHeart:active { cursor: grabbing; }
.th-cheerGif { position: absolute; left: max(-6px, calc(50% - 200px)); bottom: 30px; z-index: 5; }
.th-namedGif { position: absolute; right: max(-6px, calc(50% - 190px)); top: 10px; z-index: 5; }
.th-names { display: grid; justify-items: center; gap: 10px; width: min(100%, 380px); }
.th-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.th-chip { all: unset; cursor: pointer; display: inline-grid; justify-items: center; gap: 1px; min-height: 44px; padding: 6px 16px; border-radius: 16px; background: #fff; color: ${TH.ink};
  font: 400 22px/1 ${HAND}; box-shadow: 0 0 0 2px ${TH.pinkSoft} inset, 0 4px 0 #F5C6D4; }
.th-chip small { font: 800 10px/1 var(--font-th-body), sans-serif; letter-spacing: .1em; text-transform: uppercase; color: ${TH.pinkDeep}; }
.th-chip.is-his { background: ${TH.pinkSoft}; box-shadow: 0 0 0 2px #fff inset, 0 4px 0 ${TH.pink}; }
.th-chip:focus-visible { outline: 3px solid ${TH.pinkDeep}; outline-offset: 2px; }
.th-chip:active { transform: translateY(2px); box-shadow: 0 0 0 2px ${TH.pinkSoft} inset, 0 2px 0 #F5C6D4; }
.th-nameForm { display: flex; gap: 8px; width: 100%; }
.th-nameForm input { flex: 1; min-width: 0; min-height: 46px; padding: 0 16px; border-radius: 999px; border: 0; background: #fff; color: ${TH.ink}; font: 400 21px/1 ${HAND};
  box-shadow: 0 0 0 2px #F5DCC2 inset; outline: none; }
.th-nameForm input:focus-visible { box-shadow: 0 0 0 3px ${TH.pink} inset; }
@media (prefers-reduced-motion: reduce) { .th-rubFinger { animation: none; } }
@media (max-height: 740px) { .th-nursery { min-height: 320px; } .th-rubZone { width: 200px; height: 200px; } }
`;
