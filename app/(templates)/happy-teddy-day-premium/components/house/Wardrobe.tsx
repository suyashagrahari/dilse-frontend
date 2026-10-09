"use client";

// Room 2 · The wardrobe. Six pieces on a little shelf (the sender's picks first, each carrying his note). Drag one
// onto the teddy, or tap it: it boings on (one piece per spot: a crown swaps out the cap), he does a happy little
// jump, and the note pops up ("Because you tie my whole life together."). Tap a worn piece to take it off. What
// she puts on him stays on him in every room after this, and on the certificate.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TeddyItem } from "../../../_valentine/days/happy-teddy-day-premium";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import { ItemIcon, Teddy, type Mood, type Pose } from "./art";
import { HAND } from "./fonts";
import { GIF } from "./gifs";
import { ITEM_LABEL, TH, wear, type House, type Piece } from "./model";
import { Gif, Header, Hint, JELLY, Note, POP, Puffy } from "./ui";

export default function Wardrobe({
  h, poser, step, total, name, worn, setWorn, onNext,
}: { h: House; poser: string | null; step: number; total: number; name: string; worn: TeddyItem[]; setWorn: (w: TeddyItem[]) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [note, setNote] = useState<Piece | null>(null);
  const [tries, setTries] = useState(0);
  const [hop, setHop] = useState(0);
  const [mood, setMood] = useState<Mood>("happy");
  const [pose, setPose] = useState<Pose>("down");
  const teddyRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(0);
  const t = useRef<number[]>([]);
  useEffect(() => {
    const ids = t.current;
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, []);

  const put = (p: Piece) => {
    const on = worn.includes(p.item);
    setWorn(wear(worn, p.item));
    setHop((x) => x + 1);
    haptic(on ? 8 : [12, 30, 12]);
    if (on) {
      sfx("pop", { gain: 0.4, detune: -300 });
      setNote(null);
      return;
    }
    setTries((x) => x + 1);
    sfx("th-boing", { gain: 0.7 });
    sfx("sparkle", { gain: 0.3, at: 0.15 });
    setMood(p.item === "glasses" ? "wink" : "love");
    setPose("up");
    t.current.push(window.setTimeout(() => {
      setPose("down");
      setMood("happy");
    }, reduce ? 200 : 1300));
    const r = teddyRef.current?.getBoundingClientRect();
    if (r) burst({ kind: "sparkles", origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.3) / window.innerHeight }, count: 12, emojis: ["✨", "💗", "⭐"] });
    setNote(p.note ? p : { item: p.item, note: "" });
  };

  const onDrop = (p: Piece) => (_: unknown, info: { point: { x: number; y: number } }) => {
    const r = teddyRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = info.point.x - window.scrollX;
    const y = info.point.y - window.scrollY;
    dragged.current = Date.now();
    if (x > r.left - 20 && x < r.right + 20 && y > r.top - 30 && y < r.bottom + 20) put(p);
  };

  const ready = tries >= 2 || h.wardrobe.filter((w) => w.note).every((w) => worn.includes(w.item));
  const fallback = (p: Piece) => (p.note ? p.note : CUTE[p.item]);

  return (
    <div className="th-scene th-wardrobe">
      <Header step={step} total={total} room="Room 2 · The wardrobe" title={<>Make <em>{name}</em> look cute</>} sub="Drag something onto him, or just tap it." />

      <div className="th-mirror">
        <AnimatePresence mode="wait">
          {note && (
            <Note key={`${note.item}-${tries}`} tilt={-2} className="th-pieceNote">
              <span className="th-pieceLabel">
                <ItemIcon id={note.item} size={26} /> {ITEM_LABEL[note.item]}
              </span>
              <span className="th-pieceLine">{fallback(note)}</span>
            </Note>
          )}
        </AnimatePresence>
        <motion.div
          ref={teddyRef}
          key={hop}
          className="th-mirrorTeddy"
          initial={hop ? { scaleX: 1.12, scaleY: 0.86, y: 6 } : false}
          animate={{ scaleX: 1, scaleY: 1, y: 0 }}
          transition={JELLY}
        >
          <Teddy size={178} mood={mood} pose={pose} worn={worn} heart />
          <span className="th-tag th-nameTagSm">{name}</span>
        </motion.div>
        <Gif src={poser} size={92} tilt={-8} className="th-poserGif" />
        {tries >= 2 && <Gif src={GIF.heartEyes} size={54} tilt={10} className="th-wowGif" eager />}
      </div>

      <div className="th-shelf" role="group" aria-label="Accessories">
        {h.wardrobe.map((p) => {
          const on = worn.includes(p.item);
          return (
            <motion.button
              key={p.item}
              type="button"
              className={`th-piece${on ? " is-on" : ""}${p.note ? " has-note" : ""}`}
              onClick={() => Date.now() - dragged.current > 350 && put(p)}
              onDragStart={() => (dragged.current = Date.now())}
              drag
              dragSnapToOrigin
              dragElastic={0.7}
              dragMomentum={false}
              onDragEnd={onDrop(p)}
              whileDrag={{ scale: 1.2, zIndex: 10 }}
              whileTap={{ scale: 0.92 }}
              aria-pressed={on}
              aria-label={`${on ? "Take off" : "Put on"} the ${ITEM_LABEL[p.item].toLowerCase()}`}
            >
              <ItemIcon id={p.item} size={46} />
              <span>{ITEM_LABEL[p.item]}</span>
              {p.note && !on && <i className="th-pieceDot" aria-hidden>💌</i>}
              {on && <i className="th-pieceCheck" aria-hidden>✓</i>}
            </motion.button>
          );
        })}
      </div>

      <div className="th-foot">
        {ready ? (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={POP}>
            <Puffy onClick={onNext}>He looks perfect →</Puffy>
          </motion.div>
        ) : (
          <Hint>💌 = a note from {h.sender || "them"} inside</Hint>
        )}
      </div>
      <style>{WARDROBE_CSS}</style>
    </div>
  );
}

const CUTE: Record<TeddyItem, string> = {
  bow: "Cute. Very cute. Dangerously cute.",
  sweater: "Cosy mode: on.",
  crown: "Royalty. Obviously.",
  glasses: "Too cool for this house.",
  scarf: "Ready for winter cuddles.",
  flower: "Now he smells like a garden.",
  cap: "Sporty, but soft.",
  bowtie: "Dressed for a date.",
};

const WARDROBE_CSS = `
.th-mirror { position: relative; display: grid; justify-items: center; width: 100%; min-height: 300px; margin-top: 4px; }
.th-pieceNote { position: absolute; top: -6px; z-index: 5; display: grid; gap: 4px; text-align: left; max-width: min(320px, 88vw); }
.th-pieceLabel { display: inline-flex; align-items: center; gap: 6px; font: 800 11px/1 var(--font-th-body), sans-serif; letter-spacing: .12em; text-transform: uppercase; color: ${TH.pinkDeep}; }
.th-pieceLine { font: 400 21px/1.25 ${HAND}; color: ${TH.ink}; }
.th-mirrorTeddy { position: relative; margin-top: 74px; transform-origin: 50% 100%; }
.th-nameTagSm { position: absolute; right: -26px; bottom: 14px; font-size: 18px; padding: 4px 10px; transform: rotate(-5deg); }
.th-poserGif { position: absolute; left: max(-4px, calc(50% - 196px)); bottom: 6px; z-index: 4; }
.th-wowGif { position: absolute; right: max(4px, calc(50% - 170px)); top: 92px; z-index: 4; }
.th-shelf { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; width: min(100%, 372px); padding: 12px; border-radius: 26px;
  background: linear-gradient(180deg, #FFF3E2, #FBE2C8); box-shadow: 0 0 0 3px #fff inset, 0 8px 0 #E8C9A8, 0 16px 28px rgba(201,138,75,.22); }
.th-piece { all: unset; box-sizing: border-box; position: relative; cursor: grab; display: grid; justify-items: center; gap: 4px; padding: 8px 4px 9px; border-radius: 18px; background: #fff;
  box-shadow: 0 0 0 2px #F5DCC2 inset, 0 4px 0 #EBCFB0; touch-action: none; -webkit-tap-highlight-color: transparent; }
.th-piece span { font: 800 12px/1.1 var(--font-th-body), sans-serif; color: ${TH.inkSoft}; }
.th-piece.is-on { background: ${TH.pinkSoft}; box-shadow: 0 0 0 2px #fff inset, 0 4px 0 ${TH.pink}; }
.th-piece:focus-visible { outline: 3px solid ${TH.pinkDeep}; outline-offset: 2px; }
.th-pieceDot { position: absolute; top: -6px; right: -4px; font-style: normal; font-size: 18px; animation: th-wiggle 2.8s ease-in-out infinite; }
.th-pieceCheck { position: absolute; top: -7px; right: -5px; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font: 900 13px/1 var(--font-th-body), sans-serif; font-style: normal; color: #fff; background: ${TH.pinkDeep}; box-shadow: 0 0 0 2px #fff; }
@media (max-height: 740px) { .th-mirror { min-height: 270px; } .th-mirrorTeddy { margin-top: 64px; } }
`;
