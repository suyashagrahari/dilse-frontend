"use client";

// Find the ring: three wiggling gift boxes. Whatever she taps first holds a chocolate, the second a teddy ("not
// yet 😝"), the third always holds the ring: its lid flies off, it glows, "ding-ding!", a sparkle burst, and the
// peeking cat (slot pp-peek) is replaced by a penguin sliding in with a ring.

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { Btn, DECOR, Gif, Head, LinkBtn, SlotGif } from "./parts";
import type { Story } from "./util";

const BOXES = [
  { body: "#C9B6FF", lid: "#A07BFF", ribbon: "#FF4D6D" },
  { body: "#FFB3D6", lid: "#FF8FB8", ribbon: "#7A52E0" },
  { body: "#A8E6CF", lid: "#7FD3B2", ribbon: "#FF4D6D" },
];

type Found = "chocolate" | "teddy" | "ring";

export function FindRing({ story, day, data, onNext }: { story: Story; day: DayConfig; data: ValentineDayData; onNext: () => void }) {
  const { sfx } = usePremium();
  const [opened, setOpened] = useState<(Found | null)[]>([null, null, null]);
  const [note, setNote] = useState<string | null>(null);
  const picks = opened.filter(Boolean).length;
  const found = opened.includes("ring");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const pick = (k: number) => {
    if (opened[k] || found) return;
    const what: Found = picks === 0 ? "chocolate" : picks === 1 ? "teddy" : "ring";
    const next = opened.slice();
    next[k] = what;
    setOpened(next);
    const r = refs.current[k]?.getBoundingClientRect();
    const origin = r ? { x: (r.left + r.width / 2) / window.innerWidth, y: r.top / window.innerHeight } : { x: 0.5, y: 0.5 };
    if (what === "ring") {
      setNote(null);
      sfx("lp-boing");
      sfx("lp-ding", { at: 0.2 });
      sfx("sparkle", { at: 0.3 });
      haptic([15, 40, 25]);
      window.setTimeout(() => burst({ kind: "sparkles", origin, count: 24 }), 200);
    } else {
      setNote(what === "chocolate" ? story.decoys[0] : story.decoys[1]);
      sfx("lp-boing", { detune: picks * 150 });
      sfx("plush-squeak", { at: 0.2, gain: 0.6 });
      haptic(12);
      burst({ kind: "hearts", origin, count: 10 });
    }
  };
  const openAll = () => {
    // "do it for me": open the remaining boxes one by one
    const order = [0, 1, 2].filter((k) => !opened[k]);
    let cur = opened.slice();
    let n = picks;
    order.forEach((k, j) => {
      window.setTimeout(() => {
        const what: Found = n === 0 ? "chocolate" : n === 1 ? "teddy" : "ring";
        n++;
        cur = cur.slice();
        cur[k] = what;
        setOpened(cur);
        sfx(what === "ring" ? "lp-ding" : "lp-boing");
        if (what === "ring") {
          setNote(null);
          burst({ kind: "sparkles", origin: { x: 0.5, y: 0.5 }, count: 24 });
        } else setNote(what === "chocolate" ? story.decoys[0] : story.decoys[1]);
      }, j * 650);
    });
  };

  return (
    <div className="lp-scene lp-find">
      <Head kicker="Wait, where did I put it?" title={found ? "You found it! 💍" : "Find the ring"} sub={found ? "Hold that thought. One more thing first." : "One of these boxes has it. Pick one."} />
      <div className="lp-boxes">
        {BOXES.map((b, k) => {
          const got = opened[k];
          return (
            <button
              type="button"
              key={k}
              ref={(el) => {
                refs.current[k] = el;
              }}
              className={`lp-box${got ? " is-open" : ""}${got === "ring" ? " is-ring" : ""}`}
              style={{ ["--b" as string]: b.body, ["--l" as string]: b.lid, ["--r" as string]: b.ribbon, animationDelay: `${k * 0.35}s` }}
              onClick={() => pick(k)}
              disabled={!!got || found}
              aria-label={got ? (got === "ring" ? "The ring!" : `A ${got}`) : `Gift box ${k + 1}`}
            >
              <span className="lp-box-glow" aria-hidden />
              <AnimatePresence>
                {got && (
                  <motion.span className="lp-box-prize" initial={{ y: 30, scale: 0.4, opacity: 0 }} animate={{ y: -58, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 420, damping: 14, delay: 0.12 }}>
                    {got === "ring" ? (
                      <span className="lp-ringPrize">
                        <Gif src={DECOR.ring} size={86} eager />
                      </span>
                    ) : (
                      <Gif src={got === "chocolate" ? DECOR.chocolate : DECOR.teddy} size={78} eager />
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="lp-box-lid" aria-hidden />
              <span className="lp-box-body" aria-hidden />
              {got && got !== "ring" && <span className="lp-box-tag">not yet 😝</span>}
            </button>
          );
        })}
      </div>
      <div className="lp-find-note" aria-live="polite">
        {note && (
          <motion.p key={note} className="lp-sticky" initial={{ scale: 0.5, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
            {note}
          </motion.p>
        )}
      </div>
      <div className="lp-find-peek">
        {found ? <Gif src={DECOR.ringFound} size={118} eager /> : <SlotGif day={day} data={data} id="pp-peek" size={104} eager />}
      </div>
      <div className="lp-actions">
        {found ? (
          <div className="lp-pop" style={{ animationDelay: ".6s" }}>
            <Btn onClick={onNext}>Wait, there&rsquo;s a letter 💌</Btn>
          </div>
        ) : (
          <LinkBtn onClick={openAll}>{picks ? "open the rest for me" : "open them for me"}</LinkBtn>
        )}
      </div>
    </div>
  );
}
