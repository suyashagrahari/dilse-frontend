"use client";

// Stop 3 · The ghost photo booth. Their photos hang as taped polaroids, and a
// shy little ghost is hiding each one. Tap a ghost: it giggles and floats off,
// and the photo is there with its caption (and the sender's little note
// underneath). When every ghost has gone, two cuddling ghosts (slot hb4) pop up.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, CroppedPhoto, haptic } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import { Ghost } from "./art";
import { HAND } from "./fonts";
import { GIF } from "./gifs";
import { BN, type Night } from "./model";
import { Gif, Header, Hint, Later, Note, POP, Puffy, TextLink } from "./ui";

const TILTS = [-4, 3, 2.5, -3];
const TAPES = [BN.pink, BN.mint, BN.lilac, BN.candle];

export default function Booth({ n, cuddle, step, total, onNext }: { n: Night; cuddle: string | null; step: number; total: number; onNext: () => void }) {
  const photos = n.booth;
  const [gone, setGone] = useState<boolean[]>(() => photos.map(() => false));
  const [last, setLast] = useState<number | null>(null);
  const left = gone.filter((g) => !g).length;
  const all = left === 0;

  const shoo = (i: number, at?: { x: number; y: number }) => {
    if (gone[i]) return;
    setGone((g) => g.map((v, k) => (k === i ? true : v)));
    setLast(i);
    haptic(14);
    sfx("bn-giggle", { gain: 0.7 });
    sfx("swoosh-soft", { gain: 0.35, at: 0.1 });
    if (left === 1) {
      sfx("chime-cascade", { gain: 0.5, at: 0.35 });
      burst({ kind: "hearts", origin: { x: 0.5, y: 0.5 }, count: 24, emojis: ["💜", "🧡", "👻", "✨"] });
    } else {
      burst({ kind: "sparkles", origin: at ?? { x: 0.5, y: 0.4 }, count: 10, emojis: ["✨", "💜"] });
    }
  };
  const shooAll = () => gone.forEach((g, i) => !g && window.setTimeout(() => shoo(i), i * 260));

  const note = last !== null ? photos[last]?.note?.trim() : "";
  const single = photos.length === 1;

  return (
    <div className="bn-scene bn-booth">
      <Header
        step={step}
        total={total}
        kicker="Stop 3 · The ghost photo booth"
        title={all ? "Found us! 📸" : "Some ghosts are hiding us"}
        sub={all ? undefined : `Tap each ghost to shoo it away · ${left} left`}
      />

      <div className={`bn-strip is-${photos.length}`}>
        {photos.map((ph, i) => (
          <div key={i} className="bn-polaroid" style={{ ["--t" as string]: `${TILTS[i % 4]}deg` }}>
            <span className="bn-tape" style={{ background: TAPES[i % 4] }} aria-hidden />
            <div className="bn-polImg">
              <CroppedPhoto photo={ph} eager={i < 2} />
              <AnimatePresence>
                {!gone[i] && (
                  <motion.button
                    type="button"
                    className="bn-hider"
                    aria-label={`Shoo the ghost from photo ${i + 1}`}
                    onClick={(e) => shoo(i, { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })}
                    exit={{ y: -280, x: i % 2 ? 80 : -80, rotate: i % 2 ? 30 : -30, scale: 0.6, opacity: 0, transition: { duration: 0.9, ease: [0.3, 0.7, 0.4, 1] } }}
                  >
                    <span className="bn-hiderBob" style={{ animationDelay: `${i * -0.6}s` }}>
                      <Ghost size={single ? 150 : photos.length === 3 ? 72 : 90} mood={i % 3 === 1 ? "wink" : i % 3 === 2 ? "shy" : "happy"} />
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <span className="bn-polCap">{gone[i] ? ph.caption || " " : "· · ·"}</span>
            {i === 0 && gone[i] && <Gif src={GIF.heartEyes} size={52} tilt={12} className="bn-polSticker" float={false} />}
          </div>
        ))}
      </div>

      <div className="bn-boothNote">
        <AnimatePresence mode="wait">
          {note ? (
            <Note key={last} tilt={last! % 2 ? 1.2 : -1.2} style={{ fontSize: 16 }}>
              {note}
            </Note>
          ) : (
            !all && <Hint key="h">psst… they giggle when you tap them</Hint>
          )}
        </AnimatePresence>
      </div>

      <div className="bn-foot">
        {all ? (
          <motion.div className="bn-boothDone" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...POP, delay: 0.2 }}>
            <Gif src={cuddle} size={110} tilt={-6} />
            <Puffy onClick={onNext}>Next stop →</Puffy>
          </motion.div>
        ) : (
          <Later ms={9000}>
            <TextLink onClick={shooAll}>Shoo them all for me</TextLink>
          </Later>
        )}
      </div>
      <style>{BOOTH_CSS}</style>
    </div>
  );
}

const BOOTH_CSS = `
.bn-strip { display: grid; grid-template-columns: repeat(2, minmax(0, 158px)); gap: 18px 16px; justify-content: center; width: 100%; margin-top: 6px; }
.bn-strip.is-1 { grid-template-columns: minmax(0, 230px); }
.bn-strip.is-3 { grid-template-columns: repeat(3, minmax(0, 112px)); gap: 12px 10px; }
.bn-strip.is-3 .bn-polaroid:nth-child(2) { margin-top: 26px; }
.bn-strip.is-4 { grid-template-columns: repeat(2, minmax(0, 132px)); }
.bn-strip.is-3 .bn-polCap { font-size: 15px; min-height: 34px; }
.bn-polaroid { position: relative; background: #fff; padding: 9px 9px 0; border-radius: 6px; transform: rotate(var(--t)); box-shadow: 0 12px 26px rgba(30,16,60,.4); }
.bn-polImg { position: relative; aspect-ratio: 4 / 5; border-radius: 3px; overflow: hidden; background: ${BN.lilac}; }
.bn-hider { all: unset; cursor: pointer; position: absolute; inset: 0; display: grid; place-items: center; background: linear-gradient(180deg, #DCCBFF, #C9B6FF); -webkit-tap-highlight-color: transparent; }
.bn-hider:focus-visible { outline: 3px solid ${BN.orange}; outline-offset: -3px; }
.bn-hiderBob { display: inline-block; animation: bn-bob 2.6s ease-in-out infinite; }
@keyframes bn-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
.bn-polCap { display: block; min-height: 40px; padding: 7px 4px 8px; font: 400 18px/1.15 ${HAND}; color: ${BN.ink}; text-align: center; overflow-wrap: anywhere; }
.bn-tape { position: absolute; top: -10px; left: 50%; width: 64px; height: 20px; margin-left: -32px; opacity: .85; transform: rotate(-4deg); z-index: 2; border-radius: 2px;
  -webkit-mask: linear-gradient(90deg, transparent 0 3px, #000 3px calc(100% - 3px), transparent calc(100% - 3px)); }
.bn-polSticker { position: absolute; right: -16px; top: -18px; z-index: 3; }
.bn-boothNote { min-height: 74px; display: grid; place-items: center; width: 100%; }
.bn-boothDone { display: flex; align-items: center; gap: 10px; }
@media (prefers-reduced-motion: reduce) { .bn-hiderBob { animation: none; } }
@media (min-width: 700px) { .bn-strip.is-2, .bn-strip.is-4 { grid-template-columns: repeat(2, minmax(0, 170px)); } .bn-strip.is-3 { grid-template-columns: repeat(3, minmax(0, 150px)); } }
`;
