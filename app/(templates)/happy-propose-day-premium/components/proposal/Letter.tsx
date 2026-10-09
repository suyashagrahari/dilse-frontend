"use client";

// The letter "why you": a pink envelope with a heart wax seal and "For {name}" in handwriting. Tap the seal: it
// cracks, the flap folds back and the letter slides up onto lined paper and types itself (tap to finish).
// Then his voice: "Before I ask, listen 🎙", a little phone card with the voice note (or his caption typed out).

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Typewriter, burst, haptic } from "../../../_valentine/kit";
import { VoiceNotePlayer, usePremium } from "../../../_valentine/kit/premium";
import { Btn, DECOR, Gif, Head, LinkBtn } from "./parts";
import type { Story } from "./util";

export function Letter({ story, letter, onNext, nextLabel }: { story: Story; letter: string; onNext: () => void; nextLabel: string }) {
  const { sfx, music } = usePremium();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(false);
  const seal = useRef<HTMLButtonElement | null>(null);
  const text = letter.trim() || `${story.to},\n\nI had a whole letter planned. Then I saw your name and forgot all of it.\n\nSo here's the short version: it's you. It was always going to be you.`;

  // the song steps back while she reads
  useEffect(() => {
    if (music?.canFade) music.fadeTo(0.6, 1400);
    return () => {
      if (music?.canFade) music.fadeTo(1, 1200);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const crack = () => {
    if (open) return;
    setOpen(true);
    sfx("wax-crack");
    sfx("paper-rustle", { at: 0.35 });
    haptic([12, 30, 12]);
    const r = seal.current?.getBoundingClientRect();
    burst({ kind: "hearts", origin: r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight } : { x: 0.5, y: 0.5 }, count: 14 });
  };

  return (
    <div className={`lp-scene lp-letter${open ? " is-open" : ""}`}>
      <Head kicker="Why you" title={open ? "Read this first" : "You've got mail 💌"} sub={open ? undefined : "Tap the heart seal to open it"} />
      {!open ? (
        <motion.div className="lp-env" initial={{ y: 40, rotate: -4, opacity: 0 }} animate={{ y: 0, rotate: -2, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
          <span className="lp-env-back" aria-hidden />
          <span className="lp-env-flap" aria-hidden />
          <span className="lp-env-to">
            For <b>{story.pet || story.to}</b>
          </span>
          <button ref={seal} type="button" className="lp-seal" onClick={crack} aria-label="Open the letter">
            <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden>
              <circle cx="32" cy="32" r="29" fill="#FF4D6D" />
              <circle cx="32" cy="32" r="23" fill="none" stroke="#C9184A" strokeWidth="2" strokeDasharray="3 4" />
              <path d="M32 45 C22 37 17 32 17 26 C17 21.5 20.5 18.5 24.5 18.5 C27.7 18.5 30.4 20.4 32 23 C33.6 20.4 36.3 18.5 39.5 18.5 C43.5 18.5 47 21.5 47 26 C47 32 42 37 32 45 Z" fill="#FFE3EC" />
            </svg>
          </button>
          <Gif src={DECOR.letter} size={84} className="lp-env-gif" eager />
        </motion.div>
      ) : (
        <motion.div className="lp-paper" initial={{ y: 120, scaleY: 0.4, opacity: 0 }} animate={{ y: 0, scaleY: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 22 }}>
          <Gif src={DECOR.letterBear} size={80} className="lp-paper-gif" />
          <div className="lp-paper-in">
            <Typewriter text={text} speed={16} onDone={() => setTyped(true)} className="lp-letter-text" caretColor="#7A52E0" />
            <p className="lp-sign">— {story.from}</p>
          </div>
        </motion.div>
      )}
      <div className="lp-actions">
        {open && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: typed ? 0 : 2.5 }}>
            <Btn onClick={onNext}>{nextLabel}</Btn>
          </motion.div>
        )}
        {!open && <LinkBtn onClick={crack}>open it for me</LinkBtn>}
      </div>
    </div>
  );
}

export function Voice({ story, onNext }: { story: Story; onNext: () => void }) {
  const [heard, setHeard] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 1800);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="lp-scene lp-voice">
      <Head kicker="Before I ask…" title="Listen 🎙" sub="Turn your sound up a little" />
      <motion.div className="lp-phone" initial={{ scale: 0.6, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: -1.5, opacity: 1 }} transition={{ type: "spring", stiffness: 380, damping: 16 }}>
        <span className="lp-phone-notch" aria-hidden />
        <p className="lp-phone-from">
          voice note from <b>{story.from}</b>
        </p>
        <Gif src={DECOR.voice} size={128} className="lp-phone-gif" eager />
        <VoiceNotePlayer
          accent="#7A52E0"
          track="#3B2A63"
          label={<span className="lp-hand">for {story.to}, from a very nervous {story.from}</span>}
          onPlay={() => setReady(true)}
          onEnded={() => setHeard(true)}
          className="lp-vn"
        />
      </motion.div>
      <div className="lp-actions">
        {(ready || heard) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Btn kind={heard ? "cherry" : "main"} onClick={onNext}>
              Okay, ask me 💍
            </Btn>
          </motion.div>
        )}
      </div>
    </div>
  );
}
