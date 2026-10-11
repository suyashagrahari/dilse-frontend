"use client";

// Promises in photos: a memory lane of her photos as taped polaroids she swipes through. A yellow sticky note is
// stuck on each one ("for this one…"); she taps it and it flips over to the promise he made for that memory.
// When every note is flipped the cats boop noses and the love lock is next.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { burst, haptic } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import { Btn, DECOR, Gif, Head, LinkBtn, Polaroid } from "./parts";
import { originOf, type Club } from "./util";

const TAPES = ["peach", "lilac", "mint"] as const;

export function Lane({ club, onNext }: { club: Club; onNext: () => void }) {
  const { sfx } = usePremium();
  const cards = club.lane;
  const [flipped, setFlipped] = useState<boolean[]>(() => cards.map(() => false));
  const track = useRef<HTMLDivElement | null>(null);
  const notes = useRef<(HTMLButtonElement | null)[]>([]);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const count = flipped.filter(Boolean).length;
  const all = count >= cards.length;

  const done = useRef<boolean[]>(cards.map(() => false));
  const flip = (k: number, quiet = false) => {
    if (done.current[k]) return;
    done.current[k] = true;
    setFlipped([...done.current]);
    sfx("pk-star", { detune: k * 90, gain: quiet ? 0.6 : 1 });
    haptic(10);
    burst({ kind: "sparkles", origin: originOf(notes.current[k]), count: 10 });
    const after = done.current.filter(Boolean).length;
    if (after >= cards.length) {
      timers.current.push(
        window.setTimeout(() => {
          sfx("pk-tada");
          haptic([15, 40, 25]);
          burst({ kind: "hearts", origin: { x: 0.5, y: 0.55 }, count: 18 });
        }, 500),
      );
    } else if (!quiet) {
      // glide to the next card that still has a note to flip
      timers.current.push(
        window.setTimeout(() => {
          const el = track.current?.children[k + 1] as HTMLElement | undefined;
          el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }, 900),
      );
    }
  };

  const flipAll = () => {
    let i = 0;
    cards.forEach((_, k) => {
      if (!done.current[k]) timers.current.push(window.setTimeout(() => flip(k, true), i++ * 280));
    });
  };

  return (
    <div className={`pk-scene pk-lane${all ? " is-done" : ""}`}>
      <Head kicker="Promises in photos" title={all ? "Every one, kept 💛" : "Flip the sticky notes"} sub={all ? undefined : "Each photo has a promise stuck to it"} />
      <div className="pk-count" aria-live="polite">
        {count} of {cards.length} found
      </div>
      <div className="pk-track" ref={track}>
        {cards.map((c, k) => (
          <div className="pk-laneCard" key={k}>
            <Polaroid photo={c.photo} tilt={k % 2 ? 2.5 : -2.5} tape={TAPES[k % 3]} eager={k < 2} caption={c.caption ? <span className="pk-cap">{c.caption}</span> : undefined}>
              <button
                ref={(el) => {
                  notes.current[k] = el;
                }}
                type="button"
                className={`pk-flip${flipped[k] ? " is-flipped" : ""}`}
                onClick={() => flip(k)}
                aria-label={flipped[k] ? c.promise : "Flip the sticky note"}
                style={{ ["--tilt" as string]: `${k % 2 ? -5 : 4}deg` }}
              >
                <span className="pk-flipFace front">
                  for this one…
                  <small>tap me</small>
                </span>
                <span className="pk-flipFace back">{c.promise}</span>
              </button>
            </Polaroid>
          </div>
        ))}
      </div>
      <div className="pk-laneGif">
        <Gif src={all ? DECOR.laneDone : DECOR.lane} size={all ? 96 : 84} className={all ? "pk-pop" : ""} key={all ? "done" : "lane"} />
      </div>
      <div className="pk-actions">
        {all ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <Btn onClick={onNext}>One last thing… 🔐</Btn>
          </motion.div>
        ) : (
          count > 0 && <LinkBtn onClick={flipAll}>flip the rest for me</LinkBtn>
        )}
      </div>
    </div>
  );
}
