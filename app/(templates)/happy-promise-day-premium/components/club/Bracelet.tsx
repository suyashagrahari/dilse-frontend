"use client";

// The friendship bracelet. A cord hangs across the card with a heart bead at each end and dotted spots for his
// word (her name, a nickname, or US). She taps the letter beads in the tray in order; each one hops onto the cord
// with a wooden clack (a wrong one wiggles back: "not that one 🙈"). When the word is spelled the knot ties into a
// bow and the bracelet shines. The pandas (slot pk-bracelet) watch.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { burst, haptic } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { Btn, DECOR, Gif, Head, LinkBtn, SlotGif } from "./parts";
import { originOf, type Club } from "./util";

const BEAD_PAINT = ["#FFB59E", "#C9B6FF", "#9FE5C8", "#FFB3D6", "#FFD27A", "#A8D8FF"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** The tray: the word's letters + up to two decoys, shuffled deterministically (no hydration jitter). */
function makeTray(word: string) {
  const decoys = ["X", "O", "Q", "Z", "K", "J"].filter((c) => !word.includes(c)).slice(0, word.length > 4 ? 1 : 2);
  const beads = [...word].map((ch, i) => ({ ch, id: `w${i}` })).concat(decoys.map((ch, i) => ({ ch, id: `d${i}` })));
  let h = hash(word);
  for (let i = beads.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0;
    const j = h % (i + 1);
    [beads[i], beads[j]] = [beads[j], beads[i]];
  }
  return beads;
}

export function Bracelet({ club, day, data, onNext }: { club: Club; day: DayConfig; data: ValentineDayData; onNext: () => void }) {
  const { sfx } = usePremium();
  const word = club.word;
  const tray = useMemo(() => makeTray(word), [word]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [nope, setNope] = useState<string | null>(null);
  const [tied, setTied] = useState(false);
  const cord = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const n = word.length;

  const finish = () => {
    timers.current.push(
      window.setTimeout(() => {
        setTied(true);
        sfx("ribbon");
        sfx("pk-tada", { at: 0.25 });
        sfx("sparkle", { at: 0.45 });
        haptic([15, 40, 25]);
        burst({ kind: "hearts", origin: originOf(cord.current, 0.6), count: 20 });
      }, 420),
    );
  };

  const take = (id: string, ch: string) => {
    if (tied || placed.includes(id)) return;
    const k = placed.length;
    if (ch !== word[k]) {
      setNope(id);
      sfx("pk-boop");
      haptic(8);
      timers.current.push(window.setTimeout(() => setNope(null), 900));
      return;
    }
    const next = [...placed, id];
    setPlaced(next);
    setNope(null);
    sfx("pk-bead", { detune: k * 80 });
    haptic(10);
    if (next.length >= n) finish();
  };

  /** "string it for me": the right beads hop on one by one. */
  const auto = () => {
    let k = placed.length;
    const used = new Set(placed);
    const seq: string[] = [];
    for (; k < n; k++) {
      const b = tray.find((t) => !used.has(t.id) && t.ch === word[k]);
      if (!b) break;
      used.add(b.id);
      seq.push(b.id);
    }
    seq.forEach((id, i) =>
      timers.current.push(
        window.setTimeout(() => {
          setPlaced((p) => (p.includes(id) ? p : [...p, id]));
          sfx("pk-bead", { detune: (placed.length + i) * 80 });
          if (i === seq.length - 1 && placed.length + seq.length >= n) finish();
        }, i * 260),
      ),
    );
  };

  const beadOf = (id: string) => tray.find((t) => t.id === id);
  const paint = (id: string) => BEAD_PAINT[tray.findIndex((t) => t.id === id) % BEAD_PAINT.length];
  // the beads sit on the cord: a quadratic from (6,22) through (150,84) to (294,22) in a 300×90 box,
  // so x is linear in t and y = 22 + 124·t·(1−t)
  const spot = (i: number) => {
    const t = n === 1 ? 0.5 : 0.14 + (0.72 * i) / (n - 1);
    return { fx: (6 + 288 * t) / 300, y: 22 + 124 * t * (1 - t) };
  };

  return (
    <div className={`pk-scene pk-bracelet${tied ? " is-tied" : ""}`}>
      <Head kicker="The club bracelet" title={tied ? "Tied. Forever 📿" : "String our bracelet"} sub={tied ? undefined : `Tap the beads in order to spell ${word === "US" ? "us" : "the word"}`} />

      <div className="pk-cordCard" ref={cord}>
        <svg className="pk-cord" viewBox="0 0 300 90" preserveAspectRatio="none" aria-hidden>
          <path d="M6 22 Q150 84 294 22" fill="none" stroke="#E0603F" strokeWidth="3" strokeLinecap="round" />
          <path d="M6 22 Q150 84 294 22" fill="none" stroke="#FFD3B8" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 5" />
        </svg>
        <span className="pk-endBead l" aria-hidden>
          ♥
        </span>
        <span className="pk-endBead r" aria-hidden>
          ♥
        </span>
        <div className="pk-slots">
          {[...word].map((ch, i) => {
            const id = placed[i];
            const sp = spot(i);
            return (
              <span key={i} className="pk-slotSpot" style={{ left: `calc(10px + (100% - 20px) * ${sp.fx.toFixed(4)})`, top: `${30 + sp.y}px` }}>
                {id ? (
                  <motion.span layoutId={`bead-${id}`} className="pk-bead on" style={{ background: paint(id) }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
                    {beadOf(id)?.ch}
                  </motion.span>
                ) : (
                  <span className="pk-bead ghost" aria-hidden>
                    {ch}
                  </span>
                )}
              </span>
            );
          })}
        </div>
        {tied && (
          <motion.span className="pk-bow" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 420, damping: 12 }} aria-hidden>
            <svg viewBox="0 0 60 40" width="64" height="44">
              <path d="M30 20 C18 4 4 6 6 18 C8 30 22 28 30 20 Z" fill="#FF8A6B" stroke="#E0603F" strokeWidth="2" />
              <path d="M30 20 C42 4 56 6 54 18 C52 30 38 28 30 20 Z" fill="#FF8A6B" stroke="#E0603F" strokeWidth="2" />
              <path d="M28 22 L20 38 M32 22 L40 38" stroke="#E0603F" strokeWidth="3" strokeLinecap="round" />
              <circle cx="30" cy="20" r="5" fill="#FFB59E" stroke="#E0603F" strokeWidth="2" />
            </svg>
          </motion.span>
        )}
        {tied && <span className="pk-shine" aria-hidden />}
      </div>

      <div className="pk-tray" role="group" aria-label="Letter beads" style={{ opacity: tied ? 0 : 1, pointerEvents: tied ? "none" : undefined }}>
        {tray.map((b) =>
          placed.includes(b.id) ? (
            <span key={b.id} className="pk-bead gone" aria-hidden />
          ) : (
            <motion.button
              key={b.id}
              layoutId={`bead-${b.id}`}
              type="button"
              className={`pk-bead tray${nope === b.id ? " is-nope" : ""}`}
              style={{ background: paint(b.id) }}
              onClick={() => take(b.id, b.ch)}
              whileTap={{ scale: 0.88 }}
              disabled={tied}
              aria-label={`Bead ${b.ch}`}
            >
              {b.ch}
            </motion.button>
          ),
        )}
      </div>

      <div className="pk-brSay" aria-live="polite">
        {nope && !tied && <p className="pk-bubble small pk-pop">not that one 🙈</p>}
        {!nope && !tied && <SlotGif day={day} data={data} id="pk-bracelet" size={96} eager />}
        {tied && <Gif src={DECOR.braceletDone} size={104} className="pk-pop" eager />}
      </div>

      <div className="pk-actions">
        {tied ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <Btn onClick={onNext}>There&rsquo;s a diary too 📔</Btn>
          </motion.div>
        ) : (
          <LinkBtn onClick={auto}>string it for me</LinkBtn>
        )}
      </div>
    </div>
  );
}
