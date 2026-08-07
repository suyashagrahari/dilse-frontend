"use client";

import { memo, useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

const TARGET_VOLUME = 0.12;
const FADE_STEP = 0.004;
const FADE_INTERVAL = 40;

interface Props {
  shouldPlay: boolean;
  paused?: boolean;
}

const DarlingBackgroundMusic = memo(function DarlingBackgroundMusic({
  shouldPlay,
  paused,
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
    audio.play().catch(() => {});
    fadeRef.current = setInterval(() => {
      if (!audioRef.current) { clearFade(); return; }
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
      if (!audioRef.current) { clearFade(); return; }
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
    // Was "/assets/christan-wedding/BeThouMyVision.mp3", which is wrong twice
    // over. The path 404s — that file lives at /christan-wedding/… with no
    // /assets prefix — so this template has never actually played anything.
    // And the track itself is a Christian wedding hymn, copy-pasted from that
    // template along with the component; merely correcting the path would have
    // started playing a hymn over a late-night love page, which is worse than
    // the silence it replaced.
    //
    // `love-bg.mp3` is the ambient bed love-gf and anniversary-gf already use,
    // and it is deliberately NOT one of the six tracks in this template's own
    // playlist, so the two never double up.
    const audio = new Audio("/assets/LoveGf/music/love-bg.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audioRef.current = audio;
    setReady(true);

    return () => {
      clearFade();
      audio.pause();
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
    const audio = audioRef.current;
    if (!audio) return;
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
      className="fixed bottom-[82px] right-4 lg:bottom-6 lg:right-6 z-40 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
      style={{
        background: "rgba(8, 4, 18, 0.70)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,61,107,0.18)",
      }}
    >
      {muted ? (
        <VolumeX size={16} style={{ color: "rgba(255,61,107,0.50)" }} />
      ) : (
        <motion.div
          animate={paused ? {} : { scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Volume2
            size={16}
            style={{ color: paused ? "rgba(255,61,107,0.40)" : "rgba(255,61,107,0.80)" }}
          />
        </motion.div>
      )}
    </motion.button>
  );
});

export default DarlingBackgroundMusic;
