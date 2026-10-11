"use client";

// The letter: "the big promise", locked in his diary. A lilac diary with a peach strap and a little heart padlock.
// She taps the lock: a tiny golden key slides in, turns, the lock pops, the cover swings open and his letter writes
// itself on the lined page (tap to finish). Then his voice: a cute cassette whose reels turn while it plays.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Typewriter, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { VoiceNotePlayer, usePremium } from "../../../_valentine/kit/premium";
import { Btn, DECOR, Gif, Head, KeyArt, LinkBtn } from "./parts";
import { originOf, type Club } from "./util";

export function Diary({ club, letter, onNext, nextLabel }: { club: Club; letter: string; onNext: () => void; nextLabel: string }) {
  const { sfx, music } = usePremium();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"locked" | "key" | "open">("locked");
  const [typed, setTyped] = useState(false);
  const lock = useRef<HTMLButtonElement | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const text = letter.trim() || `${club.pet || club.to},\n\nI had a whole letter planned. Then I wrote your name and forgot all of it.\n\nSo here's the short version: I promise to keep choosing you. Every single day.`;

  // the song steps back while she reads
  useEffect(() => {
    if (music?.canFade) music.fadeTo(0.6, 1400);
    return () => {
      if (music?.canFade) music.fadeTo(1, 1200);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unlock = () => {
    if (phase !== "locked") return;
    setPhase("key");
    sfx("whoosh", { gain: 0.4 });
    haptic(10);
    timers.current.push(
      window.setTimeout(() => {
        sfx("key");
        sfx("pk-snap", { at: 0.25 });
        haptic([12, 30, 12]);
      }, reduce ? 100 : 700),
      window.setTimeout(() => {
        setPhase("open");
        sfx("page-turn");
        sfx("paper-rustle", { at: 0.3 });
        burst({ kind: "hearts", origin: originOf(lock.current), count: 16 });
      }, reduce ? 250 : 1350),
    );
  };

  return (
    <div className={`pk-scene pk-diaryScene is-${phase}`}>
      <Head kicker="The big promise" title={phase === "open" ? "Read this slowly" : "My secret diary 📔"} sub={phase === "open" ? undefined : "It's locked. Good thing you have the key."} />
      {phase !== "open" ? (
        <motion.div className="pk-diary" initial={{ y: 40, rotate: -5, opacity: 0 }} animate={{ y: 0, rotate: -2, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
          <span className="pk-diaryPages" aria-hidden />
          <span className="pk-diaryCover" aria-hidden>
            <span className="pk-diaryLabel">
              <b>{club.from}&rsquo;s</b>
              <br />
              promises
              <br />
              <small>for {club.pet || club.to} only</small>
            </span>
            <span className="pk-diaryHearts">♥ ♥ ♥</span>
          </span>
          <span className="pk-strap" aria-hidden />
          <button ref={lock} type="button" className={`pk-diaryLock${phase === "key" ? " is-turning" : ""}`} onClick={unlock} aria-label="Unlock the diary">
            <svg viewBox="0 0 40 46" width="46" height="52" aria-hidden>
              <path className="pk-dShackle" d="M11 22 V14 C11 8 15 4 20 4 C25 4 29 8 29 14 V22" fill="none" stroke="#E8C66A" strokeWidth="5" strokeLinecap="round" />
              <path d="M20 44 C8 36 3 30 3 23 C3 18 7 15 11.5 15 C15 15 18 17 20 20 C22 17 25 15 28.5 15 C33 15 37 18 37 23 C37 30 32 36 20 44 Z" fill="#FF8A6B" stroke="#C94A2C" strokeWidth="2" />
              <circle cx="20" cy="26" r="3" fill="#7A2E1C" />
            </svg>
          </button>
          {phase === "key" && (
            <motion.span className="pk-diaryKey" initial={reduce ? { opacity: 0 } : { x: 140, y: -60, rotate: -40, opacity: 0 }} animate={reduce ? { opacity: 1 } : { x: [140, 0, 0, 0], y: [-60, 0, 0, 0], rotate: [-40, 0, 0, 90], opacity: [0, 1, 1, 1] }} transition={{ duration: 0.9, times: [0, 0.6, 0.75, 1] }}>
              <span>
                <KeyArt size={52} />
              </span>
            </motion.span>
          )}
          <Gif src={DECOR.diary} size={78} className="pk-diaryGif" eager />
        </motion.div>
      ) : (
        <motion.div className="pk-page" initial={{ rotateY: -70, opacity: 0, x: -30 }} animate={{ rotateY: 0, opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 160, damping: 20 }}>
          <Gif src={DECOR.diaryBear} size={78} className="pk-pageGif" />
          <span className="pk-pageClip" aria-hidden />
          <div className="pk-pageIn">
            <Typewriter text={text} speed={16} onDone={() => setTyped(true)} className="pk-letterText" caretColor="#E0603F" />
            <p className="pk-sign">pinky promised, {club.from}</p>
          </div>
        </motion.div>
      )}
      <div className="pk-actions">
        {phase === "open" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: typed ? 0 : 2.5 }}>
            <Btn onClick={onNext}>{nextLabel}</Btn>
          </motion.div>
        )}
        {phase === "locked" && (
          <>
            <Btn onClick={unlock}>Use the key 🔑</Btn>
          </>
        )}
      </div>
    </div>
  );
}

export function Voice({ club, onNext }: { club: Club; onNext: () => void }) {
  const { sfx } = usePremium();
  const [playing, setPlaying] = useState(false);
  const [heard, setHeard] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 1800);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="pk-scene pk-voice">
      <Head kicker="A promise, out loud" title="Press play 📼" sub="Sound up a little" />
      <motion.div className={`pk-cassette${playing ? " is-playing" : ""}`} initial={{ scale: 0.6, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={{ type: "spring", stiffness: 380, damping: 16 }}>
        <span className="pk-casLabel">
          <b>side A</b> · a promise, out loud
        </span>
        <span className="pk-casWin" aria-hidden>
          <i className="pk-reel" />
          <span className="pk-casBand" />
          <i className="pk-reel" />
        </span>
        <span className="pk-casFrom">
          for {club.pet || club.to} · from {club.from}
        </span>
        <Gif src={DECOR.voice} size={92} className="pk-casGif" eager />
      </motion.div>
      <div className="pk-vnCard">
        <VoiceNotePlayer
          accent="#E0603F"
          track="#5E3226"
          label={<span className="pk-hand">{club.from}, a little shy</span>}
          onPlay={() => {
            setPlaying(true);
            setReady(true);
            sfx("pk-reel");
          }}
          onEnded={() => {
            setPlaying(false);
            setHeard(true);
          }}
          className="pk-vn"
        />
      </div>
      <div className="pk-actions">
        {(ready || heard) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Btn kind={heard ? "lilac" : "main"} onClick={onNext}>
              Our photos next 📸
            </Btn>
          </motion.div>
        )}
        {!ready && <LinkBtn onClick={onNext}>skip for now</LinkBtn>}
      </div>
    </div>
  );
}
