"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";

const BG_SRC = "/assets/Birthday1/happybirthdaybg.mp3";
const TERRACOTTA = "#AD684A";

interface Props {
  paused: boolean;
}

export default function BirthdayBgMusic({ paused }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [started, setStarted] = useState(false);
  const startedRef = useRef(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const a = new Audio(BG_SRC);
    a.loop = true;
    a.volume = 0.35;
    a.preload = "auto";
    audioRef.current = a;

    const markStarted = () => {
      if (!startedRef.current) {
        startedRef.current = true;
        setStarted(true);
      }
    };

    const startOnInteraction = () => {
      const au = audioRef.current;
      if (au && !startedRef.current) {
        au.play().then(markStarted).catch(() => {});
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("click", startOnInteraction, true);
      window.removeEventListener("touchstart", startOnInteraction, true);
      window.removeEventListener("scroll", startOnInteraction, true);
    };

    a.play()
      .then(markStarted)
      .catch(() => {
        window.addEventListener("click", startOnInteraction, true);
        window.addEventListener("touchstart", startOnInteraction, true);
        window.addEventListener("scroll", startOnInteraction, true);
      });

    return () => { cleanup(); a.pause(); a.src = ""; };
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !started) return;
    if (paused || muted) {
      a.pause();
    } else {
      a.play().catch(() => {});
    }
  }, [paused, muted, started]);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const isPlaying = started && !paused && !muted;

  return (
    <>
      <style>{`@keyframes bgf-eq-bounce{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}`}</style>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMute}
        className="lg:hidden"
        style={{
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 78px)",
          right: 12,
          zIndex: 99,
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          background: isPlaying ? "rgba(173,104,74,0.12)" : "rgba(93,63,49,0.08)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          transition: "background 0.3s",
        }}
      >
        {isPlaying ? (
          [0.5, 0.85, 0.65, 1].map((h, i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: h * 14,
                borderRadius: 2,
                background: TERRACOTTA,
                transformOrigin: "bottom",
                animation: `bgf-eq-bounce ${0.5 + i * 0.1}s ease-in-out infinite ${i * 0.08}s`,
                opacity: 0.7,
              }}
            />
          ))
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TERRACOTTA} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </motion.button>
    </>
  );
}
