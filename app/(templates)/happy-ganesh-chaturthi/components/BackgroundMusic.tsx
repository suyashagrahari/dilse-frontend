"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { AARTI_AUDIO } from "../assets";
import { GC } from "./theme";

// ─── Karpur Gauram, under the page ───────────────────────────────────────────
//
// ── WHY IT DOES NOT START ON MOUNT ──────────────────────────────────────────
//
// It would not be allowed to. Every browser blocks audio that starts without a
// user gesture, and the block is silent — `play()` returns a rejected promise
// and nothing happens. Templates that "have music" and are quiet in the wild
// are almost always this.
//
// But the gesture requirement is not why the gate exists. A devotional track
// that begins the instant a stranger opens a link, before they have touched
// anything, is a page people close — possibly in an open-plan office. So
// `shouldPlay` is raised by the cover's own tap, which is a real gesture and
// also a real decision, and the autoplay policy is satisfied as a side effect
// rather than fought.
//
// ── WHY THE VOLUME IS 0.14 AND FADED ────────────────────────────────────────
//
// This is a recording of a chant, not a backing track: it has a voice in it, and
// a voice at any real volume competes with the words on the screen. At 0.14 it
// is the sound of the next room. The fade matters as much as the level — audio
// that snaps to full volume reads as a mistake even when the level is right, and
// audio that snaps to silence reads as a crash.
//
// ── THE PAUSE ───────────────────────────────────────────────────────────────
//
// `paused` is raised while an offering takeover is on screen. Those have their
// own beat and the chant underneath them turns two deliberate things into
// noise. It fades rather than stops, so the position is kept and the chant
// resumes where it was.

const TARGET_VOLUME = 0.14;
const FADE_STEP = 0.005;
const FADE_INTERVAL = 40;

interface Props {
  shouldPlay: boolean;
  paused?: boolean;
  /** Nudged up on screens with their own bottom-right control. */
  offsetBottom?: number;
}

const BackgroundMusic = memo(function BackgroundMusic({
  shouldPlay,
  paused,
  offsetBottom = 82,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearFade = useCallback(() => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  }, []);

  const fadeIn = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    clearFade();
    audio.volume = 0;
    // Rejected when there has been no gesture yet. Swallowed rather than
    // reported: the next tap will succeed, and there is nothing a reader can do
    // about an autoplay policy.
    audio.play().catch(() => {});
    fadeRef.current = setInterval(() => {
      if (!audioRef.current) {
        clearFade();
        return;
      }
      if (audioRef.current.volume < TARGET_VOLUME - FADE_STEP) {
        audioRef.current.volume = Math.min(audioRef.current.volume + FADE_STEP, TARGET_VOLUME);
      } else {
        audioRef.current.volume = TARGET_VOLUME;
        clearFade();
      }
    }, FADE_INTERVAL);
  }, [clearFade]);

  const fadeOut = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    clearFade();
    fadeRef.current = setInterval(() => {
      if (!audioRef.current) {
        clearFade();
        return;
      }
      if (audioRef.current.volume > FADE_STEP) {
        audioRef.current.volume = Math.max(audioRef.current.volume - FADE_STEP, 0);
      } else {
        audioRef.current.volume = 0;
        audioRef.current.pause();
        clearFade();
      }
    }, FADE_INTERVAL);
  }, [clearFade]);

  useEffect(() => {
    const audio = new Audio(AARTI_AUDIO);
    audio.loop = true;
    // `auto` and not `none`: the file is 2.3 MB and the gap between the cover
    // tap and the sound arriving is the whole difference between "the page has
    // music" and "the music started late, was that me?".
    audio.preload = "auto";
    audio.volume = 0;
    audioRef.current = audio;
    setReady(true);

    return () => {
      clearFade();
      audio.pause();
      // Clearing `src` as well as pausing — a paused <audio> with a src can keep
      // buffering, and this component unmounts on every screen change in the
      // editor preview.
      audio.src = "";
      audioRef.current = null;
    };
  }, [clearFade]);

  useEffect(() => {
    if (!ready || !audioRef.current) return;
    if (shouldPlay && !muted && !paused) fadeIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPlay, ready]);

  useEffect(() => {
    if (!ready || !shouldPlay || muted) return;
    if (paused) fadeOut();
    else fadeIn();
  }, [paused, ready, shouldPlay, muted, fadeIn, fadeOut]);

  const toggle = useCallback(() => {
    if (muted) {
      if (!paused) fadeIn();
      setMuted(false);
    } else {
      fadeOut();
      setMuted(true);
    }
  }, [muted, paused, fadeIn, fadeOut]);

  if (!shouldPlay) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      // A real label, because this is the one control on the page whose icon
      // genuinely does not say what it does — a speaker could equally mean
      // "there is sound" or "press to make sound".
      aria-label={muted ? "Play the aarti" : "Mute the aarti"}
      className="fixed right-4 lg:right-6 z-40 w-9 h-9 rounded-full flex items-center justify-center"
      style={{
        bottom: offsetBottom,
        background: "rgba(255,253,247,0.86)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${GC.goldSoft}`,
        boxShadow: "0 6px 18px -8px rgba(59,36,18,0.4)",
      }}
    >
      {muted ? (
        <VolumeX size={16} style={{ color: GC.muted }} />
      ) : (
        <motion.div
          animate={paused ? {} : { scale: [1, 1.14, 1] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          <Volume2 size={16} style={{ color: paused ? GC.muted : GC.maroon }} />
        </motion.div>
      )}
    </motion.button>
  );
});

export default BackgroundMusic;
