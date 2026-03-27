"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

interface Props {
  src: string;
  onRemove?: () => void;
  accentColor?: string;
  bgColor?: string;
  borderColor?: string;
}

const BAR_HEIGHTS = [0.45, 0.75, 0.55, 1, 0.65, 0.85, 0.4, 0.7, 0.5, 0.9];

export default function MiniAudioPlayer({
  src,
  onRemove,
  accentColor = "rgb(201, 144, 106)",
  bgColor = "rgba(201, 144, 106, 0.08)",
  borderColor = "rgba(201, 144, 106, 0.22)",
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const a = new Audio();
    a.preload = "metadata";
    audioRef.current = a;
    setLoading(true);
    setCurrent(0);
    setDuration(0);
    setPlaying(false);

    const onMeta = () => { setDuration(a.duration || 0); setLoading(false); };
    const onEnded = () => { setPlaying(false); setCurrent(0); };
    const onError = () => setLoading(false);

    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);
    a.src = src;

    return () => {
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
      a.pause();
      a.src = "";
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [src]);

  const tick = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    setCurrent(a.currentTime);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    } else {
      a.play().catch(() => {});
      setPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [playing, tick]);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = pct * duration;
    setCurrent(a.currentTime);
  }, [duration]);

  const fmt = (s: number) => {
    const safe = isFinite(s) ? s : 0;
    return `${Math.floor(safe / 60)}:${String(Math.floor(safe % 60)).padStart(2, "0")}`;
  };

  const pct = duration > 0 ? Math.min(current / duration, 1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px", borderRadius: 14,
        background: bgColor, border: `1.5px solid ${borderColor}`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
        width: "100%", boxSizing: "border-box",
      }}
    >
      {/* Mic icon */}
      <span style={{ fontSize: 16, flexShrink: 0 }}>🎤</span>

      {/* Equalizer bars */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20, flexShrink: 0 }}>
        <style>{`
          @keyframes drl-bar { 0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)} }
        `}</style>
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: `${h * 18}px`,
              borderRadius: 3,
              background: accentColor,
              transformOrigin: "bottom",
              opacity: playing ? 0.85 : 0.3,
              animation: playing
                ? `drl-bar ${0.6 + i * 0.07}s ease-in-out infinite ${i * 0.06}s`
                : "none",
              transition: "opacity 0.3s",
            }}
          />
        ))}
      </div>

      {/* Progress bar + time */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Scrub bar */}
        <div
          ref={progressRef}
          onClick={seek}
          style={{
            height: 5, borderRadius: 999, cursor: "pointer",
            background: `rgba(${accentColor.match(/\d+/g)?.join(",") ?? "201,144,106"},0.18)`,
            position: "relative", overflow: "hidden",
          }}
        >
          <motion.div
            style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              borderRadius: 999, background: accentColor,
              width: `${pct * 100}%`,
            }}
          />
          {/* Thumb dot */}
          <div style={{
            position: "absolute", top: "50%", transform: "translate(-50%,-50%)",
            left: `${pct * 100}%`,
            width: 10, height: 10, borderRadius: "50%",
            background: accentColor,
            boxShadow: `0 0 0 2px rgba(12,6,20,0.8), 0 0 0 3px ${accentColor}`,
            opacity: duration > 0 ? 1 : 0,
          }} />
        </div>

        {/* Time */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: CURSIVE, fontSize: 9, color: "rgba(201,144,106,0.65)" }}>
            {loading ? "loading…" : fmt(current)}
          </span>
          <span style={{ fontFamily: CURSIVE, fontSize: 9, color: "rgba(201,144,106,0.45)" }}>
            {loading || !duration ? "--:--" : fmt(duration)}
          </span>
        </div>
      </div>

      {/* Play / Pause button */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={toggle}
        disabled={loading}
        style={{
          width: 34, height: 34, borderRadius: "50%", border: "none",
          background: playing
            ? "rgba(201,144,106,0.15)"
            : accentColor,
          color: playing ? accentColor : "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: loading ? "default" : "pointer", flexShrink: 0,
          boxShadow: playing ? "none" : "0 3px 10px rgba(201,144,106,0.35)",
          transition: "all 0.2s",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={playing ? "pause" : "play"}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ fontSize: 13, lineHeight: 1, display: "block" }}
          >
            {playing ? "⏸" : loading ? "…" : "▶"}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Remove button */}
      {onRemove && (
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onRemove}
          style={{
            width: 22, height: 22, borderRadius: "50%", border: "none",
            background: "rgba(180,60,50,0.10)", color: "rgba(180,60,50,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0, fontSize: 13, fontWeight: 700,
          }}
        >
          ×
        </motion.button>
      )}
    </motion.div>
  );
}
