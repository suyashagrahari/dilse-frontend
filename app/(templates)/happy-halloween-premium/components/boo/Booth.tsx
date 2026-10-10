"use client";

// Stop 3 · The ghost photo booth. Their photos hang as taped polaroids, and a
// shy little ghost is hiding each one. Tap a ghost: it giggles and floats off,
// and the photo is there with its caption (and the sender's little note
// underneath). When every ghost has gone, two cuddling ghosts (slot hb4) pop up.
// v4: the last photo hides behind a pumpkin instead (not on kids pages). Tap
// it and the lid pops, a ghost jumps out and BOOs, full screen, the sound on
// its "BOO!" frame (scare #3, pumpkin-ghost-boo) — then the photo is there.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, CroppedPhoto, haptic } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import { Ghost, Pumpkin } from "./art";
import { HAND } from "./fonts";
import { GIF } from "./gifs";
import { BN, type Night } from "./model";
import { useBoo } from "./Scare";
import { Gif, Header, Hint, Later, NextButton, Note, POP, TextLink } from "./ui";

const TILTS = [-4, 3, 2.5, -3];
const TAPES = [BN.pink, BN.mint, BN.lilac, BN.candle];

export default function Booth({ n, cuddle, step, total, onNext }: { n: Night; cuddle: string | null; step: number; total: number; onNext: () => void }) {
  const photos = n.booth;
  const [gone, setGone] = useState<boolean[]>(() => photos.map(() => false));
  const [last, setLast] = useState<number | null>(null);
  const left = gone.filter((g) => !g).length;
  const all = left === 0;
  const boo = useBoo();
  // which photo hides behind the scare pumpkin (the last one)
  const pk = boo.enabled ? photos.length - 1 : -1;
  const [scaring, setScaring] = useState(false);

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
  const peekPumpkin = () => {
    if (gone[pk] || scaring) return;
    setScaring(true);
    haptic(10);
    boo.ghost({
      line: "BOO! Got you 💜",
      sub: "That's the booth's oldest ghost. Harmless, promise. He kept your photo safe.",
      onDone: () => {
        setScaring(false);
        shoo(pk);
      },
    });
  };

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
                {!gone[i] && i === pk && (
                  <motion.button
                    key="pk"
                    type="button"
                    className="bn-hider is-pk"
                    aria-label={`Peek behind the pumpkin on photo ${i + 1}`}
                    onClick={peekPumpkin}
                    exit={{ scale: 1.4, opacity: 0, transition: { duration: 0.35 } }}
                  >
                    <span className="bn-wiggle bn-pkHide">
                      <Pumpkin eyes="happy" mouth="grin" lit={false} size={120} />
                    </span>
                  </motion.button>
                )}
                {!gone[i] && i !== pk && (
                  <motion.button
                    key="g"
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
            <span className="bn-polCap">{gone[i] ? ph.caption || " " : i === pk ? "a pumpkin?" : "· · ·"}</span>
            {i === 0 && gone[i] && <Gif src={GIF.heartEyes} size={44} tilt={12} className="bn-polSticker" float={false} />}
          </div>
        ))}
      </div>

      <div className="bn-boothNote">
        <AnimatePresence mode="wait">
          {note ? (
            <Note key={last} tilt={last! % 2 ? 1.2 : -1.2} className={all && cuddle ? "has-gif" : undefined}>
              {all && cuddle && <Gif src={cuddle} size={64} tilt={-6} className="bn-boothCuddle" />}
              {note}
            </Note>
          ) : all ? (
            <motion.div key="c" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...POP, delay: 0.2 }}>
              <Gif src={cuddle} size={96} tilt={-6} />
            </motion.div>
          ) : (
            <Hint key="h">{pk >= 0 && left === 1 && !gone[pk] ? "one left… that pumpkin looks shifty 🎃" : "psst… they giggle when you tap them"}</Hint>
          )}
        </AnimatePresence>
      </div>

      <div className="bn-foot">
        {all ? (
          <NextButton onClick={onNext} delay={0.4} />
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
.bn-strip { --pw: clamp(84px, calc((100dvh - 490px) / 2.5), 150px); display: grid; grid-template-columns: repeat(2, var(--pw)); gap: 14px 14px; justify-content: center; align-content: center; width: 100%; flex: 1 1 0; min-height: 0; }
.bn-strip.is-1 { --pw: clamp(150px, calc((100dvh - 430px) / 1.25), 230px); grid-template-columns: var(--pw); }
.bn-strip.is-2 { --pw: clamp(120px, calc((100dvh - 430px) / 1.25), 158px); }
.bn-strip.is-3 { --pw: clamp(90px, calc((100dvh - 456px) / 1.25), 112px); grid-template-columns: repeat(3, var(--pw)); gap: 10px; }
.bn-strip.is-3 .bn-polaroid:nth-child(2) { margin-top: 22px; }
@media (min-height: 760px) { .bn-strip.is-3 { --pw: clamp(110px, calc((100dvh - 490px) / 2.5), 150px); grid-template-columns: repeat(2, var(--pw)); gap: 14px; } .bn-strip.is-3 .bn-polaroid:nth-child(2) { margin-top: 18px; } .bn-strip.is-3 .bn-polaroid:nth-child(3) { grid-column: 1 / -1; justify-self: center; width: var(--pw); margin-top: -12px; } }
@media (max-height: 700px) { .bn-strip.is-4 { --pw: clamp(70px, calc((100vw - 64px) / 4), 92px); grid-template-columns: repeat(4, var(--pw)); gap: 8px; } .bn-strip.is-4 .bn-polaroid:nth-child(even) { margin-top: 18px; } }
.bn-polaroid { position: relative; background: #fff; padding: 7px 7px 0; border-radius: 6px; transform: rotate(var(--t)); box-shadow: 0 12px 26px rgba(30,16,60,.4); align-self: start; }
.bn-polImg { position: relative; aspect-ratio: 4 / 5; border-radius: 3px; overflow: hidden; background: ${BN.lilac}; }
.bn-hider { all: unset; cursor: pointer; position: absolute; inset: 0; display: grid; place-items: center; background: linear-gradient(180deg, #DCCBFF, #C9B6FF); -webkit-tap-highlight-color: transparent; }
.bn-hider svg { width: 72%; height: auto; }
.bn-hider.is-pk { background: radial-gradient(circle at 50% 60%, #5B4290, #3B2D6E); }
.bn-pkHide { display: grid; place-items: center; width: 100%; }
.bn-pkHide svg { width: 84%; height: auto; filter: drop-shadow(0 4px 6px rgba(0,0,0,.35)); }
.bn-hider:focus-visible { outline: 3px solid ${BN.orange}; outline-offset: -3px; }
.bn-hiderBob { display: grid; place-items: center; width: 100%; animation: bn-bob 2.6s ease-in-out infinite; }
@keyframes bn-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
.bn-polCap { display: block; min-height: 2.3em; padding: 5px 2px 6px; font: 400 clamp(13px, calc(var(--pw) / 9), 18px)/1.15 ${HAND}; color: ${BN.ink}; text-align: center; overflow-wrap: anywhere;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bn-tape { position: absolute; top: -9px; left: 50%; width: 54px; height: 18px; margin-left: -27px; opacity: .85; transform: rotate(-4deg); z-index: 2; border-radius: 2px;
  -webkit-mask: linear-gradient(90deg, transparent 0 3px, #000 3px calc(100% - 3px), transparent calc(100% - 3px)); }
.bn-polSticker { position: absolute; right: -14px; top: -16px; z-index: 3; }
.bn-boothNote { flex: none; min-height: clamp(70px, 12dvh, 96px); display: grid; place-items: center; width: 100%; }
.bn-boothNote .bn-note { font-size: clamp(14px, 2.2dvh, 16px); padding: clamp(10px, 1.5dvh, 14px) 18px; }
.bn-note.has-gif { padding-left: 64px; text-align: left; }
.bn-boothCuddle { position: absolute; left: -12px; top: 50%; margin-top: -32px; }
@media (prefers-reduced-motion: reduce) { .bn-hiderBob { animation: none; } }
@media (min-width: 700px) { .bn-strip.is-4 { --pw: clamp(110px, calc((100dvh - 520px) / 2.5), 160px); } }
`;
