"use client";

// The rehearsal: a 4-panel comic of the sender practising the proposal and getting it wrong. Each panel is a
// pastel "?" tile; tapping it pops the panel open (boing + jelly) with its sticker and caption. When all four are
// open: a tiny tada and "Okay. The real thing now."

import { useState } from "react";
import { motion } from "framer-motion";
import { burst, haptic } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import { Btn, DECOR, Gif, Head, LinkBtn } from "./parts";
import type { Story } from "./util";

const TINTS = ["#FFE3EC", "#EDE3FF", "#DFF7EC", "#FFF1C9"];

export function Rehearsal({ story, onNext }: { story: Story; onNext: () => void }) {
  const { sfx } = usePremium();
  const panels = story.rehearsal;
  const [open, setOpen] = useState<boolean[]>(() => panels.map(() => false));
  const count = open.filter(Boolean).length;
  const done = count >= panels.length;

  const reveal = (k: number) => {
    if (open[k]) return;
    const next = open.map((o, j) => o || j === k);
    setOpen(next);
    sfx("lp-boing", { detune: k * 120 });
    sfx("pop", { at: 0.05, gain: 0.6 });
    haptic(12);
    if (next.every(Boolean)) {
      window.setTimeout(() => {
        sfx("lp-tada");
        haptic([15, 40, 25]);
        burst({ kind: "sparkles", origin: { x: 0.5, y: 0.5 }, count: 18 });
      }, 380);
    }
  };
  const revealAll = () => {
    setOpen(panels.map(() => true));
    sfx("lp-tada");
    burst({ kind: "sparkles", origin: { x: 0.5, y: 0.5 }, count: 18 });
  };
  const nextIdx = open.findIndex((o) => !o);

  return (
    <div className="lp-scene lp-rehearse">
      <Head kicker="Meanwhile, the night before" title="The rehearsal" sub={done ? undefined : "Tap each panel"} />
      <div className="lp-comic">
        {panels.map((line, k) => (
          <motion.button
            type="button"
            key={k}
            className={`lp-panel${open[k] ? " is-open" : ""}${k === nextIdx ? " is-next" : ""}`}
            style={{ background: TINTS[k % 4], rotate: k % 2 ? 1.2 : -1.2 }}
            onClick={() => reveal(k)}
            aria-label={open[k] ? line : `Comic panel ${k + 1}, tap to open`}
            animate={open[k] ? { scaleX: [1, 1.12, 0.94, 1.03, 1], scaleY: [1, 0.88, 1.06, 0.98, 1] } : undefined}
            transition={{ duration: 0.5 }}
            whileTap={{ scale: 0.94 }}
          >
            <span className="lp-take">Take {k + 1}</span>
            {open[k] ? (
              <>
                <Gif src={DECOR.rehearse[k % 4]} size={86} eager />
                <span className="lp-panel-cap">{line}</span>
              </>
            ) : (
              <span className="lp-panel-q" aria-hidden>
                ?
              </span>
            )}
          </motion.button>
        ))}
      </div>
      <div className="lp-actions">
        {done ? (
          <>
            <p className="lp-hand lp-mid lp-pop">Okay. The real thing now. Don&rsquo;t laugh.</p>
            <div className="lp-pop" style={{ animationDelay: ".25s" }}>
              <Btn onClick={onNext}>Where&rsquo;s the ring? 💍</Btn>
            </div>
          </>
        ) : (
          <LinkBtn onClick={revealAll}>open them all for me</LinkBtn>
        )}
      </div>
    </div>
  );
}
