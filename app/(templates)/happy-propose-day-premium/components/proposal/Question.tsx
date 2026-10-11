"use client";

// The question and the money moment.
//   ask      "{name}," + the question, a heart-shaped photo of them waiting with a "?" sparkle, the closed ring box
//            beside the proposing penguins (slot pp-ask). Yes / No: No runs, shrinks and begs through the sender's
//            lines (slot pp-please pops up beside the box), then gives up: "ok fine, YES 💍".
//   rolling  Yes → the riser (useSongDrop): the ring box shakes, a heartbeat
//   yes      on the peak (the song's chorus): the lid pops open, the ring flies up and lands on the heart photo,
//            confetti + hearts, and a wall of six celebrating stickers pops in one by one around them.
//            "{name} said YES!" + the sender's line typed out → "Make it official 📜"

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CroppedPhoto, RunawayNo, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { usePremium, useSongDrop } from "../../../_valentine/kit/premium";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { Btn, DECOR, Gif, RingArt, SlotGif, Spark, Typed } from "./parts";
import { STONES, type Story } from "./util";

export interface QuestionProps {
  story: Story;
  day: DayConfig;
  data: ValentineDayData;
  onAnswer: (noDodges: number) => void;
  onYes: () => void;
  onDone: () => void;
}

/** Where the six stickers land around the heart (px from the heart's centre) + their size. */
const WALL = [
  { x: -124, y: -58, s: 80, r: -8 },
  { x: 126, y: -64, s: 92, r: 7, slot: true },
  { x: -142, y: 50, s: 78, r: 6 },
  { x: 142, y: 46, s: 80, r: -6 },
  { x: -142, y: 160, s: 64, r: -5 },
  { x: 142, y: 160, s: 66, r: 8 },
];

export function Question({ story, day, data, onAnswer, onYes, onDone }: QuestionProps) {
  const { sfx, music } = usePremium();
  const { drop } = useSongDrop();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"ask" | "rolling" | "yes">("ask");
  const [dodges, setDodges] = useState(0);
  const [cta, setCta] = useState(false);
  const [boxGone, setBoxGone] = useState(false);
  const heart = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // the song steps back for the question; drop() brings it home
  useEffect(() => {
    if (music?.canFade) music.fadeTo(0.5, 1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const yes = (d: number) => {
    if (phase !== "ask") return;
    setPhase("rolling");
    onAnswer(d);
    haptic([20, 30, 20]);
    sfx("heartbeat", { gain: 0.6 });
    drop(() => {
      setPhase("yes");
      onYes();
      haptic([20, 30, 20, 30, 60]);
      sfx("lp-tada");
      sfx("firework", { at: 0.55, gain: 0.45 });
      sfx("firework", { at: 1.2, gain: 0.35, pan: 0.4 });
      sfx("sparkle", { at: 0.4 });
      const r = heart.current?.getBoundingClientRect();
      const o = r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight } : { x: 0.5, y: 0.4 };
      timers.current.push(
        window.setTimeout(() => burst({ kind: "confetti", origin: o, count: 120, colors: day.theme.confetti }), 650),
        window.setTimeout(() => burst({ kind: "hearts", origin: o, count: 24 }), 900),
        ...WALL.map((_, k) => window.setTimeout(() => sfx("pop", { gain: 0.5, detune: k * 90 }), 1300 + k * 240)),
        window.setTimeout(() => setBoxGone(true), 1900),
        window.setTimeout(() => setCta(true), 4600),
      );
    });
  };

  const said = phase === "yes";
  const stone = STONES[story.stone];
  const maxDodges = Math.min(6, story.noLines.length + 1);

  return (
    <div className={`lp-scene lp-q is-${phase}`}>
      <header className="lp-head">
        <p className="lp-kicker">{said ? "officially" : `${story.pet || story.to},`}</p>
        {said ? (
          <motion.h2 className="lp-title lp-yesTitle" initial={{ scale: 0.4, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 180, damping: 12 }}>
            <Spark className="l" />
            <span>{story.to} said YES!</span>
            <Spark className="r" />
          </motion.h2>
        ) : (
          <h2 className="lp-title lp-qTitle">{story.question}</h2>
        )}
      </header>

      <div className="lp-q-stage">
        <div className={`lp-heartWrap${said ? " is-yes" : ""}`} ref={heart}>
          <div className="lp-heartPh">{story.hero ? <CroppedPhoto photo={story.hero} alt={`${story.to} and ${story.from}`} eager /> : <span className="lp-heartEmpty" />}</div>
          <svg className="lp-heartLine" viewBox="0 0 100 92" aria-hidden>
            <path d="M50 88 C20 66 4 50 4 30 C4 15 15 4 29 4 C38 4 45 9 50 16 C55 9 62 4 71 4 C85 4 96 15 96 30 C96 50 80 66 50 88 Z" fill="none" stroke="#fff" strokeWidth="3.2" strokeDasharray={said ? "0" : "4 5"} />
          </svg>
          {!said && <span className="lp-heartQ" aria-hidden>?</span>}
          {said && (
            <motion.span
              className="lp-ringLand"
              initial={reduce ? { opacity: 0 } : { y: 250, scale: 0.4, rotate: -40, opacity: 0 }}
              animate={reduce ? { opacity: 1, rotate: -12 } : { y: [250, -40, 0], scale: [0.4, 1.5, 1], rotate: [-40, 200, 348], opacity: [0, 1, 1] }}
              transition={reduce ? { duration: 0.3 } : { duration: 1.1, times: [0, 0.6, 1], ease: ["easeOut", "backOut"], delay: 0.45 }}
            >
              <RingArt stone={stone} size={78} />
            </motion.span>
          )}
          {said &&
            WALL.map((w, k) => (
              <motion.span
                key={k}
                className="lp-wall"
                style={{ left: `calc(50% + ${w.x}px - ${w.s / 2}px)`, top: `calc(50% + ${w.y}px - ${w.s / 2}px)` }}
                initial={{ scale: 0, rotate: w.r - 20, opacity: 0 }}
                animate={{ scale: 1, rotate: w.r, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15, mass: 0.8, delay: 1.3 + k * 0.24 }}
              >
                {w.slot ? <SlotGif day={day} data={data} id="pp-yes" size={w.s} eager /> : <Gif src={DECOR.wall[k > 1 ? k - 1 : k]} size={w.s} eager />}
              </motion.span>
            ))}
        </div>

        {!boxGone && (
          <div className={`lp-boxRow${said ? " is-open" : ""}`}>
            <SlotGif day={day} data={data} id="pp-ask" size={96} eager />
            <div className={`lp-ringBox${phase === "rolling" ? " is-rolling" : ""}${said ? " is-open" : ""}`} aria-hidden>
              <span className="lp-ringBox-glow" />
              <span className="lp-ringBox-lid" />
              <span className="lp-ringBox-base">
                <span className="lp-ringBox-slot" />
              </span>
            </div>
            <span className="lp-please" style={{ opacity: dodges > 0 && !said ? 1 : 0 }}>
              {dodges > 0 && <SlotGif day={day} data={data} id="pp-please" size={84} eager />}
            </span>
          </div>
        )}
      </div>

      {said ? (
        <div className="lp-yesText" aria-live="polite">
          {story.afterYes && boxGone && (
            <motion.div className="lp-bubble lp-bubble-cherry" initial={{ opacity: 0, y: 12, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.3 }}>
              <Typed text={story.afterYes} speed={34} delay={350} />
            </motion.div>
          )}
          {cta && (
            <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 16 }}>
              <Btn kind="cherry" onClick={onDone}>
                Make it official 📜
              </Btn>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="lp-arena" style={{ opacity: phase === "rolling" ? 0 : 1, pointerEvents: phase === "ask" ? "auto" : "none" }}>
          <RunawayNo
            yesLabel="Yes 💍"
            noLabel="No"
            noLines={story.noLines}
            maxDodges={maxDodges}
            surrenderLabel="ok fine, YES 💍"
            mode="both"
            height={150}
            onDodge={(d) => {
              setDodges(d);
              sfx("lp-boop", { detune: d * 70 });
            }}
            onYes={yes}
            yesStyle={{
              background: "linear-gradient(180deg, #FF6F8E, #FF4D6D)",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              boxShadow: "0 5px 0 #C9184A, 0 12px 24px rgba(201,24,74,.28)",
              font: "800 20px/1 var(--lp-round), system-ui, sans-serif",
              padding: "14px 30px",
            }}
            noStyle={{
              background: "#fff",
              color: "#5B36C4",
              border: "2px solid #DCCBFF",
              borderRadius: 999,
              boxShadow: "0 4px 0 #DCCBFF",
              font: "700 16px/1 var(--lp-round), system-ui, sans-serif",
              padding: "12px 20px",
            }}
          />
        </div>
      )}
    </div>
  );
}
