"use client";

// Chapter III · The exhibits (only when there are photos the clauses didn't
// use). A neat pile of prints, each tagged "Exhibit B, C…": flick the top one
// aside (or tap it) to file it and see the next. The last one stays.

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useState } from "react";
import { haptic } from "../../../_valentine/kit";
import { CinematicPhoto, PremiumCTA, sfx } from "../../../_valentine/kit/premium";
import type { LovePhoto } from "../../../_valentine/types";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

const letter = (k: number) => String.fromCharCode(66 + Math.min(k, 24)); // B, C, D…

function Print({ p, k, top, onGone }: { p: LovePhoto; k: number; top: boolean; onGone: () => void }) {
  const x = useMotionValue(0);
  const rot = useTransform(x, [-200, 0, 200], [-14, k % 2 ? 2.5 : -2.5, 14]);
  const fling = (dir: number) => {
    sfx("sp-flick", { gain: 0.9, pan: dir * 0.4 });
    haptic(8);
    void animate(x, dir * 520, { duration: 0.45, ease: [0.22, 1, 0.36, 1] }).then(onGone);
  };
  return (
    <motion.div
      className="sp-exPrint"
      style={{ x, rotate: rot, zIndex: 50 - k }}
      drag={top ? "x" : false}
      dragElastic={0.6}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 500) fling(Math.sign(info.offset.x || info.velocity.x));
      }}
      onTap={() => top && fling(k % 2 ? -1 : 1)}
      aria-hidden={!top}
    >
      <div className="sp-exMat">
        <CinematicPhoto photo={p} grade="warm" kenBurns={top ? "in" : false} focusPull={false} caption="" aspect="4 / 5" eager={k < 3} />
        <p className="sp-exCap">
          <b>Exhibit {letter(k)}</b>
          {p.caption ? ` · ${p.caption}` : ""}
        </p>
      </div>
    </motion.div>
  );
}

export default function ExhibitsScene({ photos, onNext }: { photos: LovePhoto[]; onNext: () => void }) {
  const [gone, setGone] = useState(0);
  const left = photos.slice(gone);
  const last = left.length <= 1;
  return (
    <Scene label="The exhibits" className="sp-ex">
      <Eyebrow>Evidence, for the record</Eyebrow>
      <div className="sp-exPile">
        {left
          .slice(0, 4)
          .map((p, j) => <Print key={gone + j} p={p} k={gone + j} top={j === 0 && !last} onGone={() => setGone((g) => g + 1)} />)
          .reverse()}
      </div>
      <p className="sp-exHint" aria-live="polite">
        {last ? "The defence rests." : `Flick it aside · ${left.length - 1} more`}
      </p>
      <div className="sp-foot">
        <PremiumCTA style={CTA_STYLE} tone="pearl" cue="page-turn" onClick={onNext}>
          {last ? "To the schedule" : "Skip the evidence"}
        </PremiumCTA>
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.sp-ex .sp-in { gap: 16px; }
.sp-exPile { position: relative; width: min(70vw, 320px); aspect-ratio: 4 / 5.2; margin-top: 18px; }
@media (max-height: 740px) { .sp-exPile { width: min(58vw, 260px); } }
.sp-exPrint { position: absolute; inset: 0; touch-action: pan-y; cursor: grab; }
.sp-exPrint:active { cursor: grabbing; }
.sp-exMat { background: #fbf8f1; padding: 9px 9px 36px; box-shadow: 0 30px 50px -22px rgba(0,0,0,.9); position: relative; height: 100%; box-sizing: border-box; }
.sp-exCap { position: absolute; left: 10px; right: 10px; bottom: 11px; margin: 0; text-align: left; font: italic 400 15px/1 var(--sp-serif); color: var(--sp-navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sp-exCap b { font: 700 9.5px/1 var(--sp-type); font-style: normal; letter-spacing: .24em; text-transform: uppercase; color: var(--sp-ox); }
.sp-exHint { margin: 6px 0 0; font: 700 10.5px/1 var(--sp-type); letter-spacing: .26em; text-transform: uppercase; color: rgba(245,239,226,.6); }
`;
