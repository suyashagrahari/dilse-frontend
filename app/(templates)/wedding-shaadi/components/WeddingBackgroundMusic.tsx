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

const WeddingBackgroundMusic = memo(function WeddingBackgroundMusic({
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
    const audio = new Audio("/assets/marriage/music/wedding-song.mp3");
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
      className="fixed bottom-28 right-4 lg:bottom-6 lg:right-6 z-40 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
      style={{
        background: muted ? "var(--wed-glass)" : "var(--wed-gradient-gold)",
        backdropFilter: "blur(16px)",
        border: "1px solid var(--wed-glass-border)",
        boxShadow: muted
          ? "0 4px 20px rgba(0,0,0,0.2)"
          : "0 4px 20px var(--wed-gold-glow)",
      }}
    >
      {muted ? (
        <VolumeX size={16} style={{ color: "hsl(var(--wed-muted-fg))" }} />
      ) : (
        <motion.div
          animate={paused ? {} : { scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Volume2
            size={16}
            style={{ color: paused ? "rgba(26,26,46,0.5)" : "#1a1a2e" }}
          />
        </motion.div>
      )}
    </motion.button>
  );
});

export default WeddingBackgroundMusic;
