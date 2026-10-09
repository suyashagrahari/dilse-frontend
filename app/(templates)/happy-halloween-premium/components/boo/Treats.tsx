"use client";

// Stop 1 · Trick or treat. Tap the treat bucket (or shake the phone): candies
// boing out and bob around it. Catch each one (tap): the wrapper crinkles open
// into a little note, a sweet "Treat:" or a cute "Trick:" dare. The ghost
// with the bucket (slot hb2) watches; when the bag is empty a blushing ghost
// takes over. "Catch one for me" after a few idle seconds.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import { Bucket, Candy, CANDY_COLORS } from "./art";
import { DISPLAY } from "./fonts";
import { GIF } from "./gifs";
import { BN, splitTreat, type Night } from "./model";
import { Gif, Header, Hint, Later, Note, POP, Puffy, TextLink } from "./ui";

const SPOTS = [
  { x: 10, y: 16, r: -14 },
  { x: 72, y: 8, r: 12 },
  { x: 4, y: 56, r: 10 },
  { x: 76, y: 50, r: -10 },
  { x: 40, y: 0, r: 6 },
];

export default function Treats({ n, reactor, step, total, onNext }: { n: Night; reactor: string | null; step: number; total: number; onNext: () => void }) {
  const [open, setOpen] = useState(false);
  const [caught, setCaught] = useState<boolean[]>(() => n.treats.map(() => false));
  const [last, setLast] = useState<number | null>(null);
  const count = caught.filter(Boolean).length;
  const all = count === n.treats.length;

  const openBag = () => {
    if (open) return;
    setOpen(true);
    haptic([10, 30, 10]);
    sfx("bn-boing", { gain: 0.7 });
    sfx("bn-crinkle", { gain: 0.5, at: 0.12 });
  };

  // A real shake opens the bag too (permission was asked at the gate on iOS).
  const openRef = useRef(openBag);
  useEffect(() => {
    openRef.current = openBag;
  });
  useEffect(() => {
    let lastT = 0;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const m = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
      const now = Date.now();
      if (m > 24 && now - lastT > 800) {
        lastT = now;
        openRef.current();
      }
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, []);

  const catchOne = (i: number, at?: { x: number; y: number }) => {
    if (caught[i]) return;
    setCaught((c) => c.map((v, k) => (k === i ? true : v)));
    setLast(i);
    haptic(12);
    sfx("bn-crinkle", { gain: 0.6 });
    sfx("pop", { gain: 0.45, at: 0.08 });
    const left = caught.filter((v) => !v).length - 1;
    if (left === 0) sfx("chime", { gain: 0.55, at: 0.25 });
    burst({ kind: "hearts", origin: at ?? { x: 0.5, y: 0.45 }, count: left === 0 ? 22 : 10, emojis: ["🍬", "💜", "✨", "🧡"] });
  };
  const catchNext = () => {
    if (!open) openBag();
    const i = caught.findIndex((v) => !v);
    if (i >= 0) window.setTimeout(() => catchOne(i), open ? 0 : 450);
  };

  const t = last !== null ? splitTreat(n.treats[last]) : null;

  return (
    <div className="bn-scene bn-treats">
      <Header step={step} total={total} kicker="Stop 1 · Trick or treat" title={open ? "Catch the candy!" : "Shake the treat bag"} sub={open ? `${count} of ${n.treats.length} caught` : "Every candy has something inside."} />

      <div className="bn-field">
        <AnimatePresence>
          {open &&
            n.treats.map((_, i) =>
              caught[i] ? null : (
                <motion.button
                  key={i}
                  type="button"
                  className="bn-candy"
                  aria-label={`Catch candy ${i + 1}`}
                  style={{ left: `${SPOTS[i].x}%`, top: `${SPOTS[i].y}%` }}
                  initial={{ x: `${(50 - SPOTS[i].x) * 2.4}%`, y: 170, scale: 0.2, rotate: 0, opacity: 0 }}
                  animate={{ x: 0, y: 0, scale: 1, rotate: SPOTS[i].r, opacity: 1 }}
                  exit={{ scale: 1.6, opacity: 0, rotate: SPOTS[i].r + 40, transition: { duration: 0.28 } }}
                  transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.06 * i }}
                  onClick={(e) => catchOne(i, { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })}
                >
                  <span className="bn-candyBob" style={{ animationDelay: `${i * -0.5}s` }}>
                    <Candy color={CANDY_COLORS[i % CANDY_COLORS.length]} size={78} />
                  </span>
                </motion.button>
              ),
            )}
        </AnimatePresence>

        <motion.button
          type="button"
          className={`bn-bag${open ? "" : " bn-wiggle"}`}
          onClick={openBag}
          aria-label="Open the treat bag"
          animate={open ? { scaleX: [1, 1.18, 0.92, 1.04, 1], scaleY: [1, 0.82, 1.1, 0.97, 1] } : undefined}
          transition={{ duration: 0.5 }}
        >
          <Bucket size={180} empty={open} />
        </motion.button>
        <Gif src={all ? GIF.blush : reactor} size={104} tilt={8} className="bn-treatGif" eager />
      </div>

      <div className="bn-treatNote">
        <AnimatePresence mode="wait">
          {t ? (
            <Note key={last} tilt={last! % 2 ? 1.5 : -1.5}>
              {t.kind && <span className={`bn-chip is-${t.kind}`}>{t.kind === "trick" ? "Trick 👻" : "Treat 🍬"}</span>}
              <span>{t.line}</span>
            </Note>
          ) : (
            open && <Hint key="h">Tap a candy to catch it</Hint>
          )}
        </AnimatePresence>
      </div>

      <div className="bn-foot">
        {!open && <Puffy onClick={openBag}>Tap the bag 🎃</Puffy>}
        {all ? (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={POP} style={{ display: "grid", justifyItems: "center", gap: 6 }}>
            <p className="bn-sub" style={{ fontFamily: DISPLAY, fontSize: 22 }}>The whole bag is yours 🍬</p>
            <Puffy onClick={onNext}>Next stop →</Puffy>
          </motion.div>
        ) : (
          open && (
            <Later ms={7000}>
              <TextLink onClick={catchNext}>Catch one for me</TextLink>
            </Later>
          )
        )}
      </div>
      <style>{TREATS_CSS}</style>
    </div>
  );
}

const TREATS_CSS = `
.bn-field { position: relative; width: min(100%, 380px); height: 330px; flex: none; }
.bn-bag { all: unset; cursor: pointer; position: absolute; left: 50%; bottom: 0; margin-left: -90px; -webkit-tap-highlight-color: transparent; transform-origin: 50% 100%; }
.bn-bag:focus-visible { outline: 3px solid #fff; outline-offset: 4px; border-radius: 30px; }
.bn-treatGif { position: absolute; right: -6px; bottom: 6px; }
.bn-candy { all: unset; cursor: pointer; position: absolute; width: 86px; height: 70px; display: grid; place-items: center; -webkit-tap-highlight-color: transparent; z-index: 2; }
.bn-candy:focus-visible { outline: 3px solid #fff; outline-offset: 2px; border-radius: 20px; }
.bn-candyBob { display: inline-block; animation: bn-bob 2.4s ease-in-out infinite; filter: drop-shadow(0 6px 8px rgba(30,16,60,.35)); }
@keyframes bn-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-9px) } }
.bn-treatNote { min-height: 96px; display: grid; place-items: center; width: 100%; }
.bn-chip { display: inline-block; margin: 0 8px 4px 0; padding: 4px 10px; border-radius: 99px; font: 800 12px/1.2 var(--font-bn-body), sans-serif; letter-spacing: .08em; text-transform: uppercase; vertical-align: 2px; }
.bn-chip.is-treat { background: ${BN.mint}; color: #173A2C; }
.bn-chip.is-trick { background: ${BN.lilac}; color: ${BN.ink}; }
@media (prefers-reduced-motion: reduce) { .bn-candyBob { animation: none; } }
@media (max-height: 720px) { .bn-field { height: 280px; } }
`;
