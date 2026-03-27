"use client";

import { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Heart } from "lucide-react";
import type { ContentData } from "./types";

const WARM = "rgb(108, 74, 46)";
const WARM_BORDER = "rgba(158, 126, 97, 0.22)";
const CREAM_CARD = "rgba(250, 248, 242, 0.90)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

const DISC_GRADIENTS = [
  "linear-gradient(135deg, #b4665e, #c97878)",
  "linear-gradient(135deg, #9e7e6e, #b8948a)",
  "linear-gradient(135deg, #c4a060, #d4b870)",
  "linear-gradient(135deg, #7e9ea8, #9ebec8)",
  "linear-gradient(135deg, #7e9e8e, #9ebaa0)",
  "linear-gradient(135deg, #a85858, #c47878)",
];

interface Props {
  data: ContentData;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

const TrackRow = memo(function TrackRow({
  track, index, active, isPlaying, gradient, isLiked, onSelect, onToggleLike,
}: {
  track: { title: string; artist: string; duration: string };
  index: number; active: boolean; isPlaying: boolean; gradient: string;
  isLiked: boolean; onSelect: (i: number) => void; onToggleLike: (i: number, e: React.MouseEvent) => void;
}) {
  const handleSelect = useCallback(() => onSelect(index), [onSelect, index]);
  const handleLike = useCallback((e: React.MouseEvent) => onToggleLike(index, e), [onToggleLike, index]);

  return (
    <button
      onClick={handleSelect}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "10px 12px", borderRadius: 12, textAlign: "left",
        transition: "all 0.15s",
        background: active ? "rgba(158,126,97,0.10)" : "transparent",
        border: active ? `1px solid rgba(158,126,97,0.20)` : "1px solid transparent",
        cursor: "pointer",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(80,50,20,0.15)",
        background: active ? gradient : "rgba(158,126,97,0.12)",
      }}>
        {isPlaying ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 14 }}>
            <span className="love-eq-bar" style={{ width: "2.5px", background: "rgba(250,248,242,0.9)", borderRadius: 4, animationDelay: "0s" }} />
            <span className="love-eq-bar" style={{ width: "2.5px", background: "rgba(250,248,242,0.9)", borderRadius: 4, animationDelay: "0.15s" }} />
            <span className="love-eq-bar" style={{ width: "2.5px", background: "rgba(250,248,242,0.9)", borderRadius: 4, animationDelay: "0.3s" }} />
          </div>
        ) : (
          <span style={{ fontSize: active ? 14 : 12 }}>{active ? "🎵" : "🎶"}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: CURSIVE,
          fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          fontWeight: active ? 700 : 500,
          color: active ? WARM : "rgb(90, 60, 35)",
          margin: 0,
        }}>{track.title}</p>
        <p style={{
          fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          color: "rgba(108,74,46,0.55)", margin: 0,
        }}>{track.artist}</p>
      </div>
      <span style={{ fontSize: 10, color: "rgba(108,74,46,0.40)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{track.duration}</span>
      <div onClick={handleLike} role="button" tabIndex={-1} style={{ padding: 4, flexShrink: 0, cursor: "pointer" }}>
        <Heart size={12} style={{ fill: isLiked ? WARM : "none", color: isLiked ? WARM : "rgba(108,74,46,0.25)" }} />
      </div>

      <style jsx>{`
        .love-eq-bar { animation: love-eq 0.6s ease-in-out infinite alternate; }
        @keyframes love-eq { 0% { height: 3px; } 100% { height: 12px; } }
      `}</style>
    </button>
  );
});

export default memo(function MusicSection({ data, onPlayStateChange }: Props) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set([0, 2]));
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);

  const tracks = data.musicTracks;
  const song = tracks[current];

  const updateProgress = useCallback(() => {
    const a = audioRef.current;
    if (a && a.duration) {
      setProgress(a.currentTime);
      setDuration(a.duration);
    }
    rafRef.current = requestAnimationFrame(updateProgress);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (a) { a.pause(); a.src = ""; }

    const src = song?.src;
    if (!src) return;

    const audio = new Audio(src);
    audio.preload = "auto";
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => { setCurrent((c) => (c + 1) % tracks.length); });

    if (playing) {
      audio.play().catch(() => {});
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateProgress);
    }

    return () => { cancelAnimationFrame(rafRef.current); audio.pause(); audio.src = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, tracks.length]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.play().catch(() => {});
      rafRef.current = requestAnimationFrame(updateProgress);
      onPlayStateChange?.(true);
    } else {
      a.pause();
      cancelAnimationFrame(rafRef.current);
      onPlayStateChange?.(false);
    }
  }, [playing, updateProgress, onPlayStateChange]);

  const next = useCallback(() => { setCurrent((c) => (c + 1) % tracks.length); setPlaying(true); }, [tracks.length]);
  const prev = useCallback(() => { setCurrent((c) => (c - 1 + tracks.length) % tracks.length); setPlaying(true); }, [tracks.length]);
  const togglePlay = useCallback(() => setPlaying((p) => !p), []);
  const selectTrack = useCallback((i: number) => {
    if (i === current) { setPlaying((p) => !p); } else { setCurrent(i); setPlaying(true); }
  }, [current]);
  const toggleLike = useCallback((i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = pct * duration;
    setProgress(a.currentTime);
  }, [duration]);

  const gradient = DISC_GRADIENTS[current % DISC_GRADIENTS.length];

  const fmtTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  }, []);

  const trackList = useMemo(() =>
    tracks.map((t, i) => (
      <TrackRow
        key={`${t.title}-${i}`}
        track={t} index={i}
        active={current === i}
        isPlaying={current === i && playing}
        gradient={DISC_GRADIENTS[i % DISC_GRADIENTS.length]}
        isLiked={liked.has(i)}
        onSelect={selectTrack}
        onToggleLike={toggleLike}
      />
    )),
    [tracks, current, playing, liked, selectTrack, toggleLike],
  );

  if (!song) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ height: "100svh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 10 }}
    >
      {/* Title */}
      <div style={{ textAlign: "center", padding: "24px 16px 12px", flexShrink: 0 }}>
        <h2 style={{
          fontFamily: CURSIVE,
          fontSize: "clamp(22px, 5.5vw, 32px)",
          fontWeight: 700,
          color: WARM,
          margin: 0,
          textShadow: "0 2px 8px rgba(250,248,242,0.6)",
        }}>
          Our Playlist 🎶
        </h2>
        <p style={{ fontFamily: CURSIVE, fontSize: 13, color: "rgba(108,74,46,0.60)", marginTop: 2 }}>
          Songs that tell our story
        </p>
      </div>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column", minHeight: 0,
        padding: "0 16px 96px",
        gap: 12,
      }}
        className="lg:flex-row lg:gap-8 lg:max-w-5xl lg:mx-auto lg:w-full lg:pb-8 lg:px-8"
      >
        {/* Player card */}
        <div style={{
          flexShrink: 0,
          borderRadius: 20,
          border: `1px solid ${WARM_BORDER}`,
          background: CREAM_CARD,
          boxShadow: "0 8px 32px rgba(80,50,20,0.14)",
          padding: 16,
        }}
          className="lg:w-[320px] lg:p-6 lg:self-start"
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}
            className="lg:flex-col lg:items-stretch lg:gap-4"
          >
            {/* Disc */}
            <motion.div
              animate={playing ? { rotate: 360 } : {}}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{
                width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: gradient,
                boxShadow: "0 6px 20px rgba(80,50,20,0.22)",
                position: "relative", overflow: "hidden",
              }}
              className="lg:w-full lg:aspect-square"
            >
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, rgba(255,255,255,0.22), transparent 50%)", pointerEvents: "none" }} />
              <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(250,248,242,0.20)", display: "flex", alignItems: "center", justifyContent: "center" }}
                className="lg:w-20 lg:h-20"
              >
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(250,248,242,0.30)" }}
                  className="lg:w-8 lg:h-8"
                />
              </div>
            </motion.div>

            <div style={{ flex: 1, minWidth: 0 }} className="lg:text-center">
              <p style={{ fontFamily: CURSIVE, fontWeight: 700, fontSize: 14, color: WARM, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}
                className="lg:text-base"
              >{song.title}</p>
              <p style={{ fontFamily: CURSIVE, fontSize: 11, color: "rgba(108,74,46,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: "2px 0 0" }}>{song.artist}</p>
              <p style={{ fontFamily: CURSIVE, fontSize: 10, fontWeight: 600, marginTop: 2, color: WARM }}>
                {playing ? "♪ Now Playing" : "Paused"}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{ height: 4, background: "rgba(158,126,97,0.18)", borderRadius: 999, overflow: "hidden", cursor: "pointer" }}
              onClick={handleSeek}
            >
              <div style={{
                height: "100%", borderRadius: 999, transition: "width 0.2s",
                background: gradient,
                width: duration > 0 ? `${(progress / duration) * 100}%` : "0%",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
              <span style={{ fontFamily: CURSIVE, fontSize: 9, color: "rgba(108,74,46,0.45)" }}>{fmtTime(progress)}</span>
              <span style={{ fontFamily: CURSIVE, fontSize: 9, color: "rgba(108,74,46,0.45)" }}>{fmtTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}
            className="lg:gap-6"
          >
            <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(108,74,46,0.40)", transition: "all 0.15s" }}>
              <SkipBack size={18} />
            </button>
            <button onClick={togglePlay}
              style={{
                width: 44, height: 44, borderRadius: "50%", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: gradient, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(80,50,20,0.25)",
                transition: "transform 0.15s",
              }}
              className="lg:w-14 lg:h-14"
            >
              {playing
                ? <Pause size={17} fill="rgba(250,248,242,0.95)" color="rgba(250,248,242,0.95)" />
                : <Play size={17} fill="rgba(250,248,242,0.95)" color="rgba(250,248,242,0.95)" style={{ marginLeft: 2 }} />
              }
            </button>
            <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(108,74,46,0.40)", transition: "all 0.15s" }}>
              <SkipForward size={18} />
            </button>
          </div>
        </div>

        {/* Playlist */}
        <div style={{
          flex: 1, minHeight: 0, borderRadius: 20,
          border: `1px solid ${WARM_BORDER}`,
          background: CREAM_CARD,
          boxShadow: "0 4px 20px rgba(80,50,20,0.10)",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px 10px", flexShrink: 0,
            borderBottom: `1px solid rgba(158,126,97,0.12)`,
          }}>
            <p style={{ fontFamily: CURSIVE, fontSize: 10, fontWeight: 700, color: "rgba(108,74,46,0.55)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
              Playlist · {tracks.length} songs
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: CURSIVE, fontSize: 10, color: WARM }}>
              <Heart size={9} style={{ fill: WARM, color: WARM }} /> {liked.size} liked
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "6px" }} className="no-scrollbar">
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {trackList}
            </div>
          </div>
          {tracks.length > 4 && (
            <p style={{
              fontFamily: CURSIVE, fontSize: 9, textAlign: "center",
              padding: "6px 0", color: "rgba(108,74,46,0.35)",
              borderTop: `1px solid rgba(158,126,97,0.10)`, flexShrink: 0,
            }}>
              ↕ Scroll for more
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
});
