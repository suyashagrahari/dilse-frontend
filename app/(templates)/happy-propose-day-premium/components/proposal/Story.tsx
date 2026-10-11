"use client";

// How it started: a little stack of polaroid story cards (photo + washi label + one handwritten line). Swipe the
// top card away (or tap "next"); a reactor sticker watches from behind the stack. The last swipe is the "aww":
// a heart burst, a chime, and the sticker swaps to a nose-boop.

import { useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { Btn, DECOR, Gif, Head, LinkBtn, Polaroid, SlotGif } from "./parts";
import type { Story as S } from "./util";

const TILTS = [-3, 2.5, -1.5, 3];
const TAPES = ["pink", "lilac", "mint", "pink"] as const;

export function Story({ story, day, data, onNext }: { story: S; day: DayConfig; data: ValentineDayData; onNext: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const cards = story.cards;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const done = i >= cards.length;

  const celebrate = () =>
    window.setTimeout(() => {
      sfx("chime");
      sfx("sparkle", { at: 0.15 });
      haptic([15, 40, 25]);
      burst({ kind: "hearts", origin: { x: 0.5, y: 0.45 }, count: 22 });
    }, 220);

  const advance = (d = 1) => {
    if (done) return;
    setDir(d);
    const n = i + 1;
    setI(n);
    sfx("lp-swipe", { pan: d * 0.4 });
    haptic(10);
    if (n >= cards.length) celebrate();
  };

  const skip = () => {
    if (done) return;
    setI(cards.length);
    celebrate();
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 500) advance(info.offset.x > 0 ? 1 : -1);
  };

  return (
    <div className="lp-scene lp-story">
      <Head kicker="Chapter one" title="How it started" sub={done ? undefined : "Swipe the cards →"} />
      <div className="lp-stack">
        {!done && (
          <span className="lp-count" aria-live="polite">
            {i + 1} / {cards.length}
          </span>
        )}
        <AnimatePresence initial={false} custom={dir}>
          {cards.map((c, k) =>
            k < i ? null : (
              <motion.div
                key={k}
                className="lp-card"
                style={{ zIndex: 10 - (k - i) }}
                initial={false}
                animate={{ scale: 1 - (k - i) * 0.05, y: (k - i) * 12, opacity: k - i > 2 ? 0 : 1, rotate: TILTS[k % 4] }}
                exit={reduce ? { opacity: 0 } : { x: dir * 420, rotate: dir * 24, opacity: 0, transition: { duration: 0.42, ease: [0.3, 0.7, 0.4, 1] } }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                drag={k === i ? "x" : false}
                dragSnapToOrigin
                dragElastic={0.7}
                onDragEnd={k === i ? onDragEnd : undefined}
                whileDrag={{ scale: 1.03 }}
                onTap={k === i ? () => advance(1) : undefined}
              >
                <Polaroid
                  photo={c.photo}
                  tape={TAPES[k % 4]}
                  eager={k < 2}
                  caption={
                    <>
                      {c.when && <span className="lp-when">{c.when}</span>}
                      {c.what && <span className="lp-what">{c.what}</span>}
                    </>
                  }
                />
              </motion.div>
            ),
          )}
        </AnimatePresence>
        {done && (
          <motion.div className="lp-story-done" initial={{ scale: 0.4, rotate: -10, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15, mass: 0.8 }}>
            <div className="lp-fan">
              {cards.slice(0, 3).map((c, k) =>
                c.photo ? (
                  <motion.div key={k} className="lp-fan-card" initial={{ rotate: 0, x: 0, opacity: 0 }} animate={{ rotate: (k - 1) * 12, x: (k - 1) * 70, y: k === 1 ? -10 : 6, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 + k * 0.08 }}>
                    <Polaroid photo={c.photo} tape="none" />
                  </motion.div>
                ) : null,
              )}
              <Gif src={DECOR.storyDone} size={120} className="lp-fan-gif" eager />
            </div>
            <p className="lp-hand lp-big">…and that&rsquo;s how it started.</p>
            <p className="lp-sub">Every page since then has had you on it.</p>
          </motion.div>
        )}
        {!done && <SlotGif day={day} data={data} id="pp-story" size={104} className="lp-reactor" eager />}
      </div>
      <div className="lp-actions">
        {done ? (
          <Btn onClick={onNext}>Turn the page →</Btn>
        ) : (
          <>
            <Btn kind="soft" onClick={() => advance(1)}>
              Next card
            </Btn>
            <LinkBtn onClick={skip}>skip ›</LinkBtn>
          </>
        )}
      </div>
    </div>
  );
}
