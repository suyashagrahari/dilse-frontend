"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { AARTI_AUDIO } from "../assets";
import { GC } from "./theme";

// ─── Karpura Gauram, under the page ──────────────────────────────────────────
//
// It starts on its own when the page opens, and the only control is a mute
// button in the bottom-right corner. There is no Play button.
//
// ── WHY THIS IS HARDER THAN IT SOUNDS, AND WHAT ACTUALLY HAPPENS ────────────
//
// No browser will let a page start audible audio without a user gesture, and
// the refusal is silent: `play()` returns a promise that rejects and nothing
// else happens. A template that "has music" and is quiet in the wild is almost
// always exactly this, so it cannot just be called on mount and hoped for.
//
// What this does is try, and then arrange to be ready the instant it is allowed:
//
//   1. On mount it calls `play()`. On a browser where the reader has already
//      interacted with the origin — a return visit, or a click on the link
//      inside the same tab — this succeeds and the aarti is playing before
//      anything is scrolled.
//
//   2. If it is refused, one-shot listeners wait for the first `pointerdown`,
//      `keydown`, `touchstart` or `scroll` anywhere on the page and try again.
//      On a page that is nothing but a long scroll, that is the reader's very
//      next action — in practice a fraction of a second.
//
// So it is not literally autoplay, because that is not available to anyone; it
// is "playing by the time you have done anything at all", which is the closest
// thing that exists and is indistinguishable in use.
//
// ── AND WHY IT IS NOT MUTED-AUTOPLAY-THEN-UNMUTE ────────────────────────────
//
// The other common trick is to autoplay muted (which IS allowed) and unmute
// later. It is worse here: the unmute still needs a gesture, so it buys nothing,
// and in the meantime the browser reports the tab as playing audio — the reader
// gets a speaker icon on a tab that is silent, and on iOS it can take over the
// hardware volume control while producing no sound.
//
// ── THE VOLUME ─────────────────────────────────────────────────────────────
//
// 0.14, faded. This is a recording of a chant — there is a voice in it, and a
// voice at any real volume competes with the words on the screen. At 0.14 it is
// the sound of the next room. The fade matters as much as the level: audio that
// snaps to full volume reads as a mistake even when the level is right.

const TARGET_VOLUME = 0.14;
const FADE_STEP = 0.005;
const FADE_INTERVAL = 40;

interface Props {
  /**
   * Whether the page wants sound at all.
   *
   * Always true in this template — it is a prop rather than a constant so that a
   * future caller (a preview thumbnail, an embed) can hold it off without this
   * component having to know why.
   */
  shouldPlay: boolean;
  /** Nudged up on screens with their own bottom-right control. */
  offsetBottom?: number;
}

const BackgroundMusic = memo(function BackgroundMusic({ shouldPlay, offsetBottom = 22 }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** The reader pressed mute. Their choice wins over everything below. */
  const [muted, setMuted] = useState(false);
  /** Sound is actually coming out. Drives the icon, so it must not lie. */
  const [audible, setAudible] = useState(false);

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
    fadeRef.current = setInterval(() => {
      const a = audioRef.current;
      if (!a) {
        clearFade();
        return;
      }
      if (a.volume < TARGET_VOLUME - FADE_STEP) {
        a.volume = Math.min(a.volume + FADE_STEP, TARGET_VOLUME);
      } else {
        a.volume = TARGET_VOLUME;
        clearFade();
      }
    }, FADE_INTERVAL);
  }, [clearFade]);

  const fadeOut = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    clearFade();
    fadeRef.current = setInterval(() => {
      const a = audioRef.current;
      if (!a) {
        clearFade();
        return;
      }
      if (a.volume > FADE_STEP) {
        a.volume = Math.max(a.volume - FADE_STEP, 0);
      } else {
        a.volume = 0;
        a.pause();
        clearFade();
      }
    }, FADE_INTERVAL);
  }, [clearFade]);

  // ── Create the element, then try to start, then wait to be allowed ────────
  useEffect(() => {
    if (!shouldPlay) return;

    const audio = new Audio(AARTI_AUDIO);
    audio.loop = true;
    // `auto` and not `none`: the file is 2.3 MB, and the gap between the reader
    // arriving and the sound arriving is the whole difference between "the page
    // has music" and "something started late, was that me?".
    audio.preload = "auto";
    audio.volume = 0;
    audioRef.current = audio;

    // One flag for both paths, so a gesture that lands while attempt 1 is still
    // in flight cannot start the track twice.
    let started = false;
    let disposed = false;

    const attempt = () => {
      if (started || disposed) return;
      const a = audioRef.current;
      if (!a) return;
      void a
        .play()
        .then(() => {
          if (disposed) return;
          started = true;
          setAudible(true);
          fadeIn();
          detach();
        })
        .catch(() => {
          // Refused for want of a gesture. The listeners below are the retry.
        });
    };

    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
    ];
    const onGesture = () => attempt();
    const detach = () => {
      for (const e of events) window.removeEventListener(e, onGesture);
    };
    for (const e of events) {
      // `passive` so the scroll listener cannot delay a scroll, and `once` is
      // deliberately NOT set — a scroll can fire before the audio element has
      // finished enough of its fetch to play, and one refused attempt must not
      // consume the only chance.
      window.addEventListener(e, onGesture, { passive: true });
    }

    attempt();

    return () => {
      disposed = true;
      detach();
      clearFade();
      audio.pause();
      // Clearing `src` as well as pausing — a paused <audio> with a src can keep
      // buffering, and this unmounts whenever the editor re-keys the preview.
      audio.src = "";
      audioRef.current = null;
    };
  }, [shouldPlay, fadeIn, clearFade]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (muted) {
      setMuted(false);
      // The tap that unmutes IS a gesture, so this is also the reliable way in
      // for anyone whose browser refused every earlier attempt.
      void a.play().then(() => setAudible(true)).catch(() => {});
      fadeIn();
    } else {
      setMuted(true);
      setAudible(false);
      fadeOut();
    }
  }, [muted, fadeIn, fadeOut]);

  if (!shouldPlay) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      // A real label, because this is the one control on the page whose icon
      // genuinely does not say what it does — a speaker could equally mean
      // "there is sound" or "press to make sound".
      aria-label={audible ? "Mute the aarti" : "Play the aarti"}
      aria-pressed={muted}
      className="gc-music"
      style={{ bottom: offsetBottom }}
    >
      {audible ? (
        <motion.span
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          style={{ display: "grid" }}
        >
          <Volume2 size={17} style={{ color: GC.saffron }} />
        </motion.span>
      ) : (
        <VolumeX size={17} style={{ color: GC.muted }} />
      )}
    </motion.button>
  );
});

export default BackgroundMusic;
