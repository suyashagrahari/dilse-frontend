"use client";

// Room 3 · The sofa. "He's shy. Give him a squeeze." Press him: he squashes (squash-and-stretch), and on release
// he squeaks and says the next bit of the letter in a speech bubble, one squeeze at a time, with a counter of
// little hearts. After the last bit the sign-off arrives, and the whole letter can be read on one lined card.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import type { TeddyItem } from "../../../_valentine/days/happy-teddy-day-premium";
import { heartPath, Teddy, type Mood } from "./art";
import { DISPLAY, HAND } from "./fonts";
import { GIF } from "./gifs";
import { TH, type House } from "./model";
import { Bubble, Gif, Header, Hint, Later, POP, Puffy, TextLink } from "./ui";

export default function Squeeze({
  h, cuddle, step, total, name, worn, onNext,
}: { h: House; cuddle: string | null; step: number; total: number; name: string; worn: TeddyItem[]; onNext: () => void }) {
  const reduce = useReducedMotion();
  const n = h.bubbles.length;
  const [said, setSaid] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [mood, setMood] = useState<Mood>("shy");
  const [full, setFull] = useState(false);
  const downAt = useRef(0);
  const t = useRef<number | null>(null);
  useEffect(() => () => {
    if (t.current) window.clearTimeout(t.current);
  }, []);

  const done = said >= n;
  const squeeze = () => {
    if (done) return;
    const i = said + 1;
    setSaid(i);
    sfx("plush-squeak", { gain: 0.75, detune: (i % 3) * 120 });
    haptic([40]);
    setMood(i === n ? "love" : i % 2 ? "happy" : "wink");
    if (i === n) {
      sfx("chime-cascade", { gain: 0.45, at: 0.2 });
      burst({ kind: "hearts", origin: { x: 0.5, y: 0.5 }, count: 20, emojis: ["💗", "💖", "🧸"] });
    }
  };

  const down = () => {
    if (done) return;
    downAt.current = performance.now();
    setPressed(true);
    haptic(8);
  };
  const up = () => {
    if (!pressed) return;
    setPressed(false);
    squeeze();
  };

  const bubble = said === 0 ? null : h.bubbles[said - 1];

  return (
    <div className={`th-scene th-squeeze${done ? " is-done" : ""}`}>
      <Header
        step={step}
        total={total}
        room="Room 3 · The cosy sofa"
        title={done ? <>That&apos;s everything he wanted to say</> : said === 0 ? <>He&apos;s shy. Give him a <em>squeeze</em></> : <>Squeeze again…</>}
        sub={said === 0 ? `${name} has something to tell you from ${h.sender || "someone"}.` : undefined}
      />

      <div className="th-sofaArea">
        <div className="th-bubbleSlot">
          <AnimatePresence mode="wait">
            {bubble && (
              <Bubble k={said} className="th-letterBubble">
                {bubble}
                {done && h.signOff && <span className="th-sign">{h.signOff}</span>}
              </Bubble>
            )}
          </AnimatePresence>
        </div>
        <div className="th-sofa" aria-hidden>
          <span className="th-sofaBack" />
          <span className="th-sofaArmL" />
          <span className="th-sofaArmR" />
          <span className="th-sofaSeat" />
          <span className="th-cushion" />
        </div>
        <motion.button
          type="button"
          className="th-squeezeTeddy"
          onPointerDown={down}
          onPointerUp={up}
          onPointerLeave={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), squeeze())}
          animate={pressed ? { scaleX: 1.14, scaleY: 0.82 } : { scaleX: [1.14, 0.94, 1.04, 1], scaleY: [0.82, 1.1, 0.97, 1] }}
          transition={pressed ? { duration: 0.12 } : reduce ? { duration: 0.1 } : { duration: 0.5 }}
          aria-label={done ? `${name}` : `Squeeze ${name}`}
          disabled={done}
        >
          <Teddy size={176} mood={pressed ? "happy" : mood} pose={pressed ? "hug" : done ? "up" : "down"} worn={worn} heart />
        </motion.button>
        <div className="th-count" aria-label={`${said} of ${n}`}>
          {Array.from({ length: n }, (_, i) => (
            <svg key={i} viewBox="0 0 32 32" width={18} height={18} aria-hidden>
              <path d={heartPath(16, 17, 28)} fill={i < said ? TH.pinkDeep : "#fff"} stroke={i < said ? "#fff" : "#F5C6D4"} strokeWidth={2.2} />
            </svg>
          ))}
        </div>
        {said > 0 && <Gif src={cuddle} size={94} tilt={8} className="th-cuddleGif" />}
        {done && <Gif src={GIF.loveYou} size={78} tilt={-10} className="th-loveGif" eager />}
      </div>

      <div className="th-foot">
        {!done ? (
          <>
            <Hint>{said === 0 ? "Press and let go 🤗" : `${n - said} more squeeze${n - said === 1 ? "" : "s"}`}</Hint>
            <Later ms={7000}>
              <TextLink onClick={squeeze}>Squeeze him for me</TextLink>
            </Later>
          </>
        ) : (
          <motion.div className="th-doneRow" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...POP, delay: 0.5 }}>
            <Puffy onClick={onNext}>Next room →</Puffy>
            <TextLink onClick={() => setFull(true)}>Read the whole letter</TextLink>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {full && (
          <motion.div className="th-letterWrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFull(false)}>
            <motion.div className="th-letter" initial={{ y: 40, rotate: 3, scale: 0.9 }} animate={{ y: 0, rotate: -1, scale: 1 }} exit={{ y: 30, opacity: 0 }} transition={POP} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="The letter">
              <p className="th-letterTo">Dear {h.recipient},</p>
              {h.letter.split(/\n+/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              {h.signOff && <p className="th-letterSign">{h.signOff}</p>}
              <Puffy small tone="cream" onClick={() => setFull(false)}>
                Close
              </Puffy>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{SQUEEZE_CSS}</style>
    </div>
  );
}

const SQUEEZE_CSS = `
.th-sofaArea { position: relative; display: grid; justify-items: center; width: 100%; margin: auto 0; }
.th-bubbleSlot { min-height: 170px; display: grid; align-items: end; justify-items: center; width: 100%; z-index: 4; padding-bottom: 14px; }
.th-letterBubble { font-size: 20px; }
.th-sign { display: block; margin-top: 8px; text-align: right; color: ${TH.pinkDeep}; font: 400 22px/1 ${HAND}; }
.th-sofa { position: absolute; left: 50%; bottom: 26px; width: 330px; height: 170px; margin-left: -165px; z-index: 0; }
.th-sofaBack { position: absolute; left: 30px; right: 30px; top: 0; height: 120px; border-radius: 40px 40px 14px 14px; background: linear-gradient(180deg, #FFB8CB, #FF9DBA); box-shadow: 0 0 0 4px #fff inset; }
.th-sofaArmL, .th-sofaArmR { position: absolute; top: 56px; width: 64px; height: 100px; border-radius: 32px 32px 14px 14px; background: linear-gradient(180deg, #FFA8C0, #FF8FAB); box-shadow: 0 0 0 4px #fff inset, 0 6px 0 #E0607E; }
.th-sofaArmL { left: 0; }
.th-sofaArmR { right: 0; }
.th-sofaSeat { position: absolute; left: 44px; right: 44px; bottom: 10px; height: 60px; border-radius: 18px; background: #FFC2D2; box-shadow: 0 0 0 4px #fff inset, 0 6px 0 #E0607E; }
.th-cushion { position: absolute; left: 50px; top: 30px; width: 64px; height: 54px; border-radius: 18px; background: radial-gradient(circle at 50% 50%, #FFE27A 0 20%, #FFF3C9 21%); transform: rotate(-12deg); box-shadow: 0 0 0 3px #fff inset; }
.th-squeezeTeddy { all: unset; position: relative; z-index: 2; cursor: pointer; transform-origin: 50% 100%; touch-action: none; -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none; }
.th-squeezeTeddy:focus-visible { outline: 3px dashed ${TH.pinkDeep}; outline-offset: 6px; border-radius: 30px; }
.th-squeezeTeddy[disabled] { cursor: default; }
.th-count { position: relative; z-index: 3; display: flex; gap: 4px; margin-top: 8px; padding: 5px 10px; border-radius: 99px; background: rgba(255,255,255,.85); }
.th-cuddleGif { position: absolute; left: max(-4px, calc(50% - 196px)); bottom: 44px; z-index: 4; }
.th-loveGif { position: absolute; right: max(-4px, calc(50% - 190px)); bottom: 70px; z-index: 4; }
.th-doneRow { display: grid; justify-items: center; gap: 2px; }
.th-letterWrap { position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; padding: 70px 16px 24px; background: rgba(255,233,240,.72); backdrop-filter: none; }
.th-letter { position: relative; width: min(100%, 420px); max-height: calc(100dvh - 110px); overflow: auto; padding: 24px 22px 18px; border-radius: 22px; text-align: left;
  background: repeating-linear-gradient(180deg, #FFFDF8 0 31px, #F7DCE4 31px 32px); box-shadow: 0 0 0 4px #fff inset, 0 20px 40px rgba(224,96,126,.28);
  font: 400 20px/32px ${HAND}; color: ${TH.ink}; display: grid; gap: 0; }
.th-letter p { margin: 0 0 32px; }
.th-letter p:last-of-type { margin-bottom: 8px; }
.th-letterTo { font-family: ${DISPLAY}; font-weight: 800; font-size: 20px; color: ${TH.pinkDeep}; }
.th-letterSign { text-align: right; color: ${TH.pinkDeep}; }
.th-letter .th-puffy { justify-self: center; margin-top: 6px; }
@media (max-height: 740px) { .th-bubbleSlot { min-height: 140px; } }
`;
