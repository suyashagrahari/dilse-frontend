"use client";

// The last stop — THE MONEY MOMENT. "Will you be my boo?" next to her photo
// in the moonlight. The No button "ghosts": it fades out with a little woo
// and reappears somewhere else with a new excuse, the Yes grows, and a
// pleading face gets sadder; after four tries the No gives up and turns into
// a second Yes (family/kids: Yes only). YES → drop(): on the song's chorus the
// night turns pink-orange, the moon becomes a heart (parent backdrop), a swarm
// of tiny bats flies in from every side and forms a heart around her photo,
// and two ghosts float in from the sides and kiss above it.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx, useSongDrop } from "../../../_valentine/kit/premium";
import { Bat, Ghost, heartPath } from "./art";
import { DISPLAY, HAND } from "./fonts";
import { GIF } from "./gifs";
import { BN, type Night } from "./model";
import { Gif, Note, POP, Puffy, WOBBLY } from "./ui";

type Phase = "ask" | "rise" | "peak" | "after";
const BATS = 40;

function heartPoints(count: number, k: number) {
  return Array.from({ length: count }, (_, i) => {
    const t = (i / count) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: x * k, y: y * k - 10 };
  });
}

export default function Question({
  n, couple, step, total, onPeak, onYes, onNext,
}: { n: Night; couple: string | null; step: number; total: number; onPeak: () => void; onYes: (dodges: number) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const { drop } = useSongDrop();
  const [phase, setPhase] = useState<Phase>("ask");
  const [dodges, setDodges] = useState(0);
  const [noPos, setNoPos] = useState({ x: 76, y: 56 });
  const [noHidden, setNoHidden] = useState(false);
  const field = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  // Client-only scene (next/dynamic, ssr: false), so the viewport is known here.
  const [k] = useState(() => (typeof window === "undefined" ? 10.5 : Math.max(9, Math.min(12.5, (Math.min(window.innerWidth, 520) - 30) / 34))));
  const hearts = useMemo(() => heartPoints(BATS, k), [k]);
  const starts = useMemo(
    () =>
      Array.from({ length: BATS }, (_, i) => {
        const a = (i * 137.5 * Math.PI) / 180;
        return { x: Math.cos(a) * 520, y: Math.sin(a) * 620, r: (i % 2 ? 1 : -1) * (20 + (i % 5) * 8) };
      }),
    [],
  );

  const gaveUp = !n.gentle && dodges >= 4;

  const dodge = () => {
    if (noHidden || gaveUp || phase !== "ask") return;
    const d = dodges + 1;
    setNoHidden(true);
    haptic(8);
    sfx("bn-woo", { gain: 0.6, detune: d * 80 });
    later(() => {
      const spots = [
        { x: 80, y: 14 }, { x: 16, y: 90 }, { x: 84, y: 90 }, { x: 70, y: 12 }, { x: 22, y: 12 },
      ];
      setNoPos(spots[(d - 1) % spots.length]);
      setDodges(d);
      setNoHidden(false);
    }, reduce ? 60 : 420);
  };

  const yes = () => {
    if (phase !== "ask") return;
    setPhase("rise");
    onYes(dodges);
    haptic([20, 30, 20, 30, 60]);
    sfx("sparkle", { gain: 0.5 });
    drop(() => {
      setPhase("peak");
      onPeak();
      sfx("firework", { gain: 0.55 });
      sfx("bn-flap", { gain: 0.6, at: 0.1 });
      sfx("bn-flap", { gain: 0.5, at: 0.45 });
      sfx("chime-cascade", { gain: 0.5, at: 0.9 });
      sfx("kiss", { gain: 0.5, at: 1.6 });
      burst({ kind: "confetti", count: 120 });
      later(() => burst({ kind: "hearts", origin: { x: 0.5, y: 0.4 }, count: 26, emojis: ["💖", "💜", "🧡", "🦇", "✨"] }), 1500);
      later(() => setPhase("after"), reduce ? 600 : 3200);
    });
  };

  const peaked = phase === "peak" || phase === "after";
  const noLabel = dodges === 0 ? "No" : n.copy.noLines[(dodges - 1) % Math.max(1, n.copy.noLines.length)] ?? "No";
  const sad = dodges >= 3 ? GIF.crying : dodges >= 1 ? GIF.pleading : GIF.heartEyes;
  const yesScale = 1 + Math.min(dodges, 4) * 0.1;

  return (
    <div className={`bn-scene bn-q is-${phase}`}>
      <header className="bn-head">
        <div className="bn-dots" aria-label={`Stop ${step} of ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`bn-dot${i < step ? " is-done" : ""}${i === step - 1 ? " is-now" : ""}`} />
          ))}
        </div>
        <p className="bn-kicker">{peaked ? `${n.recipient} said yes` : "Last stop · under the moon"}</p>
        <AnimatePresence mode="wait">
          {!peaked ? (
            <motion.h2 key="q" className="bn-title bn-qTitle" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={POP}>
              {n.question}
            </motion.h2>
          ) : (
            <motion.h2 key="y" className="bn-title bn-qTitle" initial={{ scale: 0.4, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={WOBBLY}>
              {n.sender ? `${n.recipient} & ${n.sender}` : `Yay, ${n.recipient}!`} 🧡
            </motion.h2>
          )}
        </AnimatePresence>
      </header>

      <div className="bn-heroArea">
        {/* the bat swarm: every bat flies from off-screen into the heart */}
        {peaked && (
          <div className="bn-swarm" aria-hidden>
            {hearts.map((h, i) => (
              <motion.span
                key={i}
                className="bn-swarmBat"
                initial={reduce ? { x: h.x, y: h.y, opacity: 0 } : { x: starts[i].x, y: starts[i].y, rotate: starts[i].r, opacity: 0, scale: 0.6 }}
                animate={{ x: h.x, y: h.y, rotate: 0, opacity: 1, scale: 1 }}
                transition={reduce ? { duration: 0.3 } : { type: "spring", stiffness: 60, damping: 11, delay: 0.02 * i }}
              >
                <span className="bn-swarmBob" style={{ animationDelay: `${(i % 6) * -0.3}s` }}>
                  <Bat size={i % 3 === 0 ? 50 : 42} />
                </span>
              </motion.span>
            ))}
          </div>
        )}

        <motion.div className="bn-heroPol" animate={phase === "rise" ? { scale: 1.06, rotate: 0 } : peaked ? { scale: 0.86, rotate: -2 } : { scale: 1, rotate: -3 }} transition={WOBBLY}>
          <span className="bn-tape" style={{ background: BN.pink }} aria-hidden />
          <div className="bn-heroImg">
            {n.hero ? (
              <CroppedPhoto photo={n.hero} eager />
            ) : (
              <span style={{ display: "grid", placeItems: "center", height: "100%" }}>
                <Ghost size={120} mood="shy" hold="heart" />
              </span>
            )}
          </div>
          <span className="bn-heroCap">{n.hero?.caption || n.house}</span>
        </motion.div>

        {/* two ghosts float in and kiss above the photo */}
        {peaked && (
          <>
            <motion.span className="bn-kissL" initial={{ x: -190, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 70, damping: 12, delay: reduce ? 0 : 0.9 }} aria-hidden>
              <Ghost size={78} mood="kiss" />
            </motion.span>
            <motion.span className="bn-kissR" initial={{ x: 190, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 70, damping: 12, delay: reduce ? 0 : 0.9 }} aria-hidden>
              <Ghost size={78} mood="kiss" tint="#FFF1F7" style={{ transform: "scaleX(-1)" }} />
            </motion.span>
            <motion.svg className="bn-kissHeart" viewBox="0 0 40 40" width="44" height="44" initial={{ scale: 0, y: 0 }} animate={{ scale: [0, 1.4, 1], y: -18 }} transition={{ delay: reduce ? 0.2 : 1.7, duration: 0.7 }} aria-hidden>
              <path d={heartPath(20, 20, 38)} fill="#FF4F93" stroke="#fff" strokeWidth="2.5" />
            </motion.svg>
            <Gif src={couple} size={104} tilt={8} className="bn-qCouple" eager />
            <Gif src={GIF.bearsHug} size={84} tilt={-8} className="bn-qBears" eager />
          </>
        )}
      </div>

      {phase === "ask" && (
        <div className={`bn-ansField${n.gentle ? " is-gentle" : ""}`} ref={field}>
          <span className="bn-yesSlot" style={{ transform: `scale(${yesScale})` }}>
            <Puffy onClick={yes} style={{ minWidth: 150 }}>
              {n.copy.yes}
            </Puffy>
          </span>
          {!n.gentle && (
            <>
              <Gif src={sad} size={64} tilt={-6} className="bn-sad" float={false} eager />
              {gaveUp ? (
                <motion.span className="bn-noSlot" style={{ left: `${noPos.x}%`, top: `${noPos.y}%` }} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={POP}>
                  <Puffy tone="pink" small onClick={yes}>
                    {n.copy.surrender}
                  </Puffy>
                </motion.span>
              ) : (
                <span
                  className={`bn-noSlot${noHidden ? " is-gone" : ""}`}
                  style={{ left: `${noPos.x}%`, top: `${noPos.y}%` }}
                  onPointerEnter={(e) => e.pointerType === "mouse" && dodge()}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    dodge();
                  }}
                >
                  <Puffy tone="lilac" small onClick={dodge} ariaLabel="No">
                    {noLabel}
                  </Puffy>
                </span>
              )}
            </>
          )}
        </div>
      )}

      {phase === "rise" && <p className="bn-hint" style={{ fontFamily: DISPLAY, fontSize: 22 }}>wait for it… 🦇</p>}

      <div className="bn-foot">
        {phase === "after" && (
          <motion.div style={{ display: "grid", justifyItems: "center", gap: 12 }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={POP}>
            {n.yesLine && (
              <Note tilt={-1.5} style={{ fontFamily: HAND, fontWeight: 400, fontSize: 22, lineHeight: 1.25 }}>
                {n.yesLine}
              </Note>
            )}
            <Puffy onClick={onNext}>Get your {n.copy.license} →</Puffy>
          </motion.div>
        )}
      </div>
      <style>{Q_CSS}</style>
    </div>
  );
}

const Q_CSS = `
.bn-qTitle { font-size: clamp(28px, 8vw, 42px); max-width: 15ch; }
.bn-q.is-peak .bn-title, .bn-q.is-after .bn-title { color: #fff; text-shadow: 0 3px 0 rgba(224,97,156,.6); }
.bn-q.is-peak .bn-kicker, .bn-q.is-after .bn-kicker { color: #fff; }
.bn-heroArea { position: relative; display: grid; place-items: center; width: 100%; min-height: 330px; margin-top: 8px; }
.bn-heroPol { position: relative; z-index: 2; width: min(56vw, 220px); background: #fff; padding: 10px 10px 0; border-radius: 6px; box-shadow: 0 16px 34px rgba(30,16,60,.45); }
.bn-q.is-rise .bn-heroPol { box-shadow: 0 0 0 6px rgba(255,210,122,.6), 0 0 60px rgba(255,210,122,.8); }
.bn-heroImg { aspect-ratio: 4 / 5; overflow: hidden; border-radius: 3px; background: ${BN.lilac}; }
.bn-heroCap { display: block; padding: 8px 4px 10px; font: 400 20px/1.1 ${HAND}; color: ${BN.ink}; text-align: center; }
.bn-heroPol .bn-tape { position: absolute; top: -10px; left: 50%; width: 70px; height: 20px; margin-left: -35px; opacity: .9; transform: rotate(-4deg); z-index: 2; }
.bn-swarm { position: absolute; left: 50%; top: 50%; width: 0; height: 0; z-index: 1; pointer-events: none; }
.bn-swarmBat { position: absolute; left: -22px; top: -16px; }
.bn-q.is-peak .bn-heroArea, .bn-q.is-after .bn-heroArea { margin-top: 40px; }
.bn-swarmBob { display: inline-block; animation: bn-swarmBob 1.6s ease-in-out infinite; }
@keyframes bn-swarmBob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
.bn-kissL, .bn-kissR { position: absolute; top: -34px; z-index: 3; }
.bn-kissL { left: calc(50% - 82px); }
.bn-kissR { left: calc(50% + 4px); }
.bn-kissHeart { position: absolute; top: -40px; left: 50%; margin-left: -22px; z-index: 4; }
.bn-qCouple { position: absolute; right: max(0px, calc(50% - 200px)); bottom: -14px; z-index: 4; }
.bn-qBears { position: absolute; left: max(0px, calc(50% - 196px)); bottom: -8px; z-index: 4; }
.bn-ansField { position: relative; width: min(100%, 360px); height: 168px; margin-top: 8px; }
.bn-ansField.is-gentle { height: 90px; }
.bn-yesSlot { position: absolute; left: 50%; top: 50%; translate: -50% -50%; transition: transform .35s cubic-bezier(.34,1.56,.64,1); z-index: 2; }
.bn-ansField.is-gentle .bn-yesSlot { top: 50%; }
.bn-sad { position: absolute; left: calc(34% - 32px); top: -6px; }
.bn-noSlot { position: absolute; translate: -50% -50%; transition: opacity .35s ease, scale .35s ease; z-index: 3; touch-action: none; }
.bn-noSlot.is-gone { opacity: 0; scale: .5; pointer-events: none; }
.bn-ansField .bn-yesSlot { top: 56%; left: 34%; }
.bn-ansField.is-gentle .bn-yesSlot { left: 50%; }
@media (prefers-reduced-motion: reduce) { .bn-swarmBob { animation: none; } }
@media (max-height: 740px) { .bn-heroArea { min-height: 290px; } .bn-heroPol { width: min(48vw, 190px); } }
`;
