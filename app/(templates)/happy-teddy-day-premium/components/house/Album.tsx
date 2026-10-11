"use client";

// Room 4 · The living room. "He's been keeping these safe": their photos as taped polaroids on his photo album's
// page, one at a time. Swipe (or tap the arrows) to turn: a page-turn swish, a new sticker on the corner, and the
// teddy, sitting at the bottom of the page holding its edge, reacts. After the last one he hugs the album.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import type { TeddyItem } from "../../../_valentine/days/happy-teddy-day-premium";
import { Teddy } from "./art";
import { HAND } from "./fonts";
import { GIF } from "./gifs";
import { TH, type House } from "./model";
import { Gif, Header, Hint, POP, Puffy } from "./ui";

const CORNER = [GIF.tinyPlush, GIF.nuzzle, GIF.hugsPanda, GIF.roseTeddy, GIF.cheekHug, GIF.whiteLove];
const TAPES = ["#FFD9E4", "#FFF3C9", "#D3F5E5", "#E2F1FF"];

export default function Album({ h, step, total, name, worn, onNext }: { h: House; step: number; total: number; name: string; worn: TeddyItem[]; onNext: () => void }) {
  const reduce = useReducedMotion();
  const photos = h.album;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [seen, setSeen] = useState(1);
  const last = i === photos.length - 1;
  const allSeen = seen >= photos.length;

  const go = (d: number) => {
    const ni = i + d;
    if (ni < 0 || ni >= photos.length) return;
    setDir(d);
    setI(ni);
    setSeen((s) => Math.max(s, ni + 1));
    sfx("page-turn", { gain: 0.55 });
    sfx("pop", { gain: 0.3, at: 0.18 });
    haptic(10);
  };

  const p = photos[i];
  return (
    <div className="th-scene th-album">
      <Header
        step={step}
        total={total}
        room="Room 4 · The living room"
        title={allSeen ? <>He loves <em>every</em> one of these</> : <>{name}&apos;s favourite photos</>}
        sub={!allSeen ? "He's been keeping these safe. Swipe through them." : undefined}
      />

      <div className="th-page">
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={i}
            className="th-pol"
            custom={dir}
            initial={reduce ? { opacity: 0 } : { x: dir * 260, rotate: dir * 12, opacity: 0 }}
            animate={{ x: 0, rotate: i % 2 ? 2.5 : -2.5, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: -dir * 260, rotate: -dir * 14, opacity: 0, transition: { duration: 0.28 } }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            drag={photos.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.55}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) go(1);
              else if (info.offset.x > 70) go(-1);
            }}
          >
            <span className="th-washi" style={{ background: TAPES[i % TAPES.length] }} aria-hidden />
            <div className="th-polImg">
              <CroppedPhoto photo={p} eager={i < 2} />
            </div>
            {p.caption && <span className="th-polCap">{p.caption}</span>}
            {p.note && <span className="th-polNote">{p.note}</span>}
            <Gif src={CORNER[i % CORNER.length]} size={74} tilt={i % 2 ? -10 : 10} className="th-polSticker" float={false} />
          </motion.div>
        </AnimatePresence>
        <motion.span className="th-albumTeddy" animate={allSeen && last ? { y: [0, -14, 0] } : { y: 0 }} transition={{ duration: 0.6 }}>
          <Teddy size={96} mood={allSeen && last ? "love" : i % 2 ? "happy" : "open"} pose={allSeen && last ? "up" : "down"} worn={worn} heart />
        </motion.span>
      </div>

      {photos.length > 1 && (
        <div className="th-turnRow">
          <button type="button" className="th-turn" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous photo">
            ‹
          </button>
          <span className="th-pageNo">
            {i + 1} / {photos.length}
          </span>
          <button type="button" className="th-turn" onClick={() => go(1)} disabled={last} aria-label="Next photo">
            ›
          </button>
        </div>
      )}

      <div className="th-foot">
        {allSeen ? (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={POP}>
            <Puffy onClick={onNext}>Snack time? →</Puffy>
          </motion.div>
        ) : (
          <Hint>Swipe the photo 👉</Hint>
        )}
      </div>
      <style>{ALBUM_CSS}</style>
    </div>
  );
}

const ALBUM_CSS = `
.th-page { position: relative; display: grid; justify-items: center; width: min(100%, 360px); min-height: 392px; padding: 18px 0 62px; margin-top: 2px; border-radius: 26px;
  background: linear-gradient(180deg, #FFF8EC, #FCEBD6); box-shadow: 0 0 0 3px #fff inset, 0 0 0 6px #F2D3B8, 0 18px 34px rgba(201,138,75,.22); }
.th-page::before { content: ""; position: absolute; left: 14px; top: 16px; bottom: 16px; width: 8px; border-radius: 8px; background: repeating-linear-gradient(180deg, #E8C9A8 0 10px, transparent 10px 20px); opacity: .7; }
.th-pol { position: relative; z-index: 2; width: min(56vw, 206px); background: #fff; padding: 10px 10px 12px; border-radius: 6px; box-shadow: 0 12px 26px rgba(120,70,30,.24); cursor: grab; touch-action: pan-y; }
.th-pol:active { cursor: grabbing; }
.th-washi { position: absolute; top: -12px; left: 50%; width: 86px; height: 24px; margin-left: -43px; opacity: .92; transform: rotate(-3deg); z-index: 3;
  -webkit-mask: linear-gradient(90deg, transparent 0 3px, #000 3px calc(100% - 3px), transparent calc(100% - 3px)); }
.th-polImg { aspect-ratio: 4 / 5; overflow: hidden; border-radius: 3px; background: ${TH.pinkSoft}; pointer-events: none; }
.th-polCap { display: block; padding: 8px 4px 0; font: 400 22px/1.1 ${HAND}; color: ${TH.ink}; text-align: center; }
.th-polNote { display: block; padding: 4px 4px 0; font: 700 13.5px/1.35 var(--font-th-body), sans-serif; color: ${TH.inkSoft}; text-align: center; text-wrap: pretty; }
.th-polSticker { position: absolute; right: -24px; top: -26px; z-index: 4; }
.th-albumTeddy { position: absolute; left: 50%; bottom: -40px; margin-left: -48px; z-index: 3; }
.th-turnRow { display: flex; align-items: center; gap: 14px; margin-top: 40px; }
.th-turn { all: unset; cursor: pointer; width: 46px; height: 46px; border-radius: 50%; display: grid; place-items: center; background: #fff; color: ${TH.pinkDeep}; font: 800 28px/1 var(--font-th-body), sans-serif; box-shadow: 0 0 0 2px ${TH.pinkSoft} inset, 0 4px 0 #F5C6D4; }
.th-turn[disabled] { opacity: .35; cursor: default; }
.th-turn:focus-visible { outline: 3px solid ${TH.pinkDeep}; outline-offset: 2px; }
.th-pageNo { font: 800 14px/1 var(--font-th-body), sans-serif; color: ${TH.inkSoft}; letter-spacing: .08em; min-width: 46px; text-align: center; }
@media (max-height: 740px) { .th-page { min-height: 350px; } .th-pol { width: min(48vw, 176px); } }
`;
